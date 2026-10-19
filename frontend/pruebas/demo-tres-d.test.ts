import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { registerHooks } from 'node:module'
import { test } from 'node:test'

/**
 * El plano del visor 3D de la galería (src/demo/tres-d/plano.ts), sin three.js ni DOM:
 * colores, alturas y tramas por estado, filtros, geometría del plano, la lista por
 * manzanas, la ficha y la vista de entrada. Y una guarda de código: three.js solo entra por
 * el `import()` del lienzo 3D. `npm run demo:quitar` borra este archivo con la galería.
 *
 * El código de la galería importa sin extensión ('./plano', '../datos/lotes'), como pide
 * el empaquetador, y Node no lo resuelve solo: este gancho prueba `.ts` e `/index.ts`
 * cuando la resolución normal falla. Por eso el código se carga con `await import()`.
 */
registerHooks({
  resolve(especificador, contexto, siguiente) {
    try {
      return siguiente(especificador, contexto)
    } catch (error) {
      if (especificador.startsWith('.') && !/\.[cm]?[jt]sx?(\?.*)?$/.test(especificador)) {
        for (const extension of ['.ts', '/index.ts']) {
          try {
            return siguiente(`${especificador}${extension}`, contexto)
          } catch {
            // la siguiente
          }
        }
      }
      throw error
    }
  },
})

const plano = await import('../src/demo/tres-d/plano.ts')
const datos = await import('../src/demo/datos/lotes.ts')

const DIR = new URL('../src/demo/tres-d/', import.meta.url)

test('visor · cada estado tiene token de color, tono, altura y trama propios', () => {
  assert.deepEqual([...plano.ESTADOS].sort(), ['bloqueado', 'disponible', 'reservado', 'vendido'])
  for (const estado of plano.ESTADOS) {
    assert.match(plano.TOKEN_ESTADO[estado], /^--aybar-color-[a-z-]+$/, estado)
  }
  assert.equal(new Set(Object.values(plano.TOKEN_ESTADO)).size, 4, 'un color por estado')
  assert.deepEqual(plano.TONO_ESTADO, { disponible: 'success', reservado: 'warning', vendido: 'danger', bloqueado: 'neutral' })
  // La altura ordena la venta: el estado se lee sin color.
  const { bloqueado, disponible, reservado, vendido } = plano.ALTURA_ESTADO
  assert.ok(plano.ALTURA_FUERA < bloqueado && bloqueado < disponible && disponible < reservado && reservado < vendido)
  assert.equal(plano.alturaRelativa('vendido'), 1)
  assert.ok(plano.alturaRelativa('bloqueado') > 0)
  assert.equal(plano.idTrama('disponible'), null)
  const tramas = (['reservado', 'vendido', 'bloqueado'] as const).map((estado) => plano.idTrama(estado))
  assert.equal(new Set(tramas).size, 3)
  for (const id of tramas) assert.match(String(id), /^gl-maqueta-trama-[a-z]+$/)
})

test('visor · los filtros por estado y manzana dejan pasar lo que dicen', () => {
  assert.equal(plano.filtrarLotes(plano.SIN_FILTRO).length, datos.LOTES.length)
  const resumen = datos.resumenLotes()
  for (const estado of plano.ESTADOS) {
    const lotes = plano.filtrarLotes({ estado, manzana: plano.TODAS })
    assert.equal(lotes.length, resumen[estado], estado)
    assert.ok(lotes.every((lote) => lote.estado === estado))
  }
  const deB = plano.filtrarLotes({ estado: plano.TODOS, manzana: 'B' })
  assert.equal(deB.length, datos.LOTES_POR_MANZANA)
  assert.ok(deB.every((lote) => lote.manzana === 'B'))
  const ambos = plano.filtrarLotes({ estado: 'vendido', manzana: 'C' })
  assert.ok(ambos.every((lote) => lote.estado === 'vendido' && lote.manzana === 'C'))
  assert.deepEqual(
    ambos.map((l) => l.id),
    datos.LOTES.filter((l) => l.estado === 'vendido' && l.manzana === 'C').map((l) => l.id),
    'en el orden de LOTES',
  )
  assert.ok(plano.esFiltroEstado('todos') && plano.esFiltroEstado('reservado') && !plano.esFiltroEstado('agotado'))
  assert.ok(plano.esFiltroManzana('todas') && plano.esFiltroManzana('H') && !plano.esFiltroManzana('Z'))
})

test('visor · la geometría: cada lote en su manzana, sin pisarse, y el plano centrado', () => {
  const dentro = (x: number, y: number, r: { x: number; y: number; ancho: number; alto: number }) =>
    x >= r.x && y >= r.y && x <= r.x + r.ancho && y <= r.y + r.alto
  for (const lote of datos.LOTES) {
    const { rect } = plano.MANZANAS_PLANO.find((m) => m.manzana === lote.manzana) ?? assert.fail(lote.manzana)
    assert.ok(dentro(lote.x, lote.y, rect) && dentro(lote.x + lote.frente, lote.y + lote.fondo, rect), lote.id)
    const { x, z } = plano.centroEnEscena(lote)
    assert.ok(Math.abs(x) < datos.PLANO.ancho / 2 && Math.abs(z) < datos.PLANO.alto / 2, lote.id)
  }
  const pisan = (a: (typeof datos.LOTES)[number], b: (typeof datos.LOTES)[number]) =>
    a.x < b.x + b.frente && b.x < a.x + a.frente && a.y < b.y + b.fondo && b.y < a.y + a.fondo
  for (const [i, a] of datos.LOTES.entries()) {
    for (const b of datos.LOTES.slice(i + 1)) assert.ok(!pisan(a, b), `${a.id} y ${b.id}`)
  }
  // Entre dos manzanas vecinas queda una calle entera.
  for (const [i, { rect: a }] of plano.MANZANAS_PLANO.entries()) {
    for (const { rect: b } of plano.MANZANAS_PLANO.slice(i + 1)) {
      const hueco = Math.max(b.x - (a.x + a.ancho), a.x - (b.x + b.ancho), b.y - (a.y + a.alto), a.y - (b.y + b.alto))
      assert.ok(hueco >= datos.CALLE, `hueco ${hueco}`)
    }
  }
  assert.equal(plano.VIEWBOX_2D, `-10 -10 ${datos.PLANO.ancho + 20} ${datos.PLANO.alto + 20}`)
})

test('visor · la lista: una rama por manzana con lotes, y el foco se lee por la etiqueta', () => {
  const todas = plano.ramasDeLista(datos.LOTES)
  assert.deepEqual(
    todas.map((r) => r.manzana),
    [...datos.MANZANAS],
  )
  assert.ok(todas.every((r) => r.lotes.length === datos.LOTES_POR_MANZANA && r.meta === '20 lotes' && r.etiqueta === `Manzana ${r.manzana}`))
  const bloqueadas = plano.ramasDeLista(plano.filtrarLotes({ estado: 'bloqueado', manzana: plano.TODAS }))
  assert.ok(bloqueadas.every((r) => r.lotes.length > 0), 'sin ramas vacías')
  assert.equal(
    bloqueadas.reduce((suma, r) => suma + r.lotes.length, 0),
    datos.resumenLotes().bloqueado,
  )
  assert.equal(plano.ramasDeLista([]).length, 0)
  for (const manzana of datos.MANZANAS) assert.equal(plano.manzanaDeId(plano.idDeManzana(manzana)), manzana)
  assert.equal(plano.manzanaDeId('B-07'), null)
  assert.equal(plano.manzanaDeId('manzana-Z'), null)
  // Ningún id de manzana es un id de lote.
  assert.ok(datos.MANZANAS.every((m) => plano.loteDe(plano.idDeManzana(m)) === undefined))
  assert.equal(plano.idDeEtiqueta('B-07'), 'B-07')
  assert.equal(plano.idDeEtiqueta(' B-07\n'), 'B-07')
  assert.equal(plano.idDeEtiqueta('Manzana B'), null)
  assert.equal(plano.idDeEtiqueta('Z-99'), null)
  assert.equal(plano.idDeEtiqueta(undefined), null)
  const a01 = plano.loteDe('A-01') ?? assert.fail('A-01')
  assert.equal(plano.metaDeLote(a01), `${datos.ETIQUETA_ESTADO[a01.estado]} · ${a01.area} m²`)
})

test('visor · la ficha, el anuncio y los textos de recuento', () => {
  const lote = plano.loteDe('C-15') ?? assert.fail('C-15')
  const pares = plano.paresDeFicha(lote)
  assert.deepEqual(
    pares.map(([etiqueta]) => etiqueta),
    ['Área', 'Frente × fondo', 'Precio', 'Ubicación'],
  )
  assert.equal(pares[0]?.[1], `${lote.area} m²`)
  assert.equal(pares[1]?.[1], `${lote.frente} m × ${lote.fondo} m`)
  assert.equal(pares[2]?.[1], datos.formatoSoles(lote.precio))
  assert.equal(pares[3]?.[1], 'Preferente: esquina o frente al parque', 'C, fila de atrás')
  assert.match(plano.anuncioDeLote(lote), /^Lote C-15 elegido: [a-z]+, \d+ m², S\/ [\d,]+\.$/)
  assert.equal(plano.loteDe(null), undefined)
  assert.equal(plano.loteDe('nada'), undefined)

  assert.equal(plano.resumenEnTexto({ disponible: 1, reservado: 0, vendido: 2, bloqueado: 0 }), '1 disponible y 2 vendidos')
  assert.equal(plano.resumenEnTexto({ disponible: 3, reservado: 1, vendido: 2, bloqueado: 1 }), '3 disponibles, 1 reservado, 2 vendidos y 1 bloqueado')
  assert.equal(plano.resumenEnTexto({ disponible: 0, reservado: 0, vendido: 0, bloqueado: 0 }), 'ningún lote')
  assert.equal(plano.textoMostrando(160, 160), 'Los 160 lotes')
  assert.equal(plano.textoMostrando(20, 160), '20 de 160 lotes')
  assert.equal(plano.textoMostrando(0, 160), 'Ningún lote con estos filtros')

  const opciones = plano.opcionesEstado()
  assert.equal(opciones[0]?.value, plano.TODOS)
  assert.equal(opciones.length, 5)
  assert.deepEqual(
    plano.opcionesManzana().map((o) => o.value),
    [plano.TODAS, ...datos.MANZANAS],
  )
})

test('visor · la vista de entrada: 2D sin WebGL o con movimiento reducido', () => {
  assert.deepEqual(plano.vistaInicial(true, false), { vista: '3d', motivo: null })
  assert.deepEqual(plano.vistaInicial(true, true), { vista: '2d', motivo: 'movimiento' })
  assert.deepEqual(plano.vistaInicial(false, false), { vista: '2d', motivo: 'sin-webgl' })
  assert.deepEqual(plano.vistaInicial(false, true), { vista: '2d', motivo: 'sin-webgl' })
  assert.equal(plano.avisoDe2D('eleccion'), null)
  assert.equal(plano.avisoDe2D(null), null)
  for (const motivo of ['sin-webgl', 'movimiento', 'error'] as const) assert.ok(plano.avisoDe2D(motivo))
  // Sin DOM no hay WebGL ni preferencia de movimiento que leer, y no lanza.
  assert.equal(plano.hayWebGL(), false)
  assert.equal(plano.pideMenosMovimiento(), false)
})

test('visor · three.js solo entra por el import() del lienzo 3D', () => {
  const archivos = readdirSync(DIR).filter((f) => /\.tsx?$/.test(f))
  const estatico = /^\s*import\s+(?!type\b)[^;]*?from\s+['"]([^'"]+)['"]/gm
  for (const archivo of archivos) {
    const codigo = readFileSync(new URL(archivo, DIR), 'utf8')
    const importados = [...codigo.matchAll(estatico)].map((m) => m[1])
    if (archivo === 'escena-lotes.ts') {
      assert.ok(importados.includes('three'), 'la escena es la que trae three')
      continue
    }
    assert.ok(!importados.some((de) => de === 'three' || de?.startsWith('three/')), `${archivo} importa three`)
    assert.ok(!importados.includes('./escena-lotes'), `${archivo} importa la escena sin import()`)
  }
  const lienzo = readFileSync(new URL('Lienzo3D.tsx', DIR), 'utf8')
  assert.match(lienzo, /import\('\.\/escena-lotes'\)/)
  // El plano no depende de three (lo usan el 2D y la pantalla).
  assert.doesNotMatch(readFileSync(new URL('plano.ts', DIR), 'utf8'), /from 'three/)
  // La galería carga la pantalla perezosa: nada de tres-d en el chunk de la galería.
  const galeria = readFileSync(new URL('../Galeria.tsx', DIR), 'utf8')
  assert.match(galeria, /lazy\(\(\) => import\('\.\/tres-d\/PantallaVisor'\)\)/)
  assert.doesNotMatch(galeria, /from '\.\/tres-d\//)
})
