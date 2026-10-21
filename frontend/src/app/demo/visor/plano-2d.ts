import { Component, DestroyRef, ElementRef, afterNextRender, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { ETIQUETA_ESTADO, LOTES, PLANO } from '../datos';
import type { Lote } from '../datos';
import { MANZANAS_PLANO, MARGEN_2D, TOKEN_ESTADO, VIEWBOX_2D, idTrama, loteDe, resumenEnTexto } from './plano';

/** Lo que el SVG pinta de cada lote, calculado una vez. */
const DIBUJO = LOTES.map((lote) => ({
  lote,
  relleno: `var(${TOKEN_ESTADO[lote.estado]})`,
  trama: idTrama(lote.estado),
  titulo: `${lote.id} · ${ETIQUETA_ESTADO[lote.estado]} · ${lote.area} m²`,
}));

/** El contorno de un lote marcado, algo mayor que el lote. */
function marcaDe(lote: Readonly<Lote> | undefined) {
  return lote ? { x: lote.x - 0.6, y: lote.y - 0.6, ancho: lote.frente + 1.2, alto: lote.fondo + 1.2 } : null;
}

/**
 * La alternativa 2D del visor: el mismo plano en SVG, con los colores de los mismos
 * tokens y una trama por estado. Se ve sin WebGL, con movimiento reducido o porque se
 * eligió. Como el 3D, se usa con el puntero; con el teclado, la lista de lotes (el SVG es
 * una imagen con su descripción, no 160 paradas de tabulación).
 *
 * En una pantalla estrecha el plano conserva un ancho mínimo legible y se desplaza de
 * lado dentro de su caja, que entonces entra en el orden de tabulación para poder
 * desplazarla con las flechas.
 */
@Component({
  selector: 'gl-plano-2d',
  template: `
    <div
      #caja
      class="gl-maqueta__plano"
      [attr.role]="desborda() ? 'region' : null"
      [attr.aria-label]="desborda() ? 'Plano 2D, desplazable de lado' : null"
      [attr.tabindex]="desborda() ? 0 : null"
    >
      <svg
        class="gl-maqueta__svg"
        [attr.viewBox]="viewBox"
        role="img"
        [attr.aria-label]="etiqueta"
        (click)="pulsar($event)"
        (pointermove)="mover($event)"
        (pointerleave)="encima.set(null)"
      >
        <rect class="gl-maqueta__suelo" [attr.x]="-margen" [attr.y]="-margen" [attr.width]="ancho" [attr.height]="alto" />
        @for (m of manzanas; track m.manzana) {
          <g>
            <rect class="gl-maqueta__manzana" [attr.x]="m.rect.x - 1" [attr.y]="m.rect.y - 1" [attr.width]="m.rect.ancho + 2" [attr.height]="m.rect.alto + 2" rx="1.5" />
            <text class="gl-maqueta__rotulo" [attr.x]="m.rect.x - 1" [attr.y]="m.rect.y - 3">Manzana {{ m.manzana }}</text>
          </g>
        }
        @for (d of dibujo; track d.lote.id) {
          <g class="gl-maqueta__lote" [class.is-fuera]="!visibles().has(d.lote.id)" [attr.data-lote]="d.lote.id">
            <title>{{ d.titulo }}</title>
            <rect [attr.x]="d.lote.x" [attr.y]="d.lote.y" [attr.width]="d.lote.frente" [attr.height]="d.lote.fondo" [style.fill]="d.relleno" />
            @if (d.trama; as trama) {
              <rect class="gl-maqueta__trama" [attr.x]="d.lote.x" [attr.y]="d.lote.y" [attr.width]="d.lote.frente" [attr.height]="d.lote.fondo" [attr.fill]="'url(#' + trama + ')'" />
            }
          </g>
        }
        @if (marcaFoco(); as f) {
          <rect class="gl-maqueta__marca gl-maqueta__marca--foco" [attr.x]="f.x" [attr.y]="f.y" [attr.width]="f.ancho" [attr.height]="f.alto" rx="1" />
        }
        @if (marcaElegido(); as e) {
          <rect class="gl-maqueta__marca gl-maqueta__marca--elegido" [attr.x]="e.x" [attr.y]="e.y" [attr.width]="e.ancho" [attr.height]="e.alto" rx="1" />
        }
      </svg>
    </div>
  `,
})
export class Plano2D {
  readonly seleccionado = input<string | null>(null);
  readonly enfocado = input<string | null>(null);
  readonly visibles = input.required<ReadonlySet<string>>();
  readonly alSeleccionar = output<string>();

  private readonly caja = viewChild.required<ElementRef<HTMLElement>>('caja');
  protected readonly encima = signal<string | null>(null);
  protected readonly desborda = signal(false);

  protected readonly viewBox = VIEWBOX_2D;
  protected readonly margen = MARGEN_2D;
  protected readonly ancho = PLANO.ancho + 2 * MARGEN_2D;
  protected readonly alto = PLANO.alto + 2 * MARGEN_2D;
  protected readonly manzanas = MANZANAS_PLANO;
  protected readonly dibujo = DIBUJO;
  protected readonly etiqueta = `Plano 2D de ${LOTES.length} lotes en ${MANZANAS_PLANO.length} manzanas: ${resumenEnTexto()}. Para elegir un lote con el teclado, usa la lista de lotes.`;

  protected readonly marcaElegido = computed(() => {
    const lote = loteDe(this.seleccionado());
    return lote && this.visibles().has(lote.id) ? marcaDe(lote) : null;
  });
  protected readonly marcaFoco = computed(() => {
    const lote = loteDe(this.encima() ?? this.enfocado());
    return lote && lote.id !== this.seleccionado() && this.visibles().has(lote.id) ? marcaDe(lote) : null;
  });

  constructor() {
    // `true` mientras el plano es más ancho que su caja (en un celular).
    const destruccion = inject(DestroyRef);
    afterNextRender(() => {
      const elemento = this.caja().nativeElement;
      const medir = () => this.desborda.set(elemento.scrollWidth > elemento.clientWidth + 1);
      const observador = new ResizeObserver(medir);
      observador.observe(elemento);
      medir();
      destruccion.onDestroy(() => observador.disconnect());
    });
  }

  private loteDelEvento(evento: Event): string | null {
    const nodo = evento.target instanceof Element ? evento.target.closest('[data-lote]') : null;
    const id = nodo?.getAttribute('data-lote') ?? null;
    return id !== null && this.visibles().has(id) ? id : null;
  }

  protected pulsar(evento: MouseEvent): void {
    const id = this.loteDelEvento(evento);
    if (id) this.alSeleccionar.emit(id);
  }

  protected mover(evento: PointerEvent): void {
    this.encima.set(evento.pointerType === 'mouse' ? this.loteDelEvento(evento) : null);
  }
}
