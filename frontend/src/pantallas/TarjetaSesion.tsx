import { Heading } from '@aybarcorp/ui'
import { useId } from 'react'
import { esSesionDemo, nombreVisible, rolesVisibles } from '../sesion'
import type { SesionVisible } from '../sesion'

/** Quién inició sesión, con qué roles y de dónde sale la sesión. */
export function TarjetaSesion({ sesion }: { sesion: SesionVisible }) {
  const id = useId()
  return (
    <section className="pl-tarjeta" aria-labelledby={id}>
      <Heading level={2} size="md" id={id} eyebrow="Sesión">
        {nombreVisible(sesion)}
      </Heading>
      <dl className="pl-datos">
        <dt>Usuario</dt>
        <dd className="pl-codigo">{sesion.usuarioId ?? '—'}</dd>
        {sesion.empresaId ? (
          <>
            <dt>Empresa</dt>
            <dd className="pl-codigo">{sesion.empresaId}</dd>
          </>
        ) : null}
        <dt>Roles</dt>
        <dd>{rolesVisibles(sesion)}</dd>
        <dt>Origen</dt>
        <dd>{esSesionDemo(sesion) ? 'Modo demo: sesión simulada, sin token' : 'Emisor OIDC'}</dd>
      </dl>
    </section>
  )
}
