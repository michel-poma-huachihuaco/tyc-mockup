---
id: "DOR-FT-ATC-06"
tipo: dor
titulo: "Definition of Ready (G4) - FT-ATC-06 Apelaciones internas e INDECOPI"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-06", "EP-ATC-03", "AYB-0001"]
tags: [dor, plt-05, g4]
---

# PLT-05 - Definition of Ready (G4) - FT-ATC-06 Apelaciones internas e INDECOPI

Va en `docs/dor/DOR-FT-ATC-06-apelaciones-internas-indecopi.md`.

| Item evaluado | Product Owner | Lider tecnico |
|---|---|---|
| EP-ATC-03 / FT-ATC-06 Apelaciones internas e INDECOPI | Eddie Huamaní | [por asignar] |
| **Fecha de revision** | **Sprint / release destino** | **Resultado** |
| 2026-10-16 | Iteración 2 (26-30 oct 2026) · v1.0 | NO READY |

## 1 Checklist de G4

| # | Criterio | Cumple | Evidencia |
|---|---|---|---|
| 1 | Valor claro | [x] | HU-ATC-016 |
| 2 | Gherkin verificable | [x] | HU-ATC-016 |
| 3 | Reglas explícitas | [x] | RN-SVC-010 |
| 4 | G2 si `ui: true` | [ ] | G2 no existe |
| 5 | G3 si aplica | [ ] | ADR-001, 002, 006; G3 en `draft` |
| 6 | Dependencias desbloqueadas | [ ] | DEP-06 (S3/GLI) sin resolver |
| 7 | Técnicas y de datos | [x] | `COMPLAINT_APPEAL` en diccionario |
| 8 | TC iniciales QA | [ ] | Verificar test-plan.md |
| 9 | Estimada por el equipo | [ ] | 3 h de producto, sin confirmar |
| 10 | Cabe en un sprint | [x] | Sí, talla S |
| IA | Revisión humana | [ ] | Pendiente |

### Historias evaluadas en esta funcionalidad (artefacto PLT-04 v1.2)

| HU | Título (PLT-04) | Escenarios Gherkin | Horas | Desarrollador | Fechas | Condición en tablero (PLT-05) |
|---|---|---|---|---|---|---|
| HU-ATC-016 | Dar seguimiento a apelaciones internas y ante INDECOPI | 3 (CA-01, CA-02, CA-03) | 3 h | Dev 1 (Brayan) | 2026-10-27 → 2026-10-27 | CON CONDICIONES (DEP-06 S3) |

## 2 Dependencias

| ID | Dependencia | Tipo | Bloquea a | Responsable | Fecha | Estado |
|---|---|---|---|---|---|---|
| DEP-06 | Object storage con bloqueo de escritura (S3/GLI) | Técnica/Nube | HU-ATC-016 | Líder técnico | sin fecha en el PDF | Pendiente |

## 3 Modelado

- `COMPLAINT_APPEAL` en `docs/datos/diccionario.md`

## 4 Arquitectura

- ADR: ADR-001, ADR-002, ADR-006 (misma dependencia de nube que FT-ATC-05)

## 5 Riesgos

| ID | Riesgo | Prob. | Impacto | Mitigación | Dueño | Estado |
|---|---|---|---|---|---|---|
| R-02 (PLT-05) | Sin proveedor de nube confirmado | Alta | Alto | Decisión de ADR-002/006 pendiente | Líder técnico | Abierto |

## 6 Decision y aprobacion

Decision: NO READY

Condiciones pendientes:
- [ ] DEP-06 (object storage) sin fecha comprometida, misma causa raíz que FT-ATC-05
- [ ] G3 no `approved`
- [ ] Estimación sin confirmar por el equipo

| Rol | Nombre | Fecha | Firma |
|---|---|---|---|
| Product Owner (aprueba) | | | |
| Lider tecnico (consultivo) | | | |
| QA (consultivo) | | | |
| UX (consultivo) | | | |

Generado por IA: actualizado con el detalle del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`) — Revisado por: pendiente
