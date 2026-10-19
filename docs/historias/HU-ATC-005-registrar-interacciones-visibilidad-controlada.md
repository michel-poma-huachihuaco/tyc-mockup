---
id: "HU-ATC-005"
tipo: hu
titulo: "Registrar interacciones visibles o internas con evidencia"
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

Va en `docs/historias/HU-ATC-005-registrar-interacciones-visibilidad-controlada.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-01 / docs/analisis/BRD.md
- Como colaborador de área quiero registrar mensajes al cliente y notas internas, con fotos o documentos adjuntos para separar lo que ve el cliente de lo interno y conservar la evidencia del caso.
- Requerimiento origen (RF-SVC-005 — Registrar interacciones con visibilidad controlada): El sistema debe registrar cada interacción con canal, gestor de tickets, visibilidad al cliente y evidencia multimedia adjunta. · Proceso: PROC-SVC-002 (Atencion y resolucion) · Fuente: PLT-04 · HU-ATC-005 · traza RF-SVC-005
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Salida 30-oct-2026
- Planificación (PLT-04 v1.2): Prioridad: **DEBE** · Iteración: **I1** · Estimación: **5 h** · Asignado: **Dev 1** (2026-10-21 → 2026-10-22) · Depende de HU: HU-ATC-004
- Observaciones de alcance: Fuera de alcance: Chat en vivo; edición de interacciones enviadas.
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · ciclo de vida del ticket | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · cambio de estado e interacción | 6.5 Diagrama entidad-relación · estado, interacciones e hitos

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Registrar interacciones visibles o internas con evidencia

Escenario: CA-01 · Primera respuesta
  Dado un ticket sin respuestas
  Cuando registro la primera respuesta visible al cliente
  Entonces se completa el hito FirstRespondedDateTime.

Escenario: CA-02 · Evidencia
  Dado una incidencia con foto o video
  Cuando la adjunto
  Entonces queda dentro de la interacción, sin tabla de adjuntos aparte.

Escenario: CA-03 · Nota interna (agregado por el PO)
  Dado que marco una interacción como interna
  Cuando el cliente consulta su caso en Mi Portal
  Entonces la nota no se muestra.

Escenario: CA-04 · DLP (agregado por el PO)
  Dado que escribo un DNI o una tarjeta en una nota de bitácora
  Cuando intento guardarla
  Entonces el sistema advierte que no se permite PII en ese campo.
```

- Evidencia / prueba esperada (PLT-04): `Evento interacción_registrada {tipo, visible, adjuntos}`

## Reglas de negocio

- RN-SVC-012 (DLP en bitacoras): Prohibido registrar PII en los campos Notes_*: solo el motivo operativo del movimiento.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Prototipo / pantalla de referencia (artefacto): Prototipo › Detalle de ticket (Interacciones) — Mockups: P-03 "Detalle de ticket" (Detalle con estados, interacciones y compromisos SLA; Modal Derivar / reasignar a Eje 3 con paquete mínimo 6/6), P-17 "Mi Portal del cliente" (Mis solicitudes, detalle y nueva solicitud (móvil))
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `POST /api/v1/tickets/{id}/interacciones` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades y dependencias declaradas en PLT-04: ENT-SVC-004 SVC_TICKET_INTERACTION · RNF-SEC-008
- Entidades/campos que LEE: SVC_TICKET
- Entidades/campos que ESCRIBE o modifica: SVC_TICKET_INTERACCION (canal, autor, visibilidad, adjuntos)
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
