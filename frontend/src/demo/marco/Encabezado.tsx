import { Breadcrumb, Header } from '@aybarcorp/ui'
import type { ReactNode } from 'react'
import type { Miga } from '../rutas'

/**
 * El Header del framework con las migas de la galería: su título es el h1 de la pantalla y
 * el título del documento, y al navegar dentro de la galería recibe el foco (lo hace el
 * Header). Por eso una pantalla con pestañas (Mi cuenta, Administración) conserva el mismo
 * título al cambiar de pestaña: el foco se queda en la pestaña.
 */
export function Encabezado({
  titulo,
  descripcion,
  migas,
  acciones,
  meta,
}: {
  titulo: string
  descripcion?: string
  migas?: readonly Miga[]
  acciones?: ReactNode
  meta?: ReactNode
}) {
  return (
    <Header
      title={titulo}
      description={descripcion}
      meta={meta}
      actions={acciones}
      breadcrumb={migas && migas.length > 1 ? <Breadcrumb label="Ruta en la galería" items={[...migas]} /> : undefined}
    />
  )
}
