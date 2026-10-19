import { Avatar, DropdownMenu, IconButton } from '@aybarcorp/ui'
import type { MenuItem } from '@aybarcorp/ui'
import { nombreVisible, rolesVisibles } from '../sesion'
import type { SesionVisible } from '../sesion'

/**
 * El menú de la cuenta, en las acciones de la Navbar: el Avatar con las iniciales abre un
 * Dropdown Menu con quién inició sesión, sus roles y «Salir».
 *
 * Un menú solo admite comandos, grupos y separadores: el nombre y los roles son la cabecera
 * del grupo que contiene «Salir», y el lector la anuncia como su nombre. Las flechas, Escape
 * y la vuelta del foco al Avatar los pone el Dropdown Menu.
 */
export function MenuUsuario({ sesion, alSalir }: { sesion: SesionVisible; alSalir: () => void }) {
  const nombre = nombreVisible(sesion)
  const items: MenuItem[] = [
    { type: 'group', label: `${nombre} · ${rolesVisibles(sesion)}` },
    { type: 'item', value: 'salir', label: 'Salir' },
  ]
  return (
    <span className="pl-usuario">
      <DropdownMenu
        placement="bottom-end"
        items={items}
        onSelect={(valor) => {
          if (valor === 'salir') alSalir()
        }}
        trigger={
          <IconButton label={`Cuenta de ${nombre}`} icon={<Avatar name={nombre} size="sm" decorative />} />
        }
      />
    </span>
  )
}
