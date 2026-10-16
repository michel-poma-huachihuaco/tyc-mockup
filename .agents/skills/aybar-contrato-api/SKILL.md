---
name: aybar-contrato-api
description: Del OpenAPI aprobado del paquete (docs/arquitectura/*.openapi.yaml) al código — controladores en adapters.inbound.rest, errores RFC 7807 con aybar-starter-web, springdoc, pruebas de contrato, versionado de rutas con compatibilidad declarada y lo que el servidor le debe a un frontend (CORS, X-Correlation-Id, codigo). Usar al implementar o cambiar un endpoint que el paquete define, al revisar si el servicio cumple su contrato, o cuando aparezcan openapi.yaml, /v3/api-docs, ProblemDetail o /api/v1. El lado del cliente TypeScript está en aybar-contrato-api-cliente.
---

# Contrato de API

El contrato manda: el `docs/arquitectura/<servicio>.openapi.yaml` aprobado en G3
es la especificación. El código la cumple. Si el código "necesita" otra ruta,
otro campo u otro código, eso es un cambio de contrato y vuelve a G3; no se arregla
en el controlador.

## Del YAML al código

| Del contrato | Va en |
|---|---|
| `paths` + operación | `@RestController` en `adapters.inbound.rest`, un método por operación, que delega en un caso de uso de `application` |
| `requestBody` / `responses` (esquemas) | DTO record en `adapters.inbound.rest` (o `application.dto` si lo comparte otro adaptador) con Bean Validation. Nunca la entidad de dominio ni la JPA |
| `@Operation`, `@Schema`, `@Tag` | Solo `adapters.inbound.rest`. Nunca en `domain` ni en `application` |
| Bean `OpenAPI` o `GroupedOpenApi` extra | `adapters.inbound.rest.openapi` |
| `securitySchemes` / roles | `@PreAuthorize` en el controlador; el token lo valida `aybar-starter-security` |

No hay generador de código del contrato en el SDK. Si el proyecto quiere uno
(`openapi-generator` o similar), es una dependencia de terceros con `<version>`
explícita y una decisión de su ADR.

## Errores: RFC 7807, sin reimplementar

`aybar-starter-web` ya convierte toda excepción en `ProblemDetail` con `codigo`,
`correlationId` y `timestamp` (y `campos` en validación). Contrato:
`docs/skills/aybar-starter-web.md` (en el SDK, `aybar-starter-web/SKILL.md`).

- Un error de negocio del contrato se lanza desde `application` o `adapters`: `throw new AybarException("AYB-<AREA>-<HTTP>", "mensaje", HttpStatus.CONFLICT)`.
- Las respuestas de error del YAML deben ser `application/problem+json` con esas propiedades. Si el YAML declara otro cuerpo o códigos fuera del patrón `AYB-<AREA>-<HTTP>`, es una contradicción para G3: se reporta, no se traduce por tu cuenta.
- No escribas `@ControllerAdvice` propios, ni cuerpos de error a mano, ni captures `AccessDeniedException`.
- `com.aybarsac.sdk.errores` no existe (skill `aybar-errores`).

## springdoc

- El servicio declara `springdoc-openapi-starter-webmvc-ui` en `adapters/pom.xml`, sin versión. La plantilla ya la trae con el starter web.
- El SDK aporta el bean `OpenAPI` con el esquema `bearer-jwt`. Título: `aybar.web.openapi.titulo`. Si declaras otro bean `OpenAPI`, desactivas el del SDK.
- `/v3/api-docs` y `/swagger-ui` exigen token. No van en `aybar.security.rutas-publicas`.

## Pruebas de contrato

Una prueba por operación del YAML, que comprueba que la spec publicada por el
servicio la cumple. El SDK no trae librería para esto. El camino sin dependencias
nuevas:

- Un `@SpringBootTest` + `MockMvc` en `boot/src/test` pide `/v3/api-docs` con un JWT de prueba y compara contra el YAML del paquete: cada ruta, método, código de respuesta y campo obligatorio debe existir. Para el JWT de prueba, `spring-security-test` en scope `test` y sin `<version>`: la gobierna Spring Boot. La plantilla no la trae; se añade al `boot/pom.xml`.
- Por cada criterio con código HTTP, un test que provoca ese código y valida el `ProblemDetail` (`codigo`, `status`).
- Datos sintéticos siempre.

Una librería de validación (por ejemplo, un validador de peticiones contra OpenAPI)
es de terceros: `<version>` explícita y decisión del ADR.

## Versionado y compatibilidad

- La versión mayor va en la ruta: `/api/v1/...`. `info.version` del YAML lleva la versión del contrato.
- Cambio compatible (campo opcional nuevo, operación nueva): misma `v1`, sube `info.version`.
- Ruptura (quitar o renombrar un campo, volver obligatorio uno opcional, cambiar un código o un tipo): `/api/v2` en convivencia con `v1` y fecha de retiro. Se declara en el ADR y en el envío de G3.
- La compatibilidad declarada es un criterio de G3: sin ella el contrato no está aprobado.

## Lado cliente

El mismo YAML lo consume el frontend de `frontend/` con `@aybarcorp/http`:
tipos, un servicio por recurso y qué hace la pantalla con cada código (skill
`aybar-contrato-api-cliente`). Lo que el servidor le debe al cliente:

- Los errores, siempre `application/problem+json` con `codigo` (no `code`), `correlationId`, `timestamp` y `campos` en validación: el front los lee por nombre. Un cuerpo de error a mano rompe la pantalla, no solo el contrato.
- El `X-Correlation-Id` de la petición, devuelto en la respuesta (lo hace `aybar-starter-logging`). El que manda el navegador cumple `^[A-Za-z0-9._-]{1,64}$` sin 8 o más dígitos seguidos.
- Los nombres de campo de `campos` son los del esquema del YAML: el front los usa para poner cada error en su `Field`.
- Front en otro origen: CORS con `aybar.security.cors.origenes-permitidos` (variable `AYBAR_CORS_ORIGENES`, orígenes exactos; vacía = apagado) y `X-Correlation-Id` entre las cabeceras expuestas (ya es el default). Contrato: `docs/skills/aybar-starter-security.md`; sesión del navegador: skill `aybar-auth-spa`.
- Un cambio de contrato que rompe al front (quitar, renombrar o volver obligatorio un campo) es una ruptura igual que para otro servicio: `/v2` en convivencia y su HU de front.
