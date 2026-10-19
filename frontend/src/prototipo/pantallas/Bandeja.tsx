import {
  Badge,
  Button,
  Card,
  CardBody,
  Checkbox,
  Chip,
  DataGrid,
  EmptyState,
  FilterControl,
  Header,
  Icon,
  Pagination,
  SearchInput,
  Skeleton,
  TableToolbar,
  Tabs,
  toast,
} from '@aybarcorp/ui'
import type { FilterValue, GridColumn, TableSort } from '@aybarcorp/ui'
import { useEffect, useMemo, useState } from 'react'
import { EMPRESAS, ESTADOS_ACTIVOS, NOMBRE_AREA, nombrePersona, nombreTipo } from '../datos/catalogos.ts'
import { cliente, dniEnmascarado } from '../datos/clientes.ts'
import { AvisoDeError, BadgeEstado, Prohibido, BadgePrioridad, BadgeSla, TABLETA, irA, restante, useAccion, useCarga, useMedia } from '../comun.tsx'
import { hrefDe } from '../rutas.ts'
import { api, useConsola, useSesion } from '../servicio/api.ts'
import { estadoSla, puede } from '../servicio/nucleo.ts'
import { porUrgencia, rayoActivo } from '../servicio/ola6.ts'
import type { EstadoSla, Ticket } from '../servicio/nucleo.ts'

type Vista = 'mios' | 'area' | 'sin-asignar' | 'todas'

interface Fila {
  readonly ticket: Ticket
  readonly sla: EstadoSla
  readonly cliente: string
  readonly dni: string
}

const NOMBRE_VISTA: Record<Vista, string> = { mios: 'Míos', area: 'Mi área', 'sin-asignar': 'Sin asignar', todas: 'Todas las áreas' }

/**
 * Bandeja (casillero) — HU-ATC-009, con el chip de SLA de HU-ATC-010. Es una consulta sobre
 * los tickets (área actual + responsable + estado activo), ordenada por vencimiento; no
 * guarda nada propio. Los tickets del área sin persona salen como «Sin asignar» y se toman.
 */
export function Bandeja() {
  const sesion = useSesion()
  const { datos } = useConsola()
  const [carga, reintentar] = useCarga('bandeja')
  const tableta = useMedia(TABLETA)
  const vistas: Vista[] =
    sesion.rol === 'SUPERVISOR' ? ['todas', 'area', 'sin-asignar'] : sesion.rol === 'COORDINADOR_CX' ? ['todas', 'sin-asignar'] : ['mios', 'area', 'sin-asignar']
  const [vista, setVista] = useState<Vista>(vistas[0])
  const [busqueda, setBusqueda] = useState('')
  const [empresas, setEmpresas] = useState<string[]>([])
  const [soloRiesgo, setSoloRiesgo] = useState(false)
  const [conCerrados, setConCerrados] = useState(false)
  const [orden, setOrden] = useState<TableSort>({ key: 'urgencia', dir: 'asc' })
  const [pagina, setPagina] = useState(1)
  const [porPagina, setPorPagina] = useState(10)
  const tomar = useAccion()

  // Cambiar de rol puede dejar una pestaña que el rol nuevo no tiene.
  const vistaVigente = vistas.includes(vista) ? vista : vistas[0]

  const enVista = (t: Ticket, v: Vista) => {
    if (v === 'mios') return t.responsable === sesion.id
    if (v === 'area') return t.area === sesion.area
    if (v === 'sin-asignar') return !t.responsable && (sesion.rol === 'SUPERVISOR' || sesion.rol === 'COORDINADOR_CX' || t.area === sesion.area)
    return true
  }
  const activo = (t: Ticket) => conCerrados || ESTADOS_ACTIVOS.includes(t.estado)

  const filas = useMemo<Fila[]>(() => {
    const q = busqueda.trim().toLowerCase()
    const lista = datos.tickets
      .filter((t) => enVista(t, vistaVigente) && activo(t))
      .map((t) => {
        const c = cliente(t.clienteId)
        return { ticket: t, sla: estadoSla(t, datos.ahora), cliente: c?.nombre ?? '—', dni: c?.dni ?? '' }
      })
      .filter(
        (f) =>
          (!q || `${f.ticket.numero} ${f.cliente} ${f.ticket.resumen}`.toLowerCase().includes(q) || (/^\d{3,}$/.test(q) && f.dni.startsWith(q))) &&
          (empresas.length === 0 || empresas.includes(f.ticket.empresaId)) &&
          (!soloRiesgo || f.sla.nivel === 'en-riesgo' || f.sla.nivel === 'vencido'),
      )
    // HU-ATC-044 CA-01: rayo, SLA más próximo y prioridad (el orden por defecto).
    if (orden.key === 'urgencia') return lista.sort((a, b) => porUrgencia(datos)(a.ticket, b.ticket))
    const signo = orden.dir === 'asc' ? 1 : -1
    return lista.sort((a, b) => {
      if (orden.key === 'numero') return a.ticket.numero.localeCompare(b.ticket.numero) * signo
      if (orden.key === 'estado') return (ESTADOS_ACTIVOS.indexOf(a.ticket.estado) - ESTADOS_ACTIVOS.indexOf(b.ticket.estado)) * signo
      return (a.sla.vence.getTime() - b.sla.vence.getTime()) * signo
    })
  }, [datos, vistaVigente, busqueda, empresas, soloRiesgo, conCerrados, orden, sesion.id])

  useEffect(() => setPagina(1), [vistaVigente, busqueda, empresas, soloRiesgo, conCerrados, porPagina])

  if (!puede.atender(sesion.rol) && sesion.rol !== 'COORDINADOR_CX') {
    return (
      <div className="pt-pagina">
        <Header title="Bandeja de tickets" />
        <Prohibido requiere="de atención al cliente (gestor, colaborador o supervisor)" recurso="ver la bandeja de tickets" volver={false} />
      </div>
    )
  }

  const paginas = Math.max(1, Math.ceil(filas.length / porPagina))
  const vigente = Math.min(pagina, paginas)
  const visibles = filas.slice((vigente - 1) * porPagina, vigente * porPagina)
  const cuenta = (v: Vista) => datos.tickets.filter((t) => enVista(t, v) && ESTADOS_ACTIVOS.includes(t.estado)).length
  const enRiesgo = filas.filter((f) => f.sla.nivel === 'en-riesgo' || f.sla.nivel === 'vencido').length
  const hayFiltros = Boolean(busqueda || empresas.length || soloRiesgo || conCerrados)
  const limpiar = () => {
    setBusqueda('')
    setEmpresas([])
    setSoloRiesgo(false)
    setConCerrados(false)
  }
  const puedeTomar = (t: Ticket) => !t.responsable && puede.atender(sesion.rol) && (sesion.rol === 'SUPERVISOR' || t.area === sesion.area)

  const alTomar = async (t: Ticket) => {
    const hecho = await tomar.ejecutar(async () => {
      await api.tomar(t.id)
      return true
    })
    if (hecho) toast({ message: `Tomaste ${t.numero}: ya está en «Míos».`, tone: 'success' })
  }

  const accion = (t: Ticket) =>
    puedeTomar(t) ? (
      <Button size="sm" variant="secondary" loading={tomar.enCurso} onClick={() => alTomar(t)}>
        Tomar
      </Button>
    ) : (
      <Button size="sm" variant="ghost" onClick={() => irA(hrefDe(`ticket/${t.id}`))}>
        Abrir
      </Button>
    )

  const columnas: GridColumn<Fila>[] = [
    {
      key: 'numero',
      header: 'N.º',
      sortable: true,
      width: '8.5rem',
      renderCell: (f) => (
        <span className="pt-celda-doble">
          <button type="button" tabIndex={-1} className="pt-enlace-celda" onClick={() => irA(hrefDe(`ticket/${f.ticket.id}`))}>
            {f.ticket.numero}
          </button>
          {rayoActivo(datos, f.ticket.id) ? <Badge tone="danger" size="sm">Rayo</Badge> : null}
        </span>
      ),
    },
    {
      key: 'resumen',
      header: 'Solicitud',
      width: '20rem',
      renderCell: (f) => (
        <span className="pt-celda-doble">
          <span className="pt-celda-doble__principal">{f.ticket.resumen}</span>
          <span className="pt-celda-doble__secundaria">
            {f.cliente} · DNI {dniEnmascarado(f.dni)} · {nombreTipo(f.ticket.tipo)} · {f.ticket.canal}
          </span>
        </span>
      ),
    },
    { key: 'estado', header: 'Estado', sortable: true, width: '8rem', renderCell: (f) => <BadgeEstado estado={f.ticket.estado} size="sm" /> },
    { key: 'prioridad', header: 'Prioridad', width: '8.5rem', renderCell: (f) => <BadgePrioridad prioridad={f.ticket.prioridad} size="sm" /> },
    {
      key: 'responsable',
      header: 'Área · responsable',
      width: '11rem',
      renderCell: (f) => (
        <span className="pt-celda-doble">
          <span className="pt-celda-doble__principal">{NOMBRE_AREA[f.ticket.area]}</span>
          {f.ticket.responsable ? (
            <span className="pt-celda-doble__secundaria">{nombrePersona(f.ticket.responsable)}</span>
          ) : (
            <Badge tone="warning" size="sm">
              Sin asignar
            </Badge>
          )}
        </span>
      ),
    },
    {
      key: 'vence',
      header: 'SLA',
      sortable: true,
      width: '11rem',
      renderCell: (f) => (
        <span className="pt-celda-doble">
          <BadgeSla sla={f.sla} size="sm" />
          <span className="pt-celda-doble__secundaria">
            {f.sla.nivel === 'cumplido' || f.sla.nivel === 'fuera-de-plazo' ? 'Resuelto' : `${f.sla.hito === 'respuesta' ? '1.ª resp.' : 'Resol.'} ${restante(f.sla.vence, datos.ahora)}`}
          </span>
        </span>
      ),
    },
    { key: 'accion', header: 'Acción', width: '6.5rem', renderCell: (f) => accion(f.ticket) },
  ]

  const vacio = datos.tickets.length === 0 ? (
    <EmptyState
      variant="first-use"
      title="Aún no hay tickets"
      description="Cuando registres la primera solicitud de un cliente, aparecerá aquí ordenada por vencimiento."
      action={
        puede.registrar(sesion.rol) ? (
          <Button variant="primary" onClick={() => irA(hrefDe('nuevo'))}>
            Registrar el primer ticket
          </Button>
        ) : undefined
      }
    />
  ) : hayFiltros ? (
    <EmptyState
      size="compact"
      variant="no-results"
      title="Ningún ticket coincide"
      description="Prueba con otro número o nombre, o quita los filtros."
      action={
        <Button variant="secondary" size="sm" onClick={limpiar}>
          Quitar la búsqueda y los filtros
        </Button>
      }
    />
  ) : (
    <EmptyState
      size="compact"
      title={vistaVigente === 'sin-asignar' ? 'Nada sin asignar' : vistaVigente === 'mios' ? 'No tienes tickets pendientes' : 'Sin tickets activos'}
      description={
        vistaVigente === 'sin-asignar'
          ? 'Todos los tickets de tu área tienen responsable.'
          : vistaVigente === 'mios'
            ? 'Revisa «Sin asignar» para tomar uno del área.'
            : 'No hay tickets activos en esta vista.'
      }
    />
  )

  return (
    <div className="pt-pagina pt-pagina--ancha">
      <Header
        title="Bandeja de tickets"
        description={`Tickets activos de ${vistaVigente === 'todas' ? 'todas las áreas' : `tu área (${sesion.area === 'CX' || sesion.area === 'VENTAS' ? sesion.area : NOMBRE_AREA[sesion.area]})`}, del vencimiento más próximo al más lejano.`}
        actions={
          puede.registrar(sesion.rol) ? (
            <Button variant="primary" leadingIcon={<Icon name="plus" size={16} />} onClick={() => irA(hrefDe('nuevo'))}>
              Nuevo ticket
            </Button>
          ) : undefined
        }
        tabs={
          <Tabs
            value={vistaVigente}
            onValueChange={(v) => setVista(v as Vista)}
            items={vistas.map((v) => ({ value: v, label: NOMBRE_VISTA[v], count: cuenta(v) }))}
          />
        }
      />

      {tomar.error ? <AvisoDeError error={tomar.error} /> : null}

      {carga.fase === 'error' ? (
        <AvisoDeError error={carga.error} reintentar={reintentar} titulo="No se pudo cargar la bandeja" />
      ) : (
        <div className="pt-bandeja">
          <TableToolbar
            search={<SearchInput label="Buscar tickets" placeholder="N.º, cliente, DNI o resumen" value={busqueda} onValueChange={setBusqueda} debounce={150} size="sm" />}
            filters={
              <>
                <Chip variant="selectable" selected={soloRiesgo} onSelectedChange={setSoloRiesgo} leading={<Icon name="warning" size={16} />}>
                  En riesgo o vencidos{carga.fase === 'listo' ? ` (${soloRiesgo ? filas.length : enRiesgo})` : ''}
                </Chip>
                <FilterControl
                  size="sm"
                  label="Razón social"
                  type="multi"
                  searchable
                  options={EMPRESAS.map((e) => ({ value: e.id, label: `${e.id} · ${e.nombre}` }))}
                  value={empresas}
                  onValueChange={(v) => setEmpresas(comoLista(v))}
                />
                <Checkbox label="Incluir resueltos y cerrados" checked={conCerrados} onChange={(e) => setConCerrados(e.target.checked)} />
                {hayFiltros ? (
                  <Button variant="ghost" size="sm" onClick={limpiar}>
                    Quitar filtros
                  </Button>
                ) : null}
              </>
            }
            resultCount={carga.fase === 'listo' ? filas.length : undefined}
            itemLabel="tickets"
          />

          {tableta ? (
            <DataGrid<Fila>
              caption={`Bandeja: ${NOMBRE_VISTA[vistaVigente]}`}
              columns={columnas}
              rows={carga.fase === 'listo' ? visibles : []}
              getRowId={(f) => f.ticket.id}
              sort={orden}
              onSortChange={setOrden}
              loading={carga.fase === 'cargando'}
              totalRows={filas.length}
              emptyState={vacio}
            />
          ) : carga.fase === 'cargando' ? (
            <div className="pt-tarjetas" aria-busy="true">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} variant="block" height="8rem" />
              ))}
            </div>
          ) : visibles.length ? (
            <ul className="pt-tarjetas" aria-label={`Bandeja: ${NOMBRE_VISTA[vistaVigente]}`}>
              {visibles.map((f) => (
                <li key={f.ticket.id}>
                  <Card>
                    <CardBody padding="sm">
                      <div className="pt-tarjeta">
                        <div className="pt-tarjeta__cabeza">
                          <a className="pt-tarjeta__numero" href={hrefDe(`ticket/${f.ticket.id}`)}>
                            {f.ticket.numero}
                          </a>
                          <BadgeSla sla={f.sla} size="sm" />
                        </div>
                        <p className="pt-tarjeta__resumen">{f.ticket.resumen}</p>
                        <p className="pt-texto-chico">
                          {f.cliente} · {NOMBRE_AREA[f.ticket.area]} · {f.ticket.responsable ? nombrePersona(f.ticket.responsable) : 'Sin asignar'}
                        </p>
                        <div className="pt-tarjeta__pie">
                          <BadgeEstado estado={f.ticket.estado} size="sm" />
                          <BadgePrioridad prioridad={f.ticket.prioridad} size="sm" />
                          <span className="pt-tarjeta__accion">{accion(f.ticket)}</span>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </li>
              ))}
            </ul>
          ) : (
            vacio
          )}

          {carga.fase === 'listo' && filas.length > porPagina ? (
            <Pagination
              page={vigente}
              pageCount={paginas}
              onPageChange={setPagina}
              pageSize={porPagina}
              pageSizeOptions={[10, 20, 50]}
              onPageSizeChange={setPorPagina}
              total={filas.length}
              itemLabel="tickets"
              variant={tableta ? 'numbered' : 'compact'}
            />
          ) : null}
        </div>
      )}
    </div>
  )
}

function comoLista(valor: FilterValue | undefined): string[] {
  if (Array.isArray(valor)) return valor.filter((v): v is string => typeof v === 'string')
  return typeof valor === 'string' ? [valor] : []
}
