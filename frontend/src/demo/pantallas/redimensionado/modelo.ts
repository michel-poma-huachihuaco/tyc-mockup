/**
 * Lo que /demo/redimensionado calcula sin React ni DOM: la bandeja de correo de ejemplo que
 * se arma con los datos sintéticos, el resumen de lotes de las tarjetas con container
 * queries y la escala de la vista previa. Recibe los datos por parámetro y declara solo lo
 * que lee de cada uno (los de datos/ encajan tal cual), así que no importa nada y lo prueba
 * `npm test` sin cargar la galería: pruebas/demo-redimensionado.test.ts. El mismo archivo,
 * con el estilo de Angular, vive en la plantilla Angular.
 */

export type EstadoLote = 'disponible' | 'reservado' | 'vendido' | 'bloqueado'
export type Gravedad = 'info' | 'aviso' | 'critico'

/** Lo que se lee de un aviso de la cuenta (datos/cuenta.ts). */
export interface AvisoDeEntrada {
  readonly id: string
  readonly titulo: string
  readonly descripcion: string
  readonly fecha: string
  readonly leido: boolean
}

/** Lo que se lee de un evento de auditoría (datos/auditoria.ts). */
export interface EventoDeEntrada {
  readonly id: string
  readonly fecha: string
  readonly actor: string
  readonly accion: string
  readonly recurso: string
  readonly gravedad: Gravedad
  readonly ip: string
}

/** Lo que se lee de una persona (datos/personas.ts). */
export interface PersonaDeEntrada {
  readonly id: string
  readonly nombre: string
  readonly correo: string
  readonly area: string
}

/** Lo que se lee de un lote (datos/lotes.ts). */
export interface LoteDeEntrada {
  readonly manzana: string
  readonly estado: EstadoLote
}

// ── Bandeja de correo ───────────────────────────────────────────────────────

export const CARPETAS = [
  { id: 'entrada', nombre: 'Entrada' },
  { id: 'alertas', nombre: 'Alertas' },
  { id: 'revisar', nombre: 'Para revisar' },
  { id: 'archivo', nombre: 'Archivo' },
] as const

export type IdCarpeta = (typeof CARPETAS)[number]['id']

export interface Mensaje {
  readonly id: string
  readonly carpeta: IdCarpeta
  readonly remitente: string
  readonly correo: string
  readonly asunto: string
  readonly extracto: string
  readonly parrafos: readonly string[]
  /** ISO. */
  readonly fecha: string
  readonly leido: boolean
}

/** Cuántos eventos de auditoría, los más recientes, llegan a la bandeja. */
export const EVENTOS_EN_BANDEJA = 30

/** Los eventos informativos más recientes van a Entrada; los demás, a Archivo. */
const INFORMATIVOS_EN_ENTRADA = 12

const REMITENTE_AVISOS = { nombre: 'Avisos de la plataforma', correo: 'avisos@ejemplo.test' }

const CARPETA_DE: Record<Gravedad, IdCarpeta | null> = { critico: 'alertas', aviso: 'revisar', info: null }

const NOTA_DE: Record<Gravedad, string> = {
  critico: 'Gravedad crítica: conviene revisarlo hoy.',
  aviso: 'Gravedad de aviso: revísalo cuando puedas.',
  info: 'Es solo informativo.',
}

const minusculaInicial = (texto: string) => texto.charAt(0).toLowerCase() + texto.slice(1)

/**
 * La bandeja: los avisos de la cuenta en Entrada y los eventos de auditoría más recientes
 * como mensajes de quien los hizo, en Alertas (críticos), Para revisar (avisos), Entrada o
 * Archivo (informativos). Del más reciente al más antiguo; siempre la misma.
 */
export function crearBandeja(
  avisos: readonly AvisoDeEntrada[],
  eventos: readonly EventoDeEntrada[],
  personas: readonly PersonaDeEntrada[],
): Mensaje[] {
  const porId = new Map(personas.map((p) => [p.id, p]))
  const deAvisos = avisos.map<Mensaje>((aviso) => ({
    id: `aviso-${aviso.id}`,
    carpeta: 'entrada',
    remitente: REMITENTE_AVISOS.nombre,
    correo: REMITENTE_AVISOS.correo,
    asunto: aviso.titulo,
    extracto: aviso.descripcion,
    parrafos: [aviso.descripcion, 'Es un aviso de la galería de demostración: no salió de ningún sistema.'],
    fecha: aviso.fecha,
    leido: aviso.leido,
  }))
  let informativos = 0
  const deEventos = eventos.slice(0, EVENTOS_EN_BANDEJA).flatMap<Mensaje>((evento, indice) => {
    const persona = porId.get(evento.actor)
    if (!persona) return []
    const carpeta = CARPETA_DE[evento.gravedad] ?? (informativos++ < INFORMATIVOS_EN_ENTRADA ? 'entrada' : 'archivo')
    return [
      {
        id: evento.id,
        carpeta,
        remitente: persona.nombre,
        correo: persona.correo,
        asunto: `${evento.accion} · ${evento.recurso}`,
        extracto: `${persona.area} · desde ${evento.ip}`,
        parrafos: [
          `${persona.nombre}, de ${persona.area}, ${minusculaInicial(evento.accion)}: ${evento.recurso}.`,
          `Lo registró la auditoría desde la IP ${evento.ip}. ${NOTA_DE[evento.gravedad]}`,
        ],
        fecha: evento.fecha,
        leido: indice % 3 !== 0,
      },
    ]
  })
  return [...deAvisos, ...deEventos].sort((a, b) => b.fecha.localeCompare(a.fecha) || a.id.localeCompare(b.id))
}

export function mensajesDe(bandeja: readonly Mensaje[], carpeta: IdCarpeta): Mensaje[] {
  return bandeja.filter((m) => m.carpeta === carpeta)
}

// ── Tarjetas con container queries ──────────────────────────────────────────

export const ORDEN_ESTADOS: readonly EstadoLote[] = ['disponible', 'reservado', 'vendido', 'bloqueado']

/** El rótulo de cada tarjeta: «Disponibles». */
export const PLURAL_ESTADO: Record<EstadoLote, string> = {
  disponible: 'Disponibles',
  reservado: 'Reservados',
  vendido: 'Vendidos',
  bloqueado: 'Bloqueados',
}

export interface ResumenEstado {
  readonly estado: EstadoLote
  readonly total: number
  /** Del total de lotes, en entero. */
  readonly porcentaje: number
  /** Las tres manzanas con más lotes en ese estado, de más a menos. */
  readonly manzanas: readonly { readonly manzana: string; readonly total: number }[]
}

export function resumenPorEstado(lotes: readonly LoteDeEntrada[]): ResumenEstado[] {
  return ORDEN_ESTADOS.map((estado) => {
    const delEstado = lotes.filter((l) => l.estado === estado)
    const porManzana = new Map<string, number>()
    for (const lote of delEstado) porManzana.set(lote.manzana, (porManzana.get(lote.manzana) ?? 0) + 1)
    return {
      estado,
      total: delEstado.length,
      porcentaje: lotes.length === 0 ? 0 : Math.round((delEstado.length / lotes.length) * 100),
      manzanas: [...porManzana]
        .map(([manzana, total]) => ({ manzana, total }))
        .sort((a, b) => b.total - a.total || a.manzana.localeCompare(b.manzana))
        .slice(0, 3),
    }
  })
}

/**
 * Los umbrales de las container queries de las tarjetas, en rem. Son los mismos números que
 * las reglas `@container` de contenedor.css (una container query no admite var()).
 */
export const UMBRALES_REM = { fila: 22, amplia: 36 } as const

export type Disposicion = 'apilada' | 'en fila' | 'amplia'

/** La disposición que pintan las container queries para un panel de ese ancho. */
export function disposicionPara(anchoPx: number, remPx = 16): Disposicion {
  if (anchoPx >= UMBRALES_REM.amplia * remPx) return 'amplia'
  if (anchoPx >= UMBRALES_REM.fila * remPx) return 'en fila'
  return 'apilada'
}

// ── Vista previa a varios anchos ────────────────────────────────────────────

export const ANCHOS = [
  { ancho: 390, alto: 844, nombre: 'Celular' },
  { ancho: 768, alto: 1024, nombre: 'Tableta' },
  { ancho: 1024, alto: 768, nombre: 'Portátil' },
  { ancho: 1440, alto: 900, nombre: 'Escritorio' },
] as const

export type AnchoVista = (typeof ANCHOS)[number]

export function anchoVista(ancho: number): AnchoVista {
  return ANCHOS.find((a) => a.ancho === ancho) ?? ANCHOS[3]
}

/**
 * La escala a la que cabe una vista de `ancho` px en `disponible` px: 1 si cabe entera, y
 * nunca más de 1 (no se amplía). Redondeada hacia abajo a tres decimales, para no pasarse
 * de ancho por medio píxel. Sin medida todavía (0), 1.
 */
export function escalaParaCaber(ancho: number, disponible: number): number {
  if (!(disponible > 0) || !(ancho > 0)) return 1
  return Math.min(1, Math.floor((disponible / ancho) * 1000) / 1000)
}

/** «1440 × 900 px · al 54 %». */
export function describirEscala(vista: AnchoVista, escala: number): string {
  return `${vista.ancho} × ${vista.alto} px · al ${Math.round(escala * 100)} %`
}

/** La ruta con `?embebido=1`, que oculta el marco de la galería; conserva su consulta y su ancla. */
export function rutaEmbebida(ruta: string): string {
  const url = new URL(ruta, 'http://galeria.invalid')
  url.searchParams.set('embebido', '1')
  return `${url.pathname}${url.search}${url.hash}`
}
