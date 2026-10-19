import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  Checkbox,
  ConfirmationDialog,
  CrudToolbar,
  DataGrid,
  Drawer,
  EmptyState,
  FilterControl,
  Form,
  FormField,
  FormGroup,
  Icon,
  Input,
  Pagination,
  SearchInput,
  Select,
  SidePanel,
  Splitter,
  TableToolbar,
  TagList,
  Timeline,
  toast,
} from '@aybarcorp/ui'
import type { FilterValue, GridColumn, TableSort } from '@aybarcorp/ui'
import { useEffect, useId, useMemo, useState } from 'react'
import { AREAS_DISPONIBLES, HOY, ROLES, copiaDePersonas, haceMinutos } from '../../datos'
import type { Area, EstadoPersona, Persona } from '../../datos'
import { ESCRITORIO, avisoDemo, fechaCorta, haceCuanto, useMedia } from '../../utiles'
import { normalizar } from '../../vitrina/catalogo'
import { errorDeCorreo } from '../ingreso/comun'
import { ETIQUETA_ESTADO_PERSONA, TONO_ESTADO_PERSONA, eventosDe, hitoDe, nombreDeRol } from './comun'

interface Filtros {
  areas: string[]
  roles: string[]
  estado: string | undefined
}

const SIN_FILTROS: Filtros = { areas: [], roles: [], estado: undefined }
const ORDEN_ESTADO: Record<EstadoPersona, number> = { activo: 0, invitado: 1, suspendido: 2 }

/**
 * Usuarios: un CRUD en memoria sobre las 64 personas sintéticas. Data Grid con orden,
 * selección y paginación; Table Toolbar con búsqueda y filtros por área, rol y estado;
 * Crud Toolbar para las acciones en lote (asignar rol, suspender) con su confirmación y su
 * progreso; Drawer de alta y edición con Form validado; y el detalle de la persona en un
 * Splitter (lista | detalle) en escritorio o en un Side Panel (que es un Drawer) en el celular.
 */
export function Usuarios() {
  const escritorio = useMedia(ESCRITORIO)
  const [personas, setPersonas] = useState<Persona[]>(copiaDePersonas)
  const [busqueda, setBusqueda] = useState('')
  const [filtros, setFiltros] = useState<Filtros>(SIN_FILTROS)
  const [orden, setOrden] = useState<TableSort>({ key: 'nombre', dir: 'asc' })
  const [seleccion, setSeleccion] = useState<Set<string>>(() => new Set())
  const [pagina, setPagina] = useState(1)
  const [porPagina, setPorPagina] = useState(10)
  const [activaId, setActivaId] = useState<string | null>(null)
  const [cajon, setCajon] = useState<{ persona: Persona | null } | null>(null)
  const [asignar, setAsignar] = useState(false)
  const [rolElegido, setRolElegido] = useState('VENTAS')
  const [cambioEstado, setCambioEstado] = useState<Persona | null>(null)
  const [progreso, setProgreso] = useState<{ done: number; total: number } | undefined>()
  const [resultado, setResultado] = useState<{ ok: number; failed: number } | undefined>()

  const filtradas = useMemo(() => {
    const q = normalizar(busqueda)
    const lista = personas.filter(
      (p) =>
        (!q || normalizar(`${p.nombre} ${p.correo} ${p.area}`).includes(q)) &&
        (filtros.areas.length === 0 || filtros.areas.includes(p.area)) &&
        (filtros.roles.length === 0 || filtros.roles.some((r) => p.roles.includes(r))) &&
        (!filtros.estado || p.estado === filtros.estado),
    )
    const signo = orden.dir === 'asc' ? 1 : -1
    return [...lista].sort((a, b) => {
      if (orden.key === 'estado') return (ORDEN_ESTADO[a.estado] - ORDEN_ESTADO[b.estado]) * signo
      if (orden.key === 'ultimoAcceso') return ((a.ultimoAcceso ?? '').localeCompare(b.ultimoAcceso ?? '')) * signo
      const clave = orden.key === 'area' ? 'area' : 'nombre'
      return a[clave].localeCompare(b[clave], 'es') * signo
    })
  }, [personas, busqueda, filtros, orden])

  const paginas = Math.max(1, Math.ceil(filtradas.length / porPagina))
  const paginaVigente = Math.min(pagina, paginas)
  const visibles = filtradas.slice((paginaVigente - 1) * porPagina, paginaVigente * porPagina)
  const activa = personas.find((p) => p.id === activaId) ?? null
  const elegidas = personas.filter((p) => seleccion.has(p.id))
  const aplicados = filtros.areas.length + filtros.roles.length + (filtros.estado ? 1 : 0)

  // Al buscar o filtrar se vuelve a la primera página: la actual puede ya no existir.
  useEffect(() => setPagina(1), [busqueda, filtros, porPagina])

  const actualizar = (ids: readonly string[], cambio: (p: Persona) => Persona) =>
    setPersonas((lista) => lista.map((p) => (ids.includes(p.id) ? cambio(p) : p)))

  /** Una operación en lote con su progreso, persona a persona, como lo haría un servidor. */
  const enLote = async (ids: string[], cambio: (p: Persona) => Persona, mensaje: string) => {
    setResultado(undefined)
    for (let i = 0; i < ids.length; i++) {
      setProgreso({ done: i, total: ids.length })
      await new Promise((r) => setTimeout(r, 120))
    }
    actualizar(ids, cambio)
    setProgreso(undefined)
    setResultado({ ok: ids.length, failed: 0 })
    setSeleccion(new Set())
    toast({ message: mensaje, tone: 'success' })
  }

  const columnas: GridColumn<Persona>[] = [
    {
      key: 'nombre',
      header: 'Persona',
      sortable: true,
      width: '15rem',
      renderCell: (p) => (
        <span className="gl-persona">
          <Avatar name={p.nombre} size="sm" decorative />
          <span className="gl-persona__texto">
            {/* Un solo punto de tabulación en la rejilla: Enter en la celda pulsa este botón. */}
            <button type="button" tabIndex={-1} className="gl-persona__nombre" onClick={() => setActivaId(p.id)}>
              {p.nombre}
            </button>
            <span className="gl-persona__correo">{p.correo}</span>
          </span>
        </span>
      ),
    },
    { key: 'area', header: 'Área', sortable: true, width: '9rem' },
    { key: 'roles', header: 'Roles', width: '11rem', renderCell: (p) => <TagList tags={p.roles.map(nombreDeRol)} max={2} /> },
    {
      key: 'estado',
      header: 'Estado',
      sortable: true,
      width: '7rem',
      renderCell: (p) => (
        <Badge tone={TONO_ESTADO_PERSONA[p.estado]} size="sm">
          {ETIQUETA_ESTADO_PERSONA[p.estado]}
        </Badge>
      ),
    },
    {
      key: 'ultimoAcceso',
      header: 'Último acceso',
      sortable: true,
      width: '8rem',
      renderCell: (p) => (p.ultimoAcceso ? haceCuanto(p.ultimoAcceso, HOY) : 'Nunca'),
    },
  ]

  const lista = (
    <div className="gl-usuarios__lista">
      <h2 className="ay-visually-hidden">Personas</h2>
      {seleccion.size > 0 || progreso || resultado ? (
        <CrudToolbar
          selectedCount={seleccion.size}
          totalCount={filtradas.length}
          allMatchingSelected={seleccion.size === filtradas.length && filtradas.length > 0}
          onSelectAllMatching={() => setSeleccion(new Set(filtradas.map((p) => p.id)))}
          onClearSelection={() => {
            setSeleccion(new Set())
            setResultado(undefined)
          }}
          itemLabel={['persona', 'personas']}
          progress={progreso}
          result={seleccion.size === 0 ? resultado : undefined}
          actions={[
            { id: 'rol', label: (n, item) => `Asignar un rol a ${n} ${item}`, variant: 'secondary', onRun: () => setAsignar(true) },
            {
              id: 'exportar',
              label: (n, item) => `Exportar ${n} ${item}`,
              variant: 'ghost',
              onRun: () => avisoDemo('Demo: la exportación no sale del navegador.'),
            },
          ]}
          destructiveAction={{
            id: 'suspender',
            label: (n, item) => `Suspender ${n} ${item}`,
            variant: 'danger',
            onRun: () =>
              enLote(
                [...seleccion],
                (p) => ({ ...p, estado: 'suspendido' }),
                `${seleccion.size} ${seleccion.size === 1 ? 'persona suspendida' : 'personas suspendidas'} en esta maqueta.`,
              ),
          }}
        />
      ) : null}
      <TableToolbar
        search={<SearchInput label="Buscar personas" placeholder="Nombre, correo o área" value={busqueda} onValueChange={setBusqueda} debounce={150} size="sm" />}
        filters={
          <>
            <FilterControl
              size="sm"
              label="Área"
              type="multi"
              options={AREAS_DISPONIBLES.map((a) => ({ value: a, label: a, count: personas.filter((p) => p.area === a).length }))}
              value={filtros.areas}
              onValueChange={(v) => setFiltros((f) => ({ ...f, areas: comoLista(v) }))}
            />
            <FilterControl
              size="sm"
              label="Rol"
              type="multi"
              options={ROLES.map((r) => ({ value: r.id, label: r.nombre, count: personas.filter((p) => p.roles.includes(r.id)).length }))}
              value={filtros.roles}
              onValueChange={(v) => setFiltros((f) => ({ ...f, roles: comoLista(v) }))}
            />
            <FilterControl
              size="sm"
              label="Estado"
              type="single"
              options={(['activo', 'invitado', 'suspendido'] as const).map((e) => ({
                value: e,
                label: ETIQUETA_ESTADO_PERSONA[e],
                count: personas.filter((p) => p.estado === e).length,
              }))}
              value={filtros.estado}
              onValueChange={(v) => setFiltros((f) => ({ ...f, estado: typeof v === 'string' ? v : undefined }))}
            />
            {aplicados > 0 ? (
              <Button variant="ghost" size="sm" onClick={() => setFiltros(SIN_FILTROS)}>
                Quitar {aplicados} {aplicados === 1 ? 'filtro' : 'filtros'}
              </Button>
            ) : null}
          </>
        }
        actions={
          <Button variant="primary" size="sm" leadingIcon={<Icon name="plus" size={16} />} onClick={() => setCajon({ persona: null })}>
            Nueva persona
          </Button>
        }
        resultCount={filtradas.length}
        itemLabel="personas"
      />
      <DataGrid<Persona>
        caption="Personas de la organización"
        columns={columnas}
        rows={visibles}
        getRowId={(p) => p.id}
        selection={seleccion}
        onSelectionChange={(s) => {
          setSeleccion(new Set(s))
          setResultado(undefined)
        }}
        sort={orden}
        onSortChange={setOrden}
        totalRows={filtradas.length}
        emptyState={
          <EmptyState
            size="compact"
            variant="no-results"
            title="Nadie coincide con la búsqueda"
            description="Prueba con otro nombre o quita algún filtro."
            action={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setBusqueda('')
                  setFiltros(SIN_FILTROS)
                }}
              >
                Limpiar la búsqueda y los filtros
              </Button>
            }
          />
        }
      />
      <Pagination
        page={paginaVigente}
        pageCount={paginas}
        onPageChange={setPagina}
        pageSize={porPagina}
        pageSizeOptions={[10, 20, 50]}
        onPageSizeChange={setPorPagina}
        total={filtradas.length}
        itemLabel="personas"
      />
    </div>
  )

  const detalle = activa ? (
    <Detalle
      persona={activa}
      onEditar={() => setCajon({ persona: activa })}
      onCambiarEstado={() => setCambioEstado(activa)}
      onCerrar={() => setActivaId(null)}
    />
  ) : (
    <EmptyState size="compact" title="Elige una persona" description="Pulsa su nombre en la lista (o Enter en su fila) para ver su ficha y su actividad." />
  )

  return (
    <>
      {escritorio ? (
        <div className="gl-usuarios">
          <Splitter defaultSize={70} min={45} max={82} persistKey="gl-admin-usuarios" label="Ajustar el ancho de la lista de personas">
            {lista}
            <section className="gl-usuarios__detalle" aria-label={activa ? `Ficha de ${activa.nombre}` : 'Ficha de la persona'}>
              {detalle}
            </section>
          </Splitter>
        </div>
      ) : (
        <>
          {lista}
          <SidePanel
            open={activa !== null}
            onOpenChange={(abierto) => {
              if (!abierto) setActivaId(null)
            }}
            title={activa?.nombre ?? 'Persona'}
            size="md"
          >
            {activa ? detalle : null}
          </SidePanel>
        </>
      )}

      <EditarPersona
        estado={cajon}
        onCerrar={() => setCajon(null)}
        onGuardar={(persona, nueva) => {
          if (nueva) setPersonas((lista) => [persona, ...lista])
          else actualizar([persona.id], () => persona)
          setCajon(null)
          setActivaId(persona.id)
          toast({ message: nueva ? `${persona.nombre} dada de alta en esta maqueta.` : `Cambios de ${persona.nombre} guardados.`, tone: 'success' })
        }}
      />

      <ConfirmationDialog
        open={asignar}
        onOpenChange={setAsignar}
        tone="neutral"
        title={`¿Asignar un rol a ${elegidas.length} ${elegidas.length === 1 ? 'persona' : 'personas'}?`}
        description="Se suma a los roles que ya tienen; quien ya lo tenga no cambia."
        confirmLabel={`Asignar ${nombreDeRol(rolElegido)}`}
        onConfirm={() => {
          setAsignar(false)
          void enLote(
            [...seleccion],
            (p) => (p.roles.includes(rolElegido) ? p : { ...p, roles: [...p.roles, rolElegido] }),
            `${nombreDeRol(rolElegido)} asignado a ${seleccion.size} ${seleccion.size === 1 ? 'persona' : 'personas'}.`,
          )
        }}
      >
        <FormField label="Rol">
          <Select value={rolElegido} onChange={(e) => setRolElegido(e.target.value)} options={ROLES.map((r) => ({ value: r.id, label: r.nombre }))} />
        </FormField>
      </ConfirmationDialog>

      <ConfirmationDialog
        open={cambioEstado !== null}
        onOpenChange={(abierto) => {
          if (!abierto) setCambioEstado(null)
        }}
        tone={cambioEstado?.estado === 'suspendido' ? 'neutral' : 'danger'}
        title={cambioEstado?.estado === 'suspendido' ? `¿Reactivar a ${cambioEstado.nombre}?` : `¿Suspender a ${cambioEstado?.nombre ?? ''}?`}
        description={
          cambioEstado?.estado === 'suspendido'
            ? 'Podrá volver a entrar con su contraseña y su segundo paso.'
            : 'No podrá entrar hasta que alguien la reactive. Sus datos y su historial se conservan.'
        }
        confirmLabel={cambioEstado?.estado === 'suspendido' ? 'Reactivar la cuenta' : 'Suspender la cuenta'}
        onConfirm={() => {
          if (!cambioEstado) return
          const nuevo: EstadoPersona = cambioEstado.estado === 'suspendido' ? 'activo' : 'suspendido'
          actualizar([cambioEstado.id], (p) => ({ ...p, estado: nuevo }))
          toast({ message: `${cambioEstado.nombre} ${nuevo === 'activo' ? 'reactivada' : 'suspendida'} en esta maqueta.`, tone: 'success' })
          setCambioEstado(null)
        }}
      />
    </>
  )
}

function comoLista(valor: FilterValue | undefined): string[] {
  if (Array.isArray(valor)) return valor.filter((v): v is string => typeof v === 'string')
  return typeof valor === 'string' ? [valor] : []
}

/** La ficha de una persona: sus datos, sus acciones y su actividad. */
function Detalle({ persona, onEditar, onCambiarEstado, onCerrar }: { persona: Persona; onEditar: () => void; onCambiarEstado: () => void; onCerrar: () => void }) {
  const eventos = eventosDe(persona.id)
  return (
    <div className="gl-ficha">
      <div className="gl-ficha__cabeza">
        <Avatar name={persona.nombre} size="lg" status={persona.estado === 'activo' ? 'online' : 'offline'} />
        <div className="gl-ficha__titulo">
          <h3 className="gl-subtitulo">{persona.nombre}</h3>
          <p className="gl-texto-chico">{persona.area}</p>
        </div>
        <Badge tone={TONO_ESTADO_PERSONA[persona.estado]}>{ETIQUETA_ESTADO_PERSONA[persona.estado]}</Badge>
      </div>
      <dl className="gl-datos">
        <dt>Correo</dt>
        <dd>{persona.correo}</dd>
        <dt>Teléfono</dt>
        <dd>{persona.telefono}</dd>
        <dt>Roles</dt>
        <dd>
          <TagList tags={persona.roles.map(nombreDeRol)} />
        </dd>
        <dt>Doble factor</dt>
        <dd>{persona.dobleFactor ? 'Activado' : 'Sin activar'}</dd>
        <dt>Alta</dt>
        <dd>{fechaCorta(persona.creada)}</dd>
        <dt>Último acceso</dt>
        <dd>{persona.ultimoAcceso ? haceCuanto(persona.ultimoAcceso, HOY) : 'Nunca entró'}</dd>
      </dl>
      <div className="gl-acciones gl-acciones--inicio">
        <Button variant="secondary" size="sm" leadingIcon={<Icon name="edit" size={16} />} onClick={onEditar}>
          Editar
        </Button>
        {persona.estado === 'invitado' ? (
          <Button variant="secondary" size="sm" onClick={() => avisoDemo(`Demo: la invitación se reenviaría a ${persona.correo}.`)}>
            Reenviar la invitación
          </Button>
        ) : (
          <Button variant={persona.estado === 'suspendido' ? 'secondary' : 'danger'} size="sm" onClick={onCambiarEstado}>
            {persona.estado === 'suspendido' ? 'Reactivar' : 'Suspender'}
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={onCerrar}>
          Cerrar la ficha
        </Button>
      </div>
      <h4 className="gl-ficha__seccion">Actividad</h4>
      {eventos.length > 0 ? (
        <Timeline label={`Actividad de ${persona.nombre}`} events={eventos.slice(0, 5).map(hitoDe)} />
      ) : (
        <p className="gl-texto-chico">Sin actividad registrada.</p>
      )}
    </div>
  )
}

/** El Drawer de alta y edición: un Form con validación por campo. */
function EditarPersona({
  estado,
  onCerrar,
  onGuardar,
}: {
  estado: { persona: Persona | null } | null
  onCerrar: () => void
  onGuardar: (persona: Persona, nueva: boolean) => void
}) {
  const persona = estado?.persona ?? null
  const id = useId()
  const ids = { nombre: `${id}-nombre`, correo: `${id}-correo` }
  const [valores, setValores] = useState({ nombre: '', correo: '', area: 'Ventas' as Area, roles: ['USER'], invitar: true })
  const [errores, setErrores] = useState<{ nombre?: string; correo?: string }>({})

  // Cada vez que se abre: los datos de la persona, o un alta en blanco.
  useEffect(() => {
    if (!estado) return
    setErrores({})
    setValores(
      persona
        ? { nombre: persona.nombre, correo: persona.correo, area: persona.area, roles: [...persona.roles], invitar: false }
        : { nombre: '', correo: '', area: 'Ventas', roles: ['USER'], invitar: true },
    )
  }, [estado, persona])

  const guardar = () => {
    const encontrados = {
      nombre: valores.nombre.trim() ? undefined : 'Escribe el nombre y los apellidos.',
      correo: errorDeCorreo(valores.correo),
    }
    setErrores(encontrados)
    if (encontrados.nombre || encontrados.correo) return
    const base: Persona = persona ?? {
      id: `u-alta-${Date.now().toString(36)}`,
      nombre: '',
      correo: '',
      telefono: '+51 900 000 099',
      area: 'Ventas',
      roles: [],
      estado: 'invitado',
      ultimoAcceso: null,
      creada: haceMinutos(0),
      dobleFactor: false,
    }
    onGuardar({ ...base, nombre: valores.nombre.trim(), correo: valores.correo.trim(), area: valores.area, roles: valores.roles.length ? valores.roles : ['USER'] }, !persona)
  }

  return (
    <Drawer
      open={estado !== null}
      onOpenChange={(abierto) => {
        if (!abierto) onCerrar()
      }}
      title={persona ? `Editar a ${persona.nombre}` : 'Nueva persona'}
      side="end"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" form={`${id}-formulario`}>
            {persona ? 'Guardar los cambios' : 'Dar de alta'}
          </Button>
        </>
      }
    >
      <Form id={`${id}-formulario`} onSubmit={guardar} errors={Object.fromEntries(Object.entries(errores).filter(([, m]) => m).map(([k, m]) => [ids[k as keyof typeof ids], m as string]))}>
        <FormField label="Nombre y apellidos" id={ids.nombre} error={errores.nombre} required>
          <Input value={valores.nombre} autoComplete="off" onChange={(e) => setValores((v) => ({ ...v, nombre: e.target.value }))} />
        </FormField>
        <FormField label="Correo" id={ids.correo} error={errores.correo} required helper="Usa el dominio de pruebas: nombre@ejemplo.test.">
          <Input type="email" autoComplete="off" value={valores.correo} onChange={(e) => setValores((v) => ({ ...v, correo: e.target.value }))} />
        </FormField>
        <FormField label="Área">
          <Select value={valores.area} onChange={(e) => setValores((v) => ({ ...v, area: e.target.value as Area }))} options={AREAS_DISPONIBLES.map((a) => ({ value: a, label: a }))} />
        </FormField>
        <FormGroup legend="Roles" description="USER es la base de todas las cuentas.">
          {ROLES.map((r) => (
            <Checkbox
              key={r.id}
              label={r.nombre}
              helper={r.descripcion}
              checked={valores.roles.includes(r.id)}
              disabled={r.id === 'USER'}
              onChange={(e) =>
                setValores((v) => ({ ...v, roles: e.target.checked ? [...v.roles, r.id] : v.roles.filter((x) => x !== r.id) }))
              }
            />
          ))}
        </FormGroup>
        {persona ? null : (
          <Checkbox
            label="Enviar la invitación por correo al guardar"
            checked={valores.invitar}
            onChange={(e) => setValores((v) => ({ ...v, invitar: e.target.checked }))}
          />
        )}
      </Form>
      <Card>
        <CardBody padding="sm">
          <p className="gl-texto-chico">Maqueta: el alta vive en memoria y desaparece al recargar.</p>
        </CardBody>
      </Card>
    </Drawer>
  )
}
