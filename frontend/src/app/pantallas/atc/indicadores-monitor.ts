import type { TicketAtc } from './datos-atc';

/**
 * Indicadores de la vista Monitor (OPE-01). Lógica pura, sin Angular.
 * ponytail: definiciones PENDIENTES de decisión (promedios, corte diario, periodo de comparación).
 * Supuestos de este prototipo: el día es la fecha local de `ahora` (el prototipo no usa zona horaria
 * explícita); "abierto" = estado distinto de RESOLVED/CLOSED; tiempos promedio en horas corridas.
 */
export interface IndicadoresMonitor {
  ingresadosDia: number;
  resueltosDia: number;
  porArea: { area: string; abiertos: number }[];
  promedioPrimeraRespuestaH: number | null;
  promedioResolucionH: number | null;
  porPersona: { persona: string; atendidos: number; difVsPromedio: number }[];
  promedioPorPersona: number;
}

const mismoDia = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const cerrado = (t: TicketAtc): boolean => t.state === 'RESOLVED' || t.state === 'CLOSED';

const promedioH = (xs: number[]): number | null =>
  xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length / 3600000 : null;

export function calcularIndicadores(tickets: readonly TicketAtc[], ahora: Date): IndicadoresMonitor {
  const area = new Map<string, number>();
  const persona = new Map<string, number>();
  for (const t of tickets) {
    if (!cerrado(t)) area.set(t.area, (area.get(t.area) ?? 0) + 1);
    // Atendido = asignado a una persona y abierto o resuelto en el día (definición pendiente).
    if (t.owner && (!cerrado(t) || (t.resolvedAt && mismoDia(t.resolvedAt, ahora)))) {
      persona.set(t.owner, (persona.get(t.owner) ?? 0) + 1);
    }
  }
  const total = [...persona.values()].reduce((s, n) => s + n, 0);
  const promedioPorPersona = persona.size ? total / persona.size : 0;
  return {
    ingresadosDia: tickets.filter((t) => mismoDia(t.opened, ahora)).length,
    resueltosDia: tickets.filter((t) => t.resolvedAt && mismoDia(t.resolvedAt, ahora)).length,
    porArea: [...area].map(([a, abiertos]) => ({ area: a, abiertos })).sort((x, y) => y.abiertos - x.abiertos),
    promedioPrimeraRespuestaH: promedioH(
      tickets.filter((t) => t.firstResp).map((t) => t.firstResp!.getTime() - t.opened.getTime()),
    ),
    promedioResolucionH: promedioH(
      tickets.filter((t) => t.resolvedAt).map((t) => t.resolvedAt!.getTime() - t.opened.getTime()),
    ),
    porPersona: [...persona]
      .map(([p, atendidos]) => ({ persona: p, atendidos, difVsPromedio: atendidos - promedioPorPersona }))
      .sort((x, y) => y.atendidos - x.atendidos),
    promedioPorPersona,
  };
}

/** "hace 5 s", "hace 2 min". */
export function textoHace(segundos: number): string {
  const s = Math.max(0, Math.floor(segundos));
  return s < 60 ? `hace ${s} s` : `hace ${Math.floor(s / 60)} min`;
}
