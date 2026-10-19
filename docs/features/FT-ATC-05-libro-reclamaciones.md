---
id: "FT-ATC-05"
tipo: feature
titulo: "Libro de Reclamaciones"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["EP-ATC-03", "AYB-0001"]
tags: [feature, plt-03]
---

# PLT-03 - FT-ATC-05 Libro de Reclamaciones

Va en `docs/features/FT-ATC-05-libro-reclamaciones.md`.

| ID | Nombre | Epica padre |
|---|---|---|
| FT-ATC-05 | Libro de Reclamaciones | EP-ATC-03 |
| **Product Owner** | **Prioridad (MoSCoW)** | **Estado** |
| Eddie Huamaní | Debe | Borrador |
| **Release objetivo** | **Estimacion** | **Fecha / Version** |
| v1.0 - 30-oct-2026 (Dev 1 · jue 22-oct · Brayan) | 18 h (4 HU) | 2026-10-19 / v0.2 |

## 1 Descripción y valor

Crea el asiento QUEJA/RECLAMO como extensión del ticket, calcula el plazo legal y la prórroga única, registra la respuesta formal con cargo y vigila el plazo, detectando reclamos sin asiento. Cumple la Ley 29571 art. 24 con evidencia probatoria ante INDECOPI.

## 2 Requerimientos funcionales

| ID | Requerimiento | Prioridad (MoSCoW) | Origen | Criterio de verificación | Estado |
|---|---|---|---|---|---|
| RF-SVC-012 | El sistema debe crear el asiento QUEJA/RECLAMO como extensión 1:1 del ticket, con correlativo por empresa y establecimiento. | Debe | Responsable legal de reclamos | UNIQUE (Company, Address, Número) | Propuesto |
| RF-SVC-013 | El sistema debe calcular 15 días hábiles desde el registro y gestionar una prórroga única de 15 días con justificación, cargo y canal, bloqueando una segunda. | Debe | Responsable legal de reclamos | CHECK ExtensionCommunicatedDate ≤ LegalResponseDueDate | Propuesto |
| RF-SVC-014 | El sistema debe registrar la respuesta formal (fecha, resumen, carta PDF con cargo y firmante) y la constancia del derecho a acudir a INDECOPI. | Debe | Responsable legal de reclamos | Carta PDF en S3 incluida en el IntegrityHash | Propuesto |
| RF-SVC-015 | El sistema debe vigilar por job el plazo legal (alertas LEGAL_RESPONSE_OVERDUE y LEGAL_EXTENSION_WINDOW_CLOSING) y detectar a diario tickets sin asiento. | Debe | Job batch de ATC | GOV_INTEGRITY_EXCEPTION ORPHAN_REFERENCE | Propuesto |

## 3 Requerimientos no funcionales

| ID | Categoria | Requerimiento | Metrica / umbral |
|---|---|---|---|
| RNF-CUM-006 | Cumplimiento | Libro de Reclamaciones conforme a ley | reclamos_fuera_de_plazo: 0 respuestas fuera del plazo legal (o prorrogado) |
| RNF-CUM-007 | Cumplimiento | Evidencia probatoria inmutable | documentos_probatorios_sin_checksum: 0 |
| RNF-AUD-004 | Auditoría | Cinco bitácoras append-only firmadas | hash_mismatch: 0 en el job de auditoría |
| RNF-SEC-008 | Seguridad | DLP en bitácoras y narrativa por rol | acceso_narrativa_por_rol: columnas de narrativa solo para roles de atención/legal |

## 4 Reglas de negocio

| ID | Regla | Fuente |
|---|---|---|
| RN-SVC-004 | Correlativo por RUC; el libro corre además por establecimiento | Ley 29571 (libro) · Negocio |
| RN-SVC-009 | Plazo legal 15+15: prorrogable una vez por 15 más, justificado y comunicado antes del vencimiento original | Ley 29571 art. 24 · D.S. 101-2022-PCM |
| RN-SVC-010 | Respuesta válida con cargo: respuesta genérica sin número de reclamo ni cargo no cuenta ante INDECOPI | Ley 29571 · INDECOPI |
| RN-SVC-011 | Flag indicativo, fila decisiva: RequiresComplaintBook tipifica; la calificación legal la da la existencia de la fila | Negocio |
| RN-SVC-013 | Empresa inmutable en el libro: FK compuesta (TicketID, CompanyID) con RESTRICT | Ley 29571 · Legal |
| RN-SVC-003 | Días hábiles únicos contra MAE_TIME/MAE_HOLIDAY | Negocio |

## 5 Trazabilidad

| RF | HU (PLT-04 v1.2) | Horas / Asignación | Dependencia | Riesgo |
|---|---|---|---|---|
| RF-SVC-012 | HU-ATC-012 — Registrar el asiento del Libro de Reclamaciones | 4 h · Dev 1 (Brayan) (2026-10-22 → 2026-10-23) | HU-ATC-006, DEP-05 (Validación legal: formato del asiento, textos y plazos del Libro) | R-03 |
| RF-SVC-013 | HU-ATC-013 — Calcular el plazo legal y gestionar la prórroga única | 6 h · Dev 1 (Brayan) (2026-10-23 → 2026-10-23) | HU-ATC-012, DEP-04 (Calendario MAE_TIME + MAE_HOLIDAY por geografía) | R-03 |
| RF-SVC-014 | HU-ATC-014 — Registrar la respuesta formal con cargo | 4 h · Dev 1 (Brayan) (2026-10-26 → 2026-10-26) | HU-ATC-012, DEP-06 (Repositorio documental S3 + GOV_DOCUMENT_REPOSITORY y GLI) | R-03 |
| RF-SVC-015 | HU-ATC-015 — Vigilar el plazo legal y detectar reclamos huérfanos | 4 h · Dev 1 (Brayan) (2026-10-26 → 2026-10-27) | HU-ATC-013 | R-03 |

## 6 Fuera de alcance

- Hoja de reclamación pública (web).
- Envío electrónico a INDECOPI.

## 7 Preguntas abiertas

| # | Pregunta | Dueño | Fecha limite | Bloquea G4 |
|---|---|---|---|---|
| P-01 | ¿El libro virtual actual de la web se integra o se reemplaza? | PO | por definir | Sí |
| P-02 | ¿Quién firma la carta de respuesta por cada razón social? | PO | por definir | Sí |

Generado por IA: actualizado con el detalle del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`) — Revisado por: pendiente
