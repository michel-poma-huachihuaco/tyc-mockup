import {
  AREAS,
  CANAL_ALERTAS,
  DESTINATARIO_ALERTAS,
  ESTADOS_ACTIVOS,
  LIMITE_E2E_HORAS,
  LIMITE_EJE3_HORAS,
  NOMBRE_ESTADO,
  UMBRAL_POR_VENCER,
  empresa,
  persona,
} from '../datos/catalogos.ts'
import type { Area, Canal, Estado, Politica, Prioridad, Rol, Senal } from '../datos/catalogos.ts'
import { horasHabilesEntre, sumarHorasHabiles } from './calendario.ts'
import type { AlertaLegal, Apelacion, Asiento, ExcepcionIntegridad, FilaApelacion, FilaPlazo } from './libro.ts'
import type { Aviso, FilaSenal, Handoff, NotaEmocional } from './conflicto.ts'
import type { Caso, Escalamiento, Evidencia, FilaCaso, FilaRiesgo } from './mesa.ts'
import type { FilaGarantia, Garantia } from './garantias.ts'
import { dispararEncuesta, publicarEventoUrbe } from './ola5.ts'
import { estamparFlujo } from './ola6.ts'
import type { AlertaOps, DecisionIA, EventoRayo, Flujo, FlujoDeTicket, Guia } from './ola6.ts'
import type { CasoResolucion, Carta, Constancia, FilaResolucion, Notificacion, ReservaBus } from './ola8.ts'
import type { AlertaRiesgo, ConsultaMotorLog, FuenteId, Interesado, Llamada, SincLegal } from './ola7.ts'
import type { AuditoriaDatos, CasoFest, Encuesta, Informe, RegistroParalelo, Urbe, VinculoCiudad } from './ola5.ts'

/**
 * El núcleo del servicio simulado: el estado de la consola y sus reglas, como funciones
 * puras (estado → estado nuevo). No sabe de React, de latencia ni de red: eso lo pone
 * `api.ts`. Las bitácoras (estados, asignaciones, interacciones, alertas) solo crecen: no
 * hay ninguna función que edite o borre una fila (RN-SVC-006, RNF-AUD-004).
 */

// ── Modelo ──────────────────────────────────────────────────────────────────

export type OrigenPolitica = 'especifica' | 'generica' | 'global'

export interface Ticket {
  readonly id: string
  /** N.º visible al cliente, correlativo por razón social. SUPUESTO: `SIGLA-000000`. */
  readonly numero: string
  readonly empresaId: string
  readonly linea: string
  readonly canal: Canal
  readonly establecimiento: string | null
  readonly clienteId: string
  readonly tipo: string
  readonly prioridad: Prioridad
  readonly resumen: string
  readonly descripcion: string
  readonly estado: Estado
  readonly area: Area
  readonly responsable: string | null
  /** 1: ATC · 2: derivado a un área · 3: escalado. */
  readonly eje: 1 | 2 | 3
  readonly abierto: Date
  readonly registradoPor: string
  /** La política con la que se congelaron los vencimientos (RN-SVC-002). */
  readonly politica: { readonly id: string; readonly version: number; readonly origen: OrigenPolitica; readonly respuestaH: number; readonly resolucionH: number }
  readonly venceRespuesta: Date
  readonly venceResolucion: Date
  readonly primeraRespuesta: Date | null
  readonly primeraResolucion: Date | null
  readonly ultimaResolucion: Date | null
  readonly cierre: Date | null
  readonly reaperturas: number
  readonly venceReapertura: Date | null
  /** Inicio del ciclo vigente: la apertura o la última reapertura. */
  readonly inicioCiclo: Date
}

export interface FilaEstado {
  readonly id: string
  readonly ticketId: string
  readonly fecha: Date
  readonly de: Estado | null
  readonly a: Estado
  /** null: cambio automático del sistema (CA-03 de HU-ATC-004). */
  readonly autor: string | null
  readonly nota: string | null
}

export interface FilaAsignacion {
  readonly id: string
  readonly ticketId: string
  readonly fecha: Date
  readonly deArea: Area | null
  readonly deResponsable: string | null
  readonly aArea: Area
  readonly aResponsable: string | null
  readonly motivo: string
  readonly nota: string | null
  readonly autor: string
}

export interface Adjunto {
  readonly nombre: string
  readonly tamano: number
  readonly tipo: string
}

export interface Interaccion {
  readonly id: string
  readonly ticketId: string
  readonly fecha: Date
  /** `mensaje`: respuesta visible al cliente · `nota`: interna · `cliente`: lo que escribió el cliente. */
  readonly tipo: 'mensaje' | 'nota' | 'cliente'
  readonly visible: boolean
  readonly canal: Canal | 'Mi Portal' | null
  /** Persona que la registró; en `cliente`, null. */
  readonly autor: string | null
  readonly texto: string
  readonly adjuntos: readonly Adjunto[]
}

export type TipoAlerta = 'FIRST_RESPONSE_OVERDUE' | 'RESOLUTION_OVERDUE'

export interface Alerta {
  readonly id: string
  readonly ticketId: string
  readonly tipo: TipoAlerta
  readonly ciclo: number
  readonly vencimientoEvaluado: Date
  readonly fecha: Date
  readonly destinatario: string
  readonly canal: string
}

export interface AlertaConfiguracion {
  readonly id: string
  readonly fecha: Date
  readonly ticketId: string
  readonly mensaje: string
}

export interface EjecucionJob {
  readonly id: string
  readonly fecha: Date
  readonly nuevas: number
  readonly omitidas: number
}

export interface Evento {
  readonly id: string
  readonly fecha: Date
  readonly nombre: string
  readonly datos: Readonly<Record<string, string | number | boolean>>
}

export interface Auditoria {
  readonly id: string
  readonly fecha: Date
  readonly actor: string
  readonly accion: string
  readonly detalle: string
}

export interface Datos {
  readonly ahora: Date
  readonly contador: number
  readonly secuencias: Readonly<Record<string, number>>
  readonly politicas: readonly Politica[]
  readonly tickets: readonly Ticket[]
  readonly filasEstado: readonly FilaEstado[]
  readonly filasAsignacion: readonly FilaAsignacion[]
  readonly interacciones: readonly Interaccion[]
  readonly alertas: readonly Alerta[]
  readonly alertasConfiguracion: readonly AlertaConfiguracion[]
  readonly ejecuciones: readonly EjecucionJob[]
  readonly eventos: readonly Evento[]
  readonly auditoria: readonly Auditoria[]
  // Libro de Reclamaciones (ola 2, libro.ts)
  readonly asientos: readonly Asiento[]
  readonly filasPlazo: readonly FilaPlazo[]
  readonly apelaciones: readonly Apelacion[]
  readonly filasApelacion: readonly FilaApelacion[]
  readonly alertasLegales: readonly AlertaLegal[]
  readonly excepciones: readonly ExcepcionIntegridad[]
  // Gate a Eje 3 y Mesa de Casos SGD (ola 3, conflicto.ts y mesa.ts)
  readonly senales: readonly FilaSenal[]
  readonly handoffs: readonly Handoff[]
  readonly notasEmocionales: readonly NotaEmocional[]
  readonly avisos: readonly Aviso[]
  readonly casos: readonly Caso[]
  readonly filasCaso: readonly FilaCaso[]
  readonly filasRiesgo: readonly FilaRiesgo[]
  readonly escalamientos: readonly Escalamiento[]
  readonly evidencias: readonly Evidencia[]
  // Garantías postventa (ola 4, garantias.ts)
  readonly garantias: readonly Garantia[]
  readonly filasGarantia: readonly FilaGarantia[]
  // Ola 5 (ola5.ts)
  readonly vinculosCiudad: readonly VinculoCiudad[]
  readonly urbe: Urbe
  readonly encuestas: readonly Encuesta[]
  readonly informes: readonly Informe[]
  readonly registrosParalelos: readonly RegistroParalelo[]
  readonly auditoriasDatos: readonly AuditoriaDatos[]
  readonly casosFest: readonly CasoFest[]
  // Ola 6 (ola6.ts)
  readonly flujos: readonly Flujo[]
  readonly flujosDeTicket: readonly FlujoDeTicket[]
  readonly rayos: readonly EventoRayo[]
  readonly guias: readonly Guia[]
  readonly decisionesIA: readonly DecisionIA[]
  readonly alertasOps: readonly AlertaOps[]
  readonly ausentes: readonly string[]
  // Ola 7 (ola7.ts)
  readonly fuentesCaidas: readonly FuenteId[]
  readonly interesados: readonly Interesado[]
  readonly llamadas: readonly Llamada[]
  readonly consultasMotor: readonly ConsultaMotorLog[]
  readonly sincLegal: readonly SincLegal[]
  readonly alertasRiesgo: readonly AlertaRiesgo[]
  // Ola 8 (ola8.ts)
  readonly casosResolucion: readonly CasoResolucion[]
  readonly filasResolucion: readonly FilaResolucion[]
  readonly constancias: readonly Constancia[]
  readonly cartas: readonly Carta[]
  readonly notificaciones: readonly Notificacion[]
  readonly reservasBus: readonly ReservaBus[]
}

// ── Errores ─────────────────────────────────────────────────────────────────

export interface CampoInvalido {
  readonly campo: string
  readonly mensaje: string
}

/**
 * Error del servicio simulado, con la forma de `ErrorAybar` de @aybarcorp/http (status,
 * código, detalle, campos, correlationId) para que las pantallas lo traten igual que lo
 * tratarán con el backend real.
 */
export class ErrorSimulado extends Error {
  readonly status: number
  readonly codigo: string
  readonly campos: readonly CampoInvalido[]
  readonly correlationId: string
  /** Se deja constancia en la auditoría (intentos sin permiso, edición de bitácoras). */
  readonly auditar: boolean

  constructor(status: number, codigo: string, mensaje: string, opciones: { campos?: CampoInvalido[]; auditar?: boolean } = {}) {
    super(mensaje)
    this.name = 'ErrorSimulado'
    this.status = status
    this.codigo = codigo
    this.campos = opciones.campos ?? []
    this.auditar = opciones.auditar ?? false
    this.correlationId = `sim-${Math.random().toString(16).slice(2, 10)}`
  }
}

export const invalido = (campos: CampoInvalido[]) =>
  new ErrorSimulado(400, 'validacion', 'Revisa los campos marcados.', { campos })

// ── Permisos ────────────────────────────────────────────────────────────────

const ROLES_ATENCION: readonly Rol[] = ['GESTOR', 'COLABORADOR', 'SUPERVISOR', 'LEGAL_RECLAMOS', 'MESA_SGD']

export const puede = {
  registrar: (rol: Rol) => ROLES_ATENCION.includes(rol),
  atender: (rol: Rol) => ROLES_ATENCION.includes(rol),
  reasignarEnBloque: (rol: Rol) => rol === 'SUPERVISOR',
  editarPoliticas: (rol: Rol) => rol === 'SUPERVISOR',
  verCierreE2E: (rol: Rol) => rol === 'COORDINADOR_CX' || rol === 'SUPERVISOR',
  verAlertas: (rol: Rol) => rol === 'SUPERVISOR' || rol === 'COORDINADOR_CX',
  /** SUPUESTO: registran el asiento quienes atienden; lo gestiona (prórroga, respuesta, apelación) solo legal. */
  registrarAsiento: (rol: Rol) => ROLES_ATENCION.includes(rol),
  gestionarLibro: (rol: Rol) => rol === 'LEGAL_RECLAMOS',
  verLibro: (rol: Rol) => ROLES_ATENCION.includes(rol) || rol === 'COORDINADOR_CX',
  /** RNF-SEC-008: hechos y pedido del asiento solo para atención y legal. */
  verNarrativa: (rol: Rol) => ROLES_ATENCION.includes(rol),
  /** SUPUESTO: la Mesa SGD opera los casos; Legal los consulta; nadie más los ve (acceso indebido anula el IGDC). */
  operarMesa: (rol: Rol) => rol === 'MESA_SGD',
  verMesa: (rol: Rol) => rol === 'MESA_SGD' || rol === 'LEGAL_RECLAMOS',
}

export function actorDe(id: string) {
  const p = persona(id)
  if (!p) throw new ErrorSimulado(401, 'sin-sesion', 'No hay una persona válida en la sesión.')
  return p
}

export function exigir(permitido: boolean, accion: string) {
  if (!permitido) throw new ErrorSimulado(403, 'sin-permiso', `Tu rol no permite ${accion}.`, { auditar: true })
}

// ── Utilidades internas ─────────────────────────────────────────────────────

export function nuevoId(d: Datos, prefijo: string): [string, Datos] {
  const n = d.contador + 1
  return [`${prefijo}-${n}`, { ...d, contador: n }]
}

export function emitir(d: Datos, nombre: string, datos: Evento['datos']): Datos {
  const [id, d2] = nuevoId(d, 'ev')
  return { ...d2, eventos: [...d2.eventos, { id, fecha: d.ahora, nombre, datos }] }
}

export function auditar(d: Datos, actor: string, accion: string, detalle: string): Datos {
  const [id, d2] = nuevoId(d, 'au')
  return { ...d2, auditoria: [...d2.auditoria, { id, fecha: d.ahora, actor, accion, detalle }] }
}

export function ticketDe(d: Datos, id: string): Ticket {
  const t = d.tickets.find((x) => x.id === id)
  if (!t) throw new ErrorSimulado(404, 'no-encontrado', 'El ticket no existe.')
  return t
}

export const conTicket = (d: Datos, t: Ticket): Datos => ({ ...d, tickets: d.tickets.map((x) => (x.id === t.id ? t : x)) })

// ── Gate de conflicto (RN-SVC-021; ola 3) ───────────────────────────────────

/** Señales de conflicto vigentes del ticket: marcadas y no retiradas. */
export function senalesActivas(d: Datos, ticketId: string): Senal[] {
  const ultima = new Map<Senal, 'MARCADA' | 'RETIRADA'>()
  for (const f of d.senales) if (f.ticketId === ticketId) ultima.set(f.senal, f.accion)
  return [...ultima].filter(([, a]) => a === 'MARCADA').map(([s]) => s)
}

/** Por qué no se puede resolver o cerrar por el gate de conflicto; null si se puede. */
export function motivoGateConflicto(d: Datos, t: Ticket, a: Estado): string | null {
  if ((a === 'RESOLVED' || a === 'CLOSED') && t.eje !== 3 && senalesActivas(d, t.id).length)
    return 'Gate no compensable (RN-SVC-021): con señal de conflicto no se resuelve en Eje 1/2. Deriva primero a Eje 3.'
  return null
}

// ── DLP (RN-SVC-012) ────────────────────────────────────────────────────────

const PATRON_DNI = /(?<!\d)\d{8}(?!\d)/
const PATRON_TARJETA = /(?<![\d])(?:\d[ -]?){12,18}\d(?![\d])/

/** Mensaje de error si el texto lleva un DNI o un número de tarjeta; null si no. */
export function detectarPii(texto: string): string | null {
  if (PATRON_TARJETA.test(texto)) return 'Parece un número de tarjeta. En las notas de bitácora no se permite PII (RN-SVC-012): escribe solo el motivo operativo.'
  if (PATRON_DNI.test(texto)) return 'Parece un DNI. En las notas de bitácora no se permite PII (RN-SVC-012): escribe solo el motivo operativo.'
  return null
}

// ── SLA (RN-SVC-001, 002, 003, 007) ─────────────────────────────────────────

/** Precedencia: tipo + prioridad > genérica del tipo > genérica global. */
export function elegirPolitica(politicas: readonly Politica[], tipo: string, prioridad: Prioridad): { politica: Politica; origen: OrigenPolitica } {
  const especifica = politicas.find((p) => p.tipo === tipo && p.prioridad === prioridad)
  if (especifica) return { politica: especifica, origen: 'especifica' }
  const generica = politicas.find((p) => p.tipo === tipo && p.prioridad === null)
  if (generica) return { politica: generica, origen: 'generica' }
  const global = politicas.find((p) => p.tipo === null)
  if (!global) throw new ErrorSimulado(500, 'sin-politica-global', 'No hay política SLA global configurada.')
  return { politica: global, origen: 'global' }
}

export function previsualizarSla(d: Datos, tipo: string, prioridad: Prioridad, apertura: Date) {
  const { politica, origen } = elegirPolitica(d.politicas, tipo, prioridad)
  return {
    politica,
    origen,
    venceRespuesta: sumarHorasHabiles(apertura, politica.respuestaH),
    venceResolucion: sumarHorasHabiles(apertura, politica.resolucionH),
  }
}

/** El vencimiento de resolución del ciclo vigente: el original o el de la última reapertura. */
export const venceResolucionVigente = (t: Ticket) => t.venceReapertura ?? t.venceResolucion

export type NivelSla = 'en-plazo' | 'en-riesgo' | 'vencido' | 'cumplido' | 'fuera-de-plazo'

export interface EstadoSla {
  readonly nivel: NivelSla
  readonly hito: 'respuesta' | 'resolucion'
  readonly vence: Date
}

/** SUPUESTO: «en riesgo» con menos del 25 % del tiempo del hito por delante (como la referencia). */
export function estadoSla(t: Ticket, ahora: Date): EstadoSla {
  const vence = venceResolucionVigente(t)
  if (t.estado === 'RESOLVED' || t.estado === 'CLOSED') {
    const resuelto = t.ultimaResolucion ?? t.cierre ?? ahora
    return { nivel: resuelto <= vence ? 'cumplido' : 'fuera-de-plazo', hito: 'resolucion', vence }
  }
  const hito = !t.primeraRespuesta && t.reaperturas === 0 ? 'respuesta' : 'resolucion'
  const objetivo = hito === 'respuesta' ? t.venceRespuesta : vence
  if (ahora > objetivo) return { nivel: 'vencido', hito, vence: objetivo }
  const inicio = hito === 'respuesta' ? t.abierto : t.inicioCiclo
  const total = objetivo.getTime() - inicio.getTime()
  const queda = objetivo.getTime() - ahora.getTime()
  return { nivel: total > 0 && queda / total < 0.25 ? 'en-riesgo' : 'en-plazo', hito, vence: objetivo }
}

// ── Cierre end-to-end (RN-SVC-025, HU-ATC-029) ──────────────────────────────

export interface CierreE2E {
  readonly horas: number
  readonly limite: number
  readonly escalado: boolean
  readonly nivel: 'en-plazo' | 'por-vencer' | 'en-riesgo' | 'cerrado'
}

export function cierreE2E(t: Ticket, ahora: Date): CierreE2E {
  const escalado = t.eje === 3
  const limite = escalado ? LIMITE_EJE3_HORAS : LIMITE_E2E_HORAS
  const fin = t.estado === 'CLOSED' && t.cierre ? t.cierre : ahora
  const horas = horasHabilesEntre(t.abierto, fin)
  if (t.estado === 'CLOSED') return { horas, limite, escalado, nivel: 'cerrado' }
  const nivel = horas >= limite ? 'en-riesgo' : horas >= limite * UMBRAL_POR_VENCER ? 'por-vencer' : 'en-plazo'
  return { horas, limite, escalado, nivel }
}

// ── Registrar un ticket (HU-ATC-001, 002, 003) ──────────────────────────────

export interface EntradaTicket {
  readonly canal: Canal | ''
  readonly clienteId: string
  readonly empresaId: string
  readonly linea: string
  readonly establecimiento: string
  readonly tipo: string
  readonly prioridad: Prioridad | ''
  readonly resumen: string
  readonly descripcion: string
}

export function validarTicket(e: EntradaTicket): CampoInvalido[] {
  const campos: CampoInvalido[] = []
  if (!e.canal) campos.push({ campo: 'canal', mensaje: 'Elige el canal por el que llegó la solicitud.' })
  if (!e.clienteId) campos.push({ campo: 'cliente', mensaje: 'Busca y elige al cliente en SIGDA/TAXON.' })
  if (!e.empresaId) campos.push({ campo: 'empresa', mensaje: 'Elige la empresa (RUC). No se deduce del cliente.' })
  if (!e.linea) campos.push({ campo: 'linea', mensaje: 'Elige la línea de negocio. No se deduce de otro dato.' })
  if (!e.tipo) campos.push({ campo: 'tipo', mensaje: 'Elige el tipo de ticket.' })
  if (!e.prioridad) campos.push({ campo: 'prioridad', mensaje: 'Elige la prioridad.' })
  if (!e.resumen.trim()) campos.push({ campo: 'resumen', mensaje: 'Escribe un resumen de la solicitud.' })
  if (!e.descripcion.trim()) campos.push({ campo: 'descripcion', mensaje: 'Describe la solicitud.' })
  return campos
}

export function crearTicket(d: Datos, entrada: EntradaTicket, actorId: string, apertura: Date = d.ahora): [Datos, Ticket] {
  const actor = actorDe(actorId)
  exigir(puede.registrar(actor.rol), 'registrar tickets')
  const campos = validarTicket(entrada)
  if (campos.length) throw invalido(campos)
  if (!empresa(entrada.empresaId)) throw invalido([{ campo: 'empresa', mensaje: 'Esa empresa no existe.' }])

  const prioridad = entrada.prioridad as Prioridad
  const sla = previsualizarSla(d, entrada.tipo, prioridad, apertura)
  // La secuencia se lee y se incrementa en la misma operación: dos guardados a la vez
  // (CA-03 de HU-ATC-002) nunca reciben el mismo número.
  const n = (d.secuencias[entrada.empresaId] ?? 0) + 1
  const numero = `${entrada.empresaId}-${String(n).padStart(6, '0')}`
  let [id, s] = nuevoId(d, 'tk')
  const area: Area = (AREAS as readonly string[]).includes(actor.area) ? (actor.area as Area) : 'ATC'
  const ticket: Ticket = {
    id,
    numero,
    empresaId: entrada.empresaId,
    linea: entrada.linea,
    canal: entrada.canal as Canal,
    establecimiento: entrada.establecimiento || null,
    clienteId: entrada.clienteId,
    tipo: entrada.tipo,
    prioridad,
    resumen: entrada.resumen.trim(),
    descripcion: entrada.descripcion.trim(),
    estado: 'OPEN',
    area,
    responsable: actor.id,
    eje: area === 'ATC' ? 1 : 2,
    abierto: apertura,
    registradoPor: actor.id,
    politica: { id: sla.politica.id, version: sla.politica.version, origen: sla.origen, respuestaH: sla.politica.respuestaH, resolucionH: sla.politica.resolucionH },
    venceRespuesta: sla.venceRespuesta,
    venceResolucion: sla.venceResolucion,
    primeraRespuesta: null,
    primeraResolucion: null,
    ultimaResolucion: null,
    cierre: null,
    reaperturas: 0,
    venceReapertura: null,
    inicioCiclo: apertura,
  }
  s = { ...s, secuencias: { ...s.secuencias, [entrada.empresaId]: n }, tickets: [...s.tickets, ticket] }
  s = estamparFlujo(s, id)
  let idFila: string
  ;[idFila, s] = nuevoId(s, 'fe')
  s = { ...s, filasEstado: [...s.filasEstado, { id: idFila, ticketId: id, fecha: apertura, de: null, a: 'OPEN', autor: actor.id, nota: null }] }
  ;[idFila, s] = nuevoId(s, 'fa')
  s = {
    ...s,
    filasAsignacion: [
      ...s.filasAsignacion,
      { id: idFila, ticketId: id, fecha: apertura, deArea: null, deResponsable: null, aArea: area, aResponsable: actor.id, motivo: 'ALTA', nota: null, autor: actor.id },
    ],
  }
  if (sla.origen === 'global') {
    ;[idFila, s] = nuevoId(s, 'ac')
    s = {
      ...s,
      alertasConfiguracion: [
        ...s.alertasConfiguracion,
        { id: idFila, fecha: d.ahora, ticketId: id, mensaje: `El tipo ${entrada.tipo} no tiene política activa: se aplicó la genérica global.` },
      ],
    }
  }
  s = emitir(s, 'ticket_creado', { canal: ticket.canal, tipo: ticket.tipo, prioridad: ticket.prioridad, empresa: ticket.empresaId })
  s = emitir(s, 'sla_congelado', { politica: `${sla.politica.id} v${sla.politica.version}`, fr_due: sla.venceRespuesta.toISOString(), res_due: sla.venceResolucion.toISOString() })
  return [s, ticket]
}

// ── Estados (HU-ATC-004, 006, 011) ──────────────────────────────────────────

/** SUPUESTO: matriz de transiciones (el paquete solo fija CLOSED → IN_PROGRESS como inválida). */
export const TRANSICIONES: Readonly<Record<Estado, readonly Estado[]>> = {
  OPEN: ['IN_PROGRESS', 'PENDING_CUSTOMER', 'ESCALATED', 'RESOLVED'],
  IN_PROGRESS: ['PENDING_CUSTOMER', 'ESCALATED', 'RESOLVED'],
  PENDING_CUSTOMER: ['IN_PROGRESS', 'ESCALATED', 'RESOLVED'],
  ESCALATED: ['IN_PROGRESS', 'RESOLVED'],
  RESOLVED: ['CLOSED', 'REOPENED'],
  CLOSED: ['REOPENED'],
  REOPENED: ['IN_PROGRESS', 'PENDING_CUSTOMER', 'ESCALATED', 'RESOLVED'],
}

/** Por qué no se puede pasar de `de` a `a`; null si se puede. */
export function motivoTransicionInvalida(de: Estado, a: Estado): string | null {
  if (de === a) return 'Es el estado actual.'
  if (TRANSICIONES[de].includes(a)) return null
  if (de === 'CLOSED') return 'El ticket está cerrado: primero tienes que reabrirlo.'
  if (a === 'REOPENED') return 'Solo se reabre un ticket resuelto o cerrado.'
  if (a === 'CLOSED') return 'Solo se cierra un ticket resuelto.'
  return `No se pasa de «${NOMBRE_ESTADO[de]}» a «${NOMBRE_ESTADO[a]}».`
}

/** `actorId` null = cambio automático del sistema. */
export function cambiarEstado(d: Datos, ticketId: string, a: Estado, actorId: string | null, nota: string | null = null): Datos {
  if (actorId) exigir(puede.atender(actorDe(actorId).rol), 'cambiar el estado de un ticket')
  const pii = nota ? detectarPii(nota) : null
  if (pii) throw invalido([{ campo: 'nota', mensaje: pii }])
  const t = ticketDe(d, ticketId)
  const razon = motivoTransicionInvalida(t.estado, a)
  if (razon) throw new ErrorSimulado(409, 'transicion-invalida', razon)
  const gate = motivoGateConflicto(d, t, a)
  if (gate) throw new ErrorSimulado(409, 'gate-conflicto', gate, { auditar: true })
  const ahora = d.ahora
  let nuevo: Ticket = { ...t, estado: a }
  if (a === 'RESOLVED') nuevo = { ...nuevo, primeraResolucion: t.primeraResolucion ?? ahora, ultimaResolucion: ahora }
  if (a === 'CLOSED') nuevo = { ...nuevo, cierre: ahora }
  if (a === 'ESCALATED') nuevo = { ...nuevo, eje: 3 }
  if (a === 'REOPENED') {
    // RN-SVC-007: nuevo compromiso con la política vigente al reabrir; el original no se toca.
    const { politica } = elegirPolitica(d.politicas, t.tipo, t.prioridad)
    nuevo = { ...nuevo, reaperturas: t.reaperturas + 1, venceReapertura: sumarHorasHabiles(ahora, politica.resolucionH), inicioCiclo: ahora, cierre: null }
  }
  let [id, s] = nuevoId(d, 'fe')
  s = conTicket(s, nuevo)
  s = { ...s, filasEstado: [...s.filasEstado, { id, ticketId, fecha: ahora, de: t.estado, a, autor: actorId, nota }] }
  s = emitir(s, 'ticket_estado', { de: t.estado, a, autor: actorId ?? 'SISTEMA' })
  if (a === 'REOPENED') s = emitir(s, 'ticket_reabierto', { ciclo: nuevo.reaperturas })
  if (a === 'CLOSED') s = dispararEncuesta(s, ticketId)
  return publicarEventoUrbe(s, ticketId, t.estado, a)
}

// ── Interacciones (HU-ATC-005) ──────────────────────────────────────────────

export interface EntradaInteraccion {
  readonly visible: boolean
  readonly canal: Canal | 'Mi Portal' | null
  readonly texto: string
  readonly adjuntos: readonly Adjunto[]
}

export function registrarInteraccion(d: Datos, ticketId: string, e: EntradaInteraccion, actorId: string): Datos {
  exigir(puede.atender(actorDe(actorId).rol), 'registrar interacciones')
  const t = ticketDe(d, ticketId)
  if (t.estado === 'CLOSED') throw new ErrorSimulado(409, 'ticket-cerrado', 'El ticket está cerrado: reábrelo para registrar interacciones.')
  const campos: CampoInvalido[] = []
  if (!e.texto.trim()) campos.push({ campo: 'texto', mensaje: e.visible ? 'Escribe el mensaje para el cliente.' : 'Escribe la nota interna.' })
  const pii = e.visible ? null : detectarPii(e.texto)
  if (pii) campos.push({ campo: 'texto', mensaje: pii })
  if (e.visible && !e.canal) campos.push({ campo: 'canal', mensaje: 'Elige el canal por el que respondes.' })
  if (campos.length) throw invalido(campos)

  let [id, s] = nuevoId(d, 'in')
  const interaccion: Interaccion = {
    id,
    ticketId,
    fecha: d.ahora,
    tipo: e.visible ? 'mensaje' : 'nota',
    visible: e.visible,
    canal: e.visible ? e.canal : null,
    autor: actorId,
    texto: e.texto.trim(),
    adjuntos: e.adjuntos,
  }
  s = { ...s, interacciones: [...s.interacciones, interaccion] }
  s = emitir(s, 'interacción_registrada', { tipo: interaccion.tipo, visible: e.visible, adjuntos: e.adjuntos.length })
  if (e.visible && !t.primeraRespuesta) {
    s = conTicket(s, { ...ticketDe(s, ticketId), primeraRespuesta: d.ahora })
    // SUPUESTO: la primera respuesta visible pasa el ticket de Abierto a En atención, como cambio automático.
    if (t.estado === 'OPEN') s = cambiarEstado(s, ticketId, 'IN_PROGRESS', null, 'Primera respuesta registrada')
  }
  return s
}

// ── Derivar, tomar y reasignar (HU-ATC-007, 008, 009) ───────────────────────

export interface EntradaDerivacion {
  readonly area: Area | ''
  readonly responsable: string
  readonly motivo: string
  readonly nota: string
}

export function derivar(d: Datos, ticketId: string, e: EntradaDerivacion, actorId: string): Datos {
  exigir(puede.atender(actorDe(actorId).rol), 'derivar tickets')
  const t = ticketDe(d, ticketId)
  if (t.estado === 'CLOSED') throw new ErrorSimulado(409, 'ticket-cerrado', 'El ticket está cerrado: reábrelo para derivarlo.')
  if (t.eje !== 3 && senalesActivas(d, ticketId).length)
    throw new ErrorSimulado(409, 'gate-conflicto', 'Con señal de conflicto, el ticket solo sale por «Derivar a Eje 3» con el paquete mínimo (RN-SVC-021 y 022).')
  const campos: CampoInvalido[] = []
  if (!e.area) campos.push({ campo: 'area', mensaje: 'Elige el área de destino.' })
  if (!e.motivo) campos.push({ campo: 'motivo', mensaje: 'Elige un motivo del catálogo.' })
  const pii = detectarPii(e.nota)
  if (pii) campos.push({ campo: 'nota', mensaje: pii })
  if (e.responsable && persona(e.responsable)?.area !== e.area) campos.push({ campo: 'responsable', mensaje: 'Esa persona no es del área elegida.' })
  if (!campos.length && e.area === t.area && (e.responsable || null) === t.responsable)
    campos.push({ campo: 'area', mensaje: 'El ticket ya está en esa área y con ese responsable.' })
  if (campos.length) throw invalido(campos)
  const area = e.area as Area
  let [id, s] = nuevoId(d, 'fa')
  s = {
    ...s,
    filasAsignacion: [
      ...s.filasAsignacion,
      { id, ticketId, fecha: d.ahora, deArea: t.area, deResponsable: t.responsable, aArea: area, aResponsable: e.responsable || null, motivo: e.motivo, nota: e.nota.trim() || null, autor: actorId },
    ],
  }
  const eje = t.eje === 3 ? 3 : area === 'ATC' ? t.eje : 2
  s = conTicket(s, { ...t, area, responsable: e.responsable || null, eje })
  return emitir(s, 'ticket_derivado', { de_área: t.area, a_área: area, motivo: e.motivo })
}

export function tomar(d: Datos, ticketId: string, actorId: string): Datos {
  const actor = actorDe(actorId)
  exigir(puede.atender(actor.rol), 'tomar tickets')
  const t = ticketDe(d, ticketId)
  if (actor.rol !== 'SUPERVISOR' && actor.area !== t.area) throw new ErrorSimulado(403, 'otra-area', 'Solo se toman tickets de tu área.', { auditar: true })
  if (t.responsable) throw new ErrorSimulado(409, 'ya-asignado', `Ya lo tomó ${persona(t.responsable)?.nombre ?? 'otra persona'}.`)
  let [id, s] = nuevoId(d, 'fa')
  s = {
    ...s,
    filasAsignacion: [
      ...s.filasAsignacion,
      { id, ticketId, fecha: d.ahora, deArea: t.area, deResponsable: null, aArea: t.area, aResponsable: actorId, motivo: 'TOMA_DE_BANDEJA', nota: null, autor: actorId },
    ],
  }
  return conTicket(s, { ...t, responsable: actorId })
}

export interface ResumenReasignacion {
  readonly total: number
  readonly porDestinatario: ReadonlyArray<{ readonly persona: string; readonly tickets: number }>
}

export function pendientesDe(d: Datos, personaId: string): Ticket[] {
  return d.tickets
    .filter((t) => t.responsable === personaId && ESTADOS_ACTIVOS.includes(t.estado))
    .sort((a, b) => venceResolucionVigente(a).getTime() - venceResolucionVigente(b).getTime())
}

/** Reparte los pendientes de `de` entre los destinatarios, por turno y del más urgente al menos. */
export function reasignarEnBloque(
  d: Datos,
  e: { readonly de: string; readonly destinatarios: readonly string[]; readonly motivo: string; readonly nota: string },
  actorId: string,
): [Datos, ResumenReasignacion] {
  exigir(puede.reasignarEnBloque(actorDe(actorId).rol), 'reasignar en bloque')
  const campos: CampoInvalido[] = []
  if (!e.de) campos.push({ campo: 'de', mensaje: 'Elige al colaborador que rota o cesa.' })
  if (!e.destinatarios.length) campos.push({ campo: 'destinatarios', mensaje: 'Elige al menos un destinatario.' })
  if (e.destinatarios.includes(e.de)) campos.push({ campo: 'destinatarios', mensaje: 'El colaborador que cesa no puede recibir sus propios tickets.' })
  if (!e.motivo) campos.push({ campo: 'motivo', mensaje: 'Elige el motivo.' })
  const pii = detectarPii(e.nota)
  if (pii) campos.push({ campo: 'nota', mensaje: pii })
  if (campos.length) throw invalido(campos)
  const pendientes = pendientesDe(d, e.de)
  if (!pendientes.length) throw new ErrorSimulado(409, 'sin-pendientes', 'Ese colaborador no tiene tickets pendientes.')

  let s = d
  const cuenta = new Map(e.destinatarios.map((p) => [p, 0]))
  pendientes.forEach((t, i) => {
    const destino = e.destinatarios[i % e.destinatarios.length]
    const area = (persona(destino)?.area ?? t.area) as Area
    let id: string
    ;[id, s] = nuevoId(s, 'fa')
    s = {
      ...s,
      filasAsignacion: [
        ...s.filasAsignacion,
        { id, ticketId: t.id, fecha: d.ahora, deArea: t.area, deResponsable: t.responsable, aArea: area, aResponsable: destino, motivo: e.motivo, nota: e.nota.trim() || null, autor: actorId },
      ],
    }
    s = conTicket(s, { ...t, area, responsable: destino, eje: t.eje === 3 ? 3 : area === 'ATC' ? t.eje : 2 })
    cuenta.set(destino, (cuenta.get(destino) ?? 0) + 1)
  })
  s = emitir(s, 'reasignación_masiva', { n_tickets: pendientes.length, motivo: e.motivo })
  return [s, { total: pendientes.length, porDestinatario: [...cuenta].map(([p, n]) => ({ persona: p, tickets: n })) }]
}

// ── Job de alertas (HU-ATC-010) ─────────────────────────────────────────────

/** Evalúa los vencidos y alerta una sola vez por ticket, tipo y ciclo (RN-SVC-008). */
export function ejecutarJob(d: Datos): [Datos, EjecucionJob] {
  let s = d
  let nuevas = 0
  let omitidas = 0
  const ya = new Set(d.alertas.map((a) => `${a.ticketId}|${a.tipo}|${a.ciclo}`))
  for (const t of d.tickets) {
    if (!ESTADOS_ACTIVOS.includes(t.estado)) continue
    const candidatas: Array<[TipoAlerta, Date]> = []
    if (t.reaperturas === 0 && !t.primeraRespuesta && d.ahora > t.venceRespuesta) candidatas.push(['FIRST_RESPONSE_OVERDUE', t.venceRespuesta])
    const vence = venceResolucionVigente(t)
    if (d.ahora > vence) candidatas.push(['RESOLUTION_OVERDUE', vence])
    for (const [tipo, evaluado] of candidatas) {
      const clave = `${t.id}|${tipo}|${t.reaperturas}`
      if (ya.has(clave)) {
        omitidas++
        continue
      }
      ya.add(clave)
      let id: string
      ;[id, s] = nuevoId(s, 'al')
      s = {
        ...s,
        alertas: [
          ...s.alertas,
          { id, ticketId: t.id, tipo, ciclo: t.reaperturas, vencimientoEvaluado: evaluado, fecha: d.ahora, destinatario: DESTINATARIO_ALERTAS, canal: CANAL_ALERTAS },
        ],
      }
      s = emitir(s, 'sla_alerta', { tipo, ciclo: t.reaperturas })
      nuevas++
    }
  }
  let id: string
  ;[id, s] = nuevoId(s, 'job')
  const ejecucion: EjecucionJob = { id, fecha: d.ahora, nuevas, omitidas }
  return [{ ...s, ejecuciones: [...s.ejecuciones, ejecucion] }, ejecucion]
}

// ── Políticas (HU-ATC-003 CA-03) ────────────────────────────────────────────

export function editarPolitica(d: Datos, id: string, respuestaH: number, resolucionH: number, actorId: string): Datos {
  exigir(puede.editarPoliticas(actorDe(actorId).rol), 'editar políticas SLA')
  const campos: CampoInvalido[] = []
  if (!(respuestaH > 0)) campos.push({ campo: 'respuesta', mensaje: 'Indica horas hábiles mayores que cero.' })
  if (!(resolucionH > 0)) campos.push({ campo: 'resolucion', mensaje: 'Indica horas hábiles mayores que cero.' })
  if (respuestaH > 0 && resolucionH > 0 && respuestaH > resolucionH)
    campos.push({ campo: 'resolucion', mensaje: 'La resolución no puede vencer antes que la primera respuesta.' })
  if (campos.length) throw invalido(campos)
  // Solo cambia la política: los tickets ya abiertos conservan sus vencimientos (RN-SVC-002).
  return { ...d, politicas: d.politicas.map((p) => (p.id === id ? { ...p, respuestaH, resolucionH, version: p.version + 1 } : p)) }
}

// ── Inmutabilidad (HU-ATC-004 CA-02) ────────────────────────────────────────

/** Cualquier intento de editar o borrar una fila de bitácora se rechaza. */
export function modificarFilaDeBitacora(filaId: string, operacion: 'editar' | 'borrar'): never {
  throw new ErrorSimulado(409, 'bitacora-inmutable', `La fila ${filaId} es de una bitácora append-only: no se puede ${operacion}. Un cambio se registra como fila nueva.`, {
    auditar: true,
  })
}

// ── Reloj ───────────────────────────────────────────────────────────────────

export const conAhora = (d: Datos, ahora: Date): Datos => ({ ...d, ahora })
