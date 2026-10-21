---
id: "DOR-FT-ATC-11"
tipo: dor
titulo: "Definition of Ready (G4) - FT-ATC-11 Integración UrbeMind (CITY_INCIDENT)"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-11", "EP-ATC-06", "AYB-0001"]
tags: [dor, plt-05, g4]
---

# PLT-05 - Definition of Ready (G4) - FT-ATC-11 Integración UrbeMind (CITY_INCIDENT)

Va en `docs/dor/DOR-FT-ATC-11-integracion-urbemind-city-incident.md`.

| Item evaluado | Product Owner | Lider tecnico |
|---|---|---|
| EP-ATC-06 / FT-ATC-11 Integración UrbeMind | Eddie Huamaní | [por asignar] |
| **Fecha de revision** | **Sprint / release destino** | **Resultado** |
| 2026-10-16 | Iteración 2 (26-30 oct 2026) · v1.0 | **NO READY** (igual que en el PDF original PLT-05: esta es la única feature que ya estaba explícitamente en NO LISTO, no solo "con condiciones") |

## 1 Checklist de G4

| # | Criterio | Cumple | Evidencia |
|---|---|---|---|
| 1 | Valor claro | [x] | HU-ATC-017, 018 |
| 2 | Gherkin verificable | [x] | HU-ATC-017, 018 |
| 3 | Reglas explícitas | [x] | RN-SVC-005 |
| 4 | G2 si `ui: true` | [ ] | G2 no existe |
| 5 | G3 si aplica | [ ] | ADR-001, 004 (UrbeMind API/eventos); G3 en `draft` |
| 6 | Dependencias desbloqueadas | [ ] | DEP-09 (UrbeMind) sin fecha comprometida |
| 7 | Técnicas y de datos | [x] | Vínculo opcional a `CITY_SERVICE_FEE` en diccionario |
| 8 | TC iniciales QA | [ ] | Verificar test-plan.md |
| 9 | Estimada por el equipo | [ ] | 7 h de producto, sin confirmar |
| 10 | Cabe en un sprint | [x] | Sí |
| IA | Revisión humana | [ ] | Pendiente |

### Historias evaluadas en esta funcionalidad (artefacto PLT-04 v1.2)

| HU | Título (PLT-04) | Escenarios Gherkin | Horas | Desarrollador | Fechas | Condición en tablero (PLT-05) |
|---|---|---|---|---|---|---|
| HU-ATC-017 | Atender incidencias de ciudad como tickets | 2 (CA-01, CA-02) | 2 h | Dev 4 (Daniel) | 2026-10-28 → 2026-10-28 | NO LISTO (Alcance de UrbeMind (R-06) · DEP-09) |
| HU-ATC-018 | Exponer tickets a UrbeMind por API y eventos | 3 (CA-01, CA-02, CA-03) | 5 h | Dev 4 (Daniel) | 2026-10-29 → 2026-10-29 | NO LISTO (Alcance de UrbeMind (R-06) · DEP-09) |

## 2 Dependencias

| ID | Dependencia | Tipo | Bloquea a | Responsable | Fecha | Estado |
|---|---|---|---|---|---|---|
| DEP-09 | UrbeMind: confirmación de alcance y contrato de API | Externa/Negocio | HU-ATC-017, 018 | Patrocinador | sin fecha comprometida en el PDF | Pendiente |

## 3 Modelado

- Vínculo `CITY_INCIDENT` → `CITY_SERVICE_FEE` en `docs/datos/diccionario.md`

## 4 Arquitectura

- ADR: ADR-001, ADR-004 (UrbeMind solo por API/eventos, sin JOIN físico — ya decidido con independencia del resultado de esta pregunta de alcance)

## 5 Riesgos

| ID | Riesgo | Prob. | Impacto | Mitigación | Dueño | Estado |
|---|---|---|---|---|---|---|
| R-06 (PLT-05) | Alcance ambiguo: UrbeMind aparece en "no alcance" en otro documento | Alta | Medio | Resolver en el refinamiento del 16-oct; si no se confirma al 27-oct, sus horas pasan a holgura del equipo | PO | Abierto |

## 6 Decision y aprobacion

Decision: NO READY

Condiciones pendientes:
- [ ] **P-01 de FT-ATC-11 es la condición raíz**: el patrocinador no ha confirmado si UrbeMind entra al alcance, pese a figurar como "fuera de alcance" en otro documento (R-06). Sin esto no tiene sentido evaluar el resto de criterios
- [ ] DEP-09 sin fecha comprometida
- [ ] G3 no `approved`

Esta es la feature en peor estado de las 22: a diferencia de las demás (bloqueadas por dependencias técnicas con fecha), aquí el bloqueante es una decisión de alcance de negocio sin dueño con fecha límite.

| Rol | Nombre | Fecha | Firma |
|---|---|---|---|
| Product Owner (aprueba) | | | |
| Lider tecnico (consultivo) | | | |
| QA (consultivo) | | | |
| UX (consultivo) | | | |

Generado por IA: actualizado con el detalle del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`) — Revisado por: pendiente
