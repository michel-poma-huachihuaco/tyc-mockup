import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
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
  AyDivider,
  AyEmptyState,
  AyFilterControl,
  AyForm,
  AyFormField,
  AyFormGroup,
  AyGrid,
  AyHeading,
  AyInput,
  AyList,
  AyListItem,
  AyModal,
  AyPageHeader,
  AyPagination,
  AyProgressBar,
  AyRow,
  AySearchInput,
  AySegmentedControl,
  AySelect,
  AyStack,
  AyStatistic,
  AyTable,
  AyTableToolbar,
  AyTextarea,
  AyText,
  AyTimeline,
  AyToggleButton,
  type AyColumna,
  type AyFilterOpcion,
  type AyFilterValor,
  type AyOpcionSelect,
  type AySegmentoOpcion,
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

@Component({
  selector: 'app-vista-operacion',
  standalone: true,
  imports: [
    AyAlert,
    AyBadge,
    AyButton,
    AyCard,
    AyCardBody,
    AyCardHeader,
    AyCardPairs,
    AyCelda,
    AyCheckbox,
    AyDivider,
    AyEmptyState,
    AyFilterControl,
    AyForm,
    AyFormField,
    AyFormGroup,
    AyGrid,
    AyHeading,
    AyInput,
    AyList,
    AyListItem,
    AyModal,
    AyPageHeader,
    AyPagination,
    AyProgressBar,
    AyRow,
    AySearchInput,
    AySegmentedControl,
    AySelect,
    AyStack,
    AyStatistic,
    AyTable,
    AyTableToolbar,
    AyTextarea,
    AyText,
    AyTimeline,
    AyToggleButton,
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
          <ay-badge ayEstado size="sm" tono="warning">{{ ticketsConRayo() }} con Rayo</ay-badge>
          <ay-badge ayEstado size="sm" tono="info">
            {{ ticketsFiltrados().length }} de {{ tickets().length }} tickets
          </ay-badge>
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

        <div ayStack gap="2">
          <ay-card variante="elevated" superficie="solid">
            <ay-card-body padding="sm" gap="md">
              <ay-table-toolbar
                [recuento]="ticketsFiltrados().length"
                etiquetaElemento="tickets"
              >
                <ay-search-input
                  ayBusqueda
                  etiqueta="Buscar ticket, cliente o lote"
                  placeholder="N.º ticket, cliente, DNI, proyecto o canal…"
                  size="sm"
                  [valor]="busquedaGeneral()"
                  (valorChange)="busquedaGeneral.set($event)"
                />
                <ng-container ayFiltros>
                  <ay-filter-control
                    etiqueta="Empresa"
                    tipo="single"
                    size="sm"
                    [opciones]="opcionesFiltroControlEmpresa()"
                    [valor]="filtroEmpresa() || undefined"
                    (valorChange)="alFiltrarEmpresa($event)"
                  />
                  <ay-filter-control
                    etiqueta="Canal"
                    tipo="single"
                    size="sm"
                    [opciones]="opcionesFiltroControlCanal()"
                    [valor]="filtroCanal() || undefined"
                    (valorChange)="alFiltrarCanal($event)"
                  />
                  <ay-filter-control
                    etiqueta="Tipo"
                    tipo="single"
                    size="sm"
                    [opciones]="opcionesFiltroControlTipo()"
                    [valor]="filtroTipo() || undefined"
                    (valorChange)="alFiltrarTipo($event)"
                  />
                  <ay-filter-control
                    etiqueta="Prioridad"
                    tipo="single"
                    size="sm"
                    [opciones]="opcionesFiltroControlPrioridad()"
                    [valor]="filtroPrioridad() || undefined"
                    (valorChange)="alFiltrarPrioridad($event)"
                  />
                  <ay-filter-control
                    etiqueta="Área"
                    tipo="single"
                    size="sm"
                    [opciones]="opcionesFiltroControlArea()"
                    [valor]="filtroArea() || undefined"
                    (valorChange)="alFiltrarArea($event)"
                  />
                  <ay-filter-control
                    etiqueta="Gestor"
                    tipo="single"
                    size="sm"
                    [opciones]="opcionesFiltroControlGestor()"
                    [valor]="filtroGestor() || undefined"
                    (valorChange)="alFiltrarGestor($event)"
                  />
                  <ay-filter-control
                    etiqueta="Estado"
                    tipo="single"
                    size="sm"
                    [opciones]="opcionesFiltroControlEstado"
                    [valor]="filtroEstado() || undefined"
                    (valorChange)="alFiltrarEstado($event)"
                  />
                  <ay-filter-control
                    etiqueta="SLA"
                    tipo="single"
                    size="sm"
                    [opciones]="opcionesFiltroControlSla"
                    [valor]="filtroColSla() || undefined"
                    (valorChange)="alFiltrarSla($event)"
                  />
                  <ay-toggle-button
                    tamano="sm"
                    [(presionado)]="soloConRayo"
                  >
                    Solo prioridad Rayo
                  </ay-toggle-button>
                </ng-container>
                @if (hayFiltrosActivos()) {
                  <ay-button
                    ayAcciones
                    tamano="sm"
                    variante="ghost"
                    (click)="limpiarFiltrosTabla()"
                  >
                    Limpiar filtros
                  </ay-button>
                }
              </ay-table-toolbar>

              <ay-table
                leyenda="Bandeja de tickets de atención multicanal"
                [columnas]="columnasBandeja"
                [filas]="ticketsPaginadosBandeja()"
                [cabeceraFija]="true"
                [rayada]="true"
              >
                <ng-template ayCelda="num" let-fila>
                  @let t = comoTicket(fila);
                  <div ayStack gap="1">
                    <strong ayText="mono" size="xs">{{ t.num }}</strong>
                    <span ayText="body" size="xs">{{ t.empresa.nombre }}</span>
                  </div>
                </ng-template>
                <ng-template ayCelda="rayo" let-fila>
                  @let t = comoTicket(fila);
                  <div class="pl-atc-rayo-celda">
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
                    <strong>{{ t.area }}</strong>
                    <span ayText="body" size="xs">{{ t.owner ?? 'Sin asignar (Cola)' }}</span>
                  </div>
                </ng-template>
                <ng-template ayCelda="state" let-fila>
                  @let t = comoTicket(fila);
                  <div ayRow gap="1" [ajuste]="true">
                    <ay-badge
                      size="sm"
                      [tono]="
                        t.state === 'ESCALATED'
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
                    @if (t.contract) {
                      <ay-button tamano="sm" variante="ghost" (click)="verContrato.emit(t.contract)">
                        Contrato
                      </ay-button>
                    }
                    @if (!t.owner) {
                      <ay-button tamano="sm" variante="ghost" (click)="autoAsignarMenorCarga(t)">
                        Auto-asignar
                      </ay-button>
                    }
                  </div>
                </ng-template>
                <ay-empty-state
                  ayVacio
                  variante="no-results"
                  size="compact"
                  titulo="Sin tickets que coincidan"
                  descripcion="Ajusta o limpia los filtros activos para ver toda la bandeja."
                >
                  <div ayAcciones>
                    <ay-button tamano="sm" variante="secondary" (click)="limpiarFiltrosTabla()">
                      Limpiar filtros
                    </ay-button>
                  </div>
                </ay-empty-state>
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
                <ay-select
                  [opciones]="opcionesCeseOrigen"
                  [valor]="ceseOrigen()"
                  (valorChange)="ceseOrigen.set($event)"
                />
              </ay-form-field>
              <ay-form-field etiqueta="Nuevo responsable receptor (menor carga activa)" obligatorio>
                <ay-select
                  [opciones]="opcionesCeseDestino"
                  [valor]="ceseDestino()"
                  (valorChange)="ceseDestino.set($event)"
                />
              </ay-form-field>
              <ay-form-field etiqueta="Motivo tipificado de auditoría" obligatorio>
                <ay-select
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
          <ay-badge ayEstado size="sm" tono="info">
            {{ estadoProto.perfilActivo().nombre }} · {{ estadoProto.perfilActivo().cargo }}
          </ay-badge>
          <ay-badge ayEstado size="sm" tono="success">En turno activo · 08:30 – 18:00</ay-badge>
          <ay-button ayAcciones tamano="sm" variante="secondary" (click)="modalCeseAbierto.set(true)">
            Reasignación masiva por rotación
          </ay-button>
          <ay-button ayAcciones tamano="sm" variante="primary" (click)="irANuevo.emit()">
            + Registrar nuevo ticket
          </ay-button>
        </ay-page-header>

        @if (estadoProto.rolActivo() === 'ADMIN_FUNCIONAL') {
          <ay-alert tono="warning" size="sm" titulo="Sin líder en NEXUS (HU-ATC-055)">
            No tienes líder inmediato registrado en NEXUS: los correos de asignación se te envían sin copia (CC) hasta que RRHH complete tu estructura organizacional.
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
            <ay-segmented-control
              etiqueta="Filtrar acciones de hoy"
              size="sm"
              [opciones]="opcionesFiltroAccionesHoy"
              [valor]="filtroCategoriaAccionHoy()"
              (valorChange)="filtroCategoriaAccionHoy.set($event)"
            />
          </div>

          <div ayGrid [columnas]="3" gap="md">
            <div class="pl-atc-col-span-2">
              <ay-card variante="elevated" superficie="solid">
                <ay-card-body padding="sm">
                  <ay-table
                    leyenda="Acciones y avances realizados hoy por el usuario"
                    [columnas]="columnasAccionesHoy"
                    [filas]="accionesHoyFiltradas()"
                    [rayada]="true"
                  >
                    <ng-template ayCelda="hora" let-fila>
                      @let a = comoAccionHoy(fila);
                      <strong ayText="mono" size="xs">{{ a.hora }}</strong>
                    </ng-template>
                    <ng-template ayCelda="tipo" let-fila>
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
                      <ay-button
                        tamano="sm"
                        variante="ghost"
                        (click)="seleccionarTicket.emit(a.ticket)"
                      >
                        Abrir ticket
                      </ay-button>
                    </ng-template>
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
                <ng-template ayCelda="num" let-fila>
                  @let t = comoTicket(fila);
                  <div ayStack gap="1">
                    <strong ayText="mono" size="xs">{{ t.num }}</strong>
                    <span ayText="body" size="xs">{{ t.empresa.nombre }}</span>
                  </div>
                </ng-template>
                <ng-template ayCelda="rayo" let-fila>
                  @let t = comoTicket(fila);
                  <div class="pl-atc-rayo-celda">
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
                    <strong>{{ t.area }}</strong>
                    <span ayText="body" size="xs">{{ t.owner ?? 'Sin asignar' }}</span>
                  </div>
                </ng-template>
                <ng-template ayCelda="state" let-fila>
                  @let t = comoTicket(fila);
                  <ay-badge size="sm" [tono]="t.state === 'ESCALATED' ? 'danger' : 'info'">
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
                    <ay-button tamano="sm" variante="primary" (click)="seleccionarTicket.emit(t.num)">
                      Continuar atención
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
                      <span ayText="body" size="xs">{{ g.area }}</span>
                    </div>
                  </ng-template>
                  <ng-template ayCelda="atendidos" let-fila>
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
                Correos de asignación enviados hoy (con CC a líder NEXUS)
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
                  <ng-template ayCelda="destinatarios" let-fila>
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
        >
          <ay-badge ayEstado size="sm" tono="info">
            {{ previewPoliticaSla().politica.id }} · v{{ previewPoliticaSla().politica.version }}
          </ay-badge>
          <ay-badge ayEstado size="sm" tono="neutral">
            Flujo {{ previewFlujoConfig().tipo }} · v{{ previewFlujoConfig().versionActual }} ({{ previewFlujoConfig().area }})
          </ay-badge>
        </ay-page-header>

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
                  <ay-form (enviar)="guardarNuevoTicket()">
                    <div ayStack gap="4">
                      <div ayGrid [anchoMinimo]="'15rem'" gap="md">
                        <ay-form-field etiqueta="Empresa (razón social y RUC)" obligatorio>
                          <ay-select
                            [opciones]="opcionesEmpresasForm"
                            [valor]="formEmpresa()"
                            (valorChange)="formEmpresa.set($event)"
                          />
                        </ay-form-field>
                        <ay-form-field etiqueta="Línea de negocio" obligatorio>
                          <ay-select
                            [opciones]="opcionesLineasForm"
                            [valor]="formLinea()"
                            (valorChange)="formLinea.set($event)"
                          />
                        </ay-form-field>
                        <ay-form-field etiqueta="Canal de entrada" obligatorio>
                          <ay-select
                            [opciones]="opcionesCanalesForm"
                            [valor]="formCanal()"
                            (valorChange)="formCanal.set($event)"
                          />
                        </ay-form-field>
                        <ay-form-field etiqueta="Tipo de ticket" obligatorio>
                          <ay-select
                            [opciones]="opcionesTiposForm"
                            [valor]="formTipo()"
                            (valorChange)="formTipo.set($event)"
                          />
                        </ay-form-field>
                        <ay-form-field etiqueta="Prioridad" obligatorio>
                          <ay-select
                            [opciones]="opcionesPrioridadForm"
                            [valor]="formPrioridad()"
                            (valorChange)="cambiarPrioridadForm($event)"
                          />
                        </ay-form-field>
                        <ay-form-field etiqueta="Cliente o Interesado (SIGDA / TAXON)" obligatorio>
                          <ay-input [valor]="formCliente()" (valorChange)="formCliente.set($event)" />
                        </ay-form-field>
                        <ay-form-field etiqueta="Documento (DNI / CE)" obligatorio>
                          <ay-input [valor]="formDni()" (valorChange)="formDni.set($event)" />
                        </ay-form-field>
                        <ay-form-field etiqueta="Proyecto y Lote / Unidad" obligatorio>
                          <ay-input [valor]="formProyecto()" (valorChange)="formProyecto.set($event)" />
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
                          <ay-input
                            [valor]="formContratoCiudad()"
                            (valorChange)="formContratoCiudad.set($event)"
                            placeholder="Ej. CITY_SERVICE_FEE-2026-0113"
                          />
                        </ay-form-field>
                      }

                      <div ayGrid [columnas]="2" gap="md">
                        <ay-form-field etiqueta="Resumen (una línea que se entienda en la bandeja)" obligatorio>
                          <ay-textarea
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
                          <ay-textarea
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

            <!-- Lateral derecho: SLA que se congelará + Flujo de Configuración -->
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
                      «{{ nombreTipo(formTipo()) }}» no tiene política activa: se aplicará la genérica global y se registrará una alerta en Configuración.
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
                  [subtitulo]="'Configuración › Flujos · v' + previewFlujoConfig().versionActual"
                  nivel="h2"
                  [separador]="true"
                />
                <ay-card-body padding="sm" gap="sm">
                  <ay-card-pairs [pares]="paresPreviewFlujoConfig()" />
                  <span ayText="body" size="xs">
                    Si el Administrador Funcional publica una nueva versión del flujo en Configuración, los nuevos tickets usarán esa versión automáticamente.
                  </span>
                </ay-card-body>
              </ay-card>
            </div>
          </div>
        }
      </div>
    }

    <!-- ====================================================================== -->
    <!-- VISTA 3: DETALLE DE TICKET + COPILOTO IA + HANDOFF 6/6 EJE 3           -->
    <!-- ====================================================================== -->
    @if (subvista() === 'detalle') {
      @if (ticketActual(); as t) {
        <div ayStack gap="6">
          <ay-page-header
            [titulo]="t.num + ' · ' + (estadoEs[t.state] ?? t.state)"
            [descripcion]="t.summary"
          >
            @if (t.rayo) {
              <ay-badge ayEstado size="sm" tono="warning">PRIORIDAD RAYO</ay-badge>
            }
            <ay-badge ayEstado size="sm" [tono]="evaluarSla(t).tono">{{ evaluarSla(t).txt }}</ay-badge>
            @if (t.contract) {
              <ay-button ayAcciones tamano="sm" variante="ghost" (click)="verContrato.emit(t.contract)">
                Ver contrato {{ t.contract }}
              </ay-button>
            }
            <ay-button ayAcciones tamano="sm" variante="secondary" (click)="modalDerivarAbierto.set(true)">
              Derivar / Paquete Legal 6/6
            </ay-button>
            @if (t.state !== 'RESOLVED' && t.state !== 'CLOSED') {
              <ay-button
                ayAcciones
                tamano="sm"
                variante="primary"
                [disabled]="t.conflict && t.area !== 'LEGAL'"
                (click)="resolverTicket(t)"
              >
                Marcar Resuelto
              </ay-button>
            } @else {
              <ay-button ayAcciones tamano="sm" variante="secondary" (click)="reabrirTicket(t)">
                Reabrir con nuevo SLA
              </ay-button>
            }
          </ay-page-header>

          @if (t.conflict || t.eje === 3) {
            <ay-alert
              tono="danger"
              titulo="Derivación Obligatoria a Eje 3 Legal activa"
            >
              Este caso presenta señal de conflicto legal o amenaza de denuncia. Primera línea tiene bloqueado el cierre directo
              y debe transferir el expediente con el <strong>Paquete Documental Completo 6/6</strong> sincronizado con la
              bandeja de Gerencia Legal.
            </ay-alert>
          }

          <div ayGrid [columnas]="2" gap="md">
            <div ayStack gap="4">
              <div ayStack gap="2">
                <ay-card variante="elevated" superficie="solid">
                  <ay-card-body padding="md" gap="md">
                    <ay-card-pairs [pares]="paresDetalleTicket(t)" />
                    <ay-alert tono="info" size="sm" titulo="Nota de contexto del cliente">
                      {{ t.emotion }}
                    </ay-alert>
                  </ay-card-body>
                </ay-card>
              </div>

              <!-- Interacciones con visibilidad controlada (título fuera del componente) -->
              <div ayStack gap="2">
                <div ayStack gap="1">
                  <ay-heading [nivel]="2" size="sm">Hilo de interacciones y comunicaciones</ay-heading>
                  <span ayText="subtitle" size="xs">
                    Las notas internas son exclusivas para el equipo y nunca se exponen en Mi Portal
                  </span>
                </div>
                <ay-card superficie="solid">
                  <ay-card-body padding="md" gap="md">
                    <div ayStack gap="3">
                      @for (it of t.interactions; track $index) {
                        <ay-card superficie="solid">
                          <ay-card-header
                            [titulo]="it.autor ?? 'Sistema'"
                            [subtitulo]="fmtHora(it.fecha)"
                            nivel="h4"
                            [separador]="true"
                          >
                            <div ayAcciones>
                              <ay-badge
                                size="sm"
                                [tono]="it.tipo === 'int' ? 'warning' : it.tipo === 'agt' ? 'info' : 'neutral'"
                              >
                                {{
                                  it.tipo === 'int'
                                    ? 'Nota interna (Oculta al cliente)'
                                    : it.tipo === 'agt'
                                      ? 'Respuesta visible en Mi Portal'
                                      : 'Mensaje del cliente'
                                }}
                              </ay-badge>
                            </div>
                          </ay-card-header>
                          <ay-card-body padding="sm">
                            <p ayText="body" size="sm">{{ it.texto }}</p>
                          </ay-card-body>
                        </ay-card>
                      }
                    </div>

                    <ay-divider espaciado="sm" />

                    <div ayStack gap="3">
                      <div ayRow gap="2" justificar="between" [ajuste]="true">
                        <strong ayText="label">Registrar nueva interacción</strong>
                        <ay-checkbox
                          [marcado]="notaInterna()"
                          (marcadoChange)="notaInterna.set($event)"
                        >
                          Nota interna (no visible en Mi Portal)
                        </ay-checkbox>
                      </div>
                      <ay-form-field etiqueta="Respuesta o nota de seguimiento">
                        <ay-textarea
                          [filas]="3"
                          [valor]="textoRespuesta()"
                          (valorChange)="textoRespuesta.set($event)"
                          placeholder="Escribe la respuesta al cliente o inserta la plantilla sugerida por el Copiloto IA..."
                        />
                      </ay-form-field>
                      <div ayRow gap="2" [ajuste]="true">
                        <ay-button tamano="sm" variante="primary" (click)="agregarInteraccion(t)">
                          Registrar interacción
                        </ay-button>
                        <ay-button tamano="sm" variante="secondary" (click)="usarPlantillaIa(t)">
                          Autocompletar con Copiloto IA
                        </ay-button>
                      </div>
                    </div>
                  </ay-card-body>
                </ay-card>
              </div>
            </div>

            <!-- Columna derecha: Guía de solución (conectada a Configuración), Asistente IA y Timeline -->
            <div ayStack gap="4">
              <div ayStack gap="2">
                <ay-card superficie="solid">
                  <ay-card-header
                    titulo="Guía de solución"
                    [subtitulo]="'Flujo con el que nació / opera este tipo: v' + flujoDeTicket(t.type).versionActual + ' (' + flujoDeTicket(t.type).area + ')'"
                    nivel="h2"
                    [separador]="true"
                  >
                    <div ayAcciones>
                      @if (guiaConfigDeTicket(t.type)?.versionActual; as ver) {
                        <ay-badge size="sm" tono="info">Versión v{{ ver }}</ay-badge>
                      } @else {
                        <ay-badge size="sm" tono="danger">Sin guía</ay-badge>
                      }
                    </div>
                  </ay-card-header>
                  <ay-card-body padding="md" gap="md">
                    @if (guiaConfigDeTicket(t.type); as guiaCfg) {
                      @if (guiaCfg.versionActual !== null) {
                        <div ayStack gap="2">
                          <strong ayText="label" size="xs">Pasos publicados en Configuración</strong>
                          <ay-list
                            etiqueta="Pasos recomendados"
                            [ordenada]="true"
                            [separadores]="true"
                            [elementos]="guiaCfg.pasos"
                          >
                            <ng-template #elemento let-paso>
                              <ay-list-item [titulo]="paso" />
                            </ng-template>
                          </ay-list>
                        </div>

                        @if (guiaCfg.criterios.length > 0) {
                          <div ayStack gap="2">
                            <strong ayText="label" size="xs">Criterios de cierre exigidos</strong>
                            <ay-list
                              etiqueta="Criterios de cierre"
                              [ordenada]="false"
                              [separadores]="true"
                              [elementos]="guiaCfg.criterios"
                            >
                              <ng-template #elemento let-crit>
                                <ay-list-item [titulo]="crit" />
                              </ng-template>
                            </ay-list>
                          </div>
                        }
                      } @else {
                        <ay-alert tono="warning" size="sm" titulo="Sin guía publicada">
                          Este tipo de ticket («{{ nombreTipo(t.type) }}») no tiene guía publicada. Ya se avisó al Administrador Funcional en Configuración › Alertas.
                        </ay-alert>
                      }
                    }

                    <ay-divider espaciado="sm" />

                    <div ayStack gap="2">
                      <strong ayText="label" size="sm">Asistente de IA (con anonimización previa de DNI/tarjetas)</strong>
                      <ay-alert tono="info" size="sm" titulo="Revisión del Copiloto IA sobre tu borrador">
                        {{ evaluarBorradorIa() }}
                      </ay-alert>
                      <div ayRow gap="2" [ajuste]="true">
                        <ay-button tamano="sm" variante="primary" (click)="registrarDecisionIa(t, 'ACEPTADA')">
                          Aceptar sugerencia IA
                        </ay-button>
                        <ay-button tamano="sm" variante="secondary" (click)="registrarDecisionIa(t, 'EDITADA')">
                          Usar mi versión editada
                        </ay-button>
                        <ay-button tamano="sm" variante="ghost" (click)="registrarDecisionIa(t, 'DESCARTADA')">
                          Descartar
                        </ay-button>
                      </div>
                    </div>
                  </ay-card-body>
                </ay-card>
              </div>

              <div ayStack gap="2">
                <div ayStack gap="1">
                  <ay-heading [nivel]="2" size="sm">Bitácora inmutable de asignaciones</ay-heading>
                  <span ayText="subtitle" size="xs">Trazabilidad cronológica con AyTimeline</span>
                </div>
                <ay-card superficie="solid">
                  <ay-card-body padding="md">
                    <ay-timeline
                      etiqueta="Bitácora de asignaciones del ticket"
                      [hitos]="hitosBitacoraTicket(t)"
                    />
                  </ay-card-body>
                </ay-card>
              </div>
            </div>
          </div>

          <!-- Modal Derivar / Paquete Mínimo 6/6 de Handoff a Eje 3 Legal -->
          <ay-modal
            [abierto]="modalDerivarAbierto()"
            (abiertoChange)="modalDerivarAbierto.set($event)"
            titulo="Derivación de área y Paquete Documental 6/6 Eje 3 Legal"
          >
            <ay-form (enviar)="confirmarDerivacion(t)">
              <div ayStack gap="3">
                <ay-form-field etiqueta="Área destino" obligatorio>
                  <ay-select
                    [opciones]="opcionesAreasForm"
                    [valor]="derivarArea()"
                    (valorChange)="derivarArea.set($event)"
                  />
                </ay-form-field>
                <ay-form-field etiqueta="Motivo de derivación" obligatorio>
                  <ay-select
                    [opciones]="opcionesMotivosForm"
                    [valor]="derivarMotivo()"
                    (valorChange)="derivarMotivo.set($event)"
                  />
                </ay-form-field>

                @if (derivarArea() === 'LEGAL' || derivarMotivo() === 'DERIVACION_CONFLICTO_EJE3') {
                  <ay-form-group
                    leyenda="Checklist obligatorio 6/6 para transferencia a Eje 3 Legal"
                    [descripcion]="'Completados ' + conteoPaquete6() + '/6 requisitos para sincronización con Legal.'"
                    variante="card"
                  >
                    @for (item of itemsPaquete6; track item.k) {
                      <ay-checkbox
                        [marcado]="paquete6()[item.k]"
                        (marcadoChange)="alternarItemPaquete6(item.k, $event)"
                      >
                        {{ item.label }}
                      </ay-checkbox>
                    }
                  </ay-form-group>
                }

                <ay-form-field etiqueta="Nota de derivación" obligatorio>
                  <ay-textarea
                    [filas]="2"
                    [valor]="derivarNota()"
                    (valorChange)="derivarNota.set($event)"
                  />
                </ay-form-field>

                <div ayRow gap="2" justificar="end">
                  <ay-button variante="ghost" (click)="modalDerivarAbierto.set(false)">Cancelar</ay-button>
                  <ay-button
                    tipo="submit"
                    variante="primary"
                    [disabled]="
                      (derivarArea() === 'LEGAL' || derivarMotivo() === 'DERIVACION_CONFLICTO_EJE3') &&
                      conteoPaquete6() < 6
                    "
                  >
                    Confirmar derivación y sincronizar
                  </ay-button>
                </div>
              </div>
            </ay-form>
          </ay-modal>
        </div>
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
              <ay-select
                [opciones]="opcionesCeseOrigen"
                [valor]="ceseOrigen()"
                (valorChange)="ceseOrigen.set($event)"
              />
            </ay-form-field>
            <ay-form-field etiqueta="Nuevo responsable receptor (menor carga activa)" obligatorio>
              <ay-select
                [opciones]="opcionesCeseDestino"
                [valor]="ceseDestino()"
                (valorChange)="ceseDestino.set($event)"
              />
            </ay-form-field>
            <ay-form-field etiqueta="Motivo tipificado de auditoría" obligatorio>
              <ay-select
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
  readonly filtroClienteExterno = input<string>('');

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
  readonly motivos = MOTIVOS_DERIVACION;

  readonly columnasBandeja: readonly AyColumna[] = [
    { clave: 'num', cabecera: 'N.º Ticket / Empresa', ancho: '10rem' },
    { clave: 'rayo', cabecera: 'Prioridad / Rayo', ancho: '8.5rem' },
    { clave: 'cli', cabecera: 'Cliente / Proyecto' },
    { clave: 'ch', cabecera: 'Canal / Tipo', ancho: '10.5rem' },
    { clave: 'area', cabecera: 'Área / Gestor', ancho: '10.5rem' },
    { clave: 'state', cabecera: 'Estado', ancho: '9.5rem' },
    { clave: 'sla', cabecera: 'Compromiso SLA', ancho: '10.5rem' },
    { clave: 'acciones', cabecera: 'Acciones', alineacion: 'end', ancho: '16.5rem' },
  ];

  readonly opcionesFiltroControlEmpresa = computed<AyFilterOpcion[]>(() =>
    EMPRESAS_AYBAR.map((e) => ({
      valor: e.id,
      etiqueta: `${e.id} · ${e.nombre}`,
      recuento: this.tickets().filter((t) => t.co === e.id).length,
    })),
  );

  readonly opcionesFiltroControlCanal = computed<AyFilterOpcion[]>(() =>
    CANALES_ATC.map((c) => ({
      valor: c,
      etiqueta: c,
      recuento: this.tickets().filter((t) => t.ch === c).length,
    })),
  );

  readonly opcionesFiltroControlTipo = computed<AyFilterOpcion[]>(() =>
    TIPOS_TICKET.map((tp) => ({
      valor: tp.id,
      etiqueta: `${tp.id} · ${tp.nombre}`,
      recuento: this.tickets().filter((t) => t.type === tp.id).length,
    })),
  );

  readonly opcionesFiltroControlPrioridad = computed<AyFilterOpcion[]>(() =>
    PRIORIDADES_TICKET.map((p) => ({
      valor: p.id,
      etiqueta: p.nombre,
      recuento: this.tickets().filter((t) => t.prio === p.id).length,
    })),
  );

  readonly opcionesFiltroControlArea = computed<AyFilterOpcion[]>(() =>
    AREAS_ATC.map((a) => ({
      valor: a,
      etiqueta: a,
      recuento: this.tickets().filter((t) => t.area === a).length,
    })),
  );

  readonly opcionesFiltroControlGestor = computed<AyFilterOpcion[]>(() => {
    const gestores = Array.from(
      new Set(this.tickets().map((t) => t.owner ?? 'SIN_ASIGNAR')),
    );
    return gestores.map((g) => ({
      valor: g,
      etiqueta: g === 'SIN_ASIGNAR' ? 'Sin asignar (Cola)' : g,
      recuento: this.tickets().filter((t) => (t.owner ?? 'SIN_ASIGNAR') === g).length,
    }));
  });

  readonly opcionesFiltroControlEstado: readonly AyFilterOpcion[] = ESTADOS_TICKET.map((st) => ({
    valor: st,
    etiqueta: ESTADO_ES[st] ?? st,
  }));

  readonly opcionesFiltroControlSla: readonly AyFilterOpcion[] = [
    { valor: 'success', etiqueta: 'En plazo / Cumplido' },
    { valor: 'warning', etiqueta: 'Por vencer (Alerta)' },
    { valor: 'danger', etiqueta: 'Vencido / Crítico' },
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
    { value: 'REASSIGNMENT_CESE', label: 'REASSIGNMENT_CESE' },
    { value: 'REASSIGNMENT_ROTACION', label: 'REASSIGNMENT_ROTACION' },
    { value: 'REASSIGNMENT_CARGA', label: 'REASSIGNMENT_CARGA' },
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

  readonly opcionesAreasForm: AyOpcionSelect[] = AREAS_ATC.map((a) => ({
    value: a,
    label: a,
  }));

  readonly opcionesMotivosForm: AyOpcionSelect[] = MOTIVOS_DERIVACION.map((m) => ({
    value: m,
    label: m,
  }));

  readonly busquedaGeneral = signal<string>('');
  readonly filtroEmpresa = signal<string>('');
  readonly filtroCanal = signal<string>('');
  readonly filtroTipo = signal<string>('');
  readonly filtroPrioridad = signal<string>('');
  readonly filtroArea = signal<string>('');
  readonly filtroGestor = signal<string>('');
  readonly filtroEstado = signal<string>('');
  readonly soloConRayo = signal<boolean>(false);
  readonly filtroColSla = signal<string>('');

  readonly filtroCategoriaAccionHoy = signal<string>('TODAS');
  readonly opcionesFiltroAccionesHoy: AySegmentoOpcion[] = [
    { valor: 'TODAS', etiqueta: 'Todas las acciones' },
    { valor: 'RESPUESTA_SLA', etiqueta: '1.ª Respuesta SLA' },
    { valor: 'RESOLUCION', etiqueta: 'Resoluciones' },
    { valor: 'DERIVACION', etiqueta: 'Derivaciones 6/6' },
    { valor: 'LLAMADA_CTI', etiqueta: 'Llamadas CTI' },
  ];

  readonly columnasAccionesHoy: readonly AyColumna[] = [
    { clave: 'hora', cabecera: 'Hora', ancho: '6rem' },
    { clave: 'tipo', cabecera: 'Tipo de acción', ancho: '11rem' },
    { clave: 'ticket', cabecera: 'Ticket / Cliente', ancho: '12rem' },
    { clave: 'detalle', cabecera: 'Avance o gestión realizada' },
    { clave: 'accion', cabecera: 'Expediente', alineacion: 'end', ancho: '8rem' },
  ];

  readonly columnasEquipoHoy: readonly AyColumna[] = [
    { clave: 'gestor', cabecera: 'Gestor / Área' },
    { clave: 'atendidos', cabecera: 'Avance del turno', ancho: '11rem' },
    { clave: 'pendientes', cabecera: 'Carga activa', ancho: '11rem' },
    { clave: 'csat', cabecera: 'CSAT y SLA hoy', alineacion: 'end', ancho: '10rem' },
  ];

  readonly columnasCorreosHoy: readonly AyColumna[] = [
    { clave: 'hora', cabecera: 'Hora', ancho: '5.5rem' },
    { clave: 'ticket', cabecera: 'Ticket y Asunto' },
    { clave: 'destinatarios', cabecera: 'Destinatario y CC Líder' },
    { clave: 'estado', cabecera: 'Envío', alineacion: 'end', ancho: '7rem' },
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

  readonly accionesHoyFiltradas = computed(() => {
    const cat = this.filtroCategoriaAccionHoy();
    if (cat === 'TODAS') return this.accionesHoy();
    return this.accionesHoy().filter((a) => a.categoria === cat);
  });

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
    this.tickets().filter((t) => t.state !== 'RESOLVED' && t.state !== 'CLOSED'),
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
      const cliExt = this.filtroClienteExterno();
      if (cliExt !== undefined && cliExt.trim()) {
        this.busquedaGeneral.set(cliExt);
      }
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

  alFiltrarEmpresa(valor: AyFilterValor | undefined): void {
    this.filtroEmpresa.set(typeof valor === 'string' ? valor : '');
  }

  alFiltrarCanal(valor: AyFilterValor | undefined): void {
    this.filtroCanal.set(typeof valor === 'string' ? valor : '');
  }

  alFiltrarTipo(valor: AyFilterValor | undefined): void {
    this.filtroTipo.set(typeof valor === 'string' ? valor : '');
  }

  alFiltrarPrioridad(valor: AyFilterValor | undefined): void {
    this.filtroPrioridad.set(typeof valor === 'string' ? valor : '');
  }

  alFiltrarArea(valor: AyFilterValor | undefined): void {
    this.filtroArea.set(typeof valor === 'string' ? valor : '');
  }

  alFiltrarGestor(valor: AyFilterValor | undefined): void {
    this.filtroGestor.set(typeof valor === 'string' ? valor : '');
  }

  alFiltrarEstado(valor: AyFilterValor | undefined): void {
    this.filtroEstado.set(typeof valor === 'string' ? valor : '');
  }

  alFiltrarSla(valor: AyFilterValor | undefined): void {
    this.filtroColSla.set(typeof valor === 'string' ? valor : '');
  }

  readonly hayFiltrosActivos = computed(() =>
    Boolean(
      this.busquedaGeneral().trim() ||
      this.filtroEmpresa() ||
      this.filtroCanal() ||
      this.filtroTipo() ||
      this.filtroPrioridad() ||
      this.filtroArea() ||
      this.filtroGestor() ||
      this.filtroEstado() ||
      this.soloConRayo() ||
      this.filtroColSla(),
    ),
  );

  limpiarFiltrosTabla(): void {
    this.busquedaGeneral.set('');
    this.filtroEmpresa.set('');
    this.filtroCanal.set('');
    this.filtroTipo.set('');
    this.filtroPrioridad.set('');
    this.filtroArea.set('');
    this.filtroGestor.set('');
    this.filtroEstado.set('');
    this.soloConRayo.set(false);
    this.filtroColSla.set('');
  }

  readonly ticketsConRayo = computed(() => this.tickets().filter((t) => t.rayo).length);

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

  readonly ticketsFiltrados = computed(() => {
    const q = this.busquedaGeneral().trim().toLowerCase();
    const fSla = this.filtroColSla();

    const lista = this.tickets().filter((t) => {
      if (this.filtroEmpresa() && t.co !== this.filtroEmpresa()) return false;
      if (this.filtroCanal() && t.ch !== this.filtroCanal()) return false;
      if (this.filtroTipo() && t.type !== this.filtroTipo()) return false;
      if (this.filtroPrioridad() && t.prio !== this.filtroPrioridad()) return false;
      if (this.filtroArea() && t.area !== this.filtroArea()) return false;
      if (this.filtroGestor() && (t.owner ?? 'SIN_ASIGNAR') !== this.filtroGestor()) return false;
      if (this.filtroEstado() && t.state !== this.filtroEstado()) return false;
      if (this.soloConRayo() && !t.rayo) return false;

      if (q) {
        const tipoNom = this.nombreTipo(t.type).toLowerCase();
        const ownerTxt = (t.owner ?? 'Sin asignar (Cola)').toLowerCase();
        const coincide =
          t.num.toLowerCase().includes(q) ||
          t.empresa.nombre.toLowerCase().includes(q) ||
          t.cli.toLowerCase().includes(q) ||
          t.dni.toLowerCase().includes(q) ||
          t.proj.toLowerCase().includes(q) ||
          t.ch.toLowerCase().includes(q) ||
          tipoNom.includes(q) ||
          t.area.toLowerCase().includes(q) ||
          ownerTxt.includes(q);
        if (!coincide) return false;
      }

      if (fSla) {
        const slaInfo = evaluarSlaTicket(t);
        if (slaInfo.tono !== fSla) return false;
      }

      return true;
    });
    return [...lista].sort((a, b) => {
      if (a.rayo !== b.rayo) return a.rayo ? -1 : 1;
      return a.resDue.getTime() - b.resDue.getTime();
    });
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
      { clave: 'Razón Social', valor: `${t.empresa.nombre} (RUC ${t.empresa.ruc})` },
      { clave: 'Cliente / Proyecto', valor: `${t.cli} (${t.dni}) · ${t.proj}` },
      { clave: 'Política SLA aplicada', valor: t.slaSrc },
      {
        clave: 'Hitos de atención',
        valor: `Apertura: ${this.fmtHora(t.opened)} · 1.ª resp: ${this.fmtHora(t.firstResp)} · Vence: ${this.fmtHora(t.resDue)}`,
      },
    ];
  }

  hitosBitacoraTicket(t: TicketAtc): AyTimelineEvento[] {
    return t.log.map((lg, idx) => ({
      id: `${t.num}-log-${idx}`,
      titulo: `${lg.motivo} — ${lg.nota}`,
      fecha: lg.fecha,
      autor: `${lg.area} · ${lg.responsable ?? 'Cola'}`,
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
      texto: 'Ticket resuelto · Encuesta CSAT/CES enviada automáticamente a Mi Portal.',
    });
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
