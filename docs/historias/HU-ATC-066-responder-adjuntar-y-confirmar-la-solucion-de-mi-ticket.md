---
id: "HU-ATC-066"
tipo: hu
titulo: "Responder, adjuntar y confirmar la solución de mi ticket"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-24", "EP-ATC-06"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-066 — Responder, adjuntar y confirmar la solución de mi ticket

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-06 / FT-ATC-24
- Como cliente de Aybar quiero responder, adjuntar documentos y confirmar o rechazar la solución de mi ticket para cerrar mi caso cuando esté conforme sin tener que llamar.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-066 | Debe | 2 h con IA | Dev 4 (Daniel) | 2 | 2-nov-2026 | Pendiente DoR |

**Requerimiento de origen:** El sistema debe permitir al cliente responder lo que pide el gestor, adjuntar documentos y confirmar o rechazar la solución desde Mi Portal; la confirmación cierra el ticket y el rechazo lo reabre con su motivo. Propuesta PO v1.3 · decisión de etapas del 16-oct-2026 (EP-ATC-06)

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Responder al gestor (agregado por el PO)
  Dado un ticket en «pendiente del cliente»
  Cuando respondo y adjunto el documento pedido
  Entonces la respuesta queda como interacción visible, el ticket vuelve a «en atención» y el SLA se reanuda.

Escenario: CA-02 · Confirmar solución (agregado por el PO)
  Dado un ticket resuelto
  Cuando confirmo la solución
  Entonces el ticket pasa a cerrado con cierre formal en Mi Portal (RN-SVC-023) y se dispara la encuesta (HU-019).

Escenario: CA-03 · Rechazar solución (agregado por el PO)
  Dado un ticket resuelto
  Cuando rechazo la solución con un motivo
  Entonces el ticket se reabre, vuelve al área responsable y el motivo queda en la bitácora.

Escenario: CA-04 · Sin respuesta (agregado por el PO)
  Dado un ticket resuelto sin respuesta del cliente
  Cuando pasan los días hábiles configurados
  Entonces el ticket se cierra automáticamente y el cliente recibe el aviso.
```

## Reglas de negocio

- RN-SVC-023 cierre formal en Mi Portal
- RN-SVC-044 visibilidad para el cliente

**Fuera de alcance:** Edición de mensajes ya enviados.

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo Aybar Atiende › Mi Portal › Detalle del ticket
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): ENT-SVC-004 SVC_TICKET_INTERACTION (autor = cliente), REOPENED en STATUS_LOG
- Datos de prueba / analítica (PLT-04): Evento portal_cierre {confirmado | rechazado} Preguntas abiertas ¿Cuántos días hábiles se espera la confirmación antes del cierre automático?
- Entidades que LEE / ESCRIBE: (pendiente de detallar con `docs/datos/`)
- Migración / backfill / borrado: (pendiente)

## Diagramas (PLT-04, sección 6)

- 6.1 Diagrama de estados · ticket visto por el cliente en Mi Portal
- 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar)
- 6.3 Diagrama de procesos TO-BE · situación objetivo
- 6.4 Diagrama de secuencia · registro y seguimiento en Mi Portal
- 6.5 Diagrama entidad-relación · ticket del cliente y su trazabilidad

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-04 v1.3), sin cambiar su contenido — Revisado por: (pendiente)
