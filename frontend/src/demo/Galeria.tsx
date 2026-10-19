import { Error403, Error404, Skeleton, ToastRegion } from '@aybarcorp/ui'
import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react'
import type { MouseEvent, ReactNode } from 'react'
import { navegar, useUbicacion } from '../navegacion'
import { Redirigir } from '../pantallas/Redirigir'
import type { SesionVisible } from '../sesion'
import { CLAVE_VER_COMO, decidirAcceso, esVerComo, puedeVerComo, rolesEfectivos, ROL_ADMIN, verComoVigente } from './acceso'
import type { VerComo } from './acceso'
import { publicarHerramientas } from './axe'
import { ContextoGaleria } from './contexto'
import type { Galeria as ValorGaleria } from './contexto'
import { Encabezado } from './marco/Encabezado'
import { MarcoGaleria } from './marco/MarcoGaleria'
import { BASE, esPantallaCompleta, resolverRuta, rutaDe, sugerencias } from './rutas'
import type { Pantalla } from './rutas'
import { guardarAlmacen, leerAlmacen } from './utiles'
import './galeria.css'

/**
 * La galería de demostración: todo lo que hay bajo /demo, solo con `npm run dev`. La monta
 * la App (o el anfitrión de desarrollo de un remoto) con un `import()` que en producción no
 * existe, y `npm run demo:quitar` la borra entera.
 *
 * Recibe la sesión visible y «Salir» por props, como un remoto: no importa @aybarcorp/auth
 * ni el cliente HTTP, y no llama a ningún backend. Los datos son sintéticos (datos/).
 *
 * Las pantallas se cargan cada una en su chunk; three.js y axe-core, solo en la suya.
 */
export interface PropsGaleria {
  readonly sesion: SesionVisible | null
  readonly alSalir: () => Promise<void>
  /** El ingreso real de la aplicación: adonde va quien llega sin sesión a una pantalla privada. */
  readonly rutaIngreso: string
}

const Portada = lazy(() => import('./pantallas/Portada'))
const Vitrina = lazy(() => import('./vitrina/Vitrina'))
const CasoCompleto = lazy(() => import('./vitrina/CasoCompleto'))
const IndiceIngreso = lazy(() => import('./pantallas/ingreso/IndiceIngreso'))
const PantallaVariante = lazy(() => import('./pantallas/ingreso/PantallaVariante'))
const Cuenta = lazy(() => import('./pantallas/cuenta/Cuenta'))
const Administracion = lazy(() => import('./pantallas/admin/Administracion'))
const Personalizacion = lazy(() => import('./pantallas/Personalizacion'))
const Profundidad = lazy(() => import('./pantallas/Profundidad'))
const Visor3D = lazy(() => import('./tres-d/PantallaVisor'))
const Redimensionado = lazy(() => import('./pantallas/redimensionado/Redimensionado'))
const Accesibilidad = lazy(() => import('./pantallas/accesibilidad/Accesibilidad'))

export default function Galeria({ sesion, alSalir, rutaIngreso }: PropsGaleria) {
  const ubicacion = useUbicacion()
  const pantalla = useMemo(() => resolverRuta(ubicacion.pathname), [ubicacion.pathname])
  const embebido = ubicacion.searchParams.get('embebido') === '1'
  const [elegido, setElegido] = useState<VerComo | null>(() => {
    const leido = leerAlmacen('sesion', CLAVE_VER_COMO)
    return esVerComo(leido) ? leido : null
  })
  const [personalizar, setPersonalizar] = useState(false)
  const rolesReales = useMemo(() => sesion?.roles ?? [], [sesion])
  const roles = useMemo(() => rolesEfectivos(rolesReales, elegido), [rolesReales, elegido])
  const acceso = decidirAcceso(pantalla, sesion, elegido, `${ubicacion.pathname}${ubicacion.search}`)

  useEffect(() => publicarHerramientas(), [])
  useDesplazarAlNavegar(ubicacion.pathname, ubicacion.hash)

  const cambiarVerComo = useCallback((valor: VerComo) => {
    setElegido(valor)
    guardarAlmacen('sesion', CLAVE_VER_COMO, valor)
  }, [])

  const contexto = useMemo<ValorGaleria>(
    () => ({
      sesion,
      rolesReales,
      roles,
      admin: roles.includes(ROL_ADMIN),
      verComo: verComoVigente(rolesReales, elegido),
      puedeVerComo: puedeVerComo(rolesReales),
      cambiarVerComo,
      alSalir,
      personalizar,
      abrirPersonalizar: setPersonalizar,
    }),
    [sesion, rolesReales, roles, elegido, cambiarVerComo, alSalir, personalizar],
  )

  if (acceso.tipo === 'ingresar') {
    return <Redirigir a={`${rutaIngreso}?destino=${encodeURIComponent(acceso.destino)}`} />
  }

  const contenido =
    acceso.tipo === 'prohibido' ? (
      <Prohibido rol={acceso.rol} />
    ) : (
      <Suspense fallback={<Cargando />}>{pantallaDe(pantalla)}</Suspense>
    )

  let cuerpo: ReactNode
  if (esPantallaCompleta(pantalla)) cuerpo = contenido
  else if (embebido) {
    cuerpo = (
      <main id="contenido" tabIndex={-1} className="gl-embebido">
        {contenido}
      </main>
    )
  } else cuerpo = <MarcoGaleria pantalla={pantalla}>{contenido}</MarcoGaleria>

  return (
    <ContextoGaleria.Provider value={contexto}>
      {/* Un solo oyente para los enlaces de la galería: navegan sin recargar. */}
      <div className="gl" onClick={navegarSinRecargar}>
        {cuerpo}
        <ToastRegion />
      </div>
    </ContextoGaleria.Provider>
  )
}

function pantallaDe(pantalla: Pantalla): ReactNode {
  switch (pantalla.id) {
    case 'portada':
      return <Portada />
    case 'vitrina':
      return <Vitrina familia={pantalla.familia} componente={pantalla.componente} />
    case 'vitrina-caso':
      return <CasoCompleto familia={pantalla.familia} componente={pantalla.componente} n={pantalla.caso} />
    case 'ingreso':
      return <IndiceIngreso />
    case 'ingreso-variante':
      return <PantallaVariante variante={pantalla.variante} />
    case 'cuenta':
      return <Cuenta seccion={pantalla.seccion} />
    case 'admin':
      return <Administracion seccion={pantalla.seccion} />
    case 'personalizacion':
      return <Personalizacion />
    case 'profundidad':
      return <Profundidad />
    case '3d':
      return <Visor3D />
    case 'redimensionado':
      return <Redimensionado />
    case 'accesibilidad':
      return <Accesibilidad />
    case 'desconocida':
      return <Desconocida ruta={pantalla.ruta} />
    default:
      return <Desconocida ruta={rutaDe(pantalla)} />
  }
}

/** Mientras llega el chunk de una pantalla: la silueta del encabezado y de un bloque. */
function Cargando() {
  return (
    <div className="gl-pagina" aria-busy="true">
      <div className="gl-cargando">
        <Skeleton variant="text" width="30%" />
        <Skeleton variant="text" width="55%" height="2.25rem" />
        <Skeleton variant="block" height="16rem" />
      </div>
    </div>
  )
}

/** Una ruta de /demo que no existe: el 404 del framework, con las rutas parecidas. */
function Desconocida({ ruta }: { ruta: string }) {
  return (
    <div className="gl-pagina">
      <Error404 scope="region" cause="unknown-route" backHref={BASE} suggestions={sugerencias(ruta)} />
    </div>
  )
}

/** Sin el rol que pide la pantalla (o con «Ver como» bajándolo): el 403 del framework. */
function Prohibido({ rol }: { rol: string }) {
  return (
    <div className="gl-pagina">
      <Encabezado titulo="Administración" migas={[{ label: 'Galería', href: BASE }, { label: 'Administración' }]} />
      <Error403 scope="region" requiredRole={rol} resourceName="la administración de la galería" backHref={BASE} />
    </div>
  )
}

/**
 * Los enlaces de la galería son `<a href>` de verdad —los del Sidebar, las migas, las
 * tarjetas—: un clic sin modificadores navega con la History API en lugar de recargar.
 * Ctrl, Cmd, Mayús, el botón central, `target` y `download` siguen siendo del navegador, y
 * un ancla de la misma página desplaza sin más.
 */
function navegarSinRecargar(evento: MouseEvent<HTMLDivElement>) {
  if (evento.defaultPrevented || evento.button !== 0) return
  if (evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) return
  const enlace = evento.target instanceof Element ? evento.target.closest('a[href]') : null
  if (!(enlace instanceof HTMLAnchorElement)) return
  if ((enlace.target && enlace.target !== '_self') || enlace.hasAttribute('download')) return
  const url = new URL(enlace.href, location.href)
  if (url.origin !== location.origin) return
  if (url.pathname === location.pathname && url.search === location.search && url.hash) return
  evento.preventDefault()
  navegar(`${url.pathname}${url.search}${url.hash}`)
}

/**
 * Al cambiar de pantalla, arriba; con un ancla (`#caso-3`), hasta ella en cuanto exista.
 * Atrás y adelante también cambian la ruta: el navegador ya no restaura el desplazamiento
 * de una SPA, así que se hace aquí.
 */
function useDesplazarAlNavegar(ruta: string, ancla: string) {
  useEffect(() => {
    if (!ancla) {
      window.scrollTo({ top: 0 })
      return
    }
    let intentos = 0
    let marco = 0
    const buscar = () => {
      const destino = document.getElementById(decodeURIComponent(ancla.slice(1)))
      if (destino) {
        destino.scrollIntoView({ block: 'start' })
        return
      }
      // La pantalla llega en su chunk: se espera unos cuadros a que el ancla exista.
      if (intentos++ < 120) marco = requestAnimationFrame(buscar)
    }
    buscar()
    return () => cancelAnimationFrame(marco)
  }, [ruta, ancla])
}
