// Prueba en Node la HU-ATC-043 (flujo por tipo, subtipo y área; PLT-04 v1.3) contra el chunk «comun» ya parcheado
// (artefacto/assets), con la semilla del prototipo. Un caso por criterio de aceptación, con las mismas funciones que usa la
// consola (__h43, sufijo de comun: scripts/hu043-modelo.js).
// Uso: node scripts/probar-flujos.mjs   (antes: node scripts/parchear.mjs). Node ≥ 22.
import assert from 'node:assert/strict'

globalThis.location = { hash: '' }
globalThis.addEventListener = () => {}
globalThis.removeEventListener = () => {}

const comun = await import('../artefacto/assets/comun-CVU2GQ4h.js')
const f = comun.__h43, n = comun.__ptNucleo
assert.ok(f, 'comun no exporta __h43: corre «npm run build» (parchear) antes de probar')

const casos = []
const caso = (nombre, fn) => casos.push([nombre, fn])
const lanza = (fn, campoOCodigo) => {
  try { fn() } catch (e) {
    if (campoOCodigo) assert.ok(e.campos?.some((c) => c.campo === campoOCodigo) || e.codigo === campoOCodigo, `esperaba «${campoOCodigo}», llegó ${JSON.stringify(e.campos?.length ? e.campos : e.codigo)}`)
    return e
  }
  assert.fail('no lanzó error')
}
const d0 = n.datos()
const ADMIN = 'p-aperez', GESTOR = 'p-crojas'
const horas = (desde, h) => n.sumarHorasHabiles(desde, h)
const cliente = d0.tickets.find((t) => t.clienteId.startsWith('cli-0')).clienteId
// Datos del CA-01: tipo «Reclamo», subtipo «Garantía postventa»; el resto son los campos obligatorios del alta
const alta = (x = {}) => ({ canal: 'Teléfono', clienteId: cliente, empresaId: 'AIN', linea: 'Vivienda', establecimiento: '', tipo: 'REC', subtipo: 'Garantía postventa', prioridad: 'MEDIUM', resumen: 'Reclamo de garantía postventa', descripcion: 'Registro de prueba del flujo.', ...x })
const ACTIVIDADES = [{ nombre: 'Inspección', responsable: 'p-omedina', slaH: 8 }, { nombre: 'Informe técnico', responsable: 'p-omedina', slaH: 16 }, { nombre: 'Respuesta al cliente', responsable: 'p-lccahuana', slaH: 8 }]
const FLUJO = { tipo: 'REC', subtipo: 'Garantía postventa', area: 'POSTVENTA', responsable: 'p-lccahuana', pasos: ACTIVIDADES }

let t1, d1
caso('043 CA-01 flujo aplicado: va a Postventa, a su responsable y con sus actividades en orden, cada una con su SLA', () => {
  ;[d1, t1] = f.crear(d0, alta(), GESTOR, d0.ahora)
  assert.equal(t1.area, 'POSTVENTA'); assert.equal(t1.responsable, 'p-lccahuana'); assert.equal(t1.eje, 2)
  assert.deepEqual(t1.actividades.map((a) => [a.n, a.nombre, a.slaH, a.estado]), [[1, 'Inspección', 8, 'EN_CURSO'], [2, 'Informe técnico', 16, 'PENDIENTE'], [3, 'Respuesta al cliente', 8, 'PENDIENTE']])
  assert.equal(t1.actividades[0].vence.getTime(), horas(t1.abierto, 8).getTime())
  const fila = d1.filasAsignacion.filter((x) => x.ticketId === t1.id).at(-1)
  assert.equal(fila.motivo, 'ALTA'); assert.equal(fila.aArea, 'POSTVENTA'); assert.equal(fila.aResponsable, 'p-lccahuana')
  assert.equal(d1.filasAsignacion.filter((x) => x.ticketId === t1.id).length, 2, 'append-only: alta + asignación del flujo')
  assert.equal(d1.flujosDeTicket.find((x) => x.ticketId === t1.id).version, 1)
})
let d2
caso('043 CA-02 versión del flujo: la nueva solo aplica a tickets nuevos; el abierto conserva su flujo y su SLA', () => {
  const v2 = ACTIVIDADES.map((a, i) => (i === 1 ? { ...a, slaH: 24 } : a)) // cambio de prueba: «Informe técnico» a 24 h
  d2 = f.publicar(d1, { ...FLUJO, pasos: v2, nuevaVersion: true }, ADMIN)
  const abierto = d2.tickets.find((x) => x.id === t1.id)
  assert.equal(abierto.flujo.version, 1); assert.equal(abierto.actividades[1].slaH, 16)
  assert.equal(abierto.venceResolucion.getTime(), t1.venceResolucion.getTime())
  assert.equal(d2.flujosDeTicket.find((x) => x.ticketId === t1.id).version, 1)
  const [, t2] = f.crear(d2, alta(), GESTOR, d2.ahora)
  assert.equal(t2.flujo.version, 2); assert.equal(t2.actividades[1].slaH, 24)
})
caso('043 CA-03 datos obligatorios: sin tipo, subtipo, área, responsable, actividad o SLA no publica e indica cuál', () => {
  const vacio = lanza(() => f.publicar(d0, { tipo: '', subtipo: '', area: '', responsable: '', pasos: [] }, ADMIN))
  assert.deepEqual(vacio.campos.map((c) => c.campo).sort(), ['area', 'pasos', 'responsable', 'subtipo', 'tipo'])
  lanza(() => f.publicar(d0, { ...FLUJO, pasos: [{ nombre: 'Inspección', responsable: 'p-omedina', slaH: null }] }, ADMIN), 'sla-0')
  lanza(() => f.publicar(d0, { ...FLUJO, pasos: [{ nombre: '', responsable: 'p-omedina', slaH: 8 }] }, ADMIN), 'paso-0')
  lanza(() => f.publicar(d0, { ...FLUJO, pasos: [{ nombre: 'Inspección', responsable: '', slaH: 8 }] }, ADMIN), 'resp-0')
  assert.equal(n.datos().flujos.length, d0.flujos.length, 'no se publicó nada')
})
caso('043 CA-04 actividades en orden: al cerrar la primera se habilita la siguiente y su SLA corre desde ese momento', () => {
  const luego = new Date(d1.ahora.getTime() + 3 * 3600e3)
  const d = f.cerrarActividad({ ...d1, ahora: luego }, t1.id, 1, 'p-omedina')
  const [a1, a2, a3] = d.tickets.find((x) => x.id === t1.id).actividades
  assert.equal(a1.estado, 'CERRADA'); assert.equal(a1.cerradaPor, 'p-omedina'); assert.equal(a1.cierre.getTime(), luego.getTime())
  assert.equal(a2.estado, 'EN_CURSO'); assert.equal(a2.inicio.getTime(), luego.getTime()); assert.equal(a2.vence.getTime(), horas(luego, 16).getTime())
  assert.equal(a3.estado, 'PENDIENTE'); assert.equal(a3.vence, null)
  lanza(() => f.cerrarActividad(d, t1.id, 3, 'p-omedina'), 'actividad-fuera-de-orden')
  assert.equal(lanza(() => f.cerrarActividad(d, t1.id, 2, 'p-avaldivia')).status, 403, 'un rol sin atención no cierra actividades')
})
caso('043 CA-05 SLA del flujo: 8 + 16 + 8 = 32 h hábiles, salvo que la política del tipo sea menor', () => {
  const sem = f.vigentes(d0).find((x) => x.tipo === 'REC' && x.subtipo === 'Garantía postventa')
  assert.equal(sem.slaTotalH, 32); assert.deepEqual(f.sla(d0, sem), { sumaH: 32, politicaH: 72, totalH: 32 })
  assert.equal(t1.flujo.totalH, 32); assert.equal(t1.venceResolucion.getTime(), horas(t1.abierto, 32).getTime())
  const ev = f.publicar(d0, { ...FLUJO, area: 'ATC' }, ADMIN).eventos.at(-1)
  assert.equal(ev.nombre, 'flujo_publicado'); assert.deepEqual(ev.datos, { area: 'ATC', tipo: 'REC', subtipo: 'Garantía postventa', actividades: ['Inspección', 'Informe técnico', 'Respuesta al cliente'], sla_total: 32, version: 1 })
  // política de prueba del tipo «Reclamo» por debajo de 32 h: prevalece la política
  const menor = { ...d0, politicas: d0.politicas.map((p) => (p.id === 'POL-REC' ? { ...p, resolucionH: 24 } : p)) }
  assert.equal(f.sla(menor, sem).totalH, 24)
  const [, t] = f.crear(menor, alta(), GESTOR, menor.ahora)
  assert.equal(t.flujo.totalH, 24); assert.equal(t.venceResolucion.getTime(), horas(t.abierto, 24).getTime())
})
caso('043 CA-06 combinación única: la misma clave no se publica dos veces; se ofrece una nueva versión', () => {
  const e = lanza(() => f.publicar(d0, FLUJO, ADMIN), 'flujo-duplicado')
  assert.equal(e.status, 409); assert.match(e.message, /nueva versión/)
  lanza(() => f.publicar(d0, { ...FLUJO, subtipo: '  garantía POSTVENTA ' }, ADMIN), 'flujo-duplicado')
  const d = f.publicar(d0, { ...FLUJO, nuevaVersion: true }, ADMIN)
  assert.deepEqual(f.versiones(d, 'REC', 'Garantía postventa', 'POSTVENTA').map((x) => x.version), [2, 1])
  assert.equal(f.vigentes(d).length, f.vigentes(d0).length, 'la tabla sigue con una fila por combinación')
})
caso('043 CA-07 sin flujo: flujo por defecto del área y alerta al administrador funcional', () => {
  const sinSub = alta({ tipo: 'QUE', subtipo: '' })
  const [da, ta] = f.crear(d0, sinSub, GESTOR, d0.ahora)
  const al = da.alertasOps.filter((a) => a.tipo === 'FLUJO_FALTANTE')
  assert.equal(al.length, 1); assert.equal(al[0].destinatario, ADMIN); assert.match(al[0].detalle, /tampoco tiene flujo por defecto/)
  assert.equal(ta.responsable, GESTOR, 'sin flujo ni flujo por defecto se queda como lo dejó el alta')
  // flujo por defecto de ATC (valores de prueba: lo publica el administrador; el PLT-04 no lo define)
  const dd = f.publicar(d0, { tipo: '*', area: 'ATC', responsable: 'p-dlazo', pasos: [{ nombre: 'Respuesta al cliente', responsable: 'p-dlazo', slaH: 8 }] }, ADMIN)
  const [db, tb] = f.crear(dd, sinSub, GESTOR, dd.ahora)
  assert.equal(tb.flujo.porDefecto, true); assert.equal(tb.responsable, 'p-dlazo'); assert.equal(tb.actividades.length, 1)
  assert.equal(db.flujosDeTicket.find((x) => x.ticketId === tb.id).porDefecto, true)
  assert.match(db.alertasOps.filter((a) => a.tipo === 'FLUJO_FALTANTE').at(-1).detalle, /flujo por defecto del área/)
  const [dc] = f.crear(db, sinSub, GESTOR, db.ahora)
  assert.equal(dc.alertasOps.length, db.alertasOps.length, 'la alerta no se repite por cada ticket de la misma combinación')
})
caso('043 CA-08 permiso y bitácora: sin rol de administrador funcional no publica; cada publicación con autor, fecha y versión', async () => {
  const e = lanza(() => f.publicar(d0, { ...FLUJO, nuevaVersion: true }, GESTOR))
  assert.equal(e.status, 403); assert.equal(e.auditar, true)
  const d = f.publicar(d0, { ...FLUJO, nuevaVersion: true }, ADMIN)
  const b = f.bitacora(d)
  assert.equal(b.length, d0.flujos.length + 1)
  assert.deepEqual([b[0].version, b[0].autor, b[0].publicado instanceof Date, f.nombre(b[0])], [2, ADMIN, true, 'Reclamo · Garantía postventa · Postventa'])
  assert.ok(b.every((x) => x.autor && x.publicado instanceof Date && x.version >= 1), 'cada publicación con autor, fecha y versión')
  // por la API de la consola el intento queda en la auditoría (persona de la sesión: gestora)
  comun.O.ajustar({ personaId: GESTOR })
  const antes = n.datos().auditoria.length
  await assert.rejects(comun.E.publicarFlujo({ ...FLUJO, nuevaVersion: true }), (x) => x.status === 403)
  assert.equal(n.datos().auditoria.length, antes + 1)
})
caso('«ticket entrante» (simulación) y Mi Portal pasan por el mismo orquestador: con flujo se asigna; sin flujo, a la cola y alerta', () => {
  // los flujos del PO llevan el subtipo «General» y la simulación registra con ese subtipo: Consulta de cuenta va a Cobranza
  const r = comun.O.ticketEntrante('CTA')
  assert.equal(r.resultado, 'asignado')
  const t = n.datos().tickets.find((x) => x.numero === r.numero)
  assert.equal(t.area, 'COBRANZA'); assert.equal(t.flujo.responsable, 'p-rsalazar'); assert.equal(t.subtipo, 'General')
  // HU-046 CA-01: el responsable del flujo entra con carga 28 (límite 12), así que va al disponible de Cobranza con menos carga
  assert.equal(t.responsable, 'p-jccama')
  assert.deepEqual(t.actividades.map((a) => [a.nombre, a.estado]), [['Recepción', 'EN_CURSO'], ['Revisión de cobranza', 'PENDIENTE'], ['Respuesta al cliente', 'PENDIENTE']])
  // un subtipo sin flujo (como los de Mi Portal) no se asigna: queda en la cola de su área y se alerta al administrador
  const [dx, tx] = f.crear(d0, alta({ tipo: 'CTA', subtipo: 'Pago no reflejado' }), GESTOR, d0.ahora)
  assert.ok(dx.alertasOps.some((a) => a.tipo === 'FLUJO_FALTANTE' && a.detalle.startsWith(tx.numero)))
})

let fallos = 0
for (const [nombre, fn] of casos) {
  try { await fn(); console.log(`ok   ${nombre}`) } catch (e) { fallos++; console.log(`FALLA ${nombre}\n     ${e.message}`) }
}
console.log(`\n${casos.length - fallos}/${casos.length} casos en verde`)
process.exit(fallos ? 1 : 0)
