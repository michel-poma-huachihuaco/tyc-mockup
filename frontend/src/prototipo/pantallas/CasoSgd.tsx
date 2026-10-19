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
  Dialog,
  EmptyState,
  ErrorPage,
  FileItem,
  Form,
  FormField,
  FormGroup,
  Header,
  Icon,
  Input,
  Radio,
  Skeleton,
  Stepper,
  Tag,
  Textarea,
  toast,
} from '@aybarcorp/ui'
import type { GridColumn } from '@aybarcorp/ui'
import { useEffect, useId, useState } from 'react'
import { CRITERIOS_RIESGO, DIAS_LIMBO, ESTADOS_CIERRE_SGD, NIVELES_ESCALAMIENTO, NOMBRE_NIVEL_RIESGO, lineaSgd, nivelDeRiesgo, nombrePersona } from '../datos/catalogos.ts'
import type { EstadoCierreSgd } from '../datos/catalogos.ts'
import { cliente, dniEnmascarado } from '../datos/clientes.ts'
import { AvisoDeError, CampoPdf, Prohibido, Supuesto, erroresDeCampos, fecha, fechaDia, irA, useAccion, useCarga } from '../comun.tsx'
import { hrefDe } from '../rutas.ts'
import { api, useConsola, useSesion } from '../servicio/api.ts'
import { casoDe, diasSinActivar, evidenciasDelHilo, puntajeDe } from '../servicio/mesa.ts'
import type { Caso, Escalamiento, FilaCaso, FilaRiesgo } from '../servicio/mesa.ts'
import type { Documento } from '../servicio/libro.ts'
import { puede } from '../servicio/nucleo.ts'
import type { Datos } from '../servicio/nucleo.ts'
import { BadgeEstadoCaso, BadgeRiesgo, BadgeSlaLinea, TONO_RIESGO } from './Mesa.tsx'

const destinatario = (x: string) => (x.startsWith('p-') ? nombrePersona(x) : x)

/** Ficha del caso sensible — HU-ATC-020 a 025. */
export default function CasoSgd({ casoId }: { casoId: string }) {
  const sesion = useSesion()
  const { datos } = useConsola()
  const [carga, reintentar] = useCarga(`caso-${casoId}`)
  const [dialogo, setDialogo] = useState<'cerrar' | 'reclasificar' | 'evidencia' | null>(null)
  const cargo = useAccion()
  const c = casoDe(datos, casoId)

  if (!puede.verMesa(sesion.rol)) {
    return (
      <div className="pt-pagina">
        <Header title="Caso sensible" />
        <Prohibido requiere="Mesa de Casos SGD o Legal" recurso="ver los casos sensibles" />
      </div>
    )
  }
  const migas = (actual: string) => <Breadcrumb items={[{ label: 'Mesa de Casos SGD', href: hrefDe('mesa') }, { label: actual }]} />
  if (carga.fase === 'cargando') {
    return (
      <div className="pt-pagina pt-pagina--ancha" aria-busy="true">
        <Header title="Caso sensible" loading />
        <Skeleton variant="block" height="20rem" />
      </div>
    )
  }
  if (carga.fase === 'error') {
    return (
      <div className="pt-pagina">
        <Header title="Caso sensible" breadcrumb={migas('Caso')} />
        <AvisoDeError error={carga.error} reintentar={reintentar} titulo="No se pudo cargar el caso" />
      </div>
    )
  }
  if (!c) {
    return (
      <div className="pt-pagina">
        <ErrorPage
          status={404}
          scope="page"
          title="Ese caso no existe"
          description="Puede que el enlace sea de otra sesión del prototipo (los datos se reinician al recargar)."
          actions={
            <Button variant="primary" onClick={() => irA(hrefDe('mesa'))}>
              Volver a la Mesa
            </Button>
          }
        />
      </div>
    )
  }

  const opera = puede.operarMesa(sesion.rol)
  const principal = c.vinculadoA ? casoDe(datos, c.vinculadoA) : null
  const origen = c.origenId ? casoDe(datos, c.origenId) : null
  const destino = c.estado === 'RECLASIFICADO' ? datos.casos.find((x) => x.origenId === c.id) : null
  const ticket = c.ticketId ? datos.tickets.find((t) => t.id === c.ticketId) : null
  const cl = cliente(c.clienteId)
  const sinActivar = diasSinActivar(c, datos.ahora)

  const emitir = async (accion: 'previo' | 'activar') => {
    const ok = await cargo.ejecutar(async () => {
      await (accion === 'previo' ? api.emitirCargoPrevio(c.id) : api.activarCaso(c.id))
      return true
    })
    if (ok)
      toast({
        message: accion === 'previo' ? `${c.codigo}: cargo previo emitido. El SLA de línea todavía no corre.` : `${c.codigo}: caso activado. El SLA de línea corre desde ahora.`,
        tone: 'success',
      })
  }

  const acciones = opera ? (
    <>
      {c.linea === 'LEGAL_ATIENDE' && (c.estado === 'REGISTRADO' || c.estado === 'ACTIVO') ? (
        <Button variant="secondary" onClick={() => setDialogo('reclasificar')}>
          Reclasificar a reclamo formal
        </Button>
      ) : null}
      {c.estado === 'REGISTRADO' && !c.cargoPrevio ? (
        <Button variant="primary" loading={cargo.enCurso} onClick={() => emitir('previo')}>
          Emitir cargo previo
        </Button>
      ) : c.estado === 'REGISTRADO' ? (
        <Button variant="primary" loading={cargo.enCurso} onClick={() => emitir('activar')}>
          Emitir cargo de activación
        </Button>
      ) : c.estado === 'ACTIVO' ? (
        <Button variant="primary" onClick={() => setDialogo('cerrar')}>
          Cerrar el caso
        </Button>
      ) : null}
    </>
  ) : undefined

  return (
    <div className="pt-pagina pt-pagina--ancha">
      <Header
        title={`${c.codigo} · ${lineaSgd(c.linea).nombre}`}
        breadcrumb={migas(c.codigo)}
        meta={
          <span className="pt-en-linea">
            <BadgeEstadoCaso estado={c.estado} />
            {c.estado === 'REGISTRADO' || c.estado === 'ACTIVO' ? <BadgeSlaLinea caso={c} ahora={datos.ahora} /> : null}
            <BadgeRiesgo caso={c} />
          </span>
        }
        description={`${cl?.nombre ?? '—'}${ticket ? ` · ticket ${ticket.numero}` : ''}`}
        actions={acciones}
      />
      {cargo.error ? <AvisoDeError error={cargo.error} /> : null}
      {!opera ? (
        <Alert tone="info" size="sm" title="Solo lectura">
          <span className="pt-alerta__texto">Los casos los opera la Mesa de Casos SGD.</span>
        </Alert>
      ) : null}
      {principal ? (
        <Alert tone="info" size="sm" title={`Vinculado a ${principal.codigo}`}>
          <span className="pt-alerta__texto">
            No es un caso independiente: se gestiona en el hilo de evidencia de{' '}
            <a className="pt-tarjeta__numero" href={hrefDe(`mesa/${principal.id}`)}>
              {principal.codigo}
            </a>
            .
          </span>
        </Alert>
      ) : null}
      {destino ? (
        <Alert tone="info" size="sm" title="Reclasificado">
          <span className="pt-alerta__texto">
            Continúa como reclamo formal en{' '}
            <a className="pt-tarjeta__numero" href={hrefDe(`mesa/${destino.id}`)}>
              {destino.codigo}
            </a>
            .
          </span>
        </Alert>
      ) : null}
      {origen ? (
        <Alert tone="info" size="sm" title={`Viene de ${origen.codigo}`}>
          <span className="pt-alerta__texto">
            Reclasificado desde Legal Atiende; la trazabilidad del origen se conserva en{' '}
            <a className="pt-tarjeta__numero" href={hrefDe(`mesa/${origen.id}`)}>
              {origen.codigo}
            </a>
            .
          </span>
        </Alert>
      ) : null}
      {c.estado === 'REGISTRADO' && sinActivar > DIAS_LIMBO ? (
        <Alert tone="danger" size="sm" title="En limbo">
          <span className="pt-alerta__texto">Cargo previo sin activar hace {sinActivar} días hábiles: el SLA de línea no corre hasta el cargo de activación.</span>
        </Alert>
      ) : null}

      <div className="pt-dos-columnas">
        <div className="pt-pila">
          <Card>
            <CardHeader as="h2" title="Caso" />
            <CardBody padding="sm">
              <CardPairs
                pairs={[
                  ['Línea de ingreso', lineaSgd(c.linea).nombre],
                  ['Cliente', cl ? `${cl.nombre} · DNI ${dniEnmascarado(cl.dni)}` : '—'],
                  [
                    'Ticket',
                    ticket ? (
                      <a key="t" className="pt-tarjeta__numero" href={hrefDe(`ticket/${ticket.id}`)}>
                        {ticket.numero}
                      </a>
                    ) : (
                      'Sin ticket'
                    ),
                  ],
                  ['Hechos', <p key="h" className="pt-narrativa">{c.resumen}</p>],
                  ['Registrado', `${fecha(c.registrado)} · ${nombrePersona(c.autor)}`],
                  ...(c.justificacionIndependiente ? ([['Independiente porque', c.justificacionIndependiente]] as Array<[string, string]>) : []),
                ]}
              />
            </CardBody>
          </Card>
          {c.estado !== 'VINCULADO' && c.estado !== 'RECLASIFICADO' ? <MatrizRiesgo caso={c} datos={datos} opera={opera} /> : null}
          <HiloEvidencia caso={c} datos={datos} opera={opera} onAgregar={() => setDialogo('evidencia')} />
          {c.cierre ? <Cierre caso={c} /> : null}
        </div>
        <aside className="pt-lateral" aria-label="Cargos, SLA y escalamiento">
          <Card>
            <CardHeader as="h2" title="Cargos y SLA de línea" />
            <CardBody padding="sm">
              <CardPairs
                pairs={[
                  ['Cargo previo', c.cargoPrevio ? `${fecha(c.cargoPrevio.fecha)} · ${nombrePersona(c.cargoPrevio.autor)}` : 'Pendiente'],
                  ['Cargo de activación', c.activacion ? `${fecha(c.activacion.fecha)} · ${nombrePersona(c.activacion.autor)}` : 'Pendiente'],
                  ['SLA de línea', `${lineaSgd(c.linea).slaDias} días hábiles`],
                  ['Vence', c.venceSla ? fechaDia(c.venceSla) : 'Corre desde la activación'],
                ]}
              />
            </CardBody>
          </Card>
          <Escalera caso={c} filas={datos.escalamientos.filter((e) => e.casoId === c.id)} />
          <Trazabilidad filas={datos.filasCaso.filter((f) => f.casoId === c.id)} />
        </aside>
      </div>

      <DialogoCerrar caso={c} abierto={dialogo === 'cerrar'} onCerrar={() => setDialogo(null)} />
      <DialogoReclasificar caso={c} abierto={dialogo === 'reclasificar'} onCerrar={() => setDialogo(null)} />
      <DialogoEvidencia caso={c} abierto={dialogo === 'evidencia'} onCerrar={() => setDialogo(null)} />
    </div>
  )
}

// ── Riesgo (HU-ATC-022) ─────────────────────────────────────────────────────

function MatrizRiesgo({ caso, datos, opera }: { caso: Caso; datos: Datos; opera: boolean }) {
  const id = useId()
  const [criterios, setCriterios] = useState<string[]>([...(caso.riesgo?.criterios ?? [])])
  const [motivo, setMotivo] = useState('')
  const guardar = useAccion()
  useEffect(() => {
    setCriterios([...(caso.riesgo?.criterios ?? [])])
    setMotivo('')
  }, [caso.riesgo])
  const puntaje = puntajeDe(criterios)
  const nivel = nivelDeRiesgo(puntaje)
  const errores = erroresDeCampos(guardar.error)
  const editable = opera && caso.estado === 'ACTIVO'
  const filas = datos.filasRiesgo.filter((f) => f.casoId === caso.id)
  const columnas: GridColumn<FilaRiesgo>[] = [
    { key: 'fecha', header: 'Cuándo', width: '8rem', renderCell: (f) => fecha(f.fecha) },
    { key: 'autor', header: 'Quién', width: '8rem', renderCell: (f) => nombrePersona(f.autor) },
    { key: 'nivel', header: 'Nivel', width: '9rem', renderCell: (f) => `${NOMBRE_NIVEL_RIESGO[f.nivel]} (${f.puntaje})` },
    { key: 'motivo', header: 'Por qué', renderCell: (f) => f.motivo },
  ]
  const enviar = async () => {
    const ok = await guardar.ejecutar(async () => {
      await api.clasificarRiesgo(caso.id, criterios, motivo)
      return true
    })
    if (ok) toast({ message: `${caso.codigo}: riesgo ${NOMBRE_NIVEL_RIESGO[nivel].toLowerCase()} (${puntaje}). Queda en el historial.`, tone: 'success' })
  }
  return (
    <Card>
      <CardHeader
        as="h2"
        title="Matriz de riesgo"
        subtitle="El nivel sale de los criterios marcados; no hay campo de opinión."
        actions={
          <Badge tone={TONO_RIESGO[nivel]} dot>
            {NOMBRE_NIVEL_RIESGO[nivel]} · {puntaje} puntos
          </Badge>
        }
      />
      <CardBody padding="sm">
        <Form id={`${id}-f`} onSubmit={enviar} errors={Object.fromEntries(Object.entries(errores).map(([k, m]) => [`${id}-${k}`, m]))}>
          {caso.estado === 'REGISTRADO' ? <p className="pt-texto-chico">El riesgo se clasifica cuando el caso está activado.</p> : null}
          <FormGroup legend="Criterios" error={errores.criterios}>
            {CRITERIOS_RIESGO.map((k) => (
              <Checkbox
                key={k.id}
                label={`${k.nombre} (${k.peso} puntos)`}
                checked={criterios.includes(k.id)}
                disabled={!editable}
                onChange={(e) => setCriterios((l) => (e.target.checked ? [...l, k.id] : l.filter((x) => x !== k.id)))}
              />
            ))}
          </FormGroup>
          {editable && caso.riesgo ? (
            <FormField label="Por qué se recalibra" id={`${id}-motivo`} error={errores.motivo} required>
              <Textarea rows={2} value={motivo} onChange={(e) => setMotivo(e.target.value)} maxLength={500} />
            </FormField>
          ) : null}
          {editable ? (
            <div className="pt-acciones">
              <Button type="submit" variant="secondary" loading={guardar.enCurso}>
                {caso.riesgo ? 'Registrar la recalibración' : 'Registrar la clasificación'}
              </Button>
            </div>
          ) : null}
          {guardar.error && !Object.keys(errores).length ? <AvisoDeError error={guardar.error} reintentar={enviar} /> : null}
        </Form>
        {filas.length ? <DataGrid<FilaRiesgo> caption="Historial del riesgo" columns={columnas} rows={[...filas].reverse()} getRowId={(f) => f.id} /> : null}
        <Supuesto>Pesos y umbrales ilustrativos: muy alto desde 60 puntos, alto desde 40, medio desde 20 (pregunta abierta de FT-ATC-08).</Supuesto>
      </CardBody>
    </Card>
  )
}

// ── Escalamiento (HU-ATC-023) y trazabilidad ────────────────────────────────

function Escalera({ caso, filas }: { caso: Caso; filas: Escalamiento[] }) {
  return (
    <Card>
      <CardHeader as="h2" title="Escalamiento en cadena" />
      <CardBody padding="sm">
        <div className="pt-pila pt-pila--chica">
          {caso.nivelEscalamiento ? (
            <Stepper
              label="Escalera de escalamiento"
              orientation="vertical"
              size="sm"
              steps={NIVELES_ESCALAMIENTO.map((n) => ({ id: String(n.nivel), label: n.nombre }))}
              current={caso.nivelEscalamiento - 1}
            />
          ) : (
            <ol className="pt-lista-simple pt-texto-chico">
              {NIVELES_ESCALAMIENTO.map((n) => (
                <li key={n.nivel}>
                  {n.nivel}. {n.nombre}
                </li>
              ))}
            </ol>
          )}
          <p className="pt-texto-chico">
            {caso.nivelEscalamiento === 0
              ? 'Sin escalamiento.'
              : caso.estado === 'CERRADO'
                ? `La cadena se detuvo en «${NIVELES_ESCALAMIENTO[caso.nivelEscalamiento - 1].nombre}» al cerrar el caso.`
                : `Nivel actual: ${NIVELES_ESCALAMIENTO[caso.nivelEscalamiento - 1].nombre}. Sin saltos (RN-SVC-017).`}
          </p>
          {filas.length ? (
            <ul className="pt-lista-simple">
              {filas.map((e) => (
                <li key={e.id} className="pt-texto-chico">
                  <strong>{e.nivel}. {e.nombre}</strong> · {fecha(e.fecha)} · {destinatario(e.destinatario)}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </CardBody>
    </Card>
  )
}

const NOMBRE_EVENTO: Record<string, string> = {
  REGISTRO: 'Registro',
  CARGO_PREVIO: 'Cargo previo',
  CARGO_ACTIVACION: 'Cargo de activación',
  VINCULADO: 'Vinculado',
  CASO_VINCULADO: 'Caso vinculado a este',
  INDEPENDIENTE_JUSTIFICADO: 'Independiente (justificado)',
  RECLASIFICADO: 'Reclasificado',
  CIERRE: 'Cierre',
}

function Trazabilidad({ filas }: { filas: FilaCaso[] }) {
  const columnas: GridColumn<FilaCaso>[] = [
    { key: 'fecha', header: 'Fecha', width: '8rem', renderCell: (f) => fecha(f.fecha) },
    {
      key: 'evento',
      header: 'Evento',
      renderCell: (f) => (
        <span className="pt-celda-doble">
          <span className="pt-celda-doble__principal">{NOMBRE_EVENTO[f.evento] ?? f.evento}</span>
          {f.detalle ? <span className="pt-celda-doble__secundaria">{f.detalle}</span> : null}
        </span>
      ),
    },
    { key: 'autor', header: 'Quién', width: '8rem', renderCell: (f) => nombrePersona(f.autor) },
  ]
  return (
    <Card>
      <CardHeader as="h2" title="Trazabilidad" />
      <CardBody padding="sm">
        <DataGrid<FilaCaso> caption="Trazabilidad del caso" columns={columnas} rows={[...filas].reverse()} getRowId={(f) => f.id} />
      </CardBody>
    </Card>
  )
}

// ── Evidencia y cierre (HU-ATC-024, 025) ────────────────────────────────────

function HiloEvidencia({ caso, datos, opera, onAgregar }: { caso: Caso; datos: Datos; opera: boolean; onAgregar: () => void }) {
  const hilo = evidenciasDelHilo(datos, caso)
  const principal = caso.vinculadoA ? casoDe(datos, caso.vinculadoA) : caso
  const vinculados = datos.casos.filter((x) => x.vinculadoA === (principal?.id ?? caso.id))
  return (
    <Card>
      <CardHeader
        as="h2"
        title="Hilo de evidencia"
        subtitle={vinculados.length ? `Compartido con ${vinculados.map((v) => v.codigo).join(', ')}` : 'Un solo hilo por caso y sus vinculados.'}
        actions={
          opera && caso.estado !== 'CERRADO' && caso.estado !== 'RECLASIFICADO' ? (
            <Button size="sm" variant="secondary" onClick={onAgregar}>
              Agregar evidencia
            </Button>
          ) : undefined
        }
      />
      <CardBody padding="sm">
        {hilo.length ? (
          <ul className="pt-lista-simple">
            {[...hilo].reverse().map((e) => (
              <li key={e.id}>
                <Card variant="elevated">
                  <CardBody padding="sm">
                    <div className="pt-pila pt-pila--chica">
                      <p className="pt-texto">
                        <strong>{e.descripcion}</strong>
                      </p>
                      <p className="pt-texto-chico">
                        {fecha(e.fecha)} · {nombrePersona(e.autor)} · desde {casoDe(datos, e.casoId)?.codigo ?? e.casoId}
                      </p>
                      {e.documento ? (
                        <ul className="pt-adjuntos">
                          <FileItem name={e.documento.nombre} size={e.documento.tamano} type="application/pdf" status="ready" />
                        </ul>
                      ) : null}
                      {e.gli ? (
                        <Tag size="sm" variant="outline">
                          <Icon name="lock" size={16} /> Original en custodia del GLI · {e.gli}
                        </Tag>
                      ) : null}
                    </div>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState size="compact" title="Sin evidencia" description="Agrega copias o referencias del GLI a medida que lleguen." />
        )}
      </CardBody>
    </Card>
  )
}

function Cierre({ caso }: { caso: Caso }) {
  const k = caso.cierre
  if (!k) return null
  return (
    <Card>
      <CardHeader as="h2" title="Cierre" />
      <CardBody padding="sm">
        <CardPairs
          pairs={[
            ['Estado homologado', ESTADOS_CIERRE_SGD.find((x) => x.id === k.estado)?.nombre ?? k.estado],
            ['Fecha', `${fecha(k.fecha)} · ${nombrePersona(k.autor)}`],
            [
              'Evidencia',
              <ul key="e" className="pt-adjuntos">
                <FileItem name={k.evidencia.nombre} size={k.evidencia.tamano} type="application/pdf" status="ready" />
              </ul>,
            ],
            ['Custodia', k.gli ? `Original en el Repositorio Legal (GLI): ${k.gli}. La plataforma solo guarda la referencia.` : 'Sin original crítico'],
            ...(k.nota ? ([['Nota', k.nota]] as Array<[string, string]>) : []),
          ]}
        />
      </CardBody>
    </Card>
  )
}

function DialogoCerrar({ caso, abierto, onCerrar }: { caso: Caso; abierto: boolean; onCerrar: () => void }) {
  const id = useId()
  const [estado, setEstado] = useState<EstadoCierreSgd | ''>('')
  const [evidencia, setEvidencia] = useState<Documento | null>(null)
  const [critico, setCritico] = useState(false)
  const [gli, setGli] = useState('')
  const [nota, setNota] = useState('')
  const guardar = useAccion()
  useEffect(() => {
    if (!abierto) return
    setEstado('')
    setEvidencia(null)
    setCritico(false)
    setGli('')
    setNota('')
    guardar.limpiar()
  }, [abierto, guardar.limpiar])
  const errores = erroresDeCampos(guardar.error)
  const enviar = async () => {
    const ok = await guardar.ejecutar(async () => {
      await api.cerrarCaso(caso.id, { estado, evidencia, critico, gli, nota })
      return true
    })
    if (ok) {
      toast({ message: `${caso.codigo} cerrado.${caso.nivelEscalamiento ? ' La cadena de escalamiento se detiene.' : ''}`, tone: 'success' })
      onCerrar()
    }
  }
  return (
    <Dialog
      open={abierto}
      onOpenChange={(a) => (a ? undefined : onCerrar())}
      title={`Cerrar ${caso.codigo}`}
      description="Un estado homologado y la evidencia del cierre. Sin evidencia no hay cierre."
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" form={`${id}-f`} loading={guardar.enCurso}>
            Cerrar el caso
          </Button>
        </>
      }
    >
      <Form id={`${id}-f`} onSubmit={enviar} errors={Object.fromEntries(Object.entries(errores).map(([k, m]) => [`${id}-${k}`, m]))}>
        <FormGroup legend="Estado homologado" error={errores.estado}>
          <div id={`${id}-estado`}>
            {ESTADOS_CIERRE_SGD.map((x) => (
              <Radio key={x.id} name={`${id}-e`} value={x.id} label={x.nombre} checked={estado === x.id} onChange={() => setEstado(x.id)} />
            ))}
          </div>
        </FormGroup>
        <CampoPdf id={`${id}-evidencia`} etiqueta="Evidencia del cierre" requisitos="PDF de hasta 10 MB. Obligatoria." documento={evidencia} onCambio={setEvidencia} error={errores.evidencia} />
        <Checkbox label="Hay un original probatorio crítico" helper="Su custodia está en el Repositorio Legal Controlado (GLI); aquí solo va la referencia." checked={critico} onChange={(e) => setCritico(e.target.checked)} />
        {critico ? (
          <FormField label="Referencia del original en el GLI" id={`${id}-gli`} error={errores.gli} required helper="Formato GLI-2026-000000.">
            <Input value={gli} onChange={(e) => setGli(e.target.value)} />
          </FormField>
        ) : null}
        <FormField label="Nota" optional>
          <Textarea rows={2} value={nota} onChange={(e) => setNota(e.target.value)} maxLength={500} />
        </FormField>
        {guardar.error && !Object.keys(errores).length ? <AvisoDeError error={guardar.error} reintentar={enviar} /> : null}
      </Form>
    </Dialog>
  )
}

function DialogoReclasificar({ caso, abierto, onCerrar }: { caso: Caso; abierto: boolean; onCerrar: () => void }) {
  const id = useId()
  const [motivo, setMotivo] = useState('')
  const guardar = useAccion()
  useEffect(() => {
    if (!abierto) return
    setMotivo('')
    guardar.limpiar()
  }, [abierto, guardar.limpiar])
  const errores = erroresDeCampos(guardar.error)
  const enviar = async () => {
    const nuevo = await guardar.ejecutar(() => api.reclasificarCaso(caso.id, motivo))
    if (nuevo) {
      toast({ message: `${caso.codigo} pasa a reclamo formal como ${nuevo.codigo}.`, tone: 'success' })
      onCerrar()
      irA(hrefDe(`mesa/${nuevo.id}`))
    }
  }
  return (
    <Dialog
      open={abierto}
      onOpenChange={(a) => (a ? undefined : onCerrar())}
      title="Reclasificar a reclamo formal"
      description="El caso preventivo se re-registra en la línea del Libro de Reclamaciones con un Código Único nuevo; el origen queda enlazado."
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" form={`${id}-f`} loading={guardar.enCurso}>
            Reclasificar
          </Button>
        </>
      }
    >
      <Form id={`${id}-f`} onSubmit={enviar} errors={errores.motivo ? { [`${id}-m`]: errores.motivo } : {}}>
        <FormField label="Por qué no se resolvió en la vía preventiva" id={`${id}-m`} error={errores.motivo} required>
          <Textarea rows={3} value={motivo} onChange={(e) => setMotivo(e.target.value)} maxLength={500} />
        </FormField>
        {guardar.error && !errores.motivo ? <AvisoDeError error={guardar.error} /> : null}
      </Form>
    </Dialog>
  )
}

function DialogoEvidencia({ caso, abierto, onCerrar }: { caso: Caso; abierto: boolean; onCerrar: () => void }) {
  const id = useId()
  const [descripcion, setDescripcion] = useState('')
  const [documento, setDocumento] = useState<Documento | null>(null)
  const [gli, setGli] = useState('')
  const guardar = useAccion()
  useEffect(() => {
    if (!abierto) return
    setDescripcion('')
    setDocumento(null)
    setGli('')
    guardar.limpiar()
  }, [abierto, guardar.limpiar])
  const errores = erroresDeCampos(guardar.error)
  const enviar = async () => {
    const ok = await guardar.ejecutar(async () => {
      await api.agregarEvidencia(caso.id, { descripcion, documento, gli })
      return true
    })
    if (ok) {
      toast({ message: 'Evidencia agregada al hilo.', tone: 'success' })
      onCerrar()
    }
  }
  return (
    <Dialog
      open={abierto}
      onOpenChange={(a) => (a ? undefined : onCerrar())}
      title="Agregar evidencia"
      description="Va al hilo del caso principal: lo comparten todos los casos vinculados."
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" form={`${id}-f`} loading={guardar.enCurso}>
            Agregar
          </Button>
        </>
      }
    >
      <Form id={`${id}-f`} onSubmit={enviar} errors={Object.fromEntries(Object.entries(errores).map(([k, m]) => [`${id}-${k}`, m]))}>
        <FormField label="Descripción" id={`${id}-descripcion`} error={errores.descripcion} required>
          <Input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        </FormField>
        <CampoPdf id={`${id}-documento`} etiqueta="Copia (PDF)" requisitos="Opcional si indicas la referencia del GLI." documento={documento} onCambio={setDocumento} error={errores.documento} />
        <FormField label="Referencia del original en el GLI" id={`${id}-gli`} error={errores.gli} optional helper="Formato GLI-2026-000000.">
          <Input value={gli} onChange={(e) => setGli(e.target.value)} />
        </FormField>
        {guardar.error && !Object.keys(errores).length ? <AvisoDeError error={guardar.error} reintentar={enviar} /> : null}
      </Form>
    </Dialog>
  )
}
