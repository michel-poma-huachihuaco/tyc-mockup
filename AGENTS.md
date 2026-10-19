# tyc - contexto para trabajar aqui

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

Este es un frontend generado con el **Aybar SDK** (version `0.7.1`)
sobre el framework corporativo `@aybarcorp/*` (version `0.3.0`).
No es un proyecto de Vite o de Angular cualquiera: el framework ya resuelve el
sistema de diseño, la federacion de microfrontends, la sesion OIDC y el
cliente HTTP hacia el backend. **Antes de escribir una pieza de
infraestructura, comprueba si el framework ya la trae.**

## Las decisiones del proyecto mandan sobre los defaults del SDK

El SDK es la base neutral: da el como (patrones, puertos, proceso del marco,
guardianes). La nube, el emisor de tokens, los servicios gestionados y el
negocio los decide este proyecto en sus ADR (`docs/adr/`). Para cualquier
agente: **defaults del SDK < ADR aprobados del proyecto**. Si un ADR diverge
de la estrategia corporativa, se informa en el envio de G3 al TL; no se
bloquea ni se reescribe.

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

- UI: **React 19 + Vite 8 + TypeScript**. Entrada `frontend/src/main.tsx`;
  servidor de desarrollo en `http://localhost:5173`.

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
| `README.md` | Que es el proyecto, el frontend, el pipeline y los guardianes |
| `frontend/README.md` | El frontend: papel (shell, remoto o app), comandos, framework `@aybarcorp/*`, Docker y CSP |
| `frontend/aybar.config.json` | Papel y version del framework; lo escribe `aybar-front init` y lo verifica `aybar-front doctor` (`aybar framework cli doctor`) |
| `frontend/paquetes/` | Los `.tgz` de los `@aybarcorp/*` que usa el proyecto, con la integridad fijada en el lockfile. Se commitea; lo cambia `aybar framework actualizar`, no se toca a mano |
| `docs/` (paquete Definir) | `analisis/` (intake, BRD, `decisiones.md`: fuente de verdad), `roadmap/`, `epicas/`, `features/`, `historias/`, `dor/`, `backlog/tareas/`, `adr/`, `arquitectura/` (OpenAPI), `datos/`, `pruebas/` y `gates/<TICKET>/G<n>.md`. Solo `estado: approved` en `origin/main` es evidencia |
| `.agents/skills/` y `.claude/skills/` | Skills generales del SDK (hexagonal, CQRS, seguridad, marco...): `.agents/skills/` la leen Cursor, OpenCode, Codex, Gemini, Copilot, Kimi y Hermes; `.claude/skills/` es la copia para Claude Code |
| `.agents/agents/` | Los roles del marco (tabla de abajo): la fuente. Sus copias por herramienta (`.claude/agents/`, `.opencode/agents/`, `.gemini/agents/`, `.codex/agents/`, `.github/agents/`) las rehace `aybar skills sync` |
| `.agents/orquestacion.md` | Que fase toca, que rol prepara, que humano decide y que gate corta |
| `.agents/references/` | El marco en detalle: fases y gates, tipificacion, QA, gobierno de datos, git, IA, operacion |
| `.agents/templates/` | Plantillas de los artefactos que exigen los gates (roadmap, epica, feature, HU, DoR, ADR, gate, tareas.json, test plan, release plan...) |
| `.agents/scripts/` | `arranque.sh` (lo primero de cada sesion), `verificar.sh`, `validar-estructura.sh`, `pruebas.sh`, `dependencias-check.sh`, `sonar-check.sh` |
| `.guardianes/` | Hooks de git (formato de commits, nombre de ramas, gate listo en `pre-commit`) y, en `agente/`, los hooks que cortan al agente (cableados en `.claude/settings.json`) |
| Copias del SDK (`.agents/skills/aybar-*`, `.claude/skills/aybar-*`, los roles por herramienta) | **No se editan aqui**: `aybar skills sync` las rehace desde el SDK (y los roles desde `.agents/agents/`) y pisa lo que se escriba. Una skill propia del equipo va en `.agents/skills/` (y en `.claude/skills/` para Claude Code) con un nombre que no empiece por `aybar-` |
| `.aybar/proyecto.properties` | Con que version del SDK se genero el proyecto (y, del frontend: ui, papel y version del framework). Lo escribe y lo lee la CLI (`aybar doctor`); **no se edita a mano** |

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

## Para arrancar

Frontend (`frontend/`, Node 22; sin credenciales: los `@aybarcorp/*` estan en
`frontend/paquetes/`):

    aybar run --frontend            # servidor de desarrollo en http://localhost:5173
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

En `frontend/`:

1. Antes de escribir un componente, un cliente HTTP o un login, mira si el
   framework `@aybarcorp/*` ya lo trae (tabla de la seccion "Frontend").
2. Pantalla en el componente; la llamada a la API en un servicio con
   `@aybarcorp/http`; la sesion de `@aybarcorp/auth` o, en un remoto, del
   anfitrion.
3. `npm run build` y `npm run lint` en verde antes de pedir revision, y
   `aybar framework cli doctor` sin errores.
4. Nada de secretos ni datos reales en el front: lo que se compila, se publica.
