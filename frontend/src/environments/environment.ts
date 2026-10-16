/**
 * Entorno de producción: es el que entra en `ng build`. La sección `aybar` la generó
 * `aybar-front init` desde aybar.config.json; los valores con aybar.local son de
 * plantilla y no resuelven. El emisor lo decide el ADR del servicio: el framework no trae
 * ninguno cableado.
 *
 * Para valores distintos en desarrollo, `ng generate environments` crea
 * environments/environment.development.ts y el `fileReplacements` de la
 * configuración development de angular.json: `ng serve` usa ese archivo en lugar de este,
 * entero, así que repite la sección `aybar` completa. Es el único sitio donde pueden ir
 * los usuarios del modo demo.
 */
export const environment = {
  aybar: {
    autenticacion: {
      emisor: 'https://emisor.aybar.local',
      clienteId: 'aybar-web',
      audiencia: 'aybar-api',
      alcance: 'openid profile',
    },
    api: {
      baseUrl: 'https://api.aybar.local',
    },
    /**
     * Usuarios de prueba del modo demo —inicio de sesión simulado con el Login Form de la
     * aplicación, sin emisor ni token, solo en desarrollo y en localhost—, o `null`. Uno
     * solo o una lista, cada uno con usuario y clave no vacíos. Aquí siempre `null`: este
     * archivo entra en el build de producción y la clave viajaría en el bundle. Se define en
     * environments/environment.development.ts.
     */
    demo: null as
      | { usuario: string; clave: string; nombre?: string; roles?: string[] }
      | { usuario: string; clave: string; nombre?: string; roles?: string[] }[]
      | null,
  },
};
