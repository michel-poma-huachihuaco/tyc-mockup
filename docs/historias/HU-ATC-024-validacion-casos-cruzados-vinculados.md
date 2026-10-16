---
id: "HU-ATC-024"
tipo: hu
titulo: "Validación de casos cruzados y vinculados"
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

Va en `docs/historias/HU-ATC-024-validacion-casos-cruzados-vinculados.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-04 / docs/analisis/BRD.md
- Como Gestor de Reclamos quiero validar si un caso nuevo está vinculado o cruzado con uno existente antes de registrarlo como independiente, para gestionarlos con un solo hilo de evidencia y evitar duplicidad.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Detectar un caso vinculado a uno existente
  Dado un caso nuevo que comparte hechos con un caso ya registrado
  Cuando el gestor intenta registrarlo como independiente
  Entonces el sistema lo vincula al caso existente en un solo hilo de evidencia en lugar de crear uno nuevo
```

## Reglas de negocio

- RN-SVC-018: caso vinculado no se duplica; comparte un solo hilo de evidencia.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `POST /api/v1/casos-sensibles/{id}/vinculacion` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades/campos que LEE: SVC_SENSITIVE_CASE
- Entidades/campos que ESCRIBE o modifica: SVC_SENSITIVE_CASE_LINK (caso origen, caso vinculado)
- Migración / backfill / borrado: no
- Checklist CAD-F5: [pendiente - se completa en F4]

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
