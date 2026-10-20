import * as THREE from 'three'
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import { bucle, capaEtiquetas, color, css, type RGB } from './comun.ts'
import { Kit, mezcla, PIELES, PELOS, hash } from './modelos.ts'
import { crearOrquestador } from './robots.ts'
import { ESTILOS, crearEntrada, glifo, type Entrada, type EstiloEntrada } from './entradas.ts'
import { inyectarEstilos } from './estilos.ts'
import { CANALES, CENTRO, COMITE, ESTACION, H, HUB, PASEO, PISO, SALAS, SALIDA, V, puestoTicket, rutaAtencion, rutaBandeja, rutaCola, rutaSalida, slotBandeja, slotCola, slotSalida, type Sala } from './oficina.ts'

// «Vista en vivo» como una oficina de atención en 3D (cámara isométrica, vista cenital cortada): canales
// de entrada, mesa de orquestación, salas de vidrio con puestos y personas, sala de comité y cierre.
// El estado (qué ticket está dónde, SLA, rayo) lo calcula el chunk del artifact y llega por `obtener()`;
// aquí solo se dibuja y se anima.

export interface Estatico {
  zonas: { k: string; n: string; color: RGB }[]
  compuertas: { k: string; n: string; sigla: string; color: RGB }[]
  tipos?: { k: string; color: RGB }[]            // HU-067 CA-02: color de la caja según el tipo de ticket
}
export interface Snap {
  zonas: { k: string; cola: number; atencion: number; riesgo: boolean; gente: { id: string; nombre: string; ocupado: boolean }[]; ocupados?: number; total?: number }[]
  bandeja: number; escalados: number
  comite?: { id: string; numero: string }[]       // HU-067 CA-03: casos con SLA vencido que suben a la Sala de Comité
  tickets: { id: string; numero: string; tipo?: string; gate: string; zona: string; etapa: string; sla: 'ok' | 'riesgo' | 'vencido'; rayo: boolean; sel: boolean; resp?: string }[]
}
export interface Cols { teal: RGB; teal2: RGB; orange: RGB; ok: RGB; warn: RGB; bad: RGB; line: RGB; muted: RGB; texto: RGB; superficie: RGB; suelo: RGB; lienzo: RGB }
export interface OptsVivo {
  canvas: HTMLCanvasElement; host: HTMLElement; cols: Cols; color: (token: string) => RGB; reducido: boolean
  est: Estatico; hits: { current: { id: string; x: number; y: number }[] }; obtener: () => Snap
  onZona?: (k: string | null) => void              // HU-067 CA-04: se tocó el suelo de un área (o fuera de las áreas: null)
  onCanal?: (k: string) => void                    // 20-oct (visor de Daniel): se tocó la entrada de un canal o su cartel
  onEtapa?: (k: 'bandeja' | 'comite' | 'salida') => void  // …la bandeja orquestadora, la Sala de Comité o el cierre
}

// ------------------------------------------------------------------ utilidades de animación
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x))
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const easeOutBack = (t: number) => { const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2) }
const VEL = 4.4 // m/s de un ticket en tránsito

interface Mov { pts: THREE.Vector3[]; cum: number[]; t0: number; dur: number }
function crearMov(desde: THREE.Vector3, ruta: THREE.Vector3[], t0: number): Mov | null {
  const pts = [desde.clone()]
  for (const p of ruta) if (p.distanceToSquared(pts[pts.length - 1]!) > 1e-4) pts.push(p.clone())
  if (pts.length < 2) return null
  const cum = [0]
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1]! + pts[i]!.distanceTo(pts[i - 1]!))
  return { pts, cum, t0, dur: Math.max(0.7, cum[cum.length - 1]! / VEL) * 1000 }
}
function muestrear(m: Mov, ahora: number, out: THREE.Vector3) {
  const u = clamp((ahora - m.t0) / m.dur), d = easeInOut(u) * m.cum[m.cum.length - 1]!
  let i = 1
  while (i < m.cum.length - 1 && m.cum[i]! < d) i++
  const a = m.pts[i - 1]!, b = m.pts[i]!, l = m.cum[i]! - m.cum[i - 1]! || 1
  out.lerpVectors(a, b, clamp((d - m.cum[i - 1]!) / l))
  out.y += Math.sin(Math.PI * u) * 0.18 // arco suave: el ticket «vuela», no se arrastra
  return u >= 1
}

interface Ent {
  id: string; g: THREE.Group; card: THREE.Group; led: THREE.Mesh; ledMat: THREE.MeshBasicMaterial; halo: THREE.Sprite; bolt: THREE.Mesh; glow: THREE.Sprite
  pos: THREE.Vector3; etapa: string; zona: string; clave: string | null; mov: Mov | null; nace: number; muere: number | null; fase: number
  sla: string; rayo: boolean; sel: boolean; numero: string; desk?: string
}
interface Pers { g: THREE.Group; torso: THREE.Object3D; cabeza: THREE.Object3D; bi: { p: THREE.Group; ant: THREE.Group }; bd: { p: THREE.Group; ant: THREE.Group }; pI?: THREE.Group; pD?: THREE.Group; fase: number; sentado: boolean; nombre: string; pantalla?: THREE.MeshStandardMaterial; silla?: THREE.Object3D }

export function montarVivo(o: OptsVivo): () => void {
  const { canvas, host, cols: C, est } = o
  const RM = o.reducido
  inyectarEstilos()
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  r.setPixelRatio(Math.min(2, devicePixelRatio || 1))
  r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFShadowMap
  r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.35
  const etiquetas = capaEtiquetas(host)
  const escena = new THREE.Scene()
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, -80, 80)
  const kit = new Kit({ ...C })
  const colorZona = new Map(est.zonas.map((z) => [z.k, z.color]))
  const nombreZona = new Map(est.zonas.map((z) => [z.k, z.n]))
  const colorTipo = new Map((est.tipos ?? []).map((t) => [t.k, t.color]))

  // ---------------------------------------------------------------- luz
  escena.add(new THREE.HemisphereLight(0xfff4e6, color(mezcla(C.suelo, C.teal, 0.5)), 1.7))
  const sol = new THREE.DirectionalLight(0xfff0dc, 2.9)
  sol.position.set(CENTRO.x - 9, 17, CENTRO.z + 7); sol.target.position.copy(CENTRO)
  sol.castShadow = true; sol.shadow.mapSize.set(2048, 2048); sol.shadow.bias = -0.0004; sol.shadow.normalBias = 0.03; sol.shadow.radius = 4
  Object.assign(sol.shadow.camera, { left: -15, right: 15, top: 13, bottom: -13, near: 1, far: 50 }); sol.shadow.camera.updateProjectionMatrix()
  escena.add(sol, sol.target)
  const relleno = new THREE.DirectionalLight(color(mezcla(C.teal, C.superficie, 0.5)), 0.5); relleno.position.set(14, 8, -6); escena.add(relleno)

  // ---------------------------------------------------------------- suelo, muros y pasillos
  const piso: RGB = mezcla(C.suelo, C.texto, 0.2), pasillo: RGB = mezcla(C.suelo, C.texto, 0.34)
  const baldosa = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128
    const x = c.getContext('2d')!
    x.fillStyle = '#fff'; x.fillRect(0, 0, 128, 128)
    x.strokeStyle = 'rgba(0,0,0,.09)'; x.lineWidth = 2; x.strokeRect(1, 1, 126, 126)
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4
    return t
  })()
  const losa = new THREE.Mesh(kit.caja(PISO.w, 0.3, PISO.d, 0.08), kit.mat(mezcla(C.suelo, C.texto, 0.4), { r: 0.8 }))
  losa.position.set(PISO.x0 + PISO.w / 2, -0.15, PISO.z0 + PISO.d / 2); losa.receiveShadow = true; escena.add(losa)
  const tex = baldosa.clone(); tex.repeat.set(PISO.w, PISO.d); tex.needsUpdate = true
  const suelo = new THREE.Mesh(new THREE.PlaneGeometry(PISO.w - 0.1, PISO.d - 0.1), new THREE.MeshStandardMaterial({ color: color(piso), map: tex, roughness: 0.9 }))
  suelo.rotation.x = -Math.PI / 2; suelo.position.set(PISO.x0 + PISO.w / 2, 0.005, PISO.z0 + PISO.d / 2); suelo.receiveShadow = true; escena.add(suelo)
  const tira = (x0: number, z0: number, x1: number, z1: number, c: RGB, y = 0.012) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), kit.mat(c, { r: 0.85 }))
    m.rotation.x = -Math.PI / 2; m.position.set((x0 + x1) / 2, y, (z0 + z1) / 2); m.receiveShadow = true; escena.add(m); return m
  }
  tira(2.55, 1.0, 3.45, 11.4, pasillo); tira(2.55, 10.45, 12.2, 11.35, pasillo); tira(11.2, 0.1, 12.1, 11.35, pasillo); tira(3.0, 6.25, 11.6, 7.15, pasillo)
  // muros bajos de fondo (norte y oeste): dan marco de maqueta sin tapar nada
  const muroC = mezcla(C.superficie, C.suelo, 0.45)
  const muro = (x: number, z: number, w: number, d: number) => { const m = new THREE.Mesh(kit.caja(w, 1.7, d, 0.05), kit.mat(muroC, { r: 0.85 })); m.position.set(x, 0.85, z); m.castShadow = m.receiveShadow = true; escena.add(m) }
  muro(PISO.x0 + PISO.w / 2, PISO.z0 + 0.1, PISO.w, 0.2); muro(PISO.x0 + 0.1, PISO.z0 + PISO.d / 2, 0.2, PISO.d)
  const friso = (x: number, z: number, w: number, d: number) => { const m = new THREE.Mesh(kit.caja(w, 0.1, d, 0.03), kit.mat(C.teal, { r: 0.4, m: 0.2, e: C.teal, ei: 0.15 })); m.position.set(x, 1.72, z); escena.add(m) }
  friso(PISO.x0 + PISO.w / 2, PISO.z0 + 0.1, PISO.w, 0.24); friso(PISO.x0 + 0.1, PISO.z0 + PISO.d / 2, 0.24, PISO.d)

  // ---------------------------------------------------------------- etiquetas (carteles de cristal)
  const signos: { set: (sub: string, riesgo?: boolean) => void }[] = []
  // 20-oct (visor de Daniel): con `alTocar`, el cartel es un botón (ratón y teclado) que abre el detalle en el cajón de bandejas
  const signo = (titulo: string, sub: string, x: number, y: number, z: number, acento: RGB, compacto = false, alTocar?: () => void) => {
    const el = document.createElement('div'); el.style.pointerEvents = 'none'
    const pill = document.createElement('div')  // CSS2DRenderer pisa el `display` del elemento raíz: el flex va en un hijo
    pill.style.cssText = `pointer-events:none;display:flex;align-items:center;gap:8px;padding:5px 11px 5px 9px;border-radius:999px;white-space:nowrap;background:${css(C.superficie, 0.78)};backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid ${css(C.line, 0.9)};box-shadow:0 4px 14px rgba(0,0,0,.28);color:${css(C.texto)}`
    const punto = document.createElement('span'); punto.style.cssText = `display:block;width:9px;height:9px;border-radius:50%;flex:none;background:${css(acento)};box-shadow:0 0 0 3px ${css(acento, 0.25)}`
    const caja = document.createElement('div'); caja.style.cssText = 'line-height:1.15;text-align:left'
    const t = document.createElement('b'); t.style.cssText = 'display:block;font:700 11.5px Montserrat,system-ui,sans-serif'; t.textContent = titulo
    const s = document.createElement('small'); s.style.cssText = `display:block;font:500 10px Montserrat,system-ui,sans-serif;color:${css(C.muted)}`; s.textContent = sub
    if (compacto) { s.style.display = 'none'; pill.style.padding = '3px 9px 3px 7px' }
    if (alTocar) {
      Object.assign(pill.style, { pointerEvents: 'auto', cursor: 'pointer', transition: 'border-color .18s' })
      pill.setAttribute('role', 'button'); pill.tabIndex = 0; pill.title = `Ver el detalle de «${titulo}»`; pill.setAttribute('aria-label', pill.title)
      const marca = (on: boolean) => { pill.style.borderColor = on ? css(acento) : css(C.line, 0.9) }
      pill.addEventListener('mouseenter', () => marca(true)); pill.addEventListener('mouseleave', () => marca(false))
      pill.addEventListener('focus', () => marca(true)); pill.addEventListener('blur', () => marca(false))
      pill.addEventListener('click', (ev) => { ev.stopPropagation(); alTocar() })
      pill.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); alTocar() } })
    }
    caja.append(t, s); pill.append(punto, caja); el.append(pill)
    const obj = new CSS2DObject(el); obj.position.set(x, y, z); escena.add(obj)
    const api = { set: (n: string, riesgo = false) => { if (s.textContent !== n) s.textContent = n; const c = riesgo ? C.bad : acento; punto.style.background = css(c); punto.style.boxShadow = `0 0 0 3px ${css(c, 0.25)}` } }
    signos.push(api); return { ...api, obj }
  }

  // ---------------------------------------------------------------- personas
  const personas = new Map<string, Pers>()
  const nuevaPersona = (clave: string, nombre: string, camisa: RGB, sentado: boolean, x: number, z: number, rot: number, silla = true): Pers => {
    const h = hash(clave + nombre)
    const g = kit.persona({ camisa, piel: PIELES[h % PIELES.length]!, pelo: PELOS[(h >>> 3) % PELOS.length]!, sentado })
    g.position.set(x, 0, z); g.rotation.y = rot; escena.add(g)
    let sl: THREE.Object3D | undefined
    if (silla && sentado) { sl = kit.silla(); sl.position.set(x, 0, z); sl.rotation.y = rot; escena.add(sl) }
    const u = g.userData as Pers & { brazoI: Pers['bi']; brazoD: Pers['bd'] }
    const p: Pers = { g, torso: u.torso as unknown as THREE.Object3D, cabeza: u.cabeza as unknown as THREE.Object3D, bi: u.brazoI, bd: u.brazoD, pI: (u as any).pI, pD: (u as any).pD, fase: (h % 628) / 100, sentado, nombre, silla: sl }
    ;(g as any).userData.clave = clave
    personas.set(clave, p); return p
  }
  const quitarPersona = (clave: string) => { const p = personas.get(clave); if (!p) return; escena.remove(p.g); if (p.silla) escena.remove(p.silla); personas.delete(clave) }

  /** Pone a la persona frente al teclado (escribiendo) o en reposo (respira y mira alrededor). */
  const animarPersona = (p: Pers, t: number, ocupado: boolean) => {
    const ph = p.fase
    ;(p.torso as THREE.Mesh).scale.y = 1 + (RM ? 0 : Math.sin(t * 1.6 + ph) * 0.012)
    if (p.sentado) {
      const k = ocupado ? 1 : 0
      const tecleo = RM || !ocupado ? 0 : Math.sin(t * 17 + ph) * 0.07
      const tecleo2 = RM || !ocupado ? 0 : Math.sin(t * 17 + ph + 2) * 0.07
      p.bi.p.rotation.x = -(0.55 + 0.6 * k) + tecleo; p.bd.p.rotation.x = -(0.55 + 0.6 * k) + tecleo2
      p.bi.ant.rotation.x = -(0.2 + 0.45 * k) ; p.bd.ant.rotation.x = -(0.2 + 0.45 * k)
      p.bi.p.rotation.z = 0.08; p.bd.p.rotation.z = -0.08
      p.cabeza.rotation.y = ocupado || RM ? Math.sin(t * 0.7 + ph) * 0.06 : Math.sin(t * 0.45 + ph) * 0.5
      p.cabeza.rotation.x = ocupado ? 0.12 + Math.sin(t * 2 + ph) * 0.02 : 0
    }
  }

  // ---------------------------------------------------------------- entradas automatizadas (canales)
  // Sin operadores humanos: cada canal es un ente automatizado. El estilo se elige en el selector de la
  // escena (o con ?entradas=terminal|dispensador|orbe|minibot|portal) y se recuerda en el navegador.
  const estSnap = new Map(est.compuertas.map((c) => [c.k, c]))
  const posEstacion = new Map<string, THREE.Vector3>()
  const glifos = new Map(CANALES.map((c) => { const i = estSnap.get(c.k)!; return [c.k, glifo(c.k, i.color, mezcla(C.suelo, i.color, 0.18))] as const }))
  const grupoEntradas = new THREE.Group(); escena.add(grupoEntradas)
  const entradas = new Map<string, Entrada>()
  const pulsoCanal = new Map<string, number>()
  const letreros: CSS2DObject[] = []
  const leerEstilo = (): EstiloEntrada => {
    let id = new URLSearchParams(location.search).get('entradas')
    if (!id) { try { id = localStorage.getItem('v3:entradas') } catch { /* sin almacenamiento */ } }
    return ESTILOS.some((e) => e.id === id) ? (id as EstiloEntrada) : 'terminal'
  }
  let estiloEntrada = leerEstilo()
  const montarEntradas = () => {
    for (const e of entradas.values()) { grupoEntradas.remove(e.g); e.dispose() }
    entradas.clear(); letreros.forEach((l) => { escena.remove(l); l.element.remove() }); letreros.length = 0
    for (const c of CANALES) {
      const info = estSnap.get(c.k)!
      const e = crearEntrada(estiloEntrada, c.k, info.color, kit, glifos.get(c.k)!, (hash(c.k) % 628) / 100)
      e.g.position.set(ESTACION.x, 0, c.z); e.g.rotation.y = Math.PI / 2; e.g.scale.setScalar(1.3); e.g.userData.canal = c.k; grupoEntradas.add(e.g); entradas.set(c.k, e)
      e.g.updateMatrixWorld(true); posEstacion.set(c.k, e.g.localToWorld(e.spawn.clone()))
      letreros.push(signo(info.n, '', 0.15, 1.5, c.z - 0.45, info.color, true, () => o.onCanal?.(c.k)).obj)
    }
  }
  montarEntradas()
  const selector = document.createElement('div'); selector.className = 'v3-entradas'; selector.setAttribute('role', 'group'); selector.setAttribute('aria-label', 'Estilo de las entradas automatizadas')
  const rotulo = document.createElement('span'); rotulo.textContent = 'Entradas'; selector.append(rotulo)
  const botones = ESTILOS.map((e) => {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = e.n; b.title = e.d; b.setAttribute('aria-pressed', String(e.id === estiloEntrada))
    b.addEventListener('click', () => {
      estiloEntrada = e.id; try { localStorage.setItem('v3:entradas', e.id) } catch { /* sin almacenamiento */ }
      botones.forEach((x, i) => x.setAttribute('aria-pressed', String(ESTILOS[i]!.id === e.id))); montarEntradas()
    })
    selector.append(b); return b
  })
  host.append(selector)

  // ---------------------------------------------------------------- mesa de orquestación
  const mesa = new THREE.Mesh(kit.caja(HUB.w, 0.09, HUB.d + 0.5, 0.04), kit.mat(mezcla(C.superficie, C.texto, 0.22), { r: 0.45 })); mesa.position.set(HUB.x, 0.8, HUB.z); Kit.sombrear(mesa); escena.add(mesa)
  const cuerpoMesa = new THREE.Mesh(kit.caja(HUB.w - 0.2, 0.74, HUB.d + 0.3, 0.04), kit.mat(mezcla(C.teal, C.suelo, 0.2), { r: 0.5 })); cuerpoMesa.position.set(HUB.x, 0.37, HUB.z); Kit.sombrear(cuerpoMesa); escena.add(cuerpoMesa)
  const neon = new THREE.Mesh(kit.caja(HUB.w - 0.3, 0.035, 0.03, 0.01), kit.mat(C.orange, { r: 0.3, e: C.orange, ei: 1.4 })); neon.position.set(HUB.x, 0.6, HUB.z + HUB.d / 2 + 0.17); escena.add(neon)
  const bandeja = new THREE.Mesh(kit.caja(1.65, 0.035, 1.0, 0.03), kit.mat(mezcla(C.orange, C.superficie, 0.35), { r: 0.5 })); bandeja.position.set(6.55, 0.865, 6.65); Kit.sombrear(bandeja); escena.add(bandeja)
  // paneles de pared: gráfico de colas (central) y lista animada (laterales)
  const lienzoHub = document.createElement('canvas'); lienzoHub.width = 512; lienzoHub.height = 288
  const texHub = new THREE.CanvasTexture(lienzoHub); texHub.colorSpace = THREE.SRGBColorSpace
  const lienzoLista = document.createElement('canvas'); lienzoLista.width = 256; lienzoLista.height = 288
  const texLista = new THREE.CanvasTexture(lienzoLista); texLista.colorSpace = THREE.SRGBColorSpace
  const panel = (x: number, w: number, tx: THREE.Texture) => {
    const marco = new THREE.Mesh(kit.caja(w + 0.08, 0.7 * (w > 1 ? 1 : 0.9) + 0.08, 0.06, 0.02), kit.mat(mezcla(C.suelo, C.texto, 0.1), { r: 0.35, m: 0.3 }))
    const alto = 0.7 * (w > 1 ? 1 : 0.9)
    marco.position.set(x, 1.65, HUB.pantallas); Kit.sombrear(marco, true, false)
    const cara = new THREE.Mesh(new THREE.PlaneGeometry(w, alto), new THREE.MeshBasicMaterial({ map: tx, toneMapped: false })); cara.position.set(x, 1.65, HUB.pantallas + 0.035)
    escena.add(marco, cara)
  }
  panel(HUB.x, 1.25, texHub); panel(HUB.x - 1.05, 0.62, texLista); panel(HUB.x + 1.05, 0.62, texLista)
  const soporte = new THREE.Mesh(kit.caja(3.0, 1.05, 0.12, 0.03), kit.mat(mezcla(C.suelo, C.texto, 0.14), { r: 0.6 })); soporte.position.set(HUB.x, 0.52, HUB.pantallas - 0.05); Kit.sombrear(soporte); escena.add(soporte)
  const pechoBandeja = (() => { // icono de bandeja para el panel del pecho del robot
    const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d')!
    x.fillStyle = css(mezcla(C.suelo, C.orange, 0.15)); x.fillRect(0, 0, 128, 128)
    x.strokeStyle = css(C.orange); x.lineWidth = 8; x.lineCap = 'round'; x.lineJoin = 'round'
    ;[0, 1, 2].forEach((i) => { x.beginPath(); x.roundRect(26 + i * 6, 26 + i * 18, 76 - i * 12, 24, 8); x.stroke() })
    x.beginPath(); x.moveTo(64, 104); x.lineTo(64, 118); x.moveTo(54, 110); x.lineTo(64, 120); x.lineTo(74, 110); x.stroke()
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t
  })()
  const orq = crearOrquestador(kit, C.orange, pechoBandeja)
  orq.g.position.set(HUB.despachador[0], 0, HUB.despachador[1]); orq.g.rotation.y = Math.PI; escena.add(orq.g)
  const miraBandeja = new THREE.Vector3(6.55, 0.9, 6.65)
  const pHub = signo('Bandeja orquestadora', '', HUB.x, 2.5, HUB.pantallas - 0.2, C.orange, false, () => o.onEtapa?.('bandeja'))
  // 20-oct: la mesa de la bandeja, el suelo de la Sala de Comité y el del cierre también se tocan (abren su detalle)
  const suelosEtapa: THREE.Object3D[] = [mesa, cuerpoMesa, bandeja]; suelosEtapa.forEach((m) => { m.userData.etapa = 'bandeja' })

  // ---------------------------------------------------------------- salas
  const puertaHueco = 1.1
  const paredes = (s: Sala, c: RGB) => {
    const { x, z, w, d } = s
    const norte = (largo: number, cx: number, cz: number) => { const v = kit.vidrio(largo, 'x', c); v.position.set(cx, 0, cz); escena.add(v) }
    const oeste = (largo: number, cx: number, cz: number) => { const v = kit.vidrio(largo, 'z', c); v.position.set(cx, 0, cz); escena.add(v) }
    if (s.lado === 'oeste') {
      norte(w, x + w / 2, z); norte(w, x + w / 2, z + d); oeste(d, x + w, z + d / 2)
      const a = s.puerta[1] - puertaHueco / 2 - z, b = z + d - (s.puerta[1] + puertaHueco / 2)
      oeste(a, x, z + a / 2); oeste(b, x, z + d - b / 2)
    } else {
      oeste(d, x, z + d / 2); oeste(d, x + w, z + d / 2); norte(w, x + w / 2, z + d)
      const a = s.puerta[0] - puertaHueco / 2 - x, b = x + w - (s.puerta[0] + puertaHueco / 2)
      norte(a, x + a / 2, z); norte(b, x + w - b / 2, z)
    }
  }
  const alfombra = (x: number, z: number, w: number, d: number, c: RGB) => {
    const m = new THREE.Mesh(kit.caja(w - 0.1, 0.03, d - 0.1, 0.012), kit.mat(mezcla(c, piso, 0.6), { r: 0.95 })); m.position.set(x + w / 2, 0.02, z + d / 2); m.receiveShadow = true; escena.add(m)
    return m
  }
  const suelosZona: THREE.Object3D[] = []  // HU-067 CA-04: la alfombra de cada sala es lo que se toca para abrir el área
  const monitoresSala = new Map<string, THREE.MeshStandardMaterial[]>()
  const plantas: THREE.Object3D[] = []
  const grande = (s: Sala, c: RGB) => {
    const alf = alfombra(s.x, s.z, s.w, s.d, c); alf.userData.zona = s.k; suelosZona.push(alf); paredes(s, c)
    const mons: THREE.MeshStandardMaterial[] = []
    s.puestos.forEach((p) => {
      const e = kit.escritorio(); e.position.set(p.x, 0, p.z); e.rotation.y = p.rotEscritorio; escena.add(e)
      const m = kit.monitor(); m.g.position.set(p.x, 0.745, p.z); m.g.rotation.y = p.rotEscritorio; m.g.translateZ(-0.12); escena.add(m.g)
      const k = kit.teclado(); k.position.set(p.x, 0.745, p.z); k.rotation.y = p.rotEscritorio; k.translateZ(0.12); escena.add(k)
      mons.push(m.pantalla)
    })
    monitoresSala.set(s.k, mons)
    const pl = kit.planta(0.6); pl.position.set(s.lado === 'oeste' ? s.x + s.w - 0.3 : s.x + 0.3, 0, s.lado === 'oeste' ? s.z + 0.3 : s.z + s.d - 0.3); escena.add(pl); plantas.push(pl)
    const pl2 = kit.planta(0.45); pl2.position.set(s.lado === 'oeste' ? s.x + s.w - 0.3 : s.x + s.w - 0.3, 0, s.lado === 'oeste' ? s.z + s.d - 0.3 : s.z + s.d - 0.3); escena.add(pl2); plantas.push(pl2)
  }
  const pZona = new Map<string, ReturnType<typeof signo>>()
  for (const z of est.zonas) {
    const s = SALAS[z.k]; if (!s) continue
    grande(s, z.color)
    const sx = s.lado === 'oeste' ? s.x - 0.1 : s.puerta[0], sz = s.lado === 'oeste' ? s.puerta[1] : s.z - 0.1
    pZona.set(z.k, signo(z.n, '', sx, 2.0, sz, z.color, false, () => o.onZona?.(z.k)))
  }
  // comité
  { const a = alfombra(COMITE.x, COMITE.z, COMITE.w, COMITE.d, C.bad); a.userData.etapa = 'comite'; suelosEtapa.push(a) }
  { const v = (l: number, e: 'x' | 'z', cx: number, cz: number) => { const m = kit.vidrio(l, e, C.bad); m.position.set(cx, 0, cz); escena.add(m) }
    v(COMITE.w, 'x', COMITE.x + COMITE.w / 2, COMITE.z); v(COMITE.w, 'x', COMITE.x + COMITE.w / 2, COMITE.z + COMITE.d); v(COMITE.d, 'z', COMITE.x, COMITE.z + COMITE.d / 2); v(COMITE.d, 'z', COMITE.x + COMITE.w, COMITE.z + COMITE.d / 2) }
  const tablaC = new THREE.Mesh(kit.caja(2.5, 0.06, 1.0, 0.04), kit.mat(mezcla(C.superficie, C.texto, 0.25), { r: 0.4 })); tablaC.position.set(COMITE.mesa[0], 0.74, COMITE.mesa[1]); Kit.sombrear(tablaC); escena.add(tablaC)
  for (const sx of [-1, 1]) { const p = new THREE.Mesh(kit.caja(0.1, 0.72, 0.8, 0.02), kit.mat(mezcla(C.suelo, C.texto, 0.4), { r: 0.4, m: 0.3 })); p.position.set(COMITE.mesa[0] + sx * 1.0, 0.36, COMITE.mesa[1]); Kit.sombrear(p); escena.add(p) }
  ;[[-0.8, -0.85, 0], [0.8, -0.85, 0], [-0.8, 0.85, Math.PI], [0.8, 0.85, Math.PI]].forEach(([dx, dz, rot], i) => nuevaPersona(`comite:${i}`, `Comité ${i + 1}`, mezcla(C.bad, C.suelo, 0.45 + i * 0.05), true, COMITE.mesa[0] + dx!, COMITE.mesa[1] + dz!, rot!))
  const pCom = signo('Sala de Comité', '', COMITE.x + COMITE.w + 0.3, 2.0, COMITE.z + 0.3, C.bad, false, () => o.onEtapa?.('comite'))
  const cartasComite: THREE.Object3D[] = []
  for (let i = 0; i < 6; i++) { const c = kit.tarjeta(C.bad); c.scale.setScalar(0.8); c.position.set(COMITE.mesa[0] - 0.9 + i * 0.36, 0.8, COMITE.mesa[1] + (i % 2 ? 0.14 : -0.14)); c.visible = false; escena.add(c); cartasComite.push(c) }
  // cierre
  { const a = alfombra(SALIDA.x, SALIDA.z, SALIDA.w, SALIDA.d, C.ok); a.userData.etapa = 'salida'; suelosEtapa.push(a) }
  { const v = (l: number, e: 'x' | 'z', cx: number, cz: number) => { const m = kit.vidrio(l, e, C.ok); m.position.set(cx, 0, cz); escena.add(m) }
    v(SALIDA.w, 'x', SALIDA.x + SALIDA.w / 2, SALIDA.z); v(SALIDA.w, 'x', SALIDA.x + SALIDA.w / 2, SALIDA.z + SALIDA.d); v(SALIDA.d, 'z', SALIDA.x, SALIDA.z + SALIDA.d / 2)
    const a = SALIDA.puerta[1] - 0.55 - SALIDA.z, b = SALIDA.z + SALIDA.d - (SALIDA.puerta[1] + 0.55); v(a, 'z', SALIDA.x + SALIDA.w, SALIDA.z + a / 2); v(b, 'z', SALIDA.x + SALIDA.w, SALIDA.z + SALIDA.d - b / 2) }
  const arco = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.05, 8, 28, Math.PI), kit.mat(C.ok, { r: 0.3, e: C.ok, ei: 0.9 })); arco.position.set(SALIDA.puerta[0], 0.62, SALIDA.puerta[1]); arco.rotation.y = Math.PI / 2; escena.add(arco)
  const estante = new THREE.Mesh(kit.caja(2.4, 0.05, 1.5, 0.03), kit.mat(mezcla(C.superficie, C.texto, 0.2), { r: 0.5 })); estante.position.set(1.7, 0.86, 13.45); Kit.sombrear(estante); escena.add(estante)
  const patas = new THREE.Mesh(kit.caja(2.2, 0.82, 1.3, 0.03), kit.mat(mezcla(C.ok, C.suelo, 0.6), { r: 0.6 })); patas.position.set(1.7, 0.41, 13.45); Kit.sombrear(patas); escena.add(patas)
  nuevaPersona('salida:recep', 'Recepción Mi Portal', mezcla(C.ok, C.suelo, 0.3), false, 1.7, 12.55, 0)
  const pSal = signo('Cierre en Mi Portal', '', 1.5, 1.7, 14.9, C.ok, false, () => o.onEtapa?.('salida'))
  // peatones que dan vida a los pasillos
  const paseantes = [0, 2].map((i) => ({ p: nuevaPersona(`paseo:${i}`, `Supervisor ${i + 1}`, mezcla(C.teal2, C.suelo, 0.15), false, PASEO[i]!.x, PASEO[i]!.z, 0), seg: i, u: 0 }))

  // ---------------------------------------------------------------- tickets
  const halo = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64
    const x = c.getContext('2d')!, g = x.createRadialGradient(32, 32, 0, 32, 32, 32)
    g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(0.35, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(255,255,255,0)')
    x.fillStyle = g; x.fillRect(0, 0, 64, 64)
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t
  })()
  const sprite = (c: RGB) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: halo, color: color(c), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); s.center.set(0.5, 0.5); return s }
  const rayoGeo = (() => {
    const s = new THREE.Shape(); s.moveTo(0.1, 0.5); s.lineTo(-0.2, -0.02); s.lineTo(-0.02, -0.02); s.lineTo(-0.12, -0.5); s.lineTo(0.22, 0.08); s.lineTo(0.04, 0.08); s.closePath()
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.1, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 1 }); g.center(); g.scale(0.42, 0.42, 0.42); return g
  })()
  const rayoMat = new THREE.MeshStandardMaterial({ color: color(C.orange), emissive: color(C.orange), emissiveIntensity: 1.2, roughness: 0.3 })
  const colores = { ok: C.ok, riesgo: C.warn, vencido: C.bad }
  const ledMats = { ok: new THREE.MeshBasicMaterial({ color: color(C.ok) }), riesgo: new THREE.MeshBasicMaterial({ color: color(C.warn) }), vencido: new THREE.MeshBasicMaterial({ color: color(C.bad) }) }
  const ent = new Map<string, Ent>()
  const slots = new Map<string, (string | null)[]>()
  const tomar = (clave: string, id: string) => { const a = slots.get(clave) ?? []; slots.set(clave, a); let i = a.indexOf(null); if (i < 0) { i = a.length; a.push(null) } a[i] = id; return i }
  const soltar = (clave: string | null, id: string) => { if (!clave) return; const a = slots.get(clave); const i = a?.indexOf(id) ?? -1; if (a && i >= 0) a[i] = null }
  const seleccion = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.025, 8, 36), new THREE.MeshBasicMaterial({ color: color(C.orange), transparent: true, opacity: 0, depthWrite: false })); seleccion.rotation.x = Math.PI / 2; escena.add(seleccion)
  const etSel = document.createElement('div')
  etSel.style.cssText = `pointer-events:none;padding:3px 9px;border-radius:999px;font:700 11px Montserrat,system-ui,sans-serif;white-space:nowrap;background:${css(C.orange)};color:${css(C.lienzo)};box-shadow:0 4px 12px rgba(0,0,0,.35)`
  const objSel = new CSS2DObject(etSel); objSel.visible = false

  const nuevoEnt = (t: Snap['tickets'][number], ahora: number, retraso: number): Ent => {
    const g = new THREE.Group()
    const card = kit.tarjeta(colorTipo.get(t.tipo ?? '') ?? colorZona.get(t.zona) ?? C.teal2)
    const ledMat = ledMats.ok, led = new THREE.Mesh(kit.esf(0.028), ledMat); led.position.set(0.23, 0.04, 0.13); card.add(led)
    const h = sprite(C.warn); h.scale.setScalar(0.9); h.position.y = 0.05; card.add(h)
    const bolt = new THREE.Mesh(rayoGeo, rayoMat); bolt.position.y = 0.55; bolt.visible = false
    const glow = sprite(C.orange); glow.scale.setScalar(1.0); glow.position.y = 0.55
    g.add(card, bolt, glow); g.scale.setScalar(0.0001); escena.add(g)
    const e: Ent = { id: t.id, g, card, led, ledMat, halo: h, bolt, glow, pos: new THREE.Vector3(), etapa: '', zona: t.zona, clave: null, mov: null, nace: ahora + retraso, muere: null, fase: (hash(t.id) % 628) / 100, sla: 'ok', rayo: false, sel: false, numero: t.numero }
    ent.set(t.id, e); return e
  }
  const nombrePorId = new Map<string, string>()

  /** Decide a dónde va un ticket cuando cambia de etapa y le arma el recorrido por los pasillos. */
  const asignar = (e: Ent, t: Snap['tickets'][number], s: Snap, ahora: number, sembrando: boolean, esNuevo: boolean) => {
    const sala = SALAS[t.zona] ?? SALAS.eje1!
    const clave = t.etapa === 'bandeja' ? 'b' : t.etapa === 'cola' ? `c:${t.zona}` : t.etapa === 'salida' ? 's' : `a:${t.zona}`
    if (e.clave === clave && !esNuevo) return
    soltar(e.clave, e.id)
    e.clave = clave; e.etapa = t.etapa; e.zona = t.zona
    const canal = CANALES.find((c) => c.k === t.gate) ?? CANALES[0]!
    let destino: THREE.Vector3, ruta: THREE.Vector3[]
    if (t.etapa === 'bandeja') { destino = slotBandeja(tomar(clave, e.id)); ruta = rutaBandeja(canal.z, destino) }
    else if (t.etapa === 'cola') { destino = slotCola(sala, tomar(clave, e.id)); ruta = rutaCola(sala, destino) }
    else if (t.etapa === 'salida') { destino = slotSalida(tomar(clave, e.id)); ruta = rutaSalida(sala, destino) }
    else {
      const gente = s.zonas.find((z) => z.k === t.zona)?.gente ?? []
      const i = Math.max(0, gente.findIndex((x) => x.id === t.resp))
      const n = tomar(clave, e.id), mismo = Math.max(0, n - gente.length)
      destino = puestoTicket(sala, i >= 0 ? i : hash(t.id) % 3, mismo); ruta = rutaAtencion(sala, destino)
    }
    if (sembrando) { e.pos.copy(destino); e.mov = null; return }
    if (esNuevo) {
      e.pos.copy(posEstacion.get(canal.k) ?? V(1.5, H.mesa, canal.z))
      if (t.etapa !== 'bandeja') ruta = [V(2.0, H.viaje, canal.z), V(3.0, H.viaje, canal.z), V(3.0, H.viaje, 6.7), ...ruta]
    }
    e.mov = RM ? null : crearMov(e.pos, ruta, ahora)
    if (RM) e.pos.copy(destino)
  }

  // ---------------------------------------------------------------- hub: pantalla de colas
  const barras = new Map<string, number>()
  let ultimoHub = 0
  const dibujarHub = (s: Snap, ahora: number) => {
    if (ahora - ultimoHub < 280) return
    ultimoHub = ahora
    const x = lienzoHub.getContext('2d')!, W = lienzoHub.width, Hh = lienzoHub.height
    const g = x.createLinearGradient(0, 0, 0, Hh); g.addColorStop(0, css(mezcla(C.teal, C.suelo, 0.75))); g.addColorStop(1, css(mezcla(C.suelo, [0, 0, 0], 0.5)))
    x.fillStyle = g; x.fillRect(0, 0, W, Hh)
    x.fillStyle = css(C.orange); x.font = '700 26px Montserrat, system-ui, sans-serif'; x.textAlign = 'left'; x.fillText('BANDEJA', 24, 44)
    x.fillStyle = css(C.texto); x.font = '800 66px Montserrat, system-ui, sans-serif'; x.fillText(String(s.bandeja), 24, 112)
    x.fillStyle = css(C.muted); x.font = '500 18px Montserrat, system-ui, sans-serif'; x.fillText('en espera · rayo > SLA > prioridad', 24, 140)
    const n = s.zonas.length, bw = (W - 48) / n
    s.zonas.forEach((z, i) => {
      const meta = clamp(z.cola / 12) , act = barras.get(z.k) ?? 0, v = act + (meta - act) * 0.4; barras.set(z.k, v)
      const hh = 8 + v * 92, bx = 24 + i * bw + 6, by = Hh - 44
      x.fillStyle = css(colorZona.get(z.k) ?? C.teal2, 0.28); x.fillRect(bx, by - 100, bw - 12, 100)
      x.fillStyle = css(z.riesgo ? C.bad : colorZona.get(z.k) ?? C.teal2); x.fillRect(bx, by - hh, bw - 12, hh)
      x.fillStyle = css(C.texto); x.font = '700 17px Montserrat, system-ui, sans-serif'; x.textAlign = 'center'; x.fillText(String(z.cola), bx + (bw - 12) / 2, by - hh - 6)
      x.fillStyle = css(C.muted); x.font = '600 13px Montserrat, system-ui, sans-serif'; x.fillText((nombreZona.get(z.k) ?? z.k).split(' ')[0]!.slice(0, 7), bx + (bw - 12) / 2, Hh - 22)
    })
    texHub.needsUpdate = true
    const y = lienzoLista.getContext('2d')!
    y.fillStyle = css(mezcla(C.suelo, C.teal, 0.3)); y.fillRect(0, 0, 256, 288)
    for (let i = 0; i < 7; i++) {
      const off = (ahora / 40 + i * 41) % 288
      y.fillStyle = css(i % 3 === 0 ? C.orange : C.teal2, 0.85); y.fillRect(14, 288 - off, 10, 18)
      y.fillStyle = css(C.texto, 0.55); y.fillRect(34, 288 - off + 2, 120 + ((i * 37) % 70), 5); y.fillStyle = css(C.muted, 0.5); y.fillRect(34, 288 - off + 11, 70 + ((i * 53) % 90), 4)
    }
    texLista.needsUpdate = true
  }

  // ---------------------------------------------------------------- tamaño y cámara
  let parX = 0, parY = 0, pX = 0, pY = 0
  const ajustar = () => {
    const w = host.clientWidth
    if (!w) return
    const h = Math.round(Math.max(360, w * 0.58))
    canvas.style.height = `${h}px`
    r.setSize(w, h, false); etiquetas.setSize(w, h)
    const asp = w / h, alto = Math.max(16.4, 25.5 / asp)
    cam.left = (-alto * asp) / 2; cam.right = (alto * asp) / 2; cam.top = alto / 2; cam.bottom = -alto / 2
    cam.updateProjectionMatrix()
  }
  const ro = new ResizeObserver(ajustar); ro.observe(host); ajustar()
  const mover = (ev: PointerEvent) => { const b = canvas.getBoundingClientRect(); parX = ((ev.clientX - b.left) / b.width - 0.5) * 2; parY = ((ev.clientY - b.top) / b.height - 0.5) * 2; punteroPx = [ev.clientX - b.left, ev.clientY - b.top] }
  let punteroPx: [number, number] | null = null
  const salir = () => { parX = parY = 0; punteroPx = null }
  if (!RM) { canvas.addEventListener('pointermove', mover); canvas.addEventListener('pointerleave', salir) }

  // nombre al pasar el cursor por una persona
  const rayo = new THREE.Raycaster()
  const etPers = document.createElement('div')
  etPers.style.cssText = `pointer-events:none;padding:3px 9px;border-radius:8px;font:600 11px Montserrat,system-ui,sans-serif;white-space:nowrap;background:${css(C.superficie, 0.92)};border:1px solid ${css(C.line)};color:${css(C.texto)};box-shadow:0 4px 12px rgba(0,0,0,.3)`
  const objPers = new CSS2DObject(etPers); objPers.visible = false; objPers.position.y = 1.5; escena.add(objPers)

  // HU-067 CA-04: tocar el suelo de un área la abre en un panel (lo pinta el chunk). Si el toque cae sobre un ticket gana el
  // ticket, con el mismo radio (30 px) que usa el chunk para elegirlo; fuera de las áreas se cierra (null).
  // 20-oct (visor de Daniel): tocar la entrada de un canal, la mesa de la bandeja, la Sala de Comité o el cierre abre su detalle
  const objetivo = (obj: THREE.Object3D | undefined, clave: string) => { let g: THREE.Object3D | null | undefined = obj; while (g && g.userData[clave] == null) g = g.parent; return g?.userData[clave] as string | undefined }
  const tocar = (ev: MouseEvent) => {
    const b = canvas.getBoundingClientRect(), x = ev.clientX - b.left, y = ev.clientY - b.top
    if (o.hits.current.some((p) => Math.hypot(p.x - x, p.y - y) < 30)) return
    rayo.setFromCamera(new THREE.Vector2((x / b.width) * 2 - 1, -(y / b.height) * 2 + 1), cam)
    const canal = o.onCanal && objetivo(rayo.intersectObjects(grupoEntradas.children, true)[0]?.object, 'canal')
    if (canal) { o.onCanal!(canal); return }
    const etapa = o.onEtapa && objetivo(rayo.intersectObjects(suelosEtapa, false)[0]?.object, 'etapa')
    if (etapa) { o.onEtapa!(etapa as 'bandeja' | 'comite' | 'salida'); return }
    o.onZona?.((rayo.intersectObjects(suelosZona, false)[0]?.object.userData.zona as string | undefined) ?? null)
  }
  canvas.addEventListener('click', tocar)

  // ---------------------------------------------------------------- bucle
  let primera = true, ultimo = performance.now(), tick = 0
  const v3 = new THREE.Vector3()
  const frame = (ahora: number) => {
    const dt = Math.min(0.1, (ahora - ultimo) / 1000); ultimo = ahora
    const t = ahora / 1000
    const s = o.obtener()
    tick++

    // --- personas de las salas (según la gente que informa el artifact)
    for (const z of s.zonas) {
      const sala = SALAS[z.k]; if (!sala) continue
      const mons = monitoresSala.get(z.k) ?? []
      sala.puestos.forEach((pu, i) => {
        const clave = `${z.k}:${i}`, gen = z.gente[i]
        if (gen && !personas.has(clave)) { nombrePorId.set(gen.id, gen.nombre); nuevaPersona(clave, gen.nombre, mezcla(colorZona.get(z.k) ?? C.teal2, C.suelo, 0.3), true, pu.px, pu.pz, pu.rotPersona) }
        if (!gen && personas.has(clave)) quitarPersona(clave)
        const p = personas.get(clave)
        if (p && gen) { p.nombre = gen.nombre; animarPersona(p, t, gen.ocupado) }
        const m = mons[i]
        if (m) { const on = !!gen?.ocupado; m.emissiveIntensity += ((on ? 0.95 + (RM ? 0 : Math.sin(t * 9 + i) * 0.08) : gen ? 0.35 : 0.08) - m.emissiveIntensity) * 0.2; m.emissive.copy(color(on ? mezcla(C.teal, colorZona.get(z.k) ?? C.teal, 0.55) : C.teal)) }
      })
    }
    for (const [k, p] of personas) {
      if (k.startsWith('canal:') || k.startsWith('comite:')) animarPersona(p, t, k.startsWith('canal:'))
      else if (k === 'hub:despachador' || k === 'salida:recep') {
        p.bi.p.rotation.x = -(0.5 + (k === 'hub:despachador' && !RM ? Math.sin(t * 5) * 0.08 : 0)); p.bd.p.rotation.x = -(0.5 + (k === 'hub:despachador' && !RM ? Math.sin(t * 5 + 1.7) * 0.08 : 0))
        p.bi.ant.rotation.x = -0.6; p.bd.ant.rotation.x = -0.6
        p.cabeza.rotation.y = RM ? 0 : Math.sin(t * 0.6 + p.fase) * 0.5; (p.torso as THREE.Mesh).scale.y = 1 + (RM ? 0 : Math.sin(t * 1.6 + p.fase) * 0.012)
      }
    }
    // --- robots y entradas automatizadas
    orq.update(t, s.bandeja, miraBandeja, RM)
    for (const [k, e] of entradas) e.update(t, (ahora - (pulsoCanal.get(k) ?? -1e9)) / 1000, RM)
    // --- peatones
    if (!RM) for (const w of paseantes) {
      const a = PASEO[w.seg]!, b = PASEO[(w.seg + 1) % PASEO.length]!, L = a.distanceTo(b)
      w.u += (0.85 * dt) / L
      if (w.u >= 1) { w.u = 0; w.seg = (w.seg + 1) % PASEO.length }
      const A = PASEO[w.seg]!, B = PASEO[(w.seg + 1) % PASEO.length]!
      w.p.g.position.lerpVectors(A, B, w.u); w.p.g.position.y = Math.abs(Math.sin(t * 7 + w.p.fase)) * 0.02
      w.p.g.rotation.y = Math.atan2(B.x - A.x, B.z - A.z)
      const sw = Math.sin(t * 7 + w.p.fase) * 0.55
      if (w.p.pI && w.p.pD) { w.p.pI.rotation.x = sw; w.p.pD.rotation.x = -sw }
      w.p.bi.p.rotation.x = -sw * 0.7; w.p.bd.p.rotation.x = sw * 0.7; w.p.bi.ant.rotation.x = -0.25; w.p.bd.ant.rotation.x = -0.25
    }
    // --- plantas
    if (!RM) plantas.forEach((p, i) => { const f = p.userData.follaje as THREE.Object3D; f.rotation.z = Math.sin(t * 0.9 + i) * 0.03; f.rotation.x = Math.cos(t * 0.7 + i) * 0.03 })

    // --- tickets
    const vistos = new Set<string>()
    const ocupantes = new Map<string, number>()
    s.tickets.forEach((tk, idx) => {
      vistos.add(tk.id)
      let e = ent.get(tk.id)
      const esNuevo = !e || e.muere != null
      if (!e || e.muere != null) { if (e) { ent.delete(tk.id); escena.remove(e.g) } e = nuevoEnt(tk, ahora, primera ? Math.min(idx * 18, 900) : 0); if (!primera) pulsoCanal.set(tk.gate, ahora) }
      if (tk.etapa === 'atencion') ocupantes.set(tk.resp ?? '', (ocupantes.get(tk.resp ?? '') ?? 0) + 1)
      if (e.etapa !== tk.etapa || e.zona !== tk.zona || esNuevo) asignar(e, tk, s, ahora, primera, esNuevo)
      e.sla = tk.sla; e.rayo = tk.rayo; e.sel = tk.sel; e.numero = tk.numero
    })
    for (const [id, e] of ent) if (!vistos.has(id) && e.muere == null) { e.muere = ahora; soltar(e.clave, id); e.clave = null }

    const hits: { id: string; x: number; y: number }[] = []
    const w = canvas.clientWidth, h = canvas.clientHeight
    let selEnt: Ent | null = null
    for (const [id, e] of ent) {
      if (e.mov) { const fin = muestrear(e.mov, ahora, e.pos); if (fin) { e.pos.copy(e.mov.pts[e.mov.pts.length - 1]!); e.mov = null } }
      // aparición con rebote y desaparición suave
      let esc = e.sel ? 1.22 : 1
      const edad = (ahora - e.nace) / 1000
      if (edad < 0) esc = 0.0001
      else if (!RM && edad < 0.45) esc *= Math.max(0.0001, easeOutBack(edad / 0.45))
      let sube = 0
      if (e.muere != null) { const u = clamp((ahora - e.muere) / 350); esc *= 1 - u; sube = u * 0.4; if (u >= 1 || RM) { escena.remove(e.g); ent.delete(id); continue } }
      const flota = RM ? 0 : Math.sin(t * 1.8 + e.fase) * 0.025 + (e.mov ? 0 : 0.01)
      e.g.position.set(e.pos.x, e.pos.y + flota + sube, e.pos.z)
      e.g.scale.setScalar(esc * 1.3)
      e.card.rotation.set(e.mov ? 0.18 : -0.12, e.mov ? Math.sin(t * 5 + e.fase) * 0.12 : 0, RM ? 0 : Math.sin(t * 1.4 + e.fase) * 0.05)
      // SLA: LED + halo que late más rápido cuanto más urgente
      e.led.material = ledMats[e.sla as keyof typeof ledMats]
      const urg = e.sla === 'vencido' ? 1 : e.sla === 'riesgo' ? 0.5 : 0
      const hm = e.halo.material as THREE.SpriteMaterial; hm.color.copy(color(colores[e.sla as keyof typeof colores]))
      hm.opacity = urg ? (0.35 + 0.35 * (RM ? 1 : Math.sin(t * (3 + urg * 6) + e.fase) * 0.5 + 0.5)) * (urg > 0.7 ? 1 : 0.7) : 0
      // rayo: relámpago que gira y un resplandor que pulsa
      e.bolt.visible = e.rayo; (e.glow.material as THREE.SpriteMaterial).opacity = e.rayo ? 0.55 + (RM ? 0 : Math.sin(t * 6 + e.fase) * 0.2) : 0
      if (e.rayo) { e.bolt.rotation.y = RM ? 0.6 : t * 1.8 + e.fase; e.bolt.position.y = 0.5 + (RM ? 0 : Math.sin(t * 3 + e.fase) * 0.04) }
      if (e.sel && e.muere == null) selEnt = e
      const pr = v3.set(e.pos.x, e.pos.y + 0.2, e.pos.z).project(cam)
      if (e.muere == null) hits.push({ id, x: ((pr.x + 1) / 2) * w, y: ((1 - pr.y) / 2) * h })
    }
    o.hits.current = hits
    // selección: onda que se expande + etiqueta con el número
    const sm = seleccion.material as THREE.MeshBasicMaterial
    if (selEnt) {
      const u = RM ? 0.3 : (t % 1.5) / 1.5
      seleccion.position.set(selEnt.pos.x, 0.04, selEnt.pos.z); seleccion.scale.setScalar(0.9 + u * 1.6); sm.opacity = 0.9 * (1 - u)
      if (objSel.parent !== selEnt.g) { objSel.parent?.remove(objSel); selEnt.g.add(objSel) }
      objSel.position.set(0, 0.62, 0); objSel.visible = true; if (etSel.textContent !== selEnt.numero) etSel.textContent = selEnt.numero
    } else { sm.opacity = 0; objSel.visible = false }

    // --- carteles y hub
    pHub.set(`${s.bandeja} en espera · rayo > SLA > prioridad`)
    // HU-067 CA-03: los casos con SLA vencido (ya avisados al líder) aparecen como tarjetas en la mesa de la Sala de Comité, antes
    // que los escalamientos de la Mesa SGD; se pueden tocar como cualquier ticket (abren su ficha)
    const com = s.comite ?? []
    pCom.set(`${com.length} con SLA vencido · ${s.escalados} escalados en cadena`, com.length + s.escalados > 0)
    cartasComite.forEach((c, i) => {
      c.visible = i < com.length + s.escalados; if (c.visible && !RM) c.position.y = 0.8 + Math.sin(t * 2 + i) * 0.02
      if (c.visible && i < com.length) { const pr = v3.copy(c.position).project(cam); hits.push({ id: com[i]!.id, x: ((pr.x + 1) / 2) * w, y: ((1 - pr.y) / 2) * h }) }
    })
    pSal.set(`${s.tickets.filter((x) => x.etapa === 'salida').length} resueltos recientes`)
    // HU-067 CA-01: cada área con sus gestores ocupados sobre el total y los tickets en cola
    for (const z of s.zonas) pZona.get(z.k)?.set(z.total ? `${z.cola} en cola · ${z.ocupados ?? 0}/${z.total} ocupados` : `${z.cola} en cola · ${z.atencion} en atención`, z.riesgo)
    dibujarHub(s, ahora)

    // --- cámara: deriva muy lenta + paralaje con el cursor (apagado con «menos movimiento»)
    pX += (parX - pX) * 0.06; pY += (parY - pY) * 0.06
    const dx = RM ? 0 : Math.sin(t * 0.12) * 0.5 + pX * 0.7, dz = RM ? 0 : Math.cos(t * 0.1) * 0.3 + pY * 0.4
    cam.position.set(CENTRO.x + 30 + dx, 30, CENTRO.z + 30 + dz); cam.lookAt(CENTRO.x + dx * 0.5, 0.2, CENTRO.z + dz * 0.5)

    // --- nombre de la persona bajo el cursor (cada 3 cuadros para no gastar)
    objPers.visible = false
    if (punteroPx && tick % 3 === 0 && !RM) {
      rayo.setFromCamera(new THREE.Vector2((punteroPx[0] / w) * 2 - 1, -(punteroPx[1] / h) * 2 + 1), cam)
      const gs = [...personas.values()].map((p) => p.g)
      const hit = rayo.intersectObjects(gs, true)[0]
      let g = hit?.object as THREE.Object3D | null
      while (g && !g.userData.clave) g = g.parent
      const p = g ? personas.get(g.userData.clave as string) : undefined
      if (p) { objPers.position.set(p.g.position.x, 1.55, p.g.position.z); etPers.textContent = p.nombre; objPers.visible = true; ultimoNombre = p } else ultimoNombre = null
    } else if (ultimoNombre && punteroPx && !RM) { objPers.position.set(ultimoNombre.g.position.x, 1.55, ultimoNombre.g.position.z); objPers.visible = true }

    primera = false
    r.render(escena, cam); etiquetas.render(escena, cam)
  }
  let ultimoNombre: Pers | null = null
  const parar = bucle(RM, frame)

  return () => {
    parar(); ro.disconnect(); canvas.removeEventListener('pointermove', mover); canvas.removeEventListener('pointerleave', salir); canvas.removeEventListener('click', tocar)
    escena.traverse((x) => { const m = x as THREE.Mesh; if (m.isMesh) { m.geometry.dispose(); const mt = m.material; (Array.isArray(mt) ? mt : [mt]).forEach((q) => q.dispose()) } })
    baldosa.dispose(); tex.dispose(); texHub.dispose(); texLista.dispose(); halo.dispose()
    for (const e of entradas.values()) e.dispose()
    glifos.forEach((t) => t.dispose()); pechoBandeja.dispose(); selector.remove()
    r.dispose(); etiquetas.domElement.remove()
  }
}
