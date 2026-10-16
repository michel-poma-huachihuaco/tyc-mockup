import { Component, computed, inject } from '@angular/core';
import { AyAppearanceService, AyDropdownMenu, AyIconButton } from '@aybarcorp/ui-angular';
import type { AyMenuItem } from '@aybarcorp/ui-angular';
import { OPCIONES_TEMA, esPreferenciaTema, etiquetaTema } from '../tema';

/**
 * El selector de tema: Claro, Oscuro o Según el sistema, como elementos de radio de un
 * ay-dropdown-menu (el marcado es el elegido). AyAppearanceService del sistema de diseño lo
 * aplica en `<html data-theme>`, de donde leen todos los tokens, y lo recuerda en este
 * navegador; «Según el sistema» olvida la elección y vuelve a seguir a prefers-color-scheme.
 *
 * El estado es uno por documento (el núcleo de apariencia de @aybarcorp/tokens) y el servicio
 * lo expone como señales: si hay más de un selector en la página, todos dicen lo mismo.
 * Para que al recargar no destelle el tema por defecto,
 * index.html carga apariencia-arranque.js en el <head>, que aplica lo recordado antes del
 * primer pintado.
 *
 * Solo lo pinta quien es dueño del documento: en un remoto el tema es del shell.
 */
@Component({
  selector: 'app-boton-tema',
  imports: [AyDropdownMenu, AyIconButton],
  template: `
    <ay-dropdown-menu colocacion="bottom-end" [items]="items()" (elegido)="elegir($event)">
      <ay-icon-button ayDisparador variante="secondary" [etiqueta]="etiqueta()">
        @switch (apariencia.tema()) {
          @case ('light') {
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
          }
          @case ('dark') {
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
            </svg>
          }
          @default {
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
              <rect x="3" y="4" width="18" height="12" rx="2" />
              <path d="M8 20h8M12 16v4" />
            </svg>
          }
        }
      </ay-icon-button>
    </ay-dropdown-menu>
  `,
})
export class BotonTema {
  protected readonly apariencia = inject(AyAppearanceService);

  protected readonly etiqueta = computed(() => etiquetaTema(this.apariencia.tema(), this.apariencia.temaResuelto()));
  protected readonly items = computed<AyMenuItem[]>(() =>
    OPCIONES_TEMA.map(({ valor, etiqueta }) => ({
      tipo: 'item',
      rol: 'menuitemradio',
      value: valor,
      label: etiqueta,
      marcado: this.apariencia.tema() === valor,
    })),
  );

  protected elegir(valor: string): void {
    if (esPreferenciaTema(valor)) this.apariencia.establecer('tema', valor);
  }
}
