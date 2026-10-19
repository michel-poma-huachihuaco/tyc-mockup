import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { test } from 'node:test'
import {
  ORDEN_FAMILIAS,
  agruparPorFamilia,
  anclaDeGrupo,
  casosDe,
  indexarFichas,
  primeraFrase,
  slugComponente,
  slugFamilia,
  ubicarComponente,
  vecinosDe,
} from '../src/demo/vitrina/catalogo.ts'
import type { Catalogo, GrupoCatalogo } from '../src/demo/vitrina/catalogo.ts'

/**
 * La vitrina de la galería de demostración: cómo agrupa el catálogo de @aybarcorp/ui, qué URL
 * tiene cada componente y cada caso, y que con el catálogo instalado no se pierde nada.
 * `npm run demo:quitar` borra este archivo con la galería.
 */

const grupo = (familia: string, componente: string, casos = 1): GrupoCatalogo => ({
  familia,
  componente,
  titulo: `${componente} en ${familia}`,
  casos: Array.from({ length: casos }, (_, i) => ({ etiqueta: `caso ${i}` })),
})

test('la vitrina sigue el orden de familias del diseño y muestra también las vacías', () => {
  const catalogo: Catalogo = {
    grupos: [grupo('Errors', 'ErrorPage'), grupo('Actions', 'Button', 3), grupo('Familia nueva', 'Algo'), grupo('Actions', 'Link'), grupo('Actions', 'Button', 2)],
  }
  const familias = agruparPorFamilia(catalogo)
  assert.deepEqual(
    familias.map((f) => f.nombre),
    [...ORDEN_FAMILIAS, 'Familia nueva'],
    'una familia que el diseño no nombra va al final',
  )
  const acciones = familias.find((f) => f.nombre === 'Actions')
  assert.deepEqual(
    acciones?.componentes.map((c) => [c.nombre, c.slug, c.grupos.length, c.casos]),
    [
      ['Button', 'button', 2, 5],
      ['Link', 'link', 1, 1],
    ],
  )
  assert.equal(acciones?.casos, 6)
  assert.equal(familias.find((f) => f.nombre === 'Overlays')?.casos, 0)
})

test('cada familia y cada componente tienen un tramo de URL estable', () => {
  assert.equal(slugFamilia('Form Controls'), 'form-controls')
  assert.equal(slugFamilia('Form Architecture'), 'form-architecture')
  assert.equal(slugComponente('DataGrid'), 'data-grid')
  assert.equal(slugComponente('Error404'), 'error-404')
  assert.equal(slugComponente('ErrorOffline'), 'error-offline')
  assert.equal(slugComponente('Button'), 'button')
})

test('un caso se numera desde 1 a lo largo de los grupos de su componente', () => {
  const [familia] = agruparPorFamilia({ grupos: [grupo('Actions', 'Button', 2), grupo('Actions', 'Button', 3)] }).filter((f) => f.casos > 0)
  const boton = familia?.componentes[0]
  assert.ok(boton)
  assert.deepEqual(
    casosDe(boton).map((c) => c.n),
    [1, 2, 3, 4, 5],
  )
  assert.equal(casosDe(boton)[2]?.grupo, boton.grupos[1], 'el tercero es el primero del segundo grupo')
  assert.equal(anclaDeGrupo(0, 'Tamaños y estados'), 'grupo-1-tamanos-y-estados')
})

test('ubicar un componente por su ruta, y su anterior y su siguiente', () => {
  const familias = agruparPorFamilia({ grupos: [grupo('Actions', 'Button'), grupo('Actions', 'Link'), grupo('Data', 'DataGrid')] })
  const ubicado = ubicarComponente(familias, 'actions', 'link')
  assert.equal(ubicado?.componente.nombre, 'Link')
  assert.equal(ubicarComponente(familias, 'actions', 'data-grid'), null, 'el componente es de otra familia')
  assert.equal(ubicarComponente(familias, 'nada', 'link'), null)
  assert.ok(ubicado)
  const { anterior, siguiente } = vecinosDe(familias, ubicado.componente)
  assert.equal(anterior?.nombre, 'Button')
  assert.equal(siguiente?.nombre, 'DataGrid', 'salta a la familia siguiente')
})

test('con el catálogo instalado no se pierde ni se duplica ningún caso, y las URL no chocan', () => {
  const ruta = createRequire(import.meta.url).resolve('@aybarcorp/ui/ejemplos')
  const catalogo = JSON.parse(readFileSync(ruta, 'utf8')) as Catalogo
  const familias = agruparPorFamilia(catalogo)
  const esperados = catalogo.grupos.reduce((total, g) => total + g.casos.length, 0)
  assert.ok(esperados > 0, 'el catálogo de @aybarcorp/ui no trae casos')
  assert.equal(
    familias.reduce((total, f) => total + f.casos, 0),
    esperados,
  )
  assert.equal(new Set(familias.map((f) => f.slug)).size, familias.length, 'dos familias con el mismo tramo')
  const rutas = familias.flatMap((f) => f.componentes.map((c) => `${f.slug}/${c.slug}`))
  assert.equal(new Set(rutas).size, rutas.length, 'dos componentes con la misma URL')
})

test('las fichas de props se indexan por componente y una tabla sin forma no rompe', () => {
  const fichas = indexarFichas({
    componentes: [{ nombre: 'Button', descripcion: 'Acción', props: [{ nombre: 'variant', tipo: "'primary'", requerido: false, porOmision: "'primary'" }] }],
  })
  assert.equal(fichas.get('Button')?.props[0]?.nombre, 'variant')
  assert.equal(indexarFichas(null).size, 0)
  assert.equal(indexarFichas({ otra: 'cosa' }).size, 0)
  assert.equal(primeraFrase('Botón de acción. Lleva `variant`.'), 'Botón de acción.')
  assert.equal(primeraFrase(undefined), '')
})
