/**
 * La búsqueda global de la galería (Ctrl K) y sus sinónimos en español, sobre un catálogo
 * de prueba con la forma de CATALOGO_VITRINA.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import './demo-soporte.ts';

const { alternativas, normalizar } = await import('../src/app/demo/sinonimos.ts');
const { buscar, crearIndice } = await import('../src/app/demo/busqueda.ts');

const caso = (etiqueta: string) => ({ etiqueta });
const CATALOGO = {
  familias: [
    {
      id: 'data',
      nombre: 'Data',
      componentes: [
        { nombre: 'Data Grid', slug: 'data-grid', descripcion: 'Rejilla para trabajar sobre registros.', grupos: [{ titulo: 'Selección', casos: [caso('con selección'), caso('vacía')] }] },
        { nombre: 'Table', slug: 'table', grupos: [{ titulo: 'Orden', casos: [caso('ordenable')] }] },
      ],
    },
    {
      id: 'overlays',
      nombre: 'Overlays',
      componentes: [
        { nombre: 'Modal', slug: 'modal', grupos: [{ titulo: 'Tamaños', casos: [caso('sm'), caso('lg')] }] },
        { nombre: 'Dialog', slug: 'dialog', grupos: [] },
      ],
    },
    {
      id: 'form-controls',
      nombre: 'Form Controls',
      componentes: [{ nombre: 'Password Input', slug: 'password-input', grupos: [{ titulo: 'Creación', casos: [caso('con requisitos')] }] }],
    },
  ],
};
const indice = crearIndice(CATALOGO);
const titulos = (consulta: string) => buscar(indice, consulta).flatMap((g) => g.entradas.map((e) => e.titulo));

test('sinónimos · normaliza sin tildes, mayúsculas ni signos', () => {
  assert.equal(normalizar('  Contraseña  ÚNICA! '), 'contrasena unica');
  assert.equal(normalizar('Data-Grid'), 'data grid');
});

test('sinónimos · la consulta va primera y suma las palabras de su grupo', () => {
  const tabla = alternativas('Tabla');
  assert.equal(tabla[0], 'tabla');
  assert.ok(tabla.includes('data grid') && tabla.includes('table'));
  assert.ok(alternativas('tabla de usuarios').includes('data grid de usuarios'), 'cambia la palabra dentro de la frase');
  assert.ok(alternativas('ventana').includes('modal'));
  assert.ok(alternativas('contraseña').includes('password input'));
  assert.ok(alternativas('contra').includes('password input'), 'una palabra a medias, de cuatro letras o más');
  assert.deepEqual(alternativas('con'), ['con'], 'tres letras no completan');
  assert.deepEqual(alternativas('   '), []);
  assert.ok(alternativas('tema').includes('personalizacion'));
});

test('búsqueda · encuentra por sinónimo componentes, casos y pantallas', () => {
  const tabla = titulos('tabla');
  assert.ok(tabla.includes('Data Grid') && tabla.includes('Table'));
  assert.ok(titulos('ventana').includes('Modal'));
  assert.ok(titulos('contraseña').includes('Password Input'));
  assert.ok(titulos('3d').includes('Visor 3D'));
  assert.ok(titulos('paleta').includes('Personalización'));
  assert.ok(titulos('login').some((t) => t.startsWith('Ingreso')));
  assert.ok(titulos('usuarios').includes('Usuarios'));
  assert.deepEqual(buscar(indice, ''), []);
});

test('búsqueda · lo exacto primero, agrupado y con su ruta', () => {
  const grupos = buscar(indice, 'modal');
  const componentes = grupos.find((g) => g.etiqueta === 'Componentes');
  assert.equal(componentes?.entradas[0]?.titulo, 'Modal');
  assert.equal(componentes?.entradas[0]?.ruta, '/demo/vitrina/overlays/modal');
  const casos = grupos.find((g) => g.etiqueta === 'Casos');
  assert.equal(casos?.entradas[1]?.ruta, '/demo/vitrina/overlays/modal/caso/2', 'el caso n cuenta desde 1 a través de los grupos');
  assert.deepEqual(
    grupos.map((g) => g.etiqueta),
    ['Componentes', 'Casos'],
  );
  const cuenta = buscar(indice, 'cuenta');
  assert.equal(cuenta[0]?.etiqueta, 'Galería');
  assert.equal(cuenta[0]?.entradas[0]?.ruta, '/demo/cuenta');
});

test('búsqueda · sin catálogo, las pantallas de la galería', () => {
  const solo = crearIndice();
  assert.ok(solo.every((e) => e.tipo === 'pantalla'));
  assert.ok(solo.length >= 10 + 5 + 4 + 11, 'secciones, subsecciones y variantes de ingreso');
});
