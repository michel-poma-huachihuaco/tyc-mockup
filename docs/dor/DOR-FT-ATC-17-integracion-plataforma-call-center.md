---
id: "DOR-FT-ATC-17"
tipo: dor
titulo: "Definition of Ready (G4) - FT-ATC-17 Integración con la plataforma del call center"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-17", "EP-ATC-10", "AYB-0001"]
tags: [dor, plt-05, g4]
---

# PLT-05 - Definition of Ready (G4) - FT-ATC-17 Integración con la plataforma del call center

Va en `docs/dor/DOR-FT-ATC-17-integracion-plataforma-call-center.md`.

| Item evaluado | Product Owner | Lider tecnico |
|---|---|---|
| EP-ATC-10 / FT-ATC-17 Integración call center | Eddie Huamaní | [por asignar] |
| **Fecha de revision** | **Sprint / release destino** | **Resultado** |
| 2026-10-16 | Iteración 1 (19-23 oct 2026) · v1.0 | NO READY |

## 1 Checklist de G4

| # | Criterio | Cumple | Evidencia |
|---|---|---|---|
| 1 | Valor claro | [x] | HU-ATC-042 |
| 2 | Gherkin verificable | [x] | HU-ATC-042 |
| 3 | Reglas explícitas | [x] | RN-SVC-005 |
| 4 | G2 si `ui: true` | [ ] | Screen-pop es pantalla; G2 no existe |
| 5 | G3 si aplica | [ ] | ADR-001, 007; G3 en `draft` |
| 6 | Dependencias desbloqueadas | [ ] | DEP-11 (plataforma call center) marcada "por evaluar" en el PDF — ni siquiera tiene fecha propuesta |
| 7 | Técnicas y de datos | [x] | `INTERACTION` (con grabación) en diccionario |
| 8 | TC iniciales QA | [ ] | Verificar test-plan.md |
| 9 | Estimada por el equipo | [ ] | 5 h de producto, sin confirmar |
| 10 | Cabe en un sprint | [x] | Sí, talla S |
| IA | Revisión humana | [ ] | Pendiente |

### Historias evaluadas en esta funcionalidad (artefacto PLT-04 v1.2)

| HU | Título (PLT-04) | Escenarios Gherkin | Horas | Desarrollador | Fechas | Condición en tablero (PLT-05) |
|---|---|---|---|---|---|---|
| HU-ATC-042 | Atender la llamada con la ficha del cliente y registrarla en el ticket | 3 (CA-01, CA-02, CA-03) | 5 h | Dev 4 (Daniel) | 2026-10-22 → 2026-10-22 | CON CONDICIONES (DEP-11 call center (por evaluar)) |

## 2 Dependencias

| ID | Dependencia | Tipo | Bloquea a | Responsable | Fecha | Estado |
|---|---|---|---|---|---|---|
| DEP-11 | Plataforma del call center: API/CTI para screen pop y grabación | Externa/Técnica | HU-ATC-042 | Líder técnico | 2026-10-19 (comprometida en el roadmap), pero el Anexo del DoR la marca "por evaluar" | Pendiente — la fecha y la viabilidad misma de la dependencia están en duda |

## 3 Modelado

- `INTERACTION` extendida con grabación en `docs/datos/diccionario.md`

## 4 Arquitectura

- ADR: ADR-001, ADR-007

## 5 Riesgos

| ID | Riesgo | Prob. | Impacto | Mitigación | Dueño | Estado |
|---|---|---|---|---|---|---|
| R-02 (PLT-05) | Plataforma de call center sin API/CTI confirmada (el propio DoR la marca "por evaluar") | Alta | Alto | Confirmar proveedor y versión antes de comprometer fecha | Líder técnico | Abierto |

## 6 Decision y aprobacion

Decision: NO READY

Condiciones pendientes:
- [ ] DEP-11 "por evaluar": ni siquiera está confirmado que la integración sea técnicamente viable en el plazo
- [ ] P-01 y P-02 de FT-ATC-17 (proveedor/versión, API o CTI) bloquean G4 y son prerequisito de la propia DEP-11
- [ ] G3 no `approved`

| Rol | Nombre | Fecha | Firma |
|---|---|---|---|
| Product Owner (aprueba) | | | |
| Lider tecnico (consultivo) | | | |
| QA (consultivo) | | | |
| UX (consultivo) | | | |

Generado por IA: actualizado con el detalle del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`) — Revisado por: pendiente
