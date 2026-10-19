import assert from 'node:assert/strict'
import { test } from 'node:test'
import { CLAVE_VER_COMO, decidirAcceso, leerVerComo, puedeVerComo, rolesEfectivos, verComoVigente } from '../src/demo/acceso.ts'
import {
  BASE,
  SECCIONES,
  VARIANTES_INGRESO,
  esPantallaCompleta,
  esPublica,
  esRutaDeGaleria,
  migasDe,
  resolverRuta,
  rutaDe,
  rutasConocidas,
  sugerencias,
} from '../src/demo/rutas.ts'
import type { Pantalla } from '../src/demo/rutas.ts'

/**
 * El enrutador de la galería de demostración y quién entra a qué: rutas, parámetros,
 * desconocidas, acceso con y sin sesión, el rol ADMIN y «Ver como». `npm run demo:quitar`
 * borra este archivo con la galería.
 */

test('cada ruta de la galería resuelve a su pantalla, con sus parámetros', () => {
  const casos: [string, Pantalla][] = [
    ['/demo', { id: 'portada' }],
    ['/demo/', { id: 'portada' }],
    ['/demo/vitrina', { id: 'vitrina' }],
    ['/demo/vitrina/data', { id: 'vitrina', familia: 'data' }],
    ['/demo/vitrina/data/data-grid', { id: 'vitrina', familia: 'data', componente: 'data-grid' }],
    ['/demo/vitrina/specialized/login-form/caso/3', { id: 'vitrina-caso', familia: 'specialized', componente: 'login-form', caso: 3 }],
    ['/demo/ingreso', { id: 'ingreso' }],
    ['/demo/ingreso/enlace-magico', { id: 'ingreso-variante', variante: 'enlace-magico' }],
    ['/demo/cuenta', { id: 'cuenta', seccion: 'perfil' }],
    ['/demo/cuenta/sesiones', { id: 'cuenta', seccion: 'sesiones' }],
    ['/demo/admin', { id: 'admin', seccion: 'resumen' }],
    ['/demo/admin/auditoria', { id: 'admin', seccion: 'auditoria' }],
    ['/demo/personalizacion', { id: 'personalizacion' }],
    ['/demo/profundidad', { id: 'profundidad' }],
    ['/demo/3d', { id: '3d' }],
    ['/demo/redimensionado', { id: 'redimensionado' }],
    ['/demo/accesibilidad', { id: 'accesibilidad' }],
  ]
  for (const [ruta, pantalla] of casos) assert.deepEqual(resolverRuta(ruta), pantalla, ruta)
})

test('lo que no existe es «desconocida», con la ruta tal cual llegó', () => {
  for (const ruta of [
    '/demo/nada',
    '/demo/ingreso/facebook',
    '/demo/ingreso/partido/otra',
    '/demo/cuenta/pagos',
    '/demo/admin/usuarios/7',
    '/demo/vitrina/Data',
    '/demo/vitrina/data/data-grid/caso/0',
    '/demo/vitrina/data/data-grid/caso/uno',
    '/demo/3d/lotes',
  ]) {
    assert.deepEqual(resolverRuta(ruta), { id: 'desconocida', ruta }, ruta)
  }
  assert.equal(esRutaDeGaleria('/demonio'), false, '/demonio no es de la galería')
  assert.equal(resolverRuta('/demonio').id, 'desconocida')
  assert.equal(esRutaDeGaleria('/demo'), true)
})

test('rutaDe es lo contrario de resolverRuta para todas las rutas conocidas', () => {
  for (const { ruta } of rutasConocidas()) assert.equal(rutaDe(resolverRuta(ruta)), ruta, ruta)
  assert.equal(rutaDe({ id: 'cuenta', seccion: 'perfil' }), `${BASE}/cuenta`)
  assert.equal(rutaDe({ id: 'vitrina-caso', familia: 'errors', componente: 'error-404', caso: 2 }), '/demo/vitrina/errors/error-404/caso/2')
})

test('las once variantes de ingreso y las secciones de la barra', () => {
  assert.equal(VARIANTES_INGRESO.length, 11)
  assert.deepEqual(
    VARIANTES_INGRESO.map((v) => v.id),
    ['partido', 'minimal', 'animado', 'vidrio', 'celular', 'enlace-magico', 'sso', 'dos-pasos', 'registro', 'recuperar', 'bloqueo'],
  )
  assert.equal(new Set(SECCIONES.map((s) => s.ruta)).size, SECCIONES.length)
  for (const s of SECCIONES) assert.notEqual(resolverRuta(s.ruta).id, 'desconocida', s.ruta)
})

test('públicas y a pantalla completa: solo el ingreso (y un caso de la vitrina, a pantalla completa)', () => {
  assert.equal(esPublica(resolverRuta('/demo/ingreso')), true)
  assert.equal(esPublica(resolverRuta('/demo/ingreso/sso')), true)
  assert.equal(esPublica(resolverRuta('/demo')), false)
  assert.equal(esPublica(resolverRuta('/demo/vitrina/errors/error-404/caso/1')), false)
  assert.equal(esPantallaCompleta(resolverRuta('/demo/vitrina/errors/error-404/caso/1')), true)
  assert.equal(esPantallaCompleta(resolverRuta('/demo/admin')), false)
})

test('las migas terminan en la pantalla actual, sin enlace', () => {
  const migas = migasDe(resolverRuta('/demo/admin/roles'))
  assert.deepEqual(
    migas.map((m) => m.label),
    ['Galería', 'Administración', 'Roles'],
  )
  assert.equal(migas.at(-1)?.href, undefined)
  assert.equal(migas[0]?.href, BASE)
})

test('una ruta desconocida sugiere las parecidas, y ninguna si nada se parece', () => {
  assert.equal(sugerencias('/demo/cuneta')[0]?.href, '/demo/cuenta')
  assert.equal(sugerencias('/demo/admin/usarios')[0]?.href, '/demo/admin/usuarios')
  assert.equal(sugerencias('/demo/personalisacion')[0]?.href, '/demo/personalizacion')
  assert.ok(sugerencias('/demo/ingreso/vidro').some((s) => s.href === '/demo/ingreso/vidrio'))
  assert.deepEqual(sugerencias('/demo/xqzwv'), [])
  assert.ok(sugerencias('/demo/cuenta/sesion').length <= 3)
})

const conSesion = (roles: string[]) => ({ roles })

test('sin sesión, toda la galería salvo el ingreso manda al ingreso con su destino', () => {
  assert.deepEqual(decidirAcceso(resolverRuta('/demo/cuenta'), null, null, '/demo/cuenta'), { tipo: 'ingresar', destino: '/demo/cuenta' })
  assert.deepEqual(decidirAcceso(resolverRuta('/demo/nada'), null, null, '/demo/nada?x=1'), { tipo: 'ingresar', destino: '/demo/nada?x=1' })
  assert.deepEqual(decidirAcceso(resolverRuta('/demo/ingreso/celular'), null, null, '/demo/ingreso/celular'), { tipo: 'permitido' })
})

test('la administración pide ADMIN; «Ver como» lo baja y nunca lo sube', () => {
  const admin = conSesion(['ADMIN', 'USER'])
  const usuario = conSesion(['USER'])
  const pantalla = resolverRuta('/demo/admin/usuarios')
  assert.deepEqual(decidirAcceso(pantalla, admin, null, ''), { tipo: 'permitido' })
  assert.deepEqual(decidirAcceso(pantalla, admin, 'usuario', ''), { tipo: 'prohibido', rol: 'Administración' })
  assert.deepEqual(decidirAcceso(pantalla, usuario, null, ''), { tipo: 'prohibido', rol: 'Administración' })
  assert.deepEqual(decidirAcceso(pantalla, usuario, 'admin', ''), { tipo: 'prohibido', rol: 'Administración' }, 'no sube')
  assert.deepEqual(decidirAcceso(resolverRuta('/demo/cuenta'), usuario, null, ''), { tipo: 'permitido' })

  assert.deepEqual(rolesEfectivos(['ADMIN', 'USER'], 'usuario'), ['USER'])
  assert.deepEqual(rolesEfectivos(['ADMIN', 'USER'], 'admin'), ['ADMIN', 'USER'])
  assert.deepEqual(rolesEfectivos(['USER'], 'admin'), ['USER'])
  assert.equal(puedeVerComo(['USER']), false, 'sin ADMIN no hay nada que bajar')
  assert.equal(verComoVigente(['ADMIN'], null), 'admin')
  assert.equal(verComoVigente(['USER'], 'admin'), 'usuario')
})

test('«Ver como» se lee de sessionStorage y lo que no es una opción no cuenta', () => {
  const almacen = (valor: string | null) => ({ getItem: (clave: string) => (clave === CLAVE_VER_COMO ? valor : null) })
  assert.equal(CLAVE_VER_COMO, 'aybar:galeria:ver-como')
  assert.equal(leerVerComo(almacen('usuario')), 'usuario')
  assert.equal(leerVerComo(almacen('root')), null)
  assert.equal(leerVerComo(null), null)
  assert.equal(
    leerVerComo({
      getItem: () => {
        throw new Error('almacenamiento bloqueado')
      },
    }),
    null,
  )
})
