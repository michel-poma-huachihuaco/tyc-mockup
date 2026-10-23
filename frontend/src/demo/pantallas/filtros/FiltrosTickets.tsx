import {
  Badge,
  Button,
  Checkbox,
  Chip,
  DataGrid,
  DateRangePicker,
  EmptyState,
  FilterControl,
  FilterPanel,
  FormField,
  Pagination,
  Radio,
  RangeSlider,
  SearchInput,
  SegmentedControl,
  Select,
  Switch,
  Tabs,
  TableToolbar,
} from '@aybarcorp/ui'
import type { FilterValue, GridColumn, TableSort, TonoBadge } from '@aybarcorp/ui'
import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  CATEGORIAS_TICKET,
  ESTADOS_TICKET,
  ETIQUETA_ESTADO_TICKET,
  ETIQUETA_PRIORIDAD_TICKET,
  HOY,
  PRIORIDADES_TICKET,
  RESPONSABLES_TICKET,
  TICKETS,
} from '../../datos'
import type { EstadoTicket, PrioridadTicket, Ticket } from '../../datos'
import { Encabezado } from '../../marco/Encabezado'
import { migasDe } from '../../rutas'
import { normalizar } from '../../vitrina/catalogo'
import './filtros.css'

/**
 * /demo/filtros: plantillas de un tablero de tickets con filtros, cada una con los
 * componentes de @aybarcorp/ui que le tocan y sus propios datos sintéticos en memoria:
 *  1. Barra de filtros: Table Toolbar + Filter Control + Chips de aplicados.
 *  2. Panel lateral: Filter Panel con aplicar explícito, Checkbox, Range Slider y Date Range Picker.
 *  3. Vistas rápidas: Segmented Control + Chips seleccionables + búsqueda.
 *  4. Catálogo de controles: cada control de filtro suelto, para elegir el que haga falta.
 * Es una maqueta: copia de aquí la plantilla que sirva y conéctala a `@aybarcorp/http`.
 */

const TONO_ESTADO: Record<EstadoTicket, TonoBadge> = {
  abierto: 'info',
  'en-curso': 'warning',
  'en-espera': 'neutral',
  resuelto: 'success',
  cerrado: 'neutral',
}
const TONO_PRIORIDAD: Record<PrioridadTicket, TonoBadge> = { baja: 'neutral', media: 'info', alta: 'warning', critica: 'danger' }
const ORDEN_PRIORIDAD: Record<PrioridadTicket, number> = { baja: 0, media: 1, alta: 2, critica: 3 }
const HORA = 3_600_000
const HORAS_MAX = 48 * 17 // El ticket más viejo tiene unas 800 horas.

interface Filtros {
  busqueda: string
  estados: string[]
  prioridades: string[]
  categorias: string[]
  responsable: string | undefined
  sinAsignar: boolean
  horas: [number, number]
  fechas: [Date | null, Date | null]
}

const SIN_FILTROS: Filtros = {
  busqueda: '',
  estados: [],
  prioridades: [],
  categorias: [],
  responsable: undefined,
  sinAsignar: false,
  horas: [0, HORAS_MAX],
  fechas: [null, null],
}

const comoLista = (v: FilterValue | undefined): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : typeof v === 'string' ? [v] : []

const alternar = (lista: string[], valor: string, activo: boolean) =>
  activo ? [...lista.filter((x) => x !== valor), valor] : lista.filter((x) => x !== valor)

const horasDesde = (t: Ticket) => (HOY.getTime() - t.creado.getTime()) / HORA

/** El recuento de filtros aplicados (la búsqueda no cuenta: tiene su propia caja). */
function contar(f: Filtros): number {
  return (
    f.estados.length +
    f.prioridades.length +
    f.categorias.length +
    (f.responsable ? 1 : 0) +
    (f.sinAsignar ? 1 : 0) +
    (f.horas[0] > 0 || f.horas[1] < HORAS_MAX ? 1 : 0) +
    (f.fechas[0] || f.fechas[1] ? 1 : 0)
  )
}

function aplicar(lista: readonly Ticket[], f: Filtros): Ticket[] {
  const q = normalizar(f.busqueda)
  const [desde, hasta] = f.fechas
  return lista.filter((t) => {
    const h = horasDesde(t)
    return (
      (!q || normalizar(`${t.id} ${t.titulo} ${t.categoria} ${t.responsable}`).includes(q)) &&
      (f.estados.length === 0 || f.estados.includes(t.estado)) &&
      (f.prioridades.length === 0 || f.prioridades.includes(t.prioridad)) &&
      (f.categorias.length === 0 || f.categorias.includes(t.categoria)) &&
      (!f.responsable || t.responsable === f.responsable) &&
      (!f.sinAsignar || !t.responsable) &&
      h >= f.horas[0] &&
      h <= f.horas[1] &&
      (!desde || t.creado >= desde) &&
      (!hasta || t.creado <= new Date(hasta.getTime() + 24 * HORA - 1))
    )
  })
}

const fecha = (d: Date) => new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short' }).format(d)

/** Cada filtro aplicado como un Chip con su «quitar»: lo que el listado dice que está filtrado. */
function chipsDe(f: Filtros, cambiar: (parcial: Partial<Filtros>) => void): { id: string; texto: string; quitar: () => void }[] {
  return [
    ...f.estados.map((e) => ({
      id: `estado-${e}`,
      texto: `Estado: ${ETIQUETA_ESTADO_TICKET[e as EstadoTicket]}`,
      quitar: () => cambiar({ estados: f.estados.filter((x) => x !== e) }),
    })),
    ...f.prioridades.map((p) => ({
      id: `prioridad-${p}`,
      texto: `Prioridad: ${ETIQUETA_PRIORIDAD_TICKET[p as PrioridadTicket]}`,
      quitar: () => cambiar({ prioridades: f.prioridades.filter((x) => x !== p) }),
    })),
    ...f.categorias.map((c) => ({ id: `categoria-${c}`, texto: `Categoría: ${c}`, quitar: () => cambiar({ categorias: f.categorias.filter((x) => x !== c) }) })),
    ...(f.responsable ? [{ id: 'responsable', texto: `Responsable: ${f.responsable}`, quitar: () => cambiar({ responsable: undefined }) }] : []),
    ...(f.sinAsignar ? [{ id: 'sin-asignar', texto: 'Sin asignar', quitar: () => cambiar({ sinAsignar: false }) }] : []),
    ...(f.horas[0] > 0 || f.horas[1] < HORAS_MAX
      ? [{ id: 'horas', texto: `Antigüedad: ${f.horas[0]}–${f.horas[1]} h`, quitar: () => cambiar({ horas: [0, HORAS_MAX] }) }]
      : []),
    ...(f.fechas[0] || f.fechas[1]
      ? [
          {
            id: 'fechas',
            texto: `Creado: ${f.fechas[0] ? fecha(f.fechas[0]) : '…'} – ${f.fechas[1] ? fecha(f.fechas[1]) : '…'}`,
            quitar: () => cambiar({ fechas: [null, null] }),
          },
        ]
      : []),
  ]
}

function Aplicados({ filtros, cambiar, limpiar }: { filtros: Filtros; cambiar: (p: Partial<Filtros>) => void; limpiar: () => void }) {
  const chips = chipsDe(filtros, cambiar)
  if (chips.length === 0) return null
  return (
    <div className="gl-tk__aplicados" role="group" aria-label="Filtros aplicados">
      {chips.map((c) => (
        <Chip key={c.id} variant="removable" onRemove={c.quitar} removeLabel={`Quitar ${c.texto}`}>
          {c.texto}
        </Chip>
      ))}
      <Button variant="ghost" size="sm" onClick={limpiar}>
        Quitar {chips.length} {chips.length === 1 ? 'filtro' : 'filtros'}
      </Button>
    </div>
  )
}

const COLUMNAS: GridColumn<Ticket>[] = [
  { key: 'id', header: 'Ticket', sortable: true, width: '7rem' },
  { key: 'titulo', header: 'Asunto', sortable: true, width: '18rem' },
  {
    key: 'estado',
    header: 'Estado',
    sortable: true,
    width: '7rem',
    renderCell: (t) => (
      <Badge tone={TONO_ESTADO[t.estado]} size="sm">
        {ETIQUETA_ESTADO_TICKET[t.estado]}
      </Badge>
    ),
  },
  {
    key: 'prioridad',
    header: 'Prioridad',
    sortable: true,
    width: '7rem',
    renderCell: (t) => (
      <Badge tone={TONO_PRIORIDAD[t.prioridad]} size="sm">
        {ETIQUETA_PRIORIDAD_TICKET[t.prioridad]}
      </Badge>
    ),
  },
  { key: 'categoria', header: 'Categoría', width: '9rem' },
  { key: 'responsable', header: 'Responsable', width: '9rem', renderCell: (t) => t.responsable || 'Sin asignar' },
  { key: 'creado', header: 'Creado', sortable: true, width: '6rem', renderCell: (t) => fecha(t.creado) },
]

/** La tabla de tickets con orden, paginación y el vacío «sin resultados»; la comparten las plantillas. */
function TablaTickets({ filas, alLimpiar }: { filas: Ticket[]; alLimpiar: () => void }) {
  const [orden, setOrden] = useState<TableSort>({ key: 'creado', dir: 'desc' })
  const [pagina, setPagina] = useState(1)
  const [porPagina, setPorPagina] = useState(10)

  const ordenadas = useMemo(() => {
    const signo = orden.dir === 'asc' ? 1 : -1
    return [...filas].sort((a, b) => {
      switch (orden.key) {
        case 'prioridad':
          return (ORDEN_PRIORIDAD[a.prioridad] - ORDEN_PRIORIDAD[b.prioridad]) * signo
        case 'estado':
          return (ESTADOS_TICKET.indexOf(a.estado) - ESTADOS_TICKET.indexOf(b.estado)) * signo
        case 'creado':
          return (a.creado.getTime() - b.creado.getTime()) * signo
        case 'titulo':
          return a.titulo.localeCompare(b.titulo, 'es') * signo
        default:
          return a.id.localeCompare(b.id) * signo
      }
    })
  }, [filas, orden])

  const paginas = Math.max(1, Math.ceil(ordenadas.length / porPagina))
  const vigente = Math.min(pagina, paginas)

  return (
    <>
      <DataGrid<Ticket>
        caption="Tickets de soporte"
        columns={COLUMNAS}
        rows={ordenadas.slice((vigente - 1) * porPagina, vigente * porPagina)}
        getRowId={(t) => t.id}
        sort={orden}
        onSortChange={(o) => {
          setOrden(o)
          setPagina(1)
        }}
        totalRows={ordenadas.length}
        emptyState={
          <EmptyState
            size="compact"
            variant="no-results"
            title="Ningún ticket coincide"
            description="Prueba con otra búsqueda o quita algún filtro."
            action={
              <Button variant="secondary" size="sm" onClick={alLimpiar}>
                Quitar los filtros
              </Button>
            }
          />
        }
      />
      <Pagination
        page={vigente}
        pageCount={paginas}
        onPageChange={setPagina}
        pageSize={porPagina}
        pageSizeOptions={[10, 20, 50]}
        onPageSizeChange={(n) => {
          setPorPagina(n)
          setPagina(1)
        }}
        total={ordenadas.length}
        itemLabel="tickets"
      />
    </>
  )
}

function useFiltros() {
  const [filtros, setFiltros] = useState<Filtros>(SIN_FILTROS)
  const cambiar = (parcial: Partial<Filtros>) => setFiltros((f) => ({ ...f, ...parcial }))
  const limpiar = () => setFiltros((f) => ({ ...SIN_FILTROS, busqueda: f.busqueda }))
  return { filtros, cambiar, limpiar, setFiltros }
}

const cuenta = (lista: readonly Ticket[], campo: 'estado' | 'prioridad' | 'categoria', valor: string) =>
  lista.filter((t) => t[campo] === valor).length

/* 1 · Barra de filtros ----------------------------------------------------------------- */

function BarraDeFiltros() {
  const { filtros, cambiar, limpiar } = useFiltros()
  const filas = useMemo(() => aplicar(TICKETS, filtros), [filtros])

  return (
    <div className="gl-tk__plantilla">
      <TableToolbar
        search={
          <SearchInput label="Buscar tickets" placeholder="Número, asunto o responsable" value={filtros.busqueda} onValueChange={(busqueda) => cambiar({ busqueda })} debounce={150} size="sm" />
        }
        filters={
          <>
            <FilterControl
              size="sm"
              label="Estado"
              type="multi"
              options={ESTADOS_TICKET.map((e) => ({ value: e, label: ETIQUETA_ESTADO_TICKET[e], count: cuenta(TICKETS, 'estado', e) }))}
              value={filtros.estados}
              onValueChange={(v) => cambiar({ estados: comoLista(v) })}
            />
            <FilterControl
              size="sm"
              label="Prioridad"
              type="multi"
              options={PRIORIDADES_TICKET.map((p) => ({ value: p, label: ETIQUETA_PRIORIDAD_TICKET[p], count: cuenta(TICKETS, 'prioridad', p) }))}
              value={filtros.prioridades}
              onValueChange={(v) => cambiar({ prioridades: comoLista(v) })}
            />
            <FilterControl
              size="sm"
              label="Responsable"
              type="single"
              options={RESPONSABLES_TICKET.map((r) => ({ value: r, label: r, count: TICKETS.filter((t) => t.responsable === r).length }))}
              value={filtros.responsable}
              onValueChange={(v) => cambiar({ responsable: typeof v === 'string' ? v : undefined })}
            />
            <FilterControl
              size="sm"
              label="Sin asignar"
              type="boolean"
              value={filtros.sinAsignar}
              onValueChange={(v) => cambiar({ sinAsignar: v === true })}
            />
          </>
        }
        resultCount={filas.length}
        itemLabel="tickets"
      />
      <Aplicados filtros={filtros} cambiar={cambiar} limpiar={limpiar} />
      <TablaTickets filas={filas} alLimpiar={limpiar} />
    </div>
  )
}

/* 2 · Panel lateral -------------------------------------------------------------------- */

function PanelLateral() {
  const { filtros: aplicados, cambiar: cambiarAplicados, limpiar: limpiarAplicados, setFiltros: aplicarBorrador } = useFiltros()
  // Con aplicar explícito, el panel edita un borrador y solo «Aplicar» lo manda al listado.
  const [borrador, setBorrador] = useState<Filtros>(SIN_FILTROS)
  const cambiar = (parcial: Partial<Filtros>) => setBorrador((f) => ({ ...f, ...parcial }))
  const filas = useMemo(() => aplicar(TICKETS, aplicados), [aplicados])
  const hayCambios = JSON.stringify(borrador) !== JSON.stringify(aplicados)

  const casillas = (campo: 'estados' | 'prioridades' | 'categorias', valores: readonly string[], etiqueta: (v: string) => string) => (
    <div className="gl-tk__casillas">
      {valores.map((v) => (
        <Checkbox
          key={v}
          label={etiqueta(v)}
          checked={borrador[campo].includes(v)}
          onChange={(e) => cambiar({ [campo]: alternar(borrador[campo], v, e.target.checked) })}
        />
      ))}
    </div>
  )

  return (
    <div className="gl-tk__plantilla gl-tk__con-panel">
      <FilterPanel
        itemLabel="tickets"
        applyMode="explicit"
        appliedCount={contar(aplicados)}
        pendingCount={hayCambios ? Math.max(1, contar(borrador)) : 0}
        resultCount={filas.length}
        onApply={() => aplicarBorrador(borrador)}
        onClearAll={() => {
          limpiarAplicados()
          setBorrador((f) => ({ ...SIN_FILTROS, busqueda: f.busqueda }))
        }}
        groups={[
          { id: 'estado', label: 'Estado', appliedCount: aplicados.estados.length, control: casillas('estados', ESTADOS_TICKET, (v) => ETIQUETA_ESTADO_TICKET[v as EstadoTicket]) },
          { id: 'prioridad', label: 'Prioridad', appliedCount: aplicados.prioridades.length, control: casillas('prioridades', PRIORIDADES_TICKET, (v) => ETIQUETA_PRIORIDAD_TICKET[v as PrioridadTicket]) },
          { id: 'categoria', label: 'Categoría', appliedCount: aplicados.categorias.length, control: casillas('categorias', CATEGORIAS_TICKET, (v) => v) },
          {
            id: 'horas',
            label: 'Antigüedad',
            appliedCount: aplicados.horas[0] > 0 || aplicados.horas[1] < HORAS_MAX ? 1 : 0,
            control: <RangeSlider label="Horas desde la creación" min={0} max={HORAS_MAX} step={8} value={borrador.horas} onValueChange={(horas) => cambiar({ horas })} formatValue={(v) => `${v} h`} />,
          },
          {
            id: 'fechas',
            label: 'Fecha de creación',
            appliedCount: aplicados.fechas[0] || aplicados.fechas[1] ? 1 : 0,
            control: <DateRangePicker label="Creado entre" value={borrador.fechas} onValueChange={(fechas) => cambiar({ fechas })} allowOpenEnded />,
          },
        ]}
      />
      <div className="gl-tk__contenido">
        <SearchInput
          label="Buscar tickets"
          placeholder="Número, asunto o responsable"
          value={aplicados.busqueda}
          onValueChange={(busqueda) => cambiarAplicados({ busqueda })}
          debounce={150}
          size="sm"
        />
        <Aplicados
          filtros={aplicados}
          cambiar={(p) => {
            cambiarAplicados(p)
            cambiar(p)
          }}
          limpiar={() => {
            limpiarAplicados()
            setBorrador((f) => ({ ...SIN_FILTROS, busqueda: f.busqueda }))
          }}
        />
        <TablaTickets filas={filas} alLimpiar={limpiarAplicados} />
      </div>
    </div>
  )
}

/* 3 · Vistas rápidas ------------------------------------------------------------------- */

const VISTAS = [
  { value: 'todos', label: 'Todos' },
  { value: 'abiertos', label: 'Abiertos' },
  { value: 'urgentes', label: 'Urgentes' },
  { value: 'sin-asignar', label: 'Sin asignar' },
] as const

const deVista = (vista: string, t: Ticket) =>
  vista === 'abiertos' ? t.estado === 'abierto' || t.estado === 'en-curso'
  : vista === 'urgentes' ? t.prioridad === 'critica' || t.prioridad === 'alta'
  : vista === 'sin-asignar' ? !t.responsable
  : true

function VistasRapidas() {
  const [vista, setVista] = useState<string>('todos')
  const [categorias, setCategorias] = useState<string[]>([])
  const [busqueda, setBusqueda] = useState('')

  const filas = useMemo(
    () =>
      aplicar(
        TICKETS.filter((t) => deVista(vista, t) && (categorias.length === 0 || categorias.includes(t.categoria))),
        { ...SIN_FILTROS, busqueda },
      ),
    [vista, categorias, busqueda],
  )
  const limpiar = () => {
    setVista('todos')
    setCategorias([])
    setBusqueda('')
  }

  return (
    <div className="gl-tk__plantilla">
      <div className="gl-tk__fila">
        <SegmentedControl
          label="Vista"
          size="sm"
          value={vista}
          onValueChange={setVista}
          options={VISTAS.map((v) => ({ ...v, count: TICKETS.filter((t) => deVista(v.value, t)).length }))}
        />
        <SearchInput label="Buscar tickets" placeholder="Número, asunto o responsable" value={busqueda} onValueChange={setBusqueda} debounce={150} size="sm" />
      </div>
      <div className="gl-tk__aplicados" role="group" aria-label="Categoría">
        {CATEGORIAS_TICKET.map((c) => (
          <Chip
            key={c}
            variant="selectable"
            selected={categorias.includes(c)}
            onSelectedChange={(activo) => setCategorias((lista) => alternar(lista, c, activo))}
          >
            {`${c} (${cuenta(TICKETS, 'categoria', c)})`}
          </Chip>
        ))}
      </div>
      <p className="gl-tk__resumen" role="status">
        {filas.length} {filas.length === 1 ? 'ticket' : 'tickets'}
      </p>
      <TablaTickets filas={filas} alLimpiar={limpiar} />
    </div>
  )
}

/* 4 · Catálogo de controles ------------------------------------------------------------ */

function Muestra({ titulo, uso, children }: { titulo: string; uso: string; children: ReactNode }) {
  return (
    <section className="gl-tk__muestra">
      <h3 className="gl-tk__muestra-titulo">{titulo}</h3>
      <p className="gl-tk__muestra-uso">{uso}</p>
      {children}
    </section>
  )
}

function Catalogo() {
  const [texto, setTexto] = useState('')
  const [estado, setEstado] = useState('')
  const [prioridad, setPrioridad] = useState('media')
  const [soloMios, setSoloMios] = useState(false)
  const [urgentes, setUrgentes] = useState(true)
  const [horas, setHoras] = useState<[number, number]>([0, 200])
  const [fechas, setFechas] = useState<[Date | null, Date | null]>([null, null])

  return (
    <div className="gl-tk__catalogo">
      <Muestra titulo="SearchInput" uso="Búsqueda libre por texto. Declara su alcance en la etiqueta y espera 150 ms antes de filtrar.">
        <SearchInput label="Buscar tickets" placeholder="Número o asunto" value={texto} onValueChange={setTexto} debounce={150} />
      </Muestra>
      <Muestra titulo="Select" uso="Un valor entre muchos (más de cuatro). Ideal para responsable o categoría en pantallas angostas.">
        <FormField label="Estado">
          <Select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            placeholder="Todos"
            options={ESTADOS_TICKET.map((e) => ({ value: e, label: ETIQUETA_ESTADO_TICKET[e] }))}
          />
        </FormField>
      </Muestra>
      <Muestra titulo="Checkbox" uso="Varios valores a la vez, todos visibles. Para listas cortas, dentro del Filter Panel.">
        <div className="gl-tk__casillas">
          {PRIORIDADES_TICKET.map((p) => (
            <Checkbox key={p} label={ETIQUETA_PRIORIDAD_TICKET[p]} defaultChecked={p === 'alta'} />
          ))}
        </div>
      </Muestra>
      <Muestra titulo="Radio" uso="Un solo valor con todas las opciones visibles. Para listas cortas y excluyentes.">
        <div className="gl-tk__casillas" role="radiogroup" aria-label="Prioridad mínima">
          {PRIORIDADES_TICKET.map((p) => (
            <Radio key={p} name="prioridad-minima" value={p} label={ETIQUETA_PRIORIDAD_TICKET[p]} checked={prioridad === p} onChange={() => setPrioridad(p)} />
          ))}
        </div>
      </Muestra>
      <Muestra titulo="Switch" uso="Un ajuste que se enciende o se apaga: «Solo mis tickets», «Ocultar cerrados».">
        <div className="gl-tk__casillas">
          <Switch label="Solo mis tickets" checked={soloMios} onCheckedChange={setSoloMios} />
          <Switch label="Mostrar urgentes primero" description="Ordena por prioridad antes que por fecha." checked={urgentes} onCheckedChange={setUrgentes} />
        </div>
      </Muestra>
      <Muestra titulo="RangeSlider" uso="Un intervalo numérico: antigüedad, horas de respuesta, monto. Con formatValue muestra la unidad.">
        <RangeSlider label="Antigüedad" min={0} max={HORAS_MAX} step={8} value={horas} onValueChange={setHoras} formatValue={(v) => `${v} h`} />
      </Muestra>
      <Muestra titulo="DateRangePicker" uso="Un rango de fechas con atajos. allowOpenEnded permite «desde» o «hasta» sin el otro extremo.">
        <DateRangePicker
          label="Creado entre"
          value={fechas}
          onValueChange={setFechas}
          allowOpenEnded
          maxDate={HOY}
          shortcuts={[
            { label: 'Últimos 7 días', range: [new Date(HOY.getTime() - 7 * 24 * HORA), HOY] },
            { label: 'Últimos 30 días', range: [new Date(HOY.getTime() - 30 * 24 * HORA), HOY] },
          ]}
        />
      </Muestra>
    </div>
  )
}

/* La pantalla -------------------------------------------------------------------------- */

const PLANTILLAS = [
  { value: 'barra', label: 'Barra de filtros', vista: <BarraDeFiltros />, uso: 'Table Toolbar con Filter Control: pocos filtros (de dos a cinco), siempre a la vista, con los aplicados como Chips.' },
  { value: 'panel', label: 'Panel lateral', vista: <PanelLateral />, uso: 'Filter Panel con grupos plegables y «Aplicar» explícito: muchos filtros de tipos distintos.' },
  { value: 'rapidas', label: 'Vistas rápidas', vista: <VistasRapidas />, uso: 'Segmented Control con contadores y Chips seleccionables: atajos de uno o dos clics.' },
  { value: 'catalogo', label: 'Catálogo', vista: <Catalogo />, uso: 'Cada control de filtro suelto, con cuándo usarlo.' },
] as const

export default function FiltrosTickets() {
  const [plantilla, setPlantilla] = useState<string>('barra')
  const actual = PLANTILLAS.find((p) => p.value === plantilla) ?? PLANTILLAS[0]

  return (
    <div className="gl-pagina gl-pagina--ancha">
      <Encabezado
        titulo="Filtros de tickets"
        descripcion="Plantillas de un tablero de tickets con filtros, hechas solo con @aybarcorp/ui y datos sintéticos en memoria. Elige una, mírala con teclado y copia su código."
        migas={migasDe({ id: 'filtros' })}
      />
      <Tabs value={plantilla} onValueChange={setPlantilla} items={PLANTILLAS.map(({ value, label }) => ({ value, label }))} variant="pill" size="sm" />
      <p className="gl-tk__uso">{actual.uso}</p>
      <div role="tabpanel" aria-label={actual.label}>
        {actual.vista}
      </div>
    </div>
  )
}
