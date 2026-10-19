import { ErrorAybar } from '@aybarcorp/http'
import type { ClienteHttp } from '@aybarcorp/http'
import { Alert, Button, Error401, Heading, Spinner } from '@aybarcorp/ui'
import { useEffect, useId, useState } from 'react'
import { RUTA_QUIEN_SOY, quienSoy } from '../api/recursos-ejemplo'
import type { QuienSoy } from '../api/recursos-ejemplo'
import { rutaIngreso } from '../rutas'
import { mensajeDe } from './utiles'

type Estado =
  | { fase: 'cargando' }
  | { fase: 'ok'; datos: QuienSoy }
  | { fase: 'error'; error: unknown }

/**
 * El backend del proyecto, si lo tiene: llama a GET /recursos-ejemplo/quien-soy con el
 * cliente de @aybarcorp/http y muestra lo que el backend leyó del token. Con la sesión
 * demo el backend responde 401 —no hay token que validar— y la sección lo dice tal cual.
 */
export function SeccionBackend({
  api,
  urlBackend,
  demo,
}: {
  api: ClienteHttp
  /** URL del backend, o `null` si la configuración sigue con la de plantilla. */
  urlBackend: string | null
  demo: boolean
}) {
  const id = useId()
  return (
    <section className="pl-tarjeta" aria-labelledby={id}>
      <Heading level={2} size="md" id={id} eyebrow="Backend">
        {urlBackend ? <span className="pl-codigo">{urlBackend}</span> : 'Sin backend configurado'}
      </Heading>
      {urlBackend ? (
        <Llamada api={api} demo={demo} />
      ) : (
        <p className="pl-texto">
          Este frontend no tiene backend: la URL de la API sigue siendo la de plantilla. Define{' '}
          <code>VITE_AYBAR_API_URL</code> en <code>.env.development</code> (o <code>api.baseUrl</code> en{' '}
          <code>aybar.config.json</code>) y aquí se llamará a <code>{RUTA_QUIEN_SOY}</code>.
        </p>
      )}
    </section>
  )
}

function Llamada({ api, demo }: { api: ClienteHttp; demo: boolean }) {
  const [estado, setEstado] = useState<Estado>({ fase: 'cargando' })
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    const control = new AbortController()
    quienSoy(api, control.signal).then(
      (datos) => setEstado({ fase: 'ok', datos }),
      (error: unknown) => {
        if (!control.signal.aborted) setEstado({ fase: 'error', error })
      },
    )
    return () => control.abort()
  }, [api, intento])

  const reintentar = () => {
    setEstado({ fase: 'cargando' })
    setIntento((n) => n + 1)
  }

  if (estado.fase === 'cargando') {
    return <Spinner size="sm" label={`Llamando a ${RUTA_QUIEN_SOY}`} showLabel />
  }

  if (estado.fase === 'ok') {
    const { datos } = estado
    return (
      <>
        <Alert tone="success" size="sm" live="off">
          El backend validó el token y respondió {RUTA_QUIEN_SOY}.
        </Alert>
        <dl className="pl-datos">
          <dt>Usuario</dt>
          <dd className="pl-codigo">{datos.username ?? '—'}</dd>
          <dt>Cuenta</dt>
          <dd className="pl-codigo">{datos.userAccountId ?? '—'}</dd>
          <dt>Empresa</dt>
          <dd className="pl-codigo">{datos.companyId ?? '—'}</dd>
          <dt>Roles</dt>
          <dd>{datos.roles?.length ? datos.roles.join(', ') : 'Sin roles'}</dd>
        </dl>
      </>
    )
  }

  const { error } = estado
  const accion = (
    <Button variant="ghost" size="sm" onClick={reintentar}>
      Repetir la llamada
    </Button>
  )

  if (error instanceof ErrorAybar && error.esNoAutenticado) {
    if (demo) {
      // `sin-sesion`: el cliente ni siquiera envió la petición, porque la sesión no entregó
      // token. Con `respuesta`, el backend sí contestó 401. Se dice cuál de los dos pasó.
      const enviada = error.fallo !== 'sin-sesion'
      return (
        <Alert
          tone="warning"
          title={enviada ? 'El backend rechazó la sesión demo (401)' : 'La sesión demo no puede llamar al backend (401)'}
          live="off"
          actions={accion}
        >
          {enviada
            ? 'La sesión demo no tiene access token y el backend protegido respondió 401, que es lo correcto.'
            : 'La sesión demo no tiene access token, así que el cliente no envía la petición: el backend protegido la rechazaría con 401.'}{' '}
          Para llamarlo hace falta el emisor OIDC real: comenta el usuario demo de <code>.env.development</code> y
          define <code>VITE_AYBAR_EMISOR</code> (README.md).
        </Alert>
      )
    }
    return <Error401 scope="region" cause="expired" signInHref={rutaIngreso(location.pathname)} />
  }

  return (
    <Alert tone="danger" title="No se pudo llamar al backend" live="off" actions={accion}>
      {describir(error)}
    </Alert>
  )
}

function describir(error: unknown): string {
  if (!(error instanceof ErrorAybar)) return mensajeDe(error)
  if (error.fallo === 'red') return 'No hubo respuesta: ¿está levantado el backend (aybar run) y permite este origen en CORS?'
  if (error.fallo === 'tiempo') return 'El backend no respondió a tiempo.'
  const titulo = [error.status ? `HTTP ${error.status}` : null, error.titulo].filter(Boolean).join(' · ')
  const traza = error.correlationId ? ` Correlation ID: ${error.correlationId}.` : ''
  return `${titulo}${error.detalle ? `: ${error.detalle}` : '.'}${traza}`
}
