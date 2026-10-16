# aybar-atc - contexto para trabajar aqui

Lee esto antes de tocar nada. Si solo vas a leer un fichero de este proyecto,
que sea este.

## Al abrir este repositorio (cualquier agente)

Seas Claude Code, Cursor, OpenCode, Codex, Kimi, Gemini, Hermes o Copilot, lo
primero de cada sesion es esto, en este orden, y **antes de tocar codigo**:

1. Ejecuta `.agents/scripts/arranque.sh` (en las herramientas con hook de
   sesion ya lo ha hecho el hook: su informe esta en tu contexto). Comprueba la
   CLI `aybar`, valida el paquete Definir de `docs/` y si `docs/explorador.html`
   esta al dia.
2. Senala al humano `docs/explorador.html` (abrelo en el navegador) y lee
   `docs/analisis/decisiones.md`. Despues, `aybar paquete plan docs`.
3. Cuentale al humano que falta: errores del paquete, explorador viejo, gates
   sin aprobar. Si no hay paquete, el primer paso es `analista-paquete`.
4. No escribas codigo de una feature hasta que su G3 y su G4 esten `approved`
   en `origin/main` (y G2 si tiene HU con `ui: true`). La IA propone; el humano aprueba.

Protocolo completo: skill `aybar-arranque-repo`.

Que lee cada herramienta (las copias por herramienta las genera
`aybar skills sync` desde `.agents/`; no se editan a mano):

| Agente | Contexto | Skills | Roles | Arranque automatico |
|---|---|---|---|---|
| Claude Code | `CLAUDE.md` (importa este) | `.claude/skills/` | `.claude/agents/` | `.claude/settings.json` (SessionStart) |
| Cursor | `AGENTS.md`, `.cursor/rules/` | `.agents/skills/` | `.claude/agents/` | `.cursor/hooks.json` (sessionStart) |
| OpenCode | `AGENTS.md` | `.agents/skills/` | `.opencode/agents/` | `.opencode/plugins/arranque.ts` |
| Codex CLI | `AGENTS.md` | `.agents/skills/` | `.codex/agents/*.toml` | `.codex/hooks.json` (hay que confiar en el `.codex/` del proyecto) |
| Gemini CLI | `AGENTS.md` (por `.gemini/settings.json`) | `.agents/skills/` | `.gemini/agents/` | `.gemini/settings.json` (SessionStart) |
| GitHub Copilot | `.github/copilot-instructions.md`, `AGENTS.md` | `.agents/skills/` | `.github/agents/*.agent.md` | `.github/hooks/arranque.json` (CLI y agente en la nube) |
| Kimi CLI | `AGENTS.md` | `.agents/skills/` | - | Ninguno de proyecto: sigue el paso 1 a mano |
| Hermes Agent | `AGENTS.md` | `.agents/skills/` (con el repo de confianza) | - | Ninguno de proyecto: sigue el paso 1 a mano |

Kimi CLI y Hermes Agent solo admiten hooks de usuario, y el `SessionStart` de
Kimi no pasa su salida al contexto: por eso el paso 1 esta escrito aqui y el
agente lo ejecuta el mismo. Hermes, ademas, solo carga `.agents/skills/` de un
repositorio de confianza: una vez por clon, `hermes skills trust` dentro del
repositorio (lo guarda en `skills.trusted_project_dirs` de
`~/.hermes/config.yaml`; `aybar doctor` avisa si falta). Codex pide confiar en
el proyecto antes de cargar sus hooks.

### Despues de clonar: `./instalar.sh`

Quien clona este repositorio corre una sola cosa, en su raiz: `./instalar.sh`
(Windows: `.\instalar.ps1`). Si falta la CLI `aybar`, dice como instalarla y
para; si esta, ejecuta `aybar install`, que en este orden y sin romper nada si
se repite: comprueba la maquina (Java 21, Node 22, git, `claude`; avisa de gh,
herdr, docker y engram) sin instalar herramientas del sistema; instala el kit de
agentes del equipo en `~/.claude` (skills `aybar-*`, reglas en `CLAUDE.md`,
hook `secret-scanner`, plugins y servidores MCP `engram` y `nexora`); baja las
dependencias y activa los guardianes; pide **un** token de Nexora (alcance
completo, sin eco, a `~/.aybar/nexora.env` con 0600) y corre el arranque.
`--sin-kit`, `--sin-nexora` y `--continuar` cambian eso; `aybar agentes quitar
--usuario` retira el kit. Un agente nunca pide ni escribe el token.

### Documentacion en Nexora y servidores MCP

Si `docs/.origen-documental.json` existe, la documentacion del paquete se
escribe y se aprueba en la fuente que nombra (Nexora) y `docs/` es una copia
sellada: un documento sellado cuenta como aprobado si el sello lo dice y el
archivo no se toco (`aybar paquete validar` lo comprueba). Skills
`aybar-nexora-traer`, `aybar-nexora-publicar` y `aybar-nexora-implementar`. El
agente publica versiones, avances y PR; nunca aprueba. `docs/` y el sello los
escribe `aybar paquete sellar`, nunca un agente a mano. Con el sello, el
guardian de G4 lee la evidencia de lo sellado con la CLI `aybar`. Cada commit
lleva en el cuerpo `[nexora:<8 hex>]`, los 8 primeros caracteres del UUID de su
actividad sin guiones (`[nexora:7ac36c81]`).

El servidor MCP `nexora` se arranca con `aybar mcp nexora` (sin rutas ni
secretos en el repositorio): un puente al MCP remoto de Nexora con el token de
cada persona (ADR-009 del SDK). Una vez por maquina: `aybar mcp nexora
configurar` (URL y token en `~/.aybar/nexora.env`, 0600; lo pide tambien
`aybar install`). Con el servidor instalado en la maquina: `aybar mcp nexora
instalar --version <vX>` y `aybar mcp nexora --local`. `aybar doctor` dice que
falta.

| Agente | Configuracion MCP del proyecto |
|---|---|
| Claude Code | `.mcp.json` (pide aprobar el servidor la primera vez) |
| Cursor | `.cursor/mcp.json` |
| Gemini CLI | `.gemini/settings.json` (`mcpServers`) |
| Codex CLI | `.codex/config.toml` (`[mcp_servers.nexora]`, con el proyecto de confianza) |
| OpenCode | `opencode.json` (`mcp.nexora`) |
| GitHub Copilot (VS Code) | `.vscode/mcp.json` |
| Kimi CLI | De usuario: `kimi mcp add --transport stdio nexora -- aybar mcp nexora` |
| Hermes Agent | De usuario: en `~/.hermes/config.yaml`, `mcp_servers: {nexora: {command: aybar, args: [mcp, nexora]}}` |

Este es un microservicio Spring Boot generado con el **Aybar SDK**
(`aybar-service-template`, version `0.7.1`). No es un proyecto
Spring Boot cualquiera: el SDK ya resuelve configuracion, logs, seguridad,
persistencia, mensajeria, auditoria y el cliente HTTP entre servicios.
**Antes de escribir una pieza de infraestructura, comprueba si el SDK ya la trae.**

**Un solo repositorio, dos mundos.** El backend (reactor Maven) vive en la
raiz y el frontend en `frontend/` (seccion "Frontend" mas abajo). Comparten
ticket, ramas, gates, guardianes y pipeline: una pantalla y el endpoint que
la alimenta pueden ir en el mismo PR. Lo que no comparten es codigo:
`frontend/` no importa nada de la raiz y el backend no sabe que `frontend/`
existe; se hablan solo por HTTP, con el contrato OpenAPI de
`docs/arquitectura/`.

## Que es este servicio

- Nombre: `aybar-atc` - paquete raiz `com.aybarsac.atc` - puerto HTTP `8081`.
- Base fija, siempre presente: `aybar-starter-config`, `aybar-starter-logging`,
  `aybar-starter-common`, Spring MVC y Actuator. Contratos:
  `docs/skills/aybar-starter-config.md`, `docs/skills/aybar-starter-logging.md`
  y `docs/skills/aybar-starter-common.md`.
- Starters activos ademas de la base:

  - `aybar-starter-data` - almacen relacional PostgreSQL (escritura), almacen documental con API de MongoDB (lectura), Flyway, CQRS. Contrato: `docs/skills/aybar-starter-data.md`.
  - `aybar-starter-messaging` - bus de eventos con protocolo Kafka, con DLQ, retry acotado y proteccion poison-pill. Contrato: `docs/skills/aybar-starter-messaging.md`.
  - `aybar-starter-client` - llamadas HTTP a otros servicios, con propagacion de correlationId y bearer. Contrato: `docs/skills/aybar-starter-client.md`.
  - `aybar-starter-security` - resource server OAuth2: valida el JWT del emisor OIDC que fija el ADR del proyecto. Contrato: `docs/skills/aybar-starter-security.md`.
  - `aybar-starter-audit` - auditoria asincrona (Ley 29733), con ChangeLog. Contrato: `docs/skills/aybar-starter-audit.md`.
  - `aybar-starter-web` - ProblemDetail RFC 7807 + OpenAPI/Swagger. Contrato: `docs/skills/aybar-starter-web.md`.


Lo que NO esta en esa lista no esta en el `pom.xml`. No escribas codigo que
dependa de un starter apagado: enciendelo primero con `aybar add starter <x>`
(`datos`, `mensajeria`, `cliente`, `seguridad`, `auditoria`, `web`). Trae la
dependencia, el yml, las variables y el contrato en `docs/skills/`, igual que si
se hubiera generado con el. No lo hagas a mano anadiendo solo el `<dependency>`
(`README.md`, seccion 6.2, explica por que).

## Regla 1: las flechas apuntan hacia dentro

La estructura es hexagonal y la direccion de las dependencias no es negociable:

```
adapters  ->  application  ->  domain
       \         \              ^
        \---------+-------------+
                 (a traves de los puertos que domain declara)
infrastructure -> conoce la configuracion transversal
boot -> conoce a todas, y es la unica que puede
```

- `domain` es Java puro. **No importa Spring, ni Kafka, ni JPA, ni Mongo, ni
  `com.aybarsac.sdk`**, salvo `com.aybarsac.sdk.common` y
  `com.aybarsac.sdk.data.cqrs` (Java puro, los unicos que permite ArchUnit). Si una clase de `domain` necesita una anotacion de framework,
  esa clase no va en `domain`.
- `application` orquesta casos de uso y habla con `domain.port.out`. No conoce
  adaptadores.
- `adapters` es el unico sitio donde aparecen Spring MVC, JPA, Mongo, Kafka o
  un cliente HTTP.
- `infrastructure` aloja la configuracion transversal (security, logging, config).
- `boot` es el unico modulo que importa a todos, porque ahi vive `Application`.

**Esto lo verifica `NormaHexagonalTest`** (en `boot/src/test/java/`, paquete `com.aybarsac.atc.boot`;
`aybar verify arquitectura` lo ejecuta solo)
(ArchUnit). No es una recomendacion de estilo: si te la saltas, `mvn verify`
se pone rojo. Si crees que una regla te estorba, el camino es discutirla,
no rodearla.

## Regla 2: nunca fijes una version que el SDK gobierna

El `pom.xml` raiz no tiene `<parent>`: importa `aybar-bom` en su
`<dependencyManagement>`, y con el llega toda la gestion de versiones del SDK
(Spring Boot, Jackson, el SDK de AWS, Resilience4j y los pines por CVE). Por eso las
dependencias del `pom.xml` van **sin `<version>`**.

- Anadir un starter del SDK o una libreria que el SDK ya gobierna: **sin `<version>`**.
- Una libreria de terceros que el SDK no gobierna: **con `<version>`**, y esa
  decision es tuya.
- Para saber en cual de los dos casos estas, preguntaselo a Maven:

      mvn help:effective-pom | grep -A 2 "<artifactId>TU-LIBRERIA</artifactId>"

Fijar a mano la version de algo ya gobernado puede reabrir un CVE que el SDK
habia cerrado. Maven te dejara hacerlo, asi que el que tiene que decir que
no eres tu.

## Regla 3: las decisiones del proyecto mandan sobre los defaults del SDK

El SDK es la base neutral: da el como (patrones, puertos, proceso del marco,
guardianes). La nube, el emisor de tokens, los servicios gestionados y el
negocio los decide este servicio en sus ADR (`docs/adr/`). Para cualquier
agente: **defaults del SDK < ADR aprobados del proyecto**. Si un ADR diverge
de la estrategia corporativa, se informa en el envio de G3 al TL; no se
bloquea ni se reescribe. Las reglas 1 y 2 no cambian con la nube.

En el frontend, el emisor OIDC, el cliente web y la URL de la API que usan
`@aybarcorp/auth` y `@aybarcorp/http` salen de esos mismos ADR y llegan por
configuracion de despliegue: no se cablean en el codigo.

## Frontend (`frontend/`)

El frontend vive en `frontend/` y es un proyecto Node aparte
(`frontend/package.json`), construido sobre el framework corporativo
`@aybarcorp/*` version `0.3.0`: los paquetes van en bloque, todos
con la misma version. Los que usa este proyecto estan en `frontend/paquetes/`
(se commitea) y `package.json` los toma con `file:`, en version exacta: se
instalan sin credenciales y sin GitHub Packages. Se cambian con `aybar framework
actualizar`, nunca con un `npm install @aybarcorp/x` (fallaria: sin token, el
registro lo rechaza).

- UI: **Angular 22** (standalone, sin zone.js). Entrada `frontend/src/main.ts`
  y proveedores en `frontend/src/app/app.config.ts`; servidor de desarrollo en
  `http://localhost:4200`.

- Papel: **app**. Aplicacion autonoma, sin federacion: consume el sistema de
  diseño y gestiona su propia sesion si la necesita.

Lo que el framework ya trae y no se reimplementa:

| Necesitas | Usa | No |
|---|---|---|
| Componentes, colores, tipografia | `@aybarcorp/ui` (React) o `@aybarcorp/ui-angular` (Angular: componentes standalone `<ay-*>`), y los tokens `--aybar-*` | Hex o medidas sueltas, otro kit de componentes |
| Login y sesion | `@aybarcorp/auth`: OIDC Authorization Code + PKCE contra el emisor que fija el ADR, token solo en memoria. En un remoto la sesion llega del anfitrion | El token en `localStorage`, otro cliente OIDC, un login propio |
| Llamar al backend | `@aybarcorp/http`: Bearer, `X-Correlation-Id`, errores RFC 7807 como `ErrorAybar` (`codigo`, `campos`...), timeout | `fetch`, `axios` o `HttpClient` dentro de un componente |
| Federacion | `@aybarcorp/shell` (anfitrion) y `@aybarcorp/remote` (remoto), por import map nativo | Importar un remoto por URL o por ruta, Module Federation |

Lo que corta el guardian de arquitectura del agente
(`.guardianes/agente/guardian-arquitectura.sh`) antes de escribir:

- codigo de `frontend/` que importa algo de fuera de `frontend/` (el backend
  se consume por HTTP, nunca por ruta);
- un modulo importado por URL: un remoto se monta por el registro del shell, y
  un remoto no importa a otro (se hablan por el bus, `<remoto>:<evento>`);
- un remoto que importa `@aybarcorp/shell` o `@aybarcorp/auth`;
- un componente que llama a la red (`fetch`, `axios`, `XMLHttpRequest` o
  `HttpClient`): la llamada va en un servicio que usa `@aybarcorp/http`.

Y los de siempre, que tambien valen aqui: en una rama `feature/<TICKET>-*`,
`frontend/src/`, `package.json`, el lockfile y la configuracion de build son
codigo y esperan al G4 aprobado (y al G2 si la feature tiene pantallas); y
ningun secreto en el front: una variable `VITE_*` o un `environment.ts`
terminan en el bundle que descarga cualquiera.

El detalle (comandos, Docker, CSP) esta en `frontend/README.md`.

## Donde esta el resto del contexto

| Fichero | Que te da |
|---|---|
| `README.md` | Estructura del servicio, arranque, tests y Docker |
| `frontend/README.md` | El frontend: papel (shell, remoto o app), comandos, framework `@aybarcorp/*`, Docker y CSP |
| `frontend/aybar.config.json` | Papel y version del framework; lo escribe `aybar-front init` y lo verifica `aybar-front doctor` (`aybar framework cli doctor`) |
| `frontend/paquetes/` | Los `.tgz` de los `@aybarcorp/*` que usa el proyecto, con la integridad fijada en el lockfile. Se commitea; lo cambia `aybar framework actualizar`, no se toca a mano |
| `docs/` (paquete Definir) | `analisis/` (intake, BRD, `decisiones.md`: fuente de verdad), `roadmap/`, `epicas/`, `features/`, `historias/`, `dor/`, `backlog/tareas/`, `adr/`, `arquitectura/` (OpenAPI), `datos/`, `pruebas/` y `gates/<TICKET>/G<n>.md`. Solo `estado: approved` en `origin/main` es evidencia |
| `docs/skills/aybar-starter-<x>.md` | El contrato de cada starter que usa este servicio (propiedades, variables obligatorias, trampas), copiado del SDK. **Empieza por aqui** cuando vayas a usar un starter: manda sobre cualquier skill general del mismo tema |
| `docs/VARIABLES.md` | Todas las variables de entorno: cual es obligatoria, su formato, y el mensaje literal que sale cuando falta |
| `.agents/skills/` y `.claude/skills/` | Skills generales del SDK (hexagonal, CQRS, seguridad, marco...): `.agents/skills/` la leen Cursor, OpenCode, Codex, Gemini, Copilot, Kimi y Hermes; `.claude/skills/` es la copia para Claude Code |
| `.agents/agents/` | Los roles del marco (tabla de abajo): la fuente. Sus copias por herramienta (`.claude/agents/`, `.opencode/agents/`, `.gemini/agents/`, `.codex/agents/`, `.github/agents/`) las rehace `aybar skills sync` |
| `.agents/orquestacion.md` | Que fase toca, que rol prepara, que humano decide y que gate corta |
| `.agents/references/` | El marco en detalle: fases y gates, tipificacion, QA, gobierno de datos, git, IA, operacion |
| `.agents/templates/` | Plantillas de los artefactos que exigen los gates (roadmap, epica, feature, HU, DoR, ADR, gate, tareas.json, test plan, release plan...) |
| `.agents/scripts/` | `arranque.sh` (lo primero de cada sesion), `verificar.sh`, `validar-estructura.sh`, `pruebas.sh`, `dependencias-check.sh`, `sonar-check.sh` |
| `.guardianes/` | Hooks de git (formato de commits, nombre de ramas, gate listo en `pre-commit`) y, en `agente/`, los hooks que cortan al agente (cableados en `.claude/settings.json`) |
| Copias del SDK (`.agents/skills/aybar-*`, `.claude/skills/aybar-*`, los roles por herramienta, `docs/skills/aybar-starter-*.md`) | **No se editan aqui**: `aybar skills sync` las rehace desde el SDK (y los roles desde `.agents/agents/`) y pisa lo que se escriba. Una skill propia del equipo va en `.agents/skills/` (y en `.claude/skills/` para Claude Code) con un nombre que no empiece por `aybar-` |
| `.aybar/proyecto.properties` | Con que version del SDK, starters y puerto se genero el servicio (y, del frontend: ui, papel y version del framework). Lo escribe y lo lee la CLI (`aybar doctor`); **no se edita a mano** |
| Los `README.md` de cada capa | Dentro de `domain/`, `application/`, `adapters/`, `infrastructure/`, `boot/`: que va y que no va en cada carpeta |

Roles (`.agents/agents/`, copiados a la carpeta de cada herramienta): cada uno prepara una fase; un humano decide.

| Rol | Fase / gate | Usalo para |
|---|---|---|
| `tipificador` | F0 / G0 | Tipificar un pedido (T1, T2, T3) y armar la ficha de intake |
| `analista-paquete` | F0-F5 / G0-G4 | Validar el paquete Definir de `docs/`, detectar contradicciones e informar por feature. No escribe codigo |
| `disenador-ux` | F3 / G2 | Preparar el envio de G2 (pantallas, flujos y accesibilidad) cuando la feature tiene HU con `ui: true` |
| `arquitecto-adr` | F4 / G3 | Redactar un ADR y preparar el Architecture Gate |
| `gobierno-datos` | F4, F5, F8-F10 | Puertas de Gobierno de Datos cuando el cambio toca el modelo de datos |
| `orquestador-feature` | F6-F8 | Planificar por olas, correr la fundacion y repartir entre los roles; se detiene en cada firma humana |
| `desarrollador-backend` | F7 / G5 | Implementar una HU en el hexagono y dejar el PR listo |
| `desarrollador-frontend` | F7 / G5 | Implementar una HU con pantalla en `frontend/` con el framework `@aybarcorp/*` y dejar el PR listo |
| `revisor-codigo` | G5 | Pre-revisar un PR antes de la revision humana |
| `qa-engineer` | F8 / G6 | Ciclos de QA 0-3 y evidencias del QA Gate |
| `security-reviewer` | F8 / G7 | Security Gate: autenticacion, datos personales, superficie expuesta |
| `release-engineer` | F9-F10 / G8-G9 | Release plan, despliegue, rollback y hotfix |

Los ficheros de `docs/skills/` son **copias selladas**: llevan en la cabecera
la version del SDK de la que salieron y la ruta del original. No los edites
aqui, no sirve de nada. Si algo esta mal, se corrige en el SDK y se regenera.
Y si el sello no coincide con el SDK que tienes instalado, **no te fies de la
copia**: `./comprobar-entorno.sh` te lo avisa.

## Para arrancar

    ./instalar.sh                   # tras clonar: aybar install (maquina, kit de agentes, dependencias, Nexora)
    ./comprobar-entorno.sh          # bash; en Windows .\comprobar-entorno.ps1
    aybar install                   # lo mismo que ./instalar.sh, con la CLI ya instalada
    aybar run                       # compila y arranca (entorno local; carga .env)
    aybar run --env dev             # perfil dev: .env y luego .env.dev
    aybar test                      # unitarios + integracion + ArchUnit, como CI
    aybar verify arquitectura       # tras mover o crear clases: cada una en su capa
    aybar verify                    # antes de pedir revision (estructura, pruebas, dependencias)

Sin la CLI: `./mvnw install` y luego `./mvnw -pl boot spring-boot:run` (este
camino no lee `.env`: hay que exportar las variables a mano).

En el perfil `local` (el que piden `aybar run`, los tests y `spring-boot:run`; el
`application.yml` no trae perfil por defecto) el `application.yml` trae valores por
defecto para todo y no hace falta exportar nada. Fuera de `local` son
obligatorias:


- `AYBAR_DATASOURCE_URI` - formato `jdbc:postgresql://usuario:clave@host:puerto/base`.
  El prefijo `jdbc:` es obligatorio; sin el, el arranque falla con
  `'url' must start with "jdbc"`.



- `AYBAR_KAFKA_BOOTSTRAP` - formato `host:puerto`. Sin ella el arranque se detiene.



- `AYBAR_ISSUER_URI` - URL del emisor OIDC (issuer) que decide el ADR del
  proyecto. Sin ella no hay `JwtDecoder` y el contexto no arranca, con un error
  que **no nombra la variable**. En `local` el servicio arranca sin ella: lo
  protegido responde 401 hasta que la definas.
- `AYBAR_JWT_AUDIENCE` - audiencia (claim `aud`) de este servicio. Sin ella
  ningun token se acepta. En `local` vale `aybar-atc`.


- `AYBAR_CLIENT_HOSTS_CON_TOKEN` - hosts o sufijos a los que se adjunta el
  token en las llamadas salientes. Vacia, no se adjunta a ninguno (401 en destino).


La plantilla con todas, comentada, esta en `.env.example`. El detalle completo,
en `docs/VARIABLES.md`.

Frontend (`frontend/`, Node 22; sin credenciales: los `@aybarcorp/*` estan en
`frontend/paquetes/`):

    aybar run --frontend            # servidor de desarrollo en http://localhost:4200
    cd frontend && npm install      # sin la CLI: dependencias
    npm run dev                     # sin la CLI: servidor de desarrollo
    npm run build                   # build de produccion en frontend/dist/
    npm run lint
    aybar framework cli doctor      # instalacion del framework (sale con 1 si hay errores)
    aybar framework                 # version del framework: la del SDK, las descargadas y la del proyecto

## Construir desde un paquete Definir

Si te piden "revisa esta documentacion y empieza a trabajarla": primero
`analista-paquete` (valida e informa), luego `orquestador-feature` (plan por
olas, fundacion, un PR por HU). Nada se construye sin G3 y G4 con
`estado: approved` en `origin/main` y el DoR en READY (y G2, si la
feature tiene alguna HU con `ui: true`: lo exige el mismo guardian). Skills:
`aybar-paquete-definir` y `aybar-construir-feature`; coreografia completa en
`.agents/orquestacion.md`.

## Como trabajar aqui

1. Antes de anadir una dependencia o escribir infraestructura, mira el
   contrato del starter en `docs/skills/`: es probable que el SDK ya lo resuelva.
2. Respeta la direccion de las dependencias. Si dudas de donde va una clase,
   mira el `README.md` de la carpeta (cada capa tiene el suyo).
3. `aybar test` (o `./mvnw verify`) tiene que quedar en verde: incluye el test
   de arquitectura y el de arranque. Tras mover o crear clases,
   `aybar verify arquitectura` lo comprueba en segundos.
4. No edites nada de `docs/skills/`: es copia sellada del SDK.

Build: `aybar build` (jar) o `aybar package` (imagen Docker) - arranque: `aybar run`.

En `frontend/`:

1. Antes de escribir un componente, un cliente HTTP o un login, mira si el
   framework `@aybarcorp/*` ya lo trae (tabla de la seccion "Frontend").
2. Pantalla en el componente; la llamada a la API en un servicio con
   `@aybarcorp/http`; la sesion de `@aybarcorp/auth` o, en un remoto, del
   anfitrion.
3. `npm run build` y `npm run lint` en verde antes de pedir revision, y
   `aybar framework cli doctor` sin errores.
4. Nada de secretos ni datos reales en el front: lo que se compila, se publica.
