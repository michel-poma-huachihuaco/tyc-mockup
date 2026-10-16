---
name: aybar-auth-spa
description: Sesión de usuario en el frontend con @aybarcorp/auth — OIDC Authorization Code + PKCE S256 contra el emisor que fija el ADR del proyecto, token en memoria, claims configurables con los mismos nombres que el backend, audiencia, quién es dueño de la sesión (shell o app, nunca un remoto) y el CORS que el backend tiene que abrir (aybar.security.cors.*). Usar al configurar el login de un front, al leer roles o empresa en una pantalla, ante un 401 o un error de CORS desde el navegador, o cuando aparezcan crearAutenticacion, crearAutenticacionDemo (login demo local, sin token), ProveedorAutenticacion, useSesion, redirect_uri o PKCE.
---

# Autenticación en el SPA

El front no valida tokens ni tiene login propio: delega en el emisor OIDC que
decide el ADR del proyecto (`docs/adr/`). El SDK es neutral de emisor y no trae
emisor local (el de la plataforma será `access-control-service`, que todavía no
existe): en local se entra con el login demo (abajo). Lo que el front hace
lo trae `@aybarcorp/auth`: **no se reimplementa** (ni PKCE, ni discovery, ni
renovación, ni lectura de claims).

## Quién es dueño de la sesión

- **Papel `app` o `shell`**: crea la sesión con `@aybarcorp/auth`, una sola instancia por aplicación.
- **Papel `remoto`**: nunca. Recibe la `Sesion` del anfitrión en su contexto (`useAnfitrion().sesion` en React, `inyectarAnfitrion().sesion` en Angular) y pide el token con `sesion.obtenerToken()`. El hook de arquitectura corta un `import '@aybarcorp/auth'` en un remoto.
- Un remoto con `publico: true` en `remotos.json` se monta sin sesión; por defecto, el shell exige sesión y los `roles` de su entrada.

## Configuración

```ts
import { crearAutenticacion } from '@aybarcorp/auth'

export const auth = crearAutenticacion({
  emisor: entorno.emisor,                       // issuer exacto; se descubre su .well-known/openid-configuration
  clienteId: entorno.clienteId,                 // cliente PÚBLICO, sin secreto
  redirectUri: `${location.origin}/`,           // registrada tal cual en el emisor
  postLogoutRedirectUri: `${location.origin}/`,
  audiencia: entorno.audiencia,                 // la que exige el backend (la fija el ADR)
  // alcance: 'openid profile' (por defecto). claims: solo si el ADR cambia los nombres.
})
await auth.iniciar()                            // completa el retorno del emisor o recupera la sesión
```

- React: `ProveedorAutenticacion` (con `cargando` y `fallo`) y `useSesion()` / `useAutenticacion()` de `@aybarcorp/auth/react`. Angular: el shell pasa `sesion: () => auth.sesion()` a `proveerShellAybar`.
- `emisor`, `clienteId` y `audiencia` vienen de configuración de entorno, nunca escritos para un entorno real en el código. Ninguno es secreto, pero un `clienteSecret` en el front sí sería un error: un SPA es cliente público.
- Cliente, audiencia y claims del emisor los fija el ADR del proyecto; el SDK no trae ningún cliente registrado.

## Local: login demo, sin token

- Sin emisor en local, las plantillas usan `crearAutenticacionDemo` de `@aybarcorp/auth`: el Login Form de la aplicación compara usuario y clave de prueba en el navegador. Misma interfaz que `crearAutenticacion`: el resto de la aplicación no cambia.
- Solo en desarrollo y solo en localhost (fuera de él falla con `demo-fuera-de-local`). Los usuarios de prueba van en `.env.development` (React, `VITE_AYBAR_DEMO_USUARIOS=usuario:clave:Nombre:ROL1,ROL2;…`; las sueltas `VITE_AYBAR_DEMO_USUARIO`/`_CLAVE`/`_NOMBRE`/`_ROLES` siguen valiendo para uno solo) o en `src/environments/environment.development.ts` (Angular, `demo`, uno o una lista); ninguno entra al build de producción. Las plantillas traen `admin`/`demo-admin` (ADMIN, USER) y `usuario`/`demo-usuario` (USER). Nunca una credencial real.
- La sesión demo **no tiene token** (`obtenerToken()` falla con `sin-token-demo`): el backend protegido responde 401 y la sección Backend del inicio lo explica. No es un error que haya que arreglar en el backend.
- Pasar al emisor real: React comenta `VITE_AYBAR_DEMO_USUARIOS` (y las sueltas, si las hay) y define `VITE_AYBAR_EMISOR`, `VITE_AYBAR_CLIENTE_ID` y `VITE_AYBAR_AUDIENCIA`; Angular pone `demo: null` y rellena `autenticacion.{emisor, clienteId, audiencia}`. Los valores los fija el ADR del proyecto, y el backend necesita `AYBAR_ISSUER_URI` con el mismo emisor.

## Token: en memoria

- `almacenamiento: 'memoria'` (por defecto): el token vive en la instancia; recargar la página vuelve al emisor sin pedir credenciales si su sesión sigue viva.
- `'sesion'` (sessionStorage) solo si el ADR lo justifica y el origen tiene una CSP estricta: cualquier XSS lo lee.
- **Nunca** `localStorage`, cookies escritas desde JS, la URL, logs ni el bus. `obtenerToken()` renueva solo si vence en menos de 30 s: no guardes el token en una variable para reusarlo.

## Claims: los mismos nombres que el backend

| Campo | Por defecto | Propiedad del backend |
|---|---|---|
| `usuario` | `user_account_id` | `aybar.security.claims.usuario` |
| `nombreUsuario` | `preferred_username` | `aybar.security.claims.nombre-usuario` |
| `empresa` | `companyId` | `aybar.security.claims.empresa` |
| `roles` | `realm_access.roles` | `aybar.security.claims.roles` |
| `rolesPorEmpresa` | `company_roles` | `aybar.security.claims.roles-por-empresa` |
| `sesion` | `sid` | `aybar.security.claims.sesion` |

Un nombre con puntos es una ruta anidada; solo uno con `/` o `:` (p. ej. un
claim con URL de namespace) se lee literal. Si el ADR cambia un nombre, se
cambia **en los dos lados** con el mismo valor: un front que lee un claim que el
backend no lee muestra permisos que la API va a negar.

En la pantalla: `sesion.tieneRol(...)`, `sesion.empresaId`,
`sesion.rolesPorEmpresa`, `sesion.atributos`. Ocultar un botón por rol es
comodidad, no seguridad: la autorización la decide el backend
(`@PreAuthorize`) y el front muestra el estado **sin permisos** cuando responde
403 (skill `aybar-contrato-api-cliente`).

## Audiencia y CORS en el backend

- El access token tiene que traer la audiencia del API. Con `audiencia`, `@aybarcorp/auth` no abre sesión si no la trae; el backend la valida con `spring.security.oauth2.resourceserver.jwt.audiences` (`AYBAR_JWT_AUDIENCE`), que el starter exige siempre fuera de los perfiles `local` y `test`: sin ella el servicio no arranca. Front y backend, la misma audiencia.
- Front y API en orígenes distintos: el backend abre CORS con `aybar.security.cors.origenes-permitidos` (variable `AYBAR_CORS_ORIGENES`, orígenes exactos, sin comodines; vacía = CORS apagado). Por defecto ya permite `Authorization`, `Content-Type`, `X-Correlation-Id`, `Accept-Language` y expone `X-Correlation-Id`. Ajustes: `aybar.security.cors.metodos`, `cabeceras-permitidas`, `cabeceras-expuestas`, `max-age`. Contrato: `docs/skills/aybar-starter-security.md`.
- Mismo origen (el nginx del front hace de proxy de `/api`): no hace falta CORS.
- Un error de CORS se arregla en la configuración del backend, nunca con un proxy improvisado ni desactivando la verificación en el navegador.

## Pruebas

Sin emisor real: `crearAutenticacion` acepta un `entorno` simulado, y una
`Sesion` de prueba (usuario y roles sintéticos, `obtenerToken` que devuelve un
valor falso armado en el test) basta para las pantallas. Nunca un token copiado
de un entorno real en un test, un fixture o un prompt.
