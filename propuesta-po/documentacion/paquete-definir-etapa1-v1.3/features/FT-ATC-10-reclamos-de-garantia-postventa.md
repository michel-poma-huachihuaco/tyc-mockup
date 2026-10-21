---
id: "FT-ATC-10"
tipo: feature
titulo: "Reclamos de garantía postventa"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["EP-ATC-05", "HU-ATC-033", "HU-ATC-034", "HU-ATC-035", "HU-ATC-036"]
tags: [feature, plt-03, ui]
---

# PLT-03 - FT-ATC-10 Reclamos de garantía postventa

| ID | Nombre | Épica padre |
|---|---|---|
| FT-ATC-10 | Reclamos de garantía postventa | EP-ATC-05 Postventa: reclamos de garantía |
| **Product Owner** | **Prioridad (MoSCoW)** | **Estado** |
| Eddie Huamaní (PO) | Debería | Refinamiento |
| **Release objetivo** | **Estimación** | **Fecha / Versión** |
| v1.0 · Etapa 1 · 03-nov-2026 | L · 12 h · 12 h de desarrollo · Dev 1 | 16-oct-2026 · v1.3 |
| **Desarrollador** | **Ventana (PLT-01)** | **Predecesora** |
| Dev 1 (Brayan) | 29-oct-2026 → 30-oct-2026 | — |

## 1 Descripción y valor

Registra reclamos de garantía vinculados al Acta de Entrega, valida la vigencia contra el periodo de cobertura, documenta la inspección técnica antes de resolver y escala a Legal si hay conflicto.

**Beneficio:** Postventa ordenada y defendible; rechazo automático de reclamos fuera de cobertura.

**Usuarios:** Gestor de Postventa · Inspector técnico · Cliente propietario

## 2 Requerimientos funcionales

| ID | Requerimiento | Prioridad (MoSCoW) | Origen | Criterio de verificación | Horas | Predecesora | Estado |
|---|---|---|---|---|---|---|---|
| RF-SVC-033 | El sistema debe registrar el reclamo de garantía tipificado y vinculado obligatoriamente a un Acta de Entrega existente. | Debería | PROC-SVC-013 · Gestor de Postventa | Sin Acta no hay reclamo | 4 | — | Pend. DoR |
| RF-SVC-034 | El sistema debe validar la vigencia contra el periodo de cobertura y la fecha real de entrega, y rechazar automáticamente lo que está fuera de cobertura. | Debería | PROC-SVC-013 · Gestor de Postventa | Fuera de cobertura = no procedente | 2 | RF-SVC-033 | Pend. DoR |
| RF-SVC-035 | El sistema debe registrar la inspección técnica con su evidencia antes de resolver el reclamo. | Debería | PROC-SVC-013 · Gestor de Postventa | Sin inspección no hay resolución | 3 | RF-SVC-033 | Pend. DoR |
| RF-SVC-036 | El sistema debe escalar a Eje 3 un reclamo de garantía que derive en conflicto legal y permitir gestionar la reincorporación contractual por adenda. | Debería | PROC-SVC-013 · Gestor de Postventa | Derivación sin intento de resolución en Eje 2 | 3 | RF-SVC-035 | Pend. DoR |

Ruta crítica: RF-SVC-033 → RF-SVC-035 → RF-SVC-036 (10 h).

## 3 Requerimientos no funcionales

| ID | Categoría | Requerimiento | Métrica / umbral | Prioridad |
|---|---|---|---|---|
| RNF-AUD-004 | Auditoría | Cinco bitácoras append-only firmadas | hash_mismatch: 0 en el job de auditoría | Debe |
| RNF-P (P) | Usabilidad | Registro de inspección desde móvil en obra | Responsive, fotos ≤ 10 MB | Debería |

## 4 Reglas de negocio

| ID | Regla | Fuente |
|---|---|---|
| RN-SVC-027 | Garantía siempre cuelga de una entrega y vigente por cobertura. Un reclamo de garantía siempre cuelga de una entrega previa (CONTRACT_UNIT_HANDOVER) y solo es procedente dentro del periodo de cobertura validado contra la fecha real de entrega | Negocio · Excel 05_Catalogos |
| RN-SVC-021 | Gate: un caso de conflicto no se resuelve en Eje 1/2. Un caso de conflicto (carta notarial, INDECOPI, abogado, prensa) no se resuelve en Eje 1/2: se deriva de inmediato al Eje 3 (Legal); es un gate no compensable | Negocio · Excel 05_Catalogos |

## 5 Trazabilidad

| RF | HU | Dependencia | Riesgo |
|---|---|---|---|
| RF-SVC-033 | HU-ATC-033 · Iteración 2 · Dev 1 · jue 29-oct | DEP-07 Contratos y Activos | R-05 |
| RF-SVC-034 | HU-ATC-034 · Iteración 2 · Dev 1 · jue 29-oct | DEP-07 Contratos y Activos | R-05 |
| RF-SVC-035 | HU-ATC-035 · Iteración 2 · Dev 1 · vie 30-oct | DEP-07 Contratos y Activos | R-05 |
| RF-SVC-036 | HU-ATC-036 · Iteración 2 · Dev 1 · vie 30-oct | DEP-07 Contratos y Activos | R-05 |

Cada RF llega a una HU, y cada criterio de la HU a un TC de `docs/pruebas/test-plan.md` (pendiente: lo define QA).

## 6 Fuera de alcance

- Órdenes de trabajo a contratistas, costos de reparación, almacén.

## 7 Preguntas abiertas

| # | Pregunta | Dueño | Fecha límite | Bloquea G4 |
|---|---|---|---|---|
| P-01 | ¿Periodos de cobertura por tipo de defecto? ¿La inspección la registra Postventa o un tercero? | (por asignar) | (por definir) | (lo decide el PO) |

Una pregunta que bloquea G4 deja la feature en NO READY. Cuando se responde, la respuesta va a `docs/analisis/decisiones.md` y aquí se enlaza.

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-03 v1.3), sin cambiar su contenido — Revisado por: (pendiente)
