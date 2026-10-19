import { ESPECIALISTA_LEGAL, ESTADOS_ACTIVOS } from '../datos/catalogos.ts'
import type { Persona, Rol } from '../datos/catalogos.ts'
import { buscarPorSignificado, correosDe, documentosDe, estadoDeCuenta, lotesDe, sugerenciasExactas } from '../datos/cliente360.ts'
import type { CorreoCliente, DocumentoCliente, EstadoCuenta, Lote, ResultadoDocumento } from '../datos/cliente360.ts'
import { CLIENTES, INTERESADO_ID, cliente } from '../datos/clientes.ts'
import type { Cliente } from '../datos/clientes.ts'
import { asientoDeTicket } from './libro.ts'
import { ErrorSimulado, actorDe, cambiarEstado, conTicket, crearTicket, emitir, exigir, invalido, nuevoId, puede, senalesActivas, ticketDe } from './nucleo.ts'
import type { CampoInvalido, Datos, EntradaTicket, Ticket } from './nucleo.ts'

/**
 * Ola 7: consulta 360 e integraciones (HU-ATC-040 a 042 y 049 a 053): búsqueda de clientes,
 * consulta en línea por secciones con permisos, excepciones del cliente (interesado), motor de
 * consultas, búsqueda de documentos por significado, llamadas, sincronización con Legal y
 * exposición por riesgo de denuncia. Las fuentes son simuladores: ningún dato del cliente se
 * copia al servicio (RN-SVC-026).
 */

// ── Fuentes e integraciones ─────────────────────────────────────────────────

export const FUENTES = [
  { id: 'SIGDA', nombre: 'SIGDA/TAXON' },
  { id: 'COBRANZA', nombre: 'Cobranza' },
  { id: 'CONTRATOS', nombre: 'Repositorio de contratos' },
  { id: 'CORREO', nombre: 'Correo' },
  { id: 'MOTOR', nombre: 'Motor de consultas' },
  { id: 'LEGAL', nombre: 'Herramienta de Legal' },
  { id: 'CALLCENTER', nombre: 'Call center' },
  { id: 'WHATSAPP', nombre: 'WhatsApp' },
] as const
export type FuenteId = (typeof FUENTES)[number]['id']
export const nombreFuente = (id: FuenteId) => FUENTES.find((f) => f.id === id)?.nombre ?? id
/** Un lote cuyo caso de resolución se regularizó vuelve a figurar al día (HU-ATC-056 CA-02). */
export const regularizado = (d: Datos, loteId: string) => d.casosResolucion.some((c) => c.loteId === loteId && c.estado === 'REGULARIZADO')
export const fuenteCaida = (d: Datos, id: FuenteId) => d.fuentesCaidas.includes(id)

const noDisponible = (id: FuenteId, aviso: string) => new ErrorSimulado(503, `${id.toLowerCase()}-no-disponible`, `${nombreFuente(id)} no responde. ${aviso}`)

/** Enciende o apaga una fuente; al volver, el sistema reintenta lo que quedó pendiente (CA-03 de HU-ATC-051 y 040). */
export function cambiarFuente(d: Datos, id: FuenteId, caida: boolean): Datos {
  if (fuenteCaida(d, id) === caida) return d
  let s: Datos = { ...d, fuentesCaidas: caida ? [...d.fuentesCaidas, id] : d.fuentesCaidas.filter((f) => f !== id) }
  if (!caida && id === 'SIGDA') s = reintentarVinculaciones(s)[0]
  if (!caida && id === 'LEGAL') s = reintentarSyncLegal(s)[0]
  return s
}

// ── Permisos de la consulta (RN-SVC-036) ────────────────────────────────────

export type Seccion = 'lotes' | 'cuotas' | 'correos' | 'tickets' | 'documentos' | 'llamadas'
export const NOMBRE_SECCION: Record<Seccion, string> = { lotes: 'Lotes y contratos', cuotas: 'Cuotas y estado de cuenta', correos: 'Correos y mensajes', tickets: 'Tickets e interacciones previas', documentos: 'Documentos', llamadas: 'Llamadas' }
/** SUPUESTO: el estado de cuenta lo ven atención, colaboradores y legal; el coordinador CX y la Mesa SGD no. */
const VEN_CUENTA: readonly Rol[] = ['GESTOR', 'COLABORADOR', 'SUPERVISOR', 'LEGAL_RECLAMOS']
const VEN_SENSIBLES: readonly Rol[] = ['SUPERVISOR', 'LEGAL_RECLAMOS', 'MESA_SGD']

export const puedeVerClientes = (p: Persona) => puede.atender(p.rol) || p.rol === 'COORDINADOR_CX'
export function permisos360(p: Persona): Record<Seccion, boolean> {
  const atiende = puede.atender(p.rol)
  const ve = puedeVerClientes(p)
  return { lotes: ve, tickets: ve, llamadas: ve, correos: atiende, cuotas: VEN_CUENTA.includes(p.rol), documentos: atiende }
}
export const verSensibles = (p: Persona) => VEN_SENSIBLES.includes(p.rol)

// ── Búsqueda de clientes (HU-ATC-049) ───────────────────────────────────────

export type Criterio = 'N.º de ticket' | 'Código' | 'DNI' | 'Teléfono' | 'Nombre' | 'Lote'
export interface ResultadoBusqueda {
  readonly cliente: Cliente
  readonly criterio: Criterio
}

const sinTildes = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
const digitos = (s: string) => s.replace(/\D/g, '')

/** Puro: quién coincide con la consulta y por qué campo. Un cliente sale una sola vez. */
export function coincidencias(d: Datos, consulta: string): ResultadoBusqueda[] {
  const q = sinTildes(consulta.trim())
  if (q.length < 3) return []
  const salida = new Map<string, ResultadoBusqueda>()
  const sumar = (c: Cliente | null, criterio: Criterio) => c && c.id !== INTERESADO_ID && !salida.has(c.id) && salida.set(c.id, { cliente: c, criterio })
  if (/[a-z]{2,4}-?\d/.test(q)) d.tickets.filter((t) => sinTildes(t.numero).includes(q)).forEach((t) => sumar(cliente(t.clienteId), 'N.º de ticket'))
  if (q.startsWith('cli-')) CLIENTES.filter((c) => c.id.includes(q)).forEach((c) => sumar(c, 'Código'))
  const n = digitos(q)
  if (n.length >= 3 && /^[\d\s+-]+$/.test(q)) {
    CLIENTES.filter((c) => c.dni.startsWith(n)).forEach((c) => sumar(c, 'DNI'))
    CLIENTES.filter((c) => digitos(c.telefono).includes(n)).forEach((c) => sumar(c, 'Teléfono'))
  }
  if (/[a-z]/.test(q) && !q.startsWith('cli-')) {
    const palabras = q.split(/\s+/)
    CLIENTES.filter((c) => palabras.every((p) => sinTildes(c.nombre).includes(p))).forEach((c) => sumar(c, 'Nombre'))
    CLIENTES.filter((c) => c.proyectos.some((p) => palabras.every((w) => sinTildes(p).includes(w)))).forEach((c) => sumar(c, 'Lote'))
  }
  return [...salida.values()].slice(0, 8)
}

/** CA-01 y CA-03: el motor de búsqueda consulta SIGDA/TAXON; si no responde, se avisa y se sigue por la excepción. */
export function buscarClientes360(d: Datos, consulta: string, actorId: string): [Datos, ResultadoBusqueda[]] {
  exigir(puedeVerClientes(actorDe(actorId)), 'buscar clientes')
  if (fuenteCaida(d, 'SIGDA')) throw noDisponible('SIGDA', 'No registres al cliente en otro lado: usa «Interesado» y se vinculará solo.')
  const r = coincidencias(d, consulta)
  return [r.length ? emitir(d, 'cliente_buscado', { criterio: r[0].criterio }) : d, r]
}

// ── Consulta 360 por secciones (HU-ATC-050 y 051) ───────────────────────────

export type Seccion360<T> =
  | { readonly estado: 'ok'; readonly datos: T; readonly intento: Date }
  | { readonly estado: 'restringido' }
  | { readonly estado: 'no-disponible'; readonly fuente: FuenteId; readonly intento: Date }

export interface TicketPrevio {
  readonly ticket: Ticket
  readonly interacciones: number
}

export interface Vista360 {
  readonly cliente: Cliente
  readonly lotes: Seccion360<Lote[]>
  readonly cuotas: Seccion360<EstadoCuenta[]>
  readonly correos: Seccion360<CorreoCliente[]>
  readonly documentos: Seccion360<DocumentoCliente[]>
  readonly tickets: Seccion360<TicketPrevio[]>
  readonly llamadas: Seccion360<Llamada[]>
}

const visibles = (p: Persona, docs: DocumentoCliente[]) => (verSensibles(p) ? docs : docs.filter((x) => !x.sensible))

export function documentosVisibles(personaId: string, clienteId: string): DocumentoCliente[] {
  const c = cliente(clienteId)
  return c ? visibles(actorDe(personaId), documentosDe(c)) : []
}

/** Consulta en línea: lo que la fuente devuelve se muestra y no se guarda. Cada sección falla por separado. */
export function consultar360(d: Datos, clienteId: string, actorId: string): [Datos, Vista360] {
  const p = actorDe(actorId)
  exigir(puedeVerClientes(p), 'consultar al cliente')
  const c = cliente(clienteId)
  if (!c || c.id === INTERESADO_ID) throw new ErrorSimulado(404, 'cliente-no-encontrado', 'Ese cliente no está en el maestro: vincula primero al interesado.')
  const ver = permisos360(p)
  const ahora = d.ahora
  const de = <T,>(seccion: Seccion, fuente: FuenteId | null, leer: () => T): Seccion360<T> =>
    !ver[seccion] ? { estado: 'restringido' } : fuente && fuenteCaida(d, fuente) ? { estado: 'no-disponible', fuente, intento: ahora } : { estado: 'ok', datos: leer(), intento: ahora }
  const vista: Vista360 = {
    cliente: c,
    lotes: de('lotes', 'SIGDA', () => lotesDe(c)),
    cuotas: de('cuotas', 'COBRANZA', () => lotesDe(c).map((l) => estadoDeCuenta(c, l, ahora, regularizado(d, l.id)))),
    correos: de('correos', 'CORREO', () => correosDe(c, ahora)),
    documentos: de('documentos', 'CONTRATOS', () => visibles(p, documentosDe(c))),
    tickets: de('tickets', null, () => d.tickets.filter((t) => t.clienteId === c.id).map((t) => ({ ticket: t, interacciones: d.interacciones.filter((i) => i.ticketId === t.id).length }))),
    llamadas: de('llamadas', null, () => d.llamadas.filter((x) => x.clienteId === c.id)),
  }
  const ok = [vista.lotes, vista.cuotas, vista.correos, vista.documentos, vista.tickets, vista.llamadas].filter((s) => s.estado === 'ok').length
  return [emitir(d, 'consulta360', { secciones: ok }), vista]
}

/** HU-ATC-053: búsqueda por significado en los documentos que el rol puede ver; los restringidos ni aparecen (CA-02). */
export function buscarDocumentos(d: Datos, clienteId: string, consulta: string, actorId: string): [Datos, { resultados: ResultadoDocumento[]; sugerencias: string[] }] {
  const p = actorDe(actorId)
  if (!permisos360(p).documentos) throw new ErrorSimulado(403, 'sin-permiso-documentos', 'Tu rol no consulta los documentos del cliente (RN-SVC-036).', { auditar: true })
  const c = cliente(clienteId)
  if (!c || c.id === INTERESADO_ID) throw new ErrorSimulado(404, 'cliente-no-encontrado', 'Ese cliente no está en el maestro.')
  if (!consulta.trim()) throw invalido([{ campo: 'consulta', mensaje: 'Escribe qué documento buscas, con tus palabras.' }])
  if (fuenteCaida(d, 'CONTRATOS')) throw noDisponible('CONTRATOS', 'Inténtalo en unos minutos.')
  const docs = visibles(p, documentosDe(c))
  const resultados = buscarPorSignificado(docs, consulta)
  return [emitir(d, 'busqueda_semantica', { resultados: resultados.length }), { resultados, sugerencias: resultados.length ? [] : sugerenciasExactas(docs) }]
}

// ── Excepciones del cliente: interesado (HU-ATC-051) ────────────────────────

export interface Interesado {
  readonly id: string
  readonly ticketId: string
  readonly nombre: string
  readonly telefono: string
  readonly dni: string
  readonly motivo: 'NO_ENCONTRADO' | 'SIGDA_CAIDO'
  readonly estado: 'PENDIENTE' | 'VINCULADO'
  readonly clienteId: string | null
  readonly registrado: Date
  readonly vinculado: Date | null
}
export const interesadoDe = (d: Datos, ticketId: string) => d.interesados.find((i) => i.ticketId === ticketId) ?? null
export const NOMBRE_MOTIVO_INTERESADO = { NO_ENCONTRADO: 'No está en SIGDA/TAXON', SIGDA_CAIDO: 'SIGDA/TAXON no respondió' } as const

function nota(d: Datos, ticketId: string, texto: string, autor: string | null): Datos {
  const [id, s] = nuevoId(d, 'in')
  return { ...s, interacciones: [...s.interacciones, { id, ticketId, fecha: d.ahora, tipo: 'nota', visible: false, canal: 'Teléfono', autor, texto, adjuntos: [] }] }
}

export interface EntradaInteresado {
  readonly nombre: string
  readonly telefono: string
  readonly dni: string
}

/** CA-01 y CA-02: el ticket se crea con datos mínimos y queda pendiente de vincular; no nace un registro paralelo del cliente. */
export function validarInteresado(i: EntradaInteresado): CampoInvalido[] {
  const campos: CampoInvalido[] = []
  if (i.nombre.trim().length < 3) campos.push({ campo: 'nombreInteresado', mensaje: 'Escribe el nombre del interesado.' })
  if (digitos(i.telefono).length < 7) campos.push({ campo: 'telefonoInteresado', mensaje: 'Escribe un teléfono de contacto (mínimo 7 dígitos).' })
  if (i.dni.trim() && !/^\d{8}$/.test(i.dni.trim())) campos.push({ campo: 'dniInteresado', mensaje: 'El DNI tiene 8 dígitos; déjalo vacío si no lo tienes.' })
  return campos
}

export function crearTicketInteresado(d: Datos, entrada: Omit<EntradaTicket, 'clienteId'>, i: EntradaInteresado, actorId: string, apertura: Date = d.ahora): [Datos, Ticket] {
  const campos = validarInteresado(i)
  if (campos.length) throw invalido(campos)
  const [d1, t] = crearTicket(d, { ...entrada, clienteId: INTERESADO_ID }, actorId, apertura)
  const motivo = fuenteCaida(d, 'SIGDA') ? 'SIGDA_CAIDO' : 'NO_ENCONTRADO'
  const [id, s] = nuevoId(d1, 'int')
  const reg: Interesado = { id, ticketId: t.id, nombre: i.nombre.trim(), telefono: i.telefono.trim(), dni: i.dni.trim(), motivo, estado: 'PENDIENTE', clienteId: null, registrado: apertura, vinculado: null }
  return [emitir({ ...s, interesados: [...s.interesados, reg] }, 'consulta_excepcion', { motivo }), t]
}

/** CA-03: al vincular, el ticket toma al cliente del maestro y el cambio queda en la bitácora. `actorId` null = el sistema. */
export function vincularInteresado(d: Datos, ticketId: string, clienteId: string, actorId: string | null): Datos {
  if (actorId) exigir(puede.atender(actorDe(actorId).rol), 'vincular al cliente')
  const reg = interesadoDe(d, ticketId)
  if (!reg || reg.estado === 'VINCULADO') throw new ErrorSimulado(409, 'sin-vinculacion-pendiente', 'Este ticket no tiene una vinculación pendiente.')
  if (fuenteCaida(d, 'SIGDA')) throw noDisponible('SIGDA', 'La vinculación se reintentará sola cuando responda.')
  const c = cliente(clienteId)
  if (!c || c.id === INTERESADO_ID) throw invalido([{ campo: 'cliente', mensaje: 'Elige al cliente del maestro SIGDA/TAXON.' }])
  let s = conTicket(d, { ...ticketDe(d, ticketId), clienteId: c.id })
  s = { ...s, interesados: s.interesados.map((x) => (x.id === reg.id ? { ...x, estado: 'VINCULADO', clienteId: c.id, vinculado: d.ahora } : x)) }
  return nota(s, ticketId, `Vinculado al cliente ${c.nombre} del maestro SIGDA/TAXON${actorId ? '' : ' (reintento automático)'}.`, actorId)
}

/** El sistema reintenta las vinculaciones pendientes cuyo DNI ya existe en el maestro. */
export function reintentarVinculaciones(d: Datos): [Datos, number] {
  let s = d
  let n = 0
  if (fuenteCaida(d, 'SIGDA')) return [d, 0]
  for (const i of d.interesados) {
    const c = i.estado === 'PENDIENTE' && i.dni ? CLIENTES.find((x) => x.dni === i.dni) : null
    if (c) {
      s = vincularInteresado(s, i.ticketId, c.id, null)
      n++
    }
  }
  return [s, n]
}

// ── Llamadas (HU-ATC-042 y 049) ─────────────────────────────────────────────

export interface Llamada {
  readonly id: string
  readonly clienteId: string | null
  readonly ticketId: string | null
  readonly sentido: 'ENTRANTE' | 'SALIENTE'
  readonly inicio: Date
  readonly duracionS: number
  readonly grabacion: string
  readonly autor: string
}
export const textoDuracion = (s: number) => (s < 60 ? `${s} s` : `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, '0')} s`)

function siguienteGrabacion(d: Datos): [string, Datos] {
  const n = (d.secuencias.REC ?? 0) + 1
  return [`REC-${String(n).padStart(4, '0')}`, { ...d, secuencias: { ...d.secuencias, REC: n } }]
}

/** CA-01 de HU-ATC-042: la ficha y los tickets abiertos por el teléfono que llama. */
export function fichaPorTelefono(d: Datos, numero: string, actorId: string): { cliente: Cliente | null; abiertos: Ticket[] } {
  exigir(puede.atender(actorDe(actorId).rol), 'atender llamadas')
  if (fuenteCaida(d, 'SIGDA')) throw noDisponible('SIGDA', 'Busca al cliente a mano cuando vuelva, o regístralo como interesado.')
  const n = digitos(numero).slice(-9)
  const c = n.length >= 7 ? (CLIENTES.find((x) => digitos(x.telefono).slice(-9) === n) ?? null) : null
  return { cliente: c, abiertos: c ? d.tickets.filter((t) => t.clienteId === c.id && ESTADOS_ACTIVOS.includes(t.estado)) : [] }
}

/** CA-02 de HU-ATC-042: la llamada finalizada queda como interacción del ticket, con duración y grabación. */
export function finalizarLlamada(d: Datos, e: { clienteId: string | null; ticketId: string | null; duracionS: number }, actorId: string): [Datos, Llamada] {
  exigir(puede.atender(actorDe(actorId).rol), 'registrar llamadas')
  if (e.ticketId) ticketDe(d, e.ticketId)
  const [grabacion, s0] = siguienteGrabacion(d)
  const [id, s1] = nuevoId(s0, 'll')
  const duracionS = Math.max(1, Math.round(e.duracionS))
  const llamada: Llamada = { id, clienteId: e.clienteId, ticketId: e.ticketId, sentido: 'ENTRANTE', inicio: new Date(d.ahora.getTime() - duracionS * 1000), duracionS, grabacion, autor: actorId }
  let s: Datos = { ...s1, llamadas: [...s1.llamadas, llamada] }
  if (e.ticketId) s = nota(s, e.ticketId, `Llamada entrante · ${textoDuracion(duracionS)} · Grabación ${grabacion}.`, actorId)
  return [emitir(s, 'llamada_registrada', { duracion: duracionS }), llamada]
}

/** CA-02 de HU-ATC-049: «Llamar» inicia la llamada por la plataforma del call center y queda en el ticket. */
export function iniciarLlamada(d: Datos, clienteId: string, ticketId: string | null, actorId: string): [Datos, Llamada] {
  exigir(puede.atender(actorDe(actorId).rol), 'llamar al cliente')
  const c = cliente(clienteId)
  if (!c || c.id === INTERESADO_ID) throw new ErrorSimulado(409, 'sin-cliente', 'Vincula primero al cliente: el interesado no tiene ficha del maestro.')
  if (fuenteCaida(d, 'CALLCENTER')) throw noDisponible('CALLCENTER', 'Marca desde tu teléfono y registra la llamada como nota del ticket.')
  if (ticketId) ticketDe(d, ticketId)
  const [grabacion, s0] = siguienteGrabacion(d)
  const [id, s1] = nuevoId(s0, 'll')
  const llamada: Llamada = { id, clienteId, ticketId, sentido: 'SALIENTE', inicio: d.ahora, duracionS: 0, grabacion, autor: actorId }
  let s: Datos = { ...s1, llamadas: [...s1.llamadas, llamada] }
  if (ticketId) s = nota(s, ticketId, `Llamada saliente iniciada desde la ficha del cliente · Grabación ${grabacion}.`, actorId)
  return [emitir(s, 'llamada_registrada', { duracion: 0 }), llamada]
}

// ── Motor de consultas (HU-ATC-052) ─────────────────────────────────────────

export const CONSULTAS_MOTOR = [
  { id: 'saldo', nombre: 'Saldo de un lote', requiere: 'cuotas' },
  { id: 'proxima-cuota', nombre: 'Próxima cuota y su vencimiento', requiere: 'cuotas' },
  { id: 'ultimo-pago', nombre: 'Último pago registrado', requiere: 'cuotas' },
  { id: 'estado-contrato', nombre: 'Estado del contrato', requiere: 'lotes' },
] as const satisfies readonly { id: string; nombre: string; requiere: Seccion }[]

export interface RespuestaMotor {
  readonly consulta: string
  readonly texto: string
  readonly fecha: Date
}
export interface ConsultaMotorLog {
  readonly id: string
  readonly ticketId: string
  readonly fecha: Date
  readonly autor: string
  readonly consulta: string
}

const soles = (n: number) => `S/ ${n.toLocaleString('es-PE')}`
const dia = (f: Date) => f.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })

/** La respuesta viene del motor por API; no se guarda, solo se registra que se consultó. Sin permiso: 403 y queda el intento. */
export function consultarMotor(d: Datos, ticketId: string, consultaId: string, loteId: string, actorId: string): [Datos, RespuestaMotor] {
  const p = actorDe(actorId)
  exigir(puede.atender(p.rol), 'consultar al motor')
  const q = CONSULTAS_MOTOR.find((x) => x.id === consultaId)
  if (!q) throw invalido([{ campo: 'consulta', mensaje: 'Elige una consulta del motor.' }])
  const t = ticketDe(d, ticketId)
  const c = cliente(t.clienteId)
  if (!c || c.id === INTERESADO_ID) throw new ErrorSimulado(409, 'sin-cliente', 'Vincula primero al cliente para consultar sus datos.')
  const lote = lotesDe(c).find((l) => l.id === loteId)
  if (!lote) throw invalido([{ campo: 'lote', mensaje: 'Elige uno de los lotes del cliente.' }])
  if (fuenteCaida(d, 'MOTOR')) throw noDisponible('MOTOR', 'Sigue con la atención y vuelve a consultar en unos minutos.')
  if (!permisos360(p)[q.requiere]) throw new ErrorSimulado(403, 'sin-permiso-motor', `El motor no devuelve «${q.nombre.toLowerCase()}» para tu rol; el intento queda registrado (RN-SVC-036).`, { auditar: true })
  const cuenta = estadoDeCuenta(c, lote, d.ahora, regularizado(d, lote.id))
  const texto =
    q.id === 'saldo'
      ? `Saldo de ${lote.descripcion}: ${soles(cuenta.saldo)} en ${36 - cuenta.pagadas} cuotas${cuenta.diasMora ? `, con ${cuenta.diasMora} días de mora` : ''}.`
      : q.id === 'proxima-cuota'
        ? cuenta.proxima ? `Próxima cuota de ${lote.descripcion}: n.º ${cuenta.proxima.n} de ${soles(cuenta.proxima.monto)}, ${cuenta.proxima.estado === 'Vencida' ? 'vencida el' : 'vence el'} ${dia(cuenta.proxima.vence)}.` : 'No tiene cuotas pendientes.'
        : q.id === 'ultimo-pago'
          ? cuenta.ultimoPago ? `Último pago de ${lote.descripcion} registrado el ${dia(cuenta.ultimoPago)}.` : 'Sin pagos registrados.'
          : `Contrato ${lote.contrato} de ${lote.descripcion}: ${lote.estado}, firmado el ${dia(lote.firmado)}.`
  const [id, s] = nuevoId(d, 'cm')
  const log: ConsultaMotorLog = { id, ticketId, fecha: d.ahora, autor: actorId, consulta: q.id }
  return [emitir({ ...s, consultasMotor: [...s.consultasMotor, log] }, 'consulta_motor', { consulta: q.id }), { consulta: q.nombre, texto, fecha: d.ahora }]
}

// ── Sincronización con Legal (HU-ATC-040) ───────────────────────────────────

export type EstadoLegal = 'EN_COLA' | 'ENVIADO' | 'EN_REVISION' | 'RESUELTO'
export const NOMBRE_ESTADO_LEGAL: Record<EstadoLegal, string> = { EN_COLA: 'Pendiente de sincronizar', ENVIADO: 'Recibido por Legal', EN_REVISION: 'En revisión en Legal', RESUELTO: 'Resuelto por Legal' }

export interface SincLegal {
  readonly id: string
  readonly ticketId: string
  readonly estado: EstadoLegal
  readonly idLegal: string | null
  readonly paquete: number
  readonly creado: Date
  readonly enviado: Date | null
  readonly intentos: number
  readonly ultimoIntento: Date
  readonly resolucion: string | null
  readonly actualizado: Date | null
}
export const sincDe = (d: Datos, ticketId: string) => d.sincLegal.find((x) => x.ticketId === ticketId) ?? null

function entregar(d: Datos, s: SincLegal): [Datos, SincLegal] {
  const n = (d.secuencias.LEGAL ?? 0) + 1
  const nuevo: SincLegal = { ...s, estado: 'ENVIADO', idLegal: `LEG-${String(n).padStart(4, '0')}`, enviado: d.ahora, intentos: s.intentos + 1, ultimoIntento: d.ahora }
  return [{ ...d, secuencias: { ...d.secuencias, LEGAL: n } }, nuevo]
}

/** CA-01 y CA-03: al derivar a Eje 3 el caso se envía con el paquete mínimo; con Legal caído queda en cola. */
export function enviarALegal(d: Datos, ticketId: string, elementos: Readonly<Record<string, string>>): Datos {
  const base: SincLegal = { id: `sl-${d.sincLegal.length + 1}`, ticketId, estado: 'EN_COLA', idLegal: null, paquete: Object.keys(elementos).length, creado: d.ahora, enviado: null, intentos: 1, ultimoIntento: d.ahora, resolucion: null, actualizado: null }
  const [s, reg] = fuenteCaida(d, 'LEGAL') ? [d, base] : entregar(d, base)
  return emitir({ ...s, sincLegal: [...s.sincLegal, reg] }, 'legal_sync', { estado: reg.estado })
}

/** El reintento programado: cada corrida vuelve a intentar los envíos en cola. */
export function reintentarSyncLegal(d: Datos): [Datos, number] {
  let s = d
  let enviados = 0
  for (const x of d.sincLegal.filter((y) => y.estado === 'EN_COLA')) {
    const [s2, reg] = fuenteCaida(s, 'LEGAL') ? [s, { ...x, intentos: x.intentos + 1, ultimoIntento: s.ahora }] : entregar(s, x)
    s = { ...s2, sincLegal: s2.sincLegal.map((y) => (y.id === x.id ? reg : y)) }
    if (reg.estado === 'ENVIADO') {
      enviados++
      s = emitir(s, 'legal_sync', { estado: 'ENVIADO' })
    }
  }
  return [s, enviados]
}

/** CA-02: Legal actualiza o resuelve en su herramienta y el ticket lo refleja sin registro manual (solo en la simulación). */
export function legalActualiza(d: Datos, ticketId: string, estado: 'EN_REVISION' | 'RESUELTO', resolucion: string): Datos {
  const x = sincDe(d, ticketId)
  if (!x || x.estado === 'EN_COLA') throw new ErrorSimulado(409, 'sin-caso-en-legal', 'Legal todavía no recibió este caso.')
  if (fuenteCaida(d, 'LEGAL')) throw noDisponible('LEGAL', 'El cambio se sincronizará cuando responda.')
  let s: Datos = { ...d, sincLegal: d.sincLegal.map((y) => (y.id === x.id ? { ...y, estado, resolucion: estado === 'RESUELTO' ? resolucion : y.resolucion, actualizado: d.ahora } : y)) }
  const t = ticketDe(s, ticketId)
  if (estado === 'RESUELTO' && t.estado !== 'RESOLVED' && t.estado !== 'CLOSED') s = cambiarEstado(s, ticketId, 'RESOLVED', null, `Resuelto por Legal (${x.idLegal}): ${resolucion}`)
  return emitir(s, 'legal_sync', { estado })
}

// ── Exposición por riesgo de denuncia (HU-ATC-041) ──────────────────────────

/** RN-SVC-034: interés legal referencial del 8 % anual (a confirmar con Legal). */
export const INTERES_LEGAL = 0.08
/** SUPUESTO: la alerta a Legal sale cuando la exposición llega a este monto. */
export const UMBRAL_EXPOSICION = 500
const SENALES_DENUNCIA = ['INDECOPI', 'ABOGADO', 'CARTA_NOTARIAL'] as const

export interface Exposicion {
  readonly monto: number | null
  readonly moneda: string
  readonly dias: number
  readonly interes: number
  readonly total: number | null
}

export const riesgoDenuncia = (d: Datos, t: Ticket) =>
  ESTADOS_ACTIVOS.includes(t.estado) && (senalesActivas(d, t.id).some((s) => (SENALES_DENUNCIA as readonly string[]).includes(s)) || t.reaperturas >= 2)

/** Monto más interés legal al día; sin monto, «por estimar» (total null) y el caso sigue priorizado. Null si no hay riesgo ni monto. */
export function exposicionDe(d: Datos, t: Ticket): Exposicion | null {
  const a = asientoDeTicket(d, t.id)
  if (a?.monto) {
    const dias = Math.max(0, Math.floor((d.ahora.getTime() - a.registrado.getTime()) / 86_400_000))
    const interes = Math.round(a.monto * INTERES_LEGAL * (dias / 365) * 100) / 100
    return { monto: a.monto, moneda: a.moneda ?? 'PEN', dias, interes, total: Math.round((a.monto + interes) * 100) / 100 }
  }
  return riesgoDenuncia(d, t) ? { monto: null, moneda: 'PEN', dias: 0, interes: 0, total: null } : null
}

/** CA-01 y CA-03: los de mayor exposición primero; los «por estimar» no se descartan. */
export function priorizadosPorDenuncia(d: Datos): Array<{ ticket: Ticket; exposicion: Exposicion }> {
  return d.tickets
    .filter((t) => riesgoDenuncia(d, t))
    .map((t) => ({ ticket: t, exposicion: exposicionDe(d, t) as Exposicion }))
    .sort((a, b) => (b.exposicion.total ?? -1) - (a.exposicion.total ?? -1) || senalesActivas(d, b.ticket.id).length - senalesActivas(d, a.ticket.id).length)
}

export interface AlertaRiesgo {
  readonly id: string
  readonly ticketId: string
  readonly fecha: Date
  readonly destinatario: string
  readonly total: number
  readonly moneda: string
  readonly venceLegal: Date | null
}

/** CA-02: una alerta a Legal por ticket que supera el umbral, antes de que venza su plazo. */
export function evaluarRiesgos(d: Datos): [Datos, number] {
  let s = d
  let n = 0
  for (const { ticket, exposicion } of priorizadosPorDenuncia(d)) {
    if (exposicion.total === null || exposicion.total < UMBRAL_EXPOSICION || d.alertasRiesgo.some((a) => a.ticketId === ticket.id)) continue
    const a = asientoDeTicket(d, ticket.id)
    let id: string
    ;[id, s] = nuevoId(s, 'ar')
    s = emitir({ ...s, alertasRiesgo: [...s.alertasRiesgo, { id, ticketId: ticket.id, fecha: d.ahora, destinatario: ESPECIALISTA_LEGAL, total: exposicion.total, moneda: exposicion.moneda, venceLegal: a ? (a.venceProrrogado ?? a.venceOriginal) : null }] }, 'riesgo_denuncia', { exposicion: exposicion.total })
    n++
  }
  return [s, n]
}

/** Lo que se suma a cada corrida del job: vinculaciones, cola de Legal y alertas de denuncia. */
export function controlarIntegraciones(d: Datos): [Datos, { readonly vinculados: number; readonly legalEnviados: number; readonly alertasRiesgo: number }] {
  const [d1, vinculados] = reintentarVinculaciones(d)
  const [d2, legalEnviados] = reintentarSyncLegal(d1)
  const [d3, alertasRiesgo] = evaluarRiesgos(d2)
  return [d3, { vinculados, legalEnviados, alertasRiesgo }]
}
