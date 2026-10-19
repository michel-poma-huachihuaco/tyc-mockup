---
name: aybar-commits-ramas
description: Convencion de commits, ramas, PRs y tags que validan los guardianes. Usar al commitear, crear ramas, abrir PRs, o cuando el hook commit-msg o pre-push rechace algo.
---

# Commits, ramas y PRs

Commit: `tipo(alcance): asunto (TICKET)` - tipos feat|fix|docs|refactor|test|
chore|perf|build|ci - alcance en minusculas y guiones - asunto en ingles e
imperativo - ticket AYB-NNNN en asunto o cuerpo. Ejemplo:
`feat(ventas): add lot reservation to the sales portal (AYB-1042)`.

Etiquetas de herramientas externas (p. ej. `[nexora:7ac36c81]`, 8 hex del UUID
de la actividad sin guiones) van en el **cuerpo**, tras una linea en blanco: el
asunto se queda en <=72 caracteres y el guardian las acepta ahi.

Ramas: `feature|bugfix|hotfix/<ID>-<slug>`. Protegidas (sin push directo,
nunca): main, release/vX.Y.Z, develop. Unica excepcion del pre-push: el
primer push que CREA `main` en un remoto que aun no la tiene (repositorio nuevo,
lo hace una persona; el guardian del agente lo sigue cortando). PR: un proposito,
<=400 lineas netas o justificacion escrita, revisor distinto del autor (2 en T3).

Los hooks de `.guardianes/` validan esto en local (tras clonar:
`./.guardianes/activar.sh`) y CI lo repite como etapa de estructura
(`.agents/scripts/validar-estructura.sh`). Si el guardian rechaza, el mensaje
dice la forma valida: corrige el commit con `git commit --amend`, no lo
fuerces. Politica completa: `.agents/references/politica-git.md`.
