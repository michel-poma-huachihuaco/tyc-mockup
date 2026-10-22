import assert from 'node:assert/strict';
import { test } from 'node:test';
import { evaluarContextoMorosidad } from '../src/app/pantallas/atc/contexto-morosidad.ts';

test('morosidad · «más de tres cuotas»: 3 no cumple, 4 sí', () => {
  assert.equal(evaluarContextoMorosidad(3).superaCondicion, false);
  assert.equal(evaluarContextoMorosidad(4).superaCondicion, true);
  assert.equal(evaluarContextoMorosidad(2).superaCondicion, false);
});

test('morosidad · etapa de negociación sin dato queda visible como pendiente', () => {
  assert.match(evaluarContextoMorosidad(3).etapaNegociacion, /pendiente/);
  assert.equal(evaluarContextoMorosidad(4, 'Propuesta enviada').etapaNegociacion, 'Propuesta enviada');
});
