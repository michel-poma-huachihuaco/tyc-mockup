import { createContext, useContext } from 'react'
import type { SesionVisible } from '../sesion'
import type { VerComo } from './acceso'

/**
 * Lo que la galería entrega a sus pantallas. La sesión llega por props desde la App (o el
 * anfitrión de desarrollo del remoto): la galería no importa @aybarcorp/auth ni el cliente
 * HTTP y no llama a ningún backend.
 */
export interface Galeria {
  /** `null` solo en las pantallas públicas (ingreso). */
  readonly sesion: SesionVisible | null
  readonly rolesReales: readonly string[]
  /** Los roles con que se pinta: los reales, o menos si «Ver como» los baja. */
  readonly roles: readonly string[]
  readonly admin: boolean
  readonly verComo: VerComo
  readonly puedeVerComo: boolean
  readonly cambiarVerComo: (valor: VerComo) => void
  readonly alSalir: () => Promise<void>
  /** El panel «Personalizar» del marco: abierto o no, y quién lo abre. */
  readonly personalizar: boolean
  readonly abrirPersonalizar: (abierto: boolean) => void
}

export const ContextoGaleria = createContext<Galeria | null>(null)

export function useGaleria(): Galeria {
  const galeria = useContext(ContextoGaleria)
  if (!galeria) throw new Error('useGaleria() fuera de <Galeria>: las pantallas de la galería se montan dentro de ella.')
  return galeria
}
