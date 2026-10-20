---
id: "FT-ATC-19"
tipo: feature
titulo: "Asistencia al gestor: guía e IA"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["EP-ATC-09", "HU-ATC-047", "HU-ATC-048"]
tags: [feature, plt-03, ui]
---

# PLT-03 - FT-ATC-19 Asistencia al gestor: guía e IA

| ID | Nombre | Épica padre |
|---|---|---|
| FT-ATC-19 | Asistencia al gestor: guía e IA | EP-ATC-09 Bandeja orquestadora y asistencia al gestor |
| **Product Owner** | **Prioridad (MoSCoW)** | **Estado** |
| Eddie Huamaní (PO) | Debería | Refinamiento |
| **Release objetivo** | **Estimación** | **Fecha / Versión** |
| v1.0 · Etapa 1 · 03-nov-2026 | M·9h · 9 h de desarrollo · Dev 3 | 16-oct-2026 · v1.3 |
| **Desarrollador** | **Ventana (PLT-01)** | **Predecesora** |
| Dev 3 (Michel) | 27-oct-2026 → 28-oct-2026 | — |

## 1 Descripción y valor

Muestra la guía de solución de cada tipo de ticket y usa IA para sugerir respuestas y verificar los criterios de cierre mientras el gestor atiende; el gestor siempre decide.

**Beneficio:** Respuestas más uniformes y de mejor calidad, y menos tiempo de capacitación.

**Usuarios:** Gestor de tickets · Administrador funcional ATC · Asistente IA

## 2 Requerimientos funcionales

| ID | Requerimiento | Prioridad (MoSCoW) | Origen | Criterio de verificación | Horas | Predecesora | Estado |
|---|---|---|---|---|---|---|---|
| RF-SVC-047 | El sistema debe mostrar al gestor de tickets una guía de como solucionar cada tipo de ticket (pasos, plantillas de respuesta, documentos requeridos y criterios de cierre) mantenida por el administrador funcional. | Debería | PROC-SVC-018 · Gestor de tickets · Feedback presentación · ítem 7 | Guía versionada por tipo | 4 | — | Pend. DoR |
| RF-SVC-048 (flexible) | El sistema debe usar IA para retroalimentar al gestor de tickets mientras atiende y al cerrar: sugerir respuesta, verificar que se cumplan los criterios de cierre de la guía y señalar tono o datos faltantes. | Podría | PROC-SVC-018 · Asistente IA de atención · Feedback presentación · ítem 8 | Toda sugerencia queda registrada con su decisión | 5 | RF-SVC-047 | Pend. DoR |

Ruta crítica: RF-SVC-047 → RF-SVC-048 (9 h).

## 3 Requerimientos no funcionales

| ID | Categoría | Requerimiento | Métrica / umbral | Prioridad |
|---|---|---|---|---|
| RNF-SEC-009 | Seguridad | Uso seguro de IA | sugerencias_ia_con_datos_personales: 0; 100 % de sugerencias registradas | Debe |

## 4 Reglas de negocio

| ID | Regla | Fuente |
|---|---|---|
| RN-SVC-032 | IA asesora, el gestor de tickets decide. La IA solo sugiere: el gestor de tickets acepta, edita o descarta; ninguna respuesta se envía al cliente sin acción del gestor de tickets y no se envían datos personales sin anonimizar a modelos externos | Negocio · Excel 05_Catalogos |
| RN-SVC-012 | DLP en bitácoras. Prohibido registrar PII en los campos Notes_*: solo el motivo operativo del movimiento | Ley 29733 · Seguridad TI |
| RN-SVC-023 | Gate: cierre fuera de Mi Portal. Un ticket cerrado fuera de Mi Portal, sin cierre formal en el sistema, es un gate no compensable | Negocio · Excel 05_Catalogos |

## 5 Trazabilidad

| RF | HU | Dependencia | Riesgo |
|---|---|---|---|
| RF-SVC-047 | HU-ATC-047 · Iteración 1 · Dev 3 · mar 27-oct | DEP-14 proveedor de IA aprobado | R-07 |
| RF-SVC-048 | HU-ATC-048 · Iteración 2 · Dev 3 · mar 27-oct → mié 28-oct | DEP-14 proveedor de IA aprobado | R-07 |

Cada RF llega a una HU, y cada criterio de la HU a un TC de `docs/pruebas/test-plan.md` (pendiente: lo define QA).

## 6 Fuera de alcance

- Respuesta automática de la IA al cliente; entrenamiento de modelos propios.

## 7 Preguntas abiertas

| # | Pregunta | Dueño | Fecha límite | Bloquea G4 |
|---|---|---|---|---|
| P-01 | ¿Qué proveedor de IA aprueban TI y Seguridad? ¿Quién redacta y aprueba las guías por área? | (por asignar) | (por definir) | (lo decide el PO) |

Una pregunta que bloquea G4 deja la feature en NO READY. Cuando se responde, la respuesta va a `docs/analisis/decisiones.md` y aquí se enlaza.

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-03 v1.3), sin cambiar su contenido — Revisado por: (pendiente)
