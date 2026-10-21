import { Component } from '@angular/core';
import { AyError404 } from '@aybarcorp/ui-angular';

/** Una ruta que esta aplicación no tiene. */
@Component({
  selector: 'app-no-encontrada',
  imports: [AyError404],
  template: `
    <main id="contenido" class="pl-centro">
      <ay-error-404 causa="unknown-route" hrefVolver="/" />
    </main>
  `,
})
export class NoEncontrada {}
