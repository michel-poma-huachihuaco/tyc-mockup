import assert from 'node:assert/strict';
import { test } from 'node:test';
import { errorCodigoTipo, errorNombreSubtipo, idSubtipoNuevo } from '../src/app/pantallas/atc/catalogo-validacion.ts';

test('catálogo: código de 3 letras único y nombre único por tipo', () => {
  assert.equal(errorCodigoTipo(' abc ', ['PED']), '');
  assert.notEqual(errorCodigoTipo('ped', ['PED']), '');
  assert.notEqual(errorCodigoTipo('AB1', []), '');
  const subs = [{ id: 'PED-A', tipoId: 'PED', nombre: 'Actualización' }];
  assert.notEqual(errorNombreSubtipo('actualizacion', 'PED', subs), '');
  assert.equal(errorNombreSubtipo('actualizacion', 'CTA', subs), '');
  assert.equal(errorNombreSubtipo('Actualización', 'PED', subs, 'PED-A'), '');
  assert.equal(idSubtipoNuevo('PED', 'Copia de doc.', ['PED-COPIA-DE-DOC']), 'PED-COPIA-DE-DOC-2');
});
