import { Button, Card, CardBody, Checkbox, Form, FormField, Input, LoginForm, PasswordInput, Tilt } from '@aybarcorp/ui'
import { useId, useState } from 'react'
import { BASE } from '../../rutas'
import { MOVIMIENTO_REDUCIDO, useMedia } from '../../utiles'
import { MarcaIngreso, NotaDemo, errorDeCorreo, raizDe, useEnvioDemo, useTituloVariante } from './comun'
import type { PropsVariante } from './comun'

/**
 * Cuatro maquetas de ingreso con correo y contraseña, distintas en su composición:
 * partido, minimal, animado y vidrio. Las tres primeras usan el Login Form del framework
 * tal cual; la de vidrio compone la tarjeta con Form, Form Field y Password Input.
 */

const RECUPERAR = `${BASE}/ingreso/recuperar`
const REGISTRO = `${BASE}/ingreso/registro`

/** Partido: el panel de marca con relieve topográfico a un lado y el Login Form al otro. */
export function Partido({ miniatura }: PropsVariante) {
  useTituloVariante('Partido', miniatura)
  const [enviando, enviar] = useEnvioDemo()
  const Raiz = raizDe(miniatura)
  return (
    <div className="gl-in gl-in-partido">
      <header className="gl-in-partido__marca">
        <Topografia />
        <MarcaIngreso inversa />
        <div className="gl-in-partido__mensaje">
          <p className="gl-in-partido__lema">Cada lote, cada cuota y cada cliente en un solo lugar.</p>
          <p className="gl-in-partido__texto">Entra con tu cuenta corporativa y sigue donde lo dejaste.</p>
        </div>
        <ul className="gl-in-sellos" aria-label="Lo que protege este acceso">
          <li>Contraste AA</li>
          <li>Sesión OIDC</li>
          <li>Doble factor</li>
        </ul>
      </header>
      <Raiz className="gl-in-partido__lado">
        <LoginForm
          size="lg"
          title="Entra a tu cuenta"
          identifierLabel="Correo"
          identifierType="email"
          recoverHref={RECUPERAR}
          submitting={enviando}
          onSubmit={() => enviar()}
        />
        <p className="gl-in-alterno">
          ¿Primera vez? <a href={REGISTRO}>Crea tu cuenta</a>
        </p>
      </Raiz>
    </div>
  )
}

/** Minimal: centrado, con mucho aire y solo tipografía; la tarjeta del Login Form se aligera. */
export function Minimal({ miniatura }: PropsVariante) {
  useTituloVariante('Minimal', miniatura)
  const [enviando, enviar] = useEnvioDemo()
  const Raiz = raizDe(miniatura)
  return (
    <Raiz className="gl-in gl-in-minimal">
      <div className="gl-in-minimal__columna">
        <MarcaIngreso />
        <p className="gl-in-minimal__saludo" aria-hidden="true">
          Hola de nuevo.
        </p>
        <LoginForm
          title="Entra a tu cuenta"
          identifierLabel="Correo"
          identifierType="email"
          recoverHref={RECUPERAR}
          submitting={enviando}
          onSubmit={() => enviar()}
        />
        <NotaDemo />
      </div>
    </Raiz>
  )
}

/**
 * Animado: líneas de relieve que se deslizan despacio detrás del Login Form. «Pausar» las
 * detiene (WCAG 2.2.2: lo que se mueve más de cinco segundos se puede parar); con movimiento
 * reducido no se mueven y el botón lo dice.
 */
export function Animado({ miniatura }: PropsVariante) {
  useTituloVariante('Animado', miniatura)
  const [enviando, enviar] = useEnvioDemo()
  const reducido = useMedia(MOVIMIENTO_REDUCIDO)
  const [pausado, setPausado] = useState(false)
  const Raiz = raizDe(miniatura)
  const quieto = miniatura || reducido || pausado
  return (
    <Raiz className="gl-in gl-in-animado" data-quieto={quieto || undefined}>
      <Ondas />
      {miniatura ? null : (
        <div className="gl-in-animado__control">
          <Button
            variant="secondary"
            size="sm"
            aria-pressed={reducido ? undefined : pausado}
            disabled={reducido}
            onClick={() => setPausado(!pausado)}
          >
            {reducido ? 'Quieto: movimiento reducido' : pausado ? 'Reanudar animación' : 'Pausar animación'}
          </Button>
        </div>
      )}
      <div className="gl-in-animado__centro">
        <LoginForm
          title="Entra a tu cuenta"
          identifierLabel="Correo"
          identifierType="email"
          recoverHref={RECUPERAR}
          submitting={enviando}
          onSubmit={() => enviar()}
        />
      </div>
    </Raiz>
  )
}

/** Vidrio: una tarjeta `glass` inclinable sobre el degradado de la paleta activa. */
export function Vidrio({ miniatura }: PropsVariante) {
  useTituloVariante('Vidrio', miniatura)
  const [enviando, enviar] = useEnvioDemo()
  const [correo, setCorreo] = useState('')
  const [clave, setClave] = useState('')
  const [errores, setErrores] = useState<{ correo?: string; clave?: string }>({})
  const id = useId()
  const ids = { correo: `${id}-correo`, clave: `${id}-clave` }
  const Raiz = raizDe(miniatura)

  const enviarFormulario = () => {
    const encontrados = { correo: errorDeCorreo(correo), clave: clave ? undefined : 'Escribe tu contraseña.' }
    setErrores(encontrados)
    const primero = encontrados.correo ? ids.correo : encontrados.clave ? ids.clave : null
    if (primero) {
      requestAnimationFrame(() => document.getElementById(primero)?.focus())
      return
    }
    void enviar()
  }

  return (
    <Raiz className="gl-in gl-in-vidrio">
      <div className="gl-in-vidrio__fondo" aria-hidden="true">
        <span className="gl-in-vidrio__forma gl-in-vidrio__forma--a" />
        <span className="gl-in-vidrio__forma gl-in-vidrio__forma--b" />
        <span className="gl-in-vidrio__forma gl-in-vidrio__forma--c" />
      </div>
      <div className="gl-in-vidrio__tarjeta">
        <Tilt>
          <Card surface="glass" variant="elevated">
            <CardBody>
              <div className="gl-in-cabeza">
                <MarcaIngreso />
                <h1 className="gl-in-titulo">Bienvenido de vuelta</h1>
                <p className="gl-texto-chico">Entra para ver tus reservas y tus cuotas.</p>
              </div>
              <Form summary={false} onSubmit={enviarFormulario} submitting={enviando} errors={limpio(errores, ids)}>
                <FormField label="Correo" id={ids.correo} error={errores.correo}>
                  <Input
                    type="email"
                    autoComplete="username"
                    value={correo}
                    onChange={(e) => {
                      setCorreo(e.target.value)
                      if (errores.correo) setErrores({ ...errores, correo: undefined })
                    }}
                  />
                </FormField>
                <PasswordInput
                  id={ids.clave}
                  label="Contraseña"
                  autoComplete="current-password"
                  value={clave}
                  error={errores.clave}
                  onValueChange={(v) => {
                    setClave(v)
                    if (errores.clave) setErrores({ ...errores, clave: undefined })
                  }}
                />
                <div className="gl-in-fila">
                  <Checkbox label="Recordarme en este equipo" />
                  <a className="gl-in-enlace" href={RECUPERAR}>
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <Button type="submit" variant="primary" fullWidth loading={enviando}>
                  Entrar
                </Button>
              </Form>
            </CardBody>
          </Card>
        </Tilt>
      </div>
    </Raiz>
  )
}

/** Los errores con el id del control como clave, como los pide Form para su resumen. */
export function limpio<K extends string>(errores: Partial<Record<K, string | undefined>>, ids: Record<K, string>): Record<string, string> {
  const salida: Record<string, string> = {}
  for (const clave of Object.keys(ids) as K[]) {
    const mensaje = errores[clave]
    if (mensaje) salida[ids[clave]] = mensaje
  }
  return salida
}

/**
 * Curvas de nivel sintéticas: anillos irregulares alrededor de dos cumbres, calculados con
 * senos (sin azar: el dibujo es el mismo en cada carga). Decorativas.
 */
function Topografia() {
  const anillos: string[] = []
  const cumbres = [
    { x: 300, y: 230, fase: 0 },
    { x: 80, y: 620, fase: 1.7 },
  ]
  for (const { x, y, fase } of cumbres) {
    for (let i = 0; i < 9; i++) {
      const puntos: string[] = []
      for (let paso = 0; paso <= 48; paso++) {
        const t = (paso / 48) * Math.PI * 2
        const r = 34 + i * 26 + 9 * Math.sin(3 * t + fase + i * 0.35) + 6 * Math.cos(5 * t - i * 0.5)
        puntos.push(`${(x + r * Math.cos(t)).toFixed(1)},${(y + r * Math.sin(t) * 0.82).toFixed(1)}`)
      }
      anillos.push(`M${puntos.join('L')}Z`)
    }
  }
  return (
    <svg className="gl-in-topografia" viewBox="0 0 480 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      {anillos.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  )
}

/** Ondas para el fondo animado: cada trazo mide el doble del ancho y se desliza medio. */
function Ondas() {
  const brillo = `gl${useId().replace(/[^a-zA-Z0-9_-]/g, '')}-brillo`
  const ondas = Array.from({ length: 7 }, (_, i) => {
    const alto = 120 + i * 85
    const amplitud = 28 + (i % 3) * 14
    const tramos: string[] = [`M0,${alto}`]
    for (let x = 0; x < 2400; x += 200) {
      tramos.push(`q100,${i % 2 ? -amplitud : amplitud} 200,0`)
    }
    return { d: tramos.join(' '), i }
  })
  return (
    <svg className="gl-in-ondas" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={brillo} cx="70%" cy="20%" r="70%">
          <stop offset="0%" className="gl-in-ondas__brillo" />
          <stop offset="100%" className="gl-in-ondas__brillo gl-in-ondas__brillo--fin" />
        </radialGradient>
      </defs>
      <rect width="1200" height="800" fill={`url(#${brillo})`} />
      {ondas.map(({ d, i }) => (
        <path key={i} d={d} className={`gl-in-ondas__trazo gl-in-ondas__trazo--${i % 3}`} style={{ animationDuration: `${26 + i * 5}s` }} />
      ))}
    </svg>
  )
}
