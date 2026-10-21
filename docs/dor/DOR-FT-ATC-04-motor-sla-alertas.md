---
id: "DOR-FT-ATC-04"
tipo: dor
titulo: "Definition of Ready (G4) - FT-ATC-04 Motor SLA y alertas"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-04", "EP-ATC-02", "AYB-0001"]
tags: [dor, plt-05, g4]
---

# PLT-05 - Definition of Ready (G4) - FT-ATC-04 Motor SLA y alertas

Va en `docs/dor/DOR-FT-ATC-04-motor-sla-alertas.md`.

| Item evaluado | Product Owner | Lider tecnico |
|---|---|---|
| EP-ATC-02 / FT-ATC-04 Motor SLA y alertas | Eddie Huamaní | [por asignar] |
| **Fecha de revision** | **Sprint / release destino** | **Resultado** |
| 2026-10-16 | Iteración 1 (19-23 oct 2026) · v1.0 | NO READY |

## 1 Checklist de G4

| # | Criterio | Cumple | Evidencia |
|---|---|---|---|
| 1 | Valor claro | [x] | HU-ATC-003, 010, 011, 029 |
| 2 | Gherkin verificable | [x] | HU-ATC-003, 010, 011, 029 |
| 3 | Reglas explícitas | [x] | RN-SVC-001, 002, 003, 007, 008, 025 |
| 4 | G2 si `ui: true` | [ ] | G2 no existe |
| 5 | G3 si aplica | [ ] | ADR-001, 005 (jobs batch idempotentes); G3 en `draft` |
| 6 | Dependencias desbloqueadas | [ ] | DEP-03 (matriz SLA) y DEP-04 (calendario feriados), ninguna resuelta |
| 7 | Técnicas y de datos | [x] | `MAE_SLA_POLICY`, `SLA_BREACH_ALERT` en diccionario |
| 8 | TC iniciales QA | [ ] | Verificar test-plan.md |
| 9 | Estimada por el equipo | [ ] | 17 h de producto, sin confirmar |
| 10 | Cabe en un sprint | [x] | Sí, ajustado |
| IA | Revisión humana | [ ] | Pendiente |

### Historias evaluadas en esta funcionalidad (artefacto PLT-04 v1.2)

| HU | Título (PLT-04) | Escenarios Gherkin | Horas | Desarrollador | Fechas | Condición en tablero (PLT-05) |
|---|---|---|---|---|---|---|
| HU-ATC-003 | Congelar el SLA del ticket al abrirlo | 4 (CA-01, CA-02, CA-03, CA-04) | 6 h | Dev 2 (Jesús) | 2026-10-21 → 2026-10-21 | CON CONDICIONES (DEP-03 matriz provisional al 20-oct) |
| HU-ATC-010 | Recibir una sola alerta por incumplimiento de SLA | 3 (CA-01, CA-02, CA-03) | 5 h | Dev 2 (Jesús) | 2026-10-21 → 2026-10-22 | CON CONDICIONES (DEP-03 matriz provisional al 20-oct) |
| HU-ATC-011 | Reabrir un ticket con un nuevo compromiso sin borrar el original | 2 (CA-01, CA-02) | 3 h | Dev 2 (Jesús) | 2026-10-22 → 2026-10-22 | CON CONDICIONES (DEP-03 matriz provisional al 20-oct) |
| HU-ATC-029 | Medir el cierre end-to-end de la experiencia | 2 (CA-01, CA-02) | 3 h | Dev 2 (Jesús) | 2026-10-23 → 2026-10-23 | CON CONDICIONES (DEP-03 matriz provisional al 20-oct) |

## 2 Dependencias

| ID | Dependencia | Tipo | Bloquea a | Responsable | Fecha | Estado |
|---|---|---|---|---|---|---|
| DEP-03 | Matriz SLA provisional firmada | Interna/Negocio | HU-ATC-003, 010, 011, 029 | Gerencia ATC | 2026-10-20 | Pendiente |
| DEP-04 | Calendario de feriados por geografía | Interna | mismas HU | Líder técnico | sin fecha comprometida en el PDF | Pendiente |

## 3 Modelado

- `MAE_SLA_POLICY`, `MAE_TIME`, `MAE_HOLIDAY`, `SLA_BREACH_ALERT` en `docs/datos/diccionario.md`

## 4 Arquitectura

- ADR: ADR-001, ADR-005 (jobs batch idempotentes para SLA — aplica directo a esta feature)

## 5 Riesgos

| ID | Riesgo | Prob. | Impacto | Mitigación | Dueño | Estado |
|---|---|---|---|---|---|---|
| R-03 (PLT-05) | Matriz SLA y plazos sin definir al iniciar (21-oct) | Alta | Alto | Matriz provisional parametrizable firmada antes del 21-oct | Gerencia ATC | Abierto |

## 6 Decision y aprobacion

Decision: NO READY

Condiciones pendientes:
- [ ] DEP-03 (matriz SLA, fecha comprometida 2026-10-20) no resuelta a la fecha de este borrador
- [ ] DEP-04 (calendario feriados) sin fecha comprometida — criterio 6 no cumple por partida doble
- [ ] P-01 y P-02 de FT-ATC-04 (pausa en PENDING_CUSTOMER, horario hábil por sede) bloquean G4, fecha límite 2026-10-21 ya fijada pero no resuelta hoy
- [ ] G3 no `approved`

| Rol | Nombre | Fecha | Firma |
|---|---|---|---|
| Product Owner (aprueba) | | | |
| Lider tecnico (consultivo) | | | |
| QA (consultivo) | | | |
| UX (consultivo) | | | |

Generado por IA: actualizado con el detalle del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`) — Revisado por: pendiente
