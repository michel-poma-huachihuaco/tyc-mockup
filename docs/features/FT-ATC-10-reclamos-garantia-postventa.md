---
id: "FT-ATC-10"
tipo: feature
titulo: "Reclamos de garantía postventa"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["EP-ATC-05", "AYB-0001"]
tags: [feature, plt-03]
---

# PLT-03 - FT-ATC-10 Reclamos de garantía postventa

Va en `docs/features/FT-ATC-10-reclamos-garantia-postventa.md`.

| ID | Nombre | Epica padre |
|---|---|---|
| FT-ATC-10 | Reclamos de garantía postventa | EP-ATC-05 |
| **Product Owner** | **Prioridad (MoSCoW)** | **Estado** |
| Eddie Huamaní | Debería | Borrador |
| **Release objetivo** | **Estimacion** | **Fecha / Version** |
| v1.0 - 30-oct-2026 | 12 h (talla L) | 2026-10-15 / v0.1 |

## 1 Descripción y valor

Registra reclamos de garantía vinculados al Acta de Entrega, valida la vigencia contra el periodo de cobertura, documenta la inspección técnica antes de resolver y escala a Legal si hay conflicto. Da una postventa ordenada y defendible, con rechazo automático de reclamos fuera de cobertura.

## 2 Requerimientos funcionales

| ID | Requerimiento | Prioridad (MoSCoW) | Origen | Criterio de verificación | Estado |
|---|---|---|---|---|---|
| RF-SVC-033 | El sistema debe registrar el reclamo de garantía tipificado y vinculado obligatoriamente a un Acta de Entrega existente. | Debería | Gestor de Postventa | Sin Acta no hay reclamo | Propuesto |
| RF-SVC-034 | El sistema debe validar la vigencia contra el periodo de cobertura y la fecha real de entrega, y rechazar automáticamente lo que está fuera de cobertura. | Debería | Gestor de Postventa | Fuera de cobertura = no procedente | Propuesto |
| RF-SVC-035 | El sistema debe registrar la inspección técnica con su evidencia antes de resolver el reclamo. | Debería | Gestor de Postventa | Sin inspección no hay resolución | Propuesto |
| RF-SVC-036 | El sistema debe escalar a Eje 3 un reclamo de garantía que derive en conflicto legal y permitir gestionar la reincorporación contractual por adenda. | Debería | Gestor de Postventa | Derivación sin intento de resolución en Eje 2 | Propuesto |

## 3 Requerimientos no funcionales

| ID | Categoria | Requerimiento | Metrica / umbral |
|---|---|---|---|
| RNF-AUD-004 | Auditoría | Cinco bitácoras append-only firmadas | hash_mismatch: 0 en el job de auditoría |
| RNF-USA-005 (id a confirmar en el Excel origen) | Usabilidad | Registro de inspección desde móvil en obra | Responsive, fotos ≤ 10 MB |

## 4 Reglas de negocio

| ID | Regla | Fuente |
|---|---|---|
| RN-SVC-027 | Garantía siempre cuelga de una entrega (CONTRACT_UNIT_HANDOVER) y solo es procedente dentro del periodo de cobertura | Negocio |
| RN-SVC-021 | Gate: un caso de conflicto no se resuelve en Eje 1/2: se deriva de inmediato al Eje 3 | Negocio |

## 5 Trazabilidad

| RF | HU | Dependencia | Riesgo |
|---|---|---|---|
| RF-SVC-033 | HU-ATC-033 | DEP-07 Contratos y Activos | R-05 |
| RF-SVC-034 | HU-ATC-034 | DEP-07 | R-05 |
| RF-SVC-035 | HU-ATC-035 | DEP-07 | R-05 |
| RF-SVC-036 | HU-ATC-036 | DEP-07 | R-05 |

## 6 Fuera de alcance

- Gestión de contratistas y órdenes de trabajo de obra.
- Compras y almacén de materiales.
- Cálculo de costos de reparación.

## 7 Preguntas abiertas

| # | Pregunta | Dueño | Fecha limite | Bloquea G4 |
|---|---|---|---|---|
| P-01 | ¿Los periodos de cobertura varían por tipo de defecto? | PO | por definir | Sí |
| P-02 | ¿La inspección la registra Postventa o un tercero? | PO | por definir | No |

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) y del PDF `03_Funcionalidades_Catalogo_Requerimientos_Plataforma_ATC_AYBARCORP.pdf` — Revisado por: pendiente
