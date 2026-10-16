import { Component, DestroyRef, ElementRef, afterNextRender, computed, effect, inject, signal, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AyBanner, AyContainer, AyNavbar, AyPageHeader, AySkipLink } from '@aybarcorp/ui-angular';
import { Acceso } from '../acceso';
import { NOMBRE_PROYECTO } from '../proyecto';
import { esSesionDemo } from '../sesion';
import { BotonTema } from './boton-tema';
import { Marca } from './marca';
import { MenuUsuario } from './menu-usuario';

let siguienteId = 0;

/**
 * El marco de las pantallas con sesión, en el orden que pide el sistema de diseño:
 *
 * - ay-skip-link, primero: un Tab y Enter llevan al contenido sin recorrer la Navbar.
 * - ay-navbar: la marca, que vuelve al inicio, y sus acciones: el tema y el menú de la
 *   cuenta (quién inició sesión, sus roles y «Salir»).
 * - Si la sesión es la simulada, un Banner que lo dice mientras dure: no se descarta porque
 *   la condición sigue activa. En el celular es una línea con «Más».
 * - `main#contenido`, destino del atajo, con el encabezado de la página (su título es el h1
 *   y el título de la pestaña) y el contenido.
 *
 * Si la sesión se cierra —«Salir», o la renovación falla—, vuelve a `/`, que sin sesión es
 * la bienvenida.
 *
 * La Navbar queda fija arriba al desplazar y, en escritorio, el aviso debajo de ella. Lo
 * que se fije más abajo y el salto del atajo necesitan sus altos:
 * se publican en `--pl-navbar-alto` y `--pl-aviso-alto` y se miden de nuevo si cambian (al
 * estrecharse la ventana, el texto ocupa más líneas). La hoja los suma en `--pl-fijo-alto`.
 */
@Component({
  selector: 'app-marco',
  imports: [AyBanner, AyContainer, AyNavbar, AyPageHeader, AySkipLink, BotonTema, Marca, MenuUsuario, RouterLink],
  host: { class: 'pl-pagina' },
  template: `
    <ay-skip-link margenAnclaje="var(--pl-fijo-alto, 0px)" />
    <ay-navbar [conMenuMovil]="false">
      <a ayMarca class="ay-navbar__brand" routerLink="/"><app-marca [nombre]="nombre" /></a>
      <ng-container ayAcciones>
        <app-boton-tema />
        @if (acceso.sesion(); as sesion) {
          <app-menu-usuario [sesion]="sesion" (salir)="salir()" />
        }
      </ng-container>
    </ay-navbar>
    @if (demo()) {
      <!--
        Desde 768 px, el texto entero. Por debajo, una línea corta y «Más», que despliega el
        texto entero: los dos textos están siempre en el DOM y la hoja elige cuál se ve.
      -->
      <div #aviso class="pl-pagina__aviso" [attr.data-abierto]="avisoAbierto() ? '' : null">
        <ay-banner tono="warning">
          <span class="pl-aviso__corto">Sesión demo · sin token</span>
          <span class="pl-aviso__completo" [id]="idAviso">
            Sesión demo: inicio de sesión simulado para desarrollo local, sin emisor OIDC y sin token. Solo existe
            con npm run dev, en localhost.
          </span>
          <button
            ayAccion
            type="button"
            class="pl-aviso__mas"
            [attr.aria-expanded]="avisoAbierto()"
            [attr.aria-controls]="idAviso"
            (click)="avisoAbierto.set(!avisoAbierto())"
          >
            {{ avisoAbierto() ? 'Menos' : 'Más' }}
          </button>
        </ay-banner>
      </div>
    }
    <main id="contenido" class="pl-contenido" tabindex="-1">
      <ay-container size="page">
        <div class="pl-cabecera"><ay-page-header [titulo]="nombre" /></div>
      </ay-container>
      <ng-content />
    </main>
  `,
})
export class Marco {
  protected readonly acceso = inject(Acceso);
  private readonly router = inject(Router);
  private readonly anfitrion: HTMLElement = inject(ElementRef).nativeElement;
  private readonly aviso = viewChild<ElementRef<HTMLElement>>('aviso');
  private saliendo = false;

  protected readonly nombre = NOMBRE_PROYECTO;
  protected readonly demo = computed(() => esSesionDemo(this.acceso.sesion()));
  protected readonly avisoAbierto = signal(false);
  protected readonly idAviso = `pl-aviso-${++siguienteId}`;

  constructor() {
    effect(() => {
      // `/` ya puede ser la URL actual: sin `reload` el Router ignoraría la navegación.
      if (this.acceso.sesion() === null) void this.router.navigateByUrl('/', { onSameUrlNavigation: 'reload' });
    });
    // La Navbar está siempre: se mide una vez montada y cada vez que cambia de alto.
    const destruccion = inject(DestroyRef);
    afterNextRender(() => {
      const barra = this.anfitrion.querySelector<HTMLElement>('.ay-navbar');
      if (!barra) return;
      const observador = this.medir('--pl-navbar-alto', barra);
      destruccion.onDestroy(() => observador.disconnect());
    });
    // El aviso aparece y desaparece con la sesión demo.
    effect((alLimpiar) => {
      const fijo = this.aviso()?.nativeElement;
      if (!fijo) return;
      const observador = this.medir('--pl-aviso-alto', fijo);
      alLimpiar(() => {
        observador.disconnect();
        this.anfitrion.style.removeProperty('--pl-aviso-alto');
      });
    });
  }

  protected async salir(): Promise<void> {
    // Un segundo «Salir» mientras se cierra la sesión no hace nada.
    if (this.saliendo) return;
    this.saliendo = true;
    try {
      await this.acceso.salir();
    } finally {
      this.saliendo = false;
    }
  }

  /** Publica el alto de `elemento` en `propiedad` y lo vuelve a publicar si cambia. */
  private medir(propiedad: string, elemento: HTMLElement): ResizeObserver {
    const publicar = () => this.anfitrion.style.setProperty(propiedad, `${elemento.offsetHeight}px`);
    publicar();
    const observador = new ResizeObserver(publicar);
    observador.observe(elemento);
    return observador;
  }
}
