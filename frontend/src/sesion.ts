/**
 * Lo que las pantallas leen de una sesión. Es un subconjunto del contrato `Sesion` de
 * @aybarcorp/core escrito como tipo estructural: la sesión de @aybarcorp/auth (app,
 * shell) y la que el anfitrión entrega a un remoto lo cumplen sin que estas pantallas
 * importen ninguno de los dos paquetes.
 */
export interface SesionVisible {
  readonly usuarioId: string | null
  readonly nombre: string | null
  readonly roles: readonly string[]
  readonly empresaId?: string
  readonly atributos?: Readonly<Record<string, unknown>>
}

/**
 * `true` si la sesión es la simulada del modo demo: `crearAutenticacionDemo` la marca con
 * `atributos.demo`, y la marca viaja con la sesión hasta los remotos que monta el shell.
 */
export function esSesionDemo(sesion: SesionVisible | null | undefined): boolean {
  return sesion?.atributos?.['demo'] === true
}

/** Nombre para mostrar: el visible, o el identificador si el emisor no manda nombre. */
export function nombreVisible(sesion: SesionVisible): string {
  return sesion.nombre || sesion.usuarioId || 'Usuario sin nombre'
}

/** Los roles para mostrar, separados por comas, o «Sin roles». */
export function rolesVisibles(sesion: SesionVisible): string {
  return sesion.roles.length ? sesion.roles.join(', ') : 'Sin roles'
}

/**
 * Un usuario de prueba del modo demo, con la forma que lee `crearAutenticacionDemo` de
 * @aybarcorp/auth (y el anfitrión de desarrollo de un remoto). Existe solo con
 * `npm run dev`: sale de .env.development, que no entra al build de producción.
 */
export interface UsuarioDemo {
  readonly usuario: string
  readonly clave: string
  readonly nombre?: string
  readonly roles?: readonly string[]
}

/** Los roles de un usuario demo para mostrar; sin roles declarados, USER, como la sesión demo. */
export function rolesDeUsuarioDemo(usuario: UsuarioDemo): string {
  return usuario.roles?.length ? usuario.roles.join(', ') : 'USER'
}
