---
id: "HU-ATC-039"
tipo: hu
titulo: "Registro del caso con etiqueta estándar"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["FT-ATC-15", "EP-ATC-08", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-039-registro-caso-etiqueta-estandar.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-08 / docs/analisis/BRD.md
- Como Coordinador CX o personal de apoyo quiero registrar todo caso sensible del evento con la etiqueta estándar «Atención especial — derivación a Legal», para su seguimiento uniforme en el Registro de Casos Sensibles.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Etiquetar un caso sensible del evento
  Dado un caso sensible derivado a la Estación 4
  Cuando se registra en el Registro de Casos Sensibles
  Entonces el sistema le aplica la etiqueta literal «Atención especial — derivación a Legal»
```

## Reglas de negocio

- RN-SVC-028: casos sensibles no se debaten en sala; se registran y derivan de inmediato.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `GET/POST /api/v1/entregafest/registro-casos-sensibles` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades/campos que LEE: SVC_EVENT_SENSITIVE_CASE
- Entidades/campos que ESCRIBE o modifica: SVC_EVENT_SENSITIVE_CASE.Tag (etiqueta literal)
- Migración / backfill / borrado: no
- Checklist CAD-F5: [pendiente - se completa en F4]

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
