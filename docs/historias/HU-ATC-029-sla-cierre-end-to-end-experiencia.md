---
id: "HU-ATC-029"
tipo: hu
titulo: "SLA de cierre end-to-end de la experiencia"
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

Va en `docs/historias/HU-ATC-029-sla-cierre-end-to-end-experiencia.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-02 / docs/analisis/BRD.md
- Como Coordinador CX quiero medir el cierre end-to-end del ticket, para poder alertar cuando se aproxima a 72 horas hábiles sin escalamiento o al plazo del eje correspondiente si hay escalamiento.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Alertar antes de vencer el cierre end-to-end
  Dado un ticket sin escalamiento que se acerca a las 72 horas hábiles desde su apertura
  Cuando el job de vigilancia corre
  Entonces el sistema marca el ticket en riesgo antes del vencimiento
```

## Reglas de negocio

- RN-SVC-025: cierre end-to-end en 72 horas hábiles; con escalamiento, aplica el plazo propio del eje correspondiente.

## Datos (CAD-F5)

- Entidades/campos que LEE: SVC_TICKET (apertura, escalamiento)
- Entidades/campos que ESCRIBE o modifica: marca de riesgo de cierre E2E
- Migración / backfill / borrado: no
- Checklist CAD-F5: [pendiente - se completa en F4]

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
