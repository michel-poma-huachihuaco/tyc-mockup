---
id: "HU-ATC-014"
tipo: hu
titulo: "Registrar la respuesta formal con cargo"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["FT-ATC-05", "EP-ATC-03", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-014-registrar-respuesta-formal-con-cargo.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-03 / docs/analisis/BRD.md
- Como responsable legal de reclamos quiero registrar la respuesta formal (fecha, resumen, carta PDF con cargo al consumidor y firmante) y la constancia de haber informado el derecho a acudir a INDECOPI, para acreditar una respuesta válida ante INDECOPI.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Registrar una respuesta formal válida
  Dado un asiento del libro pendiente de respuesta
  Cuando el responsable legal adjunta la carta PDF con cargo y firmante, y marca la constancia del derecho a INDECOPI
  Entonces el sistema la guarda y la incluye en el IntegrityHash del asiento
```

## Reglas de negocio

- RN-SVC-010: respuesta válida con cargo; una respuesta genérica sin número de reclamo ni cargo no cuenta ante INDECOPI.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `POST /api/v1/libro-reclamaciones/{id}/respuesta` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades/campos que LEE: SVC_COMPLAINT_BOOK_ENTRY
- Entidades/campos que ESCRIBE o modifica: SVC_COMPLAINT_BOOK_ENTRY.ResponseDate, ResponseSummary, ResponseLetterUrl (S3), SignedBy
- Migración / backfill / borrado: no
- Checklist CAD-F5: [pendiente - se completa en F4]

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
