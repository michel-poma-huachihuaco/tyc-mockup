import test from 'node:test'
import assert from 'node:assert/strict'
import { crearSim, spawn, tick, marcarRayo, bandejaDeArea, sembrar, NIVELES, type Modo, type Sim, type Ticket } from '../src/ciudad/sim.ts'

// Un ticket ya vencido, en bandeja, sin que el generador aleatorio meta más tickets.
function conVencido(modo: Modo, tipo: string): { s: Sim; t: Ticket } {
  const s = crearSim(modo)
  s.nextArr = 1e9
  const t = spawn(s, 'tel', tipo)
  t.st = 'bandeja'; t.vis = false; t.times.band = 0; t.due = 5
  s.T = 10
  return { s, t }
}

test('PO: un ticket vencido salta directo al Comité y recibe rayo automático (choque con las HU)', () => {
  const { s, t } = conVencido('po', 'cons')
  tick(s, 0.2)
  assert.equal(s.escal, 1)
  assert.equal(t.rayo, true)
  assert.ok(s.tickets.some((x) => x.drone))
})

test('HU: un ticket común vencido solo da alerta única; no va al Comité ni recibe rayo', () => {
  const { s, t } = conVencido('hu', 'cons')
  for (let i = 0; i < 500; i++) tick(s, 0.2)
  assert.equal(t.esc, true)
  assert.equal(t.rayo, false)
  assert.equal(s.escal, 0)
  assert.equal(s.tickets.some((x) => x.drone), false)
})

test('HU: un caso sensible escala en cadena sin saltar niveles', () => {
  const { s, t } = conVencido('hu', 'legal')
  const vistos: number[] = []
  for (let i = 0; i < 2000; i++) { tick(s, 0.2); if (vistos.at(-1) !== t.nivelEsc) vistos.push(t.nivelEsc) }
  assert.deepEqual(vistos.filter((n) => n > 0), [1, 2, 3, 4].slice(0, vistos.filter((n) => n > 0).length))
  assert.ok(vistos.includes(NIVELES.length), 'llega a Directorio')
  assert.equal(s.escal, 1)
})

test('HU: el rayo exige rol de supervisor, motivo y respeta el tope del 10 %', () => {
  const s = crearSim('hu', 3)
  s.nextArr = 1e9
  const ts = Array.from({ length: 10 }, () => spawn(s, 'tel', 'cons'))
  ts.forEach((t) => { t.st = 'bandeja' })
  assert.equal(marcarRayo(s, ts[0]!, 'gestor', 'urgente').ok, false)
  assert.deepEqual(marcarRayo(s, ts[0]!, 'supervisor', '').ok, false)
  assert.equal(marcarRayo(s, ts[0]!, 'supervisor', 'plazo legal').ok, true)
  assert.equal(bandejaDeArea(s, 'eje1').length, 10)
  const r = marcarRayo(s, ts[1]!, 'supervisor', 'otro')
  assert.equal(r.ok, false)
  assert.equal(r.ok === false && r.razon, 'limite')
  assert.equal(marcarRayo(s, ts[1]!, 'supervisor', 'otro', true).ok, true)
})

test('PO: cualquiera marca el rayo sin motivo ni tope', () => {
  const s = crearSim('po')
  s.nextArr = 1e9
  const t = spawn(s, 'tel', 'cons')
  assert.equal(marcarRayo(s, t, 'gestor', '').ok, true)
})

test('el escenario inicial es reproducible y no rompe en ninguno de los dos modos', () => {
  for (const modo of ['po', 'hu'] as const) {
    const a = crearSim(modo, 11); sembrar(a)
    const b = crearSim(modo, 11); sembrar(b)
    assert.equal(a.resolved, b.resolved)
    assert.equal(a.tickets.length, b.tickets.length)
  }
})
