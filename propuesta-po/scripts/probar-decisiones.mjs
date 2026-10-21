// Prueba en Node las decisiones del 20-oct (DECISIONES.md §5.9) contra el chunk «comun» ya parcheado: subtipos reales de la
// plataforma actual en Mi Portal y su flujo, la suspensión por reclamo frena el flujo (HU-056 CA-03), la pausa del SLA también
// corre la actividad en curso (HU-066 CA-01), la encuesta sin la pregunta NPS 0–10 (HU-019) y las áreas de la plataforma actual.
// Uso: node scripts/probar-decisiones.mjs   (antes: npm run build). Node ≥ 22.18 (importa el modelo de Mi Portal en TS).
import assert from 'node:assert/strict'

globalThis.location = { hash: '' }
globalThis.addEventListener = () => {}
globalThis.removeEventListener = () => {}

const comun = await import('../artefacto/assets/comun-CVU2GQ4h.js')
const M = await import('../src/portal/modelo.ts')
const api = comun.E, sim = comun.O, n = comun.__ptNucleo, f = comun.__h43
const datos = () => n.datos()
const como = (personaId) => sim.ajustar({ personaId })
const tk = (id) => datos().tickets.find((t) => t.id === id)
const horas = (desde, h) => n.sumarHorasHabiles(desde, h)
const SUPERVISOR = 'p-gnunez', GESTOR = 'p-crojas', COBRANZA = 'p-rsalazar', ADMIN = 'p-aperez'

const casos = []
const caso = (nombre, fn) => casos.push([nombre, fn])
const rechaza = async (p, codigo) => { try { await p } catch (e) { assert.equal(e.codigo ?? e.code, codigo, `esperaba «${codigo}», llegó ${e.codigo ?? e.code ?? e.message}`); return e } assert.fail('no lanzó error') }

caso('Subtipos reales en Mi Portal: «Estado de cuenta del lote», «Actualización de datos», «Copia legalizada de contrato» y «Otra solicitud»', () => {
  const sub = Object.fromEntries(M.TIPOS.map((t) => [t.id, t.subtipos]))
  for (const s of ['Estado de cuenta del lote', 'Pago no reflejado']) assert.ok(sub.CTA.includes(s), s)
  for (const s of ['Copia legalizada de contrato', 'Actualización de datos', 'Otra solicitud']) assert.ok(sub.PED.includes(s), s)
  for (const s of ['Estado de cuenta y cuotas', 'Copia de minuta o contrato', 'Actualizar mis datos de contacto', 'Otro pedido']) assert.ok(!Object.values(sub).flat().includes(s), `sigue el nombre anterior «${s}»`)
})
caso('Flujo «Consulta de cuenta · Estado de cuenta del lote»: el ticket de Mi Portal va a Cobranza con las actividades del flujo del PO', () => {
  sim.reiniciar()
  const d0 = datos(), espera = d0.tickets.find((t) => t.estado === 'PENDING_CUSTOMER' && t.clienteId.startsWith('cli-0'))
  const cliente = comun.Kn(espera.clienteId), lote = comun.Ut(cliente)[0]
  const [d, r] = M.crearTicket(n, d0, cliente, lote, { loteId: lote.id, tipo: 'CTA', subtipo: 'Estado de cuenta del lote', descripcion: 'Necesito el estado de cuenta actualizado de mi lote.', adjuntos: [] })
  assert.equal(r.resultado, 'asignado')
  assert.equal(r.ticket.area, 'COBRANZA')
  const t = d.tickets.find((x) => x.id === r.ticket.id)
  assert.equal(t.flujo.subtipo, 'Estado de cuenta del lote')
  assert.deepEqual(t.actividades.map((a) => a.nombre), ['Recepción', 'Revisión de cobranza', 'Respuesta al cliente'])
  assert.ok(!d.alertasOps.some((a) => a.tipo === 'FLUJO_FALTANTE' && a.ticketId === t.id), 'con flujo no hay alerta «sin flujo»')
})
caso('HU-056 CA-03: «suspendido por reclamo» frena el flujo (no se cierra la actividad ni corre su SLA) y lo reanuda al responder el reclamo', async () => {
  sim.reiniciar(); como(SUPERVISOR); sim.evaluarMorosidad()
  const c = datos().casosResolucion.find((x) => x.estado === 'SUSPENDIDO')
  assert.ok(c, 'la semilla trae un cliente con reclamo abierto')
  const t0 = tk(c.ticketId), inicio = t0.pausaFlujo, vence0 = t0.actividades.find((a) => a.estado === 'EN_CURSO').vence
  assert.ok(inicio instanceof Date, 'el ticket del caso suspendido tiene el flujo en pausa')
  como(COBRANZA)
  await rechaza(api.cerrarActividad(c.ticketId, 1), 'suspendido-por-reclamo')
  // se responde el reclamo del cliente (en el prototipo: su asiento del Libro pasa a tener respuesta) y pasa un día hábil
  n.aplicar((d) => ({ ...d, asientos: d.asientos.map((a) => { let k = d.tickets.find((x) => x.id === a.ticketId); return k && k.clienteId === c.clienteId && a.respuesta === null ? { ...a, respuesta: { fecha: d.ahora, texto: 'Respuesta de prueba' } } : a }) }))
  sim.avanzar(9); como(SUPERVISOR); sim.evaluarMorosidad()
  const c1 = datos().casosResolucion.find((x) => x.id === c.id), t1 = tk(c.ticketId)
  assert.equal(c1.estado, 'ABIERTO')
  assert.equal(t1.pausaFlujo, null)
  const p = t1.pausasFlujo.at(-1)
  assert.ok(p.horas > 0, 'la suspensión duró horas hábiles')
  assert.equal(t1.actividades.find((a) => a.estado === 'EN_CURSO').vence.getTime(), horas(vence0, p.horas).getTime(), 'el vencimiento se corrió lo que duró la suspensión')
})
caso('HU-066 CA-01: la pausa del SLA en «pendiente del cliente» también corre el vencimiento de la actividad en curso', async () => {
  sim.reiniciar(); como(GESTOR)
  const cliente = datos().tickets.find((t) => t.clienteId.startsWith('cli-0')).clienteId
  const t = await api.crearTicket({ canal: 'Teléfono', clienteId: cliente, empresaId: 'AIN', linea: 'Vivienda', establecimiento: '', tipo: 'REC', subtipo: 'Garantía postventa', prioridad: 'MEDIUM', resumen: 'Reclamo de garantía postventa', descripcion: 'Prueba de la pausa del SLA.' })
  const v0 = tk(t.id).actividades[0].vence
  como(SUPERVISOR)
  await api.cambiarEstado(t.id, 'IN_PROGRESS', null)
  await api.cambiarEstado(t.id, 'PENDING_CUSTOMER', 'Se pide un documento al cliente')
  sim.avanzar(4)
  await api.cambiarEstado(t.id, 'IN_PROGRESS', null)
  const t1 = tk(t.id), p = t1.pausasSla.at(-1)
  assert.ok(p.horas > 0)
  assert.equal(t1.actividades[0].vence.getTime(), horas(v0, p.horas).getTime())
})
caso('HU-019: la encuesta de cierre es CSAT y CES; la pregunta «¿Recomendarías…?» (0–10) ya no existe', () => {
  sim.reiniciar()
  const e = datos().encuestas.find((x) => !x.respuesta) ?? datos().encuestas[0]
  sim.responderEncuesta(e.id, 5, 7, 10)
  const r = datos().encuestas.find((x) => x.id === e.id).respuesta
  assert.ok(r && r.csat === 5 && r.ces === 7)
  assert.ok(!('nps' in r), 'la respuesta no guarda NPS 0–10')
  assert.ok(datos().encuestas.every((x) => !x.respuesta || !('nps' in x.respuesta)), 'la semilla tampoco trae NPS')
})
caso('Áreas de la plataforma actual en el catálogo: se puede derivar a ellas y el ticket queda en su cola', async () => {
  sim.reiniciar()
  const areas = comun.Zn, nombres = comun.mr
  for (const [id, nom] of [['BACK_OFFICE', 'Back Office'], ['LEGAL_FORMALIZACION', 'Legal Formalización'], ['LEGAL_CORPORATIVO', 'Legal Corporativo'], ['ARCHIVOS', 'Archivos'], ['PROYECTOS', 'Proyectos'], ['MARKETING', 'Marketing'], ['SOPORTE_WEB', 'Soporte Web']]) {
    assert.ok(areas.includes(id), id); assert.equal(nombres[id], nom)
  }
  for (const id of ['ATC', 'COBRANZA', 'LEGAL', 'POSTVENTA', 'TI', 'ADMINISTRACION']) assert.ok(areas.includes(id), `sigue ${id}`)
  como(GESTOR)
  const t = datos().tickets.find((x) => x.area === 'ATC' && x.responsable === GESTOR && ['OPEN', 'IN_PROGRESS'].includes(x.estado) && x.eje !== 3 && !comun.cn(datos(), x.id).length)
  await api.derivar(t.id, { area: 'BACK_OFFICE', motivo: 'DERIVACION_COMPETENCIA', nota: 'Corresponde a Back Office.' })
  const t1 = tk(t.id)
  assert.equal(t1.area, 'BACK_OFFICE'); assert.equal(t1.responsable, null)
})

let fallos = 0
for (const [nombre, fn] of casos) {
  try { await fn(); console.log(`ok   ${nombre}`) } catch (e) { fallos++; console.log(`FALLA ${nombre}\n     ${e.message}`) }
}
console.log(`\n${casos.length - fallos}/${casos.length} casos en verde`)
process.exit(fallos ? 1 : 0)
