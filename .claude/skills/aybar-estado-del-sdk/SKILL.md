---
name: aybar-estado-del-sdk
description: Qué existe de verdad hoy en el SDK Aybar (starters, CLI, plantilla, skills, agentes, guardianes, frontend y framework @aybarcorp/*) frente a lo que el marco solo nombra o diseña, y lo que está en construcción. Usar antes de dar por construido un componente del SDK (outbox, proyector, un comando de la CLI, una skill, un guardián, un hook, soporte de una nube, --frontend, @aybarcorp/auth o http, el login demo, Angular, @aybarcorp/ui-angular, CORS, el emisor de tokens, aybar framework, frontend/paquetes/, el release del framework, el acceso a GitHub Packages o NODE_AUTH_TOKEN) — se verifica, no se asume.
---

# Estado del SDK

Esta skill existe para una sola cosa: **no confundir lo diseñado con lo construido**.
El marco nombra piezas antes de que existan; eso es intencional. El error caro es
que un agente lea el nombre, lo dé por hecho y proponga código que depende de algo
inexistente.

**Regla:** antes de apoyarte en algo, verifícalo en el repo o en el servicio, no en
la documentación. Si no está, dilo en vez de improvisar.

Verificado el 2026-10-07 contra el árbol del repo del SDK: la última release es la
`0.4.1` (tag `v0.4.1`, `<revision>` del `pom.xml` raíz). Lo de AYB-1052 (framework
frontend sin tokens) está en la rama `feature/AYB-1052-framework-sin-token`, **sin
release**: saldrá como `0.5.0`. Esta lista envejece rápido: si vas a decidir algo
importante con ella, vuelve a verificar.

## Existe (release 0.4.1)

| Pieza | Qué hay |
|---|---|
| `aybar-bom` | Versiones gobernadas; el servicio lo importa en `<dependencyManagement>`, sin `<parent>` |
| `aybar-starter-common` | Java puro: tiempo, identificadores, texto, `Money`, `Result` |
| `aybar-starter-logging` | Logs JSON, `correlationId` de punta a punta, MDC, enmascarado |
| `aybar-starter-config` | Perfiles, mapeo `AYBAR_*`, detección de entorno, actuator. Secretos externos con puerto: `aybar.secretos.proveedor` = `aws`, `azure` o `entorno` (desde 0.4.0; en 0.3.0, solo AWS Secrets Manager) |
| `aybar-starter-security` | Resource server JWT con `AybarUserContext`. Nombres de claim configurables en `aybar.security.claims.*`, por defecto los del contrato corporativo (`realm_access.roles`, `company_roles`, `companyId`, `preferred_username`, `user_account_id`, `sid`); con otro mapeo, audiencia obligatoria. CORS opcional con `aybar.security.cors.*` (vacía = apagado). Las dos cosas, desde 0.4.0 |
| `aybar-starter-web` | RFC 7807 (`ManejadorErroresAybar`, `AybarException`, `CodigoErrorAybar`) y OpenAPI con `bearer-jwt` y el esquema `ProblemaAybar` |
| `aybar-starter-client` | `RestClient` corporativo: timeouts, propagación de bearer y `X-Correlation-Id`, client-credentials contra el `token-uri` que se configure |
| `aybar-starter-audit` | Auditoría fail-closed y ChangeLog; publicadores log, NDJSON y S3/MinIO. `GuardianPiiTest` corre en cada build del SDK |
| `aybar-starter-messaging` | `AybarEventProducer` (protocolo Kafka), headers corporativos, DLQ y reintento acotado |
| `aybar-starter-data` | PostgreSQL + Flyway (escritura), API de MongoDB (lectura), puertos CQRS, `EntidadAuditable`, H2 solo en `local` |
| CLI `aybar` / `ayb` | `new project` (`--backend`, `--frontend`), `add starter`, `install`, `run`, `build`, `package`, `test`, `verify` (`entorno`, `dependencias`, `arquitectura`, `estructura`), `skills sync`, `update`, `version`, `doctor`, `info` (`comandos`, `estructura`, `skills`, `orquestacion`, `pilares`, `marco`), `paquete validar` / `plan` / `explorador` (con `docs/flujos/flujos.json` opcional). `aybar framework` todavía no: ver la sección AYB-1052 |
| `aybar-service-template` | Hexágono multi-módulo, `NormaHexagonalTest` (ArchUnit), `.agents/` (agentes, plantillas, referencias, scripts, evals), `.github/workflows/entrega.yml` |
| Guardianes de git (`.guardianes/`) | Formato de commit, nombre de rama, push directo a rama protegida, `.gitignore` en solo lectura, gate listo en `pre-commit` (G4, y G3 si existe; G2 si alguna HU lleva `ui: true`) |
| Hooks de agente | `.claude/settings.json` + `.guardianes/agente/`: Bash (G0, G5, G7, G8), arquitectura, PII y secretos de AWS/Azure/GCP, gate listo |
| Capa de agentes y paquete Definir | Skills `aybar-paquete-definir`, `aybar-construir-feature`, `aybar-contrato-api`, `aybar-modelo-a-flyway`, `aybar-lexico`, `aybar-datos-que-no-salen`, `aybar-estado-del-sdk`, `aybar-arquitectura-vigente`, `aybar-convenciones-de-entrega`; agentes `analista-paquete` y `orquestador-feature`; plantillas `roadmap`, `epica`, `feature`, `dor`, `gate` y `tareas.json`; gates en `docs/gates/<TICKET>/G<n>.md`; especificaciones en `docs/especificaciones/`; `.github/CODEOWNERS` comentado por gate y rol |
| `nuevo-servicio.sh` / `.ps1` | Camino sin CLI, con plantillas embebidas. Solo backend: el frontend solo lo genera la CLI |
| `docker/` | MinIO y Kafka de desarrollo; sin emisor OIDC. Keycloak salió del SDK (entorno local, pruebas y dependencias) por decisión del Technical Lead del 2026-10-06 |
| Backend local sin emisor | El perfil `local` trae `issuer-uri: ${AYBAR_ISSUER_URI:http://emisor-no-configurado.invalid}` (dominio reservado que nunca resuelve): lo público responde y lo protegido da 401. Fuera de `local`, `AYBAR_ISSUER_URI` sigue obligatoria. Un servicio generado con 0.3.0 trae todavía el realm local de Keycloak como defecto |
| Pruebas del SDK sin Keycloak | Los ITs de `aybar-starter-security` y `aybar-starter-client` usan un emisor OIDC simulado en proceso (WireMock + nimbus-jose-jwt) y no necesitan Docker |

Un servicio existente recibe skills y contratos con `aybar update` y
`aybar skills sync`; los agentes solo llegan al generar el servicio (`skills sync`
todavía no los sincroniza).

## En la rama AYB-1052, sin release (será la 0.5.0)

Verificado en el árbol de `feature/AYB-1052-framework-sin-token` el 2026-10-07. No
lo des por hecho hasta verlo en tu versión de la CLI (`aybar version`,
`aybar info comandos`):

- **El framework frontend sin tokens.** La CLI baja `@aybarcorp/*` del **GitHub
  Release** `v<versión>` de `AybarCorp/aybar-framework-desing-frontEnd` (los 10
  `.tgz` y un `SHA512SUMS`) con la sesión de `gh` del desarrollador, a
  `~/.aybar/framework/<versión>/` (`paquetes/`, `cli/` con `aybar-front` ya
  instalada, y `listo.txt`; `AYBAR_FRAMEWORK_HOME` cambia la base). Verifica el
  SHA-512 de cada archivo y que el `package.json` de cada uno sea un
  `@aybarcorp/*` de la versión pedida. Basta con acceso de lectura a ese
  repositorio: sin `NODE_AUTH_TOKEN`, sin `read:packages`, sin tocar `~/.npmrc`.
- **`frontend/paquetes/` en el proyecto.** `aybar new project --frontend` asegura
  el framework antes de crear nada (sin acceso, se para con el paso exacto), copia
  los `.tgz` a `frontend/paquetes/`, corre `aybar-front init` desde ahí y quita los
  que el proyecto no usa. `package.json` los toma con `file:` y el lockfile fija su
  integridad; `frontend/paquetes/` se commitea (unos 1.3 MB en una app React).
  `npm ci`, `npm install`, `aybar install`/`run`/`build`/`test` y el CI instalan
  sin credenciales. `--origen-paquetes` también copia sus `.tgz` al proyecto.
- **Comando `aybar framework`**: sin subcomando (versiones), `descargar`,
  `actualizar` (también migra un proyecto anterior a 0.5.0) y `cli <args>`
  (corre `aybar-front` sin `npx`; reemplaza a `npx @aybarcorp/cli@<v> ...`).
- **Plantillas**: `.npmrc` solo con `@aybarcorp:registry=https://npm.pkg.github.com`
  (contra la confusión de dependencias) y `save-exact=true`; el `Dockerfile` copia
  `paquetes/` antes de `npm ci`, sin secreto de BuildKit; el job `frontend` de
  `entrega.yml` sin `packages: read`, `registry-url` ni `NODE_AUTH_TOKEN`.
- **`aybar doctor`** comprueba el framework (descargado, o el release visible
  para la cuenta de `gh`): dentro de un proyecto con frontend, que falte es un
  fallo; fuera, un aviso.
- **Instaladores**: exigen Node 22 y `gh` con sesión salvo `--solo-backend`, corren
  `aybar framework descargar` al final (si falla, salen con 1 y el SDK queda
  instalado), ya no piden `read:packages` ni tocan `~/.npmrc`, aceptan
  `--configurar-shell` / `--sin-configurar-shell` sin efecto y quitan, con copia
  de respaldo, la línea marcada que la 0.4.1 pudo dejar para exportar
  `NODE_AUTH_TOKEN` (`~/.bashrc`, `~/.bash_profile`, `~/.zshrc` o el perfil de
  PowerShell). `aybar update` distingue ese caso: dice que el SDK nuevo quedó
  instalado y que se reintente `aybar framework descargar`.
- **Decisión**: ADR-ET-0027, **propuesto** (no aprobado), que complementa
  ADR-ET-0007: GitHub Packages sigue siendo el registro de publicación; cambia el
  canal de consumo.

Lo que **no** está probado o no está automatizado, y no hay que vender:

- `install.ps1` **no se ha probado en Windows** con este flujo: solo se revisa de
  forma estática. `install.sh` sí tiene prueba automática y sin red
  (`herramientas/probar-instalador.sh`, al día con el flujo nuevo).
- El release `v0.2.0` del framework con los `.tgz` y `SHA512SUMS` **se creó a
  mano**. El workflow de release del framework lo hará en adelante, pero hoy no
  corre: GitHub Actions de AybarCorp tiene la facturación caída. Hasta que se
  resuelva, una versión nueva del framework no es descargable mientras alguien no
  adjunte sus paquetes al release a mano.
- Next.js: no hay camino verificado sin token para cablear un proyecto Next a mano
  (antes era `npx @aybarcorp/cli init --papel app`, que necesita token).

Los proyectos generados antes de 0.5.0 siguen funcionando como en 0.4.1
(`@aybarcorp/*` de GitHub Packages con la sesión de `gh`) hasta migrarlos con
`aybar framework actualizar`.

## Frontend

Desde 0.4.0 (AYB-1050) el SDK genera frontend; con 0.3.0 o antes, `aybar new
project` exige `--backend` y no hay frontend. Las releases 0.4.0 y 0.4.1 fijan el
framework `@aybarcorp/*` **0.2.0** (`aybar.framework.version` en `sdk.properties`),
publicado en GitHub Packages y, para AYB-1052, adjunto a su GitHub Release.

| Pieza | Qué hay |
|---|---|
| `aybar new project <n> --frontend` | Un solo repositorio: el front siempre en `frontend/`; con `--backend` también, monorepo con el reactor Maven en la raíz. Solo `--frontend`: sin `pom.xml`, `mvnw` ni módulos Java. `--ui react` (por defecto) o `angular`, `--papel app` (por defecto), `shell` o `remoto`, `--sin-instalar`, `--origen-paquetes <dir>`. Puertos: backend 8081, React 5173, Angular 4200 |
| `aybar-frontend-template/` | Plantillas `react-vite` y `angular` que se copian a `frontend/`; las termina de cablear la CLI del framework (`aybar-front init`): desde 0.5.0, la de `~/.aybar/framework/<versión>/cli/`, bajada sin tokens del GitHub Release del framework junto con los `.tgz` que quedan en `frontend/paquetes/` (AYB-1052). `AYBAR_FRAMEWORK_CLI` apunta a otro `cli.js` para pruebas. En los tres papeles (`app`, `shell` y `remoto`; el remoto, corriendo solo, con su anfitrión local de desarrollo): bienvenida pública, login demo (usuarios `admin` y `usuario`) e inicio con la sesión y la sección Backend. Solo en desarrollo, una galería de demostración en `/demo` (vitrina del sistema de diseño con URL por componente, once pantallas de ingreso, cuenta, administración, personalización de la apariencia, profundidad, visor 3D de lotes, redimensionado y accesibilidad con axe), con datos sintéticos; el build de producción no la lleva y `npm run demo:quitar` la borra del proyecto. El tema sigue al sistema por defecto; el selector (Claro, Oscuro, Según el sistema) lo recuerda en el navegador y el arranque de la apariencia de `@aybarcorp/tokens` lo aplica en el `<head>` antes del primer pintado (requiere el framework 0.3.0) |
| Acceso a `@aybarcorp/*` en 0.4.1 (AYB-1051) | GitHub Packages con credencial: `NODE_AUTH_TOKEN` o `gh auth token`, acotada a los procesos que bajan del registro y comprobada antes de generar o instalar; instaladores con `read:packages` y `~/.npmrc` sin secretos; CI con `GITHUB_TOKEN` y `packages: read`, y cada paquete dando acceso de Actions al repositorio. Lo reemplaza AYB-1052 (sección anterior) |
| Manifiesto `.aybar/proyecto.properties` esquema 2 | `tipo` = `BACKEND_MAVEN`, `FRONTEND_NODE` o `MONOREPO`, más `ui`, `papel` y `framework.version`. El esquema 1 se sigue leyendo |
| CORS en `aybar-starter-security` | `aybar.security.cors.origenes-permitidos` (vacía = apagado; `AYBAR_CORS_ORIGENES`), `metodos`, `cabeceras-permitidas`, `cabeceras-expuestas` (`X-Correlation-Id`), `max-age` |
| `@aybarcorp/auth` | OIDC Authorization Code + PKCE S256 con discovery, neutral de emisor; token en memoria; claims con los mismos nombres y defaults que el backend; `@aybarcorp/auth/react` |
| Login demo local | `crearAutenticacionDemo` de `@aybarcorp/auth`: el Login Form de la aplicación compara usuario y clave de prueba en el navegador; **sin token** (`obtenerToken()` falla con `sin-token-demo`), así que el backend protegido responde 401 y la sección Backend del inicio lo explica. Solo se abre en localhost (`demo-fuera-de-local` en otro host). Las plantillas lo usan solo en desarrollo, con el usuario de `.env.development` (React) o `src/environments/environment.development.ts` (Angular), que no entran al build de producción. No es seguridad: es para recorrer la aplicación sin emisor |
| `@aybarcorp/ui` | Componentes React del Aybar Design System V1 en 14 familias: Foundations, Layout, Actions, Form Architecture, Form Controls, Form Pickers, Surfaces, Data, Feedback, Overlays, Navigation, Media, Specialized y Errors. Públicos, entre otros, `Spinner`, `Skeleton` y `EmptyState` |
| `@aybarcorp/ui-angular` | Componentes Angular nativos standalone `<ay-*>` de las mismas 14 familias, con la misma hoja `ui.css`, y la vitrina `<ay-vitrina />`. En un proyecto Angular, `aybar-front init` lo instala en lugar de los custom elements de `@aybarcorp/ui-elements` |
| `@aybarcorp/http` | `crearClienteHttp`: Bearer, `X-Correlation-Id` válido para el backend, RFC 7807 → `ErrorAybar` (`codigo`, `campos`, `correlationId`...) |
| Angular | Shell (`@aybarcorp/shell/angular`, `<ay-punto-montaje>`), remoto (`@aybarcorp/remote/angular`, `remotoAngular`) y app |
| CLI del framework | Binario `aybar-front` (antes `aybar`): `init --papel ... --con-auth --con-http --origen-paquetes`, `add remoto`, `doctor`, `compartidos construir` |
| Capa de agentes de front | Skills `aybar-frontend`, `aybar-auth-spa`, `aybar-contrato-api-cliente`, `aybar-estados-ui`; agentes `desarrollador-frontend` y `disenador-ux`; plantilla `g2-diseno.md`; campo `ui` en la HU |
| G2 automático | Una HU con `ui: true` (o tag `ui`) exige `G2.md` approved en `origin/main`: guardián de G4 y `aybar paquete validar` (`ui-sin-g2`); `aybar paquete plan` reparte las tareas por capa (`backend` / `frontend`) |
| Guardianes de front | El hook de arquitectura corta imports fuera de `frontend/`, imports por URL, imports entre remotos, `@aybarcorp/shell`/`auth` en un remoto y llamadas a la red desde un componente. CI: job `frontend` (npm ci, lint, test, build, npm audit) |

No existe todavía, ni en el repo:

- Plantilla Next.js en el SDK: Next solo como `app`, creando el proyecto a mano y cableándolo con `aybar-front init --papel app` (sin camino verificado sin token desde AYB-1052, ver arriba). Next como shell o remoto, no.
- Playwright o pruebas de accesibilidad en la plantilla del front: se adoptan con decisión del ADR. (El script `test` sí existe: runner de Node sobre `pruebas/`, sin dependencias.)
- Generador de cliente TypeScript desde el OpenAPI.
- El doctor del framework (`aybar framework cli doctor`, antes `npx @aybarcorp/cli doctor`) en el pipeline de CI: se corre a mano, con `aybar verify` o en la DoD.

## No existe (solo diseño o nombre)

| Pieza | Estado |
|---|---|
| Outbox, publicador y proyector de eventos | No existen. Skill `aybar-outbox`, NO_IMPLEMENTADO |
| Catálogo `CodigoNegocio`, `NegocioExcepciones`, i18n de errores | No existen. Skill `aybar-errores`, NO_IMPLEMENTADO |
| Redis | No soportado. Skill `aybar-redis`, NO_IMPLEMENTADO |
| Escaneo de secretos (p. ej. gitleaks) en el pipeline de la plantilla | No hay paso; `entrega.yml` corre estructura, evals, `verify`, dependencias, Sonar y el job `frontend` |
| Pipeline de CI del propio repo del SDK | No hay `.github/` en su raíz |
| Emisor de tokens de la plataforma (`access-control-service`) | No existe todavía; no supongas su URL, host ni puerto. Conservará el contrato de claims corporativo. Hasta entonces, ni el SDK ni `docker/` traen emisor: en local el front usa el login demo y el backend responde 401 a lo protegido; para tokens reales, `AYBAR_ISSUER_URI` con el emisor OIDC que fije el ADR |
| Generador de código desde OpenAPI o librería de pruebas de contrato | No hay. Skill `aybar-contrato-api` |

## Cómo verificar

```bash
aybar version && aybar info comandos          # qué comandos trae TU CLI (y qué framework fija)
aybar info skills                             # skills activas y no implementadas
aybar framework                               # desde 0.5.0: framework descargado y el del proyecto
grep -rl "<Simbolo>" aybar-starter-*/src/main # en el repo del SDK: ¿existe la clase?
ls docs/skills/                               # en un servicio: contratos de los starters que usa
```

Si una skill y el código discrepan, **manda el código**. Si un contrato de
`docs/skills/` y una skill general discrepan, manda el contrato.
