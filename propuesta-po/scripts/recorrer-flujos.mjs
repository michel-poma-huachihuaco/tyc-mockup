// Recorre en Chrome sin interfaz (CDP) la HU-ATC-043: Configuración › Flujos, Nuevo ticket y el detalle del ticket.
// Uso, con el servidor arriba (npm run preview):  node scripts/recorrer-flujos.mjs   (BASE, CHROME, CAPTURAS, PERFIL_CHROME y
// PUERTO_CDP como en recorrer-consulta360). Parte de la semilla recién cargada: publica la versión 2 del flujo del CA-01.
import { spawn } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const BASE = process.env.BASE ?? 'http://localhost:5180/'
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const CAPS = (process.env.CAPTURAS ?? join(tmpdir(), 'propuesta-po-capturas-043')) + '/'
const PERFIL = (process.env.PERFIL_CHROME ?? join(tmpdir(), 'propuesta-po-chrome-043')) + '/'
rmSync(PERFIL, { recursive: true, force: true }); mkdirSync(CAPS, { recursive: true })
const PUERTO = Number(process.env.PUERTO_CDP ?? 9348)
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
const esperarTexto = async (t, ms = 8000) => { for (let i = 0; i < ms / 100; i++) { if ((await texto()).includes(t)) return; await dormir(100) } throw new Error(`no apareció «${t}»\n---\n${(await texto()).slice(0, 1500)}`) }
const ir = (hash) => evaluar(`location.hash=${JSON.stringify(hash)}`)
const como = (id) => evaluar(`import("/assets/comun-CVU2GQ4h.js").then(m=>m.O.ajustar({personaId:${JSON.stringify(id)}}))`)
// helpers como los de recorrer-navegador.mjs, pero buscan también dentro del diálogo (fuera de <main>)
const H = `
window.__t={
 boton:(txt)=>{const b=[...document.querySelectorAll('button, a')].reverse().find(e=>e.textContent.trim()===txt||e.textContent.trim().startsWith(txt));if(!b)throw new Error('sin botón '+txt);b.click();return true},
 escribir:(sel,val)=>{const e=document.querySelector(sel);if(!e)throw new Error('sin campo '+sel);const p=e.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:e.tagName==='SELECT'?HTMLSelectElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(p,'value').set.call(e,val);e.dispatchEvent(new Event(e.tagName==='SELECT'?'change':'input',{bubbles:true}));if(e.getAttribute('role')==='spinbutton')e.dispatchEvent(new FocusEvent('focusout',{bubbles:true}));return true},
 campo:(etq)=>{const l=[...document.querySelectorAll('label')].reverse().find(x=>x.textContent.trim().startsWith(etq));if(!l)throw new Error('sin etiqueta '+etq);return '#'+CSS.escape(l.htmlFor)},
}`
const pasos = []
const paso = async (nombre, fn) => { const antes = errores.length; try { await fn(); pasos.push(`ok    ${nombre}${errores.length > antes ? ` (con ${errores.length - antes} errores)` : ''}`) } catch (e) { pasos.push(`FALLA ${nombre}: ${e.message.split('\n').slice(0, 8).join(' | ')}`) } }
const dialogo = () => evaluar('document.querySelector("[role=dialog]")?.innerText ?? ""')
const escribirEn = (etq, val) => evaluar(`__t.escribir(__t.campo(${JSON.stringify(etq)}),${JSON.stringify(val)})`)
// cliente del maestro: se escribe en el combobox y se elige la primera opción (la opción se elige con «mousedown»)
const elegirCliente = async (q) => {
  await escribirEn('Cliente', q)
  for (let i = 0; i < 40 && !(await evaluar('!!document.querySelector("[role=option]")')); i++) await dormir(100)
  await evaluar('document.querySelector("[role=option]").dispatchEvent(new MouseEvent("mousedown",{bubbles:true,cancelable:true}))'); await dormir(300)
}

await cdp('Page.enable'); await cdp('Runtime.enable'); await cdp('Network.enable')
await cdp('Page.navigate', { url: BASE + '#/bandeja' }); await dormir(3000); await evaluar(H)

await paso('CA-08 sin rol de administrador funcional: Configuración bloqueada', async () => {
  await como('p-crojas'); await ir('#/configuracion'); await esperarTexto('No tienes permiso para configurar flujos y guías')
})
await paso('Tabla tipo · subtipo · área · responsable · actividades · SLA, y bitácora (flujos del PO y del CA-01)', async () => {
  await como('p-aperez'); await ir('#/configuracion'); await esperarTexto('Bitácora de publicaciones'); await esperarTexto('Garantía postventa')
  const t = await texto()
  for (const s of ['Reclamo', 'Garantía postventa', 'Postventa', 'Lucía Ccahuana', 'Inspección (Óscar Medina · 8 h) → Informe técnico (Óscar Medina · 16 h) → Respuesta al cliente (Lucía Ccahuana · 8 h)', '32 h hábiles', 'Alonso Pérez']) if (!t.includes(s)) throw new Error('falta ' + s)
  await captura('043-01-flujos')
})
await paso('CA-03 datos obligatorios: no publica e indica cuál', async () => {
  await evaluar('__t.boton("Nuevo flujo")'); await dormir(500)
  await evaluar('__t.boton("Publicar el flujo")'); await dormir(900)
  const d = await dialogo()
  for (const s of ['Elige el tipo de ticket.', 'Escribe el subtipo.', 'Elige el área.', 'Elige al responsable del flujo.', 'La actividad 1 no tiene nombre.', 'La actividad 1 no tiene responsable.', 'La actividad 1 necesita su SLA en horas hábiles.']) if (!d.includes(s)) throw new Error('falta ' + s + '\n' + d.slice(0, 800))
  await captura('043-02-obligatorios')
})
await paso('CA-06 combinación única: no la permite y ofrece una nueva versión; CA-02/08 queda en la bitácora', async () => {
  await escribirEn('Tipo de ticket', 'REC'); await escribirEn('Subtipo', 'Garantía postventa'); await escribirEn('Área', 'POSTVENTA'); await escribirEn('Responsable del flujo', 'p-lccahuana')
  await escribirEn('Nombre de la actividad 1', 'Inspección'); await escribirEn('Responsable de la actividad 1', 'p-omedina'); await escribirEn('SLA de la actividad 1', '8')
  await dormir(200); await evaluar('__t.boton("Publicar el flujo")'); await dormir(1200)
  if (!(await dialogo()).includes('Esa combinación ya tiene flujo')) throw new Error('sin aviso de combinación duplicada\n' + (await dialogo()).slice(0, 600))
  await captura('043-03-duplicado')
  await evaluar('__t.boton("Crear una nueva versión")'); await dormir(400)
  if (!(await dialogo()).includes('Publicar la versión 2')) throw new Error('no ofrece la versión 2')
  await evaluar('__t.boton("Añadir una actividad")'); await dormir(200)
  await escribirEn('Nombre de la actividad 2', 'Respuesta al cliente'); await escribirEn('Responsable de la actividad 2', 'rol:COLABORADOR'); await escribirEn('SLA de la actividad 2', '8')
  await dormir(200); await evaluar('__t.boton("Publicar la versión 2")'); await dormir(1500)
  const t = await texto()
  if (!t.includes('Respuesta al cliente (Colaborador de área (rol) · 8 h)') || !/v2/.test(t)) throw new Error('la tabla no muestra la versión 2\n' + t.slice(0, 1200))
  const filas = await evaluar('Math.max(0,...[...document.querySelectorAll(\'[aria-label="Bitácora de publicaciones"]\')].map(e=>e.querySelectorAll("tbody tr").length))')
  // la semilla trae 6 flujos (los 4 del PO con subtipo «General», «Consulta de cuenta · Estado de cuenta del lote» y el del
  // CA-01): con la versión 2, 7 publicaciones
  if (filas !== 7) throw new Error('bitácora con ' + filas + ' filas')
  await captura('043-04-version2')
})
let numero
await paso('CA-01/05 Nuevo ticket con tipo y subtipo: Postventa, responsable del flujo y SLA de la suma', async () => {
  await como('p-crojas'); await ir('#/nuevo'); await esperarTexto('Registra la solicitud'); await dormir(400)
  await evaluar('[...document.querySelectorAll("input[type=radio]")].find(r=>r.value==="Teléfono")?.click()')
  await elegirCliente('María Vargas')
  await escribirEn('Empresa', 'AIN'); await escribirEn('Línea de negocio', 'Vivienda'); await escribirEn('Tipo de ticket', 'REC'); await dormir(200)
  await escribirEn('Subtipo', 'Garantía postventa'); await escribirEn('Prioridad', 'MEDIUM'); await dormir(300)
  const lat = await evaluar('document.querySelector("aside")?.innerText ?? ""')
  if (!lat.includes('Reclamo · Garantía postventa · Postventa · versión 2') || !lat.includes('16 h hábiles, suma de las actividades del flujo')) throw new Error('lateral sin flujo/SLA del flujo: ' + lat.replace(/\n/g,' / '))
  await captura('043-05-nuevo')
  await escribirEn('Resumen', 'Reclamo de garantía postventa'); await escribirEn('Descripción', 'Registro de prueba del flujo.')
  await dormir(200); await evaluar('__t.boton("Registrar ticket")'); await dormir(1800)
  numero = await evaluar('document.querySelector(".pt-registrado__numero")?.textContent')
  if (!numero) throw new Error('no se registró\n' + (await texto()).slice(0, 1500))
  await evaluar('__t.boton("Ver el ticket")'); await esperarTexto('Actividades del flujo')
  const t = await texto()
  for (const s of ['Reclamo · Garantía postventa · Postventa', 'Lucía Ccahuana', '16 h hábiles (suma de las actividades)', '1. Inspección', 'En curso', '2. Respuesta al cliente', 'Pendiente']) if (!t.includes(s)) throw new Error('falta ' + s)
  await captura('043-06-detalle')
})
await paso('CA-04 cerrar la primera actividad habilita la siguiente para su responsable (rol)', async () => {
  await evaluar('__t.boton("Cerrar la actividad")'); await dormir(1500)
  const t = await texto()
  if (!t.includes('Cerrada por Carla Rojas') || !t.includes('Habilitada para Colaborador de área (rol)')) throw new Error('no avanzó\n' + t.slice(0, 2000))
  await captura('043-07-actividad-cerrada')
})
await paso('CA-07 ticket sin flujo: alerta al administrador funcional en Configuración › Alertas', async () => {
  await ir('#/nuevo'); await esperarTexto('Registra la solicitud'); await dormir(300)
  await evaluar('[...document.querySelectorAll("input[type=radio]")].find(r=>r.value==="Correo")?.click()')
  await elegirCliente('María Vargas')
  await escribirEn('Empresa', 'AIN'); await escribirEn('Línea de negocio', 'Vivienda'); await escribirEn('Tipo de ticket', 'QUE'); await escribirEn('Prioridad', 'MEDIUM')
  await escribirEn('Resumen', 'Queja por la atención'); await escribirEn('Descripción', 'Registro de prueba sin flujo.'); await dormir(300)
  const lat = await evaluar('document.querySelector("aside")?.innerText ?? ""'); if (!lat.includes('Sin flujo publicado')) throw new Error('lateral: ' + lat)
  await evaluar('__t.boton("Registrar ticket")'); await dormir(1800)
  await como('p-aperez'); await ir('#/configuracion'); await esperarTexto('Bitácora de publicaciones')
  await evaluar('[...document.querySelectorAll("main [role=tab]")].find(t=>t.textContent.includes("Alertas"))?.click()'); await dormir(600)
  const t = await texto(); if (!t.includes('Sin flujo en el área') || !t.includes('«Queja» sin subtipo no tiene flujo publicado en ATC')) throw new Error('sin alerta\n' + t.slice(0, 1500))
  await captura('043-08-alerta')
})

console.log(pasos.join('\n'))
if (errores.length) console.log('\nErrores del navegador:\n' + [...new Set(errores)].join('\n'))
ws.close(); chrome.kill()
process.exit(pasos.some((p) => p.startsWith('FALLA')) || errores.length ? 1 : 0)
