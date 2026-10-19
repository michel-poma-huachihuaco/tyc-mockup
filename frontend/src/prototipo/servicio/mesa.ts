import { CRITERIOS_RIESGO, DIAS_LIMBO, ESTADOS_CIERRE_SGD, LINEAS_SGD, NIVELES_ESCALAMIENTO, lineaSgd, nivelDeRiesgo } from '../datos/catalogos.ts'
import type { EstadoCierreSgd, LineaSgd, NivelRiesgo } from '../datos/catalogos.ts'
import { cliente } from '../datos/clientes.ts'
import { diasHabilesEntre, sumarDiasHabiles } from './calendario.ts'
import { ErrorSimulado, actorDe, emitir, exigir, invalido, nuevoId, puede } from './nucleo.ts'
import type { CampoInvalido, Datos } from './nucleo.ts'
import type { Documento } from './libro.ts'

/**
 * Mesa de Casos Sensibles SGD (ola 3: HU-ATC-020 a 025): registro por línea con Código
 * Único, cargo previo y cargo de activación, matriz objetiva de riesgo, escalamiento en
 * cadena, vinculación de casos con un hilo único de evidencia y cierre homologado con
 * referencia a la custodia del GLI. Las entidades están «por modelar» (R-06): esto es la
 * propuesta del prototipo.
 */

// ── Modelo ──────────────────────────────────────────────────────────────────

export type EstadoCaso = 'REGISTRADO' | 'ACTIVO' | 'CERRADO' | 'RECLASIFICADO' | 'VINCULADO'

export interface Caso {
  readonly id: string
  /** SUPUESTO: `SGD-2026-000000`; nunca se reutiliza (CA-01 de HU-ATC-020). */
  readonly codigo: string
  readonly linea: LineaSgd
  readonly clienteId: string
  readonly ticketId: string | null
  readonly resumen: string
  readonly registrado: Date
  readonly autor: string
  readonly cargoPrevio: { readonly fecha: Date; readonly autor: string } | null
  readonly activacion: { readonly fecha: Date; readonly autor: string } | null
  readonly venceSla: Date | null
  readonly riesgo: { readonly puntaje: number; readonly nivel: NivelRiesgo; readonly criterios: readonly string[] } | null
  /** Caso principal cuando este no es independiente (RN-SVC-018). */
  readonly vinculadoA: string | null
  /** Caso del que viene por reclasificación (CA-02 de HU-ATC-020). */
  readonly origenId: string | null
  readonly justificacionIndependiente: string | null
  readonly estado: EstadoCaso
  readonly nivelEscalamiento: number
  readonly cierre: {
    readonly estado: EstadoCierreSgd
    readonly evidencia: Documento
    readonly gli: string | null
    readonly fecha: Date
    readonly autor: string
    readonly nota: string | null
  } | null
}

/** Trazabilidad del caso: cada hecho es una fila nueva. */
export interface FilaCaso {
  readonly id: string
  readonly casoId: string
  readonly fecha: Date
  readonly evento: string
  readonly autor: string
  readonly detalle: string | null
}

export interface FilaRiesgo {
  readonly id: string
  readonly casoId: string
  readonly fecha: Date
  readonly autor: string
  readonly motivo: string
  readonly puntaje: number
  readonly nivel: NivelRiesgo
  readonly criterios: readonly string[]
}

export interface Escalamiento {
  readonly id: string
  readonly casoId: string
  readonly nivel: number
  readonly nombre: string
  readonly fecha: Date
  readonly destinatario: string
  readonly vencimiento: Date
}

/** Hilo de evidencia: lo comparten el caso principal y sus vinculados (CA-02 de HU-ATC-024). */
export interface Evidencia {
  readonly id: string
  readonly hiloId: string
  readonly casoId: string
  readonly fecha: Date
  readonly autor: string
  readonly descripcion: string
  readonly documento: Documento | null
  /** Referencia a la custodia en el Repositorio Legal Controlado (RN-SVC-020). */
  readonly gli: string | null
}

// ── Consultas ───────────────────────────────────────────────────────────────

const ABIERTOS: readonly EstadoCaso[] = ['REGISTRADO', 'ACTIVO']

export const casoDe = (d: Datos, id: string) => d.casos.find((c) => c.id === id) ?? null
export const hiloDe = (c: Caso) => c.vinculadoA ?? c.id
export const evidenciasDelHilo = (d: Datos, c: Caso) => d.evidencias.filter((e) => e.hiloId === hiloDe(c))
export const puntajeDe = (criterios: readonly string[]) => CRITERIOS_RIESGO.filter((c) => criterios.includes(c.id)).reduce((t, c) => t + c.peso, 0)

/** SUPUESTO (pregunta abierta de FT-ATC-09): coincide = mismo cliente con un caso abierto e independiente. */
export const coincidencias = (d: Datos, clienteId: string) => d.casos.filter((c) => c.clienteId === clienteId && ABIERTOS.includes(c.estado) && !c.vinculadoA)

/** CA-03 de HU-ATC-021: cargo previo sin activar más de 2 días hábiles. */
export const diasSinActivar = (c: Caso, ahora: Date) => (c.cargoPrevio && !c.activacion ? diasHabilesEntre(c.cargoPrevio.fecha, ahora) : 0)
export const enLimbo = (d: Datos) => d.casos.filter((c) => c.estado === 'REGISTRADO' && diasSinActivar(c, d.ahora) > DIAS_LIMBO)

/** Días hábiles respecto del vencimiento del SLA de línea: negativo antes, positivo después. */
export const diasDesdeVencimiento = (c: Caso, ahora: Date) => (c.venceSla ? diasHabilesEntre(c.venceSla, ahora) : null)

// ── Utilidades internas ─────────────────────────────────────────────────────

function caso(d: Datos, id: string): Caso {
  const c = casoDe(d, id)
  if (!c) throw new ErrorSimulado(404, 'no-encontrado', 'El caso no existe.')
  return c
}

const conCaso = (d: Datos, c: Caso): Datos => ({ ...d, casos: d.casos.map((x) => (x.id === c.id ? c : x)) })

function fila(d: Datos, casoId: string, evento: string, autor: string, detalle: string | null = null): Datos {
  const [id, s] = nuevoId(d, 'fcs')
  return { ...s, filasCaso: [...s.filasCaso, { id, casoId, fecha: d.ahora, evento, autor, detalle }] }
}

function nuevoCodigo(d: Datos): [string, Datos] {
  const n = (d.secuencias.SGD ?? 0) + 1
  return [`SGD-${d.ahora.getFullYear()}-${String(n).padStart(6, '0')}`, { ...d, secuencias: { ...d.secuencias, SGD: n } }]
}

const operar = (actorId: string, accion: string) => exigir(puede.operarMesa(actorDe(actorId).rol), accion)

// ── Registro y vinculación (HU-ATC-020, 024) ────────────────────────────────

export interface EntradaCaso {
  readonly linea: LineaSgd | ''
  readonly clienteId: string
  readonly ticketId: string
  readonly resumen: string
  /** Vincular al caso abierto que coincide. */
  readonly vincularA?: string
  /** Registrar como independiente pese a la coincidencia, con justificación. */
  readonly justificacionIndependiente?: string
}

export function registrarCaso(d: Datos, e: EntradaCaso, actorId: string): [Datos, Caso] {
  operar(actorId, 'registrar casos sensibles')
  const campos: CampoInvalido[] = []
  if (!LINEAS_SGD.some((l) => l.id === e.linea)) campos.push({ campo: 'linea', mensaje: 'Elige la línea de ingreso.' })
  if (!cliente(e.clienteId)) campos.push({ campo: 'cliente', mensaje: 'Elige al cliente del maestro SIGDA/TAXON.' })
  if (!e.resumen.trim()) campos.push({ campo: 'resumen', mensaje: 'Resume los hechos del caso.' })
  if (e.ticketId && !d.tickets.some((t) => t.id === e.ticketId)) campos.push({ campo: 'ticket', mensaje: 'Ese ticket no existe.' })
  if (campos.length) throw invalido(campos)

  const iguales = coincidencias(d, e.clienteId)
  const principal = e.vincularA ? iguales.find((c) => c.id === e.vincularA) : undefined
  if (e.vincularA && !principal) throw new ErrorSimulado(409, 'vinculo-invalido', 'Solo se vincula a un caso abierto del mismo cliente.')
  if (iguales.length && !principal) {
    if (e.justificacionIndependiente === undefined)
      throw new ErrorSimulado(409, 'coincidencia', `Coincide con ${iguales.map((c) => c.codigo).join(', ')}: vincúlalo o justifica por qué es independiente.`)
    if (!e.justificacionIndependiente.trim()) throw invalido([{ campo: 'justificacion', mensaje: 'Justifica por qué no es el mismo caso.' }])
  }

  let [codigo, s] = nuevoCodigo(d)
  let id: string
  ;[id, s] = nuevoId(s, 'cas')
  const nuevo: Caso = {
    id,
    codigo,
    linea: e.linea as LineaSgd,
    clienteId: e.clienteId,
    ticketId: e.ticketId || null,
    resumen: e.resumen.trim(),
    registrado: d.ahora,
    autor: actorId,
    cargoPrevio: null,
    activacion: null,
    venceSla: null,
    riesgo: null,
    vinculadoA: principal?.id ?? null,
    origenId: null,
    justificacionIndependiente: !principal && iguales.length ? (e.justificacionIndependiente ?? '').trim() : null,
    estado: principal ? 'VINCULADO' : 'REGISTRADO',
    nivelEscalamiento: 0,
    cierre: null,
  }
  s = { ...s, casos: [...s.casos, nuevo] }
  s = fila(s, id, 'REGISTRO', actorId, `Línea ${lineaSgd(nuevo.linea).nombre}`)
  s = emitir(s, 'caso_sensible_registrado', { línea: nuevo.linea })
  if (principal) {
    s = fila(s, id, 'VINCULADO', actorId, `Al caso ${principal.codigo}: se gestiona en su hilo de evidencia`)
    s = fila(s, principal.id, 'CASO_VINCULADO', actorId, `${codigo} (${lineaSgd(nuevo.linea).nombre})`)
    ;[id, s] = nuevoId(s, 'evi')
    s = { ...s, evidencias: [...s.evidencias, { id, hiloId: principal.id, casoId: nuevo.id, fecha: d.ahora, autor: actorId, descripcion: `Caso vinculado ${codigo}: ${nuevo.resumen}`, documento: null, gli: null }] }
    s = emitir(s, 'caso_vinculado', { línea: nuevo.linea })
  } else if (nuevo.justificacionIndependiente) {
    s = fila(s, nuevo.id, 'INDEPENDIENTE_JUSTIFICADO', actorId, nuevo.justificacionIndependiente)
  }
  return [s, casoDe(s, nuevo.id) as Caso]
}

/** CA-02 de HU-ATC-020: Legal Atiende sin resolver se re-registra como reclamo formal. */
export function reclasificar(d: Datos, casoId: string, motivo: string, actorId: string): [Datos, Caso] {
  operar(actorId, 'reclasificar casos')
  const c = caso(d, casoId)
  if (c.linea !== 'LEGAL_ATIENDE') throw new ErrorSimulado(409, 'linea-invalida', 'Solo se reclasifica un caso de Legal Atiende (preventivo).')
  if (!ABIERTOS.includes(c.estado)) throw new ErrorSimulado(409, 'caso-cerrado', 'El caso ya no está abierto.')
  if (!motivo.trim()) throw invalido([{ campo: 'motivo', mensaje: 'Explica por qué pasa a reclamo formal.' }])
  let [codigo, s] = nuevoCodigo(d)
  let id: string
  ;[id, s] = nuevoId(s, 'cas')
  const nuevo: Caso = { ...c, id, codigo, linea: 'LIBRO', registrado: d.ahora, autor: actorId, cargoPrevio: null, activacion: null, venceSla: null, riesgo: null, origenId: c.id, estado: 'REGISTRADO', nivelEscalamiento: 0, cierre: null, justificacionIndependiente: null }
  s = { ...s, casos: [...s.casos.map((x) => (x.id === c.id ? { ...x, estado: 'RECLASIFICADO' as const } : x)), nuevo] }
  s = fila(s, c.id, 'RECLASIFICADO', actorId, `Pasa a reclamo formal como ${codigo}: ${motivo.trim()}`)
  s = fila(s, id, 'REGISTRO', actorId, `Reclasificado desde ${c.codigo} (Legal Atiende): ${motivo.trim()}`)
  // El hilo de evidencia del origen sigue siendo el del caso nuevo.
  s = { ...s, evidencias: s.evidencias.map((e) => (e.hiloId === c.id ? { ...e, hiloId: id } : e)) }
  s = emitir(s, 'caso_sensible_registrado', { línea: 'LIBRO' })
  return [s, nuevo]
}

// ── Cargos (HU-ATC-021) ─────────────────────────────────────────────────────

export function emitirCargoPrevio(d: Datos, casoId: string, actorId: string): Datos {
  operar(actorId, 'emitir cargos')
  const c = caso(d, casoId)
  if (c.estado !== 'REGISTRADO' || c.cargoPrevio) throw new ErrorSimulado(409, 'cargo-previo', 'El cargo previo ya se emitió o el caso no está registrado.')
  const s = conCaso(d, { ...c, cargoPrevio: { fecha: d.ahora, autor: actorId } })
  return fila(s, casoId, 'CARGO_PREVIO', actorId, 'El SLA de línea todavía no corre.')
}

export function activar(d: Datos, casoId: string, actorId: string): Datos {
  operar(actorId, 'emitir cargos')
  const c = caso(d, casoId)
  if (!c.cargoPrevio) throw new ErrorSimulado(409, 'sin-cargo-previo', 'Primero se emite el cargo previo de asignación.')
  if (c.activacion) throw new ErrorSimulado(409, 'ya-activado', 'El caso ya está activado.')
  const venceSla = sumarDiasHabiles(d.ahora, lineaSgd(c.linea).slaDias)
  let s = conCaso(d, { ...c, activacion: { fecha: d.ahora, autor: actorId }, venceSla, estado: 'ACTIVO' })
  s = fila(s, casoId, 'CARGO_ACTIVACION', actorId, `SLA de línea de ${lineaSgd(c.linea).slaDias} días hábiles desde ahora`)
  return emitir(s, 'caso_activado', { línea: c.linea })
}

// ── Riesgo (HU-ATC-022) ─────────────────────────────────────────────────────

export function clasificarRiesgo(d: Datos, casoId: string, criterios: readonly string[], motivo: string, actorId: string): Datos {
  operar(actorId, 'clasificar el riesgo')
  const c = caso(d, casoId)
  if (c.estado !== 'ACTIVO') throw new ErrorSimulado(409, 'no-activo', 'El riesgo se clasifica en un caso activado.')
  const validos = criterios.filter((x) => CRITERIOS_RIESGO.some((k) => k.id === x))
  if (c.riesgo && !motivo.trim()) throw invalido([{ campo: 'motivo', mensaje: 'Explica por qué se recalibra (nuevo elemento, vínculo con otro caso…).' }])
  if (c.riesgo && [...validos].sort().join() === [...c.riesgo.criterios].sort().join())
    throw invalido([{ campo: 'criterios', mensaje: 'Los criterios no cambiaron: no hay nada que recalibrar.' }])
  const puntaje = puntajeDe(validos)
  const nivel = nivelDeRiesgo(puntaje)
  let [id, s] = nuevoId(d, 'rsg')
  const m = motivo.trim() || 'Clasificación inicial'
  s = { ...s, filasRiesgo: [...s.filasRiesgo, { id, casoId, fecha: d.ahora, autor: actorId, motivo: m, puntaje, nivel, criterios: validos }] }
  s = conCaso(s, { ...c, riesgo: { puntaje, nivel, criterios: validos } })
  return emitir(s, 'riesgo_recalibrado', { nivel, puntaje })
}

// ── Evidencia y cierre (HU-ATC-024, 025) ────────────────────────────────────

export function agregarEvidencia(d: Datos, casoId: string, e: { readonly descripcion: string; readonly documento: Documento | null; readonly gli: string }, actorId: string): Datos {
  operar(actorId, 'agregar evidencia')
  const c = caso(d, casoId)
  const campos: CampoInvalido[] = []
  if (!e.descripcion.trim()) campos.push({ campo: 'descripcion', mensaje: 'Describe la evidencia.' })
  if (!e.documento && !e.gli.trim()) campos.push({ campo: 'documento', mensaje: 'Adjunta una copia o indica la referencia del original en el GLI.' })
  if (e.gli.trim() && !/^GLI-\d{4}-\d{6}$/.test(e.gli.trim())) campos.push({ campo: 'gli', mensaje: 'Referencia del GLI con el formato GLI-2026-000000.' })
  if (campos.length) throw invalido(campos)
  const [id, s] = nuevoId(d, 'evi')
  return {
    ...s,
    evidencias: [...s.evidencias, { id, hiloId: hiloDe(c), casoId, fecha: d.ahora, autor: actorId, descripcion: e.descripcion.trim(), documento: e.documento, gli: e.gli.trim() || null }],
  }
}

export interface EntradaCierre {
  readonly estado: EstadoCierreSgd | ''
  readonly evidencia: Documento | null
  /** Hay un original probatorio crítico: su custodia está en el GLI. */
  readonly critico: boolean
  readonly gli: string
  readonly nota: string
}

export function cerrarCaso(d: Datos, casoId: string, e: EntradaCierre, actorId: string): Datos {
  operar(actorId, 'cerrar casos')
  const c = caso(d, casoId)
  if (c.estado !== 'ACTIVO') throw new ErrorSimulado(409, 'no-activo', 'Se cierra un caso activado y abierto.')
  const campos: CampoInvalido[] = []
  if (!ESTADOS_CIERRE_SGD.some((x) => x.id === e.estado)) campos.push({ campo: 'estado', mensaje: 'Elige uno de los 8 estados homologados.' })
  if (!e.evidencia) campos.push({ campo: 'evidencia', mensaje: 'Sin evidencia no hay cierre (RN-SVC-019).' })
  if (e.critico && !/^GLI-\d{4}-\d{6}$/.test(e.gli.trim())) campos.push({ campo: 'gli', mensaje: 'Indica la referencia del original en el GLI (GLI-2026-000000).' })
  if (campos.length) throw invalido(campos)
  const gli = e.critico ? e.gli.trim() : null
  let s = conCaso(d, { ...c, estado: 'CERRADO', cierre: { estado: e.estado as EstadoCierreSgd, evidencia: e.evidencia as Documento, gli, fecha: d.ahora, autor: actorId, nota: e.nota.trim() || null } })
  let id: string
  ;[id, s] = nuevoId(s, 'evi')
  s = { ...s, evidencias: [...s.evidencias, { id, hiloId: hiloDe(c), casoId, fecha: d.ahora, autor: actorId, descripcion: 'Evidencia de cierre', documento: e.evidencia, gli }] }
  const nombre = ESTADOS_CIERRE_SGD.find((x) => x.id === e.estado)?.nombre ?? e.estado
  s = fila(s, casoId, 'CIERRE', actorId, `${nombre}${c.nivelEscalamiento ? ` · la cadena se detiene en el nivel ${c.nivelEscalamiento}` : ''}`)
  return emitir(s, 'caso_cerrado', { estado: e.estado })
}

// ── Escalamiento en cadena (HU-ATC-023) ─────────────────────────────────────

/** Sube cada caso activo hasta el nivel que le toca, registrando uno por uno los intermedios. */
export function controlarEscalamiento(d: Datos): [Datos, { readonly escalamientos: number }] {
  let s = d
  let n = 0
  for (const c of d.casos) {
    if (c.estado !== 'ACTIVO' || !c.venceSla) continue
    const dias = diasDesdeVencimiento(c, d.ahora) as number
    const objetivo = NIVELES_ESCALAMIENTO.filter((x) => dias >= x.dias).reduce((m, x) => Math.max(m, x.nivel), 0)
    if (objetivo <= c.nivelEscalamiento) continue
    for (const x of NIVELES_ESCALAMIENTO.filter((x) => x.nivel > c.nivelEscalamiento && x.nivel <= objetivo)) {
      let id: string
      ;[id, s] = nuevoId(s, 'esc')
      s = { ...s, escalamientos: [...s.escalamientos, { id, casoId: c.id, nivel: x.nivel, nombre: x.nombre, fecha: d.ahora, destinatario: x.destinatario, vencimiento: c.venceSla }] }
      s = emitir(s, 'escalamiento', { nivel: x.nivel })
      n++
    }
    s = conCaso(s, { ...(casoDe(s, c.id) as Caso), nivelEscalamiento: objetivo })
  }
  return [s, { escalamientos: n }]
}
