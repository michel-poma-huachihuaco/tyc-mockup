import * as THREE from 'three'
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js'

export type RGB = readonly number[]
export const css = (c: RGB, a = 1) => (a === 1 ? `rgb(${c[0]} ${c[1]} ${c[2]})` : `rgb(${c[0]} ${c[1]} ${c[2]} / ${a})`)
export const color = (c: RGB) => new THREE.Color().setRGB(c[0]! / 255, c[1]! / 255, c[2]! / 255, THREE.SRGBColorSpace)
/** Mezcla con negro (f<0) o blanco (f>0), igual que el sombreado de las caras del 2D original. */
export const sombra = (c: RGB, f: number): RGB => c.map((v) => Math.max(0, Math.min(255, Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f))))

/** Capa de etiquetas DOM sobre el canvas (texto real, nítido y traducible). */
export function capaEtiquetas(host: HTMLElement) {
  if (getComputedStyle(host).position === 'static') host.style.position = 'relative'
  const el = document.createElement('div')
  el.style.cssText = 'position:absolute;inset:0;z-index:1;pointer-events:none;overflow:hidden;font-family:Montserrat,system-ui,sans-serif'
  host.append(el)
  return new CSS2DRenderer({ element: el })
}

/** Corre `frame` en cada cuadro, o cada 400 ms si el usuario pidió menos movimiento. Devuelve la limpieza. */
export function bucle(reducido: boolean, frame0: (ahora: number) => void) {
  let raf = 0, avisado = false
  // un error de dibujo no debe matar la animación: se avisa una vez y se sigue
  const frame = (t: number) => { try { frame0(t) } catch (e) { if (!avisado) { avisado = true; console.error('[escena three.js]', e) } } }
  const paso = (t: number) => { frame(t); if (!document.hidden) raf = requestAnimationFrame(paso) }
  const visible = () => { if (!document.hidden && !reducido) { cancelAnimationFrame(raf); raf = requestAnimationFrame(paso) } }
  frame(performance.now())
  const iv = reducido ? window.setInterval(() => frame(performance.now()), 400) : 0
  if (!reducido) raf = requestAnimationFrame(paso)
  document.addEventListener('visibilitychange', visible)
  return () => { cancelAnimationFrame(raf); clearInterval(iv); document.removeEventListener('visibilitychange', visible) }
}
