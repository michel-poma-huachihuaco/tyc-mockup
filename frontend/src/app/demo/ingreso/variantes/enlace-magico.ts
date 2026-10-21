import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { AyButton, AyFormField, AyInput } from '@aybarcorp/ui-angular';
import { Icono } from '../../icono';
import { MarcaAcceso, usarCampos, usarCuentaAtras, usarEnfocar, usarEnvioDemo, usarFocoEnError } from '../comun';
import { errorDeCorreo, minutosYSegundos } from '../validacion';

/**
 * Enlace mágico: solo el correo. Al enviarlo, la pantalla pasa a «Revisa tu correo», con
 * la dirección a la vista, el reenvío temporizado (para no inundar la bandeja) y la vuelta
 * para usar otro correo. El título del estado nuevo recibe el foco y se anuncia.
 */
@Component({
  selector: 'gl-ingreso-enlace-magico',
  imports: [AyButton, AyFormField, AyInput, Icono, MarcaAcceso, NgTemplateOutlet],
  host: { class: 'gl-acceso gl-magico' },
  template: `
    <ng-template #contenido>
      <div class="gl-magico__tarjeta gl-superficie">
        <gl-marca-acceso />
        @if (!enviado()) {
          <span class="gl-magico__sello" aria-hidden="true"><gl-icono nombre="chispa" /></span>
          <h1 class="gl-acceso__titulo">Entra sin contraseña</h1>
          <p class="gl-acceso__texto">Te enviaremos un enlace de un solo uso. Ábrelo en este dispositivo y listo.</p>
          <form class="gl-form" novalidate aria-label="Pedir el enlace" (submit)="enviar($event)">
            <ay-form-field etiqueta="Correo" ayuda="El de tu cuenta de Aybar." [error]="campos.errores().correo">
              <ay-input
                tipo="email"
                autocompletado="email"
                placeholder="nombre@ejemplo.test"
                [soloLectura]="envio.enviando()"
                [valor]="campos.valores().correo"
                (valorChange)="campos.escribir('correo', $event)"
              />
            </ay-form-field>
            <ay-button tipo="submit" bloque [cargando]="envio.enviando()">Enviarme el enlace</ay-button>
          </form>
        } @else {
          <div class="gl-magico__sobre" aria-hidden="true">
            <gl-icono nombre="correo" />
          </div>
          <h1 class="gl-acceso__titulo" tabindex="-1">Revisa tu correo</h1>
          <p class="gl-acceso__texto">
            Enviamos un enlace a <strong class="gl-sin-corte">{{ campos.valores().correo }}</strong>. Vence en 15 minutos y solo
            sirve una vez. Si no lo ves, mira en «Spam».
          </p>
          <div class="gl-acceso__secundarias gl-acceso__secundarias--columna">
            <ay-button variante="secondary" bloque [disabled]="espera.restante() > 0" (click)="reenviar()">
              {{ espera.restante() > 0 ? 'Reenviar el enlace en ' + tiempo() : 'Reenviar el enlace' }}
            </ay-button>
            <ay-button variante="ghost" bloque (click)="otroCorreo()">Usar otro correo</ay-button>
          </div>
        }
      </div>
    </ng-template>
    @if (incrustada()) {
      <div class="gl-magico__centro"><ng-container [ngTemplateOutlet]="contenido" /></div>
    } @else {
      <main class="gl-magico__centro"><ng-container [ngTemplateOutlet]="contenido" /></main>
    }
  `,
})
export class IngresoEnlaceMagico {
  readonly incrustada = input(false);
  protected readonly envio = usarEnvioDemo();
  protected readonly espera = usarCuentaAtras();
  protected readonly campos = usarCampos(['correo'] as const);
  protected readonly enviado = signal(false);
  protected readonly tiempo = computed(() => minutosYSegundos(this.espera.restante()));
  private readonly enfocar = usarEnfocar();
  private readonly enfocarError = usarFocoEnError();

  protected enviar(evento: Event): void {
    evento.preventDefault();
    if (!this.campos.validar({ correo: errorDeCorreo })) {
      this.enfocarError();
      return;
    }
    this.envio.enviar(() => {
      this.enviado.set(true);
      this.espera.iniciar(45);
      this.enfocar('h1');
    });
  }

  protected reenviar(): void {
    this.espera.iniciar(45);
    this.envio.avisar('Demo: enlace reenviado. Ningún correo sale de la galería.');
  }

  protected otroCorreo(): void {
    this.enviado.set(false);
    this.espera.detener();
    this.enfocar('input');
  }
}
