import { useAutenticacion } from '@aybarcorp/auth/react'
import { api } from './aybar/api'
import { autenticacion, autenticacionDemo } from './aybar/autenticacion'
import { configuracionAybar } from './aybar/configuracion'
import { navegar, useUbicacion } from './navegacion'
import { Bienvenida } from './pantallas/Bienvenida'
import { Ingreso } from './pantallas/Ingreso'
import { Inicio } from './pantallas/Inicio'
import { Marco } from './pantallas/Marco'
import { AlEmisor, NoEncontrada, Redirigir } from './pantallas/Redirigir'
import { RUTA_INGRESO, destinoSeguro, esUrlDePlantilla } from './rutas'
import './plantilla.css'
// aybar:demo:inicio — galería de demostración, solo en desarrollo (npm run demo:quitar la borra)
import { Suspense, lazy } from 'react'
const Galeria = import.meta.env.DEV ? lazy(() => import('./demo/Galeria')) : null
// aybar:demo:fin

/**
 * La aplicación: bienvenida pública, /ingresar y, con sesión, el inicio. Sustituye el inicio
 * por tus pantallas; la sesión y el cliente HTTP ya están cableados (src/aybar/, lo escribe
 * aybar-front init).
 *
 * Export con nombre y no por defecto a propósito: si este proyecto pasa a remoto,
 * `aybar-front add remoto` genera src/entrada.tsx con `import { App } from './App'`.
 *
 * Las llamadas a APIs no van en los componentes: van en un servicio (src/api/) que usa el
 * cliente de @aybarcorp/http. Un fetch o un axios en un componente lo corta el guardián.
 */
const rutaIngreso = autenticacionDemo?.rutaLogin ?? RUTA_INGRESO
const { baseUrl } = configuracionAybar.api
const urlBackend = esUrlDePlantilla(baseUrl) ? null : baseUrl

export function App() {
  const { fase, sesion, error, salir } = useAutenticacion()
  const ubicacion = useUbicacion()
  const destino = destinoSeguro(ubicacion.searchParams.get('destino'))
  const alSalir = async () => {
    await salir()
    navegar('/', { reemplazar: true })
  }

  // aybar:demo:inicio
  if (Galeria && /^\/demo(\/|$)/.test(ubicacion.pathname)) {
    return (
      <Suspense fallback={null}>
        <Galeria sesion={sesion} alSalir={alSalir} rutaIngreso={rutaIngreso} />
      </Suspense>
    )
  }
  // aybar:demo:fin
  if (ubicacion.pathname === rutaIngreso) {
    if (sesion) return <Redirigir a={destino} />
    const demo = autenticacionDemo
    if (demo) {
      return (
        <Ingreso
          ingresar={(usuario, clave) => demo.ingresar(usuario, clave)}
          usuarios={configuracionAybar.demo ?? []}
        />
      )
    }
    return <AlEmisor entrar={() => autenticacion.entrar(destino)} />
  }
  if (ubicacion.pathname !== '/') return <NoEncontrada />
  if (!sesion) {
    return (
      <Bienvenida
        ingreso={rutaIngreso}
        demo={Boolean(autenticacionDemo)}
        urlBackend={urlBackend}
        error={fase === 'error' ? error : undefined}
      />
    )
  }
  return (
    <Marco sesion={sesion} alSalir={alSalir}>
      <Inicio sesion={sesion} api={api} urlBackend={urlBackend} />
    </Marco>
  )
}

