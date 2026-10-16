---
name: aybar-seguridad
description: JWT del emisor OIDC que fija el ADR del proyecto, AybarUserContext, roles y rutas públicas del SDK Aybar. Usar con autenticación, @PreAuthorize, company_roles, companyId, 401/403 o issuer-uri.
---

# Seguridad Aybar

> **Contrato detallado:** `aybar-starter-security` (en un servicio generado, `docs/skills/aybar-starter-security.md`; en el repo del SDK, `aybar-starter-security/SKILL.md`): propiedades, variables obligatorias y trampas. Esta skill es el resumen transversal; si discrepan, **manda el contrato**.

Resource server. No hay login en el servicio: el token lo emite el emisor OIDC que decide el ADR del proyecto (`AYBAR_ISSUER_URI`) y el starter lo valida.

El starter lee los claims con los nombres por defecto del contrato de claims corporativo (`realm_access.roles`, `company_roles`, `companyId`, `preferred_username`, `user_account_id`, `sid`), que conservará `access-control-service`, el emisor de la plataforma (todavía no existe). Cambiarlos con `aybar.security.claims.*` llega con la próxima release (skill `aybar-estado-del-sdk`). Si el emisor del ADR no emite esos nombres, es una decisión de G3, no un parche en el servicio.

En local (perfil `local`) el servicio arranca sin emisor: lo público responde y lo protegido da 401. Para validar tokens reales, `AYBAR_ISSUER_URI` con el emisor OIDC; fuera de `local` es obligatoria.

- Contexto: `AybarUserContextHolder.actual()` o el bean request-scope (record; sin proxy).
- `@PreAuthorize("hasRole('Gerencia')")` usa los roles **globales** (`realm_access.roles` por defecto) y los de la empresa activa, como `ROLE_*`. Los `company_roles` de otras empresas no son authorities: se consultan con `ctx.rolesDe(companyId)`.
- Públicas: `/actuator/health` + `aybar.security.rutas-publicas`. `/v3/api-docs` y `/swagger-ui/**` **no** son públicas.
- Errores 401/403: RFC 7807 `AYB-SEG-401` / `AYB-SEG-403` (starter web).

Method security la autoconfigura `aybar-starter-security`. No reimplementar `SecurityFilterChain` salvo `ConditionalOnMissingBean`.
