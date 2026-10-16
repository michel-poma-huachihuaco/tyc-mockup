/**
 * Reglas sin Angular: el destino tras iniciar sesión, la URL de plantilla, la sesión, los
 * usuarios demo, el selector de tema, el arranque de la apariencia y la terminal de la
 * bienvenida. Corren con `npm test` (node --test, con los tipos borrados por Node: sin
 * compilar).
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import { destinoSeguro, esUrlDePlantilla, rutaIngreso } from '../src/app/rutas.ts';
import { esSesionDemo, nombreVisible, rolesDeUsuarioDemo, rolesVisibles, usuariosDemo } from '../src/app/sesion.ts';
import { OPCIONES_TEMA, esPreferenciaTema, etiquetaTema } from '../src/app/tema.ts';
import { piezasDeComando } from '../src/app/terminal.ts';

test('destino · solo rutas de este sitio: nada de redirecciones abiertas', () => {
  assert.equal(destinoSeguro('/reservas/402'), '/reservas/402');
  assert.equal(destinoSeguro('/ejemplo?vista=lista#arriba'), '/ejemplo?vista=lista#arriba');
  for (const ajeno of ['https://otro.example', '//otro.example', '/\\otro.example', 'javascript:alert(1)', 'reservas', '']) {
    assert.equal(destinoSeguro(ajeno), '/', `aceptó ${ajeno}`);
  }
  assert.equal(destinoSeguro(null), '/');
  assert.equal(destinoSeguro(undefined), '/');
});

test('ingreso · lleva el destino codificado, salvo el inicio', () => {
  assert.equal(rutaIngreso('/'), '/ingresar');
  assert.equal(rutaIngreso('https://otro.example'), '/ingresar');
  assert.equal(rutaIngreso('/ejemplo/detalle?x=1'), '/ingresar?destino=%2Fejemplo%2Fdetalle%3Fx%3D1');
});

test('backend · la URL de plantilla no se llama; una del mismo origen sí', () => {
  assert.equal(esUrlDePlantilla('https://api.aybar.local'), true);
  assert.equal(esUrlDePlantilla('https://aybar.local/api'), true);
  assert.equal(esUrlDePlantilla('http://localhost:8081'), false);
  assert.equal(esUrlDePlantilla('/api'), false);
});

test('sesión · la demo se reconoce por su marca y el nombre cae al identificador', () => {
  const base = { usuarioId: 'admin', nombre: null, roles: ['USER'] };
  assert.equal(esSesionDemo({ ...base, atributos: { demo: true } }), true);
  assert.equal(esSesionDemo(base), false);
  assert.equal(esSesionDemo(null), false);
  assert.equal(nombreVisible(base), 'admin');
  assert.equal(nombreVisible({ ...base, nombre: 'Administrador Aybar' }), 'Administrador Aybar');
});

test('sesión · el menú de la cuenta nombra los roles, o dice que no hay', () => {
  assert.equal(rolesVisibles({ usuarioId: 'admin', nombre: null, roles: ['USER', 'ADMIN'] }), 'USER, ADMIN');
  assert.equal(rolesVisibles({ usuarioId: 'u', nombre: null, roles: [] }), 'Sin roles');
});

test('demo · uno o varios usuarios; el que no trae usuario o clave no cuenta', () => {
  const admin = { usuario: 'admin', clave: 'demo-admin', nombre: 'Administrador Aybar', roles: ['ADMIN', 'USER'] };
  const usuario = { usuario: 'usuario', clave: 'demo-usuario', roles: ['USER'] };
  assert.deepEqual(usuariosDemo([admin, usuario]), [admin, usuario]);
  assert.deepEqual(usuariosDemo(admin), [admin], 'un objeto suelto, como hasta el framework 0.2.0');
  assert.deepEqual(usuariosDemo(null), []);
  assert.deepEqual(usuariosDemo(undefined), []);
  assert.deepEqual(usuariosDemo([{ usuario: ' ', clave: 'x' }, { usuario: 'a', clave: '' }, usuario]), [usuario]);
});

test('demo · el ingreso muestra los roles de cada usuario; sin roles, USER como la sesión', () => {
  assert.equal(rolesDeUsuarioDemo({ usuario: 'admin', clave: 'x', roles: ['ADMIN', 'USER'] }), 'ADMIN, USER');
  assert.equal(rolesDeUsuarioDemo({ usuario: 'usuario', clave: 'x' }), 'USER');
});

test('tema · claro, oscuro y volver a seguir al sistema', () => {
  assert.deepEqual(
    OPCIONES_TEMA.map((o) => o.valor),
    ['light', 'dark', 'system'],
  );
  for (const { valor } of OPCIONES_TEMA) assert.equal(esPreferenciaTema(valor), true);
  assert.equal(esPreferenciaTema('salir'), false);
  assert.equal(new Set(OPCIONES_TEMA.map((o) => o.etiqueta[0])).size, 3, 'la letra de cada opción salta a ella');
});

test('tema · el botón dice el elegido y, siguiendo al sistema, el que se ve', () => {
  assert.equal(etiquetaTema('light', 'light'), 'Tema: claro');
  assert.equal(etiquetaTema('dark', 'dark'), 'Tema: oscuro');
  assert.equal(etiquetaTema('system', 'dark'), 'Tema: según el sistema (oscuro)');
  assert.equal(etiquetaTema('system', 'light'), 'Tema: según el sistema (claro)');
});

test('apariencia · index.html carga el arranque tras <base> y angular.json lo copia', () => {
  const html = readFileSync(new URL('../src/index.html', import.meta.url), 'utf8');
  const arranque = html.indexOf('<script src="apariencia-arranque.js"></script>');
  assert.ok(arranque > 0, 'src/index.html no carga apariencia-arranque.js');
  assert.ok(html.indexOf('<base href=') < arranque, 'la ruta del script se resuelve contra <base>: va después');
  assert.ok(arranque < html.indexOf('</head>'), 'el arranque va en el <head>, antes del primer pintado');

  const angular = JSON.parse(readFileSync(new URL('../angular.json', import.meta.url), 'utf8'));
  const proyecto = Object.values(angular.projects)[0] as { architect: { build: { options: { assets: unknown[] } } } };
  const copia = proyecto.architect.build.options.assets.find(
    (a) => typeof a === 'object' && a !== null && (a as { glob?: string }).glob === 'apariencia-arranque.js',
  ) as { input: string; output: string } | undefined;
  assert.ok(copia, 'angular.json no copia apariencia-arranque.js');
  assert.equal(copia.output, '/');
  // Si @aybarcorp/tokens deja de publicarlo, que falle la prueba y no el primer `ng serve`.
  assert.ok(existsSync(new URL(`../${copia.input}/apariencia-arranque.js`, import.meta.url)));
});

test('terminal · corta los comandos entre piezas: una opción no se separa de su valor', () => {
  assert.deepEqual(piezasDeComando('aybar new project demo --backend --frontend --ui angular --papel remoto'), [
    'aybar',
    'new',
    'project',
    'demo',
    '--backend',
    '--frontend',
    '--ui angular',
    '--papel remoto',
  ]);
  assert.deepEqual(piezasDeComando('  aybar   run --frontend '), ['aybar', 'run', '--frontend']);
  assert.deepEqual(piezasDeComando(''), []);
});
