---
name: aybar-convenciones-de-entrega
description: Reglas de contrato para entregar código en Aybar — trunk-based, Conventional Commits con ticket, autor humano con firma verificada y sin coautoría de IA, PR pequeño con revisor distinto del autor y CODEOWNERS, squash, versionado y tags. Usar antes de crear una rama, escribir un commit, abrir un pull request o versionar un release.
---

# Convenciones de entrega

Resumen de contrato. La forma exacta que validan los guardianes (tipos de commit,
patrón de rama, qué hacer cuando el hook rechaza) está en la skill
`aybar-commits-ramas`, y la política completa en `.agents/references/politica-git.md`.

## Ramas

- Trunk-based: ramas cortas que integran a `main` por PR, más `release/vX.Y.Z` para estabilizar el pase a Producción.
- Ramas de trabajo: `feature|bugfix|hotfix/<TICKET>-<slug>`. Una rama que vive más de dos días acumula conflictos.
- `main` y `release/*` protegidas sin excepción administrativa: PR obligatorio, revisor distinto del autor, checks en verde, historia lineal, sin force-push.
- `develop`: la política de git del marco la lista como opcional; la estrategia de GitHub la descarta. No la crees por tu cuenta: si un proyecto la necesita, lo decide en un ADR.

## Commits

- `tipo(alcance): asunto (AYB-NNNN)`, asunto en inglés e imperativo.
- **Autor humano con firma verificada** (GPG o SSH). Quien lanza al agente firma y responde por el commit.
- **Nunca** un autor de tipo bot ni un pie `Co-Authored-By` de una herramienta de IA: convertiría a la herramienta en coautora de algo de lo que no responde. La asistencia de IA se declara en la descripción del PR.
- Nunca `--no-verify`. Si el guardián rechaza, se corrige el commit.
- Sin secretos en el diff (skill `aybar-datos-que-no-salen`).

## Pull requests

- Un propósito por PR, ≤400 líneas netas o justificación escrita. En un paquete Definir, un PR por HU (skill `aybar-construir-feature`).
- Plantilla `.agents/templates/pr-descripcion.md`: propósito, ticket, tipo T1/T2/T3, evidencia de prueba y, si hubo IA, qué generó y quién lo revisó.
- Aprobación: un revisor distinto del autor (dos en T3) más el dueño de cada ruta tocada (`CODEOWNERS`). El autor nunca aprueba lo suyo.
- Merge por squash, historia lineal.
- Un agente no hace push, no aprueba, no mergea y no cierra gates. El push y el PR los hace la persona, con sus credenciales.

## Versionado

- `MAJOR.MINOR.PATCH`. El TL crea el tag firmado `vX.Y.Z` sobre el commit de la release: el tag nombra algo ya construido, no dispara otra construcción.
- Imagen inmutable por commit; se promueve entre ambientes, no se reconstruye.
- `CHANGELOG.md` sale de los Conventional Commits; la nota de versión para el usuario la escribe el PO.
- Nada de `-SNAPSHOT` entre servicios publicados.
