/**
 * Guion de Tigo (lógica PURA, sin Angular). Propuesta fuera de la Etapa 1, todo simulado.
 * ADR-007 / RN-SVC-032: la IA sugiere, el gestor decide. Tigo ejecuta solo lo interno y reversible;
 * lo que sale al cliente o resuelve/cierra queda `pendiente` hasta que el gestor lo aprueba.
 * Determinista: sin Math.random ni Date.now; las horas salen del reloj simulado que entrega el servicio.
 */
// Solo tipos de datos-atc: el runner de pruebas (node) no resuelve imports de valores sin extensión.
import type { Cliente360, InteraccionTicket, TicketAtc } from '../datos-atc';
import type { EtapaTigo, PropuestaTigo } from './tigo-modelo';

/** Mismo valor que `autoAsignarMenorCarga` de vista-operacion.ts. */
export const RESPONSABLE_MENOR_CARGA = 'M. Delgado';
const DETALLE_CARGA = 'Menor carga · 2 activos';

/** Minutos simulados que avanza el reloj al ejecutar cada etapa (acumulativos, deterministas). */
export const MINUTOS_POR_ETAPA: Record<EtapaTigo, number> = {
  registro: 0,
  enrutamiento: 1,
  atencion: 4,
  cierre: 3,
  postcierre: 2,
};

export const sumarMinutos = (base: Date, min: number): Date => new Date(base.getTime() + min * 60_000);
export const NOTA_ASIGNACION =
  'Asignado automáticamente por balanceador de carga (correo enviado con CC al líder de área).';

export type PropuestaBase = Omit<PropuestaTigo, 'id' | 'ticket' | 'creada'>;

/** Parche declarativo sobre el ticket. */
export type EfectoTicket =
  | { tipo: 'clasificar'; tipoId: string; subtipo?: string }
  | { tipo: 'estado'; valor: TicketAtc['state'] }
  | { tipo: 'asignar'; responsable: string; area?: string }
  | { tipo: 'bitacora'; motivo: string; nota: string }
  | { tipo: 'interaccion'; interaccion: Omit<InteraccionTicket, 'fecha'> }
  /** Respuesta visible al cliente con el texto final que aprobó el gestor (autor = gestor). */
  | { tipo: 'respuesta-gestor' }
  | { tipo: 'completar-actividad' }
  /** Registra el asiento del Libro de Reclamaciones (lo hace el servicio con la lógica de la consola). */
  | { tipo: 'asiento-libro' }
  /** Marca el ticket como conflicto de Eje 3 (derivación a Legal). */
  | { tipo: 'conflicto-eje3' }
  | { tipo: 'resuelto' }
  | { tipo: 'cerrado' };

/** Una propuesta pendiente lleva los efectos que se aplican SOLO si el gestor la aprueba. */
export type PropuestaGuion = PropuestaBase & { efectosAlAprobar?: EfectoTicket[] };

export interface PasoGuion {
  etapa: EtapaTigo;
  retardoMs: number;
  propuestas: PropuestaGuion[];
  /** Efectos que Tigo aplica al ejecutar el paso (solo acciones internas o simuladas). */
  efectos: EfectoTicket[];
}

/* ── Guardarraíles ── */

/** Lo que escribió el cliente más el resumen del ticket. */
export const textoDelCliente = (t: TicketAtc): string =>
  [...t.interactions.filter((i) => i.tipo === 'cli').map((i) => i.texto), t.summary].join(' ');

export type NivelRiesgo = 'ninguno' | 'medio' | 'alto';

/** Amenazas legales o públicas. */
const RIESGO_ALTO = [
  'denuncia', 'denunciar', 'indecopi', 'demanda', 'demandar', 'abogado', 'estafa', 'estafador', 'fraude',
  'carta notarial', 'fiscalía', 'acciones legales', 'publicar en redes', 'publico en redes', 'redes sociales',
];
/** Hostilidad sin amenaza formal. */
const RIESGO_MEDIO = ['inaceptable', 'harto', 'harta', 'sinvergüenza', 'abuso', 'tomadura de pelo', 'es una burla', 'me engañaron'];

const sinTildes = (s: string): string => s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');

/**
 * Señales de riesgo verbal por palabras y frases (regla simple, ponytail: sin NLP; se amplía editando las listas).
 * Alto: amenaza de denuncia, INDECOPI, demanda, abogado, estafa o publicación en redes. Medio: hostilidad.
 */
export function detectarSenalesRiesgo(texto: string): { nivel: NivelRiesgo; frases: string[] } {
  const t = sinTildes(texto);
  const hallar = (lista: readonly string[]): string[] => lista.filter((f) => new RegExp(`(?<![a-z])${sinTildes(f)}`).test(t));
  const alto = hallar(RIESGO_ALTO);
  const medio = hallar(RIESGO_MEDIO);
  return { nivel: alto.length ? 'alto' : medio.length ? 'medio' : 'ninguno', frases: [...alto, ...medio] };
}

export function evaluarGuardarrailes(t: TicketAtc): { permitido: boolean; motivo?: string } {
  if (t.conflict) return { permitido: false, motivo: 'Hay una señal de conflicto activa: lo atiende una persona.' };
  const riesgo = detectarSenalesRiesgo(textoDelCliente(t));
  if (riesgo.nivel !== 'ninguno') {
    return { permitido: false, motivo: `Señal de riesgo verbal (${riesgo.nivel}) en el mensaje del cliente: lo atiende una persona.` };
  }
  if (t.eje === 3) return { permitido: false, motivo: 'Es un caso de Eje 3 (Legal): Tigo no interviene.' };
  // QUE y REC son los tipos con `libro: true` en TIPOS_TICKET (Libro de Reclamaciones).
  if (t.type === 'QUE' || t.type === 'REC') {
    return { permitido: false, motivo: 'Es un asiento del Libro de Reclamaciones: requiere atención humana.' };
  }
  if (t.rayo) return { permitido: false, motivo: 'Tiene señal de rayo (urgencia del supervisor): lo atiende una persona.' };
  if (t.type === 'RES') return { permitido: false, motivo: 'Una resolución de contrato no se automatiza.' };
  return { permitido: true };
}

/* ── Anonimización ── */

export interface CtxAnonimizar {
  cliente?: string | null;
  dni?: string;
  contrato?: string | null;
}

const escapar = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function anonimizar(texto: string, ctx: CtxAnonimizar): { texto: string; cantidad: number; marcas: string[] } {
  let t = texto;
  let cantidad = 0;
  const marcas = new Set<string>();
  const reemplazar = (re: RegExp, marca: string): void => {
    t = t.replace(re, () => {
      cantidad++;
      marcas.add(marca);
      return marca;
    });
  };
  if (ctx.cliente) {
    reemplazar(new RegExp(escapar(ctx.cliente), 'gi'), '[CLIENTE]');
    for (const parte of ctx.cliente.split(/\s+/).filter((p) => p.length > 2)) {
      reemplazar(new RegExp(`(?<![\\p{L}])${escapar(parte)}(?![\\p{L}])`, 'giu'), '[CLIENTE]');
    }
  }
  if (ctx.contrato) reemplazar(new RegExp(escapar(ctx.contrato), 'gi'), '[CONTRATO]');
  reemplazar(/(?<!\d)(?:\d[ -]?){13,19}(?!\d)/g, '[TARJETA]');
  reemplazar(/(?<!\d)(?:\+51[ -]?)?9\d{2}[ -]?\d{3}[ -]?\d{3}(?!\d)/g, '[TELÉFONO]');
  reemplazar(/(?<!\d)\d{8}(?!\d)/g, '[DNI]');
  return { texto: t, cantidad, marcas: [...marcas] };
}

/* ── Escenario A: Consulta de cuenta (Estado de cuenta) de punta a punta ── */

export interface CtxEscenario {
  ticket: TicketAtc;
  ahora: () => Date;
  /** Flujo CTA vigente (de `obtenerFlujoActivo`). */
  flujo: { version: number; area: string; actividades: string[] };
  /** Guía CTA vigente (de `obtenerGuiaActiva`); sin ella Tigo usa un texto genérico. */
  guia?: { version: number | null; pasos: string[]; plantillas: string[]; criterios: string[] };
  /** Subtipo «Estado de cuenta» del catálogo, si existe y está activo. */
  subtipo?: { id: string; nombre: string };
  /** Coincidencia en Consulta 360 (por DNI o nombre), si la hay; si no, Tigo usa datos sintéticos. */
  cliente360?: Cliente360;
}

/** Datos sintéticos del «motor de consultas»: no hay ninguna consulta real. */
const MOTOR_SINTETICO = {
  cuotasPagadas: 13,
  cuotasTotales: 36,
  saldo: 'S/ 48 250.00',
  mora: 'Sin mora exigible',
  operacion: '00471529',
  ultimoPago: '12/10/2026',
};

/** Marcadores de la plantilla de la guía que se resuelven con el motor de consultas. */
const resolverPlantilla = (plantilla: string, resumen: string): string =>
  plantilla
    .replace(/\{resumen\}/g, resumen)
    .replace(/\{operacion\}/g, MOTOR_SINTETICO.operacion)
    .replace(/\{ultimoPago\}/g, MOTOR_SINTETICO.ultimoPago)
    .replace(/\s{2,}/g, ' ')
    .trim();

const NOTA_GUIA_MEJORADA = 'Incluye lo que los gestores solían agregar a mano (guía mejorada por propuesta de Tigo).';

export function construirEscenarioA(ctx: CtxEscenario): PasoGuion[] {
  const t = ctx.ticket;
  const guardarrail = evaluarGuardarrailes(t);
  const textoCliente = t.interactions.find((i) => i.tipo === 'cli')?.texto ?? t.summary;
  const anon = anonimizar(textoCliente, { cliente: t.cli, dni: t.dni, contrato: t.contract });
  const guia = ctx.guia;
  const cli360 = ctx.cliente360;
  const m = MOTOR_SINTETICO;
  const act1 = ctx.flujo.actividades[0] ?? 'Validación';

  const registro: PasoGuion = {
    etapa: 'registro',
    retardoMs: 1200,
    efectos: guardarrail.permitido ? [{ tipo: 'clasificar', tipoId: 'CTA', subtipo: ctx.subtipo?.id }] : [],
    propuestas: [
      {
        etapa: 'registro',
        accion: 'clasificar',
        titulo: `Clasifiqué el pedido como «Consulta de cuenta»${ctx.subtipo ? ` · ${ctx.subtipo.nombre}` : ''}`,
        detalle: 'Tipo y subtipo según el catálogo vigente.',
        estado: 'ejecutada',
        requiereAprobacion: false,
      },
      {
        etapa: 'registro',
        accion: 'anonimizar',
        titulo: `Anonimicé el mensaje del cliente (${anon.cantidad} dato${anon.cantidad === 1 ? '' : 's'})`,
        detalle: 'Solo el texto anonimizado llega al modelo (ADR-007).',
        lineas: [anon.texto, ...(anon.marcas.length ? [`Marcas: ${anon.marcas.join(', ')}`] : [])],
        estado: 'ejecutada',
        requiereAprobacion: false,
      },
      {
        etapa: 'registro',
        accion: 'guardarrailes',
        titulo: guardarrail.permitido ? 'Sin conflicto ni riesgo: Tigo puede atenderlo' : 'Tigo no interviene',
        detalle: guardarrail.motivo ?? 'No hay conflicto, Eje 3, Libro de Reclamaciones ni señal de rayo.',
        estado: guardarrail.permitido ? 'ejecutada' : 'bloqueada',
        requiereAprobacion: false,
      },
    ],
  };
  // Si los guardarraíles bloquean, el guion se reduce al registro: `proximoPaso` termina ahí.
  if (!guardarrail.permitido) return [registro];

  const enrutamiento: PasoGuion = {
    etapa: 'enrutamiento',
    retardoMs: 1500,
    efectos: [
      { tipo: 'asignar', responsable: RESPONSABLE_MENOR_CARGA },
      { tipo: 'estado', valor: 'IN_PROGRESS' },
      { tipo: 'bitacora', motivo: 'TIGO_ASIGNACION', nota: `${NOTA_ASIGNACION} ${RESPONSABLE_MENOR_CARGA}: ${DETALLE_CARGA}.` },
      {
        tipo: 'interaccion',
        interaccion: {
          tipo: 'sys',
          autor: 'Tigo',
          texto: `Correo de asignación enviado a ${RESPONSABLE_MENOR_CARGA} (${DETALLE_CARGA}) con copia al líder del área (HU-055).`,
        },
      },
    ],
    propuestas: [
      {
        etapa: 'enrutamiento',
        accion: 'enrutar',
        titulo: `Cité el flujo CTA v${ctx.flujo.version}`,
        detalle: `Área ${ctx.flujo.area}`,
        lineas: ctx.flujo.actividades.map((a, i) => `${i + 1}. ${a}`),
        estado: 'ejecutada',
        requiereAprobacion: false,
      },
      {
        etapa: 'enrutamiento',
        accion: 'asignar',
        titulo: `Asigné a ${RESPONSABLE_MENOR_CARGA} (${DETALLE_CARGA})`,
        detalle: 'Gestor de menor carga. El ticket pasa a En curso. Correo de asignación con copia al líder (HU-055).',
        estado: 'ejecutada',
        requiereAprobacion: false,
      },
    ],
  };

  const resumen360 = cli360
    ? [cli360.sintesisIa, `Contrato ${cli360.contratoPrincipal} · ${cli360.proyecto}`]
    : [
        `${t.cli} · ${t.proj}`,
        `Contrato ${t.contract ?? 'sin contrato'}: ${m.cuotasPagadas} de ${m.cuotasTotales} cuotas pagadas, ${m.mora.toLowerCase()}.`,
      ];
  const plantillaGuia = guia?.plantillas[0] ?? 'Atendimos tu solicitud «{resumen}».';
  const plantilla = resolverPlantilla(plantillaGuia, t.summary);
  const guiaMejorada = /\{(operacion|ultimoPago)\}/.test(plantillaGuia);
  const borrador = `${plantilla} Registras ${m.cuotasPagadas} de ${m.cuotasTotales} cuotas pagadas y un saldo de ${m.saldo}.`;

  const atencion: PasoGuion = {
    etapa: 'atencion',
    retardoMs: 2000,
    efectos: [
      { tipo: 'completar-actividad' },
      {
        tipo: 'interaccion',
        interaccion: {
          tipo: 'int',
          autor: 'Tigo',
          texto: `Actividad 1 completada: «${act1}». Motor de consultas: ${m.cuotasPagadas}/${m.cuotasTotales} cuotas pagadas, saldo ${m.saldo}.`,
        },
      },
    ],
    propuestas: [
      {
        etapa: 'atencion',
        accion: 'resumir360',
        titulo: 'Resumí la Consulta 360 del cliente',
        detalle: cli360 ? 'Coincidencia en Consulta 360.' : 'Datos sintéticos coherentes con el ticket.',
        lineas: resumen360,
        estado: 'ejecutada',
        requiereAprobacion: false,
      },
      {
        etapa: 'atencion',
        accion: 'citar-guia',
        titulo: `Cité la guía CTA${guia?.version ? ` v${guia.version}` : ''}`,
        detalle: guia ? 'Pasos de la guía vigente.' : 'No hay guía publicada para este tipo.',
        lineas: guia?.pasos.map((p, i) => `${i + 1}. ${p}`),
        estado: 'ejecutada',
        requiereAprobacion: false,
      },
      {
        etapa: 'atencion',
        accion: 'consultar-motor',
        titulo: 'Consulté el Motor de Consultas (resultado sintético)',
        detalle: 'Dato de demostración, no sale de ningún sistema real.',
        lineas: [`Cuotas pagadas: ${m.cuotasPagadas} de ${m.cuotasTotales}`, `Saldo: ${m.saldo}`, m.mora],
        estado: 'ejecutada',
        requiereAprobacion: false,
      },
      {
        etapa: 'atencion',
        accion: 'completar-actividad',
        titulo: `Completé la actividad 1: ${act1}`,
        detalle: 'Actividad interna y reversible.',
        estado: 'ejecutada',
        requiereAprobacion: false,
      },
      {
        etapa: 'atencion',
        accion: 'redactar',
        titulo: 'Borrador de respuesta al cliente',
        detalle: `Sale al cliente: espera la aprobación del gestor.${guiaMejorada ? ` ${NOTA_GUIA_MEJORADA}` : ''}`,
        texto: borrador,
        estado: 'pendiente',
        requiereAprobacion: true,
      },
    ],
  };

  const cierre: PasoGuion = {
    etapa: 'cierre',
    retardoMs: 1500,
    efectos: [],
    propuestas: [
      {
        etapa: 'cierre',
        accion: 'resolver',
        titulo: 'Enviar la respuesta, completar la última actividad y resolver',
        detalle: 'Resuelve el ticket: espera la aprobación del gestor.',
        lineas: [
          ...(guia?.criterios ?? []),
          `Última actividad: ${ctx.flujo.actividades.at(-1) ?? 'Cierre'}`,
        ],
        estado: 'pendiente',
        requiereAprobacion: true,
        efectosAlAprobar: [{ tipo: 'respuesta-gestor' }, { tipo: 'completar-actividad' }, { tipo: 'resuelto' }],
      },
    ],
  };

  const postcierre: PasoGuion = {
    etapa: 'postcierre',
    retardoMs: 2500,
    efectos: [
      {
        tipo: 'interaccion',
        interaccion: { tipo: 'cli', canal: 'Mi Portal', autor: t.cli, texto: 'Confirmo que recibí el estado de cuenta, gracias.' },
      },
      { tipo: 'cerrado' },
      { tipo: 'interaccion', interaccion: { tipo: 'sys', autor: 'Tigo', texto: 'Encuesta CSAT/CES enviada al cliente.' } },
    ],
    propuestas: [
      {
        etapa: 'postcierre',
        accion: 'confirmar-cliente',
        titulo: 'El cliente confirma la solución en Mi Portal',
        detalle: 'Acción del cliente simulada.',
        simulada: true,
        estado: 'ejecutada',
        requiereAprobacion: false,
      },
      {
        etapa: 'postcierre',
        accion: 'encuesta',
        titulo: 'Disparé la encuesta CSAT/CES',
        detalle: 'Encuesta simulada.',
        simulada: true,
        estado: 'ejecutada',
        requiereAprobacion: false,
      },
    ],
  };

  return [registro, enrutamiento, atencion, cierre, postcierre];
}

/* ── Escenario B: Queja → Libro de Reclamaciones (Tigo prepara, decide una persona) ── */

/** Plazo legal del Libro de Reclamaciones (Ley 31435). */
export const PLAZO_LIBRO_DIAS = 15;
export const RESPONSABLE_LEGAL = 'Dra. P. Vílchez';

/** Acciones que marcan un escenario sin Cierre ni Post-cierre (Tigo nunca resuelve ni cierra B ni C). */
const ACCIONES_SIN_CIERRE = ['detectar-libro', 'detectar-riesgo'];
export const sinCierre = (propuestas: readonly { accion: string }[]): boolean =>
  propuestas.some((p) => ACCIONES_SIN_CIERRE.includes(p.accion));

const fechaCorta = (d: Date): string => d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });

export interface CtxEscenarioB {
  ticket: TicketAtc;
  /** Guía de Queja vigente, si existe; sin ella Tigo lo dice. */
  guia?: { version: number | null; pasos: string[]; plantillas: string[]; criterios: string[] };
  /** Vencimiento del plazo legal: `PLAZO_LIBRO_DIAS` días hábiles desde la apertura (lo calcula el servicio). */
  venceLibro: Date;
}

const prop = (
  etapa: EtapaTigo,
  accion: string,
  titulo: string,
  detalle: string,
  extra: Partial<PropuestaGuion> = {},
): PropuestaGuion => ({ etapa, accion, titulo, detalle, estado: 'ejecutada', requiereAprobacion: false, ...extra });

const lineasAnonimas = (anon: ReturnType<typeof anonimizar>): string[] => [
  anon.texto,
  ...(anon.marcas.length ? [`Marcas: ${anon.marcas.join(', ')}`] : []),
];
const tituloAnon = (n: number): string => `Anonimicé el mensaje del cliente (${n} dato${n === 1 ? '' : 's'})`;

export function construirEscenarioB(ctx: CtxEscenarioB): PasoGuion[] {
  const t = ctx.ticket;
  const anon = anonimizar(textoDelCliente(t), { cliente: t.cli, dni: t.dni, contrato: t.contract });
  const vence = fechaCorta(ctx.venceLibro);
  const guia = ctx.guia;
  const pendiente = (accion: string, titulo: string, detalle: string, extra: Partial<PropuestaGuion>): PropuestaGuion =>
    prop('atencion', accion, titulo, detalle, { estado: 'pendiente', requiereAprobacion: true, ...extra });

  return [
    {
      etapa: 'registro',
      retardoMs: 1200,
      efectos: [{ tipo: 'clasificar', tipoId: 'QUE' }],
      propuestas: [
        prop('registro', 'clasificar', 'Clasifiqué el pedido como «Queja»', 'Reclamo de servicio según el catálogo vigente.'),
        prop('registro', 'anonimizar', tituloAnon(anon.cantidad), 'Solo el texto anonimizado llega al modelo (ADR-007).', {
          lineas: lineasAnonimas(anon),
        }),
        prop(
          'registro',
          'detectar-libro',
          'Detecté que una Queja va al Libro de Reclamaciones: Tigo no la atiende solo',
          'HU-064 CA-04 / HU-012: el asiento y el plazo legal son obligatorios. Tigo prepara; decide una persona.',
        ),
      ],
    },
    {
      etapa: 'enrutamiento',
      retardoMs: 1500,
      efectos: [],
      propuestas: [
        prop('enrutamiento', 'enrutar', 'Identifiqué el destino: Legal, responsable de reclamos', 'Es una propuesta: no se deriva sin tu aprobación.'),
      ],
    },
    {
      etapa: 'atencion',
      retardoMs: 2000,
      efectos: [
        {
          tipo: 'interaccion',
          interaccion: { tipo: 'int', autor: 'Tigo', texto: 'Resumen y plazo del Libro preparados. Tigo no atiende Quejas: espera la decisión de una persona.' },
        },
      ],
      propuestas: [
        prop('atencion', 'resumir-caso', 'Resumí el caso', 'Hechos anonimizados y datos del expediente.', {
          lineas: [`Tipo: Queja · Canal: ${t.ch}`, `Hechos: ${anon.texto}`, `Proyecto: ${t.proj}`],
        }),
        prop(
          'atencion',
          'citar-guia',
          guia ? `Cité la guía de Queja${guia.version ? ` v${guia.version}` : ''}` : 'Sin guía publicada para Queja',
          guia ? 'Pasos de la guía vigente.' : 'No hay guía publicada para este tipo: es un caso válido, la persona sigue el flujo del Libro.',
          { lineas: guia?.pasos.map((p, i) => `${i + 1}. ${p}`) },
        ),
        prop(
          'atencion',
          'plazo-libro',
          `Calculé el plazo legal: ${PLAZO_LIBRO_DIAS} días hábiles, vence el ${vence}`,
          `Ley 31435: ${PLAZO_LIBRO_DIAS} días hábiles improrrogables desde el registro.`,
        ),
        pendiente(
          'registrar-asiento',
          'Registrar el asiento en el Libro de Reclamaciones',
          `Abre el asiento con plazo hasta el ${vence}. Espera la aprobación del gestor.`,
          {
            efectosAlAprobar: [
              { tipo: 'asiento-libro' },
              {
                tipo: 'bitacora',
                motivo: 'TIGO_LIBRO',
                nota: `Asiento registrado en el Libro de Reclamaciones. Plazo legal: ${PLAZO_LIBRO_DIAS} días hábiles (vence ${vence}).`,
              },
              {
                tipo: 'interaccion',
                interaccion: { tipo: 'sys', autor: 'Tigo', texto: `Asiento registrado en el Libro de Reclamaciones (HU-012). Vence el ${vence}.` },
              },
            ],
          },
        ),
        pendiente(
          'derivar-legal',
          `Derivar al responsable legal de reclamos (${RESPONSABLE_LEGAL})`,
          'Área Legal, motivo «Derivación por competencia». Espera la aprobación del gestor.',
          {
            efectosAlAprobar: [
              { tipo: 'asignar', responsable: RESPONSABLE_LEGAL, area: 'LEGAL' },
              { tipo: 'estado', valor: 'IN_PROGRESS' },
              { tipo: 'bitacora', motivo: 'DERIVACION_COMPETENCIA', nota: 'Queja del Libro de Reclamaciones derivada al responsable legal de reclamos.' },
              {
                tipo: 'interaccion',
                interaccion: {
                  tipo: 'sys',
                  autor: 'Tigo',
                  texto: `Derivado ATC → LEGAL · motivo DERIVACION_COMPETENCIA · responsable ${RESPONSABLE_LEGAL}.`,
                },
              },
            ],
          },
        ),
        pendiente('redactar-acuse', 'Borrador del acuse de recibo al cliente', 'Sale al cliente: espera la aprobación del gestor.', {
          texto: `Hemos recibido su queja y la registramos en el Libro de Reclamaciones. Le responderemos por escrito dentro de ${PLAZO_LIBRO_DIAS} días hábiles, es decir, hasta el ${vence}. Gracias por avisarnos.`,
          efectosAlAprobar: [{ tipo: 'respuesta-gestor' }],
        }),
      ],
    },
    {
      etapa: 'atencion',
      retardoMs: 1200,
      efectos: [],
      propuestas: [
        prop('atencion', 'fin-sin-cierre', 'Lo atiende Legal: Tigo no resuelve ni cierra Quejas', 'Fin del escenario: no hay Cierre ni Post-cierre en Tigo.'),
      ],
    },
  ];
}

/* ── Escenario C: riesgo verbal / conflicto Eje 3 (Tigo se detiene y escala) ── */

export interface CtxEscenarioC {
  ticket: TicketAtc;
  /** Los 6 elementos del paquete mínimo de traspaso (HU-027 CA-01). */
  paqueteMinimo: readonly string[];
}

export function construirEscenarioC(ctx: CtxEscenarioC): PasoGuion[] {
  const t = ctx.ticket;
  const texto = textoDelCliente(t);
  const anon = anonimizar(texto, { cliente: t.cli, dni: t.dni, contrato: t.contract });
  const riesgo = detectarSenalesRiesgo(texto);
  const n = ctx.paqueteMinimo.length;
  return [
    {
      etapa: 'registro',
      retardoMs: 1200,
      efectos: [
        {
          tipo: 'interaccion',
          interaccion: { tipo: 'sys', autor: 'Tigo', texto: 'Señal de riesgo verbal detectada. Tigo se detiene: no clasifica ni responde al cliente.' },
        },
      ],
      propuestas: [
        prop('registro', 'anonimizar', tituloAnon(anon.cantidad), 'Solo el texto anonimizado llega al modelo (ADR-007).', {
          lineas: lineasAnonimas(anon),
        }),
        prop('registro', 'detectar-riesgo', `Detecté riesgo verbal (nivel ${riesgo.nivel})`, 'Reglas por palabras y frases del mensaje del cliente.', {
          lineas: riesgo.frases.map((f) => `Señal: «${f}»`),
        }),
        prop(
          'registro',
          'guardarrailes',
          'Tigo se detiene: señal de conflicto (Eje 3). No clasifica, no redacta, no responde al cliente.',
          'Lo atiende una persona (HU-027).',
          { estado: 'bloqueada' },
        ),
        prop(
          'enrutamiento',
          'escalar-legal',
          'Escalar a Legal con el paquete mínimo de traspaso',
          'Eje 3 (HU-027): Tigo arma el paquete; la derivación la confirma una persona.',
          {
            estado: 'pendiente',
            requiereAprobacion: true,
            lineas: ctx.paqueteMinimo.map((l, i) => `${i + 1}. ${l}`),
            efectosAlAprobar: [
              { tipo: 'conflicto-eje3' },
              { tipo: 'asignar', responsable: RESPONSABLE_LEGAL, area: 'LEGAL' },
              { tipo: 'estado', valor: 'ESCALATED' },
              { tipo: 'bitacora', motivo: 'DERIVACION_CONFLICTO_EJE3', nota: `Paquete mínimo ${n}/${n} sincronizado con Legal (Eje 3).` },
              {
                tipo: 'interaccion',
                interaccion: { tipo: 'sys', autor: 'Tigo', texto: 'Derivado ATC → LEGAL · motivo DERIVACION_CONFLICTO_EJE3. Tigo no redactó nada al cliente.' },
              },
            ],
          },
        ),
      ],
    },
  ];
}

/** Propuesta informativa con la que termina el guion si el gestor descarta una propuesta. */
export function propuestaAtencionManual(etapa: EtapaTigo): PropuestaBase {
  return {
    etapa,
    accion: 'atender-manual',
    titulo: 'El gestor atiende manualmente',
    detalle: 'Se descartó la propuesta: Tigo se detiene y no cierra el ticket.',
    estado: 'ejecutada',
    requiereAprobacion: false,
  };
}

/**
 * Qué hace el servicio al descartar una propuesta: si quedan otras pendientes del mismo ticket, sigue esperando
 * al gestor (B y C tienen varias); si no, el guion termina y pasa a atención manual.
 */
export function alDescartar(propuestas: readonly { ticket: string; estado: string }[], ticket: string): 'esperar' | 'terminar' {
  return propuestas.some((p) => p.ticket === ticket && p.estado === 'pendiente') ? 'esperar' : 'terminar';
}

/* ── Etiquetas de edición (solo categorías, nunca el texto) ── */

const RE_OPERACION = /operaci[oó]n|\bop\.?\s*\d|\d{6,}/i;
const RE_FECHA = /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b|\b\d{1,2} de (enero|febrero|marzo|abril|mayo|junio|julio|agosto|setiembre|septiembre|octubre|noviembre|diciembre)\b/i;
const RE_FORMAL = /\b(usted|estimad[oa]s?|le informamos|su solicitud)\b/i;
const RE_CERCANO = /\b(hola|tu|tus|te|buen[oa]s)\b/i;
const numeros = (s: string): string[] => s.match(/\d[\d.,/]*\d|\d/g) ?? [];

/**
 * Compara en memoria el borrador original con el texto final y devuelve categorías. No devuelve ni guarda texto.
 * Reglas simples (ponytail: sin NLP; se amplía editando las expresiones).
 */
export function clasificarEdicion(original: string, final: string): string[] {
  const o = original.trim();
  const f = final.trim();
  if (o === f) return [];
  const etiquetas: string[] = [];
  if (RE_OPERACION.test(f) && !RE_OPERACION.test(o)) etiquetas.push('agregó dato de operación');
  if (RE_FECHA.test(f) && !RE_FECHA.test(o)) etiquetas.push('agregó fecha');
  if (f.length < o.length * 0.85) etiquetas.push('acortó');
  if (f.length > o.length * 1.15) etiquetas.push('alargó');
  const apertura = (s: string): string => sinTildes(s.split(/\s+/)[0] ?? '').replace(/[^a-z]/g, '');
  if (apertura(o) !== apertura(f) || RE_FORMAL.test(o) !== RE_FORMAL.test(f) || RE_CERCANO.test(o) !== RE_CERCANO.test(f)) {
    etiquetas.push('cambió el tono');
  }
  const nf = numeros(f);
  if (numeros(o).some((n) => !nf.includes(n))) etiquetas.push('quitó información');
  return etiquetas.length ? etiquetas : ['reformuló'];
}

/** Texto aprobado del borrador (editado o no): base de la respuesta que se envía al resolver. */
export function textoAprobado(propuestas: readonly PropuestaTigo[]): string | undefined {
  const b = propuestas.find((p) => p.accion === 'redactar' && (p.estado === 'aprobada' || p.estado === 'editada'));
  return b ? (b.textoFinal ?? b.texto) : undefined;
}

export type Siguiente = { tipo: 'paso'; indice: number } | { tipo: 'esperando' } | { tipo: 'terminado' };

/**
 * Qué toca después de ejecutar el paso `ultimo`. Se detiene mientras haya una propuesta que requiere
 * aprobación sin decidir; termina si el gestor descartó alguna, si un guardarraíl bloqueó o si ya no quedan pasos.
 */
export function proximoPaso(pasos: readonly PasoGuion[], ultimo: number, propuestas: readonly PropuestaTigo[]): Siguiente {
  const aprob = propuestas.filter((p) => p.requiereAprobacion);
  if (aprob.some((p) => p.estado === 'pendiente')) return { tipo: 'esperando' };
  if (aprob.some((p) => p.estado === 'descartada') || propuestas.some((p) => p.estado === 'bloqueada')) {
    return { tipo: 'terminado' };
  }
  return ultimo + 1 >= pasos.length ? { tipo: 'terminado' } : { tipo: 'paso', indice: ultimo + 1 };
}

/* ── Narración (modo presentación y Operación en Vivo) ── */

/** Frase en primera persona de lo que Tigo hizo (ejecutada). Solo usa lo que dice la propuesta; no inventa datos. */
const NARRA_EJECUTADA: Record<string, (p: { titulo: string }) => string> = {
  clasificar: () => 'Clasifiqué el pedido según el catálogo vigente.',
  anonimizar: (p) => {
    const n = /\((\d+) dato/.exec(p.titulo)?.[1];
    return n ? `Estoy anonimizando ${n} dato${n === '1' ? '' : 's'} antes de consultar a la IA.` : 'Anonimicé el mensaje antes de consultar a la IA.';
  },
  guardarrailes: () => 'Revisé los guardarraíles: no hay riesgo, puedo atender el caso.',
  enrutar: () => 'Identifiqué el flujo y el destino del ticket.',
  asignar: () => 'Asigné el ticket al gestor de menor carga.',
  resumir360: () => 'Resumí la ficha 360 del cliente.',
  'citar-guia': () => 'Cité la guía de solución vigente.',
  'consultar-motor': () => 'Consulté el Motor de Consultas (dato sintético).',
  'completar-actividad': () => 'Completé la primera actividad del flujo.',
  'confirmar-cliente': () => 'El cliente confirmó la solución (acción simulada).',
  encuesta: () => 'Disparé la encuesta de satisfacción (simulada).',
  'detectar-libro': () => 'Detecté que es una Queja del Libro de Reclamaciones: no la atiendo sola.',
  'detectar-riesgo': () => 'Detecté riesgo verbal en el mensaje del cliente.',
  'resumir-caso': () => 'Resumí el caso con los hechos anonimizados.',
  'plazo-libro': () => 'Calculé el plazo legal del Libro de Reclamaciones.',
  'fin-sin-cierre': () => 'Aquí termino: lo atiende Legal, yo no resuelvo ni cierro Quejas.',
  'atender-manual': () => 'Descartaste mi propuesta: el gestor atiende manualmente.',
};

/** Qué propone Tigo mientras espera al gestor. */
const NARRA_PENDIENTE: Record<string, string> = {
  redactar: 'Dejé un borrador de respuesta para el cliente: espero tu aprobación.',
  resolver: 'Propongo enviar la respuesta y resolver el ticket: espero tu aprobación.',
  'registrar-asiento': 'Preparé el asiento del Libro de Reclamaciones: espero tu aprobación.',
  'derivar-legal': 'Preparé la derivación a Legal: espero tu aprobación.',
  'redactar-acuse': 'Dejé el acuse de recibo para el cliente: espero tu aprobación.',
  'escalar-legal': 'Armé el paquete de traspaso para escalar a Legal: espero tu aprobación.',
};

/** Frase narrada, en primera persona de Tigo, del paso que muestra la última propuesta. */
export function narrarPaso(p: Pick<PropuestaTigo, 'accion' | 'estado' | 'titulo'> | undefined): string {
  if (!p) return 'Espero que elijas un escenario para empezar.';
  switch (p.estado) {
    case 'pendiente':
      return NARRA_PENDIENTE[p.accion] ?? `Propongo: ${p.titulo}. Espero tu aprobación.`;
    case 'bloqueada':
      return 'Detecté una señal de riesgo y me detuve: lo atiende una persona.';
    case 'descartada':
      return 'Descartaste mi propuesta: el caso pasa a atención manual.';
    case 'aprobada':
    case 'editada':
      return 'Recibí tu decisión y la registré: sigo con el caso.';
    default:
      return NARRA_EJECUTADA[p.accion]?.(p) ?? `${p.titulo}.`;
  }
}

/** «Tigo hizo N acciones; tú decidiste M». Cuenta lo ejecutado o aprobado, y las decisiones registradas. */
export function resumenFinal(propuestas: readonly { estado: string }[], decisiones: number): string {
  const n = propuestas.filter((p) => ['ejecutada', 'aprobada', 'editada'].includes(p.estado)).length;
  return `Tigo hizo ${n} ${n === 1 ? 'acción' : 'acciones'}; tú decidiste ${decisiones}.`;
}

/* ── Aplicación de efectos (inmutable) ── */

export function aplicarEfectos(
  ticket: TicketAtc,
  efectos: readonly EfectoTicket[],
  ahora: Date,
  gestor: string,
  /** Texto final aprobado por el gestor (lo usa `respuesta-gestor`). */
  textoFinal?: string,
): TicketAtc {
  let t: TicketAtc = { ...ticket };
  const hito = (estado: string, autor: string): void => {
    t = { ...t, status: [...t.status, { fecha: ahora, estado, autor }] };
  };
  for (const e of efectos) {
    switch (e.tipo) {
      case 'clasificar':
        t = { ...t, type: e.tipoId, subtipo: e.subtipo ?? t.subtipo };
        break;
      case 'estado':
        if (t.state !== e.valor) {
          t = { ...t, state: e.valor };
          hito(e.valor, 'Tigo');
        }
        break;
      case 'asignar':
        t = { ...t, owner: e.responsable, area: e.area ?? t.area };
        break;
      case 'bitacora':
        t = { ...t, log: [...t.log, { fecha: ahora, area: t.area, responsable: t.owner, motivo: e.motivo, nota: e.nota }] };
        break;
      case 'interaccion':
        t = { ...t, interactions: [...t.interactions, { ...e.interaccion, fecha: ahora }] };
        break;
      case 'respuesta-gestor':
        t = {
          ...t,
          interactions: [
            ...t.interactions,
            { tipo: 'agt', fecha: ahora, canal: 'Mi Portal', autor: gestor, texto: textoFinal ?? '' },
          ],
          firstResp: t.firstResp ?? ahora,
        };
        break;
      case 'completar-actividad':
        break; // el avance lo cuenta el servicio (`completadas`): el ticket no guarda actividades.
      case 'asiento-libro':
        break; // el asiento vive en la consola: lo registra el servicio por el puente.
      case 'conflicto-eje3':
        t = { ...t, eje: 3, conflict: true };
        break;
      case 'resuelto':
        t = { ...t, state: 'RESOLVED', resolvedAt: ahora, firstResp: t.firstResp ?? ahora };
        hito('RESOLVED', gestor);
        break;
      case 'cerrado':
        t = { ...t, state: 'CLOSED' };
        hito('CLOSED', 'Mi Portal');
        break;
    }
  }
  return t;
}
