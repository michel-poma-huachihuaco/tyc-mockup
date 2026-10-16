---
id: "HU-ATC-060"
tipo: hu
titulo: "Gestionar los buses del Entrega Fest"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["FT-ATC-23", "EP-ATC-11", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-060-gestionar-buses-entrega-fest.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-11 / docs/analisis/BRD.md
- Como cliente quiero solicitar cupo en los buses del Entrega Fest con un formulario simple que genera un ticket, controla el aforo por bus y horario y me envía la confirmación con punto y hora de embarque, para organizar mi traslado al evento de entrega de lotes con cupos controlados y sin listas manuales.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Confirmar un cupo disponible
  Dado un bus y horario con capacidad disponible
  Cuando el cliente solicita el cupo con el formulario simple
  Entonces el sistema genera el ticket, confirma el cupo y envía punto y hora de embarque

Escenario: Rechazar un cupo sin capacidad
  Dado un bus y horario sin capacidad
  Cuando el cliente solicita el cupo
  Entonces el sistema no confirma el cupo y lo agrega a la lista de espera
```

## Reglas de negocio

- RN-SVC-042: aforo de buses del Entrega Fest; no se confirma un cupo sin capacidad; una cancelación libera el cupo a la lista de espera.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `POST /api/v1/formularios/entregafest-bus` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades/campos que LEE: aforo disponible por bus y horario
- Entidades/campos que ESCRIBE o modifica: SVC_TICKET (tipo reserva de bus), SVC_BUS_SEAT_RESERVATION, lista de espera
- Migración / backfill / borrado: no
- Checklist CAD-F5: [pendiente - se completa en F4]

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
