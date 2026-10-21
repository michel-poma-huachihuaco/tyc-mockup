// Puente entre la «Operación en Vivo» de Daniel (src/vivo) y el modelo real del mockup (chunk «comun» parcheado). Los nombres
// del chunk son los minificados de su `export`; aquí se les pone nombre. Las reglas son las de nuestro visor anterior (el chunk
// VistaEnVivo con scripts/componentes-vivo.js y vivo-modelo.js): zonas de la sede, etapa y canal de cada ticket, áreas permitidas
// por rol, Sala de Comité, resumen por área, bitácora y marcador del equipo. Nada de esto inventa datos: todo sale de `datos()`.
import * as C from 'aybar:comun'

/* eslint-disable @typescript-eslint/no-explicit-any */
type Dict = Record<string, any>
const M = C as unknown as Dict

export interface Ticket {
  id: string; numero: string; empresaId: string; canal: string; clienteId: string | null; tipo: string; prioridad: string
  resumen: string; estado: string; area: string; responsable: string | null; eje: number; abierto: Date; inicioCiclo: Date
  primeraResolucion: Date | null; venceResolucion: Date; ultimaResolucion: Date | null; cierre: Date | null; reaperturas: number
}
export interface Fila { id: string; ticketId: string; fecha: Date; [k: string]: any }
export interface Datos {
  ahora: Date; tickets: Ticket[]; filasEstado: Fila[]; filasAsignacion: Fila[]; alertas: Fila[]; encuestas: Fila[]; rayos: Fila[]
  escalamientos: unknown[]; [k: string]: any
}
export interface Persona { id: string; nombre: string; area: string; rol: string }
export interface Sla { nivel: 'en-plazo' | 'en-riesgo' | 'vencido' | 'fuera-de-plazo' | 'cumplido'; hito: 'respuesta' | 'resolucion'; vence: Date }
export interface Correo { id: string; fecha: Date; para: string; cc: string | null; asunto: string; tickets: string[]; masivo: boolean }

// ------------------------------------------------------------------ piezas del modelo (chunk «comun»)
/** API de la consola (transacción con latencia y reglas): cambiar estado, marcar y retirar el rayo. */
export const api = M.E as {
  cambiarEstado: (id: string, estado: string, nota: string | null) => Promise<unknown>
  marcarRayo: (id: string, motivo: string, confirmarTope: boolean) => Promise<unknown>
  retirarRayo: (id: string) => Promise<unknown>
}
/** Simulación del mockup (Herramientas): avanzar el reloj (corre el job de SLA, que crea las alertas al vencer). */
export const simulacion = M.O as { avanzar: (horas: number) => unknown }
/** Ayudas de scripts/vivo-modelo.js: ticket entrante (alta + asignación por el flujo y la carga), reasignar a menor carga y horas al vencimiento. */
export const vivo = M.__vivo as {
  entrante: (tipo: string, canal: string, clienteId: string, resumen: string, empresaId?: string) => { id: string; numero: string; resultado: string }
  reasignar: (id: string) => Promise<string>
  horas: (o: Datos, id: string) => number | null
}
export const nivelSla = M.nn as (t: Ticket, ahora: Date) => Sla
export const tieneRayo = M.wn as (o: Datos, id: string) => boolean
const asientoDe = M.Gt as (o: Datos, id: string) => unknown
export const ACTIVOS = M.or as string[]
export const NOMBRE_ESTADO = M.hr as Record<string, string>
export const nombreTipo = M.Ar as (tipo: string) => string
export const nombrePersona = M.Or as (id: string | null) => string
export const PERSONAS = M.br as Persona[]
const CLIENTES = M.Un as { id: string }[]
export const cliente = M.Kn as (id: string) => { nombre: string; proyectos?: string[] } | null
const equipoDe = M.mn as (liderId: string) => Persona[]
const textoSinLider = M.yn as (id: string | null) => string
export const cargaDe = M.dn as (o: Datos, id: string) => { carga: number }
export const disponible = M.pn as (o: Datos, id: string) => boolean
export const EMPRESAS = M.nr as { id: string; nombre: string }[]
export const correosAsignacion = M.fn as (o: Datos) => Correo[]
/** Fecha corta con hora del prototipo («15 oct., 11:00»). */
export const fechaHora = M.m as (d: Date) => string
export const puedeRayo = M.Sn as (p: Persona) => boolean
const permisos = M.sn as { atender: (rol: string) => boolean }
export const puedeAtender = (p: Persona | null): boolean => !!p && permisos.atender(p.rol)
export const puedeReasignar = (p: Persona | null): boolean => !!p && (p.rol === 'SUPERVISOR' || p.rol === 'COORDINADOR_CX')

// ------------------------------------------------------------------ la sede: zonas, etapas y canales (chunk VistaEnVivo)
const ids = (f: (p: Persona) => boolean) => PERSONAS.filter(f).map((p) => p.id)
/** Las 6 salas de la escena con su equipo (el mismo reparto del visor anterior). */
export const ZONAS: { k: string; gente: string[] }[] = [
  { k: 'eje1', gente: ids((p) => p.area === 'ATC' && p.rol !== 'COORDINADOR_CX') },
  { k: 'cob', gente: ids((p) => p.area === 'COBRANZA') },
  { k: 'libro', gente: ['p-pvilchez'] },
  { k: 'legal', gente: ['p-vortiz', 'p-rcastillo'] },
  { k: 'post', gente: ids((p) => p.area === 'POSTVENTA') },
  { k: 'proy', gente: ['p-nquispe', 'p-jmarin'] },
]
/** Sala de la escena a la que va el ticket según su flujo: área, eje 3, tipo y asiento del Libro. */
export function zonaDe(o: Datos, t: Ticket): string {
  if (t.eje === 3 || t.area === 'LEGAL') return 'legal'
  if (t.tipo === 'GAR' || t.area === 'POSTVENTA') return 'post'
  if (t.tipo === 'ING' || t.tipo === 'RSV' || t.area === 'ADMINISTRACION') return 'proy'
  if ((t.tipo === 'QUE' || t.tipo === 'REC') && asientoDe(o, t.id)) return 'libro'
  return t.area === 'COBRANZA' ? 'cob' : 'eje1'
}
export type Etapa = 'bandeja' | 'cola' | 'atencion' | 'salida'
export function etapaDe(t: Ticket): Etapa {
  if (t.estado === 'RESOLVED' || t.estado === 'CLOSED') return 'salida'
  if (!t.responsable && t.estado === 'OPEN') return 'bandeja'
  return t.estado === 'IN_PROGRESS' || t.estado === 'ESCALATED' ? 'atencion' : 'cola'
}
export const NOMBRE_ETAPA: Record<Etapa, string> = { bandeja: 'Bandeja Orquestadora', cola: 'En cola de sala', atencion: 'En atención', salida: 'Cierre Mi Portal' }
/** Canal de entrada (compuerta de la escena). */
export function canalDe(t: { tipo: string; canal: string }): string {
  if (t.tipo === 'ING') return 'form'
  if (t.tipo === 'RSV' || t.canal === 'Mi Portal') return 'portal'
  return t.canal === 'Teléfono' ? 'tel' : t.canal === 'WhatsApp' ? 'wa' : 'mail'
}
/** HU-067 CA-02: color de la caja según el tipo de ticket (tokens del sistema de diseño); verde, ámbar y rojo quedan para el SLA. */
export const COLOR_TIPO: Record<string, string> = {
  PED: 'primary-300', CTA: 'primary-500', VIS: 'primary-800', QUE: 'secondary-300', REC: 'secondary-700', GAR: 'info-400',
  RES: 'info-700', ING: 'neutral-450', RSV: 'neutral-700',
}
export const activo = (t: Ticket): boolean => ACTIVOS.includes(t.estado)
export const vencido = (s: Sla): boolean => s.nivel === 'vencido' || s.nivel === 'fuera-de-plazo'
const PESO_PRIORIDAD: Record<string, number> = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 }
export const NOMBRE_PRIORIDAD: Record<string, string> = { URGENT: 'Urgente', HIGH: 'Alta', MEDIUM: 'Media', LOW: 'Baja' }
/** HU-067 CA-02: orden de la bandeja orquestadora: rayo › SLA más próximo a vencer › prioridad. */
export function ordenBandeja(o: Datos): (a: Ticket, b: Ticket) => number {
  return (a, b) => (Number(tieneRayo(o, b.id)) - Number(tieneRayo(o, a.id)))
    || (nivelSla(a, o.ahora).vence.getTime() - nivelSla(b, o.ahora).vence.getTime())
    || ((PESO_PRIORIDAD[b.prioridad] ?? 0) - (PESO_PRIORIDAD[a.prioridad] ?? 0))
}
/** % del SLA vigente ya consumido (0–100). */
export function pctConsumido(t: Ticket, ahora: Date): number {
  const s = nivelSla(t, ahora)
  const ini = s.hito === 'respuesta' ? t.abierto : t.inicioCiclo
  const total = s.vence.getTime() - ini.getTime()
  const fin = etapaDe(t) === 'salida' ? (t.ultimaResolucion ?? t.cierre ?? ahora) : ahora
  return total > 0 ? Math.max(0, Math.min(100, Math.round(((fin.getTime() - ini.getTime()) / total) * 100))) : 100
}

// ------------------------------------------------------------------ HU-067 CA-07: filtro por razón social y áreas por rol
/** Áreas permitidas: todas para supervisor y coordinación CX (ven «todas las áreas» en la bandeja); para los demás, las salas
 *  cuyo equipo es de su misma área. `null` = todas. */
export function zonasPermitidas(p: Persona | null): Set<string> | null {
  if (!p || p.rol === 'SUPERVISOR' || p.rol === 'COORDINADOR_CX') return null
  return new Set(ZONAS.filter((z) => z.gente.some((g) => PERSONAS.find((q) => q.id === g)?.area === p.area)).map((z) => z.k))
}
/** La vista filtrada: solo los tickets de la razón social elegida y de las áreas permitidas (y sus filas). */
export function filtrar(o: Datos, p: Persona | null, empresa: string): Datos {
  const zs = zonasPermitidas(p)
  if (!zs && !empresa) return o
  const ok = new Set(o.tickets.filter((t) => (!empresa || t.empresaId === empresa) && (!zs || zs.has(zonaDe(o, t)))).map((t) => t.id))
  const f = (q: Fila) => ok.has(q.ticketId)
  return {
    ...o, tickets: o.tickets.filter((t) => ok.has(t.id)), filasEstado: o.filasEstado.filter(f), filasAsignacion: o.filasAsignacion.filter(f),
    alertas: o.alertas.filter(f), encuestas: o.encuestas.filter(f), rayos: o.rayos.filter(f),
  }
}

// ------------------------------------------------------------------ líderes (maestro local de ATC)
const liderCache = new Map<string, string | null>()
/** Líder de una persona según el maestro local (el mismo dato de Mi día › Equipo y de la copia del correo). */
export function liderDe(g: string | null): string | null {
  if (!g) return null
  if (!liderCache.has(g)) liderCache.set(g, PERSONAS.find((p) => equipoDe(p.id).some((q) => q.id === g))?.id ?? null)
  return liderCache.get(g) ?? null
}
/** Líderes del equipo de una sala, por nombre; null si el maestro no tiene ninguno. */
export function lideresZona(k: string): string | null {
  const z = ZONAS.find((q) => q.k === k)
  const ls = [...new Set((z?.gente ?? []).map(liderDe).filter((x): x is string => !!x))]
  return ls.length ? ls.map(nombrePersona).join(', ') : null
}
export const sinLider = (): string => textoSinLider(null)

// ------------------------------------------------------------------ HU-067 CA-03: Sala de Comité y bitácora
/** Activos con el SLA vencido y ya avisados al líder en su ciclo (la alerta del job de SLA); el último avisado, primero. */
export function comite(o: Datos): Ticket[] {
  const aviso = (t: Ticket) => Math.max(0, ...o.alertas.filter((a) => a.ticketId === t.id && a['ciclo'] === t.reaperturas).map((a) => a.fecha.getTime()))
  return o.tickets.filter((t) => activo(t) && nivelSla(t, o.ahora).nivel === 'vencido' && aviso(t) > 0).sort((a, b) => aviso(b) - aviso(a))
}
export interface Evento { id: string; fecha: Date; texto: string; tono: 'default' | 'accent' | 'success' | 'danger' }
/** Correo del aviso de SLA vencido: al responsable con copia a su líder (RN-SVC-035); sin responsable, a quien recibe la alerta. */
function textoCorreoVencido(o: Datos, a: Fila): string {
  const resp = o.tickets.find((t) => t.id === a.ticketId)?.responsable ?? null
  if (!resp) return `correo a ${nombrePersona(a['destinatario'])}`
  const l = liderDe(resp)
  return l ? `correo a ${nombrePersona(resp)} con copia a su líder, ${nombrePersona(l)}` : `correo a ${nombrePersona(resp)} · ${sinLider()}`
}
/** HU-067 CA-06: registro de actividad con la hora de cada evento (más reciente arriba). */
export function bitacora(o: Datos, max = 12): Evento[] {
  const num = (id: string) => o.tickets.find((t) => t.id === id)?.numero ?? ''
  return [
    ...o.filasEstado.map((q) => ({
      id: q.id, fecha: q.fecha, texto: q['de'] ? `${num(q.ticketId)} · ${NOMBRE_ESTADO[q['a']] ?? q['a']}` : `${num(q.ticketId)} · Registrado`,
      tono: (q['a'] === 'RESOLVED' || q['a'] === 'CLOSED' ? 'success' : 'default') as Evento['tono'],
    })),
    ...o.alertas.map((q) => ({ id: q.id, fecha: q.fecha, texto: `${num(q.ticketId)} · SLA vencido: ${textoCorreoVencido(o, q)}; pasa a la Sala de Comité`, tono: 'danger' as const })),
    ...o.rayos.map((q) => ({
      id: q.id, fecha: q.fecha, tono: 'accent' as const,
      texto: q['accion'] === 'MARCADO' ? `${num(q.ticketId)} · Prioridad Rayo (${q['motivo']})` : `${num(q.ticketId)} · Rayo retirado`,
    })),
  ].sort((a, b) => b.fecha.getTime() - a.fecha.getTime()).slice(0, max)
}

// ------------------------------------------------------------------ HU-067 CA-05: recorrido del ticket
/** Registrado, en bandeja, asignado, en atención, resuelto y cerrado, con la hora de cada paso (más reciente arriba). */
export function recorrido(o: Datos, t: Ticket): Evento[] {
  const reg = o.filasEstado.find((q) => q.ticketId === t.id && !q['de'])
  const pasos: (Evento & { o: number })[] = [
    ...o.filasEstado.filter((q) => q.ticketId === t.id).map((q) => ({
      id: q.id, fecha: q.fecha, o: q['de'] ? 3 : 0, texto: q['de'] ? NOMBRE_ESTADO[q['a']] ?? q['a'] : 'Registrado',
      tono: (q['a'] === 'RESOLVED' || q['a'] === 'CLOSED' ? 'success' : q['a'] === 'ESCALATED' ? 'danger' : 'default') as Evento['tono'],
    })),
    { id: `${t.id}-bandeja`, fecha: reg ? reg.fecha : t.abierto, o: 1, texto: 'En la Bandeja Orquestadora', tono: 'accent' },
    ...o.filasAsignacion.filter((q) => q.ticketId === t.id && q['aResponsable']).map((q) => ({
      id: q.id, fecha: q.fecha, o: 2, tono: 'default' as const,
      texto: `Asignado a ${nombrePersona(q['aResponsable'])}${q['motivo'] === 'REASSIGNMENT_CARGA' ? ' (reasignación por carga)' : ''}`,
    })),
    ...o.alertas.filter((q) => q.ticketId === t.id).map((q) => ({ id: q.id, fecha: q.fecha, o: 4, texto: `SLA vencido: ${textoCorreoVencido(o, q)}`, tono: 'danger' as const })),
  ]
  return pasos.sort((a, b) => b.fecha.getTime() - a.fecha.getTime() || b.o - a.o)
}
/** CSAT de la encuesta respondida (solo si el ticket ya se cerró). */
export function csatDe(o: Datos, t: Ticket): string | null {
  if (t.estado !== 'CLOSED') return null
  const e = o.encuestas.filter((q) => q.ticketId === t.id && q['respuesta']).at(-1)
  return e ? `${e['respuesta'].csat}/5${e['respuesta'].ces !== undefined ? ` · CES ${e['respuesta'].ces}` : ''}` : 'Encuesta sin respuesta'
}

// ------------------------------------------------------------------ HU-067 CA-04: resumen de un área
export interface ResumenArea { k: string; ts: Ticket[]; cola: number; aten: number; ocup: number; tot: number; riesgo: number; res: number; sla: number | null }
export function resumenArea(o: Datos, k: string): ResumenArea {
  const z = ZONAS.find((q) => q.k === k) ?? { k, gente: [] }
  const ts = o.tickets.filter((t) => activo(t) && zonaDe(o, t) === k)
  const res = o.tickets.filter((t) => zonaDe(o, t) === k && t.primeraResolucion)
  const en = res.filter((t) => t.primeraResolucion! <= t.venceResolucion).length
  return {
    k, ts,
    cola: ts.filter((t) => etapaDe(t) === 'cola').length,
    aten: ts.filter((t) => etapaDe(t) === 'atencion').length,
    ocup: z.gente.filter((g) => ts.some((t) => etapaDe(t) === 'atencion' && t.responsable === g)).length,
    tot: z.gente.length,
    riesgo: ts.filter((t) => { const n = nivelSla(t, o.ahora).nivel; return n === 'vencido' || n === 'en-riesgo' }).length,
    res: res.length,
    sla: res.length ? Math.round((en / res.length) * 100) : null,
  }
}
/** Reasignaciones por carga (HU-046, REASSIGNMENT_CARGA) de los tickets de un área, más recientes primero. */
export function reasignacionesCarga(o: Datos, k: string): Fila[] {
  const deZona = new Set(o.tickets.filter((t) => zonaDe(o, t) === k).map((t) => t.id))
  return o.filasAsignacion.filter((q) => q['motivo'] === 'REASSIGNMENT_CARGA' && deZona.has(q.ticketId))
    .sort((a, b) => b.fecha.getTime() - a.fecha.getTime()).slice(0, 5)
}

// ------------------------------------------------------------------ HU-067 CA-06 y CA-10: indicadores y marcador del equipo
/** Marcador del equipo (el del visor anterior): 10 puntos por resuelto en SLA (+5 con rayo), 3 fuera; nivel cada 100 × nivel. */
export function equipo(o: Datos) {
  const ts = o.tickets.filter((t) => t.primeraResolucion).sort((a, b) => a.primeraResolucion!.getTime() - b.primeraResolucion!.getTime())
  let xp = 0, nivel = 1, racha = 0
  for (const t of ts) {
    if (t.primeraResolucion! <= t.venceResolucion) {
      racha++
      xp += 10 + (o.rayos.some((r) => r.ticketId === t.id && r['accion'] === 'MARCADO') ? 5 : 0)
    } else { racha = 0; xp += 3 }
    while (xp >= nivel * 100) { xp -= nivel * 100; nivel++ }
  }
  const enSla = ts.filter((t) => t.primeraResolucion! <= t.venceResolucion).length
  return { xp, nivel, racha, meta: nivel * 100, enSla, resueltos: ts.length }
}
/** CSAT del día (encuestas respondidas hoy en el reloj del modelo) y, aparte, el acumulado de todas las respondidas. */
export function csatDia(o: Datos): { hoy: number | null; nHoy: number; acumulado: number | null; n: number } {
  const resp = o.encuestas.filter((e) => e['respuesta'])
  const hoy = resp.filter((e) => new Date(e['respuesta'].fecha).toDateString() === o.ahora.toDateString())
  const prom = (xs: Fila[]) => (xs.length ? xs.reduce((s, e) => s + e['respuesta'].csat, 0) / xs.length : null)
  return { hoy: prom(hoy), nHoy: hoy.length, acumulado: prom(resp), n: resp.length }
}
/** «NPS del turno» de Daniel (aceptado el 20-oct): 72 % promotores y 18 % pasivos sobre las encuestas respondidas. */
export function npsTurno(o: Datos): { valor: number | null; n: number } {
  const n = o.encuestas.filter((e) => e['respuesta']).length
  if (!n) return { valor: null, n }
  const pr = Math.round(n * 0.72), pa = Math.round(n * 0.18), de = Math.max(0, n - pr - pa)
  return { valor: Math.round(((pr - de) / n) * 100), n }
}

// ------------------------------------------------------------------ simulación (HU-067 CA-08): ejemplos de entrada
/** Lo que entra por cada canal (tipo del modelo, canal y resumen de ejemplo). */
export const EJEMPLOS_CANAL: Record<string, [string, string, string]> = {
  tel: ['CTA', 'Teléfono', 'Solicita su estado de cuenta y el cronograma de cuotas actualizado'],
  wa: ['GAR', 'WhatsApp', 'Envía fotos de una fisura en el muro del lote para revisar la garantía'],
  mail: ['QUE', 'Correo', 'Queja por la demora en la entrega de la minuta'],
  portal: ['RSV', 'Mi Portal', 'Consulta de cupo en el bus del Entrega Fest y su pase QR'],
  form: ['ING', 'Formulario simple', 'Visita del propietario a obra registrada en el pórtico'],
}
export const ORDEN_CANALES = ['tel', 'wa', 'mail', 'portal', 'form']
/** Ejemplos para «+ Ticket hacia la sala» (Libro y Legal no: el asiento y el paquete del Eje 3 se hacen desde el ticket). */
export const EJEMPLOS_SALA: Record<string, [string, string, string]> = {
  eje1: ['PED', 'Correo', 'Pedido de copia simple del contrato'],
  cob: ['CTA', 'WhatsApp', 'Validación de un voucher de cuota pagada en agente bancario'],
  post: ['GAR', 'WhatsApp', 'Inspección de una fisura en el muro perimétrico (garantía)'],
  proy: ['RSV', 'Mi Portal', 'Confirmación de asistencia familiar al Entrega Fest'],
}
const EJEMPLOS_RITMO: [string, string, string][] = [
  ['CTA', 'Teléfono', 'Solicita su estado de cuenta y el cronograma de cuotas actualizado'],
  ['CTA', 'WhatsApp', 'Envía el voucher de una cuota pagada en agente bancario para validarla'],
  ['QUE', 'Correo', 'Queja por la demora en la entrega de la minuta'],
  ['GAR', 'WhatsApp', 'Envía fotos de una fisura en el muro del lote para revisar la garantía'],
  ['CTA', 'Correo', 'Pide la constancia de no adeudo de su lote'],
  ['QUE', 'Teléfono', 'Queja por la atención recibida en la caseta del proyecto'],
]
export const clienteEjemplo = (i: number): string => CLIENTES[(i * 7) % Math.min(30, CLIENTES.length)]!.id

/** Un paso del ritmo de la planta (el del visor anterior): entra un ticket, uno asignado pasa a atención, uno en atención se
 *  resuelve o el reloj avanza 1 h hábil (el job de SLA avisa los vencidos). Actúa sobre los tickets visibles. */
export async function pasoSimulacion(o: Datos, paso: number, enAtencion: Map<string, number>): Promise<void> {
  try {
    if (paso % 4 === 0) {
      const [tipo, canal, resumen] = EJEMPLOS_RITMO[(paso / 4) % EJEMPLOS_RITMO.length]!
      vivo.entrante(tipo, canal, clienteEjemplo(paso), resumen)
    } else if (paso % 4 === 1) {
      const t = o.tickets.find((q) => q.estado === 'OPEN' && q.responsable)
      if (t) await api.cambiarEstado(t.id, 'IN_PROGRESS', null)
    } else if (paso % 4 === 2) {
      const t = o.tickets.find((q) => q.estado === 'IN_PROGRESS' && (enAtencion.get(q.id) ?? 0) >= 2)
      if (t) await api.cambiarEstado(t.id, 'RESOLVED', 'Resuelto desde la operación en vivo')
    } else if (paso % 8 === 3) simulacion.avanzar(1)
    for (const t of o.tickets) if (t.estado === 'IN_PROGRESS') enAtencion.set(t.id, (enAtencion.get(t.id) ?? 0) + 1)
  } catch { /* una regla del modelo lo impidió (permiso, transición): el siguiente paso sigue */ }
}
