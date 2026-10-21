import { inject } from '@angular/core';
import type { Routes } from '@angular/router';
import { Acceso } from './acceso';
import { SESION_GALERIA } from './demo/contexto';
import type { SesionGaleria } from './demo/contexto';

/**
 * La galería de demostración con `ng serve`: sustituye a galeria.ts por el `fileReplacements`
 * de la configuración development de angular.json. Todo /demo es perezoso —ninguna pantalla
 * de la galería entra en el bundle inicial— y `ng build` (producción) no lee este archivo.
 *
 * La galería no importa @aybarcorp/auth ni el cliente HTTP: recibe la sesión visible y la
 * acción de salir por `SESION_GALERIA`, igual que un remoto recibe las suyas del anfitrión.
 * Aquí se las da el acceso de la aplicación (src/app/acceso.ts), que es el mismo en la app,
 * en el shell y en el anfitrión local del remoto.
 *
 * `npm run demo:quitar` borra este archivo, galeria.ts, src/app/demo/ y las regiones
 * `aybar:demo` que los usan.
 */
export const RUTAS_GALERIA: Routes = [
  {
    path: 'demo',
    providers: [
      {
        provide: SESION_GALERIA,
        useFactory: (): SesionGaleria => {
          const acceso = inject(Acceso);
          return { sesion: acceso.sesion, salir: () => acceso.salir() };
        },
      },
    ],
    loadChildren: () => import('./demo/rutas').then((m) => m.RUTAS_DEMO),
  },
];

/** Adónde llevan los accesos a la galería del inicio y la bienvenida. */
export const ENLACES_GALERIA: { readonly portada: string; readonly vitrina: string } | null = {
  portada: '/demo',
  vitrina: '/demo/vitrina',
};
