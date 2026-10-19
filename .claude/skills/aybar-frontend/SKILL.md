---
name: aybar-frontend
description: Cómo se usa el framework de front de Aybar (@aybarcorp/*) en frontend/ del repositorio — papeles shell, remoto y app, React+Vite, Angular y Next.js, tokens y componentes, federación por import map, módulos compartidos, de dónde salen los paquetes (frontend/paquetes/, sin token), aybar framework, aybar-front doctor y qué no se reimplementa (sesión, cliente HTTP, errores). Usar al crear o tocar una pantalla, un shell o un remoto, al ver frontend/, frontend/paquetes/, aybar.config.json, remotos.json, @aybarcorp/*, aybar-front o aybar framework, antes de añadir una dependencia de front o de cambiar la versión del framework, o ante un 401/E401 de npm con @aybarcorp/*, NODE_AUTH_TOKEN o GitHub Packages.
---

# Frontend con el framework Aybar

El front de un proyecto vive **siempre** en `frontend/` del mismo repositorio
(monorepo): el backend, si lo hay, sigue en la raíz con su reactor Maven. Lo
genera `aybar new project <nombre> --frontend [--ui react|angular] [--papel shell|remoto|app]`
(con `--backend` además, los dos). Antes de dar por existente una pieza de esta
skill en tu proyecto: skill `aybar-estado-del-sdk`.

## Papeles

| Papel | Qué es | UI soportadas |
|---|---|---|
| `app` | Aplicación sin federación: usa diseño, sesión y cliente HTTP | React+Vite, Angular, Next.js |
| `shell` | Anfitrión: dueño de la sesión, el ruteo y el registro de remotos | React+Vite, Angular |
| `remoto` | Micro frontend que el shell monta bajo un prefijo de ruta | React+Vite, Angular |

- `--ui react` (por defecto) o `angular`. Next.js no tiene plantilla en el SDK: se crea el proyecto Next en `frontend/` y se cablea con `aybar-front init --papel app`. Hasta 0.4.x eso era `npx @aybarcorp/cli init`, que baja la CLI de GitHub Packages y necesita token; el SDK no tiene todavía un camino verificado sin token para Next: pregunta al equipo del SDK antes de improvisarlo. Next como shell o remoto no está soportado.
- El papel queda en `.aybar/proyecto.properties` (`papel=`) y en `frontend/aybar.config.json`. No se cambia a mano: cambiar de papel es una decisión de arquitectura (G3).
- Puertos locales: React 5173, Angular 4200. El backend usa 8081 y deja libre el 8080, donde escucha el contenedor del front generado (nginx sin root) y el puerto por defecto de muchas herramientas locales.
- En local no hay emisor OIDC: el front entra con el login demo (`crearAutenticacionDemo`, sin token, solo en localhost) y el backend protegido le responde 401. Pasar al emisor real y la configuración de sesión: skill `aybar-auth-spa`.

## Paquetes

| Paquete | Para qué |
|---|---|
| `@aybarcorp/tokens` | Colores, tipografía, espaciado, `breakpoint` (sm 640 a 2xl 1536) y pares de contraste verificados (`@aybarcorp/tokens/contraste`) |
| `@aybarcorp/ui` | Componentes React del Aybar Design System V1, en 14 familias (Foundations, Layout, Actions, Form Architecture, Form Controls, Form Pickers, Surfaces, Data, Feedback, Overlays, Navigation, Media, Specialized y Errors) |
| `@aybarcorp/ui-angular` | Los mismos como componentes Angular standalone `<ay-*>` (misma hoja `ui.css`), importados donde se usan; `<ay-vitrina />` los muestra todos. Es lo que instala `aybar-front init` en Angular |
| `@aybarcorp/ui-elements` | Los de `@aybarcorp/ui` como custom elements (`ay-button`, `ay-alert`...) para un host sin React ni Angular nativo: `definirElementos()` |
| `@aybarcorp/core` | Contratos: `Sesion`, `Ruta`, `Bus`, `ContextoAnfitrion`, `EntradaRegistro` |
| `@aybarcorp/shell` | Anfitrión. React: `@aybarcorp/shell/react` (`ProveedorShell`, `PuntoDeMontaje`). Angular: `@aybarcorp/shell/angular` (`proveerShellAybar(config)` en los providers y `<ay-punto-montaje>` con `CUSTOM_ELEMENTS_SCHEMA`). Otro host: `definirShellElementos(opciones)` |
| `@aybarcorp/remote` | Remoto. React: `remotoReact(...)` y `useAnfitrion`/`useRuta`/`useTema`. Angular: `remotoAngular({ nombre, componente, proveedores? })` e `inyectarAnfitrion()` |
| `@aybarcorp/auth` | Sesión OIDC (Authorization Code + PKCE) en el navegador: skill `aybar-auth-spa` |
| `@aybarcorp/http` | Cliente del backend con Bearer, `X-Correlation-Id` y RFC 7807 → `ErrorAybar`: skill `aybar-contrato-api-cliente` |
| `@aybarcorp/cli` | Binario `aybar-front`: `init`, `add remoto`, `doctor`, `compartidos construir`. Se corre con `aybar framework cli <args>` |

Todos los `@aybarcorp/*` comparten versión (lockstep) y la fija el SDK
(`framework.version` del manifiesto). No subas uno solo: se cambia el framework
entero con `aybar framework actualizar`.

## De dónde salen los paquetes (sin token, desde el SDK 0.5.0)

- Los `@aybarcorp/*` del proyecto están en `frontend/paquetes/`, que **se commitea**: `package.json` los toma con `file:` (`"@aybarcorp/ui": "file:paquetes/aybarcorp-ui-0.2.0.tgz"`) y el lockfile fija su integridad. Por eso `npm ci`, `npm install`, `aybar install`/`run`/`build`/`test`, la imagen Docker y el CI instalan **sin ninguna credencial**. No pidas ni exportes `NODE_AUTH_TOKEN`: no hace falta.
- Esos `.tgz` salen del GitHub Release `v<versión>` del repositorio del framework (`AybarCorp/aybar-framework-desing-frontEnd`): los 10 paquetes y un `SHA512SUMS`. La CLI `aybar` los baja una vez por versión con la sesión de `gh` (la misma con la que se baja el SDK, también privado) a `~/.aybar/framework/<versión>/` (`AYBAR_FRAMEWORK_HOME` cambia la base). Verifica el SHA-512 de cada archivo y que el `package.json` de cada uno sea un `@aybarcorp/*` de la versión pedida, e instala ahí la CLI del framework (`aybar-front`). Basta con acceso de lectura a ese repositorio, que da un owner de AybarCorp.
- `aybar new project --frontend` asegura el framework (lo descarga si falta; sin acceso se para **antes de crear nada**, con el paso exacto), copia los `.tgz` a `frontend/paquetes/`, corre `aybar-front init` desde ahí y quita los que el proyecto no usa.
- `frontend/.npmrc` solo lleva `@aybarcorp:registry=https://npm.pkg.github.com` y `save-exact=true`. Esa línea no es para instalar: hace que un `npm install @aybarcorp/x` por nombre vaya a GitHub Packages, que lo rechaza sin token (fallo visible), y nunca a npmjs.org, donde cualquiera podría publicar un `@aybarcorp/x` (confusión de dependencias). No la quites, y no instales un `@aybarcorp/*` por nombre.
- **Nunca** escribas un token en `.npmrc`, en un `Dockerfile`, en un `--build-arg` ni en un log. El Dockerfile copia `paquetes/` antes de `npm ci` y no usa ningún secreto.
- Si falla la descarga, la CLI dice cuál es el caso: `gh` sin instalar, `gh` sin sesión (`gh auth login`), la cuenta sin acceso al repositorio del framework (pedírselo a un owner de AybarCorp), el release sin paquetes, o una huella que no coincide. `aybar doctor` lo comprueba sin descargar.
- Un proyecto generado antes del SDK 0.5.0 sigue tomando `@aybarcorp/*` de GitHub Packages con la sesión de `gh`, como en 0.4.1, hasta migrarlo con `aybar framework actualizar`; el comando avisa de que su Dockerfile y su CI necesitan el cambio de la plantilla nueva.

| Comando | Qué hace |
|---|---|
| `aybar framework` | La versión que fija el SDK, las descargadas en esta máquina y la del proyecto |
| `aybar framework descargar [--version X]` | Descarga y verifica el framework. Lo corre el instalador del SDK; los demás comandos lo hacen solos la primera vez que hace falta |
| `aybar framework actualizar [--version X] [--dir P]` | Lleva el proyecto a otra versión (por defecto, la que fija el SDK): los `.tgz` de `frontend/paquetes/`, `package.json` y el lockfile (vía `npm install`), la versión de `aybar.config.json` y `.aybar/proyecto.properties`. También migra un proyecto anterior a 0.5.0 y sirve para aplicar un parche del framework sin esperar un release del SDK |
| `aybar framework cli <args>` | Corre `aybar-front` en `frontend/` sin `npx` ni tokens. Las opciones de `aybar-front` van después de `--`: `aybar framework cli -- doctor --json` |

## Federación: import map, no Module Federation

- El shell lee `public/remotos.json`: por remoto, `nombre`, `url` (ESM), `version`, `base` (prefijo de ruta), `roles?` y `publico?` (montable sin sesión; por defecto exige sesión).
- Lo que comparten shell y remotos (React, el core...) va en el import map: `aybar framework cli -- compartidos construir --salida <dir>` construye los módulos compartidos y `importmap.json`.
- Un remoto React deja fuera de su bundle lo compartido. Un remoto Angular es un ESM autocontenido (empaqueta su Angular) con `export default remotoAngular(...)`.
- Un remoto no importa a otro ni se importa por URL: se hablan por el bus (`<remoto>:<evento>`). El hook de arquitectura corta esos imports.
- Un remoto no importa `@aybarcorp/shell` ni `@aybarcorp/auth`: la sesión es del anfitrión, que se la pasa en el contexto (`sesion.obtenerToken()`).
- Punto de entrada de un remoto: `aybar framework cli add remoto <nombre>` (lo genera en `frontend/`; no lo escribas a mano).

## Reglas

- **No reimplementes** sesión, renovación de token, cliente HTTP, correlation ID ni parseo de errores: `@aybarcorp/auth` y `@aybarcorp/http` ya lo hacen.
- **Ninguna llamada a la red en un componente** (`fetch`, `axios`, `XMLHttpRequest`, `HttpClient`): va en un servicio (`src/api/*.ts`, `*.service.ts`) que usa `@aybarcorp/http`. El hook de arquitectura la bloquea.
- Ningún import sale de `frontend/`: el backend se consume por HTTP, con el contrato de G3.
- Colores, espacios y tipografía, de los tokens; nada de literales. Un componente que falta en `@aybarcorp/ui` se pide al framework o se construye con tokens y queda anotado en G2: skill `aybar-estados-ui`.
- **Nunca** un token en `localStorage`, en una cookie escrita desde JS ni en un log.
- Dependencias npm nuevas: versión exacta en `package.json`, `package-lock.json` commiteado y del registro oficial; nada por URL ni git. Los `@aybarcorp/*` son la excepción: `file:` a `frontend/paquetes/`, y solo los cambia `aybar framework actualizar`. Una librería de UI o de estado es decisión del ADR, no de una HU.
- La pantalla que construyes es la de G2 (Figma versionado). Si no coincide, no la "mejores": es un cambio de diseño y vuelve a G2.

## Verificar

```bash
cd frontend
npm ci                       # sin credenciales (o: aybar install --frontend)
npm run build && npm run lint
npm test                     # si el proyecto lo declara; si no, se dice "sin verificar"
aybar framework cli doctor   # sale con 1 si la instalación del framework tiene errores
```

En la raíz, `.agents/scripts/pruebas.sh` y `dependencias-check.sh --frontend`
(npm audit) corren lo mismo que el pipeline. `aybar doctor` revisa el
manifiesto, la versión del framework fijada por el SDK y que el framework esté
en la máquina (o, si no, que la cuenta de `gh` vea su release): dentro de un
proyecto con frontend, que falte es un fallo.
