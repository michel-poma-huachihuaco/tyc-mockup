import { EscenaRed } from './red360/escena.ts'
import { EscenaCiudad } from './ciudad/escena.ts'
import { SOURCES, DATA, CLIENTS, ROLES, SEM, bloqueado, caido, type Dato } from './red360/datos.ts'
import {
  crearSim, sembrar, tick, spawn, marcarRayo, desmarcarRayo, slaRestante, hm, fmt,
  GATES, TYPES, CONFLICTOS, NIVELES, LIMITE_RAYO, type Sim, type Modo, type Rol, type Ticket, type Area,
} from './ciudad/sim.ts'
import { sinMovimiento } from './etiquetas.ts'

const $ = <T extends HTMLElement = HTMLElement>(s: string) => document.querySelector<T>(s)!
const esc = (s: unknown) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)
const RM = sinMovimiento()
const COL = { ok: '#2E8B57', warn: '#E39B1C', bad: '#C0453A', orange: '#F6A42C', teal2: '#2B616C' }

const params = new URLSearchParams(location.search)
let modo: Modo = params.get('modo') === 'hu' ? 'hu' : 'po'
let rol: Rol = params.get('rol') === 'supervisor' ? 'supervisor' : 'gestor'

// =========================================================================== 360
const red = new EscenaRed($('#nnStage'), RM)
const caidas: [string, string][] = [['', 'Todas en línea'], ['cob', 'Cobranza'], ['repo', 'Repositorio']]

function ui360() {
  $('#nnClients').innerHTML = CLIENTS.map((c) => `<button class="nn-chip" type="button" data-k="${c.k}" aria-pressed="${c === red.cliente}">${esc(c.n)}</button>`).join('')
  $('#roles').innerHTML = ROLES.map((r) => `<button class="btn" type="button" data-r="${r.k}" aria-pressed="${r.k === red.rol}">${r.n}</button>`).join('')
  $('#downs').innerHTML = caidas.map(([k, n]) => `<button class="btn" type="button" data-d="${k}" aria-pressed="${(red.caida ?? '') === k}">${n}</button>`).join('')
}
const visibles = () => DATA.filter((d) => red.lit[d.id] && !bloqueado(d, red.rol) && !caido(d, red.caida)).length
function clienteCard() {
  const k = red.cliente, d = k.data
  $('#clientCard').innerHTML = `<div class="id"><div class="avatar">${k.ini}</div><div><h3>${esc(k.n)}</h3><small>${esc(k.doc)} · ${esc(k.proj)} · cliente de ejemplo</small></div></div>
   <div class="kv"><div><span>Lotes</span><b>${k.lotes.join(', ')}</b></div><div><span>Cuotas vencidas</span><b>${esc(d.cuotas![0]![1])}</b></div>
   <div><span>Tickets</span><b>${d.tick!.length}</b></div><div><span>Datos visibles</span><b class="num">${visibles()} / ${DATA.length}</b></div></div>`
}
function detalle() {
  const d: Dato = DATA.find((x) => x.id === red.sel) ?? DATA[2]!
  const srcs = d.s.map((s) => SOURCES.find((x) => x.id === s)!.n).join(' + ')
  let body: string
  if (bloqueado(d, red.rol)) body = `<div class="lock">🔒 Tu rol no puede ver esta sección en el sistema de origen. La búsqueda aplica los mismos permisos (RN-SVC-036).</div>`
  else if (caido(d, red.caida)) body = `<div class="lock">${esc(srcs)} no responde. Las demás secciones cargan y esta muestra «no disponible»; el ticket se registra con datos mínimos y se vincula cuando la fuente vuelva (RF-SVC-051).</div>`
  else if (!red.lit[d.id]) body = `<div class="empty">Pulsa <b>Consultar</b> para traer este dato desde ${esc(srcs)}.</div>`
  else body = `<div class="rows">${red.cliente.data[d.id]!.map((r) => `<div class="row"><b>${esc(r[0])}</b><em>${esc(r[1])}</em></div>`).join('')}</div>`
  const sem = d.sem ? `<div class="note">Búsqueda semántica (RF-SVC-053): prueba «${SEM[0]!.q}» o «${SEM[2]!.q}».</div>` : ''
  $('#detail').innerHTML = `<h4>${esc(d.n)}</h4><div class="src">Fuente: ${esc(srcs)} · consulta en línea, sin copia</div>${body}${sem}`
}
let lastLitKey = ''
red.onCambio = () => { $('#nnTime').textContent = red.estado; clienteCard(); detalle() }
// los datos se iluminan pulso a pulso: refrescar paneles solo cuando cambia el conjunto
const litKey = () => Object.keys(red.lit).length + red.estado
function porFrame360() { const k = litKey(); if (k !== lastLitKey) { lastLitKey = k; red.onCambio() } }

$('#nnClients').addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('[data-k]'); if (!b) return
  red.fijarCliente(CLIENTS.find((c) => c.k === b.dataset.k)!); $<HTMLInputElement>('#nnQuery').value = red.cliente.doc; ui360(); red.consultar($<HTMLInputElement>('#nnQuery').value)
})
$('#roles').addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('[data-r]'); if (!b) return
  red.rol = b.dataset.r!; ui360(); red.onCambio()
})
$('#downs').addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('[data-d]'); if (!b) return
  red.caida = b.dataset.d || null; ui360(); red.consultar($<HTMLInputElement>('#nnQuery').value)
})
$('#nnForm').addEventListener('submit', (e) => {
  e.preventDefault()
  const q = $<HTMLInputElement>('#nnQuery').value.toLowerCase()
  const c = CLIENTS.find((x) => q.includes(x.n.split(' ')[0]!.toLowerCase()) || q.includes(x.lotes[0]!.toLowerCase()))
  if (c) { red.fijarCliente(c); ui360() }
  red.consultar(q)
})
const lienzoRed = $('#nnStage')
lienzoRed.addEventListener('click', (e) => { const p = red.elegir(e as PointerEvent); if (p) { red.sel = p; red.onCambio() } })
lienzoRed.addEventListener('pointermove', (e) => { red.setHover(red.elegir(e as PointerEvent)) })

// =========================================================================== ciudad
let sim: Sim
let ciudad: EscenaCiudad | null = null
let sel: Ticket | null = null
let selArea = 'hub'
let paused = RM, speed = 1
let ultimoHud = 0

const PASOS = ['Registrado', 'En bandeja', 'Asignado', 'En atención', 'Resuelto', 'Cerrado'], SK = ['reg', 'band', 'asig', 'aten', 'res', 'cer'] as const

function iniciarCiudad() {
  ciudad?.destruir()
  sim = crearSim(modo, 7); sembrar(sim)
  sel = sim.tickets.find((t) => t.st === 'atencion') ?? sim.tickets.find((t) => !t.drone) ?? null
  selArea = sel ? sel.area : 'hub'
  ciudad = new EscenaCiudad($('#cityCanvas'), () => sim)
  ciudad.sel = sel; ciudad.selArea = selArea
  ciudad.dom.addEventListener('click', (e) => {
    const h = ciudad!.elegir(e as PointerEvent); if (!h) return
    if (h.k === 'ticket') { sel = h.t; selArea = h.t.area }
    else if (h.k === 'area') selArea = h.ref
    else { const t = spawn(sim, h.ref); sel = t; toast(`Nuevo ticket por ${GATES.find((g) => g.k === h.ref)!.n}: ${t.id}`) }
    sincronizar(); renderHUD(true)
  })
  renderHUD(true)
}
const sincronizar = () => { if (ciudad) { ciudad.sel = sel; ciudad.selArea = selArea } }

let toastT = 0
function toast(m: string) {
  const el = $('#toast'); el.textContent = m; el.style.opacity = '1'
  clearTimeout(toastT); toastT = window.setTimeout(() => (el.style.opacity = '0'), 2600)
}

const chipFor = (t: Ticket) => {
  if (t.st === 'cerrado') return `<span class="chip ok">Cerrado · CSAT ${t.csat}</span>`
  const l = slaRestante(sim, t)
  if (t.esc || l < 0) return `<span class="chip bad">${modo === 'hu' && t.nivelEsc > 1 ? NIVELES[t.nivelEsc - 1] : 'Escalado'}</span>`
  return l / t.sla < 0.35 ? `<span class="chip warn">SLA ${Math.round(l)} min</span>` : `<span class="chip ok">SLA ${Math.round(l)} min</span>`
}
const cargaTxt = (a: Area) => `${a.gs.filter((g) => g.t).length} / ${a.gs.length}`

interface Resumen { title: string; sub: string; pic: string; chip: string; stats: [string, string | number, number | null][]; list: Ticket[]; gs: Area['gs'] | null }
function resumen(k: string): Resumen {
  const activos = sim.tickets.filter((t) => !t.drone && t.st !== 'cerrado')
  const sla = sim.resolved ? Math.round((sim.inSla / sim.resolved) * 100) + ' %' : '—'
  if (k === 'hub') {
    const inbox = sim.tickets.filter((t) => t.st === 'bandeja')
    return { title: 'Bandeja orquestadora', sub: 'Todas las áreas · 5 canales', pic: 'ATC', chip: inbox.some((t) => t.esc) ? '<span class="chip bad">Con escalados</span>' : '<span class="chip ok">Operativa</span>',
      stats: [['En bandeja', inbox.length, null], ['Activos', activos.length, null], ['Resueltos', sim.resolved, null], ['En SLA', sla, sim.resolved ? sim.inSla / sim.resolved : 0]],
      list: activos.sort((a, b) => +b.rayo - +a.rayo || slaRestante(sim, a) - slaRestante(sim, b)).slice(0, 7), gs: null }
  }
  if (k === 'com') return { title: 'Comité de escalamiento', sub: modo === 'po' ? 'SLA vencido → correo al líder → Comité' : 'Solo casos sensibles: alerta → memorándum → Comité → Directorio', pic: '!', chip: `<span class="chip bad">${sim.escal} escalados</span>`,
    stats: [['Escalados', sim.escal, null], ['Activos vencidos', activos.filter((t) => t.esc).length, null]], list: sim.tickets.filter((t) => t.esc && !t.drone).slice(-7).reverse(), gs: null }
  if (k === 'exit') return { title: 'Cierre en Mi Portal', sub: 'Cierre formal y encuesta (RF-SVC-019)', pic: 'OK', chip: '<span class="chip ok">Encuesta activa</span>',
    stats: [['Cerrados', sim.resolved, null], ['CSAT', sim.csat.length ? (sim.csat.reduce((a, b) => a + b, 0) / sim.csat.length).toFixed(1) : '—', null]], list: sim.tickets.filter((t) => t.st === 'cerrado').slice(-7).reverse(), gs: null }
  const A = sim.areas.find((a) => a.k === k)!
  const inA = A.q.concat(A.gs.filter((g) => g.t).map((g) => g.t!))
  const riesgo = inA.some((t) => t.esc), busy = A.gs.filter((g) => g.t).length
  return { title: A.n, sub: `${A.gs.length} gestores de tickets · flujo propio (RF-SVC-043)`, pic: A.n.slice(0, 2).toUpperCase(),
    chip: riesgo ? '<span class="chip bad">SLA vencido</span>' : A.q.length > 3 ? '<span class="chip warn">Cola alta</span>' : '<span class="chip ok">Operativa</span>',
    stats: [['En cola', A.q.length, Math.min(1, A.q.length / 6)], ['Gestores ocupados', cargaTxt(A), busy / A.gs.length], ['Resueltos', A.res, null], ['En SLA', A.res ? Math.round((A.inSla / A.res) * 100) + ' %' : '—', A.res ? A.inSla / A.res : 0]],
    list: inA, gs: A.gs }
}

const AREAS_BTN = () => [['hub', 'Bandeja'], ...sim.areas.map((a) => [a.k, a.n] as [string, string]), ['com', 'Comité'], ['exit', 'Cierre']] as [string, string][]

function renderHUD(force = false) {
  const now = performance.now()
  if (!force && now - ultimoHud < 350) return
  ultimoHud = now
  $('#kActive').textContent = String(sim.tickets.filter((t) => !t.drone && t.st !== 'cerrado').length)
  $('#kSla').innerHTML = sim.resolved ? `${Math.round((sim.inSla / sim.resolved) * 100)}%<i style="color:${sim.inSla / sim.resolved >= 0.9 ? COL.ok : '#B4700F'}">meta 90 %</i>` : '—'
  $('#kCsat').textContent = sim.csat.length ? (sim.csat.reduce((a, b) => a + b, 0) / sim.csat.length).toFixed(1) + ' / 5' : '—'
  $('#xpBox').hidden = modo === 'hu'
  $('#kLvl').textContent = String(sim.lvl); $('#kXpBar').style.width = (sim.xp / (sim.lvl * 100)) * 100 + '%'
  $('#kXp').textContent = `${sim.xp} / ${sim.lvl * 100} XP · racha ${sim.streak}`
  $('#clock').textContent = fmt(sim.T)
  const bay = $<HTMLButtonElement>('#bRay')
  bay.disabled = modo === 'hu' && rol !== 'supervisor'
  bay.title = bay.disabled ? 'La acción no está disponible: solo supervisor o líder (HU-ATC-045)' : 'Marcar con rayo el ticket seleccionado'

  const S = resumen(selArea)
  $('#panel').innerHTML = `<div class="ph"><div class="pic">${esc(S.pic)}</div><div style="min-width:0"><small>${selArea === 'hub' ? 'CENTRO DE ATENCIÓN · ATC' : 'ÁREA DE ATENCIÓN'}</small><h3>${esc(S.title)}</h3><small>${esc(S.sub)}</small></div></div>
   <div style="margin-top:10px">${S.chip}</div>
   <div class="areas" role="group" aria-label="Elegir área">${AREAS_BTN().map(([k, n]) => `<button class="btn" type="button" data-area="${k}" aria-pressed="${k === selArea}">${esc(n)}</button>`).join('')}</div>
   <div class="statgrid">${S.stats.map((s) => `<div><span>${s[0]}</span><b>${s[1]}</b>${s[2] != null ? `<div class="bar"><i class="${s[2] > 0.85 && s[0] === 'En cola' ? 'r' : s[0] === 'En SLA' ? (s[2] >= 0.9 ? 'g' : 'o') : ''}" style="width:${Math.round(s[2] * 100)}%"></i></div>` : ''}</div>`).join('')}</div>
   <div class="sub">Tickets <span>${S.list.length}</span></div>
   <div class="plist">${S.list.length ? S.list.map((t) => `<button type="button" class="pitem${t === sel ? ' sel' : ''}" data-id="${t.id}"><span class="dot" style="background:${TYPES[t.type]!.c}"></span><span style="min-width:0"><b>${t.rayo ? '⚡ ' : ''}${t.id}</b> · ${esc(TYPES[t.type]!.n)}</span>${chipFor(t)}</button>`).join('') : '<div class="empty">Sin tickets en este momento.</div>'}</div>
   ${S.gs ? `<div class="sub">Gestores de tickets <span>${modo === 'po' ? 'menos tickets' : 'carga ponderada'}</span></div><div class="plist">${S.gs.map((g) => `<div class="pitem" style="cursor:default"><span class="dot" style="background:${g.t ? COL.orange : COL.teal2};border-radius:50%"></span><span>${esc(g.n)} <small style="display:inline">${g.t ? '· ' + g.t.id : '· libre'}</small></span><span style="width:70px"><span class="bar" style="display:block"><i class="o" style="width:${Math.round((g.t ? g.p : 0) * 100)}%"></i></span></span></div>`).join('')}</div>` : ''}
   <div class="sub">Actividad <span>${hm(sim.T)}</span></div><div class="feed">${sim.feed.slice(0, 8).map((f) => `<div class="${f.cls}"><time>${hm(f.t)}</time><span>${esc(f.m)}</span></div>`).join('')}</div>`

  const t = sel
  if (!t) { $('#track').innerHTML = `<div><h4>Seguimiento del ticket</h4><div class="empty">Toca un ticket en movimiento o en la lista para seguir su recorrido y su SLA.</div></div><div class="tcard"><b>Cómo usarlo</b><br>Toca un canal para crear un ticket y márcalo con <b>Rayo</b> para adelantarlo.</div>`; return }
  const L = slaRestante(sim, t), pct = Math.max(0, Math.min(1, 1 - L / t.sla))
  $('#track').innerHTML = `<div><h4>Seguimiento del ticket <span class="chip t">${t.id}</span>${t.rayo ? `<span class="chip warn">⚡ Rayo${t.rayoMotivo ? ' · ' + esc(t.rayoMotivo) : ''}</span>` : ''}${chipFor(t)}</h4>
   <div class="steps">${PASOS.map((s, i) => { const done = i < t.step || t.st === 'cerrado', cur = i === t.step && t.st !== 'cerrado'; const tm = t.times[SK[i]!]
     return `<div class="step ${done ? 'done' : cur ? 'now' : ''}"><div class="b">${done ? '✓' : ''}</div>${s}<small>${tm != null ? hm(tm) : i === 5 ? 'ETA ' + hm(Math.max(sim.T, t.due)) : '—'}</small></div>` }).join('')}</div></div>
   <div class="tcard"><span style="font-size:11px;color:var(--muted)">${esc(TYPES[t.type]!.n)} · ${esc(GATES.find((x) => x.k === t.gate)!.n)}</span><br><b>${esc(sim.areas.find((a) => a.k === t.area)!.n)}</b>${t.g ? ` · ${esc(t.g)}` : ''}
   <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:11px"><span>SLA consumido</span><span class="num">${t.st === 'cerrado' ? 'cerrado' : Math.round(pct * 100) + ' %'}</span></div><div class="bar"><i class="${pct >= 1 ? 'r' : pct > 0.65 ? 'o' : 'g'}" style="width:${Math.round(pct * 100)}%"></i></div></div>`
}

$('#panel').addEventListener('click', (e) => {
  const el = e.target as HTMLElement
  const a = el.closest<HTMLElement>('[data-area]'); if (a) { selArea = a.dataset.area!; sincronizar(); renderHUD(true); return }
  const b = el.closest<HTMLElement>('[data-id]'); if (b) { sel = sim.tickets.find((t) => t.id === b.dataset.id) ?? sel; sincronizar(); renderHUD(true) }
})
$('#bPause').addEventListener('click', (e) => { paused = !paused; const b = e.currentTarget as HTMLElement; b.setAttribute('aria-pressed', String(paused)); b.textContent = paused ? 'Seguir' : 'Pausa' })
$('#bSpeed').addEventListener('click', (e) => { speed = speed === 1 ? 2 : speed === 2 ? 4 : 1; ;(e.currentTarget as HTMLElement).textContent = 'x' + speed })
$('#bNew').addEventListener('click', () => { const t = spawn(sim); sel = t; sincronizar(); toast(`Nuevo ticket ${t.id} · ${TYPES[t.type]!.n}`); renderHUD(true) })
$('#bReset').addEventListener('click', () => { iniciarCiudad(); toast('Escenario reiniciado con la misma semilla') })

// ---- rayo
const dlg = $<HTMLDialogElement>('#dlgRayo')
let forzar = false
function intentarRayo(motivo: string, confirmar: boolean) {
  const r = marcarRayo(sim, sel, rol, motivo, confirmar)
  if (r.ok) { dlg.close(); toast(`${sel!.id} sube al tope de la bandeja`); renderHUD(true); return }
  if (r.razon === 'limite') { forzar = true; $('#dlgAviso').hidden = false; $('#dlgAviso').textContent = r.mensaje; $('#dlgOk').textContent = 'Confirmar igualmente'; return }
  if (dlg.open) { $('#dlgAviso').hidden = false; $('#dlgAviso').textContent = r.mensaje; return }
  toast(r.mensaje)
}
$('#bRay').addEventListener('click', () => {
  if (modo === 'po') { intentarRayo('', true); return }
  if (!sel || sel.st === 'cerrado') { toast('Selecciona un ticket activo para marcarlo con rayo'); return }
  if (sel.rayo) { desmarcarRayo(sim, sel); toast(`Rayo retirado de ${sel.id}`); renderHUD(true); return }
  forzar = false; $('#dlgAviso').hidden = true; $('#dlgOk').textContent = 'Marcar'
  $('#dlgTicket').textContent = `${sel.id} · ${TYPES[sel.type]!.n}. Tope por área: ${LIMITE_RAYO * 100} % de la bandeja.`
  $<HTMLSelectElement>('#dlgMotivo').value = ''; dlg.showModal()
})
$('#frmRayo').addEventListener('submit', (e) => { e.preventDefault(); intentarRayo($<HTMLSelectElement>('#dlgMotivo').value, forzar) })
$('#dlgCancelar').addEventListener('click', () => dlg.close())

// ---- modo what-if y rol
function tablaConflictos() {
  $('#tablaConf').innerHTML = `<thead><tr><th>Tema</th><th>Como lo propone el PO</th><th>Con las reglas de las HU</th><th>Referencia</th></tr></thead><tbody>${CONFLICTOS.map((c) =>
    `<tr><td><b>${c.id}</b></td><td class="${modo === 'po' ? 'act' : ''}">${esc(c.po)}</td><td class="${modo === 'hu' ? 'act' : ''}">${esc(c.hu)}</td><td>${esc(c.ref)}</td></tr>`).join('')}</tbody>`
}
function pintarBarra() {
  document.querySelectorAll<HTMLElement>('[data-modo]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.modo === modo)))
  document.querySelectorAll<HTMLElement>('[data-rol]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.rol === rol)))
  tablaConflictos()
}
document.querySelector('.barra')!.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('button'); if (!b) return
  if (b.dataset.modo) { if (b.dataset.modo !== modo) { modo = b.dataset.modo as Modo; pintarBarra(); iniciarCiudad(); toast(modo === 'hu' ? 'Reglas de las HU activas · escenario reiniciado' : 'Propuesta del PO tal cual · escenario reiniciado') } }
  else if (b.dataset.rol) { rol = b.dataset.rol as Rol; pintarBarra(); renderHUD(true) }
})

$('#cityLegend').innerHTML = Object.values(TYPES).map((t) => `<span><i class="dot" style="background:${t.c}"></i>${t.n}</span>`).join('') +
  `<span><i class="dot" style="background:${COL.ok};border-radius:50%"></i>SLA holgado</span><span><i class="dot" style="background:${COL.warn};border-radius:50%"></i>SLA en riesgo</span><span><i class="dot" style="background:${COL.bad};border-radius:50%"></i>SLA vencido</span>`

// =========================================================================== arranque
ui360(); pintarBarra(); iniciarCiudad(); red.consultar(red.cliente.doc)
$('#bPause').setAttribute('aria-pressed', String(paused)); if (paused) $('#bPause').textContent = 'Seguir'

// solo se anima lo que está en pantalla
const visible = { red: true, ciudad: true }
const io = new IntersectionObserver((es) => es.forEach((x) => { if (x.target.id === 'nnStage') visible.red = x.isIntersecting; else visible.ciudad = x.isIntersecting }), { threshold: 0 })
io.observe($('#nnStage')); io.observe($('#city'))

let last = performance.now()
function loop(now: number) {
  const dt = Math.min(0.1, (now - last) / 1000); last = now
  if (visible.ciudad && ciudad) {
    if (!paused) tick(sim, dt * 6 * speed)
    for (const m of sim.eventos.splice(0)) toast(m)
    if (sel && sel.st === 'cerrado' && !sim.tickets.includes(sel)) { sel = null; sincronizar() }
    ciudad.actualizar(now); renderHUD()
  }
  if (visible.red) { red.actualizar(now); porFrame360() }
  requestAnimationFrame(loop)
}
requestAnimationFrame(loop)
