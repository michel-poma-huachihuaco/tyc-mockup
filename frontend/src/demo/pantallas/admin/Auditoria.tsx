import { Button, Card, CardBody, CardHeader, Chip, Combobox, DateRangePicker, EmptyState, Timeline } from '@aybarcorp/ui'
import type { DateRangeValue } from '@aybarcorp/ui'
import { useEffect, useId, useMemo, useState } from 'react'
import { AUDITORIA, HOY } from '../../datos'
import type { Gravedad } from '../../datos'
import { ETIQUETA_GRAVEDAD, hitoDe, nombreDeActor } from './comun'

const PASO = 15
const DIA = 24 * 60 * 60 * 1000
const GRAVEDADES: readonly Gravedad[] = ['info', 'aviso', 'critico']

const inicioDelDia = (fecha: Date) => new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate())
const MAS_ANTIGUO = inicioDelDia(new Date(AUDITORIA[AUDITORIA.length - 1]?.fecha ?? HOY))

const ATAJOS = [
  { label: 'Últimas 24 horas', range: [new Date(HOY.getTime() - DIA), HOY] as [Date, Date] },
  { label: 'Últimos 7 días', range: [inicioDelDia(new Date(HOY.getTime() - 6 * DIA)), HOY] as [Date, Date] },
  { label: 'Septiembre 2026', range: [new Date(2026, 8, 1), new Date(2026, 8, 30)] as [Date, Date] },
]

/**
 * Auditoría: los 96 eventos sintéticos en una Timeline agrupada por día, con filtros por
 * periodo (Date Range Picker con atajos), gravedad (Chips) y actor (Combobox), y «Cargar
 * más actividad» de quince en quince. Cada hito despliega su IP (bloque de documentación
 * TEST-NET-1, que no se enruta) y el recurso afectado.
 */
export function Auditoria() {
  const [periodo, setPeriodo] = useState<DateRangeValue>([null, null])
  const [gravedades, setGravedades] = useState<Gravedad[]>([])
  const [actor, setActor] = useState<string | undefined>()
  const [mostrados, setMostrados] = useState(PASO)
  const idGravedad = useId()

  const actores = useMemo(() => {
    const cuenta = new Map<string, number>()
    for (const e of AUDITORIA) cuenta.set(e.actor, (cuenta.get(e.actor) ?? 0) + 1)
    return [...cuenta]
      .map(([id, total]) => ({ value: id, label: nombreDeActor(id), description: `${total} ${total === 1 ? 'evento' : 'eventos'}` }))
      .sort((a, b) => a.label.localeCompare(b.label, 'es'))
  }, [])

  const filtrados = useMemo(() => {
    const [desde, hasta] = periodo
    const fin = hasta ? inicioDelDia(hasta).getTime() + DIA : Number.POSITIVE_INFINITY
    return AUDITORIA.filter((e) => {
      const t = new Date(e.fecha).getTime()
      return (
        (!desde || t >= inicioDelDia(desde).getTime()) &&
        t < fin &&
        (gravedades.length === 0 || gravedades.includes(e.gravedad)) &&
        (!actor || e.actor === actor)
      )
    })
  }, [periodo, gravedades, actor])

  // Un filtro nuevo empieza otra vez por los quince más recientes.
  useEffect(() => setMostrados(PASO), [periodo, gravedades, actor])

  const hayFiltros = Boolean(periodo[0] || periodo[1] || gravedades.length || actor)
  const limpiar = () => {
    setPeriodo([null, null])
    setGravedades([])
    setActor(undefined)
  }

  return (
    <div className="gl-auditoria">
      <Card>
        <CardBody>
          <div className="gl-auditoria__filtros">
            <DateRangePicker
              label="Periodo"
              value={periodo}
              onValueChange={setPeriodo}
              minDate={MAS_ANTIGUO}
              maxDate={HOY}
              shortcuts={ATAJOS}
              locale="es-PE"
              showDuration
            />
            <div className="gl-auditoria__filtro">
              <Combobox
                label="Actor"
                placeholder="Escribe un nombre"
                options={actores}
                value={actor}
                onValueChange={(v) => setActor(typeof v === 'string' ? v : undefined)}
                emptyMessage="Nadie con ese nombre en la auditoría."
              />
            </div>
            <div className="gl-auditoria__filtro">
              <p id={idGravedad} className="gl-auditoria__rotulo">
                Gravedad
              </p>
              <div className="gl-auditoria__chips" role="group" aria-labelledby={idGravedad}>
                {GRAVEDADES.map((g) => (
                  <Chip
                    key={g}
                    variant="selectable"
                    selected={gravedades.includes(g)}
                    onSelectedChange={(marcado) => setGravedades((lista) => (marcado ? [...lista, g] : lista.filter((x) => x !== g)))}
                  >
                    {ETIQUETA_GRAVEDAD[g]}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
          <div className="gl-auditoria__resumen">
            <p className="gl-texto-chico" role="status">
              {filtrados.length} de {AUDITORIA.length} eventos
            </p>
            {hayFiltros ? (
              <Button variant="ghost" size="sm" onClick={limpiar}>
                Quitar los filtros
              </Button>
            ) : null}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader as="h2" title="Eventos" subtitle="Del más reciente al más antiguo, agrupados por día." />
        <CardBody>
          <Timeline
            label="Auditoría de la plataforma"
            locale="es-PE"
            groupByDay
            events={filtrados.slice(0, mostrados).map((e) => ({
              ...hitoDe(e),
              detail: (
                <dl className="gl-datos">
                  <dt>Gravedad</dt>
                  <dd>{ETIQUETA_GRAVEDAD[e.gravedad]}</dd>
                  <dt>Recurso</dt>
                  <dd>{e.recurso}</dd>
                  <dt>IP</dt>
                  <dd>
                    <code>{e.ip}</code>
                  </dd>
                </dl>
              ),
            }))}
            hasMore={mostrados < filtrados.length}
            onLoadMore={() => setMostrados((n) => n + PASO)}
            emptyState={
              <EmptyState
                size="compact"
                variant="no-results"
                title="Ningún evento con esos filtros"
                description="Amplía el periodo o quita la gravedad o el actor."
                action={
                  <Button variant="secondary" size="sm" onClick={limpiar}>
                    Quitar los filtros
                  </Button>
                }
              />
            }
          />
        </CardBody>
      </Card>
    </div>
  )
}
