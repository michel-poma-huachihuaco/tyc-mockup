import { Component, ViewEncapsulation, computed, signal } from '@angular/core';
import { AyAlert, AyButton, AyFormField, AySelect } from '@aybarcorp/ui-angular';
import type { AyOpcionSelect } from '@aybarcorp/ui-angular';
import { LOTES } from '../datos';
import { FichaLote } from './ficha-lote';
import { Leyenda, Tramas } from './leyenda';
import { Lienzo3D } from './lienzo-3d';
import { ListaLotes } from './lista-lotes';
import { Plano2D } from './plano-2d';
import {
  SIN_FILTRO,
  TODAS,
  avisoDe2D,
  esFiltroEstado,
  esFiltroManzana,
  filtrarLotes,
  hayWebGL,
  idDeManzana,
  loteDe,
  manzanaDeId,
  opcionesEstado,
  opcionesManzana,
  pideMenosMovimiento,
  ramasDeLista,
  vistaInicial,
} from './plano';
import type { Filtro, Motivo2D, Vista } from './plano';

/**
 * /demo/3d: los 160 lotes de un proyecto sintético en three.js, con su alternativa 2D, la
 * lista accesible con el teclado y la ficha del lote elegido. Es la misma pantalla que la
 * de React (src/demo/tres-d/ allí): la escena (escena-lotes.ts), el plano puro (plano.ts) y
 * la hoja (visor.css) son los mismos archivos.
 *
 * El estado es de esta pantalla y de nadie más —filtro, lote elegido, lote enfocado,
 * manzanas abiertas— y baja a las vistas: la escena 3D y el plano 2D solo avisan de un
 * clic. El lote elegido que el filtro deja fuera no se borra: deja de verse, y vuelve al
 * quitar el filtro.
 *
 * three.js llega con un `import()` dentro de gl-lienzo-3d: ni esta pantalla ni ninguna
 * otra lo llevan en su chunk. Sin WebGL, con movimiento reducido o por elección, el plano 2D.
 */
@Component({
  selector: 'gl-visor',
  imports: [AyAlert, AyButton, AyFormField, AySelect, FichaLote, Leyenda, Lienzo3D, ListaLotes, Plano2D, Tramas],
  encapsulation: ViewEncapsulation.None,
  styleUrl: './visor.css',
  template: `
    <div class="gl-pagina">
      <header class="gl-cabecera">
        <p class="gl-sobretitulo"><span class="gl-sobretitulo__punto" aria-hidden="true"></span>Experiencia</p>
        <h1 class="gl-titulo">Visor 3D</h1>
        <p class="gl-texto">
          Los lotes de un proyecto sintético en three.js, con los colores de la paleta activa. Arrastra para girar y usa la
          rueda para acercar; con el teclado, recorre la lista.
        </p>
      </header>

      <div class="gl-maqueta">
        <gl-tramas />
        <div class="gl-maqueta__mandos">
          <div class="gl-maqueta__filtros" role="group" aria-label="Filtros de lotes">
            <ay-form-field etiqueta="Estado">
              <ay-select [opciones]="opcionesEstado" [valor]="filtro().estado" (valorChange)="filtrarEstado($event)" />
            </ay-form-field>
            <ay-form-field etiqueta="Manzana">
              <ay-select [opciones]="opcionesManzana" [valor]="filtro().manzana" (valorChange)="filtrarManzana($event)" />
            </ay-form-field>
          </div>
          @if (webgl) {
            <ay-button variante="secondary" (click)="cambiarVista()">{{ textoVista() }}</ay-button>
          }
        </div>

        <gl-leyenda />

        @if (aviso(); as texto) {
          <ay-alert [tono]="motivo() === 'error' ? 'warning' : 'info'" size="sm" [anuncio]="motivo() === 'error' ? 'polite' : 'off'">{{ texto }}</ay-alert>
        }

        <div class="gl-maqueta__cuerpo">
          <div class="gl-maqueta__escenario">
            @if (vista() === '3d') {
              <gl-lienzo-3d
                [seleccionado]="elegido()"
                [enfocado]="enfocado()"
                [visibles]="idsVisibles()"
                (alSeleccionar)="elegir($event)"
                (alFallar)="fallo3D()"
              />
            } @else {
              <gl-plano-2d [seleccionado]="elegido()" [enfocado]="enfocado()" [visibles]="idsVisibles()" (alSeleccionar)="elegir($event)" />
            }
          </div>
          <div class="gl-maqueta__lateral">
            <gl-ficha-lote [lote]="loteElegido()" />
            <gl-lista-lotes
              [ramas]="ramas()"
              [total]="total"
              [seleccionado]="elegido()"
              [abiertas]="abiertas()"
              (alAbrir)="abiertas.set($event)"
              (alSeleccionar)="activarEnLista($event)"
              (alEnfocar)="enfocado.set($event)"
            />
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PantallaVisor {
  protected readonly webgl = hayWebGL();
  private readonly inicial = vistaInicial(this.webgl, pideMenosMovimiento());
  protected readonly vista = signal<Vista>(this.inicial.vista);
  protected readonly motivo = signal<Motivo2D | null>(this.inicial.motivo);
  protected readonly filtro = signal<Filtro>(SIN_FILTRO);
  private readonly seleccionado = signal<string | null>(null);
  protected readonly enfocado = signal<string | null>(null);
  protected readonly abiertas = signal<readonly string[]>(ramasDeLista(LOTES).map((rama) => rama.id));

  protected readonly total = LOTES.length;
  protected readonly opcionesEstado: AyOpcionSelect[] = opcionesEstado();
  protected readonly opcionesManzana: AyOpcionSelect[] = opcionesManzana();

  private readonly visibles = computed(() => filtrarLotes(this.filtro()));
  protected readonly idsVisibles = computed<ReadonlySet<string>>(() => new Set(this.visibles().map((lote) => lote.id)));
  protected readonly ramas = computed(() => ramasDeLista(this.visibles()));
  protected readonly elegido = computed(() => {
    const id = this.seleccionado();
    return id !== null && this.idsVisibles().has(id) ? id : null;
  });
  protected readonly loteElegido = computed(() => loteDe(this.elegido()));
  protected readonly aviso = computed(() => (this.vista() === '2d' ? avisoDe2D(this.motivo()) : null));
  protected readonly textoVista = computed(() => {
    if (this.vista() === '3d') return 'Ver en 2D';
    return this.motivo() === 'error' ? 'Reintentar el 3D' : 'Ver en 3D';
  });

  protected filtrarEstado(valor: string): void {
    if (esFiltroEstado(valor)) this.filtro.update((actual) => ({ ...actual, estado: valor }));
  }

  protected filtrarManzana(valor: string): void {
    if (!esFiltroManzana(valor)) return;
    this.filtro.update((actual) => ({ ...actual, manzana: valor }));
    if (valor !== TODAS) this.abrirManzana(valor);
  }

  /** Elegir un lote lo trae a la vista en la lista: su manzana se abre si estaba plegada. */
  protected elegir(id: string): void {
    const lote = loteDe(id);
    if (!lote) return;
    this.seleccionado.set(id);
    this.abrirManzana(lote.manzana);
  }

  /** En la lista, activar una manzana la abre o la pliega (no hay «manzana elegida»). */
  protected activarEnLista(id: string): void {
    if (manzanaDeId(id) === null) {
      this.elegir(id);
      return;
    }
    this.abiertas.update((lista) => (lista.includes(id) ? lista.filter((otra) => otra !== id) : [...lista, id]));
  }

  protected fallo3D(): void {
    this.vista.set('2d');
    this.motivo.set('error');
  }

  protected cambiarVista(): void {
    if (this.vista() === '3d') {
      this.vista.set('2d');
      this.motivo.set('eleccion');
    } else {
      this.vista.set('3d');
      this.motivo.set(null);
    }
  }

  private abrirManzana(manzana: string): void {
    const id = idDeManzana(manzana);
    this.abiertas.update((lista) => (lista.includes(id) ? lista : [...lista, id]));
  }
}
