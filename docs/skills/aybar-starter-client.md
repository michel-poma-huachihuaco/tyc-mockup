> **COPIA SELLADA - NO SE EDITA AQUI.** Se edita el original y se regenera.
>
> Sellado: SDK 0.7.1 | origen aybar-starter-client/SKILL.md | generado 2026-10-15
>
> El original vive en `aybar-starter-client/SKILL.md`, dentro del repositorio del Aybar SDK.
> Lo que escribas en esta copia se pierde en la siguiente generacion y, peor, queda
> en desacuerdo con el SDK que de verdad usa el servicio. Si la version de arriba no
> coincide con el SDK que tienes instalado, NO te fies de este fichero:
> `./comprobar-entorno.sh` lo comprueba y te avisa.

---

---
name: aybar-starter-client
description: Rules for using `aybar-starter-client` (Aybar SDK corporate HTTP client): RestClient with corporate timeouts, automatic Bearer propagation, client-credentials fallback against the OIDC issuer's token endpoint, `X-Correlation-Id` propagation and an allow-list of destination hosts. Use when a service calls another service or a third-party HTTP API, or when configuring `aybar.client.*`.
---

# aybar-starter-client

Corporate HTTP client of the Aybar SDK. Hands out `RestClient` instances that
already carry the SDK timeouts and two interceptors: outgoing `Authorization:
Bearer` and outgoing `X-Correlation-Id`.

The problem it solves: without it, every service reimplements token propagation
and correlation by hand on each call site, and every call site forgets a
different piece.

## What it registers at startup

Autoconfiguration `com.aybarsac.sdk.client.AybarClientAutoConfiguration`,
declared in
`META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`.

| Bean | Condition | What it is |
|---|---|---|
| `ClientesAybar` | `@ConditionalOnMissingBean` — always, unless the service defines its own | Entry point that builds the preconfigured `RestClient`s |
| `ProveedorTokenClientCredentials` | `@ConditionalOnMissingBean` **and** `aybar.client.client-id` has text (empty or blank counts as absent) | OAuth2 `client_credentials` token provider with cache |

**This starter has no `enabled` property.** Adding the dependency registers
`ClientesAybar`. To not use it, do not add the dependency.

## Property namespace

`aybar.client.*`, bound by `AybarClientProperties`.

| Property | Type | Default | Description |
|---|---|---|---|
| `connect-timeout` | `Duration` | `2s` | Connect timeout of every SDK client. |
| `read-timeout` | `Duration` | `10s` | Read timeout of every SDK client. |
| `token-uri` | `String` | `null` | OAuth2 token endpoint of the OIDC issuer set by the service's ADR, for the `client_credentials` grant. |
| `client-id` | `String` | `null` | Service client id. **Its presence is what activates the client-credentials fallback.** |
| `client-secret` | `String` | `null` | Service client secret. Sent only when non-blank. |
| `hosts-con-token` | `List<String>` | `[]` (empty) | Destination hosts allowed to receive the Bearer. **Empty means no destination** (fail-closed), plus a WARN at startup. `*` means every destination (also a WARN). |

There are no other properties. Anything else under `aybar.client.*` is not read
by this starter.

## Installation

```xml
<dependency>
  <groupId>com.aybarsac.sdk</groupId>
  <artifactId>aybar-starter-client</artifactId>
</dependency>
```

**No `<version>`.** `aybar-bom` governs it. Declaring a version here is a
violation of the SDK version standard.

### Optional dependencies the consumer must add

**None.** This starter is self-contained: it brings `spring-web`,
`jackson-databind`, `spring-security-core` and `spring-security-oauth2-jose`,
and it depends on `aybar-starter-logging` for `CorrelacionIds`.

**`aybar-starter-client` does NOT depend on `aybar-starter-security`.** It
declares `spring-security-core` and `spring-security-oauth2-jose` directly,
because `InterceptorBearer` only needs three types: `Authentication`,
`SecurityContextHolder` and `Jwt`. Any document that says this starter pulls in
`aybar-starter-security` is out of date. Consequence: adding this starter does
**not** turn your service into an OAuth2 resource server. If you need to
validate incoming JWTs, declare `aybar-starter-security` separately.

## How to use it

`ClientesAybar` exposes exactly three methods:

| Method | Returns | When |
|---|---|---|
| `para(String baseUrl)` | `RestClient` ready to use | Normal case |
| `base()` | `RestClient.Builder` | When you need to add your own headers, message converters or error handlers |
| `comoServicio()` | `ClientesAybar` | When the call must use the service's own identity (client-credentials), e.g. from a public route |

```java
@Service
public class ConsultaRiesgo {

    private final RestClient riesgo;

    public ConsultaRiesgo(ClientesAybar clientes) {
        this.riesgo = clientes.para("https://riesgo.aybarsac.com");
    }

    public Puntaje consultar(long partyId) {
        return riesgo.get()
                .uri("/puntajes/{id}", partyId)
                .retrieve()
                .body(Puntaje.class);
    }
}
```

Each call to `base()` returns a **new and independent** builder. Configuring one
does not affect the others.

The starting point is a `clone()` of Spring Boot's `RestClient.Builder` bean
when there is exactly one in the context (observability / `traceparent`, Boot's
`ObjectMapper` and message converters, every `RestClientCustomizer`), and
`RestClient.builder()` otherwise. The SDK then sets its own request factory
(corporate timeouts) and adds its interceptors. `ProveedorTokenClientCredentials`
uses the same starting point for the token request.

## Bearer propagation (`InterceptorBearer`)

The order of decisions, exactly as implemented:

1. If the request already carries an `Authorization` header, **it is never
   overwritten**. The interceptor does nothing.
2. If the destination host is not allowed by `hosts-con-token`, no token is
   attached.
3. If the client came from `comoServicio()`, the service's client-credentials
   token is used (no token if `ProveedorTokenClientCredentials` does not exist).
4. If `SecurityContextHolder` holds an `Authentication` whose principal is a
   `Jwt`, **the user's own token is propagated** (`jwt.getTokenValue()`).
5. If there is **no HTTP request in progress** (`RequestContextHolder` empty:
   batch, scheduler, message consumer) and `ProveedorTokenClientCredentials`
   exists, the service's client-credentials token is used.
6. Otherwise — an HTTP request without a user JWT, e.g. an anonymous caller on
   a public route — the request goes out with **no** `Authorization`. Falling
   back to the service's token there would lend the service's permissions to
   any anonymous caller (confused deputy). Use `comoServicio()` when that is
   really what you want.

Note: `@Async` threads do not inherit `RequestContextHolder` by default, so
they count as "no HTTP request" and use the service token.

### Host allow-list

| Entry in `hosts-con-token` | Matches |
|---|---|
| *(empty list)* | **No destination** (fail-closed), plus a WARN at startup |
| `*` | **Every destination**, third parties included, plus a WARN at startup |
| `riesgo.aybarsac.com` | That exact host **and its subdomains** (`api.riesgo.aybarsac.com`) |
| `.aybarsac.com` | Any host ending in that suffix |

Entries are trimmed, lowercased and blank ones are dropped. If the URI has no
host, the token is **not** attached (unless the list contains `*`). Every
rejected host is logged at DEBUG (`InterceptorBearer`).

## Correlation propagation (`InterceptorCorrelacion`)

- Header `X-Correlation-Id`.
- Value taken from the MDC key `correlationId`, which `aybar-starter-logging`
  populates.
- If the MDC value is missing or blank, **a random UUID is generated**
  (`CorrelacionIds.generar()`).
- The MDC value is only propagated if the destination would accept it
  (`CorrelacionIds.esAceptable`: a canonical UUID, or `^[A-Za-z0-9._-]{1,64}$`
  without 8+ consecutive digits). Anything else (for instance a value copied
  unvalidated from a message header) is replaced by a generated UUID, so it
  never leaves the service. UUIDs generated by the SDK always pass, so the
  correlation between SDK services is never cut.
- A header already set by the caller is **never overwritten**.

## Timeouts

`FabricaClienteHttp` builds a JDK `HttpClient` with `connect-timeout` and wraps
it in a `JdkClientHttpRequestFactory` with `read-timeout`. Both come from
`aybar.client.*`. There is no retry and no circuit breaker in this starter.

## Client-credentials token (`ProveedorTokenClientCredentials`)

Activated only when `aybar.client.client-id` is set.

- Sends `POST` to `aybar.client.token-uri` as
  `application/x-www-form-urlencoded` with `grant_type=client_credentials`,
  `client_id` and, **only when non-blank**, `client_secret`.
- Caches the token thread-safely (double-checked locking).
- Renewal margin: **30 seconds**, capped at half of `expires_in` for short-lived
  tokens, with a guaranteed minimum validity of **1 second** so the computed
  expiry is never in the past.
- If the response has no `expires_in`, it assumes **5 minutes**.

## Errors and failure situations

| Situation | Behaviour |
|---|---|
| `client-id` set but `token-uri` missing | `IllegalArgumentException` **at startup**: `"aybar.client.token-uri es obligatorio para client-credentials"`. The context does not start. |
| `client-id` missing, empty or blank | The bean is not created. Calls go out with the user's token, or with none. **No error.** |
| HTTP request without a user JWT (public route) | The call goes out **without `Authorization`**, even if client-credentials is configured. Use `comoServicio()` to call as the service. |
| Token endpoint responds without `access_token` | `IllegalStateException`: `"La respuesta del endpoint de token no contiene access_token"`. |
| Token endpoint returns 4xx/5xx | The `RestClient` default applies: the exception propagates to the caller. This starter adds no retry. |
| `hosts-con-token` empty | Starts fine, logs a **WARN** saying the Bearer will NOT be attached to any call. Destinations answer 401. |
| `hosts-con-token` contains `*` | Starts fine, logs a **WARN** saying the Bearer will be attached to ALL destination hosts. |
| Destination host not in the list | The call goes out **without `Authorization`**. Expect a 401 from the destination, not a local error. |
| Connect or read timeout exceeded | The `HttpClient` exception propagates. There is no retry. |

There is no `FailureAnalyzer` in this starter.

## What NOT to do

- **Do not build `RestClient.builder()` or `new RestTemplate()` by hand** for
  calls to other Aybar services. You lose the Bearer, you lose the correlation
  and you lose the corporate timeouts. Use `ClientesAybar`.
- **Do not set the `Authorization` header manually** on a client obtained from
  `ClientesAybar`. The interceptor does not overwrite it, so you silently
  disable the propagation you were trying to use.
- **Do not use `hosts-con-token: '*'` outside local development.** It sends
  the user's token to every destination, third parties included. That is
  credential leakage. An empty list is safe but sends no token at all.
- **Do not write `client-secret` in `application.yml`.** Use an environment
  variable or Secrets Manager (`aybar-starter-config`). The
  `SinPasswordEnYamlTests` guard breaks the build if you do.
- **Do not add `aybar-starter-security` just to make this starter work.** It is
  not needed, and it would turn your service into a resource server that
  demands a valid JWT on every inbound endpoint.
- **Do not reuse the `RestClient` of one destination for another** by
  overriding the URI. Call `para(...)` once per destination.
- **Do not depend on the token cache expiring at a specific instant.** The
  margin is computed from `expires_in`; treat it as an implementation detail.

## What this starter does NOT touch

- Validating **incoming** JWTs and `AybarUserContext` -> `aybar-starter-security`.
- Populating the MDC on inbound requests -> `aybar-starter-logging`.
- Retries and circuit breakers -> not in this starter.
- RFC 7807 error responses -> `aybar-starter-web`.
- Kafka -> `aybar-starter-messaging`.
- Versions / BOM -> `aybar-bom`.
