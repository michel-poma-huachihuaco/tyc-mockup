---
id: "FT-ATC-16"
tipo: feature
titulo: "Integración con Legal y prevención de denuncias"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["EP-ATC-10", "HU-ATC-040", "HU-ATC-041"]
tags: [feature, plt-03, ui]
---

# PLT-03 - FT-ATC-16 Integración con Legal y prevención de denuncias

| ID | Nombre | Épica padre |
|---|---|---|
| FT-ATC-16 | Integración con Legal y prevención de denuncias | EP-ATC-10 Consulta 360 e integraciones operativas |
| **Product Owner** | **Prioridad (MoSCoW)** | **Estado** |
| Eddie Huamaní (PO) | Debe | Refinamiento |
| **Release objetivo** | **Estimación** | **Fecha / Versión** |
| v1.0 · Etapa 1 · 03-nov-2026 | M·9h · 9 h de desarrollo · Dev 4 | 16-oct-2026 · v1.3 |
| **Desarrollador** | **Ventana (PLT-01)** | **Predecesora** |
| Dev 4 (Daniel) | 26-oct-2026 → 28-oct-2026 | — |

## 1 Descripción y valor

Sincroniza los tickets del Eje 3 con la herramienta del equipo de Legal y calcula la exposición económica (monto + interés legal referencial) de los reclamos con riesgo de denuncia para priorizarlos.

**Beneficio:** Un solo registro de cada caso legal y foco en los que pueden terminar en denuncia.

**Usuarios:** Responsable legal de reclamos · Coordinador CX · Gestor de tickets

## 2 Requerimientos funcionales

| ID | Requerimiento | Prioridad (MoSCoW) | Origen | Criterio de verificación | Horas | Predecesora | Estado |
|---|---|---|---|---|---|---|---|
| RF-SVC-040 | El sistema debe sincronizar los tickets derivados a Eje 3 con la herramienta que usa el equipo de Legal (responsable: Rosario), enviando el paquete mínimo y recibiendo estado y resolución. | Debe | PROC-SVC-015 · Responsable legal de reclamos · Feedback presentación · ítem 2 | Caso visible en la herramienta de Legal con el N.º de ticket | 5 | — | Pend. DoR |
| RF-SVC-041 | El sistema debe identificar los tickets con riesgo de escalar a denuncia o INDECOPI y calcular su exposición económica (monto reclamado + interés legal referencial del 8 %) para priorizarlos y alertar a Legal. | Debe | PROC-SVC-015 · Coordinador CX · Feedback presentación · ítem 16 | Exposición = monto + interés legal al día | 4 | — | Pend. DoR |

Ruta crítica: RF-SVC-040 (5 h).

## 3 Requerimientos no funcionales

| ID | Categoría | Requerimiento | Métrica / umbral | Prioridad |
|---|---|---|---|---|
| RNF-INT-009 | Interoperabilidad | Integración con Legal sin doble registro | minutos_sincronizacion_legal: ≤ 15 min; 0 casos con doble registro | Debe |
| RNF-AUD-004 | Auditoría | Cinco bitácoras append-only firmadas | hash_mismatch: 0 en el job de auditoría | Debe |

## 4 Reglas de negocio

| ID | Regla | Fuente |
|---|---|---|
| RN-SVC-021 | Gate: un caso de conflicto no se resuelve en Eje 1/2. Un caso de conflicto (carta notarial, INDECOPI, abogado, prensa) no se resuelve en Eje 1/2: se deriva de inmediato al Eje 3 (Legal); es un gate no compensable | Negocio · Excel 05_Catalogos |
| RN-SVC-022 | Gate: derivación sin paquete mínimo. Una derivación entre ejes sin criterio objetivo, sin paquete mínimo completo o sin trazabilidad es un gate no compensable | Negocio · Excel 05_Catalogos |
| RN-SVC-034 | Exposición económica por denuncia. Exposición = monto reclamado + interés legal (tasa referencial 8 % anual, a validar con Legal) desde la fecha del reclamo; los casos con mayor exposición se priorizan | Negocio · Excel 05_Catalogos |
| RN-SVC-016 | Clasificación de riesgo objetiva y recalibrable. El nivel de riesgo de un caso se calcula con una matriz objetiva (nunca por percepción) y se recalibra si el caso evoluciona con nuevos elementos o vinculación con otros casos | Negocio · Excel 05_Catalogos |

## 5 Trazabilidad

| RF | HU | Dependencia | Riesgo |
|---|---|---|---|
| RF-SVC-040 | HU-ATC-040 · Iteración 1 · Dev 4 · lun 26-oct → mar 27-oct | DEP-12 herramienta de Legal | R-02, R-06 |
| RF-SVC-041 | HU-ATC-041 · Iteración 2 · Dev 4 · mar 27-oct → mié 28-oct | DEP-12 herramienta de Legal | R-02, R-06 |

Cada RF llega a una HU, y cada criterio de la HU a un TC de `docs/pruebas/test-plan.md` (pendiente: lo define QA).

## 6 Fuera de alcance

- Gestión del expediente judicial; cálculo de costas.

## 7 Preguntas abiertas

| # | Pregunta | Dueño | Fecha límite | Bloquea G4 |
|---|---|---|---|---|
| P-01 | ¿Qué herramienta usa hoy Legal? ¿La tasa del 8 % es la que Legal quiere usar? ¿Qué señales definen riesgo de denuncia? | (por asignar) | (por definir) | (lo decide el PO) |

Una pregunta que bloquea G4 deja la feature en NO READY. Cuando se responde, la respuesta va a `docs/analisis/decisiones.md` y aquí se enlaza.

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-03 v1.3), sin cambiar su contenido — Revisado por: (pendiente)
