import type { AppearancePreset, AppearanceValues } from '@aybarcorp/tokens'
import { APPEARANCE, Card, CardBody, CardHeader, Chip, Header, Parallax, ParallaxLayer, Statistic, Tilt, useAppearance } from '@aybarcorp/ui'
import type { CSSProperties } from 'react'
import { useEffect, useId, useState } from 'react'
import { NOMBRE_PROYECTO } from '../../proyecto'
import { useGaleria } from '../contexto'
import { iconoDe } from '../iconos'
import { SECCIONES } from '../rutas'
import { cargarCatalogo } from '../vitrina/fuente'
import type { DatosCatalogo } from '../vitrina/fuente'

/**
 * /demo: la portada. Un héroe con profundidad —capas de Parallax con el degradado de la
 * paleta activa y una tarjeta de vidrio inclinable con el título—, las combinaciones de la
 * marca a un clic, las cifras del catálogo instalado y una tarjeta por sección.
 */
export default function Portada() {
  const galeria = useGaleria()
  const secciones = SECCIONES.filter((s) => s.id !== 'portada' && (galeria.admin || !s.soloAdmin))
  const idSecciones = useId()
  return (
    <div className="gl-pagina gl-portada">
      <section className="gl-heroe" aria-label="Presentación">
        <Parallax>
          <ParallaxLayer depth={-0.7} decorative>
            <div className="gl-heroe__fondo" />
          </ParallaxLayer>
          <ParallaxLayer depth={-0.35} decorative>
            <div className="gl-heroe__rejilla" />
          </ParallaxLayer>
          <ParallaxLayer depth={0.6} decorative>
            <div className="gl-heroe__orbes">
              <span className="gl-heroe__orbe gl-heroe__orbe--a" />
              <span className="gl-heroe__orbe gl-heroe__orbe--b" />
              <span className="gl-heroe__orbe gl-heroe__orbe--c" />
            </div>
          </ParallaxLayer>
          <ParallaxLayer depth={0.12}>
            <div className="gl-heroe__contenido">
              <Tilt>
                <Card surface="glass" variant="elevated">
                  <CardBody>
                    <p className="gl-heroe__aviso">
                      <span className="gl-heroe__punto" aria-hidden="true" />
                      Solo en desarrollo · se quita con <code>npm run demo:quitar</code>
                    </p>
                    <Header
                      title="Galería de demostración"
                      description={`Todo lo que trae ${NOMBRE_PROYECTO} para construir pantallas: cada componente con su código, once accesos distintos, la cuenta, la administración, la paleta en vivo, profundidad 3D y redimensionado. Datos sintéticos, sin backend.`}
                    />
                    <Cifras />
                  </CardBody>
                </Card>
              </Tilt>
            </div>
          </ParallaxLayer>
        </Parallax>
      </section>

      <Combinaciones />

      <section className="gl-portada__secciones" aria-labelledby={idSecciones}>
        <h2 id={idSecciones} className="gl-titulo-seccion">
          Explora la galería
        </h2>
        <ul className="gl-rejilla gl-rejilla--secciones">
          {secciones.map((s) => (
            <li key={s.id}>
              <Tilt>
                <Card variant="interactive" surface="glass" href={s.ruta}>
                  <CardHeader
                    as="h3"
                    title={s.nombre}
                    subtitle={s.descripcion}
                    lead={
                      <span className={`gl-icono-seccion gl-icono-seccion--${s.grupo === 'Explorar' ? 'marca' : s.grupo === 'Pantallas' ? 'acento' : 'neutro'}`}>
                        {iconoDe(s.id)}
                      </span>
                    }
                  />
                </Card>
              </Tilt>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

/** Componentes, casos y familias del catálogo instalado; el Skeleton mientras llega. */
function Cifras() {
  const [datos, setDatos] = useState<DatosCatalogo | null>(null)
  useEffect(() => {
    let vigente = true
    void cargarCatalogo().then((d) => {
      if (vigente) setDatos(d)
    })
    return () => {
      vigente = false
    }
  }, [])
  const familias = datos?.familias.filter((f) => f.casos > 0).length ?? 0
  return (
    <div className="gl-cifras">
      <Statistic size="sm" label="Componentes" value={datos?.componentes ?? 0} loading={!datos} />
      <Statistic size="sm" label="Casos en el catálogo" value={datos?.casos ?? 0} loading={!datos} />
      <Statistic size="sm" label="Familias" value={familias} loading={!datos} />
    </div>
  )
}

const enUso = (preset: AppearancePreset, actual: AppearanceValues) =>
  Object.entries(preset.values).every(([eje, valor]) => actual[eje as keyof AppearanceValues] === valor)

/** La muestra de una combinación: el color de su paleta, como lo publica APPEARANCE. */
function muestraDe(preset: AppearancePreset): CSSProperties {
  const paleta = APPEARANCE.axes.palette.values.find((v) => v.id === preset.values.palette)
  const acento = APPEARANCE.axes.accent.values.find((v) => v.id === preset.values.accent)
  return { '--gl-muestra': paleta?.swatch, '--gl-muestra-acento': acento?.swatch ?? paleta?.swatch } as CSSProperties
}

/** Las combinaciones de la marca, como chips: aplicar una fija sus ejes de color. */
function Combinaciones() {
  const { appearance, presets, set } = useAppearance()
  const id = useId()
  return (
    <section className="gl-combinaciones" aria-labelledby={id}>
      <div className="gl-combinaciones__texto">
        <h2 id={id} className="gl-titulo-seccion">
          Combinaciones de la marca
        </h2>
        <p className="gl-texto-chico">Cambian toda la galería al instante; «Personalizar» tiene el resto de ejes.</p>
      </div>
      <div className="gl-combinaciones__chips" role="group" aria-labelledby={id}>
        {presets.map((preset) => (
          <Chip
            key={preset.id}
            variant="selectable"
            selected={enUso(preset, appearance)}
            onSelectedChange={() => {
              for (const [eje, valor] of Object.entries(preset.values)) {
                set(eje as keyof AppearanceValues, valor as never)
              }
            }}
            leading={<span className="gl-muestra" style={muestraDe(preset)} aria-hidden="true" />}
          >
            {preset.label}
          </Chip>
        ))}
      </div>
    </section>
  )
}
