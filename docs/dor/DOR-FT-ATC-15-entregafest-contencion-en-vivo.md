---
id: "DOR-FT-ATC-15"
tipo: dor
titulo: "Definition of Ready (G4) - FT-ATC-15 EntregaFest: contención en vivo"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "[Product Owner]"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-15", "EP-ATC-08", "AYB-0001"]
tags: [dor, plt-05, g4]
---

# PLT-05 - Definition of Ready (G4) - FT-ATC-15 EntregaFest: contención en vivo

Va en `docs/dor/DOR-FT-ATC-15-entregafest-contencion-en-vivo.md`.

| Item evaluado | Product Owner | Lider tecnico |
|---|---|---|
| EP-ATC-08 / FT-ATC-15 EntregaFest | Eddie Huamaní | [por asignar] |
| **Fecha de revision** | **Sprint / release destino** | **Resultado** |
| 2026-10-16 | Iteración 2 (26-30 oct 2026) · v1.0 | NO READY |

## 1 Checklist de G4

| # | Criterio | Cumple | Evidencia |
|---|---|---|---|
| 1 | Valor claro | [x] | HU-ATC-037, 038, 039 |
| 2 | Gherkin verificable | [x] | HU-ATC-037, 038, 039 |
| 3 | Reglas explícitas | [x] | RN-SVC-028, 029, 030 |
| 4 | G2 si `ui: true` | [ ] | Registro desde tablet en vivo; G2 no existe |
| 5 | G3 si aplica | [ ] | ADR-001; G3 en `draft` |
| 6 | Dependencias desbloqueadas | [ ] | "Modelo de casos del evento" (día 1 de desarrollo), todavía no construido |
| 7 | Técnicas y de datos | [x] | `SVC_EVENT_SENSITIVE_CASE` en diccionario (modelada en esta sesión) |
| 8 | TC iniciales QA | [ ] | Verificar test-plan.md |
| 9 | Estimada por el equipo | [ ] | 6 h de producto, sin confirmar |
| 10 | Cabe en un sprint | [x] | Sí, talla S |
| IA | Revisión humana | [ ] | Pendiente |

## 2 Dependencias

| ID | Dependencia | Tipo | Bloquea a | Responsable | Fecha | Estado |
|---|---|---|---|---|---|---|
| DEP-N/A | Modelo de casos del evento EntregaFest, previsto como parte de la base técnica del día 1 de desarrollo | Técnica | HU-ATC-037, 038, 039 | Líder técnico | 2026-10-19 (día 1, según el DoR PDF) | Pendiente — todavía no construido a la fecha de este borrador |

## 3 Modelado

- `SVC_EVENT_SENSITIVE_CASE` en `docs/datos/diccionario.md`

## 4 Arquitectura

- ADR: ADR-001 (sin ADR específico de EntregaFest; hereda las reglas de Eje 3 del gate de FT-ATC-07)

## 5 Riesgos

| ID | Riesgo | Prob. | Impacto | Mitigación | Dueño | Estado |
|---|---|---|---|---|---|---|
| R-01 (PLT-05) | Plan sin holgura (227h/240h); esta feature es talla S de baja prioridad (Podría) | Alta | Alto | Alcance flexible definido de antemano | PO | Abierto |

## 6 Decision y aprobacion

Decision: NO READY

Condiciones pendientes:
- [ ] El modelo de casos del evento, previsto para el día 1 de desarrollo, no existe todavía
- [ ] P-02 de FT-ATC-15 (funciona sin conexión en el recinto) bloquea G4
- [ ] G3 no `approved`

| Rol | Nombre | Fecha | Firma |
|---|---|---|---|
| Product Owner (aprueba) | | | |
| Lider tecnico (consultivo) | | | |
| QA (consultivo) | | | |
| UX (consultivo) | | | |

Generado por IA: documento completo — Revisado por: pendiente
