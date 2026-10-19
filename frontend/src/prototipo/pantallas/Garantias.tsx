import { Alert, Badge, Breadcrumb, Button, Card, CardBody, DataGrid, DatePicker, Drawer, EmptyState, Form, FormField, Header, Icon, Select, StatGroup, Tabs, Textarea, toast } from '@aybarcorp/ui'
import type { GridColumn } from '@aybarcorp/ui'
import { useEffect, useId, useMemo, useState } from 'react'
import { AvisoDeError, Prohibido, Supuesto, erroresDeCampos, fechaDia, irA, useAccion, useCarga } from '../comun.tsx'
import { cliente } from '../datos/clientes.ts'
import { hrefDe } from '../rutas.ts'
import { api, useConsola, useSesion } from '../servicio/api.ts'
import {
  COBERTURA_MESES,
  ENTREGAS,
  NOMBRE_ESTADO_GARANTIA,
  NOMBRE_TIPO_GARANTIA,
  TIPOS_GARANTIA,
  dentroDeCobertura,
  entregaDe,
  puedeGestionarGarantias,
  puedeVerGarantias,
  venceCobertura,
} from '../servicio/garantias.ts'
import type { EstadoGarantia, Garantia, TipoGarantia } from '../servicio/garantias.ts'
import type { Datos } from '../servicio/nucleo.ts'

type Tono = 'neutral' | 'info' | 'success' | 'warning' | 'danger'
export const TONO_GARANTIA: Record<EstadoGarantia, Tono> = { UNDER_REVIEW: 'info', NOT_ELIGIBLE: 'danger', APPROVED: 'success', REJECTED: 'neutral', RESOLVED: 'success' }

export function BadgeGarantia({ estado, size = 'md' }: { estado: EstadoGarantia; size?: 'sm' | 'md' }) {
  return (
    <Badge tone={TONO_GARANTIA[estado]} size={size}>
      {NOMBRE_ESTADO_GARANTIA[estado]}
    </Badge>
  )
}

/** Cobertura del reclamo contra la entrega real: chip con la palabra escrita. */
export function BadgeCobertura({ g, size = 'md' }: { g: Garantia; size?: 'sm' | 'md' }) {
  const e = entregaDe(g.entregaId)
  if (!e) return null
  const ok = dentroDeCobertura(e, g.tipo, g.reclamada)
  return (
    <Badge tone={ok ? 'success' : 'danger'} size={size} dot>
      {ok ? 'Dentro de cobertura' : 'Fuera de cobertura'}
    </Badge>
  )
}

/**
 * Garantías postventa — HU-ATC-033 a 036 (la lista y el registro). Cada reclamo cuelga de un
 * Acta de Entrega y se valida contra su cobertura al registrarse (RN-SVC-027).
 */
export default function Garantias() {
  const sesion = useSesion()
  const { datos } = useConsola()
  const [carga, reintentar] = useCarga('garantias')
  const [estado, setEstado] = useState<'todas' | 'abiertas' | 'cerradas'>('abiertas')
  const [registrar, setRegistrar] = useState(false)

  const filas = useMemo(
    () => datos.garantias.filter((g) => (estado === 'todas' ? true : estado === 'abiertas' ? g.estado === 'UNDER_REVIEW' : g.estado !== 'UNDER_REVIEW')),
    [datos.garantias, estado],
  )

  if (!puedeVerGarantias(sesion)) {
    return (
      <div className="pt-pagina">
        <Header title="Garantías postventa" />
        <Prohibido requiere="de atención al cliente" recurso="ver las garantías postventa" />
      </div>
    )
  }
  const gestiona = puedeGestionarGarantias(sesion)
  const columnas: GridColumn<Garantia>[] = [
    {
      key: 'codigo',
      header: 'Reclamo',
      width: '9rem',
      renderCell: (g) => (
        <button type="button" tabIndex={-1} className="pt-enlace-celda" onClick={() => irA(hrefDe(`garantias/${g.id}`))}>
          {g.codigo}
        </button>
      ),
    },
    {
      key: 'unidad',
      header: 'Unidad',
      width: '15rem',
      renderCell: (g) => {
        const e = entregaDe(g.entregaId)
        return (
          <span className="pt-celda-doble">
            <span className="pt-celda-doble__principal">{e?.unidad}</span>
            <span className="pt-celda-doble__secundaria">
              {g.entregaId} · {e ? (cliente(e.clienteId)?.nombre ?? '—') : '—'}
            </span>
          </span>
        )
      },
    },
    { key: 'tipo', header: 'Tipo', width: '10rem', renderCell: (g) => NOMBRE_TIPO_GARANTIA[g.tipo] },
    { key: 'reclamada', header: 'Reclamado', width: '9rem', renderCell: (g) => fechaDia(g.reclamada) },
    { key: 'cobertura', header: 'Cobertura', width: '11rem', renderCell: (g) => <BadgeCobertura g={g} size="sm" /> },
    { key: 'estado', header: 'Estado', width: '10rem', renderCell: (g) => <BadgeGarantia estado={g.estado} size="sm" /> },
    {
      key: 'inspeccion',
      header: 'Inspección',
      width: '10rem',
      renderCell: (g) => (g.inspeccion ? (g.inspeccion.registrada ? 'Registrada' : `Programada ${fechaDia(g.inspeccion.programada)}`) : '—'),
    },
  ]
  return (
    <div className="pt-pagina pt-pagina--ancha">
      <Header
        title="Garantías postventa"
        breadcrumb={<Breadcrumb items={[{ label: 'Bandeja', href: hrefDe('bandeja') }, { label: 'Garantías postventa' }]} />}
        description="Un reclamo siempre cuelga de un Acta de Entrega y solo procede dentro de la cobertura."
        actions={
          gestiona ? (
            <Button variant="primary" leadingIcon={<Icon name="plus" size={16} />} onClick={() => setRegistrar(true)}>
              Registrar reclamo
            </Button>
          ) : undefined
        }
        tabs={
          <Tabs
            value={estado}
            onValueChange={(v) => setEstado(v as typeof estado)}
            items={[
              { value: 'abiertas', label: 'En revisión', count: datos.garantias.filter((g) => g.estado === 'UNDER_REVIEW').length },
              { value: 'cerradas', label: 'Con resolución', count: datos.garantias.filter((g) => g.estado !== 'UNDER_REVIEW').length },
              { value: 'todas', label: 'Todas', count: datos.garantias.length },
            ]}
          />
        }
      />
      {carga.fase === 'error' ? (
        <AvisoDeError error={carga.error} reintentar={reintentar} titulo="No se pudieron cargar las garantías" />
      ) : (
        <div className="pt-pila">
          <StatGroup
            loading={carga.fase === 'cargando'}
            items={[
              { id: 'rev', label: 'En revisión', value: String(datos.garantias.filter((g) => g.estado === 'UNDER_REVIEW').length) },
              { id: 'sin', label: 'Sin inspección registrada', value: String(datos.garantias.filter((g) => g.estado === 'UNDER_REVIEW' && !g.inspeccion?.registrada).length) },
              { id: 'np', label: 'No procedentes', value: String(datos.garantias.filter((g) => g.estado === 'NOT_ELIGIBLE').length) },
            ]}
          />
          {!gestiona ? (
            <Alert tone="info" size="sm" title="Solo lectura">
              <span className="pt-alerta__texto">Los reclamos los gestiona Postventa y el supervisor ATC.</span>
            </Alert>
          ) : null}
          <Card>
            <CardBody>
              <div className="pt-pila">
                <DataGrid<Garantia>
                  caption="Reclamos de garantía"
                  columns={columnas}
                  rows={carga.fase === 'cargando' ? [] : [...filas].reverse()}
                  getRowId={(g) => g.id}
                  loading={carga.fase === 'cargando'}
                  emptyState={<EmptyState size="compact" variant={datos.garantias.length ? 'no-results' : 'first-use'} title="Sin reclamos en esta vista" description="Los reclamos se registran contra un Acta de Entrega." />}
                />
                <Supuesto>Cobertura desde la entrega real: estructural 120 meses; impermeabilización, acabados e instalaciones 12 meses (pregunta abierta de FT-ATC-10).</Supuesto>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
      <CajonRegistrar datos={datos} abierto={registrar} onCerrar={() => setRegistrar(false)} />
    </div>
  )
}

function CajonRegistrar({ datos, abierto, onCerrar }: { datos: Datos; abierto: boolean; onCerrar: () => void }) {
  const id = useId()
  const [entregaId, setEntregaId] = useState('')
  const [tipo, setTipo] = useState<TipoGarantia | ''>('')
  const [descripcion, setDescripcion] = useState('')
  const [ticketId, setTicketId] = useState('')
  const [reclamada, setReclamada] = useState<Date | null>(null)
  const guardar = useAccion()
  useEffect(() => {
    if (!abierto) return
    setEntregaId('')
    setTipo('')
    setDescripcion('')
    setTicketId('')
    setReclamada(null)
    guardar.limpiar()
  }, [abierto, guardar.limpiar])
  const errores = erroresDeCampos(guardar.error)
  const entrega = entregaDe(entregaId)
  const previo = entrega && tipo && reclamada ? dentroDeCobertura(entrega, tipo, reclamada) : null
  const tickets = datos.tickets.filter((t) => t.tipo === 'GAR' && (!entrega || t.clienteId === entrega.clienteId))
  const campo = (k: string) => `${id}-${k}`
  const enviar = async () => {
    const g = await guardar.ejecutar(() => api.registrarGarantia({ entregaId, tipo, descripcion, ticketId, reclamada }))
    if (g) {
      toast({ message: g.estado === 'NOT_ELIGIBLE' ? `${g.codigo} registrado como no procedente por vigencia.` : `${g.codigo} registrado y en revisión.`, tone: g.estado === 'NOT_ELIGIBLE' ? 'warning' : 'success' })
      onCerrar()
      irA(hrefDe(`garantias/${g.id}`))
    }
  }
  return (
    <Drawer
      open={abierto}
      onOpenChange={(a) => (a ? undefined : onCerrar())}
      title="Registrar reclamo de garantía"
      side="end"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" form={`${id}-f`} loading={guardar.enCurso}>
            Registrar el reclamo
          </Button>
        </>
      }
    >
      <Form id={`${id}-f`} onSubmit={enviar} errors={Object.fromEntries(Object.entries(errores).map(([k, m]) => [campo(k), m]))}>
        <FormField label="Acta de Entrega" id={campo('entrega')} error={errores.entrega} required helper="Sin entrega no hay reclamo.">
          <Select value={entregaId} placeholder="Elige la entrega" onChange={(e) => { setEntregaId(e.target.value); setTicketId('') }} options={ENTREGAS.map((x) => ({ value: x.id, label: `${x.id} · ${x.unidad} · entregada ${fechaDia(x.entregada)}` }))} />
        </FormField>
        <FormField label="Tipo de defecto" id={campo('tipo')} error={errores.tipo} required>
          <Select value={tipo} placeholder="Elige el tipo" onChange={(e) => setTipo(e.target.value as TipoGarantia)} options={TIPOS_GARANTIA.map((t) => ({ value: t, label: `${NOMBRE_TIPO_GARANTIA[t]} (${COBERTURA_MESES[t]} meses)` }))} />
        </FormField>
        <div id={campo('fecha')}>
          <DatePicker label="Fecha del reclamo" value={reclamada} onValueChange={setReclamada} maxDate={datos.ahora} minDate={entrega?.entregada} locale="es-PE" error={errores.fecha} />
        </div>
        {previo !== null && entrega && tipo ? (
          <Alert tone={previo ? 'success' : 'danger'} size="sm" title={previo ? 'Dentro de cobertura' : 'Fuera de cobertura: no procedente'}>
            <span className="pt-alerta__texto">
              La cobertura de {NOMBRE_TIPO_GARANTIA[tipo].toLowerCase()} corre hasta el {fechaDia(venceCobertura(entrega, tipo))}.
              {previo ? '' : ' Se registrará como no procedente y se informará el motivo al cliente.'}
            </span>
          </Alert>
        ) : null}
        <FormField label="Ticket de garantía" optional helper="Si el cliente ya tiene un ticket, se vincula.">
          <Select value={ticketId} onChange={(e) => setTicketId(e.target.value)} options={[{ value: '', label: 'Sin ticket' }, ...tickets.map((t) => ({ value: t.id, label: `${t.numero} · ${t.resumen}` }))]} />
        </FormField>
        <FormField label="Descripción del defecto" id={campo('descripcion')} error={errores.descripcion} required>
          <Textarea rows={3} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} maxLength={1000} showCounter />
        </FormField>
        {guardar.error && !Object.keys(errores).length ? <AvisoDeError error={guardar.error} reintentar={enviar} /> : null}
      </Form>
    </Drawer>
  )
}
