import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AyError404 } from '@aybarcorp/ui-angular';
import type { AySugerencia404 } from '@aybarcorp/ui-angular';
import { RAIZ_GALERIA, sugerencias } from './navegacion';

/**
 * Una ruta de /demo que no existe: el 404 del framework, dentro del marco, con las rutas
 * de la galería que más se parecen a la pedida (`/demo/cuneta` sugiere Cuenta).
 */
@Component({
  selector: 'gl-no-encontrada',
  imports: [AyError404],
  template: `
    <div class="gl-pagina gl-pagina--centrada">
      <h1 class="ay-visually-hidden">Página no encontrada en la galería</h1>
      <ay-error-404 scope="region" causa="unknown-route" [hrefVolver]="raiz" [sugerencias]="parecidas" />
    </div>
  `,
})
export class NoEncontradaGaleria {
  protected readonly raiz = RAIZ_GALERIA;
  protected readonly parecidas: AySugerencia404[] = sugerencias(inject(Router).url).map((d) => ({
    etiqueta: d.etiqueta,
    href: d.ruta,
  }));
}
