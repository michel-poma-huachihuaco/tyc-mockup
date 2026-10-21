/**
 * Soporte de las pruebas de la galería (no es una prueba: no termina en .test.ts).
 *
 * El código de src/app/demo/ importa sin extensión ('./semilla'), como pide Angular, y Node
 * no resuelve eso solo. Este gancho prueba `.ts` e `/index.ts` cuando la resolución normal
 * falla. Se registra al importar este archivo: las pruebas cargan después el código de la
 * galería con `await import()`, que ya pasa por el gancho.
 *
 * `npm run demo:quitar` lo borra con el resto de pruebas/demo-*.
 */
import { registerHooks } from 'node:module';

registerHooks({
  resolve(especificador, contexto, siguiente) {
    try {
      return siguiente(especificador, contexto);
    } catch (error) {
      if (especificador.startsWith('.') && !/\.[cm]?[jt]s(\?.*)?$/.test(especificador)) {
        for (const extension of ['.ts', '/index.ts']) {
          try {
            return siguiente(`${especificador}${extension}`, contexto);
          } catch {
            // la siguiente
          }
        }
      }
      throw error;
    }
  },
});
