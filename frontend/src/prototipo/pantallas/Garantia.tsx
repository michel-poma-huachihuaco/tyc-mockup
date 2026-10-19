import { Alert, Breadcrumb, Button, Card, CardBody, CardHeader, CardPairs, DataGrid, DatePicker, Dialog, EmptyState, ErrorPage, FileItem, Form, FormField, FormGroup, Header, Radio, Skeleton, Textarea, toast } from '@aybarcorp/ui'
import type { GridColumn } from '@aybarcorp/ui'
import { useEffect, useId, useState } from 'react'
import { AvisoDeError, CampoPdf, Prohibido, Supuesto, erroresDeCampos, fecha, fechaDia, irA, useAccion, useCarga } from '../comun.tsx'
import { nombrePersona } from '../datos/catalogos.ts'
import { cliente } from '../datos/clientes.ts'
import { hrefDe } from '../rutas.ts'
import { api, useConsola, useSesion } from '../servicio/api.ts'
import { COBERTURA_MESES, NOMBRE_TIPO_GARANTIA, enConflicto, entregaDe, garantiaDe, puedeGestionarGarantias, puedeVerGarantias, venceCobertura } from '../servicio/garantias.ts'
import type { FilaGarantia, Garantia } from '../servicio/garantias.ts'
import type { Documento } from '../servicio/libro.ts'
import { BadgeCobertura, BadgeGarantia } from './Garantias.tsx'


const NOMBRE_EVENTO: Record<string, string> = {
  REGISTRO: 'Registro',
  NO_PROCEDENTE: 'No procedente por vigencia',
  INSPECCION_PROGRAMADA: 'Inspección programada',
  INSPECCION_REGISTRADA: 'Inspección registrada',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
  RESOLVED: 'Resuelto',
  ADENDA: 'Adenda registrada',
}

/** Ficha del reclamo de garantía — HU-ATC-033 a 036. */
export default function Garantia({ garantiaId }: { garantiaId: string }) {
  const sesion = useSesion()
  const { datos } = useConsola()
  const [carga, reintentar] = useCarga(`garantia-${garantiaId}`)
  const [dialogo, setDialogo] = useState<'programar' | 'informe' | 'resolver' | 'adenda' | null>(null)
  const g = garantiaDe(datos, garantiaId)

  if (!puedeVerGarantias(sesion)) {
    return (
      <div className="pt-pagina">
        <Header title="Garantía" />
        <Prohibido requiere="de atención al cliente" recurso="ver las garantías postventa" />
      </div>
    )
  }
  const migas = (a: string) => <Breadcrumb items={[{ label: 'Garantías postventa', href: hrefDe('garantias') }, { label: a }]} />
  if (carga.fase === 'cargando')
    return (
      <div className="pt-pagina pt-pagina--ancha" aria-busy="true">
        <Header title="Garantía" loading />
        <Skeleton variant="block" height="18rem" />
      </div>
    )
  if (carga.fase === 'error')
    return (
      <div className="pt-pagina">
        <Header title="Garantía" breadcrumb={migas('Reclamo')} />
        <AvisoDeError error={carga.error} reintentar={reintentar} titulo="No se pudo cargar el reclamo" />
      </div>
    )
  if (!g)
    return (
      <div className="pt-pagina">
        <ErrorPage
          status={404}
          scope="page"
          title="Ese reclamo no existe"
          description="Puede que el enlace sea de otra sesión del prototipo (los datos se reinician al recargar)."
          actions={
            <Button variant="primary" onClick={() => irA(hrefDe('garantias'))}>
              Volver a las garantías
            </Button>
          }
        />
      </div>
    )

  const gestiona = puedeGestionarGarantias(sesion)
  const e = entregaDe(g.entregaId)
  const ticket = g.ticketId ? datos.tickets.find((t) => t.id === g.ticketId) : null
  const conflicto = enConflicto(datos, g)
  const abierto = g.estado === 'UNDER_REVIEW'
  const insp = g.inspeccion
  const filas = datos.filasGarantia.filter((f) => f.garantiaId === g.id)
  const columnas: GridColumn<FilaGarantia>[] = [
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
    { key: 'autor', header: 'Quién', width: '8rem', renderCell: (f) => (f.autor === 'Sistema' ? 'Sistema' : nombrePersona(f.autor)) },
  ]

  return (
    <div className="pt-pagina pt-pagina--ancha">
      <Header
        title={`${g.codigo} · ${NOMBRE_TIPO_GARANTIA[g.tipo]}`}
        breadcrumb={migas(g.codigo)}
        meta={
          <span className="pt-en-linea">
            <BadgeGarantia estado={g.estado} />
            <BadgeCobertura g={g} />
          </span>
        }
        description={`${e?.unidad} · ${e ? (cliente(e.clienteId)?.nombre ?? '—') : '—'}`}
        actions={
          gestiona && abierto ? (
            !insp ? (
              <Button variant="primary" onClick={() => setDialogo('programar')}>
                Programar inspección
              </Button>
            ) : !insp.registrada ? (
              <Button variant="primary" onClick={() => setDialogo('informe')}>
                Registrar la inspección
              </Button>
            ) : (
              <Button variant="primary" onClick={() => setDialogo('resolver')}>
                Resolver el reclamo
              </Button>
            )
          ) : undefined
        }
      />
      {g.estado === 'NOT_ELIGIBLE' ? (
        <Alert tone="danger" title="No procedente por vigencia">
          <span className="pt-alerta__texto">{g.motivoNoProcede} Este es el motivo que se informa al cliente.</span>
        </Alert>
      ) : null}
      {conflicto && ticket ? (
        <Alert
          tone="danger"
          title="Conflicto: se atiende en Eje 3"
          actions={
            <Button variant="primary" size="sm" onClick={() => irA(hrefDe(`ticket/${ticket.id}`))}>
              Ir al ticket para derivar
            </Button>
          }
        >
          <span className="pt-alerta__texto">El ticket {ticket.numero} tiene señal de conflicto: este reclamo no se resuelve en Postventa (Eje 2). Deriva a Eje 3 con el paquete mínimo.</span>
        </Alert>
      ) : null}
      {!gestiona ? (
        <Alert tone="info" size="sm" title="Solo lectura">
          <span className="pt-alerta__texto">Los reclamos los gestiona Postventa y el supervisor ATC.</span>
        </Alert>
      ) : null}

      <div className="pt-dos-columnas">
        <div className="pt-pila">
          <Card>
            <CardHeader as="h2" title="Reclamo" />
            <CardBody padding="sm">
              <CardPairs
                pairs={[
                  ['Acta de Entrega', e ? `${e.id} · entregada el ${fechaDia(e.entregada)}` : '—'],
                  ['Tipo', NOMBRE_TIPO_GARANTIA[g.tipo]],
                  ['Cobertura', e ? `${COBERTURA_MESES[g.tipo]} meses: hasta el ${fechaDia(venceCobertura(e, g.tipo))}` : '—'],
                  ['Reclamado', `${fechaDia(g.reclamada)} · registrado por ${nombrePersona(g.registradoPor)}`],
                  ['Defecto', <p key="d" className="pt-narrativa">{g.descripcion}</p>],
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
                ]}
              />
            </CardBody>
          </Card>
          <Card>
            <CardHeader as="h2" title="Inspección técnica" />
            <CardBody padding="sm">
              {insp ? (
                <CardPairs
                  pairs={[
                    ['Programada', fechaDia(insp.programada)],
                    ['Informe', insp.informe ? <p key="i" className="pt-narrativa">{insp.informe}</p> : 'Pendiente'],
                    [
                      'Fotos y documentos',
                      insp.evidencias.length ? (
                        <ul key="e" className="pt-adjuntos">
                          {insp.evidencias.map((x) => (
                            <FileItem key={x.sha256 + x.nombre} name={x.nombre} size={x.tamano} type="application/octet-stream" status="ready" />
                          ))}
                        </ul>
                      ) : (
                        'Pendiente'
                      ),
                    ],
                  ]}
                />
              ) : (
                <EmptyState size="compact" title="Sin inspección" description={abierto ? 'Se programa la inspección y, antes de resolver, se registra su informe con fotos.' : 'Este reclamo no llegó a inspección.'} />
              )}
              <Supuesto>La inspección la registra Postventa (pregunta abierta de FT-ATC-10: ¿Postventa o un tercero?).</Supuesto>
            </CardBody>
          </Card>
          {g.resolucion ? (
            <Card>
              <CardHeader as="h2" title="Resolución" />
              <CardBody padding="sm">
                <CardPairs
                  pairs={[
                    ['Resultado', <BadgeGarantia key="r" estado={g.estado} size="sm" />],
                    ['Fecha', `${fecha(g.resolucion.fecha)} · ${nombrePersona(g.resolucion.autor)}`],
                    ['Descripción', <p key="d" className="pt-narrativa">{g.resolucion.descripcion}</p>],
                  ]}
                />
              </CardBody>
            </Card>
          ) : null}
          <Card>
            <CardHeader
              as="h2"
              title="Adenda de reincorporación"
              actions={
                gestiona && !g.adenda && g.estado !== 'NOT_ELIGIBLE' ? (
                  <Button size="sm" variant="secondary" onClick={() => setDialogo('adenda')}>
                    Registrar adenda
                  </Button>
                ) : undefined
              }
            />
            <CardBody padding="sm">
              {g.adenda ? (
                <CardPairs
                  pairs={[
                    ['Registrada', `${fecha(g.adenda.fecha)} · ${nombrePersona(g.adenda.autor)}`],
                    ['Motivo', <p key="m" className="pt-narrativa">{g.adenda.motivo}</p>],
                    [
                      'Documento',
                      <ul key="x" className="pt-adjuntos">
                        <FileItem name={g.adenda.documento.nombre} size={g.adenda.documento.tamano} type="application/pdf" status="ready" />
                      </ul>,
                    ],
                  ]}
                />
              ) : (
                <EmptyState size="compact" title="Sin adenda" description="Si tras una devolución el cliente se reincorpora al contrato, se resuelve con una adenda; la redacta Legal y se registra aquí." />
              )}
            </CardBody>
          </Card>
        </div>
        <aside className="pt-lateral" aria-label="Trazabilidad">
          <Card>
            <CardHeader as="h2" title="Trazabilidad" />
            <CardBody padding="sm">
              <DataGrid<FilaGarantia> caption="Trazabilidad del reclamo" columns={columnas} rows={[...filas].reverse()} getRowId={(f) => f.id} />
            </CardBody>
          </Card>
        </aside>
      </div>

      <DialogoProgramar g={g} ahora={datos.ahora} abierto={dialogo === 'programar'} onCerrar={() => setDialogo(null)} />
      <DialogoInforme g={g} abierto={dialogo === 'informe'} onCerrar={() => setDialogo(null)} />
      <DialogoResolver g={g} abierto={dialogo === 'resolver'} onCerrar={() => setDialogo(null)} />
      <DialogoAdenda g={g} abierto={dialogo === 'adenda'} onCerrar={() => setDialogo(null)} />
    </div>
  )
}

function useDialogo(abierto: boolean, reiniciar: () => void) {
  const accion = useAccion()
  useEffect(() => {
    if (!abierto) return
    reiniciar()
    accion.limpiar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto])
  return accion
}

function DialogoProgramar({ g, ahora, abierto, onCerrar }: { g: Garantia; ahora: Date; abierto: boolean; onCerrar: () => void }) {
  const id = useId()
  const [dia, setDia] = useState<Date | null>(null)
  const guardar = useDialogo(abierto, () => setDia(null))
  const errores = erroresDeCampos(guardar.error)
  const enviar = async () => {
    const ok = await guardar.ejecutar(async () => {
      await api.programarInspeccion(g.id, dia)
      return true
    })
    if (ok) {
      toast({ message: `${g.codigo}: inspección programada.`, tone: 'success' })
      onCerrar()
    }
  }
  return (
    <Dialog open={abierto} onOpenChange={(a) => (a ? undefined : onCerrar())} title="Programar la inspección" size="md" footer={<><Button variant="ghost" onClick={onCerrar}>Cancelar</Button><Button variant="primary" type="submit" form={`${id}-f`} loading={guardar.enCurso}>Programar</Button></>}>
      <Form id={`${id}-f`} onSubmit={enviar}>
        <DatePicker label="Fecha de la inspección" value={dia} onValueChange={setDia} minDate={ahora} locale="es-PE" error={errores.fecha} />
        {guardar.error && !errores.fecha ? <AvisoDeError error={guardar.error} reintentar={enviar} /> : null}
      </Form>
    </Dialog>
  )
}

function DialogoInforme({ g, abierto, onCerrar }: { g: Garantia; abierto: boolean; onCerrar: () => void }) {
  const id = useId()
  const [informe, setInforme] = useState('')
  const [fotos, setFotos] = useState<Documento[]>([])
  const guardar = useDialogo(abierto, () => {
    setInforme('')
    setFotos([])
  })
  const errores = erroresDeCampos(guardar.error)
  const enviar = async () => {
    const ok = await guardar.ejecutar(async () => {
      await api.registrarInspeccion(g.id, { informe, evidencias: fotos })
      return true
    })
    if (ok) {
      toast({ message: `${g.codigo}: inspección registrada. Ya se puede resolver.`, tone: 'success' })
      onCerrar()
    }
  }
  return (
    <Dialog open={abierto} onOpenChange={(a) => (a ? undefined : onCerrar())} title="Registrar la inspección" description="El informe y al menos una foto o documento, antes de resolver." size="md" footer={<><Button variant="ghost" onClick={onCerrar}>Cancelar</Button><Button variant="primary" type="submit" form={`${id}-f`} loading={guardar.enCurso}>Registrar</Button></>}>
      <Form id={`${id}-f`} onSubmit={enviar} errors={Object.fromEntries(Object.entries(errores).map(([k, m]) => [`${id}-${k}`, m]))}>
        <FormField label="Informe de la inspección" id={`${id}-informe`} error={errores.informe} required>
          <Textarea rows={4} value={informe} onChange={(e) => setInforme(e.target.value)} maxLength={2000} showCounter />
        </FormField>
        <CampoPdf id={`${id}-fotos`} etiqueta="Foto o documento de la inspección" requisitos="PDF de hasta 10 MB (en el prototipo, un archivo; se guarda su huella)." documento={fotos[0] ?? null} onCambio={(d) => setFotos(d ? [d] : [])} error={errores.fotos} />
        {guardar.error && !Object.keys(errores).length ? <AvisoDeError error={guardar.error} reintentar={enviar} /> : null}
      </Form>
    </Dialog>
  )
}

function DialogoResolver({ g, abierto, onCerrar }: { g: Garantia; abierto: boolean; onCerrar: () => void }) {
  const id = useId()
  const [estado, setEstado] = useState<'APPROVED' | 'REJECTED' | 'RESOLVED' | ''>('')
  const [descripcion, setDescripcion] = useState('')
  const guardar = useDialogo(abierto, () => {
    setEstado('')
    setDescripcion('')
  })
  const errores = erroresDeCampos(guardar.error)
  const enviar = async () => {
    const ok = await guardar.ejecutar(async () => {
      await api.resolverGarantia(g.id, estado, descripcion)
      return true
    })
    if (ok) {
      toast({ message: `${g.codigo} resuelto.`, tone: 'success' })
      onCerrar()
    }
  }
  return (
    <Dialog open={abierto} onOpenChange={(a) => (a ? undefined : onCerrar())} title="Resolver el reclamo" size="md" footer={<><Button variant="ghost" onClick={onCerrar}>Cancelar</Button><Button variant="primary" type="submit" form={`${id}-f`} loading={guardar.enCurso}>Registrar la resolución</Button></>}>
      <Form id={`${id}-f`} onSubmit={enviar} errors={errores.descripcion ? { [`${id}-d`]: errores.descripcion } : {}}>
        <FormGroup legend="Resultado" error={errores.estado}>
          {([['APPROVED', 'Aprobado'], ['REJECTED', 'Rechazado'], ['RESOLVED', 'Resuelto']] as const).map(([v, n]) => (
            <Radio key={v} name={`${id}-r`} value={v} label={n} checked={estado === v} onChange={() => setEstado(v)} />
          ))}
        </FormGroup>
        <FormField label="Descripción de la resolución" id={`${id}-d`} error={errores.descripcion} required>
          <Textarea rows={3} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} maxLength={1000} />
        </FormField>
        {guardar.error && !Object.keys(errores).length ? <AvisoDeError error={guardar.error} reintentar={enviar} /> : null}
      </Form>
    </Dialog>
  )
}

function DialogoAdenda({ g, abierto, onCerrar }: { g: Garantia; abierto: boolean; onCerrar: () => void }) {
  const id = useId()
  const [motivo, setMotivo] = useState('')
  const [documento, setDocumento] = useState<Documento | null>(null)
  const guardar = useDialogo(abierto, () => {
    setMotivo('')
    setDocumento(null)
  })
  const errores = erroresDeCampos(guardar.error)
  const enviar = async () => {
    const ok = await guardar.ejecutar(async () => {
      await api.registrarAdenda(g.id, { motivo, documento })
      return true
    })
    if (ok) {
      toast({ message: `${g.codigo}: adenda registrada.`, tone: 'success' })
      onCerrar()
    }
  }
  return (
    <Dialog open={abierto} onOpenChange={(a) => (a ? undefined : onCerrar())} title="Registrar la adenda" description="Reincorporación contractual tras una devolución. La redacta Legal; aquí se registra." size="md" footer={<><Button variant="ghost" onClick={onCerrar}>Cancelar</Button><Button variant="primary" type="submit" form={`${id}-f`} loading={guardar.enCurso}>Registrar</Button></>}>
      <Form id={`${id}-f`} onSubmit={enviar} errors={Object.fromEntries(Object.entries(errores).map(([k, m]) => [`${id}-${k}`, m]))}>
        <FormField label="Motivo de la reincorporación" id={`${id}-motivo`} error={errores.motivo} required>
          <Textarea rows={3} value={motivo} onChange={(e) => setMotivo(e.target.value)} maxLength={1000} />
        </FormField>
        <CampoPdf id={`${id}-documento`} etiqueta="Adenda firmada" requisitos="PDF de hasta 10 MB." documento={documento} onCambio={setDocumento} error={errores.documento} />
        {guardar.error && !Object.keys(errores).length ? <AvisoDeError error={guardar.error} reintentar={enviar} /> : null}
      </Form>
    </Dialog>
  )
}
