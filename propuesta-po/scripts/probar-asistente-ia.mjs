// Prueba en Node la HU-ATC-048 (asistente de IA al atender y al cerrar, PLT-04 v1.3) contra el chunk «comun» ya parcheado y el
// motor del asistente (artefacto/assets/escenas-three.js), con los datos semilla y la misma API que usa la consola.
// Uso: node scripts/probar-asistente-ia.mjs   (antes: npm run build). Node ≥ 22.
import assert from 'node:assert/strict'

globalThis.location = { hash: '' }
globalThis.addEventListener = () => {}
globalThis.removeEventListener = () => {}

const comun = await import('../artefacto/assets/comun-CVU2GQ4h.js')
const bot = await import('../artefacto/assets/escenas-three.js')
const api = comun.E, sim = comun.O, n = comun.__ptNucleo, ia = comun.__ptIA
const datos = () => n.datos()
const como = (personaId) => sim.ajustar({ personaId })
const GESTOR = 'p-crojas', ADMIN = 'p-aperez', CLIENTE = 'p-cliente'
const tk = (id) => datos().tickets.find((t) => t.id === id)
const CRIT_CTA = ['Registrar la respuesta al cliente', 'El cliente confirma la solución en Mi Portal']
// el contexto que el shell le pasa al asistente (solo lo que usan estas reglas)
const ctx = (id, extra = {}) => {
  const t = tk(id)
  return { numero: t.numero, resumen: t.resumen, tipo: t.tipo, tipoId: t.tipo, estado: t.estado, estadoId: t.estado, area: t.area, canal: t.canal,
    cliente: 'Ana Pérez Soto', responsable: 'Carla Rojas', usuario: 'Carla Rojas', eje: t.eje, reaperturas: t.reaperturas, rayo: false,
    primeraRespuesta: !!t.primeraRespuesta, sla: { nivel: 'ok', hito: 'resolución', vence: '21 oct, 12:10', restante: 'faltan 6 días' },
    historial: [], mensajes: 0, notas: 0, ultimoMensaje: null, cierre: ia.criterios(datos(), t), ...extra }
}
const lanza = async (fn) => { try { await fn() } catch (e) { return e } assert.fail('no lanzó error') }

const casos = []
const caso = (nombre, fn) => casos.push([nombre, fn])
const reiniciar = () => { sim.reiniciar(); como(GESTOR) }

caso('048 CA-01 los criterios de cierre pendientes salen de la guía del ticket y de su estado, no de una lista fija por tipo', async () => {
  reiniciar()
  let c = ia.criterios(datos(), tk('tk-450'))
  assert.equal(c.guia, 1); assert.deepEqual(c.pendientes, CRIT_CTA)
  // al responder al cliente se cumple «Registrar la respuesta al cliente»; la confirmación sigue pendiente hasta el cierre
  await api.registrarInteraccion('tk-450', { texto: 'Hola, la entrega física del lote se programa para noviembre.', visible: true, canal: 'Correo', adjuntos: [] })
  c = ia.criterios(datos(), tk('tk-450'))
  assert.deepEqual(c.pendientes, ['El cliente confirma la solución en Mi Portal'])
  assert.deepEqual(c.criterios.map((x) => x.cumplido), [true, false])
  // queja con asiento en el Libro de Reclamaciones: ese criterio de su guía ya se cumple
  assert.deepEqual(ia.criterios(datos(), tk('tk-272')).pendientes, ['El cliente confirma la solución en Mi Portal'])
  // ticket cerrado: no queda nada pendiente
  assert.deepEqual(ia.criterios(datos(), tk('tk-174')).pendientes, [])
  // tipo sin guía publicada (Reclamo): no hay criterios que inventar
  const rec = datos().tickets.find((t) => t.tipo === 'REC')
  assert.deepEqual(ia.criterios(datos(), rec), { guia: null, criterios: [], pendientes: [] })
  // el administrador publica la versión 2 de la guía de «Consulta de cuenta»: el asistente usa sus criterios
  como(ADMIN)
  await api.publicarGuia('CTA', { pasos: ['Revisar el estado de cuenta'], plantillas: ['Hola, revisamos tu consulta «{resumen}».'], criterios: ['Registrar la respuesta al cliente', 'Adjuntar el estado de cuenta enviado', 'El cliente confirma la solución en Mi Portal'] })
  c = ia.criterios(datos(), tk('tk-450'))
  assert.equal(c.guia, 2); assert.deepEqual(c.pendientes, ['Adjuntar el estado de cuenta enviado', 'El cliente confirma la solución en Mi Portal'])
})

caso('048 CA-01 al ir a cerrar el asistente sugiere la respuesta de cierre y su «siguiente paso» lista los criterios de la guía', () => {
  reiniciar()
  const c = ctx('tk-450')
  const cierre = bot.redactar(c, 'empatico', 'RESOLVED')
  assert.match(cierre, /ya resolvimos/i); assert.match(cierre, /Mi Portal/); assert.doesNotMatch(cierre, /a más tardar/)
  assert.match(bot.redactar(c, 'formal', 'CLOSED'), /quedó cerrado/)
  assert.match(bot.redactar(c, 'empatico'), /a más tardar/, 'a pedido, la respuesta sigue el estado real del ticket')
  const paso = bot.siguientePaso(c)
  assert.deepEqual(paso.criterios, CRIT_CTA); assert.equal(paso.guia, 1)
  assert.deepEqual(bot.siguientePaso(ctx('tk-450', { cierre: { guia: null, pendientes: [] } })).criterios, [], 'sin guía no hay lista fija por tipo')
  assert.equal(bot.conversar(c, '¿qué me falta para cerrar?').accion, 'cierre')
  assert.equal(bot.conversar(ctx('tk-174'), 'quiero cerrar').accion, undefined)
})

caso('048 CA-02 cada decisión (aceptada, editada o descartada) queda registrada sin texto ni datos personales', async () => {
  reiniciar()
  const antes = datos().decisionesIA.length
  for (const d of ['ACEPTADA', 'EDITADA', 'DESCARTADA']) await api.decisionIA('tk-450', d, 0)
  const r = datos().decisionesIA.slice(antes)
  assert.deepEqual(r.map((x) => x.decision), ['ACEPTADA', 'EDITADA', 'DESCARTADA'])
  for (const x of r) {
    assert.deepEqual(Object.keys(x).sort(), ['anonimizados', 'autor', 'decision', 'fecha', 'id', 'ticketId'])
    assert.equal(x.ticketId, 'tk-450'); assert.equal(x.autor, GESTOR)
  }
  const ev = datos().eventos.filter((e) => e.nombre === 'sugerencia_ia').slice(-3)
  assert.deepEqual(ev.map((e) => e.datos), [{ decision: 'ACEPTADA' }, { decision: 'EDITADA' }, { decision: 'DESCARTADA' }])
  como(CLIENTE)
  await lanza(() => api.decisionIA('tk-450', 'ACEPTADA', 0))
})

caso('048 CA-03 el DNI y la tarjeta se anonimizan antes de pedir la revisión y el registro solo guarda cuántos', async () => {
  reiniciar()
  const r = bot.revisar(ctx('tk-450'), 'hola, el cliente 45781236 pagó con la tarjeta 4111 1111 1111 1111 y espera respuesta hoy. gracias')
  assert.equal(r.anonimizados, 2)
  assert.doesNotMatch(r.corregido, /45781236|4111/)
  await api.decisionIA('tk-450', 'EDITADA', r.anonimizados)
  const x = datos().decisionesIA.at(-1)
  assert.equal(x.anonimizados, 2); assert.doesNotMatch(JSON.stringify(x), /45781236|4111/)
})

let fallas = 0
for (const [nombre, fn] of casos) {
  try { await fn(); console.log(`ok    ${nombre}`) } catch (e) { fallas++; console.log(`FALLA ${nombre}\n      ${e.message.split('\n').join('\n      ')}`) }
}
console.log(`\n${casos.length - fallas}/${casos.length} casos en verde`)
process.exit(fallas ? 1 : 0)
