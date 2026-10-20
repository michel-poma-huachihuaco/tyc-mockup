// Simulación de la planta de la «Operación en Vivo» de Daniel (VistaVivoComponent de origin/prototipo-polar,
// frontend/src/app/pantallas/atc/vista-vivo.ts), portada sin cambios de lógica: sus señales son campos de esta clase y
// sus `computed`, métodos. La vista (vista.ts) vuelve a pintar tras cada paso o acción y la escena 3D lee `snapshot()`.
import type { SnapDaniel as Snap } from '../three/index.ts'
import {
  CLIENTES_SIM,
  LIDERES_SALA,
  META_ESTACIONES_VIVO,
  PUERTAS_CANAL,
  SALAS_OFICINA,
  TIPOS_SIMULACION,
  type CorreoAsignacionLog,
  type MetaEstacionVivo,
  type SalaOficina,
  type TicketVivo,
} from './datos.ts'

export type VistaCajon = 'todo' | 'bandeja' | 'estacion' | 'correos'
type Tono = 'info' | 'warning' | 'danger' | 'success' | 'neutral'
type TonoBarra = 'brand' | 'success' | 'danger'
export interface EstadoResumen { id: string; n: string; v: number; pct: number; tono: Tono; tonoBarra: TonoBarra }

const horaAhora = (): string => new Date().toTimeString().slice(0, 8)

export class Planta {
  readonly puertas = PUERTAS_CANAL
  readonly salas = SALAS_OFICINA
  readonly metaXpNivel = 150

  enEjecucion = true
  velocidad = 1
  cajonLateralAbierto = false
  vistaCajon: VistaCajon = 'todo'
  areaFiltro = ''
  estacionSeleccionadaKey = 'etapa:bandeja'
  ticketSeleccionadoId: string | null = null

  cerradosHoy = 38
  cerradosEnSlaHoy = 35
  escaladosCount = 2
  reabiertosHoy = 1
  xpEquipo = 115
  nivelEquipo = 4
  rachaSla = 11
  csatPromedio = 4.8
  csatRespuestas = 29

  ticketsActivos: TicketVivo[] = []
  correosEnviados: CorreoAsignacionLog[] = [
    {
      id: 'MAIL-01',
      hora: '10:28:14',
      ticketId: 'AIN-000201',
      gestor: 'Ana P. (Atención Eje 1)',
      liderCopia: LIDERES_SALA['eje1']!,
      sala: 'Atención Eje 1',
      slaTexto: 'SLA 1.ª resp: 2 h hábiles',
    },
    {
      id: 'MAIL-02',
      hora: '10:29:02',
      ticketId: 'AIN-000202',
      gestor: 'Carla V. (Cobranza)',
      liderCopia: LIDERES_SALA['cob']!,
      sala: 'Cobranza',
      slaTexto: 'Prioridad Rayo · SLA resolución: 24 h',
    },
  ]

  readonly hits: { current: { id: string; x: number; y: number }[] } = { current: [] }
  private seqId = 200
  private spawnTimer = 0
  private readonly ocupacionEscritorios: Record<string, { id: string; nombre: string; ticketId: string | null; atendidos: number }[]> = {}

  constructor() {
    this.salas.forEach((r) => {
      this.ocupacionEscritorios[r.k] = r.gestores.map((nombre, i) => ({ id: `${r.k}:g${i}`, nombre, ticketId: null, atendidos: 3 + (i % 2) }))
    })
    for (let i = 0; i < 10; i++) this.inyectarTicket({ rayo: i === 1 || i === 5, silencioso: true })
    for (let i = 0; i < 14; i++) this.ejecutarPasoSimulacion()
  }

  /** Lo que hace el setInterval de 220 ms de Daniel: tantos pasos como la velocidad, si la planta no está en pausa. */
  tick(): void {
    if (!this.enEjecucion) return
    for (let k = 0; k < this.velocidad; k++) this.ejecutarPasoSimulacion()
  }

  // ---------------------------------------------------------------- computed de Daniel
  conRayoCount(): number { return this.ticketsActivos.filter((t) => t.rayo).length }
  activosEnCursoCount(): number { return this.ticketsActivos.filter((t) => t.etapa !== 'salida').length }
  enRiesgoCount(): number {
    return this.ticketsActivos.filter((t) => t.etapa !== 'salida' && (t.esc || (t.slaMax - t.age) / t.slaMax < 0.25)).length
  }
  pctCumplimientoSla(): number {
    const res = this.cerradosHoy
    const enSla = Math.min(res, this.cerradosEnSlaHoy)
    return res > 0 ? Math.round((enSla / res) * 100) : 92
  }
  npsPreliminarValor(): number {
    const nCsat = this.csatRespuestas
    if (nCsat <= 0) return 46
    const prom = Math.round(nCsat * 0.72)
    const pas = Math.round(nCsat * 0.18)
    const det = Math.max(0, nCsat - prom - pas)
    return Math.round(((prom - det) / nCsat) * 100)
  }
  ticketSeleccionado(): TicketVivo | null {
    const id = this.ticketSeleccionadoId
    if (!id) return null
    return this.ticketsActivos.find((t) => t.id === id) ?? null
  }
  estacionActual(): MetaEstacionVivo | null {
    return META_ESTACIONES_VIVO[this.estacionSeleccionadaKey] ?? META_ESTACIONES_VIVO['etapa:bandeja'] ?? null
  }
  ticketsFiltradosBandeja(): TicketVivo[] {
    const filtro = this.areaFiltro
    const lista = this.ticketsActivos.filter((t) => !filtro || t.area === filtro)
    lista.sort((a, b) => {
      if (a.rayo !== b.rayo) return a.rayo ? -1 : 1
      return a.slaMax - a.age - (b.slaMax - b.age)
    })
    return lista.slice(0, 10)
  }
  pctXpEquipo(): number { return Math.min(100, Math.round((this.xpEquipo / this.metaXpNivel) * 100)) }
  estadosResumen(): EstadoResumen[] {
    const lista = this.ticketsActivos
    const enCurso = lista.filter((t) => t.etapa !== 'salida')
    const crudos: Omit<EstadoResumen, 'pct'>[] = [
      { id: 'OPEN', n: 'Abierto', v: enCurso.filter((t) => t.stateRf004 === 'OPEN').length, tono: 'info', tonoBarra: 'brand' },
      { id: 'IN_PROGRESS', n: 'En curso', v: enCurso.filter((t) => t.stateRf004 === 'IN_PROGRESS').length, tono: 'info', tonoBarra: 'brand' },
      { id: 'PENDING_CUSTOMER', n: 'Espera cliente', v: enCurso.filter((t) => t.stateRf004 === 'PENDING_CUSTOMER').length, tono: 'warning', tonoBarra: 'brand' },
      { id: 'ESCALATED', n: 'Escalado', v: this.escaladosCount, tono: 'danger', tonoBarra: 'danger' },
      { id: 'REOPENED', n: 'Reabierto', v: this.reabiertosHoy, tono: 'warning', tonoBarra: 'danger' },
      { id: 'RESOLVED', n: 'Resuelto', v: lista.filter((t) => t.etapa === 'salida').length, tono: 'success', tonoBarra: 'success' },
      { id: 'CLOSED', n: 'Cerrado hoy', v: this.cerradosHoy, tono: 'success', tonoBarra: 'success' },
    ]
    const maxV = Math.max(1, ...crudos.map((e) => e.v))
    return crudos.map((e) => ({ ...e, pct: Math.round((e.v / maxV) * 100) }))
  }
  totalEstadosCount(): number { return this.estadosResumen().reduce((acc, e) => acc + e.v, 0) }

  // ---------------------------------------------------------------- escena 3D
  snapshot(): Snap {
    const lista = this.ticketsActivos
    const selId = this.ticketSeleccionadoId
    const zonas = this.salas.map((s) => {
      const desks = this.ocupacionEscritorios[s.k] ?? []
      const enSala = lista.filter((t) => t.area === s.k && t.etapa !== 'salida')
      return {
        k: s.k,
        cola: enSala.filter((t) => t.etapa === 'cola' || t.etapa === 'bandeja').length,
        atencion: enSala.filter((t) => t.etapa === 'atencion').length,
        riesgo: enSala.some((t) => this.nivelSlaTicket(t) !== 'ok'),
        gente: desks.map((d) => ({ id: d.id, nombre: d.nombre, ocupado: d.ticketId !== null })),
      }
    })
    return {
      zonas,
      bandeja: lista.filter((t) => t.etapa === 'bandeja').length,
      escalados: this.escaladosCount,
      tickets: lista.map((t) => ({
        id: t.id, numero: t.numero, gate: t.gate, zona: t.area, etapa: t.etapa, sla: this.nivelSlaTicket(t), rayo: t.rayo,
        sel: t.id === selId, resp: t.resp,
      })),
    }
  }

  inspeccionarCanal3D(gateKey: string): void {
    this.estacionSeleccionadaKey = `canal:${gateKey}`
    this.vistaCajon = 'estacion'
    this.cajonLateralAbierto = true
    this.inyectarTicket({ gate: gateKey })
  }
  inspeccionarSala3D(areaKey: string): void {
    this.estacionSeleccionadaKey = `sala:${areaKey}`
    this.vistaCajon = 'estacion'
    this.cajonLateralAbierto = true
    this.areaFiltro = areaKey
    const primeroDeSala = this.ticketsActivos.find((t) => t.area === areaKey && t.etapa !== 'salida')
    if (primeroDeSala) this.ticketSeleccionadoId = primeroDeSala.id
  }
  inspeccionarEtapa3D(etapa: 'bandeja' | 'comite' | 'salida'): void {
    this.estacionSeleccionadaKey = `etapa:${etapa}`
    this.vistaCajon = 'estacion'
    this.cajonLateralAbierto = true
    if (etapa === 'bandeja') this.areaFiltro = ''
  }
  inyectarTicketEnSala(areaKey: string, rayo: boolean): void {
    const entrada = Object.entries(TIPOS_SIMULACION).find(([, v]) => v.area === areaKey)
    this.inyectarTicket({ type: entrada?.[0] ?? 'cons', rayo })
  }

  // ---------------------------------------------------------------- controles
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

  // ---------------------------------------------------------------- ficha y etiquetas
  tonoSlaBadge(tk: TicketVivo): 'success' | 'warning' | 'danger' {
    const niv = this.nivelSlaTicket(tk)
    return niv === 'vencido' ? 'danger' : niv === 'riesgo' ? 'warning' : 'success'
  }
  tonoSlaBarra(tk: TicketVivo): 'brand' | 'success' | 'danger' {
    const niv = this.nivelSlaTicket(tk)
    return niv === 'vencido' ? 'danger' : niv === 'riesgo' ? 'brand' : 'success'
  }
  paresTicketVivo(tk: TicketVivo): [string, string][] {
    return [
      ['Cliente / Lote', `${tk.cli} · ${tk.lote}`],
      ['Canal de entrada', this.nombreCanal(tk.gate)],
      ['Sala / Área', this.nombreSala(tk.area)],
      ['Responsable', tk.respNombre ?? 'Bandeja Orquestadora'],
    ]
  }
  hitosTicketVivo(tk: TicketVivo) {
    return tk.hitos.map((hito, idx) => ({
      id: `${tk.id}-h-${idx}`,
      titulo: hito,
      fecha: new Date(),
      autor: tk.respNombre ?? 'Robot Orquestador',
      tono: (idx === 0 ? (tk.esc ? 'danger' : tk.rayo ? 'accent' : 'success') : 'default') as 'default' | 'accent' | 'success' | 'danger',
    }))
  }
  paresEstacionVivo(est: MetaEstacionVivo): [string, string][] {
    return [
      ['Política operativa', est.rfRn],
      ['Líder / Custodio', est.lider],
      ['Acuerdo de servicio (SLA)', est.slaRegla],
      ['Información gestionada', est.inputsReales],
    ]
  }
  hitosCorreosEnviados() {
    return this.correosEnviados.map((c) => ({
      id: c.id,
      titulo: `Ticket ${c.ticketId} asignado a ${c.gestor} en ${c.sala} · ${c.slaTexto} (CC: ${c.liderCopia})`,
      fecha: new Date(),
      autor: c.hora,
      tono: 'accent' as const,
    }))
  }

  // ---------------------------------------------------------------- acciones de la simulación
  inyectarTicket(opts?: { gate?: string; type?: string; rayo?: boolean; silencioso?: boolean }): void {
    const g = opts?.gate
      ? (this.puertas.find((p) => p.k === opts.gate) ?? this.puertas[0]!)
      : this.puertas[Math.floor(Math.random() * this.puertas.length)]!
    const tiposKeys = Object.keys(TIPOS_SIMULACION)
    const tkKey = opts?.type ?? tiposKeys[Math.floor(Math.random() * tiposKeys.length)]!
    const tp = TIPOS_SIMULACION[tkKey] ?? TIPOS_SIMULACION['cons']!
    const cli = CLIENTES_SIM[Math.floor(Math.random() * CLIENTES_SIM.length)]!
    const rayo = opts?.rayo ?? Math.random() < 0.18
    const numSeq = ++this.seqId
    const hora = horaAhora()
    this.ticketsActivos = [
      ...this.ticketsActivos,
      {
        id: `T-0${numSeq}`,
        numero: `AIN-000${numSeq}`,
        gate: g.k,
        type: tkKey,
        area: tp.area,
        cli: cli[0],
        lote: cli[1],
        prio: rayo ? 'Urgente' : Math.random() < 0.35 ? 'Alta' : 'Normal',
        rayo,
        etapa: 'bandeja',
        stateRf004: 'OPEN',
        workNeed: Math.round(tp.pt[0] + Math.random() * (tp.pt[1] - tp.pt[0])),
        workDone: 0,
        age: 0,
        slaMax: tp.sla,
        esc: false,
        resumen: cli[2],
        hitos: [`${hora} · Ingresó por ${g.nombre} y aterrizó en Bandeja Orquestadora`, ...(rayo ? [`${hora} · Marcado con Prioridad Rayo`] : [])],
      },
    ]
  }

  simularPicoMasivo(): void {
    for (let i = 0; i < 5; i++) this.inyectarTicket({ rayo: i === 0, silencioso: i < 4 })
  }

  forzarVencimientoSla(): void {
    const cand = this.ticketsActivos.find((t) => !t.esc && t.etapa !== 'salida')
    if (!cand) {
      this.inyectarTicket({ type: 'recl' })
      return
    }
    cand.age = cand.slaMax + 5
    cand.esc = true
    cand.stateRf004 = 'ESCALATED'
    cand.hitos = [`${horaAhora()} · SLA vencido: Escalado en cadena a Comité (Mesa SGD)`, ...cand.hitos].slice(0, 5)
    this.escaladosCount = Math.min(6, this.escaladosCount + 1)
    this.rachaSla = 0
    this.ticketSeleccionadoId = cand.id
    this.ticketsActivos = [...this.ticketsActivos]
  }

  alternarRayoTicket(ticketId: string): void {
    const hora = horaAhora()
    this.ticketsActivos = this.ticketsActivos.map((t) => {
      if (t.id !== ticketId) return t
      const nuevoRayo = !t.rayo
      return {
        ...t,
        rayo: nuevoRayo,
        prio: nuevoRayo ? 'Urgente' : t.prio,
        hitos: [`${hora} · ${nuevoRayo ? 'Prioridad Rayo activada: sube al tope de cola' : 'Prioridad Rayo retirada'}`, ...t.hitos].slice(0, 5),
      }
    })
  }

  resolverTicketInmediato(ticketId: string): void {
    const tk = this.ticketsActivos.find((t) => t.id === ticketId)
    if (!tk) return
    this.liberarEscritorioDeTicket(tk)
    tk.etapa = 'salida'
    tk.stateRf004 = 'RESOLVED'
    tk.hitos = [`${horaAhora()} · Resuelto y enviado a Cierre en Mi Portal (encuesta CSAT/NPS)`, ...tk.hitos].slice(0, 5)
    this.registrarCierreConXp(tk)
    this.ticketsActivos = [...this.ticketsActivos]
  }

  reasignarMenorCarga(ticketId: string): void {
    const tk = this.ticketsActivos.find((t) => t.id === ticketId)
    if (!tk) return
    this.liberarEscritorioDeTicket(tk)
    const sala = this.salas.find((s) => s.k === tk.area)
    const desks = this.ocupacionEscritorios[tk.area]
    if (!sala || !desks) return
    let mejorIdx = desks.findIndex((d) => d.ticketId === null)
    if (mejorIdx < 0) mejorIdx = 0
    const puesto = desks[mejorIdx]!
    puesto.ticketId = tk.id
    tk.resp = puesto.id
    tk.respNombre = puesto.nombre
    tk.etapa = 'atencion'
    tk.stateRf004 = 'IN_PROGRESS'
    tk.hitos = [`${horaAhora()} · Reasignado por menor carga a ${puesto.nombre} (${sala.nombre})`, ...tk.hitos].slice(0, 5)
    this.registrarCorreoAsignacion(tk, sala, puesto.nombre)
    this.ticketsActivos = [...this.ticketsActivos]
  }

  private liberarEscritorioDeTicket(tk: TicketVivo): void {
    for (const d of this.ocupacionEscritorios[tk.area] ?? []) if (d.ticketId === tk.id) d.ticketId = null
  }

  private registrarCierreConXp(tk: TicketVivo): void {
    const enPlazo = !tk.esc && tk.age <= tk.slaMax
    this.cerradosHoy++
    if (enPlazo) {
      this.cerradosEnSlaHoy++
      this.rachaSla++
    } else {
      this.rachaSla = 0
    }
    this.csatRespuestas++
    let nuevoXp = this.xpEquipo + (enPlazo ? 10 : 3) + (tk.rayo ? 5 : 0)
    if (nuevoXp >= this.metaXpNivel) {
      nuevoXp -= this.metaXpNivel
      this.nivelEquipo++
    }
    this.xpEquipo = nuevoXp
  }

  private registrarCorreoAsignacion(tk: TicketVivo, sala: SalaOficina, gestor: string): void {
    const nuevoCorreo: CorreoAsignacionLog = {
      id: `MAIL-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      hora: horaAhora(),
      ticketId: tk.numero,
      gestor: `${gestor} (${sala.nombre})`,
      liderCopia: LIDERES_SALA[sala.k] ?? 'Supervisor ATC',
      sala: sala.nombre,
      slaTexto: tk.rayo ? 'Prioridad Rayo · Atención inmediata' : `SLA dentro de plazo`,
    }
    this.correosEnviados = [nuevoCorreo, ...this.correosEnviados].slice(0, 6)
  }

  private ejecutarPasoSimulacion(): void {
    this.spawnTimer++
    if (this.spawnTimer >= 12 && this.ticketsActivos.length < 26) {
      this.spawnTimer = 0
      this.inyectarTicket({ silencioso: true })
    }
    const hora = horaAhora()

    // 1. Avanzar edad, trabajo en escritorio y retiro de tickets ya cerrados
    const sobrevivientes: TicketVivo[] = []
    for (const t of this.ticketsActivos) {
      t.age++
      if (t.etapa === 'salida') {
        t.workDone += 2
        if (t.workDone >= t.workNeed + 18) {
          if (this.ticketSeleccionadoId === t.id) this.ticketSeleccionadoId = null
          continue
        }
        sobrevivientes.push(t)
        continue
      }
      if (!t.esc && t.age >= t.slaMax) {
        t.esc = true
        t.stateRf004 = 'ESCALATED'
        this.escaladosCount = Math.min(6, this.escaladosCount + 1)
        this.rachaSla = 0
        t.hitos = [`${hora} · SLA vencido: Escalado automático a Comité (Mesa SGD)`, ...t.hitos].slice(0, 5)
      }
      if (t.etapa === 'bandeja' && t.age >= 5) {
        t.etapa = 'cola'
        t.hitos = [`${hora} · Robot Orquestador despachó el ticket hacia la cola de ${this.nombreSala(t.area)}`, ...t.hitos].slice(0, 5)
      } else if (t.etapa === 'atencion') {
        t.workDone += t.rayo ? 1.5 : 1.05
        if (t.workDone >= t.workNeed) {
          const puesto = (this.ocupacionEscritorios[t.area] ?? []).find((d) => d.ticketId === t.id)
          if (puesto) {
            puesto.ticketId = null
            puesto.atendidos++
          }
          t.etapa = 'salida'
          t.stateRf004 = 'RESOLVED'
          t.hitos = [`${hora} · Resuelto por ${t.respNombre ?? 'Gestor'} · pasa a Cierre en Mi Portal`, ...t.hitos].slice(0, 5)
          this.registrarCierreConXp(t)
        }
      }
      sobrevivientes.push(t)
    }

    // 2. Asignar tickets en cola/bandeja a escritorios libres ordenando por Rayo -> SLA -> Menor carga
    const candidatos = sobrevivientes.filter((t) => t.etapa === 'cola' || (t.etapa === 'bandeja' && t.age >= 3))
    candidatos.sort((a, b) => {
      if (a.rayo !== b.rayo) return a.rayo ? -1 : 1
      return a.slaMax - a.age - (b.slaMax - b.age)
    })
    for (const t of candidatos) {
      const sala = this.salas.find((s) => s.k === t.area)
      const desks = this.ocupacionEscritorios[t.area]
      if (!sala || !desks) continue
      let mejorIdx = -1
      let menorCarga = Number.POSITIVE_INFINITY
      desks.forEach((d, idx) => {
        if (d.ticketId === null && d.atendidos < menorCarga) {
          menorCarga = d.atendidos
          mejorIdx = idx
        }
      })
      if (mejorIdx >= 0) {
        const puesto = desks[mejorIdx]!
        puesto.ticketId = t.id
        t.resp = puesto.id
        t.respNombre = puesto.nombre
        t.etapa = 'atencion'
        t.stateRf004 = Math.random() < 0.18 ? 'PENDING_CUSTOMER' : 'IN_PROGRESS'
        t.hitos = [`${hora} · Ingresó a puesto de ${puesto.nombre} (${sala.nombre})`, ...t.hitos].slice(0, 5)
        this.registrarCorreoAsignacion(t, sala, puesto.nombre)
      }
    }
    this.ticketsActivos = sobrevivientes
  }

  pctSlaRestante(tk: TicketVivo): number { return Math.max(0, Math.round(((tk.slaMax - tk.age) / tk.slaMax) * 100)) }
  nivelSlaTicket(tk: TicketVivo): 'ok' | 'riesgo' | 'vencido' {
    if (tk.esc || tk.age >= tk.slaMax) return 'vencido'
    if (this.pctSlaRestante(tk) < 25) return 'riesgo'
    return 'ok'
  }
  etiquetaSlaTicket(tk: TicketVivo): string {
    const niv = this.nivelSlaTicket(tk)
    if (niv === 'vencido') return 'SLA vencido'
    if (niv === 'riesgo') return `En riesgo (${this.pctSlaRestante(tk)}%)`
    return `En plazo (${this.pctSlaRestante(tk)}%)`
  }
  etiquetaEtapa(etapa: TicketVivo['etapa']): string {
    switch (etapa) {
      case 'bandeja': return 'Bandeja Orquestadora'
      case 'cola': return 'En cola de sala'
      case 'atencion': return 'En escritorio'
      case 'salida': return 'Cierre Mi Portal'
    }
  }
  nombreSala(k: string): string {
    if (k === 'bandeja') return 'Bandeja Orquestadora'
    if (k === 'comite') return 'Comité (Mesa SGD)'
    return this.salas.find((s) => s.k === k)?.nombre ?? k
  }
  nombreCanal(k: string): string { return this.puertas.find((p) => p.k === k)?.nombre ?? k }
  nombreTipoSim(k: string): string { return TIPOS_SIMULACION[k]?.nombre ?? k }
}
