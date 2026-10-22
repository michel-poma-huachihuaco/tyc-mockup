/** V360-01 (últimos movimientos) y GRA-03 (contexto del grafo): reglas puras, sin Angular. */
import assert from 'node:assert/strict';
import { register } from 'node:module';
import { test } from 'node:test';

// Los fuentes de Angular importan sin extensión ('./datos-atc'): el loader la añade solo en esta prueba.
register(
  'data:text/javascript,' +
    encodeURIComponent(
      "export async function resolve(s,c,n){try{return await n(s,c)}catch(e){if(s.startsWith('.'))return n(s+'.ts',c);throw e}}",
    ),
);
const atc = '../src/app/pantallas/atc/';
const { CLIENTES_360, FUENTES_360, NODOS_360 } = await import(`${atc}datos-atc.ts`);
const { MAX_MOVIMIENTOS_360, ultimosMovimientos } = await import(`${atc}datos-movimientos.ts`);
const { CONTEXTO_VACIO, contextoDe, idRelacion } = await import(`${atc}relaciones-360.ts`);

test('movimientos · máximo 5, del más reciente al más antiguo y distintos por cliente', () => {
  for (const c of CLIENTES_360 as { k: string; dni: string }[]) {
    const m = ultimosMovimientos(c);
    assert.ok(m.length <= MAX_MOVIMIENTOS_360);
    for (let i = 1; i < m.length; i++) assert.ok(m[i - 1].fecha >= m[i].fecha, c.k);
  }
  const jr = ultimosMovimientos(CLIENTES_360.find((c: { k: string }) => c.k === 'jr')!);
  assert.equal(jr.length, 5);
  assert.ok(jr.some((x: { tipo: string }) => x.tipo === 'reclamo'));
  assert.notDeepEqual(
    jr.map((x: { id: string }) => x.id),
    ultimosMovimientos(CLIENTES_360.find((c: { k: string }) => c.k === 'eh')!).map((x: { id: string }) => x.id),
  );
});

test('movimientos · menos de cinco y sin movimientos', () => {
  assert.equal(ultimosMovimientos(CLIENTES_360.find((c: { k: string }) => c.k === 'rh')!).length < 5, true);
  assert.deepEqual(ultimosMovimientos({ k: 'nadie', dni: '0' }), []);
});

const entrada = {
  fuentes: FUENTES_360,
  nodos: NODOS_360,
  procesoDe: (id: string) => (id === 'libro' ? 'Libro e INDECOPI' : undefined),
  areasDe: (id: string) => (id === 'libro' ? ['LEGAL', 'INVENTADA'] : []),
  catalogoAreas: ['LEGAL', 'ATC'],
};

test('contexto · nodo: sus fuentes, relaciones con id y tipo, áreas solo del catálogo', () => {
  const c = contextoDe('libro', entrada);
  assert.deepEqual([...c.ids].sort(), ['atc', 'c', 'libro']);
  assert.deepEqual(c.relaciones.map((r: { id: string; tipo: string }) => [r.id, r.tipo]).sort(), [
    [idRelacion('atc', 'libro'), 'alimenta'],
    [idRelacion('c', 'atc'), 'consulta'],
  ]);
  assert.deepEqual(c.areas, ['LEGAL']);
  assert.deepEqual(c.procesos, ['Libro e INDECOPI']);
});

test('contexto · fuente trae los datos que alimenta; selección vacía o desconocida limpia', () => {
  assert.ok(contextoDe('sigda', entrada).ids.has('kyc'));
  assert.equal(contextoDe('', entrada), CONTEXTO_VACIO);
  assert.equal(contextoDe('zzz', entrada), CONTEXTO_VACIO);
});
