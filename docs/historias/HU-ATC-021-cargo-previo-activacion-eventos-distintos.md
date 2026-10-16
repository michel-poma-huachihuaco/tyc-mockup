---
id: "HU-ATC-021"
tipo: hu
titulo: "Cargo previo y cargo de activación como eventos distintos"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["FT-ATC-08", "EP-ATC-04", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-021-cargo-previo-activacion-eventos-distintos.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-04 / docs/analisis/BRD.md
- Como Mesa de Casos quiero emitir el cargo previo de asignación al recibir el caso y un cargo de activación separado, para que el SLA de línea arranque solo cuando el caso queda formalmente activado.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Activar un caso sensible
  Dado un caso con cargo previo emitido
  Cuando la Mesa de Casos lo activa formalmente
  Entonces el sistema emite el cargo de activación y el SLA de línea inicia en esa fecha, no en la del cargo previo
```

## Reglas de negocio

- RN-SVC-015: cargo previo distinto del cargo de activación; el SLA no arranca con el cargo previo.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `POST /api/v1/casos-sensibles/{id}/activacion` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades/campos que LEE: SVC_SENSITIVE_CASE
- Entidades/campos que ESCRIBE o modifica: SVC_SENSITIVE_CASE.PreAssignmentChargeDate, ActivationChargeDate
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
