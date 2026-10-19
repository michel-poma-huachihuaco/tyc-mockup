---
id: "DOR-FT-ATC-03"
tipo: dor
titulo: "Definition of Ready (G4) - FT-ATC-03 Derivación, reasignación y casillero"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-03", "EP-ATC-02", "AYB-0001"]
tags: [dor, plt-05, g4]
---

# PLT-05 - Definition of Ready (G4) - FT-ATC-03 Derivación, reasignación y casillero

Va en `docs/dor/DOR-FT-ATC-03-derivacion-reasignacion-casillero.md`.

| Item evaluado | Product Owner | Lider tecnico |
|---|---|---|
| EP-ATC-02 / FT-ATC-03 Derivación, reasignación y casillero | Eddie Huamaní | [por asignar] |
| **Fecha de revision** | **Sprint / release destino** | **Resultado** |
| 2026-10-16 | Iteración 1 (19-23 oct 2026) · v1.0 | NO READY |

## 1 Checklist de G4

| # | Criterio | Cumple | Evidencia |
|---|---|---|---|
| 1 | Valor claro | [x] | HU-ATC-007, 008, 009 |
| 2 | Gherkin verificable | [x] | HU-ATC-007, 008, 009 |
| 3 | Reglas explícitas | [x] | RN-SVC-006, 012 |
| 4 | G2 si `ui: true` | [ ] | Verificar `ui` de HU-ATC-009 (casillero/consulta); G2 no existe para ninguna feature |
| 5 | G3 si aplica | [ ] | ADR-001, 002, 007; G3 en `draft` |
| 6 | Dependencias desbloqueadas | [ ] | DEP-02 NEXUS, comprometida 19-oct, no resuelta |
| 7 | Técnicas y de datos | [x] | `SVC_TICKET_ASIGNACION` en diccionario |
| 8 | TC iniciales QA | [ ] | Verificar test-plan.md |
| 9 | Estimada por el equipo | [ ] | 11 h de producto, sin confirmar (acuerdo 1) |
| 10 | Cabe en un sprint | [x] | Sí |
| IA | Revisión humana | [ ] | Pendiente |

### Historias evaluadas en esta funcionalidad (artefacto PLT-04 v1.2)

| HU | Título (PLT-04) | Escenarios Gherkin | Horas | Desarrollador | Fechas | Condición en tablero (PLT-05) |
|---|---|---|---|---|---|---|
| HU-ATC-007 | Derivar un ticket a otra área con motivo tipificado | 3 (CA-01, CA-02, CA-03) | 4 h | Dev 2 (Jesús) | 2026-10-19 → 2026-10-19 | CON CONDICIONES (DEP-02) |
| HU-ATC-008 | Reasignar en bloque los tickets de un colaborador que cesa | 3 (CA-01, CA-02, CA-03) | 4 h | Dev 2 (Jesús) | 2026-10-20 → 2026-10-20 | CON CONDICIONES (DEP-02) |
| HU-ATC-009 | Ver mi casillero de tareas por área y responsable | 3 (CA-01, CA-02, CA-03) | 3 h | Dev 2 (Jesús) | 2026-10-20 → 2026-10-20 | CON CONDICIONES (DEP-02) |

## 2 Dependencias

| ID | Dependencia | Tipo | Bloquea a | Responsable | Fecha | Estado |
|---|---|---|---|---|---|---|
| DEP-02 | NEXUS: identidad y roles | Externa | HU-ATC-007, 008, 009 | Líder técnico | 2026-10-19 | Pendiente |

## 3 Modelado

- `SVC_TICKET_ASIGNACION` (append-only) en `docs/datos/diccionario.md`

## 4 Arquitectura

- Contrato: operaciones de derivación/reasignación en `docs/arquitectura/aybar-atc.openapi.yaml`
- ADR: ADR-001, ADR-002, ADR-007

## 5 Riesgos

| ID | Riesgo | Prob. | Impacto | Mitigación | Dueño | Estado |
|---|---|---|---|---|---|---|
| R-02 (PLT-05) | NEXUS no disponible en 2 semanas | Alta | Alto | Simulador de roles | Líder técnico | Abierto |

## 6 Decision y aprobacion

Decision: NO READY

Condiciones pendientes:
- [ ] DEP-02 sin resolver
- [ ] P-01 de FT-ATC-03 (quién puede reasignar en bloque) bloquea G4, sin dueño con fecha
- [ ] G3 no `approved`
- [ ] Estimación sin confirmar

| Rol | Nombre | Fecha | Firma |
|---|---|---|---|
| Product Owner (aprueba) | | | |
| Lider tecnico (consultivo) | | | |
| QA (consultivo) | | | |
| UX (consultivo) | | | |

Generado por IA: actualizado con el detalle del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`) — Revisado por: pendiente
