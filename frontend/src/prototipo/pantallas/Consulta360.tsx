import { Alert, Badge, Button, Card, CardBody, CardHeader, CardPairs, DataGrid, EmptyState, FormField, Input, Select, Skeleton, Tag, toast } from '@aybarcorp/ui'
import type { GridColumn } from '@aybarcorp/ui'
import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { AvisoDeError, BadgeEstado, Supuesto, dinero, fecha, irA, useAccion } from '../comun.tsx'
import type { Lote } from '../datos/cliente360.ts'
import type { ResultadoDocumento } from '../datos/cliente360.ts'
import { hrefDe } from '../rutas.ts'
import { api, useConsola, useSesion } from '../servicio/api.ts'
import { ErrorSimulado } from '../servicio/nucleo.ts'
import { CONSULTAS_MOTOR, NOMBRE_SECCION, nombreFuente, textoDuracion } from '../servicio/ola7.ts'
import type { Llamada, RespuestaMotor, Seccion, Seccion360, TicketPrevio, Vista360 } from '../servicio/ola7.ts'

/**
 * Consulta 360 del cliente (HU-ATC-050): lotes, cuotas, correos, tickets, documentos y llamadas,
 * consultados en línea sin copiarlos. Cada sección falla o se restringe por su cuenta (CA-02 y
 * CA-03) y el resto sigue cargando.
 */

type Estado = { readonly fase: 'cargando' } | { readonly fase: 'listo'; readonly vista: Vista360 } | { readonly fase: 'error'; readonly error: unknown }

function Seccion({ titulo, seccion, estado, reintentar, children }: { titulo: string; seccion: Seccion; estado: Seccion360<unknown>; reintentar: () => void; children: ReactNode }) {
  return (
    <Card>
      <CardHeader
        as="h2"
        title={titulo}
        actions={estado.estado === 'restringido' ? <Badge tone="warning" size="sm">Restringido</Badge> : estado.estado === 'no-disponible' ? <Badge tone="danger" size="sm">No disponible</Badge> : undefined}
      />
      <CardBody padding="sm">
        {estado.estado === 'restringido' ? (
          <Alert tone="warning" size="sm" title="Sección restringida">
            <span className="pt-alerta__texto">Tu rol no ve «{NOMBRE_SECCION[seccion].toLowerCase()}» (RN-SVC-036). Pídelo a tu supervisor ATC si lo necesitas para atender.</span>
          </Alert>
        ) : estado.estado === 'no-disponible' ? (
          <Alert tone="danger" size="sm" title={`${nombreFuente(estado.fuente)} no disponible`} actions={<Button size="sm" variant="secondary" onClick={reintentar}>Reintentar</Button>}>
            <span className="pt-alerta__texto">No se pudo consultar. Último intento: {fecha(estado.intento)}. Las demás secciones siguen disponibles.</span>
          </Alert>
        ) : (
          children
        )}
      </CardBody>
    </Card>
  )
}

const dineroPen = (n: number) => dinero(n, 'PEN')

export function Consulta360({ clienteId, ticketId }: { clienteId: string; ticketId?: string }) {
  const { datos } = useConsola()
  const sesion = useSesion()
  const [estado, setEstado] = useState<Estado>({ fase: 'cargando' })
  const clave = `${datos.fuentesCaidas.join(',')}|${sesion.id}`
  const consultar = useCallback(() => {
    setEstado({ fase: 'cargando' })
    api.consultar360(clienteId).then(
      (vista) => setEstado({ fase: 'listo', vista }),
      (error: unknown) => setEstado({ fase: 'error', error }),
    )
  }, [clienteId])
  // Reconsulta cuando una fuente cae o vuelve.
  useEffect(consultar, [consultar, clave])

  if (estado.fase === 'cargando') {
    return (
      <div className="pt-pila" aria-busy="true" aria-label="Consultando al cliente">
        <Skeleton variant="block" height="8rem" />
        <Skeleton variant="block" height="8rem" />
      </div>
    )
  }
  if (estado.fase === 'error') return <AvisoDeError error={estado.error} reintentar={consultar} titulo="No se pudo consultar al cliente" />
  const v = estado.vista

  const colLotes: GridColumn<Lote>[] = [
    { key: 'lote', header: 'Lote', renderCell: (l) => l.descripcion },
    { key: 'contrato', header: 'Contrato', width: '8rem', renderCell: (l) => l.contrato },
    { key: 'firmado', header: 'Firmado', width: '9rem', renderCell: (l) => fecha(l.firmado) },
    { key: 'precio', header: 'Precio', width: '8rem', align: 'end', renderCell: (l) => dineroPen(l.precio) },
    { key: 'estado', header: 'Estado', width: '7rem', renderCell: (l) => <Badge tone="success" size="sm">{l.estado}</Badge> },
  ]
  const colTickets: GridColumn<TicketPrevio>[] = [
    { key: 'numero', header: 'Ticket', width: '9rem', renderCell: (t) => <button type="button" tabIndex={-1} className="pt-enlace-celda" onClick={() => irA(hrefDe(`ticket/${t.ticket.id}`))}>{t.ticket.numero}</button> },
    { key: 'resumen', header: 'Solicitud', renderCell: (t) => t.ticket.resumen },
    { key: 'estado', header: 'Estado', width: '8rem', renderCell: (t) => <BadgeEstado estado={t.ticket.estado} size="sm" /> },
    { key: 'inter', header: 'Interacciones', width: '8rem', align: 'end', renderCell: (t) => t.interacciones },
  ]
  const colLlamadas: GridColumn<Llamada>[] = [
    { key: 'fecha', header: 'Fecha', width: '9rem', renderCell: (l) => fecha(l.inicio) },
    { key: 'sentido', header: 'Sentido', width: '8rem', renderCell: (l) => (l.sentido === 'ENTRANTE' ? 'Entrante' : 'Saliente') },
    { key: 'dur', header: 'Duración', width: '8rem', renderCell: (l) => (l.duracionS ? textoDuracion(l.duracionS) : 'Iniciada') },
    { key: 'rec', header: 'Grabación', renderCell: (l) => <Tag size="sm" variant="outline">{l.grabacion}</Tag> },
  ]

  return (
    <div className="pt-pila">
      {ticketId ? <ConsultasRapidas ticketId={ticketId} lotes={v.lotes.estado === 'ok' ? v.lotes.datos : null} /> : null}
      <div className="pt-pila">
        <Seccion titulo={NOMBRE_SECCION.lotes} seccion="lotes" estado={v.lotes} reintentar={consultar}>
          {v.lotes.estado === 'ok' ? <DataGrid<Lote> caption="Lotes del cliente" columns={colLotes} rows={v.lotes.datos} getRowId={(l) => l.id} /> : null}
        </Seccion>
        <Seccion titulo={NOMBRE_SECCION.cuotas} seccion="cuotas" estado={v.cuotas} reintentar={consultar}>
          {v.cuotas.estado === 'ok' ? (
            <div className="pt-pila">
              {v.cuotas.datos.map((c) => (
                <CardPairs
                  key={c.loteId}
                  pairs={[
                    ['Lote', v.lotes.estado === 'ok' ? (v.lotes.datos.find((l) => l.id === c.loteId)?.descripcion ?? c.loteId) : c.loteId],
                    ['Cuotas pagadas', `${c.pagadas} de ${c.cuotas.length}`],
                    ['Saldo', dineroPen(c.saldo)],
                    ['Próxima cuota', c.proxima ? `n.º ${c.proxima.n} · ${dineroPen(c.proxima.monto)} · ${fecha(c.proxima.vence)}` : '—'],
                    ['Mora', c.diasMora ? <Badge key="m" tone="danger" size="sm">{c.diasMora} días</Badge> : <Badge key="m" tone="success" size="sm">Al día</Badge>],
                  ]}
                />
              ))}
            </div>
          ) : null}
        </Seccion>
        <Seccion titulo={NOMBRE_SECCION.correos} seccion="correos" estado={v.correos} reintentar={consultar}>
          {v.correos.estado === 'ok' ? (
            <ul className="pt-lista-simple">
              {v.correos.datos.map((c) => (
                <li key={c.id}>
                  <strong>{c.sentido}</strong> · {fecha(c.fecha)} · {c.asunto}
                </li>
              ))}
            </ul>
          ) : null}
        </Seccion>
        <Seccion titulo={NOMBRE_SECCION.tickets} seccion="tickets" estado={v.tickets} reintentar={consultar}>
          {v.tickets.estado === 'ok' ? <DataGrid<TicketPrevio> caption="Tickets del cliente" columns={colTickets} rows={v.tickets.datos} getRowId={(t) => t.ticket.id} emptyState={<EmptyState size="compact" title="Sin tickets" description="Este cliente aún no tiene tickets." />} /> : null}
        </Seccion>
        <Seccion titulo={NOMBRE_SECCION.documentos} seccion="documentos" estado={v.documentos} reintentar={consultar}>
          {v.documentos.estado === 'ok' ? (
            <div className="pt-pila">
              <ul className="pt-lista-simple">
                {v.documentos.datos.map((d) => (
                  <li key={d.id}>
                    <strong>{d.titulo}</strong> · {d.tipo} · {fecha(d.fecha)}
                  </li>
                ))}
              </ul>
              <BuscarDocumentos clienteId={clienteId} />
            </div>
          ) : null}
        </Seccion>
        <Seccion titulo={NOMBRE_SECCION.llamadas} seccion="llamadas" estado={v.llamadas} reintentar={consultar}>
          {v.llamadas.estado === 'ok' ? <DataGrid<Llamada> caption="Llamadas del cliente" columns={colLlamadas} rows={v.llamadas.datos} getRowId={(l) => l.id} emptyState={<EmptyState size="compact" title="Sin llamadas" description="Las llamadas se registran al atenderlas o al llamar desde la ficha." />} /> : null}
        </Seccion>
      </div>
      <Supuesto>Consulta en línea: ningún dato del cliente se copia al sistema (RN-SVC-026). Los datos de las fuentes son ficticios; qué ve cada rol (RN-SVC-036) está por validar.</Supuesto>
    </div>
  )
}

/** HU-ATC-053: búsqueda en lenguaje natural dentro de los documentos que el rol puede ver. */
function BuscarDocumentos({ clienteId }: { clienteId: string }) {
  const [consulta, setConsulta] = useState('')
  const [salida, setSalida] = useState<{ resultados: ResultadoDocumento[]; sugerencias: string[] } | null>(null)
  const buscar = useAccion()
  return (
    <div className="pt-pila">
      <form
        className="pt-pila"
        onSubmit={async (e) => {
          e.preventDefault()
          const r = await buscar.ejecutar(() => api.buscarDocumentos(clienteId, consulta))
          if (r) setSalida(r)
        }}
      >
        <FormField label="Buscar en los documentos por significado" helper="Escribe con tus palabras, por ejemplo «adenda de cambio de lote».">
          <Input value={consulta} onChange={(e) => setConsulta(e.target.value)} />
        </FormField>
        <div className="pt-acciones pt-acciones--inicio">
          <Button type="submit" size="sm" variant="secondary" loading={buscar.enCurso}>Buscar documentos</Button>
        </div>
      </form>
      {buscar.error ? <AvisoDeError error={buscar.error} /> : null}
      {salida ? (
        salida.resultados.length ? (
          <ol className="pt-lista-simple" aria-label="Documentos encontrados">
            {salida.resultados.map((r) => (
              <li key={r.documento.id}>
                <strong>{r.documento.titulo}</strong> <Tag size="sm" variant="outline">Relevancia {r.relevancia} %</Tag>
                <p className="pt-texto-chico">«{r.fragmento}»</p>
              </li>
            ))}
          </ol>
        ) : (
          <Alert tone="info" size="sm" title="Sin coincidencias relevantes">
            <span className="pt-alerta__texto">Prueba con palabras exactas del documento: {salida.sugerencias.join(', ') || 'contrato, cronograma, constancia'}.</span>
          </Alert>
        )
      ) : null}
      <Supuesto>Índice simulado por sinónimos; el modelo de red neuronal y los repositorios que se indexan (DEP-14) están por definir.</Supuesto>
    </div>
  )
}

/** HU-ATC-052: consultas específicas al motor ya construido, vía API y sin bloquear la atención. */
function ConsultasRapidas({ ticketId, lotes }: { ticketId: string; lotes: Lote[] | null }) {
  const [consulta, setConsulta] = useState<string>(CONSULTAS_MOTOR[0].id)
  const [lote, setLote] = useState('')
  const [respuesta, setRespuesta] = useState<RespuestaMotor | null>(null)
  const ejecutar = useAccion()
  const elegido = lote || lotes?.[0]?.id || ''
  const denegada = ejecutar.error instanceof ErrorSimulado && ejecutar.error.status === 403
  const consultarMotor = async () => {
    setRespuesta(null)
    const r = await ejecutar.ejecutar(() => api.consultarMotor(ticketId, consulta, elegido))
    if (r) {
      setRespuesta(r)
      toast({ message: 'Respuesta del motor recibida.', tone: 'success' })
    }
  }
  return (
    <Card>
      <CardHeader as="h2" title="Consultas rápidas" subtitle="Respuestas del motor de consultas ya construido, por API." />
      <CardBody padding="sm">
        <form
          className="pt-pila"
          onSubmit={(e) => {
            e.preventDefault()
            void consultarMotor()
          }}
        >
          <div className="pt-rejilla-campos">
            <FormField label="Consulta">
              <Select value={consulta} onChange={(e) => setConsulta(e.target.value)} options={CONSULTAS_MOTOR.map((c) => ({ value: c.id, label: c.nombre }))} />
            </FormField>
            <FormField label="Lote">
              <Select value={elegido} onChange={(e) => setLote(e.target.value)} options={(lotes ?? []).map((l) => ({ value: l.id, label: l.descripcion }))} placeholder={lotes ? undefined : 'Sin lotes disponibles'} />
            </FormField>
          </div>
          <div className="pt-acciones pt-acciones--inicio">
            <Button type="submit" size="sm" variant="secondary" loading={ejecutar.enCurso} disabled={!elegido}>Consultar al motor</Button>
          </div>
        </form>
        {ejecutar.error ? (
          denegada ? (
            <Alert tone="warning" size="sm" title="El motor no devolvió el dato">
              <span className="pt-alerta__texto">{(ejecutar.error as ErrorSimulado).message}</span>
            </Alert>
          ) : (
            <AvisoDeError error={ejecutar.error} titulo="El motor no está disponible" reintentar={() => void consultarMotor()} />
          )
        ) : null}
        {ejecutar.error && !denegada ? <p className="pt-texto-chico">La atención no se bloquea: sigue con el resto del ticket y vuelve a consultar más tarde.</p> : null}
        {respuesta ? (
          <Alert tone="success" size="sm" title={respuesta.consulta}>
            <span className="pt-alerta__texto">{respuesta.texto}</span>
            <span className="pt-alerta__codigo">Origen: motor de consultas (API) · {fecha(respuesta.fecha)}</span>
          </Alert>
        ) : null}
        <Supuesto>El motor y su SLA los mantiene otro equipo (DEP-13); aquí responde con datos ficticios. Solo se registra que se consultó, no el valor.</Supuesto>
      </CardBody>
    </Card>
  )
}
