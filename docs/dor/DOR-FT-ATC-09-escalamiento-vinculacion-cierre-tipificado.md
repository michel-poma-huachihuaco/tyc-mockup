---
id: "DOR-FT-ATC-09"
tipo: dor
titulo: "Definition of Ready (G4) - FT-ATC-09 Escalamiento, vinculación y cierre tipificado"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "[Product Owner]"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-09", "EP-ATC-04", "AYB-0001"]
tags: [dor, plt-05, g4]
---

# PLT-05 - Definition of Ready (G4) - FT-ATC-09 Escalamiento, vinculación y cierre tipificado

Va en `docs/dor/DOR-FT-ATC-09-escalamiento-vinculacion-cierre-tipificado.md`.

| Item evaluado | Product Owner | Lider tecnico |
|---|---|---|
| EP-ATC-04 / FT-ATC-09 Escalamiento, vinculación y cierre tipificado | Eddie Huamaní | [por asignar] |
| **Fecha de revision** | **Sprint / release destino** | **Resultado** |
| 2026-10-16 | Iteración 2 (26-30 oct 2026) · v1.0 | NO READY |

## 1 Checklist de G4

| # | Criterio | Cumple | Evidencia |
|---|---|---|---|
| 1 | Valor claro | [x] | HU-ATC-023, 024, 025 |
| 2 | Gherkin verificable | [x] | HU-ATC-023, 024, 025 |
| 3 | Reglas explícitas | [x] | RN-SVC-017, 018, 019, 020 |
| 4 | G2 si `ui: true` | [ ] | G2 no existe |
| 5 | G3 si aplica | [ ] | ADR-001, 002, 006; G3 en `draft` |
| 6 | Dependencias desbloqueadas | [ ] | DEP-06 (GLI, custodia legal) sin fecha comprometida |
| 7 | Técnicas y de datos | [ ] | Los "8 estados homologados de cierre" fueron modelados como provisionales en `docs/datos/estados.md`, pendientes de confirmar con Legal |
| 8 | TC iniciales QA | [ ] | Verificar test-plan.md |
| 9 | Estimada por el equipo | [ ] | 12 h de producto, sin confirmar |
| 10 | Cabe en un sprint | [x] | Sí |
| IA | Revisión humana | [ ] | Pendiente |

## 2 Dependencias

| ID | Dependencia | Tipo | Bloquea a | Responsable | Fecha | Estado |
|---|---|---|---|---|---|---|
| DEP-06 | Repositorio Legal Controlado (GLI) para custodia de originales | Técnica/Legal | HU-ATC-025 | Líder técnico | sin fecha en el PDF | Pendiente |

## 3 Modelado

- `docs/datos/estados.md`: 8 estados de cierre **provisionales** (nombres inventados a falta de catálogo oficial, hallazgo del agente de F4) — requiere confirmación de Legal antes de G4

## 4 Arquitectura

- ADR: ADR-001, ADR-002, ADR-006 (custodia en object storage — depende de decisión de nube pendiente)

## 5 Riesgos

| ID | Riesgo | Prob. | Impacto | Mitigación | Dueño | Estado |
|---|---|---|---|---|---|---|
| R-02 (PLT-05) | Sin proveedor de nube confirmado para GLI/custodia | Alta | Alto | Decisión de ADR-006 pendiente | Líder técnico | Abierto |

## 6 Decision y aprobacion

Decision: NO READY

Condiciones pendientes:
- [ ] DEP-06 (GLI) sin fecha comprometida
- [ ] Los 8 estados de cierre son provisionales — Legal debe confirmar el catálogo oficial antes de construir
- [ ] P-01 y P-02 de FT-ATC-09 (umbrales de escalamiento, criterio de vinculación) bloquean G4
- [ ] G3 no `approved`

| Rol | Nombre | Fecha | Firma |
|---|---|---|---|
| Product Owner (aprueba) | | | |
| Lider tecnico (consultivo) | | | |
| QA (consultivo) | | | |
| UX (consultivo) | | | |

Generado por IA: documento completo — Revisado por: pendiente
