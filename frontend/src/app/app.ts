import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Componente raíz: solo el router. Las pantallas viven en src/app/pantallas/ y usan los
 * componentes standalone de @aybarcorp/ui-angular, importados donde se usan.
 *
 * Las llamadas a APIs no van en los componentes: van en un servicio (src/app/api/) que usa
 * el cliente de @aybarcorp/http. HttpClient, fetch o axios dentro de un componente lo corta
 * el guardián de arquitectura.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class App {}
