import { ESTADOS_ACTIVOS, NOMBRE_NIVEL_RIESGO, ROLES_EXTERNOS } from '../datos/catalogos.ts'
import type { NivelRiesgo, Persona } from '../datos/catalogos.ts'
import { ErrorSimulado, actorDe, crearTicket, emitir, estadoSla, exigir, invalido, nuevoId, ticketDe } from './nucleo.ts'
import type { CampoInvalido, Datos } from './nucleo.ts'

/**
 * Ola 5: UrbeMind (HU-ATC-017 y 018), Calidad y Torre de Control CX (019, 030, 031 y 032)
 * y EntregaFest en vivo (037, 038 y 039). Funciones puras sobre el mismo estado.
 */

// ── UrbeMind (HU-ATC-017, 018) ──────────────────────────────────────────────

/** Contratos ficticios. CA-01 de HU-ATC-017: solo los de tipo CITY_SERVICE_FEE se vinculan. */
export const CONTRATOS = [
  { id: 'CSF-2026-0113', tipo: 'CITY_SERVICE_FEE', detalle: 'Cuota de servicios de ciudad · Ciudad Aybar Norte · Parque 4' },
  { id: 'CSF-2026-0147', tipo: 'CITY_SERVICE_FEE', detalle: 'Cuota de servicios de ciudad · Ciudad Aybar Norte · Mz. K' },
  { id: 'CTR-2024-0871', tipo: 'COMPRAVENTA', detalle: 'Compraventa de lote · Villa Sol II · Mz. C Lt. 14' },
] as const

export interface VinculoCiudad {
  readonly ticketId: string
  readonly contratoId: string
  readonly fecha: Date
  readonly autor: string
}

export type Credencial = 'valida' | 'vencida' | 'ausente'
export interface LlamadaApi {
  readonly id: string
  readonly fecha: Date
  readonly operacion: string
  readonly credencial: Credencial
  readonly estado: number
  readonly detalle: string
  readonly ticketNumero: string | null
}
export interface EventoUrbe {
  readonly id: string
  readonly fecha: Date
  readonly ticketId: string
  readonly numero: string
  readonly de: string
  readonly a: string
}
export interface Urbe {
  readonly tickets: readonly string[]
  readonly llamadas: readonly LlamadaApi[]
  readonly eventos: readonly EventoUrbe[]
}

export const contratoDe = (id: string) => CONTRATOS.find((c) => c.id === id) ?? null
export const vinculoDe = (d: Datos, ticketId: string) => d.vinculosCiudad.find((v) => v.ticketId === ticketId) ?? null

export function vincularContrato(d: Datos, ticketId: string, contratoId: string, actorId: string): Datos {
  exigir(!ROLES_EXTERNOS.includes(actorDe(actorId).rol) && actorDe(actorId).rol !== 'COORDINADOR_CX', 'vincular contratos')
  const t = ticketDe(d, ticketId)
  if (t.tipo !== 'CIT') throw new ErrorSimulado(409, 'tipo-invalido', 'Solo una incidencia de ciudad se vincula a un contrato de servicios.')
  const c = contratoDe(contratoId)
  if (!c) throw invalido([{ campo: 'contrato', mensaje: 'Elige un contrato.' }])
  if (c.tipo !== 'CITY_SERVICE_FEE') throw invalido([{ campo: 'contrato', mensaje: 'El contrato tiene que ser de tipo CITY_SERVICE_FEE (cuota de servicios de ciudad).' }])
  const s = { ...d, vinculosCiudad: [...d.vinculosCiudad.filter((v) => v.ticketId !== ticketId), { ticketId, contratoId, fecha: d.ahora, autor: actorId }] }
  return emitir(s, 'incidencia_ciudad', { contrato: contratoId })
}

/** SUPUESTO: las llamadas de UrbeMind se atribuyen a un usuario de servicio (aquí, un gestor de ATC). */
const USUARIO_SERVICIO = 'p-dlazo'

export function llamarApiUrbe(
  d: Datos,
  e: { readonly credencial: Credencial; readonly accion: 'crear' | 'consultar'; readonly resumen: string; readonly numero: string },
): [Datos, LlamadaApi] {
  let [id, s] = nuevoId(d, 'api')
  const registrar = (estado: number, detalle: string, ticketNumero: string | null, d2: Datos): [Datos, LlamadaApi] => {
    const llamada: LlamadaApi = { id, fecha: d.ahora, operacion: e.accion === 'crear' ? 'POST /tickets' : `GET /tickets/${e.numero || '{n}'}`, credencial: e.credencial, estado, detalle, ticketNumero }
    return [{ ...d2, urbe: { ...d2.urbe, llamadas: [...d2.urbe.llamadas, llamada] } }, llamada]
  }
  // CA-03 de HU-ATC-018: sin credencial válida se rechaza y queda en el log.
  if (e.credencial !== 'valida') return registrar(401, e.credencial === 'ausente' ? 'Sin credencial: rechazada.' : 'Credencial vencida: rechazada.', null, emitir(s, 'urbemind_rechazo', { credencial: e.credencial }))
  if (e.accion === 'consultar') {
    const t = s.tickets.find((x) => x.numero === e.numero.trim() && s.urbe.tickets.includes(x.id))
    return t ? registrar(200, `Estado ${t.estado}`, t.numero, s) : registrar(404, 'Ese ticket no existe o no es de UrbeMind.', null, s)
  }
  if (!e.resumen.trim()) return registrar(400, 'Falta el resumen de la incidencia.', null, s)
  const [s2, t] = crearTicket(
    s,
    { canal: 'Correo', clienteId: 'cli-019', empresaId: 'ACI', linea: 'Servicios de ciudad', establecimiento: '', tipo: 'CIT', prioridad: 'MEDIUM', resumen: e.resumen.trim(), descripcion: `Incidencia reportada desde UrbeMind: ${e.resumen.trim()}` },
    USUARIO_SERVICIO,
  )
  return registrar(201, `Ticket ${t.numero} creado (CITY_INCIDENT)`, t.numero, { ...s2, urbe: { ...s2.urbe, tickets: [...s2.urbe.tickets, t.id] } })
}

/** CA-02 de HU-ATC-018: cada cambio de estado de un ticket de UrbeMind publica un evento. */
export function publicarEventoUrbe(d: Datos, ticketId: string, de: string, a: string): Datos {
  if (!d.urbe.tickets.includes(ticketId)) return d
  const [id, s] = nuevoId(d, 'evu')
  const t = ticketDe(s, ticketId)
  return { ...s, urbe: { ...s.urbe, eventos: [...s.urbe.eventos, { id, fecha: d.ahora, ticketId, numero: t.numero, de, a }] } }
}

// ── Encuestas (HU-ATC-019) ──────────────────────────────────────────────────

export interface Encuesta {
  readonly id: string
  readonly ticketId: string
  /** Un ciclo por cierre: reabrir y volver a cerrar dispara otra (CA-03). */
  readonly ciclo: number
  readonly enviada: Date
  /** Puntero polimórfico (CA-01). */
  readonly sujeto: 'SVC_TICKET'
  readonly respuesta: { readonly csat: number; readonly ces: number; readonly fecha: Date } | null
}

/** Al cerrar un ticket: registra el envío de la encuesta del ciclo vigente. */
export function dispararEncuesta(d: Datos, ticketId: string): Datos {
  const t = ticketDe(d, ticketId)
  if (d.encuestas.some((x) => x.ticketId === ticketId && x.ciclo === t.reaperturas)) return d
  const [id, s] = nuevoId(d, 'enc')
  return emitir({ ...s, encuestas: [...s.encuestas, { id, ticketId, ciclo: t.reaperturas, enviada: d.ahora, sujeto: 'SVC_TICKET', respuesta: null }] }, 'encuesta_enviada', { ciclo: t.reaperturas })
}

export function responderEncuesta(d: Datos, encuestaId: string, csat: number, ces: number): Datos {
  const e = d.encuestas.find((x) => x.id === encuestaId)
  if (!e || e.respuesta) throw new ErrorSimulado(409, 'encuesta-invalida', 'La encuesta no existe o ya está respondida.')
  if (!(csat >= 1 && csat <= 5) || !(ces >= 1 && ces <= 7)) throw invalido([{ campo: 'csat', mensaje: 'CSAT de 1 a 5 y CES de 1 a 7.' }])
  return emitir({ ...d, encuestas: d.encuestas.map((x) => (x.id === encuestaId ? { ...x, respuesta: { csat, ces, fecha: d.ahora } } : x)) }, 'encuesta_respondida', { csat, ces })
}

export interface Medicion {
  readonly clave: string
  readonly respondidas: number
  readonly csat: number
  readonly ces: number
}

/** CA-02: CSAT y CES promedio por tipo de ticket, por área y por gestor de tickets. */
export function medirEncuestas(d: Datos, por: 'tipo' | 'area' | 'gestor'): Medicion[] {
  const grupos = new Map<string, Array<{ csat: number; ces: number }>>()
  for (const e of d.encuestas) {
    if (!e.respuesta) continue
    const t = d.tickets.find((x) => x.id === e.ticketId)
    if (!t) continue
    const clave = por === 'tipo' ? t.tipo : por === 'area' ? t.area : (t.responsable ?? 'Sin asignar')
    grupos.set(clave, [...(grupos.get(clave) ?? []), e.respuesta])
  }
  return [...grupos].map(([clave, r]) => ({ clave, respondidas: r.length, csat: r.reduce((a, x) => a + x.csat, 0) / r.length, ces: r.reduce((a, x) => a + x.ces, 0) / r.length }))
}

/** SUPUESTO: NPS preliminar derivado del CSAT (5 = promotor, 4 = pasivo, 1 a 3 = detractor). */
export function npsPreliminar(d: Datos): number | null {
  const r = d.encuestas.flatMap((e) => (e.respuesta ? [e.respuesta.csat] : []))
  if (!r.length) return null
  return Math.round(((r.filter((x) => x === 5).length - r.filter((x) => x <= 3).length) / r.length) * 100)
}

// ── Tablero y redistribución (HU-ATC-030) ───────────────────────────────────

export const puedeTorre = (p: Persona) => p.rol === 'COORDINADOR_CX' || p.rol === 'SUPERVISOR'

export function ticketsEnRiesgo(d: Datos) {
  return d.tickets.filter((t) => ESTADOS_ACTIVOS.includes(t.estado)).filter((t) => {
    const n = estadoSla(t, d.ahora).nivel
    return n === 'en-riesgo' || n === 'vencido'
  })
}

/** CA-02: reasignar desde el tablero, con motivo de carga, antes de que venza. */
export function redistribuir(d: Datos, ticketId: string, personaId: string, actorId: string): Datos {
  exigir(puedeTorre(actorDe(actorId)), 'reasignar desde el tablero')
  const t = ticketDe(d, ticketId)
  const destino = actorDe(personaId)
  if (destino.area !== t.area) throw invalido([{ campo: 'persona', mensaje: 'Elige a alguien del área actual del ticket.' }])
  if (t.responsable === personaId) throw invalido([{ campo: 'persona', mensaje: 'Ya es su responsable.' }])
  const [id, s] = nuevoId(d, 'fa')
  const filas = [...s.filasAsignacion, { id, ticketId, fecha: d.ahora, deArea: t.area, deResponsable: t.responsable, aArea: t.area, aResponsable: personaId, motivo: 'REASSIGNMENT_CARGA', nota: 'Redistribuido desde la Torre de Control', autor: actorId }]
  return { ...s, filasAsignacion: filas, tickets: s.tickets.map((x) => (x.id === ticketId ? { ...x, responsable: personaId } : x)) }
}

// ── Informes (HU-ATC-031) ───────────────────────────────────────────────────

export interface Informe {
  readonly id: string
  readonly tipo: 'DIARIO' | 'QUINCENAL'
  readonly generado: Date
  readonly datos: ReadonlyArray<readonly [string, string]>
  readonly serie: ReadonlyArray<{ readonly etiqueta: string; readonly valor: number }>
}

/** SUPUESTO: la adopción de Mi Portal es otro producto; aquí es una serie ficticia. */
const ADOPCION_PORTAL = [38, 41, 45, 49, 54]

export function generarInforme(d: Datos, tipo: 'DIARIO' | 'QUINCENAL', actorId: string): Datos {
  exigir(puedeTorre(actorDe(actorId)), 'generar informes')
  const abiertos = d.tickets.filter((t) => ESTADOS_ACTIVOS.includes(t.estado))
  const sla = d.tickets.map((t) => estadoSla(t, d.ahora).nivel)
  const cumplidos = sla.filter((n) => n === 'cumplido' || n === 'en-plazo' || n === 'en-riesgo').length
  const nps = npsPreliminar(d)
  const deriv = d.handoffs.length + d.filasAsignacion.filter((f) => f.motivo.startsWith('DERIVACION')).length
  const datos: Array<readonly [string, string]> =
    tipo === 'DIARIO'
      ? [
          ['Tickets activos por eje', [1, 2, 3].map((e) => `Eje ${e}: ${abiertos.filter((t) => t.eje === e).length}`).join(' · ')],
          ['NPS preliminar', nps === null ? 'Sin respuestas' : String(nps)],
          ['Derivaciones registradas', String(deriv)],
          ['Cumplimiento de SLA', `${Math.round((cumplidos / Math.max(1, sla.length)) * 100)} % de ${sla.length} tickets`],
        ]
      : [
          ['Tickets abiertos en la quincena', String(d.tickets.filter((t) => d.ahora.getTime() - t.abierto.getTime() <= 15 * 86_400_000).length)],
          ['Encuestas respondidas', String(d.encuestas.filter((e) => e.respuesta).length)],
          ['NPS preliminar', nps === null ? 'Sin respuestas' : String(nps)],
          ['Adopción de Mi Portal', `${ADOPCION_PORTAL.at(-1)} % (serie ficticia)`],
        ]
  const serie = tipo === 'DIARIO' ? [] : ADOPCION_PORTAL.map((v, i) => ({ etiqueta: `Semana ${i + 1}`, valor: v }))
  const [id, s] = nuevoId(d, 'inf')
  return { ...s, informes: [...s.informes, { id, tipo, generado: d.ahora, datos, serie }] }
}

// ── Auditoría de registros paralelos (HU-ATC-032) ───────────────────────────

export interface RegistroParalelo {
  readonly id: string
  readonly origen: string
  readonly clienteId: string
  readonly detectado: Date
}
export interface AuditoriaDatos {
  readonly id: string
  readonly fecha: Date
  readonly cantidad: number
  /** CA-02: un hallazgo es gate no compensable, no una observación menor. */
  readonly gateNoCompensable: boolean
}

export function ejecutarAuditoriaDatos(d: Datos, actorId: string): Datos {
  exigir(puedeTorre(actorDe(actorId)), 'ejecutar la auditoría')
  const [id, s] = nuevoId(d, 'aud')
  const cantidad = s.registrosParalelos.length
  return emitir({ ...s, auditoriasDatos: [...s.auditoriasDatos, { id, fecha: d.ahora, cantidad, gateNoCompensable: cantidad > 0 }] }, 'registros_paralelos', { cantidad })
}

/** Solo para la simulación: hace aparecer un registro paralelo del dato de cliente. */
export function simularRegistroParalelo(d: Datos): Datos {
  const [id, s] = nuevoId(d, 'rp')
  return { ...s, registrosParalelos: [...s.registrosParalelos, { id, origen: 'Hoja de cálculo de Postventa', clienteId: 'cli-033', detectado: d.ahora }] }
}

// ── EntregaFest en vivo (HU-ATC-037, 038, 039) ──────────────────────────────

export const ETIQUETA_FEST = 'Atención especial — derivación a Legal'
/** CA-01 de HU-ATC-038 (RN-SVC-028). */
export const PALABRAS_GATILLO = ['estafa', 'fraude', 'abuso', 'delito'] as const
/** SUPUESTO: solo el texto de las Frases 4 y 6 viene en las HU; el resto es del guion del moderador. */
export const FRASES = [
  { n: 1, texto: 'Texto del guion por confirmar' },
  { n: 2, texto: 'Texto del guion por confirmar' },
  { n: 3, texto: 'Texto del guion por confirmar' },
  { n: 4, texto: 'Intento de concreción: llevar la conversación a un pedido concreto' },
  { n: 5, texto: 'Texto del guion por confirmar' },
  { n: 6, texto: 'Cierre del tema en sala: se registra el caso' },
] as const

export type EstadoFest = 'EN_SALA' | 'CERRADO_EN_SALA' | 'DERIVADO'
export interface CasoFest {
  readonly id: string
  readonly codigo: string
  readonly fecha: Date
  /** Sin datos personales (RNF-SEC-008): lo observado, no quién es. */
  readonly resumen: string
  readonly riesgo: NivelRiesgo
  readonly frases: ReadonlyArray<{ readonly n: number; readonly fecha: Date; readonly nota: string }>
  readonly gatillo: readonly string[]
  readonly estado: EstadoFest
  readonly registro: { readonly etiqueta: string; readonly fecha: Date } | null
  readonly derivado: { readonly fecha: Date; readonly especialista: string } | null
}

export const ESPECIALISTA_ESTACION4 = 'p-eaguirre'
export const puedeModerar = (p: Persona) => p.rol === 'MODERADOR_EVENTO'
export const puedeRevisarFest = (p: Persona) => p.rol === 'MODERADOR_EVENTO' || p.rol === 'COORDINADOR_CX'

const sinTildes = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
export const detectarGatillo = (texto: string) => PALABRAS_GATILLO.filter((p) => sinTildes(texto).split(/[^a-zñ]+/).includes(p))

function caso(d: Datos, id: string): CasoFest {
  const c = d.casosFest.find((x) => x.id === id)
  if (!c) throw new ErrorSimulado(404, 'no-encontrado', 'El caso del evento no existe.')
  return c
}
const conCaso = (d: Datos, c: CasoFest): Datos => ({ ...d, casosFest: d.casosFest.map((x) => (x.id === c.id ? c : x)) })
const moderar = (actorId: string, accion: string) => exigir(puedeModerar(actorDe(actorId)), accion)

export function registrarCasoFest(d: Datos, e: { readonly resumen: string; readonly riesgo: NivelRiesgo | '' }, actorId: string): [Datos, CasoFest] {
  moderar(actorId, 'registrar casos del evento')
  const campos: CampoInvalido[] = []
  if (!e.resumen.trim()) campos.push({ campo: 'resumen', mensaje: 'Describe lo observado, sin nombres ni datos personales.' })
  if (!e.riesgo) campos.push({ campo: 'riesgo', mensaje: 'Elige la clasificación de riesgo verbal.' })
  if (campos.length) throw invalido(campos)
  const gatillo = detectarGatillo(e.resumen)
  const n = (d.secuencias.EF ?? 0) + 1
  const [id, s] = nuevoId({ ...d, secuencias: { ...d.secuencias, EF: n } }, 'fst')
  const c: CasoFest = { id, codigo: `EF-${String(n).padStart(3, '0')}`, fecha: d.ahora, resumen: e.resumen.trim(), riesgo: e.riesgo as NivelRiesgo, frases: [], gatillo, estado: 'EN_SALA', registro: null, derivado: null }
  return [{ ...s, casosFest: [...s.casosFest, c] }, c]
}

/** CA-01 y CA-02 de HU-ATC-037: las frases se aplican en orden; la 6 exige registrar el caso. */
export function aplicarFrase(d: Datos, id: string, n: number, nota: string, actorId: string): Datos {
  moderar(actorId, 'aplicar Frases Ancla')
  const c = caso(d, id)
  if (c.estado !== 'EN_SALA') throw new ErrorSimulado(409, 'caso-cerrado', 'El caso ya no está en sala.')
  const siguiente = c.frases.length + 1
  if (n !== siguiente) throw new ErrorSimulado(409, 'frase-fuera-de-orden', `Las Frases Ancla se aplican en orden: toca la ${siguiente}.`)
  const gatillo = [...new Set([...c.gatillo, ...detectarGatillo(nota)])]
  return emitir(conCaso(d, { ...c, frases: [...c.frases, { n, fecha: d.ahora, nota: nota.trim() }], gatillo }), 'frase_ancla', { n })
}

function registrar(d: Datos, c: CasoFest): CasoFest {
  return c.registro ? c : { ...c, registro: { etiqueta: ETIQUETA_FEST, fecha: d.ahora } }
}

export function registrarEnSistema(d: Datos, id: string, actorId: string): Datos {
  moderar(actorId, 'registrar casos del evento')
  const c = caso(d, id)
  if (c.registro) throw new ErrorSimulado(409, 'ya-registrado', 'El caso ya está registrado.')
  return conCaso(d, registrar(d, c))
}

/** CA-01 de HU-ATC-038: una palabra gatillo exige derivar de inmediato, sin debate. */
export function derivarEstacion4(d: Datos, id: string, actorId: string): Datos {
  moderar(actorId, 'derivar a la Estación 4')
  const c = caso(d, id)
  if (c.estado === 'DERIVADO') throw new ErrorSimulado(409, 'ya-derivado', 'El caso ya está en la Estación 4.')
  return emitir(conCaso(d, { ...registrar(d, c), estado: 'DERIVADO', derivado: { fecha: d.ahora, especialista: ESPECIALISTA_ESTACION4 } }), 'derivación_estación4', { gatillo: c.gatillo.length > 0 })
}

export function cerrarEnSala(d: Datos, id: string, actorId: string): Datos {
  moderar(actorId, 'cerrar el tema en sala')
  const c = caso(d, id)
  if (c.estado !== 'EN_SALA') throw new ErrorSimulado(409, 'caso-cerrado', 'El caso ya no está en sala.')
  if (c.gatillo.length && !c.derivado) throw new ErrorSimulado(409, 'gatillo', `Palabra de riesgo muy alto (${c.gatillo.join(', ')}): se deriva de inmediato a la Estación 4, sin debate (RN-SVC-028).`)
  if (c.frases.some((f) => f.n === 6) && !c.registro) throw new ErrorSimulado(409, 'sin-registro', 'Tras la Frase 6 el caso se registra para cerrar el tema en sala (RN-SVC-030).')
  return conCaso(d, { ...c, estado: 'CERRADO_EN_SALA' })
}

/** CA-02 de HU-ATC-038: un caso derivado no lo reabre el moderador. */
export function reabrirCasoFest(d: Datos, id: string, actorId: string): Datos {
  moderar(actorId, 'reabrir casos del evento')
  const c = caso(d, id)
  if (c.derivado) throw new ErrorSimulado(409, 'derivado-no-se-reabre', 'Quedó con el especialista de la Estación 4: el moderador no puede reabrirlo (RN-SVC-029).', { auditar: true })
  if (c.estado !== 'CERRADO_EN_SALA') throw new ErrorSimulado(409, 'no-cerrado', 'Solo se reabre un caso cerrado en sala.')
  return conCaso(d, { ...c, estado: 'EN_SALA' })
}

export const nombreRiesgoFest = (r: NivelRiesgo) => NOMBRE_NIVEL_RIESGO[r]
