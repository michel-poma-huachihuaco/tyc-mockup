import { Alert, Badge, Button, Card, CardBody, CardHeader, CardPairs, Checkbox, Dialog, Drawer, Form, FormField, FormGroup, Input, Select, Tag, Textarea, toast } from '@aybarcorp/ui'
import { useEffect, useId, useState } from 'react'
import { ELEMENTOS_HANDOFF, NOMBRE_SENAL, SENALES, nombrePersona } from '../datos/catalogos.ts'
import type { Senal } from '../datos/catalogos.ts'
import { cliente, dniEnmascarado } from '../datos/clientes.ts'
import { AvisoDeError, Supuesto, erroresDeCampos, fecha, useAccion } from '../comun.tsx'
import { api } from '../servicio/api.ts'
import { diasHabilesEntre } from '../servicio/calendario.ts'
import { handoffDe, notaEmocionalVigente, palabrasDeJuicio, senalesActivas } from '../servicio/conflicto.ts'
import type { ElementosHandoff } from '../servicio/conflicto.ts'
import type { Datos, Ticket } from '../servicio/nucleo.ts'
import type { Rol } from '../datos/catalogos.ts'

/**
 * Gate de derivación a Eje 3 en el detalle del ticket (ola 3): HU-ATC-026 (señales y
 * bloqueo), 027 (paquete mínimo y confirmación) y 028 (nota de estado emocional y aviso de
 * vocería). El bloqueo lo aplica el servicio; aquí se explica y se ofrece la salida.
 */

const lista = (senales: readonly Senal[]) => senales.map((s) => NOMBRE_SENAL[s].toLowerCase()).join(', ')

/** Lo que el siguiente atendedor tiene que ver antes que nada. */
export function AvisosConflicto({ ticket, datos, atiende, onDerivarEje3 }: { ticket: Ticket; datos: Datos; atiende: boolean; onDerivarEje3: () => void }) {
  const activas = senalesActivas(datos, ticket.id)
  const nota = notaEmocionalVigente(datos, ticket.id)
  const voceria = datos.avisos.find((a) => a.ticketId === ticket.id && a.tipo === 'VOCERIA_DIRECTOR_UX')
  return (
    <>
      {activas.length && ticket.eje !== 3 ? (
        <Alert
          tone="danger"
          title="Caso de conflicto: se atiende en Eje 3"
          actions={
            atiende ? (
              <Button variant="primary" size="sm" onClick={onDerivarEje3}>
                Derivar a Eje 3
              </Button>
            ) : undefined
          }
        >
          <span className="pt-alerta__texto">
            Señales: {lista(activas)}. Este ticket no se resuelve ni se cierra en Eje {ticket.eje} (RN-SVC-021): derívalo a Eje 3 con el paquete mínimo.
          </span>
        </Alert>
      ) : null}
      {voceria ? (
        <Alert tone="warning" size="sm" title="Sin respuesta pública">
          <span className="pt-alerta__texto">
            La vocería la coordina Dirección UX ({nombrePersona(voceria.destinatario)}, avisada el {fecha(voceria.fecha)}). Quien atiende no responde en medios ni redes.
          </span>
        </Alert>
      ) : null}
      {nota ? (
        <Alert tone="info" size="sm" title="Estado emocional del cliente">
          <span className="pt-alerta__texto">
            {nota.texto} <span className="pt-texto-chico">· {nombrePersona(nota.autor)}, {fecha(nota.fecha)}</span>
          </span>
        </Alert>
      ) : null}
    </>
  )
}

/** La tarjeta lateral: señales con su historial, nota emocional y estado del handoff. */
export function TarjetaConflicto({ ticket, datos, rol, onDerivarEje3 }: { ticket: Ticket; datos: Datos; rol: Rol; onDerivarEje3: () => void }) {
  const [dialogo, setDialogo] = useState<'senal' | 'nota' | { retirar: Senal } | null>(null)
  const confirmar = useAccion()
  const activas = senalesActivas(datos, ticket.id)
  const historial = datos.senales.filter((s) => s.ticketId === ticket.id)
  const handoff = handoffDe(datos, ticket.id)
  const atiende = rol !== 'COORDINADOR_CX' && rol !== 'SIN_ATENCION'
  const sinConfirmarDias = handoff && !handoff.confirmado ? diasHabilesEntre(handoff.enviado, datos.ahora) : 0
  return (
    <Card>
      <CardHeader
        as="h2"
        title="Conflicto y Eje 3"
        actions={
          activas.length ? (
            <Badge tone="danger" size="sm">
              Conflicto
            </Badge>
          ) : undefined
        }
      />
      <CardBody padding="sm">
        <div className="pt-pila">
          <div className="pt-pila pt-pila--chica">
            <p className="pt-texto-chico">Señales activas</p>
            {activas.length ? (
              <ul className="pt-lista-simple">
                {activas.map((s) => (
                  <li key={s} className="pt-en-linea">
                    <Tag size="sm">{NOMBRE_SENAL[s]}</Tag>
                    {rol === 'SUPERVISOR' ? (
                      <Button size="sm" variant="ghost" onClick={() => setDialogo({ retirar: s })}>
                        Retirar por error
                      </Button>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="pt-texto">Ninguna.</p>
            )}
            {atiende && ticket.estado !== 'CLOSED' ? (
              <div className="pt-acciones pt-acciones--inicio">
                <Button size="sm" variant="secondary" onClick={() => setDialogo('senal')}>
                  Marcar señal de conflicto
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setDialogo('nota')}>
                  Nota de estado emocional
                </Button>
              </div>
            ) : null}
          </div>
          {historial.length ? (
            <div className="pt-pila pt-pila--chica">
              <p className="pt-texto-chico">Historial de señales (no se borra)</p>
              <ul className="pt-lista-simple">
                {[...historial].reverse().map((f) => (
                  <li key={f.id}>
                    <strong>
                      {f.accion === 'MARCADA' ? 'Marcada' : 'Retirada'}: {NOMBRE_SENAL[f.senal]}
                    </strong>
                    <span className="pt-texto-chico">
                      {' '}
                      · {nombrePersona(f.autor)} · {fecha(f.fecha)}
                    </span>
                    {f.justificacion ? <span className="pt-texto-chico pt-hito__texto">{f.justificacion}</span> : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {handoff ? (
            <div className="pt-pila pt-pila--chica">
              <p className="pt-texto-chico">
                Handoff a Eje 3 · enviado por {nombrePersona(handoff.autor)} el {fecha(handoff.enviado)}
              </p>
              <CardPairs pairs={ELEMENTOS_HANDOFF.map((e) => [e.nombre, handoff.elementos[e.id]] as [string, string])} />
              {handoff.confirmado ? (
                <Badge tone="success" size="sm" dot>
                  Recepción confirmada por {nombrePersona(handoff.confirmado.autor)} el {fecha(handoff.confirmado.fecha)}
                </Badge>
              ) : (
                <>
                  <Badge tone={sinConfirmarDias >= 1 ? 'danger' : 'warning'} size="sm" dot>
                    {sinConfirmarDias >= 1 ? `Sin confirmar hace ${sinConfirmarDias} ${sinConfirmarDias === 1 ? 'día hábil' : 'días hábiles'}: jefatura avisada` : 'Pendiente de confirmar'}
                  </Badge>
                  {rol === 'LEGAL_RECLAMOS' ? (
                    <Button
                      size="sm"
                      variant="primary"
                      loading={confirmar.enCurso}
                      onClick={async () => {
                        const ok = await confirmar.ejecutar(async () => {
                          await api.confirmarHandoff(ticket.id)
                          return true
                        })
                        if (ok) toast({ message: `${ticket.numero}: recepción confirmada en Eje 3.`, tone: 'success' })
                      }}
                    >
                      Confirmar recepción
                    </Button>
                  ) : null}
                  {confirmar.error ? <AvisoDeError error={confirmar.error} /> : null}
                </>
              )}
            </div>
          ) : activas.length && ticket.eje !== 3 && atiende ? (
            <Button variant="primary" size="sm" onClick={onDerivarEje3}>
              Derivar a Eje 3
            </Button>
          ) : null}
          <Supuesto>El supervisor ATC retira una señal marcada por error; la Especialista Legal Senior del prototipo es la responsable legal de reclamos.</Supuesto>
        </div>
      </CardBody>
      <DialogoSenal ticket={ticket} activas={activas} abierto={dialogo === 'senal'} onCerrar={() => setDialogo(null)} />
      <DialogoNota ticket={ticket} abierto={dialogo === 'nota'} onCerrar={() => setDialogo(null)} />
      <DialogoRetiro ticket={ticket} senal={typeof dialogo === 'object' && dialogo ? dialogo.retirar : null} onCerrar={() => setDialogo(null)} />
    </Card>
  )
}

function DialogoSenal({ ticket, activas, abierto, onCerrar }: { ticket: Ticket; activas: Senal[]; abierto: boolean; onCerrar: () => void }) {
  const id = useId()
  const [marcadas, setMarcadas] = useState<Senal[]>([])
  const guardar = useAccion()
  useEffect(() => {
    if (!abierto) return
    setMarcadas([])
    guardar.limpiar()
  }, [abierto, guardar.limpiar])
  const enviar = async () => {
    const ok = await guardar.ejecutar(async () => {
      await api.marcarSenales(ticket.id, marcadas)
      return true
    })
    if (ok) {
      toast({ message: `${ticket.numero}: señal de conflicto marcada. Se atiende en Eje 3.`, tone: 'warning' })
      onCerrar()
    }
  }
  const errores = erroresDeCampos(guardar.error)
  return (
    <Dialog
      open={abierto}
      onOpenChange={(a) => (a ? undefined : onCerrar())}
      title="Marcar señal de conflicto"
      description="Con una señal activa, el ticket no se resuelve en Eje 1/2: pasa a Eje 3 (Legal)."
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" form={`${id}-f`} loading={guardar.enCurso}>
            Marcar
          </Button>
        </>
      }
    >
      <Form id={`${id}-f`} onSubmit={enviar}>
        <FormGroup legend="Señales" error={errores.senales}>
          {SENALES.map((s) => (
            <Checkbox
              key={s}
              label={NOMBRE_SENAL[s]}
              helper={activas.includes(s) ? 'Ya está activa.' : undefined}
              disabled={activas.includes(s)}
              checked={activas.includes(s) || marcadas.includes(s)}
              onChange={(e) => setMarcadas((l) => (e.target.checked ? [...l, s] : l.filter((x) => x !== s)))}
            />
          ))}
        </FormGroup>
        {guardar.error && !errores.senales ? <AvisoDeError error={guardar.error} reintentar={enviar} /> : null}
      </Form>
    </Dialog>
  )
}

function DialogoRetiro({ ticket, senal, onCerrar }: { ticket: Ticket; senal: Senal | null; onCerrar: () => void }) {
  const id = useId()
  const [justificacion, setJustificacion] = useState('')
  const guardar = useAccion()
  useEffect(() => {
    if (!senal) return
    setJustificacion('')
    guardar.limpiar()
  }, [senal, guardar.limpiar])
  if (!senal) return null
  const errores = erroresDeCampos(guardar.error)
  const enviar = async () => {
    const ok = await guardar.ejecutar(async () => {
      await api.retirarSenal(ticket.id, senal, justificacion)
      return true
    })
    if (ok) {
      toast({ message: `Señal «${NOMBRE_SENAL[senal]}» retirada. Queda en el historial.`, tone: 'success' })
      onCerrar()
    }
  }
  return (
    <Dialog
      open
      onOpenChange={(a) => (a ? undefined : onCerrar())}
      title={`Retirar «${NOMBRE_SENAL[senal]}»`}
      description="Solo si se marcó por error. El retiro queda en el historial con tu nombre y la justificación."
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button variant="danger" type="submit" form={`${id}-f`} loading={guardar.enCurso}>
            Retirar la señal
          </Button>
        </>
      }
    >
      <Form id={`${id}-f`} onSubmit={enviar} errors={errores.justificacion ? { [`${id}-j`]: errores.justificacion } : {}}>
        <FormField label="Justificación" id={`${id}-j`} error={errores.justificacion} required>
          <Textarea rows={3} value={justificacion} onChange={(e) => setJustificacion(e.target.value)} maxLength={500} />
        </FormField>
        {guardar.error && !errores.justificacion ? <AvisoDeError error={guardar.error} /> : null}
      </Form>
    </Dialog>
  )
}

function DialogoNota({ ticket, abierto, onCerrar }: { ticket: Ticket; abierto: boolean; onCerrar: () => void }) {
  const id = useId()
  const [texto, setTexto] = useState('')
  const guardar = useAccion()
  useEffect(() => {
    if (!abierto) return
    setTexto('')
    guardar.limpiar()
  }, [abierto, guardar.limpiar])
  const errores = erroresDeCampos(guardar.error)
  const juicio = palabrasDeJuicio(texto)
  const enviar = async () => {
    const ok = await guardar.ejecutar(async () => {
      await api.registrarNotaEmocional(ticket.id, texto)
      return true
    })
    if (ok) {
      toast({ message: 'Nota de estado emocional registrada: la verá quien atienda después.', tone: 'success' })
      onCerrar()
    }
  }
  return (
    <Dialog
      open={abierto}
      onOpenChange={(a) => (a ? undefined : onCerrar())}
      title="Nota de estado emocional"
      description="Describe lo que observaste: lo que dijo el cliente, su tono y lo que pidió. Sin calificarlo."
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" form={`${id}-f`} loading={guardar.enCurso}>
            Guardar la nota
          </Button>
        </>
      }
    >
      <Form id={`${id}-f`} onSubmit={enviar} errors={errores.texto ? { [`${id}-t`]: errores.texto } : {}}>
        <FormField
          label="Cómo se encuentra el cliente"
          id={`${id}-t`}
          error={errores.texto}
          required
          helper={juicio.length ? `Contiene palabras de juicio: ${juicio.join(', ')}. Reformúlalas antes de guardar.` : 'Ejemplo: «Levantó la voz dos veces y pidió hablar con un responsable».'}
        >
          <Textarea rows={4} value={texto} onChange={(e) => setTexto(e.target.value)} maxLength={1000} showCounter />
        </FormField>
        <Supuesto>Lista inicial de palabras de juicio («grosero», «conflictivo», «loco», «exagerado», «agresivo»…); la amplía el PO.</Supuesto>
        {guardar.error && !errores.texto ? <AvisoDeError error={guardar.error} reintentar={enviar} /> : null}
      </Form>
    </Dialog>
  )
}

const VACIO_HANDOFF: Record<string, string> = { id: '', kyc: '', lote: '', pagos: '', atencion: '', paso: '' }

/** HU-ATC-027: el paquete mínimo de 6 elementos, completo antes de enviar. */
export function CajonHandoff({ ticket, datos, abierto, onCerrar }: { ticket: Ticket; datos: Datos; abierto: boolean; onCerrar: () => void }) {
  const id = useId()
  const c = cliente(ticket.clienteId)
  const [v, setV] = useState(VACIO_HANDOFF)
  const guardar = useAccion()
  const conflicto = senalesActivas(datos, ticket.id).length > 0
  const sinNota = conflicto && !notaEmocionalVigente(datos, ticket.id)

  useEffect(() => {
    if (!abierto) return
    setV({ ...VACIO_HANDOFF, id: c ? `${ticket.numero} · ${c.nombre} · DNI ${dniEnmascarado(c.dni)}` : ticket.numero })
    guardar.limpiar()
  }, [abierto, ticket.numero, c, guardar.limpiar])

  const errores = erroresDeCampos(guardar.error)
  const campo = (k: string) => `${id}-${k}`
  const completos = ELEMENTOS_HANDOFF.filter((e) => v[e.id]?.trim()).length
  const enviar = async () => {
    const ok = await guardar.ejecutar(async () => {
      await api.enviarHandoff(ticket.id, v as ElementosHandoff)
      return true
    })
    if (ok) {
      toast({ message: `${ticket.numero} derivado a Eje 3 con el paquete mínimo completo. Falta la confirmación de recepción.`, tone: 'success' })
      onCerrar()
    }
  }
  return (
    <Drawer
      open={abierto}
      onOpenChange={(a) => (a ? undefined : onCerrar())}
      title={`Derivar ${ticket.numero} a Eje 3`}
      side="end"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" form={`${id}-f`} loading={guardar.enCurso}>
            Enviar a Eje 3 ({completos}/6)
          </Button>
        </>
      }
    >
      <Form id={`${id}-f`} onSubmit={enviar} errors={Object.fromEntries(Object.entries(errores).map(([k, m]) => [campo(k), m]))}>
        <p className="pt-texto-chico">Paquete mínimo de handoff (RN-SVC-022): los 6 elementos tienen que estar completos. Lo recibe la Especialista Legal Senior, que confirma la recepción.</p>
        {sinNota ? (
          <Alert tone="warning" size="sm" title="Falta la nota de estado emocional">
            <span className="pt-alerta__texto">Un conflicto no se deriva sin ella (RN-SVC-024). Regístrala desde la tarjeta «Conflicto y Eje 3».</span>
          </Alert>
        ) : null}
        {errores.emocional ? (
          <Alert tone="danger" size="sm">
            <span className="pt-alerta__texto">{errores.emocional}</span>
          </Alert>
        ) : null}
        <FormField label="1. Identificación del cliente y del ticket" id={campo('id')} error={errores.id} required>
          <Input value={v.id} onChange={(e) => setV({ ...v, id: e.target.value })} />
        </FormField>
        <div id={campo('kyc')}>
          <Checkbox
            label="2. KYC validado en SIGDA/TAXON"
            helper="Confirma que la identidad del cliente está validada en el maestro."
            checked={Boolean(v.kyc)}
            invalid={Boolean(errores.kyc)}
            onChange={(e) => setV({ ...v, kyc: e.target.checked ? `Validado en SIGDA/TAXON el ${fecha(datos.ahora)}` : '' })}
          />
        </div>
        <FormField label="3. Proyecto y lote" id={campo('lote')} error={errores.lote} required>
          <Select value={v.lote} placeholder="Elige el proyecto y lote" onChange={(e) => setV({ ...v, lote: e.target.value })} options={(c?.proyectos ?? []).map((p) => ({ value: p, label: p }))} />
        </FormField>
        <FormField label="4. Pagos y estado de cuenta" id={campo('pagos')} error={errores.pagos} required helper="Resumen y fecha del estado de cuenta consultado.">
          <Textarea rows={2} value={v.pagos} onChange={(e) => setV({ ...v, pagos: e.target.value })} maxLength={500} />
        </FormField>
        <FormField label="5. Atención previa" id={campo('atencion')} error={errores.atencion} required helper="Qué se hizo hasta ahora. Sin datos personales.">
          <Textarea rows={2} value={v.atencion} onChange={(e) => setV({ ...v, atencion: e.target.value })} maxLength={500} />
        </FormField>
        <FormField label="6. Próximo paso propuesto" id={campo('paso')} error={errores.paso} required>
          <Textarea rows={2} value={v.paso} onChange={(e) => setV({ ...v, paso: e.target.value })} maxLength={500} />
        </FormField>
        <Supuesto>El paquete se exige al pasar a Eje 3; entre Eje 1 y Eje 2 la derivación sigue siendo la de la ola 1. El estado de cuenta se resume, no se adjunta.</Supuesto>
        {guardar.error && !Object.keys(errores).length ? <AvisoDeError error={guardar.error} reintentar={enviar} /> : null}
      </Form>
    </Drawer>
  )
}
