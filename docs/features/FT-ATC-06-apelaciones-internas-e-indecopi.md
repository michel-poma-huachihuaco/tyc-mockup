---
id: "FT-ATC-06"
tipo: feature
titulo: "Apelaciones internas e INDECOPI"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["EP-ATC-03", "HU-ATC-016"]
tags: [feature, plt-03, ui]
---

# PLT-03 - FT-ATC-06 Apelaciones internas e INDECOPI

| ID | Nombre | Épica padre |
|---|---|---|
| FT-ATC-06 | Apelaciones internas e INDECOPI | EP-ATC-03 Libro de Reclamaciones y apelaciones |
| **Product Owner** | **Prioridad (MoSCoW)** | **Estado** |
| Eddie Huamaní (PO) | Debe | Refinamiento |
| **Release objetivo** | **Estimación** | **Fecha / Versión** |
| v1.0 · Etapa 1 · 03-nov-2026 | S·3h · 3 h de desarrollo · Dev 1 | 16-oct-2026 · v1.3 |
| **Desarrollador** | **Ventana (PLT-01)** | **Predecesora** |
| Dev 1 (Brayan) | 28-oct-2026 → 29-oct-2026 | FT-ATC-05 |

## 1 Descripción y valor

Registra la apelación del consumidor en segunda instancia interna o ante INDECOPI, con número de caso, estados e historial hasta la resolución final.

**Beneficio:** Seguimiento completo del reclamo hasta su cierre definitivo.

**Usuarios:** Responsable legal de reclamos

## 2 Requerimientos funcionales

| ID | Requerimiento | Prioridad (MoSCoW) | Origen | Criterio de verificación | Horas | Predecesora | Estado |
|---|---|---|---|---|---|---|---|
| RF-SVC-016 | El sistema debe gestionar apelaciones con estados PENDING … WITHDRAWN, número de caso y resolución de INDECOPI, con historial. | Debe | PROC-SVC-006 · Responsable legal de reclamos | Historial de estados completo | 3 | — | Pend. DoR |

Ruta crítica: RF-SVC-016 (3 h).

## 3 Requerimientos no funcionales

| ID | Categoría | Requerimiento | Métrica / umbral | Prioridad |
|---|---|---|---|---|
| RNF-CUM-007 | Cumplimiento | Evidencia probatoria inmutable | documentos_probatorios_sin_checksum: 0 | Debe |
| RNF-AUD-004 | Auditoría | Cinco bitácoras append-only firmadas | hash_mismatch: 0 en el job de auditoría | Debe |

## 4 Reglas de negocio

| ID | Regla | Fuente |
|---|---|---|
| RN-SVC-010 | Respuesta valida con cargo. Respuesta generica sin número de reclamo ni cargo al consumidor no cuenta ante INDECOPI; la carta PDF con cargo entra al IntegrityHash | Ley 29571 · INDECOPI |

## 5 Trazabilidad

| RF | HU | Dependencia | Riesgo |
|---|---|---|---|
| RF-SVC-016 | HU-ATC-016 · Iteración 2 · Dev 1 · mié 28-oct → jue 29-oct | DEP-06 S3/GLI | R-03 |

Cada RF llega a una HU, y cada criterio de la HU a un TC de `docs/pruebas/test-plan.md` (pendiente: lo define QA).

## 6 Fuera de alcance

- Gestión del procedimiento administrativo sancionador y de los escritos legales.

## 7 Preguntas abiertas

| # | Pregunta | Dueño | Fecha límite | Bloquea G4 |
|---|---|---|---|---|
| P-01 | ¿Cuál es el plazo interno para resolver la segunda instancia? | (por asignar) | (por definir) | (lo decide el PO) |

Una pregunta que bloquea G4 deja la feature en NO READY. Cuando se responde, la respuesta va a `docs/analisis/decisiones.md` y aquí se enlaza.

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-03 v1.3), sin cambiar su contenido — Revisado por: (pendiente)
