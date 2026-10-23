import { HOY } from './semilla'

/** Tickets sintéticos para las plantillas de filtros de /demo/filtros: sin red y sin datos de nadie. */

export type EstadoTicket = 'abierto' | 'en-curso' | 'en-espera' | 'resuelto' | 'cerrado'
export type PrioridadTicket = 'baja' | 'media' | 'alta' | 'critica'

export interface Ticket {
  id: string
  titulo: string
  estado: EstadoTicket
  prioridad: PrioridadTicket
  categoria: string
  /** Vacío: sin asignar. */
  responsable: string
  creado: Date
}

export const ESTADOS_TICKET: readonly EstadoTicket[] = ['abierto', 'en-curso', 'en-espera', 'resuelto', 'cerrado']
export const PRIORIDADES_TICKET: readonly PrioridadTicket[] = ['baja', 'media', 'alta', 'critica']
export const CATEGORIAS_TICKET = ['Acceso', 'Facturación', 'Error en pantalla', 'Consulta', 'Mejora'] as const
export const RESPONSABLES_TICKET = ['Lucía Paredes', 'Marco Quispe', 'Andrea Salas', 'Diego Rojas'] as const

export const ETIQUETA_ESTADO_TICKET: Record<EstadoTicket, string> = {
  abierto: 'Abierto',
  'en-curso': 'En curso',
  'en-espera': 'En espera',
  resuelto: 'Resuelto',
  cerrado: 'Cerrado',
}

export const ETIQUETA_PRIORIDAD_TICKET: Record<PrioridadTicket, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
  critica: 'Crítica',
}

const TITULOS = [
  'No puedo iniciar sesión',
  'El recibo sale duplicado',
  'La tabla no carga en el celular',
  'Cómo cambio el correo de la cuenta',
  'Pedir un filtro por fecha en reportes',
  'Error 500 al guardar el formulario',
  'Restablecer la contraseña no llega',
  'El total no coincide con la factura',
  'El botón Guardar no responde',
  'Dudas sobre los roles disponibles',
  'Exportar a Excel con más columnas',
  'Sesión expirada demasiado pronto',
]

/** 48 tickets repartidos de forma estable: la misma lista en cada carga. */
export const TICKETS: readonly Ticket[] = Array.from({ length: 48 }, (_, i) => {
  const asignado = (i * 7) % 5 !== 0
  return {
    id: `TCK-${String(1000 + i)}`,
    titulo: TITULOS[i % TITULOS.length]!,
    estado: ESTADOS_TICKET[(i * 3 + (i >> 2)) % ESTADOS_TICKET.length]!,
    prioridad: PRIORIDADES_TICKET[(i * 5 + (i >> 1)) % PRIORIDADES_TICKET.length]!,
    categoria: CATEGORIAS_TICKET[(i * 2 + (i >> 3)) % CATEGORIAS_TICKET.length]!,
    responsable: asignado ? RESPONSABLES_TICKET[i % RESPONSABLES_TICKET.length]! : '',
    creado: new Date(HOY.getTime() - (i * 17 + 5) * 3_600_000),
  }
})
