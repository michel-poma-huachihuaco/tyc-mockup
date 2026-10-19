---
id: "DOR-FT-ATC-18"
tipo: dor
titulo: "Definition of Ready (G4) - FT-ATC-18 Bandeja orquestadora y flujos por área"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-18", "EP-ATC-09", "AYB-0001"]
tags: [dor, plt-05, g4]
---

# PLT-05 - Definition of Ready (G4) - FT-ATC-18 Bandeja orquestadora y flujos por área

Va en `docs/dor/DOR-FT-ATC-18-bandeja-orquestadora-flujos-por-area.md`.

| Item evaluado | Product Owner | Lider tecnico |
|---|---|---|
| EP-ATC-09 / FT-ATC-18 Bandeja orquestadora y flujos por área | Eddie Huamaní | [por asignar] |
| **Fecha de revision** | **Sprint / release destino** | **Resultado** |
| 2026-10-16 | Iteración 1 (19-23 oct 2026) · v1.0 | NO READY |

## 1 Checklist de G4

| # | Criterio | Cumple | Evidencia |
|---|---|---|---|
| 1 | Valor claro | [x] | HU-ATC-043..046 |
| 2 | Gherkin verificable | [x] | HU-ATC-043..046 |
| 3 | Reglas explícitas | [x] | RN-SVC-031, 033, 006, 040 |
| 4 | G2 si `ui: true` | [ ] | Bandeja y configurador de flujos son pantalla; G2 no existe |
| 5 | G3 si aplica | [ ] | ADR-001; G3 en `draft` |
| 6 | Dependencias desbloqueadas | [ ] | DEP-02 (NEXUS) sin resolver |
| 7 | Técnicas y de datos | [ ] | `SVC_WORKFLOW_DEFINITION` (ENT-SVC-014) existe en el diccionario, pero su relación con el ciclo de vida fijo del ticket NO está resuelta (ver bloqueante crítico abajo) |
| 8 | TC iniciales QA | [ ] | Verificar test-plan.md |
| 9 | Estimada por el equipo | [ ] | 17 h de producto, sin confirmar |
| 10 | Cabe en un sprint | [x] | Ajustado |
| IA | Revisión humana | [ ] | Pendiente |

### Historias evaluadas en esta funcionalidad (artefacto PLT-04 v1.2)

| HU | Título (PLT-04) | Escenarios Gherkin | Horas | Desarrollador | Fechas | Condición en tablero (PLT-05) |
|---|---|---|---|---|---|---|
| HU-ATC-043 | Configurar el flujo de trabajo de un tipo de ticket por área | 3 (CA-01, CA-02, CA-03) | 6 h | Dev 3 (Michel) | 2026-10-19 → 2026-10-20 | CON CONDICIONES (Push o pull · quién marca el rayo) |
| HU-ATC-044 | Trabajar desde una bandeja única ordenada por urgencia | 3 (CA-01, CA-02, CA-03) | 5 h | Dev 3 (Michel) | 2026-10-20 → 2026-10-20 | CON CONDICIONES (Push o pull · quién marca el rayo) |
| HU-ATC-045 | Marcar un ticket crítico con el rayo de prioridad | 3 (CA-01, CA-02, CA-03) | 2 h | Dev 3 (Michel) | 2026-10-21 → 2026-10-21 | CON CONDICIONES (Push o pull · quién marca el rayo) |
| HU-ATC-046 | Reasignar automáticamente al gestor con menos carga | 3 (CA-01, CA-02, CA-03) | 4 h | Dev 3 (Michel) | 2026-10-21 → 2026-10-21 | CON CONDICIONES (Push o pull · quién marca el rayo) |

## 2 Dependencias

| ID | Dependencia | Tipo | Bloquea a | Responsable | Fecha | Estado |
|---|---|---|---|---|---|---|
| DEP-02 | NEXUS: roles y disponibilidad para reasignación automática | Externa | HU-ATC-043..046 | Líder técnico | 2026-10-19 | Pendiente |

## 3 Modelado

- `SVC_WORKFLOW_DEFINITION` (ENT-SVC-014) en `docs/datos/diccionario.md`

## 4 Arquitectura

- ADR: ADR-001

## 5 Riesgos

| ID | Riesgo | Prob. | Impacto | Mitigación | Dueño | Estado |
|---|---|---|---|---|---|---|
| R-02 (PLT-05) | NEXUS no disponible en 2 semanas | Alta | Alto | Simulador de roles y disponibilidad | Líder técnico | Abierto |

## 6 Decision y aprobacion

Decision: NO READY

Condiciones pendientes:
- [ ] **Bloqueante crítico nuevo**: igual que en `FT-ATC-02`, la contradicción sin resolver entre el ciclo de vida fijo de 7 estados del ticket y el flujo configurable que esta feature construye (`HU-ATC-043`) — ver P-04 de `FT-ATC-18` y `docs/analisis/decisiones.md` D-09. No se puede construir el configurador de flujos sin saber si reemplaza o complementa el campo `Status`
- [ ] DEP-02 sin resolver
- [ ] P-01, P-02 y P-03 de FT-ATC-18 (push/pull, quién marca el rayo, cómo se mide la carga) bloquean G4
- [ ] G3 no `approved`

| Rol | Nombre | Fecha | Firma |
|---|---|---|---|
| Product Owner (aprueba) | | | |
| Lider tecnico (consultivo) | | | |
| QA (consultivo) | | | |
| UX (consultivo) | | | |

Generado por IA: actualizado con el detalle del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`) — Revisado por: pendiente
