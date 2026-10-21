> **COPIA SELLADA - NO SE EDITA AQUI.** Se edita el original y se regenera.
>
> Sellado: SDK 0.7.1 | origen aybar-starter-logging/SKILL.md | generado 2026-10-15
>
> El original vive en `aybar-starter-logging/SKILL.md`, dentro del repositorio del Aybar SDK.
> Lo que escribas en esta copia se pierde en la siguiente generacion y, peor, queda
> en desacuerdo con el SDK que de verdad usa el servicio. Si la version de arriba no
> coincide con el SDK que tienes instalado, NO te fies de este fichero:
> `./comprobar-entorno.sh` lo comprueba y te avisa.

---

---
name: aybar-starter-logging
description: Rules for using `aybar-starter-logging` (Aybar SDK logging starter): JSON logs, correlation ID end-to-end, MDC, credential deny + PII masking, rotating file appender, opt-in circuit breaker/retry registries. Use when configuring `aybar.logging.*`, when a log line must carry the correlation ID, when deciding what may be logged, or when wrapping an outbound call with a circuit breaker.
---

# aybar-starter-logging

Logs corporativos del SDK Aybar: salida JSON estructurada, correlation ID de
punta a punta y protección de credenciales y PII **antes** de que la línea se
escriba. Además expone, de forma opt-in, los registros de circuit breaker y
retry de Resilience4j para llamadas salientes.

Es el starter que instalan **todos** los servicios del portal: es la base de la
trazabilidad.

## Qué registra al arrancar

`META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`:

| Autoconfiguración | Condición | Qué aporta |
|---|---|---|
| `AybarLoggingAutoConfiguration` | `aybar.logging.habilitado=true` (default) | `ConfiguradorLogsJson` (encoder logstash + nivel de `com.aybarsac`) y, en aplicaciones servlet, el `FilterRegistrationBean<FiltroCorrelacion>` |
| `AybarResilienceAutoConfiguration` | `aybar.logging.resilience.enabled=true` **y** `CircuitBreakerRegistry` en el classpath | beans `CircuitBreakerRegistry` y `RetryRegistry` con los defaults corporativos |

`META-INF/spring/org.springframework.boot.env.EnvironmentPostProcessor.imports`:

| EnvironmentPostProcessor | Qué hace |
|---|---|
| `AybarActuatorEnvironmentPostProcessor` | Publica `management.endpoint.health.probes.enabled=true` con `addLast`, o sea como **defecto**: cualquier valor explícito del consumidor gana. Si Actuator no está en el classpath, la property no tiene efecto. |

> **Aviso (deuda técnica — DT-002):** en Spring Boot 3.x, este formato de
> `.imports` **no se lee para `EnvironmentPostProcessor`**, solo para
> `AutoConfiguration`. `EnvironmentPostProcessorsFactory.fromSpringFactories` solo
> carga `META-INF/spring.factories`; en una corrida real el EPP no llega a
> ejecutarse (verificado en el bytecode de `spring-boot-3.5.3.jar`). El test
> `AybarActuatorEnvironmentPostProcessorTest` instancia la clase a mano contra un
> `MockEnvironment`, así que tampoco lo detecta. Consecuencia práctica: este
> starter **no** publica el default por sí solo. La property la pone
> `aybar-starter-config` (`AybarActuatorDefaults`, mismo nombre de variable,
> `META-INF/spring.factories` bajo `org.springframework.context.ApplicationListener`),
> que es donde el fix debe acabar cuando se haga (mismo patron que
> `fc45ef4` aplicó a `aybar-starter-web`). Un servicio que use
> `aybar-starter-logging` **sin** `aybar-starter-config` no recibe el default.

`FiltroCorrelacion` se registra con orden `Ordered.HIGHEST_PRECEDENCE + 10`, por
delante de la cadena de Spring Security, para que los logs de seguridad ya
lleven `correlationId`.

## Prefijo de propiedades

`aybar.logging.*`. Este starter no gobierna ningún otro prefijo.

| Propiedad | Tipo | Default | Descripción |
|---|---|---|---|
| `aybar.logging.habilitado` | `boolean` | `true` | Apaga el starter entero: sin encoder JSON y sin filtro de correlación. |
| `aybar.logging.json` | `boolean` | `true` | Salida JSON logstash por consola. En `false` no se registra `ConfiguradorLogsJson`. |
| `aybar.logging.archivo.habilitado` | `boolean` | `false` | Appender de archivo JSON rotado. |
| `aybar.logging.archivo.directorio` | `String` | `./logs` | Directorio base del archivo. La variable de entorno `AYBAR_LOG_DIR`, si existe, **gana sobre esta property**. |
| `aybar.logging.archivo.tamano-maximo` | `String` | `100MB` | Tamaño por archivo antes de rotar, en formato Logback. |
| `aybar.logging.archivo.dias-retencion` | `int` | `30` | Días de historial que se conservan. |
| `aybar.logging.resilience.enabled` | `boolean` | `false` | Opt-in de los registries de Resilience4j. |
| `aybar.logging.resilience.circuit-breaker.failure-rate-threshold` | `float` | `50` | Porcentaje de fallos que abre el circuito. |
| `aybar.logging.resilience.circuit-breaker.wait-duration-in-open-state` | `Duration` | `10s` | Espera del circuito abierto antes de pasar a half-open. |
| `aybar.logging.resilience.circuit-breaker.sliding-window-size` | `int` | `20` | Tamaño de la ventana deslizante de llamadas. |
| `aybar.logging.resilience.circuit-breaker.minimum-number-of-calls` | `int` | `10` | Llamadas mínimas antes de evaluar la tasa de fallo. |
| `aybar.logging.resilience.retry.max-attempts` | `int` | `3` | Intentos totales, incluido el primero. |
| `aybar.logging.resilience.retry.wait-duration` | `Duration` | `500ms` | Espera entre reintentos. |

Fuente: `AybarLoggingProperties` y `AybarResilienceProperties`. No hay más
propiedades en este starter.

### Variables de entorno que lee

| Variable | Efecto |
|---|---|
| `AYBAR_LOG_DIR` | Sustituye a `aybar.logging.archivo.directorio` cuando el appender de archivo está activo. |
| `AYBAR_LOG_LEVEL` | Fija el nivel del logger `com.aybarsac`. Sin ella: `DEBUG` si el perfil activo incluye `local`, `INFO` en cualquier otro caso. |

Además del nivel de `com.aybarsac`, el starter fija `org.springframework` en
`WARN`. Los dos niveles se aplican con `aplicarNivelSiNoExplicito`: solo si el
logger no tiene ya un nivel puesto. Un nivel declarado en el `application.yml`
del servicio gana siempre.

## Instalación

Sin `<version>`: la gobierna `aybar-bom`.

```xml
<dependency>
  <groupId>com.aybarsac.sdk</groupId>
  <artifactId>aybar-starter-logging</artifactId>
</dependency>
```

## Dependencias opcionales que activa el consumidor

Ninguna es obligatoria. El starter arranca sin todas ellas.

| Artefacto | Qué activa al añadirlo |
|---|---|
| `org.springframework:spring-web` + `jakarta.servlet:jakarta.servlet-api` | El `FiltroCorrelacion`. Ya vienen con `spring-boot-starter-web`. Sin ellos no hay correlación HTTP. |
| `org.springframework.boot:spring-boot-starter-actuator` | Hace efectiva la property `management.endpoint.health.probes.enabled` que publica el starter. |
| `io.github.resilience4j:resilience4j-circuitbreaker` **y** `io.github.resilience4j:resilience4j-retry` | Junto con `aybar.logging.resilience.enabled=true`, registra `CircuitBreakerRegistry` y `RetryRegistry`. |

## Correlación: contrato exacto

| Constante de `CorrelacionIds` | Valor |
|---|---|
| `HEADER` | `X-Correlation-Id` |
| `MDC_CORRELACION` | `correlationId` |
| `MDC_USUARIO` | `usuario` |
| `MDC_COMPANY` | `companyId` |
| `MDC_SERVICIO` | `servicio` |

`FiltroCorrelacion` lee `X-Correlation-Id` de la petición; si falta, **genera un
UUID**. Lo pone en el MDC y lo devuelve en el header de respuesta. Al terminar
la petición limpia `correlationId`, `usuario` y `companyId` del MDC.

### Formato aceptado del `X-Correlation-Id` entrante

El valor recibido es texto libre del cliente y acaba en logs, respuestas y
auditoría, así que se filtra con `CorrelacionIds.esAceptable(valor)` (tras
recortar espacios):

1. **Un UUID canónico se acepta siempre**: `8-4-4-4-12` hexadecimal, en
   minúsculas o mayúsculas (`UUID.toString()`, `crypto.randomUUID()`), aunque
   tenga 8 o más dígitos seguidos.
2. **Cualquier otro valor** debe cumplir `^[A-Za-z0-9._-]{1,64}$` **y no**
   contener 8 o más dígitos seguidos (forma de un DNI).
3. Si no cumple, **se ignora y se genera un UUID**: la petición no se rechaza y
   el valor descartado no aparece en ningún sitio.

La excepción del UUID existe porque alrededor del 8 % de los UUID aleatorios
trae 8 o más dígitos seguidos en su primer o último grupo: con la regla anti-DNI
aplicada a ciegas, el servicio siguiente descartaba el UUID que había generado
el anterior y la traza se partía en dos (lo vigila un test con 100 000 UUID).
Un DNI no llega con forma de UUID por accidente.

Qué usar en cada lado:

- `CorrelacionIds.generar()` para un id nuevo: siempre es aceptable.
- `CorrelacionIds.normalizar(recibido)` para un valor de fuera (cabecera HTTP,
  cabecera de un mensaje): devuelve el recibido si es aceptable o uno nuevo.
- Un cliente que genere su propio id (un frontend) puede mandar un UUID
  (`crypto.randomUUID()`) o un texto `^[A-Za-z0-9._-]{1,64}$` sin 8 dígitos
  seguidos. Con cualquier otra cosa, el backend lo sustituye y el front deja de
  poder casar su id con los logs: que lea el `X-Correlation-Id` de la respuesta.

`aybar-starter-client` (`InterceptorCorrelacion`) aplica la misma regla al
salir: un valor del MDC que no sea aceptable no se propaga y se envía uno nuevo.

Quien rellena `usuario`, `companyId`, `userAccountId` y `sid` es
`aybar-starter-security` (`FiltroMdcUsuario`); este starter solo aporta
`correlationId` y `servicio`.

## Protección de credenciales y PII

Dos mecanismos distintos, con acciones distintas. La lista de reglas está fija
en `ConfigGlobal` y no es configurable por properties.

| Mecanismo | Acción | Reglas |
|---|---|---|
| `CredentialTurboFilter` (todo el `LoggerContext`) | **DENY**: la línea no se escribe en ningún appender | `jwt` (base64 con prefijo `eyJ`), `auth_scheme` (Bearer/Basic con umbral de entropía), `authorization_header`, `cookie_header` |
| Masking del encoder | **Enmascara** el valor dentro del JSON | `dni` → `********`, `email` → `****@****` |

`PiiConfiguration.extendCategory(categoria, regla)` **añade** reglas a una
categoría de datos personales. No existe operación para reemplazar las reglas
de fábrica de `dni` ni de `email`.

**Los dos mecanismos no tienen el mismo alcance, y la diferencia importa.** El
`CredentialTurboFilter` se registra en el `LoggerContext`, así que protege
**todos** los appenders, incluidos los que agregue el consumidor por su cuenta.
El enmascarado vive en el `MaskingJsonGeneratorDecorator` del encoder del SDK:
un appender externo con su propio encoder **no** queda enmascarado. Si añades un
appender propio, o le pones este mismo encoder, o asume que por ahí pueden salir
DNI y emails sin enmascarar.

### Excepción: el log de eventos de auditoría (`LogAuditoria`)

`aybar-starter-audit` escribe en el log el JSON de sus eventos (publicador por
defecto y volcados de último recurso). Ese JSON ya pasó su lista blanca no-PII,
y la máscara de DNI (`\b\d{8}\b`) lo corrompía: un `PartyRef(40123456)` o un
UUID cuyo primer bloque es numérico salían como `********`. Por eso el campo
`mensaje` **no** pasa por los maskers de valor cuando el evento cumple las dos
condiciones:

- lleva el marcador SLF4J `LogAuditoria.MARCADOR` (`AYBAR_AUDITORIA`), **y**
- su logger está bajo `com.aybarsac.sdk.audit.` (`LogAuditoria.PREFIJO_LOGGER`).

El marcador desde cualquier otro logger no exime de nada. La exención alcanza
**solo** a `mensaje`: el MDC (`usuario`, `companyId`…) y el `stacktrace` se
siguen enmascarando, y el `CredentialTurboFilter` se aplica igual. Reservado al
starter de auditoría: no lo uses en código de servicio.

## Errores y situaciones de fallo

- **`aybar.logging.resilience.enabled=true` sin Resilience4j en el classpath**:
  `AybarResilienceAutoConfiguration` no se activa (`@ConditionalOnClass`) y no
  hay `CircuitBreakerRegistry`. No falla el arranque; el bean simplemente no
  existe y quien lo inyecte recibirá un error de dependencia no satisfecha.
- **`aybar.logging.habilitado=false`**: no se registra el encoder JSON ni el
  filtro. Los logs salen con el formato por defecto de Spring Boot y **sin**
  `correlationId`.
- **Una línea con credencial no se escribe**. Si un log "desaparece", la causa
  es `CredentialTurboFilter`: contenía un JWT, una cabecera `Authorization` o
  una cookie.
- **`AYBAR_LOG_LEVEL` con un valor no reconocido**: se aplica `INFO`
  (`Level.toLevel(override, Level.INFO)`), sin error.
- **Nivel ya fijado por el consumidor**: el starter no lo pisa. Si el servicio
  declara el nivel de `com.aybarsac` en su `application.yml`, manda el servicio.

El circuit breaker y el retry **no se aplican solos a nada**. Este starter
expone los registries; envolver una llamada es una decisión explícita por
dependencia:

```java
String respuesta = AybarResilience.ejecutar(
        circuitBreakers, retries, "servicio-cuotas",
        () -> clientes.para(url).get().uri("/cuotas").retrieve().body(String.class));
```

Cada `nombre` distinto obtiene su propia instancia y su propio estado dentro del
registry.

## Qué NO hacer

- **No** registres otro `FiltroCorrelacion` ni otro `FilterRegistrationBean` de
  ese tipo: el bean lleva `@ConditionalOnMissingBean` y el tuyo lo sustituiría,
  perdiendo el orden `HIGHEST_PRECEDENCE + 10`.
- **No** uses un breaker global para todas las llamadas salientes. Un
  breaker por dependencia, con su nombre propio; un breaker global es el
  antipatrón que Resilience4j vino a corregir.
- **No** escribas tokens, cabeceras `Authorization`, cookies, DNI ni emails en
  los logs esperando verlos: el filtro deniega la línea entera o enmascara el
  valor. Loguea identificadores subrogados.
- **No** definas `correlationId` a mano en el MDC en un controlador. Lo pone el
  filtro, y lo limpia al terminar la petición.
- **No** copies tu propia regla del formato del correlation ID (otra regex, otro
  generador): usa `CorrelacionIds.esAceptable`, `normalizar` y `generar`, o los
  servicios dejarán de casar sus trazas.
- **No** desactives `aybar.logging.json` en un entorno desplegado: el
  agregador de logs corporativo espera JSON.
- **No** pongas el nivel de `com.aybarsac` en `DEBUG` fuera de `local`.

## Qué NO cubre este starter

- Contexto corporativo del JWT y MDC de usuario -> `aybar-starter-security`.
- RFC 7807 y códigos de error -> `aybar-starter-web`.
- Eventos de auditoría con lista blanca -> `aybar-starter-audit`.
- Cliente HTTP entre servicios -> `aybar-starter-client`.
- Correlación en el consumidor de Kafka -> `aybar-starter-messaging`
  (`ConsumerMdcInterceptor`).
