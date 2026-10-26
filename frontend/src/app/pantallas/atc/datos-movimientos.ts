/**
 * Últimos movimientos del cliente para la Vista 360 (V360-01). Datos SINTÉTICOS del prototipo:
 * los tickets y reclamos salen de `crearTicketsDemo()` (se cruzan por DNI) y los pagos, cuotas y
 * contactos son simulados y coherentes con `CLIENTES_360`. Sin backend: la fuente real sería
 * Cobranza / Tickets ATC / CTI (definición pendiente del contrato de datos).
 */
import { ESTADO_ES, crearTicketsDemo, type Cliente360 } from './datos-atc';

export type TipoMovimiento360 = 'pago' | 'cuota' | 'reclamo' | 'ticket' | 'contacto' | 'otro';
export type TonoMovimiento360 = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface Movimiento360 {
  readonly id: string;
  readonly tipo: TipoMovimiento360;
  readonly titulo: string;
  readonly fecha: Date;
  /** Resultado o estado cuando la fuente lo proporciona. */
  readonly estado?: string;
  readonly tono: TonoMovimiento360;
  /** Nodo del grafo 360 con el que se relaciona el movimiento (para resaltarlo al elegirlo). */
  readonly nodoId: string;
}

export const MAX_MOVIMIENTOS_360 = 5;

export const ETIQUETA_TIPO_MOVIMIENTO: Readonly<Record<TipoMovimiento360, string>> = {
  pago: 'Pago',
  cuota: 'Cuota',
  reclamo: 'Reclamo',
  ticket: 'Ticket',
  contacto: 'Contacto',
  otro: 'Operación',
};

const NODO_DE_TIPO: Readonly<Record<TipoMovimiento360, string>> = {
  pago: 'ecta',
  cuota: 'cuotas',
  reclamo: 'libro',
  ticket: 'tick',
  contacto: 'llam',
  otro: 'acta',
};

const f = (iso: string): Date => new Date(`${iso}T12:00:00-05:00`);

const mv = (
  id: string,
  tipo: TipoMovimiento360,
  titulo: string,
  iso: string,
  estado: string | undefined,
  tono: TonoMovimiento360,
  nodoId = NODO_DE_TIPO[tipo],
): Movimiento360 => ({ id, tipo, titulo, fecha: f(iso), estado, tono, nodoId });

/** Pagos, cuotas, contactos y operaciones simuladas por cliente (`Cliente360.k`). */
const MOVIMIENTOS_SIMULADOS: Readonly<Record<string, readonly Movimiento360[]>> = {
  eh: [
    mv('eh-p13', 'cuota', 'Cuota 13 de 60 · S/ 1,180.00', '2026-09-29', 'Pagada y conciliada', 'success'),
    mv('eh-p12', 'cuota', 'Cuota 12 de 60 · S/ 1,180.00', '2026-08-30', 'Pagada y conciliada', 'success'),
    mv('eh-v13', 'pago', 'Voucher BCP #774120', '2026-09-29', 'Conciliado', 'success'),
    mv('eh-ll', 'contacto', 'Llamada entrante (3 min 12 s)', '2026-10-09', 'Grabada · CTI #9921', 'info', 'llam'),
    mv('eh-co', 'contacto', 'Correo «Fecha de entrega de mi lote C-07»', '2026-10-06', '2 mensajes', 'info', 'correos'),
  ],
  jr: [
    mv('jr-c22', 'cuota', 'Cuota 22 de 48 · S/ 980.00', '2026-09-15', 'Vencida', 'danger'),
    mv('jr-c21', 'cuota', 'Cuota 21 de 48 · S/ 980.00', '2026-08-15', 'Vencida', 'danger'),
    mv('jr-c20', 'cuota', 'Cuota 20 de 48 · S/ 980.00', '2026-07-15', 'Vencida', 'danger'),
    mv('jr-ll', 'contacto', 'Llamada de 7 min 40 s', '2026-10-13', 'Reclamo grabado · CTI #9840', 'warning', 'llam'),
    mv('jr-co', 'contacto', 'Correo «Alerta de cancelación de servicios»', '2026-10-14', 'Enviado con constancia', 'info', 'correos'),
    mv('jr-lib', 'reclamo', 'Libro de Reclamaciones ALT-2026-0042', '2026-10-13', 'En plazo · vence 03-nov-2026', 'warning'),
  ],
  lp: [
    mv('lp-c8', 'cuota', 'Cuota 8 de 36 · S/ 1,560.00', '2026-10-05', 'Pagada · débito automático', 'success'),
    mv('lp-c7', 'cuota', 'Cuota 7 de 36 · S/ 1,560.00', '2026-09-05', 'Pagada · débito automático', 'success'),
    mv('lp-ac', 'otro', 'Acta de entrega C-21', '2026-09-20', 'Firmada sin observaciones', 'success'),
    mv('lp-co', 'contacto', 'Correo «Fisura en muro perimétrico»', '2026-10-17', '2 mensajes · acuse enviado', 'info', 'correos'),
  ],
  mq: [
    mv('mq-v', 'pago', 'Voucher BCP #88231 · S/ 1,250.00', '2026-09-28', 'En conciliación', 'warning'),
    mv('mq-c17', 'cuota', 'Cuota 17 de 48 · S/ 1,250.00', '2026-08-28', 'Pagada y conciliada', 'success'),
    mv('mq-ll', 'contacto', 'Llamada (4 min 05 s)', '2026-10-18', 'Registrada · CTI', 'info', 'llam'),
    mv('mq-co', 'contacto', 'Correo «Envío comprobante de pago septiembre»', '2026-10-18', 'Recibido', 'info', 'correos'),
  ],
  rh: [
    mv('rh-ac', 'otro', 'Acta de entrega B-402', '2025-11-14', 'Firmada', 'success'),
    mv('rh-ll', 'contacto', 'Llamada saliente Postventa (2 min 50 s)', '2026-10-18', 'Registrada · CTI', 'info', 'llam'),
    mv('rh-co', 'contacto', 'Correo «Programación de inspección GAR-0091»', '2026-10-18', 'Enviado', 'info', 'correos'),
  ],
  hq: [
    mv('hq-c16', 'cuota', 'Cuota 16 de 60 · S/ 1,180.00', '2026-09-30', 'Vencida', 'danger'),
    mv('hq-c15', 'cuota', 'Cuota 15 de 60 · S/ 1,180.00', '2026-08-30', 'Vencida', 'danger'),
    mv('hq-c14', 'cuota', 'Cuota 14 de 60 · S/ 1,180.00', '2026-07-30', 'Vencida', 'danger'),
  ],
  vs: [
    mv('vs-co', 'contacto', 'Correo «Consulta sobre requisitos de preventa Villa Sol III»', '2026-10-19', 'Recibido', 'info', 'correos'),
    mv('vs-ll', 'contacto', 'Llamada entrante informativa (2 min 10 s)', '2026-10-19', 'Grabada · CTI #9945', 'info', 'llam'),
  ],
};

/** Tickets y reclamos del demo que pertenecen al DNI del cliente. */
function movimientosDeTickets(dni: string): Movimiento360[] {
  return crearTicketsDemo()
    .filter((t) => t.dni === dni)
    .map((t) => {
      const reclamo = t.type === 'REC' || t.type === 'QUE';
      const tipo: TipoMovimiento360 = reclamo ? 'reclamo' : 'ticket';
      const resumen = t.summary.length > 60 ? `${t.summary.slice(0, 60)}…` : t.summary;
      const tono: TonoMovimiento360 =
        t.state === 'CLOSED' || t.state === 'RESOLVED' ? 'success' : t.state === 'ESCALATED' || t.state === 'IN_COMMITTEE' ? 'warning' : 'info';
      return { id: `tk-${t.num}`, tipo, titulo: `${t.num} · ${resumen}`, fecha: t.opened, estado: ESTADO_ES[t.state] ?? t.state, tono, nodoId: NODO_DE_TIPO[tipo] };
    });
}

/** Últimos `max` movimientos (más reciente primero). Cliente sin datos: lista vacía. */
export function ultimosMovimientos(cli: Pick<Cliente360, 'k' | 'dni'>, max = MAX_MOVIMIENTOS_360): readonly Movimiento360[] {
  return [...(MOVIMIENTOS_SIMULADOS[cli.k] ?? []), ...movimientosDeTickets(cli.dni)]
    .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
    .slice(0, max);
}
