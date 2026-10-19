import assert from 'node:assert/strict'
import { test } from 'node:test'
import { sumarHorasHabiles } from '../src/prototipo/servicio/calendario.ts'
import {
  ErrorSimulado,
  cambiarEstado,
  cierreE2E,
  conAhora,
  crearTicket,
  derivar,
  detectarPii,
  editarPolitica,
  ejecutarJob,
  elegirPolitica,
  estadoSla,
  modificarFilaDeBitacora,
  pendientesDe,
  reasignarEnBloque,
  registrarInteraccion,
  tomar,
} from '../src/prototipo/servicio/nucleo.ts'
import type { Datos, EntradaTicket } from '../src/prototipo/servicio/nucleo.ts'
import { INICIO, datosVacios, sembrar } from '../src/prototipo/datos/semilla.ts'

/**
 * Prototipo G2, ola 1 (HU-ATC-001..011 y 029): los criterios de aceptación que dependen de
 * reglas, verificados sobre el núcleo del servicio simulado. Lo que es de pantalla
 * (mensajes, foco, estados de carga) se verifica en el recorrido del prototipo.
 */

const BASE: EntradaTicket = {
  canal: 'WhatsApp',
  clienteId: 'cli-001',
  empresaId: 'AIN',
  linea: 'Lotes urbanos',
  establecimiento: '',
  tipo: 'CTA',
  prioridad: 'MEDIUM',
  resumen: 'Consulta de prueba',
  descripcion: 'Descripción de prueba',
}

const GESTOR = 'p-crojas'
const SUPERVISOR = 'p-gnunez'

function rechaza(fn: () => unknown, status: number, codigo?: string) {
  assert.throws(fn, (e: unknown) => e instanceof ErrorSimulado && e.status === status && (!codigo || e.codigo === codigo))
}

function nuevo(d: Datos = datosVacios(), entrada: Partial<EntradaTicket> = {}, actor = GESTOR) {
  return crearTicket(d, { ...BASE, ...entrada }, actor)
}

test('la semilla se reproduce sin errores y deja datos coherentes', () => {
  const d = sembrar()
  assert.equal(d.ahora.getTime(), INICIO.getTime())
  assert.ok(d.tickets.length >= 25)
  assert.equal(pendientesDe(d, 'p-rsalazar').length, 12, 'HU-008 CA-01 necesita un colaborador con 12 pendientes')
  for (const t of d.tickets) assert.ok(t.abierto <= INICIO, `${t.numero} no puede abrirse en el futuro`)
})

test('HU-001 CA-01: sin empresa o sin línea no se guarda y se señalan los campos', () => {
  rechaza(() => nuevo(undefined, { empresaId: '', linea: '' }), 400, 'validacion')
  try {
    nuevo(undefined, { empresaId: '', linea: '' })
  } catch (e) {
    const campos = (e as ErrorSimulado).campos.map((c) => c.campo)
    assert.deepEqual(campos.sort(), ['empresa', 'linea'])
  }
})

test('HU-001 CA-02: por WhatsApp se guarda con el establecimiento vacío', () => {
  const [, t] = nuevo(undefined, { canal: 'WhatsApp', establecimiento: '' })
  assert.equal(t.establecimiento, null)
})

test('HU-001 CA-04: un rol sin atención no registra y el intento se marca para auditoría', () => {
  assert.throws(
    () => nuevo(undefined, {}, 'p-mtello'),
    (e: unknown) => e instanceof ErrorSimulado && e.status === 403 && e.auditar,
  )
})

test('HU-002 CA-01 y CA-03: correlativo propio por empresa, sin saltos ni duplicados', () => {
  let d = datosVacios()
  const numeros: string[] = []
  for (const empresaId of ['AIN', 'ALT', 'AIN', 'AIN', 'ALT']) {
    const [d2, t] = nuevo(d, { empresaId })
    d = d2
    numeros.push(t.numero)
  }
  assert.deepEqual(numeros, ['AIN-000482', 'ALT-001204', 'AIN-000483', 'AIN-000484', 'ALT-001205'])
  assert.equal(new Set(numeros).size, numeros.length)
})

test('HU-003 CA-01: la política específica (tipo + prioridad) precede a la genérica', () => {
  const d = datosVacios()
  assert.equal(elegirPolitica(d.politicas, 'CTA', 'URGENT').origen, 'especifica')
  assert.equal(elegirPolitica(d.politicas, 'CTA', 'LOW').origen, 'generica')
})

test('HU-003 CA-02: viernes 18:00 antes de feriado vence en horas hábiles posteriores', () => {
  // Vie 26-jun-2026 18:00; lunes 29-jun es feriado: la cuenta empieza el martes 30 a las 9:00.
  const apertura = new Date(2026, 5, 26, 18, 0)
  const vence = sumarHorasHabiles(apertura, 4)
  assert.equal(vence.getTime(), new Date(2026, 5, 30, 13, 0).getTime())
  const [, t] = crearTicket(datosVacios(apertura), BASE, GESTOR, apertura)
  assert.notEqual(estadoSla(t, apertura).nivel, 'vencido', 'no nace incumplido')
})

test('HU-003 CA-03: cambiar la política no mueve los vencimientos congelados', () => {
  const [d, t] = nuevo()
  const d2 = editarPolitica(d, 'POL-CTA', 1, 10, SUPERVISOR)
  const t2 = d2.tickets.find((x) => x.id === t.id)
  assert.equal(t2?.venceResolucion.getTime(), t.venceResolucion.getTime())
  const [, otro] = nuevo(d2)
  assert.notEqual(otro.venceResolucion.getTime(), t.venceResolucion.getTime(), 'el ticket nuevo sí usa la política editada')
})

test('HU-003 CA-04: un tipo sin política usa la global y deja una alerta de configuración', () => {
  const [d, t] = nuevo(undefined, { tipo: 'PED' })
  assert.equal(t.politica.origen, 'global')
  assert.equal(d.alertasConfiguracion.length, 1)
})

test('HU-004 CA-01 y CA-03: cada cambio agrega una fila; el automático va sin autor', () => {
  let [d, t] = nuevo()
  const filas = d.filasEstado.length
  d = cambiarEstado(d, t.id, 'IN_PROGRESS', GESTOR)
  assert.equal(d.filasEstado.length, filas + 1)
  assert.equal(d.filasEstado.at(-1)?.autor, GESTOR)
  ;[d, t] = nuevo(d)
  d = registrarInteraccion(d, t.id, { visible: true, canal: 'WhatsApp', texto: 'Hola', adjuntos: [] }, GESTOR)
  const auto = d.filasEstado.at(-1)
  assert.equal(auto?.a, 'IN_PROGRESS')
  assert.equal(auto?.autor, null)
})

test('HU-004 CA-02: editar o borrar una fila de historial se rechaza', () => {
  rechaza(() => modificarFilaDeBitacora('fe-1', 'editar'), 409, 'bitacora-inmutable')
  rechaza(() => modificarFilaDeBitacora('fe-1', 'borrar'), 409, 'bitacora-inmutable')
})

test('HU-004 CA-04: de CERRADO a EN ATENCIÓN sin reabrir se impide', () => {
  let [d, t] = nuevo()
  d = cambiarEstado(d, t.id, 'RESOLVED', GESTOR)
  d = cambiarEstado(d, t.id, 'CLOSED', GESTOR)
  assert.throws(
    () => cambiarEstado(d, t.id, 'IN_PROGRESS', GESTOR),
    (e: unknown) => e instanceof ErrorSimulado && /reabrirlo/.test(e.message),
  )
})

test('HU-005 CA-01: la primera respuesta visible completa FirstRespondedDateTime', () => {
  let [d, t] = nuevo()
  d = registrarInteraccion(d, t.id, { visible: false, canal: null, texto: 'Nota interna', adjuntos: [] }, GESTOR)
  assert.equal(d.tickets[0].primeraRespuesta, null, 'una nota interna no cuenta')
  d = registrarInteraccion(d, t.id, { visible: true, canal: 'WhatsApp', texto: 'Respuesta', adjuntos: [] }, GESTOR)
  assert.equal(d.tickets[0].primeraRespuesta?.getTime(), d.ahora.getTime())
})

test('HU-005 CA-02: la evidencia queda dentro de la interacción', () => {
  const [d0, t] = nuevo()
  const d = registrarInteraccion(d0, t.id, { visible: true, canal: 'WhatsApp', texto: 'Foto', adjuntos: [{ nombre: 'grieta.jpg', tamano: 1000, tipo: 'image/jpeg' }] }, GESTOR)
  assert.equal(d.interacciones.at(-1)?.adjuntos.length, 1)
})

test('HU-005 CA-04: DNI o tarjeta en una nota interna se rechaza (DLP)', () => {
  const [d, t] = nuevo()
  assert.ok(detectarPii('El cliente con DNI 45218877 llamó'))
  assert.ok(detectarPii('Pagó con la tarjeta 4111 1111 1111 1111'))
  assert.equal(detectarPii('Pagó la cuota 3 de 120 el 28/09'), null)
  rechaza(() => registrarInteraccion(d, t.id, { visible: false, canal: null, texto: 'DNI 45218877', adjuntos: [] }, GESTOR), 400, 'validacion')
})

test('HU-006: FirstResolved se conserva al reabrir; Resolved y Closed reflejan el último ciclo', () => {
  let [d, t] = nuevo()
  const r1 = new Date(2026, 9, 15, 12, 0)
  d = cambiarEstado(conAhora(d, r1), t.id, 'RESOLVED', GESTOR)
  d = cambiarEstado(conAhora(d, new Date(2026, 9, 15, 13, 0)), t.id, 'CLOSED', GESTOR)
  assert.ok(d.tickets[0].cierre)
  d = cambiarEstado(conAhora(d, new Date(2026, 9, 15, 14, 0)), t.id, 'REOPENED', GESTOR)
  const r2 = new Date(2026, 9, 15, 16, 0)
  d = cambiarEstado(conAhora(d, r2), t.id, 'RESOLVED', GESTOR)
  t = d.tickets[0]
  assert.equal(t.primeraResolucion?.getTime(), r1.getTime())
  assert.equal(t.ultimaResolucion?.getTime(), r2.getTime())
})

test('HU-007 CA-01 y CA-03: área sin persona deja el responsable vacío; el motivo es obligatorio', () => {
  const [d, t] = nuevo()
  rechaza(() => derivar(d, t.id, { area: 'COBRANZA', responsable: '', motivo: '', nota: '' }, GESTOR), 400, 'validacion')
  const d2 = derivar(d, t.id, { area: 'COBRANZA', responsable: '', motivo: 'DERIVACION_COMPETENCIA', nota: '' }, GESTOR)
  const t2 = d2.tickets[0]
  assert.equal(t2.area, 'COBRANZA')
  assert.equal(t2.responsable, null)
  const fila = d2.filasAsignacion.at(-1)
  assert.equal(fila?.deResponsable, GESTOR)
  assert.equal(fila?.aResponsable, null)
  assert.equal(fila?.motivo, 'DERIVACION_COMPETENCIA')
})

test('HU-008 CA-01 y CA-02: reasignación en bloque con fila REASSIGNMENT_CESE y resumen por destinatario', () => {
  const d = sembrar()
  const antes = d.filasAsignacion.length
  const [d2, resumen] = reasignarEnBloque(d, { de: 'p-rsalazar', destinatarios: ['p-mpaz', 'p-jccama'], motivo: 'REASSIGNMENT_CESE', nota: '' }, SUPERVISOR)
  assert.equal(resumen.total, 12)
  assert.deepEqual(resumen.porDestinatario.map((r) => r.tickets), [6, 6])
  assert.equal(d2.filasAsignacion.length, antes + 12)
  assert.ok(d2.filasAsignacion.slice(antes).every((f) => f.motivo === 'REASSIGNMENT_CESE'))
  assert.equal(pendientesDe(d2, 'p-rsalazar').length, 0)
})

test('HU-008 CA-03: quien no es supervisor no reasigna en bloque', () => {
  rechaza(() => reasignarEnBloque(sembrar(), { de: 'p-rsalazar', destinatarios: ['p-mpaz'], motivo: 'REASSIGNMENT_CESE', nota: '' }, 'p-mpaz'), 403)
})

test('HU-009 CA-03: un ticket sin persona se toma y queda constancia', () => {
  const d = sembrar()
  const libre = d.tickets.find((t) => t.area === 'COBRANZA' && !t.responsable)
  assert.ok(libre, 'la semilla trae tickets sin asignar en Cobranza')
  const d2 = tomar(d, libre.id, 'p-mpaz')
  assert.equal(d2.tickets.find((t) => t.id === libre.id)?.responsable, 'p-mpaz')
  assert.equal(d2.filasAsignacion.at(-1)?.motivo, 'TOMA_DE_BANDEJA')
  rechaza(() => tomar(d, libre.id, 'p-lccahuana'), 403)
})

test('HU-010 CA-01 y CA-03: una alerta por tipo y ciclo; nada si se resolvió a tiempo', () => {
  let [d, t] = nuevo()
  d = conAhora(d, sumarHorasHabiles(d.ahora, 100))
  let [d2, primera] = ejecutarJob(d)
  assert.equal(primera.nuevas, 2, 'FIRST_RESPONSE_OVERDUE y RESOLUTION_OVERDUE')
  const [d3, segunda] = ejecutarJob(d2)
  assert.equal(segunda.nuevas, 0)
  assert.equal(segunda.omitidas, 2)
  assert.equal(d3.alertas.length, 2)
  ;[d, t] = nuevo()
  d = cambiarEstado(d, t.id, 'RESOLVED', GESTOR)
  ;[d2, primera] = ejecutarJob(conAhora(d, sumarHorasHabiles(d.ahora, 100)))
  assert.equal(primera.nuevas, 0)
})

test('HU-010 CA-02: la alerta deja destinatario, fecha, canal, vencimiento evaluado y ciclo', () => {
  const [d] = nuevo()
  const [d2] = ejecutarJob(conAhora(d, sumarHorasHabiles(d.ahora, 100)))
  const a = d2.alertas[0]
  assert.ok(a.destinatario && a.fecha && a.canal && a.vencimientoEvaluado)
  assert.equal(a.ciclo, 0)
})

test('HU-011: reabrir calcula un compromiso nuevo, conserva el original y cuenta los ciclos', () => {
  let [d, t] = nuevo()
  for (let ciclo = 1; ciclo <= 2; ciclo++) {
    d = cambiarEstado(d, t.id, 'RESOLVED', GESTOR)
    d = cambiarEstado(d, t.id, 'CLOSED', GESTOR)
    d = conAhora(d, sumarHorasHabiles(d.ahora, 5))
    d = cambiarEstado(d, t.id, 'REOPENED', GESTOR)
  }
  const t2 = d.tickets[0]
  assert.equal(t2.reaperturas, 2)
  assert.equal(t2.venceResolucion.getTime(), t.venceResolucion.getTime())
  assert.ok(t2.venceReapertura && t2.venceReapertura > t.venceResolucion)
  const [d2] = ejecutarJob(conAhora(d, sumarHorasHabiles(d.ahora, 100)))
  assert.deepEqual(d2.alertas.map((a) => [a.tipo, a.ciclo]), [['RESOLUTION_OVERDUE', 2]])
})

test('HU-011 en la semilla: un ticket reabierto dos veces con una alerta por ciclo', () => {
  const d = sembrar()
  const t = d.tickets.find((x) => x.reaperturas === 2)
  assert.ok(t)
  const ciclos = d.alertas.filter((a) => a.ticketId === t.id).map((a) => a.ciclo)
  assert.deepEqual([...new Set(ciclos)].sort(), [0, 1])
})

test('HU-029: 72 h hábiles sin escalar marcan riesgo; escalado compara contra el plazo del eje', () => {
  const [d, t] = nuevo()
  const despues = sumarHorasHabiles(t.abierto, 72)
  assert.equal(cierreE2E(t, despues).nivel, 'en-riesgo')
  assert.equal(cierreE2E(t, sumarHorasHabiles(t.abierto, 71)).nivel, 'por-vencer')
  const escalado = cambiarEstado(d, t.id, 'ESCALATED', GESTOR).tickets[0]
  const e2e = cierreE2E(escalado, despues)
  assert.equal(e2e.escalado, true)
  assert.notEqual(e2e.limite, 72)
  assert.equal(e2e.nivel, 'por-vencer')
})
