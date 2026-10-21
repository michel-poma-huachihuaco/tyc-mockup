// Estado de la «Operación en Vivo» de Daniel (las señales de su VistaVivoComponent: cajón, vista del cajón, sala, estación y
// ticket elegidos, pausa y velocidad) sobre los DATOS REALES del mockup: los tickets, sus áreas, responsables, SLA, rayo,
// alertas, asignaciones y encuestas salen de `datos()` del modelo (modelo.ts), filtrados por razón social y por las áreas que
// permite el rol (HU-067 CA-07). Su simulación ya no inventa tickets: el ritmo de la planta y los botones de ejemplo pasan por
// el modelo (ticket entrante, cambio de estado, reloj y job de SLA), y las acciones de la ficha por la API de la consola.
import type { SnapDaniel as Snap } from '../three/index.ts'
import { LIDERES_SALA, META_ESTACIONES_VIVO, PUERTAS_CANAL, SALAS_OFICINA, type MetaEstacionVivo, type SalaOficina } from './datos.ts'
import {
  EJEMPLOS_CANAL, EJEMPLOS_SALA, NOMBRE_ESTADO, ORDEN_CANALES, ZONAS, activo, api, canalDe, clienteEjemplo, comite, equipo, etapaDe,
  filtrar, lideresZona, nivelSla, nombrePersona, nombreTipo, ordenBandeja, pasoSimulacion, pctConsumido, puedeRayo, simulacion,
  tieneRayo, vencido, vivo, zonaDe, zonasPermitidas, type Datos, type Persona, type Ticket,
} from './modelo.ts'

export type VistaCajon = 'todo' | 'bandeja' | 'estacion' | 'correos'
type Tono = 'info' | 'warning' | 'danger' | 'success' | 'neutral'
type TonoBarra = 'brand' | 'success' | 'danger'
export interface EstadoResumen { id: string; n: string; v: number; pct: number; tono: Tono; tonoBarra: TonoBarra }
export type NivelVivo = 'ok' | 'riesgo' | 'vencido'

const VACIO: Datos = { ahora: new Date(), tickets: [], filasEstado: [], filasAsignacion: [], alertas: [], encuestas: [], rayos: [], escalamientos: [] }
/** Estaciones cuyo líder de ejemplo (Daniel) es el de una sala: se toma del maestro local de ATC si lo hay. */
const LIDER_DE_SALA: Record<string, [string, string]> = {
  'canal:tel': ['eje1', 'Líder ATC'], 'canal:wa': ['eje1', 'Líder ATC'], 'canal:mail': ['eje1', 'Líder ATC'],
  'etapa:bandeja': ['eje1', 'Supervisión Orquestación'], 'canal:form': ['proy', 'Responsable Proyecto'],
}

export class Planta {
  readonly puertas = PUERTAS_CANAL

  // señales de Daniel
  enEjecucion = true
  velocidad = 1
  cajonLateralAbierto = false
  vistaCajon: VistaCajon = 'todo'
  areaFiltro = ''
  estacionSeleccionadaKey = 'etapa:bandeja'
  ticketSeleccionadoId: string | null = null
  // HU-067: razón social (CA-07), vista 3D o lista por área (CA-09), mensaje y error de la última acción, motivo del rayo
  empresa = ''
  modo: '3d' | 'lista' = '3d'
  sinWebgl = false
  mensaje = ''
  error: unknown = null
  motivoAbierto = false
  motivo = ''
  /** Registro de actividad a la derecha de la escena (CA-06); se puede ocultar para ver la escena más grande. */
  registroVisible = true

  readonly hits: { current: { id: string; x: number; y: number }[] } = { current: [] }
  /** Datos completos del modelo, vista filtrada y persona de la sesión (los pone la vista en cada render). */
  todo: Datos = VACIO
  o: Datos = VACIO
  persona: Persona | null = null
  private clave = ''
  private paso = 0
  private ocupado = false
  private readonly enAtencion = new Map<string, number>()
  private snapCache: { o: Datos; sel: string | null; s: Snap } | null = null

  /** Vuelve a filtrar solo si cambian los datos, la persona o la razón social. */
  actualizar(todo: Datos, persona: Persona | null): void {
    const clave = `${persona?.id ?? ''}|${this.empresa}`
    if (todo === this.todo && clave === this.clave) return
    this.todo = todo
    this.persona = persona
    this.clave = clave
    this.o = filtrar(todo, persona, this.empresa)
  }
  cambiarEmpresa(e: string): void { this.empresa = e; this.clave = ''; this.actualizar(this.todo, this.persona) }

  // ---------------------------------------------------------------- salas permitidas (CA-07)
  salas(): readonly SalaOficina[] {
    const zs = zonasPermitidas(this.persona)
    return SALAS_OFICINA.filter((s) => !zs || zs.has(s.k))
  }
  clavesSalas(): string { return this.salas().map((s) => s.k).join(',') }

  // ---------------------------------------------------------------- computed de Daniel, sobre el modelo
  activos(): Ticket[] { return this.o.tickets.filter(activo) }
  conRayoCount(): number { return this.activos().filter((t) => tieneRayo(this.o, t.id)).length }
  activosEnCursoCount(): number { return this.activos().length }
  enRiesgoCount(): number { return this.activos().filter((t) => this.nivelSlaTicket(t) !== 'ok').length }
  resueltosHoy(): number { return this.o.tickets.filter((t) => t.ultimaResolucion && t.ultimaResolucion.toDateString() === this.o.ahora.toDateString()).length }
  comiteCount(): number { return comite(this.o).length }
  ticketSeleccionado(): Ticket | null {
    const id = this.ticketSeleccionadoId
    return id ? (this.o.tickets.find((t) => t.id === id) ?? null) : null
  }
  estacionActual(): MetaEstacionVivo | null {
    return META_ESTACIONES_VIVO[this.estacionSeleccionadaKey] ?? META_ESTACIONES_VIVO['etapa:bandeja'] ?? null
  }
  /** Bandeja orquestadora y salas del cajón: activos (de la sala elegida), ordenados rayo › SLA › prioridad. */
  ticketsBandeja(): Ticket[] {
    const f = this.areaFiltro
    return this.activos().filter((t) => !f || zonaDe(this.o, t) === f).sort(ordenBandeja(this.o))
  }
  estadosResumen(): EstadoResumen[] {
    const ts = this.o.tickets
    const hoy = this.o.ahora.toDateString()
    const n = (e: string) => ts.filter((t) => t.estado === e).length
    const crudos: Omit<EstadoResumen, 'pct'>[] = [
      { id: 'OPEN', n: NOMBRE_ESTADO['OPEN'] ?? 'Abierto', v: n('OPEN'), tono: 'info', tonoBarra: 'brand' },
      { id: 'IN_PROGRESS', n: 'En curso', v: n('IN_PROGRESS'), tono: 'info', tonoBarra: 'brand' },
      { id: 'PENDING_CUSTOMER', n: 'Espera cliente', v: n('PENDING_CUSTOMER'), tono: 'warning', tonoBarra: 'brand' },
      { id: 'ESCALATED', n: 'Escalado', v: n('ESCALATED'), tono: 'danger', tonoBarra: 'danger' },
      { id: 'REOPENED', n: 'Reabierto', v: n('REOPENED'), tono: 'warning', tonoBarra: 'danger' },
      { id: 'RESOLVED', n: 'Resuelto', v: n('RESOLVED'), tono: 'success', tonoBarra: 'success' },
      { id: 'CLOSED', n: 'Cerrado hoy', v: ts.filter((t) => t.estado === 'CLOSED' && t.cierre && t.cierre.toDateString() === hoy).length, tono: 'success', tonoBarra: 'success' },
    ]
    const maxV = Math.max(1, ...crudos.map((e) => e.v))
    return crudos.map((e) => ({ ...e, pct: Math.round((e.v / maxV) * 100) }))
  }
  totalEstadosCount(): number { return this.estadosResumen().reduce((acc, e) => acc + e.v, 0) }
  equipo() { return equipo(this.o) }

  // ---------------------------------------------------------------- escena 3D (lee la vista filtrada)
  snapshot(): Snap {
    const o = this.o, sel = this.ticketSeleccionadoId
    if (this.snapCache && this.snapCache.o === o && this.snapCache.sel === sel) return this.snapCache.s
    const recientes = new Set(o.tickets.filter((t) => etapaDe(t) === 'salida')
      .sort((a, b) => (b.ultimaResolucion?.getTime() ?? 0) - (a.ultimaResolucion?.getTime() ?? 0)).slice(0, 8).map((t) => t.id))
    const c = o.tickets.filter((t) => activo(t) || recientes.has(t.id)).map((t) => ({ t, zona: zonaDe(o, t), etapa: etapaDe(t) }))
    const permitidas = new Set(this.salas().map((s) => s.k))
    const s: Snap = {
      bandeja: c.filter((x) => x.etapa === 'bandeja').length,
      escalados: o.escalamientos.length,
      comite: comite(o).map((t) => ({ id: t.id, numero: t.numero })),
      zonas: ZONAS.filter((z) => permitidas.has(z.k)).map((z) => {
        const atiende = (g: string) => c.some((x) => x.zona === z.k && x.etapa === 'atencion' && x.t.responsable === g)
        return {
          k: z.k,
          cola: c.filter((x) => x.zona === z.k && (x.etapa === 'cola')).length,
          atencion: c.filter((x) => x.zona === z.k && x.etapa === 'atencion').length,
          riesgo: c.some((x) => x.zona === z.k && x.etapa !== 'salida' && vencido(nivelSla(x.t, o.ahora))),
          gente: z.gente.slice(0, 3).map((g) => ({ id: g, nombre: nombrePersona(g), ocupado: atiende(g) })),
          ocupados: z.gente.filter(atiende).length,
          total: z.gente.length,
        }
      }),
      tickets: c.map((x) => ({
        id: x.t.id, numero: x.t.numero, tipo: x.t.tipo, gate: canalDe(x.t), zona: x.zona, etapa: x.etapa,
        sla: x.etapa === 'salida' ? 'ok' : this.nivelSlaTicket(x.t), rayo: tieneRayo(o, x.t.id), sel: x.t.id === sel,
        resp: x.t.responsable ?? undefined,
      })),
    }
    this.snapCache = { o, sel, s }
    return s
  }

  inspeccionarCanal3D(gateKey: string, sim: boolean): void {
    this.estacionSeleccionadaKey = `canal:${gateKey}`
    this.vistaCajon = 'estacion'
    this.cajonLateralAbierto = true
    if (sim) this.entrante({ gate: gateKey })
  }
  inspeccionarSala3D(areaKey: string): void {
    this.estacionSeleccionadaKey = `sala:${areaKey}`
    this.vistaCajon = 'estacion'
    this.cajonLateralAbierto = true
    this.areaFiltro = areaKey
    const primero = this.activos().filter((t) => zonaDe(this.o, t) === areaKey).sort(ordenBandeja(this.o))[0]
    if (primero) this.ticketSeleccionadoId = primero.id
  }
  inspeccionarEtapa3D(etapa: 'bandeja' | 'comite' | 'salida'): void {
    this.estacionSeleccionadaKey = `etapa:${etapa}`
    this.vistaCajon = 'estacion'
    this.cajonLateralAbierto = true
    if (etapa === 'bandeja') this.areaFiltro = ''
  }

  // ---------------------------------------------------------------- controles (solo en el modo simulación, CA-08)
  alternarPausa(): void { this.enEjecucion = !this.enEjecucion }
  cambiarVelocidad(val: string): void {
    const num = Number(val)
    if (num === 1 || num === 2 || num === 4) this.velocidad = num
  }
  cambiarVistaCajon(vista: string): void {
    if (vista === 'todo' || vista === 'bandeja' || vista === 'estacion' || vista === 'correos') {
      this.vistaCajon = vista
      this.cajonLateralAbierto = true
    }
  }
  /** Un paso del ritmo de la planta (cada 1,5 s / velocidad), sobre los tickets visibles. */
  async tick(): Promise<void> {
    if (this.ocupado) return
    this.ocupado = true
    try { await pasoSimulacion(this.o, this.paso++, this.enAtencion) } finally { this.ocupado = false }
  }

  // ---------------------------------------------------------------- ficha y etiquetas
  nivelSlaTicket(tk: Ticket): NivelVivo {
    const n = nivelSla(tk, this.o.ahora).nivel
    return n === 'vencido' || n === 'fuera-de-plazo' ? 'vencido' : n === 'en-riesgo' ? 'riesgo' : 'ok'
  }
  tonoSlaBadge(tk: Ticket): 'success' | 'warning' | 'danger' {
    const niv = this.nivelSlaTicket(tk)
    return niv === 'vencido' ? 'danger' : niv === 'riesgo' ? 'warning' : 'success'
  }
  tonoSlaBarra(tk: Ticket): 'brand' | 'success' | 'danger' {
    const niv = this.nivelSlaTicket(tk)
    return niv === 'vencido' ? 'danger' : niv === 'riesgo' ? 'brand' : 'success'
  }
  pctSlaRestante(tk: Ticket): number { return 100 - pctConsumido(tk, this.o.ahora) }
  etiquetaSlaTicket(tk: Ticket): string {
    const s = nivelSla(tk, this.o.ahora)
    if (s.nivel === 'cumplido') return 'SLA cumplido'
    if (s.nivel === 'fuera-de-plazo') return 'Resuelto fuera de plazo'
    if (s.nivel === 'vencido') return 'SLA vencido'
    return s.nivel === 'en-riesgo' ? `En riesgo (${this.pctSlaRestante(tk)}%)` : `En plazo (${this.pctSlaRestante(tk)}%)`
  }
  nombreSala(k: string): string {
    if (k === 'bandeja') return 'Bandeja Orquestadora'
    if (k === 'comite') return 'Comité (Mesa SGD)'
    return SALAS_OFICINA.find((s) => s.k === k)?.nombre ?? k
  }
  nombreCanal(k: string): string { return this.puertas.find((p) => p.k === k)?.nombre ?? k }
  nombreTipo(t: string): string { return nombreTipo(t) }
  /** Líder de la estación: el del maestro local de ATC si existe; si no, el de ejemplo de Daniel. */
  liderEstacion(est: MetaEstacionVivo): string {
    if (est.areaKey) return lideresZona(est.areaKey) ?? LIDERES_SALA[est.areaKey] ?? est.lider
    const d = LIDER_DE_SALA[est.clave]
    const l = d ? lideresZona(d[0]) : null
    return l && d ? `${l} (${d[1]})` : est.lider
  }

  // ---------------------------------------------------------------- acciones (modelo real y sus reglas)
  private async hacer(fn: () => Promise<string | null> | string | null): Promise<void> {
    this.error = null
    this.mensaje = ''
    try { const m = await fn(); if (m) this.mensaje = m } catch (e) { this.error = e }
  }
  private num(id: string): string { return this.todo.tickets.find((t) => t.id === id)?.numero ?? '' }
  /** Prioridad Rayo (RN-SVC-031): solo quien puede (la regla del modelo), con motivo y con el tope del 10 % del área. */
  marcarRayo(id: string, motivo: string): Promise<void> {
    return this.hacer(async () => {
      await api.marcarRayo(id, motivo, false)
      this.motivoAbierto = false
      this.motivo = ''
      return `Prioridad Rayo en ${this.num(id)}: sube al tope de la cola de su área.`
    })
  }
  quitarRayo(id: string): Promise<void> {
    return this.hacer(async () => { await api.retirarRayo(id); return `Rayo retirado de ${this.num(id)}.` })
  }
  resolver(id: string): Promise<void> {
    return this.hacer(async () => {
      await api.cambiarEstado(id, 'RESOLVED', 'Resuelto desde la operación en vivo')
      return `${this.num(id)} resuelto: pasa a Cierre en Mi Portal, donde el cliente confirma y responde la encuesta.`
    })
  }
  /** Reasignar por el balanceo de carga del modelo (REASSIGNMENT_CARGA: al gestor disponible con menos carga del área). */
  reasignar(id: string): Promise<void> {
    return this.hacer(async () => {
      const a = await vivo.reasignar(id)
      return `${this.num(id)} reasignado a ${nombrePersona(a)}, el gestor disponible con menos carga del área; le llega el correo con copia a su líder.`
    })
  }
  /** Ticket de ejemplo que entra por un canal (alta + flujo + carga del modelo); con rayo solo si la persona puede marcarlo. */
  private async nuevo(ej: [string, string, string], conRayo: boolean): Promise<string> {
    const [tipo, canal, resumen] = ej
    const tk = vivo.entrante(tipo, canal, clienteEjemplo(this.paso++), resumen, this.empresa || undefined)
    const puerta = this.nombreCanal(canalDe({ tipo, canal }))
    let txt = `Entró ${tk.numero} por ${puerta}: ${tk.resultado === 'asignado' ? 'la bandeja lo asignó por carga' : 'quedó en la cola de su área'}.`
    if (conRayo && this.persona && puedeRayo(this.persona)) {
      try { await api.marcarRayo(tk.id, 'Ingreso con Prioridad Rayo (simulación)', false); txt = `Entró ${tk.numero} por ${puerta} con Prioridad Rayo: sube al tope de la cola.` } catch (e) { this.error = e }
    }
    this.ticketSeleccionadoId = tk.id
    return txt
  }
  entrante(op: { gate?: string; rayo?: boolean } = {}): Promise<void> {
    const k = op.gate ?? ORDEN_CANALES[this.paso % ORDEN_CANALES.length]!
    return this.hacer(() => this.nuevo(EJEMPLOS_CANAL[k] ?? EJEMPLOS_CANAL['tel']!, !!op.rayo))
  }
  haciaSala(k: string, rayo: boolean): Promise<void> {
    const ej = EJEMPLOS_SALA[k]
    return ej ? this.hacer(() => this.nuevo(ej, rayo)) : Promise.resolve()
  }
  simularPicoMasivo(): Promise<void> {
    return this.hacer(async () => {
      for (let i = 0; i < ORDEN_CANALES.length; i++) await this.nuevo(EJEMPLOS_CANAL[ORDEN_CANALES[i]!]!, i === 0)
      return 'Pico multicanal: entraron 5 tickets, uno por canal; la bandeja los ordena por rayo, SLA y prioridad.'
    })
  }
  /** «Escalar a Comité SGD»: adelanta el reloj las horas hábiles que faltan para que venza el SLA del ticket visible más
   *  próximo a vencer; el job de SLA avisa por correo al responsable con copia a su líder y el caso pasa a la Sala de Comité. */
  forzarVencimientoSla(): Promise<void> {
    return this.hacer(() => {
      const o = this.o
      const cand = this.activos().filter((t) => nivelSla(t, o.ahora).nivel !== 'vencido')
        .sort((a, b) => nivelSla(a, o.ahora).vence.getTime() - nivelSla(b, o.ahora).vence.getTime())[0]
      if (!cand) return 'No hay tickets activos por vencer en la vista.'
      const h = vivo.horas(this.todo, cand.id)
      if (h == null) return `El SLA de ${cand.numero} no vence en los próximos 60 días hábiles.`
      if (h > 0) simulacion.avanzar(h)
      this.ticketSeleccionadoId = cand.id
      return `El reloj avanzó ${h} h hábil${h === 1 ? '' : 'es'}: venció el SLA de ${cand.numero}, se avisó por correo a su responsable con copia a su líder y el caso pasó a la Sala de Comité.`
    })
  }
}
