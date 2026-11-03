import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AHORA_BASE, diasHabilesEntre, restarDiasHabiles, sumarDiasHabiles } from '../src/app/pantallas/atc/datos-atc.ts';
import {
  alertasLegalesDe,
  evaluarPlazoLibro,
  huellaSimulada,
  normalizarMonto,
  siguienteCorrelativo,
  ticketsHuerfanos,
  validarAsiento,
  validarRespuesta,
} from '../src/app/pantallas/atc/libro-reclamaciones.ts';

const sinRespuesta = (dias: number) => ({ venceOriginal: sumarDiasHabiles(AHORA_BASE, dias), respuesta: null });

test('libro: el vencimiento legal es a 15 días hábiles y no se prorroga', () => {
  const reg = restarDiasHabiles(AHORA_BASE, 4);
  assert.equal(diasHabilesEntre(reg, sumarDiasHabiles(reg, 15)), 15);
  assert.equal(diasHabilesEntre(AHORA_BASE, restarDiasHabiles(AHORA_BASE, 6)), -6);
});

test('libro: el plazo pasa de en plazo a por vencer, vencido y respondido', () => {
  assert.equal(evaluarPlazoLibro(sinRespuesta(10), AHORA_BASE, diasHabilesEntre).estado, 'EN_PLAZO');
  assert.equal(evaluarPlazoLibro(sinRespuesta(3), AHORA_BASE, diasHabilesEntre).estado, 'POR_VENCER');
  assert.equal(evaluarPlazoLibro(sinRespuesta(0), AHORA_BASE, diasHabilesEntre).texto, 'Vence hoy');
  const vencido = evaluarPlazoLibro({ venceOriginal: restarDiasHabiles(AHORA_BASE, 2), respuesta: null }, AHORA_BASE, diasHabilesEntre);
  assert.equal(vencido.estado, 'VENCIDO');
  assert.equal(vencido.tono, 'danger');
  const enPlazo = evaluarPlazoLibro({ venceOriginal: sumarDiasHabiles(AHORA_BASE, 5), respuesta: { fecha: AHORA_BASE } }, AHORA_BASE, diasHabilesEntre);
  assert.deepEqual([enPlazo.estado, enPlazo.texto], ['RESPONDIDO', 'Respondido en plazo']);
  const tarde = evaluarPlazoLibro({ venceOriginal: restarDiasHabiles(AHORA_BASE, 1), respuesta: { fecha: AHORA_BASE } }, AHORA_BASE, diasHabilesEntre);
  assert.equal(tarde.texto, 'Respondido fuera de plazo');
});

test('libro: alertas a 3 días hábiles y al vencer; lo respondido no alerta (HU-015 CA-01)', () => {
  const alertas = alertasLegalesDe(
    [
      { id: 'a', codigo: 'ALT-2026-0001', ...sinRespuesta(2) },
      { id: 'b', codigo: 'ALT-2026-0002', ...sinRespuesta(12) },
      { id: 'c', codigo: 'ALT-2026-0003', venceOriginal: restarDiasHabiles(AHORA_BASE, 1), respuesta: null },
      { id: 'd', codigo: 'ALT-2026-0004', venceOriginal: restarDiasHabiles(AHORA_BASE, 1), respuesta: { fecha: AHORA_BASE } },
    ],
    AHORA_BASE,
    diasHabilesEntre,
  );
  assert.deepEqual(
    alertas.map((x) => [x.asientoId, x.tipo]),
    [
      ['c', 'LEGAL_RESPONSE_OVERDUE'],
      ['a', 'LEGAL_EXTENSION_WINDOW_CLOSING'],
    ],
  );
});

test('libro: huérfano es ticket abierto de tipo con libro y sin asiento (HU-015 CA-02)', () => {
  const tickets = [
    { num: 'T1', type: 'REC', state: 'OPEN' },
    { num: 'T2', type: 'REC', state: 'OPEN' },
    { num: 'T3', type: 'QUE', state: 'CLOSED' },
    { num: 'T4', type: 'CTA', state: 'OPEN' },
  ];
  const huerfanos = ticketsHuerfanos(tickets, new Set(['REC', 'QUE']), [{ ticketNum: 'T1' }]);
  assert.deepEqual(huerfanos.map((t) => t.num), ['T2']);
});

test('libro: el correlativo corre por empresa y por establecimiento (HU-012 CA-01)', () => {
  const asientos = [
    { codigo: 'ALT-2026-0042', empresaId: 'ALT', establecimiento: 'Oficina Carabayllo' },
    { codigo: 'ALT-2026-0007', empresaId: 'ALT', establecimiento: 'Caseta Villa Sol II' },
  ];
  assert.equal(siguienteCorrelativo(asientos, 'ALT', 'Oficina Carabayllo').codigo, 'ALT-2026-0043');
  assert.equal(siguienteCorrelativo(asientos, 'ALT', 'Caseta Villa Sol II').numero, '0008');
  assert.equal(siguienteCorrelativo(asientos, 'AIN', 'Oficina Carabayllo').numero, '0001');
});

test('libro: con monto hace falta moneda y sin monto ambos quedan vacíos (HU-012 CA-02)', () => {
  const base = { ticketNum: 'T1', establecimiento: 'Oficina Carabayllo', hechos: 'Cobro indebido', pedido: 'Devolución', monto: '', moneda: '' };
  assert.deepEqual(validarAsiento(base), {});
  assert.ok(validarAsiento({ ...base, monto: '120' }).moneda);
  assert.deepEqual(validarAsiento({ ...base, monto: '120,50', moneda: 'PEN' }), {});
  assert.ok(validarAsiento({ ...base, monto: '-5', moneda: 'PEN' }).monto);
  assert.ok(validarAsiento({ ...base, ticketNum: '', hechos: ' ' }).ticketNum);
  assert.deepEqual(normalizarMonto('', 'USD'), { monto: null, moneda: null });
  assert.deepEqual(normalizarMonto('120,50', 'USD'), { monto: 120.5, moneda: 'USD' });
});

test('libro: la respuesta exige carta, cargo y constancia del derecho a INDECOPI (HU-014)', () => {
  const ok = { resumen: 'Se atendió el reclamo y se devolvió el cobro indebido.', carta: 'carta.pdf', cargo: 'cargo.pdf', derechoIndecopi: true };
  assert.deepEqual(validarRespuesta(ok), {});
  assert.ok(validarRespuesta({ ...ok, cargo: null }).cargo);
  assert.ok(validarRespuesta({ ...ok, carta: null }).carta);
  assert.ok(validarRespuesta({ ...ok, derechoIndecopi: false }).derechoIndecopi);
  assert.ok(validarRespuesta({ ...ok, resumen: 'ok' }).resumen);
});

test('libro: la huella de ejemplo tiene 64 hex y es estable por nombre', () => {
  assert.match(huellaSimulada('Carta_Respuesta.pdf'), /^[0-9a-f]{64}$/);
  assert.equal(huellaSimulada('a.pdf'), huellaSimulada('a.pdf'));
  assert.notEqual(huellaSimulada('a.pdf'), huellaSimulada('b.pdf'));
  assert.notEqual(huellaSimulada('Carta.pdf').slice(0, 16), huellaSimulada('Cargo.pdf').slice(0, 16));
});
