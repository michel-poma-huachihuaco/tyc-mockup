# Instrucciones para GitHub Copilot

El contexto completo de este repositorio esta en `AGENTS.md`, en la raiz: leelo
antes de proponer o cambiar nada. Este fichero solo apunta alli.

Al empezar, sigue la seccion "Al abrir este repositorio (cualquier agente)" de
`AGENTS.md`: ejecuta `.agents/scripts/arranque.sh`, senala `docs/explorador.html`
y cuenta al humano lo que falta antes de tocar codigo. No se escribe codigo de
una feature sin su G3 y su G4 en estado `approved` en `origin/main`.

- Skills: `.agents/skills/` (y `.github/skills/` si el equipo anade las suyas).
- Roles: `.github/agents/*.agent.md`, generados desde `.agents/agents/` por
  `aybar skills sync`; no se editan aqui.
