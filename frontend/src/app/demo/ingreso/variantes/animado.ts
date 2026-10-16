import { Component, computed, input, signal } from '@angular/core';
import { AyLoginForm } from '@aybarcorp/ui-angular';
import { Icono } from '../../icono';
import { prefiereMenosMovimiento } from '../../utiles';
import { MarcaAcceso, usarEnvioDemo } from '../comun';

/**
 * Animado: el Login Form sobre un fondo SVG que se mueve despacio —ondas y luces con los
 * colores de la paleta activa—, con un botón para pausarlo (WCAG 2.2.2: lo que se mueve
 * más de cinco segundos se puede detener). Con movimiento reducido el fondo está quieto y
 * el botón lo dice. Las duraciones salen de --aybar-motion-*.
 */
@Component({
  selector: 'gl-ingreso-animado',
  imports: [AyLoginForm, Icono, MarcaAcceso],
  host: {
    class: 'gl-acceso gl-animado',
    '[attr.data-pausado]': 'detenido() ? "" : null',
  },
  template: `
    <svg class="gl-animado__fondo" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <circle class="gl-animado__luz gl-animado__luz--a" cx="300" cy="220" r="260" />
      <circle class="gl-animado__luz gl-animado__luz--b" cx="1180" cy="640" r="300" />
      <circle class="gl-animado__luz gl-animado__luz--c" cx="900" cy="180" r="180" />
      <g class="gl-animado__ondas">
        <path class="gl-animado__onda gl-animado__onda--a" d="M0 640 C 240 580 480 700 720 640 S 1200 580 1440 640 S 1920 700 2160 640 S 2640 580 2880 640 V 900 H 0 Z" />
        <path class="gl-animado__onda gl-animado__onda--b" d="M0 700 C 240 760 480 650 720 700 S 1200 760 1440 700 S 1920 650 2160 700 S 2640 760 2880 700 V 900 H 0 Z" />
        <path class="gl-animado__onda gl-animado__onda--c" d="M0 770 C 240 730 480 810 720 770 S 1200 730 1440 770 S 1920 810 2160 770 S 2640 730 2880 770 V 900 H 0 Z" />
      </g>
    </svg>
    <header class="gl-animado__cabecera">
      <gl-marca-acceso producto="Portal" />
      @if (!incrustada()) {
        <button
          type="button"
          class="gl-accion gl-accion--vidrio gl-accion--sm"
          [attr.aria-pressed]="detenido()"
          [disabled]="reducido"
          (click)="pausado.set(!pausado())"
        >
          <gl-icono [nombre]="detenido() ? 'reproducir' : 'pausa'" />
          {{ reducido ? 'Quieto: pediste menos movimiento' : 'Pausar la animación' }}
        </button>
      }
    </header>
    <div class="gl-animado__centro">
      <ay-login-form
        [como]="incrustada() ? 'div' : 'main'"
        titulo="Bienvenido a Aybar"
        etiquetaIdentificador="Correo"
        tipoIdentificador="email"
        hrefRecuperar="/demo/ingreso/recuperar"
        [enviando]="envio.enviando()"
        (acceder)="envio.enviar()"
      />
    </div>
  `,
})
export class IngresoAnimado {
  readonly incrustada = input(false);
  protected readonly envio = usarEnvioDemo();
  protected readonly reducido = prefiereMenosMovimiento();
  protected readonly pausado = signal(false);
  /** Quieto si se pausa, si se pidió menos movimiento o en una miniatura del índice. */
  protected readonly detenido = computed(() => this.pausado() || this.reducido || this.incrustada());
}
