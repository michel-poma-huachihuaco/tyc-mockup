import { CLIENTES } from './clientes.ts'
import type { Cliente } from './clientes.ts'

/**
 * Lo que las fuentes del cliente devuelven en la consulta 360 (HU-ATC-050), simulado y
 * determinista: lotes y contratos (SIGDA/TAXON), cuotas (Cobranza), correos y documentos
 * (repositorios). No se copia al servicio: se calcula al consultar, como la consulta en
 * línea del paquete (RN-SVC-026). Todo sintético.
 */

export interface Lote {
  readonly id: string
  readonly descripcion: string
  readonly precio: number
  readonly contrato: string
  readonly firmado: Date
  readonly estado: 'Vigente' | 'Cancelado'
}

export interface Cuota {
  readonly n: number
  readonly vence: Date
  readonly monto: number
  readonly estado: 'Pagada' | 'Pendiente' | 'Vencida'
}

export interface EstadoCuenta {
  readonly loteId: string
  readonly cuotas: readonly Cuota[]
  readonly pagadas: number
  readonly saldo: number
  readonly proxima: Cuota | null
  readonly ultimoPago: Date | null
  readonly diasMora: number
}

export interface CorreoCliente {
  readonly id: string
  readonly fecha: Date
  readonly sentido: 'Recibido' | 'Enviado'
  readonly asunto: string
}

export interface DocumentoCliente {
  readonly id: string
  readonly titulo: string
  readonly tipo: string
  readonly fecha: Date
  readonly texto: string
  /** RN-SVC-036: documentos que solo ve quien tiene permiso (supervisión y legal). */
  readonly sensible: boolean
}

const DIA = 86_400_000
const indice = (c: Cliente) => CLIENTES.findIndex((x) => x.id === c.id)
export const moroso = (c: Cliente) => indice(c) % 4 === 1
export const indiceDe = indice

export function lotesDe(c: Cliente): Lote[] {
  const i = indice(c)
  return c.proyectos.map((p, k) => ({
    id: `${c.id}-L${k + 1}`,
    descripcion: p,
    precio: 42_000 + ((i * 7 + k * 3) % 11) * 3_500,
    contrato: `CV-${String(2024_000 + i * 10 + k)}`,
    firmado: new Date(2024, 2 + ((i + k) % 9), 5 + ((i * 3) % 20)),
    estado: 'Vigente',
  }))
}

/** 36 cuotas mensuales; en un cliente moroso las tres últimas vencidas siguen impagas. */
export function estadoDeCuenta(c: Cliente, lote: Lote, ahora: Date, regularizado = false): EstadoCuenta {
  const cuota = Math.round((lote.precio * 0.9) / 36)
  const impagas = moroso(c) && !regularizado ? 3 : 0
  const vencidas = Array.from({ length: 36 }, (_, k) => new Date(lote.firmado.getFullYear(), lote.firmado.getMonth() + k + 1, 5)).filter((v) => v < ahora).length
  const cuotas: Cuota[] = Array.from({ length: 36 }, (_, k) => {
    const vence = new Date(lote.firmado.getFullYear(), lote.firmado.getMonth() + k + 1, 5)
    const pagada = k < vencidas - impagas
    return { n: k + 1, vence, monto: cuota, estado: pagada ? 'Pagada' : vence < ahora ? 'Vencida' : 'Pendiente' }
  })
  const pagadas = cuotas.filter((q) => q.estado === 'Pagada')
  const proxima = cuotas.find((q) => q.estado !== 'Pagada') ?? null
  const venc = cuotas.filter((q) => q.estado === 'Vencida')
  return {
    loteId: lote.id,
    cuotas,
    pagadas: pagadas.length,
    saldo: cuotas.filter((q) => q.estado !== 'Pagada').length * cuota,
    proxima,
    ultimoPago: pagadas.at(-1)?.vence ?? null,
    diasMora: venc.length ? Math.floor((ahora.getTime() - venc[0].vence.getTime()) / DIA) : 0,
  }
}

export function correosDe(c: Cliente, ahora: Date): CorreoCliente[] {
  const i = indice(c)
  const asuntos: Array<[CorreoCliente['sentido'], string]> = [
    ['Recibido', 'Consulta por el cronograma de pagos'],
    ['Enviado', 'Re: Consulta por el cronograma de pagos'],
    ['Recibido', 'Solicitud de constancia de no adeudo'],
    ['Enviado', 'Constancia de pago de la cuota vigente'],
  ]
  return asuntos.slice(0, 2 + (i % 3)).map(([sentido, asunto], k) => ({ id: `${c.id}-C${k + 1}`, fecha: new Date(ahora.getTime() - (k * 6 + 3 + (i % 5)) * DIA), sentido, asunto })).reverse()
}

export function documentosDe(c: Cliente): DocumentoCliente[] {
  const i = indice(c)
  const lote = lotesDe(c)[0]
  const docs: DocumentoCliente[] = [
    {
      id: `${c.id}-D1`,
      titulo: `Contrato de compraventa ${lote.contrato}`,
      tipo: 'Contrato',
      fecha: lote.firmado,
      texto: `Contrato de compraventa del lote ${lote.descripcion}. El comprador pagará el precio en 36 cuotas mensuales. El incumplimiento de tres cuotas faculta a la empresa a resolver el contrato y aplicar la penalidad pactada.`,
      sensible: false,
    },
    {
      id: `${c.id}-D2`,
      titulo: 'Cronograma de pagos',
      tipo: 'Cronograma',
      fecha: lote.firmado,
      texto: 'Cronograma de pagos con el detalle de las 36 cuotas, sus fechas de vencimiento y el interés moratorio aplicable por cada día de atraso en el abono.',
      sensible: false,
    },
    {
      id: `${c.id}-D3`,
      titulo: 'Constancia de pago de cuotas',
      tipo: 'Constancia',
      fecha: new Date(2026, 8, 12),
      texto: 'Constancia emitida por Cobranza que acredita los depósitos registrados a la fecha y la cancelación de las cuotas vencidas hasta el mes anterior.',
      sensible: false,
    },
  ]
  if (i % 3 === 0)
    docs.push({
      id: `${c.id}-D4`,
      titulo: 'Adenda de reubicación de lote',
      tipo: 'Adenda',
      fecha: new Date(2025, 5, 18),
      texto: 'Adenda por la cual se modifica el contrato y se reubica al comprador en otro lote del mismo proyecto por observaciones técnicas del terreno original, sin variar el precio total pactado.',
      sensible: false,
    })
  if (i % 4 === 1)
    docs.push({
      id: `${c.id}-D5`,
      titulo: 'Carta notarial de requerimiento',
      tipo: 'Carta notarial',
      fecha: new Date(2026, 8, 28),
      texto: 'Carta notarial que requiere el pago de las cuotas vencidas en un plazo de quince días bajo apercibimiento de resolver el contrato por incumplimiento.',
      sensible: true,
    })
  return docs
}

// ── Búsqueda por significado (HU-ATC-053), simulada con sinónimos ───────────

const sinTildes = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
const PARADAS = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'un', 'una', 'por', 'para', 'con', 'en', 'y', 'o', 'a', 'que', 'se', 'su', 'al'])
const palabras = (s: string) => sinTildes(s).split(/[^a-zñ0-9]+/).filter((p) => p.length > 1 && !PARADAS.has(p))

/** Grupos de palabras que significan lo mismo; el modelo real de red neuronal vive fuera del alcance (DEP-14). */
const SINONIMOS: readonly (readonly string[])[] = [
  ['adenda', 'modificacion', 'anexo', 'enmienda'],
  ['cambio', 'reubicacion', 'traslado', 'permuta', 'reubica'],
  ['lote', 'terreno', 'predio', 'parcela'],
  ['resolver', 'resolucion', 'rescision', 'anular', 'terminar'],
  ['penalidad', 'multa', 'recargo'],
  ['mora', 'atraso', 'retraso', 'moratorio', 'incumplimiento', 'impago'],
  ['pago', 'cuota', 'cancelacion', 'abono', 'deposito', 'depositos'],
  ['contrato', 'compraventa', 'minuta'],
  ['carta', 'notarial', 'requerimiento', 'notificacion'],
  ['constancia', 'certificado', 'acredita'],
]

const grupoDe = (p: string) => SINONIMOS.findIndex((g) => g.includes(p) || g.some((x) => p.startsWith(x) && x.length > 4))

export interface ResultadoDocumento {
  readonly documento: DocumentoCliente
  readonly relevancia: number
  readonly fragmento: string
}

/** Documentos del cliente por significado; los restringidos al rol ya vienen filtrados. */
export function buscarPorSignificado(docs: readonly DocumentoCliente[], consulta: string): ResultadoDocumento[] {
  const q = palabras(consulta)
  if (!q.length) return []
  const resultados: ResultadoDocumento[] = []
  for (const documento of docs) {
    const base = palabras(`${documento.titulo} ${documento.texto}`)
    const grupos = new Set(base.map(grupoDe).filter((g) => g >= 0))
    const puntos = q.reduce((suma, p) => (base.includes(p) ? suma + 1 : grupoDe(p) >= 0 && grupos.has(grupoDe(p)) ? suma + 0.6 : suma), 0)
    const relevancia = Math.round((puntos / q.length) * 100)
    if (relevancia < 30) continue
    const frases = documento.texto.split(/(?<=\.)\s+/)
    const mejor = [...frases].sort((a, b) => puntosDe(b, q) - puntosDe(a, q))[0] ?? documento.texto
    resultados.push({ documento, relevancia: Math.min(relevancia, 99), fragmento: mejor })
  }
  return resultados.sort((a, b) => b.relevancia - a.relevancia)
}

function puntosDe(frase: string, q: string[]) {
  const base = palabras(frase)
  const grupos = new Set(base.map(grupoDe).filter((g) => g >= 0))
  return q.reduce((s, p) => (base.includes(p) ? s + 1 : grupoDe(p) >= 0 && grupos.has(grupoDe(p)) ? s + 0.6 : s), 0)
}

/** CA-03: sin coincidencias, se sugieren palabras exactas que sí están en los documentos visibles. */
export function sugerenciasExactas(docs: readonly DocumentoCliente[]): string[] {
  return [...new Set(docs.flatMap((d) => d.titulo.split(/\s+/)).map((p) => sinTildes(p)).filter((p) => p.length > 5))].slice(0, 5)
}
