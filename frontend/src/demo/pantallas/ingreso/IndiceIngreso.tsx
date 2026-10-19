import { Card, CardHeader } from '@aybarcorp/ui'
import { useEffect, useRef } from 'react'
import { enlaceInterno } from '../../../navegacion'
import { BotonTema } from '../../../pantallas/BotonTema'
import { Marca } from '../../../pantallas/Marca'
import { NOMBRE_PROYECTO } from '../../../proyecto'
import { useGaleria } from '../../contexto'
import { Encabezado } from '../../marco/Encabezado'
import { BASE, VARIANTES_INGRESO } from '../../rutas'
import { PANTALLAS_INGRESO } from './variantes'

/** El lienzo de cada miniatura: la variante se pinta a 1280 × 800 y se escala para caber. */
const LIENZO = { ancho: 1280, alto: 800 }

/**
 * /demo/ingreso: las once maquetas de acceso con su miniatura viva —la variante de verdad,
 * escalada, inerte y fuera del árbol de accesibilidad: el nombre lo da la tarjeta—. Es
 * pública, así que no lleva el marco de la galería (que pide sesión): una barra con la marca,
 * la vuelta a la galería y el tema.
 */
export default function IndiceIngreso() {
  const { sesion } = useGaleria()
  return (
    <div className="gl-completo">
      <header className="gl-barra-simple">
        <a className="gl-barra-simple__marca" {...enlaceInterno(sesion ? BASE : '/')}>
          <Marca nombre={NOMBRE_PROYECTO} />
          <span className="gl-marca__galeria">Galería</span>
        </a>
        <span className="gl-barra-simple__acciones">
          <a className="pl-accion pl-accion--secundaria" {...enlaceInterno(sesion ? BASE : '/')}>
            {sesion ? 'Volver a la galería' : 'Volver al inicio'}
          </a>
          <BotonTema />
        </span>
      </header>
      <main id="contenido" tabIndex={-1} className="gl-pagina gl-pagina--ancha gl-ingresos">
        <Encabezado
          titulo="Pantallas de ingreso"
          descripcion="Once accesos distintos, todos con los componentes del sistema de diseño. Son maquetas: se ven sin sesión y ninguna la inicia. Ábrelas a pantalla completa y recórrelas con la barra flotante."
          migas={sesion ? [{ label: 'Galería', href: BASE }, { label: 'Ingreso' }] : undefined}
        />
        <ul className="gl-rejilla gl-rejilla--ingresos">
          {VARIANTES_INGRESO.map((v, i) => (
            <li key={v.id}>
              <Card variant="interactive" href={`${BASE}/ingreso/${v.id}`}>
                <Miniatura variante={v.id} />
                <CardHeader as="h2" title={`${i + 1}. ${v.nombre}`} subtitle={v.descripcion} />
              </Card>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}

/** La variante a escala: el ancho de la tarjeta entre el del lienzo. */
function Miniatura({ variante }: { variante: (typeof VARIANTES_INGRESO)[number]['id'] }) {
  const marco = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const elemento = marco.current
    if (!elemento) return
    const medir = () => elemento.style.setProperty('--gl-escala', String(elemento.clientWidth / LIENZO.ancho))
    medir()
    const observador = new ResizeObserver(medir)
    observador.observe(elemento)
    return () => observador.disconnect()
  }, [])
  const Pantalla = PANTALLAS_INGRESO[variante]
  return (
    <div ref={marco} className="gl-miniatura" aria-hidden="true">
      <div className="gl-miniatura__lienzo" inert>
        <Pantalla miniatura />
      </div>
    </div>
  )
}
