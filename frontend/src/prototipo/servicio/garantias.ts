import { cliente } from '../datos/clientes.ts'
import { ErrorSimulado, actorDe, emitir, exigir, invalido, nuevoId, senalesActivas, ticketDe } from './nucleo.ts'
import type { CampoInvalido, Datos } from './nucleo.ts'
import type { Documento } from './libro.ts'
import { ROLES_EXTERNOS } from '../datos/catalogos.ts'
import type { Persona } from '../datos/catalogos.ts'

/**
 * Garantías postventa (ola 4: HU-ATC-033 a 036). El reclamo siempre cuelga de un Acta de
 * Entrega (CONTRACT_UNIT_HANDOVER) y solo es procedente dentro de la cobertura (RN-SVC-027).
 * Las actas son datos ficticios fijos; los reclamos son estado del prototipo.
 */

export const TIPOS_GARANTIA = ['ESTRUCTURAL', 'IMPERMEABILIZACION', 'ACABADOS', 'INSTALACIONES'] as const
export type TipoGarantia = (typeof TIPOS_GARANTIA)[number]
export const NOMBRE_TIPO_GARANTIA: Record<TipoGarantia, string> = {
  ESTRUCTURAL: 'Estructural',
  IMPERMEABILIZACION: 'Impermeabilización',
  ACABADOS: 'Acabados',
  INSTALACIONES: 'Instalaciones',
}
/** SUPUESTO (pregunta abierta de FT-ATC-10): meses de cobertura por tipo de defecto, desde la entrega. */
export const COBERTURA_MESES: Record<TipoGarantia, number> = { ESTRUCTURAL: 120, IMPERMEABILIZACION: 12, ACABADOS: 12, INSTALACIONES: 12 }

export interface Entrega {
  readonly id: string
  readonly unidad: string
  readonly clienteId: string
  readonly entregada: Date
}

/** Actas de entrega ficticias (CONTRACT_UNIT_HANDOVER). */
export const ENTREGAS: readonly Entrega[] = [
  { id: 'ACT-0412', unidad: 'Residencial Brisas · Torre B 402', clienteId: 'cli-015', entregada: new Date(2025, 10, 14) },
  { id: 'ACT-0388', unidad: 'Residencial Brisas · Torre A 101', clienteId: 'cli-035', entregada: new Date(2024, 2, 2) },
  { id: 'ACT-0301', unidad: 'Residencial Brisas · Torre A 305', clienteId: 'cli-036', entregada: new Date(2023, 5, 20) },
  { id: 'ACT-0455', unidad: 'Residencial Brisas · Torre C 201', clienteId: 'cli-037', entregada: new Date(2026, 1, 10) },
  { id: 'ACT-0437', unidad: 'Villa Sol II · Casa Mz. C Lt. 14', clienteId: 'cli-001', entregada: new Date(2025, 7, 5) },
]
export const entregaDe = (id: string) => ENTREGAS.find((e) => e.id === id) ?? null

export type EstadoGarantia = 'UNDER_REVIEW' | 'NOT_ELIGIBLE' | 'APPROVED' | 'REJECTED' | 'RESOLVED'
export const NOMBRE_ESTADO_GARANTIA: Record<EstadoGarantia, string> = {
  UNDER_REVIEW: 'En revisión',
  NOT_ELIGIBLE: 'No procedente',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
  RESOLVED: 'Resuelto',
}

export interface Inspeccion {
  readonly programada: Date
  readonly informe: string | null
  readonly evidencias: readonly Documento[]
  readonly registrada: Date | null
}

export interface Garantia {
  readonly id: string
  /** SUPUESTO: `GAR-0000`. */
  readonly codigo: string
  readonly entregaId: string
  readonly ticketId: string | null
  readonly tipo: TipoGarantia
  readonly descripcion: string
  readonly reclamada: Date
  readonly registradoPor: string
  readonly estado: EstadoGarantia
  readonly motivoNoProcede: string | null
  readonly inspeccion: Inspeccion | null
  readonly resolucion: { readonly fecha: Date; readonly descripcion: string; readonly autor: string } | null
  readonly adenda: { readonly fecha: Date; readonly motivo: string; readonly documento: Documento; readonly autor: string } | null
}

export interface FilaGarantia {
  readonly id: string
  readonly garantiaId: string
  readonly fecha: Date
  readonly evento: string
  readonly autor: string
  readonly detalle: string | null
}

// ── Consultas ───────────────────────────────────────────────────────────────

const sumarMeses = (d: Date, n: number) => {
  const r = new Date(d)
  r.setMonth(r.getMonth() + n)
  return r
}

/** Hasta cuándo cubre la garantía de un tipo desde la entrega real. */
export const venceCobertura = (e: Entrega, tipo: TipoGarantia) => sumarMeses(e.entregada, COBERTURA_MESES[tipo])
export const dentroDeCobertura = (e: Entrega, tipo: TipoGarantia, fecha: Date) => fecha <= venceCobertura(e, tipo)

/** SUPUESTO: gestionan los reclamos Postventa y el supervisor ATC; el resto de atención los consulta. */
export const puedeGestionarGarantias = (p: Persona) => p.rol === 'SUPERVISOR' || (p.rol === 'COLABORADOR' && p.area === 'POSTVENTA')
export const puedeVerGarantias = (p: Persona) => !ROLES_EXTERNOS.includes(p.rol)

export const garantiaDe = (d: Datos, id: string) => d.garantias.find((g) => g.id === id) ?? null
export const enConflicto = (d: Datos, g: Garantia) => {
  if (!g.ticketId) return false
  const t = d.tickets.find((x) => x.id === g.ticketId)
  return Boolean(t && t.eje !== 3 && senalesActivas(d, t.id).length)
}

function garantia(d: Datos, id: string): Garantia {
  const g = garantiaDe(d, id)
  if (!g) throw new ErrorSimulado(404, 'no-encontrado', 'El reclamo de garantía no existe.')
  return g
}

const conGarantia = (d: Datos, g: Garantia): Datos => ({ ...d, garantias: d.garantias.map((x) => (x.id === g.id ? g : x)) })

function fila(d: Datos, garantiaId: string, evento: string, autor: string, detalle: string | null = null): Datos {
  const [id, s] = nuevoId(d, 'fg')
  return { ...s, filasGarantia: [...s.filasGarantia, { id, garantiaId, fecha: d.ahora, evento, autor, detalle }] }
}

function gestionar(d: Datos, actorId: string, accion: string) {
  void d
  exigir(puedeGestionarGarantias(actorDe(actorId)), accion)
}

// ── Registro y vigencia (HU-ATC-033, 034) ───────────────────────────────────

export interface EntradaGarantia {
  readonly entregaId: string
  readonly tipo: TipoGarantia | ''
  readonly descripcion: string
  readonly ticketId: string
  readonly reclamada: Date | null
}

export function registrarGarantia(d: Datos, e: EntradaGarantia, actorId: string): [Datos, Garantia] {
  gestionar(d, actorId, 'registrar reclamos de garantía')
  const campos: CampoInvalido[] = []
  const entrega = entregaDe(e.entregaId)
  if (!entrega) campos.push({ campo: 'entrega', mensaje: 'Sin Acta de Entrega no hay reclamo de garantía: elige la entrega.' })
  if (!TIPOS_GARANTIA.includes(e.tipo as TipoGarantia)) campos.push({ campo: 'tipo', mensaje: 'Elige un tipo del catálogo: estructural, impermeabilización, acabados o instalaciones.' })
  if (!e.descripcion.trim()) campos.push({ campo: 'descripcion', mensaje: 'Describe el defecto.' })
  if (!e.reclamada) campos.push({ campo: 'fecha', mensaje: 'Indica la fecha del reclamo.' })
  else if (e.reclamada > d.ahora) campos.push({ campo: 'fecha', mensaje: 'La fecha del reclamo no puede ser futura.' })
  else if (entrega && e.reclamada < entrega.entregada) campos.push({ campo: 'fecha', mensaje: 'El reclamo no puede ser anterior a la entrega.' })
  if (e.ticketId && !d.tickets.some((t) => t.id === e.ticketId)) campos.push({ campo: 'ticket', mensaje: 'Ese ticket no existe.' })
  if (campos.length) throw invalido(campos)
  if (e.ticketId) ticketDe(d, e.ticketId)

  const ent = entrega as Entrega
  const tipo = e.tipo as TipoGarantia
  const procede = dentroDeCobertura(ent, tipo, e.reclamada as Date)
  const n = (d.secuencias.GAR ?? 0) + 1
  let [id, s] = nuevoId({ ...d, secuencias: { ...d.secuencias, GAR: n } }, 'gar')
  const g: Garantia = {
    id,
    codigo: `GAR-${String(n).padStart(4, '0')}`,
    entregaId: ent.id,
    ticketId: e.ticketId || null,
    tipo,
    descripcion: e.descripcion.trim(),
    reclamada: e.reclamada as Date,
    registradoPor: actorId,
    estado: procede ? 'UNDER_REVIEW' : 'NOT_ELIGIBLE',
    motivoNoProcede: procede
      ? null
      : `La cobertura de ${NOMBRE_TIPO_GARANTIA[tipo].toLowerCase()} (${COBERTURA_MESES[tipo]} meses desde la entrega del ${ent.entregada.toLocaleDateString('es-PE')}) venció el ${venceCobertura(ent, tipo).toLocaleDateString('es-PE')}.`,
    inspeccion: null,
    resolucion: null,
    adenda: null,
  }
  s = { ...s, garantias: [...s.garantias, g] }
  s = fila(s, id, 'REGISTRO', actorId, `Vinculado al acta ${ent.id}`)
  if (procede) return [emitir(s, 'garantía_registrada', { tipo }), g]
  s = fila(s, id, 'NO_PROCEDENTE', 'Sistema', g.motivoNoProcede)
  return [emitir(emitir(s, 'garantía_registrada', { tipo }), 'garantía_no_procedente', { tipo }), g]
}

// ── Inspección y resolución (HU-ATC-035) ────────────────────────────────────

export function programarInspeccion(d: Datos, garantiaId: string, fecha: Date | null, actorId: string): Datos {
  gestionar(d, actorId, 'programar inspecciones')
  const g = garantia(d, garantiaId)
  if (g.estado !== 'UNDER_REVIEW') throw new ErrorSimulado(409, 'estado-invalido', 'La inspección se programa en un reclamo en revisión.')
  if (g.inspeccion) throw new ErrorSimulado(409, 'ya-programada', 'La inspección ya está programada.')
  if (!fecha) throw invalido([{ campo: 'fecha', mensaje: 'Indica la fecha de la inspección.' }])
  const s = conGarantia(d, { ...g, inspeccion: { programada: fecha, informe: null, evidencias: [], registrada: null } })
  return fila(s, garantiaId, 'INSPECCION_PROGRAMADA', actorId, `Para el ${fecha.toLocaleDateString('es-PE')}`)
}

export function registrarInspeccion(d: Datos, garantiaId: string, e: { readonly informe: string; readonly evidencias: readonly Documento[] }, actorId: string): Datos {
  gestionar(d, actorId, 'registrar inspecciones')
  const g = garantia(d, garantiaId)
  if (!g.inspeccion || g.inspeccion.registrada) throw new ErrorSimulado(409, 'sin-inspeccion', 'No hay una inspección programada pendiente de registrar.')
  const campos: CampoInvalido[] = []
  if (!e.informe.trim()) campos.push({ campo: 'informe', mensaje: 'Escribe el informe de la inspección.' })
  if (!e.evidencias.length) campos.push({ campo: 'fotos', mensaje: 'Adjunta al menos una foto o documento de la inspección.' })
  if (campos.length) throw invalido(campos)
  const s = conGarantia(d, { ...g, inspeccion: { ...g.inspeccion, informe: e.informe.trim(), evidencias: e.evidencias, registrada: d.ahora } })
  return emitir(fila(s, garantiaId, 'INSPECCION_REGISTRADA', actorId, `${e.evidencias.length} archivos`), 'inspección_registrada', { evidencias: e.evidencias.length })
}

export function resolverGarantia(d: Datos, garantiaId: string, a: 'APPROVED' | 'REJECTED' | 'RESOLVED' | '', descripcion: string, actorId: string): Datos {
  gestionar(d, actorId, 'resolver reclamos de garantía')
  const g = garantia(d, garantiaId)
  if (g.estado !== 'UNDER_REVIEW' && !(g.estado === 'APPROVED' && a === 'RESOLVED'))
    throw new ErrorSimulado(409, 'estado-invalido', `Un reclamo «${NOMBRE_ESTADO_GARANTIA[g.estado]}» no se resuelve.`)
  // RN-SVC-021: un conflicto no se resuelve en Eje 1/2; se deriva a Eje 3 (CA-01 de HU-ATC-036).
  if (enConflicto(d, g)) throw new ErrorSimulado(409, 'gate-conflicto', 'El ticket tiene señal de conflicto: no se resuelve en Postventa (Eje 2). Deriva a Eje 3 (RN-SVC-021).', { auditar: true })
  if (!g.inspeccion?.registrada) throw new ErrorSimulado(409, 'sin-inspeccion', 'Primero se registra la inspección técnica con su informe y fotos.')
  const campos: CampoInvalido[] = []
  if (!a) campos.push({ campo: 'estado', mensaje: 'Elige cómo se resuelve: aprobado, rechazado o resuelto.' })
  if (!descripcion.trim()) campos.push({ campo: 'descripcion', mensaje: 'Describe la resolución.' })
  if (campos.length) throw invalido(campos)
  const s = conGarantia(d, { ...g, estado: a as EstadoGarantia, resolucion: { fecha: d.ahora, descripcion: descripcion.trim(), autor: actorId } })
  return fila(s, garantiaId, a as string, actorId, descripcion.trim())
}

// ── Adenda (HU-ATC-036 CA-02) ───────────────────────────────────────────────

export function registrarAdenda(d: Datos, garantiaId: string, e: { readonly motivo: string; readonly documento: Documento | null }, actorId: string): Datos {
  gestionar(d, actorId, 'registrar adendas')
  const g = garantia(d, garantiaId)
  if (g.estado === 'NOT_ELIGIBLE') throw new ErrorSimulado(409, 'estado-invalido', 'Un reclamo no procedente no tiene adenda.')
  if (g.adenda) throw new ErrorSimulado(409, 'ya-registrada', 'La adenda ya está registrada.')
  const campos: CampoInvalido[] = []
  if (!e.motivo.trim()) campos.push({ campo: 'motivo', mensaje: 'Explica la reincorporación contractual tras la devolución.' })
  if (!e.documento) campos.push({ campo: 'documento', mensaje: 'Adjunta la adenda firmada (PDF); la redacta Legal.' })
  if (campos.length) throw invalido(campos)
  const s = conGarantia(d, { ...g, adenda: { fecha: d.ahora, motivo: e.motivo.trim(), documento: e.documento as Documento, autor: actorId } })
  return fila(s, garantiaId, 'ADENDA', actorId, e.motivo.trim())
}

export const nombreCliente = (e: Entrega) => cliente(e.clienteId)?.nombre ?? '—'
