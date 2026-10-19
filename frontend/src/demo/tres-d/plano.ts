import { ETIQUETA_ESTADO, LOTES, MANZANAS, PLANO, formatoSoles, resumenLotes } from '../datos/lotes'
import type { EstadoLote, Lote } from '../datos/lotes'

/**
 * El plano de lotes del visor de /demo/3d, sin three.js, sin framework y sin DOM (salvo
 * `hayWebGL` y `pideMenosMovimiento`, que solo lo tocan al llamarlas): qué color, qué altura
 * y qué trama lleva cada estado, cómo se filtra, cómo se agrupa la lista y qué dice la
 * ficha. Lo usan la escena 3D (escena-lotes.ts), el plano 2D y la pantalla, y lo prueba
 * `npm test` (pruebas/demo-tres-d.test.ts).
 *
 * El mismo archivo, idéntico, vive en React (src/demo/tres-d/) y en Angular
 * (src/app/demo/visor/). `npm run demo:quitar` lo borra con el resto de la galería.
 */

export const ESTADOS: readonly EstadoLote[] = ['disponible', 'reservado', 'vendido', 'bloqueado']

/**
 * El token de color de cada estado: el mismo en la leyenda, en el plano 2D (CSS) y en el
 * 3D (`readColor`). Disponible, reservado y vendido llevan los tonos de feedback; bloqueado,
 * un neutro.
 */
export const TOKEN_ESTADO: Readonly<Record<EstadoLote, string>> = {
  disponible: '--aybar-color-feedback-success-border',
  reservado: '--aybar-color-feedback-warning-border',
  vendido: '--aybar-color-feedback-danger-border',
  bloqueado: '--aybar-color-border-default',
}

export type TonoEstado = 'success' | 'warning' | 'danger' | 'neutral'

/** El tono del Badge de cada estado, el mismo que su color en el plano. */
export const TONO_ESTADO: Readonly<Record<EstadoLote, TonoEstado>> = {
  disponible: 'success',
  reservado: 'warning',
  vendido: 'danger',
  bloqueado: 'neutral',
}

/**
 * La altura de la caja de cada estado, en metros. El estado no se lee solo por el color
 * (el verde y el ámbar no sobreviven al daltonismo): en 3D, cuanto más avanzada la venta,
 * más alta la caja; en 2D, cada estado lleva su trama.
 */
export const ALTURA_ESTADO: Readonly<Record<EstadoLote, number>> = {
  bloqueado: 0.8,
  disponible: 1.6,
  reservado: 3.2,
  vendido: 4.8,
}

/** La altura de cada estado entre 0 y 1 (vendido, 1): la muestra de la leyenda. */
export function alturaRelativa(estado: EstadoLote): number {
  return ALTURA_ESTADO[estado] / Math.max(...ESTADOS.map((e) => ALTURA_ESTADO[e]))
}

export type Trama = 'lisa' | 'puntos' | 'rayas' | 'cuadros'

/** La trama de cada estado en el plano 2D y en la leyenda: disponible va liso. */
export const TRAMA_ESTADO: Readonly<Record<EstadoLote, Trama>> = {
  disponible: 'lisa',
  reservado: 'puntos',
  vendido: 'rayas',
  bloqueado: 'cuadros',
}

/** El id del `<pattern>` SVG de la trama de un estado, o `null` si va liso. */
export function idTrama(estado: EstadoLote): string | null {
  const trama = TRAMA_ESTADO[estado]
  return trama === 'lisa' ? null : `gl-maqueta-trama-${trama}`
}

/** La altura de un lote que el filtro deja fuera: queda plano, como contexto. */
export const ALTURA_FUERA = 0.25

/** El grosor de la losa de cada manzana, sobre la que se apoyan los lotes. */
export const LOSA = 0.3

/** La junta entre lotes vecinos, en metros: la caja es algo menor que su lote. */
export const JUNTA = 0.8

export const TODOS = 'todos'
export const TODAS = 'todas'

export type FiltroEstado = EstadoLote | typeof TODOS

export interface Filtro {
  readonly estado: FiltroEstado
  /** Una letra de `MANZANAS` o `todas`. */
  readonly manzana: string
}

export const SIN_FILTRO: Filtro = Object.freeze({ estado: TODOS, manzana: TODAS })

export function esEstado(valor: unknown): valor is EstadoLote {
  return typeof valor === 'string' && (ESTADOS as readonly string[]).includes(valor)
}

export function esFiltroEstado(valor: unknown): valor is FiltroEstado {
  return valor === TODOS || esEstado(valor)
}

export function esFiltroManzana(valor: unknown): valor is string {
  return valor === TODAS || (typeof valor === 'string' && (MANZANAS as readonly string[]).includes(valor))
}

/** Los lotes que deja pasar el filtro, en el orden de `LOTES` (manzana y número). */
export function filtrarLotes(filtro: Filtro, lotes: readonly Readonly<Lote>[] = LOTES): Readonly<Lote>[] {
  return lotes.filter(
    (lote) => (filtro.estado === TODOS || lote.estado === filtro.estado) && (filtro.manzana === TODAS || lote.manzana === filtro.manzana),
  )
}

const POR_ID: ReadonlyMap<string, Readonly<Lote>> = new Map(LOTES.map((lote) => [lote.id, lote]))

/** El lote con ese id («B-07»), o `undefined`. */
export function loteDe(id: string | null | undefined): Readonly<Lote> | undefined {
  return id ? POR_ID.get(id) : undefined
}

export interface Rect {
  readonly x: number
  readonly y: number
  readonly ancho: number
  readonly alto: number
}

/** El rectángulo que ocupan los lotes de una manzana, en metros sobre el plano. */
export function rectManzana(manzana: string, lotes: readonly Readonly<Lote>[] = LOTES): Rect {
  const propios = lotes.filter((lote) => lote.manzana === manzana)
  if (propios.length === 0) return { x: 0, y: 0, ancho: 0, alto: 0 }
  const x = Math.min(...propios.map((l) => l.x))
  const y = Math.min(...propios.map((l) => l.y))
  const ancho = Math.max(...propios.map((l) => l.x + l.frente)) - x
  const alto = Math.max(...propios.map((l) => l.y + l.fondo)) - y
  return { x, y, ancho, alto }
}

/** Las ocho manzanas con su rectángulo, para la losa 3D y el bloque 2D. */
export const MANZANAS_PLANO: readonly { readonly manzana: string; readonly rect: Rect }[] = MANZANAS.map((manzana) => ({
  manzana,
  rect: rectManzana(manzana),
}))

/**
 * El centro de un lote en la escena 3D: el plano centrado en el origen, con su eje x en
 * el X de three.js y su eje y en el Z (hacia la cámara). Así la fila de arriba del plano 2D
 * queda al fondo en el 3D y las dos vistas se leen igual.
 */
export function centroEnEscena(lote: Pick<Lote, 'x' | 'y' | 'frente' | 'fondo'>): { x: number; z: number } {
  return { x: lote.x + lote.frente / 2 - PLANO.ancho / 2, z: lote.y + lote.fondo / 2 - PLANO.alto / 2 }
}

/** «Lote B-07 elegido: disponible, 190 m², S/ 98,500.»: lo que se anuncia al elegir. */
export function anuncioDeLote(lote: Readonly<Lote>): string {
  return `Lote ${lote.id} elegido: ${ETIQUETA_ESTADO[lote.estado].toLowerCase()}, ${lote.area} m², ${formatoSoles(lote.precio)}.`
}

/** «Disponible · 190 m²»: lo que la lista dice de cada lote, además de su código. */
export function metaDeLote(lote: Readonly<Lote>): string {
  return `${ETIQUETA_ESTADO[lote.estado]} · ${lote.area} m²`
}

/**
 * Los datos de la ficha de un lote, en orden: etiqueta y valor ya escritos. El estado no
 * va aquí: lo dice el Badge de la cabecera de la ficha, con su tono.
 */
export function paresDeFicha(lote: Readonly<Lote>): [string, string][] {
  return [
    ['Área', `${lote.area} m²`],
    ['Frente × fondo', `${lote.frente} m × ${lote.fondo} m`],
    ['Precio', formatoSoles(lote.precio)],
    ['Ubicación', lote.preferente ? 'Preferente: esquina o frente al parque' : 'Interior'],
  ]
}

const PLURAL: Readonly<Record<EstadoLote, [string, string]>> = {
  disponible: ['disponible', 'disponibles'],
  reservado: ['reservado', 'reservados'],
  vendido: ['vendido', 'vendidos'],
  bloqueado: ['bloqueado', 'bloqueados'],
}

/** «74 disponibles, 25 reservados, 52 vendidos y 9 bloqueados» (sin los estados en cero). */
export function resumenEnTexto(resumen: Readonly<Record<EstadoLote, number>> = resumenLotes()): string {
  const partes = ESTADOS.filter((estado) => resumen[estado] > 0).map((estado) => {
    const n = resumen[estado]
    return `${n} ${PLURAL[estado][n === 1 ? 0 : 1]}`
  })
  if (partes.length === 0) return 'ningún lote'
  if (partes.length === 1) return partes[0] ?? ''
  return `${partes.slice(0, -1).join(', ')} y ${partes[partes.length - 1]}`
}

/** «Los 160 lotes», «74 de 160 lotes» o «Ningún lote con estos filtros». */
export function textoMostrando(visibles: number, total: number = LOTES.length): string {
  if (visibles === 0) return 'Ningún lote con estos filtros'
  if (visibles === total) return `Los ${total} lotes`
  return `${visibles} de ${total} lotes`
}

/** Una manzana de la lista, con sus lotes visibles. Cada framework la pasa a su TreeView. */
export interface RamaLista {
  readonly id: string
  readonly manzana: string
  readonly etiqueta: string
  readonly meta: string
  readonly lotes: readonly Readonly<Lote>[]
}

/** El id del nodo de una manzana en la lista: `manzana-B`. No choca con un id de lote. */
export function idDeManzana(manzana: string): string {
  return `manzana-${manzana}`
}

/** La manzana de un id de nodo (`manzana-B` → `B`), o `null` si no es de una manzana. */
export function manzanaDeId(id: string): string | null {
  const manzana = id.startsWith('manzana-') ? id.slice('manzana-'.length) : ''
  return (MANZANAS as readonly string[]).includes(manzana) ? manzana : null
}

/** Las manzanas con algún lote visible, en orden, con sus lotes: las ramas de la lista. */
export function ramasDeLista(visibles: readonly Readonly<Lote>[]): RamaLista[] {
  return MANZANAS.flatMap((manzana) => {
    const lotes = visibles.filter((lote) => lote.manzana === manzana)
    if (lotes.length === 0) return []
    return [{ id: idDeManzana(manzana), manzana, etiqueta: `Manzana ${manzana}`, meta: `${lotes.length} ${lotes.length === 1 ? 'lote' : 'lotes'}`, lotes }]
  })
}

/**
 * El lote de la etiqueta visible de un nodo de la lista. La etiqueta de un lote es su
 * código («B-07»), así que el TreeView, que no dice qué nodo tiene el foco, se puede leer
 * desde el DOM sin depender de su marcado interno más que de esa etiqueta.
 */
export function idDeEtiqueta(texto: string | null | undefined): string | null {
  const limpio = texto?.trim() ?? ''
  return POR_ID.has(limpio) ? limpio : null
}

export interface Opcion {
  readonly value: string
  readonly label: string
}

/** Las opciones del filtro de estado, con cuántos lotes hay de cada uno. */
export function opcionesEstado(resumen: Readonly<Record<EstadoLote, number>> = resumenLotes()): Opcion[] {
  return [
    { value: TODOS, label: `Todos los estados (${LOTES.length})` },
    ...ESTADOS.map((estado) => ({ value: estado, label: `${ETIQUETA_ESTADO[estado]} (${resumen[estado]})` })),
  ]
}

/** Las opciones del filtro de manzana. */
export function opcionesManzana(): Opcion[] {
  return [{ value: TODAS, label: 'Todas las manzanas' }, ...MANZANAS.map((manzana) => ({ value: manzana, label: `Manzana ${manzana}` }))]
}

export type Vista = '3d' | '2d'

/** Por qué se ve el plano 2D: lo eligió la persona, no hay WebGL, pidió menos movimiento o falló el 3D. */
export type Motivo2D = 'eleccion' | 'sin-webgl' | 'movimiento' | 'error'

/**
 * La vista con la que se entra: sin WebGL, el 2D (y no hay vuelta); con movimiento
 * reducido, el 2D, pero se puede pasar al 3D; si no, el 3D.
 */
export function vistaInicial(webgl: boolean, menosMovimiento: boolean): { vista: Vista; motivo: Motivo2D | null } {
  if (!webgl) return { vista: '2d', motivo: 'sin-webgl' }
  if (menosMovimiento) return { vista: '2d', motivo: 'movimiento' }
  return { vista: '3d', motivo: null }
}

/** Lo que explica la vista 2D cuando no la eligió la persona. */
export function avisoDe2D(motivo: Motivo2D | null): string | null {
  switch (motivo) {
    case 'sin-webgl':
      return 'Este navegador no tiene WebGL (o lo tiene desactivado): el plano se muestra en 2D, con los mismos datos.'
    case 'movimiento':
      return 'Pediste menos movimiento en tu sistema: empezamos por el plano 2D. El 3D sigue a un botón.'
    case 'error':
      return 'No se pudo cargar el visor 3D. El plano 2D tiene los mismos lotes; puedes reintentar el 3D.'
    default:
      return null
  }
}

/**
 * `true` si el navegador puede crear un contexto WebGL. Se prueba creándolo en un lienzo
 * que no se muestra, y se suelta enseguida: los navegadores limitan cuántos hay a la vez.
 */
export function hayWebGL(): boolean {
  if (typeof document === 'undefined') return false
  try {
    const lienzo = document.createElement('canvas')
    const contexto = lienzo.getContext('webgl2') ?? lienzo.getContext('webgl')
    if (!contexto) return false
    contexto.getExtension('WEBGL_lose_context')?.loseContext()
    return true
  } catch {
    return false
  }
}

/** `true` si el sistema pide menos movimiento. */
export function pideMenosMovimiento(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** El margen del plano 2D alrededor de las manzanas, en metros: deja sitio a los rótulos. */
export const MARGEN_2D = 10

/** El `viewBox` del plano 2D: todo el plano y su margen. */
export const VIEWBOX_2D = `${-MARGEN_2D} ${-MARGEN_2D} ${PLANO.ancho + 2 * MARGEN_2D} ${PLANO.alto + 2 * MARGEN_2D}`
