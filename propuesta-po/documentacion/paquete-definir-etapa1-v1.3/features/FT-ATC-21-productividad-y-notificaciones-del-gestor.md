---
id: "FT-ATC-21"
tipo: feature
titulo: "Productividad y notificaciones del gestor"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["EP-ATC-09", "HU-ATC-054", "HU-ATC-055"]
tags: [feature, plt-03, ui]
---

# PLT-03 - FT-ATC-21 Productividad y notificaciones del gestor

| ID | Nombre | Épica padre |
|---|---|---|
| FT-ATC-21 | Productividad y notificaciones del gestor | EP-ATC-09 Bandeja orquestadora y asistencia al gestor |
| **Product Owner** | **Prioridad (MoSCoW)** | **Estado** |
| Eddie Huamaní (PO) | Debería | Refinamiento |
| **Release objetivo** | **Estimación** | **Fecha / Versión** |
| v1.0 · Etapa 1 · 03-nov-2026 | S·6h · 6 h de desarrollo · Dev 3 | 16-oct-2026 · v1.3 |
| **Desarrollador** | **Ventana (PLT-01)** | **Predecesora** |
| Dev 3 (Michel) | 28-oct-2026 → 29-oct-2026 | FT-ATC-18 |

## 1 Descripción y valor

Tablero de avance diario para cada gestor y su líder, y correo de asignación con copia al líder en cada asignación o reasignación.

**Beneficio:** Nadie ignora una asignación y el líder corrige a tiempo.

**Usuarios:** Gestor de tickets · Líder / Supervisor ATC

## 2 Requerimientos funcionales

| ID | Requerimiento | Prioridad (MoSCoW) | Origen | Criterio de verificación | Horas | Predecesora | Estado |
|---|---|---|---|---|---|---|---|
| RF-SVC-054 | El sistema debe mostrar a cada gestor de tickets y a su líder un tablero de avance diario: tickets atendidos, pendientes, cumplimiento de SLA, tiempo medio y CSAT. | Debería | PROC-SVC-020 · Supervisor ATC · Feedback presentación · ítem 13 | Indicadores del día actualizados | 4 | — | Pend. DoR |
| RF-SVC-055 | El sistema debe enviar una alerta por correo al gestor de tickets cada vez que se le asigna o reasigna un ticket, con copia a su líder, indicando N.º, tipo, prioridad y vencimiento de SLA. | Debe | PROC-SVC-020 · Job batch de ATC · Feedback presentación · ítem 15 | Correo en ≤ 1 min con copia al líder | 2 | — | Pend. DoR |

Ruta crítica: RF-SVC-054 (4 h).

## 3 Requerimientos no funcionales

| ID | Categoría | Requerimiento | Métrica / umbral | Prioridad |
|---|---|---|---|---|
| RNF-REN-008 | Rendimiento | Oportunidad del correo de asignación | minutos_envio_correo_asignacion: ≤ 1 min en el 99 % de los casos | Debería |

## 4 Reglas de negocio

| ID | Regla | Fuente |
|---|---|---|
| RN-SVC-035 | Aviso de asignación con copia al líder. Toda asignación o reasignación envía un correo al responsable con copia a su líder, una sola vez por movimiento | Negocio · Excel 05_Catalogos |
| RN-SVC-025 | Cierre end-to-end en 72 horas hábiles. El cierre end-to-end del ticket sin escalamiento debe completarse en 72 horas hábiles; si hay escalamiento, aplica el plazo propio del eje correspondiente | Negocio · Excel 05_Catalogos |

## 5 Trazabilidad

| RF | HU | Dependencia | Riesgo |
|---|---|---|---|
| RF-SVC-054 | HU-ATC-054 · Iteración 2 · Dev 3 · mié 28-oct | DEP-02 maestro local de roles y líderes (líder de cada gestor) | R-01 |
| RF-SVC-055 | HU-ATC-055 · Iteración 2 · Dev 3 · jue 29-oct | DEP-02 maestro local de roles y líderes (líder de cada gestor) | R-01 |

Cada RF llega a una HU, y cada criterio de la HU a un TC de `docs/pruebas/test-plan.md` (pendiente: lo define QA).

## 6 Fuera de alcance

- Evaluación de desempeño; ranking público entre gestores.

## 7 Preguntas abiertas

| # | Pregunta | Dueño | Fecha límite | Bloquea G4 |
|---|---|---|---|---|
| P-01 | ¿Qué metas diarias tiene cada gestor? ¿El correo incluye datos del cliente o solo el enlace? | (por asignar) | (por definir) | (lo decide el PO) |

Una pregunta que bloquea G4 deja la feature en NO READY. Cuando se responde, la respuesta va a `docs/analisis/decisiones.md` y aquí se enlaza.

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-03 v1.3), sin cambiar su contenido — Revisado por: (pendiente)
