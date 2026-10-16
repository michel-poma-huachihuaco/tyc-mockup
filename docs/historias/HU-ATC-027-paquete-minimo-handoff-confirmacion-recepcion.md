---
id: "HU-ATC-027"
tipo: hu
titulo: "Paquete mínimo de handoff con confirmación de recepción"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["FT-ATC-07", "EP-ATC-04", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-027-paquete-minimo-handoff-confirmacion-recepcion.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-04 / docs/analisis/BRD.md
- Como rol que deriva un ticket a otro eje quiero armar el paquete mínimo de handoff (ID del ticket, KYC validado, proyecto y lote, historial de pagos y estado de cuenta, atención previa, próximo paso) en toda derivación entre ejes, para que el eje destino confirme la recepción en el mismo ticket.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Enviar el handoff completo
  Dado un ticket que se deriva de Eje 1/2 a Eje 3
  Cuando el gestor arma el paquete con sus 6 elementos
  Entonces el sistema permite enviarlo y el eje destino puede confirmar la recepción en el mismo ticket

Escenario: Bloquear un handoff incompleto
  Dado un paquete de handoff con menos de 6 elementos
  Cuando se intenta enviar
  Entonces el sistema lo rechaza
```

## Reglas de negocio

- RN-SVC-022: gate: una derivación entre ejes sin paquete mínimo completo o sin trazabilidad es un gate no compensable.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `POST /api/v1/tickets/{id}/handoff` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades/campos que LEE: SVC_TICKET, KYC, proyecto/lote, historial de pagos
- Entidades/campos que ESCRIBE o modifica: SVC_TICKET_HANDOFF (6 elementos, confirmación de recepción)
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
