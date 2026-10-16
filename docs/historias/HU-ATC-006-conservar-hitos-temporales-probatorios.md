---
id: "HU-ATC-006"
tipo: hu
titulo: "Conservar hitos temporales probatorios"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["FT-ATC-02", "EP-ATC-01", "AYB-0001"]
tags: [hu]
ui: false
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-006-conservar-hitos-temporales-probatorios.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-01 / docs/analisis/BRD.md
- Como supervisor ATC quiero que el sistema registre la 1.ª respuesta, la 1.ª resolución (inmutable), la última resolución y el cierre para medir el cumplimiento del SLA incluso cuando el ticket se reabre.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Conservar la primera resolución tras una reapertura
  Dado un ticket con FirstResolvedDateTime ya registrado
  Cuando el ticket se reabre y se resuelve de nuevo
  Entonces el sistema registra LastResolvedDateTime sin modificar FirstResolvedDateTime
```

## Reglas de negocio

- RN-SVC-002: compromisos congelados, no se recalculan si la política cambia después.
- RN-SVC-007: reapertura con nuevo compromiso; el compromiso original no se reescribe.

## Datos (CAD-F5)

- Entidades/campos que LEE: SVC_TICKET
- Entidades/campos que ESCRIBE o modifica: SVC_TICKET.FirstResponseDateTime, FirstResolvedDateTime, LastResolvedDateTime, ClosedDateTime
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
