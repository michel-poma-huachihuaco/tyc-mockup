import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  AY_EJES_APARIENCIA,
  AyAppearanceService,
  AyBadge,
  AyCard,
  AyCardBody,
  AyCardHeader,
  AyParallax,
  AyParallaxCapa,
  AyTilt,
  CATALOGO_VITRINA,
} from '@aybarcorp/ui-angular';
import type { AyEjeApariencia } from '@aybarcorp/ui-angular';
import type { AppearancePreset } from '@aybarcorp/tokens/apariencia';
import { EstadoGaleria } from '../estado';
import { Icono } from '../icono';
import type { NombreIcono } from '../icono';
import { RAIZ_GALERIA, SECCIONES, VARIANTES_INGRESO } from '../navegacion';

/** El eje en español de cada id del núcleo: `palette` → `paleta`. */
const EJE_DE: Record<string, AyEjeApariencia> = Object.fromEntries(
  Object.entries(AY_EJES_APARIENCIA).map(([eje, id]) => [id, eje as AyEjeApariencia]),
);

/**
 * /demo: la portada. Un héroe con profundidad —capas de `ayParallax` que se mueven con el
 * puntero sobre un degradado de la paleta activa— y, encima, las secciones como tarjetas
 * de vidrio que se inclinan (`ayTilt` + `superficie="glass"`). Las cifras salen del
 * catálogo de la vitrina, y los chips de combinación aplican un preset de apariencia al
 * momento, como el panel Personalizar.
 */
@Component({
  selector: 'gl-portada',
  imports: [AyBadge, AyCard, AyCardBody, AyCardHeader, AyParallax, AyParallaxCapa, AyTilt, Icono, RouterLink],
  template: `
    <div class="gl-portada">
      <section class="gl-heroe" ayParallax aria-labelledby="gl-portada-titulo">
        <div class="gl-heroe__fondo" ayParallaxCapa [profundidad]="-0.4" [decorativa]="true">
          <span class="gl-heroe__mancha gl-heroe__mancha--a"></span>
          <span class="gl-heroe__mancha gl-heroe__mancha--b"></span>
          <span class="gl-heroe__mancha gl-heroe__mancha--c"></span>
          <span class="gl-heroe__rejilla"></span>
        </div>
        <div class="gl-heroe__formas" ayParallaxCapa [profundidad]="0.5" [decorativa]="true">
          <span class="gl-heroe__anillo gl-heroe__anillo--a"></span>
          <span class="gl-heroe__anillo gl-heroe__anillo--b"></span>
          <span class="gl-heroe__punto gl-heroe__punto--a"></span>
          <span class="gl-heroe__punto gl-heroe__punto--b"></span>
        </div>

        <div class="gl-heroe__contenido" ayParallaxCapa [profundidad]="0.08">
          <p class="gl-sobretitulo">
            <span class="gl-sobretitulo__punto" aria-hidden="true"></span>
            Galería de demostración · solo en desarrollo
          </p>
          <h1 id="gl-portada-titulo" class="gl-heroe__titulo">
            El sistema de diseño Aybar, <span class="gl-heroe__resalte">pantalla por pantalla</span>
          </h1>
          <p class="gl-heroe__texto">
            Cada componente con su código, once pantallas de ingreso, el panel del usuario, la administración, la
            personalización en vivo, la profundidad y un visor 3D. Todo con datos sintéticos: nada llama a un backend.
          </p>
          <div class="gl-heroe__acciones">
            <a class="gl-accion gl-accion--primaria" [routerLink]="raiz + '/vitrina'">
              Explorar la vitrina
              <gl-icono nombre="flecha" />
            </a>
            <button type="button" class="gl-accion gl-accion--vidrio" (click)="estado.busquedaAbierta.set(true)">
              <gl-icono nombre="buscar" />
              Buscar
              <kbd class="gl-tecla">Ctrl K</kbd>
            </button>
          </div>
          <dl class="gl-cifras">
            @for (cifra of cifras; track cifra.etiqueta) {
              <div class="gl-cifras__item">
                <dt class="gl-cifras__etiqueta">{{ cifra.etiqueta }}</dt>
                <dd class="gl-cifras__valor">{{ cifra.valor }}</dd>
              </div>
            }
          </dl>
        </div>

        <div class="gl-heroe__secciones">
          <h2 id="gl-secciones-titulo" class="ay-visually-hidden">Secciones de la galería</h2>
          <ul class="gl-tarjetas" aria-labelledby="gl-secciones-titulo">
            @for (s of secciones; track s.id) {
              <li class="gl-tarjetas__item">
                <div ayTilt class="gl-tarjetas__inclinable">
                  <ay-card variante="interactive" superficie="glass" [href]="s.ruta">
                    <ay-card-header [titulo]="s.titulo" nivel="h3" [subtitulo]="s.resumen" [idTitulo]="'gl-tarjeta-' + s.id" tieneInicial>
                      <span ayInicial class="gl-tarjetas__icono"><gl-icono [nombre]="icono(s.id)" /></span>
                    </ay-card-header>
                    @if (s.soloAdmin || s.publica) {
                      <ay-card-body>
                        <span class="gl-tarjetas__insignia">
                          @if (s.soloAdmin) {
                            <ay-badge [tono]="estado.esAdmin() ? 'info' : 'warning'" size="sm">
                              {{ estado.esAdmin() ? 'Solo ADMIN' : 'Solo ADMIN · verás el 403' }}
                            </ay-badge>
                          } @else {
                            <ay-badge tono="success" size="sm">Pública · sin sesión</ay-badge>
                          }
                        </span>
                      </ay-card-body>
                    }
                  </ay-card>
                </div>
              </li>
            }
          </ul>
        </div>
      </section>

      <section class="gl-bloque gl-combinaciones" aria-labelledby="gl-combinaciones-titulo">
        <div class="gl-bloque__cabecera">
          <h2 id="gl-combinaciones-titulo" class="gl-bloque__titulo">Prueba una combinación</h2>
          <p class="gl-bloque__texto">
            Las cuatro de la marca fijan paleta, acento, grises y estilo a la vez. Todas cumplen contraste AA en claro y en
            oscuro. Para afinar eje por eje, abre Personalizar.
          </p>
        </div>
        <div class="gl-chips" role="group" aria-labelledby="gl-combinaciones-titulo">
          @for (preset of presets; track preset.id) {
            <button type="button" class="gl-chip" [attr.aria-pressed]="enUso(preset)" (click)="aplicar(preset)">
              <span class="gl-chip__muestra" [style.--gl-muestra]="muestra(preset)" aria-hidden="true"></span>
              {{ preset.label }}
            </button>
          }
          <button type="button" class="gl-chip gl-chip--accion" [attr.aria-pressed]="estado.personalizarAbierto()" (click)="estado.personalizarAbierto.set(!estado.personalizarAbierto())">
            <gl-icono nombre="personalizacion" />
            Personalizar todo
          </button>
        </div>
      </section>
    </div>
  `,
})
export class Portada {
  protected readonly estado = inject(EstadoGaleria);
  private readonly apariencia = inject(AyAppearanceService);

  protected readonly raiz = RAIZ_GALERIA;
  protected readonly secciones = SECCIONES.filter((s) => s.id !== '');
  protected readonly presets = this.apariencia.presets;

  protected readonly cifras = (() => {
    const familias = CATALOGO_VITRINA.familias;
    const componentes = familias.flatMap((f) => f.componentes);
    const casos = componentes.reduce((total, c) => total + c.grupos.reduce((n, g) => n + g.casos.length, 0), 0);
    const numero = (n: number) => new Intl.NumberFormat('es-PE').format(n);
    return [
      { etiqueta: 'Componentes', valor: numero(componentes.length) },
      { etiqueta: 'Casos de uso', valor: numero(casos) },
      { etiqueta: 'Familias', valor: numero(familias.length) },
      { etiqueta: 'Pantallas de ingreso', valor: numero(VARIANTES_INGRESO.length) },
    ];
  })();

  private readonly actual = computed(() => this.apariencia.apariencia());

  protected enUso(preset: AppearancePreset): boolean {
    const actual = this.actual() as unknown as Record<string, string>;
    return Object.entries(preset.values).every(([eje, valor]) => actual[eje] === valor);
  }

  protected aplicar(preset: AppearancePreset): void {
    for (const [id, valor] of Object.entries(preset.values)) {
      const eje = EJE_DE[id];
      if (eje && valor) this.apariencia.establecer(eje, valor as never);
    }
  }

  /** La muestra de la paleta del preset, la misma que pinta el panel de apariencia. */
  protected muestra(preset: AppearancePreset): string | null {
    const paleta = preset.values.palette;
    return this.apariencia.ejes.palette.values.find((v) => v.id === paleta)?.swatch ?? null;
  }

  protected icono(id: string): NombreIcono {
    return (id in ICONOS ? ICONOS[id as keyof typeof ICONOS] : 'vitrina') as NombreIcono;
  }
}

const ICONOS = {
  vitrina: 'vitrina',
  ingreso: 'ingreso',
  cuenta: 'cuenta',
  admin: 'admin',
  personalizacion: 'personalizacion',
  profundidad: 'profundidad',
  '3d': '3d',
  redimensionado: 'redimensionado',
  accesibilidad: 'accesibilidad',
} as const satisfies Record<string, NombreIcono>;
