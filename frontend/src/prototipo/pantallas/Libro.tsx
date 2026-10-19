import {
  Badge,
  Breadcrumb,
  Button,
  Card,
  CardBody,
  Chip,
  DataGrid,
  EmptyState,
  FilterControl,
  Header,
  SearchInput,
  Skeleton,
  StatGroup,
  TableToolbar,
  Tabs,
} from '@aybarcorp/ui'
import type { FilterValue, GridColumn } from '@aybarcorp/ui'
import { useMemo, useState } from 'react'
import { EMPRESAS, NOMBRE_ESTADO_APELACION, nombrePersona, nombreTipo } from '../datos/catalogos.ts'
import { cliente } from '../datos/clientes.ts'
import { AvisoDeError, BadgePlazo, Prohibido, Supuesto, TABLETA, dinero, fecha, fechaDia, irA, useCarga, useMedia } from '../comun.tsx'
import { hrefDe } from '../rutas.ts'
import { useConsola, useSesion } from '../servicio/api.ts'
import { estadoPlazo, huerfanosDeHoy } from '../servicio/libro.ts'
import type { AlertaLegal, Asiento, ExcepcionIntegridad, NivelPlazo } from '../servicio/libro.ts'
import { puede } from '../servicio/nucleo.ts'
import type { Datos } from '../servicio/nucleo.ts'

type Pestana = 'asientos' | 'alertas' | 'huerfanos'

interface Fila {
  readonly asiento: Asiento
  readonly plazo: { nivel: NivelPlazo; dias: number; vence: Date }
  readonly consumidor: string
  readonly ticket: string
  readonly apelacion: string | null
}

export const NOMBRE_ALERTA_LEGAL = {
  LEGAL_EXTENSION_WINDOW_CLOSING: 'Se cierra la ventana de prórroga',
  LEGAL_RESPONSE_OVERDUE: 'Plazo legal vencido sin respuesta',
} as const

const ORDEN: Record<NivelPlazo, number> = { vencido: 0, 'por-vencer': 1, 'en-plazo': 2, 'respondido-fuera': 3, respondido: 4 }

/**
 * Libro de Reclamaciones — HU-ATC-012 a 016 (la lista). Cada asiento con su plazo legal
 * vigente (el prorrogado si existe), las alertas legales del job y los tickets huérfanos
 * del control diario. La ficha de cada asiento está en Asiento.tsx.
 */
export default function Libro() {
  const sesion = useSesion()
  const { datos } = useConsola()
  const [carga, reintentar] = useCarga('libro')
  const tableta = useMedia(TABLETA)
  const [pestana, setPestana] = useState<Pestana>('asientos')
  const [busqueda, setBusqueda] = useState('')
  const [empresas, setEmpresas] = useState<string[]>([])
  const [porResponder, setPorResponder] = useState(false)
  const [urgentes, setUrgentes] = useState(false)

  const filas = useMemo<Fila[]>(() => {
    const q = busqueda.trim().toLowerCase()
    return datos.asientos
      .map((a) => {
        const t = datos.tickets.find((x) => x.id === a.ticketId)
        const ap = datos.apelaciones.filter((x) => x.asientoId === a.id).at(-1)
        return {
          asiento: a,
          plazo: estadoPlazo(a, datos.ahora),
          consumidor: (t && cliente(t.clienteId)?.nombre) ?? '—',
          ticket: t?.numero ?? '—',
          apelacion: ap ? `${ap.instancia === 'INDECOPI' ? 'INDECOPI' : 'Interna'} · ${NOMBRE_ESTADO_APELACION[ap.estado]}` : null,
        }
      })
      .filter(
        (f) =>
          (!q || `${f.asiento.codigo} ${f.consumidor} ${f.ticket}`.toLowerCase().includes(q)) &&
          (!empresas.length || empresas.includes(f.asiento.empresaId)) &&
          (!porResponder || !f.asiento.respuesta) &&
          (!urgentes || f.plazo.nivel === 'vencido' || f.plazo.nivel === 'por-vencer'),
      )
      .sort((a, b) => ORDEN[a.plazo.nivel] - ORDEN[b.plazo.nivel] || a.plazo.vence.getTime() - b.plazo.vence.getTime())
  }, [datos, busqueda, empresas, porResponder, urgentes])

  if (!puede.verLibro(sesion.rol)) {
    return (
      <div className="pt-pagina">
        <Header title="Libro de Reclamaciones" />
        <Prohibido requiere="de atención, legal o Coordinador CX" recurso="ver el Libro de Reclamaciones" />
      </div>
    )
  }

  const todos = datos.asientos.map((a) => estadoPlazo(a, datos.ahora))
  const huerfanos = huerfanosDeHoy(datos)
  const hayFiltros = Boolean(busqueda || empresas.length || porResponder || urgentes)
  const limpiar = () => {
    setBusqueda('')
    setEmpresas([])
    setPorResponder(false)
    setUrgentes(false)
  }

  return (
    <div className="pt-pagina pt-pagina--ancha">
      <Header
        title="Libro de Reclamaciones"
        breadcrumb={<Breadcrumb items={[{ label: 'Bandeja', href: hrefDe('bandeja') }, { label: 'Libro de Reclamaciones' }]} />}
        description="Ley 29571, art. 24: respuesta en 15 días hábiles desde el registro, prorrogables una sola vez por 15 si se comunica antes del vencimiento."
        tabs={
          <Tabs
            value={pestana}
            onValueChange={(v) => setPestana(v as Pestana)}
            items={[
              { value: 'asientos', label: 'Asientos', count: datos.asientos.length },
              { value: 'alertas', label: 'Alertas legales', count: datos.alertasLegales.length },
              { value: 'huerfanos', label: 'Huérfanos', count: huerfanos.length },
            ]}
          />
        }
      />
      {carga.fase === 'error' ? (
        <AvisoDeError error={carga.error} reintentar={reintentar} titulo="No se pudo cargar el Libro" />
      ) : (
        <div className="pt-pila">
          <StatGroup
            loading={carga.fase === 'cargando'}
            items={[
              { id: 'abiertos', label: 'Plazo corriendo', value: String(todos.filter((p) => p.nivel === 'en-plazo' || p.nivel === 'por-vencer').length) },
              { id: 'por-vencer', label: 'Por vencer (≤ 3 días hábiles)', value: String(todos.filter((p) => p.nivel === 'por-vencer').length) },
              { id: 'vencidos', label: 'Vencidos sin respuesta', value: String(todos.filter((p) => p.nivel === 'vencido').length) },
              { id: 'fuera', label: 'Respondidos fuera de plazo', value: String(todos.filter((p) => p.nivel === 'respondido-fuera').length) },
              { id: 'huerfanos', label: 'Tickets huérfanos hoy', value: String(huerfanos.length) },
            ]}
          />
          {pestana === 'asientos' ? (
            <Asientos
              filas={filas}
              cargando={carga.fase === 'cargando'}
              tableta={tableta}
              busqueda={busqueda}
              setBusqueda={setBusqueda}
              empresas={empresas}
              setEmpresas={setEmpresas}
              porResponder={porResponder}
              setPorResponder={setPorResponder}
              urgentes={urgentes}
              setUrgentes={setUrgentes}
              hayFiltros={hayFiltros}
              limpiar={limpiar}
              hayAsientos={datos.asientos.length > 0}
            />
          ) : pestana === 'alertas' ? (
            <AlertasLegales datos={datos} cargando={carga.fase === 'cargando'} />
          ) : (
            <Huerfanos datos={datos} cargando={carga.fase === 'cargando'} />
          )}
        </div>
      )}
    </div>
  )
}

function Asientos(p: {
  filas: Fila[]
  cargando: boolean
  tableta: boolean
  busqueda: string
  setBusqueda: (v: string) => void
  empresas: string[]
  setEmpresas: (v: string[]) => void
  porResponder: boolean
  setPorResponder: (v: boolean) => void
  urgentes: boolean
  setUrgentes: (v: boolean) => void
  hayFiltros: boolean
  limpiar: () => void
  hayAsientos: boolean
}) {
  const abrir = (a: Asiento) => irA(hrefDe(`libro/${a.id}`))
  const columnas: GridColumn<Fila>[] = [
    {
      key: 'codigo',
      header: 'Asiento',
      width: '11rem',
      renderCell: (f) => (
        <span className="pt-celda-doble">
          <button type="button" tabIndex={-1} className="pt-enlace-celda" onClick={() => abrir(f.asiento)}>
            {f.asiento.codigo}
          </button>
          <span className="pt-celda-doble__secundaria">{f.asiento.establecimiento}</span>
        </span>
      ),
    },
    {
      key: 'tipo',
      header: 'Tipo',
      width: '7rem',
      renderCell: (f) => (
        <Badge tone={f.asiento.tipo === 'RECLAMO' ? 'warning' : 'neutral'} size="sm">
          {f.asiento.tipo === 'RECLAMO' ? 'Reclamo' : 'Queja'}
        </Badge>
      ),
    },
    {
      key: 'consumidor',
      header: 'Consumidor',
      width: '13rem',
      renderCell: (f) => (
        <span className="pt-celda-doble">
          <span className="pt-celda-doble__principal">{f.consumidor}</span>
          <span className="pt-celda-doble__secundaria">Ticket {f.ticket}</span>
        </span>
      ),
    },
    { key: 'monto', header: 'Monto', width: '8rem', align: 'end', renderCell: (f) => (f.asiento.monto !== null && f.asiento.moneda ? dinero(f.asiento.monto, f.asiento.moneda) : '—') },
    {
      key: 'plazo',
      header: 'Plazo legal',
      width: '14rem',
      renderCell: (f) => (
        <span className="pt-celda-doble">
          <BadgePlazo nivel={f.plazo.nivel} dias={f.plazo.dias} size="sm" />
          <span className="pt-celda-doble__secundaria">
            Vence {fechaDia(f.plazo.vence)}
            {f.asiento.prorroga ? ' · prorrogado' : ''}
          </span>
        </span>
      ),
    },
    { key: 'apelacion', header: 'Apelación', width: '11rem', renderCell: (f) => f.apelacion ?? '—' },
    {
      key: 'accion',
      header: 'Acción',
      width: '6rem',
      renderCell: (f) => (
        <Button size="sm" variant="ghost" onClick={() => abrir(f.asiento)}>
          Abrir
        </Button>
      ),
    },
  ]
  const vacio = !p.hayAsientos ? (
    <EmptyState variant="first-use" title="Aún no hay asientos" description="Se registran desde el ticket de una queja o un reclamo, en su tarjeta «Libro de Reclamaciones»." />
  ) : (
    <EmptyState
      size="compact"
      variant="no-results"
      title="Ningún asiento coincide"
      description="Prueba con otro código o consumidor, o quita los filtros."
      action={
        <Button size="sm" variant="secondary" onClick={p.limpiar}>
          Quitar la búsqueda y los filtros
        </Button>
      }
    />
  )
  return (
    <div className="pt-bandeja">
      <TableToolbar
        search={<SearchInput label="Buscar asientos" placeholder="Código, consumidor o N.º de ticket" value={p.busqueda} onValueChange={p.setBusqueda} debounce={150} size="sm" />}
        filters={
          <>
            <Chip variant="selectable" selected={p.porResponder} onSelectedChange={p.setPorResponder}>
              Por responder
            </Chip>
            <Chip variant="selectable" selected={p.urgentes} onSelectedChange={p.setUrgentes}>
              Por vencer o vencidos
            </Chip>
            <FilterControl
              size="sm"
              label="Razón social"
              type="multi"
              searchable
              options={EMPRESAS.map((e) => ({ value: e.id, label: `${e.id} · ${e.nombre}` }))}
              value={p.empresas}
              onValueChange={(v) => p.setEmpresas(comoLista(v))}
            />
            {p.hayFiltros ? (
              <Button variant="ghost" size="sm" onClick={p.limpiar}>
                Quitar filtros
              </Button>
            ) : null}
          </>
        }
        resultCount={p.cargando ? undefined : p.filas.length}
        itemLabel="asientos"
      />
      {p.tableta ? (
        <DataGrid<Fila> caption="Asientos del Libro de Reclamaciones" columns={columnas} rows={p.cargando ? [] : p.filas} getRowId={(f) => f.asiento.id} loading={p.cargando} emptyState={vacio} />
      ) : p.cargando ? (
        <div className="pt-tarjetas" aria-busy="true">
          {[0, 1].map((i) => (
            <Skeleton key={i} variant="block" height="7rem" />
          ))}
        </div>
      ) : p.filas.length ? (
        <ul className="pt-tarjetas" aria-label="Asientos del Libro de Reclamaciones">
          {p.filas.map((f) => (
            <li key={f.asiento.id}>
              <Card>
                <CardBody padding="sm">
                  <div className="pt-tarjeta">
                    <div className="pt-tarjeta__cabeza">
                      <a className="pt-tarjeta__numero" href={hrefDe(`libro/${f.asiento.id}`)}>
                        {f.asiento.codigo}
                      </a>
                      <BadgePlazo nivel={f.plazo.nivel} dias={f.plazo.dias} size="sm" />
                    </div>
                    <p className="pt-tarjeta__resumen">
                      {f.asiento.tipo === 'RECLAMO' ? 'Reclamo' : 'Queja'} · {f.consumidor}
                    </p>
                    <p className="pt-texto-chico">
                      Vence {fechaDia(f.plazo.vence)}
                      {f.asiento.prorroga ? ' · prorrogado' : ''} · {f.apelacion ?? 'sin apelación'}
                    </p>
                  </div>
                </CardBody>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        vacio
      )}
      <Supuesto>Código del asiento «SIGLA-ESTABLECIMIENTO-0000»; los reclamos por canales remotos van al «Libro virtual», con su propio correlativo.</Supuesto>
    </div>
  )
}

function AlertasLegales({ datos, cargando }: { datos: Datos; cargando: boolean }) {
  const codigo = (id: string) => datos.asientos.find((a) => a.id === id)?.codigo ?? id
  const columnas: GridColumn<AlertaLegal>[] = [
    {
      key: 'asiento',
      header: 'Asiento',
      width: '10rem',
      renderCell: (a) => (
        <button type="button" tabIndex={-1} className="pt-enlace-celda" onClick={() => irA(hrefDe(`libro/${a.asientoId}`))}>
          {codigo(a.asientoId)}
        </button>
      ),
    },
    {
      key: 'tipo',
      header: 'Alerta',
      width: '16rem',
      renderCell: (a) => (
        <span className="pt-celda-doble">
          <span className="pt-celda-doble__principal">{NOMBRE_ALERTA_LEGAL[a.tipo]}</span>
          <code className="pt-celda-doble__secundaria">{a.tipo}</code>
        </span>
      ),
    },
    { key: 'evaluado', header: 'Vencimiento evaluado', width: '10rem', renderCell: (a) => fechaDia(a.vencimientoEvaluado) },
    { key: 'fecha', header: 'Fecha de la alerta', width: '9rem', renderCell: (a) => fecha(a.fecha) },
    { key: 'destinatario', header: 'Destinatario', width: '10rem', renderCell: (a) => nombrePersona(a.destinatario) },
    { key: 'canal', header: 'Canal', width: '11rem', renderCell: (a) => a.canal },
  ]
  return (
    <Card>
      <CardBody>
        <div className="pt-pila">
          <DataGrid<AlertaLegal>
            caption="Alertas del plazo legal"
            columns={columnas}
            rows={cargando ? [] : [...datos.alertasLegales].reverse()}
            getRowId={(a) => a.id}
            loading={cargando}
            emptyState={<EmptyState size="compact" title="Sin alertas legales" description="El job las genera a 3 días hábiles del vencimiento sin prórroga y cuando el plazo vence sin respuesta." />}
          />
          <Supuesto>Las alertas legales le llegan a la responsable legal de reclamos como notificación en la consola; no dependen de la política SLA comercial.</Supuesto>
        </div>
      </CardBody>
    </Card>
  )
}

function Huerfanos({ datos, cargando }: { datos: Datos; cargando: boolean }) {
  type FilaH = { readonly excepcion: ExcepcionIntegridad; readonly numero: string; readonly tipo: string; readonly abierto: Date; readonly conAsiento: boolean }
  const filas: FilaH[] = [...datos.excepciones].reverse().map((x) => {
    const t = datos.tickets.find((y) => y.id === x.ticketId)
    return { excepcion: x, numero: t?.numero ?? x.ticketId, tipo: t ? nombreTipo(t.tipo) : '—', abierto: t?.abierto ?? x.fecha, conAsiento: datos.asientos.some((a) => a.ticketId === x.ticketId) }
  })
  const columnas: GridColumn<FilaH>[] = [
    {
      key: 'ticket',
      header: 'Ticket',
      width: '9rem',
      renderCell: (f) => (
        <button type="button" tabIndex={-1} className="pt-enlace-celda" onClick={() => irA(hrefDe(`ticket/${f.excepcion.ticketId}`))}>
          {f.numero}
        </button>
      ),
    },
    { key: 'tipo', header: 'Tipo', width: '8rem', renderCell: (f) => f.tipo },
    { key: 'abierto', header: 'Abierto', width: '9rem', renderCell: (f) => fecha(f.abierto) },
    { key: 'control', header: 'Control', width: '9rem', renderCell: (f) => fecha(f.excepcion.fecha) },
    {
      key: 'excepcion',
      header: 'Excepción',
      width: '12rem',
      renderCell: () => <code>GOV_INTEGRITY_EXCEPTION · ORPHAN_REFERENCE</code>,
    },
    {
      key: 'situacion',
      header: 'Situación',
      width: '10rem',
      renderCell: (f) =>
        f.conAsiento ? (
          <Badge tone="success" size="sm">
            Asiento registrado
          </Badge>
        ) : (
          <Badge tone="danger" size="sm">
            Sin asiento
          </Badge>
        ),
    },
    {
      key: 'accion',
      header: 'Acción',
      width: '9rem',
      renderCell: (f) =>
        f.conAsiento ? null : (
          <Button size="sm" variant="secondary" onClick={() => irA(hrefDe(`ticket/${f.excepcion.ticketId}`))}>
            Ir a registrarlo
          </Button>
        ),
    },
  ]
  return (
    <Card>
      <CardBody>
        <div className="pt-pila">
          <p className="pt-texto-chico">Tickets activos de queja o reclamo sin asiento al cierre de un día. La excepción queda; el asiento se registra desde el ticket.</p>
          <DataGrid<FilaH>
            caption="Tickets huérfanos del Libro"
            columns={columnas}
            rows={cargando ? [] : filas}
            getRowId={(f) => f.excepcion.id}
            loading={cargando}
            emptyState={<EmptyState size="compact" title="Sin huérfanos" description="Todos los reclamos y quejas activos tienen su asiento." />}
          />
          <Supuesto>Exigen asiento los tipos Queja y Reclamo; el control corre con cada job y deja una excepción por ticket y día.</Supuesto>
        </div>
      </CardBody>
    </Card>
  )
}

function comoLista(valor: FilterValue | undefined): string[] {
  if (Array.isArray(valor)) return valor.filter((v): v is string => typeof v === 'string')
  return typeof valor === 'string' ? [valor] : []
}
