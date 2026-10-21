import { DOCUMENT, DestroyRef, inject } from '@angular/core';

/**
 * Tema local para la vista previa de Personalización: claro y oscuro lado a lado.
 *
 * Los temas de @aybarcorp/tokens solo existen en la raíz (`:root[data-theme='dark']`): un
 * `data-theme` en otro elemento no cambia nada. Para enseñar los dos a la vez, la galería
 * copia —en el navegador, del CSSOM de la hoja de tokens ya cargada— los bloques de cada
 * tema bajo `[data-gl-tema='light']` y `[data-gl-tema='dark']`. Las custom properties se
 * resuelven donde se declaran, así que la paleta, el acento, los grises y el estilo
 * elegidos en `<html>` siguen mandando dentro de la vista previa.
 *
 * Es solo de la galería: no se copia nada a mano y, si la hoja cambia, la copia también.
 */
const ID_HOJA = 'gl-tema-local';

/** `:root[data-theme="dark"]` → el tema; también con el estilo sobrio delante. */
const TEMA = /^:root(:where\(\[data-style="sobrio"\]\))?\[data-theme="(light|dark)"\]$/;

export function usarTemaLocal(): void {
  const documento = inject(DOCUMENT);
  if (documento.getElementById(ID_HOJA)) return;
  const reglas: string[] = [];
  for (const hoja of Array.from(documento.styleSheets)) {
    let lista: CSSRuleList;
    try {
      lista = hoja.cssRules;
    } catch {
      continue; // Una hoja de otro origen no se puede leer; las del proyecto, sí.
    }
    for (const regla of Array.from(lista)) {
      if (!(regla instanceof CSSStyleRule)) continue;
      const coincide = TEMA.exec(regla.selectorText.replace(/'/g, '"'));
      if (!coincide) continue;
      const [, sobrio, tema] = coincide;
      const destino = `[data-gl-tema="${tema}"]`;
      reglas.push(`${sobrio ? ':root:where([data-style="sobrio"]) ' : ''}${destino} { ${regla.style.cssText} color-scheme: ${tema}; }`);
    }
  }
  const estilo = documento.createElement('style');
  estilo.id = ID_HOJA;
  estilo.textContent = reglas.join('\n');
  documento.head.append(estilo);
  inject(DestroyRef).onDestroy(() => estilo.remove());
}
