import type { TicketAtc } from './datos-atc';

/**
 * Agregados del Tablero de la Torre de Control CX. Lógica pura, sin Angular.
 * "Abierto" = estado distinto de RESOLVED/CLOSED (igual que el Monitor). El SLA se mide solo sobre
 * abiertos con `evaluarSlaTicket`; la regla de «en riesgo» (<25 % del plazo) es la provisional del prototipo.
 * El catálogo y el evaluador de SLA llegan por parámetro: así este fichero no importa datos-atc en
 * tiempo de ejecución y `node --test` lo carga sin el empaquetador.
 */
/** Token `--aybar-color-*` (sin prefijo) por estado: fuente única de la Torre (gráficos) y de Vivo (barras). */
export const COLOR_ESTADO: Readonly<Record<string, string>> = {
  OPEN: 'info-300',
  IN_PROGRESS: 'info-600',
  PENDING_CUSTOMER: 'neutral-500',
  ESCALATED: 'secondary-500',
  IN_COMMITTEE: 'danger-300',
  REOPENED: 'warning-300',
  RESOLVED: 'success-600',
  CLOSED: 'success-300',
};

export interface DepsTorre {
  areas: readonly string[];
  estados: readonly string[]; // el orden fija el de `porEstado`
  evaluarSla: (t: TicketAtc) => { tono: 'success' | 'warning' | 'danger' };
}

export interface FilaAreaEstado {
  area: string;
  total: number;
  porEstado: number[]; // mismo orden que `estados`
}

export interface FilaSlaArea {
  area: string;
  enPlazo: number;
  enRiesgo: number;
  vencido: number;
}

export interface IndicadoresTorre {
  abiertos: number;
  vencidos: number;
  cumplimientoSla: number | null; // % de abiertos no vencidos
  areaEstado: FilaAreaEstado[];
  porEstado: number[];
  slaPorArea: FilaSlaArea[];
}

export function calcularTorre(tickets: readonly TicketAtc[], { areas, estados, evaluarSla }: DepsTorre): IndicadoresTorre {
  const areaEstado: FilaAreaEstado[] = areas.map((area) => ({ area, total: 0, porEstado: estados.map(() => 0) }));
  const slaPorArea: FilaSlaArea[] = areas.map((area) => ({ area, enPlazo: 0, enRiesgo: 0, vencido: 0 }));
  const porEstado = estados.map(() => 0);
  let abiertos = 0;
  let vencidos = 0;
  for (const t of tickets) {
    const i = areas.indexOf(t.area);
    const e = estados.indexOf(t.state);
    if (i < 0 || e < 0) continue;
    areaEstado[i]!.total++;
    areaEstado[i]!.porEstado[e]!++;
    porEstado[e]!++;
    if (t.state === 'RESOLVED' || t.state === 'CLOSED') continue;
    abiertos++;
    const { tono } = evaluarSla(t);
    const f = slaPorArea[i]!;
    if (tono === 'danger') {
      f.vencido++;
      vencidos++;
    }
    else if (tono === 'warning') f.enRiesgo++;
    else f.enPlazo++;
  }
  return {
    abiertos,
    vencidos,
    cumplimientoSla: abiertos ? Math.round(((abiertos - vencidos) / abiertos) * 1000) / 10 : null,
    areaEstado,
    porEstado,
    slaPorArea,
  };
}
