import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AyAlert, AyButton, AyFormField, AyInput, AyOtpInput, AyPasswordInput, AyStepper } from '@aybarcorp/ui-angular';
import type { AyStepperPaso } from '@aybarcorp/ui-angular';
import { MarcaAcceso, usarCampos, usarEnfocar, usarEnvioDemo, usarFocoEnError } from '../comun';
import { errorDeClaveNueva, errorDeCodigo, errorDeConfirmacion, errorDeCorreo, fortalezaDeClave, requisitosDeClave } from '../validacion';

type Paso = 0 | 1 | 2 | 3;

/**
 * Recuperar: tres pasos con su Stepper —pedir el enlace, confirmar con el código que llega
 * al correo y elegir una contraseña nueva— y el final, que lleva de vuelta al ingreso. Cada
 * paso mueve el foco a su título, que se anuncia.
 */
@Component({
  selector: 'gl-ingreso-recuperar',
  imports: [AyAlert, AyButton, AyFormField, AyInput, AyOtpInput, AyPasswordInput, AyStepper, MarcaAcceso, NgTemplateOutlet, RouterLink],
  host: { class: 'gl-acceso gl-recuperar' },
  template: `
    <ng-template #contenido>
      <div class="gl-recuperar__tarjeta gl-superficie">
        <gl-marca-acceso />
        <ay-stepper etiqueta="Recuperar la contraseña" size="sm" [pasos]="pasos" [actual]="pasoStepper()" />
        @switch (paso()) {
          @case (0) {
            <h1 class="gl-acceso__titulo" tabindex="-1">¿Olvidaste tu contraseña?</h1>
            <p class="gl-acceso__texto">Escribe tu correo y te enviaremos un código para elegir una nueva.</p>
            <form class="gl-form" novalidate aria-label="Pedir el código" (submit)="pedir($event)">
              <ay-form-field etiqueta="Correo" [error]="campos.errores().correo">
                <ay-input tipo="email" autocompletado="email" placeholder="nombre@ejemplo.test" [valor]="campos.valores().correo" (valorChange)="campos.escribir('correo', $event)" />
              </ay-form-field>
              <ay-button tipo="submit" bloque [cargando]="envio.enviando()">Enviarme el código</ay-button>
            </form>
          }
          @case (1) {
            <h1 class="gl-acceso__titulo" tabindex="-1">Confirma que eres tú</h1>
            <p class="gl-acceso__texto">
              Si <strong class="gl-sin-corte">{{ campos.valores().correo }}</strong> tiene una cuenta, le llegó un código de seis
              cifras. Por seguridad no decimos si existe.
            </p>
            <form class="gl-form" novalidate aria-label="Confirmar el código" (submit)="confirmar($event)">
              <ay-otp-input etiqueta="Código del correo" [longitud]="6" [error]="errorCodigo()" [(valor)]="codigo" (completado)="confirmar()" />
              <ay-button tipo="submit" bloque [cargando]="envio.enviando()">Confirmar</ay-button>
            </form>
            <button type="button" class="gl-enlace gl-enlace--boton" (click)="irA(0)">Usar otro correo</button>
          }
          @case (2) {
            <h1 class="gl-acceso__titulo" tabindex="-1">Elige una contraseña nueva</h1>
            <p class="gl-acceso__texto">Cerraremos tus otras sesiones al guardarla.</p>
            <form class="gl-form" novalidate aria-label="Guardar la contraseña" (submit)="guardar($event)">
              <ay-password-input
                etiqueta="Contraseña nueva"
                autocompletado="new-password"
                [requisitos]="requisitos()"
                [fortaleza]="fortaleza()"
                [error]="campos.errores().clave"
                [valor]="campos.valores().clave"
                (valorChange)="campos.escribir('clave', $event)"
              />
              <ay-password-input
                etiqueta="Repite la contraseña"
                autocompletado="new-password"
                [error]="campos.errores().confirmacion"
                [valor]="campos.valores().confirmacion"
                (valorChange)="campos.escribir('confirmacion', $event)"
              />
              <ay-button tipo="submit" bloque [cargando]="envio.enviando()">Guardar la contraseña</ay-button>
            </form>
          }
          @default {
            <h1 class="gl-acceso__titulo" tabindex="-1">Contraseña actualizada</h1>
            <ay-alert tono="success" anuncio="off">Ya puedes ingresar con tu contraseña nueva (en la maqueta no se guardó nada).</ay-alert>
            <a class="gl-accion gl-accion--primaria gl-accion--sm" routerLink="/demo/ingreso/partido">Volver a ingresar</a>
          }
        }
      </div>
    </ng-template>
    @if (incrustada()) {
      <div class="gl-recuperar__centro"><ng-container [ngTemplateOutlet]="contenido" /></div>
    } @else {
      <main class="gl-recuperar__centro"><ng-container [ngTemplateOutlet]="contenido" /></main>
    }
  `,
})
export class IngresoRecuperar {
  readonly incrustada = input(false);
  protected readonly envio = usarEnvioDemo();
  protected readonly campos = usarCampos(['correo', 'clave', 'confirmacion'] as const);
  protected readonly paso = signal<Paso>(0);
  protected readonly codigo = signal('');
  protected readonly errorCodigo = signal<string | undefined>(undefined);
  protected readonly pasos: AyStepperPaso[] = [
    { id: 'pedir', etiqueta: 'Pedir el código' },
    { id: 'confirmar', etiqueta: 'Confirmar' },
    { id: 'nueva', etiqueta: 'Contraseña nueva' },
  ];
  /** Al terminar, el Stepper se queda en el último paso, completo. */
  protected readonly pasoStepper = computed(() => Math.min(this.paso(), 2));
  protected readonly requisitos = computed(() => requisitosDeClave(this.campos.valores().clave));
  protected readonly fortaleza = computed(() => fortalezaDeClave(this.campos.valores().clave));
  private readonly enfocar = usarEnfocar();
  private readonly enfocarError = usarFocoEnError();

  protected pedir(evento: Event): void {
    evento.preventDefault();
    if (!this.campos.validar({ correo: errorDeCorreo })) return this.enfocarError();
    this.envio.enviar(() => this.irA(1));
  }

  protected confirmar(evento?: Event): void {
    evento?.preventDefault();
    const error = errorDeCodigo(this.codigo());
    this.errorCodigo.set(error);
    if (error) return this.enfocarError();
    this.envio.enviar(() => this.irA(2));
  }

  protected guardar(evento: Event): void {
    evento.preventDefault();
    const bien = this.campos.validar({
      clave: errorDeClaveNueva,
      confirmacion: (valor, todos) => errorDeConfirmacion(todos.clave, valor),
    });
    if (!bien) return this.enfocarError();
    this.envio.enviar(() => this.irA(3));
  }

  protected irA(paso: Paso): void {
    this.paso.set(paso);
    if (paso === 1) {
      this.codigo.set('');
      this.errorCodigo.set(undefined);
    }
    this.enfocar('h1');
  }
}
