import { Skeleton, Spinner, useSkeletonDelay } from '@aybarcorp/ui'
import { useEffect, useRef, useState } from 'react'
import { LOTES } from '../datos'
import type { EscenaLotes } from './escena-lotes'
import { resumenEnTexto } from './plano'

/**
 * El lienzo 3D: carga three.js con `import()` —solo aquí, en su propio chunk— y monta la
 * escena en un contenedor que React no toca. Mientras llega, la silueta del lienzo y un
 * Spinner; si falla (sin red, sin contexto WebGL), avisa con `alFallar` y la pantalla
 * pasa al plano 2D. Al desmontar, `dispose()` lo suelta todo.
 */
export function Lienzo3D({
  seleccionado,
  enfocado,
  visibles,
  alSeleccionar,
  alFallar,
}: {
  seleccionado: string | null
  enfocado: string | null
  visibles: ReadonlySet<string>
  /** Estable (un `useCallback`): cambiarla rehace la escena. */
  alSeleccionar: (id: string) => void
  /** Estable, como `alSeleccionar`. */
  alFallar: (error: unknown) => void
}) {
  const contenedor = useRef<HTMLDivElement>(null)
  const [escena, setEscena] = useState<EscenaLotes | null>(null)
  const silueta = useSkeletonDelay(escena === null)

  useEffect(() => {
    let cancelado = false
    let creada: EscenaLotes | null = null
    import('./escena-lotes')
      .then(({ crearEscena }) => {
        const destino = contenedor.current
        if (cancelado || !destino) return
        creada = crearEscena(destino, { alSeleccionar })
        setEscena(creada)
      })
      .catch((error: unknown) => {
        if (!cancelado) alFallar(error)
      })
    return () => {
      cancelado = true
      creada?.dispose()
    }
  }, [alSeleccionar, alFallar])

  useEffect(() => {
    escena?.seleccionar(seleccionado)
  }, [escena, seleccionado])
  useEffect(() => {
    escena?.enfocar(enfocado)
  }, [escena, enfocado])
  useEffect(() => {
    escena?.filtrar(visibles)
  }, [escena, visibles])

  return (
    <div className="gl-maqueta__lienzo" aria-busy={escena === null}>
      <div
        ref={contenedor}
        className="gl-maqueta__webgl"
        role="img"
        aria-label={`Maqueta 3D de ${LOTES.length} lotes: ${resumenEnTexto()}. Arrastra para girar, rueda o pellizca para acercar. Con el teclado, usa la lista de lotes.`}
      />
      {escena === null && silueta ? (
        <div className="gl-maqueta__carga">
          <Skeleton variant="block" width="100%" height="100%" radius="0" />
          <span className="gl-maqueta__spinner">
            <Spinner size="lg" label="Cargando el visor 3D" showLabel />
          </span>
        </div>
      ) : null}
    </div>
  )
}
