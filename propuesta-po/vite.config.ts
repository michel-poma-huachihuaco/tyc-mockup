import { defineConfig } from 'vite'

// Empaqueta solo las dos escenas three.js como un módulo ES que importan los chunks del artifact.
export default defineConfig({
  build: {
    outDir: 'artefacto/assets',
    emptyOutDir: false,
    lib: { entry: 'src/three/index.ts', formats: ['es'], fileName: () => 'escenas-three.js' },
    chunkSizeWarningLimit: 900,
  },
})
