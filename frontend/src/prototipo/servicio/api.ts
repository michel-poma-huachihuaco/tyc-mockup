import { useSyncExternalStore } from 'react'
import { persona } from '../datos/catalogos.ts'
import type { Area, Estado, EstadoApelacion, NivelRiesgo, Rol, Senal } from '../datos/catalogos.ts'
import { buscarEnMaestro } from '../datos/clientes.ts'
import type { Cliente } from '../datos/clientes.ts'
import { INICIO, datosVacios, sembrar } from '../datos/semilla.ts'
import { sumarHorasHabiles } from './calendario.ts'
import * as C from './conflicto.ts'
import type { ElementosHandoff } from './conflicto.ts'
import * as O from './ola5.ts'
import * as S from './ola6.ts'
import * as T from './ola7.ts'
import * as O8 from './ola8.ts'
import type { PasoFlujo } from './ola6.ts'
import type { Credencial } from './ola5.ts'
import * as G from './garantias.ts'
import type { EntradaGarantia } from './garantias.ts'
import * as L from './libro.ts'
import * as M from './mesa.ts'
import type { EntradaCaso, EntradaCierre } from './mesa.ts'
import { ejecutarJobs } from './jobs.ts'
import type { ResultadoJob } from './jobs.ts'
import type { EntradaApelacion, EntradaAsiento, EntradaEstadoApelacion, EntradaProrroga, EntradaRespuesta } from './libro.ts'
import * as N from './nucleo.ts'
import type { Datos, EntradaDerivacion, EntradaInteraccion, EntradaTicket, ResumenReasignacion, Ticket } from './nucleo.ts'

/**
 * El servicio simulado tal como lo ven las pantallas: asíncrono, con latencia y con fallos
 * que se encienden desde el panel «Simulación». Es el sustituto del cliente de
 * @aybarcorp/http para el prototipo: ninguna pantalla llama a la red ni toca el núcleo.
 * Todo vive en memoria: al recargar la página vuelve al estado inicial.
 */

export interface Simulacion {
  readonly latencia: 'normal' | 'lenta'
  /** Sin conexión: toda llamada al servicio falla hasta apagarlo. */
  readonly sinConexion: boolean
  readonly sigdaCaido: boolean
  /** Llamada entrante simulada que el call center entrega a la consola (HU-ATC-042). */
  readonly llamada: { readonly numero: string; readonly id: number } | null
  /** Ingresos guardados en el celular de la garita mientras no hay conexión (HU-ATC-059 CA-03). */
  readonly ingresosPendientes: readonly { readonly entrada: O8.EntradaIngreso; readonly por: string }[]
  /** Fecha de apertura del próximo ticket; null = el reloj simulado. */
  readonly apertura: Date | null
  readonly personaId: string
}

export interface Consola {
  readonly datos: Datos
  readonly sim: Simulacion
}

/** Quién es quién en «Ver como»: una persona ficticia por rol. */
export const PERSONA_DE_ROL: Readonly<Record<Rol, string>> = {
  GESTOR: 'p-crojas',
  COLABORADOR: 'p-mpaz',
  SUPERVISOR: 'p-gnunez',
  COORDINADOR_CX: 'p-avaldivia',
  LEGAL_RECLAMOS: 'p-pvilchez',
  MESA_SGD: 'p-vortiz',
  MODERADOR_EVENTO: 'p-fmoreno',
  ADMIN_FUNCIONAL: 'p-aperez',
  CONTROL_ACCESO: 'p-ghuaman',
  CLIENTE: 'p-cliente',
  SIN_ATENCION: 'p-mtello',
}

let consola: Consola = {
  datos: sembrar(),
  sim: { latencia: 'normal', sinConexion: false, sigdaCaido: false, llamada: null, ingresosPendientes: [], apertura: null, personaId: PERSONA_DE_ROL.GESTOR },
}
const escuchas = new Set<() => void>()

/**
 * Reloj del navegador alineado con el simulado. La Timeline de @aybarcorp/ui escribe «hace
 * 5 min» contra Date.now() y no admite un «ahora» de referencia (pedido al framework): sin
 * esto, un mensaje de las 11:00 simuladas saldría «dentro de 3 días». Date.now() parte del
 * reloj simulado y corre al ritmo real (los temporizadores de los toasts siguen sirviendo).
 * Solo lo activa la entrada del prototipo; la aplicación no lo toca.
 */
const ahoraReal = Date.now.bind(Date)
let ancla = { simulado: consola.datos.ahora.getTime(), real: ahoraReal() }
export function alinearRelojDelNavegador() {
  Date.now = () => ancla.simulado + (ahoraReal() - ancla.real)
}

function fijar(nueva: Consola) {
  if (nueva.datos.ahora.getTime() !== consola.datos.ahora.getTime()) ancla = { simulado: nueva.datos.ahora.getTime(), real: ahoraReal() }
  consola = nueva
  for (const escucha of Array.from(escuchas)) escucha()
}

function suscribir(escucha: () => void) {
  escuchas.add(escucha)
  return () => {
    escuchas.delete(escucha)
  }
}

export function useConsola(): Consola {
  return useSyncExternalStore(suscribir, () => consola)
}

export const leerConsola = () => consola

/** La persona de la sesión simulada y su rol. */
export function useSesion() {
  const { sim } = useConsola()
  const p = persona(sim.personaId)
  if (!p) throw new Error('Persona simulada desconocida')
  return p
}

const esperar = () => new Promise<void>((r) => setTimeout(r, consola.sim.latencia === 'lenta' ? 2600 : 420))

function errorDeRed() {
  return new N.ErrorSimulado(0, 'sin-conexion', 'No hay conexión con el servidor. Revisa tu red e inténtalo de nuevo.')
}

/** Una llamada al «backend»: espera, falla si se simula sin conexión y deja constancia de lo rechazado. */
async function llamar<T>(accion: string, operacion: (d: Datos) => [Datos, T]): Promise<T> {
  await esperar()
  if (consola.sim.sinConexion) throw errorDeRed()
  try {
    const [datos, resultado] = operacion(consola.datos)
    fijar({ ...consola, datos })
    return resultado
  } catch (error) {
    if (error instanceof N.ErrorSimulado && error.auditar) {
      fijar({ ...consola, datos: N.auditar(consola.datos, consola.sim.personaId, accion, error.message) })
    }
    throw error
  }
}

const sinResultado = (d: Datos): [Datos, undefined] => [d, undefined]
const actor = () => consola.sim.personaId

export const api = {
  /** La lectura inicial de una pantalla: solo latencia y el fallo forzado. */
  cargar: () => llamar('cargar', sinResultado),

  async buscarClientes(consulta: string): Promise<Cliente[]> {
    await esperar()
    if (consola.sim.sinConexion) throw errorDeRed()
    if (consola.sim.sigdaCaido) throw new N.ErrorSimulado(503, 'sigda-no-disponible', 'SIGDA/TAXON no responde. Inténtalo en unos minutos; no registres al cliente en otro lado.')
    return buscarEnMaestro(consulta)
  },

  crearTicket: (entrada: EntradaTicket) =>
    llamar<Ticket>('registrar ticket', (d) => N.crearTicket(d, entrada, actor(), consola.sim.apertura ?? d.ahora)),

  /** HU-ATC-001 CA-04: quien entra a registrar sin permiso deja el intento en la auditoría. */
  registrarIntentoSinPermiso: () =>
    fijar({ ...consola, datos: N.auditar(consola.datos, actor(), 'registrar ticket', 'Acceso a «Nuevo ticket» sin un rol de atención: denegado.') }),

  cambiarEstado: (ticketId: string, a: Estado, nota: string | null) =>
    llamar('cambiar estado', (d) => sinResultado(N.cambiarEstado(d, ticketId, a, actor(), nota))),

  registrarInteraccion: (ticketId: string, entrada: EntradaInteraccion) =>
    llamar('registrar interacción', (d) => sinResultado(N.registrarInteraccion(d, ticketId, entrada, actor()))),

  derivar: (ticketId: string, entrada: EntradaDerivacion) =>
    llamar('derivar ticket', (d) => sinResultado(N.derivar(d, ticketId, entrada, actor()))),

  tomar: (ticketId: string) => llamar('tomar ticket', (d) => sinResultado(N.tomar(d, ticketId, actor()))),

  reasignarEnBloque: (entrada: { de: string; destinatarios: string[]; motivo: string; nota: string }) =>
    llamar<ResumenReasignacion>('reasignar en bloque', (d) => N.reasignarEnBloque(d, entrada, actor())),

  editarPolitica: (id: string, respuestaH: number, resolucionH: number) =>
    llamar('editar política SLA', (d) => sinResultado(N.editarPolitica(d, id, respuestaH, resolucionH, actor()))),

  // ── Libro de Reclamaciones (ola 2) ──
  registrarAsiento: (ticketId: string, entrada: EntradaAsiento) =>
    llamar<L.Asiento>('registrar asiento', (d) => L.registrarAsiento(d, ticketId, entrada, actor())),
  prorrogar: (asientoId: string, entrada: EntradaProrroga) => llamar('prorrogar plazo legal', (d) => sinResultado(L.prorrogar(d, asientoId, entrada, actor()))),
  responderReclamo: (asientoId: string, entrada: EntradaRespuesta) => llamar('responder reclamo', (d) => sinResultado(L.responder(d, asientoId, entrada, actor()))),
  registrarApelacion: (asientoId: string, entrada: EntradaApelacion) =>
    llamar('registrar apelación', (d) => sinResultado(L.registrarApelacion(d, asientoId, entrada, actor()))),
  cambiarEstadoApelacion: (apelacionId: string, a: EstadoApelacion, entrada: EntradaEstadoApelacion) =>
    llamar('actualizar apelación', (d) => sinResultado(L.cambiarEstadoApelacion(d, apelacionId, a, entrada, actor()))),
  /** HU-ATC-012 CA-03 y HU-ATC-013 CA-02: el backend rechaza estos cambios. */
  cambiarEmpresaDeAsiento: (asientoId: string) => llamar('cambiar razón social del asiento', () => L.cambiarEmpresaDeAsiento(asientoId)),
  modificarVencimiento: (asientoId: string) => llamar('modificar vencimiento legal', () => L.modificarVencimiento(asientoId)),

  // ── Ola 8: morosidad y formularios simples ──
  registrarPago: (casoId: string) => llamar('registrar pago de la deuda', (d) => sinResultado(O8.registrarPago(d, casoId, actor()))),
  registrarAccion: (casoId: string, nota: string) => llamar('registrar acción del caso', (d) => sinResultado(O8.registrarAccion(d, casoId, nota, actor()))),
  /** Sin conexión el ingreso se guarda en el celular y se envía al recuperarla (CA-03 de HU-ATC-059). */
  async registrarIngreso(e: O8.EntradaIngreso): Promise<{ ticket: Ticket | null; guardadoLocal: boolean }> {
    if (consola.sim.sinConexion) {
      const campos = O8.validarIngreso(e)
      if (campos.length) throw N.invalido(campos)
      fijar({ ...consola, sim: { ...consola.sim, ingresosPendientes: [...consola.sim.ingresosPendientes, { entrada: e, por: actor() }] } })
      return { ticket: null, guardadoLocal: true }
    }
    return { ticket: await llamar<Ticket>('registrar ingreso', (d) => O8.registrarIngreso(d, e, actor())), guardadoLocal: false }
  },
  reservarBus: (e: O8.EntradaReserva) => llamar<O8.ReservaBus>('reservar bus', (d) => O8.reservarBus(d, e, actor())),
  cancelarReserva: (reservaId: string, clienteId: string) => llamar('cancelar reserva', (d) => sinResultado(O8.cancelarReserva(d, reservaId, clienteId, actor()))),

  // ── Ola 7: consulta 360 e integraciones ──
  buscarClientes360: (consulta: string) => llamar<T.ResultadoBusqueda[]>('buscar clientes', (d) => T.buscarClientes360(d, consulta, actor())),
  consultar360: (clienteId: string) => llamar<T.Vista360>('consulta 360', (d) => T.consultar360(d, clienteId, actor())),
  buscarDocumentos: (clienteId: string, consulta: string) => llamar('buscar documentos', (d) => T.buscarDocumentos(d, clienteId, consulta, actor())),
  crearTicketInteresado: (entrada: Omit<EntradaTicket, 'clienteId'>, i: T.EntradaInteresado) =>
    llamar<Ticket>('registrar ticket de interesado', (d) => T.crearTicketInteresado(d, entrada, i, actor(), consola.sim.apertura ?? d.ahora)),
  vincularInteresado: (ticketId: string, clienteId: string) => llamar('vincular interesado', (d) => sinResultado(T.vincularInteresado(d, ticketId, clienteId, actor()))),
  fichaPorTelefono: (numero: string) => llamar('ficha por teléfono', (d): [Datos, ReturnType<typeof T.fichaPorTelefono>] => [d, T.fichaPorTelefono(d, numero, actor())]),
  finalizarLlamada: (e: { clienteId: string | null; ticketId: string | null; duracionS: number }) => llamar<T.Llamada>('registrar llamada', (d) => T.finalizarLlamada(d, e, actor())),
  iniciarLlamada: (clienteId: string, ticketId: string | null) => llamar<T.Llamada>('llamar al cliente', (d) => T.iniciarLlamada(d, clienteId, ticketId, actor())),
  consultarMotor: (ticketId: string, consultaId: string, loteId: string) => llamar<T.RespuestaMotor>('consulta al motor', (d) => T.consultarMotor(d, ticketId, consultaId, loteId, actor())),

  // ── Ola 6: flujos, rayo, carga, guías e IA ──
  publicarFlujo: (tipo: string, area: Area, pasos: PasoFlujo[]) => llamar('publicar flujo', (d) => sinResultado(S.publicarFlujo(d, tipo, area, pasos, actor()))),
  marcarRayo: (ticketId: string, motivo: string, confirmar: boolean) => llamar('marcar rayo', (d) => sinResultado(S.marcarRayo(d, ticketId, motivo, confirmar, actor()))),
  retirarRayo: (ticketId: string) => llamar('retirar rayo', (d) => sinResultado(S.retirarRayo(d, ticketId, actor()))),
  balancear: () => llamar('balancear carga', (d) => S.balancear(d, actor())),
  cambiarDisponibilidad: (personaId: string, disp: boolean) => llamar('cambiar disponibilidad', (d) => sinResultado(S.cambiarDisponibilidad(d, personaId, disp, actor()))),
  publicarGuia: (tipo: string, e: { pasos: string[]; plantillas: string[]; criterios: string[] }) => llamar('publicar guía', (d) => sinResultado(S.publicarGuia(d, tipo, e, actor()))),
  reportarSinGuia: (tipo: string) => llamar('reportar tipo sin guía', (d) => sinResultado(S.reportarSinGuia(d, tipo))),
  decisionIA: (ticketId: string, decision: S.DecisionIA['decision'], anonimizados: number) => llamar('decisión sobre la IA', (d) => sinResultado(S.registrarDecisionIA(d, ticketId, decision, anonimizados, actor()))),

  // ── Ola 5: UrbeMind, Torre de Control y EntregaFest ──
  vincularContrato: (ticketId: string, contratoId: string) => llamar('vincular contrato', (d) => sinResultado(O.vincularContrato(d, ticketId, contratoId, actor()))),
  /** El API de UrbeMind: su resultado (incluidos los rechazos 401) es la respuesta de la llamada, no una excepción. */
  llamarApiUrbe: (e: { credencial: Credencial; accion: 'crear' | 'consultar'; resumen: string; numero: string }) => llamar<O.LlamadaApi>('API UrbeMind', (d) => O.llamarApiUrbe(d, e)),
  redistribuir: (ticketId: string, personaId: string) => llamar('redistribuir ticket', (d) => sinResultado(O.redistribuir(d, ticketId, personaId, actor()))),
  generarInforme: (tipo: 'DIARIO' | 'QUINCENAL') => llamar('generar informe', (d) => sinResultado(O.generarInforme(d, tipo, actor()))),
  ejecutarAuditoriaDatos: () => llamar('auditoría de registros paralelos', (d) => sinResultado(O.ejecutarAuditoriaDatos(d, actor()))),
  registrarCasoFest: (e: { resumen: string; riesgo: NivelRiesgo | '' }) => llamar<O.CasoFest>('registrar caso del evento', (d) => O.registrarCasoFest(d, e, actor())),
  aplicarFrase: (id: string, n: number, nota: string) => llamar('aplicar Frase Ancla', (d) => sinResultado(O.aplicarFrase(d, id, n, nota, actor()))),
  registrarEnSistema: (id: string) => llamar('registrar caso del evento', (d) => sinResultado(O.registrarEnSistema(d, id, actor()))),
  derivarEstacion4: (id: string) => llamar('derivar a la Estación 4', (d) => sinResultado(O.derivarEstacion4(d, id, actor()))),
  cerrarEnSala: (id: string) => llamar('cerrar el tema en sala', (d) => sinResultado(O.cerrarEnSala(d, id, actor()))),
  reabrirCasoFest: (id: string) => llamar('reabrir caso del evento', (d) => sinResultado(O.reabrirCasoFest(d, id, actor()))),

  // ── Garantías postventa (ola 4) ──
  registrarGarantia: (e: EntradaGarantia) => llamar<G.Garantia>('registrar garantía', (d) => G.registrarGarantia(d, e, actor())),
  programarInspeccion: (id: string, fecha: Date | null) => llamar('programar inspección', (d) => sinResultado(G.programarInspeccion(d, id, fecha, actor()))),
  registrarInspeccion: (id: string, e: { informe: string; evidencias: L.Documento[] }) =>
    llamar('registrar inspección', (d) => sinResultado(G.registrarInspeccion(d, id, e, actor()))),
  resolverGarantia: (id: string, a: 'APPROVED' | 'REJECTED' | 'RESOLVED' | '', descripcion: string) =>
    llamar('resolver garantía', (d) => sinResultado(G.resolverGarantia(d, id, a, descripcion, actor()))),
  registrarAdenda: (id: string, e: { motivo: string; documento: L.Documento | null }) => llamar('registrar adenda', (d) => sinResultado(G.registrarAdenda(d, id, e, actor()))),

  // ── Gate a Eje 3 (ola 3) ──
  marcarSenales: (ticketId: string, senales: Senal[]) => llamar('marcar señal de conflicto', (d) => sinResultado(C.marcarSenales(d, ticketId, senales, actor()))),
  retirarSenal: (ticketId: string, senal: Senal, justificacion: string) =>
    llamar('retirar señal de conflicto', (d) => sinResultado(C.retirarSenal(d, ticketId, senal, justificacion, actor()))),
  registrarNotaEmocional: (ticketId: string, texto: string) => llamar('nota de estado emocional', (d) => sinResultado(C.registrarNotaEmocional(d, ticketId, texto, actor()))),
  enviarHandoff: (ticketId: string, elementos: ElementosHandoff) => llamar('derivar a Eje 3', (d) => sinResultado(C.enviarHandoff(d, ticketId, elementos, actor()))),
  confirmarHandoff: (ticketId: string) => llamar('confirmar handoff', (d) => sinResultado(C.confirmarHandoff(d, ticketId, actor()))),

  // ── Mesa de Casos SGD (ola 3) ──
  registrarCaso: (entrada: EntradaCaso) => llamar<M.Caso>('registrar caso sensible', (d) => M.registrarCaso(d, entrada, actor())),
  reclasificarCaso: (casoId: string, motivo: string) => llamar<M.Caso>('reclasificar caso', (d) => M.reclasificar(d, casoId, motivo, actor())),
  emitirCargoPrevio: (casoId: string) => llamar('emitir cargo previo', (d) => sinResultado(M.emitirCargoPrevio(d, casoId, actor()))),
  activarCaso: (casoId: string) => llamar('emitir cargo de activación', (d) => sinResultado(M.activar(d, casoId, actor()))),
  clasificarRiesgo: (casoId: string, criterios: string[], motivo: string) =>
    llamar('clasificar riesgo', (d) => sinResultado(M.clasificarRiesgo(d, casoId, criterios, motivo, actor()))),
  agregarEvidencia: (casoId: string, e: { descripcion: string; documento: L.Documento | null; gli: string }) =>
    llamar('agregar evidencia', (d) => sinResultado(M.agregarEvidencia(d, casoId, e, actor()))),
  cerrarCaso: (casoId: string, e: EntradaCierre) => llamar('cerrar caso', (d) => sinResultado(M.cerrarCaso(d, casoId, e, actor()))),

  /** HU-ATC-004 CA-02: el backend rechaza cualquier edición o borrado de una fila de bitácora. */
  modificarFila: (filaId: string, operacion: 'editar' | 'borrar') =>
    llamar('modificar bitácora', () => N.modificarFilaDeBitacora(filaId, operacion)),
}

/** Al recuperar la conexión, el formulario de la garita envía lo que guardó en el celular. */
async function enviarPendientes() {
  for (const p of consola.sim.ingresosPendientes) {
    try {
      await llamar<Ticket>('registrar ingreso', (d) => O8.registrarIngreso(d, p.entrada, p.por))
    } catch {
      continue
    }
    fijar({ ...consola, sim: { ...consola.sim, ingresosPendientes: consola.sim.ingresosPendientes.filter((x) => x !== p) } })
  }
}

/** Los mandos del panel «Simulación»: no son parte del producto. */
export const simulacion = {
  ajustar(cambio: Partial<Simulacion>) {
    const volvio = consola.sim.sinConexion && cambio.sinConexion === false
    fijar({ ...consola, sim: { ...consola.sim, ...cambio } })
    if (volvio) void enviarPendientes()
  },

  /** La evaluación diaria de morosidad y el escalamiento de cartas (HU-ATC-056 y 058). */
  evaluarMorosidad() {
    const [datos, r] = O8.controlarMorosidad(consola.datos)
    fijar({ ...consola, datos })
    return r
  },

  /** El job programado: SLA (HU-ATC-010) y controles legales (HU-ATC-015). */
  ejecutarJob(): ResultadoJob {
    const [datos, ejecucion] = ejecutarJobs(consola.datos)
    fijar({ ...consola, datos })
    return ejecucion
  },

  /** Avanza el reloj en horas hábiles y corre el job, como lo haría el programado. */
  avanzar(horasHabiles: number): ResultadoJob {
    fijar({ ...consola, datos: N.conAhora(consola.datos, sumarHorasHabiles(consola.datos.ahora, horasHabiles)) })
    const r = simulacion.ejecutarJob()
    fijar({ ...consola, datos: O8.controlarMorosidad(consola.datos)[0] })
    return r
  },

  reiniciar() {
    fijar({ datos: sembrar(), sim: { ...consola.sim, sinConexion: false, sigdaCaido: false, llamada: null, ingresosPendientes: [], apertura: null } })
  },

  vaciar() {
    fijar({ ...consola, datos: datosVacios(INICIO) })
  },

  /** Enciende o apaga una fuente externa; al volver, el sistema reintenta lo pendiente (HU-ATC-040 y 051). */
  fuente(id: T.FuenteId, caida: boolean) {
    fijar({ datos: T.cambiarFuente(consola.datos, id, caida), sim: id === 'SIGDA' ? { ...consola.sim, sigdaCaido: caida } : consola.sim })
  },

  /** HU-ATC-040 CA-02: Legal actualiza o resuelve el caso en su herramienta. */
  legalActualiza(ticketId: string, estado: 'EN_REVISION' | 'RESUELTO', resolucion: string) {
    fijar({ ...consola, datos: T.legalActualiza(consola.datos, ticketId, estado, resolucion) })
  },

  /** HU-ATC-044 CA-02: entra un ticket por Mi Portal sin responsable (solo en la simulación). */
  ticketEntrante(tipo: string) {
    const [datos, t, r] = S.ticketEntrante(consola.datos, tipo)
    fijar({ ...consola, datos })
    return { numero: t.numero, resultado: r }
  },

  /** HU-ATC-019: el cliente responde la encuesta (solo en la simulación). */
  responderEncuesta(id: string, csat: number, ces: number) {
    fijar({ ...consola, datos: O.responderEncuesta(consola.datos, id, csat, ces) })
  },

  /** HU-ATC-032 CA-02: hace aparecer un registro paralelo del dato de cliente. */
  registroParalelo() {
    fijar({ ...consola, datos: O.simularRegistroParalelo(consola.datos) })
  },

  /** HU-ATC-002 CA-03: dos guardados a la vez de la misma empresa. */
  async guardadosSimultaneos(empresaId: string): Promise<[Ticket, Ticket]> {
    const entrada = (n: number): EntradaTicket => ({
      canal: 'Teléfono',
      clienteId: `cli-0${20 + n}`,
      empresaId,
      linea: 'Lotes urbanos',
      establecimiento: '',
      tipo: 'CTA',
      prioridad: 'MEDIUM',
      resumen: `Prueba de concurrencia ${n}`,
      descripcion: 'Guardado simultáneo desde el panel de simulación.',
    })
    return Promise.all([api.crearTicket(entrada(1)), api.crearTicket(entrada(2))])
  },
}

export type { ResultadoJob }

/** Una línea con lo que hizo el job, para los avisos. */
export function resumenJob(j: ResultadoJob): string {
  const { sla, legal, handoffs, mesa, integraciones } = j
  return `Job: ${sla.nuevas} alertas SLA nuevas (${sla.omitidas} omitidas por estar ya alertadas), ${legal.alertasNuevas} alertas legales nuevas (${legal.alertasOmitidas} omitidas), ${legal.huerfanosNuevos} tickets huérfanos, ${handoffs.avisos} handoffs sin confirmar, ${mesa.escalamientos} escalamientos de la Mesa SGD, ${integraciones.vinculados} vinculaciones de interesados, ${integraciones.legalEnviados} envíos de la cola a Legal y ${integraciones.alertasRiesgo} alertas por riesgo de denuncia.`
}

export type { Area, Cliente, Estado }
