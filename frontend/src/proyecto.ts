// Lo escribe `aybar new project`: lo que las pantallas necesitan saber del proyecto.
export const NOMBRE_PROYECTO = 'tyc'

/** Si el repositorio trae el backend del SDK (monorepo): los comandos de aybar para el frontend llevan --frontend. */
export const CON_BACKEND: boolean = false

/** El papel con que se generó (app, shell o remoto) y el puerto fijo de `npm run dev` (vite.config.ts). */
export const PAPEL: 'app' | 'shell' | 'remoto' = 'app'
export const PUERTO_DESARROLLO = 5173
