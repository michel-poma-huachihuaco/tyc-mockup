import { DOCUMENT, Injectable, computed, inject, signal } from '@angular/core';
import { esAdmin, guardarVerComo, leerVerComo, rolesEfectivos } from './acceso';
import type { VerComo } from './acceso';
import { SESION_GALERIA } from './contexto';
import { esEmbebida } from './navegacion';

/**
 * El estado de la galería mientras se recorre: la sesión que recibe de la aplicación,
 * «Ver como» y los roles que resultan, si el panel Personalizar y la búsqueda están
 * abiertos, y si la página va embebida en el iframe de Redimensionado. Lo provee la ruta
 * raíz de /demo (rutas.ts): uno para toda la galería, que sobrevive a la navegación entre
 * sus pantallas. Por eso el panel Personalizar sigue abierto al cambiar de pantalla.
 */
@Injectable()
export class EstadoGaleria {
  private readonly contexto = inject(SESION_GALERIA);
  private readonly ventana = inject(DOCUMENT).defaultView;

  /** La sesión de la aplicación: nombre y roles reales. */
  readonly sesion = this.contexto.sesion;
  readonly rolesReales = computed(() => this.sesion()?.roles ?? []);
  /** La sesión real tiene ADMIN: solo entonces «Ver como Administración» tiene sentido. */
  readonly adminReal = computed(() => esAdmin(this.rolesReales()));

  private readonly verComoElegido = signal<VerComo>(leerVerComo(this.almacen()));
  readonly verComo = this.verComoElegido.asReadonly();
  /** Los roles con que se ve la galería: los reales, menos ADMIN si se ve como usuario. */
  readonly roles = computed(() => rolesEfectivos(this.rolesReales(), this.verComo()));
  readonly esAdmin = computed(() => esAdmin(this.roles()));

  /** El panel Personalizar: abierto o cerrado, igual en todas las pantallas. */
  readonly personalizarAbierto = signal(false);
  /** La paleta de búsqueda (Ctrl K). */
  readonly busquedaAbierta = signal(false);

  /**
   * `?embebido=1` en la URL con que se abrió la galería: el iframe de Redimensionado la
   * carga así para enseñar la pantalla sin el marco. Se lee una vez: lo que se navegue
   * dentro del iframe sigue embebido.
   */
  readonly embebido = esEmbebida(this.ventana?.location.href ?? '');

  establecerVerComo(valor: VerComo): void {
    this.verComoElegido.set(valor);
    guardarVerComo(this.almacen(), valor);
  }

  salir(): Promise<void> {
    return this.contexto.salir();
  }

  private almacen(): Storage | null {
    try {
      return this.ventana?.sessionStorage ?? null;
    } catch {
      return null;
    }
  }
}
