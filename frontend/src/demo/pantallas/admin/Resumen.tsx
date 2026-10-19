import { Card, CardBody, CardHeader, Link, StatGroup, Timeline } from '@aybarcorp/ui'
import type { CSSProperties } from 'react'
import { enlaceInterno } from '../../../navegacion'
import { AREAS_DISPONIBLES, AUDITORIA, ETIQUETA_ESTADO, HOY, LOTES, PERSONAS, formatoSoles, resumenLotes } from '../../datos'
import type { EstadoLote } from '../../datos'
import { BASE } from '../../rutas'
import { hitoDe } from './comun'

const SEMANA = 7 * 24 * 60 * 60 * 1000

/**
 * Resumen: las cifras que se leen juntas (Stat Group), dos repartos dibujados con CSS —un
 * ancho por porcentaje, sin librería de gráficos— y la actividad reciente en una Timeline.
 * Todo se calcula de los datos sintéticos al pintar.
 */
export function Resumen() {
  const activas = PERSONAS.filter((p) => p.estado === 'activo').length
  const invitadas = PERSONAS.filter((p) => p.estado === 'invitado').length
  const suspendidas = PERSONAS.filter((p) => p.estado === 'suspendido').length
  const conDobleFactor = PERSONAS.filter((p) => p.dobleFactor).length
  const lotes = resumenLotes()
  const vendido = LOTES.filter((l) => l.estado === 'vendido').reduce((t, l) => t + l.precio, 0)
  const criticosSemana = AUDITORIA.filter((e) => e.gravedad === 'critico' && HOY.getTime() - new Date(e.fecha).getTime() <= SEMANA).length
  const porArea = AREAS_DISPONIBLES.map((area) => ({ area, total: PERSONAS.filter((p) => p.area === area).length })).sort((a, b) => b.total - a.total)
  const maximo = Math.max(...porArea.map((a) => a.total))
  const estados = Object.keys(lotes) as EstadoLote[]

  return (
    <div className="gl-admin__resumen">
      <Card>
        <CardHeader as="h2" title="Personas" subtitle={`${PERSONAS.length} cuentas sintéticas`} />
        <CardBody>
          <StatGroup
            divider
            items={[
              { id: 'activas', label: 'Activas', value: String(activas) },
              { id: 'invitadas', label: 'Invitadas', value: String(invitadas) },
              { id: 'suspendidas', label: 'Suspendidas', value: String(suspendidas) },
              { id: 'doble', label: 'Con doble factor', value: `${Math.round((conDobleFactor / PERSONAS.length) * 100)} %` },
            ]}
          />
        </CardBody>
      </Card>
      <Card>
        <CardHeader as="h2" title="Lotes" subtitle={`${LOTES.length} lotes en 8 manzanas`} />
        <CardBody>
          <StatGroup
            divider
            items={[
              { id: 'disponibles', label: 'Disponibles', value: String(lotes.disponible) },
              { id: 'vendidos', label: 'Vendidos', value: String(lotes.vendido) },
              { id: 'ventas', label: 'Vendido (S/)', value: formatoSoles(vendido).replace('S/ ', '') },
            ]}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader as="h2" title="Personas por área" />
        <CardBody>
          <ul className="gl-barras" aria-label="Personas por área">
            {porArea.map(({ area, total }) => (
              <li key={area} className="gl-barras__fila">
                <span className="gl-barras__etiqueta">{area}</span>
                <span className="gl-barras__pista" aria-hidden="true">
                  <span className="gl-barras__barra" style={{ '--gl-valor': `${(total / maximo) * 100}%` } as CSSProperties} />
                </span>
                <span className="gl-barras__valor">{total}</span>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>

      <Card>
        <CardHeader as="h2" title="Lotes por estado" subtitle="Cada tramo es su parte del total." />
        <CardBody>
          <div className="gl-apilada" aria-hidden="true">
            {estados.map((estado) => (
              <span
                key={estado}
                className={`gl-apilada__tramo gl-estado--${estado}`}
                style={{ '--gl-valor': `${(lotes[estado] / LOTES.length) * 100}%` } as CSSProperties}
              />
            ))}
          </div>
          <ul className="gl-leyenda" aria-label="Lotes por estado">
            {estados.map((estado) => (
              <li key={estado}>
                <span className={`gl-leyenda__punto gl-estado--${estado}`} aria-hidden="true" />
                {ETIQUETA_ESTADO[estado]}: <strong>{lotes[estado]}</strong> ({Math.round((lotes[estado] / LOTES.length) * 100)} %)
              </li>
            ))}
          </ul>
          <p className="gl-texto-chico">
            <Link {...enlaceInterno(`${BASE}/3d`)}>Verlos en el visor 3D</Link>
          </p>
        </CardBody>
      </Card>

      <div className="gl-admin__ancha">
        <Card>
          <CardHeader
            as="h2"
            title="Actividad reciente"
            subtitle={`${criticosSemana} ${criticosSemana === 1 ? 'evento crítico' : 'eventos críticos'} en la última semana`}
            actions={<Link {...enlaceInterno(`${BASE}/admin/auditoria`)}>Ver toda la auditoría</Link>}
          />
          <CardBody>
            <Timeline label="Actividad reciente" events={AUDITORIA.slice(0, 6).map(hitoDe)} />
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
