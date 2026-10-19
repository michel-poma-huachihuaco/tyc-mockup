import { Badge, Card, CardBody, CardHeader, Splitter } from '@aybarcorp/ui'
import type { TonoBadge } from '@aybarcorp/ui'
import { useId } from 'react'
import type { ReactNode } from 'react'
import { AUDITORIA, ETIQUETA_ESTADO, HOY, LOTES, PERSONAS, formatoSoles } from '../../datos'
import type { EstadoLote } from '../../datos'
import { Encabezado } from '../../marco/Encabezado'
import { migasDe } from '../../rutas'
import { haceCuanto } from '../../utiles'
import { BandejaCorreo } from './BandejaCorreo'
import { TarjetasContenedor } from './TarjetasContenedor'
import { VistaPrevia } from './VistaPrevia'
import './redimensionado.css'

const TONO_ESTADO: Record<EstadoLote, TonoBadge> = { disponible: 'success', reservado: 'warning', vendido: 'info', bloqueado: 'neutral' }

/** El lote de la vista previa: el primero disponible. */
const LOTE = LOTES.find((l) => l.estado === 'disponible') ?? LOTES[0]!
const FILAS = LOTES.slice(0, 12)
const NOMBRES = new Map(PERSONAS.map((p) => [p.id, p.nombre]))
const REGISTRO = AUDITORIA.slice(0, 14)

const CODIGO = `<Splitter
  label="Ajustar el ancho del código"
  defaultSize={45}
  min={25}
  max={75}
  persistKey="galeria:redim-horizontal"
>
  <pre>…</pre>
  <Card>…</Card>
</Splitter>`

/**
 * /demo/redimensionado: el espacio que se reparte. Splitter horizontal y vertical, uno
 * anidado en otro como una bandeja de correo, tarjetas que cambian de disposición con su
 * contenedor (container queries) y la galería en un iframe a cuatro anchos de dispositivo.
 * Cada separador se maneja con el puntero o con el teclado y recuerda su reparto.
 */
export default function Redimensionado() {
  return (
    <div className="gl-pagina gl-pagina--ancha">
      <Encabezado
        titulo="Redimensionado"
        descripcion="Splitter, container queries y la galería a varios anchos. Arrastra los separadores o enfócalos con Tab y usa las flechas."
        migas={migasDe({ id: 'redimensionado' })}
      />
      <div className="gl-redim">
        <Seccion
          titulo="Dos paneles, dos ejes"
          texto={
            <>
              Arrastra la línea entre los paneles, o enfócala con <kbd>Tab</kbd> y usa las flechas (<kbd>Mayús</kbd> para pasos
              largos), <kbd>Inicio</kbd> y <kbd>Fin</kbd> para los extremos e <kbd>Intro</kbd> para plegar el primero cuando se
              puede. El reparto se recuerda en este navegador.
            </>
          }
        >
          <div className="gl-redim__par">
            <figure className="gl-redim__demo">
              <figcaption className="gl-redim__leyenda">
                <strong>Horizontal</strong> · el código y lo que pinta
              </figcaption>
              <div className="gl-redim__marco">
                <Splitter label="Ajustar el ancho del código" defaultSize={45} min={25} max={75} persistKey="galeria:redim-horizontal">
                  <pre className="gl-redim__codigo">{CODIGO}</pre>
                  <div className="gl-redim__muestra">
                    <Card variant="elevated">
                      <CardHeader
                        as="h3"
                        title={`Lote ${LOTE.id}`}
                        subtitle={`Manzana ${LOTE.manzana} · ${LOTE.area} m² · ${LOTE.frente} × ${LOTE.fondo} m`}
                        actions={
                          <Badge tone={TONO_ESTADO[LOTE.estado]} size="sm">
                            {ETIQUETA_ESTADO[LOTE.estado]}
                          </Badge>
                        }
                      />
                      <CardBody>
                        <p className="gl-redim__precio">{formatoSoles(LOTE.precio)}</p>
                      </CardBody>
                    </Card>
                  </div>
                </Splitter>
              </div>
            </figure>
            <figure className="gl-redim__demo">
              <figcaption className="gl-redim__leyenda">
                <strong>Vertical</strong> · la tabla arriba, el registro abajo (plegable)
              </figcaption>
              <div className="gl-redim__marco">
                <Splitter
                  orientation="vertical"
                  label="Ajustar el alto de la tabla de lotes"
                  defaultSize={58}
                  min={20}
                  max={85}
                  collapsible
                  persistKey="galeria:redim-vertical"
                >
                  <table className="gl-redim__tabla">
                    <caption className="ay-visually-hidden">Los primeros lotes del proyecto</caption>
                    <thead>
                      <tr>
                        <th scope="col">Lote</th>
                        <th scope="col" className="gl-redim__cifra">
                          Área
                        </th>
                        <th scope="col" className="gl-redim__cifra">
                          Precio
                        </th>
                        <th scope="col">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {FILAS.map((l) => (
                        <tr key={l.id}>
                          <th scope="row">{l.id}</th>
                          <td className="gl-redim__cifra">{l.area} m²</td>
                          <td className="gl-redim__cifra">{formatoSoles(l.precio)}</td>
                          <td>
                            <Badge tone={TONO_ESTADO[l.estado]} size="sm">
                              {ETIQUETA_ESTADO[l.estado]}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <ol className="gl-redim__registro" aria-label="Registro de actividad">
                    {REGISTRO.map((e) => (
                      <li key={e.id}>
                        <time dateTime={e.fecha}>{haceCuanto(e.fecha, HOY)}</time> · {NOMBRES.get(e.actor) ?? e.actor} · {e.accion}
                      </li>
                    ))}
                  </ol>
                </Splitter>
              </div>
            </figure>
          </div>
        </Seccion>

        <Seccion
          titulo="Uno dentro de otro: una bandeja de correo"
          texto="Carpetas, lista y lectura con dos Splitter anidados. Desde 768 px van lado a lado; en el celular se apilan, y cada disposición recuerda su reparto. Intro en el primer separador pliega las carpetas."
        >
          <BandejaCorreo />
        </Seccion>

        <Seccion
          titulo="Tarjetas que miran su contenedor"
          texto="Estas tarjetas no consultan el ancho de la ventana sino el de su panel (container queries). Arrastra el separador: por debajo de 22 rem se apilan, desde 22 rem ponen la cifra al lado y desde 36 rem pasan a dos columnas con el desglose por manzana."
        >
          <TarjetasContenedor />
        </Seccion>

        <Seccion
          titulo="La galería a cuatro anchos"
          texto="Una pantalla de la galería en un iframe de este mismo sitio, con ?embebido=1 para quitarle el marco, al ancho de cada dispositivo y reducida para caber aquí. Sus breakpoints ven el ancho del iframe, no el de esta ventana."
        >
          <VistaPrevia />
        </Seccion>
      </div>
    </div>
  )
}

function Seccion({ titulo, texto, children }: { titulo: string; texto: ReactNode; children: ReactNode }) {
  const id = useId()
  return (
    <section className="gl-redim__seccion" aria-labelledby={id}>
      <div className="gl-redim__cabecera">
        <h2 id={id} className="gl-redim__titulo">
          {titulo}
        </h2>
        <p className="gl-redim__texto">{texto}</p>
      </div>
      {children}
    </section>
  )
}
