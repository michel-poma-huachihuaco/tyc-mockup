import { ESTADOS_ACTIVOS, nombrePersona } from '../datos/catalogos.ts'
import type { Persona } from '../datos/catalogos.ts'
import { estadoDeCuenta, lotesDe } from '../datos/cliente360.ts'
import type { Lote } from '../datos/cliente360.ts'
import { CLIENTES, cliente, dniEnmascarado } from '../datos/clientes.ts'
import type { Cliente } from '../datos/clientes.ts'
import { diasHabilesEntre } from './calendario.ts'
import { asientoDeTicket } from './libro.ts'
import { ErrorSimulado, actorDe, cambiarEstado, conTicket, crearTicket, detectarPii, emitir, exigir, invalido, nuevoId, ticketDe } from './nucleo.ts'
import type { CampoInvalido, Datos, EntradaTicket, Ticket } from './nucleo.ts'
import { crearTicketInteresado, fuenteCaida, regularizado } from './ola7.ts'

/**
 * Ola 8: morosidad y formularios simples (HU-ATC-056 a 060). Caso de resolución por 3 cuotas
 * impagas con su alerta al cliente y su carta al responsable del proyecto, ingreso a un
 * proyecto y reserva de cupo en los buses del Entrega Fest. Funciones puras sobre el mismo
 * estado; las bitácoras solo crecen.
 */

/** Quien hace de «Mi Portal / formularios» al crear tickets de formularios simples (RN-SVC-041). */
export const SERVICIO_FORMULARIOS = 'p-portal'
export const ANALISTA_COBRANZA = 'p-rsalazar'
export const SUPERVISOR_COMERCIAL = 'p-ctorres'
/** SUPUESTO: matriz de escalamiento de las cartas: el supervisor ATC. */
export const ESCALA_CARTAS = 'p-gnunez'
/** SUPUESTO: plazo del responsable para registrar una acción. */
export const PLAZO_ACCION_DIAS = 2
/** SUPUESTO: fecha prevista de resolución de contrato desde la apertura del caso. */
export const DIAS_RESOLUCION = 30
export const CUOTAS_PARA_RESOLVER = 3

export interface Notificacion {
  readonly id: string
  readonly fecha: Date
  /** Persona o `cliente:<id>`. */
  readonly para: string
  readonly ticketId: string | null
  readonly mensaje: string
}

const notificar = (d: Datos, para: string, ticketId: string | null, mensaje: string): Datos => {
  const [id, s] = nuevoId(d, 'no')
  return { ...s, notificaciones: [...s.notificaciones, { id, fecha: d.ahora, para, ticketId, mensaje }] }
}

// ── Proyectos y responsables (maestro) ──────────────────────────────────────

export const proyectoDe = (descripcion: string) => descripcion.split(' · ')[0]
/** Responsable de cada proyecto; `null` = el maestro no lo tiene registrado (CA-03 de HU-ATC-058). */
export const RESPONSABLE_PROYECTO: Readonly<Record<string, string | null>> = {
  'Villa Sol II': 'p-nquispe',
  'Los Álamos de Carabayllo': 'p-nquispe',
  'Residencial Brisas': 'p-jmarin',
  'Ciudad Aybar Norte': 'p-jmarin',
  'Los Álamos': null,
}
export const PROYECTOS = Object.keys(RESPONSABLE_PROYECTO)

// ── Caso de resolución por impagos (HU-ATC-056) ─────────────────────────────

export type EstadoResolucion = 'ABIERTO' | 'SUSPENDIDO' | 'REGULARIZADO'
export const NOMBRE_ESTADO_RESOLUCION: Record<EstadoResolucion, string> = { ABIERTO: 'En resolución', SUSPENDIDO: 'Suspendido por reclamo', REGULARIZADO: 'Regularizado' }

export interface CasoResolucion {
  readonly id: string
  readonly ticketId: string
  readonly clienteId: string
  readonly loteId: string
  readonly proyecto: string
  readonly cuotasImpagas: number
  readonly deuda: number
  readonly estado: EstadoResolucion
  readonly abierto: Date
  readonly prevista: Date
}
export interface FilaResolucion {
  readonly id: string
  readonly casoId: string
  readonly fecha: Date
  readonly a: EstadoResolucion | 'ESCALADO'
  readonly nota: string
  readonly autor: string | null
}

export const puedeVerMora = (p: Persona) => ['COLABORADOR', 'SUPERVISOR', 'LEGAL_RECLAMOS', 'COORDINADOR_CX'].includes(p.rol)
export const puedeGestionarMora = (p: Persona) => p.rol === 'SUPERVISOR' || (p.rol === 'COLABORADOR' && p.area === 'COBRANZA')
export const casoDeTicket = (d: Datos, ticketId: string) => d.casosResolucion.find((c) => c.ticketId === ticketId) ?? null

const fila = (d: Datos, casoId: string, a: FilaResolucion['a'], nota: string, autor: string | null): Datos => {
  const [id, s] = nuevoId(d, 'fr')
  return { ...s, filasResolucion: [...s.filasResolucion, { id, casoId, fecha: d.ahora, a, nota, autor }] }
}
const conCaso = (d: Datos, c: CasoResolucion): Datos => ({ ...d, casosResolucion: d.casosResolucion.map((x) => (x.id === c.id ? c : x)) })

/** CA-03: un reclamo del Libro sin responder suspende el caso (propuesta del PO, a validar con Legal). */
export const reclamoAbierto = (d: Datos, clienteId: string) =>
  d.tickets.some((t) => t.clienteId === clienteId && ESTADOS_ACTIVOS.includes(t.estado) && asientoDeTicket(d, t.id)?.respuesta === null)

export interface LoteMoroso {
  readonly cliente: Cliente
  readonly lote: Lote
  readonly impagas: number
  readonly deuda: number
}
/** Los lotes con 3 o más cuotas vencidas e impagas según Cobranza. */
export function lotesMorosos(d: Datos): LoteMoroso[] {
  const r: LoteMoroso[] = []
  for (const c of CLIENTES)
    for (const lote of lotesDe(c)) {
      const e = estadoDeCuenta(c, lote, d.ahora, regularizado(d, lote.id))
      const vencidas = e.cuotas.filter((q) => q.estado === 'Vencida')
      if (vencidas.length >= CUOTAS_PARA_RESOLVER) r.push({ cliente: c, lote, impagas: vencidas.length, deuda: vencidas.reduce((s, q) => s + q.monto, 0) })
    }
  return r
}

const soles = (n: number) => `S/ ${n.toLocaleString('es-PE')}`
const dia = (f: Date) => f.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })

/** CA-01 de HU-ATC-056: la evaluación diaria crea el ticket y lo deriva a Cobranza y Legal. Idempotente por lote. */
export function evaluarMorosidad(d: Datos): [Datos, { readonly nuevos: number; readonly suspendidos: number; readonly reactivados: number }] {
  let s = d
  let nuevos = 0
  let suspendidos = 0
  let reactivados = 0
  if (fuenteCaida(d, 'COBRANZA')) return [d, { nuevos, suspendidos, reactivados }]
  for (const m of lotesMorosos(d)) {
    if (s.casosResolucion.some((c) => c.loteId === m.lote.id)) continue
    const entrada: EntradaTicket = {
      canal: 'Correo',
      clienteId: m.cliente.id,
      empresaId: 'ALT',
      linea: 'Lotes urbanos',
      establecimiento: '',
      tipo: 'RES',
      prioridad: 'HIGH',
      resumen: `Resolución de contrato · ${m.lote.descripcion}`,
      descripcion: `${m.impagas} cuotas vencidas e impagas (${soles(m.deuda)}) del contrato ${m.lote.contrato}. Caso generado por la evaluación diaria de morosidad.`,
    }
    const [s1, t] = crearTicket(s, entrada, ANALISTA_COBRANZA, d.ahora)
    const suspendido = reclamoAbierto(s1, m.cliente.id)
    const [id, s2] = nuevoId(s1, 'cr')
    const prevista = new Date(d.ahora.getTime() + DIAS_RESOLUCION * 86_400_000)
    const caso: CasoResolucion = { id, ticketId: t.id, clienteId: m.cliente.id, loteId: m.lote.id, proyecto: proyectoDe(m.lote.descripcion), cuotasImpagas: m.impagas, deuda: m.deuda, estado: suspendido ? 'SUSPENDIDO' : 'ABIERTO', abierto: d.ahora, prevista }
    s = fila({ ...s2, casosResolucion: [...s2.casosResolucion, caso] }, id, caso.estado, suspendido ? 'Reclamo abierto en el Libro: el caso queda suspendido hasta responderlo.' : `Abierto con ${m.impagas} cuotas impagas y derivado a Cobranza y Legal.`, null)
    s = emitir(s, 'resolucion_abierta', { cuotas: m.impagas, suspendido })
    if (suspendido) suspendidos++
    else s = despacharAlertas(s, id)
    nuevos++
  }
  // Un caso suspendido sigue su curso cuando el reclamo se responde.
  for (const c of s.casosResolucion.filter((x) => x.estado === 'SUSPENDIDO')) {
    if (reclamoAbierto(s, c.clienteId)) continue
    s = fila(conCaso(s, { ...c, estado: 'ABIERTO' }), c.id, 'ABIERTO', 'El reclamo se respondió: el caso retoma su curso.', null)
    s = despacharAlertas(s, c.id)
    reactivados++
  }
  return [s, { nuevos, suspendidos, reactivados }]
}

/** CA-02: Cobranza registra el pago, el ticket se cierra como «Regularizado» y el proceso se detiene. */
export function registrarPago(d: Datos, casoId: string, actorId: string): Datos {
  exigir(puedeGestionarMora(actorDe(actorId)), 'registrar el pago de la deuda')
  const c = d.casosResolucion.find((x) => x.id === casoId)
  if (!c) throw new ErrorSimulado(404, 'no-encontrado', 'El caso no existe.')
  if (c.estado === 'REGULARIZADO') throw new ErrorSimulado(409, 'ya-regularizado', 'El caso ya está regularizado.')
  let s = conCaso(d, { ...c, estado: 'REGULARIZADO' })
  s = fila(s, casoId, 'REGULARIZADO', 'Cobranza registró el pago de la deuda vencida.', actorId)
  const t = ticketDe(s, c.ticketId)
  if (ESTADOS_ACTIVOS.includes(t.estado)) {
    s = cambiarEstado(s, c.ticketId, 'RESOLVED', actorId, 'Regularizado: el cliente pagó la deuda vencida')
    s = cambiarEstado(s, c.ticketId, 'CLOSED', actorId, 'Regularizado')
  }
  return emitir(s, 'resolucion_regularizada', { cuotas: c.cuotasImpagas })
}

// ── Alerta de cancelación al cliente (HU-ATC-057) ───────────────────────────

export type CanalAlerta = 'Correo' | 'WhatsApp' | 'Mi Portal'
export interface Constancia {
  readonly id: string
  readonly casoId: string
  readonly fecha: Date
  readonly canal: CanalAlerta
  readonly resultado: 'ENTREGADO' | 'REBOTADO' | 'NO_DISPONIBLE'
  readonly reintento: boolean
}
export const NOMBRE_RESULTADO: Record<Constancia['resultado'], string> = { ENTREGADO: 'Entregado', REBOTADO: 'Rebotado', NO_DISPONIBLE: 'No disponible' }

/** SUPUESTO: el correo de algunos clientes rebota (buzón lleno o inexistente). */
const correoRebota = (c: Cliente) => CLIENTES.indexOf(c) % 8 === 1

/** CA-01 a CA-03: envía por los tres canales de inmediato; si el correo rebota, WhatsApp y Mi Portal quedan como reintento y todo consta. */
function enviarAlerta(d: Datos, caso: CasoResolucion): Datos {
  const c = cliente(caso.clienteId)
  let s = d
  const correo: Constancia['resultado'] = fuenteCaida(d, 'CORREO') ? 'NO_DISPONIBLE' : c && correoRebota(c) ? 'REBOTADO' : 'ENTREGADO'
  const intentos: Array<[CanalAlerta, Constancia['resultado']]> = [
    ['Correo', correo],
    ['WhatsApp', fuenteCaida(d, 'WHATSAPP') ? 'NO_DISPONIBLE' : 'ENTREGADO'],
    ['Mi Portal', 'ENTREGADO'],
  ]
  for (const [canal, resultado] of intentos) {
    let id: string
    ;[id, s] = nuevoId(s, 'co')
    s = { ...s, constancias: [...s.constancias, { id, casoId: caso.id, fecha: d.ahora, canal, resultado, reintento: canal !== 'Correo' && correo !== 'ENTREGADO' }] }
  }
  return s
}

// ── Carta al responsable del proyecto (HU-ATC-058) ──────────────────────────

export interface Carta {
  readonly id: string
  readonly casoId: string
  readonly fecha: Date
  readonly para: string
  readonly cc: string | null
  readonly sinResponsable: boolean
  readonly texto: string
  readonly vence: Date
  readonly accion: { readonly fecha: Date; readonly autor: string; readonly nota: string } | null
  readonly escalada: Date | null
}
export const cartaDe = (d: Datos, casoId: string) => d.cartas.find((c) => c.casoId === casoId) ?? null

function enviarCarta(d: Datos, caso: CasoResolucion): Datos {
  const responsable = RESPONSABLE_PROYECTO[caso.proyecto] ?? null
  const c = cliente(caso.clienteId)
  const texto = `Se abrió el caso de resolución del contrato del cliente ${c?.nombre ?? '—'} (DNI ${c ? dniEnmascarado(c.dni) : '—'}) en ${caso.proyecto}. Deuda vencida: ${soles(caso.deuda)} en ${caso.cuotasImpagas} cuotas. Estado: ${NOMBRE_ESTADO_RESOLUCION[caso.estado].toLowerCase()}. Fecha prevista de resolución: ${dia(caso.prevista)}. Registra tu acción en ${PLAZO_ACCION_DIAS} días hábiles.`
  const [id, s0] = nuevoId(d, 'ca')
  const carta: Carta = {
    id,
    casoId: caso.id,
    fecha: d.ahora,
    para: responsable ?? SUPERVISOR_COMERCIAL,
    cc: responsable ? SUPERVISOR_COMERCIAL : null,
    sinResponsable: !responsable,
    texto,
    vence: new Date(d.ahora.getTime() + PLAZO_ACCION_DIAS * 86_400_000),
    accion: null,
    escalada: null,
  }
  let s: Datos = { ...s0, cartas: [...s0.cartas, carta] }
  s = notificar(s, carta.para, caso.ticketId, `Carta de alerta: caso de resolución en ${caso.proyecto}.`)
  // CA-03: sin responsable, va al supervisor comercial y se avisa para completar el maestro.
  if (!responsable) s = notificar(s, 'p-aperez', caso.ticketId, `El proyecto «${caso.proyecto}» no tiene responsable en el maestro: complétalo.`)
  return s
}

function despacharAlertas(d: Datos, casoId: string): Datos {
  const caso = d.casosResolucion.find((c) => c.id === casoId)
  if (!caso) return d
  return enviarCarta(enviarAlerta(d, caso), caso)
}

/** El responsable (o Cobranza) registra su acción sobre el caso dentro del plazo. */
export function registrarAccion(d: Datos, casoId: string, nota: string, actorId: string): Datos {
  const p = actorDe(actorId)
  const carta = cartaDe(d, casoId)
  if (!carta) throw new ErrorSimulado(404, 'sin-carta', 'Este caso aún no tiene carta de alerta.')
  exigir(carta.para === p.id || carta.cc === p.id || puedeGestionarMora(p), 'registrar la acción del caso')
  if (carta.accion) throw new ErrorSimulado(409, 'accion-registrada', 'La acción ya está registrada.')
  const campos: CampoInvalido[] = []
  if (!nota.trim()) campos.push({ campo: 'nota', mensaje: 'Escribe qué acción tomaste.' })
  const pii = detectarPii(nota)
  if (pii) campos.push({ campo: 'nota', mensaje: pii })
  if (campos.length) throw invalido(campos)
  return fila({ ...d, cartas: d.cartas.map((c) => (c.id === carta.id ? { ...c, accion: { fecha: d.ahora, autor: actorId, nota: nota.trim() } } : c)) }, casoId, 'ABIERTO', `Acción del responsable: ${nota.trim()}`, actorId)
}

/** CA-02: la carta sin acción en el plazo escala al supervisor según la matriz. Una sola vez. */
export function escalarCartas(d: Datos): [Datos, number] {
  let s = d
  let n = 0
  for (const c of d.cartas) {
    const caso = d.casosResolucion.find((x) => x.id === c.casoId)
    if (!caso || caso.estado !== 'ABIERTO' || c.accion || c.escalada || diasHabilesEntre(c.fecha, d.ahora) < PLAZO_ACCION_DIAS) continue
    s = { ...s, cartas: s.cartas.map((x) => (x.id === c.id ? { ...x, escalada: d.ahora } : x)) }
    s = fila(s, caso.id, 'ESCALADO', `Sin acción de ${nombrePersona(c.para)} en ${PLAZO_ACCION_DIAS} días hábiles: escalado a ${nombrePersona(ESCALA_CARTAS)}.`, null)
    s = notificar(s, ESCALA_CARTAS, caso.ticketId, 'Caso de resolución escalado: la carta no tuvo acción en el plazo.')
    n++
  }
  return [s, n]
}

/** Lo que corre cada día: evaluación de morosidad y escalamiento de cartas. */
export function controlarMorosidad(d: Datos) {
  const [d1, ev] = evaluarMorosidad(d)
  const [d2, escaladas] = escalarCartas(d1)
  return [d2, { ...ev, escaladas }] as const
}

// ── Ingreso a un proyecto (HU-ATC-059) ──────────────────────────────────────

export const MOTIVOS_INGRESO = ['Visita comercial', 'Entrega de lote', 'Inspección técnica', 'Trámite administrativo', 'Proveedor o contratista', 'Otro'] as const
export const DESTINOS_INGRESO = [...PROYECTOS, 'Oficina central'] as const
export const puedeRegistrarIngreso = (p: Persona) => p.rol === 'CONTROL_ACCESO' || p.rol === 'SUPERVISOR'

export interface EntradaIngreso {
  readonly nombre: string
  readonly dni: string
  readonly telefono: string
  readonly motivo: string
  readonly destino: string
  readonly fecha: Date | null
}

export function validarIngreso(e: EntradaIngreso): CampoInvalido[] {
  const campos: CampoInvalido[] = []
  if (e.nombre.trim().length < 3) campos.push({ campo: 'nombre', mensaje: 'Escribe el nombre de la persona.' })
  if (!/^\d{8}$/.test(e.dni.trim())) campos.push({ campo: 'dni', mensaje: 'El DNI tiene 8 dígitos.' })
  if (e.telefono.replace(/\D/g, '').length < 7) campos.push({ campo: 'telefono', mensaje: 'Escribe un teléfono de contacto.' })
  if (!e.motivo) campos.push({ campo: 'motivo', mensaje: 'Elige el motivo de la visita.' })
  if (!e.destino) campos.push({ campo: 'destino', mensaje: 'Elige el proyecto o el área que visita.' })
  if (!e.fecha) campos.push({ campo: 'fecha', mensaje: 'Indica la fecha y la hora del ingreso.' })
  return campos
}

const ENTRADA_BASE = { canal: 'Teléfono', empresaId: 'AIN', linea: 'Lotes urbanos', establecimiento: '', prioridad: 'MEDIUM' } as const

/** CA-01 y CA-02: un formulario de 6 campos crea el ticket «Ingreso a proyecto» para el responsable; un DNI de cliente lo vincula a su ficha y su lote. */
export function registrarIngreso(d: Datos, e: EntradaIngreso, actorId: string): [Datos, Ticket] {
  exigir(puedeRegistrarIngreso(actorDe(actorId)), 'registrar ingresos')
  const campos = validarIngreso(e)
  if (campos.length) throw invalido(campos)
  const conocido = CLIENTES.find((c) => c.dni === e.dni.trim()) ?? null
  const lote = conocido ? (lotesDe(conocido).find((l) => proyectoDe(l.descripcion) === e.destino) ?? lotesDe(conocido)[0]) : null
  const proyecto = e.destino
  const entrada = { ...ENTRADA_BASE, tipo: 'ING', resumen: `Ingreso a ${proyecto} · ${e.motivo}`, descripcion: `${e.nombre.trim()} ingresó a ${proyecto} el ${(e.fecha as Date).toLocaleString('es-PE')} por «${e.motivo}». Registrado por control de acceso: ${nombrePersona(actorId)}.${lote ? ` Cliente reconocido, lote ${lote.descripcion}.` : ''}` }
  let [s, t] = conocido
    ? crearTicket(d, { ...entrada, clienteId: conocido.id }, SERVICIO_FORMULARIOS, d.ahora)
    : crearTicketInteresado(d, entrada, { nombre: e.nombre, telefono: e.telefono, dni: e.dni.trim() }, SERVICIO_FORMULARIOS, d.ahora)
  const responsable = RESPONSABLE_PROYECTO[proyecto] ?? SUPERVISOR_COMERCIAL
  let id: string
  ;[id, s] = nuevoId(s, 'fa')
  s = {
    ...s,
    filasAsignacion: [...s.filasAsignacion, { id, ticketId: t.id, fecha: d.ahora, deArea: t.area, deResponsable: t.responsable, aArea: 'ADMINISTRACION', aResponsable: responsable, motivo: 'ASIGNACION_FORMULARIO', nota: null, autor: actorId }],
  }
  t = { ...ticketDe(s, t.id), area: 'ADMINISTRACION', eje: 2, responsable }
  s = conTicket(s, t)
  s = notificar(s, responsable, t.id, `Ingreso de ${e.nombre.trim()} a ${proyecto}: ${e.motivo}.`)
  return [emitir(s, 'ingreso_registrado', { reconocido: Boolean(conocido) }), t]
}

// ── Reserva de cupo en los buses del Entrega Fest (HU-ATC-060) ──────────────

export const BUSES = [
  { id: 'B1', horario: '06:30', aforo: 2 },
  { id: 'B2', horario: '07:30', aforo: 4 },
  { id: 'B3', horario: '09:00', aforo: 6 },
] as const
export const PUNTOS_EMBARQUE = ['Plaza Norte', 'Metro Los Olivos', 'Oficina central de Lima'] as const
/** SUPUESTO (pregunta abierta de HU-ATC-060). */
export const MAX_ACOMPANANTES = 3
export const CONVOCADOS: readonly string[] = CLIENTES.slice(0, 6).map((c) => c.id)
export const nombreBus = (id: string) => {
  const b = BUSES.find((x) => x.id === id)
  return b ? `Bus ${b.id} · ${b.horario}` : id
}

export interface ReservaBus {
  readonly id: string
  readonly ticketId: string
  readonly clienteId: string
  readonly busId: string
  readonly punto: string
  readonly acompanantes: number
  readonly estado: 'CONFIRMADA' | 'EN_ESPERA' | 'CANCELADA'
  readonly creada: Date
  readonly canal: 'WhatsApp' | 'Correo' | null
}
export const NOMBRE_ESTADO_RESERVA: Record<ReservaBus['estado'], string> = { CONFIRMADA: 'Confirmada', EN_ESPERA: 'En lista de espera', CANCELADA: 'Cancelada' }

export const puedeReservar = (p: Persona) => p.rol === 'CLIENTE'
export const puedeVerBuses = (p: Persona) => p.rol === 'CLIENTE' || ['COORDINADOR_CX', 'MODERADOR_EVENTO', 'SUPERVISOR'].includes(p.rol)
export const personas = (r: ReservaBus) => 1 + r.acompanantes
export const reservaDe = (d: Datos, clienteId: string) => d.reservasBus.find((r) => r.clienteId === clienteId && r.estado !== 'CANCELADA') ?? null
export const cuposLibres = (d: Datos, busId: string) => (BUSES.find((b) => b.id === busId)?.aforo ?? 0) - d.reservasBus.filter((r) => r.busId === busId && r.estado === 'CONFIRMADA').reduce((s, r) => s + personas(r), 0)

export interface EntradaReserva {
  readonly clienteId: string
  readonly busId: string
  readonly punto: string
  readonly acompanantes: number
  readonly esperar: boolean
}

const canalConfirmacion = (d: Datos): 'WhatsApp' | 'Correo' => (fuenteCaida(d, 'WHATSAPP') ? 'Correo' : 'WhatsApp')

function confirmar(d: Datos, r: ReservaBus): Datos {
  const canal = canalConfirmacion(d)
  const s = { ...d, reservasBus: d.reservasBus.map((x) => (x.id === r.id ? { ...x, estado: 'CONFIRMADA' as const, canal } : x)) }
  return notificar(s, `cliente:${r.clienteId}`, r.ticketId, `Reserva confirmada (${canal}): ${nombreBus(r.busId)}, embarque en ${r.punto}, ${personas(r)} ${personas(r) === 1 ? 'persona' : 'personas'}.`)
}

/** CA-01 y CA-02: crea el ticket y descuenta el cupo; sin cupo ofrece otro bus o la lista de espera. */
export function reservarBus(d: Datos, e: EntradaReserva, actorId: string): [Datos, ReservaBus] {
  exigir(puedeReservar(actorDe(actorId)), 'reservar un cupo')
  const campos: CampoInvalido[] = []
  if (!CONVOCADOS.includes(e.clienteId)) throw new ErrorSimulado(403, 'no-convocado', 'Solo los clientes convocados al Entrega Fest reservan cupo.', { auditar: true })
  if (!BUSES.some((b) => b.id === e.busId)) campos.push({ campo: 'bus', mensaje: 'Elige un bus y su horario.' })
  if (!(PUNTOS_EMBARQUE as readonly string[]).includes(e.punto)) campos.push({ campo: 'punto', mensaje: 'Elige el punto de embarque.' })
  if (!Number.isInteger(e.acompanantes) || e.acompanantes < 0 || e.acompanantes > MAX_ACOMPANANTES) campos.push({ campo: 'acompanantes', mensaje: `Los acompañantes van de 0 a ${MAX_ACOMPANANTES}.` })
  if (campos.length) throw invalido(campos)
  if (reservaDe(d, e.clienteId)) throw new ErrorSimulado(409, 'ya-reservado', 'Ya tienes una reserva activa: cancélala para elegir otro bus.')
  const necesita = 1 + e.acompanantes
  const libres = cuposLibres(d, e.busId)
  if (libres < necesita && !e.esperar) throw new ErrorSimulado(409, 'sin-cupo', `${nombreBus(e.busId)} no tiene cupo para ${necesita} ${necesita === 1 ? 'persona' : 'personas'} (quedan ${Math.max(libres, 0)}). Elige otro bus u horario, o entra en la lista de espera.`)
  const c = cliente(e.clienteId)
  const [s0, t] = crearTicket(
    d,
    { ...ENTRADA_BASE, canal: 'WhatsApp', clienteId: e.clienteId, tipo: 'RSV', resumen: `Reserva de bus · ${nombreBus(e.busId)}`, descripcion: `${c?.nombre ?? 'Cliente'} reserva ${necesita} ${necesita === 1 ? 'cupo' : 'cupos'} en ${nombreBus(e.busId)}, embarque en ${e.punto}.` },
    SERVICIO_FORMULARIOS,
    d.ahora,
  )
  const [id, s1] = nuevoId(s0, 'rb')
  const enEspera = libres < necesita
  const reserva: ReservaBus = { id, ticketId: t.id, clienteId: e.clienteId, busId: e.busId, punto: e.punto, acompanantes: e.acompanantes, estado: enEspera ? 'EN_ESPERA' : 'CONFIRMADA', creada: d.ahora, canal: null }
  let s: Datos = { ...s1, reservasBus: [...s1.reservasBus, reserva] }
  s = enEspera ? notificar(s, `cliente:${e.clienteId}`, t.id, `Quedaste en lista de espera del ${nombreBus(e.busId)}; te avisamos si se libera un cupo.`) : confirmar(s, reserva)
  return [emitir(s, 'reserva_bus', { acompanantes: e.acompanantes }), s.reservasBus.find((x) => x.id === id) ?? reserva]
}

/** CA-03: al cancelar se libera el cupo y se asigna al primero de la lista de espera al que le cabe. */
export function cancelarReserva(d: Datos, reservaId: string, clienteId: string, actorId: string): Datos {
  exigir(puedeReservar(actorDe(actorId)), 'cancelar una reserva')
  const r = d.reservasBus.find((x) => x.id === reservaId)
  if (!r || r.clienteId !== clienteId) throw new ErrorSimulado(404, 'no-encontrado', 'Esa reserva no existe.')
  if (r.estado === 'CANCELADA') throw new ErrorSimulado(409, 'ya-cancelada', 'La reserva ya está cancelada.')
  let s: Datos = { ...d, reservasBus: d.reservasBus.map((x) => (x.id === r.id ? { ...x, estado: 'CANCELADA' as const } : x)) }
  if (ESTADOS_ACTIVOS.includes(ticketDe(s, r.ticketId).estado)) s = cambiarEstado(s, r.ticketId, 'RESOLVED', null, 'Reserva cancelada por el cliente')
  if (r.estado === 'CONFIRMADA')
    for (const w of s.reservasBus.filter((x) => x.busId === r.busId && x.estado === 'EN_ESPERA').sort((a, b) => a.creada.getTime() - b.creada.getTime())) {
      if (cuposLibres(s, r.busId) >= personas(w)) s = confirmar(s, w)
    }
  return emitir(s, 'reserva_bus', { cancelada: true })
}
