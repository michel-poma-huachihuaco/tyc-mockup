> **COPIA SELLADA - NO SE EDITA AQUI.** Se edita el original y se regenera.
>
> Sellado: SDK 0.7.1 | origen aybar-starter-messaging/SKILL.md | generado 2026-10-15
>
> El original vive en `aybar-starter-messaging/SKILL.md`, dentro del repositorio del Aybar SDK.
> Lo que escribas en esta copia se pierde en la siguiente generacion y, peor, queda
> en desacuerdo con el SDK que de verdad usa el servicio. Si la version de arriba no
> coincide con el SDK que tienes instalado, NO te fies de este fichero:
> `./comprobar-entorno.sh` lo comprueba y te avisa.

---

---
name: aybar-starter-messaging
description: Rules for using `aybar-starter-messaging` (Aybar SDK Kafka starter): event producer with correlation headers, fail-closed payload, DLQ + retry, poison-pill protection, consumer MDC correlation. Use when a service needs to publish or consume domain events over the corporate Kafka broker.
---

# aybar-starter-messaging

Kafka corporativo para microservicios Aybar. El dominio nunca ve
`KafkaTemplate` — solo el puerto `EventPublisher`, implementado en `adapters`
delegando a `AybarEventProducer`. Kafka **solo** aparece en `adapters`.

## Componentes

| Clase | Paquete |
|-------|---------|
| `AybarEventProducer` | `com.aybarsac.sdk.messaging` |
| `MessagingValidations` | `com.aybarsac.sdk.messaging` |
| `AybarMessagingAutoConfiguration` | `com.aybarsac.sdk.messaging` |
| `AybarMessagingProperties` | `com.aybarsac.sdk.messaging` |
| `KafkaDeserializerPostProcessor` | `com.aybarsac.sdk.messaging` |
| `ConsumerMdcInterceptor` | `com.aybarsac.sdk.messaging` |

## Hard rules

- Kafka **solo** en `adapters`. El dominio ve `EventPublisher`, nunca
  `KafkaTemplate`.
- **Nunca** publicar un `String` libre en el payload — fail-closed (Ley
  29733). Solo `PartyRef`, `RefCatalogo`, `RefEntidad`, `Long`, `Integer`,
  `Boolean`, `Instant` o `enum`.
- Tópicos: `aybar.<fragmento>.<evento>`, minúsculas, sin excepciones.
- La `key` del evento es `null` o un identificador técnico
  (`[A-Za-z][A-Za-z0-9_]{0,63}`, sin 8+ dígitos seguidos), ej.
  `contrato_42`; nunca un DNI ni texto libre. Las claves del payload y el
  `name()` de los enum siguen la misma regla (la de `aybar-starter-audit`).
  Los mensajes de error no repiten el valor rechazado.
- `AYBAR_KAFKA_BOOTSTRAP` obligatorio siempre (también en un test que no lo
  configure) — el arranque falla explícito, nunca conecta en silencio a
  `localhost:9092`.
- La concurrencia del consumidor es responsabilidad del servicio — este
  starter no configura una `ConcurrentKafkaListenerContainerFactory` propia.
  Usá `spring.kafka.listener.concurrency <= número de particiones del topic`.
- La publicación **nunca** bloquea el hilo del request — `AybarEventProducer.publish`
  devuelve `CompletableFuture`.
- El consumidor siempre recibe `String` en el `@KafkaListener` — parsear el
  JSON a mano adentro. No configurar un `JsonDeserializer` como
  deserializador de Kafka a nivel de cliente: aunque este starter ya envuelve
  cualquier deserializador con `ErrorHandlingDeserializer` (protección
  poison-pill), el patrón probado y documentado es `String` + parseo manual.

## When it applies

- El servicio necesita publicar un evento de dominio para que otro lo
  consuma.
- El servicio consume eventos de otro servicio vía `@KafkaListener`.
- Necesitás DLQ + retry acotado sin configurarlo a mano en cada listener.

## When it does NOT apply

- Health de Kafka en el grupo `readiness` → no lo aporta este starter hoy
  (retirado por conflicto con otros starters; ver `docs/starter-messaging.md`
  §9.2 en el repo del SDK).
- Autenticación SASL/IAM contra AWS MSK real → sin resolver por el equipo.
- Proyección CQRS (Kafka → Mongo) → vive en el servicio, no en el SDK.
- Outbox transaccional, Redis → plantilla P5, no este starter.

## Common junior questions

- "¿Por qué mi `@KafkaListener` nunca ve el mensaje cuando el JSON viene
  raro?" -> Revisá si configuraste un `JsonDeserializer` como deserializador
  de Kafka en vez de recibir `String` y parsear adentro. Este starter envuelve
  cualquier deserializador con `ErrorHandlingDeserializer` por default, así
  que incluso ahí debería recuperarse hacia la DLQ — si no, revisá que no
  hayas pisado esa property vos mismo.
- "¿Puedo consumir un evento como POJO directo en el parámetro del
  `@KafkaListener`?" -> El patrón soportado y probado es recibir `String` y
  parsear el JSON manualmente adentro del método.
- "¿Dónde configuro el nombre del tópico de la DLQ?" -> `aybar.messaging.dlq-suffix`
  (default `.DLQ`).
- "¿Por qué mi consumidor procesa todo en un solo hilo?" -> Porque el starter
  no configura concurrencia — queda en el default de Spring Boot
  (`concurrency=1`). Configurá `spring.kafka.listener.concurrency` según las
  particiones de tu topic.
- "¿Por qué el health de Kafka no aparece en `/actuator/health/readiness`?"
  -> A propósito, se retiró — ver la deuda técnica documentada en
  `docs/starter-messaging.md` del repo del SDK.
