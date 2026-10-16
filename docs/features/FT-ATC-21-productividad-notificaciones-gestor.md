---
id: "FT-ATC-21"
tipo: feature
titulo: "Productividad y notificaciones del gestor"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["EP-ATC-09", "AYB-0001"]
tags: [feature, plt-03]
---

# PLT-03 - FT-ATC-21 Productividad y notificaciones del gestor

Va en `docs/features/FT-ATC-21-productividad-notificaciones-gestor.md`.

| ID | Nombre | Epica padre |
|---|---|---|
| FT-ATC-21 | Productividad y notificaciones del gestor | EP-ATC-09 |
| **Product Owner** | **Prioridad (MoSCoW)** | **Estado** |
| Eddie Huamaní | Debería | Borrador |
| **Release objetivo** | **Estimacion** | **Fecha / Version** |
| v1.0 - 30-oct-2026 | 6 h (talla S) | 2026-10-15 / v0.1 |

## 1 Descripción y valor

Tablero de avance diario para cada gestor de tickets y su líder, y correo de asignación con copia al líder en cada asignación o reasignación. Nadie ignora una asignación y el líder corrige a tiempo.

## 2 Requerimientos funcionales

| ID | Requerimiento | Prioridad (MoSCoW) | Origen | Criterio de verificación | Estado |
|---|---|---|---|---|---|
| RF-SVC-054 | El sistema debe mostrar a cada gestor de tickets y a su líder un tablero de avance diario: tickets atendidos, pendientes, cumplimiento de SLA, tiempo medio y CSAT. | Debería | Supervisor ATC | Indicadores del día actualizados | Propuesto |
| RF-SVC-055 | El sistema debe enviar una alerta por correo al gestor de tickets cada vez que se le asigna o reasigna un ticket, con copia a su líder, indicando N.º, tipo, prioridad y vencimiento de SLA. | Debe | Job batch de ATC | Correo en ≤ 1 min con copia al líder | Propuesto |

## 3 Requerimientos no funcionales

| ID | Categoria | Requerimiento | Metrica / umbral |
|---|---|---|---|
| RNF-REN-008 | Rendimiento | Oportunidad del correo de asignación | minutos_envio_correo_asignacion ≤ 1 min en el 99% de los casos |

## 4 Reglas de negocio

| ID | Regla | Fuente |
|---|---|---|
| RN-SVC-035 | Aviso de asignación con copia al líder: una sola vez por movimiento | Negocio |
| RN-SVC-025 | Cierre end-to-end en 72 horas hábiles | Negocio |

## 5 Trazabilidad

| RF | HU | Dependencia | Riesgo |
|---|---|---|---|
| RF-SVC-054 | HU-ATC-054 | DEP-02 NEXUS (líder de cada gestor) | R-01 |
| RF-SVC-055 | HU-ATC-055 | DEP-02 | R-01 |

## 6 Fuera de alcance

- Evaluación de desempeño.
- Ranking público entre gestores.

## 7 Preguntas abiertas

| # | Pregunta | Dueño | Fecha limite | Bloquea G4 |
|---|---|---|---|---|
| P-01 | ¿Qué metas diarias tiene cada gestor? | PO | por definir | No |
| P-02 | ¿El correo incluye datos del cliente o solo el enlace al ticket? | PO | por definir | Sí |

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) y del PDF `03_Funcionalidades_Catalogo_Requerimientos_Plataforma_ATC_AYBARCORP.pdf` — Revisado por: pendiente
