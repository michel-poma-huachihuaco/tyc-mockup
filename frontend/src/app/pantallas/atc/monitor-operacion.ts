import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import {
  AyAvatar,
  AyBadge,
  AyCard,
  AyCardBody,
  AyCelda,
  AyIcon,
  AyStatistic,
  AyTable,
  AyText,
  type AyColumna,
  type AyOrden,
} from '@aybarcorp/ui-angular';
import { BarraFiltrosComponent } from './barra-filtros';
import {
  ESTADO_ES,
  evaluarSlaTicket,
  tiempoRestanteTexto,
  type TicketAtc,
} from './datos-atc';
import { AREA_ES, nombreArea } from './etiquetas-es';
import { FiltroColumnasTablaDirective } from './filtro-columnas-tabla';
import { EstadoFiltrosTablas, crearFiltrosTabla } from './filtros-tabla';
import { agruparPorResponsable, textoHaceDesde, type FilaResponsable } from './indicadores-responsables';

type Tono = 'success' | 'warning' | 'danger';

interface Sla {
  ok: number;
  riesgo: number;
  vencido: number;
}

/** Una fila de la tabla: una persona, con sus tickets contados por estado de atención. */
interface FilaPersona {
  persona: string;
  area: string;
  OPEN: number;
  IN_PROGRESS: number;
  PENDING_CUSTOMER: number;
  ESCALATED: number;
  IN_COMMITTEE: number;
  REOPENED: number;
  /** El peor SLA entre sus tickets activos. */
  sla: Tono;
  fecha: Date | null;
  detalle: FilaResponsable;
}

/** Estados en los que un ticket sigue abierto, en el orden de las columnas. */
const ESTADOS_ACTIVOS = ['OPEN', 'IN_PROGRESS', 'PENDING_CUSTOMER', 'ESCALATED', 'IN_COMMITTEE', 'REOPENED'] as const;

/** Cabeceras cortas: cada una lleva además el orden y el filtro de columna. */
const CABECERA_ESTADO: Readonly<Record<(typeof ESTADOS_ACTIVOS)[number], string>> = {
  OPEN: 'Abierto',
  IN_PROGRESS: 'En atención',
  PENDING_CUSTOMER: 'Espera cliente',
  ESCALATED: 'Escalado',
  IN_COMMITTEE: 'En comité',
  REOPENED: 'Reabierto',
};

/** Una cifra de la franja: el icono y el tono refuerzan lo que ya dicen la etiqueta y el contexto. */
interface Cifra {
  id: string;
  etiqueta: string;
  valor: string;
  icono: string;
  tono: 'neutral' | 'warning' | 'danger';
  contexto: string;
}

const cerrado = (t: TicketAtc): boolean => t.state === 'RESOLVED' || t.state === 'CLOSED';

function slaDe(tickets: readonly TicketAtc[]): Sla {
  const r: Sla = { ok: 0, riesgo: 0, vencido: 0 };
  for (const t of tickets) {
    if (cerrado(t)) continue;
    const tono = evaluarSlaTicket(t).tono;
    if (tono === 'danger') r.vencido++;
    else if (tono === 'warning') r.riesgo++;
    else r.ok++;
  }
  return r;
}

const peorSla = (s: Sla): Tono => (s.vencido > 0 ? 'danger' : s.riesgo > 0 ? 'warning' : 'success');

/**
 * Monitor de Operación en Vivo, a nivel macro: cuántos tickets tiene cada persona, en qué estado de atención
 * están y cómo va el SLA. La tabla usa los filtros de cabecera de columna y la barra de filtros de las demás
 * tablas del prototipo. Arriba, la franja de cifras con el SLA global.
 * Solo componentes de @aybarcorp/ui-angular y tokens `--aybar-*`.
 */
@Component({
  selector: 'app-monitor-operacion',
  standalone: true,
  imports: [
    AyAvatar,
    AyBadge,
    AyCard,
    AyCardBody,
    AyCelda,
    AyIcon,
  AyStatistic,
    AyTable,
    AyText,
    BarraFiltrosComponent,
    FiltroColumnasTablaDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mo">
      <section class="mo-resumen" role="group" aria-label="Resumen de la operación">
        <div class="mo-cifras">
          @for (c of cifras(); track c.id) {
            <div class="mo-cifra mo-cifra--{{ c.tono }}">
              <span class="mo-cifra__icono" aria-hidden="true"><ay-icon [nombre]="c.icono" size="20" /></span>
              <ay-statistic [etiqueta]="c.etiqueta" [valor]="c.valor" size="md" />
              <span class="mo-cifra__ctx">{{ c.contexto }}</span>
            </div>
          }
        </div>
        <div class="mo-sla">
          <div class="mo-sla__cab">
            <strong>SLA global</strong>
            <span class="mo-sla__pct">{{ slaTexto() }}</span>
          </div>
          <div class="mo-barra mo-barra--alta" role="img" [attr.aria-label]="'En plazo ' + slaGlobal().ok + ', en riesgo ' + slaGlobal().riesgo + ', vencidos ' + slaGlobal().vencido">
            @if (slaGlobal().ok > 0) { <span class="mo-barra__ok" [style.flex-grow]="slaGlobal().ok"></span> }
            @if (slaGlobal().riesgo > 0) { <span class="mo-barra__riesgo" [style.flex-grow]="slaGlobal().riesgo"></span> }
            @if (slaGlobal().vencido > 0) { <span class="mo-barra__vencido" [style.flex-grow]="slaGlobal().vencido"></span> }
          </div>
          <ul class="mo-leyenda">
            <li><span class="mo-muestra mo-barra__ok"></span>En plazo {{ slaGlobal().ok }} ({{ pct(slaGlobal().ok) }})</li>
            <li><span class="mo-muestra mo-barra__riesgo"></span>En riesgo {{ slaGlobal().riesgo }} ({{ pct(slaGlobal().riesgo) }})</li>
            <li><span class="mo-muestra mo-barra__vencido"></span>Vencidos {{ slaGlobal().vencido }} ({{ pct(slaGlobal().vencido) }})</li>
          </ul>
        </div>
      </section>

      <div class="mo-dos">
        <ay-card variante="elevated" superficie="solid">
          <ay-card-body padding="sm" gap="md">
            <div class="mo-cab">
              <strong>Carga por persona</strong>
              <span ayText="body" size="xs">Filtra haciendo clic en cualquier cabecera de columna. Pulsa una persona para ver sus tickets.</span>
            </div>
            <app-barra-filtros [filtros]="filtros" />

            <ay-table
              leyenda="Carga por persona: tickets por estado de atención y SLA"
              [columnas]="columnas"
              [filas]="filtros.filtradas()"
              [filtrosTabla]="filtros"
              [(orden)]="orden"
              [cabeceraFija]="true"
              [rayada]="true"
            >
              <ng-template ayCelda="persona" let-fila>
                @let f = comoFila(fila);
                <button type="button" class="mo-persona" [class.mo-persona--sel]="seleccion() === f.persona" (click)="seleccionar(f.persona)">
                  <ay-avatar [nombre]="f.persona" size="sm" decorativo />
                  <span class="mo-persona__txt">
                    <strong>{{ f.persona }}</strong>
                    <small>{{ f.detalle.carga }} activos</small>
                  </span>
                </button>
              </ng-template>
              <ng-template ayCelda="area" let-fila>
                {{ area(comoFila(fila).area) }}
              </ng-template>
              @for (e of estadosActivos; track e) {
                <ng-template [ayCelda]="e" let-fila>
                  @let n = cuenta(fila, e);
                  <div class="mo-calor mo-calor--{{ nivel(n) }}">{{ n || '' }}</div>
                </ng-template>
              }
              <ng-template ayCelda="sla" let-fila>
                @let s = slaFila(comoFila(fila).detalle);
                <div class="mo-barra" role="img" [attr.aria-label]="textoSla(comoFila(fila))">
                  @if (s.ok > 0) { <span class="mo-barra__ok" [style.flex-grow]="s.ok"></span> }
                  @if (s.riesgo > 0) { <span class="mo-barra__riesgo" [style.flex-grow]="s.riesgo"></span> }
                  @if (s.vencido > 0) { <span class="mo-barra__vencido" [style.flex-grow]="s.vencido"></span> }
                </div>
              </ng-template>
              <ng-template ayCelda="fecha" let-fila>
                {{ haceDesde(comoFila(fila).fecha) }}
              </ng-template>
            </ay-table>

            @if (filaSeleccionada(); as fs) {
              <div class="mo-detalle">
                <strong>Tickets de {{ fs.nombre }}</strong>
                <ul class="mo-lista">
                  @for (t of activosDe(fs); track t.num) {
                    <li>
                      <button type="button" class="mo-enlace" (click)="seleccionarTicket.emit(t.num)">{{ t.num }}</button>
                      <span class="mo-lista__txt">{{ t.cli }} · {{ t.summary }}</span>
                      <ay-badge size="sm" tono="neutral">{{ estadoEs(t.state) }}</ay-badge>
                      <ay-badge size="sm" [tono]="sla(t).tono">{{ sla(t).txt }}</ay-badge>
                    </li>
                  }
                </ul>
              </div>
            }
          </ay-card-body>
        </ay-card>

        <aside>
          <ay-card superficie="solid">
            <ay-card-body padding="md" gap="sm">
              <strong>Próximos a vencer</strong>
              <ul class="mo-lista">
                @for (p of proximos(); track p.t.num) {
                  <li>
                    <button type="button" class="mo-enlace" (click)="seleccionarTicket.emit(p.t.num)">{{ p.t.num }}</button>
                    <span class="mo-lista__txt">{{ p.t.owner ?? 'Sin asignar' }}</span>
                    <ay-badge size="sm" [tono]="p.tono">{{ p.restante }}</ay-badge>
                  </li>
                } @empty {
                  <li class="mo-vacio">No hay tickets activos con plazo.</li>
                }
              </ul>
            </ay-card-body>
          </ay-card>
        </aside>
      </div>
    </div>
  `,
  styles: `
    .mo { display: flex; flex-direction: column; gap: var(--aybar-space-4); }
    .mo-dos { display: flex; flex-direction: column; gap: var(--aybar-space-4); }
    .mo-resumen { display: flex; flex-direction: column; gap: var(--aybar-space-4); padding: var(--aybar-space-4); border: var(--aybar-border-width-thin) solid var(--aybar-color-border-subtle); border-radius: var(--aybar-radius-xl); background: var(--aybar-color-bg-surface); }
    .mo-cifras { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: var(--aybar-space-3); }
    .mo-cifra { display: flex; flex-direction: column; align-items: flex-start; gap: var(--aybar-space-2); min-inline-size: 0; padding: var(--aybar-space-3) var(--aybar-space-4); border: var(--aybar-border-width-thin) solid var(--aybar-color-border-subtle); border-radius: var(--aybar-radius-lg); background: var(--aybar-color-bg-surface); }
    .mo-cifra__icono { display: inline-flex; padding: var(--aybar-space-2); border-radius: var(--aybar-radius-md); background: var(--aybar-color-bg-surface-sunken); color: var(--aybar-color-fg-muted); }
    .mo-cifra__ctx { margin-block-start: calc(var(--aybar-space-1) * -1); font-size: var(--aybar-font-size-xs); color: var(--aybar-color-fg-muted); overflow-wrap: anywhere; }
    .mo-cifra--warning { border-color: var(--aybar-color-feedback-warning-border); }
    .mo-cifra--warning .mo-cifra__icono { background: var(--aybar-color-feedback-warning-bg); color: var(--aybar-color-feedback-warning-fg); }
    .mo-cifra--danger { border-color: var(--aybar-color-feedback-danger-border); }
    .mo-cifra--danger .mo-cifra__icono { background: var(--aybar-color-feedback-danger-bg); color: var(--aybar-color-feedback-danger-fg); }
    .mo-sla { display: flex; flex-direction: column; gap: var(--aybar-space-2); padding-block-start: var(--aybar-space-4); border-block-start: var(--aybar-border-width-thin) solid var(--aybar-color-border-subtle); }
    .mo-sla__cab { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: var(--aybar-space-2); }
    .mo-sla__pct { font-size: var(--aybar-font-size-xl); font-weight: var(--aybar-font-weight-bold); }
    .mo-cab { display: flex; flex-direction: column; gap: var(--aybar-space-1); }
    .mo-persona { display: flex; align-items: center; gap: var(--aybar-space-2); padding: 0; border: 0; background: transparent; color: inherit; font: inherit; text-align: start; cursor: pointer; white-space: nowrap; }
    .mo-persona--sel strong { text-decoration: underline; }
    .mo-persona__txt { display: flex; flex-direction: column; }
    .mo-persona__txt small { color: var(--aybar-color-fg-muted); }
    .mo-calor { min-inline-size: 2rem; padding: var(--aybar-space-1) var(--aybar-space-2); border-radius: var(--aybar-radius-md); text-align: center; font-weight: var(--aybar-font-weight-bold); }
    .mo-calor--1 { background: color-mix(in srgb, var(--aybar-color-bg-brand) 12%, transparent); }
    .mo-calor--2 { background: color-mix(in srgb, var(--aybar-color-bg-brand) 28%, transparent); }
    .mo-calor--3 { background: color-mix(in srgb, var(--aybar-color-bg-brand) 48%, transparent); }
    .mo-barra { display: flex; gap: 2px; block-size: 0.625rem; min-inline-size: 7rem; border-radius: var(--aybar-radius-full); overflow: hidden; background: var(--aybar-color-border-subtle); }
    .mo-barra--alta { block-size: 1rem; }
    .mo-barra__ok { background: var(--aybar-color-feedback-success-border); flex-basis: 0; }
    .mo-barra__riesgo { background: var(--aybar-color-feedback-warning-border); flex-basis: 0; }
    .mo-barra__vencido { background: var(--aybar-color-feedback-danger-border); flex-basis: 0; }
    .mo-leyenda { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: var(--aybar-space-4); font-size: var(--aybar-font-size-xs); color: var(--aybar-color-fg-muted); }
    .mo-leyenda li { display: inline-flex; align-items: center; gap: var(--aybar-space-1); }
    .mo-muestra { display: inline-block; inline-size: 0.75rem; block-size: 0.75rem; border-radius: var(--aybar-radius-full); flex: none; }
    .mo-detalle { display: flex; flex-direction: column; gap: var(--aybar-space-2); padding: var(--aybar-space-3) var(--aybar-space-4); border-radius: var(--aybar-radius-lg); background: var(--aybar-color-bg-surface-sunken); }
    .mo-lista { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--aybar-space-2); }
    .mo-lista li { display: flex; align-items: center; gap: var(--aybar-space-2); font-size: var(--aybar-font-size-sm); }
    .mo-lista__txt { flex: 1; min-inline-size: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--aybar-color-fg-muted); }
    .mo-enlace { padding: 0; border: 0; background: transparent; color: var(--aybar-color-fg-link, inherit); font-family: var(--aybar-family-mono); font-size: var(--aybar-font-size-xs); text-decoration: underline; cursor: pointer; }
    .mo-vacio { color: var(--aybar-color-fg-muted); font-size: var(--aybar-font-size-sm); }
    @media (max-width: 70rem) { .mo-cifras { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
    @media (max-width: 40rem) { .mo-cifras { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  `,
})
export class MonitorOperacionComponent {
  readonly tickets = input<readonly TicketAtc[]>([]);
  readonly seleccionarTicket = output<string>();

  protected readonly estadosActivos = ESTADOS_ACTIVOS;
  protected readonly seleccion = signal<string | null>(null);
  protected readonly orden = signal<AyOrden | undefined>(undefined);

  protected readonly columnas: AyColumna[] = [
    { clave: 'persona', cabecera: 'Persona', ordenable: true },
    { clave: 'area', cabecera: 'Área', ordenable: true },
    { clave: 'sla', cabecera: 'SLA', ancho: '9rem' },
    ...ESTADOS_ACTIVOS.map((e) => ({
      clave: e,
      cabecera: CABECERA_ESTADO[e],
      alineacion: 'end' as const,
      ancho: '6.5rem',
    })),
    { clave: 'fecha', cabecera: 'Últ. movimiento', ordenable: true },
  ];

  private readonly activos = computed(() => this.tickets().filter((t) => !cerrado(t)));
  protected readonly slaGlobal = computed(() => slaDe(this.tickets()));

  /** Una fila por persona (y «Sin asignar»), ordenada por vencidos y en riesgo. */
  private readonly filasPersona = computed<readonly FilaPersona[]>(() =>
    agruparPorResponsable(this.tickets(), '', 'riesgo')
      .filter((f) => f.carga > 0)
      .map((f) => ({
        persona: f.nombre,
        area: f.area,
        OPEN: f.porEstado['OPEN'] ?? 0,
        IN_PROGRESS: f.porEstado['IN_PROGRESS'] ?? 0,
        PENDING_CUSTOMER: f.porEstado['PENDING_CUSTOMER'] ?? 0,
        ESCALATED: f.porEstado['ESCALATED'] ?? 0,
        IN_COMMITTEE: f.porEstado['IN_COMMITTEE'] ?? 0,
        REOPENED: f.porEstado['REOPENED'] ?? 0,
        sla: peorSla(slaDe(f.tickets)),
        fecha: f.ultimoMovimiento,
        detalle: f,
      })),
  );

  protected readonly filtros = crearFiltrosTabla<FilaPersona>(
    this.filasPersona,
    {
      clave: 'monitor-personas',
      etiquetaElemento: 'personas',
      etiquetaBusqueda: 'Buscar persona o área',
      placeholderBusqueda: 'Nombre de la persona o área…',
      textoDe: (f) => `${f.persona} ${AREA_ES[f.area] ?? f.area}`,
      filtros: [
        { id: 'persona', etiqueta: 'Persona', tipo: 'multi', valorDe: (f) => f.persona, conBusqueda: true },
        { id: 'area', etiqueta: 'Área', tipo: 'multi', valorDe: (f) => f.area, etiquetaDe: (v) => AREA_ES[v] ?? v },
        {
          id: 'sla',
          etiqueta: 'SLA',
          tipo: 'multi',
          valorDe: (f) => f.sla,
          opciones: [
            { valor: 'danger', etiqueta: 'Con tickets vencidos' },
            { valor: 'warning', etiqueta: 'Con tickets en riesgo' },
            { valor: 'success', etiqueta: 'Todo en plazo' },
          ],
        },
      ],
    },
    inject(EstadoFiltrosTablas),
  );

  protected readonly cifras = computed<Cifra[]>(() => {
    const s = this.slaGlobal();
    const personas = this.filasPersona().filter((f) => f.detalle.owner !== null);
    const asignados = this.activos().filter((t) => t.owner).length;
    const n = this.activos().length;
    const sin = n - asignados;
    const deActivos = (x: number): string => (n ? `${Math.round((x / n) * 100)} % de los activos` : 'Sin tickets activos');
    return [
      { id: 'activos', etiqueta: 'Tickets activos', valor: String(n), icono: 'list', tono: 'neutral', contexto: `de ${this.tickets().length} tickets en total` },
      { id: 'riesgo', etiqueta: 'En riesgo (<25 % del plazo)', valor: String(s.riesgo), icono: 'clock', tono: s.riesgo ? 'warning' : 'neutral', contexto: deActivos(s.riesgo) },
      { id: 'vencidos', etiqueta: 'Vencidos', valor: String(s.vencido), icono: 'alert-octagon', tono: s.vencido ? 'danger' : 'neutral', contexto: deActivos(s.vencido) },
      { id: 'sin', etiqueta: 'Sin asignar', valor: String(sin), icono: 'user', tono: sin ? 'warning' : 'neutral', contexto: sin ? 'sin responsable' : 'Todos asignados' },
      { id: 'media', etiqueta: 'Carga media por persona', valor: (personas.length ? asignados / personas.length : 0).toFixed(1), icono: 'grid', tono: 'neutral', contexto: `${personas.length} personas con tickets` },
    ];
  });

  protected readonly slaTexto = computed(() => {
    const s = this.slaGlobal();
    const total = s.ok + s.riesgo + s.vencido;
    return total ? `${Math.round((s.ok / total) * 100)} % en plazo` : 'Sin tickets activos';
  });

  protected readonly proximos = computed(() =>
    this.activos()
      .map((t) => ({ t, s: evaluarSlaTicket(t) }))
      .filter((x) => x.s.due)
      .sort((a, b) => a.s.due!.getTime() - b.s.due!.getTime())
      .slice(0, 8)
      .map((x) => ({ t: x.t, tono: x.s.tono as Tono, restante: tiempoRestanteTexto(x.s.due!) })),
  );

  protected readonly filaSeleccionada = computed(
    () => this.filasPersona().find((f) => f.persona === this.seleccion())?.detalle ?? null,
  );

  protected pct(x: number): string {
    const g = this.slaGlobal();
    const total = g.ok + g.riesgo + g.vencido;
    return total ? `${Math.round((x / total) * 100)} %` : '0 %';
  }
  protected comoFila(f: unknown): FilaPersona {
    return f as FilaPersona;
  }
  protected cuenta(f: unknown, estado: (typeof ESTADOS_ACTIVOS)[number]): number {
    return (f as FilaPersona)[estado];
  }
  protected seleccionar(persona: string): void {
    this.seleccion.update((s) => (s === persona ? null : persona));
  }
  protected activosDe(f: FilaResponsable): TicketAtc[] {
    return f.tickets.filter((t) => !cerrado(t));
  }
  protected slaFila(f: FilaResponsable): Sla {
    return slaDe(f.tickets);
  }
  protected textoSla(f: FilaPersona): string {
    const s = slaDe(f.detalle.tickets);
    return `${f.persona}: en plazo ${s.ok}, en riesgo ${s.riesgo}, vencidos ${s.vencido}`;
  }
  protected nivel(n: number): 0 | 1 | 2 | 3 {
    return !n ? 0 : n >= 3 ? 3 : n === 2 ? 2 : 1;
  }
  protected sla(t: TicketAtc): { tono: Tono; txt: string } {
    return evaluarSlaTicket(t);
  }
  protected area(a: string): string {
    return nombreArea(a);
  }
  protected estadoEs(e: string): string {
    return ESTADO_ES[e] ?? e;
  }
  protected haceDesde(f: Date | null): string {
    return textoHaceDesde(f);
  }
}
