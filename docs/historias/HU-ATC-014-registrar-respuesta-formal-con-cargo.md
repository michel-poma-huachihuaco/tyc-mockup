---
id: "HU-ATC-014"
tipo: hu
titulo: "Registrar la respuesta formal con cargo"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-05", "EP-ATC-03", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-014-registrar-respuesta-formal-con-cargo.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-03 / docs/analisis/BRD.md
- Como responsable legal de reclamos quiero registrar la respuesta con la carta firmada, su cargo y la constancia del derecho a INDECOPI para acreditar una respuesta válida ante INDECOPI.
- Requerimiento origen (RF-SVC-014 — Registrar la respuesta formal con cargo): El sistema debe registrar la respuesta formal (fecha, resumen, carta PDF con cargo y firmante) y la constancia del derecho a acudir a INDECOPI. · Proceso: PROC-SVC-005 (Libro de Reclamaciones) · Fuente: PLT-04 · HU-ATC-014 · traza RF-SVC-014
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Salida 30-oct-2026
- Planificación (PLT-04 v1.2): Prioridad: **DEBE** · Iteración: **I2** · Estimación: **4 h** · Asignado: **Dev 1** (2026-10-26 → 2026-10-26) · Depende de HU: HU-ATC-012 · Dependencias externas: DEP-06 (Repositorio documental S3 + GOV_DOCUMENT_REPOSITORY y GLI)
- Observaciones de alcance: Fuera de alcance: Firma digital certificada (dependerá de un proveedor).
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · asiento del Libro de Reclamaciones | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · asiento, prórroga y respuesta | 6.5 Diagrama entidad-relación · Libro de Reclamaciones

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Registrar la respuesta formal con cargo

Escenario: CA-01 · Respuesta válida
  Dado un reclamo por responder
  Cuando registro la respuesta
  Entonces se guardan CompanyResponseDate, la carta con cargo (PDF en S3, dentro del hash) y ResponderPartyID.

Escenario: CA-02 · Derecho INDECOPI
  Dado una respuesta registrada
  Cuando la consulto
  Entonces consta CustomerNotifiedOfIndecopiRight.

Escenario: CA-03 · Sin cargo (agregado por el PO)
  Dado que intento registrar la respuesta sin adjuntar el cargo
  Cuando confirmo
  Entonces el sistema no la acepta como respuesta válida.
```

- Evidencia / prueba esperada (PLT-04): `Evento respuesta_libro {días_hábiles_usados}`

## Reglas de negocio

- RN-SVC-010 (Respuesta valida con cargo): Respuesta generica sin numero de reclamo ni cargo al consumidor no cuenta ante INDECOPI; la carta PDF con cargo entra al IntegrityHash.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Prototipo / pantalla de referencia (artefacto): Prototipo › Libro › «Responder» — Mockups: P-04 "Libro de Reclamaciones" (Asientos con plazo legal, prórroga y respuesta formal)
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `POST /api/v1/libro-reclamaciones/{id}/respuesta` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades catalogadas (.ods): ENT-SVC-010 SVC_COMPLAINT_BOOK_ENTRY
- Entidades y dependencias declaradas en PLT-04: DEP-06 repositorio S3 · RNF-CUM-007
- Entidades/campos que LEE: SVC_COMPLAINT_BOOK_ENTRY
- Entidades/campos que ESCRIBE o modifica: SVC_COMPLAINT_BOOK_ENTRY.ResponseDate, ResponseSummary, ResponseLetterUrl (S3), SignedBy
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
