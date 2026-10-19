---
id: "HU-ATC-004"
tipo: hu
titulo: "Cambiar el estado del ticket con historial inmutable"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-02", "EP-ATC-01", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-004-gestionar-ciclo-vida-ticket.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-01 / docs/analisis/BRD.md
- Como colaborador de área quiero cambiar el estado del ticket (abierto, en atención, espera cliente, escalado, resuelto, cerrado, reabierto) para que todos conozcan el estado real y su historial completo.
- Requerimiento origen (RF-SVC-004 — Gestionar el ciclo de vida del ticket): El sistema debe gestionar 7 estados y registrar cada transición con fecha y autor en un historial append-only. · Proceso: PROC-SVC-002 (Atencion y resolucion) · Fuente: PLT-04 · HU-ATC-004 · traza RF-SVC-004
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Salida 30-oct-2026
- Planificación (PLT-04 v1.2): Prioridad: **DEBE** · Iteración: **I1** · Estimación: **5 h** · Asignado: **Dev 1** (2026-10-20 → 2026-10-21) · Depende de HU: HU-ATC-002
- Observaciones de alcance: Fuera de alcance: Estados personalizados por área.
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · ciclo de vida del ticket | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · cambio de estado e interacción | 6.5 Diagrama entidad-relación · estado, interacciones e hitos

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Cambiar el estado del ticket con historial inmutable

Escenario: CA-01 · Historial
  Dado un ticket en atención
  Cuando cambio su estado
  Entonces se agrega una fila al STATUS_LOG con fecha y autor y el puntero del ticket se actualiza.

Escenario: CA-02 · Inmutabilidad
  Dado un historial con transiciones
  Cuando alguien intenta editar o borrar una fila
  Entonces la operación se rechaza.

Escenario: CA-03 · Cambio automático (agregado por el PO)
  Dado un cambio realizado por el sistema
  Cuando se registra
  Entonces la fila queda con marca automática en lugar de autor.

Escenario: CA-04 · Transición inválida (agregado por el PO)
  Dado un ticket CLOSED
  Cuando intento pasarlo a IN_PROGRESS sin reabrirlo
  Entonces el sistema lo impide e indica que primero debo reabrirlo.
```

- Evidencia / prueba esperada (PLT-04): `Evento ticket_estado {de, a, autor}`

## Reglas de negocio

- RN-SVC-006 (Asignacion append-only): Cada movimiento de area/responsable es fila nueva con motivo tipificado; los punteros actuales son denormalizados.
- RN-SVC-023 (Gate: cierre fuera de Mi Portal): Un ticket cerrado fuera de Mi Portal, sin cierre formal en el sistema, es un gate no compensable.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Prototipo / pantalla de referencia (artefacto): Prototipo › Detalle de ticket (stepper y «Cambiar estado») — Mockups: P-03 "Detalle de ticket" (Detalle con estados, interacciones y compromisos SLA; Modal Derivar / reasignar a Eje 3 con paquete mínimo 6/6), P-17 "Mi Portal del cliente" (Mis solicitudes, detalle y nueva solicitud (móvil))
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `PATCH /api/v1/tickets/{id}/estado` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades catalogadas (.ods): ENT-SVC-001 SVC_TICKET
- Entidades y dependencias declaradas en PLT-04: ENT-SVC-002 SVC_TICKET_STATUS_LOG · RNF-AUD-004 hash
- Entidades/campos que LEE: SVC_TICKET, historial de estados
- Entidades/campos que ESCRIBE o modifica: SVC_TICKET_ESTADO_HISTORIAL (append-only)
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
