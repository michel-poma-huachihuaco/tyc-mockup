---
id: "HU-ATC-025"
tipo: hu
titulo: "Cierre tipificado con evidencia y custodia legal separada"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["FT-ATC-09", "EP-ATC-04", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-025-cierre-tipificado-evidencia-custodia-legal.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-04 / docs/analisis/BRD.md
- Como Gestor de Reclamos quiero cerrar cada caso con uno de los estados homologados de cierre y su evidencia documentada, para custodiar los originales probatorios en el Repositorio Legal Controlado (GLI) de forma separada de la plataforma operativa.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Cerrar un caso con evidencia
  Dado un caso sensible listo para cerrar
  Cuando el gestor selecciona uno de los 8 estados homologados y adjunta la evidencia
  Entonces el sistema cierra el caso y referencia la custodia del original en el GLI, sin almacenarlo en la plataforma operativa

Escenario: Rechazar el cierre sin evidencia
  Dado un caso sin evidencia documentada
  Cuando se intenta cerrar
  Entonces el sistema lo rechaza
```

## Reglas de negocio

- RN-SVC-019: cierre tipificado por ocho estados homologados; un cierre sin evidencia no es cierre.
- RN-SVC-020: custodia legal separada de la plataforma operativa (GLI).

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `POST /api/v1/casos-sensibles/{id}/cierre` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades/campos que LEE: SVC_SENSITIVE_CASE
- Entidades/campos que ESCRIBE o modifica: SVC_SENSITIVE_CASE.ClosureState, referencia a GLI
- Migración / backfill / borrado: no
- Checklist CAD-F5: [pendiente - se completa en F4]

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
