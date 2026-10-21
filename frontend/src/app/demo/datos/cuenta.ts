import { haceMinutos } from './semilla'

/**
 * Lo que muestra la cuenta de la persona que inició sesión en la galería: sus sesiones
 * abiertas, sus notificaciones y sus códigos de recuperación. Todo sintético; las IP son
 * del bloque de documentación TEST-NET-2 (198.51.100.0/24, RFC 5737).
 */

export interface SesionAbierta {
  id: string
  dispositivo: string
  navegador: string
  lugar: string
  ip: string
  ultimaActividad: string
  /** La de esta pestaña: no se puede cerrar desde la lista. */
  actual: boolean
}

export const SESIONES: readonly Readonly<SesionAbierta>[] = Object.freeze([
  { id: 's-1', dispositivo: 'Portátil', navegador: 'Chrome en Linux', lugar: 'Lima, Perú', ip: '198.51.100.24', ultimaActividad: haceMinutos(0), actual: true },
  { id: 's-2', dispositivo: 'Celular', navegador: 'Safari en iOS', lugar: 'Lima, Perú', ip: '198.51.100.87', ultimaActividad: haceMinutos(95), actual: false },
  { id: 's-3', dispositivo: 'Escritorio', navegador: 'Edge en Windows', lugar: 'Arequipa, Perú', ip: '198.51.100.140', ultimaActividad: haceMinutos(60 * 26), actual: false },
  { id: 's-4', dispositivo: 'Tableta', navegador: 'Chrome en Android', lugar: 'Trujillo, Perú', ip: '198.51.100.203', ultimaActividad: haceMinutos(60 * 24 * 9), actual: false },
])

export type CanalNotificacion = 'correo' | 'app' | 'sms'

export interface PreferenciaNotificacion {
  id: string
  titulo: string
  descripcion: string
  canales: Record<CanalNotificacion, boolean>
}

export const PREFERENCIAS_NOTIFICACION: readonly Readonly<PreferenciaNotificacion>[] = Object.freeze([
  { id: 'reservas', titulo: 'Reservas de lotes', descripcion: 'Cuando alguien reserva o libera un lote que sigues.', canales: { correo: true, app: true, sms: false } },
  { id: 'pagos', titulo: 'Pagos y cuotas', descripcion: 'Pagos conciliados y cuotas por vencer.', canales: { correo: true, app: true, sms: true } },
  { id: 'contratos', titulo: 'Contratos', descripcion: 'Borradores listos para revisar y contratos aprobados.', canales: { correo: true, app: false, sms: false } },
  { id: 'seguridad', titulo: 'Seguridad', descripcion: 'Inicios de sesión nuevos y cambios de contraseña. No se pueden apagar todos.', canales: { correo: true, app: true, sms: false } },
  { id: 'novedades', titulo: 'Novedades del producto', descripcion: 'Funciones nuevas, una vez al mes como mucho.', canales: { correo: false, app: true, sms: false } },
])

export interface AvisoReciente {
  id: string
  titulo: string
  descripcion: string
  fecha: string
  leido: boolean
}

export const AVISOS: readonly Readonly<AvisoReciente>[] = Object.freeze([
  { id: 'n-1', titulo: 'Lote B-07 reservado', descripcion: 'Reserva de 72 horas a nombre de un cliente de Ventas.', fecha: haceMinutos(12), leido: false },
  { id: 'n-2', titulo: 'Pago conciliado', descripcion: 'La cuota 4 de 24 del contrato 318 quedó conciliada.', fecha: haceMinutos(140), leido: false },
  { id: 'n-3', titulo: 'Inicio de sesión nuevo', descripcion: 'Safari en iOS, desde Lima. Si no fuiste tú, cierra esa sesión.', fecha: haceMinutos(60 * 5), leido: true },
  { id: 'n-4', titulo: 'Borrador listo para revisar', descripcion: 'Contrato 322: falta la aprobación de una persona de Legal.', fecha: haceMinutos(60 * 30), leido: true },
])

/**
 * Códigos de recuperación de ejemplo: con el prefijo DEMO, para que nadie los confunda con
 * unos de verdad si aparecen en una captura.
 */
export const CODIGOS_RECUPERACION: readonly string[] = Object.freeze([
  'DEMO-4KQ7-M2XA', 'DEMO-9TBV-31LC', 'DEMO-H6WD-PZ84', 'DEMO-7RNE-QY52',
  'DEMO-2FJU-8KTS', 'DEMO-XM39-VA6G', 'DEMO-5CPL-N7RH', 'DEMO-B8YD-4WQE',
])
