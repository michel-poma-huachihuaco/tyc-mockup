import { Card, CardBody, CardHeader, EmptyState, TreeView } from '@aybarcorp/ui'
import type { TreeNode } from '@aybarcorp/ui'
import { useEffect, useMemo, useRef } from 'react'
import type { FocusEvent } from 'react'
import { idDeEtiqueta, metaDeLote, textoMostrando } from './plano'
import type { RamaLista } from './plano'

/**
 * La lista de lotes, accesible con el teclado: el TreeView del framework —un solo punto
 * de tabulación, flechas, Inicio y Fin, una letra salta al siguiente nodo que empieza por
 * ella— con una rama por manzana. Enter elige el lote (y el 3D lo marca); el lote que
 * tiene el foco se marca también en el plano, más suave.
 *
 * La etiqueta de cada lote es su código («B-07»): es lo que se lee en el DOM para saber
 * qué nodo tiene el foco, porque el TreeView no lo cuenta.
 */
export function ListaLotes({
  ramas,
  total,
  seleccionado,
  abiertas,
  alAbrir,
  alSeleccionar,
  alEnfocar,
}: {
  ramas: readonly RamaLista[]
  total: number
  seleccionado: string | null
  abiertas: readonly string[]
  alAbrir: (ids: string[]) => void
  alSeleccionar: (id: string) => void
  alEnfocar: (id: string | null) => void
}) {
  const caja = useRef<HTMLDivElement>(null)
  const nodos = useMemo<TreeNode[]>(
    () =>
      ramas.map((rama) => ({
        id: rama.id,
        label: rama.etiqueta,
        meta: rama.meta,
        children: rama.lotes.map((lote) => ({ id: lote.id, label: lote.id, meta: metaDeLote(lote) })),
      })),
    [ramas],
  )
  const visibles = ramas.reduce((suma, rama) => suma + rama.lotes.length, 0)

  // Un lote elegido en el plano se trae a la vista dentro de la lista (no la página entera).
  useEffect(() => {
    const contenedor = caja.current
    const nodo = contenedor?.querySelector<HTMLElement>('[role="treeitem"][aria-selected="true"] > .ay-tree__row')
    if (!contenedor || !nodo) return
    const arriba = nodo.getBoundingClientRect().top - contenedor.getBoundingClientRect().top + contenedor.scrollTop
    const abajo = arriba + nodo.offsetHeight
    if (arriba < contenedor.scrollTop) contenedor.scrollTop = arriba
    else if (abajo > contenedor.scrollTop + contenedor.clientHeight) contenedor.scrollTop = abajo - contenedor.clientHeight
  }, [seleccionado, abiertas])

  const alEntrar = (evento: FocusEvent<HTMLDivElement>) => {
    const nodo = evento.target.closest('[role="treeitem"]')
    alEnfocar(idDeEtiqueta(nodo?.querySelector('.ay-tree__label')?.textContent))
  }
  const alSalir = (evento: FocusEvent<HTMLDivElement>) => {
    if (!(evento.relatedTarget instanceof Node) || !evento.currentTarget.contains(evento.relatedTarget)) alEnfocar(null)
  }

  return (
    <Card>
      <CardHeader as="h2" title="Lotes" subtitle={textoMostrando(visibles, total)} />
      <CardBody padding="none">
        <div ref={caja} className="gl-maqueta__arbol" onFocus={alEntrar} onBlur={alSalir}>
          <TreeView
            aria-label="Lotes por manzana"
            nodes={nodos}
            mode="navigation"
            size="sm"
            showCount
            expandedIds={[...abiertas]}
            onExpandedChange={alAbrir}
            selectedIds={seleccionado ? [seleccionado] : []}
            onSelectedChange={(ids) => {
              const id = ids[0]
              if (id) alSeleccionar(id)
            }}
          >
            <EmptyState size="compact" variant="no-results" title="Ningún lote con estos filtros" description="Cambia el estado o la manzana para ver más lotes." />
          </TreeView>
        </div>
      </CardBody>
      <CardBody padding="sm">
        <p className="gl-maqueta__nota">Flechas para recorrer, Enter para elegir. Una letra salta a su manzana.</p>
      </CardBody>
    </Card>
  )
}
