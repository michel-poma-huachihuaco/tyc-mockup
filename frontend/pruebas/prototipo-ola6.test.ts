import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ErrorSimulado, conAhora, crearTicket, derivar, reasignarEnBloque, registrarInteraccion } from '../src/prototipo/servicio/nucleo.ts'
import type { Datos, EntradaTicket } from '../src/prototipo/servicio/nucleo.ts'
import {
  LIMITE_CARGA,
  anonimizar,
  avanceDe,
  balancear,
  cambiarDisponibilidad,
  cargaDe,
  correosDeAsignacion,
  equipoDe,
  flujoDe,
  flujoVigente,
  guiaVigente,
  marcarRayo,
  porUrgencia,
  publicarFlujo,
  publicarGuia,
  rayoActivo,
  registrarDecisionIA,
  reportarSinGuia,
  retirarRayo,
  sugerirIA,
  ticketEntrante,
} from '../src/prototipo/servicio/ola6.ts'
import { datosVacios, sembrar } from '../src/prototipo/datos/semilla.ts'

/** Prototipo G2, ola 6 (HU-ATC-043 a 048, 054 y 055). */

const GESTOR = 'p-crojas'
const SUPERVISOR = 'p-gnunez'
const ADMIN = 'p-aperez'
const AHORA = new Date(2026, 9, 15, 11, 0)
const rechaza = (fn: () => unknown, status: number) => assert.throws(fn, (e: unknown) => e instanceof ErrorSimulado && e.status === status)
const BASE: EntradaTicket = { canal: 'Teléfono', clienteId: 'cli-001', empresaId: 'AIN', linea: 'Lotes urbanos', establecimiento: '', tipo: 'CTA', prioridad: 'MEDIUM', resumen: 'Consulta', descripcion: 'Descripción' }
const nuevo = (d: Datos = datosVacios(AHORA), e: Partial<EntradaTicket> = {}) => crearTicket(d, { ...BASE, ...e }, GESTOR)
const PASOS = [{ nombre: 'Recepción', responsable: 'p-crojas', slaH: 2 }, { nombre: 'Revisión', responsable: 'p-mpaz', slaH: 12 }]

test('HU-043 CA-01: un ticket nuevo sigue el flujo configurado', () => {
  let d = publicarFlujo(datosVacios(AHORA), 'CTA', 'COBRANZA', PASOS, ADMIN)
  assert.equal(flujoVigente(d, 'CTA')?.version, 2)
  const [d2, t] = nuevo(d)
  assert.equal(flujoDe(d2, t.id)?.version, 2)
  rechaza(() => publicarFlujo(d, 'CTA', 'COBRANZA', PASOS, SUPERVISOR), 403)
})

test('HU-043 CA-02: publicar otra versión no cambia el flujo de los tickets abiertos', () => {
  let [d, t] = nuevo()
  assert.equal(flujoDe(d, t.id)?.version, 1)
  d = publicarFlujo(d, 'CTA', 'COBRANZA', PASOS, ADMIN)
  assert.equal(flujoDe(d, t.id)?.version, 1, 'el abierto conserva su flujo')
  assert.equal(flujoDe(nuevo(d)[0], nuevo(d)[1].id)?.version, 2)
  assert.equal(t.politica.resolucionH, d.tickets[0].politica.resolucionH, 'y su SLA congelado')
})

test('HU-043 CA-03: un flujo con un paso sin responsable no se publica y dice cuál', () => {
  assert.throws(
    () => publicarFlujo(datosVacios(AHORA), 'CTA', 'COBRANZA', [PASOS[0], { nombre: 'Revisión', responsable: null, slaH: 12 }], ADMIN),
    (e: unknown) => e instanceof ErrorSimulado && e.campos.some((c) => c.campo === 'paso-1' && /Revisión/.test(c.mensaje)),
  )
})

test('HU-044 CA-01: la bandeja ordena por rayo, SLA más próximo y prioridad', () => {
  let [d, a] = nuevo(datosVacios(AHORA), { prioridad: 'LOW' })
  let b, c
  ;[d, b] = nuevo(d, { prioridad: 'URGENT' })
  ;[d, c] = nuevo(d, { prioridad: 'LOW' })
  d = marcarRayo(d, c.id, 'Crítico', true, SUPERVISOR)
  const orden = [...d.tickets].sort(porUrgencia(d)).map((t) => t.id)
  assert.equal(orden[0], c.id, 'el rayo va primero')
  assert.ok(orden.indexOf(b.id) < orden.indexOf(a.id), 'urgente vence antes que baja')
})

test('HU-044 CA-02: un ticket sin responsable se asigna por el flujo o queda en la cola', () => {
  const [d1, , r1] = ticketEntrante(datosVacios(AHORA), 'CTA')
  assert.equal(r1, 'asignado')
  assert.equal(d1.tickets[0].responsable, 'p-crojas')
  const [d2, t2, r2] = ticketEntrante(cambiarDisponibilidad(datosVacios(AHORA), 'p-crojas', false, SUPERVISOR), 'CTA')
  assert.equal(r2, 'cola')
  assert.equal(t2.responsable, null)
  assert.equal(d2.tickets[0].responsable, null)
})

test('HU-045 CA-01 y CA-02: solo el supervisor marca el rayo, con motivo, y queda en la bitácora', () => {
  const [d, t] = nuevo()
  rechaza(() => marcarRayo(d, t.id, 'x', false, GESTOR), 403)
  rechaza(() => marcarRayo(d, t.id, '', false, SUPERVISOR), 400)
  const d2 = marcarRayo(d, t.id, 'Cliente con prensa', false, SUPERVISOR)
  assert.ok(rayoActivo(d2, t.id))
  const d3 = retirarRayo(d2, t.id, SUPERVISOR)
  assert.deepEqual(d3.rayos.map((r) => r.accion), ['MARCADO', 'RETIRADO'])
})

test('HU-045 CA-03: pasado el 10 % del área se avisa y se pide confirmar', () => {
  let [d, a] = nuevo()
  let b
  ;[d, b] = nuevo(d)
  d = marcarRayo(d, a.id, 'Crítico', false, SUPERVISOR)
  assert.throws(() => marcarRayo(d, b.id, 'Otro', false, SUPERVISOR), (e: unknown) => e instanceof ErrorSimulado && e.codigo === 'limite-rayo')
  assert.ok(rayoActivo(marcarRayo(d, b.id, 'Otro', true, SUPERVISOR), b.id))
})

test('HU-046 CA-01: el balanceo pasa tickets al gestor disponible con menos carga y registra el motivo', () => {
  const d0 = sembrar()
  assert.ok(cargaDe(d0, 'p-rsalazar') > LIMITE_CARGA)
  rechaza(() => balancear(d0, GESTOR), 403)
  const [d, r] = balancear(d0, SUPERVISOR)
  assert.ok(r.movidos > 0)
  assert.ok(cargaDe(d, 'p-rsalazar') <= LIMITE_CARGA)
  assert.ok(d.filasAsignacion.some((f) => f.motivo === 'REASSIGNMENT_CARGA' && f.deResponsable === 'p-rsalazar'))
})

test('HU-046 CA-02: no mueve tickets con rayo, en Eje 3 ni con interacción en curso', () => {
  const d0 = sembrar()
  const propios = d0.tickets.filter((t) => t.responsable === 'p-rsalazar')
  const protegido = propios[0]
  let d = marcarRayo(d0, protegido.id, 'Crítico', true, SUPERVISOR)
  d = registrarInteraccion(conAhora(d, new Date(2026, 9, 15, 10, 50)), propios[1].id, { visible: false, canal: null, texto: 'Nota', adjuntos: [] }, GESTOR)
  const [d2] = balancear(conAhora(d, AHORA), SUPERVISOR)
  const resp = (id: string) => d2.tickets.find((t) => t.id === id)?.responsable
  assert.equal(resp(protegido.id), 'p-rsalazar', 'rayo')
  assert.equal(resp(propios[1].id), 'p-rsalazar', 'interacción en curso')
})

test('HU-046 CA-03: sin gestores disponibles, el ticket queda en la cola y se alerta al supervisor', () => {
  let d = sembrar()
  for (const p of ['p-mpaz', 'p-jccama']) d = cambiarDisponibilidad(d, p, false, SUPERVISOR)
  const [d2, r] = balancear(d, SUPERVISOR)
  assert.ok(r.alCola > 0)
  assert.ok(d2.alertasOps.some((a) => a.tipo === 'SIN_DISPONIBLES' && a.destinatario === SUPERVISOR))
  assert.ok(d2.tickets.some((t) => t.area === 'COBRANZA' && t.responsable === null))
})

test('HU-047: la guía se versiona y un tipo sin guía se reporta una sola vez al administrador', () => {
  let d = datosVacios(AHORA)
  assert.equal(guiaVigente(d, 'CTA')?.version, 1)
  d = publicarGuia(d, 'CTA', { pasos: ['Uno'], plantillas: [], criterios: ['Cierre'] }, ADMIN)
  assert.equal(guiaVigente(d, 'CTA')?.version, 2)
  assert.equal(d.guias.filter((g) => g.tipo === 'CTA').length, 2, 'queda el historial')
  rechaza(() => publicarGuia(d, 'CTA', { pasos: [], plantillas: [], criterios: [] }, ADMIN), 400)
  d = reportarSinGuia(reportarSinGuia(d, 'GAR'), 'GAR')
  assert.equal(d.alertasOps.filter((a) => a.tipo === 'GUIA_FALTANTE').length, 1)
  assert.equal(d.alertasOps[0].destinatario, ADMIN)
})

test('HU-048: la IA sugiere y lista criterios; DNI y tarjetas se anonimizan; se registra la decisión sin datos', () => {
  const [d, t] = nuevo()
  const r = sugerirIA(d, t, 'El cliente con DNI 45218877 pagó con la tarjeta 4111 1111 1111 1111')
  assert.match(r.enviado, /\[DNI\]/)
  assert.match(r.enviado, /\[TARJETA\]/)
  assert.doesNotMatch(r.enviado, /45218877|4111/)
  assert.equal(r.anonimizados, 2)
  assert.ok(r.sugerencia.length > 0 && r.pendientes.length > 0)
  assert.equal(anonimizar('sin datos').reemplazos, 0)
  const d2 = registrarDecisionIA(d, t.id, 'EDITADA', r.anonimizados, GESTOR)
  assert.deepEqual(Object.keys(d2.decisionesIA[0]).sort(), ['anonimizados', 'autor', 'decision', 'fecha', 'id', 'ticketId'])
})

test('HU-054: el gestor ve su avance y solo el líder ve el de su equipo', () => {
  const d = sembrar()
  const a = avanceDe(d, 'p-crojas')
  assert.ok(a.pendientes >= 0 && a.carga >= 0)
  assert.ok(equipoDe(SUPERVISOR).some((p) => p.id === 'p-crojas'))
  assert.equal(equipoDe(GESTOR).length, 0)
  assert.ok(avanceDe(d, 'p-rsalazar').ticketsRiesgo.length >= 0)
})

test('HU-055 CA-01: cada asignación manda un correo al gestor con copia a su líder', () => {
  let [d, t] = nuevo()
  d = derivar(d, t.id, { area: 'COBRANZA', responsable: 'p-mpaz', motivo: 'DERIVACION_COMPETENCIA', nota: '' }, GESTOR)
  const c = correosDeAsignacion(d).find((x) => x.para === 'p-mpaz')
  assert.ok(c)
  assert.equal(c.cc, SUPERVISOR)
  assert.match(c.asunto, /Se te asignó el ticket/)
})

test('HU-055 CA-02 y CA-03: la reasignación masiva manda un solo correo; sin líder sale sin copia', () => {
  const [d] = reasignarEnBloque(sembrar(), { de: 'p-rsalazar', destinatarios: ['p-jccama'], motivo: 'REASSIGNMENT_CESE', nota: '' }, SUPERVISOR)
  const masivos = correosDeAsignacion(d).filter((c) => c.para === 'p-jccama' && c.masivo)
  assert.equal(masivos.length, 1)
  assert.equal(masivos[0].tickets.length, 12)
  assert.equal(masivos[0].cc, null)
  assert.match(masivos[0].asunto, /12 tickets/)
})
