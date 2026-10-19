import { esPublica, pideAdmin, type Pantalla } from './rutas.ts'

/**
 * Quién entra a qué en la galería, sin React ni DOM (pruebas/demo-acceso.test.ts).
 *
 * - Las pantallas de ingreso son públicas; el resto de /demo pide sesión y, sin ella, manda
 *   al ingreso real con `?destino=` para volver.
 * - La administración pide ADMIN; sin él, el 403 del framework.
 * - «Ver como» baja los roles solo dentro de la galería, para ver qué ve un usuario sin
 *   cerrar la sesión. Nunca sube: con una sesión sin ADMIN, «Administración» no existe.
 */

export const ROL_ADMIN = 'ADMIN'

export const OPCIONES_VER_COMO = [
  { valor: 'admin', etiqueta: 'Administración' },
  { valor: 'usuario', etiqueta: 'Usuario' },
] as const

export type VerComo = (typeof OPCIONES_VER_COMO)[number]['valor']

/** Clave de sessionStorage: «Ver como» dura lo que la pestaña, como la sesión demo. */
export const CLAVE_VER_COMO = 'aybar:galeria:ver-como'

export function esVerComo(valor: unknown): valor is VerComo {
  return OPCIONES_VER_COMO.some((opcion) => opcion.valor === valor)
}

/** «Ver como» solo tiene sentido si la sesión real es de administración. */
export function puedeVerComo(rolesReales: readonly string[]): boolean {
  return rolesReales.includes(ROL_ADMIN)
}

/** Lo que muestra el control: lo elegido si se puede elegir; si no, «Usuario». */
export function verComoVigente(rolesReales: readonly string[], elegido: VerComo | null): VerComo {
  if (!puedeVerComo(rolesReales)) return 'usuario'
  return elegido ?? 'admin'
}

/** Los roles con que se pinta la galería: los reales, sin ADMIN si se ve como usuario. */
export function rolesEfectivos(rolesReales: readonly string[], elegido: VerComo | null): readonly string[] {
  if (verComoVigente(rolesReales, elegido) === 'usuario') return rolesReales.filter((rol) => rol !== ROL_ADMIN)
  return rolesReales
}

export type Acceso =
  | { readonly tipo: 'permitido' }
  | { readonly tipo: 'ingresar'; readonly destino: string }
  | { readonly tipo: 'prohibido'; readonly rol: string }

/**
 * Qué pasa al pedir una pantalla. `ruta` es la ruta pedida con su búsqueda: es el destino
 * al que el ingreso devuelve tras iniciar sesión.
 */
export function decidirAcceso(
  pantalla: Pantalla,
  sesion: { readonly roles: readonly string[] } | null,
  elegido: VerComo | null,
  ruta: string,
): Acceso {
  if (esPublica(pantalla)) return { tipo: 'permitido' }
  if (!sesion) return { tipo: 'ingresar', destino: ruta }
  if (pideAdmin(pantalla) && !rolesEfectivos(sesion.roles, elegido).includes(ROL_ADMIN)) {
    return { tipo: 'prohibido', rol: 'Administración' }
  }
  return { tipo: 'permitido' }
}

/** Lee «Ver como» de un almacén; cualquier otra cosa (o un almacén que falla) es `null`. */
export function leerVerComo(almacen: Pick<Storage, 'getItem'> | null | undefined): VerComo | null {
  try {
    const valor = almacen?.getItem(CLAVE_VER_COMO)
    return esVerComo(valor) ? valor : null
  } catch {
    return null
  }
}
