---
id: "FT-ATC-08"
tipo: feature
titulo: "Mesa SGD: recepción, activación y riesgo"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["EP-ATC-04", "AYB-0001"]
tags: [feature, plt-03]
---

# PLT-03 - FT-ATC-08 Mesa SGD: recepción, activación y riesgo

Va en `docs/features/FT-ATC-08-mesa-sgd-recepcion-activacion-riesgo.md`.

| ID | Nombre | Epica padre |
|---|---|---|
| FT-ATC-08 | Mesa SGD: recepción, activación y riesgo | EP-ATC-04 |
| **Product Owner** | **Prioridad (MoSCoW)** | **Estado** |
| Eddie Huamaní | Debe | Borrador |
| **Release objetivo** | **Estimacion** | **Fecha / Version** |
| v1.0 - 30-oct-2026 (Dev 2 · lun 26-oct · Jesús) | 11 h (3 HU) | 2026-10-19 / v0.2 |

## 1 Descripción y valor

Registra los casos sensibles de las 5 líneas de ingreso con Código Único, separa el cargo previo del cargo de activación (que inicia el SLA de línea) y calcula el riesgo con una matriz objetiva recalibrable. Da trazabilidad única de casos sensibles y priorización objetiva.

## 2 Requerimientos funcionales

| ID | Requerimiento | Prioridad (MoSCoW) | Origen | Criterio de verificación | Estado |
|---|---|---|---|---|---|
| RF-SVC-020 | El sistema debe registrar todo caso sensible por su línea de origen (5 líneas) con un Código Único Estandarizado. | Debe | Mesa de Casos (SGD) | Código nunca reutilizado | Propuesto |
| RF-SVC-021 | El sistema debe emitir el cargo previo de asignación y un cargo de activación separado; el SLA de línea inicia solo con la activación. | Debe | Mesa de Casos (SGD) | SLA inicia en la fecha de activación | Propuesto |
| RF-SVC-022 | El sistema debe calcular el nivel de riesgo de cada caso con una matriz objetiva de criterios ponderados y permitir recalibrarlo con registro. | Debe | Mesa de Casos (SGD) | Nivel resultante de la matriz, no de opinión | Propuesto |

## 3 Requerimientos no funcionales

| ID | Categoria | Requerimiento | Metrica / umbral |
|---|---|---|---|
| RNF-CUM-015 | Cumplimiento | IGDC: Índice de Gestión Documentaria y de Casos | igdc_score = (CASOS x 0,60) + (CUSTODIA x 0,40); se multiplica por cero si hay incumplimiento de un plazo legal externo o acceso indebido a un caso sensible |
| RNF-SEC-008 | Seguridad | DLP en bitácoras y narrativa por rol | acceso_narrativa_por_rol: columnas de narrativa solo para roles de atención/legal |

## 4 Reglas de negocio

| ID | Regla | Fuente |
|---|---|---|
| RN-SVC-014 | Cinco líneas de ingreso de casos sensibles: Indecopi, Libro de Reclamaciones, Cartas Notariales, Legal Atiende y Backlog Histórico | Negocio |
| RN-SVC-015 | Cargo previo distinto del cargo de activación: el SLA no arranca con el cargo previo | Negocio |
| RN-SVC-016 | Clasificación de riesgo objetiva y recalibrable con una matriz | Negocio |

## 5 Trazabilidad

| RF | HU (PLT-04 v1.2) | Horas / Asignación | Dependencia | Riesgo |
|---|---|---|---|---|
| RF-SVC-020 | HU-ATC-020 — Registrar un caso sensible con Código Único | 4 h · Dev 2 (Jesús) (2026-10-26 → 2026-10-27) | HU-ATC-028 | R-06, R-08 |
| RF-SVC-021 | HU-ATC-021 — Emitir cargo previo y cargo de activación por separado | 3 h · Dev 2 (Jesús) (2026-10-27 → 2026-10-27) | HU-ATC-020 | R-06, R-08 |
| RF-SVC-022 | HU-ATC-022 — Clasificar el riesgo del caso con matriz objetiva | 4 h · Dev 2 (Jesús) (2026-10-27 → 2026-10-28) | HU-ATC-020 | R-06, R-08 |

## 6 Fuera de alcance

- Digitalización del backlog histórico en papel (proyecto aparte).

## 7 Preguntas abiertas

| # | Pregunta | Dueño | Fecha limite | Bloquea G4 |
|---|---|---|---|---|
| P-01 | ¿Cuál es el plazo de SLA de cada línea? | PO | por definir | Sí |
| P-02 | ¿Qué criterios y ponderaciones tiene la matriz de riesgo? | PO | por definir | Sí |
| P-03 | ¿Cuál es el formato del Código Único? | PO | por definir | Sí |

Generado por IA: actualizado con el detalle del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`) — Revisado por: pendiente
