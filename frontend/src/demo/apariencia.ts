/**
 * Lo que la galería hace con la apariencia además de lo que ya da el framework
 * (`useAppearance`, `AppearancePanel`): copiar la configuración elegida y pintar una vista
 * previa en el tema contrario. Las funciones puras se prueban en pruebas/demo-apariencia.test.ts.
 */

export interface EjeConAtributo {
  readonly id: string
  readonly attribute: string
}

export interface Configuracion {
  /** Eje → valor, solo de los ejes que `<html>` declara. */
  readonly valores: Readonly<Record<string, string>>
  /** `<html lang="es" data-palette="oceano" …>`, para pegar en index.html. */
  readonly html: string
  /** `{"palette":"oceano",…}`, la forma de `AppearanceValues` (setPreference por eje). */
  readonly json: string
}

/**
 * La configuración que hay en `<html>`: los `data-*` de los ejes de apariencia, en el orden
 * de los ejes. Un atributo que no es de un eje (el `lang`, otro `data-*`) no entra.
 */
export function configuracionDe(atributos: Readonly<Record<string, string>>, ejes: readonly EjeConAtributo[]): Configuracion {
  const valores: Record<string, string> = {}
  const pares: string[] = []
  for (const eje of ejes) {
    const valor = atributos[eje.attribute]
    if (valor === undefined || valor === '') continue
    valores[eje.id] = valor
    pares.push(`${eje.attribute}="${valor.replace(/[&"<>]/g, (c) => `&#${c.charCodeAt(0)};`)}"`)
  }
  return {
    valores,
    html: `<html lang="es"${pares.map((p) => ` ${p}`).join('')}>`,
    json: JSON.stringify(valores, null, 2),
  }
}

export interface ReglaDeTema {
  readonly selector: string
  readonly declaraciones: string
}

export const TEMA_EN_RAIZ = /^:root((?::where\([^)]*\))*)\[data-theme=(["'])(light|dark)\2\]$/

/**
 * El tema claro y el oscuro solo existen en `:root` (`:root[data-theme='dark']`): un
 * `data-theme` en un elemento no cambia nada. Para enseñar los dos lado a lado se copian
 * esas reglas tal como las cargó la página —no una copia escrita a mano que se quedaría
 * vieja— con el ámbito del elemento: `:root[data-theme="dark"]` pasa a ser
 * `:root .gl-tema-local[data-theme="dark"]`, y el estilo sobrio conserva su condición en la
 * raíz. Los tokens semánticos se redefinen en ese elemento y la paleta, que vive en las
 * primitivas de `:root`, llega igual por herencia.
 */
export function hojaDeTemaLocal(reglas: readonly ReglaDeTema[], ambito = '.gl-tema-local'): string {
  const bloques: string[] = []
  for (const { selector, declaraciones } of reglas) {
    const m = TEMA_EN_RAIZ.exec(selector.trim())
    if (!m) continue
    const condicion = m[1] ?? ''
    const tema = m[3]
    bloques.push(`:root${condicion} ${ambito}[data-theme="${tema}"] { color-scheme: ${tema}; ${declaraciones.trim()} }`)
  }
  return bloques.join('\n')
}
