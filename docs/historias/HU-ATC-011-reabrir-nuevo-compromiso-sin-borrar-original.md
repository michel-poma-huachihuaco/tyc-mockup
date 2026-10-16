---
id: "HU-ATC-011"
tipo: hu
titulo: "Reabrir con nuevo compromiso sin borrar el original"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["FT-ATC-04", "EP-ATC-02", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-011-reabrir-nuevo-compromiso-sin-borrar-original.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-02 / docs/analisis/BRD.md
- Como supervisor ATC quiero soportar la reapertura incrementando ReopenCount y calculando un nuevo vencimiento con la política vigente al reabrir, evaluando las alertas contra ese nuevo compromiso y conservando el original, para vigilar el compromiso vigente del ciclo actual sin perder la evidencia del primer compromiso.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Reabrir un ticket resuelto
  Dado un ticket en estado RESOLVED
  Cuando el cliente lo reabre
  Entonces el sistema incrementa ReopenCount, calcula ReopenedResolutionDueDateTime con la política vigente y conserva ResolutionDueDateTime original
```

## Reglas de negocio

- RN-SVC-007: reapertura con nuevo compromiso; el compromiso original no se reescribe.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `PATCH /api/v1/tickets/{id}/reapertura` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades/campos que LEE: SVC_TICKET, política SLA vigente
- Entidades/campos que ESCRIBE o modifica: SVC_TICKET.ReopenCount, ReopenedResolutionDueDateTime
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
