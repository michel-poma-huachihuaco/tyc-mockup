import { InjectionToken, makeEnvironmentProviders, provideAppInitializer, signal } from '@angular/core';
import type { EnvironmentProviders, Signal } from '@angular/core';
import { crearAutenticacion, crearAutenticacionDemo, entornoNavegador } from '@aybarcorp/auth';
import type { EntornoNavegador, UsuarioDemo } from '@aybarcorp/auth';
import { environment } from '../../environments/environment';

const { autenticacion: config, demo } = environment.aybar;

/**
 * Los usuarios del modo demo. `demo` admite uno solo o una lista; el que no trae usuario o
 * clave se descarta con un aviso en la consola —nunca con la clave—, en lugar de que
 * crearAutenticacionDemo lance y la aplicación no cargue.
 */
function usuariosDemo(valor: UsuarioDemo | UsuarioDemo[] | null | undefined): UsuarioDemo[] {
  const lista = valor ? (Array.isArray(valor) ? valor : [valor]) : [];
  return lista.filter((usuario, i) => {
    const valido = Boolean(usuario?.usuario?.trim() && usuario.clave);
    if (!valido) {
      console.warn(`[aybar] modo demo · environment.aybar.demo[${i}] no tiene usuario o clave; se ignora.`);
    }
    return valido;
  });
}

const usuarios = usuariosDemo(demo);

/**
 * Adaptador de entorno para `crearAutenticacionDemo` en desarrollo o prototipo estático,
 * que permite compartir el servidor por túnel (DevTunnels, ngrok, Cloudflare Tunnel) o
 * desplegar el prototipo en GitHub Pages manteniendo la navegación en el origen y baseHref actuales.
 */
function entornoDemoDesarrollo(): EntornoNavegador {
  const base = entornoNavegador();
  return {
    ...base,
    url: () => {
      const actual = new URL(base.url());
      actual.hostname = 'localhost';
      return actual.toString();
    },
    redirigir: (destino: string) => {
      const u = new URL(destino, window.location.origin);
      const baseHref = typeof document !== 'undefined' ? new URL(document.baseURI).pathname.replace(/\/$/, '') : '';
      const ruta = baseHref && !u.pathname.startsWith(`${baseHref}/`) ? `${baseHref}${u.pathname}` : u.pathname;
      base.redirigir(`${window.location.origin}${ruta}${u.search}${u.hash}`);
    },
  };
}

/**
 * La autenticación simulada del modo demo, o `null` con el emisor real.
 *
 * Solo existe en desarrollo (`isDevMode()`) y con usuarios en
 * environment.development.ts: la pantalla de login es el Login Form de la propia
 * aplicación, que llama a `ingresar(usuario, clave)` en la ruta `rutaLogin`. La sesión no
 * tiene token —un backend protegido responde 401—. En el build de producción
 * environment.ts trae `demo: null` y esto es `null`.
 */
export const autenticacionDemo =
  usuarios.length > 0 ? crearAutenticacionDemo({ usuarios, entorno: entornoDemoDesarrollo() }) : null;

/**
 * La autenticación de la aplicación: OIDC Authorization Code con PKCE contra el emisor de
 * environment.ts, o la del modo demo, que tiene la misma interfaz —el resto de la
 * aplicación no sabe cuál de las dos tiene detrás—. El token vive en memoria y se renueva
 * solo; se pide con `sesion()?.obtenerToken()`, nunca se guarda.
 *
 * Es un valor del módulo, y no algo que se construya dentro de Angular, porque también la
 * necesita lo que se configura fuera de un contexto de inyección —la sesión que el shell
 * entrega a los remotos—. Dentro de los componentes se usa `inject(AUTENTICACION)`.
 */
export const autenticacion =
  autenticacionDemo ??
  crearAutenticacion({
    emisor: config.emisor,
    clienteId: config.clienteId,
    audiencia: config.audiencia,
    alcance: config.alcance,
    redirectUri: `${window.location.origin}/`,
    postLogoutRedirectUri: `${window.location.origin}/`,
  });

/** La autenticación, tal como la devuelve `crearAutenticacion` o `crearAutenticacionDemo`. */
export type AutenticacionAybar = typeof autenticacion;

/** `inject(AUTENTICACION)`: `sesion()`, `entrar()`, `salir()`, `alCambiar()`. */
export const AUTENTICACION = new InjectionToken<AutenticacionAybar>('aybar.autenticacion');

/** `inject(AUTENTICACION_DEMO)`: la del modo demo —`ingresar()`, `rutaLogin`— o `null`. */
export const AUTENTICACION_DEMO = new InjectionToken<typeof autenticacionDemo>('aybar.autenticacion.demo');

/**
 * `inject(ERROR_AUTENTICACION)`: el error de `iniciar()` si falló —el emisor no responde,
 * el modo demo fuera de localhost—, o `null`. Para que la pantalla lo diga en vez de
 * quedarse sin sesión sin explicar por qué.
 */
export const ERROR_AUTENTICACION = new InjectionToken<Signal<unknown>>('aybar.autenticacion.error');

/**
 * `iniciar()` corre antes del primer render: completa el regreso del emisor si lo hay y
 * deja la sesión lista, así que ningún componente ve un estado intermedio.
 *
 * Si falla la aplicación arranca igual, sin sesión, y el error queda en
 * `ERROR_AUTENTICACION`: un inicializador que rechaza deja la página en blanco, y una
 * página en blanco no deja ni volver a intentar `entrar()`.
 */
export function proveerAutenticacionAybar(): EnvironmentProviders {
  const error = signal<unknown>(null);
  return makeEnvironmentProviders([
    { provide: AUTENTICACION, useValue: autenticacion },
    { provide: AUTENTICACION_DEMO, useValue: autenticacionDemo },
    { provide: ERROR_AUTENTICACION, useValue: error.asReadonly() },
    provideAppInitializer(() =>
      autenticacion.iniciar().then(
        () => undefined,
        (causa: unknown) => {
          error.set(causa);
          console.error('[aybar/auth] no se pudo iniciar la sesión', causa);
        },
      ),
    ),
  ]);
}
