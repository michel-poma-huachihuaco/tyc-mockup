import { Component, computed, inject } from '@angular/core';
// aybar:demo:inicio
import { RouterLink } from '@angular/router';
// aybar:demo:fin
import { AyContainer, AyGrid, AyStack } from '@aybarcorp/ui-angular';
// aybar:demo:inicio
import { AyCard, AyCardBody, AyCardHeader } from '@aybarcorp/ui-angular';
// aybar:demo:fin
import { Acceso } from '../acceso';
// aybar:demo:inicio
import { ENLACES_GALERIA } from '../galeria';
// aybar:demo:fin
import { CON_BACKEND } from '../proyecto';
import { esSesionDemo } from '../sesion';
import { Marco } from './marco';
import { SeccionBackend } from './seccion-backend';
import { TarjetaSesion } from './tarjeta-sesion';

/**
 * El inicio con sesión: quién entró y el backend si el proyecto lo tiene. Sustitúyelo por las pantallas del proyecto.
 */
@Component({
  selector: 'app-inicio',
  imports: [
    AyContainer,
    AyGrid,
    AyStack,
    Marco,
    SeccionBackend,
    TarjetaSesion,
    // aybar:demo:inicio
    AyCard,
    AyCardBody,
    AyCardHeader,
    RouterLink,
    // aybar:demo:fin
  ],
  template: `
    <app-marco>
      <ay-container size="page">
        <div ayStack gap="12">
          <div ayGrid [columnas]="2" gap="lg">
            @if (acceso.sesion(); as sesion) {
              <app-tarjeta-sesion [sesion]="sesion" />
            }
            @if (conBackend) {
              <app-seccion-backend [demo]="demo()" />
            }
            <!-- aybar:demo:inicio — la galería de demostración (/demo): la vitrina y el resto de ejemplos.
                 Solo con ng serve: en producción ENLACES_GALERIA es null y no se pinta. -->
            @if (galeria; as enlaces) {
              <ay-card variante="interactive">
                <ay-card-header nivel="h2" subtitulo="Solo en desarrollo · npm run demo:quitar la borra" tieneInicial>
                  <svg ayInicial width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                    <path d="M12 3 3 8l9 5 9-5-9-5Z" />
                    <path d="m3 13 9 5 9-5" />
                    <path d="m3 17.5 9 4.5 9-4.5" />
                  </svg>
                  <h2 class="ay-card__title"><a [routerLink]="enlaces.portada">Galería de demostración</a></h2>
                </ay-card-header>
                <ay-card-body>
                  La vitrina del sistema de diseño, once pantallas de ingreso, la cuenta, la administración, la
                  personalización en vivo, la profundidad, un visor 3D y el análisis de accesibilidad.
                </ay-card-body>
              </ay-card>
            }
            <!-- aybar:demo:fin -->
          </div>
        </div>
      </ay-container>
    </app-marco>
  `,
})
export class Inicio {
  protected readonly acceso = inject(Acceso);
  protected readonly conBackend = CON_BACKEND;
  protected readonly demo = computed(() => esSesionDemo(this.acceso.sesion()));
  // aybar:demo:inicio
  /** Los enlaces de la galería con ng serve; `null` en producción. */
  protected readonly galeria = ENLACES_GALERIA;
  // aybar:demo:fin
}

