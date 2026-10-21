import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AHORA_BASE, fmtFechaHora, type TicketAtc } from './datos-atc';
import { EstadoPrototipoAtcService } from './estado-prototipo-atc';
import {
  conversar,
  montarBot,
  redactar,
  resumir,
  revisar,
  SALUDO,
  siguientePaso,
  TONOS,
  type CtxBot,
  type EstadoBot,
  type Revision,
  type Tono,
} from './three/bot';
import { inyectarEstilos } from './three/estilos';

interface MensajeBot {
  id: number;
  de: 'yo' | 'bot';
  tipo?: 'tonos' | 'redactar' | 'resumen' | 'paso' | 'revision' | 'texto';
  texto?: string;
  tono?: Tono;
  destino?: string;
  cierre?: { guia: number | null; pendientes: string[] } | null;
  titulo?: string;
  lineas?: string[];
  accion?: string;
  motivo?: string;
  pasos?: string[];
  criterios?: string[];
  guia?: number | null;
  borrador?: string;
  hallazgos?: Revision['hallazgos'];
  corregido?: string;
  anonimizados?: number;
  edit?: string;
  decision?: 'ACEPTADA' | 'EDITADA' | 'DESCARTADA';
}

const NOMBRES_TIPO: Record<string, string> = {
  CTA: 'Consulta / Estado de cuenta',
  PED: 'Pedido',
  VIS: 'Visita técnica',
  QUE: 'Queja',
  REC: 'Reclamo',
  GAR: 'Reclamo de garantía',
  CIT: 'Reporte ciudadano',
  RES: 'Resolución / Contrato',
  ING: 'Ingreso a proyecto',
  RSV: 'Reserva de bus',
};

const NOMBRES_ESTADO: Record<string, string> = {
  OPEN: 'Abierto',
  IN_PROGRESS: 'En atención',
  PENDING_CUSTOMER: 'Pendiente del cliente',
  ESCALATED: 'Escalado',
  RESOLVED: 'Resuelto',
  CLOSED: 'Cerrado',
  REOPENED: 'Reabierto',
};

@Component({
  selector: 'app-bot-avatar-canvas',
  template: `<canvas #lienzo aria-hidden="true"></canvas>`,
})
export class BotAvatarCanvasComponent {
  readonly estado = input<EstadoBot>('reposo');
  private readonly lienzoRef = viewChild.required<ElementRef<HTMLCanvasElement>>('lienzo');
  private instancia: { setEstado: (e: EstadoBot) => void; dispose: () => void } | null = null;

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const c = this.lienzoRef().nativeElement;
      const rm =
        typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
      try {
        this.instancia = montarBot(c, { reducido: rm });
        this.instancia.setEstado(this.estado());
      } catch (err) {
        console.error('[bot-avatar 3d]', err);
      }
      destroyRef.onDestroy(() => {
        this.instancia?.dispose();
        this.instancia = null;
      });
    });

    effect(() => {
      const est = this.estado();
      this.instancia?.setEstado(est);
    });
  }
}

@Component({
  selector: 'app-asistente-bot-atc',
  imports: [FormsModule, BotAvatarCanvasComponent],
  template: `
    @if (mostrarBot()) {
      <div class="pt-bot">
        @if (abierto()) {
          <div class="pt-bot__panel" role="dialog" aria-label="Asistente de IA">
            <div class="pt-bot__cab">
              <div class="pt-bot__av">
                <app-bot-avatar-canvas [estado]="estado()" />
              </div>
              <div>
                <h2>Asistente</h2>
                <small>
                  @if (ctx(); as c) {
                    Ticket {{ c.numero }} · {{ c.tipo }}
                  } @else {
                    Sin ticket abierto
                  }
                </small>
              </div>
              <button
                type="button"
                class="pt-bot__x"
                aria-label="Cerrar el asistente"
                (click)="abierto.set(false)"
              >
                ✕
              </button>
            </div>

            <div #contenedorMsgs class="pt-bot__msgs" aria-live="polite">
              @for (m of msgs(); track m.id) {
                @if (m.de === 'yo') {
                  <div class="pt-bot__m pt-bot__m--yo">{{ m.texto }}</div>
                } @else {
                  <div class="pt-bot__m pt-bot__m--bot">
                    @if (m.tipo === 'tonos') {
                      {{ m.texto }}
                      <div class="pt-bot__acc">
                        @for (t of tonos; track t.id) {
                          <button type="button" class="pt-bot__btn" (click)="acRedactar(t.id)">
                            {{ t.n }}
                          </button>
                        }
                      </div>
                    } @else if (m.tipo === 'redactar') {
                      <h3>
                        {{ m.destino ? 'Antes de cerrar · ' : 'Borrador · ' }}{{ nombreTono(m.tono) }}
                      </h3>
                      @if (m.destino && m.cierre) {
                        @if (m.cierre.guia === null) {
                          <p class="pt-bot__nota">
                            Este tipo de ticket no tiene guía publicada: no tengo criterios de cierre que revisar.
                          </p>
                        } @else if (m.cierre.pendientes.length > 0) {
                          <div class="pt-bot__crit">
                            <b>Criterios de cierre pendientes (guía, versión {{ m.cierre.guia }}):</b>
                            <ul>
                              @for (p of m.cierre.pendientes; track p) {
                                <li>{{ p }}</li>
                              }
                            </ul>
                          </div>
                        } @else {
                          <div class="pt-bot__h" data-n="ok">
                            <i>✓</i>
                            <span>Se cumplen los criterios de cierre de la guía (versión {{ m.cierre.guia }}).</span>
                          </div>
                        }
                      }

                      <textarea
                        class="pt-bot__texto pt-bot__editar"
                        rows="7"
                        [readonly]="!!m.decision"
                        aria-label="Respuesta sugerida: puedes editarla antes de usarla"
                        [ngModel]="m.edit ?? m.texto ?? ''"
                        (ngModelChange)="actualizarEdicion(m.id, $event)"
                      ></textarea>

                      @if (m.decision) {
                        <p class="pt-bot__nota">
                          Decisión registrada: {{ etiquetaDecision(m.decision) }}.
                        </p>
                      } @else {
                        <div class="pt-bot__acc">
                          <button
                            type="button"
                            class="pt-bot__btn pt-bot__btn--p"
                            (click)="decidir(m, textoEditadoCambio(m) ? 'EDITADA' : 'ACEPTADA', m.edit ?? m.texto ?? '')"
                          >
                            {{ textoEditadoCambio(m) ? 'Usar mi versión editada' : 'Aceptar' }}
                          </button>
                          <button
                            type="button"
                            class="pt-bot__btn"
                            (click)="decidir(m, 'DESCARTADA', '')"
                          >
                            Descartar
                          </button>
                        </div>
                      }

                      @if (!m.destino && m.cierre && m.cierre.guia !== null) {
                        @if (m.cierre.pendientes.length > 0) {
                          <div class="pt-bot__crit">
                            <b>Criterios de cierre pendientes (guía, versión {{ m.cierre.guia }}):</b>
                            <ul>
                              @for (p of m.cierre.pendientes; track p) {
                                <li>{{ p }}</li>
                              }
                            </ul>
                          </div>
                        } @else {
                          <div class="pt-bot__h" data-n="ok">
                            <i>✓</i>
                            <span>Se cumplen los criterios de cierre de la guía (versión {{ m.cierre.guia }}).</span>
                          </div>
                        }
                      }

                      @if (!m.decision) {
                        <div class="pt-bot__acc">
                          @for (t of otrosTonos(m.tono); track t.id) {
                            <button
                              type="button"
                              class="pt-bot__btn"
                              (click)="acRedactar(t.id, m.destino)"
                            >
                              Hazlo {{ t.n.toLowerCase() }}
                            </button>
                          }
                        </div>
                      }
                    } @else if (m.tipo === 'resumen') {
                      <h3>{{ m.titulo }}</h3>
                      <ul>
                        @for (l of m.lineas ?? []; track l) {
                          <li>{{ l }}</li>
                        }
                      </ul>
                    } @else if (m.tipo === 'paso') {
                      <h3>{{ m.accion }}</h3>
                      <div>{{ m.motivo }}</div>
                      <ol>
                        @for (p of m.pasos ?? []; track p) {
                          <li>{{ p }}</li>
                        }
                      </ol>
                      @if ((m.criterios?.length ?? 0) > 0) {
                        <div class="pt-bot__crit">
                          <b>Criterios de cierre pendientes (guía, versión {{ m.guia }}):</b>
                          <ul>
                            @for (c of m.criterios ?? []; track c) {
                              <li>{{ c }}</li>
                            }
                          </ul>
                        </div>
                      }
                    } @else if (m.tipo === 'revision') {
                      <h3>Revisión del borrador</h3>
                      @for (h of m.hallazgos ?? []; track h.texto) {
                        <div class="pt-bot__h" [attr.data-n]="h.nivel">
                          <i>{{ h.nivel === 'ok' ? '✓' : '!' }}</i>
                          <span>{{ h.texto }}</span>
                        </div>
                      }
                      @if (m.corregido && m.corregido !== m.borrador) {
                        <b>Versión corregida:</b>
                        <textarea
                          class="pt-bot__texto pt-bot__editar"
                          rows="7"
                          [readonly]="!!m.decision"
                          aria-label="Respuesta sugerida: puedes editarla antes de usarla"
                          [ngModel]="m.edit ?? m.corregido"
                          (ngModelChange)="actualizarEdicion(m.id, $event)"
                        ></textarea>
                        @if (m.decision) {
                          <p class="pt-bot__nota">
                            Decisión registrada: {{ etiquetaDecision(m.decision) }}.
                          </p>
                        } @else {
                          <div class="pt-bot__acc">
                            <button
                              type="button"
                              class="pt-bot__btn pt-bot__btn--p"
                              (click)="decidir(m, (m.edit ?? m.corregido).trim() !== m.corregido.trim() ? 'EDITADA' : 'ACEPTADA', m.edit ?? m.corregido)"
                            >
                              {{ (m.edit ?? m.corregido).trim() !== m.corregido.trim() ? 'Usar mi versión editada' : 'Aceptar' }}
                            </button>
                            <button
                              type="button"
                              class="pt-bot__btn"
                              (click)="decidir(m, 'DESCARTADA', '')"
                            >
                              Descartar
                            </button>
                          </div>
                        }
                      }
                    } @else {
                      {{ m.texto }}
                    }
                  </div>
                }
              }

              @if (pensando()) {
                <div class="pt-bot__m pt-bot__m--bot">
                  <span class="pt-bot__puntos" aria-label="Escribiendo">
                    <i></i><i></i><i></i>
                  </span>
                </div>
              }
            </div>

            <div class="pt-bot__chips">
              @if (ctx()) {
                <button type="button" class="pt-bot__btn" (click)="acTonos()">Redactar respuesta</button>
                <button type="button" class="pt-bot__btn" (click)="acResumir()">Resumir ticket</button>
                <button type="button" class="pt-bot__btn" (click)="acPaso()">Siguiente paso</button>
                <button type="button" class="pt-bot__btn" (click)="acRevisar()">Revisar mi borrador</button>
              } @else {
                <button type="button" class="pt-bot__btn" (click)="acQuePuedesHacer()">
                  ¿Qué puedes hacer?
                </button>
              }
            </div>

            <form class="pt-bot__form" (submit)="enviarPregunta($event)">
              <input
                name="preguntaBot"
                [ngModel]="textoPregunta()"
                (ngModelChange)="textoPregunta.set($event)"
                placeholder="Pregúntame algo del ticket…"
                aria-label="Escribe tu pregunta"
              />
              <button type="submit" class="pt-bot__btn pt-bot__btn--p">Enviar</button>
            </form>
          </div>
        }

        @if (mostrarGlobo() && !abierto() && ctx(); as c) {
          <button type="button" class="pt-bot__globo" (click)="abrirPanel()">
            ¿Te ayudo con el ticket {{ c.numero }}?
          </button>
        }

        <button
          type="button"
          class="pt-bot__fab"
          [attr.aria-label]="abierto() ? 'Cerrar el asistente' : 'Abrir el asistente de IA'"
          [attr.aria-expanded]="abierto()"
          (click)="alternarPanel()"
        >
          <app-bot-avatar-canvas [estado]="abierto() ? estado() : 'reposo'" />
        </button>
      </div>
    }
  `,
})
export class AsistenteBotAtcComponent {
  readonly vistaActiva = input.required<string>();
  readonly ticketSeleccionadoNum = input.required<string>();
  readonly tickets = input.required<readonly TicketAtc[]>();

  private readonly estadoProto = inject(EstadoPrototipoAtcService);
  private readonly doc = inject(DOCUMENT);
  private readonly contenedorMsgs = viewChild<ElementRef<HTMLElement>>('contenedorMsgs');

  readonly tonos = TONOS;
  readonly abierto = signal(false);
  readonly msgs = signal<MensajeBot[]>([]);
  readonly pensando = signal(false);
  readonly estado = signal<EstadoBot>('reposo');
  readonly textoPregunta = signal('');
  readonly mostrarGlobo = signal(false);

  private seqId = 0;
  private ultimaAreaMensaje: HTMLTextAreaElement | null = null;

  readonly mostrarBot = computed(() => {
    const rol = this.estadoProto.rolActivo();
    return rol !== 'SIN_ATENCION' && rol !== 'CLIENTE';
  });

  readonly ctx = computed<CtxBot | null>(() => {
    const num = this.ticketSeleccionadoNum();
    if (!num) return null;
    const t = this.tickets().find((x) => x.num === num);
    if (!t) return null;
    const guia = this.estadoProto.obtenerGuiaActiva(t.type);
    const pendientes = guia && guia.versionActual ? [...guia.criterios] : [];
    const venceDate = t.state === 'OPEN' ? t.frDue : t.resDue;
    const restMs = venceDate.getTime() - AHORA_BASE.getTime();
    const horasAbs = Math.abs(restMs) / 3600000;
    const durTexto = horasAbs < 48 ? `${Math.round(horasAbs)} h` : `${Math.round(horasAbs / 24)} días`;
    const nivelSla: CtxBot['sla']['nivel'] =
      t.state === 'CLOSED'
        ? 'cumplido'
        : restMs < 0
          ? 'vencido'
          : restMs < 12 * 3600000
            ? 'riesgo'
            : 'ok';
    const msgsVisibles = t.interactions.filter((i) => i.tipo === 'cli' || i.tipo === 'agt');

    return {
      numero: t.num,
      resumen: t.summary,
      tipo: NOMBRES_TIPO[t.type] ?? t.type,
      tipoId: t.type,
      estado: NOMBRES_ESTADO[t.state] ?? t.state,
      estadoId: t.state,
      area: t.area,
      canal: t.ch,
      cliente: t.cli || null,
      responsable: t.owner,
      usuario: this.estadoProto.perfilActivo().nombre,
      eje: t.eje,
      reaperturas: t.reopen,
      rayo: t.rayo,
      primeraRespuesta: Boolean(t.firstResp),
      sla: {
        nivel: nivelSla,
        hito: t.state === 'OPEN' ? 'primera respuesta' : 'resolución',
        vence: fmtFechaHora(venceDate),
        restante: restMs < 0 ? `vencido hace ${durTexto}` : `faltan ${durTexto}`,
      },
      historial: t.status.slice(0, 5).map((s) => ({
        fecha: fmtFechaHora(s.fecha),
        texto: `${NOMBRES_ESTADO[s.estado] ?? s.estado} (${s.autor})`,
      })),
      mensajes: msgsVisibles.length,
      notas: t.interactions.length - msgsVisibles.length,
      ultimoMensaje: msgsVisibles.length > 0 ? msgsVisibles[msgsVisibles.length - 1]!.texto : null,
      cierre: {
        guia: guia?.versionActual ?? null,
        pendientes,
      },
    };
  });

  constructor() {
    inyectarEstilos();
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const onFocusIn = (ev: FocusEvent) => {
        const target = ev.target;
        if (
          target instanceof HTMLTextAreaElement &&
          !target.closest('.pt-bot')
        ) {
          this.ultimaAreaMensaje = target;
        }
      };
      const onKeyDown = (ev: KeyboardEvent) => {
        if (ev.key === 'Escape' && this.abierto()) {
          this.abierto.set(false);
        }
      };
      const onAsistente = (ev: Event) => {
        const d = (ev as CustomEvent<{ accion?: string; destino?: string }>).detail;
        if (d?.accion === 'cierre' && this.ctx()) {
          this.abrirPanel();
          this.acCierre(d.destino ?? 'RESOLVED');
        }
      };
      this.doc.addEventListener('focusin', onFocusIn);
      this.doc.addEventListener('keydown', onKeyDown);
      window.addEventListener('pt:asistente', onAsistente);
      destroyRef.onDestroy(() => {
        this.doc.removeEventListener('focusin', onFocusIn);
        this.doc.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('pt:asistente', onAsistente);
      });
    });

    effect((onCleanup) => {
      const c = this.ctx();
      const vista = this.vistaActiva();
      const estaAbierto = this.abierto();
      if (!c || estaAbierto || (vista !== 'detalle' && vista !== 'bandeja' && vista !== 'vivo')) {
        this.mostrarGlobo.set(false);
        return;
      }
      const t1 = window.setTimeout(() => this.mostrarGlobo.set(true), 1400);
      const t2 = window.setTimeout(() => this.mostrarGlobo.set(false), 9000);
      onCleanup(() => {
        window.clearTimeout(t1);
        window.clearTimeout(t2);
      });
    });
  }

  abrirPanel(): void {
    this.abierto.set(true);
    if (this.msgs().length === 0) {
      this.agregarMensaje({ de: 'bot', tipo: 'texto', texto: SALUDO });
    }
  }

  alternarPanel(): void {
    if (this.abierto()) {
      this.abierto.set(false);
    } else {
      this.abrirPanel();
    }
  }

  nombreTono(tono?: Tono): string {
    return TONOS.find((t) => t.id === tono)?.n ?? 'Empático';
  }

  otrosTonos(tono?: Tono): { id: Tono; n: string }[] {
    return TONOS.filter((t) => t.id !== tono);
  }

  etiquetaDecision(dec: 'ACEPTADA' | 'EDITADA' | 'DESCARTADA'): string {
    const mapa = { ACEPTADA: 'aceptada', EDITADA: 'editada', DESCARTADA: 'descartada' };
    return mapa[dec];
  }

  textoEditadoCambio(m: MensajeBot): boolean {
    const orig = (m.texto ?? '').trim();
    const ed = (m.edit ?? orig).trim();
    return ed !== orig;
  }

  actualizarEdicion(id: number, nuevoTexto: string): void {
    this.msgs.update((lista) => lista.map((m) => (m.id === id ? { ...m, edit: nuevoTexto } : m)));
  }

  acTonos(): void {
    this.agregarMensaje({ de: 'bot', tipo: 'tonos', texto: 'Claro, ¿con qué tono?' });
  }

  acRedactar(tono: Tono, destino?: string): void {
    const nombre = this.nombreTono(tono).toLowerCase();
    this.yo(`Redacta la respuesta ${destino ? 'de cierre' : 'al cliente'} (tono ${nombre})`);
    this.contestar(() => {
      const c = this.ctx();
      this.agregarMensaje({
        de: 'bot',
        tipo: 'redactar',
        tono,
        destino,
        texto: redactar(c, tono, destino),
        cierre: c?.cierre ?? null,
      });
    });
  }

  acCierre(destino: string): void {
    this.agregarMensaje({
      de: 'bot',
      tipo: 'texto',
      texto: `Vas a ${destino === 'CLOSED' ? 'cerrar' : 'resolver'} el ticket: reviso los criterios de cierre de su guía y te propongo la respuesta para el cliente.`,
    });
    this.contestar(() => {
      const c = this.ctx();
      if (!c) return;
      this.agregarMensaje({
        de: 'bot',
        tipo: 'redactar',
        tono: 'empatico',
        destino,
        texto: redactar(c, 'empatico', destino),
        cierre: c.cierre,
      });
    }, 900);
  }

  acResumir(): void {
    this.yo('Resume el ticket');
    this.contestar(() => {
      const r = resumir(this.ctx());
      this.agregarMensaje({ de: 'bot', tipo: 'resumen', titulo: r.titulo, lineas: r.lineas });
    }, 700);
  }

  acPaso(): void {
    this.yo('¿Cuál es el siguiente paso?');
    this.contestar(() => {
      const p = siguientePaso(this.ctx());
      this.agregarMensaje({
        de: 'bot',
        tipo: 'paso',
        accion: p.accion,
        motivo: p.motivo,
        pasos: p.pasos,
        criterios: p.criterios,
        guia: p.guia,
      });
    }, 700);
  }

  acRevisar(): void {
    this.yo('Revisa mi borrador');
    const area = this.buscarTextareaMensaje();
    const borr = area ? area.value : '';
    this.contestar(() => {
      const c = this.ctx();
      const rev = revisar(c, borr);
      this.agregarMensaje({
        de: 'bot',
        tipo: 'revision',
        borrador: borr,
        hallazgos: rev.hallazgos,
        corregido: rev.corregido,
        anonimizados: rev.anonimizados,
        cierre: c?.cierre ?? null,
      });
    }, 900);
  }

  acQuePuedesHacer(): void {
    this.yo('¿Qué puedes hacer?');
    this.contestar(() => {
      this.agregarMensaje({
        de: 'bot',
        tipo: 'texto',
        texto: `${SALUDO} Entra a un ticket y trabajo con su contexto.`,
      });
    }, 600);
  }

  decidir(m: MensajeBot, decision: 'ACEPTADA' | 'EDITADA' | 'DESCARTADA', textoFinal: string): void {
    this.msgs.update((lista) => lista.map((x) => (x.id === m.id ? { ...x, decision } : x)));
    if (decision === 'DESCARTADA') {
      this.agregarMensaje({
        de: 'bot',
        tipo: 'texto',
        texto: 'De acuerdo, la descarto. Tu decisión queda registrada, sin el texto.',
      });
      return;
    }
    const area = this.buscarTextareaMensaje();
    if (area) {
      const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
      setter?.call(area, textoFinal);
      area.dispatchEvent(new Event('input', { bubbles: true }));
      area.focus();
      this.agregarMensaje({
        de: 'bot',
        tipo: 'texto',
        texto: 'Listo: lo escribí en el mensaje. Revísalo y envíalo cuando quieras.',
      });
    } else {
      navigator.clipboard?.writeText(textoFinal).catch(() => undefined);
      this.agregarMensaje({
        de: 'bot',
        tipo: 'texto',
        texto:
          'No encuentro el campo «Mensaje para el cliente» en esta pantalla, así que lo copié al portapapeles. Tu decisión queda registrada.',
      });
    }
  }

  enviarPregunta(ev: Event): void {
    ev.preventDefault();
    const txt = this.textoPregunta().trim();
    if (!txt) return;
    this.textoPregunta.set('');
    this.yo(txt);
    const c = this.ctx();
    const res = conversar(c, txt);
    this.contestar(() => {
      this.agregarMensaje({ de: 'bot', tipo: 'texto', texto: res.texto });
      if (res.accion === 'redactar') {
        this.agregarMensaje({ de: 'bot', tipo: 'tonos', texto: '¿Con qué tono?' });
      } else if (res.accion === 'resumir') {
        const r = resumir(c);
        this.agregarMensaje({ de: 'bot', tipo: 'resumen', titulo: r.titulo, lineas: r.lineas });
      } else if (res.accion === 'paso') {
        const p = siguientePaso(c);
        this.agregarMensaje({
          de: 'bot',
          tipo: 'paso',
          accion: p.accion,
          motivo: p.motivo,
          pasos: p.pasos,
          criterios: p.criterios,
          guia: p.guia,
        });
      } else if (res.accion === 'revisar') {
        const area = this.buscarTextareaMensaje();
        const borr = area ? area.value : '';
        const rev = revisar(c, borr);
        this.agregarMensaje({
          de: 'bot',
          tipo: 'revision',
          borrador: borr,
          hallazgos: rev.hallazgos,
          corregido: rev.corregido,
          anonimizados: rev.anonimizados,
          cierre: c?.cierre ?? null,
        });
      } else if (res.accion === 'cierre' && c) {
        const dest = c.estadoId === 'RESOLVED' ? 'CLOSED' : 'RESOLVED';
        this.agregarMensaje({
          de: 'bot',
          tipo: 'redactar',
          tono: 'empatico',
          destino: dest,
          texto: redactar(c, 'empatico', dest),
          cierre: c.cierre,
        });
      }
    });
  }

  private yo(texto: string): void {
    this.agregarMensaje({ de: 'yo', tipo: 'texto', texto });
  }

  private agregarMensaje(m: Omit<MensajeBot, 'id'>): void {
    this.msgs.update((actual) => [...actual, { id: ++this.seqId, ...m }]);
    window.setTimeout(() => {
      const el = this.contenedorMsgs()?.nativeElement;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    }, 30);
  }

  private contestar(fn: () => void, ms = 850): void {
    this.pensando.set(true);
    this.estado.set('pensando');
    window.setTimeout(() => {
      this.pensando.set(false);
      fn();
      this.estado.set('hablando');
      window.setTimeout(() => this.estado.set('reposo'), 1500);
    }, ms);
  }

  private buscarTextareaMensaje(): HTMLTextAreaElement | null {
    const activo = this.doc.activeElement;
    if (activo instanceof HTMLTextAreaElement && !activo.closest('.pt-bot')) {
      return activo;
    }
    if (this.ultimaAreaMensaje && this.doc.contains(this.ultimaAreaMensaje)) {
      return this.ultimaAreaMensaje;
    }
    const labels = Array.from(this.doc.querySelectorAll('label'));
    for (const l of labels) {
      if (/Mensaje para el cliente|Respuesta|Comentario/i.test(l.textContent ?? '')) {
        const htmlFor = l.getAttribute('for');
        if (htmlFor) {
          const el = this.doc.getElementById(htmlFor);
          if (el instanceof HTMLTextAreaElement) return el;
        }
        const dentro = l.parentElement?.querySelector('textarea');
        if (dentro instanceof HTMLTextAreaElement) return dentro;
      }
    }
    const cualquiera = this.doc.querySelector('main textarea:not(.pt-bot textarea)');
    return cualquiera instanceof HTMLTextAreaElement ? cualquiera : null;
  }
}
