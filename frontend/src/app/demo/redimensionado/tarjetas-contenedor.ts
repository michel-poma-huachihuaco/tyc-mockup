import { Component, ElementRef, ViewEncapsulation, computed, inject, input } from '@angular/core';
import { AyCard, AyCardBody, AySplitter } from '@aybarcorp/ui-angular';
import { LOTES } from '../datos';
import { pxPorRem, usarAnchoDe } from './medir';
import { PLURAL_ESTADO, disposicionPara, resumenPorEstado } from './modelo';
import type { ResumenEstado } from './modelo';

/**
 * Un panel de tarjetas: el contenedor de sus container queries (el propio elemento, con
 * `container: gl-cq-panel`). Dice cuánto mide y qué disposición le toca.
 */
@Component({
  selector: 'gl-panel-tarjetas',
  imports: [AyCard, AyCardBody],
  host: { class: 'gl-cq__panel' },
  template: `
    <p class="gl-cq__medida">
      @if (ancho() > 0) {
        Este panel mide {{ redondo(ancho()) }} px
        <span class="gl-cq__disposicion">{{ disposicion() }}</span>
      } @else {
        Midiendo el panel
      }
    </p>
    <ul class="gl-cq__tarjetas">
      @for (e of estados(); track e.estado) {
        <li>
          <ay-card>
            <ay-card-body>
              <div class="gl-cq__contenido" [attr.data-estado]="e.estado">
                <p class="gl-cq__numero">{{ e.total }}</p>
                <div class="gl-cq__detalle">
                  <p class="gl-cq__etiqueta">{{ plural[e.estado] }} · {{ e.porcentaje }} % de los lotes</p>
                  <span class="gl-cq__barra" aria-hidden="true">
                    <span class="gl-cq__relleno" [style.--gl-cq-porcentaje]="e.porcentaje + '%'"></span>
                  </span>
                  <dl class="gl-cq__desglose">
                    @for (m of e.manzanas; track m.manzana) {
                      <div>
                        <dt>Manzana {{ m.manzana }}</dt>
                        <dd>{{ m.total }}</dd>
                      </div>
                    }
                  </dl>
                </div>
              </div>
            </ay-card-body>
          </ay-card>
        </li>
      }
    </ul>
  `,
})
export class PanelTarjetas {
  readonly estados = input.required<readonly ResumenEstado[]>();
  protected readonly plural = PLURAL_ESTADO;
  private readonly anfitrion: HTMLElement = inject(ElementRef).nativeElement;
  protected readonly ancho = usarAnchoDe(() => this.anfitrion);
  protected readonly disposicion = computed(() => disposicionPara(this.ancho(), pxPorRem()));

  protected redondo(valor: number): number {
    return Math.round(valor);
  }
}

/**
 * Tarjetas que cambian de disposición con el ancho de su panel (container queries), no con
 * el de la ventana: al arrastrar el separador, cada panel pasa de apilada a en fila y a
 * amplia por su cuenta.
 */
@Component({
  selector: 'gl-tarjetas-contenedor',
  imports: [AySplitter, PanelTarjetas],
  encapsulation: ViewEncapsulation.None,
  styleUrl: './contenedor.css',
  host: { class: 'gl-cq' },
  template: `
    <ay-splitter etiqueta="Repartir el ancho entre los dos paneles de tarjetas" [tamano]="62" [minimo]="20" [maximo]="80" clavePersistencia="galeria:tarjetas">
      <gl-panel-tarjetas ayPanelInicio [estados]="primeros" />
      <gl-panel-tarjetas ayPanelFin [estados]="ultimos" />
    </ay-splitter>
  `,
})
export class TarjetasContenedor {
  private readonly resumen = resumenPorEstado(LOTES);
  protected readonly primeros = this.resumen.slice(0, 2);
  protected readonly ultimos = this.resumen.slice(2);
}
