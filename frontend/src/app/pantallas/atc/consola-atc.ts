import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  untracked,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  AyAlert,
  AyAppearancePanel,
  AyBadge,
  AyButton,
  AyToggleButton,
  AyCard,
  AyCardBody,
  AyCardHeader,
  AyCardPairs,
  AyCelda,
  AyCheckbox,
  AyCommandPalette,
  AyDivider,
  AyDrawer,
  AyDropdownMenu,
  AyEmptyState,
  AyFormField,
  AyHeading,
  AyModal,
  AyNavbar,
  AyRow,
  AySegmentedControl,
  AySelect,
  AySidePanel,
  AySidebar,
  AySkipLink,
  AyStack,
  AyTable,
  AyTabs,
  AyText,
  type AyColumna,
  type AyGrupoComandos,
  type AyMenuItem,
  type AyOpcionSelect,
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
  FUENTES_360,
  crearAsientosLibroDemo,
  crearAsistentesDemo,
  crearBusesDemo,
  crearCasosMorosidadDemo,
  crearCasosSgdDemo,
  crearGarantiasDemo,
  crearTicketsDemo,
  fmtFechaHora,
  sumarHorasHabiles,
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
import { AsistenteBotAtcComponent } from './asistente-bot-atc';
import {
  EstadoPrototipoAtcService,
  ROLES_PROTOTIPO_ATC,
  type PerfilRolPrototipoAtc,
  type RolPrototipoAtc,
} from './estado-prototipo-atc';
import { BarraFiltrosComponent } from './barra-filtros';
import { FiltroColumnasTablaDirective } from './filtro-columnas-tabla';
import { VacioFiltrosComponent } from './vacio-filtros';
import { alternarFavorito, guardarFavoritos, leerFavoritos } from './favoritos-atc';
import { crearFiltrosTabla, EstadoFiltrosTablas } from './filtros-tabla';

interface ItemMenuAtc {
  readonly id: VistaAtc;
  readonly grupo: 'ESTRELLA' | 'OPERACION' | 'SUPERVISION' | 'GESTION';
  readonly titulo: string;
  readonly subtitulo: string;
  readonly icono: string;
  /** Vista que existe pero no se lista en el sidebar ni en la paleta (se abre desde otra vista). */
  readonly oculto?: boolean;
}

@Component({
  selector: 'app-consola-atc',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    BarraFiltrosComponent,
    FiltroColumnasTablaDirective,
    VacioFiltrosComponent,
    AyAlert,
    AyAppearancePanel,
    AyBadge,
    AyButton,
    AyToggleButton,
    AyCard,
    AyCardBody,
    AyCardHeader,
    AyCardPairs,
    AyCelda,
    AyCheckbox,
    AyCommandPalette,
    AyDivider,
    AyDrawer,
    AyDropdownMenu,
    AyEmptyState,
    AyFormField,
    AyHeading,
    AyModal,
    AyNavbar,
    AyRow,
    AySegmentedControl,
    AySelect,
    AySidePanel,
    AySidebar,
    AySkipLink,
    AyStack,
    AyTable,
    AyTabs,
    AyText,
    BotonTema,
    VistaC360Component,
    VistaVivoComponent,
    VistaOperacionComponent,
    VistaEspecializadaComponent,
    AsistenteBotAtcComponent,
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

      <ng-container ayAcciones>
        <ay-dropdown-menu
          class="pl-usuario"
          colocacion="bottom-end"
          [items]="menuCuenta()"
          (elegido)="alElegirCuenta($event)"
        >
          <button
            ayDisparador
            type="button"
            class="pt-usuario pt-usuario__btn"
            [attr.aria-label]="'Cuenta de ' + perspectivaActual().nombre"
          >
            <span class="pt-usuario__av" aria-hidden="true">{{ inicialesUsuario() }}</span>
            <span class="pt-usuario__txt">
              <b>{{ perspectivaActual().nombre }}</b>
              <small>{{ perspectivaActual().cargo }}</small>
            </span>
          </button>
        </ay-dropdown-menu>
      </ng-container>
    </ay-navbar>

    <div class="pl-atc-cuerpo">
      <div class="pl-atc-lateral" (click)="alInterceptarEnlaceSidebar($event)">
        <ng-template #herramientas>
        <!-- Herramientas (pie del sidebar) (Ver como, Tema, Apariencia, Simulación, Notas) -->
        <div class="pt-herr">
          @if (herramientasAbierto()) {
            @if (vistaHerramientas() === 'notas') {
              <div class="pt-herr__panel" role="region" aria-label="Notas de esta pantalla">
                <div class="pt-herr__cab">
                  <button
                    type="button"
                    class="pt-herr__atras"
                    aria-label="Volver a las herramientas"
                    (click)="vistaHerramientas.set('menu')"
                  >
                    ‹
                  </button>
                  <div>
                    <h2>Notas de esta pantalla</h2>
                    <small>Supuestos, límites y pendientes para revisar</small>
                  </div>
                </div>
                <div class="pt-herr__sec">
                  <ay-checkbox
                    [marcado]="mostrarTrazabilidadHu()"
                    (marcadoChange)="mostrarTrazabilidadHu.set($event)"
                  >
                    Mostrar etiquetas de trazabilidad HU en pantalla
                  </ay-checkbox>
                </div>
                @if (notasPantallaActual().length) {
                  <div class="pt-herr__notas">
                    @for (nota of notasPantallaActual(); track nota) {
                      <div class="pt-herr__nota">{{ nota }}</div>
                    }
                  </div>
                } @else {
                  <p class="pt-herr__vacio">Esta pantalla no tiene notas.</p>
                }
              </div>
            } @else {
              <div class="pt-herr__panel" role="region" aria-label="Herramientas">
                <div class="pt-herr__cab">
                  <div>
                    <h2>Herramientas</h2>
                    <small>Reloj: {{ relojSimuladoTexto() }}</small>
                  </div>
                </div>

                <div class="pt-herr__sec">
                  <ay-form-field etiqueta="Ver como">
                    <ay-select
                      [opciones]="opcionesSelectPerspectivas"
                      [valor]="perspectivaId()"
                      (valorChange)="alCambiarPerspectivaId($event)"
                    />
                  </ay-form-field>
                  <small ayText="body" size="xs">Cambia de usuario y sus permisos.</small>
                </div>

                <div class="pt-herr__sec">
                  <b>Tema</b>
                  <app-boton-tema />
                </div>

                <div class="pt-herr__filas">
                  <button type="button" class="pt-herr__fila" (click)="abrirPanelApariencia()">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    <span>
                      <b>Apariencia</b>
                      <small>Paleta, grises, densidad y bordes</small>
                    </span>
                    <i aria-hidden="true">›</i>
                  </button>

                  <button type="button" class="pt-herr__fila" (click)="abrirPanelSimulacion()">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3 2" />
                    </svg>
                    <span>
                      <b>Simulación</b>
                      <small>Reloj, escenarios y fuentes caídas</small>
                    </span>
                    <i aria-hidden="true">›</i>
                  </button>

                  <button type="button" class="pt-herr__fila" (click)="vistaHerramientas.set('notas')">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                    </svg>
                    <span>
                      <b>
                        Notas
                        @if (notasPantallaActual().length) {
                          <span class="pt-herr__cuenta">{{ notasPantallaActual().length }}</span>
                        }
                      </b>
                      <small>Supuestos y pendientes de esta pantalla</small>
                    </span>
                    <i aria-hidden="true">›</i>
                  </button>
                </div>
              </div>
            }
          }

          <button
            type="button"
            class="pt-herr__fab"
            [attr.aria-expanded]="herramientasAbierto()"
            aria-label="Herramientas"
            title="Herramientas"
            (click)="alternarHerramientas()"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="3" />
              <path
                d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"
              />
            </svg>
          </button>
        </div>
        </ng-template>
        <ay-sidebar
          etiqueta="Módulos de Aybar Atiende"
          [grupos]="gruposSidebar()"
          [(colapsada)]="lateralPlegado"
        >
          <div ayPie class="pl-sidebar-pie">
            <ng-container *ngTemplateOutlet="herramientas" />
            <ay-button
              tamano="sm"
              variante="ghost"
              [bloque]="true"
              title="Cerrar sesión"
              (click)="irAPantallaLogin()"
            >
              <svg
                ayIconoInicio
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Cerrar sesión
            </ay-button>
          </div>
        </ay-sidebar>
      </div>

      <main id="atc-contenido" class="pl-atc-principal" tabindex="-1">
        <div #favoritosHost class="pl-favoritos" [hidden]="!opcionActual()">
          <ay-toggle-button
            variante="icon"
            tamano="lg"
            [etiqueta]="actualEsFavorito() ? 'Quitar de favoritos' : 'Marcar como favorito'"
            [presionado]="actualEsFavorito()"
            [disabled]="!opcionActual()"
            (presionadoChange)="alternarFavoritoActual()"
          >
            <svg
              viewBox="0 0 24 24"
              [attr.fill]="actualEsFavorito() ? 'currentColor' : 'none'"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              />
            </svg>
          </ay-toggle-button>
        </div>
        <div ayStack gap="6">
          @if (avisoNavegacion()) {
            <ay-alert
              tono="info"
              size="sm"
              [titulo]="avisoNavegacion()!"
              [descartable]="true"
              (cerrar)="avisoNavegacion.set(null)"
            />
          }
          @switch (vistaActiva()) {
            @case ('c360') {
              <app-vista-c360
                [mostrarHu]="mostrarTrazabilidadHu()"
                [rolExterno]="perspectivaActual().rol360"
                [nodoFocoExterno]="perspectivaActual().nodoInicial360"
                [fuentesCaidasExternas]="fuentesCaidas()"
                (fuentesCaidasChange)="fuentesCaidas.set($event)"
                (crearTicketDesde360)="alCrearDesde360($event)"
                (verContrato)="abrirContrato($event)"
                (redirigirModulo)="alRedirigirDesde360($event)"
              />
            }
            @case ('vivo') {
              <app-vista-vivo
                [mostrarHu]="mostrarTrazabilidadHu()"
                [tickets]="ticketsVisibles()"
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
            @case ('tudia') {
              <app-vista-operacion
                subvista="tudia"
                [tickets]="ticketsVisibles()"
                [ticketSeleccionadoNum]="ticketSeleccionadoNum()"
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
                [contexto]="contextoNuevoTicket()"
                (ticketCreado)="alCrearTicket($event)"
              />
            }
            @case ('detalle') {
              <app-vista-operacion
                subvista="detalle"
                [tickets]="ticketsVisibles()"
                [ticketSeleccionadoNum]="ticketSeleccionadoNum()"
                [mostrarHu]="mostrarTrazabilidadHu()"
                [volverA]="tituloDeVista(vistaOrigen())"
                (volver)="volverDelDetalle()"
                (verContrato)="abrirContrato($event)"
              />
            }
            @case ('morosidad') {
              <app-vista-especializada
                subvista="morosidad"
                [tickets]="ticketsVisibles()"
                [asientosLibro]="asientosLibro()"
                [casosSgd]="casosSgd()"
                [casosMorosidad]="casosMorosidad()"
                [garantias]="garantias()"
                [asistentes]="asistentes()"
                [buses]="buses()"
                [mostrarHu]="mostrarTrazabilidadHu()"
                (verContrato)="abrirContrato($event)"
                (seleccionarTicket)="alSeleccionarTicket($event)"
                (irANuevo)="vistaActiva.set('nuevo')"
              />
            }
            @case ('ingreso') {
              <app-vista-especializada
                subvista="ingreso"
                [tickets]="ticketsVisibles()"
                [asientosLibro]="asientosLibro()"
                [casosSgd]="casosSgd()"
                [casosMorosidad]="casosMorosidad()"
                [garantias]="garantias()"
                [asistentes]="asistentes()"
                [buses]="buses()"
                [mostrarHu]="mostrarTrazabilidadHu()"
                (verContrato)="abrirContrato($event)"
                (seleccionarTicket)="alSeleccionarTicket($event)"
                (irANuevo)="vistaActiva.set('nuevo')"
              />
            }
            @case ('buses') {
              <app-vista-especializada
                subvista="buses"
                [tickets]="ticketsVisibles()"
                [asientosLibro]="asientosLibro()"
                [casosSgd]="casosSgd()"
                [casosMorosidad]="casosMorosidad()"
                [garantias]="garantias()"
                [asistentes]="asistentes()"
                [buses]="buses()"
                [mostrarHu]="mostrarTrazabilidadHu()"
                (verContrato)="abrirContrato($event)"
                (seleccionarTicket)="alSeleccionarTicket($event)"
                (irANuevo)="vistaActiva.set('nuevo')"
              />
            }
            @case ('libro') {
              <app-vista-especializada
                subvista="libro"
                [tickets]="ticketsVisibles()"
                [asientosLibro]="asientosLibro()"
                [casosSgd]="casosSgd()"
                [casosMorosidad]="casosMorosidad()"
                [garantias]="garantias()"
                [asistentes]="asistentes()"
                [buses]="buses()"
                [mostrarHu]="mostrarTrazabilidadHu()"
                (verContrato)="abrirContrato($event)"
                (seleccionarTicket)="alSeleccionarTicket($event)"
                (irANuevo)="vistaActiva.set('nuevo')"
              />
            }
            @case ('sgd') {
              <app-vista-especializada
                subvista="sgd"
                [tickets]="ticketsVisibles()"
                [asientosLibro]="asientosLibro()"
                [casosSgd]="casosSgd()"
                [casosMorosidad]="casosMorosidad()"
                [garantias]="garantias()"
                [asistentes]="asistentes()"
                [buses]="buses()"
                [mostrarHu]="mostrarTrazabilidadHu()"
                (verContrato)="abrirContrato($event)"
                (seleccionarTicket)="alSeleccionarTicket($event)"
                (irANuevo)="vistaActiva.set('nuevo')"
              />
            }
            @case ('garantias') {
              <app-vista-especializada
                subvista="garantias"
                [tickets]="ticketsVisibles()"
                [asientosLibro]="asientosLibro()"
                [casosSgd]="casosSgd()"
                [casosMorosidad]="casosMorosidad()"
                [garantias]="garantias()"
                [asistentes]="asistentes()"
                [buses]="buses()"
                [mostrarHu]="mostrarTrazabilidadHu()"
                (verContrato)="abrirContrato($event)"
                (seleccionarTicket)="alSeleccionarTicket($event)"
                (irANuevo)="vistaActiva.set('nuevo')"
              />
            }
            @case ('reasignar') {
              <app-vista-especializada
                subvista="reasignar"
                [tickets]="ticketsVisibles()"
                [asientosLibro]="asientosLibro()"
                [casosSgd]="casosSgd()"
                [casosMorosidad]="casosMorosidad()"
                [garantias]="garantias()"
                [asistentes]="asistentes()"
                [buses]="buses()"
                [mostrarHu]="mostrarTrazabilidadHu()"
                (verContrato)="abrirContrato($event)"
                (seleccionarTicket)="alSeleccionarTicket($event)"
                (irANuevo)="vistaActiva.set('nuevo')"
              />
            }
            @case ('alertas') {
              <app-vista-especializada
                subvista="alertas"
                [tickets]="ticketsVisibles()"
                [asientosLibro]="asientosLibro()"
                [casosSgd]="casosSgd()"
                [casosMorosidad]="casosMorosidad()"
                [garantias]="garantias()"
                [asistentes]="asistentes()"
                [buses]="buses()"
                [mostrarHu]="mostrarTrazabilidadHu()"
                (verContrato)="abrirContrato($event)"
                (seleccionarTicket)="alSeleccionarTicket($event)"
                (irANuevo)="vistaActiva.set('nuevo')"
              />
            }
            @case ('cierre') {
              <app-vista-especializada
                subvista="cierre"
                [tickets]="ticketsVisibles()"
                [asientosLibro]="asientosLibro()"
                [casosSgd]="casosSgd()"
                [casosMorosidad]="casosMorosidad()"
                [garantias]="garantias()"
                [asistentes]="asistentes()"
                [buses]="buses()"
                [mostrarHu]="mostrarTrazabilidadHu()"
                (verContrato)="abrirContrato($event)"
                (seleccionarTicket)="alSeleccionarTicket($event)"
                (irANuevo)="vistaActiva.set('nuevo')"
              />
            }
            @case ('politicas') {
              <app-vista-especializada
                subvista="politicas"
                [tickets]="ticketsVisibles()"
                [asientosLibro]="asientosLibro()"
                [casosSgd]="casosSgd()"
                [casosMorosidad]="casosMorosidad()"
                [garantias]="garantias()"
                [asistentes]="asistentes()"
                [buses]="buses()"
                [mostrarHu]="mostrarTrazabilidadHu()"
                (verContrato)="abrirContrato($event)"
                (seleccionarTicket)="alSeleccionarTicket($event)"
                (irANuevo)="vistaActiva.set('nuevo')"
              />
            }
            @case ('configuracion') {
              <app-vista-especializada
                subvista="configuracion"
                [tickets]="ticketsVisibles()"
                [asientosLibro]="asientosLibro()"
                [casosSgd]="casosSgd()"
                [casosMorosidad]="casosMorosidad()"
                [garantias]="garantias()"
                [asistentes]="asistentes()"
                [buses]="buses()"
                [mostrarHu]="mostrarTrazabilidadHu()"
                (verContrato)="abrirContrato($event)"
                (seleccionarTicket)="alSeleccionarTicket($event)"
                (irANuevo)="vistaActiva.set('nuevo')"
              />
            }
            @case ('evento') {
              <app-vista-especializada
                subvista="evento"
                [tickets]="ticketsVisibles()"
                [asientosLibro]="asientosLibro()"
                [casosSgd]="casosSgd()"
                [casosMorosidad]="casosMorosidad()"
                [garantias]="garantias()"
                [asistentes]="asistentes()"
                [buses]="buses()"
                [mostrarHu]="mostrarTrazabilidadHu()"
                (verContrato)="abrirContrato($event)"
                (seleccionarTicket)="alSeleccionarTicket($event)"
                (irANuevo)="vistaActiva.set('nuevo')"
              />
            }
            @case ('torre') {
              <app-vista-especializada
                subvista="torre"
                [tickets]="ticketsVisibles()"
                [asientosLibro]="asientosLibro()"
                [casosSgd]="casosSgd()"
                [casosMorosidad]="casosMorosidad()"
                [garantias]="garantias()"
                [asistentes]="asistentes()"
                [buses]="buses()"
                [mostrarHu]="mostrarTrazabilidadHu()"
                (verContrato)="abrirContrato($event)"
                (seleccionarTicket)="alSeleccionarTicket($event)"
                (irANuevo)="vistaActiva.set('nuevo')"
              />
            }
          }
        </div>
      </main>

      <ay-side-panel
        id="atc-simulacion"
        titulo="Simulación"
        lado="end"
        size="md"
        redimensionable
        [abierto]="simulacionAbierto()"
        (abiertoChange)="simulacionAbierto.set($event)"
      >
        <div ayStack gap="4">
          <p ayText="body" size="sm">
            Mandos de prueba para recorrer el sistema como distintos usuarios y en distintos momentos.
          </p>

          @if (avisoSimulacion()) {
            <ay-alert tono="info" size="sm" [titulo]="avisoSimulacion()!" />
          }

          <ay-card superficie="solid">
            <ay-card-header titulo="Sesión" nivel="h3" [separador]="true" />
            <ay-card-body padding="sm" gap="sm">
              <ay-form-field etiqueta="Ver como">
                <ay-select
                  [opciones]="opcionesSelectPerspectivas"
                  [valor]="perspectivaId()"
                  (valorChange)="alCambiarPerspectivaId($event)"
                />
              </ay-form-field>
              <span ayText="body" size="xs">Cambia de usuario y sus permisos.</span>
              <ay-checkbox
                [marcado]="filtrarSidebarPorRol()"
                (marcadoChange)="filtrarSidebarPorRol.set($event)"
              >
                Filtrar menú lateral según permisos del rol activo
              </ay-checkbox>
            </ay-card-body>
          </ay-card>

          <ay-card superficie="solid">
            <ay-card-header titulo="Reloj simulado" nivel="h3" [separador]="true" />
            <ay-card-body padding="sm" gap="sm">
              <p ayText="body" size="sm">
                Ahora: <strong>{{ relojSimuladoTexto() }}</strong>
              </p>
              <div ayRow gap="2" [ajuste]="true">
                <ay-button
                  tamano="sm"
                  variante="secondary"
                  (click)="avanzarRelojSimulado(1, '1 hora hábil')"
                >
                  +1 hora hábil
                </ay-button>
                <ay-button
                  tamano="sm"
                  variante="secondary"
                  (click)="avanzarRelojSimulado(9, '1 día hábil')"
                >
                  +1 día hábil
                </ay-button>
                <ay-button
                  tamano="sm"
                  variante="secondary"
                  (click)="avanzarRelojSimulado(27, '3 días hábiles')"
                >
                  +3 días hábiles
                </ay-button>
              </div>
              <span ayText="body" size="xs">
                Al avanzar, corre el job de alertas como lo haría el programado.
              </span>
              <ay-button tamano="sm" variante="secondary" (click)="ejecutarJobAlertas()">
                Ejecutar el job de alertas ahora
              </ay-button>
            </ay-card-body>
          </ay-card>

          <ay-card superficie="solid">
            <ay-card-header
              titulo="Red y servicios · Estado de sistemas de origen"
              [subtitulo]="(fuentesIntegracion.length - fuentesCaidas().length) + '/' + fuentesIntegracion.length + ' fuentes en línea'"
              nivel="h3"
              [separador]="true"
            >
              @if (fuentesCaidas().length > 0) {
                <div ayAcciones>
                  <ay-button
                    tamano="sm"
                    variante="secondary"
                    (click)="fuentesCaidas.set([]); avisoSimulacion.set('Todas las fuentes de origen restauradas en línea')"
                  >
                    Todas en línea
                  </ay-button>
                </div>
              }
            </ay-card-header>
            <ay-card-body padding="sm" gap="sm">
              <ay-segmented-control
                etiqueta="Latencia del servicio"
                size="sm"
                [opciones]="opcionesLatenciaSim"
                [valor]="latenciaSimulada()"
                (valorChange)="latenciaSimulada.set($event === 'lenta' ? 'lenta' : 'normal')"
              />
              <ay-checkbox
                [marcado]="sinConexionSimulada()"
                (marcadoChange)="sinConexionSimulada.set($event)"
              >
                Sin conexión (toda carga o guardado falla hasta reactivar)
              </ay-checkbox>
              <ay-divider espaciado="sm" />
              <span ayText="label" size="xs">Estado de sistemas de origen (Consulta 360)</span>
              @for (f of fuentesIntegracion; track f.id) {
                <ay-checkbox
                  [marcado]="fuentesCaidas().includes(f.id)"
                  (marcadoChange)="alternarFuenteCaida(f.id, $event)"
                >
                  {{ f.nombre }} no disponible ({{ f.ms }} ms)
                </ay-checkbox>
              }
            </ay-card-body>
          </ay-card>

          <ay-card superficie="solid">
            <ay-card-header titulo="Pruebas de reglas y escenarios" nivel="h3" [separador]="true" />
            <ay-card-body padding="sm" gap="sm">
              <ay-form-field etiqueta="Filtrar operación por razón social">
                <ay-select
                  [opciones]="opcionesSelectEmpresas"
                  [valor]="empresaFiltro()"
                  (valorChange)="empresaFiltro.set($event)"
                />
              </ay-form-field>
              <div ayStack gap="2">
                <ay-button
                  tamano="sm"
                  variante="secondary"
                  [bloque]="true"
                  (click)="simularTicketEntranteMiPortal()"
                >
                  Simular un ticket entrante por Mi Portal
                </ay-button>
                <ay-button
                  tamano="sm"
                  variante="secondary"
                  [bloque]="true"
                  (click)="evaluarMorosidadSimulada()"
                >
                  Evaluar la morosidad (corrida diaria)
                </ay-button>
                <ay-button
                  tamano="sm"
                  variante="secondary"
                  [bloque]="true"
                  (click)="abrirContrato(contratoSeleccionadoCodigo())"
                >
                  Abrir Visor de Contratos ({{ contratoSeleccionadoCodigo() }})
                </ay-button>
              </div>
            </ay-card-body>
          </ay-card>

          <ay-card superficie="solid">
            <ay-card-header titulo="Datos" nivel="h3" [separador]="true" />
            <ay-card-body padding="sm" gap="sm">
              <div ayRow gap="2" [ajuste]="true">
                <ay-button tamano="sm" variante="secondary" (click)="vaciarConsolaDemo()">
                  Vaciar la consola
                </ay-button>
                <ay-button tamano="sm" variante="secondary" (click)="restaurarConsolaDemo()">
                  Restaurar los datos iniciales
                </ay-button>
              </div>
            </ay-card-body>
          </ay-card>
        </div>
      </ay-side-panel>

      <ay-side-panel
        id="atc-personalizar"
        titulo="Apariencia"
        lado="end"
        size="sm"
        redimensionable
        [abierto]="personalizarAbierto()"
        (abiertoChange)="personalizarAbierto.set($event)"
      >
        <div ayStack gap="4">
          <p ayText="body" size="sm">
            Prueba paletas y grises. Se recuerda en este navegador.
          </p>
          <ay-appearance-panel titulo="Ajustes de color" [nivelTitulo]="3" mostrarPresets />
        </div>
      </ay-side-panel>
    </div>

    <!-- Robot Asistente de IA 3D flotante en esquina inferior derecha (HU-ATC-048) -->
    <app-asistente-bot-atc
      [vistaActiva]="vistaActiva()"
      [ticketSeleccionadoNum]="ticketSeleccionadoNum()"
      [tickets]="tickets()"
    />

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
          <ay-heading class="pl-nav-movil__grupo" [nivel]="3" size="sm">{{ grupo.etiqueta }}</ay-heading>
          <div ayStack gap="1">
            @for (el of grupo.elementos; track el.href) {
              <ay-button
                tamano="sm"
                [variante]="el.actual ? 'primary' : 'ghost'"
                [bloque]="true"
                class="pl-nav-movil__item"
                [attr.data-href]="el.href"
                (click)="irAVistaDesdeHref(el.href); navegacionMovilAbierta.set(false)"
              >
                <span class="ay-sidebar__icon" aria-hidden="true"></span>
                {{ el.etiqueta }}
              </ay-button>
            }
          </div>
        }
        <ng-container *ngTemplateOutlet="herramientas" />
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
        <app-barra-filtros [filtros]="filtrosHu" />

        <ay-table
          leyenda="Catálogo de 60 Historias de Usuario"
          [columnas]="columnasCatalogoHu"
          [filas]="filtrosHu.filtradas()"
          [filtrosTabla]="filtrosHu"
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
            <div class="pl-atc-acciones-celda">
              <ay-button
                tamano="sm"
                variante="secondary"
                [disabled]="!hu.vista"
                (click)="irAVistaDeHu(hu.vista)"
              >
                Ir a vista →
              </ay-button>
            </div>
          </ng-template>
          <app-vacio-filtros ayVacio [filtros]="filtrosHu" elemento="historia" />
        </ay-table>
      </div>
    </ay-modal>
  `,
})
export class ConsolaAtcComponent {
  private readonly acceso = inject(Acceso);
  private readonly router = inject(Router);
  private readonly anfitrion: HTMLElement = inject(ElementRef).nativeElement;
  private readonly favoritosHostRef = viewChild<ElementRef<HTMLElement>>('favoritosHost');
  readonly estadoProto = inject(EstadoPrototipoAtcService);

  readonly destinosSalto = [{ id: 'atc-contenido', etiqueta: 'Saltar al contenido principal' }];
  readonly navegacionMovilAbierta = signal(false);
  readonly lateralPlegado = signal(false);
  readonly personalizarAbierto = signal(false);
  readonly simulacionAbierto = signal(false);
  readonly herramientasAbierto = signal(false);
  readonly vistaHerramientas = signal<'menu' | 'notas'>('menu');
  readonly paletaAbierta = signal(false);
  readonly consultaPaleta = signal('');

  readonly horasAvanzadasSim = signal(0);
  readonly latenciaSimulada = signal<'normal' | 'lenta'>('normal');
  readonly sinConexionSimulada = signal(false);
  readonly fuentesCaidas = signal<string[]>([]);
  readonly avisoSimulacion = signal<string | null>(null);

  readonly fuentesIntegracion = FUENTES_360;

  readonly opcionesLatenciaSim: AySegmentoOpcion[] = [
    { valor: 'normal', etiqueta: 'Normal' },
    { valor: 'lenta', etiqueta: 'Lenta (2,6 s)' },
  ];

  readonly empresas = EMPRESAS_AYBAR;
  readonly catalogoHus = CATALOGO_60_HUS;
  readonly contratos = CONTRATOS_ATC;

  readonly perspectivasUsuarios: readonly PerfilRolPrototipoAtc[] = ROLES_PROTOTIPO_ATC;

  readonly opcionesSelectPerspectivas: AyOpcionSelect[] = this.perspectivasUsuarios.map((p) => ({
    value: p.id,
    label: `${p.cargo} · ${p.nombre}`,
  }));

  readonly opcionesSelectEmpresas: AyOpcionSelect[] = [
    { value: '', label: 'Todas las empresas del grupo (11)' },
    ...this.empresas.map((e) => ({ value: e.id, label: `${e.id} · ${e.nombre}` })),
  ];


  readonly columnasFirmantes: readonly AyColumna[] = [
    { clave: 'rol', cabecera: 'Rol Contractual', ordenable: true },
    { clave: 'nombre', cabecera: 'Nombre y Documento', ordenable: true },
    { clave: 'fechaFirma', cabecera: 'Fecha y Hora de Firma', ordenable: true },
    { clave: 'modalidad', cabecera: 'Modalidad de Certificación', ordenable: true },
    { clave: 'hashCustodia', cabecera: 'Hash SHA-256 Custodia GLI', ordenable: true },
  ];

  readonly columnasCronograma: readonly AyColumna[] = [
    { clave: 'numero', cabecera: 'N.º Letra', ordenable: true },
    { clave: 'vencimiento', cabecera: 'Vencimiento', ordenable: true },
    { clave: 'monto', cabecera: 'Importe', alineacion: 'end', ordenable: true },
    { clave: 'estado', cabecera: 'Estado', ordenable: true },
    { clave: 'fechaPago', cabecera: 'Fecha de Pago', ordenable: true },
    { clave: 'operacion', cabecera: 'Operación Conciliada', ordenable: true },
  ];

  readonly columnasCatalogoHu: readonly AyColumna[] = [
    { clave: 'id', cabecera: 'Código y Feature', ancho: '13rem', ordenable: true },
    { clave: 'titulo', cabecera: 'Historia de Usuario y Módulo', ordenable: true },
    { clave: 'etapa', cabecera: 'Etapa', ancho: '7rem', ordenable: true },
    { clave: 'accion', cabecera: 'Acción', alineacion: 'end', ancho: '9rem' },
  ];

  readonly perspectivaId = computed<RolPrototipoAtc>(() => this.estadoProto.rolActivo());
  readonly filtrarSidebarPorRol = signal<boolean>(true);

  readonly perspectivaActual = computed<PerfilRolPrototipoAtc>(() =>
    this.estadoProto.perfilActivo(),
  );

  readonly inicialesUsuario = computed(() =>
    this.perspectivaActual()
      .nombre.split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p: string) => p[0] ?? '')
      .join('')
      .toUpperCase(),
  );

  readonly relojSimuladoFecha = computed(() =>
    sumarHorasHabiles(AHORA_BASE, this.horasAvanzadasSim()),
  );

  readonly relojSimuladoTexto = computed(() => fmtFechaHora(this.relojSimuladoFecha()));

  readonly notasPantallaActual = computed<readonly string[]>(() => {
    const v = this.vistaActiva();
    const especificas: Partial<Record<VistaAtc, readonly string[]>> = {
      vivo: [
        'Propuesta del PO (FT-ATC-18, 21 y 04): planta 3D interactiva con flujo real de tickets por áreas, HUD de estados y NPS.',
        'Los tickets que ingresan pasan por la Bandeja Orquestadora y avanzan automáticamente hacia Atención Eje 1/2, Cobranza, Proyectos, Postventa, Libro o Legal.',
      ],
      c360: [
        'Meta p95 ≤ 2 s en la consolidación del Grafo 360 desde los 8 sistemas integrados.',
        'La visibilidad de Estado de Cuenta Reservado y Exposición Regulatoria/Judicial depende del rol activo («Ver como»).',
      ],
      bandeja: [
        'Filtros combinables por columna (Empresa, Canal, Tipo, Prioridad, Área, Gestor, Estado y SLA) y prioridad Rayo auditable.',
        'Cuando SIGDA no está disponible, permite alta en cola de conciliación para vincular luego el DNI.',
      ],
      tudia: [
        'Panel personal "Tu Día" con indicadores de avance diario, línea de tiempo de acciones ejecutadas hoy, tickets en riesgo, avance del equipo y correos de asignación.',
      ],
      nuevo: [
        'El cálculo de SLA en horas hábiles queda congelado al momento de la apertura según la versión vigente de la matriz en Políticas SLA.',
        'El flujo configurado en Configuración determina el área inicial del ticket.',
      ],
      detalle: [
        'Muestra la versión de Guía de solución publicada en Configuración y permite reportar falta de guía hacia Alertas de Configuración.',
        'El historial de estados del ticket es inmutable y auditable.',
      ],
      morosidad: [
        'La evaluación diaria de morosidad suspende automáticamente cartas de resolución si existe un reclamo o queja abierta sobre el contrato.',
      ],
      ingreso: [
        'Control de acceso de promotores y asesores en garita de proyecto con validación de empresa autorizada.',
      ],
      buses: [
        'Transporte EntregaFest y casos en evento con reserva de cupo por titular al día en cuotas.',
      ],
      libro: [
        'Plazo legal INDECOPI de 15 días hábiles improrrogables; la razón social y el vencimiento del asiento no admiten edición.',
      ],
      sgd: [
        'Mesa SGD Documental con validación de Paquete Documental Completo 6/6 antes de envío a Comité.',
      ],
      garantias: [
        'Vigencia de garantías calculada desde la fecha del Acta de Entrega por partida (estructural 10 años, instalaciones 1 año, acabados 6 meses).',
      ],
      reasignar: [
        'Reasignación individual y masiva por ausencia con bitácora de auditoría.',
      ],
      alertas: [
        'Alertas preventivas de SLA y bitácora de ejecuciones del job programado.',
      ],
      cierre: [
        'Encuestas CSAT/NPS post-cierre, alertas por baja satisfacción, informes semanales de causas raíz y auditoría de decisiones IA.',
      ],
      politicas: [
        'Matriz parametrizable de Políticas SLA. Todo cambio aquí actualiza de inmediato el SLA congelado al registrar un Nuevo Ticket.',
      ],
      configuracion: [
        'Flujos por tipo, Guías de solución versionadas y Alertas de configuración. Publicar una versión impacta en Nuevo Ticket y Detalle.',
      ],
      urbemind: [
        'Integración CTI UrbeMind con webhook HMAC-SHA256 e idempotencia por callId.',
      ],
      evento: [
        'Control de padrón EntregaFest por QR/DNI y reserva de cupos en buses con validación de titularidad y estado de pago.',
      ],
      torre: [
        'NPS = % de respuestas 9–10 menos % de respuestas 0–6 a «¿Recomendarías…?». Desglose por tipo, área, gestor y resultado del cierre.',
      ],
    };
    const husVista = this.catalogoHus
      .filter((h) => h.vista === v)
      .map((h) => `${h.id} (${h.feature}): ${h.titulo}`);
    return [...(especificas[v] ?? []), ...husVista];
  });

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
      titulo: 'Bandeja de tickets',
      subtitulo: 'Gestión centralizada de solicitudes con filtros por columna, prioridad Rayo y vencimiento SLA',
      icono:
        'M22 12h-6l-2 3h-4l-2-3H2 M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z',
    },
    {
      id: 'tudia',
      grupo: 'OPERACION',
      titulo: 'Tu día',
      subtitulo: 'Tu avance diario, acciones realizadas hoy, tickets en riesgo y avance de tu equipo',
      icono: 'M12 8v4l3 3 M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0 -20',
    },
    {
      id: 'nuevo',
      grupo: 'OPERACION',
      titulo: 'Nuevo ticket',
      subtitulo: 'Registro y clasificación de atenciones con cálculo de SLA y flujo configurado',
      icono:
        'M12 8v8 M8 12h8 M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
    },
    {
      id: 'detalle',
      grupo: 'OPERACION',
      oculto: true,
      titulo: 'Expediente de ticket',
      subtitulo: 'Seguimiento de interacciones, guía de solución versionada y asistente IA',
      icono:
        'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
    },
    {
      id: 'evento',
      grupo: 'OPERACION',
      titulo: 'EntregaFest en vivo',
      subtitulo: 'Moderación presencial, 6 frases ancla, Estación 4 Legal y buses del evento',
      icono:
        'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    },
    {
      id: 'ingreso',
      grupo: 'OPERACION',
      titulo: 'Ingreso a proyectos',
      subtitulo: 'Validación de acceso en garita de proyecto para promotores y asesores',
      icono: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
    },
    {
      id: 'morosidad',
      grupo: 'OPERACION',
      titulo: 'Morosidad 3 meses',
      subtitulo: 'Evaluación diaria de mora y suspensión por reclamo abierto',
      icono: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M12 8v4 M12 16h.01',
    },
    {
      id: 'buses',
      grupo: 'OPERACION',
      titulo: 'Buses del Entrega Fest',
      subtitulo: 'Casos en evento presencial y reserva de cupo en transporte',
      icono:
        'M8 6v6 M15 6v6 M2 12h19.6 M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3 M7 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M16 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
      oculto: true,
    },
    {
      id: 'libro',
      grupo: 'OPERACION',
      titulo: 'Libro de reclamaciones',
      subtitulo: 'Gestión de quejas, reclamos y plazos legales INDECOPI',
      icono:
        'M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z',
    },
    {
      id: 'garantias',
      grupo: 'OPERACION',
      titulo: 'Garantías postventa',
      subtitulo: 'Reclamos de garantía con vigencia automática desde Acta de Entrega',
      icono: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
    },
    {
      id: 'sgd',
      grupo: 'OPERACION',
      titulo: 'Mesa SGD',
      subtitulo: 'Casos documentales con control de paquete 6/6 y Comité SGD',
      icono: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6',
    },
  ];

  readonly menuSupervision: readonly ItemMenuAtc[] = [
    {
      id: 'reasignar',
      grupo: 'SUPERVISION',
      titulo: 'Reasignar en bloque',
      subtitulo: 'Reasignación individual y masiva por ausencia con bitácora',
      icono: 'M16 3h5v5 M4 20L21 3 M21 16v5h-5 M15 15l6 6 M4 4l5 5',
    },
    {
      id: 'alertas',
      grupo: 'SUPERVISION',
      titulo: 'Alertas SLA',
      subtitulo: 'Alertas preventivas de SLA y ejecuciones del job programado',
      icono: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0',
    },
    {
      id: 'cierre',
      grupo: 'SUPERVISION',
      titulo: 'Cierre end-to-end',
      subtitulo: 'Objetivo 72 h hábiles (Eje 1/2) y 120 h hábiles (Eje 3)',
      icono: 'M12 8v4l3 3 M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0 -20',
    },
    {
      id: 'torre',
      grupo: 'SUPERVISION',
      titulo: 'Torre de Control CX',
      subtitulo: 'Tablero, riesgo de denuncia, encuestas, informes y auditoría IA',
      icono: 'M18 20V10 M12 20V4 M6 20v-6',
    },
  ];

  readonly menuGestion: readonly ItemMenuAtc[] = [
    {
      id: 'politicas',
      grupo: 'GESTION',
      titulo: 'Políticas SLA',
      subtitulo: 'Matriz de SLA por empresa, línea, tipo, prioridad y canal',
      icono: 'M12 2v20 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
    },
    {
      id: 'configuracion',
      grupo: 'GESTION',
      titulo: 'Configuración',
      subtitulo: 'Flujos por tipo, guías de solución versionadas y alertas de configuración',
      icono: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M19.4 15a1.65 1.65 0 0 0 .33 1.82',
    },
  ];

  readonly vistaActiva = signal<VistaAtc>('c360');
  /** Cliente y lote con los que la Vista 360 abrió «Nueva gestión» (GRA-02). */
  readonly contextoNuevoTicket = signal<{ cliente: string; dni: string; proyecto: string; lote?: string } | null>(null);
  /** Vista desde la que se abrió el ticket en curso: a ella vuelve «Volver» y es la que se resalta en el sidebar. */
  readonly vistaOrigen = signal<VistaAtc>('bandeja');
  readonly avisoNavegacion = signal<string | null>(null);
  readonly mostrarTrazabilidadHu = signal<boolean>(false);
  readonly empresaFiltro = this.estadoProto.empresaFiltro;
  readonly filtroBandejaCliente = signal<string>('');
  readonly modalCatalogoHuAbierto = signal<boolean>(false);

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

  readonly todosLosMenus: readonly ItemMenuAtc[] = [
    ...this.menuEstrella,
    ...this.menuOperacion,
    ...this.menuSupervision,
    ...this.menuGestion,
  ];

  readonly vistaMetaActual = computed<ItemMenuAtc>(
    () => this.todosLosMenus.find((m) => m.id === this.vistaActiva()) ?? this.menuEstrella[0],
  );

  readonly menusSidebarVisibles = computed<readonly ItemMenuAtc[]>(() => {
    const listables = this.todosLosMenus.filter((m) => !m.oculto);
    if (!this.filtrarSidebarPorRol()) return listables;
    const permitidos = this.estadoProto.vistasPermitidasParaRol(this.perspectivaId());
    return listables.filter((m) => m.grupo === 'ESTRELLA' || permitidos.includes(m.id));
  });

  /** FAV-01: el grupo «Favoritos» aparece arriba del menú en cuanto la persona marca uno y retira esas vistas de su grupo original para evitar duplicación. */
  readonly gruposSidebar = computed<AySidebarGrupo[]>(() => {
    const favoritos = this.favoritosDisponibles();
    if (favoritos.length === 0) return this.gruposMenu();
    const hrefsFavoritos = new Set(favoritos.map((o) => o.href));
    const grupo: AySidebarGrupo = {
      etiqueta: 'Favoritos',
      plegable: true,
      abiertoInicial: true,
      elementos: favoritos.map((o) => ({
        href: o.href,
        icono: o.id,
        etiqueta: o.titulo,
        actual: o.actual,
        insignia: o.insignia,
      })),
    };
    const gruposSinDuplicados = this.gruposMenu()
      .map((g) => ({
        ...g,
        elementos: g.elementos.filter((el) => !hrefsFavoritos.has(el.href)),
      }))
      .filter((g) => g.elementos.length > 0);
    return [grupo, ...gruposSinDuplicados];
  });

  private readonly gruposMenu = computed<AySidebarGrupo[]>(() => {
    const rol = this.perspectivaId();
    const activa = this.vistaActiva();
    // Dentro de un ticket se resalta la vista desde la que se abrió.
    const resaltada = activa === 'detalle' ? this.vistaOrigen() : activa;

    if (rol === 'CLIENTE') {
      return [
        {
          etiqueta: 'Núcleo 360 y Planta',
          plegable: true,
          abiertoInicial: true,
          elementos: this.menuEstrella.map((m) => ({
            href: `#vista:${m.id}`,
            icono: m.id,
            etiqueta: m.titulo,
            actual: activa === m.id,
          })),
        },
        {
          etiqueta: 'Mi Portal',
          plegable: true,
          abiertoInicial: true,
          elementos: [
            {
              href: '#vista:evento',
              icono: 'evento',
              etiqueta: 'EntregaFest en vivo',
              actual: activa === 'evento' || activa === 'buses',
            },
            {
              href: '#vista:nuevo',
              icono: 'nuevo',
              etiqueta: 'Mis solicitudes y nueva solicitud',
              actual: activa === 'nuevo',
            },
            {
              href: '#vista:libro',
              icono: 'libro',
              etiqueta: 'Libro de reclamaciones',
              actual: activa === 'libro',
            },
          ],
        },
      ];
    }

    const visibles = this.menusSidebarVisibles();
    const alertasAbiertas = this.estadoProto.alertasSla().length;
    const alertasConfigPend = this.estadoProto.alertasAdmin().length;

    const insigniaDe = (id: VistaAtc): string | undefined => {
      if (id === 'bandeja') return String(this.ticketsVisibles().length);
      if (id === 'tudia') return 'Hoy';
      if (id === 'alertas' && alertasAbiertas > 0) return String(alertasAbiertas);
      if (id === 'configuracion' && alertasConfigPend > 0) return String(alertasConfigPend);
      if (id === 'libro') return String(this.estadoProto.asientosLibroDetalle().length);
      if (id === 'sgd')
        return String(
          this.estadoProto.casosSgdDetalle().filter((s) => s.estado !== 'CERRADO').length,
        );
      if (id === 'garantias')
        return String(
          this.estadoProto
            .reclamosGarantiaDetalle()
            .filter((g) => g.estado !== 'RESOLVED').length,
        );
      return undefined;
    };
    const definiciones: readonly { grupo: ItemMenuAtc['grupo']; etiqueta: string }[] = [
      { grupo: 'ESTRELLA', etiqueta: 'Núcleo 360 y Planta' },
      { grupo: 'OPERACION', etiqueta: 'Operación' },
      { grupo: 'SUPERVISION', etiqueta: 'Supervisión' },
      { grupo: 'GESTION', etiqueta: 'Gestión y configuración' },
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
            icono: m.id,
            etiqueta: m.titulo,
            actual: resaltada === m.id,
            insignia: insigniaDe(m.id),
          })),
      }))
      .filter((g) => g.elementos.length > 0);
  });

  /** FAV-01: opciones del menú del rol activo (para no mostrar favoritos que el rol no ve). */
  private readonly opcionesMenu = computed(() =>
    this.gruposMenu().flatMap((g) =>
      g.elementos.map((el) => ({
        id: el.href.replace('#vista:', ''),
        href: el.href,
        titulo: el.etiqueta,
        grupo: g.etiqueta,
        actual: !!el.actual,
        insignia: el.insignia,
      })),
    ),
  );
  readonly opcionActual = computed(() => {
    const activa = this.vistaActiva();
    if (this.vistaMetaActual().oculto) return undefined;
    return this.opcionesMenu().find((o) => o.id === activa);
  });
  /** Favoritos por persona del rol activo; la memoria evita releer el almacén en cada cálculo. */
  private readonly favoritosPorPersona = signal<Record<string, string[]>>({});
  private readonly favoritosIds = computed(() => {
    const persona = this.perspectivaActual().personaId;
    return this.favoritosPorPersona()[persona] ?? leerFavoritos(persona);
  });
  /** Los favoritos que el rol activo puede ver, el más reciente primero. */
  readonly favoritosDisponibles = computed(() => {
    const opciones = this.opcionesMenu();
    return [...this.favoritosIds()].reverse().flatMap((id) => opciones.filter((o) => o.id === id));
  });
  readonly actualEsFavorito = computed(() => {
    const o = this.opcionActual();
    return !!o && this.favoritosIds().includes(o.id);
  });

  alternarFavoritoActual(): void {
    const o = this.opcionActual();
    if (!o) return;
    const persona = this.perspectivaActual().personaId;
    const ids = alternarFavorito(this.favoritosIds(), o.id);
    this.favoritosPorPersona.update((m) => ({ ...m, [persona]: ids }));
    guardarFavoritos(persona, ids);
  }

  readonly menuCuenta = computed<AyMenuItem[]>(() => {
    const p = this.perspectivaActual();
    return [
      { tipo: 'group', label: `${p.nombre} · ${p.cargo}` },
      { tipo: 'item', value: 'mesa', label: `Ir a ${this.tituloDeVista(p.vistaPrincipal)}` },
      { tipo: 'item', value: 'catalogo', label: 'Catálogo de 60 HUs' },
      { tipo: 'separator' },
      { tipo: 'group', label: 'Ver como (11 roles de usuario)' },
      ...this.perspectivasUsuarios.map((rol) => ({
        tipo: 'item' as const,
        value: `rol:${rol.id}`,
        label: `${rol.id === p.id ? '● ' : ''}${rol.cargo} · ${rol.nombre}`,
      })),
      { tipo: 'separator' },
      { tipo: 'item', value: 'salir', label: 'Cerrar sesión' },
    ];
  });

  readonly gruposComandos = computed<AyGrupoComandos[]>(() => {
    const q = this.consultaPaleta().trim().toLowerCase();
    const modulos = this.todosLosMenus
      .filter((m) => !m.oculto)
      .filter((m) => !q || m.titulo.toLowerCase().includes(q) || m.subtitulo.toLowerCase().includes(q))
      .map((m) => ({
        id: `mod:${m.id}`,
        titulo: m.titulo,
        contexto: m.subtitulo,
        alSeleccionar: () => {
          this.irAVista(m.id);
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
          this.irAVista(h.vista);
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

  readonly filtrosHu = crearFiltrosTabla<HuReferencia>(
    computed(() => this.catalogoHus),
    {
      clave: 'catalogo-hu',
      etiquetaElemento: 'historias',
      etiquetaBusqueda: 'Filtrar historias',
      placeholderBusqueda: 'Filtrar por código HU, feature o pantalla…',
      textoDe: (h) => [h.id, h.titulo, h.feature, h.pantalla, h.etapaNota ?? ''].join(' '),
      filtros: [
        {
          id: 'etapa',
          etiqueta: 'Etapa',
          tipo: 'segmento',
          etiquetaTodas: 'Todas',
          valorDe: (h) => h.etapa ?? 'Etapa 1',
          opciones: [
            { valor: 'Etapa 1', etiqueta: 'Fase 1' },
            { valor: 'Etapa 2', etiqueta: 'Fase 2' },
          ],
        },
      ],
    },
    inject(EstadoFiltrosTablas),
  );

  constructor() {
    const destruccion = inject(DestroyRef);
    const doc = inject(DOCUMENT);
    // El contexto de «Nueva gestión» vale para una sola apertura del formulario.
    effect(() => {
      if (this.vistaActiva() !== 'nuevo') untracked(() => this.contextoNuevoTicket.set(null));
    });
    effect(() => {
      const uid = this.acceso.sesion()?.usuarioId;
      if (!uid) return;
      const mapaUidRol: Record<string, RolPrototipoAtc> = {
        admin: 'SUPERVISOR',
        supervisor: 'SUPERVISOR',
        gestor: 'GESTOR',
        legal: 'LEGAL_RECLAMOS',
        cx: 'COORDINADOR_CX',
        postventa: 'COLABORADOR',
      };
      const rol = mapaUidRol[uid];
      if (rol && rol !== this.estadoProto.rolActivo()) {
        this.estadoProto.rolActivo.set(rol);
      }
    });

    const anclarFavoritoEnHeader = () => {
      const favEl = this.favoritosHostRef()?.nativeElement;
      if (!favEl) return;
      for (const nodo of Array.from(this.anfitrion.querySelectorAll<HTMLElement>('.pl-favoritos'))) {
        if (nodo !== favEl) nodo.remove();
      }
      const titulo = this.anfitrion.querySelector<HTMLElement>('#atc-contenido .ay-pageheader__title');
      if (titulo && (favEl.parentElement !== titulo || titulo.firstChild !== favEl)) {
        titulo.prepend(favEl);
      }
    };

    effect(() => {
      this.vistaActiva();
      this.favoritosHostRef();
      queueMicrotask(anclarFavoritoEnHeader);
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
      anclarFavoritoEnHeader();
      const mo = new MutationObserver(anclarFavoritoEnHeader);
      mo.observe(this.anfitrion, { childList: true, subtree: true });
      destruccion.onDestroy(() => mo.disconnect());
      const onKey = (ev: KeyboardEvent) => {
        if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'k') {
          ev.preventDefault();
          this.paletaAbierta.update((v) => !v);
        } else if (ev.key === 'Escape' && this.herramientasAbierto()) {
          this.cerrarHerramientas();
        }
      };
      const onPointerDown = (ev: PointerEvent) => {
        if (!this.herramientasAbierto()) return;
        if (ev.target instanceof Element && !ev.target.closest('.pt-herr')) {
          this.cerrarHerramientas();
        }
      };
      doc.addEventListener('keydown', onKey);
      doc.addEventListener('pointerdown', onPointerDown);
      destruccion.onDestroy(() => {
        doc.removeEventListener('keydown', onKey);
        doc.removeEventListener('pointerdown', onPointerDown);
      });
    });
  }

  alternarHerramientas(): void {
    const siguiente = !this.herramientasAbierto();
    this.herramientasAbierto.set(siguiente);
    if (!siguiente) {
      this.vistaHerramientas.set('menu');
    }
  }

  cerrarHerramientas(): void {
    this.herramientasAbierto.set(false);
    this.vistaHerramientas.set('menu');
  }

  abrirPanelApariencia(): void {
    this.cerrarHerramientas();
    this.simulacionAbierto.set(false);
    this.personalizarAbierto.update((v) => !v);
  }

  abrirPanelSimulacion(): void {
    this.cerrarHerramientas();
    this.personalizarAbierto.set(false);
    this.simulacionAbierto.update((v) => !v);
  }

  avanzarRelojSimulado(horas: number, etiqueta: string): void {
    this.horasAvanzadasSim.update((h) => h + horas);
    this.avisoSimulacion.set(
      `Reloj +${etiqueta}. Job de alertas ejecutado: SLA y plazos legales verificados.`,
    );
  }

  ejecutarJobAlertas(): void {
    const ahora = this.relojSimuladoFecha().getTime();
    const enRiesgo = this.tickets().filter(
      (t) => t.state !== 'RESOLVED' && t.state !== 'CLOSED' && t.resDue.getTime() <= ahora + 4 * 3600000,
    ).length;
    this.avisoSimulacion.set(
      `Job de alertas ejecutado: ${enRiesgo} tickets con alerta preventiva de SLA o plazo legal.`,
    );
  }

  alternarFuenteCaida(id: string, caida: boolean): void {
    this.fuentesCaidas.update((prev) =>
      caida ? (prev.includes(id) ? prev : [...prev, id]) : prev.filter((x) => x !== id),
    );
  }

  simularTicketEntranteMiPortal(): void {
    const ahora = this.relojSimuladoFecha();
    const correlativo = 510 + this.tickets().length;
    const nuevo: TicketAtc = {
      num: `AIN-${String(correlativo).padStart(6, '0')}`,
      co: 'AIN',
      empresa: this.empresas[0],
      line: 'Inmobiliaria y Lotes',
      ch: 'Mi Portal',
      type: 'CTA',
      prio: 'MEDIUM',
      eje: 1,
      state: 'OPEN',
      area: 'ATENCION_AL_CLIENTE',
      owner: 'Ana Torres',
      cli: 'Valeria Quispe Rojas',
      dni: '44819203',
      proj: 'Valle Sagrado · Mz C Lt 14',
      contract: 'VS-2025-0507',
      summary: 'Solicitud de estado de cuenta ingresada desde Mi Portal',
      emotion: 'Cliente solicita cronograma actualizado por canal digital.',
      opened: ahora,
      frDue: sumarHorasHabiles(ahora, 4),
      resDue: sumarHorasHabiles(ahora, 24),
      slaSrc: 'Matriz SLA v3 · CTA / MEDIA',
      reopen: 0,
      conflict: false,
      rayo: false,
      interactions: [
        {
          tipo: 'cli',
          fecha: ahora,
          canal: 'Mi Portal',
          autor: 'Valeria Quispe Rojas',
          texto: 'Solicito mi estado de cuenta actualizado con las cuotas pagadas.',
        },
      ],
      log: [
        {
          fecha: ahora,
          area: 'ATENCION_AL_CLIENTE',
          responsable: 'Ana Torres',
          motivo: 'Asignación automática por carga',
          nota: 'Ingreso desde Mi Portal.',
        },
      ],
      status: [{ fecha: ahora, estado: 'OPEN', autor: 'Mi Portal' }],
    };
    this.tickets.update((prev) => [nuevo, ...prev]);
    this.ticketSeleccionadoNum.set(nuevo.num);
    this.avisoSimulacion.set(`${nuevo.num} entró por Mi Portal y el flujo lo asignó por carga.`);
  }

  evaluarMorosidadSimulada(): void {
    const total = this.casosMorosidad().length;
    const enResolucion = this.casosMorosidad().filter((c) => c.estado === 'EN_RESOLUCION').length;
    this.avisoSimulacion.set(
      `Evaluación de morosidad: ${total} casos evaluados (${enResolucion} en evaluación de resolución).`,
    );
  }

  vaciarConsolaDemo(): void {
    this.tickets.set([]);
    this.asientosLibro.set([]);
    this.avisoSimulacion.set('Consola vacía: prueba los estados sin datos de cada bandeja.');
  }

  restaurarConsolaDemo(): void {
    this.tickets.set(crearTicketsDemo());
    this.asientosLibro.set(crearAsientosLibroDemo());
    this.casosSgd.set(crearCasosSgdDemo());
    this.casosMorosidad.set(crearCasosMorosidadDemo());
    this.garantias.set(crearGarantiasDemo());
    this.asistentes.set(crearAsistentesDemo());
    this.buses.set(crearBusesDemo());
    this.horasAvanzadasSim.set(0);
    this.fuentesCaidas.set([]);
    this.sinConexionSimulada.set(false);
    this.empresaFiltro.set('');
    this.avisoSimulacion.set('Datos iniciales restaurados.');
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
      this.cambiarPerspectivaUsuario(encontrada, true);
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
      this.irAVista(id);
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
        this.abrirTicket(tk.num);
      } else {
        this.avisoNavegacion.set(`No hay tickets de ${ev.clienteNombre}. Revisa la Bandeja de tickets.`);
        this.vistaActiva.set('bandeja');
      }
      return;
    }
    this.irAVista(ev.destino);
  }

  cambiarPerspectivaUsuario(p: PerfilRolPrototipoAtc, irASuMesa: boolean): void {
    this.estadoProto.rolActivo.set(p.id);
    if (this.acceso.demo) {
      this.acceso.ingresar(p.usuario, p.clave).catch(() => undefined);
    }
    const permitidas = this.estadoProto.vistasPermitidasParaRol(p.id);
    if (irASuMesa || (this.filtrarSidebarPorRol() && permitidas.length > 0 && !permitidas.includes(this.vistaActiva()))) {
      this.vistaActiva.set(p.vistaPrincipal);
    }
  }

  irAMesaDePerspectiva(p: PerfilRolPrototipoAtc): void {
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
    this.abrirTicket(num);
  }

  /** El expediente solo se abre desde un ticket concreto; sin él se vuelve a la Bandeja. */
  irAVista(vista: VistaAtc): void {
    if (vista === 'buses') {
      vista = 'evento';
    }
    if (vista === 'detalle') {
      this.avisoNavegacion.set('Abre un ticket desde la Bandeja de tickets (botón «Ver ticket») para ver su expediente.');
      this.vistaActiva.set('bandeja');
      return;
    }
    this.avisoNavegacion.set(null);
    this.vistaActiva.set(vista);
  }

  abrirTicket(num: string, origen?: VistaAtc): void {
    if (!this.tickets().some((t) => t.num === num)) {
      this.avisoNavegacion.set(`El ticket ${num} no existe en la Bandeja de tickets.`);
      this.vistaActiva.set('bandeja');
      return;
    }
    const actual = this.vistaActiva();
    this.vistaOrigen.set(origen ?? (actual === 'detalle' ? this.vistaOrigen() : actual));
    this.ticketSeleccionadoNum.set(num);
    this.avisoNavegacion.set(null);
    this.vistaActiva.set('detalle');
  }

  volverDelDetalle(): void {
    this.vistaActiva.set(this.vistaOrigen());
  }

  alCrearDesde360(ev: { cliente: string; dni: string; proyecto: string; contingencia: boolean; lote?: string }): void {
    this.contextoNuevoTicket.set(ev);
    this.vistaActiva.set('nuevo');
  }

  alCrearTicket(ev: { ticket: TicketAtc; crearAsientoLibro: boolean }): void {
    this.tickets.update((prev) => [ev.ticket, ...prev]);
    if (ev.crearAsientoLibro) {
      const nro = String(Math.floor(50 + Math.random() * 50)).padStart(4, '0');
      this.asientosLibro.update((prev) => [
        {
          n: nro,
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
      const venceOrig = sumarHorasHabiles(AHORA_BASE, 15 * 9);
      this.estadoProto.asientosLibroDetalle.update((prev) => [
        {
          id: `lib-${Date.now()}`,
          codigo: `LR-2026-${nro}`,
          empresaId: ev.ticket.co,
          establecimiento: 'Sede Digital / Mi Portal',
          ticketNum: ev.ticket.num,
          tipo: ev.ticket.type === 'QUE' ? 'QUEJA' : 'RECLAMO',
          consumidor: ev.ticket.cli,
          dni: ev.ticket.dni,
          registrado: AHORA_BASE,
          registradoPor: this.perspectivaActual().nombre,
          venceOriginal: venceOrig,
          venceProrrogado: null,
          hechos: ev.ticket.summary,
          pedido: 'Respuesta formal dentro del plazo legal INDECOPI.',
          monto: null,
          moneda: null,
          prorroga: null,
          respuesta: null,
          apelaciones: [],
          historialPlazo: [
            {
              id: `hp-${Date.now()}`,
              fecha: AHORA_BASE,
              evento: 'PLAZO_ORIGINAL',
              detalle: 'Apertura de hoja de reclamación con plazo de 15 días hábiles.',
              autor: this.perspectivaActual().nombre,
            },
          ],
        },
        ...prev,
      ]);
    }
    this.abrirTicket(ev.ticket.num, 'bandeja');
  }

  irAVistaDeHu(vista: VistaAtc): void {
    this.modalCatalogoHuAbierto.set(false);
    this.irAVista(vista);
  }
}
