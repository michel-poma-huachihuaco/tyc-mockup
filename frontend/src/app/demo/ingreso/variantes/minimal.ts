import { NgTemplateOutlet } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AyButton, AyFormField, AyInput, AyPasswordInput } from '@aybarcorp/ui-angular';
import { MarcaAcceso, usarCampos, usarEnvioDemo, usarFocoEnError } from '../comun';
import { errorDeClave, errorDeCorreo } from '../validacion';

/**
 * Minimal: centrado, mucho aire y solo tipografía. Sin tarjeta ni imagen: un titular grande,
 * dos campos y un botón. Valida al enviar —vacíos y formato del correo— y lleva el foco al
 * primer campo con error.
 */
@Component({
  selector: 'gl-ingreso-minimal',
  imports: [AyButton, AyFormField, AyInput, AyPasswordInput, MarcaAcceso, NgTemplateOutlet, RouterLink],
  host: { class: 'gl-acceso gl-minimal' },
  template: `
    <header class="gl-minimal__cabecera">
      <gl-marca-acceso />
    </header>
    <ng-template #contenido>
      <div class="gl-minimal__columna">
        <h1 class="gl-minimal__titulo">Hola de nuevo.</h1>
        <p class="gl-minimal__texto">Escribe tu correo y tu contraseña para continuar.</p>
        <form class="gl-minimal__form" novalidate aria-label="Ingresar" (submit)="enviar($event)">
          <ay-form-field etiqueta="Correo" [error]="campos.errores().correo">
            <ay-input
              tipo="email"
              autocompletado="username"
              placeholder="nombre@ejemplo.test"
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
          <ay-button tipo="submit" tamano="lg" bloque [cargando]="envio.enviando()">Continuar</ay-button>
        </form>
        <p class="gl-minimal__pie">
          <a class="gl-enlace" routerLink="/demo/ingreso/recuperar">No recuerdo la contraseña</a>
          <span aria-hidden="true">·</span>
          <a class="gl-enlace" routerLink="/demo/ingreso/registro">Crear una cuenta</a>
        </p>
      </div>
    </ng-template>
    @if (incrustada()) {
      <div class="gl-minimal__principal"><ng-container [ngTemplateOutlet]="contenido" /></div>
    } @else {
      <main class="gl-minimal__principal"><ng-container [ngTemplateOutlet]="contenido" /></main>
    }
  `,
})
export class IngresoMinimal {
  readonly incrustada = input(false);
  protected readonly envio = usarEnvioDemo();
  protected readonly campos = usarCampos(['correo', 'clave'] as const);
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
