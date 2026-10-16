Variables de entorno de aybar-atc
=====================================

Esta guia lista **solo** las variables que este servicio usa de verdad, segun los starters
con los que se genero. La plantilla lista para copiar esta en `.env.example`, y
`comprobar-entorno.sh` / `comprobar-entorno.ps1` avisan de lo que falta antes de arrancar.

Los mensajes de error que aparecen abajo estan **verificados empiricamente**: se obtuvieron
arrancando un servicio real con `java -jar` y quitando cada variable. Estan copiados tal cual
para que se puedan buscar en un log.


Como llega una variable a la configuracion
------------------------------------------

No hay un mecanismo unico, y saber cual aplica ahorra mucho tiempo cuando algo no toma efecto.
Estos son, por orden de "cuanto tiene que ver el SDK":

**1. El unico alias propio del SDK.** `EnvironmentVariablesPostProcessor` de
`aybar-starter-config` traduce nombres `AYBAR_*` a propiedades de Spring, y su tabla tiene
**una sola entrada**, la de la base de datos. Cualquier otra cosa que hayas leido sobre
"variables que el SDK mapea" ya no es cierta.


    AYBAR_DATASOURCE_URI  ->  spring.datasource.url


**2. Las que interpola el `application.yml` de este servicio.** No las conoce el SDK: estan
escritas como `${VARIABLE:valor-por-defecto}` en el yml, asi que el valor por
defecto sale del propio fichero y lo puedes cambiar ahi. En este servicio son:

- `SERVER_PORT`

- `AYBAR_KAFKA_BOOTSTRAP`


- `AYBAR_ISSUER_URI`
- `AYBAR_JWT_AUDIENCE`
- `AYBAR_CORS_ORIGENES`

- `AYBAR_CLIENT_HOSTS_CON_TOKEN`


**3. La conversion automatica de Spring Boot** (*relaxed binding*), que vale para cualquier
propiedad `aybar.*`: pon el nombre en mayusculas y cambia los puntos por guiones bajos.
`AYBAR_LOGGING_JSON` llega asi a `aybar.logging.json`. Aqui cae la mayoria.

**Y si la propiedad lleva guiones, valen las dos formas.** Para `aybar.client.hosts-con-token`
funcionan igual de bien:

    AYBAR_CLIENT_HOSTSCONTOKEN      (la regla canonica: los guiones se eliminan)
    AYBAR_CLIENT_HOSTS_CON_TOKEN    (el guion pasa a guion bajo)

Comprobado arrancando el servicio con cada una por separado y mirando que valor quedaba
bindeado en `/actuator/configprops`, y repetido con `aybar.data.postgres.fallback-h2`
(`AYBAR_DATA_POSTGRES_FALLBACKH2` y `AYBAR_DATA_POSTGRES_FALLBACK_H2`): las dos surten efecto.
Si por descuido defines las **dos a la vez** con valores distintos, gana la forma sin guiones
bajos, la canonica. En este proyecto se usa la segunda forma porque se lee mejor, pero si te
encuentras la primera en otra documentacion, no esta mal.

> **La trampa del punto 3.** Esa conversion resuelve **cualquier** nombre, exista o no la
> propiedad: `AYBAR_COSA_INVENTADA` se convierte igual de bien en `aybar.cosa.inventada`, y
> como nadie la lee, no pasa nada. **Una variable mal escrita no produce ni error ni aviso al
> arrancar.** Por eso conviene fiarse de esta tabla y no de la memoria.


**4. Lectura directa dentro de un starter.** Un caso, y conviene saberlo porque desordena lo
anterior: `AYBAR_MONGO_URI` **no** esta interpolada en el `application.yml` (ahi solo aparece
en comentarios) ni pasa por `aybar.data.mongo.uri`. La lee `aybar-starter-data` llamando a
`System.getenv` y la publica en `spring.data.mongodb.uri`.



Base: siempre presentes
-----------------------

| Variable | Obligatoria | Quien la exige | Formato | Si falta |
|---|---|---|---|---|
| `SPRING_PROFILES_ACTIVE` | Si, en todo despliegue | Spring Boot (no tiene valor por defecto en el `application.yml`) | `local`, `dev` o `prod` | El servicio arranca **sin perfil**, que el SDK trata como entorno real y avisa al arrancar: lo de abajo pasa a ser obligatorio. Nunca cae en `local`. En local la ponen `aybar run`, el `.env.example`, `ApplicationTest` (`@ActiveProfiles`) y `./mvnw -pl boot spring-boot:run` (perfil Maven de `boot/pom.xml`) |
| `SERVER_PORT` | No | El `application.yml` de este servicio | numero 1-65535 | Vale `8081` |
| `AYBAR_LOGGING_JSON` | No | `aybar-starter-logging` | `true` o `false` | Vale `true`: los logs salen en el JSON corporativo. Con `false` salen en texto plano |
| `AYBAR_LOGGING_RESILIENCE_ENABLED` | No | `aybar-starter-logging` | `true` o `false` | No se registran los circuit breakers. Ademas **solo tiene efecto si el `pom.xml` declara Resilience4j**, que el archetype no declara |

El perfil manda mas de lo que parece: en `local` el `application.yml` trae valores por defecto
para casi todo, y fuera de `local` no. Por eso casi ninguna variable es obligatoria mientras
desarrollas y casi todas lo son al desplegar. `SPRING_PROFILES_ACTIVE` la lee Spring Boot
directamente y **no tiene defecto**: un despliegue que la olvide arranca sin perfil, con las
mismas exigencias que `prod`, en vez de caer en silencio en `local` con H2 y sin emisor.


aybar-starter-data
------------------

| Variable | Obligatoria | Quien la exige | Formato | Si falta |
|---|---|---|---|---|
| `AYBAR_DATASOURCE_URI` | Si, fuera de `local` | `aybar-starter-data` (alias del SDK, familia 1) | `jdbc:postgresql://usuario:clave@host:puerto/base` | En `local` se usa un H2 en memoria y no pasa nada. Fuera de `local` el arranque se detiene sin fuente de datos |
| `AYBAR_MONGO_URI` | No | `aybar-starter-data` (lectura directa, familia 4) | `mongodb://usuario:clave@host:puerto/base` | El servicio no habla con Mongo |

**El prefijo `jdbc:` no es opcional.** Con la forma corta el arranque falla asi, comprobado:

    Factory method 'dataSource' threw exception with message: 'url' must start with "jdbc"

y el SDK anade su propio diagnostico:

    Could not initialize the service DataSource. This usually means the database is
    unreachable, credentials are wrong, the JDBC driver is missing or the declared URL
    is invalid.

Las credenciales van **dentro** de la URI. El SDK la parte al arrancar y publica usuario y
clave en `spring.datasource.username` y `spring.datasource.password`, de forma que el secreto
no se queda dentro de `spring.datasource.url`.

**Trampa conocida de `AYBAR_MONGO_URI` en el perfil `local`.** El `application.yml` generado
excluye la autoconfiguracion de Mongo mientras no la necesites. Si exportas la variable sin
quitar antes esas dos exclusiones, el arranque se cae con un mensaje que no menciona ni Mongo
ni la variable como causa:

    Included health contributor 'mongo' in group 'readiness' does not exist

El motivo es que el SDK ve la variable y mete `mongo` en el grupo `readiness`, pero el
contribuidor de salud no existe porque la autoconfiguracion esta excluida. La solucion es la
que dice el propio yml: exportar la variable **y** borrar las dos lineas de `exclude`.



aybar-starter-messaging
-----------------------

| Variable | Obligatoria | Quien la exige | Formato | Si falta |
|---|---|---|---|---|
| `AYBAR_KAFKA_BOOTSTRAP` | Si, fuera de `local` | `aybar-starter-messaging` (interpolada en el yml, familia 2) | `host:puerto`, o varios separados por comas | **El servicio no arranca**, con el mensaje de abajo |

Mensaje literal, comprobado quitando la propiedad y tambien dejandola vacia (el resultado es
identico en los dos casos):

    org.springframework.beans.factory.BeanCreationException: Error creating bean with name
    'aybarEventProducer' defined in class path resource
    [com/aybarsac/sdk/messaging/AybarMessagingAutoConfiguration.class]: Failed to instantiate
    [com.aybarsac.sdk.messaging.AybarEventProducer]: Factory method 'aybarEventProducer' threw
    exception with message: spring.kafka.bootstrap-servers (AYBAR_KAFKA_BOOTSTRAP) es
    obligatorio: sin este valor el arranque no puede continuar

Lo lanza `AybarMessagingAutoConfiguration.aybarEventProducer`. Es un buen mensaje: nombra la
propiedad **y** la variable de entorno. El valor por defecto `localhost:9092` de Spring Boot no
salva el arranque, porque el starter comprueba la propiedad de forma explicita.



aybar-starter-security
----------------------

| Variable | Obligatoria | Quien la exige | Formato | Si falta |
|---|---|---|---|---|
| `AYBAR_ISSUER_URI` | Si, fuera de `local` | `aybar-starter-security` (interpolada en el yml, familia 2) | URL del emisor OIDC (issuer), sin barra final | **El servicio no arranca**, con el mensaje de abajo. En `local` arranca sin emisor: lo publico responde y lo protegido da 401 (ver abajo) |
| `AYBAR_JWT_AUDIENCE` | Si, fuera de `local` | `aybar-starter-security` (interpolada en el yml como `spring.security.oauth2.resourceserver.jwt.audiences`, familia 2) | una audiencia, o varias separadas por comas | Sin valor por defecto fuera de `local`: **ningun token se acepta** (fail-closed). En `local` vale `aybar-atc` |
| `AYBAR_CORS_ORIGENES` | No | `aybar-starter-security` (interpolada en el yml, familia 2) | origenes exactos separados por comas (`https://app.ejemplo.com`), sin `*`, sin ruta | CORS apagado: el navegador corta las llamadas de un frontend servido desde otro origen. Un `*`, `null` o un origen con ruta **abortan el arranque** nombrando `aybar.security.cors.origenes-permitidos` |

Mensaje literal, comprobado quitando la propiedad y tambien dejandola vacia:

    ***************************
    APPLICATION FAILED TO START
    ***************************

    Description:

    Method aybarSecurityFilterChain in com.aybarsac.sdk.security.AybarSecurityAutoConfiguration
    required a bean of type 'org.springframework.security.oauth2.jwt.JwtDecoder' that could not
    be found.

    Action:

    Consider defining a bean of type 'org.springframework.security.oauth2.jwt.JwtDecoder' in
    your configuration.

**Este mensaje no nombra `AYBAR_ISSUER_URI` en ningun punto**, y su "Action" lleva a escribir un
bean, que es justo lo que no hay que hacer. Si lo ves en un despliegue, lo que falta es la
variable.

En el perfil `local` la variable es opcional. El `application.yml` trae como defecto
`http://emisor-no-configurado.invalid`, un dominio reservado que nunca resuelve, y Spring Boot
construye el `JwtDecoder` de forma perezosa: el arranque no contacta al emisor. Lo publico
(bienvenida, health, OpenAPI) responde y lo protegido devuelve 401 sin token, que es lo que
espera el login demo del frontend. Una peticion **con** token tambien se rechaza, y el log
registra el fallo al resolver `emisor-no-configurado.invalid`: para validar tokens reales,
define la variable con el emisor OIDC que fije el ADR.

**La audiencia (`AYBAR_JWT_AUDIENCE`).** El emisor firma tokens para muchas aplicaciones con el
mismo `iss`; sin comprobar el claim `aud`, un token emitido para otra aplicacion se aceptaria
aqui con sus roles. Por eso el `application.yml` la declara como el issuer: sin valor por
defecto fuera de `local`. Su valor es el que el emisor ponga en `aud` para este servicio (en
Keycloak hace falta un mapper de tipo *Audience* en el cliente o en un client scope; sin el,
`aud` no lleva el servicio y el token se rechaza). En `local` vale el nombre del servicio,
`aybar-atc`: si pruebas con un emisor de desarrollo, que emita esa audiencia o exporta la que
emita.



aybar-starter-client
--------------------

| Variable | Obligatoria | Quien la exige | Formato | Si falta |
|---|---|---|---|---|
| `AYBAR_CLIENT_TOKEN_URI` | No, pero obligatoria si defines `CLIENT_ID` | `aybar-starter-client` (familia 3) | URL del token endpoint | Ver la nota de abajo |
| `AYBAR_CLIENT_CLIENT_ID` | No | `aybar-starter-client` (familia 3) | texto | No se pide token propio |
| `AYBAR_CLIENT_CLIENT_SECRET` | No | `aybar-starter-client` (familia 3) | texto | No se pide token propio |
| `AYBAR_CLIENT_HOSTS_CON_TOKEN` | Si, para llamar con token | `aybar-starter-client` (interpolada en el yml como `aybar.client.hosts-con-token`, familia 2) | lista separada por comas de hosts exactos o sufijos con punto inicial (`.ejemplo.com`) | **No se adjunta el token a ningun destino**: las llamadas salen sin `Authorization` y la API de destino responde 401 |

Sin ninguna de las tres primeras el servicio **arranca con normalidad**, y el interceptor
**sigue montado**: propaga el `X-Correlation-Id` y reenvia el bearer del usuario a los hosts de
`AYBAR_CLIENT_HOSTS_CON_TOKEN`. Lo unico que no hace es pedir un token propio, porque no existe
el proveedor de client-credentials.

Las dos primeras van juntas. Definir `AYBAR_CLIENT_CLIENT_ID` sin `AYBAR_CLIENT_TOKEN_URI`
**tumba el arranque**:

    Error creating bean with name 'proveedorTokenClientCredentials' ...
    Factory method 'proveedorTokenClientCredentials' threw exception with message:
    aybar.client.token-uri es obligatorio para client-credentials

**`AYBAR_CLIENT_HOSTS_CON_TOKEN` es una lista de permitidos, y vacia no permite nada.** Sin
ella el servicio arranca, pero el `Authorization` no se adjunta a ningun destino: ni el bearer
del usuario ni el token propio. El sintoma es un 401 de la API a la que llamas, no un error en
este servicio. Es lo seguro por defecto (el token nunca viaja a un tercero por olvido): declara
los hosts de las APIs internas a las que este servicio llama con token.



aybar-starter-audit
-------------------

| Variable | Obligatoria | Quien la exige | Formato | Si falta |
|---|---|---|---|---|
| `AYBAR_AUDIT_NDJSON_DIR` | No | `aybar-starter-audit` (familia 3) | ruta absoluta de un directorio | Ver la nota de abajo |
| `AYBAR_AUDIT_S3_BUCKET` | No | `aybar-starter-audit` (familia 3) | nombre del bucket | Ver la nota de abajo |
| `AYBAR_AUDIT_S3_ENDPOINT` | No | `aybar-starter-audit` (familia 3) | URL | En AWS se deja sin definir |
| `AYBAR_AUDIT_S3_ACCESS_KEY` | No | `aybar-starter-audit` (familia 3) | texto | En AWS se usa el rol de la tarea |
| `AYBAR_AUDIT_S3_SECRET_KEY` | No | `aybar-starter-audit` (familia 3) | texto | En AWS se usa el rol de la tarea |

**Ninguna es obligatoria, y el servicio arranca sin definir ninguna.** Lo que hay que saber es
que entonces la auditoria no se apaga: queda activo un publicador que escribe los eventos **en
el log de la aplicacion**. No se pierde nada, pero tampoco queda en un soporte aparte, que
suele ser justo lo que auditoria espera.

El destino se elige por precedencia, comprobada mirando que bean queda registrado:

    S3 (si hay bucket Y el AWS SDK en el classpath)  >  NDJSON (si hay dir)  >  log

**El aviso importante sobre S3.** El `pom.xml` que genera el archetype **no declara**
`software.amazon.awssdk:s3`. Sin esa dependencia la condicion de S3 no se cumple nunca, asi que
`AYBAR_AUDIT_S3_BUCKET` **se ignora en silencio**: definirla sola deja el publicador de log, y
definirla junto con `AYBAR_AUDIT_NDJSON_DIR` deja NDJSON. No hay ningun mensaje que lo diga.
Comprobado en los dos sentidos: anadiendo la dependencia, S3 gana como esta documentado.

El directorio de `AYBAR_AUDIT_NDJSON_DIR` **no se crea al arrancar**, sino al escribir el primer
evento. Que no exista despues de arrancar no significa que este mal configurado.


Variables retiradas que siguen circulando
-----------------------------------------

Estas aparecen en documentacion antigua y en algunas skills del repositorio del SDK. **No hacen
nada.** Peor: como Spring las convierte igual en una propiedad, se quedan puestas sin que nada
proteste, y quien las escribe cree que estan surtiendo efecto.

| Variable | Estado | Que usar en su lugar |
|---|---|---|
| `AYBAR_RESILIENCE_ENABLED` | Retirada. Comprobado que no hace nada ni siquiera con Resilience4j en el classpath | `AYBAR_LOGGING_RESILIENCE_ENABLED` |
| `AYBAR_REDIS_URI` | Nunca existio en el codigo: no hay starter de Redis | nada |
| `AYBAR_DISCOVERY_MODO` | Nunca existio en el codigo: no hay starter de discovery | nada |

| `AYBAR_DATASOURCE_USER` | Retirada, fusionada dentro de la URI | `AYBAR_DATASOURCE_URI` |
| `AYBAR_DATASOURCE_PASSWORD` | Retirada, fusionada dentro de la URI | `AYBAR_DATASOURCE_URI` |
| `AYBAR_DATASOURCE_URL` (con L) | Nunca existio: el alias es `..._URI` | `AYBAR_DATASOURCE_URI` |

Que `AYBAR_DATASOURCE_USER` y `AYBAR_DATASOURCE_PASSWORD` se ignoran esta comprobado de la forma
menos ambigua posible: con una URI **sin** credenciales y las dos variables puestas con los
valores correctos, PostgreSQL responde

    org.postgresql.util.PSQLException: The server requested SCRAM-based authentication, but no
    password was provided.

es decir, que no se le paso ninguna contrasena.



Antes de arrancar
-----------------

    ./comprobar-entorno.sh          # bash, macOS y Linux
    .\comprobar-entorno.ps1         # Windows PowerShell

Revisan lo que este servicio necesita de verdad segun sus starters, avisan de lo que falta y
devuelven un codigo de salida distinto de cero si algo obligatorio no esta. Sirven tambien en un
arranque de CI, antes de levantar el contenedor.


Frontend (`frontend/`)
----------------------

El frontend no lee el `.env` de la raiz: se construye con Node, y lo que se compila acaba
en el navegador.

Instalar las dependencias no pide **ninguna** variable ni credencial: los `@aybarcorp/*` estan
en `frontend/paquetes/` (se commitea) y `package.json` los toma con `file:`, asi que `npm ci`,
`npm install`, `aybar install`, la imagen Docker y el CI no hablan con GitHub Packages. No
hace falta `NODE_AUTH_TOKEN` (la pedian los proyectos generados con el SDK 0.4.x).

| Variable | Donde | Obligatoria | Para que |
|---|---|---|---|
| `AYBAR_FRAMEWORK_HOME` | Entorno de la terminal, para la CLI `aybar` | No | Carpeta donde la CLI guarda el framework descargado (por defecto `~/.aybar/framework`). El build del frontend no la lee |

Las variables `VITE_*` (React + Vite) y lo que se escriba en un `environment.ts` (Angular) se
**incrustan en el bundle**: cualquiera que abra la aplicacion las lee. Ahi va configuracion
publica (URL de la API, emisor OIDC, `clienteId` del cliente publico), nunca un secreto. Un
cliente publico con PKCE no tiene `client_secret`: si el front parece necesitar uno, el diseño
esta mal. El guardian de PII del agente corta una variable `VITE_*` o `NEXT_PUBLIC_*` con
nombre de secreto.
