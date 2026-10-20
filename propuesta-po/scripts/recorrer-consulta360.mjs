// HU-ATC-050 · recorrido en Chrome sin interfaz (CDP), con los mismos helpers que scripts/recorrer-navegador.mjs.
// Uso, con el servidor arriba (npm run preview):  node scripts/recorrer-consulta360.mjs   (BASE, CAPTURAS y CHROME como en recorrer-navegador.mjs)
import { spawn } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const BASE = process.env.BASE ?? 'http://localhost:5180/'
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const CAPS = (process.env.CAPTURAS ?? join(tmpdir(), 'hu050-capturas')) + '/'
const PERFIL = (process.env.PERFIL_CHROME ?? join(tmpdir(), 'hu050-chrome')) + '/'
rmSync(PERFIL, { recursive: true, force: true }); mkdirSync(CAPS, { recursive: true })
const PUERTO = Number(process.env.PUERTO_CDP ?? 9347)
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
const texto = () => evaluar('document.querySelector("main")?.innerText ?? document.body.innerText')
const esperarTexto = async (t, ms = 8000) => { for (let i = 0; i < ms / 100; i++) { if ((await texto()).includes(t)) return; await dormir(100) } throw new Error(`no apareció «${t}»\n---\n${(await texto()).slice(0, 1200)}`) }
const ir = (hash) => evaluar(`location.hash=${JSON.stringify(hash)}`)
const H = `
window.__t={
 boton:(txt)=>{const b=[...document.querySelectorAll('main button, main a')].find(e=>e.textContent.trim()===txt||e.textContent.trim().startsWith(txt));if(!b)throw new Error('sin botón '+txt);b.click();return true},
 escribir:(sel,val)=>{const e=document.querySelector(sel);if(!e)throw new Error('sin campo '+sel);const p=e.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:e.tagName==='SELECT'?HTMLSelectElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(p,'value').set.call(e,val);e.dispatchEvent(new Event(e.tagName==='SELECT'?'change':'input',{bubbles:true}));return true},
 campo:(etq)=>{const l=[...document.querySelectorAll('main label')].find(x=>x.textContent.trim().startsWith(etq));if(!l)throw new Error('sin etiqueta '+etq);return '#'+CSS.escape(l.htmlFor)},
 pestana:(txt)=>{const b=[...document.querySelectorAll('main [role=tab]')].find(e=>e.textContent.trim().startsWith(txt));if(!b)throw new Error('sin pestaña '+txt);b.click();return true},
 dato:(n)=>{const b=[...document.querySelectorAll('main ul[aria-label="Datos de la consulta 360"] button')].find(e=>e.textContent.startsWith(n+':'));if(!b)throw new Error('sin dato '+n);b.click();return b.textContent},
 ficha:()=>document.querySelector('main .pt-grafo aside.pt-lateral')?.innerText??'',
 panel:()=>[...document.querySelectorAll('main .pt-grafo aside.pt-lateral > *')].at(-1)?.innerText??'',
}`
const comoRol = (rol) => evaluar(`import("/assets/comun-CVU2GQ4h.js").then(m=>m.O.ajustar({personaId:m.w[${JSON.stringify(rol)}]}))`)
const pasos = []
const paso = async (nombre, fn) => { const antes = errores.length; try { await fn(); pasos.push(`ok    ${nombre}${errores.length > antes ? ` (con ${errores.length - antes} errores)` : ''}`) } catch (e) { pasos.push(`FALLA ${nombre}: ${e.message.split('\n').slice(0, 6).join(' | ')}`) } }
const abrirCliente = async (rol) => { await comoRol(rol); await ir('#/bandeja'); await dormir(300); await ir('#/ticket/tk-460'); await esperarTexto('AIN-000493'); await evaluar('__t.pestana("Cliente")'); await esperarTexto('Datos visibles'); await dormir(2500) }

await cdp('Page.enable'); await cdp('Runtime.enable'); await cdp('Network.enable')
await cdp('Emulation.setDeviceMetricsOverride', { width: 1366, height: 900, deviceScaleFactor: 1, mobile: false })
await cdp('Page.navigate', { url: BASE + '#/vivo' }); await dormir(3500); await evaluar(H)

await paso('CA-05 ficha del gestor: proyecto y etapa, lotes, cuotas vencidas, tickets y «Datos visibles 15 de 16»', async () => {
  await abrirCliente('GESTOR')
  const f = await evaluar('__t.ficha()')
  for (const t of ['María Vargas Soto', 'DNI 9484••••', 'Proyecto y etapa: Los Álamos de Carabayllo, Villa Sol II', 'Lotes 2', 'Cuotas vencidas', 'Tickets', 'Datos visibles 15 de 16']) if (!f.includes(t)) throw new Error(`falta «${t}» en la ficha: ${f.slice(0, 300)}`)
  if (/Exposición: /.test(f)) throw new Error('la ficha sigue mostrando la exposición a un rol sin permiso')
  await captura('01-ficha-gestor')
})
await paso('CA-06 panel del dato: «DNI y KYC» con estado y fecha, y la etiqueta «consulta en línea, sin copiar el dato»', async () => {
  await evaluar('__t.dato("DNI y KYC")'); await dormir(1500)
  const p = await evaluar('__t.panel()')
  if (!/verificado · 15 ene\.? 2026/.test(p) || !/conforme · 15 ene\.? 2026/.test(p)) throw new Error('panel sin fecha: ' + p)
  if (!p.includes('SIGDA / TAXON') || !p.includes('consulta en línea, sin copiar el dato')) throw new Error('panel sin origen o etiqueta: ' + p)
  await captura('02-panel-kyc')
  await evaluar('__t.dato("Cuotas vencidas")'); await dormir(1500)
  const c = await evaluar('__t.panel()')
  if (!/\d+ vencidas · al \d{2} [a-z]{3}\.? \d{4}/.test(c)) throw new Error('cuotas sin fecha: ' + c)
  await captura('03-panel-cuotas')
})
await paso('CA-07 gestor: «Exposición legal» con candado (panel, leyenda y escena), distinto de lo caído', async () => {
  await evaluar('__t.dato("Exposición legal")'); await dormir(800)
  const tieneCandado = await evaluar('!![...document.querySelectorAll("main .pt-grafo aside.pt-lateral .ay-alert__title svg")].length')
  const p = await evaluar('__t.panel()')
  if (!tieneCandado || !p.includes('Restringido')) throw new Error('panel sin candado: ' + p)
  const leyenda = await evaluar('[...document.querySelectorAll("main .ay-tag")].map(e=>e.textContent.trim()+(e.querySelector("svg")?"[candado]":"")).join("|")')
  if (!leyenda.includes('Restringido[candado]') || !leyenda.includes('Caído')) throw new Error('leyenda: ' + leyenda)
  const esc = await evaluar('[...document.querySelectorAll(".pt-escena-grafo b")].map(b=>b.textContent+(b.querySelector("span[aria-hidden]")?.style.display==="inline-block"?"[candado]":"")).join("|")')
  if (!esc.includes('Exposición legal[candado]') || /Estado de cuenta\[candado\]/.test(esc)) throw new Error('escena: ' + esc)
  await captura('04-restringido-gestor')
})
await paso('CA-07 supervisor y Legal: 16 de 16, sin candados', async () => {
  for (const rol of ['SUPERVISOR', 'LEGAL_RECLAMOS']) {
    await abrirCliente(rol)
    const f = await evaluar('__t.ficha()'); if (!f.includes('Datos visibles 16 de 16')) throw new Error(`${rol}: ${f.slice(0, 300)}`)
    const esc = await evaluar('[...document.querySelectorAll(".pt-escena-grafo b span[aria-hidden]")].filter(s=>s.style.display==="inline-block").length')
    if (esc) throw new Error(`${rol} ve ${esc} candados`)
  }
  await captura('05-supervisor')
})
await paso('CA-07 Coordinador CX: «Estado de cuenta» y «Exposición legal» con candado; ficha 9 de 16', async () => {
  await abrirCliente('COORDINADOR_CX')
  const f = await evaluar('__t.ficha()'); if (!f.includes('Datos visibles 9 de 16')) throw new Error('ficha: ' + f.slice(0, 300))
  const esc = await evaluar('[...document.querySelectorAll(".pt-escena-grafo b")].filter(b=>b.querySelector("span[aria-hidden]")?.style.display==="inline-block").map(b=>b.textContent).join("|")')
  for (const d of ['Estado de cuenta', 'Exposición legal']) if (!esc.includes(d)) throw new Error('sin candado en ' + d + ': ' + esc)
  const tarjeta = await evaluar('[...document.querySelectorAll("main .ay-badge")].filter(b=>b.textContent.includes("Restringido")&&b.querySelector("svg")).length')
  if (!tarjeta) throw new Error('las tarjetas no llevan candado')
  await captura('06-coordinador')
})
await paso('CA-03/CA-07: Cobranza caída sale «no disponible» en rojo, sin candado', async () => {
  await abrirCliente('GESTOR')
  await evaluar('import("/assets/comun-CVU2GQ4h.js").then(m=>m.O.fuente("COBRANZA",true))'); await dormir(2500)
  const esc = await evaluar('[...document.querySelectorAll(".pt-escena-grafo b")].map(b=>b.textContent+(b.querySelector("span[aria-hidden]")?.style.display==="inline-block"?"[candado]":"")).join("|")')
  if (/Cronograma\[candado\]/.test(esc)) throw new Error('lo caído lleva candado: ' + esc)
  await esperarTexto('Cobranza no disponible')
  await captura('07-cobranza-caida')
  await evaluar('import("/assets/comun-CVU2GQ4h.js").then(m=>m.O.fuente("COBRANZA",false))'); await dormir(500)
})
await paso('CA-08 dentro del ticket: DNI inexistente abre la excepción con «Registrar como interesado» y «Derivar»', async () => {
  await abrirCliente('GESTOR')
  await evaluar('__t.escribir(__t.campo("Buscar cliente o documento"),"12345678")'); await evaluar('__t.boton("Consultar")'); await esperarTexto('No está en SIGDA/TAXON')
  const t = await texto(); if (t.includes('Sin coincidencias relevantes')) throw new Error('lo trató como búsqueda de documentos')
  await captura('08-no-encontrado-ticket')
  await evaluar('__t.boton("Derivar")'); await dormir(600)
  const dlg = await evaluar('document.querySelector("[role=dialog]")?.innerText ?? ""'); if (!dlg.includes('Derivar AIN-000493') || !dlg.includes('Área de destino')) throw new Error('no abrió el diálogo de derivar: ' + dlg.slice(0, 200))
  await captura('09-derivar')
  await evaluar('[...document.querySelectorAll("[role=dialog] button")].find(b=>b.textContent.trim()==="Cancelar").click()'); await dormir(400)
  const antes = await evaluar('import("/assets/comun-CVU2GQ4h.js").then(m=>m.Un.length)')
  await evaluar('__t.boton("Registrar como interesado")'); await esperarTexto('Interesado (excepción)')
  if ((await evaluar('location.hash')) !== '#/nuevo') throw new Error('no fue a Nuevo ticket')
  const despues = await evaluar('import("/assets/comun-CVU2GQ4h.js").then(m=>m.Un.length)'); if (antes !== despues) throw new Error('cambió el maestro de clientes')
  await captura('10-nuevo-interesado')
})
await paso('CA-08 en #/clientes/cli-001: solo «Registrar como interesado» (no hay ticket que derivar); los documentos se siguen buscando', async () => {
  await ir('#/clientes/cli-001'); await esperarTexto('Datos visibles'); await dormir(800)
  await evaluar('__t.escribir(__t.campo("Buscar cliente o documento"),"12345678")'); await evaluar('__t.boton("Consultar")'); await esperarTexto('No está en SIGDA/TAXON')
  const b = await evaluar('[...document.querySelectorAll("main .ay-alert button")].map(b=>b.textContent.trim()).join("|")'); if (b.includes('Derivar') || !b.includes('Registrar como interesado')) throw new Error('acciones: ' + b)
  await evaluar('__t.escribir(__t.campo("Buscar cliente o documento"),"adenda de cambio de lote")'); await evaluar('__t.boton("Consultar")'); await dormir(800)
  const t = await texto(); if (t.includes('No está en SIGDA/TAXON')) throw new Error('la excepción no se limpia con otra búsqueda')
})
await paso('CA-10 bitácora del ticket: nota interna con quién, cuándo y secciones vistas', async () => {
  await abrirCliente('GESTOR'); await evaluar('__t.pestana("Interacciones")'); await esperarTexto('Consulta 360 del cliente. Secciones vistas:')
  const t = await texto(); if (!t.includes('Carla Rojas')) throw new Error('sin autor')
  await captura('11-bitacora')
})
await paso('CA-09 sigue: pie con tiempo de respuesta y fuentes en línea', async () => {
  await evaluar('__t.pestana("Cliente")'); await esperarTexto('fuentes en línea', 6000)
})

console.log(pasos.join('\n'))
console.log(`\nCapturas en ${CAPS}`)
console.log(errores.length ? `\nERRORES (${errores.length}):\n` + [...new Set(errores)].join('\n') : '\nSin errores de JS, consola ni red.')
ws.close(); chrome.kill()
process.exit(pasos.some((p) => p.startsWith('FALLA')) || errores.length ? 1 : 0)
