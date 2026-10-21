import { NgComponentOutlet } from '@angular/common';
import { Component, DestroyRef, Directive, ElementRef, afterNextRender, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AyCard, AyCardBody, AyCardHeader, AySkipLink } from '@aybarcorp/ui-angular';
import { BotonTema } from '../../pantallas/boton-tema';
import { RAIZ_GALERIA, VARIANTES_INGRESO } from '../navegacion';
import { MarcaAcceso } from './comun';
import { VISTAS_INGRESO } from './vistas';

/** Ancho y alto a los que se pinta cada maqueta antes de escalarla a su tarjeta. */
const LIENZO = { ancho: 1280, alto: 800 };

/**
 * Escala el lienzo de una miniatura al ancho de su marco: la maqueta se pinta a 1280 × 800
 * y se reduce entera, como una captura viva. Se vuelve a medir si el marco cambia de ancho.
 */
@Directive({ selector: '[glEscalar]' })
export class Escalar {
  constructor() {
    const marco: HTMLElement = inject(ElementRef).nativeElement;
    const destruccion = inject(DestroyRef);
    afterNextRender(() => {
      const medir = () => marco.style.setProperty('--gl-escala', String(marco.clientWidth / LIENZO.ancho));
      medir();
      const observador = new ResizeObserver(medir);
      observador.observe(marco);
      destruccion.onDestroy(() => observador.disconnect());
    });
  }
}

/**
 * /demo/ingreso: las once maquetas de ingreso en tarjetas, cada una con su miniatura viva
 * —la pantalla de verdad, pintada a 1280 × 800 y escalada— fuera del árbol de accesibilidad
 * y del orden de foco (`inert`). Es pública, sin el marco de la galería: arriba solo la
 * marca, la vuelta a la galería y el tema.
 */
@Component({
  selector: 'gl-indice-ingreso',
  imports: [AyCard, AyCardBody, AyCardHeader, AySkipLink, BotonTema, Escalar, MarcaAcceso, NgComponentOutlet, RouterLink],
  host: { class: 'gl-indice-ingreso' },
  template: `
    <ay-skip-link [destinos]="destinos" />
    <header class="gl-cabecera-publica">
      <a class="gl-cabecera-publica__marca" [routerLink]="raiz">
        <gl-marca-acceso producto="Galería" />
        <span class="ay-visually-hidden">: portada de la galería de demostración</span>
      </a>
      <div class="gl-cabecera-publica__acciones">
        <a class="gl-accion gl-accion--secundaria gl-accion--sm" [routerLink]="raiz">Ir a la galería</a>
        <app-boton-tema />
      </div>
    </header>
    <main id="contenido" class="gl-indice-ingreso__principal" tabindex="-1">
      <div class="gl-cabecera gl-indice-ingreso__cabecera">
        <p class="gl-sobretitulo"><span class="gl-sobretitulo__punto" aria-hidden="true"></span>Pantallas · públicas</p>
        <h1 class="gl-titulo">Once pantallas de ingreso, distintas entre sí</h1>
        <p class="gl-texto">
          Del clásico partido al enlace mágico, el celular, el inicio único o la cuenta bloqueada. Todas con los componentes
          del sistema de diseño y validación real por campo. Ninguna inicia sesión: son maquetas para copiar.
        </p>
      </div>
      <ul class="gl-miniaturas">
        @for (v of variantes; track v.id; let i = $index) {
          <li class="gl-miniaturas__item">
            <ay-card variante="interactive" [href]="raiz + '/ingreso/' + v.id">
              <div class="gl-miniatura" glEscalar aria-hidden="true" inert>
                <div class="gl-miniatura__lienzo">
                  <ng-container [ngComponentOutlet]="vista(v.id)" [ngComponentOutletInputs]="incrustada" />
                </div>
              </div>
              <ay-card-header [titulo]="v.titulo" nivel="h2" [subtitulo]="v.resumen" [idTitulo]="'gl-variante-' + v.id" />
              <ay-card-body>
                <span class="gl-miniaturas__numero">{{ i + 1 < 10 ? '0' + (i + 1) : i + 1 }}</span>
              </ay-card-body>
            </ay-card>
          </li>
        }
      </ul>
    </main>
  `,
})
export class IndiceIngreso {
  protected readonly raiz = RAIZ_GALERIA;
  protected readonly destinos = [{ id: 'contenido', etiqueta: 'Saltar al contenido' }];
  protected readonly variantes = VARIANTES_INGRESO;
  protected readonly incrustada = { incrustada: true };

  protected vista(id: string) {
    return VISTAS_INGRESO[id] ?? null;
  }
}
