import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { test } from 'node:test'
import { RUTA_INGRESO, destinoSeguro, esUrlDePlantilla, rutaIngreso } from '../src/rutas.ts'
import { esSesionDemo, rolesDeUsuarioDemo, rolesVisibles } from '../src/sesion.ts'
import { OPCIONES_TEMA, esPreferenciaTema, etiquetaTema } from '../src/tema.ts'
import { piezasDeComando } from '../src/terminal.ts'

/**
 * La lógica de la plantilla que no necesita navegador: a dónde se vuelve tras el login,
 * cuándo hay backend, el selector de tema y el arranque de la apariencia. `npm test`, con
 * el runner de Node (sin dependencias): Node 22 ejecuta TypeScript quitando los tipos. Las
 * pruebas de la galería de demostración están en pruebas/demo-*.test.ts.
 */

test('el destino tras el login solo puede ser una ruta de este sitio', () => {
  assert.equal(destinoSeguro('/'), '/')
  assert.equal(destinoSeguro('/creditos/solicitudes?pagina=2'), '/creditos/solicitudes?pagina=2')
  for (const ajeno of [null, undefined, '', 'creditos', 'https://otro.example', '//otro.example', '/\\otro.example']) {
    assert.equal(destinoSeguro(ajeno), '/', `${String(ajeno)} no es un destino propio`)
  }
})

test('la pantalla de ingreso lleva el destino solo si no es el inicio', () => {
  assert.equal(rutaIngreso('/'), RUTA_INGRESO)
  assert.equal(rutaIngreso('//otro.example'), RUTA_INGRESO)
  assert.equal(rutaIngreso('/creditos/42'), `${RUTA_INGRESO}?destino=%2Fcreditos%2F42`)
})

test('la URL de plantilla de aybar-front init no cuenta como backend', () => {
  assert.equal(esUrlDePlantilla('https://api.aybar.local'), true)
  assert.equal(esUrlDePlantilla('https://aybar.local/v1'), true)
  assert.equal(esUrlDePlantilla('http://localhost:8081'), false)
  assert.equal(esUrlDePlantilla('/api'), false, 'una ruta del mismo origen es un backend')
  assert.equal(esUrlDePlantilla('https://api.aybar.local.example.com'), false)
})

test('la sesión demo se reconoce por la marca que pone crearAutenticacionDemo', () => {
  assert.equal(esSesionDemo({ usuarioId: 'admin', nombre: 'A', roles: [], atributos: { demo: true } }), true)
  assert.equal(esSesionDemo({ usuarioId: 'u', nombre: 'U', roles: ['USER'] }), false)
  assert.equal(esSesionDemo(null), false)
})

test('la terminal corta los comandos entre piezas: una opción no se separa de su valor', () => {
  assert.deepEqual(piezasDeComando('aybar new project demo --backend --frontend --ui react --papel app'), [
    'aybar',
    'new',
    'project',
    'demo',
    '--backend',
    '--frontend',
    '--ui react',
    '--papel app',
  ])
  assert.deepEqual(piezasDeComando('  aybar   run --frontend '), ['aybar', 'run', '--frontend'])
  assert.deepEqual(piezasDeComando(''), [])
})

test('el menú de la cuenta nombra los roles, o dice que no hay', () => {
  assert.equal(rolesVisibles({ usuarioId: 'admin', nombre: 'A', roles: ['USER', 'ADMIN'] }), 'USER, ADMIN')
  assert.equal(rolesVisibles({ usuarioId: 'u', nombre: 'U', roles: [] }), 'Sin roles')
})

test('el ingreso muestra los roles de cada usuario demo; sin roles, USER como la sesión', () => {
  assert.equal(rolesDeUsuarioDemo({ usuario: 'admin', clave: 'x', roles: ['ADMIN', 'USER'] }), 'ADMIN, USER')
  assert.equal(rolesDeUsuarioDemo({ usuario: 'usuario', clave: 'x' }), 'USER')
  assert.equal(rolesDeUsuarioDemo({ usuario: 'usuario', clave: 'x', roles: [] }), 'USER')
})

test('el selector de tema ofrece claro, oscuro y volver a seguir al sistema', () => {
  assert.deepEqual(
    OPCIONES_TEMA.map((o) => o.valor),
    ['light', 'dark', 'system'],
  )
  for (const { valor } of OPCIONES_TEMA) assert.equal(esPreferenciaTema(valor), true)
  assert.equal(esPreferenciaTema('salir'), false, 'un valor que no es tema no cambia nada')
  assert.equal(new Set(OPCIONES_TEMA.map((o) => o.etiqueta[0])).size, 3, 'la letra de cada opción salta a ella')
})

test('el botón del tema dice el elegido y, siguiendo al sistema, el que se ve', () => {
  assert.equal(etiquetaTema('light', 'light'), 'Tema: claro')
  assert.equal(etiquetaTema('dark', 'dark'), 'Tema: oscuro')
  assert.equal(etiquetaTema('system', 'dark'), 'Tema: según el sistema (oscuro)')
  assert.equal(etiquetaTema('system', 'light'), 'Tema: según el sistema (claro)')
})

test('index.html carga el arranque de la apariencia antes que la aplicación, y existe', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
  const arranque = html.search(/<script [^>]*src="\/aybar-apariencia\.js"[^>]*><\/script>/)
  assert.ok(arranque > 0, 'index.html no carga /aybar-apariencia.js')
  assert.doesNotMatch(html.slice(arranque, html.indexOf('</script>', arranque)), /type="module"|async|defer/, 'clásico y bloqueante')
  assert.ok(arranque < html.indexOf('</head>'), 'el arranque va en el <head>, antes del primer pintado')
  for (const despues of ['<link', '<script type="module"']) {
    assert.ok(arranque < html.indexOf(despues), `el arranque va antes que ${despues}`)
  }
  // vite.config.ts lo lee de aquí: si @aybarcorp/tokens deja de publicarlo, que falle la prueba
  // y no el primer `npm run dev`.
  const ruta = createRequire(import.meta.url).resolve('@aybarcorp/tokens/apariencia/arranque')
  assert.match(readFileSync(ruta, 'utf8'), /localStorage/)
})
