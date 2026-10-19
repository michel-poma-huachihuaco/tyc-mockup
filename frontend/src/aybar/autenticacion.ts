import { crearAutenticacion, crearAutenticacionDemo } from '@aybarcorp/auth'
import { configuracionAybar } from './configuracion'

/**
 * La autenticación de la aplicación: OIDC Authorization Code con PKCE, contra el emisor
 * que diga la configuración. El token vive en memoria y se renueva solo; nada de este
 * proyecto lo guarda ni lo lee directamente: se pide con `sesion.obtenerToken()`.
 *
 * En `npm run dev`, con usuarios demo en .env.development, la sesión es simulada: la
 * abre el Login Form de la aplicación (`autenticacionDemo.ingresar(usuario, clave)`, en
 * la ruta `autenticacionDemo.rutaLogin`), no tiene token y se niega a correr fuera de
 * localhost. Tiene la misma interfaz, así que el resto de la aplicación no cambia. En el
 * build de producción `import.meta.env.DEV` es `false` y el modo demo no existe.
 */
const { autenticacion: config, demo } = configuracionAybar

/** La autenticación simulada del modo demo, o `null` con el emisor real. */
export const autenticacionDemo =
  import.meta.env.DEV && demo ? crearAutenticacionDemo({ usuarios: demo }) : null

export const autenticacion =
  autenticacionDemo ??
  crearAutenticacion({
    emisor: config.emisor,
    clienteId: config.clienteId,
    audiencia: config.audiencia,
    alcance: config.alcance,
    redirectUri: `${window.location.origin}/`,
    postLogoutRedirectUri: `${window.location.origin}/`,
  })
