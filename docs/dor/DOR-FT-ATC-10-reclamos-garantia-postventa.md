---
id: "DOR-FT-ATC-10"
tipo: dor
titulo: "Definition of Ready (G4) - FT-ATC-10 Reclamos de garantía postventa"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-10", "EP-ATC-05", "AYB-0001"]
tags: [dor, plt-05, g4]
---

# PLT-05 - Definition of Ready (G4) - FT-ATC-10 Reclamos de garantía postventa

Va en `docs/dor/DOR-FT-ATC-10-reclamos-garantia-postventa.md`.

| Item evaluado | Product Owner | Lider tecnico |
|---|---|---|
| EP-ATC-05 / FT-ATC-10 Reclamos de garantía postventa | Eddie Huamaní | [por asignar] |
| **Fecha de revision** | **Sprint / release destino** | **Resultado** |
| 2026-10-16 | Iteración 2 (26-30 oct 2026) · v1.0 | NO READY |

## 1 Checklist de G4

| # | Criterio | Cumple | Evidencia |
|---|---|---|---|
| 1 | Valor claro | [x] | HU-ATC-033..036 |
| 2 | Gherkin verificable | [x] | HU-ATC-033..036 |
| 3 | Reglas explícitas | [x] | RN-SVC-027, 021 |
| 4 | G2 si `ui: true` | [ ] | Verificar `ui` de HU-ATC-035 (inspección con fotos desde móvil); G2 no existe |
| 5 | G3 si aplica | [ ] | ADR-001, 006, 007; G3 en `draft` |
| 6 | Dependencias desbloqueadas | [ ] | DEP-07 (Contratos y Activos) sin fecha comprometida en el PDF |
| 7 | Técnicas y de datos | [x] | `SVC_WARRANTY_CLAIM` (+ inspection) en diccionario |
| 8 | TC iniciales QA | [ ] | Verificar test-plan.md |
| 9 | Estimada por el equipo | [ ] | 12 h de producto, sin confirmar |
| 10 | Cabe en un sprint | [x] | Sí |
| IA | Revisión humana | [ ] | Pendiente |

### Historias evaluadas en esta funcionalidad (artefacto PLT-04 v1.2)

| HU | Título (PLT-04) | Escenarios Gherkin | Horas | Desarrollador | Fechas | Condición en tablero (PLT-05) |
|---|---|---|---|---|---|---|
| HU-ATC-033 | Registrar un reclamo de garantía vinculado a la entrega | 2 (CA-01, CA-02) | 4 h | Dev 1 (Brayan) | 2026-10-27 → 2026-10-28 | CON CONDICIONES (DEP-07 Contratos) |
| HU-ATC-034 | Validar la vigencia de la garantía contra la cobertura | 2 (CA-01, CA-02) | 2 h | Dev 1 (Brayan) | 2026-10-28 → 2026-10-28 | CON CONDICIONES (DEP-07 Contratos) |
| HU-ATC-035 | Registrar la inspección técnica antes de resolver | 2 (CA-01, CA-02) | 3 h | Dev 1 (Brayan) | 2026-10-28 → 2026-10-28 | CON CONDICIONES (DEP-07 Contratos) |
| HU-ATC-036 | Escalar la garantía a Eje 3 y gestionar la adenda | 2 (CA-01, CA-02) | 3 h | Dev 1 (Brayan) | 2026-10-28 → 2026-10-29 | CON CONDICIONES (DEP-07 Contratos) |

## 2 Dependencias

| ID | Dependencia | Tipo | Bloquea a | Responsable | Fecha | Estado |
|---|---|---|---|---|---|---|
| DEP-07 | Contratos y Activos: Acta de Entrega, periodo de cobertura | Interna/Técnica | HU-ATC-033, 034, 035, 036 | Líder técnico | sin fecha comprometida en el PDF | Pendiente |

## 3 Modelado

- `SVC_WARRANTY_CLAIM` y su inspección en `docs/datos/diccionario.md`, FK a `CONTRACT_UNIT_HANDOVER` (no modelada en este servicio — fuente externa)

## 4 Arquitectura

- ADR: ADR-001, ADR-006 (fotos de inspección en object storage), ADR-007

## 5 Riesgos

| ID | Riesgo | Prob. | Impacto | Mitigación | Dueño | Estado |
|---|---|---|---|---|---|---|
| R-02 (PLT-05) | Dependencia de Contratos y Activos sin fecha comprometida | Alta | Alto | Confirmar fecha con el dominio de Postventa | Líder técnico | Abierto |

## 6 Decision y aprobacion

Decision: NO READY

Condiciones pendientes:
- [ ] DEP-07 sin fecha comprometida — criterio 6 no cumple
- [ ] P-01 de FT-ATC-10 (periodos de cobertura por tipo de defecto) bloquea G4
- [ ] G3 no `approved`

| Rol | Nombre | Fecha | Firma |
|---|---|---|---|
| Product Owner (aprueba) | | | |
| Lider tecnico (consultivo) | | | |
| QA (consultivo) | | | |
| UX (consultivo) | | | |

Generado por IA: actualizado con el detalle del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`) — Revisado por: pendiente
