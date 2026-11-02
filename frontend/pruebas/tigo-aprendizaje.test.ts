import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AHORA_BASE, crearTicketsDemo, type TicketAtc } from '../src/app/pantallas/atc/datos-atc.ts';
import {
  HISTORICO_TIGO,
  IMPACTO_SIMULADO,
  borradores,
  contrasteImpacto,
  muestraSuficiente,
  aplicarPropuestaAGuia,
  calcularMetricas,
  derivarPropuestasAprendizaje,
  type GuiaVigente,
  type RegistroHistorico,
} from '../src/app/pantallas/atc/tigo/tigo-aprendizaje.ts';
import {
  alDescartar,
  clasificarEdicion,
  construirEscenarioA,
  construirEscenarioB,
  type PropuestaGuion,
} from '../src/app/pantallas/atc/tigo/tigo-guion.ts';
import type { DecisionTigo } from '../src/app/pantallas/atc/tigo/tigo-modelo.ts';

const PLANTILLA_V2 = 'Hola, revisamos tu solicitud «{resumen}». Tu abono figura conciliado en nuestro sistema.';
const guiaCta = (version = 2, plantillas = [PLANTILLA_V2]): GuiaVigente => ({
  tipo: 'CTA',
  nombreTipo: 'Consulta de cuenta',
  versionActual: version,
  plantillas,
  criterios: ['Dejar constancia visible al cliente en Mi Portal.'],
});
const dec = (extra: Partial<DecisionTigo> = {}): DecisionTigo => ({
  id: 'd', ticket: 'AIN-1', propuestaId: 'p', etapa: 'atencion', accion: 'redactar', decision: 'ACEPTADA',
  longitud: 100, fecha: AHORA_BASE, gestor: 'G', tipo: 'CTA', etiquetas: [], guiaVersion: 2, ...extra,
});
const hist = (extra: Partial<RegistroHistorico>): RegistroHistorico => ({
  tipo: 'CTA', guiaVersion: 2, total: 10, aceptadas: 7, editadas: 3, descartadas: 0, etiquetas: [{ etiqueta: 'agregó fecha', veces: 3 }], ...extra,
});

test('clasificarEdicion: categorías sin devolver texto', () => {
  const o = 'Hola, revisamos tu solicitud. Tu abono figura conciliado en nuestro sistema.';
  assert.deepEqual(clasificarEdicion(o, o), []);
  assert.ok(clasificarEdicion(o, `${o} Corresponde a la operación 00471529.`).includes('agregó dato de operación'));
  assert.ok(clasificarEdicion(o, `${o} Último pago el 12/10/2026.`).includes('agregó fecha'));
  assert.ok(clasificarEdicion(o, 'Hola, tu abono figura conciliado.').includes('acortó'));
  assert.ok(clasificarEdicion(o, `${o} Quedamos atentos a cualquier otra consulta que tengas sobre tu cuenta.`).includes('alargó'));
  assert.ok(clasificarEdicion(o, 'Estimado cliente, le informamos que su abono figura conciliado en nuestro sistema.').includes('cambió el tono'));
  assert.ok(clasificarEdicion('Tienes 13 de 36 cuotas pagadas y un saldo de S/ 48 250.00 en tu cuenta.', 'Tienes cuotas pagadas y un saldo en tu cuenta.').includes('quitó información'));
  for (const e of clasificarEdicion(o, `${o} Op. 00471529 del 12/10/2026.`)) {
    assert.ok(!o.includes(e) && !/\d{4}/.test(e), 'una etiqueta es categoría, no texto');
  }
});

test('derivar: umbral 30 % de edición y al menos 10 borradores', () => {
  const g = [guiaCta()];
  assert.equal(derivarPropuestasAprendizaje([], [hist({ editadas: 3 })], g).length, 1); // 30 % justo
  assert.equal(derivarPropuestasAprendizaje([], [hist({ aceptadas: 8, editadas: 2 })], g).length, 0); // 20 %
  assert.equal(derivarPropuestasAprendizaje([], [hist({ total: 9, aceptadas: 6, editadas: 3 })], g).length, 0); // n < 10
  // la sesión empuja el umbral: 9 borradores + 1 editado de hoy
  const h = hist({ total: 9, aceptadas: 6, editadas: 3 });
  const p = derivarPropuestasAprendizaje([dec({ decision: 'EDITADA', etiquetas: ['agregó fecha'] })], [h], g);
  assert.equal(p.length, 1);
  assert.equal(p[0].origen, 'sesion');
  assert.equal(p[0].evidencia.total, 10);
  // solo cuenta la versión vigente de la guía
  assert.equal(derivarPropuestasAprendizaje([], [hist({ editadas: 5, aceptadas: 5 })], [guiaCta(3)]).length, 0);
});

test('derivar CTA: etiqueta dominante, plantilla propuesta y criterio; determinista y sin texto de cliente', () => {
  const g = [guiaCta()];
  const a = derivarPropuestasAprendizaje([], HISTORICO_TIGO, g);
  const b = derivarPropuestasAprendizaje([], HISTORICO_TIGO, g);
  assert.deepEqual(a, b);
  assert.equal(a.length, 1);
  const [p] = a;
  assert.equal(p.id, 'apr-CTA-v2');
  assert.equal(p.origen, 'historico');
  assert.equal(p.evidencia.total, 24);
  assert.equal(p.evidencia.etiquetas[0].etiqueta, 'agregó dato de operación');
  assert.equal(p.plantillaPropuesta, `${PLANTILLA_V2} Tu abono corresponde a la operación {operacion} del {ultimoPago}.`);
  assert.equal(p.criterioNuevo, 'Citar el número de operación y la fecha del último pago.');
  assert.match(p.hallazgo, /En 8 de 24 borradores de Consulta de cuenta/);
  assert.ok(!JSON.stringify(p).includes('Valeria'));
});

test('DecisionTigo: solo longitud y etiquetas de categoría, nunca texto', () => {
  const d = dec();
  assert.deepEqual(Object.keys(d).sort(), ['accion', 'decision', 'etapa', 'etiquetas', 'fecha', 'gestor', 'guiaVersion', 'id', 'longitud', 'propuestaId', 'ticket', 'tipo']);
  assert.ok(!('texto' in d) && !('textoFinal' in d));
});

test('publicar: la versión siguiente lleva la plantilla propuesta primero y el criterio nuevo', () => {
  const g = guiaCta(2, [PLANTILLA_V2, 'Otra plantilla.']);
  const [p] = derivarPropuestasAprendizaje([], HISTORICO_TIGO, [g]);
  const v3 = aplicarPropuestaAGuia(g, p);
  assert.equal(v3.plantillas[0], p.plantillaPropuesta);
  assert.equal(v3.plantillas[1], 'Otra plantilla.');
  assert.deepEqual(v3.criterios, [...g.criterios, 'Citar el número de operación y la fecha del último pago.']);
  // con la guía v3 ya no hay propuesta nueva (se cuenta la versión vigente)
  assert.equal(derivarPropuestasAprendizaje([], HISTORICO_TIGO, [guiaCta(3, v3.plantillas)]).length, 0);
});

test('A con guía v3: el borrador resuelve {operacion} y {ultimoPago} y avisa que la guía mejoró', () => {
  const t: TicketAtc = {
    ...crearTicketsDemo()[0], type: 'CTA', eje: 1, conflict: false, rayo: false, state: 'OPEN', cli: 'Valeria Quispe Rojas',
    interactions: [{ tipo: 'cli', fecha: AHORA_BASE, texto: 'Quiero mi estado de cuenta.' }], summary: 'Solicitud de estado de cuenta',
  };
  const [p] = derivarPropuestasAprendizaje([], HISTORICO_TIGO, [guiaCta()]);
  const v3 = aplicarPropuestaAGuia(guiaCta(), p);
  const pasos = construirEscenarioA({
    ticket: t,
    ahora: () => AHORA_BASE,
    flujo: { version: 2, area: 'ATC', actividades: ['Validación', 'Cierre'] },
    guia: { version: 3, pasos: ['Paso'], plantillas: v3.plantillas, criterios: v3.criterios },
  });
  const redactar = pasos.flatMap((x) => x.propuestas).find((x) => x.accion === 'redactar')!;
  assert.match(redactar.texto!, /operación 00471529 del 12\/10\/2026/);
  assert.ok(!/[{}]/.test(redactar.texto!));
  assert.ok(!/  |Op\. /.test(redactar.texto!));
  assert.match(redactar.detalle, /Incluye lo que los gestores solían agregar a mano/);
  assert.ok(pasos.flatMap((x) => x.propuestas).some((x) => /guía CTA v3/.test(x.titulo)));
});

test('descartar una propuesta de B no termina mientras queden pendientes; en A termina', () => {
  const t = { ...crearTicketsDemo()[0], num: 'AIN-777', type: 'QUE', cli: 'Valeria Quispe Rojas', dni: '44819203' } as TicketAtc;
  const pasos = construirEscenarioB({ ticket: t, venceLibro: AHORA_BASE });
  const pend: PropuestaGuion[] = pasos.flatMap((p) => p.propuestas).filter((p) => p.estado === 'pendiente');
  assert.equal(pend.length, 3);
  const estado = pend.map((p) => ({ ticket: t.num, estado: p.estado as string }));
  estado[0].estado = 'descartada';
  assert.equal(alDescartar(estado, t.num), 'esperar');
  estado[1].estado = 'aprobada';
  assert.equal(alDescartar(estado, t.num), 'esperar');
  estado[2].estado = 'descartada';
  assert.equal(alDescartar(estado, t.num), 'terminar');
  // A: un solo borrador pendiente; al descartarlo no queda nada y termina como antes
  assert.equal(alDescartar([{ ticket: 'X', estado: 'descartada' }], 'X'), 'terminar');
  // pendientes de otro ticket no cuentan
  assert.equal(alDescartar([{ ticket: 'Y', estado: 'pendiente' }], 'X'), 'terminar');
});

test('métricas: simuladas separadas de la sesión y por versión de guía', () => {
  const m = calcularMetricas([dec({ guiaVersion: 3 }), dec({ guiaVersion: 3, decision: 'EDITADA' }), dec({ accion: 'chat-redactar' })], HISTORICO_TIGO);
  const v3 = m.porVersion.find((f) => f.tipo === 'CTA' && f.version === 3)!;
  assert.deepEqual([v3.total, v3.aceptacionPct, v3.simulado, v3.real], [2, 50, false, true]);
  const v2 = m.porVersion.find((f) => f.tipo === 'CTA' && f.version === 2)!;
  assert.deepEqual([v2.total, v2.aceptacionPct, v2.simulado, v2.real], [24, 58, true, false]);
  assert.equal(m.sesion.total, 2);
  assert.equal(m.ticketsAsistidos.sesion, 1);
});

test('muestra mínima del gráfico, plural y contrastes del impacto', () => {
  assert.equal(muestraSuficiente(4), false);
  assert.equal(muestraSuficiente(5), true);
  assert.equal(borradores(1), '1 borrador');
  assert.equal(borradores(3), '3 borradores');
  assert.deepEqual(contrasteImpacto(IMPACTO_SIMULADO), { respuestaPct: '-68 %', csatDif: '+0,3' });
});
