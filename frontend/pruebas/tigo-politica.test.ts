import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { TicketAtc } from '../src/app/pantallas/atc/datos-atc.ts';
import {
  construirEscenarioA,
  construirEscenarioB,
  construirEscenarioC,
  proximoPaso,
  aplicarEfectos,
  type PasoGuion,
} from '../src/app/pantallas/atc/tigo/tigo-guion.ts';
import {
  CLASE_POR_ACCION,
  ETIQUETA_ACCION,
  GUARDARRAILES,
  POLITICAS_POR_DEFECTO,
  aplicarPolitica,
  buscarPolitica,
  claseDe,
  decidirAccion,
  efectosDelPaso,
  registrarCambio,
  type ClaseAccion,
  type NivelTigo,
  type PoliticaEtapa,
} from '../src/app/pantallas/atc/tigo/tigo-politica.ts';
import type { EtapaTigo, PropuestaTigo } from '../src/app/pantallas/atc/tigo/tigo-modelo.ts';

const F = new Date(0);
const NIVELES: NivelTigo[] = ['solo-sugiere', 'prepara-con-aprobacion', 'no-interviene'];
const pol = (nivel: NivelTigo, participa = true): PoliticaEtapa => ({ tipo: 'CTA', etapa: 'registro', participa, nivel });

/* ── decidirAccion ── */

test('decidirAccion: tabla clase x nivel x participa', () => {
  const porClase: Record<ClaseAccion, string> = {
    interna: 'clasificar', cliente: 'redactar', deriva: 'derivar-legal', cierre: 'resolver', libro: 'registrar-asiento', sistema: 'guardarrailes',
  };
  for (const [clase, accion] of Object.entries(porClase) as [ClaseAccion, string][]) {
    assert.equal(claseDe(accion), clase);
    for (const nivel of NIVELES) {
      for (const participa of [true, false]) {
        const r = decidirAccion({ accion, politica: pol(nivel, participa) }).resultado;
        if (clase === 'sistema') assert.equal(r, 'ejecutar', 'las informativas siempre pasan');
        else if (!participa || nivel === 'no-interviene') assert.equal(r, 'detener');
        else if (clase !== 'interna') assert.equal(r, 'pedir-aprobacion');
        else assert.equal(r, nivel === 'prepara-con-aprobacion' ? 'ejecutar' : 'pedir-aprobacion');
      }
    }
    const sin = decidirAccion({ accion, politica: undefined }).resultado;
    assert.equal(sin, clase === 'sistema' ? 'ejecutar' : 'detener');
  }
});

test('piso no relajable: cliente, deriva, cierre y libro jamas ejecutan', () => {
  for (const [accion, clase] of Object.entries(CLASE_POR_ACCION)) {
    if (!['cliente', 'deriva', 'cierre', 'libro'].includes(clase)) continue;
    for (const nivel of NIVELES) {
      for (const participa of [true, false]) {
        assert.notEqual(decidirAccion({ accion, politica: pol(nivel, participa) }).resultado, 'ejecutar', `${accion}/${nivel}`);
      }
    }
  }
});

test('accion desconocida se trata como cliente: nunca ejecuta', () => {
  assert.equal(claseDe('inventada'), 'cliente');
  for (const nivel of NIVELES) assert.notEqual(decidirAccion({ accion: 'inventada', politica: pol(nivel) }).resultado, 'ejecutar');
  assert.equal(decidirAccion({ accion: 'inventada', politica: pol('prepara-con-aprobacion') }).resultado, 'pedir-aprobacion');
});

test('toda accion clasificada tiene etiqueta; hay 6 guardarrailes que se detienen', () => {
  for (const a of Object.keys(CLASE_POR_ACCION)) assert.ok(ETIQUETA_ACCION[a], a);
  assert.equal(GUARDARRAILES.length, 6);
  assert.ok(GUARDARRAILES.every((g) => g.piso === 'se-detiene'));
});

test('POLITICAS_POR_DEFECTO: CTA y QUE x 5 etapas, participa y prepara-con-aprobacion; sin fila no hay politica', () => {
  assert.equal(POLITICAS_POR_DEFECTO.length, 10);
  assert.ok(POLITICAS_POR_DEFECTO.every((p) => p.participa && p.nivel === 'prepara-con-aprobacion'));
  assert.equal(buscarPolitica(POLITICAS_POR_DEFECTO, 'REC', 'registro'), undefined);
});

/* ── aplicarPolitica sobre los escenarios ── */

const base = {
  num: 'AIN-1', type: 'CTA', eje: 1, conflict: false, rayo: false, state: 'OPEN', owner: null, area: 'ATC', ch: 'Mi Portal', proj: 'Proyecto',
  cli: 'Valeria Quispe Rojas', dni: '44819203', contract: 'VS-2025-0507', log: [], status: [], summary: 'Solicitud de estado de cuenta',
  interactions: [{ tipo: 'cli', fecha: F, texto: 'Quiero mi estado de cuenta.' }],
} as unknown as TicketAtc;
const ticketC = { ...base, interactions: [{ tipo: 'cli', fecha: F, texto: 'Es una estafa, pongo la denuncia en INDECOPI.' }] } as TicketAtc;
const ctxA = {
  ticket: base,
  ahora: () => F,
  flujo: { version: 2, area: 'ATC', actividades: ['Validación', 'Envío y cierre'] },
  guia: { version: 2, pasos: ['P'], plantillas: ['Hola «{resumen}».'], criterios: [] },
};
const crudoA = (): PasoGuion[] => construirEscenarioA(ctxA);
const crudoB = (): PasoGuion[] => construirEscenarioB({ ticket: { ...base, type: 'QUE' } as TicketAtc, venceLibro: F });
const crudoC = (): PasoGuion[] => construirEscenarioC({ ticket: ticketC, paqueteMinimo: ['a', 'b', 'c', 'd', 'e', 'f'] });
const defecto = (tipo: string) => (etapa: EtapaTigo) => buscarPolitica(POLITICAS_POR_DEFECTO, tipo, etapa);
const nivelTodo = (nivel: NivelTigo, participa = true) => (etapa: EtapaTigo): PoliticaEtapa => ({ tipo: 'CTA', etapa, participa, nivel });
const tipos = (efs: { tipo: string }[]): string[] => efs.map((e) => e.tipo);
const comoPropuestas = (paso: PasoGuion): PropuestaTigo[] =>
  paso.propuestas.map((p, i) => ({ ...p, id: `p${i}`, ticket: 't', creada: F }));

/** Efectos de ejecucion por paso que tenia el guion antes de la politica (los de PasoGuion.efectos). */
const EFECTOS_ANTES = {
  A: [['clasificar'], ['asignar', 'estado', 'bitacora', 'interaccion'], ['completar-actividad', 'interaccion'], [], ['interaccion', 'cerrado', 'interaccion']],
  B: [['clasificar'], [], ['interaccion'], []],
  C: [['interaccion']],
};

test('politica por defecto: mismo resultado observable que el guion previo (A, B y C)', () => {
  for (const [id, crudo, tipo] of [['A', crudoA(), 'CTA'], ['B', crudoB(), 'QUE'], ['C', crudoC(), 'CTA']] as const) {
    const pasos = aplicarPolitica(crudo, defecto(tipo));
    pasos.forEach((paso, i) => {
      paso.propuestas.forEach((p, j) => {
        // Estado y aprobación idénticos a lo que cada propuesta traía escrito a mano.
        assert.equal(p.estado, crudo[i].propuestas[j].estado, `${id} ${p.accion}`);
        assert.equal(p.requiereAprobacion, crudo[i].propuestas[j].requiereAprobacion, `${id} ${p.accion}`);
        assert.deepEqual(p.efectosAlAprobar, crudo[i].propuestas[j].efectosAlAprobar);
      });
      assert.deepEqual(tipos(efectosDelPaso(paso)), EFECTOS_ANTES[id][i], `${id} paso ${i}`);
    });
  }
});

test('politica por defecto: A pide 2 aprobaciones (redactar, resolver); C solo pide escalar', () => {
  const pasosA = aplicarPolitica(crudoA(), defecto('CTA'));
  assert.deepEqual(pasosA.flatMap((p) => p.propuestas).filter((p) => p.estado === 'pendiente').map((p) => p.accion), ['redactar', 'resolver']);
  const pasosC = aplicarPolitica(crudoC(), defecto('CTA'));
  assert.deepEqual(pasosC.flatMap((p) => p.propuestas).filter((p) => p.estado === 'pendiente').map((p) => p.accion), ['escalar-legal']);
  assert.ok(pasosC[0].propuestas.some((p) => p.accion === 'guardarrailes' && p.estado === 'bloqueada'));
  const pasosB = aplicarPolitica(crudoB(), defecto('QUE'));
  assert.deepEqual(
    pasosB.flatMap((p) => p.propuestas).filter((p) => p.estado === 'pendiente').map((p) => p.accion),
    ['registrar-asiento', 'derivar-legal', 'redactar-acuse'],
  );
});

test('solo-sugiere: las internas quedan pendientes y sus efectos se difieren hasta aprobar', () => {
  const pasos = aplicarPolitica(crudoA(), nivelTodo('solo-sugiere'));
  const reg = pasos[0];
  const clasificar = reg.propuestas.find((p) => p.accion === 'clasificar')!;
  assert.equal(clasificar.estado, 'pendiente');
  assert.equal(clasificar.requiereAprobacion, true);
  assert.equal(clasificar.efectos, undefined);
  assert.deepEqual(tipos(clasificar.efectosAlAprobar ?? []), ['clasificar']);
  assert.deepEqual(efectosDelPaso(reg), []);
  assert.deepEqual(efectosDelPaso(pasos[1]), []);
  const asignar = pasos[1].propuestas.find((p) => p.accion === 'asignar')!;
  assert.deepEqual(tipos(asignar.efectosAlAprobar ?? []), ['asignar', 'estado', 'bitacora', 'interaccion']);
  // Los efectos solo cambian el ticket si el gestor aprueba.
  assert.equal(aplicarEfectos(base, efectosDelPaso(pasos[1]), F, 'G').owner, null);
  assert.equal(aplicarEfectos(base, asignar.efectosAlAprobar!, F, 'G').owner, 'M. Delgado');
  // Las informativas siguen igual y el guion espera al gestor.
  assert.equal(reg.propuestas.find((p) => p.accion === 'guardarrailes')!.estado, 'ejecutada');
  assert.equal(proximoPaso(pasos, 0, comoPropuestas(reg)).tipo, 'esperando');
  // El piso se mantiene: cliente y cierre siguen pendientes.
  const sensibles = pasos.flatMap((p) => p.propuestas).filter((p) => p.accion === 'redactar' || p.accion === 'resolver');
  assert.deepEqual(sensibles.map((p) => p.estado), ['pendiente', 'pendiente']);
});

test('no-interviene, no participa y sin fila: etapa bloqueada, sin efectos, con motivo; el guion termina', () => {
  for (const politica of [nivelTodo('no-interviene'), nivelTodo('prepara-con-aprobacion', false), () => undefined]) {
    const pasos = aplicarPolitica(crudoA(), politica);
    for (const paso of pasos) {
      assert.deepEqual(paso.efectos, []);
      for (const p of paso.propuestas.filter((x) => claseDe(x.accion) !== 'sistema')) {
        assert.equal(p.estado, 'bloqueada');
        assert.equal(p.requiereAprobacion, false);
        assert.equal(p.efectos, undefined);
        assert.equal(p.efectosAlAprobar, undefined);
        assert.ok(p.detalle.length > 0);
      }
    }
    assert.deepEqual(efectosDelPaso(pasos[0]), []);
    assert.equal(proximoPaso(pasos, 0, comoPropuestas(pasos[0])).tipo, 'terminado');
  }
});

test('el nivel de una etapa solo afecta a esa etapa', () => {
  const pasos = aplicarPolitica(crudoA(), (etapa) => ({
    tipo: 'CTA', etapa, participa: true, nivel: etapa === 'enrutamiento' ? 'solo-sugiere' : 'prepara-con-aprobacion',
  }));
  assert.equal(pasos[0].propuestas[0].estado, 'ejecutada');
  assert.equal(pasos[1].propuestas.find((p) => p.accion === 'asignar')!.estado, 'pendiente');
  assert.equal(pasos[2].propuestas.find((p) => p.accion === 'completar-actividad')!.estado, 'ejecutada');
});

/* ── Versionado y bitácora ── */

test('registrarCambio: crea version, guarda antes/despues y no toca el original', () => {
  const r = registrarCambio(POLITICAS_POR_DEFECTO, 1, {
    tipo: 'CTA', etapa: 'atencion', cambio: { nivel: 'solo-sugiere' }, motivo: '  Piloto  ', autor: 'Admin', fecha: F,
  })!;
  assert.equal(r.version, 2);
  assert.equal(r.registro.version, 2);
  assert.equal(r.registro.motivo, 'Piloto');
  assert.deepEqual(r.registro.antes, { participa: true, nivel: 'prepara-con-aprobacion' });
  assert.deepEqual(r.registro.despues, { participa: true, nivel: 'solo-sugiere' });
  assert.equal(buscarPolitica(r.tabla, 'CTA', 'atencion')!.nivel, 'solo-sugiere');
  assert.equal(buscarPolitica(POLITICAS_POR_DEFECTO, 'CTA', 'atencion')!.nivel, 'prepara-con-aprobacion');
  assert.equal(buscarPolitica(r.tabla, 'QUE', 'atencion')!.nivel, 'prepara-con-aprobacion');
  assert.deepEqual(Object.keys(r.registro).sort(), ['antes', 'autor', 'despues', 'etapa', 'fecha', 'motivo', 'tipo', 'version']);
});

test('registrarCambio devuelve null sin motivo, sin fila o sin cambio real', () => {
  const args = { tipo: 'CTA', etapa: 'registro' as const, cambio: { participa: false }, motivo: 'x', autor: 'A', fecha: F };
  assert.ok(registrarCambio(POLITICAS_POR_DEFECTO, 1, args));
  assert.equal(registrarCambio(POLITICAS_POR_DEFECTO, 1, { ...args, motivo: '   ' }), null);
  assert.equal(registrarCambio(POLITICAS_POR_DEFECTO, 1, { ...args, tipo: 'REC' }), null);
  assert.equal(registrarCambio(POLITICAS_POR_DEFECTO, 1, { ...args, cambio: { participa: true, nivel: 'prepara-con-aprobacion' } }), null);
  assert.equal(registrarCambio(POLITICAS_POR_DEFECTO, 1, { ...args, cambio: {} }), null);
});
