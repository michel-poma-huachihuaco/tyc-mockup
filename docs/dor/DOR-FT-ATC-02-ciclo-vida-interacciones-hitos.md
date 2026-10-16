---
id: "DOR-FT-ATC-02"
tipo: dor
titulo: "Definition of Ready (G4) - FT-ATC-02 Ciclo de vida, interacciones e hitos"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "[Product Owner]"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-02", "EP-ATC-01", "AYB-0001"]
tags: [dor, plt-05, g4]
---

# PLT-05 - Definition of Ready (G4) - FT-ATC-02 Ciclo de vida, interacciones e hitos

Va en `docs/dor/DOR-FT-ATC-02-ciclo-vida-interacciones-hitos.md`.

| Item evaluado | Product Owner | Lider tecnico |
|---|---|---|
| EP-ATC-01 / FT-ATC-02 Ciclo de vida, interacciones e hitos | Eddie Huamaní | [por asignar] |
| **Fecha de revision** | **Sprint / release destino** | **Resultado** |
| 2026-10-16 | Iteración 1 (19-23 oct 2026) · v1.0 | NO READY |

## 1 Checklist de G4

| # | Criterio de G4 | Cumple | Evidencia / responsable |
|---|---|---|---|
| 1 | Historia con valor claro | [x] | HU-ATC-004, 005, 006 |
| 2 | Gherkin verificable | [x] | HU-ATC-004, 005, 006 |
| 3 | Reglas de negocio explícitas | [x] | RN-SVC-002, 006, 007, 012, 023 |
| 4 | G2 cerrado si `ui: true` | [ ] | HU-ATC-004 es `ui: true`; G2 no existe para ninguna feature |
| 5 | G3 cerrado si aplica | [ ] | ADR-001, 002, 007 aplican; G3 en `draft` |
| 6 | Dependencias desbloqueadas | [ ] | DEP-02 (NEXUS, roles) comprometida para el 19-oct, no resuelta |
| 7 | Consideraciones técnicas y de datos | [x] | `docs/datos/diccionario.md` (SVC_TICKET_ESTADO_HISTORIAL, INTERACTION) |
| 8 | Casos de prueba iniciales (QA) | [ ] | Verificar test-plan.md al momento de leer |
| 9 | Estimada por el equipo | [ ] | 13 h de producto, sin confirmar por el equipo (acuerdo 1, 16-oct) |
| 10 | Cabe en un sprint | [x] | Sí |
| IA | Revisión humana registrada | [ ] | Pendiente |

## 2 Dependencias

| ID | Dependencia | Tipo | Bloquea a | Responsable | Fecha comprometida | Estado |
|---|---|---|---|---|---|---|
| DEP-02 | NEXUS: identidad de colaboradores, SSO y roles | Externa/Técnica | HU-ATC-004, 005, 006 | Líder técnico | 2026-10-19 | Pendiente |

## 3 Modelado (datos y proceso)

- Estados: `docs/datos/estados.md` — máquina de 7 estados del ticket (RF-SVC-004)
- Diccionario: `SVC_TICKET_ESTADO_HISTORIAL`, `INTERACTION` en `docs/datos/diccionario.md`

## 4 Arquitectura

- Contrato: `PATCH /api/v1/tickets/{id}/estado` en `docs/arquitectura/aybar-atc.openapi.yaml`
- ADR: ADR-001, ADR-002 (bitácoras append-only HMAC), ADR-007

## 5 Riesgos

| ID | Riesgo | Prob. | Impacto | Mitigación | Dueño | Estado |
|---|---|---|---|---|---|---|
| R-02 (PLT-05) | APIs externas (NEXUS) no disponibles en 2 semanas | Alta | Alto | Contrato de interfaz y simulador | Líder técnico | Abierto |

Nota: ver en DOR-FT-ATC-01 la aclaración sobre la colisión de IDs entre los riesgos del PDF del DoR (PLT-05) y los del roadmap (PLT-01) — aplica igual aquí.

## 6 Decision y aprobacion

Decision: NO READY

Condiciones pendientes:
- [ ] DEP-02 (NEXUS roles) sin resolver
- [ ] **Bloqueante crítico nuevo**: contradicción sin resolver entre el ciclo de vida fijo de 7 estados de esta feature (`RF-SVC-004`) y el flujo configurable por área de `FT-ATC-18`/`HU-ATC-043` — ver pregunta P-03 de `FT-ATC-02` y `docs/analisis/decisiones.md` D-09. No se puede construir el endpoint de cambio de estado sin que el PO y el TL resuelvan esto primero
- [ ] G3 no `approved`
- [ ] Estimación sin confirmar por el equipo

| Rol | Nombre | Fecha | Firma |
|---|---|---|---|
| Product Owner (aprueba) | | | |
| Lider tecnico (consultivo) | | | |
| QA (consultivo) | | | |
| UX (consultivo) | | | |

Generado por IA: documento completo — Revisado por: pendiente
