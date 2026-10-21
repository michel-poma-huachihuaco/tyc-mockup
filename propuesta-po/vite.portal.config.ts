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
  // Operación en Vivo de Daniel (src/vivo): barra de progreso del SDK y la escena 3D (escenas-three.js, del otro build)
  'aybar:ProgressBar': './ProgressBar-CxT9FNs6.js',
  'aybar:escenas': './escenas-three.js',
  // Consulta 360 del Cliente de Daniel (src/c360): ventana del visor de contratos y tablas del expediente
  'aybar:Dialog': './Dialog-BcfHiG-J.js',
  'aybar:Table': './Table-BJWCycht.js',
  // 20-oct (b3-k): la vista y las reglas de la Consulta 360 del PO (Grafo360; parchear.mjs añade sus exports)
  'aybar:Grafo360': './Grafo360-BzaG42VX.js',
}

export default defineConfig({
  build: {
    outDir: 'artefacto/assets',
    emptyOutDir: false,
    // tres entradas: Mi Portal (mi-portal.js), la Operación en Vivo de Daniel (vivo-daniel.js, src/vivo) y la Consulta 360
    // del Cliente de Daniel (consulta360-daniel.js, src/c360)
    lib: { entry: { 'mi-portal': 'src/portal/index.ts', 'vivo-daniel': 'src/vivo/index.ts', 'consulta360-daniel': 'src/c360/index.ts' }, formats: ['es'], fileName: (_f, nombre) => `${nombre}.js` },
    rollupOptions: { external: Object.keys(CHUNKS), output: { paths: CHUNKS } },
  },
})
