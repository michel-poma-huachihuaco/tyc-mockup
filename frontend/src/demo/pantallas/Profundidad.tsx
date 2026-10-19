import { Badge, Card, CardBody, CardFooter, CardHeader, CardPairs, Parallax, ParallaxLayer, SegmentedControl, Tilt, useAppearance } from '@aybarcorp/ui'
import type { DepthId } from '@aybarcorp/ui'
import { useId } from 'react'
import type { ReactNode } from 'react'
import { LOTES, formatoSoles } from '../datos'
import { Encabezado } from '../marco/Encabezado'
import { BASE } from '../rutas'
import { useMedia } from '../utiles'

const DESTACADOS = [LOTES[0], LOTES[27], LOTES[61]].filter((l): l is NonNullable<typeof l> => Boolean(l))

/**
 * /demo/profundidad: Tilt, Parallax con sus capas y la superficie de vidrio, en
 * composiciones de un proyecto inmobiliario, y cuándo se apaga cada uno. Todo sale de los
 * tokens depth.*: los componentes solo dicen dónde está el puntero.
 */
export default function Profundidad() {
  const { appearance, set } = useAppearance()
  return (
    <div className="gl-pagina gl-pagina--ancha gl-profundidad">
      <Encabezado
        titulo="Profundidad"
        descripcion="Inclinación, paralaje y vidrio con los tokens depth.* del framework. Pasa el puntero por encima; con movimiento reducido, en táctil o con la profundidad «Plano» todo se queda quieto."
        migas={[{ label: 'Galería', href: BASE }, { label: 'Profundidad' }]}
        acciones={
          <span className="gl-profundidad__eje">
            <SegmentedControl
              size="sm"
              label="Profundidad"
              value={appearance.depth}
              onValueChange={(v) => set('depth', v as DepthId)}
              options={[
                { value: 'profundo', label: 'Profundo' },
                { value: 'plano', label: 'Plano' },
              ]}
            />
          </span>
        }
      />

      <Seccion titulo="Tilt" texto="La tarjeta se inclina hacia el puntero hasta depth.tilt-max y se acerca depth.elevation. Es un div sin rol ni foco: el enlace sigue siendo el título de la tarjeta.">
        <ul className="gl-rejilla gl-rejilla--tilt">
          {DESTACADOS.map((lote) => (
            <li key={lote.id}>
              <Tilt>
                <Card variant="interactive" href={`${BASE}/3d`}>
                  <div className="gl-lote-arte" aria-hidden="true">
                    <span className="gl-lote-arte__sol" />
                    <span className="gl-lote-arte__casa" />
                    <span className="gl-lote-arte__suelo" />
                  </div>
                  <CardHeader as="h3" title={`Lote ${lote.id}`} subtitle={`Manzana ${lote.manzana}${lote.preferente ? ' · preferente' : ''}`} actions={<Badge tone="success">{lote.area} m²</Badge>} />
                  <CardBody>
                    <CardPairs
                      pairs={[
                        ['Frente × fondo', `${lote.frente} × ${lote.fondo} m`],
                        ['Precio', formatoSoles(lote.precio)],
                      ]}
                    />
                  </CardBody>
                </Card>
              </Tilt>
            </li>
          ))}
        </ul>
      </Seccion>

      <Seccion titulo="Parallax" texto="Las capas del fondo van al revés que las del frente, ninguna más de depth.parallax-shift: la escena se lee en profundidad. Las decorativas no reciben el puntero ni se leen.">
        <div className="gl-escena">
          <Parallax>
            <ParallaxLayer depth={-0.9} decorative>
              <div className="gl-escena__cielo" />
            </ParallaxLayer>
            <ParallaxLayer depth={-0.5} decorative>
              <svg className="gl-escena__cerros" viewBox="0 0 1200 400" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                <path d="M0 260 C 160 170 280 230 420 190 S 700 120 860 200 S 1100 160 1200 210 V 400 H 0 Z" />
              </svg>
            </ParallaxLayer>
            <ParallaxLayer depth={-0.2} decorative>
              <svg className="gl-escena__edificios" viewBox="0 0 1200 400" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                {Array.from({ length: 14 }, (_, i) => {
                  const alto = 80 + ((i * 53) % 130)
                  return <rect key={i} x={40 + i * 82} y={400 - alto} width={56} height={alto} rx={4} />
                })}
              </svg>
            </ParallaxLayer>
            <ParallaxLayer depth={0.35}>
              <div className="gl-escena__contenido">
                <Card surface="glass" variant="elevated">
                  <CardBody>
                    <p className="gl-escena__aviso">Preventa</p>
                    <h3 className="gl-escena__titulo">Residencial Los Álamos</h3>
                    <p className="gl-texto-chico">160 lotes en 8 manzanas, con parque central y calles de doce metros.</p>
                  </CardBody>
                </Card>
              </div>
            </ParallaxLayer>
          </Parallax>
        </div>
      </Seccion>

      <Seccion titulo="Vidrio" texto="surface=&quot;glass&quot;: la superficie con depth.glass-opacity y el fondo desenfocado. Esa opacidad es la medida para que el texto cumpla AA aun con el fondo contrario detrás.">
        <div className="gl-banda">
          <span className="gl-banda__forma gl-banda__forma--a" aria-hidden="true" />
          <span className="gl-banda__forma gl-banda__forma--b" aria-hidden="true" />
          <ul className="gl-rejilla gl-rejilla--vidrio">
            <li>
              <Card surface="glass">
                <CardHeader as="h3" title="Vidrio" subtitle="variant default" />
                <CardBody>
                  <p className="gl-texto-chico">El texto tenue sube a atenuado dentro del vidrio.</p>
                </CardBody>
              </Card>
            </li>
            <li>
              <Card surface="glass" variant="elevated">
                <CardHeader as="h3" title="Vidrio elevado" subtitle="variant elevated" />
                <CardBody>
                  <p className="gl-texto-chico">Con la sombra de lo que flota sobre otro contenido.</p>
                </CardBody>
              </Card>
            </li>
            <li>
              <Tilt>
                <Card surface="glass" variant="interactive" href={`${BASE}/personalizacion`}>
                  <CardHeader as="h3" title="Vidrio que navega" subtitle="variant interactive + Tilt" />
                  <CardBody>
                    <p className="gl-texto-chico">Lleva a Personalización: prueba la profundidad «Plano».</p>
                  </CardBody>
                  <CardFooter meta="Tarjeta entera como enlace" />
                </Card>
              </Tilt>
            </li>
          </ul>
        </div>
      </Seccion>

      <CuandoSeApaga plano={appearance.depth === 'plano'} />
    </div>
  )
}

function Seccion({ titulo, texto, children }: { titulo: string; texto: string; children: ReactNode }) {
  const id = useId()
  return (
    <section className="gl-seccion" aria-labelledby={id}>
      <div className="gl-seccion__cabeza">
        <h2 id={id} className="gl-titulo-seccion">
          {titulo}
        </h2>
        <p className="gl-texto">{texto}</p>
      </div>
      {children}
    </section>
  )
}

/** Las condiciones que apagan la profundidad, con su estado ahora mismo en este navegador. */
function CuandoSeApaga({ plano }: { plano: boolean }) {
  const reducido = useMedia('(prefers-reduced-motion: reduce)')
  const tactil = useMedia('(hover: none)')
  const transparencia = useMedia('(prefers-reduced-transparency: reduce)')
  const forzados = useMedia('(forced-colors: active)')
  const filas = [
    { condicion: 'Movimiento reducido', detalle: 'prefers-reduced-motion: reduce', apaga: 'Tilt y Parallax: sin inclinación ni desplazamiento.', activa: reducido },
    { condicion: 'Sin puntero que pase por encima', detalle: 'hover: none (táctil)', apaga: 'Tilt y Parallax: no hay hover que seguir.', activa: tactil },
    { condicion: 'Transparencia reducida', detalle: 'prefers-reduced-transparency: reduce', apaga: 'El vidrio vuelve a la superficie opaca.', activa: transparencia },
    { condicion: 'Colores forzados', detalle: 'forced-colors: active', apaga: 'Todo: ni inclinación, ni paralaje, ni vidrio.', activa: forzados },
    { condicion: 'Profundidad «Plano»', detalle: 'data-depth="plano" en <html>', apaga: 'Todo: los tokens depth.* pasan a cero y el vidrio a opaco.', activa: plano },
    { condicion: 'Impresión', detalle: '@media print', apaga: 'Todo: en papel no hay puntero ni transparencia.', activa: false },
  ]
  const id = useId()
  return (
    <section className="gl-seccion" aria-labelledby={id}>
      <div className="gl-seccion__cabeza">
        <h2 id={id} className="gl-titulo-seccion">
          Cuándo se apaga
        </h2>
        <p className="gl-texto">La hoja del framework lo decide sola; aquí, lo que detecta este navegador ahora mismo.</p>
      </div>
      <div className="gl-props" role="region" aria-label="Condiciones que apagan la profundidad" tabIndex={0}>
        <table className="gl-props__tabla">
          <thead>
            <tr>
              <th scope="col">Condición</th>
              <th scope="col">Qué apaga</th>
              <th scope="col">Ahora</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f) => (
              <tr key={f.condicion}>
                <th scope="row">
                  {f.condicion}
                  <br />
                  <code className="gl-props__tipo">{f.detalle}</code>
                </th>
                <td className="gl-props__descripcion">{f.apaga}</td>
                <td>
                  <Badge tone={f.activa ? 'warning' : 'neutral'} size="sm" dot>
                    {f.activa ? 'Activa' : 'No'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
