---
id: "HU-ATC-020"
tipo: hu
titulo: "Registro multilínea con Código Único de Caso"
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

Va en `docs/historias/HU-ATC-020-registro-multilinea-codigo-unico-caso.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-04 / docs/analisis/BRD.md
- Como Gestor de Reclamos (Mesa de Casos) quiero registrar todo caso sensible por su línea de origen (Indecopi, Libro de Reclamaciones, Cartas Notariales, Legal Atiende o Backlog Histórico) con un Código Único Estandarizado, para tener trazabilidad completa del caso sin importar su canal de ingreso.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Registrar un caso sensible proveniente de INDECOPI
  Dado un caso que ingresa por la línea INDECOPI
  Cuando la Mesa de Casos lo registra
  Entonces el sistema le asigna un Código Único Estandarizado que nunca se reutiliza
```

## Reglas de negocio

- RN-SVC-014: cinco líneas de ingreso de casos sensibles (Indecopi, Libro de Reclamaciones, Cartas Notariales, Legal Atiende, Backlog Histórico).

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `POST /api/v1/casos-sensibles` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades/campos que LEE: catálogo de líneas de ingreso
- Entidades/campos que ESCRIBE o modifica: SVC_SENSITIVE_CASE (línea de origen, Código Único)
- Migración / backfill / borrado: no
- Checklist CAD-F5: [pendiente - se completa en F4]

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
