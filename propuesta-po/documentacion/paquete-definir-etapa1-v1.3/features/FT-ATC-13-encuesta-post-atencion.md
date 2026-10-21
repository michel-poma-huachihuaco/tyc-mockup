---
id: "FT-ATC-13"
tipo: feature
titulo: "Encuesta post-atención"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["EP-ATC-07", "HU-ATC-019"]
tags: [feature, plt-03, ui]
---

# PLT-03 - FT-ATC-13 Encuesta post-atención

| ID | Nombre | Épica padre |
|---|---|---|
| FT-ATC-13 | Encuesta post-atención | EP-ATC-07 Calidad de atención y Torre de Control CX |
| **Product Owner** | **Prioridad (MoSCoW)** | **Estado** |
| Eddie Huamaní (PO) | Debe | Refinamiento |
| **Release objetivo** | **Estimación** | **Fecha / Versión** |
| v1.0 · Etapa 1 · 03-nov-2026 | S·3h · 3 h de desarrollo · Dev 3 | 16-oct-2026 · v1.3 |
| **Desarrollador** | **Ventana (PLT-01)** | **Predecesora** |
| Dev 3 (Michel) | 29-oct-2026 → 29-oct-2026 | — |

## 1 Descripción y valor

Dispara la encuesta POST_TRANSACTION al cerrar el ticket y permite medir CSAT/CES por tipo de ticket, área y gestor de tickets.

**Beneficio:** Medición sistemática de la calidad de atención desde el día 1.

**Usuarios:** Cliente · Supervisor ATC · Coordinador CX

## 2 Requerimientos funcionales

| ID | Requerimiento | Prioridad (MoSCoW) | Origen | Criterio de verificación | Horas | Predecesora | Estado |
|---|---|---|---|---|---|---|---|
| RF-SVC-019 | El sistema debe disparar la encuesta POST_TRANSACTION al cerrar el ticket y permitir medir CSAT/CES por tipo, área y gestor de tickets. | Debe | PROC-SVC-008 · Supervisor ATC | 100 % de CLOSED con encuesta | 3 | — | Pend. DoR |

Ruta crítica: RF-SVC-019 (3 h).

## 3 Requerimientos no funcionales

| ID | Categoría | Requerimiento | Métrica / umbral | Prioridad |
|---|---|---|---|---|
| RNF-INT-004 | Interoperabilidad | Medición de calidad hacia el KPI Engine | tickets_cerrados_con_encuesta_disparada: 100% de CLOSED dispara POST_TRANSACTION | Debe |

## 4 Reglas de negocio

| ID | Regla | Fuente |
|---|---|---|
| RN-SVC-007 | Reapertura con nuevo compromiso. REOPENED incrementa ReopenCount y calcula ReopenedResolutionDueDateTime con la política vigente al reabrir; el compromiso original no se reescribe | Negocio · Excel 05_Catalogos |

## 5 Trazabilidad

| RF | HU | Dependencia | Riesgo |
|---|---|---|---|
| RF-SVC-019 | HU-ATC-019 · Iteración 2 · Dev 3 · jue 29-oct | DEP-10 KPI Engine | R-08 |

Cada RF llega a una HU, y cada criterio de la HU a un TC de `docs/pruebas/test-plan.md` (pendiente: lo define QA).

## 6 Fuera de alcance

- Diseño de preguntas (se reutiliza el fragmento 19); encuestas relacionales o de marca.

## 7 Preguntas abiertas

| # | Pregunta | Dueño | Fecha límite | Bloquea G4 |
|---|---|---|---|---|
| P-01 | ¿Canal de envío de la encuesta (WhatsApp, correo, SMS)? ¿Qué pasa si el ticket se reabre después de responder la encuesta? | (por asignar) | (por definir) | (lo decide el PO) |

Una pregunta que bloquea G4 deja la feature en NO READY. Cuando se responde, la respuesta va a `docs/analisis/decisiones.md` y aquí se enlaza.

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-03 v1.3), sin cambiar su contenido — Revisado por: (pendiente)
