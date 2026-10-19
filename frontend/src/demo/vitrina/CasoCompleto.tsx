import { Error404 } from '@aybarcorp/ui'
import { use, useEffect } from 'react'
import { BarraFlotante } from '../marco/BarraFlotante'
import { BASE } from '../rutas'
import { casosDe, ubicarComponente } from './catalogo'
import { Marco } from './Caso'
import { cargarCatalogo } from './fuente'

/**
 * /demo/vitrina/:familia/:componente/caso/:n: un caso solo, a pantalla completa y sin el
 * marco de la galería. Es lo que piden un Login Form, una página de error o un layout
 * grande: ver cómo queda la página de verdad, con su `main`, su título y su foco.
 */
export default function CasoCompleto({ familia, componente, n }: { familia: string; componente: string; n: number }) {
  const datos = use(cargarCatalogo())
  const ubicado = ubicarComponente(datos.familias, familia, componente)
  const casos = ubicado ? casosDe(ubicado.componente) : []
  const actual = casos.find((c) => c.n === n)
  const rutaComponente = `${BASE}/vitrina/${familia}/${componente}`

  useEffect(() => {
    if (ubicado && actual) document.title = `${ubicado.componente.nombre} · ${actual.caso.etiqueta} · Galería`
  }, [ubicado, actual])

  if (!ubicado || !actual) {
    return (
      <main id="contenido" className="gl-completo gl-completo--centro">
        <Error404 cause="unknown-route" resourceName={`El caso ${n}`} backHref={ubicado ? rutaComponente : `${BASE}/vitrina`} />
      </main>
    )
  }
  const anterior = casos.find((c) => c.n === n - 1)
  const siguiente = casos.find((c) => c.n === n + 1)
  const destino = (c: typeof actual) => ({ href: `${rutaComponente}/caso/${c.n}`, label: c.caso.etiqueta })

  return (
    <div className="gl-completo">
      {/* El caso pone su propio `main` si lo declara (un Login Form con as="main"); si no, va en uno. */}
      {actual.caso.props?.['as'] === 'main' ? (
        <Marco key={n} grupo={actual.grupo} caso={actual.caso} pantallaCompleta />
      ) : (
        <main id="contenido" className="gl-completo__principal">
          <Marco key={n} grupo={actual.grupo} caso={actual.caso} pantallaCompleta />
        </main>
      )}
      <BarraFlotante
        titulo={`${ubicado.componente.nombre} · ${actual.caso.etiqueta}`}
        volver={{ href: `${rutaComponente}#caso-${n}`, label: ubicado.componente.nombre }}
        anterior={anterior ? destino(anterior) : null}
        siguiente={siguiente ? destino(siguiente) : null}
      />
    </div>
  )
}
