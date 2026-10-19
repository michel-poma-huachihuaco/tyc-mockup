import { Alert, Badge, Breadcrumb, Button, Card, CardBody, CardHeader, CardPairs, DataGrid, Dialog, EmptyState, ErrorPage, Form, FormField, Header, StatGroup, Textarea, toast } from '@aybarcorp/ui'
import type { GridColumn } from '@aybarcorp/ui'
import { useState } from 'react'
import { AvisoDeError, Prohibido, Supuesto, dinero, erroresDeCampos, fecha, irA, useAccion, useCarga } from '../comun.tsx'
import { nombrePersona } from '../datos/catalogos.ts'
import { cliente, dniEnmascarado } from '../datos/clientes.ts'
import { hrefDe } from '../rutas.ts'
import { api, useConsola, useSesion } from '../servicio/api.ts'
import { NOMBRE_ESTADO_RESOLUCION, NOMBRE_RESULTADO, PLAZO_ACCION_DIAS, cartaDe, puedeGestionarMora, puedeVerMora } from '../servicio/ola8.ts'
import type { CasoResolucion, Constancia, EstadoResolucion } from '../servicio/ola8.ts'

const TONO: Record<EstadoResolucion, 'danger' | 'warning' | 'success'> = { ABIERTO: 'danger', SUSPENDIDO: 'warning', REGULARIZADO: 'success' }
const dineroPen = (n: number) => dinero(n, 'PEN')

function SinAcceso() {
  return (
    <div className="pt-pagina">
      <Header title="Resolución por morosidad" />
      <Prohibido requiere="de Cobranza, Legal, atención o Coordinador CX" recurso="ver los casos de resolución" />
    </div>
  )
}

/** Casos de resolución de contrato por 3 cuotas impagas (HU-ATC-056) y los avisos que recibe cada persona (HU-ATC-058 y 059). */
export default function Morosidad() {
  const sesion = useSesion()
  const { datos } = useConsola()
  const [carga, reintentar] = useCarga('morosidad')
  if (!puedeVerMora(sesion)) return <SinAcceso />
  const casos = [...datos.casosResolucion].reverse()
  const cargando = carga.fase === 'cargando'
  const sinAccion = datos.cartas.filter((c) => !c.accion && datos.casosResolucion.find((x) => x.id === c.casoId)?.estado === 'ABIERTO').length
  const mias = datos.notificaciones.filter((n) => n.para === sesion.id).reverse()
  const columnas: GridColumn<CasoResolucion>[] = [
    { key: 'ticket', header: 'Ticket', width: '9rem', renderCell: (c) => <button type="button" tabIndex={-1} className="pt-enlace-celda" onClick={() => irA(hrefDe(`morosidad/${c.id}`))}>{datos.tickets.find((t) => t.id === c.ticketId)?.numero ?? c.ticketId}</button> },
    { key: 'cliente', header: 'Cliente', renderCell: (c) => `${cliente(c.clienteId)?.nombre ?? '—'} · ${c.proyecto}` },
    { key: 'deuda', header: 'Deuda', width: '11rem', align: 'end', renderCell: (c) => `${dineroPen(c.deuda)} · ${c.cuotasImpagas} cuotas` },
    { key: 'estado', header: 'Estado', width: '13rem', renderCell: (c) => <Badge tone={TONO[c.estado]} size="sm" dot>{NOMBRE_ESTADO_RESOLUCION[c.estado]}</Badge> },
    {
      key: 'carta',
      header: 'Carta al responsable',
      width: '14rem',
      renderCell: (c) => {
        const carta = cartaDe(datos, c.id)
        return !carta ? '—' : carta.escalada ? <Badge tone="danger" size="sm">Escalada</Badge> : carta.accion ? <Badge tone="success" size="sm">Con acción</Badge> : <Badge tone="warning" size="sm">Sin acción · vence {fecha(carta.vence)}</Badge>
      },
    },
  ]
  return (
    <div className="pt-pagina pt-pagina--ancha">
      <Header
        title="Resolución por morosidad"
        breadcrumb={<Breadcrumb items={[{ label: 'Bandeja', href: hrefDe('bandeja') }, { label: 'Resolución por morosidad' }]} />}
        description="Casos que abre la evaluación diaria con 3 cuotas vencidas e impagas, con su alerta al cliente y su carta al responsable del proyecto."
      />
      {carga.fase === 'error' ? (
        <AvisoDeError error={carga.error} reintentar={reintentar} titulo="No se pudieron cargar los casos" />
      ) : (
        <div className="pt-pila">
          <StatGroup
            loading={cargando}
            items={[
              { id: 'ab', label: 'En resolución', value: String(datos.casosResolucion.filter((c) => c.estado === 'ABIERTO').length) },
              { id: 'su', label: 'Suspendidos por reclamo', value: String(datos.casosResolucion.filter((c) => c.estado === 'SUSPENDIDO').length) },
              { id: 're', label: 'Regularizados', value: String(datos.casosResolucion.filter((c) => c.estado === 'REGULARIZADO').length) },
              { id: 'ca', label: 'Cartas sin acción', value: String(sinAccion) },
            ]}
          />
          {mias.length ? (
            <Card>
              <CardHeader as="h2" title="Avisos para ti" subtitle="Cartas de alerta, ingresos al proyecto y escalamientos." />
              <CardBody padding="sm">
                <ul className="pt-lista-simple">
                  {mias.slice(0, 6).map((n) => (
                    <li key={n.id}>
                      {fecha(n.fecha)} · {n.mensaje}{' '}
                      {n.ticketId ? <button type="button" className="pt-enlace-celda" onClick={() => irA(hrefDe(`ticket/${n.ticketId}`))}>Ver ticket</button> : null}
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          ) : null}
          <Card>
            <CardHeader as="h2" title="Casos de resolución" />
            <CardBody>
              <div className="pt-pila">
                <DataGrid<CasoResolucion>
                  caption="Casos de resolución de contrato"
                  columns={columnas}
                  rows={cargando ? [] : casos}
                  getRowId={(c) => c.id}
                  loading={cargando}
                  emptyState={<EmptyState size="compact" title="Aún no hay casos" description="La evaluación diaria abre uno cuando un contrato acumula 3 cuotas vencidas e impagas." />}
                />
                <Supuesto>La evaluación corre cada día contra los datos de Cobranza (en Simulación › «Evaluar la morosidad»). Con un reclamo abierto en el Libro el caso queda suspendido hasta responderlo; la causal exacta se valida con Legal (RN-SVC-037).</Supuesto>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  )
}

/** Detalle de un caso: constancias de la alerta, carta, historial y acciones. */
export function CasoMora({ casoId }: { casoId: string }) {
  const sesion = useSesion()
  const { datos } = useConsola()
  const [carga, reintentar] = useCarga(`mora-${casoId}`)
  const [dialogo, setDialogo] = useState<'accion' | 'pago' | null>(null)
  const [nota, setNota] = useState('')
  const guardar = useAccion()
  if (!puedeVerMora(sesion)) return <SinAcceso />
  const caso = datos.casosResolucion.find((c) => c.id === casoId)
  if (carga.fase === 'error') return <div className="pt-pagina"><AvisoDeError error={carga.error} reintentar={reintentar} titulo="No se pudo cargar el caso" /></div>
  if (carga.fase === 'listo' && !caso) {
    return (
      <div className="pt-pagina">
        <ErrorPage status={404} scope="page" title="Ese caso no existe" description="El enlace puede ser de otra sesión del prototipo." actions={<Button variant="primary" onClick={() => irA(hrefDe('morosidad'))}>Volver a los casos</Button>} />
      </div>
    )
  }
  if (!caso) return <div className="pt-pagina" aria-busy="true"><Header title="Caso de resolución" loading /></div>
  const ticket = datos.tickets.find((t) => t.id === caso.ticketId)
  const c = cliente(caso.clienteId)
  const carta = cartaDe(datos, caso.id)
  const constancias = datos.constancias.filter((x) => x.casoId === caso.id)
  const historial = datos.filasResolucion.filter((f) => f.casoId === caso.id)
  const errores = erroresDeCampos(guardar.error)
  const activo = caso.estado !== 'REGULARIZADO'
  const puedeAccion = Boolean(carta && !carta.accion && activo && (carta.para === sesion.id || carta.cc === sesion.id || puedeGestionarMora(sesion)))
  const columnas: GridColumn<Constancia>[] = [
    { key: 'fecha', header: 'Fecha y hora', width: '10rem', renderCell: (x) => fecha(x.fecha) },
    { key: 'canal', header: 'Canal', width: '9rem', renderCell: (x) => x.canal },
    { key: 'dest', header: 'Destinatario', renderCell: (x) => `${c?.nombre ?? '—'}${x.reintento ? ' · reintento' : ''}` },
    { key: 'res', header: 'Entrega', width: '10rem', renderCell: (x) => <Badge tone={x.resultado === 'ENTREGADO' ? 'success' : 'danger'} size="sm">{NOMBRE_RESULTADO[x.resultado]}</Badge> },
  ]
  const confirmar = async (que: 'accion' | 'pago') => {
    const ok = await guardar.ejecutar(async () => {
      if (que === 'pago') await api.registrarPago(caso.id)
      else await api.registrarAccion(caso.id, nota)
      return true
    })
    if (ok) {
      setDialogo(null)
      setNota('')
      toast({ message: que === 'pago' ? 'Caso regularizado: el ticket se cerró y el proceso se detuvo.' : 'Acción registrada.', tone: 'success' })
    }
  }
  return (
    <div className="pt-pagina pt-pagina--ancha">
      <Header
        title={`Resolución · ${c?.nombre ?? '—'}`}
        breadcrumb={<Breadcrumb items={[{ label: 'Resolución por morosidad', href: hrefDe('morosidad') }, { label: ticket?.numero ?? 'Caso' }]} />}
        meta={<Badge tone={TONO[caso.estado]} dot>{NOMBRE_ESTADO_RESOLUCION[caso.estado]}</Badge>}
        actions={
          <>
            {puedeAccion ? <Button variant="secondary" onClick={() => { guardar.limpiar(); setDialogo('accion') }}>Registrar mi acción</Button> : null}
            {activo && puedeGestionarMora(sesion) ? <Button variant="primary" onClick={() => { guardar.limpiar(); setDialogo('pago') }}>Registrar pago de la deuda</Button> : null}
          </>
        }
      />
      {caso.estado === 'SUSPENDIDO' ? (
        <Alert tone="warning" size="sm" title="Suspendido por reclamo">
          <span className="pt-alerta__texto">El cliente tiene un reclamo abierto en el Libro: no se envían alertas ni cartas hasta responderlo. Es una propuesta del PO, a validar con Legal.</span>
        </Alert>
      ) : null}
      {carta?.sinResponsable ? (
        <Alert tone="warning" size="sm" title="Proyecto sin responsable registrado">
          <span className="pt-alerta__texto">La carta se envió al supervisor del área comercial y se avisó al administrador funcional para completar el maestro.</span>
        </Alert>
      ) : null}
      {carta?.escalada ? (
        <Alert tone="danger" size="sm" title="Escalado">
          <span className="pt-alerta__texto">Sin acción en {PLAZO_ACCION_DIAS} días hábiles: se escaló el {fecha(carta.escalada)} al supervisor según la matriz.</span>
        </Alert>
      ) : null}
      <div className="pt-dos-columnas">
        <div className="pt-pila">
          <Card>
            <CardHeader as="h2" title="Alerta de cancelación al cliente" subtitle="Se envía al abrir el caso, por correo, WhatsApp y Mi Portal, sin esperar el flujo." />
            <CardBody>
              <DataGrid<Constancia> caption="Constancias de envío de la alerta" columns={columnas} rows={constancias} getRowId={(x) => x.id} emptyState={<EmptyState size="compact" title="Sin envíos" description={caso.estado === 'SUSPENDIDO' ? 'La alerta se enviará cuando se responda el reclamo.' : 'Aún no se envió la alerta.'} />} />
            </CardBody>
          </Card>
          <Card>
            <CardHeader as="h2" title="Historial del caso" />
            <CardBody padding="sm">
              <ol className="pt-lista-simple">
                {historial.map((f) => (
                  <li key={f.id}>
                    {fecha(f.fecha)} · <strong>{f.a === 'ESCALADO' ? 'Escalado' : NOMBRE_ESTADO_RESOLUCION[f.a]}</strong> · {f.nota} {f.autor ? `(${nombrePersona(f.autor)})` : '(sistema)'}
                  </li>
                ))}
              </ol>
            </CardBody>
          </Card>
        </div>
        <aside className="pt-lateral" aria-label="Datos y carta del caso">
          <Card>
            <CardHeader as="h2" title="Caso" />
            <CardBody padding="sm">
              <CardPairs
                pairs={[
                  ['Ticket', ticket ? <button key="t" type="button" className="pt-enlace-celda" onClick={() => irA(hrefDe(`ticket/${ticket.id}`))}>{ticket.numero}</button> : '—'],
                  ['Cliente', c ? `${c.nombre} · DNI ${dniEnmascarado(c.dni)}` : '—'],
                  ['Lote', cliente(caso.clienteId) ? caso.loteId.replace(/^cli-\d+-/, 'Lote ') + ` · ${caso.proyecto}` : caso.proyecto],
                  ['Cuotas impagas', String(caso.cuotasImpagas)],
                  ['Deuda vencida', dineroPen(caso.deuda)],
                  ['Abierto', fecha(caso.abierto)],
                  ['Resolución prevista', fecha(caso.prevista)],
                ]}
              />
            </CardBody>
          </Card>
          {carta ? (
            <Card>
              <CardHeader as="h2" title="Carta de alerta" />
              <CardBody padding="sm">
                <div className="pt-pila pt-pila--chica">
                  <CardPairs pairs={[['Para', nombrePersona(carta.para)], ['Con copia', carta.cc ? nombrePersona(carta.cc) : 'Sin supervisor'], ['Enviada', fecha(carta.fecha)], ['Plazo de acción', fecha(carta.vence)], ['Acción', carta.accion ? `${carta.accion.nota} (${nombrePersona(carta.accion.autor)})` : 'Pendiente']]} />
                  <p className="pt-texto-chico">{carta.texto}</p>
                </div>
              </CardBody>
            </Card>
          ) : null}
          <Supuesto>Plazo de {PLAZO_ACCION_DIAS} días hábiles para la acción del responsable y escalamiento al supervisor ATC; resolución prevista a 30 días de la apertura. Valores por validar.</Supuesto>
        </aside>
      </div>
      <Dialog
        open={dialogo === 'accion'}
        onOpenChange={(a) => !a && setDialogo(null)}
        title="Registrar mi acción"
        description="Qué hiciste con este caso. No escribas DNI ni datos de tarjeta."
        footer={<><Button variant="ghost" onClick={() => setDialogo(null)}>Cancelar</Button><Button variant="primary" loading={guardar.enCurso} onClick={() => void confirmar('accion')}>Registrar acción</Button></>}
      >
        <Form id="mora-accion" onSubmit={() => void confirmar('accion')} errors={{}}>
          <FormField label="Acción realizada" error={errores.nota} required>
            <Textarea rows={3} value={nota} onChange={(e) => setNota(e.target.value)} maxLength={400} />
          </FormField>
        </Form>
        {guardar.error && !errores.nota ? <AvisoDeError error={guardar.error} /> : null}
      </Dialog>
      <Dialog
        open={dialogo === 'pago'}
        onOpenChange={(a) => !a && setDialogo(null)}
        title="Registrar el pago de la deuda"
        description="El caso queda «Regularizado», el ticket se cierra y se detienen las alertas y los escalamientos."
        footer={<><Button variant="ghost" onClick={() => setDialogo(null)}>Cancelar</Button><Button variant="primary" loading={guardar.enCurso} onClick={() => void confirmar('pago')}>Confirmar el pago</Button></>}
      >
        {guardar.error ? <AvisoDeError error={guardar.error} /> : <p className="pt-texto">Deuda vencida: <strong>{dineroPen(caso.deuda)}</strong> en {caso.cuotasImpagas} cuotas.</p>}
      </Dialog>
    </div>
  )
}
