import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  AyAvatar,
  AyBadge,
  AyButton,
  AyPageHeader,
  AySegmentedControl,
  AyStatGroup,
  AyTabs,
  AyText,
  type AySegmentoOpcion,
  type AyStatItem,
  type AyTabsElemento,
} from '@aybarcorp/ui-angular';
import {
  AREAS_ATC,
  ESTADO_ES,
  crearTicketsDemo,
  evaluarSlaTicket,
  tiempoRestanteTexto,
  type TicketAtc,
} from '../datos-atc';
import { nombreArea } from '../etiquetas-es';
import { agruparPorResponsable, textoHaceDesde, type FilaResponsable } from '../indicadores-responsables';

type Propuesta = 'matriz' | 'areas' | 'tv';
type Tono = 'success' | 'warning' | 'danger';

interface Sla {
  ok: number;
  riesgo: number;
  vencido: number;
}

/** Estados en los que un ticket sigue abierto, en el orden de las columnas de la matriz. */
const ESTADOS_ACTIVOS = ['OPEN', 'IN_PROGRESS', 'PENDING_CUSTOMER', 'ESCALATED', 'IN_COMMITTEE', 'REOPENED'] as const;

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

/**
 * Propuestas del Monitor de Operación en Vivo: la vista macro de tickets por persona, estado de atención
 * y SLA. Página aislada (`/propuestas-monitor`): no toca la consola. Datos de los tickets demo.
 * Solo componentes de @aybarcorp/ui-angular y tokens `--aybar-*`.
 */
@Component({
  selector: 'app-vista-propuestas-monitor',
  standalone: true,
  imports: [AyAvatar, AyBadge, AyButton, AyPageHeader, AySegmentedControl, AyStatGroup, AyTabs, AyText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="vm-selector" aria-label="Propuesta del Monitor">
      <ay-segmented-control etiqueta="Propuesta" size="sm" [opciones]="propuestas" [valor]="activa()" (valorChange)="elegir($event)" />
      <span ayText="body" size="xs">{{ descripciones[activa()] }}</span>
    </nav>

    <main class="vm-pagina">
      <ay-page-header
        [conPestanas]="true"
        titulo="Operación en Vivo · Monitor"
        descripcion="Vista macro: cuántos tickets tiene cada persona, en qué estado de atención están y cómo va el SLA."
      >
        <ay-tabs ayPestanas etiqueta="Vistas de Operación en Vivo" variante="underline" [items]="pestanas" valor="monitor" />
      </ay-page-header>

      @switch (activa()) {
        @case ('matriz') {
          <ay-stat-group size="md" [filete]="true" [elementos]="cifras()" />

          <div class="vm-dos">
            <section class="vm-caja" aria-label="Carga por persona">
              <header class="vm-caja__cab">
                <strong>Carga por persona</strong>
                <span ayText="body" size="xs">Ordenado por vencidos y en riesgo. Pulsa una fila para ver sus tickets.</span>
              </header>
              <div class="vm-tabla-marco">
                <table class="vm-tabla">
                  <thead>
                    <tr>
                      <th scope="col">Persona</th>
                      @for (e of estadosActivos; track e) {
                        <th scope="col" class="vm-num">{{ estadoEs(e) }}</th>
                      }
                      <th scope="col" class="vm-sla-col">SLA de sus tickets</th>
                      <th scope="col">Último movimiento</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (f of filas(); track f.nombre) {
                      <tr class="vm-fila" [class.vm-fila--sel]="seleccion() === f.nombre" [class.vm-fila--sin]="f.owner === null" (click)="seleccionar(f.nombre)">
                        <th scope="row">
                          <span class="vm-persona">
                            <ay-avatar [nombre]="f.nombre" size="sm" decorativo />
                            <span class="vm-persona__txt">
                              <strong>{{ f.nombre }}</strong>
                              <small>{{ area(f.area) }} · {{ f.carga }} activos</small>
                            </span>
                          </span>
                        </th>
                        @for (e of estadosActivos; track e) {
                          <td class="vm-num vm-calor vm-calor--{{ nivel(f.porEstado[e]) }}">{{ f.porEstado[e] || '' }}</td>
                        }
                        <td class="vm-sla-col">
                          <div class="vm-barra" role="img" [attr.aria-label]="textoSla(f)">
                            @if (slaFila(f).ok > 0) { <span class="vm-barra__ok" [style.flex-grow]="slaFila(f).ok"></span> }
                            @if (slaFila(f).riesgo > 0) { <span class="vm-barra__riesgo" [style.flex-grow]="slaFila(f).riesgo"></span> }
                            @if (slaFila(f).vencido > 0) { <span class="vm-barra__vencido" [style.flex-grow]="slaFila(f).vencido"></span> }
                          </div>
                        </td>
                        <td>{{ haceDesde(f.ultimoMovimiento) }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
              @if (filaSeleccionada(); as fs) {
                <div class="vm-detalle">
                  <strong>Tickets de {{ fs.nombre }}</strong>
                  <ul class="vm-lista">
                    @for (t of activosDe(fs); track t.num) {
                      <li>
                        <span class="vm-lista__id">{{ t.num }}</span>
                        <span class="vm-lista__txt">{{ t.cli }} · {{ t.summary }}</span>
                        <ay-badge size="sm" tono="neutral">{{ estadoEs(t.state) }}</ay-badge>
                        <ay-badge size="sm" [tono]="sla(t).tono">{{ sla(t).txt }}</ay-badge>
                      </li>
                    }
                  </ul>
                </div>
              }
            </section>

            <aside class="vm-lateral">
              <section class="vm-caja" aria-label="SLA global">
                <header class="vm-caja__cab"><strong>SLA global</strong></header>
                <div class="vm-bloque">
                  <div class="vm-barra vm-barra--alta" role="img" [attr.aria-label]="'En plazo ' + slaGlobal().ok + ', en riesgo ' + slaGlobal().riesgo + ', vencidos ' + slaGlobal().vencido">
                    <span class="vm-barra__ok" [style.flex-grow]="slaGlobal().ok"></span>
                    <span class="vm-barra__riesgo" [style.flex-grow]="slaGlobal().riesgo"></span>
                    <span class="vm-barra__vencido" [style.flex-grow]="slaGlobal().vencido"></span>
                  </div>
                  <ul class="vm-leyenda">
                    <li><span class="vm-muestra vm-barra__ok"></span>En plazo {{ slaGlobal().ok }}</li>
                    <li><span class="vm-muestra vm-barra__riesgo"></span>En riesgo {{ slaGlobal().riesgo }}</li>
                    <li><span class="vm-muestra vm-barra__vencido"></span>Vencidos {{ slaGlobal().vencido }}</li>
                  </ul>
                </div>
              </section>

              <section class="vm-caja" aria-label="Próximos a vencer">
                <header class="vm-caja__cab"><strong>Próximos a vencer</strong></header>
                <ul class="vm-lista vm-lista--lateral">
                  @for (p of proximos(); track p.t.num) {
                    <li>
                      <span class="vm-lista__id">{{ p.t.num }}</span>
                      <span class="vm-lista__txt">{{ p.t.owner ?? 'Sin asignar' }}</span>
                      <ay-badge size="sm" [tono]="p.tono">{{ p.restante }}</ay-badge>
                      <ay-button tamano="sm" variante="ghost">Reasignar</ay-button>
                    </li>
                  }
                </ul>
              </section>
            </aside>
          </div>

          <section class="vm-terminal" aria-label="Terminal en línea">
            <header class="vm-terminal__cab">
              <span class="vm-led"></span>
              <strong>TERMINAL EN LÍNEA · FLUJO EN VIVO</strong>
            </header>
            <div class="vm-terminal__cuerpo">
              <div class="vm-areas">
                @for (a of porAreaResumen(); track a.area) {
                  <div class="vm-area">
                    <strong>{{ area(a.area) }}</strong>
                    <span>{{ a.activos }} activos</span>
                    @if (a.vencidos > 0) { <ay-badge size="sm" tono="danger">{{ a.vencidos }} venc.</ay-badge> }
                    @else if (a.riesgo > 0) { <ay-badge size="sm" tono="warning">{{ a.riesgo }} riesgo</ay-badge> }
                    @else { <ay-badge size="sm" tono="success">En plazo</ay-badge> }
                  </div>
                }
              </div>
              <ul class="vm-eventos" aria-label="Últimos movimientos">
                @for (ev of eventos(); track ev.id) {
                  <li><time>{{ haceDesde(ev.fecha) }}</time> {{ ev.texto }}</li>
                }
              </ul>
            </div>
          </section>
        }

        @case ('areas') {
          <ay-stat-group size="md" [filete]="true" [elementos]="cifras()" />

          <div class="vm-grilla-areas">
            @for (a of porArea(); track a.area) {
              <section class="vm-caja" [attr.aria-label]="'Área ' + area(a.area)">
                <header class="vm-caja__cab vm-caja__cab--fila">
                  <span class="vm-area-titulo"><span class="vm-led"></span><strong>{{ area(a.area) }}</strong></span>
                  <span class="vm-chips">
                    <ay-badge size="sm" tono="neutral">{{ a.activos }} activos</ay-badge>
                    @if (a.sla.vencido > 0) { <ay-badge size="sm" tono="danger">{{ a.sla.vencido }} vencidos</ay-badge> }
                    @if (a.sla.riesgo > 0) { <ay-badge size="sm" tono="warning">{{ a.sla.riesgo }} en riesgo</ay-badge> }
                  </span>
                </header>
                <div class="vm-barra vm-barra--cab" role="img" [attr.aria-label]="'SLA del área ' + area(a.area)">
                  @if (a.sla.ok > 0) { <span class="vm-barra__ok" [style.flex-grow]="a.sla.ok"></span> }
                  @if (a.sla.riesgo > 0) { <span class="vm-barra__riesgo" [style.flex-grow]="a.sla.riesgo"></span> }
                  @if (a.sla.vencido > 0) { <span class="vm-barra__vencido" [style.flex-grow]="a.sla.vencido"></span> }
                </div>
                <ul class="vm-puestos">
                  @for (f of a.filas; track f.nombre) {
                    <li class="vm-puesto" [class.vm-puesto--sin]="f.owner === null">
                      <ay-avatar [nombre]="f.nombre" size="sm" decorativo />
                      <span class="vm-puesto__txt">
                        <strong>{{ f.nombre }}</strong>
                        <small>{{ resumenEstados(f) }}</small>
                      </span>
                      <span class="vm-puesto__carga">{{ f.carga }}</span>
                      <div class="vm-barra vm-barra--mini" role="img" [attr.aria-label]="textoSla(f)">
                        @if (slaFila(f).ok > 0) { <span class="vm-barra__ok" [style.flex-grow]="slaFila(f).ok"></span> }
                        @if (slaFila(f).riesgo > 0) { <span class="vm-barra__riesgo" [style.flex-grow]="slaFila(f).riesgo"></span> }
                        @if (slaFila(f).vencido > 0) { <span class="vm-barra__vencido" [style.flex-grow]="slaFila(f).vencido"></span> }
                      </div>
                    </li>
                  } @empty {
                    <li class="vm-vacio">Sin tickets activos en esta área.</li>
                  }
                </ul>
              </section>
            }
          </div>
        }

        @case ('tv') {
          <div class="vm-tv">
            <ay-stat-group size="lg" [filete]="true" [elementos]="cifrasTv()" />

            <div class="vm-dos vm-dos--tv">
              <section class="vm-caja" aria-label="Ranking de carga por persona">
                <header class="vm-caja__cab"><strong>Carga por persona</strong></header>
                <ol class="vm-ranking">
                  @for (f of filas(); track f.nombre) {
                    <li>
                      <span class="vm-ranking__nombre">{{ f.nombre }}</span>
                      <div class="vm-ranking__pista">
                        <div class="vm-barra vm-barra--tv" [style.inline-size.%]="(f.carga / maxCarga()) * 100" role="img" [attr.aria-label]="textoSla(f)">
                          @if (slaFila(f).ok > 0) { <span class="vm-barra__ok" [style.flex-grow]="slaFila(f).ok"></span> }
                          @if (slaFila(f).riesgo > 0) { <span class="vm-barra__riesgo" [style.flex-grow]="slaFila(f).riesgo"></span> }
                          @if (slaFila(f).vencido > 0) { <span class="vm-barra__vencido" [style.flex-grow]="slaFila(f).vencido"></span> }
                        </div>
                      </div>
                      <strong class="vm-ranking__n">{{ f.carga }}</strong>
                    </li>
                  }
                </ol>
              </section>

              <section class="vm-caja" aria-label="Próximos a vencer">
                <header class="vm-caja__cab"><strong>Próximos a vencer</strong></header>
                <ul class="vm-lista vm-lista--tv">
                  @for (p of proximos(); track p.t.num) {
                    <li>
                      <span class="vm-lista__id">{{ p.t.num }}</span>
                      <span class="vm-lista__txt">{{ p.t.owner ?? 'Sin asignar' }} · {{ area(p.t.area) }}</span>
                      <ay-badge size="md" [tono]="p.tono">{{ p.restante }}</ay-badge>
                    </li>
                  }
                </ul>
              </section>
            </div>
            <p class="vm-pie" ayText="body" size="xs">Corte: {{ corte }} · pensado para una pantalla fija en la sala</p>
          </div>
        }
      }
    </main>
  `,
  styles: `
    .vm-selector { position: sticky; top: 0; z-index: 10; display: flex; flex-wrap: wrap; align-items: center; gap: var(--aybar-space-4); padding: var(--aybar-space-3) var(--aybar-space-6); border-bottom: var(--aybar-border-width-thin) solid var(--aybar-color-border-subtle); background: var(--aybar-color-bg-surface); }
    .vm-pagina { display: flex; flex-direction: column; gap: var(--aybar-space-4); padding: var(--aybar-space-6); max-width: 112rem; margin: 0 auto; }
    .vm-dos { display: grid; grid-template-columns: minmax(0, 1fr) 24rem; gap: var(--aybar-space-4); align-items: start; }
    .vm-dos--tv { grid-template-columns: minmax(0, 3fr) minmax(0, 2fr); }
    .vm-lateral { display: flex; flex-direction: column; gap: var(--aybar-space-4); }
    .vm-caja { display: flex; flex-direction: column; border: var(--aybar-border-width-thin) solid var(--aybar-color-border-subtle); border-radius: var(--aybar-radius-xl); background: var(--aybar-color-bg-surface); overflow: hidden; }
    .vm-caja__cab { display: flex; flex-direction: column; gap: var(--aybar-space-1); padding: var(--aybar-space-3) var(--aybar-space-4); border-bottom: var(--aybar-border-width-thin) solid var(--aybar-color-border-subtle); }
    .vm-caja__cab--fila { flex-direction: row; flex-wrap: wrap; align-items: center; justify-content: space-between; }
    .vm-tabla-marco { overflow-x: auto; }
    .vm-tabla { inline-size: 100%; border-collapse: collapse; font-size: var(--aybar-font-size-sm); }
    .vm-tabla th, .vm-tabla td { padding: var(--aybar-space-2) var(--aybar-space-3); border-bottom: var(--aybar-border-width-thin) solid var(--aybar-color-border-subtle); text-align: start; vertical-align: middle; }
    .vm-tabla thead th { font-size: var(--aybar-font-size-xs); color: var(--aybar-color-fg-muted); font-weight: var(--aybar-font-weight-semibold); }
    .vm-num { text-align: center !important; inline-size: 5.5rem; }
    .vm-sla-col { inline-size: 12rem; }
    .vm-fila { cursor: pointer; }
    .vm-fila:hover, .vm-fila--sel { background: var(--aybar-color-bg-surface-sunken); }
    .vm-fila--sin { background: var(--aybar-color-feedback-warning-bg); }
    .vm-persona { display: flex; align-items: center; gap: var(--aybar-space-2); }
    .vm-persona__txt { display: flex; flex-direction: column; }
    .vm-tabla th[scope='row'] { min-inline-size: 15rem; }
    .vm-persona__txt { white-space: nowrap; }
    .vm-persona__txt small { color: var(--aybar-color-fg-muted); font-weight: var(--aybar-font-weight-regular); }
    .vm-calor { font-weight: var(--aybar-font-weight-bold); }
    .vm-calor--1 { background: color-mix(in srgb, var(--aybar-color-bg-brand) 12%, transparent); }
    .vm-calor--2 { background: color-mix(in srgb, var(--aybar-color-bg-brand) 28%, transparent); }
    .vm-calor--3 { background: color-mix(in srgb, var(--aybar-color-bg-brand) 48%, transparent); color: var(--aybar-color-fg-on-brand, inherit); }
    .vm-barra { display: flex; gap: 2px; block-size: 0.625rem; border-radius: var(--aybar-radius-full); overflow: hidden; background: var(--aybar-color-border-subtle); }
    .vm-barra--alta { block-size: 1rem; }
    .vm-barra--cab { margin: var(--aybar-space-3) var(--aybar-space-4) 0; }
    .vm-barra--mini { inline-size: 5rem; }
    .vm-barra--tv { block-size: 1.5rem; min-inline-size: 2rem; }
    .vm-barra__ok { background: var(--aybar-color-feedback-success-border); flex-basis: 0; }
    .vm-barra__riesgo { background: var(--aybar-color-feedback-warning-border); flex-basis: 0; }
    .vm-barra__vencido { background: var(--aybar-color-feedback-danger-border); flex-basis: 0; }
    .vm-bloque { display: flex; flex-direction: column; gap: var(--aybar-space-3); padding: var(--aybar-space-4); }
    .vm-leyenda { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: var(--aybar-space-4); font-size: var(--aybar-font-size-xs); color: var(--aybar-color-fg-muted); }
    .vm-leyenda li { display: inline-flex; align-items: center; gap: var(--aybar-space-1); }
    .vm-muestra { display: inline-block; inline-size: 0.75rem; block-size: 0.75rem; border-radius: var(--aybar-radius-full); flex: none; }
    .vm-detalle { display: flex; flex-direction: column; gap: var(--aybar-space-2); padding: var(--aybar-space-4); border-top: var(--aybar-border-width-thin) solid var(--aybar-color-border-subtle); background: var(--aybar-color-bg-surface-sunken); }
    .vm-lista { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--aybar-space-2); }
    .vm-lista li { display: flex; align-items: center; gap: var(--aybar-space-2); font-size: var(--aybar-font-size-sm); }
    .vm-lista--lateral, .vm-lista--tv { padding: var(--aybar-space-3) var(--aybar-space-4); }
    .vm-lista__id { font-family: var(--aybar-family-mono); font-size: var(--aybar-font-size-xs); }
    .vm-lista__txt { flex: 1; min-inline-size: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--aybar-color-fg-muted); }
    .vm-lista--tv li { font-size: var(--aybar-font-size-lg); padding: var(--aybar-space-2) 0; border-bottom: var(--aybar-border-width-thin) solid var(--aybar-color-border-subtle); }
    .vm-terminal { border: var(--aybar-border-width-thin) solid var(--aybar-color-border-subtle); border-radius: var(--aybar-radius-xl); background: var(--aybar-color-bg-surface); overflow: hidden; }
    .vm-terminal__cab { display: flex; align-items: center; gap: var(--aybar-space-2); padding: var(--aybar-space-2) var(--aybar-space-4); border-bottom: var(--aybar-border-width-thin) solid var(--aybar-color-border-subtle); font-size: var(--aybar-font-size-xs); letter-spacing: 0.04em; }
    .vm-led { display: inline-block; inline-size: 0.625rem; block-size: 0.625rem; border-radius: var(--aybar-radius-full); background: var(--aybar-color-feedback-success-border); }
    .vm-terminal__cuerpo { display: grid; grid-template-columns: minmax(0, 3fr) minmax(0, 2fr); gap: var(--aybar-space-4); padding: var(--aybar-space-3) var(--aybar-space-4); }
    .vm-areas { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--aybar-space-2); }
    .vm-area { display: flex; flex-direction: column; align-items: flex-start; gap: var(--aybar-space-1); padding: var(--aybar-space-2) var(--aybar-space-3); border: var(--aybar-border-width-thin) solid var(--aybar-color-border-subtle); border-radius: var(--aybar-radius-md); font-size: var(--aybar-font-size-sm); }
    .vm-eventos { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--aybar-space-1); font-family: var(--aybar-family-mono); font-size: var(--aybar-font-size-xs); }
    .vm-eventos time { color: var(--aybar-color-fg-muted); }
    .vm-grilla-areas { display: grid; grid-template-columns: repeat(auto-fill, minmax(24rem, 1fr)); gap: var(--aybar-space-4); }
    .vm-area-titulo { display: inline-flex; align-items: center; gap: var(--aybar-space-2); }
    .vm-chips { display: inline-flex; flex-wrap: wrap; gap: var(--aybar-space-1); }
    .vm-puestos { list-style: none; margin: 0; padding: var(--aybar-space-3) var(--aybar-space-4); display: flex; flex-direction: column; gap: var(--aybar-space-3); }
    .vm-puesto { display: flex; align-items: center; gap: var(--aybar-space-3); }
    .vm-puesto--sin { padding: var(--aybar-space-2); border-radius: var(--aybar-radius-md); background: var(--aybar-color-feedback-warning-bg); }
    .vm-puesto__txt { display: flex; flex-direction: column; flex: 1; min-inline-size: 0; font-size: var(--aybar-font-size-sm); }
    .vm-puesto__txt small { color: var(--aybar-color-fg-muted); }
    .vm-puesto__carga { font-size: var(--aybar-font-size-lg); font-weight: var(--aybar-font-weight-bold); inline-size: 1.5rem; text-align: end; }
    .vm-vacio { color: var(--aybar-color-fg-muted); font-size: var(--aybar-font-size-sm); }
    .vm-tv { display: flex; flex-direction: column; gap: var(--aybar-space-5); }
    .vm-ranking { list-style: none; margin: 0; padding: var(--aybar-space-3) var(--aybar-space-4); display: flex; flex-direction: column; gap: var(--aybar-space-3); }
    .vm-ranking li { display: grid; grid-template-columns: 12rem minmax(0, 1fr) 3rem; align-items: center; gap: var(--aybar-space-3); }
    .vm-ranking__nombre { font-size: var(--aybar-font-size-lg); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .vm-ranking__n { font-size: var(--aybar-font-size-2xl); text-align: end; }
    .vm-pie { align-self: flex-end; margin: 0; }
    @media (max-width: 70rem) {
      .vm-dos, .vm-dos--tv, .vm-terminal__cuerpo { grid-template-columns: minmax(0, 1fr); }
      .vm-areas { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
  `,
})
export class VistaPropuestasMonitor {
  private readonly params = new URLSearchParams(globalThis.location?.search ?? '');
  protected readonly propuestas: AySegmentoOpcion[] = [
    { valor: 'matriz', etiqueta: '1 · Matriz por persona' },
    { valor: 'areas', etiqueta: '2 · Por área y puestos' },
    { valor: 'tv', etiqueta: '3 · Modo TV' },
  ];
  protected readonly descripciones: Readonly<Record<Propuesta, string>> = {
    matriz: 'Persona × estado de atención × SLA, con SLA global, próximos a vencer y el terminal en línea compacto.',
    areas: 'Una tarjeta por área con sus puestos: quién tiene qué carga y cómo va su SLA.',
    tv: 'Cifras y ranking grandes para una pantalla fija en la sala.',
  };
  protected readonly pestanas: AyTabsElemento[] = [
    { value: 'planta', label: 'Planta' },
    { value: 'monitor', label: 'Monitor' },
    { value: 'responsables', label: 'Responsables' },
  ];

  /** `?p=matriz|areas|tv` abre directamente una propuesta. */
  protected readonly activa = signal<Propuesta>(
    (['matriz', 'areas', 'tv'] as const).find((p) => p === this.params.get('p')) ?? 'matriz',
  );
  protected readonly seleccion = signal<string | null>(this.params.get('persona'));

  private readonly tickets = crearTicketsDemo();
  protected readonly estadosActivos = ESTADOS_ACTIVOS;
  protected readonly corte = '19-oct-2026, 10:30';

  protected readonly filas = computed<FilaResponsable[]>(() => agruparPorResponsable(this.tickets, '', 'riesgo'));
  private readonly activos = computed(() => this.tickets.filter((t) => !cerrado(t)));
  protected readonly slaGlobal = computed(() => slaDe(this.tickets));
  protected readonly maxCarga = computed(() => Math.max(1, ...this.filas().map((f) => f.carga)));

  protected readonly cifras = computed<AyStatItem[]>(() => {
    const s = this.slaGlobal();
    const personas = this.filas().filter((f) => f.owner !== null && f.carga > 0);
    const media = personas.length ? this.activos().filter((t) => t.owner).length / personas.length : 0;
    return [
      { id: 'activos', etiqueta: 'Tickets activos', valor: String(this.activos().length) },
      { id: 'riesgo', etiqueta: 'En riesgo (<25 % del plazo)', valor: String(s.riesgo) },
      { id: 'vencidos', etiqueta: 'Vencidos', valor: String(s.vencido) },
      { id: 'sin', etiqueta: 'Sin asignar', valor: String(this.activos().filter((t) => !t.owner).length) },
      { id: 'media', etiqueta: 'Carga media por persona', valor: media.toFixed(1) },
    ];
  });
  protected readonly cifrasTv = computed<AyStatItem[]>(() => this.cifras().slice(0, 4));

  protected readonly proximos = computed(() =>
    this.activos()
      .map((t) => ({ t, s: evaluarSlaTicket(t) }))
      .filter((x) => x.s.due)
      .sort((a, b) => a.s.due!.getTime() - b.s.due!.getTime())
      .slice(0, 8)
      .map((x) => ({ t: x.t, tono: x.s.tono as Tono, restante: tiempoRestanteTexto(x.s.due!) })),
  );

  protected readonly filaSeleccionada = computed(() => this.filas().find((f) => f.nombre === this.seleccion()) ?? null);

  protected readonly porAreaResumen = computed(() =>
    AREAS_ATC.map((a) => {
      const ts = this.activos().filter((t) => t.area === a);
      const s = slaDe(ts);
      return { area: a, activos: ts.length, riesgo: s.riesgo, vencidos: s.vencido };
    }),
  );

  protected readonly porArea = computed(() =>
    AREAS_ATC.map((a) => {
      const filas = agruparPorResponsable(this.tickets, a, 'riesgo').filter((f) => f.carga > 0);
      return { area: a, filas, activos: filas.reduce((n, f) => n + f.carga, 0), sla: slaDe(this.activos().filter((t) => t.area === a)) };
    }),
  );

  /** Últimos movimientos de derivación de todos los tickets, del más reciente al más antiguo. */
  protected readonly eventos = computed(() =>
    this.tickets
      .flatMap((t) =>
        t.log.map((l, i) => ({
          id: `${t.num}-${i}`,
          fecha: l.fecha,
          texto: `${t.num} · pasó a ${nombreArea(l.area)}${l.responsable ? ` · ${l.responsable}` : ''}`,
        })),
      )
      .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
      .slice(0, 6),
  );

  protected elegir(v: string): void {
    if (v === 'matriz' || v === 'areas' || v === 'tv') this.activa.set(v);
  }
  protected seleccionar(nombre: string): void {
    this.seleccion.update((s) => (s === nombre ? null : nombre));
  }
  protected activosDe(f: FilaResponsable): TicketAtc[] {
    return f.tickets.filter((t) => !cerrado(t));
  }
  protected slaFila(f: FilaResponsable): Sla {
    return slaDe(f.tickets);
  }
  protected textoSla(f: FilaResponsable): string {
    const s = slaDe(f.tickets);
    return `${f.nombre}: en plazo ${s.ok}, en riesgo ${s.riesgo}, vencidos ${s.vencido}`;
  }
  protected resumenEstados(f: FilaResponsable): string {
    const t = ESTADOS_ACTIVOS.filter((e) => f.porEstado[e]).map((e) => `${f.porEstado[e]} ${ESTADO_ES[e]?.toLowerCase()}`);
    return t.length ? t.join(' · ') : 'Sin tickets activos';
  }
  protected nivel(n: number | undefined): 0 | 1 | 2 | 3 {
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
