import {
  Breadcrumb,
  Button,
  Card,
  CardBody,
  CardHeader,
  Combobox,
  ConfirmationDialog,
  DataGrid,
  EmptyState,
  Form,
  FormField,
  FormGroup,
  Header,
  Radio,
  Select,
  Table,
  Textarea,
  toast,
} from '@aybarcorp/ui'
import type { GridColumn } from '@aybarcorp/ui'
import { useId, useMemo, useState } from 'react'
import { MOTIVOS, NOMBRE_AREA, PERSONAS, nombreMotivo, nombrePersona } from '../datos/catalogos.ts'
import { AvisoDeError, BadgeEstado, Prohibido, BadgeSla, Supuesto, erroresDeCampos, irA, useAccion, useCarga } from '../comun.tsx'
import { hrefDe } from '../rutas.ts'
import { api, useConsola, useSesion } from '../servicio/api.ts'
import { estadoSla, pendientesDe, puede } from '../servicio/nucleo.ts'
import type { ResumenReasignacion, Ticket } from '../servicio/nucleo.ts'

const COLABORADORES = PERSONAS.filter((p) => p.rol === 'COLABORADOR' || p.rol === 'GESTOR')

/**
 * Reasignación en bloque — HU-ATC-008. Solo el supervisor ATC (para cualquier otro rol la
 * acción no está ni en el menú). Cada ticket recibe una fila nueva en su bitácora de
 * asignación con el motivo: el rastro anterior no se borra.
 */
export default function Reasignar() {
  const sesion = useSesion()
  if (!puede.reasignarEnBloque(sesion.rol)) {
    return (
      <div className="pt-pagina">
        <Header title="Reasignar en bloque" />
        <Prohibido requiere="Supervisor ATC" recurso="reasignar en bloque" />
      </div>
    )
  }
  return <Formulario />
}

function Formulario() {
  const { datos } = useConsola()
  const id = useId()
  const [carga, reintentar] = useCarga('reasignar')
  const [de, setDe] = useState('')
  const [motivo, setMotivo] = useState('REASSIGNMENT_CESE')
  const [destinatarios, setDestinatarios] = useState<string[]>([])
  const [nota, setNota] = useState('')
  const [confirmar, setConfirmar] = useState(false)
  const [resumen, setResumen] = useState<ResumenReasignacion | null>(null)
  const guardar = useAccion()
  const errores = erroresDeCampos(guardar.error)

  const pendientes = useMemo(() => (de ? pendientesDe(datos, de) : []), [datos, de])
  const pendientesHoy = (p: string) => pendientesDe(datos, p).length
  const reparto = destinatarios.map((p, i) => ({ persona: p, tickets: pendientes.filter((_, j) => j % destinatarios.length === i).length }))
  const campo = (k: string) => `${id}-${k}`

  const ejecutar = async () => {
    setConfirmar(false)
    const r = await guardar.ejecutar(() => api.reasignarEnBloque({ de, destinatarios, motivo, nota }))
    if (r) {
      setResumen(r)
      toast({ message: `${r.total} tickets de ${nombrePersona(de)} reasignados.`, tone: 'success' })
    }
  }

  const reiniciar = () => {
    setResumen(null)
    setDe('')
    setDestinatarios([])
    setNota('')
    guardar.limpiar()
  }

  const columnas: GridColumn<Ticket>[] = [
    { key: 'numero', header: 'N.º', width: '8rem', renderCell: (t) => t.numero },
    { key: 'resumen', header: 'Solicitud', width: '18rem', renderCell: (t) => t.resumen },
    { key: 'estado', header: 'Estado', width: '8rem', renderCell: (t) => <BadgeEstado estado={t.estado} size="sm" /> },
    { key: 'sla', header: 'SLA', width: '10rem', renderCell: (t) => <BadgeSla sla={estadoSla(t, datos.ahora)} size="sm" /> },
  ]

  return (
    <div className="pt-pagina pt-pagina--ancha">
      <Header
        title="Reasignar en bloque"
        breadcrumb={<Breadcrumb items={[{ label: 'Bandeja', href: hrefDe('bandeja') }, { label: 'Reasignar en bloque' }]} />}
        description="Cuando un colaborador rota, renuncia o cesa, sus tickets pendientes pasan a otros responsables sin perder la trazabilidad."
      />
      {carga.fase === 'error' ? <AvisoDeError error={carga.error} reintentar={reintentar} /> : null}

      {resumen ? (
        <Card>
          <CardHeader as="h2" title="Reasignación hecha" subtitle={`${resumen.total} tickets de ${nombrePersona(de)} · motivo ${nombreMotivo(motivo)}`} />
          <CardBody>
            <div className="pt-pila">
              <Table<{ id: string; persona: string; tickets: number }>
                caption="Tickets recibidos por cada destinatario"
                captionVisible
                columns={[
                  { key: 'persona', header: 'Destinatario', render: (r: { persona: string }) => nombrePersona(r.persona) },
                  { key: 'tickets', header: 'Tickets recibidos', align: 'end', render: (r: { tickets: number }) => r.tickets },
                ]}
                rows={resumen.porDestinatario.map((r) => ({ id: r.persona, ...r }))}
              />
              <p className="pt-texto-chico">Cada ticket tiene una fila nueva en «Derivaciones» con el motivo; las anteriores siguen ahí.</p>
              <div className="pt-acciones pt-acciones--inicio">
                <Button variant="primary" onClick={() => irA(hrefDe('bandeja'))}>
                  Ir a la bandeja
                </Button>
                <Button variant="ghost" onClick={reiniciar}>
                  Hacer otra reasignación
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="pt-dos-columnas">
          <Card>
            <CardBody>
              <Form id={`${id}-f`} onSubmit={() => setConfirmar(true)} errors={Object.fromEntries(Object.entries(errores).map(([k, m]) => [campo(k), m]))}>
                <FormField label="Colaborador que rota o cesa" id={campo('de')} error={errores.de} required>
                  <Select
                    value={de}
                    placeholder="Elige al colaborador"
                    disabled={carga.fase !== 'listo'}
                    onChange={(e) => {
                      setDe(e.target.value)
                      setDestinatarios((d) => d.filter((p) => p !== e.target.value))
                    }}
                    options={COLABORADORES.map((p) => ({
                      value: p.id,
                      label: `${p.nombre} · ${p.area === 'CX' || p.area === 'VENTAS' ? p.area : NOMBRE_AREA[p.area]} · ${pendientesHoy(p.id)} pendientes`,
                    }))}
                  />
                </FormField>
                <FormGroup legend="Motivo" error={errores.motivo}>
                  {MOTIVOS.filter((m) => m.uso === 'reasignacion').map((m) => (
                    <Radio key={m.id} name={`${id}-motivo`} value={m.id} label={m.nombre} helper={m.id} checked={motivo === m.id} onChange={() => setMotivo(m.id)} />
                  ))}
                </FormGroup>
                <div id={campo('destinatarios')}>
                  <Combobox
                    label="Destinatarios"
                    multiple
                    placeholder="Elige uno o varios"
                    options={COLABORADORES.filter((p) => p.id !== de).map((p) => ({
                      value: p.id,
                      label: p.nombre,
                      description: `${p.area === 'CX' || p.area === 'VENTAS' ? p.area : NOMBRE_AREA[p.area]} · ${pendientesHoy(p.id)} pendientes hoy`,
                    }))}
                    value={destinatarios}
                    onValueChange={(v) => setDestinatarios(Array.isArray(v) ? v : v ? [v] : [])}
                    error={errores.destinatarios}
                  />
                </div>
                <FormField label="Nota" id={campo('nota')} error={errores.nota} optional helper="Solo el motivo operativo: sin datos personales.">
                  <Textarea rows={2} value={nota} onChange={(e) => setNota(e.target.value)} maxLength={300} />
                </FormField>
                <Supuesto>Solo el supervisor reasigna en bloque, y el reparto es por turnos del más urgente al menos urgente (preguntas abiertas de FT-ATC-03).</Supuesto>
                {guardar.error && !Object.keys(errores).length ? <AvisoDeError error={guardar.error} reintentar={ejecutar} /> : null}
                <div className="pt-acciones">
                  <Button variant="primary" type="submit" loading={guardar.enCurso} disabled={!de || !pendientes.length || !destinatarios.length}>
                    Revisar y reasignar
                  </Button>
                </div>
              </Form>
            </CardBody>
          </Card>

          <aside className="pt-lateral" aria-label="Pendientes y reparto">
            <Card>
              <CardHeader as="h2" title={de ? `Pendientes de ${nombrePersona(de)}` : 'Pendientes'} subtitle={de ? `${pendientes.length} tickets activos, del más urgente al menos urgente.` : undefined} />
              <CardBody padding="sm">
                {de ? (
                  <DataGrid<Ticket>
                    caption={`Pendientes de ${nombrePersona(de)}`}
                    columns={columnas}
                    rows={pendientes}
                    getRowId={(t) => t.id}
                    loading={carga.fase === 'cargando'}
                    emptyState={<EmptyState size="compact" title="Sin pendientes" description="Este colaborador no tiene tickets activos: no hay nada que reasignar." />}
                  />
                ) : (
                  <p className="pt-texto-chico">Elige al colaborador para ver sus tickets activos.</p>
                )}
              </CardBody>
            </Card>
            {reparto.length && pendientes.length ? (
              <Card>
                <CardHeader as="h2" title="Reparto previsto" />
                <CardBody padding="sm">
                  <ul className="pt-lista-simple">
                    {reparto.map((r) => (
                      <li key={r.persona}>
                        <strong>{nombrePersona(r.persona)}</strong>: {r.tickets} {r.tickets === 1 ? 'ticket' : 'tickets'}
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
            ) : null}
          </aside>
        </div>
      )}

      <ConfirmationDialog
        open={confirmar}
        onOpenChange={setConfirmar}
        tone="neutral"
        title={`¿Reasignar ${pendientes.length} tickets de ${nombrePersona(de)}?`}
        description={`Se repartirán entre ${destinatarios.map((p) => nombrePersona(p)).join(', ')} con el motivo «${nombreMotivo(motivo)}». Cada ticket guarda una fila nueva; el rastro anterior no se borra.`}
        confirmLabel={`Reasignar ${pendientes.length} tickets`}
        onConfirm={ejecutar}
        loading={guardar.enCurso}
      />
    </div>
  )
}
