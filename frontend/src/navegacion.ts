import { useSyncExternalStore } from 'react'
import type { MouseEvent } from 'react'

/**
 * Ruteo mínimo sobre la History API: las tres pantallas de la plantilla no justifican un
 * router. Cuando la aplicación crezca, cámbialo por el que decida el equipo; en un shell,
 * el adaptador del anfitrión (src/anfitrion.ts) se construye sobre este mismo módulo, así
 * que el historial sigue teniendo un solo dueño.
 *
 * `pushState` no dispara `popstate`: por eso `navegar` avisa a mano a quien escucha.
 */

const escuchas = new Set<() => void>()

function avisar(): void {
  // Sobre una copia: una escucha puede darse de baja mientras se recorre el conjunto.
  for (const escucha of Array.from(escuchas)) escucha()
}

/** Ruta absoluta actual, con búsqueda y ancla: `/ingresar?destino=%2F`. */
export function rutaActual(): string {
  return `${location.pathname}${location.search}${location.hash}`
}

export function navegar(ruta: string, opciones: { reemplazar?: boolean } = {}): void {
  if (opciones.reemplazar) history.replaceState(history.state, '', ruta)
  else history.pushState(null, '', ruta)
  avisar()
}

/** Avisa de cada cambio de ruta: `navegar()`, y atrás/adelante del navegador. */
export function suscribirRuta(escucha: () => void): () => void {
  if (escuchas.size === 0) addEventListener('popstate', avisar)
  escuchas.add(escucha)
  return () => {
    if (escuchas.delete(escucha) && escuchas.size === 0) removeEventListener('popstate', avisar)
  }
}

/** La ruta vigente, reactiva. */
export function useUbicacion(): URL {
  const ruta = useSyncExternalStore(suscribirRuta, rutaActual)
  return new URL(ruta, location.origin)
}

/**
 * `href` y `onClick` para un enlace interno (`<Link {...enlaceInterno('/x')}>`): navega
 * sin recargar, pero deja al navegador lo suyo —abrir en otra pestaña con Ctrl, Cmd o el
 * botón central— y el enlace sigue funcionando sin JavaScript.
 */
export function enlaceInterno(ruta: string) {
  return {
    href: ruta,
    onClick: (evento: MouseEvent<HTMLAnchorElement>) => {
      if (evento.defaultPrevented || evento.button !== 0) return
      if (evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) return
      evento.preventDefault()
      navegar(ruta)
    },
  }
}
