import { FERIADOS, HORARIO } from '../datos/catalogos.ts'

/**
 * Tiempo hábil (RN-SVC-003): lunes a viernes, de HORARIO.desde a HORARIO.hasta, sin los
 * FERIADOS. Hora local del navegador; el prototipo no maneja zonas horarias ni geografía
 * por establecimiento (pregunta abierta de FT-ATC-04).
 */

const MIN = 60_000

export const fechaIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export const esDiaHabil = (d: Date) => d.getDay() !== 0 && d.getDay() !== 6 && !FERIADOS.includes(fechaIso(d))

/** El primer instante hábil igual o posterior a `d`. */
export function normalizar(d: Date): Date {
  const r = new Date(d)
  for (;;) {
    if (!esDiaHabil(r) || r.getHours() >= HORARIO.hasta) {
      r.setDate(r.getDate() + 1)
      r.setHours(HORARIO.desde, 0, 0, 0)
      continue
    }
    if (r.getHours() < HORARIO.desde) r.setHours(HORARIO.desde, 0, 0, 0)
    return r
  }
}

export function sumarHorasHabiles(inicio: Date, horas: number): Date {
  let d = normalizar(inicio)
  let minutos = Math.round(horas * 60)
  while (minutos > 0) {
    const fin = new Date(d)
    fin.setHours(HORARIO.hasta, 0, 0, 0)
    const libres = (fin.getTime() - d.getTime()) / MIN
    if (minutos <= libres) return new Date(d.getTime() + minutos * MIN)
    minutos -= libres
    d.setDate(d.getDate() + 1)
    d.setHours(HORARIO.desde, 0, 0, 0)
    d = normalizar(d)
  }
  return d
}

/** Horas hábiles entre dos instantes (0 si `hasta` es anterior). */
export function horasHabilesEntre(desde: Date, hasta: Date): number {
  if (hasta <= desde) return 0
  let d = normalizar(desde)
  let total = 0
  while (d < hasta) {
    const fin = new Date(d)
    fin.setHours(HORARIO.hasta, 0, 0, 0)
    const tope = fin < hasta ? fin : hasta
    total += (tope.getTime() - d.getTime()) / MIN
    if (tope === hasta) break
    d.setDate(d.getDate() + 1)
    d.setHours(HORARIO.desde, 0, 0, 0)
    d = normalizar(d)
  }
  return total / 60
}

/** Fin del día del n-ésimo día hábil posterior a `desde` (plazos legales en días hábiles). */
export function sumarDiasHabiles(desde: Date, n: number): Date {
  const d = new Date(desde)
  d.setHours(0, 0, 0, 0)
  for (let k = 0; k < n; ) {
    d.setDate(d.getDate() + 1)
    if (esDiaHabil(d)) k++
  }
  d.setHours(23, 59, 0, 0)
  return d
}

/** Días hábiles desde `desde` (excluido) hasta `hasta` (incluido), por fecha; negativo si `hasta` ya pasó. */
export function diasHabilesEntre(desde: Date, hasta: Date): number {
  const a = new Date(desde)
  a.setHours(0, 0, 0, 0)
  const b = new Date(hasta)
  b.setHours(0, 0, 0, 0)
  const signo = b >= a ? 1 : -1
  const [ini, fin] = signo > 0 ? [a, b] : [b, a]
  let n = 0
  for (const d = new Date(ini); d < fin; ) {
    d.setDate(d.getDate() + 1)
    if (esDiaHabil(d)) n++
  }
  return signo * n
}
