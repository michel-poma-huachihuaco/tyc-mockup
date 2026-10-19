import * as ui from '@aybarcorp/ui'
import { Fragment, createElement } from 'react'
import type { ComponentType, ReactNode } from 'react'
import type { CasoCatalogo, NodoCatalogo, NodoMarco } from './catalogo'

/**
 * El elemento React de un caso del catálogo (formato 2), igual que lo construye
 * `aybar-front docs`: el componente por su nombre en @aybarcorp/ui, sus props y sus hijos, y
 * además lo que el formato 2 añade:
 *
 * - `{"$elemento": nodo | [nodos]}` como valor de una prop: la prop recibe un elemento (o un
 *   Fragment, si es una lista) —el pie de un Modal con botones de verdad—.
 * - `marco`: el contenedor que da sentido al caso —un List Item en su List, una celda en su
 *   fila—, con `"$caso"` en el sitio del caso. Los elementos HTML del marco se limitan a la
 *   lista blanca del formato.
 *
 * Un manejador que el catálogo deja en `null` (`onSubmit`, `onSelect`…) es el que pondría
 * quien usa el componente: aquí es una función vacía, para que interactuar con el caso no
 * lance «null is not a function» en la consola.
 */
const componentes = ui as unknown as Readonly<Record<string, unknown>>

const ELEMENTOS_MARCO = new Set(['ul', 'ol', 'div', 'section', 'table', 'tbody', 'tr'])
export const MARCADOR_CASO = '$caso'

/** Las props que el caso sobrescribe al pintarse (abrir una capa, quitar un atajo…). */
export type Ajustes = Readonly<Record<string, unknown>>

function tipoDe(nombre: string): ComponentType<Record<string, unknown>> {
  const tipo = componentes[nombre]
  if (typeof tipo !== 'function' && (typeof tipo !== 'object' || tipo === null)) {
    throw new Error(
      `@aybarcorp/ui no exporta «${nombre}», que nombra el catálogo. Pasa con una ` +
        'instalación mezclada: alinea todos los @aybarcorp/* a la misma versión y reinstala.',
    )
  }
  return tipo as ComponentType<Record<string, unknown>>
}

const vacio = () => undefined

function esValorElemento(valor: unknown): valor is { $elemento: NodoCatalogo | readonly NodoCatalogo[] } {
  return typeof valor === 'object' && valor !== null && '$elemento' in valor
}

/** Las props listas para React: `$elemento` a elementos, manejadores nulos a vacíos, en profundidad. */
function prepararValor(clave: string, valor: unknown): unknown {
  if (valor === null) return /^on[A-Z]/.test(clave) ? vacio : null
  if (esValorElemento(valor)) {
    const nodos = Array.isArray(valor.$elemento) ? valor.$elemento : [valor.$elemento as NodoCatalogo]
    if (nodos.length === 1 && !Array.isArray(valor.$elemento)) return construir(nodos[0] as NodoCatalogo)
    return createElement(Fragment, null, ...nodos.map((n, i) => construir(n, `e${i}`)))
  }
  if (Array.isArray(valor)) return valor.map((v) => prepararValor('', v))
  if (typeof valor === 'object' && valor !== null) {
    return Object.fromEntries(Object.entries(valor).map(([k, v]) => [k, prepararValor(k, v)]))
  }
  return valor
}

function prepararProps(props: Readonly<Record<string, unknown>> | undefined, ajustes?: Ajustes): Record<string, unknown> {
  const salida: Record<string, unknown> = {}
  for (const [clave, valor] of Object.entries(props ?? {})) salida[clave] = prepararValor(clave, valor)
  return { ...salida, ...ajustes }
}

export function construir(nodo: NodoCatalogo, clave?: string, ajustes?: Ajustes): ReactNode {
  const props = prepararProps(nodo.props, ajustes)
  if (clave !== undefined) props.key = clave
  const { hijos } = nodo
  const tipo = tipoDe(nodo.componente)
  if (typeof hijos === 'string') return createElement(tipo, props, hijos)
  if (hijos) return createElement(tipo, props, ...hijos.map((hijo, i) => construir(hijo, `h${i}`)))
  return createElement(tipo, props)
}

function construirMarco(nodo: NodoMarco | string, caso: ReactNode, clave: string): ReactNode {
  if (nodo === MARCADOR_CASO) return createElement(Fragment, { key: clave }, caso)
  if (typeof nodo === 'string') return nodo
  const props: Record<string, unknown> = { ...prepararProps(nodo.props), key: clave }
  const hijos = typeof nodo.hijos === 'string' ? [nodo.hijos] : (nodo.hijos ?? []).map((h, i) => construirMarco(h, caso, `m${i}`))
  if (nodo.elemento) {
    if (!ELEMENTOS_MARCO.has(nodo.elemento)) throw new Error(`El marco usa <${nodo.elemento}>, que no está en la lista blanca del formato 2.`)
    return createElement(nodo.elemento, props, ...hijos)
  }
  if (!nodo.componente) throw new Error('Un nodo del marco no tiene ni componente ni elemento.')
  return createElement(tipoDe(nodo.componente), props, ...hijos)
}

/**
 * Las piezas de tabla que un catálogo sin marco muestra solas (una fila, una celda) son
 * `<tr>`, `<td>` o `<th>`, y fuera de una tabla el HTML no las admite: van dentro del mínimo
 * de tabla que las hace válidas. Con el formato 2 el marco ya lo dice y esto no actúa.
 */
const ENVOLTURA_TABLA: ReadonlyArray<[RegExp, 'table' | 'tbody' | 'tr']> = [
  [/^Table(Head|Header|Body|Foot|Footer)$/, 'table'],
  [/^TableRow$/, 'tbody'],
  [/^Table(Cell|HeaderCell|HeadCell)$/, 'tr'],
]

/** El caso entero: el componente del grupo con sus props (y los ajustes), dentro de su marco. */
export function construirCaso(componente: string, caso: CasoCatalogo, ajustes?: Ajustes): ReactNode {
  const elemento = construir({ componente, props: caso.props, hijos: caso.hijos }, undefined, ajustes)
  if (caso.marco) return construirMarco(caso.marco, elemento, 'marco')
  const nivel = ENVOLTURA_TABLA.find(([patron]) => patron.test(componente))?.[1]
  if (!nivel) return elemento
  const fila = nivel === 'tr' ? createElement('tr', null, elemento) : elemento
  const cuerpo = nivel === 'tr' || nivel === 'tbody' ? createElement('tbody', null, fila) : fila
  return createElement('table', { className: 'gl-caso__tabla' }, cuerpo)
}

/** `true` si el caso trae su propio disparador (un Dropdown Menu con `trigger`): se pinta en línea. */
export function traeDisparador(caso: CasoCatalogo): boolean {
  return caso.props !== undefined && 'trigger' in caso.props
}
