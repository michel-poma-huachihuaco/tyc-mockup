---
id: "HU-ATC-044"
tipo: hu
titulo: "Trabajar desde una bandeja única ordenada por urgencia"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-18", "EP-ATC-09", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-044-bandeja-orquestadora-tickets.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-09 / docs/analisis/BRD.md
- Como gestor de tickets quiero ver en una sola bandeja los tickets de todos los canales ordenados por rayo, vencimiento de SLA y prioridad para atender primero lo más urgente.
- Requerimiento origen (RF-SVC-044 — Bandeja orquestadora de tickets): El sistema debe ofrecer una bandeja orquestadora que reúne los tickets de todos los canales y los ordena y asigna según flujo, prioridad, marca de rayo y vencimiento de SLA. Feedback presentación · ítem 11 · Proceso: PROC-SVC-017 (Orquestacion de bandeja y flujos de trabajo por area) · Fuente: PLT-04 · HU-ATC-044 · traza RF-SVC-044
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Salida 30-oct-2026
- Planificación (PLT-04 v1.2): Prioridad: **DEBE** · Iteración: **I1** · Estimación: **5 h** · Asignado: **Dev 3** (2026-10-20 → 2026-10-20) · Depende de HU: HU-ATC-043
- Observaciones de alcance: Fuera de alcance: Bandejas personalizadas por gestor.
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · ticket en la bandeja orquestadora | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · asignación por la bandeja | 6.5 Diagrama entidad-relación · flujos y asignación

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Trabajar desde una bandeja única ordenada por urgencia

Escenario: CA-01 · Orden de la bandeja
  Dado tickets de teléfono, WhatsApp, correo y Mi Portal
  Cuando el gestor de tickets abre la bandeja
  Entonces los ve juntos ordenados por rayo, SLA más próximo y prioridad.

Escenario: CA-02 · Asignación por flujo
  Dado un ticket nuevo sin responsable
  Cuando entra a la bandeja
  Entonces el orquestador lo asigna según el flujo del área o lo deja en la cola del área.

Escenario: CA-03 · Sin permiso de área (agregado por el PO)
  Dado un ticket de un área a la que no pertenezco
  Cuando abro la bandeja
  Entonces no lo veo, salvo que sea supervisor de esa área.
```

- Evidencia / prueba esperada (PLT-04): `Evento bandeja_tomado {orden} Preguntas abiertas ¿La asignación es automática (push) o el gestor de tickets toma el siguiente (pull)? ¿Se mezclan tickets de varias áreas en la misma bandeja?`

## Reglas de negocio

- RN-SVC-031 (Prioridad rayo controlada): Solo el supervisor o lider puede marcar un ticket con rayo; queda en bitacora con motivo y no puede superar el 10 % de la bandeja del area (umbral a validar).
- RN-SVC-008 (Alerta unica por ciclo): UNIQUE (TicketID, BreachTypeID, ReopenCycleNumber): cada ciclo alerta una sola vez por tipo de incumplimiento.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Prototipo / pantalla de referencia (artefacto): Prototipo › Bandeja — Mockups: P-01 "Bandeja de tickets" (Mi casillero por área y responsable; Bandeja orquestadora con rayo, carga por agente y reasignación en bloque (propuesta))
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `GET /api/v1/tickets/bandeja` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades y dependencias declaradas en PLT-04: ENT-SVC-001 SVC_TICKET, ENT-SVC-003 SVC_TICKET_ASSIGNMENT_LOG
- Entidades/campos que LEE: SVC_TICKET, SVC_WORKFLOW_CONFIG
- Entidades/campos que ESCRIBE o modifica: ninguna (solo lectura/orden)
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - nomenclatura a reconciliar con docs/datos/diccionario.md: la HU dice 'SVC_WORKFLOW_CONFIG', el diccionario de F4 lo llama 'SVC_WORKFLOW_DEFINITION' (mismo concepto) - desviacion MENOR de CAD-F5 (nomenclatura)

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
