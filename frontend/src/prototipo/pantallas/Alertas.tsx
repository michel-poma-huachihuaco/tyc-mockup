import { Breadcrumb, Button, Card, CardBody, CardHeader, Chip, DataGrid, EmptyState, Header, StatGroup, toast } from '@aybarcorp/ui'
import type { GridColumn } from '@aybarcorp/ui'
import { useMemo, useState } from 'react'
import { nombrePersona } from '../datos/catalogos.ts'
import { AvisoDeError, Prohibido, Supuesto, fecha, irA, useCarga } from '../comun.tsx'
import { hrefDe } from '../rutas.ts'
import { resumenJob, simulacion, useConsola, useSesion } from '../servicio/api.ts'
import { puede } from '../servicio/nucleo.ts'
import type { Alerta, EjecucionJob, TipoAlerta } from '../servicio/nucleo.ts'

const NOMBRE_TIPO: Record<TipoAlerta, string> = {
  FIRST_RESPONSE_OVERDUE: '1.ª respuesta vencida',
  RESOLUTION_OVERDUE: 'Resolución vencida',
}

/**
 * Alertas de SLA — HU-ATC-010. La constancia de cada alerta (destinatario, fecha, canal,
 * vencimiento evaluado y ciclo) y las corridas del job, con lo que alertó y lo que omitió
 * por estar ya alertado en su ciclo.
 */
export default function Alertas() {
  const sesion = useSesion()
  const { datos } = useConsola()
  const [carga, reintentar] = useCarga('alertas')
  const [tipos, setTipos] = useState<TipoAlerta[]>([])

  const filas = useMemo(
    () => [...datos.alertas].filter((a) => !tipos.length || tipos.includes(a.tipo)).sort((a, b) => b.fecha.getTime() - a.fecha.getTime()),
    [datos.alertas, tipos],
  )

  if (!puede.verAlertas(sesion.rol)) {
    return (
      <div className="pt-pagina">
        <Header title="Alertas SLA" />
        <Prohibido requiere="Supervisor ATC o Coordinador CX" recurso="ver las alertas de SLA" />
      </div>
    )
  }

  const numero = (ticketId: string) => datos.tickets.find((t) => t.id === ticketId)?.numero ?? ticketId
  const columnas: GridColumn<Alerta>[] = [
    {
      key: 'ticket',
      header: 'Ticket',
      width: '8.5rem',
      renderCell: (a) => (
        <button type="button" tabIndex={-1} className="pt-enlace-celda" onClick={() => irA(hrefDe(`ticket/${a.ticketId}`))}>
          {numero(a.ticketId)}
        </button>
      ),
    },
    {
      key: 'tipo',
      header: 'Tipo',
      width: '13rem',
      renderCell: (a) => (
        <span className="pt-celda-doble">
          <span className="pt-celda-doble__principal">{NOMBRE_TIPO[a.tipo]}</span>
          <code className="pt-celda-doble__secundaria">{a.tipo}</code>
        </span>
      ),
    },
    { key: 'ciclo', header: 'Ciclo', width: '5rem', align: 'end', renderCell: (a) => a.ciclo },
    { key: 'evaluado', header: 'Vencimiento evaluado', width: '10rem', renderCell: (a) => fecha(a.vencimientoEvaluado) },
    { key: 'fecha', header: 'Fecha de la alerta', width: '10rem', renderCell: (a) => fecha(a.fecha) },
    { key: 'destinatario', header: 'Destinatario', width: '10rem', renderCell: (a) => nombrePersona(a.destinatario) },
    { key: 'canal', header: 'Canal', width: '11rem', renderCell: (a) => a.canal },
  ]
  const columnasJob: GridColumn<EjecucionJob>[] = [
    { key: 'fecha', header: 'Corrida', renderCell: (j) => fecha(j.fecha) },
    { key: 'nuevas', header: 'Alertas nuevas', align: 'end', renderCell: (j) => j.nuevas },
    { key: 'omitidas', header: 'Omitidas (ya alertadas en su ciclo)', align: 'end', renderCell: (j) => j.omitidas },
  ]
  const ultima = datos.ejecuciones.at(-1)

  return (
    <div className="pt-pagina pt-pagina--ancha">
      <Header
        title="Alertas SLA"
        breadcrumb={<Breadcrumb items={[{ label: 'Bandeja', href: hrefDe('bandeja') }, { label: 'Alertas SLA' }]} />}
        description="Una sola alerta por ticket, tipo de incumplimiento y ciclo de reapertura."
        actions={
          sesion.rol === 'SUPERVISOR' ? (
            <Button
              variant="secondary"
              onClick={() => {
                toast({ message: resumenJob(simulacion.ejecutarJob()), tone: 'info' })
              }}
            >
              Ejecutar el job ahora
            </Button>
          ) : undefined
        }
      />
      {carga.fase === 'error' ? (
        <AvisoDeError error={carga.error} reintentar={reintentar} titulo="No se pudieron cargar las alertas" />
      ) : (
        <div className="pt-pila">
          <StatGroup
            loading={carga.fase === 'cargando'}
            items={[
              { id: 'total', label: 'Alertas', value: String(datos.alertas.length) },
              { id: 'fr', label: '1.ª respuesta vencida', value: String(datos.alertas.filter((a) => a.tipo === 'FIRST_RESPONSE_OVERDUE').length) },
              { id: 'res', label: 'Resolución vencida', value: String(datos.alertas.filter((a) => a.tipo === 'RESOLUTION_OVERDUE').length) },
              { id: 'job', label: 'Última corrida del job', value: ultima ? fecha(ultima.fecha) : '—' },
            ]}
          />
          <Card>
            <CardHeader
              as="h2"
              title="Constancia de alertas"
              actions={
                <div className="pt-en-linea" role="group" aria-label="Filtrar por tipo">
                  {(Object.keys(NOMBRE_TIPO) as TipoAlerta[]).map((t) => (
                    <Chip key={t} variant="selectable" selected={tipos.includes(t)} onSelectedChange={(s) => setTipos((l) => (s ? [...l, t] : l.filter((x) => x !== t)))}>
                      {NOMBRE_TIPO[t]}
                    </Chip>
                  ))}
                </div>
              }
            />
            <CardBody>
              <DataGrid<Alerta>
                caption="Alertas de SLA generadas"
                columns={columnas}
                rows={carga.fase === 'listo' ? filas : []}
                getRowId={(a) => a.id}
                loading={carga.fase === 'cargando'}
                emptyState={
                  <EmptyState
                    size="compact"
                    variant={tipos.length ? 'no-results' : 'first-use'}
                    title={tipos.length ? 'Ninguna alerta de ese tipo' : 'Sin alertas todavía'}
                    description="El job las genera cuando un ticket activo pasa su vencimiento. Puedes adelantar el reloj en Simulación."
                  />
                }
              />
              <Supuesto>Destinatario: el supervisor ATC; canal: notificación en la consola (pregunta abierta de FT-ATC-04).</Supuesto>
            </CardBody>
          </Card>
          <Card>
            <CardHeader as="h2" title="Corridas del job" subtitle="Programado a las 9:00 y a las 14:00 de cada día hábil; también al adelantar el reloj." />
            <CardBody>
              <DataGrid<EjecucionJob> caption="Corridas del job de SLA" columns={columnasJob} rows={[...datos.ejecuciones].reverse().slice(0, 10)} getRowId={(j) => j.id} />
            </CardBody>
          </Card>
          {datos.alertasConfiguracion.length ? (
            <Card>
              <CardHeader as="h2" title="Alertas de configuración" subtitle="Tickets abiertos con un tipo sin política activa (se aplicó la genérica global)." />
              <CardBody>
                <ul className="pt-lista-simple">
                  {[...datos.alertasConfiguracion].reverse().map((a) => (
                    <li key={a.id}>
                      <strong>{numero(a.ticketId)}</strong> · {fecha(a.fecha)} · {a.mensaje}
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          ) : null}
        </div>
      )}
    </div>
  )
}
