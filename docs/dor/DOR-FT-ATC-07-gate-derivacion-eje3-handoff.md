---
id: "DOR-FT-ATC-07"
tipo: dor
titulo: "Definition of Ready (G4) - FT-ATC-07 Gate de derivación a Eje 3 y handoff"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "[Product Owner]"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-07", "EP-ATC-04", "AYB-0001"]
tags: [dor, plt-05, g4]
---

# PLT-05 - Definition of Ready (G4) - FT-ATC-07 Gate de derivación a Eje 3 y handoff

Va en `docs/dor/DOR-FT-ATC-07-gate-derivacion-eje3-handoff.md`.

| Item evaluado | Product Owner | Lider tecnico |
|---|---|---|
| EP-ATC-04 / FT-ATC-07 Gate de derivación a Eje 3 y handoff | Eddie Huamaní | [por asignar] |
| **Fecha de revision** | **Sprint / release destino** | **Resultado** |
| 2026-10-16 | Iteración 2 (26-30 oct 2026) · v1.0 | NO READY |

## 1 Checklist de G4

| # | Criterio | Cumple | Evidencia |
|---|---|---|---|
| 1 | Valor claro | [x] | HU-ATC-026, 027, 028 |
| 2 | Gherkin verificable | [x] | HU-ATC-026, 027, 028 |
| 3 | Reglas explícitas | [x] | RN-SVC-021, 022, 024 (gates no compensables) |
| 4 | G2 si `ui: true` | [ ] | G2 no existe |
| 5 | G3 si aplica | [ ] | ADR-001, 003, 007; G3 en `draft` |
| 6 | Dependencias desbloqueadas | [ ] | DEP-01 (SIGDA/TAXON, 19-oct) y DEP-08 (Cobranza, 20-oct) sin resolver |
| 7 | Técnicas y de datos | [x] | Entidades de caso sensible / handoff en `docs/datos/diccionario.md` |
| 8 | TC iniciales QA | [ ] | Verificar test-plan.md |
| 9 | Estimada por el equipo | [ ] | 9 h de producto, sin confirmar |
| 10 | Cabe en un sprint | [x] | Sí |
| IA | Revisión humana | [ ] | Pendiente |

## 2 Dependencias

| ID | Dependencia | Tipo | Bloquea a | Responsable | Fecha | Estado |
|---|---|---|---|---|---|---|
| DEP-01 | API SIGDA/TAXON | Externa | HU-ATC-026, 027, 028 | Líder técnico | 2026-10-19 | Pendiente |
| DEP-08 | Cobranza: estado de cuenta, historial de pagos | Externa | HU-ATC-027 (handoff) | Líder técnico | 2026-10-20 | Pendiente |

## 3 Modelado

- Entidades de caso sensible y handoff en `docs/datos/diccionario.md` y `docs/datos/er.md`

## 4 Arquitectura

- ADR: ADR-001, ADR-003 (consulta SIGDA/TAXON por API), ADR-007 (adaptador + simulador)

## 5 Riesgos

| ID | Riesgo | Prob. | Impacto | Mitigación | Dueño | Estado |
|---|---|---|---|---|---|---|
| R-02 (PLT-05) | APIs externas (SIGDA/TAXON, Cobranza) no disponibles en 2 semanas | Alta | Alto | Contratos de interfaz y simuladores el día 1 | Líder técnico | Abierto |

## 6 Decision y aprobacion

Decision: NO READY

Condiciones pendientes:
- [ ] DEP-01 y DEP-08 sin resolver
- [ ] P-01 de FT-ATC-07 (quién retira una señal de conflicto marcada por error) bloquea G4
- [ ] G3 no `approved`

| Rol | Nombre | Fecha | Firma |
|---|---|---|---|
| Product Owner (aprueba) | | | |
| Lider tecnico (consultivo) | | | |
| QA (consultivo) | | | |
| UX (consultivo) | | | |

Generado por IA: documento completo — Revisado por: pendiente
