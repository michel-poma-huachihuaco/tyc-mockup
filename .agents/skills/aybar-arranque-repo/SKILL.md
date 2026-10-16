---
name: aybar-arranque-repo
description: Protocolo de arranque al abrir un repositorio generado con el Aybar SDK, con cualquier agente (Claude Code, Cursor, OpenCode, Codex, Gemini CLI, Copilot, Kimi, Hermes) — correr .agents/scripts/arranque.sh, leer su informe, señalar docs/explorador.html, saber qué es un paquete "certificado" y qué contarle al humano antes de tocar código. Usar al empezar cualquier sesión en un servicio, cuando el hook de sesión deja el informe de arranque en el contexto, cuando pregunten "¿por dónde empiezo?" o "¿está listo para construir?", o antes de planificar o escribir código de una feature.
---

# Arranque del repositorio

Lo primero de cada sesión en un servicio del SDK, sea cual sea el agente, y
**antes de tocar código**. Lo pide la primera sección de `AGENTS.md` del
servicio. Tu trabajo aquí es informar; las decisiones son del humano.

## 0. Si el clon es nuevo: `./instalar.sh`

En un clon recién hecho, lo primero lo corre el humano, no tú: `./instalar.sh`
(Windows: `.\instalar.ps1`) o `aybar install` en la raíz. Comprueba la máquina
sin instalar nada, deja el kit de agentes del equipo en `~/.claude`, baja las
dependencias, pide el token de Nexora sin eco y termina corriendo este mismo
arranque (ADR-008 del SDK). Si el informe dice que falta la CLI, que
`frontend/node_modules` o los módulos no están instalados, o que el MCP `nexora`
no responde, propón eso. **Nunca pidas el token de Nexora ni lo escribas tú**:
lo teclea el humano en `aybar install` o en `aybar mcp nexora configurar`.

## 1. Corre el arranque (o lee el que ya corrió)

```bash
.agents/scripts/arranque.sh                 # informe en texto
.agents/scripts/arranque.sh --formato json  # el mismo informe, esquema aybar.arranque/1
```

En Claude Code, Cursor, OpenCode, Codex, Gemini CLI y Copilot lo corre un hook
de sesión y su informe ya está en tu contexto (empieza por `ARRANQUE DE`): no lo
repitas salvo que haya cambiado algo. En Kimi y Hermes no hay hook de proyecto:
córrelo tú.

El script comprueba, en segundos y sin red:

| Comprueba | Con | Si falla |
|---|---|---|
| CLI `aybar` en el `PATH` | `command -v aybar` | Di cómo instalarla (install.sh del release del SDK) y para: sin CLI no se certifica |
| Hay paquete Definir en `docs/` | `.md` en `analisis/`, `roadmap/`, `epicas/`, `features/`, `historias/`, `dor/`; tareas en `backlog/tareas/`; o `flujos/flujos.json` | No hay paquete: el primer paso es el agente `analista-paquete` |
| El paquete valida | `aybar paquete validar docs --json` | Cuenta errores, advertencias y las reglas más repetidas |
| El explorador está al día | `aybar paquete explorador docs --comprobar` | `aybar paquete explorador` lo regenera en `docs/explorador.html` |

`--estricto` (para CI) sale con 1 si no hay CLI, si el paquete tiene errores o
si el explorador no está al día. En modo hook (`--hook <herramienta>`) nunca
sale con error: una sesión no se bloquea por esto.

## 2. Qué significa "certificado"

Un paquete está **certificado** cuando, a la vez:

1. `aybar paquete validar` no da ningún ERROR (las advertencias se informan, no
   bloquean), y
2. `docs/explorador.html` está al día con el paquete (`--comprobar` en 0).

Certificado **no** es "listo para construir". Eso es por feature y lo dicen los
gates: G3 y G4 con `estado: approved` **en `origin/main`**, DoR en READY, y G2
si la feature tiene HU con `ui: true`. El informe da "features listas: N de M";
el detalle por feature está en `aybar paquete validar docs` (y en el
explorador). Un gate aprobado en local no cuenta.

**Documentación con origen externo.** Si `docs/.origen-documental.json` existe,
`docs/` es una copia sellada de la fuente donde se escribe y se aprueba (por
ejemplo, Nexora): el informe dice `Origen documental: <fuente>, traído hace X h;
N documentos sellados, P sin aprobar allí`. Un documento sellado cuenta como
aprobado si el sello lo dice y el archivo no se tocó. Si el sello tiene más de
72 h, propón traerlo otra vez (`aybar-nexora-traer`); si hay documentos editados
aquí sin publicar (`origen-huella-distinta`), `aybar-nexora-publicar`. Con un
enlace o ID de Nexora y el pedido de implementar: `aybar-nexora-implementar`.

## 3. Cómo leer el explorador

`docs/explorador.html` es el mapa navegable del paquete que genera la CLI: se
abre en el navegador, sin servidor. Señálaselo al humano con su ruta y léelo en
este orden:

1. **Explorador**: épicas → features → HU → tareas, con el estado de cada gate
   y los flujos (`docs/flujos/flujos.json`, si existen).
2. **`docs/analisis/decisiones.md`**: la fuente de verdad. Manda sobre el resto
   del paquete; los ADR approved de `docs/adr/` mandan sobre los defaults del SDK.
3. **`aybar paquete plan docs`**: olas, fundación y reparto por capa.

Si el explorador no existe o está viejo, no leas uno desactualizado como si
fuera el paquete: dilo y propone regenerarlo.

## 4. Qué le cuentas al humano

Antes de proponer nada, un informe corto:

- Estado: CLI, paquete (errores / advertencias / reglas top), explorador,
  certificado sí o no, features listas N de M.
- Dónde mirar: la ruta de `docs/explorador.html` y `decisiones.md`.
- Lo que falta, en el orden en que se resuelve (la sección "Que falta" del
  informe), y quién lo resuelve: un documento `approved` lo corrige su dueño por
  PR, no el agente.
- El siguiente paso que propones (por ejemplo, `analista-paquete` para el
  informe por feature, o `orquestador-feature` si hay features listas).

## 5. Lo que no haces

- No escribes código de una feature sin su G3 y su G4 approved en
  `origin/main` (los guardianes lo cortan igual; no intentes rodearlos).
- No "arreglas" el paquete para que valide: informas.
- No editas las copias por herramienta (`.claude/agents/`, `.opencode/agents/`,
  `.gemini/agents/`, `.codex/agents/`, `.github/agents/`, skills `aybar-*`):
  las rehace `aybar skills sync` desde `.agents/`.

Skills relacionadas: `aybar-paquete-definir` (cómo leer el paquete),
`aybar-gates` (qué exige cada gate), `aybar-construir-feature` (lo que viene
después).
