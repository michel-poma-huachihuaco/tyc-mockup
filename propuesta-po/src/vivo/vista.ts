// «Operación en Vivo» igual que la de Daniel (origin/prototipo-polar): cabecera de página de su consola (consola-atc.ts) y el
// template de su VistaVivoComponent (vista-vivo.ts) traducido de @aybarcorp/ui-angular a @aybarcorp/ui (mismo sistema de
// diseño, mismas clases ay-*). Sus datos de ejemplo y su simulación están en datos.ts y planta.ts; la escena 3D es su
// three/vivo.ts (src/three/vivo-daniel.ts). Cambios: la insignia del usuario sale de la sesión; «Ver expediente» abre el
// ticket de nuestro modelo con ese número si existe (si no, la Bandeja) e «Ir a Bandeja» va a #/bandeja; sin códigos de
// trazabilidad en los títulos. El «Modo simulación» de Herramientas pausa o reanuda la planta.
import { leerTokenRgb, montarVivoDaniel } from 'aybar:escenas'
import type { ColsDaniel as Cols, EstaticoDaniel as Estatico } from '../three/index.ts'
import { COLOR_CANAL_RGB, COLOR_ZONA_RGB, type TicketVivo } from './datos.ts'
import { inyectarEstilosVivo } from './estilos.ts'
import { Circ, Divider, Grid, Rating, Row, Stack, Stat, Tag, Timeline, h, ruta, ui, usarEstado, usarPersona, useEffect, useRef, useState } from './kit.ts'
import { Planta } from './planta.ts'

const ROLES: Record<string, string> = {
  GESTOR: 'Gestor de tickets', COLABORADOR: 'Colaborador de área', SUPERVISOR: 'Supervisor ATC', COORDINADOR_CX: 'Coordinador CX',
  LEGAL_RECLAMOS: 'Responsable legal de reclamos', MESA_SGD: 'Gestora de la Mesa SGD', MODERADOR_EVENTO: 'Moderador de evento',
  ADMIN_FUNCIONAL: 'Administrador funcional', CONTROL_ACCESO: 'Control de acceso (garita)', CLIENTE: 'Cliente convocado (Mi Portal)',
  SIN_ATENCION: 'Rol sin atención',
}
const OPCIONES_VELOCIDAD = [{ value: '1', label: '1× Normal' }, { value: '2', label: '2× Rápido' }, { value: '4', label: '4× Turbo' }]
const OPCIONES_CAJON = [{ value: 'todo', label: 'Todas' }, { value: 'bandeja', label: 'Bandeja' }, { value: 'estacion', label: 'Estación' }, { value: 'correos', label: 'Correos CC' }]

const { Button, Badge, PageHeader, Card, CardBody, CardHeader, CardPairs, Select, Drawer, SegmentedControl, Breadcrumb, ProgressBar } = ui
const Tarjeta = (cabecera: Record<string, unknown> | null, cuerpo: unknown, props: Record<string, unknown> = {}) =>
  h(Card, props, cabecera ? h(CardHeader, cabecera) : null, h(CardBody, null, cuerpo))
const Kpi = (...hijos: unknown[]) => h(Card, { variant: 'default' }, h(CardBody, { padding: 'sm' }, ...hijos))

export function VivoDaniel() {
  inyectarEstilosVivo()
  const [planta] = useState(() => new Planta())
  const [, setVersion] = useState(0)
  const refrescar = () => setVersion((v) => v + 1)
  const hacer = (fn: () => void) => () => { fn(); refrescar() }
  const host = useRef<HTMLDivElement | null>(null)
  const lienzo = useRef<HTMLCanvasElement | null>(null)
  const { datos, sim } = usarEstado()
  const persona = usarPersona()

  // Herramientas › Simulación › «Modo simulación»: apagado, la planta queda en pausa (los controles de Daniel siguen mandando)
  const simActiva = sim?.vivoSimulacion !== false
  useEffect(() => { planta.enEjecucion = simActiva; refrescar() }, [simActiva])

  // el setInterval de 220 ms de Daniel
  useEffect(() => {
    const iv = setInterval(() => { if (planta.enEjecucion) { planta.tick(); refrescar() } }, 220)
    return () => clearInterval(iv)
  }, [])

  // escena 3D (montarVivo de Daniel, con sus colores)
  useEffect(() => {
    const canvas = lienzo.current, hostEl = host.current
    if (!canvas || !hostEl) return
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
      zonas: planta.salas.map((s) => ({ k: s.k, n: s.nombre, color: COLOR_ZONA_RGB[s.k] ?? cols.teal2 })),
      compuertas: planta.puertas.map((p) => ({ k: p.k, n: p.nombre, sigla: p.ic, color: COLOR_CANAL_RGB[p.k] ?? cols.teal2 })),
    }
    const reducido = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
    return montarVivoDaniel({
      canvas, host: hostEl, cols, reducido, est, hits: planta.hits,
      obtener: () => planta.snapshot(),
      alClickTicket: (id) => { planta.ticketSeleccionadoId = id; refrescar() },
      alClickCanal: (k) => { planta.inspeccionarCanal3D(k); refrescar() },
      alClickSala: (k) => { planta.inspeccionarSala3D(k); refrescar() },
      alClickEtapa: (e) => { planta.inspeccionarEtapa3D(e); refrescar() },
    })
  }, [])

  const irA = (r: string) => { location.hash = ruta(r) }
  // «Ver expediente»: el ticket de nuestro modelo con el mismo número, si existe; si no, la Bandeja
  const verExpediente = (tk: TicketVivo) => {
    const real = datos?.tickets?.find((t: { numero: string }) => t.numero === tk.numero)
    irA(real ? `ticket/${real.id}` : 'bandeja')
  }

  const bandeja = planta.ticketsFiltradosBandeja()
  const tk = planta.ticketSeleccionado()
  const est = planta.estacionActual()
  const vista = planta.vistaCajon
  const pctSla = planta.pctCumplimientoSla()
  const nps = planta.npsPreliminarValor()
  const estados = planta.estadosResumen()
  const opcionesSalas = [{ value: '', label: 'Todas las salas (6 áreas)' }, ...planta.salas.map((s) => ({ value: s.k, label: s.nombre }))]

  // ------------------------------------------------------------------ cabecera de página (consola de Daniel)
  const cabecera = h(PageHeader, {
    title: 'Operación en Vivo',
    description: 'Planta de atención en tiempo real, colas y niveles de servicio',
    size: 'md',
    breadcrumb: h(Breadcrumb, { label: 'Ruta del módulo', items: [{ label: 'Aybar Atiende' }, { label: 'Núcleo 360 y Planta' }, { label: 'Operación en Vivo' }] }),
    meta: h('span', { className: 'ay-row ay-row--2 ay-row--wrap' },
      h(Badge, { tone: 'success', dot: true }, 'En línea · 8 sistemas'),
      persona ? h(Badge, { tone: 'info' }, `${persona.nombre} (${ROLES[persona.rol] ?? persona.rol})`) : null),
  })

  // ------------------------------------------------------------------ 1. controles + KPI + tickets por estado
  const controles = Row({ gap: '2', wrap: true, children: [
    h(Button, { key: 'p', size: 'sm', variant: 'primary', onClick: hacer(() => planta.alternarPausa()) }, planta.enEjecucion ? 'Pausar planta' : 'Reanudar planta'),
    h(SegmentedControl, { key: 'v', label: 'Velocidad de planta', size: 'sm', options: OPCIONES_VELOCIDAD, value: String(planta.velocidad), onValueChange: (v: string) => { planta.cambiarVelocidad(v); refrescar() } }),
    h(Button, { key: 't', size: 'sm', variant: 'secondary', onClick: hacer(() => planta.inyectarTicket({ rayo: false })) }, '+ Ticket entrante'),
    h(Button, { key: 'r', size: 'sm', variant: 'secondary', onClick: hacer(() => planta.inyectarTicket({ rayo: true })) }, 'Ticket con Prioridad Rayo'),
    h(Button, { key: 'e', size: 'sm', variant: 'danger', onClick: hacer(() => planta.forzarVencimientoSla()) }, 'Escalar a Comité SGD'),
    h(Button, { key: 'm', size: 'sm', variant: 'ghost', onClick: hacer(() => planta.simularPicoMasivo()) }, 'Pico +5 multicanal'),
  ] })

  const riesgo = planta.enRiesgoCount()
  const kpis = Grid({ columnas: 5, children: [
    h('div', { key: 'a' }, Kpi(Stack({ gap: '2', align: 'start', children: [
      h(Stat, { key: 's', label: 'Tickets activos', value: planta.activosEnCursoCount(), size: 'sm' }),
      h(Badge, { key: 'b', size: 'sm', tone: riesgo > 0 ? 'warning' : 'success' }, riesgo > 0 ? `${riesgo} en riesgo` : 'Sin riesgos'),
    ] }))),
    h('div', { key: 'b' }, Kpi(Row({ gap: '3', children: [
      h(Circ, { key: 'c', label: 'Resueltos en SLA', value: pctSla, size: 'md', tone: pctSla >= 90 ? 'success' : 'warning' }),
      Stack({ gap: '1', children: [
        h(Stat, { key: 's', label: 'Resueltos en SLA', value: pctSla, unit: '%', size: 'sm' }),
        h('span', { key: 't', className: 'ay-text--subtitle ay-text--sm' }, `${planta.cerradosEnSlaHoy} de ${planta.cerradosHoy} (Meta 90%)`),
      ] }),
    ] }))),
    h('div', { key: 'c' }, Kpi(Stack({ gap: '2', children: [
      h(Stat, { key: 's', label: 'CSAT del día', value: planta.csatPromedio.toFixed(1), unit: '/ 5', size: 'sm' }),
      h(Rating, { key: 'r', label: 'Satisfacción CSAT', value: planta.csatPromedio, allowHalf: true, count: planta.csatRespuestas, size: 'sm' }),
    ] }))),
    h('div', { key: 'd' }, Kpi(Stack({ gap: '2', children: [
      Row({ gap: '2', justify: 'between', children: [
        h(Stat, { key: 's', label: `Nivel ${planta.nivelEquipo} del equipo`, value: planta.xpEquipo, unit: `/ ${planta.metaXpNivel} XP`, size: 'sm' }),
        h(Badge, { key: 'b', size: 'sm', tone: 'info' }, `Racha ${planta.rachaSla}`),
      ] }),
      h(ProgressBar, { key: 'p', label: 'Experiencia del equipo', hideLabel: true, value: planta.pctXpEquipo(), detail: `Faltan ${planta.metaXpNivel - planta.xpEquipo} XP`, size: 'sm', tone: 'brand' }),
    ] }))),
    h('div', { key: 'e' }, Kpi(Stack({ gap: '2', align: 'start', children: [
      h(Stat, { key: 's', label: 'NPS del turno', value: `${nps > 0 ? '+' : ''}${nps}`, size: 'sm' }),
      h(Badge, { key: 'b', size: 'sm', tone: nps >= 30 ? 'success' : 'warning' }, `Encuestas n=${planta.csatRespuestas}`),
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
    title: 'Operación en Vivo 3D · Robot Orquestador · 5 Canales de Entrada · 6 Salas de Atención',
    subtitle: 'Monitoreo en tiempo real del flujo de tickets, despacho automático por menor carga y SLA',
    as: 'h3',
    actions: Row({ gap: '2', wrap: true, children: [
      h(Select, { key: 's', size: 'sm', 'aria-label': 'Sala', value: planta.areaFiltro, options: opcionesSalas, onChange: (ev: { target: { value: string } }) => { planta.areaFiltro = ev.target.value; refrescar() } }),
      h(Button, { key: 'b', size: 'sm', variant: planta.cajonLateralAbierto ? 'primary' : 'secondary', 'aria-expanded': planta.cajonLateralAbierto, onClick: hacer(() => { planta.cajonLateralAbierto = !planta.cajonLateralAbierto }) },
        planta.cajonLateralAbierto ? 'Cerrar cajón de bandejas' : `Bandejas operativas (${bandeja.length})`),
    ] }),
  }, Stack({ gap: '3', children: [h('div', { key: 'c' }, controles), h('div', { key: 'k' }, kpis), h('div', { key: 'e' }, porEstado)] }))

  // ------------------------------------------------------------------ 2. escena 3D + ficha + leyenda
  const ficha = tk ? h('div', { className: 'pl-atc-ficha-flotante pl-atc-ficha-flotante--izq', role: 'dialog', 'aria-modal': 'false', 'aria-label': 'Ficha del ticket en escena 3D' },
    h(Card, null,
      h(CardHeader, {
        title: tk.numero, subtitle: tk.resumen, as: 'h3',
        actions: Row({ gap: '2', wrap: true, children: [
          h(Badge, { key: 'p', size: 'sm', tone: tk.rayo ? 'warning' : 'info' }, tk.rayo ? 'Prioridad Rayo' : tk.prio),
          h(Badge, { key: 's', size: 'sm', tone: planta.tonoSlaBadge(tk) }, planta.etiquetaSlaTicket(tk)),
          h(Button, { key: 'x', size: 'sm', variant: 'ghost', 'aria-label': 'Cerrar ficha', onClick: hacer(() => { planta.ticketSeleccionadoId = null }) }, 'Cerrar'),
        ] }),
      }),
      h(CardBody, null, Stack({ gap: '3', children: [
        h(ProgressBar, { key: 'b', label: 'SLA restante en turno', value: planta.pctSlaRestante(tk), detail: `${planta.pctSlaRestante(tk)}% restante`, tone: planta.tonoSlaBarra(tk), size: 'sm' }),
        h(CardPairs, { key: 'p', pairs: planta.paresTicketVivo(tk) }),
        Stack({ gap: '1', children: [
          h('span', { key: 't', className: 'ay-text--label' }, 'Recorrido en tiempo real'),
          h(Timeline, { key: 'l', label: 'Recorrido del ticket en planta', hitos: planta.hitosTicketVivo(tk) }),
        ] }),
        h(Divider, { key: 'd' }),
        Row({ gap: '2', wrap: true, children: [
          h(Button, { key: 'r', size: 'sm', variant: 'secondary', onClick: hacer(() => planta.alternarRayoTicket(tk.id)) }, tk.rayo ? 'Quitar Rayo' : 'Prioridad Rayo'),
          h(Button, { key: 'v', size: 'sm', variant: 'primary', onClick: hacer(() => planta.resolverTicketInmediato(tk.id)) }, 'Resolver a Mi Portal'),
          h(Button, { key: 'g', size: 'sm', variant: 'ghost', onClick: hacer(() => planta.reasignarMenorCarga(tk.id)) }, 'Reasignar gestor'),
          h(Button, { key: 'e', size: 'sm', variant: 'ghost', onClick: () => verExpediente(tk) }, 'Ver expediente'),
        ] }),
      ] })))) : null

  const leyenda = Row({ gap: '2', wrap: true, children: [
    h(Tag, { key: 1, variant: 'outline', dotColor: 'var(--aybar-color-feedback-success-border)' }, 'LED verde: En plazo SLA'),
    h(Tag, { key: 2, variant: 'outline', dotColor: 'var(--aybar-color-feedback-warning-border)' }, 'LED ámbar pulsante: SLA en riesgo (<25%)'),
    h(Tag, { key: 3, variant: 'outline', dotColor: 'var(--aybar-color-feedback-danger-border)' }, 'LED rojo / Comité SGD: SLA vencido'),
    h(Tag, { key: 4, variant: 'outline', dotColor: 'var(--aybar-color-secondary-400)' }, 'Relámpago 3D giratorio: Prioridad Rayo'),
    h(Tag, { key: 5, variant: 'outline', dotColor: 'var(--aybar-color-primary-500)' }, 'Robot Orquestador: Despacho automático por carga'),
  ] })

  const tarjeta2 = Tarjeta({
    title: 'Planta de Atención en Vivo · Robot Orquestador · 6 Salas · Comité SGD · Cierre en Mi Portal',
    subtitle: 'Haz clic en cualquier tarjeta 3D, canal o sala para inspeccionar su detalle en tiempo real o abre el cajón de bandejas.',
    as: 'h3',
    actions: Row({ gap: '2', wrap: true, children: [
      h(Badge, { key: 'r', size: 'sm', tone: 'success' }, `${planta.cerradosHoy} resueltos hoy`),
      h(Badge, { key: 'y', size: 'sm', tone: 'warning' }, `${planta.conRayoCount()} con Rayo`),
      h(Badge, { key: 'c', size: 'sm', tone: planta.escaladosCount > 0 ? 'danger' : 'neutral' }, `${planta.escaladosCount} en Comité SGD`),
    ] }),
  }, Stack({ gap: '3', children: [
    h('div', { key: 'e', ref: host, className: 'atc-vivo-stage-area' },
      h('canvas', { ref: lienzo, style: { display: 'block', width: '100%', cursor: 'pointer' } }),
      ficha),
    h('div', { key: 'l' }, leyenda),
  ] }))

  // ------------------------------------------------------------------ 3. cajón lateral
  const tarjetaBandeja = (vista === 'todo' || vista === 'bandeja') ? Tarjeta({
    title: `Bandeja Orquestadora y Salas (${bandeja.length})`,
    subtitle: 'Orden: Rayo · SLA · Menor carga (clic para abrir ficha en escena)',
    as: 'h3',
    actions: Row({ gap: '2', wrap: true, children: [
      h(Badge, { key: 'f', size: 'sm', tone: 'info' }, planta.areaFiltro ? planta.nombreSala(planta.areaFiltro) : 'Todas las salas'),
      h(Button, { key: 'i', size: 'sm', variant: 'ghost', onClick: () => irA('bandeja') }, 'Ir a Bandeja'),
    ] }),
  }, Stack({ gap: '2', children: bandeja.map((t) => h(Card, {
    key: t.id, variant: 'selectable', selected: planta.ticketSeleccionadoId === t.id,
    onClick: hacer(() => { planta.ticketSeleccionadoId = t.id }),
  }, h(CardBody, { padding: 'sm' }, Stack({ gap: '1', children: [
    Row({ gap: '2', wrap: true, justify: 'between', children: [
      Row({ gap: '2', wrap: true, children: [
        h('strong', { key: 'n', className: 'ay-text--mono ay-text--sm' }, t.numero),
        t.rayo ? h(Badge, { key: 'r', size: 'sm', tone: 'warning' }, 'RAYO') : null,
        h('span', { key: 'c', className: 'ay-text--subtitle ay-text--sm' }, t.cli),
      ] }),
      h(Badge, { key: 's', size: 'sm', tone: t.esc ? 'danger' : planta.pctSlaRestante(t) < 25 ? 'warning' : 'success' }, t.esc ? 'Comité SGD' : `${planta.pctSlaRestante(t)}% SLA`),
    ] }),
    Row({ gap: '2', wrap: true, justify: 'between', children: [
      h('span', { key: 'd', className: 'ay-text--subtitle ay-text--sm' }, `${planta.nombreTipoSim(t.type)} · ${planta.nombreSala(t.area)} (${planta.etiquetaEtapa(t.etapa)})`),
      h(Button, { key: 'r', size: 'sm', variant: 'ghost', onClick: (ev: { stopPropagation: () => void }) => { ev.stopPropagation(); planta.alternarRayoTicket(t.id); refrescar() } }, t.rayo ? 'Quitar Rayo' : 'Rayo'),
    ] }),
  ] })))) })) : null

  const tarjetaEstacion = (vista === 'todo' || vista === 'estacion') && est ? Tarjeta({
    title: est.nombre, subtitle: `${est.categoria} · ${est.hu}`, as: 'h3',
    actions: h(Badge, { size: 'sm', tone: 'info' }, est.entidad),
  }, Stack({ gap: '3', children: [
    h(CardPairs, { key: 'p', pairs: planta.paresEstacionVivo(est) }),
    Row({ gap: '2', wrap: true, children: [
      est.gateKey ? h(Button, { key: 'g1', size: 'sm', variant: 'primary', onClick: hacer(() => planta.inyectarTicket({ gate: est.gateKey, rayo: false })) }, `+ Ingresar por ${planta.nombreCanal(est.gateKey)}`) : null,
      est.gateKey ? h(Button, { key: 'g2', size: 'sm', variant: 'secondary', onClick: hacer(() => planta.inyectarTicket({ gate: est.gateKey, rayo: true })) }, 'Ingresar con Rayo') : null,
      est.areaKey ? h(Button, { key: 'a1', size: 'sm', variant: 'primary', onClick: hacer(() => planta.inyectarTicketEnSala(est.areaKey!, false)) }, `+ Ticket hacia ${planta.nombreSala(est.areaKey)}`) : null,
      est.areaKey ? h(Button, { key: 'a2', size: 'sm', variant: 'secondary', onClick: hacer(() => planta.inyectarTicketEnSala(est.areaKey!, true)) }, 'Con Rayo a esta sala') : null,
      est.areaKey && planta.areaFiltro === est.areaKey ? h(Button, { key: 'a3', size: 'sm', variant: 'ghost', onClick: hacer(() => { planta.areaFiltro = '' }) }, 'Ver todas las salas') : null,
      est.clave === 'etapa:comite' ? h(Button, { key: 'c', size: 'sm', variant: 'danger', onClick: hacer(() => planta.forzarVencimientoSla()) }, 'Escalar caso a Comité SGD') : null,
    ] }),
  ] })) : null

  const tarjetaCorreos = (vista === 'todo' || vista === 'correos') ? Tarjeta({
    title: 'Correos de asignación (CC Líder de Área)', subtitle: 'Notificación automática en cada despacho', as: 'h3',
    actions: h(Badge, { size: 'sm', tone: 'info' }, `${planta.correosEnviados.length} recientes`),
  }, h(Timeline, { label: 'Correos de asignación enviados', hitos: planta.hitosCorreosEnviados() })) : null

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
