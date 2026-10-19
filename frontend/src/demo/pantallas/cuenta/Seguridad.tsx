import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  ConfirmationDialog,
  EmptyState,
  Form,
  Icon,
  OtpInput,
  PasswordInput,
  Stepper,
  toast,
} from '@aybarcorp/ui'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { NOMBRE_PROYECTO } from '../../../proyecto'
import { CODIGOS_RECUPERACION, crearAzar } from '../../datos'
import { avisoDemo, copiar, descargarTexto } from '../../utiles'
import { requisitosDe } from '../ingreso/comun'

/** Seguridad: cambiar la contraseña, el doble factor paso a paso y las llaves de acceso. */
export function Seguridad() {
  return (
    <div className="gl-cuenta__rejilla">
      <CambiarClave />
      <DobleFactor />
      <Card>
        <CardHeader as="h2" title="Llaves de acceso" subtitle="Entra con la huella, la cara o el PIN del equipo, sin contraseña." />
        <CardBody>
          <EmptyState
            size="compact"
            variant="first-use"
            title="Sin llaves de acceso todavía"
            description="Una llave vive en este equipo o en tu gestor de contraseñas y no se puede robar con un correo falso."
            action={
              <Button variant="secondary" size="sm" onClick={() => avisoDemo('Demo: aquí el navegador pediría crear la llave.')}>
                Añadir una llave de acceso
              </Button>
            }
          />
        </CardBody>
      </Card>
    </div>
  )
}

function CambiarClave() {
  const id = useId()
  const ids = { actual: `${id}-actual`, nueva: `${id}-nueva`, repetir: `${id}-repetir` }
  const [valores, setValores] = useState({ actual: '', nueva: '', repetir: '' })
  const [errores, setErrores] = useState<Partial<Record<keyof typeof ids, string>>>({})
  const [guardando, setGuardando] = useState(false)
  const { requisitos, cumple, fuerza } = requisitosDe(valores.nueva)
  const cambiar = (campo: keyof typeof ids, valor: string) => {
    setValores((v) => ({ ...v, [campo]: valor }))
    setErrores(({ [campo]: _fuera, ...resto }) => resto)
  }
  return (
    <Card>
      <CardHeader as="h2" title="Contraseña" subtitle="La cambiaste por última vez hace 47 días." />
      <CardBody>
        <Form
          summary={false}
          submitting={guardando}
          errors={Object.fromEntries(Object.entries(errores).map(([k, m]) => [ids[k as keyof typeof ids], m as string]))}
          onSubmit={async () => {
            const encontrados: typeof errores = {}
            if (!valores.actual) encontrados.actual = 'Escribe tu contraseña actual.'
            if (!valores.nueva) encontrados.nueva = 'Elige una contraseña nueva.'
            else if (!cumple) encontrados.nueva = 'La contraseña nueva no cumple todos los requisitos.'
            else if (valores.nueva === valores.actual) encontrados.nueva = 'La nueva tiene que ser distinta de la actual.'
            if (valores.repetir !== valores.nueva) encontrados.repetir = 'Las contraseñas no coinciden.'
            setErrores(encontrados)
            if (Object.keys(encontrados).length > 0) return
            setGuardando(true)
            await new Promise((r) => setTimeout(r, 600))
            setGuardando(false)
            setValores({ actual: '', nueva: '', repetir: '' })
            toast({ message: 'Contraseña cambiada en esta maqueta.', tone: 'success' })
          }}
        >
          <PasswordInput
            id={ids.actual}
            label="Contraseña actual"
            autoComplete="current-password"
            value={valores.actual}
            error={errores.actual}
            onValueChange={(v) => cambiar('actual', v)}
          />
          <PasswordInput
            id={ids.nueva}
            label="Contraseña nueva"
            autoComplete="new-password"
            value={valores.nueva}
            requirements={requisitos}
            strength={valores.nueva ? fuerza : undefined}
            error={errores.nueva}
            onValueChange={(v) => cambiar('nueva', v)}
          />
          <PasswordInput
            id={ids.repetir}
            label="Repite la contraseña nueva"
            autoComplete="new-password"
            value={valores.repetir}
            error={errores.repetir}
            onValueChange={(v) => cambiar('repetir', v)}
          />
          <div className="gl-acciones">
            <Button type="submit" variant="primary" loading={guardando}>
              Cambiar la contraseña
            </Button>
          </div>
        </Form>
      </CardBody>
    </Card>
  )
}

type EstadoDobleFactor = 'inactivo' | 'escanear' | 'codigos' | 'activo'

const PASOS = [
  { id: 'escanear', label: 'Escanear el código' },
  { id: 'verificar', label: 'Confirmar' },
  { id: 'codigos', label: 'Guardar los códigos' },
]

/**
 * El doble factor: escanear un QR de maqueta (no se puede escanear: es un dibujo con semilla),
 * confirmar con un código de seis cifras y guardar los códigos de recuperación —copiar o
 * descargar un .txt—. Desactivarlo pide confirmación.
 */
function DobleFactor() {
  const [estado, setEstado] = useState<EstadoDobleFactor>('inactivo')
  const [codigo, setCodigo] = useState('')
  const [error, setError] = useState<string>()
  const [verificando, setVerificando] = useState(false)
  const [desactivar, setDesactivar] = useState(false)
  const titulo = useRef<HTMLHeadingElement>(null)
  const montado = useRef(false)
  useEffect(() => {
    if (!montado.current) {
      montado.current = true
      return
    }
    titulo.current?.focus()
  }, [estado])

  const verificar = async (valor: string) => {
    if (valor.length < 6) {
      setError('Faltan cifras: el código tiene seis.')
      return
    }
    setVerificando(true)
    await new Promise((r) => setTimeout(r, 600))
    setVerificando(false)
    setEstado('codigos')
  }

  const textoCodigos = `Códigos de recuperación de ${NOMBRE_PROYECTO} (galería de demostración, no sirven para nada)\n\n${CODIGOS_RECUPERACION.join('\n')}\n`

  return (
    <Card>
      <CardHeader
        as="h2"
        title="Verificación en dos pasos"
        subtitle="Un código de tu app autenticadora además de la contraseña."
        actions={estado === 'activo' ? <Badge tone="success">Activada</Badge> : estado === 'inactivo' ? <Badge tone="warning">Desactivada</Badge> : undefined}
      />
      <CardBody>
        {estado === 'inactivo' ? (
          <div className="gl-pila">
            <Alert tone="warning" size="sm" live="off">
              Sin el segundo paso, quien adivine tu contraseña entra a tu cuenta.
            </Alert>
            <div className="gl-acciones">
              <Button variant="primary" onClick={() => setEstado('escanear')}>
                Activar la verificación en dos pasos
              </Button>
            </div>
          </div>
        ) : null}

        {estado === 'escanear' ? (
          <div className="gl-pila">
            <Stepper label="Pasos para activar el doble factor" steps={PASOS} current={codigo.length === 6 ? 1 : 0} />
            <h3 ref={titulo} tabIndex={-1} className="gl-subtitulo">
              Escanea el código con tu app autenticadora
            </h3>
            <div className="gl-qr">
              <QrMaqueta />
              <div className="gl-pila">
                <p className="gl-texto-chico">
                  ¿No puedes escanearlo? Escribe esta clave en la app: <code className="gl-codigo-en-linea">DEMO 7K2Q M4XA 9TBV</code>
                </p>
                <OtpInput
                  label="Código de seis cifras que muestra la app"
                  length={6}
                  type="numeric"
                  value={codigo}
                  error={error}
                  disabled={verificando}
                  onValueChange={(v) => {
                    setCodigo(v)
                    setError(undefined)
                  }}
                  onComplete={(v) => void verificar(v)}
                />
                <div className="gl-acciones gl-acciones--inicio">
                  <Button variant="primary" loading={verificando} onClick={() => void verificar(codigo)}>
                    Confirmar
                  </Button>
                  <Button variant="ghost" onClick={() => setEstado('inactivo')}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {estado === 'codigos' ? (
          <div className="gl-pila">
            <Stepper label="Pasos para activar el doble factor" steps={PASOS} current={2} />
            <h3 ref={titulo} tabIndex={-1} className="gl-subtitulo">
              Guarda tus códigos de recuperación
            </h3>
            <p className="gl-texto-chico">Cada código sirve una vez, si pierdes el celular. Guárdalos fuera de este equipo.</p>
            <ol className="gl-codigos" aria-label="Códigos de recuperación">
              {CODIGOS_RECUPERACION.map((c) => (
                <li key={c}>
                  <code>{c}</code>
                </li>
              ))}
            </ol>
            <div className="gl-acciones gl-acciones--inicio">
              <Button variant="secondary" leadingIcon={<Icon name="copy" size={16} />} onClick={() => void copiar(CODIGOS_RECUPERACION.join('\n'), 'Códigos')}>
                Copiar
              </Button>
              <Button variant="secondary" leadingIcon={<Icon name="download" size={16} />} onClick={() => descargarTexto('codigos-de-recuperacion-demo.txt', textoCodigos)}>
                Descargar .txt
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setEstado('activo')
                  setCodigo('')
                  toast({ message: 'Verificación en dos pasos activada en esta maqueta.', tone: 'success' })
                }}
              >
                Ya los guardé
              </Button>
            </div>
          </div>
        ) : null}

        {estado === 'activo' ? (
          <div className="gl-pila">
            <h3 ref={titulo} tabIndex={-1} className="gl-subtitulo">
              Tu cuenta pide un código al entrar
            </h3>
            <p className="gl-texto-chico">App autenticadora configurada hoy. Te quedan {CODIGOS_RECUPERACION.length} códigos de recuperación.</p>
            <div className="gl-acciones gl-acciones--inicio">
              <Button variant="danger" onClick={() => setDesactivar(true)}>
                Desactivar
              </Button>
            </div>
          </div>
        ) : null}
        <ConfirmationDialog
          open={desactivar}
          onOpenChange={setDesactivar}
          tone="danger"
          title="¿Desactivar la verificación en dos pasos?"
          description="Tu cuenta quedará protegida solo por la contraseña. Los códigos de recuperación dejarán de servir."
          confirmLabel="Desactivar la verificación"
          onConfirm={() => {
            setDesactivar(false)
            setEstado('inactivo')
            toast({ message: 'Verificación en dos pasos desactivada en esta maqueta.', tone: 'info' })
          }}
        />
      </CardBody>
    </Card>
  )
}

/**
 * Un QR de maqueta: 25 × 25 módulos con los tres patrones de posición y el resto al azar
 * con semilla fija. Tiene forma de QR y no codifica nada.
 */
function QrMaqueta() {
  const modulos = useMemo(() => {
    const azar = crearAzar(4242)
    const n = 25
    const celdas: [number, number][] = []
    const enPatron = (x: number, y: number) => (x < 8 && y < 8) || (x >= n - 8 && y < 8) || (x < 8 && y >= n - 8)
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!enPatron(x, y) && azar() < 0.48) celdas.push([x, y])
    return celdas
  }, [])
  const patron = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width={7} height={7} className="gl-qr__oscuro" />
      <rect x={x + 1} y={y + 1} width={5} height={5} className="gl-qr__claro" />
      <rect x={x + 2} y={y + 2} width={3} height={3} className="gl-qr__oscuro" />
    </g>
  )
  return (
    <svg className="gl-qr__codigo" viewBox="-2 -2 29 29" role="img" aria-label="Código QR de maqueta: no se puede escanear">
      <rect x={-2} y={-2} width={29} height={29} className="gl-qr__claro" />
      {modulos.map(([x, y]) => (
        <rect key={`${x}:${y}`} x={x} y={y} width={1.02} height={1.02} className="gl-qr__oscuro" />
      ))}
      {patron(0, 0)}
      {patron(18, 0)}
      {patron(0, 18)}
    </svg>
  )
}
