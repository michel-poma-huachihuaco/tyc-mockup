---
name: aybar-auditoria
description: Emite eventos y ChangeLog Aybar fail-closed (Ley 29733). Usar al auditar, ChangeLog, PII, PartyRef, RefEntidad, CONTRATO_APROBADO o LastChangeLogFile.
---

# Auditoría Aybar

> **Contrato detallado:** `aybar-starter-audit` (en un servicio generado, `docs/skills/aybar-starter-audit.md`; en el repo del SDK, `aybar-starter-audit/SKILL.md`): propiedades, variables obligatorias y trampas. Esta skill es el resumen transversal; si discrepan, **manda el contrato**.

Starter `aybar-starter-audit`. Llamar desde `application` o adapter, nunca meter PII en el mapa `datos`.

Permitido: `PartyRef`, `RefEntidad`, `RefCatalogo`, `Long`, `Integer`, `Boolean`, `Instant`, enum.

Prohibido: `String` libre, nombres, DNI, email, teléfono, hashes, `*Encrypted`. El mensaje de error no debe incluir el valor rechazado.

`auditoria.negocio("CODIGO_MAYUSCULAS", datos)` y `escritorChangeLog.cambio(entidad, fragmento, pk)`.

Publicación async; no bloquear el request. Claves de objeto solo con IDs.

Dentro de una transacción Spring, `negocio()` y `cambio()` se encolan tras el commit (rollback = descarte); `seguridad()` es inmediato. Cola en memoria: entrega at-most-once ante caída abrupta del proceso; lo que deba sobrevivir va por outbox (`aybar-outbox`).
