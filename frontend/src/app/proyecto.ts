// Lo escribe `aybar new project`: lo que las pantallas necesitan saber del proyecto.
export const NOMBRE_PROYECTO = 'aybar-atc';

/**
 * Si el repositorio trae el backend del SDK: la pantalla de inicio lo llama, y los comandos
 * de aybar para el frontend llevan --frontend (monorepo).
 */
export const CON_BACKEND: boolean = true;

/** El papel con que se generó (app, shell o remoto) y el puerto fijo de `ng serve` (angular.json). */
export const PAPEL: 'app' | 'shell' | 'remoto' = 'app';
export const PUERTO_DESARROLLO = 4200;
