---
id: "FT-ATC-04"
tipo: feature
titulo: "Motor SLA y alertas"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["EP-ATC-02", "AYB-0001"]
tags: [feature, plt-03]
---

# PLT-03 - FT-ATC-04 Motor SLA y alertas

Va en `docs/features/FT-ATC-04-motor-sla-alertas.md`.

| ID | Nombre | Epica padre |
|---|---|---|
| FT-ATC-04 | Motor SLA y alertas | EP-ATC-02 |
| **Product Owner** | **Prioridad (MoSCoW)** | **Estado** |
| Eddie Huamaní | Debe | Borrador · requiere DEP-03 al 21-oct |
| **Release objetivo** | **Estimacion** | **Fecha / Version** |
| v1.0 - 30-oct-2026 (Dev 2 · mié 21-oct · Jesús) | 17 h (4 HU) | 2026-10-19 / v0.2 |

## 1 Descripción y valor

Selecciona la política SLA vigente al abrir el ticket, congela los vencimientos en horas o días hábiles con feriados por geografía, alerta una sola vez por tipo y ciclo, y mide el cierre end-to-end. Da compromisos de tiempo estables y auditables, con alertas oportunas sin ruido.

## 2 Requerimientos funcionales

| ID | Requerimiento | Prioridad (MoSCoW) | Origen | Criterio de verificación | Estado |
|---|---|---|---|---|---|
| RF-SVC-003 | El sistema debe elegir la política SLA vigente por precedencia y congelar los vencimientos de 1.ª respuesta y resolución al abrir el ticket. | Debe | Job batch de ATC | Vencimientos no cambian al editar la política | Propuesto |
| RF-SVC-010 | El sistema debe detectar por job FIRST_RESPONSE_OVERDUE y RESOLUTION_OVERDUE y alertar una sola vez por tipo y ciclo. | Debe | Supervisor ATC | UNIQUE (Ticket, Tipo, Ciclo) | Propuesto |
| RF-SVC-011 | El sistema debe soportar la reapertura con ReopenCount y un nuevo vencimiento calculado con la política vigente, conservando el original. | Debe | Supervisor ATC | ResolutionDueDateTime original intacto | Propuesto |
| RF-SVC-029 | El sistema debe medir el cierre end-to-end y alertar al acercarse a 72 horas hábiles sin escalamiento o al plazo del eje si hay escalamiento. | Debe | Gestor de tickets | Riesgo marcado a las 72 h hábiles | Propuesto |

## 3 Requerimientos no funcionales

| ID | Categoria | Requerimiento | Metrica / umbral |
|---|---|---|---|
| RNF-REN-003 | Rendimiento | Matriz objetivo de SLA por tipo y prioridad | cumplimiento_sla: por definir (DEP-03) |
| RNF-REN-005 | Rendimiento | Cierre end-to-end de la experiencia sin escalamiento | tiempo_cierre_ticket_sin_escalamiento ≤ 72 h hábiles; con escalamiento, plazo del eje |
| RNF-AUD-004 | Auditoría | Cinco bitácoras append-only firmadas | hash_mismatch: 0 en el job de auditoría |

## 4 Reglas de negocio

| ID | Regla | Fuente |
|---|---|---|
| RN-SVC-001 | Precedencia SLA: fila específica (tipo+prioridad) precede a la genérica | Negocio |
| RN-SVC-002 | Compromisos congelados: no se recalculan si la política cambia después | Negocio |
| RN-SVC-003 | Días hábiles únicos: BUSINESS_HOURS/BUSINESS_DAYS contra MAE_TIME.IsWeekend + MAE_HOLIDAY por geografía | Negocio |
| RN-SVC-007 | Reapertura con nuevo compromiso | Negocio |
| RN-SVC-008 | Alerta única por ciclo: UNIQUE (TicketID, BreachTypeID, ReopenCycleNumber) | Negocio |
| RN-SVC-025 | Cierre end-to-end en 72 horas hábiles | Negocio |

## 5 Trazabilidad

| RF | HU (PLT-04 v1.2) | Horas / Asignación | Dependencia | Riesgo |
|---|---|---|---|---|
| RF-SVC-003 | HU-ATC-003 — Congelar el SLA del ticket al abrirlo | 6 h · Dev 2 (Jesús) (2026-10-21 → 2026-10-21) | DEP-03 (Decisión de negocio: matriz SLA por tipo y prioridad y plazos de línea de la Mesa SGD (RNF-REN-003)), DEP-04 (Calendario MAE_TIME + MAE_HOLIDAY por geografía) | R-01 |
| RF-SVC-010 | HU-ATC-010 — Recibir una sola alerta por incumplimiento de SLA | 5 h · Dev 2 (Jesús) (2026-10-21 → 2026-10-22) | HU-ATC-003 | R-01 |
| RF-SVC-011 | HU-ATC-011 — Reabrir un ticket con un nuevo compromiso sin borrar el original | 3 h · Dev 2 (Jesús) (2026-10-22 → 2026-10-22) | HU-ATC-010 | R-01 |
| RF-SVC-029 | HU-ATC-029 — Medir el cierre end-to-end de la experiencia | 3 h · Dev 2 (Jesús) (2026-10-23 → 2026-10-23) | HU-ATC-003 | R-01 |

## 6 Fuera de alcance

- Definir los tiempos de la matriz SLA (decisión de negocio, DEP-03).
- SLA de línea de casos sensibles (FT-ATC-09).

## 7 Preguntas abiertas

| # | Pregunta | Dueño | Fecha limite | Bloquea G4 |
|---|---|---|---|---|
| P-01 | ¿Se pausa el SLA en PENDING_CUSTOMER? | PO | 2026-10-21 | Sí |
| P-02 | ¿Cuál es el horario hábil por sede? | PO | 2026-10-21 | Sí |
| P-03 | ¿Por qué canal llegan las alertas (correo, notificación en consola)? | PO | por definir | No |

Generado por IA: actualizado con el detalle del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`) — Revisado por: pendiente
