---
id: "HU-ATC-012"
tipo: hu
titulo: "Registrar el asiento del libro como extensión del ticket"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["FT-ATC-05", "EP-ATC-03", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-012-registrar-asiento-libro-extension-ticket.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-03 / docs/analisis/BRD.md
- Como responsable legal de reclamos quiero crear el asiento del Libro de Reclamaciones como extensión 1:1 del ticket con tipo QUEJA/RECLAMO, correlativo por empresa y establecimiento, hechos, pedido del consumidor y monto reclamado con moneda solo si hay monto, para dejar constancia formal del reclamo conforme al formato regulado.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Crear el asiento del libro para un ticket tipificado como reclamo
  Dado un ticket marcado con RequiresComplaintBook
  Cuando el responsable legal registra el asiento con hechos y pedido del consumidor
  Entonces el sistema lo guarda como extensión 1:1 del ticket con correlativo único por empresa y establecimiento
```

## Reglas de negocio

- RN-SVC-004: correlativo por RUC; el libro corre además por establecimiento.
- RN-SVC-013: empresa inmutable en el libro (FK compuesta TicketID+CompanyID con RESTRICT).

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `POST /api/v1/tickets/{id}/libro-reclamaciones` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades/campos que LEE: SVC_TICKET
- Entidades/campos que ESCRIBE o modifica: SVC_COMPLAINT_BOOK_ENTRY (hechos, pedido, monto, moneda)
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
