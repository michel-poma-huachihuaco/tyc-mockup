---
id: "HU-ATC-004"
tipo: hu
titulo: "Gestionar el ciclo de vida del ticket"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["FT-ATC-02", "EP-ATC-01", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-004-gestionar-ciclo-vida-ticket.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-01 / docs/analisis/BRD.md
- Como colaborador de área quiero gestionar los estados OPEN, IN_PROGRESS, PENDING_CUSTOMER, ESCALATED, RESOLVED, CLOSED y REOPENED, registrando cada transición con fecha y autor en un historial inmutable, para conocer en todo momento el estado real del ticket y su historial completo.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Cambiar de estado un ticket
  Dado un ticket en estado OPEN
  Cuando el colaborador lo cambia a IN_PROGRESS
  Entonces el sistema agrega una fila nueva al historial con fecha, autor y el estado anterior, sin sobrescribir ninguna fila previa
```

## Reglas de negocio

- RN-SVC-006: cada movimiento de área/responsable es fila nueva con motivo tipificado; los punteros actuales son denormalizados.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `PATCH /api/v1/tickets/{id}/estado` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades/campos que LEE: SVC_TICKET, historial de estados
- Entidades/campos que ESCRIBE o modifica: SVC_TICKET_ESTADO_HISTORIAL (append-only)
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
