// Pantallas de Mi Portal (autogestión del cliente · FT-ATC-24 · PLT-04 v1.3):
//   #/portal                 Mis tickets (HU-ATC-064 CA-02)
//   #/portal/nuevo           Nuevo ticket (HU-ATC-064 CA-01, 03, 04 y 05)
//   #/portal/ticket/<id>     Detalle: trazabilidad, avisos, responder, confirmar o rechazar (HU-ATC-065 y 066)
// Sin sesión, cualquiera de ellas pide primero el acceso con DNI y código de un solo uso (HU-064 CA-01).
// React y los componentes son los del artifact (kit.ts); las reglas, las de modelo.ts sobre el núcleo del chunk «comun».
import {
  Fragmento, h, useEffect, useMemo, useRef, useState, nucleo, usarEstado, usarPersona, usarAccion, erroresPorCampo, avisar,
  clientePorId, clientes, lotesDe, nombreTipo, nombreArea, fechaCorta, fechaDia, usarMedia, DESDE_ESCRITORIO, ruta, ui, Nota,
} from './kit.ts'
import {
  ADJUNTOS, CODIGO, DIAS_CONFIRMACION, ESTADO_CLIENTE, TIPOS, areaCliente, avisos, buscarPorDni, cerrarSinRespuesta,
  cierreAutomaticoDesde, confirmar, contratoDelLote, crearTicket, enmascararCorreo, enmascararTelefono, lineaDeTiempo, mensajes,
  nuevoCodigo, rechazar, registrarIntentoAjeno, responder, ticketDelCliente, ticketsDelCliente, validarDni, type Entrada,
} from './modelo.ts'
import { inyectarEstilos } from './estilos.ts'
import type { Adjunto, Cliente, Datos, Lote, Ticket } from './tipos.ts'

/* eslint-disable @typescript-eslint/no-explicit-any */
type Ruta = { id: 'portal'; vista?: string; ticketId?: string | null }
type Archivo = { id: string; name: string; size: number; status: string; tipo: string }

const CLAVE_SESION = 'v3:portal'
const sesion = {
  leer(): string | null { try { return JSON.parse(sessionStorage.getItem(CLAVE_SESION) ?? 'null')?.clienteId ?? null } catch { return null } },
  guardar(clienteId: string) { try { sessionStorage.setItem(CLAVE_SESION, JSON.stringify({ clienteId })) } catch { /* sin almacenamiento: dura lo que la pestaña */ } },
  borrar() { try { sessionStorage.removeItem(CLAVE_SESION) } catch { /* nada */ } },
}
const ir = (r: string) => { location.hash = ruta(r) }
const texto = (children: any) => h('span', { className: 'pt-alerta__texto' }, children)
const aAdjuntos = (fs: Archivo[]): Adjunto[] => fs.filter((f) => f.status === 'done').map((f) => ({ nombre: f.name, tamano: f.size, tipo: f.tipo }))
const alSubir = (set: (fn: (p: Archivo[]) => Archivo[]) => void) => (nuevos: File[]) =>
  set((p) => [...p, ...nuevos.map((f, i) => ({ id: `${Date.now()}-${i}-${f.name}`, name: f.name, size: f.size, status: 'done', tipo: f.type }))])
const Simulacion = (props: { titulo?: string; children: any }) => h('div', { className: 'pp-sim', role: 'note' }, h('b', null, props.titulo ?? 'Simulación'), props.children)

// ================================================================== contenedor
export function MiPortal({ ruta: r }: { ruta: Ruta }) {
  inyectarEstilos()
  const { datos } = usarEstado() as { datos: Datos }
  const persona = usarPersona()
  const [clienteId, setClienteId] = useState<string | null>(() => sesion.leer())
  const cliente: Cliente | null = clienteId ? clientePorId(clienteId) : null
  const vista = r.vista ?? 'mis-tickets'
  const salir = () => { sesion.borrar(); setClienteId(null); avisar({ message: 'Cerraste tu sesión de Mi Portal.', tone: 'success' }); ir('portal') }

  let cuerpo: any
  if (!cliente) cuerpo = h(Acceso, { datos, onEntrar: (c: Cliente) => { sesion.guardar(c.id); setClienteId(c.id) } })
  else if (vista === 'mis-tickets') cuerpo = h(MisTickets, { datos, cliente })
  else if (vista === 'nuevo') cuerpo = h(NuevoTicket, { datos, cliente })
  else if (vista === 'ticket' && r.ticketId) cuerpo = h(Detalle, { datos, cliente, ticketId: r.ticketId, key: r.ticketId })
  else cuerpo = h(ui.ErrorState, {
    status: 404, scope: 'page', title: 'Esta página de Mi Portal no existe',
    description: 'Vuelve a tus tickets para seguir.', actions: h(ui.Button, { variant: 'primary', onClick: () => ir('portal') }, 'Ir a Mis tickets'),
  })

  return h('div', { className: 'pt-pagina pp' },
    persona.rol !== 'CLIENTE'
      ? h(ui.Alert, { tone: 'info', size: 'sm', title: 'Vista del cliente' }, texto('Así ve Mi Portal un cliente de Aybar. Para recorrerlo como cliente, usa Herramientas › Ver como › Cliente.'))
      : null,
    cliente ? h(Barra, { cliente, vista, onSalir: salir }) : null,
    cuerpo,
    h(Nota, null, 'Mi Portal (EP-ATC-06, FT-ATC-24) es nuevo en la v1.3 del PLT-04. Las pantallas son una propuesta: el PLT-04 dice «por diseñar en la etapa de diseño».'),
  )
}

function Barra({ cliente, vista, onSalir }: { cliente: Cliente; vista: string; onSalir: () => void }) {
  const ini = cliente.nombre.split(' ').slice(0, 2).map((p) => p[0]).join('')
  const enlace = (r: string, txt: string, actual: boolean) => h('a', { href: ruta(r), 'aria-current': actual ? 'page' : undefined }, txt)
  return h('div', { className: 'pp-cab' },
    h('div', { className: 'pp-cab__quien' },
      h('span', { className: 'pp-cab__av', 'aria-hidden': 'true' }, ini),
      h('div', null, h('b', null, `Hola, ${cliente.nombre.split(' ')[0]}`), h('small', null, `DNI ••••${cliente.dni.slice(-4)} · tus datos vienen de SIGDA/TAXON`))),
    h('nav', { className: 'pp-subnav', 'aria-label': 'Secciones de Mi Portal' },
      enlace('portal', 'Mis tickets', vista === 'mis-tickets' || vista === 'ticket'),
      enlace('portal/nuevo', 'Nuevo ticket', vista === 'nuevo')),
    h(ui.Button, { variant: 'ghost', size: 'sm', onClick: onSalir }, 'Salir'),
  )
}

// ================================================================== acceso (DNI + código de un solo uso)
function Acceso({ datos, onEntrar }: { datos: Datos; onEntrar: (c: Cliente) => void }) {
  const [paso, setPaso] = useState<'dni' | 'codigo'>('dni')
  const [dni, setDni] = useState('')
  const [codigo, setCodigo] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [emitido, setEmitido] = useState<{ valor: string; en: number; intentos: number } | null>(null)
  const sim = nucleo.sim()
  const sigdaCaido = sim.sigdaCaido || datos.fuentesCaidas.includes('SIGDA')
  // clientes de prueba: uno con un ticket esperando su respuesta, otro con una solución por confirmar y el del 360
  const dePrueba = useMemo(() => {
    // se prefieren tickets comunes: los reclamos y quejas siguen su propio camino en el Libro de Reclamaciones
    const por = (estado: string) => {
      const de = datos.tickets.filter((t) => t.estado === estado && t.clienteId.startsWith('cli-0'))
      return (de.find((t) => t.tipo !== 'REC' && t.tipo !== 'QUE') ?? de[0])?.clienteId
    }
    return [[por('PENDING_CUSTOMER'), 'tiene un ticket esperando su respuesta'], [por('RESOLVED'), 'tiene una solución por confirmar'], ['cli-001', 'cliente del 360 del inicio']]
      .filter(([id]) => id).map(([id, por]) => ({ c: clientePorId(id!) as Cliente, por: por! })).filter((x) => x.c)
  }, [datos.tickets])

  useEffect(() => { if (paso === 'codigo') (document.querySelector('#pp-codigo') as HTMLElement | null)?.focus() }, [paso])

  const enviarCodigo = (ev?: Event) => {
    ev?.preventDefault()
    const e = validarDni(dni)
    if (e) return setError(e)
    if (sigdaCaido) return setError('No podemos validar tu identidad ahora: SIGDA/TAXON no responde. Inténtalo en unos minutos.')
    const c = buscarPorDni(clientes as Cliente[], dni)
    if (!c) return setError('No encontramos ese DNI entre los clientes de Aybar. Revisa el número.')
    setCliente(c); setEmitido({ valor: nuevoCodigo(), en: Date.now(), intentos: 0 }); setCodigo(''); setError(null); setPaso('codigo')
  }
  const entrar = (ev: Event) => {
    ev.preventDefault()
    if (!cliente || !emitido) return
    if (Date.now() - emitido.en > CODIGO.minutos * 60_000) return setError('El código venció. Pide uno nuevo.')
    if (emitido.intentos >= CODIGO.intentos) return setError('Agotaste los intentos. Pide un código nuevo.')
    if (codigo.trim() !== emitido.valor) {
      const quedan = CODIGO.intentos - emitido.intentos - 1
      setEmitido({ ...emitido, intentos: emitido.intentos + 1 })
      return setError(quedan > 0 ? `El código no coincide. Te ${quedan === 1 ? 'queda 1 intento' : `quedan ${quedan} intentos`}.` : 'El código no coincide y agotaste los intentos. Pide un código nuevo.')
    }
    onEntrar(cliente)
  }

  const cuerpo = paso === 'dni'
    ? h('form', { className: 'pt-pila', onSubmit: enviarCodigo, noValidate: true },
        h(ui.FormField, { label: 'DNI', required: true, error: error ?? undefined, helper: 'El que registraste en tu contrato con Aybar.' },
          h(ui.Input, { value: dni, inputMode: 'numeric', autoComplete: 'off', maxLength: 8, onChange: (e: any) => setDni(e.target.value.replace(/\D/g, '').slice(0, 8)) })),
        sigdaCaido ? h(ui.Alert, { tone: 'warning', size: 'sm', title: 'SIGDA/TAXON no responde' }, texto('Mientras tanto no se puede validar tu identidad. Lo simula «Herramientas › Simulación › fuentes caídas».')) : null,
        h('div', { className: 'pp-acciones' }, h(ui.Button, { type: 'submit', variant: 'primary' }, 'Enviarme el código')),
        h(Simulacion, { titulo: 'Clientes de prueba' },
          h('ul', null, dePrueba.map(({ c, por }) => h('li', { key: c.id },
            h(ui.Button, { size: 'sm', variant: 'secondary', onClick: () => { setDni(c.dni); setError(null) } }, `Usar ${c.dni}`),
            h('span', null, `${c.nombre}: ${por}.`))))),
      )
    : h('form', { className: 'pt-pila', onSubmit: entrar, noValidate: true },
        h('p', { className: 'pt-texto' }, 'Te enviamos un código de 6 dígitos a ', h('b', null, enmascararCorreo(cliente!.correo)), ' y por SMS a ', h('b', null, enmascararTelefono(cliente!.telefono)), `. Vence en ${CODIGO.minutos} minutos.`),
        h(ui.FormField, { label: 'Código de un solo uso', required: true, error: error ?? undefined, id: 'pp-codigo' },
          h(ui.Input, { value: codigo, inputMode: 'numeric', autoComplete: 'one-time-code', maxLength: 6, onChange: (e: any) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6)) })),
        h('div', { className: 'pp-acciones' },
          h(ui.Button, { type: 'submit', variant: 'primary' }, 'Entrar'),
          h(ui.Button, { variant: 'secondary', onClick: () => enviarCodigo() }, 'Enviarme otro código'),
          h(ui.Button, { variant: 'ghost', onClick: () => { setPaso('dni'); setError(null) } }, 'Cambiar de DNI')),
        h(Simulacion, null, h('span', null, 'En el prototipo no sale ningún correo ni SMS. El código es '), h('span', { className: 'pp-codigo' }, emitido!.valor)),
      )

  return h('div', { className: 'pp-acceso' },
    h(ui.Card, null,
      h(ui.CardHeader, { as: 'h1', title: 'Entra a Mi Portal', subtitle: 'Registra tus solicitudes y sigue tus tickets sin llamar.' }),
      h(ui.CardBody, null, cuerpo,
        h('p', { className: 'pp-etapa' }, 'Entras con tu DNI y un código de un solo uso; no necesitas contraseña.'))),
    h(Nota, null, `Supuesto: el código va al correo y al celular a la vez, vence a los ${CODIGO.minutos} minutos y admite ${CODIGO.intentos} intentos. Pregunta abierta del PLT-04: ¿al correo, al celular o a ambos?`),
  )
}

// ================================================================== mis tickets (HU-064 CA-02)
function MisTickets({ datos, cliente }: { datos: Datos; cliente: Cliente }) {
  const filas = ticketsDelCliente(datos, cliente.id)
  const columnas = [
    { key: 'numero', header: 'N.º de ticket', width: '9rem', renderCell: (t: Ticket) => h('button', { type: 'button', tabIndex: -1, className: 'pt-enlace-celda', onClick: () => ir(`portal/ticket/${t.id}`) }, t.numero) },
    { key: 'tipo', header: 'Tipo', width: '14rem', renderCell: (t: Ticket) => h('span', { className: 'pt-celda-doble' }, h('span', { className: 'pt-celda-doble__principal' }, nombreTipo(t.tipo)), t.subtipo ? h('span', { className: 'pt-celda-doble__secundaria' }, t.subtipo) : null) },
    { key: 'estado', header: 'Estado', width: '13rem', renderCell: (t: Ticket) => h(ui.Badge, { tone: ESTADO_CLIENTE[t.estado].tono, size: 'sm' }, ESTADO_CLIENTE[t.estado].texto) },
    { key: 'area', header: 'Área', renderCell: (t: Ticket) => areaCliente(t.area, nombreArea) },
    { key: 'compromiso', header: 'Fecha de compromiso', width: '10rem', renderCell: (t: Ticket) => fechaCorta(nucleo.compromiso(t)) },
    { key: 'registrado', header: 'Registrado', width: '9rem', renderCell: (t: Ticket) => fechaCorta(t.abierto) },
  ]
  const pendientes = filas.filter((t) => t.estado === 'PENDING_CUSTOMER' || t.estado === 'RESOLVED')
  const escritorio = usarMedia(DESDE_ESCRITORIO)
  const vacio = h(ui.EmptyState, { size: 'compact', title: 'Aún no tienes tickets', description: 'Cuando registres una solicitud, la verás aquí con su estado.', action: h(ui.Button, { variant: 'primary', onClick: () => ir('portal/nuevo') }, 'Registrar una solicitud') })
  return h(Fragmento, null,
    h(ui.PageHeader, {
      title: 'Mis tickets', description: 'Tus solicitudes a Aybar, de la más reciente a la más antigua. Toca el número para ver cómo va.',
      actions: h(ui.Button, { variant: 'primary', onClick: () => ir('portal/nuevo') }, 'Nuevo ticket'),
    }),
    pendientes.length
      ? h(ui.Alert, { tone: 'warning', size: 'sm', title: pendientes.length === 1 ? 'Un ticket te necesita' : `${pendientes.length} tickets te necesitan` },
          texto(pendientes.map((t) => `${t.numero}: ${ESTADO_CLIENTE[t.estado].texto.toLowerCase()}`).join(' · ')))
      : null,
    escritorio || !filas.length
      ? h(ui.Card, null, h(ui.CardBody, null, h(ui.DataGrid, { caption: `Tickets de ${cliente.nombre}`, columns: columnas, rows: filas, getRowId: (t: Ticket) => t.id, emptyState: vacio })))
      // en móvil, tarjetas como las de la bandeja (la tabla de 6 columnas no cabe)
      : h('ul', { className: 'pt-tarjetas', 'aria-label': `Tickets de ${cliente.nombre}` }, filas.map((t) => h('li', { key: t.id }, h(ui.Card, null, h(ui.CardBody, { padding: 'sm' }, h('div', { className: 'pt-tarjeta' },
          h('div', { className: 'pt-tarjeta__cabeza' }, h('a', { className: 'pt-tarjeta__numero', href: ruta(`portal/ticket/${t.id}`) }, t.numero), h(ui.Badge, { tone: ESTADO_CLIENTE[t.estado].tono, size: 'sm' }, ESTADO_CLIENTE[t.estado].texto)),
          h('p', { className: 'pt-tarjeta__resumen' }, `${nombreTipo(t.tipo)}${t.subtipo ? ` · ${t.subtipo}` : ''}`),
          h('p', { className: 'pt-texto-chico' }, `${areaCliente(t.area, nombreArea)} · compromiso ${fechaCorta(nucleo.compromiso(t))} · registrado ${fechaCorta(t.abierto)}`))))))),
    h(Nota, null, 'Se listan todos los tickets del cliente, entren por el canal que entren (teléfono, WhatsApp, correo o Mi Portal). Pregunta abierta: ¿se muestra el nombre del área o uno genérico? Aquí, el del área («Atención al cliente» para ATC).'),
  )
}

// ================================================================== nuevo ticket (HU-064 CA-01, 03, 04, 05)
function NuevoTicket({ datos, cliente }: { datos: Datos; cliente: Cliente }) {
  const lotes = lotesDe(cliente) as Lote[]
  const [loteId, setLoteId] = useState(lotes.length === 1 ? lotes[0]!.id : '')
  const [tipo, setTipo] = useState('')
  const [subtipo, setSubtipo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [archivos, setArchivos] = useState<Archivo[]>([])
  const [creado, setCreado] = useState<{ ticket: Ticket; resultado: 'asignado' | 'cola' } | null>(null)
  const accion = usarAccion()
  const errores = erroresPorCampo(accion.error)
  const t = TIPOS.find((x) => x.id === tipo)
  const lote = lotes.find((l) => l.id === loteId)
  const contrato = lote ? contratoDelLote(lote) : null
  const reiniciar = () => { setTipo(''); setSubtipo(''); setDescripcion(''); setArchivos([]); setCreado(null); accion.limpiar() }

  const enviar = async (ev: Event) => {
    ev.preventDefault()
    const entrada: Entrada = { loteId, tipo, subtipo, descripcion, adjuntos: aAdjuntos(archivos) }
    const r = await accion.ejecutar(() => nucleo.tx('registrar ticket desde Mi Portal', (d) => {
      if (!lote) throw nucleo.validacion([{ campo: 'lote', mensaje: 'Elige el lote o contrato sobre el que consultas.' }])
      return crearTicket(nucleo, d, cliente, lote, entrada)
    }))
    if (r) { setCreado(r); avisar({ message: `Registramos tu solicitud: ${r.ticket.numero}.`, tone: 'success' }) }
  }

  if (creado) {
    const tk = datos.tickets.find((x) => x.id === creado.ticket.id) ?? creado.ticket
    return h(Fragmento, null,
      h(ui.PageHeader, { title: 'Solicitud registrada', breadcrumb: h(ui.Breadcrumb, { items: [{ label: 'Mi Portal', href: ruta('portal') }, { label: 'Nuevo ticket' }] }) }),
      h(ui.Card, null, h(ui.CardBody, null, h('div', { className: 'pt-registrado' },
        h('p', { className: 'pt-texto-chico' }, 'Tu número de ticket'),
        h('p', { className: 'pt-registrado__numero', 'aria-live': 'polite' }, tk.numero),
        h('dl', { className: 'pp-resumen' },
          h('div', null, h('dt', null, 'Fecha de compromiso'), h('dd', null, fechaCorta(nucleo.compromiso(tk)))),
          h('div', null, h('dt', null, 'Área'), h('dd', null, areaCliente(tk.area, nombreArea))),
          h('div', null, h('dt', null, 'Canal'), h('dd', null, tk.canal))),
        h('p', { className: 'pt-texto-chico' }, creado.resultado === 'asignado'
          ? 'El flujo de tu tipo de solicitud ya lo asignó a un gestor. Te avisaremos por correo y WhatsApp en cada cambio.'
          : 'Quedó en la bandeja de atención hasta que un gestor lo tome. Te avisaremos por correo y WhatsApp en cada cambio.'),
        h('div', { className: 'pp-acciones' },
          h(ui.Button, { variant: 'primary', onClick: () => ir(`portal/ticket/${tk.id}`) }, 'Ver mi ticket'),
          h(ui.Button, { variant: 'secondary', onClick: reiniciar }, 'Registrar otra solicitud'))))),
      h(Nota, null, 'La fecha de compromiso es el vencimiento de resolución que se congela al registrar (política SLA vigente del tipo). El flujo del tipo (HU-043) decide el área y el gestor; sin flujo, el ticket queda en la bandeja.'),
    )
  }

  return h(Fragmento, null,
    h(ui.PageHeader, {
      title: 'Nuevo ticket', description: 'Cuéntanos qué necesitas. Te daremos un número de ticket y una fecha de compromiso.',
      breadcrumb: h(ui.Breadcrumb, { items: [{ label: 'Mi Portal', href: ruta('portal') }, { label: 'Nuevo ticket' }] }),
    }),
    h('div', { className: 'pp-rejilla' },
      h(ui.Card, null, h(ui.CardBody, null, h('form', { className: 'pt-pila', onSubmit: enviar, noValidate: true, 'aria-label': 'Registrar una solicitud' },
        h(ui.FormField, { label: '¿Sobre qué lote o contrato?', required: true, error: errores.lote },
          h(ui.Select, { value: loteId, placeholder: 'Elige uno', onChange: (e: any) => setLoteId(e.target.value), options: lotes.map((l) => ({ value: l.id, label: `${l.descripcion} · contrato ${l.contrato}` })) })),
        h(ui.RadioGroup, { legend: 'Tipo de solicitud', variant: 'card', error: errores.tipo },
          TIPOS.map((x) => h(ui.Radio, { key: x.id, name: 'pp-tipo', value: x.id, checked: tipo === x.id, label: x.nombre, helper: x.ayuda, onChange: () => { setTipo(x.id); setSubtipo('') } }))),
        t?.libro
          ? h(ui.Alert, { tone: 'warning', title: `${t.nombre}: se registra en el Libro de Reclamaciones`, live: 'polite' },
              h('div', { className: 'pp-legal' },
                h('p', null, 'Conforme al Código de Protección y Defensa del Consumidor, Aybar cuenta con un Libro de Reclamaciones a tu disposición. Un reclamo o una queja tiene plazo legal de respuesta y se registra allí, no como ticket común.'),
                h('p', null, 'Por eso aquí no se crea un ticket. Continúa en el Libro de Reclamaciones virtual; la respuesta te llegará por el medio que indiques.'),
                h('div', { className: 'pp-acciones' }, h(ui.Button, { variant: 'secondary', onClick: () => avisar({ message: 'El Libro de Reclamaciones virtual se abre aparte, fuera de Mi Portal.', tone: 'warning' }) }, 'Ir al Libro de Reclamaciones virtual'))))
          : null,
        t && !t.libro
          ? h(ui.FormField, { label: 'Detalle', required: true, error: errores.subtipo },
              h(ui.Select, { value: subtipo, placeholder: 'Elige el detalle', onChange: (e: any) => setSubtipo(e.target.value), options: t.subtipos.map((s) => ({ value: s, label: s })) }))
          : null,
        t && !t.libro
          ? h(ui.FormField, { label: 'Cuéntanos tu caso', required: true, error: errores.descripcion, helper: 'Qué pasó, desde cuándo y qué esperas de nosotros. No escribas contraseñas ni números de tarjeta.' },
              h(ui.Textarea, { value: descripcion, onChange: (e: any) => setDescripcion(e.target.value), rows: 4, autoResize: true, maxRows: 10, maxLength: 2000, showCounter: true }))
          : null,
        t && !t.libro
          ? h(ui.FileUpload, {
              label: 'Adjunta un archivo (opcional)', accept: ADJUNTOS.accept, multiple: true, maxFiles: ADJUNTOS.maxArchivos, maxSize: ADJUNTOS.maxBytes,
              requirements: ADJUNTOS.texto, files: archivos, error: errores.adjuntos, onFilesAdd: alSubir(setArchivos), onFileRemove: (id: string) => setArchivos((p) => p.filter((f) => f.id !== id)),
            })
          : null,
        accion.error && !Object.keys(errores).length ? h(ui.ErrorAccion, { error: accion.error, titulo: 'No pudimos registrar tu solicitud' }) : null,
        t && !t.libro ? h('div', { className: 'pp-acciones' }, h(ui.Button, { type: 'submit', variant: 'primary', loading: accion.enCurso }, 'Registrar mi solicitud')) : null,
      ))),
      h('aside', { className: 'pt-pila', 'aria-label': 'Tus datos' },
        h(ui.Card, null,
          h(ui.CardHeader, { as: 'h2', title: 'Tus datos', subtitle: 'Vienen de SIGDA/TAXON; no se copian a otro registro.' }),
          h(ui.CardBody, null, h('dl', { className: 'pp-datos' },
            h('dt', null, 'Nombre'), h('dd', null, cliente.nombre),
            h('dt', null, 'DNI'), h('dd', null, `••••${cliente.dni.slice(-4)}`),
            h('dt', null, 'Correo'), h('dd', null, enmascararCorreo(cliente.correo)),
            h('dt', null, 'Celular'), h('dd', null, enmascararTelefono(cliente.telefono)),
            h('dt', null, 'Razón social'), h('dd', null, contrato ? nucleo.empresa(contrato.empresaId)?.nombre ?? '—' : 'Según el lote que elijas'),
            h('dt', null, 'Línea'), h('dd', null, contrato?.linea ?? '—')),
            h('p', { className: 'pt-texto-chico' }, '¿Algo no está bien? Dínoslo en la descripción: lo corrige Atención al cliente en el maestro.')))),
    ),
    h(Nota, null, 'Supuesto: tipos y subtipos habilitados para el cliente (pregunta abierta del PLT-04).'),
    h(Nota, null, `Supuesto: adjuntos ${ADJUNTOS.texto} En el prototipo el archivo no se sube: se guarda su nombre, tamaño y tipo.`),
    t?.libro ? h(Nota, null, 'Texto del aviso legal provisional: lo valida Legal. El Libro de Reclamaciones desde Mi Portal está fuera del alcance de la HU-064.') : null,
    h(Nota, null, 'La razón social y la línea de negocio salen del contrato del lote (regla fija del prototipo por proyecto); el cliente no las elige. La prioridad la pone ATC (aquí, Media).'),
  )
}

// ================================================================== detalle (HU-065 y HU-066)
function Detalle({ datos, cliente, ticketId }: { datos: Datos; cliente: Cliente; ticketId: string }) {
  const t = ticketDelCliente(datos, cliente.id, ticketId)
  const registrado = useRef(false)
  // HU-065: el intento sobre un ticket ajeno queda en la auditoría (CA-04); el seguimiento propio emite su evento de analítica
  useEffect(() => {
    if (registrado.current) return
    registrado.current = true
    if (!t) registrarIntentoAjeno(nucleo, ticketId, cliente.id)
    else nucleo.aplicar((d) => nucleo.evento(d, 'portal_seguimiento', { ticket: t.numero, estado: t.estado }))
  }, [t, ticketId, cliente.id])
  if (!t) {
    return h(Fragmento, null,
      h(ui.ErrorState, {
        status: 404, scope: 'page', title: 'No encontramos ese ticket entre los tuyos',
        description: 'Revisa el enlace o entra a Mis tickets. Si el enlace es de otra persona, no podemos mostrarlo.',
        actions: h(ui.Button, { variant: 'primary', onClick: () => ir('portal') }, 'Ir a Mis tickets'),
      }),
      h(Nota, null, 'HU-065 CA-04: el intento de abrir un ticket ajeno no muestra nada (ni si existe) y queda en la bitácora de auditoría del prototipo.'),
    )
  }
  const est = ESTADO_CLIENTE[t.estado]
  const pasos = lineaDeTiempo(datos, t, nombreArea)
  const msgs = mensajes(datos, t)
  const avs = avisos(datos, t, cliente, `${location.origin}${location.pathname}${ruta(`portal/ticket/${t.id}`)}`)
  const compromiso = nucleo.compromiso(t)
  const ultimoPedido = [...msgs].reverse().find((m) => m.quien === 'Aybar')

  return h(Fragmento, null,
    h(ui.PageHeader, {
      title: `Ticket ${t.numero}`,
      breadcrumb: h(ui.Breadcrumb, { items: [{ label: 'Mi Portal', href: ruta('portal') }, { label: 'Mis tickets', href: ruta('portal') }, { label: t.numero }] }),
      meta: h(ui.Badge, { tone: est.tono }, est.texto),
      description: t.resumen,
    }),
    h('dl', { className: 'pp-resumen' },
      h('div', null, h('dt', null, 'Tipo'), h('dd', null, `${nombreTipo(t.tipo)}${t.subtipo ? ` · ${t.subtipo}` : ''}`)),
      h('div', null, h('dt', null, 'Área responsable'), h('dd', null, areaCliente(t.area, nombreArea))),
      h('div', null, h('dt', null, t.estado === 'CLOSED' ? 'Compromiso que tenía' : 'Fecha de compromiso'), h('dd', null, fechaCorta(compromiso))),
      h('div', null, h('dt', null, 'Registrado'), h('dd', null, fechaCorta(t.abierto))),
      h('div', null, h('dt', null, 'Empresa'), h('dd', null, nucleo.empresa(t.empresaId)?.nombre ?? '—'))),
    t.estado === 'PENDING_CUSTOMER' ? h(Responder, { ticket: t, cliente, pedido: ultimoPedido?.texto ?? null }) : null,
    t.estado === 'RESOLVED' ? h(Confirmar, { ticket: t, cliente }) : null,
    t.estado === 'CLOSED' && datos.encuestas.some((e) => e.ticketId === t.id && e.ciclo === t.reaperturas)
      ? h(ui.Alert, { tone: 'success', size: 'sm', title: 'Caso cerrado' }, texto('Te enviamos una encuesta corta sobre la atención. Tu opinión nos ayuda a mejorar.'))
      : null,
    h('div', { className: 'pp-rejilla' },
      h('div', { className: 'pt-pila' },
        h(ui.Card, null,
          h(ui.CardHeader, { as: 'h2', title: 'Seguimiento', subtitle: 'Cada paso de tu ticket, en el orden en que ocurrió.' }),
          h(ui.CardBody, null, h('ol', { className: 'ay-timeline ay-timeline--vertical', 'aria-label': 'Línea de tiempo del ticket' },
            pasos.map((p, i) => h('li', { key: p.id, className: 'ay-timeline__event', 'aria-current': i === pasos.length - 1 ? 'step' : undefined },
              h('span', { className: `ay-timeline__dot ay-timeline__dot--${p.tono}`, 'aria-hidden': 'true' }),
              h('div', { className: 'ay-timeline__body' },
                h('p', { className: 'ay-timeline__title' }, h('strong', null, p.titulo)),
                h('time', { className: 'ay-timeline__time', dateTime: p.fecha.toISOString() }, fechaCorta(p.fecha)),
                h('p', { className: 'pp-paso__area' }, `Área responsable: ${p.area}${i === pasos.length - 1 && t.estado !== 'CLOSED' ? ` · compromiso: ${fechaCorta(compromiso)}` : ''}`),
                p.detalle ? h('p', { className: 'pp-paso__det' }, p.detalle) : null)))))),
        h(ui.Card, null,
          h(ui.CardHeader, { as: 'h2', title: 'Mensajes', subtitle: 'Lo que nos escribimos sobre este ticket.' }),
          h(ui.CardBody, null, msgs.length
            ? h('ol', { className: 'pp-msgs', 'aria-label': 'Mensajes del ticket' }, msgs.map((m) => h('li', { key: m.id, className: 'pp-msg', 'data-quien': m.quien === 'Tú' ? 'cliente' : 'aybar' },
                h('div', { className: 'pp-msg__cab' }, h('b', null, m.quien === 'Tú' ? 'Tú escribiste' : 'Aybar respondió'), h('time', { dateTime: m.fecha.toISOString() }, fechaCorta(m.fecha))),
                h('p', null, m.texto),
                m.adjuntos.length ? h('ul', { className: 'pp-adjuntos', 'aria-label': 'Archivos adjuntos' }, m.adjuntos.map((a) => h(ui.FileItem, { key: a.nombre, name: a.nombre, size: a.tamano, type: a.tipo, status: 'ready' }))) : null)))
            : h(ui.EmptyState, { size: 'compact', title: 'Aún sin mensajes', description: 'Te avisaremos cuando te escribamos.' })))),
      h('aside', { className: 'pt-pila', 'aria-label': 'Avisos del ticket' },
        h(ui.Card, null,
          h(ui.CardHeader, { as: 'h2', title: 'Avisos que te enviamos', subtitle: 'Por correo y WhatsApp, en cada cambio de estado.' }),
          h(ui.CardBody, null, avs.length
            ? h('ul', { className: 'pp-avisos' }, avs.map((a) => h('li', { key: a.id },
                h('b', null, a.estado), h('span', null, a.texto),
                h('small', null, `${fechaCorta(a.fecha)} · ${a.canales.join(' y ')} · ${a.destino} · con enlace al ticket`))))
            : h('p', { className: 'pt-texto-chico' }, 'Todavía no cambió de estado.')))),
    ),
    h(Nota, null, 'HU-065 CA-03: no se muestran las notas internas, las notas de la bitácora escritas por ATC ni el nombre del gestor; del lado de Aybar se firma «Aybar».'),
    h(Nota, null, 'HU-065 CA-02 (simulado): los avisos por correo y WhatsApp se derivan de la bitácora de estados; el envío real lo hace el servicio de notificaciones.'),
    h(Nota, null, 'HU-066 CA-01: el prototipo no pausa el SLA mientras el ticket espera al cliente, así que «el SLA se reanuda» no tiene efecto visible aquí. Pendiente del modelo de SLA.'),
  )
}

function Responder({ ticket, cliente, pedido }: { ticket: Ticket; cliente: Cliente; pedido: string | null }) {
  const [respuesta, setRespuesta] = useState('')
  const [archivos, setArchivos] = useState<Archivo[]>([])
  const accion = usarAccion()
  const errores = erroresPorCampo(accion.error)
  const enviar = async (ev: Event) => {
    ev.preventDefault()
    const ok = await accion.ejecutar(async () => { await nucleo.tx('responder desde Mi Portal', (d) => responder(nucleo, d, ticket.id, cliente.id, respuesta, aAdjuntos(archivos))); return true })
    if (ok) { setRespuesta(''); setArchivos([]); avisar({ message: 'Enviamos tu respuesta. Tu ticket volvió a atención.', tone: 'success' }) }
  }
  return h(ui.Card, null,
    h(ui.CardHeader, { as: 'h2', title: 'Te necesitamos', subtitle: 'Responde lo que te pedimos para seguir con tu caso.' }),
    h(ui.CardBody, null, h('form', { className: 'pt-pila', onSubmit: enviar, noValidate: true, 'aria-label': 'Responder al gestor' },
      pedido ? h('blockquote', { className: 'pp-msg' }, h('div', { className: 'pp-msg__cab' }, h('b', null, 'Lo que te pedimos')), h('p', null, pedido)) : null,
      h(ui.FormField, { label: 'Tu respuesta', required: true, error: errores.respuesta },
        h(ui.Textarea, { value: respuesta, onChange: (e: any) => setRespuesta(e.target.value), rows: 3, autoResize: true, maxRows: 8, maxLength: 2000, showCounter: true })),
      h(ui.FileUpload, {
        label: 'Adjunta el documento pedido (opcional)', accept: ADJUNTOS.accept, multiple: true, maxFiles: ADJUNTOS.maxArchivos, maxSize: ADJUNTOS.maxBytes,
        requirements: ADJUNTOS.texto, files: archivos, error: errores.adjuntos, onFilesAdd: alSubir(setArchivos), onFileRemove: (id: string) => setArchivos((p) => p.filter((f) => f.id !== id)),
      }),
      accion.error && !Object.keys(errores).length ? h(ui.ErrorAccion, { error: accion.error, titulo: 'No pudimos enviar tu respuesta' }) : null,
      h('div', { className: 'pp-acciones' }, h(ui.Button, { type: 'submit', variant: 'primary', loading: accion.enCurso }, 'Enviar mi respuesta')))))
}

function Confirmar({ ticket, cliente }: { ticket: Ticket; cliente: Cliente }) {
  const [rechazando, setRechazando] = useState(false)
  const [motivo, setMotivo] = useState('')
  const accion = usarAccion()
  const errores = erroresPorCampo(accion.error)
  const limite = cierreAutomaticoDesde(nucleo, ticket)
  const hacer = async (nombre: string, fn: (d: Datos) => [Datos, void], aviso: string) => {
    const ok = await accion.ejecutar(async () => { await nucleo.tx(nombre, fn); return true })
    if (ok) avisar({ message: aviso, tone: 'success' })
  }
  return h(ui.Card, null,
    h(ui.CardHeader, { as: 'h2', title: '¿Se solucionó tu caso?', subtitle: 'Confírmalo para cerrar el ticket, o recházalo si no estás conforme.' }),
    h(ui.CardBody, null, h('div', { className: 'pt-pila' },
      rechazando
        ? h('form', { className: 'pt-pila', noValidate: true, 'aria-label': 'Rechazar la solución', onSubmit: (ev: Event) => { ev.preventDefault(); void hacer('rechazar la solución en Mi Portal', (d) => rechazar(nucleo, d, ticket.id, cliente.id, motivo), 'Reabrimos tu ticket con tu motivo. Lo revisa el área que lo atendió.') } },
            h(ui.FormField, { label: '¿Por qué no estás conforme?', required: true, error: errores.motivo, helper: 'Queda en la bitácora del ticket y lo lee el área que lo atendió.' },
              h(ui.Textarea, { value: motivo, onChange: (e: any) => setMotivo(e.target.value), rows: 3, autoResize: true, maxLength: 500, showCounter: true })),
            accion.error && !Object.keys(errores).length ? h(ui.ErrorAccion, { error: accion.error, titulo: 'No pudimos reabrir tu ticket' }) : null,
            h('div', { className: 'pp-acciones' },
              h(ui.Button, { type: 'submit', variant: 'danger', loading: accion.enCurso }, 'Rechazar la solución'),
              h(ui.Button, { variant: 'ghost', onClick: () => { setRechazando(false); accion.limpiar() } }, 'Volver')))
        : h(Fragmento, null,
            accion.error ? h(ui.ErrorAccion, { error: accion.error, titulo: 'No pudimos cerrar tu ticket' }) : null,
            h('div', { className: 'pp-acciones' },
              h(ui.Button, { variant: 'primary', loading: accion.enCurso, onClick: () => void hacer('confirmar la solución en Mi Portal', (d) => confirmar(nucleo, d, ticket.id, cliente.id), 'Gracias: cerramos tu ticket. Te enviamos una encuesta corta.') }, 'Sí, confirmar y cerrar'),
              h(ui.Button, { variant: 'secondary', onClick: () => { setRechazando(true); accion.limpiar() } }, 'No, rechazar la solución'))),
      limite ? h('p', { className: 'pt-texto-chico' }, `Si no respondes, el ticket se cierra solo al terminar el ${fechaDia(limite)} (${DIAS_CONFIRMACION} días hábiles después de resuelto) y te avisamos.`) : null,
      h(Simulacion, null,
        h('span', null, 'Para ver el cierre automático sin esperar el plazo:'),
        h('div', { className: 'pp-acciones' }, h(ui.Button, { size: 'sm', variant: 'secondary', onClick: () => void hacer('cierre automático de Mi Portal', (d) => cerrarSinRespuesta(nucleo, d, ticket.id, cliente.id), 'Simulado: el ticket se cerró solo y se avisó al cliente.') }, 'Simular que venció el plazo'))))),
    h(Nota, null, `Supuesto: ${DIAS_CONFIRMACION} días hábiles para confirmar antes del cierre automático (pregunta abierta del PLT-04).`),
  )
}
