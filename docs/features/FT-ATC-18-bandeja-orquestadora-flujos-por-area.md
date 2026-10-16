---
id: "FT-ATC-18"
tipo: feature
titulo: "Bandeja orquestadora y flujos por área"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["EP-ATC-09", "AYB-0001"]
tags: [feature, plt-03]
---

# PLT-03 - FT-ATC-18 Bandeja orquestadora y flujos por área

Va en `docs/features/FT-ATC-18-bandeja-orquestadora-flujos-por-area.md`.

| ID | Nombre | Epica padre |
|---|---|---|
| FT-ATC-18 | Bandeja orquestadora y flujos por área | EP-ATC-09 |
| **Product Owner** | **Prioridad (MoSCoW)** | **Estado** |
| Eddie Huamaní | Debe | Borrador |
| **Release objetivo** | **Estimacion** | **Fecha / Version** |
| v1.0 - 30-oct-2026 | 17 h (talla L) | 2026-10-15 / v0.1 |

## 1 Descripción y valor

Permite configurar, sin desarrollo, el flujo de trabajo de cada tipo de ticket por área, y reúne en una bandeja única los tickets de todos los canales, ordenados por rayo, SLA y prioridad, con reasignación automática por menor carga. Cada gestor sabe qué atender primero y la carga se reparte de forma pareja.

## 2 Requerimientos funcionales

| ID | Requerimiento | Prioridad (MoSCoW) | Origen | Criterio de verificación | Estado |
|---|---|---|---|---|---|
| RF-SVC-043 | El sistema debe permitir configurar, sin desarrollo, el flujo de trabajo (workflow) de cada tipo de ticket por área: pasos, estados, responsables, aprobaciones y SLA de cada paso. | Debe | Administrador funcional ATC | Tickets nuevos siguen el flujo publicado | Propuesto |
| RF-SVC-044 | El sistema debe ofrecer una bandeja orquestadora que reúne los tickets de todos los canales y los ordena y asigna según flujo, prioridad, marca de rayo y vencimiento de SLA. | Debe | Supervisor ATC | Orden: rayo > SLA más próximo > prioridad | Propuesto |
| RF-SVC-045 | El sistema debe permitir marcar un ticket con un icono de rayo que lo sube al tope de la bandeja, registrando quien lo marcó y por qué. | Debería | Supervisor ATC | Rayo solo por líder, con motivo y en bitácora | Propuesto |
| RF-SVC-046 | El sistema debe reasignar un ticket al gestor de tickets disponible del mismo área y habilidad con menor carga de trabajo cuando el responsable no está disponible o su carga supera el límite. | Debería | Job batch de ATC | Motivo REASSIGNMENT_CARGA en la bitácora | Propuesto |

## 3 Requerimientos no funcionales

| ID | Categoria | Requerimiento | Metrica / umbral |
|---|---|---|---|
| RNF-USA-002 | Usabilidad | Flujos configurables sin desarrollo | dias_configurar_flujo ≤ 1 día hábil por flujo |
| RNF-USA-003 | Usabilidad | Término «Gestor de tickets» en toda la plataforma | textos_con_termino_anterior: 0 textos visibles con «agente» u «operador» |
| RNF-AUD-004 | Auditoría | Cinco bitácoras append-only firmadas | hash_mismatch: 0 en el job de auditoría |

## 4 Reglas de negocio

| ID | Regla | Fuente |
|---|---|---|
| RN-SVC-031 | Prioridad rayo controlada: solo supervisor o líder, en bitácora con motivo, ≤ 10% de la bandeja del área (umbral a validar) | Negocio |
| RN-SVC-033 | Reasignación por menor carga: elige al gestor disponible del área/habilidad con menos tickets activos ponderados por prioridad | Negocio |
| RN-SVC-006 | Asignación append-only | Negocio |
| RN-SVC-040 | Término oficial "Gestor de tickets" en pantallas, reportes, correos y documentación | Negocio |

## 5 Trazabilidad

| RF | HU | Dependencia | Riesgo |
|---|---|---|---|
| RF-SVC-043 | HU-ATC-043 | DEP-02 NEXUS (roles y disponibilidad) | R-01, R-04 |
| RF-SVC-044 | HU-ATC-044 | DEP-02 | R-01, R-04 |
| RF-SVC-045 | HU-ATC-045 | DEP-02 | R-01, R-04 |
| RF-SVC-046 | HU-ATC-046 | DEP-02 | R-01, R-04 |

## 6 Fuera de alcance

- Gestión de turnos y vacaciones (se consume el estado de disponibilidad).
- Asignación por habilidades avanzadas (fase posterior).

## 7 Preguntas abiertas

| # | Pregunta | Dueño | Fecha limite | Bloquea G4 |
|---|---|---|---|---|
| P-01 | ¿La asignación es automática (push) o el gestor toma el siguiente (pull)? | PO | por definir | Sí |
| P-02 | ¿Quiénes pueden marcar el rayo? | PO | por definir | Sí |
| P-03 | ¿Cómo se mide la carga de cada gestor? | PO | por definir | Sí |

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) y del PDF `03_Funcionalidades_Catalogo_Requerimientos_Plataforma_ATC_AYBARCORP.pdf` — Revisado por: pendiente
