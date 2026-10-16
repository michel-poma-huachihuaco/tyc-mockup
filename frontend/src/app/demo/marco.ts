import {
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
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import {
  AyAppearancePanel,
  AyAvatar,
  AyBreadcrumb,
  AyButton,
  AyCommandPalette,
  AyDrawer,
  AyDropdownMenu,
  AyIconButton,
  AyNavbar,
  AySegmentedControl,
  AySidePanel,
  AySidebar,
  AySkipLink,
  AyToggleButton,
  CATALOGO_VITRINA,
} from '@aybarcorp/ui-angular';
import type { AyBreadcrumbNivel, AyGrupoComandos, AyMenuItem, AySegmentoOpcion, AySidebarGrupo } from '@aybarcorp/ui-angular';
import { filter, map } from 'rxjs';
import { BotonTema } from '../pantallas/boton-tema';
import { nombreVisible, rolesVisibles } from '../sesion';
import { OPCIONES_VER_COMO, esVerComo } from './acceso';
import { buscar, crearIndice } from './busqueda';
import type { EntradaBusqueda } from './busqueda';
import { textoParaCopiar } from './configuracion';
import { EstadoGaleria } from './estado';
import { GRUPOS_SECCION, RAIZ_GALERIA, SECCIONES, resolverRuta, rutaLimpia } from './navegacion';
import type { NombresCatalogo } from './navegacion';
import { usarAtributosDeApariencia, usarCopiar } from './utiles';

/** Los nombres visibles de la vitrina para las migas: «form-controls» → «Form Controls». */
export const NOMBRES_DEL_CATALOGO: NombresCatalogo = {
  familia: (id) => CATALOGO_VITRINA.familias.find((f) => f.id === id)?.nombre,
  componente: (familia, slug) =>
    CATALOGO_VITRINA.familias.find((f) => f.id === familia)?.componentes.find((c) => c.slug === slug)?.nombre,
};

/**
 * El marco de la galería, en el orden que pide el sistema de diseño:
 *
 * - ay-skip-link, primero.
 * - ay-navbar: la marca, el buscador global (Ctrl K / Cmd K abre la paleta de comandos),
 *   «Ver como», «Personalizar», el tema y el menú de la cuenta.
 * - ay-sidebar con las secciones (se pliega con `[`); por debajo de 768 px, un ay-drawer.
 * - `main#contenido`, con las migas de pan de cada pantalla y la pantalla.
 * - El panel Personalizar: un ay-side-panel redimensionable con el ay-appearance-panel del
 *   framework. Su estado vive en EstadoGaleria, así que sigue abierto al navegar.
 *
 * Con `?embebido=1` solo queda el contenido: así lo carga el iframe de Redimensionado.
 */
@Component({
  selector: 'gl-marco',
  imports: [
    AyAppearancePanel,
    AyAvatar,
    AyBreadcrumb,
    AyButton,
    AyCommandPalette,
    AyDrawer,
    AyDropdownMenu,
    AyIconButton,
    AyNavbar,
    AySegmentedControl,
    AySidePanel,
    AySidebar,
    AySkipLink,
    AyToggleButton,
    BotonTema,
    RouterLink,
    RouterOutlet,
  ],
  host: { class: 'gl-marco', '[class.gl-marco--embebido]': 'estado.embebido' },
  template: `
    @if (estado.embebido) {
      <main id="contenido" class="gl-principal gl-principal--embebido" tabindex="-1">
        <router-outlet />
      </main>
    } @else {
      <ay-skip-link [destinos]="destinosSalto" margenAnclaje="var(--gl-navbar-alto, 0px)" />
      <ay-navbar [conMenuMovil]="true" [menuAbierto]="navegacionAbierta()" idDrawer="gl-navegacion-movil" (menuClick)="navegacionAbierta.set(true)">
        <a ayMarca class="ay-navbar__brand gl-marca" [routerLink]="raiz">
          <svg class="gl-marca__simbolo" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
            <rect width="32" height="32" rx="8" fill="currentColor" />
            <path class="gl-marca__letra" d="M9 24 16 8l7 16h-3.6l-1.4-3.4h-4L12.6 24Zm6-6.4h2.1L16 14.9Z" />
          </svg>
          <span class="gl-marca__texto">Galería</span>
          <span class="gl-marca__pastilla">Angular</span>
          <span class="ay-visually-hidden">: portada de la galería de demostración</span>
        </a>
        <div ayBusqueda class="gl-buscador">
          <button type="button" class="gl-buscador__boton" aria-keyshortcuts="Control+K Meta+K" (click)="estado.busquedaAbierta.set(true)">
            <svg class="gl-buscador__icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <span class="gl-buscador__texto">Buscar en la galería</span>
            <kbd class="gl-buscador__atajo" aria-hidden="true">Ctrl K</kbd>
          </button>
        </div>
        <ng-container ayAcciones>
          <div class="gl-ver-como">
            @if (estado.adminReal()) {
              <ay-segmented-control
                etiqueta="Ver como"
                size="sm"
                [opciones]="opcionesVerComo"
                [valor]="estado.verComo()"
                (valorChange)="verComo($event)"
              />
            } @else {
              <!-- Sin ADMIN real no hay a qué cambiar: «Ver como» nunca sube los roles. -->
              <p class="gl-ver-como__fijo">Ves la galería como <strong>Usuario</strong></p>
            }
          </div>
          <ay-toggle-button tamano="sm" [presionado]="estado.personalizarAbierto()" (presionadoChange)="estado.personalizarAbierto.set($event)">
            <svg class="gl-icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false">
              <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
              <circle cx="16" cy="7" r="2" />
              <circle cx="10" cy="17" r="2" />
            </svg>
            <span class="gl-solo-ancho">Personalizar</span>
          </ay-toggle-button>
          <app-boton-tema />
          @if (estado.sesion(); as sesion) {
            <ay-dropdown-menu class="gl-usuario" colocacion="bottom-end" [items]="menuCuenta()" (elegido)="alElegirCuenta($event)">
              <ay-icon-button ayDisparador [etiqueta]="'Cuenta de ' + nombre()">
                <ay-avatar [nombre]="nombre()" size="sm" decorativo />
              </ay-icon-button>
            </ay-dropdown-menu>
          }
        </ng-container>
      </ay-navbar>

      <div class="gl-marco__cuerpo">
        <div class="gl-marco__lateral">
          <ay-sidebar etiqueta="Secciones de la galería" [grupos]="grupos()" [(colapsada)]="lateralPlegado" />
        </div>

        <main id="contenido" class="gl-principal" tabindex="-1">
          @if (migas().length > 1) {
            <div class="gl-principal__migas">
              <ay-breadcrumb etiqueta="Migas de pan" [items]="migas()" />
            </div>
          }
          <router-outlet />
        </main>

        <ay-side-panel
          id="gl-personalizar"
          titulo="Personalizar"
          lado="end"
          size="md"
          redimensionable
          tienePie
          [abierto]="estado.personalizarAbierto()"
          (abiertoChange)="estado.personalizarAbierto.set($event)"
        >
          <p class="gl-personalizar__intro">
            Cada cambio se aplica a toda la galería al momento y se recuerda en este navegador. Prueba una combinación y
            recorre las pantallas con el panel abierto.
          </p>
          <ay-appearance-panel titulo="Apariencia" [nivelTitulo]="3" mostrarPresets />
          <div ayPie class="gl-personalizar__pie">
            <ay-button variante="secondary" tamano="sm" (click)="copiarConfiguracion()">Copiar configuración</ay-button>
          </div>
        </ay-side-panel>
      </div>

      <ay-drawer id="gl-navegacion-movil" titulo="Galería" lado="start" size="sm" [(abierto)]="navegacionAbierta">
        <nav class="gl-nav-movil" aria-label="Secciones de la galería">
          @for (grupo of grupos(); track grupo.etiqueta) {
            <p class="gl-nav-movil__grupo" [id]="'gl-nav-movil-' + $index">{{ grupo.etiqueta }}</p>
            <ul class="gl-nav-movil__lista" [attr.aria-labelledby]="'gl-nav-movil-' + $index">
              @for (elemento of grupo.elementos; track elemento.href) {
                <li>
                  <a class="gl-nav-movil__enlace" [routerLink]="elemento.href" [attr.aria-current]="elemento.actual ? 'page' : null">
                    {{ elemento.etiqueta }}
                  </a>
                </li>
              }
            </ul>
          }
        </nav>
        @if (estado.adminReal()) {
          <div class="gl-nav-movil__ver-como">
            <ay-segmented-control
              etiqueta="Ver como"
              size="sm"
              anchoCompleto
              [opciones]="opcionesVerComo"
              [valor]="estado.verComo()"
              (valorChange)="verComo($event)"
            />
          </div>
        }
      </ay-drawer>

      <ay-command-palette
        etiqueta="Buscar en la galería"
        size="lg"
        mensajeVacio="Nada coincide. Prueba con otra palabra: tabla, ventana, fecha, contraseña…"
        [filtroLocal]="false"
        [grupos]="resultados()"
        [(abierta)]="estado.busquedaAbierta"
        (consultaChange)="consulta.set($event)"
      />
    }
  `,
})
export class MarcoGaleria {
  protected readonly estado = inject(EstadoGaleria);
  private readonly router = inject(Router);
  private readonly anfitrion: HTMLElement = inject(ElementRef).nativeElement;
  private readonly ventana = inject(DOCUMENT).defaultView;
  private readonly copiar = usarCopiar();
  private readonly atributos = usarAtributosDeApariencia();

  protected readonly raiz = RAIZ_GALERIA;
  protected readonly destinosSalto = [{ id: 'contenido', etiqueta: 'Saltar al contenido' }];
  protected readonly navegacionAbierta = signal(false);
  protected readonly lateralPlegado = signal(false);
  protected readonly consulta = signal('');

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );
  private readonly ruta = computed(() => rutaLimpia(this.url()));
  private readonly resolucion = computed(() => resolverRuta(this.url(), NOMBRES_DEL_CATALOGO));

  protected readonly nombre = computed(() => {
    const sesion = this.estado.sesion();
    return sesion ? nombreVisible(sesion) : '';
  });

  protected readonly migas = computed<AyBreadcrumbNivel[]>(() =>
    this.resolucion().migas.map((m) => (m.ruta ? { label: m.etiqueta, href: m.ruta } : { label: m.etiqueta })),
  );

  /** Solo se ofrece con ADMIN real: sin él no hay a qué cambiar. */
  protected readonly opcionesVerComo: AySegmentoOpcion[] = OPCIONES_VER_COMO.map(({ valor, etiqueta }) => ({ valor, etiqueta }));

  /** Las secciones por grupo; Administración solo con ADMIN entre los roles efectivos. */
  protected readonly grupos = computed<AySidebarGrupo[]>(() => {
    const ruta = this.ruta();
    const admin = this.estado.esAdmin();
    return GRUPOS_SECCION.map((grupo) => ({
      etiqueta: grupo,
      elementos: SECCIONES.filter((s) => s.grupo === grupo && (!s.soloAdmin || admin)).map((s) => ({
        href: s.ruta,
        etiqueta: s.titulo,
        actual: s.id === '' ? ruta === s.ruta : ruta === s.ruta || (s.subsecciones.length === 0 && ruta.startsWith(`${s.ruta}/`)),
        ...(s.subsecciones.length > 0
          ? {
              elementos: s.subsecciones.map((sub) => ({
                href: `${s.ruta}/${sub.id}`,
                etiqueta: sub.titulo,
                actual: ruta === `${s.ruta}/${sub.id}`,
              })),
            }
          : {}),
      })),
    })).filter((g) => g.elementos.length > 0);
  });

  protected readonly menuCuenta = computed<AyMenuItem[]>(() => {
    const sesion = this.estado.sesion();
    return [
      { tipo: 'group', label: sesion ? `${nombreVisible(sesion)} · ${rolesVisibles(sesion)}` : 'Sin sesión' },
      { tipo: 'item', value: 'cuenta', label: 'Ir a mi cuenta' },
      { tipo: 'item', value: 'aplicacion', label: 'Volver a la aplicación' },
      { tipo: 'separator' },
      { tipo: 'item', value: 'salir', label: 'Salir' },
    ];
  });

  /** El índice de búsqueda se arma la primera vez que se busca: el catálogo es grande. */
  private indice: EntradaBusqueda[] | null = null;

  protected readonly resultados = computed<AyGrupoComandos[]>(() => {
    const consulta = this.consulta().trim();
    const admin = this.estado.esAdmin();
    if (!consulta) {
      return GRUPOS_SECCION.map((grupo) => ({
        etiqueta: grupo,
        elementos: SECCIONES.filter((s) => s.grupo === grupo && (!s.soloAdmin || admin)).map((s) => ({
          id: `seccion:${s.id || 'portada'}`,
          titulo: s.id ? s.titulo : 'Portada de la galería',
          contexto: s.resumen,
          alSeleccionar: () => this.ir(s.ruta),
        })),
      }));
    }
    this.indice ??= crearIndice(CATALOGO_VITRINA);
    return buscar(this.indice, consulta)
      .map((grupo) => ({
        etiqueta: grupo.etiqueta,
        elementos: grupo.entradas
          .filter((e) => admin || !e.ruta.startsWith(`${RAIZ_GALERIA}/admin`))
          .map((e) => ({ id: e.id, titulo: e.titulo, contexto: e.contexto, alSeleccionar: () => this.ir(e.ruta) })),
      }))
      .filter((grupo) => grupo.elementos.length > 0);
  });

  constructor() {
    const destruccion = inject(DestroyRef);
    // Cerrar la sesión desde fuera (otra pestaña, la renovación que falla) saca de la galería.
    effect(() => {
      if (this.estado.sesion() === null) void this.router.navigateByUrl('/');
    });
    // Cada pantalla empieza arriba y con la navegación móvil cerrada; un ancla (#…) manda.
    const suscripcion = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.navegacionAbierta.set(false);
        if (!e.urlAfterRedirects.includes('#')) this.ventana?.scrollTo({ top: 0 });
      });
    destruccion.onDestroy(() => suscripcion.unsubscribe());
    // La Navbar es pegajosa: su alto lo usan la Sidebar, el panel y el atajo para no taparse.
    afterNextRender(() => {
      const barra = this.anfitrion.querySelector<HTMLElement>('.ay-navbar');
      if (!barra) return;
      const publicar = () => this.anfitrion.style.setProperty('--gl-navbar-alto', `${barra.offsetHeight}px`);
      publicar();
      const observador = new ResizeObserver(publicar);
      observador.observe(barra);
      destruccion.onDestroy(() => observador.disconnect());
    });
  }

  protected verComo(valor: string): void {
    if (!esVerComo(valor)) return;
    this.estado.establecerVerComo(valor);
  }

  protected async alElegirCuenta(valor: string): Promise<void> {
    if (valor === 'cuenta') await this.router.navigateByUrl(`${RAIZ_GALERIA}/cuenta`);
    else if (valor === 'aplicacion') await this.router.navigateByUrl('/');
    else if (valor === 'salir') {
      await this.estado.salir();
      await this.router.navigateByUrl('/', { onSameUrlNavigation: 'reload' });
    }
  }

  protected async copiarConfiguracion(): Promise<void> {
    await this.copiar(textoParaCopiar(this.atributos()), 'Configuración copiada: el <html> con sus data-* y el mismo JSON.');
  }

  private ir(ruta: string): Promise<boolean> {
    return this.router.navigateByUrl(ruta);
  }
}
