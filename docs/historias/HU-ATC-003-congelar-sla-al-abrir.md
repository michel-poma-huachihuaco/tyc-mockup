---
id: "HU-ATC-003"
tipo: hu
titulo: "Congelar el SLA al abrir"
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

Va en `docs/historias/HU-ATC-003-congelar-sla-al-abrir.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-02 / docs/analisis/BRD.md
- Como job batch de ATC quiero elegir la política SLA vigente por precedencia y congelar los vencimientos de 1.ª respuesta y resolución al abrir el ticket para fijar un compromiso de tiempo estable que no cambie si la política se actualiza después.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Congelar el vencimiento al abrir el ticket
  Dado que existe una política SLA vigente para el tipo y prioridad del ticket
  Cuando el ticket se abre
  Entonces el sistema calcula y congela FirstResponseDueDateTime y ResolutionDueDateTime según la base de tiempo configurada (minutos corridos, horas o días hábiles con feriados por geografía)

Escenario: La política cambia después de abierto el ticket
  Dado un ticket ya abierto con sus vencimientos congelados
  Cuando la política SLA se actualiza
  Entonces los vencimientos del ticket no cambian
```

## Reglas de negocio

- RN-SVC-001: precedencia SLA, fila específica (tipo+prioridad) precede a la genérica.
- RN-SVC-002: compromisos congelados, no se recalculan si la política cambia después.
- RN-SVC-003: días hábiles únicos, contra MAE_TIME.IsWeekend + MAE_HOLIDAY por geografía del establecimiento.

## Datos (CAD-F5)

- Entidades/campos que LEE: política SLA vigente, MAE_TIME, MAE_HOLIDAY
- Entidades/campos que ESCRIBE o modifica: SVC_TICKET.FirstResponseDueDateTime, SVC_TICKET.ResolutionDueDateTime
- Migración / backfill / borrado: no
- Checklist CAD-F5: [pendiente - se completa en F4]

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
