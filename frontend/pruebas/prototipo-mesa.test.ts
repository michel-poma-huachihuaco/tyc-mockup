import assert from 'node:assert/strict'
import { test } from 'node:test'
import { sumarDiasHabiles } from '../src/prototipo/servicio/calendario.ts'
import { ErrorSimulado, cambiarEstado, conAhora, crearTicket, derivar, registrarInteraccion } from '../src/prototipo/servicio/nucleo.ts'
import type { Datos, EntradaTicket } from '../src/prototipo/servicio/nucleo.ts'
import { confirmarHandoff, controlarHandoffs, enviarHandoff, marcarSenales, palabrasDeJuicio, registrarNotaEmocional, retirarSenal, senalesActivas } from '../src/prototipo/servicio/conflicto.ts'
import type { ElementosHandoff } from '../src/prototipo/servicio/conflicto.ts'
import {
  activar,
  agregarEvidencia,
  cerrarCaso,
  clasificarRiesgo,
  controlarEscalamiento,
  emitirCargoPrevio,
  enLimbo,
  evidenciasDelHilo,
  reclasificar,
  registrarCaso,
} from '../src/prototipo/servicio/mesa.ts'
import { datosVacios, sembrar } from '../src/prototipo/datos/semilla.ts'

/** Prototipo G2, ola 3 (HU-ATC-020 a 028): gate a Eje 3 y Mesa de Casos SGD. */

const GESTOR = 'p-crojas'
const SUPERVISOR = 'p-gnunez'
const LEGAL = 'p-pvilchez'
const MESA = 'p-vortiz'
const INICIO = new Date(2026, 9, 15, 11, 0)
const PDF = { nombre: 'evidencia.pdf', tamano: 1000, sha256: 'b'.repeat(64) }

const TICKET: EntradaTicket = {
  canal: 'Teléfono',
  clienteId: 'cli-001',
  empresaId: 'AIN',
  linea: 'Lotes urbanos',
  establecimiento: '',
  tipo: 'GAR',
  prioridad: 'MEDIUM',
  resumen: 'Ticket de prueba',
  descripcion: 'Descripción',
}
const PAQUETE: ElementosHandoff = { id: 'ID', kyc: 'Validado', lote: 'Mz. A Lt. 1', pagos: 'Al día', atencion: 'Atención previa', paso: 'Próximo paso' }

function rechaza(fn: () => unknown, status: number, campo?: string) {
  assert.throws(fn, (e: unknown) => e instanceof ErrorSimulado && e.status === status && (!campo || e.campos.some((c) => c.campo === campo)))
}

/** Un ticket en Eje 2 (derivado a Postventa) y en atención. */
function enEje2(): [Datos, string] {
  let [d, t] = crearTicket(datosVacios(INICIO), TICKET, GESTOR)
  d = registrarInteraccion(d, t.id, { visible: true, canal: 'Teléfono', texto: 'Hola', adjuntos: [] }, GESTOR)
  d = derivar(d, t.id, { area: 'POSTVENTA', responsable: 'p-lccahuana', motivo: 'DERIVACION_COMPETENCIA', nota: '' }, GESTOR)
  return [d, t.id]
}

// ── HU-026: gate de conflicto ──

test('HU-026 CA-01 y CA-02: con señal de conflicto en Eje 2 no se resuelve ni se deriva fuera de Eje 3', () => {
  let [d, id] = enEje2()
  d = marcarSenales(d, id, ['CARTA_NOTARIAL'], 'p-lccahuana')
  assert.deepEqual(senalesActivas(d, id), ['CARTA_NOTARIAL'])
  assert.throws(() => cambiarEstado(d, id, 'RESOLVED', 'p-lccahuana'), (e: unknown) => e instanceof ErrorSimulado && e.codigo === 'gate-conflicto' && e.auditar)
  rechaza(() => derivar(d, id, { area: 'COBRANZA', responsable: '', motivo: 'DERIVACION_COMPETENCIA', nota: '' }, 'p-lccahuana'), 409)
})

test('HU-026 CA-03: el supervisor retira una señal por error y queda en el historial', () => {
  let [d, id] = enEje2()
  d = marcarSenales(d, id, ['PRENSA'], GESTOR)
  rechaza(() => retirarSenal(d, id, 'PRENSA', 'Error', GESTOR), 403)
  rechaza(() => retirarSenal(d, id, 'PRENSA', '', SUPERVISOR), 400, 'justificacion')
  d = retirarSenal(d, id, 'PRENSA', 'No hubo contacto de prensa.', SUPERVISOR)
  assert.deepEqual(senalesActivas(d, id), [])
  assert.deepEqual(d.senales.map((s) => s.accion), ['MARCADA', 'RETIRADA'])
  assert.doesNotThrow(() => cambiarEstado(d, id, 'RESOLVED', GESTOR))
})

// ── HU-027: handoff ──

test('HU-027 CA-01: los 6 elementos son obligatorios antes de enviar', () => {
  const [d, id] = enEje2()
  assert.throws(
    () => enviarHandoff(d, id, { ...PAQUETE, kyc: '', paso: '' }, GESTOR),
    (e: unknown) => e instanceof ErrorSimulado && e.campos.map((c) => c.campo).sort().join() === 'kyc,paso',
  )
})

test('HU-027 y RN-SVC-024: un conflicto no se deriva sin nota de estado emocional', () => {
  let [d, id] = enEje2()
  d = marcarSenales(d, id, ['ABOGADO'], GESTOR)
  rechaza(() => enviarHandoff(d, id, PAQUETE, GESTOR), 400, 'emocional')
  d = registrarNotaEmocional(d, id, 'Pide hablar con un responsable; repite que su abogado enviará una carta.', GESTOR)
  d = enviarHandoff(d, id, PAQUETE, GESTOR)
  const t = d.tickets[0]
  assert.equal(t.eje, 3)
  assert.equal(t.area, 'LEGAL')
  assert.equal(d.filasAsignacion.at(-1)?.motivo, 'DERIVACION_CONFLICTO_EJE3')
  assert.doesNotThrow(() => cambiarEstado(d, id, 'RESOLVED', LEGAL), 'en Eje 3 el gate ya no bloquea')
})

test('HU-027 CA-02: el Eje 3 confirma la recepción en el mismo ticket', () => {
  let [d, id] = enEje2()
  d = enviarHandoff(d, id, PAQUETE, GESTOR)
  rechaza(() => confirmarHandoff(d, id, GESTOR), 403)
  d = confirmarHandoff(d, id, LEGAL)
  assert.ok(d.handoffs[0].confirmado)
  rechaza(() => confirmarHandoff(d, id, LEGAL), 409)
})

test('HU-027 CA-03: sin confirmar tras 1 día hábil se avisa a la jefatura del eje destino, una vez', () => {
  let [d, id] = enEje2()
  d = enviarHandoff(d, id, PAQUETE, GESTOR)
  const [, antes] = controlarHandoffs(conAhora(d, new Date(2026, 9, 15, 17)))
  assert.equal(antes.avisos, 0)
  const [d2, despues] = controlarHandoffs(conAhora(d, new Date(2026, 9, 16, 10)))
  assert.equal(despues.avisos, 1)
  assert.equal(d2.avisos.at(-1)?.destinatario, 'p-rcastillo')
  assert.equal(controlarHandoffs(d2)[1].avisos, 0)
})

// ── HU-028: nota de estado emocional ──

test('HU-028 CA-01 y CA-03: la nota describe lo observado; las palabras de juicio se rechazan', () => {
  const [d, id] = enEje2()
  assert.deepEqual(palabrasDeJuicio('El cliente estaba GROSERO y conflictivo'), ['grosero', 'conflictivo'])
  rechaza(() => registrarNotaEmocional(d, id, 'Cliente grosero', GESTOR), 400, 'texto')
  const d2 = registrarNotaEmocional(d, id, 'Levantó la voz dos veces y pidió hablar con un responsable.', GESTOR)
  assert.equal(d2.notasEmocionales.length, 1)
})

test('HU-028 CA-02: al derivar un conflicto a Eje 3 se avisa al Director UX', () => {
  let [d, id] = enEje2()
  d = marcarSenales(d, id, ['PRENSA'], GESTOR)
  d = registrarNotaEmocional(d, id, 'Dice que publicará el caso en redes.', GESTOR)
  d = enviarHandoff(d, id, PAQUETE, GESTOR)
  assert.equal(d.avisos.at(-1)?.tipo, 'VOCERIA_DIRECTOR_UX')
  assert.equal(d.avisos.at(-1)?.destinatario, 'p-lbenavides')
})

// ── HU-020 a 025: Mesa SGD ──

const caso = (d: Datos, clienteId = 'cli-030', linea: 'INDECOPI' | 'LEGAL_ATIENDE' = 'INDECOPI') => registrarCaso(d, { linea, clienteId, ticketId: '', resumen: 'Hechos' }, MESA)

test('HU-020 CA-01: Código Único que nunca se reutiliza', () => {
  let d = datosVacios(INICIO)
  const codigos: string[] = []
  for (const cli of ['cli-030', 'cli-031', 'cli-032']) {
    const [d2, c] = caso(d, cli)
    d = d2
    codigos.push(c.codigo)
  }
  assert.deepEqual(codigos, ['SGD-2026-000318', 'SGD-2026-000319', 'SGD-2026-000320'])
  rechaza(() => caso(d, 'cli-030'), 409)
  rechaza(() => registrarCaso(d, { linea: 'INDECOPI', clienteId: 'cli-033', ticketId: '', resumen: 'x' }, GESTOR), 403)
})

test('HU-020 CA-02: Legal Atiende se reclasifica a reclamo formal conservando el origen', () => {
  let [d, c] = caso(datosVacios(INICIO), 'cli-030', 'LEGAL_ATIENDE')
  let nuevo
  ;[d, nuevo] = reclasificar(d, c.id, 'No se resolvió en la vía preventiva.', MESA)
  assert.equal(nuevo.linea, 'LIBRO')
  assert.equal(nuevo.origenId, c.id)
  assert.notEqual(nuevo.codigo, c.codigo)
  assert.equal(d.casos.find((x) => x.id === c.id)?.estado, 'RECLASIFICADO')
})

test('HU-021: el SLA de línea arranca con la activación, no con el cargo previo; limbo tras 2 días hábiles', () => {
  let [d, c] = caso(datosVacios(INICIO))
  d = emitirCargoPrevio(d, c.id, MESA)
  assert.equal(d.casos[0].venceSla, null, 'CA-01')
  assert.equal(enLimbo(conAhora(d, new Date(2026, 9, 19, 10))).length, 0)
  assert.equal(enLimbo(conAhora(d, new Date(2026, 9, 20, 10))).length, 1, 'CA-03')
  const activacion = new Date(2026, 9, 16, 10)
  d = activar(conAhora(d, activacion), c.id, MESA)
  assert.equal(d.casos[0].venceSla?.getTime(), sumarDiasHabiles(activacion, 10).getTime(), 'CA-02')
})

function activo(cli = 'cli-030'): [Datos, string] {
  let [d, c] = caso(datosVacios(INICIO), cli)
  d = activar(emitirCargoPrevio(d, c.id, MESA), c.id, MESA)
  return [d, c.id]
}

test('HU-022: el nivel sale de la matriz; recalibrar deja quién, cuándo y por qué', () => {
  let [d, id] = activo()
  d = clasificarRiesgo(d, id, ['ABOGADO'], '', MESA)
  assert.equal(d.casos[0].riesgo?.nivel, 'MEDIO')
  rechaza(() => clasificarRiesgo(d, id, ['ABOGADO', 'AUTORIDAD'], '', MESA), 400, 'motivo')
  d = clasificarRiesgo(d, id, ['ABOGADO', 'AUTORIDAD'], 'INDECOPI notificó un procedimiento.', MESA)
  assert.equal(d.casos[0].riesgo?.puntaje, 55)
  assert.equal(d.casos[0].riesgo?.nivel, 'ALTO')
  assert.deepEqual(d.filasRiesgo.map((f) => [f.autor, f.motivo]), [[MESA, 'Clasificación inicial'], [MESA, 'INDECOPI notificó un procedimiento.']])
})

test('HU-023: escala en cadena sin saltar niveles y se detiene al cerrar', () => {
  const [d, id] = activo()
  const vence = d.casos[0].venceSla as Date
  assert.equal(vence.toDateString(), new Date(2026, 9, 29).toDateString(), 'jue 15 + 10 días hábiles')
  let [d2, r] = controlarEscalamiento(conAhora(d, new Date(2026, 9, 23, 10)))
  assert.equal(r.escalamientos, 0, 'a 4 días hábiles todavía no')
  ;[d2, r] = controlarEscalamiento(conAhora(d2, new Date(2026, 9, 27, 10)))
  assert.equal(d2.casos[0].nivelEscalamiento, 1, 'CA-01 alerta temprana a 2 días hábiles')
  ;[d2] = controlarEscalamiento(conAhora(d2, sumarDiasHabiles(vence, 3)))
  assert.deepEqual(d2.escalamientos.map((e) => e.nivel), [1, 2, 3, 4], 'CA-02 sin saltos')
  d2 = cerrarCaso(d2, id, { estado: 'CON_CONTINGENCIA', evidencia: PDF, critico: false, gli: '', nota: '' }, MESA)
  ;[d2, r] = controlarEscalamiento(conAhora(d2, sumarDiasHabiles(vence, 10)))
  assert.equal(r.escalamientos, 0, 'CA-03 la cadena se detiene')
  assert.equal(d2.escalamientos.length, 4, 'CA-03 queda el historial')
})

test('HU-024: un caso que coincide se vincula y comparte el hilo de evidencia', () => {
  let [d, principal] = activo('cli-030')
  rechaza(() => caso(d, 'cli-030'), 409)
  let vinculado
  ;[d, vinculado] = registrarCaso(d, { linea: 'INDECOPI', clienteId: 'cli-030', ticketId: '', resumen: 'Mismos hechos', vincularA: principal }, MESA)
  assert.equal(vinculado.estado, 'VINCULADO')
  d = agregarEvidencia(d, vinculado.id, { descripcion: 'Carta', documento: PDF, gli: '' }, MESA)
  const hilo = evidenciasDelHilo(d, d.casos.find((c) => c.id === principal)!)
  assert.equal(hilo.length, 2, 'CA-02 hilo único')
  rechaza(() => registrarCaso(d, { linea: 'INDECOPI', clienteId: 'cli-030', ticketId: '', resumen: 'x', justificacionIndependiente: '' }, MESA), 400, 'justificacion')
})

test('HU-025: cierre en uno de los 8 estados, sin evidencia no hay cierre; original crítico con referencia al GLI', () => {
  const [d, id] = activo()
  rechaza(() => cerrarCaso(d, id, { estado: '', evidencia: null, critico: false, gli: '', nota: '' }, MESA), 400)
  rechaza(() => cerrarCaso(d, id, { estado: 'CONFORME', evidencia: PDF, critico: true, gli: '', nota: '' }, MESA), 400, 'gli')
  const d2 = cerrarCaso(d, id, { estado: 'CONFORME', evidencia: PDF, critico: true, gli: 'GLI-2026-000123', nota: '' }, MESA)
  assert.equal(d2.casos[0].estado, 'CERRADO')
  assert.equal(d2.casos[0].cierre?.gli, 'GLI-2026-000123')
})

test('Semilla de la ola 3: un caso para cada criterio', () => {
  const d = sembrar()
  assert.equal(enLimbo(d).length, 1)
  assert.ok(d.casos.some((c) => c.nivelEscalamiento === 4))
  assert.ok(d.casos.some((c) => c.estado === 'VINCULADO'))
  assert.ok(d.casos.some((c) => c.estado === 'CERRADO'))
  assert.ok(d.handoffs.some((h) => !h.confirmado))
  assert.ok(d.tickets.some((t) => t.eje === 2 && senalesActivas(d, t.id).length))
})
