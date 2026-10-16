---
id: "HU-ATC-057"
tipo: hu
titulo: "Enviar en paralelo la alerta de cancelación del servicio"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["FT-ATC-22", "EP-ATC-11", "AYB-0001"]
tags: [hu]
ui: false
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-057-enviar-paralelo-alerta-cancelacion-servicio.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-11 / docs/analisis/BRD.md
- Como job batch de ATC quiero enviar al cliente, en paralelo al proceso de resolución, una alerta de cancelación del servicio (deuda, plazo para regularizar y consecuencias) por correo, WhatsApp y Mi Portal, dejando constancia de envío, para que el cliente sea informado a tiempo y pueda regularizar antes de que se resuelva el contrato.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Enviar la alerta de cancelación al crear el caso
  Dado un caso de resolución de contrato recién creado
  Cuando el sistema procesa el caso
  Entonces envía la alerta por correo, WhatsApp y Mi Portal, una sola vez, y deja constancia de envío
```

## Reglas de negocio

- RN-SVC-038: alerta de cancelación en paralelo, al crearse el caso, una sola vez.

## Datos (CAD-F5)

- Entidades/campos que LEE: SVC_TICKET (caso de resolución)
- Entidades/campos que ESCRIBE o modifica: constancia de envío de la alerta (correo, WhatsApp, Mi Portal)
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
