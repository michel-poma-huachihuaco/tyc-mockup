---
id: "FT-ATC-25"
tipo: feature
titulo: "Visor del proceso 3D (operación en vivo)"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["EP-ATC-09", "HU-ATC-067"]
tags: [feature, plt-03, ui]
---

# PLT-03 - FT-ATC-25 Visor del proceso 3D (operación en vivo)

| ID | Nombre | Épica padre |
|---|---|---|
| FT-ATC-25 | Visor del proceso 3D (operación en vivo) | EP-ATC-09 Bandeja orquestadora y asistencia al gestor |
| **Product Owner** | **Prioridad (MoSCoW)** | **Estado** |
| Eddie Huamaní (PO) | Debe | Refinamiento |
| **Release objetivo** | **Estimación** | **Fecha / Versión** |
| v1.0 · Etapa 1 · 03-nov-2026 | S · 10 h · 10 h de desarrollo · Dev 3 | 16-oct-2026 · v1.3 |
| **Desarrollador** | **Ventana (PLT-01)** | **Predecesora** |
| Dev 3 (Michel) | 23-oct-2026 → 27-oct-2026 | FT-ATC-18 |

## 1 Descripción y valor

Muestra la sede de atención en un visor 3D isométrico: cada área de la corporación es un espacio con sus gestores y su cola, y los tickets se ven entrar por los canales, pasar por la bandeja orquestadora y moverse al área que indica su flujo, con su color de SLA.

**Beneficio:** El supervisor ve en un vistazo dónde se acumulan los tickets y actúa antes de que venza el SLA.

**Usuarios:** Supervisor ATC · Coordinador CX · Líder de área · Gestor de tickets

## 2 Requerimientos funcionales

| ID | Requerimiento | Prioridad (MoSCoW) | Origen | Criterio de verificación | Horas | Predecesora | Estado |
|---|---|---|---|---|---|---|---|
| RF-SVC-067 | El sistema debe mostrar en un visor 3D isométrico la sede de atención con sus áreas, los tickets entrando por los canales, pasando por la bandeja orquestadora y moviéndose al área de su flujo con su color de SLA, y el detalle de cada área y de cada ticket. | Debe | PROC-SVC-017 · Supervisor ATC Propuesta PO v1.3 · prototipo «visor del proceso 3d» (Operación en vivo) | Lo que muestra el visor coincide con la bandeja y el SLA de cada ticket (desfase ≤ 5 s) | 10 | — | Pend. DoR |

Ruta crítica: RF-SVC-067 (10 h).

## 3 Requerimientos no funcionales

| ID | Categoría | Requerimiento | Métrica / umbral | Prioridad |
|---|---|---|---|---|
| RNF-P (P) | Rendimiento | Actualización del visor en tiempo real | Desfase ≤ 5 s con 200 tickets activos y 30 FPS en un equipo estándar | Debe |
| RNF-P (P) | Usabilidad | Vista 2D alternativa accesible | Misma información por área; WCAG 2.1 AA | Debería |
| RNF-USA-002 | Usabilidad | Flujos configurables sin desarrollo | dias_configurar_flujo: ≤ 1 día hábil por flujo | Debería |
| RNF-SEC-010 | Seguridad | Permisos en búsqueda y consulta 360 | accesos_indebidos_busqueda: 0.0 | Debe |

## 4 Reglas de negocio

| ID | Regla | Fuente |
|---|---|---|
| RN-SVC-031 | Prioridad rayo controlada. Solo el supervisor o líder puede marcar un ticket con rayo; queda en bitácora con motivo y no puede superar el 10 % de la bandeja del área (umbral a validar) | Negocio · Excel 05_Catalogos |
| RN-SVC-033 | Reasignación por menor carga. La reasignación automática elige al gestor de tickets disponible del mismo área y habilidad con menos tickets activos ponderados por prioridad; no mueve tickets con rayo, en Eje 3 o con interacción en curso | Negocio · Excel 05_Catalogos |
| RN-SVC-035 | Aviso de asignación con copia al líder. Toda asignación o reasignación envía un correo al responsable con copia a su líder, una sola vez por movimiento | Negocio · Excel 05_Catalogos |
| RN-SVC-036 | Búsqueda respeta permisos. La búsqueda y la consulta 360 solo muestran documentos y datos que el rol del usuario puede ver en el sistema de origen | Negocio · Excel 05_Catalogos |

## 5 Trazabilidad

| RF | HU | Dependencia | Riesgo |
|---|---|---|---|
| RF-SVC-067 | HU-ATC-067 · Iteración 1 · Dev 3 · vie 23-oct → mar 27-oct | Eventos de la bandeja orquestadora (HU-043, 044) | R-01, R-04 |

Cada RF llega a una HU, y cada criterio de la HU a un TC de `docs/pruebas/test-plan.md` (pendiente: lo define QA).

## 6 Fuera de alcance

- Edición de flujos desde el visor (se hace en HU-043); realidad virtual; ranking individual público.

## 7 Preguntas abiertas

| # | Pregunta | Dueño | Fecha límite | Bloquea G4 |
|---|---|---|---|---|
| P-01 | ¿Qué áreas y en qué orden se muestran en la sede? ¿El visor va en pantalla grande de la sala de operaciones? ¿Se activa el nivel y XP del equipo en el piloto? | (por asignar) | (por definir) | (lo decide el PO) |

Una pregunta que bloquea G4 deja la feature en NO READY. Cuando se responde, la respuesta va a `docs/analisis/decisiones.md` y aquí se enlaza.

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-03 v1.3), sin cambiar su contenido — Revisado por: (pendiente)
