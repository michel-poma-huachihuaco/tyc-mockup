# tyc - frontend

Frontend **React 19 + Vite 8 + TypeScript** de `tyc`, generado con el
Aybar SDK `0.7.1` sobre el framework `@aybarcorp/*` `0.3.0`.
Vive en `frontend/` del repositorio; el contexto completo (reglas, gates,
guardianes) esta en el `AGENTS.md` de la raiz.

**Papel: app.** Aplicacion autonoma, sin federacion: consume el sistema de
diseño y, si la necesita, gestiona su propia sesion con `@aybarcorp/auth`.

## Comandos

```bash
npm install          # la primera vez, sin credenciales (o: aybar install desde la raiz)
npm run dev          # http://localhost:5173 (o: aybar run --frontend desde la raiz)
npm run build        # tsc -b + vite build -> dist/
npm test             # pruebas de pruebas/ con el runner de Node, sin dependencias
npm run lint         # oxlint
npm run preview      # sirve dist/ en http://localhost:5173
```

El puerto es fijo (`strictPort`): el CORS del backend en local autoriza
`http://localhost:5173` y ningun otro (y el redirect URI que registre
el emisor real, el mismo).

## Entrar en local (modo demo)

`npm run dev` arranca con una bienvenida publica y el boton **Ingresar**, que
lleva al Login Form del sistema de diseño (`/ingresar`). En local no hace falta
emisor OIDC: entra con uno de estos usuarios de prueba (la pantalla de ingreso
los muestra mientras corre `npm run dev`). Las claves son de demo a proposito:
solo valen en localhost.

| Usuario | Contraseña | Nombre | Roles |
|---|---|---|---|
| `admin` | `demo-admin` | Administrador Aybar | `ADMIN`, `USER` |
| `usuario` | `demo-usuario` | Usuario Aybar | `USER` |

Con la sesion abierta, `/` muestra la Navbar con el selector de tema y el menu
de la cuenta (nombre, roles y **Salir**), un aviso de *sesion demo* (en el celular, una linea
con **Mas**), la tarjeta de la sesion y la seccion **Backend** (llama a
`GET /recursos-ejemplo/quien-soy` si el proyecto tiene backend).

Que es y que no es el modo demo:

- Los usuarios salen de `.env.development` (`VITE_AYBAR_DEMO_USUARIOS`). Vite solo
  carga ese archivo con `npm run dev`, y el codigo solo lo lee con
  `import.meta.env.DEV`: **el build de produccion no contiene las claves**
  (`grep -r demo-admin dist/` no encuentra nada). Ponlos siempre ahi: `.env` y
  `.env.local` tambien entran al build.
- La contraseña se compara en el navegador. No es seguridad: es una credencial
  de prueba. La sesion demo **solo se abre en localhost** (`demo-fuera-de-local`
  en cualquier otro host) y **no tiene access token**: el backend protegido
  responde 401, la seccion Backend lo dice, y el cliente HTTP no te devuelve al
  login (seria un bucle).
- El `.gitignore` de la raiz ignora `.env.*`: `.env.development` no se commitea.
  Quien clone el repositorio y quiera el modo demo lo crea con una linea:

  ```
  VITE_AYBAR_DEMO_USUARIOS=admin:demo-admin:Administrador Aybar:ADMIN,USER;usuario:demo-usuario:Usuario Aybar:USER
  ```

  Cada usuario es `usuario:clave:Nombre:ROL1,ROL2` (nombre y roles opcionales;
  sin roles, `USER`), separados por `;`. Las variables de un solo usuario
  (`VITE_AYBAR_DEMO_USUARIO`, `_CLAVE`, `_NOMBRE` y `_ROLES`) siguen valiendo
  cuando no esta `VITE_AYBAR_DEMO_USUARIOS`.

<!-- aybar:demo:inicio -->
## Galeria de demostracion

Solo con `npm run dev`, `/demo` es una galeria de lo que se puede construir con el
sistema de diseño, con datos sinteticos y sin llamar a ningun backend. El inicio
con sesion trae una tarjeta que lleva a ella, y **Ver la vitrina** de la bienvenida
abre la vitrina. No existe en el build de produccion: se monta con un `import()`
detras de `import.meta.env.DEV` en `src/App.tsx`, y `vite.config.ts` trae una
guarda: si un modulo de `src/demo/` (o `three` o `axe-core`, que solo usa la
galeria) llega al bundle, `npm run build` falla.

| Ruta | Que hay |
|---|---|
| `/demo` | Portada: profundidad, combinaciones de color y un acceso por seccion |
| `/demo/vitrina` | Cada componente de `@aybarcorp/ui` con su URL (`/demo/vitrina/data/data-grid`), sus casos, su codigo con **Copiar** y su tabla de props, salidos del catalogo instalado (`@aybarcorp/ui/ejemplos` y `/props`) |
| `/demo/ingreso` | Once pantallas de acceso distintas, publicas y a pantalla completa (ninguna inicia sesion) |
| `/demo/cuenta` | Perfil, preferencias, notificaciones, seguridad (doble factor) y sesiones |
| `/demo/admin` | Solo con el rol `ADMIN`: resumen, usuarios (Data Grid, Splitter, Drawer), roles (Tree View) y auditoria (Timeline) |
| `/demo/personalizacion` | El Appearance Panel con la vista previa en claro y oscuro lado a lado |
| `/demo/profundidad` | Tilt, Parallax y vidrio, y cuando se apagan |
| `/demo/3d`, `/demo/redimensionado`, `/demo/accesibilidad` | Visor 3D de lotes, Splitter y anchos de pantalla, y analisis con axe-core |

- **Ctrl K** (Cmd K) busca pantallas, componentes y casos, tambien en español
  («tabla», «fecha», «aviso»). **Personalizar**, en la barra, abre el panel de
  apariencia y sigue abierto al navegar.
- Entra con los usuarios demo de arriba: `admin` lo ve todo; `usuario` no ve la
  administracion. **Ver como** (en la barra, o en el menu de la cuenta en pantallas
  estrechas) baja los roles de `admin` a los de un usuario solo dentro de la
  galeria; nunca los sube. Se recuerda en la pestaña (`sessionStorage`).
- `?embebido=1` en cualquier ruta oculta el marco de la galeria.
- Los datos (`src/demo/datos/`) salen de generadores con semilla fija: personas,
  lotes y auditoria sinteticos, correos `@ejemplo.test` e IP de documentacion
  (RFC 5737). Lo que se cambia en la galeria vive en memoria.

Para quitarla del proyecto cuando ya no haga falta:

```bash
npm run demo:quitar            # pide confirmacion; sale con error si hay cambios sin commitear
npm run demo:quitar -- --si    # sin preguntar
```

Borra `src/demo/`, las pruebas `pruebas/demo-*`, las regiones marcadas
`aybar:demo` del codigo y de este README, el script `demo:quitar` y las
dependencias que solo usa la galeria; despues, `npm run build`, `lint` y `test`
siguen en verde.
<!-- aybar:demo:fin -->

## Tema

El selector de tema (en la bienvenida y en la Navbar) ofrece **Claro**, **Oscuro** y **Segun el sistema**. Lo
elegido se recuerda en este navegador (`localStorage`, clave `aybar:apariencia`,
del nucleo de apariencia de `@aybarcorp/tokens`) y llega a las demas pestañas;
**Segun el sistema** lo olvida y la pagina vuelve a seguir a
`prefers-color-scheme`. Todos los selectores leen el mismo estado: siempre dicen
lo mismo.

Para que al recargar no destelle el tema por defecto, `index.html` carga en el
`<head>` `/aybar-apariencia.js`, el arranque de
`@aybarcorp/tokens/apariencia/arranque`, que aplica lo recordado antes del primer
pintado. `vite.config.ts` lo sirve en `npm run dev` y lo copia a `dist/` desde el
paquete instalado. Es del mismo origen: la CSP de `nginx.conf` lo admite con
`script-src 'self'`.

## Pasar al emisor real

1. En `.env.development`, comenta (o borra) `VITE_AYBAR_DEMO_USUARIOS` (y las
   variables sueltas de un solo usuario, si las tienes): sin usuarios demo, la
   aplicacion usa `crearAutenticacion` (OIDC Authorization Code con PKCE) y
   `/ingresar` redirige al emisor.
2. Define el emisor y el cliente (en `.env.development.local` para
   local, en el entorno del build para cada ambiente):
   `VITE_AYBAR_EMISOR`, `VITE_AYBAR_CLIENTE_ID`, `VITE_AYBAR_AUDIENCIA`. El
   emisor de cada ambiente lo decide el ADR del servicio; el SDK no trae ninguno
   en local.
3. `VITE_AYBAR_API_URL` apunta al backend. Con el token real, la seccion
   Backend muestra lo que el backend leyo del JWT.

La pantalla de inicio es de partida: sustituye `src/pantallas/Inicio.tsx`
por tus pantallas cuando llegue la primera historia. La sesion (`src/aybar/`) y
el ruteo minimo (`src/navegacion.ts`) se quedan.

## El framework @aybarcorp

`aybar new project` cablea el framework con su CLI (`aybar-front init`), en la
version que fija el SDK, y deja en `paquetes/` los `.tgz` de los `@aybarcorp/*`
que usa este proyecto. `package.json` los toma de ahi
(`"@aybarcorp/ui": "file:paquetes/aybarcorp-ui-0.3.0.tgz"`) y el
lockfile fija su integridad. Desde la raiz o desde `frontend/`:

```bash
aybar framework                       # version que fija el SDK, las descargadas y la de este proyecto
aybar framework cli doctor            # doctor del framework: sale con 1 si hay errores
aybar framework cli -- doctor --json  # las opciones de aybar-front van despues de --
aybar framework actualizar            # lleva el proyecto a la version que fija el SDK
```

`aybar framework cli <args>` corre `aybar-front` en `frontend/` sin `npx` ni
tokens.

- `paquetes/` **se commitea** (unos 1.3 MB en una app React). Por eso `npm ci`,
  `npm install`, `aybar install`, la imagen Docker y el CI instalan sin ninguna
  credencial: no hablan con GitHub Packages.
- Los `.tgz` salen del release del framework en GitHub, que la CLI `aybar`
  descarga una vez por version con tu sesion de `gh` y verifica (SHA-512). Basta
  con acceso de lectura al repositorio del framework.
- `.npmrc` solo apunta el scope `@aybarcorp` a GitHub Packages. No es para
  instalar: es para que un `npm install @aybarcorp/x` por nombre falle a la vista
  (GitHub Packages lo rechaza sin token) en vez de resolverse en npmjs.org, donde
  cualquiera podria publicar un `@aybarcorp/x`. Para cambiar de version, `aybar
  framework actualizar`: cambia `paquetes/`, `package.json` y el lockfile juntos.
- Versiones exactas (`save-exact`): todos los `@aybarcorp/*` en la misma version.
- Sistema de diseño: `@aybarcorp/ui` y los tokens `--aybar-*`. No escribas
  colores ni medidas sueltas.
- Sesion: `@aybarcorp/auth` (OIDC Authorization Code + PKCE contra el emisor
  que decide el ADR del proyecto; token solo en memoria). En un remoto, la
  sesion llega del anfitrion.
- APIs: `@aybarcorp/http` (Bearer, `X-Correlation-Id`, errores RFC 7807 como
  `ErrorAybar`). Las llamadas van en servicios (`src/api/`), no en componentes:
  un `fetch` o un `axios` dentro de un componente lo corta el guardian de
  arquitectura (`.guardianes/agente/guardian-arquitectura.sh`).

## Reglas que vigilan los guardianes

- El codigo de `frontend/` no importa nada de fuera de `frontend/`.
- Ningun modulo se importa por URL: los remotos se montan por el registro del shell.
- En una rama `feature/<TICKET>-*`, `frontend/src/`, `package.json`, el
  lockfile y la configuracion de build son codigo: esperan al G4 aprobado
  (y al G2 si la feature tiene pantallas).
- Ni secretos ni datos reales: una variable `VITE_*` termina en el bundle que
  descarga cualquiera, asi que en el front no hay secretos.

## Docker

```bash
docker build -t tyc-frontend .
docker run --rm -p 8080:8080 tyc-frontend
```

La imagen copia `paquetes/` antes de `npm ci`, asi que el build no necesita
ningun secreto ni credencial. Build con Node 22 y servido por nginx sin root (puerto 8080), con fallback de
SPA y cabeceras de seguridad basicas. La CSP va comentada en `nginx.conf` con
lo que hay que decidir antes de activarla.

## Avisos de terceros

La aplicacion sirve, sin modificarlas, dos tipografias con licencia SIL Open
Font License 1.1 (OFL-1.1), solo el subconjunto latin:

- **Figtree** 400-700 (`@fontsource/figtree`), para el cuerpo.
- **Montserrat** 600-800 (`@fontsource/montserrat`), para los titulos.

Las importa `src/fuentes.css` y Vite las copia a `dist/` con el resto del
build: ninguna peticion a un CDN de fuentes. Como `package.json` declara
`@fontsource/*`, `aybar-front init` tampoco agrega la hoja de fuentes por CDN de
`@aybarcorp/tokens`. El texto de cada licencia viaja en
`node_modules/@fontsource/<familia>/LICENSE`.
