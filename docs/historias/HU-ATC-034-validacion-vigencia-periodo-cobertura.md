---
id: "HU-ATC-034"
tipo: hu
titulo: "Validación de vigencia contra el periodo de cobertura"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["FT-ATC-10", "EP-ATC-05", "AYB-0001"]
tags: [hu]
ui: false
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-034-validacion-vigencia-periodo-cobertura.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-05 / docs/analisis/BRD.md
- Como Gestor de Postventa quiero validar la vigencia del reclamo de garantía contra el periodo de cobertura y la fecha real de entrega, para rechazar automáticamente reclamos fuera de cobertura.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Rechazar automáticamente un reclamo fuera de cobertura
  Dado un reclamo de garantía cuya fecha excede el periodo de cobertura desde la entrega real
  Cuando se registra
  Entonces el sistema lo marca como no procedente automáticamente
```

## Reglas de negocio

- RN-SVC-027: una garantía siempre cuelga de una entrega previa y solo es procedente dentro del periodo de cobertura validado contra la fecha real de entrega.

## Datos (CAD-F5)

- Entidades/campos que LEE: SVC_WARRANTY_CLAIM, CONTRACT_UNIT_HANDOVER, MAE_WARRANTY_COVERAGE_PERIOD
- Entidades/campos que ESCRIBE o modifica: SVC_WARRANTY_CLAIM.Status (no procedente)
- Migración / backfill / borrado: no
- Checklist CAD-F5: [pendiente - se completa en F4]

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
