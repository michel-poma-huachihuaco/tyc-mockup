import { PERSONAS } from './personas'
import { crearAzar, elegir, entero, haceMinutos, ponderado } from './semilla'

/**
 * Eventos de auditoría sintéticos para la Timeline de administración. Las IP son del bloque
 * de documentación TEST-NET-1 (192.0.2.0/24, RFC 5737), que no se enruta.
 */

export type Gravedad = 'info' | 'aviso' | 'critico'

export interface EventoAuditoria {
  id: string
  fecha: string
  /** Id de persona (personas.ts). */
  actor: string
  accion: string
  recurso: string
  gravedad: Gravedad
  ip: string
}

const ACCIONES: readonly (readonly [string, string, Gravedad])[] = [
  ['Inició sesión', 'Sesión', 'info'],
  ['Reservó un lote', 'Lote', 'info'],
  ['Cambió el precio de un lote', 'Lote', 'aviso'],
  ['Editó un cliente', 'Cliente', 'info'],
  ['Exportó la lista de clientes', 'Cliente', 'aviso'],
  ['Redactó un borrador de contrato', 'Contrato', 'info'],
  ['Concilió un pago', 'Pago', 'info'],
  ['Asignó un rol', 'Usuario', 'aviso'],
  ['Suspendió a un usuario', 'Usuario', 'critico'],
  ['Falló el inicio de sesión tres veces', 'Sesión', 'critico'],
  ['Activó el doble factor', 'Seguridad', 'info'],
]

export const TOTAL_EVENTOS = 96

function generar(): EventoAuditoria[] {
  const azar = crearAzar(5737)
  const activos = PERSONAS.filter((p) => p.estado !== 'invitado')
  let minutos = 0
  return Array.from({ length: TOTAL_EVENTOS }, (_, i) => {
    minutos += entero(azar, 7, 600)
    const [accion, tipo, gravedad] = ponderado(
      azar,
      ACCIONES.map((a) => [a, a[2] === 'critico' ? 1 : a[2] === 'aviso' ? 2 : 5] as const),
    )
    return {
      id: `e-${String(i + 1).padStart(3, '0')}`,
      fecha: haceMinutos(minutos),
      actor: elegir(azar, activos).id,
      accion,
      recurso: `${tipo} ${entero(azar, 100, 999)}`,
      gravedad,
      ip: `192.0.2.${entero(azar, 1, 254)}`,
    }
  })
}

/** Del más reciente al más antiguo. */
export const AUDITORIA: readonly Readonly<EventoAuditoria>[] = Object.freeze(generar().map((e) => Object.freeze(e)))
