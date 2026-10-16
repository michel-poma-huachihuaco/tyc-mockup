/**
 * Reglas de navegación sin Angular ni DOM: se prueban con `npm test` (pruebas/).
 */

/**
 * Pantalla de ingreso. Con el modo demo es el Login Form de la aplicación; con el emisor
 * real, esta ruta solo redirige al emisor (Authorization Code con PKCE).
 */
export const RUTA_INGRESO = '/ingresar';

/**
 * El destino al que volver tras iniciar sesión, solo si es una ruta de este sitio.
 * `?destino=` llega en la URL y lo puede escribir cualquiera: aceptar uno absoluto
 * (`https://otro.example`) o sin esquema (`//otro.example`, `/\otro.example`) haría del
 * login una redirección abierta. Cualquier otra cosa vuelve al inicio.
 */
export function destinoSeguro(destino: string | null | undefined): string {
  if (!destino || !destino.startsWith('/') || destino.startsWith('//') || destino.includes('\\')) {
    return '/';
  }
  return destino;
}

/** La pantalla de ingreso, con el destino al que volver si no es el inicio. */
export function rutaIngreso(destino: string): string {
  const seguro = destinoSeguro(destino);
  return seguro === '/' ? RUTA_INGRESO : `${RUTA_INGRESO}?destino=${encodeURIComponent(seguro)}`;
}

/**
 * `true` si la URL es la de plantilla que deja `aybar-front init`: el host centinela
 * `aybar.local` no resuelve, así que no hay backend que llamar. Una ruta del mismo origen
 * (`/api`) sí cuenta como backend.
 */
export function esUrlDePlantilla(url: string): boolean {
  try {
    const { hostname } = new URL(url, 'http://localhost');
    return hostname === 'aybar.local' || hostname.endsWith('.aybar.local');
  } catch {
    return true;
  }
}
