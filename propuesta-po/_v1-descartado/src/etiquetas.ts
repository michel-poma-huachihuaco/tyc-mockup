import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'

/** Etiqueta DOM anclada a un punto 3D (texto real: legible y traducible, no pixeles del canvas). */
export function etiqueta(texto: string, sub = '', clase = ''): CSS2DObject {
  const el = document.createElement('div')
  el.className = `et ${clase}`.trim()
  const b = document.createElement('b'); b.textContent = texto; el.append(b)
  if (sub) { const s = document.createElement('small'); s.textContent = sub; el.append(s) }
  return new CSS2DObject(el)
}

export function ponerEtiqueta(o: CSS2DObject, texto: string, sub = '', clase = '') {
  const el = o.element
  el.className = `et ${clase}`.trim()
  const [b, s] = [el.querySelector('b'), el.querySelector('small')]
  if (b && b.textContent !== texto) b.textContent = texto
  if (sub) {
    if (s) { if (s.textContent !== sub) s.textContent = sub } else { const n = document.createElement('small'); n.textContent = sub; el.append(n) }
  } else s?.remove()
}

export const sinMovimiento = () => matchMedia('(prefers-reduced-motion: reduce)').matches
