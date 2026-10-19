---
id: "HU-ATC-027"
tipo: hu
titulo: "Armar el paquete mínimo de handoff y confirmar su recepción"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-07", "EP-ATC-04", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-027-paquete-minimo-handoff-confirmacion-recepcion.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-04 / docs/analisis/BRD.md
- Como gestor de tickets quiero que al derivar entre ejes se arme el paquete mínimo con sus 6 elementos para que el eje destino confirme la recepción y no quede un vacío de responsabilidad.
- Requerimiento origen (RF-SVC-027 — Paquete minimo de handoff con confirmacion de recepcion): El sistema debe armar el paquete mínimo de handoff (6 elementos) en toda derivación entre ejes y permitir al eje destino confirmar la recepción. · Proceso: PROC-SVC-011 (Derivacion obligatoria a Legal ante caso de conflicto (gate Eje 3)) · Fuente: PLT-04 · HU-ATC-027 · traza RF-SVC-027
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Salida 30-oct-2026
- Planificación (PLT-04 v1.2): Prioridad: **DEBE** · Iteración: **I2** · Estimación: **4 h** · Asignado: **Dev 2** (2026-10-23 → 2026-10-26) · Depende de HU: HU-ATC-026 · Dependencias externas: DEP-01 (API de SIGDA/TAXON: consulta de cliente y KYC (única fuente del dato)); DEP-08 (Cobranza: estado de cuenta, historial de pagos y cuotas vencidas por contrato (desfase ≤ 24 h))
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · ticket con señal de conflicto | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · gate y handoff a Eje 3 | 6.5 Diagrama entidad-relación · conflicto y handoff

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Armar el paquete mínimo de handoff y confirmar su recepción

Escenario: CA-01 · Paquete completo
  Dado un ticket que se deriva de Eje 2 a Eje 3
  Cuando armo el handoff
  Entonces los 6 elementos (ID, KYC validado, proyecto y lote, pagos y estado de cuenta, atención previa, próximo paso) deben estar completos antes de enviar.

Escenario: CA-02 · Confirmación
  Dado un handoff recibido en Eje 3
  Cuando el Especialista Legal Senior lo recibe
  Entonces confirma la recepción en el mismo ticket.

Escenario: CA-03 · Sin confirmar (agregado por el PO)
  Dado un handoff sin confirmar tras 1 día hábil
  Cuando corre el control
  Entonces se alerta al supervisor del eje destino.
```

- Evidencia / prueba esperada (PLT-04): `Evento handoff {completo, confirmado}`

## Reglas de negocio

- RN-SVC-022 (Gate: derivacion sin paquete minimo): Una derivacion entre ejes sin criterio objetivo, sin paquete minimo completo o sin trazabilidad es un gate no compensable.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Prototipo / pantalla de referencia (artefacto): Prototipo › Detalle › «Derivar a Eje 3» — Mockups: P-03 "Detalle de ticket" (Detalle con estados, interacciones y compromisos SLA; Modal Derivar / reasignar a Eje 3 con paquete mínimo 6/6)
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `POST /api/v1/tickets/{id}/handoff` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades y dependencias declaradas en PLT-04: DEP-01 KYC · DEP-08 Cobranza
- Entidades/campos que LEE: SVC_TICKET, KYC, proyecto/lote, historial de pagos
- Entidades/campos que ESCRIBE o modifica: SVC_TICKET_HANDOFF (6 elementos, confirmación de recepción)
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
