---
id: "HU-ATC-010"
tipo: hu
titulo: "Recibir una sola alerta por incumplimiento de SLA"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-04", "EP-ATC-02", "AYB-0001"]
tags: [hu]
ui: false
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-010-alertar-incumplimientos-sla-comercial.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-02 / docs/analisis/BRD.md
- Como supervisor ATC quiero recibir una alerta cuando un ticket incumple su primera respuesta o su resolución para actuar a tiempo sin recibir alertas duplicadas.
- Requerimiento origen (RF-SVC-010 — Alertar incumplimientos de SLA comercial): El sistema debe detectar por job FIRST_RESPONSE_OVERDUE y RESOLUTION_OVERDUE y alertar una sola vez por tipo y ciclo. · Proceso: PROC-SVC-004 (Vigilancia de SLA) · Fuente: PLT-04 · HU-ATC-010 · traza RF-SVC-010
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Salida 30-oct-2026
- Planificación (PLT-04 v1.2): Prioridad: **DEBE** · Iteración: **I1** · Estimación: **5 h** · Asignado: **Dev 2** (2026-10-21 → 2026-10-22) · Depende de HU: HU-ATC-003
- Observaciones de alcance: Fuera de alcance: Escalamiento a jefaturas (casos sensibles: FT-ATC-09).
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · compromiso SLA del ciclo | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · congelamiento y alerta de SLA | 6.5 Diagrama entidad-relación · política y alertas
- Referencia visual / plantilla en prototipo: Prototipo › Bandeja (chip «En riesgo / vencido») [P-01 "Bandeja de tickets"]

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Recibir una sola alerta por incumplimiento de SLA

Escenario: CA-01 · Sin duplicados
  Dado un ticket que ya alertó FIRST_RESPONSE_OVERDUE en este ciclo
  Cuando el job vuelve a correr
  Entonces no se genera otra alerta de ese tipo.

Escenario: CA-02 · Constancia
  Dado una alerta generada
  Cuando la consulto
  Entonces muestra destinatario, fecha, canal, vencimiento evaluado (EvaluatedDueDateTime) y ciclo.

Escenario: CA-03 · Ticket resuelto (agregado por el PO)
  Dado un ticket resuelto antes de su vencimiento
  Cuando corre el job
  Entonces no se genera alerta.
```

- Evidencia / prueba esperada (PLT-04): `Evento sla_alerta {tipo, ciclo}`

## Reglas de negocio

- RN-SVC-008 (Alerta unica por ciclo): UNIQUE (TicketID, BreachTypeID, ReopenCycleNumber): cada ciclo alerta una sola vez por tipo de incumplimiento.

## Datos (CAD-F5)

- Entidades catalogadas (.ods): ENT-SVC-008 MAE_SLA_POLICY
- Entidades y dependencias declaradas en PLT-04: ENT-SVC-009 SVC_SLA_BREACH_ALERT · job batch
- Entidades/campos que LEE: SVC_TICKET (vencimientos)
- Entidades/campos que ESCRIBE o modifica: SVC_TICKET_ALERTA_SLA
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
