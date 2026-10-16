---
id: "HU-ATC-041"
tipo: hu
titulo: "Prevenir que un reclamo llegue a denuncia"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["FT-ATC-16", "EP-ATC-10", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-041-prevenir-reclamo-llegue-denuncia.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-10 / docs/analisis/BRD.md
- Como Coordinador CX y Legal quiero identificar los tickets con riesgo de escalar a denuncia o INDECOPI y calcular su exposición económica (monto reclamado + interés legal referencial del 8%), para priorizarlos y alertar a Legal, actuando antes de que el caso llegue a denuncia.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Priorizar un ticket por exposición económica
  Dado un ticket con riesgo identificado de escalar a denuncia
  Cuando el sistema calcula su exposición (monto reclamado + interés legal al día)
  Entonces lo prioriza en la lista de Legal y le envía una alerta
```

## Reglas de negocio

- RN-SVC-034: exposición económica = monto reclamado + interés legal (tasa referencial 8% anual, a validar con Legal).
- RN-SVC-016: clasificación de riesgo objetiva y recalibrable.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `GET /api/v1/tickets/riesgo-denuncia` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades/campos que LEE: SVC_TICKET, SVC_COMPLAINT_BOOK_ENTRY (monto reclamado)
- Entidades/campos que ESCRIBE o modifica: SVC_TICKET.ExposicionEconomica, alerta a Legal
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
