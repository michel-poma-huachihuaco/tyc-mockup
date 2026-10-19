import { Button, Card, CardBody, CardHeader, Notification, Switch } from '@aybarcorp/ui'
import { useState } from 'react'
import { AVISOS, PREFERENCIAS_NOTIFICACION } from '../../datos'
import type { CanalNotificacion } from '../../datos'
import { BASE } from '../../rutas'

/** Adónde lleva cada aviso dentro de la galería (el registro afectado, si existe aquí). */
const DESTINO: Readonly<Record<string, string>> = { 'n-1': `${BASE}/3d`, 'n-3': `${BASE}/cuenta/sesiones` }

const CANALES: readonly { id: CanalNotificacion; nombre: string }[] = [
  { id: 'correo', nombre: 'Correo' },
  { id: 'app', nombre: 'En la app' },
  { id: 'sms', nombre: 'SMS' },
]

/**
 * Notificaciones: una tabla de Switch por tipo de aviso y canal (los avisos de seguridad no
 * se pueden apagar todos: el último canal encendido queda fijo y lo dice), y debajo los
 * avisos recientes con su estado de lectura.
 */
export function Notificaciones() {
  const [preferencias, setPreferencias] = useState(() => PREFERENCIAS_NOTIFICACION.map((p) => ({ ...p, canales: { ...p.canales } })))
  const [leidos, setLeidos] = useState(() => new Set(AVISOS.filter((a) => a.leido).map((a) => a.id)))
  const sinLeer = AVISOS.length - leidos.size

  const cambiar = (id: string, canal: CanalNotificacion, valor: boolean) =>
    setPreferencias((lista) => lista.map((p) => (p.id === id ? { ...p, canales: { ...p.canales, [canal]: valor } } : p)))

  return (
    <div className="gl-cuenta__rejilla">
      <Card>
        <CardHeader as="h2" title="Qué te avisamos y por dónde" subtitle="Cada cambio se aplica al instante." />
        <CardBody padding="none">
          <div className="gl-tabla-canales" role="region" aria-label="Canales por tipo de aviso" tabIndex={0}>
            <table>
              <thead>
                <tr>
                  <th scope="col">Aviso</th>
                  {CANALES.map((c) => (
                    <th key={c.id} scope="col">
                      {c.nombre}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preferencias.map((p) => {
                  const encendidos = CANALES.filter((c) => p.canales[c.id]).length
                  return (
                    <tr key={p.id}>
                      <th scope="row">
                        <span className="gl-tabla-canales__titulo">{p.titulo}</span>
                        <span className="gl-tabla-canales__desc">{p.descripcion}</span>
                      </th>
                      {CANALES.map((c) => {
                        const fijo = p.id === 'seguridad' && p.canales[c.id] && encendidos === 1
                        return (
                          <td key={c.id} className="gl-celda-switch">
                            <Switch
                              label={`${p.titulo} por ${c.nombre.toLowerCase()}`}
                              checked={p.canales[c.id]}
                              disabled={fijo}
                              title={fijo ? 'Los avisos de seguridad necesitan al menos un canal' : undefined}
                              onCheckedChange={(valor) => cambiar(p.id, c.id, valor)}
                            />
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          as="h2"
          title="Avisos recientes"
          subtitle={sinLeer > 0 ? `${sinLeer} sin leer` : 'Todo leído'}
          actions={
            <Button variant="ghost" size="sm" disabled={sinLeer === 0} onClick={() => setLeidos(new Set(AVISOS.map((a) => a.id)))}>
              Marcar todo como leído
            </Button>
          }
        />
        <CardBody padding="none">
          <ul className="ay-notifications" aria-label="Avisos recientes">
            {AVISOS.map((a) => (
              <Notification
                key={a.id}
                title={a.titulo}
                description={a.descripcion}
                date={new Date(a.fecha)}
                read={leidos.has(a.id)}
                href={DESTINO[a.id]}
                onReadChange={(leido) =>
                  setLeidos((actual) => {
                    const siguiente = new Set(actual)
                    if (leido) siguiente.add(a.id)
                    else siguiente.delete(a.id)
                    return siguiente
                  })
                }
              />
            ))}
          </ul>
        </CardBody>
      </Card>
    </div>
  )
}
