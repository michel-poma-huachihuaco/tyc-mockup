/**
 * Quién ve qué en la galería, sin Angular: las rutas públicas, el rol de administración y
 * «Ver como». Lo prueba `npm test` (pruebas/demo-acceso.test.ts).
 *
 * «Ver como» baja los roles solo dentro de la galería, para recorrerla como la vería un
 * usuario sin administración. Nunca sube: con «Administración» elegido, una sesión sin
 * ADMIN sigue sin él. Es una vista, no seguridad: la sesión real no cambia.
 */
import { esRutaDeGaleria, resolverRuta } from './navegacion';

export const ROL_ADMIN = 'ADMIN';

export type VerComo = 'admin' | 'usuario';

export const OPCIONES_VER_COMO: readonly { readonly valor: VerComo; readonly etiqueta: string }[] = [
  { valor: 'admin', etiqueta: 'Administración' },
  { valor: 'usuario', etiqueta: 'Usuario' },
];

/** Dónde se recuerda «Ver como»: sessionStorage, solo esta pestaña y hasta cerrarla. */
export const CLAVE_VER_COMO = 'aybar:galeria:ver-como';

export function esVerComo(valor: unknown): valor is VerComo {
  return valor === 'admin' || valor === 'usuario';
}

/** Lo recordado, o «Administración» si no hay nada (o el almacén no está disponible). */
export function leerVerComo(almacen: Pick<Storage, 'getItem'> | null | undefined): VerComo {
  try {
    const valor = almacen?.getItem(CLAVE_VER_COMO);
    return esVerComo(valor) ? valor : 'admin';
  } catch {
    return 'admin';
  }
}

export function guardarVerComo(almacen: Pick<Storage, 'setItem'> | null | undefined, valor: VerComo): void {
  try {
    almacen?.setItem(CLAVE_VER_COMO, valor);
  } catch {
    // Sin almacén (modo privado, sin permiso): «Ver como» dura lo que la página.
  }
}

/** Los roles con que se ve la galería: los reales, sin ADMIN si se ve como usuario. */
export function rolesEfectivos(reales: readonly string[], verComo: VerComo): string[] {
  return verComo === 'usuario' ? reales.filter((rol) => rol !== ROL_ADMIN) : [...reales];
}

export function esAdmin(roles: readonly string[]): boolean {
  return roles.includes(ROL_ADMIN);
}

/** Lo que pasa al abrir una ruta de la galería. */
export type Acceso = 'permitido' | 'ingresar' | 'prohibido';

/**
 * - Las de ingreso son públicas: maquetas que no inician sesión.
 * - Lo demás pide sesión: sin ella, al ingreso real con la vuelta en `?destino=`.
 * - Administración pide ADMIN entre los roles efectivos: sin él, el 403 del framework.
 */
export function accesoA(url: string, sesion: { readonly roles: readonly string[] } | null, verComo: VerComo): Acceso {
  if (!esRutaDeGaleria(url)) return 'permitido';
  const resolucion = resolverRuta(url);
  if (resolucion.publica) return 'permitido';
  if (!sesion) return 'ingresar';
  if (resolucion.soloAdmin && !esAdmin(rolesEfectivos(sesion.roles, verComo))) return 'prohibido';
  return 'permitido';
}
