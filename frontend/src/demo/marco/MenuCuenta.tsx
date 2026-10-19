import { Avatar, DropdownMenu, IconButton } from '@aybarcorp/ui'
import type { MenuItem } from '@aybarcorp/ui'
import { useRef } from 'react'
import { navegar } from '../../navegacion'
import { nombreVisible } from '../../sesion'
import { OPCIONES_VER_COMO, esVerComo } from '../acceso'
import { useGaleria } from '../contexto'
import { BASE } from '../rutas'

/**
 * El menú de la cuenta en la galería: quién es (con los roles con que se ve la galería, que
 * «Ver como» puede bajar), Mi cuenta, volver a la aplicación y Salir. El Dropdown Menu pone
 * las flechas, Escape y la vuelta del foco al Avatar.
 *
 * Con `conVerComo`, cuando la barra no tiene sitio para el control, «Ver como» va aquí como
 * dos elementos de radio.
 */
export function MenuCuenta({ conVerComo = false }: { conVerComo?: boolean }) {
  const galeria = useGaleria()
  const saliendo = useRef(false)
  if (!galeria.sesion) return null
  const nombre = nombreVisible(galeria.sesion)
  const roles = galeria.roles.length ? galeria.roles.join(', ') : 'Sin roles'
  const items: MenuItem[] = [
    { type: 'group', label: `${nombre} · ${roles}` },
    { type: 'item', value: 'cuenta', label: 'Mi cuenta' },
    { type: 'item', value: 'aplicacion', label: 'Volver a la aplicación' },
    ...(conVerComo
      ? ([
          { type: 'separator' },
          { type: 'group', label: 'Ver como' },
          ...OPCIONES_VER_COMO.map((o) => ({
            type: 'item' as const,
            role: 'menuitemradio' as const,
            value: `ver-como:${o.valor}`,
            label: o.etiqueta,
            checked: galeria.verComo === o.valor,
          })),
        ] satisfies MenuItem[])
      : []),
    { type: 'separator' },
    { type: 'item', value: 'salir', label: 'Salir' },
  ]
  return (
    <span className="gl-cuenta">
      <DropdownMenu
        placement="bottom-end"
        items={items}
        onSelect={(valor) => {
          const verComo = valor.startsWith('ver-como:') ? valor.slice('ver-como:'.length) : null
          if (verComo !== null) {
            if (esVerComo(verComo)) galeria.cambiarVerComo(verComo)
          } else if (valor === 'cuenta') navegar(`${BASE}/cuenta`)
          else if (valor === 'aplicacion') navegar('/')
          else if (valor === 'salir' && !saliendo.current) {
            saliendo.current = true
            void galeria.alSalir().finally(() => {
              saliendo.current = false
            })
          }
        }}
        trigger={<IconButton label={`Cuenta de ${nombre}`} icon={<Avatar name={nombre} size="sm" decorative />} />}
      />
    </span>
  )
}
