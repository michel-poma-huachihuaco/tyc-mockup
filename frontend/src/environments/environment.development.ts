/**
 * Entorno de desarrollo: `ng serve` (y `ng build --configuration development`) usan este
 * archivo en lugar de environment.ts, por el `fileReplacements` de angular.json. Repite la
 * sección `aybar` entera; el build de producción no lo lee.
 *
 * Modo demo: con `demo` definido, el inicio de sesión es simulado —el Login Form de la
 * aplicación compara usuario y contraseña en el navegador, sin emisor OIDC y sin token— y
 * solo se abre en localhost. `demo` admite un usuario o una lista; nombre y roles son
 * opcionales (sin roles, USER). Las claves son de demo a propósito: viajan al navegador, así
 * que no son seguridad, solo valen en localhost y nunca entran al bundle de producción
 * (environment.ts trae `demo: null`). No pongas una real.
 *
 * Para pasar al emisor real: `demo: null` y el emisor, el cliente y la audiencia del ADR
 * del proyecto en `autenticacion` (README.md, «Pasar al emisor real»).
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
      // El backend de este repositorio en local (aybar run).
      baseUrl: 'http://localhost:8081',
    },
    demo: [
      { usuario: 'admin', clave: 'demo-admin', nombre: 'Administrador Aybar', roles: ['ADMIN', 'USER'] },
      { usuario: 'usuario', clave: 'demo-usuario', nombre: 'Usuario Aybar', roles: ['USER'] },
    ],
  },
};
