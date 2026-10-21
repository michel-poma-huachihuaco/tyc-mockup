// Recorre en Chrome sin interfaz (protocolo CDP, sin dependencias) la «Operación en vivo» frente a la HU-ATC-067 del PLT-04 v1.3:
// nombre, modo simulación (CA-08), tiempo real, correo al vencer y Sala de Comité (CA-03), paso «en bandeja» (CA-05), panel del
// área (CA-04), filtro por razón social y áreas permitidas (CA-07) y cajas por tipo (CA-02, captura). Sale con 1 si un paso falla
// o hay errores de JS, de consola o de red. Uso, con el servidor arriba (npm run preview):  node scripts/recorrer-operacion-vivo.mjs
//   BASE=http://localhost:5180/  CHROME=<ruta de Chrome>  CAPTURAS=<carpeta>  PERFIL_CHROME=<carpeta> (por defecto, temporales)
// El /favicon.ico que pide el navegador por su cuenta no cuenta: el index.html del artifact no enlaza ninguno.
import { spawn } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const BASE = process.env.BASE ?? 'http://localhost:5180/'
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const CAPS = (process.env.CAPTURAS ?? join(tmpdir(), 'propuesta-po-capturas')) + '/'
const PERFIL = (process.env.PERFIL_CHROME ?? join(tmpdir(), 'propuesta-po-chrome')) + '/'
rmSync(PERFIL, { recursive: true, force: true }); mkdirSync(CAPS, { recursive: true })
const PUERTO = Number(process.env.PUERTO_CDP ?? 9333)
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PUERTO}`, `--user-data-dir=${PERFIL}`, '--no-first-run', '--no-default-browser-check', '--window-size=1366,900', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' })
const dormir = (ms) => new Promise((r) => setTimeout(r, ms))
let info
for (let i = 0; i < 50 && !info; i++) { try { info = await (await fetch(`http://127.0.0.1:${PUERTO}/json/list`)).json() } catch { await dormir(200) } }
const pagina = info.find((t) => t.type === 'page')
const ws = new WebSocket(pagina.webSocketDebuggerUrl)
await new Promise((r) => ws.addEventListener('open', r, { once: true }))
let sec = 0
const pend = new Map()
const errores = []
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data)
  if (m.id && pend.has(m.id)) { const { ok, ko } = pend.get(m.id); pend.delete(m.id); m.error ? ko(new Error(JSON.stringify(m.error))) : ok(m.result) }
  else if (m.method === 'Runtime.exceptionThrown') errores.push(`excepción: ${m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text}`)
  else if (m.method === 'Runtime.consoleAPICalled' && ['error', 'assert'].includes(m.params.type)) errores.push(`console.${m.params.type}: ${m.params.args.map((a) => a.value ?? a.description).join(' ')}`)
  else if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error' && !String(m.params.entry.url).endsWith('/favicon.ico')) errores.push(`log: ${m.params.entry.text} ${m.params.entry.url ?? ''}`)
  else if (m.method === 'Network.responseReceived' && m.params.response.status >= 400 && !m.params.response.url.endsWith('/favicon.ico')) errores.push(`HTTP ${m.params.response.status}: ${m.params.response.url}`)
  else if (m.method === 'Network.loadingFailed' && !m.params.canceled) errores.push(`red: ${m.params.errorText}`)
})
const cdp = (method, params = {}) => new Promise((ok, ko) => { const id = ++sec; pend.set(id, { ok, ko }); ws.send(JSON.stringify({ id, method, params })) })
const evaluar = async (expr) => {
  const r = await cdp('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })
  if (r.exceptionDetails) throw new Error(`evaluar: ${r.exceptionDetails.exception?.description ?? r.exceptionDetails.text}\n${expr.slice(0, 200)}`)
  return r.result.value
}
const captura = async (nombre) => { const r = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }); writeFileSync(CAPS + nombre + '.png', Buffer.from(r.data, 'base64')) }
const texto = () => evaluar('document.querySelector("main")?.innerText ?? document.body.innerText')
const esperarTexto = async (t, ms = 8000) => { for (let i = 0; i < ms / 100; i++) { if ((await texto()).includes(t)) return; await dormir(100) } throw new Error(`no apareció «${t}»\n---\n${(await texto()).slice(0, 1500)}`) }
const ir = (hash) => evaluar(`location.hash=${JSON.stringify(hash)}`)
// helpers que operan como un usuario (React escucha «input» y clics reales)
const H = `
window.__t={
 boton:(txt)=>{const b=[...document.querySelectorAll('main button, main a')].find(e=>e.textContent.trim()===txt||e.textContent.trim().startsWith(txt));if(!b)throw new Error('sin botón '+txt);b.click();return true},
 escribir:(sel,val)=>{const e=document.querySelector(sel);if(!e)throw new Error('sin campo '+sel);const p=e.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:e.tagName==='SELECT'?HTMLSelectElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(p,'value').set.call(e,val);e.dispatchEvent(new Event(e.tagName==='SELECT'?'change':'input',{bubbles:true}));return true},
 campo:(etq)=>{const l=[...document.querySelectorAll('main label')].find(x=>x.textContent.trim().startsWith(etq));if(!l)throw new Error('sin etiqueta '+etq);return '#'+CSS.escape(l.htmlFor)},
}`
const pasos = []
const paso = async (nombre, fn) => { const antes = errores.length; try { await fn(); pasos.push(`ok    ${nombre}${errores.length > antes ? ` (con ${errores.length - antes} errores)` : ''}`) } catch (e) { pasos.push(`FALLA ${nombre}: ${e.message.split('\n').slice(0, 6).join(' | ')}`) } }

await cdp('Page.enable'); await cdp('Runtime.enable'); await cdp('Log.enable'); await cdp('Network.enable')
await cdp('Emulation.setDeviceMetricsOverride', { width: 1366, height: 900, deviceScaleFactor: 1, mobile: false })
await cdp('Page.navigate', { url: BASE + '#/vivo' })
await dormir(3500)
await evaluar(H)

// ------------------------------------------------------------------ HU-ATC-067 (propuesta del dossier)
const MOD = 'import("/assets/comun-CVU2GQ4h.js")'
const comoRol = (rol) => evaluar(`${MOD}.then(m=>m.O.ajustar({personaId:m.w[${JSON.stringify(rol)}]}))`)
const sim = (on) => evaluar(`${MOD}.then(m=>m.O.ajustar({vivoSimulacion:${on}}))`)
const botones = () => evaluar('[...document.querySelectorAll("main button")].map(b=>b.textContent.trim())')
const filasTabla = (cap) => evaluar(`[...document.querySelectorAll("table")].find(t=>t.getAttribute("aria-label")===${JSON.stringify(cap)})?.querySelectorAll("tbody tr").length ?? -1`)
const alVivo = async () => { await evaluar('scrollTo(0,0)'); await dormir(900) }

await paso('Nombre: «Operación en vivo» en el título y en su propio módulo del menú', async () => {
  await comoRol('SUPERVISOR'); await ir('#/vivo'); await dormir(1500); await esperarTexto('Operación en vivo')
  if ((await texto()).includes('Vista en vivo')) throw new Error('aún se lee «Vista en vivo»')
  const item = await evaluar('[...document.querySelectorAll("nav a, aside a")].find(a=>a.textContent.trim()==="Operación en vivo")?.getAttribute("aria-current")')
  if (item !== 'page' && item !== 'true') throw new Error('el menú no marca «Operación en vivo» como la página actual: ' + item)
})
await paso('CA-08: pausa y velocidad (x1 ↔ x2) solo en el modo simulación, que se apaga y enciende en Herramientas › Simulación', async () => {
  let b = await botones(); if (!b.includes('Pausa') || !b.includes('Velocidad x1')) throw new Error('el modo simulación (por defecto) no muestra pausa y velocidad: ' + b.join('|'))
  if (!(await texto()).includes('Modo simulación')) throw new Error('sin la etiqueta «Modo simulación»')
  await evaluar('document.querySelector(".pt-herr__fab").click()'); await dormir(300)
  await evaluar('[...document.querySelectorAll(".pt-herr__fila")].find(f=>f.textContent.includes("Simulación")).click()'); await dormir(900)
  await evaluar('[...document.querySelectorAll("input[role=switch]")].find(i=>document.getElementById(i.getAttribute("aria-labelledby"))?.textContent==="Modo simulación").click()'); await dormir(400)
  await captura('hu067-01-panel-simulacion')
  await evaluar('document.querySelector(".ay-sidepanel button[aria-label^=Cerrar]")?.click()'); await dormir(600)
  if (await evaluar('!!document.querySelector(".ay-sidepanel")')) throw new Error('el panel Simulación sigue abierto')
  const off = await evaluar(`${MOD}.then(m=>m.__ptNucleo.sim().vivoSimulacion)`); if (off !== false) throw new Error('el interruptor no apagó el modo simulación')
  b = await botones(); if (b.some((x) => /^(Pausa|Reanudar|Velocidad)/.test(x))) throw new Error('hay pausa o velocidad fuera del modo simulación: ' + b.join('|'))
  if ((await texto()).includes('Modo simulación')) throw new Error('la etiqueta «Modo simulación» sigue sin el modo')
  const n2 = await evaluar(`${MOD}.then(m=>m.__ptNucleo.datos().tickets.length)`); await dormir(3500)
  const n3 = await evaluar(`${MOD}.then(m=>m.__ptNucleo.datos().tickets.length)`); if (n3 !== n2) throw new Error('sin modo simulación siguen entrando tickets')
  await sim(true); await dormir(600)
  const vel = []
  for (let i = 0; i < 3; i++) { await evaluar('[...document.querySelectorAll("main button")].find(b=>b.textContent.startsWith("Velocidad")).click()'); await dormir(150); vel.push((await botones()).find((x) => x.startsWith('Velocidad'))) }
  if (vel.join('|') !== 'Velocidad x2|Velocidad x1|Velocidad x2') throw new Error('secuencia de velocidad: ' + vel.join(' → '))
  const n0 = await evaluar(`${MOD}.then(m=>m.__ptNucleo.datos().tickets.length)`); await dormir(4000)
  const n1 = await evaluar(`${MOD}.then(m=>m.__ptNucleo.datos().tickets.length)`); if (n1 <= n0) throw new Error('en modo simulación no entran tickets de ejemplo')
  await sim(false); await dormir(600)
  await alVivo(); await captura('hu067-02-vivo-supervisor')
})
await paso('CA-08: un cambio de estado en la bandeja se refleja sin recargar (≤ 5 s)', async () => {
  const id = await evaluar(`${MOD}.then(m=>m.__ptNucleo.datos().tickets.find(t=>t.estado==="OPEN"&&t.responsable)?.id)`)
  const num = await evaluar(`${MOD}.then(m=>m.__ptNucleo.datos().tickets.find(t=>t.id===${JSON.stringify(id)}).numero)`)
  await evaluar(`${MOD}.then(m=>m.E.cambiarEstado(${JSON.stringify(id)},"IN_PROGRESS",null))`); await dormir(1500)
  const fila = await evaluar(`[...document.querySelectorAll("table")].find(t=>t.getAttribute("aria-label")==="Tickets de la escena")?.innerText.split("\\n").find(l=>l.includes(${JSON.stringify(num)}))??""`)
  if (!/En atención/.test(fila)) throw new Error('la tabla no refleja el cambio: ' + fila)
})
await paso('CA-03: la bitácora muestra el correo al responsable con copia a su líder y la Sala de Comité lista los vencidos', async () => {
  await evaluar(`${MOD}.then(m=>m.O.avanzar(9))`); await dormir(1200)   // +1 día hábil: corre el job y vencen tickets
  const bit = await evaluar('[...document.querySelectorAll("main li")].map(l=>l.textContent).join("\\n")')
  if (!/SLA vencido: correo a/.test(bit)) throw new Error('bitácora sin correo: ' + bit.slice(0, 400))
  const sala = await evaluar('[...document.querySelectorAll("b")].find(e=>e.textContent==="Sala de Comité")?.nextElementSibling?.textContent ?? ""')
  if (!/\d+ con SLA vencido · \d+ escalados en cadena/.test(sala)) throw new Error('rótulo de la Sala de Comité: ' + sala)
  const linea = await evaluar('[...document.querySelectorAll("main li")].map(l=>l.textContent).find(t=>/SLA vencido/.test(t))??""'); console.log('   bitácora:', linea, '| comité:', sala)
})
await paso('CA-05: la ficha del ticket muestra el paso «En la bandeja orquestadora» con su hora', async () => {
  const num = await evaluar(`${MOD}.then(m=>m.__ptNucleo.datos().tickets.find(t=>t.estado==="IN_PROGRESS"&&t.responsable)?.numero)`)
  await evaluar(`[...document.querySelectorAll("main table button")].find(b=>b.textContent.trim()===${JSON.stringify(num)})?.click()`); await dormir(800)
  const ficha = await evaluar('document.querySelector(".v3-ficha")?.innerText ?? ""')
  const pasos = ficha.split('\n').filter((l) => / · /.test(l))
  const iB = pasos.findIndex((l) => l.includes('En la bandeja orquestadora')), iR = pasos.findIndex((l) => l.includes('Registrado'))
  if (iB < 0 || iR < 0 || iB > iR) throw new Error('recorrido sin «en bandeja» antes del registro (más reciente arriba): ' + pasos.join(' / '))
  await alVivo(); await captura('hu067-03-ficha-bandeja')
  await evaluar('document.querySelector(".v3-f-x")?.click()'); await dormir(300)
})
await paso('CA-04: el nombre del área en «Por área» abre el panel; solo informativo (sin reasignar)', async () => {
  await evaluar('[...document.querySelectorAll("table")].find(t=>t.getAttribute("aria-label")==="Tickets por área").querySelectorAll("tbody button")[1].click()'); await dormir(700)
  const p = await evaluar('document.querySelector(".v3-ficha")?.innerText ?? ""')
  for (const t of ['Cobranza', 'En cola', 'Gestores ocupados', 'Resueltos', '% en SLA', 'Tickets del área', 'Carga de cada gestor', 'límite 12', 'Reasignaciones por carga']) if (!p.toLowerCase().includes(t.toLowerCase())) throw new Error(`panel sin «${t}»: ` + p.slice(0, 300))
  const acc = await evaluar('[...document.querySelectorAll(".v3-ficha button")].map(b=>b.textContent.trim()).filter(Boolean)')
  if (acc.some((x) => /reasign|balance/i.test(x))) throw new Error('el panel ofrece reasignar: ' + acc.join('|'))
  await alVivo(); await captura('hu067-04-panel-area')
})
await paso('CA-04: tocar el suelo de un área en la escena abre su panel', async () => {
  await evaluar('document.querySelector(".v3-f-x")?.click()'); await dormir(300); await evaluar('document.querySelector(".pt-escena canvas").scrollIntoView({block:"center"})'); await dormir(1200)
  // se barre la escena con toques (cada 30 px) hasta abrir la sala «Cobranza»; los toques que caen sobre un ticket abren su ficha
  const r = await evaluar('(()=>{const b=document.querySelector(".pt-escena canvas").getBoundingClientRect();return {l:b.left,t:b.top,w:b.width,h:b.height}})()')
  let ok = false
  for (let y = r.t + 20; y < r.t + r.h - 20 && !ok; y += 30) for (let x = r.l + 20; x < r.l + r.w - 20 && !ok; x += 30) {
    await cdp('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 }); await cdp('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 }); await dormir(60)
    const p = await evaluar('document.querySelector(".v3-ficha")?.getAttribute("aria-label") ?? ""')
    if (p === 'Detalle del área Cobranza') { ok = true; console.log('   toque que abrió la sala:', Math.round(x - r.l), Math.round(y - r.t), '(px desde la esquina del lienzo)') }
    else if (p) { await evaluar('document.querySelector(".v3-f-x")?.click()'); await dormir(60) }
  }
  await captura('hu067-05-clic-sala')
  if (!ok) throw new Error('ningún toque en la sala abrió el panel de Cobranza')
})
await paso('CA-07: el gestor ve solo su área; la razón social filtra escena, tablas e indicadores', async () => {
  await evaluar('document.querySelector(".v3-f-x")?.click()'); await comoRol('GESTOR'); await dormir(1500)
  const areas = await evaluar('[...[...document.querySelectorAll("table")].find(t=>t.getAttribute("aria-label")==="Tickets por área").querySelectorAll("tbody tr")].map(r=>r.cells[0].innerText)')
  if (areas.join('|') !== 'Atención Eje 1') throw new Error('áreas del gestor: ' + areas.join('|'))
  const salas = await evaluar('[...document.querySelectorAll("small")].map(e=>e.textContent).filter(t=>/ocupados/.test(t)).length'); if (salas !== 1) throw new Error('rótulos de sala en la escena: ' + salas)
  await comoRol('SUPERVISOR'); await dormir(1500)
  await evaluar('(()=>{const s=document.querySelector("main select[aria-label=\'Razón social\']");Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,"value").set.call(s,"ALT");s.dispatchEvent(new Event("change",{bubbles:true}));return true})()'); await dormir(900)
  const nums = await evaluar('[...[...document.querySelectorAll("table")].find(t=>t.getAttribute("aria-label")==="Tickets de la escena").querySelectorAll("tbody tr")].map(r=>r.cells[0].innerText.trim()).filter(Boolean)')
  if (!nums.length || nums.some((n) => !n.startsWith('ALT-'))) throw new Error('tickets con otra razón social: ' + nums.join('|'))
  const bit = await evaluar('[...document.querySelectorAll("main li")].map(l=>l.textContent).filter(t=>/^\\d/.test(t)&&/[A-Z]{3}-\\d{6}/.test(t))')
  if (bit.some((t) => !/ALT-\d{6}/.test(t))) throw new Error('bitácora con otra razón social: ' + bit.join(' / '))
  await alVivo(); await captura('hu067-06-filtro-alt')
  await evaluar('(()=>{const s=document.querySelector("main select[aria-label=\'Razón social\']");Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,"value").set.call(s,"");s.dispatchEvent(new Event("change",{bubbles:true}));return true})()')
})
await paso('CA-02: captura de cerca para revisar el color por tipo', async () => {
  await evaluar('document.querySelector(".pt-escena canvas").scrollIntoView({block:"center"})'); await cdp('Emulation.setDeviceMetricsOverride', { width: 1366, height: 900, deviceScaleFactor: 2, mobile: false }); await dormir(1500); await captura('hu067-07-cajas-por-tipo')
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1366, height: 900, deviceScaleFactor: 1, mobile: false })
})

console.log(pasos.join('\n'))
console.log(errores.length ? `\nERRORES (${errores.length}):\n` + [...new Set(errores)].join('\n') : '\nSin errores de JS, consola ni red.')
ws.close(); chrome.kill()
process.exit(pasos.some((p) => p.startsWith('FALLA')) || errores.length ? 1 : 0)
