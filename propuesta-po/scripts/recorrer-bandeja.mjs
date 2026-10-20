// Recorre en Chrome sin interfaz (CDP) la bandeja orquestadora de la Etapa 1 (PLT-04 v1.3): HU-ATC-044 (bandeja única y
// permisos por área), HU-ATC-046 (balanceo por carga al entrar un ticket) y HU-ATC-055 (plantilla del correo de asignación).
// Uso, con el servidor arriba (npm run preview):  node scripts/recorrer-bandeja.mjs
//   BASE=http://localhost:5180/  CHROME=<ruta de Chrome>  CAPTURAS=<carpeta>  PERFIL_CHROME=<carpeta>  PUERTO_CDP=9411
import { spawn } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const BASE = process.env.BASE ?? 'http://localhost:5180/'
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const CAPS = (process.env.CAPTURAS ?? join(tmpdir(), 'propuesta-po-capturas-bandeja')) + '/'
const PERFIL = (process.env.PERFIL_CHROME ?? join(tmpdir(), 'propuesta-po-chrome-bandeja')) + '/'
rmSync(PERFIL, { recursive: true, force: true }); mkdirSync(CAPS, { recursive: true })
const PUERTO = Number(process.env.PUERTO_CDP ?? 9411)
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
const texto = () => evaluar('document.body.innerText')
const principal = () => evaluar('document.querySelector("main")?.innerText ?? document.body.innerText')
const esperarTexto = async (t, ms = 8000) => { for (let i = 0; i < ms / 100; i++) { if ((await texto()).includes(t)) return; await dormir(100) } throw new Error(`no apareció «${t}»\n---\n${(await texto()).slice(0, 1500)}`) }
const ir = (hash) => evaluar(`location.hash=${JSON.stringify(hash)}`)
const MOD = 'import("/assets/comun-CVU2GQ4h.js")'
const como = (id) => evaluar(`${MOD}.then(m=>m.O.ajustar({personaId:${JSON.stringify(id)}}))`)
const H = `
window.__t={
 boton:(txt)=>{const b=[...document.querySelectorAll('button, a')].reverse().find(e=>e.textContent.trim()===txt||e.textContent.trim().startsWith(txt));if(!b)throw new Error('sin botón '+txt);b.click();return true},
 pestana:(txt)=>{const b=[...document.querySelectorAll('main [role=tab]')].find(e=>e.textContent.trim().startsWith(txt));if(!b)throw new Error('sin pestaña '+txt);b.click();return true},
 pestanas:()=>[...document.querySelectorAll('main [role=tab]')].map(e=>e.textContent.trim()),
 filas:()=>[...document.querySelectorAll('main table tbody tr')].map(r=>[...r.querySelectorAll('th,td')].map(td=>td.innerText.trim())),
}`
const pasos = []
const paso = async (nombre, fn) => { const antes = errores.length; try { await fn(); pasos.push(`ok    ${nombre}${errores.length > antes ? ` (con ${errores.length - antes} errores)` : ''}`) } catch (e) { pasos.push(`FALLA ${nombre}: ${e.message.split('\n').slice(0, 8).join(' | ')}`) } }
const simular = async () => {
  // Herramientas › Simulación › «Simular un ticket entrante por Mi Portal»
  if (!(await evaluar('!!document.querySelector(".ay-sidepanel")'))) {
    await evaluar('document.querySelector(".pt-herr__fab").click()'); await dormir(300)
    await evaluar('[...document.querySelectorAll(".pt-herr__fila")].find(f=>f.textContent.includes("Simulación")).click()'); await dormir(800)
  }
  await evaluar('__t.boton("Simular un ticket entrante por Mi Portal")'); await dormir(600)
  const num = await evaluar(`${MOD}.then(m=>m.__ptNucleo.datos().tickets.at(-1).numero)`)
  await esperarTexto(`${num} entró por Mi Portal`)
  await evaluar('document.querySelector(".ay-sidepanel button[aria-label^=Cerrar]")?.click()'); await dormir(600)
  return num
}
// filas de la bandeja (7 columnas) cuando ya cargaron
const filasBandeja = async () => { for (let i = 0; i < 50; i++) { const f = (await evaluar('__t.filas()')).filter((x) => x.length === 7); if (f.length) return f; await dormir(100) } return [] }
// recarga la página: los datos vuelven a la semilla (estado en memoria) y se limpian búsqueda y filtros
const recargar = async () => { await ir('#/bandeja'); await cdp('Page.reload'); await dormir(2500); await evaluar(H) }
const enModelo = (expr) => evaluar(`${MOD}.then(m=>{const d=m.__ptNucleo.datos();return (${expr})(d,m)})`)
const ACT = '["OPEN","IN_PROGRESS","PENDING_CUSTOMER","ESCALATED","REOPENED"]'
const SUPERVISOR = 'p-gnunez', GESTOR = 'p-crojas', COORDINADOR = 'p-avaldivia'

await cdp('Page.enable'); await cdp('Runtime.enable'); await cdp('Network.enable')
await cdp('Page.navigate', { url: BASE + '#/bandeja' }); await dormir(3000); await evaluar(H)

// ------------------------------------------------------------------ HU-ATC-044
await paso('044 CA-01 el ticket simulado entra por Mi Portal y la bandeja ordena rayo → SLA → prioridad', async () => {
  await como(SUPERVISOR); await ir('#/bandeja'); await dormir(600)
  const num = await simular()
  const canal = await enModelo(`(d)=>d.tickets.find(t=>t.numero===${JSON.stringify(num)}).canal`)
  if (canal !== 'Mi Portal') throw new Error('canal ' + canal)
  await esperarTexto(num)
  const fila = (await evaluar('__t.filas()')).find((f) => f[0].startsWith(num)) ?? []
  // el orden de la primera página es el del modelo (mismo comparador: rayo, SLA más próximo, prioridad)
  const esperado = await enModelo(`(d,m)=>{const ar=m.__h44.areas(${JSON.stringify(SUPERVISOR)});return d.tickets.filter(t=>${ACT}.includes(t.estado)&&ar.includes(t.area)).sort(m.bn(d)).slice(0,10).map(t=>t.numero)}`)
  const vistos = (await evaluar('__t.filas()')).map((f) => f[0].split(/\s/)[0])
  if (JSON.stringify(vistos) !== JSON.stringify(esperado)) throw new Error(`orden ${vistos} ≠ ${esperado}`)
  const canales = await enModelo(`(d,m)=>{const ar=m.__h44.areas(${JSON.stringify(SUPERVISOR)});return [...new Set(d.tickets.filter(t=>${ACT}.includes(t.estado)&&ar.includes(t.area)).map(t=>t.canal))].sort()}`)
  if (JSON.stringify(canales) !== JSON.stringify(['Correo', 'Mi Portal', 'Teléfono', 'WhatsApp'])) throw new Error('canales ' + canales)
  if (!vistos.includes(num) && !fila.length) {
    // si no cae en la primera página, se busca
    await evaluar(`(()=>{const e=document.querySelector('main input[type=search], main input');const p=HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(p,'value').set.call(e,${JSON.stringify(num)});e.dispatchEvent(new Event('input',{bubbles:true}))})()`); await dormir(600)
  }
  const fila2 = (await evaluar('__t.filas()')).find((f) => f[0].startsWith(num))
  if (!fila2 || !fila2[1].includes('Mi Portal')) throw new Error('la fila no dice «Mi Portal»: ' + JSON.stringify(fila2))
  await captura('044-01-bandeja-mi-portal')
  if (await evaluar('[...document.querySelectorAll("main button")].some(b=>b.textContent.trim()==="Quitar filtros")')) await evaluar('__t.boton("Quitar filtros")')
})
await paso('044 CA-03 supervisor: «Áreas que superviso» (ATC, Cobranza y Postventa), sin «Todas las áreas» ni tickets de Legal, TI o Administración', async () => {
  await recargar()
  await como(SUPERVISOR); await ir('#/bandeja'); await dormir(800)
  const p = await principal()
  if (p.includes('Todas las áreas')) throw new Error('sigue «Todas las áreas»')
  if (!p.includes('Tickets activos de las áreas que supervisas (ATC, Cobranza y Postventa)')) throw new Error('descripción: ' + p.slice(0, 300))
  const tabs = await evaluar('__t.pestanas()')
  const n = await enModelo(`(d)=>d.tickets.filter(t=>${ACT}.includes(t.estado)&&["ATC","COBRANZA","POSTVENTA"].includes(t.area)).length`)
  if (!tabs[0].startsWith('Áreas que superviso') || !tabs[0].includes(String(n))) throw new Error(`pestañas ${tabs} (esperaba ${n})`)
  const areas = new Set((await filasBandeja()).map((f) => f[4].split('\n')[0]))
  if (!areas.size) throw new Error('bandeja sin filas')
  for (const a of areas) if (!['ATC', 'Cobranza', 'Postventa'].includes(a)) throw new Error('fila de ' + a)
  await captura('044-03a-supervisor')
  await evaluar('__t.pestana("Sin asignar")'); await dormir(500)
  const sinAsig = (await filasBandeja()).map((f) => f[4].split('\n')[0])
  if (sinAsig.some((a) => !['ATC', 'Cobranza', 'Postventa'].includes(a))) throw new Error('sin asignar de otra área: ' + sinAsig)
})
await paso('044 CA-03 gestor: solo su área (ATC); coordinador CX sin áreas supervisadas: no ve tickets de otras áreas', async () => {
  await como(GESTOR); await ir('#/bandeja'); await dormir(800)
  const tabs = await evaluar('__t.pestanas()')
  if (tabs.some((t) => t.startsWith('Áreas que superviso') || t.startsWith('Todas'))) throw new Error('el gestor ve ' + tabs)
  await evaluar('__t.pestana("Mi área")'); await dormir(500)
  const areas = new Set((await filasBandeja()).map((f) => f[4].split('\n')[0]))
  if (!areas.size || [...areas].some((a) => a !== 'ATC')) throw new Error('gestor con filas de ' + [...areas] + ' · ' + JSON.stringify(await evaluar('__t.filas()')).slice(0, 300) + ' · ' + (await principal()).slice(0, 400))
  await como(COORDINADOR); await dormir(800)
  await esperarTexto('No supervisas ninguna área')
  await captura('044-03b-coordinador')
})

// ------------------------------------------------------------------ HU-ATC-046
let numCarga
await paso('046 CA-01 entra un ticket para quien supera el límite: va al disponible con menos carga con REASSIGNMENT_CARGA', async () => {
  await recargar()
  await como(SUPERVISOR); await ir('#/bandeja'); await dormir(600)
  numCarga = await simular()   // Consulta de cuenta → flujo de Cobranza → Renato Salazar (28 puntos, límite 12)
  const t = await enModelo(`(d)=>d.tickets.find(t=>t.numero===${JSON.stringify(numCarga)})`)
  if (t.responsable !== 'p-jccama' || t.flujo.responsable !== 'p-rsalazar') throw new Error('responsable ' + t.responsable)
  await ir('#/ticket/' + t.id)
  for (let i = 0; i < 60 && !(await evaluar('__t.pestanas().some(x=>x.startsWith("Derivaciones"))')); i++) await dormir(100)
  await evaluar('__t.pestana("Derivaciones")'); await dormir(500)
  await esperarTexto('Redistribución por carga')
  await esperarTexto('Por carga: el flujo lo daba a Renato Salazar, con 28 puntos (límite 12).')
  await captura('046-01-derivaciones')
})
await paso('046 CA-03 nadie disponible en Cobranza: el ticket queda en la cola y la supervisora ve la alerta en Mi día › Equipo', async () => {
  await ir('#/midia'); await dormir(800); await evaluar('__t.pestana("Equipo")'); await dormir(500)
  // Milagros Paz es del equipo de la supervisora (su interruptor está en Equipo); Julio Ccama no tiene líder en el maestro local,
  // así que no sale en su Equipo: se marca no disponible por la misma API que usa ese interruptor
  await evaluar(`[...document.querySelectorAll('label.ay-switch')].find(l=>l.textContent==="Disponible: Milagros Paz").querySelector("input").click()`)
  await evaluar(`${MOD}.then(m=>m.E.cambiarDisponibilidad("p-jccama",false))`); await dormir(1200)
  const num = await simular()
  const t = await enModelo(`(d)=>d.tickets.find(t=>t.numero===${JSON.stringify(num)})`)
  if (t.responsable !== null || t.area !== 'COBRANZA') throw new Error('quedó con ' + t.responsable)
  await ir('#/midia'); await dormir(600); await evaluar('__t.pestana("Equipo")'); await dormir(500)
  await esperarTexto(`${num} quedó en su cola`)
  if (!(await principal()).includes('Un ticket nuevo cuyo responsable supera el límite entra directo al gestor disponible del área con menos carga.')) throw new Error('falta el texto del balanceo al entrar')
  await captura('046-03-nadie-disponible')
  await evaluar(`[...document.querySelectorAll('label.ay-switch')].find(l=>l.textContent==="Disponible: Milagros Paz").querySelector("input").click()`)
  await evaluar(`${MOD}.then(m=>m.E.cambiarDisponibilidad("p-jccama",true))`); await dormir(800)
})

// ------------------------------------------------------------------ HU-ATC-055
await paso('055 CA-03 correo sin líder: la plantilla dice que sale solo al gestor y que se avisó al administrador', async () => {
  await evaluar('__t.pestana("Correos de asignación")'); await dormir(600)
  const fila = (await evaluar('__t.filas()')).findIndex((f) => f[3].includes(numCarga))
  if (fila < 0) throw new Error('sin correo del ticket ' + numCarga)
  await evaluar(`document.querySelectorAll('main table tbody tr')[${fila}].querySelector('button[aria-label^="Ver el correo"]').click()`); await dormir(500)
  const p = await principal()
  for (const s of ['Plantilla de correo de asignación', 'Julio Ccama (gestor de tickets)', 'Sin copia: no tiene líder en el maestro local de ATC', `Se te asignó el ticket ${numCarga}`, 'Hola, Julio:', 'Consulta de cuenta', 'Vence el SLA', 'Este aviso llega solo a ti: tu líder no está registrado en el maestro local de ATC']) if (!p.includes(s)) throw new Error(`falta «${s}»`)
  await evaluar('[...document.querySelectorAll("main h2")].find(h=>h.textContent==="Plantilla de correo de asignación")?.scrollIntoView()'); await dormir(300)
  await captura('055-03-sin-lider')
  await como('p-aperez'); await dormir(800)
  await esperarTexto('Completa el líder en el maestro local de ATC')
})
await paso('055 CA-01 asignación con líder: para el gestor, copia a su líder, N.º, tipo, prioridad, vencimiento y enlace', async () => {
  await como(GESTOR); await dormir(300)
  const r = await evaluar(`${MOD}.then(m=>m.O.ticketEntrante("QUE","Mi Portal"))`)   // Queja → flujo de ATC → Diego Lazo
  await como('p-dlazo'); await ir('#/midia'); await dormir(800)
  const p = await principal()
  for (const s of ['Plantilla de correo de asignación', 'Diego Lazo (gestor de tickets)', 'Gabriela Núñez (su líder)', `Se te asignó el ticket ${r.numero}`, 'Hola, Diego:', 'Queja', 'Media', 'Vence el SLA', `Abrir el ticket ${r.numero}`, 'Este aviso llega con copia a Gabriela Núñez, tu líder.', 'el correo no lleva datos del cliente']) if (!p.includes(s)) throw new Error(`falta «${s}»`)
  await evaluar('[...document.querySelectorAll("main h2")].find(h=>h.textContent==="Plantilla de correo de asignación")?.scrollIntoView()'); await dormir(300)
  await captura('055-01-con-lider')
  await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true }); await dormir(800)
  const ancho = await evaluar('document.documentElement.scrollWidth')
  await evaluar('[...document.querySelectorAll("main h2")].find(h=>h.textContent==="Plantilla de correo de asignación")?.scrollIntoView()'); await dormir(300)
  await captura('055-01-movil')
  await cdp('Emulation.clearDeviceMetricsOverride'); await dormir(500)
  if (ancho > 392) throw new Error('scroll horizontal en móvil: ' + ancho)
})
await paso('055 CA-02 reasignación masiva: un solo correo por gestor con el resumen de sus tickets', async () => {
  await como(SUPERVISOR); await ir('#/midia'); await dormir(600); await evaluar('__t.pestana("Equipo")'); await dormir(500)
  await evaluar('__t.boton("Balancear la carga")'); await esperarTexto('Balanceo:')
  await evaluar('__t.pestana("Correos de asignación")'); await dormir(600)
  const filas = await evaluar('__t.filas()')
  const i = filas.findIndex((f) => /Se te reasignaron \d+ tickets/.test(f[3]))
  if (i < 0) throw new Error('sin correo de resumen')
  const n = Number(filas[i][3].match(/Se te reasignaron (\d+) tickets/)[1])
  await evaluar(`document.querySelectorAll('main table tbody tr')[${i}].querySelector('button[aria-label^="Ver el correo"]').click()`); await dormir(500)
  const p = await principal()
  if (!p.includes(`Se te reasignaron ${n} tickets. Este es el resumen:`)) throw new Error('cuerpo sin resumen')
  const resumen = await evaluar('[...document.querySelectorAll("main table")].find(t=>t.getAttribute("aria-label")==="Resumen de tus tickets"||t.querySelector("caption")?.textContent==="Resumen de tus tickets")?.querySelectorAll("tbody tr").length ?? 0')
  if (resumen !== n) throw new Error(`resumen con ${resumen} filas (esperaba ${n})`)
  const paraBalanceo = await enModelo(`(d,m)=>{const c=m.fn(d).filter(x=>x.masivo);return c.map(x=>x.para)}`)
  if (new Set(paraBalanceo).size !== paraBalanceo.length) throw new Error('más de un resumen por gestor')
  await evaluar('[...document.querySelectorAll("main h2")].find(h=>h.textContent==="Plantilla de correo de asignación")?.scrollIntoView()'); await dormir(300)
  await captura('055-02-masivo')
})

console.log(pasos.join('\n'))
if (errores.length) console.log('\nErrores de consola/red:\n' + [...new Set(errores)].join('\n'))
console.log(`\n${pasos.filter((p) => p.startsWith('ok')).length}/${pasos.length} pasos en verde · capturas en ${CAPS}`)
ws.close(); chrome.kill()
process.exit(pasos.some((p) => p.startsWith('FALLA')) || errores.length ? 1 : 0)
