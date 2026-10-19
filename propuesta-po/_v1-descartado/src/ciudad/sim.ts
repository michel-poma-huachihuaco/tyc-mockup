// Simulación de la «ciudad de tickets» del PO. Sin DOM ni three.js: se prueba sola.
// Dos modos (what-if): 'po' replica la propuesta tal cual; 'hu' aplica las reglas del
// paquete SCRUM donde la propuesta choca con ellas (ver CONFLICTOS).

export type Modo = 'po' | 'hu'
export type Rol = 'gestor' | 'supervisor'
export type Punto = readonly [number, number]
export type Estado = 'viaje' | 'bandeja' | 'ruta' | 'cola' | 'atencion' | 'resuelto' | 'cerrado'

export interface Compuerta { k: string; n: string; y: number; c: string }
export interface Gestor { n: string; t: Ticket | null; p: number; done: number }
export interface Area { k: string; n: string; x: number; y: number; w: number; d: number; g: string[]; q: Ticket[]; res: number; inSla: number; gs: Gestor[] }
export interface Tipo { n: string; c: string; a: string; pt: readonly [number, number]; sla: number; sensible?: boolean }
export interface Ticket {
  id: string; gate: string; type: string; st: Estado; step: number
  t0: number; times: Partial<Record<'reg' | 'band' | 'asig' | 'aten' | 'res' | 'cer', number>>
  sla: number; due: number; rayo: boolean; rayoPor?: string; rayoMotivo?: string
  esc: boolean; nivelEsc: number; alertado: boolean
  area: string; path: { pts: Punto[]; i: number; f: number }
  x: number; y: number; vis: boolean; prio: number; g?: string; work?: number; csat?: number
  prev?: Estado; drone?: boolean; dead?: boolean
}

export const GATES: Compuerta[] = [
  { k: 'tel', n: 'Call center', y: 1.0, c: '#2B616C' },
  { k: 'wa', n: 'WhatsApp', y: 2.9, c: '#2E8B57' },
  { k: 'mail', n: 'Correo', y: 4.8, c: '#5E8C95' },
  { k: 'portal', n: 'Mi Portal', y: 6.7, c: '#02424E' },
  { k: 'form', n: 'Formulario simple', y: 8.6, c: '#B4700F' },
]
const AREAS_DEF = [
  { k: 'eje1', n: 'Atención Eje 1', x: 12.6, y: 0.6, g: ['Ana P.', 'Luis M.', 'Rosa T.'] },
  { k: 'cob', n: 'Cobranza', x: 12.6, y: 3.8, g: ['Carla V.', 'Iván Q.'] },
  { k: 'libro', n: 'Libro de Reclamaciones', x: 12.6, y: 7.0, g: ['Sofía R.', 'Diego A.'] },
  { k: 'legal', n: 'Legal · Eje 3', x: 12.6, y: 13.0, g: ['Rosario'] },
  { k: 'post', n: 'Postventa', x: 8.4, y: 12.8, g: ['Pedro L.', 'Mónica S.'] },
  { k: 'proy', n: 'Proyecto · Entrega Fest', x: 4.0, y: 12.8, g: ['Elena C.'] },
]
export const HUB = { x: 5.6, y: 5.6, w: 4.0, d: 4.0, n: 'Bandeja orquestadora' }
export const COM = { x: 6.4, y: 0.3, w: 2.2, d: 1.6, n: 'Comité' }
export const EXIT = { x: 0.3, y: 12.6, w: 1.3, d: 1.3, n: 'Cierre en Mi Portal' }
// SLA en minutos simulados: son de ejemplo del PO; en el paquete salen de la política (RN-SVC-001).
export const TYPES: Record<string, Tipo> = {
  cons: { n: 'Consulta', c: '#5E8C95', a: 'eje1', pt: [20, 40], sla: 150 },
  cuota: { n: 'Cuotas y pagos', c: '#02424E', a: 'cob', pt: [25, 50], sla: 200 },
  moro: { n: 'Resolución por morosidad', c: '#7A3E8E', a: 'cob', pt: [40, 70], sla: 240 },
  recl: { n: 'Reclamo (Libro)', c: '#F6A42C', a: 'libro', pt: [60, 110], sla: 260 },
  legal: { n: 'Conflicto legal', c: '#C0453A', a: 'legal', pt: [90, 150], sla: 300, sensible: true },
  gar: { n: 'Garantía postventa', c: '#2E8B57', a: 'post', pt: [60, 100], sla: 280 },
  ingr: { n: 'Ingreso al proyecto', c: '#9BB7BD', a: 'proy', pt: [5, 12], sla: 40 },
  bus: { n: 'Cupo bus Entrega Fest', c: '#E39B1C', a: 'proy', pt: [5, 10], sla: 60 },
}
const CH_TYPES: Record<string, string[]> = {
  tel: ['cons', 'cuota', 'recl', 'legal', 'cons'], wa: ['cons', 'cuota', 'gar', 'bus', 'cons'],
  mail: ['recl', 'legal', 'gar', 'cons'], portal: ['gar', 'recl', 'cuota', 'bus'], form: ['ingr', 'ingr', 'bus'],
}
const PFX = ['VS', 'LA', 'MS', 'RP', 'CV']

/** Reglas del paquete que la propuesta contradice o no cubre. Alimenta el panel «what-if». */
export const CONFLICTOS = [
  { id: 'escala', po: 'Todo ticket vencido salta directo al Comité (dron).', hu: 'Solo casos sensibles escalan, en cadena sin saltar niveles: alerta → memorándum a jefatura → Comité → Directorio. El resto: alerta única.', ref: 'HU-ATC-023 · RN-SVC-017 · HU-ATC-010' },
  { id: 'rayoAuto', po: 'Al vencer el SLA el ticket recibe rayo automático.', hu: 'El rayo no es automático: lo marca un supervisor o líder, con motivo, y queda en bitácora.', ref: 'HU-ATC-045 · RN-SVC-031' },
  { id: 'rayoRol', po: 'Cualquier usuario marca el rayo, sin motivo ni tope.', hu: 'Solo supervisor o líder; con motivo; tope del 10 % de la bandeja del área (avisa y pide confirmar).', ref: 'HU-ATC-045 CA-02/CA-03 · RN-SVC-031' },
  { id: 'carga', po: 'Asigna al gestor con menos tickets, sin ponderar.', hu: 'Menor carga ponderada por prioridad, con límite por gestor y motivo REASSIGNMENT_CARGA.', ref: 'HU-ATC-046 · RN-SVC-033' },
  { id: 'xp', po: 'Gamificación: XP, racha y nivel del equipo.', hu: 'No existe en el paquete (propuesta sin HU aprobada): se oculta.', ref: 'Sin HU — ver reporte' },
] as const

export const LIMITE_RAYO = 0.1
export const LIMITE_CARGA = 12
export const PASO_ESCALA = 30 // minutos simulados entre niveles de la cadena (HU)
export const NIVELES = ['Alerta de vencimiento', 'Memorándum a la jefatura', 'Comité', 'Directorio'] as const

export interface Sim {
  modo: Modo
  tickets: Ticket[]; areas: Area[]
  T: number; seq: number; nextArr: number
  feed: { t: number; m: string; cls: string }[]
  xp: number; lvl: number; streak: number
  resolved: number; inSla: number; csat: number[]; escal: number
  eventos: string[] // avisos efímeros para el toast
  rnd: () => number
}

function mulberry32(a: number) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function crearSim(modo: Modo = 'po', semilla = 7): Sim {
  const areas: Area[] = AREAS_DEF.map((a) => ({ ...a, w: 2.4, d: 2.0, q: [], res: 0, inSla: 0, gs: a.g.map((n) => ({ n, t: null, p: 0, done: 0 })) }))
  const s: Sim = { modo, tickets: [], areas, T: 0, seq: 230, nextArr: 2, feed: [], xp: 0, lvl: 1, streak: 0, resolved: 0, inSla: 0, csat: [], escal: 0, eventos: [], rnd: mulberry32(semilla) }
  return s
}

const rango = (s: Sim, a: number, b: number) => a + s.rnd() * (b - a)
const pick = <T,>(s: Sim, a: readonly T[]) => a[Math.floor(s.rnd() * a.length)]!
export const hm = (m: number) => {
  const mm = (m % 600) + 9 * 60
  return `${String(Math.floor(mm / 60)).padStart(2, '0')}:${String(Math.floor(mm % 60)).padStart(2, '0')}`
}
export const fmt = (m: number) => {
  const dias = ['lun 19-oct', 'mar 20-oct', 'mié 21-oct', 'jue 22-oct', 'vie 23-oct']
  return `${dias[Math.min(Math.floor(m / 600), 4)]} · ${hm(m)}`
}
export const slaRestante = (s: Sim, t: Ticket) => t.due - s.T
const area = (s: Sim, k: string) => s.areas.find((a) => a.k === k)!

function log(s: Sim, m: string, cls = '') { s.feed.unshift({ t: s.T, m, cls }); s.feed = s.feed.slice(0, 30) }
const ruta = (pts: Punto[]) => ({ pts, i: 0, f: 0 })
const gatePath = (gk: string): Punto[] => { const G = GATES.find((x) => x.k === gk)!; return [[0.9, G.y + 0.5], [2.3, G.y + 0.5], [2.3, 7.6], [HUB.x, 7.6]] }
const toArea = (a: Area): Punto[] => a.x > 11
  ? [[HUB.x + HUB.w, 7.6], [11.2, 7.6], [11.2, a.y + 1], [a.x, a.y + 1]]
  : [[7.6, HUB.y + HUB.d], [7.6, 11.1], [a.x + 1.2, 11.1], [a.x + 1.2, a.y]]
const toExit = (a: Area): Punto[] => (a.x > 11 ? [[a.x, a.y + 1], [11.2, a.y + 1], [11.2, 11.1]] as Punto[] : [[a.x + 1.2, a.y], [a.x + 1.2, 11.1]] as Punto[]).concat([[2.3, 11.1], [2.3, 13.2], [EXIT.x + EXIT.w, 13.2]])
const toCom = (a: Area): Punto[] => (a.x > 11 ? [[a.x, a.y + 1], [11.2, a.y + 1]] as Punto[] : [[a.x + 1.2, a.y], [a.x + 1.2, 11.1], [11.2, 11.1]] as Punto[]).concat([[11.2, 2.2], [COM.x + COM.w, 2.2]])

export function spawn(s: Sim, gk?: string, tk?: string): Ticket {
  gk = gk ?? pick(s, GATES).k
  tk = tk ?? pick(s, CH_TYPES[gk]!)
  const ty = TYPES[tk]!, G = GATES.find((x) => x.k === gk)!
  const pfx = pick(s, PFX)
  const t: Ticket = {
    id: `${pfx}-000${++s.seq}`, gate: gk, type: tk, st: 'viaje', step: 0, t0: s.T, times: { reg: s.T },
    sla: ty.sla, due: s.T + ty.sla, // SLA congelado al abrir (HU-ATC-003)
    rayo: false, esc: false, nivelEsc: 0, alertado: false, area: ty.a, path: ruta(gatePath(gk)),
    x: 0.9, y: G.y + 0.5, vis: true, prio: tk === 'legal' ? 3 : tk === 'recl' ? 2 : 1,
  }
  s.tickets.push(t)
  log(s, `${t.id} registrado por ${G.n} · ${ty.n}`)
  return t
}

// ---- carga ponderada (HU-ATC-046)
export const cargaGestor = (s: Sim, a: Area, g: Gestor) =>
  s.tickets.filter((t) => !t.drone && t.g === g.n && t.area === a.k && ['ruta', 'cola', 'atencion'].includes(t.st)).reduce((n, t) => n + t.prio, 0)

function elegirGestor(s: Sim, a: Area, t: Ticket): Gestor {
  if (s.modo === 'po') return a.gs.slice().sort((x, y) => (x.t ? 1 : 0) - (y.t ? 1 : 0) || x.done - y.done)[0]!
  const libres = a.gs.filter((g) => cargaGestor(s, a, g) < LIMITE_CARGA)
  const base = libres.length ? libres : a.gs
  const g = base.slice().sort((x, y) => cargaGestor(s, a, x) - cargaGestor(s, a, y) || x.done - y.done)[0]!
  if (libres.length !== a.gs.length) log(s, `${t.id} → ${g.n} · REASSIGNMENT_CARGA (hay gestores sobre el límite de ${LIMITE_CARGA})`, 'o')
  return g
}

function asignar(s: Sim) {
  const inbox = s.tickets.filter((t) => t.st === 'bandeja').sort((a, b) => +b.rayo - +a.rayo || slaRestante(s, a) - slaRestante(s, b) || b.prio - a.prio)
  for (const t of inbox) {
    if (s.T - (t.times.band ?? 0) < 4) continue
    t.st = 'ruta'; t.step = 2; t.times.asig = s.T
    const A = area(s, t.area)
    t.path = ruta(toArea(A)); t.vis = true; t.x = t.path.pts[0]![0]; t.y = t.path.pts[0]![1]
    const G = elegirGestor(s, A, t); t.g = G.n
    log(s, `${t.id} → ${A.n} · ${G.n} (${s.modo === 'po' ? 'menor carga' : 'carga ponderada'}) · correo con copia al líder`)
  }
}

function gain(s: Sim, n: number) {
  s.xp += n
  while (s.xp >= s.lvl * 100) { s.xp -= s.lvl * 100; s.lvl++; s.eventos.push(`Nivel ${s.lvl} · el equipo sube de nivel`) }
  if (s.streak && s.streak % 10 === 0) s.eventos.push(`Racha de ${s.streak} tickets dentro del SLA`)
}

function trabajar(s: Sim, dt: number) {
  for (const A of s.areas) for (const G of A.gs) {
    if (!G.t) {
      const cola = A.q.filter((t) => s.modo === 'po' || t.g === G.n)
      const q = cola.sort((a, b) => +b.rayo - +a.rayo || slaRestante(s, a) - slaRestante(s, b))[0]
      if (q) {
        A.q = A.q.filter((x) => x !== q); G.t = q; q.st = 'atencion'; q.step = 3; q.times.aten = s.T; q.g = G.n
        q.work = rango(s, ...TYPES[q.type]!.pt) * (q.rayo ? 0.7 : 1); G.p = 0
      }
    } else {
      const t = G.t
      G.p += dt / (t.work ?? 1)
      if (G.p >= 1) {
        G.t = null; G.done++; t.st = 'resuelto'; t.step = 4; t.times.res = s.T; t.vis = true
        t.path = ruta(toExit(A)); t.x = t.path.pts[0]![0]; t.y = t.path.pts[0]![1]
        const ok = s.T <= t.due && !t.esc
        A.res++; s.resolved++
        if (ok) { A.inSla++; s.inSla++; s.streak++; gain(s, 10 + (t.rayo ? 5 : 0)) } else { s.streak = 0; gain(s, 3) }
        log(s, `${t.id} resuelto por ${G.n}${ok ? ' dentro del SLA' : ' fuera del SLA'}`, ok ? '' : 'o')
      }
    }
  }
}

function mover(t: Ticket, dt: number): boolean {
  const P = t.path
  if (P.i >= P.pts.length - 1) return true
  const a = P.pts[P.i]!, b = P.pts[P.i + 1]!, L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 0.01
  P.f += (dt * (t.esc ? 0.9 : 0.55)) / L
  if (P.f >= 1) { P.i++; P.f = 0; if (P.i >= P.pts.length - 1) { t.x = b[0]; t.y = b[1]; return true } }
  const a2 = P.pts[P.i]!, b2 = P.pts[P.i + 1]!
  t.x = a2[0] + (b2[0] - a2[0]) * P.f; t.y = a2[1] + (b2[1] - a2[1]) * P.f
  return false
}

function dron(s: Sim, A: Area) {
  s.tickets.push({ id: 'esc', drone: true, gate: '', type: 'legal', st: 'viaje', step: 0, t0: s.T, times: {}, sla: 1, due: 0, rayo: false, esc: true, nivelEsc: 0, alertado: true, area: A.k, path: ruta(toCom(A)), x: A.x, y: A.y, vis: true, prio: 0 })
}

const activo = (t: Ticket) => ['bandeja', 'ruta', 'cola', 'atencion'].includes(t.st)

/** Qué pasa cuando un ticket activo ya venció. Aquí vive el choque principal con las HU. */
function vencimiento(s: Sim, t: Ticket) {
  if (!t.esc) {
    t.esc = true
    if (s.modo === 'po') {
      s.escal++
      log(s, `SLA vencido ${t.id}: correo al líder y caso al Comité`, 'r')
      s.eventos.push(`SLA vencido · ${t.id} escala al Comité`)
      dron(s, area(s, t.area))
      t.rayo = true // la propuesta lo marca sin supervisor ni motivo
      return
    }
    t.nivelEsc = 1; t.alertado = true // alerta única por ciclo (HU-ATC-010)
    log(s, `SLA vencido ${t.id}: alerta única y correo al líder`, 'r')
    if (!TYPES[t.type]!.sensible) return
  }
  if (s.modo !== 'hu' || !TYPES[t.type]!.sensible || t.nivelEsc >= 4) return
  // cadena sin saltar niveles: un nivel cada PASO_ESCALA minutos tras vencer
  const objetivo = Math.min(4, 1 + Math.floor((s.T - t.due) / PASO_ESCALA))
  if (objetivo > t.nivelEsc) {
    t.nivelEsc++
    log(s, `${t.id}: ${NIVELES[t.nivelEsc - 1]} (HU-ATC-023, sin saltar niveles)`, 'r')
    if (t.nivelEsc === 3) { s.escal++; dron(s, area(s, t.area)); s.eventos.push(`${t.id} escala al Comité`) }
  }
}

export function tick(s: Sim, dt: number) {
  s.T += dt; s.nextArr -= dt
  if (s.nextArr <= 0) { spawn(s); s.nextArr = rango(s, 3, 8) }
  for (const t of s.tickets) {
    if (t.drone) continue
    if (t.st === 'viaje' && mover(t, dt)) { t.st = 'bandeja'; t.step = 1; t.times.band = s.T; t.vis = false }
    else if (t.st === 'ruta' && mover(t, dt)) { t.st = 'cola'; t.vis = false; area(s, t.area).q.push(t) }
    else if (t.st === 'resuelto' && mover(t, dt)) {
      t.st = 'cerrado'; t.step = 5; t.times.cer = s.T; t.vis = false
      const sc = Math.max(1, Math.min(5, Math.round(rango(s, 3.6, 5.2) - (t.esc ? 1.4 : 0))))
      t.csat = sc; s.csat.push(sc)
    }
    if (activo(t) && s.T > t.due) vencimiento(s, t)
  }
  for (const t of s.tickets) if (t.drone && mover(t, dt * 1.6)) t.dead = true
  s.tickets = s.tickets.filter((t) => !t.dead && !(t.st === 'cerrado' && s.T - (t.times.cer ?? 0) > 240))
  asignar(s); trabajar(s, dt)
}

// ---- rayo
export type ResultadoRayo = { ok: true } | { ok: false; razon: 'rol' | 'cerrado' | 'ya' | 'motivo' | 'limite'; mensaje: string }
export const bandejaDeArea = (s: Sim, k: string) => s.tickets.filter((t) => !t.drone && t.area === k && activo(t))

export function marcarRayo(s: Sim, t: Ticket | null, rol: Rol, motivo: string, confirmar = false): ResultadoRayo {
  if (!t || t.st === 'cerrado') return { ok: false, razon: 'cerrado', mensaje: 'Selecciona un ticket activo para marcarlo con rayo' }
  if (t.rayo) return { ok: false, razon: 'ya', mensaje: `${t.id} ya tiene rayo` }
  if (s.modo === 'hu') {
    if (rol !== 'supervisor') return { ok: false, razon: 'rol', mensaje: 'La acción no está disponible: solo supervisor o líder (HU-ATC-045)' }
    if (!motivo.trim()) return { ok: false, razon: 'motivo', mensaje: 'Indica el motivo del rayo (queda en la bitácora)' }
    const b = bandejaDeArea(s, t.area)
    const con = b.filter((x) => x.rayo).length
    if (!confirmar && con > 0 && con / b.length >= LIMITE_RAYO)
      return { ok: false, razon: 'limite', mensaje: `El área ya tiene ${con} de ${b.length} tickets con rayo (límite ${LIMITE_RAYO * 100} %). Confirma o desmarca otro.` }
  }
  t.rayo = true; t.rayoPor = s.modo === 'hu' ? 'supervisor' : 'usuario'; t.rayoMotivo = motivo || undefined
  log(s, `Rayo marcado en ${t.id}${motivo ? ` · motivo: ${motivo}` : ''}`, 'o')
  return { ok: true }
}

export const desmarcarRayo = (s: Sim, t: Ticket) => { t.rayo = false; log(s, `Rayo retirado de ${t.id}`, 'o') }

/** Arranque «realista» del PO: 9 tickets y 900 ticks de 0.2 min. */
export function sembrar(s: Sim) {
  for (let i = 0; i < 9; i++) spawn(s)
  s.T = 0
  for (let k = 0; k < 900; k++) tick(s, 0.2)
  s.eventos = []
}
