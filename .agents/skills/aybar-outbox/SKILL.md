---
name: aybar-outbox
estado: NO_IMPLEMENTADO
description: "NO IMPLEMENTADO (diseño aprobado, sin código en el jar): el SDK NO aporta outbox transaccional — no hay puerto Outbox, ni adapter, ni tabla Flyway, ni publicador. No generes código que importe símbolos de outbox del SDK. Lee esta skill solo para conocer el diseño futuro."
---

> # ⛔ NO IMPLEMENTADO — NO GENERES CÓDIGO CON ESTA SKILL
>
> **El SDK no trae outbox.** Verificado por búsqueda sobre todo el árbol:
> `outbox` no aparece en **ningún** `.java` de `aybar-starter-*` (ni en
> `src/main` ni en `src/test`). Solo se menciona en documentación
> del repo del SDK (`docs/arquitectura-microservicio-hexagonal.md`,
> `aybar-starter-messaging/README.md` y `SKILL.md`) y en esta skill.
>
> No existe:
>
> - ninguna interfaz `Outbox` en el SDK,
> - ningún adapter de outbox en `aybar-starter-data`,
> - ninguna migración Flyway con tabla de outbox en la plantilla del archetype,
> - ningún proceso publicador (`@Scheduled`, poller o CDC) en `aybar-starter-messaging`.
>
> **No importes nada de outbox desde `com.aybarsac.sdk.*`: no compilará.**
>
> ## Qué hacer mientras tanto
>
> Lo que sí existe para publicar eventos es `com.aybarsac.sdk.messaging.AybarEventProducer`
> (starter `aybar-starter-messaging`): `publish(topic, key, payload, headers)`,
> con validación del tópico `aybar.<fragmento>.<evento>`, headers corporativos y
> `DefaultErrorHandler` con reintento acotado + DLQ ya configurados.
>
> Publica **después** del commit de la transacción de escritura —por ejemplo con
> un listener `@TransactionalEventListener(phase = AFTER_COMMIT)` en el adapter—,
> no dentro de ella. Eso no es un outbox y **no garantiza entrega**: si el proceso
> cae entre el commit y el publish, el evento se pierde. Si el caso de uso exige
> garantía, dilo explícitamente en lugar de fingir que el SDK la da, y no
> improvises un doble commit JDBC+Kafka a mano.

---

# Diseño futuro (no es API disponible)

Lo que sigue es el diseño acordado, conservado como referencia para cuando se
implemente. **No es API disponible.**

En la **misma transacción** de escritura Postgres se inserta una fila de outbox.
Un proceso posterior publica a Kafka y marca publicado.

- Puerto `domain.port.out.Outbox` (o equivalente) — lo declararía **el servicio**
  en su propio dominio, no el SDK. Adapter en `adapters.outbound.persistence.postgres`.
- Tabla de ejemplo en Flyway de la plantilla (frente P5). No es un starter que
  acople messaging+data.
- El publisher Kafka (frente P3) no se llama dentro de la transacción HTTP de
  forma que un rollback deje mensaje huérfano.

No implementar outbox «a mano» con doble commit JDBC+Kafka sin esta tabla.
