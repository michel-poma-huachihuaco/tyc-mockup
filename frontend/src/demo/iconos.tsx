import { Icon, createIcon } from '@aybarcorp/ui'
import type { ReactNode } from 'react'
import type { IdIcono } from './rutas'

/**
 * Iconos de las secciones de la galería. Los que el sistema de diseño ya trae van por su
 * nombre (`Icon name="home"`); los que no tiene se dibujan con `createIcon`, que les da el
 * mismo trazo de 1.5 y el mismo comportamiento (decorativos salvo que lleven `label`).
 */
export const IconoCubo = createIcon(
  'gl-cubo',
  <>
    <path d="M12 3 4 7.5v9L12 21l8-4.5v-9L12 3Z" />
    <path d="M4 7.5 12 12l8-4.5M12 12v9" />
  </>,
)

export const IconoCapas = createIcon(
  'gl-capas',
  <>
    <path d="m12 4 8 4-8 4-8-4 8-4Z" />
    <path d="m4 12 8 4 8-4M4 16l8 4 8-4" />
  </>,
)

export const IconoPaleta = createIcon(
  'gl-paleta',
  <>
    <path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.8 1.6-1.6 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-.9.7-1.6 1.6-1.6H16a5 5 0 0 0 5-5c0-4-4-7.4-9-7.4Z" />
    <path d="M7.5 11.5h.01M10 7.5h.01M14.5 7.5h.01M17 11h.01" />
  </>,
)

export const IconoRedimensionar = createIcon(
  'gl-redimensionar',
  <>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M12 4v16M8 10l-2 2 2 2M16 10l2 2-2 2" />
  </>,
)

export const IconoAccesibilidad = createIcon(
  'gl-accesibilidad',
  <>
    <circle cx="12" cy="4.5" r="1.5" />
    <path d="M5 8.5c2.3.6 4.6 1 7 1s4.7-.4 7-1M12 9.5V14M12 14l-3 6.5M12 14l3 6.5" />
  </>,
)

export const IconoTeclado = createIcon(
  'gl-teclado',
  <>
    <rect x="2.5" y="6" width="19" height="12" rx="2" />
    <path d="M6 10h.01M9.5 10h.01M13 10h.01M16.5 10h.01M7.5 14h9" />
  </>,
)

const POR_SECCION: Record<IdIcono, ReactNode> = {
  portada: <Icon name="home" />,
  vitrina: <Icon name="grid" />,
  '3d': <IconoCubo />,
  profundidad: <IconoCapas />,
  redimensionado: <IconoRedimensionar />,
  ingreso: <Icon name="lock" />,
  cuenta: <Icon name="user" />,
  admin: <Icon name="building" />,
  personalizacion: <IconoPaleta />,
  accesibilidad: <IconoAccesibilidad />,
  filtros: <Icon name="filter" />,
}

/** El icono decorativo de una sección (el nombre lo da su enlace). */
export function iconoDe(id: IdIcono): ReactNode {
  return POR_SECCION[id]
}
