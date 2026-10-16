import { Routes } from '@angular/router';
import { conSesion, sinSesion } from './guardas';
// aybar:demo:inicio — galería de demostración, solo en desarrollo (npm run demo:quitar la borra)
import { RUTAS_GALERIA } from './galeria';
// aybar:demo:fin
import { NOMBRE_PROYECTO } from './proyecto';
import { RUTA_INGRESO } from './rutas';

/**
 * Rutas de la aplicación, todas perezosas: cada pantalla trae solo lo que usa.
 *
 * `/` tiene dos: el inicio, que solo coincide con sesión (`conSesion`), y la bienvenida
 * pública, que es la siguiente.
 */
export const routes: Routes = [
  {
    path: RUTA_INGRESO.slice(1),
    title: `Ingresar · ${NOMBRE_PROYECTO} · Aybar`,
    canActivate: [sinSesion],
    loadComponent: () => import('./pantallas/ingreso').then((m) => m.Ingreso),
  },
  {
    path: '',
    pathMatch: 'full',
    canMatch: [conSesion],
    loadComponent: () => import('./pantallas/inicio').then((m) => m.Inicio),
  },
  {
    path: '',
    pathMatch: 'full',
    title: `${NOMBRE_PROYECTO} · Aybar`,
    loadComponent: () => import('./pantallas/bienvenida').then((m) => m.Bienvenida),
  },
  // aybar:demo:inicio — /demo, la galería de demostración: la declara galeria.development.ts con
  // ng serve; en producción galeria.ts la deja vacía (fileReplacements de angular.json). Va
  // antes del comodín.
  ...RUTAS_GALERIA,
  // aybar:demo:fin
  {
    path: '**',
    loadComponent: () => import('./pantallas/no-encontrada').then((m) => m.NoEncontrada),
  },
];
