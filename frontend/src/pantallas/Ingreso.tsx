import { Button, LoginForm } from '@aybarcorp/ui'
import { useId, useState } from 'react'
import type { ReactNode } from 'react'
import { enlaceInterno } from '../navegacion'
import { NOMBRE_PROYECTO } from '../proyecto'
import { rolesDeUsuarioDemo } from '../sesion'
import type { UsuarioDemo } from '../sesion'
import { Marca } from './Marca'
import { codigoDe, mensajeDe, useTitulo } from './utiles'

/**
 * /ingresar con el modo demo, en pantalla partida: a la izquierda el panel de marca y a la
 * derecha el Login Form aprobado (`size="lg"`, el de pantalla partida). El acceso es la
 * página entera, así que el Login Form es su `<main>` (`as="main"`) y nada lo envuelve en
 * otro. Al abrir la sesión no navega: la App ve la sesión nueva y vuelve al destino.
 *
 * Se entra con un usuario, no con un correo: `identifierType="text"`. Los campos vacíos los
 * dice el Login Form en cada campo y lleva el foco al primero; a `ingresar` solo llega un
 * envío completo. El error de credenciales es uno solo para usuario inexistente y contraseña
 * errónea, como pide la ficha: decir cuál de los dos falló revela qué cuentas existen. No hay
 * «No recuerdo la contraseña» hasta que exista la pantalla de recuperar.
 *
 * El aviso de sesión demo lista los usuarios de prueba de .env.development, con su clave:
 * solo existen en desarrollo y en localhost, y sin ellos nadie sabría con qué entrar.
 */
export function Ingreso({
  ingresar,
  usuarios = [],
}: {
  ingresar: (usuario: string, clave: string) => Promise<unknown>
  /** Los usuarios de prueba del modo demo, para mostrarlos. */
  usuarios?: readonly UsuarioDemo[]
}) {
  useTitulo('Ingresar')
  const [error, setError] = useState<string>()
  const [enviando, setEnviando] = useState(false)

  const enviar = async ({ identifier, password }: { identifier: string; password: string }) => {
    setEnviando(true)
    // Se limpia antes de reintentar: el Login Form lleva el foco al resumen cuando cambia
    // el mensaje, y el mismo error dos veces seguidas no cambiaría nada.
    setError(undefined)
    try {
      await ingresar(identifier, password)
    } catch (causa) {
      setError(
        codigoDe(causa) === 'credenciales-invalidas' ? 'Usuario o contraseña incorrectos.' : mensajeDe(causa),
      )
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="pl-ingreso">
      <header className="pl-ingreso__panel">
        <a className="pl-ingreso__inicio" {...enlaceInterno('/')}>
          <Marca nombre={NOMBRE_PROYECTO} />
        </a>
        <div className="pl-ingreso__mensaje">
          <p className="pl-ingreso__lema">Cada lote, cada cuota y cada cliente en un solo lugar.</p>
          <p className="pl-ingreso__texto">
            Entra con tu cuenta corporativa. En local, la sesión demo te deja recorrer la aplicación sin emisor ni
            token.
          </p>
        </div>
        <ul className="pl-ingreso__sellos">
          <li>Contraste AA en claro y oscuro</li>
          <li>Login demo en local, OIDC en producción</li>
        </ul>
      </header>
      <div className="pl-ingreso__lado">
        <aside className="pl-ingreso__aviso" aria-label="Sesión demo">
          <IconoInfo />
          <div className="pl-ingreso__aviso-texto">
            <p>Sesión demo: solo en tu máquina, sin token.{usuarios.length > 0 ? ' Entra con:' : ''}</p>
            {usuarios.length > 0 ? (
              <ul className="pl-ingreso__usuarios">
                {usuarios.map((usuario) => (
                  <li key={usuario.usuario}>
                    <code>{usuario.usuario}</code> · clave <code>{usuario.clave}</code> · {rolesDeUsuarioDemo(usuario)}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </aside>
        <LoginForm
          as="main"
          size="lg"
          identifierLabel="Usuario"
          identifierType="text"
          onSubmit={enviar}
          error={error}
          submitting={enviando}
          providers={<Proveedores />}
        />
      </div>
    </div>
  )
}

const PROVEEDORES: ReadonlyArray<{ nombre: string; marca: ReactNode }> = [
  { nombre: 'Google', marca: 'G' },
  { nombre: 'Microsoft', marca: 'M' },
  { nombre: 'Apple', marca: 'A' },
  { nombre: 'Celular', marca: <IconoCelular /> },
]

/**
 * Los accesos de la siguiente fase: se ven, pero deshabilitados y rotulados «Próximamente»
 * —en el `title` y en la nota que los describe— hasta que se conecten.
 */
function Proveedores() {
  const nota = useId()
  return (
    <div className="ay-login__providers">
      <div className="pl-proveedores" role="group" aria-label="Otros accesos">
        {PROVEEDORES.map(({ nombre, marca }) => (
          <Button
            key={nombre}
            variant="secondary"
            disabled
            title="Próximamente"
            aria-describedby={nota}
            leadingIcon={<span className="pl-proveedores__marca">{marca}</span>}
          >
            {nombre}
          </Button>
        ))}
      </div>
      <p className="pl-proveedores__nota" id={nota}>
        Próximamente: la siguiente fase conecta estos accesos.
      </p>
    </div>
  )
}

function IconoInfo() {
  return (
    <svg className="pl-ingreso__aviso-icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16v.5" />
    </svg>
  )
}

function IconoCelular() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" focusable="false">
      <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
      <path d="M11 18h2" />
    </svg>
  )
}
