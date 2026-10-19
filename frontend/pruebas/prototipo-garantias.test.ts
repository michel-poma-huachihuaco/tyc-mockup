import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ErrorSimulado } from '../src/prototipo/servicio/nucleo.ts'
import type { Datos } from '../src/prototipo/servicio/nucleo.ts'
import { garantiaDe, programarInspeccion, registrarAdenda, registrarGarantia, registrarInspeccion, resolverGarantia } from '../src/prototipo/servicio/garantias.ts'
import type { EntradaGarantia } from '../src/prototipo/servicio/garantias.ts'
import { datosVacios, sembrar } from '../src/prototipo/datos/semilla.ts'

/** Prototipo G2, ola 4 (HU-ATC-033 a 036): garantías postventa. */

const POSTVENTA = 'p-lccahuana'
const AHORA = new Date(2026, 9, 15, 11, 0)
const PDF = { nombre: 'foto.jpg', tamano: 100, sha256: 'c'.repeat(64) }
const ENTRADA: EntradaGarantia = { entregaId: 'ACT-0412', tipo: 'IMPERMEABILIZACION', descripcion: 'Filtración', ticketId: '', reclamada: new Date(2026, 9, 10) }

function rechaza(fn: () => unknown, status: number, campo?: string) {
  assert.throws(fn, (e: unknown) => e instanceof ErrorSimulado && e.status === status && (!campo || e.campos.some((c) => c.campo === campo)))
}
const nuevo = (e: Partial<EntradaGarantia> = {}, d: Datos = datosVacios(AHORA)) => registrarGarantia(d, { ...ENTRADA, ...e }, POSTVENTA)

test('HU-033 CA-01: sin Acta de Entrega no hay reclamo', () => {
  rechaza(() => nuevo({ entregaId: '' }), 400, 'entrega')
  rechaza(() => nuevo({ entregaId: 'ACT-9999' }), 400, 'entrega')
  const [d, g] = nuevo()
  assert.equal(d.garantias.length, 1)
  assert.equal(g.entregaId, 'ACT-0412')
})

test('HU-033 CA-02: el tipo es del catálogo cerrado', () => {
  rechaza(() => nuevo({ tipo: '' }), 400, 'tipo')
  rechaza(() => nuevo({ tipo: 'JARDINES' as never }), 400, 'tipo')
})

test('HU-033: solo Postventa y el supervisor gestionan; otros roles no', () => {
  rechaza(() => registrarGarantia(datosVacios(AHORA), ENTRADA, 'p-crojas'), 403)
  assert.doesNotThrow(() => registrarGarantia(datosVacios(AHORA), ENTRADA, 'p-gnunez'))
})

test('HU-034 CA-01 y CA-02: dentro de cobertura se admite; fuera queda no procedente con su motivo', () => {
  const [, ok] = nuevo()
  assert.equal(ok.estado, 'UNDER_REVIEW')
  const [d, fuera] = nuevo({ entregaId: 'ACT-0388', tipo: 'ACABADOS', reclamada: new Date(2026, 9, 8) })
  assert.equal(fuera.estado, 'NOT_ELIGIBLE')
  assert.match(fuera.motivoNoProcede ?? '', /venció/)
  assert.ok(d.eventos.some((e) => e.nombre === 'garantía_no_procedente'))
  // Estructural cubre 120 meses: el mismo acta, mismo día, sí procede.
  assert.equal(nuevo({ entregaId: 'ACT-0388', tipo: 'ESTRUCTURAL', reclamada: new Date(2026, 9, 8) })[1].estado, 'UNDER_REVIEW')
})

test('HU-034: la fecha del reclamo no puede ser futura ni anterior a la entrega', () => {
  rechaza(() => nuevo({ reclamada: new Date(2026, 10, 1) }), 400, 'fecha')
  rechaza(() => nuevo({ reclamada: new Date(2025, 0, 1) }), 400, 'fecha')
})

test('HU-035 CA-01: la inspección se programa y luego exige informe y fotos', () => {
  let [d, g] = nuevo()
  d = programarInspeccion(d, g.id, new Date(2026, 9, 20), POSTVENTA)
  rechaza(() => registrarInspeccion(d, g.id, { informe: '', evidencias: [] }, POSTVENTA), 400, 'informe')
  rechaza(() => registrarInspeccion(d, g.id, { informe: 'Humedad en el muro', evidencias: [] }, POSTVENTA), 400, 'fotos')
  d = registrarInspeccion(d, g.id, { informe: 'Humedad en el muro', evidencias: [PDF] }, POSTVENTA)
  assert.ok(garantiaDe(d, g.id)?.inspeccion?.registrada)
})

test('HU-035 CA-02: no se resuelve sin inspección; luego pasa a aprobado, rechazado o resuelto con fecha y descripción', () => {
  let [d, g] = nuevo()
  rechaza(() => resolverGarantia(d, g.id, 'APPROVED', 'Procede', POSTVENTA), 409)
  d = programarInspeccion(d, g.id, new Date(2026, 9, 20), POSTVENTA)
  d = registrarInspeccion(d, g.id, { informe: 'Humedad', evidencias: [PDF] }, POSTVENTA)
  rechaza(() => resolverGarantia(d, g.id, '', '', POSTVENTA), 400)
  d = resolverGarantia(d, g.id, 'REJECTED', 'La humedad viene de un mal uso del cliente.', POSTVENTA)
  const r = garantiaDe(d, g.id)
  assert.equal(r?.estado, 'REJECTED')
  assert.ok(r?.resolucion?.fecha)
  assert.equal(r?.resolucion?.descripcion, 'La humedad viene de un mal uso del cliente.')
})

test('HU-036 CA-01: con señal de conflicto no se resuelve en Postventa (Eje 2)', () => {
  const d0 = sembrar()
  const g = d0.garantias.find((x) => x.ticketId)!
  // Su ticket ya tiene señal de abogado en la semilla: queda inspeccionada para aislar el gate.
  let d = registrarInspeccion(d0, g.id, { informe: 'Filtración confirmada', evidencias: [PDF] }, POSTVENTA)
  assert.throws(
    () => resolverGarantia(d, g.id, 'APPROVED', 'Se repara', POSTVENTA),
    (e: unknown) => e instanceof ErrorSimulado && e.codigo === 'gate-conflicto' && e.auditar,
  )
  // Sin señal, sí se resuelve.
  const libre = d0.garantias.find((x) => x.estado === 'UNDER_REVIEW' && x.inspeccion?.registrada && !x.ticketId)!
  d = resolverGarantia(d0, libre.id, 'APPROVED', 'Se cambia el térmico y la terma.', POSTVENTA)
  assert.equal(garantiaDe(d, libre.id)?.estado, 'APPROVED')
})

test('HU-036 CA-02: la adenda de reincorporación se registra en Postventa con el documento de Legal', () => {
  let [d, g] = nuevo()
  rechaza(() => registrarAdenda(d, g.id, { motivo: '', documento: null }, POSTVENTA), 400, 'documento')
  d = registrarAdenda(d, g.id, { motivo: 'Reincorporación tras la devolución parcial.', documento: PDF }, POSTVENTA)
  assert.ok(garantiaDe(d, g.id)?.adenda)
  rechaza(() => registrarAdenda(d, g.id, { motivo: 'Otra', documento: PDF }, POSTVENTA), 409)
})

test('Semilla de la ola 4: un reclamo para cada situación', () => {
  const d = sembrar()
  const estados = new Set(d.garantias.map((g) => g.estado))
  for (const e of ['UNDER_REVIEW', 'NOT_ELIGIBLE', 'APPROVED']) assert.ok(estados.has(e as never))
  assert.ok(d.garantias.some((g) => g.adenda))
  assert.ok(d.garantias.some((g) => g.inspeccion && !g.inspeccion.registrada))
  assert.ok(d.garantias.some((g) => g.ticketId))
})
