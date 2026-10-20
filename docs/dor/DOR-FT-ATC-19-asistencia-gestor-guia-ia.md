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
| 1 | Valor claro | [x] | HU-ATC-047 (Etapa 1); HU-ATC-048 (Etapa 3, D-12) |
| 2 | Gherkin verificable | [x] | HU-ATC-047 (Etapa 1); HU-ATC-048 (Etapa 3, D-12) |
| 3 | Reglas explícitas | [x] | RN-SVC-032, 012, 023 |
| 4 | G2 si `ui: true` | [ ] | La guía (HU-ATC-047) es pantalla; el panel de sugerencias (HU-ATC-048, Etapa 3) también; G2 no existe |
| 5 | G3 si aplica | [ ] | ADR-001, 008 (IA con anonimización), ADR-009 (borrador, asistente a futuro); G3 en `draft` |
| 6 | Dependencias desbloqueadas | [ ] | DEP-14 (proveedor de IA aprobado por TI/Seguridad) sin resolver; desde D-12 solo afecta a HU-ATC-048 (Etapa 3), no a la Etapa 1 |
| 7 | Técnicas y de datos | [x] | `SVC_KNOWLEDGE_ARTICLE` (ENT-SVC-015), `SVC_AI_SUGGESTION_LOG` (ENT-SVC-016) en diccionario |
| 8 | TC iniciales QA | [ ] | Verificar test-plan.md |
| 9 | Estimada por el equipo | [ ] | 4 h de producto en Etapa 1 (HU-ATC-047), sin confirmar; las 5 h de HU-ATC-048 quedan fuera de la Etapa 1 |
| 10 | Cabe en un sprint | [x] | Sí |
| IA | Revisión humana | [ ] | Pendiente |

### Historias evaluadas en esta funcionalidad (artefacto PLT-04 v1.2)

| HU | Título (PLT-04) | Escenarios Gherkin | Horas | Desarrollador | Fechas | Condición en tablero (PLT-05) |
|---|---|---|---|---|---|---|
| HU-ATC-047 | Consultar la guía de solución del tipo de ticket | 3 (CA-01, CA-02, CA-03) | 4 h | Dev 3 (Michel) | 2026-10-21 → 2026-10-22 | CON CONDICIONES (DEP-14 proveedor de IA) |
| HU-ATC-048 | Recibir retroalimentación de IA mientras atiendo y cierro | 3 (CA-01, CA-02, CA-03) | 5 h | Dev 3 (Michel) | Sin fecha (Etapa 3) | FUERA DE LA ETAPA 1 (D-12): se integra a futuro con el asistente interno (ADR-009); CON CONDICIONES (DEP-14 proveedor de IA) cuando se programe |

Etapa 1 de esta funcionalidad: 1 HU · 4 h (`HU-ATC-047`). Decisión D-12 de 2026-10-19: `HU-ATC-048` pasa a Etapa 3 (por definir), sin fecha.

## 2 Dependencias

| ID | Dependencia | Tipo | Bloquea a | Responsable | Fecha | Estado |
|---|---|---|---|---|---|---|
| DEP-14 | Proveedor de IA aprobado por TI y Seguridad | Interna/Seguridad | HU-ATC-048 (Etapa 3); el DoR anterior también citaba a HU-ATC-047, pero su documento no la declara: confirmar | Gerencia ATC · TI · Seguridad | Sin fecha (Etapa 3) | Pendiente |

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
- [ ] DEP-14 (proveedor de IA) sin resolver; desde D-12 ya no bloquea la Etapa 1, solo a HU-ATC-048 (Etapa 3)
- [ ] P-01 (proveedor de IA) aplica solo a HU-ATC-048 (Etapa 3); P-02 (quién redacta las guías) de FT-ATC-19 bloquea G4 de HU-ATC-047
- [ ] G3 no `approved`

| Rol | Nombre | Fecha | Firma |
|---|---|---|---|
| Product Owner (aprueba) | | | |
| Lider tecnico (consultivo) | | | |
| QA (consultivo) | | | |
| UX (consultivo) | | | |

Generado por IA: actualizado con el detalle del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`) — Revisado por: pendiente
