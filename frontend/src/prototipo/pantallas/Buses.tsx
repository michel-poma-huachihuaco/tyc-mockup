import { Alert, Badge, Button, Card, CardBody, CardHeader, DataGrid, EmptyState, FormField, Header, Select, StatGroup, toast } from '@aybarcorp/ui'
import type { GridColumn } from '@aybarcorp/ui'
import { useState } from 'react'
import { AvisoDeError, Prohibido, Supuesto, erroresDeCampos, fecha, irA, useAccion, useCarga } from '../comun.tsx'
import { cliente } from '../datos/clientes.ts'
import { hrefDe } from '../rutas.ts'
import { api, useConsola, useSesion } from '../servicio/api.ts'
import { ErrorSimulado } from '../servicio/nucleo.ts'
import { BUSES, CONVOCADOS, MAX_ACOMPANANTES, NOMBRE_ESTADO_RESERVA, PUNTOS_EMBARQUE, cuposLibres, nombreBus, personas, puedeReservar, puedeVerBuses, reservaDe } from '../servicio/ola8.ts'
import type { ReservaBus } from '../servicio/ola8.ts'

const TONO = { CONFIRMADA: 'success', EN_ESPERA: 'warning', CANCELADA: 'neutral' } as const

/**
 * Buses del Entrega Fest (HU-ATC-060). El cliente convocado reserva su cupo (con
 * acompañantes y punto de embarque) en Mi Portal; el equipo ve el aforo por bus.
 */
export default function Buses() {
  const sesion = useSesion()
  const { datos } = useConsola()
  const [carga, reintentar] = useCarga('buses')
  if (!puedeVerBuses(sesion)) {
    return (
      <div className="pt-pagina">
        <Header title="Buses del Entrega Fest" />
        <Prohibido requiere="de cliente convocado, Coordinador CX, moderador o supervisor" recurso="ver las reservas de bus" />
      </div>
    )
  }
  const cargando = carga.fase === 'cargando'
  const aforo = (
    <StatGroup loading={cargando} items={BUSES.map((b) => ({ id: b.id, label: `${nombreBus(b.id)}`, value: `${cuposLibres(datos, b.id)} de ${b.aforo} libres` }))} />
  )
  return (
    <div className="pt-pagina pt-pagina--ancha">
      <Header
        title="Buses del Entrega Fest"
        description={puedeReservar(sesion) ? 'Reserva tu cupo con tus acompañantes y tu punto de embarque.' : 'Aforo por bus y reservas de los clientes convocados.'}
      />
      {carga.fase === 'error' ? <AvisoDeError error={carga.error} reintentar={reintentar} titulo="No se pudieron cargar los buses" /> : (
        <div className="pt-pila">
          {aforo}
          {puedeReservar(sesion) ? <Cliente /> : <Reservas />}
          <Supuesto>Hasta {MAX_ACOMPANANTES} acompañantes por reserva y aforos de 2, 4 y 6 personas (de prueba); la logística con el proveedor de buses queda fuera de alcance (pregunta abierta del PO).</Supuesto>
        </div>
      )}
    </div>
  )
}

/** Lo que ve el equipo: todas las reservas y su estado. */
function Reservas() {
  const { datos } = useConsola()
  const columnas: GridColumn<ReservaBus>[] = [
    { key: 'cliente', header: 'Cliente', renderCell: (r) => cliente(r.clienteId)?.nombre ?? '—' },
    { key: 'bus', header: 'Bus', width: '9rem', renderCell: (r) => nombreBus(r.busId) },
    { key: 'punto', header: 'Embarque', width: '12rem', renderCell: (r) => r.punto },
    { key: 'pers', header: 'Personas', width: '7rem', align: 'end', renderCell: (r) => personas(r) },
    { key: 'estado', header: 'Estado', width: '12rem', renderCell: (r) => <Badge tone={TONO[r.estado]} size="sm" dot>{NOMBRE_ESTADO_RESERVA[r.estado]}</Badge> },
    { key: 'ticket', header: 'Ticket', width: '8rem', renderCell: (r) => <button type="button" tabIndex={-1} className="pt-enlace-celda" onClick={() => irA(hrefDe(`ticket/${r.ticketId}`))}>{datos.tickets.find((t) => t.id === r.ticketId)?.numero}</button> },
  ]
  return (
    <Card>
      <CardHeader as="h2" title="Reservas" />
      <CardBody>
        <DataGrid<ReservaBus> caption="Reservas de bus del Entrega Fest" columns={columnas} rows={[...datos.reservasBus].reverse()} getRowId={(r) => r.id} emptyState={<EmptyState size="compact" title="Sin reservas" description="Los clientes convocados reservan desde Mi Portal." />} />
      </CardBody>
    </Card>
  )
}

/** Mi Portal: el formulario del cliente convocado. */
function Cliente() {
  const { datos } = useConsola()
  const [clienteId, setClienteId] = useState(CONVOCADOS[0])
  const [busId, setBusId] = useState<string>(BUSES[0].id)
  const [punto, setPunto] = useState('')
  const [acomp, setAcomp] = useState('0')
  const reservar = useAccion()
  const cancelar = useAccion()
  const actual = reservaDe(datos, clienteId)
  const errores = erroresDeCampos(reservar.error)
  const sinCupo = reservar.error instanceof ErrorSimulado && reservar.error.codigo === 'sin-cupo' ? reservar.error : null
  const necesita = 1 + Number(acomp)
  const alternativas = BUSES.filter((b) => b.id !== busId && cuposLibres(datos, b.id) >= necesita)
  const enviar = async (esperar: boolean) => {
    const r = await reservar.ejecutar(() => api.reservarBus({ clienteId, busId, punto, acompanantes: Number(acomp), esperar }))
    if (r) toast({ message: r.estado === 'CONFIRMADA' ? `Reserva confirmada: ${nombreBus(r.busId)}.` : 'Quedaste en lista de espera.', tone: r.estado === 'CONFIRMADA' ? 'success' : 'info' })
  }
  const avisos = datos.notificaciones.filter((n) => n.para === `cliente:${clienteId}`).reverse()
  return (
    <div className="pt-dos-columnas">
      <div className="pt-pila">
        <Card>
          <CardBody>
            <div className="pt-pila">
              <FormField label="Cliente convocado (simula la sesión de Mi Portal)">
                <Select value={clienteId} onChange={(e) => { setClienteId(e.target.value); reservar.limpiar() }} options={CONVOCADOS.map((id) => ({ value: id, label: cliente(id)?.nombre ?? id }))} />
              </FormField>
              {actual ? (
                <Alert tone={actual.estado === 'CONFIRMADA' ? 'success' : 'warning'} title={`${NOMBRE_ESTADO_RESERVA[actual.estado]} · ${nombreBus(actual.busId)}`} actions={<Button size="sm" variant="secondary" loading={cancelar.enCurso} onClick={() => cancelar.ejecutar(() => api.cancelarReserva(actual.id, clienteId)).then(() => toast({ message: 'Reserva cancelada: el cupo se liberó.', tone: 'info' }))}>Cancelar mi reserva</Button>}>
                  <span className="pt-alerta__texto">Embarque en {actual.punto} · {personas(actual)} {personas(actual) === 1 ? 'persona' : 'personas'} ({actual.acompanantes} acompañantes).{actual.estado === 'EN_ESPERA' ? ' Te avisamos si se libera un cupo.' : ''}</span>
                </Alert>
              ) : (
                <form className="pt-pila" noValidate onSubmit={(e) => { e.preventDefault(); void enviar(false) }}>
                  <div className="pt-rejilla-campos">
                    <FormField label="Bus y horario" error={errores.bus} required>
                      <Select value={busId} onChange={(e) => { setBusId(e.target.value); reservar.limpiar() }} options={BUSES.map((b) => ({ value: b.id, label: `${nombreBus(b.id)} · ${cuposLibres(datos, b.id)} libres` }))} />
                    </FormField>
                    <FormField label="Punto de embarque" error={errores.punto} required>
                      <Select value={punto} placeholder="Elige el punto" onChange={(e) => setPunto(e.target.value)} options={PUNTOS_EMBARQUE.map((p) => ({ value: p, label: p }))} />
                    </FormField>
                    <FormField label="Acompañantes" error={errores.acompanantes} required>
                      <Select value={acomp} onChange={(e) => { setAcomp(e.target.value); reservar.limpiar() }} options={Array.from({ length: MAX_ACOMPANANTES + 1 }, (_, n) => ({ value: String(n), label: String(n) }))} />
                    </FormField>
                  </div>
                  {sinCupo ? (
                    <Alert tone="warning" size="sm" title="Este bus no tiene cupo">
                      <span className="pt-alerta__texto">{sinCupo.message}</span>
                      <span className="pt-acciones pt-acciones--inicio">
                        {alternativas.map((b) => <Button key={b.id} type="button" size="sm" variant="secondary" onClick={() => { setBusId(b.id); reservar.limpiar() }}>Elegir {nombreBus(b.id)}</Button>)}
                        <Button type="button" size="sm" variant="primary" loading={reservar.enCurso} onClick={() => void enviar(true)}>Entrar en la lista de espera</Button>
                      </span>
                    </Alert>
                  ) : null}
                  {reservar.error && !sinCupo && !Object.keys(errores).length ? <AvisoDeError error={reservar.error} /> : null}
                  <div className="pt-acciones pt-acciones--inicio">
                    <Button type="submit" variant="primary" loading={reservar.enCurso}>Reservar mi cupo</Button>
                  </div>
                </form>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
      <aside className="pt-lateral" aria-label="Confirmaciones">
        <Card>
          <CardHeader as="h2" title="Confirmaciones enviadas" />
          <CardBody padding="sm">
            {avisos.length ? <ul className="pt-lista-simple">{avisos.map((n) => <li key={n.id}>{fecha(n.fecha)} · {n.mensaje}</li>)}</ul> : <p className="pt-texto-chico">Aún no tienes confirmaciones.</p>}
          </CardBody>
        </Card>
      </aside>
    </div>
  )
}
