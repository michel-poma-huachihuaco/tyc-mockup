---
id: "DOR-FT-ATC-05"
tipo: dor
titulo: "Definition of Ready (G4) - FT-ATC-05 Libro de Reclamaciones"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-05", "EP-ATC-03", "AYB-0001"]
tags: [dor, plt-05, g4]
---

# PLT-05 - Definition of Ready (G4) - FT-ATC-05 Libro de Reclamaciones

Va en `docs/dor/DOR-FT-ATC-05-libro-reclamaciones.md`.

| Item evaluado | Product Owner | Lider tecnico |
|---|---|---|
| EP-ATC-03 / FT-ATC-05 Libro de Reclamaciones | Eddie Huamaní | [por asignar] |
| **Fecha de revision** | **Sprint / release destino** | **Resultado** |
| 2026-10-16 | Iteración 1 (19-23 oct 2026) · v1.0 | NO READY |

## 1 Checklist de G4

| # | Criterio | Cumple | Evidencia |
|---|---|---|---|
| 1 | Valor claro | [x] | HU-ATC-012..015 |
| 2 | Gherkin verificable | [x] | HU-ATC-012..015 |
| 3 | Reglas explícitas | [x] | RN-SVC-004, 009, 010, 011, 013, 003 |
| 4 | G2 si `ui: true` | [ ] | G2 no existe |
| 5 | G3 si aplica | [ ] | ADR-001, 002, 006 (evidencia S3); G3 en `draft` |
| 6 | Dependencias desbloqueadas | [ ] | DEP-05 (validación legal de textos, 23-oct) y DEP-06 (S3/GLI) sin resolver |
| 7 | Técnicas y de datos | [x] | `COMPLAINT_BOOK_ENTRY` en diccionario |
| 8 | TC iniciales QA | [ ] | Verificar test-plan.md |
| 9 | Estimada por el equipo | [ ] | 18 h de producto, sin confirmar |
| 10 | Cabe en un sprint | [x] | Ajustado, talla L |
| IA | Revisión humana | [ ] | Pendiente |

### Historias evaluadas en esta funcionalidad (artefacto PLT-04 v1.2)

| HU | Título (PLT-04) | Escenarios Gherkin | Horas | Desarrollador | Fechas | Condición en tablero (PLT-05) |
|---|---|---|---|---|---|---|
| HU-ATC-012 | Registrar el asiento del Libro de Reclamaciones | 3 (CA-01, CA-02, CA-03) | 4 h | Dev 1 (Brayan) | 2026-10-22 → 2026-10-23 | CON CONDICIONES (DEP-05 textos al 23-oct) |
| HU-ATC-013 | Calcular el plazo legal y gestionar la prórroga única | 4 (CA-01, CA-02, CA-03, CA-04) | 6 h | Dev 1 (Brayan) | 2026-10-23 → 2026-10-23 | CON CONDICIONES (DEP-05 textos al 23-oct) |
| HU-ATC-014 | Registrar la respuesta formal con cargo | 3 (CA-01, CA-02, CA-03) | 4 h | Dev 1 (Brayan) | 2026-10-26 → 2026-10-26 | CON CONDICIONES (DEP-05 textos al 23-oct) |
| HU-ATC-015 | Vigilar el plazo legal y detectar reclamos huérfanos | 3 (CA-01, CA-02, CA-03) | 4 h | Dev 1 (Brayan) | 2026-10-26 → 2026-10-27 | CON CONDICIONES (DEP-05 textos al 23-oct) |

## 2 Dependencias

| ID | Dependencia | Tipo | Bloquea a | Responsable | Fecha | Estado |
|---|---|---|---|---|---|---|
| DEP-05 | Validación legal: formato del asiento, textos y plazos | Legal | HU-ATC-012, 013, 014, 015 | Gerencia Legal | 2026-10-23 | Pendiente |
| DEP-06 | Object storage con bloqueo de escritura (S3/GLI) para evidencia probatoria | Técnica/Nube | HU-ATC-012..015 | Líder técnico | sin fecha en el PDF | Pendiente — depende además de que ADR-002/006 se confirmen (sin proveedor de nube decidido) |

## 3 Modelado

- `COMPLAINT_BOOK_ENTRY` en `docs/datos/diccionario.md`, FK compuesta (TicketID, CompanyID)

## 4 Arquitectura

- ADR: ADR-001, ADR-002 (HMAC), ADR-006 (S3 Object Lock — **pendiente de confirmación de proveedor de nube**, ver ADR-006)

## 5 Riesgos

| ID | Riesgo | Prob. | Impacto | Mitigación | Dueño | Estado |
|---|---|---|---|---|---|---|
| R-02 (PLT-05) | Sin proveedor de nube/object storage confirmado | Alta | Alto | Decisión de ADR-002/006 pendiente de TL | Líder técnico | Abierto |

## 6 Decision y aprobacion

Decision: NO READY

Condiciones pendientes:
- [ ] DEP-05 (validación legal de textos) no resuelta, fecha comprometida 2026-10-23
- [ ] DEP-06 (object storage) sin fecha comprometida y depende de una decisión de nube que todavía no existe en el proyecto
- [ ] P-01 y P-02 de FT-ATC-05 (libro virtual existente, firmante de cartas) bloquean G4
- [ ] G3 no `approved`; además G3 mismo deja "pendiente de confirmar" el proveedor de nube que esta feature necesita

| Rol | Nombre | Fecha | Firma |
|---|---|---|---|
| Product Owner (aprueba) | | | |
| Lider tecnico (consultivo) | | | |
| QA (consultivo) | | | |
| UX (consultivo) | | | |

Generado por IA: actualizado con el detalle del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`) — Revisado por: pendiente
