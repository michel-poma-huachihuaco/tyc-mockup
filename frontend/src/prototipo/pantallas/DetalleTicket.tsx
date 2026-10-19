import {
  Alert,
  Badge,
  Breadcrumb,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardPairs,
  DataGrid,
  Dialog,
  Drawer,
  EmptyState,
  ErrorPage,
  FileItem,
  FileUpload,
  Form,
  FormField,
  FormGroup,
  Header,
  Icon,
  NumberInput,
  ProgressBar,
  Radio,
  SegmentedControl,
  Select,
  SidePanel,
  Skeleton,
  Stepper,
  Tabs,
  Tag,
  Textarea,
  Timeline,
  toast,
} from '@aybarcorp/ui'
import type { GridColumn, UploadFile } from '@aybarcorp/ui'
import { useEffect, useId, useState } from 'react'
import { AREAS, CANALES, ESTABLECIMIENTOS_LIBRO, ESTADOS, LIBRO_VIRTUAL, MOTIVOS, NOMBRE_AREA, NOMBRE_ESTADO, PERSONAS, empresa, nombreMotivo, nombrePersona, nombreTipo } from '../datos/catalogos.ts'
import type { Area, Canal, Estado } from '../datos/catalogos.ts'
import { cliente, dniEnmascarado } from '../datos/clientes.ts'
import {
  AvisoDeError,
  Prohibido,
  BadgeE2E,
  BadgeEstado,
  BadgePrioridad,
  BadgePlazo,
  BadgeSla,
  Supuesto,
  erroresDeCampos,
  fecha,
  fechaLarga,
  horas,
  restante,
  useAccion,
  useCarga,
} from '../comun.tsx'
import { hrefDe } from '../rutas.ts'
import { api, useConsola, useSesion } from '../servicio/api.ts'
import { cierreE2E, elegirPolitica, estadoSla, motivoGateConflicto, motivoTransicionInvalida, puede, venceResolucionVigente } from '../servicio/nucleo.ts'
import type { Adjunto, Datos, FilaAsignacion, FilaEstado, Interaccion, Ticket } from '../servicio/nucleo.ts'
import { sumarHorasHabiles } from '../servicio/calendario.ts'
import { asientoDeTicket, estadoPlazo, exigeAsiento } from '../servicio/libro.ts'
import { senalesActivas } from '../servicio/conflicto.ts'
import { CONTRATOS, contratoDe, vinculoDe } from '../servicio/ola5.ts'
import { TarjetaAsistente, TarjetaGuia, TarjetaRayo } from './AsistenciaTicket.tsx'
import { PestanaCliente, TarjetaExposicion, TarjetaLegal } from './IntegracionTicket.tsx'
import { INTERESADO_ID } from '../datos/clientes.ts'
import { puedeVerClientes } from '../servicio/ola7.ts'
import { AvisosConflicto, CajonHandoff, TarjetaConflicto } from './ConflictoTicket.tsx'
import type { Moneda, TipoAsiento } from '../servicio/libro.ts'

/** SUPUESTO (pregunta abierta de FT-ATC-02): tipos y tamaño de la evidencia. */
const ACEPTA = 'image/jpeg,image/png,application/pdf,video/mp4'
const MAX_BYTES = 10 * 1024 * 1024

const PASOS = [
  { id: 'abierto', label: 'Abierto' },
  { id: 'atencion', label: 'En atención' },
  { id: 'resuelto', label: 'Resuelto' },
  { id: 'cerrado', label: 'Cerrado' },
]

const pasoDe = (e: Estado) => (e === 'OPEN' ? 0 : e === 'RESOLVED' ? 2 : e === 'CLOSED' ? 3 : 1)

/**
 * Detalle del ticket — HU-ATC-004 (estado con historial inmutable), 005 (interacciones y
 * evidencia), 006 (hitos), 007 (derivar), 010 (alertas del ticket), 011 (reabrir) y 029
 * (cierre end-to-end). La vista «Mi Portal» muestra lo que ve el cliente: sin notas internas.
 */
export default function DetalleTicket({ ticketId }: { ticketId: string }) {
  const { datos } = useConsola()
  const sesion = useSesion()
  const [carga, reintentar] = useCarga(`ticket-${ticketId}`)
  const [pestana, setPestana] = useState('interacciones')
  const [dialogo, setDialogo] = useState<'estado' | 'derivar' | 'portal' | 'asiento' | 'eje3' | null>(null)
  const ticket = datos.tickets.find((t) => t.id === ticketId)

  if (!puede.atender(sesion.rol) && sesion.rol !== 'COORDINADOR_CX') {
    return (
      <div className="pt-pagina">
        <Prohibido requiere="de atención al cliente o Coordinador CX" recurso="ver tickets" volver={false} />
      </div>
    )
  }

  if (carga.fase === 'cargando') {
    return (
      <div className="pt-pagina pt-pagina--ancha" aria-busy="true">
        <Header title="Ticket" loading />
        <div className="pt-dos-columnas">
          <Skeleton variant="block" height="24rem" />
          <Skeleton variant="block" height="16rem" />
        </div>
      </div>
    )
  }
  if (carga.fase === 'error') {
    return (
      <div className="pt-pagina">
        <Header title="Ticket" breadcrumb={<Breadcrumb items={[{ label: 'Bandeja', href: hrefDe('bandeja') }, { label: 'Ticket' }]} />} />
        <AvisoDeError error={carga.error} reintentar={reintentar} titulo="No se pudo cargar el ticket" />
      </div>
    )
  }
  if (!ticket) {
    return (
      <div className="pt-pagina">
        <ErrorPage
          status={404}
          scope="page"
          title="Ese ticket no existe"
          description="Puede que el enlace sea de otra sesión del prototipo (los datos se reinician al recargar)."
          actions={
            <Button variant="primary" onClick={() => (location.hash = hrefDe('bandeja'))}>
              Volver a la bandeja
            </Button>
          }
        />
      </div>
    )
  }

  const sla = estadoSla(ticket, datos.ahora)
  const atiende = puede.atender(sesion.rol)
  const interacciones = datos.interacciones.filter((i) => i.ticketId === ticket.id)
  const filasEstado = datos.filasEstado.filter((f) => f.ticketId === ticket.id)
  const filasAsignacion = datos.filasAsignacion.filter((f) => f.ticketId === ticket.id)
  const alertas = datos.alertas.filter((a) => a.ticketId === ticket.id)
  const conflictoAbierto = ticket.eje !== 3 && senalesActivas(datos, ticket.id).length > 0
  const subestado = ticket.estado === 'PENDING_CUSTOMER' || ticket.estado === 'ESCALATED' || ticket.estado === 'REOPENED' ? NOMBRE_ESTADO[ticket.estado] : undefined

  return (
    <div className="pt-pagina pt-pagina--ancha">
      <Header
        title={`${ticket.numero} · ${ticket.resumen}`}
        breadcrumb={<Breadcrumb items={[{ label: 'Bandeja', href: hrefDe('bandeja') }, { label: ticket.numero }]} />}
        meta={
          <span className="pt-en-linea">
            <BadgeEstado estado={ticket.estado} />
            <BadgePrioridad prioridad={ticket.prioridad} />
            <BadgeSla sla={sla} />
            {ticket.reaperturas ? <Badge tone="warning">Reabierto {ticket.reaperturas} {ticket.reaperturas === 1 ? 'vez' : 'veces'}</Badge> : null}
          </span>
        }
        description={`${empresa(ticket.empresaId)?.nombre} · ${nombreTipo(ticket.tipo)} · ${NOMBRE_AREA[ticket.area]} · ${ticket.responsable ? nombrePersona(ticket.responsable) : 'Sin asignar'}`}
        actions={
          <>
            {atiende ? (
              <>
                {conflictoAbierto ? (
                  <Button variant="secondary" onClick={() => setDialogo('eje3')}>
                    Derivar a Eje 3
                  </Button>
                ) : (
                  <Button variant="secondary" onClick={() => setDialogo('derivar')} disabled={ticket.estado === 'CLOSED'}>
                    Derivar
                  </Button>
                )}
                <Button variant="primary" onClick={() => setDialogo('estado')}>
                  Cambiar estado
                </Button>
              </>
            ) : null}
          </>
        }
      />
      <AvisosConflicto ticket={ticket} datos={datos} atiende={atiende} onDerivarEje3={() => setDialogo('eje3')} />
      {!atiende ? (
        <Alert tone="info" size="sm" title="Solo lectura">
          <span className="pt-alerta__texto">Tu rol consulta el ticket; no lo atiende.</span>
        </Alert>
      ) : null}
      {ticket.clienteId === INTERESADO_ID ? (
        <Alert tone="warning" size="sm" title="Cliente pendiente de vincular" actions={<Button size="sm" variant="secondary" onClick={() => setPestana('cliente')}>Ver al interesado</Button>}>
          <span className="pt-alerta__texto">Este ticket se registró con datos mínimos: aún no está ligado al cliente del maestro.</span>
        </Alert>
      ) : null}
      {ticket.estado === 'CLOSED' && atiende ? (
        <Alert tone="info" size="sm" title="Ticket cerrado">
          <span className="pt-alerta__texto">Para registrar algo nuevo o derivarlo, primero reábrelo desde «Cambiar estado».</span>
        </Alert>
      ) : null}

      <Card>
        <CardBody padding="sm">
          <Stepper
            label="Ciclo de vida del ticket"
            steps={PASOS.map((p, i) => (i === 1 && subestado ? { ...p, description: subestado } : p))}
            current={pasoDe(ticket.estado)}
          />
        </CardBody>
      </Card>

      <div className="pt-dos-columnas">
        <div className="pt-pila">
          <Tabs
            value={pestana}
            onValueChange={setPestana}
            items={[
              { value: 'interacciones', label: 'Interacciones', count: interacciones.length },
              { value: 'estados', label: 'Historial de estados', count: filasEstado.length },
              { value: 'derivaciones', label: 'Derivaciones', count: filasAsignacion.length },
              { value: 'alertas', label: 'Alertas SLA', count: alertas.length },
              ...(puedeVerClientes(sesion) ? [{ value: 'cliente', label: 'Cliente' }] : []),
            ]}
          >
            {pestana === 'interacciones' ? (
              <div className="pt-pila">
                {atiende && ticket.estado !== 'CLOSED' ? <Compositor ticket={ticket} /> : null}
                <ListaInteracciones interacciones={interacciones} onVerComoCliente={() => setDialogo('portal')} />
              </div>
            ) : pestana === 'estados' ? (
              <HistorialEstados filas={filasEstado} />
            ) : pestana === 'derivaciones' ? (
              <Derivaciones filas={filasAsignacion} />
            ) : pestana === 'cliente' ? (
              <PestanaCliente ticket={ticket} datos={datos} />
            ) : (
              <AlertasDelTicket datos={datos} ticket={ticket} />
            )}
          </Tabs>
        </div>
        <aside className="pt-lateral" aria-label="Datos, compromisos y cierre">
          <TarjetaRayo ticket={ticket} datos={datos} sesion={sesion} />
          <TarjetaExposicion ticket={ticket} datos={datos} />
          <TarjetaLegal ticket={ticket} datos={datos} />
          {atiende ? <TarjetaGuia ticket={ticket} datos={datos} /> : null}
          {atiende ? <TarjetaAsistente ticket={ticket} datos={datos} /> : null}
          <TarjetaLibro ticket={ticket} datos={datos} puedeRegistrar={puede.registrarAsiento(sesion.rol)} onRegistrar={() => setDialogo('asiento')} />
          <TarjetaCiudad ticket={ticket} datos={datos} puede={atiende} />
          <TarjetaConflicto ticket={ticket} datos={datos} rol={sesion.rol} onDerivarEje3={() => setDialogo('eje3')} />
          <DatosDelTicket ticket={ticket} />
          <Compromisos ticket={ticket} datos={datos} />
          <TarjetaE2E ticket={ticket} ahora={datos.ahora} />
        </aside>
      </div>

      <DialogoEstado ticket={ticket} datos={datos} abierto={dialogo === 'estado'} onCerrar={() => setDialogo(null)} />
      <CajonDerivar ticket={ticket} abierto={dialogo === 'derivar'} onCerrar={() => setDialogo(null)} />
      <VistaMiPortal ticket={ticket} interacciones={interacciones} abierto={dialogo === 'portal'} onCerrar={() => setDialogo(null)} />
      <CajonAsiento ticket={ticket} abierto={dialogo === 'asiento'} onCerrar={() => setDialogo(null)} />
      <CajonHandoff ticket={ticket} datos={datos} abierto={dialogo === 'eje3'} onCerrar={() => setDialogo(null)} />
    </div>
  )
}

// ── Interacciones (HU-ATC-005) ──────────────────────────────────────────────

function Compositor({ ticket }: { ticket: Ticket }) {
  const id = useId()
  const [tipo, setTipo] = useState<'mensaje' | 'nota'>('mensaje')
  const [canal, setCanal] = useState<Canal>(ticket.canal)
  const [texto, setTexto] = useState('')
  const [archivos, setArchivos] = useState<Array<UploadFile & { tipo: string }>>([])
  const [errores, setErrores] = useState<Record<string, string>>({})
  const guardar = useAccion()

  useEffect(() => setErrores(erroresDeCampos(guardar.error)), [guardar.error])

  const enviar = async () => {
    const adjuntos: Adjunto[] = archivos.filter((a) => a.status === 'done').map((a) => ({ nombre: a.name, tamano: a.size, tipo: a.tipo }))
    const visible = tipo === 'mensaje'
    const hecho = await guardar.ejecutar(async () => {
      await api.registrarInteraccion(ticket.id, { visible, canal: visible ? canal : null, texto, adjuntos })
      return true
    })
    if (hecho) {
      setTexto('')
      setArchivos([])
      setErrores({})
      toast({ message: visible ? 'Respuesta registrada y visible para el cliente.' : 'Nota interna guardada. El cliente no la ve.', tone: 'success' })
    }
  }

  const errorGeneral = guardar.error && !Object.keys(erroresDeCampos(guardar.error)).length ? guardar.error : null

  return (
    <Card>
      <CardHeader as="h2" title="Registrar interacción" />
      <CardBody>
        <Form id={`${id}-f`} onSubmit={enviar} errors={Object.fromEntries(Object.entries(errores).map(([k, m]) => [`${id}-${k}`, m]))} submitting={guardar.enCurso}>
          <SegmentedControl
            label="Tipo de interacción"
            options={[
              { value: 'mensaje', label: 'Respuesta al cliente' },
              { value: 'nota', label: 'Nota interna' },
            ]}
            value={tipo}
            onValueChange={(v) => {
              setTipo(v === 'nota' ? 'nota' : 'mensaje')
              setErrores({})
            }}
          />
          {tipo === 'mensaje' ? (
            <FormField label="Canal de la respuesta" id={`${id}-canal`} error={errores.canal}>
              <Select value={canal} onChange={(e) => setCanal(e.target.value as Canal)} options={CANALES.map((c) => ({ value: c, label: c }))} />
            </FormField>
          ) : (
            <Alert tone="info" size="sm">
              <span className="pt-alerta__texto">La nota interna no se muestra en Mi Portal. No escribas DNI, tarjetas ni otros datos personales: solo el motivo operativo.</span>
            </Alert>
          )}
          <FormField label={tipo === 'mensaje' ? 'Mensaje para el cliente' : 'Nota interna'} id={`${id}-texto`} error={errores.texto} required>
            <Textarea rows={3} autoResize maxRows={8} maxLength={2000} showCounter value={texto} onChange={(e) => setTexto(e.target.value)} />
          </FormField>
          <FileUpload
            label="Evidencia (fotos, videos o documentos)"
            accept={ACEPTA}
            multiple
            maxFiles={5}
            maxSize={MAX_BYTES}
            requirements="JPG, PNG, PDF o MP4 de hasta 10 MB; máximo 5. Quedan dentro de esta interacción."
            files={archivos}
            onFilesAdd={(nuevos) =>
              setArchivos((lista) => [
                ...lista,
                ...nuevos.map((f, i) => ({ id: `${Date.now()}-${i}-${f.name}`, name: f.name, size: f.size, status: 'done' as const, tipo: f.type })),
              ])
            }
            onFileRemove={(fid) => setArchivos((lista) => lista.filter((a) => a.id !== fid))}
          />
          <Supuesto>Tipos y tamaño de la evidencia por confirmar (pregunta abierta de FT-ATC-02). En el prototipo el archivo no se sube: solo se guarda su nombre.</Supuesto>
          {errorGeneral ? <AvisoDeError error={errorGeneral} reintentar={enviar} /> : null}
          <div className="pt-acciones">
            <Button type="submit" variant="primary" loading={guardar.enCurso}>
              {tipo === 'mensaje' ? 'Registrar la respuesta' : 'Guardar la nota'}
            </Button>
          </div>
        </Form>
      </CardBody>
    </Card>
  )
}

function tituloInteraccion(i: Interaccion) {
  if (i.tipo === 'cliente') return `Mensaje del cliente · ${i.canal}`
  if (i.tipo === 'nota') return 'Nota interna'
  return `Respuesta al cliente · ${i.canal}`
}

function ListaInteracciones({ interacciones, onVerComoCliente }: { interacciones: Interaccion[]; onVerComoCliente: () => void }) {
  const eventos = [...interacciones]
    .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
    .map((i) => ({
      id: i.id,
      // El texto va en el título: en una conversación se lee sin desplegar. El detalle
      // plegable de la Timeline queda para la evidencia adjunta.
      title: (
        <span className="pt-hito">
          <span className="pt-en-linea">
            {tituloInteraccion(i)}
            {i.visible ? (
              <Badge tone="info" size="sm">
                Visible al cliente
              </Badge>
            ) : (
              <Badge tone="neutral" size="sm">
                <Icon name="lock" size={16} /> Interna
              </Badge>
            )}
            {i.adjuntos.length ? (
              <Badge tone="neutral" size="sm">
                {i.adjuntos.length} {i.adjuntos.length === 1 ? 'adjunto' : 'adjuntos'}
              </Badge>
            ) : null}
          </span>
          <span className="pt-hito__texto">{i.texto}</span>
        </span>
      ),
      date: i.fecha,
      author: i.autor ? nombrePersona(i.autor) : 'Cliente',
      tone: i.tipo === 'nota' ? ('default' as const) : i.tipo === 'cliente' ? ('accent' as const) : ('success' as const),
      detail: i.adjuntos.length ? (
        <ul className="pt-adjuntos" aria-label="Evidencia adjunta">
          {i.adjuntos.map((a) => (
            <FileItem key={a.nombre} name={a.nombre} size={a.tamano} type={a.tipo} status="ready" />
          ))}
        </ul>
      ) : undefined,
    }))
  return (
    <Card>
      <CardHeader
        as="h2"
        title="Historial de interacciones"
        subtitle="De la más reciente a la más antigua."
        actions={
          <Button variant="secondary" size="sm" leadingIcon={<Icon name="eye" size={16} />} onClick={onVerComoCliente}>
            Ver como el cliente
          </Button>
        }
      />
      <CardBody>
        <Timeline
          label="Interacciones del ticket"
          locale="es-PE"
          events={eventos}
          emptyState={<EmptyState size="compact" title="Sin interacciones" description="Registra la primera respuesta al cliente: completa el hito de 1.ª respuesta." />}
        />
      </CardBody>
    </Card>
  )
}

// ── Historiales (HU-ATC-004, 007) ───────────────────────────────────────────

function AvisoInmutable() {
  return (
    <p className="pt-texto-chico pt-en-linea">
      <Icon name="lock" size={16} /> Bitácora append-only: las filas no se editan ni se borran; cada cambio es una fila nueva.
    </p>
  )
}

function HistorialEstados({ filas }: { filas: FilaEstado[] }) {
  const columnas: GridColumn<FilaEstado>[] = [
    { key: 'fecha', header: 'Fecha', width: '9rem', renderCell: (f) => fecha(f.fecha) },
    {
      key: 'cambio',
      header: 'Cambio',
      width: '14rem',
      renderCell: (f) => (
        <span className="pt-en-linea">
          {f.de ? <BadgeEstado estado={f.de} size="sm" /> : <span className="pt-texto-chico">Alta</span>}
          <Icon name="arrow-right" size={16} />
          <BadgeEstado estado={f.a} size="sm" />
        </span>
      ),
    },
    {
      key: 'autor',
      header: 'Autor',
      width: '11rem',
      renderCell: (f) =>
        f.autor ? (
          nombrePersona(f.autor)
        ) : (
          <Tag size="sm" variant="outline">
            Automático (sistema)
          </Tag>
        ),
    },
    { key: 'nota', header: 'Nota', renderCell: (f) => f.nota ?? '—' },
  ]
  return (
    <Card>
      <CardHeader as="h2" title="Historial de estados" />
      <CardBody>
        <div className="pt-pila">
          <AvisoInmutable />
          <DataGrid<FilaEstado> caption="Historial de estados del ticket" columns={columnas} rows={[...filas].reverse()} getRowId={(f) => f.id} />
        </div>
      </CardBody>
    </Card>
  )
}

const quien = (area: Area | null, responsable: string | null) => (area ? `${NOMBRE_AREA[area]} · ${responsable ? nombrePersona(responsable) : 'Sin asignar'}` : '—')

function Derivaciones({ filas }: { filas: FilaAsignacion[] }) {
  const columnas: GridColumn<FilaAsignacion>[] = [
    { key: 'fecha', header: 'Fecha', width: '9rem', renderCell: (f) => fecha(f.fecha) },
    { key: 'de', header: 'Lo tenía', width: '12rem', renderCell: (f) => quien(f.deArea, f.deResponsable) },
    { key: 'a', header: 'Pasó a', width: '12rem', renderCell: (f) => quien(f.aArea, f.aResponsable) },
    {
      key: 'motivo',
      header: 'Motivo',
      width: '13rem',
      renderCell: (f) => (
        <span className="pt-celda-doble">
          <span className="pt-celda-doble__principal">{nombreMotivo(f.motivo)}</span>
          <code className="pt-celda-doble__secundaria">{f.motivo}</code>
        </span>
      ),
    },
    { key: 'nota', header: 'Nota', width: '12rem', renderCell: (f) => f.nota ?? '—' },
    { key: 'autor', header: 'Registró', width: '9rem', renderCell: (f) => nombrePersona(f.autor) },
  ]
  return (
    <Card>
      <CardHeader as="h2" title="Derivaciones y asignaciones" />
      <CardBody>
        <div className="pt-pila">
          <AvisoInmutable />
          <DataGrid<FilaAsignacion> caption="Rastro de derivaciones del ticket" columns={columnas} rows={[...filas].reverse()} getRowId={(f) => f.id} />
        </div>
      </CardBody>
    </Card>
  )
}

function AlertasDelTicket({ datos, ticket }: { datos: Datos; ticket: Ticket }) {
  const alertas = datos.alertas.filter((a) => a.ticketId === ticket.id)
  return (
    <Card>
      <CardHeader as="h2" title="Alertas de SLA del ticket" subtitle="Una sola por tipo de incumplimiento y por ciclo." />
      <CardBody>
        {alertas.length ? (
          <ul className="pt-lista-simple">
            {[...alertas].reverse().map((a) => (
              <li key={a.id}>
                <Card>
                  <CardBody padding="sm">
                    <CardPairs
                      pairs={[
                        ['Tipo', <code key="t">{a.tipo}</code>],
                        ['Ciclo', a.ciclo === 0 ? '0 (original)' : `${a.ciclo} (reapertura ${a.ciclo})`],
                        ['Vencimiento evaluado', fechaLarga(a.vencimientoEvaluado)],
                        ['Fecha de la alerta', fechaLarga(a.fecha)],
                        ['Destinatario', nombrePersona(a.destinatario)],
                        ['Canal', a.canal],
                      ]}
                    />
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState size="compact" title="Sin alertas" description="Este ticket no incumplió ningún vencimiento en lo que va de su ciclo." />
        )}
        <Supuesto>Las alertas llegan al supervisor ATC como notificación en la consola (pregunta abierta de FT-ATC-04).</Supuesto>
      </CardBody>
    </Card>
  )
}

// ── Lateral: datos, compromisos (HU-ATC-006, 011) y cierre (HU-ATC-029) ────

function DatosDelTicket({ ticket }: { ticket: Ticket }) {
  const c = cliente(ticket.clienteId)
  const e = empresa(ticket.empresaId)
  return (
    <Card>
      <CardHeader as="h2" title="Datos del ticket" />
      <CardBody padding="sm">
        <CardPairs
          pairs={[
            ['Cliente', c ? `${c.nombre} · DNI ${dniEnmascarado(c.dni)}` : '—'],
            ['Empresa', e ? `${e.nombre} · RUC ${e.ruc}` : '—'],
            ['Línea', ticket.linea],
            ['Canal', ticket.canal],
            ['Establecimiento', ticket.establecimiento ?? 'Sin establecimiento'],
            ['Registró', `${nombrePersona(ticket.registradoPor)} · ${fecha(ticket.abierto)}`],
            ['Descripción', ticket.descripcion],
          ]}
        />
      </CardBody>
    </Card>
  )
}

function Hito({ valor, sinValor }: { valor: Date | null; sinValor: string }) {
  return valor ? <>{fechaLarga(valor)}</> : <span className="pt-texto-chico">{sinValor}</span>
}

function Compromisos({ ticket, datos }: { ticket: Ticket; datos: Datos }) {
  const vigente = venceResolucionVigente(ticket)
  return (
    <Card>
      <CardHeader
        as="h2"
        title="Compromisos SLA e hitos"
        actions={
          <Tag size="sm" variant="outline">
            <Icon name="lock" size={16} /> Congelados
          </Tag>
        }
      />
      <CardBody padding="sm">
        <CardPairs
          pairs={[
            ['Política', `${ticket.politica.id} v${ticket.politica.version} · ${ticket.politica.origen === 'especifica' ? 'específica' : ticket.politica.origen === 'generica' ? 'genérica del tipo' : 'genérica global'}`],
            ['Vence 1.ª respuesta', fechaLarga(ticket.venceRespuesta)],
            ['Vence resolución (original)', fechaLarga(ticket.venceResolucion)],
            ...(ticket.reaperturas
              ? ([[`Vence resolución (ciclo ${ticket.reaperturas})`, `${fechaLarga(vigente)} · ${restante(vigente, datos.ahora)}`]] as Array<[string, string]>)
              : []),
            ['1.ª respuesta', <Hito key="r" valor={ticket.primeraRespuesta} sinValor="Pendiente" />],
            ['1.ª resolución', <Hito key="p" valor={ticket.primeraResolucion} sinValor="Pendiente" />],
            ['Última resolución', <Hito key="u" valor={ticket.ultimaResolucion} sinValor="Pendiente" />],
            ['Cierre', <Hito key="c" valor={ticket.cierre} sinValor={ticket.reaperturas ? 'Pendiente (ciclo vigente)' : 'Pendiente'} />],
            ['Reaperturas', String(ticket.reaperturas)],
          ]}
        />
        <p className="pt-texto-chico">La 1.ª resolución no cambia aunque el ticket se reabra; la última refleja el ciclo más reciente.</p>
      </CardBody>
    </Card>
  )
}

function TarjetaE2E({ ticket, ahora }: { ticket: Ticket; ahora: Date }) {
  const e2e = cierreE2E(ticket, ahora)
  const porcentaje = Math.min(100, Math.round((e2e.horas / e2e.limite) * 100))
  return (
    <Card>
      <CardHeader as="h2" title="Cierre end-to-end" actions={<BadgeE2E e2e={e2e} />} />
      <CardBody padding="sm">
        <div className="pt-pila pt-pila--chica">
          <ProgressBar
            value={porcentaje}
            label={e2e.escalado ? 'Plazo del Eje 3' : 'Plazo de 72 h hábiles'}
            detail={`${horas(Math.round(e2e.horas * 10) / 10)} de ${horas(e2e.limite)} hábiles`}
            tone={e2e.nivel === 'en-riesgo' ? 'danger' : 'brand'}
            size="sm"
          />
          <p className="pt-texto-chico">
            {e2e.escalado ? 'Escalado a Eje 3: se compara contra el plazo del eje, no contra las 72 h.' : `Eje ${ticket.eje} sin escalamiento: objetivo de 72 h hábiles (RN-SVC-025).`}
          </p>
          {e2e.escalado ? <Supuesto>Plazo del Eje 3 de 10 días hábiles (90 h).</Supuesto> : <Supuesto>Aviso «por vencer» desde el 80 % del plazo.</Supuesto>}
        </div>
      </CardBody>
    </Card>
  )
}

// ── Cambiar estado (HU-ATC-004, 006, 011) ───────────────────────────────────

function DialogoEstado({ ticket, datos, abierto, onCerrar }: { ticket: Ticket; datos: Datos; abierto: boolean; onCerrar: () => void }) {
  const id = useId()
  const [destino, setDestino] = useState<Estado | ''>('')
  const [nota, setNota] = useState('')
  const guardar = useAccion()
  const errores = erroresDeCampos(guardar.error)

  useEffect(() => {
    if (!abierto) return
    setDestino('')
    setNota('')
    guardar.limpiar()
  }, [abierto, guardar.limpiar])

  const politicaVigente = elegirPolitica(datos.politicas, ticket.tipo, ticket.prioridad).politica
  const confirmar = async () => {
    if (!destino) return
    const hecho = await guardar.ejecutar(async () => {
      await api.cambiarEstado(ticket.id, destino, nota.trim() || null)
      return true
    })
    if (hecho) {
      toast({ message: `${ticket.numero}: ${NOMBRE_ESTADO[ticket.estado]} → ${NOMBRE_ESTADO[destino]}.`, tone: 'success' })
      onCerrar()
    }
  }

  return (
    <Dialog
      open={abierto}
      onOpenChange={(a) => (a ? undefined : onCerrar())}
      title="Cambiar estado"
      description={`Estado actual: ${NOMBRE_ESTADO[ticket.estado]}. Cada cambio queda como una fila nueva en el historial, con tu nombre y la hora.`}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" form={`${id}-f`} loading={guardar.enCurso} disabled={!destino}>
            {destino ? `Pasar a ${NOMBRE_ESTADO[destino]}` : 'Elige un estado'}
          </Button>
        </>
      }
    >
      <Form id={`${id}-f`} onSubmit={confirmar} errors={errores.nota ? { [`${id}-nota`]: errores.nota } : {}}>
        <FormGroup legend="Nuevo estado">
          {ESTADOS.filter((e) => e !== ticket.estado).map((e) => {
            const razon = motivoTransicionInvalida(ticket.estado, e) ?? motivoGateConflicto(datos, ticket, e)
            return <Radio key={e} name={`${id}-estado`} value={e} label={NOMBRE_ESTADO[e]} helper={razon ?? undefined} disabled={Boolean(razon)} checked={destino === e} onChange={() => setDestino(e)} />
          })}
        </FormGroup>
        {destino === 'REOPENED' ? (
          <Alert tone="info" size="sm" title="Nuevo compromiso">
            <span className="pt-alerta__texto">
              Con la política vigente ({politicaVigente.id} v{politicaVigente.version}) la resolución del ciclo {ticket.reaperturas + 1} vencerá el{' '}
              {fechaLarga(sumarHorasHabiles(datos.ahora, politicaVigente.resolucionH))}. El compromiso original ({fechaLarga(ticket.venceResolucion)}) se conserva.
            </span>
          </Alert>
        ) : null}
        {destino === 'CLOSED' ? <Supuesto>El cierre formal lo confirma el cliente en Mi Portal (RN-SVC-023); aquí se registra esa confirmación.</Supuesto> : null}
        {destino === 'ESCALATED' ? <Supuesto>Escalar pasa el ticket al Eje 3 y su cierre end-to-end se mide contra el plazo del eje.</Supuesto> : null}
        <FormField label="Nota del cambio" id={`${id}-nota`} error={errores.nota} optional helper="Solo el motivo operativo: sin datos personales.">
          <Textarea rows={3} value={nota} onChange={(e) => setNota(e.target.value)} maxLength={500} />
        </FormField>
        {guardar.error && !errores.nota ? <AvisoDeError error={guardar.error} reintentar={confirmar} /> : null}
      </Form>
    </Dialog>
  )
}

// ── Derivar (HU-ATC-007) ────────────────────────────────────────────────────

function CajonDerivar({ ticket, abierto, onCerrar }: { ticket: Ticket; abierto: boolean; onCerrar: () => void }) {
  const id = useId()
  const [area, setArea] = useState<Area | ''>('')
  const [responsable, setResponsable] = useState('')
  const [motivo, setMotivo] = useState('')
  const [nota, setNota] = useState('')
  const guardar = useAccion()
  const errores = erroresDeCampos(guardar.error)

  useEffect(() => {
    if (!abierto) return
    setArea('')
    setResponsable('')
    setMotivo('')
    setNota('')
    guardar.limpiar()
  }, [abierto, guardar.limpiar])

  const personasDelArea = PERSONAS.filter((p) => p.area === area && p.rol !== 'SIN_ATENCION')
  const confirmar = async () => {
    const hecho = await guardar.ejecutar(async () => {
      await api.derivar(ticket.id, { area, responsable, motivo, nota })
      return true
    })
    if (hecho && area) {
      toast({ message: `${ticket.numero} derivado a ${NOMBRE_AREA[area]}${responsable ? ` (${nombrePersona(responsable)})` : ', sin asignar'}.`, tone: 'success' })
      onCerrar()
    }
  }
  const campo = (k: string) => `${id}-${k}`

  return (
    <Drawer
      open={abierto}
      onOpenChange={(a) => (a ? undefined : onCerrar())}
      title={`Derivar ${ticket.numero}`}
      side="end"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" form={`${id}-f`} loading={guardar.enCurso}>
            Derivar
          </Button>
        </>
      }
    >
      <Form id={`${id}-f`} onSubmit={confirmar} errors={Object.fromEntries(Object.entries(errores).map(([k, m]) => [campo(k), m]))}>
        <p className="pt-texto-chico">
          Ahora: {NOMBRE_AREA[ticket.area]} · {ticket.responsable ? nombrePersona(ticket.responsable) : 'Sin asignar'}
        </p>
        <FormField label="Área de destino" id={campo('area')} error={errores.area} required>
          <Select
            value={area}
            placeholder="Elige el área"
            onChange={(e) => {
              setArea(e.target.value as Area)
              setResponsable('')
            }}
            options={AREAS.map((a) => ({ value: a, label: NOMBRE_AREA[a] }))}
          />
        </FormField>
        <FormField label="Persona" id={campo('responsable')} error={errores.responsable} optional helper="Sin persona, queda «sin asignar» en la bandeja del área.">
          <Select
            value={responsable}
            disabled={!area}
            onChange={(e) => setResponsable(e.target.value)}
            options={[{ value: '', label: 'Sin persona: que la tome alguien del área' }, ...personasDelArea.map((p) => ({ value: p.id, label: p.nombre }))]}
          />
        </FormField>
        <FormField label="Motivo" id={campo('motivo')} error={errores.motivo} required>
          <Select
            value={motivo}
            placeholder="Elige un motivo del catálogo"
            onChange={(e) => setMotivo(e.target.value)}
            options={MOTIVOS.filter((m) => m.uso === 'derivacion').map((m) => ({ value: m.id, label: m.nombre }))}
          />
        </FormField>
        <Supuesto>Catálogo de motivos provisional (pregunta abierta de FT-ATC-03).</Supuesto>
        <FormField label="Nota" id={campo('nota')} error={errores.nota} optional helper="Solo el motivo operativo: sin DNI, tarjetas ni datos personales.">
          <Textarea rows={3} value={nota} onChange={(e) => setNota(e.target.value)} maxLength={500} showCounter />
        </FormField>
        {guardar.error && !Object.keys(errores).length ? <AvisoDeError error={guardar.error} reintentar={confirmar} /> : null}
      </Form>
    </Drawer>
  )
}

// ── Mi Portal (HU-ATC-005 CA-03) ────────────────────────────────────────────

const ESTADO_PARA_CLIENTE: Record<Estado, string> = {
  OPEN: 'Recibido',
  IN_PROGRESS: 'En revisión',
  PENDING_CUSTOMER: 'Esperamos tu respuesta',
  ESCALATED: 'En revisión especializada',
  RESOLVED: 'Solucionado: confírmanos',
  CLOSED: 'Cerrado',
  REOPENED: 'Reabierto: en revisión',
}

function VistaMiPortal({ ticket, interacciones, abierto, onCerrar }: { ticket: Ticket; interacciones: Interaccion[]; abierto: boolean; onCerrar: () => void }) {
  const visibles = interacciones.filter((i) => i.visible).sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
  const ocultas = interacciones.length - visibles.length
  return (
    <SidePanel open={abierto} onOpenChange={(a) => (a ? undefined : onCerrar())} title="Así lo ve el cliente en Mi Portal" size="md">
      <div className="pt-pila">
        <Alert tone="info" size="sm">
          <span className="pt-alerta__texto">
            Vista previa de solo lectura. {ocultas ? `${ocultas} ${ocultas === 1 ? 'nota interna no se muestra' : 'notas internas no se muestran'}.` : 'Este ticket no tiene notas internas.'}
          </span>
        </Alert>
        <Card>
          <CardBody padding="sm">
            <CardPairs
              pairs={[
                ['N.º de seguimiento', ticket.numero],
                ['Estado', ESTADO_PARA_CLIENTE[ticket.estado]],
                ['Empresa', empresa(ticket.empresaId)?.nombre ?? '—'],
                ['Solicitud', ticket.resumen],
              ]}
            />
          </CardBody>
        </Card>
        <Timeline
          label="Mensajes del caso en Mi Portal"
          locale="es-PE"
          events={visibles.map((i) => ({
            id: i.id,
            title: (
              <span className="pt-hito">
                <span>{i.tipo === 'cliente' ? 'Tú escribiste' : 'Aybar respondió'}</span>
                <span className="pt-hito__texto">{i.texto}</span>
              </span>
            ),
            date: i.fecha,
            detail: i.adjuntos.length ? (
              <div className="pt-pila pt-pila--chica">
                {i.adjuntos.length ? (
                  <ul className="pt-adjuntos" aria-label="Archivos adjuntos">
                    {i.adjuntos.map((a) => (
                      <FileItem key={a.nombre} name={a.nombre} size={a.tamano} type={a.tipo} status="ready" />
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : undefined,
          }))}
          emptyState={<EmptyState size="compact" title="Aún sin respuestas" description="Te avisaremos cuando respondamos." />}
        />
        <Supuesto>Textos del estado para el cliente provisionales; Mi Portal es otro producto y aquí solo se muestra qué datos le llegan.</Supuesto>
      </div>
    </SidePanel>
  )
}

// ── Libro de Reclamaciones (ola 2: HU-ATC-012) ──────────────────────────────

function TarjetaLibro({ ticket, datos, puedeRegistrar, onRegistrar }: { ticket: Ticket; datos: Datos; puedeRegistrar: boolean; onRegistrar: () => void }) {
  const asiento = asientoDeTicket(datos, ticket.id)
  if (!asiento && !exigeAsiento(ticket.tipo)) return null
  const plazo = asiento ? estadoPlazo(asiento, datos.ahora) : null
  return (
    <Card>
      <CardHeader as="h2" title="Libro de Reclamaciones" actions={plazo ? <BadgePlazo nivel={plazo.nivel} dias={plazo.dias} size="sm" /> : undefined} />
      <CardBody padding="sm">
        {asiento && plazo ? (
          <div className="pt-pila pt-pila--chica">
            <CardPairs
              pairs={[
                ['Asiento', asiento.codigo],
                ['Tipo', asiento.tipo === 'RECLAMO' ? 'Reclamo' : 'Queja'],
                ['Vence', `${fechaLarga(plazo.vence)}${asiento.prorroga ? ' (prorrogado)' : ''}`],
              ]}
            />
            <Button variant="secondary" size="sm" onClick={() => (location.hash = hrefDe(`libro/${asiento.id}`))}>
              Abrir el asiento
            </Button>
          </div>
        ) : (
          <div className="pt-pila pt-pila--chica">
            <Alert tone="warning" size="sm" title="Sin asiento">
              <span className="pt-alerta__texto">
                {ticket.tipo === 'QUE' ? 'Una queja' : 'Un reclamo'} exige su asiento en el Libro: sin él, el control diario lo marca como huérfano.
              </span>
            </Alert>
            {puedeRegistrar ? (
              <Button variant="primary" size="sm" onClick={onRegistrar}>
                Registrar asiento
              </Button>
            ) : null}
          </div>
        )}
      </CardBody>
    </Card>
  )
}

function CajonAsiento({ ticket, abierto, onCerrar }: { ticket: Ticket; abierto: boolean; onCerrar: () => void }) {
  const id = useId()
  const [tipo, setTipo] = useState<TipoAsiento | ''>('')
  const [establecimiento, setEstablecimiento] = useState('')
  const [hechos, setHechos] = useState('')
  const [pedido, setPedido] = useState('')
  const [monto, setMonto] = useState<number | null>(null)
  const [moneda, setMoneda] = useState<Moneda | ''>('')
  const guardar = useAccion()
  const errores = erroresDeCampos(guardar.error)

  useEffect(() => {
    if (!abierto) return
    setTipo(ticket.tipo === 'QUE' ? 'QUEJA' : ticket.tipo === 'REC' ? 'RECLAMO' : '')
    setEstablecimiento(ticket.establecimiento ?? LIBRO_VIRTUAL)
    setHechos('')
    setPedido('')
    setMonto(null)
    setMoneda('')
    guardar.limpiar()
  }, [abierto, ticket, guardar.limpiar])

  const confirmar = async () => {
    const asiento = await guardar.ejecutar(() => api.registrarAsiento(ticket.id, { tipo, establecimiento, hechos, pedido, monto, moneda }))
    if (asiento) {
      toast({ message: `Asiento ${asiento.codigo} registrado. Vence el ${fechaLarga(asiento.venceOriginal)}.`, tone: 'success' })
      onCerrar()
    }
  }
  const campo = (k: string) => `${id}-${k}`
  const e = empresa(ticket.empresaId)

  return (
    <Drawer
      open={abierto}
      onOpenChange={(a) => (a ? undefined : onCerrar())}
      title={`Registrar asiento · ${ticket.numero}`}
      side="end"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" form={`${id}-f`} loading={guardar.enCurso}>
            Registrar el asiento
          </Button>
        </>
      }
    >
      <Form id={`${id}-f`} onSubmit={confirmar} errors={Object.fromEntries(Object.entries(errores).map(([k, m]) => [campo(k), m]))}>
        <p className="pt-texto-chico">
          Razón social: <strong>{e ? `${e.nombre} · RUC ${e.ruc}` : '—'}</strong>. Sale del ticket y el asiento no la cambia nunca.
        </p>
        <FormGroup legend="Tipo" error={errores.tipo}>
          <div className="pt-opciones-en-linea" id={campo('tipo')}>
            {(['QUEJA', 'RECLAMO'] as const).map((t) => (
              <Radio key={t} name={`${id}-tipo`} value={t} label={t === 'QUEJA' ? 'Queja' : 'Reclamo'} checked={tipo === t} onChange={() => setTipo(t)} />
            ))}
          </div>
        </FormGroup>
        <FormField label="Establecimiento" id={campo('establecimiento')} error={errores.establecimiento} required helper="Cada establecimiento lleva su correlativo.">
          <Select value={establecimiento} onChange={(ev) => setEstablecimiento(ev.target.value)} options={ESTABLECIMIENTOS_LIBRO.map((x) => ({ value: x, label: x }))} />
        </FormField>
        <Supuesto>Los reclamos por teléfono, WhatsApp o correo se asientan en el «Libro virtual» de la empresa.</Supuesto>
        <FormField label="Hechos" id={campo('hechos')} error={errores.hechos} required>
          <Textarea rows={4} value={hechos} onChange={(ev) => setHechos(ev.target.value)} maxLength={2000} showCounter />
        </FormField>
        <FormField label="Pedido del consumidor" id={campo('pedido')} error={errores.pedido} required>
          <Textarea rows={2} value={pedido} onChange={(ev) => setPedido(ev.target.value)} maxLength={1000} />
        </FormField>
        <div className="pt-rejilla-campos">
          <div id={campo('monto')}>
            <NumberInput label="Monto reclamado (opcional)" value={monto} onValueChange={setMonto} min={0} step={10} locale="es-PE" error={errores.monto} />
          </div>
          <FormField
            label="Moneda"
            id={campo('moneda')}
            error={errores.moneda}
            optional={monto === null}
            required={monto !== null}
            helper={monto === null ? 'Sin monto, queda vacía.' : undefined}
          >
            <Select
              value={monto === null ? '' : moneda}
              disabled={monto === null}
              placeholder="Elige la moneda"
              onChange={(ev) => setMoneda(ev.target.value as Moneda)}
              options={[
                { value: 'PEN', label: 'Soles (PEN)' },
                { value: 'USD', label: 'Dólares (USD)' },
              ]}
            />
          </FormField>
        </div>
        {guardar.error && !Object.keys(errores).length ? <AvisoDeError error={guardar.error} reintentar={confirmar} /> : null}
      </Form>
    </Drawer>
  )
}

// ── Incidencia de ciudad (ola 5: HU-ATC-017) ────────────────────────────────

function TarjetaCiudad({ ticket, datos, puede }: { ticket: Ticket; datos: Datos; puede: boolean }) {
  const [contrato, setContrato] = useState('')
  const guardar = useAccion()
  const errores = erroresDeCampos(guardar.error)
  if (ticket.tipo !== 'CIT') return null
  const vinculo = vinculoDe(datos, ticket.id)
  const c = vinculo ? contratoDe(vinculo.contratoId) : null
  const enviar = async () => {
    const ok = await guardar.ejecutar(async () => {
      await api.vincularContrato(ticket.id, contrato)
      return true
    })
    if (ok) toast({ message: `${ticket.numero} vinculado al contrato ${contrato}.`, tone: 'success' })
  }
  return (
    <Card>
      <CardHeader as="h2" title="Incidencia de ciudad" />
      <CardBody padding="sm">
        <div className="pt-pila pt-pila--chica">
          {c ? (
            <CardPairs pairs={[['Contrato', `${c.id} · ${c.tipo}`], ['Detalle', c.detalle]]} />
          ) : (
            <p className="pt-texto-chico">Sin contrato ni unidad: válido para una incidencia en un área común.</p>
          )}
          {puede ? (
            <Form id={`${ticket.id}-ciudad`} onSubmit={enviar} errors={errores.contrato ? { [`${ticket.id}-contrato`]: errores.contrato } : {}}>
              <FormField label="Vincular a un contrato (si deriva en cobro)" id={`${ticket.id}-contrato`} error={errores.contrato} optional>
                <Select value={contrato} placeholder="Elige el contrato" onChange={(e) => setContrato(e.target.value)} options={CONTRATOS.map((x) => ({ value: x.id, label: `${x.id} · ${x.tipo}` }))} />
              </FormField>
              <div className="pt-acciones">
                <Button type="submit" size="sm" variant="secondary" loading={guardar.enCurso} disabled={!contrato}>Vincular</Button>
              </div>
              {guardar.error && !errores.contrato ? <AvisoDeError error={guardar.error} reintentar={enviar} /> : null}
            </Form>
          ) : null}
        </div>
      </CardBody>
    </Card>
  )
}
