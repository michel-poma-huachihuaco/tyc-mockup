import { DestroyRef, Injectable, computed, inject, signal, type Signal, type WritableSignal } from '@angular/core';
import { CLIENTES_360, sumarDiasHabiles, type TicketAtc } from '../datos-atc';
import { PAQUETE_MINIMO } from '../propuestas-detalle/derivar-ticket';
import { EstadoPrototipoAtcService } from '../estado-prototipo-atc';
import {
  MINUTOS_POR_ETAPA,
  PLAZO_LIBRO_DIAS,
  alDescartar,
  aplicarEfectos,
  clasificarEdicion,
  construirEscenarioA,
  construirEscenarioB,
  construirEscenarioC,
  propuestaAtencionManual,
  proximoPaso,
  sumarMinutos,
  textoAprobado,
  type EfectoTicket,
  type PasoGuion,
} from './tigo-guion';
import {
  HISTORICO_TIGO,
  aplicarPropuestaAGuia,
  calcularMetricas,
  derivarPropuestasAprendizaje,
  type MetricasTigo,
  type PropuestaAprendizaje,
} from './tigo-aprendizaje';
import type { DecisionTigo, EscenarioTigo, EtapaTigo, PropuestaTigo } from './tigo-modelo';

/** Lo que Tigo necesita de la consola: los tickets, cómo crear el entrante, el reloj simulado y el gestor. */
export interface PuenteTigo {
  tickets: WritableSignal<TicketAtc[]>;
  /** Construye el ticket entrante SIN agregarlo a `tickets`: lo agrega Tigo (no hay duplicado). */
  crearEntrante: (id: EscenarioTigo) => TicketAtc;
  /** Registra el asiento del Libro de Reclamaciones del ticket (la misma lógica que al crear un ticket de tipo libro). */
  registrarAsientoLibro: (ticket: TicketAtc) => void;
  ahora: () => Date;
  gestor: () => string;
}

export type GuionEstado = 'inactivo' | 'corriendo' | 'pausado' | 'esperando' | 'terminado';

/**
 * Tigo como capa que atiende un ticket de punta a punta (PROTOTIPO, todo simulado; propuesta fuera de la Etapa 1).
 * ADR-007 / RN-SVC-032: la IA sugiere, el gestor decide. Solo `aprobar` puede resolver el ticket.
 */
@Injectable({ providedIn: 'root' })
export class TigoEstadoService {
  private readonly proto = inject(EstadoPrototipoAtcService);
  private puente: PuenteTigo | null = null;

  private readonly _propuestas = signal<PropuestaTigo[]>([]);
  private readonly _decisiones = signal<DecisionTigo[]>([]);
  private readonly _estado = signal<GuionEstado>('inactivo');
  private readonly _ticket = signal<string | null>(null);
  private readonly _escenario = signal<EscenarioTigo | null>(null);
  private readonly _paso = signal<{ indice: number; total: number; etapa: EtapaTigo | null }>({
    indice: 0,
    total: 0,
    etapa: null,
  });
  /** Actividades completadas por Tigo por ticket. Sobrevive a `reiniciar()`: el ticket conserva su avance. */
  private readonly _completadas = signal<Record<string, number>>({});

  readonly propuestas: Signal<PropuestaTigo[]> = this._propuestas.asReadonly();
  readonly pendientes: Signal<PropuestaTigo[]> = computed(() => this._propuestas().filter((p) => p.estado === 'pendiente'));
  readonly decisiones: Signal<DecisionTigo[]> = this._decisiones.asReadonly();
  readonly guionEstado: Signal<GuionEstado> = this._estado.asReadonly();
  readonly guionTicket: Signal<string | null> = this._ticket.asReadonly();
  /** Escenario en curso (A, B o C); null sin escenario. */
  readonly escenario: Signal<EscenarioTigo | null> = this._escenario.asReadonly();
  readonly guionPaso = this._paso.asReadonly();
  readonly velocidad: WritableSignal<1 | 2> = signal<1 | 2>(1);

  /* ── Aprendizaje gobernado: las decisiones proponen mejoras de la guía; las publica el administrador funcional ── */
  private readonly _resueltas = signal<PropuestaAprendizaje[]>([]);
  /** Pendientes (derivadas del histórico simulado y de la sesión) y, después, las ya publicadas o rechazadas. */
  readonly propuestasAprendizaje: Signal<PropuestaAprendizaje[]> = computed(() => {
    const resueltas = this._resueltas();
    const ids = new Set(resueltas.map((r) => r.id));
    const nuevas = derivarPropuestasAprendizaje(this._decisiones(), HISTORICO_TIGO, this.proto.guiasPorTipo());
    return [...nuevas.filter((n) => !ids.has(n.id)), ...resueltas];
  });
  readonly metricas: Signal<MetricasTigo> = computed(() => calcularMetricas(this._decisiones(), HISTORICO_TIGO));
  /** Solo el administrador funcional publica una guía: el resto lo ve en solo lectura. */
  readonly puedePublicarAprendizaje: Signal<boolean> = computed(() => this.proto.rolActivo() === 'ADMIN_FUNCIONAL');
  private guiaVersionTicket: number | undefined;
  /** Pestaña de Workflow que la vista de Mantenimiento abre al montarse (la consume una sola vez). */
  readonly pestanaWorkflowPedida = signal<string | null>(null);

  private pasos: PasoGuion[] = [];
  private siguienteIdx: number | null = null;
  private ultimo = -1;
  private temporizador: ReturnType<typeof setTimeout> | null = null;
  private contador = 0;
  /** Minutos simulados acumulados desde la apertura del ticket (avanzan por etapa del guion). */
  private desfaseMin = 0;
  /** Efectos que se aplican solo si el gestor aprueba la propuesta (id de propuesta -> efectos). */
  private readonly alAprobar = new Map<string, EfectoTicket[]>();

  constructor() {
    inject(DestroyRef).onDestroy(() => this.cancelarTemporizador());
  }

  conectar(puente: PuenteTigo): void {
    this.puente = puente;
  }

  /** Alias del escenario A (Consulta de cuenta de punta a punta). */
  iniciarEscenarioA(): void {
    this.iniciarEscenario('A');
  }

  /** Crea el ticket entrante (lo agrega este servicio, no `crearEntrante`) y corre el escenario; reinicia limpio. */
  iniciarEscenario(id: EscenarioTigo): void {
    const p = this.puente;
    if (!p) return;
    this.reiniciar();
    this.guiaVersionTicket = this.proto.obtenerGuiaActiva(id === 'B' ? 'QUE' : 'CTA')?.versionActual ?? undefined;
    const nuevo = p.crearEntrante(id);
    p.tickets.update((prev) => [nuevo, ...prev]);
    this.pasos = this.construirPasos(id, nuevo, p);
    this._escenario.set(id);
    this._ticket.set(nuevo.num);
    this._paso.set({ indice: 0, total: this.pasos.length, etapa: null });
    this._estado.set('corriendo');
    this.siguienteIdx = 0;
    this.programar();
  }

  private construirPasos(id: EscenarioTigo, nuevo: TicketAtc, p: PuenteTigo): PasoGuion[] {
    if (id === 'B') {
      const guia = this.proto.obtenerGuiaActiva('QUE');
      return construirEscenarioB({
        ticket: nuevo,
        guia: guia && { version: guia.versionActual, pasos: guia.pasos, plantillas: guia.plantillas, criterios: guia.criterios },
        venceLibro: sumarDiasHabiles(p.ahora(), PLAZO_LIBRO_DIAS),
      });
    }
    if (id === 'C') return construirEscenarioC({ ticket: nuevo, paqueteMinimo: PAQUETE_MINIMO.map((x) => x.label) });
    const flujo = this.proto.obtenerFlujoActivo('CTA');
    const guia = this.proto.obtenerGuiaActiva('CTA');
    const subtipo = this.proto.subtiposActivosDe('CTA').find((s) => /estado de cuenta/i.test(s.nombre));
    return construirEscenarioA({
      ticket: nuevo,
      ahora: p.ahora,
      flujo: { version: flujo.versionActual, area: flujo.area, actividades: flujo.pasos.map((x) => x.nombre) },
      guia: guia && {
        version: guia.versionActual,
        pasos: guia.pasos,
        plantillas: guia.plantillas,
        criterios: guia.criterios,
      },
      subtipo: subtipo && { id: subtipo.id, nombre: subtipo.nombre },
      cliente360: CLIENTES_360.find((c) => c.dni === nuevo.dni || c.nombre.toLowerCase() === nuevo.cli.toLowerCase()),
    });
  }

  pausar(): void {
    if (this._estado() !== 'corriendo') return;
    this.cancelarTemporizador();
    this._estado.set('pausado');
  }

  reanudar(): void {
    if (this._estado() !== 'pausado') return;
    this._estado.set('corriendo');
    this.programar();
  }

  /** Avanza un paso a mano. No salta una propuesta que espera la decisión del gestor. */
  siguientePaso(): void {
    const e = this._estado();
    if ((e !== 'corriendo' && e !== 'pausado') || this.siguienteIdx === null) return;
    this.cancelarTemporizador();
    this.ejecutarPaso(this.siguienteIdx);
  }

  /** Cancela los temporizadores y limpia el guion y las propuestas. NO borra el ticket ya creado. */
  reiniciar(): void {
    this.cancelarTemporizador();
    this.pasos = [];
    this.siguienteIdx = null;
    this.ultimo = -1;
    this.desfaseMin = 0;
    this.alAprobar.clear();
    this._propuestas.set([]);
    this._ticket.set(null);
    this._escenario.set(null);
    this._paso.set({ indice: 0, total: 0, etapa: null });
    this._estado.set('inactivo');
  }

  aprobar(id: string, textoFinal?: string): void {
    const p = this._propuestas().find((x) => x.id === id);
    if (!p || p.estado !== 'pendiente' || !this.puente) return;
    const editada = textoFinal !== undefined && textoFinal.trim() !== (p.texto ?? '').trim();
    const final = textoFinal !== undefined ? textoFinal : p.texto;
    this.actualizarPropuesta(id, { estado: editada ? 'editada' : 'aprobada', textoFinal: final });
    // Solo categorías de la edición, calculadas en memoria: el texto no se guarda (ADR-007).
    const etiquetas = editada ? clasificarEdicion(p.texto ?? '', final ?? '') : [];
    this.registrar(p, editada ? 'EDITADA' : 'ACEPTADA', final?.length ?? 0, etiquetas);
    const efectos = this.alAprobar.get(id) ?? [];
    this.alAprobar.delete(id);
    this.aplicar(p.ticket, efectos, final);
    if (p.ticket === this._ticket()) this.decidir();
  }

  descartar(id: string): void {
    const p = this._propuestas().find((x) => x.id === id);
    if (!p || p.estado !== 'pendiente' || !this.puente) return;
    this.actualizarPropuesta(id, { estado: 'descartada' });
    this.alAprobar.delete(id);
    this.registrar(p, 'DESCARTADA', 0);
    if (p.ticket !== this._ticket()) return;
    // B y C tienen varias propuestas: el guion sigue esperando mientras queden pendientes.
    if (alDescartar(this._propuestas(), p.ticket) === 'esperar') return;
    this.cancelarTemporizador();
    this.siguienteIdx = null;
    this.agregarPropuestas(p.ticket, [propuestaAtencionManual(p.etapa)]);
    this._estado.set('terminado');
  }

  /**
   * Publica la propuesta como la versión siguiente de la guía (reutiliza `publicarVersionGuia` de Mantenimiento).
   * Solo el administrador funcional. Devuelve la versión creada, o null si no corresponde.
   */
  publicarAprendizaje(id: string): number | null {
    const a = this.propuestasAprendizaje().find((x) => x.id === id);
    const guia = a && this.proto.obtenerGuiaActiva(a.tipo);
    if (!a || !guia || a.estado !== 'pendiente' || !this.puedePublicarAprendizaje()) return null;
    const { plantillas, criterios } = aplicarPropuestaAGuia(guia, a);
    const version = this.proto.publicarVersionGuia(
      a.tipo,
      guia.pasos,
      plantillas,
      criterios,
      `${this.proto.perfilActivo().nombre} · propuesta de Tigo`,
    );
    this._resueltas.update((l) => [...l, { ...a, estado: 'publicada' }]);
    return version;
  }

  rechazarAprendizaje(id: string): void {
    const a = this.propuestasAprendizaje().find((x) => x.id === id);
    if (!a || a.estado !== 'pendiente' || !this.puedePublicarAprendizaje()) return;
    this._resueltas.update((l) => [...l, { ...a, estado: 'rechazada' }]);
  }

  /** Actividades que Tigo completó en ese ticket (para la línea de avance del flujo). */
  completadas(num: string): number {
    return this._completadas()[num] ?? 0;
  }

  tieneTigo(num: string): boolean {
    return this._propuestas().some((p) => p.ticket === num);
  }

  propuestasDe(num: string): PropuestaTigo[] {
    return this._propuestas().filter((p) => p.ticket === num);
  }

  /** Para el chat flotante: registra su decisión en el mismo log, sin texto (ADR-007: solo la longitud). */
  registrarDecisionExterna(d: {
    ticket: string;
    accion: string;
    decision: DecisionTigo['decision'];
    longitud: number;
    etapa?: EtapaTigo;
    propuestaId?: string;
    etiquetas?: string[];
    guiaVersion?: number;
  }): void {
    this._decisiones.update((l) => [
      ...l,
      {
        id: this.nuevoId('dec'),
        ticket: d.ticket,
        propuestaId: d.propuestaId ?? 'chat',
        etapa: d.etapa ?? 'atencion',
        accion: d.accion,
        decision: d.decision,
        longitud: d.longitud,
        fecha: this.ahoraPaso() ?? new Date(0),
        gestor: this.puente?.gestor() ?? '',
        tipo: this.puente?.tickets().find((t) => t.num === d.ticket)?.type ?? '',
        etiquetas: d.etiquetas ?? [],
        ...(d.guiaVersion !== undefined ? { guiaVersion: d.guiaVersion } : {}),
      },
    ]);
  }

  /* ── internos ── */

  private nuevoId(prefijo: string): string {
    return `tigo-${prefijo}-${++this.contador}`;
  }

  /** Hora simulada del paso vigente: reloj de la consola + desfase acumulado. */
  private ahoraPaso(): Date | null {
    return this.puente ? sumarMinutos(this.puente.ahora(), this.desfaseMin) : null;
  }

  private cancelarTemporizador(): void {
    if (this.temporizador !== null) clearTimeout(this.temporizador);
    this.temporizador = null;
  }

  private programar(): void {
    this.cancelarTemporizador();
    const i = this.siguienteIdx;
    if (i === null) return;
    this.temporizador = setTimeout(() => {
      this.temporizador = null;
      this.ejecutarPaso(i);
    }, this.pasos[i].retardoMs / this.velocidad());
  }

  private ejecutarPaso(i: number): void {
    const p = this.puente;
    const num = this._ticket();
    const paso = this.pasos[i];
    if (!p || !num || !paso) return;
    this.siguienteIdx = null;
    this.ultimo = i;
    this.desfaseMin += MINUTOS_POR_ETAPA[paso.etapa];
    this._paso.set({ indice: i + 1, total: this.pasos.length, etapa: paso.etapa });
    // El borrador que se aprobó en la atención es el texto de la respuesta que propone `resolver`.
    const aprobado = textoAprobado(this._propuestas().filter((x) => x.ticket === num));
    this.agregarPropuestas(
      num,
      paso.propuestas.map(({ efectosAlAprobar: _e, ...base }) =>
        base.accion === 'resolver' && base.texto === undefined ? { ...base, texto: aprobado } : base,
      ),
      paso.propuestas.map((x) => x.efectosAlAprobar),
    );
    this.aplicar(num, paso.efectos);
    this.decidir();
  }

  /** Después de un paso o de una decisión: espera al gestor, programa el siguiente o termina. */
  private decidir(): void {
    const num = this._ticket();
    if (!num) return;
    const s = proximoPaso(this.pasos, this.ultimo, this.propuestasDe(num));
    if (s.tipo === 'esperando') {
      this._estado.set('esperando');
    } else if (s.tipo === 'terminado') {
      this.siguienteIdx = null;
      this._estado.set('terminado');
    } else {
      this.siguienteIdx = s.indice;
      this._estado.set('corriendo');
      this.programar();
    }
  }

  private agregarPropuestas(
    num: string,
    bases: Omit<PropuestaTigo, 'id' | 'ticket' | 'creada'>[],
    efectos: (EfectoTicket[] | undefined)[] = [],
  ): void {
    const ahora = this.ahoraPaso() ?? new Date(0);
    const nuevas = bases.map((b): PropuestaTigo => ({ ...b, id: this.nuevoId('prop'), ticket: num, creada: ahora }));
    nuevas.forEach((n, i) => {
      const e = efectos[i];
      if (e) this.alAprobar.set(n.id, e);
    });
    this._propuestas.update((l) => [...l, ...nuevas]);
  }

  private actualizarPropuesta(id: string, parche: Partial<PropuestaTigo>): void {
    this._propuestas.update((l) => l.map((x) => (x.id === id ? { ...x, ...parche } : x)));
  }

  private aplicar(num: string, efectos: EfectoTicket[], textoFinal?: string): void {
    const p = this.puente;
    if (!p || !efectos.length) return;
    const ahora = sumarMinutos(p.ahora(), this.desfaseMin);
    p.tickets.update((l) => l.map((t) => (t.num === num ? aplicarEfectos(t, efectos, ahora, p.gestor(), textoFinal) : t)));
    if (efectos.some((e) => e.tipo === 'asiento-libro')) {
      const actualizado = p.tickets().find((t) => t.num === num);
      if (actualizado) p.registrarAsientoLibro(actualizado);
    }
    const n = efectos.filter((e) => e.tipo === 'completar-actividad').length;
    if (n) this._completadas.update((c) => ({ ...c, [num]: (c[num] ?? 0) + n }));
  }

  private registrar(p: PropuestaTigo, decision: DecisionTigo['decision'], longitud: number, etiquetas: string[] = []): void {
    this.registrarDecisionExterna({
      ticket: p.ticket,
      accion: p.accion,
      decision,
      longitud,
      etapa: p.etapa,
      propuestaId: p.id,
      etiquetas,
      guiaVersion: p.accion === 'redactar' || p.accion === 'redactar-acuse' ? this.guiaVersionTicket : undefined,
    });
  }
}
