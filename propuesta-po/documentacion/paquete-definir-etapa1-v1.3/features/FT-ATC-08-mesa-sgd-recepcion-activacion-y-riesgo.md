---
id: "FT-ATC-08"
tipo: feature
titulo: "Mesa SGD: recepción, activación y riesgo"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["EP-ATC-04", "HU-ATC-020", "HU-ATC-021", "HU-ATC-022"]
tags: [feature, plt-03, ui]
---

# PLT-03 - FT-ATC-08 Mesa SGD: recepción, activación y riesgo

| ID | Nombre | Épica padre |
|---|---|---|
| FT-ATC-08 | Mesa SGD: recepción, activación y riesgo | EP-ATC-04 Gate legal Eje 3 y Mesa de Casos sensibles |
| **Product Owner** | **Prioridad (MoSCoW)** | **Estado** |
| Eddie Huamaní (PO) | Debe | Refinamiento |
| **Release objetivo** | **Estimación** | **Fecha / Versión** |
| v1.0 · Etapa 1 · 03-nov-2026 | M · 11 h · 11 h de desarrollo · Dev 2 | 16-oct-2026 · v1.3 |
| **Desarrollador** | **Ventana (PLT-01)** | **Predecesora** |
| Dev 2 (Jesús) | 28-oct-2026 → 29-oct-2026 | FT-ATC-07 |

## 1 Descripción y valor

Registra los casos sensibles de las 5 líneas de ingreso con Código Único, separa el cargo previo del cargo de activación (que inicia el SLA de línea) y calcula el riesgo con una matriz objetiva recalibrable.

**Beneficio:** Trazabilidad única de casos sensibles y priorización objetiva.

**Usuarios:** Mesa de Casos (SGD) · Gestor de reclamos

## 2 Requerimientos funcionales

| ID | Requerimiento | Prioridad (MoSCoW) | Origen | Criterio de verificación | Horas | Predecesora | Estado |
|---|---|---|---|---|---|---|---|
| RF-SVC-020 | El sistema debe registrar todo caso sensible por su línea de origen (5 líneas) con un Código Único Estandarizado. | Debe | PROC-SVC-009 · Mesa de Casos (SGD) | Código nunca reutilizado | 4 | — | Pend. DoR |
| RF-SVC-021 | El sistema debe emitir el cargo previo de asignación y un cargo de activación separado; el SLA de línea inicia solo con la activación. | Debe | PROC-SVC-009 · Mesa de Casos (SGD) | SLA inicia en la fecha de activación | 3 | RF-SVC-020 | Pend. DoR |
| RF-SVC-022 | El sistema debe calcular el nivel de riesgo con una matriz objetiva de criterios ponderados y permitir recalibrarlo con registro. | Debe | PROC-SVC-009 · Mesa de Casos (SGD) | Nivel resultante de la matriz, no de opinión | 4 | RF-SVC-020 | Pend. DoR |

Ruta crítica: RF-SVC-020 → RF-SVC-022 (8 h).

## 3 Requerimientos no funcionales

| ID | Categoría | Requerimiento | Métrica / umbral | Prioridad |
|---|---|---|---|---|
| RNF-CUM-015 | Cumplimiento | IGDC: Índice de Gestión Documentaria y de Casos | igdc_score: IGDC = (CASOS x 0,60) + (CUSTODIA x 0,40); se multiplica por cero si hay incumplimiento de un plazo legal externo o acceso indebido a un caso sensible, cada uno de forma independiente | Debe |
| RNF-SEC-008 | Seguridad | DLP en bitácoras y narrativa por rol | acceso_narrativa_por_rol: columnas de narrativa solo para roles de atención/legal | Debe |

## 4 Reglas de negocio

| ID | Regla | Fuente |
|---|---|---|
| RN-SVC-014 | Cinco lineas de ingreso de casos sensibles. Los casos sensibles ingresan por 5 lineas: Indecopi (procedimientos administrativos directos), Libro de Reclamaciones (canales regulados), Cartas Notariales (valor probatorio), Legal Atiende (preventivo, antes de escalar a reclamo formal) y Backlog Historico (casos previos sin cierre formal) | Negocio · Excel 05_Catalogos |
| RN-SVC-015 | Cargo previo distinto del cargo de activación. El SLA de un caso no arranca con el cargo previo de asignación sino con el cargo de activación formal; un cargo previo sin activación deja el caso en el limbo | Negocio · Excel 05_Catalogos |
| RN-SVC-016 | Clasificación de riesgo objetiva y recalibrable. El nivel de riesgo de un caso se calcula con una matriz objetiva (nunca por percepción) y se recalibra si el caso evoluciona con nuevos elementos o vinculación con otros casos | Negocio · Excel 05_Catalogos |

## 5 Trazabilidad

| RF | HU | Dependencia | Riesgo |
|---|---|---|---|
| RF-SVC-020 | HU-ATC-020 · Iteración 2 · Dev 2 · mié 28-oct | Modelo de datos SGD | R-06, R-08 |
| RF-SVC-021 | HU-ATC-021 · Iteración 2 · Dev 2 · mié 28-oct → jue 29-oct | Modelo de datos SGD | R-06, R-08 |
| RF-SVC-022 | HU-ATC-022 · Iteración 2 · Dev 2 · jue 29-oct | Modelo de datos SGD | R-06, R-08 |

Cada RF llega a una HU, y cada criterio de la HU a un TC de `docs/pruebas/test-plan.md` (pendiente: lo define QA).

## 6 Fuera de alcance

- Digitalización del pendientes de producto histórico en papel (proyecto aparte).

## 7 Preguntas abiertas

| # | Pregunta | Dueño | Fecha límite | Bloquea G4 |
|---|---|---|---|---|
| P-01 | ¿Cuál es el plazo de SLA de cada línea? ¿Qué criterios y ponderaciones tiene la matriz de riesgo? ¿Formato del Código Único? | (por asignar) | (por definir) | (lo decide el PO) |

Una pregunta que bloquea G4 deja la feature en NO READY. Cuando se responde, la respuesta va a `docs/analisis/decisiones.md` y aquí se enlaza.

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-03 v1.3), sin cambiar su contenido — Revisado por: (pendiente)
