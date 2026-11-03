/**
 * Modelo de Tigo como capa que atiende un ticket de punta a punta (PROTOTIPO, todo simulado).
 * Propuesta fuera de la Etapa 1. Regla de gobierno (ADR-007 / RN-SVC-032): la IA sugiere, el gestor decide.
 */

/** A: Tigo atiende de punta a punta · B: Queja al Libro de Reclamaciones · C: riesgo verbal (Tigo se detiene). */
export type EscenarioTigo = 'A' | 'B' | 'C';

export type EtapaTigo = 'registro' | 'enrutamiento' | 'atencion' | 'cierre' | 'postcierre';

export const ETAPAS_TIGO: readonly { id: EtapaTigo; nombre: string }[] = [
  { id: 'registro', nombre: 'Registro' },
  { id: 'enrutamiento', nombre: 'Enrutamiento' },
  { id: 'atencion', nombre: 'Atención' },
  { id: 'cierre', nombre: 'Cierre' },
  { id: 'postcierre', nombre: 'Post-cierre' },
];

export type EstadoPropuesta = 'ejecutada' | 'pendiente' | 'aprobada' | 'editada' | 'descartada' | 'bloqueada';

export interface PropuestaTigo {
  id: string;
  /** Número del ticket. */
  ticket: string;
  etapa: EtapaTigo;
  /** Clave corta: clasificar, anonimizar, enrutar, asignar, resumir360, citar-guia, consultar-motor,
   *  completar-actividad, redactar, resolver, confirmar-cliente, encuesta, atender-manual, guardarrailes... */
  accion: string;
  titulo: string;
  detalle: string;
  lineas?: string[];
  estado: EstadoPropuesta;
  requiereAprobacion: boolean;
  /** Borrador propuesto. */
  texto?: string;
  /** Texto con el que el gestor aprobó (puede diferir del propuesto). */
  textoFinal?: string;
  /** Acción del cliente simulada (no la hizo una persona real). */
  simulada?: boolean;
  creada: Date;
}

/** Registro de decisión: ADR-007 prohíbe guardar datos personales, por eso solo la longitud, nunca el texto. */
export interface DecisionTigo {
  id: string;
  ticket: string;
  propuestaId: string;
  etapa: EtapaTigo;
  accion: string;
  decision: 'ACEPTADA' | 'EDITADA' | 'DESCARTADA';
  longitud: number;
  fecha: Date;
  gestor: string;
  /** Tipo de ticket (p. ej. 'CTA'); vacío si no se conoce. */
  tipo: string;
  /** Categorías de la edición (p. ej. «agregó fecha»). SOLO categorías: nunca el texto. */
  etiquetas: string[];
  /** Versión de la guía con la que se redactó el borrador (solo en borradores). */
  guiaVersion?: number;
}

/**
 * Nivel de autonomía de Tigo: ejecuta solo lo interno y reversible (clasificar, anonimizar, enrutar, resumir,
 * citar guía, consultar el motor, completar la actividad 1) y deja PENDIENTE de aprobación humana todo lo que
 * sale al cliente o resuelve/cierra. Ningún cierre sin aprobación del gestor.
 */
export const NIVEL_AUTONOMIA = 'prepara-y-ejecuta-con-aprobacion';
