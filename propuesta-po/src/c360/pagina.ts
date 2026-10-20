// Página «Consulta 360 del Cliente» (#/consulta360) con el diseño de la rama de Daniel (origin/prototipo-polar › vista-c360.ts y la
// cabecera de consola-atc.ts): mismos bloques, ventanas, textos y visor de contratos. El componente Angular se pasó a React con los
// componentes del artifact (@aybarcorp/ui 0.3.0, las mismas clases ay-* que @aybarcorp/ui-angular 0.3.0).
//
// 20-oct (b3-k): los datos y las reglas son los del mockup (src/c360/modelo.ts), como en la Consulta 360 del PO (pestaña Cliente
// del ticket y #/clientes/<id>): clientes del maestro, sus lotes, cuotas, tickets, correos, llamadas y documentos; los 16 datos con
// candado según el permiso del rol (HU-050 CA-02/05/07) y «no disponible» con la hora del intento si su fuente cae (simulación del
// mockup, CA-03); buscador de clientes del maestro con lista de coincidencias (HU-049 CA-01/03), excepción de DNI inexistente y de
// SIGDA caído (HU-050 CA-08, HU-051); «Llamar» registrado como interacción del ticket elegido (HU-049 CA-02); motor de José y
// búsqueda de documentos de la API del mockup, con su permiso, su auditoría y su aviso si no responden (HU-052, HU-053).
// Las redirecciones llevan siempre a datos del MISMO cliente (su ticket por canal, la Bandeja filtrada por su DNI, «Nuevo ticket»
// con él ya elegido) y solo a los módulos que el rol ve.
import { leerTokenRgb, montarGrafoDaniel, montarRed2D } from 'aybar:escenas'
import type { Estado2D } from '../three/red2d-daniel.ts'
import type { PulsoGrafo, VistaGrafo } from '../three/grafo360-daniel.ts'
import type { RGB } from '../three/comun.ts'
import {
  CONSULTAS_SEMANTICAS,
  FUENTES_360,
  NODOS_360,
  REDIRECCION_NODOS_360,
  TRAZABILIDAD_FUENTES_360,
  TRAZABILIDAD_NODOS_360,
  type AccionRedireccionNodo360,
  type Fuente360,
  type MetaTrazabilidad360,
  type NodoDato360,
} from './datos.ts'
import { VisorContrato, type PestanaContrato } from './contrato.ts'
import { inyectarEstilos } from './estilos.ts'
import { Avatar, Divider, Grid, Row, Stack, Texto, h, ui, useEffect, useRef, useState } from './kit.ts'
import {
  CONSULTAS_MOTOR,
  abierto,
  alternarFuente,
  api,
  avisar,
  cliente as clienteDe,
  clientesFrecuentes,
  codigoFuente,
  contratosDe,
  enBandeja,
  enmascarar,
  filtrarBandeja,
  iniciales,
  lotesDe,
  prepararInteresado,
  proyectoDe,
  puede as puedeRol,
  registrosEjemplo,
  seccionesDe,
  sintesis,
  ticketCon,
  unidadDe,
  usarModelo,
  vista360,
  type ClienteM,
  type ErrorModelo,
  type EstadoDato,
  type Vista,
} from './modelo.ts'

/** Módulos de nuestro prototipo a los que lleva un dato (las claves del permiso y de la navegación del shell). */
export type Modulo360 = 'bandeja' | 'detalle' | 'nuevo' | 'libro' | 'morosidad' | 'mesa' | 'garantias' | 'fest'

export interface PropsConsulta360 {
  usuario: string
  rol: string
  area?: string
  etiquetaRol: string
  /** ¿El rol ve ese módulo en el menú? */
  puede: (m: Modulo360) => boolean
  /** Navega al módulo; `detalle` abre el ticket por número y `nuevo` lleva al cliente del maestro (por DNI). */
  ir: (m: Modulo360, c: { numero?: string; nombre?: string; dni?: string }) => void
}

// Dato que se enfoca primero según el rol (perspectivas de Daniel: consola-atc.ts › nodoInicial360)
function nodoInicial(rol: string, area?: string): string {
  if (rol === 'SUPERVISOR') return 'ecta'
  if (rol === 'LEGAL_RECLAMOS' || rol === 'MESA_SGD') return 'expo'
  if (rol === 'COORDINADOR_CX') return 'tick'
  if (area === 'POSTVENTA') return 'gar' // «Mesa Postventa y Garantías»
  return 'lote'
}

// «sgd» de Daniel (Comité SGD y Morosidad) en nuestros módulos: lo financiero va a Resolución por morosidad; el riesgo legal, a la
// Mesa de Casos SGD
const MODULO_DESTINO: Record<string, (nodoId: string) => Modulo360> = {
  bandeja: () => 'bandeja',
  detalle: () => 'detalle',
  nuevo: () => 'nuevo',
  libro: () => 'libro',
  sgd: (id) => (id === 'expo' ? 'mesa' : 'morosidad'),
  garantias: () => 'garantias',
  evento: () => 'fest',
}

const OPCIONES_MODO = [
  { value: 'po3d', label: 'Grafo 3D' },
  { value: '2d', label: 'Grafo 2D' },
]
const OPCIONES_MOTOR = CONSULTAS_MOTOR.map((c) => ({ value: c.id, label: c.nombre }))
const SIN_TICKET = '__ninguno'

const trazabilidadFuente = (fuenteId: string): MetaTrazabilidad360 =>
  TRAZABILIDAD_FUENTES_360[fuenteId] ?? {
    hu: 'Consulta 360 en línea',
    rfRn: 'Integración en tiempo real sin copia local',
    entidadDep: fuenteId.toUpperCase(),
    inputReal: 'Consulta en línea sin copia local.',
  }
const trazabilidadNodo = (nodoId: string): MetaTrazabilidad360 =>
  TRAZABILIDAD_NODOS_360[nodoId] ?? {
    hu: 'Sección de ficha 360',
    rfRn: 'Consulta en tiempo real por perfil',
    entidadDep: 'Sistema de origen conectado',
    inputReal: 'Dato consultado en línea desde la fuente.',
  }
const obtenerRedireccionNodo = (nodoId: string): AccionRedireccionNodo360 =>
  REDIRECCION_NODOS_360[nodoId] ?? { etiqueta: 'Ir a Bandeja del Cliente', destino: 'bandeja', moduloNombre: 'Bandeja y Avance Diario' }
const nombreFuente = (id: string) => FUENTES_360.find((f) => f.id === id)?.nombre ?? id
const nombresFuentesDeNodo = (n: NodoDato360) => n.fuentes.map(nombreFuente).join(' + ')
const nodosDeFuente = (fuenteId: string) => NODOS_360.filter((n) => n.fuentes.includes(fuenteId))
const hora = (d: Date) => d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
const sinTilde = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()

interface Hit { titulo: string; fragmento: string; relevancia: number }
interface Aviso { tono: 'info' | 'success' | 'warning' | 'danger'; titulo: string; texto: string }
type Redireccion = { etiqueta: string; ir: () => void } | { motivo: string } | null

export function Consulta360Daniel(p: PropsConsulta360) {
  inyectarEstilos()
  const { datos, persona } = usarModelo()
  const secciones = seccionesDe(persona)
  const atiende = puedeRol('atender', persona.rol)

  const [modo, setModo] = useState<'po3d' | '2d'>('po3d')
  const [clienteId, setClienteId] = useState('cli-001')
  const [nodoSel, setNodoSel] = useState(() => nodoInicial(p.rol, p.area))
  const [fuenteInsp, setFuenteInsp] = useState<string | null>(null)
  const [fichaAbierta, setFichaAbierta] = useState(true)
  const [fichaDesplegada, setFichaDesplegada] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [explicacion, setExplicacion] = useState<Aviso | null>(null)
  const [hits, setHits] = useState<readonly Hit[]>([])
  const [sugerencias, setSugerencias] = useState<readonly string[]>([])
  const [coincidencias, setCoincidencias] = useState<{ q: string; lista: { cliente: ClienteM; criterio: string }[] } | null>(null)
  const [noEncontrado, setNoEncontrado] = useState<{ q: string } | null>(null)
  const [sigdaCaido, setSigdaCaido] = useState<{ q: string; texto: string } | null>(null)
  const [estadoConsulta, setEstadoConsulta] = useState('respuesta en 0.54 s · 8 fuentes en línea')
  const [encendidos, setEncendidos] = useState(NODOS_360.length)
  const [consultaMotorId, setConsultaMotorId] = useState(CONSULTAS_MOTOR[0]?.id ?? 'saldo')
  const [loteMotor, setLoteMotor] = useState('')
  const [respuestaMotor, setRespuestaMotor] = useState<Aviso | null>(null)
  const [consultandoMotor, setConsultandoMotor] = useState(false)
  const [llamada, setLlamada] = useState(false)
  const [segundos, setSegundos] = useState(0)
  const [ticketLlamada, setTicketLlamada] = useState('')
  const [llamando, setLlamando] = useState(false)
  const [visor, setVisor] = useState<{ abierto: boolean; codigo: string; pestana: PestanaContrato }>({ abierto: false, codigo: '', pestana: 'clausulas' })

  // ------------------------------------------------------------------ datos del cliente (modelo del mockup)
  const vista: Vista = vista360(datos, clienteId, persona) ?? vista360(datos, 'cli-001', persona)!
  const cli = vista.cliente
  const lotes = lotesDe(cli)
  const contratoPrincipal = lotes[0]?.contrato ?? '—'
  const nodoV = (id: string) => vista.nodos.find((n) => n.id === id)
  const caidas = vista.fuentes.filter((f) => f.caida).map((f) => f.id)
  // candado según el permiso del rol (la matriz de la 360 del PO); «no disponible» si cae alguna de sus fuentes (regla de Daniel:
  // con Cobranza caída, cuotas, cronograma, estado de cuenta y exposición muestran «no disponible» con la hora del intento)
  const estadoDe = (id: string): EstadoDato => {
    const v = nodoV(id)
    if (!v) return 'ok'
    if (v.estado === 'restringido') return 'restringido'
    return v.fuentes.some((f) => caidas.includes(f)) ? 'caido' : 'ok'
  }
  const vistaPagina: Vista = { ...vista, nodos: vista.nodos.map((n) => ({ ...n, estado: estadoDe(n.id) })) }
  const visibles = vista.nodos.filter((n) => n.estado !== 'restringido').length
  const nodoActual = NODOS_360.find((n) => n.id === nodoSel) ?? NODOS_360[0]!
  const fuenteInspeccionada: Fuente360 | null = fuenteInsp ? FUENTES_360.find((f) => f.id === fuenteInsp) ?? null : null
  const ticketsCli = datos.tickets.filter((t) => t.clienteId === cli.id).sort((a, b) => +b.abierto - +a.abierto)
  const abiertosCli = ticketsCli.filter(abierto)
  const verContrato = secciones.lotes
  const verFinanzas = secciones.cuotas
  const verContacto = estadoDe('cont') === 'ok'
  const verTickets = estadoDe('tick') === 'ok'

  // Referencias compartidas con la escena 3D (three/grafo360-daniel.ts) y la 2D (three/red2d-daniel.ts)
  const hostRef = useRef<HTMLDivElement | null>(null)
  const canvas3dRef = useRef<HTMLCanvasElement | null>(null)
  const canvas2dRef = useRef<HTMLCanvasElement | null>(null)
  const buscadorRef = useRef<HTMLDivElement | null>(null)
  const vistaRef = useRef<VistaGrafo | null>(null)
  const selRef = useRef<string>(nodoSel)
  const semRef = useRef<{ hits: unknown[] } | null>(null)
  const hoverRef = useRef<string | null>(null)
  const litRef = useRef<Set<string>>(new Set())
  const pulsosRef = useRef<PulsoGrafo[]>([])
  const t0Ref = useRef(0)
  const posRef = useRef<Record<string, { x: number; y: number; r: number }>>({})
  const estado2dRef = useRef<Estado2D | null>(null)
  const timerConsulta = useRef<ReturnType<typeof setTimeout> | null>(null)
  const acciones = useRef({ seleccionarNodo: (_id: string) => {}, inspeccionarFuente: (_id: string) => {} })

  const estadoNodo = (n: NodoDato360): { codigo: 'ok' | 'locked' | 'down'; tono: string; etiqueta: string } => {
    const e = estadoDe(n.id)
    if (e === 'restringido') return { codigo: 'locked', tono: 'warning', etiqueta: 'Restringido' }
    if (e === 'caido') return { codigo: 'down', tono: 'danger', etiqueta: 'No disponible' }
    return { codigo: 'ok', tono: 'success', etiqueta: 'En línea' }
  }
  const filasNodo = (nodoId: string): [string, string][] => {
    const base = nodoV(nodoId)?.filas ?? [['Sin registros', '—']]
    if (nodoId !== 'llam' && nodoId !== 'correos') return base
    // registros de ejemplo de Daniel (central telefónica y correo) asociados al cliente, junto a los del modelo
    const ej = registrosEjemplo(cli, nodoId)
    const reales = base.filter(([k]) => !/^Sin /.test(k))
    return reales.length || ej.length ? [...reales, ...ej] : base
  }
  const resumenDato = (nodoId: string) => filasNodo(nodoId)[0]?.[1] ?? '—'
  const candado = (texto: string, key?: string) =>
    h(ui.Badge, { key, size: 'sm', tone: 'warning' }, h(ui.Icono, { name: 'lock', size: 16 }), ` ${texto}`)

  selRef.current = nodoSel
  semRef.current = hits.length > 0 ? { hits: [...hits] } : null
  estado2dRef.current = {
    fuentes: FUENTES_360,
    nodos: NODOS_360.map((n) => ({ id: n.id, nombre: n.nombre, fuentes: n.fuentes, codigo: estadoNodo(n).codigo })),
    sel: nodoSel,
    caidas,
    cliente: { iniciales: iniciales(cli.nombre), lotes: verContrato ? lotes.map((l) => unidadDe(l.descripcion)) : [] },
  }

  // ------------------------------------------------------------------ acciones (las de VistaC360Component)
  const seleccionarNodo = (nodoId: string) => {
    setFuenteInsp(null)
    setNodoSel(nodoId)
    selRef.current = nodoId
    setFichaAbierta(true)
    setFichaDesplegada(true)
  }
  const inspeccionarFuente360 = (fuenteId: string) => {
    setFuenteInsp(fuenteId)
    const primerNodo = NODOS_360.find((n) => n.fuentes.includes(fuenteId))
    if (primerNodo) {
      setNodoSel(primerNodo.id)
      selRef.current = primerNodo.id
    }
    setFichaAbierta(true)
    setFichaDesplegada(true)
  }
  acciones.current = { seleccionarNodo, inspeccionarFuente: inspeccionarFuente360 }

  const abrirContrato = (codigo: string, pestana: PestanaContrato = 'clausulas') =>
    setVisor((v) => ({ abierto: true, codigo: codigo || v.codigo, pestana }))

  /** Adónde lleva un dato: siempre al MISMO cliente y solo a los módulos que el rol ve. */
  const redireccion = (nodoId: string): Redireccion => {
    const r = obtenerRedireccionNodo(nodoId)
    if (estadoDe(nodoId) === 'restringido') return { motivo: 'Dato restringido para tu rol: no lleva a otro módulo.' }
    if (r.destino === 'contrato') {
      if (!verContrato || !lotes.length) return null
      // alRedirigirDesde360: el cronograma y el saldo abren su pestaña; los documentos, las adendas
      const pestana: PestanaContrato = nodoId === 'crono' || nodoId === 'saldo' ? 'cronograma' : nodoId === 'docs' ? 'adendas' : 'clausulas'
      return { etiqueta: r.etiqueta, ir: () => abrirContrato(contratoPrincipal, pestana) }
    }
    const m = MODULO_DESTINO[r.destino]?.(nodoId) ?? 'bandeja'
    if (!p.puede(m)) return { motivo: `Tu rol no tiene acceso a ${r.moduloNombre}.` }
    if (m === 'detalle') {
      const k = ticketCon(datos, cli.id, nodoId === 'llam' ? 'Teléfono' : 'Correo')
      if (!k) return { motivo: 'El cliente no tiene tickets.' }
      return { etiqueta: `${k.con ? r.etiqueta : 'Abrir el último ticket del cliente'} ${k.t.numero}`, ir: () => p.ir('detalle', { numero: k.t.numero }) }
    }
    if (m === 'bandeja') {
      if (!ticketsCli.length) return { motivo: 'El cliente no tiene tickets.' }
      if (!enBandeja(datos, persona, cli.id)) return { motivo: 'Tu Bandeja solo muestra tus áreas y los tickets de este cliente son de otra: ábrelos desde «Tickets previos».' }
      return { etiqueta: r.etiqueta, ir: () => { filtrarBandeja(cli.dni); p.ir('bandeja', {}) } }
    }
    return { etiqueta: r.etiqueta, ir: () => p.ir(m, {}) }
  }
  const botonIr = (nodoId: string, variant: string) => {
    const r = redireccion(nodoId)
    return r && 'ir' in r ? B({ variant, onClick: r.ir }, `${r.etiqueta} →`) : null
  }
  const motivoNoIr = (nodoId: string) => {
    const r = redireccion(nodoId)
    return r && 'motivo' in r ? h(Texto, { as: 'p', estilo: 'subtitle', size: 'xs' }, r.motivo) : null
  }

  const limpiarBusqueda = () => {
    setExplicacion(null)
    setHits([])
    setSugerencias([])
    setCoincidencias(null)
  }
  const seleccionarCliente = (id: string) => {
    if (!id) return
    setNoEncontrado(null)
    setSigdaCaido(null)
    setCoincidencias(null)
    setClienteId(id)
    const c = clienteDe(id)
    const l = c ? lotesDe(c)[0] : undefined
    setLoteMotor(l?.id ?? '')
    setRespuestaMotor(null)
    setTicketLlamada('')
    setHits([])
    setSugerencias([])
    setVisor((v) => ({ ...v, codigo: '' }))
  }

  const dispararOleadaPulsosGrafo = (v: Vista) => {
    const fc = v.fuentes.filter((f) => f.caida).map((f) => f.id)
    const vg: VistaGrafo = {
      cliente: { nombre: v.cliente.nombre },
      fuentes: FUENTES_360.map((s) => ({ id: s.id, n: s.nombre, d: s.detalle, caida: fc.includes(s.id) })),
      nodos: NODOS_360.map((n) => ({ id: n.id, n: n.nombre, estado: v.nodos.find((x) => x.id === n.id)?.estado ?? 'ok', sem: n.semantico, fuentes: n.fuentes })),
    }
    vistaRef.current = vg
    litRef.current = new Set<string>()
    const latenciaDe = (fid: string) => (fc.includes(fid) ? 1200 : FUENTES_360.find((f) => f.id === fid)?.ms ?? 220)
    const nuevos: PulsoGrafo[] = []
    vg.fuentes.forEach((s) => nuevos.push({ a: 'c', b: s.id, t0: 0, dur: latenciaDe(s.id) * 0.55, src: s.id }))
    vg.nodos.forEach((d) => d.fuentes.forEach((sid) => {
      const ms = latenciaDe(sid)
      nuevos.push({ a: sid, b: d.id, t0: ms * 0.55, dur: ms * 0.45 + 120, src: sid, dst: d.id })
    }))
    pulsosRef.current = nuevos
    t0Ref.current = performance.now()
    const maxMs = Math.max(...vg.nodos.map((d) => Math.min(...d.fuentes.map(latenciaDe)))) + 120
    const n = fc.length
    // HU-050 CA-09: al pie, el tiempo de respuesta y cuántas fuentes respondieron
    const resumenFinal = `respuesta en ${(maxMs / 1000).toFixed(2)} s · ${n > 0 ? `${vg.fuentes.length - n} de ${vg.fuentes.length} fuentes respondieron` : `${vg.fuentes.length} fuentes en línea`}`
    setEstadoConsulta('consultando…')
    if (timerConsulta.current !== null) clearTimeout(timerConsulta.current)
    timerConsulta.current = setTimeout(() => {
      setEstadoConsulta(resumenFinal)
      setEncendidos(vg.nodos.filter((x) => x.estado === 'ok').length)
    }, maxMs + 140)
  }
  const oleada = () => dispararOleadaPulsosGrafo(vistaPagina)

  const alternarFallaFuente = (fuenteId: string) => alternarFuente(fuenteId, !caidas.includes(fuenteId))
  const restaurar = (ids: readonly string[]) => ids.forEach((id) => alternarFuente(id, false))
  const reintentarFuentesDeNodo = (n: NodoDato360) => restaurar(n.fuentes.filter((fid) => caidas.includes(fid)))

  // HU-053: documentos del cliente por significado (API del mockup: oculta los que el rol no ve; sin coincidencias, sugerencias)
  const buscarDocumentos = async (q: string) => {
    seleccionarNodo('docs')
    setHits([])
    setSugerencias([])
    const t0 = performance.now()
    try {
      const r = await api.buscarDocumentos(cli.id, q)
      const ms = Math.round(performance.now() - t0)
      setHits(r.resultados.map((x) => ({ titulo: x.documento.titulo, fragmento: x.fragmento, relevancia: x.relevancia })))
      setSugerencias(r.sugerencias)
      setExplicacion(r.resultados.length
        ? { tono: 'info', titulo: 'Búsqueda semántica documental por significado', texto: `Repositorio S3 / GLI: ${r.resultados.length} ${r.resultados.length === 1 ? 'documento relevante' : 'documentos relevantes'} de ${cli.nombre} para «${q}» en ${ms} ms, con su fragmento.` }
        : { tono: 'warning', titulo: 'Sin coincidencias relevantes', texto: `Ningún documento de ${cli.nombre} coincide por significado con «${q}». Prueba con palabras exactas: ${r.sugerencias.map((s) => `«${s}»`).join(', ') || 'el tipo de documento'}.` })
    } catch (e) {
      const err = e as ErrorModelo
      setExplicacion({ tono: err.status === 403 ? 'danger' : 'warning', titulo: err.status === 403 ? 'Documentos restringidos para tu rol' : 'Búsqueda de documentos no disponible', texto: err.message ?? 'No se pudo buscar.' })
    }
    oleada()
  }

  const aplicarConsultaSemantica = (q: string, nodoId: string, expl: string) => {
    setBusqueda(q)
    setCoincidencias(null)
    if (nodoId === 'docs') {
      void buscarDocumentos(q)
      return
    }
    seleccionarNodo(nodoId)
    setHits([])
    setSugerencias([])
    setExplicacion({ tono: 'info', titulo: 'Búsqueda semántica documental por significado', texto: expl })
    oleada()
  }

  const activarContingenciaNoEncontrado = (q = '') => {
    setNoEncontrado({ q })
    setCoincidencias(null)
    if (q) setBusqueda(`DNI ${q} (No registrado en SIGDA)`)
  }

  const ejecutarBusquedaSemantica = async (terminoExplicito?: string) => {
    const inp = buscadorRef.current?.querySelector<HTMLInputElement>('input[type="search"], input')
    const raw = (terminoExplicito ?? inp?.value ?? busqueda).trim()
    setBusqueda(raw)
    limpiarBusqueda()
    setSigdaCaido(null)
    const q = sinTilde(raw)
    if (!q) {
      setFichaAbierta(true)
      setFichaDesplegada(true)
      void api.consultar360(cli.id).catch(() => {})
      oleada()
      return
    }
    // consultas rápidas de Daniel y búsqueda por sección (nombre de un dato o de un sistema de origen)
    const cs = CONSULTAS_SEMANTICAS.find((it) => sinTilde(it.q) === q)
    if (cs) return aplicarConsultaSemantica(cs.q, cs.nodo, cs.explicacion)
    const nodoMatch = NODOS_360.find((n) => sinTilde(n.nombre) === q || n.id === q)
    if (nodoMatch) {
      seleccionarNodo(nodoMatch.id)
      oleada()
      return
    }
    const fuenteMatch = FUENTES_360.find((s) => sinTilde(s.nombre) === q || s.id === q)
    if (fuenteMatch) {
      inspeccionarFuente360(fuenteMatch.id)
      oleada()
      return
    }
    // HU-049: cliente del maestro SIGDA/TAXON por DNI, nombre, lote, N.º de ticket, código o teléfono
    setBuscando(true)
    const t0 = performance.now()
    try {
      const lista = await api.buscarClientes360(raw)
      const ms = Math.round(performance.now() - t0)
      if (lista.length === 1) {
        const r = lista[0]!
        seleccionarCliente(r.cliente.id)
        setBusqueda('')
        setExplicacion({ tono: 'success', titulo: 'Cliente encontrado en SIGDA/TAXON', texto: `${r.cliente.nombre} (DNI ${enmascarar(r.cliente.dni)}) por ${r.criterio.toLowerCase()} en ${ms} ms, con sus tickets y lotes.` })
        return
      }
      if (lista.length > 1) {
        setCoincidencias({ q: raw, lista })
        return
      }
      const digitos = raw.replace(/\D/g, '')
      if (/^\d{8}$/.test(digitos) && /^[\d\s.-]+$/.test(raw)) return activarContingenciaNoEncontrado(digitos)
      if (/^[\d\s+.-]+$/.test(raw) || /^[a-z]{2,4}-?\d/i.test(raw)) {
        setExplicacion({ tono: 'warning', titulo: 'Sin coincidencias en el maestro', texto: `Ningún cliente de SIGDA/TAXON coincide con «${raw}». Revisa el DNI, el teléfono o el N.º de ticket.` })
        return
      }
    } catch (e) {
      const err = e as ErrorModelo
      if (err.status === 503) {
        // HU-051 CA-02: SIGDA/TAXON no responde → aviso, ticket con datos mínimos y vinculación automática al volver
        setSigdaCaido({ q: raw, texto: err.message ?? 'SIGDA/TAXON no responde.' })
        if (/^[\d\s+.-]+$/.test(raw)) return
      } else {
        setExplicacion({ tono: 'danger', titulo: 'Búsqueda de clientes restringida', texto: err.message ?? 'Tu rol no busca clientes.' })
        return
      }
    } finally {
      setBuscando(false)
    }
    // HU-053: ningún cliente coincide → documentos del cliente por significado
    await buscarDocumentos(raw)
  }

  // HU-052: motor de José (API del mockup): no devuelve lo que el rol no ve y registra el intento; si no responde, avisa sin bloquear
  const ejecutarConsultaMotor = async () => {
    const lote = loteMotor || lotes[0]?.id || ''
    setConsultandoMotor(true)
    try {
      const r = await api.consultarMotor({ clienteId: cli.id }, consultaMotorId, lote)
      setRespuestaMotor({ tono: 'success', titulo: r.consulta, texto: `${r.texto} Respuesta del motor de José vía API · ${hora(r.fecha)}.` })
    } catch (e) {
      const err = e as ErrorModelo
      setRespuestaMotor(err.status === 503
        ? { tono: 'warning', titulo: 'Motor de consultas no disponible', texto: `${err.message ?? ''} La atención no se bloquea: continúa con el ticket y vuelve a consultar más tarde.` }
        : err.status === 403
          ? { tono: 'danger', titulo: 'Dato no disponible para tu rol', texto: err.message ?? 'El motor no devuelve ese dato para tu rol; el intento queda registrado.' }
          : { tono: 'warning', titulo: 'No se pudo consultar', texto: err.message ?? 'Revisa la consulta y el lote.' })
    } finally {
      setConsultandoMotor(false)
    }
  }

  // HU-049 CA-02: la llamada sale por el call center y queda como interacción del ticket elegido
  const ticketDeLlamada = ticketLlamada || abiertosCli[0]?.id || SIN_TICKET
  const llamar = async () => {
    setLlamando(true)
    try {
      const tk = ticketDeLlamada === SIN_TICKET ? null : ticketDeLlamada
      const r = await api.iniciarLlamada(cli.id, tk)
      const num = tk ? datos.tickets.find((t) => t.id === tk)?.numero : null
      avisar(`Llamada iniciada por el call center. Grabación ${r.grabacion}${num ? ` · queda como interacción del ticket ${num}` : ' · queda en la ficha del cliente'}.`, 'success')
      setSegundos(1)
      setLlamada(true)
    } catch (e) {
      avisar((e as ErrorModelo).message ?? 'No se pudo iniciar la llamada.', 'danger')
    } finally {
      setLlamando(false)
    }
  }

  const abrirNuevoTicketCliente = (c: ClienteM) => p.ir('nuevo', { nombre: c.nombre, dni: c.dni })
  const crearTicketContingencia = () => {
    prepararInteresado()
    p.ir('nuevo', {})
  }

  // ------------------------------------------------------------------ efectos
  // perspectiva del rol: al cambiar de rol se enfoca su dato inicial
  useEffect(() => {
    seleccionarNodo(nodoInicial(p.rol, p.area))
  }, [p.rol, p.area])

  // la consulta 360 del cliente (queda en la analítica; un rol sin permiso deja el intento en la auditoría) y su oleada de pulsos
  const claveCaidas = datos.fuentesCaidas.join(',')
  useEffect(() => {
    void api.consultar360(cli.id).catch(() => {})
  }, [cli.id, persona.id])
  useEffect(() => {
    oleada()
  }, [cli.id, claveCaidas, persona.id])

  // escena 3D (inicializarPoGrafo3D)
  useEffect(() => {
    const host = hostRef.current, canvas = canvas3dRef.current
    if (!host || !canvas) return
    const cache = new Map<string, RGB>()
    const colorToken = (token: string): RGB => {
      const prev = cache.get(token)
      if (prev) return prev
      const rgb = leerTokenRgb(token)
      cache.set(token, rgb)
      return rgb
    }
    const reducido = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    let desmontar: (() => void) | null = null
    try {
      desmontar = montarGrafoDaniel({
        canvas, host, color: colorToken, reducido,
        vista: vistaRef, sel: selRef, sem: semRef, hover: hoverRef, lit: litRef, pulsos: pulsosRef, t0: t0Ref, pos: posRef,
        alClickNodo: (id) => acciones.current.seleccionarNodo(id),
        alClickFuente: (id) => acciones.current.inspeccionarFuente(id),
      })
    } catch (e) {
      console.error('[grafo 3D]', e) // sin WebGL la página sigue (el 2D y las tarjetas funcionan)
    }
    return () => desmontar?.()
  }, [])

  // escena 2D (iniciarLoopCanvas + dibujarRedNeuronal)
  useEffect(() => {
    const canvas = canvas2dRef.current
    if (!canvas) return
    return montarRed2D({
      canvas, estado: estado2dRef,
      alClickNodo: (id) => acciones.current.seleccionarNodo(id),
      alClickFuente: (id) => acciones.current.inspeccionarFuente(id),
      alClickCliente: () => acciones.current.seleccionarNodo('kyc'),
    })
  }, [])

  // llamada CTI (cronómetro)
  useEffect(() => {
    if (!llamada) return
    const t = setInterval(() => setSegundos((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [llamada])
  useEffect(() => () => { if (timerConsulta.current !== null) clearTimeout(timerConsulta.current) }, [])

  // clic y hover sobre el lienzo 3D por la posición proyectada de cada esfera (alClickPoGrafo, alMoverMousePoGrafo)
  const xy = (ev: MouseEvent) => {
    const r = canvas3dRef.current!.getBoundingClientRect()
    return [ev.clientX - r.left, ev.clientY - r.top] as const
  }
  const alClickPoGrafo = (ev: MouseEvent) => {
    if (!canvas3dRef.current) return
    const [x, y] = xy(ev), pos = posRef.current
    let mejorNodo: string | null = null, mejorDist = 26
    for (const n of NODOS_360) {
      const q = pos[n.id]
      if (!q) continue
      const d = Math.hypot(q.x - x, q.y - y)
      if (d < mejorDist) { mejorDist = d; mejorNodo = n.id }
    }
    if (mejorNodo) return seleccionarNodo(mejorNodo)
    for (const s of FUENTES_360) {
      const q = pos[s.id]
      if (q && Math.hypot(q.x - x, q.y - y) < 26) return inspeccionarFuente360(s.id)
    }
    const pc = pos['c']
    if (pc && Math.hypot(pc.x - x, pc.y - y) < 32) seleccionarNodo('kyc')
  }
  const alMoverMousePoGrafo = (ev: MouseEvent) => {
    const canvas = canvas3dRef.current
    if (!canvas) return
    const [x, y] = xy(ev), pos = posRef.current
    let hallado: string | null = null, mejorDist = 26
    for (const n of NODOS_360) {
      const q = pos[n.id]
      if (!q) continue
      const d = Math.hypot(q.x - x, q.y - y)
      if (d < mejorDist) { mejorDist = d; hallado = n.id }
    }
    if (!hallado) for (const s of FUENTES_360) {
      const q = pos[s.id]
      if (q && Math.hypot(q.x - x, q.y - y) < 24) { hallado = s.id; break }
    }
    hoverRef.current = hallado
    canvas.style.cursor = hallado ? 'pointer' : 'default'
  }

  // ------------------------------------------------------------------ vista
  function B(props: Record<string, unknown>, texto: unknown) { return h(ui.Button, { size: 'sm', ...props }, texto) }
  const est = estadoNodo(nodoActual)
  const redirActual = obtenerRedireccionNodo(nodoActual.id)
  const pares = (nodoId: string) => filasNodo(nodoId).map(([k, v]) => [k, v])
  const paresTrazabilidadNodo = (nodoId: string) => {
    const t = trazabilidadNodo(nodoId)
    return [['Sistema de origen', t.entidadDep], ['Criterio', t.rfRn], ['Consulta en línea', t.inputReal]]
  }
  const paresFuente = (src: Fuente360) => {
    const t = trazabilidadFuente(src.id)
    return [['Plataforma', t.entidadDep], ['Integración', t.rfRn], ['Consulta en línea', t.inputReal]]
  }
  const accionesFicha = (badges: unknown[]) => h(Row, { gap: '2', ajuste: true },
    ...badges,
    B({ variant: 'ghost', onClick: () => setFichaDesplegada(!fichaDesplegada) }, fichaDesplegada ? 'Contraer' : 'Desplegar'),
    B({ variant: 'ghost', 'aria-label': 'Cerrar ficha', onClick: () => setFichaAbierta(false) }, 'Cerrar'))
  const botonFalla = (id: string, caida: boolean) => codigoFuente(id)
    ? B({ variant: caida ? 'primary' : 'danger', onClick: () => alternarFallaFuente(id) }, caida ? 'Restaurar fuente en línea' : 'Probar desconexión')
    : h(Texto, { estilo: 'subtitle', size: 'xs' }, 'Sistema interno: su caída no se simula.')

  const fichaFuente = (src: Fuente360) => {
    const caida = caidas.includes(src.id)
    return h('div', { className: 'pl-atc-ficha-flotante', role: 'dialog', 'aria-modal': 'false', 'aria-label': `Sistema de origen ${src.nombre}` },
      h(ui.Card, null,
        h(ui.CardHeader, {
          title: `Sistema: ${src.nombre}`, subtitle: `${src.detalle} · ${trazabilidadFuente(src.id).hu}`, as: 'h3',
          actions: accionesFicha([
            h(ui.Badge, { key: 'e', size: 'sm', tone: caida ? 'danger' : 'success' }, caida ? 'Sin respuesta' : 'En línea'),
            h(ui.Badge, { key: 'l', size: 'sm', tone: 'info' }, `Latencia ${src.ms} ms`),
          ]),
        }),
        fichaDesplegada ? h(ui.CardBody, null,
          h(Stack, { gap: '3' },
            h(ui.CardPairs, { pairs: paresFuente(src) }),
            h(Stack, { gap: '1' },
              h(Texto, { estilo: 'label', size: 'xs' }, `Secciones alimentadas por ${src.nombre}`),
              h(Row, { gap: '2', ajuste: true },
                nodosDeFuente(src.id).map((nd) => B({ key: nd.id, variant: nodoSel === nd.id ? 'primary' : 'secondary', onClick: () => seleccionarNodo(nd.id) }, nd.nombre)))),
            h(Divider, { espaciado: 'sm' }),
            h(Row, { gap: '2', ajuste: true },
              botonFalla(src.id, caida),
              B({ variant: 'ghost', onClick: () => setFuenteInsp(null) }, 'Ver nodo actual')))) : null))
  }

  const coincidenciasDocs = () => hits.length > 0
    ? h(ui.Card, { key: 's' },
      h(ui.CardHeader, { title: 'Coincidencias semánticas', as: 'h4' }),
      h(ui.CardBody, null,
        h(Stack, { gap: '2' },
          hits.map((x) => h(Row, { key: x.titulo, gap: '2', ajuste: true },
            h(ui.Badge, { size: 'sm', tone: 'info' }, `${x.relevancia}%`),
            h(Texto, { as: 'strong', estilo: 'title', size: 'xs' }, x.titulo),
            h(Texto, { estilo: 'subtitle', size: 'xs' }, `«${x.fragmento}»`))))))
    : sugerencias.length > 0
      ? h(Stack, { key: 's', gap: '1' },
        h(Texto, { estilo: 'label', size: 'xs' }, 'Sin coincidencias relevantes. Busca por palabras exactas:'),
        h(Row, { gap: '2', ajuste: true },
          sugerencias.map((s) => B({ key: s, variant: 'ghost', onClick: () => { setBusqueda(s); void buscarDocumentos(s) } }, `«${s}»`))))
      : null

  const fichaNodo = () =>
    h('div', { className: 'pl-atc-ficha-flotante', role: 'dialog', 'aria-modal': 'false', 'aria-label': `Nodo 360 ${nodoActual.nombre}` },
      h(ui.Card, null,
        h(ui.CardHeader, {
          title: nodoActual.nombre, subtitle: `${trazabilidadNodo(nodoActual.id).hu} · ${cli.nombre}`, as: 'h3',
          actions: accionesFicha([
            est.codigo === 'locked' ? candado(est.etiqueta, 'e') : h(ui.Badge, { key: 'e', size: 'sm', tone: est.tono }, est.etiqueta),
            h(ui.Badge, { key: 'o', size: 'sm', tone: 'info' }, `Origen: ${nombresFuentesDeNodo(nodoActual)}`),
          ]),
        }),
        fichaDesplegada ? h(ui.CardBody, null,
          h(Stack, { gap: '3' },
            est.codigo === 'locked'
              ? h(ui.Alert, { tone: 'warning', title: h('span', { className: 'pt-en-linea' }, h(ui.Icono, { name: 'lock', size: 16 }), ' Acceso restringido por perfil') },
                `Tu perfil (${p.etiquetaRol}) no tiene acceso a este dato reservado. Cambia de perfil a Supervisor o Legal en Herramientas › Ver como para visualizarlo.`)
              : est.codigo === 'down'
                ? h(ui.Alert, {
                  tone: 'danger', title: 'Fuente no disponible temporalmente',
                  actions: B({ variant: 'secondary', onClick: () => reintentarFuentesDeNodo(nodoActual) }, 'Reintentar'),
                }, `${nodoActual.fuentes.filter((fid) => caidas.includes(fid)).map(nombreFuente).join(', ')} no responde en este instante (intento a las ${hora(datos.ahora)}). Las demás secciones siguen activas.`)
                : [
                  // HU-053: las coincidencias (o las sugerencias por palabras exactas) arriba, antes de la lista de documentos
                  nodoActual.semantico ? coincidenciasDocs() : null,
                  h(ui.CardPairs, { key: 'p', pairs: pares(nodoActual.id) }),
                  h(Texto, { key: 'l', estilo: 'subtitle', size: 'xs' }, `Consulta en línea, sin copiar el dato · ${hora(datos.ahora)}`),
                  nodoActual.id === 'tick' && ticketsCli.length
                    ? h(Row, { key: 't', gap: '2', ajuste: true },
                      ticketsCli.slice(0, 4).map((t) => B({ key: t.id, variant: 'ghost', onClick: () => p.ir('detalle', { numero: t.numero }) }, `Abrir ticket ${t.numero} →`)))
                    : null,
                ],
            h(Divider, { espaciado: 'sm' }),
            h(ui.CardPairs, { pairs: paresTrazabilidadNodo(nodoActual.id) }),
            h(Row, { gap: '2', ajuste: true },
              botonIr(nodoActual.id, 'primary'),
              redirActual.destino !== 'contrato' && verContrato && lotes.length ? B({ variant: 'secondary', onClick: () => abrirContrato(contratoPrincipal) }, `Contrato ${contratoPrincipal}`) : null,
              p.puede('nuevo') ? B({ variant: 'secondary', onClick: () => abrirNuevoTicketCliente(cli) }, '+ Crear ticket') : null),
            motivoNoIr(nodoActual.id))) : null))

  // HU-049 CA-03: varias coincidencias → lista con DNI parcial y lote para elegir
  const listaCoincidencias = coincidencias
    ? h(ui.Card, null,
      h(ui.CardHeader, {
        title: `${coincidencias.lista.length} clientes coinciden con «${coincidencias.q}»`, subtitle: 'Maestro SIGDA/TAXON · elige al cliente correcto por su DNI parcial y su lote', as: 'h4',
        actions: B({ variant: 'ghost', onClick: () => setCoincidencias(null) }, 'Cerrar'),
      }),
      h(ui.CardBody, null,
        h(Stack, { gap: '2', role: 'list', 'aria-label': 'Clientes que coinciden' },
          coincidencias.lista.map((r) => h(Row, { key: r.cliente.id, gap: '2', ajuste: true, justificar: 'between', role: 'listitem' },
            h(Row, { gap: '2', ajuste: true },
              h(Texto, { as: 'strong', estilo: 'title', size: 'xs' }, r.cliente.nombre),
              h(ui.Badge, { size: 'sm', tone: 'info' }, `DNI ${enmascarar(r.cliente.dni)}`),
              h(ui.Badge, { size: 'sm', tone: 'neutral' }, r.cliente.proyectos.join(' / ')),
              h(Texto, { estilo: 'subtitle', size: 'xs' }, `por ${r.criterio.toLowerCase()}`)),
            B({ variant: 'secondary', onClick: () => { seleccionarCliente(r.cliente.id); setBusqueda('') } }, 'Elegir'))))))
    : null

  const frecuentes = clientesFrecuentes(datos)
  const columnaGrafo = h(ui.Card, null,
    h(ui.CardBody, null,
      h(Stack, { gap: '3' },
        // buscador unificado de cliente o documento por significado
        h('div', { className: 'ay-row ay-row--2 ay-row--wrap', role: 'search', ref: buscadorRef },
          h(ui.SearchInput, {
            label: 'Buscar cliente o documento (DNI, nombre, lote, N.º de ticket, sección 360 o consulta en lenguaje natural)', size: 'sm', debounce: 0,
            value: busqueda,
            onValueChange: (v: string) => { setBusqueda(v); if (!v.trim()) limpiarBusqueda() },
            onSearch: (v: string) => void ejecutarBusquedaSemantica(v),
            placeholder: 'Ej. María, 94841786, Villa Sol II, AIN-000486, adenda de cambio de lote, carta notarial…',
          }),
          B({ variant: 'primary', loading: buscando, onClick: () => void ejecutarBusquedaSemantica() }, 'Consultar'),
          h(ui.SegmentedControl, {
            label: 'Modo de visualización 360', size: 'sm', options: OPCIONES_MODO, value: modo,
            onValueChange: (v: string) => {
              if (v === 'po3d' || v === '2d') {
                setModo(v)
                requestAnimationFrame(() => window.dispatchEvent(new Event('resize')))
              }
            },
          })),
        listaCoincidencias,
        // clientes frecuentes y consultas semánticas rápidas
        h(Row, { gap: '2', ajuste: true, 'aria-label': 'Clientes frecuentes y búsquedas por significado' },
          h(Texto, { estilo: 'label', size: 'xs' }, 'Clientes:'),
          frecuentes.map((c) => B({ key: c.id, variant: cli.id === c.id ? 'primary' : 'secondary', onClick: () => seleccionarCliente(c.id) }, c.nombre)),
          h(Texto, { estilo: 'label', size: 'xs' }, 'Búsqueda semántica:'),
          CONSULTAS_SEMANTICAS.map((cs) => B({ key: cs.q, variant: 'ghost', onClick: () => aplicarConsultaSemantica(cs.q, cs.nodo, cs.explicacion) }, `«${cs.q}»`))),
        // escena: grafo 3D, grafo 2D y ficha flotante del nodo o sistema elegido
        h('div', { className: 'pt-escena-wrap' },
          h('div', { ref: hostRef, className: 'pt-escena-grafo', hidden: modo !== 'po3d' },
            h('canvas', {
              ref: canvas3dRef, role: 'img',
              'aria-label': `Red de consulta 360 de ${cli.nombre}: ${FUENTES_360.length} sistemas de origen y ${NODOS_360.length} datos.`,
              onClick: (e: { nativeEvent: MouseEvent }) => alClickPoGrafo(e.nativeEvent),
              onMouseMove: (e: { nativeEvent: MouseEvent }) => alMoverMousePoGrafo(e.nativeEvent),
              onMouseLeave: () => { hoverRef.current = null },
            })),
          h('canvas', { ref: canvas2dRef, className: 'atc-astra-canvas', hidden: modo !== '2d', role: 'img', 'aria-label': `Red de consulta 360 de ${cli.nombre} en 2D.` }),
          fichaAbierta ? (fuenteInspeccionada ? fichaFuente(fuenteInspeccionada) : fichaNodo()) : null),
        // leyenda y telemetría
        h(Row, { gap: '2', ajuste: true, justificar: 'between' },
          h(Row, { gap: '2', ajuste: true },
            h(ui.Tag, { variant: 'outline', dotColor: 'var(--aybar-color-secondary-400)' }, 'Cliente'),
            h(ui.Tag, { variant: 'outline', dotColor: 'var(--aybar-color-primary-500)' }, `Sistema de origen (${FUENTES_360.length - caidas.length}/${FUENTES_360.length})`),
            h(ui.Tag, { variant: 'outline', dotColor: 'var(--aybar-color-fg-link)' }, `Dato del cliente (${encendidos}/${NODOS_360.length})`),
            h(ui.Tag, { variant: 'outline', dotColor: 'var(--aybar-color-feedback-danger-border)' }, 'Restringido / sin conexión')),
          h(Row, { gap: '2', ajuste: true },
            h(Texto, { estilo: 'label', size: 'xs', role: 'status', 'aria-live': 'polite' }, estadoConsulta),
            h(ui.Badge, { size: 'sm', tone: 'info' }, 'Consulta en línea (< 2 s)'))))))

  const badgeDato = (nodoId: string, texto: string) => {
    const e = estadoDe(nodoId), nombre = NODOS_360.find((n) => n.id === nodoId)?.nombre ?? nodoId
    return e === 'restringido' ? candado(nombre) : e === 'caido' ? h(ui.Badge, { size: 'sm', tone: 'danger' }, `${nombre}: no disponible`) : h(ui.Badge, { size: 'sm', tone: 'neutral' }, texto)
  }
  const columnaDerecha = h('aside', { className: 'ay-stack ay-stack--3', style: { gridColumn: 'span 1' }, 'aria-label': 'Cliente, controles y navegación rápida' },
    // 1. resumen del cliente en el maestro (HU-050 CA-05)
    h(ui.Card, null,
      h(ui.CardHeader, {
        title: cli.nombre, subtitle: `DNI ${enmascarar(cli.dni)} · ${[...new Set(cli.proyectos.map(proyectoDe))].join(', ')}${verContrato ? ` · Contrato ${contratoPrincipal}` : ''}`, as: 'h3',
        actions: h(ui.Badge, { size: 'sm', tone: estadoDe('kyc') === 'caido' ? 'danger' : 'success' }, estadoDe('kyc') === 'caido' ? 'SIGDA no disponible' : 'Maestro SIGDA'),
      }),
      h(ui.CardBody, null,
        h(Stack, { gap: '3' },
          h(Row, { gap: '2', ajuste: true },
            badgeDato('lote', `Lotes ${lotes.length}`),
            badgeDato('cuotas', `Cuotas vencidas: ${vista.venc}`),
            badgeDato('tick', `Tickets ${vista.nTk}`),
            badgeDato('expo', `Exposición: ${resumenDato('expo')}`),
            h(ui.Tag, { variant: 'outline', size: 'sm' }, `Datos visibles ${visibles} de ${vista.nodos.length}`)),
          h(Row, { gap: '2', ajuste: true },
            verContrato && lotes.length ? B({ variant: 'primary', onClick: () => abrirContrato(contratoPrincipal) }, `Ver contrato ${contratoPrincipal}`) : null,
            (() => {
              const r = redireccion('tick'), ult = ticketsCli[0]
              return r && 'ir' in r ? B({ variant: 'secondary', onClick: r.ir }, 'Tickets en Bandeja')
                : verTickets && ult ? B({ variant: 'secondary', onClick: () => p.ir('detalle', { numero: ult.numero }) }, `Último ticket ${ult.numero} →`) : null
            })())))),
    // 2. estado de los sistemas de origen (la simulación del mockup: lo ven todas las pantallas)
    h(ui.Card, null,
      h(ui.CardHeader, { title: 'Estado de sistemas de origen', subtitle: 'Monitoreo de disponibilidad y continuidad por fuente', as: 'h3' }),
      h(ui.CardBody, null,
        h(Row, { gap: '2', ajuste: true },
          B({ variant: caidas.length === 0 ? 'primary' : 'secondary', onClick: () => restaurar(caidas) }, 'Todas en línea'),
          FUENTES_360.map((s) => B({
            key: s.id, variant: caidas.includes(s.id) ? 'primary' : 'secondary', onClick: () => alternarFallaFuente(s.id),
            disabled: !codigoFuente(s.id), title: codigoFuente(s.id) ? undefined : 'Sistema interno: su caída no se simula',
          }, s.nombre))))),
    // 3. navegación rápida de nodos
    h(ui.Card, null,
      h(ui.CardHeader, { title: 'Nodos del Grafo 360 y Redirección', subtitle: 'Haz clic en un nodo para inspeccionarlo o redirigir a su módulo operativo', as: 'h3' }),
      h(ui.CardBody, null,
        h(Stack, { gap: '3' },
          h(Row, { gap: '2', ajuste: true },
            NODOS_360.map((nd) => B({
              key: nd.id, variant: nodoSel === nd.id && !fuenteInsp ? 'primary' : 'secondary', onClick: () => seleccionarNodo(nd.id),
              leadingIcon: estadoDe(nd.id) === 'restringido' ? h(ui.Icono, { name: 'lock', size: 16 }) : undefined,
              'aria-label': estadoDe(nd.id) === 'restringido' ? `${nd.nombre}: restringido` : estadoDe(nd.id) === 'caido' ? `${nd.nombre}: no disponible` : undefined,
            }, nd.nombre))),
          h(Row, { gap: '2', ajuste: true },
            botonIr(nodoActual.id, 'secondary'),
            B({ variant: 'ghost', onClick: () => { setFichaAbierta(!fichaAbierta); setFichaDesplegada(true) } }, fichaAbierta ? 'Ocultar ficha' : 'Mostrar ficha')),
          motivoNoIr(nodoActual.id)))))

  // síntesis por reglas locales sobre lo que el rol ve; contexto de atención con sus tickets
  const s = sintesis(vistaPagina, datos)
  const contexto = !verTickets
    ? 'Tu rol no ve los tickets del cliente.'
    : abiertosCli.length
      ? `${abiertosCli.length} ${abiertosCli.length === 1 ? 'ticket abierto' : 'tickets abiertos'}: ${abiertosCli[0]!.numero} · ${abiertosCli[0]!.resumen}.`
      : ticketsCli.length ? `Sin tickets abiertos; el último fue ${ticketsCli[0]!.numero} · ${ticketsCli[0]!.resumen}.` : 'Primer contacto: el cliente no tiene tickets.'
  const opcionesLlamada = [
    ...abiertosCli.map((t) => ({ value: t.id, label: `Ticket ${t.numero}` })),
    { value: SIN_TICKET, label: 'Sin ticket (solo en la ficha)' },
  ]
  const fichaCliente = h(ui.Card, null,
    h(ui.CardBody, null,
      h(Stack, { gap: '3' },
        h(Row, { gap: '4', ajuste: true, justificar: 'between' },
          h(Row, { gap: '3', ajuste: true },
            h(Avatar, { nombre: cli.nombre, size: 'lg' }),
            h(Stack, { gap: '1' },
              h(Row, { gap: '2', ajuste: true },
                h(Texto, { estilo: 'label', size: 'xs' }, `Clientes / ${cli.nombre}`),
                h(ui.Badge, { size: 'sm', tone: 'success' }, 'Titular verificado en SIGDA')),
              h(Row, { gap: '2', ajuste: true },
                h(Texto, { estilo: 'title', size: 'lg' }, cli.nombre),
                h(ui.Badge, { size: 'sm', tone: 'info' }, `DNI ${enmascarar(cli.dni)}`),
                verContacto ? h(ui.Badge, { size: 'sm', tone: 'neutral' }, cli.telefono) : null,
                verContacto ? h(ui.Badge, { size: 'sm', tone: 'neutral' }, cli.correo) : null,
                verContrato ? h(ui.Badge, { size: 'sm', tone: 'neutral' }, cli.proyectos.join(' · ')) : null,
                verContrato && lotes.length ? h(ui.Badge, { size: 'sm', tone: 'info' }, `Contrato ${contratoPrincipal}`) : null),
              h(Texto, { as: 'p', estilo: 'body', size: 'sm' }, h('strong', null, 'Contexto de atención:'), ' ', contexto))),
          h(Row, { gap: '2', ajuste: true },
            verContacto && atiende
              ? h(ui.Card, null,
                h(ui.CardBody, null,
                  h(Row, { gap: '3', ajuste: true },
                    h(Stack, { gap: '1' },
                      h(Texto, { estilo: 'label', size: 'xs' }, 'Central Telefónica CTI'),
                      h(Texto, { as: 'strong', estilo: 'mono', size: 'sm' }, cli.telefono),
                      !llamada
                        ? h(ui.Select, {
                          size: 'sm', 'aria-label': 'Registrar la llamada en', options: opcionesLlamada, value: ticketDeLlamada,
                          onChange: (e: { target: { value: string } }) => setTicketLlamada(e.target.value),
                        })
                        : null),
                    !llamada
                      ? B({ variant: 'primary', loading: llamando, onClick: () => void llamar() }, 'Llamar')
                      : [
                        h(ui.Badge, { key: 'b', size: 'sm', tone: 'success' }, `En llamada · ${String(Math.floor(segundos / 60)).padStart(2, '0')}:${String(segundos % 60).padStart(2, '0')}`),
                        B({ key: 'c', variant: 'danger', onClick: () => { setLlamada(false); seleccionarNodo('llam') } }, 'Colgar y guardar grabación'),
                      ])))
              : null,
            verContrato && lotes.length ? B({ variant: 'primary', onClick: () => abrirContrato(contratoPrincipal) }, `Ver contrato ${contratoPrincipal}`) : null,
            p.puede('nuevo') ? B({ variant: 'secondary', onClick: () => abrirNuevoTicketCliente(cli) }, '+ Crear ticket') : null,
            B({ variant: 'ghost', onClick: () => activarContingenciaNoEncontrado() }, 'Registrar Interesado no ubicado'))),
        h(ui.Alert, { tone: 'info', title: 'Síntesis Copiloto IA en tiempo real' },
          `${s.texto} — `, h('strong', null, 'Acción sugerida:'), ` ${s.accion}`))))

  const lotesMotor = verContrato ? lotes : []
  const consultasRapidas = h(ui.Card, null,
    h(ui.CardHeader, {
      title: 'Consultas rápidas en línea', subtitle: 'Respuestas instantáneas del motor de consultas por lote y contrato.', as: 'h3',
      actions: h(Row, { gap: '2', ajuste: true },
        B({ variant: 'primary', loading: consultandoMotor, disabled: !lotesMotor.length, onClick: () => void ejecutarConsultaMotor() }, 'Consultar ahora'),
        verContrato && lotes.length ? B({ variant: 'secondary', onClick: () => abrirContrato(contratoPrincipal) }, `Abrir contrato ${contratoPrincipal}`) : null),
    }),
    h(ui.CardBody, null,
      h(Stack, { gap: '3' },
        h(Grid, { columnas: 2, gap: 'md' },
          h(ui.FormField, { label: 'Tipo de consulta' },
            h(ui.Select, { size: 'sm', options: OPCIONES_MOTOR, value: consultaMotorId, onChange: (e: { target: { value: string } }) => { setConsultaMotorId(e.target.value); setRespuestaMotor(null) } })),
          h(ui.FormField, { label: 'Lote del cliente' },
            h(ui.Select, {
              size: 'sm', options: lotesMotor.length ? lotesMotor.map((l) => ({ value: l.id, label: l.descripcion })) : [{ value: '', label: 'Lotes restringidos para tu rol' }],
              value: loteMotor || lotesMotor[0]?.id || '',
              onChange: (e: { target: { value: string } }) => { setLoteMotor(e.target.value); setRespuestaMotor(null) },
            }))),
        respuestaMotor ? h(ui.Alert, { tone: respuestaMotor.tono, title: respuestaMotor.titulo }, respuestaMotor.texto) : null,
        h(Texto, { estilo: 'subtitle', size: 'xs' }, 'Consulta ejecutada en tiempo real contra los sistemas financieros e inmobiliarios con registro de auditoría.'))))

  const malla = h(ui.Card, null,
    h(ui.CardHeader, {
      title: `${NODOS_360.length} secciones de datos en línea de ${cli.nombre} (con redirección directa por nodo)`,
      subtitle: 'Haz clic en cualquier tarjeta para enfocarla en el Grafo 3D o usa el botón de redirección para ir a su módulo operativo', as: 'h3',
    }),
    h(ui.CardBody, null,
      h(Grid, { columnas: 4, gap: 'md' },
        NODOS_360.map((n) => {
          const e = estadoNodo(n), r = obtenerRedireccionNodo(n.id)
          return h(ui.Card, { key: n.id, variant: 'selectable', selected: nodoSel === n.id, onClick: () => seleccionarNodo(n.id) },
            h(ui.CardHeader, { title: n.nombre, subtitle: `Origen: ${nombresFuentesDeNodo(n)}`, as: 'h4', actions: e.codigo === 'locked' ? candado(e.etiqueta) : h(ui.Badge, { size: 'sm', tone: e.tono }, e.etiqueta) }),
            h(ui.CardBody, null,
              h(Stack, { gap: '2' },
                e.codigo === 'ok'
                  ? h(ui.CardPairs, { pairs: pares(n.id) })
                  : e.codigo === 'locked'
                    ? h(Texto, { as: 'p', estilo: 'subtitle', size: 'xs' }, `Tu perfil (${p.etiquetaRol}) no tiene acceso a «${n.nombre.toLowerCase()}». Solicítalo a tu supervisor ATC si lo requieres.`)
                    : h(Row, { gap: '2', ajuste: true, justificar: 'between' },
                      h(Texto, { estilo: 'subtitle', size: 'xs' }, `No se pudo consultar (intento a las ${hora(datos.ahora)}). Las demás secciones siguen disponibles.`),
                      B({ variant: 'secondary', onClick: (ev: { stopPropagation: () => void }) => { ev.stopPropagation(); reintentarFuentesDeNodo(n) } }, 'Reintentar')),
                h(Divider, { espaciado: 'sm' }),
                h(Row, { gap: '2', ajuste: true, justificar: 'between', onClick: (ev: { stopPropagation: () => void }) => ev.stopPropagation() },
                  h(Texto, { estilo: 'label', size: 'xs' }, r.moduloNombre),
                  botonIr(n.id, 'ghost')))))
        }))))

  const enLinea = FUENTES_360.length - caidas.length
  const contratos = visor.abierto ? contratosDe(datos, cli) : []
  return h('div', { className: 'pt-pagina pt-pagina--ancha pl-c360' },
    h(ui.PageHeader, {
      title: 'Consulta 360 del Cliente', size: 'md',
      breadcrumb: h(ui.Breadcrumb, { label: 'Ruta del módulo', items: [{ label: 'Aybar Atiende' }, { label: 'Núcleo 360 y Planta' }, { label: 'Consulta 360 del Cliente' }] }),
      meta: h(Row, { gap: '2', ajuste: true },
        h(ui.Badge, { tone: enLinea === FUENTES_360.length ? 'success' : 'warning', dot: true }, enLinea === FUENTES_360.length ? `En línea · ${FUENTES_360.length} sistemas` : `${enLinea} de ${FUENTES_360.length} sistemas en línea`),
        h(ui.Badge, { tone: 'info' }, `${p.usuario} (${p.etiquetaRol})`)),
      description: 'Ficha integral consolidada desde 8 sistemas en línea',
      actions: verContrato && lotes.length ? B({ variant: 'secondary', onClick: () => abrirContrato(visor.codigo || contratoPrincipal) }, `Visor de Contratos (${contratoPrincipal})`) : null,
    }),
    h(Stack, { gap: '4' },
      // 1. grafo 360 en 3D y 2D + lateral de inspección
      h(Grid, { columnas: 3, gap: 'md' },
        h('div', { style: { gridColumn: 'span 2' } }, columnaGrafo),
        columnaDerecha),
      // alertas de contingencia, disponibilidad de fuentes y búsqueda
      noEncontrado
        ? h(ui.Alert, {
          tone: 'warning', title: 'Cliente no ubicado en el maestro SIGDA — Registro como Interesado',
          actions: h(Row, { gap: '2', ajuste: true },
            p.puede('nuevo') ? B({ variant: 'primary', onClick: crearTicketContingencia }, 'Registrar ticket como Interesado') : null,
            B({ variant: 'ghost', onClick: () => { setNoEncontrado(null); setBusqueda('') } }, 'Volver a ficha 360')),
        }, `${noEncontrado.q ? `El DNI ${noEncontrado.q} no está en SIGDA/TAXON y aquí no se crea un registro paralelo del cliente. ` : 'No se encontró coincidencia para el documento consultado. '}Para preservar la integridad del maestro único, se registra como `,
        h('strong', null, 'Interesado en cola de conciliación'),
        p.puede('nuevo')
          ? ' con datos mínimos verificables y el ticket continúa su atención sin bloquear al cliente. Si atiendes un ticket, también puedes derivarlo desde su pestaña Cliente.'
          : '. Tu rol no registra tickets: pide a un gestor que lo registre como interesado.')
        : null,
      sigdaCaido
        ? h(ui.Alert, {
          tone: 'warning', title: 'SIGDA/TAXON no responde — continuidad de la atención',
          actions: h(Row, { gap: '2', ajuste: true },
            B({ variant: 'secondary', onClick: () => void ejecutarBusquedaSemantica(sigdaCaido.q) }, 'Reintentar'),
            p.puede('nuevo') ? B({ variant: 'primary', onClick: crearTicketContingencia }, 'Registrar ticket con datos mínimos') : null),
        }, `${sigdaCaido.texto} Puedes seguir atendiendo: registra el ticket con datos mínimos y, cuando SIGDA/TAXON vuelva, el sistema lo vincula al cliente y lo deja en su bitácora.`)
        : null,
      caidas.length > 0
        ? h(ui.Alert, {
          tone: 'warning', title: `Continuidad operativa activa — ${caidas.length} sistema(s) externo(s) sin respuesta`,
          actions: B({ variant: 'secondary', onClick: () => restaurar(caidas) }, 'Reintentar todos'),
        }, `La vista 360 mantiene operativas las ${FUENTES_360.length - caidas.length} fuentes restantes (los nodos del sistema sin conexión se marcan como «no disponible» mientras el resto de la ficha responde con normalidad).`)
        : null,
      explicacion ? h(ui.Alert, { tone: explicacion.tono, title: explicacion.titulo }, explicacion.texto) : null,
      // cabecera de la ficha del cliente + llamada CTI + síntesis
      fichaCliente,
      // sección inferior: consultas rápidas al motor + tarjetas por origen
      h(Row, { gap: '2', ajuste: true, justificar: 'between' },
        h(Texto, { estilo: 'subtitle', size: 'xs' },
          h('strong', null, 'Vista estructurada en tarjetas (consulta directa a las fuentes de origen):'),
          ' los datos se consultan en tiempo real sin duplicarse localmente.'),
        h(Row, { gap: '2', ajuste: true },
          h(ui.Badge, { size: 'sm', tone: 'neutral' }, estadoConsulta),
          h(ui.Badge, { size: 'sm', tone: 'info' }, 'Tiempo de respuesta < 2 s'))),
      consultasRapidas,
      malla),
    h(VisorContrato, {
      abierto: visor.abierto && contratos.length > 0, contratos, verFinanzas, codigo: visor.codigo || contratoPrincipal, pestana: visor.pestana,
      alElegir: (codigo: string) => setVisor((v) => ({ ...v, codigo })),
      alCambiarPestana: (pestana: PestanaContrato) => setVisor((v) => ({ ...v, pestana })),
      alCerrar: () => setVisor((v) => ({ ...v, abierto: false })),
      verBandeja: p.puede('bandeja') && enBandeja(datos, persona, cli.id) ? () => { setVisor((v) => ({ ...v, abierto: false })); filtrarBandeja(cli.dni); p.ir('bandeja', {}) } : undefined,
      irMorosidad: p.puede('morosidad') ? () => { setVisor((v) => ({ ...v, abierto: false })); p.ir('morosidad', {}) } : undefined,
    }))
}
