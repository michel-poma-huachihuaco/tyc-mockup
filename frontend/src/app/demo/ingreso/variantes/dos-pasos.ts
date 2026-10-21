import { NgTemplateOutlet } from '@angular/common';
import { Component, input, signal } from '@angular/core';
import { AyButton, AyCheckbox, AyFormField, AyInput, AyOtpInput } from '@aybarcorp/ui-angular';
import { Icono } from '../../icono';
import { MarcaAcceso, usarEnfocar, usarEnvioDemo, usarFocoEnError } from '../comun';
import { errorDeCodigo, errorDeCodigoRecuperacion } from '../validacion';

/**
 * Dos pasos (2FA): el código de seis cifras de la app autenticadora, con «Confiar en este
 * equipo», y la alternativa de un código de recuperación (DEMO-XXXX-XXXX, los de la cuenta
 * de la galería). Cambiar de vía mueve el foco al campo nuevo.
 */
@Component({
  selector: 'gl-ingreso-dos-pasos',
  imports: [AyButton, AyCheckbox, AyFormField, AyInput, AyOtpInput, Icono, MarcaAcceso, NgTemplateOutlet],
  host: { class: 'gl-acceso gl-dos-pasos' },
  template: `
    <ng-template #contenido>
      <div class="gl-dos-pasos__tarjeta gl-superficie">
        <div class="gl-dos-pasos__cabecera">
          <gl-marca-acceso />
          <span class="gl-dos-pasos__paso">Paso 2 de 2</span>
        </div>
        <span class="gl-dos-pasos__sello" aria-hidden="true"><gl-icono nombre="admin" /></span>
        @if (via() === 'app') {
          <h1 class="gl-acceso__titulo">Verificación en dos pasos</h1>
          <p class="gl-acceso__texto">
            Abre tu app autenticadora y escribe el código de seis cifras de
            <strong class="gl-sin-corte">admin&#64;ejemplo.test</strong>.
          </p>
          <form class="gl-form" novalidate aria-label="Verificar con la app" (submit)="verificar($event)">
            <ay-otp-input etiqueta="Código de la app autenticadora" [longitud]="6" [error]="error()" [(valor)]="codigo" (completado)="verificar()" />
            <ay-checkbox [(marcado)]="confiar" ayuda="No te lo pediremos en este navegador durante 30 días.">
              Confiar en este equipo
            </ay-checkbox>
            <ay-button tipo="submit" bloque [cargando]="envio.enviando()">Verificar</ay-button>
          </form>
          <button type="button" class="gl-enlace gl-enlace--boton" (click)="cambiar('recuperacion')">Usar un código de recuperación</button>
        } @else {
          <h1 class="gl-acceso__titulo">Usa un código de recuperación</h1>
          <p class="gl-acceso__texto">
            Son los que guardaste al activar la verificación en dos pasos. Cada uno sirve una sola vez.
          </p>
          <form class="gl-form" novalidate aria-label="Verificar con un código de recuperación" (submit)="verificarRecuperacion($event)">
            <ay-form-field etiqueta="Código de recuperación" ayuda="Con la forma DEMO-XXXX-XXXX." [error]="error()">
              <ay-input autocompletado="one-time-code" placeholder="DEMO-XXXX-XXXX" [(valor)]="recuperacion" />
            </ay-form-field>
            <ay-button tipo="submit" bloque [cargando]="envio.enviando()">Verificar</ay-button>
          </form>
          <button type="button" class="gl-enlace gl-enlace--boton" (click)="cambiar('app')">Volver al código de la app</button>
        }
      </div>
    </ng-template>
    @if (incrustada()) {
      <div class="gl-dos-pasos__centro"><ng-container [ngTemplateOutlet]="contenido" /></div>
    } @else {
      <main class="gl-dos-pasos__centro"><ng-container [ngTemplateOutlet]="contenido" /></main>
    }
  `,
})
export class IngresoDosPasos {
  readonly incrustada = input(false);
  protected readonly envio = usarEnvioDemo();
  protected readonly via = signal<'app' | 'recuperacion'>('app');
  protected readonly codigo = signal('');
  protected readonly recuperacion = signal('');
  protected readonly confiar = signal(false);
  protected readonly error = signal<string | undefined>(undefined);
  private readonly enfocar = usarEnfocar();
  private readonly enfocarError = usarFocoEnError();

  protected verificar(evento?: Event): void {
    evento?.preventDefault();
    const error = errorDeCodigo(this.codigo());
    this.error.set(error);
    if (error) this.enfocarError();
    else this.envio.enviar();
  }

  protected verificarRecuperacion(evento: Event): void {
    evento.preventDefault();
    const error = errorDeCodigoRecuperacion(this.recuperacion());
    this.error.set(error);
    if (error) this.enfocarError();
    else this.envio.enviar();
  }

  protected cambiar(via: 'app' | 'recuperacion'): void {
    this.via.set(via);
    this.error.set(undefined);
    this.enfocar('input');
  }
}
