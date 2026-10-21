> **COPIA SELLADA - NO SE EDITA AQUI.** Se edita el original y se regenera.
>
> Sellado: SDK 0.7.1 | origen aybar-starter-config/SKILL.md | generado 2026-10-15
>
> El original vive en `aybar-starter-config/SKILL.md`, dentro del repositorio del Aybar SDK.
> Lo que escribas en esta copia se pierde en la siguiente generacion y, peor, queda
> en desacuerdo con el SDK que de verdad usa el servicio. Si la version de arriba no
> coincide con el SDK que tienes instalado, NO te fies de este fichero:
> `./comprobar-entorno.sh` lo comprueba y te avisa.

---

---
name: aybar-starter-config
description: Rules for using `aybar-starter-config` (cross-cutting Aybar SDK starter): profiles, secrets from the provider the service chooses (AWS Secrets Manager, Azure Key Vault or environment variables), AYBAR_* mapping, environment detection, neutral CQRS ports, optional actuator. Use when configuring application.yml, secrets, aybar.secretos.proveedor, profiles, ECS Fargate or Azure, liveness/readiness or importing a library that already has the SDK.
---

# aybar-starter-config

Cross-cutting starter of the Aybar SDK. Applies reusable autoconfiguration for
any portal microservice **without coupling to JPA, Mongo, Postgres or a cloud
provider as mandatory dependencies**.

The SDK is the neutral base: it gives the *how* (load a secret, explode it into
properties, abort when it cannot be read, never log it). *Where* the secrets
live (AWS, Azure, the platform's environment) is a decision of each service,
written in its own ADR and selected with `aybar.secretos.proveedor`. The
corporate strategy remains the suggested default, not an imposition
(`docs/decisions/ADR-005-sdk-neutral-de-nube-y-emisor.md`).

## Property namespace

This starter's properties live under `aybar.config.*` — the short-prefix
convention every starter with properties uses (`aybar.security.*`,
`aybar.web.*`, `aybar.client.*`, `aybar.logging.*`, `aybar.audit.*`,
`aybar.messaging.*`, `aybar.data.*`), separate from Spring (`spring.*`),
Spring Boot (`management.*`) and AWS (`AWS_*`). There is **no single
SDK-wide namespace**: each starter governs its own prefix independently.
This starter governs `aybar.config.*` and, since 0.4.0, also
`aybar.secretos.*`: the provider-neutral secret selection.

| Layer | Prefix | Example |
|---|---|---|
| Cross-cutting (this starter) | `aybar.config.*` | `aybar.config.secrets-manager.enabled` |
| Data (other starter, own convention) | `aybar.data.*` | `aybar.data.postgres.uri` |
| CQRS (ports) | `com.aybarsac.sdk.data.cqrs.*` | Java import, no property |
| Common utilities | `com.aybarsac.sdk.common.*` | Java import, no property |
| Secrets: provider choice | `aybar.secretos.*` | `aybar.secretos.proveedor` |
| Secrets: AWS adapter (0.3.0, unchanged) | `aybar.config.secrets-manager.*` | sub-category |
| Runtime | `aybar.config.runtime.*` | sub-category |
| Actuator | `aybar.config.actuator.*` | sub-category |

## Hard rules

- **Never** import `com.aybarsac.sdk.config.*` for data concerns. That lives in
  `aybar-starter-data` under `aybar.data.*`.
- **Never** declare `spring.datasource.*` or `spring.data.mongodb.*` by hand in
  `application.yml`. Use `aybar.data.postgres.*` and
  `aybar.data.mongo.*`.
- **Zero** `password:` / `secret:` / `credentials:` / `token:` / `api.key:` in
  YAML (enforced by `SinPasswordEnYamlTests` in every module).
- **Never** hardcode URLs or hosts. Use `AYBAR_DATASOURCE_URI` (single JDBC
  URI with optional embedded credentials).
- **CQRS ports** (`AybarWriteRepository`, `AybarReadRepository`) live in
  `com.aybarsac.sdk.data.cqrs` (starter-data). The `domain` may import them
  without breaking ArchUnit.
- **Date / timezone utilities** live in `com.aybarsac.sdk.common.time`
  (starter-common).

## When it applies

- Creating or editing the service's `application.yml`.
- Configuring profile (`local`, `dev`, `prod`).
- Enabling/disabling external configuration import.
- Loading secrets from the provider the service chose: AWS Secrets Manager,
  Azure Key Vault or environment variables injected by the platform.
- Mapping `AYBAR_DATASOURCE_URI` to `spring.datasource.url`.
- Detecting whether the service runs in ECS Fargate.
- Deciding between H2 fallback and a real DataSource.
- Configuring graceful shutdown, JVM container-aware runtime.
- Configuring Actuator (liveness/readiness).
- Globally disabling the starter via `aybar.config.enabled=false`.

## When it does NOT apply

- Configuring a new DataSource or tuning Hikari -> `aybar-starter-data`.
- Configuring MongoClient / MongoTemplate -> `aybar-starter-data`.
- PII fail-closed auditing -> `aybar-starter-audit`.
- HTTP client / RestClient -> `aybar-starter-client`.
- Kafka, topic naming, headers -> `aybar-starter-messaging`.
- RFC 7807 / i18n -> `aybar-starter-web`.

## Starter conventions

### Properties (`aybar.config.*`)

| Property | Type | Default | Description |
|---|---|---|---|
| ~~`default-profiles`~~ | `List<String>` | `[]` | **Retired, not applied** (deprecated, `WARN` if set). The SDK never activates a profile: without `SPRING_PROFILES_ACTIVE` the service is a real environment. A default profile, if wanted, is Spring Boot's `spring.profiles.default`: it loads that profile's files but, not being *active*, does not relax the SDK checks (only an active `local` does). |
| ~~`external-config-import`~~ | `boolean` | `false` | **Retired, never had an effect** (deprecated, `WARN` if set). Use `spring.config.import`. |
| ~~`import-location`~~ | `String` | `null` | **Retired, never had an effect** (deprecated, `WARN` if set). Use `spring.config.import`. |
| `gitignore-file` | `String` | `application-local.yml` | Metadata only; physical file in `plantillas/`. |
| `secrets-manager.enabled` | `boolean` | `false` | Enables loading from AWS Secrets Manager (provider `aws`, the default). |
| `secrets-manager.name` | `String` | `null` | Name (ARN). **Required** if enabled=true. |
| `secrets-manager.region` | `String` | `null` | AWS region (optional; falls back to `AWS_REGION`). |
| `environment.mode` | `String` | `auto` | Override the detector: `local`, `ecs`, `test`. |
| `actuator.enabled` | `boolean` | `true` | Enables liveness/readiness when Actuator is present. |
| `actuator.liveness-path` | `String` | `/actuator/health/liveness` | Liveness probe path. |
| `actuator.readiness-path` | `String` | `/actuator/health/readiness` | Readiness probe path. |
| `actuator.period-ms` | `long` | `10000` | Probe refresh period (validated `@Min(1000)`). |
| `actuator.groups-exposed` | `boolean` | `true` | Whether to expose the liveness/readiness groups. |
| `runtime.timeout-shutdown-ms` | `long` | `30000` | `spring.lifecycle.timeout-per-shutdown-phase`. |
| `runtime.max-ram-percentage` | `int` | `75` | Suggested JVM `-XX:MaxRAMPercentage`. |
| `runtime.banner-silent-in-tests` | `boolean` | `true` | Suppresses the banner during tests. |
| `startup-report.enabled` | `boolean` | `true` | Prints the post-startup report. |
| `variables.*` | `Map<String,String>` | `{}` | Custom variables. |

### Properties (`aybar.secretos.*`)

| Property | Type | Default | Description |
|---|---|---|---|
| `proveedor` | `aws` \| `azure` \| `entorno` | *(absent)* | Where the secrets come from. **Absent = exactly the 0.3.0 behavior** (AWS, opt-in with `aybar.config.secrets-manager.enabled=true`). Case-insensitive. Any other value aborts the startup. |
| `azure.vault-uri` | `String` | `null` | Key Vault URI, e.g. `https://kv-todo-dev.vault.azure.net/`. **Required** with `proveedor=azure`. |
| `azure.nombres` | `List<String>` | `[]` | Key Vault secret names to load. **At least one** with `proveedor=azure`. |
| `entorno.variables` | `List<String>` | `[AYBAR_SECRETOS]` | Environment variables that hold the secrets, with `proveedor=entorno`. |

How each provider is activated and configured:

| `aybar.secretos.proveedor` | Active when | Secret name(s) | Needs on the classpath |
|---|---|---|---|
| *(absent)* | `aybar.config.secrets-manager.enabled=true` | `aybar.config.secrets-manager.name` | `software.amazon.awssdk:secretsmanager`; if missing, skipped with a `WARN` (0.3.0 behavior) |
| `aws` | `aybar.config.secrets-manager.enabled=true` (same flag; without it, nothing is loaded) | `aybar.config.secrets-manager.name` | `software.amazon.awssdk:secretsmanager`; if missing, **startup aborts** |
| `azure` | choosing it | `aybar.secretos.azure.nombres` | `com.azure:azure-security-keyvault-secrets` + `com.azure:azure-identity`; if missing, **startup aborts** |
| `entorno` | choosing it | `aybar.secretos.entorno.variables` | nothing |

Same rules for every provider: a JSON payload is exploded into one property
per key; any other payload is published as `aybar.secret.<name>`; the property
source goes first (a secret wins over YAML and over `AYBAR_*`); with several
names, the last one wins on a repeated key; a secret that cannot be read
**aborts the startup** naming the secret, never its value.

JSR-303 validation:
- `secrets-manager.name` is required when `secrets-manager.enabled=true` (cross-field).
- `runtime.timeout-shutdown-ms` must be positive.
- `runtime.max-ram-percentage >= 25`.
- `actuator.period-ms >= 1000`.

### Load order

All `EnvironmentPostProcessor`s are registered via `META-INF/spring.factories`:

1. Spring Boot's `ConfigDataEnvironmentPostProcessor` (order `HIGHEST_PRECEDENCE + 10`)
   loads `application.yml`, the active profile files and `spring.config.import`.
   External configuration is that native mechanism; the SDK's
   `ExternalConfigPostProcessor` was removed (same slot, never imported anything).
2. `AybarActuatorDefaults` (`ApplicationListener<ApplicationEnvironmentPreparedEvent>`, registered in `META-INF/spring.factories` — **not** as a bean: the event fires before the context exists) sets the Actuator probes (`management.endpoint.health.probes.enabled=true`, groups `liveness`/`readiness`). Same registration shape as `AybarRuntimeDefaults` and `VariablesResolver` (all three are in `spring.factories` under `org.springframework.context.ApplicationListener`).
3. `EnvironmentVariablesPostProcessor` (order `HIGHEST_PRECEDENCE + 15`) translates AYBAR_*.
4. `SecretsManagerPostProcessor` (order `HIGHEST_PRECEDENCE + 18`, **before** the
   data mappers so a secret carrying `AYBAR_DATASOURCE_URI`/`AYBAR_MONGO_URI` is
   mapped; it used to run at +25, too late) loads the
   secrets from the provider selected by `aybar.secretos.proveedor` (port
   `FuenteSecretos`; adapters `SecretsManagerClientHolder` (built and closed by the
   post-processor itself; there is no bean),
   `FuenteSecretosAzureKeyVault`, `FuenteSecretosEntorno`). It runs before the
   context exists: `@ConditionalOnClass` does not apply, so each provider's SDK
   is detected by class name.
5. Data importers (`PostgresPropertyPostProcessor`, `MongoPropertyPostProcessor`,
   `FlywayPropertyPostProcessor`, order +20; `H2FallbackPostProcessor`, +30).
6. `ProfilesValidator` (`@PostConstruct`) warns about a missing or unconventional
   profile — it **never activates one** — and `PropiedadesRetiradasValidator`
   about retired properties.
7. `EnvironmentDetector` becomes available as a bean.
8. `StartupReport` (`ApplicationReadyEvent`) prints the report (`Active profiles:
   (none: real environment)` when nothing is active).

### Supported `AYBAR_*` variables

| Variable | Maps to |
|---|---|
| `AYBAR_DATASOURCE_URI` | `spring.datasource.url` (single JDBC URI, credentials embedded if needed) |

### Environment detector

`EnvironmentDetector.detect(manualOverride)` returns:

- `ECS_FARGATE` if `AWS_EXECUTION_ENV` contains "ECS" or `/var/run/ecs` exists or
  `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI` is set.
- `LOCAL_TESTS` if the process command line looks like Surefire/Failsafe.
- `LOCAL_DOCKER` otherwise.

Manual override: `aybar.config.environment.mode=local|ecs|test|auto`.

### Startup report

`StartupReport` logs a summary on `ApplicationReadyEvent` with these fields:
`Service`, `Version`, `Spring Boot`, `Java`, `Active profiles`, `Environment`,
`DataSource`, `MongoDB`, `Secrets Manager`, `Flyway`, `Actuator`,
`Suggested -XX:MaxRAMPercentage`, `Uptime`, `Heap used (MB)`. Never prints
passwords or secrets. Disable with `aybar.config.startup-report.enabled=false`.
Note: the legacy `discovery` field was removed in 0.2.0 alongside
`AYBAR_DISCOVERY_MODO`.

### Banner

Corporate `banner.txt`. Disable with `spring.main.banner-mode=off` or
`aybar.config.runtime.banner-silent-in-tests=true`.

## Secrets: choosing a provider

These are **options**, not a rule. The service picks one in its ADR; nothing in
the SDK assumes a cloud. Every snippet keeps the secret itself out of YAML.

**Option A: AWS Secrets Manager** (the 0.3.0 setup; nothing changes for an
existing service). Declare `software.amazon.awssdk:secretsmanager` (no
`<version>`) in the service pom.

```yaml
aybar:
  config:
    secrets-manager:
      enabled: true                 # usually only in the deployed profiles
      name: aybar/todo/dev
      region: us-east-1
# optional, only to make the choice explicit:
# aybar.secretos.proveedor: aws
```

Credentials: the task role (`DefaultCredentialsProvider`). Permission:
`secretsmanager:GetSecretValue` on the secret (+ `kms:Decrypt` with a custom key).

**Option B: Azure Key Vault.** Declare both, no `<version>` (the `azure-sdk-bom`
imported by the SDK governs them):

```xml
<dependency>
  <groupId>com.azure</groupId>
  <artifactId>azure-security-keyvault-secrets</artifactId>
</dependency>
<dependency>
  <groupId>com.azure</groupId>
  <artifactId>azure-identity</artifactId>
</dependency>
```

```yaml
aybar:
  secretos:
    proveedor: azure
    azure:
      vault-uri: https://kv-todo-dev.vault.azure.net/
      nombres: [aybar-todo-dev]     # Key Vault names: letters, digits, dashes
```

Credentials: `DefaultAzureCredential`. In Azure, the managed identity
(`AZURE_CLIENT_ID` selects a user-assigned one); on a developer machine,
`az login`. Permission: role **Key Vault Secrets User** on the vault (RBAC) or
the `get` secret permission (access policies).

**Option C: environment variables** injected by the platform (ECS task
definition `secrets`, Kubernetes `secretKeyRef`, Azure Container Apps
`secretref`). No cloud SDK, no permission in the application.

```yaml
aybar:
  secretos:
    proveedor: entorno
    # entorno.variables: [AYBAR_SECRETOS]   # default
```

The platform puts the same JSON bundle a Secrets Manager secret would hold
into `AYBAR_SECRETOS`.

The provider can also come from the deployment instead of YAML:
`AYBAR_SECRETOS_PROVEEDOR=azure` (Spring relaxed binding).

### Pitfalls

- **`proveedor: aws` alone loads nothing.** AWS keeps its 0.3.0 opt-in flag:
  `aybar.config.secrets-manager.enabled=true` is still required. Azure and
  `entorno` are activated by choosing them.
- **`aybar.config.secrets-manager.enabled=true` with another provider is
  ignored** (with a `WARN`). Remove it when migrating off AWS.
- **Only the chosen cloud's SDK goes in the pom.** The cloud SDKs are
  `<optional>` in this starter; adding both is harmless but useless weight.
- **Choosing `azure` or `entorno` in `application.yml` makes it mandatory in
  every profile**, `local` included. Put it in the deployed profiles or in the
  deployment environment if the laptop should not read the vault (with
  `az login`, it can).
- **Key Vault secret names cannot contain dots.** Load a JSON bundle (one
  secret, many properties) or reference `${aybar.secret.<name>}` from YAML.
- **A missing or blank variable with `entorno` aborts the startup.** It is a
  deployment error, not an empty secret.

## Diagnostics

2 `FailureAnalyzer`s via `META-INF/spring.factories`:

| Analyzer | Covers |
|---|---|
| `ConfigurationFailureAnalyzer` | `BindException`, `BindValidationException`, "Failed to bind" messages. |
| `SecretsManagerFailureAnalyzer` | `SdkException`, IAM, KMS, region, ARN, VPC endpoint (AWS only). |

Azure Key Vault and `entorno` failures have no dedicated analyzer: the abort
message itself carries the checklist (identity, role, vault URI, network; or
the missing variable) and keeps the original exception as its cause.

For DataSource/Mongo, see `aybar-starter-data`
(`DataSourceFailureAnalyzer`, `MongoFailureAnalyzer`,
`H2FallbackFailureAnalyzer`).

## Installation

```xml
<dependency>
  <groupId>com.aybarsac.sdk</groupId>
  <artifactId>aybar-starter-config</artifactId>
</dependency>
```

`application.yml`:

```yaml
aybar:
  config:
    secrets-manager:
      enabled: false            # true in ECS Fargate
    actuator:
      enabled: true
    runtime:
      timeout-shutdown-ms: 30000

spring:
  application:
    name: aybar-cuotas
  config:
    # External configuration: Spring Boot native, no SDK code involved.
    import: "optional:file:./config/${spring.application.name}-local.yml"
  # No profile default: SPRING_PROFILES_ACTIVE comes from the environment.
  # Without it the service is a REAL environment and the SDK checks are not
  # relaxed. For local development: export SPRING_PROFILES_ACTIVE=local.
```

Add to the service `.gitignore`:

```
application-local.yml
config/*-local.yml
```

## Common junior questions

- "I want to connect to Postgres locally without Docker." ->
  `aybar-starter-data` + `aybar.data.postgres.fallback-h2=true` with
  profile `local`. **NEVER in prod** (aborts via `H2FallbackFailureAnalyzer`).
- "My credentials must not be in YAML." ->
  `AYBAR_DATASOURCE_URI` env var locally (full JDBC URI with embedded
  credentials); in a deployed environment, the provider your service chose:
  `aybar.config.secrets-manager.enabled=true` (AWS),
  `aybar.secretos.proveedor=azure` (Key Vault) or
  `aybar.secretos.proveedor=entorno` (platform-injected variables).
- "My service is not detected as Fargate." ->
  Check `AWS_EXECUTION_ENV`, `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI`,
  `/var/run/ecs`. Use `EnvironmentDetector` as a bean.
- "I want ECS to know if my app is alive." ->
  `aybar.config.actuator.enabled=true` (default). ECS consumes
  `/actuator/health/liveness` and `/actuator/health/readiness`.
- "I want to disable the whole starter in a service." ->
  Set `aybar.config.enabled=false` in the service profile.
- "I want to avoid raw stacktraces when startup fails." ->
  The `FailureAnalyzer`s are already registered. If a new one is needed,
  follow the pattern in `diagnostics/` and add it to
  `META-INF/spring.factories`.

## Common errors

| Symptom | Likely cause | Fix |
|---|---|---|
| `IllegalStateException`: "fallback-h2=true is ENABLED but ... is a real environment" | `fallback-h2=true` with any profile that is not an explicit `local` (empty list included) | Disable flag or set `SPRING_PROFILES_ACTIVE=local` |
| "Failed to bind property 'aybar.config...'" | Invalid property | `ConfigurationFailureAnalyzer` indicates the property |
| `AccessDeniedException` from Secrets Manager | Task role missing `secretsmanager:GetSecretValue` | Verify IAM policy |
| "aybar.secretos.proveedor=azure but its SDK is not on the classpath" | Azure chosen without the two `com.azure` dependencies | Add `azure-security-keyvault-secrets` and `azure-identity` (no `<version>`) |
| "could not fetch the secret ... from Azure Key Vault" with a 403 cause | The identity lacks **Key Vault Secrets User** (or `get` permission) | Grant the role to the managed identity / your `az login` user |
| "could not fetch the secret ... from Azure Key Vault" with a credential cause | `DefaultAzureCredential` found no identity | In Azure: assign a managed identity (`AZURE_CLIENT_ID` if user-assigned). Locally: `az login` |
| "could not fetch the secret 'AYBAR_SECRETOS' from environment variables" | `proveedor=entorno` and the platform did not inject the variable | Add it to the task definition / manifest, or choose another provider |
| "'gcp' is not a supported secret provider" | Unknown `aybar.secretos.proveedor` | Use `aws`, `azure` or `entorno`, or remove the property |
| Liveness probe fails | App not responding | `ConfigurationFailureAnalyzer` indicates the cause |
| `NoClassDefFoundError: HealthEndpoint` | `spring-boot-starter-actuator` missing | Add optional dep to the service |

## How to verify

- `mvn -B verify -pl aybar-starter-config -am` -> green without Docker.
- `mvn -B verify -pl aybar-starter-data -am` -> green without Docker.
- `SinPasswordEnYamlTests` walks `src/main/resources` and `src/test/resources`
  and breaks if `password:`, `secret:`, `credentials:`, `token:` or
  `api.key:` appears.

## What this starter does NOT touch

- `CodigoNegocio` and RFC 7807 -> `aybar-starter-web`.
- Logging JSON, MDC, PII filter -> `aybar-starter-logging`.
- Event auditing -> `aybar-starter-audit`.
- Corporate HTTP client -> `aybar-starter-client`.
- Kafka messaging -> `aybar-starter-messaging`.
- DataSource / Mongo / Flyway -> `aybar-starter-data`.
- Versions / BOM -> `aybar-bom`.
