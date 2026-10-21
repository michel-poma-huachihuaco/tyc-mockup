import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AyAlert, AyButton, AyCheckbox, AyFormField, AyInput, AyPasswordInput } from '@aybarcorp/ui-angular';
import { Icono } from '../../icono';
import { MarcaAcceso, usarCampos, usarEnfocar, usarEnvioDemo, usarFocoEnError } from '../comun';
import {
  errorDeClaveNueva,
  errorDeConfirmacion,
  errorDeCorreo,
  errorDeNombre,
  fortalezaDeClave,
  requisitosDeClave,
} from '../validacion';

/**
 * Registro: el alta con nombre, correo y una contraseña nueva con sus requisitos a la vista
 * antes de escribir y su fuerza en texto (el color solo no basta), su confirmación y los
 * términos. Al crear la cuenta, el estado «revisa tu correo» de la maqueta.
 */
@Component({
  selector: 'gl-ingreso-registro',
  imports: [AyAlert, AyButton, AyCheckbox, AyFormField, AyInput, AyPasswordInput, Icono, MarcaAcceso, NgTemplateOutlet, RouterLink],
  host: { class: 'gl-acceso gl-registro' },
  template: `
    <aside class="gl-registro__lado" aria-label="Por qué crear una cuenta">
      <gl-marca-acceso [inversa]="true" />
      <h2 class="gl-registro__lema">Tu proyecto, desde la reserva hasta la última cuota.</h2>
      <ul class="gl-registro__ventajas">
        @for (v of ventajas; track v) {
          <li><gl-icono nombre="chispa" />{{ v }}</li>
        }
      </ul>
    </aside>
    <ng-template #contenido>
      <div class="gl-registro__columna">
        @if (!creada()) {
          <h1 class="gl-acceso__titulo">Crea tu cuenta</h1>
          <p class="gl-acceso__texto">
            ¿Ya tienes una? <a class="gl-enlace" routerLink="/demo/ingreso/partido">Ingresa</a>
          </p>
          <form class="gl-form" novalidate aria-label="Crear la cuenta" (submit)="crear($event)">
            <ay-form-field etiqueta="Nombre y apellido" [error]="campos.errores().nombre">
              <ay-input autocompletado="name" [valor]="campos.valores().nombre" (valorChange)="campos.escribir('nombre', $event)" />
            </ay-form-field>
            <ay-form-field etiqueta="Correo" [error]="campos.errores().correo">
              <ay-input tipo="email" autocompletado="email" placeholder="nombre@ejemplo.test" [valor]="campos.valores().correo" (valorChange)="campos.escribir('correo', $event)" />
            </ay-form-field>
            <ay-password-input
              etiqueta="Contraseña"
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
            <ay-checkbox [invalido]="!!errorTerminos()" [ayuda]="errorTerminos()" [marcado]="terminos()" (marcadoChange)="terminos.set($event); errorTerminos.set(undefined)">
              Acepto los términos de uso y la política de privacidad
            </ay-checkbox>
            <ay-button tipo="submit" bloque tamano="lg" [cargando]="envio.enviando()">Crear la cuenta</ay-button>
          </form>
        } @else {
          <h1 class="gl-acceso__titulo" tabindex="-1">Revisa tu correo</h1>
          <ay-alert tono="success" titulo="Cuenta creada en la maqueta" anuncio="off">
            En una aplicación real llegaría un correo a {{ campos.valores().correo }} para activarla. Aquí nada sale del
            navegador.
          </ay-alert>
          <a class="gl-accion gl-accion--secundaria gl-accion--sm" routerLink="/demo/ingreso/partido">Ir a ingresar</a>
        }
      </div>
    </ng-template>
    @if (incrustada()) {
      <div class="gl-registro__principal"><ng-container [ngTemplateOutlet]="contenido" /></div>
    } @else {
      <main class="gl-registro__principal"><ng-container [ngTemplateOutlet]="contenido" /></main>
    }
  `,
})
export class IngresoRegistro {
  readonly incrustada = input(false);
  protected readonly envio = usarEnvioDemo();
  protected readonly campos = usarCampos(['nombre', 'correo', 'clave', 'confirmacion'] as const);
  protected readonly terminos = signal(false);
  protected readonly errorTerminos = signal<string | undefined>(undefined);
  protected readonly creada = signal(false);
  protected readonly requisitos = computed(() => requisitosDeClave(this.campos.valores().clave));
  protected readonly fortaleza = computed(() => fortalezaDeClave(this.campos.valores().clave));
  protected readonly ventajas = [
    'Sigue tus lotes y su estado en tiempo real',
    'Paga tus cuotas y descarga tus comprobantes',
    'Firma tus documentos sin ir a la oficina',
  ];
  private readonly enfocar = usarEnfocar();
  private readonly enfocarError = usarFocoEnError();

  protected crear(evento: Event): void {
    evento.preventDefault();
    const camposBien = this.campos.validar({
      nombre: errorDeNombre,
      correo: errorDeCorreo,
      clave: errorDeClaveNueva,
      confirmacion: (valor, todos) => errorDeConfirmacion(todos.clave, valor),
    });
    this.errorTerminos.set(this.terminos() ? undefined : 'Para crear la cuenta, acepta los términos.');
    if (!camposBien || !this.terminos()) {
      this.enfocarError();
      return;
    }
    this.envio.enviar(() => {
      this.creada.set(true);
      this.enfocar('h1');
    });
  }
}
