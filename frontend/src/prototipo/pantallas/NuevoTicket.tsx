import {
  Alert,
  Badge,
  Breadcrumb,
  Button,
  Card,
  CardBody,
  Checkbox,
  CardHeader,
  CardPairs,
  Combobox,
  Dialog,
  Form,
  FormField,
  FormGroup,
  Header,
  Icon,
  Input,
  Radio,
  Select,
  Tag,
  Textarea,
  toast,
} from '@aybarcorp/ui'
import { useEffect, useId, useRef, useState } from 'react'
import { CANALES, EMPRESAS, ESTABLECIMIENTOS, LINEAS, NOMBRE_SENAL, PRIORIDADES, SENALES, TIPOS, empresa, nombreTipo } from '../datos/catalogos.ts'
import type { Canal, Prioridad, Senal } from '../datos/catalogos.ts'
import { INTERESADO_ID, dniEnmascarado } from '../datos/clientes.ts'
import type { Cliente } from '../datos/clientes.ts'
import { AvisoDeError, Prohibido, Supuesto, erroresDeCampos, fechaLarga, horas, irA, precarga, useAccion } from '../comun.tsx'
import { hrefDe } from '../rutas.ts'
import { api, useConsola, useSesion } from '../servicio/api.ts'
import { ErrorSimulado, previsualizarSla, puede, validarTicket } from '../servicio/nucleo.ts'
import type { EntradaTicket, Ticket } from '../servicio/nucleo.ts'
import { validarInteresado } from '../servicio/ola7.ts'
import type { EntradaInteresado } from '../servicio/ola7.ts'

const VACIO: EntradaTicket = {
  canal: '',
  clienteId: '',
  empresaId: '',
  linea: '',
  establecimiento: '',
  tipo: '',
  prioridad: '',
  resumen: '',
  descripcion: '',
}

const NOMBRE_ORIGEN = { especifica: 'Específica (tipo + prioridad)', generica: 'Genérica del tipo', global: 'Genérica global' } as const

/**
 * Nuevo ticket — HU-ATC-001 (registro tipificado), 002 (N.º por razón social) y 003 (panel
 * «SLA que se congelará»). El cliente se busca en el maestro (SIGDA/TAXON) y no se crea
 * aquí; empresa y línea se eligen siempre a mano: no se deducen del cliente.
 */
export default function NuevoTicket() {
  const sesion = useSesion()
  if (!puede.registrar(sesion.rol)) return <SinPermiso />
  return <Formulario />
}

function SinPermiso() {
  const sesion = useSesion()
  const registrado = useRef<string | null>(null)
  // CA-04: el intento queda en la auditoría (se ve en Simulación › Auditoría), una vez por persona.
  useEffect(() => {
    if (registrado.current === sesion.id) return
    registrado.current = sesion.id
    api.registrarIntentoSinPermiso()
  }, [sesion.id])
  return (
    <div className="pt-pagina">
      <Header title="Nuevo ticket" breadcrumb={<Breadcrumb items={[{ label: 'Bandeja', href: hrefDe('bandeja') }, { label: 'Nuevo ticket' }]} />} />
      <Prohibido requiere="de atención (gestor de tickets, colaborador o supervisor)" recurso="registrar tickets" volver={false} />
      <Alert tone="info" size="sm" title="Intento registrado">
        <span className="pt-alerta__texto">Tu intento de registrar un ticket quedó en la auditoría con tu usuario y la hora.</span>
      </Alert>
    </div>
  )
}

function Formulario() {
  const { datos, sim } = useConsola()
  const id = useId()
  const ids = {
    canal: `${id}-canal`,
    cliente: `${id}-cliente`,
    empresa: `${id}-empresa`,
    linea: `${id}-linea`,
    tipo: `${id}-tipo`,
    prioridad: `${id}-prioridad`,
    resumen: `${id}-resumen`,
    descripcion: `${id}-descripcion`,
  } as const
  const [valores, setValores] = useState<EntradaTicket>(VACIO)
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [elegido, setElegido] = useState<Cliente | null>(null)
  const [registrado, setRegistrado] = useState<Ticket | null>(null)
  const [senales, setSenales] = useState<Senal[]>([])
  const [conConflicto, setConConflicto] = useState(false)
  // HU-ATC-051: modo excepción. Entra desde la búsqueda (no encontrado o SIGDA caído) o desde una llamada desconocida.
  const [interesado, setInteresado] = useState<EntradaInteresado | null>(() => (precarga.telefono !== null ? { nombre: '', telefono: precarga.telefono, dni: '' } : null))
  const guardar = useAccion()
  const apertura = sim.apertura ?? datos.ahora
  const sla = valores.tipo && valores.prioridad ? previsualizarSla(datos, valores.tipo, valores.prioridad as Prioridad, apertura) : null
  const fijar = <K extends keyof EntradaTicket>(campo: K, valor: EntradaTicket[K]) => {
    setValores((v) => ({ ...v, [campo]: valor }))
    setErrores((e) => {
      const resto = { ...e }
      delete resto[campo === 'clienteId' ? 'cliente' : campo === 'empresaId' ? 'empresa' : campo]
      return resto
    })
  }

  useEffect(() => {
    precarga.telefono = null
    if (interesado && !valores.canal) setValores((v) => ({ ...v, canal: 'Teléfono' }))
  }, [])

  const enviar = async () => {
    const campos = interesado ? [...validarTicket({ ...valores, clienteId: INTERESADO_ID }), ...validarInteresado(interesado)] : validarTicket(valores)
    setErrores(Object.fromEntries(campos.map((c) => [c.campo, c.mensaje])))
    if (campos.length) return
    const ticket = await guardar.ejecutar(async () => {
      const t = interesado ? await api.crearTicketInteresado({ ...valores }, interesado) : await api.crearTicket(valores)
      // HU-ATC-026: las señales detectadas en el primer contacto se marcan al registrar.
      if (senales.length) await api.marcarSenales(t.id, senales)
      return t
    })
    if (ticket) {
      setConConflicto(senales.length > 0)
      setRegistrado(ticket)
    }
  }

  useEffect(() => {
    const deServidor = erroresDeCampos(guardar.error)
    if (Object.keys(deServidor).length) setErrores(deServidor)
  }, [guardar.error])

  const reiniciar = () => {
    setValores(VACIO)
    setSenales([])
    setElegido(null)
    setInteresado(null)
    setErrores({})
    guardar.limpiar()
  }

  const erroresDelForm = Object.fromEntries(
    Object.entries(errores).map(([campo, mensaje]) => [ids[campo as keyof typeof ids] ?? campo, mensaje]),
  )
  const errorGeneral = guardar.error instanceof ErrorSimulado && guardar.error.status !== 400 ? guardar.error : null

  return (
    <div className="pt-pagina pt-pagina--ancha">
      <Header
        title="Nuevo ticket"
        breadcrumb={<Breadcrumb items={[{ label: 'Bandeja', href: hrefDe('bandeja') }, { label: 'Nuevo ticket' }]} />}
        description="Registra la solicitud tipificada desde el primer contacto. Al guardar, el cliente recibe su número."
      />
      {errorGeneral ? <AvisoDeError error={errorGeneral} reintentar={enviar} titulo="No se registró el ticket" /> : null}
      <div className="pt-dos-columnas">
        <Card>
          <CardBody>
            <Form id={`${id}-form`} onSubmit={enviar} errors={erroresDelForm} submitting={guardar.enCurso}>
              <FormGroup legend="Canal de entrada" error={errores.canal}>
                <div className="pt-opciones-en-linea" id={ids.canal}>
                  {CANALES.map((c) => (
                    <Radio key={c} name={`${id}-canal-r`} value={c} label={c} checked={valores.canal === c} onChange={() => fijar('canal', c as Canal)} />
                  ))}
                </div>
              </FormGroup>

              <FormGroup legend="Señales de conflicto (opcional)" description="Si el cliente menciona alguna, el ticket se atenderá en Eje 3 (Legal).">
                <div className="pt-opciones-en-linea">
                  {SENALES.map((x) => (
                    <Checkbox
                      key={x}
                      label={NOMBRE_SENAL[x]}
                      checked={senales.includes(x)}
                      onChange={(e) => setSenales((l) => (e.target.checked ? [...l, x] : l.filter((y) => y !== x)))}
                    />
                  ))}
                </div>
              </FormGroup>

              {interesado ? (
                <FormGroup legend="Interesado (excepción)" description="El cliente no está en SIGDA/TAXON o no responde: se registran solo datos mínimos y el ticket queda pendiente de vincular.">
                  <div className="pt-rejilla-campos">
                    <FormField label="Nombre del interesado" error={errores.nombreInteresado} required>
                      <Input value={interesado.nombre} onChange={(e) => setInteresado({ ...interesado, nombre: e.target.value })} />
                    </FormField>
                    <FormField label="Teléfono de contacto" error={errores.telefonoInteresado} required>
                      <Input value={interesado.telefono} onChange={(e) => setInteresado({ ...interesado, telefono: e.target.value })} />
                    </FormField>
                    <FormField label="DNI" error={errores.dniInteresado} optional helper="Si SIGDA/TAXON estaba caído, con el DNI el sistema lo vincula solo.">
                      <Input value={interesado.dni} inputMode="numeric" maxLength={8} onChange={(e) => setInteresado({ ...interesado, dni: e.target.value.replace(/\D/g, '') })} />
                    </FormField>
                  </div>
                  <div className="pt-acciones pt-acciones--inicio">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setInteresado(null)}>Volver a buscar en SIGDA/TAXON</Button>
                  </div>
                  <Supuesto>«Excepción para la consulta de usuario» se entiende como cliente no encontrado o sistema fuente caído.</Supuesto>
                </FormGroup>
              ) : (
                <BuscarCliente
                  id={ids.cliente}
                  error={errores.cliente}
                  elegido={elegido}
                  onInteresado={() => setInteresado({ nombre: '', telefono: '', dni: '' })}
                  onElegir={(c) => {
                    setElegido(c)
                    fijar('clienteId', c?.id ?? '')
                  }}
                />
              )}

              <div className="pt-rejilla-campos">
                <FormField label="Empresa (razón social y RUC)" id={ids.empresa} error={errores.empresa} required helper="No se deduce del cliente ni de su proyecto.">
                  <Select
                    value={valores.empresaId}
                    placeholder="Elige la razón social"
                    onChange={(e) => fijar('empresaId', e.target.value)}
                    options={EMPRESAS.map((e) => ({ value: e.id, label: `${e.nombre} · RUC ${e.ruc}` }))}
                  />
                </FormField>
                <FormField label="Línea de negocio" id={ids.linea} error={errores.linea} required>
                  <Select value={valores.linea} placeholder="Elige la línea" onChange={(e) => fijar('linea', e.target.value)} options={LINEAS.map((l) => ({ value: l, label: l }))} />
                </FormField>
                <FormField label="Tipo de ticket" id={ids.tipo} error={errores.tipo} required>
                  <Select value={valores.tipo} placeholder="Elige el tipo" onChange={(e) => fijar('tipo', e.target.value)} options={TIPOS.map((t) => ({ value: t.id, label: t.nombre }))} />
                </FormField>
                <FormField label="Prioridad" id={ids.prioridad} error={errores.prioridad} required>
                  <Select
                    value={valores.prioridad}
                    placeholder="Elige la prioridad"
                    onChange={(e) => fijar('prioridad', e.target.value as Prioridad)}
                    options={PRIORIDADES.map((p) => ({ value: p.id, label: p.nombre }))}
                  />
                </FormField>
                <FormField label="Establecimiento" optional helper="En teléfono, WhatsApp y correo puede quedar vacío.">
                  <Select
                    value={valores.establecimiento}
                    onChange={(e) => fijar('establecimiento', e.target.value)}
                    options={[{ value: '', label: 'Sin establecimiento' }, ...ESTABLECIMIENTOS.map((e) => ({ value: e, label: e }))]}
                  />
                </FormField>
              </div>

              <FormField label="Resumen" id={ids.resumen} error={errores.resumen} required helper="Una línea que se entienda en la bandeja.">
                <Input value={valores.resumen} onChange={(e) => fijar('resumen', e.target.value.slice(0, 120))} />
              </FormField>
              <FormField label="Descripción" id={ids.descripcion} error={errores.descripcion} required>
                <Textarea rows={4} autoResize maxRows={10} maxLength={2000} showCounter value={valores.descripcion} onChange={(e) => fijar('descripcion', e.target.value)} />
              </FormField>

              <div className="pt-acciones">
                <Button variant="ghost" type="button" onClick={reiniciar} disabled={guardar.enCurso}>
                  Limpiar
                </Button>
                <Button variant="primary" type="submit" loading={guardar.enCurso}>
                  Registrar ticket
                </Button>
              </div>
            </Form>
          </CardBody>
        </Card>

        <aside className="pt-lateral" aria-label="SLA que se congelará">
          <Card>
            <CardHeader as="h2" title="SLA que se congelará" subtitle="Se calcula al guardar y ya no cambia aunque la política cambie después." />
            <CardBody>
              {sla ? (
                <div className="pt-pila">
                  <CardPairs
                    pairs={[
                      ['Política', `${sla.politica.id} · v${sla.politica.version}`],
                      ['Precedencia', NOMBRE_ORIGEN[sla.origen]],
                      [
                        'Apertura',
                        <span key="a" className="pt-en-linea">
                          {fechaLarga(apertura)}
                          {sim.apertura ? (
                            <Tag size="sm" variant="outline">
                              Simulada
                            </Tag>
                          ) : null}
                        </span>,
                      ],
                      ['1.ª respuesta', `${fechaLarga(sla.venceRespuesta)} (${horas(sla.politica.respuestaH)} hábiles)`],
                      ['Resolución', `${fechaLarga(sla.venceResolucion)} (${horas(sla.politica.resolucionH)} hábiles)`],
                    ]}
                  />
                  {sla.origen === 'global' ? (
                    <Alert tone="warning" size="sm" title="Sin política para este tipo">
                      <span className="pt-alerta__texto">
                        «{nombreTipo(valores.tipo)}» no tiene política activa: se aplicará la genérica global y se registrará una alerta de configuración.
                      </span>
                    </Alert>
                  ) : null}
                  <Supuesto>Horario hábil de 9:00 a 18:00 con feriados de Perú; matriz de tiempos ilustrativa (DEP-03 pendiente).</Supuesto>
                </div>
              ) : (
                <p className="pt-texto-chico">Elige el tipo y la prioridad para ver los vencimientos.</p>
              )}
            </CardBody>
          </Card>
          <Supuesto>N.º visible: sigla de la empresa y correlativo de 6 cifras (AIN-000482), sin reinicio anual.</Supuesto>
        </aside>
      </div>

      <Dialog
        open={registrado !== null}
        onOpenChange={(abierto) => {
          if (!abierto) {
            setRegistrado(null)
            reiniciar()
          }
        }}
        title="Ticket registrado"
        description="Dicta o envía este número al cliente para que dé seguimiento."
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setRegistrado(null)
                reiniciar()
              }}
            >
              Registrar otro
            </Button>
            <Button variant="primary" onClick={() => registrado && irA(hrefDe(`ticket/${registrado.id}`))}>
              Ver el ticket
            </Button>
          </>
        }
      >
        {registrado ? (
          <div className="pt-registrado">
            <p className="pt-registrado__numero" aria-live="polite">
              {registrado.numero}
            </p>
            <p className="pt-texto-chico">{empresa(registrado.empresaId)?.nombre}</p>
            {registrado.clienteId === INTERESADO_ID ? (
              <Alert tone="info" size="sm" title="Pendiente de vincular">
                <span className="pt-alerta__texto">Quedó con datos mínimos del interesado. Se vincula al cliente del maestro cuando se identifique.</span>
              </Alert>
            ) : null}
            {conConflicto ? (
              <Alert tone="warning" size="sm" title="Caso de conflicto">
                <span className="pt-alerta__texto">Tiene señales de conflicto: no se resuelve en Eje 1/2. Desde el ticket, «Derivar a Eje 3» con el paquete mínimo.</span>
              </Alert>
            ) : null}
            <Button
              variant="secondary"
              size="sm"
              leadingIcon={<Icon name="copy" size={16} />}
              onClick={() =>
                navigator.clipboard?.writeText(registrado.numero).then(
                  () => toast({ message: `Número ${registrado.numero} copiado.`, tone: 'success' }),
                  () => toast({ message: 'No se pudo copiar: díctalo o cópialo a mano.', tone: 'warning' }),
                )
              }
            >
              Copiar el número
            </Button>
          </div>
        ) : null}
      </Dialog>
    </div>
  )
}

/** CA-03: el cliente viene del maestro único (SIGDA/TAXON); aquí no se da de alta. */
function BuscarCliente({ id, error, elegido, onElegir, onInteresado }: { id: string; error?: string; elegido: Cliente | null; onElegir: (c: Cliente | null) => void; onInteresado: () => void }) {
  const [consulta, setConsulta] = useState('')
  const [resultados, setResultados] = useState<Cliente[]>([])
  const [buscando, setBuscando] = useState(false)
  const [fallo, setFallo] = useState<unknown>(null)
  const temporizador = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const vigente = useRef(0)

  const buscar = (q: string) => {
    clearTimeout(temporizador.current)
    setFallo(null)
    if (q.trim().length < 3) {
      setResultados([])
      setBuscando(false)
      return
    }
    setBuscando(true)
    const turno = ++vigente.current
    temporizador.current = setTimeout(() => {
      api.buscarClientes(q).then(
        (r) => turno === vigente.current && (setResultados(r), setBuscando(false)),
        (e: unknown) => turno === vigente.current && (setFallo(e), setResultados([]), setBuscando(false)),
      )
    }, 250)
  }

  useEffect(() => () => clearTimeout(temporizador.current), [])

  const opciones = [
    ...(elegido && !resultados.some((r) => r.id === elegido.id) ? [elegido] : []),
    ...resultados,
  ].map((c) => ({ value: c.id, label: c.nombre, description: `DNI ${dniEnmascarado(c.dni)} · ${c.proyectos[0]}` }))

  return (
    <div className="pt-pila" id={id}>
      <Combobox
        label="Cliente (DNI o nombre)"
        placeholder="Escribe al menos 3 caracteres"
        options={opciones}
        value={elegido?.id}
        onInputChange={(q) => {
          setConsulta(q)
          buscar(q)
        }}
        onValueChange={(v) => onElegir(typeof v === 'string' ? ([...resultados, ...(elegido ? [elegido] : [])].find((c) => c.id === v) ?? null) : null)}
        loading={buscando}
        error={error ?? (fallo ? 'No se pudo consultar SIGDA/TAXON.' : undefined)}
        emptyMessage={
          consulta.trim().length < 3
            ? 'Escribe al menos 3 caracteres del DNI o del nombre.'
            : 'No está en SIGDA/TAXON. El alta del cliente se hace en el maestro, no aquí.'
        }
      />
      {fallo ? <AvisoDeError error={fallo} reintentar={() => buscar(consulta)} titulo="SIGDA/TAXON no respondió" /> : null}
      {!elegido && (fallo || (consulta.trim().length >= 3 && !buscando && resultados.length === 0)) ? (
        <Alert tone="info" size="sm" title={fallo ? 'Puedes seguir atendiendo' : 'No está en SIGDA/TAXON'} actions={<Button type="button" size="sm" variant="secondary" onClick={onInteresado}>Registrar como interesado</Button>}>
          <span className="pt-alerta__texto">El ticket se crea con datos mínimos y queda pendiente de vincular; no se pierde la solicitud.</span>
        </Alert>
      ) : null}
      {elegido ? (
        <Card>
          <CardHeader
            as="h3"
            title={elegido.nombre}
            actions={
              <Badge tone="info" size="sm">
                Del maestro SIGDA/TAXON
              </Badge>
            }
          />
          <CardBody padding="sm">
            <CardPairs
              pairs={[
                ['DNI', dniEnmascarado(elegido.dni)],
                ['Teléfono', elegido.telefono],
                ['Correo', elegido.correo],
                ['Proyectos', elegido.proyectos.join(' · ')],
              ]}
            />
            <p className="pt-texto-chico">Datos de solo lectura: no se crea un registro paralelo del cliente. Si algo está mal, se corrige en el maestro.</p>
          </CardBody>
        </Card>
      ) : null}
    </div>
  )
}
