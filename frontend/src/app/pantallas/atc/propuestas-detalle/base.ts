import { computed, signal, type Signal } from '@angular/core';
import type { AyStatItem, AyStepperPaso, AyTimelineEvento, ParCardPairs } from '@aybarcorp/ui-angular';
import {
  AHORA_BASE,
  ESTADO_ES,
  PRIORIDADES_TICKET,
  TIPOS_TICKET,
  evaluarSlaTicket,
  fmtFechaHora,
  tiempoRestanteTexto,
  type InteraccionTicket,
  type TicketAtc,
} from '../datos-atc';
import { EstadoPrototipoAtcService } from '../estado-prototipo-atc';
import { AREA_ES, MOTIVO_ES, etiqueta, traducirCodigos } from '../etiquetas-es';
import type { DerivacionEvento } from './derivar-ticket';
import { crearAsignacionesMock, type AsignacionMock } from './mock-interacciones';

/**
 * Datos y estado compartidos por las 3 propuestas del detalle de ticket. Leen del mismo servicio del
 * prototipo (flujo y guía activos por tipo) que la vista real; lo único que cambia es la presentación.
 */

export type Tono = 'danger' | 'warning' | 'info' | 'neutral' | 'success';
export type DecisionIa = 'ACEPTADA' | 'EDITADA' | 'DESCARTADA';

export const estadoEs = (s: string): string => ESTADO_ES[s] ?? s;
export const areaEs = (a: string): string => etiqueta(AREA_ES, a);
export const nombreTipo = (id: string): string => TIPOS_TICKET.find((t) => t.id === id)?.nombre ?? id;
export const nombrePrioridad = (id: string): string => PRIORIDADES_TICKET.find((p) => p.id === id)?.nombre ?? id;
export const fmt = (d?: Date | null): string => fmtFechaHora(d);
export const traducir = traducirCodigos;

const FORMATO_CORTO = new Intl.DateTimeFormat('es-PE', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});
/** «12 oct, 11:00»: fecha y hora cortas, para cifras que no admiten más ancho. */
export const fechaHoraCorta = (d: Date): string => FORMATO_CORTO.format(d).replace('.', '');
export const tiempoRestante = tiempoRestanteTexto;

export function tonoPrioridad(p: TicketAtc['prio']): Tono {
  return p === 'URGENT' ? 'danger' : p === 'HIGH' ? 'warning' : p === 'MEDIUM' ? 'info' : 'neutral';
}

export function tonoEstado(s: TicketAtc['state']): Tono {
  return s === 'ESCALATED' || s === 'IN_COMMITTEE' ? 'danger' : s === 'RESOLVED' ? 'success' : 'info';
}

/** Tono de `ay-progress-bar` para un tono de SLA (la barra no tiene `warning`). */
export function tonoBarra(t: 'success' | 'warning' | 'danger'): 'brand' | 'success' | 'danger' {
  return t === 'warning' ? 'brand' : t;
}

export function iniciales(nombre: string | null | undefined): string {
  if (!nombre) return '··';
  return nombre.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join('');
}

export function textoTipoInteraccion(tipo: InteraccionTicket['tipo']): string {
  return tipo === 'int'
    ? 'Nota interna (oculta al cliente)'
    : tipo === 'agt'
      ? 'Respuesta visible en Mi Portal'
      : tipo === 'cli'
        ? 'Mensaje del cliente'
        : 'Sistema';
}

const PARAMS = new URLSearchParams(globalThis.location?.search ?? '');
/** Cuántas actividades tiene el workflow en la demo (0 = el real del prototipo). Lo cambia la barra de la página de prueba. */
export const etapasDemo = signal(Number(PARAMS.get('etapas')) || 0);
/** Actividad en curso fijada en la demo, desde 0 (`null` = la que infiere la bitácora). */
export const pasoDemo = signal<number | null>(PARAMS.get('paso') !== null ? Number(PARAMS.get('paso')) : null);

/** Actividades de ejemplo para probar un flujo largo. No existen en el prototipo. */
const ACTIVIDADES_EJEMPLO = [
  { nombre: 'Revisión del contrato y adendas', responsable: 'Marco Quispe', horas: 6 },
  { nombre: 'Evaluación de exposición económica', responsable: 'Lucía Benavides', horas: 4 },
  { nombre: 'Informe técnico de inspección', responsable: 'Ing. J. Paredes', horas: 16 },
  { nombre: 'Propuesta de solución al cliente', responsable: 'Patricia Vílchez', horas: 8 },
  { nombre: 'Aprobación de la gerencia', responsable: 'Gerencia Legal', horas: 24 },
  { nombre: 'Redacción de la respuesta formal', responsable: 'Elena Aguirre', horas: 8 },
  { nombre: 'Envío al cliente con cargo', responsable: 'C. Rojas', horas: 2 },
  { nombre: 'Seguimiento y cierre con encuesta', responsable: 'C. Rojas', horas: 4 },
  { nombre: 'Registro de la lección aprendida', responsable: 'Lucía Benavides', horas: 2 },
  { nombre: 'Verificación de la satisfacción del cliente', responsable: 'Coordinación CX', horas: 8 },
  { nombre: 'Revisión de calidad del expediente', responsable: 'Supervisión ATC', horas: 6 },
  { nombre: 'Archivo de la evidencia probatoria', responsable: 'Marco Quispe', horas: 2 },
  { nombre: 'Conciliación final de plazos y SLA', responsable: 'Elena Aguirre', horas: 4 },
  { nombre: 'Cierre administrativo del caso', responsable: 'Administración', horas: 2 },
];

export class DetalleDemo {
  /** Interacciones registradas en esta sesión de prueba; no se guardan en ningún sitio. */
  private readonly extras = signal<InteraccionTicket[]>([]);
  readonly texto = signal('');
  readonly notaInterna = signal(false);
  readonly decisionIa = signal<DecisionIa | null>(null);

  constructor(
    readonly ticket: Signal<TicketAtc>,
    private readonly proto: EstadoPrototipoAtcService,
  ) {}

  readonly sla = computed(() => evaluarSlaTicket(this.ticket()));
  private readonly cerradoPorEstado = computed(() => this.ticket().state === 'RESOLVED' || this.ticket().state === 'CLOSED');
  /** Actividades que se completaron en esta sesión de prueba, además de las que infiere la bitácora. */
  private readonly actividadesCompletadas = signal(0);
  /** Cerrado por estado, o porque ya no queda ninguna actividad del workflow por completar. */
  readonly cerrado = computed(() => this.cerradoPorEstado() || this.pasoActual() >= this.flujo().pasos.length);
  /** Área en la que está ahora el ticket: la del ticket hasta que se deriva en esta sesión de prueba. */
  private readonly areaDerivada = signal<string | null>(null);
  readonly area = computed(() => this.areaDerivada() ?? this.ticket().area);
  /** Justificación con la que un supervisor retiró la señal de conflicto (HU-026 CA-03); `null` si sigue activa. */
  readonly senalRetirada = signal<string | null>(null);
  readonly handoffConfirmado = signal(false);
  /** Hay una señal de conflicto activa: la que trae el ticket, mientras nadie la retire. */
  readonly senalActiva = computed(() => this.ticket().conflict && this.senalRetirada() === null);
  /** Persona responsable ahora: la de la última asignación; si pasó a un área sin persona, la asigna el flujo del área. */
  readonly responsable = computed(() => {
    const ultima = this.asignaciones().at(-1);
    if (!ultima) return this.ticket().owner ?? 'Sin asignar (Cola)';
    return ultima.a.split(' · ')[1] ?? `Sin persona: la asigna el flujo de ${areaEs(this.area())}`;
  });
  /** Una señal activa en Eje 1 o 2 bloquea resolver y cerrar (HU-026). */
  readonly cierreBloqueado = computed(() => this.senalActiva() && this.area() !== 'LEGAL');

  /** Porcentaje del plazo SLA ya consumido (0–100), para el anillo y la barra. */
  readonly consumidoPct = computed(() => {
    const t = this.ticket();
    const due = this.sla().due;
    if (!due || this.cerrado()) return this.cerrado() ? 100 : 0;
    const total = due.getTime() - t.opened.getTime();
    const usado = AHORA_BASE.getTime() - t.opened.getTime();
    return Math.min(100, Math.max(0, Math.round((usado / total) * 100)));
  });

  readonly hilo = computed(() => [...this.ticket().interactions, ...this.extras()]);

  /**
   * Flujo activo del tipo. Para probar cómo se ve con muchas actividades, `?etapas=N` lo extiende con
   * actividades de ejemplo (son datos de prueba) y `?paso=K` fija la actividad en curso (desde 0).
   */
  readonly flujo = computed(() => {
    const f = this.proto.obtenerFlujoActivo(this.ticket().type);
    const n = etapasDemo();
    if (n <= f.pasos.length) return f;
    return { ...f, pasos: [...f.pasos, ...ACTIVIDADES_EJEMPLO.slice(0, n - f.pasos.length)] };
  });
  readonly guia = computed(() => this.proto.obtenerGuiaActiva(this.ticket().type));

  /** Paso del flujo en el que está el ticket. El prototipo no lo registra: se infiere de las derivaciones de la bitácora. */
  readonly pasoActual = computed(() => {
    const total = this.flujo().pasos.length;
    const extra = this.actividadesCompletadas();
    const fijo = pasoDemo();
    if (fijo !== null) return Math.min(Math.max(fijo, 0) + extra, total);
    if (this.cerradoPorEstado()) return total;
    return Math.min(Math.max(this.ticket().log.length - 1, 0) + extra, total);
  });

  /** Completa la actividad en curso. Al completar la última, el ticket queda resuelto sin acción manual. */
  completarActividad(): void {
    this.actividadesCompletadas.update((n) => n + 1);
  }
  /** Al reabrir el ticket el avance vuelve a lo que dice la bitácora. */
  reiniciarAvance(): void {
    this.actividadesCompletadas.set(0);
  }

  /** Pasos del flujo en el formato de `ay-stepper`. */
  readonly pasosStepper = computed<AyStepperPaso[]>(() =>
    this.flujo().pasos.map((p, i) => ({
      id: `paso-${i}`,
      etiqueta: p.nombre,
      descripcion: `${p.responsable} · ${p.horas} h · ${
        i < this.pasoActual() ? 'Completada' : i === this.pasoStepper() ? 'En curso: falta completarla' : 'Pendiente de iniciar'
      }`,
    })),
  );

  /** Índice para `ay-stepper`: un ticket cerrado deja todos los pasos completados salvo el último. */
  readonly pasoStepper = computed(() => Math.min(this.pasoActual(), Math.max(this.flujo().pasos.length - 1, 0)));

  readonly plantillaIa = computed(() => {
    const t = this.ticket();
    const plantilla = this.guia()?.plantillas[0] ?? 'Atendimos tu solicitud «{resumen}».';
    return plantilla.replace(/\{resumen\}/g, t.summary);
  });

  /** Bitácora de asignaciones (HU-007): solo derivaciones y reasignaciones, de quién a quién y por qué. */
  private readonly asignacionesNuevas = signal<AsignacionMock[]>([]);
  readonly asignaciones = computed(() => [...crearAsignacionesMock(this.ticket()), ...this.asignacionesNuevas()]);

  /** Derivación hecha desde el formulario: cambia el área y suma una fila a la bitácora (datos de prueba, no se guarda). */
  registrarDerivacion(e: DerivacionEvento): void {
    const previas = this.asignaciones();
    const ultima = previas[previas.length - 1];
    this.asignacionesNuevas.update((l) => [
      ...l,
      {
        id: `d${l.length + 1}`,
        fecha: new Date(),
        de: ultima?.a ?? areaEs(this.area()),
        a: `${areaEs(e.area)}${e.persona ? ` · ${e.persona}` : ' (sin persona)'}`,
        motivo: etiqueta(MOTIVO_ES, e.motivo),
        autor: 'Tú (prueba)',
        origen: 'derivacion',
      },
    ]);
    this.areaDerivada.set(e.area);
    this.handoffConfirmado.set(false);
  }

  /** Para `ay-timeline`, del más reciente al más antiguo. */
  readonly hitos = computed<AyTimelineEvento[]>(() =>
    [...this.asignaciones()]
      .sort((x, y) => y.fecha.getTime() - x.fecha.getTime())
      .map((a) => ({
        id: a.id,
        titulo: `Antes: ${a.de ?? 'sin asignación'} · Motivo: ${a.motivo} · Registrado por: ${a.autor}`,
        fecha: a.fecha,
        autor: `Pasó a ${a.a}`,
        tono: a.origen === 'derivacion' && a.a.startsWith('Legal') ? 'danger' : a.autor === 'Sistema' ? 'default' : 'accent',
      })),
  );

  /** La ficha del ticket, en pares clave/valor. */
  readonly ficha = computed<{ clave: string; valor: string }[]>(() => {
    const t = this.ticket();
    return [
      { clave: 'Razón social', valor: `${t.empresa.nombre} (RUC ${t.empresa.ruc})` },
      { clave: 'Cliente', valor: `${t.cli} (${t.dni})` },
      { clave: 'Proyecto', valor: t.proj },
      { clave: 'Canal de entrada', valor: t.ch },
      { clave: 'Tipo', valor: nombreTipo(t.type) },
      { clave: 'Área', valor: areaEs(this.area()) },
      { clave: 'Responsable', valor: this.responsable() },
      { clave: 'Política SLA', valor: t.slaSrc },
      { clave: 'Apertura', valor: fmt(t.opened) },
      { clave: '1.ª respuesta', valor: `vence ${fmt(t.frDue)}${t.firstResp ? ` · dada ${fmt(t.firstResp)}` : ''}` },
      { clave: 'Resolución', valor: `vence ${fmt(t.resDue)}` },
    ];
  });

  /** La ficha partida por tema: quién es el cliente, cómo se atiende y qué plazos corren. */
  readonly fichaGrupos = computed<{ id: string; titulo: string; pares: ParCardPairs[] }[]>(() => {
    const t = this.ticket();
    return [
      {
        id: 'cliente',
        titulo: 'Cliente y proyecto',
        pares: this.datosCliente(),
      },
      {
        id: 'atencion',
        titulo: 'Responsable del ticket',
        pares: [{ clave: 'Gestor asignado', valor: this.responsable() }],
      },
      {
        id: 'plazos',
        titulo: 'Plazos del SLA',
        pares: [
          { clave: 'Política SLA aplicada', valor: t.slaSrc },
          { clave: 'Apertura del ticket', valor: fmt(t.opened) },
          { clave: 'Vence 1.ª respuesta', valor: fmt(t.frDue) },
          ...(t.firstResp ? [{ clave: '1.ª respuesta dada', valor: fmt(t.firstResp) }] : []),
          { clave: 'Vence resolución', valor: fmt(t.resDue) },
        ],
      },
    ];
  });

  /** Quién es el cliente, con el rótulo de cada dato. */
  readonly datosCliente = computed<ParCardPairs[]>(() => {
    const t = this.ticket();
    return [
      { clave: 'Razón social', valor: `${t.empresa.nombre} (RUC ${t.empresa.ruc})` },
      { clave: 'Cliente', valor: `${t.cli} (DNI ${t.dni})` },
      { clave: 'Proyecto', valor: t.proj },
    ];
  });

  /** Política aplicada y, si ya ocurrió, la primera respuesta dada: lo que no cabe en las cifras. */
  readonly datosPlazoExtra = computed<ParCardPairs[]>(() => {
    const t = this.ticket();
    return [
      { clave: 'Política SLA aplicada', valor: t.slaSrc },
      ...(t.firstResp ? [{ clave: '1.ª respuesta dada', valor: fmt(t.firstResp) }] : []),
    ];
  });

  /** Clasificación del ticket: cada valor lleva el rótulo de qué dato es. */
  readonly clasificacion = computed<ParCardPairs[]>(() => {
    const t = this.ticket();
    return [
      { clave: 'Canal de entrada', valor: t.ch },
      { clave: 'Tipo de ticket', valor: nombreTipo(t.type) },
      { clave: 'Área', valor: areaEs(this.area()) },
    ];
  });

  /** Tres cifras de plazo con fecha y hora, para `ay-stat-group`. El rótulo dice qué fecha es. */
  readonly cifrasPlazo = computed<AyStatItem[]>(() => {
    const t = this.ticket();
    return [
      { id: 'apertura', etiqueta: 'Apertura del ticket', valor: fechaHoraCorta(t.opened) },
      { id: 'respuesta', etiqueta: 'Vence 1.ª respuesta', valor: fechaHoraCorta(t.frDue) },
      { id: 'resolucion', etiqueta: 'Vence resolución', valor: fechaHoraCorta(t.resDue) },
    ];
  });

  registrar(): void {
    const texto = this.texto().trim();
    if (!texto) return;
    this.extras.update((l) => [
      ...l,
      { tipo: this.notaInterna() ? 'int' : 'agt', fecha: new Date(), autor: 'Tú (prueba)', texto },
    ]);
    this.texto.set('');
  }

  usarPlantillaIa(): void {
    this.texto.set(this.plantillaIa());
  }
}
