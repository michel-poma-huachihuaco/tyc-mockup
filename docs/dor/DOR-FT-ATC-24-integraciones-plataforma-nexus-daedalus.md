---
id: "DOR-FT-ATC-24"
tipo: dor
titulo: "Definition of Ready (G4) - FT-ATC-24 Integraciones de plataforma: NEXUS y DAEDALUS (Etapa 2)"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-24", "EP-ATC-10", "AYB-0001"]
tags: [dor, plt-05, g4, etapa-2]
---

# PLT-05 - Definition of Ready (G4) - FT-ATC-24 Integraciones de plataforma: NEXUS y DAEDALUS (Etapa 2)

Va en `docs/dor/DOR-FT-ATC-24-integraciones-plataforma-nexus-daedalus.md`.

| Item evaluado | Product Owner | Lider tecnico |
|---|---|---|
| EP-ATC-10 / FT-ATC-24 Integraciones de plataforma: NEXUS y DAEDALUS (Etapa 2) | Eddie Huamaní | [por asignar] |
| **Fecha de revision** | **Sprint / release destino** | **Resultado** |
| 2026-10-19 | Etapa 2 (cierre estimado 15-dic-2026) · v1.1 | NO READY (planificado para Etapa 2 según RN-SVC-043; no bloquea Etapa 1) |

## 1 Checklist de G4

| # | Criterio | Cumple | Evidencia |
|---|---|---|---|
| 1 | Valor claro | [x] | HU-ATC-061, 062, 063 (`PROC-SVC-023` / `CAP-SVC-018`) |
| 2 | Gherkin verificable | [x] | HU-ATC-061, 062, 063 |
| 3 | Reglas explícitas | [x] | RN-SVC-043, RN-SVC-036, RN-SVC-035, RN-SVC-033, RN-SVC-026 |
| 4 | G2 si `ui: true` | [ ] | HU-ATC-063 tiene `ui: true` (sección propuesta comercial DAEDALUS en Consulta 360); G2 pendiente |
| 5 | G3 si aplica | [ ] | ADR-001, ADR-002 (SSO/OIDC), ADR-003 (consulta sin réplica), ADR-007 (simuladores); G3 en `draft` |
| 6 | Dependencias desbloqueadas | [ ] | NEXUS (`ACT-050`) y DAEDALUS (`ACT-051`) son plataformas en construcción por terceros (cierre estimado 15-dic-2026) |
| 7 | Técnicas y de datos | [x] | `SVC_IDENTITY_LINK` (`ENT-SVC-021`), `SVC_TICKET_ASSIGNMENT_LOG` (`ENT-SVC-003`), `SVC_SEARCH_INDEX` (`ENT-SVC-017`) en `docs/datos/diccionario.md` |
| 8 | TC iniciales QA | [x] | Escenarios `TC-HU-ATC-061..063` incluidos en `docs/pruebas/test-plan.md` |
| 9 | Estimada por el equipo | [ ] | 14 h estimadas de producto para Etapa 2, pendiente de confirmar con APIs finales |
| 10 | Cabe en un sprint | [x] | Sí (14 h en Etapa 2) |
| IA | Revisión humana | [ ] | Pendiente |

### Historias evaluadas en esta funcionalidad (`ATC_requerimientos.xlsx.ods`)

| HU | Título | Escenarios Gherkin | Horas | Desarrollador | Etapa / Fecha objetivo | Condición en tablero (.ods) |
|---|---|---|---|---|---|---|
| HU-ATC-061 | Integrar identidad, SSO y roles con NEXUS | 2 (CA-01, CA-02) | 5 h | Dev 4 (Daniel) | Etapa 2 · cierre est. 15-dic-2026 | NOT_READY (Etapa 2 · NEXUS en construcción; Etapa 1 usa usuarios/roles locales) |
| HU-ATC-062 | Sincronizar la estructura organizacional desde NEXUS | 2 (CA-01, CA-02) | 5 h | Dev 4 (Daniel) | Etapa 2 · cierre est. 15-dic-2026 | NOT_READY (Etapa 2 · NEXUS en construcción; Etapa 1 usa maestro local) |
| HU-ATC-063 | Mostrar la propuesta comercial de DAEDALUS en la consulta 360 | 2 (CA-01, CA-02) | 4 h | Dev 4 (Daniel) | Etapa 2 · cierre est. 15-dic-2026 | NOT_READY (Etapa 2 · DAEDALUS en construcción; Etapa 1 opera sin esta sección) |

## 2 Dependencias

| ID | Dependencia | Tipo | Bloquea a | Responsable | Fecha | Estado |
|---|---|---|---|---|---|---|
| DEP-02 | NEXUS (`ACT-050`): SSO OIDC/SAML, roles, áreas, relación líder-colaborador, disponibilidad y eventos de cese | Externa / Tercero | HU-ATC-061, HU-ATC-062 (solo Etapa 2) | Proveedor NEXUS / TI | 2026-12-15 (estimado) | En construcción — Etapa 1 desacoplada con maestros locales (`RN-SVC-043`) |
| DEP-16 | DAEDALUS (`ACT-051`): API de consulta en línea de propuestas comerciales y reservas (proyecto, lote, precio, estado) | Externa / Tercero | HU-ATC-063 (solo Etapa 2) | Proveedor DAEDALUS / Comercial | 2026-12-15 (estimado) | En construcción — Etapa 1 opera sin sección DAEDALUS en Consulta 360 (`RN-SVC-043`) |

## 3 Modelado

- `SVC_IDENTITY_LINK` (`ENT-SVC-021`), `SVC_TICKET_ASSIGNMENT_LOG` (`ENT-SVC-003`) y `SVC_SEARCH_INDEX` (`ENT-SVC-017`) en `docs/datos/diccionario.md`.

## 4 Arquitectura

- ADR: ADR-001, ADR-002 (OAuth2 Resource Server / OIDC), ADR-003 (consulta en línea sin duplicar datos maestros), ADR-007 (adaptadores con simulador contract-first).

## 5 Riesgos

| ID | Riesgo | Prob. | Impacto | Mitigación | Dueño | Estado |
|---|---|---|---|---|---|---|
| R-02 | Plataformas de terceros (NEXUS, DAEDALUS) aún en construcción sin contrato definitivo | Media | Bajo en Etapa 1 / Medio en Etapa 2 | División por etapas (`RN-SVC-043`): Etapa 1 sale el 30-oct-2026 con usuarios, roles y líderes locales; Etapa 2 integra NEXUS y DAEDALUS al cierre estimado del 15-dic-2026 | PO / TL | Mitigado para Etapa 1 |

## 6 Decision y aprobacion

Decision: NO READY

Condiciones pendientes (exclusivas de Etapa 2 · cierre estimado 15-dic-2026):
- [ ] Publicación de especificaciones definitivas de SSO/API de NEXUS (`ACT-050`) y API comercial de DAEDALUS (`ACT-051`)
- [ ] Cierre de G2 para la sección DAEDALUS en Consulta 360 (`HU-ATC-063`) y aprobación de G3

| Rol | Nombre | Fecha | Firma |
|---|---|---|---|
| Product Owner (aprueba) | | | |
| Lider tecnico (consultivo) | | | |
| QA (consultivo) | | | |
| UX (consultivo) | | | |

Generado por IA: incorporado desde `ATC_requerimientos.xlsx.ods` (`PROC-SVC-023`, `RF-SVC-061..063`, Etapa 2) — Revisado por: pendiente
