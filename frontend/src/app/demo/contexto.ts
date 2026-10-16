import { InjectionToken } from '@angular/core';
import type { Signal } from '@angular/core';
import type { SesionVisible } from '../sesion';

/**
 * Lo que la galería necesita de la aplicación que la monta: quién inició sesión (nombre y
 * roles, para el menú de la cuenta, «Ver como» y la administración) y cómo salir. Es la
 * misma idea que el contexto que un anfitrión entrega a un remoto: la galería no importa
 * @aybarcorp/auth ni sabe si la sesión es la demo o la del emisor real.
 */
export interface SesionGaleria {
  /** La sesión vigente, o `null`. */
  readonly sesion: Signal<SesionVisible | null>;
  /** Cierra la sesión real de la aplicación. */
  salir(): Promise<void>;
}

/** Lo provee la ruta `demo` de src/app/galeria.development.ts. */
export const SESION_GALERIA = new InjectionToken<SesionGaleria>('aybar.galeria.sesion');
