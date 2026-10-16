---
id: "HU-ATC-046"
tipo: hu
titulo: "Reasignar automáticamente al agente con menos carga"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["FT-ATC-18", "EP-ATC-09", "AYB-0001"]
tags: [hu]
ui: false
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-046-reasignar-automaticamente-agente-menos-carga.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-09 / docs/analisis/BRD.md
- Como supervisor ATC quiero que el sistema reasigne un ticket al gestor de tickets disponible del mismo área y habilidad con menor carga de trabajo cuando el responsable no está disponible o su carga supera el límite, para balancear la carga y evitar incumplimientos por saturación.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Reasignar por saturación del responsable
  Dado un gestor responsable con la carga sobre el límite
  Cuando el job de reasignación corre
  Entonces el sistema reasigna el ticket al gestor disponible del mismo área y habilidad con menos tickets activos ponderados por prioridad
```

## Reglas de negocio

- RN-SVC-033: reasignación por menor carga; elige al gestor disponible del área/habilidad con menos tickets activos ponderados por prioridad.

## Datos (CAD-F5)

- Entidades/campos que LEE: SVC_TICKET_ASIGNACION, disponibilidad y carga por gestor
- Entidades/campos que ESCRIBE o modifica: SVC_TICKET_ASIGNACION (fila REASSIGNMENT_CARGA)
- Migración / backfill / borrado: no
- Checklist CAD-F5: [pendiente - se completa en F4]

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
