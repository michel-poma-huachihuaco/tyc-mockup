import { crearClienteHttp } from '@aybarcorp/http'
import { autenticacion, autenticacionDemo } from './autenticacion'
import { configuracionAybar } from './configuracion'

/**
 * Cliente HTTP del backend: envía el token de la sesión, un X-Correlation-Id por
 * solicitud, y convierte los errores RFC 7807 en ErrorAybar. Un 401 manda a iniciar
 * sesión de nuevo, volviendo a la misma pantalla.
 *
 * Con la sesión demo, no: no tiene token y el backend protegido responde 401 a todo, así
 * que volver al login sería un bucle. El 401 llega a la pantalla como ErrorAybar.
 */
export const api = crearClienteHttp({
  baseUrl: configuracionAybar.api.baseUrl,
  sesion: () => autenticacion.sesion(),
  alNoAutenticado: autenticacionDemo
    ? undefined
    : () => void autenticacion.entrar(window.location.pathname),
})
