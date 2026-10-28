import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
} from '@angular/core';
import {
  AyAvatar,
  AyBadge,
  AyButton,
  AyIcon,
  AyModal,
  AyText,
  type AyColumna,
} from '@aybarcorp/ui-angular';
import { BarraFiltrosComponent } from './barra-filtros';
import { AREAS_ATC, ESTADO_ES, evaluarSlaTicket, type TicketAtc } from './datos-atc';
import { AREA_ES, nombreArea } from './etiquetas-es';
import { FiltroColumnasTablaDirective } from './filtro-columnas-tabla';
import { EstadoFiltrosTablas, crearFiltrosTabla } from './filtros-tabla';
import { COLOR_ESTADO } from './indicadores-torre';
import { agruparPorResponsable, type FilaResponsable } from './indicadores-responsables';
import { VacioFiltrosComponent } from './vacio-filtros';

const ESTADOS_SDK = [
  'OPEN',
  'IN_PROGRESS',
  'PENDING_CUSTOMER',
  'ESCALATED',
  'IN_COMMITTEE',
  'REOPENED',
  'RESOLVED',
  'CLOSED',
] as const;

type EstadoSdk = (typeof ESTADOS_SDK)[number];

interface AgenteLinear {
  id: string;
  nombre: string;
  area: string;
  rolTexto: string;
  cargaActiva: number;
  puntosCapacidad: number;
  maxPuntos: number;
  pctUtilizacion: number;
  porEstado: Readonly<Record<EstadoSdk, number>>;
  totalTickets: number;
  slaCounts: {
    breached: number;
    warning: number;
    ok: number;
  };
  peorSla: 'crit' | 'warn' | 'ok';
  masUrgente: TicketEnriquecido | null;
  ticketsRayo: TicketEnriquecido[];
  tickets: TicketEnriquecido[];
}

interface TicketEnriquecido {
  raw: TicketAtc;
  id: string;
  cortoId: string;
  titulo: string;
  cliente: string;
  state: EstadoSdk;
  estadoEtiqueta: string;
  prioridadEtiqueta: 'P1' | 'P2' | 'P3';
  tonoPrioridad: 'danger' | 'warning' | 'neutral';
  slaEstado: 'breached' | 'warning' | 'ok';
  slaTexto: string;
  slaMinutosOrden: number;
  puntos: number;
}

const SPARK_BARS = [65, 80, 55, 70, 45, 40, 35] as const;

function puntosDePrioridad(prio: TicketAtc['prio'], rayo: boolean): number {
  if (rayo || prio === 'URGENT') return 5;
  if (prio === 'HIGH') return 3;
  if (prio === 'MEDIUM') return 2;
  return 1;
}

function enriquecerTicket(t: TicketAtc): TicketEnriquecido {
  const ev = evaluarSlaTicket(t);
  const cerrado = t.state === 'RESOLVED' || t.state === 'CLOSED';
  const slaEstado: 'breached' | 'warning' | 'ok' = cerrado
    ? 'ok'
    : ev.tono === 'danger'
      ? 'breached'
      : ev.tono === 'warning'
        ? 'warning'
        : 'ok';
  const ahoraMs = new Date('2026-10-19T10:30:00-05:00').getTime();
  const slaMinutosOrden = cerrado
    ? 99999
    : ev.due
      ? Math.round((ev.due.getTime() - ahoraMs) / 60000)
      : 9999;
  const partes = t.num.split('-');
  const cortoId = '#' + (partes[partes.length - 1] ?? t.num);
  const prioridadEtiqueta: 'P1' | 'P2' | 'P3' =
    t.rayo || t.prio === 'URGENT' ? 'P1' : t.prio === 'HIGH' ? 'P2' : 'P3';
  const tonoPrioridad: 'danger' | 'warning' | 'neutral' =
    prioridadEtiqueta === 'P1' ? 'danger' : prioridadEtiqueta === 'P2' ? 'warning' : 'neutral';

  return {
    raw: t,
    id: t.num,
    cortoId,
    titulo: t.summary,
    cliente: t.cli,
    state: (ESTADOS_SDK.includes(t.state as EstadoSdk) ? t.state : 'OPEN') as EstadoSdk,
    estadoEtiqueta: ESTADO_ES[t.state] ?? t.state,
    prioridadEtiqueta,
    tonoPrioridad,
    slaEstado,
    slaTexto: cerrado ? 'Cumplido' : ev.txt,
    slaMinutosOrden,
    puntos: puntosDePrioridad(t.prio, t.rayo),
  };
}

/**
 * Vista Monitor de Operación en Vivo — Propuesta 1 (Linear / Vercel Style) con los colores de estado del SDK (`COLOR_ESTADO`).
 */
@Component({
  selector: 'app-monitor-operacion',
  standalone: true,
  imports: [
    AyAvatar,
    AyBadge,
    AyButton,
    AyIcon,
    AyModal,
    AyText,
    BarraFiltrosComponent,
    FiltroColumnasTablaDirective,
    VacioFiltrosComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.p1-pantalla]': 'pantallaCompleta()',
    '(document:fullscreenchange)': 'alCambiarPantalla()',
  },
  template: `
    <div class="p1-wrap">
      <div class="p1-barra-tv">
        <ay-button tamano="sm" variante="secondary" (click)="alternarPantallaCompleta()">
          {{ pantallaCompleta() ? 'Salir de pantalla completa' : 'Pantalla completa' }}
        </ay-button>
      </div>

      <!-- NOTIFICACIÓN TOAST DE BALANCEO DE CARGA -->
      @if (avisoBalanceo(); as av) {
        <div class="p1-toast" role="status">
          <span>
            <strong>Balanceo de carga ejecutado:</strong> El ticket
            <b class="p1-mono">{{ av.ticketId }}</b> fue transferido de
            <strong>{{ av.desde }}</strong> hacia <strong>{{ av.hacia }}</strong> (menor saturación).
          </span>
          <ay-button tamano="sm" variante="ghost" (click)="avisoBalanceo.set(null)">Cerrar</ay-button>
        </div>
      }

      <!-- =========================================================================
           SECCIÓN 1: ESTADÍSTICAS / MÉTRICAS + SLAs (BENTO DE ALTA DENSIDAD)
           ========================================================================= -->
      <section aria-label="Sección 1: Métricas de Rendimiento y Cumplimiento SLA">
        <div class="p1-sec-head">
          <div class="p1-sec-head__izq">
            <span class="p1-sec-badge">Sección 1</span>
            <strong>Métricas de Rendimiento y Cumplimiento SLA</strong>
          </div>
          <span ayText="body" size="xs">Actualizado en tiempo real · Ventana operativa activa</span>
        </div>

        <div class="p1-bento">
          <!-- Card 1: Cumplimiento SLA con Anillo SVG -->
          <div class="p1-card p1-card--row">
            <div>
              <div class="p1-card__label">
                <ay-icon nombre="shield" size="16" />
                <span>SLA Global Cumplido</span>
              </div>
              <div class="p1-card__val-row" style="margin-block-start: 0.35rem">
                <span class="p1-card__val">{{ kpisBento().slaPct }}%</span>
                <span class="p1-card__delta">↗ +1.8%</span>
              </div>
              <p class="p1-card__sub" style="margin-block-start: 0.25rem">Meta contractual: 95.0%</p>
            </div>
            <div class="p1-ring" aria-hidden="true">
              <svg viewBox="0 0 36 36">
                <path
                  class="p1-ring__bg"
                  stroke-width="3.5"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  class="p1-ring__fg"
                  [attr.stroke-dasharray]="kpisBento().slaPct + ', 100'"
                  stroke-width="3.5"
                  stroke-linecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span class="p1-ring__txt">{{ kpisBento().calificacion }}</span>
            </div>
          </div>

          <!-- Card 2: Tickets en Riesgo / Brecha SLA -->
          <div class="p1-card">
            <div class="p1-card__val-row">
              <span class="p1-card__label">
                <ay-icon nombre="alert-octagon" size="16" />
                <span>En Riesgo / Brecha SLA</span>
              </span>
              <ay-badge size="sm" tono="danger">
                {{ kpisBento().vencidos }} Venc. · {{ kpisBento().enRiesgo }} Riesgo
              </ay-badge>
            </div>
            <div class="p1-card__val-row">
              <div>
                <span class="p1-card__val p1-card__val--danger">
                  {{ kpisBento().vencidos + kpisBento().enRiesgo }}
                </span>
                <span class="p1-card__sub" style="margin-inline-start: 0.35rem">tickets críticos</span>
              </div>
              <div class="p1-sla-pills">
                @for (u of kpisBento().topUrgentes; track u.id) {
                  <button
                    type="button"
                    class="p1-sla-pill p1-sla-pill--{{ u.slaEstado === 'breached' ? 'crit' : 'warn' }}"
                    style="border: 0; cursor: pointer"
                    (click)="seleccionarTicket.emit(u.id)"
                  >
                    {{ u.cortoId }}
                  </button>
                }
              </div>
            </div>
            <p class="p1-card__sub">{{ kpisBento().resumenConcentracion }}</p>
          </div>

          <!-- Card 3: MTTR (Tiempo Medio de Resolución) -->
          <div class="p1-card">
            <div class="p1-card__val-row">
              <span class="p1-card__label">
                <ay-icon nombre="clock" size="16" />
                <span>MTTR (Resolución Media)</span>
              </span>
              <span class="p1-card__delta">↘ -18m hoy</span>
            </div>
            <div class="p1-card__val-row">
              <div>
                <span class="p1-card__val">2h 14m</span>
                <p class="p1-card__sub" style="margin-block-start: 0.2rem">1ra Respuesta (FRT): 11m</p>
              </div>
              <div class="p1-spark" aria-hidden="true">
                @for (h of sparkBars; track $index) {
                  <div
                    class="p1-spark__bar"
                    [class.p1-spark__bar--last]="$index === sparkBars.length - 1"
                    [style.height.%]="h"
                  ></div>
                }
              </div>
            </div>
          </div>

          <!-- Card 4: Flujo Activo por Estado (Volumen Total en Cartera con colores SDK) -->
          <div class="p1-card">
            <div class="p1-card__val-row">
              <span class="p1-card__label">
                <ay-icon nombre="activity" size="16" />
                <span>Volumen Total en Cartera</span>
              </span>
              <strong class="p1-mono">{{ kpisBento().totalCartera }} Tickets</strong>
            </div>
            <div class="p1-stack-bar" role="img" aria-label="Distribución global por estado">
              @for (e of estadosSdk; track e) {
                @if (kpisBento().globalPorEstado[e]; as cnt) {
                  <span
                    class="p1-stack-bar__seg"
                    [style.--tr-color]="colorEstado(e)"
                    [style.flex-grow]="cnt"
                    [title]="estadoEs[e] + ': ' + cnt"
                  ></span>
                }
              }
            </div>
            <div class="p1-card__val-row">
              <span class="p1-card__sub">
                {{ kpisBento().activosCount }} activos en atención
              </span>
              <span class="p1-card__delta">{{ kpisBento().cerradosCount }} resueltos/cerrados</span>
            </div>
          </div>
        </div>
      </section>

      <!-- =========================================================================
           SECCIÓN 2: TABLA DE CARGA POR RESPONSABLE Y BARRA DE ESTADOS DEL SDK
           ========================================================================= -->
      <section aria-label="Sección 2: Carga por Responsable y Distribución Proporcional de Estados">
        <div class="p1-sec-head">
          <div>
            <div class="p1-sec-head__izq">
              <span class="p1-sec-badge">Sección 2</span>
              <strong>Carga por Responsable y Tickets por Estado</strong>
              @if (hayReasignaciones()) {
                <ay-button tamano="sm" variante="ghost" (click)="resetearBalanceos()">
                  Restaurar asignaciones
                </ay-button>
              }
            </div>
            <p class="p1-card__sub" style="margin-block-start: 0.2rem">
              Filtra desde cualquier cabecera de columna <b>▾</b> o desde la leyenda de estados. Haz clic en una fila para desplegar sus tickets.
            </p>
          </div>

          <!-- LEYENDA DE COLORES DE ESTADO SEGÚN EL SDK -->
          <ul class="p1-leyenda" aria-label="Colores de estado del SDK">
            <li>
              <button
                type="button"
                class="p1-leyenda__btn"
                [class.p1-leyenda__btn--on]="!filtros.activo('estado')"
                (click)="filtros.setValor('estado', undefined)"
              >
                Todos
              </button>
            </li>
            @for (e of estadosSdk; track e) {
              <li>
                <button
                  type="button"
                  class="p1-leyenda__btn"
                  [class.p1-leyenda__btn--on]="estadoSeleccionado(e)"
                  (click)="alternarEstadoLeyenda(e)"
                >
                  <span class="p1-leyenda__punto" [style.--tr-color]="colorEstado(e)" aria-hidden="true"></span>
                  {{ estadoEs[e] }}
                </button>
              </li>
            }
          </ul>
        </div>

        <!-- BARRA DE FILTROS HOMOGENEIZADA CON LAS OTRAS TABLAS -->
        <div style="margin-block-end: var(--aybar-space-3)">
          <app-barra-filtros [filtros]="filtros" [conFiltroEmpresa]="true" />
        </div>

        <div class="p1-table-wrap">
          <table
            class="p1-table"
            [filtrosTabla]="filtros"
            [columnasFiltro]="columnas"
            [(ordenFiltro)]="orden"
          >
            <thead>
              <tr>
                <th class="p1-col-exp"></th>
                <th class="p1-col-resp">Responsable</th>
                <th class="p1-col-carga">Carga</th>
                <th class="p1-col-est">Tickets por estado</th>
                <th class="p1-col-sla">Salud de SLA</th>
                <th class="p1-col-prio">Ticket(s) prioritario</th>
              </tr>
            </thead>
            <tbody>
              @if (agentesFiltrados().length === 0) {
                <tr>
                  <td colspan="6" style="padding: var(--aybar-space-5)">
                    <app-vacio-filtros [filtros]="filtros" elemento="responsable" />
                  </td>
                </tr>
              }
              @for (ag of agentesFiltrados(); track ag.id) {
                  @let abierto = estaExpandido(ag.id);
                  @let subLista = ticketsSubtabla(ag);
                  <tr class="p1-row" [class.p1-row--open]="abierto" (click)="alternarFila(ag.id)">
                    <!-- Chevron expandir -->
                    <td class="p1-mono" style="text-align: center">
                      {{ abierto ? '▾' : '▸' }}
                    </td>

                    <!-- Responsable -->
                    <td>
                      <div class="p1-ag">
                        <div class="p1-ag__ava">
                          <ay-avatar [nombre]="ag.nombre" size="sm" decorativo />
                          <span class="p1-ag__dot p1-ag__dot--{{ ag.peorSla }}" aria-hidden="true"></span>
                        </div>
                        <div class="p1-ag__txt">
                          <strong>{{ ag.nombre }}</strong>
                          <div class="p1-card__sub">{{ ag.rolTexto }}</div>
                        </div>
                      </div>
                    </td>

                    <!-- Carga activa -->
                    <td class="p1-col-carga">
                      <strong style="font-size: var(--aybar-font-size-sm)">{{ ag.cargaActiva }}</strong>
                    </td>

                    <!-- Tickets por estado (Ancho fijo constante y responsivo con colores del SDK) -->
                    <td>
                      <div class="p1-estado-celda">
                        <div class="p1-stack-bar" role="img" [attr.aria-label]="textoBarra(ag)">
                          @for (e of estadosSdk; track e) {
                            @if (ag.porEstado[e]; as n) {
                              <span
                                class="p1-stack-bar__seg"
                                [style.--tr-color]="colorEstado(e)"
                                [style.flex-grow]="n"
                                [title]="estadoEs[e] + ': ' + n"
                              ></span>
                            }
                          }
                        </div>
                        <div class="p1-pills-row">
                          @for (e of estadosSdk; track e) {
                            @if (ag.porEstado[e]; as n) {
                              <span class="p1-pill-est">
                                <i class="p1-leyenda__punto" [style.--tr-color]="colorEstado(e)"></i>
                                {{ n }} {{ estadoEs[e] }}
                              </span>
                            }
                          }
                        </div>
                      </div>
                    </td>

                    <!-- Salud de SLA -->
                    <td>
                      <div class="p1-sla-pills">
                        @if (ag.slaCounts.breached > 0) {
                          <span class="p1-sla-pill p1-sla-pill--crit">{{ ag.slaCounts.breached }} Vencido</span>
                        }
                        @if (ag.slaCounts.warning > 0) {
                          <span class="p1-sla-pill p1-sla-pill--warn">{{ ag.slaCounts.warning }} Riesgo</span>
                        }
                        <span class="p1-sla-pill p1-sla-pill--ok">{{ ag.slaCounts.ok }} OK</span>
                      </div>
                    </td>

                    <!-- Ticket(s) prioritario (ancho y alto homogéneos en todas las filas) -->
                    <td (click)="$event.stopPropagation()">
                      @if (ag.ticketsRayo.length === 1) {
                        @let urg = ag.ticketsRayo[0]!;
                        <div class="p1-rayo-slot">
                          <button
                            type="button"
                            class="p1-foco-btn"
                            [title]="urg.id + ' · ' + urg.cliente + ': ' + urg.titulo"
                            (click)="abrirModalInspeccion(urg, ag)"
                          >
                            <div class="p1-foco-btn__txt">
                              <div class="p1-foco-btn__top">
                                <span aria-hidden="true">⚡</span>
                                <strong class="p1-mono">{{ urg.id }}</strong>
                                <span class="p1-card__sub">· {{ urg.cliente }}</span>
                              </div>
                              <p class="p1-foco-btn__sub">{{ urg.titulo }}</p>
                            </div>
                            <span
                              class="p1-sla-pill p1-sla-pill--{{
                                urg.slaEstado === 'breached' ? 'crit' : urg.slaEstado === 'warning' ? 'warn' : 'ok'
                              }}"
                            >
                              {{ urg.slaTexto }}
                            </span>
                          </button>
                        </div>
                      } @else if (ag.ticketsRayo.length > 1) {
                        <div class="p1-rayo-slot p1-rayo-slot--multi">
                          @for (urg of ag.ticketsRayo.slice(0, 2); track urg.id; let idx = $index) {
                            <button
                              type="button"
                              class="p1-foco-btn p1-foco-btn--compact"
                              [title]="urg.id + ' · ' + urg.cliente + ': ' + urg.titulo"
                              (click)="abrirModalInspeccion(urg, ag)"
                            >
                              <div class="p1-foco-btn__txt">
                                <div class="p1-foco-btn__top">
                                  <span aria-hidden="true">⚡</span>
                                  <strong class="p1-mono">{{ urg.id }}</strong>
                                  <span class="p1-card__sub">· {{ urg.cliente }}</span>
                                </div>
                              </div>
                              <div class="p1-foco-btn__der">
                                <span
                                  class="p1-sla-pill p1-sla-pill--{{
                                    urg.slaEstado === 'breached' ? 'crit' : urg.slaEstado === 'warning' ? 'warn' : 'ok'
                                  }}"
                                >
                                  {{ urg.slaTexto }}
                                </span>
                                @if (idx === 1 && ag.ticketsRayo.length > 2) {
                                  <span class="p1-sla-pill p1-sla-pill--warn">+{{ ag.ticketsRayo.length - 2 }}</span>
                                }
                              </div>
                            </button>
                          }
                        </div>
                      } @else {
                        <div class="p1-rayo-slot p1-rayo-slot--vacio">
                          <span class="p1-card__sub">Sin tickets prioritarios</span>
                        </div>
                      }
                    </td>
                  </tr>

                  <!-- SUB-TABLA DESPLEGABLE (DRILL-DOWN DE TICKETS DEL RESPONSABLE) -->
                  @if (abierto) {
                    <tr>
                      <td colspan="6" class="p1-drill-cell">
                        <div class="p1-drill-head">
                          <strong class="p1-mono" style="font-size: 0.7rem; text-transform: uppercase">
                            Cola detallada de {{ ag.nombre }} ({{ subLista.length }} tickets mostrados)
                          </strong>
                          @if (ag.masUrgente && ag.id !== '__sin_asignar__') {
                            <ay-button tamano="sm" variante="secondary" (click)="balancearCarga(ag.id)">
                              ⇄ Balancear 1 ticket a agente libre
                            </ay-button>
                          }
                        </div>
                        <div class="p1-drill-grid">
                          @for (t of subLista; track t.id) {
                            <button
                              type="button"
                              class="p1-tcard"
                              (click)="abrirModalInspeccion(t, ag)"
                            >
                              <div>
                                <div class="p1-tcard__top">
                                  <div class="p1-sec-head__izq">
                                    @if (t.raw.rayo) { <span aria-hidden="true">⚡</span> }
                                    <strong class="p1-mono">{{ t.id }}</strong>
                                    <ay-badge size="sm" [tono]="t.tonoPrioridad">{{ t.prioridadEtiqueta }}</ay-badge>
                                  </div>
                                  <span class="p1-pill-est">
                                    <i class="p1-leyenda__punto" [style.--tr-color]="colorEstado(t.state)"></i>
                                    {{ t.estadoEtiqueta }}
                                  </span>
                                </div>
                                <p class="p1-tcard__title">{{ t.titulo }}</p>
                              </div>
                              <div class="p1-tcard__foot">
                                <span>{{ t.cliente }}</span>
                                <span class="p1-mono" style="font-weight: 700">
                                  SLA: {{ t.slaTexto }}
                                </span>
                              </div>
                            </button>
                          }
                        </div>
                      </td>
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>
      </section>

      <!-- MODAL DE INSPECCIÓN RÁPIDA DE TICKET + REASIGNACIÓN -->
      <ay-modal
        [abierto]="!!ticketInspeccionado()"
        (abiertoChange)="!$event && ticketInspeccionado.set(null)"
        [titulo]="ticketInspeccionado() ? 'Inspección rápida · ' + ticketInspeccionado()!.ticket.id : 'Inspección de ticket'"
        size="md"
      >
        @if (ticketInspeccionado(); as sel) {
          <div class="p1-wrap" style="gap: var(--aybar-space-3)">
            <div class="p1-sec-head__izq">
              <ay-badge size="sm" [tono]="sel.ticket.tonoPrioridad">Prioridad {{ sel.ticket.prioridadEtiqueta }}</ay-badge>
              <span class="p1-pill-est">
                <i class="p1-leyenda__punto" [style.--tr-color]="colorEstado(sel.ticket.state)"></i>
                {{ sel.ticket.estadoEtiqueta }}
              </span>
              <span class="p1-sla-pill p1-sla-pill--{{ sel.ticket.slaEstado === 'breached' ? 'crit' : sel.ticket.slaEstado === 'warning' ? 'warn' : 'ok' }}">
                SLA: {{ sel.ticket.slaTexto }}
              </span>
            </div>
            <p style="margin: 0; font-weight: 600">{{ sel.ticket.titulo }}</p>
            <div class="p1-bento" style="grid-template-columns: repeat(2, 1fr)">
              <div class="p1-card" style="padding: var(--aybar-space-3)">
                <span class="p1-card__sub">Responsable asignado</span>
                <strong>{{ sel.agenteNombre }}</strong>
              </div>
              <div class="p1-card" style="padding: var(--aybar-space-3)">
                <span class="p1-card__sub">Cliente / Titular</span>
                <strong>{{ sel.ticket.cliente }}</strong>
              </div>
            </div>
            <div class="p1-sec-head" style="margin: 0; padding-block-start: var(--aybar-space-2)">
              <span class="p1-card__sub">Peso estimado: <strong>{{ sel.ticket.puntos }} Story Points</strong></span>
              <div class="p1-topbar__der">
                <ay-button
                  tamano="sm"
                  variante="secondary"
                  (click)="balancearTicketEspecifico(sel.ticket.id, sel.agenteId)"
                >
                  ⇄ Reasignar a agente libre
                </ay-button>
                <ay-button
                  tamano="sm"
                  variante="primary"
                  (click)="irAExpediente(sel.ticket.id)"
                >
                  Ver expediente completo
                </ay-button>
              </div>
            </div>
          </div>
        }
      </ay-modal>
    </div>
  `,
  styles: `
    :host{display:block}
    .p1-wrap,.p1-card,.p1-estado-celda,.p1-rayo-slot{display:flex;flex-direction:column}
    .p1-wrap{gap:var(--aybar-space-5)}
    .p1-barra-tv{display:flex;justify-content:flex-end}
    :host(.p1-pantalla){position:fixed;inset:0;z-index:calc(var(--aybar-z-sticky) + 50);display:block;overflow:auto;padding:var(--aybar-space-6);background:var(--aybar-color-bg-canvas)}
    .p1-toast{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.75rem;padding:.75rem 1rem;border:1px solid var(--aybar-color-feedback-success-border);border-radius:var(--aybar-radius-xl);background:var(--aybar-color-feedback-success-bg);color:var(--aybar-color-feedback-success-fg);font-size:var(--aybar-font-size-xs)}
    .p1-topbar__der,.p1-sec-head__izq,.p1-sla-pills{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem}
    .p1-sec-head,.p1-card__val-row,.p1-drill-head,.p1-tcard__top,.p1-tcard__foot{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.5rem}
    .p1-sec-head{margin-block-end:.75rem}
    .p1-sec-badge{padding:.12rem .45rem;border-radius:var(--aybar-radius-sm);background:color-mix(in srgb,var(--aybar-color-bg-brand) 16%,transparent);border:1px solid color-mix(in srgb,var(--aybar-color-bg-brand) 35%,transparent);font-size:.68rem;font-weight:700;text-transform:uppercase}
    .p1-bento{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.75rem}
    .p1-card{justify-content:space-between;gap:.5rem;padding:1rem;border:1px solid var(--aybar-color-border-subtle);border-radius:var(--aybar-radius-xl);background:var(--aybar-color-bg-surface)}
    .p1-card--row{flex-direction:row;align-items:center}
    .p1-card__label,.p1-leyenda__btn,.p1-pill-est{display:inline-flex;align-items:center;gap:.35rem}
    .p1-card__label{font-size:var(--aybar-font-size-xs);color:var(--aybar-color-fg-muted);font-weight:600}
    .p1-card__val{font-size:var(--aybar-font-size-2xl);font-weight:700;font-family:var(--aybar-family-mono);line-height:1.1}
    .p1-card__val--danger{color:var(--aybar-color-feedback-danger-fg)}
    .p1-card__delta{font-size:.7rem;font-weight:700;color:var(--aybar-color-feedback-success-fg)}
    .p1-card__sub{margin:0;font-size:.7rem;color:var(--aybar-color-fg-muted)}
    .p1-ring{position:relative;inline-size:3.5rem;block-size:3.5rem;display:flex;align-items:center;justify-content:center;flex:none}
    .p1-ring svg{inline-size:3.5rem;block-size:3.5rem;transform:rotate(-90deg)}
    .p1-ring__bg{stroke:var(--aybar-color-border-subtle)}.p1-ring__fg{stroke:var(--aybar-color-feedback-success-border)}
    .p1-ring__txt{position:absolute;font-family:var(--aybar-family-mono);font-size:.7rem;font-weight:700;color:var(--aybar-color-feedback-success-fg)}
    .p1-spark{display:flex;align-items:flex-end;gap:3px;block-size:2rem}
    .p1-spark__bar{inline-size:.35rem;border-radius:2px 2px 0 0;background:var(--aybar-color-border-subtle)}
    .p1-spark__bar--last{background:var(--aybar-color-bg-brand)}
    .p1-leyenda{display:flex;flex-wrap:wrap;gap:.5rem;margin:0;padding:0;list-style:none;font-size:var(--aybar-font-size-xs);color:var(--aybar-color-fg-muted)}
    .p1-leyenda__btn{padding:.2rem .5rem;border:1px solid transparent;border-radius:var(--aybar-radius-sm);background:0;color:inherit;font:inherit;cursor:pointer}
    .p1-leyenda__btn--on{border-color:var(--aybar-color-border-accent);background:var(--aybar-color-bg-surface-sunken);font-weight:700;color:var(--aybar-color-fg-default)}
    .p1-leyenda__punto{display:inline-block;inline-size:.6rem;block-size:.6rem;border-radius:2px;background:var(--tr-color)}
    .p1-stack-bar{display:flex;gap:2px;inline-size:100%;block-size:.75rem;background:var(--aybar-color-bg-surface-sunken);border-radius:2px;overflow:hidden}
    .p1-stack-bar__seg{flex-basis:0;min-inline-size:4px;background:var(--tr-color);border-radius:2px}
    .p1-table-wrap{overflow-x:auto;border:1px solid var(--aybar-color-border-subtle);border-radius:var(--aybar-radius-xl);background:var(--aybar-color-bg-surface)}
    .p1-table{inline-size:100%;min-inline-size:60rem;table-layout:fixed;border-collapse:collapse;font-size:var(--aybar-font-size-xs)}
    .p1-table th,.p1-table td{padding:.65rem .75rem;border-block-end:1px solid var(--aybar-color-border-subtle);vertical-align:middle}
    .p1-table th{background:var(--aybar-color-bg-surface-sunken);color:var(--aybar-color-fg-muted);font-weight:600;text-align:start;white-space:nowrap}
    .p1-col-exp{width:2.25rem;padding-inline:.35rem!important}
    .p1-col-resp{width:15%}
    .p1-col-carga{width:5.5rem;text-align:center!important;font-variant-numeric:tabular-nums}
    .p1-col-est{width:auto}
    .p1-col-sla{width:14%}
    .p1-col-prio{width:21%}
    .p1-row{cursor:pointer;block-size:4.4rem}.p1-row:hover,.p1-row--open{background:color-mix(in srgb,var(--aybar-color-bg-surface-sunken) 65%,transparent)}
    .p1-ag{display:flex;align-items:center;gap:.6rem;min-inline-size:0}
    .p1-ag__ava{position:relative;display:inline-flex;flex:none}
    .p1-ag__txt{min-inline-size:0;overflow:hidden}
    .p1-ag__txt strong,.p1-ag__txt .p1-card__sub,.p1-foco-btn__sub,.p1-tcard__title{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .p1-ag__dot{position:absolute;inset-block-end:-1px;inset-inline-end:-1px;inline-size:.55rem;block-size:.55rem;border-radius:50%;border:1.5px solid var(--aybar-color-bg-surface)}
    .p1-ag__dot--ok{background:var(--aybar-color-feedback-success-border)}.p1-ag__dot--warn{background:var(--aybar-color-feedback-warning-border)}.p1-ag__dot--crit{background:var(--aybar-color-feedback-danger-border)}
    .p1-estado-celda,.p1-rayo-slot{justify-content:center;inline-size:100%;block-size:3.1rem}
    .p1-estado-celda{gap:.35rem}
    .p1-pills-row{display:flex;flex-wrap:nowrap;align-items:center;gap:.5rem;overflow:hidden;font-size:.68rem;color:var(--aybar-color-fg-muted);white-space:nowrap}
    .p1-pill-est{font-size:.68rem;flex:none}
    .p1-sla-pill{padding:.12rem .45rem;border-radius:var(--aybar-radius-sm);font-family:var(--aybar-family-mono);font-size:.68rem;font-weight:700;white-space:nowrap;flex:none}
    .p1-sla-pill--crit{background:var(--aybar-color-feedback-danger-bg);color:var(--aybar-color-feedback-danger-fg)}.p1-sla-pill--warn{background:var(--aybar-color-feedback-warning-bg);color:var(--aybar-color-feedback-warning-fg)}.p1-sla-pill--ok{background:var(--aybar-color-feedback-success-bg);color:var(--aybar-color-feedback-success-fg)}
    .p1-rayo-slot--multi{justify-content:space-between;gap:.2rem}
    .p1-rayo-slot--vacio{align-items:center;border:1px dashed var(--aybar-color-border-subtle);border-radius:var(--aybar-radius-md);opacity:.65}
    .p1-foco-btn,.p1-tcard{display:flex;justify-content:space-between;gap:.5rem;padding:.4rem .6rem;border:1px solid var(--aybar-color-border-subtle);border-radius:var(--aybar-radius-md);background:var(--aybar-color-bg-surface);color:inherit;font:inherit;text-align:start;cursor:pointer}
    .p1-foco-btn{align-items:center;inline-size:100%;block-size:100%;box-sizing:border-box;background:var(--aybar-color-bg-surface-sunken)}
    .p1-foco-btn--compact{block-size:1.45rem;padding:.15rem .5rem}
    .p1-foco-btn__top,.p1-foco-btn__der{display:flex;align-items:center;gap:.25rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .p1-tcard{flex-direction:column;border-radius:var(--aybar-radius-lg)}
    .p1-foco-btn:hover,.p1-tcard:hover{border-color:var(--aybar-color-border-accent)}
    .p1-foco-btn__txt{min-inline-size:0;flex:1}
    .p1-foco-btn__sub,.p1-tcard__title{margin:2px 0 0}
    .p1-foco-btn__sub{color:var(--aybar-color-fg-muted);font-size:.68rem}
    .p1-tcard__title{font-weight:600}
    .p1-drill-cell{padding:.75rem 1.25rem!important;background:var(--aybar-color-bg-surface-sunken);border-inline-start:3px solid var(--aybar-color-border-accent)}
    .p1-drill-head{margin-block-end:.5rem}
    .p1-drill-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.5rem}
    .p1-tcard__foot{padding-block-start:.35rem;border-block-start:1px solid var(--aybar-color-border-subtle);font-size:.68rem;color:var(--aybar-color-fg-muted)}
    .p1-mono{font-family:var(--aybar-family-mono)}
    @media (max-width:72rem){.p1-bento,.p1-drill-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
  `,
})
export class MonitorOperacionComponent {
  readonly tickets = input<readonly TicketAtc[]>([]);
  readonly area = model<string>('');
  readonly eventosVivo = input<readonly unknown[]>([]);
  readonly cerradosHoy = input<number>(38);
  readonly conRayo = input<number>(0);
  readonly seleccionarTicket = output<string>();

  private readonly anfitrion = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * Modo TV: la página pasa a pantalla completa y el Monitor cubre toda la ventana. Se pone la página entera en
   * pantalla completa, y no solo el Monitor, para que el modal de inspección (que se dibuja en el `body`) siga
   * viéndose. Se sale con Esc o con el mismo botón.
   */
  protected readonly pantallaCompleta = signal(false);

  protected alternarPantallaCompleta(): void {
    const doc = this.anfitrion.nativeElement.ownerDocument;
    if (doc.fullscreenElement) {
      void doc.exitFullscreen();
    } else {
      void doc.documentElement.requestFullscreen?.();
    }
  }

  protected alCambiarPantalla(): void {
    this.pantallaCompleta.set(this.anfitrion.nativeElement.ownerDocument.fullscreenElement !== null);
  }

  protected readonly estadosSdk = ESTADOS_SDK;
  protected readonly estadoEs = ESTADO_ES;
  protected readonly sparkBars = SPARK_BARS;
  protected readonly orden = signal<{ clave: string; dir: 'asc' | 'desc' } | undefined>(undefined);
  protected readonly filasExpandidas = signal<readonly string[]>([]);
  protected readonly reasignaciones = signal<Readonly<Record<string, string>>>({});
  protected readonly avisoBalanceo = signal<{ ticketId: string; desde: string; hacia: string } | null>(null);
  protected readonly ticketInspeccionado = signal<{
    ticket: TicketEnriquecido;
    agenteNombre: string;
    agenteId: string;
  } | null>(null);

  protected readonly columnas: readonly AyColumna[] = [
    { clave: 'expandir', cabecera: '' },
    { clave: 'persona', cabecera: 'Responsable', ordenable: true },
    { clave: 'cargaActiva', cabecera: 'Carga', alineacion: 'end', ordenable: true },
    { clave: 'estado', cabecera: 'Tickets por estado', ordenable: true },
    { clave: 'sla', cabecera: 'Salud de SLA', ordenable: true },
    { clave: 'prioritario', cabecera: 'Ticket(s) prioritario', ordenable: true },
  ];

  protected readonly hayReasignaciones = computed(() => Object.keys(this.reasignaciones()).length > 0);

  protected colorEstado(e: string): string {
    return `var(--aybar-color-${COLOR_ESTADO[e] ?? 'neutral-500'})`;
  }

  /** Tickets con las reasignaciones de balanceo en memoria aplicadas. */
  private readonly ticketsConBalanceo = computed<readonly TicketAtc[]>(() => {
    const map = this.reasignaciones();
    if (!Object.keys(map).length) return this.tickets();
    return this.tickets().map((t) => (map[t.num] ? { ...t, owner: map[t.num], state: 'IN_PROGRESS' } : t));
  });

  /** Lista completa de responsables con el conteo por los 8 estados del SDK. */
  protected readonly agentes = computed<readonly AgenteLinear[]>(() => {
    const filas: FilaResponsable[] = agruparPorResponsable(this.ticketsConBalanceo(), '', 'riesgo');
    return filas
      .filter((f) => f.tickets.length > 0)
      .map((f) => {
        const enriquecidos = f.tickets.map(enriquecerTicket);
        const activos = enriquecidos.filter((t) => t.state !== 'RESOLVED' && t.state !== 'CLOSED');
        const puntosCapacidad = activos.reduce((acc, t) => acc + t.puntos, 0);
        const maxPuntos = 15;
        const pctUtilizacion = Math.round((puntosCapacidad / maxPuntos) * 100);
        const porEstado = {
          OPEN: enriquecidos.filter((t) => t.state === 'OPEN').length,
          IN_PROGRESS: enriquecidos.filter((t) => t.state === 'IN_PROGRESS').length,
          PENDING_CUSTOMER: enriquecidos.filter((t) => t.state === 'PENDING_CUSTOMER').length,
          ESCALATED: enriquecidos.filter((t) => t.state === 'ESCALATED').length,
          IN_COMMITTEE: enriquecidos.filter((t) => t.state === 'IN_COMMITTEE').length,
          REOPENED: enriquecidos.filter((t) => t.state === 'REOPENED').length,
          RESOLVED: enriquecidos.filter((t) => t.state === 'RESOLVED').length,
          CLOSED: enriquecidos.filter((t) => t.state === 'CLOSED').length,
        };
        const slaCounts = {
          breached: activos.filter((t) => t.slaEstado === 'breached').length,
          warning: activos.filter((t) => t.slaEstado === 'warning').length,
          ok: activos.filter((t) => t.slaEstado === 'ok').length,
        };
        const peorSla: 'crit' | 'warn' | 'ok' =
          slaCounts.breached > 0 ? 'crit' : slaCounts.warning > 0 ? 'warn' : 'ok';
        const masUrgente = [...activos].sort((a, b) => a.slaMinutosOrden - b.slaMinutosOrden)[0] ?? null;
        const ticketsRayo = activos
          .filter((t) => t.raw.rayo)
          .sort((a, b) => a.slaMinutosOrden - b.slaMinutosOrden);

        return {
          id: f.owner ?? '__sin_asignar__',
          nombre: f.nombre,
          area: f.area,
          rolTexto: f.owner ? nombreArea(f.area) : 'Pendiente de asignar',
          cargaActiva: activos.length,
          puntosCapacidad,
          maxPuntos,
          pctUtilizacion,
          porEstado,
          totalTickets: enriquecidos.length,
          slaCounts,
          peorSla,
          masUrgente,
          ticketsRayo,
          tickets: enriquecidos,
        };
      });
  });

  protected readonly filtros = crearFiltrosTabla<AgenteLinear>(
    this.agentes,
    {
      clave: 'monitor-personas',
      etiquetaElemento: 'responsables',
      etiquetaBusqueda: 'Buscar responsable, ticket o cliente',
      placeholderBusqueda: 'Responsable, área, ticket (#0042) o cliente…',
      textoDe: (a) =>
        [
          a.nombre,
          a.rolTexto,
          ...a.tickets.flatMap((t) => [t.id, t.titulo, t.cliente]),
        ].join(' '),
      filtros: [
        {
          id: 'persona',
          etiqueta: 'Responsable',
          tipo: 'multi',
          conBusqueda: true,
          valorDe: (a) => a.nombre,
        },
        {
          id: 'area',
          etiqueta: 'Área',
          tipo: 'multi',
          valorDe: (a) => a.area,
          opciones: AREAS_ATC.map((ar) => ({ valor: ar, etiqueta: AREA_ES[ar] ?? ar })),
        },
        {
          id: 'carga',
          etiqueta: 'Nivel de carga',
          tipo: 'multi',
          valorDe: (a) => (a.cargaActiva >= 4 ? 'ALTA' : a.cargaActiva >= 2 ? 'MEDIA' : 'BAJA'),
          opciones: [
            { valor: 'ALTA', etiqueta: 'Alta (≥ 4 activos)' },
            { valor: 'MEDIA', etiqueta: 'Media (2–3 activos)' },
            { valor: 'BAJA', etiqueta: 'Baja (≤ 1 activo)' },
          ],
        },
        {
          id: 'estado',
          etiqueta: 'Estado de ticket',
          tipo: 'multi',
          valorDe: (a) => ESTADOS_SDK.filter((e) => a.porEstado[e] > 0),
          opciones: ESTADOS_SDK.map((e) => ({ valor: e, etiqueta: ESTADO_ES[e] ?? e })),
        },
        {
          id: 'sla',
          etiqueta: 'Salud de SLA',
          tipo: 'multi',
          valorDe: (a) => a.peorSla,
          opciones: [
            { valor: 'crit', etiqueta: 'Con tickets vencidos' },
            { valor: 'warn', etiqueta: 'Con tickets en riesgo' },
            { valor: 'ok', etiqueta: 'Todo en plazo' },
          ],
        },
        {
          id: 'rayo',
          etiqueta: 'Ticket(s) prioritario',
          tipo: 'multi',
          valorDe: (a) => (a.ticketsRayo.length > 0 ? 'CON_RAYO' : 'SIN_RAYO'),
          opciones: [
            { valor: 'CON_RAYO', etiqueta: '⚡ Con ticket(s) prioritario' },
            { valor: 'SIN_RAYO', etiqueta: 'Sin tickets prioritarios' },
          ],
        },
      ],
    },
    inject(EstadoFiltrosTablas),
  );

  constructor() {
    // al salir del Monitor (otra pestaña o el expediente de un ticket) no se queda la página a pantalla completa
    inject(DestroyRef).onDestroy(() => {
      const doc = this.anfitrion.nativeElement.ownerDocument;
      if (doc.fullscreenElement) void doc.exitFullscreen();
    });
    effect(() => {
      const ar = this.area();
      untracked(() => {
        if (ar) {
          this.filtros.setValor('area', [ar]);
        }
      });
    });
  }

  protected readonly agentesFiltrados = computed<readonly AgenteLinear[]>(() => {
    const base = this.filtros.filtradas();
    const o = this.orden();
    if (!o) return base;
    const dir = o.dir === 'asc' ? 1 : -1;
    return [...base].sort((a, b) => {
      if (o.clave === 'cargaActiva') return (a.cargaActiva - b.cargaActiva) * dir;
      if (o.clave === 'estado') return (a.totalTickets - b.totalTickets) * dir;
      if (o.clave === 'prioritario') return (a.ticketsRayo.length - b.ticketsRayo.length) * dir;
      if (o.clave === 'sla') {
        const pesoA = a.slaCounts.breached * 100 + a.slaCounts.warning * 10 + a.slaCounts.ok;
        const pesoB = b.slaCounts.breached * 100 + b.slaCounts.warning * 10 + b.slaCounts.ok;
        return (pesoA - pesoB) * dir;
      }
      return a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }) * dir;
    });
  });

  protected estadoSeleccionado(e: EstadoSdk): boolean {
    return this.filtros.valores('estado').includes(e);
  }

  protected alternarEstadoLeyenda(e: EstadoSdk): void {
    const actuales = [...this.filtros.valores('estado')];
    const idx = actuales.indexOf(e);
    if (idx >= 0) actuales.splice(idx, 1);
    else actuales.push(e);
    this.filtros.setValor('estado', actuales.length ? actuales : undefined);
  }

  protected readonly kpisBento = computed(() => {
    const todos = this.agentes().flatMap((a) => a.tickets);
    const activos = todos.filter((t) => t.state !== 'RESOLVED' && t.state !== 'CLOSED');
    const cerradosCount = todos.length - activos.length;
    const vencidos = activos.filter((t) => t.slaEstado === 'breached').length;
    const enRiesgo = activos.filter((t) => t.slaEstado === 'warning').length;
    const cumplidos = todos.length - vencidos;
    const slaPct = todos.length ? ((cumplidos / todos.length) * 100).toFixed(1) : '100.0';
    const numPct = Number(slaPct);
    const calificacion = numPct >= 95 ? 'A+' : numPct >= 88 ? 'A' : 'B';

    const topUrgentes = [...activos]
      .filter((t) => t.slaEstado !== 'ok')
      .sort((a, b) => a.slaMinutosOrden - b.slaMinutosOrden)
      .slice(0, 3);

    const agConRiesgo = this.agentes()
      .filter((a) => a.slaCounts.breached + a.slaCounts.warning > 0 && a.id !== '__sin_asignar__')
      .slice(0, 2)
      .map((a) => a.nombre);

    const resumenConcentracion = agConRiesgo.length
      ? `Concentrados en ${agConRiesgo.join(' y ')}`
      : 'Sin brechas activas en el equipo';

    const globalPorEstado: Record<EstadoSdk, number> = {
      OPEN: todos.filter((t) => t.state === 'OPEN').length,
      IN_PROGRESS: todos.filter((t) => t.state === 'IN_PROGRESS').length,
      PENDING_CUSTOMER: todos.filter((t) => t.state === 'PENDING_CUSTOMER').length,
      ESCALATED: todos.filter((t) => t.state === 'ESCALATED').length,
      IN_COMMITTEE: todos.filter((t) => t.state === 'IN_COMMITTEE').length,
      REOPENED: todos.filter((t) => t.state === 'REOPENED').length,
      RESOLVED: todos.filter((t) => t.state === 'RESOLVED').length,
      CLOSED: todos.filter((t) => t.state === 'CLOSED').length,
    };

    return {
      slaPct,
      calificacion,
      vencidos,
      enRiesgo,
      topUrgentes,
      resumenConcentracion,
      totalCartera: todos.length,
      activosCount: activos.length,
      cerradosCount,
      globalPorEstado,
    };
  });

  protected textoBarra(ag: AgenteLinear): string {
    const partes = ESTADOS_SDK.filter((e) => ag.porEstado[e]).map(
      (e) => `${ag.porEstado[e]} ${ESTADO_ES[e].toLowerCase()}`,
    );
    return `Tickets de ${ag.nombre} por estado: ${partes.join(', ')}`;
  }

  protected estaExpandido(id: string): boolean {
    return this.filasExpandidas().includes(id);
  }

  protected alternarFila(id: string): void {
    this.filasExpandidas.update((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  protected ticketsSubtabla(ag: AgenteLinear): TicketEnriquecido[] {
    const ests = this.filtros.valores('estado');
    if (!ests.length) return ag.tickets;
    return ag.tickets.filter((t) => ests.includes(t.state));
  }

  protected balancearCarga(desdeAgenteId: string): void {
    const origen = this.agentes().find((a) => a.id === desdeAgenteId);
    if (!origen || !origen.masUrgente) return;
    this.balancearTicketEspecifico(origen.masUrgente.id, desdeAgenteId);
  }

  protected balancearTicketEspecifico(ticketId: string, desdeAgenteId: string): void {
    const origen = this.agentes().find((a) => a.id === desdeAgenteId);
    const destino = [...this.agentes()]
      .filter((a) => a.id !== desdeAgenteId && a.id !== '__sin_asignar__')
      .sort((a, b) => a.puntosCapacidad - b.puntosCapacidad)[0];
    if (!destino) return;

    this.reasignaciones.update((prev) => ({ ...prev, [ticketId]: destino.nombre }));
    this.avisoBalanceo.set({
      ticketId,
      desde: origen?.nombre ?? 'Cola',
      hacia: destino.nombre,
    });
    this.ticketInspeccionado.set(null);
  }

  protected resetearBalanceos(): void {
    this.reasignaciones.set({});
    this.avisoBalanceo.set(null);
  }

  protected abrirModalInspeccion(ticket: TicketEnriquecido, ag: AgenteLinear): void {
    this.ticketInspeccionado.set({
      ticket,
      agenteNombre: ag.nombre,
      agenteId: ag.id,
    });
  }

  protected irAExpediente(ticketId: string): void {
    this.ticketInspeccionado.set(null);
    this.seleccionarTicket.emit(ticketId);
  }
}
