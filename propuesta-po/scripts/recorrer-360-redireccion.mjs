// Consulta 360 · información y redirección (pedido del PO, 20-oct): recorrido en Chrome sin interfaz (CDP), con los mismos helpers
// que scripts/recorrer-consulta360.mjs. Cubre el panel del dato (criterio, consulta en línea, sistema de origen, «<módulo> →» y
// «Crear ticket»), los permisos por rol, el ticket (sin redirecciones) y las tarjetas del módulo «Consulta 360».
// Uso, con el servidor arriba (npm run preview):  node scripts/recorrer-360-redireccion.mjs
//   BASE (http://localhost:5180/), CHROME, CAPTURAS, PERFIL_CHROME, PUERTO_CDP (9443) y RUTA_360 (#/consulta360: la página del
//   módulo, la que pasa `modulo` al grafo) por entorno.
import { spawn } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const BASE = process.env.BASE ?? 'http://localhost:5180/'
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const CAPS = (process.env.CAPTURAS ?? join(tmpdir(), 'c360-redireccion-capturas')) + '/'
const PERFIL = (process.env.PERFIL_CHROME ?? join(tmpdir(), 'c360-redireccion-chrome')) + '/'
const PUERTO = Number(process.env.PUERTO_CDP ?? 9443)
const RUTA_360 = process.env.RUTA_360 ?? '#/consulta360'
rmSync(PERFIL, { recursive: true, force: true }); mkdirSync(CAPS, { recursive: true })
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PUERTO}`, `--user-data-dir=${PERFIL}`, '--no-first-run', '--no-default-browser-check', '--window-size=1366,900', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' })
const dormir = (ms) => new Promise((r) => setTimeout(r, ms))
let info
for (let i = 0; i < 50 && !info; i++) { try { info = await (await fetch(`http://127.0.0.1:${PUERTO}/json/list`)).json() } catch { await dormir(200) } }
const pagina = info.find((t) => t.type === 'page')
const ws = new WebSocket(pagina.webSocketDebuggerUrl)
await new Promise((r) => ws.addEventListener('open', r, { once: true }))
let sec = 0
const pend = new Map(), errores = []
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data)
  if (m.id && pend.has(m.id)) { const { ok, ko } = pend.get(m.id); pend.delete(m.id); m.error ? ko(new Error(JSON.stringify(m.error))) : ok(m.result) }
  else if (m.method === 'Runtime.exceptionThrown') errores.push(`excepción: ${m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text}`)
  else if (m.method === 'Runtime.consoleAPICalled' && ['error', 'assert'].includes(m.params.type)) errores.push(`console.${m.params.type}: ${m.params.args.map((a) => a.value ?? a.description).join(' ')}`)
  else if (m.method === 'Network.responseReceived' && m.params.response.status >= 400 && !m.params.response.url.endsWith('/favicon.ico')) errores.push(`HTTP ${m.params.response.status}: ${m.params.response.url}`)
})
const cdp = (method, params = {}) => new Promise((ok, ko) => { const id = ++sec; pend.set(id, { ok, ko }); ws.send(JSON.stringify({ id, method, params })) })
const evaluar = async (expr) => {
  const r = await cdp('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })
  if (r.exceptionDetails) throw new Error(`evaluar: ${r.exceptionDetails.exception?.description ?? r.exceptionDetails.text}\n${expr.slice(0, 200)}`)
  return r.result.value
}
const captura = async (nombre) => { const r = await cdp('Page.captureScreenshot', { format: 'png' }); writeFileSync(CAPS + nombre + '.png', Buffer.from(r.data, 'base64')) }
// captura de un elemento entero (el grafo con su panel y las tarjetas del módulo), aunque no quepa en la ventana
const capturaDe = async (sel, nombre) => {
  const c = await evaluar(`(()=>{const r=document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect();return{x:r.left+scrollX,y:r.top+scrollY,width:r.width,height:r.height}})()`)
  const r = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { ...c, scale: 1 } }); writeFileSync(CAPS + nombre + '.png', Buffer.from(r.data, 'base64'))
}
const texto = () => evaluar('document.querySelector("main")?.innerText ?? document.body.innerText')
const esperar = async (cond, que, ms = 8000) => { for (let i = 0; i < ms / 100; i++) { if (await evaluar(cond)) return; await dormir(100) } throw new Error(`no se cumplió: ${que}`) }
const esperarTexto = async (t, ms = 8000) => { for (let i = 0; i < ms / 100; i++) { if ((await texto()).includes(t)) return; await dormir(100) } throw new Error(`no apareció «${t}»\n---\n${(await texto()).slice(0, 1200)}`) }
const ir = (hash) => evaluar(`location.hash=${JSON.stringify(hash)}`)
const H = `
window.__t={
 boton:(txt,raiz)=>{const b=[...(raiz??document).querySelectorAll('main button, main a')].find(e=>e.textContent.trim()===txt||e.textContent.trim().startsWith(txt));if(!b)throw new Error('sin botón '+txt);b.click();return true},
 hay:(txt,raiz)=>[...(raiz??document).querySelectorAll('main button, main a')].some(e=>e.offsetParent!==null&&(e.textContent.trim()===txt||e.textContent.trim().startsWith(txt))),
 pestana:(txt)=>{const b=[...document.querySelectorAll('main [role=tab]')].find(e=>e.textContent.trim().startsWith(txt));if(!b)throw new Error('sin pestaña '+txt);b.click();return true},
 dato:(n)=>{const b=[...document.querySelectorAll('main ul[aria-label="Datos de la consulta 360"] button')].find(e=>e.textContent.startsWith(n+':'));if(!b)throw new Error('sin dato '+n);b.click();return b.textContent},
 fuente:(n)=>{const b=[...document.querySelectorAll('main ul[aria-label="Sistemas de origen de la consulta 360"] button')].find(e=>e.textContent.startsWith(n+':'));if(!b)throw new Error('sin sistema '+n);b.click();return b.textContent},
 aside:()=>document.querySelector('main .pt-grafo aside.pt-lateral'),
 panel:()=>[...document.querySelectorAll('main .pt-grafo aside.pt-lateral > *')].at(-1)?.innerText??'',
 panelVisible:()=>{const p=[...document.querySelectorAll('main .pt-grafo aside.pt-lateral > *')].at(-1);return !!p&&getComputedStyle(p).display!=='none'},
 modulo:()=>document.querySelector('main .pt-c360-modulo'),
 tarjeta:(titulo)=>[...document.querySelectorAll('main .pt-c360-modulo > *')].find(e=>e.querySelector('h2')?.textContent.trim()===titulo),
 chip:(grupo,txt)=>{const b=[...document.querySelectorAll('main .pt-c360-modulo [role=group][aria-label="'+grupo+'"] button')].find(e=>e.textContent.trim().startsWith(txt));if(!b)throw new Error('sin chip '+txt);b.click();return b.getAttribute('aria-label')??b.textContent.trim()},
 chips:(grupo)=>[...document.querySelectorAll('main .pt-c360-modulo [role=group][aria-label="'+grupo+'"] button')].map(b=>({t:b.textContent.trim(),n:b.getAttribute('aria-label')??b.textContent.trim(),on:b.getAttribute('aria-pressed')==='true',candado:!!b.querySelector('svg'),rojo:!!b.closest('.pt-c360-caido')||b.classList.contains('ay-btn--danger')})),
}`
const comun = (js) => evaluar(`import("/assets/comun-CVU2GQ4h.js").then(m=>{${js}})`)
const comoRol = (rol) => comun(`m.O.ajustar({personaId:m.w[${JSON.stringify(rol)}]})`)
const pasos = []
const paso = async (nombre, fn) => { const antes = errores.length; try { await fn(); pasos.push(`ok    ${nombre}${errores.length > antes ? ` (con ${errores.length - antes} errores)` : ''}`) } catch (e) { pasos.push(`FALLA ${nombre}: ${e.message.split('\n').slice(0, 6).join(' | ')}`) } }
const abrirFicha = async (rol, cli = 'cli-001') => { await comoRol(rol); await ir('#/bandeja'); await dormir(300); await ir(`#/clientes/${cli}`); await esperarTexto('Datos visibles'); await dormir(1800) }
const abrirModulo = async (rol) => { await comoRol(rol); await ir('#/bandeja'); await dormir(300); await ir(RUTA_360); await esperar('!!__t.modulo()', `las tarjetas del módulo en ${RUTA_360} (¿la página pasa «modulo» al grafo?)`); await dormir(1800) }

await cdp('Page.enable'); await cdp('Runtime.enable'); await cdp('Network.enable')
await cdp('Emulation.setDeviceMetricsOverride', { width: 1366, height: 900, deviceScaleFactor: 1, mobile: false })
await cdp('Page.navigate', { url: BASE + '#/bandeja' }); await dormir(3500); await evaluar(H)

await paso('1 · panel del dato: «Sistema de origen», «Criterio» y «Consulta en línea» junto a valor, estado y fecha', async () => {
  await abrirFicha('GESTOR')
  await evaluar('__t.dato("DNI y KYC")'); await dormir(1200)
  const p = await evaluar('__t.panel()')
  for (const t of ['Sistema de origen', 'SIGDA / TAXON (maestro único del cliente)', 'Criterio', 'Se valida contra el maestro único de clientes.', 'Consulta en línea', 'si no figura, se registra como interesado', 'consulta en línea, sin copiar el dato']) if (!p.includes(t)) throw new Error(`falta «${t}» en el panel: ${p}`)
  if (!/verificado · 15 ene\.? 2026/.test(p)) throw new Error('se perdió el estado y la fecha: ' + p)
  if (await evaluar('__t.hay("Abrir la ficha del cliente", __t.aside())')) throw new Error('en la ficha del cliente ofrece ir a ella misma')
  if (!(await evaluar('__t.hay("Crear ticket", __t.aside())'))) throw new Error('sin «Crear ticket»')
  if (await evaluar('!!__t.modulo()')) throw new Error('la ficha del cliente muestra las tarjetas del módulo')
  await capturaDe('main .pt-grafo', '01-panel-dato-ficha')
})
await paso('2 · redirección según el rol: «Garantía vigente» lleva a Garantías postventa; «Acta de entrega» no (el gestor no ve EntregaFest)', async () => {
  await evaluar('__t.dato("Acta de entrega")'); await dormir(600)
  const p = await evaluar('__t.panel()')
  if (await evaluar('__t.hay("Ir a EntregaFest en vivo", __t.aside())') || !p.includes('Tu rol no tiene acceso a EntregaFest en vivo.')) throw new Error('acta: ' + p)
  await evaluar('__t.dato("Garantía vigente")'); await dormir(600)
  const b = await evaluar('[...__t.aside().querySelectorAll("button")].find(b=>b.textContent.startsWith("Ir a Garantías postventa"))?.textContent')
  if (b !== 'Ir a Garantías postventa→') throw new Error('botón: ' + b)
  await captura('02-panel-garantia')
  await evaluar('__t.boton("Ir a Garantías postventa", __t.aside())'); await esperar('location.hash==="#/garantias"', 'ir a #/garantias')
  await esperarTexto('Garantías')
})
await paso('1 · al elegir un sistema de origen: su «Plataforma», «Integración» y «Consulta en línea», y su estado', async () => {
  await abrirFicha('GESTOR')
  await evaluar('__t.fuente("Cobranza")'); await dormir(600)
  const p = await evaluar('__t.panel()')
  for (const t of ['Cobranza', 'En línea', 'Plataforma', 'Sistema de Cobranza y Cartera', 'Integración', 'Cronogramas, saldos y alertas de morosidad', 'Consulta en línea']) if (!p.includes(t)) throw new Error(`falta «${t}»: ${p}`)
  if (await evaluar('__t.hay("Crear ticket", __t.aside())')) throw new Error('un sistema de origen no crea tickets')
  await capturaDe('main .pt-grafo', '03-panel-sistema')
  await evaluar('__t.dato("Lotes")'); await dormir(600)
  if (!(await evaluar('__t.panel()')).includes('Criterio')) throw new Error('no vuelve al dato')
})
await paso('3 · «Crear ticket» abre Nuevo ticket con el cliente ya elegido', async () => {
  await evaluar('__t.boton("Crear ticket", __t.aside())'); await esperar('location.hash==="#/nuevo"', 'ir a #/nuevo'); await esperarTexto('Del maestro SIGDA/TAXON')
  const t = await texto()
  if (!t.includes('María Vargas Soto') || t.includes('Interesado (excepción)')) throw new Error('no precargó al cliente: ' + t.slice(0, 600))
  await captura('04-nuevo-ticket-con-cliente')
  await ir('#/bandeja'); await dormir(300); await ir('#/nuevo'); await dormir(900)
  if ((await texto()).includes('Del maestro SIGDA/TAXON')) throw new Error('el cliente se queda pegado en el siguiente Nuevo ticket')
})
await paso('2 · dentro del ticket: información sí, redirecciones y «Crear ticket» no; tampoco las tarjetas del módulo', async () => {
  await comoRol('GESTOR'); await ir('#/ticket/tk-460'); await esperarTexto('AIN-000493'); await evaluar('__t.pestana("Cliente")'); await esperarTexto('Datos visibles'); await dormir(2000)
  for (const dato of ['Garantía vigente', 'DNI y KYC', 'Correos']) {
    await evaluar(`__t.dato(${JSON.stringify(dato)})`); await dormir(400)
    const p = await evaluar('__t.panel()')
    if (!p.includes('Criterio')) throw new Error(`${dato}: sin información`)
    if (/→/.test(p) || p.includes('Crear ticket') || p.includes('Tu rol no tiene acceso')) throw new Error(`${dato}: ofrece salir del ticket: ${p}`)
  }
  if (await evaluar('!!__t.modulo()')) throw new Error('el ticket muestra las tarjetas del módulo')
  await capturaDe('main .pt-grafo', '05-ticket-sin-redireccion')
})
await paso('4 · módulo: tarjeta «Nodos del Grafo 360 y Redirección» con los 16 datos; elegir uno lo enfoca y ofrece su redirección', async () => {
  await abrirModulo('SUPERVISOR')
  const chips = await evaluar('__t.chips("Datos del cliente")')
  if (chips.length !== 16) throw new Error(`${chips.length} chips`)
  if (!(await evaluar('!!__t.tarjeta("Nodos del Grafo 360 y Redirección") && !!__t.tarjeta("Estado de sistemas de origen")'))) throw new Error('faltan las tarjetas')
  await evaluar('__t.chip("Datos del cliente","Exposición legal")'); await dormir(500)
  const c = await evaluar('__t.chips("Datos del cliente").find(x=>x.t==="Exposición legal")')
  if (!c.on) throw new Error('el chip no queda elegido')
  const p = await evaluar('__t.panel()')
  if (!p.startsWith('Exposición legal') || !p.includes('Ir a la Torre de Control CX')) throw new Error('panel: ' + p)
  const tarjeta = await evaluar('__t.tarjeta("Nodos del Grafo 360 y Redirección").innerText')
  if (!tarjeta.includes('Ir a la Torre de Control CX')) throw new Error('la tarjeta no ofrece la redirección: ' + tarjeta)
  await capturaDe('main .pt-grafo', '06-modulo-supervisor')
  await evaluar('__t.boton("Ir a la Torre de Control CX", __t.tarjeta("Nodos del Grafo 360 y Redirección"))'); await esperar('location.hash==="#/torre"', 'ir a #/torre')
})
await paso('4 · módulo como gestor: el restringido con candado y sin redirección; sin permiso al módulo, lo dice', async () => {
  await abrirModulo('GESTOR')
  const ex = await evaluar('__t.chips("Datos del cliente").find(x=>x.t==="Exposición legal")')
  if (!ex.candado || ex.n !== 'Exposición legal: restringido') throw new Error('chip restringido: ' + JSON.stringify(ex))
  await evaluar('__t.chip("Datos del cliente","Exposición legal")'); await dormir(400)
  let t = await evaluar('__t.tarjeta("Nodos del Grafo 360 y Redirección").innerText')
  if (!t.includes('Dato restringido para tu rol: no lleva a otro módulo.') || /→/.test(t)) throw new Error('restringido: ' + t)
  await evaluar('__t.chip("Datos del cliente","Cronograma")'); await dormir(400)
  t = await evaluar('__t.tarjeta("Nodos del Grafo 360 y Redirección").innerText')
  if (!t.includes('Tu rol no tiene acceso a Resolución por morosidad.')) throw new Error('sin permiso: ' + t)
  await capturaDe('main .pt-grafo', '07-modulo-gestor')
  await comoRol('COLABORADOR'); await dormir(800)
  t = await evaluar('__t.tarjeta("Nodos del Grafo 360 y Redirección").innerText')
  if (!t.includes('Ir a Resolución por morosidad')) throw new Error('colaborador: ' + t)
})
await paso('4 · tarjeta «Estado de sistemas de origen»: «Todas en línea», un chip por sistema y su información; caído en rojo', async () => {
  await abrirModulo('GESTOR')
  let s = await evaluar('__t.tarjeta("Estado de sistemas de origen").innerText')
  if (!s.includes('Todas en línea')) throw new Error(s)
  const f = await evaluar('__t.chips("Sistemas de origen")')
  if (f.length !== 8 || !f.every((x) => x.t.endsWith('· en línea'))) throw new Error(JSON.stringify(f))
  await comun('m.O.fuente("COBRANZA",true)'); await dormir(1500)
  s = await evaluar('__t.tarjeta("Estado de sistemas de origen").innerText')
  if (!s.includes('7 de 8 en línea')) throw new Error(s)
  const cob = await evaluar('__t.chips("Sistemas de origen").find(x=>x.t.startsWith("Cobranza"))')
  if (cob.t !== 'Cobranza · no disponible' || !cob.rojo) throw new Error(JSON.stringify(cob))
  const crono = await evaluar('__t.chips("Datos del cliente").find(x=>x.t==="Cronograma")')
  if (!crono.rojo || crono.n !== 'Cronograma: no disponible') throw new Error('dato caído: ' + JSON.stringify(crono))
  await evaluar('__t.chip("Sistemas de origen","Cobranza")'); await dormir(500)
  s = await evaluar('__t.tarjeta("Estado de sistemas de origen").innerText')
  for (const t of ['Plataforma', 'Sistema de Cobranza y Cartera', 'Integración', 'Consulta en línea']) if (!s.includes(t)) throw new Error(`falta «${t}» en la tarjeta: ${s}`)
  const p = await evaluar('__t.panel()')
  if (!p.startsWith('Cobranza') || !p.includes('No disponible')) throw new Error('panel: ' + p)
  if ((await evaluar('__t.chips("Datos del cliente")')).some((x) => x.on)) throw new Error('con un sistema elegido no debe quedar un dato elegido')
  await capturaDe('main .pt-grafo', '08-sistemas-cobranza-caida')
  await evaluar('__t.chip("Sistemas de origen","Cobranza")'); await dormir(300)
  if ((await evaluar('__t.chips("Sistemas de origen")')).some((x) => x.on)) throw new Error('no se puede soltar el sistema elegido')
  await comun('m.O.fuente("COBRANZA",false)'); await dormir(800)
})
await paso('4 · «Ocultar ficha» esconde el panel del dato y «Mostrar ficha» lo devuelve; elegir otro dato también', async () => {
  await evaluar('__t.boton("Ocultar ficha", __t.modulo())'); await dormir(300)
  if (await evaluar('__t.panelVisible()')) throw new Error('el panel sigue visible')
  if ((await evaluar('[...__t.modulo().querySelectorAll("button")].find(b=>b.textContent.trim()==="Mostrar ficha")?.getAttribute("aria-expanded")')) !== 'false') throw new Error('sin aria-expanded=false')
  await capturaDe('main .pt-grafo', '09-ficha-oculta')
  await evaluar('__t.boton("Mostrar ficha", __t.modulo())'); await dormir(300)
  if (!(await evaluar('__t.panelVisible()'))) throw new Error('no vuelve')
  await evaluar('__t.boton("Ocultar ficha", __t.modulo())'); await dormir(200)
  await evaluar('__t.chip("Datos del cliente","Lotes")'); await dormir(300)
  if (!(await evaluar('__t.panelVisible()'))) throw new Error('elegir un dato no vuelve a mostrar la ficha')
})
await paso('2 · «Correos» abre el ticket que toca del cliente', async () => {
  await abrirModulo('SUPERVISOR')
  await evaluar('__t.chip("Datos del cliente","Correos")'); await dormir(400)
  const esperado = await comun(`let d=m.__ptNucleo.datos(),c=(location.hash,sessionStorage.getItem("v3:cliente")||"cli-001"),ts=d.tickets.filter(t=>t.clienteId===c),u=t=>Math.max(-1,...d.interacciones.filter(x=>x.ticketId===t.id&&x.canal==="Correo").map(x=>+x.fecha),...(t.canal==="Correo"?[+t.abierto]:[])),con=ts.filter(t=>u(t)>=0).sort((a,b)=>u(b)-u(a));return {id:(con[0]??[...ts].sort((a,b)=>b.abierto-a.abierto)[0]).id,con:con.length>0}`)
  const etiqueta = esperado.con ? 'Abrir el último ticket con correo' : 'Abrir el último ticket del cliente'
  await evaluar(`__t.boton(${JSON.stringify(etiqueta)}, __t.tarjeta("Nodos del Grafo 360 y Redirección"))`)
  await esperar(`location.hash==="#/ticket/${esperado.id}"`, `ir a #/ticket/${esperado.id}`)
  await dormir(800); await captura('10-correos-al-ticket')
})
await paso('accesibilidad: los chips son botones con nombre y se eligen con el teclado', async () => {
  await abrirModulo('GESTOR')
  const sinNombre = await evaluar('[...__t.modulo().querySelectorAll("button")].filter(b=>!(b.getAttribute("aria-label")||b.textContent.trim())).length')
  if (sinNombre) throw new Error(`${sinNombre} botones sin nombre`)
  await evaluar('[...__t.modulo().querySelectorAll("[aria-label=\\"Datos del cliente\\"] button")].find(b=>b.textContent.trim()==="Documentos").focus()')
  await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r' })
  await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 })
  await dormir(400)
  const doc = await evaluar('__t.chips("Datos del cliente").find(x=>x.t==="Documentos")')
  if (!doc.on) throw new Error('Enter no elige el chip')
  if (!(await evaluar('document.activeElement?.textContent.trim()==="Documentos"'))) throw new Error('el foco se perdió al elegir')
})

console.log(pasos.join('\n'))
console.log(`\nCapturas en ${CAPS}`)
console.log(errores.length ? `\nERRORES (${errores.length}):\n` + [...new Set(errores)].join('\n') : '\nSin errores de JS, consola ni red.')
ws.close(); chrome.kill()
process.exit(pasos.some((p) => p.startsWith('FALLA')) || errores.length ? 1 : 0)
