import { Component, computed, input } from '@angular/core';
import { ETIQUETA_ESTADO, resumenLotes } from '../datos';
import type { EstadoLote } from '../datos';
import { ESTADOS, TOKEN_ESTADO, alturaRelativa, idTrama } from './plano';

/**
 * Las tramas del plano 2D, una sola vez en la página: las usan el plano y la leyenda
 * (`fill="url(#gl-maqueta-trama-…)"`), así que viven fuera de los dos. Son del color de la
 * superficie sobre el color del estado: se ven en claro y en oscuro.
 */
@Component({
  selector: 'gl-tramas',
  template: `
    <svg class="gl-maqueta__tramas" aria-hidden="true" focusable="false">
      <defs>
        <pattern id="gl-maqueta-trama-puntos" width="3" height="3" patternUnits="userSpaceOnUse">
          <circle class="gl-maqueta__punto" cx="1.5" cy="1.5" r="0.7" />
        </pattern>
        <pattern id="gl-maqueta-trama-rayas" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line class="gl-maqueta__raya" x1="0" y1="0" x2="0" y2="3" />
        </pattern>
        <pattern id="gl-maqueta-trama-cuadros" width="3" height="3" patternUnits="userSpaceOnUse">
          <path class="gl-maqueta__raya" d="M0 0H3M0 0V3" />
        </pattern>
      </defs>
    </svg>
  `,
})
export class Tramas {}

/** Una caja del color y la trama del estado, con la altura relativa de su caja en 3D. */
@Component({
  selector: 'gl-muestra',
  template: `
    <svg class="gl-maqueta__muestra" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
      <rect x="0" [attr.y]="12 - alto()" width="12" [attr.height]="alto()" rx="1.5" [style.fill]="relleno()" />
      @if (trama(); as id) {
        <rect x="0" [attr.y]="12 - alto()" width="12" [attr.height]="alto()" rx="1.5" [attr.fill]="'url(#' + id + ')'" />
      }
    </svg>
  `,
})
export class Muestra {
  readonly estado = input.required<EstadoLote>();
  protected readonly alto = computed(() => 4 + alturaRelativa(this.estado()) * 8);
  protected readonly relleno = computed(() => `var(${TOKEN_ESTADO[this.estado()]})`);
  protected readonly trama = computed(() => idTrama(this.estado()));
}

/**
 * La leyenda: cada estado con su color, su trama, la altura de su caja y cuántos lotes
 * hay (`resumenLotes`). El estado va escrito: el color y la forma solo lo refuerzan.
 */
@Component({
  selector: 'gl-leyenda',
  imports: [Muestra],
  template: `
    <div class="gl-maqueta__leyenda">
      <ul class="gl-maqueta__estados" aria-label="Leyenda de estados">
        @for (estado of estados; track estado) {
          <li class="gl-maqueta__estado">
            <gl-muestra [estado]="estado" />
            <span>{{ etiqueta[estado] }}</span>
            <span class="gl-maqueta__cuenta">{{ resumen[estado] }}</span>
          </li>
        }
      </ul>
      <p class="gl-maqueta__nota">En 3D, la altura también dice el estado; en 2D, la trama.</p>
    </div>
  `,
})
export class Leyenda {
  protected readonly estados = ESTADOS;
  protected readonly etiqueta = ETIQUETA_ESTADO;
  protected readonly resumen = resumenLotes();
}
