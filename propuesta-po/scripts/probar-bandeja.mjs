// Prueba en Node la bandeja orquestadora de la Etapa 1 (PLT-04 v1.3): HU-ATC-044 (bandeja única y permisos por área),
// HU-ATC-046 (balanceo por carga al entrar un ticket nuevo) y HU-ATC-055 (plantilla del correo de asignación), contra el chunk
// «comun» ya parcheado (artefacto/assets) y la semilla del prototipo. Un caso por criterio de aceptación.
// Uso: node scripts/probar-bandeja.mjs   (antes: node scripts/parchear.mjs). Node ≥ 22.
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'

globalThis.location = { hash: '' }
globalThis.addEventListener = () => {}
globalThis.removeEventListener = () => {}

const assets = new URL('../artefacto/assets/', import.meta.url)
const comun = await import(new URL('comun-CVU2GQ4h.js', assets))
const { __h43: f, __h44: a44, __h46: h46, __h55: h55, __ptNucleo: n, E: api, O: sim } = comun
assert.ok(a44 && h46 && h55, 'comun no exporta __h44/__h46/__h55: corre «node scripts/parchear.mjs» antes de probar')
const shell = readFileSync(new URL(readdirSync(assets).find((x) => /^prototipo-.*\.js$/.test(x)), assets), 'utf8')
const midia = readFileSync(new URL('MiDia-Sl191JQ_.js', assets), 'utf8')

const d0 = n.datos()
const datos = () => n.datos()
const restaurar = () => n.aplicar(() => d0)
const como = (personaId) => sim.ajustar({ personaId })
const ACTIVOS = ['OPEN', 'IN_PROGRESS', 'PENDING_CUSTOMER', 'ESCALATED', 'REOPENED']
const correos = () => comun.fn(datos())                 // fi: correos de asignación que muestra Mi día
const carga = (d, id) => comun.dn(d, id).carga          // li().carga = Kr: carga ponderada (baja 1, media 2, alta 3, urgente 4)
const GESTOR = 'p-crojas', SUPERVISOR = 'p-gnunez', COORDINADOR = 'p-avaldivia'
const cliente = d0.tickets.find((t) => t.clienteId.startsWith('cli-0')).clienteId
const alta = (x = {}) => ({ canal: 'Teléfono', clienteId: cliente, empresaId: 'AIN', linea: 'Vivienda', establecimiento: '', tipo: 'CTA', subtipo: 'General', prioridad: 'MEDIUM', resumen: 'Consulta de cuenta de prueba', descripcion: 'Registro de prueba de la bandeja.', ...x })
// la vista «Áreas que superviso» / «Mi área» de la Bandeja: mismas reglas que el chunk (ie) con __h44.areas
const visibles = (d, persona) => { const ar = a44.areas(persona); return d.tickets.filter((t) => ACTIVOS.includes(t.estado) && ar.includes(t.area)) }

const casos = []
const caso = (nombre, fn) => casos.push([nombre, fn])

// ------------------------------------------------------------------ HU-ATC-044
caso('044 CA-01 tickets de teléfono, WhatsApp, correo y Mi Portal juntos, ordenados por rayo, SLA más próximo y prioridad', async () => {
  restaurar(); como(SUPERVISOR)
  assert.ok(shell.includes('E.ticketEntrante(`CTA`,`Mi Portal`)'), 'el botón del panel de simulación entra por Mi Portal')
  const r = sim.ticketEntrante('CTA', 'Mi Portal')
  const nuevo = datos().tickets.find((t) => t.numero === r.numero)
  assert.equal(nuevo.canal, 'Mi Portal')
  // una muestra con rayo para comprobar que va primero (la semilla no trae rayos)
  const muestra = visibles(datos(), SUPERVISOR).find((t) => t.id !== nuevo.id && t.responsable)
  await api.marcarRayo(muestra.id, 'Cliente con cita notarial mañana', true)
  const d = datos(), lista = visibles(d, SUPERVISOR).sort(comun.bn(d))
  assert.deepEqual([...new Set(lista.map((t) => t.canal))].sort(), ['Correo', 'Mi Portal', 'Teléfono', 'WhatsApp'])
  assert.equal(lista[0].id, muestra.id, 'el ticket con rayo va primero')
  const P = { LOW: 1, MEDIUM: 2, HIGH: 3, URGENT: 4 }
  for (let i = 2; i < lista.length; i++) {
    const x = comun.nn(lista[i - 1], d.ahora).vence.getTime(), y = comun.nn(lista[i], d.ahora).vence.getTime()
    assert.ok(x < y || (x === y && P[lista[i - 1].prioridad] >= P[lista[i].prioridad]), `orden SLA → prioridad roto en ${lista[i - 1].numero} / ${lista[i].numero}`)
  }
})
caso('044 CA-02 un ticket nuevo sin responsable: el orquestador lo asigna por el flujo del área o lo deja en la cola del área', () => {
  restaurar()
  const r = sim.ticketEntrante('QUE', 'Mi Portal')   // Queja · General → flujo de ATC, responsable Diego Lazo
  const t = datos().tickets.find((x) => x.numero === r.numero)
  assert.equal(r.resultado, 'asignado'); assert.equal(t.area, 'ATC'); assert.equal(t.responsable, 'p-dlazo')
  const [dx, tx] = f.crear(d0, alta({ subtipo: 'Pago no reflejado' }), GESTOR, d0.ahora) // subtipo sin flujo publicado
  assert.ok(dx.alertasOps.some((q) => q.tipo === 'FLUJO_FALTANTE' && q.ticketId === tx.id))
})
caso('044 CA-03 no veo tickets de un área a la que no pertenezco, salvo que sea supervisor de esa área (maestro local)', () => {
  assert.deepEqual(a44.areas(GESTOR), ['ATC'])
  assert.deepEqual(a44.areas('p-rsalazar'), ['COBRANZA'])
  // Gabriela Núñez lidera a gestores de ATC, Cobranza y Postventa en el maestro local: supervisa esas tres, no Legal, TI ni Administración
  assert.deepEqual(a44.areas(SUPERVISOR), ['ATC', 'COBRANZA', 'POSTVENTA'])
  assert.deepEqual(a44.areas(COORDINADOR), [], 'el coordinador CX no supervisa ninguna área en el maestro local')
  const otras = d0.tickets.filter((t) => ACTIVOS.includes(t.estado) && ['LEGAL', 'TI', 'ADMINISTRACION'].includes(t.area))
  assert.ok(otras.length > 0, 'la semilla tiene tickets activos de áreas que la supervisora no supervisa')
  const sup = visibles(d0, SUPERVISOR)
  assert.ok(sup.length > 0 && sup.every((t) => ['ATC', 'COBRANZA', 'POSTVENTA'].includes(t.area)))
  assert.ok(visibles(d0, GESTOR).every((t) => t.area === 'ATC'))
  assert.equal(visibles(d0, COORDINADOR).length, 0)
  // la Bandeja usa esa misma regla (y ya no ofrece «Todas las áreas»)
  assert.ok(shell.includes('__ar=__h44.areas(t.id),ie=(e,n)=>') && shell.includes('todas:`Áreas que superviso`') && !shell.includes('Todas las áreas'))
  assert.equal(a44.supervisor('COBRANZA'), SUPERVISOR); assert.equal(a44.lista(['ATC', 'COBRANZA', 'POSTVENTA']), 'ATC, Cobranza y Postventa')
})

// ------------------------------------------------------------------ HU-ATC-046
caso('046 CA-01 entra un ticket para un gestor sobre el límite: va al disponible con menos carga y queda REASSIGNMENT_CARGA', () => {
  // Consulta de cuenta · General: el flujo la manda a Renato Salazar (Cobranza), que en la semilla tiene 28 puntos (límite 12)
  assert.ok(carga(d0, 'p-rsalazar') > h46.limite)
  const menor = ['p-mpaz', 'p-jccama'].sort((x, y) => carga(d0, x) - carga(d0, y))[0]
  const [d, t] = f.crear(d0, alta(), GESTOR, d0.ahora)
  assert.equal(t.area, 'COBRANZA'); assert.equal(t.flujo.responsable, 'p-rsalazar'); assert.equal(t.responsable, menor)
  const fila = d.filasAsignacion.filter((x) => x.ticketId === t.id).at(-1)
  assert.equal(fila.motivo, 'REASSIGNMENT_CARGA'); assert.equal(fila.aResponsable, menor); assert.equal(fila.alEntrar, true)
  assert.equal(fila.nota, 'Por carga: el flujo lo daba a Renato Salazar, con 28 puntos (límite 12).')
  assert.equal(d.filasAsignacion.filter((x) => x.ticketId === t.id).length, 2, 'append-only: alta + reasignación por carga (sin una fila intermedia para Renato)')
  assert.deepEqual(d.eventos.filter((e) => e.nombre === 'reasignacion_carga').at(-1).datos, { area: 'COBRANZA', origen: 'entrada', a_cola: false })
  // por Mi Portal / «ticket entrante» pasa lo mismo (mismo orquestador)
  restaurar()
  const r = sim.ticketEntrante('CTA', 'Mi Portal')
  assert.equal(datos().tickets.find((x) => x.numero === r.numero).responsable, menor)
  // sin saturación no cambia nada de la HU-043: Reclamo · Garantía postventa va a Lucía Ccahuana (2 puntos) con motivo ALTA
  const [d2, t2] = f.crear(d0, alta({ tipo: 'REC', subtipo: 'Garantía postventa' }), GESTOR, d0.ahora)
  assert.equal(t2.responsable, 'p-lccahuana'); assert.equal(d2.filasAsignacion.filter((x) => x.ticketId === t2.id).at(-1).motivo, 'ALTA')
})
caso('046 CA-02 con rayo, en Eje 3 o con interacción en curso no se reasigna', async () => {
  restaurar()
  const base = { ...d0.tickets[0], id: 'tk-prueba', eje: 2 }
  assert.ok(h46.entrada(d0, 'COBRANZA', 'p-rsalazar', base), 'sin exclusiones sí se reasigna')
  assert.equal(h46.entrada(d0, 'COBRANZA', 'p-rsalazar', { ...base, eje: 3 }), null, 'Eje 3')
  const conRayo = { ...d0, rayos: [{ id: 'ray-x', ticketId: base.id, accion: 'MARCADO', motivo: 'prueba', fecha: d0.ahora, autor: SUPERVISOR }] }
  assert.equal(h46.entrada(conRayo, 'COBRANZA', 'p-rsalazar', base), null, 'rayo')
  const conInteraccion = { ...d0, interacciones: [...d0.interacciones, { id: 'in-x', ticketId: base.id, fecha: d0.ahora, tipo: 'cliente', visible: true, canal: 'WhatsApp', autor: null, texto: 'Hola', adjuntos: [] }] }
  assert.equal(h46.entrada(conInteraccion, 'COBRANZA', 'p-rsalazar', base), null, 'interacción en curso')
  // y el balanceo a pedido de Mi día tampoco mueve un ticket de Renato con rayo
  como(SUPERVISOR)
  const suyo = datos().tickets.find((t) => t.responsable === 'p-rsalazar' && ACTIVOS.includes(t.estado) && t.eje !== 3)
  await api.marcarRayo(suyo.id, 'Prueba de exclusión', true)
  await api.balancear()
  assert.equal(datos().tickets.find((t) => t.id === suyo.id).responsable, 'p-rsalazar')
})
caso('046 CA-03 nadie disponible en el área: queda en la cola del área y se alerta al supervisor', () => {
  const d = { ...d0, ausentes: ['p-mpaz', 'p-jccama'] }
  const [d1, t] = f.crear(d, alta(), GESTOR, d.ahora)
  assert.equal(t.area, 'COBRANZA'); assert.equal(t.responsable, null)
  const fila = d1.filasAsignacion.filter((x) => x.ticketId === t.id).at(-1)
  assert.equal(fila.motivo, 'REASSIGNMENT_CARGA'); assert.equal(fila.aResponsable, null)
  const al = d1.alertasOps.filter((q) => q.tipo === 'SIN_DISPONIBLES').at(-1)
  assert.equal(al.destinatario, SUPERVISOR); assert.equal(al.ticketId, t.id); assert.match(al.detalle, /Cobranza/)
  assert.deepEqual(d1.eventos.filter((e) => e.nombre === 'reasignacion_carga').at(-1).datos, { area: 'COBRANZA', origen: 'entrada', a_cola: true })
  // el texto del Equipo en Mi día lo cuenta
  assert.ok(midia.includes('Un ticket nuevo cuyo responsable supera el límite entra directo al gestor disponible del área con menos carga.'))
})

// ------------------------------------------------------------------ HU-ATC-055
caso('055 CA-01 asignación guardada: correo al gestor con copia a su líder, con N.º, tipo, prioridad y vencimiento del SLA', () => {
  restaurar(); como(GESTOR)
  const r = sim.ticketEntrante('QUE', 'Mi Portal')    // la asigna el flujo a Diego Lazo (líder: Gabriela Núñez)
  const c = correos().find((x) => x.tickets.includes(r.numero))
  assert.equal(c.para, 'p-dlazo'); assert.equal(c.cc, SUPERVISOR); assert.equal(c.masivo, false)
  const m = h55.correo(datos(), c), t = datos().tickets.find((x) => x.numero === r.numero)
  assert.deepEqual([m.para, m.saludo, m.cc, m.asunto], ['Diego Lazo', 'Diego', 'Gabriela Núñez', `Se te asignó el ticket ${r.numero}`])
  assert.deepEqual(m.filas.map((x) => [x.numero, x.tipo, x.prioridad]), [[r.numero, 'Queja', 'Media']])
  assert.equal(m.filas[0].vence.getTime(), comun.nn(t, datos().ahora).vence.getTime())
  assert.ok(!JSON.stringify(m).includes(t.clienteId) && !JSON.stringify(m).includes(t.resumen), 'sin datos del cliente (DLP)')
  assert.ok(midia.includes('Plantilla de correo de asignación') && midia.includes('__Plantilla'))
})
caso('055 CA-02 reasignación masiva: cada gestor recibe un solo correo con el resumen de sus tickets', async () => {
  restaurar(); como(SUPERVISOR)
  const antes = new Set(correos().map((c) => c.id))
  const res = await api.balancear()
  assert.ok(res.movidos > 1)
  const nuevos = correos().filter((c) => !antes.has(c.id))
  assert.ok(nuevos.some((c) => c.masivo), 'hay al menos un resumen con varios tickets')
  const para = nuevos.map((c) => c.para)
  assert.equal(new Set(para).size, para.length, 'un solo correo por gestor')
  const movidas = datos().filasAsignacion.filter((x) => x.motivo === 'REASSIGNMENT_CARGA' && x.aResponsable)
  for (const c of nuevos) {
    const suyos = movidas.filter((x) => x.aResponsable === c.para).length
    assert.equal(c.tickets.length, suyos)
    const m = h55.correo(datos(), c)
    assert.equal(m.filas.length, suyos); assert.ok(m.filas.every((x) => x.tipo && x.prioridad && x.vence instanceof Date))
    if (suyos > 1) { assert.equal(m.masivo, true); assert.equal(m.asunto, `Se te reasignaron ${suyos} tickets`) }
  }
  // dos tickets nuevos balanceados al entrar (mismo reloj) son dos movimientos: dos correos, no un resumen
  restaurar()
  const nums = [sim.ticketEntrante('CTA', 'Mi Portal').numero, sim.ticketEntrante('CTA', 'Mi Portal').numero]
  const de = nums.map((num) => correos().filter((c) => c.tickets.includes(num)))
  assert.ok(de.every((cs) => cs.length === 1 && cs[0].tickets.length === 1 && !cs[0].masivo), 'un correo propio por cada ticket nuevo')
  assert.notEqual(de[0][0].id, de[1][0].id)
})
caso('055 CA-03 gestor sin líder en el maestro local: el correo sale solo a él y se alerta al administrador', () => {
  restaurar()
  const r = sim.ticketEntrante('CTA', 'Mi Portal')   // por carga va a quien no tiene líder registrado (Julio Ccama)
  const c = correos().find((x) => x.tickets.includes(r.numero))
  assert.equal(c.cc, null); assert.ok(comun.Tn(c), 'cuenta como «sin líder» para el aviso al administrador funcional')
  const m = h55.correo(datos(), c)
  assert.equal(m.cc, null)
  assert.ok(midia.includes('Completa el líder en el maestro local de ATC'), 'aviso al administrador funcional en Mi día')
  assert.ok(midia.includes('Este aviso llega solo a ti: tu líder no está registrado en el maestro local de ATC'))
})

let fallos = 0
for (const [nombre, fn] of casos) {
  try { await fn(); console.log(`ok   ${nombre}`) } catch (e) { fallos++; console.log(`FALLA ${nombre}\n     ${e.message}`) }
}
console.log(`\n${casos.length - fallos}/${casos.length} casos en verde`)
process.exit(fallos ? 1 : 0)
