@AGENTS.md

# aybar-atc (Claude Code)

La linea de arriba importa `AGENTS.md`: es el contexto completo del proyecto y
Claude Code lo carga con este fichero. Aqui solo va lo propio de Claude Code.

- **Arranque**: el hook `SessionStart` de `.claude/settings.json` corre
  `.agents/scripts/arranque.sh` al abrir la sesion y su informe llega a tu
  contexto. Antes de nada, cuentale al humano lo que dice (lo que falta y
  `docs/explorador.html`), como pide la primera seccion de `AGENTS.md`.

- **Skills**: `.claude/skills/`, las carga Claude Code solo. Para un starter
  concreto, su contrato completo esta en `docs/skills/aybar-starter-<x>.md` y
  manda sobre la skill general del mismo tema (por ejemplo,
  `aybar-starter-security` sobre `aybar-seguridad`).
- **Roles**: `.claude/agents/`, uno por fase del marco (tabla en `AGENTS.md`).
  Delega en el rol que corresponda; ningun rol cierra un gate: decide un humano.
- **Marco de entrega**: `.agents/` (`orquestacion.md`, `references/`, `templates/`).
- **Paquete Definir** (`docs/`): "revisa esta documentacion y empieza" pasa
  por `analista-paquete` y luego `orquestador-feature`. Sin G3 y G4 approved
  en `origin/main` no se construye nada. Si la feature tiene
  pantallas (alguna HU con `ui: true`), tambien G2.
- **Decisiones del proyecto**: los ADR approved de `docs/adr/` (nube, emisor de
  tokens, servicios gestionados) mandan sobre los defaults del SDK.
- **Puertos**: los de salida en `domain/.../port/out/`; los casos de uso de
  `application/` son las entradas, sin `@Service` (el cableado va en el
  paquete `adapters.outbound.wiring`).
- **Frontend** (`frontend/`): el framework `@aybarcorp/*` trae diseño, sesion
  (`@aybarcorp/auth`) y cliente HTTP (`@aybarcorp/http`); sus roles son
  `disenador-ux` (G2) y `desarrollador-frontend`. El hook de arquitectura corta
  imports fuera de `frontend/`, modulos importados por URL y llamadas a la red
  desde un componente.
