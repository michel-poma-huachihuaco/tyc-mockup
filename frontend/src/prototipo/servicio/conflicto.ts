import { DIRECTOR_UX, ELEMENTOS_HANDOFF, ESPECIALISTA_LEGAL, JEFATURA_LEGAL, NOMBRE_SENAL, PALABRAS_DE_JUICIO } from '../datos/catalogos.ts'
import type { Senal } from '../datos/catalogos.ts'
import { diasHabilesEntre } from './calendario.ts'
import { enviarALegal } from './ola7.ts'
import {
  ErrorSimulado,
  TRANSICIONES,
  actorDe,
  cambiarEstado,
  conTicket,
  detectarPii,
  emitir,
  exigir,
  invalido,
  nuevoId,
  puede,
  senalesActivas,
  ticketDe,
} from './nucleo.ts'
import type { CampoInvalido, Datos } from './nucleo.ts'

/**
 * Gate de derivación a Eje 3 (ola 3: HU-ATC-026, 027 y 028): señales de conflicto,
 * paquete mínimo de handoff con confirmación de recepción y nota de estado emocional sin
 * juicios de valor. El bloqueo de la resolución en Eje 1/2 vive en el núcleo
 * (cambiarEstado y derivar), porque es una regla del ciclo de vida del ticket.
 */

// ── Modelo ──────────────────────────────────────────────────────────────────

/** Historial de señales: marcar y retirar son filas nuevas (CA-03 de HU-ATC-026). */
export interface FilaSenal {
  readonly id: string
  readonly ticketId: string
  readonly senal: Senal
  readonly accion: 'MARCADA' | 'RETIRADA'
  readonly fecha: Date
  readonly autor: string
  readonly justificacion: string | null
}

export type ElementosHandoff = Readonly<Record<(typeof ELEMENTOS_HANDOFF)[number]['id'], string>>

export interface Handoff {
  readonly id: string
  readonly ticketId: string
  readonly elementos: ElementosHandoff
  readonly enviado: Date
  readonly autor: string
  readonly destinatario: string
  readonly confirmado: { readonly fecha: Date; readonly autor: string } | null
}

export interface NotaEmocional {
  readonly id: string
  readonly ticketId: string
  readonly fecha: Date
  readonly autor: string
  readonly texto: string
}

export interface Aviso {
  readonly id: string
  readonly fecha: Date
  readonly destinatario: string
  readonly tipo: 'VOCERIA_DIRECTOR_UX' | 'HANDOFF_SIN_CONFIRMAR'
  readonly ticketId: string
  readonly mensaje: string
}

// ── Consultas ───────────────────────────────────────────────────────────────

export { senalesActivas }

export const handoffDe = (d: Datos, ticketId: string) => d.handoffs.filter((h) => h.ticketId === ticketId).at(-1) ?? null
export const notaEmocionalVigente = (d: Datos, ticketId: string) => d.notasEmocionales.filter((n) => n.ticketId === ticketId).at(-1) ?? null

const sinTildes = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

/** Las palabras de juicio que aparecen en el texto (CA-03 de HU-ATC-028). */
export function palabrasDeJuicio(texto: string): string[] {
  const palabras = new Set(sinTildes(texto).split(/[^a-zñ]+/))
  return PALABRAS_DE_JUICIO.filter((p) => palabras.has(sinTildes(p)))
}

// ── Señales (HU-ATC-026) ────────────────────────────────────────────────────

export function marcarSenales(d: Datos, ticketId: string, senales: readonly Senal[], actorId: string): Datos {
  exigir(puede.atender(actorDe(actorId).rol), 'marcar señales de conflicto')
  const t = ticketDe(d, ticketId)
  if (!senales.length) throw invalido([{ campo: 'senales', mensaje: 'Marca al menos una señal.' }])
  if (t.estado === 'CLOSED') throw new ErrorSimulado(409, 'ticket-cerrado', 'El ticket está cerrado: reábrelo para marcar una señal.')
  const activas = senalesActivas(d, ticketId)
  let s = d
  for (const senal of senales) {
    if (activas.includes(senal)) continue
    let id: string
    ;[id, s] = nuevoId(s, 'sen')
    s = { ...s, senales: [...s.senales, { id, ticketId, senal, accion: 'MARCADA', fecha: d.ahora, autor: actorId, justificacion: null }] }
    s = emitir(s, 'gate_conflicto', { senal, eje: t.eje })
  }
  return s
}

export function retirarSenal(d: Datos, ticketId: string, senal: Senal, justificacion: string, actorId: string): Datos {
  // SUPUESTO (pregunta abierta de FT-ATC-07: «¿qué rol retira una señal marcada por error?»): el supervisor ATC.
  exigir(actorDe(actorId).rol === 'SUPERVISOR', 'retirar señales de conflicto')
  if (!senalesActivas(d, ticketId).includes(senal)) throw new ErrorSimulado(409, 'senal-inactiva', `La señal «${NOMBRE_SENAL[senal]}» no está activa.`)
  const campos: CampoInvalido[] = []
  if (!justificacion.trim()) campos.push({ campo: 'justificacion', mensaje: 'Justifica por qué la señal se marcó por error.' })
  const pii = detectarPii(justificacion)
  if (pii) campos.push({ campo: 'justificacion', mensaje: pii })
  if (campos.length) throw invalido(campos)
  const [id, s] = nuevoId(d, 'sen')
  return {
    ...s,
    senales: [...s.senales, { id, ticketId, senal, accion: 'RETIRADA', fecha: d.ahora, autor: actorId, justificacion: justificacion.trim() }],
  }
}

// ── Nota de estado emocional (HU-ATC-028) ───────────────────────────────────

export function registrarNotaEmocional(d: Datos, ticketId: string, texto: string, actorId: string): Datos {
  exigir(puede.atender(actorDe(actorId).rol), 'registrar la nota de estado emocional')
  ticketDe(d, ticketId)
  const campos: CampoInvalido[] = []
  if (!texto.trim()) campos.push({ campo: 'texto', mensaje: 'Describe cómo se encuentra el cliente.' })
  const juicio = palabrasDeJuicio(texto)
  if (juicio.length)
    campos.push({ campo: 'texto', mensaje: `Reformula sin juicios de valor: ${juicio.map((p) => `«${p}»`).join(', ')}. Describe lo que observaste (lo que dijo, el tono, lo que pidió).` })
  const pii = detectarPii(texto)
  if (pii) campos.push({ campo: 'texto', mensaje: pii })
  if (campos.length) throw invalido(campos)
  const [id, s] = nuevoId(d, 'emo')
  return { ...s, notasEmocionales: [...s.notasEmocionales, { id, ticketId, fecha: d.ahora, autor: actorId, texto: texto.trim() }] }
}

// ── Handoff a Eje 3 (HU-ATC-027 y CA-02 de HU-ATC-028) ──────────────────────

export function enviarHandoff(d: Datos, ticketId: string, elementos: ElementosHandoff, actorId: string): Datos {
  exigir(puede.atender(actorDe(actorId).rol), 'derivar a Eje 3')
  const t = ticketDe(d, ticketId)
  if (t.estado === 'CLOSED' || t.estado === 'RESOLVED') throw new ErrorSimulado(409, 'ticket-resuelto', 'El ticket ya está resuelto o cerrado: reábrelo para derivarlo.')
  if (t.eje === 3) throw new ErrorSimulado(409, 'ya-en-eje-3', 'El ticket ya está en Eje 3.')
  const campos: CampoInvalido[] = ELEMENTOS_HANDOFF.filter((e) => !elementos[e.id]?.trim()).map((e) => ({ campo: e.id, mensaje: `Falta: ${e.nombre.toLowerCase()}.` }))
  const conflicto = senalesActivas(d, ticketId).length > 0
  // SUPUESTO (RN-SVC-024): un conflicto no se deriva sin la nota de estado emocional.
  if (conflicto && !notaEmocionalVigente(d, ticketId)) campos.push({ campo: 'emocional', mensaje: 'Registra antes la nota de estado emocional del cliente (RN-SVC-024).' })
  for (const e of ELEMENTOS_HANDOFF) {
    const pii = e.id === 'atencion' || e.id === 'paso' ? detectarPii(elementos[e.id] ?? '') : null
    if (pii) campos.push({ campo: e.id, mensaje: pii })
  }
  if (campos.length) throw invalido(campos)

  let s = d
  let id: string
  ;[id, s] = nuevoId(s, 'fa')
  s = {
    ...s,
    filasAsignacion: [
      ...s.filasAsignacion,
      { id, ticketId, fecha: d.ahora, deArea: t.area, deResponsable: t.responsable, aArea: 'LEGAL', aResponsable: ESPECIALISTA_LEGAL, motivo: 'DERIVACION_CONFLICTO_EJE3', nota: 'Paquete mínimo de handoff completo (6/6).', autor: actorId },
    ],
  }
  s = conTicket(s, { ...ticketDe(s, ticketId), area: 'LEGAL', responsable: ESPECIALISTA_LEGAL })
  // Escalar = Eje 3 (supuesto de la ola 1); si el estado no lo permite, el eje se fija igual.
  s = TRANSICIONES[t.estado].includes('ESCALATED') ? cambiarEstado(s, ticketId, 'ESCALATED', actorId, 'Derivado a Eje 3 con paquete mínimo') : conTicket(s, { ...ticketDe(s, ticketId), eje: 3 })
  ;[id, s] = nuevoId(s, 'hof')
  s = { ...s, handoffs: [...s.handoffs, { id, ticketId, elementos: { ...elementos }, enviado: d.ahora, autor: actorId, destinatario: ESPECIALISTA_LEGAL, confirmado: null }] }
  if (conflicto) {
    ;[id, s] = nuevoId(s, 'avi')
    s = {
      ...s,
      avisos: [
        ...s.avisos,
        { id, fecha: d.ahora, destinatario: DIRECTOR_UX, tipo: 'VOCERIA_DIRECTOR_UX', ticketId, mensaje: `Conflicto derivado a Eje 3 (${t.numero}). Coordinar vocería; el atendedor no da respuesta pública.` },
      ],
    }
  }
  return enviarALegal(emitir(s, 'handoff', { completo: true, confirmado: false }), ticketId, elementos)
}

export function confirmarHandoff(d: Datos, ticketId: string, actorId: string): Datos {
  exigir(actorDe(actorId).rol === 'LEGAL_RECLAMOS', 'confirmar la recepción en Eje 3')
  const h = handoffDe(d, ticketId)
  if (!h) throw new ErrorSimulado(404, 'sin-handoff', 'Este ticket no tiene un handoff a Eje 3.')
  if (h.confirmado) throw new ErrorSimulado(409, 'ya-confirmado', 'La recepción ya está confirmada.')
  const s = { ...d, handoffs: d.handoffs.map((x) => (x.id === h.id ? { ...x, confirmado: { fecha: d.ahora, autor: actorId } } : x)) }
  return emitir(s, 'handoff', { completo: true, confirmado: true })
}

/** CA-03 de HU-ATC-027: handoff sin confirmar tras 1 día hábil → aviso a la jefatura del eje destino. */
export function controlarHandoffs(d: Datos): [Datos, { readonly avisos: number }] {
  let s = d
  let avisos = 0
  const ya = new Set(d.avisos.filter((a) => a.tipo === 'HANDOFF_SIN_CONFIRMAR').map((a) => a.ticketId))
  for (const h of d.handoffs) {
    if (h.confirmado || ya.has(h.ticketId) || diasHabilesEntre(h.enviado, d.ahora) < 1) continue
    const t = d.tickets.find((x) => x.id === h.ticketId)
    let id: string
    ;[id, s] = nuevoId(s, 'avi')
    s = {
      ...s,
      avisos: [...s.avisos, { id, fecha: d.ahora, destinatario: JEFATURA_LEGAL, tipo: 'HANDOFF_SIN_CONFIRMAR', ticketId: h.ticketId, mensaje: `El handoff de ${t?.numero ?? h.ticketId} lleva más de 1 día hábil sin confirmar.` }],
    }
    avisos++
  }
  return [s, { avisos }]
}
