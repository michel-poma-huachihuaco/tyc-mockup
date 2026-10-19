---
id: "HU-ATC-009"
tipo: hu
titulo: "Ver mi casillero de tareas por área y responsable"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-03", "EP-ATC-02", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-009-casillero-tareas-por-consulta.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-02 / docs/analisis/BRD.md
- Como colaborador de área quiero ver en una bandeja los tickets de mi área y los míos, ordenados por vencimiento para conocer mi carga pendiente sin duplicar el estado del ticket.
- Requerimiento origen (RF-SVC-009 — Casillero de tareas por consulta): El sistema debe ofrecer el casillero por área y responsable como consulta sobre los tickets, sin tabla adicional. · Proceso: PROC-SVC-003 (Derivacion y reasignacion) · Fuente: PLT-04 · HU-ATC-009 · traza RF-SVC-009
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Salida 30-oct-2026
- Planificación (PLT-04 v1.2): Prioridad: **DEBE** · Iteración: **I1** · Estimación: **3 h** · Asignado: **Dev 2** (2026-10-20 → 2026-10-20) · Depende de HU: HU-ATC-007
- Observaciones de alcance: Fuera de alcance: Tablero Kanban configurable.
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · asignación del ticket | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · derivación y reasignación | 6.5 Diagrama entidad-relación · enrutamiento

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Ver mi casillero de tareas por área y responsable

Escenario: CA-01 · Bandeja
  Dado que abro mi casillero
  Cuando se carga
  Entonces veo los tickets de CurrentAreaID + CurrentOwnerPartyID + estado activo.

Escenario: CA-02 · Filtros
  Dado que filtro por «en riesgo o vencidos»
  Cuando aplico el filtro
  Entonces solo veo los tickets con SLA en riesgo o vencido, resaltados.

Escenario: CA-03 · Sin asignar (agregado por el PO)
  Dado tickets derivados a mi área sin persona
  Cuando abro la bandeja del área
  Entonces aparecen como «sin asignar» para que alguien los tome.
```

- Evidencia / prueba esperada (PLT-04): `Sin evento específico; datos de prueba: 2 razones sociales, 3 tipos de ticket y 1 feriado.`

## Reglas de negocio

- RN-SVC-006 (Asignacion append-only): Cada movimiento de area/responsable es fila nueva con motivo tipificado; los punteros actuales son denormalizados.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Prototipo / pantalla de referencia (artefacto): Prototipo › Bandeja de tickets — Mockups: P-01 "Bandeja de tickets" (Mi casillero por área y responsable; Bandeja orquestadora con rayo, carga por agente y reasignación en bloque (propuesta))
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `GET /api/v1/tickets/casillero` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades catalogadas (.ods): ENT-SVC-001 SVC_TICKET, ENT-SVC-003 SVC_TICKET_ASSIGNMENT_LOG
- Entidades y dependencias declaradas en PLT-04: Vista/consulta sobre SVC_TICKET + ASSIGNMENT_LOG
- Entidades/campos que LEE: SVC_TICKET, SVC_TICKET_ASIGNACION (último movimiento por ticket)
- Entidades/campos que ESCRIBE o modifica: ninguna (solo lectura)
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
