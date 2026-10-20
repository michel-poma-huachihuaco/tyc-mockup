import * as THREE from 'three'
import { color, css, type RGB } from './comun.ts'
import { Kit, mezcla } from './modelos.ts'
import { animarRobotBase, crearRobot } from './robots.ts'

// Entradas automatizadas de «Vista en vivo»: sustituyen a los operadores humanos de los canales (Call center,
// WhatsApp, Correo, Mi Portal y Formulario simple). Hay cinco estilos intercambiables para comparar.

export type EstiloEntrada = 'terminal' | 'dispensador' | 'orbe' | 'minibot' | 'portal'
export const ESTILOS: { id: EstiloEntrada; n: string; d: string }[] = [
  { id: 'terminal', n: 'Terminales', d: 'Quioscos con pantalla que muestran el canal y sueltan el ticket' },
  { id: 'dispensador', n: 'Turneros', d: 'Dispensadores de turno que imprimen la tarjeta del ticket' },
  { id: 'orbe', n: 'Orbes', d: 'Esferas holográficas con el icono del canal y anillos orbitando' },
  { id: 'minibot', n: 'Mini-bots', d: 'Robots pequeños, uno por canal, con el icono en el pecho' },
  { id: 'portal', n: 'Portales', d: 'Arcos de datos por donde «entra» cada solicitud' },
]

export interface Entrada { g: THREE.Group; spawn: THREE.Vector3; update: (t: number, pulso: number, reducido: boolean) => void; dispose: () => void }

// ------------------------------------------------------------------ iconos de canal (texturas)
export function glifo(k: string, tinta: RGB, fondo: RGB): THREE.CanvasTexture {
  const c = document.createElement('canvas'); c.width = c.height = 128
  const x = c.getContext('2d')!
  x.fillStyle = css(fondo); x.fillRect(0, 0, 128, 128)
  x.strokeStyle = css(tinta); x.fillStyle = css(tinta); x.lineWidth = 9; x.lineCap = 'round'; x.lineJoin = 'round'
  const rr = (px: number, py: number, w: number, h: number, r: number) => { x.beginPath(); x.roundRect(px, py, w, h, r) }
  if (k === 'tel') { // auricular con micrófono
    x.beginPath(); x.arc(64, 68, 34, Math.PI, 0); x.stroke()
    rr(22, 62, 18, 34, 8); x.fill(); rr(88, 62, 18, 34, 8); x.fill()
    x.beginPath(); x.moveTo(97, 96); x.quadraticCurveTo(97, 112, 70, 112); x.stroke()
  } else if (k === 'wa') { // globo de chat con tres puntos
    rr(18, 24, 92, 66, 24); x.stroke()
    x.beginPath(); x.moveTo(40, 88); x.lineTo(30, 110); x.lineTo(62, 90); x.stroke()
    ;[44, 64, 84].forEach((cx) => { x.beginPath(); x.arc(cx, 57, 5.5, 0, 7); x.fill() })
  } else if (k === 'mail') { // sobre
    rr(16, 32, 96, 66, 10); x.stroke()
    x.beginPath(); x.moveTo(20, 40); x.lineTo(64, 72); x.lineTo(108, 40); x.stroke()
  } else if (k === 'portal') { // ventana de navegador
    rr(16, 24, 96, 80, 12); x.stroke()
    x.lineWidth = 6; x.beginPath(); x.moveTo(18, 48); x.lineTo(110, 48); x.stroke()
    ;[30, 44, 58].forEach((cx) => { x.beginPath(); x.arc(cx, 36, 3.5, 0, 7); x.fill() })
    x.lineWidth = 7; x.beginPath(); x.arc(64, 78, 15, 0, 7); x.moveTo(49, 78); x.lineTo(79, 78); x.stroke()
  } else { // formulario / QR
    x.lineWidth = 7
    ;[[22, 22], [78, 22], [22, 78]].forEach(([px, py]) => { rr(px!, py!, 30, 30, 5); x.stroke(); x.fillRect(px! + 9, py! + 9, 12, 12) })
    ;[[78, 78], [98, 78], [78, 98], [98, 98], [88, 88]].forEach(([px, py]) => x.fillRect(px!, py!, 11, 11))
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4
  return t
}

const ease = (u: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, u)), 3)

export function crearEntrada(estilo: EstiloEntrada, k: string, col: RGB, kit: Kit, tex: THREE.Texture, fase: number): Entrada {
  const C = kit.C, g = new THREE.Group()
  const oscuro = mezcla(C.suelo!, [0, 0, 0], 0.4), metal = mezcla(C.suelo!, C.texto!, 0.35), cuerpo = mezcla(C.superficie!, C.suelo!, 0.35)
  const propios: { dispose: () => void }[] = []
  const emis = (c: RGB, i = 1) => { const m = new THREE.MeshStandardMaterial({ color: color(c), emissive: color(c), emissiveIntensity: i, roughness: 0.35 }); propios.push(m); return m }
  const basico = (map: THREE.Texture, op = 1) => { const m = new THREE.MeshBasicMaterial({ map, transparent: op < 1, opacity: op, toneMapped: false }); propios.push(m); return m }
  const base = new THREE.Mesh(kit.cil(0.4, 0.44, 0.05, 32), kit.mat(oscuro, { r: 0.5, m: 0.4 })); base.position.y = 0.025; g.add(base)
  const aroM = new THREE.MeshBasicMaterial({ color: color(col), transparent: true, opacity: 0.8 }); propios.push(aroM)
  const aro = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.02, 8, 48), aroM); aro.rotation.x = Math.PI / 2; aro.position.y = 0.055; g.add(aro)
  let spawn = new THREE.Vector3(0, 0.9, 0.2)
  let anima: (t: number, act: number, reducido: boolean) => void = () => {}

  if (estilo === 'terminal') {
    const cab = new THREE.Mesh(kit.caja(0.62, 1.32, 0.42, 0.06), kit.mat(cuerpo, { r: 0.4, m: 0.25 })); cab.position.y = 0.72; g.add(cab)
    const marco = new THREE.Mesh(kit.caja(0.5, 0.62, 0.03, 0.02), kit.mat(oscuro, { r: 0.2, m: 0.5 })); marco.position.set(0, 1.0, 0.215); g.add(marco)
    const pantM = basico(tex); const pant = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.44), pantM); pant.position.set(0, 1.06, 0.234); g.add(pant)
    const barra = new THREE.Mesh(kit.caja(0.5, 0.05, 0.05, 0.02), emis(col, 1.2)); barra.position.set(0, 1.4, 0.2); g.add(barra)
    const ranura = new THREE.Mesh(kit.caja(0.34, 0.05, 0.07, 0.02), kit.mat(oscuro)); ranura.position.set(0, 0.62, 0.2); g.add(ranura)
    const luz = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.02), new THREE.MeshBasicMaterial({ color: color(col) })); luz.position.set(0, 0.6, 0.236); g.add(luz); propios.push(luz.material as THREE.Material)
    const boton = new THREE.Mesh(kit.cil(0.045, 0.045, 0.02, 16), emis(col, 0.9)); boton.rotation.x = Math.PI / 2; boton.position.set(0, 0.78, 0.225); g.add(boton)
    spawn = new THREE.Vector3(0, 0.62, 0.35)
    anima = (t, act, rm) => {
      const m = barra.material as THREE.MeshStandardMaterial; m.emissiveIntensity = 0.9 + act * 1.6 + (rm ? 0 : Math.sin(t * 3 + fase) * 0.2)
      pantM.opacity = 1; luz.scale.x = 0.6 + act * 0.4; boton.position.z = 0.225 - act * 0.012
    }
  } else if (estilo === 'dispensador') {
    const mastil = new THREE.Mesh(kit.cil(0.09, 0.12, 0.62, 14), kit.mat(metal, { r: 0.35, m: 0.6 })); mastil.position.y = 0.35; g.add(mastil)
    const cab = new THREE.Mesh(kit.caja(0.52, 0.66, 0.4, 0.08), kit.mat(mezcla(col, C.suelo!, 0.35), { r: 0.4, m: 0.2 })); cab.position.y = 0.98; g.add(cab)
    const tope = new THREE.Mesh(kit.caja(0.46, 0.08, 0.34, 0.03), emis(col, 0.8)); tope.position.y = 1.35; g.add(tope)
    const marco = new THREE.Mesh(kit.caja(0.34, 0.34, 0.02, 0.02), kit.mat(oscuro, { r: 0.2, m: 0.5 })); marco.position.set(0, 1.08, 0.205); g.add(marco)
    const pant = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.3), basico(tex)); pant.position.set(0, 1.08, 0.218); g.add(pant)
    const boton = new THREE.Mesh(kit.cil(0.065, 0.065, 0.03, 20), emis([255, 80, 70], 0.8)); boton.rotation.x = Math.PI / 2; boton.position.set(0, 0.88, 0.215); g.add(boton)
    const ranura = new THREE.Mesh(kit.caja(0.3, 0.035, 0.08, 0.015), kit.mat(oscuro)); ranura.position.set(0, 0.74, 0.2); g.add(ranura)
    const tira = new THREE.Mesh(kit.caja(0.2, 0.008, 0.3, 0.003), kit.mat([250, 250, 250], { r: 0.8 })); tira.position.set(0, 0.74, 0.2); tira.scale.z = 0.05; g.add(tira)
    const franja = new THREE.Mesh(kit.caja(0.2, 0.01, 0.045, 0.003), emis(col, 0.6)); franja.position.set(0, 0.002, 0.1); tira.add(franja)
    spawn = new THREE.Vector3(0, 0.76, 0.34)
    anima = (t, act, rm) => {
      // al llegar un ticket el botón se hunde y la tira de papel sale y vuelve a entrar
      const salida = act > 0 ? ease(1 - act) * (1 - Math.max(0, (1 - act - 0.55) / 0.45)) : 0
      tira.scale.z = 0.05 + (rm ? 0 : salida) * 1; tira.position.z = 0.2 + tira.scale.z * 0.15
      boton.position.z = 0.215 - (act > 0.7 ? 0.015 : 0)
      ;(tope.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.7 + act + (rm ? 0 : Math.sin(t * 2.4 + fase) * 0.15)
    }
  } else if (estilo === 'orbe') {
    const peana = new THREE.Mesh(kit.cil(0.2, 0.26, 0.12, 24), kit.mat(oscuro, { r: 0.4, m: 0.5 })); peana.position.y = 0.1; g.add(peana)
    const tallo = new THREE.Mesh(kit.cil(0.035, 0.035, 0.46, 10), kit.mat(metal, { r: 0.3, m: 0.7 })); tallo.position.y = 0.4; g.add(tallo)
    const orb = new THREE.Group(); orb.position.y = 1.1; g.add(orb)
    const cristal = new THREE.Mesh(new THREE.SphereGeometry(0.3, 32, 24), new THREE.MeshPhysicalMaterial({ color: color(mezcla(col, [255, 255, 255], 0.3)), transparent: true, opacity: 0.28, roughness: 0.05, clearcoat: 1, emissive: color(col), emissiveIntensity: 0.25, depthWrite: false })); orb.add(cristal); propios.push(cristal.material as THREE.Material)
    const nucleo = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false })); nucleo.scale.setScalar(0.34); orb.add(nucleo); propios.push(nucleo.material)
    const anillos = [0, 1].map((i) => { const a = new THREE.Mesh(new THREE.TorusGeometry(0.42 - i * 0.05, 0.012, 8, 56), new THREE.MeshBasicMaterial({ color: color(col), transparent: true, opacity: 0.8 })); a.rotation.set(1.1 + i * 0.6, i * 0.9, 0); orb.add(a); propios.push(a.material as THREE.Material); return a })
    const motas = Array.from({ length: 6 }, (_, i) => { const m = new THREE.Mesh(kit.esf(0.026), new THREE.MeshBasicMaterial({ color: color(mezcla(col, [255, 255, 255], 0.5)) })); orb.add(m); propios.push(m.material as THREE.Material); return { m, i } })
    spawn = new THREE.Vector3(0, 1.0, 0.25)
    anima = (t, act, rm) => {
      orb.position.y = 1.1 + (rm ? 0 : Math.sin(t * 1.5 + fase) * 0.05)
      anillos.forEach((a, i) => { a.rotation.z = rm ? 0 : t * (0.7 + i * 0.5) * (i ? -1 : 1) })
      motas.forEach(({ m, i }) => { const a = (rm ? 0 : t * 1.4) + (i / 6) * Math.PI * 2; m.position.set(Math.cos(a) * 0.42, Math.sin(a * 2) * 0.12, Math.sin(a) * 0.42) })
      const e = 1 + act * 0.35; orb.scale.setScalar(e); ;(cristal.material as THREE.MeshPhysicalMaterial).emissiveIntensity = 0.25 + act * 1.2
    }
  } else if (estilo === 'minibot') {
    const r = crearRobot(kit, { cuerpo: mezcla(col, [255, 255, 255], 0.4), acento: col, escala: 0.82, pechoMapa: tex, fase })
    r.g.position.y = 0; g.add(r.g)
    // accesorio por canal: auricular (llamadas), antena doble (chat), solapa (correo)…
    const acc = new THREE.Mesh(kit.caja(0.46, 0.04, 0.04, 0.015), new THREE.MeshStandardMaterial({ color: color(col), emissive: color(col), emissiveIntensity: 0.6 }))
    if (k === 'tel') { const diad = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.018, 8, 24, Math.PI), kit.mat(col)); diad.position.y = 1.05; r.g.add(diad); const mic = new THREE.Mesh(kit.cil(0.008, 0.008, 0.16, 6), kit.mat(col)); mic.rotation.z = Math.PI / 2.4; mic.position.set(0.22, 0.99, 0.1); r.g.add(mic) }
    else { acc.position.set(0, 0.5, 0.17); r.g.add(acc) }
    spawn = new THREE.Vector3(0, 0.55, 0.45)
    anima = (t, act, rm) => {
      animarRobotBase(r, t, rm, 1 + act * 2)
      if (!rm) {
        const saludo = Math.sin(t * 6 + fase) * 0.4 * (0.3 + act)
        r.bd.p.rotation.x = -0.4 - act * 1.3; r.bd.p.rotation.z = -0.35 - saludo * 0.4; r.bd.ant.rotation.x = -0.5 + saludo
        r.bi.p.rotation.x = -0.15; r.bi.p.rotation.z = 0.2
        r.cabeza.rotation.y = Math.sin(t * 0.7 + fase) * 0.4
      }
      r.pecho.emissiveIntensity = 0.5 + act * 1.2
    }
    propios.push({ dispose: () => r.g.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { (Array.isArray(m.material) ? m.material : [m.material]).forEach((q) => q.dispose()) } }) })
  } else { // portal
    const poste = (s: number) => { const p = new THREE.Mesh(kit.caja(0.1, 1.55, 0.16, 0.04), kit.mat(cuerpo, { r: 0.35, m: 0.3 })); p.position.set(s * 0.5, 0.8, 0); g.add(p); const luz = new THREE.Mesh(kit.caja(0.02, 1.3, 0.02, 0.008), emis(col, 1.1)); luz.position.set(s * 0.44, 0.8, 0.09); g.add(luz); return luz }
    const luces = [poste(-1), poste(1)]
    const viga = new THREE.Mesh(kit.caja(1.18, 0.14, 0.2, 0.05), kit.mat(cuerpo, { r: 0.35, m: 0.3 })); viga.position.y = 1.62; g.add(viga)
    const filete = new THREE.Mesh(kit.caja(1.0, 0.025, 0.02, 0.008), emis(col, 1.4)); filete.position.set(0, 1.55, 0.11); g.add(filete)
    const cvs = document.createElement('canvas'); cvs.width = 64; cvs.height = 128
    const cx = cvs.getContext('2d')!; const grad = cx.createLinearGradient(0, 0, 0, 128)
    grad.addColorStop(0, css(col, 0)); grad.addColorStop(0.5, css(col, 0.85)); grad.addColorStop(1, css(col, 0)); cx.fillStyle = grad; cx.fillRect(0, 0, 64, 128)
    for (let i = 0; i < 6; i++) { cx.fillStyle = css([255, 255, 255], 0.35); cx.fillRect(4 + i * 10, 0, 1.5, 128) }
    const velo = new THREE.CanvasTexture(cvs); velo.wrapS = velo.wrapT = THREE.RepeatWrapping; velo.colorSpace = THREE.SRGBColorSpace; propios.push(velo)
    const veloM = new THREE.MeshBasicMaterial({ map: velo, transparent: true, opacity: 0.45, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }); propios.push(veloM)
    const plano = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.45), veloM); plano.position.y = 0.82; g.add(plano)
    const ic = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false })); ic.scale.setScalar(0.42); ic.position.y = 2.0; g.add(ic); propios.push(ic.material)
    spawn = new THREE.Vector3(0, 0.82, 0)
    anima = (t, act, rm) => {
      if (!rm) velo.offset.y = (t * 0.25 + fase) % 1
      veloM.opacity = 0.4 + act * 0.5; luces.forEach((l) => { (l.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.9 + act * 1.5 })
      ic.position.y = 2.0 + (rm ? 0 : Math.sin(t * 1.8 + fase) * 0.04)
    }
  }
  Kit.sombrear(g, true, false)
  return {
    g, spawn,
    update: (t, pulso, rm) => {
      const act = Math.max(0, 1 - pulso / 1.3)
      aroM.opacity = 0.55 + act * 0.45 + (rm ? 0 : Math.sin(t * 2 + fase) * 0.12)
      anima(t, act, rm)
    },
    dispose: () => { propios.forEach((p) => p.dispose()) },
  }
}
