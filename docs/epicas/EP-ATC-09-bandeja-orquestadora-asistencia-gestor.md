---
id: "EP-ATC-09"
tipo: epica
titulo: "Bandeja orquestadora y asistencia al gestor"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["AYB-0001", "RMP-001"]
tags: [epica, plt-02]
---

# PLT-02 - EP-ATC-09 Bandeja orquestadora y asistencia al gestor

Va en `docs/epicas/EP-ATC-09-bandeja-orquestadora-asistencia-gestor.md`.

| ID | Nombre | Producto |
|---|---|---|
| EP-ATC-09 | Bandeja orquestadora y asistencia al gestor | Aybar Atiende · Plataforma de Atención al Cliente |
| **Product Owner** | **Sponsor** | **Prioridad (MoSCoW)** |
| Eddie Huamaní | Gerencia de Experiencia del Cliente | Debe |
| **Horizonte / Plan** | **Estado** | **Fecha / Version** |
| Ahora · Iteración 1 (2026-10-19 → 2026-10-23 · 32 h · Dev 3 (Michel)) | Borrador (Habilitadora) | 2026-10-19 / v0.2 |

## 1 Contexto

- **Problema**: cada gestor de tickets trabaja con su propia lista y decide el orden a criterio; no hay flujos por área, los urgentes no se distinguen y la carga se reparte de forma desigual. El gestor nuevo no tiene una guía de cómo resolver cada tipo de ticket.
- **Usuarios**: gestores de tickets (antes "agentes" u "operadores ATC"), supervisores y líderes de área, y el administrador funcional que configura los flujos.
- **Evidencia**: feedback de la presentación de octubre-2026; necesidad de repartir la carga y priorizar lo urgente sin perder el SLA; reglas RN-SVC-031..035.
- **Alineamiento**: atender toda solicitud con compromiso de tiempo trazable con un equipo balanceado y medido a diario.

## 2 Objetivos

Objetivos de negocio:
- OBJ-09: Reducir a 0 los tickets sin responsable por más de 1 día hábil y mantener la diferencia de carga entre gestores del mismo área por debajo del 20% durante el piloto.

Objetivos del usuario:
- El gestor de tickets ve en una sola bandeja qué atender primero, cómo resolverlo y su avance del día; su líder se entera de cada asignación.

| KPI | Línea base | Meta | Fuente | Frecuencia |
|---|---|---|---|---|
| Tickets sin responsable > 1 día hábil | por medir | 0 | Plataforma ATC | Diaria |
| Diferencia de carga entre gestores del mismo área | por medir | ≤ 20% | Plataforma ATC | Diaria |
| % de cierres que siguieron la guía de solución | por medir | ≥ 80% | Plataforma ATC | Semanal |

## 3 Alcance

| Dentro (IN) | Fuera (OUT) |
|---|---|
| Flujos de trabajo configurables por área y tipo, sin desarrollo | Gestión de turnos y vacaciones (se consume el estado de disponibilidad) |
| Bandeja única que ordena por rayo, SLA y prioridad, y asigna según el flujo | IA que responde sola al cliente (la IA solo sugiere, RN-SVC-032) |
| Marca de prioridad "rayo" controlada por el líder | Evaluación de desempeño o bonos |
| Reasignación automática al gestor con menos carga | |
| Guía de solución por tipo de ticket y retroalimentación de IA al cerrar | |
| Tablero de avance diario y correo de asignación con copia al líder | |

Features:

| ID | Feature | Prioridad (MoSCoW) | Release objetivo |
|---|---|---|---|
| FT-ATC-18 | Bandeja orquestadora y flujos por área | Debe | v1.0 - 30-oct-2026 |
| FT-ATC-19 | Asistencia al gestor: guía e IA | Debería | v1.0 - 30-oct-2026 |
| FT-ATC-21 | Productividad y notificaciones del gestor | Debería | v1.0 - 30-oct-2026 |

- **Supuestos**: el modelo SVC_TICKET y la bitácora de asignación de EP-ATC-02 están disponibles; TI aprueba un proveedor de IA antes de iniciar la asistencia con IA.
- **Restricciones**: IA asesora, ninguna respuesta al cliente sin acción del gestor y sin datos personales hacia modelos externos (RN-SVC-032, RNF-SEC-009); rayo ≤ 10% de la bandeja del área (RN-SVC-031).
- **Dependencias y riesgos**: DEP-02 NEXUS (líder de cada gestor), DEP-14 proveedor de IA; R-01 capacidad, R-04 código generado con IA.
- **Criterios de éxito**: 0 tickets huérfanos y carga balanceada durante el piloto; 100% de asignaciones notificadas al gestor y a su líder.

## 4 Aprobaciones

| Rol | Nombre | Fecha | Decision |
|---|---|---|---|
| Product Owner | | | |
| Sponsor | | | |
| Lider tecnico | | | |

Generado por IA: actualizado con el detalle del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`) — Revisado por: pendiente
