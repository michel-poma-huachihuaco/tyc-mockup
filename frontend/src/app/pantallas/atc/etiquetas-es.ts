/**
 * Etiquetas es-PE de los códigos internos que las pantallas muestran al usuario. Solo cambia lo
 * que se ve: los valores internos (enums, ids) no se tocan.
 */
export type MapaEtiquetas = Readonly<Record<string, string>>;

/** Devuelve la etiqueta del valor o, si falta la traducción, el propio valor. */
export function etiqueta(mapa: MapaEtiquetas, valor: string | null | undefined): string {
  if (valor == null) return '';
  return mapa[valor] ?? valor;
}

export const AREA_ES: MapaEtiquetas = {
  ATC: 'ATC',
  COBRANZA: 'Cobranza',
  LEGAL: 'Legal',
  POSTVENTA: 'Postventa',
  TI: 'TI',
  CLIENTE: 'Cliente',
  CX: 'CX',
  ADMINISTRACION: 'Administración',
};

/** Nombre legible de un área; si no está en `AREA_ES`: "OTRA" -> "Otra". */
export const nombreArea = (area: string): string => AREA_ES[area] ?? area.charAt(0) + area.slice(1).toLowerCase();

export const GARANTIA_ESTADO_ES: MapaEtiquetas = {
  UNDER_REVIEW: 'En revisión',
  NOT_ELIGIBLE: 'No procede',
  APPROVED: 'Aprobada',
  REJECTED: 'Rechazada',
  RESOLVED: 'Resuelta',
  ESCALATED_EJE3: 'Derivada a Legal (Eje 3)',
};

export const ALERTA_SLA_ES: MapaEtiquetas = {
  FIRST_RESPONSE_AT_RISK: '1.ª respuesta por vencer (≤ 25 %)',
  FIRST_RESPONSE_BREACHED: '1.ª respuesta vencida',
  RESOLUTION_AT_RISK: 'Resolución por vencer (≤ 25 %)',
  RESOLUTION_BREACHED: 'Resolución vencida',
};

export const ALERTA_ADMIN_ES: MapaEtiquetas = {
  GUIA_FALTANTE: 'Falta guía de solución',
  POLITICA_FALTANTE: 'Falta política de SLA para el tipo',
  PROYECTO_SIN_RESPONSABLE: 'Proyecto sin responsable en el maestro',
};

/** Motivos de derivación, reasignación y bitácora de un ticket. */
export const MOTIVO_ES: MapaEtiquetas = {
  ALTA: 'Alta del ticket',
  ALTA_CONTINGENCIA_CONCILIACION: 'Alta por contingencia de conciliación',
  ALTA_FLUJO_CONFIGURADO: 'Alta según flujo configurado',
  AUTO_ASIGNACION_MENOR_CARGA: 'Asignación automática por menor carga',
  DERIVACION_COMPETENCIA: 'Derivación por competencia del área',
  DERIVACION_CONFLICTO_EJE3: 'Derivación por conflicto (Eje 3 Legal)',
  REASSIGNMENT_CESE: 'Cese del colaborador',
  REASSIGNMENT_ROTACION: 'Rotación de puesto',
  REASSIGNMENT_CARGA: 'Balanceo por carga o licencia',
};

export const CRITICIDAD_ES: MapaEtiquetas = {
  BAJA: 'Baja',
  MEDIA: 'Media',
  ALTA: 'Alta',
  CRITICA: 'Crítica',
};

export const ASIENTO_TIPO_ES: MapaEtiquetas = { RECLAMO: 'Reclamo', QUEJA: 'Queja' };

export const APELACION_INSTANCIA_ES: MapaEtiquetas = { INTERNA: 'interna', INDECOPI: 'ante Indecopi' };

export const EVENTO_URBEMIND_ES: MapaEtiquetas = {
  'ticket.created': 'Ticket creado',
  'ticket.InteractionAdded': 'Interacción añadida',
  'ticket.statusChanged': 'Estado cambiado',
};

export const CIERRE_SGD_ES: MapaEtiquetas = {
  ATENDIDO_CON_CARGO: 'Atendido con cargo',
  ATENDIDO_SIN_CARGO: 'Atendido sin cargo',
};

/** Reemplaza, dentro de un texto libre, los códigos internos conocidos por su etiqueta. */
export function traducirCodigos(texto: string): string {
  return texto.replace(/\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\b/g, (c) => MOTIVO_ES[c] ?? GARANTIA_ESTADO_ES[c] ?? ALERTA_SLA_ES[c] ?? c);
}

/** Opciones de un `ay-select` con la etiqueta es-PE de cada valor. */
export function opcionesDe(valores: readonly string[], mapa: MapaEtiquetas): { value: string; label: string }[] {
  return valores.map((value) => ({ value, label: etiqueta(mapa, value) }));
}
