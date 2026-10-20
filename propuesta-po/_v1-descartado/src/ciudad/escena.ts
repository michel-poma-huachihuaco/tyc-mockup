import * as THREE from 'three'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import { etiqueta, ponerEtiqueta } from '../etiquetas.ts'
import { GATES, HUB, COM, EXIT, TYPES, slaRestante, type Sim, type Ticket, type Area } from './sim.ts'

const COL = { teal: 0x02424e, teal2: 0x2b616c, orange: 0xf6a42c, bad: 0xc0453a, ok: 0x2e8b57, warn: 0xe39b1c }
const slaCol = (s: Sim, t: Ticket) => {
  const r = slaRestante(s, t) / t.sla
  return t.esc || r < 0 ? COL.bad : r < 0.35 ? COL.warn : COL.ok
}

export type Pick = { k: 'ticket'; t: Ticket } | { k: 'area'; ref: string } | { k: 'gate'; ref: string }

/** Escena isométrica: cámara ortográfica a 45° (x del simulador → X, y → Z, altura → Y). */
export class EscenaCiudad {
  readonly dom: HTMLElement
  private r = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  private l = new CSS2DRenderer()
  private escena = new THREE.Scene()
  private cam = new THREE.OrthographicCamera(-1, 1, 1, -1, -100, 100)
  private ray = new THREE.Raycaster()
  private mat = new Map<number, THREE.MeshLambertMaterial>()
  private tickets = new Map<string, { g: THREE.Group; cubo: THREE.Mesh; sombra: THREE.Mesh; rayo: THREE.Mesh; aro: THREE.Mesh }>()
  private palets = new Map<string, { g: THREE.Group; clave: string }>()
  private personas = new Map<string, { g: THREE.Group; aro: THREE.Mesh }>()
  private pins = new Map<string, CSS2DObject>()
  private areaBox = new Map<string, THREE.Mesh>()
  private pickables: THREE.Object3D[] = []
  private ro: ResizeObserver
  private ancho = 0; private alto = 0
  sel: Ticket | null = null; selArea = 'hub'

  constructor(host: HTMLElement, private s: () => Sim) {
    this.dom = host
    this.r.setPixelRatio(Math.min(2, devicePixelRatio || 1))
    this.r.domElement.setAttribute('role', 'img')
    this.r.domElement.setAttribute('aria-label', 'Ciudad de tickets: canales, bandeja orquestadora y áreas de atención. La misma información está en el panel lateral.')
    this.l.domElement.className = 'etiquetas'
    host.append(this.r.domElement, this.l.domElement)

    const sol = new THREE.DirectionalLight(0xffffff, 2.2); sol.position.set(-6, 14, 9); this.escena.add(sol, new THREE.AmbientLight(0xffffff, 1.35))
    this.cam.position.set(30, 30, 30); this.cam.lookAt(8, 0, 8)
    this.construirMundo()
    this.ro = new ResizeObserver(() => this.ajustar()); this.ro.observe(host)
    this.ajustar()
  }

  private m(c: number) { let x = this.mat.get(c); if (!x) { x = new THREE.MeshLambertMaterial({ color: c }); this.mat.set(c, x) } return x }
  private caja(x: number, y: number, w: number, d: number, h: number, c: number, top?: number) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), top == null ? this.m(c) : [this.m(c), this.m(c), this.m(top), this.m(c), this.m(c), this.m(c)])
    mesh.position.set(x + w / 2, h / 2, y + d / 2)
    this.escena.add(mesh)
    return mesh
  }
  private plano(x0: number, y0: number, x1: number, y1: number, c: number, y = 0.01) {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, y1 - y0), this.m(c))
    p.rotation.x = -Math.PI / 2; p.position.set((x0 + x1) / 2, y, (y0 + y1) / 2); this.escena.add(p)
  }

  private construirMundo() {
    this.plano(-0.4, -0.4, 16.4, 16.4, 0xf7fafb, 0)
    const via = 0xd9e6e9
    ;[[10.7, 0, 11.7, 16.2], [0, 10.6, 16.2, 11.6], [1.8, 0.5, 2.8, 13.8], [2.8, 7.1, HUB.x, 8.1], [7.1, HUB.y + HUB.d, 8.1, 10.6], [8.6, 1.7, 10.7, 2.7], [0, 12.7, 1.8, 13.7]]
      .forEach(([a, b, c, d]) => this.plano(a!, b!, c!, d!, via, 0.02))
    // compuertas (canales)
    for (const G of GATES) {
      const m = this.caja(0, G.y, 1, 1, 0.7, parseInt(G.c.slice(1), 16)); m.userData = { pick: { k: 'gate', ref: G.k } satisfies Pick }; this.pickables.push(m)
      const e = etiqueta(G.n, '', 'canal'); e.position.set(0.5, 0.9, G.y + 0.5); this.escena.add(e)
    }
    // bandeja orquestadora
    const hub = this.caja(HUB.x, HUB.y, HUB.w, HUB.d, 1.9, COL.teal); hub.userData = { pick: { k: 'area', ref: 'hub' } satisfies Pick }; this.pickables.push(hub); this.areaBox.set('hub', hub)
    const flecha = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.1, 4), this.m(COL.orange)); flecha.position.set(HUB.x + HUB.w / 2, 2.5, HUB.y + HUB.d / 2); flecha.rotation.y = Math.PI / 4; this.escena.add(flecha)
    this.pin('hub', HUB.x + HUB.w / 2, 2.9, HUB.y + HUB.d / 2)
    // comité
    const com = this.caja(COM.x, COM.y, COM.w, COM.d, 1.3, 0x8c3a33); com.userData = { pick: { k: 'area', ref: 'com' } satisfies Pick }; this.pickables.push(com); this.areaBox.set('com', com)
    this.pin('com', COM.x + COM.w / 2, 1.7, COM.y + COM.d / 2)
    // cierre
    const ex = this.caja(EXIT.x, EXIT.y, EXIT.w, EXIT.d, 2.2, COL.ok); ex.userData = { pick: { k: 'area', ref: 'exit' } satisfies Pick }; this.pickables.push(ex); this.areaBox.set('exit', ex)
    this.pin('exit', EXIT.x + EXIT.w / 2, 2.6, EXIT.y + EXIT.d / 2)
    // áreas
    for (const A of this.s().areas) {
      const b = this.caja(A.x, A.y, A.w, A.d, 1.25, A.k === 'legal' ? 0x24505a : COL.teal2); b.userData = { pick: { k: 'area', ref: A.k } satisfies Pick }; this.pickables.push(b); this.areaBox.set(A.k, b)
      this.pin(A.k, A.x + A.w / 2, 1.65, A.y + A.d / 2)
      A.gs.forEach((G, i) => {
        const g = new THREE.Group()
        const cuerpo = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.3, 4, 8), this.m(COL.teal2)); cuerpo.position.y = 0.34
        const cab = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 10), this.m(0xf2d3b3)); cab.position.y = 0.78
        const aro = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.035, 6, 20), this.m(COL.orange)); aro.rotation.x = Math.PI / 2; aro.position.y = 0.78; aro.visible = false
        g.add(cuerpo, cab, aro); g.position.set(A.x + 0.4 + i * 0.75, 0, A.y + A.d + 0.45); this.escena.add(g)
        this.personas.set(`${A.k}:${G.n}`, { g, aro })
      })
    }
    // árboles
    for (const [x, y] of [[4.2, 1.2], [4.8, 3.6], [9.8, 4.6], [14.9, 15.2], [6.6, 15.3], [0.8, 15.0], [15.3, 11.9], [3.4, 5.2], [9.9, 9.8]] as const) {
      const g = new THREE.Group()
      const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.5, 6), this.m(0x8a6a4a)); tr.position.y = 0.25
      const co = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), this.m(0x5fb37a)); co.position.y = 0.75
      g.add(tr, co); g.position.set(x, 0, y); this.escena.add(g)
    }
  }

  private pin(k: string, x: number, y: number, z: number) {
    const e = etiqueta('', '', 'pin'); e.position.set(x, y, z); this.escena.add(e); this.pins.set(k, e)
  }

  private boltGeo = (() => {
    const sh = new THREE.Shape(); sh.moveTo(0.1, 0.5); sh.lineTo(-0.2, -0.02); sh.lineTo(-0.02, -0.02); sh.lineTo(-0.12, -0.5); sh.lineTo(0.22, 0.08); sh.lineTo(0.04, 0.08); sh.closePath()
    return new THREE.ExtrudeGeometry(sh, { depth: 0.08, bevelEnabled: false })
  })()

  private nuevoTicket(t: Ticket) {
    const g = new THREE.Group()
    const col = t.drone ? COL.bad : parseInt(TYPES[t.type]!.c.slice(1), 16)
    const cubo = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.42), this.m(col)); cubo.position.y = t.drone ? 1.1 : 0.21
    const sombra = new THREE.Mesh(new THREE.CircleGeometry(0.3, 16), new THREE.MeshBasicMaterial({ color: COL.ok, transparent: true, opacity: 0.85 })); sombra.rotation.x = -Math.PI / 2; sombra.position.y = 0.03
    const rayo = new THREE.Mesh(this.boltGeo, new THREE.MeshBasicMaterial({ color: COL.orange })); rayo.position.y = 0.95; rayo.visible = false; rayo.rotation.y = Math.PI / 4
    const aro = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.04, 6, 24), new THREE.MeshBasicMaterial({ color: COL.orange })); aro.rotation.x = Math.PI / 2; aro.position.y = 0.04; aro.visible = false
    g.add(cubo, rayo, aro); if (!t.drone) g.add(sombra)
    if (!t.drone) { cubo.userData = { pick: { k: 'ticket', t } satisfies Pick }; this.pickables.push(cubo) }
    this.escena.add(g)
    const o = { g, cubo, sombra, rayo, aro }; this.tickets.set(t.id === 'esc' ? `dron${this.tickets.size}${Math.random()}` : t.id, o)
    return o
  }

  private paleta(clave: string, x: number, y: number, tks: Ticket[]) {
    const k = tks.map((t) => t.type + (t.rayo ? '*' : '')).join(',')
    let p = this.palets.get(clave)
    if (p?.clave === k) return
    if (p) { this.escena.remove(p.g); p.g.traverse((o) => { if (o instanceof CSS2DObject) o.element.remove() }) }
    const g = new THREE.Group(); const sz = 0.3; let n = 0
    for (let lv = 0; lv < 3 && n < tks.length; lv++) for (let i = 0; i < 2 && n < tks.length; i++) for (let j = 0; j < 2 && n < tks.length; j++) {
      const c = new THREE.Mesh(new THREE.BoxGeometry(sz, sz, sz), this.m(parseInt(TYPES[tks[n]!.type]!.c.slice(1), 16)))
      c.position.set(x + i * 0.34, lv * sz + sz / 2, y + j * 0.34); g.add(c); n++
    }
    if (tks.length > 12) { const e = etiqueta(`+${tks.length - 12}`, '', 'mas'); e.position.set(x + 0.3, 1.2, y + 0.3); g.add(e) }
    this.escena.add(g); this.palets.set(clave, { g, clave: k })
  }

  /** Sincroniza la escena con el estado de la simulación (una vez por frame). */
  actualizar(now: number) {
    const s = this.s()
    const vivos = new Set<string>()
    // los tickets mantienen su malla por id; los drones se recrean con id propio
    const drones = s.tickets.filter((t) => t.drone)
    for (const k of [...this.tickets.keys()]) if (k.startsWith('dron')) { const o = this.tickets.get(k)!; this.escena.remove(o.g); this.tickets.delete(k) }
    for (const t of s.tickets) {
      if (t.drone) continue
      vivos.add(t.id)
      const o = this.tickets.get(t.id) ?? this.nuevoTicket(t)
      o.g.visible = t.vis
      o.g.position.set(t.x, 0, t.y)
      ;(o.sombra.material as THREE.MeshBasicMaterial).color.setHex(slaCol(s, t))
      o.rayo.visible = t.rayo; o.rayo.position.y = 0.85 + Math.sin(now / 250) * 0.04
      o.aro.visible = t === this.sel
    }
    for (const d of drones) { const o = this.nuevoTicket(d); o.g.position.set(d.x, 0, d.y); o.cubo.position.y = 1.1 + Math.sin(now / 150) * 0.1 }
    for (const [id, o] of this.tickets) if (!id.startsWith('dron') && !vivos.has(id)) {
      this.escena.remove(o.g); this.tickets.delete(id); this.pickables = this.pickables.filter((p) => p !== o.cubo)
    }
    // áreas: palets, personas, pins
    for (const A of s.areas) {
      this.paleta(A.k, A.x + A.w + 0.15, A.y + 0.2, A.q)
      A.gs.forEach((G) => { const p = this.personas.get(`${A.k}:${G.n}`); if (p) { p.aro.visible = !!G.t; ;(p.g.children[0] as THREE.Mesh).material = this.m(G.t ? COL.orange : COL.teal2) } })
      const riesgo = A.q.some((t) => t.esc) || A.gs.some((G) => G.t?.esc)
      const ocup = A.gs.filter((G) => G.t).length
      const e = this.pins.get(A.k); if (e) ponerEtiqueta(e, A.n, `${ocup}/${A.gs.length} gestores · ${A.q.length} en cola`, riesgo ? 'pin riesgo' : 'pin')
    }
    const inbox = s.tickets.filter((t) => t.st === 'bandeja')
    this.paleta('hub', HUB.x + HUB.w - 1.0, HUB.y + HUB.d + 0.25, inbox)
    ponerEtiqueta(this.pins.get('hub')!, HUB.n, `${inbox.length} en espera · rayo > SLA > prioridad`, 'pin')
    ponerEtiqueta(this.pins.get('com')!, COM.n, `${s.escal} escalados`, 'pin riesgo')
    ponerEtiqueta(this.pins.get('exit')!, EXIT.n, `${s.resolved} cerrados`, 'pin ok')
    // área seleccionada: tapa resaltada
    for (const [k, m] of this.areaBox) {
      const sel = k === this.selArea
      m.scale.y = sel ? 1.06 : 1; m.position.y = (m.geometry as THREE.BoxGeometry).parameters.height * m.scale.y / 2
    }
    this.r.render(this.escena, this.cam); this.l.render(this.escena, this.cam)
  }

  elegir(e: PointerEvent): Pick | null {
    const rc = this.r.domElement.getBoundingClientRect()
    this.ray.setFromCamera(new THREE.Vector2(((e.clientX - rc.left) / rc.width) * 2 - 1, -((e.clientY - rc.top) / rc.height) * 2 + 1), this.cam)
    const h = this.ray.intersectObjects(this.pickables, false)[0]
    return (h?.object.userData.pick as Pick | undefined) ?? null
  }

  private ajustar() {
    const rc = this.dom.getBoundingClientRect()
    this.ancho = rc.width; this.alto = rc.height
    if (!this.ancho || !this.alto) return
    this.r.setSize(this.ancho, this.alto, false); this.l.setSize(this.ancho, this.alto)
    // encuadre: el mapa mide ~16×16 u; margen para el HUD a la derecha en escritorio
    const asp = this.ancho / this.alto, ancha = this.ancho > 1050, alto = ancha ? 21 : 24
    const w = alto * asp, dx = ancha ? (330 / this.ancho) * w / 2 : 0 // desplaza el mapa a la izquierda del panel
    this.cam.left = -w / 2 + dx; this.cam.right = w / 2 + dx; this.cam.top = alto / 2; this.cam.bottom = -alto / 2
    this.cam.zoom = 1; this.cam.updateProjectionMatrix()
  }

  destruir() { this.ro.disconnect(); this.r.dispose(); this.dom.replaceChildren() }
  get area(): Area | undefined { return this.s().areas.find((a) => a.k === this.selArea) }
}
