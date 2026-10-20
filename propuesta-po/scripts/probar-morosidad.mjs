// Prueba en Node la resolución por morosidad (HU-ATC-056 y HU-ATC-057, PLT-04 v1.3) contra el chunk «comun» ya parcheado
// (artefacto/assets), con la semilla y la misma API que usa la consola (E = fachada, O = simulación). Un caso por criterio.
// La plantilla de la alerta (UX de la HU-057) se prueba en Chrome: scripts/recorrer-morosidad.mjs.
// Uso: node scripts/probar-morosidad.mjs   (antes: npm run build). Node ≥ 22.
import assert from 'node:assert/strict'

globalThis.location = { hash: '' }
globalThis.addEventListener = () => {}
globalThis.removeEventListener = () => {}

const comun = await import('../artefacto/assets/comun-CVU2GQ4h.js')
const api = comun.E, sim = comun.O, n = comun.__ptNucleo, h56 = comun.__h56
const datos = () => n.datos()
const como = (personaId) => sim.ajustar({ personaId })
const SUPERVISOR = 'p-gnunez', COBRANZA = 'p-rsalazar', LEGAL = 'p-pvilchez'
const tk = (id) => datos().tickets.find((t) => t.id === id)
const historial = (casoId) => datos().filasResolucion.filter((f) => f.casoId === casoId)
const constancias = (casoId) => datos().constancias.filter((c) => c.casoId === casoId)
const cliente = (id) => comun.Kn(id)
let r0
const evaluar = () => { sim.reiniciar(); como(SUPERVISOR); r0 = sim.evaluarMorosidad(); return datos().casosResolucion }

const casos = []
const caso = (nombre, fn) => casos.push([nombre, fn])

// ------------------------------------------------------------------ HU-ATC-056
caso('056 CA-01 la evaluación diaria crea el ticket «Resolución de contrato» del cliente y el lote, derivado al flujo de Cobranza y Legal', async () => {
  const cs = evaluar()
  assert.ok(r0.nuevos > 0 && cs.length === r0.nuevos)
  for (const c of cs) {
    const t = tk(c.ticketId)
    assert.equal(t.tipo, 'RES'); assert.equal(t.clienteId, c.clienteId); assert.ok(c.loteId)
    assert.match(t.resumen, /^Resolución de contrato · /)
    // derivado al flujo del tipo (HU-043): Resolución de contrato · General · Cobranza, con actividades de Cobranza y de Legal
    assert.equal(t.subtipo, 'General')
    assert.equal(t.flujo.tipo, 'RES'); assert.equal(t.flujo.area, 'COBRANZA')
    assert.ok(datos().flujosDeTicket.some((f) => f.ticketId === t.id && f.flujoId === t.flujo.id))
    assert.deepEqual(t.actividades.map((a) => a.responsable), [COBRANZA, LEGAL, LEGAL])
    assert.deepEqual(h56.actividades(t).map((a) => a.area), ['Cobranza', 'Legal', 'Legal'])
    assert.equal(h56.areas(t), 'Cobranza y Legal')
    // el ticket queda en Cobranza: con el responsable del flujo o, si la HU-046 lo reparte por carga, con otro gestor del área
    assert.equal(t.actividades[0].estado, 'EN_CURSO'); assert.equal(t.area, 'COBRANZA')
    assert.ok(t.responsable === null || comun.br.find((p) => p.id === t.responsable)?.area === 'COBRANZA', `responsable fuera de Cobranza: ${t.responsable}`)
    // y lo cuenta el historial del caso (antes solo lo decía esta nota, sin derivar)
    if (c.estado === 'ABIERTO') assert.match(historial(c.id)[0].nota, /derivado al flujo Resolución de contrato · General · Cobranza \(versión 1\), con actividades de Cobranza y Legal\./)
  }
  // la «Revisión legal de la causal» le toca a Legal al cerrar la verificación de la deuda (orden del flujo)
  const t = tk(cs.find((c) => c.estado === 'ABIERTO').ticketId)
  como(COBRANZA); await api.cerrarActividad(t.id, 1)
  const a = tk(t.id).actividades
  assert.equal(a[0].estado, 'CERRADA'); assert.equal(a[1].estado, 'EN_CURSO'); assert.equal(a[1].responsable, LEGAL)
  assert.ok(datos().eventos.some((e) => e.nombre === 'resolucion_abierta'))
})
caso('056 CA-02 si Cobranza registra el pago, el caso queda «Regularizado», el ticket se cierra y el proceso se detiene', async () => {
  const c = evaluar().find((x) => x.estado === 'ABIERTO')
  como(COBRANZA); await api.registrarPago(c.id)
  const d = datos(), caso = d.casosResolucion.find((x) => x.id === c.id)
  assert.equal(caso.estado, 'REGULARIZADO'); assert.equal(tk(c.ticketId).estado, 'CLOSED')
  assert.equal(d.filasEstado.filter((f) => f.ticketId === c.ticketId).at(-1).nota, 'Regularizado')
  // la evaluación siguiente no lo reabre
  const antes = d.casosResolucion.length; sim.evaluarMorosidad()
  assert.equal(datos().casosResolucion.length, antes)
})
caso('056 CA-03 con un reclamo abierto en el Libro, el caso queda «Suspendido por reclamo» (sin alerta ni carta)', async () => {
  const s = evaluar().find((x) => x.estado === 'SUSPENDIDO')
  assert.ok(s, 'la semilla trae un cliente con reclamo abierto')
  assert.equal(constancias(s.id).length, 0); assert.ok(!datos().cartas.some((x) => x.casoId === s.id))
  assert.match(historial(s.id)[0].nota, /suspendido hasta responderlo/)
  assert.ok(tk(s.ticketId).flujo, 'su ticket también se deriva al flujo (supuesto: la suspensión es del caso)')
})

// ------------------------------------------------------------------ HU-ATC-057
caso('057 CA-01 al registrarse el ticket, en ese mismo momento se envía la alerta, sin esperar el flujo', async () => {
  const c = evaluar().find((x) => x.estado === 'ABIERTO')
  const t = tk(c.ticketId), cs = constancias(c.id)
  assert.ok(cs.length >= 3)
  assert.ok(cs.every((x) => x.fecha.getTime() === t.abierto.getTime() && x.fecha.getTime() === c.abierto.getTime()))
  assert.equal(t.actividades[0].estado, 'EN_CURSO', 'el flujo apenas empieza: la alerta no espera su avance')
})
caso('057 CA-02 la constancia guarda fecha y hora, canal, destinatario (el cliente del caso) y estado de entrega', async () => {
  const c = evaluar().find((x) => x.estado === 'ABIERTO')
  for (const x of constancias(c.id)) {
    assert.ok(x.fecha instanceof Date); assert.ok(['Correo', 'WhatsApp', 'Mi Portal'].includes(x.canal))
    assert.ok(['ENTREGADO', 'REBOTADO', 'NO_DISPONIBLE'].includes(x.resultado))
  }
  assert.ok(cliente(c.clienteId)?.nombre, 'el destinatario es el cliente del caso')
  assert.deepEqual(constancias(c.id).map((x) => x.canal), ['Correo', 'WhatsApp', 'Mi Portal'])
})
caso('057 CA-03 si el correo rebota, se reintenta por WhatsApp y Mi Portal y cada intento queda en la constancia', async () => {
  const cs = evaluar()
  const c = cs.find((x) => constancias(x.id).some((k) => k.canal === 'Correo' && k.resultado === 'REBOTADO'))
  assert.ok(c, 'hay un correo que rebota en la semilla')
  const k = constancias(c.id)
  assert.deepEqual(k.map((x) => [x.canal, x.reintento]), [['Correo', false], ['WhatsApp', true], ['Mi Portal', true]])
})

let fallos = 0
for (const [nombre, fn] of casos) {
  try { await fn(); console.log(`ok   ${nombre}`) } catch (e) { fallos++; console.log(`FALLA ${nombre}\n     ${e.message}`) }
}
console.log(`\n${casos.length - fallos}/${casos.length} casos en verde`)
process.exit(fallos ? 1 : 0)
