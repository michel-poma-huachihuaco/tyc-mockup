---
id: "HU-ATC-030"
tipo: hu
titulo: "Monitoreo en tiempo real y corrección preventiva"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["FT-ATC-14", "EP-ATC-07", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-030-monitoreo-tiempo-real-correccion-preventiva.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-07 / docs/analisis/BRD.md
- Como Coordinador CX quiero ver en tiempo real tickets activos, NPS, tiempos, SLA y derivaciones en curso, para detectar casos en riesgo y activar la corrección antes del incumplimiento.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Ver un caso en riesgo antes de que venza
  Dado un ticket cuyo SLA está a punto de vencer
  Cuando el coordinador abre el tablero de la Torre de Control
  Entonces el sistema lo muestra marcado en riesgo antes del vencimiento
```

## Reglas de negocio

- No aplica una regla de negocio adicional a las de RNF-USA-001 (NPS-C) y RNF-INT-007 de FT-ATC-14.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `GET /api/v1/torre-control/tiempo-real` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades/campos que LEE: SVC_TICKET (activos, SLA, derivaciones), KPI Engine (NPS)
- Entidades/campos que ESCRIBE o modifica: ninguna (solo lectura)
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
