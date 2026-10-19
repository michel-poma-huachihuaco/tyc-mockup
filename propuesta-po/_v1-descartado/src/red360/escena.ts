import * as THREE from 'three'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { etiqueta } from '../etiquetas.ts'
import { SOURCES, DATA, CLIENTS, SEM, bloqueado, caido, latencia, tiempoTotal, type Cliente } from './datos.ts'

const C = { orange: 0xf6a42c, bad: 0xc0453a, src: 0x7fc4cf, edge: 0x9ed3db, white: 0xffffff, dim: 0x5d8d96 }
interface Nodo { mesh: THREE.Mesh; halo: THREE.Mesh; pos: THREE.Vector3; r: number; et: CSS2DObject }
interface Pulso { curva: THREE.QuadraticBezierCurve3; t0: number; dur: number; src: string; dst?: string; m: THREE.Mesh }
interface Arista { linea: THREE.Line; a: string; b: string; fuente?: string; dato?: string }

/** Red 3D de la consulta 360: el cliente al centro, fuentes en un anillo y datos en otro, con profundidad. */
export class EscenaRed {
  cliente: Cliente = CLIENTS[0]!
  rol = 'gestor'
  caida: string | null = null
  sel: string | null = 'lote'
  semHit: string | null = null
  lit: Record<string, boolean> = {}
  estado = 'listo para consultar'
  onCambio: () => void = () => {}

  private r = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  private l = new CSS2DRenderer()
  private escena = new THREE.Scene()
  private cam = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
  private ctl: OrbitControls
  private ray = new THREE.Raycaster()
  private nodos = new Map<string, Nodo>()
  private aristas: Arista[] = []
  private pulsos: Pulso[] = []
  private t0 = 0
  private hover: string | null = null
  private ro: ResizeObserver
  private fin: number | undefined
  private centro: THREE.Mesh; private centroHalo: THREE.Mesh; private centroEt: CSS2DObject; private centroNom: CSS2DObject

  constructor(private host: HTMLElement, private reducido: boolean) {
    this.r.setPixelRatio(Math.min(2, devicePixelRatio || 1))
    this.r.domElement.setAttribute('role', 'img')
    this.r.domElement.setAttribute('aria-label', 'Red de consulta 360 del cliente: ocho sistemas de origen y dieciséis datos. El detalle de cada dato está en el panel lateral.')
    this.l.domElement.className = 'etiquetas'
    host.prepend(this.r.domElement, this.l.domElement)
    this.cam.position.set(0, -5.5, 15); this.cam.lookAt(0, 0.6, 0)
    this.ctl = new OrbitControls(this.cam, this.l.domElement)
    this.ctl.target.set(0, 0.6, 0); this.ctl.enableZoom = false; this.ctl.enablePan = false; this.ctl.enableDamping = true
    this.ctl.minPolarAngle = Math.PI * 0.28; this.ctl.maxPolarAngle = Math.PI * 0.72
    this.ctl.minAzimuthAngle = -0.9; this.ctl.maxAzimuthAngle = 0.9
    this.ctl.autoRotate = !reducido; this.ctl.autoRotateSpeed = 0.6
    this.ctl.addEventListener('start', () => { this.ctl.autoRotate = false })

    this.centro = new THREE.Mesh(new THREE.SphereGeometry(0.75, 24, 18), new THREE.MeshBasicMaterial({ color: C.orange }))
    this.centroHalo = new THREE.Mesh(new THREE.SphereGeometry(1.1, 24, 18), new THREE.MeshBasicMaterial({ color: C.orange, transparent: true, opacity: 0.2, depthWrite: false }))
    this.centroEt = etiqueta('', '', 'ini'); this.centroEt.position.set(0, 0, 0.9)
    this.centroNom = etiqueta('', '', 'nom'); this.centroNom.position.set(0, -1.35, 0)
    this.escena.add(this.centro, this.centroHalo, this.centroEt, this.centroNom)
    this.construir()
    this.ro = new ResizeObserver(() => this.ajustar()); this.ro.observe(host)
    this.ajustar(); this.fijarCliente(this.cliente)
  }

  private construir() {
    const R1 = 3.2, R2 = 6.3
    SOURCES.forEach((s, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / SOURCES.length + 0.2
      this.nodo(s.id, new THREE.Vector3(Math.cos(a) * R1 * 1.15, Math.sin(a) * R1, i % 2 ? 0.7 : -0.7), 0.42, C.src, s.n, 'src')
    })
    DATA.forEach((d, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / DATA.length + 0.1
      this.nodo(d.id, new THREE.Vector3(Math.cos(a) * R2, Math.sin(a) * R2 * 0.8, (i % 3 - 1) * 1.1), 0.26, C.dim, d.n, 'dato')
    })
    const arista = (a: string, b: string, extra: Partial<Arista>) => {
      const A = this.pos(a), B = this.pos(b)
      const m = A.clone().add(B).multiplyScalar(0.5); m.x += (B.y - A.y) * 0.08; m.y -= (B.x - A.x) * 0.08
      const curva = new THREE.QuadraticBezierCurve3(A, m, B)
      const linea = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curva.getPoints(24)), new THREE.LineBasicMaterial({ color: C.edge, transparent: true, opacity: 0.25 }))
      this.escena.add(linea); this.aristas.push({ linea, a, b, ...extra }); return curva
    }
    SOURCES.forEach((s) => arista('c', s.id, { fuente: s.id }))
    DATA.forEach((d) => d.s.forEach((s) => arista(s, d.id, { fuente: s, dato: d.id })))
  }

  private pos(id: string) { return id === 'c' ? new THREE.Vector3(0, 0, 0) : this.nodos.get(id)!.pos }
  private nodo(id: string, pos: THREE.Vector3, r: number, color: number, texto: string, clase: string) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 14), new THREE.MeshBasicMaterial({ color }))
    const halo = new THREE.Mesh(new THREE.SphereGeometry(r * 1.9, 16, 12), new THREE.MeshBasicMaterial({ color: C.orange, transparent: true, opacity: 0.18, depthWrite: false }))
    mesh.position.copy(pos); halo.position.copy(pos); halo.visible = false
    mesh.userData = { dato: clase === 'dato' ? id : null }
    const et = etiqueta(texto, clase === 'src' ? SOURCES.find((s) => s.id === id)!.d : '', clase); et.position.set(pos.x, pos.y + r + 0.45, pos.z)
    this.escena.add(mesh, halo, et); this.nodos.set(id, { mesh, halo, pos, r, et })
  }

  fijarCliente(c: Cliente) {
    this.cliente = c
    for (const [o, t, k] of [[this.centroEt, c.ini, 'ini'], [this.centroNom, c.n, 'nom']] as const) {
      o.element.className = `et ${k}`
      const b = document.createElement('b'); b.textContent = t; o.element.replaceChildren(b)
    }
  }

  /** Lanza la consulta: un pulso centro → cada fuente y luego fuente → dato (latencia por sistema). */
  consultar(q: string) {
    this.lit = {}; this.t0 = performance.now(); this.semHit = null
    for (const p of this.pulsos) this.escena.remove(p.m)
    this.pulsos = []
    const qq = q.toLowerCase().trim()
    const sem = SEM.find((x) => qq && x.q.split(' ').filter((w) => w.length > 3).some((w) => qq.includes(w)))
    if (sem) this.semHit = sem.hit
    const nuevo = (a: string, b: string, t0: number, dur: number, src: string, dst?: string) => {
      const A = this.pos(a), B = this.pos(b)
      const m = A.clone().add(B).multiplyScalar(0.5); m.x += (B.y - A.y) * 0.08; m.y -= (B.x - A.x) * 0.08
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), new THREE.MeshBasicMaterial({ color: src === this.caida ? C.bad : C.orange }))
      mesh.visible = false; this.escena.add(mesh)
      this.pulsos.push({ curva: new THREE.QuadraticBezierCurve3(A, m, B), t0, dur, src, dst, m: mesh })
    }
    for (const s of SOURCES) nuevo('c', s.id, 0, latencia(s.id, this.caida) * 0.55, s.id)
    for (const d of DATA) for (const s of d.s) { const lat = latencia(s, this.caida); nuevo(s, d.id, lat * 0.55, lat * 0.45 + 120, s, d.id) }
    const tot = tiempoTotal(this.caida)
    this.estado = 'consultando…'
    if (this.fin) clearTimeout(this.fin)
    const terminar = () => {
      for (const d of DATA) if (!caido(d, this.caida)) this.lit[d.id] = true
      this.estado = `respuesta en ${(tot / 1000).toFixed(2)} s · ${this.caida ? '1 fuente no disponible' : '8 fuentes en línea'}`
      if (this.semHit) this.sel = this.semHit
      this.onCambio()
    }
    if (this.reducido) terminar()
    else this.fin = window.setTimeout(terminar, tot + 200)
    if (!this.semHit) this.sel ??= 'lote'
    this.onCambio()
  }

  actualizar(now: number) {
    const el = now - this.t0
    for (const p of this.pulsos) {
      const t = (el - p.t0) / p.dur
      if (t > 1 && p.dst && p.src !== this.caida && !this.lit[p.dst]) this.lit[p.dst] = true
      p.m.visible = t >= 0 && t <= 1 && !this.reducido
      if (p.m.visible) p.m.position.copy(p.curva.getPoint(t))
    }
    for (const a of this.aristas) {
      const hl = a.dato && (this.sel === a.dato || this.hover === a.dato)
      const mat = a.linea.material as THREE.LineBasicMaterial
      mat.color.setHex(a.fuente === this.caida ? C.bad : hl ? C.orange : C.edge)
      mat.opacity = hl ? 0.95 : a.dato ? 0.22 : 0.4
    }
    for (const s of SOURCES) {
      const n = this.nodos.get(s.id)!; const dn = s.id === this.caida
      ;(n.mesh.material as THREE.MeshBasicMaterial).color.setHex(dn ? C.bad : C.src)
      n.et.element.classList.toggle('caida', dn)
      const sm = n.et.element.querySelector('small'); const txt = dn ? 'no disponible' : s.d
      if (sm && sm.textContent !== txt) sm.textContent = txt
    }
    for (const d of DATA) {
      const n = this.nodos.get(d.id)!
      const lk = bloqueado(d, this.rol), dn = caido(d, this.caida), on = !!this.lit[d.id] && !lk && !dn, sel = this.sel === d.id || this.hover === d.id
      const mat = n.mesh.material as THREE.MeshBasicMaterial
      mat.color.setHex(lk || dn ? C.bad : on ? C.white : C.dim)
      const k = 1 + (sel ? 0.45 : 0) + (this.semHit === d.id ? 0.25 : 0)
      n.mesh.scale.setScalar(k)
      n.halo.visible = on; n.halo.scale.setScalar(1 + (this.reducido ? 0 : Math.sin(now / 300 + n.pos.x) * 0.08))
      n.et.element.classList.toggle('on', on || sel); n.et.element.classList.toggle('bloq', lk || dn)
    }
    this.centroHalo.scale.setScalar(1 + (this.reducido ? 0 : Math.sin(now / 400) * 0.1))
    this.ctl.update()
    this.r.render(this.escena, this.cam); this.l.render(this.escena, this.cam)
  }

  elegir(e: PointerEvent): string | null {
    const rc = this.r.domElement.getBoundingClientRect()
    this.ray.setFromCamera(new THREE.Vector2(((e.clientX - rc.left) / rc.width) * 2 - 1, -((e.clientY - rc.top) / rc.height) * 2 + 1), this.cam)
    const metas = DATA.map((d) => this.nodos.get(d.id)!.mesh)
    const h = this.ray.intersectObjects(metas, false)[0]
    return (h?.object.userData.dato as string | null | undefined) ?? null
  }
  setHover(id: string | null) { this.hover = id }

  private ajustar() {
    const rc = this.host.getBoundingClientRect()
    if (!rc.width || !rc.height) return
    this.r.setSize(rc.width, rc.height, false); this.l.setSize(rc.width, rc.height)
    this.cam.aspect = rc.width / rc.height
    // en pantallas estrechas se aleja la cámara para que entre el anillo de datos
    this.cam.position.z = rc.width < 560 ? 30 : rc.width < 800 ? 23 : 19
    this.cam.updateProjectionMatrix()
  }

  destruir() { this.ro.disconnect(); this.ctl.dispose(); this.r.dispose(); if (this.fin) clearTimeout(this.fin) }
}
