// Recorre en Chrome sin interfaz (CDP) las garantías postventa parcheadas: HU-034 CA-02, HU-035 CA-01 y HU-036 CA-01.
// Uso, con el servidor arriba (npm run preview):  node scripts/recorrer-garantias.mjs   (BASE, CHROME y CAPTURAS como en recorrer-navegador)
// Los archivos de prueba (JPG, PNG, PDF y un MP4 no admitido, de pocos bytes) se generan en una carpeta temporal.
import { spawn } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const BASE = process.env.BASE ?? 'http://localhost:5180/'
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const CAPS = (process.env.CAPTURAS ?? join(tmpdir(), 'garantias-capturas')) + '/'
const ARCH = join(tmpdir(), 'garantias-archivos')
mkdirSync(ARCH, { recursive: true })
writeFileSync(join(ARCH, 'foto-losa-1.jpg'), Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(200), Buffer.from([0xff, 0xd9])]))
writeFileSync(join(ARCH, 'foto-losa-2.png'), Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC', 'base64'))
writeFileSync(join(ARCH, 'informe-inspeccion.pdf'), '%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n')
writeFileSync(join(ARCH, 'video.mp4'), Buffer.concat([Buffer.from('000000186674797070', 'hex'), Buffer.alloc(100)]))
const PERFIL = join(tmpdir(), 'garantias-chrome') + '/'
rmSync(PERFIL, { recursive: true, force: true }); mkdirSync(CAPS, { recursive: true })
const PUERTO = 9334
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
const esperarTexto = async (t, ms = 8000) => { for (let i = 0; i < ms / 100; i++) { if ((await texto()).includes(t)) return; await dormir(100) } throw new Error(`no apareció «${t}»\n---\n${(await texto()).slice(0, 1200)}`) }
const noTexto = async (t) => { if ((await texto()).includes(t)) throw new Error(`no debería verse «${t}»`) }
const ir = (hash) => evaluar(`location.hash=${JSON.stringify(hash)}`)
const C = 'import("/assets/comun-CVU2GQ4h.js")'
const comoRol = (rol) => evaluar(`${C}.then(m=>m.O.ajustar({personaId:m.w[${JSON.stringify(rol)}]}))`)
// botones del documento entero (los diálogos no viven dentro de <main>)
const boton = (txt) => evaluar(`(()=>{const b=[...document.querySelectorAll('button, a')].filter(e=>e.offsetParent!==null).find(e=>e.textContent.trim()===${JSON.stringify(txt)});if(!b)throw new Error('sin botón '+${JSON.stringify(txt)});b.click();return true})()`)
const escribirEnDialogo = (sel, val) => evaluar(`(()=>{const e=document.querySelector('[role=dialog] ${sel}');const p=e.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(p,'value').set.call(e,${JSON.stringify(val)});e.dispatchEvent(new Event('input',{bubbles:true}));return true})()`)
const subir = async (nombres) => {
  const { root } = await cdp('DOM.getDocument', { depth: -1, pierce: true })
  const { nodeId } = await cdp('DOM.querySelector', { nodeId: root.nodeId, selector: '[role=dialog] input[type=file]' })
  await cdp('DOM.setFileInputFiles', { nodeId, files: nombres.map((n) => join(ARCH, n)) })
}
const pasos = []
const paso = async (nombre, fn) => { const antes = errores.length; try { await fn(); pasos.push(`ok    ${nombre}${errores.length > antes ? ` (con ${errores.length - antes} errores)` : ''}`) } catch (e) { pasos.push(`FALLA ${nombre}: ${e.message.split('\n').slice(0, 6).join(' | ')}`) } }

await cdp('Page.enable'); await cdp('Runtime.enable'); await cdp('Network.enable'); await cdp('DOM.enable')
await cdp('Page.navigate', { url: BASE + '#/garantias' }); await dormir(3000)
await comoRol('SUPERVISOR'); await dormir(300)

await paso('HU-034 CA-02 · GAR-0087: el motivo se informó al cliente y queda en la trazabilidad', async () => {
  await ir('#/garantias/gar-249'); await esperarTexto('No procedente por vigencia')
  await esperarTexto('Se informó al cliente el'); await esperarTexto('por WhatsApp.'); await esperarTexto('Motivo informado al cliente')
  await noTexto('Registrar carta notarial')
  await captura('034-gar-0087')
})
await paso('HU-034 CA-02 · un reclamo nuevo fuera de cobertura también avisa', async () => {
  const id = await evaluar(`${C}.then(m=>m.E.registrarGarantia({entregaId:'ACT-0301',tipo:'ACABADOS',descripcion:'Puerta de la cocina hinchada.',ticketId:'',reclamada:new Date(2026,9,14)})).then(g=>g.id)`)
  await ir('#/garantias/' + id); await esperarTexto('por WhatsApp.')
  const n = await evaluar(`${C}.then(m=>m.__ptNucleo.datos().notificaciones.filter(x=>x.id==='no-${id}'&&x.para==='cliente:cli-036').length)`)
  if (n !== 1) throw new Error('sin aviso al cliente')
})
await paso('HU-035 CA-01 · GAR-0089: informe con PDF, JPG y PNG; sin foto no se registra', async () => {
  await evaluar(`${C}.then(m=>m.E.programarInspeccion('gar-585',new Date(2026,9,17)))`)
  await ir('#/garantias/gar-585'); await esperarTexto('Registrar la inspección'); await boton('Registrar la inspección'); await esperarTexto('Fotos y documentos de la inspección')
  await escribirEnDialogo('textarea', 'Grietas de 1 mm en la losa del patio; no comprometen la estructura.')
  await subir(['video.mp4']); await esperarTexto('solo se admiten')
  await subir(['informe-inspeccion.pdf']); await dormir(500)
  await boton('Registrar'); await esperarTexto('Adjunta al menos una foto (JPG o PNG)')
  await subir(['foto-losa-1.jpg', 'foto-losa-2.png']); await dormir(800)
  const lista = await evaluar('[...document.querySelectorAll("[role=dialog] .ay-upload__item")].map(e=>e.innerText.replace(/\\s+/g," ")).join(" | ")')
  if (!/informe-inspeccion/.test(lista) || !/foto-losa-1/.test(lista) || !/foto-losa-2/.test(lista)) throw new Error('lista: ' + lista)
  await captura('035-dialogo-varios')
  await boton('Registrar'); await esperarTexto('inspección registrada'); await dormir(600)
  const n = await evaluar(`${C}.then(m=>m.__ptNucleo.datos().garantias.find(g=>g.id==='gar-585').inspeccion.evidencias.length)`)
  if (n !== 3) throw new Error('evidencias: ' + n)
  await esperarTexto('foto-losa-2.png'); await captura('035-gar-0089-registrada')
})
await paso('HU-036 CA-01 · GAR-0088 sin ticket y el cliente sin ticket de garantía: lleva a «Nuevo ticket»', async () => {
  await ir('#/garantias/gar-314'); await esperarTexto('Resolver el reclamo')
  await boton('Registrar carta notarial'); await esperarTexto('El cliente no tiene un ticket de garantía'); await esperarTexto('Ir a «Nuevo ticket»')
  await captura('036-sin-ticket'); await boton('Cancelar'); await dormir(400)
})
await paso('HU-036 CA-01 · GAR-0088: vincula el ticket, marca la carta y bloquea «Resolver»', async () => {
  const tk = await evaluar(`${C}.then(m=>m.E.crearTicket({canal:'Teléfono',empresaId:'APV',linea:'Vivienda',establecimiento:'',clienteId:'cli-037',tipo:'GAR',prioridad:'MEDIUM',resumen:'Terma no calienta y el tablero salta',descripcion:'Reporta la falla de la terma.'})).then(t=>({id:t.id,numero:t.numero}))`)
  await ir('#/garantias'); await dormir(300); await ir('#/garantias/gar-314'); await esperarTexto('Registrar carta notarial')
  await boton('Registrar carta notarial'); await esperarTexto('Ticket de garantía del cliente')
  await boton('Registrar y marcar la señal'); await esperarTexto('Elige el ticket de garantía del cliente')
  await evaluar(`document.querySelector('[role=dialog] input[type=radio][value="${tk.id}"]').click()`); await dormir(200)
  await captura('036-dialogo-ticket')
  await boton('Registrar y marcar la señal'); await esperarTexto('carta notarial registrada'); await dormir(600)
  await esperarTexto('Conflicto: se atiende en Eje 3'); await esperarTexto('Carta notarial recibida'); await esperarTexto('Ticket vinculado'); await esperarTexto(tk.numero)
  await noTexto('Resolver el reclamo'); await noTexto('Registrar carta notarial')
  await captura('036-conflicto')
  await boton('Ir al ticket para derivar'); await esperarTexto('Caso de conflicto: se atiende en Eje 3'); await esperarTexto('Derivar a Eje 3')
  await captura('036-ticket')
  await evaluar(`${C}.then(async m=>{await m.E.registrarNotaEmocional('${tk.id}','Entrega copia de la carta notarial y pide respuesta por escrito.');await m.E.enviarHandoff('${tk.id}',{id:'APV · cliente validado',kyc:'Validado en SIGDA/TAXON',lote:'Residencial Brisas · Torre C 201',pagos:'Al día',atencion:'Reclamo GAR-0088 con carta notarial',paso:'Revisión legal de la carta'})})`)
  await ir('#/garantias/gar-314'); await esperarTexto('Derivado a Eje 3'); await noTexto('Resolver el reclamo')
  await captura('036-derivado')
})
await paso('Móvil 390 px: el reclamo y el diálogo de carga no desbordan', async () => {
  await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true }); await dormir(600)
  await ir('#/garantias/gar-109'); await esperarTexto('Registrar carta notarial'); await dormir(500)
  if (await evaluar('document.documentElement.scrollWidth > innerWidth + 1')) throw new Error('desborda en móvil')
  await boton('Registrar carta notarial'); await esperarTexto('APV-000089'); await captura('036-movil-gar-0085')
  await boton('Cancelar')
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1366, height: 900, deviceScaleFactor: 1, mobile: false })
})

console.log(pasos.join('\n'))
console.log(`\nCapturas en ${CAPS}`)
console.log(errores.length ? `\nERRORES (${errores.length}):\n` + [...new Set(errores)].join('\n') : '\nSin errores de JS, consola ni red.')
ws.close(); chrome.kill()
process.exit(pasos.some((p) => p.startsWith('FALLA')) || errores.length ? 1 : 0)
