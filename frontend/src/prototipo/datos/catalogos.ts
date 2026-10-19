/**
 * Catálogos del prototipo de «Aybar Atiende» (ola 1: EP-ATC-01 y EP-ATC-02). Datos
 * ficticios: razones sociales, RUC, personas y clientes no son reales. Los valores que
 * dependen de una pregunta abierta del PO llevan `SUPUESTO` y salen marcados en pantalla.
 */

export interface Empresa {
  readonly id: string
  readonly nombre: string
  readonly ruc: string
}

/** 11 razones sociales (00-CONTEXT-INDEX). RUC ficticios de 11 dígitos. */
export const EMPRESAS: readonly Empresa[] = [
  { id: 'AIN', nombre: 'Aybar Inmobiliaria S.A.C.', ruc: '20601234561' },
  { id: 'ALT', nombre: 'Aybar Lotes y Terrenos S.A.C.', ruc: '20601234572' },
  { id: 'AUR', nombre: 'Aybar Urbanizadora S.A.C.', ruc: '20601234583' },
  { id: 'ACS', nombre: 'Aybar Construcción y Servicios S.A.C.', ruc: '20601234594' },
  { id: 'ACI', nombre: 'Aybar Ciudad S.A.C.', ruc: '20601234605' },
  { id: 'APV', nombre: 'Aybar Postventa S.A.C.', ruc: '20601234616' },
  { id: 'AFN', nombre: 'Aybar Financiera Inmobiliaria S.A.C.', ruc: '20601234627' },
  { id: 'ACM', nombre: 'Aybar Comercial S.A.C.', ruc: '20601234638' },
  { id: 'ADS', nombre: 'Aybar Desarrollos del Sur S.A.C.', ruc: '20601234649' },
  { id: 'ADN', nombre: 'Aybar Desarrollos del Norte S.A.C.', ruc: '20601234650' },
  { id: 'AHL', nombre: 'Aybar Holding S.A.C.', ruc: '20601234661' },
]

export const LINEAS = ['Lotes urbanos', 'Vivienda', 'Comercial', 'Servicios de ciudad'] as const

/** RF-SVC-001: teléfono, WhatsApp y correo. */
export const CANALES = ['Teléfono', 'WhatsApp', 'Correo'] as const
export type Canal = (typeof CANALES)[number]
export const CANALES_REMOTOS: readonly Canal[] = ['Teléfono', 'WhatsApp', 'Correo']

export const ESTABLECIMIENTOS = [
  'Oficina Central Lima',
  'Oficina Carabayllo',
  'Caseta Villa Sol II',
  'Caseta Los Álamos',
] as const

/**
 * SUPUESTO: un reclamo que llega por teléfono, WhatsApp o correo se asienta en el «Libro
 * virtual» de la empresa, que lleva su propio correlativo (pregunta abierta de FT-ATC-05:
 * «¿el libro virtual de la web se integra o se reemplaza?»).
 */
export const LIBRO_VIRTUAL = 'Libro virtual'
export const ESTABLECIMIENTOS_LIBRO = [...ESTABLECIMIENTOS, LIBRO_VIRTUAL] as const
export const CODIGO_ESTABLECIMIENTO: Record<string, string> = {
  'Oficina Central Lima': 'LIM',
  'Oficina Carabayllo': 'CAR',
  'Caseta Villa Sol II': 'VS2',
  'Caseta Los Álamos': 'ALA',
  [LIBRO_VIRTUAL]: 'VIR',
}

export interface TipoTicket {
  readonly id: string
  readonly nombre: string
}

export const TIPOS: readonly TipoTicket[] = [
  { id: 'PED', nombre: 'Pedido simple' },
  { id: 'CTA', nombre: 'Consulta de cuenta' },
  { id: 'VIS', nombre: 'Visita técnica' },
  { id: 'QUE', nombre: 'Queja' },
  { id: 'REC', nombre: 'Reclamo' },
  { id: 'GAR', nombre: 'Garantía postventa' },
  { id: 'CIT', nombre: 'Incidencia de ciudad' },
  // Ola 8 (EP-ATC-11)
  { id: 'RES', nombre: 'Resolución de contrato' },
  { id: 'ING', nombre: 'Ingreso a proyecto' },
  { id: 'RSV', nombre: 'Reserva de bus' },
]

export const PRIORIDADES = [
  { id: 'LOW', nombre: 'Baja' },
  { id: 'MEDIUM', nombre: 'Media' },
  { id: 'HIGH', nombre: 'Alta' },
  { id: 'URGENT', nombre: 'Urgente' },
] as const
export type Prioridad = (typeof PRIORIDADES)[number]['id']

/** Las 6 áreas del flujo (RF-SVC-007). */
export const AREAS = ['ATC', 'COBRANZA', 'LEGAL', 'POSTVENTA', 'TI', 'ADMINISTRACION'] as const
export type Area = (typeof AREAS)[number]
export const NOMBRE_AREA: Record<Area, string> = {
  ATC: 'ATC',
  COBRANZA: 'Cobranza',
  LEGAL: 'Legal',
  POSTVENTA: 'Postventa',
  TI: 'TI',
  ADMINISTRACION: 'Administración',
}

/** Los 7 estados de RF-SVC-004. */
export const ESTADOS = ['OPEN', 'IN_PROGRESS', 'PENDING_CUSTOMER', 'ESCALATED', 'RESOLVED', 'CLOSED', 'REOPENED'] as const
export type Estado = (typeof ESTADOS)[number]
export const NOMBRE_ESTADO: Record<Estado, string> = {
  OPEN: 'Abierto',
  IN_PROGRESS: 'En atención',
  PENDING_CUSTOMER: 'Espera cliente',
  ESCALATED: 'Escalado',
  RESOLVED: 'Resuelto',
  CLOSED: 'Cerrado',
  REOPENED: 'Reabierto',
}
export const ESTADOS_ACTIVOS: readonly Estado[] = ['OPEN', 'IN_PROGRESS', 'PENDING_CUSTOMER', 'ESCALATED', 'REOPENED']

/** SUPUESTO (pregunta abierta de FT-ATC-03: «¿hay un catálogo cerrado de motivos?»). */
export interface Motivo {
  readonly id: string
  readonly nombre: string
  readonly uso: 'derivacion' | 'reasignacion' | 'toma' | 'alta'
}
export const MOTIVOS: readonly Motivo[] = [
  { id: 'DERIVACION_COMPETENCIA', nombre: 'Competencia de otra área', uso: 'derivacion' },
  { id: 'DERIVACION_INFORMACION', nombre: 'Requiere información de otra área', uso: 'derivacion' },
  { id: 'DERIVACION_CONFLICTO_EJE3', nombre: 'Señal de conflicto (Eje 3)', uso: 'derivacion' },
  { id: 'REASSIGNMENT_CESE', nombre: 'Cese del colaborador', uso: 'reasignacion' },
  { id: 'REASSIGNMENT_ROTACION', nombre: 'Rotación del colaborador', uso: 'reasignacion' },
  { id: 'REASSIGNMENT_CARGA', nombre: 'Redistribución por carga', uso: 'reasignacion' },
  { id: 'TOMA_DE_BANDEJA', nombre: 'Tomado de la bandeja del área', uso: 'toma' },
  { id: 'ALTA', nombre: 'Registro inicial', uso: 'alta' },
]
export const nombreMotivo = (id: string) => MOTIVOS.find((m) => m.id === id)?.nombre ?? id

export type Rol = 'GESTOR' | 'COLABORADOR' | 'SUPERVISOR' | 'COORDINADOR_CX' | 'LEGAL_RECLAMOS' | 'MESA_SGD' | 'MODERADOR_EVENTO' | 'ADMIN_FUNCIONAL' | 'CONTROL_ACCESO' | 'CLIENTE' | 'SIN_ATENCION'

export interface Persona {
  readonly id: string
  readonly nombre: string
  readonly area: Area | 'VENTAS' | 'CX'
  readonly rol: Rol
}

/** Personas ficticias. «Gestor de tickets», nunca «agente» ni «operador» (RNF-USA-003). */
export const PERSONAS: readonly Persona[] = [
  { id: 'p-crojas', nombre: 'Carla Rojas', area: 'ATC', rol: 'GESTOR' },
  { id: 'p-dlazo', nombre: 'Diego Lazo', area: 'ATC', rol: 'GESTOR' },
  { id: 'p-gnunez', nombre: 'Gabriela Núñez', area: 'ATC', rol: 'SUPERVISOR' },
  { id: 'p-rsalazar', nombre: 'Renato Salazar', area: 'COBRANZA', rol: 'COLABORADOR' },
  { id: 'p-mpaz', nombre: 'Milagros Paz', area: 'COBRANZA', rol: 'COLABORADOR' },
  { id: 'p-jccama', nombre: 'Julio Ccama', area: 'COBRANZA', rol: 'COLABORADOR' },
  { id: 'p-pvilchez', nombre: 'Patricia Vílchez', area: 'LEGAL', rol: 'LEGAL_RECLAMOS' },
  { id: 'p-lccahuana', nombre: 'Lucía Ccahuana', area: 'POSTVENTA', rol: 'COLABORADOR' },
  { id: 'p-omedina', nombre: 'Óscar Medina', area: 'POSTVENTA', rol: 'COLABORADOR' },
  { id: 'p-khuerta', nombre: 'Kevin Huerta', area: 'TI', rol: 'COLABORADOR' },
  { id: 'p-sramos', nombre: 'Sofía Ramos', area: 'ADMINISTRACION', rol: 'COLABORADOR' },
  { id: 'p-avaldivia', nombre: 'Andrés Valdivia', area: 'CX', rol: 'COORDINADOR_CX' },
  { id: 'p-mtello', nombre: 'Mario Tello', area: 'VENTAS', rol: 'SIN_ATENCION' },
  // Ola 3 (EP-ATC-04): Mesa de Casos SGD, jefatura del Eje 3 y Dirección UX.
  { id: 'p-vortiz', nombre: 'Valeria Ortiz', area: 'LEGAL', rol: 'MESA_SGD' },
  { id: 'p-rcastillo', nombre: 'Roberto Castillo', area: 'LEGAL', rol: 'COLABORADOR' },
  { id: 'p-lbenavides', nombre: 'Lorena Benavides', area: 'CX', rol: 'COORDINADOR_CX' },
  // Ola 5: moderador de EntregaFest y especialista de la Estación 4.
  { id: 'p-fmoreno', nombre: 'Fernando Moreno', area: 'CX', rol: 'MODERADOR_EVENTO' },
  { id: 'p-eaguirre', nombre: 'Elena Aguirre', area: 'LEGAL', rol: 'COLABORADOR' },
  // Ola 6: administrador funcional (flujos y guías).
  { id: 'p-aperez', nombre: 'Alonso Pérez', area: 'ADMINISTRACION', rol: 'ADMIN_FUNCIONAL' },
  // Ola 8: responsables de proyecto, su supervisora comercial, control de acceso, el servicio de formularios y un cliente de Mi Portal.
  { id: 'p-nquispe', nombre: 'Nelly Quispe', area: 'ADMINISTRACION', rol: 'COLABORADOR' },
  { id: 'p-jmarin', nombre: 'Javier Marín', area: 'ADMINISTRACION', rol: 'COLABORADOR' },
  { id: 'p-ctorres', nombre: 'Claudia Torres', area: 'ADMINISTRACION', rol: 'COLABORADOR' },
  { id: 'p-ghuaman', nombre: 'Gustavo Huamán', area: 'ADMINISTRACION', rol: 'CONTROL_ACCESO' },
  { id: 'p-portal', nombre: 'Mi Portal (servicio de formularios)', area: 'CX', rol: 'COLABORADOR' },
  { id: 'p-cliente', nombre: 'Cliente de Mi Portal', area: 'CX', rol: 'CLIENTE' },
]

/** Roles que no operan la consola: ni atienden ni ven módulos internos. */
export const ROLES_EXTERNOS: readonly Rol[] = ['SIN_ATENCION', 'CONTROL_ACCESO', 'CLIENTE']
export const persona = (id: string | null) => PERSONAS.find((p) => p.id === id) ?? null
export const nombrePersona = (id: string | null) => persona(id)?.nombre ?? 'Sin asignar'

/** Quién recibe las alertas de SLA de cada área. SUPUESTO: el supervisor ATC para todas. */
export const DESTINATARIO_ALERTAS = 'p-gnunez'
/** SUPUESTO (pregunta abierta de FT-ATC-04: «¿por qué canal llegan las alertas?»). */
export const CANAL_ALERTAS = 'Notificación en consola'

// ── Ola 3: gate a Eje 3 y Mesa de Casos SGD (EP-ATC-04) ──

/** RN-SVC-021: señales que convierten el ticket en caso de conflicto. */
export const SENALES = ['CARTA_NOTARIAL', 'INDECOPI', 'ABOGADO', 'PRENSA'] as const
export type Senal = (typeof SENALES)[number]
export const NOMBRE_SENAL: Record<Senal, string> = {
  CARTA_NOTARIAL: 'Carta notarial',
  INDECOPI: 'Denuncia o aviso de INDECOPI',
  ABOGADO: 'Intervención de abogado',
  PRENSA: 'Prensa o redes sociales',
}

/** RF-SVC-027: los 6 elementos del paquete mínimo de handoff. */
export const ELEMENTOS_HANDOFF = [
  { id: 'id', nombre: 'Identificación del cliente y del ticket' },
  { id: 'kyc', nombre: 'KYC validado en SIGDA/TAXON' },
  { id: 'lote', nombre: 'Proyecto y lote' },
  { id: 'pagos', nombre: 'Pagos y estado de cuenta' },
  { id: 'atencion', nombre: 'Atención previa' },
  { id: 'paso', nombre: 'Próximo paso propuesto' },
] as const

/** SUPUESTO: la responsable legal cumple el papel de Especialista Legal Senior (confirma el handoff). */
export const ESPECIALISTA_LEGAL = 'p-pvilchez'
/** SUPUESTO: «supervisor del eje destino» = jefatura legal (CA-03 de HU-ATC-027). */
export const JEFATURA_LEGAL = 'p-rcastillo'
/** CA-02 de HU-ATC-028: aviso al Director UX para coordinar la vocería. */
export const DIRECTOR_UX = 'p-lbenavides'

/** CA-03 de HU-ATC-028. SUPUESTO: lista inicial de palabras de juicio (la amplía el PO). */
export const PALABRAS_DE_JUICIO = [
  'grosero', 'grosera', 'conflictivo', 'conflictiva', 'loco', 'loca', 'exagerado', 'exagerada', 'agresivo', 'agresiva',
  'histérico', 'histérica', 'prepotente', 'maleducado', 'maleducada', 'insoportable', 'problemático', 'problemática',
  'mentiroso', 'mentirosa', 'abusivo', 'abusiva', 'malcriado', 'malcriada', 'terco', 'terca',
] as const

/** RN-SVC-014: las 5 líneas de ingreso. SUPUESTO: SLA de línea en días hábiles (pregunta abierta de FT-ATC-08). */
export const LINEAS_SGD = [
  { id: 'INDECOPI', nombre: 'Indecopi', slaDias: 10 },
  { id: 'LIBRO', nombre: 'Libro de Reclamaciones', slaDias: 15 },
  { id: 'CARTA_NOTARIAL', nombre: 'Cartas notariales', slaDias: 10 },
  { id: 'LEGAL_ATIENDE', nombre: 'Legal Atiende (preventivo)', slaDias: 5 },
  { id: 'BACKLOG', nombre: 'Backlog histórico', slaDias: 20 },
] as const
export type LineaSgd = (typeof LINEAS_SGD)[number]['id']
export const lineaSgd = (id: string) => LINEAS_SGD.find((l) => l.id === id) ?? LINEAS_SGD[0]

/** CA-03 de HU-ATC-021: un cargo previo sin activar más de 2 días hábiles deja el caso en limbo. */
export const DIAS_LIMBO = 2

/** SUPUESTO: matriz de riesgo con los pesos de la referencia (pregunta abierta de FT-ATC-08; R-08). */
export const CRITERIOS_RIESGO = [
  { id: 'MONTO', nombre: 'Monto reclamado mayor a S/ 5,000', peso: 25 },
  { id: 'ABOGADO', nombre: 'Intervención de abogado o notaría', peso: 25 },
  { id: 'AUTORIDAD', nombre: 'Autoridad (INDECOPI o fiscalía)', peso: 30 },
  { id: 'MEDIOS', nombre: 'Exposición mediática o en redes', peso: 20 },
  { id: 'REINCIDENCIA', nombre: 'Reincidencia del cliente', peso: 10 },
  { id: 'VULNERABILIDAD', nombre: 'Vulnerabilidad del consumidor', peso: 15 },
] as const
export type NivelRiesgo = 'BAJO' | 'MEDIO' | 'ALTO' | 'MUY_ALTO'
export const NOMBRE_NIVEL_RIESGO: Record<NivelRiesgo, string> = { BAJO: 'Bajo', MEDIO: 'Medio', ALTO: 'Alto', MUY_ALTO: 'Muy alto' }
/** SUPUESTO: umbrales de nivel (≥ 60 muy alto, ≥ 40 alto, ≥ 20 medio). */
export const nivelDeRiesgo = (puntaje: number): NivelRiesgo => (puntaje >= 60 ? 'MUY_ALTO' : puntaje >= 40 ? 'ALTO' : puntaje >= 20 ? 'MEDIO' : 'BAJO')

/**
 * RN-SVC-017: la escalera, sin saltos. SUPUESTO: umbrales en días hábiles respecto del
 * vencimiento del SLA de línea (pregunta abierta de FT-ATC-09).
 */
export const NIVELES_ESCALAMIENTO = [
  { nivel: 1, nombre: 'Alerta preventiva', dias: -2, destinatario: 'p-vortiz' },
  { nivel: 2, nombre: 'Alerta de vencimiento', dias: 0, destinatario: 'p-vortiz' },
  { nivel: 3, nombre: 'Memorándum a la jefatura', dias: 1, destinatario: 'p-rcastillo' },
  { nivel: 4, nombre: 'Comité de Asistentes', dias: 3, destinatario: 'Comité de Asistentes' },
  { nivel: 5, nombre: 'Directorio', dias: 5, destinatario: 'Directorio' },
] as const

/** RN-SVC-019: los 8 estados homologados de cierre. */
export const ESTADOS_CIERRE_SGD = [
  { id: 'CONFORME', nombre: 'Conforme' },
  { id: 'CON_OBSERVACION', nombre: 'Con observación' },
  { id: 'RIESGO_MITIGADO', nombre: 'Con riesgo mitigado' },
  { id: 'CON_CONTINGENCIA', nombre: 'Con contingencia' },
  { id: 'DESISTIMIENTO', nombre: 'Por desistimiento' },
  { id: 'DERIVACION_LEGAL', nombre: 'Por derivación legal' },
  { id: 'REGULARIZACION', nombre: 'Por regularización documentaria' },
  { id: 'ACUERDO', nombre: 'Por acuerdo con cliente' },
] as const
export type EstadoCierreSgd = (typeof ESTADOS_CIERRE_SGD)[number]['id']

/** SUPUESTO: tipos que exigen asiento en el Libro (RequiresComplaintBook; RN-SVC-011). */
export const TIPOS_CON_LIBRO: readonly string[] = ['QUE', 'REC']

/** Plazo legal (RN-SVC-009, Ley 29571 art. 24): 15 días hábiles, una prórroga de 15. */
export const PLAZO_LEGAL_DIAS = 15
/** CA-01 de HU-ATC-015: aviso de cierre de la ventana de prórroga a 3 días hábiles. */
export const AVISO_VENTANA_DIAS = 3
/** SUPUESTO: las alertas legales le llegan a la responsable legal de reclamos. */
export const DESTINATARIO_LEGAL = 'p-pvilchez'
/** SUPUESTO (pregunta abierta de FT-ATC-05: «¿quién firma la carta por razón social?»). */
export const FIRMANTES = ['p-pvilchez'] as const
export const CANALES_PRORROGA = ['Correo con acuse de recibo', 'Carta física con cargo', 'WhatsApp con confirmación de lectura'] as const

/** SUPUESTO: estados de apelación (el paquete solo dice «PENDING … WITHDRAWN»). */
export const ESTADOS_APELACION = ['PENDING', 'UNDER_REVIEW', 'RESOLVED_FOUNDED', 'RESOLVED_UNFOUNDED', 'WITHDRAWN'] as const
export type EstadoApelacion = (typeof ESTADOS_APELACION)[number]
export const NOMBRE_ESTADO_APELACION: Record<EstadoApelacion, string> = {
  PENDING: 'Pendiente',
  UNDER_REVIEW: 'En revisión',
  RESOLVED_FOUNDED: 'Resuelta: fundada',
  RESOLVED_UNFOUNDED: 'Resuelta: infundada',
  WITHDRAWN: 'Desistida',
}
export const NOMBRE_INSTANCIA = { INTERNA: 'Segunda instancia interna', INDECOPI: 'INDECOPI' } as const

/** Feriados de Perú 2026 (calendario MAE_HOLIDAY de prueba). */
export const FERIADOS: readonly string[] = [
  '2026-01-01', '2026-04-02', '2026-04-03', '2026-05-01', '2026-06-07', '2026-06-29', '2026-07-23',
  '2026-07-28', '2026-07-29', '2026-08-06', '2026-08-30', '2026-10-08', '2026-11-01', '2026-12-08',
  '2026-12-09', '2026-12-25', '2027-01-01',
]

/** SUPUESTO (pregunta abierta: «¿cuál es el horario hábil por sede?»). Un solo horario. */
export const HORARIO = { desde: 9, hasta: 18 } as const

/** RN-SVC-025: 72 horas hábiles sin escalamiento. */
export const LIMITE_E2E_HORAS = 72
/** SUPUESTO: plazo del Eje 3 = 10 días hábiles (90 h hábiles con el horario de 9 h). */
export const LIMITE_EJE3_HORAS = 90
/** SUPUESTO: «por vencer» desde el 80 % del plazo end-to-end. */
export const UMBRAL_POR_VENCER = 0.8

export interface Politica {
  readonly id: string
  /** null = genérica global. */
  readonly tipo: string | null
  /** null = genérica del tipo (o global). */
  readonly prioridad: Prioridad | null
  /** Horas hábiles hasta la 1.ª respuesta y hasta la resolución. */
  readonly respuestaH: number
  readonly resolucionH: number
  readonly version: number
}

/** Matriz SLA ILUSTRATIVA (RNF-REN-003 y DEP-03 pendientes). PED no tiene política: cae en la global. */
export const POLITICAS_INICIALES: readonly Politica[] = [
  { id: 'POL-GLOBAL', tipo: null, prioridad: null, respuestaH: 4, resolucionH: 48, version: 1 },
  { id: 'POL-CTA', tipo: 'CTA', prioridad: null, respuestaH: 2, resolucionH: 48, version: 1 },
  { id: 'POL-CTA-URGENT', tipo: 'CTA', prioridad: 'URGENT', respuestaH: 0.5, resolucionH: 8, version: 1 },
  { id: 'POL-CTA-HIGH', tipo: 'CTA', prioridad: 'HIGH', respuestaH: 1, resolucionH: 24, version: 1 },
  { id: 'POL-VIS', tipo: 'VIS', prioridad: null, respuestaH: 8, resolucionH: 120, version: 1 },
  { id: 'POL-VIS-HIGH', tipo: 'VIS', prioridad: 'HIGH', respuestaH: 2, resolucionH: 48, version: 1 },
  { id: 'POL-QUE', tipo: 'QUE', prioridad: null, respuestaH: 4, resolucionH: 72, version: 1 },
  { id: 'POL-REC', tipo: 'REC', prioridad: null, respuestaH: 4, resolucionH: 72, version: 1 },
  { id: 'POL-GAR', tipo: 'GAR', prioridad: null, respuestaH: 8, resolucionH: 120, version: 1 },
  { id: 'POL-CIT', tipo: 'CIT', prioridad: null, respuestaH: 1, resolucionH: 24, version: 1 },
  { id: 'POL-CIT-URGENT', tipo: 'CIT', prioridad: 'URGENT', respuestaH: 0.25, resolucionH: 4, version: 1 },
  { id: 'POL-RES', tipo: 'RES', prioridad: null, respuestaH: 4, resolucionH: 240, version: 1 },
  { id: 'POL-ING', tipo: 'ING', prioridad: null, respuestaH: 2, resolucionH: 24, version: 1 },
  { id: 'POL-RSV', tipo: 'RSV', prioridad: null, respuestaH: 4, resolucionH: 48, version: 1 },
]

export const nombreTipo = (id: string) => TIPOS.find((t) => t.id === id)?.nombre ?? id
export const nombrePrioridad = (id: string) => PRIORIDADES.find((p) => p.id === id)?.nombre ?? id
export const empresa = (id: string) => EMPRESAS.find((e) => e.id === id) ?? null
