---
id: "FT-ATC-09"
tipo: feature
titulo: "Escalamiento, vinculación y cierre tipificado"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
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
| v1.0 - 30-oct-2026 | 12 h (talla L) | 2026-10-15 / v0.1 |

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

| RF | HU | Dependencia | Riesgo |
|---|---|---|---|
| RF-SVC-023 | HU-ATC-023 | DEP-06 GLI | R-06 |
| RF-SVC-024 | HU-ATC-024 | DEP-06 GLI | R-06 |
| RF-SVC-025 | HU-ATC-025 | DEP-06 GLI | R-06 |

## 6 Fuera de alcance

- Gestión de agendas del Comité y del Directorio.

## 7 Preguntas abiertas

| # | Pregunta | Dueño | Fecha limite | Bloquea G4 |
|---|---|---|---|---|
| P-01 | ¿Qué umbrales de tiempo separan cada nivel de escalamiento? | PO | por definir | Sí |
| P-02 | ¿Qué criterio define que dos casos "coinciden en hechos"? | PO | por definir | Sí |

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) y del PDF `03_Funcionalidades_Catalogo_Requerimientos_Plataforma_ATC_AYBARCORP.pdf` — Revisado por: pendiente
