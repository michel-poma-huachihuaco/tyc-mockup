---
id: "FT-ATC-04"
tipo: feature
titulo: "Motor SLA y alertas"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["EP-ATC-02", "HU-ATC-003", "HU-ATC-010", "HU-ATC-011", "HU-ATC-029"]
tags: [feature, plt-03, ui]
---

# PLT-03 - FT-ATC-04 Motor SLA y alertas

| ID | Nombre | Épica padre |
|---|---|---|
| FT-ATC-04 | Motor SLA y alertas | EP-ATC-02 Enrutamiento, SLA y alertas |
| **Product Owner** | **Prioridad (MoSCoW)** | **Estado** |
| Eddie Huamaní (PO) | Debe | Refinamiento · requiere DEP-03 al 21-oct |
| **Release objetivo** | **Estimación** | **Fecha / Versión** |
| v1.0 · Etapa 1 · 03-nov-2026 | L · 17 h · 17 h de desarrollo · Dev 2 | 16-oct-2026 · v1.3 |
| **Desarrollador** | **Ventana (PLT-01)** | **Predecesora** |
| Dev 2 (Jesús) | 22-oct-2026 → 26-oct-2026 | — |

## 1 Descripción y valor

Selecciona la política SLA vigente al abrir el ticket, congela los vencimientos en horas o días hábiles con feriados por geografía, alerta una sola vez por tipo y ciclo, recalcula solo en reaperturas y mide el cierre end-to-end.

**Beneficio:** Compromisos de tiempo estables y auditables, y alertas oportunas sin ruido.

**Usuarios:** Job batch de ATC · Supervisor ATC · Coordinador CX

## 2 Requerimientos funcionales

| ID | Requerimiento | Prioridad (MoSCoW) | Origen | Criterio de verificación | Horas | Predecesora | Estado |
|---|---|---|---|---|---|---|---|
| RF-SVC-003 | El sistema debe elegir la política SLA vigente por precedencia y congelar los vencimientos de 1.ª respuesta y resolución al abrir el ticket. | Debe | PROC-SVC-001 · Job batch de ATC | Vencimientos no cambian al editar la política | 6 | — | Pend. DoR |
| RF-SVC-010 | El sistema debe detectar por job FIRST_RESPONSE_OVERDUE y RESOLUTION_OVERDUE y alertar una sola vez por tipo y ciclo. | Debe | PROC-SVC-004 · Supervisor ATC | UNIQUE (Ticket, Tipo, Ciclo) | 5 | RF-SVC-003 | Pend. DoR |
| RF-SVC-011 | El sistema debe soportar la reapertura con ReopenCount y un nuevo vencimiento calculado con la política vigente, conservando el original. | Debe | PROC-SVC-004 · Supervisor ATC | ResolutionDueDateTime original intacto | 3 | RF-SVC-010 | Pend. DoR |
| RF-SVC-029 | El sistema debe medir el cierre end-to-end y alertar al acercarse a 72 horas hábiles sin escalamiento o al plazo del eje si hay escalamiento. | Debe | PROC-SVC-011 · Gestor de tickets | Riesgo marcado a las 72 h hábiles | 3 | RF-SVC-003 | Pend. DoR |

Ruta crítica: RF-SVC-003 → RF-SVC-010 → RF-SVC-011 (14 h).

## 3 Requerimientos no funcionales

| ID | Categoría | Requerimiento | Métrica / umbral | Prioridad |
|---|---|---|---|---|
| RNF-REN-003 | Rendimiento | Matriz objetivo de SLA por tipo y prioridad | cumplimiento_sla: por definir (DEP-03) | Debería |
| RNF-REN-005 | Rendimiento | Cierre end-to-end de la experiencia sin escalamiento | tiempo_cierre_ticket_sin_escalamiento: menor o igual a 72 horas hábiles sin escalamiento; con escalamiento, el plazo del eje correspondiente | Debería |
| RNF-AUD-004 | Auditoría | Cinco bitácoras append-only firmadas | hash_mismatch: 0 en el job de auditoría | Debe |

## 4 Reglas de negocio

| ID | Regla | Fuente |
|---|---|---|
| RN-SVC-001 | Precedencia SLA. Fila especifica (tipo+prioridad) precede a la generica (PriorityID NULL); máximo una generica activa por tipo (UNIQUEs parciales) | Negocio · Excel 05_Catalogos |
| RN-SVC-002 | Compromisos congelados. FirstResponseDueDateTime y ResolutionDueDateTime se calculan al abrir y NO se recalculan si la política cambia después | Negocio · Excel 05_Catalogos |
| RN-SVC-003 | Días hábiles unicos. BUSINESS_HOURS/BUSINESS_DAYS se resuelven contra MAE_TIME.IsWeekend + MAE_HOLIDAY por geografia del establecimiento, nunca con formula propia del job | Negocio · Excel 05_Catalogos |
| RN-SVC-007 | Reapertura con nuevo compromiso. REOPENED incrementa ReopenCount y calcula ReopenedResolutionDueDateTime con la política vigente al reabrir; el compromiso original no se reescribe | Negocio · Excel 05_Catalogos |
| RN-SVC-008 | Alerta única por ciclo. UNIQUE (TicketID, BreachTypeID, ReopenCycleNumber): cada ciclo alerta una sola vez por tipo de incumplimiento | Negocio · Excel 05_Catalogos |
| RN-SVC-025 | Cierre end-to-end en 72 horas hábiles. El cierre end-to-end del ticket sin escalamiento debe completarse en 72 horas hábiles; si hay escalamiento, aplica el plazo propio del eje correspondiente | Negocio · Excel 05_Catalogos |

## 5 Trazabilidad

| RF | HU | Dependencia | Riesgo |
|---|---|---|---|
| RF-SVC-003 | HU-ATC-003 · Iteración 1 · Dev 2 · jue 22-oct → vie 23-oct | DEP-03 matriz SLA · DEP-04 calendario | R-01 |
| RF-SVC-010 | HU-ATC-010 · Iteración 1 · Dev 2 · vie 23-oct → lun 26-oct | DEP-03 matriz SLA · DEP-04 calendario | R-01 |
| RF-SVC-011 | HU-ATC-011 · Iteración 1 · Dev 2 · lun 26-oct | DEP-03 matriz SLA · DEP-04 calendario | R-01 |
| RF-SVC-029 | HU-ATC-029 · Iteración 1 · Dev 2 · lun 26-oct | DEP-03 matriz SLA · DEP-04 calendario | R-01 |

Cada RF llega a una HU, y cada criterio de la HU a un TC de `docs/pruebas/test-plan.md` (pendiente: lo define QA).

## 6 Fuera de alcance

- Definir los tiempos de la matriz (decisión de negocio); SLA de línea de casos sensibles (FT-ATC-09).

## 7 Preguntas abiertas

| # | Pregunta | Dueño | Fecha límite | Bloquea G4 |
|---|---|---|---|---|
| P-01 | ¿Se pausa el SLA en PENDING_CUSTOMER? ¿Cuál es el horario hábil por sede? ¿Por qué canal llegan las alertas (correo, notificación en consola)? PLATAFORMA DE ATENCIÓN AL CLIENTE Aybar Atiende · Etapa de diseño y planeamiento | (por asignar) | (por definir) | (lo decide el PO) |

Una pregunta que bloquea G4 deja la feature en NO READY. Cuando se responde, la respuesta va a `docs/analisis/decisiones.md` y aquí se enlaza.

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-03 v1.3), sin cambiar su contenido — Revisado por: (pendiente)
