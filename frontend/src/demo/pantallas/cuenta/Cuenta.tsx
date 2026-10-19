import { Tabs } from '@aybarcorp/ui'
import { navegar } from '../../../navegacion'
import { Encabezado } from '../../marco/Encabezado'
import { BASE, SECCIONES_CUENTA, migasDe } from '../../rutas'
import type { SeccionCuenta } from '../../rutas'
import { ESCRITORIO, useMedia } from '../../utiles'
import { Notificaciones } from './Notificaciones'
import { Perfil } from './Perfil'
import { Preferencias } from './Preferencias'
import { Seguridad } from './Seguridad'
import { Sesiones } from './Sesiones'

const rutaDe = (seccion: SeccionCuenta) => (seccion === 'perfil' ? `${BASE}/cuenta` : `${BASE}/cuenta/${seccion}`)

/**
 * /demo/cuenta: el panel de la persona que inició sesión, en cinco secciones con su URL. En
 * escritorio las pestañas son una columna a la izquierda; en el celular, una fila arriba.
 * Activación manual: las flechas recorren las pestañas y Enter cambia de sección (cada
 * cambio es una ruta: recorrer cuatro pestañas no deja cuatro entradas en el historial).
 *
 * Todo se guarda en memoria: guardar avisa con un Toast y no sale del navegador.
 */
export default function Cuenta({ seccion }: { seccion: SeccionCuenta }) {
  const escritorio = useMedia(ESCRITORIO)
  const descripcion = SECCIONES_CUENTA.find((s) => s.id === seccion)?.descripcion
  return (
    <div className="gl-pagina">
      <Encabezado titulo="Mi cuenta" descripcion={descripcion} migas={migasDe({ id: 'cuenta', seccion })} />
      <div className="gl-cuenta-tabs">
        <Tabs
          aria-label="Secciones de la cuenta"
          variant={escritorio ? 'vertical' : 'underline'}
          activationMode="manual"
          value={seccion}
          onValueChange={(valor) => {
            const destino = SECCIONES_CUENTA.find((s) => s.id === valor)
            if (destino) navegar(rutaDe(destino.id))
          }}
          items={SECCIONES_CUENTA.map((s) => ({ value: s.id, label: s.nombre }))}
        >
          <div className="gl-cuenta">
            {seccion === 'perfil' ? <Perfil /> : null}
            {seccion === 'preferencias' ? <Preferencias /> : null}
            {seccion === 'notificaciones' ? <Notificaciones /> : null}
            {seccion === 'seguridad' ? <Seguridad /> : null}
            {seccion === 'sesiones' ? <Sesiones /> : null}
          </div>
        </Tabs>
      </div>
    </div>
  )
}
