import type { UsuarioDemo } from '@aybarcorp/auth'

/**
 * Un usuario demo desde sus campos: usuario, clave, nombre y roles separados por comas.
 * Sin usuario o sin clave no hay usuario: se avisa en la consola —nunca con la clave— y se
 * descarta, en lugar de que crearAutenticacionDemo lance y la aplicación no cargue.
 */
function usuarioDemo(campos: (string | undefined)[], origen: string): UsuarioDemo | null {
  const [usuario = '', clave = '', nombre = '', roles = ''] = campos
  const problema =
    campos.length > 4
      ? 'tiene más de cuatro campos: ni la clave ni el nombre pueden llevar «:»'
      : !usuario.trim()
        ? 'no tiene usuario'
        : !clave
          ? 'no tiene clave'
          : null
  if (problema) {
    console.warn(`[aybar] modo demo · ${origen} ${problema}; se ignora.`)
    return null
  }
  const listaRoles = roles
    .split(',')
    .map((rol) => rol.trim())
    .filter(Boolean)
  return {
    usuario: usuario.trim(),
    clave,
    ...(nombre.trim() ? { nombre: nombre.trim() } : {}),
    roles: listaRoles.length > 0 ? listaRoles : ['USER'],
  }
}

/**
 * Los usuarios del modo demo: los de VITE_AYBAR_DEMO_USUARIOS si está, y si no el de las
 * variables sueltas. `null` si no queda ninguno, y entonces se usa el emisor.
 */
function usuariosDemo(lista: string | undefined, suelto: (string | undefined)[]): UsuarioDemo[] | null {
  const usuarios = lista?.trim()
    ? lista
        .split(';')
        .map((entrada) => entrada.trim())
        .filter(Boolean)
        .map((entrada, i) =>
          usuarioDemo(
            entrada.split(':').map((campo) => campo.trim()),
            `VITE_AYBAR_DEMO_USUARIOS, entrada ${i + 1},`,
          ),
        )
    : suelto[0]
      ? [usuarioDemo(suelto, 'VITE_AYBAR_DEMO_USUARIO')]
      : []
  const validos = usuarios.filter((usuario): usuario is UsuarioDemo => usuario !== null)
  return validos.length > 0 ? validos : null
}

/**
 * Configuración del framework Aybar para este frontend.
 *
 * La generó `aybar-front init` desde las secciones "autenticacion" y "api" de
 * aybar.config.json. Cada valor se sobrescribe por entorno sin tocar este archivo, con
 * variables de Vite (en .env.local, o en el entorno del build):
 *
 *   VITE_AYBAR_EMISOR       URL del emisor OIDC (issuer). La decide el ADR del servicio.
 *   VITE_AYBAR_CLIENTE_ID   client_id público registrado en el emisor (PKCE, sin secreto).
 *   VITE_AYBAR_AUDIENCIA    audiencia del access token que valida el backend.
 *   VITE_AYBAR_API_URL      URL base del backend.
 *
 * Los valores con aybar.local son de plantilla: no resuelven, y
 * `npx @aybarcorp/cli doctor` avisa mientras sigan en aybar.config.json.
 *
 * Modo demo (solo `npm run dev`, solo en localhost): con usuarios demo definidos, la
 * sesión es simulada —Login Form de la aplicación, sin emisor y sin token— y el emisor no
 * se usa. Van en .env.development, que no entra al build de producción:
 *
 *   VITE_AYBAR_DEMO_USUARIOS varios usuarios separados por «;», cada uno
 *                            usuario:clave:Nombre:ROL1,ROL2 (nombre y roles opcionales).
 *                            Si está, las cuatro de abajo no se leen.
 *   VITE_AYBAR_DEMO_USUARIO  un solo usuario de prueba (sin distinguir mayúsculas).
 *   VITE_AYBAR_DEMO_CLAVE    su contraseña, comparada en el navegador: no es seguridad.
 *   VITE_AYBAR_DEMO_NOMBRE   nombre visible; por defecto, el usuario.
 *   VITE_AYBAR_DEMO_ROLES    roles separados por comas; por defecto, USER.
 *
 * Cada variable se lee por su nombre completo (import.meta.env.VITE_*), nunca con el objeto
 * entero: Vite lo cambiaría por todas las VITE_* del entorno, y acabarían en el bundle.
 */
export const configuracionAybar = {
  autenticacion: {
    emisor: (import.meta.env.VITE_AYBAR_EMISOR as string | undefined) || 'https://emisor.aybar.local',
    clienteId: (import.meta.env.VITE_AYBAR_CLIENTE_ID as string | undefined) || 'aybar-web',
    audiencia: (import.meta.env.VITE_AYBAR_AUDIENCIA as string | undefined) || 'aybar-api',
    alcance: 'openid profile',
  },
  api: {
    baseUrl: (import.meta.env.VITE_AYBAR_API_URL as string | undefined) || 'https://api.aybar.local',
  },
  /**
   * Usuarios del modo demo, o `null`. Fuera de `npm run dev` la condición es `false` en
   * compilación y el empaquetador elimina la rama entera, claves incluidas, y las dos
   * funciones de arriba, que se quedan sin uso. Cada usuario necesita usuario Y clave.
   */
  demo: import.meta.env.DEV
    ? usuariosDemo(import.meta.env.VITE_AYBAR_DEMO_USUARIOS as string | undefined, [
        import.meta.env.VITE_AYBAR_DEMO_USUARIO as string | undefined,
        import.meta.env.VITE_AYBAR_DEMO_CLAVE as string | undefined,
        import.meta.env.VITE_AYBAR_DEMO_NOMBRE as string | undefined,
        import.meta.env.VITE_AYBAR_DEMO_ROLES as string | undefined,
      ])
    : null,
}
