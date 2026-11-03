/**
 * Reglas del Libro de Reclamaciones, sin Angular: el plazo legal, las alertas, los
 * tickets huérfanos, el correlativo y las validaciones de HU-012 a HU-015.
 *
 * Plazo: 15 días hábiles improrrogables desde el registro (Ley 29571 art. 24.1, modificado
 * por la Ley 31435; ED-28). La prórroga de HU-013 está deshabilitada en el contrato
 * (`prorrogarPlazo` responde AYB-LRC-422), así que aquí no existe.
 */
export const PLAZO_LEGAL_DIAS_HABILES = 15;
/** HU-015 CA-01: la alerta sale a 3 días hábiles del vencimiento. */
export const AVISO_DIAS_HABILES = 3;

/** Días hábiles entre dos fechas, con signo (`diasHabilesEntre` de datos-atc). */
export type DiasEntre = (desde: Date, hasta: Date) => number;

export type EstadoPlazoLibro = 'RESPONDIDO' | 'VENCIDO' | 'POR_VENCER' | 'EN_PLAZO';
export type TonoPlazo = 'success' | 'warning' | 'danger';

export interface PlazoLibro {
  readonly estado: EstadoPlazoLibro;
  readonly tono: TonoPlazo;
  readonly texto: string;
  /** Días hábiles que faltan para vencer; negativo si ya venció. */
  readonly restantes: number;
}

export type TipoAlertaLegal = 'LEGAL_EXTENSION_WINDOW_CLOSING' | 'LEGAL_RESPONSE_OVERDUE';

export interface AlertaLegalLibro {
  readonly id: string;
  readonly asientoId: string;
  readonly codigoAsiento: string;
  readonly tipo: TipoAlertaLegal;
  readonly vencimientoEvaluado: Date;
  readonly restantes: number;
}

interface AsientoPlazo {
  readonly venceOriginal: Date;
  readonly respuesta: { readonly fecha: Date } | null;
}

export function evaluarPlazoLibro(a: AsientoPlazo, hoy: Date, diasEntre: DiasEntre): PlazoLibro {
  if (a.respuesta) {
    const holgura = diasEntre(a.respuesta.fecha, a.venceOriginal);
    return holgura >= 0
      ? { estado: 'RESPONDIDO', tono: 'success', texto: 'Respondido en plazo', restantes: holgura }
      : { estado: 'RESPONDIDO', tono: 'danger', texto: 'Respondido fuera de plazo', restantes: holgura };
  }
  const restantes = diasEntre(hoy, a.venceOriginal);
  if (restantes < 0) {
    return { estado: 'VENCIDO', tono: 'danger', texto: `Vencido hace ${Math.abs(restantes)} d hábiles`, restantes };
  }
  if (restantes <= AVISO_DIAS_HABILES) {
    return {
      estado: 'POR_VENCER',
      tono: 'warning',
      texto: restantes === 0 ? 'Vence hoy' : `Quedan ${restantes} d hábiles`,
      restantes,
    };
  }
  return { estado: 'EN_PLAZO', tono: 'success', texto: `Quedan ${restantes} d hábiles`, restantes };
}

/** HU-015 CA-01: asientos sin respuesta, por vencer (≤ 3 d hábiles) o vencidos. */
export function alertasLegalesDe(
  asientos: readonly (AsientoPlazo & { readonly id: string; readonly codigo: string })[],
  hoy: Date,
  diasEntre: DiasEntre,
): AlertaLegalLibro[] {
  const alertas: AlertaLegalLibro[] = [];
  for (const a of asientos) {
    const p = evaluarPlazoLibro(a, hoy, diasEntre);
    if (p.estado !== 'VENCIDO' && p.estado !== 'POR_VENCER') continue;
    alertas.push({
      id: `al-${a.id}`,
      asientoId: a.id,
      codigoAsiento: a.codigo,
      tipo: p.estado === 'VENCIDO' ? 'LEGAL_RESPONSE_OVERDUE' : 'LEGAL_EXTENSION_WINDOW_CLOSING',
      vencimientoEvaluado: a.venceOriginal,
      restantes: p.restantes,
    });
  }
  return alertas.sort((x, y) => x.restantes - y.restantes);
}

interface TicketMinimo {
  readonly num: string;
  readonly type: string;
  readonly state: string;
}

const ESTADOS_CERRADOS = new Set(['RESOLVED', 'CLOSED']);

/** Ticket abierto, sin asiento en el Libro. */
export const ticketSinAsiento = (t: TicketMinimo, asientos: readonly { readonly ticketNum: string }[]): boolean =>
  !ESTADOS_CERRADOS.has(t.state) && !asientos.some((a) => a.ticketNum === t.num);

/**
 * HU-015 CA-02 (RN-SVC-011): ticket activo de un tipo que exige Libro y sin asiento. El flag del
 * tipo es indicativo; lo decisivo es que exista la fila del asiento.
 */
export function ticketsHuerfanos<T extends TicketMinimo>(
  tickets: readonly T[],
  tiposConLibro: ReadonlySet<string>,
  asientos: readonly { readonly ticketNum: string }[],
): T[] {
  return tickets.filter((t) => tiposConLibro.has(t.type) && ticketSinAsiento(t, asientos));
}

/** HU-012 CA-01: el correlativo corre por empresa y por establecimiento (RN-SVC-004). */
export function siguienteCorrelativo(
  asientos: readonly { readonly codigo: string; readonly empresaId: string; readonly establecimiento: string }[],
  empresaId: string,
  establecimiento: string,
  anio = 2026,
): { numero: string; codigo: string } {
  const mayor = asientos
    .filter((a) => a.empresaId === empresaId && a.establecimiento === establecimiento)
    .map((a) => Number(a.codigo.split('-').pop()))
    .filter((n) => Number.isFinite(n))
    .reduce((m, n) => Math.max(m, n), 0);
  const numero = String(mayor + 1).padStart(4, '0');
  return { numero, codigo: `${empresaId}-${anio}-${numero}` };
}

export interface BorradorAsiento {
  readonly ticketNum: string;
  readonly establecimiento: string;
  readonly hechos: string;
  readonly pedido: string;
  readonly monto: string;
  readonly moneda: string;
}
export type ErroresAsiento = Partial<Record<keyof BorradorAsiento, string>>;

const aNumero = (texto: string): number => Number(texto.trim().replace(',', '.'));

/** HU-012 CA-02: con monto hace falta la moneda; sin monto, ambos quedan vacíos. */
export function validarAsiento(b: BorradorAsiento): ErroresAsiento {
  const e: ErroresAsiento = {};
  if (!b.ticketNum) e.ticketNum = 'Elige el ticket del asiento.';
  if (!b.establecimiento) e.establecimiento = 'Elige el establecimiento.';
  if (!b.hechos.trim()) e.hechos = 'Describe los hechos que motivan el reclamo o la queja.';
  if (!b.pedido.trim()) e.pedido = 'Anota lo que pide el consumidor.';
  if (b.monto.trim()) {
    const n = aNumero(b.monto);
    if (!Number.isFinite(n) || n <= 0) e.monto = 'El monto debe ser un número mayor que 0.';
    if (!b.moneda) e.moneda = 'Indica la moneda del monto.';
  }
  return e;
}

export function normalizarMonto(monto: string, moneda: string): { monto: number | null; moneda: 'PEN' | 'USD' | null } {
  if (!monto.trim()) return { monto: null, moneda: null };
  return { monto: aNumero(monto), moneda: moneda === 'USD' ? 'USD' : 'PEN' };
}

export interface BorradorRespuesta {
  readonly resumen: string;
  readonly carta: string | null;
  readonly cargo: string | null;
  readonly derechoIndecopi: boolean;
}
export type ErroresRespuesta = Partial<Record<keyof BorradorRespuesta, string>>;

/** HU-014 CA-01 a CA-03 y RN-SVC-010: sin carta ni cargo la respuesta no vale ante INDECOPI. */
export function validarRespuesta(b: BorradorRespuesta): ErroresRespuesta {
  const e: ErroresRespuesta = {};
  if (b.resumen.trim().length < 20) e.resumen = 'Resume la respuesta con claridad (mínimo 20 caracteres).';
  if (!b.carta) e.carta = 'Adjunta la carta de respuesta en PDF.';
  if (!b.cargo) e.cargo = 'Adjunta el cargo de recepción: sin cargo la respuesta no es válida (RN-SVC-010).';
  if (!b.derechoIndecopi) e.derechoIndecopi = 'Confirma que se informó al consumidor su derecho a acudir a INDECOPI.';
  return e;
}

/** Huella de ejemplo para el prototipo: parece un SHA-256 (64 hex) y es estable por nombre; no es criptográfica. */
export function huellaSimulada(nombre: string): string {
  let salida = '';
  for (let bloque = 0; salida.length < 64; bloque++) {
    let h = (2166136261 ^ Math.imul(bloque + 1, 0x9e3779b1)) >>> 0;
    for (let i = 0; i < nombre.length; i++) h = Math.imul(h ^ nombre.charCodeAt(i), 16777619) >>> 0;
    h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
    h = Math.imul(h ^ (h >>> 13), 3266489909) >>> 0;
    salida += ((h ^ (h >>> 16)) >>> 0).toString(16).padStart(8, '0');
  }
  return salida.slice(0, 64);
}
