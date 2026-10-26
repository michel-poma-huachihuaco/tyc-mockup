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
const { AHORA_BASE } = await import(`${atc}datos-atc.ts`);
const { agruparPorResponsable, textoHaceDesde } = await import(`${atc}indicadores-responsables.ts`);

const h = (n: number) => new Date(AHORA_BASE.getTime() - n * 3600000);
const t = (o: Record<string, unknown>) =>
  ({
    state: 'IN_PROGRESS', area: 'ATC', owner: 'A', opened: h(5), frDue: h(1), resDue: h(-20),
    firstResp: undefined, log: [], interactions: [], status: [], ...o,
  }) as never;

test('responsables · carga, estados, SLA, último movimiento, orden y «Sin asignar»', () => {
  const tickets = [
    t({ owner: 'A', frDue: h(-3), status: [{ fecha: h(2), estado: 'OPEN', autor: 'A' }] }), // en plazo
    t({ owner: 'B', state: 'OPEN', frDue: h(1) }), // 1.ª resp. vencida
    t({ owner: 'B', state: 'RESOLVED', area: 'LEGAL', log: [{ fecha: h(0.5) }] }),
    t({ owner: null, frDue: h(-3) }),
  ];
  const f = agruparPorResponsable(tickets, '', 'riesgo');
  assert.deepEqual(f.map((x) => x.nombre), ['B', 'A', 'Sin asignar']);
  assert.equal(f[0].carga, 1);
  assert.equal(f[0].vencidos, 1);
  assert.deepEqual(f[0].porEstado, { OPEN: 1, RESOLVED: 1 });
  assert.equal(f[0].ultimoMovimiento?.getTime(), h(0.5).getTime());
  assert.deepEqual(agruparPorResponsable(tickets, 'LEGAL', 'carga').map((x) => x.nombre), ['B']);
  assert.equal(agruparPorResponsable(tickets, '', 'movimiento')[0].nombre, 'B');
  assert.equal(textoHaceDesde(h(0.5)), 'hace 30 min');
  assert.equal(textoHaceDesde(null), 'Sin movimientos');
});
