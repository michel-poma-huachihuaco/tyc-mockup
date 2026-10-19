import { Alert } from '@aybarcorp/ui'
import { Fragment, useEffect, useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { enlaceInterno } from '../navegacion'
import { CON_BACKEND, NOMBRE_PROYECTO, PAPEL, PUERTO_DESARROLLO } from '../proyecto'
import { piezasDeComando } from '../terminal'
import { BotonTema } from './BotonTema'
import { Marca } from './Marca'
import { codigoDe, mensajeDe, useTitulo } from './utiles'

/**
 * Bienvenida pública: lo que ve quien llega sin sesión. «Ingresar» lleva al ingreso, que con
 * el modo demo es el Login Form y con el emisor real redirige al emisor.
 *
 * Todo lo que muestra es del proyecto: su nombre, los comandos con que se generó y se
 * arranca, si la sesión es la demo y la URL de la API que llamará.
 */
export function Bienvenida({
  ingreso,
  demo,
  urlBackend,
  error,
}: {
  /** La ruta del ingreso (la del modo demo, o /ingresar que sale al emisor). */
  ingreso: string
  /** Si la sesión es la simulada del modo demo, sin emisor ni token. */
  demo: boolean
  /** URL de la API, o `null` si la configuración sigue con la de plantilla. */
  urlBackend: string | null
  /** El error de `iniciar()` (emisor caído, modo demo fuera de localhost), si lo hubo. */
  error?: unknown
}) {
  useTitulo()
  const codigo = error ? codigoDe(error) : null
  return (
    <div className="pl-bienvenida">
      <div className="pl-bienvenida__fondo" aria-hidden="true" />
      <header className="pl-barra">
        <Marca nombre={NOMBRE_PROYECTO} />
        <div className="pl-barra__acciones">
          <BotonTema />
          <a className="pl-accion pl-accion--inversa" {...enlaceInterno(ingreso)}>
            Ingresar
          </a>
        </div>
      </header>

      <main id="contenido" className="pl-bienvenida__principal">
        <section className="pl-heroe" aria-labelledby="bienvenida-titulo">
          <p className="pl-heroe__aviso">
            <span className="pl-insignia">Nuevo</span>
            Sistema de diseño Aybar con tema claro y oscuro
          </p>
          <h1 id="bienvenida-titulo" className="pl-heroe__titulo">
            Tu frontend de Aybar, <span className="pl-heroe__resalte">listo para trabajar</span>
          </h1>
          <p className="pl-heroe__texto">
            {NOMBRE_PROYECTO} se generó con el Aybar SDK sobre <code className="pl-codigo-chip">@aybarcorp/*</code>.
            Ingresa para ver tu sesión y la conexión con el backend.
            {/* aybar:demo:inicio */}
            {import.meta.env.DEV ? ' En desarrollo, «Ver la vitrina» abre la galería con cada componente del sistema de diseño.' : null}
            {/* aybar:demo:fin */}
          </p>
          {error ? (
            <div className="pl-heroe__error">
              <Alert tone="danger" title="No se pudo iniciar la sesión" live="off">
                {mensajeDe(error)}
                {codigo ? ` (${codigo})` : ''}
              </Alert>
            </div>
          ) : null}
          <div className="pl-heroe__acciones">
            <a className="pl-accion pl-accion--primaria pl-accion--lg" {...enlaceInterno(ingreso)}>
              Ingresar
              <IconoFlecha />
            </a>
            {/* aybar:demo:inicio */}
            {import.meta.env.DEV ? (
              // La galería pide sesión: sin ella pasa por el ingreso y vuelve a la vitrina.
              <a className="pl-accion pl-accion--secundaria pl-accion--lg" {...enlaceInterno('/demo/vitrina')}>
                Ver la vitrina
              </a>
            ) : null}
            {/* aybar:demo:fin */}
          </div>
          <Terminal />
        </section>

        <section className="pl-intro" aria-label="Qué trae">
          <Tarjeta icono={<IconoCandado />} tono="marca" titulo="Sesión y roles">
            En local entras con el login demo; con el emisor OIDC real, el mismo código. La sesión trae el usuario y
            sus roles.
          </Tarjeta>
          <Tarjeta icono={<IconoAjustes />} tono="acento" titulo={urlBackend ? 'Backend conectado' : 'Listo para tu backend'}>
            El cliente HTTP pone el token y el <code>X-Correlation-Id</code>, y convierte los errores RFC 7807 en mensajes
            claros.
          </Tarjeta>
          <Tarjeta icono={<IconoRejilla />} tono="neutro" titulo="Sistema de diseño">
            Los componentes de <code>@aybarcorp/ui</code> con su catálogo de casos, en tema claro y oscuro y con contraste
            AA verificado.
          </Tarjeta>
        </section>

        <section className="pl-entorno" aria-label="Entorno">
          <ul className="pl-entorno__lista">
            <li className="pl-entorno__dato">
              <span className={`pl-punto ${import.meta.env.DEV ? 'pl-punto--ok' : 'pl-punto--neutro'}`} aria-hidden="true" />
              {import.meta.env.DEV ? 'Entorno local (npm run dev)' : 'Build de producción'}
            </li>
            <li className="pl-entorno__dato">
              <span className={`pl-punto ${demo ? 'pl-punto--acento' : 'pl-punto--marca'}`} aria-hidden="true" />
              {demo ? 'Sesión demo, sin emisor' : 'Emisor OIDC'}
            </li>
            <li className={urlBackend ? 'pl-entorno__dato pl-entorno__dato--codigo' : 'pl-entorno__dato'}>
              <span className="pl-punto pl-punto--neutro" aria-hidden="true" />
              {urlBackend ? `API ${urlBackend}` : 'Sin backend configurado'}
            </li>
          </ul>
        </section>
      </main>
    </div>
  )
}

/**
 * Los comandos reales del proyecto: con qué se generó, cómo se arranca y cómo se empaqueta,
 * cada uno con su «Copiar». La línea solo se corta entre piezas del comando (src/terminal.ts),
 * con sangría francesa, y «Copiado» se anuncia en una región viva.
 */
function Terminal() {
  const frontend = CON_BACKEND ? ' --frontend' : ''
  const generar = `aybar new project ${NOMBRE_PROYECTO}${CON_BACKEND ? ' --backend' : ''} --frontend --ui react --papel ${PAPEL}`
  // En desarrollo, el origen de esta misma página: la demo a veces corre en otro puerto.
  const local = import.meta.env.DEV ? `${location.origin}/` : `http://localhost:${PUERTO_DESARROLLO}/`
  const [copiado, setCopiado] = useState<string | null>(null)
  const [anuncio, setAnuncio] = useState('')
  const temporizador = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(temporizador.current), [])

  const copiar = async (comando: string) => {
    window.clearTimeout(temporizador.current)
    try {
      await navigator.clipboard.writeText(comando)
      setCopiado(comando)
      setAnuncio('Copiado')
    } catch {
      // Sin permiso o fuera de un contexto seguro (http que no es localhost).
      setCopiado(null)
      setAnuncio('No se pudo copiar: selecciona el comando y cópialo a mano.')
    }
    temporizador.current = window.setTimeout(() => {
      setCopiado(null)
      setAnuncio('')
    }, 2000)
  }

  const comando = (texto: string, nota?: string) => (
    <Comando texto={texto} nota={nota} copiado={copiado === texto} alCopiar={copiar} />
  )
  return (
    <figure className="pl-terminal">
      <figcaption className="pl-terminal__barra">
        <span className="pl-terminal__luces" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        terminal
      </figcaption>
      <pre className="pl-terminal__codigo">
        {comando(generar)}
        {comando(`aybar run${frontend}`)}
        <samp className="pl-terminal__salida">{`  ➜  Local:   ${local}`}</samp>
        {comando(`aybar build${frontend}`, PAPEL === 'remoto' ? 'npm run build:remoto' : 'npm run build')}
      </pre>
      <p className="ay-visually-hidden" aria-live="polite">
        {anuncio}
      </p>
    </figure>
  )
}

function Comando({
  texto,
  nota,
  copiado,
  alCopiar,
}: {
  texto: string
  nota?: string
  copiado: boolean
  alCopiar: (texto: string) => Promise<void>
}) {
  const id = useId()
  return (
    <span className="pl-terminal__linea">
      <span className="pl-terminal__texto">
        <code id={id}>
          <span className="pl-terminal__prompt" aria-hidden="true">
            ${' '}
          </span>
          {piezasDeComando(texto).map((pieza, i) => (
            <Fragment key={i}>
              {i > 0 ? ' ' : null}
              <span className="pl-terminal__pieza">{pieza}</span>
            </Fragment>
          ))}
        </code>
        {nota ? (
          <>
            {'   '}
            <span className="pl-terminal__nota">{`# ${nota}`}</span>
          </>
        ) : null}
      </span>
      <button type="button" className="pl-terminal__copiar" aria-describedby={id} onClick={() => void alCopiar(texto)}>
        {copiado ? 'Copiado' : 'Copiar'}
      </button>
    </span>
  )
}

function Tarjeta({
  icono,
  tono,
  titulo,
  children,
}: {
  icono: ReactNode
  tono: 'marca' | 'acento' | 'neutro'
  titulo: string
  children: ReactNode
}) {
  return (
    <article className="pl-intro__tarjeta">
      <span className={`pl-intro__icono pl-intro__icono--${tono}`} aria-hidden="true">
        {icono}
      </span>
      <h2 className="pl-intro__titulo">{titulo}</h2>
      <p className="pl-intro__texto">{children}</p>
    </article>
  )
}

const trazo = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
} as const

function IconoFlecha() {
  return (
    <svg className="pl-accion__icono" {...trazo}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

function IconoCandado() {
  return (
    <svg {...trazo}>
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  )
}

function IconoAjustes() {
  return (
    <svg {...trazo}>
      <path d="M4 7h10M10 17h10" />
      <circle cx="17" cy="7" r="3" />
      <circle cx="7" cy="17" r="3" />
    </svg>
  )
}

function IconoRejilla() {
  return (
    <svg {...trazo}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  )
}
