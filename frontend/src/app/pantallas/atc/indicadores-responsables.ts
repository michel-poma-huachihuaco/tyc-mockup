import { AHORA_BASE, evaluarSlaTicket, type TicketAtc } from './datos-atc';

/** Agregaciones del tablero «Responsables» de Operación en Vivo. Lógica pura, sin Angular. */
export type OrdenResponsables = 'riesgo' | 'carga' | 'movimiento';

export interface FilaResponsable {
  /** `null` = fila «Sin asignar». */
  owner: string | null;
  nombre: string;
  /** Área en la que más tickets tiene. */
  area: string;
  /** Tickets activos (no RESOLVED/CLOSED). */
  carga: number;
  porEstado: Record<string, number>;
  enRiesgo: number;
  vencidos: number;
  ultimoMovimiento: Date | null;
  tickets: TicketAtc[];
}

const cerrado = (t: TicketAtc): boolean => t.state === 'RESOLVED' || t.state === 'CLOSED';

/** Fecha más reciente entre bitácora, interacciones y estados del ticket. */
export function ultimoMovimientoTicket(t: TicketAtc): Date | null {
  const ms = [...t.log, ...t.interactions, ...t.status].map((x) => x.fecha.getTime());
  return ms.length ? new Date(Math.max(...ms)) : null;
}

function areaPrincipal(tickets: readonly TicketAtc[]): string {
  const n = new Map<string, number>();
  for (const t of tickets) n.set(t.area, (n.get(t.area) ?? 0) + 1);
  return [...n].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
}

const msDe = (f: FilaResponsable): number => f.ultimoMovimiento?.getTime() ?? 0;

/** Una fila por responsable (los tickets sin dueño van a «Sin asignar», siempre al final). */
export function agruparPorResponsable(
  tickets: readonly TicketAtc[],
  area: string,
  orden: OrdenResponsables,
): FilaResponsable[] {
  const grupos = new Map<string | null, TicketAtc[]>();
  for (const t of tickets) {
    if (area && t.area !== area) continue;
    grupos.set(t.owner, [...(grupos.get(t.owner) ?? []), t]);
  }
  const filas = [...grupos].map(([owner, ts]): FilaResponsable => {
    const porEstado: Record<string, number> = {};
    let enRiesgo = 0;
    let vencidos = 0;
    let ultimo = 0;
    for (const t of ts) {
      porEstado[t.state] = (porEstado[t.state] ?? 0) + 1;
      const tono = evaluarSlaTicket(t).tono;
      if (tono === 'warning') enRiesgo++;
      if (tono === 'danger') vencidos++;
      ultimo = Math.max(ultimo, ultimoMovimientoTicket(t)?.getTime() ?? 0);
    }
    return {
      owner,
      nombre: owner ?? 'Sin asignar',
      area: areaPrincipal(ts),
      carga: ts.filter((t) => !cerrado(t)).length,
      porEstado,
      enRiesgo,
      vencidos,
      ultimoMovimiento: ultimo ? new Date(ultimo) : null,
      tickets: ts,
    };
  });
  const cmp: Record<OrdenResponsables, (a: FilaResponsable, b: FilaResponsable) => number> = {
    riesgo: (a, b) => b.vencidos - a.vencidos || b.enRiesgo - a.enRiesgo || b.carga - a.carga,
    carga: (a, b) => b.carga - a.carga,
    movimiento: (a, b) => msDe(b) - msDe(a),
  };
  return filas.sort((a, b) => Number(a.owner === null) - Number(b.owner === null) || cmp[orden](a, b));
}

/** «hace 5 min», «hace 3 h», «hace 2 d» respecto a `ahora` (por defecto, el reloj base del prototipo). */
export function textoHaceDesde(fecha: Date | null, ahora: Date = AHORA_BASE): string {
  if (!fecha) return 'Sin movimientos';
  const min = Math.max(0, Math.floor((ahora.getTime() - fecha.getTime()) / 60000));
  if (min < 1) return 'hace un momento';
  if (min < 60) return `hace ${min} min`;
  if (min < 1440) return `hace ${Math.floor(min / 60)} h`;
  return `hace ${Math.floor(min / 1440)} d`;
}
