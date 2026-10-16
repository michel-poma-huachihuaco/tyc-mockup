/**
 * Azar con semilla fija: los datos de la galería salen iguales en cada carga, en cada
 * máquina y en React y Angular, así una captura o una prueba no cambian entre corridas.
 * No es criptográfico ni pretende serlo: solo reparte valores sintéticos.
 */

/** Generador mulberry32: un entero de 32 bits de estado, período 2^32. */
export function crearAzar(semilla: number): () => number {
  let estado = semilla >>> 0
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0
    let t = estado
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Un entero entre `min` y `max`, los dos incluidos. */
export function entero(azar: () => number, min: number, max: number): number {
  return min + Math.floor(azar() * (max - min + 1))
}

export function elegir<T>(azar: () => number, opciones: readonly T[]): T {
  return opciones[Math.floor(azar() * opciones.length)] as T
}

/** Elige según pesos: `[['a', 3], ['b', 1]]` da «a» tres veces más que «b». */
export function ponderado<T>(azar: () => number, opciones: readonly (readonly [T, number])[]): T {
  const total = opciones.reduce((suma, [, peso]) => suma + peso, 0)
  let punto = azar() * total
  for (const [valor, peso] of opciones) {
    punto -= peso
    if (punto < 0) return valor
  }
  return opciones[opciones.length - 1]![0]
}

/**
 * El «hoy» de la galería. Las fechas sintéticas se calculan desde aquí y no desde el reloj,
 * para que «hace 3 días» diga lo mismo en una prueba de hoy y en una de dentro de un año.
 */
export const HOY = new Date('2026-10-01T09:00:00-05:00')

/** `HOY` menos `minutos`, en ISO. */
export function haceMinutos(minutos: number): string {
  return new Date(HOY.getTime() - minutos * 60_000).toISOString()
}

/** Quita tildes y espacios para armar un identificador o un correo. */
export function sinTildes(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, '')
}
