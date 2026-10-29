import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  buscar,
  coincidePalabras,
  funcionesVisibles,
  INDICE_FUNCIONES,
  leerRecientes,
  guardarRecientes,
  registrarReciente,
  type ModuloBuscable,
} from '../src/app/pantallas/atc/indice-busqueda.ts';
import type { VistaAtc } from '../src/app/pantallas/atc/datos-atc.ts';

// Vistas que el sidebar muestra a cada perfil (espejo de vistasPermitidasParaRol sin las ocultas).
const GESTOR: VistaAtc[] = ['c360', 'vivo', 'bandeja', 'tudia', 'nuevo'];
const SUPERVISOR: VistaAtc[] = [...GESTOR, 'libro', 'sgd', 'garantias', 'morosidad', 'reasignar', 'alertas', 'cierre', 'politicas', 'workflow', 'evento', 'ingreso', 'torre'];
const CLIENTE: VistaAtc[] = ['bandeja', 'nuevo', 'evento', 'libro'];

const TITULOS: Partial<Record<VistaAtc, string>> = {
  morosidad: 'Morosidad',
  politicas: 'Políticas SLA',
  alertas: 'Alertas SLA',
  nuevo: 'Nuevo ticket',
  bandeja: 'Bandeja de tickets',
  c360: 'Consulta 360 del Cliente',
};
const modulos = (vistas: VistaAtc[]): ModuloBuscable[] =>
  vistas.map((vista) => ({ vista, titulo: TITULOS[vista] ?? vista, subtitulo: '' }));
const busca = (q: string, vistas: VistaAtc[], rol: Parameters<typeof funcionesVisibles>[0]) =>
  buscar(q, modulos(vistas), funcionesVisibles(rol, new Set(vistas)), rol === 'CLIENTE');

test('búsqueda · tildes y mayúsculas no importan', () => {
  assert.ok(coincidePalabras('POLITICAS sla', 'Políticas SLA'));
  assert.ok(coincidePalabras('políticas', 'Politicas SLA'));
  const r = busca('politicas sla', SUPERVISOR, 'SUPERVISOR');
  assert.equal(r.modulos[0].modulo.vista, 'politicas');
});

test('búsqueda · todas las palabras, en cualquier orden', () => {
  assert.ok(coincidePalabras('sla politicas', 'Políticas SLA'));
  assert.ok(!coincidePalabras('sla garantias', 'Políticas SLA'));
  assert.ok(!coincidePalabras('', 'Políticas SLA'));
});

test('búsqueda · sinónimos llevan al módulo', () => {
  assert.equal(busca('moroso', SUPERVISOR, 'SUPERVISOR').modulos[0].modulo.vista, 'morosidad');
  assert.equal(busca('mora', SUPERVISOR, 'SUPERVISOR').modulos[0].modulo.vista, 'morosidad');
  assert.ok(busca('vencimiento', SUPERVISOR, 'SUPERVISOR').modulos.some((m) => m.modulo.vista === 'alertas'));
  assert.equal(busca('registrar ticket', GESTOR, 'GESTOR').modulos[0].modulo.vista, 'nuevo');
});

test('búsqueda · ranking nombre > sinónimo > funcionalidad', () => {
  // «sla»: está en el nombre de Alertas y Políticas; en Bandeja solo como sinónimo.
  const r = busca('sla', SUPERVISOR, 'SUPERVISOR').modulos.map((m) => m.modulo.vista);
  assert.ok(r.indexOf('alertas') < r.indexOf('bandeja'));
  assert.ok(r.indexOf('politicas') < r.indexOf('bandeja'));
  // «contrato»: sinónimo de Consulta 360; como función («Ver contrato…») entra por su etiqueta.
  const c = busca('contrato', SUPERVISOR, 'SUPERVISOR');
  assert.ok(c.funciones.some((f) => f.funcion.id === 'c360-contrato'));
  const puntajes = c.funciones.map((f) => f.puntaje);
  assert.deepEqual(puntajes, [...puntajes].sort((a, b) => b - a));
});

test('permisos · Gestor no ve Políticas SLA; Supervisor sí', () => {
  assert.ok(!busca('politicas sla', GESTOR, 'GESTOR').modulos.some((m) => m.modulo.vista === 'politicas'));
  assert.ok(!busca('matriz sla', GESTOR, 'GESTOR').funciones.some((f) => f.funcion.vista === 'politicas'));
  assert.ok(busca('politicas sla', SUPERVISOR, 'SUPERVISOR').modulos.some((m) => m.modulo.vista === 'politicas'));
  assert.ok(busca('matriz sla', SUPERVISOR, 'SUPERVISOR').funciones.some((f) => f.funcion.vista === 'politicas'));
});

test('permisos · un resultado nunca lleva a una vista fuera de las permitidas', () => {
  for (const [rol, vistas] of [['GESTOR', GESTOR], ['SUPERVISOR', SUPERVISOR], ['CLIENTE', CLIENTE]] as const) {
    for (const f of funcionesVisibles(rol, new Set(vistas))) assert.ok(vistas.includes(f.vista), `${rol} ${f.id}`);
  }
});

test('permisos · Cliente solo ve sus 4 módulos y sus funciones propias', () => {
  const vistas = new Set(CLIENTE);
  const fns = funcionesVisibles('CLIENTE', vistas);
  assert.ok(fns.length > 0 && fns.every((f) => f.roles?.includes('CLIENTE')));
  assert.ok(!busca('mora', CLIENTE, 'CLIENTE').modulos.length);
  assert.ok(!busca('politicas', CLIENTE, 'CLIENTE').modulos.length);
  assert.ok(!busca('auto asignar', CLIENTE, 'CLIENTE').funciones.length);
  // Las funciones de cliente no se filtran a los demás perfiles.
  assert.ok(funcionesVisibles('GESTOR', new Set(GESTOR)).every((f) => !f.roles?.includes('CLIENTE')));
  const r = busca('registrar solicitud', CLIENTE, 'CLIENTE');
  assert.ok(r.funciones.some((f) => f.funcion.id === 'nuevo-cliente'));
});

test('permisos · funciones solo de admin/supervisor', () => {
  const guias = (rol: 'GESTOR' | 'SUPERVISOR', vistas: VistaAtc[]) =>
    funcionesVisibles(rol, new Set([...vistas, 'workflow'])).some((f) => f.id === 'wf-guias');
  assert.equal(guias('SUPERVISOR', SUPERVISOR), true);
  assert.equal(guias('GESTOR', GESTOR), false);
});

test('índice · ids únicos y sin destino oculto', () => {
  const ids = INDICE_FUNCIONES.map((f) => f.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(INDICE_FUNCIONES.every((f) => f.vista !== 'detalle' && f.vista !== 'buses'));
});

test('recientes · tope, orden, sin repetidos y almacén robusto', () => {
  let ids: string[] = [];
  for (const id of ['mod:a', 'mod:b', 'fn:c', 'mod:d', 'fn:e', 'mod:f']) ids = registrarReciente(ids, id);
  assert.deepEqual(ids, ['mod:f', 'fn:e', 'mod:d', 'fn:c', 'mod:b']);
  assert.deepEqual(registrarReciente(ids, 'mod:d').slice(0, 2), ['mod:d', 'mod:f']);
  const mem = new Map<string, string>();
  const alm = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v) };
  guardarRecientes('p1', ids, alm);
  assert.deepEqual(leerRecientes('p1', alm), ids);
  assert.deepEqual(leerRecientes('p2', alm), []);
  mem.set('aybar-atc:paleta-recientes:p3', JSON.stringify(['mod:ok', 'x', 3, '<script>', 'fn:ok']));
  assert.deepEqual(leerRecientes('p3', alm), ['mod:ok', 'fn:ok']);
  mem.set('aybar-atc:paleta-recientes:p4', '{roto');
  assert.deepEqual(leerRecientes('p4', alm), []);
  const roto = { getItem: () => { throw new Error('x'); }, setItem: () => { throw new Error('x'); } };
  assert.deepEqual(leerRecientes('p1', roto), []);
  guardarRecientes('p1', ids, roto);
});
