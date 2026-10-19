---
id: "HU-ATC-061"
tipo: hu
titulo: "Integrar identidad, SSO y roles con NEXUS"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-24", "EP-ATC-10", "AYB-0001"]
tags: [hu]
ui: false
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-061-integrar-identidad-sso-roles-nexus.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-10 / docs/analisis/BRD.md
- Como usuario de ATC (sistema integrado con ACT-050 NEXUS) quiero autenticarme con el SSO de NEXUS y obtener de NEXUS mi rol y área, reemplazando los usuarios y roles locales de la Etapa 1, para entrar con una sola cuenta corporativa y gestionar los permisos en un solo lugar.
- Requerimiento origen (RF-SVC-061 — Integrar identidad, SSO y roles con NEXUS): El sistema debe autenticar a los usuarios con el SSO de NEXUS y obtener de NEXUS su rol y área, reemplazando los usuarios y roles locales de la Etapa 1 para todos los usuarios de ATC permitiendo entrar con una sola cuenta corporativa y gestionar los permisos en un solo lugar. Decisión PO · división por etapas oct-2026 · ítem 1 · Capacidad: CAP-SVC-018 (Integración con plataformas corporativas en construcción — Etapa 2) · Proceso: PROC-SVC-023 (Integraciones de plataforma: NEXUS y DAEDALUS — Etapa 2) · Objetivo: OBJ-SVC-003 · Necesidad: NEC-SVC-012 · Fuente: ATC_requerimientos.xlsx.ods · HU-ATC-061 · traza RF-SVC-061
- Etapa del proyecto (RN-SVC-043): **Etapa 2** — Integración con UrbeMind / NEXUS / DAEDALUS · tecnología de terceros en construcción · cierre estimado 15-dic-2026.
- Planificación (Etapa 2): Prioridad: **DEBE** · Iteración: **Etapa 2 (cierre estimado 15-dic-2026)** · Estimación: **5 h** · Asignado: **Dev 4** · Depende de HU: HU-ATC-001 · Dependencias externas: DEP-02 (NEXUS: SSO OIDC/SAML, catálogo de roles y áreas con API estable)
- Observaciones de alcance: NEXUS lo implementa un tercero y está en construcción; en la Etapa 1 (salida 30-oct-2026) ATC opera con usuarios y roles locales (RN-SVC-043).
- Preguntas abiertas (.ods): ¿NEXUS expone OIDC o SAML? ¿Qué atributos de rol y área publica? ¿Fecha comprometida de la API (estimado 15-dic-2026)?

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Integrar identidad, SSO y roles con NEXUS

Escenario: CA-01 · Autenticación SSO y visibilidad por rol desde NEXUS
  Dado un usuario con cuenta corporativa en NEXUS
  Cuando ingresa a ATC
  Entonces se autentica por SSO y ve solo los módulos de su rol.

Escenario: CA-02 · Sincronización automática de cambio de rol o área
  Dado un cambio de rol o de área en NEXUS
  Cuando se sincroniza
  Entonces ATC aplica el nuevo permiso sin intervención manual y lo registra en la bitácora.
```

- Evidencia / prueba esperada: `Token OIDC/SAML emitido por NEXUS + registro en bitácora de sincronización de permisos en SVC_IDENTITY_LINK`

## Reglas de negocio

- RN-SVC-043 (Etapas del proyecto): Etapa 1 (salida 30-oct-2026): todo el alcance funcional, con usuarios, roles y líderes locales y sin UrbeMind. Etapa 2 (cierre estimado 15-dic-2026): integraciones con NEXUS, DAEDALUS y UrbeMind, que dependen de tecnología aún en construcción. Ninguna funcionalidad de la Etapa 1 se bloquea por estas integraciones.
- RN-SVC-036 (Búsqueda respeta permisos): La búsqueda y los módulos heredan los permisos del sistema de origen y del rol del usuario autenticado.

## Datos (CAD-F5)

- Entidades y dependencias declaradas en .ods: ENT-SVC-021 SVC_IDENTITY_LINK
- Entidades/campos que LEE: claims de identidad, rol y área desde NEXUS (ACT-050)
- Entidades/campos que ESCRIBE o modifica: SVC_IDENTITY_LINK (vínculo entre el usuario de ATC y su identidad en NEXUS: rol, área y líder sincronizados)
- Migración / backfill / borrado: reconciliación de usuarios locales de Etapa 1 con `SVC_IDENTITY_LINK` al activar Etapa 2
- Checklist CAD-F5: Aprobado — `ENT-SVC-021` (`SVC_IDENTITY_LINK`) registrado en `docs/datos/diccionario.md`

## DoR (G4) - no entra al sprint sin esto

- [x] Valor claro - [x] Gherkin verificable - [x] Reglas explícitas
- [x] G2 cerrado si `ui: true` (no aplica, `ui: false`) - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas (NEXUS en construcción · Etapa 2, cierre estimado 15-dic-2026) - [x] Casos iniciales de QA
- [ ] Estimada por el equipo - [x] Cabe en un sprint

Generado por IA: incorporado desde `ATC_requerimientos.xlsx.ods` (`RF-SVC-061`, `PROC-SVC-023`, Etapa 2) — Revisado por: pendiente
