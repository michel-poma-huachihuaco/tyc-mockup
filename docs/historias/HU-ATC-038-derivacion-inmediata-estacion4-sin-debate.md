---
id: "HU-ATC-038"
tipo: hu
titulo: "Derivación inmediata a Estación 4 sin debate"
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

Va en `docs/historias/HU-ATC-038-derivacion-inmediata-estacion4-sin-debate.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-08 / docs/analisis/BRD.md
- Como Coordinador CX quiero registrar la derivación inmediata a la Estación 4 (Legal) de todo caso sensible o imputación penal en vivo, para que el moderador cierre el tema en sala sin debatirlo.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Derivar un caso sensible detectado en vivo
  Dado una palabra de riesgo muy alto detectada en la intervención
  Cuando el moderador la marca
  Entonces el sistema exige la derivación inmediata a la Estación 4, sin debatir el tema en sala
```

## Reglas de negocio

- RN-SVC-028: gate: casos sensibles no se debaten en sala; se derivan de inmediato a la Estación 4.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `POST /api/v1/entregafest/casos/{id}/derivacion` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades/campos que LEE: SVC_EVENT_SENSITIVE_CASE
- Entidades/campos que ESCRIBE o modifica: SVC_EVENT_SENSITIVE_CASE.DerivedToStation4
- Migración / backfill / borrado: no
- Checklist CAD-F5: [pendiente - se completa en F4]

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
