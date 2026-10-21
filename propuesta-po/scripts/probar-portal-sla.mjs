// Prueba en Node la HU-ATC-066 (Mi Portal, PLT-04 v1.3) en lo que cambió en el bloque 3: CA-01 (el SLA se pausa en «pendiente
// del cliente» y se reanuda al responder) y CA-04 (cierre automático por el job del sistema con los días hábiles que configura el
// administrador funcional). CA-02 y CA-03 siguen en probar-portal.mjs; aquí se comprueba que la pausa no los rompe.
// Contra el chunk «comun» ya parcheado (artefacto/assets) y las reglas de Mi Portal (src/portal/modelo.ts), con la semilla.
// Uso: node scripts/probar-portal-sla.mjs   (antes: npm run build). Node ≥ 22.18.
import assert from 'node:assert/strict'

globalThis.location = { hash: '' }
globalThis.addEventListener = () => {}
globalThis.removeEventListener = () => {}

const comun = await import('../artefacto/assets/comun-CVU2GQ4h.js')
const M = await import('../src/portal/modelo.ts')
const api = comun.E, sim = comun.O, n = comun.__ptNucleo
const datos = () => n.datos()
const como = (personaId) => sim.ajustar({ personaId })
const tk = (id) => datos().tickets.find((t) => t.id === id)
const SUPERVISOR = 'p-gnunez', GESTOR = 'p-crojas', ADMIN = comun.br.find((p) => p.rol === 'ADMIN_FUNCIONAL').id
const ESPERA = 'tk-272', RESUELTO = 'tk-308'          // Ana (pendiente del cliente) y Pedro (resuelto por confirmar) de la semilla
const reiniciar = () => { sim.reiniciar(); como(SUPERVISOR) }
const nivel = (t) => n.nivelSla(t, datos().ahora)
const horasHasta = (fecha) => { let h = 0; while (n.sumarHorasHabiles(datos().ahora, h) < fecha) h++; return h }   // horas hábiles enteras
const lanza = async (fn, { campo, codigo } = {}) => {
  try { await fn() } catch (e) {
    if (campo) assert.ok(e.campos?.some((c) => c.campo === campo), `esperaba error en «${campo}», llegó ${JSON.stringify(e.campos ?? e.message)}`)
    if (codigo) assert.equal(e.codigo, codigo, `esperaba ${codigo}, llegó ${e.codigo}: ${e.message}`)
    return e
  }
  assert.fail('no lanzó error')
}

const casos = []
const caso = (nombre, fn) => casos.push([nombre, fn])

// ------------------------------------------------------------------ CA-01
caso('066 CA-01 en «pendiente del cliente» el SLA está en pausa: no vence ni alerta aunque pase su vencimiento original', async () => {
  reiniciar()
  const t0 = tk(ESPERA)
  assert.equal(t0.estado, 'PENDING_CUSTOMER'); assert.ok(t0.pausaSla instanceof Date, 'la semilla anota desde cuándo espera')
  const original = n.compromiso(t0)
  sim.avanzar(horasHasta(original) + 4)                           // el reloj pasa el vencimiento original (corre el job)
  const t = tk(ESPERA)
  assert.ok(datos().ahora > original)
  assert.notEqual(nivel(t).nivel, 'vencido'); assert.ok(nivel(t).vence > datos().ahora, 'el vencimiento se corre mientras espera')
  assert.ok(!datos().alertas.some((a) => a.ticketId === ESPERA), 'el job de alertas no alerta un SLA en pausa')
})
caso('066 CA-01 al responder: interacción visible, vuelve a «en atención» y el SLA se reanuda (el vencimiento se corre lo que duró la espera)', async () => {
  reiniciar()
  sim.avanzar(18)                                                  // dos días hábiles más de espera
  const antes = tk(ESPERA), vence = n.compromiso(antes), desde = antes.pausaSla
  await n.tx('responder desde Mi Portal', (d) => M.responder(n, d, ESPERA, antes.clienteId, 'Fue el 8 de octubre a las 10:00.', [{ nombre: 'foto.jpg', tamano: 900_000, tipo: 'image/jpeg' }]))
  const t = tk(ESPERA), p = t.pausasSla.at(-1)
  assert.equal(t.estado, 'IN_PROGRESS'); assert.equal(t.pausaSla, null)
  assert.ok(datos().interacciones.some((i) => i.ticketId === ESPERA && i.visible && i.tipo === 'cliente' && i.adjuntos.length === 1))
  assert.equal(p.desde.getTime(), desde.getTime()); assert.equal(p.hasta.getTime(), datos().ahora.getTime()); assert.ok(p.horas > 18)
  assert.equal(n.sumarHorasHabiles(p.desde, p.horas).getTime(), p.hasta.getTime(), 'las horas de la pausa son horas hábiles')
  assert.equal(n.compromiso(t).getTime(), n.sumarHorasHabiles(vence, p.horas).getTime(), 'la fecha de compromiso se corre las horas en espera')
  assert.equal(nivel(t).nivel, 'en-plazo'); assert.equal(nivel(t).vence.getTime(), n.compromiso(t).getTime())
  // ya reanudado, el reloj vuelve a correr: pasado el nuevo vencimiento, vence y el job alerta
  sim.avanzar(horasHasta(n.compromiso(t)) + 2)
  assert.equal(nivel(tk(ESPERA)).nivel, 'vencido')
  assert.ok(datos().alertas.some((a) => a.ticketId === ESPERA && a.tipo === 'RESOLUTION_OVERDUE'))
  // Mi Portal lo cuenta en la línea de tiempo
  const paso = M.lineaDeTiempo(datos(), tk(ESPERA), comun.mr).find((x) => x.titulo === 'En atención' && /reanudó/.test(x.detalle ?? ''))
  assert.ok(paso, 'la línea de tiempo dice que el plazo se reanudó')
})
caso('066 CA-01 en la consola, la misma regla: el gestor lo pone en espera y lo retoma (V de «comun»)', async () => {
  reiniciar(); como(GESTOR)
  const id = datos().tickets.find((t) => t.estado === 'OPEN' && t.responsable === GESTOR && !t.pausasSla)?.id
  assert.ok(id, 'hay un ticket abierto de la gestora')
  const vence = n.compromiso(tk(id))
  await api.cambiarEstado(id, 'PENDING_CUSTOMER', 'Se pidió el voucher.')
  assert.ok(tk(id).pausaSla)
  sim.avanzar(9); como(GESTOR)
  await api.cambiarEstado(id, 'IN_PROGRESS', null)
  const t = tk(id)
  assert.equal(t.pausasSla.length, 1); assert.equal(t.pausasSla[0].horas, 9)
  assert.equal(n.compromiso(t).getTime(), n.sumarHorasHabiles(vence, 9).getTime())
})
caso('066 CA-02 y CA-03 siguen igual con la pausa (confirmar cierra con encuesta; rechazar reabre con su motivo)', async () => {
  reiniciar()
  const r = tk(RESUELTO)
  const [d1] = M.confirmar(n, datos(), RESUELTO, r.clienteId)
  assert.equal(d1.tickets.find((t) => t.id === RESUELTO).estado, 'CLOSED')
  assert.ok(d1.encuestas.some((e) => e.ticketId === RESUELTO))
  const [d2] = M.rechazar(n, datos(), RESUELTO, r.clienteId, 'La copia no tiene la firma del notario.')
  assert.equal(d2.tickets.find((t) => t.id === RESUELTO).estado, 'REOPENED')
})

// ------------------------------------------------------------------ CA-04
caso('066 CA-04 el job no cierra antes del plazo; al pasar los días hábiles configurados lo cierra y el cliente recibe el aviso', async () => {
  reiniciar()
  assert.equal(n.diasConfirmacion(datos()), 5, 'valor inicial: 5 días hábiles (supuesto del equipo)')
  const r = tk(RESUELTO), limite = M.cierreAutomaticoDesde(n, r)
  assert.equal(limite.getTime(), n.sumarDiasHabiles(r.ultimaResolucion, 5).getTime())
  const r0 = sim.ejecutarJob()
  assert.equal(r0.cierres.cerrados, 0); assert.equal(tk(RESUELTO).estado, 'RESOLVED')
  assert.match(comun.D(r0), /Cierre automático: 0 tickets resueltos sin respuesta del cliente en 5 días hábiles/)
  sim.avanzar(horasHasta(limite) - 1)                              // aún dentro del plazo
  assert.equal(tk(RESUELTO).estado, 'RESOLVED')
  sim.avanzar(9)                                                   // +1 día hábil: el plazo terminó y corre el job
  const t = tk(RESUELTO), f = datos().filasEstado.filter((x) => x.ticketId === RESUELTO).at(-1)
  assert.equal(t.estado, 'CLOSED')
  assert.equal(f.autor, null); assert.equal(f.nota, 'Cierre automático: sin respuesta del cliente en 5 días hábiles')
  assert.ok(datos().eventos.some((e) => e.nombre === 'portal_cierre' && e.datos.resultado === 'automatico'))
  assert.ok(datos().encuestas.some((e) => e.ticketId === RESUELTO), 'el cierre dispara la encuesta, como todo cierre')
  const av = M.avisos(datos(), t, comun.Kn(t.clienteId), '#')
  assert.match(av[0].texto, /«Cerrado»\. Se cerró automáticamente\./)
  assert.ok(M.lineaDeTiempo(datos(), t, comun.mr).some((p) => p.detalle === 'Se cerró solo: no hubo respuesta en 5 días hábiles.'))
})
caso('066 CA-04 el administrador funcional configura los días hábiles; el job usa el valor configurado', async () => {
  reiniciar()
  await lanza(() => api.fijarDiasConfirmacion(3), { codigo: 'sin-permiso' })          // el supervisor no configura
  como(ADMIN)
  await lanza(() => api.fijarDiasConfirmacion(0), { campo: 'dias' })
  await lanza(() => api.fijarDiasConfirmacion(2.5), { campo: 'dias' })
  await api.fijarDiasConfirmacion(2)
  assert.equal(n.diasConfirmacion(datos()), 2)
  const cambio = datos().parametros.diasConfirmacionCambio
  assert.equal(cambio.autor, ADMIN); assert.equal(cambio.antes, 5)
  assert.ok(datos().auditoria.some((a) => a.actor === ADMIN && /5 → 2/.test(a.detalle)), 'el cambio queda en la auditoría')
  const r = tk(RESUELTO), limite = M.cierreAutomaticoDesde(n, r)
  assert.equal(limite.getTime(), n.sumarDiasHabiles(r.ultimaResolucion, 2).getTime())
  sim.avanzar(horasHasta(limite) + 1)
  assert.equal(tk(RESUELTO).estado, 'CLOSED')
  assert.match(datos().filasEstado.filter((x) => x.ticketId === RESUELTO).at(-1).nota, /en 2 días hábiles/)
})
caso('066 CA-04 un cierre que el gestor registra no se anuncia como automático', async () => {
  reiniciar(); como(GESTOR)
  const r = tk(RESUELTO)
  como(SUPERVISOR); await api.cambiarEstado(RESUELTO, 'CLOSED', 'El cliente confirmó por teléfono.')
  const av = M.avisos(datos(), tk(RESUELTO), comun.Kn(r.clienteId), '#')
  assert.doesNotMatch(av[0].texto, /automáticamente/)
})

let fallos = 0
for (const [nombre, fn] of casos) {
  try { await fn(); console.log(`ok   ${nombre}`) } catch (e) { fallos++; console.log(`FALLA ${nombre}\n     ${e.message}`) }
}
console.log(`\n${casos.length - fallos}/${casos.length} casos en verde`)
process.exit(fallos ? 1 : 0)
