/**
 * Roles y permisos de la galería, para la pantalla de roles (TreeView) y para «Ver como».
 * ADMIN y USER son los de los usuarios demo; los demás existen solo para que la tabla de
 * administración tenga variedad.
 */

export interface Rol {
  id: string
  nombre: string
  descripcion: string
  /** Ids de permiso (`modulo.accion`) que concede. */
  permisos: string[]
}

export interface Permiso {
  id: string
  nombre: string
}

export interface ModuloPermisos {
  id: string
  nombre: string
  permisos: Permiso[]
}

export const MODULOS: readonly ModuloPermisos[] = [
  {
    id: 'lotes',
    nombre: 'Lotes',
    permisos: [
      { id: 'lotes.ver', nombre: 'Ver lotes y su estado' },
      { id: 'lotes.reservar', nombre: 'Reservar un lote' },
      { id: 'lotes.precios', nombre: 'Cambiar precios' },
    ],
  },
  {
    id: 'clientes',
    nombre: 'Clientes',
    permisos: [
      { id: 'clientes.ver', nombre: 'Ver clientes' },
      { id: 'clientes.editar', nombre: 'Editar datos de contacto' },
      { id: 'clientes.exportar', nombre: 'Exportar la lista' },
    ],
  },
  {
    id: 'contratos',
    nombre: 'Contratos',
    permisos: [
      { id: 'contratos.ver', nombre: 'Ver contratos' },
      { id: 'contratos.redactar', nombre: 'Redactar un borrador' },
      { id: 'contratos.aprobar', nombre: 'Aprobar (reservado a una persona)' },
    ],
  },
  {
    id: 'pagos',
    nombre: 'Pagos',
    permisos: [
      { id: 'pagos.ver', nombre: 'Ver cuotas y pagos' },
      { id: 'pagos.conciliar', nombre: 'Conciliar pagos' },
    ],
  },
  {
    id: 'administracion',
    nombre: 'Administración',
    permisos: [
      { id: 'administracion.usuarios', nombre: 'Gestionar usuarios' },
      { id: 'administracion.roles', nombre: 'Gestionar roles' },
      { id: 'administracion.auditoria', nombre: 'Ver la auditoría' },
    ],
  },
]

const todos = MODULOS.flatMap((m) => m.permisos.map((p) => p.id))

export const ROLES: readonly Rol[] = [
  {
    id: 'ADMIN',
    nombre: 'Administración',
    descripcion: 'Gestiona usuarios, roles y la configuración. Ve la auditoría.',
    permisos: todos,
  },
  {
    id: 'USER',
    nombre: 'Usuario',
    descripcion: 'Acceso básico: consulta lotes, clientes, contratos y pagos.',
    permisos: ['lotes.ver', 'clientes.ver', 'contratos.ver', 'pagos.ver'],
  },
  {
    id: 'VENTAS',
    nombre: 'Ventas',
    descripcion: 'Reserva lotes y mantiene los datos de contacto de los clientes.',
    permisos: ['lotes.ver', 'lotes.reservar', 'clientes.ver', 'clientes.editar'],
  },
  {
    id: 'LEGAL',
    nombre: 'Legal',
    descripcion: 'Redacta borradores de contrato. La aprobación queda en manos de una persona.',
    permisos: ['contratos.ver', 'contratos.redactar'],
  },
  {
    id: 'FINANZAS',
    nombre: 'Finanzas',
    descripcion: 'Concilia pagos y exporta reportes.',
    permisos: ['pagos.ver', 'pagos.conciliar', 'clientes.exportar'],
  },
]

/** El rol por id, o `undefined`. */
export function rolPorId(id: string): Rol | undefined {
  return ROLES.find((r) => r.id === id)
}
