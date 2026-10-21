import { Injectable, computed, signal } from '@angular/core';
import {
  AHORA_BASE,
  EMPRESAS_AYBAR,
  TIPOS_TICKET,
  diasHabilesEntre,
  fmtFecha,
  fmtFechaHora,
  haceHoras,
  sumarDiasHabiles,
  sumarHorasHabiles,
  type TicketAtc,
  type VistaAtc,
} from './datos-atc';

export type RolPrototipoAtc =
  | 'GESTOR'
  | 'COLABORADOR'
  | 'SUPERVISOR'
  | 'COORDINADOR_CX'
  | 'LEGAL_RECLAMOS'
  | 'MESA_SGD'
  | 'MODERADOR_EVENTO'
  | 'ADMIN_FUNCIONAL'
  | 'CONTROL_ACCESO'
  | 'CLIENTE'
  | 'SIN_ATENCION';

export interface PerfilRolPrototipoAtc {
  readonly id: RolPrototipoAtc;
  readonly personaId: string;
  readonly usuario: string;
  readonly clave: string;
  readonly nombre: string;
  readonly cargo: string;
  readonly area: string;
  readonly rol360: 'gestor' | 'supervisor' | 'legal' | 'cx';
  readonly nodoInicial360: string;
  readonly vistaPrincipal: VistaAtc;
  readonly resumenPerspectiva: string;
}

export interface PasoFlujoConfig {
  nombre: string;
  responsable: string;
  horas: number;
}

export interface VersionFlujoConfig {
  readonly version: number;
  readonly fecha: Date;
  readonly autor: string;
  readonly area: string;
  readonly pasos: readonly PasoFlujoConfig[];
}

export interface FlujoTipoConfig {
  readonly tipo: string;
  readonly nombreTipo: string;
  versionActual: number;
  area: string;
  pasos: PasoFlujoConfig[];
  historial: VersionFlujoConfig[];
}

export interface VersionGuiaConfig {
  readonly version: number;
  readonly fecha: Date;
  readonly autor: string;
  readonly pasos: readonly string[];
  readonly plantillas: readonly string[];
  readonly criterios: readonly string[];
}

export interface GuiaTipoConfig {
  readonly tipo: string;
  readonly nombreTipo: string;
  versionActual: number | null;
  pasos: string[];
  plantillas: string[];
  criterios: string[];
  historial: VersionGuiaConfig[];
}

export interface AlertaAdminConfig {
  readonly id: string;
  readonly fecha: Date;
  readonly codigo: 'GUIA_FALTANTE' | 'POLITICA_FALTANTE' | 'PROYECTO_SIN_RESPONSABLE';
  readonly etiqueta: string;
  readonly tipoTicket: string | null;
  readonly detalle: string;
}

export interface PoliticaSlaConfig {
  readonly id: string;
  readonly alcance: 'especifica' | 'generica' | 'global';
  readonly tipo: string | null;
  readonly prioridad: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | null;
  respuestaH: number;
  resolucionH: number;
  version: number;
  actualizada: Date;
  autor: string;
}

export interface AlertaSlaItem {
  readonly id: string;
  readonly ticketNum: string;
  readonly tipo:
    | 'FIRST_RESPONSE_AT_RISK'
    | 'FIRST_RESPONSE_BREACHED'
    | 'RESOLUTION_AT_RISK'
    | 'RESOLUTION_BREACHED';
  readonly ciclo: number;
  readonly vencimientoEvaluado: Date;
  readonly fecha: Date;
  readonly destinatario: string;
  readonly canal: string;
}

export interface CorridaJobSla {
  readonly id: string;
  readonly fecha: Date;
  readonly revisados: number;
  readonly nuevasAlertas: number;
}

export interface ColaboradorCargaAtc {
  readonly id: string;
  readonly nombre: string;
  readonly area: string;
  readonly rol: string;
  readonly lider: string;
  readonly correo: string;
}

export interface LlamadaUrbeMindItem {
  readonly id: string;
  readonly fecha: Date;
  readonly operacion: string;
  readonly llamante: string;
  readonly alcance: string;
  readonly estadoHttp: number;
  readonly detalle: string;
}

export interface EventoUrbeMindItem {
  readonly id: string;
  readonly fecha: Date;
  readonly tipo:
    | 'ticket.created'
    | 'ticket.InteractionAdded'
    | 'ticket.statusChanged'
    | 'ticket.assigned'
    | 'ticket.closed';
  readonly ticketNum: string;
  estado: 'ENTREGADO' | 'PENDIENTE_REINTENTO';
  intentos: number;
  error: string | null;
}

export interface EncuestaCxItem {
  readonly id: string;
  readonly ticketNum: string;
  readonly fecha: Date;
  readonly tipoTicket: string;
  readonly area: string;
  readonly gestor: string;
  readonly resultadoCierre: 'Resuelto en 1.er contacto' | 'Resuelto tras seguimiento' | 'Escalado Eje 3';
  readonly csat: number;
  readonly ces: number;
  readonly nps: number;
  readonly comentario: string;
}

export interface InformeCxItem {
  readonly id: string;
  readonly periodo: 'SEMANAL' | 'MENSUAL';
  readonly generado: Date;
  readonly autor: string;
  readonly total: number;
  readonly cumplimientoRespuesta: number;
  readonly cumplimientoResolucion: number;
  readonly csatPromedio: number;
  readonly nps: number;
  readonly principalesCausas: readonly { tipo: string; cantidad: number }[];
}

export interface DecisionIaAuditItem {
  readonly id: string;
  readonly fecha: Date;
  readonly ticketNum: string;
  readonly decision: 'ACEPTADA' | 'EDITADA' | 'DESCARTADA';
  readonly anonimizados: number;
  readonly autor: string;
}

export interface ConsultaExternaAuditItem {
  readonly id: string;
  readonly fecha: Date;
  readonly fuente: string;
  readonly motivo: string;
  readonly bloqueados: number;
  readonly autor: string;
}

export interface CasoEventoFestItem {
  readonly id: string;
  readonly ticketNum: string;
  readonly cliente: string;
  readonly dni: string;
  readonly proyecto: string;
  readonly categoria: 'DOCUMENTACION' | 'CRONOGRAMA' | 'ENTREGA' | 'LEGAL_CONFLICTO';
  readonly criticidad: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
  readonly resumen: string;
  readonly imputacionPenal: boolean;
  readonly registrado: Date;
  primeraAtencion: Date | null;
  estacion4: { fecha: Date; motivo: string; autor: string } | null;
}

export interface BusFestConfig {
  readonly id: string;
  readonly nombre: string;
  readonly horario: string;
  readonly aforo: number;
}

export interface ReservaBusFestItem {
  readonly id: string;
  readonly clienteId: string;
  readonly clienteNombre: string;
  readonly busId: string;
  readonly punto: string;
  readonly acompanantes: number;
  estado: 'CONFIRMADA' | 'EN_ESPERA' | 'CANCELADA';
  readonly ticketNum: string;
  readonly fecha: Date;
}

export interface CasoResolucionMoraDetalle {
  readonly id: string;
  readonly ticketNum: string;
  readonly clienteNombre: string;
  readonly dni: string;
  readonly proyecto: string;
  readonly lote: string;
  readonly contrato: string;
  readonly cuotasImpagas: number;
  readonly deuda: number;
  estado: 'ABIERTO' | 'SUSPENDIDO' | 'REGULARIZADO';
  readonly abierto: Date;
  readonly prevista: Date;
  carta: {
    para: string;
    cc: string;
    fecha: Date;
    vence: Date;
    sinResponsable: boolean;
    escalada: Date | null;
    accion: { nota: string; autor: string; fecha: Date } | null;
    texto: string;
  };
  constancias: {
    id: string;
    fecha: Date;
    canal: string;
    reintento: boolean;
    resultado: 'ENTREGADO' | 'FALLIDO';
  }[];
  historial: {
    id: string;
    fecha: Date;
    estado: string;
    nota: string;
    autor: string;
  }[];
}

export interface AsientoLibroDetalle {
  readonly id: string;
  readonly codigo: string;
  readonly empresaId: string;
  readonly establecimiento: string;
  readonly ticketNum: string;
  readonly tipo: 'RECLAMO' | 'QUEJA';
  readonly consumidor: string;
  readonly dni: string;
  readonly registrado: Date;
  readonly registradoPor: string;
  readonly venceOriginal: Date;
  venceProrrogado: Date | null;
  readonly hechos: string;
  readonly pedido: string;
  readonly monto: number | null;
  readonly moneda: 'PEN' | 'USD' | null;
  prorroga: {
    justificacion: string;
    canal: string;
    fechaComunicacion: Date;
    cargoNombre: string;
    sha256: string;
  } | null;
  respuesta: {
    fecha: Date;
    diasHabilesUsados: number;
    resumen: string;
    firmante: string;
    cartaNombre: string;
    cartaSha256: string;
    cargoNombre: string;
    cargoSha256: string;
    derechoIndecopi: boolean;
  } | null;
  apelaciones: {
    id: string;
    instancia: 'INTERNA' | 'INDECOPI';
    numeroCaso: string | null;
    presentada: Date;
    estado: 'PENDING' | 'UNDER_REVIEW' | 'RESOLVED_FOUNDED' | 'RESOLVED_UNFOUNDED' | 'WITHDRAWN';
    resolucion: { fecha: Date; resumen: string } | null;
    historial: { fecha: Date; cambio: string; autor: string; nota: string }[];
  }[];
  historialPlazo: {
    id: string;
    fecha: Date;
    evento: 'PLAZO_ORIGINAL' | 'PRORROGA' | 'RESPUESTA';
    detalle: string;
    autor: string;
  }[];
}

export interface ActaEntregaGarantia {
  readonly id: string;
  readonly unidad: string;
  readonly clienteNombre: string;
  readonly dni: string;
  readonly entregada: Date;
}

export interface ReclamoGarantiaDetalle {
  readonly id: string;
  readonly codigo: string;
  readonly entregaId: string;
  readonly ticketNum: string | null;
  readonly tipo: 'ESTRUCTURAL' | 'IMPERMEABILIZACION' | 'ACABADOS' | 'INSTALACIONES';
  readonly reclamada: Date;
  readonly registradoPor: string;
  readonly descripcion: string;
  estado: 'UNDER_REVIEW' | 'NOT_ELIGIBLE' | 'APPROVED' | 'REJECTED' | 'RESOLVED';
  motivoNoProcede: string | null;
  inspeccion: {
    programada: Date;
    registrada: boolean;
    informe: string | null;
    evidenciaNombre: string | null;
  } | null;
  resolucion: {
    fecha: Date;
    autor: string;
    descripcion: string;
  } | null;
  adenda: {
    fecha: Date;
    autor: string;
    motivo: string;
    documentoNombre: string;
  } | null;
  trazabilidad: {
    id: string;
    fecha: Date;
    evento: string;
    detalle: string;
    autor: string;
  }[];
}

export interface CasoSgdDetalle {
  readonly id: string;
  readonly codigo: string;
  readonly linea: 'MESA_PARTES' | 'INDECOPI_LEGAL' | 'FISCALIA_PENAL' | 'PRENSA_REDES' | 'LEGAL_ATIENDE';
  readonly clienteNombre: string;
  readonly dni: string;
  readonly ticketNum: string | null;
  readonly resumen: string;
  readonly registrado: Date;
  readonly autor: string;
  estado: 'REGISTRADO' | 'ACTIVO' | 'VINCULADO' | 'RECLASIFICADO' | 'CERRADO';
  vinculadoACodigo: string | null;
  origenCodigo: string | null;
  justificacionIndependiente: string | null;
  cargoPrevio: { fecha: Date; autor: string } | null;
  activacion: { fecha: Date; autor: string } | null;
  venceSla: Date | null;
  riesgo: {
    criterios: string[];
    puntaje: number;
    nivel: 'BAJO' | 'MEDIO' | 'ALTO' | 'MUY_ALTO';
  } | null;
  nivelEscalamiento: number;
  evidencias: {
    id: string;
    fecha: Date;
    autor: string;
    descripcion: string;
    documentoNombre: string | null;
    gli: string | null;
  }[];
  cierre: {
    estado: string;
    fecha: Date;
    autor: string;
    evidenciaNombre: string;
    gli: string | null;
    nota: string;
  } | null;
  trazabilidad: {
    id: string;
    fecha: Date;
    evento: string;
    detalle: string;
    autor: string;
  }[];
}

export const ROLES_PROTOTIPO_ATC: readonly PerfilRolPrototipoAtc[] = [
  {
    id: 'GESTOR',
    personaId: 'p-lucia',
    usuario: 'gestor',
    clave: 'demo-gestor',
    nombre: 'Lucía Benavides',
    cargo: 'Gestor de tickets (ATC)',
    area: 'ATC',
    rol360: 'gestor',
    nodoInicial360: 'lote',
    vistaPrincipal: 'bandeja',
    resumenPerspectiva:
      'Atención multicanal en Eje 1/2, Consulta 360 estándar, Bandeja de tickets, Tu Día, Nuevo ticket, Libro de Reclamaciones, Garantías e Integración UrbeMind.',
  },
  {
    id: 'COLABORADOR',
    personaId: 'p-diego',
    usuario: 'colaborador',
    clave: 'demo-colaborador',
    nombre: 'Diego Salazar',
    cargo: 'Colaborador de área (Cobranza)',
    area: 'COBRANZA',
    rol360: 'gestor',
    nodoInicial360: 'cuotas',
    vistaPrincipal: 'bandeja',
    resumenPerspectiva:
      'Resolución de tickets derivados a Cobranza, conciliación de vouchers, Tu Día, Resolución por morosidad, Libro, Garantías e Integración UrbeMind.',
  },
  {
    id: 'SUPERVISOR',
    personaId: 'p-gabriela',
    usuario: 'supervisor',
    clave: 'demo-supervisor',
    nombre: 'Gabriela Núñez',
    cargo: 'Supervisor ATC',
    area: 'ATC',
    rol360: 'supervisor',
    nodoInicial360: 'ecta',
    vistaPrincipal: 'vivo',
    resumenPerspectiva:
      'Supervisión integral de Operación y Supervisión: Reasignar en bloque, Alertas SLA, Cierre end-to-end, Políticas SLA, prioridad Rayo y Torre de Control CX.',
  },
  {
    id: 'COORDINADOR_CX',
    personaId: 'p-valeria',
    usuario: 'cx',
    clave: 'demo-cx',
    nombre: 'Valeria Paredes',
    cargo: 'Coordinador CX',
    area: 'CX',
    rol360: 'cx',
    nodoInicial360: 'tick',
    vistaPrincipal: 'torre',
    resumenPerspectiva:
      'Torre de Control CX, Cierre end-to-end (72 h), Alertas SLA, EntregaFest en vivo, Buses del Entrega Fest, Resolución por morosidad y Libro en modo consulta.',
  },
  {
    id: 'LEGAL_RECLAMOS',
    personaId: 'p-patricia',
    usuario: 'legal',
    clave: 'demo-legal',
    nombre: 'Patricia Vílchez',
    cargo: 'Responsable legal de reclamos',
    area: 'LEGAL',
    rol360: 'legal',
    nodoInicial360: 'expo',
    vistaPrincipal: 'libro',
    resumenPerspectiva:
      'Gestión formal del Libro de Reclamaciones (prórrogas, respuestas con cargo e INDECOPI), recepción de Handoff 6/6 en Eje 3, Resolución por morosidad y Mesa SGD.',
  },
  {
    id: 'MESA_SGD',
    personaId: 'p-rocio',
    usuario: 'sgd',
    clave: 'demo-sgd',
    nombre: 'Rocío Castillo',
    cargo: 'Mesa de Casos SGD',
    area: 'LEGAL',
    rol360: 'legal',
    nodoInicial360: 'expo',
    vistaPrincipal: 'sgd',
    resumenPerspectiva:
      'Operación exclusiva de la Mesa de Casos Sensibles SGD: cinco líneas de ingreso, cargo previo vs. activación, matriz de riesgo, hilo de evidencia y custodia GLI.',
  },
  {
    id: 'MODERADOR_EVENTO',
    personaId: 'p-sebastian',
    usuario: 'moderador',
    clave: 'demo-moderador',
    nombre: 'Sebastián Moreno',
    cargo: 'Moderador de evento',
    area: 'CX',
    rol360: 'cx',
    nodoInicial360: 'acta',
    vistaPrincipal: 'evento',
    resumenPerspectiva:
      'Moderación presencial de EntregaFest en vivo (6 frases ancla y derivación inmediata a Estación 4 Legal) y control de Buses del Entrega Fest.',
  },
  {
    id: 'ADMIN_FUNCIONAL',
    personaId: 'p-alonso',
    usuario: 'admin',
    clave: 'demo-admin',
    nombre: 'Alonso Pérez',
    cargo: 'Administrador funcional',
    area: 'ADMINISTRACION',
    rol360: 'supervisor',
    nodoInicial360: 'contrato',
    vistaPrincipal: 'configuracion',
    resumenPerspectiva:
      'Gobierno de Configuración: versionado de Flujos de atención por tipo de ticket, publicación de Guías de solución e inspección de Alertas de configuración.',
  },
  {
    id: 'CONTROL_ACCESO',
    personaId: 'p-gustavo',
    usuario: 'garita',
    clave: 'demo-garita',
    nombre: 'Gustavo Huamán',
    cargo: 'Control de acceso (garita)',
    area: 'ADMINISTRACION',
    rol360: 'gestor',
    nodoInicial360: 'lote',
    vistaPrincipal: 'ingreso',
    resumenPerspectiva:
      'Vista dedicada de garita para registrar cada Ingreso a proyecto (con soporte sin conexión en celular) y avisar al responsable del proyecto.',
  },
  {
    id: 'CLIENTE',
    personaId: 'cli-001',
    usuario: 'cliente',
    clave: 'demo-cliente',
    nombre: 'Cliente convocado (Mi Portal)',
    cargo: 'Cliente convocado · Mi Portal',
    area: 'CLIENTE',
    rol360: 'gestor',
    nodoInicial360: 'lote',
    vistaPrincipal: 'buses',
    resumenPerspectiva:
      'Experiencia de autogestión en Mi Portal para reservar cupo con acompañantes en los Buses del Entrega Fest o anotarse en lista de espera.',
  },
  {
    id: 'SIN_ATENCION',
    personaId: 'p-sin',
    usuario: 'sin-atencion',
    clave: 'demo-sin',
    nombre: 'Rol sin atención (prueba 403)',
    cargo: 'Rol sin permisos de atención',
    area: 'ADMINISTRACION',
    rol360: 'gestor',
    nodoInicial360: 'kyc',
    vistaPrincipal: 'bandeja',
    resumenPerspectiva:
      'Rol de prueba para verificar el bloqueo 403 Restringido y el registro en auditoría cuando un usuario sin permisos intenta operar tickets.',
  },
];

@Injectable({ providedIn: 'root' })
export class EstadoPrototipoAtcService {
  readonly rolActivo = signal<RolPrototipoAtc>('GESTOR');

  readonly perfilActivo = computed<PerfilRolPrototipoAtc>(
    () => ROLES_PROTOTIPO_ATC.find((r) => r.id === this.rolActivo()) ?? ROLES_PROTOTIPO_ATC[0],
  );

  readonly colaboradores: readonly ColaboradorCargaAtc[] = [
    {
      id: 'p-lucia',
      nombre: 'Lucía Benavides',
      area: 'ATC',
      rol: 'Gestora de tickets',
      lider: 'Gabriela Núñez',
      correo: 'lucia.benavides@aybarcorp.pe',
    },
    {
      id: 'p-mateo',
      nombre: 'Mateo Ríos',
      area: 'ATC',
      rol: 'Gestor de tickets',
      lider: 'Gabriela Núñez',
      correo: 'mateo.rios@aybarcorp.pe',
    },
    {
      id: 'p-diego',
      nombre: 'Diego Salazar',
      area: 'COBRANZA',
      rol: 'Colaborador Cobranza',
      lider: 'Gabriela Núñez',
      correo: 'diego.salazar@aybarcorp.pe',
    },
    {
      id: 'p-elena',
      nombre: 'Elena Aguirre',
      area: 'LEGAL',
      rol: 'Especialista Legal',
      lider: 'Patricia Vílchez',
      correo: 'elena.aguirre@aybarcorp.pe',
    },
    {
      id: 'p-patricia',
      nombre: 'Patricia Vílchez',
      area: 'LEGAL',
      rol: 'Responsable legal de reclamos',
      lider: 'Gerencia Legal',
      correo: 'patricia.vilchez@aybarcorp.pe',
    },
    {
      id: 'p-nelly',
      nombre: 'Nelly Quispe',
      area: 'POSTVENTA',
      rol: 'Especialista Postventa',
      lider: 'Gabriela Núñez',
      correo: 'nelly.quispe@aybarcorp.pe',
    },
    {
      id: 'p-alonso',
      nombre: 'Alonso Pérez',
      area: 'ADMINISTRACION',
      rol: 'Administrador funcional (sin líder en NEXUS)',
      lider: '',
      correo: 'alonso.perez@aybarcorp.pe',
    },
  ];

  /* ── 1. Configuración reactiva: Flujos, Guías y Alertas del Administrador ── */
  readonly flujosPorTipo = signal<FlujoTipoConfig[]>([
    {
      tipo: 'CTA',
      nombreTipo: 'Consulta de cuenta',
      versionActual: 2,
      area: 'ATC',
      pasos: [
        { nombre: 'Validación en SIGDA y Motor de Consultas', responsable: 'Lucía Benavides', horas: 2 },
        { nombre: 'Envío de estado de cuenta y cierre', responsable: 'Lucía Benavides', horas: 22 },
      ],
      historial: [
        {
          version: 1,
          fecha: haceHoras(120),
          autor: 'Alonso Pérez',
          area: 'COBRANZA',
          pasos: [{ nombre: 'Revisión manual en Cobranza', responsable: 'Diego Salazar', horas: 24 }],
        },
        {
          version: 2,
          fecha: haceHoras(48),
          autor: 'Alonso Pérez',
          area: 'ATC',
          pasos: [
            { nombre: 'Validación en SIGDA y Motor de Consultas', responsable: 'Lucía Benavides', horas: 2 },
            { nombre: 'Envío de estado de cuenta y cierre', responsable: 'Lucía Benavides', horas: 22 },
          ],
        },
      ],
    },
    {
      tipo: 'PED',
      nombreTipo: 'Pedido simple',
      versionActual: 1,
      area: 'ATC',
      pasos: [
        { nombre: 'Clasificación y registro de solicitud', responsable: 'Mateo Ríos', horas: 4 },
        { nombre: 'Entrega de constancia al cliente', responsable: 'Mateo Ríos', horas: 20 },
      ],
      historial: [
        {
          version: 1,
          fecha: haceHoras(96),
          autor: 'Alonso Pérez',
          area: 'ATC',
          pasos: [
            { nombre: 'Clasificación y registro de solicitud', responsable: 'Mateo Ríos', horas: 4 },
            { nombre: 'Entrega de constancia al cliente', responsable: 'Mateo Ríos', horas: 20 },
          ],
        },
      ],
    },
    {
      tipo: 'VIS',
      nombreTipo: 'Visita técnica',
      versionActual: 1,
      area: 'POSTVENTA',
      pasos: [
        { nombre: 'Coordinación de agenda con propietario', responsable: 'Nelly Quispe', horas: 8 },
        { nombre: 'Visita de campo y firma de acta', responsable: 'Nelly Quispe', horas: 40 },
      ],
      historial: [
        {
          version: 1,
          fecha: haceHoras(90),
          autor: 'Alonso Pérez',
          area: 'POSTVENTA',
          pasos: [
            { nombre: 'Coordinación de agenda con propietario', responsable: 'Nelly Quispe', horas: 8 },
            { nombre: 'Visita de campo y firma de acta', responsable: 'Nelly Quispe', horas: 40 },
          ],
        },
      ],
    },
    {
      tipo: 'QUE',
      nombreTipo: 'Queja (Libro)',
      versionActual: 1,
      area: 'LEGAL',
      pasos: [
        { nombre: 'Asiento en Libro y evaluación de descargo', responsable: 'Elena Aguirre', horas: 8 },
        { nombre: 'Carta de respuesta con cargo', responsable: 'Patricia Vílchez', horas: 40 },
      ],
      historial: [
        {
          version: 1,
          fecha: haceHoras(80),
          autor: 'Alonso Pérez',
          area: 'LEGAL',
          pasos: [
            { nombre: 'Asiento en Libro y evaluación de descargo', responsable: 'Elena Aguirre', horas: 8 },
            { nombre: 'Carta de respuesta con cargo', responsable: 'Patricia Vílchez', horas: 40 },
          ],
        },
      ],
    },
    {
      tipo: 'REC',
      nombreTipo: 'Reclamo (Libro)',
      versionActual: 2,
      area: 'LEGAL',
      pasos: [
        { nombre: 'Verificación de asiento y exposición legal', responsable: 'Elena Aguirre', horas: 4 },
        { nombre: 'Resolución formal firmada con cargo GLI', responsable: 'Patricia Vílchez', horas: 20 },
      ],
      historial: [
        {
          version: 2,
          fecha: haceHoras(36),
          autor: 'Alonso Pérez',
          area: 'LEGAL',
          pasos: [
            { nombre: 'Verificación de asiento y exposición legal', responsable: 'Elena Aguirre', horas: 4 },
            { nombre: 'Resolución formal firmada con cargo GLI', responsable: 'Patricia Vílchez', horas: 20 },
          ],
        },
      ],
    },
    {
      tipo: 'GAR',
      nombreTipo: 'Garantía postventa',
      versionActual: 1,
      area: 'POSTVENTA',
      pasos: [
        { nombre: 'Validación de Acta de Entrega y cobertura', responsable: 'Nelly Quispe', horas: 8 },
        { nombre: 'Inspección técnica y resolución', responsable: 'Nelly Quispe', horas: 64 },
      ],
      historial: [
        {
          version: 1,
          fecha: haceHoras(72),
          autor: 'Alonso Pérez',
          area: 'POSTVENTA',
          pasos: [
            { nombre: 'Validación de Acta de Entrega y cobertura', responsable: 'Nelly Quispe', horas: 8 },
            { nombre: 'Inspección técnica y resolución', responsable: 'Nelly Quispe', horas: 64 },
          ],
        },
      ],
    },
    {
      tipo: 'CIT',
      nombreTipo: 'Incidencia de ciudad',
      versionActual: 1,
      area: 'POSTVENTA',
      pasos: [
        { nombre: 'Verificación en área común o red matriz', responsable: 'Nelly Quispe', horas: 4 },
        { nombre: 'Atención de cuadrilla urbana', responsable: 'Nelly Quispe', horas: 20 },
      ],
      historial: [
        {
          version: 1,
          fecha: haceHoras(60),
          autor: 'Alonso Pérez',
          area: 'POSTVENTA',
          pasos: [
            { nombre: 'Verificación en área común o red matriz', responsable: 'Nelly Quispe', horas: 4 },
            { nombre: 'Atención de cuadrilla urbana', responsable: 'Nelly Quispe', horas: 20 },
          ],
        },
      ],
    },
  ]);

  readonly guiasPorTipo = signal<GuiaTipoConfig[]>([
    {
      tipo: 'CTA',
      nombreTipo: 'Consulta de cuenta',
      versionActual: 2,
      pasos: [
        'Verificar titularidad y lote en Consulta 360 (SIGDA / TAXON).',
        'Contrastar el voucher o abono en el Motor de Consultas y Cobranza.',
        'Enviar el detalle conciliado por el canal elegido y publicar en Mi Portal.',
      ],
      plantillas: [
        'Hola, revisamos tu solicitud «{resumen}». Tu abono figura conciliado en nuestro sistema y el cronograma actualizado ya está disponible en Mi Portal.',
        'Confirmamos la validación de tu estado de cuenta para «{resumen}». No registras mora exigible a la fecha.',
      ],
      criterios: [
        'Confirmar número de operación bancaria o estado de letra.',
        'Dejar constancia visible al cliente en Mi Portal.',
      ],
      historial: [
        {
          version: 1,
          fecha: haceHoras(100),
          autor: 'Alonso Pérez',
          pasos: ['Consultar a Cobranza por correo.', 'Responder al cliente.'],
          plantillas: ['Estamos revisando tu consulta «{resumen}».'],
          criterios: ['Respuesta enviada.'],
        },
        {
          version: 2,
          fecha: haceHoras(24),
          autor: 'Alonso Pérez',
          pasos: [
            'Verificar titularidad y lote en Consulta 360 (SIGDA / TAXON).',
            'Contrastar el voucher o abono en el Motor de Consultas y Cobranza.',
            'Enviar el detalle conciliado por el canal elegido y publicar en Mi Portal.',
          ],
          plantillas: [
            'Hola, revisamos tu solicitud «{resumen}». Tu abono figura conciliado en nuestro sistema y el cronograma actualizado ya está disponible en Mi Portal.',
          ],
          criterios: [
            'Confirmar número de operación bancaria o estado de letra.',
            'Dejar constancia visible al cliente en Mi Portal.',
          ],
        },
      ],
    },
    {
      tipo: 'PED',
      nombreTipo: 'Pedido simple',
      versionActual: 1,
      pasos: [
        'Validar identidad del solicitante en SIGDA.',
        'Generar constancia o documento solicitado.',
        'Enviar respuesta por el canal de entrada.',
      ],
      plantillas: [
        'Atendimos tu pedido «{resumen}» y adjuntamos la constancia solicitada en Mi Portal.',
      ],
      criterios: ['Adjuntar constancia o confirmar envío al cliente.'],
      historial: [
        {
          version: 1,
          fecha: haceHoras(80),
          autor: 'Alonso Pérez',
          pasos: ['Validar identidad del solicitante en SIGDA.', 'Generar constancia o documento solicitado.'],
          plantillas: ['Atendimos tu pedido «{resumen}» y adjuntamos la constancia solicitada en Mi Portal.'],
          criterios: ['Adjuntar constancia o confirmar envío al cliente.'],
        },
      ],
    },
    {
      tipo: 'VIS',
      nombreTipo: 'Visita técnica',
      versionActual: 1,
      pasos: [
        'Verificar ubicación de manzana y lote en el maestro.',
        'Agendar fecha y hora con el ingeniero de campo.',
        'Registrar acta de visita firmada.',
      ],
      plantillas: [
        'Sobre «{resumen}», hemos programado tu visita técnica en coordinación con el equipo de campo.',
      ],
      criterios: ['Fecha de visita confirmada con el cliente.'],
      historial: [],
    },
    {
      tipo: 'QUE',
      nombreTipo: 'Queja (Libro)',
      versionActual: 1,
      pasos: [
        'Verificar que el ticket tenga su asiento correlativo en el Libro de Reclamaciones.',
        'Recabar descargo del área involucrada dentro de los primeros 5 días hábiles.',
        'Emitir carta de respuesta formal con cargo e informar derecho de acudir a INDECOPI.',
      ],
      plantillas: [
        'En atención a su queja «{resumen}», remitimos nuestra respuesta formal dentro del plazo de ley.',
      ],
      criterios: [
        'Asiento registrado en el Libro de Reclamaciones.',
        'Carta de respuesta y cargo de recepción adjuntos.',
      ],
      historial: [],
    },
    {
      tipo: 'REC',
      nombreTipo: 'Reclamo (Libro)',
      versionActual: 2,
      pasos: [
        'Confirmar asiento en el Libro de Reclamaciones (plazo legal de 15 días hábiles).',
        'Si hay señal de conflicto, completar los 6 elementos del paquete mínimo y derivar a Eje 3.',
        'Emitir carta firmada por la responsable legal con cargo SHA-256.',
      ],
      plantillas: [
        'Respecto a su reclamo «{resumen}», adjuntamos la resolución formal con sustento contractual y registral.',
      ],
      criterios: [
        'Asiento del Libro vinculado sin orfandad.',
        'Cargo de recepción del consumidor validado.',
        'Constancia expresa del derecho a acudir a INDECOPI.',
      ],
      historial: [],
    },
    {
      tipo: 'GAR',
      nombreTipo: 'Garantía postventa',
      versionActual: 1,
      pasos: [
        'Validar Acta de Entrega firmada y calcular vigencia por rubro (120 m estructural / 12 m acabados e instalaciones).',
        'Programar inspección técnica y subir informe con registro fotográfico.',
        'Emitir pronunciamiento de procedencia y acta de conformidad.',
      ],
      plantillas: [
        'Evaluamos tu solicitud de garantía «{resumen}» conforme al Acta de Entrega y programamos la inspección técnica.',
      ],
      criterios: [
        'Acta de Entrega verificada.',
        'Informe de inspección con evidencia fotográfica registrado.',
      ],
      historial: [],
    },
    {
      tipo: 'CIT',
      nombreTipo: 'Incidencia de ciudad',
      versionActual: null,
      pasos: [],
      plantillas: [],
      criterios: [],
      historial: [],
    },
  ]);

  readonly alertasAdmin = signal<AlertaAdminConfig[]>([
    {
      id: 'adm-al-1',
      fecha: haceHoras(6),
      codigo: 'GUIA_FALTANTE',
      etiqueta: 'Falta guía de solución',
      tipoTicket: 'CIT',
      detalle:
        'Un gestor abrió un ticket de «Incidencia de ciudad (CIT)» y este tipo aún no tiene guía de solución publicada.',
    },
    {
      id: 'adm-al-2',
      fecha: haceHoras(14),
      codigo: 'PROYECTO_SIN_RESPONSABLE',
      etiqueta: 'Proyecto sin responsable en el maestro',
      tipoTicket: null,
      detalle:
        'El proyecto «Praderas de Lurín» no tenía responsable asignado al emitir carta de morosidad; se envió a supervisión comercial.',
    },
  ]);

  /* ── 2. Políticas SLA configurables (afectan Nuevo ticket y Reapertura) ── */
  readonly politicasSla = signal<PoliticaSlaConfig[]>([
    {
      id: 'SLA-CTA-URG',
      alcance: 'especifica',
      tipo: 'CTA',
      prioridad: 'URGENT',
      respuestaH: 0.5,
      resolucionH: 8,
      version: 2,
      actualizada: haceHoras(30),
      autor: 'Gabriela Núñez',
    },
    {
      id: 'SLA-CTA-HIGH',
      alcance: 'especifica',
      tipo: 'CTA',
      prioridad: 'HIGH',
      respuestaH: 1,
      resolucionH: 24,
      version: 2,
      actualizada: haceHoras(30),
      autor: 'Gabriela Núñez',
    },
    {
      id: 'SLA-CTA-GEN',
      alcance: 'generica',
      tipo: 'CTA',
      prioridad: null,
      respuestaH: 2,
      resolucionH: 48,
      version: 1,
      actualizada: haceHoras(90),
      autor: 'Gabriela Núñez',
    },
    {
      id: 'SLA-PED-GEN',
      alcance: 'generica',
      tipo: 'PED',
      prioridad: null,
      respuestaH: 2,
      resolucionH: 48,
      version: 1,
      actualizada: haceHoras(90),
      autor: 'Gabriela Núñez',
    },
    {
      id: 'SLA-REC-HIGH',
      alcance: 'especifica',
      tipo: 'REC',
      prioridad: 'HIGH',
      respuestaH: 1,
      resolucionH: 24,
      version: 3,
      actualizada: haceHoras(18),
      autor: 'Gabriela Núñez',
    },
    {
      id: 'SLA-REC-GEN',
      alcance: 'generica',
      tipo: 'REC',
      prioridad: null,
      respuestaH: 2,
      resolucionH: 48,
      version: 1,
      actualizada: haceHoras(90),
      autor: 'Gabriela Núñez',
    },
    {
      id: 'SLA-QUE-GEN',
      alcance: 'generica',
      tipo: 'QUE',
      prioridad: null,
      respuestaH: 2,
      resolucionH: 48,
      version: 1,
      actualizada: haceHoras(90),
      autor: 'Gabriela Núñez',
    },
    {
      id: 'SLA-GAR-GEN',
      alcance: 'generica',
      tipo: 'GAR',
      prioridad: null,
      respuestaH: 8,
      resolucionH: 120,
      version: 1,
      actualizada: haceHoras(90),
      autor: 'Gabriela Núñez',
    },
    {
      id: 'SLA-VIS-GEN',
      alcance: 'generica',
      tipo: 'VIS',
      prioridad: null,
      respuestaH: 4,
      resolucionH: 72,
      version: 1,
      actualizada: haceHoras(90),
      autor: 'Gabriela Núñez',
    },
    {
      id: 'SLA-GLOBAL',
      alcance: 'global',
      tipo: null,
      prioridad: null,
      respuestaH: 4,
      resolucionH: 72,
      version: 1,
      actualizada: haceHoras(120),
      autor: 'Gabriela Núñez',
    },
  ]);

  /* ── 3. Alertas SLA y corridas del job (Vista Alertas SLA) ── */
  readonly alertasSla = signal<AlertaSlaItem[]>([
    {
      id: 'al-sla-1',
      ticketNum: 'AIN-000482',
      tipo: 'FIRST_RESPONSE_AT_RISK',
      ciclo: 0,
      vencimientoEvaluado: sumarHorasHabiles(AHORA_BASE, 0.5),
      fecha: haceHoras(0.5),
      destinatario: 'Gabriela Núñez',
      canal: 'Consola + Correo CC Líder',
    },
    {
      id: 'al-sla-2',
      ticketNum: 'ALT-001204',
      tipo: 'RESOLUTION_AT_RISK',
      ciclo: 0,
      vencimientoEvaluado: sumarHorasHabiles(AHORA_BASE, 2),
      fecha: haceHoras(1.2),
      destinatario: 'Gabriela Núñez',
      canal: 'Consola + Correo CC Líder',
    },
    {
      id: 'al-sla-3',
      ticketNum: 'AUR-000315',
      tipo: 'FIRST_RESPONSE_BREACHED',
      ciclo: 0,
      vencimientoEvaluado: haceHoras(2),
      fecha: haceHoras(1.8),
      destinatario: 'Gabriela Núñez',
      canal: 'Consola + Correo CC Líder',
    },
    {
      id: 'al-sla-4',
      ticketNum: 'ACI-000113',
      tipo: 'RESOLUTION_BREACHED',
      ciclo: 1,
      vencimientoEvaluado: haceHoras(4),
      fecha: haceHoras(3.5),
      destinatario: 'Gabriela Núñez',
      canal: 'Consola + Correo CC Líder',
    },
  ]);

  readonly corridasJobSla = signal<CorridaJobSla[]>([
    { id: 'job-3', fecha: haceHoras(0.25), revisados: 12, nuevasAlertas: 1 },
    { id: 'job-2', fecha: haceHoras(0.5), revisados: 12, nuevasAlertas: 1 },
    { id: 'job-1', fecha: haceHoras(0.75), revisados: 11, nuevasAlertas: 2 },
  ]);

  /* ── 4. Integración UrbeMind (API y Eventos) ── */
  readonly forzarFalloEventoUrbeMind = signal<boolean>(false);

  readonly llamadasUrbeMind = signal<LlamadaUrbeMindItem[]>([
    {
      id: 'um-call-1',
      fecha: haceHoras(1.5),
      operacion: 'POST /api/v1/urbemind/tickets (Crear ticket)',
      llamante: 'Servicio UrbeMind',
      alcance: 'tickets:read tickets:write tickets:interact',
      estadoHttp: 201,
      detalle: 'Ticket AIN-000486 creado con SLA congelado e idempotencia validada.',
    },
    {
      id: 'um-call-2',
      fecha: haceHoras(1.1),
      operacion: 'POST /api/v1/urbemind/tickets/AIN-000486/interactions',
      llamante: 'Servicio UrbeMind',
      alcance: 'tickets:read tickets:write tickets:interact',
      estadoHttp: 200,
      detalle: 'Interacción de bot registrada en el hilo del ticket.',
    },
    {
      id: 'um-call-3',
      fecha: haceHoras(0.4),
      operacion: 'PATCH /api/v1/urbemind/tickets/AIN-000486/status',
      llamante: 'Servicio UrbeMind',
      alcance: 'tickets:read tickets:write',
      estadoHttp: 403,
      detalle: '403 Forbidden · falta el alcance requerido «tickets:status» para cambiar estado.',
    },
  ]);

  readonly eventosUrbeMind = signal<EventoUrbeMindItem[]>([
    {
      id: 'um-ev-1',
      fecha: haceHoras(2.2),
      tipo: 'ticket.created',
      ticketNum: 'AIN-000482',
      estado: 'ENTREGADO',
      intentos: 1,
      error: null,
    },
    {
      id: 'um-ev-2',
      fecha: haceHoras(1.4),
      tipo: 'ticket.InteractionAdded',
      ticketNum: 'AIN-000482',
      estado: 'ENTREGADO',
      intentos: 1,
      error: null,
    },
    {
      id: 'um-ev-3',
      fecha: haceHoras(0.8),
      tipo: 'ticket.statusChanged',
      ticketNum: 'ALT-001204',
      estado: 'PENDIENTE_REINTENTO',
      intentos: 2,
      error: '503 Service Unavailable en webhook receptor de UrbeMind (en cola DLQ/retry).',
    },
  ]);

  /* ── 5. Torre de Control CX (Encuestas, Informes, Auditoría de datos) ── */
  readonly encuestasCx = signal<EncuestaCxItem[]>([
    {
      id: 'enc-1',
      ticketNum: 'AIN-000241',
      fecha: haceHoras(20),
      tipoTicket: 'CTA',
      area: 'ATC',
      gestor: 'Lucía Benavides',
      resultadoCierre: 'Resuelto en 1.er contacto',
      csat: 5,
      ces: 5,
      nps: 10,
      comentario: 'Me enviaron el estado de cuenta conciliado en menos de 15 minutos.',
    },
    {
      id: 'enc-2',
      ticketNum: 'VSL-000319',
      fecha: haceHoras(12),
      tipoTicket: 'PED',
      area: 'ATC',
      gestor: 'Mateo Ríos',
      resultadoCierre: 'Resuelto en 1.er contacto',
      csat: 5,
      ces: 4,
      nps: 9,
      comentario: 'Muy rápida la confirmación del pase para el EntregaFest.',
    },
    {
      id: 'enc-3',
      ticketNum: 'APV-000089',
      fecha: haceHoras(6),
      tipoTicket: 'GAR',
      area: 'POSTVENTA',
      gestor: 'Nelly Quispe',
      resultadoCierre: 'Resuelto tras seguimiento',
      csat: 4,
      ces: 4,
      nps: 8,
      comentario: 'Cumplieron con la visita de impermeabilización en la fecha acordada.',
    },
    {
      id: 'enc-4',
      ticketNum: 'ALT-001102',
      fecha: haceHoras(3),
      tipoTicket: 'REC',
      area: 'LEGAL',
      gestor: 'Patricia Vílchez',
      resultadoCierre: 'Escalado Eje 3',
      csat: 3,
      ces: 3,
      nps: 6,
      comentario: 'Demoró la respuesta inicial, aunque la adenda quedó bien explicada.',
    },
  ]);

  readonly informesCx = signal<InformeCxItem[]>([
    {
      id: 'inf-1',
      periodo: 'SEMANAL',
      generado: haceHoras(16),
      autor: 'Valeria Paredes',
      total: 42,
      cumplimientoRespuesta: 93,
      cumplimientoResolucion: 91,
      csatPromedio: 4.6,
      nps: 52,
      principalesCausas: [
        { tipo: 'CTA', cantidad: 18 },
        { tipo: 'PED', cantidad: 11 },
        { tipo: 'GAR', cantidad: 7 },
      ],
    },
  ]);

  readonly decisionesIaAudit = signal<DecisionIaAuditItem[]>([
    {
      id: 'ia-1',
      fecha: haceHoras(3),
      ticketNum: 'AIN-000482',
      decision: 'ACEPTADA',
      anonimizados: 2,
      autor: 'Lucía Benavides',
    },
    {
      id: 'ia-2',
      fecha: haceHoras(1.5),
      ticketNum: 'ALT-001204',
      decision: 'EDITADA',
      anonimizados: 3,
      autor: 'Elena Aguirre',
    },
  ]);

  readonly consultasExternasAudit = signal<ConsultaExternaAuditItem[]>([
    {
      id: 'ext-1',
      fecha: haceHoras(2.5),
      fuente: 'SIGDA / TAXON',
      motivo: 'Consulta 360 de titular y lote C-07',
      bloqueados: 1,
      autor: 'Lucía Benavides',
    },
    {
      id: 'ext-2',
      fecha: haceHoras(1.8),
      fuente: 'Repositorio S3 / GLI',
      motivo: 'Búsqueda semántica de cláusula resolutoria',
      bloqueados: 2,
      autor: 'Patricia Vílchez',
    },
  ]);

  /* ── 6. EntregaFest en vivo y Buses del Entrega Fest ── */
  readonly frasesAnclaEvento: readonly { id: string; momento: string; frase: string }[] = [
    {
      id: 'fa-1',
      momento: '1. Recepción y escucha activa',
      frase:
        '«Bienvenido a EntregaFest. Tomo nota exacta de su solicitud para darle seguimiento con código verificable hoy mismo.»',
    },
    {
      id: 'fa-2',
      momento: '2. Contención sin debate en fila',
      frase:
        '«Comprendo su malestar; mi función en esta mesa es asegurar que su caso quede registrado con prioridad y pase al especialista indicado.»',
    },
    {
      id: 'fa-3',
      momento: '3. Ante imputación penal o amenaza pública',
      frase:
        '«Para brindarle todas las garantías legales y revisar su expediente al detalle, lo acompaño de inmediato a la Estación 4 con nuestro apoderado legal.»',
    },
    {
      id: 'fa-4',
      momento: '4. Consulta de cronograma o letra en tránsito',
      frase:
        '«Dejamos registrado su comprobante con hora de recepción para que Cobranza emita la constancia conciliada en Mi Portal.»',
    },
    {
      id: 'fa-5',
      momento: '5. Observación en acta de entrega',
      frase:
        '«Cada observación queda asentada en el Acta de Entrega con fecha de inspección técnica garantizada por Postventa.»',
    },
    {
      id: 'fa-6',
      momento: '6. Cierre con número de seguimiento',
      frase:
        '«Este es su número de ticket oficial; puede consultar cada avance desde su celular en Mi Portal.»',
    },
  ];

  readonly casosEventoFest = signal<CasoEventoFestItem[]>([
    {
      id: 'ev-1',
      ticketNum: 'ALT-001204',
      cliente: 'Jorge Mamani Ccori',
      dni: '7013••••',
      proyecto: 'Los Álamos · Mz. F Lt. 3',
      categoria: 'LEGAL_CONFLICTO',
      criticidad: 'CRITICA',
      resumen: 'Reclama demora en minuta y menciona denuncia penal por estafa en mesa de ingreso.',
      imputacionPenal: true,
      registrado: haceHoras(1.2),
      primeraAtencion: haceHoras(1.1),
      estacion4: {
        fecha: haceHoras(1.05),
        motivo: 'Imputación penal detectada: acompañado a Estación 4 con paquete 6/6.',
        autor: 'Sebastián Moreno',
      },
    },
    {
      id: 'ev-2',
      ticketNum: 'AIN-000486',
      cliente: 'Eddie Huamaní',
      dni: '7228••••',
      proyecto: 'Villa Sol II · Lote C-07',
      categoria: 'ENTREGA',
      criticidad: 'MEDIA',
      resumen: 'Consulta horario de firma de Acta de Entrega y validación de acompañantes.',
      imputacionPenal: false,
      registrado: haceHoras(0.6),
      primeraAtencion: haceHoras(0.5),
      estacion4: null,
    },
  ]);

  readonly busesFest: readonly BusFestConfig[] = [
    { id: 'bus-1', nombre: 'Bus 1 · 08:00 (San Isidro)', horario: '08:00', aforo: 6 },
    { id: 'bus-2', nombre: 'Bus 2 · 09:30 (Plaza Norte)', horario: '09:30', aforo: 4 },
    { id: 'bus-3', nombre: 'Bus 3 · 11:00 (Atocongo)', horario: '11:00', aforo: 4 },
  ];

  readonly puntosEmbarqueFest = [
    'San Isidro · Av. Javier Prado Este 492',
    'Plaza Norte · Puerta Principal Panamericana',
    'Mall del Sur · Paradero Atocongo',
  ] as const;

  readonly reservasBusFest = signal<ReservaBusFestItem[]>([
    {
      id: 'res-bus-1',
      clienteId: 'cli-001',
      clienteNombre: 'Eddie Huamaní',
      busId: 'bus-1',
      punto: 'San Isidro · Av. Javier Prado Este 492',
      acompanantes: 2,
      estado: 'CONFIRMADA',
      ticketNum: 'AIN-000486',
      fecha: haceHoras(5),
    },
    {
      id: 'res-bus-2',
      clienteId: 'cli-003',
      clienteNombre: 'Lucía Paredes V.',
      busId: 'bus-2',
      punto: 'Plaza Norte · Puerta Principal Panamericana',
      acompanantes: 3,
      estado: 'CONFIRMADA',
      ticketNum: 'AIN-000487',
      fecha: haceHoras(4),
    },
  ]);

  /* ── 7. Resolución por morosidad (Vista y Detalle de Caso) ── */
  readonly casosResolucionMora = signal<CasoResolucionMoraDetalle[]>([
    {
      id: 'mora-1',
      ticketNum: 'ALT-001190',
      clienteNombre: 'Jorge Mamani Ccori',
      dni: '7013••••',
      proyecto: 'Los Álamos de Carabayllo · Etapa I',
      lote: 'Lote F-03',
      contrato: 'LA-2023-0117',
      cuotasImpagas: 3,
      deuda: 2940,
      estado: 'SUSPENDIDO',
      abierto: haceHoras(48),
      prevista: sumarDiasHabiles(AHORA_BASE, 24),
      carta: {
        para: 'Diego Salazar (Responsable proyecto)',
        cc: 'Gabriela Núñez (Supervisor ATC)',
        fecha: haceHoras(47),
        vence: sumarDiasHabiles(AHORA_BASE, 2),
        sinResponsable: false,
        escalada: null,
        accion: null,
        texto:
          'Contrato LA-2023-0117 acumula 3 letras vencidas (S/ 2,940.00). Proceso suspendido temporalmente por reclamo activo ALT-2026-0042 en el Libro de Reclamaciones.',
      },
      constancias: [
        { id: 'c-1', fecha: haceHoras(47), canal: 'Correo electrónico', reintento: false, resultado: 'ENTREGADO' },
        { id: 'c-2', fecha: haceHoras(47), canal: 'WhatsApp oficial', reintento: false, resultado: 'ENTREGADO' },
        { id: 'c-3', fecha: haceHoras(47), canal: 'Mi Portal', reintento: false, resultado: 'ENTREGADO' },
      ],
      historial: [
        {
          id: 'h-1',
          fecha: haceHoras(48),
          estado: 'En resolución',
          nota: 'Evaluación diaria detectó 3 cuotas vencidas e impagas.',
          autor: 'Sistema (Job Cobranza)',
        },
        {
          id: 'h-2',
          fecha: haceHoras(46),
          estado: 'Suspendido por reclamo',
          nota: 'Se detectó asiento abierto ALT-2026-0042 en el Libro de Reclamaciones; se suspenden alertas de corte.',
          autor: 'Sistema (Regla Legal)',
        },
      ],
    },
    {
      id: 'mora-2',
      ticketNum: 'AUR-000315',
      clienteNombre: 'Carlos Alberto Vega',
      dni: '4189••••',
      proyecto: 'Praderas de Lurín · Etapa III',
      lote: 'Lote B-19',
      contrato: 'PL-2024-0812',
      cuotasImpagas: 3,
      deuda: 3540,
      estado: 'ABIERTO',
      abierto: haceHoras(72),
      prevista: sumarDiasHabiles(AHORA_BASE, 21),
      carta: {
        para: 'Gabriela Núñez (Supervisora comercial por falta de responsable)',
        cc: 'Gabriela Núñez (Supervisor ATC)',
        fecha: haceHoras(71),
        vence: haceHoras(12),
        sinResponsable: true,
        escalada: haceHoras(4),
        accion: null,
        texto:
          'El contrato PL-2024-0812 acumula 3 cuotas impagas (S/ 3,540.00). Al no tener acción en 2 días hábiles, se escaló automáticamente a supervisión.',
      },
      constancias: [
        { id: 'c-4', fecha: haceHoras(71), canal: 'Correo electrónico', reintento: false, resultado: 'ENTREGADO' },
        { id: 'c-5', fecha: haceHoras(71), canal: 'WhatsApp oficial', reintento: true, resultado: 'ENTREGADO' },
      ],
      historial: [
        {
          id: 'h-3',
          fecha: haceHoras(72),
          estado: 'En resolución',
          nota: 'Apertura automática por 3 cuotas impagas.',
          autor: 'Sistema (Job Cobranza)',
        },
        {
          id: 'h-4',
          fecha: haceHoras(4),
          estado: 'Escalado',
          nota: 'Sin acción del responsable en 2 días hábiles: escalado al supervisor ATC.',
          autor: 'Sistema (Matriz SLA)',
        },
      ],
    },
  ]);

  /* ── 8. Libro de Reclamaciones (Asientos detallados, Alertas legales y Huérfanos) ── */
  readonly asientosLibroDetalle = signal<AsientoLibroDetalle[]>([
    {
      id: 'as-1',
      codigo: 'ALT-2026-0042',
      empresaId: 'ALT',
      establecimiento: 'Libro virtual · Mi Portal',
      ticketNum: 'ALT-001204',
      tipo: 'RECLAMO',
      consumidor: 'Jorge Mamani Ccori',
      dni: '7013••••',
      registrado: sumarDiasHabiles(AHORA_BASE, -13),
      registradoPor: 'Lucía Benavides',
      venceOriginal: sumarDiasHabiles(AHORA_BASE, 2),
      venceProrrogado: null,
      hechos:
        'El consumidor manifiesta demora en la entrega de minuta de independización del Lote F-03 y solicita suspensión de cobro de mora mientras se resuelve.',
      pedido: 'Entrega de minuta firmada y exoneración de intereses moratorios de las cuotas 20 a 22.',
      monto: 2940,
      moneda: 'PEN',
      prorroga: null,
      respuesta: null,
      apelaciones: [],
      historialPlazo: [
        {
          id: 'hp-1',
          fecha: sumarDiasHabiles(AHORA_BASE, -13),
          evento: 'PLAZO_ORIGINAL',
          detalle: `Vence ${fmtFecha(sumarDiasHabiles(AHORA_BASE, 2))} (15 días hábiles Ley 29571)`,
          autor: 'Lucía Benavides',
        },
      ],
    },
    {
      id: 'as-2',
      codigo: 'AIN-2026-0108',
      empresaId: 'AIN',
      establecimiento: 'Sede Central San Isidro',
      ticketNum: 'AIN-000471',
      tipo: 'QUEJA',
      consumidor: 'María Quispe Huamán',
      dni: '4521••••',
      registrado: sumarDiasHabiles(AHORA_BASE, -18),
      registradoPor: 'Mateo Ríos',
      venceOriginal: sumarDiasHabiles(AHORA_BASE, -3),
      venceProrrogado: sumarDiasHabiles(AHORA_BASE, 12),
      hechos: 'Demora en la conciliación del voucher pagado en agente BCP #88231.',
      pedido: 'Reconocimiento inmediato de la cuota 18 y constancia de no adeudo.',
      monto: 1250,
      moneda: 'PEN',
      prorroga: {
        justificacion: 'Se requirió confirmación de cámara de compensación bancaria de fecha 28-sep.',
        canal: 'Correo electrónico con acuse',
        fechaComunicacion: sumarDiasHabiles(AHORA_BASE, -4),
        cargoNombre: 'Cargo_Prorroga_AIN-2026-0108.pdf',
        sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      },
      respuesta: {
        fecha: sumarDiasHabiles(AHORA_BASE, -1),
        diasHabilesUsados: 17,
        resumen:
          'Se concilió satisfactoriamente la operación #88231 y se emitió la constancia de no adeudo sin cargos adicionales.',
        firmante: 'Patricia Vílchez',
        cartaNombre: 'Carta_Respuesta_AIN-2026-0108.pdf',
        cartaSha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
        cargoNombre: 'Cargo_Recepcion_AIN-2026-0108.pdf',
        cargoSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        derechoIndecopi: true,
      },
      apelaciones: [
        {
          id: 'ap-1',
          instancia: 'INTERNA',
          numeroCaso: 'AP-INT-2026-019',
          presentada: AHORA_BASE,
          estado: 'UNDER_REVIEW',
          resolucion: null,
          historial: [
            {
              fecha: AHORA_BASE,
              cambio: 'Pendiente → En revisión',
              autor: 'Patricia Vílchez',
              nota: 'Revisión de intereses compensatorios solicitada por la titular.',
            },
          ],
        },
      ],
      historialPlazo: [
        {
          id: 'hp-2',
          fecha: sumarDiasHabiles(AHORA_BASE, -18),
          evento: 'PLAZO_ORIGINAL',
          detalle: `Vence ${fmtFecha(sumarDiasHabiles(AHORA_BASE, -3))}`,
          autor: 'Mateo Ríos',
        },
        {
          id: 'hp-3',
          fecha: sumarDiasHabiles(AHORA_BASE, -4),
          evento: 'PRORROGA',
          detalle: `Prórroga única (+15 d hábiles) · Nuevo vencimiento ${fmtFecha(sumarDiasHabiles(AHORA_BASE, 12))}`,
          autor: 'Patricia Vílchez',
        },
        {
          id: 'hp-4',
          fecha: sumarDiasHabiles(AHORA_BASE, -1),
          evento: 'RESPUESTA',
          detalle: 'Respuesta formal emitida con carta y cargo SHA-256.',
          autor: 'Patricia Vílchez',
        },
      ],
    },
  ]);

  readonly alertasLegalesLibro = signal([
    {
      id: 'al-leg-1',
      asientoId: 'as-1',
      codigoAsiento: 'ALT-2026-0042',
      tipo: 'LEGAL_EXTENSION_WINDOW_CLOSING' as const,
      vencimientoEvaluado: sumarDiasHabiles(AHORA_BASE, 2),
      fecha: haceHoras(2),
      destinatario: 'Patricia Vílchez',
      canal: 'Consola + Correo Legal',
    },
  ]);

  /* ── 9. Garantías Postventa (Actas de Entrega y Reclamos de Garantía) ── */
  readonly actasEntrega: readonly ActaEntregaGarantia[] = [
    {
      id: 'ACT-2025-0318',
      unidad: 'Residencial Brisas · Dpto. Torre B-402',
      clienteNombre: 'Rosa Huamán Paredes',
      dni: '4288••••',
      entregada: new Date('2025-11-14T10:00:00-05:00'),
    },
    {
      id: 'ACT-2026-0210',
      unidad: 'Mirador del Sur · Lote C-21',
      clienteNombre: 'Lucía Paredes V.',
      dni: '0045••••',
      entregada: new Date('2026-09-20T15:00:00-05:00'),
    },
    {
      id: 'ACT-2023-0044',
      unidad: 'Villa Sol I · Lote A-09',
      clienteNombre: 'Pedro Pablo Soto',
      dni: '0981••••',
      entregada: new Date('2023-04-10T11:00:00-05:00'),
    },
  ];

  readonly reclamosGarantiaDetalle = signal<ReclamoGarantiaDetalle[]>([
    {
      id: 'gar-1',
      codigo: 'GAR-2026-0091',
      entregaId: 'ACT-2025-0318',
      ticketNum: 'APV-000089',
      tipo: 'IMPERMEABILIZACION',
      reclamada: haceHoras(36),
      registradoPor: 'Nelly Quispe',
      descripcion: 'Humedad superficial en junta de ducha principal del departamento B-402.',
      estado: 'UNDER_REVIEW',
      motivoNoProcede: null,
      inspeccion: {
        programada: sumarDiasHabiles(AHORA_BASE, 2),
        registrada: false,
        informe: null,
        evidenciaNombre: null,
      },
      resolucion: null,
      adenda: null,
      trazabilidad: [
        {
          id: 'tg-1',
          fecha: haceHoras(36),
          evento: 'Registro',
          detalle: 'Dentro de cobertura de 12 meses de impermeabilización.',
          autor: 'Nelly Quispe',
        },
        {
          id: 'tg-2',
          fecha: haceHoras(24),
          evento: 'Inspección programada',
          detalle: `Programada para ${fmtFecha(sumarDiasHabiles(AHORA_BASE, 2))}.`,
          autor: 'Nelly Quispe',
        },
      ],
    },
    {
      id: 'gar-2',
      codigo: 'GAR-2026-0092',
      entregaId: 'ACT-2026-0210',
      ticketNum: 'APV-000412',
      tipo: 'ESTRUCTURAL',
      reclamada: haceHoras(20),
      registradoPor: 'Nelly Quispe',
      descripcion: 'Fisura en Sardineles y muro perimétrico frontal del lote C-21.',
      estado: 'UNDER_REVIEW',
      motivoNoProcede: null,
      inspeccion: {
        programada: sumarDiasHabiles(AHORA_BASE, 1),
        registrada: true,
        informe:
          'Se verificó asentamiento menor en sardinel exterior sin compromiso de cimentación; procede sellado epóxico por cuadrilla.',
        evidenciaNombre: 'Informe_Inspeccion_GAR-0092.pdf',
      },
      resolucion: null,
      adenda: null,
      trazabilidad: [
        {
          id: 'tg-3',
          fecha: haceHoras(20),
          evento: 'Registro',
          detalle: 'Dentro de cobertura estructural de 120 meses.',
          autor: 'Nelly Quispe',
        },
        {
          id: 'tg-4',
          fecha: haceHoras(5),
          evento: 'Inspección registrada',
          detalle: 'Informe técnico e imágenes cargadas por Postventa.',
          autor: 'Nelly Quispe',
        },
      ],
    },
    {
      id: 'gar-3',
      codigo: 'GAR-2026-0085',
      entregaId: 'ACT-2023-0044',
      ticketNum: null,
      tipo: 'ACABADOS',
      reclamada: haceHoras(72),
      registradoPor: 'Nelly Quispe',
      descripcion: 'Solicitud de cambio de pintura exterior luego de 3 años de la entrega.',
      estado: 'NOT_ELIGIBLE',
      motivoNoProcede:
        'La cobertura de acabados (12 meses desde el Acta de Entrega del 10-abr-2023) venció el 10-abr-2024.',
      inspeccion: null,
      resolucion: null,
      adenda: null,
      trazabilidad: [
        {
          id: 'tg-5',
          fecha: haceHoras(72),
          evento: 'No procedente por vigencia',
          detalle: 'Cobertura de 12 meses vencida al momento del reclamo.',
          autor: 'Sistema',
        },
      ],
    },
  ]);

  /* ── 10. Mesa de Casos Sensibles SGD ── */
  readonly casosSgdDetalle = signal<CasoSgdDetalle[]>([
    {
      id: 'sgd-1',
      codigo: 'SGD-2026-000318',
      linea: 'INDECOPI_LEGAL',
      clienteNombre: 'Jorge Mamani Ccori',
      dni: '7013••••',
      ticketNum: 'ALT-001204',
      resumen:
        'Requerimiento informativo y carta notarial sobre plazo de independización del Lote F-03 en Los Álamos.',
      registrado: sumarDiasHabiles(AHORA_BASE, -4),
      autor: 'Rocío Castillo',
      estado: 'ACTIVO',
      vinculadoACodigo: null,
      origenCodigo: null,
      justificacionIndependiente: null,
      cargoPrevio: { fecha: sumarDiasHabiles(AHORA_BASE, -4), autor: 'Rocío Castillo' },
      activacion: { fecha: sumarDiasHabiles(AHORA_BASE, -3), autor: 'Rocío Castillo' },
      venceSla: sumarDiasHabiles(AHORA_BASE, 4),
      riesgo: {
        criterios: ['AUTORIDAD', 'CARTA_NOTARIAL'],
        puntaje: 70,
        nivel: 'MUY_ALTO',
      },
      nivelEscalamiento: 2,
      evidencias: [
        {
          id: 'ev-sgd-1',
          fecha: sumarDiasHabiles(AHORA_BASE, -3),
          autor: 'Rocío Castillo',
          descripcion: 'Carta notarial ingresada por mesa de partes y partida matriz SUNARP.',
          documentoNombre: 'Expediente_Notarial_F03.pdf',
          gli: 'GLI-2026-000412',
        },
      ],
      cierre: null,
      trazabilidad: [
        {
          id: 'tr-1',
          fecha: sumarDiasHabiles(AHORA_BASE, -4),
          evento: 'Cargo previo',
          detalle: 'Recepción documental registrada; SLA aún no corre.',
          autor: 'Rocío Castillo',
        },
        {
          id: 'tr-2',
          fecha: sumarDiasHabiles(AHORA_BASE, -3),
          evento: 'Cargo de activación',
          detalle: 'Expediente completo: inicia SLA de línea (7 días hábiles).',
          autor: 'Rocío Castillo',
        },
      ],
    },
    {
      id: 'sgd-2',
      codigo: 'SGD-2026-000321',
      linea: 'LEGAL_ATIENDE',
      clienteNombre: 'Carlos Alberto Vega',
      dni: '4189••••',
      ticketNum: 'AUR-000315',
      resumen:
        'Atención preventiva en sala Legal Atiende por reprogramación de letras vencidas en Praderas de Lurín.',
      registrado: sumarDiasHabiles(AHORA_BASE, -3),
      autor: 'Rocío Castillo',
      estado: 'REGISTRADO',
      vinculadoACodigo: null,
      origenCodigo: null,
      justificacionIndependiente: null,
      cargoPrevio: { fecha: sumarDiasHabiles(AHORA_BASE, -3), autor: 'Rocío Castillo' },
      activacion: null,
      venceSla: null,
      riesgo: null,
      nivelEscalamiento: 1,
      evidencias: [],
      cierre: null,
      trazabilidad: [
        {
          id: 'tr-3',
          fecha: sumarDiasHabiles(AHORA_BASE, -3),
          evento: 'Cargo previo',
          detalle: 'En espera de sustento del cliente (> 2 días hábiles en limbo).',
          autor: 'Rocío Castillo',
        },
      ],
    },
  ]);

  /* ── Métodos de Permisos y Menú Lateral según Rol (fiel a 5181) ── */
  puedeAtender(rol: RolPrototipoAtc = this.rolActivo()): boolean {
    return ['GESTOR', 'COLABORADOR', 'SUPERVISOR', 'LEGAL_RECLAMOS'].includes(rol);
  }

  puedeRegistrarTicket(rol: RolPrototipoAtc = this.rolActivo()): boolean {
    return ['GESTOR', 'COLABORADOR', 'SUPERVISOR'].includes(rol);
  }

  puedeMarcarRayo(rol: RolPrototipoAtc = this.rolActivo()): boolean {
    return ['SUPERVISOR', 'ADMIN_FUNCIONAL'].includes(rol);
  }

  puedeVerLibro(rol: RolPrototipoAtc = this.rolActivo()): boolean {
    return this.puedeAtender(rol) || rol === 'COORDINADOR_CX';
  }

  puedeGestionarLibro(rol: RolPrototipoAtc = this.rolActivo()): boolean {
    return rol === 'LEGAL_RECLAMOS' || rol === 'SUPERVISOR';
  }

  puedeVerMesaSgd(rol: RolPrototipoAtc = this.rolActivo()): boolean {
    return ['MESA_SGD', 'LEGAL_RECLAMOS', 'SUPERVISOR'].includes(rol);
  }

  puedeOperarMesaSgd(rol: RolPrototipoAtc = this.rolActivo()): boolean {
    return rol === 'MESA_SGD' || rol === 'SUPERVISOR';
  }

  puedeVerMorosidad(rol: RolPrototipoAtc = this.rolActivo()): boolean {
    return ['COLABORADOR', 'SUPERVISOR', 'LEGAL_RECLAMOS', 'COORDINADOR_CX', 'GESTOR'].includes(rol);
  }

  puedeVerGarantias(rol: RolPrototipoAtc = this.rolActivo()): boolean {
    return !['SIN_ATENCION', 'CONTROL_ACCESO', 'CLIENTE'].includes(rol);
  }

  puedeOperarGarantias(rol: RolPrototipoAtc = this.rolActivo()): boolean {
    return ['COLABORADOR', 'SUPERVISOR', 'GESTOR'].includes(rol);
  }

  puedeRegistrarIngreso(rol: RolPrototipoAtc = this.rolActivo()): boolean {
    return ['CONTROL_ACCESO', 'SUPERVISOR'].includes(rol);
  }

  puedeVerBuses(rol: RolPrototipoAtc = this.rolActivo()): boolean {
    return ['CLIENTE', 'COORDINADOR_CX', 'MODERADOR_EVENTO', 'SUPERVISOR'].includes(rol);
  }

  vistasPermitidasParaRol(rol: RolPrototipoAtc = this.rolActivo()): readonly VistaAtc[] {
    if (rol === 'CONTROL_ACCESO') return ['ingreso'];
    if (rol === 'CLIENTE') return ['buses'];

    const vistas: VistaAtc[] = [];
    if (rol !== 'SIN_ATENCION') {
      vistas.push('c360', 'vivo');
    }
    vistas.push('bandeja');
    if (['GESTOR', 'COLABORADOR', 'SUPERVISOR', 'ADMIN_FUNCIONAL'].includes(rol)) {
      vistas.push('tudia');
    }
    vistas.push('nuevo', 'detalle');
    if (['COLABORADOR', 'SUPERVISOR', 'LEGAL_RECLAMOS', 'COORDINADOR_CX'].includes(rol)) {
      vistas.push('morosidad');
    }
    if (rol === 'SUPERVISOR') {
      vistas.push('ingreso');
    }
    if (['COORDINADOR_CX', 'MODERADOR_EVENTO', 'SUPERVISOR'].includes(rol)) {
      vistas.push('buses');
    }
    if (this.puedeVerLibro(rol)) {
      vistas.push('libro');
    }
    if (rol !== 'SIN_ATENCION') {
      vistas.push('garantias');
    }
    if (['MESA_SGD', 'LEGAL_RECLAMOS', 'SUPERVISOR'].includes(rol)) {
      vistas.push('sgd');
    }
    if (rol === 'SUPERVISOR') {
      vistas.push('reasignar');
    }
    if (['SUPERVISOR', 'COORDINADOR_CX'].includes(rol)) {
      vistas.push('alertas', 'cierre');
    }
    if (rol === 'SUPERVISOR') {
      vistas.push('politicas');
    }
    if (rol === 'ADMIN_FUNCIONAL' || rol === 'SUPERVISOR') {
      vistas.push('configuracion');
    }
    if (['COORDINADOR_CX', 'SUPERVISOR'].includes(rol)) {
      vistas.push('torre');
    }
    if (['COORDINADOR_CX', 'MODERADOR_EVENTO', 'SUPERVISOR'].includes(rol)) {
      vistas.push('evento');
    }
    return vistas;
  }

  /* ── Métodos que conectan Configuración y Políticas SLA con el resto de vistas ── */
  obtenerFlujoActivo(tipo: string): FlujoTipoConfig {
    return (
      this.flujosPorTipo().find((f) => f.tipo === tipo) ?? {
        tipo,
        nombreTipo: TIPOS_TICKET.find((t) => t.id === tipo)?.nombre ?? tipo,
        versionActual: 1,
        area: 'ATC',
        pasos: [{ nombre: 'Recepción y clasificación', responsable: 'Lucía Benavides', horas: 24 }],
        historial: [],
      }
    );
  }

  publicarVersionFlujo(tipo: string, area: string, pasos: PasoFlujoConfig[]): FlujoTipoConfig {
    let actualizado!: FlujoTipoConfig;
    this.flujosPorTipo.update((lista) =>
      lista.map((f) => {
        if (f.tipo !== tipo) return f;
        const nuevaVersion = f.versionActual + 1;
        const copiaPasos = pasos.map((p) => ({ ...p }));
        actualizado = {
          ...f,
          versionActual: nuevaVersion,
          area,
          pasos: copiaPasos,
          historial: [
            ...f.historial,
            {
              version: nuevaVersion,
              fecha: AHORA_BASE,
              autor: this.perfilActivo().nombre,
              area,
              pasos: copiaPasos,
            },
          ],
        };
        return actualizado;
      }),
    );
    return actualizado;
  }

  obtenerGuiaActiva(tipo: string): GuiaTipoConfig | undefined {
    return this.guiasPorTipo().find((g) => g.tipo === tipo);
  }

  reportarFaltaDeGuia(tipo: string): void {
    const yaExiste = this.alertasAdmin().some(
      (a) => a.codigo === 'GUIA_FALTANTE' && a.tipoTicket === tipo,
    );
    if (yaExiste) return;
    const nombre = TIPOS_TICKET.find((t) => t.id === tipo)?.nombre ?? tipo;
    this.alertasAdmin.update((prev) => [
      {
        id: `adm-guia-${Date.now()}`,
        fecha: AHORA_BASE,
        codigo: 'GUIA_FALTANTE',
        etiqueta: 'Falta guía de solución',
        tipoTicket: tipo,
        detalle: `Un gestor consultó un ticket de tipo «${nombre} (${tipo})» sin guía publicada.`,
      },
      ...prev,
    ]);
  }

  publicarVersionGuia(
    tipo: string,
    pasos: string[],
    plantillas: string[],
    criterios: string[],
  ): number {
    let nuevaVer = 1;
    this.guiasPorTipo.update((lista) =>
      lista.map((g) => {
        if (g.tipo !== tipo) return g;
        nuevaVer = (g.versionActual ?? 0) + 1;
        return {
          ...g,
          versionActual: nuevaVer,
          pasos: [...pasos],
          plantillas: [...plantillas],
          criterios: [...criterios],
          historial: [
            ...g.historial,
            {
              version: nuevaVer,
              fecha: AHORA_BASE,
              autor: this.perfilActivo().nombre,
              pasos: [...pasos],
              plantillas: [...plantillas],
              criterios: [...criterios],
            },
          ],
        };
      }),
    );
    // Si había alerta de GUIA_FALTANTE para este tipo, se resuelve automáticamente
    this.alertasAdmin.update((prev) =>
      prev.filter((a) => !(a.codigo === 'GUIA_FALTANTE' && a.tipoTicket === tipo)),
    );
    return nuevaVer;
  }

  calcularPoliticaVigente(
    tipo: string,
    prioridad: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
    apertura: Date = AHORA_BASE,
  ): {
    politica: PoliticaSlaConfig;
    origen: 'especifica' | 'generica' | 'global';
    etiquetaOrigen: string;
    venceRespuesta: Date;
    venceResolucion: Date;
  } {
    const lista = this.politicasSla();
    const especifica = lista.find(
      (p) => p.alcance === 'especifica' && p.tipo === tipo && p.prioridad === prioridad,
    );
    const generica = lista.find((p) => p.alcance === 'generica' && p.tipo === tipo);
    const global =
      lista.find((p) => p.alcance === 'global') ?? {
        id: 'SLA-GLOBAL',
        alcance: 'global' as const,
        tipo: null,
        prioridad: null,
        respuestaH: 4,
        resolucionH: 72,
        version: 1,
        actualizada: AHORA_BASE,
        autor: 'Sistema',
      };

    const elegida = especifica ?? generica ?? global;
    const origen = especifica ? 'especifica' : generica ? 'generica' : 'global';
    const etiquetaOrigen =
      origen === 'especifica'
        ? `Específica (${tipo} + ${prioridad})`
        : origen === 'generica'
          ? `Genérica del tipo (${tipo})`
          : 'Genérica global (sin política específica del tipo)';

    return {
      politica: elegida,
      origen,
      etiquetaOrigen,
      venceRespuesta: sumarHorasHabiles(apertura, elegida.respuestaH),
      venceResolucion: sumarHorasHabiles(apertura, elegida.resolucionH),
    };
  }

  registrarAlertaPoliticaFaltante(tipo: string): void {
    const yaExiste = this.alertasAdmin().some(
      (a) => a.codigo === 'POLITICA_FALTANTE' && a.tipoTicket === tipo,
    );
    if (yaExiste) return;
    const nombre = TIPOS_TICKET.find((t) => t.id === tipo)?.nombre ?? tipo;
    this.alertasAdmin.update((prev) => [
      {
        id: `adm-pol-${Date.now()}`,
        fecha: AHORA_BASE,
        codigo: 'POLITICA_FALTANTE',
        etiqueta: 'Falta política de SLA para el tipo',
        tipoTicket: tipo,
        detalle: `Se registró un ticket de «${nombre} (${tipo})» aplicando la política genérica global.`,
      },
      ...prev,
    ]);
  }

  actualizarPoliticaSla(id: string, respuestaH: number, resolucionH: number): PoliticaSlaConfig | null {
    let editada: PoliticaSlaConfig | null = null;
    this.politicasSla.update((lista) =>
      lista.map((p) => {
        if (p.id !== id) return p;
        editada = {
          ...p,
          respuestaH,
          resolucionH,
          version: p.version + 1,
          actualizada: AHORA_BASE,
          autor: this.perfilActivo().nombre,
        };
        return editada;
      }),
    );
    return editada;
  }

  ejecutarJobSlaManual(ticketsActivosCount: number): number {
    const nuevas = 1;
    this.corridasJobSla.update((prev) => [
      {
        id: `job-${Date.now()}`,
        fecha: AHORA_BASE,
        revisados: ticketsActivosCount,
        nuevasAlertas: nuevas,
      },
      ...prev,
    ]);
    return nuevas;
  }
}
