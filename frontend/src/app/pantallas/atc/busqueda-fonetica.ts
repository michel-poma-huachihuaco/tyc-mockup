/**
 * BUS-01 / EVA-03 · Búsqueda de nombres y apellidos por similitud fonética en español.
 * TypeScript puro (sin Angular ni DOM), sin dependencias.
 *
 * Algoritmo
 *  1. Normalización: minúsculas, sin tildes ni diéresis; la ñ se trata como n (en las
 *     fuentes se escribe de ambos modos: Nuñez/Nunez); solo letras, el resto separa palabras.
 *  2. Clave fonética por palabra (reglas del español, aplicadas en este orden):
 *     ch -> 1 (se conserva como sonido propio) · ll -> y · h muda (se elimina) · v, w -> b
 *     · z -> s · c ante e/i -> s, c en otro caso -> k · qu -> k, q -> k · gu ante e/i -> g
 *     · g ante e/i -> j · x -> ks · y final -> i · letras dobles se colapsan.
 *     Las vocales se conservan: la clave distingue Garcia de Garcés (garsia/garses).
 *  3. Similitud: dos palabras coinciden si su clave es IGUAL. Una consulta coincide con un
 *     nombre si CADA palabra de la consulta coincide con alguna palabra del nombre.
 *     Sin distancia de edición: con apellidos cortos (Rojas/Rocha, Torres/Flores) subir
 *     tolerancia dispara falsos positivos.
 *
 * Resultado: la exacta (subcadena, como hoy) va primero, las fonéticas después con
 * `motivo: 'fonetica'`. La API devuelve candidatos con id; NUNCA elige entre varios.
 *
 * Limitaciones
 *  - Reglas del español: nombres de origen quechua, inglés o italiano (Huamán/Guaman,
 *    Smith/Esmit) solo coinciden si las reglas los llevan a la misma clave.
 *  - No corrige erratas (letras omitidas o cambiadas): "Alvn" no encuentra "Alban".
 *  - ll/y se unifican como y; y vocálica interior (Ayala/Aiala) no se unifica.
 *  - Sin coincidencia por prefijo en la parte fonética (la exacta ya cubre el tecleo parcial).
 *  - La consulta con dígitos (DNI, documento, teléfono) nunca pasa por la fonética.
 */

export type MotivoBusqueda = 'exacta' | 'fonetica';

export interface Candidato<T> {
  readonly item: T;
  readonly motivo: MotivoBusqueda;
}

export function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // tildes y diéresis; la ñ queda como n
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Clave fonética de UNA palabra ya normalizada. */
export function claveFonetica(palabra: string): string {
  let s = palabra
    .replace(/ch/g, '1')
    .replace(/ll/g, 'y')
    .replace(/h/g, '')
    .replace(/[vw]/g, 'b')
    .replace(/z/g, 's')
    .replace(/qu/g, 'k')
    .replace(/q/g, 'k')
    .replace(/c(?=[ei])/g, 's')
    .replace(/c/g, 'k')
    .replace(/gu(?=[ei])/g, 'g')
    .replace(/g(?=[ei])/g, 'j')
    .replace(/x/g, 'ks')
    .replace(/y$/, 'i');
  s = s.replace(/(.)\1+/g, '$1'); // dobles
  return s;
}

function palabras(texto: string): string[] {
  const n = normalizar(texto);
  return n ? n.split(' ') : [];
}

/** Índice precalculado de un nombre (para listas grandes: se calcula una vez por registro). */
export function clavesDeNombre(nombre: string): readonly string[] {
  return palabras(nombre).map(claveFonetica);
}

export function coincideFoneticamente(clavesConsulta: readonly string[], clavesNombre: readonly string[]): boolean {
  return clavesConsulta.length > 0 && clavesConsulta.every((k) => clavesNombre.includes(k));
}

export interface OpcionesBusqueda<T> {
  /** Nombre o razón social sobre el que aplica la fonética. */
  readonly nombre: (item: T) => string;
  /** Campos con coincidencia exacta por subcadena (nombre, DNI, documento, teléfono...). */
  readonly exactos: (item: T) => readonly string[];
  /** Claves precalculadas por registro; si falta se calculan al vuelo. */
  readonly claves?: (item: T) => readonly string[];
}

/**
 * Exactas primero (orden original), fonéticas después. Consulta vacía: ninguna.
 * Si hay varios candidatos, el llamador debe pedir al usuario que elija.
 */
export function buscarCandidatos<T>(items: readonly T[], termino: string, op: OpcionesBusqueda<T>): Candidato<T>[] {
  const q = termino.trim().toLowerCase();
  if (!q) return [];
  const exactas: Candidato<T>[] = [];
  const resto: T[] = [];
  for (const item of items) {
    if (op.exactos(item).some((t) => t.toLowerCase().includes(q))) exactas.push({ item, motivo: 'exacta' });
    else resto.push(item);
  }
  if (/\d/.test(q)) return exactas;
  const clavesQ = clavesDeNombre(q);
  if (clavesQ.length === 0) return exactas;
  const foneticas: Candidato<T>[] = [];
  for (const item of resto) {
    const claves = op.claves ? op.claves(item) : clavesDeNombre(op.nombre(item));
    if (coincideFoneticamente(clavesQ, claves)) foneticas.push({ item, motivo: 'fonetica' });
  }
  return [...exactas, ...foneticas];
}
