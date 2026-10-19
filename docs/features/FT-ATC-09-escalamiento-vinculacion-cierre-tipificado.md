---
id: "FT-ATC-09"
tipo: feature
titulo: "Escalamiento, vinculación y cierre tipificado"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["EP-ATC-04", "AYB-0001"]
tags: [feature, plt-03]
---

# PLT-03 - FT-ATC-09 Escalamiento, vinculación y cierre tipificado

Va en `docs/features/FT-ATC-09-escalamiento-vinculacion-cierre-tipificado.md`.

| ID | Nombre | Epica padre |
|---|---|---|
| FT-ATC-09 | Escalamiento, vinculación y cierre tipificado | EP-ATC-04 |
| **Product Owner** | **Prioridad (MoSCoW)** | **Estado** |
| Eddie Huamaní | Debe | Borrador |
| **Release objetivo** | **Estimacion** | **Fecha / Version** |
| v1.0 - 30-oct-2026 (Dev 2 · mié 28-oct · Jesús) | 12 h (3 HU) | 2026-10-19 / v0.2 |

## 1 Descripción y valor

Escala en cadena los casos que incumplen su SLA de línea, valida si un caso nuevo está vinculado a uno existente y cierra cada caso en uno de los 8 estados homologados, con evidencia y custodia en el GLI. Ningún caso se estanca sin que una instancia superior lo sepa.

## 2 Requerimientos funcionales

| ID | Requerimiento | Prioridad (MoSCoW) | Origen | Criterio de verificación | Estado |
|---|---|---|---|---|---|
| RF-SVC-023 | El sistema debe escalar automáticamente, sin saltar niveles: alerta temprana, memorándum a jefatura, Comité y Directorio. | Debe | Mesa de Casos (SGD) | Secuencia de niveles sin saltos | Propuesto |
| RF-SVC-024 | El sistema debe validar si un caso nuevo está vinculado a uno existente antes de registrarlo como independiente. | Debe | Mesa de Casos (SGD) | Casos vinculados comparten un hilo de evidencia | Propuesto |
| RF-SVC-025 | El sistema debe cerrar cada caso en uno de los 8 estados homologados, con evidencia, y referenciar la custodia en el GLI. | Debe | Mesa de Casos (SGD) | Sin evidencia no hay cierre | Propuesto |

## 3 Requerimientos no funcionales

| ID | Categoria | Requerimiento | Metrica / umbral |
|---|---|---|---|
| RNF-CUM-007 | Cumplimiento | Evidencia probatoria inmutable | documentos_probatorios_sin_checksum: 0 |
| RNF-CUM-015 | Cumplimiento | IGDC: Índice de Gestión Documentaria y de Casos | igdc_score = (CASOS x 0,60) + (CUSTODIA x 0,40) |

## 4 Reglas de negocio

| ID | Regla | Fuente |
|---|---|---|
| RN-SVC-017 | Escalamiento en cadena sin saltos | Negocio |
| RN-SVC-018 | Caso vinculado no se duplica; un solo hilo de evidencia | Negocio |
| RN-SVC-019 | Cierre tipificado por ocho estados homologados | Negocio |
| RN-SVC-020 | Custodia legal separada de la plataforma operativa (GLI) | Negocio |

## 5 Trazabilidad

| RF | HU (PLT-04 v1.2) | Horas / Asignación | Dependencia | Riesgo |
|---|---|---|---|---|
| RF-SVC-023 | HU-ATC-023 — Escalar en cadena un caso que incumple su SLA | 5 h · Dev 2 (Jesús) (2026-10-28 → 2026-10-28) | HU-ATC-022 | R-06 |
| RF-SVC-024 | HU-ATC-024 — Validar casos cruzados o vinculados antes de registrar | 4 h · Dev 2 (Jesús) (2026-10-29 → 2026-10-29) | — | R-06 |
| RF-SVC-025 | HU-ATC-025 — Cerrar el caso con estado homologado y evidencia | 3 h · Dev 2 (Jesús) (2026-10-29 → 2026-10-29) | HU-ATC-023, HU-ATC-024, DEP-06 (Repositorio documental S3 + GOV_DOCUMENT_REPOSITORY y GLI) | R-06 |

## 6 Fuera de alcance

- Gestión de agendas del Comité y del Directorio.

## 7 Preguntas abiertas

| # | Pregunta | Dueño | Fecha limite | Bloquea G4 |
|---|---|---|---|---|
| P-01 | ¿Qué umbrales de tiempo separan cada nivel de escalamiento? | PO | por definir | Sí |
| P-02 | ¿Qué criterio define que dos casos "coinciden en hechos"? | PO | por definir | Sí |

Generado por IA: actualizado con el detalle del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`) — Revisado por: pendiente
