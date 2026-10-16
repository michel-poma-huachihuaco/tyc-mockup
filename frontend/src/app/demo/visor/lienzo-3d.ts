import { Component, DestroyRef, ElementRef, afterNextRender, effect, inject, input, output, signal, untracked, viewChild } from '@angular/core';
import { AySkeleton, AySpinner } from '@aybarcorp/ui-angular';
import { LOTES } from '../datos';
import type { EscenaLotes } from './escena-lotes';
import { resumenEnTexto } from './plano';

/**
 * El lienzo 3D: carga three.js con `import()` —solo aquí, en su propio chunk— y monta la
 * escena en un contenedor que Angular no toca. Mientras llega, la silueta del lienzo y un
 * Spinner (a partir de 300 ms); si falla (sin red, sin contexto WebGL), avisa con
 * `alFallar` y la pantalla pasa al plano 2D. Al destruirse, `dispose()` lo suelta todo.
 */
@Component({
  selector: 'gl-lienzo-3d',
  imports: [AySkeleton, AySpinner],
  template: `
    <div class="gl-maqueta__lienzo" [attr.aria-busy]="escena() === null">
      <div #contenedor class="gl-maqueta__webgl" role="img" [attr.aria-label]="etiqueta"></div>
      @if (escena() === null && silueta()) {
        <div class="gl-maqueta__carga">
          <ay-skeleton variante="block" ancho="100%" alto="100%" radio="0" />
          <span class="gl-maqueta__spinner">
            <ay-spinner size="lg" etiqueta="Cargando el visor 3D" mostrarTexto />
          </span>
        </div>
      }
    </div>
  `,
})
export class Lienzo3D {
  readonly seleccionado = input<string | null>(null);
  readonly enfocado = input<string | null>(null);
  readonly visibles = input.required<ReadonlySet<string>>();
  readonly alSeleccionar = output<string>();
  readonly alFallar = output<unknown>();

  private readonly contenedor = viewChild.required<ElementRef<HTMLElement>>('contenedor');
  protected readonly escena = signal<EscenaLotes | null>(null);
  protected readonly silueta = signal(false);
  protected readonly etiqueta = `Maqueta 3D de ${LOTES.length} lotes: ${resumenEnTexto()}. Arrastra para girar, rueda o pellizca para acercar. Con el teclado, usa la lista de lotes.`;

  constructor() {
    let cerrado = false;
    const espera = setTimeout(() => this.silueta.set(true), 300);
    inject(DestroyRef).onDestroy(() => {
      cerrado = true;
      clearTimeout(espera);
      this.escena()?.dispose();
    });

    afterNextRender(() => {
      import('./escena-lotes')
        .then(({ crearEscena }) => {
          if (cerrado) return;
          this.escena.set(crearEscena(this.contenedor().nativeElement, { alSeleccionar: (id) => this.alSeleccionar.emit(id) }));
        })
        .catch((error: unknown) => {
          if (!cerrado) this.alFallar.emit(error);
        });
    });

    // La escena sigue a la pantalla: elegido, enfocado y filtro.
    effect(() => {
      const escena = this.escena();
      const id = this.seleccionado();
      untracked(() => escena?.seleccionar(id));
    });
    effect(() => {
      const escena = this.escena();
      const id = this.enfocado();
      untracked(() => escena?.enfocar(id));
    });
    effect(() => {
      const escena = this.escena();
      const visibles = this.visibles();
      untracked(() => escena?.filtrar(visibles));
    });
  }
}
