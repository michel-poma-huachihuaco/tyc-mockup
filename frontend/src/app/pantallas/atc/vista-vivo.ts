import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import {
  AyAlert,
  AyBadge,
  AyButton,
  AyCard,
  AyCardBody,
  AyCardPairs,
  AyHeading,
  AyModal,
  AyPageHeader,
  AyProgressBar,
  AyRow,
  AySelect,
  AyStack,
  AyTabs,
  AyTag,
  AyText,
  AyTimeline,
  type AyOpcionSelect,
  type AyTabsElemento,
  type AyTimelineEvento,
  type ParCardPairs,
} from '@aybarcorp/ui-angular';
import { subscribeAppearance } from '@aybarcorp/tokens/apariencia';
import {
  AHORA_BASE,
  EMPRESAS_AYBAR,
  PUERTAS_CANAL,
  SALAS_OFICINA,
  TIPOS_SIMULACION,
  type SalaOficina,
  type TicketAtc,
} from './datos-atc';
import { MonitorOperacionComponent } from './monitor-operacion';
import { leerTokenRgb } from './three/comun';
import { montarVivo, type Cols, type Estatico, type Snap } from './three/vivo';

interface TicketVivo {
  id: string;
  numero: string;
  gate: string;
  type: string;
  area: string;
  cli: string;
  lote: string;
  prio: 'Normal' | 'Alta' | 'Urgente';
  rayo: boolean;
  etapa: 'bandeja' | 'cola' | 'atencion' | 'salida';
  stateRf004: 'OPEN' | 'IN_PROGRESS' | 'PENDING_CUSTOMER' | 'ESCALATED' | 'REOPENED' | 'RESOLVED' | 'CLOSED';
  resp?: string;
  respNombre?: string;
  workNeed: number;
  workDone: number;
  age: number;
  slaMax: number;
  esc: boolean;
  resumen: string;
  hitos: string[];
}

interface CorreoAsignacionLog {
  readonly id: string;
  readonly hora: string;
  readonly ticketId: string;
  readonly gestor: string;
  readonly liderCopia: string;
  readonly sala: string;
  readonly slaTexto: string;
}

interface EventoTerminalVivo {
  readonly id: string;
  readonly hora: string;
  readonly ticketNumero: string;
  readonly origen: string;
  readonly destino: string;
  readonly responsable: string;
  readonly detalle: string;
  readonly tono: 'ok' | 'warn' | 'danger';
}

interface PuestoEstadoInterno {
  id: string;
  nombre: string;
  rol: string;
  areaKey: string;
  ticketId: string | null;
  atendidos: number;
  baseMin: number;
  metaMin: number;
  velocidadFactor: number;
  csat: string;
}

const CLIENTES_SIM: readonly (readonly [string, string, string])[] = [
  ['Eddie Huamaní', 'Villa Sol II · Lote C-07', 'Consulta de cupo en bus EntregaFest y pase QR'],
  ['Lucía Paredes', 'Mirador del Sur · Lote C-21', 'Inspección de fisura en muro perimétrico (Garantía)'],
  ['Jorge Ramos', 'Los Álamos I · Lote A-03', 'Reclamo por demora de minuta y suspensión de resolución'],
  ['María Quispe', 'Villa Sol II · Lote B-14', 'Validación de voucher de cuota pagada en agente BCP'],
  ['Carlos Mendoza', 'Praderas de Lurín · Lote D-09', 'Solicitud de estado de cuenta y cronograma actualizado'],
  ['Rosa Chávez', 'Oasis de Ancón · Lote E-02', 'Confirmación de asistencia familiar a EntregaFest'],
  ['Pedro Soto', 'Valle Verde · Lote A-18', 'Consulta sobre independización registral y firma'],
  ['Ana Flores', 'Bosques del Norte · Lote F-11', 'Reporte de alumbrado en vía principal del proyecto'],
];

const LIDERES_SALA: Readonly<Record<string, string>> = {
  eje1: 'Sup. Mirtha Delgado (Líder ATC)',
  cob: 'Jefe Raúl Cárdenas (Líder Cobranza)',
  libro: 'Dra. Patricia Vílchez (Oficial Cumplimiento)',
  legal: 'Dr. Ernesto Alarcón (Gerencia Legal Eje 3)',
  post: 'Ing. Roberto Castañeda (Jefe Postventa)',
  proy: 'Arq. Claudia Mendoza (Responsable Proyecto)',
};

const TOKEN_ZONA: Readonly<Record<'claro' | 'oscuro', Readonly<Record<string, string>>>> = {
  claro: {
    eje1: 'primary-600',
    cob: 'primary-700',
    libro: 'secondary-700',
    legal: 'neutral-700',
    post: 'success-700',
    proy: 'secondary-800',
  },
  oscuro: {
    eje1: 'primary-500',
    cob: 'primary-300',
    libro: 'secondary-400',
    legal: 'neutral-300',
    post: 'success-300',
    proy: 'secondary-300',
  },
};

const TOKEN_CANAL: Readonly<Record<'claro' | 'oscuro', Readonly<Record<string, string>>>> = {
  claro: { tel: 'primary-600', wa: 'success-700', mail: 'primary-500', portal: 'primary-700', form: 'secondary-700' },
  oscuro: { tel: 'primary-400', wa: 'success-300', mail: 'primary-300', portal: 'primary-500', form: 'secondary-300' },
};

const PLANTILLA_PUESTOS_SALA: Readonly<
  Record<
    string,
    readonly {
      readonly nombre: string;
      readonly rol: string;
      readonly atendidosInicial: number;
      readonly baseMin: number;
      readonly metaMin: number;
      readonly velocidadFactor: number;
      readonly csat: string;
    }[]
  >
> = {
  eje1: [
    {
      nombre: 'Ana P.',
      rol: 'Asesora Senior Omnicanal',
      atendidosInicial: 14,
      baseMin: 12,
      metaMin: 20,
      velocidadFactor: 1.25,
      csat: '4.9',
    },
    {
      nombre: 'Rosa T.',
      rol: 'Asesora de Primera Línea',
      atendidosInicial: 5,
      baseMin: 24,
      metaMin: 20,
      velocidadFactor: 0.65,
      csat: '4.5',
    },
  ],
  cob: [
    {
      nombre: 'Carla V.',
      rol: 'Gestora de Conciliación y Letras',
      atendidosInicial: 12,
      baseMin: 17,
      metaMin: 25,
      velocidadFactor: 1.15,
      csat: '4.8',
    },
    {
      nombre: 'Iván Q.',
      rol: 'Analista de Cartera y Mora',
      atendidosInicial: 4,
      baseMin: 29,
      metaMin: 25,
      velocidadFactor: 0.6,
      csat: '4.4',
    },
  ],
  libro: [
    {
      nombre: 'Sofía R.',
      rol: 'Especialista Ley 29571',
      atendidosInicial: 8,
      baseMin: 26,
      metaMin: 30,
      velocidadFactor: 1.0,
      csat: '4.8',
    },
    {
      nombre: 'Diego A.',
      rol: 'Analista de Descargos INDECOPI',
      atendidosInicial: 4,
      baseMin: 35,
      metaMin: 30,
      velocidadFactor: 0.68,
      csat: '4.6',
    },
  ],
  legal: [
    {
      nombre: 'Rosario V.',
      rol: 'Abogada Dictaminadora Eje 3',
      atendidosInicial: 6,
      baseMin: 38,
      metaMin: 35,
      velocidadFactor: 0.9,
      csat: '4.7',
    },
    {
      nombre: 'Arturo M.',
      rol: 'Especialista Custodia 6/6',
      atendidosInicial: 3,
      baseMin: 44,
      metaMin: 35,
      velocidadFactor: 0.62,
      csat: '4.5',
    },
  ],
  post: [
    {
      nombre: 'Pedro L.',
      rol: 'Coordinador Técnico de Campo',
      atendidosInicial: 9,
      baseMin: 21,
      metaMin: 30,
      velocidadFactor: 1.1,
      csat: '4.9',
    },
    {
      nombre: 'Mónica S.',
      rol: 'Inspectora de Garantías y Actas',
      atendidosInicial: 5,
      baseMin: 28,
      metaMin: 30,
      velocidadFactor: 0.75,
      csat: '4.7',
    },
  ],
  proy: [
    {
      nombre: 'Elena C.',
      rol: 'Gestora de Logística y Pórtico',
      atendidosInicial: 10,
      baseMin: 14,
      metaMin: 25,
      velocidadFactor: 1.2,
      csat: '4.9',
    },
    {
      nombre: 'Marco B.',
      rol: 'Operador de Aforo y Buses QR',
      atendidosInicial: 6,
      baseMin: 19,
      metaMin: 25,
      velocidadFactor: 0.85,
      csat: '4.7',
    },
  ],
};

@Component({
  selector: 'app-vista-vivo',
  standalone: true,
  imports: [
    AyAlert,
    AyBadge,
    AyButton,
    AyCard,
    AyCardBody,
    AyCardPairs,
    AyHeading,
    AyPageHeader,
    AyProgressBar,
    AyRow,
    AySelect,
    AyStack,
    AyModal,
    AyTabs,
    AyTag,
    AyText,
    AyTimeline,
    MonitorOperacionComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .vivo-salas-movil { display: none; margin: 0; padding: 0; list-style: none; gap: var(--aybar-space-2); }
    .vivo-salas-movil__fila { inline-size: 100%; display: grid; gap: var(--aybar-space-1); text-align: start; font: inherit; color: var(--aybar-color-fg-default); background: var(--aybar-color-bg-surface); border: 1px solid var(--aybar-color-border-default); border-radius: var(--aybar-radius-lg); padding: var(--aybar-space-2) var(--aybar-space-3); cursor: pointer; }
    .vivo-salas-movil__fila[aria-pressed='true'] { border-color: var(--aybar-color-border-accent); }
    .vivo-salas-movil__fila:focus-visible { outline: 2px solid var(--aybar-color-border-focus); outline-offset: 2px; }
    .vivo-salas-movil__nombre { font-weight: var(--aybar-font-weight-semibold); }
    .vivo-salas-movil__cifras { font-size: var(--aybar-font-size-sm); color: var(--aybar-color-fg-muted); font-variant-numeric: tabular-nums; }
    .vivo-salas-movil__riesgo { margin-inline-start: var(--aybar-space-2); color: var(--aybar-color-feedback-warning-fg, var(--aybar-color-fg-default)); }
    @media (max-width: 599.98px) {
      .vivo-salas-movil { display: grid; }
      .pl-atc-vivo-select { flex: 1 1 calc(50% - var(--aybar-space-2)); min-inline-size: 0; }
    }
  `,
  template: `
    <div ayStack gap="6" aria-label="Centro de Comando y Operación en Vivo">
      <ay-page-header
        [conPestanas]="true"
        titulo="Operación en Vivo · Trazabilidad por responsable"
        [descripcion]="
          vistaModo() === 'monitor'
            ? 'Control de SLAs y Carga de Tickets por responsable: métricas SLA, distribución proporcional de estados y filas desplegables.'
            : 'Planta de atención en vivo: monitorea el tránsito de tickets entre áreas y qué responsable atiende cada caso.'
        "
      >
        <ay-tabs
          ayPestanas
          etiqueta="Vistas del Centro de Comando de Operación en Vivo"
          variante="underline"
          [items]="tabsOperacionVivo"
          [valor]="vistaModo()"
          (valorChange)="cambiarVistaModo($event)"
        />
      </ay-page-header>

      @if (vistaModo() === 'monitor') {
        <app-monitor-operacion
          [tickets]="ticketsEnVivo()"
          [(area)]="areaResponsables"
          [eventosVivo]="eventosTerminal()"
          [cerradosHoy]="cerradosHoy()"
          [conRayo]="conRayoCount()"
          (seleccionarTicket)="alSeleccionarTicketEnVivo($event)"
        />
      }

      <!-- =========================================================================
           PLANTA: 3D + SALA DE COMANDOS · PANEL DE ALTURA FIJA Y RESPONSIVO
           Se mantiene montado en el DOM para no destruir ni recrear el contexto WebGL al cambiar de pestaña.
           ========================================================================= -->
      <div [style.display]="vistaModo() === 'comando' ? '' : 'none'">
        <div ayStack gap="4">
          <!-- 1. Planta de Atención en Vivo (3D) -->
          <div ayStack gap="2">
            <div ayRow gap="2" justificar="between" [ajuste]="true">
              <div ayStack gap="1">
                <ay-heading [nivel]="2" size="sm">
                  Planta de Atención en Vivo (3D) · Robot Orquestador · 6 Salas · Comité SGD · Cierre en Mi Portal
                </ay-heading>
                <span ayText="subtitle" size="xs">
                  Haz clic en un ticket para abrir su ficha y su bitácora; las salas filtran la planta.
                </span>
              </div>
              <div ayRow gap="2" [ajuste]="true">
                <ay-badge size="sm" tono="success">{{ cerradosHoy() }} resueltos hoy</ay-badge>
                <ay-badge size="sm" tono="warning">{{ conRayoCount() }} con Rayo</ay-badge>
                <ay-badge size="sm" [tono]="escaladosCount() > 0 ? 'danger' : 'neutral'">
                  {{ escaladosCount() }} en Comité SGD
                </ay-badge>
              </div>
            </div>
            <ay-card>
              <ay-card-body>
                <div ayStack gap="3">
                  <!-- Barra de Simulación y Customización de Entradas -->
                  <div ayRow gap="3" justificar="between" alinear="center" [ajuste]="true">
                    <div ayRow gap="2" alinear="center" [ajuste]="true">
                      <div class="pl-atc-vivo-select">
                        <ay-select
                          nombre="canal-entrada"
                          size="sm"
                          [opciones]="opcionesCanalesSelect"
                          [valor]="canalEntradaCustom()"
                          (valorChange)="canalEntradaCustom.set($event)"
                        />
                      </div>
                      <div class="pl-atc-vivo-select">
                        <ay-select
                          nombre="sala-filtro"
                          size="sm"
                          [opciones]="opcionesSalasSelect"
                          [valor]="areaFiltro()"
                          (valorChange)="areaFiltro.set($event)"
                        />
                      </div>
                      <ay-button
                        tamano="sm"
                        variante="ghost"
                        (click)="simularPicoMasivo()"
                      >
                        Pico +5
                      </ay-button>
                    </div>
                  </div>

                  <!-- Móvil (<600 px): lista accesible de salas, en lugar de las etiquetas 3D -->
                  <ul class="vivo-salas-movil" aria-label="Salas y tickets en cola">
                    @for (r of resumenSalas(); track r.k) {
                      <li>
                        <button
                          type="button"
                          class="vivo-salas-movil__fila"
                          [attr.aria-pressed]="areaFiltro() === r.k"
                          (click)="inspeccionarSala3D(r.k)"
                        >
                          <span class="vivo-salas-movil__nombre">{{ r.nombre }}</span>
                          <span class="vivo-salas-movil__cifras">
                            {{ r.cola }} en cola · {{ r.atencion }} en atención
                            @if (r.riesgo) {
                              <strong class="vivo-salas-movil__riesgo">▲ SLA en riesgo</strong>
                            }
                          </span>
                        </button>
                      </li>
                    }
                  </ul>

                  <!-- Lienzo 3D -->
                  <div #stageHost class="atc-vivo-stage-area">
                    <canvas
                      #threeCanvas
                      style="display: block; width: 100%; cursor: pointer;"
                    ></canvas>
                  </div>

                  <!-- Leyenda de escena 3D con componentes del SDK -->
                  <div ayRow gap="2" [ajuste]="true">
                    <ay-tag variante="outline" colorPunto="var(--aybar-color-feedback-success-border)">
                      LED verde (esfera): En plazo SLA
                    </ay-tag>
                    <ay-tag variante="outline" colorPunto="var(--aybar-color-feedback-warning-border)">
                      LED ámbar pulsante (rombo): SLA en riesgo (&lt;25%)
                    </ay-tag>
                    <ay-tag variante="outline" colorPunto="var(--aybar-color-feedback-danger-border)">
                      LED rojo (cubo) / Comité SGD: SLA vencido
                    </ay-tag>
                    <ay-tag variante="outline" colorPunto="var(--aybar-color-secondary-400)">
                      Relámpago 3D giratorio: Prioridad Rayo
                    </ay-tag>
                    <ay-tag variante="outline" colorPunto="var(--aybar-color-primary-500)">
                      Robot Orquestador: Despacho automático por carga
                    </ay-tag>
                  </div>
                </div>
              </ay-card-body>
            </ay-card>
          </div>
        </div>
      </div>

      <!-- Modal único: pestañas Ticket y Bitácora (disponible desde Planta y Monitor) -->
      <ay-modal
        [abierto]="panelVisible()"
        (abiertoChange)="!$event && cerrarPanel()"
        [titulo]="etiquetaPanel()"
        size="lg"
      >
        <div ayStack gap="3">
          <ay-tabs
            etiqueta="Contenido de la ficha"
            variante="underline"
            size="sm"
            [items]="tabsPanel()"
            [valor]="pestanaPanel()"
            (valorChange)="pestanaPanel.set($event === 'correos' ? 'correos' : 'ticket')"
          />
          @if (pestanaPanel() === 'ticket' && ticketMostrado(); as tk) {
            @if (!enPlanta()) {
              <ay-alert size="sm" tono="info">
                Este ticket ya salió de la planta; se muestra su último estado.
              </ay-alert>
            }
            <div ayRow gap="2" [ajuste]="true">
              <ay-badge size="sm" [tono]="tk.rayo ? 'warning' : 'info'">
                {{ tk.rayo ? 'Prioridad Rayo' : tk.prio }}
              </ay-badge>
              <ay-badge size="sm" [tono]="tonoSlaBadge(tk)">
                {{ etiquetaSlaTicket(tk) }}
              </ay-badge>
              <span ayText="body">{{ tk.resumen }}</span>
            </div>
            <div class="pl-vivo-modal__cols">
              <div ayStack gap="3">
                <ay-progress-bar
                  etiqueta="SLA restante en turno"
                  [valor]="pctSlaRestante(tk)"
                  [detalle]="pctSlaRestante(tk) + '% restante'"
                  [tono]="tonoSlaBarra(tk)"
                  size="sm"
                />
                <ay-card-pairs [pares]="paresTicketVivo(tk)" />
              </div>
              <div ayStack gap="1">
                <span ayText="label" size="xs">Recorrido en tiempo real</span>
                <div class="pl-vivo-modal__recorrido">
                  <ay-timeline
                    etiqueta="Recorrido del ticket en planta"
                    [hitos]="hitosTicketVivo(tk)"
                  />
                </div>
              </div>
            </div>
          } @else {
            <div ayRow gap="2" [ajuste]="true">
              <ay-badge size="sm" tono="info">{{ correosEnviados().length }} recientes</ay-badge>
              <span ayText="body">
                Bitácora de asignación (CC Líder de Área): registro automático en cada despacho a responsable
              </span>
            </div>
            <ay-timeline
              etiqueta="Bitácora de asignaciones"
              [hitos]="hitosCorreosEnviados()"
            />
          }
        </div>
        @if (pestanaPanel() === 'ticket' && ticketMostrado(); as tk) {
          <div ayAcciones class="pl-vivo-modal__pie">
            <div class="pl-vivo-modal__pie-sec">
              <ay-button class="pl-vivo-modal__contorno" tamano="sm" variante="ghost" [disabled]="!enPlanta()" (click)="reasignarMenorCarga(tk.id)">
                Reasignar gestor
              </ay-button>
              <ay-button class="pl-vivo-modal__contorno" tamano="sm" variante="ghost" (click)="seleccionarTicket.emit(tk.numero)">
                Ver expediente
              </ay-button>
            </div>
            <div class="pl-vivo-modal__pie-sec">
              <ay-button tamano="sm" variante="secondary" [disabled]="!enPlanta()" (click)="alternarRayoTicket(tk.id)">
                ⚡ {{ tk.rayo ? 'Quitar Rayo' : 'Prioridad Rayo' }}
              </ay-button>
              @if (!tk.esc) {
                <ay-button tamano="sm" variante="danger" [disabled]="!enPlanta()" (click)="escalarTicketAComite(tk.id)">
                  Escalar a Comité SGD
                </ay-button>
              }
              <ay-button tamano="sm" variante="primary" [disabled]="!enPlanta()" (click)="resolverTicketInmediato(tk.id)">
                Resolver a Mi Portal
              </ay-button>
            </div>
          </div>
        }
      </ay-modal>
    </div>
  `,
})
export class VistaVivoComponent {
  readonly mostrarHu = input<boolean>(false);
  readonly tickets = input<readonly TicketAtc[]>([]);
  /** La Torre de Control envía aquí al hacer clic en un área: abre «Responsables» filtrado. */
  readonly areaInicial = input<string>('');
  readonly seleccionarTicket = output<string>();
  readonly irABandeja = output<void>();

  private readonly destroyRef = inject(DestroyRef);
  private readonly stageHostRef = viewChild<ElementRef<HTMLDivElement>>('stageHost');
  private readonly threeCanvasRef = viewChild<ElementRef<HTMLCanvasElement>>('threeCanvas');

  readonly puertas = PUERTAS_CANAL;
  readonly salas = SALAS_OFICINA;
  readonly metaXpNivel = 150;

  readonly vistaModo = signal<'comando' | 'monitor'>('comando');
  readonly areaResponsables = signal<string>('');
  readonly tabsOperacionVivo: AyTabsElemento[] = [
    { value: 'comando', label: 'Planta' },
    { value: 'monitor', label: 'Monitor' },
  ];

  readonly modoTvActivo = signal<boolean>(false);
  readonly indiceRotacionTv = signal<number>(0);
  readonly segundosRotacionTv = signal<number>(4);

  readonly opcionesSalasSelect: AyOpcionSelect[] = [
    { value: '', label: 'Todas las áreas (6 salas)' },
    ...SALAS_OFICINA.map((s) => ({ value: s.k, label: s.nombre })),
  ];

  readonly opcionesCanalesSelect: AyOpcionSelect[] = [
    { value: '', label: 'Todos los canales (5)' },
    ...PUERTAS_CANAL.map((p) => ({ value: p.k, label: `${p.nombre} (${p.ic})` })),
  ];

  readonly areaFiltro = signal<string>('');
  readonly canalEntradaCustom = signal<string>('');
  readonly rayoEntradaCustom = signal<boolean>(false);
  readonly ticketSeleccionadoId = signal<string | null>(null);

  /** Panel único de la escena: pestaña Ticket (ficha) o Correos CC (bitácora). */
  readonly panelAbierto = signal<boolean>(false);
  readonly pestanaPanel = signal<'ticket' | 'correos'>('ticket');
  /** Visible = abierto y con algo que mostrar (si el ticket sale de la planta, no queda vacío). */
  readonly panelVisible = computed(
    () => this.panelAbierto() && (this.pestanaPanel() === 'correos' || !!this.ticketMostrado()),
  );
  /** Último estado conocido del ticket abierto: sobrevive a su salida de la planta mientras el modal siga abierto. */
  private readonly ultimoTicket = signal<TicketVivo | null>(null);
  private readonly _congelar = effect(() => {
    const tk = this.ticketSeleccionado();
    if (tk) this.ultimoTicket.set(tk);
  });
  readonly ticketMostrado = computed<TicketVivo | null>(() => {
    const id = this.ticketSeleccionadoId();
    const u = this.ultimoTicket();
    return this.ticketSeleccionado() ?? (id && u?.id === id ? u : null);
  });
  readonly enPlanta = computed(() => !!this.ticketSeleccionado());
  readonly correosActivo = computed(() => this.panelVisible() && this.pestanaPanel() === 'correos');
  readonly tabsPanel = computed<AyTabsElemento[]>(() => [
    { value: 'ticket', label: 'Ticket', disabled: !this.ticketMostrado() },
    { value: 'correos', label: 'Bitácora', contador: this.correosEnviados().length },
  ]);
  readonly etiquetaPanel = computed(() => {
    const tk = this.ticketMostrado();
    return this.pestanaPanel() === 'ticket' && tk
      ? 'Ficha del ticket ' + tk.numero
      : 'Bitácora de asignación';
  });

  abrirTicket(id: string): void {
    this.ticketSeleccionadoId.set(id);
    this.pestanaPanel.set('ticket');
    this.panelAbierto.set(true);
  }

  alternarCorreos(): void {
    if (this.correosActivo()) {
      this.cerrarPanel();
      return;
    }
    this.pestanaPanel.set('correos');
    this.panelAbierto.set(true);
  }

  cerrarPanel(): void {
    this.panelAbierto.set(false);
    this.ticketSeleccionadoId.set(null);
    this.ultimoTicket.set(null);
  }

  readonly cerradosHoy = signal<number>(38);
  readonly cerradosEnSlaHoy = signal<number>(35);
  readonly escaladosCount = signal<number>(2);
  readonly xpEquipo = signal<number>(115);
  readonly nivelEquipo = signal<number>(4);
  readonly rachaSla = signal<number>(11);
  readonly ticketsActivos = signal<TicketVivo[]>([]);
  readonly puestosEstado = signal<Record<string, PuestoEstadoInterno[]>>({});
  readonly eventosTerminal = signal<EventoTerminalVivo[]>([]);
  readonly correosEnviados = signal<CorreoAsignacionLog[]>([
    {
      id: 'MAIL-01',
      hora: '10:28:14',
      ticketId: 'AIN-000201',
      gestor: 'Ana P. (Atención Eje 1)',
      liderCopia: LIDERES_SALA['eje1'],
      sala: 'Atención Eje 1',
      slaTexto: 'SLA 1.ª resp: 2 h hábiles',
    },
    {
      id: 'MAIL-02',
      hora: '10:29:02',
      ticketId: 'AIN-000202',
      gestor: 'Carla V. (Cobranza)',
      liderCopia: LIDERES_SALA['cob'],
      sala: 'Cobranza',
      slaTexto: 'Prioridad Rayo · SLA resolución: 24 h',
    },
  ]);

  private tickInterval: ReturnType<typeof setInterval> | null = null;
  private tvRotacionInterval: ReturnType<typeof setInterval> | null = null;
  private desmontarVivo: (() => void) | null = null;
  private readonly hitsRef: { current: { id: string; x: number; y: number }[] } = { current: [] };
  private seqId = 200;
  private spawnTimer = 0;
  private ocupacionEscritorios: Record<string, PuestoEstadoInterno[]> = {};

  readonly resumenSalas = computed(() =>
    this.salas.map((s) => {
      const enSala = this.ticketsActivos().filter((t) => t.area === s.k && t.etapa !== 'salida');
      return {
        k: s.k,
        nombre: s.nombre,
        cola: enSala.filter((t) => t.etapa === 'cola' || t.etapa === 'bandeja').length,
        atencion: enSala.filter((t) => t.etapa === 'atencion').length,
        riesgo: enSala.some((t) => this.nivelSlaTicket(t) !== 'ok'),
      };
    }),
  );

  readonly conRayoCount = computed(() => this.ticketsActivos().filter((t) => t.rayo).length);

  readonly ticketSeleccionado = computed<TicketVivo | null>(() => {
    const id = this.ticketSeleccionadoId();
    if (!id) return null;
    return this.ticketsActivos().find((t) => t.id === id) ?? null;
  });

  /** Combina la cartera base con los tickets en tránsito de la simulación en vivo para alimentar Monitor y Responsables en tiempo real. */
  readonly ticketsEnVivo = computed<readonly TicketAtc[]>(() => {
    const base = this.tickets();
    const numsBase = new Set(base.map((b) => b.num));
    const mapaArea: Readonly<Record<string, string>> = {
      eje1: 'ATC',
      cob: 'COBRANZA',
      libro: 'LEGAL',
      legal: 'LEGAL',
      post: 'POSTVENTA',
      proy: 'ADMINISTRACION',
    };
    const mapaTipo: Readonly<Record<string, string>> = {
      cons: 'PED',
      cuota: 'CTA',
      moro: 'CTA',
      recl: 'REC',
      legal: 'REC',
      gar: 'GAR',
      ingr: 'VIS',
      bus: 'VIS',
    };
    const empresaDefault = EMPRESAS_AYBAR[0]!;
    const ahoraMs = AHORA_BASE.getTime();
    const simulados: TicketAtc[] = this.ticketsActivos()
      .filter((tv) => !numsBase.has(tv.numero))
      .map((tv) => {
        const areaAtc = mapaArea[tv.area] ?? 'ATC';
        const opened = new Date(ahoraMs - Math.max(1, tv.age) * 60000);
        const due = new Date(ahoraMs + (tv.slaMax - tv.age) * 60000);
        const movFecha = new Date(ahoraMs - (tv.age % 6) * 60000);
        const prio: TicketAtc['prio'] =
          tv.prio === 'Urgente' ? 'URGENT' : tv.prio === 'Alta' ? 'HIGH' : 'MEDIUM';
        const state: TicketAtc['state'] =
          tv.etapa === 'salida'
            ? 'RESOLVED'
            : tv.esc && tv.age > tv.slaMax + 20
              ? 'IN_COMMITTEE'
              : tv.esc
                ? 'ESCALATED'
                : tv.stateRf004;
        return {
          num: tv.numero,
          co: empresaDefault.id,
          empresa: empresaDefault,
          line: 'Lotes urbanos',
          ch: this.nombreCanal(tv.gate),
          cli: tv.cli,
          dni: '40000000',
          proj: tv.lote,
          type: mapaTipo[tv.type] ?? 'PED',
          prio,
          state,
          area: areaAtc,
          owner: tv.respNombre ?? null,
          opened,
          firstResp: tv.etapa === 'atencion' || tv.etapa === 'salida' ? opened : undefined,
          frDue: due,
          resDue: due,
          slaSrc: 'en vivo',
          reopen: 0,
          conflict: tv.esc,
          rayo: tv.rayo,
          emotion: 'Monitoreo en vivo.',
          eje: tv.area === 'legal' ? 3 : tv.area === 'post' ? 2 : 1,
          contract: null,
          summary: tv.resumen,
          interactions: [],
          log: [{ fecha: movFecha, area: areaAtc, responsable: tv.respNombre ?? 'Cola', motivo: 'VIVO', nota: tv.resumen }],
          status: [{ fecha: movFecha, estado: state, autor: tv.respNombre ?? 'Robot Orquestador' }],
        };
      });
    return [...base, ...simulados];
  });

  alSeleccionarTicketEnVivo(num: string): void {
    const vivo = this.ticketsActivos().find((t) => t.numero === num || t.id === num);
    if (vivo) {
      this.abrirTicket(vivo.id);
      return;
    }
    this.seleccionarTicket.emit(num);
  }

  constructor() {
    this.salas.forEach((r) => {
      const plantillas = PLANTILLA_PUESTOS_SALA[r.k] ?? [];
      this.ocupacionEscritorios[r.k] = plantillas.map((p, i) => ({
        id: `${r.k}:g${i}`,
        nombre: p.nombre,
        rol: p.rol,
        areaKey: r.k,
        ticketId: null,
        atendidos: p.atendidosInicial,
        baseMin: p.baseMin,
        metaMin: p.metaMin,
        velocidadFactor: p.velocidadFactor,
        csat: p.csat,
      }));
    });
    this.sincronizarPuestosSignal();

    for (let i = 0; i < 12; i++) {
      this.inyectarTicket({ rayo: i === 1 || i === 5, silencioso: true });
    }
    for (let i = 0; i < 14; i++) {
      this.ejecutarPasoSimulacion();
    }

    effect(() => {
      const area = this.areaInicial();
      if (!area) return;
      untracked(() => {
        this.areaResponsables.set(area);
        this.vistaModo.set('monitor');
      });
    });

    effect((onCleanup) => {
      const host = this.stageHostRef()?.nativeElement;
      const canvas = this.threeCanvasRef()?.nativeElement;
      if (!host || !canvas) return;
      let rafInit = 0;
      if (typeof requestAnimationFrame === 'function') {
        rafInit = requestAnimationFrame(() => {
          untracked(() => {
            this.inicializarEscena3D();
          });
        });
      } else {
        untracked(() => {
          this.inicializarEscena3D();
        });
      }
      onCleanup(() => {
        if (rafInit && typeof cancelAnimationFrame === 'function') {
          cancelAnimationFrame(rafInit);
        }
        if (this.desmontarVivo) {
          this.desmontarVivo();
          this.desmontarVivo = null;
        }
      });
    });

    const desuscribirTema = subscribeAppearance(() => {
      if (this.desmontarVivo) {
        this.desmontarVivo();
        this.desmontarVivo = null;
        untracked(() => {
          this.inicializarEscena3D();
        });
      }
    });

    afterNextRender(() => {
      if (typeof window !== 'undefined' && window.location.search.includes('modo=tv')) {
        this.modoTvActivo.set(true);
        this.vistaModo.set('comando');
      }
      this.tickInterval = setInterval(() => {
        this.ejecutarPasoSimulacion();
      }, 550);

      this.tvRotacionInterval = setInterval(() => {
        if (!this.modoTvActivo()) return;
        const rest = this.segundosRotacionTv() - 1;
        if (rest <= 0) {
          this.segundosRotacionTv.set(4);
          const nextIdx = (this.indiceRotacionTv() + 1) % this.salas.length;
          this.indiceRotacionTv.set(nextIdx);
        } else {
          this.segundosRotacionTv.set(rest);
        }
      }, 1000);
    });

    this.destroyRef.onDestroy(() => {
      desuscribirTema();
      if (this.tickInterval !== null) clearInterval(this.tickInterval);
      if (this.tvRotacionInterval !== null) clearInterval(this.tvRotacionInterval);
      if (this.desmontarVivo) {
        this.desmontarVivo();
        this.desmontarVivo = null;
      }
    });
  }

  private inicializarEscena3D(): void {
    const host = this.stageHostRef()?.nativeElement;
    const canvas = this.threeCanvasRef()?.nativeElement;
    if (!host || !canvas) return;

    const sueloRgb = leerTokenRgb('bg-surface-sunken', [232, 232, 232]);
    const tema =
      0.2126 * sueloRgb[0]! + 0.7152 * sueloRgb[1]! + 0.0722 * sueloRgb[2]! < 110 ? 'oscuro' : 'claro';
    const estado = (n: string, resp: [number, number, number]) =>
      leerTokenRgb(tema === 'claro' ? `${n}-600` : `${n}-500`, resp);
    const cols: Cols = {
      teal: leerTokenRgb('primary-700', [2, 66, 78]),
      teal2: leerTokenRgb('primary-500', [70, 134, 150]),
      orange: leerTokenRgb('secondary-400', [255, 167, 38]),
      ok: estado('success', [29, 139, 68]),
      warn: estado('warning', [157, 106, 0]),
      bad: estado('danger', [193, 69, 58]),
      sobreAcento: leerTokenRgb('fg-on-accent', [0, 34, 42]),
      line: leerTokenRgb('border-subtle', [212, 212, 212]),
      muted: leerTokenRgb('fg-muted', [74, 74, 74]),
      texto: leerTokenRgb('fg-default', [29, 29, 29]),
      superficie: leerTokenRgb('bg-surface', [255, 255, 255]),
      suelo: leerTokenRgb('bg-surface-sunken', [232, 232, 232]),
      lienzo: leerTokenRgb('bg-canvas', [246, 246, 246]),
    };

    const est: Estatico = {
      zonas: this.salas.map((s) => ({
        k: s.k,
        n: s.nombre,
        color: leerTokenRgb(TOKEN_ZONA[tema][s.k] ?? 'primary-500', cols.teal2),
      })),
      compuertas: this.puertas.map((p) => ({
        k: p.k,
        n: p.nombre,
        sigla: p.ic,
        color: leerTokenRgb(TOKEN_CANAL[tema][p.k] ?? 'primary-500', cols.teal2),
      })),
    };

    const reducido =
      typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.desmontarVivo = montarVivo({
      canvas,
      host,
      cols,
      reducido,
      est,
      hits: this.hitsRef,
      obtener: () => this.snapshotEscena(),
      alClickTicket: (id) => {
        this.abrirTicket(id);
      },
      alClickCanal: (gateKey) => {
        this.inspeccionarCanal3D(gateKey);
      },
      alClickSala: (areaKey) => {
        this.inspeccionarSala3D(areaKey);
      },
      alClickEtapa: (etapa) => {
        this.inspeccionarEtapa3D(etapa);
      },
    });
  }

  private readonly snapshotEscena = computed<Snap>(() => {
    const lista = this.ticketsActivos();
    const selId = this.ticketSeleccionadoId();
    const mapaPuestos = this.puestosEstado();
    const zonas = this.salas.map((s) => {
      const desks = mapaPuestos[s.k] ?? this.ocupacionEscritorios[s.k] ?? [];
      const enSala = lista.filter((t) => t.area === s.k && t.etapa !== 'salida');
      const cola = enSala.filter((t) => t.etapa === 'cola' || t.etapa === 'bandeja').length;
      const atencion = enSala.filter((t) => t.etapa === 'atencion').length;
      const riesgo = enSala.some((t) => this.nivelSlaTicket(t) !== 'ok');
      return {
        k: s.k,
        cola,
        atencion,
        riesgo,
        gente: desks.map((d) => ({
          id: d.id,
          nombre: d.nombre,
          ocupado: d.ticketId !== null,
        })),
      };
    });

    return {
      zonas,
      bandeja: lista.filter((t) => t.etapa === 'bandeja').length,
      escalados: this.escaladosCount(),
      tickets: lista.map((t) => ({
        id: t.id,
        numero: t.numero,
        gate: t.gate,
        zona: t.area,
        etapa: t.etapa,
        sla: this.nivelSlaTicket(t),
        rayo: t.rayo,
        sel: t.id === selId,
        resp: t.resp,
      })),
    };
  });

  inspeccionarCanal3D(gateKey: string): void {
    this.inyectarTicket({ gate: gateKey });
  }

  inspeccionarSala3D(areaKey: string): void {
    this.areaFiltro.set(areaKey);
  }

  inspeccionarEtapa3D(etapa: 'bandeja' | 'comite' | 'salida'): void {
    if (etapa === 'bandeja') {
      this.areaFiltro.set('');
    }
  }

  private sincronizarPuestosSignal(): void {
    const copia: Record<string, PuestoEstadoInterno[]> = {};
    for (const [k, arr] of Object.entries(this.ocupacionEscritorios)) {
      copia[k] = arr.map((p) => ({ ...p }));
    }
    this.puestosEstado.set(copia);
  }

  private registrarEventoTerminal(
    ticketNumero: string,
    origen: string,
    destino: string,
    responsable: string,
    detalle: string,
    tono: 'ok' | 'warn' | 'danger' = 'ok',
  ): void {
    const hora = new Date().toTimeString().slice(0, 8);
    const ev: EventoTerminalVivo = {
      id: `EV-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      hora,
      ticketNumero,
      origen,
      destino,
      responsable,
      detalle,
      tono,
    };
    this.eventosTerminal.update((prev) => [ev, ...prev].slice(0, 18));
  }

  cambiarVistaModo(id: string): void {
    if (id === 'comando' || id === 'monitor') {
      this.vistaModo.set(id);
    }
  }

  alternarModoTv(): void {
    const nuevo = !this.modoTvActivo();
    this.modoTvActivo.set(nuevo);
    this.segundosRotacionTv.set(4);
    if (nuevo) {
      this.vistaModo.set('comando');
    } else {
      this.areaFiltro.set('');
    }
  }

  inyectarTicketEnSala(areaKey: string, rayo: boolean): void {
    const entrada = Object.entries(TIPOS_SIMULACION).find(([, v]) => v.area === areaKey);
    const typeKey = entrada?.[0] ?? 'cons';
    this.inyectarTicket({ type: typeKey, rayo });
  }

  tonoSlaBadge(tk: TicketVivo): 'success' | 'warning' | 'danger' {
    const niv = this.nivelSlaTicket(tk);
    return niv === 'vencido' ? 'danger' : niv === 'riesgo' ? 'warning' : 'success';
  }

  tonoSlaBarra(tk: TicketVivo): 'brand' | 'success' | 'danger' {
    const niv = this.nivelSlaTicket(tk);
    return niv === 'vencido' ? 'danger' : niv === 'riesgo' ? 'brand' : 'success';
  }

  paresTicketVivo(tk: TicketVivo): ParCardPairs[] {
    return [
      { clave: 'Cliente / Lote', valor: `${tk.cli} · ${tk.lote}` },
      { clave: 'Canal de entrada', valor: this.nombreCanal(tk.gate) },
      { clave: 'Área actual', valor: `${this.nombreSala(tk.area)} (${this.etiquetaEtapa(tk.etapa)})` },
      { clave: 'Responsable a cargo', valor: tk.respNombre ?? 'En cola (sin responsable libre)' },
    ];
  }

  hitosTicketVivo(tk: TicketVivo): AyTimelineEvento[] {
    return tk.hitos.map((hito, idx) => ({
      id: `${tk.id}-h-${idx}`,
      titulo: hito,
      fecha: new Date(),
      autor: tk.respNombre ?? 'Robot Orquestador',
      tono: idx === 0 ? (tk.esc ? 'danger' : tk.rayo ? 'accent' : 'success') : 'default',
    }));
  }

  hitosCorreosEnviados(): AyTimelineEvento[] {
    return this.correosEnviados().map((c) => ({
      id: c.id,
      titulo: `Ticket ${c.ticketId} asignado a ${c.gestor} en ${c.sala} · ${c.slaTexto} (CC: ${c.liderCopia})`,
      fecha: new Date(),
      autor: c.hora,
      tono: 'accent',
    }));
  }

  inyectarTicket(opts?: { gate?: string; type?: string; rayo?: boolean; silencioso?: boolean }): void {
    const g = opts?.gate
      ? (this.puertas.find((p) => p.k === opts.gate) ?? this.puertas[0]!)
      : this.puertas[Math.floor(Math.random() * this.puertas.length)]!;
    const tiposKeys = Object.keys(TIPOS_SIMULACION);
    const tkKey = opts?.type ?? tiposKeys[Math.floor(Math.random() * tiposKeys.length)]!;
    const tp = TIPOS_SIMULACION[tkKey] ?? TIPOS_SIMULACION['cons']!;
    const cli = CLIENTES_SIM[Math.floor(Math.random() * CLIENTES_SIM.length)]!;
    const rayo = opts?.rayo ?? Math.random() < 0.18;
    const numSeq = ++this.seqId;
    const id = `T-0${numSeq}`;
    const numero = `AIN-000${numSeq}`;
    const hora = new Date().toTimeString().slice(0, 8);

    const nuevo: TicketVivo = {
      id,
      numero,
      gate: g.k,
      type: tkKey,
      area: tp.area,
      cli: cli[0],
      lote: cli[1],
      prio: rayo ? 'Urgente' : Math.random() < 0.35 ? 'Alta' : 'Normal',
      rayo,
      etapa: 'bandeja',
      stateRf004: 'OPEN',
      workNeed: Math.round(tp.pt[0] + Math.random() * (tp.pt[1] - tp.pt[0])),
      workDone: 0,
      age: 0,
      slaMax: tp.sla,
      esc: false,
      resumen: cli[2],
      hitos: [
        `${hora} · Ingresó por ${g.nombre} y aterrizó en Bandeja Orquestadora → destino ${this.nombreSala(tp.area)}`,
        ...(rayo ? [`${hora} · Marcado con Prioridad Rayo`] : []),
      ],
    };

    this.ticketsActivos.update((lista) => [...lista, nuevo]);
    if (!opts?.silencioso) {
      this.registrarEventoTerminal(
        numero,
        `Canal ${g.nombre}`,
        'Bandeja Orquestadora',
        'Robot Despachador',
        `Ruteando hacia ${this.nombreSala(tp.area)}${rayo ? ' [⚡ RAYO]' : ''}`,
        rayo ? 'warn' : 'ok',
      );
    }
  }

  inyectarTicketCustomizado(): void {
    const canal = this.canalEntradaCustom();
    const sala = this.areaFiltro();
    const rayo = this.rayoEntradaCustom();
    const tipoMatch = sala
      ? Object.keys(TIPOS_SIMULACION).find((k) => TIPOS_SIMULACION[k]?.area === sala)
      : undefined;
    this.inyectarTicket({
      gate: canal || undefined,
      type: tipoMatch,
      rayo,
    });
  }

  simularPicoMasivo(): void {
    for (let i = 0; i < 5; i++) {
      this.inyectarTicket({ rayo: i === 0, silencioso: i < 4 });
    }
  }

  escalarTicketAComite(ticketId: string): void {
    const hora = new Date().toTimeString().slice(0, 8);
    let tkEscalado: TicketVivo | null = null;
    this.ticketsActivos.update((lista) =>
      lista.map((t) => {
        if (t.id !== ticketId || t.esc) return t;
        const actualizado: TicketVivo = {
          ...t,
          age: Math.max(t.age, t.slaMax + 5),
          esc: true,
          stateRf004: 'ESCALATED',
          hitos: [
            `${hora} · SLA vencido: Correo CC al líder y escalado a Sala de Comité SGD`,
            ...t.hitos,
          ].slice(0, 5),
        };
        tkEscalado = actualizado;
        return actualizado;
      }),
    );
    if (tkEscalado) {
      const tk = tkEscalado as TicketVivo;
      this.escaladosCount.update((n) => Math.min(6, n + 1));
      this.rachaSla.set(0);
      this.abrirTicket(ticketId);
      this.registrarEventoTerminal(
        tk.numero,
        this.nombreSala(tk.area),
        'Comité SGD',
        tk.respNombre ?? 'Supervisor SGD',
        'SLA vencido · Escalado a Comité Multidisciplinario',
        'danger',
      );
      this.sincronizarPuestosSignal();
    }
  }

  alternarRayoTicket(ticketId: string): void {
    const hora = new Date().toTimeString().slice(0, 8);
    this.ticketsActivos.update((lista) =>
      lista.map((t) => {
        if (t.id !== ticketId) return t;
        const nuevoRayo = !t.rayo;
        return {
          ...t,
          rayo: nuevoRayo,
          prio: nuevoRayo ? 'Urgente' : t.prio,
          hitos: [
            `${hora} · ${nuevoRayo ? 'Prioridad Rayo activada: sube al tope de cola' : 'Prioridad Rayo retirada'}`,
            ...t.hitos,
          ].slice(0, 5),
        };
      }),
    );
    this.sincronizarPuestosSignal();
  }

  resolverTicketInmediato(ticketId: string): void {
    const lista = [...this.ticketsActivos()];
    const tk = lista.find((t) => t.id === ticketId);
    if (!tk) return;
    const respAnterior = tk.respNombre ?? 'Gestor ATC';
    const desks = this.ocupacionEscritorios[tk.area] ?? [];
    const puesto = desks.find((d) => d.ticketId === tk.id);
    if (puesto) {
      puesto.ticketId = null;
      puesto.atendidos++;
    }
    tk.etapa = 'salida';
    tk.stateRf004 = 'RESOLVED';
    const hora = new Date().toTimeString().slice(0, 8);
    tk.hitos = [
      `${hora} · Resuelto por ${respAnterior} y enviado a Cierre en Mi Portal (encuesta CSAT/NPS)`,
      ...tk.hitos,
    ].slice(0, 5);
    this.registrarCierreConXp(tk);
    this.registrarEventoTerminal(
      tk.numero,
      this.nombreSala(tk.area),
      'Mi Portal (Cierre)',
      respAnterior,
      'Resuelto y enviado a conformidad del cliente',
      'ok',
    );
    this.ticketsActivos.set(lista);
    this.sincronizarPuestosSignal();
  }

  reasignarMenorCarga(ticketId: string): void {
    const lista = [...this.ticketsActivos()];
    const tk = lista.find((t) => t.id === ticketId);
    if (!tk) return;
    const anteriorNombre = tk.respNombre;
    this.liberarEscritorioDeTicket(tk);
    const sala = this.salas.find((s) => s.k === tk.area);
    const desks = this.ocupacionEscritorios[tk.area];
    if (!sala || !desks || desks.length === 0) return;

    // Elegir un responsable distinto al actual (priorizando puesto libre o mayor velocidad)
    let candidatos = desks.filter((d) => d.nombre !== anteriorNombre);
    if (candidatos.length === 0) candidatos = desks;
    candidatos.sort((a, b) => {
      if ((a.ticketId === null) !== (b.ticketId === null)) return a.ticketId === null ? -1 : 1;
      return b.velocidadFactor - a.velocidadFactor;
    });

    const puesto = candidatos[0]!;
    if (puesto.ticketId && puesto.ticketId !== tk.id) {
      const otro = lista.find((x) => x.id === puesto.ticketId);
      if (otro) {
        otro.etapa = 'cola';
        otro.resp = undefined;
        otro.respNombre = undefined;
      }
    }
    puesto.ticketId = tk.id;
    tk.resp = puesto.id;
    tk.respNombre = puesto.nombre;
    tk.etapa = 'atencion';
    tk.stateRf004 = 'IN_PROGRESS';
    const hora = new Date().toTimeString().slice(0, 8);
    tk.hitos = [
      `${hora} · Reasignado en ${sala.nombre}: ${anteriorNombre ?? 'Cola'} → ${puesto.nombre}`,
      ...tk.hitos,
    ].slice(0, 5);
    this.registrarCorreoAsignacion(tk, sala, puesto.nombre);
    this.registrarEventoTerminal(
      tk.numero,
      `${sala.nombre} (${anteriorNombre ?? 'Cola'})`,
      `${sala.nombre} (${puesto.nombre})`,
      puesto.nombre,
      'Reasignación directa de carga en Sala de Comandos',
      'warn',
    );
    this.ticketsActivos.set(lista);
    this.sincronizarPuestosSignal();
  }

  private liberarEscritorioDeTicket(tk: TicketVivo): void {
    const desks = this.ocupacionEscritorios[tk.area];
    if (!desks) return;
    for (const d of desks) {
      if (d.ticketId === tk.id) {
        d.ticketId = null;
      }
    }
  }

  private registrarCierreConXp(tk: TicketVivo): void {
    const enPlazo = !tk.esc && tk.age <= tk.slaMax;
    this.cerradosHoy.update((n) => n + 1);
    if (enPlazo) {
      this.cerradosEnSlaHoy.update((n) => n + 1);
      this.rachaSla.update((r) => r + 1);
    } else {
      this.rachaSla.set(0);
    }
    const ganados = (enPlazo ? 10 : 3) + (tk.rayo ? 5 : 0);
    let nuevoXp = this.xpEquipo() + ganados;
    if (nuevoXp >= this.metaXpNivel) {
      nuevoXp -= this.metaXpNivel;
      this.nivelEquipo.update((nv) => nv + 1);
    }
    this.xpEquipo.set(nuevoXp);
  }

  private registrarCorreoAsignacion(tk: TicketVivo, sala: SalaOficina, gestor: string): void {
    const ahora = new Date();
    const hora = ahora.toTimeString().slice(0, 8);
    const nuevoCorreo: CorreoAsignacionLog = {
      id: `MAIL-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      hora,
      ticketId: tk.numero,
      gestor: `${gestor} (${sala.nombre})`,
      liderCopia: LIDERES_SALA[sala.k] ?? 'Supervisor ATC',
      sala: sala.nombre,
      slaTexto: tk.rayo ? 'Prioridad Rayo · Atención inmediata' : `SLA dentro de plazo`,
    };
    this.correosEnviados.update((prev) => [nuevoCorreo, ...prev].slice(0, 8));
  }

  private ejecutarPasoSimulacion(): void {
    this.spawnTimer++;
    if (this.spawnTimer >= 10 && this.ticketsActivos().length < 24) {
      this.spawnTimer = 0;
      this.inyectarTicket({ silencioso: true });
    }

    const lista = [...this.ticketsActivos()];
    const hora = new Date().toTimeString().slice(0, 8);

    // 1. Avanzar edad, trabajo en escritorio según la velocidad del responsable y retiro de cerrados
    const sobrevivientes: TicketVivo[] = [];
    let puestosCambiaron = false;
    let cambioVisible = false;
    for (const t of lista) {
      const nivelAntes = this.nivelSlaTicket(t);
      t.age++;

      if (t.etapa === 'salida') {
        t.workDone += 2;
        if (t.workDone >= t.workNeed + 16) {
          cambioVisible = true;
          continue;
        }
        sobrevivientes.push(t);
        continue;
      }

      if (!t.esc && t.age >= t.slaMax) {
        t.esc = true;
        t.stateRf004 = 'ESCALATED';
        cambioVisible = true;
        this.escaladosCount.update((n) => Math.min(6, n + 1));
        this.rachaSla.set(0);
        t.hitos = [
          `${hora} · SLA vencido: Escalado automático a Comité (Mesa SGD)`,
          ...t.hitos,
        ].slice(0, 5);
        this.registrarEventoTerminal(
          t.numero,
          this.nombreSala(t.area),
          'Comité SGD',
          t.respNombre ?? 'Cola sin asignar',
          'Vencimiento de SLA · Escalamiento automático',
          'danger',
        );
      }

      if (t.etapa === 'bandeja' && t.age >= 4) {
        t.etapa = 'cola';
        cambioVisible = true;
        t.hitos = [
          `${hora} · Robot Orquestador despachó el ticket hacia la cola de ${this.nombreSala(t.area)}`,
          ...t.hitos,
        ].slice(0, 5);
        this.registrarEventoTerminal(
          t.numero,
          'Bandeja Orquestadora',
          `Cola ${this.nombreSala(t.area)}`,
          'Robot Despachador',
          `En cola esperando responsable de ${this.nombreSala(t.area)}`,
          'ok',
        );
      } else if (t.etapa === 'atencion') {
        const desks = this.ocupacionEscritorios[t.area] ?? [];
        const puesto = desks.find((d) => d.ticketId === t.id);
        const factor = puesto?.velocidadFactor ?? 1.0;
        t.workDone += (t.rayo ? 1.45 : 1.05) * factor;
        if (t.workDone >= t.workNeed) {
          if (puesto) {
            puesto.ticketId = null;
            puesto.atendidos++;
            puestosCambiaron = true;
          }
          t.etapa = 'salida';
          t.stateRf004 = 'RESOLVED';
          cambioVisible = true;
          t.hitos = [
            `${hora} · Resuelto por ${t.respNombre ?? 'Gestor'} · pasa a Cierre en Mi Portal`,
            ...t.hitos,
          ].slice(0, 5);
          this.registrarCierreConXp(t);
          this.registrarEventoTerminal(
            t.numero,
            this.nombreSala(t.area),
            'Mi Portal (Cierre)',
            t.respNombre ?? 'Gestor',
            'Atención completada · Enviado a encuesta CSAT/NPS',
            'ok',
          );
        }
      }

      if (this.nivelSlaTicket(t) !== nivelAntes) {
        cambioVisible = true;
      }

      sobrevivientes.push(t);
    }

    // 2. Asignar tickets en cola/bandeja a puestos libres ordenando por Rayo -> SLA
    const candidatos = sobrevivientes.filter(
      (t) => t.etapa === 'cola' || (t.etapa === 'bandeja' && t.age >= 3),
    );
    candidatos.sort((a, b) => {
      if (a.rayo !== b.rayo) return a.rayo ? -1 : 1;
      return a.slaMax - a.age - (b.slaMax - b.age);
    });

    for (const t of candidatos) {
      const sala = this.salas.find((s) => s.k === t.area);
      const desks = this.ocupacionEscritorios[t.area];
      if (!sala || !desks) continue;

      const libreIdx = desks.findIndex((d) => d.ticketId === null);
      if (libreIdx >= 0) {
        const puesto = desks[libreIdx]!;
        puesto.ticketId = t.id;
        puestosCambiaron = true;
        cambioVisible = true;
        t.resp = puesto.id;
        t.respNombre = puesto.nombre;
        t.etapa = 'atencion';
        t.stateRf004 = Math.random() < 0.18 ? 'PENDING_CUSTOMER' : 'IN_PROGRESS';
        t.hitos = [
          `${hora} · Asignado al puesto de ${puesto.nombre} en ${sala.nombre}`,
          ...t.hitos,
        ].slice(0, 5);
        this.registrarCorreoAsignacion(t, sala, puesto.nombre);
        this.registrarEventoTerminal(
          t.numero,
          `Cola ${sala.nombre}`,
          `Puesto de ${puesto.nombre}`,
          puesto.nombre,
          `Inicia atención en ${sala.nombre} (CC: ${LIDERES_SALA[sala.k]})`,
          t.rayo ? 'warn' : 'ok',
        );
      }
    }

    if (cambioVisible || puestosCambiaron) {
      this.ticketsActivos.set(sobrevivientes);
    }
    if (puestosCambiaron) {
      this.sincronizarPuestosSignal();
    }
  }

  pctSlaRestante(tk: TicketVivo): number {
    return Math.max(0, Math.round(((tk.slaMax - tk.age) / tk.slaMax) * 100));
  }

  nivelSlaTicket(tk: TicketVivo): 'ok' | 'riesgo' | 'vencido' {
    if (tk.esc || tk.age >= tk.slaMax) return 'vencido';
    if (this.pctSlaRestante(tk) < 25) return 'riesgo';
    return 'ok';
  }

  etiquetaSlaTicket(tk: TicketVivo): string {
    const niv = this.nivelSlaTicket(tk);
    if (niv === 'vencido') return 'SLA vencido';
    if (niv === 'riesgo') return `En riesgo (${this.pctSlaRestante(tk)}%)`;
    return `En plazo (${this.pctSlaRestante(tk)}%)`;
  }

  etiquetaEtapa(etapa: TicketVivo['etapa']): string {
    switch (etapa) {
      case 'bandeja':
        return 'Bandeja Orquestadora';
      case 'cola':
        return 'En cola de área';
      case 'atencion':
        return 'En puesto de responsable';
      case 'salida':
        return 'Cierre Mi Portal';
    }
  }

  nombreSala(k: string): string {
    if (k === 'bandeja') return 'Bandeja Orquestadora';
    if (k === 'comite') return 'Comité (Mesa SGD)';
    return this.salas.find((s) => s.k === k)?.nombre ?? k;
  }

  nombreCanal(k: string): string {
    return this.puertas.find((p) => p.k === k)?.nombre ?? k;
  }

}
