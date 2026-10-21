import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AyButton, AyEmptyState } from '@aybarcorp/ui-angular';
import type { FiltrosTabla } from './filtros-tabla';

/**
 * Estado vacío estándar de una tabla filtrable. Se proyecta en la tabla con `ayVacio`:
 * <app-vacio-filtros ayVacio [filtros]="filtros" elemento="ticket" />. Con filtros activos dice que no hay
 * resultados y ofrece «Limpiar filtros»; sin ellos, que la tabla aún no tiene datos.
 */
@Component({
  selector: 'app-vacio-filtros',
  standalone: true,
  imports: [AyButton, AyEmptyState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let f = filtros();
    @if (f.hayActivos()) {
      <ay-empty-state
        variante="no-results"
        size="compact"
        titulo="Sin resultados"
        [descripcion]="'Ningún ' + elemento() + ' coincide con la búsqueda y los filtros aplicados.'"
      >
        <div ayAcciones>
          <ay-button tamano="sm" variante="secondary" (click)="f.limpiar()">Limpiar filtros</ay-button>
        </div>
      </ay-empty-state>
    } @else {
      <ay-empty-state
        variante="first-use"
        size="compact"
        [titulo]="'Aún no hay ' + f.cfg.etiquetaElemento"
        descripcion="Cuando haya registros aparecerán aquí."
      />
    }
  `,
})
export class VacioFiltrosComponent {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly filtros = input.required<FiltrosTabla<any>>();
  /** Singular del elemento para el mensaje: «ticket». */
  readonly elemento = input<string>('registro');
}
