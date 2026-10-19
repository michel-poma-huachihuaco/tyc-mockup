---
name: aybar-secretos
description: Secretos Aybar por entorno, nunca en Git. Usar con passwords, application.yml, Vault, K8s Secret, AYBAR_DATASOURCE_URI, AYBAR_MONGO_URI.
---

# Secretos Aybar

> **Contrato detallado:** `aybar-starter-config` (en un servicio generado, `docs/skills/aybar-starter-config.md`; en el repo del SDK, `aybar-starter-config/SKILL.md`): propiedades, variables obligatorias y trampas. Esta skill es el resumen transversal; si discrepan, **manda el contrato**.

En Git: `application.yml` con issuer y nombres; `application-local.yml.example` sin claves reales.

No en Git: `application-local.yml`.

Prod: inyectar `AYBAR_DATASOURCE_URI` (`jdbc:postgresql://usuario:clave@host:puerto/base`: las credenciales van dentro de la URI) y `AYBAR_MONGO_URI` (K8s Secret o Vault). El desarrollador no recibe passwords de prod.

**No existen** (no las inventes ni las documentes): `AYBAR_DATASOURCE_URL`, `AYBAR_DATASOURCE_USER` y `AYBAR_DATASOURCE_PASSWORD` (retiradas, fusionadas en la URI) ni `AYBAR_REDIS_URI` (el SDK no tiene Redis, ver `aybar-redis`).

Si el perfil no es `local` y falta `AYBAR_DATASOURCE_URI`, el arranque falla. Cero `password:` en YAML del SDK o de la plantilla.
