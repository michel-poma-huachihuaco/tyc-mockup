// Página «Consulta 360 del Cliente» (#/consulta360) igual que la de la rama de Daniel (origin/prototipo-polar › vista-c360.ts y la
// cabecera de consola-atc.ts): mismo diseño, textos, datos de ejemplo, ventanas, redirecciones y lógica. El componente Angular se
// pasó a React con los componentes del artifact (@aybarcorp/ui 0.3.0, las mismas clases ay-* que @aybarcorp/ui-angular 0.3.0).
//
// Lo que viene de nuestra sesión (lo pasa el shell, scripts/shell.js › __Consulta360): el usuario y su rol en la cabecera, el
// perfil 360 del rol (qué datos son restringidos y qué nodo se abre primero, como las perspectivas de Daniel), los permisos del
// menú (no se ofrece un botón a un módulo que el rol no ve) y la navegación a nuestras rutas.
import { leerTokenRgb, montarGrafoDaniel, montarRed2D } from 'aybar:escenas'
import type { Estado2D } from '../three/red2d-daniel.ts'
import type { PulsoGrafo, VistaGrafo } from '../three/grafo360-daniel.ts'
import type { RGB } from '../three/comun.ts'
import {
  CLIENTES_360,
  CONSULTAS_MOTOR_RAPIDAS,
  CONSULTAS_SEMANTICAS,
  FUENTES_360,
  NODOS_360,
  REDIRECCION_NODOS_360,
  TICKET_DETALLE_360,
  TRAZABILIDAD_FUENTES_360,
  TRAZABILIDAD_NODOS_360,
  type AccionRedireccionNodo360,
  type Cliente360,
  type Fuente360,
  type MetaTrazabilidad360,
  type NodoDato360,
} from './datos.ts'
import { VisorContrato, type PestanaContrato } from './contrato.ts'
import { inyectarEstilos } from './estilos.ts'
import { Avatar, Divider, Grid, Row, Stack, Texto, h, ui, useEffect, useRef, useState } from './kit.ts'

/** Módulos de nuestro prototipo a los que lleva un dato (las claves del permiso y de la navegación del shell). */
export type Modulo360 = 'bandeja' | 'detalle' | 'nuevo' | 'libro' | 'morosidad' | 'mesa' | 'garantias' | 'fest'
type Rol360 = 'gestor' | 'supervisor' | 'legal' | 'cx'

export interface PropsConsulta360 {
  usuario: string
  rol: string
  area?: string
  etiquetaRol: string
  /** ¿El rol ve ese módulo en el menú? */
  puede: (m: Modulo360) => boolean
  /** Navega al módulo; `detalle` busca el ticket por número y `nuevo` lleva al cliente si está en nuestro maestro. */
  ir: (m: Modulo360, c: { numero?: string; nombre?: string; dni?: string }) => void
}

// Perspectivas de Daniel (consola-atc.ts › perspectivasUsuarios: rol360 y nodoInicial360) según el rol de nuestra sesión
function perfil360(rol: string, area?: string): { rol: Rol360; nodo: string } {
  if (rol === 'SUPERVISOR') return { rol: 'supervisor', nodo: 'ecta' }
  if (rol === 'LEGAL_RECLAMOS' || rol === 'MESA_SGD') return { rol: 'legal', nodo: 'expo' }
  if (rol === 'COORDINADOR_CX') return { rol: 'cx', nodo: 'tick' }
  if (area === 'POSTVENTA') return { rol: 'supervisor', nodo: 'gar' } // «Mesa Postventa y Garantías»
  return { rol: 'gestor', nodo: 'lote' }
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
const OPCIONES_MOTOR = CONSULTAS_MOTOR_RAPIDAS.map((c) => ({ value: c.id, label: c.nombre }))

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
const correoCliente = (cli: Cliente360) => cli.datos['cont']?.[1]?.[1] ?? cli.datos['cont']?.[0]?.[1] ?? `${cli.k}@cliente.aybar.pe`
const filasNodoDe = (cli: Cliente360, nodoId: string) => cli.datos[nodoId] ?? [['Sin registros', '—'] as const]

interface Hit { titulo: string; fragmento: string; relevancia: number }

export function Consulta360Daniel(p: PropsConsulta360) {
  inyectarEstilos()
  const perfil = perfil360(p.rol, p.area)
  const rolActivo = perfil.rol

  const [modo, setModo] = useState<'po3d' | '2d'>('po3d')
  const [clienteKey, setClienteKey] = useState('eh')
  const [nodoSel, setNodoSel] = useState(perfil.nodo)
  const [fuenteInsp, setFuenteInsp] = useState<string | null>(null)
  const [fichaAbierta, setFichaAbierta] = useState(true)
  const [fichaDesplegada, setFichaDesplegada] = useState(true)
  const [caidas, setCaidas] = useState<readonly string[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [explicacion, setExplicacion] = useState('')
  const [hits, setHits] = useState<readonly Hit[]>([])
  const [noEncontrado, setNoEncontrado] = useState(false)
  const [estadoConsulta, setEstadoConsulta] = useState('respuesta en 0.54 s · 8 fuentes en línea')
  const [encendidos, setEncendidos] = useState(NODOS_360.length)
  const [consultaMotorId, setConsultaMotorId] = useState(CONSULTAS_MOTOR_RAPIDAS[0]!.id)
  const [loteMotor, setLoteMotor] = useState('C-07')
  const [respuestaMotor, setRespuestaMotor] = useState('')
  const [llamada, setLlamada] = useState(false)
  const [segundos, setSegundos] = useState(0)
  const [visor, setVisor] = useState<{ abierto: boolean; codigo: string; pestana: PestanaContrato }>({ abierto: false, codigo: 'VS-2025-0507', pestana: 'clausulas' })

  const cli = CLIENTES_360.find((c) => c.k === clienteKey) ?? CLIENTES_360[0]!
  const nodoActual = NODOS_360.find((n) => n.id === nodoSel) ?? NODOS_360[0]!
  const fuenteInspeccionada: Fuente360 | null = fuenteInsp ? FUENTES_360.find((f) => f.id === fuenteInsp) ?? null : null

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
    const rolPermiso = rolActivo === 'cx' ? 'supervisor' : rolActivo
    if (n.restringidoPara?.includes(rolPermiso)) return { codigo: 'locked', tono: 'warning', etiqueta: 'Restringido' }
    if (n.fuentes.some((fid) => caidas.includes(fid))) return { codigo: 'down', tono: 'danger', etiqueta: 'No disponible' }
    return { codigo: 'ok', tono: 'success', etiqueta: 'En línea' }
  }
  const filasNodo = (nodoId: string) => filasNodoDe(cli, nodoId)
  const resumenDato = (nodoId: string) => filasNodo(nodoId)[0]?.[1] ?? '—'

  selRef.current = nodoSel
  semRef.current = hits.length > 0 ? { hits: [...hits] } : null
  estado2dRef.current = {
    fuentes: FUENTES_360,
    nodos: NODOS_360.map((n) => ({ id: n.id, nombre: n.nombre, fuentes: n.fuentes, codigo: estadoNodo(n).codigo })),
    sel: nodoSel,
    caidas,
    cliente: { iniciales: cli.iniciales, lotes: cli.lotes },
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

  // destino de un dato en nuestros módulos (null = el visor de contratos de esta página)
  const moduloDe = (nodoId: string): Modulo360 | null => {
    const d = obtenerRedireccionNodo(nodoId).destino
    return d === 'contrato' ? null : (MODULO_DESTINO[d]?.(nodoId) ?? 'bandeja')
  }
  /** Si el rol ve el módulo del dato, se ofrece su botón; el visor de contratos está siempre en la página. */
  const puedeIr = (nodoId: string) => {
    const m = moduloDe(nodoId)
    return m === null || p.puede(m)
  }
  const ejecutarRedireccionNodo = (nodoId: string) => {
    const m = moduloDe(nodoId)
    if (m === null) {
      // alRedirigirDesde360: el cronograma y el saldo abren su pestaña; los documentos, las adendas
      abrirContrato(cli.contratoPrincipal, nodoId === 'crono' || nodoId === 'saldo' ? 'cronograma' : nodoId === 'docs' ? 'adendas' : 'clausulas')
      return
    }
    p.ir(m, { numero: TICKET_DETALLE_360[cli.k], nombre: cli.nombre, dni: cli.dni })
  }

  const seleccionarCliente = (k: string) => {
    if (!k) return
    setNoEncontrado(false)
    setClienteKey(k)
    const c = CLIENTES_360.find((x) => x.k === k)
    if (c?.lotes[0]) setLoteMotor(c.lotes[0])
    setRespuestaMotor('')
  }

  const dispararOleadaPulsosGrafo = (c: Cliente360, fc: readonly string[], rol: Rol360) => {
    const rolPermiso = rol === 'cx' ? 'supervisor' : rol
    const vista: VistaGrafo = {
      cliente: { nombre: c.nombre },
      fuentes: FUENTES_360.map((s) => ({ id: s.id, n: s.nombre, d: s.detalle, caida: fc.includes(s.id) })),
      nodos: NODOS_360.map((n) => {
        const restringido = Boolean(n.restringidoPara?.includes(rolPermiso))
        const caido = n.fuentes.some((fid) => fc.includes(fid))
        return { id: n.id, n: n.nombre, estado: restringido ? 'restringido' : caido ? 'caido' : 'ok', sem: n.semantico, fuentes: n.fuentes }
      }),
    }
    vistaRef.current = vista
    litRef.current = new Set<string>()
    const latenciaDe = (fid: string) => (fc.includes(fid) ? 1200 : FUENTES_360.find((f) => f.id === fid)?.ms ?? 220)
    const nuevos: PulsoGrafo[] = []
    vista.fuentes.forEach((s) => nuevos.push({ a: 'c', b: s.id, t0: 0, dur: latenciaDe(s.id) * 0.55, src: s.id }))
    vista.nodos.forEach((d) => d.fuentes.forEach((sid) => {
      const ms = latenciaDe(sid)
      nuevos.push({ a: sid, b: d.id, t0: ms * 0.55, dur: ms * 0.45 + 120, src: sid, dst: d.id })
    }))
    pulsosRef.current = nuevos
    t0Ref.current = performance.now()
    const maxMs = Math.max(...vista.nodos.map((d) => Math.min(...d.fuentes.map(latenciaDe)))) + 120
    const n = fc.length
    const resumenFinal = `respuesta en ${(maxMs / 1000).toFixed(2)} s · ${n > 0 ? `${n} ${n === 1 ? 'fuente no disponible' : 'fuentes no disponibles'}` : `${vista.fuentes.length} fuentes en línea`}`
    setEstadoConsulta('consultando…')
    if (timerConsulta.current !== null) clearTimeout(timerConsulta.current)
    timerConsulta.current = setTimeout(() => {
      setEstadoConsulta(resumenFinal)
      setEncendidos(vista.nodos.filter((x) => x.estado === 'ok').length)
    }, maxMs + 140)
  }
  const oleada = (c: Cliente360 = cli) => dispararOleadaPulsosGrafo(c, caidas, rolActivo)

  const alternarFallaFuente = (fuenteId: string) =>
    setCaidas((a) => (a.includes(fuenteId) ? a.filter((id) => id !== fuenteId) : [...a, fuenteId]))
  const reintentarFuentesDeNodo = (n: NodoDato360) => setCaidas((a) => a.filter((fid) => !n.fuentes.includes(fid)))

  const coincideCliente = (q: string) =>
    CLIENTES_360.find((c) =>
      c.dni.toLowerCase().includes(q) || c.doc.toLowerCase().includes(q) || c.nombre.toLowerCase().includes(q) ||
      c.telefono.toLowerCase().includes(q) || c.lotes.some((l) => l.toLowerCase().includes(q)))

  const alCambiarBusqueda = (valor: string) => {
    setBusqueda(valor)
    const v = valor.trim().toLowerCase()
    if (!v) {
      setExplicacion('')
      setHits([])
      return
    }
    const encontrado = coincideCliente(v)
    if (encontrado && encontrado.k !== clienteKey) {
      setNoEncontrado(false)
      seleccionarCliente(encontrado.k)
    }
  }

  const aplicarConsultaSemantica = (q: string, nodoId: string, expl: string, c: Cliente360 = cli) => {
    setBusqueda(q)
    seleccionarNodo(nodoId)
    setExplicacion(expl)
    setHits(filasNodoDe(c, nodoId).map((f, i) => ({ titulo: f[0], fragmento: f[1], relevancia: Math.max(82, 98 - i * 6) })))
    oleada(c)
  }

  const activarContingenciaNoEncontrado = () => {
    setNoEncontrado(true)
    setBusqueda('DNI 99999999 (No registrado en SIGDA)')
  }

  const ejecutarBusquedaSemantica = (terminoExplicito?: string) => {
    const inp = buscadorRef.current?.querySelector<HTMLInputElement>('input[type="search"], input')
    const raw = (terminoExplicito ?? inp?.value ?? busqueda).trim()
    setBusqueda(raw)
    const q = raw.toLowerCase()
    if (!q) {
      setFichaAbierta(true)
      setFichaDesplegada(true)
      oleada()
      return
    }
    if (q.includes('99999999') || q.includes('no existe')) {
      activarContingenciaNoEncontrado()
      return
    }
    const cliMatch = coincideCliente(q)
    let actual = cli
    if (cliMatch && cliMatch.k !== clienteKey) {
      seleccionarCliente(cliMatch.k)
      actual = cliMatch
    }
    const cs = CONSULTAS_SEMANTICAS.find((it) => it.q.toLowerCase().includes(q) || q.includes(it.q.toLowerCase()) || q === it.nodo)
    if (cs) {
      aplicarConsultaSemantica(cs.q, cs.nodo, cs.explicacion, actual)
      return
    }
    const nodoMatch = NODOS_360.find((n) => n.nombre.toLowerCase().includes(q) || n.id.toLowerCase() === q)
    if (nodoMatch) {
      setHits([])
      setExplicacion('')
      seleccionarNodo(nodoMatch.id)
      oleada(actual)
      return
    }
    const fuenteMatch = FUENTES_360.find((s) => s.nombre.toLowerCase().includes(q) || s.id.toLowerCase() === q)
    if (fuenteMatch) {
      setHits([])
      setExplicacion('')
      inspeccionarFuente360(fuenteMatch.id)
      oleada(actual)
      return
    }
    if (cliMatch) {
      setHits([])
      setExplicacion('')
      seleccionarNodo(cliMatch.lotes.some((l) => l.toLowerCase().includes(q)) ? 'lote' : 'kyc')
      oleada(cliMatch)
      return
    }
    seleccionarNodo('docs')
    setHits(filasNodoDe(actual, 'docs').map((f, i) => ({ titulo: f[0], fragmento: `${f[1]} · coincidencia semántica para «${raw}»`, relevancia: Math.max(74, 96 - i * 8) })))
    setExplicacion(`Búsqueda semántica documental: indexación vectorial sobre S3/GLI para «${raw}» completada en 310 ms.`)
    oleada(actual)
  }

  const ejecutarConsultaMotor = () => {
    const lote = loteMotor || cli.lotes[0] || 'M-14'
    if (caidas.includes('jose')) {
      setRespuestaMotor('El motor de consultas en línea no está disponible en este momento. La atención no se bloquea: continúa con el ticket y vuelve a consultar más tarde.')
      return
    }
    const consulta = CONSULTAS_MOTOR_RAPIDAS.find((c) => c.id === consultaMotorId) ?? CONSULTAS_MOTOR_RAPIDAS[0]!
    setRespuestaMotor(consulta.respuesta(cli, lote))
  }

  const abrirNuevoTicketCliente = (c: Cliente360) => p.ir('nuevo', { nombre: c.nombre, dni: c.dni })
  const crearTicketContingencia = () => p.ir('nuevo', {})

  // ------------------------------------------------------------------ efectos
  // perspectiva del rol (rolExterno y nodoFocoExterno de Daniel): al cambiar de rol se enfoca su nodo inicial
  useEffect(() => {
    seleccionarNodo(perfil.nodo)
  }, [p.rol, p.area])

  // oleada de pulsos al cambiar de cliente, de fuentes caídas o de rol
  useEffect(() => {
    oleada()
  }, [clienteKey, caidas, rolActivo])

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
  const B = (props: Record<string, unknown>, texto: unknown) => h(ui.Button, { size: 'sm', ...props }, texto)
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
              B({ variant: caida ? 'primary' : 'danger', onClick: () => alternarFallaFuente(src.id) }, caida ? 'Restaurar fuente en línea' : 'Probar desconexión'),
              B({ variant: 'ghost', onClick: () => setFuenteInsp(null) }, 'Ver nodo actual')))) : null))
  }

  const fichaNodo = () =>
    h('div', { className: 'pl-atc-ficha-flotante', role: 'dialog', 'aria-modal': 'false', 'aria-label': `Nodo 360 ${nodoActual.nombre}` },
      h(ui.Card, null,
        h(ui.CardHeader, {
          title: nodoActual.nombre, subtitle: `${trazabilidadNodo(nodoActual.id).hu} · ${cli.nombre}`, as: 'h3',
          actions: accionesFicha([
            h(ui.Badge, { key: 'e', size: 'sm', tone: est.tono }, est.etiqueta),
            h(ui.Badge, { key: 'o', size: 'sm', tone: 'info' }, `Origen: ${nombresFuentesDeNodo(nodoActual)}`),
          ]),
        }),
        fichaDesplegada ? h(ui.CardBody, null,
          h(Stack, { gap: '3' },
            est.codigo === 'locked'
              ? h(ui.Alert, { tone: 'warning', title: 'Acceso restringido por perfil' },
                `Tu perfil (${p.etiquetaRol}) no tiene acceso a este dato reservado. Cambia de perfil a Supervisor o Legal en Herramientas › Ver como para visualizarlo.`)
              : est.codigo === 'down'
                ? h(ui.Alert, { tone: 'danger', title: 'Fuente no disponible temporalmente' },
                  `${nodoActual.fuentes.filter((fid) => caidas.includes(fid)).map(nombreFuente).join(', ')} no responde en este instante. Las demás secciones siguen activas.`)
                : [
                  h(ui.CardPairs, { key: 'p', pairs: pares(nodoActual.id) }),
                  nodoActual.semantico && hits.length > 0
                    ? h(ui.Card, { key: 's' },
                      h(ui.CardHeader, { title: 'Coincidencias semánticas', as: 'h4' }),
                      h(ui.CardBody, null,
                        h(Stack, { gap: '2' },
                          hits.map((x) => h(Row, { key: x.titulo, gap: '2', ajuste: true },
                            h(ui.Badge, { size: 'sm', tone: 'info' }, `${x.relevancia}%`),
                            h(Texto, { as: 'strong', estilo: 'title', size: 'xs' }, x.titulo),
                            h(Texto, { estilo: 'subtitle', size: 'xs' }, `«${x.fragmento}»`))))))
                    : null,
                ],
            h(Divider, { espaciado: 'sm' }),
            h(ui.CardPairs, { pairs: paresTrazabilidadNodo(nodoActual.id) }),
            h(Row, { gap: '2', ajuste: true },
              puedeIr(nodoActual.id) ? B({ variant: 'primary', onClick: () => ejecutarRedireccionNodo(nodoActual.id) }, `${redirActual.etiqueta} →`) : null,
              redirActual.destino !== 'contrato' ? B({ variant: 'secondary', onClick: () => abrirContrato(cli.contratoPrincipal) }, `Contrato ${cli.contratoPrincipal}`) : null,
              p.puede('nuevo') ? B({ variant: 'secondary', onClick: () => abrirNuevoTicketCliente(cli) }, '+ Crear ticket') : null))) : null))

  const columnaGrafo = h(ui.Card, null,
    h(ui.CardBody, null,
      h(Stack, { gap: '3' },
        // buscador unificado de cliente o documento por significado
        h('div', { className: 'ay-row ay-row--2 ay-row--wrap', role: 'search', ref: buscadorRef },
          h(ui.SearchInput, {
            label: 'Buscar cliente o documento (DNI, lote, teléfono, sección 360 o consulta en lenguaje natural)', size: 'sm', debounce: 0,
            value: busqueda, onValueChange: alCambiarBusqueda, onSearch: (v: string) => ejecutarBusquedaSemantica(v),
            placeholder: 'Ej. Elena, 45892104, M-14, adenda de cambio de lote, cuotas vencidas…',
          }),
          B({ variant: 'primary', onClick: () => ejecutarBusquedaSemantica() }, 'Consultar'),
          h(ui.SegmentedControl, {
            label: 'Modo de visualización 360', size: 'sm', options: OPCIONES_MODO, value: modo,
            onValueChange: (v: string) => {
              if (v === 'po3d' || v === '2d') {
                setModo(v)
                requestAnimationFrame(() => window.dispatchEvent(new Event('resize')))
              }
            },
          })),
        // clientes frecuentes y consultas semánticas rápidas
        h(Row, { gap: '2', ajuste: true, 'aria-label': 'Clientes frecuentes y búsquedas por significado' },
          h(Texto, { estilo: 'label', size: 'xs' }, 'Clientes:'),
          CLIENTES_360.map((c) => B({ key: c.k, variant: clienteKey === c.k ? 'primary' : 'secondary', onClick: () => seleccionarCliente(c.k) }, c.nombre)),
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

  const columnaDerecha = h('aside', { className: 'ay-stack ay-stack--3', style: { gridColumn: 'span 1' }, 'aria-label': 'Cliente, controles y navegación rápida' },
    // 1. resumen del cliente en el maestro
    h(ui.Card, null,
      h(ui.CardHeader, {
        title: cli.nombre, subtitle: `${cli.doc} · ${cli.proyecto} · Contrato ${cli.contratoPrincipal}`, as: 'h3',
        actions: h(ui.Badge, { size: 'sm', tone: 'success' }, 'Maestro SIGDA'),
      }),
      h(ui.CardBody, null,
        h(Stack, { gap: '3' },
          h(Row, { gap: '2', ajuste: true },
            h(ui.Badge, { size: 'sm', tone: 'neutral' }, `Lotes ${cli.lotes.length}`),
            h(ui.Badge, { size: 'sm', tone: 'neutral' }, `Cuotas: ${resumenDato('cuotas')}`),
            h(ui.Badge, { size: 'sm', tone: 'neutral' }, `Exposición: ${resumenDato('expo')}`)),
          h(Row, { gap: '2', ajuste: true },
            B({ variant: 'primary', onClick: () => abrirContrato(cli.contratoPrincipal) }, `Ver contrato ${cli.contratoPrincipal}`),
            puedeIr('tick') ? B({ variant: 'secondary', onClick: () => ejecutarRedireccionNodo('tick') }, 'Tickets en Bandeja') : null)))),
    // 2. estado de los sistemas de origen
    h(ui.Card, null,
      h(ui.CardHeader, { title: 'Estado de sistemas de origen', subtitle: 'Monitoreo de disponibilidad y continuidad por fuente', as: 'h3' }),
      h(ui.CardBody, null,
        h(Row, { gap: '2', ajuste: true },
          B({ variant: caidas.length === 0 ? 'primary' : 'secondary', onClick: () => setCaidas([]) }, 'Todas en línea'),
          FUENTES_360.map((s) => B({ key: s.id, variant: caidas.includes(s.id) ? 'primary' : 'secondary', onClick: () => alternarFallaFuente(s.id) }, s.nombre))))),
    // 3. navegación rápida de nodos
    h(ui.Card, null,
      h(ui.CardHeader, { title: 'Nodos del Grafo 360 y Redirección', subtitle: 'Haz clic en un nodo para inspeccionarlo o redirigir a su módulo operativo', as: 'h3' }),
      h(ui.CardBody, null,
        h(Stack, { gap: '3' },
          h(Row, { gap: '2', ajuste: true },
            NODOS_360.map((nd) => B({ key: nd.id, variant: nodoSel === nd.id && !fuenteInsp ? 'primary' : 'secondary', onClick: () => seleccionarNodo(nd.id) }, nd.nombre))),
          h(Row, { gap: '2', ajuste: true },
            puedeIr(nodoActual.id) ? B({ variant: 'secondary', onClick: () => ejecutarRedireccionNodo(nodoActual.id) }, `${redirActual.etiqueta} →`) : null,
            B({ variant: 'ghost', onClick: () => { setFichaAbierta(!fichaAbierta); setFichaDesplegada(true) } }, fichaAbierta ? 'Ocultar ficha' : 'Mostrar ficha'))))))

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
                h(ui.Badge, { size: 'sm', tone: 'info' }, cli.doc),
                h(ui.Badge, { size: 'sm', tone: 'neutral' }, cli.telefono),
                h(ui.Badge, { size: 'sm', tone: 'neutral' }, correoCliente(cli)),
                h(ui.Badge, { size: 'sm', tone: 'neutral' }, `${cli.proyecto} · Lote ${cli.lotes.join(', ')}`),
                h(ui.Badge, { size: 'sm', tone: 'info' }, `Contrato ${cli.contratoPrincipal}`)),
              h(Texto, { as: 'p', estilo: 'body', size: 'sm' }, h('strong', null, 'Contexto de atención:'), ' ', cli.estadoEmocional))),
          h(Row, { gap: '2', ajuste: true },
            h(ui.Card, null,
              h(ui.CardBody, null,
                h(Row, { gap: '3', ajuste: true },
                  h(Stack, { gap: '1' },
                    h(Texto, { estilo: 'label', size: 'xs' }, 'Central Telefónica CTI'),
                    h(Texto, { as: 'strong', estilo: 'mono', size: 'sm' }, cli.telefono)),
                  !llamada
                    ? B({ variant: 'primary', onClick: () => { setSegundos(1); setLlamada(true) } }, 'Llamar')
                    : [
                      h(ui.Badge, { key: 'b', size: 'sm', tone: 'success' }, `En llamada · 00:${segundos < 10 ? '0' + segundos : segundos}`),
                      B({ key: 'c', variant: 'danger', onClick: () => { setLlamada(false); seleccionarNodo('llam') } }, 'Colgar y guardar grabación'),
                    ]))),
            B({ variant: 'primary', onClick: () => abrirContrato(cli.contratoPrincipal) }, `Ver contrato ${cli.contratoPrincipal}`),
            p.puede('nuevo') ? B({ variant: 'secondary', onClick: () => abrirNuevoTicketCliente(cli) }, '+ Crear ticket') : null,
            B({ variant: 'ghost', onClick: activarContingenciaNoEncontrado }, 'Registrar Interesado no ubicado'))),
        h(ui.Alert, { tone: 'info', title: 'Síntesis Copiloto IA en tiempo real' },
          `${cli.sintesisIa} — `, h('strong', null, 'Acción sugerida:'), ` ${cli.guiaRecomendada}`))))

  const consultasRapidas = h(ui.Card, null,
    h(ui.CardHeader, {
      title: 'Consultas rápidas en línea', subtitle: 'Respuestas instantáneas del motor de consultas por lote y contrato.', as: 'h3',
      actions: h(Row, { gap: '2', ajuste: true },
        B({ variant: 'primary', onClick: ejecutarConsultaMotor }, 'Consultar ahora'),
        B({ variant: 'secondary', onClick: () => abrirContrato(cli.contratoPrincipal) }, `Abrir contrato ${cli.contratoPrincipal}`)),
    }),
    h(ui.CardBody, null,
      h(Stack, { gap: '3' },
        h(Grid, { columnas: 2, gap: 'md' },
          h(ui.FormField, { label: 'Tipo de consulta' },
            h(ui.Select, { size: 'sm', options: OPCIONES_MOTOR, value: consultaMotorId, onChange: (e: { target: { value: string } }) => setConsultaMotorId(e.target.value) })),
          h(ui.FormField, { label: 'Lote del cliente' },
            h(ui.Select, {
              size: 'sm', options: cli.lotes.map((l) => ({ value: l, label: `${cli.proyecto} · Lote ${l}` })), value: loteMotor,
              onChange: (e: { target: { value: string } }) => setLoteMotor(e.target.value),
            }))),
        respuestaMotor
          ? h(ui.Alert, { tone: caidas.includes('jose') ? 'danger' : 'success', title: CONSULTAS_MOTOR_RAPIDAS.find((c) => c.id === consultaMotorId)?.nombre ?? 'Consulta al motor' }, respuestaMotor)
          : null,
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
            h(ui.CardHeader, { title: n.nombre, subtitle: `Origen: ${nombresFuentesDeNodo(n)}`, as: 'h4', actions: h(ui.Badge, { size: 'sm', tone: e.tono }, e.etiqueta) }),
            h(ui.CardBody, null,
              h(Stack, { gap: '2' },
                e.codigo === 'ok'
                  ? h(ui.CardPairs, { pairs: pares(n.id) })
                  : e.codigo === 'locked'
                    ? h(Texto, { as: 'p', estilo: 'subtitle', size: 'xs' }, `Tu perfil (${p.etiquetaRol}) no tiene acceso a «${n.nombre.toLowerCase()}». Solicítalo a tu supervisor ATC si lo requieres.`)
                    : h(Row, { gap: '2', ajuste: true, justificar: 'between' },
                      h(Texto, { estilo: 'subtitle', size: 'xs' }, 'No se pudo consultar. Las demás secciones siguen disponibles.'),
                      B({ variant: 'secondary', onClick: (ev: { stopPropagation: () => void }) => { ev.stopPropagation(); reintentarFuentesDeNodo(n) } }, 'Reintentar')),
                h(Divider, { espaciado: 'sm' }),
                h(Row, { gap: '2', ajuste: true, justificar: 'between', onClick: (ev: { stopPropagation: () => void }) => ev.stopPropagation() },
                  h(Texto, { estilo: 'label', size: 'xs' }, r.moduloNombre),
                  puedeIr(n.id) ? B({ variant: 'ghost', onClick: () => ejecutarRedireccionNodo(n.id) }, `${r.etiqueta} →`) : null))))
        }))))

  return h('div', { className: 'pt-pagina pt-pagina--ancha pl-c360' },
    h(ui.PageHeader, {
      title: 'Consulta 360 del Cliente', size: 'md',
      breadcrumb: h(ui.Breadcrumb, { label: 'Ruta del módulo', items: [{ label: 'Aybar Atiende' }, { label: 'Núcleo 360 y Planta' }, { label: 'Consulta 360 del Cliente' }] }),
      meta: h(Row, { gap: '2', ajuste: true },
        h(ui.Badge, { tone: 'success', dot: true }, 'En línea · 8 sistemas'),
        h(ui.Badge, { tone: 'info' }, `${p.usuario} (${p.etiquetaRol})`)),
      description: 'Ficha integral consolidada desde 8 sistemas en línea',
      actions: B({ variant: 'secondary', onClick: () => abrirContrato(visor.codigo) }, `Visor de Contratos (${visor.codigo})`),
    }),
    h(Stack, { gap: '4' },
      // 1. grafo 360 en 3D y 2D + lateral de inspección
      h(Grid, { columnas: 3, gap: 'md' },
        h('div', { style: { gridColumn: 'span 2' } }, columnaGrafo),
        columnaDerecha),
      // alertas de contingencia, disponibilidad de fuentes y búsqueda semántica
      noEncontrado
        ? h(ui.Alert, {
          tone: 'warning', title: 'Cliente no ubicado en el maestro SIGDA — Registro como Interesado',
          actions: h(Row, { gap: '2', ajuste: true },
            p.puede('nuevo') ? B({ variant: 'primary', onClick: crearTicketContingencia }, 'Registrar ticket como Interesado') : null,
            B({ variant: 'ghost', onClick: () => setNoEncontrado(false) }, 'Volver a ficha 360')),
        }, 'No se encontró coincidencia para el documento consultado. Para preservar la integridad del maestro único, se registra como ',
        h('strong', null, 'Interesado en cola de conciliación'),
        ' con datos mínimos verificables y el ticket continúa su atención sin bloquear al cliente.')
        : null,
      caidas.length > 0
        ? h(ui.Alert, { tone: 'warning', title: `Continuidad operativa activa — ${caidas.length} sistema(s) externo(s) sin respuesta` },
          `La vista 360 mantiene operativas las ${FUENTES_360.length - caidas.length} fuentes restantes (los nodos del sistema sin conexión se marcan como «no disponible» mientras el resto de la ficha responde con normalidad).`)
        : null,
      explicacion ? h(ui.Alert, { tone: 'info', title: 'Búsqueda semántica documental por significado' }, explicacion) : null,
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
      abierto: visor.abierto, codigo: visor.codigo, pestana: visor.pestana,
      alElegir: (codigo: string) => setVisor((v) => ({ ...v, codigo })),
      alCambiarPestana: (pestana: PestanaContrato) => setVisor((v) => ({ ...v, pestana })),
      alCerrar: () => setVisor((v) => ({ ...v, abierto: false })),
      verBandeja: p.puede('bandeja') ? () => { setVisor((v) => ({ ...v, abierto: false })); p.ir('bandeja', {}) } : undefined,
      irMorosidad: p.puede('morosidad') ? () => { setVisor((v) => ({ ...v, abierto: false })); p.ir('morosidad', {}) } : undefined,
    }))
}
