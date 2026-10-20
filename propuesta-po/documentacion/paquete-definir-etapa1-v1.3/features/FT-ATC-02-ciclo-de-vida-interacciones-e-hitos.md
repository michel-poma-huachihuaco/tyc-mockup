---
id: "FT-ATC-02"
tipo: feature
titulo: "Ciclo de vida, interacciones e hitos"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["EP-ATC-01", "HU-ATC-004", "HU-ATC-005", "HU-ATC-006"]
tags: [feature, plt-03, ui]
---

# PLT-03 - FT-ATC-02 Ciclo de vida, interacciones e hitos

| ID | Nombre | Épica padre |
|---|---|---|
| FT-ATC-02 | Ciclo de vida, interacciones e hitos | EP-ATC-01 Núcleo de tickets omnicanal |
| **Product Owner** | **Prioridad (MoSCoW)** | **Estado** |
| Eddie Huamaní (PO) | Debe | Refinamiento |
| **Release objetivo** | **Estimación** | **Fecha / Versión** |
| v1.0 · Etapa 1 · 03-nov-2026 | L · 13 h · 13 h de desarrollo · Dev 1 | 16-oct-2026 · v1.3 |
| **Desarrollador** | **Ventana (PLT-01)** | **Predecesora** |
| Dev 1 (Brayan) | 22-oct-2026 → 26-oct-2026 | FT-ATC-01 |

## 1 Descripción y valor

Gestiona los estados del ticket con historial inmutable, registra cada interacción marcando si es visible al cliente o nota interna (con adjuntos) y conserva los hitos temporales que prueban el cumplimiento.

**Beneficio:** Trazabilidad completa del caso y evidencia para medir el SLA incluso tras una reapertura.

**Usuarios:** Colaborador de área · Gestor de tickets · Supervisor ATC

## 2 Requerimientos funcionales

| ID | Requerimiento | Prioridad (MoSCoW) | Origen | Criterio de verificación | Horas | Predecesora | Estado |
|---|---|---|---|---|---|---|---|
| RF-SVC-004 | El sistema debe gestionar 7 estados y registrar cada transición con fecha y autor en un historial append-only. | Debe | PROC-SVC-002 · Colaborador de área | Cada cambio agrega una fila; ninguna se sobrescribe | 5 | — | Pend. DoR |
| RF-SVC-005 | El sistema debe registrar cada interacción con canal, gestor de tickets, visibilidad al cliente y evidencia multimedia adjunta. | Debe | PROC-SVC-002 · Colaborador de área | Nota interna nunca visible al cliente | 5 | RF-SVC-004 | Pend. DoR |
| RF-SVC-006 | El sistema debe registrar 1.ª respuesta, 1.ª resolución (inmutable), última resolución y cierre. | Debe | PROC-SVC-002 · Supervisor ATC | FirstResolvedDateTime no cambia tras reabrir | 3 | RF-SVC-004 | Pend. DoR |

Ruta crítica: RF-SVC-004 → RF-SVC-005 (10 h).

## 3 Requerimientos no funcionales

| ID | Categoría | Requerimiento | Métrica / umbral | Prioridad |
|---|---|---|---|---|
| RNF-AUD-004 | Auditoría | Cinco bitácoras append-only firmadas | hash_mismatch: 0 en el job de auditoría | Debe |
| RNF-SEC-008 | Seguridad | DLP en bitácoras y narrativa por rol | acceso_narrativa_por_rol: columnas de narrativa solo para roles de atención/legal | Debe |
| RNF-CUM-016 | Cumplimiento | Cierre formal 100% en Mi Portal | pct_tickets_cierre_formal_mi_portal: 100% (gate no compensable, Capa 1 del NPS-C) | Debe |

## 4 Reglas de negocio

| ID | Regla | Fuente |
|---|---|---|
| RN-SVC-002 | Compromisos congelados. FirstResponseDueDateTime y ResolutionDueDateTime se calculan al abrir y NO se recalculan si la política cambia después | Negocio · Excel 05_Catalogos |
| RN-SVC-006 | Asignación append-only. Cada movimiento de área/responsable es fila nueva con motivo tipificado; los punteros actuales son denormalizados | Negocio · Excel 05_Catalogos |
| RN-SVC-007 | Reapertura con nuevo compromiso. REOPENED incrementa ReopenCount y calcula ReopenedResolutionDueDateTime con la política vigente al reabrir; el compromiso original no se reescribe | Negocio · Excel 05_Catalogos |
| RN-SVC-012 | DLP en bitácoras. Prohibido registrar PII en los campos Notes_*: solo el motivo operativo del movimiento | Ley 29733 · Seguridad TI |
| RN-SVC-023 | Gate: cierre fuera de Mi Portal. Un ticket cerrado fuera de Mi Portal, sin cierre formal en el sistema, es un gate no compensable | Negocio · Excel 05_Catalogos |

## 5 Trazabilidad

| RF | HU | Dependencia | Riesgo |
|---|---|---|---|
| RF-SVC-004 | HU-ATC-004 · Iteración 1 · Dev 1 · jue 22-oct | DEP-02 maestro local de roles y líderes | R-07 |
| RF-SVC-005 | HU-ATC-005 · Iteración 1 · Dev 1 · vie 23-oct | DEP-02 maestro local de roles y líderes | R-07 |
| RF-SVC-006 | HU-ATC-006 · Iteración 1 · Dev 1 · vie 23-oct → lun 26-oct | DEP-02 maestro local de roles y líderes | R-07 |

Cada RF llega a una HU, y cada criterio de la HU a un TC de `docs/pruebas/test-plan.md` (pendiente: lo define QA).

## 6 Fuera de alcance

- Edición o borrado de interacciones ya registradas; chat en tiempo real con el cliente.

## 7 Preguntas abiertas

| # | Pregunta | Dueño | Fecha límite | Bloquea G4 |
|---|---|---|---|---|
| P-01 | ¿Qué tipos de archivo y tamaño máximo se aceptan como evidencia? ¿Cuánto tiempo después de RESOLVED pasa a CLOSED si el cliente no responde? | (por asignar) | (por definir) | (lo decide el PO) |

Una pregunta que bloquea G4 deja la feature en NO READY. Cuando se responde, la respuesta va a `docs/analisis/decisiones.md` y aquí se enlaza.

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-03 v1.3), sin cambiar su contenido — Revisado por: (pendiente)
