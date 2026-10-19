---
name: aybar-errores
estado: NO_IMPLEMENTADO
description: "NO IMPLEMENTADO (diseño aprobado, sin código en el jar): el catálogo CodigoNegocio, la factory NegocioExcepciones.de(...) y la i18n de ProblemDetail NO existen — no generes código que los importe. Lee esta skill solo para conocer el diseño futuro; para lanzar errores HOY usa com.aybarsac.sdk.web (CodigoErrorAybar, AybarException, ProblemasAybar), que ya emite RFC 7807."
---

> # ⛔ NO IMPLEMENTADO — NO GENERES CÓDIGO CON ESTA SKILL
>
> **Nada de lo que describe el apartado «Diseño futuro» existe hoy en el SDK.**
> Verificado por búsqueda exhaustiva sobre el código de los starters:
>
> | Símbolo | ¿Existe? |
> |---|---|
> | paquete `com.aybarsac.sdk.errores` | **NO** — ningún `src/main/java` lo declara |
> | interfaz `CodigoNegocio` | **NO** — solo se nombra en documentación y, en el repo del SDK, en `aybar-starter-config/src/test/resources/referencia/NormaHexagonalAybarTest.java`, que es un fichero de *referencia* bajo `test/resources` y **no se compila** |
> | factory `NegocioExcepciones.de(...)` | **NO** |
> | i18n `errores_es.properties` / `MessageSource` en el advice | **NO** — no hay ningún `MessageSource` ni resolución de `Accept-Language` en `aybar-starter-web` |
>
> Si escribes `implements com.aybarsac.sdk.errores.CodigoNegocio` o
> `NegocioExcepciones.de(...)`, **el proyecto no compilará**.
>
> ## Qué hacer mientras tanto — API que SÍ existe
>
> Usa `com.aybarsac.sdk.web`, de `aybar-starter-web`. Es real y ya implementa
> RFC 7807 (`ManejadorErroresAybar` es el `@RestControllerAdvice` global):
>
> - `CodigoErrorAybar` — enum de **plataforma** con los códigos que hoy existen:
>   `AYB-GEN-500`, `AYB-VAL-400`, `AYB-SEG-401`, `AYB-SEG-403`, `AYB-REC-404`,
>   `AYB-MET-405`, `AYB-MED-415`. `codigo()` devuelve la forma con guiones y
>   `status()` el `HttpStatus`.
> - `AybarException` — dos constructores:
>   `AybarException(String codigo, String mensaje, HttpStatus status)` para un
>   código propio del servicio, y `AybarException(CodigoErrorAybar codigo, String mensaje)`
>   para uno de plataforma.
> - `ProblemasAybar.problema(...)` — construye el `ProblemDetail`.
> - `ManejadorErroresAybar` — ya traduce toda excepción a RFC 7807. **No lo reimplementes.**
>
> Un error de negocio propio del servicio se lanza así, desde `application` o
> `adapters` (el dominio no importa Spring, así que `AybarException` —que extiende
> `RuntimeException` de Spring Web— no entra en `domain`):
>
> ```java
> throw new AybarException("AYB-CUO-409", "Pago duplicado", HttpStatus.CONFLICT);
> ```
>
> El mensaje va en castellano, en el punto donde se lanza. No hay bundle i18n
> todavía; no crees `i18n/errores_*.properties` esperando que alguien los lea.
>
> **Allowlist del dominio:** la regla ArchUnit real (`NormaHexagonalTest`, en
> `boot/src/test` del servicio generado) permite
> `com.aybarsac.sdk.data.cqrs` y `com.aybarsac.sdk.common` — las dos piezas
> del SDK que son Java puro y existen hoy. `com.aybarsac.sdk.errores` NO está
> en la allowlist: el paquete no existe, así que la regla lo bloquea en el
> momento de escribir el `import`, no lo deja llegar a un fallo de
> compilación más confuso más adelante.

---

# Diseño futuro (no es API disponible)

Lo que sigue es el contrato acordado en
`docs/arquitectura-microservicio-hexagonal.md` sección 3.2 (documento del repo
del SDK, no del servicio), conservado como
referencia para cuando se implemente. **No lo uses como guía para escribir código
hoy.**

## Catálogo (domain) — futuro

Enum en `domain.error` (o `domain`) que implementaría `com.aybarsac.sdk.errores.CodigoNegocio`:

- `codigo()` público `AYB-<SVC>-<HTTP>` (ej. `AYB-CUO-409`)
- `statusHttp()`, `categoria()` (p. ej. `"NEG"`)
- **Sin** texto para el usuario en el enum

Plataforma (`AYB-GEN-500`, `AYB-VAL-400`, …) seguiría en `CodigoErrorAybar` —esa
parte sí existe ya. No mezclar códigos de plataforma en el enum del servicio.

## Factory — futuro

En el caso de uso:

```java
// FUTURO — NO COMPILA HOY
throw NegocioExcepciones.de(CodigosCuota.AYB_CUO_PAGO_DUPLICADO);
```

La intención era evitar el mensaje hardcodeado del `new AybarException(...)`.
Mientras la factory no exista, el `new AybarException(...)` es la forma correcta,
no un antipatrón.

## i18n — futuro

- Clave del bundle = el código (`AYB-CUO-409`)
- `i18n/errores_es.properties` y `errores_en.properties` en `boot`
- Locale: `Accept-Language`, default `es`
- El advice traduciría `title`/`detail`; la propiedad JSON `codigo` no se traduce
- Domain no importa `MessageSource` ni Spring
