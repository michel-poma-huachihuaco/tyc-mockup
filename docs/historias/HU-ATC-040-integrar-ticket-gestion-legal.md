---
id: "HU-ATC-040"
tipo: hu
titulo: "Integrar el ticket con la gestión de Legal"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["FT-ATC-16", "EP-ATC-10", "AYB-0001"]
tags: [hu]
ui: false
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-040-integrar-ticket-gestion-legal.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-10 / docs/analisis/BRD.md
- Como equipo de Legal quiero que los tickets derivados a Eje 3 se sincronicen con la herramienta que uso (responsable: Rosario), enviando el paquete mínimo y recibiendo estado y resolución, para seguir cada caso legal en un solo lugar sin registrarlo dos veces.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Sincronizar un ticket derivado a Eje 3
  Dado un ticket derivado a Eje 3 con su paquete mínimo de handoff
  Cuando se sincroniza con la herramienta de Legal
  Entonces el caso queda visible ahí con el N.º de ticket, y el sistema recibe su estado y resolución sin duplicar el registro
```

## Reglas de negocio

- RN-SVC-022: gate: una derivación sin paquete mínimo completo es un gate no compensable.

## Datos (CAD-F5)

- Entidades/campos que LEE: SVC_TICKET_HANDOFF
- Entidades/campos que ESCRIBE o modifica: sincronización con la herramienta de Legal (estado, resolución)
- Migración / backfill / borrado: no
- Checklist CAD-F5: [pendiente - se completa en F4]

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
