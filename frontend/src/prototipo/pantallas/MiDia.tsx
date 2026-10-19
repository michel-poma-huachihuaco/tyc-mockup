import { Alert, Badge, Breadcrumb, Button, Card, CardBody, CardHeader, DataGrid, EmptyState, Header, StatGroup, Switch, Tabs, toast } from '@aybarcorp/ui'
import type { GridColumn } from '@aybarcorp/ui'
import { useState } from 'react'
import { AvisoDeError, BadgeSla, Prohibido, Supuesto, fecha, irA, restante, useAccion, useCarga } from '../comun.tsx'
import { NOMBRE_AREA, persona, nombrePersona } from '../datos/catalogos.ts'
import type { Area } from '../datos/catalogos.ts'
import { hrefDe } from '../rutas.ts'
import { api, useConsola, useSesion } from '../servicio/api.ts'
import { estadoSla } from '../servicio/nucleo.ts'
import type { Ticket } from '../servicio/nucleo.ts'
import { LIMITE_CARGA, avanceDe, correosDeAsignacion, disponible, equipoDe, esGestor, nombreLider, puedeVerEquipo, sinLider } from '../servicio/ola6.ts'
import type { AvanceDia, Correo } from '../servicio/ola6.ts'

type Pestana = 'dia' | 'equipo' | 'correos'

function TablaRiesgo({ tickets, ahora }: { tickets: readonly Ticket[]; ahora: Date }) {
  const columnas: GridColumn<Ticket>[] = [
    { key: 'numero', header: 'Ticket', width: '9rem', renderCell: (t) => <button type="button" tabIndex={-1} className="pt-enlace-celda" onClick={() => irA(hrefDe(`ticket/${t.id}`))}>{t.numero}</button> },
    { key: 'resumen', header: 'Solicitud', renderCell: (t) => t.resumen },
    { key: 'sla', header: 'SLA', width: '15rem', renderCell: (t) => { const s = estadoSla(t, ahora); return (<span className="pt-celda-doble"><BadgeSla sla={s} size="sm" /><span className="pt-celda-doble__secundaria">{restante(s.vence, ahora)}</span></span>) } },
  ]
  return <DataGrid<Ticket> caption="Tickets en riesgo" columns={columnas} rows={[...tickets]} getRowId={(t) => t.id} emptyState={<EmptyState size="compact" title="Nada en riesgo" description="Ningún ticket activo está por vencer." />} />
}

/** Mi día — HU-ATC-054 (avance), 046 (carga del equipo) y 055 (correos de asignación). */
export default function MiDia() {
  const sesion = useSesion()
  const { datos } = useConsola()
  const [carga, reintentar] = useCarga('mi-dia')
  const [pestana, setPestana] = useState<Pestana>('dia')
  const balanceo = useAccion()
  const disp = useAccion()
  if (!['GESTOR', 'COLABORADOR', 'SUPERVISOR', 'ADMIN_FUNCIONAL'].includes(sesion.rol)) {
    return (
      <div className="pt-pagina">
        <Header title="Mi día" />
        <Prohibido requiere="de atención o Administrador funcional" recurso="ver este tablero" />
      </div>
    )
  }
  const lider = puedeVerEquipo(sesion)
  const gestor = esGestor(sesion) || sesion.rol === 'SUPERVISOR'
  const mio = avanceDe(datos, sesion.id)
  const todos = correosDeAsignacion(datos)
  const correos = lider || sesion.rol === 'ADMIN_FUNCIONAL' ? todos : todos.filter((c) => c.para === sesion.id)
  const equipo = equipoDe(sesion.id)
  const sinLiderCorreos = todos.filter(sinLider)
  const avanceEquipo: AvanceDia[] = equipo.map((p) => avanceDe(datos, p.id))
  const colEquipo: GridColumn<AvanceDia>[] = [
    { key: 'persona', header: 'Gestor de tickets', width: '12rem', renderCell: (a) => nombrePersona(a.personaId) },
    { key: 'area', header: 'Área', width: '9rem', renderCell: (a) => NOMBRE_AREA[(persona(a.personaId)?.area ?? 'ATC') as Area] ?? '—' },
    { key: 'atendidos', header: 'Atendidos hoy', width: '8rem', align: 'end', renderCell: (a) => a.atendidos },
    { key: 'pendientes', header: 'Pendientes', width: '8rem', align: 'end', renderCell: (a) => a.pendientes },
    { key: 'riesgo', header: 'En riesgo', width: '8rem', align: 'end', renderCell: (a) => (a.enRiesgo ? <Badge tone="danger" size="sm">{a.enRiesgo}</Badge> : 0) },
    { key: 'carga', header: `Carga (límite ${LIMITE_CARGA})`, width: '10rem', align: 'end', renderCell: (a) => (a.carga > LIMITE_CARGA ? <Badge tone="warning" size="sm">{a.carga}</Badge> : a.carga) },
    { key: 'csat', header: 'CSAT del día', width: '8rem', align: 'end', renderCell: (a) => (a.csat === null ? '—' : a.csat.toFixed(1)) },
    { key: 'disp', header: 'Disponible', width: '9rem', renderCell: (a) => <Switch label={`Disponible: ${nombrePersona(a.personaId)}`} checked={disponible(datos, a.personaId)} onCheckedChange={(c) => disp.ejecutar(() => api.cambiarDisponibilidad(a.personaId, c))} /> },
  ]
  const colCorreos: GridColumn<Correo>[] = [
    { key: 'fecha', header: 'Enviado', width: '9rem', renderCell: (c) => fecha(c.fecha) },
    { key: 'para', header: 'Para', width: '11rem', renderCell: (c) => nombrePersona(c.para) },
    { key: 'cc', header: 'Con copia', width: '12rem', renderCell: (c) => (c.cc ? nombrePersona(c.cc) : <Badge tone="warning" size="sm">Sin líder en NEXUS</Badge>) },
    { key: 'asunto', header: 'Asunto', renderCell: (c) => (<span className="pt-celda-doble"><span className="pt-celda-doble__principal">{c.asunto}</span><span className="pt-celda-doble__secundaria">{c.tickets.slice(0, 6).join(', ')}{c.tickets.length > 6 ? '…' : ''}</span></span>) },
  ]
  return (
    <div className="pt-pagina pt-pagina--ancha">
      <Header
        title="Mi día"
        breadcrumb={<Breadcrumb items={[{ label: 'Bandeja', href: hrefDe('bandeja') }, { label: 'Mi día' }]} />}
        description="Tu avance de hoy; si eres líder, también el de tu equipo."
        tabs={
          <Tabs
            value={pestana}
            onValueChange={(v) => setPestana(v as Pestana)}
            items={[
              ...(gestor ? [{ value: 'dia', label: 'Mi día' }] : []),
              ...(lider ? [{ value: 'equipo', label: 'Equipo', count: equipo.length }] : []),
              { value: 'correos', label: 'Correos de asignación', count: correos.length },
            ]}
          />
        }
      />
      {carga.fase === 'error' ? <AvisoDeError error={carga.error} reintentar={reintentar} /> : pestana === 'equipo' && lider ? (
        <div className="pt-pila">
          <Card>
            <CardHeader as="h2" title="Avance del equipo" actions={<Button variant="primary" size="sm" loading={balanceo.enCurso} onClick={async () => { const r = await balanceo.ejecutar(() => api.balancear()); if (r) toast({ message: `Balanceo: ${r.movidos} tickets movidos y ${r.alCola} a la cola del área.`, tone: r.alCola ? 'warning' : 'success' }) }}>Balancear la carga</Button>} />
            <CardBody>
              <div className="pt-pila">
                {balanceo.error ? <AvisoDeError error={balanceo.error} /> : null}
                {disp.error ? <AvisoDeError error={disp.error} /> : null}
                {datos.alertasOps.filter((a) => a.tipo === 'SIN_DISPONIBLES').slice(-2).map((a) => <Alert key={a.id} tone="warning" size="sm" title="Nadie disponible"><span className="pt-alerta__texto">{a.detalle}</span></Alert>)}
                <DataGrid<AvanceDia> caption="Avance diario del equipo" columns={colEquipo} rows={avanceEquipo} getRowId={(a) => a.personaId} emptyState={<EmptyState size="compact" title="Sin equipo" description="Nadie te tiene como líder en NEXUS." />} />
                <p className="pt-texto-chico">El balanceo pasa los tickets de quien supera el límite al gestor disponible del área con menos carga, sin mover los de rayo, Eje 3 o con interacción en curso.</p>
                <Supuesto>Carga = puntos por prioridad (baja 1, media 2, alta 3, urgente 4) con límite de {LIMITE_CARGA}; el balanceo corre a pedido. Disponibilidad y turnos reales quedan fuera de alcance.</Supuesto>
              </div>
            </CardBody>
          </Card>
          {avanceEquipo.some((a) => a.ticketsRiesgo.length) ? (
            <Card>
              <CardHeader as="h2" title="Tickets en riesgo del equipo" />
              <CardBody><TablaRiesgo tickets={avanceEquipo.flatMap((a) => a.ticketsRiesgo)} ahora={datos.ahora} /></CardBody>
            </Card>
          ) : null}
        </div>
      ) : pestana === 'correos' || !gestor ? (
        <div className="pt-pila">
          {sesion.rol === 'ADMIN_FUNCIONAL' && sinLiderCorreos.length ? (
            <Alert tone="warning" title="Completa el líder en NEXUS">
              <span className="pt-alerta__texto">{sinLiderCorreos.length} correo(s) salieron sin copia porque el gestor no tiene líder registrado: {[...new Set(sinLiderCorreos.map((c) => nombrePersona(c.para)))].join(', ')}.</span>
            </Alert>
          ) : null}
          <Card>
            <CardBody>
              <div className="pt-pila">
                <DataGrid<Correo> caption="Correos de asignación" columns={colCorreos} rows={carga.fase === 'listo' ? correos.slice(0, 30) : []} getRowId={(c) => c.id} loading={carga.fase === 'cargando'} emptyState={<EmptyState size="compact" title="Sin correos" description="Llegan al asignarte o reasignarte un ticket." />} />
                <p className="pt-texto-chico">Salen al guardar la asignación, con copia a tu líder. En una reasignación masiva llega un solo correo con el resumen. Líder de cada gestor según NEXUS (DEP-02): {nombreLider(correos[0]?.cc ?? null)}.</p>
                <Supuesto>No se envía correo a quien se asigna un ticket a sí mismo; el correo real (en 1 minuto o menos) depende del servicio de envío.</Supuesto>
              </div>
            </CardBody>
          </Card>
        </div>
      ) : (
        <div className="pt-pila">
          <StatGroup
            loading={carga.fase === 'cargando'}
            items={[
              { id: 'at', label: 'Atendidos hoy', value: String(mio.atendidos) },
              { id: 'pe', label: 'Pendientes', value: String(mio.pendientes) },
              { id: 'ri', label: 'En riesgo', value: String(mio.enRiesgo) },
              { id: 'cs', label: 'CSAT del día', value: mio.csat === null ? '—' : mio.csat.toFixed(1) },
            ]}
          />
          <Card>
            <CardHeader as="h2" title="Mis tickets en riesgo" subtitle="Solo ves tu avance; el del equipo lo ve tu líder." />
            <CardBody>{carga.fase === 'listo' ? <TablaRiesgo tickets={mio.ticketsRiesgo} ahora={datos.ahora} /> : null}</CardBody>
          </Card>
        </div>
      )}
    </div>
  )
}
