---
id: "FT-ATC-18"
tipo: feature
titulo: "Bandeja orquestadora y flujos por área"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["EP-ATC-09", "HU-ATC-043", "HU-ATC-044", "HU-ATC-045", "HU-ATC-046"]
tags: [feature, plt-03, ui]
---

# PLT-03 - FT-ATC-18 Bandeja orquestadora y flujos por área

| ID | Nombre | Épica padre |
|---|---|---|
| FT-ATC-18 | Bandeja orquestadora y flujos por área | EP-ATC-09 Bandeja orquestadora y asistencia al gestor |
| **Product Owner** | **Prioridad (MoSCoW)** | **Estado** |
| Eddie Huamaní (PO) | Debe | Refinamiento |
| **Release objetivo** | **Estimación** | **Fecha / Versión** |
| v1.0 · Etapa 1 · 03-nov-2026 | L · 19 h · 19 h de desarrollo · Dev 3 | 16-oct-2026 · v1.3 |
| **Desarrollador** | **Ventana (PLT-01)** | **Predecesora** |
| Dev 3 (Michel) | 21-oct-2026 → 23-oct-2026 | — |

## 1 Descripción y valor

Permite configurar flujos de trabajo por área sin desarrollo y reúne en una bandeja única los tickets de todos los canales, ordenados por rayo, SLA y prioridad, con reasignación automática por menor carga.

**Beneficio:** Cada gestor sabe qué atender primero y la carga se reparte de forma pareja.

**Usuarios:** Administrador funcional ATC · Supervisor ATC · Gestor de tickets

## 2 Requerimientos funcionales

| ID | Requerimiento | Prioridad (MoSCoW) | Origen | Criterio de verificación | Horas | Predecesora | Estado |
|---|---|---|---|---|---|---|---|
| RF-SVC-043 | El sistema debe permitir configurar, sin desarrollo, el flujo de trabajo de cada combinación de tipo y subtipo de ticket por área, con su responsable, sus actividades en orden y el SLA de cada actividad y del flujo completo. | Debe | PROC-SVC-017 · Administrador funcional ATC · Feedback presentación · ítem 6 | Tickets nuevos siguen el flujo publicado de su tipo, subtipo y área | 8 | — | Pend. DoR |
| RF-SVC-044 | El sistema debe ofrecer una bandeja orquestadora que reúne los tickets de todos los canales y los ordena y asigna según flujo, prioridad, marca de rayo y vencimiento de SLA. | Debe | PROC-SVC-017 · Supervisor ATC · Feedback presentación · ítem 11 | Orden: rayo > SLA más próximo > prioridad | 5 | RF-SVC-043 | Pend. DoR |
| RF-SVC-045 | El sistema debe permitir marcar un ticket con un icono de rayo que lo sube al tope de la bandeja, registrando quien lo marco y por que. | Debería | PROC-SVC-017 · Supervisor ATC · Feedback presentación · ítem 10 | Rayo solo por líder, con motivo y en bitácora | 2 | RF-SVC-044 | Pend. DoR |
| RF-SVC-046 | El sistema debe reasignar un ticket al gestor de tickets disponible del mismo área y habilidad con menor carga de trabajo cuando el responsable no esta disponible o su carga supera el límite. | Debería | PROC-SVC-017 · Job batch de ATC · Feedback presentación · ítem 18 | Motivo REASSIGNMENT_CARGA en la bitácora | 4 | RF-SVC-044 | Pend. DoR |

Ruta crítica: RF-SVC-043 → RF-SVC-044 → RF-SVC-046 (17 h).

## 3 Requerimientos no funcionales

| ID | Categoría | Requerimiento | Métrica / umbral | Prioridad |
|---|---|---|---|---|
| RNF-USA-002 | Usabilidad | Flujos configurables sin desarrollo | dias_configurar_flujo: ≤ 1 día hábil por flujo | Debería |
| RNF-USA-003 | Usabilidad | Término «Gestor de tickets» en toda la plataforma | textos_con_termino_anterior: 0 textos visibles con «agente» u «operador» | Debería |
| RNF-AUD-004 | Auditoría | Cinco bitácoras append-only firmadas | hash_mismatch: 0 en el job de auditoría | Debe |

## 4 Reglas de negocio

| ID | Regla | Fuente |
|---|---|---|
| RN-SVC-031 | Prioridad rayo controlada. Solo el supervisor o líder puede marcar un ticket con rayo; queda en bitácora con motivo y no puede superar el 10 % de la bandeja del área (umbral a validar) | Negocio · Excel 05_Catalogos |
| RN-SVC-033 | Reasignación por menor carga. La reasignación automática elige al gestor de tickets disponible del mismo área y habilidad con menos tickets activos ponderados por prioridad; no mueve tickets con rayo, en Eje 3 o con interacción en curso | Negocio · Excel 05_Catalogos |
| RN-SVC-006 | Asignación append-only. Cada movimiento de área/responsable es fila nueva con motivo tipificado; los punteros actuales son denormalizados | Negocio · Excel 05_Catalogos |
| RN-SVC-040 | Término oficial: Gestor de tickets. El rol que atiende tickets (ACT-022 Operador ATC, llamado «agente» en este documento) se denomina «Gestor de tickets» en pantallas, reportes, correos y documentación | Negocio · Excel 05_Catalogos |

## 5 Trazabilidad

| RF | HU | Dependencia | Riesgo |
|---|---|---|---|
| RF-SVC-043 | HU-ATC-043 · Iteración 1 · Dev 3 · mié 21-oct → jue 22-oct | DEP-02 maestro local de roles y líderes (roles y disponibilidad) | R-01, R-04 |
| RF-SVC-044 | HU-ATC-044 · Iteración 1 · Dev 3 · jue 22-oct | DEP-02 maestro local de roles y líderes (roles y disponibilidad) | R-01, R-04 |
| RF-SVC-045 | HU-ATC-045 · Iteración 1 · Dev 3 · jue 22-oct → vie 23-oct | DEP-02 maestro local de roles y líderes (roles y disponibilidad) | R-01, R-04 |
| RF-SVC-046 | HU-ATC-046 · Iteración 1 · Dev 3 · vie 23-oct | DEP-02 maestro local de roles y líderes (roles y disponibilidad) | R-01, R-04 |

Cada RF llega a una HU, y cada criterio de la HU a un TC de `docs/pruebas/test-plan.md` (pendiente: lo define QA).

## 6 Fuera de alcance

- Gestión de turnos; asignación por habilidades avanzadas (fase posterior).

## 7 Preguntas abiertas

| # | Pregunta | Dueño | Fecha límite | Bloquea G4 |
|---|---|---|---|---|
| P-01 | ¿Asignación automática (push) o el gestor toma el siguiente (pull)? ¿Quiénes pueden marcar el rayo? ¿Cómo se mide la carga? | (por asignar) | (por definir) | (lo decide el PO) |

Una pregunta que bloquea G4 deja la feature en NO READY. Cuando se responde, la respuesta va a `docs/analisis/decisiones.md` y aquí se enlaza.

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-03 v1.3), sin cambiar su contenido — Revisado por: (pendiente)
