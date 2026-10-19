import {
  Alert,
  Badge,
  Breadcrumb,
  Button,
  Card,
  CardBody,
  Checkbox,
  Combobox,
  DataGrid,
  Drawer,
  EmptyState,
  Form,
  FormField,
  Header,
  Icon,
  Select,
  StatGroup,
  Tabs,
  Textarea,
  toast,
} from '@aybarcorp/ui'
import type { GridColumn } from '@aybarcorp/ui'
import { useEffect, useId, useMemo, useState } from 'react'
import { LINEAS_SGD, NIVELES_ESCALAMIENTO, NOMBRE_NIVEL_RIESGO, lineaSgd, nombrePersona } from '../datos/catalogos.ts'
import type { LineaSgd, NivelRiesgo } from '../datos/catalogos.ts'
import { buscarEnMaestro, cliente, dniEnmascarado } from '../datos/clientes.ts'
import { AvisoDeError, Prohibido, Supuesto, erroresDeCampos, fecha, fechaDia, irA, useAccion, useCarga } from '../comun.tsx'
import { hrefDe } from '../rutas.ts'
import { api, useConsola, useSesion } from '../servicio/api.ts'
import { coincidencias, diasDesdeVencimiento, diasSinActivar, enLimbo } from '../servicio/mesa.ts'
import type { Caso, EstadoCaso, Escalamiento } from '../servicio/mesa.ts'
import { ErrorSimulado, puede } from '../servicio/nucleo.ts'
import type { Datos } from '../servicio/nucleo.ts'

type Pestana = 'casos' | 'limbo' | 'escalamientos'
type Tono = 'neutral' | 'info' | 'success' | 'warning' | 'danger'

export const NOMBRE_ESTADO_CASO: Record<EstadoCaso, string> = {
  REGISTRADO: 'Registrado',
  ACTIVO: 'Activo',
  CERRADO: 'Cerrado',
  RECLASIFICADO: 'Reclasificado',
  VINCULADO: 'Vinculado',
}
const TONO_ESTADO_CASO: Record<EstadoCaso, Tono> = { REGISTRADO: 'warning', ACTIVO: 'info', CERRADO: 'neutral', RECLASIFICADO: 'neutral', VINCULADO: 'neutral' }
export const TONO_RIESGO: Record<NivelRiesgo, Tono> = { BAJO: 'success', MEDIO: 'info', ALTO: 'warning', MUY_ALTO: 'danger' }

export function BadgeEstadoCaso({ estado }: { estado: EstadoCaso }) {
  return (
    <Badge tone={TONO_ESTADO_CASO[estado]} size="sm">
      {NOMBRE_ESTADO_CASO[estado]}
    </Badge>
  )
}

export function BadgeRiesgo({ caso }: { caso: Caso }) {
  if (!caso.riesgo) return <span className="pt-texto-chico">Sin clasificar</span>
  return (
    <Badge tone={TONO_RIESGO[caso.riesgo.nivel]} size="sm" dot>
      Riesgo {NOMBRE_NIVEL_RIESGO[caso.riesgo.nivel].toLowerCase()} ({caso.riesgo.puntaje})
    </Badge>
  )
}

/** El SLA de línea en palabras: sin iniciar, en limbo, cuánto queda o cuánto lleva vencido. */
export function BadgeSlaLinea({ caso, ahora }: { caso: Caso; ahora: Date }) {
  if (caso.estado === 'CERRADO') return <span className="pt-texto-chico">Cerrado</span>
  if (caso.estado === 'VINCULADO' || caso.estado === 'RECLASIFICADO') return <span className="pt-texto-chico">—</span>
  if (!caso.activacion) {
    const enLimbo = diasSinActivar(caso, ahora) > 2
    return (
      <Badge tone={enLimbo ? 'danger' : 'neutral'} size="sm">
        {enLimbo ? 'En limbo' : 'Sin iniciar'}
      </Badge>
    )
  }
  const x = diasDesdeVencimiento(caso, ahora) as number
  const tono: Tono = x > 0 || (x === 0 && ahora > (caso.venceSla as Date)) ? 'danger' : x >= -2 ? 'warning' : 'success'
  const texto = x > 0 ? `Vencido hace ${x} ${x === 1 ? 'día hábil' : 'días hábiles'}` : x === 0 ? 'Vence hoy' : `Quedan ${-x} ${x === -1 ? 'día hábil' : 'días hábiles'}`
  return (
    <Badge tone={tono} size="sm" dot>
      {texto}
    </Badge>
  )
}

const nombreNivel = (n: number) => NIVELES_ESCALAMIENTO.find((x) => x.nivel === n)?.nombre ?? '—'

/**
 * Mesa de Casos Sensibles SGD — HU-ATC-020 a 025 (la lista y el registro). Acceso solo para
 * la Mesa y Legal: un acceso indebido a un caso sensible anula el IGDC (RNF-CUM-015).
 */
export default function Mesa() {
  const sesion = useSesion()
  const { datos } = useConsola()
  const [carga, reintentar] = useCarga('mesa')
  const [pestana, setPestana] = useState<Pestana>('casos')
  const [conCerrados, setConCerrados] = useState(false)
  const [registrar, setRegistrar] = useState(false)

  const casos = useMemo(
    () =>
      [...datos.casos]
        .filter((c) => conCerrados || c.estado === 'REGISTRADO' || c.estado === 'ACTIVO' || c.estado === 'VINCULADO')
        .sort((a, b) => (b.nivelEscalamiento - a.nivelEscalamiento) || a.codigo.localeCompare(b.codigo)),
    [datos.casos, conCerrados],
  )

  if (!puede.verMesa(sesion.rol)) {
    return (
      <div className="pt-pagina">
        <Header title="Mesa de Casos Sensibles" />
        <Prohibido requiere="Mesa de Casos SGD o Legal" recurso="ver los casos sensibles" />
      </div>
    )
  }

  const limbo = enLimbo(datos)
  const abiertos = datos.casos.filter((c) => c.estado === 'REGISTRADO' || c.estado === 'ACTIVO')
  return (
    <div className="pt-pagina pt-pagina--ancha">
      <Header
        title="Mesa de Casos Sensibles (SGD)"
        breadcrumb={<Breadcrumb items={[{ label: 'Bandeja', href: hrefDe('bandeja') }, { label: 'Mesa de Casos SGD' }]} />}
        description="Cinco líneas de ingreso, un Código Único por caso y el SLA de línea desde el cargo de activación."
        actions={
          puede.operarMesa(sesion.rol) ? (
            <Button variant="primary" leadingIcon={<Icon name="plus" size={16} />} onClick={() => setRegistrar(true)}>
              Registrar caso
            </Button>
          ) : undefined
        }
        tabs={
          <Tabs
            value={pestana}
            onValueChange={(v) => setPestana(v as Pestana)}
            items={[
              { value: 'casos', label: 'Casos', count: abiertos.length },
              { value: 'limbo', label: 'En limbo', count: limbo.length },
              { value: 'escalamientos', label: 'Escalamientos', count: datos.escalamientos.length },
            ]}
          />
        }
      />
      {carga.fase === 'error' ? (
        <AvisoDeError error={carga.error} reintentar={reintentar} titulo="No se pudo cargar la Mesa" />
      ) : (
        <div className="pt-pila">
          <StatGroup
            loading={carga.fase === 'cargando'}
            items={[
              { id: 'abiertos', label: 'Casos abiertos', value: String(abiertos.length) },
              { id: 'limbo', label: 'En limbo', value: String(limbo.length) },
              { id: 'vencidos', label: 'SLA de línea vencido', value: String(abiertos.filter((c) => (diasDesdeVencimiento(c, datos.ahora) ?? -1) > 0).length) },
              { id: 'comite', label: 'En Comité o Directorio', value: String(abiertos.filter((c) => c.nivelEscalamiento >= 4).length) },
            ]}
          />
          {pestana === 'casos' ? (
            <ListaCasos casos={casos} datos={datos} cargando={carga.fase === 'cargando'} conCerrados={conCerrados} setConCerrados={setConCerrados} />
          ) : pestana === 'limbo' ? (
            <Limbo casos={limbo} datos={datos} cargando={carga.fase === 'cargando'} />
          ) : (
            <Escalamientos datos={datos} cargando={carga.fase === 'cargando'} />
          )}
        </div>
      )}
      <CajonRegistrar datos={datos} abierto={registrar} onCerrar={() => setRegistrar(false)} />
    </div>
  )
}

function enlaceCaso(c: Caso) {
  return (
    <button type="button" tabIndex={-1} className="pt-enlace-celda" onClick={() => irA(hrefDe(`mesa/${c.id}`))}>
      {c.codigo}
    </button>
  )
}

function ListaCasos({ casos, datos, cargando, conCerrados, setConCerrados }: { casos: Caso[]; datos: Datos; cargando: boolean; conCerrados: boolean; setConCerrados: (v: boolean) => void }) {
  const columnas: GridColumn<Caso>[] = [
    {
      key: 'codigo',
      header: 'Código único',
      width: '11rem',
      renderCell: (c) => (
        <span className="pt-celda-doble">
          {enlaceCaso(c)}
          <span className="pt-celda-doble__secundaria">{lineaSgd(c.linea).nombre}</span>
        </span>
      ),
    },
    { key: 'cliente', header: 'Cliente', width: '11rem', renderCell: (c) => cliente(c.clienteId)?.nombre ?? '—' },
    { key: 'previo', header: 'Cargo previo', width: '8rem', renderCell: (c) => (c.cargoPrevio ? fecha(c.cargoPrevio.fecha) : '—') },
    { key: 'activacion', header: 'Activación', width: '8rem', renderCell: (c) => (c.activacion ? fecha(c.activacion.fecha) : '—') },
    { key: 'sla', header: 'SLA de línea', width: '11rem', renderCell: (c) => <BadgeSlaLinea caso={c} ahora={datos.ahora} /> },
    { key: 'riesgo', header: 'Riesgo', width: '10rem', renderCell: (c) => <BadgeRiesgo caso={c} /> },
    { key: 'escalamiento', header: 'Escalamiento', width: '10rem', renderCell: (c) => (c.nivelEscalamiento ? nombreNivel(c.nivelEscalamiento) : '—') },
    {
      key: 'estado',
      header: 'Estado',
      width: '9rem',
      renderCell: (c) => (
        <span className="pt-celda-doble">
          <BadgeEstadoCaso estado={c.estado} />
          {c.vinculadoA ? <span className="pt-celda-doble__secundaria">a {datos.casos.find((x) => x.id === c.vinculadoA)?.codigo}</span> : null}
        </span>
      ),
    },
  ]
  return (
    <Card>
      <CardBody>
        <div className="pt-pila">
          <Checkbox label="Incluir cerrados y reclasificados" checked={conCerrados} onChange={(e) => setConCerrados(e.target.checked)} />
          <DataGrid<Caso>
            caption="Casos sensibles"
            columns={columnas}
            rows={cargando ? [] : casos}
            getRowId={(c) => c.id}
            loading={cargando}
            emptyState={<EmptyState size="compact" variant="first-use" title="Sin casos sensibles" description="Registra el primero con «Registrar caso»." />}
          />
          <Supuesto>Código «SGD-2026-000000»; SLA de línea en días hábiles: Indecopi 10, Libro 15, Cartas notariales 10, Legal Atiende 5 y Backlog 20.</Supuesto>
        </div>
      </CardBody>
    </Card>
  )
}

function Limbo({ casos, datos, cargando }: { casos: Caso[]; datos: Datos; cargando: boolean }) {
  const columnas: GridColumn<Caso>[] = [
    { key: 'codigo', header: 'Código único', width: '11rem', renderCell: enlaceCaso },
    { key: 'linea', header: 'Línea', width: '11rem', renderCell: (c) => lineaSgd(c.linea).nombre },
    { key: 'previo', header: 'Cargo previo', width: '9rem', renderCell: (c) => (c.cargoPrevio ? fecha(c.cargoPrevio.fecha) : '—') },
    { key: 'dias', header: 'Días hábiles sin activar', width: '11rem', align: 'end', renderCell: (c) => diasSinActivar(c, datos.ahora) },
  ]
  return (
    <Card>
      <CardBody>
        <div className="pt-pila">
          <p className="pt-texto-chico">Casos con cargo previo y sin cargo de activación por más de 2 días hábiles: su SLA de línea no corre (RN-SVC-015).</p>
          <DataGrid<Caso>
            caption="Casos en limbo"
            columns={columnas}
            rows={cargando ? [] : casos}
            getRowId={(c) => c.id}
            loading={cargando}
            emptyState={<EmptyState size="compact" title="Ningún caso en limbo" description="Todos los cargos previos tienen su activación a tiempo." />}
          />
        </div>
      </CardBody>
    </Card>
  )
}

function Escalamientos({ datos, cargando }: { datos: Datos; cargando: boolean }) {
  const columnas: GridColumn<Escalamiento>[] = [
    {
      key: 'caso',
      header: 'Caso',
      width: '11rem',
      renderCell: (e) => {
        const c = datos.casos.find((x) => x.id === e.casoId)
        return c ? enlaceCaso(c) : e.casoId
      },
    },
    { key: 'nivel', header: 'Nivel', width: '14rem', renderCell: (e) => `${e.nivel} · ${e.nombre}` },
    { key: 'fecha', header: 'Fecha', width: '9rem', renderCell: (e) => fecha(e.fecha) },
    { key: 'destinatario', header: 'Destinatario', width: '11rem', renderCell: (e) => (e.destinatario.startsWith('p-') ? nombrePersona(e.destinatario) : e.destinatario) },
    { key: 'vence', header: 'Vencimiento del SLA', width: '10rem', renderCell: (e) => fechaDia(e.vencimiento) },
  ]
  return (
    <Card>
      <CardBody>
        <div className="pt-pila">
          <DataGrid<Escalamiento>
            caption="Escalamientos de la Mesa SGD"
            columns={columnas}
            rows={cargando ? [] : [...datos.escalamientos].reverse()}
            getRowId={(e) => e.id}
            loading={cargando}
            emptyState={<EmptyState size="compact" title="Sin escalamientos" description="El job escala los casos activos que se acercan o pasan su SLA de línea." />}
          />
          <Supuesto>Umbrales respecto del vencimiento: alerta preventiva a 2 días hábiles, alerta de vencimiento el día del vencimiento, memorándum a la jefatura a +1, Comité a +3 y Directorio a +5.</Supuesto>
        </div>
      </CardBody>
    </Card>
  )
}

function CajonRegistrar({ datos, abierto, onCerrar }: { datos: Datos; abierto: boolean; onCerrar: () => void }) {
  const id = useId()
  const [linea, setLinea] = useState<LineaSgd | ''>('')
  const [clienteId, setClienteId] = useState('')
  const [consulta, setConsulta] = useState('')
  const [ticketId, setTicketId] = useState('')
  const [resumen, setResumen] = useState('')
  const [distinto, setDistinto] = useState(false)
  const [justificacion, setJustificacion] = useState('')
  const guardar = useAccion()

  useEffect(() => {
    if (!abierto) return
    setLinea('')
    setClienteId('')
    setConsulta('')
    setTicketId('')
    setResumen('')
    setDistinto(false)
    setJustificacion('')
    guardar.limpiar()
  }, [abierto, guardar.limpiar])

  const iguales = clienteId ? coincidencias(datos, clienteId) : []
  const errores = erroresDeCampos(guardar.error)
  const errorGeneral = guardar.error instanceof ErrorSimulado && guardar.error.codigo !== 'coincidencia' && guardar.error.status !== 400 ? guardar.error : null
  const elegido = cliente(clienteId)
  const opciones = [...(elegido ? [elegido] : []), ...buscarEnMaestro(consulta).filter((c) => c.id !== clienteId)].map((c) => ({
    value: c.id,
    label: c.nombre,
    description: `DNI ${dniEnmascarado(c.dni)}`,
  }))
  const ticketsDelCliente = datos.tickets.filter((t) => t.clienteId === clienteId)

  const registrar = async (vincularA?: string) => {
    const caso = await guardar.ejecutar(() =>
      api.registrarCaso({ linea, clienteId, ticketId, resumen, vincularA, justificacionIndependiente: distinto && !vincularA ? justificacion : undefined }),
    )
    if (caso) {
      toast({ message: vincularA ? `${caso.codigo} registrado y vinculado: se gestiona en el hilo del caso principal.` : `Caso ${caso.codigo} registrado.`, tone: 'success' })
      onCerrar()
      irA(hrefDe(`mesa/${caso.id}`))
    }
  }
  const campo = (k: string) => `${id}-${k}`

  return (
    <Drawer
      open={abierto}
      onOpenChange={(a) => (a ? undefined : onCerrar())}
      title="Registrar caso sensible"
      side="end"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onCerrar}>
            Cancelar
          </Button>
          {iguales.length && !distinto ? null : (
            <Button variant="primary" type="submit" form={`${id}-f`} loading={guardar.enCurso}>
              {iguales.length ? 'Registrar como independiente' : 'Registrar el caso'}
            </Button>
          )}
        </>
      }
    >
      <Form id={`${id}-f`} onSubmit={() => registrar()} errors={Object.fromEntries(Object.entries(errores).map(([k, m]) => [campo(k), m]))}>
        <FormField label="Línea de ingreso" id={campo('linea')} error={errores.linea} required>
          <Select value={linea} placeholder="Elige la línea" onChange={(e) => setLinea(e.target.value as LineaSgd)} options={LINEAS_SGD.map((l) => ({ value: l.id, label: l.nombre }))} />
        </FormField>
        <div id={campo('cliente')}>
          <Combobox
            label="Cliente (SIGDA/TAXON)"
            placeholder="DNI o nombre, al menos 3 caracteres"
            options={opciones}
            value={clienteId || undefined}
            onInputChange={setConsulta}
            onValueChange={(v) => {
              setClienteId(typeof v === 'string' ? v : '')
              setTicketId('')
              setDistinto(false)
            }}
            error={errores.cliente}
            emptyMessage="Sin coincidencias en el maestro."
          />
        </div>
        <FormField label="Ticket relacionado" optional>
          <Select
            value={ticketId}
            disabled={!clienteId}
            onChange={(e) => setTicketId(e.target.value)}
            options={[{ value: '', label: 'Sin ticket' }, ...ticketsDelCliente.map((t) => ({ value: t.id, label: `${t.numero} · ${t.resumen}` }))]}
          />
        </FormField>
        <FormField label="Resumen de los hechos" id={campo('resumen')} error={errores.resumen} required>
          <Textarea rows={3} value={resumen} onChange={(e) => setResumen(e.target.value)} maxLength={1000} showCounter />
        </FormField>

        {iguales.length ? (
          <Alert tone="warning" title="Coincide con casos abiertos del mismo cliente">
            <span className="pt-alerta__texto">Un caso vinculado no se registra como independiente: se gestiona en el hilo de evidencia del caso principal (RN-SVC-018).</span>
          </Alert>
        ) : null}
        {iguales.map((c) => (
          <Card key={c.id}>
            <CardBody padding="sm">
              <div className="pt-pila pt-pila--chica">
                <p className="pt-texto">
                  <strong>{c.codigo}</strong> · {lineaSgd(c.linea).nombre} · {NOMBRE_ESTADO_CASO[c.estado]}
                </p>
                <p className="pt-texto-chico">{c.resumen}</p>
                <div className="pt-acciones pt-acciones--inicio">
                  <Button size="sm" variant="primary" loading={guardar.enCurso} onClick={() => registrar(c.id)}>
                    Vincular a {c.codigo}
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
        {iguales.length ? (
          <>
            <Checkbox label="Son hechos distintos: registrar como caso independiente" checked={distinto} onChange={(e) => setDistinto(e.target.checked)} />
            {distinto ? (
              <FormField label="Por qué no es el mismo caso" id={campo('justificacion')} error={errores.justificacion} required>
                <Textarea rows={2} value={justificacion} onChange={(e) => setJustificacion(e.target.value)} maxLength={500} />
              </FormField>
            ) : null}
          </>
        ) : null}
        <Supuesto>Coincidencia = mismo cliente con un caso abierto (pregunta abierta de FT-ATC-09: «¿qué define que dos casos coinciden en hechos?»).</Supuesto>
        {errorGeneral ? <AvisoDeError error={errorGeneral} reintentar={() => registrar()} /> : null}
      </Form>
    </Drawer>
  )
}
