// Recorre en Chrome sin interfaz (CDP) la HU-ATC-048: el asistente de IA a pedido y al ir a cerrar (CA-01) y el registro de
// decisiones en el ticket (CA-02). Parte de la semilla recién cargada, como Gestor de tickets, en el ticket ALT-001215 (tk-450).
// Uso, con el servidor arriba (npm run preview):  node scripts/recorrer-asistente-ia.mjs
//   BASE=http://localhost:5180/  CHROME=<ruta de Chrome>  CAPTURAS=<carpeta>  PERFIL_CHROME=<carpeta>  PUERTO_CDP=<puerto> (9352)
import { spawn } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const BASE = process.env.BASE ?? 'http://localhost:5180/'
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const CAPS = (process.env.CAPTURAS ?? join(tmpdir(), 'hu048-capturas')) + '/'
const PERFIL = (process.env.PERFIL_CHROME ?? join(tmpdir(), 'hu048-chrome')) + '/'
const PUERTO = Number(process.env.PUERTO_CDP ?? 9352)
rmSync(PERFIL, { recursive: true, force: true }); mkdirSync(CAPS, { recursive: true })
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
  else if (m.method === 'Network.responseReceived' && m.params.response.status >= 400 && !m.params.response.url.endsWith('/favicon.ico')) errores.push(`HTTP ${m.params.response.status}: ${m.params.response.url}`)
})
const cdp = (method, params = {}) => new Promise((ok, ko) => { const id = ++sec; pend.set(id, { ok, ko }); ws.send(JSON.stringify({ id, method, params })) })
const evaluar = async (expr) => {
  const r = await cdp('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })
  if (r.exceptionDetails) throw new Error(`evaluar: ${r.exceptionDetails.exception?.description ?? r.exceptionDetails.text}\n${expr.slice(0, 200)}`)
  return r.result.value
}
const captura = async (nombre) => { const r = await cdp('Page.captureScreenshot', { format: 'png' }); writeFileSync(CAPS + nombre + '.png', Buffer.from(r.data, 'base64')) }
const texto = (sel = 'body') => evaluar(`(document.querySelector(${JSON.stringify(sel)})||{innerText:''}).innerText`)
// sin distinguir mayúsculas: los títulos de las tarjetas del asistente se ven en versalitas (text-transform)
const contiene = (a, b) => a.toLocaleLowerCase('es').includes(b.toLocaleLowerCase('es'))
const esperarTexto = async (t, sel = 'body', ms = 8000) => { for (let i = 0; i < ms / 100; i++) { if (contiene(await texto(sel), t)) return; await dormir(100) } throw new Error(`no apareció «${t}» en ${sel}\n---\n${(await texto(sel)).slice(-1200)}`) }
const noTexto = async (t, sel = 'body') => { if (contiene(await texto(sel), t)) throw new Error(`no debería verse «${t}» en ${sel}`) }
const ir = (hash) => evaluar(`location.hash=${JSON.stringify(hash)}`)
const C = 'import("/assets/comun-CVU2GQ4h.js")'
// botones visibles del documento (o de un contenedor): el panel del asistente y los diálogos no viven dentro de <main>
const boton = (txt, sel = 'body') => evaluar(`(()=>{const b=[...document.querySelector(${JSON.stringify(sel)}).querySelectorAll('button, a')].filter(e=>e.offsetParent!==null&&!e.closest('[inert]')).filter(e=>e.textContent.trim()===${JSON.stringify(txt)}).at(-1);if(!b)throw new Error('sin botón '+${JSON.stringify(txt)});b.click();return true})()`)
const escribir = (sel, val) => evaluar(`(()=>{const e=[...document.querySelectorAll(${JSON.stringify(sel)})].at(-1);const p=e.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(p,'value').set.call(e,${JSON.stringify(val)});e.dispatchEvent(new Event('input',{bubbles:true}));return true})()`)
const valor = (sel) => evaluar(`([...document.querySelectorAll(${JSON.stringify(sel)})].at(-1)||{}).value`)
const decisiones = () => evaluar(`${C}.then(m=>m.__ptNucleo.datos().decisionesIA.filter(x=>x.ticketId==='tk-450').map(x=>x.decision))`)
const esperarDecisiones = async (txt) => { for (let i = 0; i < 50 && (await decisiones()).join() !== txt; i++) await dormir(100); if ((await decisiones()).join() !== txt) throw new Error('modelo: ' + (await decisiones())) }
const tarjetaIA = () => evaluar(`(()=>{const h=[...document.querySelectorAll('aside h2')].find(e=>e.textContent.trim()==='Asistente de IA');return h?h.closest('.ay-card').innerText:''})()`)
const BOT = '.pt-bot__panel'
const tarjetasCierre = () => evaluar(`[...document.querySelectorAll('${BOT} h3')].filter(h=>h.textContent.startsWith('Antes de cerrar')).length`)
const esperarTarjetas = async (n) => { for (let i = 0; i < 80 && (await tarjetasCierre()) < n; i++) await dormir(100); if ((await tarjetasCierre()) !== n) throw new Error(`tarjetas de cierre: ${await tarjetasCierre()} (esperaba ${n})`) }
const pasos = []
const paso = async (nombre, fn) => { const antes = errores.length; try { await fn(); pasos.push(`ok    ${nombre}${errores.length > antes ? ` (con ${errores.length - antes} errores)` : ''}`) } catch (e) { pasos.push(`FALLA ${nombre}: ${e.message.split('\n').slice(0, 6).join(' | ')}`) } }

await cdp('Page.enable'); await cdp('Runtime.enable'); await cdp('Network.enable')
await cdp('Page.navigate', { url: BASE + '#/ticket/tk-450' }); await dormir(3000)
await esperarTexto('ALT-001215')

await paso('HU-048 CA-02 · el ticket muestra el registro de decisiones (vacío al empezar)', async () => {
  const t = await tarjetaIA()
  if (!t.includes('Decisiones sobre sus sugerencias') || !t.includes('Sin decisiones registradas')) throw new Error('tarjeta: ' + t)
})
await paso('HU-048 CA-01 · a pedido: «Redactar respuesta» sugiere el texto y lista los criterios pendientes de la guía; se edita y se usa', async () => {
  await evaluar(`document.querySelector('[aria-label="Abrir el asistente de IA"]').click()`); await esperarTexto('Hola, soy tu asistente', BOT)
  await boton('Redactar respuesta', BOT); await esperarTexto('¿con qué tono?', BOT); await boton('Empático', BOT)
  await esperarTexto('Borrador · Empático', BOT); await esperarTexto('Criterios de cierre pendientes (guía, versión 1):', BOT)
  await esperarTexto('Registrar la respuesta al cliente', BOT); await esperarTexto('El cliente confirma la solución en Mi Portal', BOT)
  await noTexto('Datos de cuenta verificados', BOT)
  const sug = await valor(`${BOT} textarea`)
  if (!/Ana|Hola/.test(sug)) throw new Error('sin sugerencia: ' + sug)
  await esperarTexto('Aceptar', BOT); await captura('048-a-pedido')
  const editado = sug.replace(/Un saludo cordial,/, 'Quedo atenta a tu confirmación. Un saludo cordial,')
  await escribir(`${BOT} textarea`, editado); await esperarTexto('Usar mi versión editada', BOT)
  await boton('Usar mi versión editada', BOT); await esperarTexto('Decisión registrada: editada.', BOT); await esperarTexto('lo escribí en el mensaje', BOT)
  const msj = await evaluar(`(()=>{const l=[...document.querySelectorAll('label')].find(e=>/Mensaje para el cliente/.test(e.textContent));return document.getElementById(l.htmlFor).value})()`)
  if (msj !== editado) throw new Error('el mensaje no es la versión editada')
  await captura('048-editada')
})
await paso('HU-048 CA-02 · la decisión «editada» queda en el ticket, sin el texto', async () => {
  await esperarTexto('Editada', 'aside')
  const t = await tarjetaIA()
  if (!t.includes('Editada') || !t.includes('sin el texto de la sugerencia ni datos personales') || t.includes('Quedo atenta')) throw new Error('tarjeta: ' + t)
  await esperarDecisiones('EDITADA')
  await boton('Registrar la respuesta')
  for (let i = 0; i < 80 && (await evaluar(`${C}.then(m=>m.__ptNucleo.datos().tickets.find(t=>t.id==='tk-450').estado)`)) !== 'IN_PROGRESS'; i++) await dormir(100)
  await dormir(300)
  await captura('048-registro-ticket')
})
await paso('HU-048 CA-01 · al elegir «Resuelto» el asistente se activa: criterios de cierre pendientes de la guía en el diálogo', async () => {
  await boton('✕', BOT).catch(() => {}); await dormir(200)
  await boton('Cambiar estado'); await esperarTexto('Nuevo estado', '[role=dialog]')
  await noTexto('Asistente de IA: antes de cerrar', '[role=dialog]')
  await evaluar(`document.querySelector('[role=dialog] input[type=radio][value="RESOLVED"]').click()`)
  await esperarTexto('Asistente de IA: antes de cerrar', '[role=dialog]'); await esperarTexto('Criterios de cierre pendientes según la guía (versión 1):', '[role=dialog]')
  await esperarTexto('El cliente confirma la solución en Mi Portal', '[role=dialog]')
  await noTexto('Registrar la respuesta al cliente', '[role=dialog]') // ya se respondió al cliente en este ciclo
  await dormir(500); await captura('048-dialogo-resuelto')
  await boton('Revisar con el asistente'); await esperarTexto('Vas a resolver el ticket', BOT); await esperarTexto('Antes de cerrar · Empático', BOT)
  await esperarTexto('El cliente confirma la solución en Mi Portal', BOT)
  if (!/ya resolvimos/i.test(await valor(`${BOT} textarea`))) throw new Error('la sugerencia no es la de cierre')
  await captura('048-asistente-cierre')
  await boton('Descartar', BOT); await esperarTexto('Decisión registrada: descartada.', BOT); await esperarTexto('Descartada', 'aside')
})
await paso('HU-048 CA-01 · al confirmar «Resuelto» el robot se abre solo con la respuesta de cierre; «Aceptar» la usa y la registra', async () => {
  await boton('✕', BOT); await dormir(300); await noTexto('Antes de cerrar', 'body')
  await boton('Cambiar estado'); await esperarTexto('Nuevo estado', '[role=dialog]')
  await evaluar(`document.querySelector('[role=dialog] input[type=radio][value="RESOLVED"]').click()`)
  await esperarTexto('Asistente de IA: antes de cerrar', '[role=dialog]')
  await boton('Pasar a Resuelto'); await esperarTexto('En atención → Resuelto')
  await esperarTexto('Vas a resolver el ticket', BOT); await esperarTarjetas(2); await esperarTexto('El cliente confirma la solución en Mi Portal', BOT)
  await boton('Aceptar', BOT); await esperarTexto('Decisión registrada: aceptada.', BOT)
  await esperarDecisiones('EDITADA,DESCARTADA,ACEPTADA'); await esperarTexto('Aceptada', 'aside')
  const t = await tarjetaIA()
  if (!(t.indexOf('Aceptada') < t.indexOf('Descartada') && t.indexOf('Descartada') < t.indexOf('Editada'))) throw new Error('orden: ' + t)
  await captura('048-confirmado')
})
await paso('HU-048 CA-01 · «¿Qué me falta para cerrar?» en el chat abre la misma revisión', async () => {
  await escribir(`${BOT} input`, '¿Qué me falta para cerrar?'); await evaluar(`document.querySelector('.pt-bot__form').requestSubmit()`)
  await esperarTexto('Reviso el cierre', BOT); await esperarTarjetas(3)
  await captura('048-chat-cierre')
})
await paso('Móvil 390 px: el ticket, su registro y el asistente no desbordan', async () => {
  await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true }); await dormir(700)
  if (await evaluar('innerWidth !== 390 || document.documentElement.scrollWidth > 391')) throw new Error('desborda en móvil')
  const p = await evaluar(`(()=>{const r=document.querySelector('${BOT}').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth})()`)
  if (!p) throw new Error('el panel del asistente se sale de la pantalla')
  await captura('048-movil')
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1366, height: 900, deviceScaleFactor: 1, mobile: false })
})

console.log(pasos.join('\n'))
console.log(`\nCapturas en ${CAPS}`)
console.log(errores.length ? `\nERRORES (${errores.length}):\n` + [...new Set(errores)].join('\n') : '\nSin errores de JS, consola ni red.')
ws.close(); chrome.kill()
process.exit(pasos.some((p) => p.startsWith('FALLA')) || errores.length ? 1 : 0)
