> **COPIA SELLADA - NO SE EDITA AQUI.** Se edita el original y se regenera.
>
> Sellado: SDK 0.7.1 | origen aybar-starter-common/SKILL.md | generado 2026-10-15
>
> El original vive en `aybar-starter-common/SKILL.md`, dentro del repositorio del Aybar SDK.
> Lo que escribas en esta copia se pierde en la siguiente generacion y, peor, queda
> en desacuerdo con el SDK que de verdad usa el servicio. Si la version de arriba no
> coincide con el SDK que tienes instalado, NO te fies de este fichero:
> `./comprobar-entorno.sh` lo comprueba y te avisa.

---

---
name: aybar-starter-common
description: Rules for using `aybar-starter-common` (Aybar SDK utility starter): date/time, identifiers, text sanitizers, Money, Result, domain exceptions. Use when a domain class needs neutral utilities without depending on Spring, JPA or HTTP.
---

# aybar-starter-common

Pure-Java utilities for the Aybar SDK: dates, identifiers, text sanitizers,
Money, Result, domain exceptions. **No Spring, no JPA, no HTTP, no AWS** —
safe to import from `domain`, `application`, `adapters` or `boot`.

## Subpackages

| Package | Public API |
|---------|------------|
| `com.aybarsac.sdk.common.time` | `AybarDates`, `Timezone`, `Timezones` |
| `com.aybarsac.sdk.common.identifiers` | `CorrelationId` **(deprecated, do not use)**, `UlidGenerator`, `UuidV7Generator` |
| `com.aybarsac.sdk.common.text` | `TextSanitizer` |
| `com.aybarsac.sdk.common.money` | `Money` |
| `com.aybarsac.sdk.common.result` | `Result<T, E>` |
| `com.aybarsac.sdk.common.util` | `Optionals`, `Throwables` |

## Hard rules

- This starter is **pure Java**. Do not import Spring, JPA, Jakarta servlet,
  Jackson, AWS SDK, Kafka or anything framework-specific from
  `com.aybarsac.sdk.common.*`.
- `Result<T, E>` is for cases where the failure is part of the contract
  (validation, idempotency checks). Infrastructure failures (DB down, IO
  error) must still bubble up as exceptions.
- Domain exceptions are **not** defined here. Use the SDK's official
  mechanism: an enum in `domain` implementing
  `com.aybarsac.sdk.errores.CodigoNegocio` (form `AYB-<SVC>-<HTTP>`) thrown
  via `NegocioExcepciones.de(...)` (`aybar-starter-web`), so the message
  resolves through i18n keyed by code — never hardcoded in `domain`.
  **Planned, not implemented yet**: `CodigoNegocio`/`NegocioExcepciones` do
  not exist in `aybar-starter-web` as of this version (tracked in
  `docs/arquitectura-microservicio-hexagonal.md` §7 P5).
- `Money` always carries a `Currency`. Arithmetic between different
  currencies throws `IllegalArgumentException` — convert explicitly first.
- `CorrelationId` is **`@Deprecated(forRemoval = true)`**: no starter reads or
  writes through it, and its 32-hex format does not match what actually
  travels between microservices. The real correlation ID is
  `com.aybarsac.sdk.logging.CorrelacionIds` (`aybar-starter-logging`) — free
  text `^[A-Za-z0-9._-]{1,64}$` or a hyphenated `UUID`. Never use
  `CorrelationId` in new code.

## When it applies

- The `domain` layer needs to express dates, identifiers or money without
  importing Spring.
- You want a `Result<T, E>` instead of throwing for expected failures.

## When it does NOT apply

- Domain exceptions, `CodigoNegocio` catalog, HTTP status mapping, RFC 7807,
  i18n -> `aybar-starter-web`.
- MDC, log JSON, PII filters, real correlation ID propagation -> `aybar-starter-logging`.
- Anything that depends on the running Spring context -> `aybar-starter-config`.
- JPA entities, repositories, Flyway -> `aybar-starter-data`.

## Common junior questions

- "Can I import this from `domain`?" -> Yes, it is the only starter you can.
- "Can `Result` replace `Optional`?" -> No. Use `Optional` for absence, `Result`
  for an error that the caller must handle.
- "How do I throw a business error from `domain`?" -> Not with a class from
  this starter. Define a `CodigoNegocio` enum in `domain` and throw it via
  `NegocioExcepciones.de(...)` from `aybar-starter-web` — **once that
  mechanism is implemented there**; it does not exist yet.
