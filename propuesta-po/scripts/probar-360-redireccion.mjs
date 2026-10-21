// Prueba en Node la información y la redirección de la Consulta 360 (pedido del PO, 20-oct; scripts/c360-redireccion.js):
// textos de cada dato y de cada sistema de origen, mapa dato → módulo, permisos por rol (contra el menú del shell parcheado),
// dato restringido, dentro del ticket, ficha del cliente, «Correos» y «Llamadas» al ticket que toca, y que los parches estén en
// los chunks. La lógica pura se carga del propio sufijo en un contexto aislado; los datos, del chunk «comun» ya parcheado.
// Uso: node scripts/probar-360-redireccion.mjs   (antes: npm run build)
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'

globalThis.location = { hash: '' }
globalThis.addEventListener = () => {}
globalThis.removeEventListener = () => {}

const assets = new URL('../artefacto/assets/', import.meta.url)
const leer = (f) => readFileSync(new URL(f, assets), 'utf8')
const comun = await import(new URL('comun-CVU2GQ4h.js', assets).href)
const n = comun.__ptNucleo, E = comun.E, O = comun.O, w = comun.w
const d0 = n.datos()
const restaurar = () => n.aplicar(() => d0)
const como = (rol) => O.ajustar({ personaId: w[rol] })
const ROLES = Object.keys(w)

// --- el chunk Grafo360 parcheado: sus 8 sistemas de origen (X) y sus 16 datos
const grafo = leer('Grafo360-BzaG42VX.js')
const FUENTES = [...grafo.matchAll(/\{id:`(\w+)`,n:`([^`]+)`,d:`([^`]+)`,ms:\d+,fuente:(?:`\w+`|null)\}/g)].map((m) => ({ id: m[1], n: m[2], d: m[3] }))
const NODOS = [...grafo.matchAll(/\{id:`(\w+)`,n:`([^`]+)`,fuentes:\[([^\]]*)\]/g)].map((m) => ({ id: m[1], n: m[2], fuentes: [...m[3].matchAll(/`(\w+)`/g)].map((x) => x[1]) }))

// --- la lógica del sufijo, aislada (los componentes no se ejecutan aquí)
const ctx = vm.createContext({ _: (e) => `#/${e}`, __perm: comun.sn, X: FUENTES })
vm.runInContext(readFileSync(new URL('./c360-redireccion.js', import.meta.url), 'utf8') + '\n;globalThis.api={__TRAZ360,__FUENTES360,__MODULOS360,__REDIR360,__redir360,__ticketCon360,__paresDato360,__paresFuente360,__nodoFuente360}', ctx)
// lo que devuelve el contexto aislado se pasa a objetos de este contexto para poder compararlo con deepEqual
const plano = (x) => (x == null ? x : JSON.parse(JSON.stringify(x)))
const A = new Proxy(ctx.api, { get: (o, k) => (typeof o[k] === 'function' ? (...a) => plano(o[k](...a)) : o[k]) })
const vista = (caidas = []) => ({ fuentes: FUENTES.map((s) => ({ ...s, caida: caidas.includes(s.id) })) })
const c = (extra = {}) => ({ d: n.datos(), rol: 'COORDINADOR_CX', cid: 'cli-001', tk: false, aqui: '#/consulta360', ...extra })
const nodo = (id, estado = 'ok') => ({ ...NODOS.find((q) => q.id === id), estado })

// --- el menú del shell parcheado (prototipo › ua), evaluado con dobles para saber qué módulos ve cada rol
function menuDelShell() {
  const p = leer('prototipo-B6qmgYQk.js')
  const k = p.indexOf('if(n===`CONTROL_ACCESO`)return[{label:`Operación`')
  assert.ok(k > 0, 'no encuentro la función del menú en prototipo')
  const ini = p.lastIndexOf('function ', k)
  // fin de la función: llaves balanceadas, saltando cadenas y plantillas (con sus ${…})
  const pila = []
  let j = p.indexOf('{', ini)
  for (; j < p.length; j++) {
    const ch = p[j]
    if (pila.at(-1) === '`') {
      if (ch === '\\') j++
      else if (ch === '`') pila.pop()
      else if (ch === '$' && p[j + 1] === '{') { pila.push('${'); j++ }
      continue
    }
    if (ch === '"' || ch === "'") { for (j++; j < p.length && p[j] !== ch; j++) if (p[j] === '\\') j++; continue }
    if (ch === '`' || ch === '{') { pila.push(ch); continue }
    if (ch === '}') { pila.pop(); if (!pila.length) break }
  }
  const src = p.slice(ini, j + 1)
  const ri = p.match(/[,;]Ri=(e=>\[[^\]]*\]\.includes\(e\))/)
  assert.ok(ri, 'no encuentro la regla de «Resolución por morosidad» (Ri) en prototipo')
  const dobles = { g: (s) => `#/${s}`, L: { jsx: () => null, jsxs: () => null }, Re: comun.sn, Ri: eval(ri[1]) }
  const nada = new Proxy(function () { return null }, { get: () => nada })
  const scope = new Proxy({}, { has: (o, k) => typeof k === 'string', get: (o, k) => (k === Symbol.unscopables ? undefined : k in dobles ? dobles[k] : k in globalThis ? globalThis[k] : nada) })
  const ua = new Function('scope', `with (scope) { return (${src}) }`)(scope)
  return (rol) => new Set(ua({ id: 'x' }, rol, 0).flatMap((g) => g.items.map((it) => it.href)))
}

const casos = []
const caso = (nombre, fn) => casos.push([nombre, fn])

caso('los parches están en los chunks (sufijo, panel, tarjetas del módulo, escena y Nuevo ticket)', () => {
  for (const s of ['function __Modulo360(', 'function __Dato360(', 'function _e(__a){return __Dato360(__a,__e0)}', '__mod?(0,G.jsx)(__Modulo360,{c:__cx}):null', '"data-sin-ficha":__mod&&__oc?``:void 0', 'V.current=__fs||f;', '(0,G.jsx)(_e,{__c:__cx,nodo:Y,', '__ListaFuentes360'])
    assert.ok(grafo.includes(s), `falta en Grafo360: ${s}`)
  const nt = leer('NuevoTicket-kzkvXK7o.js')
  assert.ok(nt.includes('E.cliente?{...z,clienteId:E.cliente.id}:z') && nt.includes('E.telefono=null,E.cliente=null,'), 'Nuevo ticket no precarga el cliente')
  const esc = leer('escenas-three.js')
  assert.ok(esc.includes('.pt-c360-modulo{') && esc.includes('[data-sin-ficha]'), 'faltan los estilos')
})
caso('1 · los 16 datos del modelo tienen «Sistema de origen», «Criterio» y «Consulta en línea»', () => {
  assert.equal(NODOS.length, 16)
  assert.deepEqual(NODOS.map((q) => q.n), ['DNI y KYC', 'Contactos', 'Lotes', 'Contrato y adendas', 'Acta de entrega', 'Garantía vigente', 'Cronograma', 'Cuotas vencidas', 'Saldo por lote', 'Estado de cuenta', 'Documentos', 'Correos', 'Llamadas', 'Tickets previos', 'Reclamos del Libro', 'Exposición legal'])
  assert.deepEqual(Object.keys(A.__TRAZ360).sort(), NODOS.map((q) => q.id).sort(), 'cada dato con su texto, sin sobrantes')
  for (const q of NODOS) {
    const pares = A.__paresDato360(q, vista())
    assert.deepEqual(pares.map((x) => x[0]), ['Sistema de origen', 'Criterio', 'Consulta en línea'])
    for (const s of q.fuentes) assert.ok(pares[0][1].includes(FUENTES.find((f) => f.id === s).n), `${q.n}: falta su sistema ${s}`)
    assert.ok(pares[1][1].length > 10 && pares[2][1].length > 10, `${q.n}: textos vacíos`)
  }
  assert.equal(A.__paresDato360(nodo('cuotas'), vista(['cob']))[0][1], 'Cobranza: no disponible + Motor de José (consultas específicas)', 'el sistema caído se dice en el panel')
})
caso('1 · los 8 sistemas de origen tienen «Plataforma», «Integración» y «Consulta en línea»', () => {
  assert.equal(FUENTES.length, 8)
  assert.deepEqual(Object.keys(A.__FUENTES360).sort(), FUENTES.map((s) => s.id).sort())
  for (const s of FUENTES) {
    const pares = A.__paresFuente360(s.id, s.n)
    assert.deepEqual(pares.map((x) => x[0]), ['Plataforma', 'Integración', 'Consulta en línea'])
    assert.ok(pares.every((x) => x[1].length > 5))
  }
  const f = A.__nodoFuente360(vista(['cob']), 'cob')
  assert.equal(f.fuente, true); assert.equal(f.estado, 'caido'); assert.equal(f.n, 'Cobranza')
  assert.equal(A.__redir360(f, c()), null, 'un sistema de origen no lleva a un módulo')
})
caso('1 · textos limpios: sin códigos de trazabilidad, sin Etapa 2 y sin nombres de personas', () => {
  const textos = [...Object.values(A.__TRAZ360).flat(), ...Object.values(A.__FUENTES360).flat(), ...Object.values(A.__MODULOS360).map((m) => `${m.etiqueta} ${m.modulo}`)]
  const nombres = [...(comun.Un ?? []).flatMap((x) => x.nombre.split(' ')), 'José', 'Daniel', 'Brayan', 'Eddie', 'Elena']
  for (const t of textos) {
    assert.ok(!/\b(HU|RF|RN|RNF|DEP|FT|EP|ENT|CA)-[A-Z0-9]/.test(t), `código en «${t}»`)
    assert.ok(!/NEXUS|DAEDALUS|UrbeMind|Etapa 2|Copiloto|vectorial|Click-to-Call/i.test(t), `Etapa 2 o jerga en «${t}»`)
    for (const p of nombres) if (p.length > 2) assert.ok(!new RegExp(`\\b${p}\\b`).test(t), `nombre de persona «${p}» en «${t}»`)
  }
})
caso('2 · cada dato lleva a su módulo (y solo a módulos que existen: no hay visor de contratos)', () => {
  const esperado = { kyc: ['Abrir la ficha del cliente', '#/clientes/cli-001'], cont: ['Abrir la ficha del cliente', '#/clientes/cli-001'], lote: ['Abrir la ficha del cliente', '#/clientes/cli-001'], contrato: ['Abrir la ficha del cliente', '#/clientes/cli-001'], docs: ['Abrir la ficha del cliente', '#/clientes/cli-001'], acta: ['Ir a EntregaFest en vivo', '#/fest'], gar: ['Ir a Garantías postventa', '#/garantias'], crono: ['Ir a Resolución por morosidad', '#/morosidad'], cuotas: ['Ir a Resolución por morosidad', '#/morosidad'], saldo: ['Ir a Resolución por morosidad', '#/morosidad'], ecta: ['Ir a Resolución por morosidad', '#/morosidad'], tick: ['Ver tickets en la Bandeja', '#/bandeja'], libro: ['Ir al Libro de Reclamaciones', '#/libro'], expo: ['Ir a la Torre de Control CX', '#/torre'] }
  restaurar()
  for (const [id, [etiqueta, hash]] of Object.entries(esperado)) {
    const r = A.__redir360(nodo(id), c())
    assert.equal(r?.etiqueta, etiqueta, id); assert.equal(r?.hash, hash, id)
  }
  const tk = n.datos().tickets.filter((t) => t.clienteId === 'cli-001')
  for (const id of ['correos', 'llam']) assert.match(A.__redir360(nodo(id), c()).hash, /^#\/ticket\/tk-/, id)
  assert.ok(tk.length > 0)
  assert.ok(Object.values(A.__MODULOS360).every((m) => !/contrato/i.test(m.etiqueta)), 'nada de visor de contratos')
})
caso('2 · permisos: el botón sale solo si el rol ve el módulo en el menú del shell', () => {
  const ve = menuDelShell()
  const ruta = { ficha: '#/clientes', fest: '#/fest', garantias: '#/garantias', morosidad: '#/morosidad', correo: '#/bandeja', llamada: '#/bandeja', bandeja: '#/bandeja', libro: '#/libro', torre: '#/torre' }
  for (const rol of ROLES) {
    const menu = ve(rol)
    for (const [k, m] of Object.entries(A.__MODULOS360)) assert.equal(m.ve(rol), menu.has(ruta[k]), `${rol} · ${m.modulo}: el menú dice ${menu.has(ruta[k])}`)
  }
  restaurar()
  assert.deepEqual(A.__redir360(nodo('crono'), c({ rol: 'GESTOR' })), { motivo: 'Tu rol no tiene acceso a Resolución por morosidad.' })
  assert.equal(A.__redir360(nodo('crono'), c({ rol: 'COLABORADOR' })).hash, '#/morosidad')
  assert.deepEqual(A.__redir360(nodo('acta'), c({ rol: 'GESTOR' })), { motivo: 'Tu rol no tiene acceso a EntregaFest en vivo.' })
  assert.equal(A.__redir360(nodo('expo'), c({ rol: 'SUPERVISOR' })).hash, '#/torre')
})
caso('2 · un dato restringido (candado) no ofrece redirección', () => {
  restaurar()
  for (const id of ['ecta', 'expo']) assert.deepEqual(A.__redir360(nodo(id, 'restringido'), c({ rol: 'SUPERVISOR' })), { motivo: 'Dato restringido para tu rol: no lleva a otro módulo.' })
  assert.ok(A.__redir360(nodo('cuotas', 'caido'), c({ rol: 'SUPERVISOR' })).hash, 'lo caído sí lleva a su módulo')
})
caso('2 · dentro del ticket no hay redirecciones; en la ficha del cliente no se ofrece ir a ella misma', () => {
  restaurar()
  for (const q of NODOS) assert.equal(A.__redir360(nodo(q.id), c({ tk: true })), null, q.id)
  assert.equal(A.__redir360(nodo('kyc'), c({ aqui: '#/clientes/cli-001' })), null)
  assert.equal(A.__redir360(nodo('gar'), c({ aqui: '#/clientes/cli-001' })).hash, '#/garantias')
  assert.equal(A.__redir360(nodo('kyc'), c({ aqui: '#/clientes/cli-002' })).hash, '#/clientes/cli-001')
})
caso('2 · «Correos» y «Llamadas»: el ticket más reciente con esa interacción; si no hay, el más reciente; sin tickets, sin botón', async () => {
  restaurar(); como('GESTOR')
  const d = () => n.datos()
  // cli-011: dos tickets y solo uno con correo
  const tks = d().tickets.filter((t) => t.clienteId === 'cli-011').sort((a, b) => b.abierto - a.abierto)
  assert.equal(tks.length, 2)
  const conCorreo = tks.filter((t) => t.canal === 'Correo' || d().interacciones.some((x) => x.ticketId === t.id && x.canal === 'Correo'))
  assert.equal(conCorreo.length, 1)
  let r = A.__redir360(nodo('correos'), c({ d: d(), cid: 'cli-011', rol: 'GESTOR' }))
  assert.equal(r.etiqueta, 'Abrir el último ticket con correo'); assert.equal(r.hash, `#/ticket/${conCorreo[0].id}`)
  // un correo nuevo en el otro ticket lo vuelve el más reciente
  const otro = tks.find((t) => t.id !== conCorreo[0].id && t.estado !== 'CLOSED')
  if (otro) {
    await E.registrarInteraccion(otro.id, { texto: 'Le enviamos el detalle por correo.', visible: true, canal: 'Correo', adjuntos: [] })
    r = A.__redir360(nodo('correos'), c({ d: d(), cid: 'cli-011', rol: 'GESTOR' }))
    assert.equal(r.hash, `#/ticket/${otro.id}`)
  }
  // llamadas: la llamada registrada desde el ticket (con su grabación) manda
  restaurar(); como('GESTOR')
  const t13 = d().tickets.filter((t) => t.clienteId === 'cli-013').sort((a, b) => a.abierto - b.abierto)[0]
  await E.iniciarLlamada('cli-013', t13.id)
  r = A.__redir360(nodo('llam'), c({ d: d(), cid: 'cli-013', rol: 'GESTOR' }))
  assert.equal(r.etiqueta, 'Abrir ticket y grabación'); assert.equal(r.hash, `#/ticket/${t13.id}`)
  // sin la interacción: el ticket más reciente del cliente, dicho así
  restaurar()
  const sinTel = Object.entries(Object.groupBy(d().tickets, (t) => t.clienteId)).find(([cid, ts]) => cid !== 'cli-int' && !ts.some((t) => t.canal === 'Teléfono' || d().interacciones.some((x) => x.ticketId === t.id && x.canal === 'Teléfono') || d().llamadas.some((l) => l.ticketId === t.id)))
  assert.ok(sinTel, 'la semilla tiene un cliente sin llamadas')
  r = A.__redir360(nodo('llam'), c({ d: d(), cid: sinTel[0], rol: 'GESTOR' }))
  assert.equal(r.etiqueta, 'Abrir el último ticket del cliente'); assert.equal(r.hash, `#/ticket/${[...sinTel[1]].sort((a, b) => b.abierto - a.abierto)[0].id}`)
  // sin tickets: no hay botón
  const sinTk = comun.Un.find((x) => x.id !== 'cli-int' && !d().tickets.some((t) => t.clienteId === x.id))
  assert.deepEqual(A.__redir360(nodo('correos'), c({ d: d(), cid: sinTk.id, rol: 'GESTOR' })), { motivo: 'El cliente no tiene tickets.' })
  assert.equal(A.__ticketCon360(d(), sinTk.id, 'Correo'), null)
})
caso('3 · «Crear ticket»: el aviso previo de Nuevo ticket existe y lleva el cliente, y solo lo ofrecen los roles que registran', () => {
  assert.equal(typeof comun.y, 'object'); assert.ok('telefono' in comun.y)
  assert.deepEqual(ROLES.filter((r) => comun.sn.registrar(r)), ['GESTOR', 'COLABORADOR', 'SUPERVISOR', 'LEGAL_RECLAMOS', 'MESA_SGD'])
})

let fallos = 0
for (const [nombre, fn] of casos) {
  try { await fn(); console.log(`ok   ${nombre}`) } catch (e) { fallos++; console.log(`FALLA ${nombre}\n     ${e.message}`) }
}
console.log(`\n${casos.length - fallos}/${casos.length} casos en verde`)
process.exit(fallos ? 1 : 0)
