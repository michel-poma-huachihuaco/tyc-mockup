import { ESTADOS_ACTIVOS, PERSONAS, ROLES_EXTERNOS, nombrePersona, persona } from '../datos/catalogos.ts'
import type { Area, Persona, Prioridad } from '../datos/catalogos.ts'
import { ErrorSimulado, actorDe, crearTicket, emitir, estadoSla, exigir, invalido, nuevoId, ticketDe } from './nucleo.ts'
import type { CampoInvalido, Datos, Ticket } from './nucleo.ts'

/**
 * Ola 6: bandeja y asistencia al gestor (HU-ATC-043 a 048, 054 y 055): flujos por tipo y área,
 * rayo de prioridad, reasignación por menor carga, guías de solución, asistente de IA, avance
 * diario y correos de asignación. Funciones puras sobre el mismo estado.
 */

// ── Flujos de trabajo (HU-ATC-043) ──────────────────────────────────────────

export interface PasoFlujo {
  readonly nombre: string
  readonly responsable: string | null
  readonly slaH: number
}
export interface Flujo {
  readonly id: string
  readonly tipo: string
  readonly area: Area
  readonly version: number
  readonly pasos: readonly PasoFlujo[]
  readonly publicado: Date
  readonly autor: string
}
export interface FlujoDeTicket {
  readonly ticketId: string
  readonly tipo: string
  readonly version: number
}

export const puedeConfigurar = (p: Persona) => p.rol === 'ADMIN_FUNCIONAL'
export const flujoVigente = (d: Datos, tipo: string) => d.flujos.filter((f) => f.tipo === tipo).sort((a, b) => b.version - a.version)[0] ?? null
export const flujoDe = (d: Datos, ticketId: string) => d.flujosDeTicket.find((f) => f.ticketId === ticketId) ?? null

/** CA-01 y CA-02: un ticket nuevo toma el flujo vigente de su tipo y lo conserva aunque se publique otro. */
export function estamparFlujo(d: Datos, ticketId: string): Datos {
  const t = ticketDe(d, ticketId)
  const f = flujoVigente(d, t.tipo)
  return f ? { ...d, flujosDeTicket: [...d.flujosDeTicket, { ticketId, tipo: t.tipo, version: f.version }] } : d
}

export function publicarFlujo(d: Datos, tipo: string, area: Area, pasos: readonly PasoFlujo[], actorId: string): Datos {
  exigir(puedeConfigurar(actorDe(actorId)), 'publicar flujos')
  const campos: CampoInvalido[] = []
  if (!pasos.length) campos.push({ campo: 'pasos', mensaje: 'El flujo necesita al menos un paso.' })
  pasos.forEach((p, i) => {
    if (!p.nombre.trim()) campos.push({ campo: `paso-${i}`, mensaje: `El paso ${i + 1} no tiene nombre.` })
    else if (!p.responsable) campos.push({ campo: `paso-${i}`, mensaje: `El paso «${p.nombre.trim()}» no tiene responsable: no se publica un flujo incompleto.` })
    if (!(p.slaH > 0)) campos.push({ campo: `paso-${i}`, mensaje: `El paso ${i + 1} necesita un SLA en horas hábiles mayor que cero.` })
  })
  if (campos.length) throw invalido(campos)
  const [id, s] = nuevoId(d, 'flu')
  const version = (flujoVigente(d, tipo)?.version ?? 0) + 1
  return emitir({ ...s, flujos: [...s.flujos, { id, tipo, area, version, pasos: pasos.map((p) => ({ ...p, nombre: p.nombre.trim() })), publicado: d.ahora, autor: actorId }] }, 'flujo_publicado', { tipo, version })
}

// ── Rayo de prioridad (HU-ATC-045) ──────────────────────────────────────────

export interface EventoRayo {
  readonly id: string
  readonly ticketId: string
  readonly accion: 'MARCADO' | 'RETIRADO'
  readonly motivo: string
  readonly fecha: Date
  readonly autor: string
}
/** RN-SVC-031: umbral a validar. */
export const LIMITE_RAYO = 0.1
export const puedeRayo = (p: Persona) => p.rol === 'SUPERVISOR'
export const rayoActivo = (d: Datos, ticketId: string) => d.rayos.filter((r) => r.ticketId === ticketId).at(-1)?.accion === 'MARCADO'
export const bandejaDeArea = (d: Datos, area: Area) => d.tickets.filter((t) => t.area === area && ESTADOS_ACTIVOS.includes(t.estado))

export function marcarRayo(d: Datos, ticketId: string, motivo: string, confirmar: boolean, actorId: string): Datos {
  exigir(puedeRayo(actorDe(actorId)), 'marcar el rayo')
  const t = ticketDe(d, ticketId)
  if (!ESTADOS_ACTIVOS.includes(t.estado)) throw new ErrorSimulado(409, 'ticket-inactivo', 'Solo se marca el rayo en un ticket activo.')
  if (rayoActivo(d, ticketId)) throw new ErrorSimulado(409, 'ya-marcado', 'El ticket ya tiene el rayo.')
  if (!motivo.trim()) throw invalido([{ campo: 'motivo', mensaje: 'Indica el motivo del rayo.' }])
  const bandeja = bandejaDeArea(d, t.area)
  const conRayo = bandeja.filter((x) => rayoActivo(d, x.id)).length
  if (!confirmar && conRayo > 0 && conRayo / bandeja.length >= LIMITE_RAYO)
    throw new ErrorSimulado(409, 'limite-rayo', `El área ya tiene ${conRayo} de ${bandeja.length} tickets con rayo (el límite es ${Math.round(LIMITE_RAYO * 100)} %). Confirma o desmarca otro.`)
  const [id, s] = nuevoId(d, 'ray')
  return emitir({ ...s, rayos: [...s.rayos, { id, ticketId, accion: 'MARCADO', motivo: motivo.trim(), fecha: d.ahora, autor: actorId }] }, 'rayo_marcado', { area: t.area })
}

export function retirarRayo(d: Datos, ticketId: string, actorId: string): Datos {
  exigir(puedeRayo(actorDe(actorId)), 'retirar el rayo')
  if (!rayoActivo(d, ticketId)) throw new ErrorSimulado(409, 'sin-rayo', 'El ticket no tiene el rayo.')
  const [id, s] = nuevoId(d, 'ray')
  return { ...s, rayos: [...s.rayos, { id, ticketId, accion: 'RETIRADO', motivo: 'Rayo retirado', fecha: d.ahora, autor: actorId }] }
}

// ── Orden de la bandeja (HU-ATC-044) ────────────────────────────────────────

const RANGO: Record<Prioridad, number> = { LOW: 1, MEDIUM: 2, HIGH: 3, URGENT: 4 }
/** CA-01: rayo primero, luego el SLA más próximo y luego la prioridad. */
export function porUrgencia(d: Datos) {
  return (a: Ticket, b: Ticket) => {
    const ra = rayoActivo(d, a.id) ? 0 : 1
    const rb = rayoActivo(d, b.id) ? 0 : 1
    if (ra !== rb) return ra - rb
    const va = estadoSla(a, d.ahora).vence.getTime()
    const vb = estadoSla(b, d.ahora).vence.getTime()
    return va - vb || RANGO[b.prioridad] - RANGO[a.prioridad]
  }
}

// ── Carga y reasignación (HU-ATC-046) ───────────────────────────────────────

/** SUPUESTO (pregunta abierta de FT-ATC-18: «¿cómo se mide la carga?»): puntos por prioridad. */
export const PESO: Record<Prioridad, number> = { LOW: 1, MEDIUM: 2, HIGH: 3, URGENT: 4 }
export const LIMITE_CARGA = 12
export const esGestor = (p: Persona) => p.rol === 'GESTOR' || p.rol === 'COLABORADOR'
export const cargaDe = (d: Datos, personaId: string) => d.tickets.filter((t) => t.responsable === personaId && ESTADOS_ACTIVOS.includes(t.estado)).reduce((s, t) => s + PESO[t.prioridad], 0)
export const disponible = (d: Datos, personaId: string) => !d.ausentes.includes(personaId)
/** SUPUESTO: «interacción en curso» = una interacción en los últimos 30 minutos. */
export const enInteraccion = (d: Datos, t: Ticket) => d.interacciones.some((i) => i.ticketId === t.id && d.ahora.getTime() - i.fecha.getTime() <= 30 * 60_000 && i.fecha <= d.ahora)

export interface AlertaOps {
  readonly id: string
  readonly fecha: Date
  readonly destinatario: string
  readonly tipo: 'SIN_DISPONIBLES' | 'GUIA_FALTANTE'
  readonly detalle: string
}

export function cambiarDisponibilidad(d: Datos, personaId: string, disp: boolean, actorId: string): Datos {
  exigir(actorDe(actorId).rol === 'SUPERVISOR', 'cambiar la disponibilidad')
  return { ...d, ausentes: disp ? d.ausentes.filter((p) => p !== personaId) : [...new Set([...d.ausentes, personaId])] }
}

export function balancear(d: Datos, actorId: string): [Datos, { readonly movidos: number; readonly alCola: number }] {
  exigir(actorDe(actorId).rol === 'SUPERVISOR', 'balancear la carga')
  let s = d
  let movidos = 0
  let alCola = 0
  const avisadas = new Set<Area>()
  for (const origen of PERSONAS.filter(esGestor)) {
    if (cargaDe(s, origen.id) <= LIMITE_CARGA) continue
    const area = origen.area as Area
    const elegibles = s.tickets
      .filter((t) => t.responsable === origen.id && ESTADOS_ACTIVOS.includes(t.estado) && t.eje !== 3 && !rayoActivo(s, t.id) && !enInteraccion(s, t))
      .sort((a, b) => PESO[a.prioridad] - PESO[b.prioridad])
    for (const t of elegibles) {
      if (cargaDe(s, origen.id) <= LIMITE_CARGA) break
      const destinos = PERSONAS.filter((p) => esGestor(p) && p.area === area && p.id !== origen.id && disponible(s, p.id)).sort((a, b) => cargaDe(s, a.id) - cargaDe(s, b.id))
      const destino = destinos[0]?.id ?? null
      let id: string
      ;[id, s] = nuevoId(s, 'fa')
      s = {
        ...s,
        filasAsignacion: [...s.filasAsignacion, { id, ticketId: t.id, fecha: d.ahora, deArea: t.area, deResponsable: origen.id, aArea: t.area, aResponsable: destino, motivo: 'REASSIGNMENT_CARGA', nota: destino ? null : 'Nadie disponible: queda en la cola del área', autor: actorId }],
        tickets: s.tickets.map((x) => (x.id === t.id ? { ...x, responsable: destino } : x)),
      }
      if (destino) movidos++
      else {
        alCola++
        if (!avisadas.has(area)) {
          avisadas.add(area)
          ;[id, s] = nuevoId(s, 'ops')
          s = { ...s, alertasOps: [...s.alertasOps, { id, fecha: d.ahora, destinatario: actorId, tipo: 'SIN_DISPONIBLES', detalle: `No hay gestores disponibles en el área ${area}: los tickets quedaron en su cola.` }] }
        }
      }
    }
  }
  return [emitir(s, 'balanceo_carga', { movidos, alCola }), { movidos, alCola }]
}

/** CA-02 de HU-ATC-044: un ticket nuevo sin responsable se asigna por el flujo del área o queda en su cola. */
export function orquestar(d: Datos, ticketId: string): [Datos, 'asignado' | 'cola'] {
  const t = ticketDe(d, ticketId)
  const f = flujoVigente(d, t.tipo)
  const quien = f?.pasos[0]?.responsable ?? null
  if (!f || !quien || !disponible(d, quien)) return [{ ...d, tickets: d.tickets.map((x) => (x.id === ticketId ? { ...x, responsable: null, area: (f?.area ?? x.area) as Area } : x)) }, 'cola']
  const [id, s] = nuevoId(d, 'fa')
  const area = (persona(quien)?.area ?? f.area) as Area
  return [
    {
      ...s,
      tickets: s.tickets.map((x) => (x.id === ticketId ? { ...x, responsable: quien, area } : x)),
      filasAsignacion: [...s.filasAsignacion, { id, ticketId, fecha: d.ahora, deArea: t.area, deResponsable: t.responsable, aArea: area, aResponsable: quien, motivo: 'ALTA', nota: 'Asignado por el flujo del área', autor: 'p-gnunez' }],
    },
    'asignado',
  ]
}

/** Solo para la simulación: entra un ticket por Mi Portal, sin responsable. */
export function ticketEntrante(d: Datos, tipo: string): [Datos, Ticket, 'asignado' | 'cola'] {
  const [d1, t] = crearTicket(d, { canal: 'Correo', clienteId: 'cli-038', empresaId: 'AIN', linea: 'Lotes urbanos', establecimiento: '', tipo, prioridad: 'MEDIUM', resumen: 'Consulta recibida por Mi Portal', descripcion: 'Ingresó por Mi Portal sin responsable.' }, 'p-dlazo')
  const [d2, r] = orquestar({ ...d1, tickets: d1.tickets.map((x) => (x.id === t.id ? { ...x, responsable: null } : x)) }, t.id)
  return [d2, ticketDe(d2, t.id), r]
}

// ── Guías de solución (HU-ATC-047) ──────────────────────────────────────────

export interface Guia {
  readonly id: string
  readonly tipo: string
  readonly version: number
  readonly pasos: readonly string[]
  readonly plantillas: readonly string[]
  readonly criterios: readonly string[]
  readonly publicada: Date
  readonly autor: string
}
export const guiaVigente = (d: Datos, tipo: string) => d.guias.filter((g) => g.tipo === tipo).sort((a, b) => b.version - a.version)[0] ?? null

export function publicarGuia(d: Datos, tipo: string, e: { readonly pasos: readonly string[]; readonly plantillas: readonly string[]; readonly criterios: readonly string[] }, actorId: string): Datos {
  exigir(puedeConfigurar(actorDe(actorId)), 'publicar guías')
  const limpiar = (l: readonly string[]) => l.map((x) => x.trim()).filter(Boolean)
  const g = { pasos: limpiar(e.pasos), plantillas: limpiar(e.plantillas), criterios: limpiar(e.criterios) }
  const campos: CampoInvalido[] = []
  if (!g.pasos.length) campos.push({ campo: 'pasos', mensaje: 'La guía necesita al menos un paso.' })
  if (!g.criterios.length) campos.push({ campo: 'criterios', mensaje: 'La guía necesita criterios de cierre.' })
  if (campos.length) throw invalido(campos)
  const [id, s] = nuevoId(d, 'gui')
  return emitir({ ...s, guias: [...s.guias, { id, tipo, version: (guiaVigente(d, tipo)?.version ?? 0) + 1, ...g, publicada: d.ahora, autor: actorId }] }, 'guia_publicada', { tipo })
}

/** CA-03: un tipo sin guía se reporta al administrador funcional, una sola vez. */
export function reportarSinGuia(d: Datos, tipo: string): Datos {
  if (guiaVigente(d, tipo) || d.alertasOps.some((a) => a.tipo === 'GUIA_FALTANTE' && a.detalle.includes(`«${tipo}»`))) return d
  const admin = PERSONAS.find((p) => p.rol === 'ADMIN_FUNCIONAL')?.id ?? ''
  const [id, s] = nuevoId(d, 'ops')
  return { ...s, alertasOps: [...s.alertasOps, { id, fecha: d.ahora, destinatario: admin, tipo: 'GUIA_FALTANTE', detalle: `El tipo «${tipo}» no tiene guía de solución publicada.` }] }
}

// ── Asistente de IA (HU-ATC-048) ────────────────────────────────────────────

export interface DecisionIA {
  readonly id: string
  readonly ticketId: string
  readonly decision: 'ACEPTADA' | 'EDITADA' | 'DESCARTADA'
  readonly fecha: Date
  readonly autor: string
  /** Solo cuántos datos se anonimizaron: nunca el texto (RN-SVC-012). */
  readonly anonimizados: number
}

const DNI = /(?<!\d)\d{8}(?!\d)/g
const TARJETA = /(?<!\d)(?:\d[ -]?){12,18}\d(?!\d)/g

/** CA-03: DNI y tarjetas se anonimizan antes de salir hacia el modelo. */
export function anonimizar(texto: string): { readonly texto: string; readonly reemplazos: number } {
  let n = 0
  const t = texto.replace(TARJETA, () => (n++, '[TARJETA]')).replace(DNI, () => (n++, '[DNI]'))
  return { texto: t, reemplazos: n }
}

/** SUPUESTO: la IA es simulada con plantillas; asesora y el gestor decide (RN-SVC-032). */
export function sugerirIA(d: Datos, t: Ticket, borrador: string) {
  const enviado = anonimizar(borrador)
  const g = guiaVigente(d, t.tipo)
  const base = g?.plantillas[0] ?? 'Hola, gracias por escribirnos. Estamos revisando tu solicitud «{resumen}» y te responderemos a la brevedad.'
  const sugerencia = base.replaceAll('{resumen}', t.resumen)
  const pendientes = (g?.criterios ?? ['Registrar la respuesta al cliente', 'Confirmar la solución con el cliente']).filter((c) => !(t.primeraRespuesta && /respuesta/i.test(c)))
  return { sugerencia, pendientes, enviado: enviado.texto, anonimizados: enviado.reemplazos }
}

export function registrarDecisionIA(d: Datos, ticketId: string, decision: DecisionIA['decision'], anonimizados: number, actorId: string): Datos {
  exigir(!ROLES_EXTERNOS.includes(actorDe(actorId).rol), 'usar el asistente')
  ticketDe(d, ticketId)
  const [id, s] = nuevoId(d, 'ia')
  return emitir({ ...s, decisionesIA: [...s.decisionesIA, { id, ticketId, decision, fecha: d.ahora, autor: actorId, anonimizados }] }, 'sugerencia_ia', { decision })
}

// ── Avance diario (HU-ATC-054) ──────────────────────────────────────────────

/** NEXUS (DEP-02): quién es el líder de cada gestor. Sin líder = null. */
export const LIDERES: Readonly<Record<string, string | null>> = {
  'p-crojas': 'p-gnunez',
  'p-dlazo': 'p-gnunez',
  'p-mpaz': 'p-gnunez',
  'p-lccahuana': 'p-gnunez',
  'p-omedina': 'p-gnunez',
  'p-rsalazar': null,
  'p-jccama': null,
}
const mismoDia = (a: Date, b: Date) => a.toDateString() === b.toDateString()

export interface AvanceDia {
  readonly personaId: string
  readonly atendidos: number
  readonly pendientes: number
  readonly enRiesgo: number
  readonly csat: number | null
  readonly carga: number
  readonly ticketsRiesgo: readonly Ticket[]
}

export function avanceDe(d: Datos, personaId: string): AvanceDia {
  const propios = d.tickets.filter((t) => t.responsable === personaId && ESTADOS_ACTIVOS.includes(t.estado))
  const riesgo = propios.filter((t) => {
    const n = estadoSla(t, d.ahora).nivel
    return n === 'en-riesgo' || n === 'vencido'
  })
  const atendidos = new Set(d.interacciones.filter((i) => i.autor === personaId && i.visible && mismoDia(i.fecha, d.ahora)).map((i) => i.ticketId)).size
  const csats = d.encuestas.filter((e) => e.respuesta && mismoDia(e.respuesta.fecha, d.ahora) && d.tickets.find((t) => t.id === e.ticketId)?.responsable === personaId).map((e) => (e.respuesta as { csat: number }).csat)
  return { personaId, atendidos, pendientes: propios.length, enRiesgo: riesgo.length, csat: csats.length ? csats.reduce((a, b) => a + b, 0) / csats.length : null, carga: cargaDe(d, personaId), ticketsRiesgo: riesgo }
}

/** CA-03: el gestor ve solo el suyo; el equipo, solo su líder. */
export const equipoDe = (liderId: string) => PERSONAS.filter((p) => LIDERES[p.id] === liderId)
export const puedeVerEquipo = (p: Persona) => p.rol === 'SUPERVISOR'

// ── Correos de asignación (HU-ATC-055) ──────────────────────────────────────

export interface Correo {
  readonly id: string
  readonly fecha: Date
  readonly para: string
  readonly cc: string | null
  readonly asunto: string
  readonly tickets: readonly string[]
  readonly masivo: boolean
}

/**
 * Se derivan del registro de asignaciones, así que no pueden contradecirlo: uno por
 * asignación con copia al líder y uno solo por persona en una reasignación masiva. No sale
 * correo a quien se asigna un ticket a sí mismo (SUPUESTO).
 */
export function correosDeAsignacion(d: Datos): Correo[] {
  const grupos = new Map<string, { fecha: Date; para: string; tickets: string[]; masivo: boolean }>()
  for (const f of d.filasAsignacion) {
    if (!f.aResponsable || f.aResponsable === f.autor) continue
    const masivo = f.motivo === 'REASSIGNMENT_CESE' || f.motivo === 'REASSIGNMENT_ROTACION' || f.motivo === 'REASSIGNMENT_CARGA'
    const clave = masivo ? `${f.fecha.getTime()}|${f.aResponsable}|${f.motivo}` : f.id
    const g = grupos.get(clave) ?? { fecha: f.fecha, para: f.aResponsable, tickets: [], masivo }
    g.tickets.push(f.ticketId)
    grupos.set(clave, g)
  }
  return [...grupos]
    .map(([clave, g]): Correo => {
      const numeros = g.tickets.map((id) => d.tickets.find((t) => t.id === id)?.numero ?? id)
      const lote = g.masivo && g.tickets.length > 1
      return {
        id: clave,
        fecha: g.fecha,
        para: g.para,
        cc: LIDERES[g.para] ?? null,
        asunto: lote ? `Se te reasignaron ${g.tickets.length} tickets` : `Se te asignó el ticket ${numeros[0]}`,
        tickets: numeros,
        masivo: lote,
      }
    })
    .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
}

export const sinLider = (c: Correo) => c.cc === null
export const nombreLider = (id: string | null) => (id ? nombrePersona(id) : 'Sin líder en NEXUS')
