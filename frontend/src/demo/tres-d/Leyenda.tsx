import { ETIQUETA_ESTADO, resumenLotes } from '../datos'
import type { EstadoLote } from '../datos'
import { ESTADOS, TOKEN_ESTADO, alturaRelativa, idTrama } from './plano'

/**
 * Las tramas del plano 2D, una sola vez en la página: las usan el plano y la leyenda
 * (`fill="url(#gl-maqueta-trama-…)"`), así que viven fuera de los dos. Son del color de la
 * superficie sobre el color del estado: se ven en claro y en oscuro.
 */
export function Tramas() {
  return (
    <svg className="gl-maqueta__tramas" aria-hidden="true" focusable="false">
      <defs>
        <pattern id="gl-maqueta-trama-puntos" width="3" height="3" patternUnits="userSpaceOnUse">
          <circle className="gl-maqueta__punto" cx="1.5" cy="1.5" r="0.7" />
        </pattern>
        <pattern id="gl-maqueta-trama-rayas" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line className="gl-maqueta__raya" x1="0" y1="0" x2="0" y2="3" />
        </pattern>
        <pattern id="gl-maqueta-trama-cuadros" width="3" height="3" patternUnits="userSpaceOnUse">
          <path className="gl-maqueta__raya" d="M0 0H3M0 0V3" />
        </pattern>
      </defs>
    </svg>
  )
}

/** Una caja del color y la trama del estado, con la altura relativa de su caja en 3D. */
export function Muestra({ estado }: { estado: EstadoLote }) {
  const alto = 4 + alturaRelativa(estado) * 8
  const trama = idTrama(estado)
  return (
    <svg className="gl-maqueta__muestra" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
      <rect x="0" y={12 - alto} width="12" height={alto} rx="1.5" style={{ fill: `var(${TOKEN_ESTADO[estado]})` }} />
      {trama ? <rect x="0" y={12 - alto} width="12" height={alto} rx="1.5" fill={`url(#${trama})`} /> : null}
    </svg>
  )
}

/**
 * La leyenda: cada estado con su color, su trama, la altura de su caja y cuántos lotes
 * hay (`resumenLotes`). El estado va escrito: el color y la forma solo lo refuerzan.
 */
export function Leyenda() {
  const resumen = resumenLotes()
  return (
    <div className="gl-maqueta__leyenda">
      <ul className="gl-maqueta__estados" aria-label="Leyenda de estados">
        {ESTADOS.map((estado) => (
          <li key={estado} className="gl-maqueta__estado">
            <Muestra estado={estado} />
            <span>{ETIQUETA_ESTADO[estado]}</span>
            <span className="gl-maqueta__cuenta">{resumen[estado]}</span>
          </li>
        ))}
      </ul>
      <p className="gl-maqueta__nota">En 3D, la altura también dice el estado; en 2D, la trama.</p>
    </div>
  )
}
