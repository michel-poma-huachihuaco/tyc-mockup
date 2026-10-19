---
name: aybar-mensajeria
description: Kafka corporativo Aybar (tópicos, headers, DLQ, EventPublisher). Usar al publicar o consumir eventos, KafkaTemplate, o mensajería entre servicios.
---

# Mensajería Aybar

> **Contrato detallado:** `aybar-starter-messaging` (en un servicio generado, `docs/skills/aybar-starter-messaging.md`; en el repo del SDK, `aybar-starter-messaging/SKILL.md`): propiedades, variables obligatorias y trampas. Esta skill es el resumen transversal; si discrepan, **manda el contrato**.

Solo en `adapters`. El dominio usa `EventPublisher`.

- Bootstrap: `AYBAR_KAFKA_BOOTSTRAP`.
- Tópico: `aybar.<fragmento>.<evento>` (ej. `aybar.contract.aprobado`).
- Headers: `X-Correlation-Id`, `companyId`, `userAccountId`, `servicio`.
- Payload fail-closed (mismos tipos que auditoría). No `String` libre.
- DLQ + retry acotado. El hilo REST no bloquea al broker.
- Health del broker en **readiness**, no liveness.
