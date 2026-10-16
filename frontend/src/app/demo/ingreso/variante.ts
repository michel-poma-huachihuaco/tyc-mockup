import { NgComponentOutlet } from '@angular/common';
import { Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BotonTema } from '../../pantallas/boton-tema';
import { NOMBRE_PROYECTO } from '../../proyecto';
import { EstadoGaleria } from '../estado';
import { Icono } from '../icono';
import { RAIZ_GALERIA, VARIANTES_INGRESO, varianteIngreso, vecinasDe } from '../navegacion';
import { VISTAS_INGRESO } from './vistas';

/**
 * /demo/ingreso/:variante: una de las once maquetas a pantalla completa, sin el marco de la
 * galería, y abajo una barra flotante para volver al índice, pasar a la anterior o a la
 * siguiente y cambiar el tema. La barra va después de la maqueta en el orden del
 * documento: el primer Tab entra al formulario, como en una pantalla de ingreso de verdad.
 *
 * Es pública: son maquetas y ninguna inicia sesión.
 */
@Component({
  selector: 'gl-variante-ingreso',
  imports: [BotonTema, Icono, NgComponentOutlet, RouterLink],
  host: { class: 'gl-variante', '[class.gl-variante--embebida]': 'estado.embebido' },
  template: `
    @if (vista(); as componente) {
      <ng-container [ngComponentOutlet]="componente" />
    }
    @if (!estado.embebido) {
      <nav class="gl-barra-flotante gl-barra-flotante--abajo" aria-label="Pantallas de ingreso">
        <a class="gl-barra-flotante__volver" [routerLink]="indice">
          <gl-icono nombre="izquierda" />
          <span>Todas</span>
        </a>
        <p class="gl-barra-flotante__titulo">
          <span class="gl-barra-flotante__etiqueta">{{ variante()?.titulo }}</span>
          <span class="gl-barra-flotante__contador">{{ posicion() }} de {{ total }}</span>
        </p>
        @if (vecinas(); as v) {
          <div class="gl-barra-flotante__pasos">
            <a class="gl-boton-icono" [routerLink]="indice + '/' + v.anterior.id" [attr.aria-label]="'Anterior: ' + v.anterior.titulo">
              <gl-icono nombre="izquierda" />
            </a>
            <a class="gl-boton-icono" [routerLink]="indice + '/' + v.siguiente.id" [attr.aria-label]="'Siguiente: ' + v.siguiente.titulo">
              <gl-icono nombre="derecha" />
            </a>
          </div>
        }
        <app-boton-tema />
      </nav>
    }
  `,
})
export class PantallaVariante {
  protected readonly estado = inject(EstadoGaleria);
  private readonly parametros = toSignal(inject(ActivatedRoute).paramMap, { requireSync: true });

  protected readonly indice = `${RAIZ_GALERIA}/ingreso`;
  protected readonly total = VARIANTES_INGRESO.length;
  private readonly id = computed(() => this.parametros().get('variante') ?? '');
  protected readonly variante = computed(() => varianteIngreso(this.id()));
  protected readonly vista = computed(() => VISTAS_INGRESO[this.id()] ?? null);
  protected readonly vecinas = computed(() => vecinasDe(this.id()));
  protected readonly posicion = computed(() => VARIANTES_INGRESO.findIndex((v) => v.id === this.id()) + 1);

  constructor() {
    const titulo = inject(Title);
    effect(() => titulo.setTitle(`Ingreso · ${this.variante()?.titulo ?? ''} · Galería · ${NOMBRE_PROYECTO}`));
  }
}
