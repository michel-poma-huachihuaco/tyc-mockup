/**
 * FAV-01 · favoritos personales de menú (lógica pura, sin Angular).
 * Supuesto reversible (límite/orden no cerrados en la reunión): se guardan TODOS los ids en orden de
 * marcado y el grupo «Favoritos» del sidebar los muestra todos, el más reciente primero; sin límite.
 * Persistencia: localStorage por persona (solo ids de menú, nada sensible).
 */
export const claveFavoritos = (personaId: string): string => `aybar-atc:favoritos:${personaId}`;

/** Marca o desmarca: al marcar, va al final (el más reciente). */
export function alternarFavorito(ids: readonly string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
}

export function leerFavoritos(personaId: string, almacen?: Pick<Storage, 'getItem'>): string[] {
  try {
    const crudo = (almacen ?? localStorage).getItem(claveFavoritos(personaId));
    const dato: unknown = crudo ? JSON.parse(crudo) : [];
    return Array.isArray(dato) ? dato.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function guardarFavoritos(personaId: string, ids: readonly string[], almacen?: Pick<Storage, 'setItem'>): void {
  try {
    (almacen ?? localStorage).setItem(claveFavoritos(personaId), JSON.stringify(ids));
  } catch {
    /* almacenamiento bloqueado o lleno: los favoritos siguen en memoria durante la sesión */
  }
}
