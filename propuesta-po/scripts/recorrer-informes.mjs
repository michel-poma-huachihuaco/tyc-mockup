// Recorre en Chrome sin interfaz (CDP) la HU-ATC-031: el informe diario y el quincenal se generan al cierre (CA-01 y CA-02) con el
// reloj del panel de simulación, y la Torre de Control los muestra (el quincenal, con las tendencias de los KPI). Parte de la
// semilla recién cargada (jueves 15 de octubre de 2026, 11:00), como Coordinador CX.
// Uso, con el servidor arriba (npm run preview):  node scripts/recorrer-informes.mjs
//   BASE=http://localhost:5180/  CHROME=<ruta de Chrome>  CAPTURAS=<carpeta>  PERFIL_CHROME=<carpeta>  PUERTO_CDP=<puerto> (9353)
import { spawn } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const BASE = process.env.BASE ?? 'http://localhost:5180/'
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const CAPS = (process.env.CAPTURAS ?? join(tmpdir(), 'hu031-capturas')) + '/'
const PERFIL = (process.env.PERFIL_CHROME ?? join(tmpdir(), 'hu031-chrome')) + '/'
const PUERTO = Number(process.env.PUERTO_CDP ?? 9353)
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
const esperarTexto = async (t, sel = 'body', ms = 8000) => { for (let i = 0; i < ms / 100; i++) { if ((await texto(sel)).includes(t)) return; await dormir(100) } throw new Error(`no apareció «${t}» en ${sel}\n---\n${(await texto(sel)).slice(0, 1200)}`) }
const noTexto = async (t, sel = 'body') => { if ((await texto(sel)).includes(t)) throw new Error(`no debería verse «${t}» en ${sel}`) }
const C = 'import("/assets/comun-CVU2GQ4h.js")'
const comoRol = (rol) => evaluar(`${C}.then(m=>m.O.ajustar({personaId:m.w[${JSON.stringify(rol)}]}))`)
const boton = (txt, sel = 'body') => evaluar(`(()=>{const b=[...document.querySelector(${JSON.stringify(sel)}).querySelectorAll('button, a, [role=tab]')].filter(e=>e.offsetParent!==null&&!e.closest('[inert]')).find(e=>e.textContent.trim().startsWith(${JSON.stringify(txt)}));if(!b)throw new Error('sin botón '+${JSON.stringify(txt)});b.click();return true})()`)
const tarjeta = (titulo) => evaluar(`(()=>{const h=[...document.querySelectorAll('main h2')].find(e=>e.textContent.trim()===${JSON.stringify(titulo)});return h?h.closest('.ay-card').innerText:''})()`)
const simular = async (txt) => {
  await evaluar('document.querySelector(".pt-herr__fab").click()'); await dormir(300)
  await evaluar('[...document.querySelectorAll(".pt-herr__fila")].find(f=>f.textContent.includes("Simulación")).click()'); await dormir(900)
  await esperarTexto('si pasa el cierre de una jornada o de una quincena, genera sus informes', '.ay-sidepanel')
  await boton(txt, '.ay-sidepanel'); await dormir(700)
  await evaluar('document.querySelector(".ay-sidepanel button[aria-label^=Cerrar]")?.click()'); await dormir(600)
}
const pasos = []
const paso = async (nombre, fn) => { const antes = errores.length; try { await fn(); pasos.push(`ok    ${nombre}${errores.length > antes ? ` (con ${errores.length - antes} errores)` : ''}`) } catch (e) { pasos.push(`FALLA ${nombre}: ${e.message.split('\n').slice(0, 6).join(' | ')}`) } }

await cdp('Page.enable'); await cdp('Runtime.enable'); await cdp('Network.enable')
await cdp('Page.navigate', { url: BASE + '#/torre' }); await dormir(3000)
await comoRol('COORDINADOR_CX'); await dormir(300)
await esperarTexto('Torre de Control CX')

await paso('HU-031 · Informes ya no se generan a mano: sin botones y con los próximos cierres', async () => {
  await boton('Informes'); await esperarTexto('Aún no hay informes')
  await noTexto('Generar el informe diario'); await noTexto('Generar el informe quincenal')
  await esperarTexto('Se generan solos: el diario al cierre de cada jornada (18:00)')
  await esperarTexto('Próximos cierres: jornada del jue 15 oct y quincena del jue 15 oct.')
  await captura('031-sin-informes')
})
await paso('HU-031 CA-01 y CA-02 · al pasar el cierre del jueves 15 el job genera el diario y el quincenal', async () => {
  await simular('+1 día hábil')
  await esperarTexto('Informes generados: diario del jue 15 oct, quincenal del jue 1 oct al jue 15 oct.')
  const n = await evaluar(`${C}.then(m=>m.__ptNucleo.datos().informes.map(i=>i.tipo).join())`)
  if (n !== 'DIARIO,QUINCENAL') throw new Error('informes: ' + n)
})
await paso('HU-031 CA-01 · el diario: tickets por eje, NPS, derivaciones y cumplimiento de SLA al cierre de la jornada', async () => {
  const t = await tarjeta('Informe diario operativo')
  for (const x of ['Generado al cierre de la jornada del jue 15 oct (18:00)', 'Tickets activos por eje', 'Eje 1:', 'NPS', 'Derivaciones registradas', 'Cumplimiento de SLA'])
    if (!t.includes(x)) throw new Error(`falta «${x}» en: ${t}`)
})
await paso('HU-031 CA-02 · el quincenal: tendencias de SLA, CSAT, NPS y adopción de Mi Portal (cifras y tabla por jornada)', async () => {
  const t = await tarjeta('Informe quincenal analítico')
  for (const x of ['Generado al cierre de la quincena, del jue 1 oct al jue 15 oct (18:00)', 'Cumplimiento de SLA', 'CSAT (1 a 5)', 'Adopción de Mi Portal',
    'Variación respecto del cierre de la quincena anterior (mié 30 set).', 'Tickets abiertos en la quincena', 'Tendencia de los KPI por jornada'])
    if (!t.includes(x)) throw new Error(`falta «${x}» en: ${t}`)
  const filas = await evaluar(`(()=>{const h=[...document.querySelectorAll('main h2')].find(e=>e.textContent.trim()==='Informe quincenal analítico');return h.closest('.ay-card').querySelectorAll('tbody tr').length})()`)
  if (filas !== 10) throw new Error('jornadas en la tabla: ' + filas)
  const cifras = await evaluar(`(()=>{const h=[...document.querySelectorAll('main h2')].find(e=>e.textContent.trim()==='Informe quincenal analítico');return [...h.closest('.ay-card').querySelectorAll('.ay-stats__cell')].map(c=>c.innerText.replace(/\\s+/g,' '))})()`)
  if (cifras.length !== 4 || !cifras.some((c) => /puntos?|sin cambio/.test(c))) throw new Error('cifras: ' + cifras.join(' | '))
  await evaluar(`[...document.querySelectorAll('main h2')].find(e=>e.textContent.trim()==='Informe quincenal analítico').scrollIntoView({block:'start'})`); await dormir(400)
  await captura('031-quincenal')
})
await paso('HU-031 · los días siguientes suman un diario por jornada hábil (sin fin de semana)', async () => {
  await simular('+3 días hábiles')
  await esperarTexto('Informes generados: diario del vie 16 oct, diario del lun 19 oct, diario del mar 20 oct.')
  const d = await evaluar(`${C}.then(m=>m.__ptNucleo.datos().informes.filter(i=>i.tipo==='DIARIO').length)`)
  if (d !== 4) throw new Error('diarios: ' + d)
  await evaluar('scrollTo(0,0)'); await dormir(300); await captura('031-diarios')
})
// En móvil la cabecera de la Torre (cinco pestañas) ya ensancha la página a ~760 px desde antes de esta HU, así que el ancho de la
// página no dice nada del informe: se mide el quincenal en el ancho útil de un móvil de 390 px (358 px, con 16 px de margen).
await paso('Móvil 390 px: el quincenal cabe en 358 px (las cifras se acomodan y la tabla se desplaza dentro de su marco)', async () => {
  await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true }); await dormir(700)
  const r = await evaluar(`(()=>{const p=[...document.querySelectorAll('main h2')].find(e=>e.textContent.trim()==='Informe quincenal analítico').closest('.ay-card');p.style.width='358px';const L=p.getBoundingClientRect().right;const fuera=[...p.querySelectorAll('*')].filter(e=>!e.closest('.ay-table__scroll')&&e.getBoundingClientRect().right>L+1).map(e=>e.tagName+'.'+e.className);const s=p.querySelector('.ay-table__scroll');p.scrollIntoView({block:'start',inline:'start'});return {fuera,scroll:s&&getComputedStyle(s).overflowX}})()`)
  if (r.fuera.length) throw new Error('se sale: ' + r.fuera.slice(0, 5).join(', '))
  if (r.scroll !== 'auto') throw new Error('la tabla no se desplaza dentro de su marco')
  await dormir(400); await captura('031-movil')
  await evaluar(`[...document.querySelectorAll('main h2')].find(e=>e.textContent.trim()==='Informe quincenal analítico').closest('.ay-card').style.width=''`)
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1366, height: 900, deviceScaleFactor: 1, mobile: false })
})

console.log(pasos.join('\n'))
console.log(`\nCapturas en ${CAPS}`)
console.log(errores.length ? `\nERRORES (${errores.length}):\n` + [...new Set(errores)].join('\n') : '\nSin errores de JS, consola ni red.')
ws.close(); chrome.kill()
process.exit(pasos.some((p) => p.startsWith('FALLA')) || errores.length ? 1 : 0)
