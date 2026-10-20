// Recorre en Chrome sin interfaz (CDP, sin dependencias) la resolución por morosidad parcheada: HU-ATC-056 CA-01 (el ticket del
// caso derivado al flujo de Cobranza y Legal, visible en el caso y en el ticket) y HU-ATC-057 (plantilla de la alerta de
// cancelación que recibe el cliente y constancias de envío, con el reintento cuando rebota el correo). Sale con 1 si un paso
// falla o hay errores de JS, de consola o de red.
// Uso, con el servidor arriba (npm run preview):  node scripts/recorrer-morosidad.mjs
//   BASE=http://localhost:5180/  CHROME=<ruta de Chrome>  CAPTURAS=<carpeta>  PERFIL_CHROME=<carpeta>  PUERTO_CDP=<puerto> (9436)
import { spawn } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const BASE = process.env.BASE ?? 'http://localhost:5180/'
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const CAPS = (process.env.CAPTURAS ?? join(tmpdir(), 'morosidad-capturas')) + '/'
const PERFIL = (process.env.PERFIL_CHROME ?? join(tmpdir(), 'morosidad-chrome')) + '/'
rmSync(PERFIL, { recursive: true, force: true }); mkdirSync(CAPS, { recursive: true })
const PUERTO = Number(process.env.PUERTO_CDP ?? 9436)
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
const textoDe = (sel) => evaluar(`document.querySelector(${JSON.stringify(sel)})?.innerText ?? ""`)
const esperarTexto = async (t, ms = 8000) => { for (let i = 0; i < ms / 100; i++) { if ((await texto()).includes(t)) return; await dormir(100) } throw new Error(`no apareció «${t}»\n---\n${(await texto()).slice(0, 1500)}`) }
const ir = (hash) => evaluar(`location.hash=${JSON.stringify(hash)}`)
const C = 'import("/assets/comun-CVU2GQ4h.js")'
const como = (personaId) => evaluar(`${C}.then(m=>m.O.ajustar({personaId:${JSON.stringify(personaId)}}))`)
// botones visibles del documento entero (los diálogos no viven dentro de <main>)
const boton = (txt) => evaluar(`(()=>{const b=[...document.querySelectorAll('button, a')].filter(e=>e.offsetParent!==null).find(e=>e.textContent.trim()===${JSON.stringify(txt)});if(!b)throw new Error('sin botón '+${JSON.stringify(txt)});b.click();return true})()`)
const tarjeta = (titulo) => `(()=>{const h=[...document.querySelectorAll("main h2")].find(x=>x.textContent.trim()===${JSON.stringify(titulo)});return h?.closest(".ay-card,section,article")??h?.parentElement?.parentElement})()`
// cierra el panel lateral de Simulación (su botón con la X)
const cerrarPanel = async () => { await evaluar('document.querySelector(\'button[aria-label="Cerrar el panel «Simulación»"]\')?.click()'); await dormir(500) }
const pasos = []
const paso = async (nombre, fn) => { const antes = errores.length; try { await fn(); pasos.push(`ok    ${nombre}${errores.length > antes ? ` (con ${errores.length - antes} errores)` : ''}`) } catch (e) { pasos.push(`FALLA ${nombre}: ${e.message.split('\n').slice(0, 6).join(' | ')}`) } }

await cdp('Page.enable'); await cdp('Runtime.enable'); await cdp('Log.enable'); await cdp('Network.enable')
await cdp('Emulation.setDeviceMetricsOverride', { width: 1366, height: 900, deviceScaleFactor: 1, mobile: false })
await cdp('Page.navigate', { url: BASE + '#/morosidad' }); await dormir(3000)
await como('p-gnunez'); await dormir(300)

let caso, rebotado
await paso('Simulación › «Evaluar la morosidad»: abre los casos con su ticket (HU-056 CA-01)', async () => {
  await evaluar('document.querySelector(".pt-herr__fab").click()'); await dormir(300)
  await evaluar('[...document.querySelectorAll(".pt-herr__fila")].find(b=>b.querySelector("b")?.textContent.startsWith("Simulación")).click()'); await dormir(500)
  await boton('Evaluar la morosidad (corrida diaria)'); await esperarTexto('Evaluación de morosidad:')
  await cerrarPanel()
  const r = await evaluar(`${C}.then(m=>{const d=m.__ptNucleo.datos();const c=d.casosResolucion.find(x=>x.estado==="ABIERTO"),b=d.casosResolucion.find(x=>d.constancias.some(k=>k.casoId===x.id&&k.resultado==="REBOTADO"));return {c:c?.id,b:b?.id,n:d.casosResolucion.length}})`)
  if (!r.c || !r.b) throw new Error('sin casos abiertos o sin correo rebotado: ' + JSON.stringify(r))
  caso = r.c; rebotado = r.b
  await esperarTexto('Casos de resolución'); await captura('mora-01-casos')
})
await paso('Caso: «Flujo de resolución» derivado a Cobranza y Legal, con sus actividades; el historial lo cuenta (HU-056 CA-01)', async () => {
  await ir(`#/morosidad/${caso}`); await esperarTexto('Flujo de resolución')
  const f = await evaluar(`${tarjeta('Flujo de resolución')}?.innerText ?? ""`)
  for (const t of ['Resolución de contrato · General · Cobranza · versión 1', 'Derivado a', 'Cobranza y Legal', '1. Verificación de la deuda · Renato Salazar (Cobranza)', '2. Revisión legal de la causal · Patricia Vílchez (Legal)', '3. Carta de resolución · Patricia Vílchez (Legal)', 'En curso', 'Pendiente'])
    if (!f.includes(t)) throw new Error(`la tarjeta no dice «${t}»: ${f}`)
  const h = await evaluar(`${tarjeta('Historial del caso')}?.innerText ?? ""`)
  if (!/derivado al flujo Resolución de contrato · General · Cobranza \(versión 1\), con actividades de Cobranza y Legal\./.test(h)) throw new Error('historial: ' + h)
  await evaluar(`${tarjeta('Flujo de resolución')}?.scrollIntoView({block:"center"})`); await dormir(300); await captura('mora-02-caso-flujo')
})
await paso('Plantilla de la alerta de cancelación: datos del caso y el texto pendiente de Legal (HU-057)', async () => {
  await boton('Ver la plantilla'); await dormir(500)
  const d = await textoDe('[role=dialog]')
  for (const t of ['Plantilla de alerta de cancelación', 'Texto pendiente de Legal', 'Correo, WhatsApp y Mi Portal', 'Deuda vencida', 'S/', 'cuotas vencidas e impagas', 'Plazo para regularizar', 'Por definir', 'Consecuencias', 'Pendiente de Legal', 'Texto de la alerta'])
    if (!d.includes(t)) throw new Error(`la plantilla no dice «${t}»: ${d}`)
  await captura('mora-03-plantilla')
  const notas = await evaluar('[...(globalThis.__ptNotas?.values()??[])].flatMap(m=>[...m.keys()]).join("\\n")')
  if (!/¿Legal aprueba el texto de la alerta\?/.test(notas)) throw new Error('las preguntas abiertas no están en el panel de notas')
  await boton('Cerrar'); await dormir(400)
  if (await evaluar('!!document.querySelector("[role=dialog]")')) throw new Error('el diálogo no se cerró')
})
await paso('Constancias de la alerta: fecha y hora, canal, destinatario y entrega (HU-057 CA-02)', async () => {
  const t = await evaluar(`${tarjeta('Alerta de cancelación al cliente')}?.innerText ?? ""`)
  for (const x of ['Fecha y hora', 'Canal', 'Destinatario', 'Entrega', 'Correo', 'WhatsApp', 'Mi Portal', 'Entregado']) if (!t.toLowerCase().includes(x.toLowerCase())) throw new Error(`constancias sin «${x}»: ${t}`)
})
await paso('Correo rebotado: reintento por WhatsApp y Mi Portal en la constancia (HU-057 CA-03)', async () => {
  await ir(`#/morosidad/${rebotado}`); await esperarTexto('Alerta de cancelación al cliente'); await dormir(300)
  const t = await evaluar(`${tarjeta('Alerta de cancelación al cliente')}?.innerText ?? ""`)
  if (!t.includes('Rebotado') || (t.match(/reintento/g) ?? []).length !== 2) throw new Error('constancias: ' + t)
  await captura('mora-04-rebotado')
})
await paso('Ticket del caso: «Actividades del flujo» con la revisión legal (HU-056 CA-01, visible en el ticket)', async () => {
  await ir(`#/morosidad/${caso}`); await esperarTexto('Flujo de resolución')
  const num = await evaluar(`${C}.then(m=>{const d=m.__ptNucleo.datos();const c=d.casosResolucion.find(x=>x.id===${JSON.stringify(caso)});return d.tickets.find(t=>t.id===c.ticketId).numero})`)
  await boton(num); await esperarTexto('Actividades del flujo')
  const t = await texto()
  for (const x of ['Resolución de contrato · General · Cobranza', 'Verificación de la deuda', 'Revisión legal de la causal', 'Patricia Vílchez', 'Renato Salazar']) if (!t.includes(x)) throw new Error(`el ticket no dice «${x}»`)
  await evaluar('[...document.querySelectorAll("main h2")].find(h=>h.textContent.trim()==="Actividades del flujo")?.scrollIntoView({block:"start"})'); await dormir(300); await captura('mora-05-ticket-actividades')
})
await paso('Móvil (390 px) y tema oscuro: el caso y la plantilla sin desplazamiento horizontal', async () => {
  await ir(`#/morosidad/${caso}`); await esperarTexto('Flujo de resolución')
  await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true }); await dormir(800)
  if (await evaluar('document.documentElement.scrollWidth > innerWidth + 1')) throw new Error('el caso desborda en móvil')
  await evaluar(`${tarjeta('Flujo de resolución')}?.scrollIntoView({block:"start"})`); await dormir(300); await captura('mora-06-movil-flujo')
  await evaluar('scrollTo(0,0)'); await boton('Ver la plantilla'); await dormir(600)
  if (await evaluar('document.documentElement.scrollWidth > innerWidth + 1')) throw new Error('la plantilla desborda en móvil')
  await captura('mora-07-movil-plantilla'); await boton('Cerrar'); await dormir(300)
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1366, height: 900, deviceScaleFactor: 1, mobile: false })
  await evaluar('document.documentElement.setAttribute("data-theme","dark")'); await dormir(300); await boton('Ver la plantilla'); await dormir(600); await captura('mora-08-oscuro-plantilla')
  await boton('Cerrar'); await evaluar('document.documentElement.removeAttribute("data-theme")')
})

console.log(pasos.join('\n'))
console.log(`\nCapturas en ${CAPS}`)
console.log(errores.length ? `\nERRORES (${errores.length}):\n` + [...new Set(errores)].join('\n') : '\nSin errores de JS, consola ni red.')
ws.close(); chrome.kill()
process.exit(pasos.some((p) => p.startsWith('FALLA')) || errores.length ? 1 : 0)
