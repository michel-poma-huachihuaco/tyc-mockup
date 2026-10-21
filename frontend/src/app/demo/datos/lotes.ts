import { crearAzar, entero, ponderado } from './semilla'

/**
 * Un proyecto inmobiliario sintético para el visor 3D y su alternativa 2D: ocho manzanas
 * (A–H) de veinte lotes, en una cuadrícula con calles. Las coordenadas están en metros
 * sobre el plano; el visor 3D las usa tal cual y el plano 2D las escala.
 */

export type EstadoLote = 'disponible' | 'reservado' | 'vendido' | 'bloqueado'

export interface Lote {
  /** «B-07». */
  id: string
  manzana: string
  numero: number
  estado: EstadoLote
  /** m². */
  area: number
  frente: number
  fondo: number
  /** En soles, sin decimales. */
  precio: number
  /** Esquina inferior izquierda del lote en el plano, en metros. */
  x: number
  y: number
  /** Lote en esquina o frente al parque (manzana C, fila de atrás): precio mayor. */
  preferente: boolean
}

export const MANZANAS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const
export const LOTES_POR_MANZANA = 20
/** Ancho de calle entre manzanas, en metros. */
export const CALLE = 12

export const ETIQUETA_ESTADO: Record<EstadoLote, string> = {
  disponible: 'Disponible',
  reservado: 'Reservado',
  vendido: 'Vendido',
  bloqueado: 'Bloqueado',
}

function generar(): Lote[] {
  const azar = crearAzar(2026)
  const lotes: Lote[] = []
  // Cuatro manzanas por fila; cada manzana, dos filas de diez lotes espalda con espalda.
  const frente = 10
  const fondo = 20
  const anchoManzana = frente * (LOTES_POR_MANZANA / 2)
  const altoManzana = fondo * 2
  MANZANAS.forEach((manzana, m) => {
    const ox = (m % 4) * (anchoManzana + CALLE)
    const oy = Math.floor(m / 4) * (altoManzana + CALLE)
    for (let n = 1; n <= LOTES_POR_MANZANA; n++) {
      const fila = n <= LOTES_POR_MANZANA / 2 ? 0 : 1
      const columna = (n - 1) % (LOTES_POR_MANZANA / 2)
      const preferente = columna === 0 || columna === LOTES_POR_MANZANA / 2 - 1 || (manzana === 'C' && fila === 1)
      // El frente es el de la cuadrícula (los lotes no se pisan); el fondo varía un poco.
      const frenteReal = frente
      const fondoReal = fondo - entero(azar, 0, 2)
      const area = frenteReal * fondoReal
      const estado = ponderado<EstadoLote>(azar, [['disponible', 9], ['reservado', 3], ['vendido', 6], ['bloqueado', 1]])
      lotes.push({
        id: `${manzana}-${String(n).padStart(2, '0')}`,
        manzana,
        numero: n,
        estado,
        area,
        frente: frenteReal,
        fondo: fondoReal,
        precio: Math.round((area * (preferente ? 520 : 430) + entero(azar, 0, 40) * 100) / 100) * 100,
        x: ox + columna * frente,
        y: oy + fila * fondo,
        preferente,
      })
    }
  })
  return lotes
}

export const LOTES: readonly Readonly<Lote>[] = Object.freeze(generar().map((l) => Object.freeze(l)))

/** Ancho y alto del plano completo, en metros, para encuadrar la cámara o el SVG. */
export const PLANO = Object.freeze({
  ancho: 4 * (10 * (LOTES_POR_MANZANA / 2)) + 3 * CALLE,
  alto: 2 * (20 * 2) + CALLE,
})

/** Cuántos lotes hay en cada estado. */
export function resumenLotes(lotes: readonly Lote[] = LOTES): Record<EstadoLote, number> {
  const resumen: Record<EstadoLote, number> = { disponible: 0, reservado: 0, vendido: 0, bloqueado: 0 }
  for (const lote of lotes) resumen[lote.estado]++
  return resumen
}

/** «S/ 127,300», con el separador de miles de es-PE. */
export function formatoSoles(monto: number): string {
  return `S/ ${new Intl.NumberFormat('es-PE', { maximumFractionDigits: 0 }).format(monto)}`
}
