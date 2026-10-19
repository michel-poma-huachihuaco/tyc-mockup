import { useLayoutEffect, useState } from 'react'
import type { RefObject } from 'react'

/**
 * El ancho de contenido de un elemento, en px, al día: lo da un ResizeObserver, que avisa
 * antes del pintado, así que la primera medida no se ve saltar. 0 hasta montar. Es la medida
 * que miran las container queries (la caja de contenido, sin el relleno).
 */
export function useAnchoDe(ref: RefObject<HTMLElement | null>): number {
  const [ancho, setAncho] = useState(0)
  useLayoutEffect(() => {
    const elemento = ref.current
    if (!elemento) return
    const observador = new ResizeObserver(([entrada]) => {
      if (entrada) setAncho(entrada.contentBoxSize[0]?.inlineSize ?? entrada.contentRect.width)
    })
    observador.observe(elemento)
    return () => observador.disconnect()
  }, [ref])
  return ancho
}

/** Cuántos px mide 1rem ahora (el usuario puede haber cambiado el tamaño de letra). */
export function pxPorRem(): number {
  return Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
}
