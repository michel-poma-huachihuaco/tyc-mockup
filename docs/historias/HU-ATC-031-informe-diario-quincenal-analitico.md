---
id: "HU-ATC-031"
tipo: hu
titulo: "Informe diario operativo e informe quincenal analítico"
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

Va en `docs/historias/HU-ATC-031-informe-diario-quincenal-analitico.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-07 / docs/analisis/BRD.md
- Como Coordinador CX quiero generar el informe diario operativo (tickets por eje, NPS preliminar, derivaciones, SLA) y el informe quincenal analítico (tendencias, adopción de Mi Portal), para que jefaturas y el Comité de Asistentes decidan con datos consolidados.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Generar el informe diario
  Dado el cierre del día operativo
  Cuando el coordinador solicita el informe diario
  Entonces el sistema lo genera con tickets por eje, NPS preliminar, derivaciones y SLA
```

## Reglas de negocio

- No aplica una regla de negocio adicional a las de RNF-USA-001 (NPS-C) de FT-ATC-14.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `GET /api/v1/torre-control/informes` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades/campos que LEE: SVC_TICKET, KPI Engine
- Entidades/campos que ESCRIBE o modifica: ninguna (solo lectura/generación de reporte)
- Migración / backfill / borrado: no
- Checklist CAD-F5: [pendiente - se completa en F4]

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
