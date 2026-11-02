import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AHORA_BASE, crearTicketsDemo, sumarDiasHabiles, type TicketAtc } from '../src/app/pantallas/atc/datos-atc.ts';
import {
  anonimizar,
  narrarPaso,
  resumenFinal,
  aplicarEfectos,
  construirEscenarioA,
  construirEscenarioB,
  construirEscenarioC,
  detectarSenalesRiesgo,
  sinCierre,
  PLAZO_LIBRO_DIAS,
  type PasoGuion,
  MINUTOS_POR_ETAPA,
  RESPONSABLE_MENOR_CARGA,
  evaluarGuardarrailes,
  propuestaAtencionManual,
  proximoPaso,
  sumarMinutos,
  textoAprobado,
  type CtxEscenario,
} from '../src/app/pantallas/atc/tigo/tigo-guion.ts';
import {
  POLITICAS_POR_DEFECTO,
  aplicarPolitica,
  buscarPolitica,
  efectosDelPaso,
} from '../src/app/pantallas/atc/tigo/tigo-politica.ts';
import { ETAPAS_TIGO, type DecisionTigo, type PropuestaTigo } from '../src/app/pantallas/atc/tigo/tigo-modelo.ts';

const ahora = (): Date => AHORA_BASE;
/** Política por defecto del tipo (comportamiento actual): lo que hace el servicio al iniciar el escenario. */
const conPolitica = (pasos: PasoGuion[], tipo = 'CTA'): PasoGuion[] =>
  aplicarPolitica(pasos, (etapa) => buscarPolitica(POLITICAS_POR_DEFECTO, tipo, etapa));
const entrante = (extra: Partial<TicketAtc> = {}): TicketAtc => ({
  ...crearTicketsDemo()[0],
  num: 'AIN-000999',
  type: 'CTA',
  eje: 1,
  conflict: false,
  rayo: false,
  state: 'OPEN',
  owner: null,
  cli: 'Valeria Quispe Rojas',
  dni: '44819203',
  contract: 'VS-2025-0507',
  log: [],
  status: [{ fecha: AHORA_BASE, estado: 'OPEN', autor: 'Mi Portal' }],
  interactions: [
    { tipo: 'cli', fecha: AHORA_BASE, texto: 'Soy Valeria Quispe Rojas, DNI 44819203, quiero mi estado de cuenta.' },
  ],
  summary: 'Solicitud de estado de cuenta',
  firstResp: undefined,
  resolvedAt: undefined,
  ...extra,
});
const ctx = (t: TicketAtc = entrante()): CtxEscenario => ({
  ticket: t,
  ahora,
  flujo: { version: 2, area: 'ATC', actividades: ['Validación', 'Envío y cierre'] },
  guia: { version: 2, pasos: ['Paso 1'], plantillas: ['Hola, «{resumen}».'], criterios: ['Dejar constancia'] },
  subtipo: { id: 'CTA-ESTADO-CUENTA', nombre: 'Estado de cuenta' },
});

/** Corre el guion como lo hace el servicio, decidiendo cada propuesta pendiente con `decidir`. */
function simular(
  t0: TicketAtc,
  decidir: (p: PropuestaTigo) => 'aprobar' | 'descartar',
  crudos: PasoGuion[] = construirEscenarioA(ctx(t0)),
) {
  const pasos = conPolitica(crudos, crudos[0]?.propuestas.some((p) => p.accion === 'detectar-libro') ? 'QUE' : 'CTA');
  const propuestas: PropuestaTigo[] = [];
  const alAprobar = new Map<string, NonNullable<(typeof pasos)[number]['propuestas'][number]['efectosAlAprobar']>>();
  const estados: TicketAtc['state'][] = [];
  let t = t0;
  let n = 0;
  let ultimo = -1;
  let sig = proximoPaso(pasos, ultimo, propuestas);
  sig = { tipo: 'paso', indice: 0 };
  const etapas: string[] = [];
  const horas: Date[] = [];
  let desfase = 0;
  while (sig.tipo === 'paso') {
    const paso = pasos[sig.indice];
    etapas.push(paso.etapa);
    desfase += MINUTOS_POR_ETAPA[paso.etapa];
    const hora = sumarMinutos(AHORA_BASE, desfase);
    horas.push(hora);
    ultimo = sig.indice;
    for (const { efectosAlAprobar, ...base } of paso.propuestas) {
      const texto = base.accion === 'resolver' ? textoAprobado(propuestas) : base.texto;
      const p: PropuestaTigo = { ...base, texto, id: `p${++n}`, ticket: t.num, creada: hora };
      propuestas.push(p);
      if (efectosAlAprobar) alAprobar.set(p.id, efectosAlAprobar);
    }
    t = aplicarEfectos(t, efectosDelPaso(paso), hora, 'Gestor');
    estados.push(t.state);
    sig = proximoPaso(pasos, ultimo, propuestas);
    while (sig.tipo === 'esperando') {
      const p = propuestas.find((x) => x.estado === 'pendiente')!;
      if (decidir(p) === 'aprobar') {
        p.estado = 'aprobada';
        p.textoFinal = p.texto;
        t = aplicarEfectos(t, alAprobar.get(p.id) ?? [], hora, 'Gestor', p.textoFinal);
      } else {
        p.estado = 'descartada';
        propuestas.push({ ...propuestaAtencionManual(p.etapa), id: `p${++n}`, ticket: t.num, creada: AHORA_BASE });
      }
      estados.push(t.state);
      sig = proximoPaso(pasos, ultimo, propuestas);
    }
  }
  return { t, propuestas, etapas, estados, horas, termino: sig.tipo === 'terminado' };
}

test('guardarraíles: conflicto, Eje 3, Libro, rayo y RES bloquean; CTA normal pasa', () => {
  assert.equal(evaluarGuardarrailes(entrante()).permitido, true);
  for (const extra of [{ conflict: true }, { eje: 3 as const }, { type: 'QUE' }, { type: 'REC' }, { rayo: true }, { type: 'RES' }]) {
    const r = evaluarGuardarrailes(entrante(extra));
    assert.equal(r.permitido, false);
    assert.ok(r.motivo);
  }
});

test('anonimizar: nombre, DNI, contrato, teléfono y tarjeta', () => {
  const r = anonimizar(
    'Soy Valeria Quispe Rojas, DNI 44819203, contrato VS-2025-0507, cel 987 654 321, tarjeta 4111 1111 1111 1111.',
    { cliente: 'Valeria Quispe Rojas', dni: '44819203', contrato: 'VS-2025-0507' },
  );
  assert.equal(r.texto, 'Soy [CLIENTE], DNI [DNI], contrato [CONTRATO], cel [TELÉFONO], tarjeta [TARJETA].');
  assert.equal(r.cantidad, 5);
  assert.deepEqual([...r.marcas].sort(), ['[CLIENTE]', '[CONTRATO]', '[DNI]', '[TARJETA]', '[TELÉFONO]']);
  assert.equal(anonimizar('Sin datos', {}).cantidad, 0);
});

test('escenario A: etapas en orden y se detiene en lo que requiere aprobación', () => {
  const pasos = construirEscenarioA(ctx());
  assert.deepEqual(pasos.map((p) => p.etapa), ETAPAS_TIGO.map((e) => e.id));
  const r = simular(entrante(), (p) => {
    assert.equal(p.estado, 'pendiente');
    assert.equal(p.requiereAprobacion, true);
    return 'aprobar';
  });
  assert.deepEqual(r.etapas, ETAPAS_TIGO.map((e) => e.id));
  // Antes de aprobar el borrador, el guion espera y no pasa a cierre.
  const sig = proximoPaso(pasos, 2, [{ ...pasos[2].propuestas[4], id: 'x', ticket: 't', creada: AHORA_BASE }]);
  assert.equal(sig.tipo, 'esperando');
  assert.equal(r.t.state, 'CLOSED');
});

test('ningún paso deja RESOLVED/CLOSED sin pasar por un resolver aprobado', () => {
  // Aprobando todo: RESOLVED/CLOSED aparece solo después de aprobar resolver.
  const ok = simular(entrante(), () => 'aprobar');
  assert.ok(ok.propuestas.some((p) => p.accion === 'resolver' && p.estado === 'aprobada'));
  assert.ok(ok.t.interactions.some((i) => i.tipo === 'agt'));
  assert.ok(ok.t.resolvedAt);
  // Descartando resolver: nunca llega a RESOLVED/CLOSED.
  const sinResolver = simular(entrante(), (p) => (p.accion === 'resolver' ? 'descartar' : 'aprobar'));
  assert.ok(!sinResolver.estados.some((e) => e === 'RESOLVED' || e === 'CLOSED'));
  assert.equal(sinResolver.termino, true);
  // Los efectos de ejecución automática (no aprobados) jamás resuelven antes del cierre.
  for (const paso of conPolitica(construirEscenarioA(ctx())).slice(0, 4)) {
    assert.ok(!efectosDelPaso(paso).some((e) => e.tipo === 'resuelto' || e.tipo === 'cerrado' || e.tipo === 'respuesta-gestor'));
  }
  // El cierre automático del cliente solo está en post-cierre, que exige resolver aprobado.
  assert.deepEqual(
    ok.propuestas.filter((p) => p.etapa === 'postcierre').every((p) => p.simulada),
    true,
  );
});

test('descartar el borrador termina sin cerrar ni generar cierre/post-cierre', () => {
  const r = simular(entrante(), (p) => (p.accion === 'redactar' ? 'descartar' : 'aprobar'));
  assert.equal(r.termino, true);
  assert.deepEqual(r.etapas, ['registro', 'enrutamiento', 'atencion']);
  assert.ok(r.propuestas.some((p) => p.accion === 'atender-manual'));
  assert.ok(!r.propuestas.some((p) => p.accion === 'resolver'));
  assert.equal(r.t.state, 'IN_PROGRESS');
  assert.ok(!r.t.interactions.some((i) => i.tipo === 'agt'));
});

test('guardarraíl bloqueado: el guion se reduce al registro y termina', () => {
  const r = simular(entrante({ conflict: true }), () => 'aprobar');
  assert.deepEqual(r.etapas, ['registro']);
  assert.equal(r.termino, true);
  assert.equal(r.t.owner, null);
});

test('aplicarEfectos es inmutable y deja bitácora, estado e interacciones coherentes', () => {
  const t = entrante();
  const pasos = conPolitica(construirEscenarioA(ctx(t)));
  const t2 = aplicarEfectos(t, efectosDelPaso(pasos[1]), AHORA_BASE, 'Gestor');
  assert.notEqual(t2, t);
  assert.equal(t.owner, null);
  assert.equal(t.log.length, 0);
  assert.equal(t2.state, 'IN_PROGRESS');
  assert.equal(t2.log[0].motivo, 'TIGO_ASIGNACION');
  assert.equal(t2.interactions.at(-1)?.tipo, 'sys');
  assert.equal(t2.status.at(-1)?.estado, 'IN_PROGRESS');
});

test('DecisionTigo no contiene texto, solo longitud', () => {
  const d: DecisionTigo = {
    id: 'd1', ticket: 'AIN-1', propuestaId: 'p1', etapa: 'atencion', accion: 'redactar',
    decision: 'ACEPTADA', longitud: 120, fecha: AHORA_BASE, gestor: 'Gestor', tipo: 'CTA', etiquetas: [],
  };
  assert.deepEqual(
    Object.keys(d).sort(),
    ['accion', 'decision', 'etapa', 'etiquetas', 'fecha', 'gestor', 'id', 'longitud', 'propuestaId', 'ticket', 'tipo'],
  );
  assert.ok(!('texto' in d) && !('textoFinal' in d));
});

test('las horas de los pasos crecen y ninguna es anterior a la apertura', () => {
  const r = simular(entrante(), () => 'aprobar');
  assert.equal(r.horas.length, 5);
  assert.ok(r.horas[0].getTime() >= AHORA_BASE.getTime());
  for (let i = 1; i < r.horas.length; i++) {
    assert.ok(r.horas[i].getTime() > r.horas[i - 1].getTime());
  }
  assert.ok(r.t.resolvedAt && r.t.resolvedAt.getTime() > AHORA_BASE.getTime());
  assert.ok(r.t.status.every((h) => h.fecha.getTime() >= AHORA_BASE.getTime()));
});

test('Tigo asigna solo «M. Delgado» y la nota de carga queda en la bitácora', () => {
  const t2 = aplicarEfectos(entrante(), efectosDelPaso(conPolitica(construirEscenarioA(ctx()))[1]), AHORA_BASE, 'Gestor');
  assert.equal(RESPONSABLE_MENOR_CARGA, 'M. Delgado');
  assert.equal(t2.owner, 'M. Delgado');
  assert.equal(t2.log.length, 1);
  assert.match(t2.log[0].nota, /Menor carga · 2 activos/);
});

/* ── Escenarios B y C ── */

const textoB = 'Soy Rosa Paredes, DNI 41273985. Me cobraron dos veces la cuota y quiero dejar mi queja. Cel 954 321 876.';
const textoC = 'Soy Marco Huamán, DNI 46012358. Esto es una estafa: pongo la denuncia en INDECOPI y lo publico en redes.';
const ticketB = (): TicketAtc =>
  entrante({
    type: 'QUE',
    cli: 'Rosa Paredes',
    dni: '41273985',
    summary: 'Queja por cobro duplicado',
    interactions: [{ tipo: 'cli', fecha: AHORA_BASE, texto: textoB }],
  });
const ticketC = (): TicketAtc =>
  entrante({
    cli: 'Marco Huamán',
    dni: '46012358',
    summary: 'Cliente anuncia acciones legales',
    interactions: [{ tipo: 'cli', fecha: AHORA_BASE, texto: textoC }],
  });
const venceLibro = sumarDiasHabiles(AHORA_BASE, PLAZO_LIBRO_DIAS);
const pasosB = (guia = true) =>
  construirEscenarioB({
    ticket: ticketB(),
    venceLibro,
    guia: guia ? { version: 1, pasos: ['Registrar'], plantillas: [], criterios: [] } : undefined,
  });
const pasosC = () => construirEscenarioC({ ticket: ticketC(), paqueteMinimo: ['a', 'b', 'c', 'd', 'e', 'f'] });
const esFinal = (e: TicketAtc['state']): boolean => e === 'RESOLVED' || e === 'CLOSED';

test('detectarSenalesRiesgo: positivos y negativos', () => {
  assert.deepEqual(detectarSenalesRiesgo('Quiero mi estado de cuenta, gracias'), { nivel: 'ninguno', frases: [] });
  const alto = detectarSenalesRiesgo('Voy a poner una DENUNCIA en Indecopi y hablar con mi abogado');
  assert.equal(alto.nivel, 'alto');
  assert.deepEqual(alto.frases, ['denuncia', 'indecopi', 'abogado']);
  assert.equal(detectarSenalesRiesgo('Es una estafa, lo voy a publicar en redes').nivel, 'alto');
  assert.equal(detectarSenalesRiesgo('Esto es inaceptable, estoy harto').nivel, 'medio');
  assert.equal(detectarSenalesRiesgo('Pagué con tarjeta y quiero el cronograma de pagos').nivel, 'ninguno');
});

test('evaluarGuardarrailes bloquea por señal de riesgo aunque conflict sea false', () => {
  const r = evaluarGuardarrailes(ticketC());
  assert.equal(r.permitido, false);
  assert.match(r.motivo ?? '', /riesgo verbal/);
});

test('B: plazo legal de 15 días hábiles, guía opcional y asiento/derivación con aprobación', () => {
  assert.equal(PLAZO_LIBRO_DIAS, 15);
  assert.ok(venceLibro.getTime() > AHORA_BASE.getTime());
  // 15 días hábiles son al menos 21 días corridos (3 semanas) y a lo sumo ~25 con feriados.
  const corridos = (venceLibro.getTime() - AHORA_BASE.getTime()) / 86_400_000;
  assert.ok(corridos >= 20 && corridos <= 26, `corridos: ${corridos}`);
  const pasos = pasosB(false);
  const props = pasos.flatMap((p) => p.propuestas);
  assert.ok(props.some((p) => p.accion === 'plazo-libro' && p.titulo.includes('15 días hábiles')));
  assert.ok(props.some((p) => p.accion === 'citar-guia' && /Sin guía publicada/.test(p.titulo)));
  const pend = props.filter((p) => p.estado === 'pendiente');
  assert.deepEqual(pend.map((p) => p.accion), ['registrar-asiento', 'derivar-legal', 'redactar-acuse']);
  assert.ok(pend.every((p) => p.requiereAprobacion));
  // Los efectos automáticos no registran el asiento, no derivan ni resuelven.
  assert.ok(!conPolitica(pasos, 'QUE').some((p) => efectosDelPaso(p).some((e) => ['asiento-libro', 'asignar', 'resuelto', 'cerrado'].includes(e.tipo))));
});

test('B: aprobando todo registra el asiento y deriva a Legal, sin RESOLVED/CLOSED', () => {
  const r = simular(ticketB(), () => 'aprobar', pasosB());
  assert.equal(r.termino, true);
  assert.ok(r.propuestas.some((p) => p.accion === 'fin-sin-cierre'));
  assert.ok(!r.estados.some(esFinal));
  assert.equal(r.t.area, 'LEGAL');
  assert.equal(r.t.owner, 'Dra. P. Vílchez');
  assert.equal(r.t.type, 'QUE');
  assert.ok(r.t.log.some((l) => l.motivo === 'DERIVACION_COMPETENCIA'));
  assert.ok(r.t.log.some((l) => l.motivo === 'TIGO_LIBRO'));
  assert.ok(r.propuestas.every((p) => p.accion !== 'resolver' && p.accion !== 'redactar'));
  assert.equal(sinCierre(r.propuestas), true);
  assert.ok(!r.etapas.includes('cierre') && !r.etapas.includes('postcierre'));
});

test('B: descartar el asiento termina sin cerrar', () => {
  const r = simular(ticketB(), (p) => (p.accion === 'registrar-asiento' ? 'descartar' : 'aprobar'), pasosB());
  assert.equal(r.termino, true);
  assert.ok(!r.estados.some(esFinal));
  assert.ok(r.propuestas.some((p) => p.accion === 'atender-manual'));
});

test('C: se bloquea, no redacta ni resuelve y solo ofrece escalar a Legal con aprobación', () => {
  const pasos = pasosC();
  const props = pasos.flatMap((p) => p.propuestas);
  assert.ok(props.some((p) => p.accion === 'guardarrailes' && p.estado === 'bloqueada'));
  assert.ok(!props.some((p) => ['redactar', 'resolver', 'redactar-acuse'].includes(p.accion)));
  assert.ok(!conPolitica(pasos).some((p) => efectosDelPaso(p).some((e) => ['clasificar', 'respuesta-gestor', 'resuelto', 'cerrado', 'asignar'].includes(e.tipo))));
  const pend = props.filter((p) => p.estado === 'pendiente');
  assert.deepEqual(pend.map((p) => p.accion), ['escalar-legal']);
  assert.equal(pend[0].requiereAprobacion, true);
  assert.equal(pend[0].lineas?.length, 6);
  assert.ok(props.find((p) => p.accion === 'detectar-riesgo')?.lineas?.some((l) => /indecopi/i.test(l)));
});

test('C: al aprobar escala a Legal como Eje 3 y termina; sin aprobar, el ticket no cambia', () => {
  const ok = simular(ticketC(), () => 'aprobar', pasosC());
  assert.equal(ok.termino, true);
  assert.equal(ok.t.area, 'LEGAL');
  assert.equal(ok.t.eje, 3);
  assert.equal(ok.t.conflict, true);
  assert.equal(ok.t.state, 'ESCALATED');
  assert.ok(ok.t.log.some((l) => l.motivo === 'DERIVACION_CONFLICTO_EJE3'));
  assert.ok(!ok.t.interactions.some((i) => i.tipo === 'agt'));
  const no = simular(ticketC(), () => 'descartar', pasosC());
  assert.equal(no.termino, true);
  assert.equal(no.t.area, ticketC().area);
  assert.equal(no.t.state, 'OPEN');
});

test('narrarPaso narra en primera persona sin inventar datos', () => {
  assert.match(narrarPaso(undefined), /elijas un escenario/);
  assert.equal(
    narrarPaso({ accion: 'anonimizar', estado: 'ejecutada', titulo: 'Anonimicé el mensaje del cliente (4 datos)' }),
    'Estoy anonimizando 4 datos antes de consultar a la IA.',
  );
  assert.match(narrarPaso({ accion: 'redactar', estado: 'pendiente', titulo: 'x' }), /espero tu aprobación/);
  assert.match(narrarPaso({ accion: 'escalar-legal', estado: 'pendiente', titulo: 'x' }), /Legal: espero tu aprobación/);
  assert.match(narrarPaso({ accion: 'guardarrailes', estado: 'bloqueada', titulo: 'x' }), /me detuve/);
  assert.match(narrarPaso({ accion: 'redactar', estado: 'descartada', titulo: 'x' }), /atención manual/);
  assert.equal(narrarPaso({ accion: 'inventada', estado: 'ejecutada', titulo: 'Hice algo' }), 'Hice algo.');
  assert.equal(resumenFinal([{ estado: 'ejecutada' }, { estado: 'aprobada' }, { estado: 'descartada' }], 1), 'Tigo hizo 2 acciones; tú decidiste 1.');
  assert.equal(resumenFinal([{ estado: 'ejecutada' }], 0), 'Tigo hizo 1 acción; tú decidiste 0.');
});
