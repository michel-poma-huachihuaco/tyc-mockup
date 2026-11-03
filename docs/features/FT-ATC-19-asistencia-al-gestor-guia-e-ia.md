---
id: "FT-ATC-19"
tipo: feature
titulo: "Asistencia al gestor: guía e IA"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.4.0"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-11-03"
relacionados: ["EP-ATC-09", "HU-ATC-047", "HU-ATC-048", "HU-ATC-068", "HU-ATC-069", "HU-ATC-070", "HU-ATC-071", "HU-ATC-072", "ADR-007"]
tags: [feature, plt-03, ui]
---

# PLT-03 - FT-ATC-19 Asistencia al gestor: guía e IA

**Alcance en la Etapa 1 (decisión del 3-nov-2026, reemplaza la nota de P-025):** el Núcleo de IA entra en la Etapa 1 con la arquitectura de `adr/ADR-007` v0.9 (módulo Java en el monolito, pipeline con guardianes, Azure OpenAI). HU-048 se reescribe y se suman HU-068 a HU-072 (propuestas). Las horas están **por estimar por el equipo**; R-01 queda como riesgo crítico para el PO. HU-053 sigue fuera de la Etapa 1. Pendiente: que el PO acepte las HU nuevas y que el Líder Técnico apruebe el ADR-007.

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

Muestra la guía de solución de cada tipo de ticket y usa un **Núcleo de IA** que clasifica el ticket, redacta un borrador verificado contra los datos reales y lo deja listo para que el gestor lo apruebe, o lo escala con un motivo tipificado; el gestor siempre decide. (Texto ampliado el 3-nov-2026; el original del PO decía: «usa IA para sugerir respuestas y verificar los criterios de cierre mientras el gestor atiende».)

**Beneficio:** Respuestas más uniformes y de mejor calidad, y menos tiempo de capacitación.

**Usuarios:** Gestor de tickets · Administrador funcional ATC · Asistente IA

## 2 Requerimientos funcionales

| ID | Requerimiento | Prioridad (MoSCoW) | Origen | Criterio de verificación | Horas | Predecesora | Estado |
|---|---|---|---|---|---|---|---|
| RF-SVC-047 | El sistema debe mostrar al gestor de tickets una guía de como solucionar cada tipo de ticket (pasos, plantillas de respuesta, documentos requeridos y criterios de cierre) mantenida por el administrador funcional. | Debería | PROC-SVC-018 · Gestor de tickets · Feedback presentación · ítem 7 | Guía versionada por tipo | 4 | — | Pend. DoR |
| RF-SVC-048 | El sistema debe usar IA para retroalimentar al gestor de tickets mientras atiende y al cerrar: sugerir respuesta, verificar que se cumplan los criterios de cierre de la guía y señalar tono o datos faltantes. | Debería (ya no flexible, 3-nov) | PROC-SVC-018 · Asistente IA de atención · Feedback presentación · ítem 8 | Toda sugerencia queda registrada con su decisión | 5 | RF-SVC-047 | Pend. DoR |

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
| RF-SVC-048 | HU-ATC-048 (orquestador), HU-ATC-068 a HU-ATC-072 (propuestas) · Dev 3 · fechas por definir | DEP-14 proveedor de IA habilitado (aplica en la Etapa 1; simulador mientras tanto) | R-07, R-01 |

Cada RF llega a una HU, y cada criterio de la HU a un TC de `docs/pruebas/test-plan.md` (pendiente: lo define QA).

## 6 Fuera de alcance

- Respuesta automática de la IA al cliente; entrenamiento de modelos propios.

## 7 Preguntas abiertas

| # | Pregunta | Dueño | Fecha límite | Bloquea G4 |
|---|---|---|---|---|
| P-01 | ¿Qué proveedor de IA aprueban TI y Seguridad? ¿Quién redacta y aprueba las guías por área? | (por asignar) | (por definir) | (lo decide el PO) |

Una pregunta que bloquea G4 deja la feature en NO READY. Cuando se responde, la respuesta va a `docs/analisis/decisiones.md` y aquí se enlaza.

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-03 v1.3), sin cambiar su contenido — Revisado por: (pendiente)

Historial: 1.3.1 · 2026-10-26 · Brayan Hurtado, con IA · Nota de alcance al inicio del cuerpo: P-025 (decisión del equipo del 26-oct-2026, `analisis/decisiones.md` v0.8). La Etapa 1 no incluye HU-048 (4 h de 9 h). No se cambia texto del PO. — Revisado por: (pendiente)

Historial: 1.4.0 · 2026-11-03 · Jesús Chávez Elías, con IA · El Núcleo de IA entra en la Etapa 1 (`adr/ADR-007` v0.9, reemplaza la nota de P-025); descripción ampliada; HU-068 a HU-072 propuestas; DEP-14 vuelve a aplicar; horas por estimar. — Revisado por: (pendiente)
