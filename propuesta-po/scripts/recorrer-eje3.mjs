// Recorre en Chrome sin interfaz (CDP) el paso a Eje 3 y Legal: HU-026 CA-01/02, HU-027 CA-01/03, HU-040 CA-02 y HU-041 CA-02.
// Uso, con el servidor arriba (npm run preview):  node scripts/recorrer-eje3.mjs
//   BASE (http://localhost:5180/), CHROME, CAPTURAS, PERFIL_CHROME y PUERTO_CDP (9401) por entorno.
import { spawn } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const BASE = process.env.BASE ?? 'http://localhost:5180/'
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const CAPS = (process.env.CAPTURAS ?? join(tmpdir(), 'eje3-capturas')) + '/'
const PERFIL = (process.env.PERFIL_CHROME ?? join(tmpdir(), 'eje3-chrome')) + '/'
const PUERTO = Number(process.env.PUERTO_CDP ?? 9401)
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
const texto = (sel = 'body') => evaluar(`document.querySelector(${JSON.stringify(sel)})?.innerText ?? ''`)
const esperarTexto = async (t, ms = 8000, sel = 'body') => { for (let i = 0; i < ms / 100; i++) { if ((await texto(sel)).includes(t)) return; await dormir(100) } throw new Error(`no apareció «${t}»\n---\n${(await texto(sel)).slice(0, 1200)}`) }
const noTexto = async (t, sel = 'body') => { if ((await texto(sel)).includes(t)) throw new Error(`no debería verse «${t}»`) }
const ir = async (hash) => { await evaluar(`location.hash=${JSON.stringify(hash)}`); await dormir(900) }
const C = 'import("/assets/comun-CVU2GQ4h.js")'
const comoRol = async (rol) => { await evaluar(`${C}.then(m=>m.O.ajustar({personaId:m.w[${JSON.stringify(rol)}]}))`); await dormir(500) }
const visibles = (sel) => `[...document.querySelectorAll(${JSON.stringify(sel)})].filter(e=>e.offsetParent!==null||e.closest('[role=dialog]'))`
// botón por su texto; «dentro» lo limita a un contenedor (p. ej. el diálogo abierto)
const boton = (txt, dentro = 'body') => evaluar(`(()=>{const b=[...document.querySelectorAll(${JSON.stringify(dentro + ' button')})].filter(e=>e.offsetParent!==null).find(e=>e.textContent.trim()===${JSON.stringify(txt)});if(!b)throw new Error('sin botón '+${JSON.stringify(txt)});b.click();return true})()`)
const dialogo = '[role=dialog]'
const pestana = (txt) => evaluar(`(()=>{const b=[...document.querySelectorAll('[role=tab]')].find(e=>e.textContent.trim().startsWith(${JSON.stringify(txt)}));if(!b)throw new Error('sin pestaña '+${JSON.stringify(txt)});b.click();return true})()`)
const radio = (valor) => evaluar(`(()=>{const r=[...document.querySelectorAll('${dialogo} input[type=radio]')].find(e=>e.value===${JSON.stringify(valor)});return r?{disabled:r.disabled}:null})()`)
const simulacion = async (txt) => {
  await evaluar('document.querySelector(".pt-herr__fab").click()'); await dormir(300)
  await evaluar('[...document.querySelectorAll(".pt-herr__fila")].find(f=>f.textContent.includes("Simulación")).click()'); await dormir(900)
  await boton(txt, '.ay-sidepanel'); await dormir(700)
  await evaluar('document.querySelector(".ay-sidepanel button[aria-label^=Cerrar]")?.click()'); await dormir(600)
}
// rellena el paquete mínimo del cajón «Derivar a Eje 3» como lo haría el gestor
const rellenarPaquete = () => evaluar(`(()=>{const d=[...document.querySelectorAll('${dialogo}')].at(-1);
  const pon=(e,v,ev)=>{const p=e.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:e.tagName==='SELECT'?HTMLSelectElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(p,'value').set.call(e,v);e.dispatchEvent(new Event(ev,{bubbles:true}))};
  const k=d.querySelector('input[type=checkbox]');if(!k.checked)k.click();
  const s=d.querySelector('select');pon(s,[...s.options].find(o=>o.value).value,'change');
  const [pagos,atencion,paso]=d.querySelectorAll('textarea');pon(pagos,'Al día al 15-oct','input');pon(atencion,'Queja revisada por ATC','input');pon(paso,'Revisión legal del caso','input');return true})()`)

const pasos = []
const paso = async (nombre, fn) => { const antes = errores.length; try { await fn(); pasos.push(`ok    ${nombre}${errores.length > antes ? ` (con ${errores.length - antes} errores)` : ''}`) } catch (e) { pasos.push(`FALLA ${nombre}: ${e.message.split('\n').slice(0, 6).join(' | ')}`) } }

await cdp('Page.enable'); await cdp('Runtime.enable'); await cdp('Network.enable'); await cdp('DOM.enable')
await cdp('Page.navigate', { url: BASE + '#/bandeja' }); await dormir(3000)

await paso('026 CA-01/02: con señal (APV-000089, Eje 2) «Escalado» queda deshabilitado por el gate y el diálogo lleva a «Derivar a Eje 3»', async () => {
  await comoRol('GESTOR'); await ir('#/ticket/tk-73')
  await esperarTexto('Caso de conflicto: se atiende en Eje 3')
  await boton('Cambiar estado'); await esperarTexto('Nuevo estado', 4000, dialogo)
  const r = await radio('ESCALATED'); if (!r) throw new Error('sin la opción «Escalado»')
  if (!r.disabled) throw new Error('«Escalado» sigue habilitado con la señal activa')
  for (const v of ['RESOLVED']) { const x = await radio(v); if (!x?.disabled) throw new Error(`«${v}» habilitado con la señal activa`) }
  await esperarTexto('Gate no compensable', 3000, dialogo); await esperarTexto('nota de estado emocional', 3000, dialogo)
  await esperarTexto('Escalar a Eje 3', 3000, dialogo); await dormir(500)
  await captura('eje3-01-cambiar-estado-con-senal')
  await boton('Derivar a Eje 3', dialogo); await esperarTexto('Derivar APV-000089 a Eje 3', 4000)
  await esperarTexto('Falta la nota de estado emocional')
  await captura('eje3-02-derivar-desde-cambiar-estado')
  await boton('Cancelar', dialogo); await dormir(600)
  const t = await evaluar(`${C}.then(m=>{const t=m.__ptNucleo.datos().tickets.find(x=>x.id==='tk-73');return t.eje+'|'+t.area})`)
  if (t !== '2|POSTVENTA') throw new Error('el ticket cambió: ' + t)
})

let nuevo
await paso('027 CA-01: sin señal tampoco se escala a mano; se deriva desde «Cambiar estado» con los 6 elementos', async () => {
  nuevo = await evaluar(`${C}.then(m=>m.E.crearTicket({canal:'Teléfono',empresaId:'APV',linea:'Vivienda',establecimiento:'',clienteId:'cli-001',tipo:'QUE',prioridad:'MEDIUM',resumen:'Queja por la atención en la caseta',descripcion:'Pide que se revise la atención.'})).then(t=>({id:t.id,numero:t.numero}))`)
  await ir(`#/ticket/${nuevo.id}`); await esperarTexto(nuevo.numero)
  await noTexto('Caso de conflicto')
  await boton('Cambiar estado'); await esperarTexto('Nuevo estado', 4000, dialogo)
  const r = await radio('ESCALATED'); if (!r?.disabled) throw new Error('«Escalado» habilitado sin paquete')
  await esperarTexto('paquete mínimo de handoff completo (6 elementos)', 3000, dialogo)
  await boton('Derivar a Eje 3', dialogo); await esperarTexto(`Derivar ${nuevo.numero} a Eje 3`, 4000)
  await esperarTexto('Enviar a Eje 3 (1/6)')
  await rellenarPaquete(); await esperarTexto('Enviar a Eje 3 (6/6)', 4000)
  await dormir(600)
  await captura('eje3-03-paquete-completo')
  await boton('Enviar a Eje 3 (6/6)'); await esperarTexto('derivado a Eje 3 con el paquete mínimo completo', 6000)
  const t = await evaluar(`${C}.then(m=>{const t=m.__ptNucleo.datos().tickets.find(x=>x.id===${JSON.stringify(nuevo.id)});return t.eje+'|'+t.area+'|'+t.estado})`)
  if (t !== '3|LEGAL|ESCALATED') throw new Error('no pasó a Eje 3 por la derivación: ' + t)
})

await paso('040 CA-02: pestaña Legal con el estado sincronizado; la actualización intermedia y la resolución llegan sin registro manual', async () => {
  await ir(`#/ticket/${nuevo.id}`); await esperarTexto(nuevo.numero)
  const lateral = await evaluar('[...document.querySelectorAll("aside h2")].map(h=>h.textContent).join("|")')
  if (lateral.includes('Sincronización con Legal')) throw new Error('la sincronización sigue en la tarjeta lateral')
  await pestana('Legal'); await esperarTexto('Sincronización con Legal'); await esperarTexto('Recibido por Legal')
  await captura('eje3-04-pestana-legal-recibido')
  await simulacion('Legal pone en revisión el último caso enviado')
  await pestana('Legal'); await esperarTexto('En revisión en Legal'); await esperarTexto('Actualizado por Legal')
  const est = await evaluar(`${C}.then(m=>m.__ptNucleo.datos().tickets.find(x=>x.id===${JSON.stringify(nuevo.id)}).estado)`)
  if (est !== 'ESCALATED') throw new Error('la revisión cambió el estado del ticket: ' + est)
  await captura('eje3-05-pestana-legal-en-revision')
  await simulacion('Legal resuelve el último caso enviado')
  await pestana('Legal'); await esperarTexto('Resuelto por Legal'); await esperarTexto('Se resolvió el caso legal')
  await captura('eje3-06-pestana-legal-resuelto')
})

await paso('027 CA-03: el aviso a la jefatura de Legal por el handoff sin confirmar se ve en el ticket y en Alertas', async () => {
  await ir('#/ticket/tk-423'); await esperarTexto('ALT-001214')
  await esperarTexto('Sin confirmar: jefatura de Legal avisada'); await esperarTexto('Roberto Castillo')
  await evaluar('[...document.querySelectorAll("[role=alert],.ay-alert,div")].reverse().find(e=>e.textContent.startsWith("Sin confirmar: jefatura de Legal avisada"))?.scrollIntoView({block:"center"})'); await dormir(400)
  await captura('eje3-07-ticket-jefatura-avisada')
  await comoRol('SUPERVISOR'); await ir('#/alertas'); await esperarTexto('Handoffs sin confirmar')
  await esperarTexto('ALT-001214'); await esperarTexto('Roberto Castillo (jefatura de Legal)')
  await evaluar('[...document.querySelectorAll("main h2")].find(h=>h.textContent==="Handoffs sin confirmar")?.scrollIntoView()'); await dormir(400)
  await captura('eje3-08-alertas-handoff')
})

await paso('041 CA-02: el ticket que alertó a Legal por su exposición queda prioritario (ticket y Torre)', async () => {
  await comoRol('COORDINADOR_CX'); await ir('#/torre'); await pestana('Riesgo de denuncia'); await esperarTexto('Reclamos con riesgo de denuncia')
  const fila = await evaluar('[...document.querySelectorAll("main tr")].find(r=>r.innerText.includes("ALT-001207"))?.innerText ?? ""')
  if (!/Prioridad urgente/.test(fila) || !/Enviada/.test(fila)) throw new Error('la fila de ALT-001207 no muestra la prioridad urgente: ' + fila)
  await captura('eje3-09-torre-riesgo-prioridad')
  await ir('#/ticket/tk-90'); await esperarTexto('ALT-001207')
  await esperarTexto('Prioridad urgente'); await esperarTexto('Legal ya fue alertado'); await esperarTexto('Se marcó como prioritario: pasó de prioridad media a urgente')
  await evaluar('[...document.querySelectorAll("aside h2")].find(h=>h.textContent==="Exposición económica")?.scrollIntoView()'); await dormir(400)
  await captura('eje3-10-ticket-prioritario')
})

console.log(pasos.join('\n'))
console.log(errores.length ? `\nErrores de consola/red (${errores.length}):\n${errores.slice(0, 10).join('\n')}` : '\nSin errores de consola ni de red.')
const fallos = pasos.filter((p) => p.startsWith('FALLA')).length
console.log(`\n${pasos.length - fallos}/${pasos.length} pasos en verde · capturas en ${CAPS}`)
ws.close(); chrome.kill()
process.exit(fallos || errores.length ? 1 : 0)
