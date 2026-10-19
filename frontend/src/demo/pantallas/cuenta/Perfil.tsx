import { Avatar, Badge, Button, Card, CardBody, CardHeader, Form, FormField, Input, PhoneInput, Select, Textarea, toast } from '@aybarcorp/ui'
import { useId, useState } from 'react'
import { nombreVisible } from '../../../sesion'
import { useGaleria } from '../../contexto'
import { AREAS_DISPONIBLES } from '../../datos'
import { avisoDemo } from '../../utiles'
import { errorDeCelular, errorDeCorreo } from '../ingreso/comun'

/** Perfil: la foto, el nombre y cómo te contactan, con validación por campo. */
export function Perfil() {
  const { sesion, roles } = useGaleria()
  const nombre = sesion ? nombreVisible(sesion) : 'Persona demo'
  const usuario = sesion?.usuarioId ?? 'demo'
  const id = useId()
  const ids = { nombre: `${id}-nombre`, correo: `${id}-correo`, telefono: `${id}-telefono`, cargo: `${id}-cargo` }
  const [inicial] = useState(() => ({
    nombre,
    correo: `${usuario}@ejemplo.test`,
    telefono: '900000001',
    cargo: roles.includes('ADMIN') ? 'Administración de la plataforma' : 'Ventas',
    area: roles.includes('ADMIN') ? 'Tecnología' : 'Ventas',
    bio: '',
  }))
  const [valores, setValores] = useState(inicial)
  const [errores, setErrores] = useState<Partial<Record<keyof typeof ids, string>>>({})
  const [guardando, setGuardando] = useState(false)

  const cambiar = <K extends keyof typeof valores>(campo: K, valor: (typeof valores)[K]) => {
    setValores((v) => ({ ...v, [campo]: valor }))
    if (campo in errores) setErrores(({ [campo as keyof typeof ids]: _fuera, ...resto }) => resto)
  }

  const guardar = async () => {
    const encontrados: typeof errores = {
      nombre: valores.nombre.trim() ? undefined : 'Escribe tu nombre y apellido.',
      correo: errorDeCorreo(valores.correo),
      telefono: errorDeCelular(valores.telefono),
      cargo: valores.cargo.trim() ? undefined : 'Escribe tu cargo: aparece junto a tu nombre en los contratos.',
    }
    const conError = Object.fromEntries(Object.entries(encontrados).filter(([, m]) => m))
    setErrores(conError)
    if (Object.keys(conError).length > 0) return
    setGuardando(true)
    await new Promise((r) => setTimeout(r, 600))
    setGuardando(false)
    toast({ message: 'Perfil guardado en esta maqueta.', tone: 'success' })
  }

  return (
    <div className="gl-cuenta__rejilla">
      <Card>
        <CardBody>
          <div className="gl-perfil">
            <Avatar name={valores.nombre || nombre} size="xl" status="online" />
            <div className="gl-perfil__texto">
              <p className="gl-perfil__nombre">{valores.nombre || nombre}</p>
              <p className="gl-texto-chico">{valores.cargo}</p>
              <div className="gl-perfil__roles">
                {roles.map((rol) => (
                  <Badge key={rol} tone={rol === 'ADMIN' ? 'info' : 'neutral'} size="sm">
                    {rol}
                  </Badge>
                ))}
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => avisoDemo('Demo: aquí se subiría la foto.')}>
              Cambiar la foto
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader as="h2" title="Datos de contacto" subtitle="Los ven tus compañeros y aparecen en los documentos que firmas." />
        <CardBody>
          <Form onSubmit={guardar} submitting={guardando} errors={limpiar(errores, ids)} dirtyGuard>
            <div className="gl-campos">
              <FormField label="Nombre y apellido" id={ids.nombre} error={errores.nombre}>
                <Input autoComplete="name" value={valores.nombre} onChange={(e) => cambiar('nombre', e.target.value)} />
              </FormField>
              <FormField label="Correo" id={ids.correo} error={errores.correo} helper="Dominio de pruebas: ejemplo.test no resuelve.">
                <Input type="email" autoComplete="email" value={valores.correo} onChange={(e) => cambiar('correo', e.target.value)} />
              </FormField>
              <div id={ids.telefono} tabIndex={-1} className="gl-campo-compuesto">
                <PhoneInput label="Celular" country="PE" kind="mobile" value={valores.telefono} error={errores.telefono} onValueChange={(v) => cambiar('telefono', v)} />
              </div>
              <FormField label="Cargo" id={ids.cargo} error={errores.cargo}>
                <Input autoComplete="organization-title" value={valores.cargo} onChange={(e) => cambiar('cargo', e.target.value)} />
              </FormField>
              <FormField label="Área">
                <Select
                  value={valores.area}
                  onChange={(e) => cambiar('area', e.target.value)}
                  options={AREAS_DISPONIBLES.map((a) => ({ value: a, label: a }))}
                />
              </FormField>
            </div>
            <FormField label="Sobre ti" optional helper="Una o dos frases para quien te asigna trabajo.">
              <Textarea rows={3} maxLength={280} showCounter autoResize value={valores.bio} onChange={(e) => cambiar('bio', e.target.value)} />
            </FormField>
            <div className="ay-form__actions">
              <Button
                variant="ghost"
                onClick={() => {
                  setValores(inicial)
                  setErrores({})
                }}
              >
                Descartar
              </Button>
              <Button type="submit" variant="primary" loading={guardando}>
                Guardar los cambios
              </Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </div>
  )
}

/** Los errores con el id del control como clave, como los pide Form para su resumen. */
function limpiar(errores: Partial<Record<string, string>>, ids: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(errores)
      .filter(([, mensaje]) => mensaje)
      .map(([clave, mensaje]) => [ids[clave] ?? clave, mensaje as string]),
  )
}
