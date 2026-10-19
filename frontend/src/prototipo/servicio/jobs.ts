import { controlarHandoffs } from './conflicto.ts'
import { ejecutarControlesLegales } from './libro.ts'
import { controlarEscalamiento } from './mesa.ts'
import { controlarIntegraciones } from './ola7.ts'
import { ejecutarJob } from './nucleo.ts'
import type { Datos } from './nucleo.ts'

/**
 * Una corrida del job programado (9:00 y 14:00 de cada día hábil, y al adelantar el reloj
 * en Simulación): SLA de tickets (HU-ATC-010), plazo legal y huérfanos (HU-ATC-015),
 * handoffs sin confirmar (HU-ATC-027) y escalamiento de la Mesa SGD (HU-ATC-023), vinculaciones pendientes, cola de Legal (HU-ATC-040)
 * y alertas por riesgo de denuncia (HU-ATC-041).
 */
export function ejecutarJobs(d: Datos) {
  const [d1, sla] = ejecutarJob(d)
  const [d2, legal] = ejecutarControlesLegales(d1)
  const [d3, handoffs] = controlarHandoffs(d2)
  const [d4, mesa] = controlarEscalamiento(d3)
  const [d5, integraciones] = controlarIntegraciones(d4)
  return [d5, { sla, legal, handoffs, mesa, integraciones }] as const
}

export type ResultadoJob = ReturnType<typeof ejecutarJobs>[1]
