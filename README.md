# tyc

Frontend generado con el **Aybar SDK** `0.7.1` sobre el framework
corporativo `@aybarcorp/*` `0.3.0`. El codigo vive en `frontend/`; la
raiz trae lo que comparte todo proyecto del SDK: el contexto para la IA, el
marco de entrega, los guardianes y el pipeline. Este repositorio no tiene
backend: el frontend consume sus APIs por HTTP.

> **Empieza por `AGENTS.md`** (contexto para personas y para la IA) y por
> `frontend/README.md` (comandos, papel, framework y Docker del frontend).

## Frontend (`frontend/`)

Proyecto Node aparte (`frontend/package.json`, Node 22) sobre el framework
`@aybarcorp/*` `0.3.0`, instalado con version exacta.

- UI: **React 19 + Vite 8 + TypeScript** (entrada `frontend/src/main.tsx`).

- Papel: **app**. Aplicacion autonoma, sin federacion.

```bash
aybar run --frontend                 # servidor de desarrollo en http://localhost:5173
cd frontend && npm install           # sin la CLI: dependencias, sin credenciales
npm run dev                          # sin la CLI: servidor de desarrollo
npm run build                        # build de produccion en frontend/dist/
npm run lint
aybar framework cli doctor           # instalacion del framework (sale con 1 si hay errores)
aybar framework actualizar           # lleva el framework del proyecto a la version que fija el SDK
```

Los `@aybarcorp/*` que usa el proyecto estan en `frontend/paquetes/`, que se
commitea: `package.json` los toma con `file:paquetes/...` y el lockfile fija su
integridad. Por eso `npm`, los comandos `aybar`, la imagen Docker y el CI
instalan sin ningun token ni permiso de paquetes. Esos `.tgz` salen del release
del framework en GitHub, que la CLI `aybar` descarga con la sesion de `gh` de
quien genera o actualiza el proyecto; para eso basta con acceso de lectura al
repositorio del framework. `frontend/.npmrc` solo apunta el scope `@aybarcorp` a
GitHub Packages, para que un `npm install @aybarcorp/x` por nombre falle a la
vista en vez de resolverse en npmjs.org. Para cambiar de version: `aybar
framework actualizar`.

| Necesitas | Usa |
|---|---|
| Componentes y estilos | `@aybarcorp/ui` (React) o `@aybarcorp/ui-angular` (Angular, componentes standalone `<ay-*>`) y los tokens `--aybar-*` |
| Login y sesion | `@aybarcorp/auth`: OIDC Authorization Code + PKCE contra el emisor que fija el ADR; token solo en memoria |
| Llamar al backend | `@aybarcorp/http`: Bearer, `X-Correlation-Id` y errores RFC 7807 como `ErrorAybar` |
| Federacion | `@aybarcorp/shell` y `@aybarcorp/remote`, por import map nativo |

Comandos completos, Docker (nginx sin root) y la CSP de partida:
`frontend/README.md`.



## Calidad: CI y guardianes

**Pipeline** `.github/workflows/entrega.yml`, por etapas:

| Etapa | Que valida |
|---|---|
| `estructura` | Nombre de rama, formato de commits, gates listos (G4 y G3 aprobados en `main`, y G2 si la feature tiene pantallas) y evals de los guardianes |
| `paquete-definir` | Si `docs/` trae paquete: `docs/explorador.html` al dia (por su huella, sin secretos) y, con el secreto `AYBAR_SDK_TOKEN` y la variable `AYBAR_SDK_REPO` (ORG/REPO del SDK), `aybar paquete validar` sin errores |
| `frontend` | En `frontend/`: `npm ci` (sin credenciales: los `@aybarcorp/*` estan en `frontend/paquetes/`), lint y pruebas si existen, build y `npm audit --audit-level=high` |

**Guardianes de git** (`.guardianes/`, activos desde `aybar new project`; en un clon
nuevo los activa `aybar install`, o `.guardianes/activar.sh` sin la CLI):

- Commits: `tipo(alcance): asunto (AYB-1234)`, con `tipo` en
  `feat fix docs refactor test chore perf build ci`.
- Ramas de trabajo: `feature|bugfix|hotfix/AYB-1234-descripcion`.
- `main`, `master`, `develop` y `release/*` estan protegidas.
- `.gitignore` en solo lectura: es lo que impide que un `.env` o `node_modules/` entren
  al historial. Los hooks `post-checkout`, `post-merge` y `post-rewrite` lo vuelven
  a proteger tras un pull, un cambio de rama o un rebase. Para cambiarlo a
  proposito, con su PR: `chmod u+w .gitignore`, editar y commitear.
- Gate listo (`pre-commit`): en una rama `feature/AYB-1234-*`, un commit que toca
  codigo (`frontend/src/`, `frontend/package.json`, su lockfile o
  la configuracion de build del frontend) exige `docs/gates/AYB-1234/G4.md` con `estado: approved` en
  `origin/main`, y tambien `G3.md` si existe. Si la feature tiene alguna HU con
  `ui: true` en `origin/main`, tambien `G2.md` (y si `G2.md` existe, tiene que
  estar approved). Los commits que solo tocan `docs/`
  pasan: asi se escribe el paquete Definir. `hotfix/`, `bugfix/` y `release/`
  estan exentas. El gate se aprueba con un PR revisado por su CODEOWNER, no
  editando el archivo en la rama de trabajo.

**Hooks de agente** (`.claude/settings.json` + `.guardianes/agente/`): cortan a un
asistente de IA antes de ejecutar algo fuera del contrato: push a ramas
protegidas, force-push, `--no-verify`, aprobar o mergear un PR, tocar Produccion,
escribir secretos o PII, o escribir codigo
sin el gate listo. En `frontend/`: importar algo de fuera de `frontend/`, un
modulo por URL, `@aybarcorp/shell` o `@aybarcorp/auth` desde un remoto, o llamar a la
red desde un componente. Bloquean, no preguntan. Si hace falta una excepcion real, la
pide una persona fuera del agente.

**CODEOWNERS** (`.github/CODEOWNERS`): trae comentadas las reglas por gate y rol
(G1 y G4 el PO, G2 PO + UX, G3 el TL...). Para activarlas, pon los equipos de tu
organizacion y enciende "Require review from Code Owners" en la proteccion de
`main`: es lo que convierte `estado: approved` en una aprobacion real.

## Trabajar con IA

Este proyecto viene preparado para que un asistente (Claude Code, Cursor, OpenCode,
Codex, Gemini CLI, Copilot, Kimi o Hermes) trabaje con el mismo contexto que una
persona del equipo. Lo primero de cada sesion es `.agents/scripts/arranque.sh`
(los hooks de sesion lo corren solos donde la herramienta los admite): dice si el
paquete Definir de `docs/` esta certificado y si `docs/explorador.html`, el mapa
navegable del paquete, esta al dia. Empieza a leer por ese explorador.

| Donde | Que le da a la IA |
|---|---|
| `AGENTS.md` / `CLAUDE.md` | Reglas del proyecto y por donde empezar |
| `.agents/skills/`, `.claude/skills/` | Skills tecnicas del SDK (hexagonal, seguridad, secretos, auditoria, mensajeria...): `.agents/skills/` para todas las herramientas, `.claude/skills/` para Claude Code |
| `.agents/` (roles en `.agents/agents/`, copiados a cada herramienta) | Roles y marco de entrega del equipo (en el frontend: `disenador-ux` para G2 y `desarrollador-frontend`) |
| `.mcp.json`, `.cursor/mcp.json`, `.vscode/mcp.json`, `opencode.json`, `.codex/config.toml`, `.gemini/settings.json` | El servidor MCP `nexora` (`aybar mcp nexora`): leer el paquete en Nexora y registrar avances y PR. Sin secretos: los tokens van en `~/.aybar/nexora.env` (`aybar mcp nexora configurar`). Si `docs/.origen-documental.json` existe, `docs/` es copia sellada de Nexora |
| `frontend/README.md` | Comandos, papel y reglas del frontend |

## Mapa de ficheros

```
tyc/
|-- instalar.sh / .ps1              lo primero tras clonar: aybar install (o como instalar la CLI)
|-- AGENTS.md, CLAUDE.md            contexto para la IA
|-- frontend/                       proyecto Node: package.json, src/, paquetes/ (@aybarcorp/*), Dockerfile, nginx.conf (ver su README)
|-- .github/workflows/entrega.yml
|-- .github/CODEOWNERS              quien aprueba cada gate (comentado hasta que el equipo ponga sus handles)
|-- .guardianes/                    hooks de git (commit, push, gate listo) y de agente (agente/)
|-- docs/gates/<TICKET>/G<n>.md     evidencia de cada gate; solo approved en origin/main abre el paso
|-- .aybar/proyecto.properties      con que SDK, ui, papel y framework se genero (lo escribe la CLI; no se edita)
`-- .agents/, .claude/, .cursor/,   marco de entrega, skills, roles y hooks de arranque por herramienta
    .gemini/, .codex/, .opencode/,  (AGENTS.md, seccion "Al abrir este repositorio")
    .github/{agents,hooks}/
```

## Donde pedir ayuda

- **Un paquete `@aybarcorp/*` no hace lo que dice**: repositorio del framework
  (`aybar-framework`), paquete correspondiente.
- **El frontend se genero mal**: repositorio del SDK, `aybar-frontend-template/`
  (esqueleto) o `aybar-service-template/` (raiz comun).
- **`aybar new project` falla**: repositorio del SDK, `aybar-cli/`.
- **Como hago X con el SDK**: primero `.claude/skills/aybar-*/`; con el framework, `frontend/README.md`.
