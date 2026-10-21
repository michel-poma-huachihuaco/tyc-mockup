import { InjectionToken, makeEnvironmentProviders } from '@angular/core';
import type { EnvironmentProviders } from '@angular/core';
import { crearClienteHttp } from '@aybarcorp/http';
import { environment } from '../../environments/environment';
import { autenticacion, autenticacionDemo } from './autenticacion';

/** El cliente HTTP del backend, tal como lo devuelve `crearClienteHttp`. */
export type ApiAybar = ReturnType<typeof crearClienteHttp>;

/**
 * Se inyecta con `inject(API)`. Envía el token de la sesión, un X-Correlation-Id por
 * solicitud y convierte los errores RFC 7807 del backend en ErrorAybar.
 *
 * Un 401 manda a iniciar sesión de nuevo, volviendo a la misma pantalla; con la sesión del
 * modo demo, no.
 */
export const API = new InjectionToken<ApiAybar>('aybar.api');

export function proveerApiAybar(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: API,
      useFactory: () => {
      return crearClienteHttp({
        baseUrl: environment.aybar.api.baseUrl,
        sesion: () => autenticacion.sesion(),
        // Con la sesión demo no hay token y el backend protegido responde 401 a todo:
        // volver al login sería un bucle. El 401 llega a la pantalla como ErrorAybar.
        alNoAutenticado: autenticacionDemo
          ? undefined
          : () => void autenticacion.entrar(window.location.pathname),
      });
      },
    },
  ]);
}
