import { useEffect, useRef, useState } from 'react'
import type { MouseEvent, PointerEvent } from 'react'
import { ETIQUETA_ESTADO, LOTES, PLANO } from '../datos'
import type { Lote } from '../datos'
import { MANZANAS_PLANO, MARGEN_2D, TOKEN_ESTADO, VIEWBOX_2D, idTrama, loteDe, resumenEnTexto } from './plano'

/**
 * La alternativa 2D del visor: el mismo plano en SVG, con los colores de los mismos
 * tokens y una trama por estado. Se ve sin WebGL, con movimiento reducido o porque se
 * eligió. Como el 3D, se usa con el puntero; con el teclado, la lista de lotes (el SVG es
 * una imagen con su descripción, no 160 paradas de tabulación).
 *
 * En una pantalla estrecha el plano conserva un ancho mínimo legible y se desplaza de
 * lado dentro de su caja, que entonces entra en el orden de tabulación para poder
 * desplazarla con las flechas.
 */
export function Plano2D({
  seleccionado,
  enfocado,
  visibles,
  alSeleccionar,
}: {
  seleccionado: string | null
  enfocado: string | null
  visibles: ReadonlySet<string>
  alSeleccionar: (id: string) => void
}) {
  const caja = useRef<HTMLDivElement>(null)
  const [encima, setEncima] = useState<string | null>(null)
  const desborda = useDesborde(caja)
  const elegido = loteDe(seleccionado)
  const foco = loteDe(encima ?? enfocado)

  const loteDelEvento = (evento: MouseEvent | PointerEvent): string | null => {
    const nodo = evento.target instanceof Element ? evento.target.closest('[data-lote]') : null
    const id = nodo?.getAttribute('data-lote') ?? null
    return id !== null && visibles.has(id) ? id : null
  }

  return (
    <div
      ref={caja}
      className="gl-maqueta__plano"
      role={desborda ? 'region' : undefined}
      aria-label={desborda ? 'Plano 2D, desplazable de lado' : undefined}
      tabIndex={desborda ? 0 : undefined}
    >
      <svg
        className="gl-maqueta__svg"
        viewBox={VIEWBOX_2D}
        role="img"
        aria-label={`Plano 2D de ${LOTES.length} lotes en ${MANZANAS_PLANO.length} manzanas: ${resumenEnTexto()}. Para elegir un lote con el teclado, usa la lista de lotes.`}
        onClick={(evento) => {
          const id = loteDelEvento(evento)
          if (id) alSeleccionar(id)
        }}
        onPointerMove={(evento) => setEncima(evento.pointerType === 'mouse' ? loteDelEvento(evento) : null)}
        onPointerLeave={() => setEncima(null)}
      >
        <rect className="gl-maqueta__suelo" x={-MARGEN_2D} y={-MARGEN_2D} width={PLANO.ancho + 2 * MARGEN_2D} height={PLANO.alto + 2 * MARGEN_2D} />
        {MANZANAS_PLANO.map(({ manzana, rect }) => (
          <g key={manzana}>
            <rect className="gl-maqueta__manzana" x={rect.x - 1} y={rect.y - 1} width={rect.ancho + 2} height={rect.alto + 2} rx="1.5" />
            <text className="gl-maqueta__rotulo" x={rect.x - 1} y={rect.y - 3}>
              Manzana {manzana}
            </text>
          </g>
        ))}
        {LOTES.map((lote) => (
          <LoteSvg key={lote.id} lote={lote} fuera={!visibles.has(lote.id)} />
        ))}
        {foco && foco.id !== elegido?.id && visibles.has(foco.id) ? <Marca lote={foco} clase="gl-maqueta__marca gl-maqueta__marca--foco" /> : null}
        {elegido && visibles.has(elegido.id) ? <Marca lote={elegido} clase="gl-maqueta__marca gl-maqueta__marca--elegido" /> : null}
      </svg>
    </div>
  )
}

function LoteSvg({ lote, fuera }: { lote: Readonly<Lote>; fuera: boolean }) {
  const trama = idTrama(lote.estado)
  return (
    <g className={fuera ? 'gl-maqueta__lote is-fuera' : 'gl-maqueta__lote'} data-lote={lote.id}>
      <title>{`${lote.id} · ${ETIQUETA_ESTADO[lote.estado]} · ${lote.area} m²`}</title>
      <rect x={lote.x} y={lote.y} width={lote.frente} height={lote.fondo} style={{ fill: `var(${TOKEN_ESTADO[lote.estado]})` }} />
      {trama ? <rect className="gl-maqueta__trama" x={lote.x} y={lote.y} width={lote.frente} height={lote.fondo} fill={`url(#${trama})`} /> : null}
    </g>
  )
}

/** El contorno del lote elegido o del enfocado, encima de todo (en SVG manda el orden). */
function Marca({ lote, clase }: { lote: Readonly<Lote>; clase: string }) {
  return <rect className={clase} x={lote.x - 0.6} y={lote.y - 0.6} width={lote.frente + 1.2} height={lote.fondo + 1.2} rx="1" />
}

/** `true` mientras el contenido de la caja es más ancho que ella. */
function useDesborde(caja: { readonly current: HTMLElement | null }): boolean {
  const [desborda, setDesborda] = useState(false)
  useEffect(() => {
    const elemento = caja.current
    if (!elemento) return
    const medir = () => setDesborda(elemento.scrollWidth > elemento.clientWidth + 1)
    const observador = new ResizeObserver(medir)
    observador.observe(elemento)
    medir()
    return () => observador.disconnect()
  }, [caja])
  return desborda
}
