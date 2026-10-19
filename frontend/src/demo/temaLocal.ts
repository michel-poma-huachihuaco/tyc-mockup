import { TEMA_EN_RAIZ, hojaDeTemaLocal } from './apariencia'
import type { ReglaDeTema } from './apariencia'

/**
 * La parte del tema local que toca el DOM (apariencia.ts es pura y la prueba Node): lee las
 * reglas de tema que cargó la página y adopta una hoja con su copia en el ámbito local.
 */

/** Las reglas de tema de las hojas cargadas (solo las del primer nivel, sin @media). */
function reglasDeTema(): ReglaDeTema[] {
  const reglas: ReglaDeTema[] = []
  for (const hoja of Array.from(document.styleSheets)) {
    let lista: CSSRuleList
    try {
      lista = hoja.cssRules
    } catch {
      continue
    }
    for (const regla of Array.from(lista)) {
      if (!(regla instanceof CSSStyleRule)) continue
      for (const parte of regla.selectorText.split(',')) {
        if (TEMA_EN_RAIZ.test(parte.trim())) reglas.push({ selector: parte.trim(), declaraciones: regla.style.cssText })
      }
    }
  }
  return reglas
}

let instalada: CSSStyleSheet | null = null

/**
 * Instala (una vez) la hoja que deja usar `data-theme` en un elemento con la clase
 * `gl-tema-local`. La vuelve a calcular si se llama con `rehacer` (tras recargar estilos).
 */
export function instalarTemaLocal(rehacer = false): void {
  if (typeof document === 'undefined' || !('adoptedStyleSheets' in document)) return
  if (instalada && !rehacer) return
  const css = hojaDeTemaLocal(reglasDeTema())
  if (!css) return
  const hoja = instalada ?? new CSSStyleSheet()
  hoja.replaceSync(css)
  if (!instalada) document.adoptedStyleSheets = [...document.adoptedStyleSheets, hoja]
  instalada = hoja
}
