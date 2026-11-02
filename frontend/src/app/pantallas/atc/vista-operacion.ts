import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import {
  AyAlert,
  AyBadge,
  AyButton,
  AyCard,
  AyCardBody,
  AyCardHeader,
  AyCardPairs,
  AyCelda,
  AyCheckbox,
  AyEmptyState,
  AyForm,
  AyFormField,
  AyFormGroup,
  AyGrid,
  AyHeading,
  AyInput,
  AyDropdownMenu,
  AyIconButton,
  AyModal,
  AyPageHeader,
  AyPagination,
  AyRow,
  AySelect,
  AyStack,
  AyStatistic,
  AyTable,
  AyTextarea,
  AyText,
  type AyColumna,
  type AyMenuItem,
  type AyOpcionSelect,
  type AyTimelineEvento,
  type ParCardPairs,
} from '@aybarcorp/ui-angular';
import {
  AHORA_BASE,
  AREAS_ATC,
  CANALES_ATC,
  EMPRESAS_AYBAR,
  ESTADOS_TICKET,
  ESTADO_ES,
  GUIAS_SOLUCION,
  LINEAS_NEGOCIO,
  MOTIVOS_DERIVACION,
  PRIORIDADES_TICKET,
  TIPOS_TICKET,
  calcularPoliticaSla,
  evaluarSlaTicket,
  fmtFechaHora,
  sumarDiasHabiles,
  sumarHorasHabiles,
  tiempoRestanteTexto,
  type TicketAtc,
} from './datos-atc';
import { EstadoPrototipoAtcService } from './estado-prototipo-atc';
import { AREA_ES, MOTIVO_ES, etiqueta, opcionesDe, traducirCodigos } from './etiquetas-es';
import { BarraFiltrosComponent } from './barra-filtros';
import { FiltroColumnasTablaDirective } from './filtro-columnas-tabla';
import { VacioFiltrosComponent } from './vacio-filtros';
import type { DerivacionEvento } from './propuestas-detalle/derivar-ticket';
import { DetalleCreativa } from './propuestas-detalle/version-creativa';
import { crearFiltrosTabla, EstadoFiltrosTablas } from './filtros-tabla';
import { PasosFlujoComponent } from './pasos-flujo';
import type { SlaPrevisto } from './propuestas-sla/sla-previsto';
import { SlaConservadora } from './propuestas-sla/version-conservadora';

@Component({
  selector: 'app-vista-operacion',
  standalone: true,
  imports: [
    PasosFlujoComponent,
    SlaConservadora,
    DetalleCreativa,
    BarraFiltrosComponent,
    FiltroColumnasTablaDirective,
    VacioFiltrosComponent,
    AyAlert,
    AyBadge,
    AyButton,
    AyCard,
    AyCardBody,
    AyCardHeader,
    AyCardPairs,
    AyCelda,
    AyCheckbox,
      AyEmptyState,
    AyForm,
    AyFormField,
    AyFormGroup,
    AyGrid,
    AyHeading,
    AyInput,
        AyDropdownMenu,
        AyIconButton,
        AyModal,
    AyPageHeader,
    AyPagination,
    AyRow,
    AySelect,
    AyStack,
    AyStatistic,
    AyTable,
    AyTextarea,
    AyText,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- ====================================================================== -->
    <!-- VISTA 1: BANDEJA DE TICKETS CON FILTROS POR COLUMNA                    -->
    <!-- ====================================================================== -->
    @if (subvista() === 'bandeja') {
      <div ayStack gap="6">
        <ay-page-header
          titulo="Bandeja de Tickets"
          descripcion="Tickets activos de todas las áreas, ordenados por prioridad Rayo y del vencimiento SLA más próximo al más lejano."
        >
          @if (!ctiEntranteVisible()) {
            <ay-button ayAcciones tamano="sm" variante="ghost" (click)="ctiEntranteVisible.set(true)">
              Mostrar llamada
            </ay-button>
          }
          @if (estadoProto.rolActivo() === 'SUPERVISOR') {
            <ay-button ayAcciones tamano="sm" variante="secondary" (click)="modalCeseAbierto.set(true)">
              Reasignación masiva por rotación
            </ay-button>
          }
          <ay-button ayAcciones tamano="sm" variante="primary" (click)="irANuevo.emit()">
            + Nuevo ticket
          </ay-button>
        </ay-page-header>

        <!-- Pop-up de llamada entrante con AyAlert oficial -->
        @if (ctiEntranteVisible()) {
          <ay-alert
            tono="info"
            titulo="Llamada entrante · +51 991 224 266 · Jorge Mamani Ccori (DNI 7013••••)"
            [descartable]="true"
            (cerrar)="ctiEntranteVisible.set(false)"
          >
            Ticket activo: ALT-001204
            <div ayAcciones ayRow gap="2" [ajuste]="true">
              <ay-button tamano="sm" variante="primary" (click)="atenderLlamadaCti('ALT-001204')">
                Atender y ver ticket ALT-001204
              </ay-button>
              <ay-button tamano="sm" variante="secondary" (click)="irA360.emit(dniLlamadaEntrante)">
                Abrir Consulta 360
              </ay-button>
              <ay-button tamano="sm" variante="ghost" (click)="ctiEntranteVisible.set(false)">
                Ocultar Llamada
              </ay-button>
            </div>
          </ay-alert>
        }

        <div ayStack gap="2">
          <ay-card variante="elevated" superficie="solid">
            <ay-card-body padding="sm" gap="md">
              <app-barra-filtros [filtros]="filtrosBandeja" [conFiltroEmpresa]="true" />

              <ay-table
                class="pl-atc-bandeja"
                leyenda="Bandeja de tickets de atención multicanal"
                [columnas]="columnasBandejaCompacta"
                [filas]="ticketsPaginadosBandeja()"
                [filtrosTabla]="filtrosBandeja"
                [(orden)]="ordenBandeja"
                [cabeceraFija]="true"
                [rayada]="true"
              >
                <ng-template ayCelda="rayo" let-fila>
                  @let t = comoTicket(fila);
                  <div class="pl-atc-rayo-celda">
                    <button
                      type="button"
                      class="pl-atc-rayo-icono"
                      [class.pl-atc-rayo-icono--activo]="t.rayo"
                      [attr.aria-pressed]="t.rayo"
                      [attr.aria-label]="t.rayo ? 'Quitar prioridad Rayo' : 'Marcar con prioridad Rayo'"
                      [title]="t.rayo ? 'Prioridad Rayo activa (clic para quitar)' : 'Marcar con prioridad Rayo'"
                      (click)="rayoPendiente.set(t)"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
                      </svg>
                    </button>
                  </div>
                </ng-template>
                <ng-template ayCelda="num" let-fila>
                  @let t = comoTicket(fila);
                  <div ayStack gap="1">
                    <strong ayText="mono" size="xs">{{ t.num }}</strong>
                    <span ayText="body" size="xs">{{ t.empresa.nombre }}</span>
                  </div>
                </ng-template>
                <ng-template ayCelda="prio" let-fila>
                  @let t = comoTicket(fila);
                  <ay-badge
                    size="sm"
                    [tono]="
                      t.prio === 'URGENT'
                        ? 'danger'
                        : t.prio === 'HIGH'
                          ? 'warning'
                          : t.prio === 'MEDIUM'
                            ? 'info'
                            : 'neutral'
                    "
                  >
                    {{ nombrePrioridad(t.prio) }}
                  </ay-badge>
                </ng-template>
                <ng-template ayCelda="cli" let-fila>
                  @let t = comoTicket(fila);
                  <div ayStack gap="1">
                    <div>
                      <strong>{{ t.cli }}</strong>
                      <span ayText="mono" size="xs"> ({{ t.dni }})</span>
                    </div>
                    <span ayText="body" size="xs">{{ t.proj }}</span>
                  </div>
                </ng-template>
                <ng-template ayCelda="ch" let-fila>
                  @let t = comoTicket(fila);
                  <div ayStack gap="1">
                    <ay-badge size="sm" tono="neutral">{{ t.ch }}</ay-badge>
                    <span ayText="body" size="xs">{{ nombreTipo(t.type) }}</span>
                  </div>
                </ng-template>
                <ng-template ayCelda="area" let-fila>
                  @let t = comoTicket(fila);
                  <div ayStack gap="1">
                    <strong>{{ areaEs(t.area) }}</strong>
                    <span ayText="body" size="xs">{{ t.owner ?? 'Sin asignar (Cola)' }}</span>
                  </div>
                </ng-template>
                <ng-template ayCelda="state" let-fila>
                  @let t = comoTicket(fila);
                  <div ayRow gap="1" [ajuste]="true">
                    <ay-badge
                      size="sm"
                      [tono]="
                        t.state === 'ESCALATED' || t.state === 'IN_COMMITTEE'
                          ? 'danger'
                          : t.state === 'RESOLVED'
                            ? 'success'
                            : 'info'
                      "
                    >
                      {{ estadoEs[t.state] ?? t.state }}
                    </ay-badge>
                    @if (t.eje === 3) {
                      <ay-badge size="sm" tono="danger">Eje 3 Legal</ay-badge>
                    }
                  </div>
                </ng-template>
                <ng-template ayCelda="sla" let-fila>
                  @let t = comoTicket(fila);
                  <div ayStack gap="1">
                    <ay-badge size="sm" [tono]="evaluarSla(t).tono">{{ evaluarSla(t).txt }}</ay-badge>
                    @if (evaluarSla(t).due; as due) {
                      <span ayText="mono" size="xs">{{ tiempoRestante(due) }}</span>
                    }
                  </div>
                </ng-template>
                <ng-template ayCelda="acciones" let-fila>
                  @let t = comoTicket(fila);
                  <div class="pl-atc-acciones-celda">
                    <ay-button
                      tamano="sm"
                      variante="primary"
                      [attr.aria-label]="'Ver ticket ' + t.num"
                      (click)="seleccionarTicket.emit(t.num)"
                    >
                      Ver ticket
                    </ay-button>
                    <ay-dropdown-menu
                      colocacion="bottom-end"
                      [items]="itemsMasAcciones(t)"
                      (elegido)="elegirMasAccion($event, t)"
                    >
                      <ay-icon-button
                        ayDisparador
                        variante="ghost"
                        tamano="sm"
                        [etiqueta]="'Más acciones del ticket ' + t.num"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <circle cx="5" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="19" cy="12" r="1.8" />
                        </svg>
                      </ay-icon-button>
                    </ay-dropdown-menu>
                  </div>
                </ng-template>
                <app-vacio-filtros ayVacio [filtros]="filtrosBandeja" elemento="ticket" />
              </ay-table>

              <ay-pagination
                [(pagina)]="paginaBandeja"
                [(tamano)]="tamanoPaginaBandeja"
                [opcionesTamano]="opcionesTamanoPagina"
                [total]="ticketsFiltrados().length"
                [totalPaginas]="totalPaginasBandeja()"
                etiquetaElemento="tickets"
              />
            </ay-card-body>
          </ay-card>
        </div>

        <!-- Confirmación de prioridad Rayo (Esc, scrim y foco los gestiona ay-modal) -->
        <ay-modal
          [abierto]="!!rayoPendiente()"
          (abiertoChange)="!$event && rayoPendiente.set(null)"
          [titulo]="rayoPendiente()?.rayo ? 'Quitar prioridad Rayo' : 'Marcar con prioridad Rayo'"
          size="sm"
        >
          @if (rayoPendiente(); as r) {
            <div ayStack gap="3">
              <p ayText="body" size="sm">
                Ticket <strong ayText="mono">{{ r.num }}</strong> · {{ r.cli }}.
                @if (r.rayo) {
                  Dejará de ir primero y volverá a ordenarse solo por su SLA.
                } @else {
                  Irá primero en la bandeja sin alterar su SLA.
                }
              </p>
              <div ayRow gap="2" justificar="end">
                <ay-button variante="secondary" (click)="rayoPendiente.set(null)">Cancelar</ay-button>
                <ay-button variante="primary" (click)="confirmarRayo()">Confirmar</ay-button>
              </div>
            </div>
          }
        </ay-modal>

        <!-- Modal de Reasignación Masiva por Cese/Rotación -->
        <ay-modal
          [abierto]="modalCeseAbierto()"
          (abiertoChange)="modalCeseAbierto.set($event)"
          titulo="Reasignación masiva auditable por cese o rotación"
        >
          <ay-form (enviar)="ejecutarReasignacionMasiva()">
            <div ayStack gap="3">
              <p ayText="body" size="sm">
                Transfiere en bloque los tickets abiertos del colaborador saliente conservando el compromiso SLA original
                y dejando registro inmutable en la bitácora de asignación.
              </p>
              <ay-form-field etiqueta="Colaborador que cesa o rota" obligatorio>
                <ay-select nombre="cese-origen"
                  [opciones]="opcionesCeseOrigen"
                  [valor]="ceseOrigen()"
                  (valorChange)="ceseOrigen.set($event)"
                />
              </ay-form-field>
              <ay-form-field etiqueta="Nuevo responsable receptor (menor carga activa)" obligatorio>
                <ay-select nombre="cese-destino"
                  [opciones]="opcionesCeseDestino"
                  [valor]="ceseDestino()"
                  (valorChange)="ceseDestino.set($event)"
                />
              </ay-form-field>
              <ay-form-field etiqueta="Motivo tipificado de auditoría" obligatorio>
                <ay-select nombre="cese-motivo"
                  [opciones]="opcionesCeseMotivo"
                  [valor]="ceseMotivo()"
                  (valorChange)="ceseMotivo.set($event)"
                />
              </ay-form-field>
              <div ayRow gap="2" justificar="end">
                <ay-button variante="ghost" (click)="modalCeseAbierto.set(false)">Cancelar</ay-button>
                <ay-button tipo="submit" variante="primary">
                  Ejecutar reasignación masiva
                </ay-button>
              </div>
            </div>
          </ay-form>
        </ay-modal>
      </div>
    }

    <!-- ====================================================================== -->
    <!-- VISTA 1B: TU DÍA (AVANCE DIARIO INDIVIDUAL, ACCIONES Y EQUIPO)         -->
    <!-- ====================================================================== -->
    @if (subvista() === 'tudia') {
      <div ayStack gap="6">
        <ay-page-header
          titulo="Tu Día"
          descripcion="Tu avance de hoy: tickets atendidos, pendientes en riesgo, cumplimiento de SLA y CSAT. El supervisor ve además el avance de su equipo."
        >
          @if (estadoProto.rolActivo() === 'SUPERVISOR') {
            <ay-button ayAcciones tamano="sm" variante="secondary" (click)="modalCeseAbierto.set(true)">
              Reasignación masiva por rotación
            </ay-button>
          }
          <ay-button ayAcciones tamano="sm" variante="primary" (click)="irANuevo.emit()">
            + Registrar nuevo ticket
          </ay-button>
        </ay-page-header>

        @if (estadoProto.rolActivo() === 'ADMIN_FUNCIONAL') {
          <ay-alert tono="warning" size="sm" titulo="Sin líder inmediato en directorio organizacional (HU-ATC-055)">
            No tienes líder inmediato registrado en el directorio organizacional: los correos de asignación se te envían sin copia (CC) hasta que RRHH complete tu jerarquía.
          </ay-alert>
        }

        <!-- 1. Resumen de KPIs de Tu Día -->
        <div ayStack gap="2">
          <div ayGrid [columnas]="4" gap="sm">
            <ay-card superficie="solid">
              <ay-card-body padding="sm">
                <div ayStack gap="2">
                  <ay-statistic
                    etiqueta="Tickets atendidos hoy"
                    [valor]="14"
                    unidad="tickets"
                    size="sm"
                  />
                </div>
              </ay-card-body>
            </ay-card>

            <ay-card superficie="solid">
              <ay-card-body padding="sm">
                <div ayStack gap="2">
                  <ay-statistic
                    etiqueta="Pendientes en tu bandeja"
                    [valor]="misTicketsPendientesHoy().length"
                    unidad="casos"
                    size="sm"
                  />
                  <ay-badge size="sm" [tono]="misTicketsEnRiesgoHoy().length > 0 ? 'warning' : 'success'">
                    {{ misTicketsEnRiesgoHoy().length }} con alerta de vencimiento SLA
                  </ay-badge>
                </div>
              </ay-card-body>
            </ay-card>

            <ay-card superficie="solid">
              <ay-card-body padding="sm">
                <div ayStack gap="2">
                  <ay-statistic
                    etiqueta="Cumplimiento SLA hoy"
                    [valor]="94"
                    unidad="% SLA"
                    size="sm"
                  />
                </div>
              </ay-card-body>
            </ay-card>

            <ay-card superficie="solid">
              <ay-card-body padding="sm">
                <div ayStack gap="2">
                  <ay-statistic
                    etiqueta="CSAT hoy"
                    [valor]="4.7"
                    unidad="/ 5.0"
                    size="sm"
                  />
                  <ay-badge size="sm" tono="neutral" title="El CSAT es el promedio de las encuestas respondidas; las que el cliente no responde no cuentan">
                    12 de 14 encuestas respondidas
                  </ay-badge>
                </div>
              </ay-card-body>
            </ay-card>
          </div>
        </div>

        <!-- 2. Avance diario del equipo: solo el supervisor (HU-ATC-054 CA-02 y CA-03; ATC.DASHBOARD.TEAM) -->
        @if (estadoProto.rolActivo() === 'SUPERVISOR') {
          <div ayStack gap="2">
            <div ayStack gap="1">
              <ay-heading [nivel]="2" size="sm">Avance diario del equipo</ay-heading>
              <span ayText="subtitle" size="xs">
                Tickets atendidos, carga activa, cumplimiento de SLA y CSAT de cada gestor hoy.
              </span>
            </div>
            <ay-card superficie="solid">
              <ay-card-body padding="sm">
                <ay-table
                  leyenda="Avance diario del equipo ATC"
                  [columnas]="columnasEquipoHoy"
                  [filas]="avanceEquipoHoy"
                  [rayada]="true"
                >
                  <ng-template ayCelda="gestor" let-fila>
                    @let g = comoAvanceGestor(fila);
                    <div ayStack gap="1">
                      <strong>{{ g.gestor }}</strong>
                      <span ayText="body" size="xs">{{ areaEs(g.area) }}</span>
                    </div>
                  </ng-template>
                  <ng-template ayCelda="atendidos" let-fila>
                    @let g = comoAvanceGestor(fila);
                    <strong>{{ g.atendidos }}</strong>
                  </ng-template>
                  <ng-template ayCelda="pendientes" let-fila>
                    @let g = comoAvanceGestor(fila);
                    <div ayRow gap="1" [ajuste]="true">
                      <ay-badge size="sm" tono="neutral">{{ g.pendientes }} activos</ay-badge>
                      @if (g.riesgo > 0) {
                        <ay-badge size="sm" tono="warning">{{ g.riesgo }} en riesgo</ay-badge>
                      }
                    </div>
                  </ng-template>
                  <ng-template ayCelda="sla" let-fila>
                    @let g = comoAvanceGestor(fila);
                    <ay-badge size="sm" tono="success">{{ g.sla }}</ay-badge>
                  </ng-template>
                  <ng-template ayCelda="csat" let-fila>
                    @let g = comoAvanceGestor(fila);
                    <div ayStack gap="1">
                      <ay-badge size="sm" tono="success">{{ g.csat }} ★</ay-badge>
                      <span ayText="subtitle" size="xs">{{ g.encuestas }} de {{ g.enviadas }} respondidas</span>
                    </div>
                  </ng-template>
                </ay-table>
              </ay-card-body>
            </ay-card>
          </div>
        }

        <!-- 3. Tus tickets pendientes / en riesgo para cerrar hoy -->
        <div ayStack gap="2">
          <div ayRow gap="3" justificar="between" [ajuste]="true">
            <div ayStack gap="1">
              <ay-heading [nivel]="2" size="sm">
                Tus tickets pendientes y prioridades para cerrar hoy
              </ay-heading>
              <span ayText="subtitle" size="xs">
                Tus casos activos que requieren seguimiento o primera respuesta durante tu jornada de hoy.
              </span>
            </div>
            <ay-badge tono="warning">{{ misTicketsEnRiesgoHoy().length }} requieren acción inmediata</ay-badge>
          </div>

          <ay-card superficie="solid">
            <ay-card-body padding="sm">
              <ay-table
                leyenda="Tickets pendientes del día"
                [columnas]="columnasBandeja"
                [filas]="misTicketsPendientesHoy()"
                [rayada]="true"
              >
                <span ayVacio ayText="subtitle" size="sm">No tienes tickets asignados pendientes hoy.</span>
                <ng-template ayCelda="rayo" let-fila>
                  @let t = comoTicket(fila);
                  <div class="pl-atc-rayo-celda">
                    <button
                      type="button"
                      class="pl-atc-rayo-icono"
                      [class.pl-atc-rayo-icono--activo]="t.rayo"
                      [attr.aria-pressed]="t.rayo"
                      [attr.aria-label]="t.rayo ? 'Quitar prioridad Rayo' : 'Marcar con prioridad Rayo'"
                      [title]="t.rayo ? 'Prioridad Rayo activa (clic para quitar)' : 'Marcar con prioridad Rayo'"
                      (click)="alternarRayo(t)"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
                      </svg>
                    </button>
                  </div>
                </ng-template>
                <ng-template ayCelda="num" let-fila>
                  @let t = comoTicket(fila);
                  <div ayStack gap="1">
                    <strong ayText="mono" size="xs">{{ t.num }}</strong>
                    <span ayText="body" size="xs">{{ t.empresa.nombre }}</span>
                  </div>
                </ng-template>
                <ng-template ayCelda="prio" let-fila>
                  @let t = comoTicket(fila);
                  <ay-badge
                    size="sm"
                    [tono]="
                      t.prio === 'URGENT'
                        ? 'danger'
                        : t.prio === 'HIGH'
                          ? 'warning'
                          : t.prio === 'MEDIUM'
                            ? 'info'
                            : 'neutral'
                    "
                  >
                    {{ nombrePrioridad(t.prio) }}
                  </ay-badge>
                </ng-template>
                <ng-template ayCelda="cli" let-fila>
                  @let t = comoTicket(fila);
                  <div ayStack gap="1">
                    <strong>{{ t.cli }}</strong>
                    <span ayText="body" size="xs">{{ t.proj }}</span>
                  </div>
                </ng-template>
                <ng-template ayCelda="ch" let-fila>
                  @let t = comoTicket(fila);
                  <div ayStack gap="1">
                    <ay-badge size="sm" tono="neutral">{{ t.ch }}</ay-badge>
                    <span ayText="body" size="xs">{{ nombreTipo(t.type) }}</span>
                  </div>
                </ng-template>
                <ng-template ayCelda="area" let-fila>
                  @let t = comoTicket(fila);
                  <div ayStack gap="1">
                    <strong>{{ areaEs(t.area) }}</strong>
                    <span ayText="body" size="xs">{{ t.owner ?? 'Sin asignar' }}</span>
                  </div>
                </ng-template>
                <ng-template ayCelda="state" let-fila>
                  @let t = comoTicket(fila);
                  <ay-badge size="sm" [tono]="t.state === 'ESCALATED' || t.state === 'IN_COMMITTEE' ? 'danger' : 'info'">
                    {{ estadoEs[t.state] ?? t.state }}
                  </ay-badge>
                </ng-template>
                <ng-template ayCelda="sla" let-fila>
                  @let t = comoTicket(fila);
                  <div ayStack gap="1">
                    <ay-badge size="sm" [tono]="evaluarSla(t).tono">{{ evaluarSla(t).txt }}</ay-badge>
                    @if (evaluarSla(t).due; as due) {
                      <span ayText="mono" size="xs">{{ tiempoRestante(due) }}</span>
                    }
                  </div>
                </ng-template>
                <ng-template ayCelda="acciones" let-fila>
                  @let t = comoTicket(fila);
                  <div class="pl-atc-acciones-celda">
                    <ay-button tamano="sm" variante="secondary" (click)="seleccionarTicket.emit(t.num)">
                      Ver ticket
                    </ay-button>
                    <ay-button
                      tamano="sm"
                      variante="secondary"
                      [disabled]="!t.contract"
                      [attr.title]="t.contract ? 'Ver contrato ' + t.contract : 'Sin contrato vinculado'"
                      (click)="t.contract && verContrato.emit(t.contract)"
                    >
                      Contrato
                    </ay-button>
                  </div>
                </ng-template>
              </ay-table>
            </ay-card-body>
          </ay-card>
        </div>

      </div>
    }

    <!-- ====================================================================== -->
    <!-- VISTA 2: ALTA MULTICANAL CON SLA CONGELADO Y FLUJO DE CONFIGURACIÓN    -->
    <!-- ====================================================================== -->
    @if (subvista() === 'nuevo') {
      <div ayStack gap="6">
        <ay-page-header
          titulo="Nuevo ticket"
          descripcion="Registra la solicitud tipificada desde el primer contacto. Al guardar, se asigna el número de ticket de la razón social y se fijan los plazos de atención (SLA)."
        />

        @if (!estadoProto.puedeRegistrarTicket()) {
          <ay-card superficie="solid">
            <ay-card-body padding="md" gap="md">
              <ay-empty-state
                titulo="Acceso restringido (403)"
                descripcion="Necesitas un rol de atención (gestor de tickets, colaborador o supervisor) para registrar tickets."
              />
              <ay-alert tono="info" size="sm" titulo="Intento registrado en auditoría">
                Tu intento de registrar un ticket con el perfil «{{ estadoProto.perfilActivo().cargo }}» quedó registrado con tu usuario y la hora.
              </ay-alert>
            </ay-card-body>
          </ay-card>
        } @else {
          <div ayGrid [columnas]="3" gap="md">
            <div class="pl-atc-col-span-2">
              <ay-card variante="elevated" superficie="solid">
                <ay-card-body padding="md" gap="md">
                  <ay-form class="pl-atc-form-ancho" (enviar)="guardarNuevoTicket()">
                    <div ayStack gap="4">
                      <div ayGrid [columnas]="3" gap="sm" class="pl-atc-fila-campos pl-atc-fila-campos--reserva">
                        <ay-form-field etiqueta="Empresa (razón social y RUC)" obligatorio>
                          <ay-select nombre="form-empresa"
                            [opciones]="opcionesEmpresasForm"
                            [valor]="formEmpresa()"
                            (valorChange)="formEmpresa.set($event)"
                          />
                        </ay-form-field>
                        <ay-form-field etiqueta="Línea de negocio" obligatorio>
                          <ay-select nombre="form-linea"
                            [opciones]="opcionesLineasForm"
                            [valor]="formLinea()"
                            (valorChange)="formLinea.set($event)"
                          />
                        </ay-form-field>
                        <ay-form-field etiqueta="Canal de entrada" obligatorio>
                          <ay-select nombre="form-canal"
                            [opciones]="opcionesCanalesForm"
                            [valor]="formCanal()"
                            (valorChange)="formCanal.set($event)"
                          />
                        </ay-form-field>
                        <ay-form-field
                          etiqueta="Establecimiento"
                          ayuda="Déjalo vacío si el canal es remoto (WhatsApp, correo, Mi Portal)."
                        >
                          <ay-input nombre="form-establecimiento"
                            [valor]="formEstablecimiento()"
                            (valorChange)="formEstablecimiento.set($event)"
                            placeholder="Ej. Sede Central San Isidro"
                          />
                        </ay-form-field>
                        <ay-form-field etiqueta="Tipo de ticket" obligatorio>
                          <ay-select nombre="form-tipo"
                            [opciones]="opcionesTiposForm"
                            [valor]="formTipo()"
                            (valorChange)="cambiarTipoForm($event)"
                          />
                        </ay-form-field>
                        <ay-form-field
                          etiqueta="Subtipo de ticket"
                          [obligatorio]="subtiposForm().length > 0"
                          [ayuda]="avisoSubtiposProvisionales()"
                          [error]="subtipoInvalido() ? 'Elige un subtipo.' : undefined"
                        >
                          <ay-select nombre="form-subtipo"
                            [opciones]="opcionesSubtiposForm()"
                            [valor]="formSubtipo()"
                            [disabled]="subtiposForm().length === 0"
                            [invalido]="subtipoInvalido()"
                            [placeholder]="subtiposForm().length === 0 ? 'Este tipo no tiene subtipos' : 'Selecciona un subtipo'"
                            (valorChange)="formSubtipo.set($event)"
                          />
                        </ay-form-field>
                        <ay-form-field etiqueta="Prioridad" obligatorio>
                          <ay-select nombre="form-prioridad"
                            [opciones]="opcionesPrioridadForm"
                            [valor]="formPrioridad()"
                            (valorChange)="cambiarPrioridadForm($event)"
                          />
                        </ay-form-field>
                        <ay-form-field etiqueta="Cliente o interesado" obligatorio>
                          <ay-input nombre="form-cliente" [valor]="formCliente()" (valorChange)="formCliente.set($event)" />
                        </ay-form-field>
                        <ay-form-field etiqueta="Documento (DNI / CE)" obligatorio>
                          <ay-input nombre="form-dni" [valor]="formDni()" (valorChange)="formDni.set($event)" />
                        </ay-form-field>
                        <ay-form-field
                          etiqueta="Proyecto y lote / unidad"
                          ayuda="Solo si la solicitud es de un lote."
                        >
                          <ay-input nombre="form-proyecto" [valor]="formProyecto()" (valorChange)="formProyecto.set($event)" />
                        </ay-form-field>
                      </div>

                      <ay-form-group
                        leyenda="Excepción de consulta del cliente"
                        descripcion="Si el cliente no existe en SIGDA/TAXON o la fuente no responde, el ticket se registra con datos mínimos y queda pendiente de vincular."
                        variante="card"
                      >
                        <ay-checkbox
                          [marcado]="formContingencia()"
                          (marcadoChange)="formContingencia.set($event)"
                        >
                          Registrar como interesado (el cliente no está en SIGDA/TAXON o el sistema no responde)
                        </ay-checkbox>
                      </ay-form-group>

                      @if (formTipo() === 'CIT') {
                        <ay-form-field
                          etiqueta="Contrato de mantenimiento de ciudad (opcional si deriva en cobro)"
                        >
                          <ay-input nombre="form-contrato-ciudad"
                            [valor]="formContratoCiudad()"
                            (valorChange)="formContratoCiudad.set($event)"
                            placeholder="Ej. CITY_SERVICE_FEE-2026-0113"
                          />
                        </ay-form-field>
                      }

                      <div ayGrid [columnas]="2" gap="md" class="pl-atc-fila-campos">
                        <ay-form-field etiqueta="Resumen (una línea que se entienda en la bandeja)" obligatorio>
                          <ay-textarea nombre="form-resumen"
                            [filas]="3"
                            [valor]="formResumen()"
                            (valorChange)="formResumen.set($event)"
                          />
                        </ay-form-field>
                        <ay-form-field etiqueta="Descripción">
                          <ay-textarea nombre="form-descripcion"
                            [filas]="3"
                            [valor]="formDescripcion()"
                            (valorChange)="formDescripcion.set($event)"
                          />
                        </ay-form-field>
                      </div>

                      <div ayRow gap="2" justificar="end">
                        <ay-button
                          tipo="submit"
                          variante="primary"
                          [disabled]="subtipoInvalido()"
                        >
                          Registrar ticket
                        </ay-button>
                      </div>
                    </div>
                  </ay-form>
                </ay-card-body>
              </ay-card>
            </div>

            <!-- Lateral derecho: SLA que se congelará + Flujo de Workflow -->
            <div ayStack gap="4" class="pl-atc-col-lateral">
              <app-sla-conservadora [sla]="slaPrevisto()" />

              <ay-card superficie="solid">
                <ay-card-header
                  titulo="Flujo configurado que se aplicará"
                  [subtitulo]="previewFlujoConfig() ? 'Workflow › Flujos · v' + previewFlujoConfig()!.versionActual : 'Workflow › Flujos'"
                  nivel="h2"
                  [separador]="true"
                />
                <ay-card-body padding="sm" gap="sm">
                  @if (previewFlujoConfig(); as fl) {
                    <ay-card-pairs [pares]="paresPreviewFlujoConfig()" />
                    <app-pasos-flujo [pasos]="fl.pasos" />
                    <span ayText="body" size="xs">
                      Si el Administrador Funcional publica una nueva versión del flujo en Workflow, los nuevos tickets usarán esa versión automáticamente.
                    </span>
                  } @else if (subtiposForm().length > 0 && !formSubtipo()) {
                    <ay-alert tono="info" size="sm" titulo="Elige un subtipo">
                      El flujo depende del tipo y del subtipo. Al elegir el subtipo verás su flujo.
                    </ay-alert>
                  } @else {
                    <ay-alert tono="warning" size="sm" titulo="Sin flujo publicado">
                      Este tipo y subtipo no tiene flujo. El ticket entrará a la cola del área, sin responsable asignado, y se avisará al Administrador Funcional.
                    </ay-alert>
                  }
                </ay-card-body>
              </ay-card>
            </div>
          </div>
        }
      </div>
    }

    <!-- ====================================================================== -->
    <!-- VISTA 3: DETALLE DE TICKET (centro de mando: cifras, workflow, pestañas) -->
    <!-- ====================================================================== -->
    @if (subvista() === 'detalle') {
      @for (t of ticketVista(); track t.num) {
        <app-detalle-creativa
          [ticket]="t"
          [volverA]="volverA()"
          (volver)="volver.emit()"
          (verContrato)="verContrato.emit($event)"
          (resolver)="resolverTicket(ticketActual()!)"
          (reabrir)="reabrirTicket(ticketActual()!)"
          (elevarAComite)="elevarAComite(ticketActual()!)"
          (derivado)="derivarDesdeDetalle($event)"
        />
      }
    }

    <!-- Modal global de Reasignación Masiva para Bandeja y Tu Día -->
    @if (subvista() === 'tudia') {
      <ay-modal
        [abierto]="modalCeseAbierto()"
        (abiertoChange)="modalCeseAbierto.set($event)"
        titulo="Reasignación masiva auditable por cese o rotación"
      >
        <ay-form (enviar)="ejecutarReasignacionMasiva()">
          <div ayStack gap="3">
            <p ayText="body" size="sm">
              Transfiere en bloque los tickets abiertos del colaborador saliente conservando el compromiso SLA original
              y dejando registro inmutable en la bitácora de asignación.
            </p>
            <ay-form-field etiqueta="Colaborador que cesa o rota" obligatorio>
              <ay-select nombre="cese-origen-2"
                [opciones]="opcionesCeseOrigen"
                [valor]="ceseOrigen()"
                (valorChange)="ceseOrigen.set($event)"
              />
            </ay-form-field>
            <ay-form-field etiqueta="Nuevo responsable receptor (menor carga activa)" obligatorio>
              <ay-select nombre="cese-destino-2"
                [opciones]="opcionesCeseDestino"
                [valor]="ceseDestino()"
                (valorChange)="ceseDestino.set($event)"
              />
            </ay-form-field>
            <ay-form-field etiqueta="Motivo tipificado de auditoría" obligatorio>
              <ay-select nombre="cese-motivo-2"
                [opciones]="opcionesCeseMotivo"
                [valor]="ceseMotivo()"
                (valorChange)="ceseMotivo.set($event)"
              />
            </ay-form-field>
            <div ayRow gap="2" justificar="end">
              <ay-button variante="ghost" (click)="modalCeseAbierto.set(false)">Cancelar</ay-button>
              <ay-button tipo="submit" variante="primary">
                Ejecutar reasignación masiva
              </ay-button>
            </div>
          </div>
        </ay-form>
      </ay-modal>
    }
  `,
})
export class VistaOperacionComponent {
  readonly estadoProto = inject(EstadoPrototipoAtcService);
  readonly subvista = input.required<'bandeja' | 'tudia' | 'nuevo' | 'detalle'>();
  readonly tickets = input.required<TicketAtc[]>();
  readonly ticketSeleccionadoNum = input.required<string>();
  readonly mostrarHu = input<boolean>(false);
  /** GRA-02: cliente y lote desde los que la Vista 360 abrió «Nueva gestión»; precargan el formulario. */
  readonly contexto = input<{ cliente: string; dni: string; proyecto: string; lote?: string } | null>(null);
  readonly filtroClienteExterno = input<string>('');

  readonly volverA = input<string>('Bandeja de tickets');
  readonly volver = output<void>();
  readonly seleccionarTicket = output<string>();
  readonly irANuevo = output<void>();
  /** Documento de quien llama en la llamada de ejemplo de la card: con él se abre su ficha en Consulta 360. */
  protected readonly dniLlamadaEntrante = '70134409';
  /** Pide abrir Consulta 360; con `dni`, ya con la ficha de ese cliente. */
  readonly irA360 = output<string | undefined>();
  readonly verContrato = output<string>();
  readonly ticketCreado = output<{ ticket: TicketAtc; crearAsientoLibro: boolean }>();

  readonly empresas = EMPRESAS_AYBAR;
  readonly lineas = LINEAS_NEGOCIO;
  readonly canales = CANALES_ATC;
  readonly tipos = TIPOS_TICKET;
  readonly prioridades = PRIORIDADES_TICKET;
  readonly areas = AREAS_ATC;
  readonly estados = ESTADOS_TICKET;
  readonly estadoEs = ESTADO_ES;
  readonly traducir = traducirCodigos;
  areaEs(a: string): string {
    return etiqueta(AREA_ES, a);
  }
  readonly motivos = MOTIVOS_DERIVACION;

  readonly columnasBandeja: readonly AyColumna[] = [
    { clave: 'rayo', cabecera: 'Rayo', ancho: '5.5rem', ordenable: true },
    { clave: 'num', cabecera: 'N.º Ticket / Empresa', ancho: '9.5rem', ordenable: true },
    { clave: 'prio', cabecera: 'Prioridad', ancho: '7.5rem', ordenable: true },
    { clave: 'cli', cabecera: 'Cliente / Proyecto', ordenable: true },
    { clave: 'ch', cabecera: 'Canal / Tipo', ancho: '9.5rem', ordenable: true },
    { clave: 'area', cabecera: 'Área / Gestor', ancho: '9.5rem', ordenable: true },
    { clave: 'state', cabecera: 'Estado', ancho: '9rem', ordenable: true },
    { clave: 'sla', cabecera: 'Compromiso SLA', ancho: '9.5rem', ordenable: true },
    { clave: 'acciones', cabecera: 'Acciones', alineacion: 'end', ancho: '17.5rem' },
  ];


  /** Bandeja: Acciones compacta (Ver ticket + menú ⋯); Tu Día conserva `columnasBandeja`. */
  readonly columnasBandejaCompacta: readonly AyColumna[] = this.columnasBandeja.map((c) =>
    c.clave === 'acciones' ? { ...c, ancho: '8rem' } : c,
  );

  // Una lista por combinación (contrato, dueño): el input de ay-dropdown-menu no cambia entre ciclos.
  private readonly menuMas: Record<string, AyMenuItem[]> = Object.fromEntries(
    [false, true].flatMap((c) =>
      [false, true].map((o) => [
        `${c}${o}`,
        [
          { tipo: 'item', value: 'contrato', label: c ? 'Ver contrato' : 'Ver contrato (sin contrato vinculado)', disabled: !c },
          { tipo: 'item', value: 'asignar', label: o ? 'Auto-asignar (ya asignado)' : 'Auto-asignar por menor carga', disabled: o },
        ] as AyMenuItem[],
      ]),
    ),
  );

  itemsMasAcciones(t: TicketAtc): AyMenuItem[] {
    return this.menuMas[`${!!t.contract}${!!t.owner}`];
  }

  elegirMasAccion(v: string, t: TicketAtc): void {
    if (v === 'contrato' && t.contract) this.verContrato.emit(t.contract);
    else if (v === 'asignar' && !t.owner) this.autoAsignarMenorCarga(t);
  }

  confirmarRayo(): void {
    const t = this.rayoPendiente();
    if (t) this.alternarRayo(t);
    this.rayoPendiente.set(null);
  }

  readonly opcionesCeseOrigen: AyOpcionSelect[] = [
    { value: 'C. Rojas', label: 'C. Rojas (ATC)' },
    { value: 'R. Salazar', label: 'R. Salazar (Cobranza)' },
    { value: 'L. Ccahuana', label: 'L. Ccahuana (Postventa)' },
  ];

  readonly opcionesCeseDestino: AyOpcionSelect[] = [
    { value: 'M. Delgado (ATC)', label: 'M. Delgado (ATC · 2 casos activos)' },
    { value: 'I. Quispe (Cobranza)', label: 'I. Quispe (Cobranza · 1 caso activo)' },
  ];

  readonly opcionesCeseMotivo: AyOpcionSelect[] = [
    { value: 'REASSIGNMENT_CESE', label: MOTIVO_ES['REASSIGNMENT_CESE'] },
    { value: 'REASSIGNMENT_ROTACION', label: MOTIVO_ES['REASSIGNMENT_ROTACION'] },
    { value: 'REASSIGNMENT_CARGA', label: MOTIVO_ES['REASSIGNMENT_CARGA'] },
  ];

  readonly opcionesEmpresasForm: AyOpcionSelect[] = EMPRESAS_AYBAR.map((e) => ({
    value: e.id,
    label: `${e.id} · ${e.nombre} (RUC ${e.ruc})`,
  }));

  readonly opcionesLineasForm: AyOpcionSelect[] = LINEAS_NEGOCIO.map((l) => ({
    value: l,
    label: l,
  }));

  readonly opcionesCanalesForm: AyOpcionSelect[] = CANALES_ATC.map((c) => ({
    value: c,
    label: c,
  }));

  readonly opcionesTiposForm: AyOpcionSelect[] = TIPOS_TICKET.filter((tp) => !tp.porFormulario).map((tp) => ({
    value: tp.id,
    label: `${tp.id} · ${tp.nombre}`,
  }));

  readonly opcionesPrioridadForm: AyOpcionSelect[] = PRIORIDADES_TICKET.map((p) => ({
    value: p.id,
    label: `${p.nombre} (${p.id})`,
  }));

  readonly opcionesAreasForm: AyOpcionSelect[] = opcionesDe(AREAS_ATC, AREA_ES);

  readonly opcionesMotivosForm: AyOpcionSelect[] = opcionesDe(MOTIVOS_DERIVACION, MOTIVO_ES);



  readonly columnasEquipoHoy: readonly AyColumna[] = [
    { clave: 'gestor', cabecera: 'Gestor / Área', ordenable: true },
    { clave: 'atendidos', cabecera: 'Atendidos hoy', ancho: '9rem', ordenable: true },
    { clave: 'pendientes', cabecera: 'Carga activa', ancho: '11rem', ordenable: true },
    { clave: 'sla', cabecera: 'SLA hoy', ancho: '8rem', ordenable: true },
    { clave: 'csat', cabecera: 'CSAT hoy', ancho: '12rem', ordenable: true },
  ];

  readonly avanceEquipoHoy = [
    { gestor: 'Ana Torres / C. Rojas (Tú)', area: 'Atención al Cliente Eje 1/2', atendidos: 14, pendientes: 4, riesgo: 1, csat: '4.7', sla: '94%', encuestas: 12, enviadas: 14 },
    { gestor: 'M. Delgado', area: 'Atención al Cliente Eje 1/2', atendidos: 15, pendientes: 2, riesgo: 0, csat: '4.8', sla: '96%', encuestas: 13, enviadas: 15 },
    { gestor: 'R. Salazar', area: 'Cobranza y Recaudación', atendidos: 11, pendientes: 5, riesgo: 2, csat: '4.4', sla: '89%', encuestas: 8, enviadas: 11 },
    { gestor: 'L. Ccahuana', area: 'Postventa y Garantías', atendidos: 9, pendientes: 3, riesgo: 0, csat: '4.6', sla: '92%', encuestas: 7, enviadas: 9 },
  ];

  /**
   * Nombre con el que los tickets de ejemplo guardan al responsable de cada perfil. Los perfiles
   * sin entrada no tienen tickets propios: «Tu día» solo muestra los del usuario (HU-ATC-054 CA-01).
   */
  private readonly responsablePorPerfil: Readonly<Record<string, readonly string[]>> = {
    GESTOR: ['C. Rojas', 'Lucía Benavides'],
    LEGAL_RECLAMOS: ['Dra. P. Vílchez', 'Patricia Vílchez'],
    ANALISTA_COBRANZA: ['Carla V.', 'Carla Villarán'],
  };

  readonly misTicketsPendientesHoy = computed(() =>
    this.tickets()
      .filter((t) => !!t.owner && (this.responsablePorPerfil[this.estadoProto.rolActivo()] ?? []).includes(t.owner))
      .filter((t) => t.state !== 'RESOLVED' && t.state !== 'CLOSED')
      .map((t) => Object.assign(t, { sla: t.resDue.getTime() })),
  );

  readonly misTicketsEnRiesgoHoy = computed(() =>
    this.misTicketsPendientesHoy().filter((t) => evaluarSlaTicket(t).tono !== 'success'),
  );

  readonly ctiEntranteVisible = signal<boolean>(true);
  readonly modalCeseAbierto = signal<boolean>(false);
  readonly rayoPendiente = signal<TicketAtc | null>(null);
  readonly ceseOrigen = signal<string>('C. Rojas');
  readonly ceseDestino = signal<string>('M. Delgado (ATC)');
  readonly ceseMotivo = signal<string>('REASSIGNMENT_CESE');

  readonly formEmpresa = signal<string>('AIN');
  readonly formLinea = signal<string>('Lotes urbanos');
  readonly formCanal = signal<string>('WhatsApp');
  readonly formTipo = signal<string>('CTA');
  readonly formSubtipo = signal<string>('');
  readonly subtiposForm = computed(() => this.estadoProto.subtiposActivosDe(this.formTipo()));
  readonly opcionesSubtiposForm = computed<AyOpcionSelect[]>(() =>
    this.subtiposForm().map((x) => ({ value: x.id, label: x.nombre })),
  );
  readonly subtipoInvalido = computed(() => this.subtiposForm().length > 0 && !this.formSubtipo());
  readonly avisoSubtiposProvisionales = computed(() =>
    this.subtiposForm().some((x) => x.provisional) ? 'Subtipos provisionales del prototipo' : undefined,
  );

  cambiarTipoForm(tipo: string): void {
    this.formTipo.set(tipo);
    this.formSubtipo.set('');
  }
  readonly formPrioridad = signal<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('HIGH');
  readonly formCliente = signal<string>('Eddie Huamaní');
  readonly formDni = signal<string>('7228••••');
  readonly formProyecto = signal<string>('Villa Sol II · Mz. C Lt. 07');
  readonly formEstablecimiento = signal<string>('');
  readonly formContingencia = signal<boolean>(false);
  readonly formContratoCiudad = signal<string>('CITY_SERVICE_FEE-2026-0113');
  readonly formResumen = signal<string>('Solicita confirmación de abono de cuota y horario de bus para EntregaFest.');
  readonly formDescripcion = signal<string>('');

  readonly textoRespuesta = signal<string>('');
  readonly notaInterna = signal<boolean>(false);
  readonly modalDerivarAbierto = signal<boolean>(false);
  readonly derivarArea = signal<string>('LEGAL');
  readonly derivarMotivo = signal<string>('DERIVACION_CONFLICTO_EJE3');
  readonly derivarNota = signal<string>('Se adjunta expediente completo 6/6 para pronunciamiento de Eje 3 Legal.');
  readonly paquete6 = signal<Record<string, boolean>>({
    resumen: true,
    contrato: true,
    cronograma: true,
    interacciones: true,
    evidencia: true,
    emocion: true,
  });

  readonly itemsPaquete6 = [
    { k: 'resumen', label: '1. Resumen objetivo de hechos sin juicios de valor' },
    { k: 'contrato', label: '2. Contrato y adendas firmadas vinculadas (SIGDA / GLI)' },
    { k: 'cronograma', label: '3. Estado de cuenta y cronograma conciliado' },
    { k: 'interacciones', label: '4. Historial íntegro de interacciones multicanal' },
    { k: 'evidencia', label: '5. Sustento documental / voucher / carta del cliente' },
    { k: 'emocion', label: '6. Nota de contexto del cliente e impacto económico estimado' },
  ] as const;

  constructor() {
    effect(() => {
      const ctx = this.contexto();
      if (!ctx) return;
      this.formCliente.set(ctx.cliente);
      // El DNI se muestra enmascarado, como el resto del formulario.
      this.formDni.set(ctx.dni.length > 4 ? `${ctx.dni.slice(0, 4)}••••` : ctx.dni);
      this.formProyecto.set(ctx.lote ? `${ctx.proyecto} · ${ctx.lote}` : ctx.proyecto);
    });
    effect(() => {
      const cliExt = this.filtroClienteExterno();
      if (cliExt !== undefined && cliExt.trim()) {
        this.filtrosBandeja.setBusqueda(cliExt);
      }
    });
    // Cualquier cambio de búsqueda o filtro vuelve a la primera página.
    effect(() => {
      this.filtrosBandeja.huella();
      untracked(() => this.paginaBandeja.set(1));
    });
    effect(() => {
      const maxPag = this.totalPaginasBandeja();
      if (this.paginaBandeja() > maxPag) {
        this.paginaBandeja.set(maxPag);
      }
    });
  }

  comoTicket(fila: unknown): TicketAtc {
    return fila as TicketAtc;
  }

  comoAvanceGestor(fila: unknown): {
    gestor: string;
    area: string;
    atendidos: number;
    pendientes: number;
    riesgo: number;
    csat: string;
    sla: string;
    encuestas: number;
    enviadas: number;
  } {
    return fila as {
      gestor: string;
      area: string;
      atendidos: number;
      pendientes: number;
      riesgo: number;
      csat: string;
      sla: string;
      encuestas: number;
      enviadas: number;
    };
  }

  readonly ticketsConRayo = computed(() => this.tickets().filter((t) => t.rayo).length);

  readonly ordenBandeja = signal<{ clave: string; dir: 'asc' | 'desc' } | undefined>(undefined);
  readonly paginaBandeja = signal<number>(1);
  readonly tamanoPaginaBandeja = signal<number>(6);
  readonly opcionesTamanoPagina: readonly number[] = [6, 10, 20];

  readonly totalPaginasBandeja = computed(() => {
    const tam = this.tamanoPaginaBandeja() || 6;
    return Math.max(1, Math.ceil(this.ticketsFiltrados().length / tam));
  });

  readonly ticketsPaginadosBandeja = computed(() => {
    const lista = this.ticketsFiltrados();
    const tam = this.tamanoPaginaBandeja() || 6;
    const totalPags = Math.max(1, Math.ceil(lista.length / tam));
    const pag = Math.min(Math.max(1, this.paginaBandeja()), totalPags);
    const inicio = (pag - 1) * tam;
    return lista.slice(inicio, inicio + tam);
  });

  readonly filtrosBandeja = crearFiltrosTabla(
    this.tickets,
    {
      clave: 'bandeja-tickets',
      etiquetaElemento: 'tickets',
      etiquetaBusqueda: 'Buscar ticket, cliente o lote',
      placeholderBusqueda: 'N.º ticket, cliente, DNI, proyecto o canal…',
      textoDe: (t) =>
        [
          t.num,
          t.empresa.nombre,
          t.cli,
          t.dni,
          t.proj,
          t.ch,
          this.nombreTipo(t.type),
          t.area,
          t.owner ?? 'Sin asignar (Cola)',
        ].join(' '),
      filtros: [
        {
          id: 'estado',
          etiqueta: 'Estado',
          tipo: 'multi',
          valorDe: (t) => t.state,
          opciones: ESTADOS_TICKET.map((st) => ({ valor: st, etiqueta: ESTADO_ES[st] ?? st })),
        },
        {
          id: 'prioridad',
          etiqueta: 'Prioridad',
          tipo: 'multi',
          valorDe: (t) => t.prio,
          opciones: PRIORIDADES_TICKET.map((p) => ({ valor: p.id, etiqueta: p.nombre })),
        },
        {
          id: 'sla',
          etiqueta: 'SLA',
          tipo: 'multi',
          valorDe: (t) => evaluarSlaTicket(t).tono,
          opciones: [
            { valor: 'success', etiqueta: 'En plazo / Cumplido' },
            { valor: 'warning', etiqueta: 'Por vencer (Alerta)' },
            { valor: 'danger', etiqueta: 'Vencido / Crítico' },
          ],
        },
        {
          id: 'rayo',
          etiqueta: 'Prioridad Rayo',
          tipo: 'multi',
          valorDe: (t) => (t.rayo ? 'SI' : 'NO'),
          opciones: [
            { valor: 'SI', etiqueta: '⚡ Con prioridad Rayo' },
            { valor: 'NO', etiqueta: 'Sin prioridad Rayo' },
          ],
        },
        {
          id: 'proyecto',
          etiqueta: 'Proyecto / Unidad',
          tipo: 'multi',
          conBusqueda: true,
          valorDe: (t) => t.proj,
        },
        {
          id: 'cliente',
          etiqueta: 'Cliente titular',
          tipo: 'multi',
          conBusqueda: true,
          valorDe: (t) => t.cli,
        },
        {
          id: 'gestor',
          etiqueta: 'Gestor',
          tipo: 'multi',
          conBusqueda: true,
          valorDe: (t) => t.owner ?? 'SIN_ASIGNAR',
          etiquetaDe: (g) => (g === 'SIN_ASIGNAR' ? 'Sin asignar (Cola)' : g),
        },
        {
          id: 'area',
          etiqueta: 'Área',
          tipo: 'multi',
          valorDe: (t) => t.area,
          opciones: AREAS_ATC.map((a) => ({ valor: a, etiqueta: etiqueta(AREA_ES, a) })),
        },
        {
          id: 'tipo',
          etiqueta: 'Tipo',
          tipo: 'multi',
          valorDe: (t) => t.type,
          opciones: TIPOS_TICKET.map((tp) => ({ valor: tp.id, etiqueta: `${tp.id} · ${tp.nombre}` })),
        },
        {
          id: 'canal',
          etiqueta: 'Canal',
          tipo: 'multi',
          valorDe: (t) => t.ch,
          opciones: CANALES_ATC.map((c) => ({ valor: c, etiqueta: c })),
        },
        {
          id: 'empresa',
          etiqueta: 'Empresa',
          tipo: 'multi',
          conBusqueda: true,
          valorDe: (t) => t.co,
          opciones: EMPRESAS_AYBAR.map((e) => ({ valor: e.id, etiqueta: `${e.id} · ${e.nombre}` })),
        },
        {
          id: 'fechaSla',
          etiqueta: 'Fecha vencimiento SLA',
          tipo: 'rango-fechas',
          valorDe: (t) => t.resDue,
        },
        {
          id: 'fechaApertura',
          etiqueta: 'Fecha de apertura',
          tipo: 'rango-fechas',
          valorDe: (t) => t.opened,
        },
      ],
    },
    inject(EstadoFiltrosTablas),
  );

  readonly ticketsFiltrados = computed(() => {
    const base = this.filtrosBandeja
      .filtradas()
      .map((t) => Object.assign(t, { sla: t.resDue.getTime() }));
    const orden = this.ordenBandeja();
    if (!orden) {
      return [...base].sort((a, b) => {
        if (a.rayo !== b.rayo) return a.rayo ? -1 : 1;
        return a.resDue.getTime() - b.resDue.getTime();
      });
    }
    return [...base].sort((a, b) => {
      const va = (a as unknown as Record<string, unknown>)[orden.clave];
      const vb = (b as unknown as Record<string, unknown>)[orden.clave];
      let cmp = 0;
      if (typeof va === 'number' && typeof vb === 'number') {
        cmp = va - vb;
      } else {
        cmp = String(va ?? '').localeCompare(String(vb ?? ''), 'es', {
          numeric: true,
          sensitivity: 'base',
        });
      }
      return orden.dir === 'asc' ? cmp : -cmp;
    });
  });

  /** El ticket se edita en sitio (como el resto del prototipo): este contador avisa a la vista de que cambió. */
  private readonly revision = signal(0);
  /** Copia superficial del ticket abierto, nueva con cada cambio, para que la vista del detalle se actualice. */
  readonly ticketVista = computed<TicketAtc[]>(() => {
    this.revision();
    const t = this.ticketActual();
    return t ? [{ ...t }] : [];
  });

  readonly ticketActual = computed<TicketAtc | undefined>(() => {
    const num = this.ticketSeleccionadoNum();
    return this.tickets().find((t) => t.num === num) ?? this.tickets()[0];
  });

  readonly esTipoLibro = computed(
    () => this.tipos.find((x) => x.id === this.formTipo())?.libro ?? false,
  );

  readonly previewPoliticaSla = computed(() =>
    this.estadoProto.calcularPoliticaVigente(this.formTipo(), this.formPrioridad()),
  );

  /** Flujo publicado para el tipo y subtipo elegidos; `null` si falta el subtipo o si no hay flujo. */
  readonly previewFlujoConfig = computed(() => {
    if (this.subtiposForm().length > 0 && !this.formSubtipo()) return null;
    return this.estadoProto.buscarFlujo(this.formTipo(), this.formSubtipo() || undefined);
  });

  /** Lo que muestra la card de plazos: la política vigente y sus vencimientos. */
  readonly slaPrevisto = computed<SlaPrevisto>(() => {
    const c = this.previewPoliticaSla();
    return {
      politica: `${c.politica.id} · v${c.politica.version}`,
      origen: c.origen,
      etiquetaOrigen: c.etiquetaOrigen,
      apertura: AHORA_BASE,
      venceRespuesta: c.venceRespuesta,
      venceResolucion: c.venceResolucion,
      respuestaH: c.politica.respuestaH,
      resolucionH: c.politica.resolucionH,
      libroFecha: this.esTipoLibro() ? sumarDiasHabiles(AHORA_BASE, 15) : null,
      nombreTipo: this.nombreTipo(this.formTipo()),
    };
  });

  readonly paresPreviewFlujoConfig = computed<ParCardPairs[]>(() => {
    const fl = this.previewFlujoConfig();
    if (!fl) return [];
    const paso1 = fl.pasos[0];
    return [
      { clave: 'Versión del flujo', valor: `v${fl.versionActual} (${this.estadoProto.etiquetaFlujo(fl)})` },
      { clave: 'Área receptora', valor: this.areaEs(fl.area) },
      {
        clave: 'Responsable inicial',
        valor: paso1 ? paso1.responsable : 'Cola del área',
      },
    ];
  });

  readonly conteoPaquete6 = computed(
    () => Object.values(this.paquete6()).filter(Boolean).length,
  );

  paresDetalleTicket(t: TicketAtc): ParCardPairs[] {
    return [
      { clave: 'N.º de ticket', valor: `${t.num} · ${this.nombreTipo(t.type)}` },
      { clave: 'Razón Social', valor: `${t.empresa.nombre} (RUC ${t.empresa.ruc})` },
      { clave: 'Cliente / Proyecto', valor: `${t.cli} (${t.dni}) · ${t.proj}` },
      { clave: 'Canal de entrada', valor: t.ch },
      { clave: 'Área / sala', valor: t.area },
      { clave: 'Responsable', valor: t.owner ?? 'Sin asignar (Cola)' },
      {
        clave: 'Estado',
        valor: ESTADO_ES[t.state] ?? t.state,
      },
      {
        clave: 'Prioridad',
        valor: this.nombrePrioridad(t.prio) + (t.rayo ? ' · Rayo (marca visual: no escala por sí sola)' : ''),
      },
      { clave: 'Política SLA aplicada', valor: t.slaSrc },
      {
        clave: 'SLA (1.ª respuesta / resolución)',
        valor: `Vence 1.ª resp: ${this.fmtHora(t.frDue)} · Vence resolución: ${this.fmtHora(t.resDue)}`,
      },
      {
        clave: 'Hitos de atención',
        valor: `Apertura: ${this.fmtHora(t.opened)} · 1.ª resp: ${this.fmtHora(t.firstResp)}`,
      },
    ];
  }

  /** Recorrido del flujo configurado para el tipo, con responsable y horas por actividad. */
  recorridoFlujo(t: TicketAtc): string[] {
    return this.flujoDeTicket(t.type, t.subtipo).pasos.map(
      (p, i) => `${i + 1}. ${p.nombre} · ${p.responsable} · ${p.horas} h`,
    );
  }

  hitosBitacoraTicket(t: TicketAtc): AyTimelineEvento[] {
    return t.log.map((lg, idx) => ({
      id: `${t.num}-log-${idx}`,
      titulo: `${etiqueta(MOTIVO_ES, lg.motivo)} — ${traducirCodigos(lg.nota)}`,
      fecha: lg.fecha,
      autor: `${etiqueta(AREA_ES, lg.area)} · ${lg.responsable ?? 'Cola'}`,
      tono: lg.area === 'LEGAL' ? 'danger' : 'accent',
    }));
  }

  cambiarPrioridadForm(val: string): void {
    if (val === 'LOW' || val === 'MEDIUM' || val === 'HIGH' || val === 'URGENT') {
      this.formPrioridad.set(val);
    }
  }

  nombreTipo(id: string): string {
    return this.tipos.find((t) => t.id === id)?.nombre ?? id;
  }

  nombrePrioridad(id: string): string {
    return this.prioridades.find((p) => p.id === id)?.nombre ?? id;
  }

  evaluarSla(t: TicketAtc): { tono: 'success' | 'warning' | 'danger'; txt: string; due?: Date } {
    return evaluarSlaTicket(t);
  }

  tiempoRestante(due: Date): string {
    return tiempoRestanteTexto(due);
  }

  fmtHora(d?: Date | null): string {
    return fmtFechaHora(d);
  }

  atenderLlamadaCti(numTicket: string): void {
    this.ctiEntranteVisible.set(false);
    this.seleccionarTicket.emit(numTicket);
  }

  alternarRayo(t: TicketAtc): void {
    t.rayo = !t.rayo;
  }

  autoAsignarMenorCarga(t: TicketAtc): void {
    t.owner = 'M. Delgado (Menor carga · 2 activos)';
    t.state = 'IN_PROGRESS';
    t.log.push({
      fecha: AHORA_BASE,
      area: t.area,
      responsable: t.owner,
      motivo: 'AUTO_ASIGNACION_MENOR_CARGA',
      nota: 'Asignado automáticamente por balanceador de carga (correo enviado con CC al líder de área).',
    });
  }

  ejecutarReasignacionMasiva(): void {
    const orig = this.ceseOrigen();
    const dest = this.ceseDestino();
    const mot = this.ceseMotivo();
    this.tickets().forEach((t) => {
      if (t.owner === orig && t.state !== 'CLOSED') {
        t.owner = dest;
        t.log.push({
          fecha: AHORA_BASE,
          area: t.area,
          responsable: dest,
          motivo: mot,
          nota: `Reasignación masiva desde ${orig} conservando SLA original`,
        });
      }
    });
    this.modalCeseAbierto.set(false);
  }

  guardarNuevoTicket(): void {
    if (this.subtipoInvalido()) return;
    const emp = this.empresas.find((e) => e.id === this.formEmpresa()) ?? this.empresas[0];
    const calcSla = this.previewPoliticaSla();
    const flujo = this.previewFlujoConfig();
    if (calcSla.origen === 'global') {
      this.estadoProto.registrarAlertaPoliticaFaltante(this.formTipo());
    }
    const corr = String(Math.floor(500 + Math.random() * 400)).padStart(6, '0');
    const num = `${emp.id}-${corr}`;
    if (!flujo) this.estadoProto.registrarAlertaFlujoFaltante(this.formTipo(), this.formSubtipo() || undefined);
    const areaInicial = flujo?.area ?? 'ATC';
    const responsableInicial = flujo?.pasos[0]?.responsable ?? null;

    const nuevo: TicketAtc = {
      num,
      co: emp.id,
      empresa: emp,
      line: this.formLinea(),
      ch: this.formCanal(),
      cli: this.formContingencia() ? `${this.formCliente()} (sin vincular)` : this.formCliente(),
      dni: this.formDni(),
      proj: this.formProyecto(),
      type: this.formTipo(),
      subtipo: this.formSubtipo() || undefined,
      prio: this.formPrioridad(),
      state: 'OPEN',
      area: areaInicial,
      owner: responsableInicial,
      opened: AHORA_BASE,
      frDue: calcSla.venceRespuesta,
      resDue: calcSla.venceResolucion,
      slaSrc: `${calcSla.politica.id} v${calcSla.politica.version}${flujo ? ` · Flujo v${flujo.versionActual}` : ' · Sin flujo publicado'}`,
      reopen: 0,
      conflict: false,
      rayo: false,
      emotion: '',
      eje: 1,
      establecimiento: this.formEstablecimiento().trim() || undefined,
      contract: this.formTipo() === 'CIT' ? this.formContratoCiudad() : null,
      summary: this.formResumen(),
      interactions: [
        {
          tipo: 'cli',
          fecha: AHORA_BASE,
          canal: this.formCanal(),
          autor: this.formCliente(),
          texto: this.formResumen(),
        },
      ],
      log: [
        {
          fecha: AHORA_BASE,
          area: areaInicial,
          responsable: responsableInicial,
          motivo: this.formContingencia() ? 'ALTA_SIN_CLIENTE_VINCULADO' : 'ALTA_FLUJO_CONFIGURADO',
          nota: flujo
            ? `Enrutado por Flujo ${this.estadoProto.etiquetaFlujo(flujo)} v${flujo.versionActual} y SLA fijado con ${calcSla.politica.id} v${calcSla.politica.version}.`
            : `Sin flujo publicado: queda en la cola del área ${areaInicial}, sin responsable. SLA fijado con ${calcSla.politica.id} v${calcSla.politica.version}. Se alertó al Administrador Funcional.`,
        },
      ],
      status: [{ fecha: AHORA_BASE, estado: 'OPEN', autor: this.estadoProto.perfilActivo().nombre }],
    };

    this.ticketCreado.emit({ ticket: nuevo, crearAsientoLibro: this.esTipoLibro() });
  }

  flujoDeTicket(type: string, subtipo?: string) {
    return this.estadoProto.obtenerFlujoActivo(type, subtipo);
  }

  guiaConfigDeTicket(type: string) {
    const g = this.estadoProto.obtenerGuiaActiva(type);
    if (g && g.versionActual === null) {
      this.estadoProto.reportarFaltaDeGuia(type);
    }
    return g;
  }

  guiaActual(type: string): { titulo: string; pasos: string[]; plantillaIa: string } {
    const gCfg = this.estadoProto.obtenerGuiaActiva(type);
    if (gCfg && gCfg.versionActual !== null && gCfg.pasos.length > 0) {
      const resumenActual = this.ticketActual()?.summary ?? 'su solicitud';
      const tpl = (gCfg.plantillas[0] ?? 'Atendimos tu solicitud «{resumen}».').replace(
        /\{resumen\}/g,
        resumenActual,
      );
      return {
        titulo: `${gCfg.nombreTipo} · v${gCfg.versionActual}`,
        pasos: [...gCfg.pasos],
        plantillaIa: tpl,
      };
    }
    const g = GUIAS_SOLUCION[type] ?? GUIAS_SOLUCION['CTA'];
    return { titulo: g.titulo, pasos: [...g.pasos], plantillaIa: g.plantillaIa };
  }

  usarPlantillaIa(t: TicketAtc): void {
    this.textoRespuesta.set(this.guiaActual(t.type).plantillaIa);
  }

  registrarDecisionIa(t: TicketAtc, decision: 'ACEPTADA' | 'EDITADA' | 'DESCARTADA'): void {
    if (decision === 'ACEPTADA') {
      this.usarPlantillaIa(t);
    } else if (decision === 'DESCARTADA') {
      this.textoRespuesta.set('');
    }
    this.estadoProto.decisionesIaAudit.update((prev) => [
      {
        id: `ia-${Date.now()}`,
        fecha: AHORA_BASE,
        ticketNum: t.num,
        decision,
        anonimizados: 2,
        autor: this.estadoProto.perfilActivo().nombre,
      },
      ...prev,
    ]);
  }

  evaluarBorradorIa(): string {
    const txt = this.textoRespuesta().trim();
    if (!txt) {
      return 'Escribe un borrador o pulsa «Autocompletar con Copiloto IA» para validar empatía, claridad normativa y cumplimiento de plazo.';
    }
    if (txt.length < 40) {
      return 'Sugerencia IA: Incluye el número de ticket correlativo y el plazo específico en horas/días hábiles para evitar recontactos.';
    }
    return 'Borrador verificado por IA: tono empático, menciona trazabilidad y respeta las reglas de comunicación sin promesas fuera de matriz.';
  }

  agregarInteraccion(t: TicketAtc): void {
    const txt = this.textoRespuesta().trim();
    if (!txt) return;
    t.interactions.push({
      tipo: this.notaInterna() ? 'int' : 'agt',
      fecha: AHORA_BASE,
      canal: t.ch,
      autor: 'C. Rojas (ATC)',
      texto: txt,
    });
    if (!this.notaInterna() && !t.firstResp) {
      t.firstResp = AHORA_BASE;
    }
    this.textoRespuesta.set('');
  }

  resolverTicket(t: TicketAtc): void {
    t.state = 'RESOLVED';
    t.resolvedAt = AHORA_BASE;
    t.status.push({ fecha: AHORA_BASE, estado: 'RESOLVED', autor: 'C. Rojas' });
    t.interactions.push({
      tipo: 'sys',
      fecha: AHORA_BASE,
      texto: 'Ticket resuelto al completarse el workflow · Encuesta CSAT/CES enviada automáticamente a Mi Portal.',
    });
    this.revision.update((n) => n + 1);
  }

  /** Escalado → comité, como la cadena sin saltos de docs/datos/estados.md (EN_ESCALAMIENTO → EN_COMITE). */
  elevarAComite(t: TicketAtc): void {
    t.state = 'IN_COMMITTEE';
    t.status.push({ fecha: AHORA_BASE, estado: 'IN_COMMITTEE', autor: this.estadoProto.perfilActivo().nombre });
    t.interactions.push({ tipo: 'sys', fecha: AHORA_BASE, texto: 'Ticket elevado a comité.' });
    this.revision.update((n) => n + 1);
  }

  reabrirTicket(t: TicketAtc): void {
    t.state = 'REOPENED';
    t.reopen++;
    const calc = this.estadoProto.calcularPoliticaVigente(t.type, t.prio);
    t.resDue = calc.venceResolucion;
    t.status.push({
      fecha: AHORA_BASE,
      estado: `REOPENED (#${t.reopen})`,
      autor: this.estadoProto.perfilActivo().nombre,
    });
    t.interactions.push({
      tipo: 'sys',
      fecha: AHORA_BASE,
      texto: `Ticket reabierto con política vigente ${calc.politica.id} v${calc.politica.version} · Se conserva el hito original de cierre y se abre nuevo compromiso hasta ${fmtFechaHora(t.resDue)}.`,
    });
    this.revision.update((n) => n + 1);
  }

  /** Derivación hecha en el detalle: el ticket pasa al área destino; a Legal llega como Eje 3 escalado. */
  derivarDesdeDetalle(e: DerivacionEvento): void {
    const t = this.ticketActual();
    if (!t) return;
    t.area = e.area;
    if (e.persona) t.owner = e.persona;
    if (e.area === 'LEGAL') {
      t.eje = 3;
      t.state = 'ESCALATED';
    }
    this.revision.update((n) => n + 1);
  }

  alternarItemPaquete6(k: string, val: boolean): void {
    this.paquete6.update((prev) => ({ ...prev, [k]: val }));
  }

  confirmarDerivacion(t: TicketAtc): void {
    const area = this.derivarArea();
    const mot = this.derivarMotivo();
    t.area = area;
    if (area === 'LEGAL') {
      t.eje = 3;
      t.conflict = true;
      t.state = 'ESCALATED';
      t.owner = 'Dra. P. Vílchez (Legal Eje 3)';
    }
    t.log.push({
      fecha: AHORA_BASE,
      area,
      responsable: t.owner,
      motivo: mot,
      nota: `${this.derivarNota()} · Paquete 6/6 sincronizado con Legal`,
    });
    this.modalDerivarAbierto.set(false);
  }
}
