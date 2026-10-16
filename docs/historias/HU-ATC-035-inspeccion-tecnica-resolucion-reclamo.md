---
id: "HU-ATC-035"
tipo: hu
titulo: "Inspección técnica y resolución del reclamo"
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

Va en `docs/historias/HU-ATC-035-inspeccion-tecnica-resolucion-reclamo.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-05 / docs/analisis/BRD.md
- Como Gestor de Postventa quiero registrar la inspección técnica con su evidencia documental antes de resolver un reclamo de garantía, para aprobar, rechazar o resolver el caso con trazabilidad completa.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Resolver un reclamo tras la inspección
  Dado un reclamo de garantía dentro de cobertura
  Cuando el gestor registra la inspección técnica con su evidencia
  Entonces el sistema permite marcarlo como aprobado, rechazado o resuelto

Escenario: Bloquear la resolución sin inspección
  Dado un reclamo sin inspección registrada
  Cuando se intenta resolverlo
  Entonces el sistema lo rechaza
```

## Reglas de negocio

- RN-SVC-027: una garantía siempre cuelga de una entrega previa.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `POST /api/v1/reclamos-garantia/{id}/inspeccion` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades/campos que LEE: SVC_WARRANTY_CLAIM
- Entidades/campos que ESCRIBE o modifica: SVC_WARRANTY_INSPECTION (evidencia, resultado)
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
