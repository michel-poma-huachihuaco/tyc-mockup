import { Alert, Breadcrumb, Button, Dialog, ErrorPage, FormField, Header, Select, toast } from '@aybarcorp/ui'
import { useState } from 'react'
import { AvisoDeError, Prohibido, Supuesto, irA, useAccion } from '../comun.tsx'
import { cliente, dniEnmascarado } from '../datos/clientes.ts'
import { ESTADOS_ACTIVOS } from '../datos/catalogos.ts'
import { hrefDe } from '../rutas.ts'
import { api, useConsola, useSesion } from '../servicio/api.ts'
import { puede } from '../servicio/nucleo.ts'
import { puedeVerClientes } from '../servicio/ola7.ts'
import { Consulta360 } from './Consulta360.tsx'

const SIN_TICKET = '__ninguno'

/** Ficha del cliente: su consulta 360 y «Llamar» (HU-ATC-049 CA-02), que deja la llamada en el ticket elegido. */
export default function Cliente({ clienteId }: { clienteId: string }) {
  const sesion = useSesion()
  const { datos } = useConsola()
  const [llamando, setLlamando] = useState(false)
  const [ticket, setTicket] = useState('')
  const llamar = useAccion()
  const c = cliente(clienteId)
  if (!puedeVerClientes(sesion)) {
    return (
      <div className="pt-pagina">
        <Prohibido requiere="de atención al cliente o Coordinador CX" recurso="ver la ficha del cliente" />
      </div>
    )
  }
  if (!c) {
    return (
      <div className="pt-pagina">
        <ErrorPage status={404} scope="page" title="Ese cliente no existe" description="El enlace puede ser de otra sesión del prototipo." actions={<Button variant="primary" onClick={() => irA(hrefDe('clientes'))}>Volver a la búsqueda</Button>} />
      </div>
    )
  }
  const abiertos = datos.tickets.filter((t) => t.clienteId === c.id && ESTADOS_ACTIVOS.includes(t.estado))
  const elegido = ticket || abiertos[0]?.id || SIN_TICKET
  const iniciar = async () => {
    const r = await llamar.ejecutar(() => api.iniciarLlamada(c.id, elegido === SIN_TICKET ? null : elegido))
    if (r) {
      setLlamando(false)
      toast({ message: `Llamada iniciada por el call center. Grabación ${r.grabacion}${r.ticketId ? ' · queda en el ticket' : ''}.`, tone: 'success' })
    }
  }
  return (
    <div className="pt-pagina pt-pagina--ancha">
      <Header
        title={c.nombre}
        breadcrumb={<Breadcrumb items={[{ label: 'Clientes', href: hrefDe('clientes') }, { label: c.nombre }]} />}
        description={`DNI ${dniEnmascarado(c.dni)} · ${c.telefono} · ${c.correo}`}
        actions={
          puede.atender(sesion.rol) ? (
            <Button variant="primary" onClick={() => { llamar.limpiar(); setLlamando(true) }}>
              Llamar
            </Button>
          ) : undefined
        }
      />
      <Consulta360 clienteId={c.id} />
      <Dialog
        open={llamando}
        onOpenChange={setLlamando}
        title={`Llamar a ${c.nombre}`}
        description="La llamada sale por la plataforma del call center y queda como interacción del ticket."
        footer={
          <>
            <Button variant="ghost" onClick={() => setLlamando(false)}>Cancelar</Button>
            <Button variant="primary" loading={llamar.enCurso} onClick={iniciar}>Iniciar la llamada</Button>
          </>
        }
      >
        <div className="pt-pila">
          <FormField label="Registrar la llamada en el ticket">
            <Select value={elegido} onChange={(e) => setTicket(e.target.value)} options={[...abiertos.map((t) => ({ value: t.id, label: `${t.numero} · ${t.resumen}` })), { value: SIN_TICKET, label: 'Sin ticket (solo en la ficha)' }]} />
          </FormField>
          {llamar.error ? <AvisoDeError error={llamar.error} reintentar={iniciar} titulo="No se pudo iniciar la llamada" /> : null}
          {!abiertos.length ? (
            <Alert tone="info" size="sm"><span className="pt-alerta__texto">No tiene tickets abiertos: la llamada queda solo en su ficha. Registra un ticket desde «Nuevo ticket».</span></Alert>
          ) : null}
          <Supuesto>«Llamar la cuenta» se entiende como llamada telefónica (click-to-call) por la plataforma del call center, que aún no se ha elegido (DEP-11).</Supuesto>
        </div>
      </Dialog>
    </div>
  )
}
