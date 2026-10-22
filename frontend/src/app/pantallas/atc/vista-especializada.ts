import {
  ChangeDetectionStrategy,
  Component,
  computed,
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
  AyForm,
  AyFormField,
  AyFormGroup,
  AyGrid,
  AyInput,
  AyList,
  AyListItem,
  AyModal,
  AyPageHeader,
  AyProgressBar,
  AyRow,
  AySelect,
  AyStack,
  AyStatistic,
  AyTable,
  AyTabs,
  AyTextarea,
  AyText,
  type AyColumna,
  type AyOpcionSelect,
  type AyTabsElemento,
  type ParCardPairs,
} from '@aybarcorp/ui-angular';
import {
  AHORA_BASE,
  AREAS_ATC,
  EMPRESAS_AYBAR,
  PRIORIDADES_TICKET,
  TIPOS_TICKET,
  diasHabilesEntre,
  fmtFecha,
  fmtFechaHora,
  sumarDiasHabiles,
  type AsientoLibro,
  type AsistenteProyecto,
  type BusEntregaFest,
  type CasoMorosidad,
  type CasoSgd,
  type ReclamoGarantia,
  type TicketAtc,
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
import { IngresosHoyComponent } from './ingresos-hoy';
import { ProtocoloFrasesComponent } from './protocolo-frases';
import { BarraFiltrosComponent } from './barra-filtros';
import { VacioFiltrosComponent } from './vacio-filtros';
import { crearFiltrosTabla, EstadoFiltrosTablas } from './filtros-tabla';
import { CeldaTicketComponent } from './celda-ticket';
import { EditorPasosFlujoComponent, type CambioPaso } from './editor-pasos-flujo';
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
  | 'configuracion'
  | 'urbemind'
  | 'torre'
  | 'evento';

@Component({
  selector: 'app-vista-especializada',
  standalone: true,
  imports: [
    IngresosHoyComponent,
    ProtocoloFrasesComponent,
    BarraFiltrosComponent,
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
    AyDivider,
    AyEmptyState,
    AyForm,
    AyFormField,
    AyFormGroup,
    AyGrid,
    AyInput,
    AyList,
    AyListItem,
    AyModal,
    AyPageHeader,
    AyProgressBar,
    AyRow,
    AySelect,
    AyStack,
    AyStatistic,
    AyTable,
    AyTabs,
    AyTextarea,
    AyText,
    CeldaTicketComponent,
    EditorPasosFlujoComponent,
    FlujosTorreComponent,
    PasosFlujoComponent,
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
    <!-- 1. CONFIGURACIÓN (ADMIN_FUNCIONAL): FLUJOS, GUÍAS Y ALERTAS            -->
    <!-- ====================================================================== -->
    @if (subvista() === 'configuracion') {
      <div ayStack gap="6">
        <ay-page-header
          titulo="Configuración"
          descripcion="Flujos de atención y guías de solución por tipo de ticket. Publicar una versión nueva afecta inmediatamente a los nuevos tickets y al detalle del ticket."
        >
          <ay-badge ayEstado size="sm" tono="info">
            {{ estadoProto.alertasAdmin().length }} alertas para el administrador
          </ay-badge>
          <ay-tabs
            ayPestanas
            etiqueta="Secciones de configuración"
            variante="underline"
            [items]="tabsConfiguracion()"
            [valor]="tabConfig()"
            (valorChange)="tabConfig.set($event)"
          />
        </ay-page-header>

        @if (estadoProto.rolActivo() !== 'ADMIN_FUNCIONAL' && estadoProto.rolActivo() !== 'SUPERVISOR') {
          <ay-card superficie="solid">
            <ay-card-body padding="md">
              <ay-empty-state
                titulo="Acceso restringido (403)"
                descripcion="Necesitas el rol de Administrador Funcional para configurar los flujos y las guías."
              />
            </ay-card-body>
          </ay-card>
        } @else {
          @if (tabConfig() === 'flujos') {
            <ay-card variante="elevated" superficie="solid">
              <ay-card-header
                titulo="Flujos por tipo de ticket"
                subtitulo="Cada cambio publica una versión nueva (vN+1); los tickets abiertos conservan la suya."
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
                  <ng-template ayCelda="tipo" let-fila>
                    @let f = comoFlujo(fila);
                    <div>
                      <strong>{{ f.nombreTipo }}</strong>
                      <span ayText="mono" size="xs"> ({{ f.tipo }})</span>
                    </div>
                  </ng-template>
                  <ng-template ayCelda="area" let-fila>
                    @let f = comoFlujo(fila);
                    <ay-badge size="sm" tono="neutral">{{ areaEs(f.area) }}</ay-badge>
                  </ng-template>
                  <ng-template ayCelda="version" let-fila>
                    @let f = comoFlujo(fila);
                    <ay-badge size="sm" tono="info">v{{ f.versionActual }}</ay-badge>
                  </ng-template>
                  <ng-template ayCelda="pasos" let-fila>
                    @let f = comoFlujo(fila);
                    <app-pasos-flujo [pasos]="f.pasos" />
                  </ng-template>
                  <ng-template ayCelda="accion" let-fila>
                    @let f = comoFlujo(fila);
                    <ay-button tamano="sm" variante="ghost" (click)="abrirEditorFlujo(f)">
                      Editar
                    </ay-button>
                  </ng-template>
                </ay-table>
              </ay-card-body>
            </ay-card>
          }

          @if (tabConfig() === 'guias') {
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
                  <ng-template ayCelda="tipo" let-fila>
                    @let g = comoGuia(fila);
                    <div>
                      <strong>{{ g.nombreTipo }}</strong>
                      <span ayText="mono" size="xs"> ({{ g.tipo }})</span>
                    </div>
                  </ng-template>
                  <ng-template ayCelda="vigente" let-fila>
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
                    <ay-button tamano="sm" variante="ghost" (click)="abrirEditorGuia(g)">
                      {{ g.versionActual !== null ? 'Nueva versión' : 'Crear la guía' }}
                    </ay-button>
                  </ng-template>
                </ay-table>
              </ay-card-body>
            </ay-card>
          }

          @if (tabConfig() === 'alertas') {
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
                  <ng-template ayCelda="alerta" let-fila>
                    @let a = comoAlertaAdmin(fila);
                    <div ayStack gap="1">
                      <strong>{{ a.etiqueta }}</strong>
                    </div>
                  </ng-template>
                  <ng-template ayCelda="tipo" let-fila>
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
          [titulo]="flujoEditando() ? 'Flujo · ' + flujoEditando()!.nombreTipo : 'Flujo'"
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
        >
          <ay-badge ayEstado size="sm" tono="info">
            {{ estadoProto.politicasSla().length }} políticas activas
          </ay-badge>
        </ay-page-header>

        @if (estadoProto.rolActivo() !== 'SUPERVISOR' && estadoProto.rolActivo() !== 'ADMIN_FUNCIONAL') {
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
                <ng-template ayCelda="respuesta" let-fila>
                  @let p = comoPolitica(fila);
                  <strong>{{ p.respuestaH }} h</strong>
                </ng-template>
                <ng-template ayCelda="resolucion" let-fila>
                  @let p = comoPolitica(fila);
                  <strong>{{ p.resolucionH }} h</strong>
                </ng-template>
                <ng-template ayCelda="version" let-fila>
                  @let p = comoPolitica(fila);
                  <ay-badge size="sm" tono="info">v{{ p.version }}</ay-badge>
                </ng-template>
                <ng-template ayCelda="accion" let-fila>
                  @let p = comoPolitica(fila);
                  <ay-button tamano="sm" variante="ghost" (click)="abrirEditorPolitica(p)">
                    Editar
                  </ay-button>
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
        >
          <ay-badge ayEstado size="sm" tono="info">
            {{ ticketsDeColaboradorSaliente().length }} pendientes del colaborador elegido
          </ay-badge>
        </ay-page-header>

        @if (estadoProto.rolActivo() !== 'SUPERVISOR') {
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
                  <ng-template ayCelda="resumen" let-fila>
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
          <ay-badge ayEstado size="sm" tono="warning">
            {{ estadoProto.alertasSla().length }} alertas registradas
          </ay-badge>
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
              <ng-template ayCelda="ticket" let-fila>
                @let a = comoAlertaSla(fila);
                <ay-button tamano="sm" variante="ghost" (click)="seleccionarTicket.emit(a.ticketNum)">
                  {{ a.ticketNum }}
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
              <ng-template ayCelda="vence" let-fila>
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
              <ng-template ayCelda="nuevas" let-fila>
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
        >
          <ay-badge ayEstado size="sm" tono="info">Meta Eje 1/2 ≤ 72 h hábiles</ay-badge>
        </ay-page-header>

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
              [rayada]="true"
            >
              <ng-template ayCelda="ticket" let-fila>
                @let r = comoFilaCierre(fila);
                <app-celda-ticket [ticket]="r.ticket" (abrir)="seleccionarTicket.emit($event)" />
              </ng-template>
              <ng-template ayCelda="eje" let-fila>
                @let r = comoFilaCierre(fila);
                <ay-badge size="sm" [tono]="r.ticket.eje === 3 ? 'danger' : 'neutral'">
                  Eje {{ r.ticket.eje }} ({{ r.limite }} h)
                </ay-badge>
              </ng-template>
              <ng-template ayCelda="avance" let-fila>
                @let r = comoFilaCierre(fila);
                <ay-progress-bar
                  size="sm"
                  [valor]="r.pct"
                  [tono]="r.tono === 'warning' ? 'brand' : r.tono"
                  [etiqueta]="r.horas + ' de ' + r.limite + ' h hábiles'"
                />
              </ng-template>
              <ng-template ayCelda="situacion" let-fila>
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
        >
          <ay-badge ayEstado size="sm" tono="info">OAuth2 Client Credentials + Webhooks</ay-badge>
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
                  <ng-template ayCelda="estado" let-fila>
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
                <ng-template ayCelda="ticket" let-fila>
                  @let e = comoEventoUm(fila);
                  <strong ayText="mono" size="xs">{{ e.ticketNum }}</strong>
                </ng-template>
                <ng-template ayCelda="estado" let-fila>
                  @let e = comoEventoUm(fila);
                  <ay-badge size="sm" [tono]="e.estado === 'ENTREGADO' ? 'success' : 'warning'">
                    {{ e.estado === 'ENTREGADO' ? 'Entregado' : 'Pendiente de reintento' }} ({{ e.intentos }} int.)
                  </ay-badge>
                </ng-template>
                <ng-template ayCelda="detalle" let-fila>
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
        >
          <ay-badge ayEstado size="sm" tono="danger">
            {{ estadoProto.casosResolucionMora().length }} casos de resolución
          </ay-badge>
        </ay-page-header>

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
              <ng-template ayCelda="ticket" let-fila>
                @let m = comoMoraDetalle(fila);
                <strong ayText="mono" size="xs">{{ m.ticketNum }}</strong>
              </ng-template>
              <ng-template ayCelda="cliente" let-fila>
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
                <div ayRow gap="2" [ajuste]="true">
                  <ay-button tamano="sm" variante="secondary" (click)="moraSeleccionada.set(m)">
                    Abrir caso
                  </ay-button>
                  <ay-button tamano="sm" variante="ghost" (click)="verContrato.emit(m.contrato)">
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
          descripcion="Registra a cada persona que entra en garita. Se crea el ticket de visita y se avisa al responsable del proyecto."
        >
          <ay-badge ayEstado size="sm" tono="info">{{ asistentes().length }} ingresos hoy</ay-badge>
        </ay-page-header>

        @if (!estadoProto.puedeRegistrarIngreso()) {
          <ay-card superficie="solid">
            <ay-card-body padding="md">
              <ay-empty-state
                titulo="Acceso restringido (403)"
                descripcion="Necesitas el rol de Control de Acceso o Supervisor para registrar ingresos a proyecto."
              />
            </ay-card-body>
          </ay-card>
        } @else {
          <div ayGrid [columnas]="2" gap="md">
            <ay-card variante="elevated" superficie="solid">
              <ay-card-header
                titulo="Formulario de control de acceso (6 campos)"
                subtitulo="Si el visitante ya es cliente en SIGDA/TAXON se vincula a su lote; si no, entra como Interesado."
                nivel="h2"
                [separador]="true"
              />
              <ay-card-body padding="md" gap="md">
                <ay-form class="pl-atc-form-ancho" (enviar)="registrarIngresoProyecto()">
                  <div ayStack gap="3">
                    <ay-form-field etiqueta="1. Nombre completo" obligatorio>
                      <ay-input nombre="nuevo-asistente-nombre"
                        [valor]="nuevoAsistenteNombre()"
                        (valorChange)="nuevoAsistenteNombre.set($event)"
                        placeholder="Nombre y apellidos"
                      />
                    </ay-form-field>
                    <div ayGrid [columnas]="2" gap="sm" class="pl-atc-fila-campos">
                      <ay-form-field etiqueta="2. DNI (8 dígitos)" obligatorio>
                        <ay-input nombre="nuevo-asistente-dni"
                          [valor]="nuevoAsistenteDni()"
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
                      <ay-form-field etiqueta="5. Proyecto o área que visita" obligatorio>
                        <ay-select nombre="nuevo-asistente-proyecto"
                          [opciones]="opcionesProyectoVisita"
                          [valor]="nuevoAsistenteProyecto()"
                          (valorChange)="nuevoAsistenteProyecto.set($event)"
                        />
                      </ay-form-field>
                    </div>
                    <ay-form-field etiqueta="6. Lote / Unidad o referencia">
                      <ay-input nombre="nuevo-asistente-lote"
                        [valor]="nuevoAsistenteLote()"
                        (valorChange)="nuevoAsistenteLote.set($event)"
                        placeholder="Ej. Mz. C Lt. 07"
                      />
                    </ay-form-field>
                    <div ayRow gap="2" justificar="end">
                      <ay-button tipo="submit" variante="primary">Registrar ingreso</ay-button>
                    </div>
                  </div>
                </ay-form>
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
          descripcion="Ley 29571, art. 24: respuesta en 15 días hábiles desde el registro, prorrogables una sola vez por 15 si se comunica antes del vencimiento."
        >
          <ay-badge ayEstado size="sm" tono="info">
            {{ estadoProto.asientosLibroDetalle().length }} asientos regulados
          </ay-badge>
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
              <ay-table
                leyenda="Asientos del Libro de Reclamaciones regulado"
                [columnas]="columnasLibro"
                [filas]="asientosLibro()"
                [cabeceraFija]="true"
                [rayada]="true"
              >
                <ng-template ayCelda="asiento" let-fila>
                  @let b = comoAsiento(fila);
                  <div ayStack gap="1">
                    <strong ayText="mono" size="xs">{{ b.co }}-2026-{{ b.n }}</strong>
                    <span ayText="body" size="xs">{{ b.est }}</span>
                  </div>
                </ng-template>
                <ng-template ayCelda="ticket" let-fila>
                  @let b = comoAsiento(fila);
                  <ay-button tamano="sm" variante="ghost" (click)="seleccionarTicket.emit(b.ticket)">
                    {{ b.ticket }}
                  </ay-button>
                </ng-template>
                <ng-template ayCelda="kind" let-fila>
                  @let b = comoAsiento(fila);
                  <div ayStack gap="1">
                    <ay-badge size="sm" [tono]="b.kind === 'RECLAMO' ? 'warning' : 'neutral'">
                      {{ etiqueta(asientoTipoEs, b.kind) }}
                    </ay-badge>
                    <span ayText="body" size="xs">{{ b.amount ?? 'Sin monto' }}</span>
                  </div>
                </ng-template>
                <ng-template ayCelda="cli" let-fila>
                  @let b = comoAsiento(fila);
                  <div ayStack gap="1">
                    <strong>{{ b.cli }}</strong>
                    <span ayText="body" size="xs">{{ b.facts }}</span>
                  </div>
                </ng-template>
                <ng-template ayCelda="plazo" let-fila>
                  @let b = comoAsiento(fila);
                  <div ayStack gap="1">
                    <ay-badge size="sm" [tono]="plazoLibro(b).tono">{{ plazoLibro(b).texto }}</ay-badge>
                    <span ayText="mono" size="xs">Vence: {{ plazoLibro(b).vence }}</span>
                  </div>
                </ng-template>
                <ng-template ayCelda="prorroga" let-fila>
                  @let b = comoAsiento(fila);
                  @if (b.ext) {
                    <ay-badge size="sm" tono="warning">Prórroga aplicada</ay-badge>
                  } @else if (!b.resp && estadoProto.puedeGestionarLibro()) {
                    <ay-button tamano="sm" variante="secondary" (click)="aplicarProrrogaUnica(b)">
                      Prorrogar 15 días
                    </ay-button>
                  } @else {
                    <span ayText="body" size="xs">{{ b.resp ? 'No requerida' : 'Solo Legal' }}</span>
                  }
                </ng-template>
                <ng-template ayCelda="respuesta" let-fila>
                  @let b = comoAsiento(fila);
                  @if (!b.resp) {
                    @if (estadoProto.puedeGestionarLibro()) {
                      <ay-button tamano="sm" variante="primary" (click)="emitirRespuestaConCargo(b)">
                        Emitir carta + cargo
                      </ay-button>
                    } @else {
                      <ay-badge size="sm" tono="neutral">Pendiente de Legal</ay-badge>
                    }
                  } @else {
                    <div ayStack gap="1">
                      <ay-badge size="sm" tono="success">Respondido {{ fmtDia(b.resp) }}</ay-badge>
                      @if (b.appeal) {
                        <span ayText="body" size="xs">
                          Apelación {{ etiqueta(apelacionEs, b.appeal.to) }}: <strong>{{ b.appeal.caseNo }}</strong> ({{ b.appeal.st }})
                        </span>
                      } @else if (estadoProto.puedeGestionarLibro()) {
                        <ay-button tamano="sm" variante="ghost" (click)="registrarApelacionIndecopi(b)">
                          + Registrar apelación INDECOPI
                        </ay-button>
                      }
                    </div>
                  }
                </ng-template>
              </ay-table>
            </ay-card-body>
          </ay-card>
        }

        @if (tabLibro() === 'alertas') {
          <ay-card superficie="solid">
            <ay-card-header
              titulo="Alertas del plazo legal (Ley 29571)"
              subtitulo="Se generan a 3 días hábiles del vencimiento sin prórroga y cuando el plazo vence sin respuesta."
              nivel="h2"
              [separador]="true"
            />
            <ay-card-body padding="sm">
              <ay-card-pairs
                [pares]="
                  estadoProto.alertasLegalesLibro().map(a => ({
                    clave: a.codigoAsiento + ' · ' + a.tipo,
                    valor: 'Vence ' + fmtDia(a.vencimientoEvaluado) + ' · Para: ' + a.destinatario + ' (' + a.canal + ')'
                  }))
                "
              />
            </ay-card-body>
          </ay-card>
        }

        @if (tabLibro() === 'huerfanos') {
          <ay-card superficie="solid">
            <ay-card-header
              titulo="Control diario de integridad (Tickets huérfanos)"
              subtitulo="Tickets activos de Queja o Reclamo que exigen asiento en el Libro de Reclamaciones."
              nivel="h2"
              [separador]="true"
            />
            <ay-card-body padding="md">
              <ay-alert tono="success" size="sm" titulo="0 tickets huérfanos hoy">
                Todos los tickets activos de tipo Queja (QUE) y Reclamo (REC) cuentan con su asiento correlativo vinculado.
              </ay-alert>
            </ay-card-body>
          </ay-card>
        }
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
        >
          <ay-badge ayEstado size="sm" tono="warning">{{ casosSgd().length }} casos SGD</ay-badge>
          <ay-tabs
            ayPestanas
            etiqueta="Vistas de la Mesa SGD"
            variante="underline"
            [items]="tabsMesaSgd()"
            [valor]="tabSgd()"
            (valorChange)="tabSgd.set($event)"
          />
        </ay-page-header>

        <div ayGrid [columnas]="2" gap="md">
          <ay-card superficie="solid">
            <ay-card-header
              titulo="Cargo previo vs. activación, casos vinculados y cierre GLI"
              subtitulo="El SLA de línea corre recién desde el cargo de activación."
              nivel="h2"
              [separador]="true"
            />
            <ay-card-body padding="sm">
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
                    @if (s.act) {
                      <ay-badge size="sm" tono="info">
                        Activado: {{ fmtDia(s.act) }} (SLA {{ s.slaDays }}d)
                      </ay-badge>
                    } @else {
                      <ay-button
                        tamano="sm"
                        variante="secondary"
                        [disabled]="!estadoProto.puedeOperarMesaSgd()"
                        (click)="activarCargoSgd(s)"
                      >
                        Emitir cargo de activación
                      </ay-button>
                    }
                  </div>
                </ng-template>
                <ng-template ayCelda="linked" let-fila>
                  @let s = comoSgd(fila);
                  <span ayText="mono" size="xs">{{ s.linked ?? 'Sin cruce' }}</span>
                </ng-template>
                <ng-template ayCelda="estado" let-fila>
                  @let s = comoSgd(fila);
                  @if (s.closeState) {
                    <ay-badge size="sm" tono="success">{{ etiqueta(cierreSgdEs, s.closeState) }} · GLI</ay-badge>
                  } @else {
                    <ay-button
                      tamano="sm"
                      variante="primary"
                      [disabled]="!s.act || !estadoProto.puedeOperarMesaSgd()"
                      (click)="cerrarCasoSgdConGli(s)"
                    >
                      Cerrar con evidencia GLI
                    </ay-button>
                  }
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
        >
          <ay-badge ayEstado size="sm" tono="info">{{ garantias().length }} reclamos de garantía</ay-badge>
        </ay-page-header>

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
                @if (g.insp) {
                  <span ayText="mono" size="xs">Programada: {{ g.insp }}</span>
                } @else {
                  <ay-button
                    tamano="sm"
                    variante="secondary"
                    [disabled]="!estadoProto.puedeOperarGarantias()"
                    (click)="agendarInspeccion(g)"
                  >
                    Programar inspección
                  </ay-button>
                }
              </ng-template>
              <ng-template ayCelda="state" let-fila>
                @let g = comoGarantia(fila);
                <div ayRow gap="2" [ajuste]="true">
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
                  @if (g.state === 'UNDER_REVIEW' && estadoProto.puedeOperarGarantias()) {
                    <ay-button tamano="sm" variante="primary" (click)="g.state = 'APPROVED'">
                      Resolver / Aprobar
                    </ay-button>
                    <ay-button tamano="sm" variante="danger" (click)="g.state = 'ESCALATED_EJE3'">
                      Derivar a Eje 3
                    </ay-button>
                  }
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
              : 'Tablero del evento: casos por criticidad, protocolo de contención con las 6 frases ancla, derivación inmediata a Estación 4 y aforo y reservas de buses.'
          "
        >
          @if (estadoProto.rolActivo() !== 'CLIENTE') {
            <ay-badge ayEstado size="sm" tono="danger">
              {{ estadoProto.casosEventoFest().filter(c => c.criticidad === 'CRITICA').length }} críticos activos
            </ay-badge>
          }
          <ay-badge ayEstado size="sm" tono="info">
            {{ estadoProto.reservasBusFest().length }} reservas de bus
          </ay-badge>
        </ay-page-header>

        @if (estadoProto.rolActivo() !== 'CLIENTE') {
          @if (imputacionPenalDetectada()) {
            <ay-alert
              tono="danger"
              titulo="Imputación penal detectada: criticidad CRÍTICA obligatoria"
            >
              La descripción menciona vocabulario penal («estafa», «robo», «denuncia penal», «fiscalía»). El anfitrión aplica la Frase Ancla #3 y deriva de inmediato a la Estación 4 (Legal).
            </ay-alert>
          }

          <div ayGrid [columnas]="2" gap="md">
            <ay-card variante="elevated" superficie="solid">
              <ay-card-header
                titulo="Casos registrados en el evento"
                subtitulo="Ordenados por criticidad y hora de registro."
                nivel="h2"
                [separador]="true"
              />
              <ay-card-body padding="sm" gap="md">
                <ay-table
                  leyenda="Casos del evento EntregaFest"
                  [columnas]="columnasCasosEvento"
                  [filas]="estadoProto.casosEventoFest()"
                  [rayada]="true"
                >
                  <ng-template ayCelda="ticket" let-fila>
                    @let c = comoCasoEvento(fila);
                    <strong ayText="mono" size="xs">{{ c.ticketNum }}</strong>
                  </ng-template>
                  <ng-template ayCelda="cliente" let-fila>
                    @let c = comoCasoEvento(fila);
                    <div ayStack gap="1">
                      <strong>{{ c.cliente }}</strong>
                      <span ayText="body" size="xs">{{ c.proyecto }}</span>
                    </div>
                  </ng-template>
                  <ng-template ayCelda="criticidad" let-fila>
                    @let c = comoCasoEvento(fila);
                    <ay-badge size="sm" [tono]="c.criticidad === 'CRITICA' ? 'danger' : 'warning'">
                      {{ etiqueta(criticidadEs, c.criticidad) }}
                    </ay-badge>
                  </ng-template>
                  <ng-template ayCelda="situacion" let-fila>
                    @let c = comoCasoEvento(fila);
                    @if (c.estacion4) {
                      <ay-badge size="sm" tono="danger">En Estación 4 (Legal)</ay-badge>
                    } @else {
                      <ay-button tamano="sm" variante="secondary" (click)="derivarCasoAEstacion4(c)">
                        Derivar a Estación 4
                      </ay-button>
                    }
                  </ng-template>
                </ay-table>

                <ay-divider espaciado="sm" />

                <ay-form-field etiqueta="Simular transcripción verbal en mesa (detector de imputación penal)">
                  <ay-textarea nombre="texto-evento"
                    [filas]="2"
                    [valor]="textoEvento()"
                    (valorChange)="textoEvento.set($event)"
                    placeholder="Escribe aquí lo manifestado por el asistente..."
                  />
                </ay-form-field>
                <div ayRow gap="2">
                  <ay-button
                    tamano="sm"
                    variante="danger"
                    (click)="textoEvento.set('Exijo mi minuta hoy mismo, esto es una estafa y robo')"
                  >
                    Probar frase con imputación penal
                  </ay-button>
                  <ay-button
                    tamano="sm"
                    variante="primary"
                    (click)="registrarCasoEnEntregaFest()"
                  >
                    + Registrar caso del evento
                  </ay-button>
                </div>
              </ay-card-body>
            </ay-card>

            <ay-card superficie="solid">
              <ay-card-header
                titulo="Protocolo de contención: las 6 frases ancla"
                subtitulo="Guía verbal obligatoria para moderadores y anfitriones del evento."
                nivel="h2"
                [separador]="true"
              />
              <ay-card-body padding="sm">
                <app-protocolo-frases [frases]="estadoProto.frasesAnclaEvento" />
              </ay-card-body>
            </ay-card>
          </div>
        }

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

        @if (estadoProto.rolActivo() === 'CLIENTE') {
          <ay-card variante="elevated" superficie="solid">
            <ay-card-header
              titulo="Mi Portal · Reservar mi cupo en el bus"
              subtitulo="Hasta 3 acompañantes por titular convocado. Si el bus no tiene cupo, puedes entrar en la lista de espera."
              nivel="h2"
              [separador]="true"
            />
            <ay-card-body padding="md" gap="md">
              <ay-form (enviar)="confirmarReservaBusCliente()">
                <div ayGrid [columnas]="3" gap="sm">
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
              <ng-template ayCelda="cliente" let-fila>
                @let r = comoReservaBus(fila);
                <strong>{{ r.clienteNombre }}</strong>
              </ng-template>
              <ng-template ayCelda="bus" let-fila>
                @let r = comoReservaBus(fila);
                <span>{{ nombreBus(r.busId) }}</span>
              </ng-template>
              <ng-template ayCelda="punto" let-fila>
                @let r = comoReservaBus(fila);
                <span ayText="body" size="xs">{{ r.punto }}</span>
              </ng-template>
              <ng-template ayCelda="personas" let-fila>
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
                @if (r.estado !== 'CANCELADA') {
                  <ay-button tamano="sm" variante="ghost" (click)="cancelarReservaBus(r)">
                    Cancelar reserva
                  </ay-button>
                }
              </ng-template>
            </ay-table>
          </ay-card-body>
        </ay-card>
      </div>
    }

    <!-- ====================================================================== -->
    <!-- 14. TORRE DE CONTROL CX (5 PESTAÑAS DE 5181)                           -->
    <!-- ====================================================================== -->
    @if (subvista() === 'torre') {
      <div ayStack gap="6">
        <ay-page-header
          titulo="Torre de Control CX"
          descripcion="Volumen, cumplimiento de SLA, prevención de denuncias (+8 % interés legal), encuestas post-atención, informes periódicos y auditoría de datos."
        >
          <ay-badge ayEstado size="sm" tono="success">SLA E2E 91.4 % · NPS +54</ay-badge>
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
          <div ayGrid [columnas]="4" gap="md">
            <ay-card superficie="solid">
              <ay-card-body padding="md">
                <ay-statistic
                  etiqueta="SLA E2E ≤ 72 h (Eje 1/2)"
                  valor="91.4%"
                  periodo="Meta corporativa ≥ 90%"
                  size="sm"
                />
              </ay-card-body>
            </ay-card>
            <ay-card superficie="solid">
              <ay-card-body padding="md">
                <ay-statistic
                  etiqueta="Resueltos en 1.er contacto (FCR)"
                  valor="68%"
                  periodo="Sin reaperturas ni derivaciones"
                  size="sm"
                />
              </ay-card-body>
            </ay-card>
            <ay-card superficie="solid">
              <ay-card-body padding="md">
                <ay-statistic
                  etiqueta="Cumplimiento 1.ª respuesta"
                  valor="94.2%"
                  periodo="En horario hábil de Perú"
                  size="sm"
                />
              </ay-card-body>
            </ay-card>
            <ay-card superficie="solid">
              <ay-card-body padding="md">
                <ay-statistic
                  etiqueta="Cumplimiento resolución"
                  valor="90.8%"
                  periodo="Con políticas SLA versionadas"
                  size="sm"
                />
              </ay-card-body>
            </ay-card>
          </div>

          <ay-card superficie="solid">
            <ay-card-header
              titulo="Flujos activos por área resolutora (sincronizados con Configuración)"
              nivel="h2"
              [separador]="true"
            />
            <ay-card-body padding="md">
              <app-flujos-torre [flujos]="estadoProto.flujosPorTipo()" />
            </ay-card-body>
          </ay-card>
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
                <ng-template ayCelda="ticket" let-fila>
                  @let e = comoEncuesta(fila);
                  <strong ayText="mono" size="xs">{{ e.ticketNum }}</strong>
                </ng-template>
                <ng-template ayCelda="gestor" let-fila>
                  @let e = comoEncuesta(fila);
                  <span>{{ e.gestor }} ({{ areaEs(e.area) }})</span>
                </ng-template>
                <ng-template ayCelda="metricas" let-fila>
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

  readonly subvista = input.required<SubvistaEspecializadaAtc>();
  readonly tickets = input<TicketAtc[]>([]);
  readonly asientosLibro = input.required<AsientoLibro[]>();
  readonly casosSgd = input.required<CasoSgd[]>();
  readonly casosMorosidad = input.required<CasoMorosidad[]>();
  readonly garantias = input.required<ReclamoGarantia[]>();
  readonly asistentes = input.required<AsistenteProyecto[]>();
  readonly buses = input.required<BusEntregaFest[]>();
  readonly mostrarHu = input<boolean>(false);

  readonly verContrato = output<string>();
  readonly seleccionarTicket = output<string>();
  readonly irANuevo = output<void>();

  readonly avisoOperacion = signal<string | null>(null);

  /* ── Pestañas de cada vista 5181 ── */
  readonly tabConfig = signal<string>('flujos');
  readonly tabsConfiguracion = computed<AyTabsElemento[]>(() => [
    { value: 'flujos', label: 'Flujos', contador: this.estadoProto.flujosPorTipo().length },
    { value: 'guias', label: 'Guías', contador: this.estadoProto.guiasPorTipo().length },
    { value: 'alertas', label: 'Alertas', contador: this.estadoProto.alertasAdmin().length },
  ]);

  readonly tabUrbeMind = signal<string>('api');
  readonly tabsUrbeMind = computed<AyTabsElemento[]>(() => [
    { value: 'api', label: 'API', contador: this.estadoProto.llamadasUrbeMind().length },
    { value: 'eventos', label: 'Eventos', contador: this.estadoProto.eventosUrbeMind().length },
  ]);

  readonly tabLibro = signal<string>('asientos');
  readonly tabsLibro = computed<AyTabsElemento[]>(() => [
    { value: 'asientos', label: 'Asientos', contador: this.asientosLibro().length },
    { value: 'alertas', label: 'Alertas legales', contador: this.estadoProto.alertasLegalesLibro().length },
    { value: 'huerfanos', label: 'Huérfanos', contador: 0 },
  ]);

  readonly tabSgd = signal<string>('casos');
  readonly tabsMesaSgd = computed<AyTabsElemento[]>(() => [
    { value: 'casos', label: 'Casos', contador: this.casosSgd().length },
    { value: 'limbo', label: 'En limbo', contador: 1 },
    { value: 'escalamientos', label: 'Escalamientos', contador: 2 },
  ]);

  readonly tabTorre = signal<string>('tablero');
  readonly tabsTorreCx: AyTabsElemento[] = [
    { value: 'tablero', label: 'Tablero' },
    { value: 'riesgo', label: 'Riesgo de denuncia' },
    { value: 'encuestas', label: 'Encuestas' },
    { value: 'informes', label: 'Informes' },
    { value: 'auditoria', label: 'Auditoría de datos' },
  ];

  /* ── Columnas de tablas ── */
  readonly columnasFlujosConfig: readonly AyColumna[] = [
    { clave: 'tipo', cabecera: 'Tipo de ticket', ancho: '14rem' },
    { clave: 'area', cabecera: 'Área receptora', ancho: '9rem' },
    { clave: 'version', cabecera: 'Versión', ancho: '6rem' },
    { clave: 'pasos', cabecera: 'Pasos y responsables' },
    { clave: 'accion', cabecera: 'Acción', alineacion: 'end', ancho: '7rem' },
  ];

  readonly columnasGuiasConfig: readonly AyColumna[] = [
    { clave: 'tipo', cabecera: 'Tipo de ticket', ancho: '15rem' },
    { clave: 'vigente', cabecera: 'Versión vigente', ancho: '9rem' },
    { clave: 'resumen', cabecera: 'Contenido publicado' },
    { clave: 'accion', cabecera: 'Acción', alineacion: 'end', ancho: '9rem' },
  ];

  readonly columnasAlertasAdmin: readonly AyColumna[] = [
    { clave: 'fecha', cabecera: 'Fecha', ancho: '9rem' },
    { clave: 'alerta', cabecera: 'Alerta', ancho: '15rem' },
    { clave: 'tipo', cabecera: 'Tipo', ancho: '7rem' },
    { clave: 'detalle', cabecera: 'Detalle' },
  ];

  readonly columnasPoliticasSla: readonly AyColumna[] = [
    { clave: 'id', cabecera: 'Política', ancho: '10rem' },
    { clave: 'alcance', cabecera: 'Alcance', ancho: '14rem' },
    { clave: 'tipo', cabecera: 'Tipo y Prioridad' },
    { clave: 'respuesta', cabecera: '1.ª respuesta', ancho: '8rem' },
    { clave: 'resolucion', cabecera: 'Resolución', ancho: '8rem' },
    { clave: 'version', cabecera: 'Versión', ancho: '6rem' },
    { clave: 'accion', cabecera: 'Acción', alineacion: 'end', ancho: '7rem' },
  ];

  readonly columnasPreviewReasignar: readonly AyColumna[] = [
    { clave: 'num', cabecera: 'Ticket', ancho: '8rem' },
    { clave: 'resumen', cabecera: 'Solicitud' },
    { clave: 'destino', cabecera: 'Pasará a', ancho: '11rem' },
  ];

  readonly columnasAlertasSla: readonly AyColumna[] = [
    { clave: 'ticket', cabecera: 'Ticket', ancho: '8rem' },
    { clave: 'tipo', cabecera: 'Tipo de incumplimiento' },
    { clave: 'ciclo', cabecera: 'Ciclo', ancho: '8rem' },
    { clave: 'vence', cabecera: 'Vencimiento evaluado', ancho: '10rem' },
    { clave: 'destinatario', cabecera: 'Destinatario y canal', ancho: '15rem' },
  ];

  readonly columnasCorridasJob: readonly AyColumna[] = [
    { clave: 'fecha', cabecera: 'Corrida', ancho: '10rem' },
    { clave: 'revisados', cabecera: 'Evaluados' },
    { clave: 'nuevas', cabecera: 'Resultado', ancho: '9rem' },
  ];

  readonly columnasCierreE2E: readonly AyColumna[] = [
    { clave: 'ticket', cabecera: 'Ticket y resumen' },
    { clave: 'eje', cabecera: 'Eje y objetivo', ancho: '10rem' },
    { clave: 'avance', cabecera: 'Horas hábiles consumidas', ancho: '16rem' },
    { clave: 'situacion', cabecera: 'Situación', ancho: '10rem' },
  ];

  readonly columnasLlamadasUrbeMind: readonly AyColumna[] = [
    { clave: 'operacion', cabecera: 'Operación y respuesta' },
    { clave: 'estado', cabecera: 'HTTP', ancho: '7rem' },
  ];

  readonly columnasEventosUrbeMind: readonly AyColumna[] = [
    { clave: 'tipo', cabecera: 'Evento', ancho: '13rem' },
    { clave: 'ticket', cabecera: 'Ticket', ancho: '8rem' },
    { clave: 'estado', cabecera: 'Entrega', ancho: '14rem' },
    { clave: 'detalle', cabecera: 'Detalle' },
  ];

  readonly columnasMorosidad5181: readonly AyColumna[] = [
    { clave: 'ticket', cabecera: 'Ticket', ancho: '8rem' },
    { clave: 'cliente', cabecera: 'Cliente y Proyecto' },
    { clave: 'deuda', cabecera: 'Deuda vencida', ancho: '11rem' },
    { clave: 'estado', cabecera: 'Estado', ancho: '11rem' },
    { clave: 'carta', cabecera: 'Carta al responsable', ancho: '14rem' },
    { clave: 'accion', cabecera: 'Acciones', alineacion: 'end', ancho: '13rem' },
  ];

  readonly columnasReservasBus: readonly AyColumna[] = [
    { clave: 'cliente', cabecera: 'Cliente convocado' },
    { clave: 'bus', cabecera: 'Bus y horario', ancho: '13rem' },
    { clave: 'punto', cabecera: 'Punto de embarque' },
    { clave: 'personas', cabecera: 'Personas', ancho: '9rem' },
    { clave: 'estado', cabecera: 'Estado', ancho: '10rem' },
    { clave: 'accion', cabecera: 'Acción', alineacion: 'end', ancho: '9rem' },
  ];

  readonly columnasCasosEvento: readonly AyColumna[] = [
    { clave: 'ticket', cabecera: 'Ticket', ancho: '8rem' },
    { clave: 'cliente', cabecera: 'Cliente / Proyecto' },
    { clave: 'criticidad', cabecera: 'Criticidad', ancho: '8rem' },
    { clave: 'situacion', cabecera: 'Estación 4', alineacion: 'end', ancho: '11rem' },
  ];

  readonly columnasEncuestasCx: readonly AyColumna[] = [
    { clave: 'ticket', cabecera: 'Ticket', ancho: '8rem' },
    { clave: 'gestor', cabecera: 'Gestor y Área', ancho: '13rem' },
    { clave: 'metricas', cabecera: 'Calificación', ancho: '15rem' },
    { clave: 'comentario', cabecera: 'Comentario del cliente' },
  ];

  readonly columnasLibro: readonly AyColumna[] = [
    { clave: 'asiento', cabecera: 'Asiento / Establecimiento', ancho: '13rem' },
    { clave: 'ticket', cabecera: 'Ticket Padre', ancho: '8rem' },
    { clave: 'kind', cabecera: 'Tipo / Monto', ancho: '9rem' },
    { clave: 'cli', cabecera: 'Cliente y Hechos' },
    { clave: 'plazo', cabecera: 'Plazo Legal (15 d)', ancho: '11rem' },
    { clave: 'prorroga', cabecera: 'Prórroga Única', ancho: '11rem' },
    { clave: 'respuesta', cabecera: 'Respuesta / Apelación', ancho: '15rem' },
  ];

  readonly columnasSgd: readonly AyColumna[] = [
    { clave: 'code', cabecera: 'Código SGD', ancho: '9rem' },
    { clave: 'line', cabecera: 'Línea / Cliente' },
    { clave: 'cargo', cabecera: 'Cargo Previo vs. Activación' },
    { clave: 'linked', cabecera: 'Vínculo Cruzado', ancho: '8rem' },
    { clave: 'estado', cabecera: 'Estado / Custodia GLI', alineacion: 'end', ancho: '12rem' },
  ];

  readonly columnasGarantias: readonly AyColumna[] = [
    { clave: 'id', cabecera: 'ID Garantía / Ticket', ancho: '11rem' },
    { clave: 'unit', cabecera: 'Unidad / Acta de Entrega' },
    { clave: 'type', cabecera: 'Rubro y Cobertura', ancho: '13rem' },
    { clave: 'insp', cabecera: 'Inspección Técnica', ancho: '13rem' },
    { clave: 'state', cabecera: 'Estado / Escalamiento Eje 3', alineacion: 'end', ancho: '18rem' },
  ];

  /* ── Estado de edición de Configuración (Flujos y Guías) ── */
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
      return { ticket: t, horas, limite, pct, tono, etiqueta };
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

  readonly imputacionPenalDetectada = computed(() => {
    const t = this.textoEvento().toLowerCase();
    return ['estafa', 'robo', 'fiscalía', 'fiscalia', 'denuncia penal', 'delito'].some((w) =>
      t.includes(w),
    );
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
  comoAsiento(fila: unknown): AsientoLibro {
    return fila as AsientoLibro;
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

  /* ── Acciones de Configuración (Flujos y Guías) ── */
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
    );
    this.flujoEditando.set(null);
    this.avisoOperacion.set(
      `Flujo de «${nuevo.nombreTipo}» actualizado a v${nuevo.versionActual} (Área: ${etiqueta(AREA_ES, nuevo.area)}). Los nuevos tickets en «Nuevo ticket» aplicarán esta versión.`,
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
  registrarIngresoProyecto(): void {
    const nombre = this.nuevoAsistenteNombre().trim();
    if (!nombre) return;
    const proy = this.nuevoAsistenteProyecto();
    if (proy.includes('sin responsable')) {
      this.estadoProto.alertasAdmin.update((prev) => [
        {
          id: `adm-proy-${Date.now()}`,
          fecha: AHORA_BASE,
          codigo: 'PROYECTO_SIN_RESPONSABLE',
          etiqueta: 'Proyecto sin responsable en el maestro',
          tipoTicket: 'ING',
          detalle: `Se registró un ingreso para «${proy}» y se derivó a supervisión comercial por falta de responsable en el maestro.`,
        },
        ...prev,
      ]);
    }
    this.asistentes().unshift({
      id: `ING-0${this.asistentes().length + 1}`,
      nombre,
      dni: this.nuevoAsistenteDni().trim() || '7000••••',
      proyecto: proy,
      lote: this.nuevoAsistenteLote().trim() || 'Visita general',
      acompanantes: 1,
      hora: '10:40',
    });
    this.nuevoAsistenteNombre.set('');
    this.nuevoAsistenteDni.set('');
    this.nuevoAsistenteLote.set('');
    this.avisoOperacion.set(`Ingreso de ${nombre} registrado y notificado al responsable del proyecto.`);
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
    const acomp = Number(this.formBusAcompanantes()) || 0;
    const libres = this.cuposLibresBus(busId);
    const entra = libres >= 1 + acomp;
    const nueva: ReservaBusFestItem = {
      id: `res-${Date.now()}`,
      clienteId: 'cli-nuevo',
      clienteNombre: 'María Quispe Huamán (Mi Portal)',
      busId,
      punto: this.formBusPunto(),
      acompanantes: acomp,
      estado: entra ? 'CONFIRMADA' : 'EN_ESPERA',
      ticketNum: 'AIN-000495',
      fecha: AHORA_BASE,
    };
    this.estadoProto.reservasBusFest.update((prev) => [nueva, ...prev]);
    this.avisoOperacion.set(
      entra
        ? `Reserva confirmada en ${this.nombreBus(busId)} (${1 + acomp} personas).`
        : `El bus no tenía cupo suficiente: quedaste registrado en la lista de espera.`,
    );
  }

  cancelarReservaBus(r: ReservaBusFestItem): void {
    this.estadoProto.reservasBusFest.update((lista) =>
      lista.map((item) => (item.id === r.id ? { ...item, estado: 'CANCELADA' } : item)),
    );
    this.avisoOperacion.set(`Reserva de ${r.clienteNombre} cancelada y cupo liberado.`);
  }

  /* ── Acciones de Libro, SGD, Garantías, Evento y Torre ── */
  plazoLibro(b: AsientoLibro): { tono: 'success' | 'warning' | 'danger'; texto: string; vence: string } {
    const diasPlazo = b.ext ? 30 : 15;
    const venceDate = sumarDiasHabiles(b.reg, diasPlazo);
    if (b.resp) {
      return { tono: 'success', texto: 'Respondido en plazo', vence: fmtFecha(venceDate) };
    }
    const rest = diasHabilesEntre(AHORA_BASE, venceDate);
    if (rest < 0) return { tono: 'danger', texto: `Vencido (${Math.abs(rest)} d)`, vence: fmtFecha(venceDate) };
    if (rest <= 5) return { tono: 'warning', texto: `Quedan ${rest} d hábiles`, vence: fmtFecha(venceDate) };
    return { tono: 'success', texto: `Quedan ${rest} d hábiles`, vence: fmtFecha(venceDate) };
  }

  aplicarProrrogaUnica(b: AsientoLibro): void {
    b.ext = true;
    b.extJustificacion =
      'Complejidad pericial / conciliación histórica comunicada al consumidor dentro de los primeros 15 días.';
    this.avisoOperacion.set(`Prórroga única (+15 días hábiles) registrada para el asiento ${b.co}-2026-${b.n}.`);
  }

  emitirRespuestaConCargo(b: AsientoLibro): void {
    b.resp = AHORA_BASE;
    b.respResumen = 'Carta formal emitida con cargo de entrega custodiado en GLI.';
    this.avisoOperacion.set(`Respuesta formal con cargo registrada para ${b.co}-2026-${b.n}.`);
  }

  registrarApelacionIndecopi(b: AsientoLibro): void {
    b.appeal = {
      to: 'INDECOPI',
      st: 'EN DESCARGOS LEGAL',
      caseNo: `0891-2026/ILN-PS0`,
    };
    this.avisoOperacion.set(`Apelación ante INDECOPI registrada con expediente ${b.appeal.caseNo}.`);
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
    c.estacion4 = {
      fecha: AHORA_BASE,
      motivo: 'Derivado en vivo a Estación 4 Legal aplicando protocolo de frases ancla.',
      autor: this.estadoProto.perfilActivo().nombre,
    };
    this.avisoOperacion.set(`Caso ${c.ticketNum} derivado a la Estación 4 (Legal).`);
  }

  registrarCasoEnEntregaFest(): void {
    const txt = this.textoEvento().trim() || 'Consulta presencial registrada en mesa de EntregaFest.';
    const penal = this.imputacionPenalDetectada();
    const nuevo: CasoEventoFestItem = {
      id: `ev-${Date.now()}`,
      ticketNum: `AIN-000${510 + this.estadoProto.casosEventoFest().length}`,
      cliente: 'Asistente Convocado EntregaFest',
      dni: '4412••••',
      proyecto: 'Villa Sol II · Mz. C',
      categoria: penal ? 'LEGAL_CONFLICTO' : 'ENTREGA',
      criticidad: penal ? 'CRITICA' : 'ALTA',
      resumen: txt,
      imputacionPenal: penal,
      registrado: AHORA_BASE,
      primeraAtencion: AHORA_BASE,
      estacion4: penal
        ? {
            fecha: AHORA_BASE,
            motivo: 'Imputación penal detectada automáticamente al registrar.',
            autor: this.estadoProto.perfilActivo().nombre,
          }
        : null,
    };
    this.estadoProto.casosEventoFest.update((prev) => [nuevo, ...prev]);
    this.textoEvento.set('');
    this.avisoOperacion.set(
      penal
        ? `Caso ${nuevo.ticketNum} registrado con criticidad CRÍTICA y derivado a Estación 4 Legal.`
        : `Caso ${nuevo.ticketNum} registrado en el tablero de EntregaFest en vivo.`,
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
