import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { color, type RGB } from './comun.ts'

// Kit de modelos de la oficina: geometrías y materiales compartidos, para que 6 salas, 45 tarjetas y
// una docena de personas cuesten lo mismo que una. Todo mira hacia +Z por defecto (rotation.y = 0).

export const mezcla = (a: RGB, b: RGB, t: number): RGB => a.map((v, i) => Math.round(v + (b[i]! - v) * t))

export const PIELES: RGB[] = [[241, 205, 176], [224, 172, 135], [198, 134, 98], [141, 92, 64], [96, 64, 46]]
export const PELOS: RGB[] = [[40, 30, 26], [78, 52, 36], [150, 104, 60], [28, 28, 32], [196, 160, 100]]
export const hash = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0 }

export class Kit {
  private mats = new Map<string, THREE.MeshStandardMaterial>()
  private geos = new Map<string, THREE.BufferGeometry>()
  constructor(public C: Record<string, RGB>) {}

  mat(c: RGB, o: { r?: number; m?: number; e?: RGB; ei?: number; op?: number } = {}) {
    const k = `${c}|${o.r}|${o.m}|${o.e}|${o.ei}|${o.op}`
    let m = this.mats.get(k)
    if (!m) {
      m = new THREE.MeshStandardMaterial({ color: color(c), roughness: o.r ?? 0.65, metalness: o.m ?? 0.04 })
      if (o.e) { m.emissive = color(o.e); m.emissiveIntensity = o.ei ?? 1 }
      if (o.op != null && o.op < 1) { m.transparent = true; m.opacity = o.op; m.depthWrite = false }
      this.mats.set(k, m)
    }
    return m
  }
  private geo<T extends THREE.BufferGeometry>(k: string, f: () => T): T {
    let g = this.geos.get(k) as T | undefined
    if (!g) { g = f(); this.geos.set(k, g) }
    return g
  }
  caja(w: number, h: number, d: number, r = 0.03) { return this.geo(`rb${w},${h},${d},${r}`, () => new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2))) }
  cil(rt: number, rb: number, h: number, seg = 24) { return this.geo(`cy${rt},${rb},${h},${seg}`, () => new THREE.CylinderGeometry(rt, rb, h, seg)) }
  cap(r: number, l: number) { return this.geo(`cp${r},${l}`, () => new THREE.CapsuleGeometry(r, l, 4, 10)) }
  esf(r: number) { return this.geo(`sp${r}`, () => new THREE.SphereGeometry(r, 18, 14)) }

  /** Aplica sombras a todo el subárbol. */
  static sombrear<T extends THREE.Object3D>(o: T, emite = true, recibe = true): T {
    o.traverse((x) => { if ((x as THREE.Mesh).isMesh) { x.castShadow = emite; x.receiveShadow = recibe } })
    return o
  }

  // ---------------------------------------------------------------- mobiliario
  escritorio(ancho = 1.05, fondo = 0.55) {
    const g = new THREE.Group(), C = this.C
    const madera = this.mat(mezcla(C.superficie!, C.texto!, 0.28), { r: 0.55 }), pata = this.mat(mezcla(C.suelo!, C.texto!, 0.45), { r: 0.4, m: 0.3 })
    const top = new THREE.Mesh(this.caja(ancho, 0.05, fondo, 0.02), madera); top.position.y = 0.72
    g.add(top)
    for (const sx of [-1, 1]) { const p = new THREE.Mesh(this.caja(0.04, 0.7, fondo - 0.08, 0.01), pata); p.position.set(sx * (ancho / 2 - 0.05), 0.35, 0); g.add(p) }
    const faldon = new THREE.Mesh(this.caja(ancho - 0.1, 0.3, 0.025, 0.01), pata); faldon.position.set(0, 0.55, -fondo / 2 + 0.06); g.add(faldon)
    return Kit.sombrear(g)
  }
  silla() {
    const g = new THREE.Group(), C = this.C
    const tela = this.mat(mezcla(C.teal!, C.suelo!, 0.35), { r: 0.85 }), metal = this.mat(mezcla(C.suelo!, C.texto!, 0.35), { r: 0.35, m: 0.6 })
    const base = new THREE.Mesh(this.cil(0.2, 0.2, 0.03, 5), metal); base.position.y = 0.04
    const eje = new THREE.Mesh(this.cil(0.025, 0.025, 0.3, 8), metal); eje.position.y = 0.2
    const asiento = new THREE.Mesh(this.caja(0.42, 0.07, 0.42, 0.03), tela); asiento.position.y = 0.38
    const respaldo = new THREE.Mesh(this.caja(0.4, 0.46, 0.06, 0.03), tela); respaldo.position.set(0, 0.64, -0.2); respaldo.rotation.x = -0.12
    g.add(base, eje, asiento, respaldo)
    return Kit.sombrear(g)
  }
  /** Monitor con pantalla emisiva; devuelve el material de la pantalla para animarlo. */
  monitor(ancho = 0.5, alto = 0.3) {
    const g = new THREE.Group(), C = this.C
    const marco = this.mat(mezcla(C.suelo!, C.texto!, 0.12), { r: 0.35, m: 0.3 })
    const pantalla = new THREE.MeshStandardMaterial({ color: color(mezcla(C.suelo!, C.teal!, 0.4)), emissive: color(C.teal!), emissiveIntensity: 0.35, roughness: 0.25 })
    const cuerpo = new THREE.Mesh(this.caja(ancho, alto, 0.035, 0.012), marco); cuerpo.position.y = 0.2 + alto / 2 + 0.02
    const cara = new THREE.Mesh(new THREE.PlaneGeometry(ancho - 0.04, alto - 0.04), pantalla); cara.position.set(0, cuerpo.position.y, 0.019)
    const pie = new THREE.Mesh(this.cil(0.025, 0.04, 0.2, 10), marco); pie.position.y = 0.12
    const peana = new THREE.Mesh(this.caja(0.2, 0.012, 0.14, 0.006), marco); peana.position.y = 0.018
    g.add(cuerpo, cara, pie, peana)
    Kit.sombrear(g, true, false)
    return { g, pantalla }
  }
  teclado() {
    const g = new THREE.Group()
    const k = new THREE.Mesh(this.caja(0.3, 0.015, 0.1, 0.006), this.mat(mezcla(this.C.suelo!, this.C.texto!, 0.2), { r: 0.5 })); k.position.y = 0.02
    g.add(k); return g
  }
  planta(h = 0.5) {
    const g = new THREE.Group(), C = this.C
    const maceta = new THREE.Mesh(this.cil(0.13, 0.1, 0.2, 14), this.mat(mezcla(C.superficie!, C.texto!, 0.5), { r: 0.7 })); maceta.position.y = 0.1
    const follaje = new THREE.Group(); follaje.position.y = 0.2
    const verde = this.mat(mezcla(C.ok!, C.suelo!, 0.15), { r: 0.8 })
    for (let i = 0; i < 6; i++) {
      const hoja = new THREE.Mesh(this.esf(0.1), verde)
      const a = (i / 6) * Math.PI * 2; hoja.scale.set(0.7, 1.5 + (i % 2) * 0.4, 0.35); hoja.position.set(Math.cos(a) * 0.09, h * 0.35 + (i % 3) * 0.05, Math.sin(a) * 0.09)
      hoja.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5); follaje.add(hoja)
    }
    g.add(maceta, follaje); g.userData.follaje = follaje
    return Kit.sombrear(g, true, false)
  }
  /** Tabique de vidrio con riel superior de color. */
  vidrio(largo: number, eje: 'x' | 'z', c: RGB, alto = 1.25) {
    const g = new THREE.Group()
    const cristal = new THREE.Mesh(this.caja(eje === 'x' ? largo : 0.05, alto, eje === 'z' ? largo : 0.05, 0.01),
      new THREE.MeshPhysicalMaterial({ color: color(mezcla(c, this.C.superficie!, 0.7)), transparent: true, opacity: 0.3, roughness: 0.08, metalness: 0, depthWrite: false, clearcoat: 1 }))
    cristal.position.y = alto / 2
    const riel = new THREE.Mesh(this.caja(eje === 'x' ? largo : 0.08, 0.06, eje === 'z' ? largo : 0.08, 0.02), this.mat(c, { r: 0.4, m: 0.2 }))
    riel.position.y = alto
    const zocalo = new THREE.Mesh(this.caja(eje === 'x' ? largo : 0.08, 0.1, eje === 'z' ? largo : 0.08, 0.02), this.mat(mezcla(c, this.C.suelo!, 0.4), { r: 0.5 }))
    zocalo.position.y = 0.05
    g.add(cristal, riel, zocalo); riel.castShadow = true
    return g
  }

  // ---------------------------------------------------------------- personas
  persona(o: { camisa: RGB; piel: RGB; pelo: RGB; sentado?: boolean; escala?: number }) {
    const g = new THREE.Group(), C = this.C
    const camisa = this.mat(o.camisa, { r: 0.7 }), piel = this.mat(o.piel, { r: 0.6 }), pelo = this.mat(o.pelo, { r: 0.8 }), pant = this.mat(mezcla(C.suelo!, C.texto!, 0.18), { r: 0.75 })
    const yCadera = o.sentado ? 0.46 : 0.5
    const torso = new THREE.Mesh(this.cap(0.15, 0.3), camisa); torso.position.y = yCadera + 0.3
    const cuello = new THREE.Mesh(this.cil(0.045, 0.05, 0.06, 10), piel); cuello.position.y = yCadera + 0.66
    const cabeza = new THREE.Group(); cabeza.position.y = yCadera + 0.79
    const craneo = new THREE.Mesh(this.esf(0.115), piel); craneo.scale.set(0.95, 1.08, 1)
    const casco = new THREE.Mesh(new THREE.SphereGeometry(0.122, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), pelo); casco.position.set(0, 0.02, -0.01); casco.rotation.x = -0.25
    cabeza.add(craneo, casco)
    // brazos: pivote en el hombro
    const brazo = (lado: number) => {
      const p = new THREE.Group(); p.position.set(lado * 0.2, yCadera + 0.56, 0)
      const sup = new THREE.Mesh(this.cap(0.045, 0.2), camisa); sup.position.y = -0.14
      const ant = new THREE.Group(); ant.position.y = -0.27
      const antm = new THREE.Mesh(this.cap(0.04, 0.17), piel); antm.position.y = -0.1
      ant.add(antm); p.add(sup, ant); return { p, ant }
    }
    const bi = brazo(-1), bd = brazo(1)
    const piernas = new THREE.Group()
    if (o.sentado) {
      for (const lado of [-1, 1]) {
        const muslo = new THREE.Mesh(this.cap(0.065, 0.28), pant); muslo.rotation.x = Math.PI / 2; muslo.position.set(lado * 0.09, yCadera - 0.02, 0.17)
        const pierna = new THREE.Mesh(this.cap(0.055, 0.3), pant); pierna.position.set(lado * 0.09, yCadera - 0.24, 0.33)
        piernas.add(muslo, pierna)
      }
    } else {
      for (const lado of [-1, 1]) {
        const pivote = new THREE.Group(); pivote.position.set(lado * 0.085, yCadera, 0)
        const pierna = new THREE.Mesh(this.cap(0.06, 0.38), pant); pierna.position.y = -0.27
        pivote.add(pierna); piernas.add(pivote); g.userData[lado < 0 ? 'pI' : 'pD'] = pivote
      }
    }
    g.add(torso, cuello, cabeza, bi.p, bd.p, piernas)
    g.userData = { ...g.userData, torso, cabeza, brazoI: bi, brazoD: bd, yCadera }
    g.scale.setScalar(o.escala ?? 1.12)
    return Kit.sombrear(g, true, false)
  }

  // ---------------------------------------------------------------- tarjeta de ticket
  tarjeta(banda: RGB) {
    const g = new THREE.Group(), C = this.C
    const papel = this.mat(mezcla(C.superficie!, [255, 255, 255], 0.75), { r: 0.5, e: mezcla(C.superficie!, [255, 255, 255], 0.5), ei: 0.18 })
    const cuerpo = new THREE.Mesh(this.caja(0.56, 0.05, 0.38, 0.025), papel)
    const franja = new THREE.Mesh(this.caja(0.1, 0.056, 0.38, 0.02), this.mat(banda, { r: 0.45, e: banda, ei: 0.25 })); franja.position.x = -0.23
    const lineas = new THREE.Group()
    for (let i = 0; i < 3; i++) { const l = new THREE.Mesh(this.caja(i === 2 ? 0.14 : 0.26, 0.006, 0.026, 0.004), this.mat(mezcla(C.muted!, C.superficie!, 0.4))); l.position.set(0.02 - (i === 2 ? 0.06 : 0), 0.029, -0.09 + i * 0.07); lineas.add(l) }
    g.add(cuerpo, franja, lineas)
    return Kit.sombrear(g, true, false)
  }
}
