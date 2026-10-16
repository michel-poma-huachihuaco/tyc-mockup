---
id: "HU-ATC-036"
tipo: hu
titulo: "Escalamiento a Eje 3 y reincorporación contractual"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["FT-ATC-10", "EP-ATC-05", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-036-escalamiento-eje3-reincorporacion-contractual.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-05 / docs/analisis/BRD.md
- Como Gestor de Postventa quiero escalar a Eje 3 un reclamo de garantía que derive en conflicto legal, para además gestionar la reincorporación contractual mediante adenda cuando corresponda.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Escalar un reclamo de garantía en conflicto
  Dado un reclamo de garantía que deriva en conflicto legal
  Cuando el gestor lo escala
  Entonces el sistema lo deriva a Eje 3 sin intento de resolución previo en Eje 2 y permite registrar la adenda de reincorporación contractual
```

## Reglas de negocio

- RN-SVC-021: gate: un caso de conflicto no se resuelve en Eje 1/2; se deriva de inmediato al Eje 3.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `POST /api/v1/reclamos-garantia/{id}/escalamiento` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades/campos que LEE: SVC_WARRANTY_CLAIM
- Entidades/campos que ESCRIBE o modifica: SVC_WARRANTY_CLAIM.EscalatedToLegal, adenda de reincorporación contractual
- Migración / backfill / borrado: no
- Checklist CAD-F5: [pendiente - se completa en F4]

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
