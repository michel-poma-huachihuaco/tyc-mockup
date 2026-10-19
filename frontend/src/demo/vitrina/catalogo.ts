/**
 * La forma de `@aybarcorp/ui/ejemplos` (dist/ejemplos.json, formato 2) y cómo la vitrina la
 * agrupa y la recorre. Sin React ni DOM: se prueba con `npm test` (pruebas/demo-vitrina.test.ts).
 *
 * La vitrina no tiene una lista de componentes escrita a mano: muestra lo que trae el
 * catálogo verificado del paquete instalado. El build de @aybarcorp/ui falla si un caso
 * nombra un componente que no exporta o una prop que no existe, así que un componente
 * nuevo del sistema de diseño aparece aquí al actualizar el paquete, sin tocar código.
 */

/** Un elemento anidado: `hijos` es texto o más elementos. */
export interface NodoCatalogo {
  readonly componente: string
  readonly props?: Readonly<Record<string, unknown>>
  readonly hijos?: string | readonly NodoCatalogo[] | null
}

/**
 * Formato 2: el contenedor que da sentido a un caso (un List Item en su List, una celda en
 * su fila), con `"$caso"` en el sitio del caso. Un nodo es un componente del sistema o un
 * elemento HTML de una lista blanca corta.
 */
export interface NodoMarco {
  readonly componente?: string
  readonly elemento?: string
  readonly props?: Readonly<Record<string, unknown>>
  readonly hijos?: string | readonly (NodoMarco | string)[] | null
}

export interface CasoCatalogo {
  readonly etiqueta: string
  readonly props?: Readonly<Record<string, unknown>>
  readonly hijos?: string | readonly NodoCatalogo[] | null
  readonly marco?: NodoMarco | null
  /** El JSX del caso, con su marco y sus `$elemento`: lo que copia «Copiar código». */
  readonly jsx?: string
}

export interface GrupoCatalogo {
  readonly familia: string
  readonly componente: string
  readonly titulo: string
  readonly nota?: string
  /** Una capa (Modal, Drawer, menú…): se abre a petición y devuelve el foco. */
  readonly capa?: boolean
  /** `completo`: cada caso ocupa el ancho entero (páginas, rejillas, layouts grandes). */
  readonly ancho?: string
  readonly casos: readonly CasoCatalogo[]
}

export interface Catalogo {
  readonly formato?: number
  readonly grupos: readonly GrupoCatalogo[]
}

/** Orden de las familias en el Aybar Design System V1. */
export const ORDEN_FAMILIAS = [
  'Foundations',
  'Layout',
  'Actions',
  'Form Architecture',
  'Form Controls',
  'Surfaces',
  'Data',
  'Feedback',
  'Overlays',
  'Navigation',
  'Media',
  'Specialized',
  'Errors',
] as const

/** Para comparar al buscar: sin tildes, sin mayúsculas y sin espacios de los extremos. */
export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

/** El tramo de URL de una familia: «Form Controls» → `form-controls`. */
export function slugFamilia(nombre: string): string {
  return normalizar(nombre)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** El tramo de URL de un componente: «DataGrid» → `data-grid`, «Error404» → `error-404`. */
export function slugComponente(nombre: string): string {
  return nombre
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Za-z])(\d)/g, '$1-$2')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
}

export interface ComponenteVitrina {
  readonly nombre: string
  readonly slug: string
  readonly familia: string
  readonly slugFamilia: string
  readonly grupos: readonly GrupoCatalogo[]
  readonly casos: number
}

export interface FamiliaVitrina {
  readonly nombre: string
  readonly slug: string
  readonly componentes: readonly ComponenteVitrina[]
  readonly casos: number
}

/**
 * Agrupa el catálogo por familia, en el orden del diseño. Las familias del diseño que el
 * paquete instalado todavía no publica salen igual, vacías: así se ve qué falta. Una
 * familia que el diseño no nombra va al final, en el orden en que aparece. Dentro de cada
 * familia, componentes y grupos conservan el orden del catálogo.
 */
export function agruparPorFamilia(catalogo: Catalogo): FamiliaVitrina[] {
  const porFamilia = new Map<string, Map<string, GrupoCatalogo[]>>()
  for (const nombre of ORDEN_FAMILIAS) porFamilia.set(nombre, new Map())
  for (const grupo of catalogo.grupos) {
    let componentes = porFamilia.get(grupo.familia)
    if (!componentes) {
      componentes = new Map()
      porFamilia.set(grupo.familia, componentes)
    }
    const grupos = componentes.get(grupo.componente)
    if (grupos) grupos.push(grupo)
    else componentes.set(grupo.componente, [grupo])
  }
  return [...porFamilia].map(([nombre, componentes]) => {
    const slug = slugFamilia(nombre)
    const lista = [...componentes].map(([componente, grupos]) => ({
      nombre: componente,
      slug: slugComponente(componente),
      familia: nombre,
      slugFamilia: slug,
      grupos,
      casos: grupos.reduce((total, g) => total + g.casos.length, 0),
    }))
    return { nombre, slug, componentes: lista, casos: lista.reduce((total, c) => total + c.casos, 0) }
  })
}

/** La familia y el componente de una ruta de la vitrina, o `null` si alguno no existe. */
export function ubicarComponente(
  familias: readonly FamiliaVitrina[],
  familia: string,
  componente: string,
): { familia: FamiliaVitrina; componente: ComponenteVitrina } | null {
  const f = familias.find((x) => x.slug === familia)
  const c = f?.componentes.find((x) => x.slug === componente)
  return f && c ? { familia: f, componente: c } : null
}

export interface CasoUbicado {
  readonly grupo: GrupoCatalogo
  readonly caso: CasoCatalogo
  /** Posición en el componente, desde 1: la de `/caso/:n`. */
  readonly n: number
}

/** Los casos de un componente en orden, numerados desde 1 a lo largo de todos sus grupos. */
export function casosDe(componente: ComponenteVitrina): CasoUbicado[] {
  const lista: CasoUbicado[] = []
  for (const grupo of componente.grupos) for (const caso of grupo.casos) lista.push({ grupo, caso, n: lista.length + 1 })
  return lista
}

/** El componente anterior y el siguiente en el orden de la vitrina (saltando familias vacías). */
export function vecinosDe(
  familias: readonly FamiliaVitrina[],
  componente: ComponenteVitrina,
): { anterior: ComponenteVitrina | null; siguiente: ComponenteVitrina | null } {
  const todos = familias.flatMap((f) => f.componentes)
  const i = todos.findIndex((c) => c.slug === componente.slug && c.slugFamilia === componente.slugFamilia)
  return { anterior: i > 0 ? (todos[i - 1] ?? null) : null, siguiente: i >= 0 ? (todos[i + 1] ?? null) : null }
}

/** El id de ancla de un grupo dentro de la página del componente. */
export function anclaDeGrupo(indice: number, titulo: string): string {
  return `grupo-${indice + 1}-${slugFamilia(titulo) || 'casos'}`
}

/**
 * La forma de `@aybarcorp/ui/props` (dist/props.json): la descripción de cada componente y
 * sus props, extraídas de los tipos que publica el paquete. Es la misma fuente que usa
 * `aybar-front docs`, así que la tabla de la vitrina no se escribe a mano.
 */
export interface PropFicha {
  readonly nombre: string
  readonly tipo: string
  readonly requerido: boolean
  readonly porOmision: string | null
  readonly descripcion?: string
}

export interface FichaComponente {
  readonly nombre: string
  readonly descripcion?: string
  readonly props: readonly PropFicha[]
}

export interface TablaProps {
  readonly componentes: readonly FichaComponente[]
}

/** Las fichas por nombre de componente. Una tabla sin la forma esperada da un índice vacío. */
export function indexarFichas(tabla: unknown): ReadonlyMap<string, FichaComponente> {
  const componentes = (tabla as Partial<TablaProps> | null)?.componentes
  if (!Array.isArray(componentes)) return new Map()
  return new Map(componentes.map((ficha) => [ficha.nombre, ficha]))
}

/** La primera frase de una descripción, para las tarjetas y el buscador. */
export function primeraFrase(texto: string | undefined): string {
  if (!texto) return ''
  const limpio = texto.replace(/`/g, '').replace(/\s+/g, ' ').trim()
  const fin = limpio.search(/[.:](\s|$)/)
  return fin > 0 ? limpio.slice(0, fin + 1) : limpio
}
