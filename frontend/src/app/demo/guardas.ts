import { inject } from '@angular/core';
import { Router } from '@angular/router';
import type { CanActivateChildFn, CanMatchFn } from '@angular/router';
import { rutaIngreso } from '../rutas';
import { SESION_GALERIA } from './contexto';
import { SUBSECCIONES_ADMIN, SUBSECCIONES_CUENTA, varianteIngreso } from './navegacion';

/**
 * Las guardas de la galería. Todo /demo pide sesión menos el ingreso, que son maquetas;
 * sin ella, al ingreso real de la aplicación con la vuelta en `?destino=`. Lo que pide el
 * rol ADMIN no se guarda aquí: la pantalla de Administración pinta el 403 del framework,
 * que dice qué rol falta (la sesión existe; lo que falta es permiso).
 */
export const requiereSesionGaleria: CanActivateChildFn = (_ruta, estado) =>
  inject(SESION_GALERIA).sesion() !== null || inject(Router).parseUrl(rutaIngreso(estado.url));

/**
 * Un parámetro que no es de la lista no coincide: la URL cae en el comodín y se ve el 404
 * de la galería con sugerencias, en lugar de una pantalla vacía.
 */
const segmentoEn =
  (posicion: number, validos: (valor: string) => boolean): CanMatchFn =>
  (_ruta, segmentos) => {
    const valor = segmentos[posicion]?.path;
    return valor !== undefined && validos(valor);
  };

export const varianteConocida = segmentoEn(1, (id) => varianteIngreso(id) !== undefined);
export const subseccionDeCuenta = segmentoEn(1, (id) => SUBSECCIONES_CUENTA.some((s) => s.id === id));
export const subseccionDeAdmin = segmentoEn(1, (id) => SUBSECCIONES_ADMIN.some((s) => s.id === id));
/** `/vitrina/:familia/:componente/caso/:n`: `n`, un entero desde 1. */
export const casoNumerado = segmentoEn(4, (n) => /^[1-9]\d*$/.test(n));
