---
id: "HU-ATC-011"
tipo: hu
titulo: "Reabrir un ticket con un nuevo compromiso sin borrar el original"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-04", "EP-ATC-02", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-011-reabrir-nuevo-compromiso-sin-borrar-original.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-02 / docs/analisis/BRD.md
- Como supervisor ATC quiero que al reabrir un ticket se calcule un nuevo compromiso con la política vigente para vigilar el ciclo actual sin perder la evidencia del primer compromiso.
- Requerimiento origen (RF-SVC-011 — Reabrir con nuevo compromiso sin borrar el original): El sistema debe soportar la reapertura con ReopenCount y un nuevo vencimiento calculado con la política vigente, conservando el original. · Proceso: PROC-SVC-004 (Vigilancia de SLA) · Fuente: PLT-04 · HU-ATC-011 · traza RF-SVC-011
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Salida 30-oct-2026
- Planificación (PLT-04 v1.2): Prioridad: **DEBE** · Iteración: **I1** · Estimación: **3 h** · Asignado: **Dev 2** (2026-10-22 → 2026-10-22) · Depende de HU: HU-ATC-010
- Observaciones de alcance: Fuera de alcance: Límite máximo de reaperturas (por definir).
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · compromiso SLA del ciclo | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · congelamiento y alerta de SLA | 6.5 Diagrama entidad-relación · política y alertas

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Reabrir un ticket con un nuevo compromiso sin borrar el original

Escenario: CA-01 · Nuevo compromiso
  Dado un ticket cerrado que se reabre
  Cuando se calcula ReopenedResolutionDueDateTime
  Entonces el vencimiento original no se reescribe y las alertas evalúan el nuevo.

Escenario: CA-02 · Contador
  Dado un ticket reabierto dos veces
  Cuando consulto el ticket
  Entonces ReopenCount = 2 y cada ciclo tiene sus propias alertas.
```

- Evidencia / prueba esperada (PLT-04): `Evento ticket_reabierto {ciclo}`

## Reglas de negocio

- RN-SVC-007 (Reapertura con nuevo compromiso): REOPENED incrementa ReopenCount y calcula ReopenedResolutionDueDateTime con la politica vigente al reabrir; el compromiso original no se reescribe.
- RN-SVC-008 (Alerta unica por ciclo): UNIQUE (TicketID, BreachTypeID, ReopenCycleNumber): cada ciclo alerta una sola vez por tipo de incumplimiento.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Prototipo / pantalla de referencia (artefacto): Prototipo › Detalle › «Cambiar estado: Reabierto» — Mockups: P-03 "Detalle de ticket" (Detalle con estados, interacciones y compromisos SLA; Modal Derivar / reasignar a Eje 3 con paquete mínimo 6/6)
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `PATCH /api/v1/tickets/{id}/reapertura` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades catalogadas (.ods): ENT-SVC-001 SVC_TICKET, ENT-SVC-009 SVC_SLA_BREACH_ALERT
- Entidades y dependencias declaradas en PLT-04: SVC_TICKET, SVC_SLA_BREACH_ALERT
- Entidades/campos que LEE: SVC_TICKET, política SLA vigente
- Entidades/campos que ESCRIBE o modifica: SVC_TICKET.ReopenCount, ReopenedResolutionDueDateTime
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
