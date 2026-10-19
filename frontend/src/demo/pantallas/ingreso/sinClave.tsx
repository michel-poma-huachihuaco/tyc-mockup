import { Alert, Button, Divider, Form, FormField, Input, OtpInput, PhoneInput } from '@aybarcorp/ui'
import { useEffect, useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { avisoDemo, useCuentaAtras } from '../../utiles'
import { limpio } from './clasicas'
import { MarcaIngreso, NotaDemo, celularVelado, errorDeCelular, errorDeCorreo, raizDe, useEnvioDemo, useTituloVariante } from './comun'
import type { PropsVariante } from './comun'

/**
 * Tres accesos sin contraseña: un código por SMS al celular, un enlace mágico al correo y el
 * inicio único con un proveedor de identidad. Cada uno con su siguiente estado.
 */

/** La tarjeta centrada de estas maquetas, sobre el lienzo con un brillo de marca arriba. */
function Tarjeta({ miniatura, clase, children }: { miniatura?: boolean; clase: string; children: ReactNode }) {
  const Raiz = raizDe(miniatura)
  return (
    <Raiz className={`gl-in gl-in-centrada ${clase}`}>
      <div className="gl-in-tarjeta">{children}</div>
    </Raiz>
  )
}

/** Celular: el número y, después, un código de seis dígitos con reenvío temporizado. */
export function Celular({ miniatura }: PropsVariante) {
  useTituloVariante('Celular', miniatura)
  const [paso, setPaso] = useState<'numero' | 'codigo'>('numero')
  const [numero, setNumero] = useState('')
  const [error, setError] = useState<string>()
  const [codigo, setCodigo] = useState('')
  const [errorCodigo, setErrorCodigo] = useState<string>()
  const [restantes, reiniciar] = useCuentaAtras(30)
  const [enviando, enviar] = useEnvioDemo()
  const id = useId()
  const titulo = useRef<HTMLHeadingElement>(null)

  // Al cambiar de paso, el foco va al título del paso nuevo: el anterior ya no existe.
  const primerPaso = useRef(true)
  useEffect(() => {
    if (primerPaso.current) {
      primerPaso.current = false
      return
    }
    titulo.current?.focus()
  }, [paso])

  if (paso === 'codigo') {
    return (
      <Tarjeta miniatura={miniatura} clase="gl-in-celular">
        <div className="gl-in-cabeza">
          <MarcaIngreso />
          <h1 ref={titulo} tabIndex={-1} className="gl-in-titulo">
            Escribe el código
          </h1>
          <p className="gl-texto-chico">Te lo enviamos por SMS al {celularVelado(numero)}. Caduca en diez minutos.</p>
        </div>
        <OtpInput
          label="Código de seis dígitos"
          length={6}
          type="numeric"
          value={codigo}
          error={errorCodigo}
          disabled={enviando}
          onValueChange={(v) => {
            setCodigo(v)
            setErrorCodigo(undefined)
          }}
          onComplete={() => void enviar()}
        />
        <Button
          variant="primary"
          fullWidth
          loading={enviando}
          onClick={() => {
            if (codigo.length < 6) setErrorCodigo('Faltan cifras: el código tiene seis.')
            else void enviar()
          }}
        >
          Verificar
        </Button>
        <div className="gl-in-fila">
          <Button
            variant="ghost"
            size="sm"
            disabled={restantes > 0}
            onClick={() => {
              reiniciar()
              avisoDemo('Demo: el código se reenviaría por SMS.')
            }}
          >
            {restantes > 0 ? `Reenviar en ${restantes} s` : 'Reenviar el código'}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setPaso('numero')}>
            Cambiar el número
          </Button>
        </div>
        <p className="ay-visually-hidden" aria-live="polite">
          {restantes === 0 ? 'Ya puedes pedir otro código.' : ''}
        </p>
      </Tarjeta>
    )
  }

  return (
    <Tarjeta miniatura={miniatura} clase="gl-in-celular">
      <div className="gl-in-cabeza">
        <MarcaIngreso />
        <h1 ref={titulo} tabIndex={-1} className="gl-in-titulo">
          Entra con tu celular
        </h1>
        <p className="gl-texto-chico">Te enviamos un código de un solo uso. Sin contraseñas que recordar.</p>
      </div>
      <Form
        summary={false}
        onSubmit={() => {
          const encontrado = errorDeCelular(numero)
          setError(encontrado)
          if (encontrado) {
            requestAnimationFrame(() => document.querySelector<HTMLInputElement>(`[data-celular="${id}"] input`)?.focus())
            return
          }
          void enviar(() => {
            reiniciar()
            setPaso('codigo')
          })
        }}
        submitting={enviando}
      >
        <div data-celular={id}>
          <PhoneInput label="Número de celular" country="PE" kind="mobile" size="lg" value={numero} error={error} onValueChange={(v) => {
            setNumero(v)
            setError(undefined)
          }} />
        </div>
        <Button type="submit" variant="primary" fullWidth loading={enviando}>
          Enviarme el código
        </Button>
      </Form>
      <NotaDemo>Maqueta: ningún SMS sale de aquí. Prueba con un número que empiece por 9.</NotaDemo>
    </Tarjeta>
  )
}

/** Enlace mágico: solo el correo; después, «revisa tu correo» con reenvío temporizado. */
export function EnlaceMagico({ miniatura }: PropsVariante) {
  useTituloVariante('Enlace mágico', miniatura)
  const [enviado, setEnviado] = useState(false)
  const [correo, setCorreo] = useState('')
  const [error, setError] = useState<string>()
  const [restantes, reiniciar] = useCuentaAtras(45)
  const [enviando, enviar] = useEnvioDemo()
  const id = `${useId()}-correo`
  const titulo = useRef<HTMLHeadingElement>(null)
  const primero = useRef(true)
  useEffect(() => {
    if (primero.current) {
      primero.current = false
      return
    }
    titulo.current?.focus()
  }, [enviado])

  if (enviado) {
    return (
      <Tarjeta miniatura={miniatura} clase="gl-in-enlace-magico">
        <div className="gl-in-cabeza gl-in-cabeza--centro">
          <span className="gl-in-sobre" aria-hidden="true">
            <svg viewBox="0 0 64 64" focusable="false">
              <rect x="6" y="14" width="52" height="36" rx="6" />
              <path d="m8 18 24 18 24-18" />
              <circle cx="50" cy="16" r="7" className="gl-in-sobre__punto" />
            </svg>
          </span>
          <h1 ref={titulo} tabIndex={-1} className="gl-in-titulo">
            Revisa tu correo
          </h1>
          <p className="gl-texto-chico">
            Enviamos un enlace de acceso a <strong>{correo.trim()}</strong>. Ábrelo en este equipo: caduca en quince minutos y
            solo sirve una vez.
          </p>
        </div>
        <Alert tone="info" size="sm" live="off">
          ¿No llega? Mira en «No deseado» o espera unos segundos para pedir otro.
        </Alert>
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
        <Button variant="ghost" fullWidth onClick={() => setEnviado(false)}>
          Usar otro correo
        </Button>
      </Tarjeta>
    )
  }

  return (
    <Tarjeta miniatura={miniatura} clase="gl-in-enlace-magico">
      <div className="gl-in-cabeza">
        <MarcaIngreso />
        <h1 ref={titulo} tabIndex={-1} className="gl-in-titulo">
          Entra sin contraseña
        </h1>
        <p className="gl-texto-chico">Escribe tu correo y te enviamos un enlace que abre la sesión.</p>
      </div>
      <Form
        summary={false}
        onSubmit={() => {
          const encontrado = errorDeCorreo(correo)
          setError(encontrado)
          if (encontrado) {
            requestAnimationFrame(() => document.getElementById(id)?.focus())
            return
          }
          void enviar(() => {
            reiniciar()
            setEnviado(true)
          })
        }}
        submitting={enviando}
        errors={limpio({ correo: error }, { correo: id })}
      >
        <FormField label="Correo" id={id} error={error}>
          <Input
            type="email"
            size="lg"
            autoComplete="email"
            value={correo}
            onChange={(e) => {
              setCorreo(e.target.value)
              setError(undefined)
            }}
          />
        </FormField>
        <Button type="submit" variant="primary" fullWidth loading={enviando}>
          Enviarme el enlace
        </Button>
      </Form>
      <NotaDemo />
    </Tarjeta>
  )
}

const PROVEEDORES = [
  { id: 'google', nombre: 'Google', glifo: <GlifoG /> },
  { id: 'microsoft', nombre: 'Microsoft', glifo: <GlifoCuadros /> },
  { id: 'apple', nombre: 'Apple', glifo: <GlifoManzana /> },
] as const

/** Inicio único: Google, Microsoft y Apple con glifos neutros, y el correo de siempre. */
export function Sso({ miniatura }: PropsVariante) {
  useTituloVariante('Inicio único', miniatura)
  const [correo, setCorreo] = useState('')
  const [error, setError] = useState<string>()
  const [enviando, enviar] = useEnvioDemo()
  const [proveedor, setProveedor] = useState<string | null>(null)
  const id = `${useId()}-correo`
  return (
    <Tarjeta miniatura={miniatura} clase="gl-in-sso">
      <div className="gl-in-cabeza gl-in-cabeza--centro">
        <MarcaIngreso />
        <h1 className="gl-in-titulo">Entra a tu espacio</h1>
        <p className="gl-texto-chico">Con la cuenta de tu organización, sin crear otra contraseña.</p>
      </div>
      <div className="gl-in-proveedores" role="group" aria-label="Proveedores de identidad">
        {PROVEEDORES.map((p) => (
          <Button
            key={p.id}
            variant="secondary"
            fullWidth
            loading={proveedor === p.id}
            leadingIcon={<span className="gl-in-glifo">{p.glifo}</span>}
            onClick={() => {
              setProveedor(p.id)
              void enviar(() => {
                setProveedor(null)
                avisoDemo(`Demo: aquí se abriría el acceso de ${p.nombre}.`)
              })
            }}
          >
            Continuar con {p.nombre}
          </Button>
        ))}
      </div>
      <Divider label="o con tu correo" spacing="sm" />
      <Form
        summary={false}
        onSubmit={() => {
          const encontrado = errorDeCorreo(correo)
          setError(encontrado)
          if (encontrado) {
            requestAnimationFrame(() => document.getElementById(id)?.focus())
            return
          }
          void enviar()
        }}
        submitting={enviando && proveedor === null}
        errors={limpio({ correo: error }, { correo: id })}
      >
        <FormField label="Correo de trabajo" id={id} error={error} helper="Te llevamos al proveedor de tu organización.">
          <Input
            type="email"
            autoComplete="email"
            value={correo}
            onChange={(e) => {
              setCorreo(e.target.value)
              setError(undefined)
            }}
          />
        </FormField>
        <Button type="submit" variant="primary" fullWidth loading={enviando && proveedor === null}>
          Continuar
        </Button>
      </Form>
      <NotaDemo>Glifos neutros de maqueta: los logotipos de cada proveedor llevan sus propias reglas de uso.</NotaDemo>
    </Tarjeta>
  )
}

const trazo = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, focusable: false } as const

function GlifoG() {
  return (
    <svg {...trazo}>
      <path d="M19 12a7 7 0 1 1-2.05-4.95" />
      <path d="M12.5 12H19" />
    </svg>
  )
}

function GlifoCuadros() {
  return (
    <svg {...trazo}>
      <rect x="4" y="4" width="7" height="7" rx="1" />
      <rect x="13" y="4" width="7" height="7" rx="1" />
      <rect x="4" y="13" width="7" height="7" rx="1" />
      <rect x="13" y="13" width="7" height="7" rx="1" />
    </svg>
  )
}

function GlifoManzana() {
  return (
    <svg {...trazo}>
      <path d="M12 7.5c-1.2-1.4-3.6-1.6-5 .1-1.8 2.2-1.1 6.6 1.3 9.6 1 1.2 2 1.6 3 .9.6-.4 1.5-.4 2.1 0 1 .7 2 .3 3-.9 1.1-1.4 1.8-3 2-4.5-1.6-.6-2.5-2.2-2-3.9-1.5-1.4-3.3-1.1-4.4-1.3Z" />
      <path d="M12 7.5c.1-1.8 1-3 2.6-3.5" />
    </svg>
  )
}
