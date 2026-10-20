import * as THREE from 'three'
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { bucle, capaEtiquetas, color, css, type RGB } from './comun.ts'

// Red 3D de la «Búsqueda 360». El chunk del artifact calcula la vista (fuentes, datos, estados) y
// mantiene los pulsos y los nodos encendidos en refs; aquí solo se dibuja y se escribe en `pos` la
// posición en pantalla de cada nodo, que es lo que usan sus manejadores de clic y de hover.

interface Fuente { id: string; n: string; d: string; caida: boolean }
interface NodoDato { id: string; n: string; estado: 'ok' | 'restringido' | 'caido'; sem?: boolean; fuentes: string[] }
interface Vista { cliente: { nombre: string }; fuentes: Fuente[]; nodos: NodoDato[] }
interface Pulso { a: string; b: string; t0: number; dur: number; src: string; dst?: string }
type Ref<T> = { current: T }

export interface OptsGrafo {
  canvas: HTMLCanvasElement; host: HTMLElement; color: (token: string) => RGB; reducido: boolean
  vista: Ref<Vista | null>; sel: Ref<string>; sem: Ref<{ hits: unknown[] } | null>; hover: Ref<string | null>
  lit: Ref<Set<string>>; pulsos: Ref<Pulso[]>; t0: Ref<number>; pos: Ref<Record<string, { x: number; y: number; r: number }>>
}

interface NodoEsc { pos: THREE.Vector3; r: number; mesh: THREE.Mesh; halo: THREE.Mesh; et: CSS2DObject; sub?: HTMLElement; txt: HTMLElement; candado?: HTMLElement }

/** Candado del sistema de diseño (mismo trazo que el icono «lock»), delante del nombre del dato restringido (HU-050 CA-07). */
const candado = () => {
  const s = document.createElement('span')
  s.setAttribute('aria-hidden', 'true')
  s.style.cssText = 'display:none;margin-right:3px;vertical-align:-1px'
  s.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.75 10.75h10.5a2 2 0 0 1 2 2v5.5a2 2 0 0 1-2 2H6.75a2 2 0 0 1-2-2v-5.5a2 2 0 0 1 2-2Z"/><path d="M8.25 10.5V7.75a3.75 3.75 0 0 1 7.5 0v2.75"/></svg>'
  return s
}

export function montarGrafo(o: OptsGrafo): () => void {
  const { canvas, host } = o
  const T = {
    bad: o.color('feedback-danger-border'), restringido: o.color('feedback-warning-border'), naranja: o.color('secondary-400'), borde: o.color('border-default'), src: o.color('primary-500'),
    texto: o.color('fg-default'), mudo: o.color('fg-muted'), superficie: o.color('bg-surface'), apagado: o.color('bg-surface-sunken'),
    enlace: o.color('fg-link'), centro: o.color('primary-900'),
  }
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  r.setPixelRatio(Math.min(2, devicePixelRatio || 1))
  const etiquetas = capaEtiquetas(host)
  const escena = new THREE.Scene()
  const cam = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
  cam.position.set(0, -4, 17); cam.lookAt(0, 0, 0)
  const ctl = new OrbitControls(cam, canvas)
  ctl.enableZoom = false; ctl.enablePan = false; ctl.enableDamping = true
  ctl.minPolarAngle = Math.PI * 0.3; ctl.maxPolarAngle = Math.PI * 0.7
  ctl.minAzimuthAngle = -0.9; ctl.maxAzimuthAngle = 0.9
  ctl.autoRotate = !o.reducido; ctl.autoRotateSpeed = 0.5
  ctl.addEventListener('start', () => { ctl.autoRotate = false })

  const nodos = new Map<string, NodoEsc>()
  const aristas: { linea: THREE.Line; mat: THREE.LineBasicMaterial; a: string; b: string; fuente?: string; dato?: string }[] = []
  let firma = ''
  const grupo = new THREE.Group(); escena.add(grupo)
  const centro = { mesh: new THREE.Mesh(new THREE.SphereGeometry(0.75, 24, 18), new THREE.MeshBasicMaterial({ color: color(T.naranja) })), halo: new THREE.Mesh(new THREE.SphereGeometry(1.1, 24, 18), new THREE.MeshBasicMaterial({ color: color(T.naranja), transparent: true, opacity: 0.25, depthWrite: false })) }
  const etCentro = document.createElement('div'); etCentro.style.cssText = 'pointer-events:none;text-align:center;line-height:1.2'
  const ini = document.createElement('b'); ini.style.cssText = `display:block;font:800 16px Montserrat,system-ui,sans-serif;color:${css(T.centro)}`
  etCentro.append(ini)
  const objCentro = new CSS2DObject(etCentro); objCentro.position.set(0, 0, 0.9)
  const etNom = document.createElement('div'); etNom.style.cssText = `pointer-events:none;font:700 11px Montserrat,system-ui,sans-serif;white-space:nowrap;color:${css(T.texto)}`
  const objNom = new CSS2DObject(etNom); objNom.position.set(0, -1.4, 0)
  escena.add(centro.mesh, centro.halo, objCentro, objNom)

  const R1 = 3.3, R2 = 6.4
  const construir = (v: Vista) => {
    grupo.clear(); nodos.clear(); aristas.length = 0
    const nuevo = (id: string, p: THREE.Vector3, rad: number, c: RGB, texto: string, sub?: string, lado: 'arriba' | 'abajo' | 'der' | 'izq' = 'arriba') => {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(rad, 18, 14), new THREE.MeshBasicMaterial({ color: color(c) }))
      const halo = new THREE.Mesh(new THREE.SphereGeometry(rad * 1.9, 16, 12), new THREE.MeshBasicMaterial({ color: color(T.naranja), transparent: true, opacity: 0.2, depthWrite: false }))
      mesh.position.copy(p); halo.position.copy(p); halo.visible = false
      const el = document.createElement('div'); el.style.cssText = 'pointer-events:none;text-align:center;line-height:1.2;white-space:nowrap'
      const b = document.createElement('b'); b.style.cssText = 'display:block;font:700 11px Montserrat,system-ui,sans-serif'; b.textContent = texto; el.append(b)
      let s: HTMLElement | undefined
      if (sub != null) { s = document.createElement('small'); s.style.cssText = 'display:block;font:500 9.5px Montserrat,system-ui,sans-serif'; s.textContent = sub; el.append(s) }
      const et = new CSS2DObject(el)
      if (lado === 'der' || lado === 'izq') { et.position.set(p.x + (lado === 'der' ? 1 : -1) * (rad + 0.2), p.y, p.z); et.center.set(lado === 'der' ? 0 : 1, 0.5); el.style.textAlign = lado === 'der' ? 'left' : 'right' }
      else { et.position.set(p.x, p.y + (lado === 'arriba' ? 1 : -1) * (rad + 0.45), p.z) }
      grupo.add(mesh, halo, et); nodos.set(id, { pos: p, r: rad, mesh, halo, et, sub: s, txt: b })
    }
    v.fuentes.forEach((s, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / v.fuentes.length + 0.2
      nuevo(s.id, new THREE.Vector3(Math.cos(a) * R1 * 1.15, Math.sin(a) * R1, i % 2 ? 0.7 : -0.7), 0.42, T.src, s.n, s.d)
    })
    v.nodos.forEach((d, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / v.nodos.length + 0.1
      const cx = Math.cos(a), lado = cx > 0.3 ? 'der' : cx < -0.3 ? 'izq' : Math.sin(a) > 0 ? 'arriba' : 'abajo'
      nuevo(d.id, new THREE.Vector3(cx * R2 * 1.05, Math.sin(a) * R2 * 0.8, ((i % 3) - 1) * 1.1), 0.26, T.apagado, d.n, undefined, lado)
      const n = nodos.get(d.id)!
      n.candado = candado(); n.txt.prepend(n.candado)
    })
    const posDe = (id: string) => (id === 'c' ? new THREE.Vector3() : nodos.get(id)!.pos)
    const arista = (a: string, b: string, extra: { fuente?: string; dato?: string }) => {
      const A = posDe(a), B = posDe(b), m = A.clone().add(B).multiplyScalar(0.5); m.x += (B.y - A.y) * 0.08; m.y -= (B.x - A.x) * 0.08
      const curva = new THREE.QuadraticBezierCurve3(A, m, B)
      const mat = new THREE.LineBasicMaterial({ color: color(T.borde), transparent: true, opacity: 0.3 })
      const linea = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curva.getPoints(24)), mat)
      grupo.add(linea); aristas.push({ linea, mat, a, b, ...extra })
    }
    v.fuentes.forEach((s) => arista('c', s.id, { fuente: s.id }))
    v.nodos.forEach((d) => d.fuentes.forEach((s) => arista(s, d.id, { fuente: s, dato: d.id })))
  }

  // --- pulsos: una esfera por pulso, reutilizada mientras el arreglo del chunk no cambie
  let pulsosRef: Pulso[] | null = null
  let esferas: THREE.Mesh[] = []
  const geoPulso = new THREE.SphereGeometry(0.1, 10, 8)
  const matOk = new THREE.MeshBasicMaterial({ color: color(T.naranja) }), matCaida = new THREE.MeshBasicMaterial({ color: color(T.bad) })
  const punto = (p: Pulso, t: number, out: THREE.Vector3) => {
    const A = p.a === 'c' ? new THREE.Vector3() : nodos.get(p.a)!.pos, B = nodos.get(p.b)!.pos
    const mx = (A.x + B.x) / 2 + (B.y - A.y) * 0.08, my = (A.y + B.y) / 2 - (B.x - A.x) * 0.08, u = 1 - t
    return out.set(u * u * A.x + 2 * u * t * mx + t * t * B.x, u * u * A.y + 2 * u * t * my + t * t * B.y, u * u * A.z + t * t * B.z)
  }

  const ajustar = () => {
    const w = host.clientWidth
    if (!w) return
    const h = Math.max(420, Math.min(640, Math.round(w * 0.7)))
    canvas.style.height = `${h}px`
    r.setSize(w, h, false); etiquetas.setSize(w, h)
    cam.aspect = w / h; cam.position.setLength(w < 560 ? 30 : w < 800 ? 22 : 17); cam.updateProjectionMatrix()
  }
  const ro = new ResizeObserver(ajustar); ro.observe(host); ajustar()

  const tmp = new THREE.Vector3()
  const frame = (ahora: number) => {
    const v = o.vista.current
    if (!v) return
    const f = v.fuentes.map((s) => s.id).join() + '|' + v.nodos.map((n) => n.id).join()
    if (f !== firma) { firma = f; construir(v) }
    const caida = (id: string) => v.fuentes.find((s) => s.id === id)?.caida
    const el = ahora - o.t0.current
    const lit = o.lit.current

    // pulsos
    if (pulsosRef !== o.pulsos.current) {
      esferas.forEach((e) => escena.remove(e)); pulsosRef = o.pulsos.current
      esferas = pulsosRef.map((p) => { const m = new THREE.Mesh(geoPulso, caida(p.src) ? matCaida : matOk); m.visible = false; escena.add(m); return m })
    }
    pulsosRef.forEach((p, i) => {
      const t = (el - p.t0) / p.dur
      if (t > 1 && p.dst && !caida(p.src)) lit.add(p.dst)
      const m = esferas[i]!
      m.visible = t >= 0 && t <= 1 && !o.reducido
      if (m.visible) punto(p, t, m.position)
    })

    // aristas
    for (const a of aristas) {
      const hl = a.dato && (o.sel.current === a.dato || o.hover.current === a.dato)
      a.mat.color.copy(color(caida(a.fuente ?? '') ? T.bad : hl ? T.naranja : a.dato ? T.borde : T.src))
      a.mat.opacity = hl ? 0.95 : a.dato ? 0.35 : 0.5
    }
    // fuentes
    for (const s of v.fuentes) {
      const n = nodos.get(s.id)!
      ;(n.mesh.material as THREE.MeshBasicMaterial).color.copy(color(s.caida ? T.bad : T.src))
      n.txt.style.color = css(T.texto)
      if (n.sub) { n.sub.style.color = css(s.caida ? T.bad : T.mudo); const t = s.caida ? 'no disponible' : s.d; if (n.sub.textContent !== t) n.sub.textContent = t }
    }
    // datos
    for (const d of v.nodos) {
      const n = nodos.get(d.id)!
      const restringido = d.estado === 'restringido', malo = d.estado !== 'ok', on = lit.has(d.id) && !malo
      const sel = o.sel.current === d.id || o.hover.current === d.id, sem = !!o.sem.current?.hits.length && !!d.sem
      ;(n.mesh.material as THREE.MeshBasicMaterial).color.copy(color(restringido ? T.restringido : malo ? T.bad : on ? T.enlace : T.apagado))
      n.mesh.scale.setScalar(1 + (sel ? 0.45 : 0) + (sem ? 0.25 : 0))
      n.halo.visible = on; n.halo.scale.setScalar(1 + (o.reducido ? 0 : Math.sin(ahora / 300 + n.pos.x) * 0.08))
      n.txt.style.color = css(restringido ? T.mudo : malo ? T.bad : on || sel ? T.texto : T.mudo)
      if (n.candado) n.candado.style.display = restringido ? 'inline-block' : 'none'
      n.txt.style.fontWeight = sel ? '800' : '700'
    }
    ini.textContent = v.cliente.nombre.split(' ').slice(0, 2).map((p) => p[0]).join('')
    etNom.textContent = v.cliente.nombre
    centro.halo.scale.setScalar(1 + (o.reducido ? 0 : Math.sin(ahora / 400) * 0.1))

    ctl.update()
    r.render(escena, cam); etiquetas.render(escena, cam)

    // posiciones en pantalla para el clic y el hover del chunk
    const w = canvas.clientWidth, h = canvas.clientHeight, pos: Record<string, { x: number; y: number; r: number }> = {}
    const pr = (p: THREE.Vector3, rad: number) => { tmp.copy(p).project(cam); return { x: ((tmp.x + 1) / 2) * w, y: ((1 - tmp.y) / 2) * h, r: rad } }
    pos.c = pr(new THREE.Vector3(), 26)
    nodos.forEach((n, id) => { pos[id] = pr(n.pos, n.r > 0.3 ? 13 : 8) })
    o.pos.current = pos
  }
  const parar = bucle(o.reducido, frame)

  return () => {
    parar(); ro.disconnect(); ctl.dispose(); r.dispose(); etiquetas.domElement.remove()
    matOk.dispose(); matCaida.dispose(); geoPulso.dispose()
  }
}
