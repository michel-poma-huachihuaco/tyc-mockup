import { ProveedorAutenticacion } from '@aybarcorp/auth/react'
import { autenticacion } from './aybar/autenticacion'
import '@aybarcorp/tokens/css'
import '@aybarcorp/ui/css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './fuentes.css'
import './estilos.css'
import { App } from './App'

const raiz = document.getElementById('root')
if (!raiz) {
  throw new Error('index.html no tiene el elemento #root donde montar la aplicacion.')
}

createRoot(raiz).render(
  <StrictMode>
    <ProveedorAutenticacion autenticacion={autenticacion} cargando={null}>
      <App />
    </ProveedorAutenticacion>
  </StrictMode>,
)
