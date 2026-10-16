---
id: "DOR-FT-ATC-20"
tipo: dor
titulo: "Definition of Ready (G4) - FT-ATC-20 Búsqueda y consulta 360 del cliente"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "[Product Owner]"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-20", "EP-ATC-10", "AYB-0001"]
tags: [dor, plt-05, g4]
---

# PLT-05 - Definition of Ready (G4) - FT-ATC-20 Búsqueda y consulta 360 del cliente

Va en `docs/dor/DOR-FT-ATC-20-busqueda-consulta-360-cliente.md`.

| Item evaluado | Product Owner | Lider tecnico |
|---|---|---|
| EP-ATC-10 / FT-ATC-20 Búsqueda y consulta 360 del cliente | Eddie Huamaní | [por asignar] |
| **Fecha de revision** | **Sprint / release destino** | **Resultado** |
| 2026-10-16 | Iteración 1 (19-23 oct 2026) · v1.0 | NO READY |

## 1 Checklist de G4

| # | Criterio | Cumple | Evidencia |
|---|---|---|---|
| 1 | Valor claro | [x] | HU-ATC-049..053 |
| 2 | Gherkin verificable | [x] | HU-ATC-049..053 |
| 3 | Reglas explícitas | [x] | RN-SVC-036, 026, 012 — pero la matriz rol→campo visible de RN-SVC-036 **no existe en ninguna fuente** (confirmado leyendo el artefacto de Nexora en esta misma sesión) |
| 4 | G2 si `ui: true` | [ ] | HU-ATC-050 es `ui: true`; G2 no existe |
| 5 | G3 si aplica | [ ] | ADR-001, 003, 007, 008 (búsqueda semántica); G3 en `draft` |
| 6 | Dependencias desbloqueadas | [ ] | DEP-01 (SIGDA/TAXON) y DEP-13 (motor de José) sin resolver |
| 7 | Técnicas y de datos | [x] | `SVC_SEARCH_INDEX` (ENT-SVC-017) en diccionario; arquitectura de agregación discutida en esta sesión (fan-out en paralelo, sin copiar datos) |
| 8 | TC iniciales QA | [ ] | Verificar test-plan.md |
| 9 | Estimada por el equipo | [ ] | 20 h de producto (talla L), sin confirmar |
| 10 | Cabe en un sprint | [x] | Ajustado |
| IA | Revisión humana | [ ] | Pendiente |

## 2 Dependencias

| ID | Dependencia | Tipo | Bloquea a | Responsable | Fecha | Estado |
|---|---|---|---|---|---|---|
| DEP-01 | API SIGDA/TAXON | Externa | HU-ATC-049, 050, 051 | Líder técnico | 2026-10-19 | Pendiente |
| DEP-13 | Motor de consultas de José: contrato de API | Interna/Técnica | HU-ATC-052 | Líder técnico | 2026-10-21 | Pendiente |

## 3 Modelado

- `SVC_SEARCH_INDEX` en `docs/datos/diccionario.md`; consulta 360 es agregación en línea, sin tabla propia (RN-SVC-026)

## 4 Arquitectura

- ADR: ADR-001, ADR-003 (consulta sin copiar), ADR-007 (adaptadores con simulador), ADR-008 (si la búsqueda semántica de HU-ATC-053 usa un modelo externo, anonimización obligatoria)

## 5 Riesgos

| ID | Riesgo | Prob. | Impacto | Mitigación | Dueño | Estado |
|---|---|---|---|---|---|---|
| R-02 (PLT-05) | APIs externas (SIGDA/TAXON, motor de José) no disponibles en 2 semanas | Alta | Alto | Contrato de interfaz y simulador | Líder técnico | Abierto |

## 6 Decision y aprobacion

Decision: NO READY

Condiciones pendientes:
- [ ] **Bloqueante crítico**: no existe la matriz rol→campo visible que RN-SVC-036 exige (según RNF-SEC-010: 0 accesos indebidos) — sin ella, `PoliticaVisibilidad360` (discutida en esta sesión) no se puede implementar con reglas reales, solo con la forma vacía
- [ ] DEP-01 y DEP-13 sin resolver
- [ ] P-02 (qué sistemas alimentan cada sección) y P-03 (qué repositorios se indexan semánticamente) de FT-ATC-20 bloquean G4
- [ ] G3 no `approved`

| Rol | Nombre | Fecha | Firma |
|---|---|---|---|
| Product Owner (aprueba) | | | |
| Lider tecnico (consultivo) | | | |
| QA (consultivo) | | | |
| UX (consultivo) | | | |

Generado por IA: documento completo — Revisado por: pendiente
