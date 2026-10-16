import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { AyButton, AyOtpInput, AyPhoneInput } from '@aybarcorp/ui-angular';
import { Icono } from '../../icono';
import { MarcaAcceso, usarCuentaAtras, usarEnfocar, usarEnvioDemo } from '../comun';
import { errorDeCelular, errorDeCodigo, minutosYSegundos } from '../validacion';

/** El código que «llega» en la maqueta: se ve en el celular dibujado, no es secreto de nada. */
const CODIGO_DEMO = '482913';

/**
 * Celular: el número y después un código de seis cifras. Dos pasos de la misma pantalla:
 * Phone Input (Perú, +51) y, al «enviar», el Otp Input con su reenvío temporizado. El
 * celular dibujado a la izquierda recibe el SMS de la maqueta. Ninguno inicia sesión.
 */
@Component({
  selector: 'gl-ingreso-celular',
  imports: [AyButton, AyOtpInput, AyPhoneInput, Icono, MarcaAcceso, NgTemplateOutlet],
  host: { class: 'gl-acceso gl-celular' },
  template: `
    <div class="gl-celular__ilustracion" aria-hidden="true">
      <div class="gl-telefono">
        <span class="gl-telefono__isla"></span>
        <div class="gl-telefono__pantalla">
          <p class="gl-telefono__hora">09:41</p>
          @if (paso() === 'codigo') {
            <div class="gl-telefono__sms">
              <p class="gl-telefono__remitente">Aybar · ahora</p>
              <p class="gl-telefono__mensaje">Tu código de ingreso es {{ codigoVisible }}. Vence en 5 minutos. Nadie de Aybar te lo pedirá.</p>
            </div>
          }
        </div>
      </div>
    </div>
    <ng-template #contenido>
      <div class="gl-celular__panel">
        <gl-marca-acceso />
        @if (paso() === 'numero') {
          <div class="gl-celular__cabecera">
            <h1 class="gl-acceso__titulo">Ingresa con tu celular</h1>
            <p class="gl-acceso__texto">Te enviaremos un código por SMS. No hace falta contraseña.</p>
          </div>
          <form class="gl-form" novalidate aria-label="Pedir el código" (submit)="pedirCodigo($event)">
            <ay-phone-input etiqueta="Celular" [error]="errorNumero()" [(valor)]="numero" />
            <ay-button tipo="submit" bloque [cargando]="envio.enviando()">Enviarme el código</ay-button>
          </form>
        } @else {
          <div class="gl-celular__cabecera">
            <h1 class="gl-acceso__titulo">Escribe el código</h1>
            <p class="gl-acceso__texto">
              Lo enviamos al <strong class="gl-sin-corte">+51 {{ numeroVisible() }}</strong>. Puedes pegarlo entero.
            </p>
          </div>
          <form class="gl-form" novalidate aria-label="Verificar el código" (submit)="verificar($event)">
            <ay-otp-input etiqueta="Código de 6 cifras" [longitud]="6" [error]="errorCodigo()" [(valor)]="codigo" (completado)="verificar()" />
            <ay-button tipo="submit" bloque [cargando]="envio.enviando()">Verificar e ingresar</ay-button>
          </form>
          <div class="gl-acceso__secundarias">
            <ay-button variante="ghost" tamano="sm" [disabled]="espera.restante() > 0" (click)="reenviar()">
              {{ espera.restante() > 0 ? 'Reenviar en ' + tiempo() : 'Reenviar el código' }}
            </ay-button>
            <ay-button variante="ghost" tamano="sm" (click)="cambiarNumero()">
              <gl-icono ayIconoInicio nombre="celular" />
              Cambiar el número
            </ay-button>
          </div>
        }
      </div>
    </ng-template>
    @if (incrustada()) {
      <div class="gl-celular__lado"><ng-container [ngTemplateOutlet]="contenido" /></div>
    } @else {
      <main class="gl-celular__lado"><ng-container [ngTemplateOutlet]="contenido" /></main>
    }
  `,
})
export class IngresoCelular {
  readonly incrustada = input(false);
  protected readonly envio = usarEnvioDemo();
  protected readonly espera = usarCuentaAtras();
  protected readonly paso = signal<'numero' | 'codigo'>('numero');
  protected readonly numero = signal('');
  protected readonly codigo = signal('');
  protected readonly errorNumero = signal<string | undefined>(undefined);
  protected readonly errorCodigo = signal<string | undefined>(undefined);
  protected readonly codigoVisible = `${CODIGO_DEMO.slice(0, 3)} ${CODIGO_DEMO.slice(3)}`;
  protected readonly tiempo = computed(() => minutosYSegundos(this.espera.restante()));
  protected readonly numeroVisible = computed(() => {
    const cifras = this.numero().replace(/\D/g, '');
    return `${cifras.slice(0, 3)} ${cifras.slice(3, 6)} ${cifras.slice(6)}`.trim();
  });

  private readonly enfocar = usarEnfocar();

  protected pedirCodigo(evento: Event): void {
    evento.preventDefault();
    const error = errorDeCelular(this.numero());
    this.errorNumero.set(error);
    if (error) return;
    this.envio.enviar(() => {
      this.paso.set('codigo');
      this.espera.iniciar(30);
      this.enfocar('.ay-otp__cell');
    });
  }

  protected verificar(evento?: Event): void {
    evento?.preventDefault();
    const error = errorDeCodigo(this.codigo());
    this.errorCodigo.set(error);
    if (!error) this.envio.enviar();
  }

  protected reenviar(): void {
    this.espera.iniciar(30);
    this.envio.avisar('Demo: enviamos otra vez el código (el mismo de la maqueta).');
  }

  protected cambiarNumero(): void {
    this.paso.set('numero');
    this.codigo.set('');
    this.errorCodigo.set(undefined);
    this.espera.detener();
    this.enfocar('input');
  }
}
