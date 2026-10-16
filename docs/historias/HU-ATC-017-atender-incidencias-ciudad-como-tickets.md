---
id: "HU-ATC-017"
tipo: hu
titulo: "Atender incidencias de ciudad como tickets"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["FT-ATC-11", "EP-ATC-06", "AYB-0001"]
tags: [hu]
ui: false
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-017-atender-incidencias-ciudad-como-tickets.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-06 / docs/analisis/BRD.md
- Como UrbeMind quiero vincular el ticket opcionalmente a un contrato y/o unidad en incidencias de ciudad (tipo CITY_INCIDENT), de modo que una incidencia que derive en cobro apunte a un contrato CITY_SERVICE_FEE, para atender incidencias urbanas reutilizando la misma infraestructura de tickets.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Vincular una incidencia de ciudad a un contrato de cobro
  Dado un ticket CITY_INCIDENT que deriva en cobro
  Cuando se vincula a una unidad
  Entonces el sistema asocia el ticket a un contrato CITY_SERVICE_FEE
```

## Reglas de negocio

- RN-SVC-005: empresa y línea obligatorias; ContractID puede ser nullable en este tipo de ticket.

## Datos (CAD-F5)

- Entidades/campos que LEE: contrato/unidad (dominio Contratos y Activos)
- Entidades/campos que ESCRIBE o modifica: SVC_TICKET.ContractID (CITY_SERVICE_FEE), tipo CITY_INCIDENT
- Migración / backfill / borrado: no
- Checklist CAD-F5: [pendiente - se completa en F4]

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
