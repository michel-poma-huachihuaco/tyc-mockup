import { Tabs } from '@aybarcorp/ui'
import { navegar } from '../../../navegacion'
import { Encabezado } from '../../marco/Encabezado'
import { BASE, SECCIONES_ADMIN, migasDe } from '../../rutas'
import type { SeccionAdmin } from '../../rutas'
import { Auditoria } from './Auditoria'
import { Resumen } from './Resumen'
import { Roles } from './Roles'
import { Usuarios } from './Usuarios'

const rutaDe = (seccion: SeccionAdmin) => (seccion === 'resumen' ? `${BASE}/admin` : `${BASE}/admin/${seccion}`)

/**
 * /demo/admin: solo con el rol ADMIN (efectivo: «Ver como Usuario» lo quita y la galería
 * responde con el 403 del framework). Cuatro secciones con su URL, en pestañas bajo el
 * título; los datos son las personas, los roles y la auditoría sintéticos de datos/, en
 * memoria: lo que se cambia aquí se pierde al recargar.
 */
export default function Administracion({ seccion }: { seccion: SeccionAdmin }) {
  const descripcion = SECCIONES_ADMIN.find((s) => s.id === seccion)?.descripcion
  return (
    <div className="gl-pagina gl-pagina--ancha">
      <Encabezado titulo="Administración" descripcion={descripcion} migas={migasDe({ id: 'admin', seccion })} />
      <Tabs
        aria-label="Secciones de la administración"
        activationMode="manual"
        value={seccion}
        onValueChange={(valor) => {
          const destino = SECCIONES_ADMIN.find((s) => s.id === valor)
          if (destino) navegar(rutaDe(destino.id))
        }}
        items={SECCIONES_ADMIN.map((s) => ({ value: s.id, label: s.nombre }))}
      >
        <div className="gl-admin">
          {seccion === 'resumen' ? <Resumen /> : null}
          {seccion === 'usuarios' ? <Usuarios /> : null}
          {seccion === 'roles' ? <Roles /> : null}
          {seccion === 'auditoria' ? <Auditoria /> : null}
        </div>
      </Tabs>
    </div>
  )
}
