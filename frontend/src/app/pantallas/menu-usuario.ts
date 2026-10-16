import { Component, computed, input, output } from '@angular/core';
import { AyAvatar, AyDropdownMenu, AyIconButton } from '@aybarcorp/ui-angular';
import type { AyMenuItem } from '@aybarcorp/ui-angular';
import { nombreVisible, rolesVisibles } from '../sesion';
import type { SesionVisible } from '../sesion';

/**
 * El menú de la cuenta, en las acciones de la Navbar: el Avatar con las iniciales abre un
 * Dropdown Menu con quién inició sesión, sus roles y «Salir».
 *
 * Un menú solo admite comandos, grupos y separadores: el nombre y los roles son la cabecera
 * del grupo que contiene «Salir», y el lector la anuncia como su nombre. Las flechas, Escape
 * y la vuelta del foco al Avatar los pone ay-dropdown-menu.
 */
@Component({
  selector: 'app-menu-usuario',
  imports: [AyAvatar, AyDropdownMenu, AyIconButton],
  host: { class: 'pl-usuario' },
  template: `
    <ay-dropdown-menu colocacion="bottom-end" [items]="items()" (elegido)="alElegir($event)">
      <ay-icon-button ayDisparador [etiqueta]="'Cuenta de ' + nombre()">
        <ay-avatar [nombre]="nombre()" size="sm" decorativo />
      </ay-icon-button>
    </ay-dropdown-menu>
  `,
})
export class MenuUsuario {
  readonly sesion = input.required<SesionVisible>();
  /** «Salir»: quien monta el menú cierra la sesión. */
  readonly salir = output<void>();

  protected readonly nombre = computed(() => nombreVisible(this.sesion()));
  protected readonly items = computed<AyMenuItem[]>(() => [
    { tipo: 'group', label: `${this.nombre()} · ${rolesVisibles(this.sesion())}` },
    { tipo: 'item', value: 'salir', label: 'Salir' },
  ]);

  protected alElegir(valor: string): void {
    if (valor === 'salir') this.salir.emit();
  }
}
