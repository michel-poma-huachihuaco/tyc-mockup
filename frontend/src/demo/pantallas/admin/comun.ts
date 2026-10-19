import type { TonoBadge, ToneTimelineEvent } from '@aybarcorp/ui'
import { AUDITORIA, PERSONAS, rolPorId } from '../../datos'
import type { EstadoPersona, EventoAuditoria, Gravedad } from '../../datos'

/** Nombres y tonos que comparten las pantallas de administración. */

export const ETIQUETA_ESTADO_PERSONA: Record<EstadoPersona, string> = {
  activo: 'Activa',
  invitado: 'Invitada',
  suspendido: 'Suspendida',
}

export const TONO_ESTADO_PERSONA: Record<EstadoPersona, TonoBadge> = {
  activo: 'success',
  invitado: 'info',
  suspendido: 'danger',
}

export const ETIQUETA_GRAVEDAD: Record<Gravedad, string> = { info: 'Información', aviso: 'Aviso', critico: 'Crítico' }

export const TONO_GRAVEDAD: Record<Gravedad, ToneTimelineEvent> = { info: 'default', aviso: 'accent', critico: 'danger' }

const NOMBRES = new Map(PERSONAS.map((p) => [p.id, p.nombre]))

/** El nombre de quien hizo algo, por su id; «Sistema» si no es de nadie que conozcamos. */
export function nombreDeActor(id: string): string {
  return NOMBRES.get(id) ?? 'Sistema'
}

/** El nombre visible de un rol («ADMIN» → «Administración»). */
export function nombreDeRol(id: string): string {
  return rolPorId(id)?.nombre ?? id
}

/** Un evento de auditoría como hito de Timeline: qué pasó, quién, cuándo y con qué tono. */
export function hitoDe(evento: Readonly<EventoAuditoria>) {
  return {
    id: evento.id,
    title: `${evento.accion} · ${evento.recurso}`,
    date: new Date(evento.fecha),
    author: nombreDeActor(evento.actor),
    tone: TONO_GRAVEDAD[evento.gravedad],
  }
}

/** Los eventos de una persona, del más reciente al más antiguo. */
export function eventosDe(idPersona: string) {
  return AUDITORIA.filter((e) => e.actor === idPersona)
}
