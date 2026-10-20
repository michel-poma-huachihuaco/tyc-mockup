---
id: "FT-ATC-05"
tipo: feature
titulo: "Libro de Reclamaciones"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["EP-ATC-03", "HU-ATC-012", "HU-ATC-013", "HU-ATC-014", "HU-ATC-015"]
tags: [feature, plt-03, ui]
---

# PLT-03 - FT-ATC-05 Libro de Reclamaciones

| ID | Nombre | Épica padre |
|---|---|---|
| FT-ATC-05 | Libro de Reclamaciones | EP-ATC-03 Libro de Reclamaciones y apelaciones |
| **Product Owner** | **Prioridad (MoSCoW)** | **Estado** |
| Eddie Huamaní (PO) | Debe | Refinamiento |
| **Release objetivo** | **Estimación** | **Fecha / Versión** |
| v1.0 · Etapa 1 · 03-nov-2026 | L · 18 h · 18 h de desarrollo · Dev 1 | 16-oct-2026 · v1.3 |
| **Desarrollador** | **Ventana (PLT-01)** | **Predecesora** |
| Dev 1 (Brayan) | 26-oct-2026 → 28-oct-2026 | — |

## 1 Descripción y valor

Crea el asiento QUEJA/RECLAMO como extensión del ticket, calcula el plazo legal y la prórroga única, registra la respuesta formal con cargo y vigila el plazo, detectando reclamos sin asiento.

**Beneficio:** Cumplimiento de la Ley 29571 art. 24 con evidencia probatoria ante INDECOPI.

**Usuarios:** Responsable legal de reclamos · Gestor de tickets · Job batch de ATC

## 2 Requerimientos funcionales

| ID | Requerimiento | Prioridad (MoSCoW) | Origen | Criterio de verificación | Horas | Predecesora | Estado |
|---|---|---|---|---|---|---|---|
| RF-SVC-012 | El sistema debe crear el asiento QUEJA/RECLAMO como extensión 1:1 del ticket, con correlativo por empresa y establecimiento. | Debe | PROC-SVC-005 · Responsable legal de reclamos | UNIQUE (Company, Address, Número) | 4 | — | Pend. DoR |
| RF-SVC-013 | El sistema debe calcular 15 días hábiles desde el registro y gestionar una prórroga única de 15 días con justificación, cargo y canal, bloqueando una segunda. | Debe | PROC-SVC-005 · Responsable legal de reclamos | CHECK ExtensionCommunicatedDate ≤ LegalResponseDueDate | 6 | RF-SVC-012 | Pend. DoR |
| RF-SVC-014 | El sistema debe registrar la respuesta formal (fecha, resumen, carta PDF con cargo y firmante) y la constancia del derecho a acudir a INDECOPI. | Debe | PROC-SVC-005 · Responsable legal de reclamos | Carta PDF en S3 incluida en el IntegrityHash | 4 | RF-SVC-012 | Pend. DoR |
| RF-SVC-015 | El sistema debe vigilar por job el plazo legal (alertas LEGAL_RESPONSE_OVERDUE y LEGAL_EXTENSION_WINDOW_CLOSING) y detectar a diario tickets sin asiento. | Debe | PROC-SVC-005 · Job batch de ATC | GOV_INTEGRITY_EXCEPTION ORPHAN_REFERENCE | 4 | RF-SVC-013 | Pend. DoR |

Ruta crítica: RF-SVC-012 → RF-SVC-013 → RF-SVC-015 (14 h).

## 3 Requerimientos no funcionales

| ID | Categoría | Requerimiento | Métrica / umbral | Prioridad |
|---|---|---|---|---|
| RNF-CUM-006 | Cumplimiento | Libro de Reclamaciones conforme a ley | reclamos_fuera_de_plazo: 0 respuestas fuera del plazo legal (o prorrogado) | Debe |
| RNF-CUM-007 | Cumplimiento | Evidencia probatoria inmutable | documentos_probatorios_sin_checksum: 0 | Debe |
| RNF-AUD-004 | Auditoría | Cinco bitácoras append-only firmadas | hash_mismatch: 0 en el job de auditoría | Debe |
| RNF-SEC-008 | Seguridad | DLP en bitácoras y narrativa por rol | acceso_narrativa_por_rol: columnas de narrativa solo para roles de atención/legal | Debe |

## 4 Reglas de negocio

| ID | Regla | Fuente |
|---|---|---|
| RN-SVC-004 | Correlativo por RUC. TicketNumber UNIQUE por CompanyID; el libro corre ademas por establecimiento (UNIQUE Company+Address+Número) | Ley 29571 (libro) · Negocio |
| RN-SVC-009 | Plazo legal 15+15. 15 días hábiles desde el registro, prorrogable UNA vez por 15 más si se justifica y comunica ANTES del vencimiento original; prohibido reescribir el vencimiento prorrogado | Ley 29571 art. 24 · D.S. 101-2022-PCM |
| RN-SVC-010 | Respuesta valida con cargo. Respuesta generica sin número de reclamo ni cargo al consumidor no cuenta ante INDECOPI; la carta PDF con cargo entra al IntegrityHash | Ley 29571 · INDECOPI |
| RN-SVC-011 | Flag indicativo, fila decisiva. RequiresComplaintBook tipifica; la calificación legal la da la existencia de la fila en SVC_COMPLAINT_BOOK_ENTRY (control detectivo diario) | Negocio · Excel 05_Catalogos |
| RN-SVC-013 | Empresa inmutable en el libro. FK compuesta (TicketID, CompanyID) con RESTRICT: el asiento no puede cambiar de razon social | Ley 29571 · Legal |
| RN-SVC-003 | Días hábiles unicos. BUSINESS_HOURS/BUSINESS_DAYS se resuelven contra MAE_TIME.IsWeekend + MAE_HOLIDAY por geografia del establecimiento, nunca con formula propia del job | Negocio · Excel 05_Catalogos |

## 5 Trazabilidad

| RF | HU | Dependencia | Riesgo |
|---|---|---|---|
| RF-SVC-012 | HU-ATC-012 · Iteración 1 · Dev 1 · lun 26-oct | DEP-05 Legal · DEP-06 S3/GLI | R-03 |
| RF-SVC-013 | HU-ATC-013 · Iteración 1 · Dev 1 · lun 26-oct → mar 27-oct | DEP-05 Legal · DEP-06 S3/GLI | R-03 |
| RF-SVC-014 | HU-ATC-014 · Iteración 2 · Dev 1 · mar 27-oct → mié 28-oct | DEP-05 Legal · DEP-06 S3/GLI | R-03 |
| RF-SVC-015 | HU-ATC-015 · Iteración 2 · Dev 1 · mié 28-oct | DEP-05 Legal · DEP-06 S3/GLI | R-03 |

Cada RF llega a una HU, y cada criterio de la HU a un TC de `docs/pruebas/test-plan.md` (pendiente: lo define QA).

## 6 Fuera de alcance

- Hoja de reclamación pública (web); envío electrónico a INDECOPI.

## 7 Preguntas abiertas

| # | Pregunta | Dueño | Fecha límite | Bloquea G4 |
|---|---|---|---|---|
| P-01 | ¿El libro virtual actual de la web se integra o se reemplaza? ¿Quién firma la carta de respuesta por cada razón social? | (por asignar) | (por definir) | (lo decide el PO) |

Una pregunta que bloquea G4 deja la feature en NO READY. Cuando se responde, la respuesta va a `docs/analisis/decisiones.md` y aquí se enlaza.

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-03 v1.3), sin cambiar su contenido — Revisado por: (pendiente)
