import assert from 'node:assert/strict'
import { test } from 'node:test'
import { sumarDiasHabiles } from '../src/prototipo/servicio/calendario.ts'
import { ErrorSimulado, conAhora, crearTicket } from '../src/prototipo/servicio/nucleo.ts'
import type { Datos, EntradaTicket } from '../src/prototipo/servicio/nucleo.ts'
import {
  cambiarEmpresaDeAsiento,
  cambiarEstadoApelacion,
  ejecutarControlesLegales,
  estadoPlazo,
  modificarVencimiento,
  prorrogar,
  registrarApelacion,
  registrarAsiento,
  responder,
} from '../src/prototipo/servicio/libro.ts'
import type { Documento, EntradaAsiento } from '../src/prototipo/servicio/libro.ts'
import { datosVacios, sembrar } from '../src/prototipo/datos/semilla.ts'

/**
 * Prototipo G2, ola 2 (HU-ATC-012 a 016): Libro de Reclamaciones y apelaciones. Cada
 * prueba nombra el criterio de aceptación que cubre.
 */

const GESTOR = 'p-crojas'
const LEGAL = 'p-pvilchez'
const INICIO = new Date(2026, 9, 15, 11, 0)
const PDF: Documento = { nombre: 'cargo.pdf', tamano: 1000, sha256: 'a'.repeat(64) }

const RECLAMO: EntradaTicket = {
  canal: 'Teléfono',
  clienteId: 'cli-001',
  empresaId: 'ALT',
  linea: 'Lotes urbanos',
  establecimiento: '',
  tipo: 'REC',
  prioridad: 'MEDIUM',
  resumen: 'Reclamo de prueba',
  descripcion: 'Descripción de prueba',
}
const ASIENTO: EntradaAsiento = { tipo: 'RECLAMO', establecimiento: 'Oficina Carabayllo', hechos: 'Hechos', pedido: 'Pedido', monto: null, moneda: '' }

function rechaza(fn: () => unknown, status: number, campo?: string) {
  assert.throws(fn, (e: unknown) => e instanceof ErrorSimulado && e.status === status && (!campo || e.campos.some((c) => c.campo === campo)))
}

/** Un ticket de reclamo con su asiento, registrado en `fecha`. */
function conAsiento(fecha = INICIO, entrada: Partial<EntradaAsiento> = {}, d0: Datos = datosVacios(fecha)): [Datos, string] {
  const [d1, t] = crearTicket(conAhora(d0, fecha), RECLAMO, GESTOR, fecha)
  const [d2, a] = registrarAsiento(d1, t.id, { ...ASIENTO, ...entrada }, GESTOR)
  return [d2, a.id]
}

test('HU-012 CA-01: cada establecimiento de la misma empresa lleva su correlativo', () => {
  let [d] = conAsiento()
  ;[d] = conAsiento(INICIO, {}, d)
  ;[d] = conAsiento(INICIO, { establecimiento: 'Oficina Central Lima' }, d)
  assert.deepEqual(d.asientos.map((a) => a.codigo), ['ALT-CAR-0042', 'ALT-CAR-0043', 'ALT-LIM-0001'])
})

test('HU-012 CA-02: monto sin moneda se rechaza; sin monto, los dos quedan vacíos', () => {
  const [d1, t] = crearTicket(datosVacios(), RECLAMO, GESTOR)
  rechaza(() => registrarAsiento(d1, t.id, { ...ASIENTO, monto: 500, moneda: '' }, GESTOR), 400, 'moneda')
  const [, a] = registrarAsiento(d1, t.id, { ...ASIENTO, monto: null, moneda: 'USD' }, GESTOR)
  assert.equal(a.monto, null)
  assert.equal(a.moneda, null)
})

test('HU-012 CA-03: la razón social del asiento no se cambia', () => {
  assert.throws(() => cambiarEmpresaDeAsiento('as-1'), (e: unknown) => e instanceof ErrorSimulado && e.status === 409 && e.auditar)
})

test('HU-012: un ticket tiene un solo asiento (1:1)', () => {
  const [d] = conAsiento()
  rechaza(() => registrarAsiento(d, d.tickets[0].id, ASIENTO, GESTOR), 409)
})

test('HU-013: el plazo legal es de 15 días hábiles desde el registro', () => {
  const [d] = conAsiento()
  assert.equal(d.asientos[0].venceOriginal.getTime(), sumarDiasHabiles(INICIO, 15).getTime())
  // jue 15-oct + 15 días hábiles = jue 5-nov (1-nov es domingo y feriado).
  assert.equal(d.asientos[0].venceOriginal.toDateString(), new Date(2026, 10, 5).toDateString())
})

test('HU-013 CA-01: la prórroga exige justificación, canal, cargo y comunicación previa al vencimiento', () => {
  const [d, id] = conAsiento()
  rechaza(() => prorrogar(d, id, { justificacion: '', canal: '', fechaComunicacion: null, cargo: null }, LEGAL), 400)
  const tarde = new Date(d.asientos[0].venceOriginal.getTime() + 86_400_000)
  rechaza(() => prorrogar(d, id, { justificacion: 'J', canal: 'Correo', fechaComunicacion: tarde, cargo: PDF }, LEGAL), 400, 'fecha')
  const d2 = prorrogar(d, id, { justificacion: 'J', canal: 'Correo', fechaComunicacion: INICIO, cargo: PDF }, LEGAL)
  const a = d2.asientos[0]
  assert.equal(a.venceProrrogado?.getTime(), sumarDiasHabiles(a.venceOriginal, 15).getTime())
  assert.equal(d2.filasPlazo.length, 2, 'la prórroga es una fila nueva del historial')
})

test('HU-013 CA-02: el vencimiento no se reescribe', () => {
  assert.throws(() => modificarVencimiento('as-1'), (e: unknown) => e instanceof ErrorSimulado && e.status === 409 && e.auditar)
})

test('HU-013 CA-03: no hay segunda prórroga', () => {
  const [d, id] = conAsiento()
  const d2 = prorrogar(d, id, { justificacion: 'J', canal: 'Correo', fechaComunicacion: INICIO, cargo: PDF }, LEGAL)
  rechaza(() => prorrogar(d2, id, { justificacion: 'J', canal: 'Correo', fechaComunicacion: INICIO, cargo: PDF }, LEGAL), 409)
})

test('HU-013 CA-04: con el plazo original vencido no se prorroga', () => {
  const [d, id] = conAsiento()
  const despues = conAhora(d, new Date(d.asientos[0].venceOriginal.getTime() + 60_000))
  assert.throws(
    () => prorrogar(despues, id, { justificacion: 'J', canal: 'Correo', fechaComunicacion: INICIO, cargo: PDF }, LEGAL),
    (e: unknown) => e instanceof ErrorSimulado && /antes del vencimiento/.test(e.message),
  )
})

test('HU-013: solo la responsable legal prorroga', () => {
  const [d, id] = conAsiento()
  rechaza(() => prorrogar(d, id, { justificacion: 'J', canal: 'Correo', fechaComunicacion: INICIO, cargo: PDF }, GESTOR), 403)
})

test('HU-014 CA-01 y CA-02: la respuesta guarda fecha, carta con cargo, firmante y constancia INDECOPI', () => {
  const [d, id] = conAsiento()
  const d2 = responder(conAhora(d, new Date(2026, 9, 20, 10)), id, { resumen: 'R', firmante: LEGAL, carta: PDF, cargo: PDF, derechoIndecopi: true }, LEGAL)
  const r = d2.asientos[0].respuesta
  assert.ok(r)
  assert.equal(r.firmante, LEGAL)
  assert.equal(r.derechoIndecopi, true)
  assert.equal(r.diasHabilesUsados, 3)
  assert.equal(estadoPlazo(d2.asientos[0], d2.ahora).nivel, 'respondido')
})

test('HU-014 CA-03: sin cargo no es una respuesta válida', () => {
  const [d, id] = conAsiento()
  rechaza(() => responder(d, id, { resumen: 'R', firmante: LEGAL, carta: PDF, cargo: null, derechoIndecopi: true }, LEGAL), 400, 'cargo')
})

test('HU-015 CA-01: a 3 días hábiles sin prórroga, alerta de cierre de ventana', () => {
  const [d] = conAsiento()
  const vence = d.asientos[0].venceOriginal
  const [, antes] = ejecutarControlesLegales(conAhora(d, new Date(2026, 9, 28, 10)))
  assert.equal(antes.alertasNuevas, 0, 'a 6 días hábiles no alerta')
  const [d2, cerca] = ejecutarControlesLegales(conAhora(d, new Date(2026, 10, 2, 10)))
  assert.equal(cerca.alertasNuevas, 1)
  assert.equal(d2.alertasLegales[0].tipo, 'LEGAL_EXTENSION_WINDOW_CLOSING')
  assert.equal(d2.alertasLegales[0].vencimientoEvaluado.getTime(), vence.getTime())
  const [, otra] = ejecutarControlesLegales(d2)
  assert.equal(otra.alertasNuevas, 0, 'una sola vez')
})

test('HU-015 CA-02: reclamo activo sin asiento al cierre del día es huérfano', () => {
  const [d, t] = crearTicket(datosVacios(new Date(2026, 9, 14, 15)), RECLAMO, GESTOR)
  const [, hoy] = ejecutarControlesLegales(d)
  assert.equal(hoy.huerfanosNuevos, 0, 'abierto hoy: aún tiene el día')
  const [d2, manana] = ejecutarControlesLegales(conAhora(d, new Date(2026, 9, 15, 9)))
  assert.equal(manana.huerfanosNuevos, 1)
  assert.equal(d2.excepciones[0].ticketId, t.id)
  assert.equal(d2.excepciones[0].tipo, 'ORPHAN_REFERENCE')
})

test('HU-015 CA-03: con prórroga se evalúa el vencimiento prorrogado', () => {
  const [d, id] = conAsiento()
  const d2 = prorrogar(d, id, { justificacion: 'J', canal: 'Correo', fechaComunicacion: INICIO, cargo: PDF }, LEGAL)
  const a = d2.asientos[0]
  const [, entre] = ejecutarControlesLegales(conAhora(d2, new Date(a.venceOriginal.getTime() + 86_400_000)))
  assert.equal(entre.alertasNuevas, 0, 'pasado el original pero dentro del prorrogado: sin alerta')
  const [d3, tarde] = ejecutarControlesLegales(conAhora(d2, new Date((a.venceProrrogado as Date).getTime() + 60_000)))
  assert.equal(tarde.alertasNuevas, 1)
  assert.equal(d3.alertasLegales[0].vencimientoEvaluado.getTime(), a.venceProrrogado?.getTime())
})

function respondido(): [Datos, string] {
  const [d, id] = conAsiento()
  return [responder(d, id, { resumen: 'R', firmante: LEGAL, carta: PDF, cargo: PDF, derechoIndecopi: true }, LEGAL), id]
}

test('HU-016 CA-01: la resolución de INDECOPI exige expediente, fecha y resumen', () => {
  let [d, id] = respondido()
  d = registrarApelacion(d, id, { instancia: 'INDECOPI', numeroCaso: '0001-2026/ILN', presentada: INICIO }, LEGAL)
  const ap = d.apelaciones[0].id
  d = cambiarEstadoApelacion(d, ap, 'UNDER_REVIEW', { numeroCaso: '', fechaResolucion: null, resumen: '', nota: '' }, LEGAL)
  rechaza(() => cambiarEstadoApelacion(d, ap, 'RESOLVED_UNFOUNDED', { numeroCaso: '', fechaResolucion: null, resumen: '', nota: '' }, LEGAL), 400)
  d = cambiarEstadoApelacion(d, ap, 'RESOLVED_UNFOUNDED', { numeroCaso: '', fechaResolucion: INICIO, resumen: 'Infundada', nota: '' }, LEGAL)
  assert.equal(d.apelaciones[0].numeroCaso, '0001-2026/ILN')
  assert.equal(d.apelaciones[0].resolucion?.resumen, 'Infundada')
})

test('HU-016: ante INDECOPI el expediente es obligatorio al registrar', () => {
  const [d, id] = respondido()
  rechaza(() => registrarApelacion(d, id, { instancia: 'INDECOPI', numeroCaso: '', presentada: INICIO }, LEGAL), 400, 'caso')
})

test('HU-016 CA-02: cada estado de la apelación queda con fecha y autor', () => {
  let [d, id] = respondido()
  d = registrarApelacion(d, id, { instancia: 'INTERNA', numeroCaso: '', presentada: INICIO }, LEGAL)
  d = cambiarEstadoApelacion(d, d.apelaciones[0].id, 'UNDER_REVIEW', { numeroCaso: '', fechaResolucion: null, resumen: '', nota: '' }, LEGAL)
  assert.deepEqual(d.filasApelacion.map((f) => [f.de, f.a, f.autor]), [[null, 'PENDING', LEGAL], ['PENDING', 'UNDER_REVIEW', LEGAL]])
})

test('HU-016 CA-03: tras desistir, la misma respuesta no se vuelve a apelar', () => {
  let [d, id] = respondido()
  d = registrarApelacion(d, id, { instancia: 'INTERNA', numeroCaso: '', presentada: INICIO }, LEGAL)
  d = cambiarEstadoApelacion(d, d.apelaciones[0].id, 'WITHDRAWN', { numeroCaso: '', fechaResolucion: null, resumen: '', nota: '' }, LEGAL)
  rechaza(() => registrarApelacion(d, id, { instancia: 'INDECOPI', numeroCaso: 'X', presentada: INICIO }, LEGAL), 409)
})

test('HU-016: tras INDECOPI no hay otra apelación; tras la interna, solo INDECOPI', () => {
  let [d, id] = respondido()
  d = registrarApelacion(d, id, { instancia: 'INTERNA', numeroCaso: '', presentada: INICIO }, LEGAL)
  const interna = d.apelaciones[0].id
  d = cambiarEstadoApelacion(d, interna, 'UNDER_REVIEW', { numeroCaso: '', fechaResolucion: null, resumen: '', nota: '' }, LEGAL)
  d = cambiarEstadoApelacion(d, interna, 'RESOLVED_UNFOUNDED', { numeroCaso: '', fechaResolucion: INICIO, resumen: 'Infundada', nota: '' }, LEGAL)
  rechaza(() => registrarApelacion(d, id, { instancia: 'INTERNA', numeroCaso: '', presentada: INICIO }, LEGAL), 400, 'instancia')
  d = registrarApelacion(d, id, { instancia: 'INDECOPI', numeroCaso: 'X-1', presentada: INICIO }, LEGAL)
  const ante = d.apelaciones[1].id
  d = cambiarEstadoApelacion(d, ante, 'UNDER_REVIEW', { numeroCaso: '', fechaResolucion: null, resumen: '', nota: '' }, LEGAL)
  d = cambiarEstadoApelacion(d, ante, 'RESOLVED_FOUNDED', { numeroCaso: '', fechaResolucion: INICIO, resumen: 'Fundada', nota: '' }, LEGAL)
  rechaza(() => registrarApelacion(d, id, { instancia: 'INDECOPI', numeroCaso: 'X-2', presentada: INICIO }, LEGAL), 409)
})

test('HU-016: sin respuesta no hay apelación', () => {
  const [d, id] = conAsiento()
  rechaza(() => registrarApelacion(d, id, { instancia: 'INTERNA', numeroCaso: '', presentada: INICIO }, LEGAL), 409)
})

test('Semilla de la ola 2: un caso para cada criterio', () => {
  const d = sembrar()
  const niveles = d.asientos.map((a) => estadoPlazo(a, d.ahora).nivel)
  assert.ok(niveles.includes('vencido') && niveles.includes('por-vencer') && niveles.includes('respondido'))
  assert.ok(d.asientos.some((a) => a.prorroga))
  assert.ok(d.alertasLegales.some((a) => a.tipo === 'LEGAL_RESPONSE_OVERDUE'))
  assert.equal(d.excepciones.length, 1)
  assert.deepEqual(d.apelaciones.map((a) => a.estado).sort(), ['UNDER_REVIEW', 'WITHDRAWN'])
})
