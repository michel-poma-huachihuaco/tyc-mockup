import { Alert, Badge, Button, Card, CardBody, DateTimePicker, Form, FormField, Header, Input, Select } from '@aybarcorp/ui'
import { useId, useState } from 'react'
import { AvisoDeError, Prohibido, Supuesto, erroresDeCampos, fecha, irA, useAccion } from '../comun.tsx'
import { nombrePersona } from '../datos/catalogos.ts'
import { hrefDe } from '../rutas.ts'
import { api, useConsola, useSesion } from '../servicio/api.ts'
import type { Ticket } from '../servicio/nucleo.ts'
import { DESTINOS_INGRESO, MOTIVOS_INGRESO, RESPONSABLE_PROYECTO, puedeRegistrarIngreso, validarIngreso } from '../servicio/ola8.ts'
import type { EntradaIngreso } from '../servicio/ola8.ts'

/**
 * Ingreso a un proyecto (HU-ATC-059): formulario de 6 campos pensado para el celular de la
 * garita. Crea el ticket «Ingreso a proyecto» para el responsable; un DNI de cliente lo
 * vincula a su ficha y su lote; sin conexión, se guarda en el celular y se envía al volver.
 */
export default function Ingreso() {
  const sesion = useSesion()
  const { datos, sim } = useConsola()
  const id = useId()
  const [v, setV] = useState<EntradaIngreso>({ nombre: '', dni: '', telefono: '', motivo: '', destino: '', fecha: null })
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [hecho, setHecho] = useState<{ ticket: Ticket | null; local: boolean } | null>(null)
  const guardar = useAccion()
  if (!puedeRegistrarIngreso(sesion)) {
    return (
      <div className="pt-pagina">
        <Header title="Ingreso a proyecto" />
        <Prohibido requiere="de control de acceso" recurso="registrar ingresos" />
      </div>
    )
  }
  const fechaVigente = v.fecha ?? datos.ahora
  const fijar = <K extends keyof EntradaIngreso>(k: K, valor: EntradaIngreso[K]) => {
    setV((x) => ({ ...x, [k]: valor }))
    setErrores((e) => ({ ...e, [k]: '' }))
  }
  const enviar = async () => {
    const entrada = { ...v, fecha: fechaVigente }
    const campos = validarIngreso(entrada)
    setErrores(Object.fromEntries(campos.map((c) => [c.campo, c.mensaje])))
    if (campos.length) return
    const r = await guardar.ejecutar(() => api.registrarIngreso(entrada))
    if (r) {
      setHecho({ ticket: r.ticket, local: r.guardadoLocal })
      setV({ nombre: '', dni: '', telefono: '', motivo: '', destino: '', fecha: null })
    }
  }
  const servidor = erroresDeCampos(guardar.error)
  const err = (k: string) => errores[k] || servidor[k] || undefined
  const responsable = hecho?.ticket?.responsable
  const pendientes = sim.ingresosPendientes.length
  return (
    <div className="pt-pagina">
      <Header title="Ingreso a proyecto" description="Registra a cada persona que entra. Se avisa al responsable del proyecto." />
      {sim.sinConexion ? (
        <Alert tone="warning" size="sm" title="Sin conexión">
          <span className="pt-alerta__texto">Puedes seguir registrando: los ingresos se guardan en este celular y se envían solos al recuperar la conexión.</span>
        </Alert>
      ) : null}
      {pendientes ? (
        <Alert tone="info" size="sm" title={`${pendientes} ${pendientes === 1 ? 'ingreso guardado' : 'ingresos guardados'} en este celular`}>
          <span className="pt-alerta__texto">Esperan la conexión para enviarse.</span>
        </Alert>
      ) : null}
      {hecho ? (
        <Alert tone="success" size="sm" title={hecho.local ? 'Guardado en este celular' : `Ingreso registrado · ${hecho.ticket?.numero}`}>
          <span className="pt-alerta__texto">
            {hecho.local ? 'Se enviará al recuperar la conexión.' : `Se avisó a ${nombrePersona(responsable ?? null)}.`}
          </span>
          {hecho.ticket ? (
            <span className="pt-en-linea">
              {hecho.ticket.clienteId === 'cli-int' ? <Badge tone="info" size="sm">Visitante nuevo (interesado)</Badge> : <Badge tone="success" size="sm">Cliente reconocido: ticket vinculado a su ficha y lote</Badge>}
              <Button size="sm" variant="ghost" onClick={() => irA(hrefDe(`ticket/${hecho.ticket?.id}`))}>Ver el ticket</Button>
            </span>
          ) : null}
        </Alert>
      ) : null}
      {guardar.error && !Object.keys(servidor).length ? <AvisoDeError error={guardar.error} reintentar={enviar} titulo="No se registró el ingreso" /> : null}
      <Card>
        <CardBody>
          <Form id={`${id}-f`} onSubmit={enviar} errors={Object.fromEntries(Object.entries({ ...servidor, ...errores }).filter(([, m]) => m))} submitting={guardar.enCurso}>
            <FormField label="Nombre completo" error={err('nombre')} required>
              <Input value={v.nombre} onChange={(e) => fijar('nombre', e.target.value)} autoComplete="off" />
            </FormField>
            <FormField label="DNI" error={err('dni')} required>
              <Input value={v.dni} inputMode="numeric" maxLength={8} onChange={(e) => fijar('dni', e.target.value.replace(/\D/g, ''))} />
            </FormField>
            <FormField label="Teléfono" error={err('telefono')} required>
              <Input value={v.telefono} inputMode="tel" onChange={(e) => fijar('telefono', e.target.value)} />
            </FormField>
            <FormField label="Motivo de la visita" error={err('motivo')} required>
              <Select value={v.motivo} placeholder="Elige el motivo" onChange={(e) => fijar('motivo', e.target.value)} options={MOTIVOS_INGRESO.map((m) => ({ value: m, label: m }))} />
            </FormField>
            <FormField label="Proyecto o área que visita" error={err('destino')} required helper={v.destino ? `Responsable: ${nombrePersona(RESPONSABLE_PROYECTO[v.destino] ?? 'p-ctorres')}${RESPONSABLE_PROYECTO[v.destino] === null ? ' (supervisora comercial: el proyecto no tiene responsable en el maestro)' : ''}` : undefined}>
              <Select value={v.destino} placeholder="Elige el proyecto" onChange={(e) => fijar('destino', e.target.value)} options={DESTINOS_INGRESO.map((m) => ({ value: m, label: m }))} />
            </FormField>
            <DateTimePicker label="Fecha y hora del ingreso" value={fechaVigente} onValueChange={(d) => d && fijar('fecha', d)} locale="es-PE" timeStep={5} />
            <div className="pt-acciones">
              <Button type="submit" variant="primary" loading={guardar.enCurso}>Registrar ingreso</Button>
            </div>
          </Form>
          <p className="pt-texto-chico">Hora actual simulada: {fecha(datos.ahora)}.</p>
        </CardBody>
      </Card>
      <Supuesto>El formulario tiene exactamente 6 campos; el motivo sale de una lista corta (por validar). El ticket lo crea el servicio de formularios y se asigna al responsable del proyecto del maestro.</Supuesto>
    </div>
  )
}
