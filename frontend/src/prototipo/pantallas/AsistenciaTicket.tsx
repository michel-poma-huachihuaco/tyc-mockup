import { Alert, Badge, Button, Card, CardBody, CardHeader, DataGrid, EmptyState, Form, FormField, Tag, Textarea, toast } from '@aybarcorp/ui'
import type { GridColumn } from '@aybarcorp/ui'
import { useEffect, useId, useState } from 'react'
import { AvisoDeError, Supuesto, erroresDeCampos, fecha, useAccion } from '../comun.tsx'
import { nombrePersona } from '../datos/catalogos.ts'
import { api } from '../servicio/api.ts'
import type { Datos, Ticket } from '../servicio/nucleo.ts'
import { ErrorSimulado } from '../servicio/nucleo.ts'
import { flujoDe, guiaVigente, puedeRayo, rayoActivo, sugerirIA } from '../servicio/ola6.ts'
import type { DecisionIA, EventoRayo } from '../servicio/ola6.ts'
import type { Persona } from '../datos/catalogos.ts'


/** Rayo de prioridad (HU-ATC-045): solo el supervisor lo marca, con motivo; el área tiene un límite. */
export function TarjetaRayo({ ticket, datos, sesion }: { ticket: Ticket; datos: Datos; sesion: Persona }) {
  const id = useId()
  const [motivo, setMotivo] = useState('')
  const [exceso, setExceso] = useState<string | null>(null)
  const guardar = useAccion()
  const activo = rayoActivo(datos, ticket.id)
  const historial = datos.rayos.filter((r) => r.ticketId === ticket.id)
  const errores = erroresDeCampos(guardar.error)
  const marcar = async (confirmar: boolean) => {
    const ok = await guardar.ejecutar(async () => {
      await api.marcarRayo(ticket.id, motivo, confirmar)
      return true
    })
    if (ok) {
      setMotivo('')
      setExceso(null)
      toast({ message: `${ticket.numero}: rayo marcado. Aparece primero en la bandeja.`, tone: 'success' })
    }
  }
  const columnas: GridColumn<EventoRayo>[] = [
    { key: 'fecha', header: 'Fecha', width: '8rem', renderCell: (r) => fecha(r.fecha) },
    { key: 'accion', header: 'Acción', width: '8rem', renderCell: (r) => (r.accion === 'MARCADO' ? 'Marcado' : 'Retirado') },
    { key: 'motivo', header: 'Motivo', renderCell: (r) => r.motivo },
    { key: 'autor', header: 'Quién', width: '8rem', renderCell: (r) => nombrePersona(r.autor) },
  ]
  if (!activo && !puedeRayo(sesion) && !historial.length) return null
  const bloqueo = guardar.error instanceof ErrorSimulado && guardar.error.codigo === 'limite-rayo' ? guardar.error.message : exceso
  return (
    <Card>
      <CardHeader as="h2" title="Rayo de prioridad" actions={activo ? <Badge tone="danger" size="sm" dot>Con rayo</Badge> : undefined} />
      <CardBody padding="sm">
        <div className="pt-pila pt-pila--chica">
          <p className="pt-texto-chico">{activo ? 'Va primero en la bandeja del área; no cambia su SLA.' : 'Solo el supervisor o líder lo marca, con motivo, y no puede pasar del 10 % de la bandeja del área.'}</p>
          {puedeRayo(sesion) && !activo ? (
            <Form id={`${id}-f`} onSubmit={() => marcar(false)} errors={errores.motivo ? { [`${id}-m`]: errores.motivo } : {}}>
              <FormField label="Motivo del rayo" id={`${id}-m`} error={errores.motivo} required>
                <Textarea rows={2} value={motivo} onChange={(e) => setMotivo(e.target.value)} maxLength={300} />
              </FormField>
              {bloqueo ? (
                <Alert tone="warning" size="sm" title="Límite del área superado" actions={<Button size="sm" variant="primary" loading={guardar.enCurso} onClick={() => { setExceso(bloqueo); void marcar(true) }}>Confirmar el rayo</Button>}>
                  <span className="pt-alerta__texto">{bloqueo} Para no confirmar, desmarca el rayo de otro ticket del área.</span>
                </Alert>
              ) : null}
              <div className="pt-acciones">
                <Button type="submit" size="sm" variant="secondary" loading={guardar.enCurso}>Marcar el rayo</Button>
              </div>
              {guardar.error && !errores.motivo && !bloqueo ? <AvisoDeError error={guardar.error} /> : null}
            </Form>
          ) : null}
          {puedeRayo(sesion) && activo ? (
            <Button size="sm" variant="ghost" loading={guardar.enCurso} onClick={() => guardar.ejecutar(() => api.retirarRayo(ticket.id)).then(() => toast({ message: 'Rayo retirado.', tone: 'info' }))}>
              Retirar el rayo
            </Button>
          ) : null}
          {historial.length ? <DataGrid<EventoRayo> caption="Bitácora del rayo" columns={columnas} rows={[...historial].reverse()} getRowId={(r) => r.id} /> : null}
          <Supuesto>Límite de 10 % de la bandeja del área (umbral a validar); lo marca el supervisor ATC.</Supuesto>
        </div>
      </CardBody>
    </Card>
  )
}

/** Guía de solución del tipo (HU-ATC-047) y flujo con el que nació el ticket (HU-ATC-043). */
export function TarjetaGuia({ ticket, datos }: { ticket: Ticket; datos: Datos }) {
  const g = guiaVigente(datos, ticket.tipo)
  const f = flujoDe(datos, ticket.id)
  const faltante = !g
  // CA-03: un tipo sin guía se reporta al administrador funcional (una sola vez).
  useEffect(() => {
    if (faltante) api.reportarSinGuia(ticket.tipo).catch(() => undefined)
  }, [faltante, ticket.tipo])
  return (
    <Card>
      <CardHeader as="h2" title="Guía de solución" actions={g ? <Tag size="sm" variant="outline">Versión {g.version}</Tag> : undefined} />
      <CardBody padding="sm">
        <div className="pt-pila pt-pila--chica">
          {f ? <p className="pt-texto-chico">Flujo con el que nació este ticket: versión {f.version}. Una versión nueva solo aplica a tickets nuevos.</p> : null}
          {g ? (
            <>
              <p className="pt-texto"><strong>Pasos</strong></p>
              <ol className="pt-lista-simple">{g.pasos.map((p) => <li key={p}>{p}</li>)}</ol>
              {g.plantillas.length ? (<><p className="pt-texto"><strong>Plantillas</strong></p><ul className="pt-lista-simple">{g.plantillas.map((p) => <li key={p} className="pt-texto-chico">{p}</li>)}</ul></>) : null}
              <p className="pt-texto"><strong>Criterios de cierre</strong></p>
              <ul className="pt-lista-simple">{g.criterios.map((c) => <li key={c}>{c}</li>)}</ul>
            </>
          ) : (
            <Alert tone="warning" size="sm" title="Sin guía">
              <span className="pt-alerta__texto">Este tipo de ticket no tiene guía publicada. Ya se avisó al administrador funcional.</span>
            </Alert>
          )}
        </div>
      </CardBody>
    </Card>
  )
}

/** Asistente de IA (HU-ATC-048): sugiere y avisa de los criterios pendientes; el gestor decide. */
export function TarjetaAsistente({ ticket, datos }: { ticket: Ticket; datos: Datos }) {
  const [borrador, setBorrador] = useState('')
  const [sug, setSug] = useState<ReturnType<typeof sugerirIA> | null>(null)
  const [texto, setTexto] = useState('')
  const guardar = useAccion()
  const decisiones = datos.decisionesIA.filter((x) => x.ticketId === ticket.id)
  const decidir = async (decision: DecisionIA['decision']) => {
    const ok = await guardar.ejecutar(async () => {
      await api.decisionIA(ticket.id, decision, sug?.anonimizados ?? 0)
      return true
    })
    if (ok) {
      toast({ message: decision === 'DESCARTADA' ? 'Sugerencia descartada.' : decision === 'ACEPTADA' ? 'Sugerencia aceptada: cópiala al mensaje.' : 'Tu versión editada quedó registrada.', tone: 'success' })
      setSug(null)
    }
  }
  return (
    <Card>
      <CardHeader as="h2" title="Asistente de IA" />
      <CardBody padding="sm">
        <div className="pt-pila pt-pila--chica">
          <p className="pt-texto-chico">La IA asesora; tú decides. Los DNI y los datos de tarjeta se anonimizan antes de enviarse al modelo.</p>
          <FormField label="Tu borrador (opcional)">
            <Textarea rows={2} value={borrador} onChange={(e) => setBorrador(e.target.value)} maxLength={500} />
          </FormField>
          <Button size="sm" variant="secondary" onClick={() => { const r = sugerirIA(datos, ticket, borrador); setSug(r); setTexto(r.sugerencia) }}>Pedir ayuda a la IA</Button>
          {sug ? (
            <div className="pt-pila pt-pila--chica">
              {sug.anonimizados ? <Alert tone="info" size="sm"><span className="pt-alerta__texto">Se anonimizaron {sug.anonimizados} dato(s) personales. Al modelo llegó: «{sug.enviado}»</span></Alert> : null}
              <FormField label="Sugerencia">
                <Textarea rows={3} value={texto} onChange={(e) => setTexto(e.target.value)} />
              </FormField>
              <p className="pt-texto"><strong>Criterios de cierre pendientes</strong></p>
              {sug.pendientes.length ? <ul className="pt-lista-simple">{sug.pendientes.map((c) => <li key={c}>{c}</li>)}</ul> : <p className="pt-texto-chico">No faltan criterios.</p>}
              <div className="pt-acciones pt-acciones--inicio">
                <Button size="sm" variant="primary" loading={guardar.enCurso} onClick={() => decidir(texto === sug.sugerencia ? 'ACEPTADA' : 'EDITADA')}>{texto === sug.sugerencia ? 'Aceptar' : 'Usar mi versión editada'}</Button>
                <Button size="sm" variant="ghost" loading={guardar.enCurso} onClick={() => decidir('DESCARTADA')}>Descartar</Button>
              </div>
              {guardar.error ? <AvisoDeError error={guardar.error} /> : null}
            </div>
          ) : null}
          {decisiones.length ? (
            <ul className="pt-lista-simple pt-texto-chico">
              {[...decisiones].reverse().map((x) => (
                <li key={x.id}>{{ ACEPTADA: 'Aceptada', EDITADA: 'Editada', DESCARTADA: 'Descartada' }[x.decision]} · {nombrePersona(x.autor)} · {fecha(x.fecha)} (sin datos personales en el registro)</li>
              ))}
            </ul>
          ) : (
            <EmptyState size="compact" title="Sin sugerencias" description="Cada decisión queda registrada, sin el texto." />
          )}
          <Supuesto>La IA es simulada con plantillas de la guía; el modelo real y su servicio de anonimización son otra dependencia (RNF-SEC-009).</Supuesto>
        </div>
      </CardBody>
    </Card>
  )
}
