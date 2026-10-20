// Tipos mínimos del estado del prototipo (chunk «comun») que usa Mi Portal. Solo lo que se lee o se escribe aquí.

export type Estado = 'OPEN' | 'IN_PROGRESS' | 'PENDING_CUSTOMER' | 'ESCALATED' | 'RESOLVED' | 'CLOSED' | 'REOPENED'

export interface Ticket {
  id: string; numero: string; empresaId: string; linea: string; canal: string; establecimiento: string | null
  clienteId: string; tipo: string; prioridad: string; resumen: string; descripcion: string; estado: Estado
  area: string; responsable: string | null; eje: number; abierto: Date; registradoPor: string
  politica: { id: string; version: number; origen: string; respuestaH: number; resolucionH: number }
  venceRespuesta: Date; venceResolucion: Date; primeraRespuesta: Date | null; primeraResolucion: Date | null
  ultimaResolucion: Date | null; cierre: Date | null; reaperturas: number; venceReapertura: Date | null; inicioCiclo: Date
  /** Propio de Mi Portal: el subtipo que eligió el cliente (el modelo del prototipo no tiene subtipos). */
  subtipo?: string
}
export interface FilaEstado { id: string; ticketId: string; fecha: Date; de: Estado | null; a: Estado; autor: string | null; nota: string | null }
export interface FilaAsignacion {
  id: string; ticketId: string; fecha: Date; deArea: string | null; deResponsable: string | null
  aArea: string; aResponsable: string | null; motivo: string; nota: string | null; autor: string | null
}
export interface Adjunto { nombre: string; tamano: number; tipo: string }
export interface Interaccion {
  id: string; ticketId: string; fecha: Date; tipo: 'mensaje' | 'nota' | 'cliente' | string; visible: boolean
  canal: string | null; autor: string | null; texto: string; adjuntos: Adjunto[]
}
export interface Encuesta { id: string; ticketId: string; ciclo: number; enviada: Date; respuesta: { csat: number; ces: number; nps?: number; fecha: Date } | null }
export interface Flujo { id: string; tipo: string; area: string; version: number; pasos: { nombre: string; responsable: string; slaH: number }[] }

export interface Datos {
  ahora: Date; contador: number; secuencias: Record<string, number>
  tickets: Ticket[]; filasEstado: FilaEstado[]; filasAsignacion: FilaAsignacion[]; interacciones: Interaccion[]
  encuestas: Encuesta[]; flujos: Flujo[]; fuentesCaidas: string[]
  auditoria: { id: string; fecha: Date; actor: string; accion: string; detalle: string }[]
  eventos: { id: string; fecha: Date; nombre: string; datos: unknown }[]
  [k: string]: unknown
}

export interface Cliente { id: string; nombre: string; dni: string; telefono: string; correo: string; proyectos: string[] }
export interface Lote { id: string; descripcion: string; contrato: string; estado: string }

/** Lo que el chunk «comun» le presta a Mi Portal (scripts/nucleo-portal.js). */
export interface Nucleo {
  tx<T>(nombre: string, fn: (d: Datos) => [Datos, T]): Promise<T>
  aplicar(fn: (d: Datos) => Datos): void
  datos(): Datos
  sim(): { sigdaCaido: boolean; sinConexion: boolean }
  personaId(): string
  id(d: Datos, prefijo: string): [string, Datos]
  evento(d: Datos, nombre: string, datos: unknown): Datos
  auditar(d: Datos, actor: string, accion: string, detalle: string): Datos
  ticket(d: Datos, id: string): Ticket
  reemplazar(d: Datos, t: Ticket): Datos
  cambiarEstado(d: Datos, id: string, a: Estado, autor: string | null, nota?: string | null): Datos
  sla(d: Datos, tipo: string, prioridad: string, desde: Date): { politica: Ticket['politica']; origen: string; venceRespuesta: Date; venceResolucion: Date }
  registrarFlujo(d: Datos, id: string): Datos
  asignarPorFlujo(d: Datos, id: string): [Datos, 'asignado' | 'cola']
  flujo(d: Datos, tipo: string): Flujo | null
  sumarHorasHabiles(desde: Date, horas: number): Date
  sumarDiasHabiles(desde: Date, dias: number): Date
  compromiso(t: Ticket): Date
  nivelSla(t: Ticket, ahora: Date): { nivel: string; hito: string; vence: Date }
  empresa(id: string): { id: string; nombre: string; ruc: string } | null
  error(status: number, codigo: string, mensaje: string, extra?: Record<string, unknown>): Error
  validacion(campos: { campo: string; mensaje: string }[]): Error
  pii(texto: string): string | null
}
