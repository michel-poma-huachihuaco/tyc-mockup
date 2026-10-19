import { Alert, Badge, Breadcrumb, Button, Card, CardBody, CardHeader, CardPairs, DataGrid, Dialog, EmptyState, Form, FormField, Header, Select, StatGroup, Table, Tabs, toast } from '@aybarcorp/ui'
import type { GridColumn } from '@aybarcorp/ui'
import { useEffect, useId, useState } from 'react'
import { AvisoDeError, BadgeEstado, BadgeSla, Prohibido, Supuesto, dinero, erroresDeCampos, fecha, irA, restante, useAccion, useCarga } from '../comun.tsx'
import { ESTADOS_ACTIVOS, NOMBRE_AREA, NOMBRE_SENAL, PERSONAS, nombrePersona, nombreTipo } from '../datos/catalogos.ts'
import type { Area } from '../datos/catalogos.ts'
import { hrefDe } from '../rutas.ts'
import { api, simulacion, useConsola, useSesion } from '../servicio/api.ts'
import { medirEncuestas, npsPreliminar, puedeTorre, ticketsEnRiesgo } from '../servicio/ola5.ts'
import type { AuditoriaDatos, Encuesta, Informe, Medicion } from '../servicio/ola5.ts'
import { estadoSla, senalesActivas } from '../servicio/nucleo.ts'
import { INTERES_LEGAL, priorizadosPorDenuncia } from '../servicio/ola7.ts'
import type { Exposicion } from '../servicio/ola7.ts'
import type { Datos, Ticket } from '../servicio/nucleo.ts'

type Pestana = 'tablero' | 'riesgo' | 'encuestas' | 'informes' | 'auditoria'

/**
 * Torre de Control CX — HU-ATC-030 (tablero y redistribución), 019 (encuestas CSAT/CES),
 * 031 (informes diario y quincenal) y 032 (auditoría de registros paralelos).
 */
export default function Torre() {
  const sesion = useSesion()
  const { datos } = useConsola()
  const [carga, reintentar] = useCarga('torre')
  const [pestana, setPestana] = useState<Pestana>('tablero')
  if (!puedeTorre(sesion)) {
    return (
      <div className="pt-pagina">
        <Header title="Torre de Control CX" />
        <Prohibido requiere="Coordinador CX o Supervisor ATC" recurso="ver la Torre de Control" />
      </div>
    )
  }
  const ultima = datos.auditoriasDatos.at(-1)
  return (
    <div className="pt-pagina pt-pagina--ancha">
      <Header
        title="Torre de Control CX"
        breadcrumb={<Breadcrumb items={[{ label: 'Bandeja', href: hrefDe('bandeja') }, { label: 'Torre de Control CX' }]} />}
        description="Monitoreo en tiempo real, encuestas, informes y la auditoría del dato de cliente."
        tabs={
          <Tabs
            value={pestana}
            onValueChange={(v) => setPestana(v as Pestana)}
            items={[
              { value: 'tablero', label: 'Tablero', count: ticketsEnRiesgo(datos).length },
              { value: 'riesgo', label: 'Riesgo de denuncia', count: priorizadosPorDenuncia(datos).length },
              { value: 'encuestas', label: 'Encuestas', count: datos.encuestas.length },
              { value: 'informes', label: 'Informes', count: datos.informes.length },
              { value: 'auditoria', label: 'Auditoría de datos', count: ultima?.gateNoCompensable ? 1 : 0 },
            ]}
          />
        }
      />
      {carga.fase === 'error' ? (
        <AvisoDeError error={carga.error} reintentar={reintentar} titulo="No se pudo cargar la Torre" />
      ) : pestana === 'tablero' ? (
        <Tablero datos={datos} cargando={carga.fase === 'cargando'} />
      ) : pestana === 'riesgo' ? (
        <RiesgoDenuncia datos={datos} cargando={carga.fase === 'cargando'} />
      ) : pestana === 'encuestas' ? (
        <Encuestas datos={datos} cargando={carga.fase === 'cargando'} />
      ) : pestana === 'informes' ? (
        <Informes datos={datos} />
      ) : (
        <Auditoria datos={datos} />
      )}
    </div>
  )
}

/** HU-ATC-041: reclamos con riesgo de denuncia, por exposición económica; los «por estimar» no se descartan. */
function RiesgoDenuncia({ datos, cargando }: { datos: Datos; cargando: boolean }) {
  type Fila = { ticket: Ticket; exposicion: Exposicion }
  const filas = priorizadosPorDenuncia(datos)
  const columnas: GridColumn<Fila>[] = [
    { key: 'numero', header: 'Ticket', width: '9rem', renderCell: (f) => <button type="button" tabIndex={-1} className="pt-enlace-celda" onClick={() => irA(hrefDe(`ticket/${f.ticket.id}`))}>{f.ticket.numero}</button> },
    { key: 'resumen', header: 'Solicitud', renderCell: (f) => f.ticket.resumen },
    { key: 'senales', header: 'Señales', width: '12rem', renderCell: (f) => senalesActivas(datos, f.ticket.id).map((x) => NOMBRE_SENAL[x]).join(', ') || (f.ticket.reaperturas >= 2 ? 'Reincidencia' : '—') },
    { key: 'expo', header: 'Exposición', width: '11rem', align: 'end', renderCell: (f) => (f.exposicion.total === null ? <Badge tone="warning" size="sm">Por estimar</Badge> : dinero(f.exposicion.total, f.exposicion.moneda)) },
    { key: 'alerta', header: 'Alerta a Legal', width: '12rem', renderCell: (f) => { const a = datos.alertasRiesgo.find((x) => x.ticketId === f.ticket.id); return a ? <Badge tone="info" size="sm">Enviada {fecha(a.fecha)}</Badge> : <Badge tone="neutral" size="sm">Sin alerta</Badge> } },
  ]
  return (
    <Card>
      <CardHeader as="h2" title="Reclamos con riesgo de denuncia" subtitle={`Exposición = monto reclamado + interés legal referencial del ${INTERES_LEGAL * 100} % anual al día.`} />
      <CardBody>
        <div className="pt-pila">
          <DataGrid<Fila> caption="Reclamos con riesgo de denuncia por exposición" columns={columnas} rows={cargando ? [] : filas} getRowId={(f) => f.ticket.id} loading={cargando} emptyState={<EmptyState size="compact" title="Sin riesgo de denuncia" description="Ningún ticket activo tiene señales de INDECOPI, abogado o carta notarial." />} />
          <Supuesto>El 8 %, el umbral de alerta (S/ 500) y las señales que definen el riesgo están por confirmar con Legal. El job evalúa y alerta antes del vencimiento del plazo legal.</Supuesto>
        </div>
      </CardBody>
    </Card>
  )
}

function Tablero({ datos, cargando }: { datos: Datos; cargando: boolean }) {
  const [reasignar, setReasignar] = useState<Ticket | null>(null)
  const activos = datos.tickets.filter((t) => ESTADOS_ACTIVOS.includes(t.estado))
  const riesgo = ticketsEnRiesgo(datos)
  const derivaciones = activos.filter((t) => t.area !== 'ATC').length
  const nps = npsPreliminar(datos)
  const columnas: GridColumn<Ticket>[] = [
    { key: 'numero', header: 'Ticket', width: '9rem', renderCell: (t) => <button type="button" tabIndex={-1} className="pt-enlace-celda" onClick={() => irA(hrefDe(`ticket/${t.id}`))}>{t.numero}</button> },
    { key: 'resumen', header: 'Solicitud', width: '16rem', renderCell: (t) => t.resumen },
    { key: 'area', header: 'Área · responsable', width: '12rem', renderCell: (t) => `${NOMBRE_AREA[t.area]} · ${nombrePersona(t.responsable)}` },
    { key: 'estado', header: 'Estado', width: '8rem', renderCell: (t) => <BadgeEstado estado={t.estado} size="sm" /> },
    { key: 'sla', header: 'SLA', width: '14rem', renderCell: (t) => { const s = estadoSla(t, datos.ahora); return (<span className="pt-celda-doble"><BadgeSla sla={s} size="sm" /><span className="pt-celda-doble__secundaria">{restante(s.vence, datos.ahora)}</span></span>) } },
    { key: 'accion', header: 'Acción', width: '9rem', renderCell: (t) => <Button size="sm" variant="secondary" onClick={() => setReasignar(t)}>Reasignar</Button> },
  ]
  return (
    <div className="pt-pila">
      <StatGroup
        loading={cargando}
        items={[
          { id: 'act', label: 'Tickets activos', value: String(activos.length) },
          { id: 'rie', label: 'En riesgo o vencidos', value: String(riesgo.length) },
          { id: 'der', label: 'Derivaciones en curso', value: String(derivaciones) },
          { id: 'nps', label: 'NPS preliminar', value: nps === null ? '—' : String(nps) },
        ]}
      />
      <Card>
        <CardHeader as="h2" title="Casos en riesgo" subtitle="Detectados antes de que se incumpla: se pueden reasignar desde aquí." />
        <CardBody>
          <div className="pt-pila">
            <DataGrid<Ticket> caption="Tickets en riesgo o vencidos" columns={columnas} rows={cargando ? [] : riesgo} getRowId={(t) => t.id} loading={cargando} emptyState={<EmptyState size="compact" title="Nada en riesgo" description="Ningún ticket activo está por vencer o vencido." />} />
            <Supuesto>NPS preliminar derivado del CSAT (5 promotor, 4 pasivo, 1 a 3 detractor) hasta contar con el KPI Engine (DEP-10).</Supuesto>
          </div>
        </CardBody>
      </Card>
      <DialogoReasignar ticket={reasignar} onCerrar={() => setReasignar(null)} />
    </div>
  )
}

function DialogoReasignar({ ticket, onCerrar }: { ticket: Ticket | null; onCerrar: () => void }) {
  const id = useId()
  const [persona, setPersona] = useState('')
  const guardar = useAccion()
  useEffect(() => {
    if (!ticket) return
    setPersona('')
    guardar.limpiar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticket])
  if (!ticket) return null
  const errores = erroresDeCampos(guardar.error)
  const candidatos = PERSONAS.filter((p) => p.area === ticket.area && p.rol !== 'SIN_ATENCION' && p.id !== ticket.responsable)
  const enviar = async () => {
    const ok = await guardar.ejecutar(async () => {
      await api.redistribuir(ticket.id, persona)
      return true
    })
    if (ok) {
      toast({ message: `${ticket.numero} reasignado a ${nombrePersona(persona)}.`, tone: 'success' })
      onCerrar()
    }
  }
  return (
    <Dialog open onOpenChange={(a) => (a ? undefined : onCerrar())} title={`Reasignar ${ticket.numero}`} description={`Sigue en ${NOMBRE_AREA[ticket.area as Area]}; cambia quien lo atiende. Queda como fila nueva con el motivo «Redistribución por carga».`} size="md" footer={<><Button variant="ghost" onClick={onCerrar}>Cancelar</Button><Button variant="primary" type="submit" form={`${id}-f`} loading={guardar.enCurso}>Reasignar</Button></>}>
      <Form id={`${id}-f`} onSubmit={enviar} errors={errores.persona ? { [`${id}-p`]: errores.persona } : {}}>
        <FormField label="Nuevo responsable" id={`${id}-p`} error={errores.persona} required>
          <Select value={persona} placeholder="Elige a la persona" onChange={(e) => setPersona(e.target.value)} options={candidatos.map((p) => ({ value: p.id, label: p.nombre }))} />
        </FormField>
        {guardar.error && !errores.persona ? <AvisoDeError error={guardar.error} reintentar={enviar} /> : null}
      </Form>
    </Dialog>
  )
}

function TablaMedicion({ titulo, filas, nombre }: { titulo: string; filas: Medicion[]; nombre: (k: string) => string }) {
  return (
    <Table<{ id: string; clave: string; respondidas: number; csat: number; ces: number }>
      caption={titulo}
      captionVisible
      columns={[
        { key: 'clave', header: 'Grupo', render: (r) => nombre(r.clave) },
        { key: 'respondidas', header: 'Respuestas', align: 'end', render: (r) => r.respondidas },
        { key: 'csat', header: 'CSAT (1-5)', align: 'end', render: (r) => r.csat.toFixed(1) },
        { key: 'ces', header: 'CES (1-7)', align: 'end', render: (r) => r.ces.toFixed(1) },
      ]}
      rows={filas.map((f) => ({ id: f.clave, ...f }))}
    />
  )
}

function Encuestas({ datos, cargando }: { datos: Datos; cargando: boolean }) {
  const numero = (id: string) => datos.tickets.find((t) => t.id === id)?.numero ?? id
  const columnas: GridColumn<Encuesta>[] = [
    { key: 'ticket', header: 'Ticket', width: '9rem', renderCell: (e) => <button type="button" tabIndex={-1} className="pt-enlace-celda" onClick={() => irA(hrefDe(`ticket/${e.ticketId}`))}>{numero(e.ticketId)}</button> },
    { key: 'ciclo', header: 'Ciclo', width: '6rem', align: 'end', renderCell: (e) => e.ciclo },
    { key: 'sujeto', header: 'Sujeto', width: '10rem', renderCell: (e) => <code>{e.sujeto}</code> },
    { key: 'enviada', header: 'Enviada', width: '9rem', renderCell: (e) => fecha(e.enviada) },
    { key: 'resp', header: 'Respuesta', width: '11rem', renderCell: (e) => (e.respuesta ? `CSAT ${e.respuesta.csat} · CES ${e.respuesta.ces}` : <Badge tone="neutral" size="sm">Pendiente</Badge>) },
    { key: 'accion', header: 'Simulación', width: '11rem', renderCell: (e) => (e.respuesta ? null : <Button size="sm" variant="ghost" onClick={() => simulacion.responderEncuesta(e.id, 4, 6)}>Simular respuesta</Button>) },
  ]
  return (
    <div className="pt-pila">
      <div className="pt-dos-columnas">
        <Card><CardBody padding="sm"><TablaMedicion titulo="Por tipo de ticket" filas={medirEncuestas(datos, 'tipo')} nombre={nombreTipo} /></CardBody></Card>
        <Card><CardBody padding="sm"><TablaMedicion titulo="Por área" filas={medirEncuestas(datos, 'area')} nombre={(k) => NOMBRE_AREA[k as Area] ?? k} /></CardBody></Card>
      </div>
      <Card><CardBody padding="sm"><TablaMedicion titulo="Por gestor de tickets" filas={medirEncuestas(datos, 'gestor')} nombre={(k) => nombrePersona(k)} /></CardBody></Card>
      <Card>
        <CardHeader as="h2" title="Encuestas enviadas" subtitle="Una por cierre: al reabrir y volver a cerrar, se envía otra del nuevo ciclo." />
        <CardBody>
          <DataGrid<Encuesta> caption="Encuestas enviadas" columns={columnas} rows={cargando ? [] : [...datos.encuestas].reverse()} getRowId={(e) => e.id} loading={cargando} emptyState={<EmptyState size="compact" title="Sin encuestas" description="Se envían al cerrar un ticket." />} />
          <Supuesto>El cliente responde desde Mi Portal; aquí «Simular respuesta» pone CSAT 4 y CES 6. El diseño de las preguntas queda fuera de alcance.</Supuesto>
        </CardBody>
      </Card>
    </div>
  )
}

function Informes({ datos }: { datos: Datos }) {
  const diario = useAccion()
  const quincenal = useAccion()
  const generar = async (tipo: 'DIARIO' | 'QUINCENAL') => {
    const ok = await (tipo === 'DIARIO' ? diario : quincenal).ejecutar(async () => {
      await api.generarInforme(tipo)
      return true
    })
    if (ok) toast({ message: tipo === 'DIARIO' ? 'Informe diario generado.' : 'Informe quincenal generado.', tone: 'success' })
  }
  return (
    <div className="pt-pila">
      <div className="pt-acciones pt-acciones--inicio">
        <Button variant="primary" loading={diario.enCurso} onClick={() => generar('DIARIO')}>Generar el informe diario</Button>
        <Button variant="secondary" loading={quincenal.enCurso} onClick={() => generar('QUINCENAL')}>Generar el informe quincenal</Button>
      </div>
      {diario.error ? <AvisoDeError error={diario.error} /> : null}
      {quincenal.error ? <AvisoDeError error={quincenal.error} /> : null}
      {datos.informes.length ? (
        [...datos.informes].reverse().map((i: Informe) => (
          <Card key={i.id}>
            <CardHeader as="h2" title={i.tipo === 'DIARIO' ? 'Informe diario operativo' : 'Informe quincenal analítico'} subtitle={`Generado el ${fecha(i.generado)}`} />
            <CardBody padding="sm">
              <CardPairs pairs={i.datos.map(([k, v]) => [k, v] as [string, string])} />
              {i.serie.length ? <Table<{ id: string; etiqueta: string; valor: number }> caption="Adopción de Mi Portal por semana" captionVisible columns={[{ key: 'etiqueta', header: 'Semana', render: (r) => r.etiqueta }, { key: 'valor', header: 'Adopción', align: 'end', render: (r) => `${r.valor} %` }]} rows={i.serie.map((s) => ({ id: s.etiqueta, ...s }))} /> : null}
            </CardBody>
          </Card>
        ))
      ) : (
        <EmptyState title="Aún no hay informes" description="El diario cierra la jornada con tickets por eje, NPS preliminar, derivaciones y SLA; el quincenal suma tendencias y adopción de Mi Portal." />
      )}
      <Supuesto>La adopción de Mi Portal es otro producto: aquí es una serie ficticia hasta contar con el KPI Engine (DEP-10).</Supuesto>
    </div>
  )
}

function Auditoria({ datos }: { datos: Datos }) {
  const correr = useAccion()
  const columnas: GridColumn<AuditoriaDatos>[] = [
    { key: 'fecha', header: 'Corte', width: '10rem', renderCell: (a) => fecha(a.fecha) },
    { key: 'cantidad', header: 'Registros paralelos', width: '11rem', align: 'end', renderCell: (a) => a.cantidad },
    { key: 'resultado', header: 'Resultado', renderCell: (a) => (a.gateNoCompensable ? <Badge tone="danger" dot>Gate no compensable</Badge> : <Badge tone="success" dot>Cero: conforme</Badge>) },
  ]
  const ultima = datos.auditoriasDatos.at(-1)
  return (
    <div className="pt-pila">
      {ultima?.gateNoCompensable ? (
        <Alert tone="danger" title="Gate no compensable (RN-SVC-026)">
          <span className="pt-alerta__texto">Hay {ultima.cantidad} registro(s) paralelo(s) del dato de cliente fuera de SIGDA/TAXON. No es una observación menor: se eleva como gate no compensable.</span>
        </Alert>
      ) : null}
      <Card>
        <CardHeader as="h2" title="Auditoría quincenal del dato de cliente" actions={<Button variant="primary" loading={correr.enCurso} onClick={() => correr.ejecutar(() => api.ejecutarAuditoriaDatos())}>Ejecutar la auditoría</Button>} />
        <CardBody>
          <div className="pt-pila">
            {correr.error ? <AvisoDeError error={correr.error} /> : null}
            <p className="pt-texto-chico">El número de registros paralelos detectados en el corte debe ser cero. Para ver el hallazgo: Simulación › «Crear un registro paralelo» y vuelve a ejecutarla.</p>
            <DataGrid<AuditoriaDatos> caption="Cortes de la auditoría" columns={columnas} rows={[...datos.auditoriasDatos].reverse()} getRowId={(a) => a.id} emptyState={<EmptyState size="compact" title="Sin cortes" description="Ejecuta la auditoría para registrar el primero." />} />
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
