import type { ClienteHttp } from '@aybarcorp/http'
import { Container, Stack } from '@aybarcorp/ui'
import type { ReactNode } from 'react'
import { esSesionDemo } from '../sesion'
import type { SesionVisible } from '../sesion'
import { SeccionBackend } from './SeccionBackend'
import { TarjetaSesion } from './TarjetaSesion'
// aybar:demo:inicio — la tarjeta que lleva a la galería de demostración, solo en desarrollo
import { useId } from 'react'
import { enlaceInterno } from '../navegacion'
// aybar:demo:fin

/** El inicio con sesión: la sesión, el backend y lo que agregue el papel. */
export function Inicio({
  sesion,
  api,
  urlBackend,
  encabezado,
  children,
}: {
  sesion: SesionVisible
  api: ClienteHttp
  urlBackend: string | null
  /** Lo que va antes de la sesión (un remoto se presenta aquí). */
  encabezado?: ReactNode
  /** Lo que el papel agrega después del resumen (el shell, sus módulos). */
  children?: ReactNode
}) {
  return (
    <Container size="page">
      <Stack gap="12">
        {encabezado}
        <div className="pl-resumen">
          <TarjetaSesion sesion={sesion} />
          <SeccionBackend api={api} urlBackend={urlBackend} demo={esSesionDemo(sesion)} />
        </div>
        {children}
        {/* aybar:demo:inicio */}
        {import.meta.env.DEV ? <TarjetaGaleria /> : null}
        {/* aybar:demo:fin */}
      </Stack>
    </Container>
  )
}

// aybar:demo:inicio
/**
 * Solo con `npm run dev`: la galería de demostración (/demo) con la vitrina de componentes,
 * once pantallas de ingreso, la cuenta, la administración, la personalización y el visor
 * 3D. No existe en el build de producción, y `npm run demo:quitar` la borra del proyecto.
 */
function TarjetaGaleria() {
  const id = useId()
  return (
    <section className="pl-galeria" aria-labelledby={id}>
      <div className="pl-galeria__texto">
        <p className="pl-galeria__aviso">Solo en desarrollo</p>
        <h2 id={id} className="pl-galeria__titulo">
          Galería de demostración
        </h2>
        <p className="pl-texto">
          Cada componente de <code>@aybarcorp/ui</code> con su código, once pantallas de ingreso, la cuenta, la
          administración, la paleta en vivo y un visor 3D, con datos sintéticos. Se quita con{' '}
          <code>npm run demo:quitar</code>.
        </p>
      </div>
      <a className="pl-accion pl-accion--primaria" {...enlaceInterno('/demo')}>
        Abrir la galería
      </a>
    </section>
  )
}
// aybar:demo:fin
