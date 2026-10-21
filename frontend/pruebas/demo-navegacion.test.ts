/**
 * La galería de demostración: su mapa de rutas (navegacion.ts) y el acceso con «Ver como»
 * (acceso.ts). Sin Angular: lo mismo que usan las migas, el 404 y las guardas.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import './demo-soporte.ts';

const nav = await import('../src/app/demo/navegacion.ts');
const acceso = await import('../src/app/demo/acceso.ts');

test('rutas · la portada, las secciones y sus migas', () => {
  const portada = nav.resolverRuta('/demo');
  assert.equal(portada.pantalla, 'portada');
  assert.deepEqual(portada.migas, [{ etiqueta: 'Galería' }]);
  for (const id of ['personalizacion', 'profundidad', '3d', 'redimensionado', 'accesibilidad']) {
    const r = nav.resolverRuta(`/demo/${id}`);
    assert.equal(r.pantalla, id);
    assert.equal(r.migas.length, 2);
    assert.equal(r.migas[0]?.ruta, '/demo');
    assert.equal(r.migas[1]?.ruta, undefined, 'la última miga es la página actual, sin enlace');
  }
  assert.equal(nav.resolverRuta('/demo/3d/').pantalla, '3d', 'la barra final no cuenta');
  assert.equal(nav.resolverRuta('/demo/3d?embebido=1#plano').pantalla, '3d', 'ni la consulta ni el fragmento');
});

test('rutas · la vitrina con familia, componente y caso numerado', () => {
  const nombres = {
    familia: (id: string) => (id === 'actions' ? 'Actions' : undefined),
    componente: (_f: string, slug: string) => (slug === 'button' ? 'Button' : undefined),
  };
  assert.deepEqual(nav.resolverRuta('/demo/vitrina/actions/button', nombres).parametros, { familia: 'actions', componente: 'button' });
  assert.equal(nav.resolverRuta('/demo/vitrina/actions/button', nombres).titulo, 'Button');
  assert.deepEqual(
    nav.resolverRuta('/demo/vitrina/actions', nombres).migas.map((m) => m.etiqueta),
    ['Galería', 'Vitrina', 'Actions'],
  );
  const caso = nav.resolverRuta('/demo/vitrina/actions/button/caso/3', nombres);
  assert.equal(caso.pantalla, 'caso');
  assert.equal(caso.parametros['n'], '3');
  assert.equal(caso.sinMarco, true, 'un caso va a pantalla completa');
  for (const mal of ['/demo/vitrina/actions/button/caso/0', '/demo/vitrina/actions/button/caso/x', '/demo/vitrina/a/b/c/1', '/demo/vitrina/a/b/caso/2/mas']) {
    assert.equal(nav.resolverRuta(mal).pantalla, 'desconocida', mal);
  }
});

test('rutas · las once variantes de ingreso, públicas y en círculo', () => {
  assert.equal(nav.VARIANTES_INGRESO.length, 11);
  assert.equal(new Set(nav.VARIANTES_INGRESO.map((v) => v.id)).size, 11);
  const partido = nav.resolverRuta('/demo/ingreso/partido');
  assert.equal(partido.pantalla, 'ingreso-variante');
  assert.equal(partido.publica, true);
  assert.equal(partido.sinMarco, true);
  assert.equal(nav.resolverRuta('/demo/ingreso/no-existe').pantalla, 'desconocida');
  assert.equal(nav.vecinasDe('partido')?.anterior.id, 'bloqueo', 'antes de la primera, la última');
  assert.equal(nav.vecinasDe('bloqueo')?.siguiente.id, 'partido');
  assert.equal(nav.vecinasDe('nada'), null);
});

test('rutas · cuenta y administración con su subsección por omisión', () => {
  assert.deepEqual(nav.resolverRuta('/demo/cuenta').parametros, { seccion: 'perfil' });
  assert.deepEqual(nav.resolverRuta('/demo/cuenta/seguridad').parametros, { seccion: 'seguridad' });
  assert.equal(nav.resolverRuta('/demo/cuenta/claves').pantalla, 'desconocida');
  const usuarios = nav.resolverRuta('/demo/admin/usuarios');
  assert.equal(usuarios.pantalla, 'admin');
  assert.equal(usuarios.soloAdmin, true);
  assert.equal(usuarios.titulo, 'Administración · Usuarios');
});

test('rutas · lo desconocido sugiere lo que más se parece', () => {
  assert.equal(nav.resolverRuta('/demo/nada').pantalla, 'desconocida');
  assert.equal(nav.resolverRuta('/otra').pantalla, 'desconocida');
  assert.equal(nav.sugerencias('/demo/cuneta')[0]?.ruta, '/demo/cuenta');
  assert.equal(nav.sugerencias('/demo/admin/usu')[0]?.ruta, '/demo/admin/usuarios');
  assert.equal(nav.sugerencias('/demo/personalisacion')[0]?.ruta, '/demo/personalizacion');
  assert.equal(nav.sugerencias('/demo/ingreso/vidro')[0]?.ruta, '/demo/ingreso/vidrio');
  assert.equal(nav.sugerencias('/demo/xyz', 3).length, 3);
  assert.deepEqual(nav.sugerencias('/demo'), []);
  assert.equal(nav.distancia('cuenta', 'cuneta'), 2);
});

test('rutas · embebida solo con ?embebido=1', () => {
  assert.equal(nav.esEmbebida('/demo/cuenta?embebido=1'), true);
  assert.equal(nav.esEmbebida('http://localhost:4200/demo?x=1&embebido=1#a'), true);
  assert.equal(nav.esEmbebida('/demo/cuenta?embebido=0'), false);
  assert.equal(nav.esEmbebida('/demo/cuenta#embebido=1'), false);
});

test('acceso · «Ver como» baja los roles y nunca los sube', () => {
  assert.deepEqual(acceso.rolesEfectivos(['ADMIN', 'USER'], 'usuario'), ['USER']);
  assert.deepEqual(acceso.rolesEfectivos(['ADMIN', 'USER'], 'admin'), ['ADMIN', 'USER']);
  assert.deepEqual(acceso.rolesEfectivos(['USER'], 'admin'), ['USER'], 'Administración no da ADMIN a quien no lo tiene');
});

test('acceso · «Ver como» se recuerda en sessionStorage, y sin él vale Administración', () => {
  const almacen = new Map<string, string>();
  const falso = { getItem: (k: string) => almacen.get(k) ?? null, setItem: (k: string, v: string) => void almacen.set(k, v) };
  assert.equal(acceso.leerVerComo(falso), 'admin');
  acceso.guardarVerComo(falso, 'usuario');
  assert.equal(almacen.get(acceso.CLAVE_VER_COMO), 'usuario');
  assert.equal(acceso.leerVerComo(falso), 'usuario');
  almacen.set(acceso.CLAVE_VER_COMO, 'superusuario');
  assert.equal(acceso.leerVerComo(falso), 'admin', 'un valor desconocido no cuenta');
  const roto = {
    getItem: () => {
      throw new Error('sin permiso');
    },
    setItem: () => {
      throw new Error('sin permiso');
    },
  };
  assert.equal(acceso.leerVerComo(roto), 'admin');
  assert.doesNotThrow(() => acceso.guardarVerComo(roto, 'usuario'));
  assert.equal(acceso.leerVerComo(null), 'admin');
});

test('acceso · ingreso público, lo demás con sesión y administración con ADMIN', () => {
  const admin = { roles: ['ADMIN', 'USER'] };
  const usuario = { roles: ['USER'] };
  assert.equal(acceso.accesoA('/demo/ingreso', null, 'admin'), 'permitido');
  assert.equal(acceso.accesoA('/demo/ingreso/celular', null, 'admin'), 'permitido');
  assert.equal(acceso.accesoA('/demo/vitrina', null, 'admin'), 'ingresar');
  assert.equal(acceso.accesoA('/demo/vitrina', usuario, 'admin'), 'permitido');
  assert.equal(acceso.accesoA('/demo/admin/usuarios', usuario, 'admin'), 'prohibido');
  assert.equal(acceso.accesoA('/demo/admin/usuarios', admin, 'usuario'), 'prohibido', 'viendo como usuario');
  assert.equal(acceso.accesoA('/demo/admin/roles', admin, 'admin'), 'permitido');
  assert.equal(acceso.accesoA('/', null, 'admin'), 'permitido', 'fuera de la galería no decide');
});
