import { Alert, Badge, Button, Card, CardBody, CardHeader, CardPairs, Dialog, toast } from '@aybarcorp/ui'
import { useState } from 'react'
import { AvisoDeError, Supuesto, dinero, fecha, useAccion } from '../comun.tsx'
import { INTERESADO_ID, cliente } from '../datos/clientes.ts'
import { api } from '../servicio/api.ts'
import type { Datos, Ticket } from '../servicio/nucleo.ts'
import { NOMBRE_ESTADO_LEGAL, NOMBRE_MOTIVO_INTERESADO, INTERES_LEGAL, exposicionDe, interesadoDe, riesgoDenuncia, sincDe } from '../servicio/ola7.ts'
import type { EstadoLegal } from '../servicio/ola7.ts'
import { BuscadorClientes } from './Clientes.tsx'
import { Consulta360 } from './Consulta360.tsx'

/**
 * Lo que la ola 7 suma al detalle del ticket: la pestaña Cliente (consulta 360 o, si aún no
 * está en el maestro, el interesado por vincular), la sincronización con Legal y la
 * exposición económica por riesgo de denuncia.
 */

export function PestanaCliente({ ticket, datos }: { ticket: Ticket; datos: Datos }) {
  return (
    <div className="pt-pila">
      <TarjetaInteresado ticket={ticket} datos={datos} />
      {ticket.clienteId === INTERESADO_ID ? null : <Consulta360 clienteId={ticket.clienteId} ticketId={ticket.id} />}
    </div>
  )
}

/** HU-ATC-051: el ticket nació sin cliente del maestro; queda pendiente de vincular. */
export function TarjetaInteresado({ ticket, datos }: { ticket: Ticket; datos: Datos }) {
  const [abierto, setAbierto] = useState(false)
  const vincular = useAccion()
  const i = interesadoDe(datos, ticket.id)
  if (!i) return null
  const elegir = async (clienteId: string) => {
    const ok = await vincular.ejecutar(async () => {
      await api.vincularInteresado(ticket.id, clienteId)
      return true
    })
    if (ok) {
      setAbierto(false)
      toast({ message: 'El ticket quedó vinculado al cliente del maestro.', tone: 'success' })
    }
  }
  const vinculado = i.estado === 'VINCULADO'
  return (
    <Card>
      <CardHeader as="h2" title="Interesado" actions={<Badge tone={vinculado ? 'success' : 'warning'} size="sm" dot>{vinculado ? 'Vinculado' : 'Pendiente de vincular'}</Badge>} />
      <CardBody padding="sm">
        <div className="pt-pila pt-pila--chica">
          <CardPairs
            pairs={[
              ['Nombre', i.nombre],
              ['Teléfono', i.telefono],
              ['DNI', i.dni || 'No informado'],
              ['Motivo', NOMBRE_MOTIVO_INTERESADO[i.motivo]],
              ['Registrado', fecha(i.registrado)],
              ...(vinculado ? ([['Cliente del maestro', cliente(i.clienteId ?? '')?.nombre ?? '—'], ['Vinculado', i.vinculado ? fecha(i.vinculado) : '—']] as Array<[string, string]>) : []),
            ]}
          />
          {!vinculado ? (
            <>
              <p className="pt-texto-chico">
                {i.motivo === 'SIGDA_CAIDO' && i.dni
                  ? 'El sistema reintenta la vinculación por el DNI cuando SIGDA/TAXON vuelva a responder.'
                  : 'Pendiente de vincular: busca al cliente en el maestro cuando lo tengas identificado. No se crea un registro paralelo.'}
              </p>
              <Button size="sm" variant="secondary" onClick={() => { vincular.limpiar(); setAbierto(true) }}>Vincular al cliente</Button>
            </>
          ) : null}
          <Supuesto>El interesado guarda solo datos mínimos hasta vincularse; al vincular, el cambio queda como nota en la bitácora del ticket.</Supuesto>
        </div>
      </CardBody>
      <Dialog open={abierto} onOpenChange={setAbierto} title="Vincular al cliente del maestro" description={`Ticket ${ticket.numero}: elige al cliente correcto por su lote y DNI parcial.`} footer={<Button variant="ghost" onClick={() => setAbierto(false)}>Cancelar</Button>}>
        <div className="pt-pila">
          {vincular.error ? <AvisoDeError error={vincular.error} /> : null}
          <BuscadorClientes accion="Vincular" onElegir={(r) => void elegir(r.cliente.id)} />
        </div>
      </Dialog>
    </Card>
  )
}

const TONO_LEGAL: Record<EstadoLegal, 'warning' | 'info' | 'success'> = { EN_COLA: 'warning', ENVIADO: 'info', EN_REVISION: 'info', RESUELTO: 'success' }

/** HU-ATC-040: el caso derivado a Eje 3 en la herramienta de Legal y lo que Legal devuelve. */
export function TarjetaLegal({ ticket, datos }: { ticket: Ticket; datos: Datos }) {
  const s = sincDe(datos, ticket.id)
  if (!s) return null
  return (
    <Card>
      <CardHeader as="h2" title="Sincronización con Legal" actions={<Badge tone={TONO_LEGAL[s.estado]} size="sm" dot>{NOMBRE_ESTADO_LEGAL[s.estado]}</Badge>} />
      <CardBody padding="sm">
        <div className="pt-pila pt-pila--chica">
          {s.estado === 'EN_COLA' ? (
            <Alert tone="warning" size="sm" title="Pendiente de sincronizar">
              <span className="pt-alerta__texto">La herramienta de Legal no respondió. El envío quedó en cola y se reintenta en cada corrida del job y cuando Legal vuelva; no lo registres a mano.</span>
            </Alert>
          ) : null}
          <CardPairs
            pairs={[
              ['Caso en Legal', s.idLegal ?? 'Aún sin número'],
              ['Paquete mínimo', `${s.paquete} de 6 elementos`],
              ['Envío', s.enviado ? fecha(s.enviado) : 'En cola'],
              ['Intentos', `${s.intentos} · último ${fecha(s.ultimoIntento)}`],
              ...(s.actualizado ? ([['Actualizado por Legal', fecha(s.actualizado)]] as Array<[string, string]>) : []),
              ...(s.resolucion ? ([['Resolución', s.resolucion]] as Array<[string, string]>) : []),
            ]}
          />
          <Supuesto>La herramienta y la forma de sincronizar (en línea o por lotes) las define Legal; el prototipo usa un simulador (DEP-12).</Supuesto>
        </div>
      </CardBody>
    </Card>
  )
}

/** HU-ATC-041: monto reclamado más interés legal al día; sin monto, «por estimar». */
export function TarjetaExposicion({ ticket, datos }: { ticket: Ticket; datos: Datos }) {
  const e = exposicionDe(datos, ticket)
  if (!e) return null
  const riesgo = riesgoDenuncia(datos, ticket)
  const alerta = datos.alertasRiesgo.find((a) => a.ticketId === ticket.id)
  return (
    <Card>
      <CardHeader as="h2" title="Exposición económica" actions={riesgo ? <Badge tone="danger" size="sm" dot>Riesgo de denuncia</Badge> : undefined} />
      <CardBody padding="sm">
        <div className="pt-pila pt-pila--chica">
          <CardPairs
            pairs={
              e.total === null
                ? [['Exposición', <Badge key="p" tone="warning" size="sm">Por estimar</Badge>], ['Monto reclamado', 'Sin monto registrado']]
                : [
                    ['Monto reclamado', dinero(e.monto ?? 0, e.moneda)],
                    [`Interés legal (${INTERES_LEGAL * 100} % anual, ${e.dias} días)`, dinero(e.interes, e.moneda)],
                    ['Exposición total', <strong key="t">{dinero(e.total, e.moneda)}</strong>],
                  ]
            }
          />
          {e.total === null ? <p className="pt-texto-chico">El caso sigue priorizado por su riesgo de denuncia aunque falte el monto.</p> : null}
          {alerta ? <Alert tone="warning" size="sm" title="Legal ya fue alertado"><span className="pt-alerta__texto">Alerta del {fecha(alerta.fecha)} por una exposición de {dinero(alerta.total, alerta.moneda)}.</span></Alert> : null}
          <Supuesto>Interés legal referencial del 8 % anual y alerta desde S/ 500 de exposición: ambos por confirmar con Legal. Las señales que definen el riesgo (INDECOPI, abogado, carta notarial o 2 reaperturas) también.</Supuesto>
        </div>
      </CardBody>
    </Card>
  )
}
