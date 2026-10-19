---
id: "DOR-FT-ATC-14"
tipo: dor
titulo: "Definition of Ready (G4) - FT-ATC-14 Torre de Control CX"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-14", "EP-ATC-07", "AYB-0001"]
tags: [dor, plt-05, g4]
---

# PLT-05 - Definition of Ready (G4) - FT-ATC-14 Torre de Control CX

Va en `docs/dor/DOR-FT-ATC-14-torre-control-cx.md`.

| Item evaluado | Product Owner | Lider tecnico |
|---|---|---|
| EP-ATC-07 / FT-ATC-14 Torre de Control CX | Eddie Huamaní | [por asignar] |
| **Fecha de revision** | **Sprint / release destino** | **Resultado** |
| 2026-10-16 | Iteración 2 (26-30 oct 2026) · v1.0 | NO READY |

## 1 Checklist de G4

| # | Criterio | Cumple | Evidencia |
|---|---|---|---|
| 1 | Valor claro | [x] | HU-ATC-030, 031, 032 |
| 2 | Gherkin verificable | [x] | HU-ATC-030, 031, 032 |
| 3 | Reglas explícitas | [x] | RN-SVC-026 |
| 4 | G2 si `ui: true` | [ ] | HU-ATC-030/031 son pantalla (tablero/informe); G2 no existe |
| 5 | G3 si aplica | [ ] | ADR-001, 003; G3 en `draft` |
| 6 | Dependencias desbloqueadas | [ ] | DEP-10 (KPI Engine) sin fecha comprometida |
| 7 | Técnicas y de datos | [x] | Lectura agregada (lado Mongo, CQRS) descrita en `docs/datos/diccionario.md` |
| 8 | TC iniciales QA | [ ] | Verificar test-plan.md |
| 9 | Estimada por el equipo | [ ] | 13 h de producto, sin confirmar |
| 10 | Cabe en un sprint | [x] | Sí |
| IA | Revisión humana | [ ] | Pendiente |

### Historias evaluadas en esta funcionalidad (artefacto PLT-04 v1.2)

| HU | Título (PLT-04) | Escenarios Gherkin | Horas | Desarrollador | Fechas | Condición en tablero (PLT-05) |
|---|---|---|---|---|---|---|
| HU-ATC-030 | Monitorear en tiempo real y corregir antes del incumplimiento | 2 (CA-01, CA-02) | 6 h | Dev 3 (Michel) | 2026-10-26 → 2026-10-27 | CON CONDICIONES (DEP-10) |
| HU-ATC-031 | Generar el informe diario y el quincenal | 2 (CA-01, CA-02) | 4 h | Dev 3 (Michel) | 2026-10-27 → 2026-10-27 | CON CONDICIONES (DEP-10) |
| HU-ATC-032 | Auditar registros paralelos del dato de cliente | 2 (CA-01, CA-02) | 3 h | Dev 3 (Michel) | 2026-10-27 → 2026-10-28 | CON CONDICIONES (DEP-10) |

## 2 Dependencias

| ID | Dependencia | Tipo | Bloquea a | Responsable | Fecha | Estado |
|---|---|---|---|---|---|---|
| DEP-10 | KPI Engine: fuente de NPS y métricas consolidadas | Externa/Técnica | HU-ATC-030, 031 | Líder técnico | sin fecha comprometida en el PDF | Pendiente |

## 3 Modelado

- Proyección Mongo (CQRS) de tickets/SLA/NPS para el tablero, en `docs/datos/diccionario.md`

## 4 Arquitectura

- ADR: ADR-001, ADR-003 (auditoría quincenal de registros paralelos usa la misma regla de "no copiar cliente")

## 5 Riesgos

| ID | Riesgo | Prob. | Impacto | Mitigación | Dueño | Estado |
|---|---|---|---|---|---|---|
| R-02 (PLT-05) | Integración con KPI Engine sin fecha comprometida | Alta | Alto | Confirmar contrato con el equipo del KPI Engine | Líder técnico | Abierto |

## 6 Decision y aprobacion

Decision: NO READY

Condiciones pendientes:
- [ ] DEP-10 sin fecha comprometida
- [ ] P-02 de FT-ATC-14 (qué frecuencia cuenta como "tiempo real") bloquea G4
- [ ] G3 no `approved`; G2 no existe para HU-ATC-030/031 si son `ui: true`

| Rol | Nombre | Fecha | Firma |
|---|---|---|---|
| Product Owner (aprueba) | | | |
| Lider tecnico (consultivo) | | | |
| QA (consultivo) | | | |
| UX (consultivo) | | | |

Generado por IA: actualizado con el detalle del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`) — Revisado por: pendiente
