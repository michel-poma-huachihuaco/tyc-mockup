import { Component, input } from '@angular/core';
import { AyButton, AyLoginForm } from '@aybarcorp/ui-angular';
import { MarcaAcceso, curvasDeNivel, usarEnvioDemo } from '../comun';

/**
 * Partido: el clásico de pantalla partida. A la izquierda, el panel de marca con una
 * textura topográfica (curvas de nivel, por los proyectos de lotes); a la derecha, el
 * Login Form del framework en su tamaño de pantalla partida (`size="lg"`).
 */
@Component({
  selector: 'gl-ingreso-partido',
  imports: [AyButton, AyLoginForm, MarcaAcceso],
  host: { class: 'gl-acceso gl-partido' },
  template: `
    <section class="gl-partido__marca" aria-label="Aybar">
      <svg class="gl-partido__topo" viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
        @for (d of curvas; track $index) {
          <path [attr.d]="d" />
        }
      </svg>
      <gl-marca-acceso [inversa]="true" producto="Lotes" />
      <div class="gl-partido__mensaje">
        <p class="gl-partido__lema">Cada lote, cada cuota y cada cliente, en un solo lugar.</p>
        <p class="gl-partido__texto">Ingresa con tu cuenta corporativa para seguir donde lo dejaste.</p>
      </div>
      <figure class="gl-partido__cita">
        <blockquote>«Reservamos, cobramos y firmamos el mismo día, sin papeles.»</blockquote>
        <figcaption>Equipo de Ventas · Lima</figcaption>
      </figure>
    </section>
    <div class="gl-partido__lado">
      <ay-login-form
        [como]="incrustada() ? 'div' : 'main'"
        size="lg"
        titulo="Ingresa a tu cuenta"
        etiquetaIdentificador="Correo corporativo"
        tipoIdentificador="email"
        hrefRecuperar="/demo/ingreso/recuperar"
        [enviando]="envio.enviando()"
        (acceder)="envio.enviar()"
      >
        <ay-button ayProveedores variante="secondary" (click)="envio.avisar('Demo: aquí saldrías al inicio de sesión único de la empresa.')">
          Acceder con la cuenta corporativa
        </ay-button>
      </ay-login-form>
    </div>
  `,
})
export class IngresoPartido {
  /** Dentro de una miniatura del índice: sin `main` ni foco. */
  readonly incrustada = input(false);
  protected readonly envio = usarEnvioDemo();
  protected readonly curvas = curvasDeNivel();
}
