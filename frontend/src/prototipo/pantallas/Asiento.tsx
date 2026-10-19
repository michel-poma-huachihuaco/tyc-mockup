import {
  Alert,
  Badge,
  Breadcrumb,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardPairs,
  Checkbox,
  DataGrid,
  DatePicker,
  Dialog,
  Drawer,
  EmptyState,
  ErrorMessage,
  ErrorPage,
  FileItem,
  Form,
  FormField,
  FormGroup,
  Header,
  Icon,
  Input,
  Radio,
  Select,
  Skeleton,
  Tag,
  Textarea,
  toast,
} from '@aybarcorp/ui'
import type { GridColumn } from '@aybarcorp/ui'
import { useEffect, useId, useState } from 'react'
import type { ReactNode } from 'react'
import { CANALES_PRORROGA, FIRMANTES, NOMBRE_ESTADO_APELACION, NOMBRE_INSTANCIA, PLAZO_LEGAL_DIAS, empresa, nombrePersona } from '../datos/catalogos.ts'
import type { EstadoApelacion } from '../datos/catalogos.ts'
import { cliente, dniEnmascarado } from '../datos/clientes.ts'
import { AvisoDeError, BadgePlazo, CampoPdf, Prohibido, Supuesto, dinero, erroresDeCampos, fecha, fechaDia, irA, useAccion, useCarga } from '../comun.tsx'
import { hrefDe } from '../rutas.ts'
import { api, useConsola, useSesion } from '../servicio/api.ts'
import { diasHabilesEntre, sumarDiasHabiles } from '../servicio/calendario.ts'
import { TRANSICIONES_APELACION, esResolucion, estadoPlazo, instanciaDisponible, motivoSinApelacion, motivoSinProrroga } from '../servicio/libro.ts'
import type { Apelacion, Asiento as TAsiento, Documento, FilaApelacion, FilaPlazo, Instancia } from '../servicio/libro.ts'
import { puede } from '../servicio/nucleo.ts'
import type { Datos } from '../servicio/nucleo.ts'
import { NOMBRE_ALERTA_LEGAL } from './Libro.tsx'

const TONO_APELACION: Record<EstadoApelacion, 'neutral' | 'info' | 'success' | 'danger' | 'warning'> = {
  PENDING: 'warning',
  UNDER_REVIEW: 'info',
  RESOLVED_FOUNDED: 'success',
  RESOLVED_UNFOUNDED: 'danger',
  WITHDRAWN: 'neutral',
}

/**
 * Ficha del asiento — HU-ATC-012 (datos y empresa inmutable), 013 (plazo y prórroga
 * única), 014 (respuesta formal con cargo), 015 (alertas del asiento) y 016 (apelaciones).
 */
export default function Asiento({ asientoId }: { asientoId: string }) {
  const sesion = useSesion()
  const { datos } = useConsola()
  const [carga, reintentar] = useCarga(`asiento-${asientoId}`)
  const [dialogo, setDialogo] = useState<'prorroga' | 'respuesta' | 'apelacion' | { estado: Apelacion } | null>(null)
  const asiento = datos.asientos.find((a) => a.id === asientoId)

  if (!puede.verLibro(sesion.rol)) {
    return (
      <div className="pt-pagina">
        <Header title="Asiento del Libro" />
        <Prohibido requiere="de atención, legal o Coordinador CX" recurso="ver el Libro de Reclamaciones" />
      </div>
    )
  }
  const migas = (actual: string) => <Breadcrumb items={[{ label: 'Libro de Reclamaciones', href: hrefDe('libro') }, { label: actual }]} />
  if (carga.fase === 'cargando') {
    return (
      <div className="pt-pagina pt-pagina--ancha" aria-busy="true">
        <Header title="Asiento" loading />
        <div className="pt-dos-columnas">
          <Skeleton variant="block" height="20rem" />
          <Skeleton variant="block" height="14rem" />
        </div>
      </div>
    )
  }
  if (carga.fase === 'error') {
    return (
      <div className="pt-pagina">
        <Header title="Asiento" breadcrumb={migas('Asiento')} />
        <AvisoDeError error={carga.error} reintentar={reintentar} titulo="No se pudo cargar el asiento" />
      </div>
    )
  }
  if (!asiento) {
    return (
      <div className="pt-pagina">
        <ErrorPage
          status={404}
          scope="page"
          title="Ese asiento no existe"
          description="Puede que el enlace sea de otra sesión del prototipo (los datos se reinician al recargar)."
          actions={
            <Button variant="primary" onClick={() => irA(hrefDe('libro'))}>
              Volver al Libro
            </Button>
          }
        />
      </div>
    )
  }

  const plazo = estadoPlazo(asiento, datos.ahora)
  const gestiona = puede.gestionarLibro(sesion.rol)
  const sinProrroga = motivoSinProrroga(asiento, datos.ahora)
  const sinApelacion = motivoSinApelacion(datos, asiento)
  const ticket = datos.tickets.find((t) => t.id === asiento.ticketId)
  const apelaciones = datos.apelaciones.filter((a) => a.asientoId === asiento.id)

  return (
    <div className="pt-pagina pt-pagina--ancha">
      <Header
        title={`${asiento.codigo} · ${asiento.tipo === 'RECLAMO' ? 'Reclamo' : 'Queja'}`}
        breadcrumb={migas(asiento.codigo)}
        meta={
          <span className="pt-en-linea">
            <BadgePlazo nivel={plazo.nivel} dias={plazo.dias} />
            {asiento.prorroga ? <Badge tone="info">Prorrogado</Badge> : null}
          </span>
        }
        description={`${empresa(asiento.empresaId)?.nombre} · ${asiento.establecimiento} · ticket ${ticket?.numero ?? '—'}`}
        actions={
          gestiona && !asiento.respuesta ? (
            <>
              <Button variant="secondary" onClick={() => setDialogo('prorroga')} disabled={Boolean(sinProrroga)}>
                Prorrogar {PLAZO_LEGAL_DIAS} días
              </Button>
              <Button variant="primary" onClick={() => setDialogo('respuesta')}>
                Registrar respuesta
              </Button>
            </>
          ) : undefined
        }
      />
      {gestiona && !asiento.respuesta && sinProrroga ? (
        <Alert tone="info" size="sm" title="Prórroga no disponible">
          <span className="pt-alerta__texto">{sinProrroga}</span>
        </Alert>
      ) : null}
      {!gestiona ? (
        <Alert tone="info" size="sm" title="Solo lectura">
          <span className="pt-alerta__texto">La prórroga, la respuesta y las apelaciones las gestiona la responsable legal de reclamos.</span>
        </Alert>
      ) : null}

      <div className="pt-dos-columnas">
        <div className="pt-pila">
          <DatosAsiento asiento={asiento} datos={datos} verNarrativa={puede.verNarrativa(sesion.rol)} />
          <RespuestaFormal asiento={asiento} />
          <Apelaciones
            datos={datos}
            apelaciones={apelaciones}
            gestiona={gestiona}
            sinApelacion={sinApelacion}
            onRegistrar={() => setDialogo('apelacion')}
            onEstado={(a) => setDialogo({ estado: a })}
          />
        </div>
        <aside className="pt-lateral" aria-label="Plazo legal">
          <PlazoLegal asiento={asiento} />
          <HistorialPlazo filas={datos.filasPlazo.filter((f) => f.asientoId === asiento.id)} />
          <AlertasDelAsiento datos={datos} asiento={asiento} />
        </aside>
      </div>

      <DialogoProrroga asiento={asiento} ahora={datos.ahora} abierto={dialogo === 'prorroga'} onCerrar={() => setDialogo(null)} />
      <CajonRespuesta asiento={asiento} ahora={datos.ahora} abierto={dialogo === 'respuesta'} onCerrar={() => setDialogo(null)} />
      <DialogoApelacion asiento={asiento} datos={datos} abierto={dialogo === 'apelacion'} onCerrar={() => setDialogo(null)} />
      <DialogoEstadoApelacion
        apelacion={typeof dialogo === 'object' && dialogo ? dialogo.estado : null}
        ahora={datos.ahora}
        onCerrar={() => setDialogo(null)}
      />
    </div>
  )
}

// ── Datos y respuesta ───────────────────────────────────────────────────────

function DatosAsiento({ asiento, datos, verNarrativa }: { asiento: TAsiento; datos: Datos; verNarrativa: boolean }) {
  const ticket = datos.tickets.find((t) => t.id === asiento.ticketId)
  const c = ticket ? cliente(ticket.clienteId) : null
  const e = empresa(asiento.empresaId)
  const restringido = <span className="pt-texto-chico">Restringido a atención y legal (RNF-SEC-008).</span>
  return (
    <Card>
      <CardHeader as="h2" title="Asiento" subtitle={`Registrado el ${fecha(asiento.registrado)} por ${nombrePersona(asiento.registradoPor)}`} />
      <CardBody padding="sm">
        <CardPairs
          pairs={[
            [
              'Razón social',
              <span key="e" className="pt-en-linea">
                {e ? `${e.nombre} · RUC ${e.ruc}` : '—'}
                <Tag size="sm" variant="outline">
                  <Icon name="lock" size={16} /> No se cambia
                </Tag>
              </span>,
            ],
            ['Establecimiento', asiento.establecimiento],
            ['Consumidor', c ? `${c.nombre} · DNI ${dniEnmascarado(c.dni)}` : '—'],
            [
              'Ticket',
              ticket ? (
                <a key="t" className="pt-tarjeta__numero" href={hrefDe(`ticket/${ticket.id}`)}>
                  {ticket.numero}
                </a>
              ) : (
                '—'
              ),
            ],
            ['Hechos', verNarrativa ? <p key="h" className="pt-narrativa">{asiento.hechos}</p> : restringido],
            ['Pedido', verNarrativa ? <p key="p" className="pt-narrativa">{asiento.pedido}</p> : restringido],
            ['Monto reclamado', asiento.monto !== null && asiento.moneda ? dinero(asiento.monto, asiento.moneda) : 'Sin monto'],
          ]}
        />
      </CardBody>
    </Card>
  )
}

function DocumentoProbatorio({ documento }: { documento: Documento }) {
  return (
    <div className="pt-pila pt-pila--chica">
      <ul className="pt-adjuntos">
        <FileItem name={documento.nombre} size={documento.tamano} type="application/pdf" status="ready" />
      </ul>
      <code className="pt-huella">SHA-256 {documento.sha256}</code>
    </div>
  )
}

function RespuestaFormal({ asiento }: { asiento: TAsiento }) {
  const r = asiento.respuesta
  return (
    <Card>
      <CardHeader as="h2" title="Respuesta formal" />
      <CardBody padding="sm">
        {r ? (
          <CardPairs
            pairs={[
              ['Fecha', `${fecha(r.fecha)} · ${r.diasHabilesUsados} días hábiles desde el registro`],
              ['Resumen', <p key="r" className="pt-narrativa">{r.resumen}</p>],
              ['Firmante', nombrePersona(r.firmante)],
              ['Carta', <DocumentoProbatorio key="c" documento={r.carta} />],
              ['Cargo del consumidor', <DocumentoProbatorio key="g" documento={r.cargo} />],
              [
                'Derecho a INDECOPI',
                <span key="i" className="pt-en-linea">
                  <Icon name="check-circle" size={16} /> Se informó al consumidor
                </span>,
              ],
            ]}
          />
        ) : (
          <EmptyState size="compact" title="Sin respuesta todavía" description="Sin carta con cargo no hay respuesta válida ante INDECOPI (RN-SVC-010)." />
        )}
      </CardBody>
    </Card>
  )
}

// ── Plazo legal (HU-ATC-013, 015) ───────────────────────────────────────────

function PlazoLegal({ asiento }: { asiento: TAsiento }) {
  const p = asiento.prorroga
  return (
    <Card>
      <CardHeader
        as="h2"
        title="Plazo legal"
        actions={
          <Tag size="sm" variant="outline">
            <Icon name="lock" size={16} /> No se reescribe
          </Tag>
        }
      />
      <CardBody padding="sm">
        <CardPairs
          pairs={[
            ['Registro', fecha(asiento.registrado)],
            ['Vence (original)', fechaDia(asiento.venceOriginal)],
            ['Vence (prorrogado)', asiento.venceProrrogado ? fechaDia(asiento.venceProrrogado) : 'Sin prórroga'],
            ...(p
              ? ([
                  ['Justificación', <p key="j" className="pt-narrativa">{p.justificacion}</p>],
                  ['Comunicada', `${fechaDia(p.fechaComunicacion)} · ${p.canal}`],
                  ['Cargo de la prórroga', <DocumentoProbatorio key="c" documento={p.cargo} />],
                ] as Array<[string, ReactNode]>)
              : []),
          ]}
        />
      </CardBody>
    </Card>
  )
}

const NOMBRE_EVENTO_PLAZO: Record<FilaPlazo['evento'], string> = { PLAZO_ORIGINAL: 'Plazo original', PRORROGA: 'Prórroga única', RESPUESTA: 'Respuesta formal' }

function HistorialPlazo({ filas }: { filas: FilaPlazo[] }) {
  const columnas: GridColumn<FilaPlazo>[] = [
    { key: 'fecha', header: 'Fecha', width: '8rem', renderCell: (f) => fecha(f.fecha) },
    {
      key: 'evento',
      header: 'Evento',
      width: '12rem',
      renderCell: (f) => (
        <span className="pt-celda-doble">
          <span className="pt-celda-doble__principal">{NOMBRE_EVENTO_PLAZO[f.evento]}</span>
          <span className="pt-celda-doble__secundaria">{f.vence ? `Vence ${fechaDia(f.vence)}` : f.detalle}</span>
        </span>
      ),
    },
    { key: 'autor', header: 'Autor', width: '8rem', renderCell: (f) => nombrePersona(f.autor) },
  ]
  return (
    <Card>
      <CardHeader as="h2" title="Historial del plazo" />
      <CardBody padding="sm">
        <div className="pt-pila pt-pila--chica">
          <p className="pt-texto-chico pt-en-linea">
            <Icon name="lock" size={16} /> Cada cambio es una fila nueva: ninguna se edita.
          </p>
          <DataGrid<FilaPlazo> caption="Historial del plazo legal" columns={columnas} rows={filas} getRowId={(f) => f.id} />
        </div>
      </CardBody>
    </Card>
  )
}

function AlertasDelAsiento({ datos, asiento }: { datos: Datos; asiento: TAsiento }) {
  const alertas = datos.alertasLegales.filter((a) => a.asientoId === asiento.id)
  return (
    <Card>
      <CardHeader as="h2" title="Alertas legales" />
      <CardBody padding="sm">
        {alertas.length ? (
          <ul className="pt-lista-simple">
            {alertas.map((a) => (
              <li key={a.id}>
                <strong>{NOMBRE_ALERTA_LEGAL[a.tipo]}</strong>
                <span className="pt-texto-chico">
                  {' '}
                  · evaluado {fechaDia(a.vencimientoEvaluado)} · {fecha(a.fecha)} · {nombrePersona(a.destinatario)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="pt-texto-chico">Sin alertas.</p>
        )}
      </CardBody>
    </Card>
  )
}

// ── Apelaciones (HU-ATC-016) ────────────────────────────────────────────────

function Apelaciones({
  datos,
  apelaciones,
  gestiona,
  sinApelacion,
  onRegistrar,
  onEstado,
}: {
  datos: Datos
  apelaciones: Apelacion[]
  gestiona: boolean
  sinApelacion: string | null
  onRegistrar: () => void
  onEstado: (a: Apelacion) => void
}) {
  return (
    <Card>
      <CardHeader
        as="h2"
        title="Apelaciones"
        actions={
          gestiona && !sinApelacion ? (
            <Button size="sm" variant="secondary" onClick={onRegistrar}>
              Registrar apelación
            </Button>
          ) : undefined
        }
      />
      <CardBody padding="sm">
        <div className="pt-pila">
          {gestiona && sinApelacion && apelaciones.length ? <p className="pt-texto-chico">{sinApelacion}</p> : null}
          {apelaciones.length ? (
            apelaciones.map((a) => (
              <FichaApelacion key={a.id} apelacion={a} filas={datos.filasApelacion.filter((f) => f.apelacionId === a.id)} gestiona={gestiona} onEstado={() => onEstado(a)} />
            ))
          ) : (
            <EmptyState size="compact" title="Sin apelaciones" description={sinApelacion ?? 'Si el consumidor apela la respuesta, regístrala aquí.'} />
          )}
          <Supuesto>Estados: pendiente, en revisión, fundada, infundada y desistida. Tras una resolución interna se puede apelar ante INDECOPI; tras desistir, no.</Supuesto>
        </div>
      </CardBody>
    </Card>
  )
}

function FichaApelacion({ apelacion, filas, gestiona, onEstado }: { apelacion: Apelacion; filas: FilaApelacion[]; gestiona: boolean; onEstado: () => void }) {
  const columnas: GridColumn<FilaApelacion>[] = [
    { key: 'fecha', header: 'Fecha', width: '8rem', renderCell: (f) => fecha(f.fecha) },
    { key: 'cambio', header: 'Estado', width: '13rem', renderCell: (f) => `${f.de ? `${NOMBRE_ESTADO_APELACION[f.de]} → ` : ''}${NOMBRE_ESTADO_APELACION[f.a]}` },
    { key: 'autor', header: 'Autor', width: '8rem', renderCell: (f) => nombrePersona(f.autor) },
    { key: 'nota', header: 'Nota', renderCell: (f) => f.nota ?? '—' },
  ]
  const abierta = TRANSICIONES_APELACION[apelacion.estado].length > 0
  return (
    <Card variant="elevated">
      <CardHeader
        as="h3"
        title={NOMBRE_INSTANCIA[apelacion.instancia]}
        subtitle={`Presentada el ${fechaDia(apelacion.presentada)}${apelacion.numeroCaso ? ` · Expediente ${apelacion.numeroCaso}` : ''}`}
        actions={
          <span className="pt-en-linea">
            <Badge tone={TONO_APELACION[apelacion.estado]}>{NOMBRE_ESTADO_APELACION[apelacion.estado]}</Badge>
            {gestiona && abierta ? (
              <Button size="sm" variant="secondary" onClick={onEstado}>
                Cambiar estado
              </Button>
            ) : null}
          </span>
        }
      />
      <CardBody padding="sm">
        <div className="pt-pila pt-pila--chica">
          {apelacion.resolucion ? (
            <CardPairs
              pairs={[
                ['Resolución', fechaDia(apelacion.resolucion.fecha)],
                ['Resumen', <p key="r" className="pt-narrativa">{apelacion.resolucion.resumen}</p>],
              ]}
            />
          ) : null}
          <DataGrid<FilaApelacion> caption={`Historial de la apelación ${apelacion.numeroCaso ?? NOMBRE_INSTANCIA[apelacion.instancia]}`} columns={columnas} rows={filas} getRowId={(f) => f.id} />
        </div>
      </CardBody>
    </Card>
  )
}

// ── Diálogos ────────────────────────────────────────────────────────────────

function useCamposDe(error: unknown, id: string) {
  const errores = erroresDeCampos(error)
  return { errores, delForm: Object.fromEntries(Object.entries(errores).map(([k, m]) => [`${id}-${k}`, m])) }
}

function DialogoProrroga({ asiento, ahora, abierto, onCerrar }: { asiento: TAsiento; ahora: Date; abierto: boolean; onCerrar: () => void }) {
  const id = useId()
  const [justificacion, setJustificacion] = useState('')
  const [canal, setCanal] = useState('')
  const [fechaCom, setFechaCom] = useState<Date | null>(null)
  const [cargo, setCargo] = useState<Documento | null>(null)
  const guardar = useAccion()
  const { errores, delForm } = useCamposDe(guardar.error, id)

  useEffect(() => {
    if (!abierto) return
    setJustificacion('')
    setCanal('')
    setFechaCom(null)
    setCargo(null)
    guardar.limpiar()
  }, [abierto, guardar.limpiar])

  const nuevo = sumarDiasHabiles(asiento.venceOriginal, PLAZO_LEGAL_DIAS)
  const enviar = async () => {
    const hecho = await guardar.ejecutar(async () => {
      await api.prorrogar(asiento.id, { justificacion, canal, fechaComunicacion: fechaCom, cargo })
      return true
    })
    if (hecho) {
      toast({ message: `${asiento.codigo}: prórroga registrada. Nuevo vencimiento ${fechaDia(nuevo)}.`, tone: 'success' })
      onCerrar()
    }
  }
  return (
    <Dialog
      open={abierto}
      onOpenChange={(a) => (a ? undefined : onCerrar())}
      title={`Prórroga única · ${asiento.codigo}`}
      description="Se justifica y se comunica al consumidor antes del vencimiento original, con cargo."
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" form={`${id}-f`} loading={guardar.enCurso}>
            Registrar la prórroga
          </Button>
        </>
      }
    >
      <Form id={`${id}-f`} onSubmit={enviar} errors={delForm}>
        <Alert tone="warning" size="sm" title="Solo se permite una prórroga">
          <span className="pt-alerta__texto">
            Nuevo vencimiento: {fechaDia(nuevo)}. El original ({fechaDia(asiento.venceOriginal)}) se conserva en el historial.
          </span>
        </Alert>
        <FormField label="Justificación" id={`${id}-justificacion`} error={errores.justificacion} required>
          <Textarea rows={3} value={justificacion} onChange={(e) => setJustificacion(e.target.value)} maxLength={1000} showCounter />
        </FormField>
        <FormField label="Canal de comunicación al consumidor" id={`${id}-canal`} error={errores.canal} required>
          <Select value={canal} placeholder="Elige el canal" onChange={(e) => setCanal(e.target.value)} options={CANALES_PRORROGA.map((c) => ({ value: c, label: c }))} />
        </FormField>
        <div id={`${id}-fecha`}>
          <DatePicker
            label="Fecha de comunicación"
            value={fechaCom}
            onValueChange={setFechaCom}
            maxDate={ahora < asiento.venceOriginal ? ahora : asiento.venceOriginal}
            minDate={asiento.registrado}
            locale="es-PE"
            error={errores.fecha}
          />
        </div>
        <CampoPdf id={`${id}-cargo`} etiqueta="Cargo de la comunicación" requisitos="PDF de hasta 10 MB. Se guarda su huella SHA-256." documento={cargo} onCambio={setCargo} error={errores.cargo} />
        {guardar.error && !Object.keys(errores).length ? <AvisoDeError error={guardar.error} reintentar={enviar} /> : null}
      </Form>
    </Dialog>
  )
}

function CajonRespuesta({ asiento, ahora, abierto, onCerrar }: { asiento: TAsiento; ahora: Date; abierto: boolean; onCerrar: () => void }) {
  const id = useId()
  const [resumen, setResumen] = useState('')
  const [firmante, setFirmante] = useState<string>(FIRMANTES[0])
  const [carta, setCarta] = useState<Documento | null>(null)
  const [cargo, setCargo] = useState<Documento | null>(null)
  const [indecopi, setIndecopi] = useState(false)
  const guardar = useAccion()
  const { errores, delForm } = useCamposDe(guardar.error, id)

  useEffect(() => {
    if (!abierto) return
    setResumen('')
    setFirmante(FIRMANTES[0])
    setCarta(null)
    setCargo(null)
    setIndecopi(false)
    guardar.limpiar()
  }, [abierto, guardar.limpiar])

  const plazo = estadoPlazo(asiento, ahora)
  const enviar = async () => {
    const hecho = await guardar.ejecutar(async () => {
      await api.responderReclamo(asiento.id, { resumen, firmante, carta, cargo, derechoIndecopi: indecopi })
      return true
    })
    if (hecho) {
      toast({ message: `${asiento.codigo}: respuesta registrada con cargo.`, tone: 'success' })
      onCerrar()
    }
  }
  return (
    <Drawer
      open={abierto}
      onOpenChange={(a) => (a ? undefined : onCerrar())}
      title={`Respuesta formal · ${asiento.codigo}`}
      side="end"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" form={`${id}-f`} loading={guardar.enCurso}>
            Registrar la respuesta
          </Button>
        </>
      }
    >
      <Form id={`${id}-f`} onSubmit={enviar} errors={delForm}>
        {plazo.nivel === 'vencido' ? (
          <Alert tone="danger" size="sm" title="Fuera de plazo">
            <span className="pt-alerta__texto">El plazo venció el {fechaDia(plazo.vence)}: la respuesta quedará registrada como fuera de plazo.</span>
          </Alert>
        ) : (
          <p className="pt-texto-chico">Van {Math.max(0, diasHabilesEntre(asiento.registrado, ahora))} días hábiles desde el registro; vence el {fechaDia(plazo.vence)}.</p>
        )}
        <FormField label="Resumen de la respuesta" id={`${id}-resumen`} error={errores.resumen} required>
          <Textarea rows={4} value={resumen} onChange={(e) => setResumen(e.target.value)} maxLength={2000} showCounter />
        </FormField>
        <FormField label="Firmante" id={`${id}-firmante`} error={errores.firmante} required>
          <Select value={firmante} onChange={(e) => setFirmante(e.target.value)} options={FIRMANTES.map((p) => ({ value: p, label: `${nombrePersona(p)} · Responsable de reclamos` }))} />
        </FormField>
        <CampoPdf id={`${id}-carta`} etiqueta="Carta de respuesta firmada" requisitos="PDF de hasta 10 MB, con el número del reclamo." documento={carta} onCambio={setCarta} error={errores.carta} />
        <CampoPdf id={`${id}-cargo`} etiqueta="Cargo de recepción del consumidor" requisitos="PDF de hasta 10 MB. Sin cargo no es una respuesta válida ante INDECOPI." documento={cargo} onCambio={setCargo} error={errores.cargo} />
        <div id={`${id}-indecopi`}>
          <Checkbox label="Se informó al consumidor su derecho a acudir a INDECOPI" checked={indecopi} onChange={(e) => setIndecopi(e.target.checked)} invalid={Boolean(errores.indecopi)} />
          <ErrorMessage>{errores.indecopi ?? ''}</ErrorMessage>
        </div>
        <Supuesto>Firma la responsable legal para todas las razones sociales; la constancia del derecho a INDECOPI es obligatoria. Los PDF no salen del navegador.</Supuesto>
        {guardar.error && !Object.keys(errores).length ? <AvisoDeError error={guardar.error} reintentar={enviar} /> : null}
      </Form>
    </Drawer>
  )
}

function DialogoApelacion({ asiento, datos, abierto, onCerrar }: { asiento: TAsiento; datos: Datos; abierto: boolean; onCerrar: () => void }) {
  const ahora = datos.ahora
  const id = useId()
  const [instancia, setInstancia] = useState<Instancia | ''>('')
  const [caso, setCaso] = useState('')
  const [presentada, setPresentada] = useState<Date | null>(null)
  const guardar = useAccion()
  const { errores, delForm } = useCamposDe(guardar.error, id)

  useEffect(() => {
    if (!abierto) return
    setInstancia('')
    setCaso('')
    setPresentada(null)
    guardar.limpiar()
  }, [abierto, guardar.limpiar])

  const enviar = async () => {
    const hecho = await guardar.ejecutar(async () => {
      await api.registrarApelacion(asiento.id, { instancia, numeroCaso: caso, presentada })
      return true
    })
    if (hecho) {
      toast({ message: `${asiento.codigo}: apelación registrada como pendiente.`, tone: 'success' })
      onCerrar()
    }
  }
  return (
    <Dialog
      open={abierto}
      onOpenChange={(a) => (a ? undefined : onCerrar())}
      title={`Registrar apelación · ${asiento.codigo}`}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" form={`${id}-f`} loading={guardar.enCurso}>
            Registrar la apelación
          </Button>
        </>
      }
    >
      <Form id={`${id}-f`} onSubmit={enviar} errors={delForm}>
        <FormGroup legend="Instancia" error={errores.instancia}>
          {(['INTERNA', 'INDECOPI'] as const).map((i) => (
            <Radio
              key={i}
              name={`${id}-instancia`}
              value={i}
              label={NOMBRE_INSTANCIA[i]}
              disabled={!instanciaDisponible(datos, asiento, i)}
              helper={instanciaDisponible(datos, asiento, i) ? undefined : 'Ya se usó: la siguiente es INDECOPI.'}
              checked={instancia === i}
              onChange={() => setInstancia(i)}
            />
          ))}
        </FormGroup>
        <FormField label="Número de expediente" id={`${id}-caso`} error={errores.caso} optional={instancia !== 'INDECOPI'} required={instancia === 'INDECOPI'} helper="Obligatorio ante INDECOPI.">
          <Input value={caso} onChange={(e) => setCaso(e.target.value)} />
        </FormField>
        <div id={`${id}-presentada`}>
          <DatePicker label="Fecha de presentación" value={presentada} onValueChange={setPresentada} maxDate={ahora} locale="es-PE" error={errores.presentada} />
        </div>
        {guardar.error && !Object.keys(errores).length ? <AvisoDeError error={guardar.error} reintentar={enviar} /> : null}
      </Form>
    </Dialog>
  )
}

function DialogoEstadoApelacion({ apelacion, ahora, onCerrar }: { apelacion: Apelacion | null; ahora: Date; onCerrar: () => void }) {
  const id = useId()
  const [destino, setDestino] = useState<EstadoApelacion | ''>('')
  const [caso, setCaso] = useState('')
  const [fechaRes, setFechaRes] = useState<Date | null>(null)
  const [resumen, setResumen] = useState('')
  const [nota, setNota] = useState('')
  const guardar = useAccion()
  const { errores, delForm } = useCamposDe(guardar.error, id)

  useEffect(() => {
    if (!apelacion) return
    setDestino('')
    setCaso(apelacion.numeroCaso ?? '')
    setFechaRes(null)
    setResumen('')
    setNota('')
    guardar.limpiar()
  }, [apelacion, guardar.limpiar])

  if (!apelacion) return null
  const enviar = async () => {
    if (!destino) return
    const hecho = await guardar.ejecutar(async () => {
      await api.cambiarEstadoApelacion(apelacion.id, destino, { numeroCaso: caso, fechaResolucion: fechaRes, resumen, nota })
      return true
    })
    if (hecho) {
      toast({ message: `Apelación: ${NOMBRE_ESTADO_APELACION[apelacion.estado]} → ${NOMBRE_ESTADO_APELACION[destino]}.`, tone: 'success' })
      onCerrar()
    }
  }
  return (
    <Dialog
      open
      onOpenChange={(a) => (a ? undefined : onCerrar())}
      title="Cambiar estado de la apelación"
      description={`${NOMBRE_INSTANCIA[apelacion.instancia]} · estado actual: ${NOMBRE_ESTADO_APELACION[apelacion.estado]}. Cada cambio queda en su historial.`}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" form={`${id}-f`} loading={guardar.enCurso} disabled={!destino}>
            {destino ? `Pasar a ${NOMBRE_ESTADO_APELACION[destino]}` : 'Elige un estado'}
          </Button>
        </>
      }
    >
      <Form id={`${id}-f`} onSubmit={enviar} errors={delForm}>
        <FormGroup legend="Nuevo estado">
          {TRANSICIONES_APELACION[apelacion.estado].map((e) => (
            <Radio
              key={e}
              name={`${id}-estado`}
              value={e}
              label={NOMBRE_ESTADO_APELACION[e]}
              helper={e === 'WITHDRAWN' ? 'Cierra la apelación: esta respuesta ya no se podrá volver a apelar.' : undefined}
              checked={destino === e}
              onChange={() => setDestino(e)}
            />
          ))}
        </FormGroup>
        {destino && esResolucion(destino) ? (
          <>
            {apelacion.instancia === 'INDECOPI' ? (
              <FormField label="Número de expediente de INDECOPI" id={`${id}-caso`} error={errores.caso} required>
                <Input value={caso} onChange={(e) => setCaso(e.target.value)} />
              </FormField>
            ) : null}
            <div id={`${id}-fecha`}>
              <DatePicker label="Fecha de la resolución" value={fechaRes} onValueChange={setFechaRes} maxDate={ahora} locale="es-PE" error={errores.fecha} />
            </div>
            <FormField label="Resumen de la resolución" id={`${id}-resumen`} error={errores.resumen} required>
              <Textarea rows={3} value={resumen} onChange={(e) => setResumen(e.target.value)} maxLength={1000} />
            </FormField>
          </>
        ) : null}
        <FormField label="Nota" optional>
          <Textarea rows={2} value={nota} onChange={(e) => setNota(e.target.value)} maxLength={300} />
        </FormField>
        {guardar.error && !Object.keys(errores).length ? <AvisoDeError error={guardar.error} reintentar={enviar} /> : null}
      </Form>
    </Dialog>
  )
}
