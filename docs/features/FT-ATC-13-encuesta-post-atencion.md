---
id: "FT-ATC-13"
tipo: feature
titulo: "Encuesta post-atención"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["EP-ATC-07", "AYB-0001"]
tags: [feature, plt-03]
---

# PLT-03 - FT-ATC-13 Encuesta post-atención

Va en `docs/features/FT-ATC-13-encuesta-post-atencion.md`.

| ID | Nombre | Epica padre |
|---|---|---|
| FT-ATC-13 | Encuesta post-atención | EP-ATC-07 |
| **Product Owner** | **Prioridad (MoSCoW)** | **Estado** |
| Eddie Huamaní | Debe | Borrador |
| **Release objetivo** | **Estimacion** | **Fecha / Version** |
| v1.0 - 30-oct-2026 (Dev 3 · lun 26-oct · Michel) | 3 h (1 HU) | 2026-10-19 / v0.2 |

## 1 Descripción y valor

Dispara la encuesta POST_TRANSACTION al cerrar el ticket y permite medir CSAT/CES por tipo de ticket, área y gestor de tickets. Da medición sistemática de la calidad de atención desde el día 1.

## 2 Requerimientos funcionales

| ID | Requerimiento | Prioridad (MoSCoW) | Origen | Criterio de verificación | Estado |
|---|---|---|---|---|---|
| RF-SVC-019 | El sistema debe disparar la encuesta POST_TRANSACTION al cerrar el ticket y permitir medir CSAT/CES por tipo, área y gestor de tickets. | Debe | Supervisor ATC | 100% de CLOSED con encuesta | Propuesto |

## 3 Requerimientos no funcionales

| ID | Categoria | Requerimiento | Metrica / umbral |
|---|---|---|---|
| RNF-INT-004 | Interoperabilidad | Medición de calidad hacia el KPI Engine | tickets_cerrados_con_encuesta_disparada: 100% de CLOSED dispara POST_TRANSACTION |

## 4 Reglas de negocio

| ID | Regla | Fuente |
|---|---|---|
| RN-SVC-007 | Reapertura con nuevo compromiso: una reapertura reevalúa el ciclo de medición | Negocio |

## 5 Trazabilidad

| RF | HU (PLT-04 v1.2) | Horas / Asignación | Dependencia | Riesgo |
|---|---|---|---|---|
| RF-SVC-019 | HU-ATC-019 — Disparar la encuesta al cerrar el ticket | 3 h · Dev 3 (Michel) (2026-10-26 → 2026-10-26) | HU-ATC-029, DEP-10 (KPI Engine + SVY_SURVEY_RESPONSE (encuestas)) | R-08 |

## 6 Fuera de alcance

- Diseño de las preguntas de la encuesta (se reutiliza el fragmento 19 del KPI Engine).
- Encuestas relacionales o de marca.

## 7 Preguntas abiertas

| # | Pregunta | Dueño | Fecha limite | Bloquea G4 |
|---|---|---|---|---|
| P-01 | ¿Por qué canal se envía la encuesta (WhatsApp, correo, SMS)? | PO | por definir | Sí |
| P-02 | ¿Qué pasa si el ticket se reabre después de responder la encuesta? | PO | por definir | No |

Generado por IA: actualizado con el detalle del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`) — Revisado por: pendiente
