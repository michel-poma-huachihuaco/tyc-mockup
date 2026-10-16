import { inject } from '@angular/core';
import { Router } from '@angular/router';
import type { CanActivateFn, CanMatchFn } from '@angular/router';
import { Acceso } from './acceso';
import { destinoSeguro, rutaIngreso } from './rutas';

/**
 * Guardas funcionales sobre la sesión de `Acceso`.
 *
 * `/` tiene dos rutas: el inicio, que solo coincide con sesión (`conSesion`), y la
 * bienvenida pública, que es la siguiente. Cambiar de sesión no vuelve a evaluar la ruta
 * por sí solo: quien abre o cierra la sesión navega (ver Ingreso y Marco).
 */
export const conSesion: CanMatchFn = () => inject(Acceso).sesion() !== null;

/** Lo que solo se ve con sesión: sin ella, al ingreso, con la vuelta en `?destino=`. */
export const requiereSesion: CanActivateFn = (_ruta, estado) =>
  inject(Acceso).sesion() !== null || inject(Router).parseUrl(rutaIngreso(estado.url));

/** /ingresar con la sesión ya abierta no tiene nada que hacer: vuelve al destino. */
export const sinSesion: CanActivateFn = (ruta) =>
  inject(Acceso).sesion() === null || inject(Router).parseUrl(destinoSeguro(ruta.queryParamMap.get('destino')));
