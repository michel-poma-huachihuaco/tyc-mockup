import { Component, DestroyRef, ElementRef, afterNextRender, computed, effect, inject, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AySkipLink, AyVitrina, CATALOGO_VITRINA } from '@aybarcorp/ui-angular';
import { BotonTema } from '../../pantallas/boton-tema';
import { NOMBRE_PROYECTO } from '../../proyecto';
import { Icono } from '../icono';
import { RAIZ_GALERIA } from '../navegacion';

/**
 * /demo/vitrina/:familia/:componente/caso/:n: un caso de la vitrina a pantalla completa,
 * para lo que no cabe en una columna (Login Form, Error Page, los layouts). Pinta la página
 * del componente con `ay-vitrina` y deja a la vista solo el caso `n` —el n-ésimo del
 * catálogo, contado desde 1 a través de sus grupos—, a todo el ancho y el alto. La barra de
 * arriba vuelve al componente y recorre los casos.
 */
@Component({
  selector: 'gl-pantalla-caso',
  imports: [AySkipLink, AyVitrina, BotonTema, Icono, RouterLink],
  host: { class: 'gl-caso' },
  template: `
    <ay-skip-link [destinos]="destinos" />
    <header class="gl-barra-flotante gl-caso__barra">
      <a class="gl-barra-flotante__volver" [routerLink]="rutaComponente()">
        <gl-icono nombre="izquierda" />
        <span>{{ nombreComponente() }}</span>
      </a>
      <p class="gl-barra-flotante__titulo">
        <span class="gl-barra-flotante__etiqueta">{{ etiqueta() ?? 'Caso desconocido' }}</span>
        <span class="gl-barra-flotante__contador">Caso {{ n() }} de {{ total() }}</span>
      </p>
      <nav class="gl-barra-flotante__pasos" aria-label="Otros casos">
        @if (n() > 1) {
          <a class="gl-boton-icono" [routerLink]="rutaCaso(n() - 1)" aria-label="Caso anterior"><gl-icono nombre="izquierda" /></a>
        }
        @if (n() < total()) {
          <a class="gl-boton-icono" [routerLink]="rutaCaso(n() + 1)" aria-label="Caso siguiente"><gl-icono nombre="derecha" /></a>
        }
      </nav>
      <app-boton-tema />
    </header>
    <main #lienzo id="contenido" class="gl-caso__lienzo" tabindex="-1">
      @if (etiqueta()) {
        <ay-vitrina modo="pagina" [nivel]="2" [familia]="familia()" [componente]="componente()" [buscador]="false" />
      } @else {
        <p class="gl-caso__vacio">
          Este componente no tiene un caso {{ n() }}. <a [routerLink]="rutaComponente()">Volver a {{ nombreComponente() }}</a>.
        </p>
      }
    </main>
  `,
})
export class PantallaCaso {
  private readonly parametros = toSignal(inject(ActivatedRoute).paramMap, { requireSync: true });
  private readonly lienzo = viewChild.required<ElementRef<HTMLElement>>('lienzo');
  private remarcar: (() => void) | null = null;

  protected readonly destinos = [{ id: 'contenido', etiqueta: 'Saltar al caso' }];
  protected readonly familia = computed(() => this.parametros().get('familia') ?? '');
  protected readonly componente = computed(() => this.parametros().get('componente') ?? '');
  protected readonly n = computed(() => Number(this.parametros().get('n') ?? '1'));

  private readonly entrada = computed(() =>
    CATALOGO_VITRINA.familias.find((f) => f.id === this.familia())?.componentes.find((c) => c.slug === this.componente()),
  );
  private readonly etiquetas = computed(() => this.entrada()?.grupos.flatMap((g) => g.casos.map((c) => c.etiqueta)) ?? []);
  protected readonly total = computed(() => this.etiquetas().length);
  protected readonly etiqueta = computed<string | undefined>(() => this.etiquetas()[this.n() - 1]);
  protected readonly nombreComponente = computed(() => this.entrada()?.nombre ?? this.componente());
  protected readonly rutaComponente = computed(() => `${RAIZ_GALERIA}/vitrina/${this.familia()}/${this.componente()}`);

  constructor() {
    const titulo = inject(Title);
    effect(() => titulo.setTitle(`${this.nombreComponente()} · ${this.etiqueta() ?? 'caso'} · Galería · ${NOMBRE_PROYECTO}`));
    // Otro caso del mismo componente no cambia el DOM de la vitrina: se marca de nuevo.
    effect(() => {
      this.etiqueta();
      this.remarcar?.();
    });
    // La vitrina pinta todos los casos del componente: se marca el elegido y la hoja oculta
    // los demás. Se repite si la vitrina vuelve a pintar (otro caso, otro componente).
    const destruccion = inject(DestroyRef);
    afterNextRender(() => {
      const raiz = this.lienzo().nativeElement;
      let pendiente = 0;
      const marcar = () => {
        cancelAnimationFrame(pendiente);
        pendiente = requestAnimationFrame(() => {
          const casos = [...raiz.querySelectorAll<HTMLElement>('ay-vitrina-caso')];
          const buscado = this.etiqueta();
          const texto = (c: HTMLElement) => c.querySelector('.ay-vitrina-caso__etiqueta')?.textContent?.trim();
          // Por posición en el catálogo; si la vitrina los ordenara distinto, por su etiqueta.
          const porPosicion = casos[this.n() - 1];
          const elegido = porPosicion && texto(porPosicion) === buscado ? porPosicion : casos.find((c) => texto(c) === buscado);
          for (const caso of casos) caso.toggleAttribute('data-gl-elegido', caso === elegido);
          raiz.querySelectorAll<HTMLElement>('ay-vitrina-grupo').forEach((g) => {
            g.toggleAttribute('data-gl-con-elegido', Boolean(elegido && g.contains(elegido)));
          });
        });
      };
      const observador = new MutationObserver(marcar);
      observador.observe(raiz, { childList: true, subtree: true });
      this.remarcar = marcar;
      marcar();
      destruccion.onDestroy(() => {
        observador.disconnect();
        cancelAnimationFrame(pendiente);
      });
    });
  }

  protected rutaCaso(n: number): string {
    return `${this.rutaComponente()}/caso/${n}`;
  }
}
