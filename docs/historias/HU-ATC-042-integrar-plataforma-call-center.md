---
id: "HU-ATC-042"
tipo: hu
titulo: "Integrar la plataforma del call center"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["FT-ATC-17", "EP-ATC-10", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-042-integrar-plataforma-call-center.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-10 / docs/analisis/BRD.md
- Como operador del call center quiero integrarme con la plataforma que usa mi equipo para mostrar los datos del cliente al recibir la llamada (screen pop), abrir o ubicar su ticket y registrar la llamada como interacción con su grabación, para atender la llamada sin cambiar de sistema ni volver a escribir los datos.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Mostrar la ficha del cliente al contestar
  Dado que entra una llamada de un cliente identificado
  Cuando el operador contesta
  Entonces el sistema muestra su ficha (screen pop) en menos de 2 segundos y abre o ubica su ticket

Escenario: Registrar la llamada como interacción
  Dado una llamada atendida
  Cuando finaliza
  Entonces el sistema la registra como interacción del ticket con su grabación
```

## Reglas de negocio

- RN-SVC-005: empresa y línea obligatorias; ContractID puede ser nullable en este caso.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `GET /api/v1/call-center/screen-pop` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades/campos que LEE: SVC_TICKET, ficha de cliente (SIGDA/TAXON)
- Entidades/campos que ESCRIBE o modifica: SVC_TICKET_INTERACCION (llamada y grabación)
- Migración / backfill / borrado: no
- Checklist CAD-F5: [pendiente - se completa en F4]

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
