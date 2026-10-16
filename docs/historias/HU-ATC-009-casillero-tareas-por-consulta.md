---
id: "HU-ATC-009"
tipo: hu
titulo: "Casillero de tareas por consulta"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["FT-ATC-03", "EP-ATC-02", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-009-casillero-tareas-por-consulta.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-02 / docs/analisis/BRD.md
- Como colaborador de área quiero ver el casillero de tareas por área y responsable como una consulta sobre los tickets (área actual, responsable actual y estado), sin tabla adicional, para ver mi carga de trabajo pendiente sin duplicar el estado del ticket.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Consultar el casillero de un área
  Dado que existen tickets asignados a distintas áreas y responsables
  Cuando el colaborador abre el casillero de su área
  Entonces el sistema muestra los tickets con su área actual, responsable actual y estado, calculados sobre SVC_TICKET y su bitácora, sin tabla adicional
```

## Reglas de negocio

- RN-SVC-006: el casillero se calcula sobre la bitácora append-only, no sobre una tabla de estado paralela.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `GET /api/v1/tickets/casillero` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades/campos que LEE: SVC_TICKET, SVC_TICKET_ASIGNACION (último movimiento por ticket)
- Entidades/campos que ESCRIBE o modifica: ninguna (solo lectura)
- Migración / backfill / borrado: no
- Checklist CAD-F5: [pendiente - se completa en F4]

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
