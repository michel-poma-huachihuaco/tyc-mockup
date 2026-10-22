import assert from 'node:assert/strict';
import { test } from 'node:test';
import { alternarFavorito, guardarFavoritos, leerFavoritos } from '../src/app/pantallas/atc/favoritos-atc.ts';

test('favoritos · alternar y no borrar al pasar de cinco', () => {
  let ids: string[] = [];
  for (const id of ['a', 'b', 'c', 'd', 'e', 'f', 'g']) ids = alternarFavorito(ids, id);
  assert.equal(ids.length, 7);
  assert.deepEqual(alternarFavorito(ids, 'a'), ['b', 'c', 'd', 'e', 'f', 'g']);
});

test('favoritos · por persona, y un almacén que falla no rompe', () => {
  const mem = new Map<string, string>();
  const alm = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v) };
  guardarFavoritos('p-lucia', ['bandeja'], alm);
  assert.deepEqual(leerFavoritos('p-lucia', alm), ['bandeja']);
  assert.deepEqual(leerFavoritos('p-diego', alm), []);
  mem.set('aybar-atc:favoritos:p-x', '{roto');
  assert.deepEqual(leerFavoritos('p-x', alm), []);
  const roto = { getItem: () => { throw new Error('bloqueado'); }, setItem: () => { throw new Error('bloqueado'); } };
  assert.deepEqual(leerFavoritos('p-lucia', roto), []);
  guardarFavoritos('p-lucia', ['a'], roto);
});
