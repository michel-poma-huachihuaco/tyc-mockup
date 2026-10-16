> **COPIA SELLADA - NO SE EDITA AQUI.** Se edita el original y se regenera.
>
> Sellado: SDK 0.7.1 | origen aybar-starter-web/SKILL.md | generado 2026-10-15
>
> El original vive en `aybar-starter-web/SKILL.md`, dentro del repositorio del Aybar SDK.
> Lo que escribas en esta copia se pierde en la siguiente generacion y, peor, queda
> en desacuerdo con el SDK que de verdad usa el servicio. Si la version de arriba no
> coincide con el SDK que tienes instalado, NO te fies de este fichero:
> `./comprobar-entorno.sh` lo comprueba y te avisa.

---

---
name: aybar-starter-web
description: Rules for using `aybar-starter-web` (Aybar SDK web starter): uniform RFC 7807 error body with corporate codes, global exception handler (ResponseStatusException and other Spring ErrorResponse keep their real status), 401/403 handlers shared with Spring Security, and OpenAPI 3 with a Bearer (JWT) scheme for the configured OIDC issuer plus the `ProblemaAybar` error schema and default 400/401/403/404/500 responses. Use when designing HTTP error responses, throwing a business exception, adding a service-specific error code, configuring Swagger UI, or typing the error body in a generated client (TypeScript).
---

# aybar-starter-web

Capa HTTP corporativa del SDK Aybar: **un solo formato de error** para todo el
portal (ProblemDetail RFC 7807 con código, `correlationId` y `timestamp`) y la
spec OpenAPI 3 con el esquema Bearer (JWT del emisor OIDC configurado) ya declarado.

El valor está en la uniformidad: un cliente del portal aprende el cuerpo de error
una vez y sirve para todos los microservicios.

## Qué registra al arrancar

`META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`:

| Autoconfiguración | Condición | Beans |
|---|---|---|
| `AybarWebAutoConfiguration` | aplicación servlet y `aybar.web.habilitado=true` (default) | `ManejadorErroresAybar`; con `spring-security-core` en el classpath, `ReenviadorExcepcionesSeguridad`; con `AuthenticationEntryPoint` en el classpath, `PuntoEntradaAutenticacionAybar` y `ManejadorAccesoDenegadoAybar` |
| `AybarOpenApiAutoConfiguration` | aplicación servlet, `OpenAPI` **y** `SpringDocConfiguration` en el classpath, y `aybar.web.openapi.habilitado=true` (default) | bean `OpenAPI` con el esquema `bearer-jwt`; y, si además `aybar.web.habilitado=true`, `PersonalizadorOpenApiProblemas` (esquema `ProblemaAybar` y respuestas de error por defecto) |

`META-INF/spring.factories` (clave `org.springframework.boot.env.EnvironmentPostProcessor`).
**No** va en `META-INF/spring/org.springframework.boot.env.EnvironmentPostProcessor.imports`:
ese mecanismo solo aplica a `AutoConfiguration` en Spring Boot 3.x
(`EnvironmentPostProcessorsFactory.fromSpringFactories` solo lee `spring.factories`;
comprobado contra el bytecode de `spring-boot-3.5.3.jar`, ver `DT-002`). Las
auto-configuraciones (`AybarWebAutoConfiguration`, `AybarOpenApiAutoConfiguration`)
si siguen en `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`.

| EnvironmentPostProcessor | Qué hace |
|---|---|
| `AybarOpenApiEnvironmentPostProcessor` | Si `aybar.web.openapi.habilitado=false`, fija `springdoc.api-docs.enabled=false` y `springdoc.swagger-ui.enabled=false`. Sin él, apagar la property del SDK dejaría springdoc sirviendo la UI igualmente. |

`AybarOpenApiAutoConfiguration` se ordena `beforeName` de
`SpringDocConfiguration` y `SwaggerConfig` para que su bean `OpenAPI` sea el que
springdoc recoja.

Los beans que pueden ser sustituidos por la aplicación
(`ManejadorErroresAybar`, `AuthenticationEntryPoint`, `AccessDeniedHandler`,
`OpenAPI`, `PersonalizadorOpenApiProblemas`) llevan `@ConditionalOnMissingBean`.

## Prefijo de propiedades

`aybar.web.*`.

| Propiedad | Tipo | Default | Descripción |
|---|---|---|---|
| `aybar.web.habilitado` | `boolean` | `true` | Apaga la autoconfiguración web: sin manejador global de errores ni manejadores 401/403. |
| `aybar.web.openapi.habilitado` | `boolean` | `true` | Apaga `/v3/api-docs` y Swagger UI, y con ellos las properties de springdoc. |
| `aybar.web.openapi.titulo` | `String` | `null` | Título de la spec. Si falta, se usa `spring.application.name`; si tampoco existe, `Aybar API`. |

Fuente: `AybarOpenApiProperties` y
`META-INF/additional-spring-configuration-metadata.json`. `aybar.web.habilitado`
no tiene clase `@ConfigurationProperties`: se lee con `@ConditionalOnProperty` y
está declarada en ese JSON de metadatos. No hay más propiedades en este starter.

## Instalación

Sin `<version>`: la gobierna `aybar-bom`.

```xml
<dependency>
  <groupId>com.aybarsac.sdk</groupId>
  <artifactId>aybar-starter-web</artifactId>
</dependency>
```

Ya arrastra `spring-boot-starter-web`. `springdoc-openapi-starter-webmvc-ui` **no**
entra por transitividad — esta declarada como `optional` en el pom del starter
(`aybar-starter-web/pom.xml:42`) y es responsabilidad del servicio anadirla a
su pom si quiere `/v3/api-docs` y Swagger UI.

## Dependencias opcionales que activa el consumidor

| Artefacto | Qué activa |
|---|---|
| `org.springframework.security:spring-security-web` (declarada `optional` en el starter; llega con `aybar-starter-security`) | Los beans `PuntoEntradaAutenticacionAybar` y `ManejadorAccesoDenegadoAybar`, y el `ReenviadorExcepcionesSeguridad`. Sin Spring Security en el classpath, este starter solo aporta el manejador global de errores. |
| `org.springframework.security:spring-security-oauth2-core` (`optional`; llega con `aybar-starter-security`) | Que el 401 de un token rechazado anuncie `WWW-Authenticate: Bearer error="invalid_token"` (RFC 6750). Sin ella, el 401 lleva solo `Bearer`. |
| `jakarta.validation:jakarta.validation-api` (`optional`) | Que `ConstraintViolationException` responda `AYB-VAL-400` con `campos`. Sin ella, ese caso no existe. |
| `org.springdoc:springdoc-openapi-starter-webmvc-ui` (declarada `optional` en el pom del starter) | Activa `AybarOpenApiAutoConfiguration`, el bean `OpenAPI` con `bearer-jwt`, `/v3/api-docs` y Swagger UI. Sin ella el starter solo aporta RFC 7807 y los manejadores 401/403. |
| `aybar-starter-logging` | El `correlationId` del MDC que se copia en cada cuerpo de error. Sin él, esa propiedad sale `null`. |

## Cuerpo de error: contrato exacto

`ProblemasAybar` construye un `ProblemDetail` con el status y añade siempre tres
propiedades: `codigo`, `correlationId` (leída del MDC) y `timestamp`
(`Instant.now()`). El manejador de validación añade una cuarta, `campos`, con un
objeto `{campo, mensaje}` por error.

Catálogo de `CodigoErrorAybar` (el código público usa guiones):

| Enum | Código | Status |
|---|---|---|
| `AYB_GEN_500` | `AYB-GEN-500` | 500 |
| `AYB_VAL_400` | `AYB-VAL-400` | 400 |
| `AYB_SEG_401` | `AYB-SEG-401` | 401 |
| `AYB_SEG_403` | `AYB-SEG-403` | 403 |
| `AYB_REC_404` | `AYB-REC-404` | 404 |
| `AYB_MET_405` | `AYB-MET-405` | 405 |
| `AYB_MED_406` | `AYB-MED-406` | 406 |
| `AYB_REC_409` | `AYB-REC-409` | 409 |
| `AYB_MED_413` | `AYB-MED-413` | 413 |
| `AYB_MED_415` | `AYB-MED-415` | 415 |
| `AYB_VAL_422` | `AYB-VAL-422` | 422 |
| `AYB_GEN_429` | `AYB-GEN-429` | 429 |
| `AYB_GEN_503` | `AYB-GEN-503` | 503 |

Un status sin entrada propia responde `AYB-GEN-<status>` (por ejemplo
`AYB-GEN-418` o `AYB-GEN-502`): `CodigoErrorAybar.codigoPara(status)` devuelve el
del catálogo o ese. El código nunca contradice al status. No hay dos entradas
con el mismo status (lo vigila `CodigoErrorAybarTest`).

Excepciones que traduce `ManejadorErroresAybar`:

| Excepción | Código |
|---|---|
| `MethodArgumentNotValidException` | `AYB-VAL-400` (+ propiedad `campos`) |
| `HttpMessageNotReadableException`, `MethodArgumentTypeMismatchException`, `MissingServletRequestParameterException` | `AYB-VAL-400` |
| `HttpRequestMethodNotSupportedException` | `AYB-MET-405` (+ cabecera `Allow`) |
| `HttpMediaTypeNotSupportedException` | `AYB-MED-415` (+ cabecera `Accept`) |
| `ConstraintViolationException` (Bean Validation en un bean `@Validated`; solo si `jakarta.validation` está en el classpath) | `AYB-VAL-400` (+ propiedad `campos`, ruta sin el nombre del método) |
| `NoResourceFoundException` | `AYB-REC-404` |
| `NoSuchElementException` | `AYB-REC-404`, con un `WARN` que dice dónde se lanzó (traza en `DEBUG`): puede ser un bug, no un recurso inexistente |
| `AybarException` | el código y el status que lleve la propia excepción |
| `ResponseStatusException` y cualquier otra `ErrorResponse` de Spring (`ErrorResponseException`, `ServletRequestBindingException` —cabecera o cookie requerida ausente—, `HttpMediaTypeNotAcceptableException`, `HandlerMethodValidationException`, `NoHandlerFoundException`, `AsyncRequestTimeoutException`, `MaxUploadSizeExceededException`, `MissingServletRequestPartException`) | **su status real** con `CodigoErrorAybar.codigoPara(status)` y las cabeceras que la excepción pida (ej. `Retry-After`). En un 4xx, el `detail` es el `reason` de la `ResponseStatusException` si lo trae; una cabecera ausente se nombra; `HandlerMethodValidationException` (`@Min` en un `@RequestParam`...) añade `campos`. En un 5xx el `detail` es siempre genérico y la excepción va al log. |
| Cualquier otra `ErrorResponse` (también una excepción propia del servicio que implemente la interfaz) | su status real y sus cabeceras |
| `Exception` (cualquier otra) | `AYB-GEN-500` |

`AybarException` acepta códigos propios del servicio:
`new AybarException("AYB-CON-409", "Contrato duplicado", HttpStatus.CONFLICT)`.

## Errores y situaciones de fallo

- **El detalle interno de un error no controlado nunca llega al cliente.**
  `manejarGenerica` loguea la excepción completa en `ERROR` y responde *"Ha
  ocurrido un error interno; repórtelo indicando el correlationId"*. La
  investigación se hace por `correlationId`, no por el mensaje.
- **`ReenviadorExcepcionesSeguridad` existe por un fallo concreto**: sin él, el
  `@ExceptionHandler(Exception.class)` de `ManejadorErroresAybar` capturaría un
  `AccessDeniedException` de `@PreAuthorize` y respondería **500 en vez de 403**.
  El advice va con `@Order(HIGHEST_PRECEDENCE)` y relanza las excepciones de
  seguridad para que las resuelva `ExceptionTranslationFilter`.
- **`correlationId: null` en el cuerpo de error** significa que falta
  `aybar-starter-logging` o que la petición no pasó por `FiltroCorrelacion`.
- **`aybar.web.habilitado=false`** deja el servicio con los errores por defecto
  de Spring Boot: sin `codigo`, sin `correlationId` y con el formato que cada
  versión de Boot decida.
- **Declarar un bean `OpenAPI` propio** desactiva el del SDK
  (`@ConditionalOnMissingBean(OpenAPI.class)`), y con él el esquema de seguridad
  `bearer-jwt`: Swagger UI pierde el botón *Authorize*. El esquema
  `ProblemaAybar` y las respuestas de error sí se mantienen: los añade un
  `GlobalOpenApiCustomizer` aparte, que se aplica también a los grupos.
- **Un `ResponseStatusException` 5xx no muestra su `reason`.** Si quieres que el
  cliente lea un motivo, es un 4xx o una `AybarException` con código propio.

## El error en la spec OpenAPI (para clientes generados)

Con springdoc en el classpath, `PersonalizadorOpenApiProblemas` deja en
`/v3/api-docs`:

- `components.schemas.ProblemaAybar`: `type`, `title`, `status`, `detail`,
  `instance`, `codigo`, `correlationId` (nullable), `timestamp` (`date-time`) y
  `campos[{campo, mensaje}]`. Requeridos: `type`, `title`, `status`, `codigo`,
  `timestamp`. El campo es `codigo`, **no** `code`.
- En **cada operación**, respuestas `400`, `401`, `403`, `404` y `500` con
  `application/problem+json` que referencian `#/components/schemas/ProblemaAybar`.
  Si la operación ya declara ese status (con `@ApiResponse`), se respeta la suya.

Un cliente TypeScript generado (openapi-typescript, orval...) tipa así el error
sin escribirlo a mano. Para documentar otro status con el mismo cuerpo, usa
`PersonalizadorOpenApiProblemas.respuesta("descripción")` en un
`OpenApiCustomizer` propio o `@ApiResponse(responseCode = "409", content =
@Content(mediaType = "application/problem+json", schema = @Schema(ref =
"#/components/schemas/ProblemaAybar")))`.

## Qué NO hacer

- **No** devuelvas `ResponseEntity` con cuerpos de error propios. Lanza
  `AybarException` (o `ResponseStatusException` para un 4xx sin código propio) y
  deja que el manejador global construya el ProblemDetail.
- **No** captures `AccessDeniedException` ni `AuthenticationException` en un
  `@ExceptionHandler` de tu servicio: convertirías un 403 legítimo en otra cosa.
- **No** metas el mensaje de la excepción original en la respuesta de un 500.
  Va al log, no al cliente.
- **No** inventes códigos fuera del patrón `AYB-<AREA>-<HTTP>`. El catálogo del
  enum cubre los genéricos; los de negocio se declaran con `AybarException` y su
  código propio.
- **No** abras `/v3/api-docs` ni `/swagger-ui` en
  `aybar.security.rutas-publicas`. Exigen JWT por diseño; Swagger UI se
  autentica con su botón *Authorize*.
- **No** pongas este starter en un servicio sin HTTP: toda la autoconfiguración
  es `@ConditionalOnWebApplication(SERVLET)` y no hará nada.

## Qué NO cubre este starter

- Autenticación y roles -> `aybar-starter-security`.
- `correlationId` y logs JSON -> `aybar-starter-logging`.
- Eventos de auditoría -> `aybar-starter-audit`.
- Cliente HTTP saliente -> `aybar-starter-client`.
- Validación de entrada: las anotaciones son de Jakarta Bean Validation; este
  starter solo **traduce** el resultado a RFC 7807.
