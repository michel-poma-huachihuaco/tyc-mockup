import { defineConfig } from 'vite'

// Mi Portal (src/portal) como un módulo ES aparte: artefacto/assets/mi-portal.js. No trae React ni componentes propios:
// los toma de los chunks del artifact, que quedan como externos. Cada «aybar:<chunk>» se reescribe a su archivo real.
const CHUNKS: Record<string, string> = {
  'aybar:comun': './comun-CVU2GQ4h.js',
  'aybar:prototipo': './prototipo-B6qmgYQk.js',
  'aybar:FormField': './FormField-BR5f57fp.js',
  'aybar:Textarea': './Textarea-DtfHJHzV.js',
  'aybar:Input': './Input-BYH1MAKY.js',
  'aybar:CardBody': './CardBody-WQ8Pzs3R.js',
  'aybar:EmptyState': './EmptyState-DMKP8Bhj.js',
  'aybar:DataGrid': './DataGrid-DgP6eHZJ.js',
  'aybar:Breadcrumb': './Breadcrumb-BtXUT3bJ.js',
  'aybar:FileItem': './FileItem-nWzF1I4B.js',
  'aybar:Radio': './Radio-CgEEMRd2.js',
}

export default defineConfig({
  build: {
    outDir: 'artefacto/assets',
    emptyOutDir: false,
    lib: { entry: 'src/portal/index.ts', formats: ['es'], fileName: () => 'mi-portal.js' },
    rollupOptions: { external: Object.keys(CHUNKS), output: { paths: CHUNKS } },
  },
})
