---
id: "FT-ATC-06"
tipo: feature
titulo: "Apelaciones internas e INDECOPI"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["EP-ATC-03", "AYB-0001"]
tags: [feature, plt-03]
---

# PLT-03 - FT-ATC-06 Apelaciones internas e INDECOPI

Va en `docs/features/FT-ATC-06-apelaciones-internas-indecopi.md`.

| ID | Nombre | Epica padre |
|---|---|---|
| FT-ATC-06 | Apelaciones internas e INDECOPI | EP-ATC-03 |
| **Product Owner** | **Prioridad (MoSCoW)** | **Estado** |
| Eddie Huamaní | Debe | Borrador |
| **Release objetivo** | **Estimacion** | **Fecha / Version** |
| v1.0 - 30-oct-2026 (Dev 1 · mar 27-oct · Brayan) | 3 h (1 HU) | 2026-10-19 / v0.2 |

## 1 Descripción y valor

Registra la apelación del consumidor en segunda instancia interna o ante INDECOPI, con número de caso, estados e historial hasta la resolución final. Da seguimiento completo del reclamo hasta su cierre definitivo.

## 2 Requerimientos funcionales

| ID | Requerimiento | Prioridad (MoSCoW) | Origen | Criterio de verificación | Estado |
|---|---|---|---|---|---|
| RF-SVC-016 | El sistema debe gestionar apelaciones con estados PENDING, UNDER_REVIEW, RESOLVED_FAVOR_CUSTOMER, RESOLVED_FAVOR_COMPANY, WITHDRAWN, número de caso y resolución de INDECOPI cuando aplique, con historial. | Debe | Responsable legal de reclamos | Historial de estados completo | Propuesto |

## 3 Requerimientos no funcionales

| ID | Categoria | Requerimiento | Metrica / umbral |
|---|---|---|---|
| RNF-CUM-007 | Cumplimiento | Evidencia probatoria inmutable | documentos_probatorios_sin_checksum: 0 |
| RNF-AUD-004 | Auditoría | Cinco bitácoras append-only firmadas | hash_mismatch: 0 en el job de auditoría |

## 4 Reglas de negocio

| ID | Regla | Fuente |
|---|---|---|
| RN-SVC-010 | Respuesta válida con cargo; la carta PDF con cargo entra al IntegrityHash | Ley 29571 · INDECOPI |

## 5 Trazabilidad

| RF | HU (PLT-04 v1.2) | Horas / Asignación | Dependencia | Riesgo |
|---|---|---|---|---|
| RF-SVC-016 | HU-ATC-016 — Dar seguimiento a apelaciones internas y ante INDECOPI | 3 h · Dev 1 (Brayan) (2026-10-27 → 2026-10-27) | HU-ATC-015 | R-03 |

## 6 Fuera de alcance

- Gestión del procedimiento administrativo sancionador y de los escritos legales.

## 7 Preguntas abiertas

| # | Pregunta | Dueño | Fecha limite | Bloquea G4 |
|---|---|---|---|---|
| P-01 | ¿Cuál es el plazo interno para resolver la segunda instancia? | PO | por definir | No |

Generado por IA: actualizado con el detalle del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`) — Revisado por: pendiente
