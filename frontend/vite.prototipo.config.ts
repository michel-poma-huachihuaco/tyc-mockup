import { mergeConfig } from 'vite'
import base from './vite.config.ts'

/**
 * Build aparte del prototipo G2 (`npm run prototipo:build`): solo `prototipo.html`, con
 * rutas relativas para servirse en cualquier carpeta (o publicarse como página suelta).
 * Sale a dist/prototipo-g2/, que Git y el contexto de Docker ya ignoran; el build de
 * producción (index.html) no lo contiene ni lo importa.
 */
export default mergeConfig(base, {
  base: './',
  build: {
    outDir: 'dist/prototipo-g2',
    emptyOutDir: true,
    rollupOptions: { input: 'prototipo.html' },
  },
})
