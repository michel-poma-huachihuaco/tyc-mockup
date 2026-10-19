import { Avatar, Badge, EmptyState, Splitter } from '@aybarcorp/ui'
import { useId, useMemo, useState } from 'react'
import { AUDITORIA, AVISOS, HOY, PERSONAS } from '../../datos'
import { TABLETA, haceCuanto, useMedia } from '../../utiles'
import { CARPETAS, crearBandeja, mensajesDe } from './modelo'
import type { IdCarpeta, Mensaje } from './modelo'
import './correo.css'

/**
 * Un Splitter dentro de otro, como un cliente de correo: carpetas | (lista | lectura). Desde
 * 768px los paneles van lado a lado; en el celular, apilados (cada eje recuerda su propio
 * reparto). Las carpetas pliegan con Intro desde su separador. Los mensajes salen de los
 * avisos y la auditoría sintéticos; abrir uno lo marca como leído, solo en memoria.
 */
export function BandejaCorreo() {
  const bandeja = useMemo(() => crearBandeja(AVISOS, AUDITORIA, PERSONAS), [])
  const [carpeta, setCarpeta] = useState<IdCarpeta>('entrada')
  const [elegidos, setElegidos] = useState<Partial<Record<IdCarpeta, string>>>({})
  const [leidos, setLeidos] = useState<ReadonlySet<string>>(() => new Set())
  const lado = useMedia(TABLETA)
  const eje = lado ? 'horizontal' : 'vertical'

  const mensajes = mensajesDe(bandeja, carpeta)
  const mensaje = mensajes.find((m) => m.id === elegidos[carpeta]) ?? mensajes[0] ?? null
  const nombreCarpeta = CARPETAS.find((c) => c.id === carpeta)?.nombre ?? carpeta
  const sinLeer = (m: Mensaje) => !m.leido && !leidos.has(m.id)

  const abrir = (m: Mensaje) => {
    setElegidos((actuales) => ({ ...actuales, [carpeta]: m.id }))
    setLeidos((actuales) => new Set(actuales).add(m.id))
  }

  return (
    <div className="gl-correo">
      <Splitter
        orientation={eje}
        label="Ajustar el tamaño de las carpetas"
        defaultSize={lado ? 22 : 24}
        min={14}
        max={40}
        collapsible
        persistKey={`galeria:correo-carpetas-${eje}`}
      >
        <nav className="gl-correo__carpetas" aria-label="Carpetas">
          <ul className="gl-correo__lista-carpetas">
            {CARPETAS.map((c) => {
              const n = bandeja.filter((m) => m.carpeta === c.id && sinLeer(m)).length
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    className="gl-correo__carpeta"
                    aria-current={c.id === carpeta ? 'true' : undefined}
                    onClick={() => setCarpeta(c.id)}
                  >
                    <span className="gl-correo__carpeta-nombre">{c.nombre}</span>
                    {n > 0 ? (
                      <Badge tone="info" size="sm">
                        {n}
                        <span className="ay-visually-hidden"> sin leer</span>
                      </Badge>
                    ) : null}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
        <div className="gl-correo__resto">
          <Splitter
            orientation={eje}
            label="Ajustar el tamaño de la lista de mensajes"
            defaultSize={lado ? 42 : 45}
            min={25}
            max={75}
            persistKey={`galeria:correo-lista-${eje}`}
          >
            <div>
              {mensajes.length === 0 ? (
                <div className="gl-correo__vacio">
                  <EmptyState size="compact" variant="no-results" title={`${nombreCarpeta} está vacía`} description="Prueba con otra carpeta." />
                </div>
              ) : (
                <ul className="gl-correo__lista" aria-label={`Mensajes de ${nombreCarpeta}`}>
                  {mensajes.map((m) => (
                    <li key={m.id}>
                      <button
                        type="button"
                        className="gl-correo__mensaje"
                        aria-current={m.id === mensaje?.id ? 'true' : undefined}
                        data-sin-leer={sinLeer(m) ? '' : undefined}
                        onClick={() => abrir(m)}
                      >
                        <Avatar name={m.remitente} size="sm" decorative />
                        <span className="gl-correo__remitente">{m.remitente}</span>
                        <time className="gl-correo__fecha" dateTime={m.fecha}>
                          {haceCuanto(m.fecha, HOY)}
                        </time>
                        <span className="gl-correo__asunto">
                          {sinLeer(m) ? <span className="ay-visually-hidden">Sin leer: </span> : null}
                          {m.asunto}
                        </span>
                        <span className="gl-correo__extracto">{m.extracto}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Lectura mensaje={mensaje} />
          </Splitter>
        </div>
      </Splitter>
    </div>
  )
}

function Lectura({ mensaje }: { mensaje: Mensaje | null }) {
  const id = useId()
  return <div className="gl-correo__lectura">{mensaje ? <Articulo mensaje={mensaje} id={id} /> : <SinMensaje />}</div>
}

function SinMensaje() {
  return <EmptyState size="compact" variant="no-results" title="Ningún mensaje abierto" description="Elige uno de la lista." />
}

function Articulo({ mensaje, id }: { mensaje: Mensaje; id: string }) {
  return (
    <article className="gl-correo__articulo" aria-labelledby={id}>
      <h3 id={id} className="gl-correo__titulo">
        {mensaje.asunto}
      </h3>
      <div className="gl-correo__de">
        <Avatar name={mensaje.remitente} size="md" decorative />
        <p className="gl-correo__de-texto">
          <strong>{mensaje.remitente}</strong>
          <span>
            {mensaje.correo} · <time dateTime={mensaje.fecha}>{haceCuanto(mensaje.fecha, HOY)}</time>
          </span>
        </p>
      </div>
      <div className="gl-correo__cuerpo">
        {mensaje.parrafos.map((parrafo) => (
          <p key={parrafo}>{parrafo}</p>
        ))}
      </div>
    </article>
  )
}
