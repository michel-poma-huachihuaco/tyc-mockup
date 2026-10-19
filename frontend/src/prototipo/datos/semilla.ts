import { LIBRO_VIRTUAL, POLITICAS_INICIALES } from './catalogos.ts'
import type { Area, Canal, Estado, EstadoApelacion, EstadoCierreSgd, Prioridad, Senal } from './catalogos.ts'
import { cambiarEstado, conAhora, crearTicket, derivar, registrarInteraccion } from '../servicio/nucleo.ts'
import type { Datos, EntradaTicket } from '../servicio/nucleo.ts'
import { asientoDeTicket, cambiarEstadoApelacion, prorrogar, registrarApelacion, registrarAsiento, responder } from '../servicio/libro.ts'
import { ejecutarJobs } from '../servicio/jobs.ts'
import { marcarRayo } from '../servicio/ola6.ts'
import { crearTicketInteresado, evaluarRiesgos, finalizarLlamada } from '../servicio/ola7.ts'
import { INTERESADO_ID } from './clientes.ts'
import type { Flujo, Guia } from '../servicio/ola6.ts'
import { aplicarFrase, derivarEstacion4, ejecutarAuditoriaDatos, llamarApiUrbe, registrarCasoFest, responderEncuesta, vincularContrato } from '../servicio/ola5.ts'
import { programarInspeccion, registrarGarantia, registrarInspeccion, registrarAdenda, resolverGarantia } from '../servicio/garantias.ts'
import type { EntradaGarantia } from '../servicio/garantias.ts'
import { confirmarHandoff, enviarHandoff, marcarSenales, registrarNotaEmocional, retirarSenal } from '../servicio/conflicto.ts'
import type { ElementosHandoff } from '../servicio/conflicto.ts'
import { activar, agregarEvidencia, cerrarCaso, clasificarRiesgo, emitirCargoPrevio, registrarCaso } from '../servicio/mesa.ts'
import type { EntradaCaso } from '../servicio/mesa.ts'
import type { Documento, EntradaApelacion, EntradaAsiento, EntradaEstadoApelacion, EntradaProrroga, EntradaRespuesta } from '../servicio/libro.ts'

/**
 * El estado inicial del prototipo. No se escribe a mano: se reproduce, en orden
 * cronológico, lo que habría pasado en la consola del 1 al 15 de octubre de 2026 —altas,
 * respuestas, derivaciones, cambios de estado, reaperturas y las corridas del job de SLA
 * (9:00 y 14:00 de cada día hábil)— con las mismas reglas del núcleo. Así los historiales,
 * los hitos y las alertas son coherentes entre sí.
 */

/** El «ahora» del prototipo: jueves 15 de octubre de 2026, 11:00 (reloj simulado). */
export const INICIO = new Date(2026, 9, 15, 11, 0)

const F = (dia: number, h: number, m = 0) => new Date(2026, 9, dia, h, m)
/** Septiembre de 2026: los reclamos más antiguos del Libro. */
const S = (dia: number, h: number, m = 0) => new Date(2026, 8, dia, h, m)

/**
 * Documento de la semilla. El checksum es una huella ficticia y determinista: los que se
 * adjuntan en el prototipo sí llevan el SHA-256 real del archivo.
 */
function doc(nombre: string, tamano: number): Documento {
  let h = 2166136261
  let hex = ''
  for (let i = 0; hex.length < 64; i++) {
    h = Math.imul(h ^ (nombre.charCodeAt(i % nombre.length) + i), 16777619) >>> 0
    hex += h.toString(16).padStart(8, '0')
  }
  return { nombre, tamano, sha256: hex.slice(0, 64) }
}

export function datosVacios(ahora: Date = INICIO): Datos {
  return {
    ahora,
    contador: 0,
    secuencias: {
      AIN: 481,
      ALT: 1203,
      APV: 88,
      ACS: 52,
      ADS: 17,
      'LIBRO|ALT|CAR': 41,
      'LIBRO|AIN|VS2': 16,
      'LIBRO|AIN|LIM': 15,
      'LIBRO|AIN|VIR': 8,
      SGD: 317,
      GAR: 84,
      EF: 0,
    },
    politicas: POLITICAS_INICIALES,
    tickets: [],
    filasEstado: [],
    filasAsignacion: [],
    interacciones: [],
    alertas: [],
    alertasConfiguracion: [],
    ejecuciones: [],
    eventos: [],
    auditoria: [],
    asientos: [],
    filasPlazo: [],
    apelaciones: [],
    filasApelacion: [],
    alertasLegales: [],
    excepciones: [],
    senales: [],
    handoffs: [],
    notasEmocionales: [],
    avisos: [],
    casos: [],
    filasCaso: [],
    filasRiesgo: [],
    escalamientos: [],
    evidencias: [],
    garantias: [],
    filasGarantia: [],
    vinculosCiudad: [],
    urbe: { tickets: [], llamadas: [], eventos: [] },
    encuestas: [],
    informes: [],
    registrosParalelos: [],
    auditoriasDatos: [],
    casosFest: [],
    flujos: FLUJOS_INICIALES,
    flujosDeTicket: [],
    rayos: [],
    guias: GUIAS_INICIALES,
    decisionesIA: [],
    alertasOps: [],
    ausentes: [],
    fuentesCaidas: [],
    interesados: [],
    llamadas: [],
    consultasMotor: [],
    sincLegal: [],
    alertasRiesgo: [],
    casosResolucion: [],
    filasResolucion: [],
    constancias: [],
    cartas: [],
    notificaciones: [],
    reservasBus: [],
  }
}

type Paso =
  | { readonly fecha: Date; readonly respuesta: string; readonly autor: string; readonly canal?: Canal }
  | { readonly fecha: Date; readonly nota: string; readonly autor: string }
  | { readonly fecha: Date; readonly cliente: string; readonly canal: Canal }
  | { readonly fecha: Date; readonly derivar: Area; readonly a?: string; readonly motivo: string; readonly nota?: string; readonly autor: string }
  | { readonly fecha: Date; readonly estado: Estado; readonly autor: string; readonly notaEstado?: string }
  | { readonly fecha: Date; readonly asiento: EntradaAsiento; readonly autor: string }
  | { readonly fecha: Date; readonly prorroga: EntradaProrroga; readonly autor: string }
  | { readonly fecha: Date; readonly respuestaLibro: EntradaRespuesta; readonly autor: string }
  | { readonly fecha: Date; readonly apelacion: EntradaApelacion; readonly autor: string }
  | { readonly fecha: Date; readonly estadoApelacion: EstadoApelacion; readonly entrada: EntradaEstadoApelacion; readonly autor: string }
  | { readonly fecha: Date; readonly senales: readonly Senal[]; readonly autor: string }
  | { readonly fecha: Date; readonly retirarSenal: Senal; readonly justificacion: string; readonly autor: string }
  | { readonly fecha: Date; readonly notaEmocional: string; readonly autor: string }
  | { readonly fecha: Date; readonly handoff: ElementosHandoff; readonly autor: string }
  | { readonly fecha: Date; readonly confirmarHandoff: true; readonly autor: string }

interface Caso {
  readonly abierto: Date
  readonly por: string
  readonly entrada: Omit<EntradaTicket, 'establecimiento'> & { readonly establecimiento?: string }
  readonly pasos?: readonly Paso[]
}

const ticket = (
  empresaId: string,
  tipo: string,
  prioridad: Prioridad,
  canal: Canal,
  clienteId: string,
  resumen: string,
  descripcion: string,
  linea = 'Lotes urbanos',
) => ({ empresaId, tipo, prioridad, canal, clienteId, resumen, descripcion, linea })

const RESUMENES_COBRANZA = [
  'Solicita constancia de no adeudo',
  'Consulta por mora aplicada en la cuota',
  'Pide cronograma de pagos actualizado',
  'Reporta doble cargo en la cuota de setiembre',
  'Solicita refinanciamiento de cuotas',
  'Consulta saldo para pago anticipado',
  'Voucher no reflejado en el estado de cuenta',
  'Pide anular cargo por gestión de cobranza',
  'Consulta por intereses moratorios',
  'Solicita devolución de pago en exceso',
  'Pide reprogramar la fecha de pago',
  'Consulta por cuota inicial pendiente',
]

/** Doce pendientes de Renato Salazar (Cobranza): el colaborador que cesa en HU-ATC-008. */
const CASOS_RENATO: Caso[] = RESUMENES_COBRANZA.map((resumen, i) => {
  const dias = [5, 6, 7, 9, 12, 12, 13, 13, 14, 14, 15, 15]
  const abierto = F(dias[i], 9 + (i % 2), (i * 7) % 60)
  const prioridad: Prioridad = (['MEDIUM', 'HIGH', 'LOW', 'MEDIUM', 'URGENT', 'MEDIUM'] as const)[i % 6]
  const empresas = ['AIN', 'ALT', 'AIN', 'ACS', 'ALT', 'AIN']
  const respondido = i % 3 !== 2
  const pasos: Paso[] = []
  if (respondido) pasos.push({ fecha: new Date(abierto.getTime() + 20 * 60_000), respuesta: 'Registramos tu solicitud y la estamos revisando con el área de Cobranza.', autor: 'p-crojas', canal: 'WhatsApp' })
  pasos.push({ fecha: new Date(abierto.getTime() + 35 * 60_000), derivar: 'COBRANZA', a: 'p-rsalazar', motivo: 'DERIVACION_COMPETENCIA', nota: 'Corresponde a Cobranza: revisar estado de cuenta.', autor: 'p-crojas' })
  return {
    abierto,
    por: 'p-crojas',
    entrada: ticket(empresas[i % empresas.length], 'CTA', prioridad, i % 2 ? 'Teléfono' : 'WhatsApp', `cli-${String(10 + i).padStart(3, '0')}`, resumen, `${resumen}. El cliente pide respuesta por el mismo canal.`),
    pasos,
  }
})

const CASOS: Caso[] = [
  ...CASOS_RENATO,
  {
    abierto: F(14, 10),
    por: 'p-crojas',
    entrada: ticket('AIN', 'CTA', 'HIGH', 'WhatsApp', 'cli-001', 'Cuota de setiembre figura vencida pese a pago en agente', 'Pagó en agente bancario y en Mi Portal la cuota figura vencida. Envió el voucher por WhatsApp.'),
    pasos: [
      { fecha: F(14, 10), cliente: 'Buenas, pagué mi cuota en agente y en Mi Portal sale vencida. Adjunto voucher.', canal: 'WhatsApp' },
      { fecha: F(14, 10, 25), respuesta: 'Hola, gracias por el voucher. Registramos tu caso y lo pasamos a Cobranza para validar el abono.', autor: 'p-crojas', canal: 'WhatsApp' },
      { fecha: F(14, 10, 30), nota: 'Voucher recibido por WhatsApp. Verificar conciliación del abono.', autor: 'p-crojas' },
      { fecha: F(14, 10, 40), derivar: 'COBRANZA', a: 'p-mpaz', motivo: 'DERIVACION_COMPETENCIA', nota: 'Validar abono en conciliación bancaria.', autor: 'p-crojas' },
    ],
  },
  {
    abierto: F(13, 15),
    por: 'p-crojas',
    entrada: ticket('ALT', 'CTA', 'MEDIUM', 'Correo', 'cli-002', 'Pide detalle de penalidad por pago tardío', 'Solicita el detalle del cálculo de la penalidad aplicada.'),
    pasos: [
      { fecha: F(13, 15, 30), respuesta: 'Recibimos tu consulta; Cobranza te enviará el detalle del cálculo.', autor: 'p-crojas', canal: 'Correo' },
      { fecha: F(13, 16), derivar: 'COBRANZA', a: 'p-mpaz', motivo: 'DERIVACION_COMPETENCIA', autor: 'p-crojas' },
      { fecha: F(13, 16, 20), senales: ['INDECOPI'], autor: 'p-mpaz' },
      { fecha: F(13, 16, 25), notaEmocional: 'Dice que ya presentó un aviso en INDECOPI. Habla con calma y pide la respuesta por escrito.', autor: 'p-mpaz' },
      { fecha: F(13, 16, 30), handoff: { id: 'ALT · cliente con DNI validado · ticket de la penalidad', kyc: 'Validado en SIGDA/TAXON el 13-oct', lote: 'Villa Sol II · Mz. A Lt. 2', pagos: 'Cuota de setiembre pagada con 6 días de atraso', atencion: 'Cobranza explicó el cálculo de la penalidad', paso: 'Atender el aviso de INDECOPI y revisar la penalidad' }, autor: 'p-mpaz' },
    ],
  },
  // Derivados a Cobranza sin persona: «sin asignar» en la bandeja del área (HU-ATC-007 CA-01, HU-ATC-009 CA-03).
  ...(['Solicita estado de cuenta en PDF', 'Consulta por descuento por pronto pago', 'Pide confirmar recepción de transferencia'] as const).map(
    (resumen, i): Caso => ({
      abierto: F(12 + i, 9 + i, 15),
      por: 'p-dlazo',
      entrada: ticket(['AIN', 'ALT', 'ACS'][i], 'CTA', (['LOW', 'MEDIUM', 'HIGH'] as const)[i], 'Correo', `cli-${String(30 + i).padStart(3, '0')}`, resumen, `${resumen}. Llegó por correo.`),
      pasos: [{ fecha: F(12 + i, 9 + i, 45), derivar: 'COBRANZA', motivo: 'DERIVACION_COMPETENCIA', nota: 'Para quien tome la bandeja de Cobranza.', autor: 'p-dlazo' }],
    }),
  ),
  // ATC: Carla Rojas.
  {
    abierto: F(15, 9, 20),
    por: 'p-crojas',
    entrada: ticket('AIN', 'PED', 'LOW', 'Teléfono', 'cli-003', 'Solicita copia del contrato en PDF', 'Pide una copia digital de su contrato de compraventa.'),
  },
  {
    abierto: F(14, 9, 10),
    por: 'p-crojas',
    entrada: ticket('ALT', 'CTA', 'MEDIUM', 'Correo', 'cli-004', 'Consulta por fecha de entrega de lote', 'Pregunta cuándo se programa la entrega física del lote.'),
  },
  {
    abierto: F(9, 11),
    por: 'p-crojas',
    entrada: ticket('AIN', 'QUE', 'LOW', 'Correo', 'cli-005', 'Queja por el trato recibido en la caseta de ventas', 'Describe una mala atención en la caseta de ventas.', 'Vivienda'),
    pasos: [
      { fecha: F(9, 11, 30), respuesta: 'Lamentamos lo ocurrido. ¿Podrías indicarnos la fecha y la hora de la visita?', autor: 'p-crojas', canal: 'Correo' },
      { fecha: F(9, 11, 35), estado: 'PENDING_CUSTOMER', autor: 'p-crojas', notaEstado: 'Se pidió fecha y hora de la visita.' },
      {
        fecha: F(9, 11, 40),
        asiento: { tipo: 'QUEJA', establecimiento: 'Caseta Villa Sol II', hechos: 'El consumidor relata que el personal de la caseta lo atendió de forma descortés y no le entregó información del proyecto.', pedido: 'Que se revise la atención y se le brinde la información solicitada.', monto: null, moneda: '' },
        autor: 'p-crojas',
      },
    ],
  },
  {
    abierto: F(12, 10),
    por: 'p-crojas',
    entrada: ticket('AIN', 'PED', 'LOW', 'Teléfono', 'cli-006', 'Solicita copia de la minuta firmada', 'Pide la minuta firmada para un trámite bancario.'),
    pasos: [
      { fecha: F(12, 10, 15), respuesta: 'Te enviaremos la minuta firmada a tu correo registrado.', autor: 'p-crojas', canal: 'Teléfono' },
      { fecha: F(13, 9, 40), respuesta: 'Te enviamos la minuta firmada. Confirma la solución desde Mi Portal.', autor: 'p-crojas', canal: 'Correo' },
      { fecha: F(13, 9, 45), estado: 'RESOLVED', autor: 'p-crojas' },
    ],
  },
  {
    abierto: F(5, 10),
    por: 'p-crojas',
    entrada: ticket('ALT', 'CTA', 'MEDIUM', 'Teléfono', 'cli-007', 'Pide constancia de pagos del 2026', 'Necesita la constancia de los pagos realizados en 2026.'),
    pasos: [
      { fecha: F(5, 10, 20), respuesta: 'Preparamos tu constancia y te la enviamos por correo.', autor: 'p-crojas', canal: 'Teléfono' },
      { fecha: F(6, 11), estado: 'RESOLVED', autor: 'p-crojas' },
      { fecha: F(7, 10), estado: 'CLOSED', autor: 'p-crojas', notaEstado: 'El cliente confirmó la solución en Mi Portal.' },
    ],
  },
  // Reabierto dos veces, con una alerta por ciclo (HU-ATC-011 CA-02).
  {
    abierto: F(1, 9),
    por: 'p-crojas',
    entrada: ticket('ALT', 'CTA', 'HIGH', 'WhatsApp', 'cli-008', 'Cargo por mantenimiento duplicado en el recibo', 'El recibo trae dos veces el cargo de mantenimiento.'),
    pasos: [
      { fecha: F(1, 9, 30), respuesta: 'Revisamos el recibo y te confirmamos el ajuste.', autor: 'p-crojas', canal: 'WhatsApp' },
      { fecha: F(6, 10), estado: 'RESOLVED', autor: 'p-crojas' },
      { fecha: F(6, 12), estado: 'CLOSED', autor: 'p-crojas', notaEstado: 'El cliente confirmó la solución en Mi Portal.' },
      { fecha: F(7, 10), cliente: 'El cargo volvió a salir en el recibo nuevo.', canal: 'WhatsApp' },
      { fecha: F(7, 10, 5), estado: 'REOPENED', autor: 'p-crojas' },
      { fecha: F(13, 9, 30), estado: 'RESOLVED', autor: 'p-crojas' },
      { fecha: F(13, 11), estado: 'CLOSED', autor: 'p-crojas', notaEstado: 'El cliente confirmó la solución en Mi Portal.' },
      { fecha: F(14, 15), cliente: 'Sigue apareciendo el cargo, ahora en el recibo de octubre.', canal: 'WhatsApp' },
      { fecha: F(14, 15, 5), estado: 'REOPENED', autor: 'p-crojas' },
    ],
  },
  // ATC sin asignar.
  {
    abierto: F(15, 9, 40),
    por: 'p-dlazo',
    entrada: ticket('ACS', 'CTA', 'MEDIUM', 'Correo', 'cli-011', 'Consulta por requisitos para transferir el lote', 'Pregunta por los requisitos para transferir el lote a un familiar.'),
    pasos: [{ fecha: F(15, 9, 50), derivar: 'ATC', motivo: 'DERIVACION_INFORMACION', nota: 'Fin de turno: queda en la bandeja de ATC.', autor: 'p-dlazo' }],
  },
  {
    abierto: F(15, 10, 15),
    por: 'p-dlazo',
    entrada: ticket('AIN', 'QUE', 'MEDIUM', 'WhatsApp', 'cli-012', 'Queja por demora en la respuesta del call center', 'El cliente esperó más de 20 minutos en la línea.', 'Vivienda'),
    pasos: [{ fecha: F(15, 10, 20), derivar: 'ATC', motivo: 'DERIVACION_INFORMACION', autor: 'p-dlazo' }],
  },
  // Diego Lazo.
  {
    abierto: F(14, 11),
    por: 'p-dlazo',
    entrada: ticket('AIN', 'CTA', 'LOW', 'Teléfono', 'cli-013', 'Pide actualizar su correo de contacto', 'Quiere recibir las comunicaciones en otro correo.'),
    pasos: [
      { fecha: F(14, 11, 10), respuesta: 'Para actualizar tu correo, confírmalo desde Mi Portal.', autor: 'p-dlazo', canal: 'Teléfono' },
      { fecha: F(14, 11, 20), senales: ['PRENSA'], autor: 'p-dlazo' },
      { fecha: F(14, 12), retirarSenal: 'PRENSA', justificacion: 'El cliente mencionó una reseña en redes; no hay publicación ni contacto de prensa.', autor: 'p-gnunez' },
    ],
  },
  // Legal, escalado a Eje 3 (HU-ATC-029 CA-02).
  {
    abierto: F(1, 11),
    por: 'p-crojas',
    entrada: ticket('ALT', 'REC', 'MEDIUM', 'Teléfono', 'cli-014', 'Reclama demora en la entrega de la minuta', 'Pagó gastos notariales y la minuta sigue sin firmarse; anuncia carta notarial.'),
    pasos: [
      { fecha: F(1, 11, 20), respuesta: 'Registramos tu reclamo. Te responderemos dentro del plazo legal.', autor: 'p-crojas', canal: 'Teléfono' },
      { fecha: F(1, 11, 50), senales: ['CARTA_NOTARIAL'], autor: 'p-crojas' },
      { fecha: F(1, 11, 55), notaEmocional: 'Habla en voz alta y repite que enviará una carta notarial. Pide hablar con un responsable y que lo llamen por la tarde.', autor: 'p-crojas' },
      { fecha: F(1, 12), nota: 'Señal de conflicto: anuncia carta notarial. Se deriva a Eje 3.', autor: 'p-crojas' },
      {
        fecha: F(1, 11, 30),
        asiento: { tipo: 'RECLAMO', establecimiento: 'Oficina Carabayllo', hechos: 'Pagó los gastos notariales y, pasado el plazo ofrecido, la minuta sigue sin firmarse.', pedido: 'Firma de la minuta o devolución de los gastos notariales.', monto: 980, moneda: 'PEN' },
        autor: 'p-crojas',
      },
      { fecha: F(1, 12, 5), handoff: { id: 'ALT · cliente con DNI validado · ticket de la minuta', kyc: 'Validado en SIGDA/TAXON el 01-oct', lote: 'Los Álamos de Carabayllo · Mz. F Lt. 3', pagos: 'Al día; gastos notariales pagados el 05-ago', atencion: 'Respuesta inicial y asiento en el Libro (ALT-CAR-0044)', paso: 'Revisión legal del retraso de la minuta y respuesta a la carta notarial' }, autor: 'p-crojas' },
      { fecha: F(1, 15), confirmarHandoff: true, autor: 'p-pvilchez' },
    ],
  },
  // Postventa: Eje 2 sin escalar con más de 72 h hábiles (HU-ATC-029 CA-01).
  {
    abierto: F(1, 10),
    por: 'p-crojas',
    entrada: ticket('APV', 'GAR', 'MEDIUM', 'WhatsApp', 'cli-015', 'Filtración en el baño principal tras las lluvias', 'Reporta humedad y filtración en el baño principal.', 'Vivienda'),
    pasos: [
      { fecha: F(1, 10, 30), respuesta: 'Registramos tu reporte. Postventa coordinará la visita.', autor: 'p-crojas', canal: 'WhatsApp' },
      { fecha: F(1, 10, 40), derivar: 'POSTVENTA', a: 'p-lccahuana', motivo: 'DERIVACION_COMPETENCIA', autor: 'p-crojas' },
      { fecha: F(14, 16), cliente: 'Les escribe mi abogado: si no reparan la filtración esta semana, iniciaremos acciones legales.', canal: 'WhatsApp' },
      { fecha: F(14, 16, 10), senales: ['ABOGADO'], autor: 'p-lccahuana' },
    ],
  },
  // Postventa sin asignar, por vencer el cierre end-to-end.
  {
    abierto: F(5, 9),
    por: 'p-crojas',
    entrada: ticket('ALT', 'VIS', 'HIGH', 'WhatsApp', 'cli-016', 'Solicita visita técnica por hito de lindero movido', 'El hito del lindero aparece desplazado tras una obra vecina.'),
    pasos: [{ fecha: F(5, 9, 20), derivar: 'POSTVENTA', motivo: 'DERIVACION_COMPETENCIA', nota: 'Coordinar visita técnica.', autor: 'p-crojas' }],
  },
  {
    abierto: F(13, 14),
    por: 'p-crojas',
    entrada: ticket('ADS', 'CTA', 'LOW', 'Correo', 'cli-017', 'No puede ingresar a Mi Portal', 'El enlace de recuperación de contraseña no le llega.'),
    pasos: [
      { fecha: F(13, 14, 20), respuesta: 'Pasamos tu caso a soporte técnico.', autor: 'p-crojas', canal: 'Correo' },
      { fecha: F(13, 14, 30), derivar: 'TI', a: 'p-khuerta', motivo: 'DERIVACION_COMPETENCIA', autor: 'p-crojas' },
    ],
  },
  {
    abierto: F(12, 16),
    por: 'p-crojas',
    entrada: ticket('AIN', 'PED', 'MEDIUM', 'Correo', 'cli-018', 'Solicita factura por gastos de trámite', 'Pide la factura de los gastos de trámite pagados.'),
    pasos: [
      { fecha: F(12, 16, 30), respuesta: 'Administración emitirá tu factura.', autor: 'p-crojas', canal: 'Correo' },
      { fecha: F(12, 16, 40), derivar: 'ADMINISTRACION', a: 'p-sramos', motivo: 'DERIVACION_COMPETENCIA', autor: 'p-crojas' },
    ],
  },
  // ── Libro de Reclamaciones (ola 2) ──
  // Vencido sin respuesta ni prórroga: alerta LEGAL_RESPONSE_OVERDUE.
  {
    abierto: S(22, 10),
    por: 'p-crojas',
    entrada: ticket('ALT', 'REC', 'MEDIUM', 'Teléfono', 'cli-020', 'Reclama la penalidad cobrada por resolver su contrato', 'Considera que la penalidad no estaba pactada.'),
    pasos: [
      {
        fecha: S(22, 10, 20),
        asiento: { tipo: 'RECLAMO', establecimiento: 'Oficina Carabayllo', hechos: 'Al resolver el contrato se le cobró una penalidad que, según el consumidor, no figura en las condiciones firmadas.', pedido: 'Devolución de la penalidad cobrada.', monto: 420, moneda: 'PEN' },
        autor: 'p-crojas',
      },
      { fecha: S(22, 10, 30), respuesta: 'Registramos tu reclamo en el Libro de Reclamaciones. Te responderemos dentro del plazo legal.', autor: 'p-crojas', canal: 'Teléfono' },
      { fecha: S(22, 10, 40), derivar: 'LEGAL', a: 'p-pvilchez', motivo: 'DERIVACION_COMPETENCIA', autor: 'p-crojas' },
    ],
  },
  // A 2 días hábiles del vencimiento original, sin prórroga: LEGAL_EXTENSION_WINDOW_CLOSING.
  {
    abierto: S(25, 11),
    por: 'p-crojas',
    entrada: ticket('AIN', 'REC', 'HIGH', 'WhatsApp', 'cli-021', 'Reclama la devolución del monto de separación', 'Desistió de la compra dentro del plazo y no recibe la devolución.'),
    pasos: [
      {
        fecha: S(25, 11, 15),
        asiento: { tipo: 'RECLAMO', establecimiento: LIBRO_VIRTUAL, hechos: 'Desistió de la separación del lote dentro del plazo ofrecido y la devolución no se ha hecho efectiva.', pedido: 'Devolución del monto de separación.', monto: 2500, moneda: 'PEN' },
        autor: 'p-crojas',
      },
      { fecha: S(25, 11, 20), respuesta: 'Registramos tu reclamo. Te responderemos dentro del plazo legal.', autor: 'p-crojas', canal: 'WhatsApp' },
      { fecha: S(25, 11, 30), derivar: 'LEGAL', a: 'p-pvilchez', motivo: 'DERIVACION_COMPETENCIA', autor: 'p-crojas' },
    ],
  },
  // Prorrogado, respondido con cargo y apelado ante INDECOPI.
  {
    abierto: S(14, 9, 30),
    por: 'p-crojas',
    entrada: ticket('ALT', 'REC', 'MEDIUM', 'Correo', 'cli-022', 'Reclama el cobro de gastos notariales no pactados', 'Pide la devolución de los gastos notariales.'),
    pasos: [
      {
        fecha: S(14, 9, 45),
        asiento: { tipo: 'RECLAMO', establecimiento: 'Oficina Carabayllo', hechos: 'Se le cobraron gastos notariales que no figuraban en la proforma entregada.', pedido: 'Devolución de los gastos notariales.', monto: 1850, moneda: 'PEN' },
        autor: 'p-crojas',
      },
      { fecha: S(14, 10), respuesta: 'Registramos tu reclamo. Te responderemos dentro del plazo legal.', autor: 'p-crojas', canal: 'Correo' },
      { fecha: S(14, 10, 10), derivar: 'LEGAL', a: 'p-pvilchez', motivo: 'DERIVACION_COMPETENCIA', autor: 'p-crojas' },
      {
        fecha: F(1, 16),
        prorroga: { justificacion: 'Se requiere el informe de la notaría sobre los conceptos cobrados para responder el reclamo.', canal: 'Correo con acuse de recibo', fechaComunicacion: F(1, 15, 30), cargo: doc('cargo-prorroga-ALT-CAR-0042.pdf', 182340) },
        autor: 'p-pvilchez',
      },
      {
        fecha: F(13, 11),
        respuestaLibro: { resumen: 'Se reconoce el cobro indebido de dos conceptos notariales y se devuelven S/ 640.00. El resto corresponde a gastos pactados.', firmante: 'p-pvilchez', carta: doc('carta-respuesta-ALT-CAR-0042.pdf', 254120), cargo: doc('cargo-respuesta-ALT-CAR-0042.pdf', 98210), derechoIndecopi: true },
        autor: 'p-pvilchez',
      },
      { fecha: F(13, 11, 10), estado: 'RESOLVED', autor: 'p-pvilchez' },
      { fecha: F(14, 10), apelacion: { instancia: 'INDECOPI', numeroCaso: '0457-2026/ILN-PS0', presentada: F(14, 9) }, autor: 'p-pvilchez' },
      { fecha: F(15, 9, 30), estadoApelacion: 'UNDER_REVIEW', entrada: { numeroCaso: '', fechaResolucion: null, resumen: '', nota: 'INDECOPI admitió a trámite.' }, autor: 'p-pvilchez' },
    ],
  },
  // Respondido; apelación interna desistida: no se puede volver a apelar.
  {
    abierto: S(16, 15),
    por: 'p-crojas',
    entrada: ticket('AIN', 'QUE', 'LOW', 'Correo', 'cli-023', 'Queja por la demora en la atención en oficina', 'Esperó más de una hora para ser atendido.', 'Vivienda'),
    pasos: [
      {
        fecha: S(16, 15, 10),
        asiento: { tipo: 'QUEJA', establecimiento: 'Oficina Central Lima', hechos: 'El consumidor esperó más de una hora en la oficina sin recibir atención.', pedido: 'Mejora del tiempo de atención.', monto: null, moneda: '' },
        autor: 'p-crojas',
      },
      { fecha: S(16, 15, 20), respuesta: 'Registramos tu queja. Te responderemos dentro del plazo legal.', autor: 'p-crojas', canal: 'Correo' },
      { fecha: S(16, 15, 30), derivar: 'LEGAL', a: 'p-pvilchez', motivo: 'DERIVACION_COMPETENCIA', autor: 'p-crojas' },
      {
        fecha: F(2, 12),
        respuestaLibro: { resumen: 'Se ofrecen disculpas y se informa el nuevo sistema de citas de la oficina.', firmante: 'p-pvilchez', carta: doc('carta-respuesta-AIN-LIM-0016.pdf', 143980), cargo: doc('cargo-respuesta-AIN-LIM-0016.pdf', 87430), derechoIndecopi: true },
        autor: 'p-pvilchez',
      },
      { fecha: F(2, 12, 10), estado: 'RESOLVED', autor: 'p-pvilchez' },
      { fecha: F(5, 10), apelacion: { instancia: 'INTERNA', numeroCaso: '', presentada: F(5, 9, 30) }, autor: 'p-pvilchez' },
      { fecha: F(7, 11), estadoApelacion: 'WITHDRAWN', entrada: { numeroCaso: '', fechaResolucion: null, resumen: '', nota: 'El consumidor desistió por escrito.' }, autor: 'p-pvilchez' },
      { fecha: F(7, 11, 30), estado: 'CLOSED', autor: 'p-pvilchez', notaEstado: 'El cliente confirmó la solución en Mi Portal.' },
    ],
  },
  // Reclamo sin asiento abierto ayer: el control diario lo marca como huérfano.
  {
    abierto: F(14, 15),
    por: 'p-dlazo',
    entrada: ticket('ALT', 'REC', 'MEDIUM', 'Teléfono', 'cli-024', 'Reclama que no le entregan la constancia de pago', 'Pidió la constancia hace dos semanas.'),
    pasos: [{ fecha: F(14, 15, 15), respuesta: 'Registramos tu reclamo y lo estamos revisando.', autor: 'p-dlazo', canal: 'Teléfono' }],
  },
]

// ── Mesa de Casos SGD (ola 3) ──

type PasoCaso =
  | { readonly fecha: Date; readonly cargoPrevio: true }
  | { readonly fecha: Date; readonly activar: true }
  | { readonly fecha: Date; readonly riesgo: readonly string[]; readonly motivo: string }
  | { readonly fecha: Date; readonly evidencia: string; readonly documento?: Documento; readonly gli?: string }
  | { readonly fecha: Date; readonly cerrar: EstadoCierreSgd; readonly documento: Documento; readonly gli: string; readonly nota: string }

interface CasoSgd {
  readonly clave: string
  readonly fecha: Date
  readonly entrada: Omit<EntradaCaso, 'ticketId' | 'vincularA'>
  readonly conTicket?: boolean
  readonly vincularA?: string
  readonly pasos?: readonly PasoCaso[]
}

const CASOS_SGD: CasoSgd[] = [
  // Cerrado conforme, con original en el GLI (HU-ATC-025).
  {
    clave: 'C8',
    fecha: F(1, 10),
    entrada: { linea: 'LIBRO', clienteId: 'cli-028', resumen: 'Reclamo por diferencia entre el metraje del contrato y el del plano.' },
    pasos: [
      { fecha: F(1, 10, 10), cargoPrevio: true },
      { fecha: F(1, 10, 30), activar: true },
      { fecha: F(1, 11), riesgo: ['REINCIDENCIA'], motivo: '' },
      { fecha: F(7, 15), cerrar: 'CONFORME', documento: doc('acta-conformidad-metraje.pdf', 211340), gli: 'GLI-2026-004377', nota: 'Se corrigió el plano y el cliente firmó conformidad.' },
    ],
  },
  // Carta notarial: alerta preventiva a un día del vencimiento; riesgo medio para recalibrar (HU-ATC-022 CA-02).
  {
    clave: 'C2',
    fecha: F(1, 15, 30),
    conTicket: true,
    entrada: { linea: 'CARTA_NOTARIAL', clienteId: 'cli-014', resumen: 'Carta notarial por la demora en la firma de la minuta.' },
    pasos: [
      { fecha: F(1, 15, 40), cargoPrevio: true },
      { fecha: F(1, 16), activar: true },
      { fecha: F(2, 10), riesgo: ['ABOGADO'], motivo: '' },
      { fecha: F(2, 11), evidencia: 'Carta notarial recibida (original en custodia)', gli: 'GLI-2026-004512' },
    ],
  },
  // Legal Atiende vencido: ya está en Comité (HU-ATC-023).
  {
    clave: 'C3',
    fecha: F(2, 9, 30),
    entrada: { linea: 'LEGAL_ATIENDE', clienteId: 'cli-025', resumen: 'Consulta preventiva por la demora en la habilitación urbana del proyecto.' },
    pasos: [
      { fecha: F(2, 9, 40), cargoPrevio: true },
      { fecha: F(2, 10), activar: true },
      { fecha: F(5, 10), riesgo: ['MEDIOS'], motivo: '' },
    ],
  },
  // Backlog con cargo previo sin activar: en limbo (HU-ATC-021 CA-03).
  {
    clave: 'C5',
    fecha: F(9, 10),
    entrada: { linea: 'BACKLOG', clienteId: 'cli-027', resumen: 'Caso de 2025 sin cierre formal: reclamo por linderos.' },
    pasos: [{ fecha: F(9, 10, 15), cargoPrevio: true }],
  },
  // Legal Atiende activo: para reclasificar a reclamo formal (HU-ATC-020 CA-02).
  {
    clave: 'C4',
    fecha: F(13, 10),
    entrada: { linea: 'LEGAL_ATIENDE', clienteId: 'cli-026', resumen: 'Consulta preventiva por cobro de mantenimiento antes de la entrega del lote.' },
    pasos: [
      { fecha: F(13, 10, 10), cargoPrevio: true },
      { fecha: F(13, 11), activar: true },
    ],
  },
  // INDECOPI: riesgo alto; principal de un caso vinculado (HU-ATC-024).
  {
    clave: 'C1',
    fecha: F(14, 10, 30),
    conTicket: true,
    entrada: { linea: 'INDECOPI', clienteId: 'cli-022', resumen: 'Procedimiento en INDECOPI por gastos notariales (expediente 0457-2026/ILN-PS0).' },
    pasos: [
      { fecha: F(14, 11), cargoPrevio: true },
      { fecha: F(14, 12), activar: true },
      { fecha: F(14, 12, 30), riesgo: ['AUTORIDAD', 'ABOGADO'], motivo: '' },
      { fecha: F(14, 12, 40), evidencia: 'Resolución de admisión de INDECOPI', documento: doc('resolucion-admision-0457-2026.pdf', 164020), gli: 'GLI-2026-004598' },
    ],
  },
  // Mismo cliente y mismos hechos: se gestiona en el hilo de C1, no como independiente.
  {
    clave: 'C7',
    fecha: F(14, 16),
    vincularA: 'C1',
    entrada: { linea: 'CARTA_NOTARIAL', clienteId: 'cli-022', resumen: 'Carta notarial del abogado del cliente por los mismos gastos notariales.' },
  },
  // Libro: recién registrado con cargo previo (aún no está en limbo).
  {
    clave: 'C6',
    fecha: F(15, 9, 30),
    conTicket: true,
    entrada: { linea: 'LIBRO', clienteId: 'cli-020', resumen: 'Reclamo del Libro ALT-CAR-0043 vencido sin respuesta.' },
    pasos: [{ fecha: F(15, 9, 40), cargoPrevio: true }],
  },
]

function aplicarPasoCaso(d: Datos, casoId: string, paso: PasoCaso): Datos {
  const quien = 'p-vortiz'
  if ('cargoPrevio' in paso) return emitirCargoPrevio(d, casoId, quien)
  if ('activar' in paso) return activar(d, casoId, quien)
  if ('riesgo' in paso) return clasificarRiesgo(d, casoId, paso.riesgo, paso.motivo, quien)
  if ('evidencia' in paso) return agregarEvidencia(d, casoId, { descripcion: paso.evidencia, documento: paso.documento ?? null, gli: paso.gli ?? '' }, quien)
  return cerrarCaso(d, casoId, { estado: paso.cerrar, evidencia: paso.documento, critico: true, gli: paso.gli, nota: paso.nota }, quien)
}

// ── Garantías postventa (ola 4) ──

const QUIEN = 'p-lccahuana'
interface GarantiaSemilla {
  readonly clave: string
  readonly fecha: Date
  readonly entrada: Omit<EntradaGarantia, 'ticketId'>
  readonly ticket?: string
  readonly pasos?: readonly { readonly fecha: Date; readonly aplicar: (d: Datos, id: string) => Datos }[]
}

const GARANTIAS: GarantiaSemilla[] = [
  // Aprobada tras inspección; luego una adenda de reincorporación (HU-ATC-036 CA-02).
  {
    clave: 'G1',
    fecha: F(2, 10),
    entrada: { entregaId: 'ACT-0301', tipo: 'ESTRUCTURAL', descripcion: 'Fisuras en el muro de la sala que avanzan desde la entrega.', reclamada: F(2, 9) },
    pasos: [
      { fecha: F(2, 11), aplicar: (d, id) => programarInspeccion(d, id, F(6, 10), QUIEN) },
      { fecha: F(6, 16), aplicar: (d, id) => registrarInspeccion(d, id, { informe: 'Fisuras de 0.4 mm en el muro portante; se recomienda reparación estructural.', evidencias: [doc('inspeccion-fisuras-A305.pdf', 380210), doc('foto-fisura-1.jpg', 220100)] }, QUIEN) },
      { fecha: F(7, 10), aplicar: (d, id) => resolverGarantia(d, id, 'APPROVED', 'Se aprueba la reparación estructural a cargo de la empresa.', QUIEN) },
      { fecha: F(12, 15), aplicar: (d, id) => registrarAdenda(d, id, { motivo: 'El cliente recibió la devolución parcial y se reincorpora al contrato con nuevo cronograma de reparación.', documento: doc('adenda-A305.pdf', 150320) }, QUIEN) },
    ],
  },
  // Fuera de cobertura por vigencia (HU-ATC-034 CA-02).
  {
    clave: 'G2',
    fecha: F(8, 11),
    entrada: { entregaId: 'ACT-0388', tipo: 'ACABADOS', descripcion: 'Desprendimiento de pintura y zócalos en dormitorios.', reclamada: F(8, 10) },
  },
  // En revisión con inspección programada; ligado al ticket con señal de abogado (HU-ATC-036 CA-01).
  {
    clave: 'G3',
    fecha: F(1, 12),
    ticket: 'APV-000089',
    entrada: { entregaId: 'ACT-0412', tipo: 'IMPERMEABILIZACION', descripcion: 'Filtración en el baño principal tras las lluvias.', reclamada: F(1, 10) },
    pasos: [{ fecha: F(2, 10), aplicar: (d, id) => programarInspeccion(d, id, F(16, 10), QUIEN) }],
  },
  // En revisión con inspección registrada: lista para resolver.
  {
    clave: 'G4',
    fecha: F(12, 10),
    entrada: { entregaId: 'ACT-0455', tipo: 'INSTALACIONES', descripcion: 'La terma eléctrica no calienta y el tablero salta.', reclamada: F(12, 9) },
    pasos: [
      { fecha: F(12, 11), aplicar: (d, id) => programarInspeccion(d, id, F(14, 10), QUIEN) },
      { fecha: F(14, 17), aplicar: (d, id) => registrarInspeccion(d, id, { informe: 'Resistencia de la terma quemada; el tablero tiene un térmico subdimensionado.', evidencias: [doc('foto-tablero.jpg', 190400)] }, QUIEN) },
    ],
  },
  // Recién registrado, sin inspección.
  {
    clave: 'G5',
    fecha: F(15, 9, 40),
    entrada: { entregaId: 'ACT-0437', tipo: 'ESTRUCTURAL', descripcion: 'Grietas en la losa del patio posterior.', reclamada: F(15, 9) },
  },
]

const F0 = new Date(2026, 9, 1, 9)
const flujo = (id: string, tipo: string, area: Area, pasos: Flujo['pasos']): Flujo => ({ id, tipo, area, version: 1, pasos, publicado: F0, autor: 'p-aperez' })
const FLUJOS_INICIALES: Flujo[] = [
  flujo('flu-0-1', 'CTA', 'COBRANZA', [{ nombre: 'Recepción', responsable: 'p-crojas', slaH: 2 }, { nombre: 'Revisión de cobranza', responsable: 'p-rsalazar', slaH: 24 }, { nombre: 'Respuesta al cliente', responsable: 'p-crojas', slaH: 4 }]),
  flujo('flu-0-2', 'QUE', 'ATC', [{ nombre: 'Registro', responsable: 'p-dlazo', slaH: 2 }, { nombre: 'Respuesta', responsable: 'p-dlazo', slaH: 24 }]),
  flujo('flu-0-4', 'RES', 'COBRANZA', [{ nombre: 'Verificación de la deuda', responsable: 'p-rsalazar', slaH: 24 }, { nombre: 'Revisión legal de la causal', responsable: 'p-pvilchez', slaH: 48 }, { nombre: 'Carta de resolución', responsable: 'p-pvilchez', slaH: 72 }]),
  flujo('flu-0-3', 'GAR', 'POSTVENTA', [{ nombre: 'Recepción', responsable: 'p-lccahuana', slaH: 4 }, { nombre: 'Inspección técnica', responsable: 'p-omedina', slaH: 72 }]),
]
const guia = (id: string, tipo: string, pasos: string[], plantillas: string[], criterios: string[]): Guia => ({ id, tipo, version: 1, pasos, plantillas, criterios, publicada: F0, autor: 'p-aperez' })
const GUIAS_INICIALES: Guia[] = [
  guia('gui-0-1', 'CTA', ['Confirmar la identidad del cliente en SIGDA/TAXON', 'Revisar su estado de cuenta', 'Responder con el detalle y el siguiente paso'], ['Hola, revisamos tu consulta «{resumen}». Te compartimos el detalle y el siguiente paso.'], ['Registrar la respuesta al cliente', 'El cliente confirma la solución en Mi Portal']),
  guia('gui-0-2', 'QUE', ['Escuchar y registrar lo ocurrido', 'Derivar al área si corresponde', 'Responder con las disculpas y las acciones'], ['Lamentamos lo ocurrido con «{resumen}». Estamos tomando estas acciones: …'], ['Registrar la respuesta al cliente', 'Registrar el asiento en el Libro de Reclamaciones', 'El cliente confirma la solución en Mi Portal']),
]

/** Ola 7: un interesado por vincular, dos llamadas ya registradas y las alertas por riesgo de denuncia. */
function sembrarOla7(d0: Datos): Datos {
  const [d1] = crearTicketInteresado(
    conAhora(d0, F(14, 16)),
    { canal: 'Teléfono', empresaId: 'AIN', linea: 'Lotes urbanos', establecimiento: '', tipo: 'CTA', prioridad: 'MEDIUM', resumen: 'Pide información de lotes disponibles', descripcion: 'Persona interesada en comprar; aún no figura en SIGDA/TAXON.' },
    { nombre: 'Teodoro Valverde', telefono: '+51 900 555 014', dni: '' },
    'p-crojas',
    F(14, 16),
  )
  const con = d1.tickets.filter((t) => t.clienteId !== INTERESADO_ID)
  let d = d1
  if (con[0]) d = finalizarLlamada(conAhora(d, F(13, 10)), { clienteId: con[0].clienteId, ticketId: con[0].id, duracionS: 194 }, 'p-crojas')[0]
  if (con[1]) d = finalizarLlamada(conAhora(d, F(14, 9)), { clienteId: con[1].clienteId, ticketId: null, duracionS: 62 }, 'p-dlazo')[0]
  return evaluarRiesgos(conAhora(d, INICIO))[0]
}

/** Ola 6: un rayo puesto por el supervisor en un ticket de Cobranza. */
function sembrarOla6(d0: Datos): Datos {
  const t = d0.tickets.find((x) => x.numero === 'ALT-001214')
  return t ? marcarRayo(conAhora(d0, F(15, 9)), t.id, 'Cliente con aviso de INDECOPI', true, 'p-gnunez') : d0
}

/** Ola 5: llamadas de UrbeMind, encuestas respondidas, auditoría de datos y el evento EntregaFest. */
function sembrarOla5(d0: Datos): Datos {
  let d = conAhora(d0, F(13, 9))
  let r
  ;[d, r] = llamarApiUrbe(d, { credencial: 'valida', accion: 'crear', resumen: 'Luminaria caída en el Parque 4, riesgo para peatones', numero: '' })
  const t = d.tickets.find((x) => x.numero === r.ticketNumero)
  if (t) {
    d = vincularContrato(d, t.id, 'CSF-2026-0113', 'p-dlazo')
    d = cambiarEstado(conAhora(d, F(13, 10)), t.id, 'IN_PROGRESS', 'p-dlazo')
  }
  ;[d] = llamarApiUrbe(conAhora(d, F(14, 8)), { credencial: 'vencida', accion: 'crear', resumen: 'Intento con credencial vencida', numero: '' })
  // Encuestas: algunas respondidas (CSAT y CES) para medir por tipo, área y gestor.
  d = conAhora(d, F(14, 12))
  d.encuestas.slice(0, 3).forEach((e, i) => {
    d = responderEncuesta(d, e.id, [5, 4, 2][i], [6, 5, 3][i])
  })
  d = ejecutarAuditoriaDatos(conAhora(d, F(1, 9)), 'p-lbenavides')
  // EntregaFest: dos casos del evento de ayer (uno con palabra gatillo ya derivado).
  d = conAhora(d, F(14, 17))
  let c
  ;[d, c] = registrarCasoFest(d, { resumen: 'Propietario divaga sobre varios temas del contrato y pide hablar con la gerencia.', riesgo: 'MEDIO' }, 'p-fmoreno')
  for (const n of [1, 2, 3, 4]) d = aplicarFrase(d, c.id, n, n === 4 ? 'Se le pidió que concrete su pedido en una frase.' : '', 'p-fmoreno')
  ;[d, c] = registrarCasoFest(d, { resumen: 'Propietario afirma que hubo una estafa en la firma de su minuta.', riesgo: 'MUY_ALTO' }, 'p-fmoreno')
  d = derivarEstacion4(d, c.id, 'p-fmoreno')
  return conAhora(d, INICIO)
}

interface Accion {
  readonly fecha: Date
  readonly orden: number
  readonly aplicar: (d: Datos) => Datos
}

/** Las corridas del job: 9:00 y 14:00 de cada día hábil hasta el inicio. */
function corridasDelJob(): Date[] {
  const fechas: Date[] = []
  for (let dia = 1; dia <= 15; dia++) {
    for (const hora of [9, 14]) {
      const f = F(dia, hora)
      if (f < INICIO && f.getDay() !== 0 && f.getDay() !== 6 && dia !== 8) fechas.push(f)
    }
  }
  return fechas
}

export function sembrar(): Datos {
  const ids = new Map<number, string>()
  const acciones: Accion[] = []
  let orden = 0
  CASOS.forEach((caso, i) => {
    acciones.push({
      fecha: caso.abierto,
      orden: orden++,
      aplicar: (d) => {
        const [d2, t] = crearTicket(d, { establecimiento: '', ...caso.entrada }, caso.por, caso.abierto)
        ids.set(i, t.id)
        return d2
      },
    })
    for (const paso of caso.pasos ?? []) {
      acciones.push({ fecha: paso.fecha, orden: orden++, aplicar: (d) => aplicarPaso(d, ids.get(i) ?? '', paso) })
    }
  })
  const casosIds = new Map<string, string>()
  for (const c of CASOS_SGD) {
    acciones.push({
      fecha: c.fecha,
      orden: orden++,
      aplicar: (d) => {
        const ticketId = c.conTicket ? (d.tickets.find((t) => t.clienteId === c.entrada.clienteId)?.id ?? '') : ''
        const [d2, caso] = registrarCaso(d, { ...c.entrada, ticketId, vincularA: c.vincularA ? casosIds.get(c.vincularA) : undefined }, 'p-vortiz')
        casosIds.set(c.clave, caso.id)
        return d2
      },
    })
    for (const paso of c.pasos ?? []) acciones.push({ fecha: paso.fecha, orden: orden++, aplicar: (d) => aplicarPasoCaso(d, casosIds.get(c.clave) ?? '', paso) })
  }
  const garIds = new Map<string, string>()
  for (const g of GARANTIAS) {
    acciones.push({
      fecha: g.fecha,
      orden: orden++,
      aplicar: (d) => {
        const ticketId = g.ticket ? (d.tickets.find((t) => t.numero === g.ticket)?.id ?? '') : ''
        const [d2, r] = registrarGarantia(d, { ...g.entrada, ticketId }, 'p-lccahuana')
        garIds.set(g.clave, r.id)
        return d2
      },
    })
    for (const paso of g.pasos ?? []) acciones.push({ fecha: paso.fecha, orden: orden++, aplicar: (d) => paso.aplicar(d, garIds.get(g.clave) ?? '') })
  }
  for (const fecha of corridasDelJob()) acciones.push({ fecha, orden: orden++, aplicar: (d) => ejecutarJobs(d)[0] })
  acciones.sort((a, b) => a.fecha.getTime() - b.fecha.getTime() || a.orden - b.orden)

  let d = datosVacios(F(1, 8))
  for (const accion of acciones) d = accion.aplicar(conAhora(d, accion.fecha))
  d = sembrarOla5(d)
  d = sembrarOla6(d)
  d = sembrarOla7(d)
  // Lo sembrado no cuenta como telemetría ni auditoría de esta sesión.
  return { ...conAhora(d, INICIO), eventos: [], auditoria: [] }
}

function aplicarPaso(d: Datos, ticketId: string, paso: Paso): Datos {
  if ('senales' in paso) return marcarSenales(d, ticketId, paso.senales, paso.autor)
  if ('retirarSenal' in paso) return retirarSenal(d, ticketId, paso.retirarSenal, paso.justificacion, paso.autor)
  if ('notaEmocional' in paso) return registrarNotaEmocional(d, ticketId, paso.notaEmocional, paso.autor)
  if ('handoff' in paso) return enviarHandoff(d, ticketId, paso.handoff, paso.autor)
  if ('confirmarHandoff' in paso) return confirmarHandoff(d, ticketId, paso.autor)
  const asientoId = () => asientoDeTicket(d, ticketId)?.id ?? ''
  if ('asiento' in paso) return registrarAsiento(d, ticketId, paso.asiento, paso.autor)[0]
  if ('prorroga' in paso) return prorrogar(d, asientoId(), paso.prorroga, paso.autor)
  if ('respuestaLibro' in paso) return responder(d, asientoId(), paso.respuestaLibro, paso.autor)
  if ('apelacion' in paso) return registrarApelacion(d, asientoId(), paso.apelacion, paso.autor)
  if ('estadoApelacion' in paso) {
    const ap = d.apelaciones.filter((x) => x.asientoId === asientoId()).at(-1)
    return cambiarEstadoApelacion(d, ap?.id ?? '', paso.estadoApelacion, paso.entrada, paso.autor)
  }
  if ('respuesta' in paso) return registrarInteraccion(d, ticketId, { visible: true, canal: paso.canal ?? 'Teléfono', texto: paso.respuesta, adjuntos: [] }, paso.autor)
  if ('cliente' in paso) {
    const id = `in-cli-${d.contador + 1}`
    return {
      ...d,
      contador: d.contador + 1,
      interacciones: [...d.interacciones, { id, ticketId, fecha: d.ahora, tipo: 'cliente', visible: true, canal: paso.canal, autor: null, texto: paso.cliente, adjuntos: [] }],
    }
  }
  if ('derivar' in paso) return derivar(d, ticketId, { area: paso.derivar, responsable: paso.a ?? '', motivo: paso.motivo, nota: paso.nota ?? '' }, paso.autor)
  if ('nota' in paso) return registrarInteraccion(d, ticketId, { visible: false, canal: null, texto: paso.nota, adjuntos: [] }, paso.autor)
  return cambiarEstado(d, ticketId, paso.estado, paso.autor, paso.notaEstado ?? null)
}
