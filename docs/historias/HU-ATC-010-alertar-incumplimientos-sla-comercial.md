---
id: "HU-ATC-010"
tipo: hu
titulo: "Alertar incumplimientos de SLA comercial"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["FT-ATC-04", "EP-ATC-02", "AYB-0001"]
tags: [hu]
ui: false
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-010-alertar-incumplimientos-sla-comercial.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-02 / docs/analisis/BRD.md
- Como supervisor ATC quiero que el sistema detecte por job los incumplimientos FIRST_RESPONSE_OVERDUE y RESOLUTION_OVERDUE, dejando constancia de destinatario, fecha, canal, vencimiento evaluado y ciclo, y alertando una sola vez por tipo y ciclo, para actuar a tiempo sobre los tickets en riesgo sin recibir alertas duplicadas.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Alertar una sola vez por tipo y ciclo
  Dado un ticket que supera su ResolutionDueDateTime
  Cuando el job de vigilancia corre más de una vez sobre el mismo ticket y ciclo
  Entonces el sistema genera una sola alerta RESOLUTION_OVERDUE para ese tipo y ciclo
```

## Reglas de negocio

- RN-SVC-008: alerta única por ciclo, UNIQUE (TicketID, BreachTypeID, ReopenCycleNumber).

## Datos (CAD-F5)

- Entidades/campos que LEE: SVC_TICKET (vencimientos)
- Entidades/campos que ESCRIBE o modifica: SVC_TICKET_ALERTA_SLA
- Migración / backfill / borrado: no
- Checklist CAD-F5: [pendiente - se completa en F4]

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
