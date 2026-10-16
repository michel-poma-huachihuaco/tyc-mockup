---
id: "HU-ATC-015"
tipo: hu
titulo: "Vigilar el plazo legal y detectar huérfanos"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["FT-ATC-05", "EP-ATC-03", "AYB-0001"]
tags: [hu]
ui: false
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-015-vigilar-plazo-legal-detectar-huerfanos.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-03 / docs/analisis/BRD.md
- Como job batch de ATC quiero vigilar por job el plazo legal (COALESCE del prorrogado y el original) generando alertas LEGAL_RESPONSE_OVERDUE y LEGAL_EXTENSION_WINDOW_CLOSING, y detectar diariamente tickets de tipo con RequiresComplaintBook sin asiento, registrando la excepción ORPHAN_REFERENCE, para detectar a tiempo el riesgo de incumplimiento legal y los reclamos sin asiento en el libro.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Detectar un ticket tipificado como reclamo sin asiento
  Dado un ticket con RequiresComplaintBook y sin asiento en el libro
  Cuando corre el job diario de vigilancia
  Entonces el sistema registra la excepción ORPHAN_REFERENCE para ese ticket
```

## Reglas de negocio

- RN-SVC-011: flag indicativo, fila decisiva; RequiresComplaintBook tipifica, la calificación legal la da la existencia de la fila.

## Datos (CAD-F5)

- Entidades/campos que LEE: SVC_TICKET, SVC_COMPLAINT_BOOK_ENTRY
- Entidades/campos que ESCRIBE o modifica: SVC_COMPLAINT_BOOK_ALERTA, GOV_INTEGRITY_EXCEPTION
- Migración / backfill / borrado: no
- Checklist CAD-F5: [pendiente - se completa en F4]

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
