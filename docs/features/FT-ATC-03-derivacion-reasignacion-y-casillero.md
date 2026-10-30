---
id: "FT-ATC-03"
tipo: feature
titulo: "Derivación, reasignación y casillero"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["EP-ATC-02", "HU-ATC-007", "HU-ATC-008", "HU-ATC-009"]
tags: [feature, plt-03, ui]
---

# PLT-03 - FT-ATC-03 Derivación, reasignación y casillero

| ID | Nombre | Épica padre |
|---|---|---|
| FT-ATC-03 | Derivación, reasignación y casillero | EP-ATC-02 Enrutamiento, SLA y alertas |
| **Product Owner** | **Prioridad (MoSCoW)** | **Estado** |
| Eddie Huamaní (PO) | Debe | Refinamiento |
| **Release objetivo** | **Estimación** | **Fecha / Versión** |
| v1.0 · Etapa 1 · 03-nov-2026 | M · 11 h · 11 h de desarrollo · Dev 2 | 16-oct-2026 · v1.3 |
| **Desarrollador** | **Ventana (PLT-01)** | **Predecesora** |
| Dev 2 (Jesús) | 21-oct-2026 → 22-oct-2026 | — |

## 1 Descripción y valor

Permite derivar tickets entre las 6 áreas del flujo (con o sin persona), reasignar en bloque cuando un colaborador cesa y ver la bandeja de pendientes por área y responsable.

**Beneficio:** Ningún ticket se pierde al cambiar de manos y cada colaborador ve su carga real.

**Usuarios:** Gestor de tickets · Colaborador de área · Supervisor ATC

## 2 Requerimientos funcionales

| ID | Requerimiento | Prioridad (MoSCoW) | Origen | Criterio de verificación | Horas | Predecesora | Estado |
|---|---|---|---|---|---|---|---|
| RF-SVC-007 | El sistema debe derivar tickets entre las 6 áreas y colaboradores registrando cada movimiento con motivo en bitácora append-only. | Debe | PROC-SVC-003 · Gestor de tickets | Cada movimiento es una fila nueva con motivo | 4 | — | Pend. DoR |
| RF-SVC-008 | El sistema debe reasignar los tickets pendientes de un colaborador que rota o cesa, sin borrar el rastro anterior. | Debe | PROC-SVC-003 · Supervisor ATC | Fila nueva REASSIGNMENT_* por ticket | 4 | RF-SVC-007 | Pend. DoR |
| RF-SVC-009 | El sistema debe ofrecer el casillero por área y responsable como consulta sobre los tickets, sin tabla adicional. | Debe | PROC-SVC-003 · Colaborador de área | Resultado = área actual + responsable + estado | 3 | RF-SVC-007 | Pend. DoR |

Ruta crítica: RF-SVC-007 → RF-SVC-008 (8 h).

## 3 Requerimientos no funcionales

| ID | Categoría | Requerimiento | Métrica / umbral | Prioridad |
|---|---|---|---|---|
| RNF-AUD-004 | Auditoría | Cinco bitácoras append-only firmadas | hash_mismatch: 0 en el job de auditoría | Debe |
| RNF-SEC-008 | Seguridad | DLP en bitácoras y narrativa por rol | acceso_narrativa_por_rol: columnas de narrativa solo para roles de atención/legal | Debe |

## 4 Reglas de negocio

| ID | Regla | Fuente |
|---|---|---|
| RN-SVC-006 | Asignación append-only. Cada movimiento de área/responsable es fila nueva con motivo tipificado; los punteros actuales son denormalizados | Negocio · Excel 05_Catalogos |
| RN-SVC-012 | DLP en bitácoras. Prohibido registrar PII en los campos Notes_*: solo el motivo operativo del movimiento | Ley 29733 · Seguridad TI |

## 5 Trazabilidad

| RF | HU | Dependencia | Riesgo |
|---|---|---|---|
| RF-SVC-007 | HU-ATC-007 · Iteración 1 · Dev 2 · mié 21-oct | DEP-02 maestro local de roles y líderes | R-05 |
| RF-SVC-008 | HU-ATC-008 · Iteración 1 · Dev 2 · mié 21-oct → jue 22-oct | DEP-02 maestro local de roles y líderes | R-05 |
| RF-SVC-009 | HU-ATC-009 · Iteración 1 · Dev 2 · jue 22-oct | DEP-02 maestro local de roles y líderes | R-05 |

Cada RF llega a una HU, y cada criterio de la HU a un TC de `docs/pruebas/test-plan.md` (pendiente: lo define QA).

## 6 Fuera de alcance

- Asignación por habilidades avanzadas (la reasignación por carga está en FT-ATC-18); integración con RR. HH. para detectar ceses (manual en v1.0).

## 7 Preguntas abiertas

| # | Pregunta | Dueño | Fecha límite | Bloquea G4 |
|---|---|---|---|---|
| P-01 | ¿Quién puede reasignar en bloque: solo el supervisor o también el jefe de área? ¿Hay un catálogo cerrado de motivos de derivación? | (por asignar) | (por definir) | (lo decide el PO) |

Una pregunta que bloquea G4 deja la feature en NO READY. Cuando se responde, la respuesta va a `docs/analisis/decisiones.md` y aquí se enlaza.

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-03 v1.3), sin cambiar su contenido — Revisado por: (pendiente)
