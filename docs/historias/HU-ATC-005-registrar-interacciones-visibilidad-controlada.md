---
id: "HU-ATC-005"
tipo: hu
titulo: "Registrar interacciones con visibilidad controlada"
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

Va en `docs/historias/HU-ATC-005-registrar-interacciones-visibilidad-controlada.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-01 / docs/analisis/BRD.md
- Como colaborador de área quiero registrar cada interacción (mensaje del cliente, respuesta del agente, nota interna, cambio de estado) con canal, gestor de tickets y marca de visibilidad al cliente, admitiendo evidencia multimedia adjunta, para distinguir la comunicación visible al cliente de la nota interna y conservar la evidencia del caso.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Registrar una nota interna no visible al cliente
  Dado un ticket abierto
  Cuando el gestor de tickets registra una nota interna con un adjunto
  Entonces el sistema la guarda marcada como no visible al cliente y nunca la muestra en el portal del cliente
```

## Reglas de negocio

- RN-SVC-012: prohibido registrar PII en los campos Notes_*; solo el motivo operativo del movimiento.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `POST /api/v1/tickets/{id}/interacciones` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades/campos que LEE: SVC_TICKET
- Entidades/campos que ESCRIBE o modifica: SVC_TICKET_INTERACCION (canal, autor, visibilidad, adjuntos)
- Migración / backfill / borrado: no
- Checklist CAD-F5: [pendiente - se completa en F4]

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
