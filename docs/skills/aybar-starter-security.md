> **COPIA SELLADA - NO SE EDITA AQUI.** Se edita el original y se regenera.
>
> Sellado: SDK 0.7.1 | origen aybar-starter-security/SKILL.md | generado 2026-10-15
>
> El original vive en `aybar-starter-security/SKILL.md`, dentro del repositorio del Aybar SDK.
> Lo que escribas en esta copia se pierde en la siguiente generacion y, peor, queda
> en desacuerdo con el SDK que de verdad usa el servicio. Si la version de arriba no
> coincide con el SDK que tienes instalado, NO te fies de este fichero:
> `./comprobar-entorno.sh` lo comprueba y te avisa.

---

---
name: aybar-starter-security
description: Rules for using `aybar-starter-security` (Aybar SDK security starter): stateless OAuth2 resource server against the OIDC issuer the service configures, configurable claim names (aybar.security.claims.*, defaults are the corporate claims contract), global and active-company roles as ROLE_*, @PreAuthorize enabled by default, public routes, optional CORS for a browser frontend on another origin (aybar.security.cors.*), corporate user context with extra claims, and user MDC. Use when securing endpoints, reading companyId, company_roles or a custom claim from the JWT, integrating an issuer whose claim names differ from the defaults, opening a route without a token, letting a frontend call the service from another origin, or diagnosing a 401/403 or a CORS error.
---

# aybar-starter-security

Resource server corporativo del SDK Aybar. Convierte el JWT del emisor OIDC que
configure el servicio en una autenticación de Spring Security con los roles de
Aybar, deja el contexto corporativo disponible por petición y publica el usuario
en el MDC para que lo recojan los logs y la auditoría.

El SDK no supone un emisor. Los nombres de claim por defecto son el contrato de
claims corporativo, así que un servicio que no configure nada se comporta igual
que en 0.3.0; otro emisor
(Entra ID, Cognito, Auth0...) se integra con `aybar.security.claims.*`, sin
tocar el SDK (ADR-ET-0022 y `docs/decisions/ADR-005-sdk-neutral-de-nube-y-emisor.md`).

## Qué registra al arrancar

`META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`
registra una sola autoconfiguración: `AybarSecurityAutoConfiguration`.

Se activa cuando se cumplen las tres condiciones:

- `@ConditionalOnWebApplication(type = SERVLET)`.
- `@ConditionalOnClass({ SecurityFilterChain, JwtAuthenticationToken, OncePerRequestFilter })`.
- Se ordena `@AutoConfiguration(before = { SecurityAutoConfiguration, OAuth2ResourceServerAutoConfiguration })`,
  o sea **antes** que las de Spring Boot, para que su cadena sea la que gane.

Beans que aporta:

| Bean | Condición | Qué hace |
|---|---|---|
| `SeguridadPorMetodoConfiguration` | siempre | Lleva `@EnableMethodSecurity`: `@PreAuthorize` y `@Secured` funcionan sin anotar nada en la aplicación. |
| `ConversorRolesAybar` | `@ConditionalOnMissingBean` | Convierte el JWT en `JwtAuthenticationToken` con los authorities de Aybar, leyendo los claims de `aybar.security.claims.*`. La autenticación lleva el `AybarUserContext` ya calculado. |
| `SecurityFilterChain aybarSecurityFilterChain` | `aybar.security.cadena-por-defecto=true` (default); `@Order(LOWEST_PRECEDENCE)` | Cadena stateless de "todo lo demás": CSRF desactivado, `SessionCreationPolicy.STATELESS`, rutas públicas, resto autenticado, `FiltroMdcUsuario` añadido después de `BearerTokenAuthenticationFilter`. Convive con las cadenas parciales del servicio (`securityMatcher(...)`), que se evalúan antes. |
| `VerificacionAudienciaJwt` | siempre | Aborta el arranque si falta `spring.security.oauth2.resourceserver.jwt.audiences` fuera de los perfiles `local`/`test`. |
| `AybarUserContext` | `@RequestScope` + `@ConditionalOnMissingBean` | Contexto corporativo de la petición actual. |
| `UrlBasedCorsConfigurationSource corsConfigurationSource` | `aybar.security.cors.origenes-permitidos` no vacía + `@ConditionalOnMissingBean(name = "corsConfigurationSource")` | Configuración CORS del SDK. No cambia la cadena: Spring Security la aplica sola (ver [CORS](#cors-para-un-frontend-en-otro-origen)). |

Si la aplicación aporta un `AuthenticationEntryPoint` o un `AccessDeniedHandler`
propios —por ejemplo los de `aybar-starter-web`—, la cadena los usa en lugar de
los de Spring Security.

## Prefijo de propiedades

`aybar.security.*`.

| Propiedad | Tipo | Default | Descripción |
|---|---|---|---|
| `aybar.security.rutas-publicas` | `List<String>` | `[]` (lista vacía) | Patrones de ruta accesibles sin autenticación, **además de** `/actuator/health`, que la cadena abre siempre. |
| `aybar.security.cadena-por-defecto` | `boolean` | `true` | Registra la cadena del SDK como la de "cualquier otra petición". `false` solo si el servicio declara una cadena que lo atiende todo (pierde conversor de roles, MDC de usuario y rutas públicas del SDK). |
| `aybar.security.claims.usuario` | `String` | `user_account_id` | Claim del identificador de la cuenta → `userAccountId`. |
| `aybar.security.claims.nombre-usuario` | `String` | `preferred_username` | Claim del nombre de usuario → `username`; también es el nombre de la autenticación (si falta, `sub`). |
| `aybar.security.claims.empresa` | `String` | `companyId` | Claim de la empresa activa → `companyId`. |
| `aybar.security.claims.roles` | `String` | `realm_access.roles` | Claim (o ruta con puntos) de los roles globales → `roles`. Debe ser una lista JSON. |
| `aybar.security.claims.roles-por-empresa` | `String` | `company_roles` | Claim del mapa empresa → roles → `rolesPorEmpresa`. Objeto JSON o String JSON. |
| `aybar.security.claims.sesion` | `String` | `sid` | Claim del identificador de sesión → `sid`. |
| `aybar.security.claims.adicionales` | `List<String>` | `[]` | Claims propios del servicio que se copian a `atributos()` / `claim(nombre)`. No van al MDC. |
| `aybar.security.cors.origenes-permitidos` | `List<String>` | `[]` (CORS apagado) | Orígenes exactos `esquema://host[:puerto]` que pueden llamar desde un navegador. Sin comodines ni `null`. |
| `aybar.security.cors.metodos` | `List<String>` | `GET,POST,PUT,PATCH,DELETE,OPTIONS` | Métodos permitidos desde otro origen. |
| `aybar.security.cors.cabeceras-permitidas` | `List<String>` | `Authorization,Content-Type,X-Correlation-Id,Accept-Language` | Cabeceras que el navegador puede enviar. |
| `aybar.security.cors.cabeceras-expuestas` | `List<String>` | `X-Correlation-Id` | Cabeceras de la respuesta que el código del navegador puede leer. |
| `aybar.security.cors.max-age` | `Duration` | `3600` (segundos si no lleva unidad) | Cuánto cachea el navegador el preflight. |

Fuente: `AybarSecurityProperties` (los nombres los valida `MapeoClaims`). Un
nombre vacío **aborta el arranque** nombrando la propiedad.

**Cómo se resuelve un nombre** (`AybarUserContext.valor`). Sin puntos, es el
claim de ese nombre. Con puntos, es **siempre** una ruta de objetos anidados
(`realm_access.roles` es el campo `roles` del objeto `realm_access`); si falta
un tramo, el valor es `null` y nunca se cae al nombre literal, así que un claim
de primer nivel llamado `realm_access.roles` no puede aportar roles. Solo un
nombre con forma de URI (contiene `/` o `:`, como `https://aybar.example/roles`,
típico de Auth0) se lee como claim literal. Un claim ausente da `null` o
colección vacía; una ruta que atraviesa algo que no es un objeto JSON es un
token malformado (401). Un frontend que lea los mismos claims (por ejemplo para
pintar el menú según roles) debe aplicar esta misma regla y estos mismos
nombres por defecto; la autorización la decide siempre el backend.

El emisor del token **no** es una propiedad de este starter: se configura con la
property estándar de Spring Boot
`spring.security.oauth2.resourceserver.jwt.issuer-uri`. La audiencia tampoco,
pero es **obligatoria**: `spring.security.oauth2.resourceserver.jwt.audiences`
(variable sugerida `AYBAR_JWT_AUDIENCE`); fuera de los perfiles `local` y `test`
el bean `VerificacionAudienciaJwt` aborta el arranque si falta o está en blanco.

## Instalación

Sin `<version>`: la gobierna `aybar-bom`.

```xml
<dependency>
  <groupId>com.aybarsac.sdk</groupId>
  <artifactId>aybar-starter-security</artifactId>
</dependency>
```

Este starter ya arrastra `spring-boot-starter-security` y
`spring-boot-starter-oauth2-resource-server`. El consumidor **no** tiene que
añadirlos.

## Dependencias opcionales que activa el consumidor

| Artefacto | Qué activa |
|---|---|
| `aybar-starter-web` | Sus `PuntoEntradaAutenticacionAybar` y `ManejadorAccesoDenegadoAybar` sustituyen a los de Spring Security, y los 401/403 pasan a responder el ProblemDetail RFC 7807 con `AYB-SEG-401` / `AYB-SEG-403`. Sin él, el 401 y el 403 salen con el cuerpo por defecto de Spring Security. |
| `aybar-starter-logging` | El `correlationId` que acompaña al `usuario` y al `companyId` que este starter publica en el MDC. |

## Contrato del token

`ConversorRolesAybar` construye los authorities como la **unión** de:

1. Los roles globales (claim `aybar.security.claims.roles`, por defecto `realm_access.roles`).
2. Los roles de la **empresa activa**: `rolesPorEmpresa[companyId]` (por defecto `company_roles[companyId]`).

Todos con prefijo `ROLE_`, **nunca** `SCOPE_`. Los roles de otras empresas del
holding **no** se convierten en authorities: `@PreAuthorize` ve el tenant activo,
no el holding entero. Como nombre de la autenticación se usa el nombre de
usuario (por defecto `preferred_username`) cuando está presente, y `sub` si no.

`AybarUserContext` es un `record` con estos componentes, leídos del JWT:

| Componente | Propiedad que elige el claim | Claim por defecto |
|---|---|---|
| `userAccountId` | `claims.usuario` | `user_account_id` |
| `username` | `claims.nombre-usuario` | `preferred_username` |
| `companyId` | `claims.empresa` | `companyId` |
| `roles` | `claims.roles` | `realm_access.roles` |
| `rolesPorEmpresa` | `claims.roles-por-empresa` | `company_roles` |
| `sid` | `claims.sesion` | `sid` |
| `atributos` | `claims.adicionales` | (ninguno) |

Acceso: `AybarUserContextHolder.actual()` devuelve un `Optional`, o se inyecta el
bean `AybarUserContext` (request-scoped). `rolesDe(companyId)` devuelve los roles
en una empresa concreta. `claim("acr")` devuelve un `Optional<Object>` con un
claim declarado en `adicionales` (texto, número, booleano, lista u objeto, estos
dos inmutables).

Compatibilidad con 0.3.0: el constructor de seis argumentos y
`AybarUserContext.desdeJwt(jwt)` siguen existiendo y usan los nombres por
defecto; `desdeJwt(jwt, mapeo)` acepta otro `MapeoClaims`. Al serializar el
record a JSON aparece un campo nuevo, `atributos` (`{}` si no se declaran
adicionales).

### Ejemplos de configuración (opciones, no regla)

El emisor se elige con la property estándar de Spring Boot; los nombres, con
`aybar.security.claims.*`. Ejemplos de forma de token, a validar antes de
adoptarlos con un usuario sintético del emisor de Desarrollo, decodificando el
token en local (un bearer token es una credencial: nunca uno de Producción ni
pegado en un prompt):

```yaml
# Emisor que emite el contrato de claims corporativo: no hace falta nada,
# son los valores por defecto.
spring.security.oauth2.resourceserver.jwt.issuer-uri: ${AYBAR_ISSUER_URI}
spring.security.oauth2.resourceserver.jwt.audiences: ${AYBAR_JWT_AUDIENCE}   # OBLIGATORIO fuera de local/test

# Otro emisor OIDC con claims planos (p. ej. Entra ID con app roles)
spring.security.oauth2.resourceserver.jwt.audiences: ${AYBAR_JWT_AUDIENCE}   # OBLIGATORIO, también en local
aybar:
  security:
    claims:
      usuario: oid
      nombre-usuario: preferred_username
      empresa: extension_companyId      # el nombre que publique el emisor
      roles: roles
      roles-por-empresa: company_roles
      sesion: sid
      adicionales: [acr, amr]           # nivel de autenticación, métodos usados
```

`FiltroMdcUsuario` publica en el MDC `usuario`, `companyId`, `userAccountId` y
`sid`, y los limpia al terminar la petición. Esas cuatro claves son las que leen
`aybar-starter-logging` y `aybar-starter-audit`.

## CORS para un frontend en otro origen

Apagado por defecto: sin `aybar.security.cors.origenes-permitidos` el
navegador bloquea cualquier llamada desde otro origen, como hasta ahora. Para
un frontend local (Vite en `:5173`, Angular en `:4200`) o desplegado en otro
dominio:

```yaml
aybar:
  security:
    cors:
      origenes-permitidos: ${AYBAR_CORS_ORIGENES:}   # vacío = CORS apagado
      # metodos, cabeceras-permitidas, cabeceras-expuestas y max-age: los defaults sirven
```

```bash
AYBAR_CORS_ORIGENES=http://localhost:5173,http://localhost:4200
```

Qué hace y qué no:

- **No cambia la cadena del SDK.** Publica un bean `corsConfigurationSource` de
  tipo declarado `UrlBasedCorsConfigurationSource`. Spring Security 6.5
  (`HttpSecurityConfiguration#applyCorsIfAvailable`) llama a `http.cors()` en
  todo `HttpSecurity` cuando existe un bean de ese tipo, y `CorsConfigurer` lo
  busca por ese nombre. Si el tipo de retorno fuera la interfaz
  `CorsConfigurationSource`, el CORS podría no aplicarse según el orden de
  creación de beans.
- **El preflight (`OPTIONS`) va sin token** y lo responde el `CorsFilter` antes
  de autenticar: 200 con `Access-Control-Allow-Origin` si el origen, el método y
  las cabeceras están permitidos; **403 sin `Access-Control-Allow-Origin`** si
  no. Una llamada real desde un origen no permitido también es 403.
- **Los 401 y 403 llevan las cabeceras CORS**, así el front puede leer el cuerpo
  `AYB-SEG-401` y saber que debe volver a autenticar.
- **`X-Correlation-Id` se expone** (`Access-Control-Expose-Headers`): el front
  puede leerlo de la respuesta y mostrarlo al reportar un error.
- **Nunca `Access-Control-Allow-Credentials`.** El token va en la cabecera
  `Authorization`, no en cookies; no hay credenciales ambientales que enviar.
- **Arranque abortado** (mensaje con la propiedad) ante un origen con `*`,
  `null`, sin esquema `http`/`https`, o con ruta, consulta o fragmento; o con
  `metodos` o `cabeceras-permitidas` vacías. Un comodín abriría la API a
  cualquier sitio y, con credenciales, sería inseguro.
- **Un bean `corsConfigurationSource` propio del servicio gana** al del SDK.
  Tocar CORS en `WebMvcConfigurer#addCorsMappings` no sirve: la cadena de
  seguridad corta el preflight antes.

## Errores y situaciones de fallo

- **Sin `issuer-uri` configurado** no hay `JwtDecoder` y el contexto de Spring no
  arranca. La property es `spring.security.oauth2.resourceserver.jwt.issuer-uri`.
- **Sin audiencia fuera de `local`/`test`** el arranque aborta con "Falta la
  audiencia del JWT" nombrando `spring.security.oauth2.resourceserver.jwt.audiences`
  y `AYBAR_JWT_AUDIENCE`. Un mismo emisor firma tokens para muchas aplicaciones:
  sin `aud`, el de cualquiera de ellas valdría aquí. Con un `JwtDecoder` propio
  Boot ignora la propiedad: ese decoder tiene que validar `aud`.
- **Claims corporativos malformados** (por ejemplo `company_roles` que no es JSON
  válido, roles que no son una lista, o una ruta con puntos que atraviesa algo
  que no es un objeto) se rechazan como `InvalidBearerTokenException`, o sea
  **401 token inválido**, nunca como 500. Es deliberado: un token mal formado es
  un problema del emisor, no un error interno del servicio.
- **Un nombre de claim vacío** en `aybar.security.claims.*` aborta el arranque
  con un mensaje que nombra la propiedad.
- **`/actuator/health` está abierto; sus subrutas NO.**
  `/actuator/health/liveness` y `/actuator/health/readiness` exigen token salvo
  que se declaren en `aybar.security.rutas-publicas`. Un servicio desplegado sin
  esa línea recibe 401 en las sondas y el orquestador lo reinicia en bucle sin
  que ningún log lo explique.
- **Inyectar `AybarUserContext` fuera de una petición autenticada** lanza
  `IllegalStateException` con el mensaje "No hay un usuario autenticado con JWT
  en la peticion actual". Para código que puede ejecutarse sin usuario —un
  consumidor de Kafka, una tarea programada— usa
  `AybarUserContextHolder.actual()` y trata el `Optional` vacío.
- **Un `SecurityFilterChain` propio con `securityMatcher(...)` convive con el del
  SDK**: la del servicio atiende sus rutas y la del SDK (orden más bajo) todo lo
  demás, con token. Hasta 0.5.1 la del SDK desaparecía con cualquier cadena del
  servicio, y una cadena parcial dejaba el resto **sin autenticación**.
- **Una cadena propia que lo atiende todo** (sin `securityMatcher`) aborta el
  arranque nombrándola, salvo `aybar.security.cadena-por-defecto=false`. Con la
  del SDK apagada se pierden las rutas públicas, el `ConversorRolesAybar` y el
  `FiltroMdcUsuario` salvo que los reconstruyas a mano.

## Trampas de los claims configurables

- **Otro emisor sin audiencia no arranca.** Si `usuario`, `nombre-usuario`,
  `empresa`, `roles`, `roles-por-empresa` o `sesion` no son los por defecto, el
  arranque exige `spring.security.oauth2.resourceserver.jwt.audiences`. En Entra
  ID, Cognito o Auth0 un mismo `iss` emite tokens para todas las aplicaciones
  del tenant: sin validar `aud`, el app role "Admin" de otra aplicación llegaría
  aquí como `ROLE_Admin`. Solo `adicionales` no la exige.
- **`usuario` tiene que ser un claim inmutable** (`sub` u `oid`), nunca
  `preferred_username`, `email` ni `upn`, que el usuario o el tenant pueden
  cambiar. Si `usuario` no viene en el token, `userAccountId` queda en `null`
  sin aviso y la auditoría pierde al actor.
- **Los nombres con puntos son siempre rutas anidadas.** Solo un nombre con forma
  de URI (con `/` o `:`, como `https://aybar.example/roles`) se lee como claim
  literal. Así un claim de primer nivel llamado `realm_access.roles` no aporta
  roles, igual que en 0.3.0. Un emisor que publique un claim de primer nivel
  con puntos y sin `/` ni `:` no se puede leer: renómbralo en el emisor.
- **Un nombre mal escrito no falla: da un contexto vacío.** Un claim ausente
  es legal (no todos los emisores emiten empresa o sesión), así que
  `empresa: companyID` en vez de `companyId` deja `companyId` en `null` y los
  roles de empresa sin aplicar, sin error. Verifica el mapeo con un usuario
  sintético del emisor de Desarrollo, decodificando su token en local.
- **Roles como texto → 401.** Algunos emisores mandan un rol único como string
  y varios como lista. El SDK exige lista, igual que en 0.3.0.
- **`claim(nombre)` solo ve lo declarado en `adicionales`.** Un claim que viene
  en el token pero no se declaró da `Optional.empty()`: lo que el servicio lee
  del token queda escrito en su configuración.
- **El holder estático y los tests con `jwt()`.** `AybarUserContextHolder.actual()`
  respeta `aybar.security.claims.*` cuando la autenticación la produjo
  `ConversorRolesAybar` (el camino real). Con `jwt()` de spring-security-test
  la autenticación no pasa por el conversor y el holder usa los nombres por
  defecto. Para probar nombres propios: inyecta el bean `AybarUserContext`
  (que sí ve la configuración) o autentica con
  `authentication(conversorRolesAybar.convert(jwt))`.
- **Las claves del MDC no cambian.** `usuario`, `companyId`, `userAccountId` y
  `sid` son el contrato con logging y auditoría; lo configurable es de qué
  claim sale cada valor. Los `adicionales` no se publican en el MDC.
- **No remapees claims en el servicio.** ADR-ET-0022: el mapeo vive en
  `aybar.security.claims.*`, no en un conversor propio por servicio.

## Qué NO hacer

- **No** declares tu propio `SecurityFilterChain` para abrir una ruta. Usa
  `aybar.security.rutas-publicas`.
- **No** uses `hasAuthority('SCOPE_x')`. Los authorities del SDK son `ROLE_*`;
  se comprueban con `hasRole('Gerencia')`.
- **No** hagas `hasRole` contra un rol de otra empresa del holding: solo los de
  la empresa activa son authorities. Para el resto, consulta
  `contexto.rolesDe(otraEmpresa)` explícitamente.
- **No** abras `/v3/api-docs` ni `/swagger-ui` en `rutas-publicas`. La spec
  OpenAPI del portal exige JWT; Swagger UI tiene su botón *Authorize*.
- **No** abras rutas en `rutas-publicas` para que funcione el preflight CORS: el
  preflight ya va sin token. Configura `aybar.security.cors.origenes-permitidos`.
- **No** pongas `*` en `aybar.security.cors.origenes-permitidos`: el arranque
  falla a propósito. Declara cada origen.
- **No** leas los claims del JWT a mano con `jwt.getClaim("companyId")` en cada
  controlador. Usa `AybarUserContext`, que ya valida y normaliza; para un claim
  propio, decláralo en `aybar.security.claims.adicionales` y léelo con
  `contexto.claim(nombre)`.
- **No** dupliques `@EnableMethodSecurity` esperando cambiar su configuración:
  el starter ya lo aporta y duplicarlo es inocuo pero inútil.
- **No** pongas `aybar-starter-security` en un servicio que no exponga HTTP: la
  autoconfiguración es `@ConditionalOnWebApplication(SERVLET)` y no hará nada.

## Qué NO cubre este starter

- Cuerpo uniforme de los 401/403 y RFC 7807 -> `aybar-starter-web`.
- `correlationId` y logs JSON -> `aybar-starter-logging`.
- Propagación del Bearer en llamadas salientes -> `aybar-starter-client`, que
  **ya no depende de este starter**: declara `spring-security-core` y
  `spring-security-oauth2-jose` por su cuenta.
- Eventos de auditoría -> `aybar-starter-audit`.
- Emisión de tokens, usuarios y sesiones: eso es el emisor OIDC que fije el ADR
  del servicio, no el SDK.
