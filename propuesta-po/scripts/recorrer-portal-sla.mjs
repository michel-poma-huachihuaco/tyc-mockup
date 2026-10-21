// Recorre en Chrome sin interfaz (CDP, sin dependencias) la HU-ATC-066 parcheada: CA-01 (el SLA se pausa en «pendiente del
// cliente» y se reanuda al responder en Mi Portal; se ve en Mi Portal y en «Compromisos SLA e hitos» de la consola) y CA-04 (el
// administrador funcional configura los días hábiles en Configuración › Cierre automático y el job del sistema cierra el ticket
// resuelto sin respuesta al avanzar el reloj; el cliente ve el cierre y el aviso). Sale con 1 si un paso falla o hay errores de
// JS, de consola o de red. Parte de la semilla recién cargada.
// Uso, con el servidor arriba (npm run preview):  node scripts/recorrer-portal-sla.mjs
//   BASE=http://localhost:5180/  CHROME=<ruta de Chrome>  CAPTURAS=<carpeta>  PERFIL_CHROME=<carpeta>  PUERTO_CDP=<puerto> (9437)
import { spawn } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const BASE = process.env.BASE ?? 'http://localhost:5180/'
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const CAPS = (process.env.CAPTURAS ?? join(tmpdir(), 'portal-sla-capturas')) + '/'
const PERFIL = (process.env.PERFIL_CHROME ?? join(tmpdir(), 'portal-sla-chrome')) + '/'
rmSync(PERFIL, { recursive: true, force: true }); mkdirSync(CAPS, { recursive: true })
const PUERTO = Number(process.env.PUERTO_CDP ?? 9437)
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PUERTO}`, `--user-data-dir=${PERFIL}`, '--no-first-run', '--no-default-browser-check', '--window-size=1366,900', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' })
const dormir = (ms) => new Promise((r) => setTimeout(r, ms))
let info
for (let i = 0; i < 50 && !info; i++) { try { info = await (await fetch(`http://127.0.0.1:${PUERTO}/json/list`)).json() } catch { await dormir(200) } }
const ws = new WebSocket(info.find((t) => t.type === 'page').webSocketDebuggerUrl)
await new Promise((r) => ws.addEventListener('open', r, { once: true }))
let sec = 0
const pend = new Map(), errores = []
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
const captura = async (nombre) => { const r = await cdp('Page.captureScreenshot', { format: 'png' }); writeFileSync(CAPS + nombre + '.png', Buffer.from(r.data, 'base64')) }
const texto = () => evaluar('document.body.innerText')
const esperarTexto = async (t, ms = 8000) => { for (let i = 0; i < ms / 100; i++) { if ((await texto()).includes(t)) return; await dormir(100) } throw new Error(`no apareció «${t}»\n---\n${(await texto()).slice(0, 1500)}`) }
const ir = (hash) => evaluar(`location.hash=${JSON.stringify(hash)}`)
const C = 'import("/assets/comun-CVU2GQ4h.js")'
const comoRol = (rol) => evaluar(`${C}.then(m=>m.O.ajustar({personaId:m.w[${JSON.stringify(rol)}]}))`)
const como = (personaId) => evaluar(`${C}.then(m=>m.O.ajustar({personaId:${JSON.stringify(personaId)}}))`)
// botones visibles del documento entero (los diálogos y paneles no viven dentro de <main>)
const boton = (txt) => evaluar(`(()=>{const b=[...document.querySelectorAll('button, a, [role=tab]')].filter(e=>e.offsetParent!==null).find(e=>e.textContent.trim()===${JSON.stringify(txt)});if(!b)throw new Error('sin botón '+${JSON.stringify(txt)});b.click();return true})()`)
const H = `
window.__t={
 escribir:(sel,val)=>{const e=document.querySelector(sel);if(!e)throw new Error('sin campo '+sel);const p=e.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(p,'value').set.call(e,val);e.dispatchEvent(new Event('input',{bubbles:true}));return true},
 campo:(etq)=>{const l=[...document.querySelectorAll('main label')].find(x=>x.textContent.trim().startsWith(etq));if(!l)throw new Error('sin etiqueta '+etq);return '#'+CSS.escape(l.htmlFor)},
}`
const dd = (dt) => evaluar(`[...document.querySelectorAll("main dt")].find(x=>x.textContent.trim()===${JSON.stringify(dt)})?.nextElementSibling?.textContent ?? ""`)
const tarjeta = (titulo) => `(()=>{const h=[...document.querySelectorAll("main h2")].find(x=>x.textContent.trim()===${JSON.stringify(titulo)});return h?.closest(".ay-card,section,article")??h?.parentElement?.parentElement})()`
const entrar = async (dni) => {
  await ir('#/portal'); await dormir(600)
  if ((await texto()).includes('Salir')) { await boton('Salir'); await dormir(400) }
  await esperarTexto('Entra a Mi Portal')
  await evaluar(`__t.escribir(__t.campo("DNI"),${JSON.stringify(dni)})`); await dormir(200); await boton('Enviarme el código'); await esperarTexto('Código de un solo uso')
  const cod = await evaluar('document.querySelector(".pp-codigo").textContent')
  await evaluar(`__t.escribir("#pp-codigo",${JSON.stringify(cod)})`); await boton('Entrar'); await esperarTexto('Mis tickets')
}
const pasos = []
const paso = async (nombre, fn) => { const antes = errores.length; try { await fn(); pasos.push(`ok    ${nombre}${errores.length > antes ? ` (con ${errores.length - antes} errores)` : ''}`) } catch (e) { pasos.push(`FALLA ${nombre}: ${e.message.split('\n').slice(0, 6).join(' | ')}`) } }

await cdp('Page.enable'); await cdp('Runtime.enable'); await cdp('Log.enable'); await cdp('Network.enable')
await cdp('Emulation.setDeviceMetricsOverride', { width: 1366, height: 900, deviceScaleFactor: 1, mobile: false })
await cdp('Page.navigate', { url: BASE + '#/bandeja' }); await dormir(3000); await evaluar(H)

await paso('CA-04: Configuración › Cierre automático (administrador funcional) pasa de 5 a 3 días hábiles', async () => {
  await comoRol('ADMIN_FUNCIONAL'); await ir('#/configuracion'); await esperarTexto('Flujos por tipo, subtipo y área')
  await boton('Cierre automático'); await esperarTexto('Cierre automático de tickets resueltos')
  const campo = 'document.getElementById("cfg-cierre-dias")'
  if (await evaluar(`${campo}.value`) !== '5') throw new Error('el valor inicial no es 5')
  await captura('sla-01-config-inicial')
  for (let i = 0; i < 2; i++) { await evaluar('document.querySelector(\'button[aria-label^="Reducir días hábiles"]\').click()'); await dormir(150) }
  if (await evaluar(`${campo}.value`) !== '3') throw new Error('el campo no bajó a 3')
  await boton('Guardar'); await esperarTexto('Guardado: un ticket resuelto se cierra solo a los 3 días hábiles'); await esperarTexto('Último cambio:')
  const d = await evaluar(`${C}.then(m=>m.__ptNucleo.datos().parametros?.diasConfirmacion)`); if (d !== 3) throw new Error('no se guardó: ' + d)
  const notas = await evaluar('[...(globalThis.__ptNotas?.values()??[])].flatMap(m=>[...m.keys()]).join("\\n")')
  if (!/5 días hábiles, es un supuesto del equipo/.test(notas)) throw new Error('falta el supuesto en el panel de notas')
  await captura('sla-02-config-guardada')
})
await paso('CA-04: sin permiso, otro rol no ve la pestaña (Configuración es del administrador funcional)', async () => {
  await comoRol('SUPERVISOR'); await ir('#/configuracion'); await dormir(800)
  if ((await texto()).includes('Cierre automático de tickets resueltos')) throw new Error('el supervisor ve la configuración')
})
let antes
await paso('CA-01: en la consola, el ticket en espera del cliente muestra el SLA en pausa', async () => {
  await como('p-crojas'); await ir('#/ticket/tk-272'); await esperarTexto('Compromisos SLA e hitos')
  const t = await evaluar(`${tarjeta('Compromisos SLA e hitos')}?.innerText ?? ""`)
  if (!/SLA en pausa\s*Desde .*: espera la respuesta del cliente/.test(t)) throw new Error('sin la pausa: ' + t)
  await evaluar(`${tarjeta('Compromisos SLA e hitos')}?.scrollIntoView({block:"center"})`); await dormir(300); await captura('sla-03-consola-en-pausa')
})
await paso('CA-01: en Mi Portal, «pendiente de tu respuesta» con el plazo en pausa; al responder vuelve a atención y el plazo se reanuda', async () => {
  await como('p-cliente'); await entrar('95638594')
  const fila = await evaluar('[...document.querySelectorAll("main tr")].map(r=>r.innerText).find(t=>t.includes("AIN-000486"))??""')
  if (!/en pausa/.test(fila)) throw new Error('Mis tickets no dice que el compromiso está en pausa: ' + fila)
  await boton('AIN-000486'); await esperarTexto('Te necesitamos')
  antes = await dd('Fecha de compromiso')
  if (!/en pausa hasta tu respuesta/.test(antes)) throw new Error('compromiso: ' + antes)
  await captura('sla-04-portal-en-pausa')
  await evaluar('__t.escribir(__t.campo("Tu respuesta"),"La visita fue el 8 de octubre a las 10:00, en la caseta de ventas.")'); await boton('Enviar mi respuesta')
  await esperarTexto('Tú escribiste'); await esperarTexto('el plazo se reanudó')
  const despues = await dd('Fecha de compromiso')
  if (/en pausa/.test(despues) || despues === antes.replace(/ · en pausa.*/, '')) throw new Error(`la fecha de compromiso no se corrió: ${antes} → ${despues}`)
  console.log(`   compromiso: ${antes} → ${despues}`)
  await captura('sla-05-portal-reanudado')
})
await paso('CA-01: en la consola, la pausa queda registrada y los vencimientos se corrieron', async () => {
  await como('p-crojas'); await ir('#/ticket/tk-272'); await esperarTexto('Compromisos SLA e hitos')
  const t = await evaluar(`${tarjeta('Compromisos SLA e hitos')}?.innerText ?? ""`)
  if (!/Pausas del SLA\s*[\d.,]+ h hábiles en espera del cliente; los vencimientos se corrieron ese tiempo/.test(t) || /SLA en pausa/.test(t)) throw new Error('pausas: ' + t)
  await evaluar(`${tarjeta('Compromisos SLA e hitos')}?.scrollIntoView({block:"center"})`); await dormir(300); await captura('sla-06-consola-reanudado')
})
await paso('CA-04: Mi Portal anuncia el cierre automático con los días configurados y ya no ofrece «Simular que venció el plazo»', async () => {
  await como('p-cliente'); await entrar('94805186')
  await boton('AIN-000488'); await esperarTexto('¿Se solucionó tu caso?')
  const t = await texto()
  if (!/se cierra solo al terminar el .* \(3 días hábiles después de resuelto\)/.test(t)) throw new Error('aviso del plazo: ' + t.slice(0, 1200))
  if (t.includes('Simular que venció el plazo')) throw new Error('sigue el botón de simulación')
  await captura('sla-07-portal-por-confirmar')
})
await paso('CA-04: el job (Simulación › +3 días hábiles) cierra el ticket sin respuesta y el cliente ve el cierre y el aviso', async () => {
  await evaluar('document.querySelector(".pt-herr__fab").click()'); await dormir(300)
  await evaluar('[...document.querySelectorAll(".pt-herr__fila")].find(b=>b.querySelector("b")?.textContent.startsWith("Simulación")).click()'); await dormir(500)
  await boton('+3 días hábiles'); await esperarTexto('Cierre automático: ')
  const toast = await evaluar('[...document.querySelectorAll(".ay-toast")].map(t=>t.innerText).join(" | ")')
  if (!/Cierre automático: [1-9]\d* tickets resueltos sin respuesta del cliente en 3 días hábiles/.test(toast)) throw new Error('resumen del job: ' + toast)
  await captura('sla-08-job')
  await evaluar('document.querySelector(\'button[aria-label="Cerrar el panel «Simulación»"]\')?.click()'); await dormir(500)
  await ir('#/portal'); await dormir(300); await ir('#/portal/ticket/tk-308'); await esperarTexto('Caso cerrado')
  const t = await texto()
  if (!t.includes('Se cerró solo: no hubo respuesta en 3 días hábiles.')) throw new Error('línea de tiempo sin el cierre automático')
  if (!t.includes('ahora está «Cerrado». Se cerró automáticamente.')) throw new Error('sin el aviso al cliente')
  await captura('sla-09-portal-cerrado')
})
await paso('Móvil (390 px): la pestaña de configuración sin desplazamiento horizontal', async () => {
  await comoRol('ADMIN_FUNCIONAL'); await ir('#/configuracion'); await esperarTexto('Flujos por tipo, subtipo y área'); await boton('Cierre automático'); await esperarTexto('Cierre automático de tickets resueltos')
  await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true }); await dormir(800)
  if (await evaluar('document.documentElement.scrollWidth > innerWidth + 1')) throw new Error('desborda en móvil')
  await evaluar(`${tarjeta('Cierre automático de tickets resueltos')}?.scrollIntoView({block:"start"})`); await dormir(300); await captura('sla-10-movil-config')
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1366, height: 900, deviceScaleFactor: 1, mobile: false })
})

console.log(pasos.join('\n'))
console.log(`\nCapturas en ${CAPS}`)
console.log(errores.length ? `\nERRORES (${errores.length}):\n` + [...new Set(errores)].join('\n') : '\nSin errores de JS, consola ni red.')
ws.close(); chrome.kill()
process.exit(pasos.some((p) => p.startsWith('FALLA')) || errores.length ? 1 : 0)
