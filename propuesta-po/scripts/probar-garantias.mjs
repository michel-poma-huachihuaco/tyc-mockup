// Prueba en Node las reglas de garantías postventa (HU-ATC-034, 035 y 036, PLT-04 v1.3) contra el chunk «comun» ya parcheado
// (artefacto/assets), con los datos semilla del prototipo y la misma API que usa la consola (E = fachada, O = simulación).
// Uso: node scripts/probar-garantias.mjs   (antes: node scripts/parchear.mjs). Node ≥ 22.
import assert from 'node:assert/strict'

globalThis.location = { hash: '' }
globalThis.addEventListener = () => {}
globalThis.removeEventListener = () => {}

const comun = await import('../artefacto/assets/comun-CVU2GQ4h.js')
const api = comun.E, sim = comun.O, n = comun.__ptNucleo
const datos = () => n.datos()
const como = (personaId) => sim.ajustar({ personaId })
const SUPERVISOR = 'p-gnunez', POSTVENTA = 'p-lccahuana', GESTOR = 'p-crojas', LEGAL = 'p-pvilchez'
const gar = (codigo) => datos().garantias.find((g) => g.codigo === codigo)
const filas = (id) => datos().filasGarantia.filter((f) => f.garantiaId === id)
const senales = (ticketId) => comun.cn(datos(), ticketId)
const ev = (nombre) => datos().eventos.filter((e) => e.nombre === nombre)
const lanza = async (fn, { campo, codigo } = {}) => {
  try { await fn() } catch (e) {
    if (campo) assert.ok(e.campos?.some((c) => c.campo === campo), `esperaba error en «${campo}», llegó ${JSON.stringify(e.campos ?? e.message)}`)
    if (codigo) assert.equal(e.codigo, codigo, `esperaba ${codigo}, llegó ${e.codigo}: ${e.message}`)
    return e
  }
  assert.fail('no lanzó error')
}
const archivo = (nombre, tamano = 200_000) => ({ nombre, tamano, sha256: nombre.padEnd(64, '0').slice(0, 64) })
const ELEMENTOS = { id: 'APV · cliente validado · ticket de garantía', kyc: 'Validado en SIGDA/TAXON', lote: 'Villa Sol II · Mz. C Lt. 14', pagos: 'Al día', atencion: 'Reclamo de garantía GAR-0089 con carta notarial', paso: 'Revisión legal de la carta notarial' }

const casos = []
const caso = (nombre, fn) => casos.push([nombre, fn])
const reiniciar = () => { sim.reiniciar(); como(SUPERVISOR) }

// ------------------------------------------------------------------ HU-ATC-034
caso('034 CA-01 se valida la fecha contra la cobertura y la entrega antes de admitir', async () => {
  reiniciar()
  const ok = await api.registrarGarantia({ entregaId: 'ACT-0412', tipo: 'ACABADOS', descripcion: 'Puerta del baño desnivelada.', ticketId: '', reclamada: new Date(2026, 9, 10) })
  assert.equal(ok.estado, 'UNDER_REVIEW'); assert.equal(ok.motivoNoProcede, null)
  assert.ok(!datos().notificaciones.some((x) => x.id === `no-${ok.id}`), 'dentro de cobertura no hay aviso de no procedente')
  await lanza(() => api.registrarGarantia({ entregaId: 'ACT-0455', tipo: 'ACABADOS', descripcion: 'x', ticketId: '', reclamada: new Date(2026, 0, 5) }), { campo: 'fecha' })
})
caso('034 CA-02 fuera de cobertura: no procedente por vigencia y el motivo se informa al cliente', async () => {
  reiniciar()
  const g = await api.registrarGarantia({ entregaId: 'ACT-0388', tipo: 'ACABADOS', descripcion: 'Zócalos sueltos.', ticketId: '', reclamada: new Date(2026, 9, 14) })
  assert.equal(g.estado, 'NOT_ELIGIBLE'); assert.match(g.motivoNoProcede, /venció el/)
  const aviso = datos().notificaciones.find((x) => x.id === `no-${g.id}`)
  assert.ok(aviso, 'hay aviso al cliente')
  assert.equal(aviso.para, 'cliente:cli-035')
  assert.ok(aviso.mensaje.includes(g.motivoNoProcede) && aviso.mensaje.includes(g.codigo) && aviso.mensaje.includes('WhatsApp'))
  const f = filas(g.id).find((x) => x.evento === 'MOTIVO_INFORMADO')
  assert.ok(f && f.detalle === 'WhatsApp' && f.autor === 'Sistema')
  assert.ok(ev('garantía_no_procedente').length >= 1)
})
caso('034 CA-02 con WhatsApp caído el aviso sale por correo', async () => {
  reiniciar(); sim.fuente('WHATSAPP', true)
  const g = await api.registrarGarantia({ entregaId: 'ACT-0388', tipo: 'INSTALACIONES', descripcion: 'Tomacorriente sin línea.', ticketId: '', reclamada: new Date(2026, 9, 14) })
  assert.equal(filas(g.id).find((x) => x.evento === 'MOTIVO_INFORMADO').detalle, 'Correo')
  sim.fuente('WHATSAPP', false)
})
caso('034 CA-02 la semilla: GAR-0087 ya tiene su aviso y los ids no se movieron', () => {
  reiniciar()
  const g = gar('GAR-0087')
  assert.equal(g.id, 'gar-249'); assert.equal(gar('GAR-0088').id, 'gar-314'); assert.equal(gar('GAR-0089').id, 'gar-585')
  assert.ok(datos().notificaciones.some((x) => x.id === 'no-gar-249' && x.para === 'cliente:cli-035'))
  assert.ok(filas('gar-249').some((x) => x.evento === 'MOTIVO_INFORMADO'))
})

// ------------------------------------------------------------------ HU-ATC-035
caso('035 CA-01 programar e informe con varias fotos y un PDF; sin foto no se registra', async () => {
  reiniciar()
  const g = gar('GAR-0089')
  await lanza(() => api.resolverGarantia(g.id, 'APPROVED', 'x'), { codigo: 'sin-inspeccion' })
  await api.programarInspeccion(g.id, new Date(2026, 9, 17))
  assert.ok(gar('GAR-0089').inspeccion.programada)
  await lanza(() => api.registrarInspeccion(g.id, { informe: 'Grietas de 1 mm.', evidencias: [archivo('informe.pdf')] }), { campo: 'fotos' })
  await lanza(() => api.registrarInspeccion(g.id, { informe: 'Grietas de 1 mm.', evidencias: [archivo('foto.jpg'), archivo('video.mp4')] }), { campo: 'fotos' })
  await lanza(() => api.registrarInspeccion(g.id, { informe: 'Grietas de 1 mm.', evidencias: [archivo('foto.jpg', 10 * 1024 * 1024 + 1)] }), { campo: 'fotos' })
  await lanza(() => api.registrarInspeccion(g.id, { informe: 'Grietas de 1 mm.', evidencias: ['a', 'b', 'c', 'd', 'e', 'f'].map((x) => archivo(`${x}.jpg`)) }), { campo: 'fotos' })
  await lanza(() => api.registrarInspeccion(g.id, { informe: ' ', evidencias: [archivo('foto.jpg')] }), { campo: 'informe' })
  await api.registrarInspeccion(g.id, { informe: 'Grietas de 1 mm en la losa.', evidencias: [archivo('informe-losa.pdf'), archivo('foto-1.jpg'), archivo('foto-2.PNG')] })
  const i = gar('GAR-0089').inspeccion
  assert.equal(i.evidencias.length, 3); assert.ok(i.registrada)
  assert.equal(filas(g.id).at(-1).detalle, '3 archivos')
  assert.equal(ev('inspección_registrada').at(-1).datos.evidencias, 3)
})
caso('035 CA-02 inspeccionado: se resuelve con fecha y descripción', async () => {
  reiniciar()
  const g = gar('GAR-0088')
  await api.resolverGarantia(g.id, 'APPROVED', 'Se cambia la terma y el térmico del tablero.')
  const r = gar('GAR-0088')
  assert.equal(r.estado, 'APPROVED'); assert.ok(r.resolucion.fecha instanceof Date && r.resolucion.descripcion)
})

// ------------------------------------------------------------------ HU-ATC-036
caso('036 CA-01 reclamo sin ticket: hay que vincular un ticket de garantía del mismo cliente', async () => {
  reiniciar()
  const g = gar('GAR-0089')  // cli-001, sin ticket
  await lanza(() => api.registrarCartaNotarial(g.id, ''), { campo: 'ticket' })
  const ajeno = datos().tickets.find((t) => t.tipo === 'GAR' && t.clienteId !== 'cli-001')
  await lanza(() => api.registrarCartaNotarial(g.id, ajeno.id), { campo: 'ticket' })
  como(GESTOR); await lanza(() => api.registrarCartaNotarial(g.id, ajeno.id), { codigo: 'sin-permiso' }); como(SUPERVISOR)
  await lanza(() => api.registrarCartaNotarial(gar('GAR-0087').id, ajeno.id), { codigo: 'estado-invalido' })
})
caso('036 CA-01 carta notarial: vincula el ticket, activa la señal y no se resuelve en Eje 2', async () => {
  reiniciar()
  const g = gar('GAR-0089')
  const tk = await api.crearTicket({ canal: 'Teléfono', empresaId: 'APV', linea: 'Vivienda', establecimiento: '', clienteId: 'cli-001', tipo: 'GAR', prioridad: 'MEDIUM', resumen: 'Grietas en la losa del patio posterior', descripcion: 'Reporta grietas en la losa.' })
  await api.registrarCartaNotarial(g.id, tk.id)
  const r = gar('GAR-0089')
  assert.equal(r.ticketId, tk.id)
  assert.deepEqual(senales(tk.id), ['CARTA_NOTARIAL'])
  assert.deepEqual(filas(g.id).slice(-2).map((f) => f.evento), ['TICKET_VINCULADO', 'CARTA_NOTARIAL'])
  assert.ok(ev('gate_conflicto').some((e) => e.datos.senal === 'CARTA_NOTARIAL'))
  assert.equal(comun.rt(datos(), r), true, 'la señal del ticket vinculado bloquea el reclamo')
  await lanza(() => api.registrarCartaNotarial(g.id, ''), { codigo: 'ya-marcada' })
  await api.programarInspeccion(g.id, new Date(2026, 9, 17))
  await api.registrarInspeccion(g.id, { informe: 'Grietas de 1 mm.', evidencias: [archivo('foto.jpg')] })
  const antes = datos().auditoria.length
  await lanza(() => api.resolverGarantia(g.id, 'APPROVED', 'Reparar la losa.'), { codigo: 'gate-conflicto' })
  assert.equal(datos().auditoria.length, antes + 1, 'el intento queda en la auditoría')
  assert.equal(gar('GAR-0089').estado, 'UNDER_REVIEW')
})
caso('036 CA-01 se deriva a Eje 3 por el gate (nota emocional + paquete mínimo) y sigue sin resolverse en Postventa', async () => {
  reiniciar()
  const g = gar('GAR-0089')
  const tk = await api.crearTicket({ canal: 'Teléfono', empresaId: 'APV', linea: 'Vivienda', establecimiento: '', clienteId: 'cli-001', tipo: 'GAR', prioridad: 'MEDIUM', resumen: 'Grietas en la losa', descripcion: 'Reporta grietas.' })
  await api.registrarCartaNotarial(g.id, tk.id)
  await lanza(() => api.enviarHandoff(tk.id, ELEMENTOS), { campo: 'emocional' })
  await api.registrarNotaEmocional(tk.id, 'Habla con calma y entrega copia de la carta notarial; pide respuesta por escrito.')
  await api.enviarHandoff(tk.id, ELEMENTOS)
  const t = datos().tickets.find((x) => x.id === tk.id)
  assert.equal(t.eje, 3); assert.equal(t.area, 'LEGAL')
  assert.ok(datos().handoffs.some((h) => h.ticketId === tk.id && Object.keys(h.elementos).length === 6))
  await api.programarInspeccion(g.id, new Date(2026, 9, 17))
  await api.registrarInspeccion(g.id, { informe: 'Grietas de 1 mm.', evidencias: [archivo('foto.jpg')] })
  await lanza(() => api.resolverGarantia(g.id, 'APPROVED', 'x'), { codigo: 'gate-conflicto' })  // cambio 036-E
  como(LEGAL); await api.cambiarEstado(tk.id, 'RESOLVED', 'Respuesta notarial enviada por Legal.'); como(SUPERVISOR)
  await api.resolverGarantia(g.id, 'REJECTED', 'Legal respondió la carta; Postventa registra el resultado.')
  assert.equal(gar('GAR-0089').estado, 'REJECTED')
})
caso('036 CA-01 reclamo con ticket (GAR-0085): marca la carta en su ticket sin pedir otro', async () => {
  reiniciar()
  const g = gar('GAR-0085')
  await api.registrarCartaNotarial(g.id, '')
  assert.ok(senales(g.ticketId).includes('CARTA_NOTARIAL'))
  assert.ok(!filas(g.id).some((f) => f.evento === 'TICKET_VINCULADO'))
})

let fallos = 0
for (const [nombre, fn] of casos) {
  try { await fn(); console.log(`ok   ${nombre}`) } catch (e) { fallos++; console.log(`FALLA ${nombre}\n     ${e.message}`) }
}
console.log(`\n${casos.length - fallos}/${casos.length} casos en verde`)
process.exit(fallos ? 1 : 0)
