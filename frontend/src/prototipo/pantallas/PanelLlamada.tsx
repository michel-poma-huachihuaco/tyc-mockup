import { Alert, Badge, Button, Card, CardBody, CardHeader, CardPairs, FormField, Select, Tag, toast } from '@aybarcorp/ui'
import { useRef, useState } from 'react'
import { AvisoDeError, BadgeEstado, Supuesto, irA, precarga, useAccion } from '../comun.tsx'
import { ESTADOS_ACTIVOS } from '../datos/catalogos.ts'
import { dniEnmascarado } from '../datos/clientes.ts'
import type { Cliente } from '../datos/clientes.ts'
import { hrefDe } from '../rutas.ts'
import { api, simulacion, useConsola, useSesion } from '../servicio/api.ts'
import { puede } from '../servicio/nucleo.ts'
import { textoDuracion } from '../servicio/ola7.ts'
import { BuscadorClientes } from './Clientes.tsx'

const SIN_TICKET = '__ninguno'

/**
 * Llamada entrante (HU-ATC-042): al contestar, la consola abre la ficha del cliente y sus
 * tickets abiertos (2 s o menos); al terminar, la llamada queda como interacción del ticket
 * con su duración y el enlace a la grabación. Un número desconocido abre la búsqueda.
 */
export function PanelLlamada() {
  const { sim } = useConsola()
  const sesion = useSesion()
  if (!sim.llamada || !puede.atender(sesion.rol)) return null
  return <Llamando key={sim.llamada.id} numero={sim.llamada.numero} />
}

function Llamando({ numero }: { numero: string }) {
  const { datos } = useConsola()
  const [fase, setFase] = useState<'timbrando' | 'en-curso'>('timbrando')
  const inicio = useRef(0)
  const [ficha, setFicha] = useState<{ cliente: Cliente | null; ms: number } | null>(null)
  const [elegido, setElegido] = useState<Cliente | null>(null)
  const [ticket, setTicket] = useState('')
  const pop = useAccion()
  const cerrar = useAccion()

  const contestar = async () => {
    setFase('en-curso')
    inicio.current = Date.now()
    const t0 = performance.now()
    const r = await pop.ejecutar(() => api.fichaPorTelefono(numero))
    if (r) setFicha({ cliente: r.cliente, ms: performance.now() - t0 })
  }

  const c = elegido ?? ficha?.cliente ?? null
  const abiertos = c ? datos.tickets.filter((t) => t.clienteId === c.id && ESTADOS_ACTIVOS.includes(t.estado)) : []
  const idTicket = ticket || abiertos[0]?.id || SIN_TICKET
  const finalizar = async () => {
    const r = await cerrar.ejecutar(() => api.finalizarLlamada({ clienteId: c?.id ?? null, ticketId: idTicket === SIN_TICKET ? null : idTicket, duracionS: (Date.now() - inicio.current) / 1000 }))
    if (r) {
      toast({ message: `Llamada registrada: ${textoDuracion(r.duracionS)} · Grabación ${r.grabacion}${r.ticketId ? ' · queda en el ticket' : ''}.`, tone: 'success' })
      simulacion.ajustar({ llamada: null })
    }
  }
  const comoInteresado = () => {
    precarga.telefono = numero
    irA(hrefDe('nuevo'))
  }

  return (
    <section aria-label="Llamada entrante" className="pt-llamada">
      <Card>
        <CardHeader
          as="h2"
          title={fase === 'timbrando' ? `Llamada entrante · ${numero}` : `En llamada · ${numero}`}
          actions={<Badge tone={fase === 'timbrando' ? 'warning' : 'success'} size="sm" dot>{fase === 'timbrando' ? 'Timbrando' : 'En curso'}</Badge>}
        />
        <CardBody padding="sm">
          <div className="pt-pila pt-pila--chica">
            {fase === 'timbrando' ? (
              <div className="pt-acciones pt-acciones--inicio">
                <Button variant="primary" size="sm" onClick={contestar}>Contestar</Button>
                <Button variant="ghost" size="sm" onClick={() => simulacion.ajustar({ llamada: null })}>Rechazar</Button>
              </div>
            ) : (
              <>
                {pop.enCurso ? <p className="pt-texto-chico" role="status">Buscando al cliente por su teléfono…</p> : null}
                {pop.error ? (
                  <div className="pt-pila pt-pila--chica">
                    <AvisoDeError error={pop.error} reintentar={contestar} titulo="No se pudo abrir la ficha" />
                    <Button size="sm" variant="secondary" onClick={comoInteresado}>Registrar como interesado</Button>
                  </div>
                ) : null}
                {ficha ? (
                  <Tag size="sm" variant="outline">
                    {ficha.ms <= 2000 ? `Ficha lista en ${(ficha.ms / 1000).toFixed(1).replace('.', ',')} s` : `Ficha tardó ${(ficha.ms / 1000).toFixed(1).replace('.', ',')} s (objetivo: 2 s)`}
                  </Tag>
                ) : null}
                {ficha && !c ? (
                  <div className="pt-pila pt-pila--chica">
                    <Alert tone="info" size="sm" title="Número no registrado" actions={<Button size="sm" variant="secondary" onClick={comoInteresado}>Registrar como interesado</Button>}>
                      <span className="pt-alerta__texto">Identifica al cliente con la búsqueda, o regístralo como interesado.</span>
                    </Alert>
                    <BuscadorClientes accion="Elegir" onElegir={(r) => setElegido(r.cliente)} />
                  </div>
                ) : null}
                {c ? (
                  <div className="pt-pila pt-pila--chica">
                    <CardPairs
                      pairs={[
                        ['Cliente', <button key="n" type="button" className="pt-enlace-celda" onClick={() => irA(hrefDe(`clientes/${c.id}`))}>{c.nombre}</button>],
                        ['DNI', dniEnmascarado(c.dni)],
                        ['Lotes', c.proyectos.join(' · ')],
                        ['Tickets abiertos', abiertos.length ? '' : 'Ninguno'],
                      ]}
                    />
                    {abiertos.length ? (
                      <ul className="pt-lista-simple">
                        {abiertos.map((t) => (
                          <li key={t.id} className="pt-en-linea">
                            <button type="button" className="pt-enlace-celda" onClick={() => irA(hrefDe(`ticket/${t.id}`))}>{t.numero}</button> {t.resumen} <BadgeEstado estado={t.estado} size="sm" />
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    <FormField label="Registrar la llamada en el ticket">
                      <Select value={idTicket} onChange={(e) => setTicket(e.target.value)} options={[...abiertos.map((t) => ({ value: t.id, label: `${t.numero} · ${t.resumen}` })), { value: SIN_TICKET, label: 'Sin ticket (solo en la ficha)' }]} />
                    </FormField>
                  </div>
                ) : null}
                {cerrar.error ? <AvisoDeError error={cerrar.error} reintentar={finalizar} /> : null}
                <div className="pt-acciones pt-acciones--inicio">
                  <Button variant="primary" size="sm" loading={cerrar.enCurso} onClick={finalizar}>Finalizar y registrar la llamada</Button>
                </div>
              </>
            )}
            <Supuesto>La plataforma del call center y su aviso de llamada (CTI) aún no se han elegido (DEP-11): la llamada la simula el panel «Simulación». La grabación es un código ficticio.</Supuesto>
          </div>
        </CardBody>
      </Card>
    </section>
  )
}
