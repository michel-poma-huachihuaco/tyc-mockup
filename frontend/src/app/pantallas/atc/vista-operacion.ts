import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
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
  AyInput,
  AyList,
  AyListItem,
  AyModal,
  AyRow,
  AySearchInput,
  AySelect,
  AyStack,
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
    AyInput,
    AyList,
    AyListItem,
    AyModal,
    AyRow,
    AySearchInput,
    AySelect,
    AyStack,
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
    <!-- VISTA 1: BANDEJA ORQUESTADORA Y OPERATIVA                              -->
    <!-- ====================================================================== -->
    @if (subvista() === 'bandeja') {
      <div ayStack gap="4">
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

        <!-- Tablero de Avance Diario Individual y de Equipo -->
        <ay-card superficie="solid">
          <ay-card-body padding="sm" gap="sm">
            <div ayRow gap="3" justificar="between" [ajuste]="true">
              <div ayStack gap="1">
                <span ayText="label" size="xs">Mi avance diario y el de mi equipo</span>
                <div ayRow gap="2" [ajuste]="true">
                  <strong>C. Rojas (Gestor ATC): 14 / 18 tickets hoy</strong>
                  <ay-badge tono="success">94% dentro de SLA</ay-badge>
                  <ay-badge tono="warning">{{ ticketsConRayo() }} con Rayo prioritario</ay-badge>
                  <ay-badge tono="info">
                    {{ ticketsFiltrados().length }} de {{ tickets().length }} tickets en vista
                  </ay-badge>
                </div>
              </div>
              <div ayRow gap="2" [ajuste]="true">
                @if (!ctiEntranteVisible()) {
                  <ay-button tamano="sm" variante="ghost" (click)="ctiEntranteVisible.set(true)">
                    Mostrar central CTI
                  </ay-button>
                }
                <ay-button tamano="sm" variante="secondary" (click)="modalCeseAbierto.set(true)">
                  Reasignación masiva por rotación
                </ay-button>
                <ay-button tamano="sm" variante="primary" (click)="irANuevo.emit()">
                  + Nuevo ticket
                </ay-button>
              </div>
            </div>
          </ay-card-body>
        </ay-card>

        <!-- Bandeja Orquestadora y Casillero por Área con AyTableToolbar + AyTable -->
        <ay-card variante="elevated" superficie="solid">
          <ay-card-header
            titulo="Bandeja Orquestadora y Casillero por Área"
            subtitulo="Gestión centralizada de solicitudes con filtros rápidos, prioridad Rayo y vencimiento SLA"
            nivel="h3"
            [separador]="true"
          />
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
                  etiqueta="Área"
                  tipo="single"
                  size="sm"
                  [opciones]="opcionesFiltroControlArea()"
                  [valor]="filtroArea() || undefined"
                  (valorChange)="alFiltrarArea($event)"
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
              [filas]="ticketsFiltrados()"
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
                <ay-button
                  tamano="sm"
                  [variante]="t.rayo ? 'primary' : 'ghost'"
                  (click)="alternarRayo(t)"
                >
                  {{ t.rayo ? 'Prioritario' : 'Normal' }}
                </ay-button>
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
                <div ayRow gap="1" [ajuste]="true">
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
          </ay-card-body>
        </ay-card>

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
    <!-- VISTA 2: ALTA MULTICANAL CON SLA CONGELADO Y DERIVACIÓN LEGAL          -->
    <!-- ====================================================================== -->
    @if (subvista() === 'nuevo') {
      <div ayStack gap="4">
        <ay-card variante="elevated" superficie="solid">
          <ay-card-header
            titulo="Registrar nuevo ticket de atención"
            subtitulo="Registro multicanal tipificado con compromiso SLA calculado en horas hábiles"
            nivel="h2"
            [separador]="true"
          />
          <ay-card-body padding="md" gap="md">
            <ay-form (enviar)="guardarNuevoTicket()">
              <div ayStack gap="4">
                <div ayGrid [anchoMinimo]="'15rem'" gap="md">
                  <ay-form-field etiqueta="Razón social del grupo (11 empresas)" obligatorio>
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
                  <ay-form-field etiqueta="Tipo de solicitud" obligatorio>
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
                  <ay-form-field etiqueta="Cliente o Interesado" obligatorio>
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
                  leyenda="Condiciones especiales de ingreso y escalamiento"
                  variante="card"
                >
                  <ay-checkbox
                    [marcado]="formContingencia()"
                    (marcadoChange)="formContingencia.set($event)"
                  >
                    Registro en cola de conciliación: Cliente no ubicado en el maestro o sistema en contingencia
                  </ay-checkbox>
                  <ay-checkbox
                    [marcado]="formRayo()"
                    (marcadoChange)="formRayo.set($event)"
                  >
                    Marcar con prioridad Rayo (atención preferente en cola)
                  </ay-checkbox>
                  <ay-checkbox
                    [marcado]="formConflicto()"
                    (marcadoChange)="formConflicto.set($event)"
                  >
                    Señal de conflicto legal o amenaza de denuncia (derivación obligatoria a Eje 3 Legal)
                  </ay-checkbox>
                </ay-form-group>

                @if (formTipo() === 'CIT') {
                  <ay-form-field
                    etiqueta="Contrato de mantenimiento de ciudad requerido"
                    obligatorio
                  >
                    <ay-input
                      [valor]="formContratoCiudad()"
                      (valorChange)="formContratoCiudad.set($event)"
                      placeholder="Ej. CITY_SERVICE_FEE-2026-0113"
                    />
                  </ay-form-field>
                }

                <div ayGrid [columnas]="2" gap="md">
                  <ay-form-field etiqueta="Resumen del pedido o reclamo" obligatorio>
                    <ay-textarea
                      [filas]="3"
                      [valor]="formResumen()"
                      (valorChange)="formResumen.set($event)"
                    />
                  </ay-form-field>
                  <ay-form-field
                    etiqueta="Nota de contexto y tono del cliente (objetiva y basada en hechos)"
                    [error]="
                      emocionInvalida()
                        ? 'Evita calificativos subjetivos («histérico», «problemático», «mentiroso»). Describe únicamente hechos observables.'
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

                <!-- Previsualización del cálculo de SLA congelado al abrir -->
                <ay-alert
                  tono="info"
                  [titulo]="'Cálculo automático de SLA en horas hábiles · Política: ' + previewSla().src"
                >
                  <div ayRow gap="2" [ajuste]="true">
                    <ay-badge tono="info">
                      1.ª respuesta: {{ previewSla().fr }} h hábiles ({{ previewSla().frFecha }})
                    </ay-badge>
                    <ay-badge tono="neutral">
                      Resolución: {{ previewSla().res }} h hábiles ({{ previewSla().resFecha }})
                    </ay-badge>
                    @if (esTipoLibro()) {
                      <ay-badge tono="warning">
                        Libro de Reclamaciones: 15 días hábiles ({{ previewSla().libroFecha }})
                      </ay-badge>
                    }
                  </div>
                </ay-alert>

                <div ayRow gap="2" justificar="end">
                  <ay-button
                    tipo="submit"
                    variante="primary"
                    [disabled]="emocionInvalida()"
                  >
                    Confirmar alta y generar N.º correlativo
                  </ay-button>
                </div>
              </div>
            </ay-form>
          </ay-card-body>
        </ay-card>
      </div>
    }

    <!-- ====================================================================== -->
    <!-- VISTA 3: DETALLE DE TICKET + COPILOTO IA + HANDOFF 6/6 EJE 3           -->
    <!-- ====================================================================== -->
    @if (subvista() === 'detalle') {
      @if (ticketActual(); as t) {
        <div ayStack gap="4">
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
              <ay-card variante="elevated" superficie="solid">
                <ay-card-header
                  [titulo]="t.num + ' · ' + (estadoEs[t.state] ?? t.state)"
                  [subtitulo]="t.summary"
                  nivel="h2"
                  [separador]="true"
                >
                  <div ayAcciones ayRow gap="2" [ajuste]="true">
                    @if (t.rayo) {
                      <ay-badge tono="warning">PRIORIDAD RAYO</ay-badge>
                    }
                    <ay-badge [tono]="evaluarSla(t).tono">{{ evaluarSla(t).txt }}</ay-badge>
                    @if (t.contract) {
                      <ay-button tamano="sm" variante="ghost" (click)="verContrato.emit(t.contract)">
                        Ver contrato {{ t.contract }}
                      </ay-button>
                    }
                    <ay-button tamano="sm" variante="secondary" (click)="modalDerivarAbierto.set(true)">
                      Derivar / Paquete Legal 6/6
                    </ay-button>
                    @if (t.state !== 'RESOLVED' && t.state !== 'CLOSED') {
                      <ay-button
                        tamano="sm"
                        variante="primary"
                        [disabled]="t.conflict && t.area !== 'LEGAL'"
                        (click)="resolverTicket(t)"
                      >
                        Marcar Resuelto
                      </ay-button>
                    } @else {
                      <ay-button tamano="sm" variante="secondary" (click)="reabrirTicket(t)">
                        Reabrir con nuevo SLA
                      </ay-button>
                    }
                  </div>
                </ay-card-header>
                <ay-card-body padding="md" gap="md">
                  <ay-card-pairs [pares]="paresDetalleTicket(t)" />
                  <ay-alert tono="info" size="sm" titulo="Nota de contexto del cliente">
                    {{ t.emotion }}
                  </ay-alert>
                </ay-card-body>
              </ay-card>

              <!-- Interacciones con visibilidad controlada -->
              <ay-card superficie="solid">
                <ay-card-header
                  titulo="Hilo de interacciones y comunicaciones"
                  subtitulo="Las notas internas son exclusivas para el equipo y nunca se exponen en Mi Portal"
                  nivel="h3"
                  [separador]="true"
                />
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

            <!-- Columna derecha: Guía de solución paso a paso, Copiloto IA y Timeline -->
            <div ayStack gap="4">
              <ay-card superficie="solid">
                <ay-card-header
                  [titulo]="guiaActual(t.type).titulo"
                  subtitulo="Guía operativa y Copiloto IA para el Agente"
                  nivel="h3"
                  [separador]="true"
                />
                <ay-card-body padding="md" gap="md">
                  <ay-list
                    etiqueta="Pasos recomendados"
                    [ordenada]="true"
                    [separadores]="true"
                    [elementos]="guiaActual(t.type).pasos"
                  >
                    <ng-template #elemento let-paso>
                      <ay-list-item [titulo]="paso" />
                    </ng-template>
                  </ay-list>

                  <ay-alert tono="info" size="sm" titulo="Revisión del Copiloto IA sobre tu borrador">
                    {{ evaluarBorradorIa() }}
                  </ay-alert>
                </ay-card-body>
              </ay-card>

              <ay-card superficie="solid">
                <ay-card-header
                  titulo="Bitácora inmutable de asignaciones"
                  subtitulo="Trazabilidad cronológica con AyTimeline"
                  nivel="h3"
                  [separador]="true"
                />
                <ay-card-body padding="md">
                  <ay-timeline
                    etiqueta="Bitácora de asignaciones del ticket"
                    [hitos]="hitosBitacoraTicket(t)"
                  />
                </ay-card-body>
              </ay-card>
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
  `,
})
export class VistaOperacionComponent {
  readonly subvista = input.required<'bandeja' | 'nuevo' | 'detalle'>();
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
    { clave: 'num', cabecera: 'N.º Ticket', ancho: '9rem' },
    { clave: 'rayo', cabecera: 'Prioridad Rayo', ancho: '8rem' },
    { clave: 'cli', cabecera: 'Cliente / Proyecto' },
    { clave: 'ch', cabecera: 'Canal / Tipo', ancho: '11rem' },
    { clave: 'area', cabecera: 'Área / Gestor', ancho: '11rem' },
    { clave: 'state', cabecera: 'Estado', ancho: '10rem' },
    { clave: 'sla', cabecera: 'Compromiso SLA', ancho: '11rem' },
    { clave: 'acciones', cabecera: 'Acciones', alineacion: 'end', ancho: '14rem' },
  ];

  readonly opcionesFiltroControlEmpresa = computed<AyFilterOpcion[]>(() =>
    EMPRESAS_AYBAR.map((e) => ({
      valor: e.id,
      etiqueta: `${e.id} · ${e.nombre}`,
      recuento: this.tickets().filter((t) => t.co === e.id).length,
    })),
  );

  readonly opcionesFiltroControlArea = computed<AyFilterOpcion[]>(() =>
    AREAS_ATC.map((a) => ({
      valor: a,
      etiqueta: a,
      recuento: this.tickets().filter((t) => t.area === a).length,
    })),
  );

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
  readonly filtroArea = signal<string>('');
  readonly filtroEstado = signal<string>('');
  readonly soloConRayo = signal<boolean>(false);
  readonly filtroColSla = signal<string>('');

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
  }

  comoTicket(fila: unknown): TicketAtc {
    return fila as TicketAtc;
  }

  alFiltrarEmpresa(valor: AyFilterValor | undefined): void {
    this.filtroEmpresa.set(typeof valor === 'string' ? valor : '');
  }

  alFiltrarArea(valor: AyFilterValor | undefined): void {
    this.filtroArea.set(typeof valor === 'string' ? valor : '');
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
      this.filtroArea() ||
      this.filtroEstado() ||
      this.soloConRayo() ||
      this.filtroColSla(),
    ),
  );

  limpiarFiltrosTabla(): void {
    this.busquedaGeneral.set('');
    this.filtroEmpresa.set('');
    this.filtroArea.set('');
    this.filtroEstado.set('');
    this.soloConRayo.set(false);
    this.filtroColSla.set('');
  }

  readonly ticketsConRayo = computed(() => this.tickets().filter((t) => t.rayo).length);

  readonly ticketsFiltrados = computed(() => {
    const q = this.busquedaGeneral().trim().toLowerCase();
    const fSla = this.filtroColSla();

    const lista = this.tickets().filter((t) => {
      if (this.filtroEmpresa() && t.co !== this.filtroEmpresa()) return false;
      if (this.filtroArea() && t.area !== this.filtroArea()) return false;
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

  readonly previewSla = computed(() => {
    const pol = calcularPoliticaSla(this.formTipo(), this.formPrioridad());
    const frDate = sumarHorasHabiles(AHORA_BASE, pol.fr);
    const resDate = sumarHorasHabiles(AHORA_BASE, pol.res);
    const libroDate = sumarDiasHabiles(AHORA_BASE, 15);
    return {
      ...pol,
      frFecha: fmtFechaHora(frDate),
      resFecha: fmtFechaHora(resDate),
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
    const pol = calcularPoliticaSla(this.formTipo(), this.formPrioridad());
    const corr = String(Math.floor(500 + Math.random() * 400)).padStart(6, '0');
    const num = `${emp.id}-${corr}`;
    const esConflicto = this.formConflicto();

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
      area: esConflicto ? 'LEGAL' : 'ATC',
      owner: esConflicto ? 'Dra. P. Vílchez' : 'C. Rojas',
      opened: AHORA_BASE,
      frDue: sumarHorasHabiles(AHORA_BASE, pol.fr),
      resDue: sumarHorasHabiles(AHORA_BASE, pol.res),
      slaSrc: pol.src,
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
          area: esConflicto ? 'LEGAL' : 'ATC',
          responsable: esConflicto ? 'Dra. P. Vílchez' : 'C. Rojas',
          motivo: this.formContingencia() ? 'ALTA_CONTINGENCIA_CONCILIACION' : 'ALTA_MULTICANAL',
          nota: 'Compromiso SLA congelado al abrir en horas hábiles de Perú.',
        },
      ],
      status: [{ fecha: AHORA_BASE, estado: esConflicto ? 'ESCALATED' : 'OPEN', autor: 'C. Rojas' }],
    };

    this.ticketCreado.emit({ ticket: nuevo, crearAsientoLibro: this.esTipoLibro() });
  }

  guiaActual(type: string): { titulo: string; pasos: string[]; plantillaIa: string } {
    const g = GUIAS_SOLUCION[type] ?? GUIAS_SOLUCION['CTA'];
    return { titulo: g.titulo, pasos: [...g.pasos], plantillaIa: g.plantillaIa };
  }

  usarPlantillaIa(t: TicketAtc): void {
    this.textoRespuesta.set(this.guiaActual(t.type).plantillaIa);
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
    const pol = calcularPoliticaSla(t.type, t.prio);
    t.resDue = sumarHorasHabiles(AHORA_BASE, pol.res);
    t.status.push({
      fecha: AHORA_BASE,
      estado: `REOPENED (#${t.reopen})`,
      autor: 'C. Rojas',
    });
    t.interactions.push({
      tipo: 'sys',
      fecha: AHORA_BASE,
      texto: `Ticket reabierto · Se conserva el hito original de cierre y se abre nuevo compromiso hasta ${fmtFechaHora(t.resDue)}.`,
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
