import { Component, computed, input } from '@angular/core';
import { AyBadge, AyCard, AyCardBody, AyCardHeader, AyCardPairs, AyEmptyState } from '@aybarcorp/ui-angular';
import type { ParCardPairs } from '@aybarcorp/ui-angular';
import { ETIQUETA_ESTADO } from '../datos';
import type { Lote } from '../datos';
import { TONO_ESTADO, anuncioDeLote, paresDeFicha } from './plano';

/**
 * La ficha del lote elegido: su código, el estado con el mismo tono que en el plano y
 * sus datos (área, frente × fondo, precio y ubicación). Sin lote, dice cómo elegir uno.
 * Al elegir, una región viva lo anuncia, porque la ficha cambia lejos del foco.
 */
@Component({
  selector: 'gl-ficha-lote',
  imports: [AyBadge, AyCard, AyCardBody, AyCardHeader, AyCardPairs, AyEmptyState],
  template: `
    @if (lote(); as l) {
      <ay-card>
        <ay-card-header [titulo]="'Lote ' + l.id" nivel="h2" idTitulo="gl-maqueta-ficha" [subtitulo]="'Manzana ' + l.manzana + ' · lote ' + l.numero">
          <span ayAcciones>
            <ay-badge punto [tono]="tono[l.estado]">{{ etiqueta[l.estado] }}</ay-badge>
          </span>
        </ay-card-header>
        <ay-card-body>
          <ay-card-pairs [pares]="pares()" />
        </ay-card-body>
      </ay-card>
    } @else {
      <ay-card>
        <ay-card-header titulo="Ficha del lote" nivel="h2" idTitulo="gl-maqueta-ficha" />
        <ay-card-body>
          <ay-empty-state size="compact" variante="first-use" titulo="Elige un lote" descripcion="Tócalo en el plano, o recorre la lista con las flechas y pulsa Enter." />
        </ay-card-body>
      </ay-card>
    }
    <p class="ay-visually-hidden" role="status">{{ anuncio() }}</p>
  `,
})
export class FichaLote {
  readonly lote = input<Readonly<Lote> | undefined>(undefined);

  protected readonly tono = TONO_ESTADO;
  protected readonly etiqueta = ETIQUETA_ESTADO;
  protected readonly pares = computed<ParCardPairs[]>(() => {
    const lote = this.lote();
    return lote ? paresDeFicha(lote).map(([clave, valor]) => ({ clave, valor })) : [];
  });
  protected readonly anuncio = computed(() => {
    const lote = this.lote();
    return lote ? anuncioDeLote(lote) : '';
  });
}
