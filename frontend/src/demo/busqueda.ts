import { BASE, SECCIONES, SECCIONES_ADMIN, SECCIONES_CUENTA, VARIANTES_INGRESO } from './rutas.ts'
import { SINONIMOS } from './sinonimos.ts'
import { agruparPorFamilia, casosDe, normalizar, primeraFrase } from './vitrina/catalogo.ts'
import type { Catalogo, FichaComponente } from './vitrina/catalogo.ts'

/**
 * El buscador global de la galería (Ctrl K), sin React ni DOM: un índice con las pantallas
 * de la galería y los componentes y casos del catálogo, y una búsqueda que entiende el
 * español del que busca (sinonimos.ts). Lo prueba pruebas/demo-busqueda.test.ts.
 */

export type TipoEntrada = 'pantalla' | 'componente' | 'caso'

export interface EntradaBusqueda {
  readonly id: string
  readonly tipo: TipoEntrada
  readonly titulo: string
  /** Lo que ubica el resultado: la familia, la sección, el grupo del caso. */
  readonly contexto: string
  readonly ruta: string
  /** Solo con el rol ADMIN efectivo. */
  readonly soloAdmin?: boolean
  /** Normalizados una vez, al indexar. */
  readonly tituloNormal: string
  readonly palabras: readonly string[]
  readonly texto: string
}

/** Las palabras de un nombre: «DataGrid» → data, grid; «Ingreso · Dos pasos» → ingreso, dos, pasos. */
function palabrasDe(texto: string): string[] {
  return normalizar(texto.replace(/([a-z0-9])([A-Z])/g, '$1 $2'))
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
}

function entrada(
  datos: Omit<EntradaBusqueda, 'tituloNormal' | 'palabras' | 'texto'>,
  extra: readonly string[] = [],
): EntradaBusqueda {
  const palabras = palabrasDe(datos.titulo)
  return {
    ...datos,
    tituloNormal: normalizar(datos.titulo),
    palabras,
    texto: normalizar([datos.titulo, palabras.join(' '), datos.contexto, ...extra].join(' · ')),
  }
}

/** Las pantallas de la galería y sus secciones. */
export function entradasDeGaleria(): EntradaBusqueda[] {
  return [
    ...SECCIONES.map((s) =>
      entrada({ id: `pantalla:${s.id}`, tipo: 'pantalla', titulo: s.nombre, contexto: s.descripcion, ruta: s.ruta, soloAdmin: s.soloAdmin }),
    ),
    ...VARIANTES_INGRESO.map((v) =>
      entrada({ id: `ingreso:${v.id}`, tipo: 'pantalla', titulo: `Ingreso · ${v.nombre}`, contexto: v.descripcion, ruta: `${BASE}/ingreso/${v.id}` }, ['login', 'acceso']),
    ),
    ...SECCIONES_CUENTA.map((s) =>
      entrada({ id: `cuenta:${s.id}`, tipo: 'pantalla', titulo: `Mi cuenta · ${s.nombre}`, contexto: s.descripcion, ruta: `${BASE}/cuenta/${s.id}` }),
    ),
    ...SECCIONES_ADMIN.map((s) =>
      entrada({
        id: `admin:${s.id}`,
        tipo: 'pantalla',
        titulo: `Administración · ${s.nombre}`,
        contexto: s.descripcion,
        ruta: `${BASE}/admin/${s.id}`,
        soloAdmin: true,
      }),
    ),
  ]
}

/** Los componentes y los casos del catálogo instalado. */
export function entradasDeCatalogo(
  catalogo: Catalogo,
  fichas: ReadonlyMap<string, FichaComponente> = new Map(),
): EntradaBusqueda[] {
  const entradas: EntradaBusqueda[] = []
  for (const familia of agruparPorFamilia(catalogo)) {
    for (const componente of familia.componentes) {
      const ruta = `${BASE}/vitrina/${familia.slug}/${componente.slug}`
      const descripcion = primeraFrase(fichas.get(componente.nombre)?.descripcion)
      entradas.push(
        entrada(
          { id: `componente:${componente.slug}`, tipo: 'componente', titulo: componente.nombre, contexto: [familia.nombre, descripcion].filter(Boolean).join(' · '), ruta },
          componente.grupos.map((g) => g.titulo),
        ),
      )
      for (const { grupo, caso, n } of casosDe(componente)) {
        entradas.push(
          entrada({ id: `caso:${componente.slug}:${n}`, tipo: 'caso', titulo: `${componente.nombre} · ${caso.etiqueta}`, contexto: grupo.titulo, ruta: `${ruta}#caso-${n}` }),
        )
      }
    }
  }
  return entradas
}

/**
 * Lo que también vale por un término: los destinos de los sinónimos cuya clave es el
 * término o, desde tres letras, empieza por él.
 */
export function sinonimosDe(termino: string): string[] {
  return [...ponderados(termino).keys()]
}

/**
 * Los destinos con su peso: el primero de la lista de un sinónimo es el más probable
 * («contraseña» es antes PasswordInput que la pantalla de recuperar), así que cada posición
 * resta un poco.
 */
function ponderados(termino: string): Map<string, number> {
  const t = normalizar(termino)
  const pesos = new Map<string, number>()
  if (!t) return pesos
  for (const [clave, lista] of Object.entries(SINONIMOS)) {
    if (clave !== t && !(t.length >= 3 && clave.startsWith(t))) continue
    lista.forEach((destino, i) => {
      const nombre = normalizar(destino)
      pesos.set(nombre, Math.max(pesos.get(nombre) ?? 0, 0.85 - i * 0.03))
    })
  }
  return pesos
}

function coincidencia(entrada: EntradaBusqueda, termino: string): number {
  if (entrada.tituloNormal === termino) return 100
  if (entrada.tituloNormal.startsWith(termino)) return 70
  if (entrada.palabras.some((p) => p.startsWith(termino))) return 55
  if (entrada.tituloNormal.includes(termino)) return 40
  if (entrada.texto.includes(termino)) return 15
  return 0
}

const BONO: Record<TipoEntrada, number> = { pantalla: 8, componente: 4, caso: 0 }

/** La puntuación de una entrada para una consulta; 0 si algún término no coincide. */
export function puntuar(entrada: EntradaBusqueda, consulta: string): number {
  const terminos = normalizar(consulta).split(/\s+/).filter(Boolean)
  if (terminos.length === 0) return 0
  let total = 0
  for (const termino of terminos) {
    const directa = coincidencia(entrada, termino)
    const porSinonimo = Math.max(0, ...[...ponderados(termino)].map(([s, peso]) => coincidencia(entrada, s) * peso))
    const mejor = Math.max(directa, porSinonimo)
    if (mejor === 0) return 0
    total += mejor
  }
  return total + BONO[entrada.tipo]
}

/**
 * Las entradas que coinciden con la consulta, de la más a la menos parecida. Con `porTipo`,
 * como mucho tantas de cada tipo (la paleta enseña pocas de cada grupo).
 */
export function buscar(
  indice: readonly EntradaBusqueda[],
  consulta: string,
  opciones: { porTipo?: Partial<Record<TipoEntrada, number>>; admin?: boolean } = {},
): EntradaBusqueda[] {
  const { porTipo, admin = true } = opciones
  const puntuadas = indice
    .filter((e) => admin || !e.soloAdmin)
    .map((e) => ({ e, puntos: puntuar(e, consulta) }))
    .filter((p) => p.puntos > 0)
    .sort((a, b) => b.puntos - a.puntos || a.e.titulo.length - b.e.titulo.length || a.e.titulo.localeCompare(b.e.titulo, 'es'))
    .map((p) => p.e)
  if (!porTipo) return puntuadas
  const cuenta: Partial<Record<TipoEntrada, number>> = {}
  return puntuadas.filter((e) => {
    const maximo = porTipo[e.tipo]
    if (maximo === undefined) return true
    cuenta[e.tipo] = (cuenta[e.tipo] ?? 0) + 1
    return (cuenta[e.tipo] ?? 0) <= maximo
  })
}
