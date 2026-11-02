/**
 * Aprendizaje gobernado de Tigo (lógica PURA + semilla simulada). Propuesta fuera de la Etapa 1.
 * Tigo NO se reentrena solo: las decisiones del gestor (aceptada, editada, descartada) alimentan PROPUESTAS DE MEJORA
 * de la guía de solución que el administrador funcional publica o rechaza. Una guía mejor da mejores borradores.
 * ADR-007: aquí solo hay conteos y etiquetas de categoría, nunca texto. Determinista: sin Math.random ni Date.now.
 */
import type { DecisionTigo } from './tigo-modelo';

/** Conteos de borradores de un tipo con una versión de guía (últimos 30 días). SIMULADO. */
export interface RegistroHistorico {
  tipo: string;
  guiaVersion: number;
  total: number;
  aceptadas: number;
  editadas: number;
  descartadas: number;
  etiquetas: { etiqueta: string; veces: number }[];
}

/** Datos simulados para la demostración: no salen de ningún sistema real. */
export const HISTORICO_TIGO: readonly RegistroHistorico[] = [
  {
    tipo: 'CTA',
    guiaVersion: 1,
    total: 20,
    aceptadas: 9,
    editadas: 8,
    descartadas: 3,
    etiquetas: [
      { etiqueta: 'agregó dato de operación', veces: 5 },
      { etiqueta: 'agregó fecha', veces: 4 },
      { etiqueta: 'alargó', veces: 3 },
    ],
  },
  {
    tipo: 'CTA',
    guiaVersion: 2,
    total: 24,
    aceptadas: 14,
    editadas: 8,
    descartadas: 2,
    etiquetas: [
      { etiqueta: 'agregó dato de operación', veces: 6 },
      { etiqueta: 'agregó fecha', veces: 5 },
      { etiqueta: 'acortó', veces: 2 },
    ],
  },
  {
    tipo: 'QUE',
    guiaVersion: 1,
    total: 5,
    aceptadas: 3,
    editadas: 1,
    descartadas: 1,
    etiquetas: [{ etiqueta: 'cambió el tono', veces: 1 }],
  },
  {
    tipo: 'PED',
    guiaVersion: 1,
    total: 12,
    aceptadas: 9,
    editadas: 2,
    descartadas: 1,
    etiquetas: [{ etiqueta: 'agregó fecha', veces: 2 }],
  },
];

/** Métricas de impacto SIMULADAS (marcadas «Datos simulados» en la interfaz). */
export const IMPACTO_SIMULADO = {
  primeraRespuestaConTigoMin: 12,
  primeraRespuestaSinTigoMin: 38,
  csatAsistido: 4.6,
  csatNoAsistido: 4.3,
} as const;

/** Umbral para proponer una mejora: editadas / total >= 30 % y al menos 10 borradores. */
export const UMBRAL_EDICION = 0.3;
export const MUESTRA_MINIMA = 10;

/** Una versión con menos de 5 borradores no se grafica como barra: la muestra no alcanza. */
export const MUESTRA_MINIMA_GRAFICO = 5;
export const muestraSuficiente = (total: number): boolean => total >= MUESTRA_MINIMA_GRAFICO;

/** «1 borrador» / «N borradores». */
export const borradores = (n: number): string => `${n} borrador${n === 1 ? '' : 'es'}`;

/** Diferencias explícitas del impacto: minutos de primera respuesta (% de cambio) y CSAT (puntos). */
export function contrasteImpacto(i: typeof IMPACTO_SIMULADO): { respuestaPct: string; csatDif: string } {
  const pct = Math.round(((i.primeraRespuestaConTigoMin - i.primeraRespuestaSinTigoMin) / i.primeraRespuestaSinTigoMin) * 100);
  const dif = Math.round((i.csatAsistido - i.csatNoAsistido) * 10) / 10;
  return {
    respuestaPct: `${pct > 0 ? '+' : '-'}${Math.abs(pct)} %`,
    csatDif: `${dif >= 0 ? '+' : '-'}${Math.abs(dif).toFixed(1).replace('.', ',')}`,
  };
}

export type EstadoAprendizaje = 'pendiente' | 'publicada' | 'rechazada';

export interface PropuestaAprendizaje {
  id: string;
  tipo: string;
  nombreTipo: string;
  guiaBase: number;
  hallazgo: string;
  evidencia: {
    total: number;
    aceptadas: number;
    editadas: number;
    descartadas: number;
    etiquetas: { etiqueta: string; veces: number }[];
  };
  plantillaActual: string;
  plantillaPropuesta: string;
  criterioNuevo?: string;
  estado: EstadoAprendizaje;
  /** `sesion` si el uso de hoy aporta decisiones a la evidencia; si no, `historico`. */
  origen: 'historico' | 'sesion';
}

/** Lo que se necesita de una guía vigente (estructural: no importa el estado de la consola). */
export interface GuiaVigente {
  tipo: string;
  nombreTipo: string;
  versionActual: number | null;
  plantillas: readonly string[];
  criterios: readonly string[];
}

const ES_BORRADOR = (d: DecisionTigo): boolean => d.accion === 'redactar' || d.accion === 'redactar-acuse';

const FRASE_OPERACION = 'Tu abono corresponde a la operación {operacion} del {ultimoPago}.';
const CRITERIO_OPERACION = 'Citar el número de operación y la fecha del último pago.';

const sumarEtiquetas = (a: { etiqueta: string; veces: number }[], b: readonly string[] | { etiqueta: string; veces: number }[]) => {
  const mapa = new Map(a.map((e) => [e.etiqueta, e.veces]));
  for (const e of b) {
    const [nombre, veces] = typeof e === 'string' ? [e, 1] : [e.etiqueta, e.veces];
    mapa.set(nombre, (mapa.get(nombre) ?? 0) + veces);
  }
  return [...mapa].map(([etiqueta, veces]) => ({ etiqueta, veces })).sort((x, y) => y.veces - x.veces || x.etiqueta.localeCompare(y.etiqueta));
};

/** Conteos de un tipo y versión de guía: histórico simulado más decisiones de la sesión (borradores con guiaVersion). */
function evidenciaDe(tipo: string, version: number, decisiones: readonly DecisionTigo[], historico: readonly RegistroHistorico[]) {
  const ev: PropuestaAprendizaje['evidencia'] = { total: 0, aceptadas: 0, editadas: 0, descartadas: 0, etiquetas: [] };
  for (const h of historico.filter((x) => x.tipo === tipo && x.guiaVersion === version)) {
    ev.total += h.total;
    ev.aceptadas += h.aceptadas;
    ev.editadas += h.editadas;
    ev.descartadas += h.descartadas;
    ev.etiquetas = sumarEtiquetas(ev.etiquetas, h.etiquetas);
  }
  const ses = decisiones.filter((d) => ES_BORRADOR(d) && d.tipo === tipo && d.guiaVersion === version);
  for (const d of ses) {
    ev.total++;
    if (d.decision === 'ACEPTADA') ev.aceptadas++;
    else if (d.decision === 'EDITADA') ev.editadas++;
    else ev.descartadas++;
    ev.etiquetas = sumarEtiquetas(ev.etiquetas, d.etiquetas);
  }
  return { ev, sesion: ses.length };
}

function armarHallazgo(g: GuiaVigente, ev: PropuestaAprendizaje['evidencia']): string {
  const top = ev.etiquetas.slice(0, 2).map((e) => e.etiqueta);
  const operacionYFecha = top.includes('agregó dato de operación') && top.includes('agregó fecha');
  const que = operacionYFecha
    ? 'agregó el número de operación y la fecha del último pago'
    : `hizo lo mismo con más frecuencia: «${top[0] ?? 'reformuló'}»`;
  return `En ${ev.editadas} de ${ev.total} borradores de ${g.nombreTipo} el gestor ${que}.`;
}

/**
 * Una propuesta por tipo cuando, con la guía vigente, editadas >= 30 % y hay al menos 10 borradores (histórico + sesión).
 * La etiqueta dominante decide el cambio de plantilla. Devuelve solo conteos y plantillas, nunca texto de un cliente.
 */
export function derivarPropuestasAprendizaje(
  decisiones: readonly DecisionTigo[],
  historico: readonly RegistroHistorico[],
  guias: readonly GuiaVigente[],
): PropuestaAprendizaje[] {
  const salida: PropuestaAprendizaje[] = [];
  for (const g of guias) {
    if (g.versionActual === null) continue;
    const { ev, sesion } = evidenciaDe(g.tipo, g.versionActual, decisiones, historico);
    if (ev.total < MUESTRA_MINIMA || ev.editadas / ev.total < UMBRAL_EDICION) continue;
    const dominante = ev.etiquetas[0]?.etiqueta ?? '';
    const actual = g.plantillas[0] ?? '';
    const poneOperacion = dominante === 'agregó dato de operación' || dominante === 'agregó fecha';
    salida.push({
      id: `apr-${g.tipo}-v${g.versionActual}`,
      tipo: g.tipo,
      nombreTipo: g.nombreTipo,
      guiaBase: g.versionActual,
      hallazgo: armarHallazgo(g, ev),
      evidencia: ev,
      plantillaActual: actual,
      plantillaPropuesta: poneOperacion && !actual.includes('{operacion}') ? `${actual.trim()} ${FRASE_OPERACION}`.replace(/\s{2,}/g, ' ') : actual,
      criterioNuevo: poneOperacion
        ? g.criterios.includes(CRITERIO_OPERACION) ? undefined : CRITERIO_OPERACION
        : `Revisar la plantilla con lo que los gestores ajustan a mano («${dominante}»).`,
      estado: 'pendiente',
      origen: sesion > 0 ? 'sesion' : 'historico',
    });
  }
  return salida;
}

/** Plantillas y criterios de la versión siguiente: la propuesta pasa a ser la primera plantilla y el criterio nuevo se suma. */
export function aplicarPropuestaAGuia(
  guia: Pick<GuiaVigente, 'plantillas' | 'criterios'>,
  a: Pick<PropuestaAprendizaje, 'plantillaPropuesta' | 'criterioNuevo'>,
): { plantillas: string[]; criterios: string[] } {
  return {
    plantillas: [a.plantillaPropuesta, ...guia.plantillas.slice(1)],
    criterios: a.criterioNuevo && !guia.criterios.includes(a.criterioNuevo) ? [...guia.criterios, a.criterioNuevo] : [...guia.criterios],
  };
}

/* ── Métricas ── */

export interface FilaMetrica {
  clave: string;
  etiqueta: string;
  total: number;
  aceptadas: number;
  editadas: number;
  descartadas: number;
  /** % de aceptación sin cambios; null si no hay datos. */
  aceptacionPct: number | null;
  /** Hay datos simulados / hay datos reales de la sesión. */
  simulado: boolean;
  real: boolean;
}

const pct = (n: number, total: number): number | null => (total ? Math.round((n / total) * 100) : null);

function fila(clave: string, etiqueta: string, hist: readonly RegistroHistorico[], ses: readonly DecisionTigo[]): FilaMetrica {
  const f = { total: 0, aceptadas: 0, editadas: 0, descartadas: 0 };
  for (const h of hist) {
    f.total += h.total;
    f.aceptadas += h.aceptadas;
    f.editadas += h.editadas;
    f.descartadas += h.descartadas;
  }
  for (const d of ses) {
    f.total++;
    if (d.decision === 'ACEPTADA') f.aceptadas++;
    else if (d.decision === 'EDITADA') f.editadas++;
    else f.descartadas++;
  }
  return { clave, etiqueta, ...f, aceptacionPct: pct(f.aceptadas, f.total), simulado: hist.length > 0, real: ses.length > 0 };
}

export interface MetricasTigo {
  /** Histórico simulado + sesión. */
  global: FilaMetrica;
  /** Solo la sesión (dato real del prototipo). */
  sesion: FilaMetrica;
  porTipo: FilaMetrica[];
  /** Por tipo y versión de guía, en orden de tipo y versión. */
  porVersion: (FilaMetrica & { tipo: string; version: number })[];
  ticketsAsistidos: { simulados: number; sesion: number };
}

export function calcularMetricas(decisiones: readonly DecisionTigo[], historico: readonly RegistroHistorico[]): MetricasTigo {
  const ses = decisiones.filter((d) => ES_BORRADOR(d) && d.guiaVersion !== undefined);
  const tipos = [...new Set([...historico.map((h) => h.tipo), ...ses.map((d) => d.tipo)])].sort();
  const porVersion: MetricasTigo['porVersion'] = [];
  for (const tipo of tipos) {
    const versiones = [
      ...new Set([...historico.filter((h) => h.tipo === tipo).map((h) => h.guiaVersion), ...ses.filter((d) => d.tipo === tipo).map((d) => d.guiaVersion as number)]),
    ].sort((a, b) => a - b);
    for (const version of versiones) {
      porVersion.push({
        ...fila(`${tipo}-v${version}`, `${tipo} v${version}`, historico.filter((h) => h.tipo === tipo && h.guiaVersion === version), ses.filter((d) => d.tipo === tipo && d.guiaVersion === version)),
        tipo,
        version,
      });
    }
  }
  return {
    global: fila('global', 'Todos los tipos', historico, ses),
    sesion: fila('sesion', 'Sesión', [], ses),
    porTipo: tipos.map((t) => fila(t, t, historico.filter((h) => h.tipo === t), ses.filter((d) => d.tipo === t))),
    porVersion,
    ticketsAsistidos: { simulados: historico.reduce((n, h) => n + h.total, 0), sesion: new Set(ses.map((d) => d.ticket)).size },
  };
}
