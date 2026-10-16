import type { Routes } from '@angular/router';
import { NOMBRE_PROYECTO } from '../proyecto';
import { EstadoGaleria } from './estado';
import { casoNumerado, requiereSesionGaleria, subseccionDeAdmin, subseccionDeCuenta, varianteConocida } from './guardas';
import { MarcoGaleria } from './marco';
import { GaleriaRaiz } from './raiz';

/** «Vitrina · Galería · mi-proyecto»: la pestaña dice dónde se está. */
const titulo = (pantalla: string) => `${pantalla} · Galería · ${NOMBRE_PROYECTO}`;

/**
 * Las rutas de /demo, todas perezosas. Las monta src/app/galeria.development.ts con
 * `loadChildren`, así que ni esta lista ni sus pantallas entran en el bundle inicial, y en
 * producción no existen (galeria.ts no las declara).
 *
 * - `ingreso` y sus once variantes son públicas y van a pantalla completa, sin marco.
 * - Lo demás pide sesión (`requiereSesionGaleria`). El caso de la vitrina a pantalla
 *   completa va sin marco; el resto, dentro del marco de la galería.
 * - Un parámetro que no existe (una variante, una subsección) no coincide y cae en el 404
 *   de la galería, con sugerencias.
 *
 * El mapa equivalente sin Angular está en navegacion.ts (migas, títulos y sugerencias).
 */
export const RUTAS_DEMO: Routes = [
  {
    path: '',
    component: GaleriaRaiz,
    providers: [EstadoGaleria],
    children: [
      {
        path: 'ingreso',
        title: titulo('Ingreso'),
        loadComponent: () => import('./ingreso/indice').then((m) => m.IndiceIngreso),
      },
      {
        path: 'ingreso/:variante',
        canMatch: [varianteConocida],
        loadComponent: () => import('./ingreso/variante').then((m) => m.PantallaVariante),
      },
      {
        path: '',
        canActivateChild: [requiereSesionGaleria],
        children: [
          {
            path: 'vitrina/:familia/:componente/caso/:n',
            canMatch: [casoNumerado],
            title: titulo('Caso'),
            loadComponent: () => import('./vitrina/caso').then((m) => m.PantallaCaso),
          },
          {
            path: '',
            component: MarcoGaleria,
            children: [
              {
                path: '',
                pathMatch: 'full',
                title: titulo('Portada'),
                loadComponent: () => import('./portada/portada').then((m) => m.Portada),
              },
              {
                path: 'vitrina',
                title: titulo('Vitrina'),
                loadComponent: () => import('./vitrina/vitrina').then((m) => m.PaginaVitrina),
              },
              {
                path: 'vitrina/:familia',
                title: titulo('Vitrina'),
                loadComponent: () => import('./vitrina/vitrina').then((m) => m.PaginaVitrina),
              },
              {
                path: 'vitrina/:familia/:componente',
                title: titulo('Vitrina'),
                loadComponent: () => import('./vitrina/vitrina').then((m) => m.PaginaVitrina),
              },
              { path: 'cuenta', pathMatch: 'full', redirectTo: 'cuenta/perfil' },
              {
                path: 'cuenta/:seccion',
                canMatch: [subseccionDeCuenta],
                title: titulo('Cuenta'),
                loadComponent: () => import('./cuenta/cuenta').then((m) => m.PantallaCuenta),
              },
              { path: 'admin', pathMatch: 'full', redirectTo: 'admin/resumen' },
              {
                path: 'admin/:seccion',
                canMatch: [subseccionDeAdmin],
                title: titulo('Administración'),
                loadComponent: () => import('./admin/admin').then((m) => m.PantallaAdmin),
              },
              {
                path: 'personalizacion',
                title: titulo('Personalización'),
                loadComponent: () => import('./personalizacion/personalizacion').then((m) => m.PantallaPersonalizacion),
              },
              {
                path: 'profundidad',
                title: titulo('Profundidad'),
                loadComponent: () => import('./profundidad/profundidad').then((m) => m.PantallaProfundidad),
              },
              {
                path: '3d',
                title: titulo('Visor 3D'),
                loadComponent: () => import('./visor/visor').then((m) => m.PantallaVisor),
              },
              {
                path: 'redimensionado',
                title: titulo('Redimensionado'),
                loadComponent: () => import('./redimensionado/redimensionado').then((m) => m.PantallaRedimensionado),
              },
              {
                path: 'accesibilidad',
                title: titulo('Accesibilidad'),
                loadComponent: () => import('./accesibilidad/accesibilidad').then((m) => m.PantallaAccesibilidad),
              },
              {
                path: '**',
                title: titulo('Página no encontrada'),
                loadComponent: () => import('./no-encontrada').then((m) => m.NoEncontradaGaleria),
              },
            ],
          },
        ],
      },
    ],
  },
];
