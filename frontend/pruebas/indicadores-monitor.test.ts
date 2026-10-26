import assert from 'node:assert/strict';
import { test } from 'node:test';
import { nombreArea } from '../src/app/pantallas/atc/etiquetas-es.ts';
import { calcularIndicadores, textoHace } from '../src/app/pantallas/atc/indicadores-monitor.ts';

const h = (n: number) => new Date(Date.UTC(2026, 9, 19, 15, 0) - n * 3600000);
const t = (o: Record<string, unknown>) => ({ state: 'OPEN', area: 'ATC', owner: null, opened: h(1), ...o }) as never;

test('monitor · ingresados, resueltos, áreas, promedios y personas', () => {
  const ahora = h(0);
  const r = calcularIndicadores(
    [
      t({ owner: 'A' }),
      t({ area: 'LEGAL', owner: 'A', opened: h(30), firstResp: h(28) }),
      t({ state: 'RESOLVED', owner: 'B', opened: h(4), resolvedAt: h(2) }),
      t({ state: 'RESOLVED', owner: 'B', opened: h(50), resolvedAt: h(40) }),
    ],
    ahora,
  );
  assert.equal(r.ingresadosDia, 2);
  assert.equal(r.resueltosDia, 1);
  assert.deepEqual(r.porArea.map((a) => a.abiertos), [1, 1]);
  assert.equal(r.promedioPrimeraRespuestaH, 2);
  assert.equal(r.promedioResolucionH, 6);
  assert.equal(r.promedioPorPersona, 1.5);
  assert.equal(r.porPersona[0].persona, 'A');
  assert.equal(calcularIndicadores([], ahora).promedioResolucionH, null);
  assert.equal(textoHace(75), 'hace 1 min');
});

test('monitor · nombre legible de área', () => {
  assert.equal(nombreArea('ADMINISTRACION'), 'Administración');
  assert.equal(nombreArea('OTRA'), 'Otra');
});
