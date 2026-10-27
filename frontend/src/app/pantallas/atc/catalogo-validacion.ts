/** Validación pura del catálogo de Mantenimiento (tipos y subtipos de ticket). Sin Angular. */

export const normalizarCodigoTipo = (v: string): string => v.trim().toUpperCase();

/** Devuelve el mensaje de error o '' si el código es válido: 3 letras, único. */
export function errorCodigoTipo(codigo: string, existentes: readonly string[]): string {
  const c = normalizarCodigoTipo(codigo);
  if (!c) return 'El código es obligatorio.';
  if (!/^[A-Z]{3}$/.test(c)) return 'El código son 3 letras (A-Z), por ejemplo «PED».';
  if (existentes.some((e) => e.toUpperCase() === c)) return 'Ya existe un tipo con ese código.';
  return '';
}

const clave = (n: string): string =>
  n.trim().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').toLowerCase();

/** Nombre obligatorio y único dentro del tipo; `ignorarId` excluye al subtipo que se edita. */
export function errorNombreSubtipo(
  nombre: string,
  tipoId: string,
  subtipos: readonly { id: string; tipoId: string; nombre: string }[],
  ignorarId?: string,
): string {
  if (!nombre.trim()) return 'El nombre es obligatorio.';
  const dup = subtipos.some((s) => s.tipoId === tipoId && s.id !== ignorarId && clave(s.nombre) === clave(nombre));
  return dup ? 'Ya existe un subtipo con ese nombre en este tipo.' : '';
}

/** Id estable de un subtipo nuevo: «PED-COPIA-DE-DOCUMENTO», sin chocar con los existentes. */
export function idSubtipoNuevo(tipoId: string, nombre: string, ids: readonly string[]): string {
  const base = `${tipoId}-${clave(nombre).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').toUpperCase()}`;
  let id = base;
  for (let i = 2; ids.includes(id); i++) id = `${base}-${i}`;
  return id;
}
