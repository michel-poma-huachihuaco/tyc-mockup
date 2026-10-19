import { Card, CardBody, Splitter } from '@aybarcorp/ui'
import type { CSSProperties } from 'react'
import { useMemo, useRef } from 'react'
import { LOTES } from '../../datos'
import { useAnchoDe, pxPorRem } from './medir'
import { PLURAL_ESTADO, disposicionPara, resumenPorEstado } from './modelo'
import type { ResumenEstado } from './modelo'
import './contenedor.css'

/**
 * Tarjetas que cambian de disposición con el ancho de su panel (container queries), no con
 * el de la ventana: al arrastrar el separador, cada panel pasa de apilada a en fila y a
 * amplia por su cuenta. Cada panel dice cuánto mide y qué disposición le toca.
 */
export function TarjetasContenedor() {
  const resumen = useMemo(() => resumenPorEstado(LOTES), [])
  return (
    <div className="gl-cq">
      <Splitter label="Repartir el ancho entre los dos paneles de tarjetas" defaultSize={62} min={20} max={80} persistKey="galeria:tarjetas">
        <PanelTarjetas estados={resumen.slice(0, 2)} />
        <PanelTarjetas estados={resumen.slice(2)} />
      </Splitter>
    </div>
  )
}

function PanelTarjetas({ estados }: { estados: readonly ResumenEstado[] }) {
  const panel = useRef<HTMLDivElement>(null)
  const ancho = useAnchoDe(panel)
  return (
    <div ref={panel} className="gl-cq__panel">
      <p className="gl-cq__medida">
        {ancho > 0 ? `Este panel mide ${Math.round(ancho)} px` : 'Midiendo el panel'}
        {ancho > 0 ? <span className="gl-cq__disposicion">{disposicionPara(ancho, pxPorRem())}</span> : null}
      </p>
      <ul className="gl-cq__tarjetas">
        {estados.map((e) => (
          <li key={e.estado}>
            <Card>
              <CardBody>
                <div className="gl-cq__contenido" data-estado={e.estado}>
                  <p className="gl-cq__numero">{e.total}</p>
                  <div className="gl-cq__detalle">
                    <p className="gl-cq__etiqueta">
                      {PLURAL_ESTADO[e.estado]} · {e.porcentaje} % de los lotes
                    </p>
                    <span className="gl-cq__barra" aria-hidden="true">
                      <span className="gl-cq__relleno" style={{ '--gl-cq-porcentaje': `${e.porcentaje}%` } as CSSProperties} />
                    </span>
                    <dl className="gl-cq__desglose">
                      {e.manzanas.map((m) => (
                        <div key={m.manzana}>
                          <dt>Manzana {m.manzana}</dt>
                          <dd>{m.total}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              </CardBody>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  )
}
