import assert from 'node:assert/strict'
import { test } from 'node:test'
import { configuracionDe, hojaDeTemaLocal } from '../src/demo/apariencia.ts'

/**
 * Lo que la galería añade a la apariencia del framework: copiar la configuración de <html>
 * y el tema local de la vista previa. `npm run demo:quitar` borra este archivo con la galería.
 */
const EJES = [
  { id: 'theme', attribute: 'data-theme' },
  { id: 'palette', attribute: 'data-palette' },
  { id: 'depth', attribute: 'data-depth' },
]

test('la configuración copia solo los data-* de los ejes, en su orden, como HTML y como JSON', () => {
  const c = configuracionDe({ lang: 'es', 'data-depth': 'plano', 'data-palette': 'oceano', 'data-otro': 'x' }, EJES)
  assert.deepEqual(c.valores, { palette: 'oceano', depth: 'plano' })
  assert.equal(c.html, '<html lang="es" data-palette="oceano" data-depth="plano">')
  assert.deepEqual(JSON.parse(c.json), { palette: 'oceano', depth: 'plano' })
  assert.equal(configuracionDe({}, EJES).html, '<html lang="es">')
  assert.equal(configuracionDe({ 'data-theme': '"><script>' }, EJES).html, '<html lang="es" data-theme="&#34;&#62;&#60;script&#62;">', 'escapa el valor')
})

test('las reglas de tema de :root pasan al ámbito local; el resto no', () => {
  const css = hojaDeTemaLocal([
    { selector: ':root[data-theme="dark"]', declaraciones: '--aybar-color-bg-canvas: var(--aybar-color-neutral-900);' },
    { selector: ":root[data-theme='light']", declaraciones: '--aybar-color-bg-canvas: var(--aybar-color-neutral-100);' },
    { selector: ':root:where([data-style="sobrio"])[data-theme="dark"]', declaraciones: '--x: 1;' },
    { selector: ':root', declaraciones: '--y: 2;' },
    { selector: '.ay-btn[data-theme="dark"]', declaraciones: '--z: 3;' },
  ])
  const lineas = css.split('\n')
  assert.equal(lineas.length, 3)
  assert.equal(lineas[0], ':root .gl-tema-local[data-theme="dark"] { color-scheme: dark; --aybar-color-bg-canvas: var(--aybar-color-neutral-900); }')
  assert.match(lineas[1] ?? '', /^:root \.gl-tema-local\[data-theme="light"\] \{ color-scheme: light;/)
  assert.match(lineas[2] ?? '', /^:root:where\(\[data-style="sobrio"\]\) \.gl-tema-local\[data-theme="dark"\]/, 'el estilo sobrio conserva su condición en la raíz')
})
