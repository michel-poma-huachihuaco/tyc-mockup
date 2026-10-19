---
id: "DOR-FT-ATC-19"
tipo: dor
titulo: "Definition of Ready (G4) - FT-ATC-19 Asistencia al gestor: guía e IA"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-19", "EP-ATC-09", "AYB-0001"]
tags: [dor, plt-05, g4]
---

# PLT-05 - Definition of Ready (G4) - FT-ATC-19 Asistencia al gestor: guía e IA

Va en `docs/dor/DOR-FT-ATC-19-asistencia-gestor-guia-ia.md`.

| Item evaluado | Product Owner | Lider tecnico |
|---|---|---|
| EP-ATC-09 / FT-ATC-19 Asistencia al gestor: guía e IA | Eddie Huamaní | [por asignar] |
| **Fecha de revision** | **Sprint / release destino** | **Resultado** |
| 2026-10-16 | Iteración 1 (19-23 oct 2026) · v1.0 | NO READY |

## 1 Checklist de G4

| # | Criterio | Cumple | Evidencia |
|---|---|---|---|
| 1 | Valor claro | [x] | HU-ATC-047, 048 |
| 2 | Gherkin verificable | [x] | HU-ATC-047, 048 |
| 3 | Reglas explícitas | [x] | RN-SVC-032, 012, 023 |
| 4 | G2 si `ui: true` | [ ] | Guía y panel de sugerencias son pantalla; G2 no existe |
| 5 | G3 si aplica | [ ] | ADR-001, 008 (IA con anonimización); G3 en `draft` |
| 6 | Dependencias desbloqueadas | [ ] | DEP-14 (proveedor de IA aprobado por TI/Seguridad) sin resolver |
| 7 | Técnicas y de datos | [x] | `SVC_KNOWLEDGE_ARTICLE` (ENT-SVC-015), `SVC_AI_SUGGESTION_LOG` (ENT-SVC-016) en diccionario |
| 8 | TC iniciales QA | [ ] | Verificar test-plan.md |
| 9 | Estimada por el equipo | [ ] | 9 h de producto, sin confirmar |
| 10 | Cabe en un sprint | [x] | Sí |
| IA | Revisión humana | [ ] | Pendiente |

### Historias evaluadas en esta funcionalidad (artefacto PLT-04 v1.2)

| HU | Título (PLT-04) | Escenarios Gherkin | Horas | Desarrollador | Fechas | Condición en tablero (PLT-05) |
|---|---|---|---|---|---|---|
| HU-ATC-047 | Consultar la guía de solución del tipo de ticket | 3 (CA-01, CA-02, CA-03) | 4 h | Dev 3 (Michel) | 2026-10-21 → 2026-10-22 | CON CONDICIONES (DEP-14 proveedor de IA) |
| HU-ATC-048 | Recibir retroalimentación de IA mientras atiendo y cierro | 3 (CA-01, CA-02, CA-03) | 5 h | Dev 3 (Michel) | 2026-10-22 → 2026-10-23 | CON CONDICIONES (DEP-14 proveedor de IA) |

## 2 Dependencias

| ID | Dependencia | Tipo | Bloquea a | Responsable | Fecha | Estado |
|---|---|---|---|---|---|---|
| DEP-14 | Proveedor de IA aprobado por TI y Seguridad | Interna/Seguridad | HU-ATC-047, 048 | Gerencia ATC · TI · Seguridad | 2026-10-21 | Pendiente |

## 3 Modelado

- `SVC_KNOWLEDGE_ARTICLE`, `SVC_AI_SUGGESTION_LOG` en `docs/datos/diccionario.md`

## 4 Arquitectura

- ADR: ADR-001, ADR-008 (IA solo vía servicio de asistencia, con anonimización y registro — aplica directo)

## 5 Riesgos

| ID | Riesgo | Prob. | Impacto | Mitigación | Dueño | Estado |
|---|---|---|---|---|---|---|
| R-04 (PLT-05) | Calidad del código/sugerencias generadas con IA | Media | Alto | Revisión de pares obligatoria, guía de prompts | Líder técnico | Abierto |

## 6 Decision y aprobacion

Decision: NO READY

Condiciones pendientes:
- [ ] DEP-14 (proveedor de IA), fecha comprometida 2026-10-21, no resuelta hoy
- [ ] P-01 (proveedor de IA) y P-02 (quién redacta las guías) de FT-ATC-19 bloquean G4
- [ ] G3 no `approved`

| Rol | Nombre | Fecha | Firma |
|---|---|---|---|
| Product Owner (aprueba) | | | |
| Lider tecnico (consultivo) | | | |
| QA (consultivo) | | | |
| UX (consultivo) | | | |

Generado por IA: actualizado con el detalle del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`) — Revisado por: pendiente
