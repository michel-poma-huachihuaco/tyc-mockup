---
name: aybar-redis
estado: NO_IMPLEMENTADO
description: "NO IMPLEMENTADO (diseño aprobado, sin código en el jar): el SDK NO da soporte a Redis — no hay puerto Cache, ni autoconfiguración, ni dependencia spring-data-redis, ni propiedad AYBAR_REDIS_URI leída por ningún starter. No generes código ni YAML de Redis apoyándote en el SDK. Lee esta skill solo para conocer el diseño futuro."
---

> # ⛔ NO IMPLEMENTADO — NO GENERES CÓDIGO CON ESTA SKILL
>
> **El SDK no soporta Redis.** Verificado por búsqueda sobre todo el árbol: en
> código de producción (`aybar-starter-*/src/main/java`) hay **cero** ocurrencias
> de `redis`. Las únicas apariciones en Java son
> `aybar-starter-config/src/test/java/.../SinPasswordEnYamlTests.java` y
> `aybar-starter-data/src/test/java/.../SinPasswordEnYamlTests.java`, que son
> tests que comprueban que **no** haya contraseñas en los YAML — no dan soporte a
> Redis, solo nombran la variable en una lista de patrones prohibidos.
>
> No existe:
>
> - ninguna interfaz `Cache` en `com.aybarsac.sdk.*`,
> - ninguna autoconfiguración de Redis en `aybar-starter-data`,
> - ninguna dependencia `spring-boot-starter-data-redis` en el BOM ni en los starters,
> - ningún starter que lea `AYBAR_REDIS_URI` (aparece en `.env.example` y en
>   `docs/VARIABLES.md` de la plantilla como variable **reservada**, sin consumidor).
>
> ## Qué hacer mientras tanto
>
> **Si el servicio no necesita caché, no declares Redis** — que es el caso por
> defecto. Postgres escribe y Mongo lee; ese es el modelo que el SDK sí soporta
> (ver la skill `aybar-cqrs`, y `com.aybarsac.sdk.data.cqrs.AybarWriteRepository`
> / `AybarReadRepository`, que existen de verdad).
>
> Si de verdad hace falta caché hoy, es una decisión del **servicio**: declara tú
> la dependencia y la configuración en el servicio, sin esperar autoconfiguración
> del SDK, y déjalo registrado como deuda hasta que el starter exista.

---

# Diseño futuro (no es API disponible)

Lo que sigue es el diseño acordado, conservado como referencia para cuando se
implemente. **No es API disponible.**

Redis sería **opcional**. No sustituye Postgres (escritura) ni Mongo (lectura).

- Puerto `domain.port.out.Cache` — lo declararía el servicio en su propio dominio.
- Adapter `adapters.outbound.persistence.redis`.
- URI: `AYBAR_REDIS_URI` inyectada por entorno; nunca en YAML de Git.

Si el servicio no necesita caché, no declares Redis.
