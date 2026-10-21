import { Component, computed, inject } from '@angular/core';
import {
  AyAppearanceService,
  AyBadge,
  AyButton,
  AyCard,
  AyCardBody,
  AyCardFooter,
  AyCardHeader,
  AyParallax,
  AyParallaxCapa,
  AySegmentedControl,
  AyTilt,
} from '@aybarcorp/ui-angular';
import type { AySegmentoOpcion } from '@aybarcorp/ui-angular';
import { LOTES, formatoSoles } from '../datos';
import { usarMedia } from '../utiles';

/**
 * /demo/profundidad: las tres piezas de profundidad del framework en composiciones —una
 * escena con capas de paralaje y una tarjeta de vidrio delante, tarjetas que se inclinan
 * hacia el puntero y vidrio sobre una banda de color— y cuándo se apagan, con el estado
 * de cada condición en este navegador y el eje Profundidad para probar «Plano» al momento.
 */
@Component({
  selector: 'gl-profundidad',
  imports: [AyBadge, AyButton, AyCard, AyCardBody, AyCardFooter, AyCardHeader, AyParallax, AyParallaxCapa, AySegmentedControl, AyTilt],
  template: `
    <div class="gl-pagina">
      <header class="gl-cabecera">
        <p class="gl-sobretitulo"><span class="gl-sobretitulo__punto" aria-hidden="true"></span>Experiencia</p>
        <h1 class="gl-titulo">Profundidad</h1>
        <p class="gl-texto">
          ayTilt inclina hacia el puntero, ayParallax mueve capas a distinta velocidad y la superficie de vidrio deja ver
          lo de detrás sin perder contraste. Mueve el puntero sobre cada bloque.
        </p>
        <div class="gl-profundidad__eje">
          <ay-segmented-control etiqueta="Profundidad" size="sm" [opciones]="opciones" [valor]="apariencia.profundidad()" (valorChange)="elegir($event)" />
        </div>
      </header>

      <section class="gl-escena" ayParallax aria-labelledby="gl-escena-titulo">
        <div class="gl-escena__cielo" ayParallaxCapa [profundidad]="-0.8" [decorativa]="true">
          <span class="gl-escena__sol"></span>
        </div>
        <div class="gl-escena__colinas gl-escena__colinas--lejos" ayParallaxCapa [profundidad]="-0.4" [decorativa]="true"></div>
        <div class="gl-escena__colinas gl-escena__colinas--cerca" ayParallaxCapa [profundidad]="0.2" [decorativa]="true"></div>
        <div class="gl-escena__parcelas" ayParallaxCapa [profundidad]="0.5" [decorativa]="true">
          @for (i of parcelas; track i) {
            <span class="gl-escena__parcela" [attr.data-estado]="estadoDe(i)"></span>
          }
        </div>
        <div class="gl-escena__frente" ayParallaxCapa [profundidad]="0.9">
          <ay-card superficie="glass" variante="elevated">
            <ay-card-header titulo="Lote C-12 · frente al parque" nivel="h2" idTitulo="gl-escena-titulo" subtitulo="Manzana C · 200 m² · preferente">
              <span ayAcciones><ay-badge tono="success" size="sm" punto>Disponible</ay-badge></span>
            </ay-card-header>
            <ay-card-body>Vidrio delante de cuatro capas de paralaje. El texto conserva AA aunque detrás pase cualquier color.</ay-card-body>
            <ay-card-footer>
              <ay-button tamano="sm">Separar el lote</ay-button>
              <ay-button variante="ghost" tamano="sm">Ver el plano</ay-button>
            </ay-card-footer>
          </ay-card>
        </div>
      </section>

      <section class="gl-bloque" aria-labelledby="gl-inclinacion-titulo">
        <div class="gl-bloque__cabecera">
          <h2 id="gl-inclinacion-titulo" class="gl-bloque__titulo">Inclinación</h2>
          <p class="gl-bloque__texto">Hasta depth.tilt-max en cada eje y acercándose depth.elevation. Los oyentes son pasivos: los controles de dentro funcionan igual.</p>
        </div>
        <ul class="gl-inclinables">
          @for (l of destacados; track l.id) {
            <li ayTilt>
              <ay-card variante="interactive" [href]="'/demo/3d'">
                <ay-card-header [titulo]="'Lote ' + l.id" nivel="h3" [subtitulo]="l.area + ' m² · ' + l.frente + ' × ' + l.fondo + ' m'" />
                <ay-card-body>
                  <p class="gl-inclinables__precio">{{ soles(l.precio) }}</p>
                  <span class="gl-tarjetas__insignia">
                    <ay-badge size="sm" [tono]="l.preferente ? 'info' : 'neutral'">{{ l.preferente ? 'Preferente' : 'Estándar' }}</ay-badge>
                  </span>
                </ay-card-body>
              </ay-card>
            </li>
          }
        </ul>
      </section>

      <section class="gl-bloque" aria-labelledby="gl-vidrio-titulo">
        <div class="gl-bloque__cabecera">
          <h2 id="gl-vidrio-titulo" class="gl-bloque__titulo">Vidrio</h2>
          <p class="gl-bloque__texto">depth.glass-opacity (88 %) y depth.glass-blur: la opacidad medida para que el texto cumpla AA con el fondo contrario detrás.</p>
        </div>
        <div class="gl-banda">
          <div class="gl-banda__fondo" aria-hidden="true"><span></span><span></span><span></span></div>
          <div class="gl-banda__tarjetas">
            <ay-card superficie="glass">
              <ay-card-header titulo="Cuota 4 de 24" nivel="h3" subtitulo="Vence el 15 de octubre" />
              <ay-card-body>{{ soles(1240) }} · débito automático</ay-card-body>
            </ay-card>
            <ay-card superficie="glass" variante="elevated">
              <ay-card-header titulo="Contrato 318" nivel="h3" subtitulo="Firmado por las dos partes" />
              <ay-card-body>Descarga la copia firmada o compártela con tu banco.</ay-card-body>
            </ay-card>
          </div>
        </div>
      </section>

      <section class="gl-bloque" aria-labelledby="gl-apagado-titulo">
        <div class="gl-bloque__cabecera">
          <h2 id="gl-apagado-titulo" class="gl-bloque__titulo">Cuándo se apaga</h2>
          <p class="gl-bloque__texto">Sin JavaScript extra: lo decide la hoja de tokens. En este navegador, ahora mismo:</p>
        </div>
        <dl class="gl-condiciones">
          @for (c of condiciones(); track c.nombre) {
            <div class="gl-condiciones__item gl-superficie">
              <dt>{{ c.nombre }}</dt>
              <dd>
                <ay-badge size="sm" [tono]="c.activa ? 'warning' : 'success'" punto>{{ c.activa ? 'Activa: se apaga' : 'No: se ve' }}</ay-badge>
                <span class="gl-nota">{{ c.efecto }}</span>
              </dd>
            </div>
          }
        </dl>
      </section>
    </div>
  `,
})
export class PantallaProfundidad {
  protected readonly apariencia = inject(AyAppearanceService);
  private readonly reducido = usarMedia('(prefers-reduced-motion: reduce)');
  private readonly sinHover = usarMedia('(hover: none)');
  private readonly transparencia = usarMedia('(prefers-reduced-transparency: reduce)');
  private readonly forzados = usarMedia('(forced-colors: active)');

  protected readonly opciones: AySegmentoOpcion[] = this.apariencia.ejes.depth.values.map((v) => ({ valor: v.id, etiqueta: v.label }));
  protected readonly parcelas = Array.from({ length: 24 }, (_, i) => i);
  protected readonly destacados = LOTES.filter((l) => l.preferente && l.estado === 'disponible').slice(0, 3);
  protected readonly soles = formatoSoles;

  protected readonly condiciones = computed(() => [
    { nombre: 'Movimiento reducido', activa: this.reducido(), efecto: 'prefers-reduced-motion: sin inclinación, paralaje ni elevación.' },
    { nombre: 'Sin puntero que flote', activa: this.sinHover(), efecto: 'hover: none (táctil): ningún cuadro de animación.' },
    { nombre: 'Transparencia reducida', activa: this.transparencia(), efecto: 'prefers-reduced-transparency: el vidrio es opaco.' },
    { nombre: 'Colores forzados', activa: this.forzados(), efecto: 'forced-colors: todo plano y opaco.' },
    { nombre: 'Profundidad «Plano»', activa: this.apariencia.profundidad() === 'plano', efecto: 'data-depth="plano": el eje de la apariencia.' },
  ]);

  protected estadoDe(i: number): string {
    return LOTES[i * 3]?.estado ?? 'disponible';
  }

  protected elegir(valor: string): void {
    if (valor === 'profundo' || valor === 'plano') this.apariencia.establecer('profundidad', valor);
  }
}
