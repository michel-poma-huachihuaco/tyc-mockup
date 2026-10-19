import { Badge, Button, Card, CardBody, CardHeader, ConfirmationDialog, List, ListItem, toast } from '@aybarcorp/ui'
import { useState } from 'react'
import { HOY, SESIONES } from '../../datos'
import type { SesionAbierta } from '../../datos'
import { haceCuanto } from '../../utiles'

/**
 * Sesiones: los dispositivos con la sesión abierta. La de esta pestaña no se puede cerrar
 * desde aquí; las demás, cada una con su confirmación, o todas a la vez.
 */
export function Sesiones() {
  const [sesiones, setSesiones] = useState<readonly Readonly<SesionAbierta>[]>(SESIONES)
  const [cerrando, setCerrando] = useState<Readonly<SesionAbierta> | 'todas' | null>(null)
  const otras = sesiones.filter((s) => !s.actual)

  const confirmar = () => {
    if (cerrando === 'todas') {
      setSesiones((lista) => lista.filter((s) => s.actual))
      toast({ message: `${otras.length} sesiones cerradas en esta maqueta.`, tone: 'success' })
    } else if (cerrando) {
      setSesiones((lista) => lista.filter((s) => s.id !== cerrando.id))
      toast({ message: `Sesión de ${cerrando.navegador} cerrada en esta maqueta.`, tone: 'success' })
    }
    setCerrando(null)
  }

  return (
    <div className="gl-cuenta__rejilla">
      <Card>
        <CardHeader
          as="h2"
          title="Dónde tienes la sesión abierta"
          subtitle={`${sesiones.length} ${sesiones.length === 1 ? 'dispositivo' : 'dispositivos'}. Si no reconoces uno, ciérralo y cambia la contraseña.`}
          actions={
            otras.length > 0 ? (
              <Button variant="secondary" size="sm" onClick={() => setCerrando('todas')}>
                Cerrar las demás
              </Button>
            ) : undefined
          }
        />
        <CardBody padding="none">
          <List label="Sesiones abiertas" dividers>
            {sesiones.map((s) => (
              <ListItem
                key={s.id}
                lead={<span className="gl-dispositivo">{glifo(s.dispositivo)}</span>}
                title={`${s.dispositivo} · ${s.navegador}`}
                meta={`${s.lugar} · ${s.ip} · ${s.actual ? 'activa ahora' : haceCuanto(s.ultimaActividad, HOY)}`}
                trail={
                  s.actual ? (
                    <Badge tone="success">Esta sesión</Badge>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => setCerrando(s)}>
                      Cerrar sesión<span className="ay-visually-hidden"> de {s.navegador} en {s.lugar}</span>
                    </Button>
                  )
                }
              />
            ))}
          </List>
        </CardBody>
      </Card>
      <ConfirmationDialog
        open={cerrando !== null}
        onOpenChange={(abierto) => {
          if (!abierto) setCerrando(null)
        }}
        tone="neutral"
        title={cerrando === 'todas' ? `¿Cerrar las otras ${otras.length} sesiones?` : `¿Cerrar la sesión de ${cerrando?.navegador ?? ''}?`}
        description={
          cerrando === 'todas'
            ? 'Quien use esos dispositivos tendrá que volver a entrar. Esta pestaña sigue abierta.'
            : 'Ese dispositivo tendrá que volver a entrar con la contraseña y el segundo paso.'
        }
        confirmLabel={cerrando === 'todas' ? 'Cerrar las demás sesiones' : 'Cerrar esa sesión'}
        onConfirm={confirmar}
      />
    </div>
  )
}

const trazo = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, focusable: false } as const

/** El dibujo del tipo de dispositivo; decorativo: el tipo va escrito en el título. */
function glifo(dispositivo: string) {
  if (dispositivo === 'Celular') {
    return (
      <svg {...trazo}>
        <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
        <path d="M11 18h2" />
      </svg>
    )
  }
  if (dispositivo === 'Tableta') {
    return (
      <svg {...trazo}>
        <rect x="4.5" y="2.5" width="15" height="19" rx="2.5" />
        <path d="M11 18h2" />
      </svg>
    )
  }
  return (
    <svg {...trazo}>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  )
}
