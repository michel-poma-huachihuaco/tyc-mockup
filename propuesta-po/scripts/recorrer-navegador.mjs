// Recorre el mockup en Chrome sin interfaz (protocolo CDP, sin dependencias): Mi Portal, Operación en vivo y que no se vea nada de
// la Etapa 2 (UrbeMind, NEXUS, DAEDALUS) en ninguna pantalla ni rol (v1.3). Guarda capturas y sale con 1 si un paso falla o
// hay errores de JS, de consola o respuestas HTTP >= 400.
// Uso, con el servidor arriba (npm run preview):  npm run recorrer
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
const PUERTO = 9333
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

await paso('Inicio (#/vivo) carga con la escena 3D y la ficha', async () => {
  await esperarTexto('Operación en vivo')
  const n = await evaluar('document.querySelectorAll("canvas").length'); if (n < 1) throw new Error('sin canvas')
  await evaluar('document.getElementById("inicio-vivo")?.scrollIntoView()'); await dormir(1200); await captura('01-vivo')
  const sala = await evaluar('[...document.querySelectorAll("small")].map(e=>e.textContent).find(t=>/ocupados/.test(t))??""')
  if (!/\d+ en cola · \d+\/\d+ ocupados/.test(sala)) throw new Error('rótulo de sala sin «ocupados/total»: ' + sala)
})
await paso('Operación en vivo: tabla «Por área» y ficha con recorrido y CSAT (HU-067)', async () => {
  await evaluar('import("/assets/comun-CVU2GQ4h.js").then(m=>m.O.ajustar({personaId:m.w.SUPERVISOR}))'); await dormir(1200)  // CA-07: el gestor solo ve su área
  const filas = await evaluar('[...document.querySelectorAll("table")].find(t=>t.getAttribute("aria-label")==="Tickets por área")?.querySelectorAll("tbody tr").length ?? 0')
  if (filas < 6) throw new Error('tabla por área con ' + filas + ' filas')
  const cerrado = await evaluar('import("/assets/comun-CVU2GQ4h.js").then(m=>{const d=m.__ptNucleo.datos();return d.tickets.find(t=>t.estado==="CLOSED"&&d.encuestas.some(e=>e.ticketId===t.id&&e.respuesta))?.numero})')
  await evaluar(`[...document.querySelectorAll("main table button")].find(b=>b.textContent.trim()===${JSON.stringify('X')}.replace('X',${JSON.stringify(cerrado ?? '')}))?.click()`); await dormir(900)
  const ficha = await evaluar('document.querySelector(".v3-ficha")?.innerText ?? ""')
  if (!/CSAT\s*\n?\s*\d\/5/.test(ficha) || !/Asignado a|Registrado/.test(ficha)) throw new Error('ficha sin CSAT o sin recorrido: ' + ficha.slice(0, 400))
  await captura('01b-vivo-ficha')
  await evaluar('[...document.querySelectorAll("main h2")].find(h=>h.textContent==="Por área")?.scrollIntoView()'); await dormir(500); await captura('01c-vivo-por-area')
})
// Lo que el plan v1.3 deja para la Etapa 2 no debe verse. Se permiten los nombres propios «Ciudad Aybar Norte» (proyecto) y
// «Aybar Ciudad S.A.C.» (razón social del grupo): no son la integración de incidencias de ciudad.
const ETAPA2 = /UrbeMind|\bUrbe\b|NEXUS|Nexus|DAEDALUS|Daedalus|Etapa 2|Etapa 1|incidencias? de ciudad|servicios de ciudad|CITY_|\bCIT\b/i
const visible = `(()=>{const t=[document.title,document.body.innerText,...[...document.querySelectorAll("option")].map(o=>o.textContent),...[...document.querySelectorAll("[aria-label],[title],[placeholder]")].flatMap(e=>[e.getAttribute("aria-label"),e.getAttribute("title"),e.getAttribute("placeholder")]),...[...(globalThis.__ptNotas?.values()??[])].flatMap(m=>[...m.keys()])].filter(Boolean).join("\\n");return t.replace(/Ciudad Aybar Norte|Aybar Ciudad S\\.A\\.C\\./g,"")})()`
const comoRol = (rol) => evaluar(`import("/assets/comun-CVU2GQ4h.js").then(m=>m.O.ajustar({personaId:m.w[${JSON.stringify(rol)}]}))`)
await paso('UrbeMind fuera: no está en el menú de ningún rol y #/urbemind lleva al inicio', async () => {
  for (const rol of ['GESTOR', 'COLABORADOR', 'SUPERVISOR', 'COORDINADOR_CX', 'LEGAL_RECLAMOS', 'ADMIN_FUNCIONAL']) {
    await comoRol(rol); await ir('#/bandeja'); await dormir(500)
    const nav = await evaluar('[...document.querySelectorAll("nav a, a[href]")].map(a=>a.textContent+" "+a.getAttribute("href")).join("|")')
    if (/urbemind|UrbeMind/i.test(nav)) throw new Error(`el menú de ${rol} sigue enlazando UrbeMind`)
  }
  await comoRol('SUPERVISOR'); await ir('#/urbemind'); await dormir(1500)
  const h = await evaluar('location.hash'); if (h !== '#/vivo') throw new Error('#/urbemind no redirige al inicio: ' + h)
  const cargado = await evaluar('performance.getEntriesByType("resource").some(r=>r.name.includes("UrbeMind-"))'); if (cargado) throw new Error('se descargó la pantalla de UrbeMind')
  await captura('02-urbemind-redirige')
})
await paso('Ningún texto de la Etapa 2 en las pantallas (por rol, con selectores y notas)', async () => {
  const recorrido = [
    ['SUPERVISOR', ['#/vivo', '#/bandeja', '#/nuevo', '#/midia', '#/clientes', '#/clientes/cli-001', '#/ticket/tk-460', '#/ticket/tk-90', '#/torre', '#/politicas', '#/alertas', '#/cierre', '#/reasignar', '#/garantias', '#/morosidad', '#/ingreso', '#/buses', '#/libro']],
    ['GESTOR', ['#/vivo', '#/bandeja', '#/nuevo', '#/midia', '#/ticket/tk-272']],
    ['COORDINADOR_CX', ['#/torre', '#/fest', '#/cierre']],
    ['ADMIN_FUNCIONAL', ['#/configuracion', '#/midia']],
    ['MESA_SGD', ['#/mesa']],
    ['LEGAL_RECLAMOS', ['#/libro', '#/mesa']],
  ]
  const hallazgos = []
  for (const [rol, rutas] of recorrido) {
    await comoRol(rol)
    for (const r of rutas) {
      await ir(r); await dormir(1200)
      // pestañas de la pantalla (Configuración › Flujos / Guías, Mi día › Equipo / Correos, Torre…): se recorren todas
      const pestanas = await evaluar('[...document.querySelectorAll("main [role=tab]")].length')
      for (let i = 0; i <= pestanas; i++) {
        if (i > 0) { await evaluar(`document.querySelectorAll("main [role=tab]")[${i - 1}]?.click()`); await dormir(500) }
        const m = (await evaluar(visible)).match(ETAPA2)
        if (m) hallazgos.push(`${rol} ${r}${i ? ` (pestaña ${i})` : ''}: «${m[0]}»`)
      }
    }
  }
  // herramientas flotantes abiertas (Ver como, notas)
  await evaluar('document.querySelector(".pt-herr__fab")?.click()'); await dormir(400)
  const herr = (await evaluar(visible)).match(ETAPA2); if (herr) hallazgos.push(`Herramientas: «${herr[0]}»`)
  await evaluar('document.querySelector(".pt-herr__fab")?.click()')
  if (hallazgos.length) throw new Error([...new Set(hallazgos)].join(' · '))
})
await paso('Mi día: líderes del maestro local de ATC (#/midia)', async () => {
  await comoRol('ADMIN_FUNCIONAL'); await ir('#/midia'); await dormir(1200)
  for (let i = 0; i < 4; i++) { await evaluar(`document.querySelectorAll("main [role=tab]")[${i}]?.click()`); await dormir(400); if ((await evaluar('document.body.innerText')).includes('maestro local de ATC')) return }
  throw new Error('no aparece «maestro local de ATC» en Mi día')
})
await paso('Ver como › Cliente: navegación de Mi Portal', async () => {
  await evaluar('import("/assets/comun-CVU2GQ4h.js").then(m=>m.O.ajustar({personaId:"p-cliente"}))'); await dormir(800)
  const nav = await evaluar('[...document.querySelectorAll("nav a")].map(a=>a.textContent).join("|")')
  if (!nav.includes('Mis tickets') || !nav.includes('Nuevo ticket') || !nav.includes('Buses del Entrega Fest')) throw new Error('navegación: ' + nav)
})
await paso('Acceso con DNI y código (#/portal)', async () => {
  await ir('#/portal'); await esperarTexto('Entra a Mi Portal'); await captura('03-acceso')
  await evaluar('__t.escribir(__t.campo("DNI"),"95638594")'); await dormir(200); await evaluar('__t.boton("Enviarme el código")'); await esperarTexto('Código de un solo uso')
  // primero un código incorrecto: tiene que avisar y descontar intentos
  await evaluar('__t.escribir("#pp-codigo","000000")'); await evaluar('__t.boton("Entrar")'); await esperarTexto('El código no coincide')
  const cod = await evaluar('document.querySelector(".pp-codigo").textContent'); await captura('04-codigo')
  await evaluar(`__t.escribir("#pp-codigo",${JSON.stringify(cod)})`); await evaluar('__t.boton("Entrar")')
  await esperarTexto('Mis tickets'); await esperarTexto('AIN-000486')
})
await paso('Mis tickets: columnas y orden (HU-064 CA-02)', async () => {
  const cab = await evaluar('[...document.querySelectorAll("main th")].map(e=>e.textContent.trim()).join("|")')
  for (const c of ['N.º de ticket', 'Tipo', 'Estado', 'Área', 'Fecha de compromiso']) if (!cab.includes(c)) throw new Error('falta columna ' + c + ': ' + cab)
  await captura('05-mis-tickets')
})
await paso('Detalle: línea de tiempo, avisos y responder (HU-065, HU-066 CA-01)', async () => {
  await evaluar('__t.boton("AIN-000486")'); await esperarTexto('Seguimiento'); await esperarTexto('Avisos que te enviamos'); await esperarTexto('Te necesitamos')
  const t = await texto(); if (/Carla Rojas|Gabriela Núñez/.test(t)) throw new Error('aparece el nombre de un gestor')
  await captura('06-detalle-pendiente')
  await evaluar('__t.escribir(__t.campo("Tu respuesta"),"La visita fue el 8 de octubre a las 10:00, en la caseta de ventas.")'); await evaluar('__t.boton("Enviar mi respuesta")')
  await esperarTexto('Tú escribiste'); await esperarTexto('En atención'); await captura('07-detalle-respondido')
})
await paso('Ticket de otro cliente (HU-065 CA-04)', async () => {
  await ir('#/portal/ticket/tk-1'); await esperarTexto('No encontramos ese ticket entre los tuyos')
  const n = await evaluar('import("/assets/comun-CVU2GQ4h.js").then(m=>m.__ptNucleo.datos().auditoria.filter(a=>/no es suyo/.test(a.detalle)).length)'); if (n < 1) throw new Error('no quedó en la bitácora')
  await captura('08-ajeno')
})
await paso('Nuevo ticket: Reclamo deriva al Libro sin crear ticket (HU-064 CA-04)', async () => {
  await ir('#/portal/nuevo'); await esperarTexto('Tipo de solicitud')
  await evaluar('[...document.querySelectorAll("main input[type=radio]")].find(r=>r.value==="REC").click()'); await esperarTexto('se registra en el Libro de Reclamaciones')
  const hay = await evaluar('!![...document.querySelectorAll("main button")].find(b=>b.textContent.includes("Registrar mi solicitud"))'); if (hay) throw new Error('con Reclamo no debe poder registrarse un ticket')
  await captura('09-nuevo-reclamo')
})
await paso('Nuevo ticket: registro guiado con número y compromiso (HU-064 CA-01)', async () => {
  await evaluar('[...document.querySelectorAll("main input[type=radio]")].find(r=>r.value==="CTA").click()'); await esperarTexto('Cuéntanos tu caso')
  await evaluar('__t.escribir(__t.campo("Detalle"),"Pago no reflejado")')
  await evaluar('__t.escribir(__t.campo("Cuéntanos tu caso"),"Pagué la cuota de octubre en el agente y no aparece en mi estado de cuenta.")')
  await captura('10-nuevo-formulario')
  await evaluar('__t.boton("Registrar mi solicitud")'); await esperarTexto('Solicitud registrada'); await esperarTexto('Fecha de compromiso')
  await captura('11-nuevo-registrado')
  await evaluar('__t.boton("Ver mi ticket")'); await esperarTexto('Lo registraste en Mi Portal')
})
await paso('Resuelto por confirmar: confirmar cierra y dispara la encuesta (HU-066 CA-02)', async () => {
  await evaluar('__t.boton("Salir")'); await esperarTexto('Entra a Mi Portal')
  await evaluar('__t.escribir(__t.campo("DNI"),"94805186")'); await dormir(200); await evaluar('__t.boton("Enviarme el código")'); await esperarTexto('Código de un solo uso')
  const cod = await evaluar('document.querySelector(".pp-codigo").textContent'); await evaluar(`__t.escribir("#pp-codigo",${JSON.stringify(cod)})`); await evaluar('__t.boton("Entrar")')
  await esperarTexto('AIN-000488'); await evaluar('__t.boton("AIN-000488")'); await esperarTexto('¿Se solucionó tu caso?'); await captura('12-por-confirmar')
  await evaluar('__t.boton("Sí, confirmar y cerrar")'); await esperarTexto('Caso cerrado'); await captura('13-confirmado')
})
await paso('Mi Portal sin textos de la Etapa 2 (acceso, mis tickets, nuevo, detalle)', async () => {
  const hallazgos = []
  for (const r of ['#/portal', '#/portal/nuevo', '#/portal/ticket/tk-308']) {
    await ir(r); await dormir(800)
    if (r === '#/portal/nuevo') { await evaluar('[...document.querySelectorAll("main input[type=radio]")].find(r=>r.value==="REC")?.click()'); await dormir(300) }
    const m = (await evaluar(visible)).match(ETAPA2); if (m) hallazgos.push(`${r}: «${m[0]}»`)
  }
  await evaluar('__t.boton("Salir")'); await dormir(500)
  const m = (await evaluar(visible)).match(ETAPA2); if (m) hallazgos.push(`#/portal (acceso): «${m[0]}»`)
  // control: el detector sí encuentra un texto prohibido si aparece
  if (!ETAPA2.test('Integración UrbeMind') || !ETAPA2.test('se conecta en la Etapa 2') || ETAPA2.test('Ciudad Aybar Norte'.replace(/Ciudad Aybar Norte/, ''))) hallazgos.push('el detector no funciona')
  if (hallazgos.length) throw new Error(hallazgos.join(' · '))
  // vuelve a entrar como Pedro para el resto del recorrido
  await evaluar('__t.escribir(__t.campo("DNI"),"94805186")'); await evaluar('__t.boton("Enviarme el código")'); await esperarTexto('Código de un solo uso')
  const cod = await evaluar('document.querySelector(".pp-codigo").textContent'); await evaluar(`__t.escribir("#pp-codigo",${JSON.stringify(cod)})`); await evaluar('__t.boton("Entrar")'); await esperarTexto('Mis tickets')
})
await paso('Tema oscuro y móvil (390 px)', async () => {
  await evaluar('document.documentElement.setAttribute("data-theme","light")'); await ir('#/portal/ticket/tk-308'); await dormir(900); await captura('14a-claro-detalle')
  await ir('#/portal/nuevo'); await dormir(600); await captura('14b-claro-nuevo')
  await evaluar('document.documentElement.setAttribute("data-theme","dark")'); await ir('#/portal'); await dormir(800); await captura('14-oscuro')
  await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true }); await dormir(800)
  const desborda = await evaluar('document.documentElement.scrollWidth > innerWidth + 1'); await captura('15-movil')
  if (desborda) throw new Error('hay desplazamiento horizontal en móvil')
  const tarjetas = await evaluar('document.querySelectorAll("main .pt-tarjetas .pt-tarjeta").length'); if (!tarjetas) throw new Error('en móvil no salen tarjetas')
  await ir('#/portal/ticket/tk-308'); await dormir(800); await captura('15b-movil-detalle')
  const desborda2 = await evaluar('document.documentElement.scrollWidth > innerWidth + 1'); if (desborda2) throw new Error('el detalle desborda en móvil')
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1366, height: 900, deviceScaleFactor: 1, mobile: false }); await evaluar('document.documentElement.removeAttribute("data-theme")')
})
await paso('Gestor ve el ticket del portal en la consola (canal Mi Portal)', async () => {
  await evaluar('import("/assets/comun-CVU2GQ4h.js").then(m=>m.O.ajustar({personaId:"p-crojas"}))'); await dormir(300)
  const id = await evaluar('import("/assets/comun-CVU2GQ4h.js").then(m=>m.__ptNucleo.datos().tickets.filter(t=>t.canal==="Mi Portal").at(-1).id)')
  await ir('#/ticket/' + id); await esperarTexto('Mi Portal'); await captura('16-consola-ticket-portal')
})
await paso('Menos movimiento: Operación en vivo sin errores', async () => {
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  await cdp('Page.navigate', { url: BASE + '?reducido=1#/vivo' }); await dormir(3500); await evaluar(H); await esperarTexto('Operación en vivo')
  const rm = await evaluar('matchMedia("(prefers-reduced-motion: reduce)").matches'); if (!rm) throw new Error('no se emuló reduce')
  await evaluar('document.getElementById("inicio-vivo")?.scrollIntoView()'); await dormir(1500); await captura('17-vivo-reducido')
})

console.log(pasos.join('\n'))
console.log(`\nCapturas en ${CAPS}`)
console.log(errores.length ? `\nERRORES (${errores.length}):\n` + [...new Set(errores)].join('\n') : '\nSin errores de JS, consola ni red.')
ws.close(); chrome.kill()
process.exit(pasos.some((p) => p.startsWith('FALLA')) || errores.length ? 1 : 0)
