---
id: "DOR-FT-ATC-13"
tipo: dor
titulo: "Definition of Ready (G4) - FT-ATC-13 Encuesta post-atención"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-13", "EP-ATC-07", "AYB-0001"]
tags: [dor, plt-05, g4]
---

# PLT-05 - Definition of Ready (G4) - FT-ATC-13 Encuesta post-atención

Va en `docs/dor/DOR-FT-ATC-13-encuesta-post-atencion.md`.

| Item evaluado | Product Owner | Lider tecnico |
|---|---|---|
| EP-ATC-07 / FT-ATC-13 Encuesta post-atención | Eddie Huamaní | [por asignar] |
| **Fecha de revision** | **Sprint / release destino** | **Resultado** |
| 2026-10-16 | Iteración 2 (26-30 oct 2026) · v1.0 | NO READY |

## 1 Checklist de G4

| # | Criterio | Cumple | Evidencia |
|---|---|---|---|
| 1 | Valor claro | [x] | HU-ATC-019 |
| 2 | Gherkin verificable | [x] | HU-ATC-019 |
| 3 | Reglas explícitas | [x] | RN-SVC-007 |
| 4 | G2 si `ui: true` | [ ] | Verificar `ui`; G2 no existe |
| 5 | G3 si aplica | [ ] | ADR-001, 005; G3 en `draft` |
| 6 | Dependencias desbloqueadas | [ ] | DEP-10 (KPI Engine) sin fecha comprometida en el PDF |
| 7 | Técnicas y de datos | [x] | `SVY_SURVEY_RESPONSE` en diccionario |
| 8 | TC iniciales QA | [ ] | Verificar test-plan.md |
| 9 | Estimada por el equipo | [ ] | 3 h de producto, sin confirmar |
| 10 | Cabe en un sprint | [x] | Sí, talla S |
| IA | Revisión humana | [ ] | Pendiente |

### Historias evaluadas en esta funcionalidad (artefacto PLT-04 v1.2)

| HU | Título (PLT-04) | Escenarios Gherkin | Horas | Desarrollador | Fechas | Condición en tablero (PLT-05) |
|---|---|---|---|---|---|---|
| HU-ATC-019 | Disparar la encuesta al cerrar el ticket | 3 (CA-01, CA-02, CA-03) | 3 h | Dev 3 (Michel) | 2026-10-26 → 2026-10-26 | CON CONDICIONES (DEP-10 KPI Engine) |

## 2 Dependencias

| ID | Dependencia | Tipo | Bloquea a | Responsable | Fecha | Estado |
|---|---|---|---|---|---|---|
| DEP-10 | KPI Engine: fragmento de encuesta POST_TRANSACTION | Externa/Técnica | HU-ATC-019 | Líder técnico | sin fecha comprometida en el PDF | Pendiente |

## 3 Modelado

- `SVY_SURVEY_RESPONSE` en `docs/datos/diccionario.md`

## 4 Arquitectura

- ADR: ADR-001, ADR-005 (disparo por evento al cierre, idempotente)

## 5 Riesgos

| ID | Riesgo | Prob. | Impacto | Mitigación | Dueño | Estado |
|---|---|---|---|---|---|---|
| R-02 (PLT-05) | Integración con KPI Engine sin fecha comprometida | Alta | Alto | Confirmar contrato con el equipo del KPI Engine | Líder técnico | Abierto |

## 6 Decision y aprobacion

Decision: NO READY

Condiciones pendientes:
- [ ] DEP-10 sin fecha comprometida
- [ ] P-01 de FT-ATC-13 (canal de envío de la encuesta) bloquea G4
- [ ] G3 no `approved`

| Rol | Nombre | Fecha | Firma |
|---|---|---|---|
| Product Owner (aprueba) | | | |
| Lider tecnico (consultivo) | | | |
| QA (consultivo) | | | |
| UX (consultivo) | | | |

Generado por IA: actualizado con el detalle del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`) — Revisado por: pendiente
