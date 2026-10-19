import { Alert, Badge, Breadcrumb, Button, Card, CardBody, CardHeader, DataGrid, EmptyState, Form, FormField, Header, Input, Select, Tabs, Textarea } from '@aybarcorp/ui'
import type { GridColumn } from '@aybarcorp/ui'
import { useId, useState } from 'react'
import { AvisoDeError, Prohibido, Supuesto, fecha, irA, useAccion, useCarga } from '../comun.tsx'
import { NOMBRE_ESTADO } from '../datos/catalogos.ts'
import type { Estado } from '../datos/catalogos.ts'
import { hrefDe } from '../rutas.ts'
import { api, useConsola, useSesion } from '../servicio/api.ts'
import type { Credencial, EventoUrbe, LlamadaApi } from '../servicio/ola5.ts'

const CREDENCIALES: Record<Credencial, string> = { valida: 'Token válido de UrbeMind', vencida: 'Token vencido', ausente: 'Sin credencial' }
const nombreEstado = (e: string) => NOMBRE_ESTADO[e as Estado] ?? e

/** Integración UrbeMind — HU-ATC-018: el API (creación y consulta) y los eventos de cambio de estado. */
export default function UrbeMind() {
  const sesion = useSesion()
  const { datos } = useConsola()
  const [carga, reintentar] = useCarga('urbemind')
  const [pestana, setPestana] = useState('api')
  const id = useId()
  const [credencial, setCredencial] = useState<Credencial>('valida')
  const [accion, setAccion] = useState<'crear' | 'consultar'>('crear')
  const [resumen, setResumen] = useState('')
  const [numero, setNumero] = useState('')
  const llamada = useAccion()
  const [ultima, setUltima] = useState<LlamadaApi | null>(null)

  if (['SIN_ATENCION', 'MODERADOR_EVENTO', 'MESA_SGD'].includes(sesion.rol)) {
    return (
      <div className="pt-pagina">
        <Header title="Integración UrbeMind" />
        <Prohibido requiere="de atención o Coordinador CX" recurso="ver la integración con UrbeMind" />
      </div>
    )
  }
  const enviar = async () => {
    const r = await llamada.ejecutar(() => api.llamarApiUrbe({ credencial, accion, resumen, numero }))
    if (r) setUltima(r)
  }
  const tono = (n: number) => (n < 300 ? 'success' : n === 401 ? 'danger' : 'warning')
  const colLlamadas: GridColumn<LlamadaApi>[] = [
    { key: 'fecha', header: 'Fecha', width: '9rem', renderCell: (l) => fecha(l.fecha) },
    { key: 'op', header: 'Operación', width: '12rem', renderCell: (l) => <code>{l.operacion}</code> },
    { key: 'cred', header: 'Credencial', width: '12rem', renderCell: (l) => CREDENCIALES[l.credencial] },
    { key: 'estado', header: 'Respuesta', width: '8rem', renderCell: (l) => <Badge tone={tono(l.estado)} size="sm">{l.estado}</Badge> },
    { key: 'detalle', header: 'Detalle', renderCell: (l) => l.detalle },
  ]
  const colEventos: GridColumn<EventoUrbe>[] = [
    { key: 'fecha', header: 'Publicado', width: '9rem', renderCell: (e) => fecha(e.fecha) },
    { key: 'ticket', header: 'Ticket', width: '10rem', renderCell: (e) => <button type="button" tabIndex={-1} className="pt-enlace-celda" onClick={() => irA(hrefDe(`ticket/${e.ticketId}`))}>{e.numero}</button> },
    { key: 'tipo', header: 'Evento', width: '13rem', renderCell: () => <code>ticket.estado_cambiado</code> },
    { key: 'cambio', header: 'Cambio', renderCell: (e) => `${nombreEstado(e.de)} → ${nombreEstado(e.a)}` },
  ]
  return (
    <div className="pt-pagina pt-pagina--ancha">
      <Header
        title="Integración UrbeMind"
        breadcrumb={<Breadcrumb items={[{ label: 'Bandeja', href: hrefDe('bandeja') }, { label: 'Integración UrbeMind' }]} />}
        description="UrbeMind crea y consulta tickets de incidencia de ciudad por API y recibe un evento por cada cambio de estado."
        tabs={<Tabs value={pestana} onValueChange={setPestana} items={[{ value: 'api', label: 'API', count: datos.urbe.llamadas.length }, { value: 'eventos', label: 'Eventos', count: datos.urbe.eventos.length }]} />}
      />
      {carga.fase === 'error' ? (
        <AvisoDeError error={carga.error} reintentar={reintentar} />
      ) : pestana === 'api' ? (
        <div className="pt-dos-columnas">
          <Card>
            <CardHeader as="h2" title="Probar el API" subtitle="Lo que haría el sistema UrbeMind; aquí se simula desde la consola." />
            <CardBody>
              <Form id={`${id}-f`} onSubmit={enviar}>
                <FormField label="Credencial" id={`${id}-cred`}>
                  <Select value={credencial} onChange={(e) => setCredencial(e.target.value as Credencial)} options={(Object.keys(CREDENCIALES) as Credencial[]).map((c) => ({ value: c, label: CREDENCIALES[c] }))} />
                </FormField>
                <FormField label="Operación" id={`${id}-op`}>
                  <Select value={accion} onChange={(e) => setAccion(e.target.value as typeof accion)} options={[{ value: 'crear', label: 'POST /tickets (crear incidencia)' }, { value: 'consultar', label: 'GET /tickets/{n} (consultar)' }]} />
                </FormField>
                {accion === 'crear' ? (
                  <FormField label="Resumen de la incidencia" id={`${id}-res`} required>
                    <Textarea rows={2} value={resumen} onChange={(e) => setResumen(e.target.value)} maxLength={200} />
                  </FormField>
                ) : (
                  <FormField label="N.º de ticket" id={`${id}-num`} required>
                    <Input value={numero} onChange={(e) => setNumero(e.target.value)} />
                  </FormField>
                )}
                <div className="pt-acciones">
                  <Button type="submit" variant="primary" loading={llamada.enCurso}>Enviar la llamada</Button>
                </div>
                {llamada.error ? <AvisoDeError error={llamada.error} reintentar={enviar} /> : null}
              </Form>
              {ultima ? (
                <Alert tone={ultima.estado < 300 ? 'success' : ultima.estado === 401 ? 'danger' : 'warning'} title={`Respuesta ${ultima.estado}`}>
                  <span className="pt-alerta__texto">{ultima.detalle}</span>
                </Alert>
              ) : null}
              <Supuesto>Las llamadas de UrbeMind se atribuyen a un usuario de servicio (aquí, un gestor de ATC); el API Gateway y el bus de eventos reales son la dependencia DEP-09.</Supuesto>
            </CardBody>
          </Card>
          <Card>
            <CardHeader as="h2" title="Log de llamadas" subtitle="Las rechazadas por credencial también quedan." />
            <CardBody padding="sm">
              <DataGrid<LlamadaApi> caption="Llamadas al API de UrbeMind" columns={colLlamadas} rows={carga.fase === 'listo' ? [...datos.urbe.llamadas].reverse() : []} getRowId={(l) => l.id} loading={carga.fase === 'cargando'} emptyState={<EmptyState size="compact" title="Sin llamadas" description="Envía una llamada para verla aquí." />} />
            </CardBody>
          </Card>
        </div>
      ) : (
        <Card>
          <CardBody>
            <DataGrid<EventoUrbe> caption="Eventos publicados para UrbeMind" columns={colEventos} rows={carga.fase === 'listo' ? [...datos.urbe.eventos].reverse() : []} getRowId={(e) => e.id} loading={carga.fase === 'cargando'} emptyState={<EmptyState size="compact" title="Sin eventos" description="Cambia el estado de un ticket creado por UrbeMind y aparecerá aquí." />} />
          </CardBody>
        </Card>
      )}
    </div>
  )
}
