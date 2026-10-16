---
id: "FT-ATC-16"
tipo: feature
titulo: "Integración con Legal y prevención de denuncias"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["EP-ATC-10", "AYB-0001"]
tags: [feature, plt-03]
---

# PLT-03 - FT-ATC-16 Integración con Legal y prevención de denuncias

Va en `docs/features/FT-ATC-16-integracion-legal-prevencion-denuncias.md`.

| ID | Nombre | Epica padre |
|---|---|---|
| FT-ATC-16 | Integración con Legal y prevención de denuncias | EP-ATC-10 |
| **Product Owner** | **Prioridad (MoSCoW)** | **Estado** |
| Eddie Huamaní | Debe | Borrador |
| **Release objetivo** | **Estimacion** | **Fecha / Version** |
| v1.0 - 30-oct-2026 | 9 h (talla M) | 2026-10-15 / v0.1 |

## 1 Descripción y valor

Sincroniza los tickets del Eje 3 con la herramienta del equipo de Legal y calcula la exposición económica (monto + interés legal referencial) de los reclamos con riesgo de denuncia para priorizarlos. Da un solo registro de cada caso legal y foco en los que pueden terminar en denuncia.

## 2 Requerimientos funcionales

| ID | Requerimiento | Prioridad (MoSCoW) | Origen | Criterio de verificación | Estado |
|---|---|---|---|---|---|
| RF-SVC-040 | El sistema debe sincronizar los tickets derivados a Eje 3 con la herramienta que usa el equipo de Legal (responsable: Rosario), enviando el paquete mínimo y recibiendo estado y resolución. | Debe | Responsable legal de reclamos | Caso visible en la herramienta de Legal con el N.º de ticket | Propuesto |
| RF-SVC-041 | El sistema debe identificar los tickets con riesgo de escalar a denuncia o INDECOPI y calcular su exposición económica (monto reclamado + interés legal referencial del 8%) para priorizarlos y alertar a Legal. | Debe | Coordinador CX | Exposición = monto + interés legal al día | Propuesto |

## 3 Requerimientos no funcionales

| ID | Categoria | Requerimiento | Metrica / umbral |
|---|---|---|---|
| RNF-INT-009 | Interoperabilidad | Integración con Legal sin doble registro | minutos_sincronizacion_legal ≤ 15 min; 0 casos con doble registro |
| RNF-AUD-004 | Auditoría | Cinco bitácoras append-only firmadas | hash_mismatch: 0 en el job de auditoría |

## 4 Reglas de negocio

| ID | Regla | Fuente |
|---|---|---|
| RN-SVC-021 | Gate: un caso de conflicto no se resuelve en Eje 1/2 | Negocio |
| RN-SVC-022 | Gate: derivación sin paquete mínimo es gate no compensable | Negocio |
| RN-SVC-034 | Exposición económica = monto reclamado + interés legal (tasa referencial 8% anual, a validar con Legal) | Negocio |
| RN-SVC-016 | Clasificación de riesgo objetiva y recalibrable | Negocio |

## 5 Trazabilidad

| RF | HU | Dependencia | Riesgo |
|---|---|---|---|
| RF-SVC-040 | HU-ATC-040 | DEP-12 herramienta de Legal | R-02, R-06 |
| RF-SVC-041 | HU-ATC-041 | DEP-12 | R-02, R-06 |

## 6 Fuera de alcance

- Gestión del expediente judicial.
- Cálculo de costas.

## 7 Preguntas abiertas

| # | Pregunta | Dueño | Fecha limite | Bloquea G4 |
|---|---|---|---|---|
| P-01 | ¿Qué herramienta usa hoy Legal? | PO | por definir | Sí |
| P-02 | ¿La tasa del 8% es la que Legal quiere usar? | Legal | por definir | Sí |
| P-03 | ¿Qué señales definen "riesgo de denuncia"? | PO | por definir | Sí |

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) y del PDF `03_Funcionalidades_Catalogo_Requerimientos_Plataforma_ATC_AYBARCORP.pdf` — Revisado por: pendiente
