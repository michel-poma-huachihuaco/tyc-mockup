> **COPIA SELLADA - NO SE EDITA AQUI.** Se edita el original y se regenera.
>
> Sellado: SDK 0.7.1 | origen aybar-starter-audit/SKILL.md | generado 2026-10-15
>
> El original vive en `aybar-starter-audit/SKILL.md`, dentro del repositorio del Aybar SDK.
> Lo que escribas en esta copia se pierde en la siguiente generacion y, peor, queda
> en desacuerdo con el SDK que de verdad usa el servicio. Si la version de arriba no
> coincide con el SDK que tienes instalado, NO te fies de este fichero:
> `./comprobar-entorno.sh` lo comprueba y te avisa.

---

---
name: aybar-starter-audit
description: Rules for using `aybar-starter-audit` (Aybar SDK audit starter): typed business and security events, LastChangeLogFile ChangeLog, fail-closed PII whitelist (Ley 29733), asynchronous batched dispatch and three publishers (log / NDJSON file / S3-MinIO). Use when recording auditable events, writing a ChangeLog, configuring `aybar.audit.*`, or deciding where audit output goes.
---

# aybar-starter-audit

Audit starter of the Aybar SDK. Records **what happened, who did it and to
which row**, with a serialization contract that cannot carry personal data by
accident, and delivers it off the request thread.

Two problems it solves:

1. **Ley 29733.** An audit trail that carries names, national IDs or emails is a
   liability. Here the payload is a **fail-closed whitelist**: anything that is
   not an allowed type is rejected with an exception at call time.
2. **The request thread must never block.** Dispatch is asynchronous and
   batched, with a bounded queue and guaranteed drain on graceful shutdown.

## What it registers at startup

Autoconfiguration `com.aybarsac.sdk.audit.AybarAuditAutoConfiguration`,
declared in
`META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`.

**The whole starter is gated by `aybar.audit.habilitado`** (default `true`,
`matchIfMissing = true`). With `aybar.audit.habilitado=false` **no bean of this
starter is created** — including `Auditoria`, so a service that injects it will
fail to start.

| Bean | Condition | What it is |
|---|---|---|
| `S3Publicador` | `S3Client` on classpath **and** `aybar.audit.s3.bucket` set **and** no other `PublicadorEventos` | Publishes to S3/MinIO |
| `NdjsonArchivoPublicador` | `aybar.audit.ndjson.dir` set **and** no other `PublicadorEventos` | Writes `.ndjson` files locally |
| `LogPublicador` | No other `PublicadorEventos` | Writes the event JSON to the service log |
| `DespachadorEventos` | `@ConditionalOnMissingBean` | Async queue + drainer thread |
| `Auditoria` | `@ConditionalOnMissingBean` | Facade for business and security events |
| `EscritorChangeLog` | `@ConditionalOnMissingBean` | LastChangeLogFile writer |

**Publisher precedence: S3 > NDJSON > log.** Exactly one is active. All three
are `@ConditionalOnMissingBean(PublicadorEventos.class)`, so **a
`PublicadorEventos` bean declared by the service wins over all of them** — that
is the supported extension point for sending audit to Kafka, a database or
anywhere else.

`Auditoria` and `EscritorChangeLog` take the service name from
`spring.application.name`, falling back to the literal `desconocido`.

## Property namespace

`aybar.audit.*`, bound by the `AybarAuditProperties` record.

| Property | Type | Default | Description |
|---|---|---|---|
| `habilitado` | `boolean` | `true` | Master switch for the whole starter. |
| `cola-capacidad` | `int` | `10000` | Bounded queue capacity. |
| `lote-tamano` | `int` | `100` | Maximum events per batch. |
| `lote-intervalo` | `Duration` | `1s` | Drainer poll interval. |
| `encolado-timeout` | `Duration` | `2s` | How long `publicar()` waits when the queue is full. |
| `timeout-cierre` | `Duration` | `30s` | How long graceful shutdown waits for the final drain. |
| `ndjson.dir` | `String` | `null` | Base directory. **Setting it activates the NDJSON publisher.** |
| `s3.bucket` | `String` | `null` | Bucket. **Setting it activates the S3 publisher** (if the AWS SDK is present). |
| `s3.endpoint` | `String` | `null` | Endpoint override. Required for MinIO; leave empty for real AWS S3. |
| `s3.access-key` | `String` | `null` | Static access key. Applied only when both key and secret are set. |
| `s3.secret-key` | `String` | `null` | Static secret key. |
| `s3.region` | `String` | `us-east-1` | AWS region. |
| `s3.path-style` | `boolean` | `true` | Path-style addressing. `true` is what MinIO needs. |

`cola-capacidad` and `lote-tamano` must be positive, and the three `Duration`s
must be strictly positive; otherwise `DespachadorEventos` throws
`IllegalArgumentException` at construction and the context does not start.

## Installation

```xml
<dependency>
  <groupId>com.aybarsac.sdk</groupId>
  <artifactId>aybar-starter-audit</artifactId>
</dependency>
```

**No `<version>`.** `aybar-bom` governs it.

### Optional dependency the consumer must add

**`software.amazon.awssdk:s3` is declared `<optional>true</optional>` in this
starter.** It does not reach the consumer transitively. Without it on the
classpath the S3 publisher cannot be created: if `aybar.audit.s3.bucket` is set
anyway, **startup fails** with an `IllegalStateException` naming the property and
the missing artifact (a `BeanFactoryPostProcessor`, so it also fails under
`spring.main.lazy-initialization=true`). Without the bucket property, NDJSON or
log is used as usual.

To activate the S3/MinIO adapter, the consumer adds:

```xml
<dependency>
  <groupId>software.amazon.awssdk</groupId>
  <artifactId>s3</artifactId>
</dependency>
```

No `<version>`: the AWS BOM imported by `aybar-sdk-parent` governs it.

**That S3 client is used against MinIO**, not against Amazon:
`S3Publicador.clienteDesde(...)` configures `endpointOverride(...)` plus
`forcePathStyle(true)`, which is the MinIO canon. It works against real S3 too —
leave `s3.endpoint` empty and set the proper `s3.region`.

## The two APIs

### `Auditoria` — business and security events

```java
auditoria.negocio("CONTRATO_APROBADO", Map.of(
        "contrato", new RefEntidad("MAE_CONTRACT", "CONTRACT", contratoId),
        "aprobadoPor", new PartyRef(partyIdDelAprobador)));

auditoria.seguridad("LOGIN_FALLIDO", Map.of(
        "usuario", new PartyRef(partyId)));
```

The service supplies the type and the data. **The SDK enriches the rest** from
the MDC that `aybar-starter-logging` and `aybar-starter-security` populate:

| Event field | MDC key | Who populates it |
|---|---|---|
| `usuario` | `usuario` | `FiltroMdcUsuario` (`aybar-starter-security`) |
| `userAccountId` | `userAccountId` | `FiltroMdcUsuario` (`aybar-starter-security`) |
| `companyId` | `companyId` | `FiltroMdcUsuario` (`aybar-starter-security`) |
| `sid` | `sid` | `FiltroMdcUsuario` (`aybar-starter-security`) |
| `correlationId` | `correlationId` | `aybar-starter-logging` |

Plus `eventoId` (random UUID), `timestamp` (UTC) and `servicio`.

**Without `aybar-starter-security` on the classpath those four fields are
`null`** and the serializer omits them (`NON_NULL`). The event is still
published — the whitelist governs `datos`, not the enrichment. A service that
audits user actions must declare `aybar-starter-security`, or its trail will
record *what* happened without *who* did it.

Object key: `auditoria/AAAA/MM/DD/<servicio>/<eventoId>.json`.

### `EscritorChangeLog` — the LastChangeLogFile contract

```java
escritorChangeLog.cambio("MAE_CONTRACT", "CONTRACT", contratoId);
```

Signature is `cambio(String entidad, String fragmento, long pk)`. It publishes a
JSON body with exactly these keys: `usuario`, `aplicacion`, `maquina`, `fecha`,
`CreatedDate`, `UpdatedDate`.

Object key:
`changelog/<fragmento>/<entidad>/<pk>/<yyyyMMddTHHmmssSSSZ>-x<7 hex>.json`.
The `x` + 7 hex suffix is a random anti-collision fragment: without it, two
changes to the same row in the same millisecond would break the NDJSON write
(`CREATE_NEW`) or silently overwrite in S3. The leading letter guarantees the
suffix can never look like an 8-digit national ID to the PII guard.

**The key is built only from technical identifiers.** Never a name, never a
document number.

## The PII whitelist (fail-closed)

`Validaciones.copiaValidada` validates **every value** of the `datos` map.
Allowed types, and nothing else:

| Allowed | Notes |
|---|---|
| `PartyRef` | `partyId` must be positive |
| `RefCatalogo` | `(tipo, id)`; `tipo` is a technical identifier, `id` positive |
| `RefEntidad` | `(entidad, fragmento, pk)`; both identifiers, `pk` positive |
| `Long`, `Integer` | |
| `Boolean` | |
| `Instant` | |
| `enum` | its `name()` is validated too (see below) |

**`String` is NOT allowed. `Double`, `Float` and `BigDecimal` are NOT allowed.
`null` is NOT allowed. Any POJO is NOT allowed.** A free-form `String` is
exactly how a name or an email ends up in the audit trail, so the type system
refuses it.

Anything else throws `IllegalArgumentException` **at call time**, naming the key
and the rejected class — **never the rejected value**, so the exception itself
cannot leak PII.

Additional validation:

- `tipo` must match `[A-Z][A-Z0-9_]{0,99}` — uppercase code, e.g.
  `CONTRATO_APROBADO`.
- `entidad`, `fragmento` and `RefCatalogo.tipo` must match
  `[A-Za-z][A-Za-z0-9_]{0,63}`.
- An `enum` whose `name()` is not a technical identifier, or contains **8 or
  more consecutive digits** (national-ID shaped), is rejected.
- `pk` and `id` must be positive; `cambio()` rejects `pk <= 0`.
- Map keys are serialized too, so they are validated like identifiers: they must
  match `[A-Za-z][A-Za-z0-9_]{0,63}` and must not contain 8 or more consecutive
  digits. The exception for a rejected key **does not include the key** (it could
  be the personal data itself).

## Transactions: business events and ChangeLog wait for the commit

When a Spring transaction with synchronization is active on the calling thread
(`TransactionSynchronizationManager.isSynchronizationActive()`), `negocio()` and
`cambio()` **do not enqueue immediately**: they register an `afterCommit`
callback. On rollback the event is discarded — an audit trail must not record a
contract approval or a row change that never happened.

| Call | Inside a transaction | Outside a transaction |
|---|---|---|
| `auditoria.negocio(...)` | Enqueued **after commit**; discarded on rollback | Enqueued immediately |
| `escritorChangeLog.cambio(...)` | Enqueued **after commit**; discarded on rollback | Enqueued immediately |
| `auditoria.seguridad(...)` | Enqueued **immediately** (a failed login is audited even if the use case rolls back) | Enqueued immediately |

The whitelist is still validated **at call time**, inside the transaction, so an
invalid payload throws where it is written. `spring-tx` is an optional
dependency of this starter, detected by class presence: a service without it
simply publishes immediately.

## Delivery guarantee: at-most-once on abrupt process death

The queue lives **in memory**. A graceful shutdown drains it (see below), but on
an abrupt death of the process — `SIGKILL`, OOM kill, a pod evicted without a
graceful stop — **whatever is queued and not yet published is lost without a
trace**. Delivery is therefore *at-most-once* in that scenario. There is no
outbox and no persistent retry in this starter. An event that must survive a
crash has to be written to the database in the business transaction (outbox
pattern, skill `aybar-outbox`).

## Asynchronous dispatch and failure behaviour

`DespachadorEventos` is a bounded `ArrayBlockingQueue` plus one platform daemon
thread named `aybar-audit-despachador` that drains in batches.

| Situation | Behaviour |
|---|---|
| Queue has room | `publicar()` returns immediately. The calling thread never blocks. |
| **Queue full** | Retries the offer for up to `encolado-timeout` (2s). If it still does not fit, logs **ERROR with the full event JSON**. |
| Dispatcher already stopped | Logs ERROR with the event JSON; the event is not queued. |
| `publicar()` races with `stop()` | The event is removed from the queue and rejected deterministically with ERROR + JSON, instead of being lost. |
| **Publisher throws** | `Throwable` is caught, ERROR is logged for the batch and **the JSON of every event in it** is dumped. The drainer thread survives. A `VirtualMachineError` is re-thrown after leaving the trace. |
| Graceful shutdown | Waits up to `timeout-cierre` (30s) for the final drain. |
| Drain incomplete at timeout | WARN with the number of pending events, then **every remaining event is dumped to the log as ERROR with its JSON**. |

**There is no silent discard anywhere.** Every path that cannot publish writes
the event JSON to the log at ERROR.

Every log line that carries an event JSON (`LogPublicador` and the dispatcher
dumps) uses the marker `LogAuditoria.MARCADOR`. Since that JSON already passed
the whitelist, the corporate encoder of `aybar-starter-logging` leaves its
`mensaje` field unmasked — otherwise the DNI mask (`\b\d{8}\b`) would turn a
`PartyRef(40123456)` or a UUID whose first block is numeric into `********`.
MDC fields and stack traces are still masked; the line reporting a failed batch
(with the publisher exception) carries no marker. There is **no retry and no dead-letter
queue** in this starter: the log is the last resort.

`getPhase()` returns `0`, which is **higher** than Boot's web server phases
(graceful drain at `DEFAULT_PHASE - 1024`, server stop at `DEFAULT_PHASE -
2048`). Since `SmartLifecycle` stops in descending phase order, the dispatcher
stops **after** in-flight requests have drained, so their audit events are still
queued and published.

### Publisher-specific failures

| Publisher | Failure mode |
|---|---|
| `LogPublicador` | Writes at INFO with the SLF4J marker `AYBAR_AUDITORIA` (`LogAuditoria.MARCADOR` from `aybar-starter-logging`). Cannot fail meaningfully. |
| `NdjsonArchivoPublicador` | Batch files are named `lote-<sello>-<secuencia>-x<7 hex>.ndjson`. Opens with `CREATE_NEW`: **an existing file makes the write fail**, it never appends or overwrites. A key resolving outside the base directory throws `IllegalArgumentException` (path-traversal guard). `IOException` becomes `UncheckedIOException` and is caught by the dispatcher. |
| `S3Publicador` | ChangeLog entries upload individually as `application/json` at their exact key. Other events upload grouped per partition as `application/x-ndjson`, key `<directorio>lote-<sello>-<secuencia>-x<7 hex>.ndjson` (the random suffix keeps two replicas with the same millisecond and counter apart). **Every PUT is conditional (`If-None-Match: *`)**: an existing object is never overwritten; S3 answers 412 and the batch is dumped to the log at ERROR. AWS SDK exceptions are caught by the dispatcher. |

## What NOT to do

- **Never put a `String` in the `datos` map.** It throws. That is the point: a
  free-form string is how a name gets into the audit trail. Use `PartyRef`,
  `RefEntidad` or `RefCatalogo`.
- **Never put `Double` or `BigDecimal` in `datos`.** They are not on the
  whitelist. Use `Long` for amounts in minor units.
- **Never build the object key by hand.** `Auditoria` and `EscritorChangeLog`
  build it from technical identifiers only. A hand-built key is how a document
  number ends up in a file name.
- **Never catch and swallow the `IllegalArgumentException`** from the whitelist
  to "get the event through". If it throws, the payload is wrong — fix the
  payload.
- **Never set `aybar.audit.s3.bucket` without `software.amazon.awssdk:s3` on the
  classpath.** The context refuses to start; add the dependency or remove the
  property.
- **Never point `aybar.audit.ndjson.dir` at a container path with no volume.**
  The files are written and lost with the container.
- **Never set `aybar.audit.habilitado=false` in a service that injects
  `Auditoria`.** No bean is created and the context fails to start. If you want
  audit off but the code intact, leave it enabled with the log publisher.
- **Never rely on the audit trail for business state.** It is asynchronous, and
  on a hard kill (`SIGKILL`, OOM) whatever is in the queue is gone. Business
  state belongs in the database.
- **Never enable bucket versioning by hand and assume it is optional.** The
  ChangeLog overwrites `LastChangeLogFile` by design; versioning is what keeps
  the history.
- **Never declare a `PublicadorEventos` bean unless you mean to replace all
  three built-ins.** It wins over S3, NDJSON and log at once.

## What this starter does NOT touch

- JSON logging and the MDC it reads from -> `aybar-starter-logging`.
- `AybarUserContext` and the `usuario` / `companyId` / `sid` MDC keys ->
  `aybar-starter-security`.
- Kafka -> `aybar-starter-messaging` (which depends on this starter for its
  payload types).
- Database persistence -> `aybar-starter-data`.
- RFC 7807 -> `aybar-starter-web`.
- Versions / BOM -> `aybar-bom`.
