import { Alert, Breadcrumb, Button, Card, CardBody, DataGrid, Dialog, Form, Header, NumberInput, toast } from '@aybarcorp/ui'
import type { GridColumn } from '@aybarcorp/ui'
import { useEffect, useId, useState } from 'react'
import { nombrePrioridad, nombreTipo } from '../datos/catalogos.ts'
import type { Politica } from '../datos/catalogos.ts'
import { AvisoDeError, Prohibido, Supuesto, erroresDeCampos, horas, useAccion, useCarga } from '../comun.tsx'
import { hrefDe } from '../rutas.ts'
import { api, useConsola, useSesion } from '../servicio/api.ts'
import { puede } from '../servicio/nucleo.ts'

/**
 * Políticas SLA — apoyo de HU-ATC-003: editar una política crea una versión nueva y no
 * mueve los vencimientos congelados de los tickets ya abiertos (CA-03). La matriz completa
 * y su gobierno son de la ola de Gestión.
 */
export default function Politicas() {
  const sesion = useSesion()
  const { datos } = useConsola()
  const [carga, reintentar] = useCarga('politicas')
  const [editando, setEditando] = useState<Politica | null>(null)

  if (!puede.editarPoliticas(sesion.rol)) {
    return (
      <div className="pt-pagina">
        <Header title="Políticas SLA" />
        <Prohibido requiere="Supervisor ATC" recurso="editar las políticas SLA" />
      </div>
    )
  }

  const usos = (id: string) => datos.tickets.filter((t) => t.politica.id === id).length
  const columnas: GridColumn<Politica>[] = [
    { key: 'id', header: 'Política', width: '10rem', renderCell: (p) => <code>{p.id}</code> },
    { key: 'tipo', header: 'Tipo', width: '10rem', renderCell: (p) => (p.tipo ? nombreTipo(p.tipo) : 'Todos (global)') },
    { key: 'prioridad', header: 'Prioridad', width: '8rem', renderCell: (p) => (p.prioridad ? nombrePrioridad(p.prioridad) : 'Genérica') },
    { key: 'respuesta', header: '1.ª respuesta', width: '8rem', align: 'end', renderCell: (p) => horas(p.respuestaH) },
    { key: 'resolucion', header: 'Resolución', width: '8rem', align: 'end', renderCell: (p) => horas(p.resolucionH) },
    { key: 'version', header: 'Versión', width: '6rem', align: 'end', renderCell: (p) => `v${p.version}` },
    { key: 'usos', header: 'Tickets congelados', width: '9rem', align: 'end', renderCell: (p) => usos(p.id) },
    {
      key: 'accion',
      header: 'Acción',
      width: '7rem',
      renderCell: (p) => (
        <Button size="sm" variant="ghost" onClick={() => setEditando(p)}>
          Editar
        </Button>
      ),
    },
  ]

  return (
    <div className="pt-pagina pt-pagina--ancha">
      <Header
        title="Políticas SLA"
        breadcrumb={<Breadcrumb items={[{ label: 'Bandeja', href: hrefDe('bandeja') }, { label: 'Políticas SLA' }]} />}
        description="Precedencia al abrir un ticket: tipo + prioridad, luego la genérica del tipo y, si no hay, la genérica global."
      />
      {carga.fase === 'error' ? <AvisoDeError error={carga.error} reintentar={reintentar} /> : null}
      <Card>
        <CardBody>
          <div className="pt-pila">
            <Alert tone="info" size="sm" title="Los vencimientos ya congelados no cambian">
              <span className="pt-alerta__texto">Editar una política crea una versión nueva para los tickets que se abran desde ahora. Los abiertos conservan sus vencimientos (RN-SVC-002).</span>
            </Alert>
            <DataGrid<Politica> caption="Matriz de políticas SLA" columns={columnas} rows={carga.fase === 'listo' ? [...datos.politicas] : []} getRowId={(p) => p.id} loading={carga.fase === 'cargando'} />
            <Supuesto>Tiempos ilustrativos: la matriz real la define negocio (DEP-03). «Pedido simple» no tiene política a propósito, para mostrar la genérica global.</Supuesto>
          </div>
        </CardBody>
      </Card>
      <EditarPolitica politica={editando} onCerrar={() => setEditando(null)} />
    </div>
  )
}

function EditarPolitica({ politica, onCerrar }: { politica: Politica | null; onCerrar: () => void }) {
  const id = useId()
  const [respuesta, setRespuesta] = useState<number | null>(null)
  const [resolucion, setResolucion] = useState<number | null>(null)
  const guardar = useAccion()
  const errores = erroresDeCampos(guardar.error)

  useEffect(() => {
    if (!politica) return
    setRespuesta(politica.respuestaH)
    setResolucion(politica.resolucionH)
    guardar.limpiar()
  }, [politica, guardar.limpiar])

  const enviar = async () => {
    if (!politica) return
    const hecho = await guardar.ejecutar(async () => {
      await api.editarPolitica(politica.id, respuesta ?? 0, resolucion ?? 0)
      return true
    })
    if (hecho) {
      toast({ message: `${politica.id} pasa a v${politica.version + 1}. Los tickets abiertos conservan sus vencimientos.`, tone: 'success' })
      onCerrar()
    }
  }

  return (
    <Dialog
      open={politica !== null}
      onOpenChange={(a) => (a ? undefined : onCerrar())}
      title={politica ? `Editar ${politica.id}` : 'Editar política'}
      description="Horas hábiles (lunes a viernes, de 9:00 a 18:00, sin feriados)."
      footer={
        <>
          <Button variant="ghost" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" form={`${id}-f`} loading={guardar.enCurso}>
            Guardar como v{(politica?.version ?? 0) + 1}
          </Button>
        </>
      }
    >
      <Form id={`${id}-f`} onSubmit={enviar}>
        <NumberInput label="1.ª respuesta (horas hábiles)" value={respuesta} onValueChange={setRespuesta} min={0.25} step={0.25} unit="h" error={errores.respuesta} />
        <NumberInput label="Resolución (horas hábiles)" value={resolucion} onValueChange={setResolucion} min={0.25} step={1} unit="h" error={errores.resolucion} />
        {guardar.error && !Object.keys(errores).length ? <AvisoDeError error={guardar.error} reintentar={enviar} /> : null}
      </Form>
    </Dialog>
  )
}
