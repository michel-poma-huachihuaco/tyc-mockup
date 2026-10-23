import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calcularTorre } from '../src/app/pantallas/atc/indicadores-torre.ts';

const AHORA = new Date(Date.UTC(2026, 9, 19, 15, 0));
const h = (n: number) => new Date(AHORA.getTime() + n * 3600000);
// Misma regla que evaluarSlaTicket (datos-atc.ts), reducida a lo que la prueba necesita.
const evaluarSla = (x: { frDue: Date; opened: Date }) => {
  const rem = x.frDue.getTime() - AHORA.getTime();
  const tono = rem < 0 ? 'danger' : rem / (x.frDue.getTime() - x.opened.getTime()) < 0.25 ? 'warning' : 'success';
  return { tono } as const;
};
const deps = { areas: ['ATC', 'LEGAL'], estados: ['OPEN', 'RESOLVED'], evaluarSla } as never;
const t = (o: Record<string, unknown>) =>
  ({ state: 'OPEN', area: 'ATC', opened: h(-10), frDue: h(10), resDue: h(40), ...o }) as never;

test('torre · conteos por área×estado, SLA por área y KPIs', () => {
  const r = calcularTorre([
    t({}), // en plazo
    t({ area: 'LEGAL', frDue: h(-1) }), // vencido
    t({ area: 'LEGAL', frDue: h(1) }), // en riesgo (<25 %)
    t({ area: 'LEGAL', state: 'RESOLVED' }), // cerrado: no cuenta en SLA
    t({ area: 'OTRA' }), // área fuera del catálogo: se ignora
  ], deps);
  assert.equal(r.abiertos, 3);
  assert.equal(r.vencidos, 1);
  assert.equal(r.cumplimientoSla, 66.7);
  const legal = r.areaEstado.find((a) => a.area === 'LEGAL')!;
  assert.equal(legal.total, 3);
  assert.deepEqual(r.slaPorArea.find((a) => a.area === 'LEGAL'), { area: 'LEGAL', enPlazo: 0, enRiesgo: 1, vencido: 1 });
  assert.equal(r.porEstado.reduce((s, n) => s + n, 0), 4);
  assert.equal(calcularTorre([], deps).cumplimientoSla, null);
});
