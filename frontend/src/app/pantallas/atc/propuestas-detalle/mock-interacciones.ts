import type { InteraccionTicket, TicketAtc } from '../datos-atc';
import { AREA_ES, MOTIVO_ES, etiqueta, traducirCodigos } from '../etiquetas-es';

/**
 * Datos de prueba de la sección de interacciones del ticket. Siguen el diccionario de datos
 * (`SVC_TICKET_INTERACCION`, docs/datos/diccionario.md): tipo, canal, visible, autor, adjuntos y
 * grabación de llamada. No son datos reales ni salen del backend.
 */

/** Tipos del diccionario: mensaje cliente / respuesta agente / nota interna / cambio de estado / llamada. */
export type TipoInteraccion =
  | 'mensaje_cliente'
  | 'respuesta_agente'
  | 'nota_interna'
  | 'cambio_estado'
  | 'llamada';

/** Quién la generó: una persona del equipo, el cliente o el sistema (marca automática, HU-004 CA-03). */
export type OrigenInteraccion = 'cliente' | 'gestor' | 'sistema';

export interface InteraccionMock {
  readonly id: string;
  readonly tipo: TipoInteraccion;
  readonly origen: OrigenInteraccion;
  readonly canal: string;
  /** Visible al cliente (`Visible` del diccionario). Las notas internas nunca lo son (RN-SVC-044). */
  readonly visible: boolean;
  readonly autor: string;
  /** Área responsable: es lo que ve el cliente en lugar del nombre del gestor (HU-065 CA-03). */
  readonly area: string;
  readonly fecha: Date;
  /** Texto para el equipo. */
  readonly texto: string;
  /** Texto para el cliente en una entrada visible, sin datos internos. Si falta se usa `texto`. */
  readonly textoCliente?: string;
  readonly adjuntos?: readonly string[];
  readonly llamada?: { readonly duracion: string; readonly grabacion: boolean };
  /** Subtipo que el diccionario no distingue: «Nota de estado emocional» (HU-028). */
  readonly subtipo?: string;
  /** Paso que esta entrada marca en la línea de tiempo del cliente (HU-065). */
  readonly paso?: string;
  /**
   * Es un movimiento de asignación (asignado, derivado). Su sitio es la bitácora de asignaciones
   * (`SVC_TICKET_ASIGNACION`, HU-007), no el registro de interacciones del equipo; solo se usa para la
   * línea de tiempo del cliente, que muestra el área que tiene el ticket (HU-065).
   */
  readonly asignacion?: boolean;
}

/** `minutos` después de la apertura del ticket. */
const t0 = (t: TicketAtc, minutos: number): Date => new Date(t.opened.getTime() + minutos * 60_000);

function deAlta(t: TicketAtc): InteraccionMock[] {
  const area = 'Atención al cliente';
  return [
    {
      id: 'a1',
      tipo: 'cambio_estado',
      origen: 'sistema',
      canal: t.ch,
      visible: true,
      autor: 'Sistema',
      area,
      fecha: t0(t, 0),
      texto: 'Ticket registrado desde el canal Teléfono. Estado: abierto.',
      textoCliente: 'Recibimos tu solicitud y le asignamos un número de caso.',
      paso: 'Registrado',
    },
    {
      id: 'a2',
      tipo: 'mensaje_cliente',
      origen: 'cliente',
      canal: t.ch,
      visible: true,
      autor: t.cli,
      area,
      fecha: t0(t, 1),
      texto: 'Pagué los gastos notariales hace dos meses y la minuta sigue sin firmarse. Si no me responden esta semana envío carta notarial.',
    },
    {
      id: 'a3',
      tipo: 'llamada',
      origen: 'gestor',
      canal: 'Teléfono',
      visible: false,
      autor: 'C. Rojas',
      area,
      fecha: t0(t, 3),
      texto: 'Llamada entrante atendida desde la ficha del cliente.',
      llamada: { duracion: '06:12', grabacion: true },
    },
    {
      id: 'a4',
      tipo: 'cambio_estado',
      origen: 'sistema',
      canal: t.ch,
      visible: true,
      autor: 'Sistema',
      area,
      fecha: t0(t, 4),
      texto: 'Asignado a C. Rojas (ATC) por menor carga. Marca automática.',
      textoCliente: 'Tu caso fue asignado a un gestor del área de Atención al cliente.',
      paso: 'Asignado',
      asignacion: true,
    },
    {
      id: 'a5',
      tipo: 'respuesta_agente',
      origen: 'gestor',
      canal: t.ch,
      visible: true,
      autor: 'C. Rojas',
      area,
      fecha: t0(t, 60),
      texto: 'Registramos su reclamo N.º ALT-001204 en el Libro de Reclamaciones. Le responderemos dentro del plazo legal de 15 días hábiles.',
      adjuntos: ['Cargo de recepción del reclamo.pdf'],
    },
    {
      id: 'a6',
      tipo: 'nota_interna',
      origen: 'gestor',
      canal: t.ch,
      visible: false,
      autor: 'C. Rojas',
      area,
      fecha: t0(t, 70),
      texto: 'El cliente anuncia carta notarial. Corresponde derivar a Legal (Eje 3) y armar el paquete mínimo 6/6.',
    },
    {
      id: 'a7',
      tipo: 'nota_interna',
      origen: 'gestor',
      canal: t.ch,
      visible: false,
      autor: 'C. Rojas',
      area,
      fecha: t0(t, 75),
      subtipo: 'Nota de estado emocional',
      texto: 'Estado observado: el cliente habla con tono elevado y repite que anunciará carta notarial. Describo lo observado, sin juicio de valor.',
    },
    {
      id: 'a8',
      tipo: 'cambio_estado',
      origen: 'sistema',
      canal: t.ch,
      visible: true,
      autor: 'Sistema',
      area: 'Legal',
      fecha: t0(t, 1440),
      texto: 'Derivado de ATC a LEGAL. Motivo: conflicto (Eje 3). Paquete mínimo 6/6 confirmado. Estado: escalado.',
      textoCliente: 'Tu caso pasó al área Legal para su revisión.',
      paso: 'En atención',
      asignacion: true,
    },
    {
      id: 'a9',
      tipo: 'nota_interna',
      origen: 'gestor',
      canal: 'Correo',
      visible: false,
      autor: 'Dra. P. Vílchez',
      area: 'Legal',
      fecha: t0(t, 1440 + 280),
      texto: 'Recibido el paquete 6/6. Reviso el asiento del Libro y la minuta pendiente antes de contestar.',
      adjuntos: ['Paquete mínimo 6-6.zip'],
    },
    {
      id: 'a10',
      tipo: 'respuesta_agente',
      origen: 'gestor',
      canal: 'Correo',
      visible: true,
      autor: 'Dra. P. Vílchez',
      area: 'Legal',
      fecha: t0(t, 2880 + 90),
      texto: 'Su reclamo fue recibido por el área Legal. El plazo legal de respuesta vence el 31 de octubre. Le pedimos una copia de la minuta que firmó.',
    },
    {
      id: 'a11',
      tipo: 'mensaje_cliente',
      origen: 'cliente',
      canal: 'Mi Portal',
      visible: true,
      autor: t.cli,
      area: 'Legal',
      fecha: t0(t, 4320 + 600),
      texto: 'Adjunto la copia de la minuta firmada.',
      adjuntos: ['Minuta firmada.pdf'],
    },
  ];
}

function deEsperaCliente(t: TicketAtc): InteraccionMock[] {
  const area = 'Atención al cliente';
  return [
    {
      id: 'b1',
      tipo: 'cambio_estado',
      origen: 'sistema',
      canal: t.ch,
      visible: true,
      autor: 'Sistema',
      area,
      fecha: t0(t, 0),
      texto: 'Ticket registrado desde el canal Correo. Estado: abierto.',
      textoCliente: 'Recibimos tu solicitud y le asignamos un número de caso.',
      paso: 'Registrado',
    },
    {
      id: 'b2',
      tipo: 'mensaje_cliente',
      origen: 'cliente',
      canal: t.ch,
      visible: true,
      autor: t.cli,
      area,
      fecha: t0(t, 0),
      texto: 'Mi cuota de setiembre figura como pendiente, pero ya la pagué en agencia.',
    },
    {
      id: 'b3',
      tipo: 'cambio_estado',
      origen: 'sistema',
      canal: t.ch,
      visible: true,
      autor: 'Sistema',
      area,
      fecha: t0(t, 5),
      texto: 'Asignado a C. Rojas (ATC). Marca automática.',
      textoCliente: 'Tu caso fue asignado a un gestor del área de Atención al cliente.',
      paso: 'Asignado',
      asignacion: true,
    },
    {
      id: 'b4',
      tipo: 'nota_interna',
      origen: 'gestor',
      canal: t.ch,
      visible: false,
      autor: 'C. Rojas',
      area,
      fecha: t0(t, 90),
      texto: 'El pago no figura en la conciliación bancaria de la fecha indicada. Pido el voucher al cliente y congelo el SLA.',
    },
    {
      id: 'b5',
      tipo: 'respuesta_agente',
      origen: 'gestor',
      canal: t.ch,
      visible: true,
      autor: 'C. Rojas',
      area,
      fecha: t0(t, 95),
      texto: 'Para validar su pago necesitamos el voucher de la cuota de setiembre. Puede adjuntarlo respondiendo desde Mi Portal.',
    },
    {
      id: 'b6',
      tipo: 'cambio_estado',
      origen: 'sistema',
      canal: t.ch,
      visible: true,
      autor: 'Sistema',
      area,
      fecha: t0(t, 96),
      texto: 'Estado: pendiente del cliente. SLA congelado hasta recibir respuesta.',
      textoCliente: 'Necesitamos un documento tuyo para continuar. Tu plazo está en pausa hasta que respondas.',
      paso: 'Pendiente del cliente',
    },
  ];
}

const ESTADO_PASO: Readonly<Record<string, string>> = {
  OPEN: 'Registrado',
  IN_PROGRESS: 'En atención',
  PENDING_CUSTOMER: 'Pendiente del cliente',
  ESCALATED: 'En atención',
  IN_COMMITTEE: 'En atención',
  RESOLVED: 'Resuelto',
  CLOSED: 'Cerrado',
  REOPENED: 'En atención',
};

/** Tickets sin guion propio: se arma con lo que ya trae el prototipo. */
function deDefecto(t: TicketAtc): InteraccionMock[] {
  const area = t.area;
  const desdeLog: InteraccionMock[] = t.log.map((lg, i) => ({
    id: `l${i}`,
    tipo: 'cambio_estado',
    origen: 'sistema',
    canal: t.ch,
    visible: true,
    autor: 'Sistema',
    area: lg.area,
    fecha: lg.fecha,
    texto: `${etiqueta(MOTIVO_ES, lg.motivo)} — ${traducirCodigos(lg.nota)}`,
    textoCliente: i === 0 ? 'Recibimos tu solicitud y le asignamos un número de caso.' : 'Tu caso pasó a otra área para su atención.',
    paso: i === 0 ? 'Registrado' : (ESTADO_PASO[t.state] ?? 'En atención'),
    asignacion: true,
  }));
  const desdeHilo: InteraccionMock[] = t.interactions.map((it: InteraccionTicket, i) => ({
    id: `i${i}`,
    tipo:
      it.tipo === 'cli' ? 'mensaje_cliente' : it.tipo === 'agt' ? 'respuesta_agente' : it.tipo === 'int' ? 'nota_interna' : 'cambio_estado',
    origen: it.tipo === 'cli' ? 'cliente' : it.tipo === 'sys' ? 'sistema' : 'gestor',
    canal: it.canal ?? t.ch,
    visible: it.tipo !== 'int',
    autor: it.autor ?? 'Sistema',
    area,
    fecha: it.fecha,
    texto: traducirCodigos(it.texto),
  }));
  return [...desdeLog, ...desdeHilo].sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
}

/** Interacciones de prueba del ticket, de la más antigua a la más reciente. */
export function crearInteraccionesMock(t: TicketAtc): InteraccionMock[] {
  if (t.num === 'ALT-001204') return deAlta(t);
  if (t.num === 'AIN-000483') return deEsperaCliente(t);
  return deDefecto(t);
}

/* ── Bitácora de asignaciones (SVC_TICKET_ASIGNACION, HU-007) ───────────────────────────────────── */

/** Motivo del catálogo (`REASSIGNMENT_*`, `DERIVACION_*`…) que explica el movimiento. */
export type OrigenAsignacion = 'inicial' | 'derivacion' | 'masiva' | 'carga';

/**
 * Un movimiento del ticket entre áreas o personas: quién lo tenía antes, a quién pasó y por qué
 * (HU-007 CA-02). Sin persona significa que quedó en el área (CA-01). Es append-only y solo contiene
 * asignaciones: no mensajes ni cambios de estado.
 */
export interface AsignacionMock {
  readonly id: string;
  readonly fecha: Date;
  /** Área y persona que lo tenían; `null` en el primer movimiento. */
  readonly de: string | null;
  /** Área y persona a las que pasó. */
  readonly a: string;
  readonly motivo: string;
  /** Quién lo hizo: una persona (HU-007, HU-008, HU-046) o el sistema (asignación automática). */
  readonly autor: string;
  readonly origen: OrigenAsignacion;
}

function asignacionesDeAlta(t: TicketAtc): AsignacionMock[] {
  return [
    { id: 's1', fecha: t0(t, 0), de: null, a: 'Atención al cliente (sin persona)', motivo: 'Alta según flujo configurado', autor: 'Sistema', origen: 'inicial' },
    { id: 's2', fecha: t0(t, 4), de: 'Atención al cliente (sin persona)', a: 'Atención al cliente · C. Rojas', motivo: 'Asignación automática por menor carga', autor: 'Sistema', origen: 'carga' },
    { id: 's3', fecha: t0(t, 1440), de: 'Atención al cliente · C. Rojas', a: 'Legal · Dra. P. Vílchez', motivo: 'Derivación por conflicto (Eje 3 Legal)', autor: 'C. Rojas', origen: 'derivacion' },
  ];
}

function asignacionesDeEspera(t: TicketAtc): AsignacionMock[] {
  return [
    { id: 's1', fecha: t0(t, 0), de: null, a: 'Atención al cliente (sin persona)', motivo: 'Alta según flujo configurado', autor: 'Sistema', origen: 'inicial' },
    { id: 's2', fecha: t0(t, 5), de: 'Atención al cliente (sin persona)', a: 'Atención al cliente · C. Rojas', motivo: 'Asignación automática por menor carga', autor: 'Sistema', origen: 'carga' },
  ];
}

/** Tickets sin guion propio: se arma con la bitácora que ya trae el prototipo. */
function asignacionesDeDefecto(t: TicketAtc): AsignacionMock[] {
  let previo: string | null = null;
  return t.log.map((lg, i) => {
    const a = `${etiqueta(AREA_ES, lg.area)}${lg.responsable ? ` · ${lg.responsable}` : ' (sin persona)'}`;
    const fila: AsignacionMock = {
      id: `s${i}`,
      fecha: lg.fecha,
      de: previo,
      a,
      motivo: etiqueta(MOTIVO_ES, lg.motivo),
      autor: i === 0 || lg.motivo.startsWith('ALTA') || lg.motivo.startsWith('AUTO') ? 'Sistema' : (previo?.split(' · ')[1] ?? 'Equipo'),
      origen: i === 0 ? 'inicial' : lg.motivo.startsWith('REASSIGNMENT') || lg.motivo.startsWith('AUTO') ? 'carga' : 'derivacion',
    };
    previo = a;
    return fila;
  });
}

/** Asignaciones de prueba del ticket, de la más antigua a la más reciente. */
export function crearAsignacionesMock(t: TicketAtc): AsignacionMock[] {
  if (t.num === 'ALT-001204') return asignacionesDeAlta(t);
  if (t.num === 'AIN-000483') return asignacionesDeEspera(t);
  return asignacionesDeDefecto(t);
}

/* ── Guía de solución (SVC_KNOWLEDGE_ARTICLE, HU-047) ───────────────────────────────────────────── */

/**
 * Documentos requeridos por tipo de ticket. La HU-047 los pide en la guía, pero el prototipo todavía no
 * los modela: son datos de prueba.
 */
const DOCUMENTOS_REQUERIDOS: Readonly<Record<string, readonly string[]>> = {
  PED: ['Copia del DNI del titular', 'Solicitud firmada'],
  CTA: ['DNI del titular', 'Voucher o constancia de pago'],
  VIS: ['Fotos del área a revisar', 'Ficha de la unidad'],
  QUE: ['DNI del titular', 'Detalle de lo ocurrido con fecha y lugar'],
  REC: ['DNI del titular', 'Contrato o minuta', 'Cargo de recepción del reclamo'],
  CIT: ['Fotografía del incidente', 'Ubicación referencial'],
  GAR: ['Acta de entrega', 'Fotos del defecto', 'Informe de inspección técnica'],
};

export function documentosRequeridos(tipo: string): readonly string[] {
  return DOCUMENTOS_REQUERIDOS[tipo] ?? [];
}
