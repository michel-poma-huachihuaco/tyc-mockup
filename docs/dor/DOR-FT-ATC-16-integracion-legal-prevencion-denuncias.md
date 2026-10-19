---
id: "DOR-FT-ATC-16"
tipo: dor
titulo: "Definition of Ready (G4) - FT-ATC-16 Integración con Legal y prevención de denuncias"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-16", "EP-ATC-10", "AYB-0001"]
tags: [dor, plt-05, g4]
---

# PLT-05 - Definition of Ready (G4) - FT-ATC-16 Integración con Legal y prevención de denuncias

Va en `docs/dor/DOR-FT-ATC-16-integracion-legal-prevencion-denuncias.md`.

| Item evaluado | Product Owner | Lider tecnico |
|---|---|---|
| EP-ATC-10 / FT-ATC-16 Integración con Legal | Eddie Huamaní | [por asignar] |
| **Fecha de revision** | **Sprint / release destino** | **Resultado** |
| 2026-10-16 | Iteración 2 (26-30 oct 2026) · v1.0 | NO READY |

## 1 Checklist de G4

| # | Criterio | Cumple | Evidencia |
|---|---|---|---|
| 1 | Valor claro | [x] | HU-ATC-040, 041 |
| 2 | Gherkin verificable | [x] | HU-ATC-040, 041 |
| 3 | Reglas explícitas | [x] | RN-SVC-021, 022, 034, 016 |
| 4 | G2 si `ui: true` | [ ] | G2 no existe |
| 5 | G3 si aplica | [ ] | ADR-001, 007; G3 en `draft` |
| 6 | Dependencias desbloqueadas | [ ] | DEP-12 (herramienta de Legal) sin fecha comprometida en el PDF |
| 7 | Técnicas y de datos | [x] | Sincronización de estado/resolución descrita en `docs/datos/diccionario.md` |
| 8 | TC iniciales QA | [ ] | Verificar test-plan.md |
| 9 | Estimada por el equipo | [ ] | 9 h de producto, sin confirmar |
| 10 | Cabe en un sprint | [x] | Sí |
| IA | Revisión humana | [ ] | Pendiente |

### Historias evaluadas en esta funcionalidad (artefacto PLT-04 v1.2)

| HU | Título (PLT-04) | Escenarios Gherkin | Horas | Desarrollador | Fechas | Condición en tablero (PLT-05) |
|---|---|---|---|---|---|---|
| HU-ATC-040 | Sincronizar con Legal los tickets derivados a Eje 3 | 3 (CA-01, CA-02, CA-03) | 5 h | Dev 4 (Daniel) | 2026-10-23 → 2026-10-23 | CON CONDICIONES (DEP-12 herramienta de Legal · 8%) |
| HU-ATC-041 | Priorizar los reclamos con riesgo de denuncia por su exposición | 3 (CA-01, CA-02, CA-03) | 4 h | Dev 4 (Daniel) | 2026-10-23 → 2026-10-26 | CON CONDICIONES (DEP-12 herramienta de Legal · 8%) |

## 2 Dependencias

| ID | Dependencia | Tipo | Bloquea a | Responsable | Fecha | Estado |
|---|---|---|---|---|---|---|
| DEP-12 | Herramienta de Legal (responsable: Rosario): API o integración | Externa/Legal | HU-ATC-040, 041 | Líder técnico | sin fecha comprometida en el PDF | Pendiente |

## 3 Modelado

- Sincronización ticket↔caso legal (sin duplicar el registro) en `docs/datos/diccionario.md`

## 4 Arquitectura

- ADR: ADR-001, ADR-007 (adaptador con simulador contract-first para la herramienta de Legal)

## 5 Riesgos

| ID | Riesgo | Prob. | Impacto | Mitigación | Dueño | Estado |
|---|---|---|---|---|---|---|
| R-02 (PLT-05) | Herramienta de Legal sin API confirmada | Alta | Alto | Simulador hasta tener contrato real | Líder técnico | Abierto |
| R-06 (PLT-05) | Tasa del 8% de interés legal referencial, sin validar con Legal | Alta | Medio | Resolver en refinamiento del 16-oct | PO | Abierto |

## 6 Decision y aprobacion

Decision: NO READY

Condiciones pendientes:
- [ ] DEP-12 sin fecha comprometida
- [ ] P-01, P-02 (tasa del 8% a validar con Legal) y P-03 de FT-ATC-16 bloquean G4
- [ ] G3 no `approved`

| Rol | Nombre | Fecha | Firma |
|---|---|---|---|
| Product Owner (aprueba) | | | |
| Lider tecnico (consultivo) | | | |
| QA (consultivo) | | | |
| UX (consultivo) | | | |

Generado por IA: actualizado con el detalle del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`) — Revisado por: pendiente
