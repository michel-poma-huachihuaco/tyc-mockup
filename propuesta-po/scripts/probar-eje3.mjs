// Prueba en Node el paso a Eje 3 y Legal (HU-ATC-026 CA-01/02, HU-ATC-027 CA-01/03, HU-ATC-040 CA-02 y HU-ATC-041 CA-02, PLT-04
// v1.3) contra el chunk «comun» ya parcheado (artefacto/assets), con la semilla del prototipo y la misma API de la consola
// (E = fachada, O = simulación). Uso: node scripts/probar-eje3.mjs   (antes: node scripts/parchear.mjs). Node ≥ 22.
import assert from 'node:assert/strict'

globalThis.location = { hash: '' }
globalThis.addEventListener = () => {}
globalThis.removeEventListener = () => {}

const comun = await import('../artefacto/assets/comun-CVU2GQ4h.js')
const api = comun.E, sim = comun.O, n = comun.__ptNucleo
const datos = () => n.datos()
const como = (personaId) => sim.ajustar({ personaId })
const SUPERVISOR = 'p-gnunez', GESTOR = 'p-crojas', LEGAL = 'p-pvilchez', JEFATURA_LEGAL = 'p-rcastillo'
const tk = (id) => datos().tickets.find((t) => t.id === id)
const gate = (id, estado) => comun.rn(datos(), tk(id), estado) // el mismo gate que deshabilita la opción en «Cambiar estado»
const lanza = async (fn, { campo, codigo, texto } = {}) => {
  try { await fn() } catch (e) {
    if (campo) assert.ok(e.campos?.some((c) => c.campo === campo), `esperaba error en «${campo}», llegó ${JSON.stringify(e.campos ?? e.message)}`)
    if (codigo) assert.equal(e.codigo, codigo, `esperaba ${codigo}, llegó ${e.codigo}: ${e.message}`)
    if (texto) assert.match(e.message, texto)
    return e
  }
  assert.fail('no lanzó error')
}
const ELEMENTOS = { id: 'Ticket y cliente validados', kyc: 'Validado en SIGDA/TAXON', lote: 'Villa Sol II · Mz. C Lt. 14', pagos: 'Al día', atencion: 'Atención previa en el área', paso: 'Revisión legal del caso' }
const alta = (x) => api.crearTicket({ canal: 'Teléfono', empresaId: 'APV', linea: 'Vivienda', establecimiento: '', clienteId: 'cli-001', prioridad: 'MEDIUM', resumen: 'Caso de prueba', descripcion: 'Registro de prueba.', ...x })

const casos = []
const caso = (nombre, fn) => casos.push([nombre, fn])
const reiniciar = () => { sim.reiniciar(); como(SUPERVISOR) }

// ------------------------------------------------------------------ HU-ATC-026
caso('026 CA-01 un ticket en Eje 2 que recibe carta notarial no se resuelve ni se escala ahí: solo sale a Eje 3 derivándolo', async () => {
  reiniciar(); como(GESTOR)
  const t = await alta({ tipo: 'GAR', subtipo: 'General', resumen: 'Filtración en el techo' })
  assert.equal(tk(t.id).eje, 2, 'el reclamo de garantía queda en Postventa (Eje 2)')
  await api.marcarSenales(t.id, ['CARTA_NOTARIAL'])
  assert.match(gate(t.id, 'ESCALATED'), /Gate no compensable.*Derivar a Eje 3/, '«Escalado» queda deshabilitado con su motivo')
  assert.match(gate(t.id, 'RESOLVED'), /Gate no compensable/)
  await lanza(() => api.cambiarEstado(t.id, 'ESCALATED', null), { codigo: 'gate-conflicto' })
  await lanza(() => api.cambiarEstado(t.id, 'RESOLVED', null), { codigo: 'gate-conflicto' })
  assert.equal(tk(t.id).eje, 2); assert.equal(tk(t.id).area, 'POSTVENTA'); assert.ok(!datos().handoffs.some((h) => h.ticketId === t.id))
  await lanza(() => api.enviarHandoff(t.id, ELEMENTOS), { campo: 'emocional' })
  await api.registrarNotaEmocional(t.id, 'Habla con calma y entrega copia de la carta notarial; pide respuesta por escrito.')
  await api.enviarHandoff(t.id, ELEMENTOS)
  const d = tk(t.id)
  assert.equal(d.eje, 3); assert.equal(d.area, 'LEGAL'); assert.equal(d.estado, 'ESCALATED'); assert.equal(d.responsable, LEGAL)
  assert.ok(datos().handoffs.some((h) => h.ticketId === t.id && Object.keys(h.elementos).length === 6))
})
caso('026 CA-02 con conflicto, resolver, cerrar o el atajo «Escalado» en Eje 1/2 se rechazan como gate no compensable y quedan en la auditoría', async () => {
  reiniciar(); como(GESTOR)
  const t0 = tk('tk-73'); assert.equal(t0.eje, 2); assert.ok(comun.cn(datos(), 'tk-73').includes('ABOGADO'))
  const antes = datos().auditoria.length
  await lanza(() => api.cambiarEstado('tk-73', 'ESCALATED', 'Escalado'), { codigo: 'gate-conflicto', texto: /Gate no compensable/ })
  await lanza(() => api.cambiarEstado('tk-73', 'RESOLVED', null), { codigo: 'gate-conflicto', texto: /Gate no compensable/ })
  assert.equal(datos().auditoria.length, antes + 2, 'cada intento queda en la auditoría')
  const t1 = tk('tk-73'); assert.equal(t1.eje, 2); assert.equal(t1.area, 'POSTVENTA'); assert.equal(t1.estado, t0.estado)
  assert.equal(gate('tk-73', 'CLOSED'), gate('tk-73', 'RESOLVED'), 'cerrar tiene el mismo gate')
})

// ------------------------------------------------------------------ HU-ATC-027
caso('027 CA-01 sin señal, «Escalado» tampoco pasa a Eje 3: solo la derivación con los 6 elementos completos', async () => {
  reiniciar(); como(GESTOR)
  const t = await alta({ tipo: 'QUE', resumen: 'Queja por la atención en caseta' })
  const eje = tk(t.id).eje; assert.notEqual(eje, 3)
  assert.match(gate(t.id, 'ESCALATED'), /paquete mínimo de handoff completo \(6 elementos\)/)
  await lanza(() => api.cambiarEstado(t.id, 'ESCALATED', null), { codigo: 'gate-handoff' })
  assert.equal(tk(t.id).eje, eje); assert.equal(tk(t.id).estado, 'OPEN')
  await lanza(() => api.enviarHandoff(t.id, { ...ELEMENTOS, pagos: '' }), { campo: 'pagos' })
  await lanza(() => api.enviarHandoff(t.id, { ...ELEMENTOS, kyc: '' }), { campo: 'kyc' })
  assert.equal(tk(t.id).eje, eje, 'con el paquete incompleto no se envía')
  await api.enviarHandoff(t.id, ELEMENTOS)
  assert.equal(tk(t.id).eje, 3); assert.equal(tk(t.id).estado, 'ESCALATED'); assert.equal(tk(t.id).area, 'LEGAL')
  const h = datos().handoffs.find((x) => x.ticketId === t.id); assert.equal(Object.keys(h.elementos).length, 6)
  assert.ok(datos().sincLegal.some((s) => s.ticketId === t.id), 'el caso se envía a Legal')
  assert.equal(gate(t.id, 'ESCALATED'), null, 'ya en Eje 3 el gate no aplica')
})
caso('027 CA-03 handoff sin confirmar tras 1 día hábil: el control avisa a la jefatura de Legal una sola vez', async () => {
  reiniciar(); como(GESTOR)
  const t = await alta({ tipo: 'QUE', resumen: 'Queja que pasa a Legal' })
  await api.enviarHandoff(t.id, ELEMENTOS)
  const avisos = () => datos().avisos.filter((a) => a.tipo === 'HANDOFF_SIN_CONFIRMAR' && a.ticketId === t.id)
  sim.ejecutarJob(); assert.equal(avisos().length, 0, 'antes de 1 día hábil no hay aviso')
  sim.avanzar(9)
  assert.equal(avisos().length, 1); assert.equal(avisos()[0].destinatario, JEFATURA_LEGAL)
  assert.match(avisos()[0].mensaje, new RegExp(`${t.numero} lleva más de 1 día hábil sin confirmar`))
  sim.ejecutarJob(); assert.equal(avisos().length, 1, 'el aviso no se repite')
  como(LEGAL); await api.confirmarHandoff(t.id)
  assert.ok(datos().handoffs.find((x) => x.ticketId === t.id).confirmado)
  const semilla = datos().avisos.find((a) => a.tipo === 'HANDOFF_SIN_CONFIRMAR' && a.ticketId === 'tk-423')
  assert.ok(semilla && semilla.destinatario === JEFATURA_LEGAL, 'la semilla trae el aviso de ALT-001214')
})

// ------------------------------------------------------------------ HU-ATC-040
caso('040 CA-02 Legal pone el caso en revisión y luego lo resuelve: el ticket refleja cada estado sin registro manual', async () => {
  reiniciar()
  const s0 = datos().sincLegal.find((s) => s.ticketId === 'tk-423'); assert.equal(s0.estado, 'ENVIADO')
  const filas = datos().filasEstado.length, ahora = datos().ahora
  sim.legalActualiza('tk-423', 'EN_REVISION', null)
  const s1 = datos().sincLegal.find((s) => s.ticketId === 'tk-423')
  assert.equal(s1.estado, 'EN_REVISION'); assert.equal(s1.actualizado.getTime(), ahora.getTime()); assert.equal(s1.resolucion, null)
  assert.equal(tk('tk-423').estado, 'ESCALATED', 'en revisión el ticket sigue abierto en Eje 3')
  assert.equal(datos().filasEstado.length, filas, 'nadie registra nada a mano')
  assert.ok(datos().eventos.some((e) => e.nombre === 'legal_sync' && e.datos.estado === 'EN_REVISION'))
  sim.fuente('LEGAL', true)
  assert.throws(() => sim.legalActualiza('tk-423', 'RESUELTO', 'x'), /sincronizará cuando responda/)
  sim.fuente('LEGAL', false)
  sim.legalActualiza('tk-423', 'RESUELTO', 'Se respondió a INDECOPI.')
  assert.equal(datos().sincLegal.find((s) => s.ticketId === 'tk-423').estado, 'RESUELTO')
  assert.equal(tk('tk-423').estado, 'RESOLVED')
  assert.match(datos().filasEstado.at(-1).nota, /Resuelto por Legal \(LEG-0002\): Se respondió a INDECOPI\./)
})

// ------------------------------------------------------------------ HU-ATC-041
caso('041 CA-02 al superar el umbral, el job alerta a Legal y marca el ticket como prioritario (sin tocar su SLA)', async () => {
  reiniciar()
  const a90 = datos().alertasRiesgo.find((a) => a.ticketId === 'tk-90')
  assert.ok(a90 && a90.total >= 500); assert.equal(a90.prioridadAnterior, 'MEDIUM'); assert.equal(tk('tk-90').prioridad, 'URGENT')
  // tk-73: abogado, sin monto (por estimar) → se registra el reclamo con monto y el job lo evalúa
  const t0 = tk('tk-73'); assert.equal(t0.prioridad, 'MEDIUM'); assert.ok(!datos().alertasRiesgo.some((a) => a.ticketId === 'tk-73'))
  await api.registrarAsiento('tk-73', { tipo: 'RECLAMO', establecimiento: 'Oficina Central Lima', hechos: 'Filtración sin reparar.', pedido: 'Reparación o devolución.', monto: 800, moneda: 'PEN' })
  sim.ejecutarJob()
  const a73 = datos().alertasRiesgo.find((a) => a.ticketId === 'tk-73')
  assert.ok(a73, 'se alertó a Legal'); assert.equal(a73.destinatario, LEGAL); assert.equal(a73.prioridadAnterior, 'MEDIUM')
  const t1 = tk('tk-73')
  assert.equal(t1.prioridad, 'URGENT', 'el ticket queda como prioritario')
  assert.equal(t1.venceResolucion.getTime(), t0.venceResolucion.getTime(), 'el SLA comprometido no cambia')
  // bajo el umbral: sin alerta y sin cambio de prioridad
  const t57 = tk('tk-57'), p57 = t57.prioridad
  await api.registrarAsiento('tk-57', { tipo: 'RECLAMO', establecimiento: 'Oficina Central Lima', hechos: 'Cobro observado.', pedido: 'Devolución.', monto: 100, moneda: 'PEN' })
  sim.ejecutarJob()
  assert.ok(!datos().alertasRiesgo.some((a) => a.ticketId === 'tk-57')); assert.equal(tk('tk-57').prioridad, p57)
  sim.ejecutarJob(); assert.equal(datos().alertasRiesgo.filter((a) => a.ticketId === 'tk-73').length, 1, 'una sola alerta por ticket')
})

let fallos = 0
for (const [nombre, fn] of casos) {
  try { await fn(); console.log(`ok   ${nombre}`) } catch (e) { fallos++; console.log(`FALLA ${nombre}\n     ${e.message}`) }
}
console.log(`\n${casos.length - fallos}/${casos.length} casos en verde`)
process.exit(fallos ? 1 : 0)
