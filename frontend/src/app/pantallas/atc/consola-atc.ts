import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  AyAlert,
  AyAppearancePanel,
  AyAvatar,
  AyBadge,
  AyBreadcrumb,
  AyButton,
  AyCard,
  AyCardBody,
  AyCardHeader,
  AyCardPairs,
  AyCelda,
  AyCommandPalette,
  AyDivider,
  AyDrawer,
  AyDropdownMenu,
  AyEmptyState,
  AyHeading,
  AyIconButton,
  AyModal,
  AyNavbar,
  AyPageHeader,
  AyRow,
  AySearchInput,
  AySegmentedControl,
  AySidePanel,
  AySidebar,
  AySkipLink,
  AyStack,
  AyTable,
  AyTableToolbar,
  AyTabs,
  AyText,
  AyToggleButton,
  type AyBreadcrumbNivel,
  type AyColumna,
  type AyGrupoComandos,
  type AyMenuItem,
  type AySegmentoOpcion,
  type AySidebarGrupo,
  type AyTabsElemento,
  type ParCardPairs,
} from '@aybarcorp/ui-angular';
import { Acceso } from '../../acceso';
import { BotonTema } from '../boton-tema';
import {
  AHORA_BASE,
  CATALOGO_60_HUS,
  CONTRATOS_ATC,
  EMPRESAS_AYBAR,
  crearAsientosLibroDemo,
  crearAsistentesDemo,
  crearBusesDemo,
  crearCasosMorosidadDemo,
  crearCasosSgdDemo,
  crearGarantiasDemo,
  crearTicketsDemo,
  type AsientoLibro,
  type ContratoInmobiliarioAtc,
  type CuotaCronogramaContratoAtc,
  type FirmanteContratoAtc,
  type HuReferencia,
  type TicketAtc,
  type VistaAtc,
} from './datos-atc';
import { VistaC360Component, type DestinoRedireccionNodo } from './vista-c360';
import { VistaEspecializadaComponent } from './vista-especializada';
import { VistaOperacionComponent } from './vista-operacion';
import { VistaVivoComponent } from './vista-vivo';

interface ItemMenuAtc {
  readonly id: VistaAtc;
  readonly grupo: 'ESTRELLA' | 'OPERACION' | 'ESPECIALIZADA';
  readonly titulo: string;
  readonly subtitulo: string;
  readonly icono: string;
}

export interface PerspectivaUsuarioAtc {
  readonly id: 'gestor' | 'supervisor' | 'legal' | 'cx' | 'postventa';
  readonly usuario: string;
  readonly clave: string;
  readonly nombre: string;
  readonly cargo: string;
  readonly rol360: 'gestor' | 'supervisor' | 'legal' | 'cx';
  readonly nodoInicial360: string;
  readonly vistaPrincipal: VistaAtc;
  readonly resumenPerspectiva: string;
  readonly modulosClave: readonly VistaAtc[];
}

@Component({
  selector: 'app-consola-atc',
  standalone: true,
  imports: [
    AyAlert,
    AyAppearancePanel,
    AyAvatar,
    AyBadge,
    AyBreadcrumb,
    AyButton,
    AyCard,
    AyCardBody,
    AyCardHeader,
    AyCardPairs,
    AyCelda,
    AyCommandPalette,
    AyDivider,
    AyDrawer,
    AyDropdownMenu,
    AyEmptyState,
    AyHeading,
    AyIconButton,
    AyModal,
    AyNavbar,
    AyPageHeader,
    AyRow,
    AySearchInput,
    AySegmentedControl,
    AySidePanel,
    AySidebar,
    AySkipLink,
    AyStack,
    AyTable,
    AyTableToolbar,
    AyTabs,
    AyText,
    AyToggleButton,
    BotonTema,
    VistaC360Component,
    VistaVivoComponent,
    VistaOperacionComponent,
    VistaEspecializadaComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pl-atc-marco' },
  template: `
    <ay-skip-link [destinos]="destinosSalto" margenAnclaje="var(--pl-atc-navbar-alto, 0px)" />

    <ay-navbar
      [conMenuMovil]="true"
      [menuAbierto]="navegacionMovilAbierta()"
      idDrawer="atc-nav-movil"
      (menuClick)="navegacionMovilAbierta.set(true)"
    >
      <a
        ayMarca
        class="ay-navbar__brand pl-marca"
        href="#vista:c360"
        (click)="$event.preventDefault(); vistaActiva.set('c360')"
      >
        <svg class="pl-marca__simbolo" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
          <rect width="32" height="32" rx="8" fill="currentColor" />
          <path class="pl-marca__letra" d="M9 24 16 8l7 16h-3.6l-1.4-3.4h-4L12.6 24Zm6-6.4h2.1L16 14.9Z" />
        </svg>
        <span>Aybar Atiende</span>
        <ay-badge size="sm" tono="info">ATC</ay-badge>
      </a>

      <div ayBusqueda>
        <ay-search-input
          etiqueta="Buscar módulo, HU o contrato"
          placeholder="Buscar en 60 HUs, módulos o contratos (Ctrl+K)…"
          size="sm"
          [valor]="consultaPaleta()"
          (focus)="paletaAbierta.set(true)"
          (valorChange)="consultaPaleta.set($event); paletaAbierta.set(true)"
        />
      </div>

      <ng-container ayAcciones>
        <ay-segmented-control
          etiqueta="Ver como"
          size="sm"
          [opciones]="opcionesPerspectivas"
          [valor]="perspectivaId()"
          (valorChange)="alCambiarPerspectivaId($event)"
        />
        <ay-toggle-button
          tamano="sm"
          [presionado]="personalizarAbierto()"
          (presionadoChange)="personalizarAbierto.set($event)"
        >
          Personalizar
        </ay-toggle-button>
        <app-boton-tema />
        <ay-dropdown-menu
          class="pl-usuario"
          colocacion="bottom-end"
          [items]="menuCuenta()"
          (elegido)="alElegirCuenta($event)"
        >
          <ay-icon-button ayDisparador [etiqueta]="'Cuenta de ' + perspectivaActual().nombre">
            <ay-avatar [nombre]="perspectivaActual().nombre" size="sm" estado="online" decorativo />
          </ay-icon-button>
        </ay-dropdown-menu>
      </ng-container>
    </ay-navbar>

    <div class="pl-atc-cuerpo">
      <div class="pl-atc-lateral" (click)="alInterceptarEnlaceSidebar($event)">
        <ay-sidebar
          etiqueta="Módulos de Aybar Atiende"
          [grupos]="gruposSidebar()"
          [(colapsada)]="lateralPlegado"
        >
          <div ayPie ayStack gap="2">
            <ay-button
              tamano="sm"
              variante="ghost"
              [bloque]="true"
              (click)="irAPantallaLogin()"
            >
              Cerrar sesión
            </ay-button>
          </div>
        </ay-sidebar>
      </div>

      <main id="atc-contenido" class="pl-atc-principal" tabindex="-1">
        <div ayStack gap="6">
          <ay-page-header
            [titulo]="itemMenuActual().titulo"
            [descripcion]="itemMenuActual().subtitulo"
            size="md"
          >
            <ay-breadcrumb ayRuta etiqueta="Ruta del módulo" [items]="migasActuales()" />
            <div ayEstado ayRow gap="2" [ajuste]="true">
              <ay-badge tono="success" [punto]="true">En línea · 8 sistemas</ay-badge>
              <ay-badge tono="info">{{ perspectivaActual().nombre }} ({{ perspectivaActual().cargo }})</ay-badge>
              @if (empresaFiltro()) {
                <ay-badge tono="warning">Filtro: {{ empresaFiltro() }}</ay-badge>
              }
            </div>
            <div ayAcciones ayRow gap="2" [ajuste]="true">
              <ay-toggle-button
                tamano="sm"
                [(presionado)]="mostrarTrazabilidadHu"
              >
                Trazabilidad HUs
              </ay-toggle-button>
              <ay-button
                tamano="sm"
                variante="secondary"
                (click)="modalCatalogoHuAbierto.set(true)"
              >
                Catálogo 60 HUs
              </ay-button>
              <ay-button
                tamano="sm"
                variante="secondary"
                (click)="abrirContrato(contratoSeleccionadoCodigo())"
              >
                Visor de Contratos ({{ contratoSeleccionadoCodigo() }})
              </ay-button>
            </div>
          </ay-page-header>

          @switch (vistaActiva()) {
            @case ('c360') {
              <app-vista-c360
                [mostrarHu]="mostrarTrazabilidadHu()"
                [rolExterno]="perspectivaActual().rol360"
                [nodoFocoExterno]="perspectivaActual().nodoInicial360"
                (crearTicketDesde360)="alCrearDesde360($event)"
                (verContrato)="abrirContrato($event)"
                (redirigirModulo)="alRedirigirDesde360($event)"
              />
            }
            @case ('vivo') {
              <app-vista-vivo
                [mostrarHu]="mostrarTrazabilidadHu()"
                (seleccionarTicket)="alSeleccionarTicket($event)"
                (irABandeja)="vistaActiva.set('bandeja')"
              />
            }
            @case ('bandeja') {
              <app-vista-operacion
                subvista="bandeja"
                [tickets]="ticketsVisibles()"
                [ticketSeleccionadoNum]="ticketSeleccionadoNum()"
                [filtroClienteExterno]="filtroBandejaCliente()"
                [mostrarHu]="mostrarTrazabilidadHu()"
                (seleccionarTicket)="alSeleccionarTicket($event)"
                (verContrato)="abrirContrato($event)"
                (irANuevo)="vistaActiva.set('nuevo')"
                (irA360)="vistaActiva.set('c360')"
              />
            }
            @case ('nuevo') {
              <app-vista-operacion
                subvista="nuevo"
                [tickets]="ticketsVisibles()"
                [ticketSeleccionadoNum]="ticketSeleccionadoNum()"
                [mostrarHu]="mostrarTrazabilidadHu()"
                (ticketCreado)="alCrearTicket($event)"
              />
            }
            @case ('detalle') {
              <app-vista-operacion
                subvista="detalle"
                [tickets]="ticketsVisibles()"
                [ticketSeleccionadoNum]="ticketSeleccionadoNum()"
                [mostrarHu]="mostrarTrazabilidadHu()"
                (verContrato)="abrirContrato($event)"
              />
            }
            @case ('libro') {
              <app-vista-especializada
                subvista="libro"
                [asientosLibro]="asientosLibro()"
                [casosSgd]="casosSgd()"
                [casosMorosidad]="casosMorosidad()"
                [garantias]="garantias()"
                [asistentes]="asistentes()"
                [buses]="buses()"
                [mostrarHu]="mostrarTrazabilidadHu()"
                (verContrato)="abrirContrato($event)"
              />
            }
            @case ('sgd') {
              <app-vista-especializada
                subvista="sgd"
                [asientosLibro]="asientosLibro()"
                [casosSgd]="casosSgd()"
                [casosMorosidad]="casosMorosidad()"
                [garantias]="garantias()"
                [asistentes]="asistentes()"
                [buses]="buses()"
                [mostrarHu]="mostrarTrazabilidadHu()"
                (verContrato)="abrirContrato($event)"
              />
            }
            @case ('garantias') {
              <app-vista-especializada
                subvista="garantias"
                [asientosLibro]="asientosLibro()"
                [casosSgd]="casosSgd()"
                [casosMorosidad]="casosMorosidad()"
                [garantias]="garantias()"
                [asistentes]="asistentes()"
                [buses]="buses()"
                [mostrarHu]="mostrarTrazabilidadHu()"
                (verContrato)="abrirContrato($event)"
              />
            }
            @case ('evento') {
              <app-vista-especializada
                subvista="evento"
                [asientosLibro]="asientosLibro()"
                [casosSgd]="casosSgd()"
                [casosMorosidad]="casosMorosidad()"
                [garantias]="garantias()"
                [asistentes]="asistentes()"
                [buses]="buses()"
                [mostrarHu]="mostrarTrazabilidadHu()"
                (verContrato)="abrirContrato($event)"
              />
            }
            @case ('torre') {
              <app-vista-especializada
                subvista="torre"
                [asientosLibro]="asientosLibro()"
                [casosSgd]="casosSgd()"
                [casosMorosidad]="casosMorosidad()"
                [garantias]="garantias()"
                [asistentes]="asistentes()"
                [buses]="buses()"
                [mostrarHu]="mostrarTrazabilidadHu()"
                (verContrato)="abrirContrato($event)"
              />
            }
          }
        </div>
      </main>

      <ay-side-panel
        id="atc-personalizar"
        titulo="Personalizar apariencia"
        lado="end"
        size="md"
        redimensionable
        [abierto]="personalizarAbierto()"
        (abiertoChange)="personalizarAbierto.set($event)"
      >
        <div ayStack gap="4">
          <p ayText="body" size="sm">
            Cambia paleta, acento, densidad, radio y profundidad en tiempo real usando los tokens del sistema de diseño Aybar.
          </p>
          <ay-appearance-panel titulo="Apariencia" [nivelTitulo]="3" mostrarPresets />
        </div>
      </ay-side-panel>
    </div>

    <!-- Navegación móvil en Drawer oficial -->
    <ay-drawer
      id="atc-nav-movil"
      titulo="Aybar Atiende"
      lado="start"
      size="sm"
      [(abierto)]="navegacionMovilAbierta"
    >
      <div ayStack gap="3">
        @for (grupo of gruposSidebar(); track grupo.etiqueta) {
          <ay-heading [nivel]="3" size="sm">{{ grupo.etiqueta }}</ay-heading>
          <div ayStack gap="1">
            @for (el of grupo.elementos; track el.href) {
              <ay-button
                tamano="sm"
                [variante]="el.actual ? 'primary' : 'ghost'"
                [bloque]="true"
                (click)="irAVistaDesdeHref(el.href); navegacionMovilAbierta.set(false)"
              >
                {{ el.etiqueta }}
              </ay-button>
            }
          </div>
        }
      </div>
    </ay-drawer>

    <!-- Paleta de comandos global (60 HUs, módulos y contratos) -->
    <ay-command-palette
      etiqueta="Buscar en Aybar Atiende"
      size="lg"
      mensajeVacio="No se encontraron módulos, contratos ni historias con ese criterio."
      [filtroLocal]="false"
      [grupos]="gruposComandos()"
      [(abierta)]="paletaAbierta"
      (consultaChange)="consultaPaleta.set($event)"
    />

    <!-- ====================================================================== -->
    <!-- MODAL INTERACTIVO: VISOR DE CONTRATO INMOBILIARIO, ADENDAS Y CRONOGRAMA -->
    <!-- ====================================================================== -->
    <ay-modal
      size="lg"
      [abierto]="modalContratoAbierto()"
      (abiertoChange)="modalContratoAbierto.set($event)"
      [titulo]="'Expediente Contractual Inmobiliario · ' + contratoActual().codigo"
    >
      @if (contratoActual(); as ctr) {
        <div ayStack gap="4">
          <ay-card superficie="solid">
            <ay-card-body padding="sm" gap="sm">
              <div ayRow gap="3" justificar="between" [ajuste]="true">
                <div ayStack gap="1">
                  <span ayText="label" size="xs">Seleccionar expediente contractual (SIGDA / GLI)</span>
                  <div ayRow gap="2" [ajuste]="true">
                    @for (c of contratos; track c.codigo) {
                      <ay-button
                        tamano="sm"
                        [variante]="ctr.codigo === c.codigo ? 'primary' : 'secondary'"
                        (click)="contratoSeleccionadoCodigo.set(c.codigo)"
                      >
                        {{ c.codigo }} · {{ c.clienteNombre.split(' ')[0] }}
                      </ay-button>
                    }
                  </div>
                </div>
                <div ayRow gap="2" [ajuste]="true">
                  <ay-badge
                    [tono]="
                      ctr.estado === 'VIGENTE'
                        ? 'success'
                        : ctr.estado === 'EN_EVALUACION_RESOLUCION'
                          ? 'danger'
                          : 'info'
                    "
                  >
                    {{ ctr.estado }}
                  </ay-badge>
                  <ay-badge tono="neutral">{{ ctr.tipo }}</ay-badge>
                </div>
              </div>
            </ay-card-body>
          </ay-card>

          <ay-card superficie="solid">
            <ay-card-header
              titulo="Ficha Registral y Financiera"
              [subtitulo]="ctr.proyecto + ' · ' + ctr.etapa + ' · ' + ctr.manzanaLote"
              nivel="h3"
              [separador]="true"
            />
            <ay-card-body padding="sm">
              <ay-card-pairs [pares]="paresResumenContrato(ctr)" />
            </ay-card-body>
          </ay-card>

          <ay-tabs
            etiqueta="Secciones del expediente contractual"
            variante="underline"
            size="sm"
            [items]="itemsPestanasContrato(ctr)"
            [valor]="pestanaContrato()"
            (valorChange)="alCambiarPestanaContrato($event)"
          >
            @switch (pestanaContrato()) {
              @case ('clausulas') {
                <div ayStack gap="3">
                  <ay-alert tono="info" [titulo]="'Zonificación y Linderos (' + ctr.zonificacion + ')'" size="sm">
                    {{ ctr.linderos }}
                  </ay-alert>
                  @for (cl of ctr.clausulas; track cl.numero) {
                    <ay-card superficie="solid">
                      <ay-card-header
                        [titulo]="cl.numero + ' CLÁUSULA — ' + cl.titulo"
                        nivel="h4"
                        [separador]="true"
                      >
                        @if (cl.alerta) {
                          <div ayAcciones>
                            <ay-badge size="sm" tono="danger">{{ cl.alerta }}</ay-badge>
                          </div>
                        }
                      </ay-card-header>
                      <ay-card-body padding="sm">
                        <p ayText="body" size="sm">{{ cl.contenido }}</p>
                      </ay-card-body>
                    </ay-card>
                  }
                </div>
              }
              @case ('adendas') {
                <div ayStack gap="3">
                  @for (ad of ctr.adendas; track ad.codigo) {
                    <ay-card superficie="solid">
                      <ay-card-header
                        [titulo]="ad.codigo + ' · ' + ad.titulo"
                        [subtitulo]="'Fecha de suscripción: ' + ad.fecha"
                        nivel="h4"
                        [separador]="true"
                      >
                        <div ayAcciones>
                          <ay-badge size="sm" [tono]="ad.estado === 'FIRMADA' ? 'success' : 'warning'">
                            {{ ad.estado }}
                          </ay-badge>
                        </div>
                      </ay-card-header>
                      <ay-card-body padding="sm" gap="sm">
                        <strong ayText="label" size="sm">{{ ad.resumen }}</strong>
                        <p ayText="body" size="sm">{{ ad.detalleClausula }}</p>
                      </ay-card-body>
                    </ay-card>
                  } @empty {
                    <ay-empty-state
                      size="compact"
                      titulo="Sin adendas modificatorias"
                      [descripcion]="'Se rige íntegramente por la minuta matriz firmada el ' + ctr.fechaSuscripcion + '.'"
                    />
                  }
                </div>
              }
              @case ('firmantes') {
                <ay-table
                  leyenda="Firmantes y custodia criptográfica del contrato"
                  [columnas]="columnasFirmantes"
                  [filas]="ctr.firmantes"
                  [rayada]="true"
                >
                  <ng-template ayCelda="rol" let-fila>
                    @let f = comoFirmante(fila);
                    <ay-badge size="sm" [tono]="f.rol === 'REPRESENTANTE_EMPRESA' ? 'info' : 'success'">
                      {{ f.rol }}
                    </ay-badge>
                  </ng-template>
                  <ng-template ayCelda="nombre" let-fila>
                    @let f = comoFirmante(fila);
                    <div ayStack gap="1">
                      <strong>{{ f.nombre }}</strong>
                      <span ayText="mono" size="xs">{{ f.documento }}</span>
                    </div>
                  </ng-template>
                  <ng-template ayCelda="fechaFirma" let-fila>
                    @let f = comoFirmante(fila);
                    <span ayText="mono" size="xs">{{ f.fechaFirma }}</span>
                  </ng-template>
                  <ng-template ayCelda="hashCustodia" let-fila>
                    @let f = comoFirmante(fila);
                    <span ayText="mono" size="xs">{{ f.hashCustodia }}</span>
                  </ng-template>
                </ay-table>
              }
              @case ('cronograma') {
                <ay-table
                  leyenda="Cronograma de letras y estado de conciliación"
                  [columnas]="columnasCronograma"
                  [filas]="ctr.cronograma"
                  [rayada]="true"
                >
                  <ng-template ayCelda="numero" let-fila>
                    @let cu = comoCuota(fila);
                    <strong ayText="mono" size="xs">Letra #{{ cu.numero }}</strong>
                  </ng-template>
                  <ng-template ayCelda="vencimiento" let-fila>
                    @let cu = comoCuota(fila);
                    <span ayText="mono" size="xs">{{ cu.vencimiento }}</span>
                  </ng-template>
                  <ng-template ayCelda="monto" let-fila>
                    @let cu = comoCuota(fila);
                    <strong>{{ cu.monto }}</strong>
                  </ng-template>
                  <ng-template ayCelda="estado" let-fila>
                    @let cu = comoCuota(fila);
                    <ay-badge
                      size="sm"
                      [tono]="
                        cu.estado === 'PAGADA'
                          ? 'success'
                          : cu.estado === 'VENCIDA'
                            ? 'danger'
                            : 'info'
                      "
                    >
                      {{ cu.estado }}
                    </ay-badge>
                  </ng-template>
                  <ng-template ayCelda="fechaPago" let-fila>
                    @let cu = comoCuota(fila);
                    <span ayText="mono" size="xs">{{ cu.fechaPago ?? '—' }}</span>
                  </ng-template>
                  <ng-template ayCelda="operacion" let-fila>
                    @let cu = comoCuota(fila);
                    <span ayText="mono" size="xs">{{ cu.operacion ?? 'Pendiente de abono' }}</span>
                  </ng-template>
                </ay-table>
              }
            }
          </ay-tabs>

          <ay-divider espaciado="none" />
          <div ayRow gap="2" justificar="between" [ajuste]="true">
            <span ayText="body" size="xs">
              Expediente digital sincronizado con Repositorio S3 / GLI (Kardex {{ ctr.kardexNotarial }})
            </span>
            <div ayRow gap="2" [ajuste]="true">
              <ay-button
                tamano="sm"
                variante="secondary"
                (click)="filtrarBandejaPorContrato(ctr)"
              >
                Ver tickets del titular en Bandeja
              </ay-button>
              @if (ctr.letrasVencidas >= 3) {
                <ay-button
                  tamano="sm"
                  variante="danger"
                  (click)="modalContratoAbierto.set(false); vistaActiva.set('sgd')"
                >
                  Ir a Mesa de Morosidad 3 Meses
                </ay-button>
              }
              <ay-button
                tamano="sm"
                variante="primary"
                (click)="modalContratoAbierto.set(false)"
              >
                Cerrar visor
              </ay-button>
            </div>
          </div>
        </div>
      }
    </ay-modal>

    <!-- Modal de consulta de catálogo funcional de 60 HUs -->
    <ay-modal
      size="lg"
      [abierto]="modalCatalogoHuAbierto()"
      (abiertoChange)="modalCatalogoHuAbierto.set($event)"
      titulo="Catálogo Funcional del Sistema (60 Historias de Usuario)"
    >
      <div ayStack gap="4">
        <ay-table-toolbar [recuento]="husFiltradas().length" etiquetaElemento="historias">
          <ay-search-input
            ayBusqueda
            etiqueta="Filtrar historias"
            size="sm"
            placeholder="Filtrar por código HU, feature o pantalla…"
            [valor]="filtroHu()"
            (valorChange)="filtroHu.set($event)"
          />
          <ng-container ayFiltros>
            <ay-segmented-control
              etiqueta="Filtrar por etapa"
              size="sm"
              [opciones]="opcionesEtapaHu"
              [valor]="filtroEtapa()"
              (valorChange)="alCambiarFiltroEtapa($event)"
            />
          </ng-container>
        </ay-table-toolbar>

        <ay-table
          leyenda="Catálogo de 60 Historias de Usuario"
          [columnas]="columnasCatalogoHu"
          [filas]="husFiltradas()"
          [cabeceraFija]="true"
          [rayada]="true"
        >
          <ng-template ayCelda="id" let-fila>
            @let hu = comoHu(fila);
            <div ayRow gap="2" [ajuste]="true">
              <strong ayText="mono" size="xs">{{ hu.id }}</strong>
              <ay-badge size="sm" tono="neutral">{{ hu.feature }}</ay-badge>
            </div>
          </ng-template>
          <ng-template ayCelda="titulo" let-fila>
            @let hu = comoHu(fila);
            <div ayStack gap="1">
              <span>{{ hu.titulo }}</span>
              <span ayText="body" size="xs">Módulo: {{ hu.pantalla }}</span>
            </div>
          </ng-template>
          <ng-template ayCelda="etapa" let-fila>
            @let hu = comoHu(fila);
            <ay-badge size="sm" [tono]="hu.etapa === 'Etapa 2' ? 'warning' : 'success'">
              {{ hu.etapa ?? 'Etapa 1' }}
            </ay-badge>
          </ng-template>
          <ng-template ayCelda="accion" let-fila>
            @let hu = comoHu(fila);
            <ay-button tamano="sm" variante="secondary" (click)="irAVistaDeHu(hu.vista)">
              Ir a vista →
            </ay-button>
          </ng-template>
          <ay-empty-state
            ayVacio
            variante="no-results"
            size="compact"
            titulo="Sin historias coincidentes"
            descripcion="Prueba con otro término o cambia el filtro de etapa."
          />
        </ay-table>
      </div>
    </ay-modal>
  `,
})
export class ConsolaAtcComponent {
  private readonly acceso = inject(Acceso);
  private readonly router = inject(Router);
  private readonly anfitrion: HTMLElement = inject(ElementRef).nativeElement;

  readonly destinosSalto = [{ id: 'atc-contenido', etiqueta: 'Saltar al contenido principal' }];
  readonly navegacionMovilAbierta = signal(false);
  readonly lateralPlegado = signal(false);
  readonly personalizarAbierto = signal(false);
  readonly paletaAbierta = signal(false);
  readonly consultaPaleta = signal('');

  readonly empresas = EMPRESAS_AYBAR;
  readonly catalogoHus = CATALOGO_60_HUS;
  readonly contratos = CONTRATOS_ATC;

  readonly perspectivasUsuarios: readonly PerspectivaUsuarioAtc[] = [
    {
      id: 'gestor',
      usuario: 'gestor',
      clave: 'demo-gestor',
      nombre: 'Ana Torres',
      cargo: 'Gestora de Tickets ATC',
      rol360: 'gestor',
      nodoInicial360: 'lote',
      vistaPrincipal: 'bandeja',
      resumenPerspectiva:
        'Atención multicanal y Consulta 360 estándar (con restricción sobre Estado de Cuenta reservado y Exposición Judicial), telefonía CTI y registro de tickets.',
      modulosClave: ['c360', 'bandeja', 'nuevo', 'detalle', 'libro', 'evento'],
    },
    {
      id: 'supervisor',
      usuario: 'supervisor',
      clave: 'demo-supervisor',
      nombre: 'Carlos Mendoza',
      cargo: 'Supervisor ATC',
      rol360: 'supervisor',
      nodoInicial360: 'ecta',
      vistaPrincipal: 'vivo',
      resumenPerspectiva:
        'Visibilidad total de los 16 nodos 360 (desbloquea Estado de Cuenta reservado), monitoreo de planta Operación en Vivo 3D, reasignación de colas y control de SLA.',
      modulosClave: [
        'c360',
        'vivo',
        'bandeja',
        'nuevo',
        'detalle',
        'libro',
        'sgd',
        'garantias',
        'evento',
        'torre',
      ],
    },
    {
      id: 'legal',
      usuario: 'legal',
      clave: 'demo-legal',
      nombre: 'Dra. Lucía Paredes',
      cargo: 'Especialista Legal / SGD',
      rol360: 'legal',
      nodoInicial360: 'expo',
      vistaPrincipal: 'sgd',
      resumenPerspectiva:
        'Desbloquea Exposición Regulatoria y Judicial en el Grafo 360, custodia documental 6/6, Comité SGD, resolución de contrato por morosidad y Libro INDECOPI.',
      modulosClave: ['c360', 'sgd', 'libro', 'detalle', 'bandeja'],
    },
    {
      id: 'cx',
      usuario: 'cx',
      clave: 'demo-cx',
      nombre: 'Rodrigo Vargas',
      cargo: 'Coordinador CX y Calidad',
      rol360: 'cx',
      nodoInicial360: 'tick',
      vistaPrincipal: 'torre',
      resumenPerspectiva:
        'Visibilidad integral en Consulta 360 para análisis de causa raíz, Torre de Control CX, métricas CSAT/NPS/FCR y prevención de escalamientos.',
      modulosClave: ['c360', 'vivo', 'torre', 'libro', 'bandeja'],
    },
    {
      id: 'postventa',
      usuario: 'postventa',
      clave: 'demo-postventa',
      nombre: 'Ing. Martín Salazar',
      cargo: 'Mesa Postventa y Garantías',
      rol360: 'supervisor',
      nodoInicial360: 'gar',
      vistaPrincipal: 'garantias',
      resumenPerspectiva:
        'Enfoque en Actas de Entrega y vigencia automática de Garantías por partida en el Grafo 360, inspecciones técnicas de campo y padrón EntregaFest.',
      modulosClave: ['c360', 'garantias', 'evento', 'detalle', 'bandeja'],
    },
  ];

  readonly opcionesPerspectivas: AySegmentoOpcion[] = [
    { valor: 'gestor', etiqueta: 'Gestor' },
    { valor: 'supervisor', etiqueta: 'Supervisor' },
    { valor: 'legal', etiqueta: 'Legal' },
    { valor: 'cx', etiqueta: 'CX' },
    { valor: 'postventa', etiqueta: 'Postventa' },
  ];

  readonly opcionesEtapaHu: AySegmentoOpcion[] = [
    { valor: 'TODAS', etiqueta: 'Todas (60)' },
    { valor: 'Etapa 1', etiqueta: 'Fase 1' },
    { valor: 'Etapa 2', etiqueta: 'Fase 2' },
  ];

  readonly columnasFirmantes: readonly AyColumna[] = [
    { clave: 'rol', cabecera: 'Rol Contractual' },
    { clave: 'nombre', cabecera: 'Nombre y Documento' },
    { clave: 'fechaFirma', cabecera: 'Fecha y Hora de Firma' },
    { clave: 'modalidad', cabecera: 'Modalidad de Certificación' },
    { clave: 'hashCustodia', cabecera: 'Hash SHA-256 Custodia GLI' },
  ];

  readonly columnasCronograma: readonly AyColumna[] = [
    { clave: 'numero', cabecera: 'N.º Letra' },
    { clave: 'vencimiento', cabecera: 'Vencimiento' },
    { clave: 'monto', cabecera: 'Importe', alineacion: 'end' },
    { clave: 'estado', cabecera: 'Estado' },
    { clave: 'fechaPago', cabecera: 'Fecha de Pago' },
    { clave: 'operacion', cabecera: 'Operación Conciliada' },
  ];

  readonly columnasCatalogoHu: readonly AyColumna[] = [
    { clave: 'id', cabecera: 'Código y Feature', ancho: '13rem' },
    { clave: 'titulo', cabecera: 'Historia de Usuario y Módulo' },
    { clave: 'etapa', cabecera: 'Etapa', ancho: '7rem' },
    { clave: 'accion', cabecera: 'Acción', alineacion: 'end', ancho: '9rem' },
  ];

  readonly perspectivaId = signal<PerspectivaUsuarioAtc['id']>('gestor');
  readonly filtrarSidebarPorRol = signal<boolean>(false);

  readonly perspectivaActual = computed<PerspectivaUsuarioAtc>(
    () =>
      this.perspectivasUsuarios.find((p) => p.id === this.perspectivaId()) ??
      this.perspectivasUsuarios[0],
  );

  readonly menuEstrella: readonly ItemMenuAtc[] = [
    {
      id: 'c360',
      grupo: 'ESTRELLA',
      titulo: 'Consulta 360 del Cliente',
      subtitulo: 'Ficha integral consolidada desde 8 sistemas en línea',
      icono:
        'M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0 M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0 -20 M4.93 4.93l4.24 4.24 M14.83 14.83l4.24 4.24 M19.07 4.93l-4.24 4.24 M9.17 14.83l-4.24 4.24',
    },
    {
      id: 'vivo',
      grupo: 'ESTRELLA',
      titulo: 'Operación en Vivo',
      subtitulo: 'Planta de atención en tiempo real, colas y niveles de servicio',
      icono: 'M22 12h-4l-3 9L9 3l-3 9H2',
    },
  ];

  readonly menuOperacion: readonly ItemMenuAtc[] = [
    {
      id: 'bandeja',
      grupo: 'OPERACION',
      titulo: 'Bandeja y Avance Diario',
      subtitulo: 'Gestión de tickets, asignación por carga y telefonía CTI',
      icono:
        'M22 12h-6l-2 3h-4l-2-3H2 M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z',
    },
    {
      id: 'nuevo',
      grupo: 'OPERACION',
      titulo: 'Nuevo Ticket Multicanal',
      subtitulo: 'Registro y clasificación de atenciones con cálculo de SLA',
      icono:
        'M12 8v8 M8 12h8 M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
    },
    {
      id: 'detalle',
      grupo: 'OPERACION',
      titulo: 'Expediente de Ticket',
      subtitulo: 'Seguimiento de interacciones, asistente IA y derivaciones',
      icono:
        'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
    },
  ];

  readonly menuEspecializada: readonly ItemMenuAtc[] = [
    {
      id: 'libro',
      grupo: 'ESPECIALIZADA',
      titulo: 'Libro de Reclamaciones',
      subtitulo: 'Gestión de quejas, reclamos y plazos legales INDECOPI',
      icono:
        'M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z',
    },
    {
      id: 'sgd',
      grupo: 'ESPECIALIZADA',
      titulo: 'Comité SGD y Morosidad',
      subtitulo: 'Casos documentales críticos y resolución contractual',
      icono: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M12 8v4 M12 16h.01',
    },
    {
      id: 'garantias',
      grupo: 'ESPECIALIZADA',
      titulo: 'Postventa y Directorio',
      subtitulo: 'Atención de garantías, inspecciones y directorio operativo',
      icono: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
    },
    {
      id: 'evento',
      grupo: 'ESPECIALIZADA',
      titulo: 'EntregaFest y Transporte',
      subtitulo: 'Control de ingreso a proyectos y cupos en buses',
      icono:
        'M8 6v6 M15 6v6 M2 12h19.6 M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3 M7 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M16 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
    },
    {
      id: 'torre',
      grupo: 'ESPECIALIZADA',
      titulo: 'Torre de Control CX',
      subtitulo: 'Indicadores de satisfacción, prevención legal y flujos',
      icono: 'M18 20V10 M12 20V4 M6 20v-6',
    },
  ];

  readonly vistaActiva = signal<VistaAtc>('c360');
  readonly mostrarTrazabilidadHu = signal<boolean>(false);
  readonly empresaFiltro = signal<string>('');
  readonly filtroBandejaCliente = signal<string>('');
  readonly modalCatalogoHuAbierto = signal<boolean>(false);
  readonly filtroHu = signal<string>('');
  readonly filtroEtapa = signal<'TODAS' | 'Etapa 1' | 'Etapa 2'>('TODAS');

  readonly modalContratoAbierto = signal<boolean>(false);
  readonly contratoSeleccionadoCodigo = signal<string>('VS-2025-0507');
  readonly pestanaContrato = signal<'clausulas' | 'adendas' | 'firmantes' | 'cronograma'>('clausulas');

  readonly contratoActual = computed<ContratoInmobiliarioAtc>(
    () =>
      this.contratos.find((c) => c.codigo === this.contratoSeleccionadoCodigo()) ??
      this.contratos[0],
  );

  readonly tickets = signal<TicketAtc[]>(crearTicketsDemo());
  readonly ticketSeleccionadoNum = signal<string>('AIN-000482');
  readonly asientosLibro = signal<AsientoLibro[]>(crearAsientosLibroDemo());
  readonly casosSgd = signal(crearCasosSgdDemo());
  readonly casosMorosidad = signal(crearCasosMorosidadDemo());
  readonly garantias = signal(crearGarantiasDemo());
  readonly asistentes = signal(crearAsistentesDemo());
  readonly buses = signal(crearBusesDemo());

  readonly todosLosMenus = [...this.menuEstrella, ...this.menuOperacion, ...this.menuEspecializada];

  readonly menusSidebarVisibles = computed<readonly ItemMenuAtc[]>(() => {
    if (!this.filtrarSidebarPorRol()) return this.todosLosMenus;
    const permitidos = this.perspectivaActual().modulosClave;
    return this.todosLosMenus.filter((m) => permitidos.includes(m.id));
  });

  readonly gruposSidebar = computed<AySidebarGrupo[]>(() => {
    const visibles = this.menusSidebarVisibles();
    const activa = this.vistaActiva();
    const insigniaDe = (id: VistaAtc): string | undefined => {
      if (id === 'bandeja') return String(this.ticketsVisibles().length);
      if (id === 'libro') return String(this.asientosLibro().length);
      if (id === 'sgd') return String(this.casosSgd().length + this.casosMorosidad().length);
      if (id === 'garantias') return String(this.garantias().length);
      return undefined;
    };
    const definiciones: readonly { grupo: ItemMenuAtc['grupo']; etiqueta: string }[] = [
      { grupo: 'ESTRELLA', etiqueta: 'Núcleo 360 y Planta' },
      { grupo: 'OPERACION', etiqueta: 'Operación Omnicanal' },
      { grupo: 'ESPECIALIZADA', etiqueta: 'Mesas Especializadas' },
    ];
    return definiciones
      .map((d) => ({
        etiqueta: d.etiqueta,
        plegable: true,
        abiertoInicial: true,
        elementos: visibles
          .filter((m) => m.grupo === d.grupo)
          .map((m) => ({
            href: `#vista:${m.id}`,
            etiqueta: m.titulo,
            actual: activa === m.id,
            insignia: insigniaDe(m.id),
          })),
      }))
      .filter((g) => g.elementos.length > 0);
  });

  readonly itemMenuActual = computed(
    () => this.todosLosMenus.find((m) => m.id === this.vistaActiva()) ?? this.menuEstrella[0],
  );

  readonly migasActuales = computed<AyBreadcrumbNivel[]>(() => {
    const item = this.itemMenuActual();
    const nombreGrupo =
      item.grupo === 'ESTRELLA'
        ? 'Núcleo 360 y Planta'
        : item.grupo === 'OPERACION'
          ? 'Operación Omnicanal'
          : 'Mesas Especializadas';
    return [{ label: 'Aybar Atiende' }, { label: nombreGrupo }, { label: item.titulo }];
  });

  readonly menuCuenta = computed<AyMenuItem[]>(() => {
    const p = this.perspectivaActual();
    return [
      { tipo: 'group', label: `${p.nombre} · ${p.cargo}` },
      { tipo: 'item', value: 'mesa', label: `Ir a ${this.tituloDeVista(p.vistaPrincipal)}` },
      { tipo: 'item', value: 'catalogo', label: 'Catálogo de 60 HUs' },
      { tipo: 'separator' },
      { tipo: 'group', label: 'Perfil de acceso (visibilidad por rol)' },
      ...this.perspectivasUsuarios.map((rol) => ({
        tipo: 'item' as const,
        value: `rol:${rol.id}`,
        label: `${rol.id === p.id ? '● ' : ''}${rol.cargo} (${rol.nombre})`,
      })),
      { tipo: 'separator' },
      { tipo: 'item', value: 'salir', label: 'Cerrar sesión' },
    ];
  });

  readonly gruposComandos = computed<AyGrupoComandos[]>(() => {
    const q = this.consultaPaleta().trim().toLowerCase();
    const modulos = this.todosLosMenus
      .filter((m) => !q || m.titulo.toLowerCase().includes(q) || m.subtitulo.toLowerCase().includes(q))
      .map((m) => ({
        id: `mod:${m.id}`,
        titulo: m.titulo,
        contexto: m.subtitulo,
        alSeleccionar: () => {
          this.vistaActiva.set(m.id);
          this.paletaAbierta.set(false);
        },
      }));
    const contratosCmd = this.contratos
      .filter((c) => !q || c.codigo.toLowerCase().includes(q) || c.clienteNombre.toLowerCase().includes(q))
      .map((c) => ({
        id: `ctr:${c.codigo}`,
        titulo: `${c.codigo} · ${c.clienteNombre}`,
        contexto: `${c.proyecto} · ${c.manzanaLote}`,
        alSeleccionar: () => {
          this.paletaAbierta.set(false);
          this.abrirContrato(c.codigo);
        },
      }));
    const husCmd = this.catalogoHus
      .filter((h) => !q || h.id.toLowerCase().includes(q) || h.titulo.toLowerCase().includes(q))
      .slice(0, 12)
      .map((h) => ({
        id: `hu:${h.id}`,
        titulo: `${h.id} · ${h.titulo}`,
        contexto: `${h.feature} · ${h.pantalla}`,
        alSeleccionar: () => {
          this.paletaAbierta.set(false);
          this.vistaActiva.set(h.vista);
        },
      }));
    return [
      { etiqueta: 'Módulos Operativos', elementos: modulos },
      { etiqueta: 'Expedientes Contractuales', elementos: contratosCmd },
      { etiqueta: 'Historias de Usuario (60 HUs)', elementos: husCmd },
    ].filter((g) => g.elementos.length > 0);
  });

  readonly ticketsVisibles = computed(() => {
    const co = this.empresaFiltro();
    if (!co) return this.tickets();
    return this.tickets().filter((t) => t.co === co);
  });

  readonly husFiltradas = computed(() => {
    const q = this.filtroHu().trim().toLowerCase();
    const etapa = this.filtroEtapa();
    return this.catalogoHus.filter((h) => {
      if (etapa !== 'TODAS' && (h.etapa ?? 'Etapa 1') !== etapa) return false;
      if (!q) return true;
      return (
        h.id.toLowerCase().includes(q) ||
        h.titulo.toLowerCase().includes(q) ||
        h.feature.toLowerCase().includes(q) ||
        h.pantalla.toLowerCase().includes(q) ||
        (h.etapaNota ?? '').toLowerCase().includes(q)
      );
    });
  });

  constructor() {
    const destruccion = inject(DestroyRef);
    const doc = inject(DOCUMENT);
    effect(() => {
      const uid = this.acceso.sesion()?.usuarioId;
      if (!uid) return;
      if (uid === 'admin') {
        this.perspectivaId.set('supervisor');
        return;
      }
      const match = this.perspectivasUsuarios.find((p) => p.usuario === uid);
      if (match && match.id !== this.perspectivaId()) {
        this.perspectivaId.set(match.id);
      }
    });

    afterNextRender(() => {
      const barra = this.anfitrion.querySelector<HTMLElement>('.ay-navbar');
      if (barra) {
        const publicar = () =>
          this.anfitrion.style.setProperty('--pl-atc-navbar-alto', `${barra.offsetHeight}px`);
        publicar();
        const obs = new ResizeObserver(publicar);
        obs.observe(barra);
        destruccion.onDestroy(() => obs.disconnect());
      }
      const onKey = (ev: KeyboardEvent) => {
        if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'k') {
          ev.preventDefault();
          this.paletaAbierta.update((v) => !v);
        }
      };
      doc.addEventListener('keydown', onKey);
      destruccion.onDestroy(() => doc.removeEventListener('keydown', onKey));
    });
  }

  comoFirmante(fila: unknown): FirmanteContratoAtc {
    return fila as FirmanteContratoAtc;
  }

  comoCuota(fila: unknown): CuotaCronogramaContratoAtc {
    return fila as CuotaCronogramaContratoAtc;
  }

  comoHu(fila: unknown): HuReferencia {
    return fila as HuReferencia;
  }

  paresResumenContrato(ctr: ContratoInmobiliarioAtc): ParCardPairs[] {
    const letrasTexto =
      ctr.letrasVencidas > 0
        ? `${ctr.letrasPagadas}/${ctr.totalLetras} pagadas · ${ctr.letrasVencidas} vencidas (${ctr.moraAcumulada})`
        : `${ctr.letrasPagadas}/${ctr.totalLetras} pagadas · ${ctr.actaEntregaEstado}`;
    return [
      { clave: 'Empresa Vendedora', valor: `${ctr.empresa} (RUC ${ctr.rucEmpresa})` },
      { clave: 'Titular / Comprador', valor: `${ctr.clienteNombre} (${ctr.clienteDoc})` },
      { clave: 'Proyecto y Unidad', valor: `${ctr.proyecto} · ${ctr.etapa} · ${ctr.manzanaLote} (${ctr.areaMetros})` },
      { clave: 'Registro SUNARP y Notaría', valor: `Partida ${ctr.partidaMatrizSunarp} · ${ctr.notaria} (${ctr.kardexNotarial})` },
      { clave: 'Posición Financiera', valor: `Total: ${ctr.precioTotal} · Inicial: ${ctr.cuotaInicial} · Saldo: ${ctr.saldoPendiente}` },
      { clave: 'Letras y Entrega', valor: letrasTexto },
    ];
  }

  itemsPestanasContrato(ctr: ContratoInmobiliarioAtc): AyTabsElemento[] {
    return [
      { value: 'clausulas', label: 'Cláusulas y Linderos', contador: ctr.clausulas.length },
      { value: 'adendas', label: 'Adendas GLI', contador: ctr.adendas.length },
      { value: 'firmantes', label: 'Firmas y Custodia', contador: ctr.firmantes.length },
      { value: 'cronograma', label: 'Cronograma de Pagos', contador: ctr.cronograma.length },
    ];
  }

  alCambiarPestanaContrato(valor: string): void {
    if (valor === 'clausulas' || valor === 'adendas' || valor === 'firmantes' || valor === 'cronograma') {
      this.pestanaContrato.set(valor);
    }
  }

  alCambiarPerspectivaId(valor: string): void {
    const encontrada = this.perspectivasUsuarios.find((p) => p.id === valor);
    if (encontrada) {
      this.cambiarPerspectivaUsuario(encontrada, false);
    }
  }

  alCambiarFiltroEtapa(valor: string): void {
    if (valor === 'TODAS' || valor === 'Etapa 1' || valor === 'Etapa 2') {
      this.filtroEtapa.set(valor);
    }
  }

  alInterceptarEnlaceSidebar(ev: MouseEvent): void {
    const enlace = ev.target instanceof Element ? ev.target.closest('a[href]') : null;
    if (!(enlace instanceof HTMLAnchorElement)) return;
    const href = enlace.getAttribute('href') ?? '';
    if (href.startsWith('#vista:')) {
      ev.preventDefault();
      this.irAVistaDesdeHref(href);
    }
  }

  irAVistaDesdeHref(href: string): void {
    const id = href.replace('#vista:', '') as VistaAtc;
    if (this.todosLosMenus.some((m) => m.id === id)) {
      this.vistaActiva.set(id);
    }
  }

  alElegirCuenta(valor: string): void {
    if (valor.startsWith('rol:')) {
      this.alCambiarPerspectivaId(valor.replace('rol:', ''));
    } else if (valor === 'mesa') {
      this.irAMesaDePerspectiva(this.perspectivaActual());
    } else if (valor === 'catalogo') {
      this.modalCatalogoHuAbierto.set(true);
    } else if (valor === 'salir') {
      void this.irAPantallaLogin();
    }
  }

  abrirContrato(codigo: string, pestana: 'clausulas' | 'adendas' | 'firmantes' | 'cronograma' = 'clausulas'): void {
    const encontrado = this.contratos.find((c) => c.codigo === codigo);
    if (encontrado) {
      this.contratoSeleccionadoCodigo.set(encontrado.codigo);
    }
    this.pestanaContrato.set(pestana);
    this.modalContratoAbierto.set(true);
  }

  filtrarBandejaPorContrato(ctr: ContratoInmobiliarioAtc): void {
    this.modalContratoAbierto.set(false);
    this.filtroBandejaCliente.set(ctr.clienteNombre.split(' ')[0] ?? ctr.clienteNombre);
    this.vistaActiva.set('bandeja');
  }

  alRedirigirDesde360(ev: {
    destino: DestinoRedireccionNodo;
    clienteNombre: string;
    dni: string;
    contrato: string;
    nodoId: string;
  }): void {
    if (ev.destino === 'contrato') {
      const tab = ev.nodoId === 'crono' || ev.nodoId === 'saldo' ? 'cronograma' : ev.nodoId === 'docs' ? 'adendas' : 'clausulas';
      this.abrirContrato(ev.contrato, tab);
      return;
    }
    if (ev.destino === 'bandeja') {
      this.filtroBandejaCliente.set(ev.clienteNombre.split(' ')[0] ?? ev.clienteNombre);
      this.vistaActiva.set('bandeja');
      return;
    }
    if (ev.destino === 'detalle') {
      const primerNombre = (ev.clienteNombre.split(' ')[0] ?? '').toLowerCase();
      const tk = this.tickets().find(
        (t) => t.contract === ev.contrato || t.cli.toLowerCase().includes(primerNombre),
      );
      if (tk) {
        this.ticketSeleccionadoNum.set(tk.num);
      }
      this.vistaActiva.set('detalle');
      return;
    }
    this.vistaActiva.set(ev.destino);
  }

  cambiarPerspectivaUsuario(p: PerspectivaUsuarioAtc, irASuMesa: boolean): void {
    this.perspectivaId.set(p.id);
    if (this.acceso.demo) {
      this.acceso.ingresar(p.usuario, p.clave).catch(() => undefined);
    }
    if (irASuMesa) {
      this.vistaActiva.set(p.vistaPrincipal);
    }
  }

  irAMesaDePerspectiva(p: PerspectivaUsuarioAtc): void {
    this.vistaActiva.set(p.vistaPrincipal);
  }

  tituloDeVista(vista: VistaAtc): string {
    return this.todosLosMenus.find((m) => m.id === vista)?.titulo ?? vista;
  }

  async irAPantallaLogin(): Promise<void> {
    await this.acceso.salir();
    await this.router.navigateByUrl('/ingresar');
  }

  alSeleccionarTicket(num: string): void {
    this.ticketSeleccionadoNum.set(num);
    this.vistaActiva.set('detalle');
  }

  alCrearDesde360(_ev: { cliente: string; dni: string; proyecto: string; contingencia: boolean }): void {
    this.vistaActiva.set('nuevo');
  }

  alCrearTicket(ev: { ticket: TicketAtc; crearAsientoLibro: boolean }): void {
    this.tickets.update((prev) => [ev.ticket, ...prev]);
    if (ev.crearAsientoLibro) {
      this.asientosLibro.update((prev) => [
        {
          n: String(Math.floor(50 + Math.random() * 50)).padStart(4, '0'),
          co: ev.ticket.co,
          est: 'Sede Digital / Mi Portal',
          ticket: ev.ticket.num,
          kind: ev.ticket.type === 'QUE' ? 'QUEJA' : 'RECLAMO',
          cli: ev.ticket.cli,
          reg: AHORA_BASE,
          amount: null,
          ext: false,
          resp: null,
          appeal: null,
          facts: ev.ticket.summary,
        },
        ...prev,
      ]);
    }
    this.ticketSeleccionadoNum.set(ev.ticket.num);
    this.vistaActiva.set('detalle');
  }

  irAVistaDeHu(vista: VistaAtc): void {
    this.modalCatalogoHuAbierto.set(false);
    this.vistaActiva.set(vista);
  }
}
