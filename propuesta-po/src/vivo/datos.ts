// Datos de ejemplo de la «Operación en Vivo» de la rama de Daniel, tal cual (origin/prototipo-polar):
//  · canales, salas y tipos de la simulación: frontend/src/app/pantallas/atc/datos-atc.ts (PUERTAS_CANAL, SALAS_OFICINA, TIPOS_SIMULACION);
//  · clientes, líderes, colores y fichas de estación: frontend/src/app/pantallas/atc/vista-vivo.ts.
// Solo se quitan los `export` que no se usan y se exportan los que lee la vista.
type RGB = readonly [number, number, number] | readonly number[];

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

export interface TicketVivo {
  id: string;
  numero: string;
  gate: string;
  type: string;
  area: string;
  cli: string;
  lote: string;
  prio: 'Normal' | 'Alta' | 'Urgente';
  rayo: boolean;
  etapa: 'bandeja' | 'cola' | 'atencion' | 'salida';
  stateRf004: 'OPEN' | 'IN_PROGRESS' | 'PENDING_CUSTOMER' | 'ESCALATED' | 'REOPENED' | 'RESOLVED' | 'CLOSED';
  resp?: string;
  respNombre?: string;
  workNeed: number;
  workDone: number;
  age: number;
  slaMax: number;
  esc: boolean;
  resumen: string;
  hitos: string[];
}

export interface CorreoAsignacionLog {
  readonly id: string;
  readonly hora: string;
  readonly ticketId: string;
  readonly gestor: string;
  readonly liderCopia: string;
  readonly sala: string;
  readonly slaTexto: string;
}

export const CLIENTES_SIM: readonly (readonly [string, string, string])[] = [
  ['Elena Torres', 'Villa Sol II · Lote C-07', 'Consulta de cupo en bus EntregaFest y pase QR'],
  ['Lucía Paredes', 'Mirador del Sur · Lote C-21', 'Inspección de fisura en muro perimétrico (Garantía)'],
  ['Jorge Ramos', 'Los Álamos I · Lote A-03', 'Reclamo por demora de minuta y suspensión de resolución'],
  ['María Quispe', 'Villa Sol II · Lote B-14', 'Validación de voucher de cuota pagada en agente BCP'],
  ['Carlos Mendoza', 'Praderas de Lurín · Lote D-09', 'Solicitud de estado de cuenta y cronograma actualizado'],
  ['Rosa Chávez', 'Oasis de Ancón · Lote E-02', 'Confirmación de asistencia familiar a EntregaFest'],
  ['Pedro Soto', 'Valle Verde · Lote A-18', 'Consulta sobre independización registral y firma'],
  ['Ana Flores', 'Bosques del Norte · Lote F-11', 'Reporte de alumbrado en vía principal del proyecto'],
];

export const LIDERES_SALA: Readonly<Record<string, string>> = {
  eje1: 'Sup. Mirtha Delgado (Líder ATC)',
  cob: 'Jefe Raúl Cárdenas (Líder Cobranza)',
  libro: 'Dra. Patricia Vílchez (Oficial Cumplimiento)',
  legal: 'Dr. Ernesto Alarcón (Gerencia Legal Eje 3)',
  post: 'Ing. Roberto Castañeda (Jefe Postventa)',
  proy: 'Arq. Claudia Mendoza (Responsable Proyecto)',
};

export const COLOR_ZONA_RGB: Readonly<Record<string, RGB>> = {
  eje1: [43, 138, 156],
  cob: [245, 158, 11],
  libro: [236, 72, 153],
  legal: [139, 92, 246],
  post: [16, 185, 129],
  proy: [6, 182, 212],
};

export const COLOR_CANAL_RGB: Readonly<Record<string, RGB>> = {
  tel: [56, 189, 248],
  wa: [34, 197, 94],
  mail: [129, 140, 248],
  portal: [245, 158, 11],
  form: [236, 72, 212],
};

export interface MetaEstacionVivo {
  readonly clave: string;
  readonly categoria: 'Canal de entrada' | 'Orquestación' | 'Área operativa' | 'Escalamiento' | 'Cierre y CX';
  readonly nombre: string;
  readonly hu: string;
  readonly rfRn: string;
  readonly entidad: string;
  readonly lider: string;
  readonly slaRegla: string;
  readonly inputsReales: string;
  readonly areaKey?: string;
  readonly gateKey?: string;
}

export const META_ESTACIONES_VIVO: Readonly<Record<string, MetaEstacionVivo>> = {
  'canal:tel': {
    clave: 'canal:tel',
    categoria: 'Canal de entrada',
    nombre: 'Call Center / Teléfono (CTI)',
    hu: 'Identificación automática y grabación',
    rfRn: 'Enlace telefónico CTI con apertura de ticket por consulta',
    entidad: 'Central Telefónica CTI',
    lider: 'Sup. Mirtha Delgado (Líder ATC)',
    slaRegla: 'Identificación automática por número o DNI y grabación vinculada al ticket.',
    inputsReales: 'Teléfono entrante (ANI), DNI/CE, motivo tipificado, grabación de llamada y casillero único por consulta.',
    gateKey: 'tel',
  },
  'canal:wa': {
    clave: 'canal:wa',
    categoria: 'Canal de entrada',
    nombre: 'WhatsApp Corporativo',
    hu: 'Mensajería verificada multicanal',
    rfRn: 'Apertura de casillero independiente por consulta',
    entidad: 'Canal WhatsApp Oficial',
    lider: 'Sup. Mirtha Delgado (Líder ATC)',
    slaRegla: '1 casillero (ticket) por cada consulta distinta del cliente.',
    inputsReales: 'Número WhatsApp verificado, texto/audios/fotos de sustento, lote asociado y consentimiento.',
    gateKey: 'wa',
  },
  'canal:mail': {
    clave: 'canal:mail',
    categoria: 'Canal de entrada',
    nombre: 'Correo Electrónico ATC',
    hu: 'Buzón corporativo con acuse',
    rfRn: 'Notificación automática al cliente y al líder de área',
    entidad: 'Buzón Digital ATC',
    lider: 'Sup. Mirtha Delgado (Líder ATC)',
    slaRegla: 'Acuse automático con código de seguimiento y alerta por correo en cada asignación.',
    inputsReales: 'Remitente, asunto, cuerpo del mensaje, adjuntos PDF/imagen y vínculo con contrato/lote.',
    gateKey: 'mail',
  },
  'canal:portal': {
    clave: 'canal:portal',
    categoria: 'Canal de entrada',
    nombre: 'Mi Portal (Autogestión Cliente)',
    hu: 'Seguimiento en vivo y conformidad',
    rfRn: 'Confirmación del titular para cierre definitivo',
    entidad: 'Portal del Propietario',
    lider: 'Coordinación CX / Mi Portal',
    slaRegla: 'El cliente ve el estado en vivo y confirma la solución para cerrar el ticket.',
    inputsReales: 'Sesión autenticada del titular en Mi Portal, lote seleccionado, tipo de solicitud y adjuntos.',
    gateKey: 'portal',
  },
  'canal:form': {
    clave: 'canal:form',
    categoria: 'Canal de entrada',
    nombre: 'Formulario QR / Pórtico de Obra',
    hu: 'Control de visitas y pre-tickets en campo',
    rfRn: 'Registro rápido en pórtico y captura de evidencias',
    entidad: 'Control de Accesos Obra',
    lider: 'Arq. Claudia Mendoza (Responsable Proyecto)',
    slaRegla: 'Registro rápido de ingreso a proyecto en pórtico y derivación directa a obra.',
    inputsReales: 'DNI visitante/propietario, manzana-lote, placa de vehículo, motivo de visita a obra y pase QR.',
    gateKey: 'form',
  },
  'etapa:bandeja': {
    clave: 'etapa:bandeja',
    categoria: 'Orquestación',
    nombre: 'Bandeja Orquestadora Central (Robot Despachador)',
    hu: 'Despacho inteligente por prioridad y carga',
    rfRn: 'Tope máximo de 10% de cola con prioridad Rayo',
    entidad: 'Motor de Despacho ATC',
    lider: 'Sup. Mirtha Delgado (Supervisión Orquestación)',
    slaRegla: 'Orden estricto: 1.º Rayo (máx. 10% de cola) · 2.º SLA más próximo a vencer · 3.º Prioridad · Menor carga.',
    inputsReales: 'Tipificación en 5 familias, prioridad, marca Rayo con motivo obligatorio, carga por gestor y correo CC al líder.',
  },
  'sala:eje1': {
    clave: 'sala:eje1',
    categoria: 'Área operativa',
    nombre: 'Atención Eje 1 (ATC General)',
    hu: 'Consultas generales, pedidos y primera línea',
    rfRn: 'Base de conocimiento y casillero único por consulta',
    entidad: 'Área Atención Eje 1',
    lider: LIDERES_SALA['eje1'],
    slaRegla: '1.ª respuesta ≤ 2 h hábiles · Resolución consultas/pedidos simples ≤ 24 h hábiles.',
    inputsReales: 'Consultas generales, pedidos simples, guía de solución recomendada y casillero independiente por consulta.',
    areaKey: 'eje1',
  },
  'sala:cob': {
    clave: 'sala:cob',
    categoria: 'Área operativa',
    nombre: 'Cobranza (Eje 2 · Financiamiento y Letras)',
    hu: 'Validación de abonos, letras y prevención de mora',
    rfRn: 'Sincronización con Motor de Cobranza y control de resolución',
    entidad: 'Área de Cobranza y Cartera',
    lider: LIDERES_SALA['cob'],
    slaRegla: 'Validación de abonos ≤ 24 h · Alerta automática al cumplir 3 meses de letras impagas.',
    inputsReales: 'Vouchers de pago, cronograma de letras, estado de cartera en línea, carta de resolución y alerta paralela de cancelación.',
    areaKey: 'cob',
  },
  'sala:libro': {
    clave: 'sala:libro',
    categoria: 'Área operativa',
    nombre: 'Libro de Reclamaciones (INDECOPI)',
    hu: 'Gestión legal de quejas y reclamos de consumo',
    rfRn: 'Plazo legal Ley 29571 con control de prórroga y cargo',
    entidad: 'Oficialía de Cumplimiento',
    lider: LIDERES_SALA['libro'],
    slaRegla: 'Plazo legal improrrogable de 15 días hábiles (Ley 29571) con 1 sola prórroga motivada.',
    inputsReales: 'Asiento correlativo (Queja / Reclamo), pedido concreto del consumidor, cargo de notificación al cliente, control de huérfanos y expediente INDECOPI.',
    areaKey: 'libro',
  },
  'sala:legal': {
    clave: 'sala:legal',
    categoria: 'Área operativa',
    nombre: 'Legal · Eje 3 (Handoff y Custodia)',
    hu: 'Dictamen jurídico y custodia probatoria',
    rfRn: 'Validación obligatoria de checklist documental 6/6',
    entidad: 'Gerencia Legal Eje 3',
    lider: LIDERES_SALA['legal'],
    slaRegla: 'No acepta derivación sin paquete documental completo 6/6 validado.',
    inputsReales: 'Checklist 6/6 (contrato, estado de cuenta, cartas previas, evidencias, hoja de ruta y dictamen), resolución legal y custodia probatoria inmutable.',
    areaKey: 'legal',
  },
  'sala:post': {
    clave: 'sala:post',
    categoria: 'Área operativa',
    nombre: 'Postventa (Eje 4 · Garantías e Inspección)',
    hu: 'Cobertura de garantías, visitas técnicas y cuadrillas',
    rfRn: 'Matriz de vigencia en meses desde el Acta de Entrega',
    entidad: 'Ingeniería de Postventa',
    lider: LIDERES_SALA['post'],
    slaRegla: 'Vigencia calculada en meses desde el Acta de Entrega · Inspección de campo y control de reincidencia.',
    inputsReales: 'Fecha de acta de entrega, partida observada (infraestructura/acabados), vigencia en meses, informe de visita técnica, presupuesto y acta de conformidad.',
    areaKey: 'post',
  },
  'sala:proy': {
    clave: 'sala:proy',
    categoria: 'Área operativa',
    nombre: 'Proyecto · Entrega Fest (Administración / Obra)',
    hu: 'Visitas a proyecto y logística de eventos de entrega',
    rfRn: 'Control de cupos por bus, asistencia QR y encuestas',
    entidad: 'Administración de Proyectos',
    lider: LIDERES_SALA['proy'],
    slaRegla: 'Control de aforo por bus y bloqueo automático de sobrecupo en EntregaFest.',
    inputsReales: 'Formulario de ingreso a proyecto (DNI, lote, motivo, fecha/hora) y padrón de buses, asientos y pases QR de EntregaFest.',
    areaKey: 'proy',
  },
  'etapa:comite': {
    clave: 'etapa:comite',
    categoria: 'Escalamiento',
    nombre: 'Comité (Mesa SGD · Casos Complejos y Vencidos)',
    hu: 'Escalamiento automático y acuerdos multidisciplinarios',
    rfRn: 'Matriz objetiva de riesgo y trazabilidad de acuerdos',
    entidad: 'Mesa de Comité SGD',
    lider: 'Comité Multidisciplinario SGD (ATC + Legal + Cobranza + Proyectos)',
    slaRegla: 'Todo ticket cuyo SLA vence escala automáticamente en cadena (Gestor · Supervisor · Jefe · Comité SGD).',
    inputsReales: 'Registro multilínea por lote/contrato, matriz objetiva de riesgo, acuerdos de comité con responsables y casos cruzados.',
  },
  'etapa:salida': {
    clave: 'etapa:salida',
    categoria: 'Cierre y CX',
    nombre: 'Cierre en Mi Portal + Encuesta CSAT / CES / NPS',
    hu: 'Conformidad del propietario y medición de satisfacción',
    rfRn: 'Doble paso Resuelto a Cerrado y alerta de detractores',
    entidad: 'Experiencia del Cliente (CX)',
    lider: 'Coordinación CX / Calidad de Atención',
    slaRegla: 'Un ticket resuelto solo pasa a cerrado cuando el cliente confirma en Mi Portal o vence la ventana de conformidad; dispara encuesta CSAT/CES/NPS.',
    inputsReales: 'Evidencia de solución cargada por el gestor, confirmación del cliente en Mi Portal, calificación CSAT (1-5), CES y NPS (-100 a +100) y alerta de detractor.',
  },
};
