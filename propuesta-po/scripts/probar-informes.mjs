// Prueba en Node la HU-ATC-031 (informe diario y quincenal al cierre, PLT-04 v1.3) contra el chunk «comun» ya parcheado, con los
// datos semilla (reloj: jueves 15 de octubre de 2026, 11:00; feriado del 8 de octubre) y el reloj del panel de simulación.
// Uso: node scripts/probar-informes.mjs   (antes: npm run build). Node ≥ 22.
import assert from 'node:assert/strict'

globalThis.location = { hash: '' }
globalThis.addEventListener = () => {}
globalThis.removeEventListener = () => {}

const comun = await import('../artefacto/assets/comun-CVU2GQ4h.js')
const api = comun.E, sim = comun.O, n = comun.__ptNucleo, inf = comun.__ptInformes
const datos = () => n.datos()
const informes = (tipo) => datos().informes.filter((i) => i.tipo === tipo)
const COORD = 'p-avaldivia', GESTOR = 'p-crojas'
const DIA = 9 // horas hábiles de una jornada (9:00 a 18:00)
const f = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
const ejes = (i) => [...i.datos.find(([k]) => k === 'Tickets activos por eje')[1].matchAll(/Eje \d: (\d+)/g)].reduce((s, m) => s + Number(m[1]), 0)

const casos = []
const caso = (nombre, fn) => casos.push([nombre, fn])
const reiniciar = () => { sim.reiniciar(); sim.ajustar({ personaId: COORD }) }

caso('031 CA-01 al cierre de cada jornada se genera el informe diario (tickets por eje, NPS, derivaciones y SLA), una sola vez', async () => {
  reiniciar()
  assert.equal(f(datos().ahora), '2026-10-15 11:00'); assert.equal(datos().informes.length, 0)
  assert.deepEqual(sim.avanzar(1).informes, [], 'a media jornada no se genera nada') // 11:00 → 12:00
  const r = sim.avanzar(DIA) // jueves 15, 12:00 → viernes 16, 12:00: pasa el cierre del jueves 15
  assert.equal(informes('DIARIO').length, 1)
  const d = informes('DIARIO')[0]
  assert.equal(f(d.corte), '2026-10-15 18:00'); assert.equal(f(d.generado), '2026-10-15 18:00'); assert.equal(d.automatico, true)
  assert.deepEqual(d.datos.map(([k]) => k.replace(/^NPS.*/, 'NPS')), ['Tickets activos por eje', 'NPS', 'Derivaciones registradas', 'Cumplimiento de SLA'])
  assert.match(d.datos[0][1], /^Eje 1: \d+ · Eje 2: \d+ · Eje 3: \d+$/); assert.match(d.datos[3][1], /^\d+ % de \d+ tickets$/)
  assert.deepEqual(r.informes, ['diario del jue 15 oct', 'quincenal del jue 1 oct al jue 15 oct'])
  sim.ejecutarJob(); sim.avanzar(1)
  assert.equal(informes('DIARIO').length, 1, 'correr el job o avanzar dentro de la jornada no repite informes')
  // los tickets nuevos del viernes cuentan en el diario del viernes, no en el del jueves; el fin de semana no tiene jornadas
  sim.ajustar({ personaId: GESTOR })
  await api.crearTicket({ canal: 'Teléfono', empresaId: 'AIN', linea: 'Lotes urbanos', establecimiento: '', clienteId: 'cli-004', tipo: 'CTA', prioridad: 'MEDIUM', resumen: 'Consulta de saldo', descripcion: 'Pide su saldo.' })
  sim.avanzar(3 * DIA) // viernes 16, 13:00 → miércoles 21, 13:00
  assert.deepEqual(informes('DIARIO').map((i) => f(i.corte)), ['2026-10-15 18:00', '2026-10-16 18:00', '2026-10-19 18:00', '2026-10-20 18:00'])
  const [jue, vie] = informes('DIARIO')
  const nuevos = datos().tickets.filter((t) => t.abierto > jue.corte && t.abierto <= vie.corte)
  assert.ok(nuevos.some((t) => t.resumen === 'Consulta de saldo'))
  assert.equal(ejes(vie), ejes(jue) + nuevos.length, 'cada diario cuenta lo que había abierto en su corte')
})

caso('031 CA-01 la jornada es hábil: el feriado del 8 de octubre y los fines de semana no tienen cierre', () => {
  const j = inf.jornadas(new Date(2026, 9, 1), new Date(2026, 9, 15, 18)).map(f)
  assert.equal(j.length, 10); assert.ok(!j.includes('2026-10-08 18:00')); assert.ok(!j.some((x) => /2026-10-(03|04|10|11) /.test(x)))
  assert.equal(f(inf.corteQ(new Date(2026, 9, 20))), '2026-10-30 18:00', 'el 31 de octubre es sábado: la quincena cierra el viernes 30')
})

caso('031 CA-02 al cierre de la quincena se genera el quincenal con tendencias de KPI y adopción de Mi Portal', async () => {
  reiniciar()
  sim.ticketEntrante('CTA', 'Mi Portal') // un ticket registrado por el cliente en Mi Portal el jueves 15
  sim.avanzar(DIA)
  const q = informes('QUINCENAL')
  assert.equal(q.length, 1)
  const [i] = q
  assert.equal(f(i.desde), '2026-10-01 00:00'); assert.equal(f(i.corte), '2026-10-15 18:00'); assert.equal(f(i.anterior), '2026-09-30 18:00')
  assert.deepEqual(i.tendencias.map((t) => t.id), ['sla', 'csat', 'nps', 'adopcion'])
  const t = Object.fromEntries(i.tendencias.map((x) => [x.id, x]))
  assert.ok(t.sla.valor >= 0 && t.sla.valor <= 100 && t.sla.anterior !== null, 'SLA con su valor de la quincena anterior')
  assert.ok(inf.delta(t.sla) && ['up', 'down', 'flat'].includes(inf.delta(t.sla).dir))
  assert.ok(t.csat.valor > 0 && t.csat.anterior === null && inf.delta(t.csat) === undefined, 'sin encuestas en septiembre no hay variación de CSAT')
  const abiertos = Number(i.datos.find(([k]) => k === 'Tickets abiertos en la quincena')[1])
  assert.equal(t.adopcion.valor, Math.round(100 / abiertos), '1 de los tickets nuevos de la quincena llegó por Mi Portal')
  // tendencia jornada a jornada: 10 jornadas hábiles; el CSAT aparece cuando llegan las primeras respuestas (14 de octubre)
  assert.equal(i.serie.length, 10)
  assert.deepEqual(i.serie.map((s) => s.csat === null), [true, true, true, true, true, true, true, true, false, false])
  assert.equal(i.serie.at(-1).adopcion, t.adopcion.valor); assert.equal(i.serie.at(-2).adopcion, 0)
  assert.deepEqual(i.serie.at(-1).sla, t.sla.valor)
})

caso('031 CA-02 la quincena siguiente compara contra el cierre de la anterior', () => {
  reiniciar()
  sim.avanzar(DIA)
  const [q1] = informes('QUINCENAL')
  sim.avanzar(11 * DIA) // viernes 16 → lunes 2 de noviembre: pasa el cierre del viernes 30
  const q = informes('QUINCENAL')
  assert.equal(q.length, 2)
  const q2 = q[1]
  assert.equal(f(q2.desde), '2026-10-16 00:00'); assert.equal(f(q2.corte), '2026-10-30 18:00'); assert.equal(f(q2.anterior), '2026-10-15 18:00')
  for (const id of ['sla', 'csat', 'nps']) assert.equal(q2.tendencias.find((x) => x.id === id).anterior, q1.tendencias.find((x) => x.id === id).valor, id)
  assert.equal(informes('DIARIO').length, 12)
  assert.equal(q2.serie.length, 11)
})

let fallas = 0
for (const [nombre, fn] of casos) {
  try { await fn(); console.log(`ok    ${nombre}`) } catch (e) { fallas++; console.log(`FALLA ${nombre}\n      ${e.message.split('\n').join('\n      ')}`) }
}
console.log(`\n${casos.length - fallas}/${casos.length} casos en verde`)
process.exit(fallas ? 1 : 0)
