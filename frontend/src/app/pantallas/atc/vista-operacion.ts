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
  AyModal,
  AyPageHeader,
  AyPagination,
  AyProgressBar,
  AyRow,
  AySelect,
  AyStack,
  AyStatistic,
  AyTable,
  AyTextarea,
  AyText,
  AyTimeline,
  type AyColumna,
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

@Component({
  selector: 'app-vista-operacion',
  standalone: true,
  imports: [
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
        AyModal,
    AyPageHeader,
    AyPagination,
    AyProgressBar,
    AyRow,
    AySelect,
    AyStack,
    AyStatistic,
    AyTable,
    AyTextarea,
    AyText,
    AyTimeline,
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
              Mostrar central CTI
            </ay-button>
          }
          <ay-button ayAcciones tamano="sm" variante="secondary" (click)="modalCeseAbierto.set(true)">
            Reasignación masiva por rotación
          </ay-button>
          <ay-button ayAcciones tamano="sm" variante="primary" (click)="irANuevo.emit()">
            + Nuevo ticket
          </ay-button>
        </ay-page-header>

        <!-- Pop-up CTI de llamada entrante con AyAlert oficial -->
        @if (ctiEntranteVisible()) {
          <ay-alert
            tono="info"
            titulo="Llamada entrante CTI · +51 991 224 266 · Jorge Mamani Ccori (DNI 7013••••)"
            [descartable]="true"
            (cerrar)="ctiEntranteVisible.set(false)"
          >
            Los Álamos · Mz. F Lt. 3 · Ticket activo: ALT-001204 (Eje 3 Legal)
            <div ayAcciones ayRow gap="2" [ajuste]="true">
              <ay-button tamano="sm" variante="primary" (click)="atenderLlamadaCti('ALT-001204')">
                Atender y ver ticket ALT-001204
              </ay-button>
              <ay-button tamano="sm" variante="secondary" (click)="irA360.emit()">
                Abrir Consulta 360
              </ay-button>
              <ay-button tamano="sm" variante="ghost" (click)="ctiEntranteVisible.set(false)">
                Ocultar CTI
              </ay-button>
            </div>
          </ay-alert>
        }

        <ay-alert tono="info" size="sm" titulo="Distribución a áreas">
          Fuente única de tickets, consultable por área, estado y tipo, incluidos Queja/Reclamo (Libro) y Garantía postventa.
          Reglas de distribución por área distintas de la asignación manual o por menor carga: definición pendiente.
        </ay-alert>

        <div ayStack gap="2">
          <ay-card variante="elevated" superficie="solid">
            <ay-card-body padding="sm" gap="md">
              <app-barra-filtros [filtros]="filtrosBandeja" [conFiltroEmpresa]="true" />

              <ay-table
                leyenda="Bandeja de tickets de atención multicanal"
                [columnas]="columnasBandeja"
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
                    <ay-button
                      tamano="sm"
                      variante="secondary"
                      [disabled]="!!t.owner"
                      [attr.title]="t.owner ? 'Ya asignado a ' + t.owner : 'Auto-asignar por menor carga'"
                      (click)="!t.owner && autoAsignarMenorCarga(t)"
                    >
                      Auto-asignar
                    </ay-button>
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
          descripcion="Tu avance de hoy: tickets atendidos, acciones realizadas, pendientes en riesgo, avance del equipo y correos de asignación."
        >
          <ay-button ayAcciones tamano="sm" variante="secondary" (click)="modalCeseAbierto.set(true)">
            Reasignación masiva por rotación
          </ay-button>
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
                    unidad="/ 18"
                    size="sm"
                  />
                  <ay-progress-bar
                    etiqueta="Meta diaria del turno"
                    [valor]="78"
                    detalle="78% de tu meta diaria"
                    tono="success"
                    size="sm"
                  />
                </div>
              </ay-card-body>
            </ay-card>

            <ay-card superficie="solid">
              <ay-card-body padding="sm">
                <div ayStack gap="2">
                  <ay-statistic
                    etiqueta="Acciones realizadas hoy"
                    [valor]="accionesHoy().length"
                    unidad="acciones"
                    size="sm"
                  />
                  <div ayRow gap="1" [ajuste]="true">
                    <ay-badge size="sm" tono="info">6 respuestas SLA</ay-badge>
                    <ay-badge size="sm" tono="success">4 cierres</ay-badge>
                  </div>
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
                    etiqueta="Cumplimiento SLA y CSAT hoy"
                    [valor]="94"
                    unidad="% SLA"
                    size="sm"
                  />
                  <div ayRow gap="1" [ajuste]="true">
                    <ay-badge size="sm" tono="success">CSAT 4.7 / 5.0</ay-badge>
                    <ay-badge size="sm" tono="neutral">12 encuestas hoy</ay-badge>
                  </div>
                </div>
              </ay-card-body>
            </ay-card>
          </div>
        </div>

        <!-- 2. Bitácora de tus avances y acciones de hoy -->
        <div ayStack gap="2">
          <div ayRow gap="3" justificar="between" [ajuste]="true">
            <div ayStack gap="1">
              <ay-heading [nivel]="2" size="sm">
                Tus avances y acciones realizadas hoy
              </ay-heading>
              <span ayText="subtitle" size="xs">
                Registro cronológico de aperturas, primeras respuestas en SLA, derivaciones 6/6, llamadas CTI y resoluciones ejecutadas hoy.
              </span>
            </div>
          </div>

          <div ayGrid [columnas]="3" gap="md">
            <div class="pl-atc-col-span-2">
              <ay-card variante="elevated" superficie="solid">
                <ay-card-body padding="sm" gap="sm">
                  <app-barra-filtros [filtros]="filtrosAccionesHoy" />
                  <ay-table
                    leyenda="Acciones y avances realizados hoy por el usuario"
                    [columnas]="columnasAccionesHoy"
                    [filas]="filtrosAccionesHoy.filtradas()"
                    [filtrosTabla]="filtrosAccionesHoy"
                    [rayada]="true"
                  >
                    <ng-template ayCelda="hora" let-fila>
                      @let a = comoAccionHoy(fila);
                      <strong ayText="mono" size="xs">{{ a.hora }}</strong>
                    </ng-template>
                    <ng-template ayCelda="etiqueta" let-fila>
                      @let a = comoAccionHoy(fila);
                      <ay-badge size="sm" [tono]="a.tono">{{ a.etiqueta }}</ay-badge>
                    </ng-template>
                    <ng-template ayCelda="ticket" let-fila>
                      @let a = comoAccionHoy(fila);
                      <div ayStack gap="1">
                        <strong ayText="mono" size="xs">{{ a.ticket }}</strong>
                        <span ayText="body" size="xs">{{ a.cliente }}</span>
                      </div>
                    </ng-template>
                    <ng-template ayCelda="detalle" let-fila>
                      @let a = comoAccionHoy(fila);
                      <div ayStack gap="1">
                        <span>{{ a.detalle }}</span>
                        <span ayText="subtitle" size="xs">{{ a.impactoSla }}</span>
                      </div>
                    </ng-template>
                    <ng-template ayCelda="accion" let-fila>
                      @let a = comoAccionHoy(fila);
                      <div class="pl-atc-acciones-celda">
                        <ay-button
                          tamano="sm"
                          variante="secondary"
                          [disabled]="!a.ticket"
                          (click)="a.ticket && seleccionarTicket.emit(a.ticket)"
                        >
                          Abrir ticket
                        </ay-button>
                      </div>
                    </ng-template>
                    <app-vacio-filtros ayVacio [filtros]="filtrosAccionesHoy" elemento="registro" />
                  </ay-table>
                </ay-card-body>
              </ay-card>
            </div>

            <ay-card superficie="solid">
              <ay-card-body padding="md" gap="md">
                <div ayStack gap="1">
                  <strong ayText="label" size="sm">Línea de tiempo de tu turno</strong>
                  <span ayText="subtitle" size="xs">Hitos clave registrados en tu sesión de hoy</span>
                </div>
                <ay-timeline
                  etiqueta="Hitos del día del gestor"
                  [hitos]="hitosTuDia"
                />
              </ay-card-body>
            </ay-card>
          </div>
        </div>

        <!-- 3. Tus tickets pendientes / en riesgo para cerrar hoy -->
        <div ayStack gap="2">
          <div ayRow gap="3" justificar="between" [ajuste]="true">
            <div ayStack gap="1">
              <ay-heading [nivel]="2" size="sm">
                Tus tickets pendientes y prioridades para cerrar hoy
              </ay-heading>
              <span ayText="subtitle" size="xs">
                Casos activos que requieren seguimiento o primera respuesta durante tu jornada de hoy.
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
                    <ay-button
                      tamano="sm"
                      variante="secondary"
                      [disabled]="!!t.owner"
                      [attr.title]="t.owner ? 'Ya asignado a ' + t.owner : 'Auto-asignar por menor carga'"
                      (click)="!t.owner && autoAsignarMenorCarga(t)"
                    >
                      Auto-asignar
                    </ay-button>
                  </div>
                </ng-template>
              </ay-table>
            </ay-card-body>
          </ay-card>
        </div>

        <!-- 4. Avance diario del equipo y Correos de asignación enviados hoy -->
        <div ayGrid [columnas]="2" gap="md">
          <div ayStack gap="2">
            <div ayStack gap="1">
              <ay-heading [nivel]="2" size="sm">Avance diario del equipo</ay-heading>
              <span ayText="subtitle" size="xs">
                Productividad por gestor, carga ponderada activa y cumplimiento de SLA en el turno.
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
                  <ng-template ayCelda="pct" let-fila>
                    @let g = comoAvanceGestor(fila);
                    <div ayStack gap="1">
                      <strong>{{ g.atendidos }} / {{ g.meta }}</strong>
                      <ay-progress-bar
                        [etiqueta]="'Avance ' + g.gestor"
                        [valor]="g.pct"
                        [tono]="g.pct >= 75 ? 'success' : 'brand'"
                        size="sm"
                      />
                    </div>
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
                  <ng-template ayCelda="csat" let-fila>
                    @let g = comoAvanceGestor(fila);
                    <ay-badge size="sm" tono="success">{{ g.csat }} ★ ({{ g.sla }})</ay-badge>
                  </ng-template>
                </ay-table>
              </ay-card-body>
            </ay-card>
          </div>

          <div ayStack gap="2">
            <div ayStack gap="1">
              <ay-heading [nivel]="2" size="sm">
                Correos de asignación enviados hoy (con CC a líder de área)
              </ay-heading>
              <span ayText="subtitle" size="xs">
                Trazabilidad de notificaciones automáticas disparadas hoy al asignar o derivar tickets.
              </span>
            </div>
            <ay-card superficie="solid">
              <ay-card-body padding="sm">
                <ay-table
                  leyenda="Correos automáticos de asignación enviados hoy"
                  [columnas]="columnasCorreosHoy"
                  [filas]="correosAsignacionHoy"
                  [rayada]="true"
                >
                  <ng-template ayCelda="hora" let-fila>
                    @let c = comoCorreoHoy(fila);
                    <span ayText="mono" size="xs">{{ c.hora }}</span>
                  </ng-template>
                  <ng-template ayCelda="ticket" let-fila>
                    @let c = comoCorreoHoy(fila);
                    <div ayStack gap="1">
                      <strong ayText="mono" size="xs">{{ c.ticket }}</strong>
                      <span ayText="body" size="xs">{{ c.asunto }}</span>
                    </div>
                  </ng-template>
                  <ng-template ayCelda="para" let-fila>
                    @let c = comoCorreoHoy(fila);
                    <div ayStack gap="1">
                      <span ayText="body" size="xs"><strong>Para:</strong> {{ c.para }}</span>
                      <span ayText="subtitle" size="xs"><strong>CC Líder:</strong> {{ c.ccLider }}</span>
                    </div>
                  </ng-template>
                  <ng-template ayCelda="estado" let-fila>
                    @let c = comoCorreoHoy(fila);
                    <ay-badge size="sm" tono="success">{{ c.estado }}</ay-badge>
                  </ng-template>
                </ay-table>
              </ay-card-body>
            </ay-card>
          </div>
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
          descripcion="Registra la solicitud tipificada desde el primer contacto. Al guardar, el cliente recibe su número y se congela el SLA vigente."
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
                      <div ayGrid [columnas]="4" gap="sm" class="pl-atc-fila-campos">
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
                        <ay-form-field etiqueta="Tipo de ticket" obligatorio>
                          <ay-select nombre="form-tipo"
                            [opciones]="opcionesTiposForm"
                            [valor]="formTipo()"
                            (valorChange)="formTipo.set($event)"
                          />
                        </ay-form-field>
                        <ay-form-field etiqueta="Prioridad" obligatorio>
                          <ay-select nombre="form-prioridad"
                            [opciones]="opcionesPrioridadForm"
                            [valor]="formPrioridad()"
                            (valorChange)="cambiarPrioridadForm($event)"
                          />
                        </ay-form-field>
                        <ay-form-field etiqueta="Cliente o Interesado (SIGDA / TAXON)" obligatorio>
                          <ay-input nombre="form-cliente" [valor]="formCliente()" (valorChange)="formCliente.set($event)" />
                        </ay-form-field>
                        <ay-form-field etiqueta="Documento (DNI / CE)" obligatorio>
                          <ay-input nombre="form-dni" [valor]="formDni()" (valorChange)="formDni.set($event)" />
                        </ay-form-field>
                        <ay-form-field etiqueta="Proyecto y Lote / Unidad" obligatorio>
                          <ay-input nombre="form-proyecto" [valor]="formProyecto()" (valorChange)="formProyecto.set($event)" />
                        </ay-form-field>
                      </div>

                      <ay-form-group
                        leyenda="Señales de conflicto y excepciones de consulta"
                        descripcion="Si el cliente menciona alguna señal de conflicto, el ticket se atenderá en Eje 3 (Legal)."
                        variante="card"
                      >
                        <ay-checkbox
                          [marcado]="formContingencia()"
                          (marcadoChange)="formContingencia.set($event)"
                        >
                          Interesado (excepción): Cliente no está en SIGDA/TAXON o sistema caído (queda pendiente de vincular)
                        </ay-checkbox>
                        <ay-checkbox
                          [marcado]="formRayo()"
                          (marcadoChange)="formRayo.set($event)"
                        >
                          Marcar con prioridad Rayo (va primero en la bandeja sin alterar su SLA)
                        </ay-checkbox>
                        <ay-checkbox
                          [marcado]="formConflicto()"
                          (marcadoChange)="formConflicto.set($event)"
                        >
                          Señal de conflicto legal (amenaza con INDECOPI, menciona abogado, carta notarial o medios → Eje 3 Legal)
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
                        <ay-form-field
                          etiqueta="Descripción y nota de estado emocional (sin calificativos de juicio)"
                          [error]="
                            emocionInvalida()
                              ? 'Contiene palabras de juicio («histérico», «problemático», «loco»). Reformúlalas con hechos observables.'
                              : undefined
                          "
                          obligatorio
                        >
                          <ay-textarea nombre="form-emocion"
                            [filas]="3"
                            [invalido]="emocionInvalida()"
                            [valor]="formEmocion()"
                            (valorChange)="formEmocion.set($event)"
                          />
                        </ay-form-field>
                      </div>

                      <div ayRow gap="2" justificar="end">
                        <ay-button
                          tipo="submit"
                          variante="primary"
                          [disabled]="emocionInvalida()"
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
            <div ayStack gap="4">
              <ay-card superficie="solid">
                <ay-card-header
                  titulo="SLA que se congelará"
                  subtitulo="Se calcula al guardar con la versión activa en Políticas SLA y ya no cambia aunque la política cambie después."
                  nivel="h2"
                  [separador]="true"
                />
                <ay-card-body padding="sm" gap="sm">
                  <ay-card-pairs [pares]="paresPreviewSlaCongelado()" />
                  @if (previewPoliticaSla().origen === 'global') {
                    <ay-alert tono="warning" size="sm" titulo="Sin política específica para este tipo">
                      «{{ nombreTipo(formTipo()) }}» no tiene política activa: se aplicará la genérica global y se registrará una alerta en Workflow.
                    </ay-alert>
                  }
                  @if (esTipoLibro()) {
                    <ay-alert tono="info" size="sm" titulo="Exige asiento en el Libro de Reclamaciones">
                      Plazo legal improrrogable de 15 días hábiles ({{ previewSla().libroFecha }}).
                    </ay-alert>
                  }
                </ay-card-body>
              </ay-card>

              <ay-card superficie="solid">
                <ay-card-header
                  titulo="Flujo configurado que se aplicará"
                  [subtitulo]="'Workflow › Flujos · v' + previewFlujoConfig().versionActual"
                  nivel="h2"
                  [separador]="true"
                />
                <ay-card-body padding="sm" gap="sm">
                  <ay-card-pairs [pares]="paresPreviewFlujoConfig()" />
                  <span ayText="body" size="xs">
                    Si el Administrador Funcional publica una nueva versión del flujo en Workflow, los nuevos tickets usarán esa versión automáticamente.
                  </span>
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
  readonly irA360 = output<void>();
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

  readonly opcionesTiposForm: AyOpcionSelect[] = TIPOS_TICKET.map((tp) => ({
    value: tp.id,
    label: `${tp.id} · ${tp.nombre}`,
  }));

  readonly opcionesPrioridadForm: AyOpcionSelect[] = PRIORIDADES_TICKET.map((p) => ({
    value: p.id,
    label: `${p.nombre} (${p.id})`,
  }));

  readonly opcionesAreasForm: AyOpcionSelect[] = opcionesDe(AREAS_ATC, AREA_ES);

  readonly opcionesMotivosForm: AyOpcionSelect[] = opcionesDe(MOTIVOS_DERIVACION, MOTIVO_ES);



  readonly columnasAccionesHoy: readonly AyColumna[] = [
    { clave: 'hora', cabecera: 'Hora', ancho: '6rem', ordenable: true },
    { clave: 'etiqueta', cabecera: 'Tipo de acción', ancho: '11rem', ordenable: true },
    { clave: 'ticket', cabecera: 'Ticket / Cliente', ancho: '12rem', ordenable: true },
    { clave: 'detalle', cabecera: 'Avance o gestión realizada', ordenable: true },
    { clave: 'accion', cabecera: 'Acciones', alineacion: 'end', ancho: '9rem' },
  ];

  readonly columnasEquipoHoy: readonly AyColumna[] = [
    { clave: 'gestor', cabecera: 'Gestor / Área', ordenable: true },
    { clave: 'pct', cabecera: 'Avance del turno', ancho: '11rem', ordenable: true },
    { clave: 'pendientes', cabecera: 'Carga activa', ancho: '11rem', ordenable: true },
    { clave: 'csat', cabecera: 'CSAT y SLA hoy', alineacion: 'end', ancho: '10rem', ordenable: true },
  ];

  readonly columnasCorreosHoy: readonly AyColumna[] = [
    { clave: 'hora', cabecera: 'Hora', ancho: '5.5rem', ordenable: true },
    { clave: 'ticket', cabecera: 'Ticket y Asunto', ordenable: true },
    { clave: 'para', cabecera: 'Destinatario y CC Líder', ordenable: true },
    { clave: 'estado', cabecera: 'Envío', alineacion: 'end', ancho: '7rem', ordenable: true },
  ];

  readonly accionesHoy = signal([
    {
      hora: '15:42',
      categoria: 'RESPUESTA_SLA',
      etiqueta: '1.ª Respuesta SLA',
      tono: 'info' as const,
      ticket: 'AIN-000482',
      cliente: 'Eddie Huamaní',
      detalle: 'Envío de cronograma conciliado con Letras #14 y #15 validadas en Mi Portal.',
      impactoSla: 'Respondido 2 h 15 min antes del vencimiento de 1.ª respuesta',
    },
    {
      hora: '14:55',
      categoria: 'DERIVACION',
      etiqueta: 'Derivación 6/6 Legal',
      tono: 'danger' as const,
      ticket: 'ALT-001204',
      cliente: 'Jorge Mamani Ccori',
      detalle: 'Transferencia a Eje 3 Legal con checklist documental 6/6 verificado.',
      impactoSla: 'Sincronizado con Comité SGD y bandeja de Dra. Lucía Paredes',
    },
    {
      hora: '13:20',
      categoria: 'RESOLUCION',
      etiqueta: 'Resolución en línea',
      tono: 'success' as const,
      ticket: 'VSL-000319',
      cliente: 'María Elena Quispe',
      detalle: 'Confirmación de cupo en Bus #02 para EntregaFest y envío de pase QR.',
      impactoSla: 'Cerrado en 1.er contacto (FCR) · Encuesta CSAT 5/5 recibida',
    },
    {
      hora: '11:48',
      categoria: 'LLAMADA_CTI',
      etiqueta: 'Llamada CTI atendida',
      tono: 'warning' as const,
      ticket: 'AIN-000488',
      cliente: 'Rosaura Mendoza',
      detalle: 'Atención telefónica sobre partida de independización SUNARP y estado de adenda.',
      impactoSla: 'Grabación vinculada automáticamente al expediente del ticket',
    },
    {
      hora: '10:15',
      categoria: 'RESPUESTA_SLA',
      etiqueta: '1.ª Respuesta SLA',
      tono: 'info' as const,
      ticket: 'PRB-000105',
      cliente: 'Luis Alberto Chávez',
      detalle: 'Validación de vigencia de garantía postventa de instalaciones sanitarias (1 año).',
      impactoSla: 'Inspección técnica programada dentro de SLA',
    },
    {
      hora: '09:05',
      categoria: 'RESOLUCION',
      etiqueta: 'Resolución en línea',
      tono: 'success' as const,
      ticket: 'AIN-000479',
      cliente: 'Carmen Rosa Salazar',
      detalle: 'Actualización de correo y teléfono titular con validación biométrica.',
      impactoSla: 'Cerrado en 18 min · SLA cumplido al 100%',
    },
  ]);

  readonly filtrosAccionesHoy = crearFiltrosTabla(
    this.accionesHoy,
    {
      clave: 'acciones-hoy',
      etiquetaElemento: 'acciones',
      filtros: [
        {
          id: 'categoria',
          etiqueta: 'Filtrar acciones de hoy',
          tipo: 'segmento',
          etiquetaTodas: 'Todas las acciones',
          valorDe: (a) => a.categoria,
          opciones: [
            { valor: 'RESPUESTA_SLA', etiqueta: '1.ª Respuesta SLA' },
            { valor: 'RESOLUCION', etiqueta: 'Resoluciones' },
            { valor: 'DERIVACION', etiqueta: 'Derivaciones 6/6' },
            { valor: 'LLAMADA_CTI', etiqueta: 'Llamadas CTI' },
          ],
        },
      ],
    },
    inject(EstadoFiltrosTablas),
  );

  readonly hitosTuDia: AyTimelineEvento[] = [
    {
      id: 'hito-1',
      titulo: '15:42 · 1.ª respuesta enviada en AIN-000482 (Eddie Huamaní)',
      fecha: AHORA_BASE,
      autor: 'Cronograma conciliado visible en Mi Portal',
      tono: 'accent',
    },
    {
      id: 'hito-2',
      titulo: '14:55 · Paquete 6/6 completado y derivado a Eje 3 Legal (ALT-001204)',
      fecha: AHORA_BASE,
      autor: 'Custodia documental validada sin observaciones',
      tono: 'danger',
    },
    {
      id: 'hito-3',
      titulo: '13:20 · Ticket VSL-000319 resuelto en primer contacto (CSAT 5★)',
      fecha: AHORA_BASE,
      autor: 'Pase QR EntregaFest emitido en línea',
      tono: 'success',
    },
    {
      id: 'hito-4',
      titulo: '11:48 · Llamada CTI vinculada a AIN-000488',
      fecha: AHORA_BASE,
      autor: 'Consulta de adenda y partida registral atendida',
      tono: 'accent',
    },
    {
      id: 'hito-5',
      titulo: '08:30 · Inicio de turno y balanceo automático de bandeja (18 tickets)',
      fecha: AHORA_BASE,
      autor: 'Meta del día: 18 atenciones con ≥ 90% SLA',
      tono: 'default',
    },
  ];

  readonly avanceEquipoHoy = [
    {
      gestor: 'Ana Torres / C. Rojas (Tú)',
      area: 'Atención al Cliente Eje 1/2',
      atendidos: 14,
      meta: 18,
      pct: 78,
      pendientes: 4,
      riesgo: 1,
      csat: '4.7',
      sla: '94% SLA',
    },
    {
      gestor: 'M. Delgado',
      area: 'Atención al Cliente Eje 1/2',
      atendidos: 15,
      meta: 18,
      pct: 83,
      pendientes: 2,
      riesgo: 0,
      csat: '4.8',
      sla: '96% SLA',
    },
    {
      gestor: 'R. Salazar',
      area: 'Cobranza y Recaudación',
      atendidos: 11,
      meta: 16,
      pct: 69,
      pendientes: 5,
      riesgo: 2,
      csat: '4.4',
      sla: '89% SLA',
    },
    {
      gestor: 'L. Ccahuana',
      area: 'Postventa y Garantías',
      atendidos: 9,
      meta: 12,
      pct: 75,
      pendientes: 3,
      riesgo: 0,
      csat: '4.6',
      sla: '92% SLA',
    },
  ];

  readonly correosAsignacionHoy = [
    {
      hora: '15:10',
      ticket: 'AIN-000482',
      asunto: 'Asignación automática por carga · Prioridad Rayo',
      para: 'c.rojas@aybarcorp.pe',
      ccLider: 'carlos.mendoza@aybarcorp.pe (Líder ATC)',
      estado: 'Entregado',
    },
    {
      hora: '14:55',
      ticket: 'ALT-001204',
      asunto: 'Handoff 6/6 Eje 3 Legal · Conflicto contractual',
      para: 'lucia.paredes@aybarcorp.pe',
      ccLider: 'gerencia.legal@aybarcorp.pe (Líder Legal)',
      estado: 'Entregado',
    },
    {
      hora: '12:30',
      ticket: 'VSL-000390',
      asunto: 'Derivación a Cobranza · Conciliación de voucher',
      para: 'r.salazar@aybarcorp.pe',
      ccLider: 'jefatura.cobranza@aybarcorp.pe (Líder Finanzas)',
      estado: 'Entregado',
    },
    {
      hora: '09:40',
      ticket: 'PRB-000105',
      asunto: 'Solicitud de inspección técnica postventa',
      para: 'martin.salazar@aybarcorp.pe',
      ccLider: 'postventa.lider@aybarcorp.pe (Líder Postventa)',
      estado: 'Entregado',
    },
  ];

  readonly misTicketsPendientesHoy = computed(() =>
    this.tickets()
      .filter((t) => t.state !== 'RESOLVED' && t.state !== 'CLOSED')
      .map((t) => Object.assign(t, { sla: t.resDue.getTime() })),
  );

  readonly misTicketsEnRiesgoHoy = computed(() =>
    this.misTicketsPendientesHoy().filter((t) => evaluarSlaTicket(t).tono !== 'success'),
  );

  readonly ctiEntranteVisible = signal<boolean>(true);
  readonly modalCeseAbierto = signal<boolean>(false);
  readonly ceseOrigen = signal<string>('C. Rojas');
  readonly ceseDestino = signal<string>('M. Delgado (ATC)');
  readonly ceseMotivo = signal<string>('REASSIGNMENT_CESE');

  readonly formEmpresa = signal<string>('AIN');
  readonly formLinea = signal<string>('Lotes urbanos');
  readonly formCanal = signal<string>('WhatsApp');
  readonly formTipo = signal<string>('CTA');
  readonly formPrioridad = signal<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('HIGH');
  readonly formCliente = signal<string>('Eddie Huamaní');
  readonly formDni = signal<string>('7228••••');
  readonly formProyecto = signal<string>('Villa Sol II · Mz. C Lt. 07');
  readonly formContingencia = signal<boolean>(false);
  readonly formRayo = signal<boolean>(false);
  readonly formConflicto = signal<boolean>(false);
  readonly formContratoCiudad = signal<string>('CITY_SERVICE_FEE-2026-0113');
  readonly formResumen = signal<string>('Solicita confirmación de abono de cuota y horario de bus para EntregaFest.');
  readonly formEmocion = signal<string>('Cliente en tono cordial; solicita confirmación por escrito.');

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

  comoAccionHoy(fila: unknown): {
    hora: string;
    categoria: string;
    etiqueta: string;
    tono: 'info' | 'success' | 'warning' | 'danger' | 'neutral';
    ticket: string;
    cliente: string;
    detalle: string;
    impactoSla: string;
  } {
    return fila as {
      hora: string;
      categoria: string;
      etiqueta: string;
      tono: 'info' | 'success' | 'warning' | 'danger' | 'neutral';
      ticket: string;
      cliente: string;
      detalle: string;
      impactoSla: string;
    };
  }

  comoAvanceGestor(fila: unknown): {
    gestor: string;
    area: string;
    atendidos: number;
    meta: number;
    pct: number;
    pendientes: number;
    riesgo: number;
    csat: string;
    sla: string;
  } {
    return fila as {
      gestor: string;
      area: string;
      atendidos: number;
      meta: number;
      pct: number;
      pendientes: number;
      riesgo: number;
      csat: string;
      sla: string;
    };
  }

  comoCorreoHoy(fila: unknown): {
    hora: string;
    ticket: string;
    asunto: string;
    para: string;
    ccLider: string;
    estado: string;
  } {
    return fila as {
      hora: string;
      ticket: string;
      asunto: string;
      para: string;
      ccLider: string;
      estado: string;
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

  readonly emocionInvalida = computed(() => {
    const txt = this.formEmocion().toLowerCase();
    return ['histérico', 'histerico', 'loco', 'mentiroso', 'problemático', 'problematico'].some((w) =>
      txt.includes(w),
    );
  });

  readonly previewPoliticaSla = computed(() =>
    this.estadoProto.calcularPoliticaVigente(this.formTipo(), this.formPrioridad()),
  );

  readonly previewFlujoConfig = computed(() =>
    this.estadoProto.obtenerFlujoActivo(this.formTipo()),
  );

  readonly paresPreviewSlaCongelado = computed<ParCardPairs[]>(() => {
    const calc = this.previewPoliticaSla();
    return [
      { clave: 'Política', valor: `${calc.politica.id} · v${calc.politica.version}` },
      { clave: 'Precedencia', valor: calc.etiquetaOrigen },
      { clave: 'Apertura', valor: fmtFechaHora(AHORA_BASE) },
      {
        clave: '1.ª respuesta',
        valor: `${fmtFechaHora(calc.venceRespuesta)} (${calc.politica.respuestaH} h hábiles)`,
      },
      {
        clave: 'Resolución',
        valor: `${fmtFechaHora(calc.venceResolucion)} (${calc.politica.resolucionH} h hábiles)`,
      },
    ];
  });

  readonly paresPreviewFlujoConfig = computed<ParCardPairs[]>(() => {
    const fl = this.previewFlujoConfig();
    const paso1 = fl.pasos[0];
    return [
      { clave: 'Versión del flujo', valor: `v${fl.versionActual} (${fl.nombreTipo})` },
      { clave: 'Área receptora', valor: fl.area },
      {
        clave: '1.er paso y responsable',
        valor: paso1 ? `${paso1.nombre} · ${paso1.responsable} (${paso1.horas} h)` : 'Cola del área',
      },
      {
        clave: 'Secuencia completa',
        valor: fl.pasos.map((p, i) => `${i + 1}. ${p.nombre} (${p.responsable}, ${p.horas} h)`).join(' → '),
      },
    ];
  });

  readonly previewSla = computed(() => {
    const calc = this.previewPoliticaSla();
    const libroDate = sumarDiasHabiles(AHORA_BASE, 15);
    return {
      fr: calc.politica.respuestaH,
      res: calc.politica.resolucionH,
      src: `${calc.politica.id} · v${calc.politica.version} (${calc.etiquetaOrigen})`,
      frFecha: fmtFechaHora(calc.venceRespuesta),
      resFecha: fmtFechaHora(calc.venceResolucion),
      libroFecha: fmtFechaHora(libroDate),
    };
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
    return this.flujoDeTicket(t.type).pasos.map(
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
    if (this.emocionInvalida()) return;
    const emp = this.empresas.find((e) => e.id === this.formEmpresa()) ?? this.empresas[0];
    const calcSla = this.previewPoliticaSla();
    const flujo = this.previewFlujoConfig();
    if (calcSla.origen === 'global') {
      this.estadoProto.registrarAlertaPoliticaFaltante(this.formTipo());
    }
    const corr = String(Math.floor(500 + Math.random() * 400)).padStart(6, '0');
    const num = `${emp.id}-${corr}`;
    const esConflicto = this.formConflicto();
    const areaInicial = esConflicto ? 'LEGAL' : flujo.area;
    const responsableInicial = esConflicto
      ? 'Patricia Vílchez'
      : (flujo.pasos[0]?.responsable ?? 'Lucía Benavides');

    const nuevo: TicketAtc = {
      num,
      co: emp.id,
      empresa: emp,
      line: this.formLinea(),
      ch: this.formCanal(),
      cli: this.formContingencia() ? `${this.formCliente()} [COLA CONCILIACIÓN]` : this.formCliente(),
      dni: this.formDni(),
      proj: this.formProyecto(),
      type: this.formTipo(),
      prio: this.formPrioridad(),
      state: esConflicto ? 'ESCALATED' : 'OPEN',
      area: areaInicial,
      owner: responsableInicial,
      opened: AHORA_BASE,
      frDue: calcSla.venceRespuesta,
      resDue: calcSla.venceResolucion,
      slaSrc: `${calcSla.politica.id} v${calcSla.politica.version} · Flujo v${flujo.versionActual}`,
      reopen: 0,
      conflict: esConflicto,
      rayo: this.formRayo(),
      emotion: this.formEmocion(),
      eje: esConflicto ? 3 : 1,
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
          motivo: this.formContingencia() ? 'ALTA_CONTINGENCIA_CONCILIACION' : 'ALTA_FLUJO_CONFIGURADO',
          nota: `Enrutado por Flujo ${flujo.tipo} v${flujo.versionActual} y SLA congelado con ${calcSla.politica.id} v${calcSla.politica.version}.`,
        },
      ],
      status: [{ fecha: AHORA_BASE, estado: esConflicto ? 'ESCALATED' : 'OPEN', autor: this.estadoProto.perfilActivo().nombre }],
    };

    this.ticketCreado.emit({ ticket: nuevo, crearAsientoLibro: this.esTipoLibro() });
  }

  flujoDeTicket(type: string) {
    return this.estadoProto.obtenerFlujoActivo(type);
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
