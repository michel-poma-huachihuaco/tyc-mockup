import { Alert, Badge, Button, Card, CardBody, CardHeader, ConfirmationDialog, TreeView, toast } from '@aybarcorp/ui'
import type { TreeNode } from '@aybarcorp/ui'
import { useId, useState } from 'react'
import { MODULOS, PERSONAS, ROLES } from '../../datos'

const ARBOL: TreeNode[] = MODULOS.map((m) => ({
  id: `modulo:${m.id}`,
  label: m.nombre,
  meta: `${m.permisos.length} permisos`,
  children: m.permisos.map((p) => ({ id: p.id, label: p.nombre })),
}))

const TODOS = MODULOS.flatMap((m) => m.permisos.map((p) => p.id))
const ABIERTAS = MODULOS.map((m) => `modulo:${m.id}`)

/** Solo los permisos (las hojas): una rama marcada en el árbol trae su id y no es un permiso. */
const soloPermisos = (ids: readonly string[]) => ids.filter((id) => TODOS.includes(id))

/**
 * Roles: la lista de roles a la izquierda y, del elegido, sus permisos en un Tree View con
 * casillas (marcar un módulo marca todos sus permisos; uno a medias se ve mixto). Los cambios
 * son un borrador hasta «Guardar»; «Descartar» los quita, y cambiar de rol con cambios sin
 * guardar lo pregunta. Administración concede todo y no se edita.
 */
export function Roles() {
  const [permisos, setPermisos] = useState<Record<string, string[]>>(() => Object.fromEntries(ROLES.map((r) => [r.id, [...r.permisos]])))
  const [elegido, setElegido] = useState('VENTAS')
  const [borrador, setBorrador] = useState<string[] | null>(null)
  const [pendiente, setPendiente] = useState<string | null>(null)
  const [expandidas, setExpandidas] = useState<string[]>(ABIERTAS)
  const idLista = useId()
  const rol = ROLES.find((r) => r.id === elegido) ?? ROLES[0]!
  const guardados = permisos[rol.id] ?? []
  const actuales = borrador ?? guardados
  const sucio = borrador !== null && (borrador.length !== guardados.length || borrador.some((p) => !guardados.includes(p)))
  const fijo = rol.id === 'ADMIN'
  const personas = PERSONAS.filter((p) => p.roles.includes(rol.id)).length

  const elegir = (id: string) => {
    if (id === elegido) return
    if (sucio) setPendiente(id)
    else {
      setElegido(id)
      setBorrador(null)
    }
  }

  return (
    <div className="gl-roles">
      <nav className="gl-roles__lista" aria-labelledby={idLista}>
        <p id={idLista} className="gl-vitrina__rotulo">
          Roles
        </p>
        <ul>
          {ROLES.map((r) => (
            <li key={r.id}>
              <button type="button" className="gl-roles__rol" aria-current={r.id === elegido ? 'true' : undefined} onClick={() => elegir(r.id)}>
                <span className="gl-roles__nombre">{r.nombre}</span>
                <span className="gl-roles__meta">
                  {(permisos[r.id] ?? []).length} permisos · {PERSONAS.filter((p) => p.roles.includes(r.id)).length} personas
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <Card>
        <CardHeader
          as="h2"
          title={rol.nombre}
          subtitle={rol.descripcion}
          actions={
            <Badge tone={fijo ? 'info' : 'neutral'}>
              {actuales.length} de {TODOS.length} permisos
            </Badge>
          }
        />
        <CardBody>
          {fijo ? (
            <Alert tone="info" size="sm" live="off">
              Administración concede todos los permisos y no se edita aquí: quitarle uno dejaría la plataforma sin quien la gestione.
            </Alert>
          ) : (
            <p className="gl-texto-chico">
              {personas} {personas === 1 ? 'persona tiene' : 'personas tienen'} este rol. Los cambios se aplican al guardar.
            </p>
          )}
          <TreeView
            aria-label={`Permisos del rol ${rol.nombre}`}
            nodes={ARBOL}
            mode={fijo ? 'read-only' : 'multi'}
            expandedIds={expandidas}
            onExpandedChange={setExpandidas}
            selectedIds={fijo ? TODOS : actuales}
            onSelectedChange={(ids) => setBorrador(soloPermisos(ids))}
            showCount
          />
          {fijo ? null : (
            <div className="gl-acciones">
              <span className="gl-texto-chico" aria-live="polite">
                {sucio ? 'Cambios sin guardar.' : ''}
              </span>
              <Button variant="ghost" disabled={!sucio} onClick={() => setBorrador(null)}>
                Descartar
              </Button>
              <Button
                variant="primary"
                disabled={!sucio}
                onClick={() => {
                  if (!borrador) return
                  setPermisos((p) => ({ ...p, [rol.id]: borrador }))
                  setBorrador(null)
                  toast({ message: `Permisos de ${rol.nombre} guardados en esta maqueta.`, tone: 'success' })
                }}
              >
                Guardar
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      <ConfirmationDialog
        open={pendiente !== null}
        onOpenChange={(abierto) => {
          if (!abierto) setPendiente(null)
        }}
        title={`¿Descartar los cambios de ${rol.nombre}?`}
        description="Los permisos que marcaste o desmarcaste en este rol no se han guardado."
        cancelLabel="Seguir editando"
        confirmLabel="Descartar los cambios"
        onConfirm={() => {
          if (pendiente) setElegido(pendiente)
          setBorrador(null)
          setPendiente(null)
        }}
      />
    </div>
  )
}
