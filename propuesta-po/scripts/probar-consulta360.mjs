// Prueba en Node la consulta 360 dentro del ticket (HU-ATC-050, PLT-04 v1.3) contra el chunk «comun» ya parcheado.
// Uso: node scripts/probar-consulta360.mjs   (antes: node scripts/parchear.mjs)
import assert from 'node:assert/strict'

globalThis.location = { hash: '' }
globalThis.addEventListener = () => {}
globalThis.removeEventListener = () => {}

const assets = '../artefacto/assets'
const comun = await import(`${assets}/comun-CVU2GQ4h.js`)
const n = comun.__ptNucleo
const E = comun.E, O = comun.O, w = comun.w
const d0 = n.datos()
const TK = 'tk-460', CLI = 'cli-001'
const restaurar = () => n.aplicar(() => d0)
const como = (rol) => O.ajustar({ personaId: w[rol] })
const notas = (d, tk) => d.interacciones.filter((i) => i.ticketId === tk && i.consulta360)

const casos = []
const caso = (nombre, fn) => casos.push([nombre, fn])

caso('CA-10 gestor: la consulta desde el ticket deja quién, cuándo y qué secciones, sin datos personales', async () => {
  restaurar(); como('GESTOR')
  const antes = n.datos().interacciones.length
  await E.consultar360(CLI, TK)
  const d = n.datos(), ns = notas(d, TK)
  assert.equal(d.interacciones.length, antes + 1)
  assert.equal(ns.length, 1)
  const nota = ns[0], cli = comun.Kn(CLI)
  assert.equal(nota.autor, w.GESTOR)
  assert.equal(nota.fecha.getTime(), d.ahora.getTime())
  assert.equal(nota.tipo, 'nota'); assert.equal(nota.visible, false)
  assert.equal(nota.texto, 'Consulta 360 del cliente. Secciones vistas: Lotes y contratos, Cuotas y estado de cuenta, Correos y mensajes, Documentos, Tickets e interacciones previas, Llamadas.')
  for (const pii of [cli.nombre, cli.dni, cli.dni.slice(0, 4), cli.telefono, cli.correo, ...cli.proyectos]) assert.ok(!nota.texto.includes(pii), `la nota lleva un dato personal: ${pii}`)
  assert.ok(d.eventos.some((e) => e.nombre === 'consulta360'), 'sigue el evento de analítica')
})
caso('CA-10 volver a la pestaña no es otra consulta: la misma persona y secciones en menos de 10 min no repiten la nota', async () => {
  restaurar(); como('GESTOR')
  await E.consultar360(CLI, TK); await E.consultar360(CLI, TK)
  assert.equal(notas(n.datos(), TK).length, 1)
  O.fuente('COBRANZA', true); await E.consultar360(CLI, TK); O.fuente('COBRANZA', false)
  assert.equal(notas(n.datos(), TK).length, 2, 'con otras secciones sí es otra consulta')
})
caso('CA-10 Coordinador CX: solo las secciones que su rol ve', async () => {
  restaurar(); como('COORDINADOR_CX')
  await E.consultar360(CLI, TK)
  const nota = notas(n.datos(), TK).at(-1)
  assert.equal(nota.autor, w.COORDINADOR_CX)
  assert.equal(nota.texto, 'Consulta 360 del cliente. Secciones vistas: Lotes y contratos, Tickets e interacciones previas, Llamadas.')
})
caso('CA-10 Cobranza caída: «Cuotas» no cuenta como vista', async () => {
  restaurar(); como('GESTOR'); O.fuente('COBRANZA', true)
  const v = await E.consultar360(CLI, TK)
  assert.equal(v.cuotas.estado, 'no-disponible')
  assert.ok(!notas(n.datos(), TK).at(-1).texto.includes('Cuotas'))
  O.fuente('COBRANZA', false)
})
caso('CA-10 sin ticket (#/clientes/cli-001): no se escribe en ninguna bitácora', async () => {
  restaurar(); como('GESTOR')
  const antes = n.datos().interacciones.length
  await E.consultar360(CLI)
  assert.equal(n.datos().interacciones.length, antes)
})
caso('CA-10 la nota no cuenta como «interacción en curso»: el balanceo por carga no cambia', async () => {
  restaurar(); como('SUPERVISOR')
  const base = await E.balancear()
  const movidos = n.datos().filasAsignacion.filter((f) => f.motivo === 'REASSIGNMENT_CARGA').map((f) => f.ticketId)
  assert.ok(movidos.length > 0, 'la semilla tiene tickets que el balanceo mueve')
  restaurar(); como('SUPERVISOR')
  for (const id of movidos) { const t = n.datos().tickets.find((x) => x.id === id); await E.consultar360(t.clienteId === 'cli-int' ? CLI : t.clienteId, id) }
  assert.ok(movidos.every((id) => notas(n.datos(), id).length === 1))
  const otra = await E.balancear()
  assert.deepEqual(otra, base)
})
caso('CA-01..03 siguen igual: secciones, restringida y caída con hora del intento', async () => {
  restaurar(); como('GESTOR')
  const v = await E.consultar360(CLI, TK)
  for (const s of ['lotes', 'cuotas', 'correos', 'tickets']) assert.equal(v[s].estado, 'ok')
  como('COORDINADOR_CX'); assert.equal((await E.consultar360(CLI, TK)).cuotas.estado, 'restringido')
  como('GESTOR'); O.fuente('COBRANZA', true)
  const c = await E.consultar360(CLI, TK)
  assert.equal(c.cuotas.estado, 'no-disponible'); assert.ok(c.cuotas.intento instanceof Date); assert.equal(c.lotes.estado, 'ok')
  O.fuente('COBRANZA', false)
})

let fallos = 0
for (const [nombre, fn] of casos) {
  try { await fn(); console.log(`ok   ${nombre}`) } catch (e) { fallos++; console.log(`FALLA ${nombre}\n     ${e.message}`) }
}
console.log(`\n${casos.length - fallos}/${casos.length} casos en verde`)
process.exit(fallos ? 1 : 0)
