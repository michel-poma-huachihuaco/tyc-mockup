---
id: "HU-ATC-002"
tipo: hu
titulo: "Entregar número correlativo por razón social"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["FT-ATC-01", "EP-ATC-01", "AYB-0001"]
tags: [hu]
ui: false
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-002-entregar-numero-correlativo-por-razon-social.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-01 / docs/analisis/BRD.md
- Como gestor de tickets quiero que el sistema genere un número de ticket correlativo único por razón social y lo entregue al cliente para identificar y dar seguimiento al ticket ante cada razón social.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Generar el número correlativo al crear el ticket
  Dado que se registra un ticket nuevo para una razón social (CompanyID)
  Cuando el sistema lo guarda
  Entonces le asigna un TicketNumber único dentro de esa razón social y lo muestra al gestor para entregarlo al cliente
```

## Reglas de negocio

- RN-SVC-004: TicketNumber UNIQUE por CompanyID; el libro corre además por establecimiento.

## Datos (CAD-F5)

- Entidades/campos que LEE: SVC_TICKET.CompanyID
- Entidades/campos que ESCRIBE o modifica: SVC_TICKET.TicketNumber (correlativo por CompanyID)
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
