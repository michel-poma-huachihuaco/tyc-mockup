import { agruparPorFamilia, indexarFichas } from './catalogo'
import type { Catalogo, FamiliaVitrina, FichaComponente } from './catalogo'

/**
 * El catálogo del paquete instalado (`@aybarcorp/ui/ejemplos`, ~800 kB) y sus fichas de props
 * (`@aybarcorp/ui/props`), cargados una sola vez y solo cuando una pantalla los pide: la
 * vitrina, la portada (sus cifras) o el buscador. Los dos JSON van en su propio chunk.
 */
export interface DatosCatalogo {
  readonly catalogo: Catalogo
  readonly familias: readonly FamiliaVitrina[]
  readonly fichas: ReadonlyMap<string, FichaComponente>
  readonly componentes: number
  readonly casos: number
}

let promesa: Promise<DatosCatalogo> | null = null

export function cargarCatalogo(): Promise<DatosCatalogo> {
  promesa ??= Promise.all([import('@aybarcorp/ui/ejemplos'), import('@aybarcorp/ui/props')]).then(([ejemplos, props]) => {
    const catalogo = ejemplos.default as unknown as Catalogo
    const familias = agruparPorFamilia(catalogo)
    return {
      catalogo,
      familias,
      fichas: indexarFichas(props.default),
      componentes: familias.reduce((total, f) => total + f.componentes.length, 0),
      casos: familias.reduce((total, f) => total + f.casos, 0),
    }
  })
  return promesa
}
