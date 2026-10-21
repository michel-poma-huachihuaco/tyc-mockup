import { inyectarEstilos } from './estilos.ts'

// Indicadores en vivo de «Vista en vivo»: tickets activos, resueltos en SLA, CSAT y nivel del equipo.
// Es DOM imperativo que el chunk del artifact llama en cada render con los valores nuevos; aquí se compara
// con lo anterior para animar el cambio (cuenta hacia el valor, destello, chip con la diferencia).

export interface HudProps {
  act: number; riesgo: number
  sla: number | null; enSla: number; res: number
  csat: number | null; nCsat: number
  nivel: number; xp: number; meta: number; racha: number
  /** Tickets por estado (RF-SVC-004). id es el código del estado y n su nombre. */
  estados: { id: string; n: string; v: number }[]
  /** NPS: real (pregunta 0–10, propuesta P2) o preliminar derivado del CSAT (supuesto). */
  nps: { valor: number | null; real: boolean; n: number; prom: number; pas: number; det: number }
}

const SVG = (d: string, v = '0 0 24 24') => `<svg viewBox="${v}" aria-hidden="true">${d}</svg>`
const ICONO = {
  ticket: SVG('<path d="M3 9a2 2 0 0 0 0 6v2a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-2a2 2 0 0 1 0-6V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1z"/><path d="M14 6v12" stroke-dasharray="2 2.6"/>'),
  reloj: SVG('<circle cx="12" cy="12.5" r="8.2"/><path d="m8.4 12.6 2.5 2.5 4.7-5"/><path d="M9.5 2.8h5"/>'),
  estrella: SVG('<path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6L12 16.7 6.6 19.6l1.1-6L3.2 9.4l6.1-.8z"/>'),
  cara: SVG('<circle cx="12" cy="12" r="9"/><path d="M8.4 14.3a4.2 4.2 0 0 0 7.2 0"/><path d="M9 9.6h.01M15 9.6h.01"/>'),
  llama: SVG('<path d="M12 2.8c1 3.6 5.2 5.1 5.2 10.2a5.2 5.2 0 0 1-10.4 0c0-2.3 1-3.7 2.1-4.8.3 1.5 1 2.1 1.9 2.3C10.5 8 10.8 5.6 12 2.8z"/>'),
}
const HEX = '<svg viewBox="0 0 46 46" aria-hidden="true"><path d="M23 3 40.3 13v20L23 43 5.7 33V13z"/></svg>'
const ESTRELLAS = (() => {
  const e = '<path d="m9 1.5 2.1 4.4 4.7.6-3.4 3.2.9 4.7L9 12.1 4.7 14.4l.9-4.7L2.2 6.5l4.7-.6z"/>'
  return `<svg viewBox="0 0 90 16" aria-hidden="true" fill="currentColor">${[0, 1, 2, 3, 4].map((i) => `<g transform="translate(${i * 18} -1)">${e}</g>`).join('')}</svg>`
})()

const reducido = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
const fmt = {
  int: (n: number) => String(Math.round(n)),
  signed: (n: number) => (n > 0 ? `+${Math.round(n)}` : String(Math.round(n))),
  pct: (n: number) => String(Math.round(n)),
  dec: (n: number) => n.toFixed(1).replace('.', ','),
}

interface Tarjeta { el: HTMLElement; val: HTMLElement; sub: HTMLElement; actual: number | null; raf: number }
interface Estado {
  t: Record<'act' | 'sla' | 'csat' | 'niv' | 'nps', Tarjeta>
  prev: HudProps | null
  hist: number[]; ultimaMuestra: number
  nodos: Record<string, HTMLElement>
  est: Map<string, { li: HTMLElement; v: HTMLElement; barra: HTMLElement; ultimo: number }>
}
const estados = new WeakMap<HTMLElement, Estado>()

const h = (tag: string, cls = '', html = '') => { const e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e }

function construir(root: HTMLElement): Estado {
  root.replaceChildren()
  root.classList.add('v3-hud')
  const grid = h('div', 'v3-hud-grid'); root.append(grid)
  const nodos: Record<string, HTMLElement> = {}
  const tarjeta = (k: string, etiqueta: string, ic: HTMLElement, titulo: string): Tarjeta => {
    const el = h('article', 'v3-k'); el.dataset.k = k; el.setAttribute('role', 'group'); el.title = titulo
    const cuerpo = h('div'); const lbl = h('span', 'v3-k-lbl'); lbl.textContent = etiqueta
    const val = h('b', 'v3-k-val'); cuerpo.append(lbl, val)
    const sub = h('div', 'v3-k-sub')
    el.append(ic, cuerpo, sub); grid.append(el)
    return { el, val, sub, actual: null, raf: 0 }
  }
  const icono = (svg: string) => h('div', 'v3-k-ic', svg)
  const act = tarjeta('act', 'Tickets activos', icono(ICONO.ticket), 'Tickets abiertos en este momento (incluye los que esperan al cliente o están escalados).')
  const spark = h('svg', 'v3-spark'); spark.setAttribute('viewBox', '0 0 96 28'); spark.setAttribute('aria-hidden', 'true')
  spark.innerHTML = '<path class="area"/><path class="linea"/>'; nodos.spark = spark
  nodos.chipAct = h('span', 'v3-k-chip'); nodos.tend = h('span', 'v3-tend')
  act.sub.append(nodos.chipAct, nodos.tend, spark)

  const anillo = h('div', 'v3-anillo', `<svg viewBox="0 0 56 56" aria-hidden="true"><circle class="base" cx="28" cy="28" r="23"/><circle class="meta" cx="28" cy="28" r="23" stroke-dashoffset="0"/><circle class="arco" cx="28" cy="28" r="23" stroke-dasharray="144.5" stroke-dashoffset="144.5"/></svg><span class="ic">${ICONO.reloj}</span>`)
  nodos.arco = anillo.querySelector('.arco') as unknown as HTMLElement
  const meta = anillo.querySelector('.meta') as unknown as HTMLElement
  // marca de la meta (90 %) sobre el anillo: un tramo muy corto del trazo, girado a la posición
  meta.setAttribute('stroke-dasharray', '1.8 142.7'); meta.setAttribute('stroke-dashoffset', String(-144.5 * 0.9))
  const sla = tarjeta('sla', 'Resueltos en SLA', anillo, 'Porcentaje de tickets resueltos dentro de su plazo. La marca blanca del anillo es la meta de 90 %.')
  nodos.subSla = h('span'); nodos.chipMeta = h('span', 'v3-k-chip'); sla.sub.append(nodos.chipMeta, nodos.subSla)

  const csat = tarjeta('csat', 'CSAT del día', icono(ICONO.estrella), 'Satisfacción promedio de las encuestas respondidas hoy (1 a 5).')
  nodos.estrellas = h('span', 'v3-estrellas', `<span class="fondo">${ESTRELLAS}</span><span class="lleno">${ESTRELLAS}</span>`)
  nodos.subCsat = h('span'); csat.sub.append(nodos.estrellas, nodos.subCsat)

  const hex = h('div', 'v3-hex', HEX); nodos.hexN = h('b'); hex.append(nodos.hexN)
  const niv = tarjeta('niv', 'Nivel del equipo', hex, 'Nivel, XP y racha del equipo: +10 XP por ticket dentro del SLA, +5 con rayo, +3 fuera del SLA.')
  nodos.racha = h('span', 'v3-racha', `${ICONO.llama}<span></span>`); nodos.faltan = h('span')
  niv.sub.append(nodos.racha, nodos.faltan)
  const barra = h('div', 'v3-xp'); const bi = h('i'); barra.append(bi); nodos.xp = bi
  niv.el.append(barra)
  // NPS (P2 real / P1 preliminar)
  const nps = tarjeta('nps', 'NPS', icono(ICONO.cara), 'Net Promoter Score: % de promotores (9–10) menos % de detractores (0–6).')
  nodos.chipNps = h('span', 'v3-k-chip'); nodos.cuentaNps = h('span', 'v3-nps-cuenta')
  nps.sub.append(nodos.chipNps, nodos.cuentaNps)

  // tickets por estado (P1)
  const panel = h('article', 'v3-estados'); panel.setAttribute('role', 'group'); panel.setAttribute('aria-label', 'Tickets por estado')
  const cab = h('header', 'v3-est-cab'); const tit = h('span', 'v3-k-lbl'); tit.textContent = 'Tickets por estado'; nodos.totalEst = h('span', 'v3-est-total'); cab.append(tit, nodos.totalEst)
  const lista = h('ul', 'v3-est-lista'); nodos.listaEst = lista
  panel.append(cab, lista); grid.append(panel)
  return { t: { act, sla, csat, niv, nps }, prev: null, hist: [], ultimaMuestra: 0, nodos, est: new Map() }
}

function numero(tj: Tarjeta, destino: number | null, f: (n: number) => string, unidad = '') {
  const pon = (n: number | null) => { tj.val.innerHTML = n == null ? '—' : f(n) + (unidad ? `<small>${unidad}</small>` : '') }
  if (destino == null || tj.actual == null || reducido() || destino === tj.actual) { cancelAnimationFrame(tj.raf); tj.actual = destino; pon(destino); return }
  const desde = tj.actual, t0 = performance.now(), dur = 650
  cancelAnimationFrame(tj.raf)
  const paso = (t: number) => {
    const u = Math.max(0, Math.min(1, ((t - t0) / dur) || 0)), e = 1 - Math.pow(1 - u, 3)
    tj.actual = desde + (destino - desde) * e; pon(tj.actual)
    if (u < 1) tj.raf = requestAnimationFrame(paso); else { tj.actual = destino; pon(destino) }
  }
  tj.raf = requestAnimationFrame(paso)
  tj.val.classList.remove('pop'); void tj.val.offsetWidth; tj.val.classList.add('pop')
}
const destello = (el: HTMLElement, cls: string) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); setTimeout(() => el.classList.remove(cls), 1000) }
const delta = (el: HTMLElement, texto: string) => {
  if (reducido()) return
  const d = h('span', 'v3-delta'); d.textContent = texto; el.append(d); setTimeout(() => d.remove(), 1500)
}
const chispas = (el: HTMLElement) => {
  if (reducido()) return
  for (let i = 0; i < 10; i++) {
    const c = h('i', 'v3-chispa'), a = (i / 10) * Math.PI * 2, r = 30 + Math.random() * 26
    c.style.setProperty('--dx', `${Math.cos(a) * r}px`); c.style.setProperty('--dy', `${Math.sin(a) * r}px`); c.style.animationDelay = `${i * 15}ms`
    el.append(c); setTimeout(() => c.remove(), 1300)
  }
}
const chip = (el: HTMLElement, texto: string, estado: string, pulsa = false) => {
  el.textContent = ''
  el.className = 'v3-k-chip' + (pulsa ? ' pulsa' : '')
  el.dataset.e = estado
  el.style.setProperty('--v3-tono', `var(--v3-${estado})`)
  el.append(h('i', 'v3-dot'), document.createTextNode(texto))
}

function sparkline(svg: HTMLElement, datos: number[]) {
  if (datos.length < 2) return
  const mn = Math.min(...datos), mx = Math.max(...datos), rango = Math.max(1, mx - mn)
  const pts = datos.map((v, i) => [(i / (datos.length - 1)) * 96, 24 - ((v - mn) / rango) * 20] as const)
  const linea = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('')
  svg.querySelector('.linea')!.setAttribute('d', linea)
  svg.querySelector('.area')!.setAttribute('d', `${linea}L96 28L0 28Z`)
}

export function actualizarHud(root: HTMLElement, p: HudProps) {
  inyectarEstilos()
  let s = estados.get(root)
  if (!s) { s = construir(root); estados.set(root, s) }
  const { t, nodos } = s, prev = s.prev, ahora = performance.now()

  // --- tickets activos
  const estadoAct = p.riesgo > 0 ? 'warn' : 'pri'
  t.act.el.dataset.estado = estadoAct
  numero(t.act, p.act, fmt.int)
  chip(nodos.chipAct!, p.riesgo > 0 ? `${p.riesgo} en riesgo` : 'Sin riesgos', p.riesgo > 0 ? 'warn' : 'ok', p.riesgo > 0)
  if (ahora - s.ultimaMuestra > 1800) { s.hist.push(p.act); if (s.hist.length > 28) s.hist.shift(); s.ultimaMuestra = ahora }
  sparkline(nodos.spark!, s.hist)
  const ref = s.hist.length > 6 ? s.hist[s.hist.length - 7]! : s.hist[0] ?? p.act, d = p.act - ref
  nodos.tend!.textContent = d === 0 ? '→' : d > 0 ? `▲ ${d}` : `▼ ${-d}`
  nodos.tend!.className = 'v3-tend ' + (d > 0 ? 'sube' : d < 0 ? 'baja' : '')
  nodos.tend!.title = 'Diferencia frente a hace unos segundos'

  // --- resueltos en SLA
  const sl = p.sla
  const estadoSla = sl == null ? 'pri' : sl >= 90 ? 'ok' : sl >= 70 ? 'warn' : 'bad'
  t.sla.el.dataset.estado = estadoSla
  numero(t.sla, sl, fmt.pct, '%')
  nodos.arco!.setAttribute('stroke-dashoffset', String(144.5 * (1 - (sl ?? 0) / 100)))
  chip(nodos.chipMeta!, 'Meta 90 %', estadoSla === 'ok' ? 'ok' : 'warn')
  nodos.subSla!.textContent = p.res ? `${p.enSla} de ${p.res} en plazo` : 'Aún sin resueltos'

  // --- CSAT
  t.csat.el.dataset.estado = p.csat == null ? 'pri' : p.csat >= 4 ? 'acc' : p.csat >= 3 ? 'warn' : 'bad'
  numero(t.csat, p.csat, fmt.dec, '/5')
  ;(nodos.estrellas!.querySelector('.lleno') as HTMLElement).style.setProperty('--r', `${100 - ((p.csat ?? 0) / 5) * 100}%`)
  nodos.subCsat!.textContent = p.nCsat ? `${p.nCsat} respuesta${p.nCsat === 1 ? '' : 's'}` : 'Sin respuestas'

  // --- nivel del equipo
  t.niv.el.dataset.estado = 'acc'
  nodos.hexN!.textContent = String(p.nivel)
  if (t.niv.actual == null || prev == null) { t.niv.actual = p.xp; t.niv.val.innerHTML = `${p.xp}<small>/ ${p.meta} XP</small>` }
  else if (p.xp !== prev.xp || p.nivel !== prev.nivel) { cancelAnimationFrame(t.niv.raf); t.niv.actual = p.xp; t.niv.val.innerHTML = `${p.xp}<small>/ ${p.meta} XP</small>`; t.niv.val.classList.remove('pop'); void t.niv.val.offsetWidth; t.niv.val.classList.add('pop') }
  nodos.xp!.style.setProperty('--p', String(Math.min(1, p.xp / p.meta)))
  nodos.racha!.className = 'v3-racha' + (p.racha > 0 ? ' viva' : '')
  nodos.racha!.lastElementChild!.textContent = `racha ${p.racha}`
  nodos.racha!.title = 'Tickets seguidos dentro del SLA'
  nodos.faltan!.textContent = `faltan ${Math.max(0, p.meta - p.xp)} XP`

  // --- notas de revisión (van al panel «Notas», no a la pantalla)
  ;(globalThis as { __ptNota?: (t: string) => void }).__ptNota?.('Tickets por estado: no incluye «cancelados». Ese estado no existe en el flujo (RF-SVC-004) y está pendiente de decisión del PO.')
  ;(globalThis as { __ptNota?: (t: string) => void }).__ptNota?.(p.nps.real ? 'NPS real: pregunta «¿Recomendarías…?» de 0 a 10 agregada a la encuesta de cierre (propuesta del PO, sin HU aprobada). Su relación con el NPS-C (DEP-10) está por definir.' : 'NPS preliminar derivado del CSAT hasta contar con el KPI Engine (DEP-10).')

  // --- NPS
  const npsV = p.nps.valor
  t.nps.el.dataset.estado = npsV == null ? 'pri' : npsV >= 30 ? 'ok' : npsV >= 0 ? 'warn' : 'bad'
  t.nps.el.querySelector('.v3-k-lbl')!.textContent = p.nps.real ? 'NPS' : 'NPS preliminar'
  numero(t.nps, npsV, fmt.signed)
  chip(nodos.chipNps!, p.nps.real ? `Encuesta · n=${p.nps.n}` : 'Estimado desde CSAT', p.nps.real ? 'ok' : 'warn')
  nodos.cuentaNps!.textContent = p.nps.n ? `▲${p.nps.prom} ●${p.nps.pas} ▼${p.nps.det}` : 'Sin respuestas'
  nodos.cuentaNps!.title = 'Promotores · pasivos · detractores'
  t.nps.el.title = p.nps.real ? 'NPS = % que responde 9–10 menos % que responde 0–6 a «¿Recomendarías…?».' : 'NPS preliminar derivado del CSAT (5 promotor, 4 pasivo, 1 a 3 detractor).'

  // --- tickets por estado
  const maxE = Math.max(1, ...p.estados.map((e) => e.v)), totalE = p.estados.reduce((a, e) => a + e.v, 0)
  nodos.totalEst!.textContent = `${totalE} en total`
  p.estados.forEach((e, i) => {
    let f = s.est.get(e.id)
    if (!f) {
      const li = h('li', 'v3-est'); li.dataset.e = e.id; if (i === 5) li.classList.add('sep')
      const v = h('b'); const nombre = h('span'); nombre.textContent = e.n; const barra = h('i'); const pista = h('span', 'v3-est-pista'); pista.append(barra)
      li.append(h('span', 'v3-dot'), v, nombre, pista); nodos.listaEst!.append(li); f = { li, v, barra, ultimo: e.v }; s.est.set(e.id, f)
    }
    if (f.ultimo !== e.v) { destello(f.li, e.v > f.ultimo ? 'sube' : 'baja'); f.ultimo = e.v }
    f.v.textContent = String(e.v); f.barra.style.setProperty('--p', String(e.v / maxE))
  })

  // --- retroalimentación de los cambios
  if (prev) {
    if (p.act !== prev.act) { destello(t.act.el, p.act > prev.act ? 'sube' : 'baja'); delta(t.act.el, `${p.act > prev.act ? '+' : ''}${p.act - prev.act}`) }
    if (sl != null && prev.sla != null && sl !== prev.sla) { destello(t.sla.el, sl > prev.sla ? 'sube-bien' : 'baja-mal'); delta(t.sla.el, `${sl > prev.sla ? '+' : ''}${sl - prev.sla} pp`) }
    if (p.csat != null && prev.csat != null && Math.abs(p.csat - prev.csat) >= 0.05) { destello(t.csat.el, p.csat > prev.csat ? 'sube-bien' : 'baja-mal'); delta(t.csat.el, `${p.csat > prev.csat ? '+' : ''}${(p.csat - prev.csat).toFixed(1).replace('.', ',')}`) }
    if (p.nivel > prev.nivel) { destello(t.niv.el, 'nivel-up'); chispas(t.niv.el); delta(t.niv.el, `¡Nivel ${p.nivel}!`) }
    else if (p.xp > prev.xp) delta(t.niv.el, `+${p.xp - prev.xp} XP`)
    if (p.racha > 0 && p.racha % 10 === 0 && p.racha !== prev.racha) chispas(t.niv.el)
  }
  s.prev = { ...p }
}
