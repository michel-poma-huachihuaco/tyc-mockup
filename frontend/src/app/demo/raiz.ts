import { Component, DOCUMENT, DestroyRef, ViewEncapsulation, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AyToastRegion } from '@aybarcorp/ui-angular';
import { EnlacesInternos } from './enlaces';
import { EstadoGaleria } from './estado';
import type { HerramientasGaleria } from './accesibilidad/axe';

/**
 * Lo que la galería deja en `window` en desarrollo, para las pruebas de navegador:
 * `axe(opciones?)` analiza la página con axe-core (WCAG 2.2 A y AA) y devuelve JSON plano.
 */
declare global {
  interface Window {
    __aybarGaleria?: HerramientasGaleria;
  }
}

/**
 * La raíz de /demo: carga la hoja de la galería (galeria.css, con prefijo `gl-`), pone la
 * región de los Toast y navega con el Router los enlaces internos de los componentes del
 * framework. Las pantallas de ingreso cuelgan directamente de aquí, a pantalla completa;
 * las demás, del marco (marco.ts).
 *
 * La hoja va sin encapsular a propósito: es de toda la galería —el marco, cada pantalla y
 * las capas que el framework lleva a `body`— y solo existe mientras la galería está
 * montada, que es solo en desarrollo.
 *
 * También deja `window.__aybarGaleria.axe()` para que una prueba de Playwright analice
 * cualquier pantalla con axe-core sin pasar por la de Accesibilidad.
 */
@Component({
  selector: 'gl-galeria',
  imports: [AyToastRegion, RouterOutlet],
  hostDirectives: [EnlacesInternos],
  encapsulation: ViewEncapsulation.None,
  styleUrl: './galeria.css',
  host: { class: 'gl', '[attr.data-embebido]': "estado.embebido ? '' : null" },
  template: `
    <router-outlet />
    <ay-toast-region posicion="bottom-end" />
  `,
})
export class GaleriaRaiz {
  protected readonly estado = inject(EstadoGaleria);

  constructor() {
    const ventana = inject(DOCUMENT).defaultView;
    if (!ventana) return;
    const ganchos: HerramientasGaleria = {
      axe: (opciones) => import('./accesibilidad/axe').then((m) => m.analizar(ventana.document, opciones)),
    };
    ventana.__aybarGaleria = ganchos;
    inject(DestroyRef).onDestroy(() => {
      if (ventana.__aybarGaleria === ganchos) delete ventana.__aybarGaleria;
    });
  }
}
