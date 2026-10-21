> **COPIA SELLADA - NO SE EDITA AQUI.** Se edita el original y se regenera.
>
> Sellado: SDK 0.7.1 | origen aybar-starter-data/SKILL.md | generado 2026-10-15
>
> El original vive en `aybar-starter-data/SKILL.md`, dentro del repositorio del Aybar SDK.
> Lo que escribas en esta copia se pierde en la siguiente generacion y, peor, queda
> en desacuerdo con el SDK que de verdad usa el servicio. Si la version de arriba no
> coincide con el SDK que tienes instalado, NO te fies de este fichero:
> `./comprobar-entorno.sh` lo comprueba y te avisa.

---

---
name: aybar-starter-data
description: Rules for using `aybar-starter-data` (Aybar SDK data starter): PostgreSQL with Hikari, MongoDB, Flyway, H2 fallback with anti-prod, JPA Auditing, EntidadAuditable, FailureAnalyzers. Use when configuring `aybar.data.*`, or when talking about Postgres, Mongo, Flyway, H2 fallback or migrations.
---

# aybar-starter-data

Corporate data layer of the Aybar SDK. Groups in a single starter:

- **PostgreSQL** with HikariCP (defaults tuned for ECS Fargate, single JDBC URI).
- **MongoDB** (CQRS read store).
- **Flyway** (`classpath:db/migration` convention).
- **H2 fallback** with anti-prod protection.
- **`EntidadAuditable`** JPA base (`@MappedSuperclass`, automatic auditing).
- **JPA / Mongo Auditing** activated conditionally.
- **CQRS ports** (`AybarReadRepository`, `AybarWriteRepository`) under
  `com.aybarsac.sdk.data.cqrs`.
- **3 `FailureAnalyzer`s** with actionable messages (DataSource, Mongo,
  fallback H2 in prod).

Previously part of `aybar-starter-config`; it was separated so the
cross-cutting starter does not pull heavy dependencies (JPA, Mongo, Postgres)
into services that do not use them.

## Namespace

SDK properties follow the `aybar.<starter>.*` convention (no `sdk` segment).
This starter defines
`aybar.data.*` for Postgres / Mongo / Flyway.

| Layer | Prefix |
|---|---|
| Postgres | `aybar.data.postgres.*` |
| Mongo | `aybar.data.mongo.*` |
| Flyway | `aybar.data.flyway.*` |
| H2 fallback | `aybar.data.postgres.fallback-h2` |

## Hard rules

- **Never** declare `spring.datasource.*` or `spring.data.mongodb.*` by hand
  in `application.yml`. Use `aybar.data.postgres.*` and
  `aybar.data.mongo.*`.
- **Zero** `password:` / `secret:` / `credentials:` / `token:` / `api.key:` in
  YAML of the service or the starter.
- **Secrets** via env (`AYBAR_DATASOURCE_URI`, `AYBAR_MONGO_URI`) or via
  `aybar.config.secrets-manager.*` in ECS.
- **Single URI** for Postgres: credentials live inside
  `jdbc:postgresql://host:port/db`, as user-info before the host
  (`user:pass@host`). Never split URL / user / pass
  in YAML.
- **`EntidadAuditable`** lives in this starter because it uses JPA; the
  service `domain` **must not** import it directly. Only the
  `adapters.outbound.persistence.postgres` adapters use it.
- **`fallback-h2`** is for development / tests only. It is accepted **only**
  under an explicit `local` profile; every other profile list — the **empty**
  one included — aborts startup with an `IllegalStateException` caught by
  `H2FallbackFailureAnalyzer`. A test JVM that wants it declares
  `spring.profiles.active=local`.
- **Never set `spring.flyway.*` and `aybar.data.flyway.*` at the same time.**
  Since 0.3.1 the starter contributes Flyway as *defaults* (`addLast`), so the
  native space wins where both are set. Pick `aybar.data.flyway.*`.
- **Health indicators of the stores go in the `readiness` group, never in
  `liveness`** — `HealthGroupsPostProcessor` does it, adding only the store
  that is configured and preserving whatever members the group already had.
- **CQRS ports** (`AybarWriteRepository`, `AybarReadRepository`) live in
  `com.aybarsac.sdk.data.cqrs`. The domain extends them; the adapters
  implement them.
- **Fail-fast outside `local`.** Fuera del perfil `local`, ambos
  `DataSourceFailFastPostProcessor` y `MongoFailFastPostProcessor` (registrados
  en `META-INF/spring.factories`, corren los ultimos en la cadena EPP y miran
  **solo la propiedad efectiva**, `spring.datasource.url` /
  `spring.data.mongodb.uri`) abortan el arranque si no hay URI
  resuelta, **incluida la lista de perfiles vacia**: olvidar
  `SPRING_PROFILES_ACTIVE` en un servidor no puede verse igual que correr en un
  portatil. La unica via de opt-out es la property `required=false`
  (`aybar.data.postgres.required` / `aybar.data.mongo.required`); un servicio
  sin BD relacional debe ademas excluir `DataSourceAutoConfiguration` de
  Spring Boot para no caer en su propia falta de URL. La razon por la que
  Mongo necesita su propio check es que un Mongo URI faltante **no falla** —
  Spring Boot cae a `localhost:27017`, el servicio se declara sano, y cada
  lectura va a una base que no esta.

## When it applies

- Configuring PostgreSQL (URI, Hikari).
- Configuring MongoDB (URI, database).
- Enabling Flyway with the `classpath:db/migration` convention.
- Creating JPA entities extending `EntidadAuditable`.
- Declaring write/read repository ports in `domain` that the adapters will
  implement.
- Enabling H2 fallback to run without Docker locally.
- Configuring connection pools for ECS Fargate.

## When it does NOT apply

- Configuring an HTTP / RestClient -> `aybar-starter-client`.
- Defining domain ports -> `domain` declares them, adapters implement them.
- PII fail-closed auditing -> `aybar-starter-audit`.
- Kafka, topic naming, headers -> `aybar-starter-messaging`.
- Security / JWT validation (OIDC issuer) -> `aybar-starter-security`.
- Date / timezone utilities -> `aybar-starter-common`.

## Starter conventions

### Properties (`aybar.data.postgres.*`)

| Property | Type | Default | Description |
|---|---|---|---|
| `uri` | `String` | `null` | Single JDBC URI (env `AYBAR_DATASOURCE_URI`). Credentials may be embedded. |
| `driver-class-name` | `String` | `org.postgresql.Driver` | JDBC driver. |
| `required` | `boolean` | `true` | Whether this service needs a relational store. When `true` and the profile is not `local`, startup aborts without a URI — see [Fail-fast](#fail-fast-no-silent-boot-without-credentials). A read-only service that only uses Mongo sets this to `false`. |
| `hikari.maximum-pool-size` | `int >= 1` | `10` | Max pool size. |
| `hikari.minimum-idle` | `int >= 0` | `2` | Min idle connections. |
| `hikari.connection-timeout-ms` | `long > 0` | `30000` | Connection acquisition timeout. |
| `hikari.idle-timeout-ms` | `long > 0` | `600000` | Max idle time. |
| `hikari.max-lifetime-ms` | `long > 0` | `1800000` | Max connection lifetime. |
| `hikari.leak-detection-threshold-ms` | `long >= 0` | `0` (off) | Logs a warning with the stack trace of whoever held a connection longer than this. Off by default because producing the trace has a cost; turn it on deliberately to hunt connection leaks. |
| `fallback-h2` | `boolean` | `false` | H2 in-memory override. Local/tests only. When true, `uri` must be empty. |

JSR-303 validation:
- `hikari.maximum-pool-size >= 1`, `positive`.
- `hikari.minimum-idle >= 0`.
- `hikari.connection-timeout-ms > 0`, `idle-timeout-ms > 0`, `max-lifetime-ms > 0`.
- `hikari.leak-detection-threshold-ms >= 0`.
- **Cross-field**: when `fallback-h2=true`, `uri` must be empty so the H2
  override can take over fully.

### Properties (`aybar.data.mongo.*`)

| Property | Type | Default | Description |
|---|---|---|---|
| `uri` | `String` | `null` | URI (`mongodb://` or `mongodb+srv://`). |
| `database` | `String` | `null` | Database. |
| `auto-index-creation` | `boolean` | `false` | Create the indexes of `@Document` classes at startup. Off by default: Mongo is read-only for the service (ADR-001). |
| `required` | `boolean` | `true` | Whether this service needs a read store. When `true` and the profile is not `local`, startup aborts without a URI — see [Fail-fast](#fail-fast-no-silent-boot-without-credentials). |
| `connect-timeout-ms` | `long > 0` | `10000` | Socket connect timeout (`@Positive`). |
| `server-selection-timeout-ms` | `long > 0` | `5000` | How long the driver keeps looking for a usable server before failing a request. The driver's own default is 30s — measured at 30.09s against a downed node. 5s is enough here because this topology has no legitimate automatic election to wait for. Applied via `MongoClientSettingsBuilderCustomizer` (Spring Boot exposes no property for it). |
| `read-preference` | `String` (non-blank) | `secondaryPreferred` | Favours secondaries: in this CQRS topology Mongo is the read side and the service never writes to it. Like the timeouts, applied only when the URI does not set it (`readPreference`, `serverSelectionTimeoutMS`, `connectTimeoutMS` in the URI win). |

Validation: if you define `uri` or `database`, define both. URI must start with
`mongodb://` or `mongodb+srv://`.

### Properties (`aybar.data.flyway.*`)

| Property | Type | Default | Description |
|---|---|---|---|
| `enabled` | `boolean` | `true` | Enable Flyway. |
| `locations` | `String` | `classpath:db/migration` | Folder with SQL. |
| `baseline-on-migrate` | `boolean` | `false` | Allow baseline on non-empty DB. |
| `baseline-table` | `String` | `flyway_schema_history` | History table name. |

---

## Installation in a microservice

Add to the `adapters` module:

```xml
<dependency>
  <groupId>com.aybarsac.sdk</groupId>
  <artifactId>aybar-starter-data</artifactId>
</dependency>
```

`application.yml`:

```yaml
aybar:
  data:
    postgres:
      uri: ${AYBAR_DATASOURCE_URI}
      hikari:
        maximum-pool-size: 10
    mongo:
      uri: ${AYBAR_MONGO_URI}
      database: todo
    flyway:
      enabled: true
      locations: classpath:db/migration
```

---

## Flyway — convention

Migration SQL lives in the **service**, not in the SDK:

```
aybar-cuotas/adapters/src/main/resources/db/migration/
├── V1__create_table_cuota.sql
├── V2__add_index_cuota_empresa.sql
└── V3__add_column_monto.sql
```

Convention:

- Name: `V<n>__<description>.sql`.
- Sequential versioning, no rewriting.
- No secret INSERTs.
- No Mongo migrations here (the read model is updated via CQRS, outside the
  starter).

---

## EntidadAuditable

JPA base class for service entities (lives in
`adapters.outbound.persistence.postgres`):

```java
@Entity
@Table(name = "cuota")
public class Cuota extends EntidadAuditable {
    @Column private BigDecimal amount;
    @Column private String companyId;
    // id, createdAt, updatedAt, version inherited
}
```

`EntidadAuditable` provides:

- `@Id @GeneratedValue(strategy = IDENTITY) Long id`
- `@CreatedDate Instant createdAt`
- `@LastModifiedDate Instant updatedAt`
- `@Version Long version`

JPA Auditing activates automatically when
`spring.data.jpa.auditing-enabled=true` (default). If the service declares its
own `@EnableJpaAuditing` / `@EnableMongoAuditing`, the starter's backs off
(two of them used to abort with `BeanDefinitionOverrideException`).

---

## H2 fallback (development / tests only)

```yaml
aybar:
  data:
    postgres:
      fallback-h2: true
```

Activatable only under an explicit `local` profile. This is an **allow-list**:
any other profile name — `dev`, `prod`, `staging`, `qa`, but also `preprod`,
`uat`, `sandbox` or a client-specific one — **and the empty profile list too**
aborts startup with an
`IllegalStateException` and the following actionable message (via
`H2FallbackFailureAnalyzer`):

```
Attempted to activate the H2 fallback in a non-local environment.

This would activate in-memory H2 (PostgreSQL mode) in a production
environment, which is unsafe and silent.

Actions:
  1. Disable the flag: aybar.data.postgres.fallback-h2=false
  2. Or use the 'local' profile: SPRING_PROFILES_ACTIVE=local
  3. Configure aybar.data.postgres.uri with your real JDBC URI
     (typically AYBAR_DATASOURCE_URI via Secrets Manager in ECS).

fallback-h2=true is accepted only under an explicit 'local' profile. Every
other profile list is rejected, including the EMPTY one (forgetting
SPRING_PROFILES_ACTIVE on a server must not look like a laptop) and names
the SDK has never heard of.
```

When activated:

- `spring.datasource.url=jdbc:h2:mem:aybar;DB_CLOSE_DELAY=-1;MODE=PostgreSQL`
- `spring.datasource.driver-class-name=org.h2.Driver`
- `spring.jpa.hibernate.ddl-auto=create-drop`
- `spring.flyway.enabled=false`

The H2 driver is **optional**: a service that wants H2 must declare it
explicitly in its pom.

---

## Actionable messages

3 `FailureAnalyzer`s registered via `META-INF/spring.factories`:

| Analyzer | Covers |
|---|---|
| `DataSourceFailureAnalyzer` | Credentials, driver, URL, Hikari, Flyway. |
| `MongoFailureAnalyzer` | `MongoSocketOpen`, `MongoTimeout`, authentication, DNS, TLS. |
| `H2FallbackFailureAnalyzer` | `fallback-h2=true` outside an explicit `local` profile, empty list included (allow-list). |

**None** print credentials. Suspect properties are mentioned by name
without revealing values.

---

## Tests

- `mvn -B verify -pl aybar-starter-data -am` -> green without Docker.
- `SinPasswordEnYamlTests` widened: detects `password/secret/credentials/token/api.key`.
- Each importer is tested with `MockEnvironment` and the `EnvironmentPostProcessor`
  API (`postProcessEnvironment(env, app)`).
- `H2FallbackFailureAnalyzerTests` verifies the exact message when activated
  in `prod`.

---

## What it does NOT do

- **Discovery / Resilience** — removed: internal communication is Apache
  Kafka only.
- **PII auditing** — `aybar-starter-audit`.
- **Hexagonal template / CLI** — P5 (coalition).
- **CQRS projection** — lives in the service (Kafka consumer + Mongo).
- **Date / timezone utilities** — `aybar-starter-common`.

---

## How to verify

- `mvn -B verify -pl aybar-starter-data -am` -> green without Docker.
- `SinPasswordEnYamlTests` breaks if `password:`, `secret:`, `credentials:`,
  `token:` or `api.key:` appears in any `.yml`/`.yaml`/`.properties` of the
  starter.
- Verify manually with `mvn dependency:tree -pl aybar-starter-data`: the
  starter declares JPA, Mongo, Postgres and Flyway; consumers declare the
  starter, not the direct deps.

## Common junior questions

- "I want to run the service without Docker to validate the logic." ->
  `aybar.data.postgres.fallback-h2=true` with profile `local` (explicit — the
  empty profile is rejected) and `org.h2database:h2` in the pom.
- "How do I get `db`/`mongo` into `/actuator/health/readiness`?" -> Nothing to
  do: `HealthGroupsPostProcessor` contributes them once Actuator is on the
  classpath. It never touches `liveness`, and it keeps any members the group
  already had.
- "My JPA entity needs automatic createdAt / updatedAt." ->
  Extend `EntidadAuditable` in `adapters.outbound.persistence.postgres`.
- "I need a clear message when the Postgres connection fails." ->
  `DataSourceFailureAnalyzer` is already registered; check the log.
- "I want to enable Flyway with my own migration folder." ->
  `aybar.data.flyway.locations=classpath:db/migraciones-v2`.
- "I have a Mongo URI with `mongodb+srv://` (Atlas)." ->
  Works; the importer accepts `mongodb://` and `mongodb+srv://`.

## Common errors

| Symptom | Likely cause | Fix |
|---|---|---|
| `IllegalStateException`: fallback-h2 in prod | Fallback flag + any profile that is not an explicit `local` (empty list included) | Disable the flag or set `SPRING_PROFILES_ACTIVE=local` |
| `IllegalStateException` from `DataSourceFailFastPostProcessor` | `aybar.data.postgres.required=true` (default) y la propiedad efectiva `spring.datasource.url` está vacía fuera del perfil `local` (ninguna fuente la publicó) | Define la URI o, si el servicio no usa Postgres, marca `aybar.data.postgres.required=false` y excluye `DataSourceAutoConfiguration` en el servicio |
| `IllegalStateException`: "... is not a JDBC URI" / "... is not a MongoDB URI" | `aybar.data.*.uri` o `AYBAR_*_URI` con formato inválido (aborta en cualquier perfil) | Corrige el formato: `jdbc:postgresql://...` / `mongodb://...`; el mensaje nombra la fuente, nunca el valor |
| `IllegalStateException` from `MongoFailFastPostProcessor` | Igual que el anterior con `aybar.data.mongo.required=true` y `spring.data.mongodb.uri` vacía | Define la URI o marca `aybar.data.mongo.required=false` (un servicio sin Mongo seguira intentando `localhost:27017` en background; mejor no usar el starter) |
| `spring.flyway.*` in the YAML is ignored | Versions ≤ 0.3.0 only: the starter published Flyway with `addFirst` | Upgrade to 0.3.1, or move it to `aybar.data.flyway.*` |
| `spring.datasource.hikari.*` / `driver-class-name` / `spring.data.mongodb.auto-index-creation` in the YAML are ignored | Versions ≤ 0.5.1 only: those defaults went with `addFirst` | Upgrade; they are `addLast` defaults now |
| `AYBAR_DATASOURCE_URI` delivered as a secret is not mapped and the fail-fast aborts | Versions ≤ 0.5.1 only: the secrets provider ran at +25, after the mappers | Upgrade; it runs at +18 now |
| `/actuator/health/readiness` → 404 | No Actuator on the classpath | Add `spring-boot-starter-actuator` to the service; the starter does not drag it in |
| `BeanCreationException`: Hikari pool must be >= 1 | Pool misconfigured | `hikari.maximum-pool-size >= 1` |
| "Failed to determine a suitable driver" | Driver not declared | Add `org.postgresql:postgresql` |
| `MongoSocketOpenException` | Wrong URI or cluster down | Verify `aybar.data.mongo.uri` |
| `FlywayException: Unable to obtain connection` | Flyway runs before DataSource ready | Verify importer order |
| `JPA metamodel must not be empty` | `spring-boot-starter-data-jpa` without entities | Expected in tests; disable `spring.data.jpa.auditing-enabled` |
