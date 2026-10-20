// Prueba en Node las reglas de Mi Portal (src/portal/modelo.ts) contra el chunk «comun» ya parcheado (artefacto/assets),
// con los datos semilla del prototipo. Un caso por criterio de aceptación de HU-ATC-064, 065 y 066 (PLT-04 v1.3).
// Uso: npm run probar   (antes: npm run build, para que comun lleve el núcleo de Mi Portal). Node ≥ 22.18 (tipos de TS sin compilar).
import assert from 'node:assert/strict'

// lo mínimo del navegador que el chunk toca al cargarse
globalThis.location = { hash: '' }
globalThis.addEventListener = () => {}
globalThis.removeEventListener = () => {}

const comun = await import('../artefacto/assets/comun-CVU2GQ4h.js')
const M = await import('../src/portal/modelo.ts')
const n = comun.__ptNucleo
assert.ok(n, 'comun no exporta __ptNucleo: corre «npm run build» (parchear) antes de probar')

const casos = []
const caso = (nombre, fn) => casos.push([nombre, fn])
const d0 = n.datos()
const cli = (id) => comun.Kn(id)
const primero = (estado) => d0.tickets.find((t) => t.estado === estado && t.clienteId.startsWith('cli-0'))
const espera = primero('PENDING_CUSTOMER'), resuelto = primero('RESOLVED')
const lanza = (fn, campo) => { try { fn() } catch (e) { if (campo) assert.ok(e.campos?.some((c) => c.campo === campo), `esperaba error en «${campo}», llegó ${JSON.stringify(e.campos ?? e.message)}`); return e } assert.fail('no lanzó error') }

// ------------------------------------------------------------------ HU-ATC-064
const ana = cli(espera.clienteId), lote = comun.Ut(ana)[0]
const entrada = { loteId: lote.id, tipo: 'CTA', subtipo: 'Pago no reflejado', descripcion: 'Pagué la cuota de octubre en el agente y no aparece en mi estado de cuenta.', adjuntos: [{ nombre: 'voucher.pdf', tamano: 120_000, tipo: 'application/pdf' }] }
let creado
caso('064 CA-01 registro guiado: canal Mi Portal, número y fecha de compromiso según el flujo', () => {
  const [d, r] = M.crearTicket(n, d0, ana, lote, entrada)
  creado = { d, ...r }
  assert.equal(r.ticket.canal, 'Mi Portal')
  assert.match(r.ticket.numero, /^[A-Z]{3}-\d{6}$/)
  assert.equal(r.ticket.subtipo, 'Pago no reflejado')
  assert.ok(n.compromiso(r.ticket) > d0.ahora, 'la fecha de compromiso es futura')
  const flujo = n.flujo(d, 'CTA')
  assert.ok(flujo, 'CTA tiene flujo en la semilla')
  assert.equal(r.resultado, 'asignado'); assert.equal(r.ticket.responsable, flujo.pasos[0].responsable)
  assert.ok(d.eventos.some((e) => e.nombre === 'ticket_creado' && e.datos.canal === 'mi_portal' && e.datos.subtipo === 'Pago no reflejado'))
  assert.ok(d.interacciones.some((i) => i.ticketId === r.ticket.id && i.tipo === 'cliente' && i.adjuntos.length === 1))
})
caso('064 CA-02 mis tickets: solo los del cliente, del más reciente al más antiguo', () => {
  const lista = M.ticketsDelCliente(creado.d, ana.id)
  assert.ok(lista.length >= 2 && lista.every((t) => t.clienteId === ana.id))
  assert.equal(lista[0].id, creado.ticket.id)
  for (let i = 1; i < lista.length; i++) assert.ok(lista[i - 1].abierto >= lista[i].abierto)
})
caso('064 CA-03 datos del cliente desde el maestro, sin registro paralelo', () => {
  assert.equal(creado.ticket.clienteId, ana.id)
  assert.equal(comun.Un.length, 40, 'el maestro de clientes no cambia')
  assert.equal(creado.d.registrosParalelos.length, d0.registrosParalelos.length)
})
caso('064 CA-04 reclamo o queja: no se crea ticket común', () => {
  for (const tipo of ['REC', 'QUE']) {
    lanza(() => M.crearTicket(n, d0, ana, lote, { ...entrada, tipo, subtipo: '' }), 'tipo')
  }
  assert.ok(M.TIPOS.find((t) => t.id === 'REC').libro && M.TIPOS.find((t) => t.id === 'QUE').libro)
})
caso('064 CA-05 adjunto de más de 10 MB o de formato no admitido: se rechaza', () => {
  lanza(() => M.crearTicket(n, d0, ana, lote, { ...entrada, adjuntos: [{ nombre: 'video.mov', tamano: 11 * 1024 * 1024, tipo: 'video/quicktime' }] }), 'adjuntos')
  lanza(() => M.crearTicket(n, d0, ana, lote, { ...entrada, adjuntos: [{ nombre: 'grande.pdf', tamano: 10 * 1024 * 1024 + 1, tipo: 'application/pdf' }] }), 'adjuntos')
})

// ------------------------------------------------------------------ HU-ATC-065
caso('065 CA-01 línea de tiempo: cada paso con fecha, área y en el orden de la bitácora', () => {
  const pasos = M.lineaDeTiempo(d0, espera, comun.mr)
  const filas = d0.filasEstado.filter((f) => f.ticketId === espera.id)
  const deEstado = pasos.filter((p) => filas.some((f) => f.id === p.id))
  assert.deepEqual(deEstado.map((p) => p.id), filas.map((f) => f.id))
  assert.ok(pasos.every((p) => p.fecha instanceof Date && p.area))
  for (let i = 1; i < pasos.length; i++) assert.ok(pasos[i - 1].fecha <= pasos[i].fecha)
})
caso('065 CA-02 aviso por correo y WhatsApp en cada cambio de estado, con enlace', () => {
  const av = M.avisos(d0, espera, ana, '#/portal/ticket/x')
  assert.equal(av.length, d0.filasEstado.filter((f) => f.ticketId === espera.id && f.de).length)
  assert.ok(av.every((a) => a.canales.join() === 'Correo,WhatsApp' && a.enlace))
})
caso('065 CA-03 sin notas internas ni nombre del gestor', () => {
  const conNota = d0.tickets.find((t) => d0.interacciones.some((i) => i.ticketId === t.id && !i.visible))
  const msgs = M.mensajes(d0, conNota)
  assert.ok(msgs.every((m) => m.visible))
  const nombres = comun.br.map((p) => p.nombre)
  const texto = JSON.stringify([M.lineaDeTiempo(d0, conNota, comun.mr), msgs.map((m) => m.quien)])
  assert.ok(!nombres.some((nm) => texto.includes(nm)), 'no aparece ningún nombre de gestor')
  const notaInterna = d0.filasEstado.find((f) => f.ticketId === espera.id && f.nota && f.autor !== M.AUTOR_CLIENTE)
  if (notaInterna) assert.ok(!texto.includes(notaInterna.nota))
})
caso('065 CA-04 ticket de otro cliente: no se muestra y queda en la bitácora', () => {
  const ajeno = d0.tickets.find((t) => t.clienteId !== ana.id)
  assert.equal(M.ticketDelCliente(d0, ana.id, ajeno.id), null)
  const antes = n.datos().auditoria.length
  M.registrarIntentoAjeno(n, ajeno.id, ana.id)
  const despues = n.datos().auditoria
  assert.equal(despues.length, antes + 1)
  assert.match(despues.at(-1).detalle, /no es suyo/)
})

// ------------------------------------------------------------------ HU-ATC-066
caso('066 CA-01 responder: interacción visible del cliente y vuelve a «en atención»', () => {
  const [d] = M.responder(n, d0, espera.id, ana.id, 'La visita fue el 8 de octubre a las 10:00.', [{ nombre: 'foto.jpg', tamano: 900_000, tipo: 'image/jpeg' }])
  const t = d.tickets.find((x) => x.id === espera.id)
  assert.equal(t.estado, 'IN_PROGRESS')
  const i = d.interacciones.at(-1)
  assert.ok(i.visible && i.tipo === 'cliente' && i.canal === 'Mi Portal' && i.adjuntos.length === 1)
  assert.equal(d.filasEstado.filter((f) => f.ticketId === espera.id).at(-1).autor, M.AUTOR_CLIENTE)
  lanza(() => M.responder(n, d, espera.id, ana.id, 'otra vez', []))  // ya no está pendiente del cliente
})
caso('066 CA-02 confirmar: cerrado con cierre formal y encuesta disparada', () => {
  const [d] = M.confirmar(n, d0, resuelto.id, resuelto.clienteId)
  const t = d.tickets.find((x) => x.id === resuelto.id)
  assert.equal(t.estado, 'CLOSED'); assert.ok(t.cierre)
  assert.ok(d.encuestas.some((e) => e.ticketId === t.id && e.ciclo === t.reaperturas && !e.respuesta))
  assert.match(d.filasEstado.at(-1).nota, /Cierre formal/)
})
caso('066 CA-03 rechazar con motivo: se reabre, sigue en su área y el motivo queda en la bitácora', () => {
  lanza(() => M.rechazar(n, d0, resuelto.id, resuelto.clienteId, 'no'), 'motivo')
  const motivo = 'La copia que me enviaron no tiene la firma del notario.'
  const [d] = M.rechazar(n, d0, resuelto.id, resuelto.clienteId, motivo)
  const t = d.tickets.find((x) => x.id === resuelto.id)
  assert.equal(t.estado, 'REOPENED'); assert.equal(t.area, resuelto.area); assert.equal(t.reaperturas, resuelto.reaperturas + 1)
  const fila = d.filasEstado.filter((f) => f.ticketId === t.id).at(-1)
  assert.equal(fila.nota, motivo); assert.equal(fila.autor, M.AUTOR_CLIENTE)
})
caso('066 CA-04 sin respuesta: cierre automático (simulado) y aviso al cliente', () => {
  assert.ok(M.cierreAutomaticoDesde(n, resuelto) > resuelto.ultimaResolucion)
  const [d] = M.cerrarSinRespuesta(n, d0, resuelto.id, resuelto.clienteId)
  const t = d.tickets.find((x) => x.id === resuelto.id)
  assert.equal(t.estado, 'CLOSED')
  const av = M.avisos(d, t, cli(t.clienteId), '#')
  assert.match(av[0].texto, /automáticamente/)
})
caso('acceso: DNI de 8 dígitos y cliente del maestro', () => {
  assert.ok(M.validarDni('123'))
  assert.equal(M.validarDni(ana.dni), null)
  assert.equal(M.buscarPorDni(comun.Un, ana.dni).id, ana.id)
  assert.equal(M.buscarPorDni(comun.Un, '00000000'), null)
  assert.match(M.nuevoCodigo(), /^\d{6}$/)
})

let fallos = 0
for (const [nombre, fn] of casos) {
  try { fn(); console.log(`ok   ${nombre}`) } catch (e) { fallos++; console.log(`FALLA ${nombre}\n     ${e.message}`) }
}
console.log(`\n${casos.length - fallos}/${casos.length} casos en verde`)
process.exit(fallos ? 1 : 0)
