---
id: "HU-ATC-057"
tipo: hu
titulo: "Enviar al cliente la alerta de cancelación en paralelo"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-22", "EP-ATC-11", "AYB-0001"]
tags: [hu]
ui: false
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-057-enviar-paralelo-alerta-cancelacion-servicio.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-11 / docs/analisis/BRD.md
- Como analista de Cobranza quiero que al abrir el caso se envíe de inmediato al cliente la alerta de cancelación del servicio para que el cliente pueda regularizar antes de la resolución.
- Requerimiento origen (RF-SVC-057 — Enviar en paralelo la alerta de cancelacion del servicio): El sistema debe enviar al cliente, en paralelo al proceso de resolución, una alerta de cancelación del servicio (deuda, plazo para regularizar y consecuencias) por correo, WhatsApp y Mi Portal, dejando constancia de envío. Feedback 2.ª reunión · ítem 2 · Proceso: PROC-SVC-021 (Resolucion de contrato por 3 meses de no pago) · Fuente: PLT-04 · HU-ATC-057 · traza RF-SVC-057
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Salida 30-oct-2026
- Planificación (PLT-04 v1.2): Prioridad: **DEBE** · Iteración: **I2** · Estimación: **3 h** · Asignado: **Dev 4** (2026-10-26 → 2026-10-27) · Depende de HU: HU-ATC-056 · Dependencias externas: DEP-08 (Cobranza: estado de cuenta, historial de pagos y cuotas vencidas por contrato (desfase ≤ 24 h))
- Observaciones de alcance: Fuera de alcance: Gestión de cobranza telefónica.
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · caso de resolución por morosidad | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · apertura del caso de resolución | 6.5 Diagrama entidad-relación · caso y alertas de morosidad
- Referencia visual / plantilla en prototipo: Plantilla de alerta de cancelación

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Enviar al cliente la alerta de cancelación en paralelo

Escenario: CA-01 · Envío en paralelo
  Dado un ticket de resolución de contrato creado
  Cuando se registra
  Entonces en ese mismo momento se envía al cliente la alerta de cancelación del servicio, sin esperar el avance del flujo de resolución.

Escenario: CA-02 · Constancia
  Dado una alerta enviada
  Cuando se consulta el ticket
  Entonces se ve la constancia (fecha, hora, canal, destinatario y estado de entrega) como evidencia.

Escenario: CA-03 · Canal fallido (agregado por el PO)
  Dado que el correo del cliente rebota
  Cuando se envía la alerta
  Entonces se reintenta por WhatsApp y Mi Portal y la constancia registra cada intento.
```

- Evidencia / prueba esperada (PLT-04): `Evento alerta_cancelacion {canal} Preguntas abiertas ¿Qué significa «cancelación del servicio»: resolución del contrato, suspensión de beneficios u otro? ¿Qué plazo de regularización se da al cliente? ¿Legal aprueba el texto de la alerta?`

## Reglas de negocio

- RN-SVC-038 (Alerta de cancelacion en paralelo): La alerta de cancelacion del servicio se envia al cliente al crearse el caso, en paralelo y sin esperar el flujo de resolucion; una sola vez por caso y con constancia de envio.
- RN-SVC-012 (DLP en bitacoras): Prohibido registrar PII en los campos Notes_*: solo el motivo operativo del movimiento.

## Datos (CAD-F5)

- Entidades y dependencias declaradas en PLT-04: ENT-SVC-018 SVC_CONTRACT_DEFAULT_ALERT, ENT-SVC-004 SVC_TICKET_INTERACTION · DEP-08
- Entidades/campos que LEE: SVC_TICKET (caso de resolución)
- Entidades/campos que ESCRIBE o modifica: constancia de envío de la alerta (correo, WhatsApp, Mi Portal)
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
