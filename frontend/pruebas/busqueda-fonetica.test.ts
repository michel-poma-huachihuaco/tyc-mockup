/** BUS-01 · búsqueda fonética: ejemplo de la reunión, falsos positivos y tiempo medido. */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buscarCandidatos, clavesDeNombre } from '../src/app/pantallas/atc/busqueda-fonetica.ts';

interface R { k: string; nombre: string; dni: string }
const op = { nombre: (r: R) => r.nombre, exactos: (r: R) => [r.nombre, r.dni] };
const lista = (...n: string[]): R[] => n.map((nombre, i) => ({ k: `c${i}`, nombre, dni: String(40000000 + i) }));
const nombres = (c: { item: R }[]) => c.map((x) => x.item.nombre);

test('Alvan encuentra Alban y Halban', () => {
  const r = buscarCandidatos(lista('Rosa Alban Pérez', 'Luis Halban', 'Juan Torres'), 'Alvan', op);
  assert.deepEqual(nombres(r), ['Rosa Alban Pérez', 'Luis Halban']);
  assert.ok(r.every((x) => x.motivo === 'fonetica'));
});

test('exacta y DNI van primero y con motivo exacta', () => {
  const l = lista('Pedro Alban', 'Alvan Soto', 'Halban Ruiz');
  const r = buscarCandidatos(l, 'alvan', op);
  assert.equal(r[0].motivo, 'exacta');
  assert.deepEqual(nombres(r), ['Alvan Soto', 'Pedro Alban', 'Halban Ruiz']);
  assert.deepEqual(nombres(buscarCandidatos(l, '40000001', op)), ['Alvan Soto']); // DNI: sin fonética
});

test('equivalencias del español', () => {
  const pares = [['Vásquez', 'Basquez'], ['Gonzales', 'Gonzalez'], ['Zegarra', 'Segarra'], ['Cevallos', 'Sebayos'],
    ['Quispe', 'Kispe'], ['Guerra', 'Gerra'], ['Jiménez', 'Giménez'], ['Nuñez', 'Nunez'], ['Hernandez', 'Ernandez'],
    ['Mendoza', 'Mendosa'], ['Valle', 'Balle'], ['Pozo', 'Poso'], ['Chavez', 'Chaves'], ['Ayllon', 'Ayyon']];
  for (const [a, b] of pares) assert.equal(clavesDeNombre(a)[0], clavesDeNombre(b)[0], `${a}/${b}`);
});

test('apellidos peruanos distintos NO coinciden', () => {
  const noDeben = [['Rojas', 'Rocha'], ['Torres', 'Flores'], ['Quispe', 'Quiroz'], ['Ramos', 'Ramirez'], ['Garcia', 'Garces'],
    ['Huaman', 'Guaman'], ['Huaman', 'Huamani'], ['Castro', 'Castillo'], ['Mamani', 'Mamami'], ['Chavez', 'Chavarria'],
    ['Vargas', 'Vega'], ['Sanchez', 'Sanchis'], ['Lopez', 'Lozano'], ['Salas', 'Salazar'],
    ['Condori', 'Condor']];
  for (const [a, b] of noDeben) {
    if (/\d/.test(b)) continue; // marcador: caso de dígitos, no aplica
    assert.equal(buscarCandidatos(lista(b), a, { ...op, exactos: () => [] }).length, 0, `${a} no debe encontrar ${b}`);
  }
  // Documentado: Flores/Flórez SÍ coinciden (z/s y tilde).
  assert.equal(buscarCandidatos(lista('Flórez'), 'Flores', { ...op, exactos: () => [] }).length, 1);
});

test('varios empatados: devuelve todos con id, no elige', () => {
  const r = buscarCandidatos(lista('Ana Alban', 'Eva Halban', 'Teo Alvan'), 'alvann', op);
  assert.equal(r.length, 3);
  assert.equal(new Set(r.map((x) => x.item.k)).size, 3);
});

test('tiempo con 10.000 registros sintéticos (se informa, sin umbral)', () => {
  const nom = ['Juan', 'Rosa', 'Luis', 'Ana', 'Carlos', 'Maria', 'Pedro', 'Elena'];
  const ape = ['Alban', 'Quispe', 'Huaman', 'Torres', 'Vasquez', 'Rojas', 'Mamani', 'Flores', 'Garcia', 'Ramos', 'Chavez', 'Soto'];
  const l: R[] = Array.from({ length: 10000 }, (_, i) => ({
    k: `c${i}`, dni: String(10000000 + i),
    nombre: `${nom[i % 8]} ${ape[i % 12]} ${ape[(i * 7 + 3) % 12]}`,
  }));
  const t0 = performance.now();
  const sinIndice = buscarCandidatos(l, 'Alvan', op);
  const t1 = performance.now();
  const claves = new Map(l.map((r) => [r, clavesDeNombre(r.nombre)]));
  const t2 = performance.now();
  const conIndice = buscarCandidatos(l, 'Alvan', { ...op, claves: (r) => claves.get(r)! });
  const t3 = performance.now();
  console.log(`MEDICION 10000 registros: sin indice ${(t1 - t0).toFixed(1)} ms; indexar ${(t2 - t1).toFixed(1)} ms; con indice ${(t3 - t2).toFixed(1)} ms; coincidencias ${sinIndice.length}`);
  assert.equal(sinIndice.length, conIndice.length);
});
