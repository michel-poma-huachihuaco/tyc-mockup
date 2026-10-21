---
id: "FT-ATC-09"
tipo: feature
titulo: "Escalamiento, vinculación y cierre tipificado"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["EP-ATC-04", "HU-ATC-023", "HU-ATC-024", "HU-ATC-025"]
tags: [feature, plt-03, ui]
---

# PLT-03 - FT-ATC-09 Escalamiento, vinculación y cierre tipificado

| ID | Nombre | Épica padre |
|---|---|---|
| FT-ATC-09 | Escalamiento, vinculación y cierre tipificado | EP-ATC-04 Gate legal Eje 3 y Mesa de Casos sensibles |
| **Product Owner** | **Prioridad (MoSCoW)** | **Estado** |
| Eddie Huamaní (PO) | Debe | Refinamiento |
| **Release objetivo** | **Estimación** | **Fecha / Versión** |
| v1.0 · Etapa 1 · 03-nov-2026 | L · 12 h · 12 h de desarrollo · Dev 2 | 16-oct-2026 · v1.3 |
| **Desarrollador** | **Ventana (PLT-01)** | **Predecesora** |
| Dev 2 (Jesús) | 29-oct-2026 → 2-nov-2026 | FT-ATC-08 |

## 1 Descripción y valor

Escala en cadena los casos que incumplen su SLA de línea, valida si un caso nuevo está vinculado a uno existente y cierra cada caso en uno de los 8 estados homologados, con evidencia y custodia en el GLI.

**Beneficio:** Ningún caso se estanca sin que una instancia superior lo sepa; cierres comparables y auditables.

**Usuarios:** Mesa de Casos (SGD) · Jefaturas · Comité de Asistentes · Directorio

## 2 Requerimientos funcionales

| ID | Requerimiento | Prioridad (MoSCoW) | Origen | Criterio de verificación | Horas | Predecesora | Estado |
|---|---|---|---|---|---|---|---|
| RF-SVC-023 | El sistema debe escalar automáticamente, sin saltar niveles: alerta temprana, memorándum a jefatura, Comité y Directorio. | Debe | PROC-SVC-010 · Mesa de Casos (SGD) | Secuencia de niveles sin saltos | 5 | — | Pend. DoR |
| RF-SVC-024 | El sistema debe validar si un caso nuevo está vinculado a uno existente antes de registrarlo como independiente. | Debe | PROC-SVC-010 · Mesa de Casos (SGD) | Casos vinculados comparten un hilo de evidencia | 4 | — | Pend. DoR |
| RF-SVC-025 | El sistema debe cerrar cada caso en uno de los 8 estados homologados, con evidencia, y referenciar la custodia en el GLI. | Debe | PROC-SVC-010 · Mesa de Casos (SGD) | Sin evidencia no hay cierre | 3 | RF-SVC-023, RF-SVC-024 | Pend. DoR |

Ruta crítica: RF-SVC-023 → RF-SVC-025 (8 h).

## 3 Requerimientos no funcionales

| ID | Categoría | Requerimiento | Métrica / umbral | Prioridad |
|---|---|---|---|---|
| RNF-CUM-007 | Cumplimiento | Evidencia probatoria inmutable | documentos_probatorios_sin_checksum: 0 | Debe |
| RNF-CUM-015 | Cumplimiento | IGDC: Índice de Gestión Documentaria y de Casos | igdc_score: IGDC = (CASOS x 0,60) + (CUSTODIA x 0,40); se multiplica por cero si hay incumplimiento de un plazo legal externo o acceso indebido a un caso sensible, cada uno de forma independiente | Debe |

## 4 Reglas de negocio

| ID | Regla | Fuente |
|---|---|---|
| RN-SVC-017 | Escalamiento en cadena sin saltos. El incumplimiento de SLA de un caso sensible escala en cadena: alerta preventiva, alerta de vencimiento, memorandum a la jefatura, escalado a Comite y escalado a Directorio, sin saltar niveles | Negocio · Excel 05_Catalogos |
| RN-SVC-018 | Caso vinculado no se duplica. Un caso cruzado o vinculado con otro no se registra como caso independiente; se gestiona con un solo hilo de evidencia | Negocio · Excel 05_Catalogos |
| RN-SVC-019 | Cierre tipificado por ocho estados homologados. Todo cierre de caso se tipifica en uno de ocho estados homologados (conforme, con observación, con riesgo mitigado, con contingencia, por desistimiento, por derivación legal, por regularización documentaria, por acuerdo con cliente) o se reabre; un cierre sin evidencia no es cierre | Negocio · Excel 05_Catalogos |
| RN-SVC-020 | Custodia legal separada de la plataforma operativa. Los originales probatorios críticos se custodian en el Repositorio Legal Controlado (GLI); la plataforma de trazabilidad operativa nunca reemplaza esa custodia | Negocio · Excel 05_Catalogos |

## 5 Trazabilidad

| RF | HU | Dependencia | Riesgo |
|---|---|---|---|
| RF-SVC-023 | HU-ATC-023 · Iteración 2 · Dev 2 · jue 29-oct → vie 30-oct | DEP-06 GLI | R-06 |
| RF-SVC-024 | HU-ATC-024 · Iteración 2 · Dev 2 · vie 30-oct → lun 02-nov | DEP-06 GLI | R-06 |
| RF-SVC-025 | HU-ATC-025 · Iteración 2 · Dev 2 · lun 02-nov | DEP-06 GLI | R-06 |

Cada RF llega a una HU, y cada criterio de la HU a un TC de `docs/pruebas/test-plan.md` (pendiente: lo define QA).

## 6 Fuera de alcance

- Gestión de agendas del Comité y del Directorio.

## 7 Preguntas abiertas

| # | Pregunta | Dueño | Fecha límite | Bloquea G4 |
|---|---|---|---|---|
| P-01 | ¿Umbrales de tiempo entre cada nivel de escalamiento? ¿Qué criterio define que dos casos «coinciden en hechos»? PLATAFORMA DE ATENCIÓN AL CLIENTE Aybar Atiende · Etapa de diseño y planeamiento | (por asignar) | (por definir) | (lo decide el PO) |

Una pregunta que bloquea G4 deja la feature en NO READY. Cuando se responde, la respuesta va a `docs/analisis/decisiones.md` y aquí se enlaza.

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-03 v1.3), sin cambiar su contenido — Revisado por: (pendiente)
