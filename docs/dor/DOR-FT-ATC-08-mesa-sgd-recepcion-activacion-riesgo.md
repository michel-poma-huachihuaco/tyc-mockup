---
id: "DOR-FT-ATC-08"
tipo: dor
titulo: "Definition of Ready (G4) - FT-ATC-08 Mesa SGD: recepción, activación y riesgo"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-08", "EP-ATC-04", "AYB-0001"]
tags: [dor, plt-05, g4]
---

# PLT-05 - Definition of Ready (G4) - FT-ATC-08 Mesa SGD: recepción, activación y riesgo

Va en `docs/dor/DOR-FT-ATC-08-mesa-sgd-recepcion-activacion-riesgo.md`.

| Item evaluado | Product Owner | Lider tecnico |
|---|---|---|
| EP-ATC-04 / FT-ATC-08 Mesa SGD | Eddie Huamaní | [por asignar] |
| **Fecha de revision** | **Sprint / release destino** | **Resultado** |
| 2026-10-16 | Iteración 2 (26-30 oct 2026) · v1.0 | NO READY |

## 1 Checklist de G4

| # | Criterio | Cumple | Evidencia |
|---|---|---|---|
| 1 | Valor claro | [x] | HU-ATC-020, 021, 022 |
| 2 | Gherkin verificable | [x] | HU-ATC-020, 021, 022 |
| 3 | Reglas explícitas | [x] | RN-SVC-014, 015, 016 |
| 4 | G2 si `ui: true` | [ ] | G2 no existe |
| 5 | G3 si aplica | [ ] | ADR-001, 002; G3 en `draft` |
| 6 | Dependencias desbloqueadas | [ ] | Plazos de línea SGD (DEP-03) sin resolver; además, modelo de datos SGD recién armado en `docs/datos/` en esta misma sesión, sin revisión de Gobierno de Datos |
| 7 | Técnicas y de datos | [ ] | Entidades SGD son nuevas (no estaban en el DoR PDF original, se modelaron en esta sesión) — falta la puerta F4 de Gobierno de Datos |
| 8 | TC iniciales QA | [ ] | Verificar test-plan.md |
| 9 | Estimada por el equipo | [ ] | 11 h de producto, sin confirmar |
| 10 | Cabe en un sprint | [x] | Sí |
| IA | Revisión humana | [ ] | Pendiente |

### Historias evaluadas en esta funcionalidad (artefacto PLT-04 v1.2)

| HU | Título (PLT-04) | Escenarios Gherkin | Horas | Desarrollador | Fechas | Condición en tablero (PLT-05) |
|---|---|---|---|---|---|---|
| HU-ATC-020 | Registrar un caso sensible con Código Único | 2 (CA-01, CA-02) | 4 h | Dev 2 (Jesús) | 2026-10-26 → 2026-10-27 | CON CONDICIONES (Plazos de línea SGD (DEP-03)) |
| HU-ATC-021 | Emitir cargo previo y cargo de activación por separado | 3 (CA-01, CA-02, CA-03) | 3 h | Dev 2 (Jesús) | 2026-10-27 → 2026-10-27 | CON CONDICIONES (Plazos de línea SGD (DEP-03)) |
| HU-ATC-022 | Clasificar el riesgo del caso con matriz objetiva | 2 (CA-01, CA-02) | 4 h | Dev 2 (Jesús) | 2026-10-27 → 2026-10-28 | CON CONDICIONES (Plazos de línea SGD (DEP-03)) |

## 2 Dependencias

| ID | Dependencia | Tipo | Bloquea a | Responsable | Fecha | Estado |
|---|---|---|---|---|---|---|
| DEP-03 | Plazos de línea de la Mesa SGD sin definir | Interna/Negocio | HU-ATC-020, 021, 022 | Gerencia ATC | 2026-10-20 (ligado a la matriz SLA) | Pendiente |

## 3 Modelado

- Entidades de caso sensible (Mesa SGD) en `docs/datos/diccionario.md` — **modeladas en esta sesión a partir de las HU, no venían completas del DoR PDF**; requieren validación de Gobierno de Datos antes de G4

## 4 Arquitectura

- ADR: ADR-001, ADR-002 (bitácoras de riesgo/activación)

## 5 Riesgos

| ID | Riesgo | Prob. | Impacto | Mitigación | Dueño | Estado |
|---|---|---|---|---|---|---|
| R-03 (PLT-05) | Matriz SLA y plazos de línea SGD sin definir al iniciar (21-oct) | Alta | Alto | Matriz provisional firmada antes del 21-oct | Gerencia ATC | Abierto |

## 6 Decision y aprobacion

Decision: NO READY

Condiciones pendientes:
- [ ] DEP-03 (plazos de línea SGD) sin resolver
- [ ] P-01, P-02, P-03 de FT-ATC-08 (plazo SLA por línea, criterios de la matriz de riesgo, formato del Código Único) bloquean G4, las tres sin dueño con fecha
- [ ] Modelo de datos SGD sin pasar por la puerta F4 de Gobierno de Datos
- [ ] G3 no `approved`

| Rol | Nombre | Fecha | Firma |
|---|---|---|---|
| Product Owner (aprueba) | | | |
| Lider tecnico (consultivo) | | | |
| QA (consultivo) | | | |
| UX (consultivo) | | | |

Generado por IA: actualizado con el detalle del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`) — Revisado por: pendiente
