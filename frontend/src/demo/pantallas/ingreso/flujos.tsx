import {
  Alert,
  Button,
  Checkbox,
  Form,
  FormField,
  Input,
  LoginForm,
  OtpInput,
  PasswordInput,
  SegmentedControl,
  Stepper,
} from '@aybarcorp/ui'
import { useEffect, useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { BASE } from '../../rutas'
import { avisoDemo, useCuentaAtras } from '../../utiles'
import { limpio } from './clasicas'
import { MarcaIngreso, NotaDemo, errorDeCorreo, minutosYSegundos, raizDe, requisitosDe, useEnvioDemo, useTituloVariante } from './comun'
import type { PropsVariante } from './comun'

/**
 * Los flujos de acceso con más de un paso: doble factor, registro, recuperar la contraseña y
 * el bloqueo de la cuenta. El foco acompaña a cada paso: va al título del paso nuevo.
 */

function Tarjeta({ miniatura, clase, ancha = false, children }: { miniatura?: boolean; clase: string; ancha?: boolean; children: ReactNode }) {
  const Raiz = raizDe(miniatura)
  return (
    <Raiz className={`gl-in gl-in-centrada ${clase}`}>
      <div className={ancha ? 'gl-in-tarjeta gl-in-tarjeta--ancha' : 'gl-in-tarjeta'}>{children}</div>
    </Raiz>
  )
}

/** El foco al título del paso cada vez que el paso cambia (no al montar). */
function useFocoAlCambiar<T>(paso: T) {
  const titulo = useRef<HTMLHeadingElement>(null)
  const montado = useRef(false)
  useEffect(() => {
    if (!montado.current) {
      montado.current = true
      return
    }
    titulo.current?.focus()
  }, [paso])
  return titulo
}

const RECUPERACION = /^[A-Z0-9]{4}(-[A-Z0-9]{4}){2}$/i

/**
 * Dos pasos: la contraseña con el Login Form y, después, el código de la app autenticadora
 * o, si no se tiene el celular a mano, uno de los códigos de recuperación.
 */
export function DosPasos({ miniatura }: PropsVariante) {
  useTituloVariante('Dos pasos', miniatura)
  const [paso, setPaso] = useState<'credenciales' | 'app' | 'recuperacion'>('credenciales')
  const [codigo, setCodigo] = useState('')
  const [recuperacion, setRecuperacion] = useState('')
  const [error, setError] = useState<string>()
  const [enviando, enviar] = useEnvioDemo()
  const titulo = useFocoAlCambiar(paso)
  const id = `${useId()}-recuperacion`

  if (paso === 'credenciales') {
    return (
      <Tarjeta miniatura={miniatura} clase="gl-in-dos-pasos">
        <LoginForm
          title="Entra a tu cuenta"
          identifierLabel="Correo"
          identifierType="email"
          recoverHref={`${BASE}/ingreso/recuperar`}
          submitting={enviando}
          onSubmit={() => enviar(() => setPaso('app'))}
        />
        <NotaDemo>Maqueta: cualquier correo y contraseña pasan al segundo paso.</NotaDemo>
      </Tarjeta>
    )
  }

  const verificar = () => {
    if (paso === 'app' && codigo.length < 6) {
      setError('Faltan cifras: el código de la app tiene seis.')
      return
    }
    if (paso === 'recuperacion' && !RECUPERACION.test(recuperacion.trim())) {
      setError('Un código de recuperación tiene tres grupos de cuatro: DEMO-XXXX-XXXX.')
      requestAnimationFrame(() => document.getElementById(id)?.focus())
      return
    }
    void enviar()
  }

  return (
    <Tarjeta miniatura={miniatura} clase="gl-in-dos-pasos">
      <div className="gl-in-cabeza">
        <MarcaIngreso />
        <h1 ref={titulo} tabIndex={-1} className="gl-in-titulo">
          Verificación en dos pasos
        </h1>
        <p className="gl-texto-chico">
          {paso === 'app'
            ? 'Abre tu app autenticadora y escribe el código de seis cifras que muestra para esta cuenta. Cambia cada 30 segundos.'
            : 'Escribe uno de los códigos que guardaste al activar el doble factor. Cada código sirve una sola vez.'}
        </p>
      </div>
      <Form summary={false} onSubmit={verificar} submitting={enviando} errors={paso === 'recuperacion' ? limpio({ c: error }, { c: id }) : undefined}>
        {paso === 'app' ? (
          <OtpInput
            label="Código de la app autenticadora"
            length={6}
            type="numeric"
            value={codigo}
            error={error}
            disabled={enviando}
            onValueChange={(v) => {
              setCodigo(v)
              setError(undefined)
            }}
            onComplete={() => void enviar()}
          />
        ) : (
          <FormField label="Código de recuperación" id={id} error={error} helper="Con o sin guiones, en mayúsculas o minúsculas.">
            <Input
              value={recuperacion}
              autoComplete="one-time-code"
              placeholder="DEMO-XXXX-XXXX"
              onChange={(e) => {
                setRecuperacion(e.target.value)
                setError(undefined)
              }}
            />
          </FormField>
        )}
        <Checkbox label="Confiar en este equipo durante 30 días" />
        <Button type="submit" variant="primary" fullWidth loading={enviando}>
          Verificar
        </Button>
      </Form>
      <div className="gl-in-fila">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setError(undefined)
            setPaso(paso === 'app' ? 'recuperacion' : 'app')
          }}
        >
          {paso === 'app' ? 'Usar un código de recuperación' : 'Usar la app autenticadora'}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setPaso('credenciales')}>
          Volver
        </Button>
      </div>
    </Tarjeta>
  )
}

/** Registro: el alta con requisitos y fuerza de la contraseña, términos y resumen de errores. */
export function Registro({ miniatura }: PropsVariante) {
  useTituloVariante('Registro', miniatura)
  const id = useId()
  const ids = { nombre: `${id}-nombre`, correo: `${id}-correo`, clave: `${id}-clave`, confirmar: `${id}-confirmar`, terminos: `${id}-terminos` }
  const [valores, setValores] = useState({ nombre: '', correo: '', clave: '', confirmar: '', terminos: false })
  const [errores, setErrores] = useState<Partial<Record<keyof typeof ids, string>>>({})
  const [hecho, setHecho] = useState(false)
  const [enviando, enviar] = useEnvioDemo()
  const titulo = useFocoAlCambiar(hecho)
  const { requisitos, cumple, fuerza } = requisitosDe(valores.clave)

  const cambiar = <K extends keyof typeof valores>(campo: K, valor: (typeof valores)[K]) => {
    setValores((v) => ({ ...v, [campo]: valor }))
    if (errores[campo]) setErrores(({ [campo]: _quitado, ...resto }) => resto)
  }

  if (hecho) {
    return (
      <Tarjeta miniatura={miniatura} clase="gl-in-registro">
        <div className="gl-in-cabeza gl-in-cabeza--centro">
          <MarcaIngreso />
          <h1 ref={titulo} tabIndex={-1} className="gl-in-titulo">
            Ya casi está
          </h1>
          <p className="gl-texto-chico">
            Enviamos un enlace a <strong>{valores.correo.trim()}</strong> para activar la cuenta de {valores.nombre.trim()}.
          </p>
        </div>
        <Alert tone="success" live="off" title="Cuenta creada (en la maqueta)">
          Con un backend de verdad, la cuenta quedaría pendiente de activar hasta abrir el enlace.
        </Alert>
        <Button variant="secondary" fullWidth onClick={() => setHecho(false)}>
          Volver al formulario
        </Button>
      </Tarjeta>
    )
  }

  return (
    <Tarjeta miniatura={miniatura} clase="gl-in-registro" ancha>
      <div className="gl-in-cabeza">
        <MarcaIngreso />
        <h1 ref={titulo} tabIndex={-1} className="gl-in-titulo">
          Crea tu cuenta
        </h1>
        <p className="gl-texto-chico">
          Todos los campos son obligatorios. ¿Ya tienes cuenta? <a href={`${BASE}/ingreso/partido`}>Entra</a>.
        </p>
      </div>
      <Form
        summary
        submitting={enviando}
        errors={limpio(errores, ids)}
        onSubmit={() => {
          const encontrados: typeof errores = {
            nombre: valores.nombre.trim() ? undefined : 'Escribe tu nombre y apellido.',
            correo: errorDeCorreo(valores.correo),
            clave: !valores.clave ? 'Elige una contraseña.' : cumple ? undefined : 'La contraseña no cumple todos los requisitos.',
            confirmar: !valores.confirmar ? 'Repite la contraseña.' : valores.confirmar !== valores.clave ? 'Las contraseñas no coinciden.' : undefined,
            terminos: valores.terminos ? undefined : 'Acepta los términos para crear la cuenta.',
          }
          const conError = Object.fromEntries(Object.entries(encontrados).filter(([, m]) => m)) as typeof errores
          setErrores(conError)
          if (Object.keys(conError).length === 0) void enviar(() => setHecho(true))
        }}
      >
        <div className="gl-in-columnas">
          <FormField label="Nombre y apellido" id={ids.nombre} error={errores.nombre}>
            <Input autoComplete="name" value={valores.nombre} onChange={(e) => cambiar('nombre', e.target.value)} />
          </FormField>
          <FormField label="Correo" id={ids.correo} error={errores.correo}>
            <Input type="email" autoComplete="email" value={valores.correo} onChange={(e) => cambiar('correo', e.target.value)} />
          </FormField>
        </div>
        <PasswordInput
          id={ids.clave}
          label="Contraseña nueva"
          autoComplete="new-password"
          value={valores.clave}
          requirements={requisitos}
          strength={valores.clave ? fuerza : undefined}
          error={errores.clave}
          onValueChange={(v) => cambiar('clave', v)}
        />
        <PasswordInput
          id={ids.confirmar}
          label="Repite la contraseña"
          autoComplete="new-password"
          value={valores.confirmar}
          error={errores.confirmar}
          onValueChange={(v) => cambiar('confirmar', v)}
        />
        <Checkbox
          id={ids.terminos}
          checked={valores.terminos}
          invalid={Boolean(errores.terminos)}
          helper={errores.terminos}
          onChange={(e) => cambiar('terminos', e.target.checked)}
          label="Acepto los términos de uso y la política de privacidad"
        />
        <Button type="submit" variant="primary" fullWidth loading={enviando}>
          Crear la cuenta
        </Button>
      </Form>
    </Tarjeta>
  )
}

const PASOS_RECUPERAR = [
  { id: 'pedir', label: 'Pedir el enlace' },
  { id: 'correo', label: 'Abrir el correo' },
  { id: 'nueva', label: 'Contraseña nueva' },
]

/** Recuperar: pedir el enlace, confirmarlo y elegir una contraseña nueva, por pasos. */
export function Recuperar({ miniatura }: PropsVariante) {
  useTituloVariante('Recuperar', miniatura)
  const [paso, setPaso] = useState(0)
  const [hecho, setHecho] = useState(false)
  const [correo, setCorreo] = useState('')
  const [clave, setClave] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [errores, setErrores] = useState<{ correo?: string; clave?: string; confirmar?: string }>({})
  const [restantes, reiniciar] = useCuentaAtras(45)
  const [enviando, enviar] = useEnvioDemo()
  const titulo = useFocoAlCambiar(`${paso}${hecho}`)
  const id = useId()
  const ids = { correo: `${id}-correo`, clave: `${id}-clave`, confirmar: `${id}-confirmar` }
  const { requisitos, cumple, fuerza } = requisitosDe(clave)
  const titulos = ['Recupera el acceso', 'Revisa tu correo', 'Elige una contraseña nueva']

  return (
    <Tarjeta miniatura={miniatura} clase="gl-in-recuperar" ancha>
      <div className="gl-in-cabeza">
        <MarcaIngreso />
        <Stepper
          label="Pasos para recuperar el acceso"
          steps={PASOS_RECUPERAR}
          current={hecho ? PASOS_RECUPERAR.length : paso}
          onStepClick={(i) => {
            // Solo hacia atrás: los pasos siguientes aún no tienen lo que necesitan.
            if (i < paso && !hecho) setPaso(i)
          }}
        />
        <h1 ref={titulo} tabIndex={-1} className="gl-in-titulo">
          {hecho ? 'Contraseña actualizada' : titulos[paso]}
        </h1>
      </div>

      {hecho ? (
        <>
          <Alert tone="success" live="off">
            En la aplicación real, las demás sesiones abiertas se cerrarían por seguridad.
          </Alert>
          <a className="pl-accion pl-accion--primaria" href={`${BASE}/ingreso/partido`}>
            Entrar con la contraseña nueva
          </a>
        </>
      ) : paso === 0 ? (
        <Form
          summary={false}
          submitting={enviando}
          errors={limpio({ correo: errores.correo }, { correo: ids.correo })}
          onSubmit={() => {
            const error = errorDeCorreo(correo)
            setErrores({ correo: error })
            if (error) {
              requestAnimationFrame(() => document.getElementById(ids.correo)?.focus())
              return
            }
            void enviar(() => {
              reiniciar()
              setPaso(1)
            })
          }}
        >
          <p className="gl-texto-chico">Te enviamos un enlace para elegir una contraseña nueva. Si el correo no tiene cuenta, no llegará nada.</p>
          <FormField label="Correo de la cuenta" id={ids.correo} error={errores.correo}>
            <Input type="email" autoComplete="email" value={correo} onChange={(e) => setCorreo(e.target.value)} />
          </FormField>
          <Button type="submit" variant="primary" fullWidth loading={enviando}>
            Enviarme el enlace
          </Button>
        </Form>
      ) : paso === 1 ? (
        <div className="gl-in-pila">
          <p className="gl-texto-chico">
            Si <strong>{correo.trim()}</strong> tiene cuenta, ya tiene un enlace. Ábrelo en este equipo: caduca en una hora.
          </p>
          <Button variant="primary" fullWidth onClick={() => setPaso(2)}>
            Ya abrí el enlace
          </Button>
          <Button
            variant="secondary"
            fullWidth
            disabled={restantes > 0}
            onClick={() => {
              reiniciar()
              avisoDemo('Demo: el enlace se reenviaría al correo.')
            }}
          >
            {restantes > 0 ? `Reenviar en ${restantes} s` : 'Reenviar el enlace'}
          </Button>
        </div>
      ) : (
        <Form
          summary={false}
          submitting={enviando}
          errors={limpio(errores, ids)}
          onSubmit={() => {
            const encontrados = {
              clave: !clave ? 'Elige una contraseña.' : cumple ? undefined : 'La contraseña no cumple todos los requisitos.',
              confirmar: confirmar !== clave ? 'Las contraseñas no coinciden.' : undefined,
            }
            setErrores(encontrados)
            const primero = encontrados.clave ? ids.clave : encontrados.confirmar ? ids.confirmar : null
            if (primero) {
              requestAnimationFrame(() => document.getElementById(primero)?.focus())
              return
            }
            void enviar(() => setHecho(true))
          }}
        >
          <PasswordInput
            id={ids.clave}
            label="Contraseña nueva"
            autoComplete="new-password"
            value={clave}
            requirements={requisitos}
            strength={clave ? fuerza : undefined}
            error={errores.clave}
            onValueChange={setClave}
          />
          <PasswordInput
            id={ids.confirmar}
            label="Repite la contraseña"
            autoComplete="new-password"
            value={confirmar}
            error={errores.confirmar}
            onValueChange={setConfirmar}
          />
          <Button type="submit" variant="primary" fullWidth loading={enviando}>
            Guardar la contraseña
          </Button>
        </Form>
      )}
    </Tarjeta>
  )
}

const BLOQUEO_SEGUNDOS = 120

/**
 * Bloqueo: dos estados conmutables. Cuenta bloqueada, con el motivo y la vía de desbloqueo
 * del Login Form y una cuenta atrás aparte (dentro del formulario, cada segundo movería el
 * foco al resumen); y sesión expirada, con «volver a entrar».
 */
export function Bloqueo({ miniatura }: PropsVariante) {
  useTituloVariante('Bloqueo', miniatura)
  const [estado, setEstado] = useState<'bloqueada' | 'expirada'>('bloqueada')
  const [restantes, reiniciar] = useCuentaAtras(BLOQUEO_SEGUNDOS)
  const [enviando, enviar] = useEnvioDemo()
  const Raiz = raizDe(miniatura)

  useEffect(() => {
    if (!miniatura) reiniciar()
  }, [miniatura, reiniciar])

  const libre = estado === 'bloqueada' && restantes === 0 && !miniatura
  return (
    <Raiz className="gl-in gl-in-centrada gl-in-bloqueo">
      <div className="gl-in-tarjeta gl-in-tarjeta--sin-marco">
        <div className="gl-in-conmutador">
          <SegmentedControl
            label="Estado de la maqueta"
            size="sm"
            fullWidth
            value={estado}
            onValueChange={(v) => setEstado(v === 'expirada' ? 'expirada' : 'bloqueada')}
            options={[
              { value: 'bloqueada', label: 'Cuenta bloqueada' },
              { value: 'expirada', label: 'Sesión expirada' },
            ]}
          />
        </div>
        {estado === 'bloqueada' ? (
          <>
            <div className="gl-in-espera" role="group" aria-label="Tiempo de espera">
              <span className="gl-in-espera__reloj" aria-hidden="true">
                {minutosYSegundos(miniatura ? BLOQUEO_SEGUNDOS : restantes)}
              </span>
              <span className="gl-texto-chico">{libre ? 'Ya puedes intentarlo de nuevo.' : 'para poder intentarlo de nuevo'}</span>
              <span className="ay-visually-hidden" aria-live="polite">
                {libre ? 'Terminó la espera: ya puedes intentarlo de nuevo.' : ''}
              </span>
              <Button variant="ghost" size="sm" onClick={reiniciar}>
                Reiniciar la espera
              </Button>
            </div>
            <LoginForm
              key={libre ? 'libre' : 'bloqueada'}
              title="Entra a tu cuenta"
              identifierLabel="Correo"
              identifierType="email"
              recoverHref={`${BASE}/ingreso/recuperar`}
              submitting={enviando}
              accountLocked={
                libre
                  ? undefined
                  : {
                      reason: 'Bloqueamos la cuenta tras cinco intentos fallidos.',
                      how: 'Espera a que termine la cuenta atrás o desbloquéala ahora con el enlace que enviamos a tu correo.',
                    }
              }
              onSubmit={() => enviar(() => avisoDemo(libre ? undefined : 'Demo: la cuenta sigue bloqueada hasta que termine la espera.'))}
            />
          </>
        ) : (
          <LoginForm
            title="Vuelve a entrar"
            identifierLabel="Correo"
            identifierType="email"
            sessionExpired
            submitting={enviando}
            onSubmit={() => enviar(() => avisoDemo('Demo: aquí volverías a la pantalla donde estabas.'))}
          />
        )}
      </div>
    </Raiz>
  )
}
