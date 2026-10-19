import { Icon } from '@aybarcorp/ui'
import type { ReactNode } from 'react'
import { BotonTema } from '../../pantallas/BotonTema'

export interface Destino {
  readonly href: string
  readonly label: string
}

/**
 * La barra flotante de las pantallas completas de la galería (las de ingreso, un caso a
 * pantalla completa): volver, anterior y siguiente, el tema y lo que añada la pantalla. Va
 * abajo, centrada, en vidrio; la página deja su alto libre para que no tape nada.
 */
export function BarraFlotante({
  titulo,
  volver,
  anterior,
  siguiente,
  children,
}: {
  titulo: string
  volver: Destino
  anterior?: Destino | null
  siguiente?: Destino | null
  children?: ReactNode
}) {
  return (
    <nav className="gl-flotante" aria-label="Maqueta">
      <a className="gl-flotante__boton gl-flotante__boton--texto" href={volver.href}>
        <Icon name="arrow-left" size={16} />
        <span className="gl-flotante__volver">{volver.label}</span>
      </a>
      <span className="gl-flotante__separador" aria-hidden="true" />
      {anterior ? (
        <a className="gl-flotante__boton" href={anterior.href} title={`Anterior: ${anterior.label}`}>
          <Icon name="chevron-left" size={16} />
          <span className="ay-visually-hidden">Anterior: {anterior.label}</span>
        </a>
      ) : null}
      <span className="gl-flotante__titulo">{titulo}</span>
      {siguiente ? (
        <a className="gl-flotante__boton" href={siguiente.href} title={`Siguiente: ${siguiente.label}`}>
          <Icon name="chevron-right" size={16} />
          <span className="ay-visually-hidden">Siguiente: {siguiente.label}</span>
        </a>
      ) : null}
      <span className="gl-flotante__separador" aria-hidden="true" />
      {children}
      <BotonTema />
    </nav>
  )
}
