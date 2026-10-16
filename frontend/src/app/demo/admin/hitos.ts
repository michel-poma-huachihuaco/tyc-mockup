import type { AyTimelineEvento } from '@aybarcorp/ui-angular';
import { PERSONAS } from '../datos';
import type { EventoAuditoria, Gravedad } from '../datos';

/** El tono del marcador de cada gravedad; la gravedad se dice también en el texto. */
export const TONO_DE: Record<Gravedad, AyTimelineEvento['tono']> = {
  info: 'default',
  aviso: 'accent',
  critico: 'danger',
};

export const ETIQUETA_GRAVEDAD: Record<Gravedad, string> = {
  info: 'Información',
  aviso: 'Aviso',
  critico: 'Crítico',
};

const NOMBRE_DE = new Map(PERSONAS.map((p) => [p.id, p.nombre]));

/** Un evento de auditoría como hito de ay-timeline: qué, sobre qué, quién y cuándo. */
export function hitoDe(evento: EventoAuditoria): AyTimelineEvento {
  const prefijo = evento.gravedad === 'info' ? '' : `${ETIQUETA_GRAVEDAD[evento.gravedad]}: `;
  return {
    id: evento.id,
    titulo: `${prefijo}${evento.accion.charAt(0).toLowerCase()}${evento.accion.slice(1)} · ${evento.recurso} · IP ${evento.ip}`,
    autor: NOMBRE_DE.get(evento.actor) ?? evento.actor,
    fecha: evento.fecha,
    tono: TONO_DE[evento.gravedad],
  };
}
