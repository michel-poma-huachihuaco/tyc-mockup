import '@aybarcorp/tokens/css'
import '@aybarcorp/ui/css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../fuentes.css'
import '../estilos.css'
import { Prototipo } from './Prototipo.tsx'
import { alinearRelojDelNavegador } from './servicio/api.ts'

/**
 * Entrada del prototipo G2 (`prototipo.html`): sin sesión OIDC ni cliente HTTP, porque el
 * rol se elige dentro y los datos son ficticios. No la importa ninguna parte de la
 * aplicación: el build de producción (index.html) no la contiene.
 */
alinearRelojDelNavegador()

const raiz = document.getElementById('root')
if (!raiz) throw new Error('prototipo.html no tiene el elemento #root.')

createRoot(raiz).render(
  <StrictMode>
    <Prototipo />
  </StrictMode>,
)
