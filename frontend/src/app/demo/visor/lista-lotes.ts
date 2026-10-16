import { Component, ElementRef, afterRenderEffect, computed, input, output, viewChild } from '@angular/core';
import { AyCard, AyCardBody, AyCardHeader, AyTreeView } from '@aybarcorp/ui-angular';
import type { AyTreeNode } from '@aybarcorp/ui-angular';
import { idDeEtiqueta, metaDeLote, textoMostrando } from './plano';
import type { RamaLista } from './plano';

/**
 * La lista de lotes, accesible con el teclado: el árbol del framework —un solo punto de
 * tabulación, flechas, Inicio y Fin, una letra salta al siguiente nodo que empieza por
 * ella— con una rama por manzana. Enter elige el lote (y el 3D lo marca); el lote que
 * tiene el foco se marca también en el plano, más suave.
 *
 * El árbol no cuenta qué nodo tiene el foco: se lee del DOM (`data-nodo`, o la etiqueta,
 * que es el código del lote).
 */
@Component({
  selector: 'gl-lista-lotes',
  imports: [AyCard, AyCardBody, AyCardHeader, AyTreeView],
  template: `
    <ay-card>
      <ay-card-header titulo="Lotes" nivel="h2" [subtitulo]="recuento()" />
      <ay-card-body padding="none">
        <div #caja class="gl-maqueta__arbol" (focusin)="entrar($event)" (focusout)="salir($event)">
          <ay-tree-view
            etiqueta="Lotes por manzana"
            modo="navigation"
            size="sm"
            conRecuento
            [nodos]="nodos()"
            [abiertas]="abiertas()"
            (abiertasChange)="alAbrir.emit([...$event])"
            [elegidas]="elegidas()"
            (elegidasChange)="activar($event)"
            >Ningún lote con estos filtros. Cambia el estado o la manzana para ver más lotes.</ay-tree-view
          >
        </div>
      </ay-card-body>
      <ay-card-body padding="sm">
        <p class="gl-maqueta__nota">Flechas para recorrer, Enter para elegir. Una letra salta a su manzana.</p>
      </ay-card-body>
    </ay-card>
  `,
})
export class ListaLotes {
  readonly ramas = input.required<readonly RamaLista[]>();
  readonly total = input.required<number>();
  readonly seleccionado = input<string | null>(null);
  readonly abiertas = input.required<readonly string[]>();
  readonly alAbrir = output<string[]>();
  readonly alSeleccionar = output<string>();
  readonly alEnfocar = output<string | null>();

  private readonly caja = viewChild.required<ElementRef<HTMLElement>>('caja');

  protected readonly nodos = computed<AyTreeNode[]>(() =>
    this.ramas().map((rama) => ({
      id: rama.id,
      etiqueta: rama.etiqueta,
      meta: rama.meta,
      hijos: rama.lotes.map((lote) => ({ id: lote.id, etiqueta: lote.id, meta: metaDeLote(lote) })),
    })),
  );
  protected readonly elegidas = computed(() => {
    const id = this.seleccionado();
    return id ? [id] : [];
  });
  protected readonly recuento = computed(() =>
    textoMostrando(
      this.ramas().reduce((suma, rama) => suma + rama.lotes.length, 0),
      this.total(),
    ),
  );

  constructor() {
    // Un lote elegido en el plano se trae a la vista dentro de la lista (no la página entera).
    afterRenderEffect(() => {
      this.seleccionado();
      this.abiertas();
      const contenedor = this.caja().nativeElement;
      const nodo = contenedor.querySelector<HTMLElement>('[role="treeitem"][aria-selected="true"] > .ay-tree__row');
      if (!nodo) return;
      const arriba = nodo.getBoundingClientRect().top - contenedor.getBoundingClientRect().top + contenedor.scrollTop;
      const abajo = arriba + nodo.offsetHeight;
      if (arriba < contenedor.scrollTop) contenedor.scrollTop = arriba;
      else if (abajo > contenedor.scrollTop + contenedor.clientHeight) contenedor.scrollTop = abajo - contenedor.clientHeight;
    });
  }

  protected activar(ids: readonly string[]): void {
    const id = ids[0];
    if (id) this.alSeleccionar.emit(id);
  }

  protected entrar(evento: FocusEvent): void {
    const nodo = evento.target instanceof Element ? evento.target.closest('[role="treeitem"]') : null;
    this.alEnfocar.emit(idDeEtiqueta(nodo?.getAttribute('data-nodo') ?? nodo?.querySelector('.ay-tree__label')?.textContent));
  }

  protected salir(evento: FocusEvent): void {
    const destino = evento.relatedTarget;
    if (!(destino instanceof Node) || !this.caja().nativeElement.contains(destino)) this.alEnfocar.emit(null);
  }
}
