import { Component, DOCUMENT, ElementRef, ViewEncapsulation, computed, inject, signal, viewChild } from '@angular/core';
import {
  AyAlert,
  AyBadge,
  AyButton,
  AyCard,
  AyCardBody,
  AyCardHeader,
  AyEmptyState,
  AyFormField,
  AySelect,
  AyStatistic,
} from '@aybarcorp/ui-angular';
import { EstadoGaleria } from '../estado';
import { SECCIONES } from '../navegacion';
import { ETIQUETAS_WCAG, NOMBRE_IMPACTO, ORDEN_IMPACTO, analizar, analizarEnMarco, contarPorImpacto } from './axe';
import type { Impacto, ResultadoAxe, ViolacionAxe } from './axe';

/** El valor del selector que analiza la página que se está viendo. */
const AQUI = 'aqui';

type TonoBadge = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

const TONO_IMPACTO: Record<Impacto, TonoBadge> = { critical: 'danger', serious: 'warning', moderate: 'info', minor: 'neutral' };

/** Los nodos de una violación que se listan; los demás se cuentan. */
const NODOS_VISIBLES = 8;

type Estado =
  | { readonly tipo: 'inicial' }
  | { readonly tipo: 'analizando'; readonly que: string }
  | { readonly tipo: 'listo'; readonly resultado: ResultadoAxe }
  | { readonly tipo: 'error'; readonly que: string; readonly mensaje: string };

const USO_EN_PRUEBAS = `// Playwright, con ng serve y la sesión iniciada:
await page.goto('/demo/cuenta/perfil');
const { violaciones } = await page.evaluate(() => window.__aybarGaleria!.axe());
expect(violaciones.filter((v) => ['critical', 'serious'].includes(v.impacto))).toEqual([]);`;

/** «1 oct. 2026, 09:00», en es-PE. */
function cuando(iso: string): string {
  const fecha = new Date(iso);
  const dia = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short', year: 'numeric' }).format(fecha);
  return `${dia}, ${fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`;
}

/**
 * /demo/accesibilidad: analiza con axe-core (WCAG 2.2 A y AA) esta página o cualquier
 * pantalla de la galería, que se carga en un iframe de este mismo sitio y se analiza con el
 * axe de su propia ventana. axe-core llega con `import()` al pulsar «Analizar»: ninguna otra
 * pantalla lo carga. Las violaciones salen agrupadas por impacto, con la regla, sus
 * criterios de WCAG, el enlace a su explicación y los elementos afectados.
 */
@Component({
  selector: 'gl-accesibilidad',
  imports: [AyAlert, AyBadge, AyButton, AyCard, AyCardBody, AyCardHeader, AyEmptyState, AyFormField, AySelect, AyStatistic],
  encapsulation: ViewEncapsulation.None,
  styleUrl: './accesibilidad.css',
  template: `
    <div class="gl-pagina">
      <header class="gl-cabecera">
        <p class="gl-sobretitulo"><span class="gl-sobretitulo__punto" aria-hidden="true"></span>Calidad</p>
        <h1 class="gl-titulo">Accesibilidad</h1>
        <p class="gl-texto">
          axe-core revisa la pantalla con las reglas de WCAG 2.2 A y AA. Lo automático encuentra una parte de los problemas: el
          teclado, el lector de pantalla y el sentido de los textos se revisan a mano.
        </p>
      </header>

      <div class="gl-axe">
        <ay-card>
          <ay-card-body>
            <form class="gl-axe__formulario" (submit)="enviar($event)">
              <div class="gl-axe__campo">
                <ay-form-field etiqueta="Qué analizar" ayuda="Otra pantalla se carga aquí abajo, en un iframe de este mismo sitio y con tu sesión.">
                  <ay-select [opciones]="opciones()" [(valor)]="destino" />
                </ay-form-field>
              </div>
              <ay-button tipo="submit" [cargando]="analizando()">Analizar</ay-button>
            </form>
            <p class="gl-axe__estado" role="status">{{ mensaje() }}</p>
          </ay-card-body>
        </ay-card>

        @if (error(); as e) {
          <ay-alert tono="danger" [titulo]="'No se pudo analizar ' + e.que" anuncio="off">
            {{ e.mensaje }} Vuelve a pulsar «Analizar» para reintentarlo.
          </ay-alert>
        }

        @if (rutaMarco(); as ruta) {
          <section class="gl-axe__vista" aria-label="Pantalla analizada">
            <iframe #marco class="gl-axe__marco" [title]="'Pantalla analizada: ' + ruta"></iframe>
          </section>
        }

        @if (resultado(); as r) {
          <section class="gl-axe__resultado" aria-labelledby="gl-axe-resultado">
            <div class="gl-axe__cabecera">
              <h2 id="gl-axe-resultado" class="gl-axe__titulo">Resultado de <code>{{ r.ruta }}</code></h2>
              <p class="gl-axe__nota">{{ cuando(r.fecha) }} · axe-core {{ r.version }}</p>
            </div>
            <div class="gl-axe__cifras">
              @for (i of impactos; track i) {
                <ay-statistic size="sm" [etiqueta]="nombre[i].varios" [valor]="cuentas()[i]" />
              }
              <ay-statistic size="sm" etiqueta="Reglas que pasan" [valor]="r.reglasQuePasan" />
              <ay-statistic size="sm" etiqueta="Para revisar a mano" [valor]="r.incompletas" />
            </div>
            @if (r.violaciones.length === 0) {
              <ay-empty-state
                size="compact"
                variante="no-results"
                titulo="Sin violaciones de WCAG 2.2 A y AA"
                [descripcion]="'axe-core no encontró nada en ' + r.ruta + '. Recórrela igual con el teclado y con un lector de pantalla: lo automático no lo ve todo.'"
              />
            } @else {
              @for (i of impactos; track i) {
                @if (cuentas()[i] > 0) {
                  <section class="gl-axe__grupo" [attr.aria-labelledby]="'gl-axe-' + i">
                    <h3 [id]="'gl-axe-' + i" class="gl-axe__grupo-titulo">
                      {{ nombre[i].varios }}
                      <ay-badge [tono]="tono[i]" size="sm">{{ cuentas()[i] }}</ay-badge>
                    </h3>
                    <ul class="gl-axe__lista">
                      @for (v of de(r, i); track v.id) {
                        <li>
                          <ay-card>
                            <ay-card-header nivel="h4" [titulo]="v.ayuda" [subtitulo]="subtitulo(v)">
                              <span ayAcciones><ay-badge [tono]="tono[v.impacto]" size="sm">{{ nombre[v.impacto].uno }}</ay-badge></span>
                            </ay-card-header>
                            <ay-card-body>
                              <div class="gl-axe__violacion">
                                <p class="gl-axe__descripcion">{{ v.descripcion }}</p>
                                <a class="gl-axe__enlace" [href]="v.enlace" target="_blank" rel="noreferrer">
                                  Qué pide la regla {{ v.id }}<span class="ay-visually-hidden"> (en Deque University, se abre en otra pestaña)</span>
                                </a>
                                <details class="gl-axe__nodos">
                                  <summary>{{ v.nodos.length === 1 ? 'Un elemento afectado' : v.nodos.length + ' elementos afectados' }}</summary>
                                  <ol class="gl-axe__lista-nodos">
                                    @for (nodo of visibles(v); track $index) {
                                      <li class="gl-axe__nodo">
                                        <code class="gl-axe__selector">{{ nodo.selector }}</code>
                                        <pre class="gl-axe__html">{{ nodo.html }}</pre>
                                        @if (nodo.resumen) {
                                          <p class="gl-axe__resumen">{{ nodo.resumen }}</p>
                                        }
                                      </li>
                                    }
                                  </ol>
                                  @if (v.nodos.length > maximoNodos) {
                                    <p class="gl-axe__nota">
                                      Y {{ v.nodos.length - maximoNodos === 1 ? 'otro elemento' : v.nodos.length - maximoNodos + ' elementos más' }} con el mismo problema.
                                    </p>
                                  }
                                </details>
                              </div>
                            </ay-card-body>
                          </ay-card>
                        </li>
                      }
                    </ul>
                  </section>
                }
              }
            }
          </section>
        }

        @if (estado().tipo === 'inicial') {
          <ay-empty-state
            size="compact"
            variante="first-use"
            titulo="Todavía no hay análisis"
            descripcion="Elige esta página u otra pantalla de la galería y pulsa «Analizar». axe-core se descarga en ese momento, no antes."
          />
        }

        <ay-card>
          <ay-card-header nivel="h2" titulo="Desde las pruebas" subtitulo="La galería deja window.__aybarGaleria.axe() en cuanto se monta, solo con ng serve." />
          <ay-card-body>
            <pre class="gl-axe__codigo"><code>{{ usoEnPruebas }}</code></pre>
            <p class="gl-axe__nota">
              Acepta las opciones de <code>axe.run</code> (por ejemplo, <code>{{ ejemploOpciones }}</code>); sin ellas, analiza con
              {{ etiquetasWcag }}. Devuelve JSON plano.
            </p>
          </ay-card-body>
        </ay-card>
      </div>
    </div>
  `,
})
export class PantallaAccesibilidad {
  private readonly galeria = inject(EstadoGaleria);
  private readonly documento = inject(DOCUMENT);
  private readonly marco = viewChild<ElementRef<HTMLIFrameElement>>('marco');

  protected readonly impactos = ORDEN_IMPACTO;
  protected readonly nombre = NOMBRE_IMPACTO;
  protected readonly tono = TONO_IMPACTO;
  protected readonly maximoNodos = NODOS_VISIBLES;
  protected readonly usoEnPruebas = USO_EN_PRUEBAS;
  protected readonly ejemploOpciones = "{ runOnly: ['wcag2aa'] }";
  protected readonly etiquetasWcag = ETIQUETAS_WCAG.join(', ');
  protected readonly cuando = cuando;

  protected readonly destino = signal(AQUI);
  protected readonly estado = signal<Estado>({ tipo: 'inicial' });
  protected readonly rutaMarco = signal<string | null>(null);

  protected readonly opciones = computed(() => [
    { value: AQUI, label: 'Esta página' },
    ...SECCIONES.filter((s) => this.galeria.esAdmin() || !s.soloAdmin).map((s) => ({ value: s.ruta, label: `${s.titulo} · ${s.ruta}` })),
  ]);
  protected readonly analizando = computed(() => this.estado().tipo === 'analizando');
  protected readonly resultado = computed(() => {
    const e = this.estado();
    return e.tipo === 'listo' ? e.resultado : null;
  });
  protected readonly error = computed(() => {
    const e = this.estado();
    return e.tipo === 'error' ? e : null;
  });
  protected readonly cuentas = computed(() => contarPorImpacto(this.resultado()?.violaciones ?? []));
  protected readonly mensaje = computed(() => {
    const e = this.estado();
    switch (e.tipo) {
      case 'inicial':
        return '';
      case 'analizando':
        return `Analizando ${e.que}…`;
      case 'error':
        return `El análisis de ${e.que} falló.`;
      case 'listo': {
        const n = e.resultado.violaciones.length;
        return `Análisis de ${e.resultado.ruta} listo: ${n === 0 ? 'sin violaciones' : n === 1 ? 'una violación' : `${n} violaciones`}.`;
      }
    }
  });

  protected async enviar(evento: Event): Promise<void> {
    evento.preventDefault();
    if (this.analizando()) return;
    const destino = this.destino();
    const que = destino === AQUI ? 'esta página' : destino;
    this.estado.set({ tipo: 'analizando', que });
    try {
      let resultado: ResultadoAxe;
      if (destino === AQUI) {
        resultado = await analizar(this.documento);
      } else {
        this.rutaMarco.set(destino);
        resultado = await analizarEnMarco(await this.elMarco(), destino);
      }
      this.estado.set({ tipo: 'listo', resultado });
    } catch (error) {
      this.estado.set({ tipo: 'error', que, mensaje: error instanceof Error ? error.message : String(error) });
    }
  }

  protected de(resultado: ResultadoAxe, impacto: Impacto): readonly ViolacionAxe[] {
    return resultado.violaciones.filter((v) => v.impacto === impacto);
  }

  protected subtitulo(v: ViolacionAxe): string {
    return [v.id, ...v.criterios.map((c) => `WCAG ${c}`)].join(' · ');
  }

  protected visibles(v: ViolacionAxe): ViolacionAxe['nodos'] {
    return v.nodos.slice(0, NODOS_VISIBLES);
  }

  /** El iframe recién pintado: Angular lo crea tras `rutaMarco.set`, un cuadro después. */
  private async elMarco(): Promise<HTMLIFrameElement> {
    for (let intento = 0; intento < 60 && !this.marco(); intento++) {
      await new Promise((listo) => requestAnimationFrame(listo));
    }
    const marco = this.marco()?.nativeElement;
    if (!marco) throw new Error('El iframe de la pantalla analizada no llegó a montarse.');
    return marco;
  }
}
