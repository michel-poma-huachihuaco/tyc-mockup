# aybar-atc

Microservicio **Spring Boot 3 / Java 21** con **arquitectura hexagonal** (puertos y
adaptadores), generado con la plantilla `aybar-service-template` del Aybar SDK
`0.7.1`. Paquete base: `com.aybarsac.atc`. Puerto HTTP: `8081`.

> **Empieza por `AGENTS.md`** (contexto para personas y para la IA) y por las skills
> selladas de `docs/skills/`, que dicen como se usa cada starter de este servicio.

Es un **monorepo**: el backend es el reactor Maven de la raiz (secciones 1 a
11) y el frontend vive en `frontend/` (seccion siguiente). Comparten ticket,
ramas, gates, guardianes y pipeline; no comparten codigo: se hablan por HTTP,
con el contrato OpenAPI de `docs/arquitectura/`.

## Frontend (`frontend/`)

Proyecto Node aparte (`frontend/package.json`, Node 22) sobre el framework
`@aybarcorp/*` `0.3.0`, instalado con version exacta.

- UI: **Angular 22**, standalone y sin zone.js (entrada `frontend/src/main.ts`).

- Papel: **app**. Aplicacion autonoma, sin federacion.

```bash
aybar run --frontend                 # servidor de desarrollo en http://localhost:4200
cd frontend && npm install           # sin la CLI: dependencias, sin credenciales
npm run dev                          # sin la CLI: servidor de desarrollo
npm run build                        # build de produccion en frontend/dist/
npm run lint
aybar framework cli doctor           # instalacion del framework (sale con 1 si hay errores)
aybar framework actualizar           # lleva el framework del proyecto a la version que fija el SDK
```

Los `@aybarcorp/*` que usa el proyecto estan en `frontend/paquetes/`, que se
commitea: `package.json` los toma con `file:paquetes/...` y el lockfile fija su
integridad. Por eso `npm`, los comandos `aybar`, la imagen Docker y el CI
instalan sin ningun token ni permiso de paquetes. Esos `.tgz` salen del release
del framework en GitHub, que la CLI `aybar` descarga con la sesion de `gh` de
quien genera o actualiza el proyecto; para eso basta con acceso de lectura al
repositorio del framework. `frontend/.npmrc` solo apunta el scope `@aybarcorp` a
GitHub Packages, para que un `npm install @aybarcorp/x` por nombre falle a la
vista en vez de resolverse en npmjs.org. Para cambiar de version: `aybar
framework actualizar`.

| Necesitas | Usa |
|---|---|
| Componentes y estilos | `@aybarcorp/ui` (React) o `@aybarcorp/ui-angular` (Angular, componentes standalone `<ay-*>`) y los tokens `--aybar-*` |
| Login y sesion | `@aybarcorp/auth`: OIDC Authorization Code + PKCE contra el emisor que fija el ADR; token solo en memoria |
| Llamar al backend | `@aybarcorp/http`: Bearer, `X-Correlation-Id` y errores RFC 7807 como `ErrorAybar` |
| Federacion | `@aybarcorp/shell` y `@aybarcorp/remote`, por import map nativo |

Comandos completos, Docker (nginx sin root) y la CSP de partida:
`frontend/README.md`.

Contenido:

1. [Que es este servicio](#1-que-es-este-servicio)
2. [Como esta construido](#2-como-esta-construido)
3. [El recorrido de una peticion](#3-el-recorrido-de-una-peticion)
4. [Como agregar una funcionalidad](#4-como-agregar-una-funcionalidad)
5. [Configuracion y perfiles](#5-configuracion-y-perfiles)
6. [Starters del SDK](#6-starters-del-sdk)
7. [Arrancar, probar y empaquetar](#7-arrancar-probar-y-empaquetar)
8. [Calidad: pruebas, CI y guardianes](#8-calidad-pruebas-ci-y-guardianes)
9. [Trabajar con IA](#9-trabajar-con-ia)
10. [Mapa de ficheros](#10-mapa-de-ficheros)
11. [Donde pedir ayuda](#11-donde-pedir-ayuda)

---

## 1. Que es este servicio

Un esqueleto **que compila y arranca tal cual** (`./mvnw verify` en verde, sin Docker
ni base de datos en el perfil `local`) y que trae un caso de uso de ejemplo,
`RegistrarEjemplo`, recorriendo todas las capas. Ese ejemplo existe para mostrar
donde va cada cosa: **sustituyelo por tu dominio** en cuanto empieces.

Lo transversal (seguridad, logs, errores, auditoria, configuracion, clientes HTTP,
mensajeria) **no se programa aqui**: lo aportan los starters `aybar-starter-*` del SDK.
Este servicio solo contiene negocio y el cableado minimo hacia esos starters.

## 2. Como esta construido

### 2.1 Un reactor Maven de cinco modulos

Cada modulo es un JAR con su propio `pom.xml`. Las versiones de todas las
dependencias las gobierna `aybar-bom` (importado en el `pom.xml` raiz): **no se
escriben `<version>`** salvo para librerias que el SDK no gestiona.

```
aybar-atc/
|-- domain/          Negocio puro: entidades, value objects y puertos (interfaces).
|-- application/     Casos de uso: orquestan el dominio a traves de los puertos.
|-- adapters/        Frontera con la tecnologia: REST, JPA, Mongo, Kafka, HTTP saliente.
|-- infrastructure/  Configuracion transversal del servicio.
`-- boot/            Punto de entrada: la clase Application, los application*.yml y los tests de arranque.
```

### 2.2 La regla de dependencias

Las flechas apuntan siempre hacia el dominio:

```
adapters  ──►  application  ──►  domain
    │                              ▲
    └──────────────────────────────┘
infrastructure, boot  ──►  todos (ensamblan el servicio)
```

| Modulo | Que va | Puede importar |
|---|---|---|
| `domain` | `model/` (records, entidades), `port/out/` (interfaces que el dominio necesita) | Solo el JDK y, del SDK, `common` y `data.cqrs` |
| `application` | `usecase/`: un caso de uso por operacion, **Java puro** (sin `@Service`) | `domain` |
| `adapters` | `inbound/{rest,messaging}`, `outbound/{persistence,messaging,external,audit,wiring}` | `domain`, `application`, Spring, tecnologia, starters |
| `infrastructure` | Configuracion transversal (`configuration/`) | `domain` + Spring |
| `boot` | `AtcApplication`, `application.yml`, tests | Todos |

No es una convencion de palabra: **la verifica `NormaHexagonalTest`** (ArchUnit, en
`boot/src/test`). El build se pone rojo si:

- el `domain` importa Spring, Kafka, Jakarta o JPA;
- el `domain` importa algo del SDK que no sea `com.aybarsac.sdk.common` o `com.aybarsac.sdk.data.cqrs`;
- un caso de uso de `application` importa algo de `adapters`.

### 2.3 Por que los casos de uso no llevan `@Service`

`application` es Java puro, asi que Spring no los descubre solo. El cableado vive en
`adapters/outbound/wiring/`:

- `CasosDeUsoConfiguracion` declara un `@Bean` por caso de uso y le inyecta el
  adaptador que implementa cada puerto.
- `RegistrarEjemploConductor` envuelve el caso de uso con lo que es de Spring
  (`@Service`, y `@Transactional` cuando haya base de datos). Los controladores
  inyectan el **conductor**, no el caso de uso: la frontera entre capas queda a la vista.

## 3. El recorrido de una peticion

`POST /ejemplos?nombre=hola`, paso a paso:

```
HTTP ─► EjemploController            adapters/inbound/rest       (traduce HTTP ⇄ dominio)
      ─► RegistrarEjemploConductor   adapters/outbound/wiring    (@Service, transacciones)
      ─► RegistrarEjemploUseCase     application/usecase         (regla de negocio, Java puro)
      ─► EjemploRepositorio          domain/port/out             (interfaz: lo que el negocio necesita)
      ◄─ EjemploRepositorioEnMemoria adapters/outbound/persistence (implementacion activa)
```

El repositorio activo es **en memoria** para que el servicio arranque sin
infraestructura. Los demas adaptadores de ejemplo estan escritos pero **no
registrados como bean**: cuando uno sea "el bueno", se anota (`@Repository` /
`@Component`) y se retira el anterior. Cada carpeta tiene un `README.md` que lo explica.

| Adaptador de ejemplo | Donde | Se genera con |
|---|---|---|
| `EjemploRepositorioEnMemoria` | `outbound/persistence/` | Siempre |
| `BienvenidaController` (pagina `/`) | `inbound/rest/` | Siempre |
| `EjemploRepositorioJpa` + `EjemploJpaEntity`, migracion `V1__init.sql` | `outbound/persistence/postgres/` | `data` |
| `EjemploRepositorioMongo` + `EjemploDocumento` (lecturas CQRS) | `outbound/persistence/mongo/` | `data` |
| `EjemploPublicador` (topic `aybar.ejemplo.registrado`) | `outbound/messaging/` | `messaging` |
| `EjemploConsumidor` (`@KafkaListener`) | `inbound/messaging/` | `messaging` |
| `ClienteExternoEjemplo` (RestClient corporativo via `ClientesAybar`) | `outbound/external/` | `client` |
| `RecursosEjemploController` (`/recursos-ejemplo/quien-soy`, `@PreAuthorize`) | `inbound/rest/` | `security` |
| `EjemploAuditableConductor` (evento de negocio fail-closed) | `outbound/audit/` | `audit` |


## 4. Como agregar una funcionalidad

Orden recomendado, de dentro hacia fuera:

1. **Dominio** – el modelo en `domain/.../model/` y, si el negocio necesita algo de
   fuera (guardar, publicar, consultar otro sistema), la **interfaz** en
   `domain/.../port/out/`. Nada de Spring aqui.
2. **Caso de uso** – una clase en `application/.../usecase/` que recibe los puertos
   por constructor. Pruebala con JUnit puro, pasandole implementaciones falsas.
3. **Adaptador de salida** – la implementacion del puerto en `adapters/.../outbound/`
   (JPA, Mongo, Kafka, HTTP). Usa los starters del SDK; no reimplementes lo que ya dan.
4. **Cableado** – un `@Bean` del caso de uso en `CasosDeUsoConfiguracion` y, si hace
   falta Spring alrededor, un conductor como `RegistrarEjemploConductor`.
5. **Adaptador de entrada** – el `@RestController` o el `@KafkaListener` en
   `adapters/.../inbound/`, que llama al conductor.
6. **Verifica** – `./mvnw verify`. Si `NormaHexagonalTest` falla, algo se importo en
   la capa equivocada: el mensaje dice que regla y que clase.

## 5. Configuracion y perfiles

| Fichero | Para que |
|---|---|
| `boot/src/main/resources/application.yml` | Configuracion comun. Cada valor sensible es `${VARIABLE:defecto}`: **cero `password:` en YAML**. |
| `boot/src/main/resources/application-local.yml` | Overrides de tu maquina. Esta en `.gitignore`; la copia versionada es `application-local.yml.example`. |
| `.env.example` | Todas las variables que este servicio usa, listas para copiar a `.env`. |
| `docs/VARIABLES.md` | Cual es obligatoria, su formato y el **mensaje literal** que sale si falta. |

El perfil se elige con `SPRING_PROFILES_ACTIVE`, sin valor por defecto en el
`application.yml`: sin ella el servicio arranca sin perfil, que el SDK trata como
entorno real. `aybar run`, el `.env.example`, los tests y `./mvnw -pl boot spring-boot:run`
piden `local` de forma explicita. En `local` el
servicio arranca sin dependencias externas. Fuera de `local` las variables
obligatorias deben existir: `./comprobar-entorno.sh` lo revisa antes de arrancar.

En `local` los datos van a un H2 en memoria en lugar de PostgreSQL.



## 6. Starters del SDK

### 6.1 Encendidos en este servicio

| Starter | Modulo | Que aporta |
|---|---|---|
| `aybar-starter-common` | `domain` | Tipos Java puro compartidos (base fija) |
| `aybar-starter-config` | `infrastructure` | Perfiles, variables `AYBAR_*`, Secrets Manager, Actuator (base fija) |
| `aybar-starter-logging` | `infrastructure` | Logs JSON con correlationId y filtro de PII (base fija) |
| `aybar-starter-security` | `infrastructure` | Resource server OAuth2: valida el JWT del emisor OIDC que fija el ADR; `@PreAuthorize` activo |
| `aybar-starter-data` | `adapters` | PostgreSQL (escritura) + MongoDB (lectura) + Flyway + CQRS |
| `aybar-starter-messaging` | `adapters` | Kafka corporativo: headers de correlacion, DLQ, reintentos acotados |
| `aybar-starter-client` | `adapters` | RestClient corporativo: propaga correlationId y bearer |
| `aybar-starter-audit` | `adapters` | Auditoria fail-closed (Ley 29733) |
| `aybar-starter-web` | `adapters` | ProblemDetail RFC 7807, OpenAPI/Swagger, handlers 401/403 |


Lo que no esta en esta tabla no esta en el `pom.xml`. **El contrato completo de cada
starter** (propiedades, variables obligatorias, trampas conocidas) esta en
`docs/skills/<starter>.md`, copiado y sellado con la version del SDK.

### 6.2 Agregar un starter o una dependencia despues

**Un starter del SDK se enciende con la CLI**, con el arbol limpio (todo commiteado):

```bash
aybar add starter mensajeria            # o datos, cliente, seguridad, auditoria, web
aybar add starter datos --simular       # que ficheros tocaria, sin escribir nada
git diff                                # revisa lo que ha cambiado
aybar test
```

Aplica al servicio exactamente lo que habria generado `aybar new project` con ese
flag: la `<dependency>`, los bloques del `application.yml`, `.env.example`,
`docs/VARIABLES.md`, `comprobar-entorno`, los adapters de ejemplo y el contrato
sellado en `docs/skills/`. Solo toca los ficheros que cambian con el starter, y si
el equipo ya modifico las mismas lineas los deja con marcas `<<<<<<<` para resolverlos
como cualquier merge (sale con codigo 3). Se apoya en `.aybar/proyecto.properties`:
no lo edites a mano.

Hacerlo a mano solo con el `<dependency>` deja el servicio a medias: varios starters
abortan el arranque si les falta su configuracion, y sin su contrato en `docs/skills/`
la IA trabaja a ciegas con ese starter.

| Si necesitas... | Agregalo a... | ¿`<version>`? |
|---|---|---|
| Un starter `aybar-starter-*` | `aybar add starter <x>` (arriba) | No (lo gobierna `aybar-bom`) |
| Una libreria que ya gestiona Spring Boot o el SDK | El `pom.xml` del modulo que la use | No |
| Una libreria que el SDK no gestiona | El `pom.xml` del modulo que la use | **Si** |
| Un plugin de Maven | `pom.xml` raiz | Segun el plugin |

Para saber si algo ya esta gobernado: `./mvnw help:effective-pom | grep -A 2 <libreria>`.

## 7. Arrancar, probar y empaquetar

**Despues de clonar**, en la raiz: `./instalar.sh` (Windows: `.\instalar.ps1`). Si
falta la CLI `aybar`, dice como instalarla desde la release del SDK y para; si
esta, ejecuta `aybar install`: comprueba la maquina (sin instalar nada), instala el
kit de agentes del equipo en `~/.claude`, baja las dependencias, configura el MCP
de Nexora con tu token y corre el arranque. Ver `AGENTS.md`.

Con la CLI del SDK (funciona desde cualquier carpeta del servicio, en Linux,
macOS y Windows):

```bash
aybar install                       # incorporacion completa: maquina, kit de agentes, dependencias (mvnw install), Nexora, arranque
aybar install --sin-kit --sin-nexora  # sin tocar ~/.claude ni Nexora (la maquina se comprueba igual)
aybar run                           # compila y arranca en el entorno local
aybar run --env dev                 # perfil dev: carga .env y luego .env.dev
aybar run --puerto 8085             # otro puerto (SERVER_PORT)
aybar run --sin-compilar            # arranca sin recompilar los modulos
aybar build                         # jar ejecutable en boot/target/aybar-atc.jar (sin pruebas)
aybar build --con-pruebas           # solo empaqueta si las pruebas pasan
aybar package                       # build + imagen Docker aybar-atc:<version> y :latest (en local)
aybar test                          # unitarios + integracion + ArchUnit (lo mismo que CI)
aybar test --unit                   # solo unitarios
aybar test --modulo domain          # solo un modulo
```

**Verificaciones** (cada una envuelve lo que el servicio ya trae):

```bash
aybar doctor                        # instalacion (Java 21, JAVA_HOME, SDK) + entorno y origen de este servicio
aybar verify entorno --env dev      # variables obligatorias de dev (comprobar-entorno, con .env y .env.dev)
aybar verify arquitectura           # solo NormaHexagonalTest: cada clase en su capa, en segundos
aybar verify dependencias           # CVE en las dependencias (falla con CVSS >= 7); necesita NVD_API_KEY
aybar verify estructura             # nombre de rama y formato de commits (guardianes)
aybar verify                        # lo previo a un PR, en el orden del pipeline, con resumen
aybar skills sync                   # skills y contratos para la IA al dia con el SDK (tras aybar update)
```

`NVD_API_KEY` es gratuita (https://nvd.nist.gov/developers/request-an-api-key) y
puede ir en tu `.env`. Sin ella `verify dependencias` no analiza y lo dice
(codigo 2, "sin verificar"); `aybar verify` la marca OMITIDO, nunca en verde.

**Entornos.** `--env` elige el perfil de Spring (`local`, `dev` o `prod`) y
`aybar run` carga las variables de `.env` y, encima, las de `.env.<entorno>`:
Spring no lee esos ficheros por si solo. Lo que ya tengas exportado en la terminal
gana a lo escrito en ellos, y los flags ganan a todo. Solo se muestran los
**nombres** de las variables, nunca sus valores. Los `.env*` no se commitean
(estan en `.gitignore`); la plantilla es `.env.example`.

Sin la CLI, lo mismo con Maven:

```bash
./mvnw install                      # una vez: deja los modulos hermanos en ~/.m2
./mvnw -pl boot spring-boot:run     # levanta el servicio (perfil local; no lee .env)
./mvnw verify                       # unitarios + integracion + ArchUnit
./mvnw -Pseguridad verify           # ademas, OWASP dependency-check (falla con CVSS >= 7)
./comprobar-entorno.sh              # revisa variables y skills (PowerShell: ./comprobar-entorno.ps1)
```

**Docker** (imagen `eclipse-temurin:21-jre`, con `HEALTHCHECK` sobre Actuator):

El jar lo produce el modulo `boot` con nombre fijo, `boot/target/aybar-atc.jar`,
y es lo unico que entra al contexto de build (`.dockerignore`): ningun `.env` viaja
a la imagen.

```bash
aybar package                       # jar + imagen aybar-atc:0.1.0-SNAPSHOT y aybar-atc:latest
```

O a mano:

```bash
aybar build                         # o ./mvnw package -DskipTests
docker build -t aybar-atc:0.1.0-SNAPSHOT .
docker run --rm --env-file .env -p 8081:8081 aybar-atc:0.1.0-SNAPSHOT
```

URLs en `local`:

| URL | Que hay |
|---|---|
| `http://localhost:8081/` | Pagina de bienvenida |
| `POST http://localhost:8081/ejemplos?nombre=hola` | Caso de uso de ejemplo |
| `http://localhost:8081/swagger-ui.html` | Swagger UI |
| `http://localhost:8081/v3/api-docs` | Spec OpenAPI |
| `http://localhost:8081/actuator/health` | Salud; sondas en `/actuator/health/liveness` y `/readiness` |

## 8. Calidad: pruebas, CI y guardianes

**Pruebas que trae el esqueleto** (`boot/src/test`):

- `ApplicationTest` – el contexto de Spring arranca con los starters elegidos.
- `NormaHexagonalTest` – la regla de dependencias de la seccion 2.2.

**Pipeline** `.github/workflows/entrega.yml`, por etapas:

| Etapa | Que valida |
|---|---|
| `estructura` | Nombre de rama, formato de commits, gates listos (G4 y G3 aprobados en `main`, y G2 si la feature tiene pantallas) y evals de los guardianes |
| `paquete-definir` | Si `docs/` trae paquete: `docs/explorador.html` al dia (por su huella, sin secretos) y, con el secreto `AYBAR_SDK_TOKEN` y la variable `AYBAR_SDK_REPO` (ORG/REPO del SDK), `aybar paquete validar` sin errores |
| `build-y-pruebas` | `./mvnw verify` |
| `dependencias` | OWASP dependency-check (necesita el secreto `NVD_API_KEY`) |
| `estatico` | Sonar, si el secreto esta configurado |
| `frontend` | En `frontend/`: `npm ci` (sin credenciales: los `@aybarcorp/*` estan en `frontend/paquetes/`), lint y pruebas si existen, build y `npm audit --audit-level=high` |

**Guardianes de git** (`.guardianes/`, activos desde `aybar new project`; en un clon
nuevo los activa `aybar install`, o `.guardianes/activar.sh` sin la CLI):

- Commits: `tipo(alcance): asunto (AYB-1234)`, con `tipo` en
  `feat fix docs refactor test chore perf build ci`.
- Ramas de trabajo: `feature|bugfix|hotfix/AYB-1234-descripcion`.
- `main`, `master`, `develop` y `release/*` estan protegidas.
- `.gitignore` en solo lectura: es lo que impide que un `.env` o `target/` o `node_modules/` entren
  al historial. Los hooks `post-checkout`, `post-merge` y `post-rewrite` lo vuelven
  a proteger tras un pull, un cambio de rama o un rebase. Para cambiarlo a
  proposito, con su PR: `chmod u+w .gitignore`, editar y commitear.
- Gate listo (`pre-commit`): en una rama `feature/AYB-1234-*`, un commit que toca
  codigo (`domain/`, `application/`, `adapters/`, `infrastructure/`, `boot/` o un
  `pom.xml`; o `frontend/src/`, `frontend/package.json`, su lockfile o
  la configuracion de build del frontend) exige `docs/gates/AYB-1234/G4.md` con `estado: approved` en
  `origin/main`, y tambien `G3.md` si existe. Si la feature tiene alguna HU con
  `ui: true` en `origin/main`, tambien `G2.md` (y si `G2.md` existe, tiene que
  estar approved). Los commits que solo tocan `docs/`
  pasan: asi se escribe el paquete Definir. `hotfix/`, `bugfix/` y `release/`
  estan exentas. El gate se aprueba con un PR revisado por su CODEOWNER, no
  editando el archivo en la rama de trabajo.

**Hooks de agente** (`.claude/settings.json` + `.guardianes/agente/`): cortan a un
asistente de IA antes de ejecutar algo fuera del contrato: push a ramas
protegidas, force-push, `--no-verify`, aprobar o mergear un PR, tocar Produccion,
importar Spring/JPA/Kafka en `domain/`, escribir secretos o PII, o escribir codigo
sin el gate listo. En `frontend/`: importar algo de fuera de `frontend/`, un
modulo por URL, `@aybarcorp/shell` o `@aybarcorp/auth` desde un remoto, o llamar a la
red desde un componente. Bloquean, no preguntan. Si hace falta una excepcion real, la
pide una persona fuera del agente.

**CODEOWNERS** (`.github/CODEOWNERS`): trae comentadas las reglas por gate y rol
(G1 y G4 el PO, G2 PO + UX, G3 el TL...). Para activarlas, pon los equipos de tu
organizacion y enciende "Require review from Code Owners" en la proteccion de
`main`: es lo que convierte `estado: approved` en una aprobacion real.

## 9. Trabajar con IA

Este servicio viene preparado para que un asistente (Claude Code, Cursor, OpenCode,
Codex, Gemini CLI, Copilot, Kimi o Hermes) trabaje con el mismo contexto que una
persona del equipo. Lo primero de cada sesion es `.agents/scripts/arranque.sh`
(los hooks de sesion lo corren solos donde la herramienta los admite): dice si el
paquete Definir de `docs/` esta certificado y si `docs/explorador.html`, el mapa
navegable del paquete, esta al dia. Empieza a leer por ese explorador.

| Donde | Que le da a la IA |
|---|---|
| `AGENTS.md` / `CLAUDE.md` | Reglas del proyecto y por donde empezar |
| `docs/skills/<starter>.md` | El contrato de **cada starter que usa este servicio**: propiedades, variables obligatorias, errores tipicos. Copias selladas: no se editan aqui |
| `.agents/skills/`, `.claude/skills/` | Skills tecnicas del SDK (hexagonal, seguridad, secretos, auditoria, mensajeria...): `.agents/skills/` para todas las herramientas, `.claude/skills/` para Claude Code |
| `.agents/` (roles en `.agents/agents/`, copiados a cada herramienta) | Roles y marco de entrega del equipo (en el frontend: `disenador-ux` para G2 y `desarrollador-frontend`) |
| `.mcp.json`, `.cursor/mcp.json`, `.vscode/mcp.json`, `opencode.json`, `.codex/config.toml`, `.gemini/settings.json` | El servidor MCP `nexora` (`aybar mcp nexora`): leer el paquete en Nexora y registrar avances y PR. Sin secretos: los tokens van en `~/.aybar/nexora.env` (`aybar mcp nexora configurar`). Si `docs/.origen-documental.json` existe, `docs/` es copia sellada de Nexora |
| `frontend/README.md` | Comandos, papel y reglas del frontend |

Si `./comprobar-entorno.sh` avisa de que el sello de `docs/skills/` no coincide con
el SDK instalado, regenera las copias: una instruccion caducada se sigue con la misma
confianza que una vigente.

## 10. Mapa de ficheros

```
aybar-atc/
|-- pom.xml                         reactor + aybar-bom + perfil "seguridad"
|-- Dockerfile, .dockerignore
|-- .env.example                    variables de entorno de este servicio
|-- comprobar-entorno.sh / .ps1     chequeo previo al arranque
|-- instalar.sh / .ps1              lo primero tras clonar: aybar install (o como instalar la CLI)
|-- AGENTS.md, CLAUDE.md            contexto para la IA
|-- docs/
|   |-- VARIABLES.md                guia de variables
|   `-- skills/                     contrato sellado de cada starter
|-- domain/        .../domain/{model,port/out}/
|-- application/   .../application/usecase/
|-- adapters/      .../adapters/{inbound/{rest,messaging},outbound/{persistence,messaging,external,audit,wiring}}/
|                  src/main/resources/db/migration/
|-- infrastructure/.../infrastructure/configuration/
|-- boot/          .../boot/AtcApplication.java
|                  src/main/resources/application*.yml
|                  src/test/.../{ApplicationTest,NormaHexagonalTest}.java
|-- frontend/                       proyecto Node: package.json, src/, paquetes/ (@aybarcorp/*), Dockerfile, nginx.conf (ver su README)
|-- .github/workflows/entrega.yml
|-- .github/CODEOWNERS              quien aprueba cada gate (comentado hasta que el equipo ponga sus handles)
|-- .guardianes/                    hooks de git (commit, push, gate listo) y de agente (agente/)
|-- docs/gates/<TICKET>/G<n>.md     evidencia de cada gate; solo approved en origin/main abre el paso
|-- .aybar/proyecto.properties      con que SDK, starters y puerto, ui, papel y framework se genero (lo escribe la CLI; no se edita)
`-- .agents/, .claude/, .cursor/,   marco de entrega, skills, roles y hooks de arranque por herramienta
    .gemini/, .codex/, .opencode/,  (AGENTS.md, seccion "Al abrir este repositorio")
    .github/{agents,hooks}/
```

## 11. Donde pedir ayuda

- **Algo de un starter no hace lo que dice su skill**: repositorio del Aybar SDK, modulo
  `aybar-starter-*` correspondiente (ver `CONTRIBUTING.md` del SDK).
- **El servicio se genero mal**: repositorio del SDK, `aybar-service-template/`.
- **Un paquete `@aybarcorp/*` no hace lo que dice**: repositorio del framework
  (`aybar-framework`), paquete correspondiente.
- **El frontend se genero mal**: repositorio del SDK, `aybar-frontend-template/`
  (esqueleto) o `aybar-service-template/` (raiz comun).
- **`aybar new project` falla**: repositorio del SDK, `aybar-cli/`.
- **Como hago X con el SDK**: primero `docs/skills/` y `.claude/skills/aybar-*/`; con el framework, `frontend/README.md`.
