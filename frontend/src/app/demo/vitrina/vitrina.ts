import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgTemplateOutlet } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AyBadge, AyDrawer, AyButton, AyVitrina, CATALOGO_VITRINA, buscarEnCatalogo } from '@aybarcorp/ui-angular';
import type { AyVitrinaNavegacion } from '@aybarcorp/ui-angular';
import { Icono } from '../icono';
import { RAIZ_GALERIA } from '../navegacion';
import { alternativas } from '../sinonimos';

/** Un título de la página del componente, para «En esta página». */
interface Entrada {
  readonly id: string;
  readonly texto: string;
}

const RAIZ_VITRINA = `${RAIZ_GALERIA}/vitrina`;

/**
 * /demo/vitrina[/:familia[/:componente]]: la vitrina del framework (`ay-vitrina`) en modo
 * página, como una documentación: un componente por URL, la navegación de familias a la
 * izquierda, «En esta página» a la derecha y un buscador con sinónimos en español
 * (`[(consulta)]` y `[sinonimos]`). Cada caso trae su código «angular · standalone» con
 * Copiar; los casos grandes van a ancho completo y las capas devuelven el foco a su
 * disparador (lo hace la vitrina). Cualquier caso se abre a pantalla completa en
 * /demo/vitrina/:familia/:componente/caso/:n.
 *
 * La URL manda: elegir algo dentro de la vitrina emite `(navegar)` y aquí se navega.
 */
@Component({
  selector: 'gl-pagina-vitrina',
  imports: [AyBadge, AyButton, AyDrawer, AyVitrina, Icono, NgTemplateOutlet, RouterLink],
  template: `
    <div class="gl-vitrina">
      <aside class="gl-vitrina__lateral" aria-label="Componentes de la vitrina">
        <ng-container *ngTemplateOutlet="navegacion" />
      </aside>

      <div class="gl-vitrina__contenido">
        <div class="gl-vitrina__barra">
          <span class="gl-vitrina__abrir">
            <ay-button variante="secondary" tamano="sm" (click)="navegacionAbierta.set(true)">
              <gl-icono ayIconoInicio nombre="vitrina" />
              Componentes
            </ay-button>
          </span>
          <div class="gl-vitrina__encabezado">
            <h1 class="gl-vitrina__titulo">Vitrina</h1>
            <p class="gl-vitrina__resumen">
              {{ totalComponentes }} componentes · {{ totalCasos }} casos ·
              <span class="gl-vitrina__marco">&#64;aybarcorp/ui-angular</span>
            </p>
          </div>
        </div>
        <div #lienzo class="gl-vitrina__lienzo">
          <ay-vitrina
            modo="pagina"
            [nivel]="2"
            [familia]="familia()"
            [componente]="componente()"
            [buscador]="false"
            [sinonimos]="sinonimos"
            [(consulta)]="consulta"
            (navegar)="ir($event)"
          />
        </div>
      </div>

      <nav class="gl-vitrina__indice" aria-labelledby="gl-indice-titulo">
        @if (indice().length > 0) {
          <p id="gl-indice-titulo" class="gl-indice__titulo">En esta página</p>
          <ul class="gl-indice__lista">
            @for (entrada of indice(); track entrada.id) {
              <li>
                <a
                  class="gl-indice__enlace"
                  [href]="'#' + entrada.id"
                  [attr.aria-current]="entrada.id === activa() ? 'location' : null"
                  (click)="saltar($event, entrada.id)"
                  >{{ entrada.texto }}</a
                >
              </li>
            }
          </ul>
        } @else {
          <p id="gl-indice-titulo" class="ay-visually-hidden">En esta página</p>
        }
        @if (casos().length > 0) {
          <details class="gl-indice__casos">
            <summary class="gl-indice__resumen">Casos a pantalla completa <ay-badge size="sm">{{ casos().length }}</ay-badge></summary>
            <ol class="gl-indice__lista gl-indice__lista--casos">
              @for (caso of casos(); track $index) {
                <li><a class="gl-indice__enlace" [routerLink]="caso.ruta">{{ caso.etiqueta }}</a></li>
              }
            </ol>
          </details>
        }
      </nav>
    </div>

    <ay-drawer titulo="Componentes" lado="start" size="sm" [(abierto)]="navegacionAbierta">
      <ng-container *ngTemplateOutlet="navegacion" />
    </ay-drawer>

    <ng-template #navegacion>
      <div class="gl-familias">
        <div class="gl-familias__buscar" role="search">
          <label class="ay-visually-hidden" [for]="idBuscar">Buscar en la vitrina</label>
          <gl-icono nombre="buscar" />
          <input
            class="gl-familias__campo"
            type="search"
            placeholder="Buscar componente"
            autocomplete="off"
            [id]="idBuscar"
            [value]="consulta()"
            (input)="consulta.set($any($event.target).value)"
          />
        </div>
        @if (consulta() && familiasVisibles().length === 0) {
          <p class="gl-familias__vacio">Nada coincide con «{{ consulta() }}».</p>
        }
        @for (f of familiasVisibles(); track f.id) {
          <div class="gl-familias__grupo">
            <a class="gl-familias__familia" [routerLink]="raiz + '/' + f.id" [attr.aria-current]="f.id === familia() && !componente() ? 'page' : null">
              {{ f.nombre }}
            </a>
            <ul class="gl-familias__lista">
              @for (c of f.componentes; track c.slug) {
                <li>
                  <a
                    class="gl-familias__componente"
                    [routerLink]="raiz + '/' + f.id + '/' + c.slug"
                    [attr.aria-current]="f.id === familia() && c.slug === componente() ? 'page' : null"
                    >{{ c.nombre }}</a
                  >
                </li>
              }
            </ul>
          </div>
        }
      </div>
    </ng-template>
  `,
})
export class PaginaVitrina {
  private readonly router = inject(Router);
  private readonly lienzo = viewChild.required<ElementRef<HTMLElement>>('lienzo');
  private readonly parametros = toSignal(inject(ActivatedRoute).paramMap, { requireSync: true });

  protected readonly raiz = RAIZ_VITRINA;
  protected readonly idBuscar = 'gl-vitrina-buscar';
  protected readonly sinonimos = alternativas;
  protected readonly familia = computed(() => this.parametros().get('familia'));
  protected readonly componente = computed(() => this.parametros().get('componente'));
  protected readonly consulta = signal('');
  protected readonly navegacionAbierta = signal(false);

  protected readonly totalComponentes = CATALOGO_VITRINA.familias.reduce((n, f) => n + f.componentes.length, 0);
  protected readonly totalCasos = CATALOGO_VITRINA.familias.reduce(
    (n, f) => n + f.componentes.reduce((m, c) => m + c.grupos.reduce((k, g) => k + g.casos.length, 0), 0),
    0,
  );

  /** La navegación de la izquierda, filtrada con la misma búsqueda y los mismos sinónimos. */
  protected readonly familiasVisibles = computed(() => {
    const q = this.consulta().trim();
    return (q ? buscarEnCatalogo(CATALOGO_VITRINA, alternativas(q)) : CATALOGO_VITRINA).familias;
  });

  /** Los casos del componente a la vista, en el orden del catálogo, con su URL. */
  protected readonly casos = computed(() => {
    const familia = this.familia();
    const slug = this.componente();
    const componente = CATALOGO_VITRINA.familias.find((f) => f.id === familia)?.componentes.find((c) => c.slug === slug);
    if (!componente || !familia) return [];
    return componente.grupos
      .flatMap((g) => g.casos)
      .map((caso, i) => ({ etiqueta: caso.etiqueta, ruta: `${RAIZ_VITRINA}/${familia}/${componente.slug}/caso/${i + 1}` }));
  });

  protected readonly indice = signal<Entrada[]>([]);
  protected readonly activa = signal<string | null>(null);

  constructor() {
    // Elegir un componente con una búsqueda a la vista la cierra: la página es la del componente.
    effect(() => {
      this.familia();
      this.componente();
      untracked(() => {
        this.consulta.set('');
        this.navegacionAbierta.set(false);
      });
    });
    // «En esta página» sale de los títulos que pinta la vitrina: se rehace cuando cambian.
    const destruccion = inject(DestroyRef);
    afterNextRender(() => {
      const raiz = this.lienzo().nativeElement;
      let espia: IntersectionObserver | null = null;
      let pendiente = 0;
      const rehacer = () => {
        cancelAnimationFrame(pendiente);
        pendiente = requestAnimationFrame(() => {
          const titulos = [...raiz.querySelectorAll<HTMLElement>('.ay-vitrina-grupo__titulo[id], .ay-vitrina-api__titulo[id]')].filter(
            (t) => t.offsetParent !== null,
          );
          const entradas = titulos.map((t) => ({ id: t.id, texto: (t.textContent ?? '').trim() }));
          const anterior = this.indice();
          if (anterior.length !== entradas.length || anterior.some((e, i) => e.id !== entradas[i]?.id || e.texto !== entradas[i]?.texto)) {
            this.indice.set(entradas);
          }
          espia?.disconnect();
          espia = new IntersectionObserver(
            (cambios) => {
              const visible = cambios.find((c) => c.isIntersecting);
              if (visible) this.activa.set(visible.target.id);
            },
            { rootMargin: '0px 0px -70% 0px' },
          );
          titulos.forEach((t) => espia?.observe(t));
        });
      };
      const observador = new MutationObserver(rehacer);
      observador.observe(raiz, { childList: true, subtree: true });
      rehacer();
      destruccion.onDestroy(() => {
        observador.disconnect();
        espia?.disconnect();
        cancelAnimationFrame(pendiente);
      });
    });
  }

  protected ir({ familia, componente }: AyVitrinaNavegacion): void {
    void this.router.navigate([RAIZ_VITRINA, familia, ...(componente ? [componente] : [])]);
  }

  /** Salta al título y lo enfoca, sin recargar ni pasar por el Router. */
  protected saltar(evento: MouseEvent, id: string): void {
    const destino = this.lienzo().nativeElement.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
    if (!destino) return;
    evento.preventDefault();
    if (!destino.hasAttribute('tabindex')) destino.setAttribute('tabindex', '-1');
    destino.focus({ preventScroll: true });
    destino.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    this.activa.set(id);
  }
}
