import { Alert, Error404, Spinner } from '@aybarcorp/ui'
import { useEffect, useRef, useState } from 'react'
import { navegar } from '../navegacion'
import { mensajeDe, useTitulo } from './utiles'

/** Reemplaza la ruta actual por otra, sin dejar la intermedia en el historial. */
export function Redirigir({ a }: { a: string }) {
  useEffect(() => navegar(a, { reemplazar: true }), [a])
  return null
}

/**
 * /ingresar con el emisor real: no hay pantalla propia, se sale al emisor (Authorization
 * Code con PKCE). `entrar()` se llama una vez aunque el modo estricto repita el efecto:
 * dos transacciones seguidas dejarían la primera huérfana en el almacén de la pestaña.
 */
export function AlEmisor({ entrar }: { entrar: () => Promise<void> }) {
  useTitulo('Ingresar')
  const lanzado = useRef(false)
  const [error, setError] = useState<unknown>(null)
  useEffect(() => {
    if (lanzado.current) return
    lanzado.current = true
    entrar().catch(setError)
  }, [entrar])
  return (
    <main className="pl-centro">
      {error ? (
        <Alert tone="danger" title="No se pudo ir al emisor de identidad" live="off">
          {mensajeDe(error)} Revisa VITE_AYBAR_EMISOR o vuelve al modo demo (README.md).
        </Alert>
      ) : (
        <Spinner size="lg" label="Redirigiendo al emisor de identidad" showLabel />
      )}
    </main>
  )
}

/** Una ruta que esta aplicación no tiene. */
export function NoEncontrada() {
  return (
    <main className="pl-centro">
      <Error404 cause="unknown-route" backHref="/" />
    </main>
  )
}
