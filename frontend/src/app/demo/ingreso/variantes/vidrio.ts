import { NgTemplateOutlet } from '@angular/common';
import { Component, input, signal } from '@angular/core';
import { AyButton, AyCard, AyCardBody, AyCheckbox, AyFormField, AyInput, AyParallax, AyParallaxCapa, AyPasswordInput, AyTilt } from '@aybarcorp/ui-angular';
import { MarcaAcceso, usarCampos, usarEnvioDemo, usarFocoEnError } from '../comun';
import { errorDeClave, errorDeCorreo } from '../validacion';

/**
 * Vidrio: una tarjeta `superficie="glass"` que se inclina hacia el puntero (`ayTilt`) sobre
 * un degradado de la paleta activa, con capas de paralaje detrás. La opacidad del vidrio es
 * la que el framework midió para que el texto cumpla AA con cualquier fondo; con
 * transparencia reducida, colores forzados o profundidad «Plano», el vidrio es opaco y la
 * tarjeta no se inclina.
 */
@Component({
  selector: 'gl-ingreso-vidrio',
  imports: [AyButton, AyCard, AyCardBody, AyCheckbox, AyFormField, AyInput, AyParallax, AyParallaxCapa, AyPasswordInput, AyTilt, MarcaAcceso, NgTemplateOutlet],
  host: { class: 'gl-acceso gl-vidrio' },
  template: `
    <div class="gl-vidrio__escena" ayParallax>
      <div class="gl-vidrio__degradado" ayParallaxCapa [profundidad]="-0.3" [decorativa]="true">
        <span class="gl-vidrio__orbe gl-vidrio__orbe--a"></span>
        <span class="gl-vidrio__orbe gl-vidrio__orbe--b"></span>
        <span class="gl-vidrio__orbe gl-vidrio__orbe--c"></span>
      </div>
      <div class="gl-vidrio__formas" ayParallaxCapa [profundidad]="0.6" [decorativa]="true">
        <span class="gl-vidrio__forma gl-vidrio__forma--a"></span>
        <span class="gl-vidrio__forma gl-vidrio__forma--b"></span>
      </div>
      <ng-template #contenido>
        <div class="gl-vidrio__inclinable" ayTilt>
          <ay-card superficie="glass" variante="elevated">
            <ay-card-body>
              <div class="gl-vidrio__tarjeta">
                <gl-marca-acceso producto="Clientes" />
                <div class="gl-vidrio__cabecera">
                  <h1 class="gl-vidrio__titulo">Ingresa a tu espacio</h1>
                  <p class="gl-vidrio__texto">Tus lotes, tus cuotas y tus documentos, siempre a mano.</p>
                </div>
                <form class="gl-form" novalidate aria-label="Ingresar" (submit)="enviar($event)">
                  <ay-form-field etiqueta="Correo" [error]="campos.errores().correo">
                    <ay-input
                      tipo="email"
                      autocompletado="username"
                      [soloLectura]="envio.enviando()"
                      [valor]="campos.valores().correo"
                      (valorChange)="campos.escribir('correo', $event)"
                    />
                  </ay-form-field>
                  <ay-password-input
                    etiqueta="Contraseña"
                    [error]="campos.errores().clave"
                    [valor]="campos.valores().clave"
                    (valorChange)="campos.escribir('clave', $event)"
                  />
                  <ay-checkbox [(marcado)]="recordar">Recordarme en este equipo</ay-checkbox>
                  <ay-button tipo="submit" bloque [cargando]="envio.enviando()">Ingresar</ay-button>
                </form>
              </div>
            </ay-card-body>
          </ay-card>
        </div>
      </ng-template>
      @if (incrustada()) {
        <div class="gl-vidrio__centro"><ng-container [ngTemplateOutlet]="contenido" /></div>
      } @else {
        <main class="gl-vidrio__centro"><ng-container [ngTemplateOutlet]="contenido" /></main>
      }
    </div>
  `,
})
export class IngresoVidrio {
  readonly incrustada = input(false);
  protected readonly envio = usarEnvioDemo();
  protected readonly campos = usarCampos(['correo', 'clave'] as const);
  protected readonly recordar = signal(true);
  private readonly enfocarError = usarFocoEnError();

  protected enviar(evento: Event): void {
    evento.preventDefault();
    if (!this.campos.validar({ correo: errorDeCorreo, clave: errorDeClave })) {
      this.enfocarError();
      return;
    }
    this.envio.enviar();
  }
}
