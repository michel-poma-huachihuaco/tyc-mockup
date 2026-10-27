/**
 * Catálogos, reglas de negocio (SLA en horas/días hábiles de Perú, precedencia RN-SVC-001,
 * congelamiento RN-SVC-002, permisos RN-SVC-036, DLP RN-SVC-012) y datos sintéticos de
 * demostración para las 60 Historias de Usuario (HU-ATC-001..060) de Aybar Atiende.
 */

export type VistaAtc =
  | 'c360'
  | 'vivo'
  | 'bandeja'
  | 'tudia'
  | 'nuevo'
  | 'detalle'
  | 'morosidad'
  | 'ingreso'
  | 'buses'
  | 'libro'
  | 'garantias'
  | 'sgd'
  | 'reasignar'
  | 'alertas'
  | 'cierre'
  | 'politicas'
  | 'workflow'
  | 'urbemind'
  | 'torre'
  | 'evento';

export interface EmpresaAybar {
  readonly id: string;
  readonly nombre: string;
  readonly ruc: string;
}

export interface TipoTicketInfo {
  readonly id: string;
  readonly nombre: string;
  readonly libro: boolean;
}

export interface PrioridadInfo {
  readonly id: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  readonly nombre: string;
}

export interface InteraccionTicket {
  readonly tipo: 'cli' | 'agt' | 'int' | 'sys';
  readonly fecha: Date;
  readonly canal?: string;
  readonly autor?: string;
  readonly texto: string;
}

export interface RegistroBitacora {
  readonly fecha: Date;
  readonly area: string;
  readonly responsable: string | null;
  readonly motivo: string;
  readonly nota: string;
}

export interface HitoEstado {
  readonly fecha: Date;
  readonly estado: string;
  readonly autor: string;
}

export interface TicketAtc {
  num: string;
  co: string;
  empresa: EmpresaAybar;
  line: string;
  ch: string;
  cli: string;
  dni: string;
  proj: string;
  type: string;
  /** Id del subtipo (SubtipoTicketCfg.id); opcional: tipos sin subtipos activos no lo llevan. */
  subtipo?: string;
  prio: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  state: 'OPEN' | 'IN_PROGRESS' | 'PENDING_CUSTOMER' | 'ESCALATED' | 'IN_COMMITTEE' | 'RESOLVED' | 'CLOSED' | 'REOPENED';
  area: string;
  owner: string | null;
  opened: Date;
  frDue: Date;
  resDue: Date;
  slaSrc: string;
  firstResp?: Date;
  resolvedAt?: Date;
  reopen: number;
  conflict: boolean;
  rayo: boolean;
  rayoMotivo?: string;
  emotion: string;
  eje: 1 | 2 | 3;
  contract?: string | null;
  summary: string;
  interactions: InteraccionTicket[];
  log: RegistroBitacora[];
  status: HitoEstado[];
}

export interface Fuente360 {
  readonly id: string;
  readonly nombre: string;
  readonly detalle: string;
  readonly ms: number;
}

export interface NodoDato360 {
  readonly id: string;
  readonly nombre: string;
  readonly fuentes: readonly string[];
  readonly restringidoPara?: readonly string[];
  readonly semantico?: boolean;
}

export interface Cliente360 {
  readonly k: string;
  readonly iniciales: string;
  readonly nombre: string;
  readonly doc: string;
  readonly dni: string;
  readonly telefono: string;
  readonly proyecto: string;
  readonly lotes: readonly string[];
  readonly contratoPrincipal: string;
  readonly estadoEmocional: string;
  readonly sintesisIa: string;
  readonly guiaRecomendada: string;
  readonly datos: Readonly<Record<string, readonly (readonly [string, string])[]>>;
}

export interface ClausulaContratoAtc {
  readonly numero: string;
  readonly titulo: string;
  readonly contenido: string;
  readonly alerta?: string;
}

export interface AdendaContratoAtc {
  readonly codigo: string;
  readonly fecha: string;
  readonly titulo: string;
  readonly estado: 'FIRMADA' | 'EN_TRAMITE';
  readonly resumen: string;
  readonly detalleClausula: string;
}

export interface FirmanteContratoAtc {
  readonly rol: 'REPRESENTANTE_EMPRESA' | 'COMPRADOR_TITULAR' | 'COPROPIETARIO';
  readonly nombre: string;
  readonly documento: string;
  readonly fechaFirma: string;
  readonly modalidad: string;
  readonly hashCustodia: string;
}

export interface CuotaCronogramaContratoAtc {
  readonly numero: number;
  readonly vencimiento: string;
  readonly monto: string;
  readonly estado: 'PAGADA' | 'VENCIDA' | 'POR_VENCER';
  readonly fechaPago?: string;
  readonly operacion?: string;
}

export interface ContratoInmobiliarioAtc {
  readonly codigo: string;
  readonly tipo: string;
  readonly estado: 'VIGENTE' | 'EN_EVALUACION_RESOLUCION' | 'ENTREGADO_CON_GARANTIA';
  readonly empresa: string;
  readonly rucEmpresa: string;
  readonly clienteNombre: string;
  readonly clienteDoc: string;
  readonly clienteKey360: string;
  readonly proyecto: string;
  readonly etapa: string;
  readonly manzanaLote: string;
  readonly areaMetros: string;
  readonly zonificacion: string;
  readonly linderos: string;
  readonly partidaMatrizSunarp: string;
  readonly notaria: string;
  readonly kardexNotarial: string;
  readonly fechaSuscripcion: string;
  readonly moneda: 'PEN' | 'USD';
  readonly precioTotal: string;
  readonly cuotaInicial: string;
  readonly capitalFinanciado: string;
  readonly totalLetras: number;
  readonly letrasPagadas: number;
  readonly letrasVencidas: number;
  readonly saldoPendiente: string;
  readonly moraAcumulada: string;
  readonly actaEntregaEstado: string;
  readonly clausulas: readonly ClausulaContratoAtc[];
  readonly adendas: readonly AdendaContratoAtc[];
  readonly firmantes: readonly FirmanteContratoAtc[];
  readonly cronograma: readonly CuotaCronogramaContratoAtc[];
}

export interface AsientoLibro {
  readonly n: string;
  readonly co: string;
  readonly est: string;
  readonly ticket: string;
  readonly kind: 'RECLAMO' | 'QUEJA';
  readonly cli: string;
  readonly reg: Date;
  readonly amount: string | null;
  ext: boolean;
  extJustificacion?: string;
  resp: Date | null;
  respResumen?: string;
  appeal: { to: 'INTERNA' | 'INDECOPI'; st: string; caseNo: string } | null;
  readonly facts: string;
}

export interface CasoSgd {
  readonly code: string;
  readonly line: string;
  readonly cli: string;
  readonly pre: Date;
  act: Date | null;
  readonly slaDays: number;
  linked: string | null;
  closeState: string | null;
}

export interface CasoMorosidad {
  readonly id: string;
  readonly contrato: string;
  readonly cliente: string;
  readonly proyecto: string;
  readonly lote: string;
  readonly cuotasImpagas: number;
  readonly montoMora: string;
  readonly responsableProyecto: string;
  readonly supervisor: string;
  alertaServicioEnviada: boolean;
  cartaProyectoEnviada: boolean;
  estado: 'DETECTADO' | 'EN_RESOLUCION' | 'NOTIFICADO_PROYECTO';
}

export interface ReclamoGarantia {
  readonly id: string;
  readonly ticket: string;
  readonly unit: string;
  readonly type: 'Impermeabilización' | 'Acabados' | 'Estructural';
  readonly handover: string;
  readonly cov: number;
  state: 'UNDER_REVIEW' | 'REJECTED' | 'APPROVED' | 'ESCALATED_EJE3';
  insp: string | null;
}

export interface AsistenteProyecto {
  readonly id: string;
  readonly nombre: string;
  readonly dni: string;
  readonly proyecto: string;
  readonly lote: string;
  readonly acompanantes: number;
  readonly hora: string;
  readonly placa?: string;
}

export interface BusEntregaFest {
  readonly id: string;
  readonly ruta: string;
  readonly paradero: string;
  readonly salida: string;
  readonly capacidad: number;
  ocupados: number;
  readonly placa: string;
}

export interface HuReferencia {
  readonly id: string;
  readonly titulo: string;
  readonly feature: string;
  readonly vista: VistaAtc;
  readonly pantalla: string;
  readonly etapa?: 'Etapa 1' | 'Etapa 2';
  readonly etapaNota?: string;
}

export interface ColaboradorDirectorioAtc {
  readonly userId: string;
  readonly codigoEmpleado: string;
  readonly gestor: string;
  readonly rol: string;
  readonly area: string;
  lider: string;
  disponible: boolean;
  cesadoEnDirectorio: boolean;
  actualizadoHace: string;
}

export const FERIADOS_PERU = [
  '2026-01-01',
  '2026-04-02',
  '2026-04-03',
  '2026-05-01',
  '2026-06-07',
  '2026-06-29',
  '2026-07-23',
  '2026-07-28',
  '2026-07-29',
  '2026-08-06',
  '2026-08-30',
  '2026-10-08',
  '2026-11-01',
  '2026-12-08',
  '2026-12-09',
  '2026-12-25',
  '2027-01-01',
] as const;

export const AHORA_BASE = new Date('2026-10-19T10:30:00-05:00');
export const haceHoras = (h: number): Date => new Date(AHORA_BASE.getTime() - h * 3600000);

export const fechaIso = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const esDiaHabil = (d: Date): boolean =>
  d.getDay() !== 0 && d.getDay() !== 6 && !FERIADOS_PERU.includes(fechaIso(d) as (typeof FERIADOS_PERU)[number]);

export function sumarHorasHabiles(inicio: Date, horas: number): Date {
  let d = new Date(inicio);
  let mins = horas * 60;
  const normalizar = (): void => {
    while (true) {
      if (!esDiaHabil(d)) {
        d.setDate(d.getDate() + 1);
        d.setHours(9, 0, 0, 0);
        continue;
      }
      if (d.getHours() < 9) d.setHours(9, 0, 0, 0);
      if (d.getHours() >= 18) {
        d.setDate(d.getDate() + 1);
        d.setHours(9, 0, 0, 0);
        continue;
      }
      break;
    }
  };
  normalizar();
  while (mins > 0) {
    const finJornada = new Date(d);
    finJornada.setHours(18, 0, 0, 0);
    const disp = (finJornada.getTime() - d.getTime()) / 60000;
    if (mins <= disp) {
      d = new Date(d.getTime() + mins * 60000);
      mins = 0;
    } else {
      mins -= disp;
      d.setDate(d.getDate() + 1);
      d.setHours(9, 0, 0, 0);
      normalizar();
    }
  }
  return d;
}

export function sumarDiasHabiles(inicio: Date, n: number): Date {
  const d = new Date(inicio);
  d.setHours(0, 0, 0, 0);
  let k = 0;
  while (k < n) {
    d.setDate(d.getDate() + 1);
    if (esDiaHabil(d)) k++;
  }
  return d;
}

export function diasHabilesEntre(a: Date, b: Date): number {
  const d = new Date(a);
  d.setHours(0, 0, 0, 0);
  const e = new Date(b);
  e.setHours(0, 0, 0, 0);
  let k = 0;
  const paso = d <= e ? 1 : -1;
  while (fechaIso(d) !== fechaIso(e)) {
    d.setDate(d.getDate() + paso);
    if (esDiaHabil(d)) k += paso;
  }
  return k;
}

export const fmtFechaHora = (d?: Date | null): string =>
  d ? d.toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

export const fmtFecha = (d: Date): string =>
  d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });

export function tiempoRestanteTexto(due: Date): string {
  const m = Math.round((due.getTime() - AHORA_BASE.getTime()) / 60000);
  const a = Math.abs(m);
  const t =
    a >= 1440
      ? `${Math.floor(a / 1440)} d ${Math.floor((a % 1440) / 60)} h`
      : a >= 60
        ? `${Math.floor(a / 60)} h ${a % 60} min`
        : `${a} min`;
  return m < 0 ? `vencido hace ${t}` : `quedan ${t}`;
}

export const EMPRESAS_AYBAR: readonly EmpresaAybar[] = [
  { id: 'AIN', nombre: 'Aybar Inmobiliaria S.A.C.', ruc: '20601234561' },
  { id: 'ALT', nombre: 'Aybar Lotes y Terrenos S.A.C.', ruc: '20601234572' },
  { id: 'AUR', nombre: 'Aybar Urbanizadora S.A.C.', ruc: '20601234583' },
  { id: 'ACS', nombre: 'Aybar Construcción y Servicios S.A.C.', ruc: '20601234594' },
  { id: 'ACI', nombre: 'Aybar Ciudad y Servicios Urbanos S.A.C.', ruc: '20601234605' },
  { id: 'APV', nombre: 'Aybar Postventa S.A.C.', ruc: '20601234616' },
  { id: 'AFN', nombre: 'Aybar Financiera Inmobiliaria S.A.C.', ruc: '20601234627' },
  { id: 'ACM', nombre: 'Aybar Comercial S.A.C.', ruc: '20601234638' },
  { id: 'ADS', nombre: 'Aybar Desarrollos del Sur S.A.C.', ruc: '20601234649' },
  { id: 'ADN', nombre: 'Aybar Desarrollos del Norte S.A.C.', ruc: '20601234650' },
  { id: 'AHL', nombre: 'Aybar Holding S.A.C.', ruc: '20601234661' },
];

export const LINEAS_NEGOCIO = ['Lotes urbanos', 'Vivienda', 'Comercial', 'Servicios de ciudad'] as const;
export const CANALES_ATC = ['Teléfono', 'WhatsApp', 'Correo', 'Mi Portal', 'Presencial / Caseta', 'EntregaFest'] as const;

export const TIPOS_TICKET: readonly TipoTicketInfo[] = [
  { id: 'PED', nombre: 'Pedido simple', libro: false },
  { id: 'CTA', nombre: 'Consulta de cuenta', libro: false },
  { id: 'VIS', nombre: 'Visita técnica', libro: false },
  { id: 'QUE', nombre: 'Queja (Libro)', libro: true },
  { id: 'REC', nombre: 'Reclamo (Libro)', libro: true },
  { id: 'CIT', nombre: 'Incidencia de infraestructura urbana (CITY_INCIDENT)', libro: false },
  { id: 'GAR', nombre: 'Garantía postventa', libro: false },
];

export const PRIORIDADES_TICKET: readonly PrioridadInfo[] = [
  { id: 'LOW', nombre: 'Baja' },
  { id: 'MEDIUM', nombre: 'Media' },
  { id: 'HIGH', nombre: 'Alta' },
  { id: 'URGENT', nombre: 'Urgente' },
];

export const AREAS_ATC = ['ATC', 'COBRANZA', 'LEGAL', 'POSTVENTA', 'TI', 'ADMINISTRACION'] as const;
export const ESTADOS_TICKET = ['OPEN', 'IN_PROGRESS', 'PENDING_CUSTOMER', 'ESCALATED', 'IN_COMMITTEE', 'RESOLVED', 'CLOSED'] as const;

export const ESTADO_ES: Readonly<Record<string, string>> = {
  OPEN: 'Abierto',
  IN_PROGRESS: 'En atención',
  PENDING_CUSTOMER: 'Espera cliente',
  ESCALATED: 'Escalado',
  IN_COMMITTEE: 'Elevado a comité',
  RESOLVED: 'Resuelto',
  CLOSED: 'Cerrado',
  REOPENED: 'Reabierto',
};

export const MOTIVOS_DERIVACION = [
  'DERIVACION_COMPETENCIA',
  'DERIVACION_CONFLICTO_EJE3',
  'REASSIGNMENT_CESE',
  'REASSIGNMENT_ROTACION',
  'REASSIGNMENT_CARGA',
] as const;

const MATRIZ_SLA: Record<string, Record<string, readonly [number, number]>> = {
  '*': { LOW: [4, 72], MEDIUM: [2, 48], HIGH: [1, 24], URGENT: [0.5, 8] },
  VIS: { LOW: [8, 120], MEDIUM: [4, 72], HIGH: [2, 48], URGENT: [1, 24] },
  GAR: { '*': [8, 120] },
  CIT: { '*': [1, 24], URGENT: [0.25, 4] },
};

export function calcularPoliticaSla(type: string, prio: string): { fr: number; res: number; src: string } {
  const porTipo = MATRIZ_SLA[type];
  const especifica = porTipo?.[prio] ?? porTipo?.['*'];
  const src = porTipo?.[prio]
    ? `específica ${type}+${prio}`
    : porTipo?.['*']
      ? `genérica de ${type}`
      : 'genérica global';
  const par = especifica ?? MATRIZ_SLA['*'][prio] ?? [2, 48];
  return { fr: par[0], res: par[1], src };
}

export function evaluarSlaTicket(t: TicketAtc): { tono: 'success' | 'warning' | 'danger'; txt: string; due?: Date } {
  if (t.state === 'RESOLVED' || t.state === 'CLOSED') return { tono: 'success', txt: 'Cumplido' };
  const due = t.firstResp ? t.resDue : t.frDue;
  const total = due.getTime() - t.opened.getTime();
  const rem = due.getTime() - AHORA_BASE.getTime();
  if (rem < 0) {
    return { tono: 'danger', txt: t.firstResp ? 'Resolución vencida' : '1.ª resp. vencida', due };
  }
  if (rem / total < 0.25) return { tono: 'warning', txt: 'En riesgo (<25%)', due };
  return { tono: 'success', txt: 'En plazo', due };
}

/* ── Consulta 360 ASTRA ──────────────────────────────────────────────────── */

export const FUENTES_360: readonly Fuente360[] = [
  { id: 'sigda', nombre: 'SIGDA / TAXON', detalle: 'Maestro único del cliente', ms: 180 },
  { id: 'contr', nombre: 'Contratos y Activos', detalle: 'Contrato, unidad, acta', ms: 240 },
  { id: 'cob', nombre: 'Cobranza', detalle: 'Cronograma y pagos', ms: 310 },
  { id: 'jose', nombre: 'Motor de Consultas', detalle: 'Saldos, abonos e independización', ms: 220 },
  { id: 'repo', nombre: 'Repositorio S3 / GLI', detalle: 'Documentos indexados IA', ms: 420 },
  { id: 'mail', nombre: 'Correo', detalle: 'Hilos con el cliente', ms: 260 },
  { id: 'cti', nombre: 'Call center CTI', detalle: 'Llamadas y grabaciones', ms: 200 },
  { id: 'atc', nombre: 'Tickets ATC', detalle: 'Historial y Libro', ms: 120 },
];

export const NODOS_360: readonly NodoDato360[] = [
  { id: 'kyc', nombre: 'DNI y KYC', fuentes: ['sigda'] },
  { id: 'cont', nombre: 'Contactos', fuentes: ['sigda'] },
  { id: 'lote', nombre: 'Lotes', fuentes: ['contr', 'sigda'] },
  { id: 'contrato', nombre: 'Contrato y adendas', fuentes: ['contr', 'repo'] },
  { id: 'acta', nombre: 'Acta de entrega', fuentes: ['contr'] },
  { id: 'gar', nombre: 'Garantía', fuentes: ['contr'] },
  { id: 'crono', nombre: 'Cronograma', fuentes: ['cob'] },
  { id: 'cuotas', nombre: 'Cuotas', fuentes: ['cob', 'jose'] },
  { id: 'saldo', nombre: 'Saldo por lote', fuentes: ['jose'] },
  { id: 'ecta', nombre: 'Estado de cuenta', fuentes: ['cob', 'jose'], restringidoPara: ['gestor'] },
  { id: 'docs', nombre: 'Documentos (IA)', fuentes: ['repo'], semantico: true },
  { id: 'correos', nombre: 'Correos', fuentes: ['mail'] },
  { id: 'llam', nombre: 'Llamadas CTI', fuentes: ['cti'] },
  { id: 'tick', nombre: 'Tickets previos', fuentes: ['atc'] },
  { id: 'libro', nombre: 'Reclamos del Libro', fuentes: ['atc'] },
  { id: 'expo', nombre: 'Exposición legal', fuentes: ['atc', 'cob'], restringidoPara: ['gestor'] },
];

export const CLIENTES_360: readonly Cliente360[] = [
  {
    k: 'eh',
    iniciales: 'EH',
    nombre: 'Eddie Huamaní',
    doc: 'DNI 72282555',
    dni: '72282555',
    telefono: '+51 987 654 321',
    proyecto: 'Villa Sol · Etapa II',
    lotes: ['C-07'],
    contratoPrincipal: 'VS-2025-0507',
    estadoEmocional: 'Tono cordial; consulta por logística de entrega y bus para EntregaFest.',
    sintesisIa:
      'Cliente al día (13/13 cuotas pagadas). Tiene adenda de cambio al Lote C-07 firmada y entrega programada para EntregaFest del 07-nov-2026. Ticket activo AIN-000486 por cupo en bus.',
    guiaRecomendada: 'Confirmación de cupo EntregaFest y envío de pase QR por WhatsApp.',
    datos: {
      kyc: [
        ['DNI 72282555', 'Verificado en RENIEC / SIGDA'],
        ['Estado KYC', 'Conforme · 15-ene-2026'],
        ['Estado Civil', 'Casado · Copropietaria: Elena Mendoza'],
      ],
      cont: [
        ['eddie.huamani@ejemplo.test', 'Correo verificado'],
        ['+51 987 654 321', 'Celular principal · Click-to-Call disponible'],
        ['Canal preferido', 'WhatsApp Corporativo y Mi Portal'],
      ],
      lote: [
        ['Lote C-07 · 160.00 m²', 'Villa Sol · Etapa II'],
        ['Mz. C · frente a parque central', 'Uso vivienda RDM · Independizado P01489213'],
      ],
      contrato: [
        ['Contrato VS-2025-0507', 'Vigente · Aybar Inmobiliaria S.A.C.'],
        ['Adenda N.º 01 cambio de lote', 'Firmada el 18-jun-2025 (custodia GLI)'],
        ['Notaría / Kardex', 'Notaría Gálvez · Kardex K-91820'],
      ],
      acta: [
        ['Acta de entrega C-07', 'Programada · EntregaFest 07-nov-2026'],
        ['Hitos de habilitación', 'Agua, desagüe y electrificación al 100%'],
      ],
      gar: [
        ['Cobertura postventa', 'Inicia con la firma del acta de entrega'],
        ['Plazo legal previsto', '120 meses estructural / 12 meses acabados'],
      ],
      crono: [
        ['Cuota 14 de 60', 'S/ 1,180.00'],
        ['Próximo vencimiento', '30-oct-2026'],
        ['Última cuota', '30-oct-2030 · Banco recaudador BCP'],
      ],
      cuotas: [
        ['Cuotas vencidas', '0 (Al día)'],
        ['Pagadas a tiempo', '13 de 13 letras conciliadas'],
      ],
      saldo: [
        ['Saldo capital C-07', 'S/ 54,280.00'],
        ['Interés moratorio', 'S/ 0.00'],
      ],
      ecta: [
        ['Capital pagado', 'S/ 15,340.00 + Inicial S/ 12,000.00'],
        ['Saldo pendiente', 'S/ 54,280.00 (47 letras por vencer)'],
      ],
      docs: [
        ['Contrato VS-2025-0507.pdf', 'Firmado digitalmente · Custodia GLI #99102'],
        ['Adenda cambio de lote.pdf', 'Fragmento IA: «…se reubica del lote B-11 al lote C-07 manteniendo precio…»'],
        ['Voucher cuota 13.jpg', 'Conciliado el 29-sep-2026 · Op. BCP #774120'],
      ],
      correos: [
        ['«Fecha de entrega de mi lote C-07»', '2 mensajes · 06-oct-2026'],
        ['«Confirmación de adenda firmada»', 'Enviado con constancia · 19-jun-2025'],
      ],
      llam: [['Llamada entrante (3 min 12 s)', '09-oct-2026 · Grabación CTI #9921']],
      tick: [
        ['AIN-000486 · Cupo bus EntregaFest', 'En atención · Administración'],
        ['AIN-000241 · Consulta de cuenta', 'Cerrado en SLA · CSAT 5/5'],
      ],
      libro: [['Sin asientos en Libro', '—']],
      expo: [['Exposición legal', 'S/ 0.00 · Sin riesgo de denuncia']],
    },
  },
  {
    k: 'jr',
    iniciales: 'JM',
    nombre: 'Jorge Mamani Ccori',
    doc: 'DNI 70134409',
    dni: '70134409',
    telefono: '+51 991 224 266',
    proyecto: 'Los Álamos de Carabayllo · Etapa I',
    lotes: ['F-03'],
    contratoPrincipal: 'LA-2023-0117',
    estadoEmocional: 'Frustración alta; mencionó carta notarial en llamada del 13-oct.',
    sintesisIa:
      'ALERTA CRÍTICA: Acumula 3 cuotas vencidas (S/ 2,940) con caso de resolución contractual suspendido por reclamo activo en Libro (ALT-2026-0042) y ticket ALT-001204 en Eje 3 Legal. Exposición económica estimada: S/ 3,180.',
    guiaRecomendada: 'Contención y derivación a Legal con expediente documental completo 6/6.',
    datos: {
      kyc: [
        ['DNI 70134409', 'Verificado en SIGDA'],
        ['Domicilio contractual', 'Av. Túpac Amaru 1840, Carabayllo, Lima'],
      ],
      cont: [
        ['jorge.mamani@ejemplo.test', 'Correo registrado para notificaciones'],
        ['+51 991 224 266', 'Celular principal · 2 llamadas esta semana'],
      ],
      lote: [
        ['Lote F-03 · 140.00 m²', 'Los Álamos de Carabayllo · Etapa I'],
        ['Partida matriz', 'P01322489 · En independización notarial'],
      ],
      contrato: [
        ['Contrato LA-2023-0117', 'En evaluación por morosidad (3 meses)'],
        ['Cláusula 9.ª Resolutoria', 'Suspendida temporalmente por reclamo activo ALT-001204'],
      ],
      acta: [['Sin acta de entrega', 'Lote pendiente de cancelación de saldo de independización']],
      gar: [['No aplica aún', 'Requiere firma previa del Acta de Entrega']],
      crono: [
        ['Cuota 22 de 48', 'S/ 980.00 mensual'],
        ['Vencida desde', '15-jul-2026 (Letras 20, 21 y 22 impagas)'],
      ],
      cuotas: [
        ['Cuotas vencidas', '3 cuotas (S/ 2,940.00)'],
        ['Caso de resolución', 'MOR-2026-0019 generado por 3 meses impagos'],
      ],
      saldo: [['Saldo capital F-03', 'S/ 25,480.00']],
      ecta: [
        ['Pagado acumulado', 'S/ 20,580.00 (19 letras + inicial)'],
        ['Mora exigible', 'S/ 2,940.00 + S/ 142.00 interés moratorio'],
      ],
      docs: [
        ['Contrato LA-2023-0117.pdf', 'Fragmento IA: «…cláusula 9: resolución de pleno derecho al 3.er mes impago…»'],
        ['Carta de alerta al proyecto.pdf', 'Emitida 14-oct-2026 con copia a supervisión'],
        ['Reclamo ALT-2026-0042.pdf', 'Hoja de reclamación por demora de minuta'],
      ],
      correos: [['«Alerta de cancelación de servicios»', 'Enviado con constancia el 14-oct-2026']],
      llam: [['Llamada de 7 min 40 s', '13-oct-2026 · Reclamo grabado CTI #9840']],
      tick: [
        ['ALT-001204 · Reclamo minuta', 'Escalado a Legal (Eje 3)'],
        ['ALT-001190 · Resolución contrato', 'Suspendido por reclamo abierto'],
      ],
      libro: [['Reclamo ALT-2026-0042', 'En plazo · vence 03-nov-2026 (15 días hábiles)']],
      expo: [['Riesgo alto de denuncia', 'S/ 3,180.00 (capital + 8% interés legal) · Caso SGD-2026-000318']],
    },
  },
  {
    k: 'lp',
    iniciales: 'LP',
    nombre: 'Lucía Paredes V.',
    doc: 'CE 00451277',
    dni: '00451277',
    telefono: '+51 944 812 731',
    proyecto: 'Mirador del Sur',
    lotes: ['C-21'],
    contratoPrincipal: 'MS-2025-0210',
    estadoEmocional: 'Cliente colaborativa; envió fotografías de fisura por Mi Portal y espera fecha de visita.',
    sintesisIa:
      'Cuenta con Acta de Entrega del 20-sep-2026 y garantía estructural vigente (120 meses). Inspección técnica programada para el 22-oct-2026 en ticket APV-000412 y garantía GAR-0092.',
    guiaRecomendada: 'Confirmar inspección técnica de postventa y enviar acta de visita al cierre.',
    datos: {
      kyc: [
        ['CE 00451277', 'Verificado en Migraciones / SIGDA'],
        ['Estado KYC', 'Conforme · Titular única'],
      ],
      cont: [
        ['lucia.paredes@ejemplo.test', 'Correo verificado'],
        ['+51 944 812 731', 'WhatsApp activo · Mi Portal habilitado'],
      ],
      lote: [
        ['Lote C-21 · 180.00 m²', 'Mirador del Sur · Etapa I'],
        ['Ubicación', 'Esquina Av. Los Precursores · Zonificación RDM'],
      ],
      contrato: [
        ['Contrato MS-2025-0210', 'Vigente · cuotas al día'],
        ['Escritura pública', 'Kardex K-44109 · Notaría Paino'],
      ],
      acta: [['Acta de entrega C-21', 'Firmada el 20-sep-2026 sin observaciones estructurales']],
      gar: [
        ['Cobertura estructural (120 m)', 'Vigente hasta sep-2036'],
        ['Reclamo GAR-0092', 'Inspección programada 22-oct-2026 (Ing. Pedro L.)'],
      ],
      crono: [
        ['Cuota 9 de 36', 'S/ 1,560.00'],
        ['Próximo vencimiento', '05-nov-2026 · Débito automático Interbank'],
      ],
      cuotas: [['Cuotas vencidas', '0 (Al día · 8/8 pagadas)']],
      saldo: [['Saldo C-21', 'S/ 42,120.00']],
      ecta: [
        ['Pagado acumulado', 'S/ 14,040.00 + Inicial S/ 18,000.00'],
        ['Saldo por vencer', 'S/ 42,120.00'],
      ],
      docs: [
        ['Contrato MS-2025-0210.pdf', 'Firmado y elevado a Escritura Pública · GLI'],
        ['Acta de Entrega C-21.pdf', 'Fragmento IA: «…entrega conforme de unidad C-21 con garantía de 10 años…»'],
        ['Fotos de fisura en muro.jpg', 'Subidas desde Mi Portal el 16-oct-2026'],
      ],
      correos: [['«Fisura en muro perimétrico»', '2 mensajes en hilo · Acuse enviado']],
      llam: [['Sin llamadas recientes', 'Prefiere canal Mi Portal / WhatsApp']],
      tick: [['APV-000412 · Garantía postventa', 'En atención · Postventa']],
      libro: [['Sin reclamos en Libro', '—']],
      expo: [['Sin riesgo legal', 'S/ 0.00 · En cobertura ordinaria postventa']],
    },
  },
  {
    k: 'mq',
    iniciales: 'MQ',
    nombre: 'María Quispe Huamán',
    doc: 'DNI 45218834',
    dni: '45218834',
    telefono: '+51 982 310 445',
    proyecto: 'Villa Sol · Etapa II',
    lotes: ['C-14'],
    contratoPrincipal: 'VS-2024-0412',
    estadoEmocional: 'Preocupada por figurar con mora pese a haber pagado en agente BCP; trato cordial.',
    sintesisIa:
      'Tiene ticket prioritario con Rayo AIN-000482 en Cobranza. Presentó voucher BCP operación #88231 por S/ 1,250.00 del 28-sep-2026. Requiere conciliación inmediata para habilitar firma de adenda.',
    guiaRecomendada: 'Conciliar operación #88231 en Cobranza y emitir constancia de no adeudo hoy.',
    datos: {
      kyc: [
        ['DNI 45218834', 'Verificado en RENIEC / SIGDA'],
        ['Estado KYC', 'Conforme · Titular activa'],
      ],
      cont: [
        ['maria.quispe@ejemplo.test', 'Correo verificado'],
        ['+51 982 310 445', 'WhatsApp verificado · Envió voucher por chat'],
      ],
      lote: [
        ['Lote C-14 · 150.00 m²', 'Villa Sol · Etapa II'],
        ['Estado físico', 'Habilitación urbana concluida · Listo para entrega'],
      ],
      contrato: [
        ['Contrato VS-2024-0412', 'Vigente · Aybar Inmobiliaria S.A.C.'],
        ['Adenda en trámite', 'Adenda de reprogramación sujeta a validación de cuota 18'],
      ],
      acta: [['Acta de entrega C-14', 'Pre-programada para noviembre 2026']],
      gar: [['Cobertura postventa', 'Se activará con la firma del acta de entrega']],
      crono: [
        ['Cuota 18 de 48', 'S/ 1,250.00'],
        ['Operación en tránsito', 'Voucher BCP #88231 en conciliación por Cobranza'],
      ],
      cuotas: [
        ['Cuotas pagadas', '17 conciliadas + 1 en validación bancaria'],
        ['Prioridad Rayo', 'Activada en ticket AIN-000482'],
      ],
      saldo: [['Saldo capital C-14', 'S/ 37,500.00']],
      ecta: [
        ['Pagado acumulado', 'S/ 21,250.00'],
        ['Abono en conciliación', 'S/ 1,250.00 (28-sep-2026 · Agente BCP)'],
      ],
      docs: [
        ['Contrato VS-2024-0412.pdf', 'Firmado · Custodia GLI #84120'],
        ['Voucher_BCP_88231.jpg', 'Fragmento IA: «…Agente BCP #4102 · Monto S/ 1,250.00 · 28/09/2026…»'],
      ],
      correos: [['«Envío comprobante de pago septiembre»', 'Recibido 18-oct-2026']],
      llam: [['3 llamadas previas registradas', 'Última llamada 18-oct-2026 (4 min 05 s)']],
      tick: [['AIN-000482 · Consulta de cuenta (Rayo)', 'En atención · Cobranza (R. Salazar)']],
      libro: [['Sin asientos en Libro', '—']],
      expo: [['Exposición legal', 'S/ 0.00 · Caso operativo de conciliación']],
    },
  },
  {
    k: 'rh',
    iniciales: 'RH',
    nombre: 'Rosa Huamán Paredes',
    doc: 'DNI 42889102',
    dni: '42889102',
    telefono: '+51 975 118 902',
    proyecto: 'Residencial Brisas',
    lotes: ['Torre B-402'],
    contratoPrincipal: 'RB-2024-0318',
    estadoEmocional: 'Expectante por solución definitiva de filtración antes de temporada de lluvias.',
    sintesisIa:
      'Propietaria con unidad entregada el 14-nov-2025. Ticket APV-000089 y reclamo de garantía GAR-0091 por impermeabilización en baño principal dentro del plazo de cobertura de 12 meses.',
    guiaRecomendada: 'Confirmar cuadrilla de impermeabilización el 22-oct-2026 y firmar acta de conformidad.',
    datos: {
      kyc: [['DNI 42889102', 'Verificado en RENIEC / SIGDA']],
      cont: [
        ['rosa.huaman@ejemplo.test', 'Correo verificado'],
        ['+51 975 118 902', 'Celular principal · Autogestión Mi Portal'],
      ],
      lote: [
        ['Dpto. Torre B-402 · 84.50 m²', 'Residencial Brisas · Etapa I'],
        ['Independización', 'Inscrita en Partida P01561029 SUNARP'],
      ],
      contrato: [
        ['Contrato RB-2024-0318', 'Vigente · Aybar Postventa / Vivienda'],
        ['Modalidad', 'Crédito hipotecario desembolsado 100%'],
      ],
      acta: [['Acta de entrega B-402', 'Firmada el 14-nov-2025']],
      gar: [
        ['Impermeabilización (12 m)', 'Vigente hasta 14-nov-2026 (GAR-0091)'],
        ['Estructural (120 m)', 'Vigente hasta 14-nov-2035'],
      ],
      crono: [['Crédito cancelado a inmobiliaria', '100% desembolsado por entidad bancaria']],
      cuotas: [['Cuotas vencidas', '0 (Cancelado total)']],
      saldo: [['Saldo inmobiliario', 'S/ 0.00']],
      ecta: [
        ['Precio total cancelado', 'S/ 268,000.00'],
        ['Deuda pendiente', 'S/ 0.00'],
      ],
      docs: [
        ['Contrato RB-2024-0318.pdf', 'Escritura Pública · Custodia GLI'],
        ['Acta de Entrega B-402.pdf', 'Firmada el 14-nov-2025'],
        ['Informe Preliminar GAR-0091.pdf', 'Fragmento IA: «…humedad en junta de ducha requiere sellado epóxico…»'],
      ],
      correos: [['«Programación de inspección GAR-0091»', 'Enviado el 18-oct-2026']],
      llam: [['Llamada saliente Postventa (2 min 50 s)', '18-oct-2026 · L. Ccahuana']],
      tick: [['APV-000089 · Garantía postventa', 'En atención · Postventa (L. Ccahuana)']],
      libro: [['Sin asientos en Libro', '—']],
      expo: [['Exposición baja', 'Atención cubierta por fondo de garantía postventa']],
    },
  },
  {
    k: 'hq',
    iniciales: 'HQ',
    nombre: 'Hernán Quispe Condori',
    doc: 'DNI 41902311',
    dni: '41902311',
    telefono: '+51 964 501 887',
    proyecto: 'Villa Sol · Etapa II',
    lotes: ['E-19'],
    contratoPrincipal: 'VS-2024-0891',
    estadoEmocional: 'Solicita fraccionamiento de 3 letras vencidas para evitar resolución contractual.',
    sintesisIa:
      'Caso MOR-2026-0024 detectado con 3 meses impagos (S/ 3,540.00). Pendiente de despacho de alerta paralela de cancelación de servicios y carta al responsable de proyecto.',
    guiaRecomendada: 'Ejecutar alerta preventiva o formalizar compromiso de pago en Comité SGD.',
    datos: {
      kyc: [['DNI 41902311', 'Verificado en SIGDA']],
      cont: [
        ['hernan.quispe@ejemplo.test', 'Correo registrado'],
        ['+51 964 501 887', 'Celular principal'],
      ],
      lote: [['Lote E-19 · 160.00 m²', 'Villa Sol · Etapa II']],
      contrato: [
        ['Contrato VS-2024-0891', 'En evaluación de resolución por 3 meses impagos'],
        ['Cláusula 9.ª Resolutoria', 'Habilitada · Caso MOR-2026-0024'],
      ],
      acta: [['Sin acta de entrega', 'Sujeto a regularización de cartera']],
      gar: [['No aplica', 'Unidad no entregada']],
      crono: [
        ['Cuota 16 de 60', 'S/ 1,180.00'],
        ['Letras impagas', 'Letras 14, 15 y 16 (jul, ago, sep 2026)'],
      ],
      cuotas: [
        ['Cuotas vencidas', '3 cuotas (S/ 3,540.00)'],
        ['Estado en Mesa Morosidad', 'MOR-2026-0024 · DETECTADO'],
      ],
      saldo: [['Saldo capital E-19', 'S/ 51,920.00']],
      ecta: [
        ['Pagado acumulado', 'S/ 15,340.00'],
        ['Mora exigible', 'S/ 3,540.00'],
      ],
      docs: [
        ['Contrato VS-2024-0891.pdf', 'Firmado · Custodia GLI #81044'],
        ['Liquidación de mora MOR-2026-0024.pdf', 'Emitida por Cobranza el 17-oct-2026'],
      ],
      correos: [['«Recordatorio de vencimiento de 3.ª letra»', 'Enviado 05-oct-2026']],
      llam: [['Llamada saliente Cobranza (5 min 18 s)', '15-oct-2026 · Grabación CTI #9892']],
      tick: [['AIN-000491 · Solicitud de reprogramación', 'Abierto · Cobranza']],
      libro: [['Sin asientos en Libro', '—']],
      expo: [['Riesgo contractual medio', 'S/ 3,540.00 en mora · Caso MOR-2026-0024']],
    },
  },
  {
    k: 'vs',
    iniciales: 'VS',
    nombre: 'Valeria Soto Ríos',
    doc: 'DNI 74819203',
    dni: '74819203',
    telefono: '+51 961 402 118',
    proyecto: 'Villa Sol · Etapa III (En evaluación)',
    lotes: [],
    contratoPrincipal: '',
    estadoEmocional: 'Interesada en información de preventa y requisitos de separación; aún sin lote ni contrato adjudicado.',
    sintesisIa:
      'Cliente registrada en SIGDA sin lote adjudicado ni contrato vigente aún. Las secciones inmobiliarias, financieras y de consultas rápidas en línea permanecen sin disponibilidad hasta la adjudicación de lote y firma de contrato.',
    guiaRecomendada: 'Brindar orientación comercial o registrar ticket de consulta general en Bandeja ATC.',
    datos: {
      kyc: [
        ['DNI 74819203', 'Verificado en RENIEC / SIGDA'],
        ['Condición actual', 'Titular registrada sin lote ni contrato adjudicado aún'],
      ],
      cont: [
        ['valeria.soto@ejemplo.test', 'Correo verificado'],
        ['+51 961 402 118', 'Celular principal · Click-to-Call disponible'],
      ],
      correos: [['«Consulta sobre requisitos de preventa Villa Sol III»', 'Recibido 19-oct-2026']],
      llam: [['Llamada entrante informativa (2 min 10 s)', '19-oct-2026 · Grabación CTI #9945']],
      tick: [['AIN-000495 · Consulta de requisitos preventa', 'Abierto · Atención al Cliente']],
      libro: [['Sin asientos en Libro', '—']],
    },
  },
];

export const CONTRATOS_ATC: readonly ContratoInmobiliarioAtc[] = [
  {
    codigo: 'VS-2025-0507',
    tipo: 'Contrato de Compraventa de Lote Urbano con Reserva de Dominio',
    estado: 'VIGENTE',
    empresa: 'Aybar Inmobiliaria S.A.C.',
    rucEmpresa: '20601234561',
    clienteNombre: 'Eddie Huamaní',
    clienteDoc: 'DNI 72282555',
    clienteKey360: 'eh',
    proyecto: 'Villa Sol',
    etapa: 'Etapa II',
    manzanaLote: 'Mz. C · Lote 07',
    areaMetros: '160.00 m² (8.00 m × 20.00 m)',
    zonificacion: 'RDM · Residencial de Densidad Media',
    linderos: 'Frente: Parque Central (8.00 m) · Derecha: Lote C-08 (20.00 m) · Izquierda: Lote C-06 (20.00 m) · Fondo: Lote C-22 (8.00 m)',
    partidaMatrizSunarp: 'P01489213 · Zona Registral N.º IX - Sede Lima',
    notaria: 'Notaría Gálvez Succar · Lima',
    kardexNotarial: 'K-91820-2025',
    fechaSuscripcion: '15 de septiembre de 2025',
    moneda: 'PEN',
    precioTotal: 'S/ 81,620.00',
    cuotaInicial: 'S/ 12,000.00',
    capitalFinanciado: 'S/ 69,620.00',
    totalLetras: 60,
    letrasPagadas: 13,
    letrasVencidas: 0,
    saldoPendiente: 'S/ 54,280.00',
    moraAcumulada: 'S/ 0.00',
    actaEntregaEstado: 'Programada para EntregaFest del 07-nov-2026',
    clausulas: [
      {
        numero: 'PRIMERA',
        titulo: 'Antecedentes y Titularidad Registral del Proyecto',
        contenido:
          'LA VENDEDORA (Aybar Inmobiliaria S.A.C., RUC 20601234561) es propietaria registral del predio matriz inscrito en la Partida Electrónica N.º P01489213 del Registro de Predios de Lima, donde se desarrolla la Habilitación Urbana denominada «Villa Sol - Etapa II».',
      },
      {
        numero: 'SEGUNDA',
        titulo: 'Objeto del Contrato e Identificación de la Unidad Inmobiliaria',
        contenido:
          'Por el presente instrumento, LA VENDEDORA transfiere en compraventa con reserva de propiedad a favor de EL COMPRADOR (Eddie Huamaní, DNI 72282555) el Lote 07 de la Manzana C, con un área superficial de 160.00 m², según Adenda de Reubicación N.º 01.',
      },
      {
        numero: 'TERCERA',
        titulo: 'Precio de Venta, Cuota Inicial y Financiamiento Directo',
        contenido:
          'El precio total pactado de común acuerdo asciende a S/ 81,620.00 (Ochenta y un mil seiscientos veinte con 00/100 Soles), cancelados mediante una cuota inicial de S/ 12,000.00 y el saldo de S/ 69,620.00 financiado en 60 letras mensuales iguales de S/ 1,180.00 con vencimiento los días 30 de cada mes.',
      },
      {
        numero: 'NOVENA',
        titulo: 'Cláusula Resolutoria Expresa por Incumplimiento (Art. 1430° Código Civil)',
        contenido:
          'La falta de pago de tres (03) cuotas mensuales consecutivas o alternadas facultará a LA VENDEDORA a resolver de pleno derecho el presente contrato mediante comunicación fehaciente, activando simultáneamente la alerta de cancelación de servicios y notificación a la jefatura del proyecto.',
      },
      {
        numero: 'DÉCIMA',
        titulo: 'Entrega de Posesión, Acta de Entrega y Cómputo de Garantías',
        contenido:
          'La entrega física de la unidad se formaliza únicamente con la suscripción del Acta de Entrega. A partir de dicha fecha se computan automáticamente los plazos de garantía postventa: diez (10) años para partidas estructurales y doce (12) meses para acabados e instalaciones.',
      },
    ],
    adendas: [
      {
        codigo: 'ADE-VS-2025-0507-01',
        fecha: '18-jun-2025',
        titulo: 'Adenda N.º 01 de Reubicación de Unidad (Lote B-11 a Lote C-07)',
        estado: 'FIRMADA',
        resumen: 'Reubicación voluntaria del Lote B-11 al Lote C-07 frente a parque central conservando el precio por m² y el cronograma original.',
        detalleClausula:
          'ACUERDO SEGUNDO: Las partes acuerdan sustituir el objeto de la compraventa por el Lote C-07 (160.00 m²), reconociendo el 100% de las cuotas abonadas a la fecha y manteniendo la cuota mensual en S/ 1,180.00.',
      },
    ],
    firmantes: [
      {
        rol: 'REPRESENTANTE_EMPRESA',
        nombre: 'Dr. Ernesto Alarcón Vargas (Apoderado Aybar Inmobiliaria S.A.C.)',
        documento: 'DNI 09841203 · Partida Poderes N.º 14098211',
        fechaFirma: '15-sep-2025 11:14:22',
        modalidad: 'Firma Digital Certificada INDECOPI / GLI',
        hashCustodia: 'SHA256:9f84a2c1...77e10b',
      },
      {
        rol: 'COMPRADOR_TITULAR',
        nombre: 'Eddie Huamaní',
        documento: 'DNI 72282555',
        fechaFirma: '15-sep-2025 11:18:05',
        modalidad: 'Firma Biométrica RENIEC + Token SMS',
        hashCustodia: 'SHA256:4c2019be...31a904',
      },
    ],
    cronograma: [
      { numero: 11, vencimiento: '2026-07-30', monto: 'S/ 1,180.00', estado: 'PAGADA', fechaPago: '2026-07-29', operacion: 'BCP-661902' },
      { numero: 12, vencimiento: '2026-08-30', monto: 'S/ 1,180.00', estado: 'PAGADA', fechaPago: '2026-08-28', operacion: 'BCP-710498' },
      { numero: 13, vencimiento: '2026-09-30', monto: 'S/ 1,180.00', estado: 'PAGADA', fechaPago: '2026-09-29', operacion: 'BCP-774120' },
      { numero: 14, vencimiento: '2026-10-30', monto: 'S/ 1,180.00', estado: 'POR_VENCER' },
      { numero: 15, vencimiento: '2026-11-30', monto: 'S/ 1,180.00', estado: 'POR_VENCER' },
    ],
  },
  {
    codigo: 'LA-2023-0117',
    tipo: 'Contrato de Compraventa de Lote con Cláusula Resolutoria',
    estado: 'EN_EVALUACION_RESOLUCION',
    empresa: 'Aybar Lotes y Terrenos S.A.C.',
    rucEmpresa: '20601234572',
    clienteNombre: 'Jorge Mamani Ccori',
    clienteDoc: 'DNI 70134409',
    clienteKey360: 'jr',
    proyecto: 'Los Álamos de Carabayllo',
    etapa: 'Etapa I',
    manzanaLote: 'Mz. F · Lote 03',
    areaMetros: '140.00 m² (7.00 m × 20.00 m)',
    zonificacion: 'RDM · Residencial de Densidad Media',
    linderos: 'Frente: Calle Los Cedros (7.00 m) · Derecha: Lote F-04 (20.00 m) · Izquierda: Lote F-02 (20.00 m) · Fondo: Lote F-18 (7.00 m)',
    partidaMatrizSunarp: 'P01322489 · Zona Registral N.º IX - Sede Lima',
    notaria: 'Notaría Carpio Vélez · Independencia',
    kardexNotarial: 'K-33019-2023',
    fechaSuscripcion: '15 de noviembre de 2023',
    moneda: 'PEN',
    precioTotal: 'S/ 56,040.00',
    cuotaInicial: 'S/ 9,000.00',
    capitalFinanciado: 'S/ 47,040.00',
    totalLetras: 48,
    letrasPagadas: 19,
    letrasVencidas: 3,
    saldoPendiente: 'S/ 25,480.00',
    moraAcumulada: 'S/ 2,940.00 (3 letras impagas: jul, ago, sep 2026)',
    actaEntregaEstado: 'Suspendida por morosidad y controversia en Eje 3 Legal',
    clausulas: [
      {
        numero: 'PRIMERA',
        titulo: 'Partida Matriz y Habilitación Urbana Los Álamos',
        contenido:
          'Aybar Lotes y Terrenos S.A.C. (RUC 20601234572) desarrolla el proyecto «Los Álamos de Carabayllo - Etapa I» sobre la Partida Matriz P01322489.',
      },
      {
        numero: 'TERCERA',
        titulo: 'Precio y Cronograma de 48 Letras Mensuales',
        contenido:
          'El precio total de venta es de S/ 56,040.00, pagadero con inicial de S/ 9,000.00 y 48 cuotas mensuales de S/ 980.00 con vencimiento el día 15 de cada mes.',
      },
      {
        numero: 'NOVENA',
        titulo: 'Resolución de Pleno Derecho al 3.er Mes Impago y Suspensión por Reclamo',
        contenido:
          'El incumplimiento de tres (03) cuotas consecutivas habilita la resolución contractual (Caso MOR-2026-0019). Conforme a la política corporativa de protección al consumidor, la ejecución resolutoria queda en custodia de Eje 3 Legal mientras se resuelve el reclamo vinculado ALT-001204 / Asiento ALT-2026-0042.',
        alerta: 'ACTIVA CON SUSPENSIÓN LEGAL: 3 cuotas vencidas (S/ 2,940.00) · Vinculado a Caso SGD-2026-000318.',
      },
    ],
    adendas: [
      {
        codigo: 'ADE-LA-2023-0117-01',
        fecha: '10-mar-2025',
        titulo: 'Adenda de Actualización de Domicilio y Correo de Notificación',
        estado: 'FIRMADA',
        resumen: 'Actualización de correo electrónico para recepción de estados de cuenta y notificaciones notariales.',
        detalleClausula: 'Se fija como correo oficial de notificación jorge.mamani@ejemplo.test.',
      },
    ],
    firmantes: [
      {
        rol: 'REPRESENTANTE_EMPRESA',
        nombre: 'Dra. Rosario Villavicencio (Apoderada Legal Aybar Lotes y Terrenos S.A.C.)',
        documento: 'DNI 10448920',
        fechaFirma: '15-nov-2023 16:40:10',
        modalidad: 'Firma Digital Certificada GLI',
        hashCustodia: 'SHA256:7a11bc09...8821ef',
      },
      {
        rol: 'COMPRADOR_TITULAR',
        nombre: 'Jorge Mamani Ccori',
        documento: 'DNI 70134409',
        fechaFirma: '15-nov-2023 16:45:00',
        modalidad: 'Firma Biométrica Presencial Caseta Carabayllo',
        hashCustodia: 'SHA256:1d9904fa...55c12e',
      },
    ],
    cronograma: [
      { numero: 19, vencimiento: '2026-06-15', monto: 'S/ 980.00', estado: 'PAGADA', fechaPago: '2026-06-15', operacion: 'BBVA-441092' },
      { numero: 20, vencimiento: '2026-07-15', monto: 'S/ 980.00', estado: 'VENCIDA' },
      { numero: 21, vencimiento: '2026-08-15', monto: 'S/ 980.00', estado: 'VENCIDA' },
      { numero: 22, vencimiento: '2026-09-15', monto: 'S/ 980.00', estado: 'VENCIDA' },
      { numero: 23, vencimiento: '2026-10-15', monto: 'S/ 980.00', estado: 'POR_VENCER' },
    ],
  },
  {
    codigo: 'MS-2025-0210',
    tipo: 'Escritura Pública de Compraventa e Independización con Garantía Postventa',
    estado: 'ENTREGADO_CON_GARANTIA',
    empresa: 'Aybar Desarrollos del Sur S.A.C.',
    rucEmpresa: '20601234649',
    clienteNombre: 'Lucía Paredes V.',
    clienteDoc: 'CE 00451277',
    clienteKey360: 'lp',
    proyecto: 'Mirador del Sur',
    etapa: 'Etapa I',
    manzanaLote: 'Mz. C · Lote 21',
    areaMetros: '180.00 m² (9.00 m × 20.00 m)',
    zonificacion: 'RDM · Esquina Comercial / Residencial',
    linderos: 'Frente: Av. Los Precursores (9.00 m) · Derecha: Calle 4 (20.00 m) · Izquierda: Lote C-20 (20.00 m) · Fondo: Lote C-12 (9.00 m)',
    partidaMatrizSunarp: 'P01609412 · Zona Registral N.º IX - Sede Lima',
    notaria: 'Notaría Paino · Surquillo',
    kardexNotarial: 'K-44109-2025',
    fechaSuscripcion: '20 de enero de 2025',
    moneda: 'PEN',
    precioTotal: 'S/ 74,160.00',
    cuotaInicial: 'S/ 18,000.00',
    capitalFinanciado: 'S/ 56,160.00',
    totalLetras: 36,
    letrasPagadas: 8,
    letrasVencidas: 0,
    saldoPendiente: 'S/ 42,120.00',
    moraAcumulada: 'S/ 0.00',
    actaEntregaEstado: 'Firmada el 20-sep-2026 · Garantía estructural vigente hasta 20-sep-2036',
    clausulas: [
      {
        numero: 'PRIMERA',
        titulo: 'Transferencia e Independización de Unidad',
        contenido:
          'Aybar Desarrollos del Sur S.A.C. transfiere a favor de Lucía Paredes V. (CE 00451277) el Lote C-21 de 180.00 m² ubicado en el proyecto Mirador del Sur.',
      },
      {
        numero: 'OCTAVA',
        titulo: 'Acta de Entrega y Régimen de Garantías Postventa',
        contenido:
          'Suscrita el Acta de Entrega con fecha 20-sep-2026, se encuentran activas las coberturas de garantía por 120 meses en partidas estructurales (muros de contención y cimentación) y 12 meses en acabados, bajo las cuales se atiende el expediente GAR-0092 / Ticket APV-000412.',
      },
    ],
    adendas: [],
    firmantes: [
      {
        rol: 'REPRESENTANTE_EMPRESA',
        nombre: 'Ing. Roberto Castañeda (Apoderado Aybar Desarrollos del Sur S.A.C.)',
        documento: 'DNI 08219344',
        fechaFirma: '20-ene-2025 10:05:12',
        modalidad: 'Firma Digital Certificada GLI',
        hashCustodia: 'SHA256:6b8210cc...9012aa',
      },
      {
        rol: 'COMPRADOR_TITULAR',
        nombre: 'Lucía Paredes V.',
        documento: 'CE 00451277',
        fechaFirma: '20-ene-2025 10:12:40',
        modalidad: 'Firma Biométrica Notarial',
        hashCustodia: 'SHA256:3e7712dd...1904bc',
      },
    ],
    cronograma: [
      { numero: 7, vencimiento: '2026-09-05', monto: 'S/ 1,560.00', estado: 'PAGADA', fechaPago: '2026-09-05', operacion: 'IBK-901241' },
      { numero: 8, vencimiento: '2026-10-05', monto: 'S/ 1,560.00', estado: 'PAGADA', fechaPago: '2026-10-05', operacion: 'IBK-948102' },
      { numero: 9, vencimiento: '2026-11-05', monto: 'S/ 1,560.00', estado: 'POR_VENCER' },
    ],
  },
  {
    codigo: 'VS-2024-0412',
    tipo: 'Contrato de Compraventa de Lote Urbano con Financiamiento',
    estado: 'VIGENTE',
    empresa: 'Aybar Inmobiliaria S.A.C.',
    rucEmpresa: '20601234561',
    clienteNombre: 'María Quispe Huamán',
    clienteDoc: 'DNI 45218834',
    clienteKey360: 'mq',
    proyecto: 'Villa Sol',
    etapa: 'Etapa II',
    manzanaLote: 'Mz. C · Lote 14',
    areaMetros: '150.00 m² (7.50 m × 20.00 m)',
    zonificacion: 'RDM · Residencial de Densidad Media',
    linderos: 'Frente: Calle Las Begonias (7.50 m) · Derecha: Lote C-15 · Izquierda: Lote C-13 · Fondo: Lote C-29',
    partidaMatrizSunarp: 'P01489213 · Zona Registral N.º IX - Sede Lima',
    notaria: 'Notaría Gálvez Succar · Lima',
    kardexNotarial: 'K-78102-2024',
    fechaSuscripcion: '28 de marzo de 2024',
    moneda: 'PEN',
    precioTotal: 'S/ 70,000.00',
    cuotaInicial: 'S/ 10,000.00',
    capitalFinanciado: 'S/ 60,000.00',
    totalLetras: 48,
    letrasPagadas: 18,
    letrasVencidas: 0,
    saldoPendiente: 'S/ 37,500.00',
    moraAcumulada: 'S/ 0.00 (Cuota 18 en conciliación con voucher BCP #88231)',
    actaEntregaEstado: 'Pre-programada para noviembre 2026',
    clausulas: [
      {
        numero: 'CUARTA',
        titulo: 'Recaudación Bancaria y Conciliación de Abonos en Agentes',
        contenido:
          'Los pagos efectuados en agentes corresponsales BCP se concilian en un plazo máximo de 24 horas hábiles contra la presentación del voucher de operación, liberando automáticamente cualquier bloqueo para suscripción de adendas.',
      },
    ],
    adendas: [
      {
        codigo: 'ADE-VS-2024-0412-01',
        fecha: '19-oct-2026',
        titulo: 'Adenda de Cambio de Día de Vencimiento Mensual (Día 28 al Día 05)',
        estado: 'EN_TRAMITE',
        resumen: 'Pendiente de firma digital una vez conciliado el voucher BCP #88231 en el ticket con Rayo AIN-000482.',
        detalleClausula: 'Se modifica la fecha de vencimiento de las cuotas 19 a 48 al día 05 de cada mes sin recargo administrativo.',
      },
    ],
    firmantes: [
      {
        rol: 'REPRESENTANTE_EMPRESA',
        nombre: 'Dr. Ernesto Alarcón Vargas (Apoderado Aybar Inmobiliaria S.A.C.)',
        documento: 'DNI 09841203',
        fechaFirma: '28-mar-2024 15:20:00',
        modalidad: 'Firma Digital Certificada GLI',
        hashCustodia: 'SHA256:5c1902ab...4401cd',
      },
      {
        rol: 'COMPRADOR_TITULAR',
        nombre: 'María Quispe Huamán',
        documento: 'DNI 45218834',
        fechaFirma: '28-mar-2024 15:24:18',
        modalidad: 'Firma Biométrica RENIEC',
        hashCustodia: 'SHA256:8e4410ef...1209fa',
      },
    ],
    cronograma: [
      { numero: 16, vencimiento: '2026-07-28', monto: 'S/ 1,250.00', estado: 'PAGADA', fechaPago: '2026-07-28', operacion: 'BCP-710291' },
      { numero: 17, vencimiento: '2026-08-28', monto: 'S/ 1,250.00', estado: 'PAGADA', fechaPago: '2026-08-27', operacion: 'BCP-791044' },
      { numero: 18, vencimiento: '2026-09-28', monto: 'S/ 1,250.00', estado: 'PAGADA', fechaPago: '2026-09-28', operacion: 'BCP-88231 (En conciliación)' },
      { numero: 19, vencimiento: '2026-10-28', monto: 'S/ 1,250.00', estado: 'POR_VENCER' },
    ],
  },
  {
    codigo: 'RB-2024-0318',
    tipo: 'Contrato de Compraventa de Unidad de Vivienda Multifamiliar',
    estado: 'ENTREGADO_CON_GARANTIA',
    empresa: 'Aybar Postventa S.A.C.',
    rucEmpresa: '20601234616',
    clienteNombre: 'Rosa Huamán Paredes',
    clienteDoc: 'DNI 42889102',
    clienteKey360: 'rh',
    proyecto: 'Residencial Brisas',
    etapa: 'Torre B',
    manzanaLote: 'Torre B · Dpto. 402',
    areaMetros: '84.50 m² techados',
    zonificacion: 'RDA · Residencial de Densidad Alta',
    linderos: 'Nivel 4 · Frente a área común central · Ascensor par/impar',
    partidaMatrizSunarp: 'P01561029 · Zona Registral N.º IX - Sede Lima',
    notaria: 'Notaría Tambini Ávila · San Isidro',
    kardexNotarial: 'K-61209-2024',
    fechaSuscripcion: '10 de mayo de 2024',
    moneda: 'PEN',
    precioTotal: 'S/ 268,000.00',
    cuotaInicial: 'S/ 40,200.00',
    capitalFinanciado: 'S/ 227,800.00 (Desembolso Hipotecario)',
    totalLetras: 1,
    letrasPagadas: 1,
    letrasVencidas: 0,
    saldoPendiente: 'S/ 0.00',
    moraAcumulada: 'S/ 0.00',
    actaEntregaEstado: 'Firmada el 14-nov-2025 · Garantía de impermeabilización vigente (GAR-0091)',
    clausulas: [
      {
        numero: 'SÉPTIMA',
        titulo: 'Cobertura de Garantías Postventa por Partida Constructiva',
        contenido:
          'A partir del Acta de Entrega del 14-nov-2025, la unidad cuenta con 12 meses de garantía en instalaciones sanitarias e impermeabilización y 120 meses en estructura sismorresistente.',
      },
    ],
    adendas: [],
    firmantes: [
      {
        rol: 'REPRESENTANTE_EMPRESA',
        nombre: 'Ing. Roberto Castañeda (Apoderado Aybar Postventa S.A.C.)',
        documento: 'DNI 08219344',
        fechaFirma: '10-may-2024 12:00:00',
        modalidad: 'Firma Digital Certificada GLI',
        hashCustodia: 'SHA256:2a9012bc...7712de',
      },
      {
        rol: 'COMPRADOR_TITULAR',
        nombre: 'Rosa Huamán Paredes',
        documento: 'DNI 42889102',
        fechaFirma: '10-may-2024 12:08:15',
        modalidad: 'Firma Biométrica Notarial',
        hashCustodia: 'SHA256:9b1140ef...6610ab',
      },
    ],
    cronograma: [
      { numero: 1, vencimiento: '2024-05-25', monto: 'S/ 227,800.00', estado: 'PAGADA', fechaPago: '2024-05-24', operacion: 'HIP-BCP-110294' },
    ],
  },
  {
    codigo: 'VS-2024-0891',
    tipo: 'Contrato de Compraventa de Lote Urbano con Cláusula Resolutoria',
    estado: 'EN_EVALUACION_RESOLUCION',
    empresa: 'Aybar Inmobiliaria S.A.C.',
    rucEmpresa: '20601234561',
    clienteNombre: 'Hernán Quispe Condori',
    clienteDoc: 'DNI 41902311',
    clienteKey360: 'hq',
    proyecto: 'Villa Sol',
    etapa: 'Etapa II',
    manzanaLote: 'Mz. E · Lote 19',
    areaMetros: '160.00 m² (8.00 m × 20.00 m)',
    zonificacion: 'RDM · Residencial de Densidad Media',
    linderos: 'Frente: Av. Colectora Norte (8.00 m) · Derecha: Lote E-20 · Izquierda: Lote E-18 · Fondo: Lote E-04',
    partidaMatrizSunarp: 'P01489213 · Zona Registral N.º IX - Sede Lima',
    notaria: 'Notaría Gálvez Succar · Lima',
    kardexNotarial: 'K-84910-2024',
    fechaSuscripcion: '20 de junio de 2024',
    moneda: 'PEN',
    precioTotal: 'S/ 82,800.00',
    cuotaInicial: 'S/ 12,000.00',
    capitalFinanciado: 'S/ 70,800.00',
    totalLetras: 60,
    letrasPagadas: 13,
    letrasVencidas: 3,
    saldoPendiente: 'S/ 51,920.00',
    moraAcumulada: 'S/ 3,540.00 (Caso MOR-2026-0024 activo)',
    actaEntregaEstado: 'Suspendida por morosidad de 3 cuotas',
    clausulas: [
      {
        numero: 'NOVENA',
        titulo: 'Activación de Flujo de Morosidad 3 Meses y Alerta Paralela al Proyecto',
        contenido:
          'Al acumularse tres (03) letras vencidas (cuotas 14, 15 y 16), el sistema genera el expediente MOR-2026-0024 para envío simultáneo de alerta de cancelación de servicios y carta formal a la Arq. Claudia Mendoza (Responsable del Proyecto) con copia a Supervisión ATC.',
        alerta: 'PENDIENTE DE DESPACHO EN MESA SGD: 3 cuotas impagas (S/ 3,540.00).',
      },
    ],
    adendas: [],
    firmantes: [
      {
        rol: 'REPRESENTANTE_EMPRESA',
        nombre: 'Dr. Ernesto Alarcón Vargas (Apoderado Aybar Inmobiliaria S.A.C.)',
        documento: 'DNI 09841203',
        fechaFirma: '20-jun-2024 14:10:00',
        modalidad: 'Firma Digital Certificada GLI',
        hashCustodia: 'SHA256:3f8812ab...9912cd',
      },
      {
        rol: 'COMPRADOR_TITULAR',
        nombre: 'Hernán Quispe Condori',
        documento: 'DNI 41902311',
        fechaFirma: '20-jun-2024 14:15:40',
        modalidad: 'Firma Biométrica RENIEC',
        hashCustodia: 'SHA256:7d2201ef...4410ab',
      },
    ],
    cronograma: [
      { numero: 13, vencimiento: '2026-06-20', monto: 'S/ 1,180.00', estado: 'PAGADA', fechaPago: '2026-06-20', operacion: 'BCP-551920' },
      { numero: 14, vencimiento: '2026-07-20', monto: 'S/ 1,180.00', estado: 'VENCIDA' },
      { numero: 15, vencimiento: '2026-08-20', monto: 'S/ 1,180.00', estado: 'VENCIDA' },
      { numero: 16, vencimiento: '2026-09-20', monto: 'S/ 1,180.00', estado: 'VENCIDA' },
      { numero: 17, vencimiento: '2026-10-20', monto: 'S/ 1,180.00', estado: 'POR_VENCER' },
    ],
  },
];

export const CONSULTAS_SEMANTICAS: readonly { readonly q: string; readonly nodo: string; readonly explicacion: string }[] = [
  {
    q: 'adenda de cambio de lote',
    nodo: 'docs',
    explicacion: 'Búsqueda semántica: localiza «Adenda cambio de lote.pdf» en el repositorio documental por significado.',
  },
  {
    q: 'cuotas vencidas y resolución',
    nodo: 'cuotas',
    explicacion: 'Búsqueda semántica: cruza cronograma de Cobranza y estado de pagos del lote.',
  },
  {
    q: 'fecha de entrega y garantía',
    nodo: 'acta',
    explicacion: 'Búsqueda semántica: ubica el Acta de Entrega y periodo de cobertura postventa.',
  },
];

/* ── Datos Operación en Vivo 3D / 2D (Sede Corporativa) ──────────────────── */

export interface PuertaCanal {
  readonly k: string;
  readonly nombre: string;
  readonly y: number;
  readonly ic: string;
}

export interface SalaOficina {
  readonly k: string;
  readonly nombre: string;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly d: number;
  readonly gestores: readonly string[];
}

export const PUERTAS_CANAL: readonly PuertaCanal[] = [
  { k: 'tel', nombre: 'Call center', y: 1.0, ic: 'TEL' },
  { k: 'wa', nombre: 'WhatsApp', y: 2.9, ic: 'WA' },
  { k: 'mail', nombre: 'Correo', y: 4.8, ic: '@' },
  { k: 'portal', nombre: 'Mi Portal', y: 6.7, ic: 'WEB' },
  { k: 'form', nombre: 'Formulario QR', y: 8.6, ic: 'QR' },
];

export const SALAS_OFICINA: readonly SalaOficina[] = [
  { k: 'eje1', nombre: 'Atención Eje 1', x: 12.2, y: 0.3, w: 3.5, d: 2.8, gestores: ['Ana P.', 'Luis M.', 'Rosa T.'] },
  { k: 'cob', nombre: 'Cobranza', x: 12.2, y: 3.5, w: 3.5, d: 2.8, gestores: ['Carla V.', 'Iván Q.'] },
  { k: 'libro', nombre: 'Libro de Reclamaciones', x: 12.2, y: 6.7, w: 3.5, d: 2.8, gestores: ['Sofía R.', 'Diego A.'] },
  { k: 'legal', nombre: 'Legal · Eje 3', x: 12.2, y: 12.4, w: 3.5, d: 3.2, gestores: ['Rosario V.'] },
  { k: 'post', nombre: 'Postventa', x: 7.6, y: 12.4, w: 3.3, d: 3.2, gestores: ['Pedro L.', 'Mónica S.'] },
  { k: 'proy', nombre: 'Proyecto · Entrega Fest', x: 3.4, y: 12.4, w: 3.4, d: 3.2, gestores: ['Elena C.'] },
];

export const TIPOS_SIMULACION: Readonly<
  Record<string, { readonly nombre: string; readonly area: string; readonly pt: readonly [number, number]; readonly sla: number }>
> = {
  cons: { nombre: 'Consulta general', area: 'eje1', pt: [20, 40], sla: 150 },
  cuota: { nombre: 'Cuotas y pagos', area: 'cob', pt: [25, 50], sla: 200 },
  moro: { nombre: 'Resolución morosidad (3m)', area: 'cob', pt: [40, 70], sla: 240 },
  recl: { nombre: 'Reclamo (Libro)', area: 'libro', pt: [60, 110], sla: 260 },
  legal: { nombre: 'Conflicto legal Eje 3', area: 'legal', pt: [90, 150], sla: 300 },
  gar: { nombre: 'Garantía postventa', area: 'post', pt: [60, 100], sla: 280 },
  ingr: { nombre: 'Ingreso al proyecto', area: 'proy', pt: [8, 16], sla: 50 },
  bus: { nombre: 'Cupo bus EntregaFest', area: 'proy', pt: [8, 15], sla: 60 },
};

/* ── Tickets Iniciales y Casos Operativos ────────────────────────────────── */

function crearTicketInicial(
  num: string,
  co: string,
  line: string,
  ch: string,
  cli: string,
  dni: string,
  proj: string,
  type: string,
  prio: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
  state: TicketAtc['state'],
  area: string,
  owner: string | null,
  horasAtras: number,
  summary: string,
  extra?: Partial<TicketAtc>,
): TicketAtc {
  const empresa = EMPRESAS_AYBAR.find((e) => e.id === co) ?? EMPRESAS_AYBAR[0];
  const opened = haceHoras(horasAtras);
  const sla = calcularPoliticaSla(type, prio);
  return {
    num,
    co,
    empresa,
    line,
    ch,
    cli,
    dni,
    proj,
    type,
    prio,
    state,
    area,
    owner,
    opened,
    frDue: sumarHorasHabiles(opened, sla.fr),
    resDue: sumarHorasHabiles(opened, sla.res),
    slaSrc: sla.src,
    reopen: 0,
    conflict: false,
    rayo: false,
    emotion: 'Cliente en tono calmado.',
    eje: 1,
    contract: null,
    summary,
    interactions: [],
    log: [{ fecha: opened, area: 'ATC', responsable: 'C. Rojas', motivo: 'ALTA', nota: 'Registro inicial multicanal' }],
    status: [{ fecha: opened, estado: 'OPEN', autor: 'Sistema' }],
    ...extra,
  };
}

export function crearTicketsDemo(): TicketAtc[] {
  return [
    crearTicketInicial(
      'AIN-000482',
      'AIN',
      'Lotes urbanos',
      'WhatsApp',
      'María Quispe Huamán',
      '45218834',
      'Villa Sol · Etapa II · Mz. C Lt. 14',
      'CTA',
      'HIGH',
      'IN_PROGRESS',
      'COBRANZA',
      'R. Salazar',
      26,
      'Cuota de septiembre aparece como vencida pese a pago en agente bancario BCP',
      {
        contract: 'VS-2024-0412',
        firstResp: haceHoras(25.2),
        rayo: true,
        rayoMotivo: 'Cliente con voucher validado esperando constancia para firma de adenda',
        emotion: 'Cliente preocupada; menciona haber llamado 3 veces antes. Tono calmado.',
        interactions: [
          {
            tipo: 'cli',
            fecha: haceHoras(26),
            canal: 'WhatsApp',
            autor: 'María Quispe',
            texto: 'Buenas, pagué mi cuota el 28/09 en agente BCP y en Mi Portal sale vencida. Adjunto voucher.',
          },
          {
            tipo: 'agt',
            fecha: haceHoras(25.2),
            canal: 'WhatsApp',
            autor: 'C. Rojas (ATC)',
            texto: 'Hola María, gracias por el voucher. Registramos tu caso con el N.º AIN-000482 y lo derivamos a Cobranza para validar el abono.',
          },
          {
            tipo: 'int',
            fecha: haceHoras(25),
            autor: 'C. Rojas (ATC)',
            texto: 'Derivo a Cobranza: voucher adjunto, operación #88231. Verificar conciliación bancaria.',
          },
          {
            tipo: 'sys',
            fecha: haceHoras(25),
            texto: 'Derivado ATC → COBRANZA · motivo DERIVACION_COMPETENCIA',
          },
        ],
        log: [
          { fecha: haceHoras(26), area: 'ATC', responsable: 'C. Rojas', motivo: 'ALTA', nota: 'Registro inicial' },
          {
            fecha: haceHoras(25),
            area: 'COBRANZA',
            responsable: 'R. Salazar',
            motivo: 'DERIVACION_COMPETENCIA',
            nota: 'Validar abono de cuota en extracto bancario',
          },
        ],
      },
    ),
    crearTicketInicial(
      'ALT-001204',
      'ALT',
      'Lotes urbanos',
      'Teléfono',
      'Jorge Mamani Ccori',
      '70134409',
      'Los Álamos de Carabayllo · Mz. F Lt. 03',
      'REC',
      'MEDIUM',
      'ESCALATED',
      'LEGAL',
      'Dra. P. Vílchez',
      24 * 9,
      'Reclama demora en entrega de minuta y cobro de gastos notariales',
      {
        contract: 'LA-2023-0117',
        conflict: true,
        eje: 3,
        emotion: 'Frustración alta; anuncia carta notarial. Se registró sin adjetivos de juicio.',
        interactions: [
          {
            tipo: 'cli',
            fecha: haceHoras(24 * 9),
            canal: 'Teléfono',
            autor: 'Jorge Mamani',
            texto: 'Pagué los gastos notariales hace dos meses y la minuta sigue sin firmarse. Si no me responden esta semana envío carta notarial.',
          },
          {
            tipo: 'agt',
            fecha: haceHoras(24 * 9 - 1),
            canal: 'Teléfono',
            autor: 'C. Rojas (ATC)',
            texto: 'Registramos su reclamo N.º ALT-001204 en el Libro de Reclamaciones. Le responderemos dentro del plazo legal de 15 días hábiles.',
          },
          {
            tipo: 'sys',
            fecha: haceHoras(24 * 8),
            texto: 'Derivado ATC → LEGAL · motivo DERIVACION_CONFLICTO_EJE3 · Paquete mínimo 6/6 confirmado',
          },
        ],
      },
    ),
    crearTicketInicial(
      'APV-000089',
      'APV',
      'Vivienda',
      'Mi Portal',
      'Rosa Huamán Paredes',
      '42889102',
      'Residencial Brisas · Torre B 402',
      'GAR',
      'MEDIUM',
      'IN_PROGRESS',
      'POSTVENTA',
      'L. Ccahuana',
      40,
      'Filtración en baño principal tras lluvias (con Acta de Entrega firmada)',
      { contract: 'RB-2024-0318', eje: 2 },
    ),
    crearTicketInicial(
      'AIN-000486',
      'AIN',
      'Lotes urbanos',
      'EntregaFest',
      'Eddie Huamaní',
      '72282555',
      'Villa Sol · Etapa II · Mz. C Lt. 07',
      'PED',
      'HIGH',
      'IN_PROGRESS',
      'ADMINISTRACION',
      'Elena C.',
      6,
      'Confirmación de 3 asientos en Bus 01 Lima Norte y emisión de pase QR para EntregaFest',
      {
        contract: 'VS-2025-0507',
        firstResp: haceHoras(5.5),
        emotion: 'Cliente entusiasmado por la entrega de su lote C-07 en EntregaFest.',
      },
    ),
    crearTicketInicial(
      'APV-000412',
      'ADS',
      'Lotes urbanos',
      'Mi Portal',
      'Lucía Paredes V.',
      '00451277',
      'Mirador del Sur · Mz. C Lt. 21',
      'GAR',
      'HIGH',
      'IN_PROGRESS',
      'POSTVENTA',
      'Ing. Pedro L.',
      18,
      'Inspección técnica de fisura en muro perimétrico bajo cobertura estructural de 120 meses',
      {
        contract: 'MS-2025-0210',
        firstResp: haceHoras(16),
        eje: 2,
      },
    ),
    crearTicketInicial(
      'AIN-000491',
      'AIN',
      'Lotes urbanos',
      'Teléfono',
      'Hernán Quispe Condori',
      '41902311',
      'Villa Sol · Etapa II · Mz. E Lt. 19',
      'CTA',
      'URGENT',
      'OPEN',
      'COBRANZA',
      'Iván Q.',
      4,
      'Solicita compromiso de pago fraccionado por 3 cuotas vencidas (Caso MOR-2026-0024)',
      {
        contract: 'VS-2024-0891',
        rayo: true,
        rayoMotivo: 'Evitar ejecución de cláusula resolutoria de 3 meses impagos',
      },
    ),
    crearTicketInicial(
      'ACI-000038',
      'ACI',
      'Servicios de ciudad',
      'Presencial / Caseta',
      'Junta de Propietarios Etapa II',
      '20608891201',
      'Villa Sol · Etapa II · Parque Central',
      'CIT',
      'URGENT',
      'OPEN',
      'ATC',
      null,
      3,
      'Luminaria solar caída en alameda central frente a Mz. C, requiere aseguramiento',
      {
        contract: 'VS-2025-0507',
        rayo: true,
        rayoMotivo: 'Seguridad peatonal en vía principal del proyecto',
      },
    ),
    crearTicketInicial(
      'AIN-000483',
      'AIN',
      'Vivienda',
      'Correo',
      'Luis Paredes Soto',
      '10984412',
      'Villa Sol · Etapa II · Mz. A Lt. 02',
      'QUE',
      'LOW',
      'PENDING_CUSTOMER',
      'ATC',
      'C. Rojas',
      24 * 4,
      'Queja por tiempo de espera en atención presencial de caseta comercial',
      { contract: 'VS-2025-0507' },
    ),
    crearTicketInicial(
      'AIN-000484',
      'AIN',
      'Lotes urbanos',
      'Teléfono',
      'Ana Torres Lazo',
      '46113309',
      'Villa Sol · Etapa II · Mz. D Lt. 09',
      'PED',
      'LOW',
      'RESOLVED',
      'ATC',
      'C. Rojas',
      30,
      'Solicita copia digital de contrato firmado y cronograma actualizado en PDF',
      { contract: 'VS-2025-0507', firstResp: haceHoras(29), resolvedAt: haceHoras(3) },
    ),
    crearTicketInicial(
      'ALT-001188',
      'ALT',
      'Lotes urbanos',
      'Presencial / Caseta',
      'Carmen Rojas Poma',
      '40391822',
      'Los Álamos de Carabayllo · Mz. B Lt. 11',
      'REC',
      'HIGH',
      'IN_COMMITTEE',
      'LEGAL',
      'Dra. P. Vílchez',
      24 * 12,
      'Disconformidad con penalidad aplicada en liquidación de resolución contractual',
      { contract: 'LA-2023-0117', conflict: true, eje: 3 },
    ),
    crearTicketInicial(
      'AUR-000315',
      'AUR',
      'Lotes urbanos',
      'WhatsApp',
      'Pedro Soto Salazar',
      '43892015',
      'Praderas de Lurín · Mz. G Lt. 18',
      'VIS',
      'MEDIUM',
      'IN_PROGRESS',
      'ADMINISTRACION',
      'Elena C.',
      14,
      'Coordinación de visita guiada de replanteo topográfico de linderos en campo',
      { contract: 'VS-2025-0507', firstResp: haceHoras(12) },
    ),
    crearTicketInicial(
      'AFN-000194',
      'AFN',
      'Lotes urbanos',
      'Correo',
      'Carlos Mendoza Ríos',
      '44190823',
      'Oasis de Ancón · Mz. D Lt. 09',
      'CTA',
      'LOW',
      'CLOSED',
      'COBRANZA',
      'R. Salazar',
      60,
      'Emisión de constancia de cancelación de cuota 24 y estado de cuenta anual',
      { contract: 'VS-2024-0412', firstResp: haceHoras(58), resolvedAt: haceHoras(10) },
    ),
    crearTicketInicial(
      'AIN-000495',
      'AIN',
      'Lotes urbanos',
      'Mi Portal',
      'Valeria Quispe Rojas',
      '44819203',
      'Villa Sol · Etapa II · Mz. C Lt. 14',
      'CTA',
      'MEDIUM',
      'OPEN',
      'ATC',
      'C. Rojas',
      8,
      'Consulta de acreditación de transferencia interbancaria CCI de cuota #16',
      { contract: 'VS-2025-0507', firstResp: haceHoras(6.5) },
    ),
    crearTicketInicial(
      'ADS-000219',
      'ADS',
      'Lotes urbanos',
      'WhatsApp',
      'Roberto Huamán Chávez',
      '41209844',
      'Mirador del Sur · Mz. A Lt. 05',
      'PED',
      'MEDIUM',
      'IN_PROGRESS',
      'ADMINISTRACION',
      'Elena C.',
      19,
      'Solicitud de actualización de estado civil y copropietario en adenda',
      { contract: 'MS-2025-0210', firstResp: haceHoras(17) },
    ),
    crearTicketInicial(
      'APV-000104',
      'APV',
      'Vivienda',
      'Teléfono',
      'Gladys Ccori Mamani',
      '43918274',
      'Residencial Brisas · Torre A 204',
      'GAR',
      'HIGH',
      'IN_PROGRESS',
      'POSTVENTA',
      'L. Ccahuana',
      11,
      'Revisión de presión de agua en terma y grifería de cocina bajo garantía de instalaciones',
      { contract: 'RB-2024-0318', firstResp: haceHoras(9.5), eje: 2 },
    ),
    crearTicketInicial(
      'AUR-000328',
      'AUR',
      'Lotes urbanos',
      'EntregaFest',
      'Miguel Ángel Salazar',
      '45019283',
      'Praderas de Lurín · Mz. E Lt. 12',
      'VIS',
      'LOW',
      'RESOLVED',
      'ATC',
      'C. Rojas',
      36,
      'Confirmación de asistencia familiar y validación de titularidad para EntregaFest',
      { contract: 'VS-2025-0507', firstResp: haceHoras(35), resolvedAt: haceHoras(12) },
    ),
  ];
}

export function crearAsientosLibroDemo(): AsientoLibro[] {
  return [
    {
      n: '0042',
      co: 'ALT',
      est: 'Oficina Carabayllo',
      ticket: 'ALT-001204',
      kind: 'RECLAMO',
      cli: 'Jorge Mamani Ccori',
      reg: haceHoras(24 * 9),
      amount: 'S/ 1,850.00',
      ext: false,
      resp: null,
      appeal: null,
      facts: 'Demora en entrega de minuta; cobro de gastos notariales no pactados.',
    },
    {
      n: '0017',
      co: 'AIN',
      est: 'Caseta Villa Sol II',
      ticket: 'AIN-000483',
      kind: 'QUEJA',
      cli: 'Luis Paredes Soto',
      reg: haceHoras(24 * 4),
      amount: null,
      ext: false,
      resp: null,
      appeal: null,
      facts: 'Demora en atención presencial en caseta.',
    },
    {
      n: '0039',
      co: 'ALT',
      est: 'Oficina Carabayllo',
      ticket: 'ALT-001188',
      kind: 'RECLAMO',
      cli: 'Carmen Rojas Poma',
      reg: haceHoras(24 * 26),
      amount: 'S/ 420.00',
      ext: true,
      resp: haceHoras(24 * 2),
      appeal: { to: 'INDECOPI', st: 'EN DESCARGOS LEGAL', caseNo: '0457-2026/ILN-PS0' },
      facts: 'Penalidad aplicada en liquidación de resolución de contrato.',
    },
  ];
}

export function crearCasosSgdDemo(): CasoSgd[] {
  return [
    {
      code: 'SGD-2026-000318',
      line: 'Cartas Notariales',
      cli: 'Jorge Mamani Ccori',
      pre: haceHoras(24 * 8),
      act: haceHoras(24 * 7),
      slaDays: 10,
      linked: 'ALT-001204',
      closeState: null,
    },
    {
      code: 'SGD-2026-000311',
      line: 'Indecopi',
      cli: 'Carmen Rojas Poma',
      pre: haceHoras(24 * 15),
      act: haceHoras(24 * 14),
      slaDays: 10,
      linked: 'ALT-001188',
      closeState: null,
    },
    {
      code: 'SGD-2026-000322',
      line: 'Legal Atiende',
      cli: 'Hernán Quispe Condori',
      pre: haceHoras(20),
      act: null,
      slaDays: 5,
      linked: 'AIN-000491',
      closeState: null,
    },
  ];
}

export function crearCasosMorosidadDemo(): CasoMorosidad[] {
  return [
    {
      id: 'MOR-2026-0019',
      contrato: 'LA-2023-0117',
      cliente: 'Jorge Mamani Ccori',
      proyecto: 'Los Álamos de Carabayllo · Etapa I',
      lote: 'Mz. F Lt. 03',
      cuotasImpagas: 3,
      montoMora: 'S/ 2,940.00',
      responsableProyecto: 'Ing. Roberto Castañeda',
      supervisor: 'Sup. Mirtha Delgado',
      alertaServicioEnviada: true,
      cartaProyectoEnviada: true,
      estado: 'NOTIFICADO_PROYECTO',
    },
    {
      id: 'MOR-2026-0024',
      contrato: 'VS-2024-0891',
      cliente: 'Hernán Quispe Condori',
      proyecto: 'Villa Sol · Etapa II',
      lote: 'Mz. E Lt. 19',
      cuotasImpagas: 3,
      montoMora: 'S/ 3,540.00',
      responsableProyecto: 'Arq. Claudia Mendoza',
      supervisor: 'Sup. Mirtha Delgado',
      alertaServicioEnviada: false,
      cartaProyectoEnviada: false,
      estado: 'DETECTADO',
    },
  ];
}

export function crearGarantiasDemo(): ReclamoGarantia[] {
  return [
    {
      id: 'GAR-0091',
      ticket: 'APV-000089',
      unit: 'Residencial Brisas · Torre B 402',
      type: 'Impermeabilización',
      handover: '2025-11-14',
      cov: 12,
      state: 'UNDER_REVIEW',
      insp: '2026-10-22',
    },
    {
      id: 'GAR-0092',
      ticket: 'APV-000412',
      unit: 'Mirador del Sur · Mz. C Lt. 21',
      type: 'Estructural',
      handover: '2026-09-20',
      cov: 120,
      state: 'UNDER_REVIEW',
      insp: '2026-10-22',
    },
    {
      id: 'GAR-0087',
      ticket: 'APV-000079',
      unit: 'Residencial Brisas · Torre A 101',
      type: 'Acabados',
      handover: '2024-03-02',
      cov: 12,
      state: 'REJECTED',
      insp: null,
    },
    {
      id: 'GAR-0085',
      ticket: 'APV-000077',
      unit: 'Residencial Brisas · Torre A 305',
      type: 'Estructural',
      handover: '2023-06-20',
      cov: 120,
      state: 'APPROVED',
      insp: '2026-09-02',
    },
  ];
}

export function crearAsistentesDemo(): AsistenteProyecto[] {
  return [
    {
      id: 'ING-01',
      nombre: 'Eddie Huamaní',
      dni: '72282555',
      proyecto: 'Villa Sol · Etapa II',
      lote: 'C-07',
      acompanantes: 2,
      hora: '09:15',
    },
    {
      id: 'ING-02',
      nombre: 'Lucía Paredes V.',
      dni: '00451277',
      proyecto: 'Mirador del Sur',
      lote: 'C-21',
      acompanantes: 1,
      hora: '09:40',
    },
    {
      id: 'ING-03',
      nombre: 'María Quispe Huamán',
      dni: '45218834',
      proyecto: 'Villa Sol · Etapa II',
      lote: 'C-14',
      acompanantes: 1,
      hora: '10:05',
    },
  ];
}

export function crearBusesDemo(): BusEntregaFest[] {
  return [
    {
      id: 'BUS-01',
      ruta: 'Lima Norte → Villa Sol II',
      paradero: 'MegaPlaza Independencia · Puerta 3',
      salida: '07:30',
      capacidad: 45,
      ocupados: 42,
      placa: 'B8T-951',
    },
    {
      id: 'BUS-02',
      ruta: 'Lima Centro → Villa Sol II',
      paradero: 'Campo de Marte · Av. De la Peruanidad',
      salida: '07:45',
      capacidad: 45,
      ocupados: 31,
      placa: 'C4M-712',
    },
    {
      id: 'BUS-03',
      ruta: 'Lima Sur → Mirador del Sur',
      paradero: 'Puente Atocongo · Vía Auxiliar',
      salida: '08:00',
      capacidad: 40,
      ocupados: 39,
      placa: 'F1K-209',
    },
  ];
}

export const GUIAS_SOLUCION: Readonly<Record<string, { readonly titulo: string; readonly pasos: readonly string[]; readonly plantillaIa: string }>> = {
  CTA: {
    titulo: 'Protocolo de conciliación de cuota pagada en agente o banca móvil',
    pasos: [
      '1. Verificar en Consulta 360 (nodo Cuotas / Motor de Consultas) si el abono figura en tránsito (< 24 h).',
      '2. Validar N.º de operación, fecha y RUC de la empresa recaudadora en el voucher adjunto.',
      '3. Si pertenece a otra razón social del grupo, derivar a Cobranza por competencia.',
    ],
    plantillaIa:
      'Estimada cliente, hemos verificado la operación N.º 88231 por su cuota en Villa Sol II (Lote C-14). Nuestro equipo de Cobranza ya registró la conciliación y su estado de cuenta se actualizará en Mi Portal dentro de las próximas 4 horas hábiles.',
  },
  REC: {
    titulo: 'Protocolo de atención de reclamo con señal de conflicto o carta notarial',
    pasos: [
      '1. Entregar de inmediato el número de asiento del Libro de Reclamaciones y confirmar el plazo de 15 días hábiles.',
      '2. No debatir interpretaciones contractuales ni prometer exoneraciones en primera línea.',
      '3. Completar el expediente documental (6/6) y ejecutar la derivación a Legal.',
    ],
    plantillaIa:
      'Estimado cliente, hemos registrado su solicitud bajo el asiento ALT-0042 y el ticket ALT-001204. Su caso ha sido priorizado con nuestro equipo especializado de Legal para remitirle respuesta formal documentada dentro del plazo de ley.',
  },
  GAR: {
    titulo: 'Protocolo de atención de garantía postventa con Acta de Entrega',
    pasos: [
      '1. Confirmar la fecha del Acta de Entrega y vigencia del rubro observado.',
      '2. Solicitar evidencia fotográfica en Mi Portal y agendar inspección técnica con Postventa.',
      '3. Emitir informe técnico de procedencia o improcedencia firmado.',
    ],
    plantillaIa:
      'Estimada propietaria, validamos que su unidad cuenta con garantía vigente. Hemos programado la visita de inspección técnica con el especialista de Postventa y le notificaremos el acta en Mi Portal.',
  },
};

export function crearDirectorioAtcDemo(): ColaboradorDirectorioAtc[] {
  return [
    {
      userId: 'USR-ATC-01',
      codigoEmpleado: 'EMP-ATC-104',
      gestor: 'C. Rojas',
      rol: 'Gestor ATC (Eje 1)',
      area: 'ATC',
      lider: 'Sup. Mirtha Delgado',
      disponible: true,
      cesadoEnDirectorio: false,
      actualizadoHace: 'En turno activo',
    },
    {
      userId: 'USR-ATC-02',
      codigoEmpleado: 'EMP-COB-218',
      gestor: 'R. Salazar',
      rol: 'Analista de Cobranza',
      area: 'COBRANZA',
      lider: 'Jefe Raúl Cárdenas',
      disponible: true,
      cesadoEnDirectorio: false,
      actualizadoHace: 'En turno activo',
    },
    {
      userId: 'USR-ATC-03',
      codigoEmpleado: 'EMP-LEG-309',
      gestor: 'Dra. P. Vílchez',
      rol: 'Especialista Legal Eje 3',
      area: 'LEGAL',
      lider: 'Dr. Ernesto Alarcón (Gerencia Legal)',
      disponible: true,
      cesadoEnDirectorio: false,
      actualizadoHace: 'En turno activo',
    },
    {
      userId: 'USR-ATC-04',
      codigoEmpleado: 'EMP-PVT-412',
      gestor: 'L. Ccahuana',
      rol: 'Especialista Postventa',
      area: 'POSTVENTA',
      lider: 'Ing. Roberto Castañeda',
      disponible: true,
      cesadoEnDirectorio: false,
      actualizadoHace: 'En campo / Inspección',
    },
    {
      userId: 'USR-ATC-05',
      codigoEmpleado: 'EMP-ATC-089',
      gestor: 'M. Quispe (Rotación)',
      rol: 'Gestor ATC (Eje 1)',
      area: 'ATC',
      lider: 'Sup. Mirtha Delgado',
      disponible: false,
      cesadoEnDirectorio: true,
      actualizadoHace: 'Cartera pendiente de reasignación',
    },
  ];
}

export const CATALOGO_60_HUS: readonly HuReferencia[] = [
  { id: 'HU-ATC-001', titulo: 'Registrar tickets multicanal tipificados', feature: 'FT-ATC-01', vista: 'nuevo', pantalla: 'P-02 Nuevo ticket', etapa: 'Etapa 1' },
  { id: 'HU-ATC-002', titulo: 'Entregar N.º correlativo por razón social', feature: 'FT-ATC-01', vista: 'detalle', pantalla: 'P-03 Detalle de ticket', etapa: 'Etapa 1' },
  { id: 'HU-ATC-003', titulo: 'Congelar SLA al abrir en horas hábiles', feature: 'FT-ATC-04', vista: 'nuevo', pantalla: 'P-02 / Matriz SLA', etapa: 'Etapa 1' },
  { id: 'HU-ATC-004', titulo: 'Gestionar ciclo de vida del ticket', feature: 'FT-ATC-02', vista: 'detalle', pantalla: 'P-03 Detalle de ticket', etapa: 'Etapa 1' },
  { id: 'HU-ATC-005', titulo: 'Registrar interacciones con visibilidad controlada', feature: 'FT-ATC-02', vista: 'detalle', pantalla: 'P-03 Detalle de ticket', etapa: 'Etapa 1' },
  { id: 'HU-ATC-006', titulo: 'Conservar hitos temporales probatorios', feature: 'FT-ATC-02', vista: 'detalle', pantalla: 'P-03 Detalle de ticket', etapa: 'Etapa 1' },
  { id: 'HU-ATC-007', titulo: 'Derivar entre áreas con log auditable append-only', feature: 'FT-ATC-03', vista: 'detalle', pantalla: 'P-03 Modal Derivar', etapa: 'Etapa 1' },
  { id: 'HU-ATC-008', titulo: 'Reasignar masivamente al cesar o rotar colaborador', feature: 'FT-ATC-03', vista: 'reasignar', pantalla: 'P-01 / Reasignación', etapa: 'Etapa 1' },
  { id: 'HU-ATC-009', titulo: 'Casillero de tareas por consulta y área', feature: 'FT-ATC-03', vista: 'bandeja', pantalla: 'P-01 Bandeja de tickets', etapa: 'Etapa 1' },
  { id: 'HU-ATC-010', titulo: 'Alertar incumplimientos de SLA comercial', feature: 'FT-ATC-04', vista: 'alertas', pantalla: 'Alertas SLA / Bandeja', etapa: 'Etapa 1' },
  { id: 'HU-ATC-011', titulo: 'Reabrir con nuevo compromiso sin borrar original', feature: 'FT-ATC-04', vista: 'detalle', pantalla: 'P-03 Detalle de ticket', etapa: 'Etapa 1' },
  { id: 'HU-ATC-012', titulo: 'Registrar asiento en Libro como extensión de ticket', feature: 'FT-ATC-05', vista: 'libro', pantalla: 'P-04 Libro de Reclamaciones', etapa: 'Etapa 1' },
  { id: 'HU-ATC-013', titulo: 'Computar plazo legal 15 d y prórroga única', feature: 'FT-ATC-05', vista: 'libro', pantalla: 'P-04 Libro de Reclamaciones', etapa: 'Etapa 1' },
  { id: 'HU-ATC-014', titulo: 'Registrar respuesta formal con carta y cargo', feature: 'FT-ATC-05', vista: 'libro', pantalla: 'P-04 Libro de Reclamaciones', etapa: 'Etapa 1' },
  { id: 'HU-ATC-015', titulo: 'Vigilar plazo legal y detectar reclamos huérfanos', feature: 'FT-ATC-05', vista: 'libro', pantalla: 'P-04 Libro de Reclamaciones', etapa: 'Etapa 1' },
  { id: 'HU-ATC-016', titulo: 'Gestionar apelaciones internas e INDECOPI', feature: 'FT-ATC-06', vista: 'libro', pantalla: 'P-05 Apelaciones', etapa: 'Etapa 1' },
  { id: 'HU-ATC-019', titulo: 'Disparar encuesta al cierre y medir CSAT/CES', feature: 'FT-ATC-13', vista: 'cierre', pantalla: 'P-08 Post-cierre y CSAT / P-17 Mi Portal', etapa: 'Etapa 1' },
  { id: 'HU-ATC-020', titulo: 'Registro multilínea con código único de caso SGD', feature: 'FT-ATC-08', vista: 'sgd', pantalla: 'P-06 Mesa de Casos SGD', etapa: 'Etapa 1' },
  { id: 'HU-ATC-021', titulo: 'Separar cargo previo y cargo de activación', feature: 'FT-ATC-08', vista: 'sgd', pantalla: 'P-06 Mesa de Casos SGD', etapa: 'Etapa 1' },
  { id: 'HU-ATC-022', titulo: 'Clasificación de riesgo con matriz objetiva', feature: 'FT-ATC-08', vista: 'sgd', pantalla: 'P-06 Mesa de Casos SGD', etapa: 'Etapa 1' },
  { id: 'HU-ATC-023', titulo: 'Escalamiento en cadena por incumplimiento SLA', feature: 'FT-ATC-09', vista: 'sgd', pantalla: 'P-06 / Sala de Comité 3D', etapa: 'Etapa 1' },
  { id: 'HU-ATC-024', titulo: 'Validación de casos cruzados y vinculados', feature: 'FT-ATC-09', vista: 'sgd', pantalla: 'P-06 Mesa de Casos SGD', etapa: 'Etapa 1' },
  { id: 'HU-ATC-025', titulo: 'Cierre tipificado con evidencia y custodia GLI', feature: 'FT-ATC-09', vista: 'sgd', pantalla: 'P-06 Mesa de Casos SGD', etapa: 'Etapa 1' },
  { id: 'HU-ATC-026', titulo: 'Gate de derivación obligatoria a Eje 3 Legal', feature: 'FT-ATC-07', vista: 'detalle', pantalla: 'P-02 / P-03 Gate Eje 3', etapa: 'Etapa 1' },
  { id: 'HU-ATC-027', titulo: 'Paquete mínimo 6/6 de handoff y confirmación', feature: 'FT-ATC-07', vista: 'detalle', pantalla: 'P-03 Modal Handoff 6/6', etapa: 'Etapa 1' },
  { id: 'HU-ATC-028', titulo: 'Nota de estado emocional sin juicios de valor', feature: 'FT-ATC-07', vista: 'detalle', pantalla: 'P-03 Detalle de ticket', etapa: 'Etapa 1' },
  { id: 'HU-ATC-029', titulo: 'SLA de cierre end-to-end 72 h de experiencia', feature: 'FT-ATC-14', vista: 'torre', pantalla: 'P-08 Torre de Control CX', etapa: 'Etapa 1' },
  { id: 'HU-ATC-030', titulo: 'Monitoreo en tiempo real y corrección preventiva', feature: 'FT-ATC-14', vista: 'torre', pantalla: 'P-08 Torre de Control CX', etapa: 'Etapa 1' },
  { id: 'HU-ATC-031', titulo: 'Informes diario operativo y quincenal analítico', feature: 'FT-ATC-14', vista: 'torre', pantalla: 'P-08 Torre de Control CX', etapa: 'Etapa 1' },
  { id: 'HU-ATC-032', titulo: 'Prevención de registros paralelos del cliente', feature: 'FT-ATC-01', vista: 'c360', pantalla: 'P-10 / P-08 Auditoría SIGDA', etapa: 'Etapa 1' },
  { id: 'HU-ATC-033', titulo: 'Registro de reclamo de garantía vinculado a entrega', feature: 'FT-ATC-10', vista: 'garantias', pantalla: 'P-07 Garantías postventa', etapa: 'Etapa 1' },
  { id: 'HU-ATC-034', titulo: 'Validación de vigencia y periodo de cobertura', feature: 'FT-ATC-10', vista: 'garantias', pantalla: 'P-07 Garantías postventa', etapa: 'Etapa 1' },
  { id: 'HU-ATC-035', titulo: 'Inspección técnica y resolución de reclamo', feature: 'FT-ATC-10', vista: 'garantias', pantalla: 'P-07 Garantías postventa', etapa: 'Etapa 1' },
  { id: 'HU-ATC-036', titulo: 'Escalamiento a Eje 3 y reincorporación contractual', feature: 'FT-ATC-10', vista: 'garantias', pantalla: 'P-07 Garantías postventa', etapa: 'Etapa 1' },
  { id: 'HU-ATC-037', titulo: 'Clasificación de riesgo verbal y Frases Ancla', feature: 'FT-ATC-15', vista: 'evento', pantalla: 'P-09 EntregaFest en vivo', etapa: 'Etapa 1' },
  { id: 'HU-ATC-038', titulo: 'Derivación inmediata a Estación 4 sin debate', feature: 'FT-ATC-15', vista: 'evento', pantalla: 'P-09 EntregaFest en vivo', etapa: 'Etapa 1' },
  { id: 'HU-ATC-039', titulo: 'Registro de caso del evento con etiqueta estándar', feature: 'FT-ATC-15', vista: 'evento', pantalla: 'P-09 EntregaFest en vivo', etapa: 'Etapa 1' },
  { id: 'HU-ATC-040', titulo: 'Integrar el ticket con la herramienta de Legal', feature: 'FT-ATC-16', vista: 'detalle', pantalla: 'P-03 Sincronización Legal', etapa: 'Etapa 1' },
  { id: 'HU-ATC-041', titulo: 'Prevenir que un reclamo llegue a denuncia (+8%)', feature: 'FT-ATC-16', vista: 'torre', pantalla: 'P-08 Radar Prevención Legal', etapa: 'Etapa 1' },
  { id: 'HU-ATC-042', titulo: 'Integrar con la plataforma de call center (CTI)', feature: 'FT-ATC-17', vista: 'bandeja', pantalla: 'P-16 Llamada entrante CTI', etapa: 'Etapa 1' },
  { id: 'HU-ATC-043', titulo: 'Configurar flujos de trabajo de tickets por área', feature: 'FT-ATC-18', vista: 'workflow', pantalla: 'P-12 Configurador de flujos', etapa: 'Etapa 1' },
  { id: 'HU-ATC-044', titulo: 'Bandeja orquestadora multicanal de tickets', feature: 'FT-ATC-18', vista: 'vivo', pantalla: 'Operación en vivo 3D / P-01', etapa: 'Etapa 1' },
  { id: 'HU-ATC-045', titulo: 'Marcar un ticket con el rayo de prioridad', feature: 'FT-ATC-18', vista: 'bandeja', pantalla: 'Operación en vivo 3D / P-01', etapa: 'Etapa 1' },
  { id: 'HU-ATC-046', titulo: 'Reasignar automáticamente al agente con menos carga', feature: 'FT-ATC-18', vista: 'reasignar', pantalla: 'Operación en vivo 3D / Reasignación', etapa: 'Etapa 1' },
  { id: 'HU-ATC-047', titulo: 'Guía de solución paso a paso por tipo de ticket', feature: 'FT-ATC-19', vista: 'detalle', pantalla: 'P-13 Guía y asistente IA', etapa: 'Etapa 1' },
  { id: 'HU-ATC-048', titulo: 'Retroalimentación con IA al agente de atención', feature: 'FT-ATC-19', vista: 'detalle', pantalla: 'P-13 Guía y asistente IA', etapa: 'Etapa 1' },
  { id: 'HU-ATC-049', titulo: 'Buscar al cliente y llamarlo desde su ficha', feature: 'FT-ATC-20', vista: 'c360', pantalla: 'P-10 Buscador y Click-to-Call', etapa: 'Etapa 1' },
  { id: 'HU-ATC-050', titulo: 'Ver la consulta 360 del cliente (Red ASTRA)', feature: 'FT-ATC-20', vista: 'c360', pantalla: 'P-11 Consulta 360 ASTRA', etapa: 'Etapa 1' },
  { id: 'HU-ATC-051', titulo: 'Continuar la atención cuando la consulta falla', feature: 'FT-ATC-20', vista: 'c360', pantalla: 'P-10 / P-18 Contingencia', etapa: 'Etapa 1' },
  { id: 'HU-ATC-052', titulo: 'Reutilizar el motor de consultas en línea', feature: 'FT-ATC-20', vista: 'c360', pantalla: 'P-11 Nodo Motor de Consultas', etapa: 'Etapa 1' },
  { id: 'HU-ATC-053', titulo: 'Buscar documentos del cliente por significado (IA)', feature: 'FT-ATC-20', vista: 'c360', pantalla: 'P-10 Búsqueda semántica IA', etapa: 'Etapa 1' },
  { id: 'HU-ATC-054', titulo: 'Ver mi avance diario y el de mi equipo', feature: 'FT-ATC-21', vista: 'tudia', pantalla: 'P-14 Tablero Tu Día', etapa: 'Etapa 1' },
  { id: 'HU-ATC-055', titulo: 'Alertar por correo la asignación con copia al líder', feature: 'FT-ATC-21', vista: 'tudia', pantalla: 'P-15 Correo de asignación', etapa: 'Etapa 1' },
  { id: 'HU-ATC-056', titulo: 'Generar caso de resolución por 3 meses impagos', feature: 'FT-ATC-22', vista: 'morosidad', pantalla: 'Mesa de Morosidad / SGD', etapa: 'Etapa 1' },
  { id: 'HU-ATC-057', titulo: 'Enviar en paralelo alerta de cancelación de servicio', feature: 'FT-ATC-22', vista: 'morosidad', pantalla: 'Mesa de Morosidad / SGD', etapa: 'Etapa 1' },
  { id: 'HU-ATC-058', titulo: 'Carta de alerta al responsable del proyecto (cc sup.)', feature: 'FT-ATC-22', vista: 'morosidad', pantalla: 'Mesa de Morosidad / SGD', etapa: 'Etapa 1' },
  { id: 'HU-ATC-059', titulo: 'Registrar ingreso de personas a proyecto (simple)', feature: 'FT-ATC-23', vista: 'ingreso', pantalla: 'Control de ingreso en proyecto', etapa: 'Etapa 1' },
  { id: 'HU-ATC-060', titulo: 'Gestionar los buses y cupos de EntregaFest', feature: 'FT-ATC-23', vista: 'buses', pantalla: 'Logística Buses EntregaFest', etapa: 'Etapa 1' },
  { id: 'HU-ATC-064', titulo: 'Cambiar mi estado de disponibilidad y reasignar por ausencia', feature: 'FT-ATC-03', vista: 'reasignar', pantalla: 'Reasignación y disponibilidad', etapa: 'Etapa 1' },
  { id: 'HU-ATC-065', titulo: 'Configurar políticas de SLA por empresa, tipo y prioridad', feature: 'FT-ATC-04', vista: 'politicas', pantalla: 'Políticas SLA', etapa: 'Etapa 1' },
  { id: 'HU-ATC-066', titulo: 'Publicar guías de solución y atender alertas de falta de guía', feature: 'FT-ATC-19', vista: 'workflow', pantalla: 'Workflow y Guías de Solución', etapa: 'Etapa 1' },
  { id: 'HU-ATC-067', titulo: 'Auditar sugerencias de IA y ver el informe semanal de causas raíz', feature: 'FT-ATC-13', vista: 'cierre', pantalla: 'Post-cierre, CSAT y Auditoría IA', etapa: 'Etapa 1' },
];
