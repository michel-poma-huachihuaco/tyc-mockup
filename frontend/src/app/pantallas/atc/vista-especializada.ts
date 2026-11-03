import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
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
  AyDropdownMenu,
  AyEmptyState,
  AyFileUpload,
  AyForm,
  AyFormField,
  AyFormGroup,
  AyGrid,
  AyIconButton,
  AyInput,
  AyList,
  AyListItem,
  AyModal,
  AyPageHeader,
  AyProgressBar,
  AyRow,
  AySelect,
  AySegmentedControl,
  AyStack,
  AyStatistic,
  AyTable,
  AyTabs,
  AyTextarea,
  AyText,
  type AyColumna,
  type AyMenuItem,
  type AyOpcionSelect,
  type AySegmentoOpcion,
  type AyTabsElemento,
  type AyUploadFile,
  type ParCardPairs,
} from '@aybarcorp/ui-angular';
import {
  AHORA_BASE,
  AREAS_ATC,
  EMPRESAS_AYBAR,
  ESTADO_ES,
  PRIORIDADES_TICKET,
  TIPOS_TICKET,
  diasHabilesEntre,
  fmtFecha,
  fmtFechaHora,
  sumarDiasHabiles,
  type AsistenteProyecto,
  type BusEntregaFest,
  type CasoMorosidad,
  type CasoSgd,
  type ReclamoGarantia,
  type TicketAtc,
  CLIENTES_360,
  crearTicketInicial,
} from './datos-atc';
import {
  ALERTA_SLA_ES,
  APELACION_INSTANCIA_ES,
  AREA_ES,
  ASIENTO_TIPO_ES,
  CIERRE_SGD_ES,
  CRITICIDAD_ES,
  EVENTO_URBEMIND_ES,
  GARANTIA_ESTADO_ES,
  etiqueta,
  opcionesDe,
} from './etiquetas-es';
import {
  EstadoPrototipoAtcService,
  type AlertaAdminConfig,
  type AlertaSlaItem,
  type AsientoLibroDetalle,
  type CasoEventoFestItem,
  type CasoResolucionMoraDetalle,
  type CasoSgdDetalle,
  type CorridaJobSla,
  type EncuestaCxItem,
  type EventoUrbeMindItem,
  type FlujoTipoConfig,
  type GuiaTipoConfig,
  type LlamadaUrbeMindItem,
  type PasoFlujoConfig,
  type PoliticaSlaConfig,
  type ReclamoGarantiaDetalle,
  type ReservaBusFestItem,
} from './estado-prototipo-atc';
import {
  PLAZO_LEGAL_DIAS_HABILES,
  evaluarPlazoLibro,
  huellaSimulada,
  normalizarMonto,
  siguienteCorrelativo,
  ticketsHuerfanos,
  validarAsiento,
  validarRespuesta,
  type AlertaLegalLibro,
  type ErroresAsiento,
  type ErroresRespuesta,
  type PlazoLibro,
} from './libro-reclamaciones';
import { IngresosHoyComponent } from './ingresos-hoy';
import { normalizarPlaca, placaValida } from './placa-vehicular';
import { ProtocoloFrasesComponent } from './protocolo-frases';
import { BarraFiltrosComponent } from './barra-filtros';
import { MantenimientoCatalogoComponent } from './mantenimiento-catalogo';
import { FiltroColumnasTablaDirective } from './filtro-columnas-tabla';
import { VacioFiltrosComponent } from './vacio-filtros';
import { crearFiltrosTabla, EstadoFiltrosTablas } from './filtros-tabla';
import { CeldaTicketComponent } from './celda-ticket';
import { EditorPasosFlujoComponent, type CambioPaso } from './editor-pasos-flujo';
import { TableroTorreComponent } from './graficos/tablero-torre';
import { ImpactoTigo } from './tigo/impacto-tigo';
import { PanelAprendizajeTigo } from './tigo/panel-aprendizaje-tigo';
import { PanelPoliticaTigo } from './tigo/panel-politica-tigo';
import { TigoEstadoService } from './tigo/tigo-estado';
import { FlujosTorreComponent } from './flujos-torre';
import { PasosFlujoComponent } from './pasos-flujo';
import { evaluarContextoMorosidad } from './contexto-morosidad';

export type SubvistaEspecializadaAtc =
  | 'morosidad'
  | 'ingreso'
  | 'buses'
  | 'libro'
  | 'garantias'
  | 'sgd'
  | 'reasignar'
  | 'alertas'
  | 'cierre'
  | 'politicas'
  | 'workflow'
  | 'urbemind'
  | 'torre'
  | 'evento';

/** Ingreso guardado en el celular porque no había conexión en la garita (HU-ATC-059 CA-03). */
/** Fila de la tabla del Libro: las claves son las de las columnas, para ordenar y filtrar. */
interface FilaLibro {
  readonly id: string;
  readonly asiento: string;
  readonly ticket: string;
  readonly kind: string;
  readonly cli: string;
  readonly plazo: Date;
  readonly respuesta: string;
  readonly detalle: AsientoLibroDetalle;
}

const ESTABLECIMIENTOS_LIBRO = [
  'Libro virtual · Mi Portal',
  'Sede Central San Isidro',
  'Oficina Carabayllo',
  'Caseta Villa Sol II',
] as const;

const APELACION_ESTADO_ES: Readonly<Record<string, string>> = {
  PENDING: 'Pendiente',
  UNDER_REVIEW: 'En revisión',
  RESOLVED_FOUNDED: 'Resuelta, fundada',
  RESOLVED_UNFOUNDED: 'Resuelta, infundada',
  WITHDRAWN: 'Retirada',
};

interface IngresoPendiente {
  readonly nombre: string;
  readonly dni: string;
  readonly telefono: string;
  readonly motivo: string;
  readonly lote: string;
  readonly proyecto: string;
  readonly placa?: string;
}

@Component({
  selector: 'app-vista-especializada',
  standalone: true,
  imports: [
    IngresosHoyComponent,
    ProtocoloFrasesComponent,
    BarraFiltrosComponent,
    MantenimientoCatalogoComponent,
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
    AyDropdownMenu,
    AyEmptyState,
    AyFileUpload,
    AyForm,
    AyFormField,
    AyFormGroup,
    AyGrid,
    AyIconButton,
    AyInput,
    AyList,
    AyListItem,
    AyModal,
    AyPageHeader,
    AyProgressBar,
    AyRow,
    AySelect,
    AySegmentedControl,
    AyStack,
    AyStatistic,
    AyTable,
    AyTabs,
    AyTextarea,
    AyText,
    CeldaTicketComponent,
    EditorPasosFlujoComponent,
    TableroTorreComponent,
    ImpactoTigo,
    PanelAprendizajeTigo,
    PanelPoliticaTigo,
    PasosFlujoComponent,
    FlujosTorreComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (avisoOperacion()) {
      <ay-alert
        tono="success"
        size="sm"
        [titulo]="avisoOperacion()!"
        [descartable]="true"
        (cerrar)="avisoOperacion.set(null)"
      />
    }

    <!-- ====================================================================== -->
    <!-- 1. WORKFLOW (ADMIN_FUNCIONAL, SUPERVISOR; COORDINADOR_CX solo lectura): FLUJOS, GUÍAS Y ALERTAS -->
    <!-- ====================================================================== -->
    @if (subvista() === 'workflow') {
      <!-- minmax(0,1fr): la pista no crece con las tablas anchas; ellas hacen scroll interno -->
      <div ayStack gap="6" style="grid-template-columns: minmax(0, 1fr)">
        <ay-page-header
          titulo="Mantenimiento"
          descripcion="Catálogo de tipos y subtipos de ticket, flujos por tipo y área, guías de solución versionadas y alertas"
          [conPestanas]="puedeVerWorkflow()">
          @if (puedeVerWorkflow()) {
            <ay-tabs
              ayPestanas
              etiqueta="Secciones de mantenimiento"
              variante="underline"
              [items]="tabsWorkflow()"
              [valor]="tabConfig()"
              (valorChange)="tabConfig.set($event)"
            />
          }
        </ay-page-header>

        @if (!puedeVerWorkflow()) {
          <ay-card superficie="solid">
            <ay-card-body padding="md">
              <ay-empty-state
                titulo="Acceso restringido (403)"
                descripcion="Necesitas el rol de Administrador Funcional para configurar los flujos y las guías."
              />
            </ay-card-body>
          </ay-card>
        } @else {
          @if (tabConfig() === 'tipos' || tabConfig() === 'subtipos') {
            <app-mantenimiento-catalogo
              [pestana]="tabConfig() === 'tipos' ? 'tipos' : 'subtipos'"
              [puedeEditar]="puedeEditarWorkflow()"
              [tickets]="tickets()"
            />
          }

          @if (tabConfig() === 'flujos') {
            <ay-segmented-control
              etiqueta="Vista de los flujos"
              size="sm"
              [opciones]="opcionesVistaFlujos"
              [valor]="vistaFlujos()"
              (valorChange)="elegirVistaFlujos($event)"
            />
          }

          @if (tabConfig() === 'flujos' && vistaFlujos() === 'area') {
            <app-flujos-torre
              [flujos]="estadoProto.flujosPorTipo()"
              [puedeEditar]="puedeEditarWorkflow()"
              (editar)="abrirEditorFlujo($event)"
            />
          }

          @if (tabConfig() === 'flujos' && vistaFlujos() === 'tabla') {
            <ay-card variante="elevated" superficie="solid">
              <ay-card-header
                titulo="Flujos por tipo de ticket"
                [subtitulo]="puedeEditarWorkflow()
                  ? 'Cada cambio publica una versión nueva (vN+1); los tickets abiertos conservan la suya.'
                  : 'Solo lectura. Los tickets abiertos conservan la versión con la que se crearon.'"
                nivel="h2"
                [separador]="true"
              />
              <ay-card-body padding="sm" gap="sm">
                <ay-table
                  leyenda="Flujos de atención por tipo de ticket"
                  [columnas]="columnasFlujosConfig"
                  [filas]="estadoProto.flujosPorTipo()"
                  [rayada]="true"
                >
                  <ng-template ayCelda="nombreTipo" let-fila>
                    @let f = comoFlujo(fila);
                    <div>
                      <strong>{{ estadoProto.etiquetaFlujo(f) }}</strong>
                      <span ayText="mono" size="xs"> ({{ f.tipo }})</span>
                    </div>
                  </ng-template>
                  <ng-template ayCelda="area" let-fila>
                    @let f = comoFlujo(fila);
                    <ay-badge size="sm" tono="neutral">{{ areaEs(f.area) }}</ay-badge>
                  </ng-template>
                  <ng-template ayCelda="versionActual" let-fila>
                    @let f = comoFlujo(fila);
                    <ay-badge size="sm" tono="info">v{{ f.versionActual }}</ay-badge>
                  </ng-template>
                  <ng-template ayCelda="pasos" let-fila>
                    @let f = comoFlujo(fila);
                    <app-pasos-flujo [pasos]="f.pasos" />
                  </ng-template>
                  <ng-template ayCelda="accion" let-fila>
                    @let f = comoFlujo(fila);
                    @if (puedeEditarWorkflow()) {
                      <div class="pl-atc-acciones-celda">
                        <ay-button tamano="sm" variante="secondary" (click)="abrirEditorFlujo(f)">
                          Editar
                        </ay-button>
                      </div>
                    }
                  </ng-template>
                </ay-table>
              </ay-card-body>
            </ay-card>
          }

          @if (puedeEditarWorkflow() && tabConfig() === 'guias') {
            <ay-card variante="elevated" superficie="solid">
              <ay-card-header
                titulo="Guías de solución"
                subtitulo="El gestor siempre ve la última versión publicada en el Detalle del Ticket y en el Asistente de IA."
                nivel="h2"
                [separador]="true"
              />
              <ay-card-body padding="sm" gap="sm">
                <ay-table
                  leyenda="Guías de solución por tipo de ticket"
                  [columnas]="columnasGuiasConfig"
                  [filas]="estadoProto.guiasPorTipo()"
                  [rayada]="true"
                >
                  <ng-template ayCelda="nombreTipo" let-fila>
                    @let g = comoGuia(fila);
                    <div>
                      <strong>{{ g.nombreTipo }}</strong>
                      <span ayText="mono" size="xs"> ({{ g.tipo }})</span>
                    </div>
                  </ng-template>
                  <ng-template ayCelda="versionActual" let-fila>
                    @let g = comoGuia(fila);
                    @if (g.versionActual !== null) {
                      <ay-badge size="sm" tono="success">v{{ g.versionActual }}</ay-badge>
                    } @else {
                      <ay-badge size="sm" tono="danger">Sin guía</ay-badge>
                    }
                  </ng-template>
                  <ng-template ayCelda="resumen" let-fila>
                    @let g = comoGuia(fila);
                    @if (g.versionActual !== null) {
                      <span ayText="body" size="xs">
                        {{ g.pasos.length }} pasos · {{ g.plantillas.length }} plantillas · {{ g.criterios.length }} criterios
                      </span>
                    } @else {
                      <span ayText="body" size="xs">Pendiente de publicar</span>
                    }
                  </ng-template>
                  <ng-template ayCelda="accion" let-fila>
                    @let g = comoGuia(fila);
                    <div class="pl-atc-acciones-celda">
                      <ay-button tamano="sm" variante="secondary" (click)="abrirEditorGuia(g)">
                        {{ g.versionActual !== null ? 'Nueva versión' : 'Crear la guía' }}
                      </ay-button>
                    </div>
                  </ng-template>
                </ay-table>
              </ay-card-body>
            </ay-card>
          }

          @if (puedeEditarWorkflow() && tabConfig() === 'propuestas-tigo') {
            <app-panel-aprendizaje-tigo />
          }

          @if (puedeEditarWorkflow() && tabConfig() === 'politica-tigo') {
            <app-panel-politica-tigo />
          }

          @if (puedeEditarWorkflow() && tabConfig() === 'alertas') {
            <ay-card variante="elevated" superficie="solid">
              <ay-card-header
                titulo="Alertas para el administrador"
                subtitulo="Se registran cuando un gestor abre un ticket sin guía o sin política SLA específica, o cuando un proyecto no tiene responsable."
                nivel="h2"
                [separador]="true"
              />
              <ay-card-body padding="sm">
                <ay-table
                  leyenda="Alertas de configuración"
                  [columnas]="columnasAlertasAdmin"
                  [filas]="estadoProto.alertasAdmin()"
                  [rayada]="true"
                >
                  <ng-template ayCelda="fecha" let-fila>
                    @let a = comoAlertaAdmin(fila);
                    <span ayText="mono" size="xs">{{ fmtHora(a.fecha) }}</span>
                  </ng-template>
                  <ng-template ayCelda="etiqueta" let-fila>
                    @let a = comoAlertaAdmin(fila);
                    <div ayStack gap="1">
                      <strong>{{ a.etiqueta }}</strong>
                    </div>
                  </ng-template>
                  <ng-template ayCelda="tipoTicket" let-fila>
                    @let a = comoAlertaAdmin(fila);
                    <span>{{ a.tipoTicket ?? '—' }}</span>
                  </ng-template>
                  <ng-template ayCelda="detalle" let-fila>
                    @let a = comoAlertaAdmin(fila);
                    <span ayText="body" size="xs">{{ a.detalle }}</span>
                  </ng-template>
                  <ay-empty-state
                    ayVacio
                    size="compact"
                    titulo="Sin alertas"
                    descripcion="Todos los tipos consultados tienen su guía y política."
                  />
                </ay-table>
              </ay-card-body>
            </ay-card>
          }
        }

        <!-- Modal Editar Flujo -->
        <ay-modal
          [abierto]="flujoEditando() !== null"
          (abiertoChange)="!$event && flujoEditando.set(null)"
          [titulo]="flujoEditando() ? 'Flujo · ' + estadoProto.etiquetaFlujo(flujoEditando()!) : 'Flujo'"
          size="lg"
        >
          @if (flujoEditando(); as fl) {
            <ay-form (enviar)="guardarFlujoConfig()">
              <div ayStack gap="3">
                <p ayText="body" size="xs">
                  Publicará la versión v{{ fl.versionActual + 1 }}. Los tickets que ya están abiertos conservan su versión; los nuevos en «Nuevo ticket» se asignarán a esta área y responsable.
                </p>
                <app-editor-pasos-flujo
                  [pasos]="editFlujoPasos()"
                  [area]="editFlujoArea()"
                  [opcionesAreas]="opcionesAreasSelect"
                  [opcionesResponsables]="opcionesResponsablesSelect"
                  (areaChange)="editFlujoArea.set($event)"
                  (pasoChange)="cambiarPasoFlujo($event)"
                  (agregar)="agregarPasoFlujo()"
                  (quitar)="quitarPasoFlujo($event)"
                />
                <div ayRow gap="2" justificar="end">
                  <ay-button variante="ghost" (click)="flujoEditando.set(null)">Cancelar</ay-button>
                  <ay-button tipo="submit" variante="primary">
                    Publicar versión v{{ fl.versionActual + 1 }}
                  </ay-button>
                </div>
              </div>
            </ay-form>
          }
        </ay-modal>

        <!-- Modal Editar Guía -->
        <ay-modal
          [abierto]="guiaEditando() !== null"
          (abiertoChange)="!$event && guiaEditando.set(null)"
          [titulo]="guiaEditando() ? 'Guía de solución · ' + guiaEditando()!.nombreTipo : 'Guía'"
        >
          @if (guiaEditando(); as gu) {
            <ay-form (enviar)="guardarGuiaConfig()">
              <div ayStack gap="3">
                <p ayText="body" size="xs">
                  Publicará la versión v{{ (gu.versionActual ?? 0) + 1 }}. Los gestores verán esta versión de inmediato al abrir un ticket de «{{ gu.nombreTipo }}».
                </p>
                <ay-form-field etiqueta="Pasos (uno por línea)" obligatorio>
                  <ay-textarea nombre="edit-guia-pasos-txt"
                    [filas]="4"
                    [valor]="editGuiaPasosTxt()"
                    (valorChange)="editGuiaPasosTxt.set($event)"
                  />
                </ay-form-field>
                <ay-form-field etiqueta="Plantillas de respuesta (una por línea; puedes usar {resumen})">
                  <ay-textarea nombre="edit-guia-plantillas-txt"
                    [filas]="3"
                    [valor]="editGuiaPlantillasTxt()"
                    (valorChange)="editGuiaPlantillasTxt.set($event)"
                  />
                </ay-form-field>
                <ay-form-field etiqueta="Criterios de cierre (uno por línea)" obligatorio>
                  <ay-textarea nombre="edit-guia-criterios-txt"
                    [filas]="3"
                    [valor]="editGuiaCriteriosTxt()"
                    (valorChange)="editGuiaCriteriosTxt.set($event)"
                  />
                </ay-form-field>
                <div ayRow gap="2" justificar="end">
                  <ay-button variante="ghost" (click)="guiaEditando.set(null)">Cancelar</ay-button>
                  <ay-button tipo="submit" variante="primary">
                    Publicar versión v{{ (gu.versionActual ?? 0) + 1 }}
                  </ay-button>
                </div>
              </div>
            </ay-form>
          }
        </ay-modal>
      </div>
    }

    <!-- ====================================================================== -->
    <!-- 2. POLÍTICAS SLA (SUPERVISOR)                                          -->
    <!-- ====================================================================== -->
    @if (subvista() === 'politicas') {
      <div ayStack gap="6">
        <ay-page-header
          titulo="Políticas SLA"
          descripcion="En horas hábiles. Precedencia: específica (tipo + prioridad) sobre genérica por tipo, y esta sobre la genérica global. Editar una política crea una versión nueva sin tocar los tickets abiertos."
        />

        @if (estadoProto.rolActivo() !== 'SUPERVISOR' && estadoProto.rolActivo() !== 'ADMIN_FUNCIONAL' && !estadoProto.esSuperadmin()) {
          <ay-card superficie="solid">
            <ay-card-body padding="md">
              <ay-empty-state
                titulo="Acceso restringido (403)"
                descripcion="Necesitas el rol de Supervisor ATC para configurar las políticas de SLA."
              />
            </ay-card-body>
          </ay-card>
        } @else {
          <ay-card variante="elevated" superficie="solid">
            <ay-card-header titulo="Matriz de políticas" nivel="h2" [separador]="true" />
            <ay-card-body padding="sm" gap="sm">
              <ay-table
                leyenda="Políticas de SLA en horas hábiles"
                [columnas]="columnasPoliticasSla"
                [filas]="estadoProto.politicasSla()"
                [rayada]="true"
              >
                <ng-template ayCelda="id" let-fila>
                  @let p = comoPolitica(fila);
                  <strong ayText="mono" size="xs">{{ p.id }}</strong>
                </ng-template>
                <ng-template ayCelda="alcance" let-fila>
                  @let p = comoPolitica(fila);
                  <span>
                    {{
                      p.alcance === 'especifica'
                        ? 'Específica (tipo + prioridad)'
                        : p.alcance === 'generica'
                          ? 'Genérica por tipo'
                          : 'Genérica global'
                    }}
                  </span>
                </ng-template>
                <ng-template ayCelda="tipo" let-fila>
                  @let p = comoPolitica(fila);
                  <span>{{ p.tipo ?? 'Todos' }} · {{ p.prioridad ? nombrePrioridad(p.prioridad) : 'Todas' }}</span>
                </ng-template>
                <ng-template ayCelda="respuestaH" let-fila>
                  @let p = comoPolitica(fila);
                  <strong>{{ p.respuestaH }} h</strong>
                </ng-template>
                <ng-template ayCelda="resolucionH" let-fila>
                  @let p = comoPolitica(fila);
                  <strong>{{ p.resolucionH }} h</strong>
                </ng-template>
                <ng-template ayCelda="version" let-fila>
                  @let p = comoPolitica(fila);
                  <ay-badge size="sm" tono="info">v{{ p.version }}</ay-badge>
                </ng-template>
                <ng-template ayCelda="accion" let-fila>
                  @let p = comoPolitica(fila);
                  <div class="pl-atc-acciones-celda">
                    <ay-button tamano="sm" variante="secondary" (click)="abrirEditorPolitica(p)">
                      Editar
                    </ay-button>
                  </div>
                </ng-template>
              </ay-table>
            </ay-card-body>
          </ay-card>
        }

        <ay-modal
          [abierto]="politicaEditando() !== null"
          (abiertoChange)="!$event && politicaEditando.set(null)"
          [titulo]="politicaEditando() ? 'Editar ' + politicaEditando()!.id : 'Editar política'"
        >
          @if (politicaEditando(); as pol) {
            <ay-form (enviar)="guardarPoliticaSla()">
              <div ayStack gap="3">
                <p ayText="body" size="xs">
                  Publicará la versión v{{ pol.version + 1 }}. Los tickets nuevos en «Nuevo ticket» congelarán estos nuevos plazos.
                </p>
                <ay-form-field etiqueta="1.ª respuesta (horas hábiles)" obligatorio>
                  <ay-input nombre="edit-pol-respuesta-h"
                    tipo="number"
                    [valor]="editPolRespuestaH()"
                    (valorChange)="editPolRespuestaH.set($event)"
                  />
                </ay-form-field>
                <ay-form-field etiqueta="Resolución (horas hábiles)" obligatorio>
                  <ay-input nombre="edit-pol-resolucion-h"
                    tipo="number"
                    [valor]="editPolResolucionH()"
                    (valorChange)="editPolResolucionH.set($event)"
                  />
                </ay-form-field>
                <div ayRow gap="2" justificar="end">
                  <ay-button variante="ghost" (click)="politicaEditando.set(null)">Cancelar</ay-button>
                  <ay-button tipo="submit" variante="primary">
                    Guardar v{{ pol.version + 1 }}
                  </ay-button>
                </div>
              </div>
            </ay-form>
          }
        </ay-modal>
      </div>
    }

    <!-- ====================================================================== -->
    <!-- 3. REASIGNAR EN BLOQUE (SUPERVISOR)                                    -->
    <!-- ====================================================================== -->
    @if (subvista() === 'reasignar') {
      <div ayStack gap="6">
        <ay-page-header
          titulo="Reasignar en bloque"
          descripcion="Pasa los tickets abiertos de un colaborador a otro o repártelos por carga. El SLA no se reinicia."
        />

        @if (estadoProto.rolActivo() !== 'SUPERVISOR' && !estadoProto.esSuperadmin()) {
          <ay-card superficie="solid">
            <ay-card-body padding="md">
              <ay-empty-state
                titulo="Acceso restringido (403)"
                descripcion="Necesitas el rol de Supervisor ATC para reasignar tickets en bloque."
              />
            </ay-card-body>
          </ay-card>
        } @else {
          <div ayGrid [columnas]="2" gap="md">
            <ay-card variante="elevated" superficie="solid">
              <ay-card-header titulo="Configurar reasignación" nivel="h2" [separador]="true" />
              <ay-card-body padding="md" gap="md">
                <ay-form class="pl-atc-form-ancho" (enviar)="ejecutarReasignacionEnBloque()">
                  <div ayStack gap="4" class="pl-atc-fila-campos">
                    <ay-form-field etiqueta="Colaborador que deja los tickets" obligatorio>
                      <ay-select nombre="reasignar-de"
                        [opciones]="opcionesOrigenReasignar()"
                        [valor]="reasignarDe()"
                        (valorChange)="reasignarDe.set($event)"
                      />
                    </ay-form-field>
                    <ay-form-field etiqueta="Motivo" obligatorio>
                      <ay-select nombre="reasignar-motivo"
                        [opciones]="opcionesMotivoReasignar"
                        [valor]="reasignarMotivo()"
                        (valorChange)="reasignarMotivo.set($event)"
                      />
                    </ay-form-field>
                    <ay-form-field etiqueta="A quién pasan (menor carga en el área)" obligatorio>
                      <ay-select nombre="reasignar-a"
                        [opciones]="opcionesDestinoReasignar"
                        [valor]="reasignarA()"
                        (valorChange)="reasignarA.set($event)"
                      />
                    </ay-form-field>
                    <ay-form-field etiqueta="Nota de auditoría (opcional)">
                      <ay-textarea nombre="reasignar-nota"
                        [filas]="2"
                        [valor]="reasignarNota()"
                        (valorChange)="reasignarNota.set($event)"
                      />
                    </ay-form-field>
                    <div ayRow gap="2" justificar="end">
                      <ay-button
                        tipo="submit"
                        variante="primary"
                        [disabled]="ticketsDeColaboradorSaliente().length === 0"
                      >
                        Reasignar {{ ticketsDeColaboradorSaliente().length }} ticket(s)
                      </ay-button>
                    </div>
                  </div>
                </ay-form>
              </ay-card-body>
            </ay-card>

            <ay-card superficie="solid">
              <ay-card-header
                titulo="Tickets que saldrán del colaborador"
                subtitulo="Conservan su vencimiento SLA original y registran fila append-only en Derivaciones."
                nivel="h2"
                [separador]="true"
              />
              <ay-card-body padding="sm">
                <ay-table
                  leyenda="Tickets pendientes por transferir"
                  [columnas]="columnasPreviewReasignar"
                  [filas]="ticketsDeColaboradorSaliente()"
                  [rayada]="true"
                >
                  <ng-template ayCelda="num" let-fila>
                    @let t = comoTicket(fila);
                    <strong ayText="mono" size="xs">{{ t.num }}</strong>
                  </ng-template>
                  <ng-template ayCelda="summary" let-fila>
                    @let t = comoTicket(fila);
                    <span ayText="body" size="xs">{{ t.summary }}</span>
                  </ng-template>
                  <ng-template ayCelda="destino" let-fila>
                    <ay-badge size="sm" tono="info">{{ reasignarA() }}</ay-badge>
                  </ng-template>
                  <ay-empty-state
                    ayVacio
                    size="compact"
                    titulo="Sin tickets abiertos"
                    descripcion="El colaborador seleccionado no tiene tickets pendientes."
                  />
                </ay-table>
              </ay-card-body>
            </ay-card>
          </div>
        }
      </div>
    }

    <!-- ====================================================================== -->
    <!-- 4. ALERTAS SLA (SUPERVISOR / COORDINADOR_CX)                           -->
    <!-- ====================================================================== -->
    @if (subvista() === 'alertas') {
      <div ayStack gap="6">
        <ay-page-header
          titulo="Alertas SLA"
          descripcion="El job revisa los tickets abiertos cada 15 minutos y registra una sola alerta por tipo de incumplimiento y por ciclo."
        >
          <ay-button ayAcciones tamano="sm" variante="secondary" (click)="correrJobSlaAhora()">
            Ejecutar el job ahora
          </ay-button>
        </ay-page-header>

        <div ayGrid [columnas]="4" gap="sm">
          <ay-card superficie="solid">
            <ay-card-body padding="sm">
              <ay-statistic
                etiqueta="Total de alertas"
                [valor]="estadoProto.alertasSla().length"
                size="sm"
              />
            </ay-card-body>
          </ay-card>
          <ay-card superficie="solid">
            <ay-card-body padding="sm">
              <ay-statistic
                etiqueta="1.ª respuesta por vencer (≤ 25 %)"
                [valor]="contarAlertasSla('FIRST_RESPONSE_AT_RISK')"
                size="sm"
              />
            </ay-card-body>
          </ay-card>
          <ay-card superficie="solid">
            <ay-card-body padding="sm">
              <ay-statistic
                etiqueta="1.ª respuesta vencida"
                [valor]="contarAlertasSla('FIRST_RESPONSE_BREACHED')"
                size="sm"
              />
            </ay-card-body>
          </ay-card>
          <ay-card superficie="solid">
            <ay-card-body padding="sm">
              <ay-statistic
                etiqueta="Resolución vencida"
                [valor]="contarAlertasSla('RESOLUTION_BREACHED')"
                size="sm"
              />
            </ay-card-body>
          </ay-card>
        </div>

        <ay-card variante="elevated" superficie="solid">
          <ay-card-header titulo="Alertas emitidas por ciclo" nivel="h2" [separador]="true" />
          <ay-card-body padding="sm">
            <ay-table
              leyenda="Alertas de SLA"
              [columnas]="columnasAlertasSla"
              [filas]="estadoProto.alertasSla()"
              [rayada]="true"
            >
              <ng-template ayCelda="ticketNum" let-fila>
                @let a = comoAlertaSla(fila);
                <ay-button
                  tamano="sm"
                  variante="secondary"
                  [disabled]="!a.ticketNum"
                  (click)="a.ticketNum && seleccionarTicket.emit(a.ticketNum)"
                >
                  {{ a.ticketNum || 'Sin ticket' }}
                </ay-button>
              </ng-template>
              <ng-template ayCelda="tipo" let-fila>
                @let a = comoAlertaSla(fila);
                <div ayStack gap="1">
                  <strong>{{ nombreAlertaSla(a.tipo) }}</strong>
                </div>
              </ng-template>
              <ng-template ayCelda="ciclo" let-fila>
                @let a = comoAlertaSla(fila);
                <span>{{ a.ciclo === 0 ? 'Original' : 'Reapertura ' + a.ciclo }}</span>
              </ng-template>
              <ng-template ayCelda="vencimientoEvaluado" let-fila>
                @let a = comoAlertaSla(fila);
                <span ayText="mono" size="xs">{{ fmtHora(a.vencimientoEvaluado) }}</span>
              </ng-template>
              <ng-template ayCelda="destinatario" let-fila>
                @let a = comoAlertaSla(fila);
                <span>{{ a.destinatario }} ({{ a.canal }})</span>
              </ng-template>
            </ay-table>
          </ay-card-body>
        </ay-card>

        <ay-card superficie="solid">
          <ay-card-header
            titulo="Últimas corridas del job"
            subtitulo="Una alerta ya registrada no se duplica aunque el job vuelva a correr."
            nivel="h2"
            [separador]="true"
          />
          <ay-card-body padding="sm">
            <ay-table
              leyenda="Corridas del job de alertas"
              [columnas]="columnasCorridasJob"
              [filas]="estadoProto.corridasJobSla()"
              [rayada]="true"
            >
              <ng-template ayCelda="fecha" let-fila>
                @let c = comoCorridaJob(fila);
                <span ayText="mono" size="xs">{{ fmtHora(c.fecha) }}</span>
              </ng-template>
              <ng-template ayCelda="revisados" let-fila>
                @let c = comoCorridaJob(fila);
                <span>{{ c.revisados }} tickets abiertos</span>
              </ng-template>
              <ng-template ayCelda="nuevasAlertas" let-fila>
                @let c = comoCorridaJob(fila);
                <ay-badge size="sm" [tono]="c.nuevasAlertas > 0 ? 'warning' : 'success'">
                  {{ c.nuevasAlertas }} nuevas
                </ay-badge>
              </ng-template>
            </ay-table>
          </ay-card-body>
        </ay-card>
      </div>
    }

    <!-- ====================================================================== -->
    <!-- 5. CIERRE END-TO-END 72 H (COORDINADOR_CX / SUPERVISOR)                -->
    <!-- ====================================================================== -->
    @if (subvista() === 'cierre') {
      <div ayStack gap="6">
        <ay-page-header
          titulo="Cierre end-to-end"
          descripcion="Meta: cerrar el ticket dentro de 72 horas hábiles desde la apertura. Si pasó a Eje 3, se mide contra el plazo del eje (90 h)."
        />

        <div ayGrid [columnas]="4" gap="sm">
          <ay-card superficie="solid">
            <ay-card-body padding="sm">
              <ay-statistic
                etiqueta="En plazo (< 80 %)"
                [valor]="filasCierreE2E().filter(x => x.tono === 'brand' || x.tono === 'success').length"
                size="sm"
              />
            </ay-card-body>
          </ay-card>
          <ay-card superficie="solid">
            <ay-card-body padding="sm">
              <ay-statistic
                etiqueta="Por vencer (≥ 80 %)"
                [valor]="filasCierreE2E().filter(x => x.tono === 'warning').length"
                size="sm"
              />
            </ay-card-body>
          </ay-card>
          <ay-card superficie="solid">
            <ay-card-body padding="sm">
              <ay-statistic
                etiqueta="Fuera de plazo (> 100 %)"
                [valor]="filasCierreE2E().filter(x => x.tono === 'danger').length"
                size="sm"
              />
            </ay-card-body>
          </ay-card>
          <ay-card superficie="solid">
            <ay-card-body padding="sm">
              <ay-statistic
                etiqueta="Escalados a Eje 3 (plazo 90 h)"
                [valor]="filasCierreE2E().filter(x => x.ticket.eje === 3).length"
                size="sm"
              />
            </ay-card-body>
          </ay-card>
        </div>

        <ay-card variante="elevated" superficie="solid">
          <ay-card-body padding="sm" gap="sm">
            <app-barra-filtros [filtros]="filtrosCierre" [conFiltroEmpresa]="true" />

            <ay-table
              leyenda="Seguimiento del cierre end-to-end"
              [columnas]="columnasCierreE2E"
              [filas]="filtrosCierre.filtradas()"
              [filtrosTabla]="filtrosCierre"
              [rayada]="true"
            >
              <ng-template ayCelda="num" let-fila>
                @let r = comoFilaCierre(fila);
                <app-celda-ticket [ticket]="r.ticket" (abrir)="seleccionarTicket.emit($event)" />
              </ng-template>
              <ng-template ayCelda="eje" let-fila>
                @let r = comoFilaCierre(fila);
                <ay-badge size="sm" [tono]="r.ticket.eje === 3 ? 'danger' : 'neutral'">
                  Eje {{ r.ticket.eje }} ({{ r.limite }} h)
                </ay-badge>
              </ng-template>
              <ng-template ayCelda="pct" let-fila>
                @let r = comoFilaCierre(fila);
                <ay-progress-bar
                  size="sm"
                  [valor]="r.pct"
                  [tono]="r.tono === 'warning' ? 'brand' : r.tono"
                  [etiqueta]="r.horas + ' de ' + r.limite + ' h hábiles'"
                />
              </ng-template>
              <ng-template ayCelda="etiqueta" let-fila>
                @let r = comoFilaCierre(fila);
                <ay-badge size="sm" [tono]="r.tono === 'brand' ? 'info' : r.tono">
                  {{ r.etiqueta }}
                </ay-badge>
              </ng-template>
              <app-vacio-filtros ayVacio [filtros]="filtrosCierre" elemento="ticket" />
            </ay-table>
          </ay-card-body>
        </ay-card>
      </div>
    }

    <!-- ====================================================================== -->
    <!-- 6. INTEGRACIÓN URBEMIND (API Y EVENTOS)                                -->
    <!-- ====================================================================== -->
    @if (subvista() === 'urbemind') {
      <div ayStack gap="6">
        <ay-page-header
          titulo="Integración UrbeMind"
          descripcion="Contrato bidireccional: UrbeMind consulta, registra e interactúa por API con alcance acotado, y recibe los eventos del ciclo de vida."
        
          [conPestanas]="true">
          <ay-tabs
            ayPestanas
            etiqueta="Secciones de UrbeMind"
            variante="underline"
            [items]="tabsUrbeMind()"
            [valor]="tabUrbeMind()"
            (valorChange)="tabUrbeMind.set($event)"
          />
        </ay-page-header>

        @if (tabUrbeMind() === 'api') {
          <div ayGrid [columnas]="2" gap="md">
            <ay-card variante="elevated" superficie="solid">
              <ay-card-header
                titulo="Probar una llamada de UrbeMind"
                subtitulo="Simula las llamadas que hace UrbeMind con su token de servicio."
                nivel="h2"
                [separador]="true"
              />
              <ay-card-body padding="md" gap="md">
                <ay-form (enviar)="ejecutarSimulacionUrbeMind()">
                  <div ayStack gap="3">
                    <ay-form-field etiqueta="Operación API" obligatorio>
                      <ay-select nombre="um-operacion"
                        [opciones]="opcionesOperacionUrbeMind"
                        [valor]="umOperacion()"
                        (valorChange)="umOperacion.set($event)"
                      />
                    </ay-form-field>
                    <ay-form-field etiqueta="Alcance del token OAuth2" obligatorio>
                      <ay-select nombre="um-alcance"
                        [opciones]="opcionesAlcanceUrbeMind"
                        [valor]="umAlcance()"
                        (valorChange)="umAlcance.set($event)"
                      />
                    </ay-form-field>
                    <div ayRow gap="2" justificar="end">
                      <ay-button tipo="submit" variante="primary">Ejecutar llamada</ay-button>
                    </div>
                  </div>
                </ay-form>
              </ay-card-body>
            </ay-card>

            <ay-card superficie="solid">
              <ay-card-header titulo="Registro de llamadas API" nivel="h2" [separador]="true" />
              <ay-card-body padding="sm">
                <ay-table
                  leyenda="Llamadas recibidas desde UrbeMind"
                  [columnas]="columnasLlamadasUrbeMind"
                  [filas]="estadoProto.llamadasUrbeMind()"
                  [rayada]="true"
                >
                  <ng-template ayCelda="operacion" let-fila>
                    @let l = comoLlamadaUm(fila);
                    <div ayStack gap="1">
                      <strong ayText="mono" size="xs">{{ l.operacion }}</strong>
                      <span ayText="body" size="xs">{{ l.detalle }}</span>
                    </div>
                  </ng-template>
                  <ng-template ayCelda="estadoHttp" let-fila>
                    @let l = comoLlamadaUm(fila);
                    <ay-badge size="sm" [tono]="l.estadoHttp < 300 ? 'success' : 'danger'">
                      HTTP {{ l.estadoHttp }}
                    </ay-badge>
                  </ng-template>
                </ay-table>
              </ay-card-body>
            </ay-card>
          </div>
        } @else {
          <ay-card variante="elevated" superficie="solid">
            <ay-card-header
              titulo="Eventos salientes hacia UrbeMind"
              subtitulo="ticket.created, ticket.InteractionAdded, ticket.statusChanged, ticket.assigned y ticket.closed."
              nivel="h2"
              [separador]="true"
            >
              <div ayAcciones ayRow gap="2">
                <ay-checkbox
                  [marcado]="estadoProto.forzarFalloEventoUrbeMind()"
                  (marcadoChange)="estadoProto.forzarFalloEventoUrbeMind.set($event)"
                >
                  Forzar fallo 503 en el próximo evento
                </ay-checkbox>
                <ay-button tamano="sm" variante="secondary" (click)="reintentarWebhooksUrbeMind()">
                  Reintentar pendientes
                </ay-button>
              </div>
            </ay-card-header>
            <ay-card-body padding="sm">
              <ay-table
                leyenda="Eventos enviados a UrbeMind"
                [columnas]="columnasEventosUrbeMind"
                [filas]="estadoProto.eventosUrbeMind()"
                [rayada]="true"
              >
                <ng-template ayCelda="tipo" let-fila>
                  @let e = comoEventoUm(fila);
                  <code ayText="mono" size="xs">{{ etiqueta(eventoUmEs, e.tipo) }}</code>
                </ng-template>
                <ng-template ayCelda="ticketNum" let-fila>
                  @let e = comoEventoUm(fila);
                  <strong ayText="mono" size="xs">{{ e.ticketNum }}</strong>
                </ng-template>
                <ng-template ayCelda="estado" let-fila>
                  @let e = comoEventoUm(fila);
                  <ay-badge size="sm" [tono]="e.estado === 'ENTREGADO' ? 'success' : 'warning'">
                    {{ e.estado === 'ENTREGADO' ? 'Entregado' : 'Pendiente de reintento' }} ({{ e.intentos }} int.)
                  </ay-badge>
                </ng-template>
                <ng-template ayCelda="error" let-fila>
                  @let e = comoEventoUm(fila);
                  <span ayText="body" size="xs">{{ e.error ?? 'ACK 200 OK recibido' }}</span>
                </ng-template>
              </ay-table>
            </ay-card-body>
          </ay-card>
        }
      </div>
    }

    <!-- ====================================================================== -->
    <!-- 7. RESOLUCIÓN POR MOROSIDAD (CASOS Y DETALLE DE CASO)                  -->
    <!-- ====================================================================== -->
    @if (subvista() === 'morosidad') {
      <div ayStack gap="6">
        <ay-page-header
          titulo="Resolución por morosidad"
          descripcion="Contexto de mora para el asesor responsable del ticket: cuotas vencidas, alerta al cliente y carta al responsable del proyecto. Solo consulta."
        />

        <ay-alert tono="warning" size="sm" titulo="Regla pendiente de validación contractual">
          La condición de posible disolución contractual se evalúa como «más de tres cuotas» (más de 3 cuotas
          vencidas) y está pendiente de validación por negocio. Esta vista solo informa: no disuelve contratos
          ni toma decisiones contractuales. El flujo de negociación entre el cliente e Iver es una dependencia
          pendiente.
        </ay-alert>

        <div ayGrid [columnas]="4" gap="sm">
          <ay-card superficie="solid">
            <ay-card-body padding="sm">
              <ay-statistic
                etiqueta="En resolución"
                [valor]="contarMorosidadEstado('ABIERTO')"
                size="sm"
              />
            </ay-card-body>
          </ay-card>
          <ay-card superficie="solid">
            <ay-card-body padding="sm">
              <ay-statistic
                etiqueta="Suspendidos por reclamo"
                [valor]="contarMorosidadEstado('SUSPENDIDO')"
                size="sm"
              />
            </ay-card-body>
          </ay-card>
          <ay-card superficie="solid">
            <ay-card-body padding="sm">
              <ay-statistic
                etiqueta="Regularizados"
                [valor]="contarMorosidadEstado('REGULARIZADO')"
                size="sm"
              />
            </ay-card-body>
          </ay-card>
          <ay-card superficie="solid">
            <ay-card-body padding="sm">
              <ay-statistic
                etiqueta="Cartas sin acción"
                [valor]="estadoProto.casosResolucionMora().filter(c => !c.carta.accion && c.estado === 'ABIERTO').length"
                size="sm"
              />
            </ay-card-body>
          </ay-card>
        </div>

        <ay-card variante="elevated" superficie="solid">
          <ay-card-header titulo="Casos de resolución de contrato" nivel="h2" [separador]="true" />
          <ay-card-body padding="sm">
            <ay-table
              leyenda="Casos de resolución de contrato por 3 cuotas impagas"
              [columnas]="columnasMorosidad5181"
              [filas]="estadoProto.casosResolucionMora()"
              [rayada]="true"
            >
              <ng-template ayCelda="ticketNum" let-fila>
                @let m = comoMoraDetalle(fila);
                <strong ayText="mono" size="xs">{{ m.ticketNum }}</strong>
              </ng-template>
              <ng-template ayCelda="clienteNombre" let-fila>
                @let m = comoMoraDetalle(fila);
                <div ayStack gap="1">
                  <strong>{{ m.clienteNombre }}</strong>
                  <span ayText="body" size="xs">{{ m.proyecto }} · {{ m.lote }}</span>
                </div>
              </ng-template>
              <ng-template ayCelda="deuda" let-fila>
                @let m = comoMoraDetalle(fila);
                <span>S/ {{ m.deuda }} · {{ m.cuotasImpagas }} cuotas</span>
              </ng-template>
              <ng-template ayCelda="estado" let-fila>
                @let m = comoMoraDetalle(fila);
                <ay-badge
                  size="sm"
                  [tono]="m.estado === 'ABIERTO' ? 'danger' : m.estado === 'SUSPENDIDO' ? 'warning' : 'success'"
                >
                  {{
                    m.estado === 'ABIERTO'
                      ? 'En resolución'
                      : m.estado === 'SUSPENDIDO'
                        ? 'Suspendido por reclamo'
                        : 'Regularizado'
                  }}
                </ay-badge>
              </ng-template>
              <ng-template ayCelda="carta" let-fila>
                @let m = comoMoraDetalle(fila);
                @if (m.carta.escalada) {
                  <ay-badge size="sm" tono="danger">Escalada al supervisor</ay-badge>
                } @else if (m.carta.accion) {
                  <ay-badge size="sm" tono="success">Con acción: {{ m.carta.accion.nota }}</ay-badge>
                } @else {
                  <ay-badge size="sm" tono="warning">Sin acción · vence {{ fmtHora(m.carta.vence) }}</ay-badge>
                }
              </ng-template>
              <ng-template ayCelda="accion" let-fila>
                @let m = comoMoraDetalle(fila);
                <div class="pl-atc-acciones-celda">
                  <ay-button tamano="sm" variante="secondary" (click)="moraSeleccionada.set(m)">
                    Abrir caso
                  </ay-button>
                  <ay-button
                    tamano="sm"
                    variante="secondary"
                    [disabled]="!m.contrato"
                    [attr.title]="m.contrato ? 'Ver contrato ' + m.contrato : 'Sin contrato vinculado'"
                    (click)="m.contrato && verContrato.emit(m.contrato)"
                  >
                    Contrato
                  </ay-button>
                </div>
              </ng-template>
            </ay-table>
          </ay-card-body>
        </ay-card>

        @if (moraSeleccionada(); as mc) {
          <ay-card variante="elevated" superficie="solid">
            <ay-card-header
              [titulo]="'Expediente de Resolución · ' + mc.clienteNombre + ' (' + mc.ticketNum + ')'"
              [subtitulo]="mc.carta.texto"
              nivel="h2"
              [separador]="true"
            >
              <div ayAcciones ayRow gap="2">
                @if (mc.estado !== 'REGULARIZADO') {
                  <ay-button tamano="sm" variante="secondary" (click)="registrarAccionResponsableMora(mc)">
                    Registrar mi acción
                  </ay-button>
                  <ay-button tamano="sm" variante="primary" (click)="registrarPagoRegularizacionMora(mc)">
                    Registrar pago de la deuda
                  </ay-button>
                }
              </div>
            </ay-card-header>
            <ay-card-body padding="md" gap="md">
              @if (mc.estado === 'SUSPENDIDO') {
                <ay-alert tono="warning" size="sm" titulo="Suspendido por reclamo abierto en el Libro">
                  El cliente tiene un reclamo abierto en el Libro: no se envían alertas de corte ni cartas hasta responderlo.
                </ay-alert>
              }
              @let ctx = contextoMora(mc);
              <ay-card superficie="solid">
                <ay-card-header
                  titulo="Contexto de mora del ticket (regla pendiente de validación)"
                  nivel="h3"
                  [separador]="true"
                />
                <ay-card-body padding="sm">
                  <ay-card-pairs
                    [pares]="[
                      { clave: 'Ticket', valor: mc.ticketNum },
                      { clave: 'Cliente · contrato', valor: mc.clienteNombre + ' · ' + mc.contrato },
                      { clave: 'Cuotas vencidas', valor: '' + ctx.cuotasVencidas },
                      { clave: 'Deuda vencida', valor: 'S/ ' + mc.deuda },
                      { clave: 'Condición «más de tres cuotas»', valor: ctx.superaCondicion ? 'Cumple (indicativo)' : 'No cumple (indicativo)' },
                      { clave: 'Lectura', valor: ctx.lectura },
                      { clave: 'Etapa de negociación cliente-Iver', valor: ctx.etapaNegociacion }
                    ]"
                  />
                </ay-card-body>
              </ay-card>
              <div ayGrid [columnas]="2" gap="md">
                <ay-card superficie="solid">
                  <ay-card-header titulo="Constancias de envío de alerta al cliente" nivel="h3" [separador]="true" />
                  <ay-card-body padding="sm">
                    <ay-list
                      etiqueta="Constancias de alerta"
                      [ordenada]="false"
                      [separadores]="true"
                      [elementos]="mc.constancias.map(c => c.canal + ' · ' + c.resultado + ' (' + fmtHora(c.fecha) + ')')"
                    >
                      <ng-template #elemento let-item>
                        <ay-list-item [titulo]="item" />
                      </ng-template>
                    </ay-list>
                  </ay-card-body>
                </ay-card>
                <ay-card superficie="solid">
                  <ay-card-header titulo="Carta de alerta al proyecto" nivel="h3" [separador]="true" />
                  <ay-card-body padding="sm">
                    <ay-card-pairs
                      [pares]="[
                        { clave: 'Para', valor: mc.carta.para },
                        { clave: 'Con copia (CC)', valor: mc.carta.cc },
                        { clave: 'Acción registrada', valor: mc.carta.accion ? mc.carta.accion.nota + ' (' + mc.carta.accion.autor + ')' : 'Pendiente' }
                      ]"
                    />
                  </ay-card-body>
                </ay-card>
              </div>
            </ay-card-body>
          </ay-card>
        }
      </div>
    }

    <!-- ====================================================================== -->
    <!-- 8. INGRESO A PROYECTO (CONTROL_ACCESO / SUPERVISOR)                    -->
    <!-- ====================================================================== -->
    @if (subvista() === 'ingreso') {
      <div ayStack gap="6">
        <ay-page-header
          titulo="Ingreso a proyecto"
          descripcion="Registra a cada persona que ingresa al proyecto. Cada ingreso crea un ticket «Ingreso a proyecto» y se avisa al responsable del proyecto."
        />

        @if (!estadoProto.puedeRegistrarIngreso()) {
          <ay-card superficie="solid">
            <ay-card-body padding="md">
              <ay-empty-state
                titulo="Acceso restringido (403)"
                descripcion="Necesitas el rol de Control de Acceso para registrar ingresos a proyecto."
              />
            </ay-card-body>
          </ay-card>
        } @else {
          @if (!enLinea()) {
            <ay-alert tono="warning" titulo="Sin conexión en la garita">
              Los ingresos se guardan en el celular y se envían solos al recuperar la conexión.
            </ay-alert>
          }
          @if (ingresosPendientes().length > 0) {
            <ay-alert tono="info" [titulo]="ingresosPendientes().length + ' ' + (ingresosPendientes().length === 1 ? 'ingreso guardado' : 'ingresos guardados') + ' en el celular'">
              Pendientes de envío: {{ nombresPendientes() }}.
            </ay-alert>
          }
          <div ayGrid [columnas]="2" gap="md" class="pl-atc-apilar">
            <ay-card variante="elevated" superficie="solid">
              <ay-card-header
                titulo="Formulario de control de acceso (6 campos y la placa, opcional)"
                subtitulo="Si el DNI es de un cliente, el ticket se vincula a su ficha y a su lote; si no, queda sin vincular."
                nivel="h2"
                [separador]="true"
              />
              <ay-card-body padding="md" gap="md">
                <ay-form-field
                  etiqueta="Proyecto de la garita"
                  ayuda="Se elige una vez: el responsable de cada proyecto recibe sus ingresos."
                >
                  <ay-select nombre="nuevo-asistente-proyecto"
                    [opciones]="opcionesProyectoVisita"
                    [valor]="nuevoAsistenteProyecto()"
                    (valorChange)="nuevoAsistenteProyecto.set($event)"
                  />
                </ay-form-field>
                <ay-form class="pl-atc-form-ancho" (enviar)="solicitarIngresoProyecto()">
                  <div ayStack gap="3">
                    <ay-form-field etiqueta="1. Nombre completo" obligatorio>
                      <ay-input nombre="nuevo-asistente-nombre"
                        [valor]="nuevoAsistenteNombre()"
                        (valorChange)="nuevoAsistenteNombre.set($event)"
                        placeholder="Nombre y apellidos"
                      />
                    </ay-form-field>
                    <div ayGrid [columnas]="2" gap="sm" class="pl-atc-fila-campos">
                      <ay-form-field etiqueta="2. DNI (8 dígitos)" obligatorio [error]="errorDniIngreso()">
                        <ay-input nombre="nuevo-asistente-dni"
                          [valor]="nuevoAsistenteDni()"
                          [invalido]="!!errorDniIngreso()"
                          (valorChange)="nuevoAsistenteDni.set($event)"
                          placeholder="Ej. 72282555"
                        />
                      </ay-form-field>
                      <ay-form-field etiqueta="3. Teléfono de contacto" obligatorio>
                        <ay-input nombre="nuevo-asistente-telefono"
                          [valor]="nuevoAsistenteTelefono()"
                          (valorChange)="nuevoAsistenteTelefono.set($event)"
                          placeholder="+51 987 654 321"
                        />
                      </ay-form-field>
                    </div>
                    <div ayGrid [columnas]="2" gap="sm" class="pl-atc-fila-campos">
                      <ay-form-field etiqueta="4. Motivo de la visita" obligatorio>
                        <ay-select nombre="nuevo-asistente-motivo"
                          [opciones]="opcionesMotivoVisita"
                          [valor]="nuevoAsistenteMotivo()"
                          (valorChange)="nuevoAsistenteMotivo.set($event)"
                        />
                      </ay-form-field>
                      <ay-form-field etiqueta="5. Lote o área a visitar" obligatorio>
                        <ay-input nombre="nuevo-asistente-lote"
                          [valor]="nuevoAsistenteLote()"
                          (valorChange)="nuevoAsistenteLote.set($event)"
                          placeholder="Ej. Mz. C Lt. 07 o Oficina de ventas"
                        />
                      </ay-form-field>
                    </div>
                    <ay-form-field etiqueta="6. Fecha y hora">
                      <ay-input nombre="nuevo-asistente-fecha" [valor]="fechaHoraIngreso()" [soloLectura]="true" />
                    </ay-form-field>
                    <ay-form-field
                      etiqueta="Placa del vehículo (opcional, si ingresa en vehículo propio)"
                      ayuda="Déjalo vacío si ingresa a pie. Ejemplo: ABC-123"
                      [error]="errorPlaca()"
                    >
                      <ay-input nombre="nuevo-asistente-placa"
                        [valor]="nuevoAsistentePlaca()"
                        (valorChange)="nuevoAsistentePlaca.set($event.toUpperCase())"
                        placeholder="ABC-123"
                      />
                    </ay-form-field>
                    <div ayRow gap="2" justificar="end">
                      <ay-button tipo="submit" variante="primary" [disabled]="!ingresoValido()">Registrar ingreso</ay-button>
                    </div>
                  </div>
                </ay-form>
                <ay-modal
                  [abierto]="confirmandoIngreso()"
                  (abiertoChange)="!$event && confirmandoIngreso.set(false)"
                  titulo="Confirmar ingreso en vehículo propio"
                >
                  <div ayStack gap="3">
                    <p ayText="body">
                      <strong>{{ nuevoAsistenteNombre().trim() }}</strong> · DNI {{ nuevoAsistenteDni().trim() || 'sin DNI' }} ·
                      {{ nuevoAsistenteProyecto() }} · Placa <strong>{{ placaNormalizada() }}</strong>
                    </p>
                    <p ayText="body" size="xs">
                      Se notificará en línea al responsable del proyecto el ingreso en vehículo propio.
                    </p>
                    @if (placaRepetidaHoy()) {
                      <ay-alert tono="warning" size="sm" titulo="Placa ya registrada hoy">
                        Esta placa ya tiene un ingreso hoy. Puedes confirmar igualmente si es correcto.
                      </ay-alert>
                    }
                    <div ayRow gap="2" justificar="end">
                      <ay-button variante="ghost" (click)="confirmandoIngreso.set(false)">Volver a editar</ay-button>
                      <ay-button variante="primary" (click)="registrarIngresoProyecto()">Confirmar ingreso</ay-button>
                    </div>
                  </div>
                </ay-modal>
              </ay-card-body>
            </ay-card>

            <ay-card superficie="solid">
              <ay-card-header
                titulo="Ingresos registrados hoy"
                subtitulo="Se notifica en línea al responsable del proyecto en el maestro."
                nivel="h2"
                [separador]="true"
              />
              <ay-card-body padding="md">
                <app-ingresos-hoy [asistentes]="asistentes()" />
              </ay-card-body>
            </ay-card>
          </div>
        }
      </div>
    }

    <!-- ====================================================================== -->
    <!-- 9. LIBRO DE RECLAMACIONES (ASIENTOS, ALERTAS LEGALES, HUÉRFANOS)       -->
    <!-- ====================================================================== -->
    @if (subvista() === 'libro') {
      <div ayStack gap="6">
        <ay-page-header
          titulo="Libro de Reclamaciones"
          descripcion="Ley 29571, art. 24 (modificado por la Ley 31435): se responde en 15 días hábiles improrrogables desde el registro, con carta y cargo de recepción."
          [conPestanas]="true"
        >
          @if (estadoProto.puedeGestionarLibro()) {
            <ay-button ayAcciones tamano="sm" variante="primary" (click)="abrirRegistroAsiento()">
              + Registrar asiento
            </ay-button>
          }
          <ay-tabs
            ayPestanas
            etiqueta="Secciones del Libro de Reclamaciones"
            variante="underline"
            [items]="tabsLibro()"
            [valor]="tabLibro()"
            (valorChange)="tabLibro.set($event)"
          />
        </ay-page-header>

        @if (tabLibro() === 'asientos') {
          <ay-card variante="elevated" superficie="solid">
            <ay-card-body padding="sm" gap="sm">
              @if (filasLibro().length === 0) {
                <ay-alert tono="info" size="sm" titulo="Aún no hay asientos en el Libro">
                  Registra el primero con «+ Registrar asiento».
                </ay-alert>
              } @else {
                <ay-table
                  leyenda="Asientos del Libro de Reclamaciones regulado"
                  class="pl-atc-bandeja"
                  [columnas]="columnasLibro"
                  [filas]="filasLibro()"
                  [cabeceraFija]="true"
                  [rayada]="true"
                >
                  <ng-template ayCelda="asiento" let-fila>
                    @let d = comoFilaLibro(fila).detalle;
                    <div ayStack gap="1">
                      <strong ayText="mono" size="xs">{{ d.codigo }}</strong>
                      <span ayText="body" size="xs">{{ d.establecimiento }}</span>
                    </div>
                  </ng-template>
                  <ng-template ayCelda="ticket" let-fila>
                    @let d = comoFilaLibro(fila).detalle;
                    <ay-button
                      tamano="sm"
                      variante="secondary"
                      [attr.aria-label]="'Ver el ticket ' + d.ticketNum"
                      (click)="seleccionarTicket.emit(d.ticketNum)"
                    >
                      {{ d.ticketNum }}
                    </ay-button>
                  </ng-template>
                  <ng-template ayCelda="kind" let-fila>
                    @let d = comoFilaLibro(fila).detalle;
                    <div ayStack gap="1">
                      <ay-badge size="sm" [tono]="d.tipo === 'RECLAMO' ? 'warning' : 'neutral'">
                        {{ etiqueta(asientoTipoEs, d.tipo) }}
                      </ay-badge>
                      <span ayText="body" size="xs">{{ montoTexto(d) }}</span>
                    </div>
                  </ng-template>
                  <ng-template ayCelda="cli" let-fila>
                    @let d = comoFilaLibro(fila).detalle;
                    <div ayStack gap="1">
                      <strong>{{ d.consumidor }}</strong>
                      <span ayText="body" size="xs">{{ d.hechos }}</span>
                    </div>
                  </ng-template>
                  <ng-template ayCelda="plazo" let-fila>
                    @let d = comoFilaLibro(fila).detalle;
                    @let p = plazoLibro(d);
                    <div ayStack gap="1">
                      <ay-badge size="sm" [tono]="p.tono">{{ p.texto }}</ay-badge>
                      <span ayText="mono" size="xs">Vence: {{ fmtDia(d.venceOriginal) }}</span>
                    </div>
                  </ng-template>
                  <ng-template ayCelda="respuesta" let-fila>
                    @let d = comoFilaLibro(fila).detalle;
                    @if (d.respuesta; as r) {
                      <div ayStack gap="1" class="pl-atc-celda-compacta">
                        <ay-badge size="sm" tono="success">Respondido</ay-badge>
                        <span ayText="body" size="xs">En {{ r.diasHabilesUsados }} d hábiles</span>
                        @if (apelacionTexto(d); as ap) {
                          <span ayText="body" size="xs">{{ ap }}</span>
                        }
                      </div>
                    } @else {
                      <ay-badge size="sm" tono="neutral">Sin respuesta</ay-badge>
                    }
                  </ng-template>
                  <ng-template ayCelda="acciones" let-fila>
                    @let d = comoFilaLibro(fila).detalle;
                    <div class="pl-atc-acciones-celda">
                      @if (!d.respuesta && estadoProto.puedeGestionarLibro()) {
                        <ay-button
                          tamano="sm"
                          variante="primary"
                          [attr.aria-label]="'Responder el asiento ' + d.codigo"
                          (click)="abrirRespuesta(d)"
                        >
                          Responder
                        </ay-button>
                      } @else {
                        <ay-button
                          tamano="sm"
                          variante="primary"
                          [attr.aria-label]="'Ver el asiento ' + d.codigo"
                          (click)="verAsiento(d)"
                        >
                          Ver asiento
                        </ay-button>
                      }
                      <ay-dropdown-menu
                        colocacion="bottom-end"
                        [items]="itemsMasAccionesLibro(d)"
                        (elegido)="elegirMasAccionLibro($event, d)"
                      >
                        <ay-icon-button
                          ayDisparador
                          variante="ghost"
                          tamano="sm"
                          [etiqueta]="'Más acciones del asiento ' + d.codigo"
                        >
                          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <circle cx="5" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="19" cy="12" r="1.8" />
                          </svg>
                        </ay-icon-button>
                      </ay-dropdown-menu>
                    </div>
                  </ng-template>
                </ay-table>
              }
            </ay-card-body>
          </ay-card>
        }

        @if (tabLibro() === 'alertas') {
          <ay-card superficie="solid">
            <ay-card-header
              titulo="Alertas del plazo legal (Ley 29571)"
              subtitulo="Se generan a 3 días hábiles del vencimiento y cuando el plazo vence sin respuesta. El plazo no se prorroga."
              nivel="h2"
              [separador]="true"
            />
            <ay-card-body padding="sm">
              @if (estadoProto.alertasLegalesLibro().length === 0) {
                <ay-alert tono="success" size="sm" titulo="Sin alertas del plazo legal">
                  Ningún asiento sin respuesta está a 3 días hábiles de vencer ni vencido.
                </ay-alert>
              } @else {
                <ay-card-pairs [pares]="paresAlertasLibro()" />
              }
            </ay-card-body>
          </ay-card>
        }

        @if (tabLibro() === 'huerfanos') {
          <ay-card superficie="solid">
            <ay-card-header
              titulo="Control diario de integridad (tickets huérfanos)"
              subtitulo="Tickets activos de un tipo que exige el Libro (Queja o Reclamo) y que no tienen asiento. Lo decisivo es que exista el asiento, no el tipo del ticket."
              nivel="h2"
              [separador]="true"
            />
            <ay-card-body padding="md" gap="md">
              @if (huerfanosLibro().length === 0) {
                <ay-alert tono="success" size="sm" titulo="0 tickets huérfanos hoy">
                  Todos los tickets activos de tipo Queja y Reclamo tienen su asiento en el Libro.
                </ay-alert>
              } @else {
                <ay-alert tono="warning" size="sm" [titulo]="huerfanosLibro().length + ' tickets huérfanos hoy'">
                  Cada uno queda como excepción de integridad (ORPHAN_REFERENCE) hasta que se registre su asiento.
                </ay-alert>
                <ay-table
                  leyenda="Tickets huérfanos del Libro de Reclamaciones"
                  class="pl-atc-bandeja"
                  [columnas]="columnasHuerfanos"
                  [filas]="huerfanosLibro()"
                  [rayada]="true"
                >
                  <ng-template ayCelda="num" let-fila>
                    <strong ayText="mono" size="xs">{{ comoTicket(fila).num }}</strong>
                  </ng-template>
                  <ng-template ayCelda="cli" let-fila>
                    @let t = comoTicket(fila);
                    <div ayStack gap="1">
                      <strong>{{ t.cli }}</strong>
                      <span ayText="body" size="xs">{{ t.summary }}</span>
                    </div>
                  </ng-template>
                  <ng-template ayCelda="state" let-fila>
                    <ay-badge size="sm" tono="neutral">{{ estadoTicketEs(comoTicket(fila).state) }}</ay-badge>
                  </ng-template>
                  <ng-template ayCelda="acciones" let-fila>
                    @let t = comoTicket(fila);
                    <div class="pl-atc-acciones-celda">
                      <ay-button
                        tamano="sm"
                        variante="primary"
                        [disabled]="!estadoProto.puedeGestionarLibro()"
                        [attr.aria-label]="'Registrar el asiento del ticket ' + t.num"
                        (click)="abrirRegistroAsiento(t.num)"
                      >
                        Registrar asiento
                      </ay-button>
                      <ay-button tamano="sm" variante="ghost" (click)="seleccionarTicket.emit(t.num)">Ver ticket</ay-button>
                    </div>
                  </ng-template>
                </ay-table>
              }
            </ay-card-body>
          </ay-card>
        }

        <!-- Registrar asiento (HU-012) -->
        <ay-modal
          [abierto]="registrandoAsiento()"
          (abiertoChange)="!$event && registrandoAsiento.set(false)"
          titulo="Registrar asiento en el Libro de Reclamaciones"
          size="lg"
        >
          <ay-form (enviar)="guardarAsiento()">
            <div ayStack gap="3">
              @if (huerfanosLibro().length === 0) {
                <ay-alert tono="info" size="sm" titulo="No hay tickets pendientes de asiento">
                  Todos los tickets abiertos de Queja o Reclamo ya tienen su asiento.
                </ay-alert>
              }
              <p ayText="body" size="xs">
                El asiento nace de un ticket de Queja o Reclamo. Su razón social es la del ticket y no se puede cambiar después (RN-SVC-013). El plazo de {{ plazoDias }} días hábiles corre desde hoy y no se prorroga.
              </p>
              <ay-form-field etiqueta="Ticket asociado" obligatorio [error]="errorAsiento('ticketNum')">
                <ay-select nombre="asiento-ticket"
                  [opciones]="opcionesTicketAsiento()"
                  [valor]="asTicket()"
                  (valorChange)="elegirTicketAsiento($event)"
                />
              </ay-form-field>
              <div ayGrid [columnas]="2" gap="sm" class="pl-atc-apilar pl-atc-fila-campos pl-atc-fila-campos--reserva">
                <ay-form-field etiqueta="Razón social">
                  <ay-input nombre="asiento-empresa" [valor]="empresaAsientoTexto()" [soloLectura]="true" />
                </ay-form-field>
                <ay-form-field etiqueta="Establecimiento" obligatorio [error]="errorAsiento('establecimiento')">
                  <ay-select nombre="asiento-establecimiento"
                    [opciones]="opcionesEstablecimiento"
                    [valor]="asEstablecimiento()"
                    (valorChange)="asEstablecimiento.set($event)"
                  />
                </ay-form-field>
              </div>
              <ay-form-field etiqueta="Tipo de asiento" obligatorio>
                <ay-select nombre="asiento-tipo"
                  [opciones]="opcionesTipoAsiento"
                  [valor]="asTipo()"
                  (valorChange)="asTipo.set($event)"
                />
              </ay-form-field>
              <span ayText="subtitle" size="xs">Correlativo que se asignará: {{ correlativoAsiento() }}</span>
              <ay-form-field etiqueta="Hechos" obligatorio [error]="errorAsiento('hechos')">
                <ay-textarea nombre="asiento-hechos"
                  [filas]="3"
                  [valor]="asHechos()"
                  (valorChange)="asHechos.set($event)"
                />
              </ay-form-field>
              <ay-form-field etiqueta="Pedido del consumidor" obligatorio [error]="errorAsiento('pedido')">
                <ay-textarea nombre="asiento-pedido"
                  [filas]="2"
                  [valor]="asPedido()"
                  (valorChange)="asPedido.set($event)"
                />
              </ay-form-field>
              <div ayGrid [columnas]="2" gap="sm" class="pl-atc-apilar pl-atc-fila-campos pl-atc-fila-campos--reserva">
                <ay-form-field etiqueta="Monto reclamado (opcional)" [error]="errorAsiento('monto')">
                  <ay-input nombre="asiento-monto"
                    [valor]="asMonto()"
                    (valorChange)="asMonto.set($event)"
                    placeholder="Sin monto"
                  />
                </ay-form-field>
                <ay-form-field etiqueta="Moneda" [error]="errorAsiento('moneda')">
                  <ay-select nombre="asiento-moneda"
                    [opciones]="opcionesMoneda"
                    [valor]="asMoneda()"
                    (valorChange)="asMoneda.set($event)"
                  />
                </ay-form-field>
              </div>
              <div ayRow gap="2" justificar="end">
                <ay-button variante="ghost" (click)="registrandoAsiento.set(false)">Cancelar</ay-button>
                <ay-button tipo="submit" variante="primary">Registrar asiento</ay-button>
              </div>
            </div>
          </ay-form>
        </ay-modal>

        <!-- Responder con carta y cargo (HU-014) -->
        <ay-modal
          [abierto]="respondiendo() !== null"
          (abiertoChange)="!$event && respondiendo.set(null)"
          [titulo]="respondiendo() ? 'Responder el asiento ' + respondiendo()!.codigo : 'Responder'"
          size="lg"
        >
          @if (respondiendo(); as asiento) {
            <ay-form (enviar)="guardarRespuesta()">
              <div ayStack gap="3">
                @let plazoR = plazoLibro(asiento);
                <ay-alert [tono]="plazoR.estado === 'VENCIDO' ? 'danger' : plazoR.estado === 'POR_VENCER' ? 'warning' : 'info'" size="sm" [titulo]="plazoR.texto">
                  Vence el {{ fmtDia(asiento.venceOriginal) }}. @if (plazoR.estado === 'VENCIDO') { Responder ahora queda fuera del plazo legal. }
                </ay-alert>
                <ay-form-field etiqueta="Resumen de la respuesta" obligatorio [error]="errorRespuesta('resumen')">
                  <ay-textarea nombre="respuesta-resumen"
                    [filas]="3"
                    [valor]="rpResumen()"
                    (valorChange)="rpResumen.set($event)"
                  />
                </ay-form-field>
                <ay-file-upload
                  etiqueta="Carta de respuesta (PDF)"
                  formatos=".pdf"
                  requisitos="PDF, hasta 10 MB. Entra al sello de integridad del asiento."
                  [pesoMaximo]="10485760"
                  [archivos]="rpCartaLista()"
                  [error]="errorRespuesta('carta')"
                  (anadir)="anadirCarta($event)"
                  (quitarArchivo)="rpCarta.set(null)"
                />
                <ay-file-upload
                  etiqueta="Cargo de recepción del consumidor"
                  formatos=".pdf,.jpg,.jpeg,.png"
                  requisitos="Sin cargo la respuesta no vale ante INDECOPI (RN-SVC-010)."
                  [pesoMaximo]="10485760"
                  [archivos]="rpCargoLista()"
                  [error]="errorRespuesta('cargo')"
                  (anadir)="anadirCargo($event)"
                  (quitarArchivo)="rpCargo.set(null)"
                />
                <ay-form-field etiqueta="Firmante">
                  <ay-input nombre="respuesta-firmante" [valor]="estadoProto.perfilActivo().nombre" [soloLectura]="true" />
                </ay-form-field>
                <ay-checkbox [marcado]="rpDerecho()" (marcadoChange)="rpDerecho.set($event)">
                  Se informó al consumidor su derecho a acudir a INDECOPI
                </ay-checkbox>
                @if (errorRespuesta('derechoIndecopi'); as e) {
                  <span ayText="body" size="xs" role="alert" class="pl-atc-error-campo">{{ e }}</span>
                }
                <div ayRow gap="2" justificar="end">
                  <ay-button variante="ghost" (click)="respondiendo.set(null)">Cancelar</ay-button>
                  <ay-button tipo="submit" variante="primary">Registrar respuesta</ay-button>
                </div>
              </div>
            </ay-form>
          }
        </ay-modal>

        <!-- Ver asiento -->
        <ay-modal
          [abierto]="asientoVisto() !== null"
          (abiertoChange)="!$event && asientoVistoId.set(null)"
          [titulo]="asientoVisto() ? 'Asiento ' + asientoVisto()!.codigo : 'Asiento'"
          size="lg"
        >
          @if (asientoVisto()) {
            <div ayStack gap="3">
              <ay-card-pairs [pares]="paresAsientoVisto()" />
              <div ayRow gap="2" justificar="end">
                <ay-button variante="ghost" (click)="asientoVistoId.set(null)">Cerrar</ay-button>
              </div>
            </div>
          }
        </ay-modal>
      </div>
    }

    <!-- ====================================================================== -->
    <!-- 11. MESA DE CASOS SENSIBLES SGD (CASOS, EN LIMBO, ESCALAMIENTOS)       -->
    <!-- ====================================================================== -->
    @if (subvista() === 'sgd') {
      <div ayStack gap="6">
        <ay-page-header
          titulo="Mesa de Casos Sensibles SGD"
          descripcion="Cinco líneas de ingreso, Código Único por caso, SLA desde el cargo de activación, matriz objetiva de riesgo y cierre con custodia GLI."
        
          [conPestanas]="true">
          <ay-tabs
            ayPestanas
            etiqueta="Vistas de la Mesa SGD"
            variante="underline"
            [items]="tabsMesaSgd()"
            [valor]="tabSgd()"
            (valorChange)="tabSgd.set($event)"
          />
        </ay-page-header>

        <div ayStack gap="4">
          <ay-card superficie="solid">
            <ay-card-header
              titulo="Cargo previo vs. activación, casos vinculados y cierre GLI"
              subtitulo="El SLA de línea corre recién desde el cargo de activación."
              nivel="h2"
              [separador]="true"
            />
            <ay-card-body padding="sm" class="pl-sgd-tabla">
              <ay-table
                leyenda="Casos documentales SGD y custodia GLI"
                [columnas]="columnasSgd"
                [filas]="casosSgd()"
                [rayada]="true"
              >
                <ng-template ayCelda="code" let-fila>
                  @let s = comoSgd(fila);
                  <strong ayText="mono" size="xs">{{ s.code }}</strong>
                </ng-template>
                <ng-template ayCelda="line" let-fila>
                  @let s = comoSgd(fila);
                  <div ayStack gap="1">
                    <strong>{{ s.line }}</strong>
                    <span ayText="body" size="xs">{{ s.cli }}</span>
                  </div>
                </ng-template>
                <ng-template ayCelda="cargo" let-fila>
                  @let s = comoSgd(fila);
                  <div ayStack gap="1">
                    <span ayText="body" size="xs">Previo: {{ fmtDia(s.pre) }}</span>
                    <ay-button
                      tamano="sm"
                      variante="secondary"
                      [disabled]="!!s.act || !estadoProto.puedeOperarMesaSgd()"
                      (click)="!s.act && estadoProto.puedeOperarMesaSgd() && activarCargoSgd(s)"
                    >
                      {{ s.act ? 'Activado ' + fmtDia(s.act) + ' (SLA ' + s.slaDays + 'd)' : 'Emitir cargo de activación' }}
                    </ay-button>
                  </div>
                </ng-template>
                <ng-template ayCelda="linked" let-fila>
                  @let s = comoSgd(fila);
                  <span ayText="mono" size="xs">{{ s.linked ?? 'Sin cruce' }}</span>
                </ng-template>
                <ng-template ayCelda="estado" let-fila>
                  @let s = comoSgd(fila);
                  <div class="pl-atc-acciones-celda">
                    <ay-button
                      tamano="sm"
                      variante="secondary"
                      [disabled]="!!s.closeState || !s.act || !estadoProto.puedeOperarMesaSgd()"
                      (click)="!s.closeState && s.act && estadoProto.puedeOperarMesaSgd() && cerrarCasoSgdConGli(s)"
                    >
                      {{ s.closeState ? etiqueta(cierreSgdEs, s.closeState) + ' · GLI' : 'Cerrar con evidencia GLI' }}
                    </ay-button>
                  </div>
                </ng-template>
              </ay-table>
            </ay-card-body>
          </ay-card>

          <ay-card superficie="solid">
            <ay-card-header
              titulo="Matriz Objetiva de Clasificación de Riesgo"
              subtitulo="El nivel sale de los criterios marcados; no hay campo de opinión subjetiva."
              nivel="h2"
              [separador]="true"
            />
            <ay-card-body padding="md" gap="md">
              <ay-form-group leyenda="Criterios de exposición verificados" variante="card">
                <ay-checkbox
                  [marcado]="riesgoAutoridad()"
                  (marcadoChange)="riesgoAutoridad.set($event)"
                >
                  Notificación o requerimiento de autoridad (INDECOPI / Fiscalía / Municipalidad) (+40 pts)
                </ay-checkbox>
                <ay-checkbox
                  [marcado]="riesgoCartaNotarial()"
                  (marcadoChange)="riesgoCartaNotarial.set($event)"
                >
                  Carta notarial o apercibimiento de resolución contractual (+30 pts)
                </ay-checkbox>
                <ay-checkbox
                  [marcado]="riesgoCuantioso()"
                  (marcadoChange)="riesgoCuantioso.set($event)"
                >
                  Exposición económica &gt; 5 UIT o reclamo colectivo vecinal (+25 pts)
                </ay-checkbox>
              </ay-form-group>

              <ay-progress-bar
                etiqueta="Puntaje objetivo de riesgo"
                [detalle]="puntajeRiesgo() + ' / 95 pts'"
                [valor]="(puntajeRiesgo() / 95) * 100"
                [tono]="puntajeRiesgo() >= 55 ? 'danger' : 'brand'"
              />

              <ay-alert
                [tono]="puntajeRiesgo() >= 55 ? 'danger' : puntajeRiesgo() >= 30 ? 'warning' : 'success'"
                [titulo]="'Puntaje: ' + puntajeRiesgo() + ' / 95'"
                size="sm"
              >
                {{
                  puntajeRiesgo() >= 55
                    ? 'RIESGO MUY ALTO · ESCALAMIENTO EN CADENA A COMITÉ Y GERENCIA GENERAL'
                    : puntajeRiesgo() >= 30
                      ? 'RIESGO MEDIO · SEGUIMIENTO DE MESA SGD'
                      : 'RIESGO BAJO · ATENCIÓN REGULAR DE LÍNEA'
                }}
              </ay-alert>
            </ay-card-body>
          </ay-card>
        </div>
      </div>
    }

    <!-- ====================================================================== -->
    <!-- 12. GARANTÍAS POSTVENTA (EN REVISIÓN, CON RESOLUCIÓN, TODAS)           -->
    <!-- ====================================================================== -->
    @if (subvista() === 'garantias') {
      <div ayStack gap="6">
        <ay-page-header
          titulo="Garantías postventa"
          descripcion="Un reclamo siempre cuelga de un Acta de Entrega y solo procede dentro de la cobertura (120 meses estructural; 12 meses impermeabilización, acabados e instalaciones)."
        />

        <ay-card variante="elevated" superficie="solid">
          <ay-card-body padding="sm">
            <ay-table
              leyenda="Solicitudes de garantía postventa vinculadas a acta de entrega"
              [columnas]="columnasGarantias"
              [filas]="garantias()"
              [rayada]="true"
            >
              <ng-template ayCelda="id" let-fila>
                @let g = comoGarantia(fila);
                <div ayStack gap="1">
                  <strong ayText="mono" size="xs">{{ g.id }}</strong>
                  <span ayText="body" size="xs">Ticket {{ g.ticket }}</span>
                </div>
              </ng-template>
              <ng-template ayCelda="unit" let-fila>
                @let g = comoGarantia(fila);
                <div ayStack gap="1">
                  <strong>{{ g.unit }}</strong>
                  <span ayText="body" size="xs">Acta de Entrega: {{ g.handover }}</span>
                </div>
              </ng-template>
              <ng-template ayCelda="type" let-fila>
                @let g = comoGarantia(fila);
                <ay-badge size="sm" tono="info">{{ g.type }} ({{ g.cov }} meses)</ay-badge>
              </ng-template>
              <ng-template ayCelda="insp" let-fila>
                @let g = comoGarantia(fila);
                <ay-button
                  tamano="sm"
                  variante="secondary"
                  [disabled]="!!g.insp || !estadoProto.puedeOperarGarantias()"
                  (click)="!g.insp && estadoProto.puedeOperarGarantias() && agendarInspeccion(g)"
                >
                  {{ g.insp ? 'Programada: ' + g.insp : 'Programar inspección' }}
                </ay-button>
              </ng-template>
              <ng-template ayCelda="state" let-fila>
                @let g = comoGarantia(fila);
                <div class="pl-atc-acciones-celda">
                  <ay-badge
                    size="sm"
                    [tono]="
                      g.state === 'APPROVED'
                        ? 'success'
                        : g.state === 'REJECTED' || g.state === 'ESCALATED_EJE3'
                          ? 'danger'
                          : 'warning'
                    "
                  >
                    {{ etiqueta(garantiaEs, g.state) }}
                  </ay-badge>
                  <ay-button
                    tamano="sm"
                    variante="secondary"
                    [disabled]="g.state !== 'UNDER_REVIEW' || !estadoProto.puedeOperarGarantias()"
                    (click)="g.state === 'UNDER_REVIEW' && estadoProto.puedeOperarGarantias() && (g.state = 'APPROVED')"
                  >
                    Resolver / Aprobar
                  </ay-button>
                  <ay-button
                    tamano="sm"
                    variante="secondary"
                    [disabled]="g.state !== 'UNDER_REVIEW' || !estadoProto.puedeOperarGarantias()"
                    (click)="g.state === 'UNDER_REVIEW' && estadoProto.puedeOperarGarantias() && (g.state = 'ESCALATED_EJE3')"
                  >
                    Derivar a Eje 3
                  </ay-button>
                </div>
              </ng-template>
            </ay-table>
          </ay-card-body>
        </ay-card>
      </div>
    }

    <!-- ====================================================================== -->
    <!-- 13. ENTREGAFEST EN VIVO Y BUSES DEL EVENTO                             -->
    <!-- ====================================================================== -->
    @if (subvista() === 'evento' || subvista() === 'buses') {
      <div ayStack gap="6">
        <ay-page-header
          titulo="EntregaFest en vivo"
          [descripcion]="
            estadoProto.rolActivo() === 'CLIENTE'
              ? 'Reserva tu cupo con tus acompañantes (hasta 3) y tu punto de embarque desde Mi Portal.'
              : 'Tablero del evento: casos con su riesgo verbal, secuencia de contención en tres pasos y derivación inmediata a la Estación 4, y aforo y reservas de buses.'
          "
          [conPestanas]="estadoProto.rolActivo() !== 'CLIENTE'"
        >
          @if (estadoProto.rolActivo() !== 'CLIENTE') {
            <ay-button ayAcciones tamano="sm" variante="primary" (click)="irAAbrirCaso()">
              + Abrir caso del evento
            </ay-button>
          }
          @if (estadoProto.rolActivo() !== 'CLIENTE') {
            <ay-tabs
              ayPestanas
              etiqueta="Secciones de EntregaFest en vivo"
              variante="underline"
              [items]="tabsEvento"
              [valor]="tabEventoActiva()"
              (valorChange)="tabEventoElegida.set($event)"
            />
          }
        </ay-page-header>

        @if (estadoProto.rolActivo() !== 'CLIENTE' && tabEventoActiva() === 'casos') {
          <div ayStack gap="4">
            <ay-card superficie="solid">
              <ay-card-header
                titulo="Abrir un caso del evento"
                subtitulo="Escribe lo que manifiesta el propietario. Con «estafa», «fraude», «abuso» o «delito» el caso nace derivado a la Estación 4."
                nivel="h2"
                [separador]="true"
              />
              <ay-card-body padding="md" gap="md">
                <ay-form-field etiqueta="Simular transcripción verbal en mesa (detector de palabras de riesgo muy alto)">
                  <ay-textarea nombre="texto-evento"
                    [filas]="2"
                    [valor]="textoEvento()"
                    (valorChange)="textoEvento.set($event)"
                    placeholder="Escribe aquí lo manifestado por el asistente..."
                  />
                </ay-form-field>
                <div ayRow gap="2">
                  <ay-button tamano="sm" variante="primary" (click)="abrirCasoDelEvento()">
                    + Abrir caso del evento
                  </ay-button>
                </div>
              </ay-card-body>
            </ay-card>
            @if (imputacionPenalDetectada()) {
              <ay-alert
                tono="danger"
                titulo="Palabra de riesgo muy alto: derivación inmediata a la Estación 4"
              >
                La descripción contiene una palabra de riesgo muy alto («estafa», «fraude», «abuso» o «delito»). No se debate en sala: el caso se registra con la etiqueta «{{ etiquetaCasoEvento }}» y se deriva de inmediato a la Estación 4 (Legal).
              </ay-alert>
            }
            @if (reaperturaBloqueada() || casoAbierto()) {
              <div ayStack gap="4" id="zona-caso-evento">
                @if (reaperturaBloqueada(); as motivo) {
                  <ay-alert tono="warning" titulo="No se puede reabrir el caso">
                    {{ motivo }}
                  </ay-alert>
                }

                @if (casoAbierto(); as c) {
                  <ay-card superficie="solid">
                    <ay-card-header
                      [titulo]="'Caso ' + c.codigo + ' · ' + c.cliente"
                      subtitulo="Los pasos de contención, el registro y el cierre del tema en sala son de este caso."
                      nivel="h2"
                      [separador]="true"
                    />
                    <ay-card-body padding="md" gap="md">
                      <div ayRow gap="2" [ajuste]="true">
                        <ay-badge size="sm" tono="neutral">{{ etiquetaCasoEvento }}</ay-badge>
                        <ay-badge size="sm" [tono]="c.imputacionPenal ? 'danger' : 'neutral'">
                          {{ c.imputacionPenal ? 'Riesgo muy alto (imputación penal)' : 'Sin palabra de riesgo' }}
                        </ay-badge>
                        <ay-badge size="sm" [tono]="c.estacion4 ? 'success' : 'warning'">
                          {{ c.estacion4 ? 'Derivado a la Estación 4' : 'No derivado a la Estación 4' }}
                        </ay-badge>
                        <ay-badge size="sm" [tono]="c.tema === 'CERRADO' ? 'success' : 'warning'">
                          {{ c.tema === 'CERRADO' ? 'Tema cerrado en sala' : 'Tema en sala' }}
                        </ay-badge>
                      </div>

                      @if (c.frases.includes(6) && !c.registroCompleto && c.tema === 'EN_SALA') {
                        <ay-alert tono="warning" titulo="Paso 3 aplicado: completa el registro del caso">
                          El compromiso formal exige registrar el caso para poder cerrar el tema en sala.
                        </ay-alert>
                      }

                      @if (c.registroCompleto) {
                        <div ayStack gap="1">
                          <strong ayText="label" size="sm">Resumen del caso</strong>
                          <span ayText="body" size="sm">{{ c.resumen }}</span>
                        </div>
                      } @else if (c.tema === 'EN_SALA') {
                        <ay-form-field etiqueta="Resumen del caso" obligatorio>
                          <ay-textarea nombre="resumen-caso-evento"
                            [filas]="2"
                            [valor]="resumenEdicion()"
                            (valorChange)="resumenEdicion.set($event)"
                          />
                        </ay-form-field>
                        <div ayRow gap="2">
                          <ay-button tamano="sm" variante="secondary" (click)="completarRegistroCaso()">
                            Completar el registro del caso
                          </ay-button>
                        </div>
                      }

                      <app-protocolo-frases
                        [frases]="estadoProto.frasesAnclaEvento"
                        [aplicadas]="c.frases"
                        [bloqueado]="c.tema === 'CERRADO'"
                        (aplicar)="aplicarFrase($event)"
                      />

                      <div ayRow gap="3" justificar="between" [ajuste]="true">
                        <span ayText="subtitle" size="xs">
                          {{ c.frases.length > 0 ? 'Pasos aplicados: ' + pasosTexto(c.frases) + '.' : 'Aún no se aplicó ningún paso.' }}
                          El texto que dice el moderador en cada paso está por definir con el PO.
                        </span>
                        <div ayRow gap="2">
                          <ay-button tamano="sm" variante="ghost" (click)="casoAbiertoId.set(null)">Cerrar el panel</ay-button>
                          @if (!c.estacion4 && c.tema === 'EN_SALA') {
                            <ay-button tamano="sm" variante="secondary" (click)="derivarCasoAEstacion4(c)">
                              Derivar a Estación 4
                            </ay-button>
                          }
                          @if (c.tema === 'EN_SALA') {
                            <ay-button
                              tamano="sm"
                              variante="primary"
                              [disabled]="!puedeCerrarTema()"
                              [attr.title]="puedeCerrarTema() ? null : 'Aplica algún paso o deriva el caso; si llegaste al paso 3, completa antes el registro'"
                              (click)="cerrarTemaEnSala()"
                            >
                              Cerrar el tema en sala
                            </ay-button>
                          }
                        </div>
                      </div>
                    </ay-card-body>
                  </ay-card>
                }

              </div>
            }

            <ay-card variante="elevated" superficie="solid">
              <ay-card-header
                titulo="Casos registrados en el evento"
                subtitulo="Más recientes primero. Abre un caso para aplicarle la contención. Un caso derivado a la Estación 4 no se puede reabrir: queda con el especialista."
                nivel="h2"
                [separador]="true"
              />
              <ay-card-body padding="sm">
                <ay-table
                  leyenda="Casos del evento EntregaFest"
                  class="pl-atc-bandeja"
                  [columnas]="columnasCasosEvento"
                  [filas]="estadoProto.casosEventoFest()"
                  [rayada]="true"
                >
                  <ng-template ayCelda="codigo" let-fila>
                    @let c = comoCasoEvento(fila);
                    <strong ayText="mono" size="xs">{{ c.codigo }}</strong>
                  </ng-template>
                  <ng-template ayCelda="cliente" let-fila>
                    @let c = comoCasoEvento(fila);
                    <div ayStack gap="1">
                      <strong>{{ c.cliente }}</strong>
                      <span ayText="body" size="xs">{{ c.proyecto }}</span>
                    </div>
                  </ng-template>
                  <ng-template ayCelda="etiqueta">
                    <span ayText="body" size="xs">{{ etiquetaCasoEvento }}</span>
                  </ng-template>
                  <ng-template ayCelda="riesgo" let-fila>
                    @let c = comoCasoEvento(fila);
                    <div ayStack gap="1">
                      <ay-badge size="sm" [tono]="c.imputacionPenal ? 'danger' : 'neutral'">
                        {{ c.imputacionPenal ? 'Muy alto (imputación penal)' : 'Sin palabra de riesgo' }}
                      </ay-badge>
                      <span ayText="subtitle" size="xs">
                        Pasos: {{ c.frases.length > 0 ? pasosTexto(c.frases) : 'ninguno' }}
                      </span>
                    </div>
                  </ng-template>
                  <ng-template ayCelda="derivado" let-fila>
                    @let c = comoCasoEvento(fila);
                    <ay-badge size="sm" [tono]="c.estacion4 ? 'success' : 'warning'">
                      {{ c.estacion4 ? 'Sí' : 'No' }}
                    </ay-badge>
                  </ng-template>
                  <ng-template ayCelda="tema" let-fila>
                    @let c = comoCasoEvento(fila);
                    <ay-badge size="sm" [tono]="c.tema === 'CERRADO' ? 'success' : 'warning'">
                      {{ c.tema === 'CERRADO' ? 'Cerrado' : 'En sala' }}
                    </ay-badge>
                  </ng-template>
                  <ng-template ayCelda="situacion" let-fila>
                    @let c = comoCasoEvento(fila);
                    <div class="pl-atc-acciones-celda">
                      <ay-button
                        tamano="sm"
                        variante="primary"
                        [attr.aria-label]="(c.tema === 'EN_SALA' ? 'Atender caso ' : 'Ver caso ') + c.codigo"
                        (click)="verCaso(c)"
                      >
                        {{ c.tema === 'EN_SALA' ? 'Atender caso' : 'Ver caso' }}
                      </ay-button>
                      <ay-dropdown-menu
                        colocacion="bottom-end"
                        [items]="itemsMasAccionesCaso(c)"
                        (elegido)="elegirMasAccionCaso($event, c)"
                      >
                        <ay-icon-button
                          ayDisparador
                          variante="ghost"
                          tamano="sm"
                          [etiqueta]="'Más acciones del caso ' + c.codigo"
                        >
                          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <circle cx="5" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="19" cy="12" r="1.8" />
                          </svg>
                        </ay-icon-button>
                      </ay-dropdown-menu>
                    </div>
                  </ng-template>
                </ay-table>
              </ay-card-body>
            </ay-card>

          </div>
        }

        @if (tabEventoActiva() === 'buses') {
        <div ayGrid [columnas]="3" gap="sm">
          @for (b of estadoProto.busesFest; track b.id) {
            <ay-card superficie="solid">
              <ay-card-body padding="sm">
                <ay-statistic
                  [etiqueta]="b.nombre"
                  [valor]="cuposLibresBus(b.id) + ' de ' + b.aforo + ' libres'"
                  size="sm"
                />
              </ay-card-body>
            </ay-card>
          }
        </div>

        @if (estadoProto.rolActivo() === 'CLIENTE' || estadoProto.esSuperadmin()) {
          <ay-card variante="elevated" superficie="solid">
            <ay-card-header
              titulo="Mi Portal · Reservar mi cupo en el bus"
              subtitulo="Hasta 3 acompañantes por titular convocado. Si el bus no tiene cupo, puedes elegir otro bus u horario o entrar en la lista de espera."
              nivel="h2"
              [separador]="true"
            />
            <ay-card-body padding="md" gap="md">
              <ay-form class="pl-atc-form-ancho" (enviar)="confirmarReservaBusCliente()">
                <div ayGrid [columnas]="3" gap="sm" class="pl-atc-fila-campos pl-atc-fila-campos--reserva">
                  <ay-form-field etiqueta="Bus y horario" obligatorio>
                    <ay-select nombre="form-bus-id"
                      [opciones]="opcionesBusesSelect()"
                      [valor]="formBusId()"
                      (valorChange)="formBusId.set($event)"
                    />
                  </ay-form-field>
                  <ay-form-field etiqueta="Punto de embarque" obligatorio>
                    <ay-select nombre="form-bus-punto"
                      [opciones]="opcionesPuntosEmbarque"
                      [valor]="formBusPunto()"
                      (valorChange)="formBusPunto.set($event)"
                    />
                  </ay-form-field>
                  <ay-form-field etiqueta="Acompañantes (0 a 3)" obligatorio>
                    <ay-select nombre="form-bus-acompanantes"
                      [opciones]="opcionesAcompanantesBus"
                      [valor]="formBusAcompanantes()"
                      (valorChange)="formBusAcompanantes.set($event)"
                    />
                  </ay-form-field>
                </div>
                <div ayRow gap="2" justificar="end">
                  <ay-button tipo="submit" variante="primary">Reservar mi cupo</ay-button>
                </div>
              </ay-form>
              @if (ofertaSinCupo(); as o) {
                <ay-alert tono="warning" titulo="Este bus no tiene cupo">
                  {{ nombreBus(o.busId) }} no tiene cupo para {{ 1 + o.acompanantes }} personas. Elige otro bus u horario con cupo o entra a la lista de espera.
                  <div ayRow gap="2" [ajuste]="true">
                    @for (b of busesConCupo(); track b.id) {
                      <ay-button tamano="sm" variante="secondary" (click)="reservarEnOtroBus(b.id)">
                        Reservar en {{ b.nombre }} ({{ cuposLibresBus(b.id) }} libres)
                      </ay-button>
                    }
                    <ay-button tamano="sm" variante="primary" (click)="entrarListaEspera()">Entrar a la lista de espera</ay-button>
                    <ay-button tamano="sm" variante="ghost" (click)="ofertaSinCupo.set(null)">Cancelar</ay-button>
                  </div>
                </ay-alert>
              }
            </ay-card-body>
          </ay-card>
        }

        <ay-card variante="elevated" superficie="solid">
          <ay-card-header
            titulo="Buses del Entrega Fest · Reservas de los clientes convocados"
            subtitulo="Aforo por bus, puntos de embarque y acompañantes registrados."
            nivel="h2"
            [separador]="true"
          />
          <ay-card-body padding="sm">
            <ay-table
              leyenda="Reservas de bus del Entrega Fest"
              [columnas]="columnasReservasBus"
              [filas]="estadoProto.reservasBusFest()"
              [rayada]="true"
            >
              <ng-template ayCelda="clienteNombre" let-fila>
                @let r = comoReservaBus(fila);
                <strong>{{ r.clienteNombre }}</strong>
              </ng-template>
              <ng-template ayCelda="busId" let-fila>
                @let r = comoReservaBus(fila);
                <span>{{ nombreBus(r.busId) }}</span>
              </ng-template>
              <ng-template ayCelda="punto" let-fila>
                @let r = comoReservaBus(fila);
                <span ayText="body" size="xs">{{ r.punto }}</span>
              </ng-template>
              <ng-template ayCelda="acompanantes" let-fila>
                @let r = comoReservaBus(fila);
                <strong>{{ 1 + r.acompanantes }} ({{ r.acompanantes }} acomp.)</strong>
              </ng-template>
              <ng-template ayCelda="estado" let-fila>
                @let r = comoReservaBus(fila);
                <ay-badge
                  size="sm"
                  [tono]="r.estado === 'CONFIRMADA' ? 'success' : r.estado === 'EN_ESPERA' ? 'warning' : 'neutral'"
                >
                  {{ r.estado === 'CONFIRMADA' ? 'Confirmada' : r.estado === 'EN_ESPERA' ? 'En lista de espera' : 'Cancelada' }}
                </ay-badge>
              </ng-template>
              <ng-template ayCelda="accion" let-fila>
                @let r = comoReservaBus(fila);
                <div class="pl-atc-acciones-celda">
                  <ay-button
                    tamano="sm"
                    variante="secondary"
                    [disabled]="r.estado === 'CANCELADA'"
                    (click)="r.estado !== 'CANCELADA' && cancelarReservaBus(r)"
                  >
                    {{ r.estado === 'CANCELADA' ? 'Cancelada' : 'Cancelar reserva' }}
                  </ay-button>
                </div>
              </ng-template>
            </ay-table>
          </ay-card-body>
        </ay-card>
        }
      </div>
    }

    <!-- ====================================================================== -->
    <!-- 14. TORRE DE CONTROL CX (5 PESTAÑAS DE 5181)                           -->
    <!-- ====================================================================== -->
    @if (subvista() === 'torre') {
      <div ayStack gap="6">
        <ay-page-header
          titulo="Torre de Control CX"
          descripcion="Estado de atención de tickets por área (nivel macro) con gráficos, además de riesgo de denuncia (+8 % interés legal), encuestas post-atención, informes periódicos y auditoría de datos."
          [conPestanas]="true"
        >
          <ay-tabs
            ayPestanas
            etiqueta="Secciones de la Torre de Control CX"
            variante="underline"
            [items]="tabsTorreCx"
            [valor]="tabTorre()"
            (valorChange)="tabTorre.set($event)"
          />
        </ay-page-header>

        @if (tabTorre() === 'tablero') {
          <app-tablero-torre [tickets]="tickets()" (verAreaEnVivo)="verAreaEnVivo.emit($event)" />
        }

        @if (tabTorre() === 'tigo') {
          <app-impacto-tigo />
        }

        @if (tabTorre() === 'riesgo') {
          <div ayGrid [columnas]="2" gap="md">
            <ay-card variante="elevated" superficie="solid">
              <ay-card-header
                titulo="Calculadora de exposición económica (+8 % interés legal anual)"
                subtitulo="Alerta automática a Legal desde S/ 500 de exposición estimada."
                nivel="h2"
                [separador]="true"
              />
              <ay-card-body padding="md" gap="md">
                <ay-form-field etiqueta="Capital reclamado en controversia (S/)">
                  <ay-input nombre="capital-controversia-str"
                    tipo="number"
                    size="sm"
                    [valor]="capitalControversiaStr()"
                    (valorChange)="cambiarCapitalControversia($event)"
                  />
                </ay-form-field>
                <ay-card-pairs [pares]="paresImpactoLegal()" />
              </ay-card-body>
            </ay-card>

            <ay-card superficie="solid">
              <ay-card-header
                titulo="Cola de prevención de denuncias"
                subtitulo="Ordenada de mayor a menor exposición económica."
                nivel="h2"
                [separador]="true"
              />
              <ay-card-body padding="sm">
                <ay-card-pairs
                  [pares]="[
                    { clave: 'ALT-001204 · Jorge Mamani Ccori', valor: 'Exposición S/ 3,180.00 · Señal: Carta notarial (Alerta enviada a Legal)' },
                    { clave: 'AUR-000315 · Carlos Alberto Vega', valor: 'Exposición S/ 3,823.20 · Señal: 2 reaperturas (En revisión Eje 3)' }
                  ]"
                />
              </ay-card-body>
            </ay-card>
          </div>
        }

        @if (tabTorre() === 'encuestas') {
          <ay-card variante="elevated" superficie="solid">
            <ay-card-header
              titulo="Encuestas post-atención (CSAT, CES y NPS)"
              subtitulo="Una sola respuesta por cierre de ticket desde Mi Portal."
              nivel="h2"
              [separador]="true"
            />
            <ay-card-body padding="sm">
              <ay-table
                leyenda="Encuestas recibidas"
                [columnas]="columnasEncuestasCx"
                [filas]="estadoProto.encuestasCx()"
                [rayada]="true"
              >
                <ng-template ayCelda="ticketNum" let-fila>
                  @let e = comoEncuesta(fila);
                  <strong ayText="mono" size="xs">{{ e.ticketNum }}</strong>
                </ng-template>
                <ng-template ayCelda="gestor" let-fila>
                  @let e = comoEncuesta(fila);
                  <span>{{ e.gestor }} ({{ areaEs(e.area) }})</span>
                </ng-template>
                <ng-template ayCelda="csat" let-fila>
                  @let e = comoEncuesta(fila);
                  <ay-badge size="sm" tono="success">
                    CSAT {{ e.csat }}/5 · CES {{ e.ces }}/5 · NPS {{ e.nps }}/10
                  </ay-badge>
                </ng-template>
                <ng-template ayCelda="comentario" let-fila>
                  @let e = comoEncuesta(fila);
                  <span ayText="body" size="xs">{{ e.comentario }}</span>
                </ng-template>
              </ay-table>
            </ay-card-body>
          </ay-card>
        }

        @if (tabTorre() === 'informes') {
          <ay-card variante="elevated" superficie="solid">
            <ay-card-header
              titulo="Informes periódicos CX"
              subtitulo="Volumen, cumplimiento SLA, CSAT/NPS y las 3 causas raíz más frecuentes."
              nivel="h2"
              [separador]="true"
            >
              <div ayAcciones ayRow gap="2">
                <ay-button tamano="sm" variante="secondary" (click)="generarInforme('SEMANAL')">
                  Generar informe semanal
                </ay-button>
                <ay-button tamano="sm" variante="primary" (click)="generarInforme('MENSUAL')">
                  Generar informe mensual
                </ay-button>
              </div>
            </ay-card-header>
            <ay-card-body padding="sm">
              <ay-card-pairs
                [pares]="
                  estadoProto.informesCx().map(i => ({
                    clave: 'Informe ' + i.periodo + ' · ' + fmtHora(i.generado),
                    valor: i.total + ' tickets · 1.ª resp. ' + i.cumplimientoRespuesta + '% · Resolución ' + i.cumplimientoResolucion + '% · CSAT ' + i.csatPromedio + ' · NPS +' + i.nps
                  }))
                "
              />
            </ay-card-body>
          </ay-card>
        }

        @if (tabTorre() === 'auditoria') {
          <div ayGrid [columnas]="2" gap="md">
            <ay-card superficie="solid">
              <ay-card-header
                titulo="Decisiones sobre sugerencias de la IA"
                subtitulo="Sin el texto del borrador ni datos personales (Ley 29733)."
                nivel="h2"
                [separador]="true"
              />
              <ay-card-body padding="sm">
                <ay-card-pairs
                  [pares]="
                    estadoProto.decisionesIaAudit().map(d => ({
                      clave: d.ticketNum + ' · ' + d.decision + ' (' + d.autor + ')',
                      valor: fmtHora(d.fecha) + ' · ' + d.anonimizados + ' dato(s) anonimizados antes de enviar al modelo'
                    }))
                  "
                />
              </ay-card-body>
            </ay-card>

            <ay-card superficie="solid">
              <ay-card-header
                titulo="Consultas a fuentes externas (DLP activo)"
                subtitulo="Los DNI y números de tarjeta se bloquean antes de salir del servicio."
                nivel="h2"
                [separador]="true"
              />
              <ay-card-body padding="sm">
                <ay-card-pairs
                  [pares]="
                    estadoProto.consultasExternasAudit().map(c => ({
                      clave: c.fuente + ' · ' + c.autor,
                      valor: c.motivo + ' (' + c.bloqueados + ' dato(s) personales bloqueados)'
                    }))
                  "
                />
              </ay-card-body>
            </ay-card>
          </div>
        }
      </div>
    }
  `,
})
export class VistaEspecializadaComponent {
  readonly estadoProto = inject(EstadoPrototipoAtcService);
  private readonly tigo = inject(TigoEstadoService);

  readonly subvista = input.required<SubvistaEspecializadaAtc>();
  readonly tickets = input<TicketAtc[]>([]);
  readonly casosSgd = input.required<CasoSgd[]>();
  readonly casosMorosidad = input.required<CasoMorosidad[]>();
  readonly garantias = input.required<ReclamoGarantia[]>();
  readonly asistentes = input.required<AsistenteProyecto[]>();
  readonly buses = input.required<BusEntregaFest[]>();
  readonly mostrarHu = input<boolean>(false);

  readonly verContrato = output<string>();
  readonly seleccionarTicket = output<string>();
  /** Código de área (p. ej. 'LEGAL') que el Tablero de la Torre quiere ver en Vivo. */
  readonly verAreaEnVivo = output<string>();
  readonly irANuevo = output<void>();
  /** La reserva de un cupo de bus genera un ticket (HU-ATC-060 CA-01): la consola lo suma a la bandeja. */
  readonly ticketNuevo = output<TicketAtc>();
  /** Un ingreso de garita registrado: la consola lo suma a «Ingresos registrados hoy». */
  readonly ingresoRegistrado = output<AsistenteProyecto>();

  readonly avisoOperacion = signal<string | null>(null);

  /* ── Pestañas de cada vista 5181 ── */
  readonly tabConfig = signal<string>(this.consumirPestanaPedida());
  private consumirPestanaPedida(): string {
    const pedida = this.tigo.pestanaWorkflowPedida();
    if (pedida) this.tigo.pestanaWorkflowPedida.set(null);
    return pedida ?? 'tipos';
  }
  /** Coordinador CX consulta los flujos; el resto de pestañas y la edición son del Admin Funcional y el Supervisor. */
  readonly puedeEditarWorkflow = computed(() => ['ADMIN_FUNCIONAL', 'SUPERVISOR', 'SUPERADMIN'].includes(this.estadoProto.rolActivo()));
  readonly puedeVerWorkflow = computed(() => this.puedeEditarWorkflow() || this.estadoProto.rolActivo() === 'COORDINADOR_CX');
  private readonly vistaFlujosElegida = signal<'area' | 'tabla' | null>(null);
  /** Quien edita abre en la tabla; quien solo consulta, en la vista por área. */
  readonly vistaFlujos = computed(() => this.vistaFlujosElegida() ?? (this.puedeEditarWorkflow() ? 'tabla' : 'area'));
  elegirVistaFlujos(v: string): void {
    this.vistaFlujosElegida.set(v === 'tabla' ? 'tabla' : 'area');
  }
  readonly opcionesVistaFlujos: AySegmentoOpcion[] = [
    { valor: 'area', etiqueta: 'Por área' },
    { valor: 'tabla', etiqueta: 'Tabla' },
  ];
  readonly tabsWorkflow = computed<AyTabsElemento[]>(() => [
    { value: 'tipos', label: 'Tipos de ticket', contador: this.estadoProto.tiposTicket().length },
    { value: 'subtipos', label: 'Subtipos de ticket', contador: this.estadoProto.subtiposTicket().length },
    { value: 'flujos', label: 'Configuración de flujo', contador: this.estadoProto.flujosPorTipo().length },
    ...(this.puedeEditarWorkflow()
      ? [
          { value: 'guias', label: 'Guías', contador: this.estadoProto.guiasPorTipo().length },
          {
            value: 'propuestas-tigo',
            label: 'Propuestas de Tigo',
            contador: this.tigo.propuestasAprendizaje().filter((a) => a.estado === 'pendiente').length,
          },
          { value: 'politica-tigo', label: 'Autonomía de Tigo' },
          { value: 'alertas', label: 'Alertas', contador: this.estadoProto.alertasAdmin().length },
        ]
      : []),
  ]);

  readonly tabUrbeMind = signal<string>('api');
  readonly tabsUrbeMind = computed<AyTabsElemento[]>(() => [
    { value: 'api', label: 'API', contador: this.estadoProto.llamadasUrbeMind().length },
    { value: 'eventos', label: 'Eventos', contador: this.estadoProto.eventosUrbeMind().length },
  ]);

  readonly tabLibro = signal<string>('asientos');
  readonly tabsLibro = computed<AyTabsElemento[]>(() => [
    { value: 'asientos', label: 'Asientos', contador: this.estadoProto.asientosLibroDetalle().length },
    { value: 'alertas', label: 'Alertas legales', contador: this.estadoProto.alertasLegalesLibro().length },
    { value: 'huerfanos', label: 'Huérfanos', contador: this.huerfanosLibro().length },
  ]);

  readonly plazoDias = PLAZO_LEGAL_DIAS_HABILES;
  readonly opcionesEstablecimiento: AyOpcionSelect[] = [
    { value: '', label: 'Elige el establecimiento' },
    ...ESTABLECIMIENTOS_LIBRO.map((e) => ({ value: e, label: e })),
  ];
  readonly opcionesTipoAsiento: AyOpcionSelect[] = [
    { value: 'RECLAMO', label: 'Reclamo' },
    { value: 'QUEJA', label: 'Queja' },
  ];
  readonly opcionesMoneda: AyOpcionSelect[] = [
    { value: '', label: 'Sin moneda' },
    { value: 'PEN', label: 'Soles (S/)' },
    { value: 'USD', label: 'Dólares (US$)' },
  ];

  readonly filasLibro = computed<FilaLibro[]>(() =>
    this.estadoProto.asientosLibroDetalle().map((d) => ({
      id: d.id,
      asiento: d.codigo,
      ticket: d.ticketNum,
      kind: ASIENTO_TIPO_ES[d.tipo],
      cli: d.consumidor,
      plazo: d.venceOriginal,
      respuesta: d.respuesta ? 'Con respuesta' : 'Sin respuesta',
      detalle: d,
    })),
  );

  /** HU-015 CA-02: tickets activos de un tipo con Libro que no tienen asiento. */
  readonly huerfanosLibro = computed(() => {
    const conLibro = new Set(this.estadoProto.tiposTicket().filter((t) => t.libro && t.activo).map((t) => t.id));
    return ticketsHuerfanos(this.tickets(), conLibro, this.estadoProto.asientosLibroDetalle());
  });

  readonly paresAlertasLibro = computed<ParCardPairs[]>(() =>
    this.estadoProto.alertasLegalesLibro().map((a: AlertaLegalLibro) => ({
      clave: a.codigoAsiento + ' · ' + (a.tipo === 'LEGAL_RESPONSE_OVERDUE' ? 'Plazo vencido sin respuesta' : 'Vence en 3 días hábiles o menos'),
      valor:
        (a.restantes < 0 ? 'Venció el ' : 'Vence el ') + this.fmtDia(a.vencimientoEvaluado) +
        ' · Para: Responsable legal de reclamos (consola y correo)',
    })),
  );

  /* Registrar asiento (HU-012) */
  readonly registrandoAsiento = signal(false);
  readonly asIntento = signal(false);
  readonly asTicket = signal('');
  readonly asEstablecimiento = signal('');
  readonly asTipo = signal('RECLAMO');
  readonly asHechos = signal('');
  readonly asPedido = signal('');
  readonly asMonto = signal('');
  readonly asMoneda = signal('');
  readonly asErrores = computed(() =>
    validarAsiento({
      ticketNum: this.asTicket(),
      establecimiento: this.asEstablecimiento(),
      hechos: this.asHechos(),
      pedido: this.asPedido(),
      monto: this.asMonto(),
      moneda: this.asMoneda(),
    }),
  );
  /** Tickets de Queja o Reclamo que aún no tienen asiento: los demás nacen con su asiento desde «Nuevo ticket». */
  readonly opcionesTicketAsiento = computed<AyOpcionSelect[]>(() => [
    { value: '', label: this.huerfanosLibro().length ? 'Elige el ticket' : 'No hay tickets sin asiento' },
    ...this.huerfanosLibro().map((t) => ({ value: t.num, label: `${t.num} · ${t.cli}` })),
  ]);
  readonly ticketAsiento = computed(() => this.tickets().find((t) => t.num === this.asTicket()) ?? null);
  readonly empresaAsientoTexto = computed(() => {
    const t = this.ticketAsiento();
    if (!t) return 'Se toma del ticket';
    return EMPRESAS_AYBAR.find((e) => e.id === t.co)?.nombre ?? t.co;
  });
  readonly correlativoAsiento = computed(() => {
    const t = this.ticketAsiento();
    if (!t || !this.asEstablecimiento()) return 'Elige el ticket y el establecimiento';
    return siguienteCorrelativo(this.estadoProto.asientosLibroDetalle(), t.co, this.asEstablecimiento()).codigo;
  });

  /* Responder con carta y cargo (HU-014) */
  readonly respondiendo = signal<AsientoLibroDetalle | null>(null);
  readonly rpIntento = signal(false);
  readonly rpResumen = signal('');
  readonly rpCarta = signal<AyUploadFile | null>(null);
  readonly rpCargo = signal<AyUploadFile | null>(null);
  readonly rpDerecho = signal(false);
  readonly rpCartaLista = computed(() => (this.rpCarta() ? [this.rpCarta()!] : []));
  readonly rpCargoLista = computed(() => (this.rpCargo() ? [this.rpCargo()!] : []));
  readonly rpErrores = computed(() =>
    validarRespuesta({
      resumen: this.rpResumen(),
      carta: this.rpCarta()?.nombre ?? null,
      cargo: this.rpCargo()?.nombre ?? null,
      derechoIndecopi: this.rpDerecho(),
    }),
  );

  /* Ver asiento */
  readonly asientoVistoId = signal<string | null>(null);
  readonly asientoVisto = computed(() => this.estadoProto.asientosLibroDetalle().find((a) => a.id === this.asientoVistoId()) ?? null);
  readonly paresAsientoVisto = computed<ParCardPairs[]>(() => {
    const a = this.asientoVisto();
    if (!a) return [];
    const p = this.plazoLibro(a);
    const pares: ParCardPairs[] = [
      { clave: 'Establecimiento', valor: a.establecimiento },
      { clave: 'Ticket asociado', valor: a.ticketNum },
      { clave: 'Tipo', valor: ASIENTO_TIPO_ES[a.tipo] + ' · ' + this.montoTexto(a) },
      { clave: 'Consumidor', valor: a.consumidor + ' (DNI ' + a.dni + ')' },
      { clave: 'Registrado', valor: this.fmtDia(a.registrado) + ' por ' + a.registradoPor },
      { clave: 'Plazo legal', valor: 'Vence el ' + this.fmtDia(a.venceOriginal) + ' · ' + p.texto + ' · 15 d hábiles improrrogables' },
      { clave: 'Hechos', valor: a.hechos },
      { clave: 'Pedido', valor: a.pedido },
    ];
    if (a.respuesta) {
      const r = a.respuesta;
      pares.push(
        { clave: 'Respuesta', valor: this.fmtDia(r.fecha) + ' · ' + r.diasHabilesUsados + ' d hábiles · firmada por ' + r.firmante },
        { clave: 'Resumen de la respuesta', valor: r.resumen },
        { clave: 'Carta con sello', valor: r.cartaNombre + ' · SHA-256 ' + r.cartaSha256.slice(0, 16) + '…' },
        { clave: 'Cargo con sello', valor: r.cargoNombre + ' · SHA-256 ' + r.cargoSha256.slice(0, 16) + '…' },
        { clave: 'Derecho a INDECOPI', valor: r.derechoIndecopi ? 'Consta que se informó al consumidor' : 'No consta' },
      );
    }
    for (const ap of a.apelaciones) {
      pares.push({
        clave: 'Apelación ' + etiqueta(APELACION_INSTANCIA_ES, ap.instancia),
        valor: (ap.numeroCaso ?? 'Expediente por asignar') + ' · ' + (APELACION_ESTADO_ES[ap.estado] ?? ap.estado),
      });
    }
    return pares;
  });

  /** Una lista por combinación: el input de ay-dropdown-menu no debe cambiar entre ciclos de detección. */
  private readonly menuLibro: Record<string, AyMenuItem[]> = Object.fromEntries(
    [false, true].flatMap((puede) =>
      [false, true].flatMap((respondido) =>
        [false, true].map((conIndecopi) => [
          `${puede}${respondido}${conIndecopi}`,
          [
            { tipo: 'item', value: 'ver', label: 'Ver asiento' },
            { tipo: 'item', value: 'ticket', label: 'Ver ticket asociado' },
            {
              tipo: 'item',
              value: 'apelar',
              label: conIndecopi ? 'Apelación INDECOPI ya registrada' : 'Registrar apelación INDECOPI',
              disabled: !puede || !respondido || conIndecopi,
            },
          ] as AyMenuItem[],
        ]),
      ),
    ),
  );

  readonly tabSgd = signal<string>('casos');
  readonly tabsMesaSgd = computed<AyTabsElemento[]>(() => [
    { value: 'casos', label: 'Casos', contador: this.casosSgd().length },
    { value: 'limbo', label: 'En limbo', contador: 1 },
    { value: 'escalamientos', label: 'Escalamientos', contador: 2 },
  ]);

  readonly tabTorre = signal<string>('tablero');

  /** Pestañas de EntregaFest en vivo: los casos del evento y los buses con sus reservas. */
  readonly tabsEvento: AyTabsElemento[] = [
    { value: 'casos', label: 'Casos del evento' },
    { value: 'buses', label: 'Buses y reservas' },
  ];
  readonly tabEventoElegida = signal<string | null>(null);
  /** El cliente solo ve buses; la entrada «Buses» del menú abre su pestaña, y la de EntregaFest, los casos. */
  readonly tabEventoActiva = computed(() => {
    if (this.estadoProto.rolActivo() === 'CLIENTE') return 'buses';
    return this.tabEventoElegida() ?? (this.subvista() === 'buses' ? 'buses' : 'casos');
  });
  readonly tabsTorreCx: AyTabsElemento[] = [
    { value: 'tablero', label: 'Tablero' },
    { value: 'tigo', label: 'Impacto de Tigo' },
    { value: 'riesgo', label: 'Riesgo de denuncia' },
    { value: 'encuestas', label: 'Encuestas' },
    { value: 'informes', label: 'Informes' },
    { value: 'auditoria', label: 'Auditoría de datos' },
  ];

  /* ── Columnas de tablas ── */
  readonly columnasFlujosConfig: readonly AyColumna[] = [
    { clave: 'nombreTipo', cabecera: 'Tipo de ticket', ancho: '14rem', ordenable: true },
    { clave: 'area', cabecera: 'Área receptora', ancho: '9rem', ordenable: true },
    { clave: 'versionActual', cabecera: 'Versión', ancho: '6rem', ordenable: true },
    { clave: 'pasos', cabecera: 'Pasos y responsables' },
    { clave: 'accion', cabecera: 'Acción', alineacion: 'end', ancho: '7rem' },
  ];

  readonly columnasGuiasConfig: readonly AyColumna[] = [
    { clave: 'nombreTipo', cabecera: 'Tipo de ticket', ancho: '15rem', ordenable: true },
    { clave: 'versionActual', cabecera: 'Versión vigente', ancho: '9rem', ordenable: true },
    { clave: 'resumen', cabecera: 'Contenido publicado' },
    { clave: 'accion', cabecera: 'Acción', alineacion: 'end', ancho: '9rem' },
  ];

  readonly columnasAlertasAdmin: readonly AyColumna[] = [
    { clave: 'fecha', cabecera: 'Fecha', ancho: '9rem', ordenable: true },
    { clave: 'etiqueta', cabecera: 'Alerta', ancho: '15rem', ordenable: true },
    { clave: 'tipo', cabecera: 'Tipo', ancho: '7rem', ordenable: true },
    { clave: 'detalle', cabecera: 'Detalle', ordenable: true },
  ];

  readonly columnasPoliticasSla: readonly AyColumna[] = [
    { clave: 'id', cabecera: 'Política', ancho: '10rem', ordenable: true },
    { clave: 'alcance', cabecera: 'Alcance', ancho: '14rem', ordenable: true },
    { clave: 'tipoTicket', cabecera: 'Tipo y Prioridad', ordenable: true },
    { clave: 'respuestaH', cabecera: '1.ª respuesta', ancho: '8rem', ordenable: true },
    { clave: 'resolucionH', cabecera: 'Resolución', ancho: '8rem', ordenable: true },
    { clave: 'version', cabecera: 'Versión', ancho: '6rem', ordenable: true },
    { clave: 'accion', cabecera: 'Acción', alineacion: 'end', ancho: '7rem' },
  ];

  readonly columnasPreviewReasignar: readonly AyColumna[] = [
    { clave: 'num', cabecera: 'Ticket', ancho: '8rem', ordenable: true },
    { clave: 'summary', cabecera: 'Solicitud', ordenable: true },
    { clave: 'destino', cabecera: 'Pasará a', ancho: '11rem' },
  ];

  readonly columnasAlertasSla: readonly AyColumna[] = [
    { clave: 'ticketNum', cabecera: 'Ticket', ancho: '8rem', ordenable: true },
    { clave: 'tipo', cabecera: 'Tipo de incumplimiento', ordenable: true },
    { clave: 'ciclo', cabecera: 'Ciclo', ancho: '8rem', ordenable: true },
    { clave: 'vencimientoEvaluado', cabecera: 'Vencimiento evaluado', ancho: '10rem', ordenable: true },
    { clave: 'destinatario', cabecera: 'Destinatario y canal', ancho: '15rem', ordenable: true },
  ];

  readonly columnasCorridasJob: readonly AyColumna[] = [
    { clave: 'fecha', cabecera: 'Corrida', ancho: '10rem', ordenable: true },
    { clave: 'revisados', cabecera: 'Evaluados', ordenable: true },
    { clave: 'nuevasAlertas', cabecera: 'Resultado', ancho: '9rem', ordenable: true },
  ];

  readonly columnasCierreE2E: readonly AyColumna[] = [
    { clave: 'num', cabecera: 'Ticket y resumen', ordenable: true },
    { clave: 'eje', cabecera: 'Eje y objetivo', ancho: '10rem', ordenable: true },
    { clave: 'pct', cabecera: 'Horas hábiles consumidas', ancho: '16rem', ordenable: true },
    { clave: 'etiqueta', cabecera: 'Situación', ancho: '10rem', ordenable: true },
  ];

  readonly columnasLlamadasUrbeMind: readonly AyColumna[] = [
    { clave: 'operacion', cabecera: 'Operación y respuesta', ordenable: true },
    { clave: 'estadoHttp', cabecera: 'HTTP', ancho: '7rem', ordenable: true },
  ];

  readonly columnasEventosUrbeMind: readonly AyColumna[] = [
    { clave: 'tipo', cabecera: 'Evento', ancho: '13rem', ordenable: true },
    { clave: 'ticketNum', cabecera: 'Ticket', ancho: '8rem', ordenable: true },
    { clave: 'estado', cabecera: 'Entrega', ancho: '14rem', ordenable: true },
    { clave: 'error', cabecera: 'Detalle', ordenable: true },
  ];

  readonly columnasMorosidad5181: readonly AyColumna[] = [
    { clave: 'ticketNum', cabecera: 'Ticket', ancho: '8rem', ordenable: true },
    { clave: 'clienteNombre', cabecera: 'Cliente y Proyecto', ordenable: true },
    { clave: 'deuda', cabecera: 'Deuda vencida', ancho: '11rem', ordenable: true },
    { clave: 'estado', cabecera: 'Estado', ancho: '11rem', ordenable: true },
    { clave: 'carta', cabecera: 'Carta al responsable', ancho: '14rem', ordenable: true },
    { clave: 'accion', cabecera: 'Acciones', alineacion: 'end', ancho: '15rem' },
  ];

  readonly columnasReservasBus: readonly AyColumna[] = [
    { clave: 'clienteNombre', cabecera: 'Cliente convocado', ordenable: true },
    { clave: 'busId', cabecera: 'Bus y horario', ancho: '13rem', ordenable: true },
    { clave: 'punto', cabecera: 'Punto de embarque' },
    { clave: 'acompanantes', cabecera: 'Personas', ancho: '9rem', ordenable: true },
    { clave: 'estado', cabecera: 'Estado', ancho: '10rem', ordenable: true },
    { clave: 'accion', cabecera: 'Acción', alineacion: 'end', ancho: '9rem' },
  ];

  readonly columnasCasosEvento: readonly AyColumna[] = [
    { clave: 'codigo', cabecera: 'Caso', ancho: '8rem', ordenable: true },
    { clave: 'cliente', cabecera: 'Cliente / Proyecto', ordenable: true },
    { clave: 'etiqueta', cabecera: 'Etiqueta', ancho: '10rem' },
    { clave: 'riesgo', cabecera: 'Riesgo verbal y pasos', ancho: '12rem', ordenable: true },
    { clave: 'derivado', cabecera: '¿Derivado a Est. 4?', ancho: '9rem', ordenable: true },
    { clave: 'tema', cabecera: 'Tema', ancho: '8rem', ordenable: true },
    { clave: 'situacion', cabecera: 'Acciones', alineacion: 'end', ancho: '13rem' },
  ];

  /** Etiqueta estándar de todo caso del evento (HU-ATC-039 CA-01): se escribe literalmente así. */
  readonly etiquetaCasoEvento = 'Atención especial — derivación a Legal';

  readonly columnasEncuestasCx: readonly AyColumna[] = [
    { clave: 'ticketNum', cabecera: 'Ticket', ancho: '8rem', ordenable: true },
    { clave: 'gestor', cabecera: 'Gestor y Área', ancho: '13rem', ordenable: true },
    { clave: 'csat', cabecera: 'Calificación', ancho: '15rem', ordenable: true },
    { clave: 'comentario', cabecera: 'Comentario del cliente', ordenable: true },
  ];

  readonly columnasLibro: readonly AyColumna[] = [
    { clave: 'asiento', cabecera: 'Asiento del Libro', ancho: '11rem', ordenable: true },
    { clave: 'ticket', cabecera: 'Ticket', ancho: '8rem', ordenable: true },
    { clave: 'kind', cabecera: 'Tipo / Monto', ancho: '8rem', ordenable: true },
    { clave: 'cli', cabecera: 'Consumidor', ordenable: true },
    { clave: 'plazo', cabecera: 'Plazo legal', ancho: '10rem', ordenable: true },
    { clave: 'respuesta', cabecera: 'Respuesta', ancho: '10rem', ordenable: true },
    { clave: 'acciones', cabecera: 'Acciones', alineacion: 'end', ancho: '9rem' },
  ];

  readonly columnasHuerfanos: readonly AyColumna[] = [
    { clave: 'num', cabecera: 'Ticket', ancho: '9rem', ordenable: true },
    { clave: 'cli', cabecera: 'Cliente y asunto', ordenable: true },
    { clave: 'state', cabecera: 'Estado', ancho: '10rem', ordenable: true },
    { clave: 'acciones', cabecera: 'Acciones', alineacion: 'end', ancho: '16rem' },
  ];

  readonly columnasSgd: readonly AyColumna[] = [
    { clave: 'code', cabecera: 'Código SGD', ancho: '9rem', ordenable: true },
    { clave: 'line', cabecera: 'Línea / Cliente', ordenable: true },
    { clave: 'cargo', cabecera: 'Cargo Previo vs. Activación', ordenable: true },
    { clave: 'linked', cabecera: 'Vínculo Cruzado', ancho: '8rem', ordenable: true },
    { clave: 'estado', cabecera: 'Estado / Acciones GLI', alineacion: 'end', ancho: '14rem' },
  ];

  readonly columnasGarantias: readonly AyColumna[] = [
    { clave: 'id', cabecera: 'ID Garantía / Ticket', ancho: '11rem', ordenable: true },
    { clave: 'unit', cabecera: 'Unidad / Acta de Entrega', ordenable: true },
    { clave: 'type', cabecera: 'Rubro y Cobertura', ancho: '13rem', ordenable: true },
    { clave: 'insp', cabecera: 'Inspección Técnica', ancho: '13rem', ordenable: true },
    { clave: 'state', cabecera: 'Estado / Acciones Postventa', alineacion: 'end', ancho: '19rem' },
  ];

  /* ── Estado de edición de Workflow (Flujos y Guías) ── */
  readonly flujoEditando = signal<FlujoTipoConfig | null>(null);
  readonly editFlujoArea = signal<string>('ATC');
  readonly editFlujoPasos = signal<PasoFlujoConfig[]>([]);

  readonly guiaEditando = signal<GuiaTipoConfig | null>(null);
  readonly editGuiaPasosTxt = signal<string>('');
  readonly editGuiaPlantillasTxt = signal<string>('');
  readonly editGuiaCriteriosTxt = signal<string>('');

  readonly etiqueta = etiqueta;
  readonly eventoUmEs = EVENTO_URBEMIND_ES;
  readonly asientoTipoEs = ASIENTO_TIPO_ES;
  readonly apelacionEs = APELACION_INSTANCIA_ES;
  readonly cierreSgdEs = CIERRE_SGD_ES;
  readonly garantiaEs = GARANTIA_ESTADO_ES;
  readonly criticidadEs = CRITICIDAD_ES;

  areaEs(a: string): string {
    return etiqueta(AREA_ES, a);
  }

  nombrePrioridad(id: string): string {
    return PRIORIDADES_TICKET.find((p) => p.id === id)?.nombre ?? id;
  }

  readonly opcionesAreasSelect: AyOpcionSelect[] = opcionesDe(AREAS_ATC, AREA_ES);
  readonly opcionesResponsablesSelect: AyOpcionSelect[] = this.estadoProto.colaboradores.map((c) => ({
    value: c.nombre,
    label: `${c.nombre} (${etiqueta(AREA_ES, c.area)})`,
  }));

  /* ── Estado de edición de Políticas SLA ── */
  readonly politicaEditando = signal<PoliticaSlaConfig | null>(null);
  readonly editPolRespuestaH = signal<string>('2');
  readonly editPolResolucionH = signal<string>('48');

  /* ── Estado de Reasignar en bloque ── */
  readonly reasignarDe = signal<string>('C. Rojas');
  readonly reasignarMotivo = signal<string>('REASSIGNMENT_CESE');
  readonly reasignarA = signal<string>('M. Delgado (ATC)');
  readonly reasignarNota = signal<string>('Transferencia en bloque conservando compromiso SLA.');

  readonly opcionesOrigenReasignar = computed<AyOpcionSelect[]>(() => {
    const owners = Array.from(
      new Set(this.tickets().map((t) => t.owner).filter((x): x is string => Boolean(x))),
    );
    const base = owners.length ? owners : ['C. Rojas', 'R. Salazar', 'L. Ccahuana'];
    return base.map((o) => ({ value: o, label: o }));
  });

  readonly opcionesMotivoReasignar: AyOpcionSelect[] = [
    { value: 'REASSIGNMENT_CESE', label: 'Cese del colaborador' },
    { value: 'REASSIGNMENT_ROTACION', label: 'Rotación de puesto' },
    { value: 'REASSIGNMENT_CARGA', label: 'Balanceo por carga o licencia' },
  ];

  readonly opcionesDestinoReasignar: AyOpcionSelect[] = [
    { value: 'M. Delgado (ATC)', label: 'M. Delgado (ATC · menor carga activa)' },
    { value: 'Lucía Benavides', label: 'Lucía Benavides (ATC)' },
    { value: 'Diego Salazar', label: 'Diego Salazar (Cobranza)' },
  ];

  readonly ticketsDeColaboradorSaliente = computed(() =>
    this.tickets().filter((t) => t.owner === this.reasignarDe() && t.state !== 'CLOSED'),
  );

  /* ── Estado de Cierre E2E ── */

  readonly filasCierreE2E = computed(() =>
    this.tickets().map((t) => {
      const limite = t.eje === 3 ? 90 : 72;
      const horas = Math.max(
        4,
        Math.round(((AHORA_BASE.getTime() - t.opened.getTime()) / 3600000) * 10) / 10,
      );
      const pct = Math.min(100, Math.round((horas / limite) * 100));
      const tono: 'success' | 'brand' | 'warning' | 'danger' =
        t.state === 'CLOSED' || t.state === 'RESOLVED'
          ? 'success'
          : pct >= 100
            ? 'danger'
            : pct >= 80
              ? 'warning'
              : 'brand';
      const etiqueta =
        t.state === 'CLOSED' || t.state === 'RESOLVED'
          ? 'Cerrado en plazo'
          : pct >= 100
            ? 'Fuera de plazo'
            : pct >= 80
              ? 'Por vencer (≥ 80 %)'
              : 'En plazo';
      return { ticket: t, num: t.num, eje: t.eje, horas, limite, pct, tono, etiqueta };
    }),
  );

  readonly filtrosCierre = crearFiltrosTabla(
    this.filasCierreE2E,
    {
      clave: 'cierre-e2e',
      etiquetaElemento: 'tickets',
      etiquetaBusqueda: 'Buscar ticket, cliente o gestor',
      placeholderBusqueda: 'N.º ticket, resumen, cliente, área o gestor…',
      textoDe: (r) =>
        [r.ticket.num, r.ticket.summary, r.ticket.cli, r.ticket.area, r.ticket.owner ?? '', r.ticket.type].join(' '),
      filtros: [
        {
          id: 'situacion',
          etiqueta: 'Situación',
          tipo: 'multi',
          valorDe: (r) => r.etiqueta,
          opciones: [
            { valor: 'En plazo', etiqueta: 'En plazo' },
            { valor: 'Por vencer (≥ 80 %)', etiqueta: 'Por vencer (≥ 80 %)' },
            { valor: 'Fuera de plazo', etiqueta: 'Fuera de plazo' },
            { valor: 'Cerrado en plazo', etiqueta: 'Cerrado en plazo' },
          ],
        },
        {
          id: 'eje',
          etiqueta: 'Eje',
          tipo: 'multi',
          valorDe: (r) => `Eje ${r.ticket.eje}`,
          opciones: [
            { valor: 'Eje 1', etiqueta: 'Eje 1 (72 h)' },
            { valor: 'Eje 2', etiqueta: 'Eje 2 (72 h)' },
            { valor: 'Eje 3', etiqueta: 'Eje 3 (90 h)' },
          ],
        },
      ],
    },
    inject(EstadoFiltrosTablas),
  );

  /* ── Estado de UrbeMind ── */
  readonly umOperacion = signal<string>('POST /api/v1/urbemind/tickets (Crear ticket)');
  readonly umAlcance = signal<string>('tickets:read tickets:write tickets:interact');

  readonly opcionesOperacionUrbeMind: AyOpcionSelect[] = [
    { value: 'GET /api/v1/urbemind/tickets/AIN-000482', label: 'Consultar ticket (requiere tickets:read)' },
    { value: 'POST /api/v1/urbemind/tickets (Crear ticket)', label: 'Crear ticket (requiere tickets:write)' },
    {
      value: 'POST /api/v1/urbemind/tickets/AIN-000482/interactions',
      label: 'Registrar interacción (requiere tickets:interact)',
    },
    {
      value: 'PATCH /api/v1/urbemind/tickets/AIN-000482/status',
      label: 'Cambiar estado (requiere tickets:status)',
    },
  ];

  readonly opcionesAlcanceUrbeMind: AyOpcionSelect[] = [
    {
      value: 'tickets:read tickets:write tickets:interact',
      label: 'Token estándar UrbeMind (read + write + interact)',
    },
    {
      value: 'tickets:read tickets:write tickets:interact tickets:status',
      label: 'Token completo con cambio de estado (incluye tickets:status)',
    },
    { value: 'sin-alcance', label: 'Token sin alcances de integración (prueba 403)' },
  ];

  /* ── Estado de Morosidad, Ingreso, Buses y Evento ── */
  readonly moraSeleccionada = signal<CasoResolucionMoraDetalle | null>(
    this.estadoProto.casosResolucionMora()[0] ?? null,
  );

  readonly nuevoAsistenteNombre = signal<string>('');
  readonly nuevoAsistenteDni = signal<string>('');
  readonly nuevoAsistenteTelefono = signal<string>('+51 988 112 233');
  readonly nuevoAsistenteMotivo = signal<string>('Conocer mi lote / Visita de propietario');
  readonly nuevoAsistenteProyecto = signal<string>('Villa Sol · Etapa II');
  readonly nuevoAsistenteLote = signal<string>('');
  readonly nuevoAsistentePlaca = signal<string>('');
  readonly confirmandoIngreso = signal(false);

  /** Fecha y hora del ingreso: las pone el sistema (HU-ATC-059), no se escriben. */
  readonly fechaHoraIngreso = computed(() => fmtFechaHora(AHORA_BASE));
  readonly errorDniIngreso = computed(() => {
    const dni = this.nuevoAsistenteDni().trim();
    return dni && !/^\d{8}$/.test(dni) ? 'El DNI debe tener 8 dígitos.' : undefined;
  });
  /** Faltan datos obligatorios o la placa no es válida. */
  readonly ingresoValido = computed(
    () =>
      !!this.nuevoAsistenteNombre().trim() &&
      /^\d{8}$/.test(this.nuevoAsistenteDni().trim()) &&
      !!this.nuevoAsistenteTelefono().trim() &&
      !!this.nuevoAsistenteLote().trim() &&
      !this.errorPlaca(),
  );

  /** Red del celular en la garita: sin conexión el ingreso se guarda y se envía al recuperarla (HU-ATC-059 CA-03). */
  readonly enLinea = signal<boolean>(globalThis.navigator?.onLine ?? true);
  readonly ingresosPendientes = signal<IngresoPendiente[]>([]);
  readonly nombresPendientes = computed(() => this.ingresosPendientes().map((p) => p.nombre).join(', '));
  private readonly destruir = inject(DestroyRef);
  private readonly escucharRed = (() => {
    const ventana = globalThis as unknown as Window;
    if (typeof ventana.addEventListener !== 'function') return;
    const alRecuperar = (): void => {
      this.enLinea.set(true);
      this.enviarIngresosPendientes();
    };
    const alPerder = (): void => this.enLinea.set(false);
    ventana.addEventListener('online', alRecuperar);
    ventana.addEventListener('offline', alPerder);
    this.destruir.onDestroy(() => {
      ventana.removeEventListener('online', alRecuperar);
      ventana.removeEventListener('offline', alPerder);
    });
  })();

  /** Responsable de cada proyecto en el maestro; `null` si el proyecto no tiene (HU-ATC-059 CA-01). */
  private readonly responsablePorProyecto: Readonly<Record<string, string | null>> = {
    'Villa Sol · Etapa II': 'Lucía Benavides',
    'Los Álamos de Carabayllo': 'Diego Salazar',
    'Mirador del Sur': 'Nelly Quispe',
    'Praderas de Lurín (sin responsable en maestro)': null,
  };
  readonly placaNormalizada = computed(() => normalizarPlaca(this.nuevoAsistentePlaca()));
  readonly errorPlaca = computed(() =>
    placaValida(this.nuevoAsistentePlaca()) ? undefined : 'Formato de placa no válido. Ejemplo: ABC-123',
  );
  readonly placaRepetidaHoy = computed(() => {
    const p = this.placaNormalizada();
    return !!p && this.asistentes().some((a) => a.placa === p);
  });

  readonly opcionesMotivoVisita: AyOpcionSelect[] = [
    { value: 'Conocer mi lote / Visita de propietario', label: 'Conocer mi lote / Visita de propietario' },
    { value: 'Firma de Acta de Entrega', label: 'Firma de Acta de Entrega' },
    { value: 'Inspección postventa', label: 'Inspección postventa' },
    { value: 'Consulta comercial (visitante nuevo)', label: 'Consulta comercial (visitante nuevo)' },
  ];

  readonly opcionesProyectoVisita: AyOpcionSelect[] = [
    { value: 'Villa Sol · Etapa II', label: 'Villa Sol · Etapa II (Resp: Lucía Benavides)' },
    { value: 'Los Álamos de Carabayllo', label: 'Los Álamos de Carabayllo (Resp: Diego Salazar)' },
    { value: 'Mirador del Sur', label: 'Mirador del Sur (Resp: Nelly Quispe)' },
    { value: 'Praderas de Lurín (sin responsable en maestro)', label: 'Praderas de Lurín (sin responsable en maestro)' },
  ];

  readonly formBusId = signal<string>('bus-1');
  readonly formBusPunto = signal<string>('San Isidro · Av. Javier Prado Este 492');
  readonly formBusAcompanantes = signal<string>('1');

  readonly opcionesBusesSelect = computed<AyOpcionSelect[]>(() =>
    this.estadoProto.busesFest.map((b) => ({
      value: b.id,
      label: `${b.nombre} · ${this.cuposLibresBus(b.id)} libres`,
    })),
  );

  readonly opcionesPuntosEmbarque: AyOpcionSelect[] = this.estadoProto.puntosEmbarqueFest.map((p) => ({
    value: p,
    label: p,
  }));

  readonly opcionesAcompanantesBus: AyOpcionSelect[] = [
    { value: '0', label: 'Sin acompañantes (solo titular)' },
    { value: '1', label: '1 acompañante (2 personas)' },
    { value: '2', label: '2 acompañantes (3 personas)' },
    { value: '3', label: '3 acompañantes (4 personas)' },
  ];

  readonly riesgoAutoridad = signal<boolean>(true);
  readonly riesgoCartaNotarial = signal<boolean>(true);
  readonly riesgoCuantioso = signal<boolean>(false);
  readonly textoEvento = signal<string>('');

  readonly capitalControversia = signal<number>(18500);
  readonly capitalControversiaStr = computed(() => String(this.capitalControversia()));

  readonly puntajeRiesgo = computed(
    () =>
      (this.riesgoAutoridad() ? 40 : 0) +
      (this.riesgoCartaNotarial() ? 30 : 0) +
      (this.riesgoCuantioso() ? 25 : 0),
  );

  /** Palabras de riesgo muy alto (RN-SVC-029): obligan a derivar de inmediato a la Estación 4. */
  readonly imputacionPenalDetectada = computed(() => {
    const t = this.textoEvento().toLowerCase();
    return ['estafa', 'fraude', 'abuso', 'delito'].some((w) => t.includes(w));
  });

  /** Caso del evento abierto: la contención, el registro y el cierre del tema son de un caso (G2: «caso EF-001»). */
  readonly casoAbiertoId = signal<string | null>(null);
  readonly casoAbierto = computed(
    () => this.estadoProto.casosEventoFest().find((c) => c.id === this.casoAbiertoId()) ?? null,
  );
  /** Resumen que se escribe al completar el registro del caso abierto. */
  readonly resumenEdicion = signal<string>('');
  /** Por qué no se puede reabrir un caso derivado (HU-ATC-038 CA-02). */
  readonly reaperturaBloqueada = signal<string | null>(null);
  /** El paso 3 (Frase 6) exige el registro completo del caso para cerrar el tema en sala (HU-ATC-037 CA-02). */
  readonly puedeCerrarTema = computed(() => {
    const c = this.casoAbierto();
    if (!c || c.tema === 'CERRADO') return false;
    const hayIntervencion = c.frases.length > 0 || !!c.estacion4;
    return hayIntervencion && (!c.frases.includes(6) || c.registroCompleto);
  });
  /** Reserva que no entró por falta de cupo: se ofrece otro bus u horario o la lista de espera (HU-ATC-060 CA-02). */
  readonly ofertaSinCupo = signal<{ busId: string; acompanantes: number; punto: string } | null>(null);
  /** Buses que sí tienen cupo para la reserva que no entró. */
  readonly busesConCupo = computed(() => {
    const o = this.ofertaSinCupo();
    if (!o) return [];
    return this.estadoProto.busesFest.filter((b) => b.id !== o.busId && this.cuposLibresBus(b.id) >= 1 + o.acompanantes);
  });

  readonly paresImpactoLegal = computed<ParCardPairs[]>(() => {
    const cap = this.capitalControversia();
    return [
      {
        clave: 'Resolución en Eje 1 / Conciliación temprana',
        valor: `S/ ${cap.toFixed(2)} (Ahorro 100% sobrecosto)`,
      },
      {
        clave: 'Proyección en caso de denuncia (+8% interés legal)',
        valor: `S/ ${(cap * 1.08).toFixed(2)} (+S/ ${(cap * 0.08).toFixed(2)} de recargo)`,
      },
    ];
  });

  /* ── Helpers de cast para шаблоны ── */
  comoFlujo(f: unknown): FlujoTipoConfig {
    return f as FlujoTipoConfig;
  }
  comoGuia(g: unknown): GuiaTipoConfig {
    return g as GuiaTipoConfig;
  }
  comoAlertaAdmin(a: unknown): AlertaAdminConfig {
    return a as AlertaAdminConfig;
  }
  comoPolitica(p: unknown): PoliticaSlaConfig {
    return p as PoliticaSlaConfig;
  }
  comoTicket(t: unknown): TicketAtc {
    return t as TicketAtc;
  }
  comoAlertaSla(a: unknown): AlertaSlaItem {
    return a as AlertaSlaItem;
  }
  comoCorridaJob(c: unknown): CorridaJobSla {
    return c as CorridaJobSla;
  }
  comoFilaCierre(r: unknown): {
    ticket: TicketAtc;
    horas: number;
    limite: number;
    pct: number;
    tono: 'success' | 'brand' | 'warning' | 'danger';
    etiqueta: string;
  } {
    return r as {
      ticket: TicketAtc;
      horas: number;
      limite: number;
      pct: number;
      tono: 'success' | 'brand' | 'warning' | 'danger';
      etiqueta: string;
    };
  }
  comoLlamadaUm(l: unknown): LlamadaUrbeMindItem {
    return l as LlamadaUrbeMindItem;
  }
  comoEventoUm(e: unknown): EventoUrbeMindItem {
    return e as EventoUrbeMindItem;
  }
  comoMoraDetalle(m: unknown): CasoResolucionMoraDetalle {
    return m as CasoResolucionMoraDetalle;
  }
  comoReservaBus(r: unknown): ReservaBusFestItem {
    return r as ReservaBusFestItem;
  }
  comoCasoEvento(c: unknown): CasoEventoFestItem {
    return c as CasoEventoFestItem;
  }
  comoEncuesta(e: unknown): EncuestaCxItem {
    return e as EncuestaCxItem;
  }
  comoFilaLibro(fila: unknown): FilaLibro {
    return fila as FilaLibro;
  }
  comoSgd(fila: unknown): CasoSgd {
    return fila as CasoSgd;
  }
  comoGarantia(fila: unknown): ReclamoGarantia {
    return fila as ReclamoGarantia;
  }

  fmtDia(d: Date): string {
    return fmtFecha(d);
  }

  fmtHora(d: Date): string {
    return fmtFechaHora(d);
  }

  resumenPasosFlujo(f: FlujoTipoConfig): string {
    return f.pasos.map((p, i) => `${i + 1}. ${p.nombre} (${p.responsable}, ${p.horas} h)`).join(' → ');
  }

  /* ── Acciones de Workflow (Flujos y Guías) ── */
  abrirEditorFlujo(f: FlujoTipoConfig): void {
    this.flujoEditando.set(f);
    this.editFlujoArea.set(f.area);
    this.editFlujoPasos.set(f.pasos.map((p) => ({ ...p })));
  }

  actualizarPasoFlujo(idx: number, campo: 'nombre' | 'responsable' | 'horas', valor: string): void {
    this.editFlujoPasos.update((lista) =>
      lista.map((p, i) =>
        i !== idx
          ? p
          : {
              ...p,
              [campo]: campo === 'horas' ? Math.max(1, Number(valor) || 1) : valor,
            },
      ),
    );
  }

  cambiarPasoFlujo(c: CambioPaso): void {
    this.actualizarPasoFlujo(c.idx, c.campo, c.valor);
  }

  agregarPasoFlujo(): void {
    this.editFlujoPasos.update((prev) => [
      ...prev,
      { nombre: 'Revisión y cierre', responsable: 'Lucía Benavides', horas: 8 },
    ]);
  }

  quitarPasoFlujo(idx: number): void {
    this.editFlujoPasos.update((prev) => prev.filter((_, i) => i !== idx));
  }

  guardarFlujoConfig(): void {
    const fl = this.flujoEditando();
    if (!fl) return;
    const nuevo = this.estadoProto.publicarVersionFlujo(
      fl.tipo,
      this.editFlujoArea(),
      this.editFlujoPasos(),
      fl.subtipo,
    );
    this.flujoEditando.set(null);
    this.avisoOperacion.set(
      `Flujo de «${this.estadoProto.etiquetaFlujo(nuevo)}» actualizado a v${nuevo.versionActual} (Área: ${etiqueta(AREA_ES, nuevo.area)}). Los nuevos tickets en «Nuevo ticket» aplicarán esta versión.`,
    );
  }

  abrirEditorGuia(g: GuiaTipoConfig): void {
    this.guiaEditando.set(g);
    this.editGuiaPasosTxt.set(
      g.pasos.length
        ? g.pasos.join('\n')
        : '1. Verificar solicitud y contrato en Consulta 360.\n2. Coordinar atención y responder al cliente.',
    );
    this.editGuiaPlantillasTxt.set(
      g.plantillas.length
        ? g.plantillas.join('\n')
        : 'Hola, atendimos tu solicitud «{resumen}» y dejamos constancia en Mi Portal.',
    );
    this.editGuiaCriteriosTxt.set(
      g.criterios.length ? g.criterios.join('\n') : 'Constancia enviada y registrada en el ticket.',
    );
  }

  guardarGuiaConfig(): void {
    const gu = this.guiaEditando();
    if (!gu) return;
    const pasos = this.editGuiaPasosTxt()
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const plantillas = this.editGuiaPlantillasTxt()
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const criterios = this.editGuiaCriteriosTxt()
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const ver = this.estadoProto.publicarVersionGuia(gu.tipo, pasos, plantillas, criterios);
    this.guiaEditando.set(null);
    this.avisoOperacion.set(
      `Guía de «${gu.nombreTipo}» publicada en versión v${ver}. Ya está disponible en el Detalle del Ticket y en el Asistente de IA.`,
    );
  }

  /* ── Acciones de Políticas SLA ── */
  abrirEditorPolitica(p: PoliticaSlaConfig): void {
    this.politicaEditando.set(p);
    this.editPolRespuestaH.set(String(p.respuestaH));
    this.editPolResolucionH.set(String(p.resolucionH));
  }

  guardarPoliticaSla(): void {
    const pol = this.politicaEditando();
    if (!pol) return;
    const resp = Math.max(0.25, Number(this.editPolRespuestaH()) || pol.respuestaH);
    const res = Math.max(1, Number(this.editPolResolucionH()) || pol.resolucionH);
    const act = this.estadoProto.actualizarPoliticaSla(pol.id, resp, res);
    this.politicaEditando.set(null);
    if (act) {
      this.avisoOperacion.set(
        `Política ${act.id} actualizada a v${act.version} (${act.respuestaH} h resp. / ${act.resolucionH} h resol.). Afecta inmediatamente a los nuevos tickets.`,
      );
    }
  }

  /* ── Acciones de Reasignar en bloque ── */
  ejecutarReasignacionEnBloque(): void {
    const salientes = this.ticketsDeColaboradorSaliente();
    const destino = this.reasignarA();
    const motivo = this.reasignarMotivo();
    const nota = this.reasignarNota();
    salientes.forEach((t) => {
      t.owner = destino;
      t.log.push({
        fecha: AHORA_BASE,
        area: t.area,
        responsable: destino,
        motivo,
        nota,
      });
    });
    this.avisoOperacion.set(
      `${salientes.length} ticket(s) reasignados a ${destino} sin reiniciar su SLA.`,
    );
  }

  /* ── Acciones de Alertas SLA ── */
  contarAlertasSla(tipo: AlertaSlaItem['tipo']): number {
    return this.estadoProto.alertasSla().filter((a) => a.tipo === tipo).length;
  }

  nombreAlertaSla(tipo: AlertaSlaItem['tipo']): string {
    return etiqueta(ALERTA_SLA_ES, tipo);
  }

  correrJobSlaAhora(): void {
    const nuevas = this.estadoProto.ejecutarJobSlaManual(this.tickets().length);
    this.avisoOperacion.set(
      `Job de alertas SLA ejecutado: ${this.tickets().length} tickets evaluados (${nuevas} alerta nueva).`,
    );
  }

  /* ── Acciones de UrbeMind ── */
  ejecutarSimulacionUrbeMind(): void {
    const op = this.umOperacion();
    const alc = this.umAlcance();
    const requiereStatus = op.includes('/status');
    const permitido =
      alc !== 'sin-alcance' && (!requiereStatus || alc.includes('tickets:status'));
    const estadoHttp = permitido ? (op.startsWith('POST /api/v1/urbemind/tickets (') ? 201 : 200) : 403;
    const detalle = permitido
      ? 'Operación ejecutada dentro del contrato OAuth2 de UrbeMind.'
      : '403 Forbidden · el token no posee el alcance requerido para esta operación.';
    this.estadoProto.llamadasUrbeMind.update((prev) => [
      {
        id: `um-${Date.now()}`,
        fecha: AHORA_BASE,
        operacion: op,
        llamante: 'Servicio UrbeMind',
        alcance: alc,
        estadoHttp,
        detalle,
      },
      ...prev,
    ]);
  }

  reintentarWebhooksUrbeMind(): void {
    this.estadoProto.eventosUrbeMind.update((lista) =>
      lista.map((e) =>
        e.estado === 'PENDIENTE_REINTENTO'
          ? { ...e, estado: 'ENTREGADO', intentos: e.intentos + 1, error: null }
          : e,
      ),
    );
    this.avisoOperacion.set('Eventos pendientes reenviados y confirmados (ACK 200 OK).');
  }

  /* ── Acciones de Morosidad ── */
  contextoMora(mc: CasoResolucionMoraDetalle) {
    return evaluarContextoMorosidad(mc.cuotasImpagas);
  }

  contarMorosidadEstado(est: CasoResolucionMoraDetalle['estado']): number {
    return this.estadoProto.casosResolucionMora().filter((c) => c.estado === est).length;
  }

  registrarAccionResponsableMora(mc: CasoResolucionMoraDetalle): void {
    mc.carta.accion = {
      nota: 'Se contactó al titular y se acordó cronograma de regularización en 48 h.',
      autor: this.estadoProto.perfilActivo().nombre,
      fecha: AHORA_BASE,
    };
    mc.historial.push({
      id: `hm-${Date.now()}`,
      fecha: AHORA_BASE,
      estado: 'Con acción del responsable',
      nota: mc.carta.accion.nota,
      autor: this.estadoProto.perfilActivo().nombre,
    });
    this.avisoOperacion.set(`Acción registrada en el caso de resolución ${mc.ticketNum}.`);
  }

  registrarPagoRegularizacionMora(mc: CasoResolucionMoraDetalle): void {
    mc.estado = 'REGULARIZADO';
    mc.historial.push({
      id: `hm-${Date.now()}`,
      fecha: AHORA_BASE,
      estado: 'Regularizado',
      nota: 'Pago de las cuotas vencidas confirmado: el ticket se cierra y se detienen alertas.',
      autor: this.estadoProto.perfilActivo().nombre,
    });
    this.avisoOperacion.set(
      `Caso ${mc.ticketNum} regularizado: se detuvieron las alertas y el proceso de resolución.`,
    );
  }

  /* ── Acciones de Ingreso a proyecto ── */
  /** Con placa informada abre la confirmación; sin placa registra de inmediato. */
  solicitarIngresoProyecto(): void {
    if (!this.ingresoValido()) return;
    if (this.placaNormalizada()) this.confirmandoIngreso.set(true);
    else this.registrarIngresoProyecto();
  }

  /** Registra el ingreso: con conexión crea el ticket; sin ella lo guarda en el celular (HU-ATC-059 CA-03). */
  registrarIngresoProyecto(): void {
    if (!this.ingresoValido()) return;
    const datos: IngresoPendiente = {
      nombre: this.nuevoAsistenteNombre().trim(),
      dni: this.nuevoAsistenteDni().trim(),
      telefono: this.nuevoAsistenteTelefono().trim(),
      motivo: this.nuevoAsistenteMotivo(),
      lote: this.nuevoAsistenteLote().trim(),
      proyecto: this.nuevoAsistenteProyecto(),
      placa: this.placaNormalizada() || undefined,
    };
    this.nuevoAsistenteNombre.set('');
    this.nuevoAsistenteDni.set('');
    this.nuevoAsistenteLote.set('');
    this.nuevoAsistentePlaca.set('');
    this.confirmandoIngreso.set(false);
    if (!this.enLinea()) {
      this.ingresosPendientes.update((prev) => [...prev, datos]);
      this.avisoOperacion.set(
        `Sin conexión: el ingreso de ${datos.nombre} quedó guardado en el celular y se enviará al recuperarla.`,
      );
      return;
    }
    this.crearIngreso(datos);
  }

  /** Al recuperar la conexión se envían, en orden, los ingresos guardados en el celular. */
  private enviarIngresosPendientes(): void {
    const pendientes = this.ingresosPendientes();
    if (pendientes.length === 0) return;
    this.ingresosPendientes.set([]);
    pendientes.forEach((p) => this.crearIngreso(p));
    this.avisoOperacion.set(
      `Conexión recuperada: se enviaron ${pendientes.length} ${pendientes.length === 1 ? 'ingreso guardado' : 'ingresos guardados'} en el celular y se crearon sus tickets.`,
    );
  }

  /**
   * Crea el ticket «Ingreso a proyecto» asignado al responsable del proyecto (HU-ATC-059 CA-01); si el DNI es de
   * un cliente, lo vincula a su ficha y a su lote (CA-02). Los interesados, contratistas y proveedores quedan sin vincular.
   */
  private crearIngreso(datos: IngresoPendiente): void {
    const cliente = CLIENTES_360.find((c) => c.dni === datos.dni);
    const responsable = this.responsablePorProyecto[datos.proyecto] ?? null;
    if (responsable === null) {
      this.estadoProto.alertasAdmin.update((prev) => [
        {
          id: `adm-proy-${Date.now()}`,
          fecha: AHORA_BASE,
          codigo: 'PROYECTO_SIN_RESPONSABLE',
          etiqueta: 'Proyecto sin responsable en el maestro',
          tipoTicket: 'ING',
          detalle: `Se registró un ingreso para «${datos.proyecto}» y el ticket quedó en la cola de ATC por falta de responsable en el maestro.`,
        },
        ...prev,
      ]);
    }
    const num = this.siguienteNumeroTicket();
    const proyecto = cliente
      ? `${cliente.proyecto} · Lote ${cliente.lotes[0] ?? datos.lote}`
      : `${datos.proyecto} · ${datos.lote}`;
    const resumen = `Ingreso al proyecto «${datos.proyecto}»: ${datos.motivo}`;
    this.ticketNuevo.emit(
      crearTicketInicial(
        num, 'AIN', 'Lotes urbanos', 'Presencial / Caseta',
        cliente ? cliente.nombre : `${datos.nombre} (sin vincular)`,
        datos.dni, proyecto, 'ING', 'LOW', 'OPEN', 'ATC', responsable, 0, resumen,
        {
          emotion: '',
          interactions: [
            {
              tipo: 'cli',
              fecha: AHORA_BASE,
              canal: 'Presencial / Caseta',
              autor: datos.nombre,
              texto: `${resumen}. Lote o área: ${datos.lote}. Teléfono: ${datos.telefono}.${datos.placa ? ` Vehículo: ${datos.placa}.` : ''}`,
            },
          ],
          log: [
            {
              fecha: AHORA_BASE,
              area: 'ATC',
              responsable: responsable ?? '',
              motivo: 'ALTA',
              nota: cliente
                ? 'Ingreso registrado en garita; vinculado a la ficha y al lote del cliente.'
                : 'Ingreso registrado en garita; sin cliente vinculado.',
            },
          ],
        },
      ),
    );
    this.ingresoRegistrado.emit({
      id: `ING-0${this.asistentes().length + 1}`,
      nombre: datos.nombre,
      dni: datos.dni,
      proyecto: datos.proyecto,
      lote: datos.lote,
      acompanantes: 0,
      hora: AHORA_BASE.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false }),
      placa: datos.placa,
      ticket: num,
      vinculado: !!cliente,
    });
    this.avisoOperacion.set(
      `Ingreso de ${datos.nombre} registrado: ticket ${num}${cliente ? ` vinculado a su ficha y a su lote ${cliente.lotes[0] ?? ''}` : ' sin cliente vinculado'}. ${responsable ? `Se notificó a ${responsable}, responsable del proyecto` : 'El proyecto no tiene responsable: quedó en la cola de ATC'}.`,
    );
  }

  /** Siguiente número libre de ticket de la razón social AIN. */
  private siguienteNumeroTicket(): string {
    const ultimo = Math.max(
      0,
      ...this.tickets()
        .filter((t) => t.num.startsWith('AIN-'))
        .map((t) => Number(t.num.slice(4)) || 0),
    );
    return `AIN-${String(ultimo + 1).padStart(6, '0')}`;
  }

  /* ── Acciones de Buses del Entrega Fest ── */
  cuposLibresBus(busId: string): number {
    const bus = this.estadoProto.busesFest.find((b) => b.id === busId);
    if (!bus) return 0;
    const ocupados = this.estadoProto
      .reservasBusFest()
      .filter((r) => r.busId === busId && r.estado === 'CONFIRMADA')
      .reduce((acc, r) => acc + 1 + r.acompanantes, 0);
    return Math.max(0, bus.aforo - ocupados);
  }

  nombreBus(busId: string): string {
    return this.estadoProto.busesFest.find((b) => b.id === busId)?.nombre ?? busId;
  }

  confirmarReservaBusCliente(): void {
    const busId = this.formBusId();
    const acompanantes = Number(this.formBusAcompanantes()) || 0;
    if (this.cuposLibresBus(busId) >= 1 + acompanantes) {
      this.crearReservaBus(busId, acompanantes, this.formBusPunto(), 'CONFIRMADA');
      return;
    }
    this.ofertaSinCupo.set({ busId, acompanantes, punto: this.formBusPunto() });
  }

  /** Elige otro bus u horario con cupo para la misma reserva. */
  reservarEnOtroBus(busId: string): void {
    const o = this.ofertaSinCupo();
    if (!o) return;
    this.ofertaSinCupo.set(null);
    this.crearReservaBus(busId, o.acompanantes, o.punto, 'CONFIRMADA');
  }

  entrarListaEspera(): void {
    const o = this.ofertaSinCupo();
    if (!o) return;
    this.ofertaSinCupo.set(null);
    this.crearReservaBus(o.busId, o.acompanantes, o.punto, 'EN_ESPERA');
  }

  /** Genera el ticket de la reserva (HU-ATC-060 CA-01) y la registra; la confirmación sale por WhatsApp o correo. */
  private crearReservaBus(
    busId: string,
    acompanantes: number,
    punto: string,
    estado: 'CONFIRMADA' | 'EN_ESPERA',
  ): void {
    const bus = this.estadoProto.busesFest.find((b) => b.id === busId);
    const nombreBus = bus?.nombre ?? busId;
    const cliente = this.estadoProto.perfilActivo().nombre;
    const num = this.siguienteNumeroTicket();
    const resumen = `Reserva de cupo en ${nombreBus} para ${1 + acompanantes} personas${estado === 'EN_ESPERA' ? ' (en lista de espera)' : ''}`;
    this.ticketNuevo.emit(
      crearTicketInicial(num, 'AIN', 'Lotes urbanos', 'Mi Portal', cliente, '4412••••', 'Villa Sol II · Mz. C Lt. 07', 'BUS', 'LOW', 'OPEN', 'ATC', null, 0, resumen, {
        emotion: '',
        interactions: [{ tipo: 'cli', fecha: AHORA_BASE, canal: 'Mi Portal', autor: cliente, texto: resumen }],
      }),
    );
    const nueva: ReservaBusFestItem = {
      id: `res-${Date.now()}`,
      clienteId: 'cli-nuevo',
      clienteNombre: cliente,
      busId,
      punto,
      acompanantes,
      estado,
      ticketNum: num,
      fecha: AHORA_BASE,
    };
    this.estadoProto.reservasBusFest.update((prev) => [nueva, ...prev]);
    this.avisoOperacion.set(
      estado === 'CONFIRMADA'
        ? `Reserva confirmada: ${nombreBus}, ${1 + acompanantes} personas, embarque en ${punto} a las ${bus?.horario ?? ''}. Ticket ${num}. La confirmación se envía por WhatsApp o correo.`
        : `${nombreBus} no tenía cupo: quedaste en la lista de espera. Ticket ${num}. Te confirmaremos por WhatsApp o correo si se libera cupo.`,
    );
  }

  /** Cancela la reserva, libera el cupo y confirma al primero de la lista de espera de ese bus que entre (HU-ATC-060 CA-03). */
  cancelarReservaBus(r: ReservaBusFestItem): void {
    const habiaCupo = r.estado === 'CONFIRMADA';
    this.estadoProto.reservasBusFest.update((lista) =>
      lista.map((item) => (item.id === r.id ? { ...item, estado: 'CANCELADA' } : item)),
    );
    let promovido: ReservaBusFestItem | null = null;
    if (habiaCupo) {
      const libres = this.cuposLibresBus(r.busId);
      promovido =
        this.estadoProto
          .reservasBusFest()
          .filter((x) => x.busId === r.busId && x.estado === 'EN_ESPERA')
          .sort((a, b) => a.fecha.getTime() - b.fecha.getTime())
          .find((x) => 1 + x.acompanantes <= libres) ?? null;
      if (promovido) {
        const id = promovido.id;
        this.estadoProto.reservasBusFest.update((lista) =>
          lista.map((item) => (item.id === id ? { ...item, estado: 'CONFIRMADA' } : item)),
        );
      }
    }
    this.avisoOperacion.set(
      promovido
        ? `Reserva de ${r.clienteNombre} cancelada y cupo liberado. Se confirmó a ${promovido.clienteNombre} (el primero de la lista de espera): recibe su confirmación por WhatsApp o correo.`
        : `Reserva de ${r.clienteNombre} cancelada y cupo liberado.`,
    );
  }

  /* ── Acciones de Libro, SGD, Garantías, Evento y Torre ── */
  plazoLibro(a: AsientoLibroDetalle): PlazoLibro {
    return evaluarPlazoLibro(a, AHORA_BASE, diasHabilesEntre);
  }

  montoTexto(a: AsientoLibroDetalle): string {
    if (a.monto === null) return 'Sin monto';
    return `${a.moneda === 'USD' ? 'US$' : 'S/'} ${a.monto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
  }

  estadoTicketEs(estado: string): string {
    return ESTADO_ES[estado] ?? estado;
  }

  /** Última apelación del asiento, corta para la celda de la tabla. */
  apelacionTexto(a: AsientoLibroDetalle): string | null {
    const ap = a.apelaciones[a.apelaciones.length - 1];
    if (!ap) return null;
    return `${ap.instancia === 'INDECOPI' ? 'INDECOPI' : 'Interna'}: ${(APELACION_ESTADO_ES[ap.estado] ?? ap.estado).toLowerCase()}`;
  }

  itemsMasAccionesLibro(a: AsientoLibroDetalle): AyMenuItem[] {
    const conIndecopi = a.apelaciones.some((x) => x.instancia === 'INDECOPI');
    return this.menuLibro[`${this.estadoProto.puedeGestionarLibro()}${!!a.respuesta}${conIndecopi}`];
  }

  elegirMasAccionLibro(valor: string, a: AsientoLibroDetalle): void {
    if (valor === 'ver') this.verAsiento(a);
    else if (valor === 'ticket') this.seleccionarTicket.emit(a.ticketNum);
    else if (valor === 'apelar') this.registrarApelacionIndecopi(a);
  }

  verAsiento(a: AsientoLibroDetalle): void {
    this.asientoVistoId.set(a.id);
  }

  errorAsiento(campo: keyof ErroresAsiento): string | undefined {
    return this.asIntento() ? this.asErrores()[campo] : undefined;
  }

  errorRespuesta(campo: keyof ErroresRespuesta): string | undefined {
    return this.rpIntento() ? this.rpErrores()[campo] : undefined;
  }

  /** Abre el formulario de HU-012; con un ticket huérfano llega ya elegido. */
  abrirRegistroAsiento(ticketNum = ''): void {
    this.asIntento.set(false);
    this.asTicket.set('');
    this.asEstablecimiento.set('');
    this.asTipo.set('RECLAMO');
    this.asHechos.set('');
    this.asPedido.set('');
    this.asMonto.set('');
    this.asMoneda.set('');
    if (ticketNum) this.elegirTicketAsiento(ticketNum);
    this.registrandoAsiento.set(true);
  }

  /** Al elegir el ticket se propone el tipo de asiento y los hechos del ticket. */
  elegirTicketAsiento(num: string): void {
    this.asTicket.set(num);
    const t = this.tickets().find((x) => x.num === num);
    if (!t) return;
    this.asTipo.set(t.type === 'QUE' ? 'QUEJA' : 'RECLAMO');
    if (!this.asHechos().trim()) this.asHechos.set(t.summary);
  }

  guardarAsiento(): void {
    this.asIntento.set(true);
    const t = this.ticketAsiento();
    if (!t || Object.keys(this.asErrores()).length > 0) return;
    const detalle = this.estadoProto.asientosLibroDetalle();
    const { numero, codigo } = siguienteCorrelativo(detalle, t.co, this.asEstablecimiento());
    const registrado = AHORA_BASE;
    const vence = sumarDiasHabiles(registrado, PLAZO_LEGAL_DIAS_HABILES);
    const autor = this.estadoProto.perfilActivo().nombre;
    const m = normalizarMonto(this.asMonto(), this.asMoneda());
    this.estadoProto.asientosLibroDetalle.update((prev) => [
      {
        id: `lib-${numero}-${Date.now()}`,
        codigo,
        empresaId: t.co,
        establecimiento: this.asEstablecimiento(),
        ticketNum: t.num,
        tipo: this.asTipo() === 'QUEJA' ? 'QUEJA' : 'RECLAMO',
        consumidor: t.cli,
        dni: t.dni.slice(0, 4) + '••••',
        registrado,
        registradoPor: autor,
        venceOriginal: vence,
        hechos: this.asHechos().trim(),
        pedido: this.asPedido().trim(),
        monto: m.monto,
        moneda: m.moneda,
        respuesta: null,
        apelaciones: [],
        historialPlazo: [
          {
            id: `hp-${numero}-${Date.now()}`,
            fecha: registrado,
            evento: 'PLAZO_ORIGINAL',
            detalle: `Vence ${fmtFecha(vence)} (${PLAZO_LEGAL_DIAS_HABILES} días hábiles improrrogables)`,
            autor,
          },
        ],
      },
      ...prev,
    ]);
    this.registrandoAsiento.set(false);
    this.tabLibro.set('asientos');
    this.avisoOperacion.set(`Asiento ${codigo} registrado para ${t.num}. Responde antes del ${fmtFecha(vence)}.`);
  }

  /** Abre el formulario de HU-014 para el asiento. */
  abrirRespuesta(a: AsientoLibroDetalle): void {
    this.rpIntento.set(false);
    this.rpResumen.set('');
    this.rpCarta.set(null);
    this.rpCargo.set(null);
    this.rpDerecho.set(false);
    this.respondiendo.set(a);
  }

  anadirCarta(archivos: File[]): void {
    const f = archivos[0];
    if (f) this.rpCarta.set({ id: `${f.name}-${f.size}`, nombre: f.name, peso: f.size, estado: 'done' });
  }

  anadirCargo(archivos: File[]): void {
    const f = archivos[0];
    if (f) this.rpCargo.set({ id: `${f.name}-${f.size}`, nombre: f.name, peso: f.size, estado: 'done' });
  }

  /** HU-014: la respuesta solo vale con carta y cargo, y deja constancia del derecho a INDECOPI. */
  guardarRespuesta(): void {
    this.rpIntento.set(true);
    const a = this.respondiendo();
    const carta = this.rpCarta();
    const cargo = this.rpCargo();
    if (!a || !carta || !cargo || Object.keys(this.rpErrores()).length > 0) return;
    const fecha = AHORA_BASE;
    const usados = diasHabilesEntre(a.registrado, fecha);
    const firmante = this.estadoProto.perfilActivo().nombre;
    const fuera = diasHabilesEntre(fecha, a.venceOriginal) < 0;
    this.estadoProto.asientosLibroDetalle.update((prev) =>
      prev.map((x) =>
        x.id !== a.id
          ? x
          : {
              ...x,
              respuesta: {
                fecha,
                diasHabilesUsados: usados,
                resumen: this.rpResumen().trim(),
                firmante,
                cartaNombre: carta.nombre,
                cartaSha256: huellaSimulada(carta.nombre),
                cargoNombre: cargo.nombre,
                cargoSha256: huellaSimulada(cargo.nombre),
                derechoIndecopi: true,
              },
              historialPlazo: [
                ...x.historialPlazo,
                {
                  id: `hp-${x.id}-${Date.now()}`,
                  fecha,
                  evento: 'RESPUESTA' as const,
                  detalle: 'Respuesta formal registrada con carta y cargo.',
                  autor: firmante,
                },
              ],
            },
      ),
    );
    this.respondiendo.set(null);
    this.avisoOperacion.set(
      fuera
        ? `Respuesta de ${a.codigo} registrada FUERA de plazo (${usados} días hábiles).`
        : `Respuesta de ${a.codigo} registrada en ${usados} días hábiles, con carta y cargo.`,
    );
  }

  /** El número de expediente lo asigna INDECOPI: queda por asignar hasta que llegue. */
  registrarApelacionIndecopi(a: AsientoLibroDetalle): void {
    if (!a.respuesta || a.apelaciones.some((x) => x.instancia === 'INDECOPI')) return;
    const autor = this.estadoProto.perfilActivo().nombre;
    this.estadoProto.asientosLibroDetalle.update((prev) =>
      prev.map((x) =>
        x.id !== a.id
          ? x
          : {
              ...x,
              apelaciones: [
                ...x.apelaciones,
                {
                  id: `ap-${x.id}-${Date.now()}`,
                  instancia: 'INDECOPI' as const,
                  numeroCaso: null,
                  presentada: AHORA_BASE,
                  estado: 'PENDING' as const,
                  resolucion: null,
                  historial: [{ fecha: AHORA_BASE, cambio: 'Registrada', autor, nota: 'Apelación registrada ante INDECOPI.' }],
                },
              ],
            },
      ),
    );
    this.avisoOperacion.set(`Apelación ante INDECOPI registrada para ${a.codigo}; el expediente se asigna al recibirlo.`);
  }

  activarCargoSgd(s: CasoSgd): void {
    s.act = AHORA_BASE;
    this.avisoOperacion.set(`${s.code}: cargo de activación emitido. El SLA de línea corre desde ahora.`);
  }

  cerrarCasoSgdConGli(s: CasoSgd): void {
    s.closeState = 'ATENDIDO_CON_CARGO';
    this.avisoOperacion.set(`${s.code} cerrado con evidencia y referencia de custodia en el GLI.`);
  }

  agendarInspeccion(g: ReclamoGarantia): void {
    g.insp = '2026-10-25';
    this.avisoOperacion.set(`Inspección técnica programada para el reclamo ${g.id}.`);
  }

  derivarCasoAEstacion4(c: CasoEventoFestItem): void {
    this.actualizarCasoEvento(c.id, {
      estacion4: {
        fecha: AHORA_BASE,
        motivo: 'Derivado en vivo a la Estación 4 (Legal) desde el caso del evento.',
        autor: this.estadoProto.perfilActivo().nombre,
      },
    });
    this.avisoOperacion.set(`Caso ${c.codigo} derivado a la Estación 4 (Legal).`);
  }

  private actualizarCasoEvento(id: string, cambio: Partial<CasoEventoFestItem>): void {
    this.estadoProto.casosEventoFest.update((lista) => lista.map((c) => (c.id === id ? { ...c, ...cambio } : c)));
  }

  /** Lleva al formulario «Abrir un caso del evento», que está debajo de la tabla, y deja el cursor en el texto. */
  irAAbrirCaso(): void {
    this.tabEventoElegida.set('casos');
    setTimeout(() => {
      const texto = globalThis.document?.querySelector<HTMLTextAreaElement>('textarea[name="texto-evento"]');
      const reducido = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
      texto?.scrollIntoView({ behavior: reducido ? 'auto' : 'smooth', block: 'center' });
      texto?.focus({ preventScroll: true });
    }, 0);
  }

  /**
   * Abre un caso del evento (HU-ATC-037 y 039): nace con la etiqueta estándar y, si hay una palabra de riesgo
   * muy alto, ya derivado a la Estación 4 (HU-ATC-038 CA-01). Queda abierto para aplicarle la contención.
   */
  abrirCasoDelEvento(): void {
    const txt = this.textoEvento().trim() || 'Consulta presencial registrada en mesa de EntregaFest.';
    const penal = this.imputacionPenalDetectada();
    const nuevo: CasoEventoFestItem = {
      id: `ev-${Date.now()}`,
      codigo: `EF-${String(this.estadoProto.casosEventoFest().length + 1).padStart(3, '0')}`,
      cliente: 'Asistente Convocado EntregaFest',
      dni: '4412••••',
      proyecto: 'Villa Sol II · Mz. C',
      categoria: penal ? 'LEGAL_CONFLICTO' : 'ENTREGA',
      criticidad: penal ? 'CRITICA' : 'ALTA',
      resumen: txt,
      imputacionPenal: penal,
      frases: [],
      tema: 'EN_SALA',
      registroCompleto: penal,
      registrado: AHORA_BASE,
      primeraAtencion: AHORA_BASE,
      estacion4: penal
        ? {
            fecha: AHORA_BASE,
            motivo: 'Palabra de riesgo muy alto: derivación inmediata a la Estación 4 al abrir el caso.',
            autor: this.estadoProto.perfilActivo().nombre,
          }
        : null,
    };
    this.estadoProto.casosEventoFest.update((prev) => [nuevo, ...prev]);
    this.textoEvento.set('');
    this.abrirCaso(nuevo);
    this.avisoOperacion.set(
      penal
        ? `Caso ${nuevo.codigo} abierto con la etiqueta «${this.etiquetaCasoEvento}» y derivado de inmediato a la Estación 4 (Legal).`
        : `Caso ${nuevo.codigo} abierto con la etiqueta «${this.etiquetaCasoEvento}». Aplica los pasos de contención y completa su registro.`,
    );
  }

  abrirCaso(c: CasoEventoFestItem): void {
    this.casoAbiertoId.set(c.id);
    this.resumenEdicion.set(c.resumen);
    this.reaperturaBloqueada.set(null);
  }

  /** «Atender caso» y «Ver caso»: abre el panel del caso y lo deja a la vista. */
  verCaso(c: CasoEventoFestItem): void {
    this.abrirCaso(c);
    this.irAZonaCaso();
  }

  /** Menú ⋯ de la fila: reabrir un caso cerrado y derivar uno que sigue en sala. */
  itemsMasAccionesCaso(c: CasoEventoFestItem): AyMenuItem[] {
    return [
      { tipo: 'item', value: 'reabrir', label: 'Intentar reabrir', disabled: c.tema !== 'CERRADO' },
      { tipo: 'item', value: 'derivar', label: 'Derivar a Estación 4', disabled: c.tema !== 'EN_SALA' || !!c.estacion4 },
    ] as AyMenuItem[];
  }

  elegirMasAccionCaso(id: string, c: CasoEventoFestItem): void {
    if (id === 'reabrir') this.intentarReabrirCaso(c);
    if (id === 'derivar') {
      this.abrirCaso(c);
      this.derivarCasoAEstacion4(c);
      this.irAZonaCaso();
    }
  }

  /** Baja o sube hasta el panel del caso o el aviso de reapertura, que están sobre la tabla. */
  private irAZonaCaso(): void {
    setTimeout(() => {
      const zona = globalThis.document?.getElementById('zona-caso-evento');
      const reducido = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
      zona?.scrollIntoView({ behavior: reducido ? 'auto' : 'smooth', block: 'start' });
    }, 0);
  }

  /** «4 → 5 → 6» del guion se muestra como los pasos «1 → 2 → 3» de la contención. */
  pasosTexto(frases: readonly number[]): string {
    return frases.map((n) => n - 3).join(' → ');
  }

  /** Completa el registro del caso abierto: lo exige el paso 3 para poder cerrar el tema (HU-ATC-037 CA-02). */
  completarRegistroCaso(): void {
    const c = this.casoAbierto();
    const resumen = this.resumenEdicion().trim();
    if (!c || !resumen) {
      this.avisoOperacion.set('Escribe el resumen del caso para completar su registro.');
      return;
    }
    this.actualizarCasoEvento(c.id, { resumen, registroCompleto: true });
    this.avisoOperacion.set(`Registro del caso ${c.codigo} completo, con la etiqueta «${this.etiquetaCasoEvento}».`);
  }

  /** Cierra el tema en sala: si el caso está derivado, queda con el especialista de la Estación 4 (HU-ATC-038 CA-02). */
  cerrarTemaEnSala(): void {
    const c = this.casoAbierto();
    if (!c || !this.puedeCerrarTema()) return;
    this.actualizarCasoEvento(c.id, { tema: 'CERRADO' });
    this.avisoOperacion.set(
      c.estacion4
        ? `Tema cerrado en sala. El caso ${c.codigo} queda con el especialista de la Estación 4 (Legal): no se reabre.`
        : `Tema cerrado en sala. El caso ${c.codigo} queda registrado.`,
    );
  }

  /** Un caso derivado a la Estación 4 no se reabre desde el evento (HU-ATC-038 CA-02). */
  intentarReabrirCaso(c: CasoEventoFestItem): void {
    if (c.estacion4) {
      this.casoAbiertoId.set(null);
      this.reaperturaBloqueada.set(
        `El caso ${c.codigo} ya fue derivado a la Estación 4: el moderador no puede reabrirlo. Queda con el especialista de Legal.`,
      );
    } else {
      this.actualizarCasoEvento(c.id, { tema: 'EN_SALA' });
      this.abrirCaso(c);
      this.avisoOperacion.set(`Caso ${c.codigo} reabierto: vuelve a estar en sala.`);
    }
    this.irAZonaCaso();
  }

  /** Aplica el siguiente paso de la contención al caso abierto: la siguiente Frase del guion, 4, 5 o 6 (HU-ATC-037). */
  aplicarFrase(numero: number): void {
    const c = this.casoAbierto();
    if (!c || c.tema === 'CERRADO') return;
    const orden = this.estadoProto.frasesAnclaEvento.map((f) => f.numero as number);
    if (orden[c.frases.length] !== numero) return;
    this.actualizarCasoEvento(c.id, { frases: [...c.frases, numero] });
    this.avisoOperacion.set(
      numero === 4
        ? `Caso ${c.codigo}, paso 1: queda registrado el intento de concreción.`
        : numero === 5
          ? `Caso ${c.codigo}, paso 2: se invocaron las reglas del evento.`
          : `Caso ${c.codigo}, paso 3: completa el registro del caso para cerrar el tema en sala.`,
    );
  }

  cambiarCapitalControversia(val: string): void {
    this.capitalControversia.set(Number(val) || 0);
  }

  generarInforme(periodo: 'SEMANAL' | 'MENSUAL'): void {
    this.estadoProto.informesCx.update((prev) => [
      {
        id: `inf-${Date.now()}`,
        periodo,
        generado: AHORA_BASE,
        autor: this.estadoProto.perfilActivo().nombre,
        total: this.tickets().length,
        cumplimientoRespuesta: 94,
        cumplimientoResolucion: 91,
        csatPromedio: 4.7,
        nps: 54,
        principalesCausas: [
          { tipo: 'CTA', cantidad: 19 },
          { tipo: 'PED', cantidad: 12 },
          { tipo: 'GAR', cantidad: 8 },
        ],
      },
      ...prev,
    ]);
    this.avisoOperacion.set(`Informe ${periodo.toLowerCase()} generado en la Torre de Control CX.`);
  }
}
