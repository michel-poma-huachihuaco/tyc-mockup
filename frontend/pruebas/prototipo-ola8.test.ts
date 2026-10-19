import assert from 'node:assert/strict'
import { test } from 'node:test'
import { CLIENTES } from '../src/prototipo/datos/clientes.ts'
import { datosVacios } from '../src/prototipo/datos/semilla.ts'
import { registrarAsiento, responder } from '../src/prototipo/servicio/libro.ts'
import type { Documento } from '../src/prototipo/servicio/libro.ts'
import { ErrorSimulado, conAhora, crearTicket } from '../src/prototipo/servicio/nucleo.ts'
import type { Datos } from '../src/prototipo/servicio/nucleo.ts'
import { flujoDe } from '../src/prototipo/servicio/ola6.ts'
import { cambiarFuente, consultar360 } from '../src/prototipo/servicio/ola7.ts'
import {
  BUSES,
  CONVOCADOS,
  cancelarReserva,
  cartaDe,
  cuposLibres,
  escalarCartas,
  evaluarMorosidad,
  lotesMorosos,
  registrarAccion,
  registrarIngreso,
  registrarPago,
  reservarBus,
} from '../src/prototipo/servicio/ola8.ts'
import type { EntradaIngreso } from '../src/prototipo/servicio/ola8.ts'

/** Prototipo G2, ola 8 (HU-ATC-056 a 060). */

const GESTOR = 'p-crojas'
const COBRANZA = 'p-rsalazar'
const LEGAL = 'p-pvilchez'
const GARITA = 'p-ghuaman'
const CLIENTE = 'p-cliente'
const AHORA = new Date(2026, 9, 15, 11, 0)
const rechaza = (fn: () => unknown, status: number) => assert.throws(fn, (e: unknown) => e instanceof ErrorSimulado && e.status === status)
const PDF: Documento = { nombre: 'carta.pdf', tamano: 1000, sha256: 'a'.repeat(64) }
const base = () => datosVacios(AHORA)
const MOROSO = CLIENTES[1]

/** Un solo cliente moroso evaluado, para leer el caso sin ruido. */
const conCaso = (d: Datos = base()) => {
  const [s] = evaluarMorosidad(d)
  return s
}

test('HU-056 CA-01: la evaluación diaria abre el caso con ticket, flujo, alerta y carta, y no se repite', () => {
  const d = base()
  assert.ok(lotesMorosos(d).length > 0)
  assert.ok(lotesMorosos(d).every((m) => m.impagas >= 3))
  const [s, r] = evaluarMorosidad(d)
  assert.equal(r.nuevos, lotesMorosos(d).length)
  const caso = s.casosResolucion[0]
  const t = s.tickets.find((x) => x.id === caso.ticketId)
  assert.equal(t?.tipo, 'RES')
  assert.equal(t?.area, 'COBRANZA')
  assert.equal(caso.estado, 'ABIERTO')
  assert.equal(flujoDe(s, caso.ticketId)?.version, 1)
  assert.equal(s.constancias.filter((c) => c.casoId === caso.id).length, 3)
  assert.ok(cartaDe(s, caso.id))
  assert.equal(evaluarMorosidad(s)[1].nuevos, 0, 'idempotente por lote')
  assert.equal(evaluarMorosidad(cambiarFuente(d, 'COBRANZA', true))[1].nuevos, 0, 'sin datos de Cobranza no hay evaluación')
})

test('HU-056 CA-02: regularizar cierra el ticket, detiene el proceso y el lote vuelve a figurar al día', () => {
  const s = conCaso()
  const caso = s.casosResolucion[0]
  rechaza(() => registrarPago(s, caso.id, GESTOR), 403)
  const s2 = registrarPago(s, caso.id, COBRANZA)
  assert.equal(s2.casosResolucion[0].estado, 'REGULARIZADO')
  assert.equal(s2.tickets.find((t) => t.id === caso.ticketId)?.estado, 'CLOSED')
  assert.ok(!lotesMorosos(s2).some((m) => m.lote.id === caso.loteId))
  const e = consultar360(s2, caso.clienteId, GESTOR)[1].cuotas
  assert.ok(e.estado === 'ok' && e.datos.find((c) => c.loteId === caso.loteId)?.diasMora === 0)
  rechaza(() => registrarPago(s2, caso.id, COBRANZA), 409)
  assert.equal(cartaDe(escalarCartas(conAhora(s2, new Date(2026, 9, 30)))[0], caso.id)?.escalada, null, 'regularizado no escala')
})

test('HU-056 CA-03: con un reclamo abierto el caso queda suspendido y retoma al responderlo', () => {
  let d = base()
  let t
  ;[d, t] = crearTicket(d, { canal: 'Teléfono', clienteId: MOROSO.id, empresaId: 'AIN', linea: 'Lotes urbanos', establecimiento: '', tipo: 'REC', prioridad: 'MEDIUM', resumen: 'Reclamo', descripcion: 'Reclamo del cliente' }, GESTOR)
  let asiento
  ;[d, asiento] = registrarAsiento(d, t.id, { tipo: 'RECLAMO', establecimiento: 'Oficina Carabayllo', hechos: 'Cobro indebido', pedido: 'Devolución', monto: 500, moneda: 'PEN' }, GESTOR)
  const [s, r] = evaluarMorosidad(d)
  const casos = s.casosResolucion.filter((c) => c.clienteId === MOROSO.id)
  assert.ok(r.suspendidos >= 1 && casos.length >= 1)
  assert.ok(casos.every((c) => c.estado === 'SUSPENDIDO'))
  assert.equal(s.constancias.filter((c) => casos.some((x) => x.id === c.casoId)).length, 0, 'sin alertas mientras esté suspendido')
  assert.ok(casos.every((c) => !cartaDe(s, c.id)))
  const respondido = responder(s, asiento.id, { resumen: 'Respuesta', firmante: LEGAL, carta: PDF, cargo: PDF, derechoIndecopi: true }, LEGAL)
  const [s2, r2] = evaluarMorosidad(respondido)
  assert.equal(r2.reactivados, casos.length)
  assert.ok(s2.casosResolucion.filter((c) => c.clienteId === MOROSO.id).every((c) => c.estado === 'ABIERTO'))
  assert.ok(casos.every((c) => cartaDe(s2, c.id)), 'ahora sí sale la carta')
})

test('HU-057: la alerta sale por tres canales; si el correo rebota, WhatsApp y Mi Portal constan como reintento', () => {
  const s = conCaso()
  const por = (clienteId: string) => s.constancias.filter((c) => s.casosResolucion.find((x) => x.id === c.casoId)?.clienteId === clienteId)
  const normal = por(CLIENTES[5].id)
  assert.deepEqual(normal.map((c) => [c.canal, c.resultado, c.reintento]), [['Correo', 'ENTREGADO', false], ['WhatsApp', 'ENTREGADO', false], ['Mi Portal', 'ENTREGADO', false]])
  const rebota = por(CLIENTES[9].id)
  assert.equal(rebota[0].resultado, 'REBOTADO')
  assert.ok(rebota.slice(1).every((c) => c.reintento && c.resultado === 'ENTREGADO'))
  const sinCorreo = evaluarMorosidad(cambiarFuente(base(), 'CORREO', true))[0]
  assert.ok(sinCorreo.constancias.some((c) => c.canal === 'Correo' && c.resultado === 'NO_DISPONIBLE'))
  assert.ok(sinCorreo.constancias.every((c) => c.fecha.getTime() === AHORA.getTime()), 'cada intento con su hora')
})

test('HU-058 CA-01 y CA-03: la carta va al responsable con copia a su supervisor; sin responsable, al supervisor y se avisa', () => {
  const s = conCaso()
  const conResponsable = s.casosResolucion.find((c) => c.proyecto === 'Villa Sol II')
  const carta = conResponsable ? cartaDe(s, conResponsable.id) : null
  assert.equal(carta?.para, 'p-nquispe')
  assert.equal(carta?.cc, 'p-ctorres')
  assert.match(carta?.texto ?? '', /Deuda vencida/)
  const sin = s.casosResolucion.find((c) => c.proyecto === 'Los Álamos')
  assert.ok(sin, 'hay un caso en un proyecto sin responsable')
  const cartaSin = sin ? cartaDe(s, sin.id) : null
  assert.equal(cartaSin?.para, 'p-ctorres')
  assert.equal(cartaSin?.sinResponsable, true)
  assert.ok(s.notificaciones.some((n) => n.para === 'p-aperez' && /no tiene responsable/.test(n.mensaje)))
})

test('HU-058 CA-02: sin acción en el plazo se escala una sola vez; con acción no', () => {
  const s = conCaso()
  const [primero, segundo] = s.casosResolucion
  const s1 = registrarAccion(s, primero.id, 'Llamé al cliente', cartaDe(s, primero.id)?.para ?? '')
  const tarde = conAhora(s1, new Date(2026, 9, 20, 11))
  const [s2, n] = escalarCartas(tarde)
  assert.equal(n, s.casosResolucion.length - 1)
  assert.equal(cartaDe(s2, primero.id)?.escalada, null)
  assert.ok(cartaDe(s2, segundo.id)?.escalada)
  assert.ok(s2.notificaciones.some((x) => x.para === 'p-gnunez'))
  assert.equal(escalarCartas(s2)[1], 0, 'no se repite')
  assert.equal(escalarCartas(s)[1], 0, 'antes del plazo no escala')
  rechaza(() => registrarAccion(s, segundo.id, 'x', GESTOR), 403)
  assert.throws(() => registrarAccion(s, segundo.id, '', COBRANZA), (e: unknown) => e instanceof ErrorSimulado && e.status === 400)
})

const INGRESO: EntradaIngreso = { nombre: 'Pedro Visitante', dni: '12345678', telefono: '900111222', motivo: 'Visita comercial', destino: 'Villa Sol II', fecha: AHORA }

test('HU-059 CA-01: el formulario de 6 campos crea el ticket «Ingreso a proyecto» y avisa al responsable', () => {
  const [d, t] = registrarIngreso(base(), INGRESO, GARITA)
  assert.equal(t.tipo, 'ING')
  assert.equal(t.responsable, 'p-nquispe')
  assert.equal(t.area, 'ADMINISTRACION')
  assert.ok(d.notificaciones.some((n) => n.para === 'p-nquispe' && n.ticketId === t.id))
  assert.equal(d.interesados.length, 1, 'un visitante desconocido queda como interesado')
  assert.throws(() => registrarIngreso(base(), { ...INGRESO, nombre: '', dni: '1', motivo: '', fecha: null }, GARITA), (e: unknown) => e instanceof ErrorSimulado && e.campos.length >= 4)
  rechaza(() => registrarIngreso(base(), INGRESO, GESTOR), 403)
  assert.equal(registrarIngreso(base(), { ...INGRESO, destino: 'Los Álamos' }, GARITA)[1].responsable, 'p-ctorres', 'sin responsable, la supervisora comercial')
})

test('HU-059 CA-02: un DNI de cliente vincula el ticket a su ficha y a su lote', () => {
  const c = CLIENTES[3]
  const [d, t] = registrarIngreso(base(), { ...INGRESO, dni: c.dni, nombre: c.nombre, destino: 'Villa Sol II' }, GARITA)
  assert.equal(t.clienteId, c.id)
  assert.equal(d.interesados.length, 0)
  assert.match(t.descripcion, /Cliente reconocido/)
})

test('HU-060 CA-01: la reserva crea el ticket, descuenta el cupo y confirma por WhatsApp (o correo)', () => {
  const [d, r] = reservarBus(base(), { clienteId: CONVOCADOS[0], busId: 'B2', punto: 'Plaza Norte', acompanantes: 2, esperar: false }, CLIENTE)
  assert.equal(r.estado, 'CONFIRMADA')
  assert.equal(r.canal, 'WhatsApp')
  assert.equal(cuposLibres(d, 'B2'), 1)
  assert.equal(d.tickets.find((t) => t.id === r.ticketId)?.tipo, 'RSV')
  assert.ok(d.notificaciones.some((n) => n.para === `cliente:${CONVOCADOS[0]}` && /Reserva confirmada/.test(n.mensaje)))
  assert.equal(reservarBus(cambiarFuente(base(), 'WHATSAPP', true), { clienteId: CONVOCADOS[0], busId: 'B2', punto: 'Plaza Norte', acompanantes: 0, esperar: false }, CLIENTE)[1].canal, 'Correo')
  rechaza(() => reservarBus(d, { clienteId: CONVOCADOS[0], busId: 'B3', punto: 'Plaza Norte', acompanantes: 0, esperar: false }, CLIENTE), 409)
  rechaza(() => reservarBus(base(), { clienteId: CLIENTES[20].id, busId: 'B2', punto: 'Plaza Norte', acompanantes: 0, esperar: false }, CLIENTE), 403)
  assert.throws(() => reservarBus(base(), { clienteId: CONVOCADOS[0], busId: 'B2', punto: '', acompanantes: 9, esperar: false }, CLIENTE), (e: unknown) => e instanceof ErrorSimulado && e.campos.length === 2)
})

test('HU-060 CA-02 y CA-03: sin cupo se ofrece lista de espera y al cancelar se asigna al primero', () => {
  const quiere = (clienteId: string, esperar: boolean) => ({ clienteId, busId: 'B1', punto: 'Plaza Norte', acompanantes: 1, esperar })
  const [d1, a] = reservarBus(base(), quiere(CONVOCADOS[0], false), CLIENTE)
  assert.equal(cuposLibres(d1, 'B1'), 0)
  rechaza(() => reservarBus(d1, quiere(CONVOCADOS[1], false), CLIENTE), 409)
  assert.ok(BUSES.some((b) => b.id !== 'B1' && cuposLibres(d1, b.id) >= 2), 'hay otro bus con cupo')
  const [d2, espera] = reservarBus(d1, quiere(CONVOCADOS[1], true), CLIENTE)
  assert.equal(espera.estado, 'EN_ESPERA')
  assert.equal(cuposLibres(d2, 'B1'), 0, 'la lista de espera no descuenta cupo')
  const d3 = cancelarReserva(d2, a.id, CONVOCADOS[0], CLIENTE)
  assert.equal(d3.reservasBus.find((r) => r.id === espera.id)?.estado, 'CONFIRMADA')
  assert.equal(cuposLibres(d3, 'B1'), 0)
  assert.ok(d3.notificaciones.some((n) => n.para === `cliente:${CONVOCADOS[1]}` && /Reserva confirmada/.test(n.mensaje)))
  assert.equal(d3.tickets.find((t) => t.id === a.ticketId)?.estado, 'RESOLVED')
  rechaza(() => cancelarReserva(d3, a.id, CONVOCADOS[0], CLIENTE), 409)
})
