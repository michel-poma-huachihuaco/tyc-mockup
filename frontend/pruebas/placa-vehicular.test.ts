import assert from 'node:assert/strict';
import { test } from 'node:test';
import { normalizarPlaca, placaValida } from '../src/app/pantallas/atc/placa-vehicular.ts';

test('placa: normaliza a ABC-123, vacío es válido y el formato incorrecto no', () => {
  assert.equal(normalizarPlaca(' abc123 '), 'ABC-123');
  assert.equal(normalizarPlaca('abc-123'), 'ABC-123');
  assert.ok(placaValida('') && placaValida('ABC-123') && placaValida('a1b234'));
  assert.ok(!placaValida('AB-1234') && !placaValida('ABCD-12') && !placaValida('AB'));
});
