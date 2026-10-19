import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { test } from 'node:test'
import { buscar, entradasDeCatalogo, entradasDeGaleria, puntuar, sinonimosDe } from '../src/demo/busqueda.ts'
import { SINONIMOS } from '../src/demo/sinonimos.ts'
import { indexarFichas, normalizar } from '../src/demo/vitrina/catalogo.ts'
import type { Catalogo } from '../src/demo/vitrina/catalogo.ts'

/**
 * El buscador global de la galería (Ctrl K): el índice de pantallas, componentes y casos, y
 * los sinónimos en español. Se prueba contra el catálogo instalado de @aybarcorp/ui.
 * `npm run demo:quitar` borra este archivo con la galería.
 */

const requerir = createRequire(import.meta.url)
const catalogo = JSON.parse(readFileSync(requerir.resolve('@aybarcorp/ui/ejemplos'), 'utf8')) as Catalogo
const fichas = indexarFichas(JSON.parse(readFileSync(requerir.resolve('@aybarcorp/ui/props'), 'utf8')))
const indice = [...entradasDeGaleria(), ...entradasDeCatalogo(catalogo, fichas)]
const titulos = (consulta: string, n = 5) => buscar(indice, consulta).slice(0, n).map((e) => e.titulo)

test('el índice tiene las pantallas, cada componente y cada caso, sin ids repetidos', () => {
  const casos = catalogo.grupos.reduce((t, g) => t + g.casos.length, 0)
  assert.equal(indice.filter((e) => e.tipo === 'caso').length, casos)
  assert.equal(indice.filter((e) => e.tipo === 'componente').length, new Set(catalogo.grupos.map((g) => g.componente)).size)
  assert.ok(indice.some((e) => e.ruta === '/demo/ingreso/enlace-magico'))
  assert.equal(new Set(indice.map((e) => e.id)).size, indice.length)
  for (const e of indice.filter((x) => x.tipo === 'caso').slice(0, 20)) assert.match(e.ruta, /^\/demo\/vitrina\/[a-z0-9-]+\/[a-z0-9-]+#caso-\d+$/)
})

test('sin tildes ni mayúsculas: «CONTRASEÑA» y «contrasena» encuentran lo mismo', () => {
  assert.equal(normalizar('  CONTRASEÑA '), 'contrasena')
  assert.deepEqual(titulos('CONTRASEÑA'), titulos('contrasena'))
  assert.equal(titulos('contraseña')[0], 'PasswordInput')
})

test('los sinónimos en español llevan al componente en inglés', () => {
  const esperado: [string, string][] = [
    ['tabla', 'DataGrid'],
    ['ventana', 'Modal'],
    ['aviso', 'Alert'],
    ['menú', 'DropdownMenu'],
    ['fecha', 'DatePicker'],
    ['subir', 'FileUpload'],
    ['cargando', 'Spinner'],
    ['interruptor', 'Switch'],
    ['árbol', 'TreeView'],
  ]
  for (const [consulta, componente] of esperado) {
    assert.ok(titulos(consulta, 8).includes(componente), `«${consulta}» → ${componente}: ${titulos(consulta, 8).join(', ')}`)
  }
  assert.equal(titulos('3d')[0], 'Visor 3D')
  assert.ok(titulos('paleta').includes('Personalización'))
  assert.ok(titulos('tema').includes('AppearancePanel'))
})

test('una palabra a medias, desde tres letras, ya vale por su sinónimo', () => {
  assert.ok(sinonimosDe('tabl').includes('datagrid'))
  assert.deepEqual(sinonimosDe('ta'), [], 'con dos letras no se expande')
  assert.ok(titulos('tabl', 8).includes('DataGrid'))
})

test('un nombre exacto gana a un sinónimo y un componente a sus casos', () => {
  const [primero] = buscar(indice, 'table')
  assert.equal(primero?.titulo, 'Table')
  const conCasos = buscar(indice, 'login form')
  assert.equal(conCasos[0]?.tipo, 'componente')
  const entrada = indice.find((e) => e.titulo === 'DataGrid')
  assert.ok(entrada)
  assert.ok(puntuar(entrada, 'datagrid') > puntuar(entrada, 'tabla'))
  assert.equal(puntuar(entrada, 'zzzz'), 0)
  assert.equal(puntuar(entrada, '   '), 0)
})

test('varios términos se cumplen todos; «porTipo» limita cada grupo; sin ADMIN no salen sus pantallas', () => {
  assert.ok(buscar(indice, 'ingreso celular').every((e) => /celular/i.test(`${e.titulo} ${e.contexto}`)))
  const limitados = buscar(indice, 'button', { porTipo: { caso: 2 } })
  assert.ok(limitados.filter((e) => e.tipo === 'caso').length <= 2)
  assert.ok(buscar(indice, 'usuarios').some((e) => e.ruta === '/demo/admin/usuarios'))
  assert.ok(!buscar(indice, 'usuarios', { admin: false }).some((e) => e.ruta.startsWith('/demo/admin')))
})

test('cada sinónimo apunta a algo que existe en el índice', () => {
  const nombres = new Set(indice.map((e) => normalizar(e.titulo)))
  for (const [clave, destinos] of Object.entries(SINONIMOS)) {
    assert.equal(clave, normalizar(clave), `la clave «${clave}» va normalizada`)
    for (const destino of destinos) assert.ok(nombres.has(normalizar(destino)), `«${clave}» → «${destino}» no está en el índice`)
  }
})
