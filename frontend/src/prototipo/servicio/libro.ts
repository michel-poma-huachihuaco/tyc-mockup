import {
  AVISO_VENTANA_DIAS,
  CANAL_ALERTAS,
  CODIGO_ESTABLECIMIENTO,
  DESTINATARIO_LEGAL,
  ESTADOS_ACTIVOS,
  NOMBRE_ESTADO_APELACION,
  PLAZO_LEGAL_DIAS,
  TIPOS_CON_LIBRO,
} from '../datos/catalogos.ts'
import type { EstadoApelacion } from '../datos/catalogos.ts'
import { diasHabilesEntre, fechaIso, sumarDiasHabiles } from './calendario.ts'
import { ErrorSimulado, actorDe, emitir, exigir, invalido, nuevoId, puede, ticketDe } from './nucleo.ts'
import type { CampoInvalido, Datos } from './nucleo.ts'

/**
 * Libro de Reclamaciones y apelaciones (ola 2: HU-ATC-012 a 016), sobre el mismo estado
 * que el núcleo y con las mismas reglas: funciones puras, bitácoras que solo crecen y
 * errores con la forma de ErrorAybar.
 */

// ── Modelo ──────────────────────────────────────────────────────────────────

export type TipoAsiento = 'QUEJA' | 'RECLAMO'
export type Moneda = 'PEN' | 'USD'

/** Un documento probatorio: en el backend iría a S3 con su checksum dentro del IntegrityHash. */
export interface Documento {
  readonly nombre: string
  readonly tamano: number
  readonly sha256: string
}

export interface Prorroga {
  readonly justificacion: string
  readonly canal: string
  readonly fechaComunicacion: Date
  readonly cargo: Documento
  readonly registrada: Date
  readonly autor: string
}

export interface Respuesta {
  readonly fecha: Date
  readonly resumen: string
  readonly firmante: string
  readonly carta: Documento
  readonly cargo: Documento
  readonly derechoIndecopi: boolean
  readonly diasHabilesUsados: number
  readonly autor: string
}

/** SVC_COMPLAINT_BOOK_ENTRY: extensión 1:1 del ticket. */
export interface Asiento {
  readonly id: string
  readonly ticketId: string
  /** Inmutable (RN-SVC-013): no hay operación que la cambie. */
  readonly empresaId: string
  readonly establecimiento: string
  /** SUPUESTO: `SIGLA-EST-0000`, correlativo por empresa y establecimiento (RN-SVC-004). */
  readonly codigo: string
  readonly tipo: TipoAsiento
  readonly hechos: string
  readonly pedido: string
  readonly monto: number | null
  readonly moneda: Moneda | null
  readonly registrado: Date
  readonly registradoPor: string
  readonly venceOriginal: Date
  readonly venceProrrogado: Date | null
  readonly prorroga: Prorroga | null
  readonly respuesta: Respuesta | null
}

/** Historial del plazo legal: cada cambio es una fila nueva (CA-02 de HU-ATC-013). */
export interface FilaPlazo {
  readonly id: string
  readonly asientoId: string
  readonly fecha: Date
  readonly evento: 'PLAZO_ORIGINAL' | 'PRORROGA' | 'RESPUESTA'
  readonly vence: Date | null
  readonly autor: string
  readonly detalle: string
}

export type Instancia = 'INTERNA' | 'INDECOPI'

export interface Apelacion {
  readonly id: string
  readonly asientoId: string
  readonly instancia: Instancia
  readonly numeroCaso: string | null
  readonly presentada: Date
  readonly estado: EstadoApelacion
  readonly resolucion: { readonly fecha: Date; readonly resumen: string } | null
}

export interface FilaApelacion {
  readonly id: string
  readonly apelacionId: string
  readonly fecha: Date
  readonly de: EstadoApelacion | null
  readonly a: EstadoApelacion
  readonly autor: string
  readonly nota: string | null
}

export type TipoAlertaLegal = 'LEGAL_EXTENSION_WINDOW_CLOSING' | 'LEGAL_RESPONSE_OVERDUE'

export interface AlertaLegal {
  readonly id: string
  readonly asientoId: string
  readonly tipo: TipoAlertaLegal
  readonly vencimientoEvaluado: Date
  readonly fecha: Date
  readonly destinatario: string
  readonly canal: string
}

/** GOV_INTEGRITY_EXCEPTION: ticket que exige asiento y no lo tiene al cierre del día. */
export interface ExcepcionIntegridad {
  readonly id: string
  readonly ticketId: string
  readonly tipo: 'ORPHAN_REFERENCE'
  readonly fechaControl: string
  readonly fecha: Date
}

// ── Consultas ───────────────────────────────────────────────────────────────

/** El vencimiento que manda: el prorrogado si existe (COALESCE; CA-03 de HU-ATC-015). */
export const venceLegalVigente = (a: Asiento) => a.venceProrrogado ?? a.venceOriginal

export type NivelPlazo = 'en-plazo' | 'por-vencer' | 'vencido' | 'respondido' | 'respondido-fuera'

export function estadoPlazo(a: Asiento, ahora: Date): { nivel: NivelPlazo; dias: number; vence: Date } {
  const vence = venceLegalVigente(a)
  if (a.respuesta) return { nivel: a.respuesta.fecha <= vence ? 'respondido' : 'respondido-fuera', dias: diasHabilesEntre(ahora, vence), vence }
  if (ahora > vence) return { nivel: 'vencido', dias: diasHabilesEntre(ahora, vence), vence }
  const dias = diasHabilesEntre(ahora, vence)
  return { nivel: dias <= AVISO_VENTANA_DIAS ? 'por-vencer' : 'en-plazo', dias, vence }
}

export const asientoDeTicket = (d: Datos, ticketId: string) => d.asientos.find((a) => a.ticketId === ticketId) ?? null

export const exigeAsiento = (tipoTicket: string) => TIPOS_CON_LIBRO.includes(tipoTicket)

/** Por qué no se puede prorrogar; null si se puede. */
export function motivoSinProrroga(a: Asiento, ahora: Date): string | null {
  if (a.respuesta) return 'El reclamo ya tiene respuesta.'
  if (a.prorroga) return 'Ya se usó la prórroga única: no se permite una segunda.'
  if (ahora > a.venceOriginal) return 'El plazo original venció: la prórroga tiene que comunicarse antes del vencimiento.'
  return null
}

const apelacionActiva = (d: Datos, asientoId: string) =>
  d.apelaciones.find((x) => x.asientoId === asientoId && (x.estado === 'PENDING' || x.estado === 'UNDER_REVIEW')) ?? null

/** Por qué no se puede apelar; null si se puede. */
export function motivoSinApelacion(d: Datos, a: Asiento): string | null {
  if (!a.respuesta) return 'Se apela una respuesta: este reclamo aún no la tiene.'
  if (d.apelaciones.some((x) => x.asientoId === a.id && x.estado === 'WITHDRAWN'))
    return 'El consumidor desistió de una apelación sobre esta respuesta: no se puede volver a apelar.'
  if (apelacionActiva(d, a.id)) return 'Ya hay una apelación en curso.'
  if (d.apelaciones.some((x) => x.asientoId === a.id && x.instancia === 'INDECOPI'))
    return 'Ya se apeló ante INDECOPI, la última instancia: no hay otra apelación.'
  return null
}

/** SUPUESTO: tras la segunda instancia interna solo queda INDECOPI. */
export const instanciaDisponible = (d: Datos, a: Asiento, i: Instancia) =>
  i === 'INDECOPI' || !d.apelaciones.some((x) => x.asientoId === a.id && x.instancia === 'INTERNA')

// ── Utilidades internas ─────────────────────────────────────────────────────

function asientoDe(d: Datos, id: string): Asiento {
  const a = d.asientos.find((x) => x.id === id)
  if (!a) throw new ErrorSimulado(404, 'no-encontrado', 'El asiento no existe.')
  return a
}

const conAsiento = (d: Datos, a: Asiento): Datos => ({ ...d, asientos: d.asientos.map((x) => (x.id === a.id ? a : x)) })

function filaPlazo(d: Datos, f: Omit<FilaPlazo, 'id'>): Datos {
  const [id, s] = nuevoId(d, 'fp')
  return { ...s, filasPlazo: [...s.filasPlazo, { id, ...f }] }
}

// ── Asiento (HU-ATC-012) ────────────────────────────────────────────────────

export interface EntradaAsiento {
  readonly tipo: TipoAsiento | ''
  readonly establecimiento: string
  readonly hechos: string
  readonly pedido: string
  readonly monto: number | null
  readonly moneda: Moneda | ''
}

export function registrarAsiento(d: Datos, ticketId: string, e: EntradaAsiento, actorId: string): [Datos, Asiento] {
  exigir(puede.registrarAsiento(actorDe(actorId).rol), 'registrar asientos del Libro de Reclamaciones')
  const t = ticketDe(d, ticketId)
  if (asientoDeTicket(d, ticketId)) throw new ErrorSimulado(409, 'asiento-existente', 'Este ticket ya tiene su asiento: es una relación uno a uno.')
  const campos: CampoInvalido[] = []
  if (!e.tipo) campos.push({ campo: 'tipo', mensaje: 'Elige si es queja o reclamo.' })
  if (!CODIGO_ESTABLECIMIENTO[e.establecimiento]) campos.push({ campo: 'establecimiento', mensaje: 'Elige el establecimiento: el correlativo corre por establecimiento.' })
  if (!e.hechos.trim()) campos.push({ campo: 'hechos', mensaje: 'Describe los hechos.' })
  if (!e.pedido.trim()) campos.push({ campo: 'pedido', mensaje: 'Escribe lo que pide el consumidor.' })
  if (e.monto !== null && !(e.monto > 0)) campos.push({ campo: 'monto', mensaje: 'El monto tiene que ser mayor que cero, o déjalo vacío.' })
  if (e.monto !== null && !e.moneda) campos.push({ campo: 'moneda', mensaje: 'Con monto reclamado, la moneda es obligatoria.' })
  if (campos.length) throw invalido(campos)

  const clave = `LIBRO|${t.empresaId}|${CODIGO_ESTABLECIMIENTO[e.establecimiento]}`
  const n = (d.secuencias[clave] ?? 0) + 1
  let [id, s] = nuevoId(d, 'as')
  const asiento: Asiento = {
    id,
    ticketId,
    empresaId: t.empresaId,
    establecimiento: e.establecimiento,
    codigo: `${t.empresaId}-${CODIGO_ESTABLECIMIENTO[e.establecimiento]}-${String(n).padStart(4, '0')}`,
    tipo: e.tipo as TipoAsiento,
    hechos: e.hechos.trim(),
    pedido: e.pedido.trim(),
    // CA-02: sin monto, monto y moneda quedan vacíos.
    monto: e.monto,
    moneda: e.monto === null ? null : (e.moneda as Moneda),
    registrado: d.ahora,
    registradoPor: actorId,
    venceOriginal: sumarDiasHabiles(d.ahora, PLAZO_LEGAL_DIAS),
    venceProrrogado: null,
    prorroga: null,
    respuesta: null,
  }
  s = { ...s, secuencias: { ...s.secuencias, [clave]: n }, asientos: [...s.asientos, asiento] }
  s = filaPlazo(s, { asientoId: id, fecha: d.ahora, evento: 'PLAZO_ORIGINAL', vence: asiento.venceOriginal, autor: actorId, detalle: `${PLAZO_LEGAL_DIAS} días hábiles desde el registro` })
  s = emitir(s, 'asiento_libro', { tipo: asiento.tipo, empresa: asiento.empresaId, establecimiento: CODIGO_ESTABLECIMIENTO[e.establecimiento] })
  return [s, asiento]
}

/** CA-03 de HU-ATC-012: la razón social del asiento no cambia nunca. */
export function cambiarEmpresaDeAsiento(asientoId: string): never {
  throw new ErrorSimulado(409, 'empresa-inmutable', `El asiento ${asientoId} no puede cambiar de razón social (RN-SVC-013).`, { auditar: true })
}

/** CA-02 de HU-ATC-013: un vencimiento (original o prorrogado) no se reescribe. */
export function modificarVencimiento(asientoId: string): never {
  throw new ErrorSimulado(409, 'vencimiento-inmutable', `El vencimiento del asiento ${asientoId} no se reescribe: cualquier cambio es una fila nueva en su historial.`, {
    auditar: true,
  })
}

// ── Prórroga única (HU-ATC-013) ─────────────────────────────────────────────

export interface EntradaProrroga {
  readonly justificacion: string
  readonly canal: string
  readonly fechaComunicacion: Date | null
  readonly cargo: Documento | null
}

export function prorrogar(d: Datos, asientoId: string, e: EntradaProrroga, actorId: string): Datos {
  exigir(puede.gestionarLibro(actorDe(actorId).rol), 'prorrogar el plazo legal')
  const a = asientoDe(d, asientoId)
  const razon = motivoSinProrroga(a, d.ahora)
  if (razon) throw new ErrorSimulado(409, a.prorroga ? 'prorroga-unica' : 'fuera-de-ventana', razon)
  const campos: CampoInvalido[] = []
  if (!e.justificacion.trim()) campos.push({ campo: 'justificacion', mensaje: 'Justifica la prórroga.' })
  if (!e.canal) campos.push({ campo: 'canal', mensaje: 'Elige el canal por el que se comunicó al consumidor.' })
  if (!e.fechaComunicacion) campos.push({ campo: 'fecha', mensaje: 'Indica cuándo se comunicó.' })
  else if (e.fechaComunicacion > a.venceOriginal) campos.push({ campo: 'fecha', mensaje: 'La comunicación tiene que ser anterior al vencimiento original.' })
  else if (e.fechaComunicacion > d.ahora) campos.push({ campo: 'fecha', mensaje: 'La comunicación no puede tener fecha futura.' })
  if (!e.cargo) campos.push({ campo: 'cargo', mensaje: 'Adjunta el cargo de la comunicación (PDF).' })
  if (campos.length) throw invalido(campos)

  const venceProrrogado = sumarDiasHabiles(a.venceOriginal, PLAZO_LEGAL_DIAS)
  let s = conAsiento(d, {
    ...a,
    venceProrrogado,
    prorroga: { justificacion: e.justificacion.trim(), canal: e.canal, fechaComunicacion: e.fechaComunicacion as Date, cargo: e.cargo as Documento, registrada: d.ahora, autor: actorId },
  })
  s = filaPlazo(s, { asientoId, fecha: d.ahora, evento: 'PRORROGA', vence: venceProrrogado, autor: actorId, detalle: `Prórroga única de ${PLAZO_LEGAL_DIAS} días hábiles · ${e.canal}` })
  return emitir(s, 'prorroga_registrada', { empresa: a.empresaId })
}

// ── Respuesta formal (HU-ATC-014) ───────────────────────────────────────────

export interface EntradaRespuesta {
  readonly resumen: string
  readonly firmante: string
  readonly carta: Documento | null
  readonly cargo: Documento | null
  readonly derechoIndecopi: boolean
}

export function responder(d: Datos, asientoId: string, e: EntradaRespuesta, actorId: string): Datos {
  exigir(puede.gestionarLibro(actorDe(actorId).rol), 'registrar la respuesta formal')
  const a = asientoDe(d, asientoId)
  if (a.respuesta) throw new ErrorSimulado(409, 'ya-respondido', 'El reclamo ya tiene su respuesta formal.')
  const campos: CampoInvalido[] = []
  if (!e.resumen.trim()) campos.push({ campo: 'resumen', mensaje: 'Resume la respuesta.' })
  if (!e.firmante) campos.push({ campo: 'firmante', mensaje: 'Elige quién firma la carta.' })
  if (!e.carta) campos.push({ campo: 'carta', mensaje: 'Adjunta la carta de respuesta (PDF).' })
  if (!e.cargo) campos.push({ campo: 'cargo', mensaje: 'Sin el cargo del consumidor no es una respuesta válida ante INDECOPI (RN-SVC-010).' })
  if (!e.derechoIndecopi) campos.push({ campo: 'indecopi', mensaje: 'Deja constancia de que se informó al consumidor su derecho a acudir a INDECOPI.' })
  if (campos.length) throw invalido(campos)

  const diasHabilesUsados = Math.max(0, diasHabilesEntre(a.registrado, d.ahora))
  let s = conAsiento(d, {
    ...a,
    respuesta: { fecha: d.ahora, resumen: e.resumen.trim(), firmante: e.firmante, carta: e.carta as Documento, cargo: e.cargo as Documento, derechoIndecopi: true, diasHabilesUsados, autor: actorId },
  })
  s = filaPlazo(s, { asientoId, fecha: d.ahora, evento: 'RESPUESTA', vence: null, autor: actorId, detalle: `Respondido en ${diasHabilesUsados} días hábiles` })
  return emitir(s, 'respuesta_libro', { días_hábiles_usados: diasHabilesUsados })
}

// ── Apelaciones (HU-ATC-016) ────────────────────────────────────────────────

export const TRANSICIONES_APELACION: Readonly<Record<EstadoApelacion, readonly EstadoApelacion[]>> = {
  PENDING: ['UNDER_REVIEW', 'WITHDRAWN'],
  UNDER_REVIEW: ['RESOLVED_FOUNDED', 'RESOLVED_UNFOUNDED', 'WITHDRAWN'],
  RESOLVED_FOUNDED: [],
  RESOLVED_UNFOUNDED: [],
  WITHDRAWN: [],
}

export const esResolucion = (e: EstadoApelacion) => e === 'RESOLVED_FOUNDED' || e === 'RESOLVED_UNFOUNDED'

export interface EntradaApelacion {
  readonly instancia: Instancia | ''
  readonly numeroCaso: string
  readonly presentada: Date | null
}

export function registrarApelacion(d: Datos, asientoId: string, e: EntradaApelacion, actorId: string): Datos {
  exigir(puede.gestionarLibro(actorDe(actorId).rol), 'registrar apelaciones')
  const a = asientoDe(d, asientoId)
  const razon = motivoSinApelacion(d, a)
  if (razon) throw new ErrorSimulado(409, 'apelacion-no-permitida', razon)
  const campos: CampoInvalido[] = []
  if (!e.instancia) campos.push({ campo: 'instancia', mensaje: 'Elige la instancia.' })
  else if (!instanciaDisponible(d, a, e.instancia)) campos.push({ campo: 'instancia', mensaje: 'La segunda instancia interna ya se usó: la siguiente es INDECOPI.' })
  if (e.instancia === 'INDECOPI' && !e.numeroCaso.trim()) campos.push({ campo: 'caso', mensaje: 'Ante INDECOPI, el número de expediente es obligatorio.' })
  if (!e.presentada) campos.push({ campo: 'presentada', mensaje: 'Indica cuándo se presentó.' })
  else if (e.presentada > d.ahora) campos.push({ campo: 'presentada', mensaje: 'La fecha no puede ser futura.' })
  if (campos.length) throw invalido(campos)

  let [id, s] = nuevoId(d, 'ap')
  s = {
    ...s,
    apelaciones: [...s.apelaciones, { id, asientoId, instancia: e.instancia as Instancia, numeroCaso: e.numeroCaso.trim() || null, presentada: e.presentada as Date, estado: 'PENDING', resolucion: null }],
  }
  let idFila: string
  ;[idFila, s] = nuevoId(s, 'fap')
  s = { ...s, filasApelacion: [...s.filasApelacion, { id: idFila, apelacionId: id, fecha: d.ahora, de: null, a: 'PENDING', autor: actorId, nota: null }] }
  return emitir(s, 'apelación_estado', { instancia: e.instancia, estado: 'PENDING' })
}

export interface EntradaEstadoApelacion {
  readonly numeroCaso: string
  readonly fechaResolucion: Date | null
  readonly resumen: string
  readonly nota: string
}

export function cambiarEstadoApelacion(d: Datos, apelacionId: string, a: EstadoApelacion, e: EntradaEstadoApelacion, actorId: string): Datos {
  exigir(puede.gestionarLibro(actorDe(actorId).rol), 'actualizar apelaciones')
  const ap = d.apelaciones.find((x) => x.id === apelacionId)
  if (!ap) throw new ErrorSimulado(404, 'no-encontrado', 'La apelación no existe.')
  if (!TRANSICIONES_APELACION[ap.estado].includes(a))
    throw new ErrorSimulado(409, 'transicion-invalida', `Una apelación «${NOMBRE_ESTADO_APELACION[ap.estado]}» no pasa a «${NOMBRE_ESTADO_APELACION[a]}».`)
  const campos: CampoInvalido[] = []
  const numeroCaso = e.numeroCaso.trim() || ap.numeroCaso
  if (esResolucion(a)) {
    if (ap.instancia === 'INDECOPI' && !numeroCaso) campos.push({ campo: 'caso', mensaje: 'Registra el número de expediente de INDECOPI.' })
    if (!e.fechaResolucion) campos.push({ campo: 'fecha', mensaje: 'Indica la fecha de la resolución.' })
    else if (e.fechaResolucion > d.ahora) campos.push({ campo: 'fecha', mensaje: 'La fecha no puede ser futura.' })
    if (!e.resumen.trim()) campos.push({ campo: 'resumen', mensaje: 'Resume la resolución.' })
  }
  if (campos.length) throw invalido(campos)

  const nueva = {
    ...ap,
    estado: a,
    numeroCaso,
    resolucion: esResolucion(a) ? { fecha: e.fechaResolucion as Date, resumen: e.resumen.trim() } : ap.resolucion,
  }
  let [id, s] = nuevoId(d, 'fap')
  s = { ...s, apelaciones: s.apelaciones.map((x) => (x.id === ap.id ? nueva : x)) }
  s = { ...s, filasApelacion: [...s.filasApelacion, { id, apelacionId, fecha: d.ahora, de: ap.estado, a, autor: actorId, nota: e.nota.trim() || null }] }
  return emitir(s, 'apelación_estado', { instancia: ap.instancia, estado: a })
}

// ── Job legal y control de huérfanos (HU-ATC-015) ───────────────────────────

export interface EjecucionLegal {
  readonly alertasNuevas: number
  readonly alertasOmitidas: number
  readonly huerfanosNuevos: number
}

export function ejecutarControlesLegales(d: Datos): [Datos, EjecucionLegal] {
  let s = d
  let alertasNuevas = 0
  let alertasOmitidas = 0
  let huerfanosNuevos = 0
  const ya = new Set(d.alertasLegales.map((x) => `${x.asientoId}|${x.tipo}|${x.vencimientoEvaluado.getTime()}`))
  for (const a of d.asientos) {
    if (a.respuesta) continue
    const candidatas: Array<[TipoAlertaLegal, Date]> = []
    // CA-01: no exige política comercial; solo el plazo legal.
    if (!a.prorroga && d.ahora <= a.venceOriginal && diasHabilesEntre(d.ahora, a.venceOriginal) <= AVISO_VENTANA_DIAS)
      candidatas.push(['LEGAL_EXTENSION_WINDOW_CLOSING', a.venceOriginal])
    // CA-03: el vencimiento prorrogado manda.
    if (d.ahora > venceLegalVigente(a)) candidatas.push(['LEGAL_RESPONSE_OVERDUE', venceLegalVigente(a)])
    for (const [tipo, vence] of candidatas) {
      const clave = `${a.id}|${tipo}|${vence.getTime()}`
      if (ya.has(clave)) {
        alertasOmitidas++
        continue
      }
      ya.add(clave)
      let id: string
      ;[id, s] = nuevoId(s, 'al')
      s = { ...s, alertasLegales: [...s.alertasLegales, { id, asientoId: a.id, tipo, vencimientoEvaluado: vence, fecha: d.ahora, destinatario: DESTINATARIO_LEGAL, canal: CANAL_ALERTAS }] }
      s = emitir(s, 'alerta_legal', { tipo })
      alertasNuevas++
    }
  }
  // CA-02: ticket activo que exige asiento, abierto antes de hoy y sin asiento. SUPUESTO:
  // el control corre con cada job y deja una excepción por ticket y día.
  const hoy = fechaIso(d.ahora)
  const inicioHoy = new Date(d.ahora)
  inicioHoy.setHours(0, 0, 0, 0)
  const conAsientoYa = new Set(s.asientos.map((a) => a.ticketId))
  const registradas = new Set(s.excepciones.map((x) => `${x.ticketId}|${x.fechaControl}`))
  for (const t of d.tickets) {
    if (!exigeAsiento(t.tipo) || !ESTADOS_ACTIVOS.includes(t.estado) || conAsientoYa.has(t.id) || t.abierto >= inicioHoy) continue
    if (registradas.has(`${t.id}|${hoy}`)) continue
    let id: string
    ;[id, s] = nuevoId(s, 'gie')
    s = { ...s, excepciones: [...s.excepciones, { id, ticketId: t.id, tipo: 'ORPHAN_REFERENCE', fechaControl: hoy, fecha: d.ahora }] }
    s = emitir(s, 'huerfano_detectado', { tipo: t.tipo })
    huerfanosNuevos++
  }
  return [s, { alertasNuevas, alertasOmitidas, huerfanosNuevos }]
}

/** Huérfanos detectados en el día del reloj. */
export const huerfanosDeHoy = (d: Datos) => d.excepciones.filter((x) => x.fechaControl === fechaIso(d.ahora))
