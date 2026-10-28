import { Routes } from '@angular/router';
import { conSesion, requiereSesion, sinSesion } from './guardas';
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
    path: 'ingreso',
    redirectTo: RUTA_INGRESO.slice(1),
    pathMatch: 'full',
  },
  {
    path: '',
    pathMatch: 'full',
    title: `Aybar Atiende · Sistema Central de Atención al Cliente · ${NOMBRE_PROYECTO}`,
    canActivate: [requiereSesion],
    loadComponent: () => import('./pantallas/atc/consola-atc').then((m) => m.ConsolaAtcComponent),
  },
  {
    path: 'consola',
    title: `Aybar Atiende · Sistema Central de Atención al Cliente · ${NOMBRE_PROYECTO}`,
    canActivate: [requiereSesion],
    loadComponent: () => import('./pantallas/atc/consola-atc').then((m) => m.ConsolaAtcComponent),
  },
  {
    path: 'detalle-propuestas',
    title: `Propuestas del detalle de ticket · ${NOMBRE_PROYECTO} · Aybar`,
    loadComponent: () =>
      import('./pantallas/atc/propuestas-detalle/vista-propuestas-detalle').then((m) => m.VistaPropuestasDetalle),
  },
  {
    path: 'propuestas-monitor',
    title: `Propuestas del Monitor · ${NOMBRE_PROYECTO} · Aybar`,
    loadComponent: () =>
      import('./pantallas/atc/propuestas-monitor/vista-propuestas-monitor').then((m) => m.VistaPropuestasMonitor),
  },
  {
    path: 'bienvenida',
    title: `Portada SDK · ${NOMBRE_PROYECTO} · Aybar`,
    loadComponent: () => import('./pantallas/bienvenida').then((m) => m.Bienvenida),
  },
  {
    path: 'inicio-sdk',
    canMatch: [conSesion],
    loadComponent: () => import('./pantallas/inicio').then((m) => m.Inicio),
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
