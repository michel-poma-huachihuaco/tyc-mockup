---
id: "HU-ATC-050"
tipo: hu
titulo: "Consulta 360 del cliente en el ticket"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["FT-ATC-20", "EP-ATC-10", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-050-consulta-360-cliente-ticket.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-10 / docs/analisis/BRD.md
- Como gestor de tickets quiero un submódulo de consulta del cliente dentro del ticket con su detalle (lotes, cuotas y estado de cuenta, correos y mensajes, tickets e interacciones previas y documentos), para responder sin salir del ticket ni consultar otros sistemas.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Consultar el detalle 360 del cliente
  Dado un ticket abierto de un cliente identificado
  Cuando el gestor abre el submódulo de consulta 360
  Entonces el sistema muestra lotes, cuotas, correos, tickets previos y documentos en línea, sin copiarlos
```

## Reglas de negocio

- RN-SVC-036: la búsqueda y la consulta 360 solo muestran documentos y datos que el rol del usuario puede ver en el sistema de origen.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `GET /api/v1/tickets/{id}/consulta-360` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades/campos que LEE: SIGDA/TAXON (lotes, cuotas, correos, documentos), SVC_TICKET (historial previo)
- Entidades/campos que ESCRIBE o modifica: ninguna (solo lectura)
- Migración / backfill / borrado: no
- Checklist CAD-F5: [pendiente - se completa en F4]

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
