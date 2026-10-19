import { Alert, Badge, Breadcrumb, Button, Card, CardBody, CardHeader, DataGrid, Dialog, EmptyState, Form, FormField, Header, Input, NumberInput, Select, Tabs, Textarea, toast } from '@aybarcorp/ui'
import type { GridColumn } from '@aybarcorp/ui'
import { useEffect, useId, useState } from 'react'
import { AvisoDeError, Prohibido, Supuesto, erroresDeCampos, fecha, useAccion, useCarga } from '../comun.tsx'
import { NOMBRE_AREA, PERSONAS, TIPOS, nombrePersona, nombreTipo } from '../datos/catalogos.ts'
import type { Area } from '../datos/catalogos.ts'
import { hrefDe } from '../rutas.ts'
import { api, useConsola, useSesion } from '../servicio/api.ts'
import { flujoVigente, guiaVigente, puedeConfigurar } from '../servicio/ola6.ts'
import type { Flujo, Guia, PasoFlujo } from '../servicio/ola6.ts'
import type { Datos } from '../servicio/nucleo.ts'

type Pestana = 'flujos' | 'guias' | 'alertas'
const AREAS_FLUJO: Area[] = ['ATC', 'COBRANZA', 'LEGAL', 'POSTVENTA', 'TI', 'ADMINISTRACION']

/** Configuración — HU-ATC-043 (flujos por tipo y área, con versiones) y 047 (guías de solución). */
export default function Configuracion() {
  const sesion = useSesion()
  const { datos } = useConsola()
  const [carga, reintentar] = useCarga('configuracion')
  const [pestana, setPestana] = useState<Pestana>('flujos')
  const [flujo, setFlujo] = useState<string | null>(null)
  const [guia, setGuia] = useState<string | null>(null)
  if (!puedeConfigurar(sesion)) {
    return (
      <div className="pt-pagina">
        <Header title="Configuración" />
        <Prohibido requiere="Administrador funcional" recurso="configurar flujos y guías" />
      </div>
    )
  }
  const colFlujos: GridColumn<{ id: string; tipo: string }>[] = [
    { key: 'tipo', header: 'Tipo de ticket', width: '13rem', renderCell: (r) => nombreTipo(r.tipo) },
    { key: 'area', header: 'Área', width: '10rem', renderCell: (r) => NOMBRE_AREA[flujoVigente(datos, r.tipo)?.area ?? 'ATC'] },
    { key: 'version', header: 'Versión vigente', width: '9rem', renderCell: (r) => { const f = flujoVigente(datos, r.tipo); return f ? `v${f.version}` : <Badge tone="warning" size="sm">Sin flujo</Badge> } },
    { key: 'pasos', header: 'Pasos y responsables', renderCell: (r) => flujoVigente(datos, r.tipo)?.pasos.map((p) => `${p.nombre} (${nombrePersona(p.responsable)})`).join(' → ') ?? '—' },
    { key: 'accion', header: 'Acción', width: '9rem', renderCell: (r) => <Button size="sm" variant="secondary" onClick={() => setFlujo(r.tipo)}>Editar</Button> },
  ]
  const colGuias: GridColumn<{ id: string; tipo: string }>[] = [
    { key: 'tipo', header: 'Tipo de ticket', width: '13rem', renderCell: (r) => nombreTipo(r.tipo) },
    { key: 'version', header: 'Versión vigente', width: '10rem', renderCell: (r) => { const g = guiaVigente(datos, r.tipo); return g ? `v${g.version} · ${fecha(g.publicada)}` : <Badge tone="danger" size="sm">Sin guía</Badge> } },
    { key: 'hist', header: 'Historial', width: '10rem', renderCell: (r) => `${datos.guias.filter((g) => g.tipo === r.tipo).length} versiones` },
    { key: 'accion', header: 'Acción', width: '10rem', renderCell: (r) => <Button size="sm" variant="secondary" onClick={() => setGuia(r.tipo)}>{guiaVigente(datos, r.tipo) ? 'Nueva versión' : 'Crear la guía'}</Button> },
  ]
  const filas = TIPOS.map((t) => ({ id: t.id, tipo: t.id }))
  return (
    <div className="pt-pagina pt-pagina--ancha">
      <Header
        title="Configuración"
        breadcrumb={<Breadcrumb items={[{ label: 'Bandeja', href: hrefDe('bandeja') }, { label: 'Configuración' }]} />}
        description="Flujos de trabajo y guías de solución, sin desarrollo. Una versión nueva solo aplica a tickets nuevos."
        tabs={<Tabs value={pestana} onValueChange={(v) => setPestana(v as Pestana)} items={[{ value: 'flujos', label: 'Flujos', count: filas.length }, { value: 'guias', label: 'Guías', count: datos.guias.length }, { value: 'alertas', label: 'Alertas', count: datos.alertasOps.filter((a) => a.tipo === 'GUIA_FALTANTE').length }]} />}
      />
      {carga.fase === 'error' ? (
        <AvisoDeError error={carga.error} reintentar={reintentar} />
      ) : pestana === 'flujos' ? (
        <Card><CardBody><div className="pt-pila"><DataGrid<{ id: string; tipo: string }> caption="Flujos por tipo de ticket" columns={colFlujos} rows={carga.fase === 'listo' ? filas : []} getRowId={(r) => r.id} loading={carga.fase === 'cargando'} /><Supuesto>Un editor gráfico de procesos (BPMN) queda fuera de alcance; el SLA de cada paso se suma a la precedencia de políticas de la ola 1.</Supuesto></div></CardBody></Card>
      ) : pestana === 'guias' ? (
        <Card><CardBody><DataGrid<{ id: string; tipo: string }> caption="Guías de solución por tipo" columns={colGuias} rows={carga.fase === 'listo' ? filas : []} getRowId={(r) => r.id} loading={carga.fase === 'cargando'} /></CardBody></Card>
      ) : (
        <Card>
          <CardHeader as="h2" title="Alertas para el administrador" />
          <CardBody>
            {datos.alertasOps.filter((a) => a.tipo === 'GUIA_FALTANTE').length ? (
              <ul className="pt-lista-simple">{datos.alertasOps.filter((a) => a.tipo === 'GUIA_FALTANTE').map((a) => <li key={a.id}><Alert tone="warning" size="sm" title="Tipo sin guía"><span className="pt-alerta__texto">{a.detalle} · {fecha(a.fecha)}</span></Alert></li>)}</ul>
            ) : (
              <EmptyState size="compact" title="Sin alertas" description="Cuando un gestor abra un ticket de un tipo sin guía, se reporta aquí. Pruébalo con un ticket de «Garantía postventa» o «Reclamo»." />
            )}
          </CardBody>
        </Card>
      )}
      <DialogoFlujo tipo={flujo} datos={datos} onCerrar={() => setFlujo(null)} />
      <DialogoGuia tipo={guia} datos={datos} onCerrar={() => setGuia(null)} />
    </div>
  )
}

function DialogoFlujo({ tipo, datos, onCerrar }: { tipo: string | null; datos: Datos; onCerrar: () => void }) {
  const id = useId()
  const [area, setArea] = useState<Area>('ATC')
  const [pasos, setPasos] = useState<PasoFlujo[]>([])
  const guardar = useAccion()
  useEffect(() => {
    if (!tipo) return
    const f: Flujo | null = flujoVigente(datos, tipo)
    setArea(f?.area ?? 'ATC')
    setPasos(f ? f.pasos.map((p) => ({ ...p })) : [{ nombre: '', responsable: null, slaH: 4 }])
    guardar.limpiar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo])
  if (!tipo) return null
  const errores = erroresDeCampos(guardar.error)
  const cambiar = (i: number, p: Partial<PasoFlujo>) => setPasos((l) => l.map((x, j) => (j === i ? { ...x, ...p } : x)))
  const enviar = async () => {
    const ok = await guardar.ejecutar(async () => {
      await api.publicarFlujo(tipo, area, pasos)
      return true
    })
    if (ok) {
      toast({ message: `Flujo de «${nombreTipo(tipo)}» publicado. Aplica solo a tickets nuevos.`, tone: 'success' })
      onCerrar()
    }
  }
  return (
    <Dialog open onOpenChange={(a) => (a ? undefined : onCerrar())} title={`Flujo de «${nombreTipo(tipo)}»`} description="Cada paso con su responsable y su SLA. Los tickets abiertos conservan su flujo y su SLA congelado." size="lg" footer={<><Button variant="ghost" onClick={onCerrar}>Cancelar</Button><Button variant="primary" type="submit" form={`${id}-f`} loading={guardar.enCurso}>Publicar la versión {(flujoVigente(datos, tipo)?.version ?? 0) + 1}</Button></>}>
      <Form id={`${id}-f`} onSubmit={enviar}>
        <FormField label="Área" id={`${id}-area`}>
          <Select value={area} onChange={(e) => setArea(e.target.value as Area)} options={AREAS_FLUJO.map((a) => ({ value: a, label: NOMBRE_AREA[a] }))} />
        </FormField>
        {pasos.map((p, i) => (
          <Card key={i} variant="elevated">
            <CardBody padding="sm">
              <div className="pt-pila pt-pila--chica">
                <p className="pt-texto"><strong>Paso {i + 1}</strong></p>
                <FormField label={`Nombre del paso ${i + 1}`} id={`${id}-n${i}`} error={errores[`paso-${i}`]}>
                  <Input value={p.nombre} onChange={(e) => cambiar(i, { nombre: e.target.value })} />
                </FormField>
                <div className="pt-rejilla-campos">
                  <FormField label={`Responsable del paso ${i + 1}`} id={`${id}-r${i}`}>
                    <Select value={p.responsable ?? ''} placeholder="Elige al responsable" onChange={(e) => cambiar(i, { responsable: e.target.value || null })} options={PERSONAS.filter((x) => x.rol === 'GESTOR' || x.rol === 'COLABORADOR' || x.rol === 'SUPERVISOR' || x.rol === 'LEGAL_RECLAMOS').map((x) => ({ value: x.id, label: x.nombre }))} />
                  </FormField>
                  <NumberInput label={`SLA del paso ${i + 1} (horas hábiles)`} value={p.slaH} onValueChange={(v) => cambiar(i, { slaH: v ?? 0 })} min={0.25} step={1} unit="h" />
                </div>
                {pasos.length > 1 ? <div className="pt-acciones pt-acciones--inicio"><Button size="sm" variant="ghost" onClick={() => setPasos((l) => l.filter((_, j) => j !== i))}>Quitar el paso {i + 1}</Button></div> : null}
              </div>
            </CardBody>
          </Card>
        ))}
        <Button variant="secondary" size="sm" onClick={() => setPasos((l) => [...l, { nombre: '', responsable: null, slaH: 4 }])}>Añadir un paso</Button>
        {guardar.error && !Object.keys(errores).length ? <AvisoDeError error={guardar.error} reintentar={enviar} /> : null}
        {errores.pasos ? <Alert tone="danger" size="sm"><span className="pt-alerta__texto">{errores.pasos}</span></Alert> : null}
      </Form>
    </Dialog>
  )
}

function DialogoGuia({ tipo, datos, onCerrar }: { tipo: string | null; datos: Datos; onCerrar: () => void }) {
  const id = useId()
  const [pasos, setPasos] = useState('')
  const [plantillas, setPlantillas] = useState('')
  const [criterios, setCriterios] = useState('')
  const guardar = useAccion()
  useEffect(() => {
    if (!tipo) return
    const g: Guia | null = guiaVigente(datos, tipo)
    setPasos(g?.pasos.join('\n') ?? '')
    setPlantillas(g?.plantillas.join('\n') ?? '')
    setCriterios(g?.criterios.join('\n') ?? '')
    guardar.limpiar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo])
  if (!tipo) return null
  const errores = erroresDeCampos(guardar.error)
  const lineas = (s: string) => s.split('\n')
  const enviar = async () => {
    const ok = await guardar.ejecutar(async () => {
      await api.publicarGuia(tipo, { pasos: lineas(pasos), plantillas: lineas(plantillas), criterios: lineas(criterios) })
      return true
    })
    if (ok) {
      toast({ message: `Guía de «${nombreTipo(tipo)}» publicada: los gestores ven la nueva versión.`, tone: 'success' })
      onCerrar()
    }
  }
  return (
    <Dialog open onOpenChange={(a) => (a ? undefined : onCerrar())} title={`Guía de «${nombreTipo(tipo)}»`} description="Una línea por elemento. Las versiones anteriores quedan en el historial." size="lg" footer={<><Button variant="ghost" onClick={onCerrar}>Cancelar</Button><Button variant="primary" type="submit" form={`${id}-f`} loading={guardar.enCurso}>Publicar la guía</Button></>}>
      <Form id={`${id}-f`} onSubmit={enviar} errors={Object.fromEntries(Object.entries(errores).map(([k, m]) => [`${id}-${k}`, m]))}>
        <FormField label="Pasos" id={`${id}-pasos`} error={errores.pasos} required><Textarea rows={4} value={pasos} onChange={(e) => setPasos(e.target.value)} /></FormField>
        <FormField label="Plantillas de respuesta" id={`${id}-plantillas`} optional helper="Usa {resumen} para insertar el resumen del ticket."><Textarea rows={3} value={plantillas} onChange={(e) => setPlantillas(e.target.value)} /></FormField>
        <FormField label="Criterios de cierre" id={`${id}-criterios`} error={errores.criterios} required><Textarea rows={3} value={criterios} onChange={(e) => setCriterios(e.target.value)} /></FormField>
        {guardar.error && !Object.keys(errores).length ? <AvisoDeError error={guardar.error} reintentar={enviar} /> : null}
      </Form>
    </Dialog>
  )
}
