---
id: "FT-ATC-19"
tipo: feature
titulo: "Asistencia al gestor: guía e IA"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["EP-ATC-09", "AYB-0001"]
tags: [feature, plt-03]
---

# PLT-03 - FT-ATC-19 Asistencia al gestor: guía e IA

Va en `docs/features/FT-ATC-19-asistencia-gestor-guia-ia.md`.

| ID | Nombre | Epica padre |
|---|---|---|
| FT-ATC-19 | Asistencia al gestor: guía e IA | EP-ATC-09 |
| **Product Owner** | **Prioridad (MoSCoW)** | **Estado** |
| Eddie Huamaní | Debería | Borrador |
| **Release objetivo** | **Estimacion** | **Fecha / Version** |
| v1.0 - 30-oct-2026 (Dev 3 · mié 21-oct · Michel) | 9 h (2 HU) | 2026-10-19 / v0.2 |

## 1 Descripción y valor

Muestra la guía de solución de cada tipo de ticket y usa IA para sugerir respuestas y verificar los criterios de cierre mientras el gestor atiende; el gestor siempre decide. Da respuestas más uniformes y de mejor calidad, y menos tiempo de capacitación.

## 2 Requerimientos funcionales

| ID | Requerimiento | Prioridad (MoSCoW) | Origen | Criterio de verificación | Estado |
|---|---|---|---|---|---|
| RF-SVC-047 | El sistema debe mostrar al gestor de tickets una guía de cómo solucionar cada tipo de ticket (pasos, plantillas de respuesta, documentos requeridos y criterios de cierre) mantenida por el administrador funcional. | Debería | Gestor de tickets | Guía versionada por tipo | Propuesto |
| RF-SVC-048 | El sistema debe usar IA para retroalimentar al gestor de tickets mientras atiende y al cerrar: sugerir respuesta, verificar que se cumplan los criterios de cierre de la guía y señalar tono o datos faltantes. | Podría | Asistente IA de atención | Toda sugerencia queda registrada con su decisión | Propuesto |

## 3 Requerimientos no funcionales

| ID | Categoria | Requerimiento | Metrica / umbral |
|---|---|---|---|
| RNF-SEC-009 | Seguridad | Uso seguro de IA | sugerencias_ia_con_datos_personales: 0; 100% de sugerencias registradas |

## 4 Reglas de negocio

| ID | Regla | Fuente |
|---|---|---|
| RN-SVC-032 | IA asesora, el gestor de tickets decide: ninguna respuesta se envía al cliente sin acción del gestor; sin datos personales hacia modelos externos | Negocio |
| RN-SVC-012 | DLP en bitácoras | Ley 29733 · Seguridad TI |
| RN-SVC-023 | Gate: cierre fuera de Mi Portal | Negocio |

## 5 Trazabilidad

| RF | HU (PLT-04 v1.2) | Horas / Asignación | Dependencia | Riesgo |
|---|---|---|---|---|
| RF-SVC-047 | HU-ATC-047 — Consultar la guía de solución del tipo de ticket | 4 h · Dev 3 (Michel) (2026-10-21 → 2026-10-22) | — | R-07 |
| RF-SVC-048 | HU-ATC-048 — Recibir retroalimentación de IA mientras atiendo y cierro | 5 h · Dev 3 (Michel) (2026-10-22 → 2026-10-23) | HU-ATC-047, DEP-14 (Proveedor de IA aprobado por TI y Seguridad, con política de datos personales) | R-07 |

## 6 Fuera de alcance

- Respuesta automática de la IA al cliente.
- Entrenamiento de modelos propios.

## 7 Preguntas abiertas

| # | Pregunta | Dueño | Fecha limite | Bloquea G4 |
|---|---|---|---|---|
| P-01 | ¿Qué proveedor de IA aprueban TI y Seguridad? | PO | 2026-10-21 | Sí |
| P-02 | ¿Quién redacta y aprueba las guías por área? | PO | por definir | Sí |

Generado por IA: actualizado con el detalle del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`) — Revisado por: pendiente
