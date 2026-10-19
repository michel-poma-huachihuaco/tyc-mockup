import { Banner, Container, Header, Navbar, SkipLink } from '@aybarcorp/ui'
import { useId, useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode, Ref } from 'react'
import { enlaceInterno } from '../navegacion'
import { NOMBRE_PROYECTO } from '../proyecto'
import { esSesionDemo } from '../sesion'
import type { SesionVisible } from '../sesion'
import { BotonTema } from './BotonTema'
import { Marca } from './Marca'
import { MenuUsuario } from './MenuUsuario'

/**
 * El marco de las pantallas con sesión, en el orden que pide el sistema de diseño:
 *
 * - SkipLink, primero: un Tab y Enter llevan al contenido sin recorrer la Navbar.
 * - Navbar: la marca, que vuelve al inicio, y sus acciones: el tema y el menú de la cuenta
 *   (quién inició sesión, sus roles y «Salir»).
 * - Si la sesión es la simulada, un Banner que lo dice mientras dure: no se puede descartar
 *   porque la condición sigue activa. En el celular es una línea con «Más».
 * - `main#contenido`, destino del SkipLink, con el Header de la página (su `title` es el h1
 *   y el título de la pestaña) y el contenido.
 *
 * La Navbar queda fija arriba al desplazar y, en escritorio, el aviso debajo de ella. Lo
 * que tus pantallas fijen más abajo y el salto del SkipLink necesitan sus altos: se
 * publican en `--pl-navbar-alto` y `--pl-aviso-alto` y se miden de nuevo si cambian (al
 * estrecharse la ventana, el texto ocupa más líneas). La hoja los suma en `--pl-fijo-alto`.
 */
export function Marco({
  sesion,
  alSalir,
  children,
}: {
  sesion: SesionVisible
  alSalir: () => Promise<void>
  children: ReactNode
}) {
  const saliendo = useRef(false)
  const pagina = useRef<HTMLDivElement>(null)
  const barra = useRef<HTMLElement>(null)
  const aviso = useRef<HTMLDivElement>(null)
  const demo = esSesionDemo(sesion)

  useLayoutEffect(() => {
    const raiz = pagina.current
    if (!raiz) return
    const medidas = [
      ['--pl-navbar-alto', barra.current],
      ['--pl-aviso-alto', aviso.current],
    ] as const
    const medir = () => {
      for (const [propiedad, elemento] of medidas) {
        if (elemento) raiz.style.setProperty(propiedad, `${elemento.offsetHeight}px`)
      }
    }
    medir()
    const observador = new ResizeObserver(medir)
    for (const [, elemento] of medidas) if (elemento) observador.observe(elemento)
    return () => {
      observador.disconnect()
      for (const [propiedad] of medidas) raiz.style.removeProperty(propiedad)
    }
  }, [demo])

  const salir = async () => {
    // Un segundo «Salir» mientras se cierra la sesión no hace nada.
    if (saliendo.current) return
    saliendo.current = true
    try {
      await alSalir()
    } finally {
      saliendo.current = false
    }
  }

  return (
    <div ref={pagina} className="pl-pagina">
      <SkipLink scrollMargin="var(--pl-fijo-alto, 0px)" />
      <Navbar
        ref={barra}
        brand={
          <a className="ay-navbar__brand" {...enlaceInterno('/')}>
            <Marca nombre={NOMBRE_PROYECTO} />
          </a>
        }
        actions={
          <>
            <BotonTema />
            <MenuUsuario sesion={sesion} alSalir={() => void salir()} />
          </>
        }
      />
      {demo ? <AvisoDemo ref={aviso} /> : null}
      <main id="contenido" tabIndex={-1} className="pl-contenido">
        <Container size="page">
          <div className="pl-cabecera">
            <Header title={NOMBRE_PROYECTO} />
          </div>
        </Container>
        {children}
      </main>
    </div>
  )
}

/**
 * El aviso de sesión demo, en el envoltorio que mide el Marco. Desde 768 px, el texto
 * entero. Por debajo, una línea corta y «Más», que despliega el texto entero: los dos textos
 * están siempre en el DOM y la hoja elige cuál se ve según el ancho y `data-abierto`.
 */
function AvisoDemo({ ref }: { ref: Ref<HTMLDivElement> }) {
  const [abierto, setAbierto] = useState(false)
  const idCompleto = useId()
  return (
    <div ref={ref} className="pl-pagina__aviso" data-abierto={abierto || undefined}>
      <Banner
        tone="warning"
        action={
          <button
            type="button"
            className="pl-aviso__mas"
            aria-expanded={abierto}
            aria-controls={idCompleto}
            onClick={() => setAbierto(!abierto)}
          >
            {abierto ? 'Menos' : 'Más'}
          </button>
        }
      >
        <span className="pl-aviso__corto">Sesión demo · sin token</span>
        <span id={idCompleto} className="pl-aviso__completo">
          Sesión demo: inicio de sesión simulado para desarrollo local, sin emisor OIDC y sin token.
          Solo existe con <code>npm run dev</code> en localhost.
        </span>
      </Banner>
    </div>
  )
}
