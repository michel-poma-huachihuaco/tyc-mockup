import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import type { Plugin } from 'vite'

/**
 * La ruta del arranque de la apariencia, la que nombra el <script> del <head> de index.html.
 * Nombre fijo (sin hash) porque index.html lo escribe a mano; mismo origen, así que la CSP
 * de nginx.conf (`script-src 'self'`) lo admite sin hash ni nonce.
 */
const RUTA_APARIENCIA = '/aybar-apariencia.js'

/**
 * Sirve en `npm run dev` y copia a dist/ en el build el arranque de la apariencia de
 * @aybarcorp/tokens (`@aybarcorp/tokens/apariencia/arranque`): un script clásico, sin
 * dependencias, que aplica en <html> el tema y la apariencia que el usuario eligió antes del
 * primer pintado. Sin él, cada recarga pinta primero el tema por defecto y destella.
 *
 * Se lee del paquete instalado, resuelto como lo resolvería Node: al actualizar
 * @aybarcorp/tokens se actualiza solo y no hay una copia en public/ que se quede vieja.
 */
function arranqueApariencia(): Plugin {
  const archivo = createRequire(import.meta.url).resolve('@aybarcorp/tokens/apariencia/arranque')
  const leer = () => readFileSync(archivo, 'utf8')
  return {
    name: 'aybar-arranque-apariencia',
    configureServer(servidor) {
      servidor.middlewares.use(RUTA_APARIENCIA, (_peticion, respuesta) => {
        respuesta.setHeader('Content-Type', 'text/javascript; charset=utf-8')
        respuesta.end(leer())
      })
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: RUTA_APARIENCIA.slice(1), source: leer() })
    },
  }
}

// aybar:demo:inicio — guarda de la galería de demostración (npm run demo:quitar la borra)
/**
 * La galería de demostración (src/demo/) es solo de `npm run dev`: la App la monta con un
 * `import()` detrás de import.meta.env.DEV, que en producción no existe. Esta guarda lo
 * comprueba en cada `npm run build`: si un módulo de src/demo/ —o three.js o axe-core, que
 * solo usa la galería— llega al bundle, el build falla en vez de publicarlo.
 */
function sinGaleria(): Plugin {
  const prohibido = /\/src\/demo\/|\/node_modules\/(three|axe-core)\//
  return {
    name: 'aybar-sin-galeria',
    apply: 'build',
    generateBundle(_salida, bundle) {
      for (const pieza of Object.values(bundle)) {
        if (pieza.type !== 'chunk') continue
        const colados = (pieza.moduleIds ?? Object.keys(pieza.modules)).filter((id) => prohibido.test(id.replaceAll('\\', '/')))
        if (colados.length > 0) {
          this.error(
            `La galería de demostración llegó al build de producción (${pieza.fileName}): ${colados.join(', ')}. ` +
              'Solo se monta con import.meta.env.DEV; nada fuera de src/demo/ puede importarla.',
          )
        }
      }
    },
  }
}
// aybar:demo:fin

// Puerto fijo y estricto. El CORS del backend en local
// (aybar.security.cors.origenes-permitidos) y el redirect URI que registre el
// emisor autorizan http://localhost:5173: si ese puerto esta ocupado,
// Vite falla en vez de saltar a otro que nadie autorizo y que daria un error
// de CORS o de redirect_uri mucho mas dificil de leer.
export default defineConfig({
  plugins: [
    react(),
    arranqueApariencia(),
    // aybar:demo:inicio
    sinGaleria(),
    // aybar:demo:fin
  ],
  server: { port: 5173, strictPort: true },
  preview: { port: 5173, strictPort: true },
})
