// «Operación en Vivo» con el diseño de Daniel (origin/prototipo-polar): cabecera de página de su consola (consola-atc.ts) y el
// template de su VistaVivoComponent (vista-vivo.ts) traducido de @aybarcorp/ui-angular a @aybarcorp/ui (mismo sistema de
// diseño, mismas clases ay-*); la escena 3D es su three/vivo.ts (src/three/vivo-daniel.ts). Desde b3-j muestra los DATOS
// REALES del mockup (planta.ts y modelo.ts) y cumple la HU-067 del PLT-04 v1.3: salas con «n en cola · ocupados/total» (CA-01),
// caja del color del tipo y bandeja rayo › SLA › prioridad (CA-02), Sala de Comité y correo al líder al vencer (CA-03), panel
// del área con la carga de cada gestor (CA-04), recorrido con hora, SLA consumido y CSAT (CA-05), KPI arriba y registro de
// actividad a la derecha (CA-06), razón social y áreas por rol también en la escena (CA-07), pausa y velocidad solo en el modo
// simulación (CA-08), vista por área en lista y respaldo sin WebGL (CA-09) y marcador del equipo sin ranking (CA-10). Las
// acciones de la ficha pasan por la API del modelo y sus reglas; «Ver expediente» abre el ticket real elegido.
import { leerTokenRgb, montarVivoDaniel } from 'aybar:escenas'
import type { ColsDaniel as Cols, EstaticoDaniel as Estatico } from '../three/index.ts'
import { COLOR_CANAL_RGB, COLOR_ZONA_RGB, type MetaEstacionVivo } from './datos.ts'
import { inyectarEstilosVivo } from './estilos.ts'
import { Circ, Divider, Grid, Rating, Row, Stack, Stat, Tag, Timeline, h, ruta, ui, usarEstado, usarPersona, useEffect, useRef, useState } from './kit.ts'
import {
  COLOR_TIPO, EJEMPLOS_SALA, NOMBRE_ESTADO, NOMBRE_ETAPA, NOMBRE_PRIORIDAD, ZONAS, bitacora, canalDe, cargaDe, cliente, comite,
  correosAsignacion, csatDia, csatDe, disponible, etapaDe, fechaHora, nivelSla, nombrePersona, npsTurno, ordenBandeja, pctConsumido,
  puedeAtender, puedeRayo, puedeReasignar, reasignacionesCarga, recorrido, resumenArea, sinLider, tieneRayo, zonaDe,
  EMPRESAS, type Datos, type Evento, type Persona, type Ticket,
} from './modelo.ts'
import { Planta } from './planta.ts'

const ROLES: Record<string, string> = {
  GESTOR: 'Gestor de tickets', COLABORADOR: 'Colaborador de área', SUPERVISOR: 'Supervisor ATC', COORDINADOR_CX: 'Coordinador CX',
  LEGAL_RECLAMOS: 'Responsable legal de reclamos', MESA_SGD: 'Gestora de la Mesa SGD', MODERADOR_EVENTO: 'Moderador de evento',
  ADMIN_FUNCIONAL: 'Administrador funcional', CONTROL_ACCESO: 'Control de acceso (garita)', CLIENTE: 'Cliente convocado (Mi Portal)',
  SIN_ATENCION: 'Rol sin atención',
}
const OPCIONES_VELOCIDAD = [{ value: '1', label: '1× Normal' }, { value: '2', label: '2× Rápido' }, { value: '4', label: '4× Turbo' }]
const OPCIONES_CAJON = [{ value: 'todo', label: 'Todas' }, { value: 'bandeja', label: 'Bandeja' }, { value: 'estacion', label: 'Estación' }, { value: 'correos', label: 'Correos CC' }]

const { Button, Badge, PageHeader, Card, CardBody, CardHeader, CardPairs, Select, Drawer, SegmentedControl, Breadcrumb, ProgressBar, DataGrid, FormField, Input, ErrorAccion } = ui
const Tarjeta = (cabecera: Record<string, unknown> | null, cuerpo: unknown, props: Record<string, unknown> = {}) =>
  h(Card, props, cabecera ? h(CardHeader, cabecera) : null, h(CardBody, null, cuerpo))
const Kpi = (...hijos: unknown[]) => h(Card, { variant: 'default' }, h(CardBody, { padding: 'sm' }, ...hijos))
const Etiqueta = (t: string) => h('span', { className: 'ay-text--label' }, t)
const Nota = (t: string) => h('p', { className: 'ay-text--subtitle ay-text--sm vv-nota' }, t)
const hitos = (evs: Evento[]) => evs.map((e) => ({ id: e.id, titulo: e.texto, fecha: e.fecha, autor: fechaHora(e.fecha), tono: e.tono }))
const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`

export function VivoDaniel() {
  inyectarEstilosVivo()
  const [planta] = useState(() => new Planta())
  const [, setVersion] = useState(0)
  const refrescar = () => setVersion((v) => v + 1)
  const hacer = (fn: () => void) => () => { fn(); refrescar() }
  /** Acción del modelo (transacción con latencia): se pinta al empezar y al terminar. */
  const accion = (p: () => Promise<void>) => () => { refrescar(); void p().finally(refrescar) }
  const host = useRef<HTMLDivElement | null>(null)
  const lienzo = useRef<HTMLCanvasElement | null>(null)
  const { datos, sim } = usarEstado() as { datos: Datos; sim: { vivoSimulacion?: boolean } | null }
  const persona = usarPersona() as Persona | null
  planta.actualizar(datos, persona)
  const o = planta.o

  // HU-067 CA-08: Herramientas › Simulación › «Modo simulación» (encendido por defecto). Apagado, no hay pausa, velocidad ni
  // tickets de ejemplo: el visor solo refleja lo que pasa en la Bandeja (el mismo estado del modelo, sin recargar).
  const simActiva = sim?.vivoSimulacion !== false
  const Q = puedeAtender(persona)
  // lo que leen los clics de la escena (montada una vez por juego de salas): siempre el valor del último render
  const vivoRef = useRef({ sim: simActiva, Q })
  vivoRef.current = { sim: simActiva, Q }
  const pRayo = !!persona && puedeRayo(persona)
  useEffect(() => {
    if (!simActiva || !planta.enEjecucion || !Q) return
    const iv = setInterval(() => { void planta.tick() }, 1500 / planta.velocidad)
    return () => clearInterval(iv)
  }, [simActiva, planta.enEjecucion, planta.velocidad, Q])

  // escena 3D (montarVivo de Daniel, con sus colores); se vuelve a montar si cambian las salas permitidas (CA-07) o la vista
  const salasClave = planta.clavesSalas()
  useEffect(() => {
    const canvas = lienzo.current, hostEl = host.current
    if (planta.modo !== '3d' || !canvas || !hostEl) return
    const cols: Cols = {
      teal: leerTokenRgb('primary-500', [43, 138, 156]),
      teal2: leerTokenRgb('primary-400', [56, 189, 248]),
      orange: leerTokenRgb('secondary-400', [246, 164, 44]),
      ok: leerTokenRgb('success-500', [46, 139, 87]),
      warn: leerTokenRgb('warning-500', [227, 155, 28]),
      bad: leerTokenRgb('danger-500', [192, 69, 58]),
      line: [45, 64, 72],
      muted: [157, 180, 186],
      texto: [232, 240, 242],
      superficie: [27, 42, 49],
      suelo: [20, 32, 38],
      lienzo: [15, 26, 31],
    }
    const est: Estatico = {
      zonas: planta.salas().map((s) => ({ k: s.k, n: s.nombre, color: COLOR_ZONA_RGB[s.k] ?? cols.teal2 })),
      compuertas: planta.puertas.map((p) => ({ k: p.k, n: p.nombre, sigla: p.ic, color: COLOR_CANAL_RGB[p.k] ?? cols.teal2 })),
      tipos: Object.entries(COLOR_TIPO).map(([k, token]) => ({ k, color: leerTokenRgb(token, cols.teal2) })),
    }
    const reducido = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
    try {
      return montarVivoDaniel({
        canvas, host: hostEl, cols, reducido, est, hits: planta.hits,
        obtener: () => planta.snapshot(),
        alClickTicket: (id) => { planta.ticketSeleccionadoId = id; planta.motivoAbierto = false; refrescar() },
        alClickCanal: (k) => { planta.inspeccionarCanal3D(k, planta.enEjecucion && vivoRef.current.sim && vivoRef.current.Q); refrescar() },
        alClickSala: (k) => { planta.inspeccionarSala3D(k); refrescar() },
        alClickEtapa: (e) => { planta.inspeccionarEtapa3D(e); refrescar() },
      })
    } catch (e) {
      // HU-067 CA-09: sin aceleración gráfica (WebGL) la página no queda en blanco: pasa a la vista por área en lista
      console.warn('Operación en Vivo: sin WebGL, se muestra la vista por área', e)
      planta.sinWebgl = true
      planta.modo = 'lista'
      refrescar()
      return
    }
  }, [planta.modo, salasClave])

  const irA = (r: string) => { location.hash = ruta(r) }
  const seleccionar = (id: string | null) => { planta.ticketSeleccionadoId = id; planta.motivoAbierto = false; planta.motivo = ''; refrescar() }

  const salas = planta.salas()
  if (planta.areaFiltro && !salas.some((s) => s.k === planta.areaFiltro)) planta.areaFiltro = ''
  const bandeja = planta.ticketsBandeja()
  const verBandeja = bandeja.slice(0, 10)
  const tk = planta.ticketSeleccionado()
  const est = planta.estacionActual()
  const vista = planta.vistaCajon
  const eq = planta.equipo()
  const pctSla = eq.resueltos ? Math.round((eq.enSla / eq.resueltos) * 100) : null
  const csat = csatDia(o)
  const nps = npsTurno(o)
  const estados = planta.estadosResumen()
  const enComite = new Set(comite(o).map((t) => t.id))
  // los resueltos recientes que la escena lleva a «Cierre en Mi Portal» (los mismos 8 del snapshot)
  const recientes = o.tickets.filter((t) => etapaDe(t) === 'salida')
    .sort((a, b) => (b.ultimaResolucion?.getTime() ?? 0) - (a.ultimaResolucion?.getTime() ?? 0)).slice(0, 8)
  const nSalas = plural(salas.length, 'Sala', 'Salas')
  const opcionesSalas = [{ value: '', label: `Todas las salas (${plural(salas.length, 'área', 'áreas')})` }, ...salas.map((s) => ({ value: s.k, label: s.nombre }))]
  const opcionesEmpresa = [{ value: '', label: 'Todas las razones sociales' }, ...EMPRESAS.map((e) => ({ value: e.id, label: e.nombre }))]

  // ------------------------------------------------------------------ cabecera de página (consola de Daniel)
  const cabecera = h(PageHeader, {
    title: 'Operación en Vivo',
    description: 'Planta de atención en tiempo real, colas y niveles de servicio',
    size: 'md',
    breadcrumb: h(Breadcrumb, { label: 'Ruta del módulo', items: [{ label: 'Aybar Atiende' }, { label: 'Núcleo 360 y Planta' }, { label: 'Operación en Vivo' }] }),
    meta: h('span', { className: 'ay-row ay-row--2 ay-row--wrap' },
      h(Badge, { tone: 'success', dot: true }, 'En línea · 8 sistemas'),
      simActiva ? h(Badge, { tone: 'warning' }, 'Modo simulación') : h(Badge, { tone: 'neutral' }, 'Tiempo real'),
      persona ? h(Badge, { tone: 'info' }, `${persona.nombre} (${ROLES[persona.rol] ?? persona.rol})`) : null),
  })

  // ------------------------------------------------------------------ 1. controles + KPI + tickets por estado
  // HU-067 CA-08: pausa, velocidad y ejemplos solo en el modo simulación
  const controles = simActiva ? Row({ gap: '2', wrap: true, children: [
    h(Button, { key: 'p', size: 'sm', variant: 'primary', disabled: !Q, onClick: hacer(() => planta.alternarPausa()) }, planta.enEjecucion ? 'Pausar planta' : 'Reanudar planta'),
    h(SegmentedControl, { key: 'v', label: 'Velocidad de planta', size: 'sm', options: OPCIONES_VELOCIDAD, value: String(planta.velocidad), onValueChange: (v: string) => { planta.cambiarVelocidad(v); refrescar() } }),
    h(Button, { key: 't', size: 'sm', variant: 'secondary', disabled: !Q, onClick: accion(() => planta.entrante()) }, '+ Ticket entrante'),
    pRayo ? h(Button, { key: 'r', size: 'sm', variant: 'secondary', disabled: !Q, onClick: accion(() => planta.entrante({ rayo: true })) }, 'Ticket con Prioridad Rayo') : null,
    h(Button, { key: 'e', size: 'sm', variant: 'danger', disabled: !Q, onClick: accion(() => planta.forzarVencimientoSla()) }, 'Escalar a Comité SGD'),
    h(Button, { key: 'm', size: 'sm', variant: 'ghost', disabled: !Q, onClick: accion(() => planta.simularPicoMasivo()) }, 'Pico +5 multicanal'),
  ] }) : Nota('Tiempo real: el visor refleja al instante lo que pasa en la Bandeja. La pausa, la velocidad y los tickets de ejemplo solo existen en el modo simulación (Herramientas › Simulación).')
  const aviso = Stack({ gap: '2', children: [
    h('p', { key: 'm', className: 'ay-text--sm vv-nota vv-mensaje', role: 'status', 'aria-live': 'polite' }, planta.mensaje),
    planta.error ? h('div', { key: 'e' }, h(ErrorAccion, { error: planta.error, titulo: 'No se completó la acción' })) : null,
  ] })

  const riesgo = planta.enRiesgoCount()
  const kpis = Grid({ columnas: 5, children: [
    h('div', { key: 'a' }, Kpi(Stack({ gap: '2', align: 'start', children: [
      h(Stat, { key: 's', label: 'Tickets activos', value: planta.activosEnCursoCount(), size: 'sm' }),
      h(Badge, { key: 'b', size: 'sm', tone: riesgo > 0 ? 'warning' : 'success' }, riesgo > 0 ? `${riesgo} en riesgo` : 'Sin riesgos'),
    ] }))),
    h('div', { key: 'b' }, Kpi(Row({ gap: '3', children: [
      h(Circ, { key: 'c', label: 'Resueltos en SLA', value: pctSla ?? 0, size: 'md', tone: (pctSla ?? 0) >= 90 ? 'success' : 'warning' }),
      Stack({ gap: '1', children: [
        h(Stat, { key: 's', label: 'Resueltos en SLA', value: pctSla ?? '—', unit: pctSla == null ? undefined : '%', size: 'sm' }),
        h('span', { key: 't', className: 'ay-text--subtitle ay-text--sm' }, `${eq.enSla} de ${eq.resueltos} (Meta 90%)`),
      ] }),
    ] }))),
    h('div', { key: 'c' }, Kpi(Stack({ gap: '2', children: [
      h(Stat, { key: 's', label: 'CSAT del día', value: csat.hoy == null ? '—' : csat.hoy.toFixed(1), unit: csat.hoy == null ? undefined : '/ 5', size: 'sm' }),
      csat.hoy != null
        ? h(Rating, { key: 'r', label: 'Satisfacción CSAT', value: csat.hoy, allowHalf: true, count: csat.nHoy, size: 'sm' })
        : h('span', { key: 'r', className: 'ay-text--subtitle ay-text--sm' }, csat.acumulado == null ? 'Sin encuestas respondidas' : `Sin encuestas hoy · acumulado ${csat.acumulado.toFixed(1)} / 5 (n=${csat.n})`),
    ] }))),
    // HU-067 CA-10: marcador del equipo (nivel, puntos y racha); sin ranking individual
    h('div', { key: 'd' }, Kpi(Stack({ gap: '2', children: [
      Row({ gap: '2', justify: 'between', children: [
        h(Stat, { key: 's', label: `Nivel ${eq.nivel} del equipo`, value: eq.xp, unit: `/ ${eq.meta} XP`, size: 'sm' }),
        h(Badge, { key: 'b', size: 'sm', tone: 'info' }, `Racha ${eq.racha}`),
      ] }),
      h(ProgressBar, { key: 'p', label: 'Experiencia del equipo', hideLabel: true, value: Math.round((eq.xp / eq.meta) * 100), detail: `Faltan ${eq.meta - eq.xp} XP`, size: 'sm', tone: 'brand' }),
    ] }))),
    h('div', { key: 'e' }, Kpi(Stack({ gap: '2', align: 'start', children: [
      h(Stat, { key: 's', label: 'NPS del turno', value: nps.valor == null ? '—' : `${nps.valor > 0 ? '+' : ''}${nps.valor}`, size: 'sm' }),
      h(Badge, { key: 'b', size: 'sm', tone: (nps.valor ?? 0) >= 30 ? 'success' : 'warning' }, `Encuestas n=${nps.n}`),
    ] }))),
  ] })

  const porEstado = h(Card, { variant: 'default' },
    h(CardHeader, {
      title: 'Tickets por estado', as: 'h4',
      subtitle: 'Distribución en tiempo real: Abierto, En curso, Espera cliente, Escalado, Reabierto, Resuelto y Cerrado',
      actions: h(Badge, { size: 'sm', tone: 'neutral' }, `${planta.totalEstadosCount()} en total`),
    }),
    h(CardBody, { padding: 'sm' }, Grid({ columnas: 7, children: estados.map((e) => h('div', { key: e.id }, Kpi(Stack({ gap: '1', children: [
      Row({ gap: '2', justify: 'between', children: [
        h('span', { key: 'n', className: 'ay-text--label' }, e.n),
        h(Badge, { key: 'v', size: 'sm', tone: e.tono }, String(e.v)),
      ] }),
      h(ProgressBar, { key: 'p', label: e.n, hideLabel: true, value: e.pct, tone: e.tonoBarra, size: 'sm' }),
    ] })))) })))

  const tarjeta1 = Tarjeta({
    title: `Operación en Vivo 3D · Robot Orquestador · 5 Canales de Entrada · ${nSalas} de Atención`,
    subtitle: 'Monitoreo en tiempo real del flujo de tickets, despacho automático por menor carga y SLA',
    as: 'h3',
    actions: Row({ gap: '2', wrap: true, children: [
      // HU-067 CA-07: razón social (filtra escena, indicadores, cajón y registro)
      h(Select, { key: 'rs', size: 'sm', 'aria-label': 'Razón social', value: planta.empresa, options: opcionesEmpresa, onChange: (ev: { target: { value: string } }) => { planta.cambiarEmpresa(ev.target.value); refrescar() } }),
      h(Select, { key: 's', size: 'sm', 'aria-label': 'Sala', value: planta.areaFiltro, options: opcionesSalas, onChange: (ev: { target: { value: string } }) => { planta.areaFiltro = ev.target.value; refrescar() } }),
      h(Button, { key: 'b', size: 'sm', variant: planta.cajonLateralAbierto ? 'primary' : 'secondary', 'aria-expanded': planta.cajonLateralAbierto, onClick: hacer(() => { planta.cajonLateralAbierto = !planta.cajonLateralAbierto }) },
        planta.cajonLateralAbierto ? 'Cerrar cajón de bandejas' : `Bandejas operativas (${bandeja.length})`),
    ] }),
  }, Stack({ gap: '3', children: [h('div', { key: 'c' }, controles), h('div', { key: 'a' }, aviso), h('div', { key: 'k' }, kpis), h('div', { key: 'e' }, porEstado)] }))

  // ------------------------------------------------------------------ 2. ficha del ticket (CA-05) con las acciones del modelo
  const ficha = (t: Ticket, flotante: boolean) => {
    const s = nivelSla(t, o.ahora)
    const hecho = etapaDe(t) === 'salida'
    const rayo = tieneRayo(o, t.id)
    const cli = t.clienteId ? cliente(t.clienteId) : null
    const consumido = pctConsumido(t, o.ahora)
    const csatT = csatDe(o, t)
    const pares: [string, string][] = [
      ['Cliente / Lote', cli ? [cli.nombre, cli.proyectos?.[0]].filter(Boolean).join(' · ') : '—'],
      ['Canal de entrada', planta.nombreCanal(canalDe(t))],
      ['Tipo', planta.nombreTipo(t.tipo)],
      ['Sala / Área', planta.nombreSala(zonaDe(o, t))],
      ['Estado', [...new Set([NOMBRE_ESTADO[t.estado] ?? t.estado, NOMBRE_ETAPA[etapaDe(t)]])].join(' · ')],
      ['Responsable', t.responsable ? nombrePersona(t.responsable) : 'Bandeja Orquestadora'],
      ...(csatT ? [['CSAT', csatT] as [string, string]] : []),
    ]
    const motivo = planta.motivoAbierto ? Stack({ gap: '2', children: [
      h(FormField, { key: 'f', label: 'Motivo del rayo', required: true, helper: 'Solo el supervisor; tope del 10 % de los tickets activos del área.' },
        h(Input, { value: planta.motivo, maxLength: 140, onChange: (ev: { target: { value: string } }) => { planta.motivo = ev.target.value; refrescar() } })),
      Row({ gap: '2', children: [
        h(Button, { key: 'ok', size: 'sm', variant: 'primary', disabled: !planta.motivo.trim(), onClick: accion(() => planta.marcarRayo(t.id, planta.motivo)) }, 'Marcar Prioridad Rayo'),
        h(Button, { key: 'no', size: 'sm', variant: 'ghost', onClick: hacer(() => { planta.motivoAbierto = false }) }, 'Cancelar'),
      ] }),
    ] }) : null
    return h('div', { key: t.id, className: flotante ? 'pl-atc-ficha-flotante pl-atc-ficha-flotante--izq' : 'vv-ficha', role: 'dialog', 'aria-modal': 'false', 'aria-label': `Ficha del ticket ${t.numero}` },
      h(Card, null,
        h(CardHeader, {
          title: t.numero, subtitle: t.resumen, as: 'h3',
          actions: Row({ gap: '2', wrap: true, children: [
            h(Badge, { key: 'p', size: 'sm', tone: rayo ? 'warning' : 'info' }, rayo ? 'Prioridad Rayo' : (NOMBRE_PRIORIDAD[t.prioridad] ?? t.prioridad)),
            h(Badge, { key: 's', size: 'sm', tone: planta.tonoSlaBadge(t) }, planta.etiquetaSlaTicket(t)),
            enComite.has(t.id) ? h(Badge, { key: 'c', size: 'sm', tone: 'danger' }, 'Sala de Comité') : null,
            h(Button, { key: 'x', size: 'sm', variant: 'ghost', 'aria-label': 'Cerrar ficha', onClick: () => seleccionar(null) }, 'Cerrar'),
          ] }),
        }),
        h(CardBody, null, Stack({ gap: '3', children: [
          h(ProgressBar, {
            key: 'b', label: 'SLA consumido', value: consumido, tone: planta.tonoSlaBarra(t), size: 'sm',
            detail: `${consumido}% consumido · ${s.hito === 'respuesta' ? 'primera respuesta' : 'resolución'} ${hecho ? 'vencía' : 'vence'} ${fechaHora(s.vence)}`,
          }),
          h(CardPairs, { key: 'p', pairs: pares }),
          Stack({ gap: '1', children: [
            h('span', { key: 't', className: 'ay-text--label' }, 'Recorrido en tiempo real'),
            h(Timeline, { key: 'l', label: 'Recorrido del ticket en planta', hitos: hitos(recorrido(o, t)), ahora: o.ahora, conHora: true }),
          ] }),
          h(Divider, { key: 'd' }),
          motivo,
          Row({ gap: '2', wrap: true, children: [
            pRayo && !hecho ? h(Button, { key: 'r', size: 'sm', variant: 'secondary', onClick: rayo ? accion(() => planta.quitarRayo(t.id)) : hacer(() => { planta.motivoAbierto = true }) }, rayo ? 'Quitar Rayo' : 'Prioridad Rayo') : null,
            Q && !hecho ? h(Button, { key: 'v', size: 'sm', variant: 'primary', onClick: accion(() => planta.resolver(t.id)) }, 'Resolver a Mi Portal') : null,
            puedeReasignar(persona) && !hecho ? h(Button, { key: 'g', size: 'sm', variant: 'ghost', onClick: accion(() => planta.reasignar(t.id)) }, 'Reasignar gestor') : null,
            h(Button, { key: 'e', size: 'sm', variant: 'ghost', onClick: () => irA(`ticket/${t.id}`) }, 'Ver expediente'),
          ] }),
        ] }))))
  }

  // ------------------------------------------------------------------ 3. escena 3D o vista por área (CA-09) + registro (CA-06)
  const columnasArea = [
    { key: 'n', header: 'Área', renderCell: (r: { k: string; n: string }) => h('button', { type: 'button', className: 'pt-enlace-celda', onClick: hacer(() => planta.inspeccionarSala3D(r.k)) }, r.n) },
    { key: 'cola', header: 'En cola', align: 'end' },
    { key: 'aten', header: 'En atención', align: 'end' },
    { key: 'ocup', header: 'Gestores ocupados', align: 'end', renderCell: (r: { ocup: number; tot: number }) => `${r.ocup} de ${r.tot}` },
    { key: 'riesgo', header: 'En riesgo o vencidos', align: 'end' },
    { key: 'res', header: 'Resueltos', align: 'end' },
    { key: 'sla', header: '% en SLA', align: 'end', renderCell: (r: { sla: number | null }) => (r.sla == null ? '—' : `${r.sla} %`) },
  ]
  const filasArea = salas.map((s) => ({ ...resumenArea(o, s.k), n: s.nombre }))
  const filaTicket = (t: Ticket) => h('li', { key: t.id, className: 'vv-fila' },
    h('button', { type: 'button', className: 'pt-enlace-celda', onClick: () => seleccionar(t.id) }, t.numero),
    tieneRayo(o, t.id) ? h(Badge, { size: 'sm', tone: 'warning' }, 'RAYO') : null,
    h('span', { className: 'ay-text--subtitle ay-text--sm' }, `${planta.nombreTipo(t.tipo)} · ${NOMBRE_ETAPA[etapaDe(t)]}`),
    enComite.has(t.id) ? h(Badge, { size: 'sm', tone: 'danger' }, 'Comité SGD') : h(Badge, { size: 'sm', tone: planta.tonoSlaBadge(t) }, planta.etiquetaSlaTicket(t)))
  const vistaLista = h('section', { className: 'vv-lista', 'aria-label': 'Vista por área en lista' }, Stack({ gap: '3', children: [
    planta.sinWebgl ? h('div', { key: 'w' }, Nota('Este equipo no puede dibujar la escena 3D (sin aceleración gráfica): se muestra la misma información por área.')) : null,
    salas.length
      ? h('div', { key: 'g' }, h(DataGrid, { caption: 'Tickets por área', columns: columnasArea, rows: filasArea, getRowId: (r: { k: string }) => r.k }))
      : h('div', { key: 'g' }, Nota('Tu rol no tiene áreas en la Operación en Vivo.')),
    h('div', { key: 'b' }, Row({ gap: '2', wrap: true, children: [
      h(Badge, { key: 'b', size: 'sm', tone: 'info' }, `Bandeja Orquestadora: ${o.tickets.filter((t) => etapaDe(t) === 'bandeja').length} en espera`),
      h(Badge, { key: 'c', size: 'sm', tone: enComite.size ? 'danger' : 'neutral' }, `Sala de Comité: ${enComite.size} con SLA vencido`),
    ] })),
    h('div', { key: 'l', className: 'vv-areas' }, ...filasArea.map((r) => h(Card, { key: r.k, variant: 'default' },
      h(CardHeader, { title: r.n, as: 'h4', subtitle: `${r.cola} en cola · ${r.ocup}/${r.tot} ocupados · ${r.sla == null ? 'sin resueltos' : `${r.sla} % en SLA`}` }),
      h(CardBody, { padding: 'sm' }, r.ts.length ? h('ul', { className: 'vv-lista-tk' }, ...[...r.ts].sort(ordenBandeja(o)).map(filaTicket)) : Nota('Sin tickets activos.')))),
      h(Card, { key: 'comite', variant: 'default' },
        h(CardHeader, { title: 'Comité (Mesa SGD)', as: 'h4', subtitle: `${enComite.size} con SLA vencido · ${o.escalamientos.length} escalados en cadena` }),
        h(CardBody, { padding: 'sm' }, enComite.size ? h('ul', { className: 'vv-lista-tk' }, ...comite(o).map(filaTicket)) : Nota('Ningún caso con el SLA vencido.'))),
      h(Card, { key: 'cierre', variant: 'default' },
        h(CardHeader, { title: 'Cierre en Mi Portal', as: 'h4', subtitle: `${recientes.length} resueltos recientes` }),
        h(CardBody, { padding: 'sm' }, recientes.length ? h('ul', { className: 'vv-lista-tk' }, ...recientes.map(filaTicket)) : Nota('Sin resueltos recientes.')))),
  ] }))

  const leyenda = Stack({ gap: '2', children: [
    Row({ gap: '2', wrap: true, children: [
      h(Tag, { key: 1, variant: 'outline', dotColor: 'var(--aybar-color-feedback-success-border)' }, 'LED verde: En plazo SLA'),
      h(Tag, { key: 2, variant: 'outline', dotColor: 'var(--aybar-color-feedback-warning-border)' }, 'LED ámbar pulsante: SLA en riesgo (<25%)'),
      h(Tag, { key: 3, variant: 'outline', dotColor: 'var(--aybar-color-feedback-danger-border)' }, 'LED rojo / Comité SGD: SLA vencido'),
      h(Tag, { key: 4, variant: 'outline', dotColor: 'var(--aybar-color-secondary-400)' }, 'Relámpago 3D giratorio: Prioridad Rayo'),
      h(Tag, { key: 5, variant: 'outline', dotColor: 'var(--aybar-color-primary-500)' }, 'Robot Orquestador: Despacho automático por carga'),
    ] }),
    Row({ gap: '2', wrap: true, children: [
      h('span', { key: 't', className: 'ay-text--label' }, 'Color de la caja: tipo de ticket'),
      ...Object.entries(COLOR_TIPO).map(([k, token]) => h(Tag, { key: k, variant: 'outline', dotColor: `var(--aybar-color-${token})` }, planta.nombreTipo(k))),
    ] }),
  ] })

  const registro = planta.registroVisible ? h('aside', { className: 'vv-registro', 'aria-label': 'Registro de actividad' }, h(Card, { variant: 'default' },
    h(CardHeader, {
      title: 'Registro de actividad', as: 'h4', subtitle: 'Estados, rayo y avisos de SLA vencido, con la hora de cada evento',
      actions: h(Button, { size: 'sm', variant: 'ghost', 'aria-label': 'Ocultar el registro de actividad', onClick: hacer(() => { planta.registroVisible = false }) }, 'Ocultar'),
    }),
    h(CardBody, { padding: 'sm' }, h(Timeline, { label: 'Actividad reciente', hitos: hitos(bitacora(o)), ahora: o.ahora, conHora: true })))) : null

  const tarjeta2 = Tarjeta({
    title: `Planta de Atención en Vivo · Robot Orquestador · ${nSalas} · Comité SGD · Cierre en Mi Portal`,
    subtitle: 'Haz clic en cualquier tarjeta 3D, canal o sala para inspeccionar su detalle en tiempo real o abre el cajón de bandejas.',
    as: 'h3',
    actions: Row({ gap: '2', wrap: true, children: [
      h(Badge, { key: 'r', size: 'sm', tone: 'success' }, `${planta.resueltosHoy()} resueltos hoy`),
      h(Badge, { key: 'y', size: 'sm', tone: 'warning' }, `${planta.conRayoCount()} con Rayo`),
      h(Badge, { key: 'c', size: 'sm', tone: enComite.size > 0 ? 'danger' : 'neutral' }, `${enComite.size} en Comité SGD`),
      planta.registroVisible ? null : h(Button, { key: 'g', size: 'sm', variant: 'secondary', onClick: hacer(() => { planta.registroVisible = true }) }, 'Registro de actividad'),
      // HU-067 CA-09: vista alternativa en lista por área (la única sin WebGL)
      planta.sinWebgl ? h(Badge, { key: 'm', size: 'sm', tone: 'info' }, 'Lista por área (sin 3D)') : h(SegmentedControl, {
        key: 'm', label: 'Vista de la planta', size: 'sm', value: planta.modo,
        options: [{ value: '3d', label: 'Escena 3D' }, { value: 'lista', label: 'Lista por área' }],
        onValueChange: (v: string) => { planta.modo = v === 'lista' ? 'lista' : '3d'; refrescar() },
      }),
    ] }),
  }, Stack({ gap: '3', children: [
    h('div', { key: 'e', className: planta.registroVisible ? 'vv-planta' : 'vv-planta vv-planta--sola' },
      planta.modo === '3d'
        ? h('div', { ref: host, className: 'atc-vivo-stage-area' },
          h('canvas', { ref: lienzo, style: { display: 'block', width: '100%', cursor: 'pointer' }, 'aria-label': 'Escena 3D de la planta de atención' }),
          tk ? ficha(tk, true) : null)
        : h('div', null, tk ? ficha(tk, false) : null, vistaLista),
      registro),
    h('div', { key: 'l' }, leyenda),
  ] }))

  // ------------------------------------------------------------------ 4. cajón lateral
  const tarjetaBandeja = (vista === 'todo' || vista === 'bandeja') ? Tarjeta({
    title: `Bandeja Orquestadora y Salas (${bandeja.length})`,
    subtitle: 'Orden: Rayo · SLA · Prioridad (clic para abrir ficha en escena)',
    as: 'h3',
    actions: Row({ gap: '2', wrap: true, children: [
      h(Badge, { key: 'f', size: 'sm', tone: 'info' }, planta.areaFiltro ? planta.nombreSala(planta.areaFiltro) : 'Todas las salas'),
      h(Button, { key: 'i', size: 'sm', variant: 'ghost', onClick: () => irA('bandeja') }, 'Ir a Bandeja'),
    ] }),
  }, Stack({ gap: '2', children: [
    ...verBandeja.map((t) => {
      const c = t.clienteId ? cliente(t.clienteId) : null
      const ry = tieneRayo(o, t.id)
      return h(Card, {
        key: t.id, variant: 'selectable', selected: planta.ticketSeleccionadoId === t.id,
        onClick: () => seleccionar(t.id),
      }, h(CardBody, { padding: 'sm' }, Stack({ gap: '1', children: [
        Row({ gap: '2', wrap: true, justify: 'between', children: [
          Row({ gap: '2', wrap: true, children: [
            h('strong', { key: 'n', className: 'ay-text--mono ay-text--sm' }, t.numero),
            ry ? h(Badge, { key: 'r', size: 'sm', tone: 'warning' }, 'RAYO') : null,
            c ? h('span', { key: 'c', className: 'ay-text--subtitle ay-text--sm' }, c.nombre) : null,
          ] }),
          enComite.has(t.id) ? h(Badge, { key: 's', size: 'sm', tone: 'danger' }, 'Comité SGD') : h(Badge, { key: 's', size: 'sm', tone: planta.tonoSlaBadge(t) }, `${planta.pctSlaRestante(t)}% SLA`),
        ] }),
        Row({ gap: '2', wrap: true, justify: 'between', children: [
          h('span', { key: 'd', className: 'ay-text--subtitle ay-text--sm' }, `${planta.nombreTipo(t.tipo)} · ${NOMBRE_PRIORIDAD[t.prioridad] ?? t.prioridad} · ${planta.nombreSala(zonaDe(o, t))} (${NOMBRE_ETAPA[etapaDe(t)]})`),
          pRayo ? h(Button, {
            key: 'r', size: 'sm', variant: 'ghost', 'aria-label': `${ry ? 'Quitar Rayo' : 'Prioridad Rayo'} a ${t.numero}`,
            onClick: (ev: { stopPropagation: () => void }) => {
              ev.stopPropagation()
              if (ry) accion(() => planta.quitarRayo(t.id))()
              else { seleccionar(t.id); planta.motivoAbierto = true; refrescar() }
            },
          }, ry ? 'Quitar Rayo' : 'Rayo') : null,
        ] }),
      ] })))
    }),
    bandeja.length > verBandeja.length ? Nota(`Y ${bandeja.length - verBandeja.length} más en la Bandeja.`) : null,
    bandeja.length ? null : Nota('Sin tickets activos en la vista.'),
  ] })) : null

  // HU-067 CA-04: panel del área (al tocar la sala o su fila): cola, ocupados, resueltos, % en SLA, sus tickets y la carga de cada
  // gestor con las reasignaciones por carga (HU-046). Solo informa: desde aquí no se reasigna a mano.
  const panelArea = (k: string) => {
    const r = resumenArea(o, k)
    const z = ZONAS.find((q) => q.k === k)
    const reas = reasignacionesCarga(o, k)
    const num = (id: string) => o.tickets.find((t) => t.id === id)?.numero ?? ''
    return Stack({ gap: '2', children: [
      h(CardPairs, { key: 'r', pairs: [['En cola', String(r.cola)], ['Gestores ocupados', `${r.ocup} de ${r.tot}`], ['Resueltos', String(r.res)], ['% en SLA', r.sla == null ? '—' : `${r.sla} %`]] }),
      Etiqueta(`Tickets del área (${r.ts.length})`),
      r.ts.length ? h('ul', { key: 't', className: 'vv-lista-tk' }, ...[...r.ts].sort(ordenBandeja(o)).map(filaTicket)) : Nota('Sin tickets activos.'),
      Etiqueta('Carga de cada gestor'),
      h('ul', { key: 'g', className: 'vv-lista-tk' }, ...(z?.gente ?? []).map((g) => {
        const c = cargaDe(planta.todo, g).carga
        return h('li', { key: g, className: 'vv-fila' },
          h('span', null, nombrePersona(g)), h('span', { className: 'ay-text--subtitle ay-text--sm' }, `Carga ${c} (límite 12)`),
          c > 12 ? h(Badge, { size: 'sm', tone: 'warning' }, 'Sobre el límite') : null,
          disponible(planta.todo, g) ? null : h(Badge, { size: 'sm', tone: 'neutral' }, 'No disponible'))
      })),
      Etiqueta('Reasignaciones por carga'),
      reas.length
        ? h('ul', { key: 'a', className: 'vv-lista-tk' }, ...reas.map((q) => h('li', { key: q.id, className: 'vv-fila' },
          `${fechaHora(q.fecha)} · ${num(q.ticketId)}: ${nombrePersona(q['deResponsable'])} → ${q['aResponsable'] ? nombrePersona(q['aResponsable']) : 'cola del área'}`)))
        : Nota('Sin reasignaciones por carga.'),
      Nota('La reasignación por carga la hace el balanceo (límite de 12 puntos por gestor); desde este panel no se reasigna a mano.'),
    ] })
  }
  const datoEstacion = (e: MetaEstacionVivo): [string, string] | null => {
    if (e.gateKey) return ['Activos que entraron por aquí', String(planta.activos().filter((t) => canalDe(t) === e.gateKey).length)]
    if (e.clave === 'etapa:bandeja') return ['En espera ahora', String(o.tickets.filter((t) => etapaDe(t) === 'bandeja').length)]
    if (e.clave === 'etapa:comite') return ['En la sala ahora', `${enComite.size} con SLA vencido · ${o.escalamientos.length} escalados en cadena`]
    if (e.clave === 'etapa:salida') return ['Resueltos hoy', String(planta.resueltosHoy())]
    return null
  }
  const simOk = simActiva && Q
  const tarjetaEstacion = (vista === 'todo' || vista === 'estacion') && est ? Tarjeta({
    title: est.nombre, subtitle: `${est.categoria} · ${est.hu}`, as: 'h3',
    actions: h(Badge, { size: 'sm', tone: 'info' }, est.entidad),
  }, Stack({ gap: '3', children: [
    h(CardPairs, { key: 'p', pairs: [
      ['Política operativa', est.rfRn], ['Líder / Custodio', planta.liderEstacion(est)], ['Acuerdo de servicio (SLA)', est.slaRegla],
      ['Información gestionada', est.inputsReales], ...(datoEstacion(est) ? [datoEstacion(est)!] : []),
    ] }),
    Row({ gap: '2', wrap: true, children: [
      est.gateKey && simOk ? h(Button, { key: 'g1', size: 'sm', variant: 'primary', onClick: accion(() => planta.entrante({ gate: est.gateKey })) }, `+ Ingresar por ${planta.nombreCanal(est.gateKey)}`) : null,
      est.gateKey && simOk && pRayo ? h(Button, { key: 'g2', size: 'sm', variant: 'secondary', onClick: accion(() => planta.entrante({ gate: est.gateKey, rayo: true })) }, 'Ingresar con Rayo') : null,
      est.areaKey && simOk && EJEMPLOS_SALA[est.areaKey] ? h(Button, { key: 'a1', size: 'sm', variant: 'primary', onClick: accion(() => planta.haciaSala(est.areaKey!, false)) }, `+ Ticket hacia ${planta.nombreSala(est.areaKey)}`) : null,
      est.areaKey && simOk && pRayo && EJEMPLOS_SALA[est.areaKey] ? h(Button, { key: 'a2', size: 'sm', variant: 'secondary', onClick: accion(() => planta.haciaSala(est.areaKey!, true)) }, 'Con Rayo a esta sala') : null,
      est.areaKey === 'libro' ? h(Button, { key: 'lb', size: 'sm', variant: 'secondary', onClick: () => irA('libro') }, 'Ir al Libro de Reclamaciones') : null,
      est.areaKey && planta.areaFiltro === est.areaKey ? h(Button, { key: 'a3', size: 'sm', variant: 'ghost', onClick: hacer(() => { planta.areaFiltro = '' }) }, 'Ver todas las salas') : null,
      est.clave === 'etapa:comite' && simOk ? h(Button, { key: 'c', size: 'sm', variant: 'danger', onClick: accion(() => planta.forzarVencimientoSla()) }, 'Escalar caso a Comité SGD') : null,
    ] }),
    est.clave === 'etapa:comite'
      ? (enComite.size ? h('ul', { key: 'cm', className: 'vv-lista-tk', 'aria-label': 'Casos en la Sala de Comité' }, ...comite(o).map(filaTicket)) : Nota('Ningún caso con el SLA vencido.'))
      : null,
    est.clave === 'etapa:salida'
      ? (recientes.length ? h('ul', { key: 'sa', className: 'vv-lista-tk', 'aria-label': 'Resueltos recientes' }, ...recientes.map(filaTicket)) : Nota('Sin resueltos recientes.'))
      : null,
    est.areaKey && salas.some((s) => s.k === est.areaKey) ? h('div', { key: 'pa' }, panelArea(est.areaKey)) : null,
  ] })) : null

  const correos = correosAsignacion(o).slice(0, 8)
  const salaDeNumero = (n: string) => { const t = o.tickets.find((q) => q.numero === n); return t ? planta.nombreSala(zonaDe(o, t)) : null }
  const tarjetaCorreos = (vista === 'todo' || vista === 'correos') ? Tarjeta({
    title: 'Correos de asignación (CC Líder de Área)', subtitle: 'Notificación automática en cada despacho', as: 'h3',
    actions: h(Badge, { size: 'sm', tone: 'info' }, `${correos.length} recientes`),
  }, correos.length ? h(Timeline, { label: 'Correos de asignación enviados', ahora: o.ahora, conHora: true, hitos: correos.map((c) => ({
    id: c.id, fecha: c.fecha, autor: fechaHora(c.fecha), tono: 'accent' as const,
    titulo: `${c.masivo && c.tickets.length > 1 ? `${c.tickets.length} tickets reasignados a ${nombrePersona(c.para)}` : `Ticket ${c.tickets[0]} asignado a ${nombrePersona(c.para)}${salaDeNumero(c.tickets[0]!) ? ` en ${salaDeNumero(c.tickets[0]!)}` : ''}`} (CC: ${c.cc ? nombrePersona(c.cc) : sinLider()})`,
  })) }) : Nota('Aún no hay correos de asignación.')) : null

  const cajon = h(Drawer, {
    open: planta.cajonLateralAbierto, onOpenChange: (v: boolean) => { planta.cajonLateralAbierto = v; refrescar() },
    modal: false, side: 'end', size: 'lg', title: 'Bandejas, Estación 3D y Correos CC',
  }, Stack({ gap: '3', children: [
    h(SegmentedControl, { key: 's', label: 'Vista del cajón', size: 'sm', options: OPCIONES_CAJON, value: vista, onValueChange: (v: string) => { planta.cambiarVistaCajon(v); refrescar() } }),
    tarjetaBandeja ? h('div', { key: 'b' }, tarjetaBandeja) : null,
    tarjetaEstacion ? h('div', { key: 'e' }, tarjetaEstacion) : null,
    tarjetaCorreos ? h('div', { key: 'c' }, tarjetaCorreos) : null,
  ] }))

  return h('div', { className: 'pt-pagina pt-pagina--ancha vv-pagina' },
    cabecera,
    Stack({ gap: '4', 'aria-label': 'Panel unificado de Operación en Vivo', children: [
      h('div', { key: '1' }, tarjeta1),
      h('div', { key: '2' }, tarjeta2),
      h('div', { key: '3' }, cajon),
    ] }))
}
