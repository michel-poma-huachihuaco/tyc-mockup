import type { Routes } from '@angular/router';

/**
 * La galería de demostración en producción: no existe. `ng serve` (la configuración
 * development de angular.json) sustituye este archivo por galeria.development.ts con un
 * `fileReplacements`, el mismo mecanismo que environment.development.ts; `ng build` usa
 * este, así que ni las rutas de /demo ni nada de src/app/demo/ llegan a dist/.
 *
 * Los dos archivos exportan lo mismo con los mismos tipos. `npm run demo:quitar` borra los
 * dos, la carpeta src/app/demo/ y las regiones `aybar:demo` que los usan.
 */

/** Las rutas de /demo: ninguna. */
export const RUTAS_GALERIA: Routes = [];

/** Adónde llevan los accesos a la galería del inicio y la bienvenida; sin galería, ninguno. */
export const ENLACES_GALERIA: { readonly portada: string; readonly vitrina: string } | null = null;
