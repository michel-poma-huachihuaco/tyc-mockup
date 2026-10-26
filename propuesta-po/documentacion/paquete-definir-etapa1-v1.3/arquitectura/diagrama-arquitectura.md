---
id: "SPEC-ARQ-C4"
tipo: "spec"
titulo: "Diagrama de arquitectura (C4: contexto, contenedores, módulos, ambientes y logs)"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.4"
owner: "Jesús Chávez Elías"
aprobadores: [tech_lead]
fecha: "2026-10-26"
relacionados: [ADR-001, ADR-002, ADR-005, ADR-009, ADR-010, ADR-012, ADR-013, ADR-014]
tags: [arquitectura, c4, g3]
---

# Diagrama de arquitectura · C4

Va en `docs/arquitectura/` y se enlaza desde el envío de G3 y desde la sección 4 del DoR. Fuentes: `c4-contexto.mmd`, `c4-contenedores.mmd` y `modulos.mmd` (Mermaid; cualquier visor de Mermaid o `mmdc` los dibuja); los diagramas de ambientes y de logs y auditoría están solo en este documento. Versión 0.4 del 26-oct-2026: dibuja las decisiones DT-01 a DT-10 del Líder Técnico (`analisis/decisiones.md` v0.5) y responde a la evidencia «Diagramas» de su revisión del 22-oct (§4): emisor de Control de acceso, Azure, sin módulo `identidad`, visor alimentado por el servicio, logs y auditoría, y ambientes. La v0.4 aplica su segunda revisión: el WebSocket del visor se autentica en el *handshake* y no pasa por API Management, la UAT va en PRE (PLT-05 §4.2) y hay un job de migraciones aparte. Los cinco diagramas se validaron con `mmdc` (Mermaid CLI) el 26-oct.

| DT | Dónde se ve |
|---|---|
| DT-01 Stack del SDK Aybar 0.7.1 (Java 21, Spring Boot, Angular) | Contexto y contenedores |
| DT-02 CQRS con outbox, bus y proyector único escritor | Contenedores y módulos |
| DT-03 Sin módulo `identidad`; ATC consume la seguridad | Contenedores y módulos |
| DT-04 y DT-05 Login y emisor de Control de acceso | Contexto y contenedores |
| DT-06 Base única del v7, `PARTY` fuente viva | Contexto y contenedores |
| DT-07 Azure, con Cloudflare y API Management en el borde | Contexto, contenedores, ambientes y logs |
| DT-08 Jobs con ShedLock | Contenedores |
| DT-10 `client_credentials` hacia Control de acceso | Contexto, contenedores y módulos |

## 1 Contexto

```mermaid
flowchart LR
  subgraph Quien["Quién pide y atiende"]
    tel[Teléfono]
    wa[WhatsApp]
    mail[Correo]
    cli[Cliente<br/>Mi Portal]
    ges[Gestores, supervisores<br/>y áreas · consola ATC]
    obra[Personal de proyecto<br/>y del Entrega Fest<br/>formularios]
  end
  borde["Borde corporativo<br/>Cloudflare + Azure API Management<br/>TLS · WAF · JWT y audiencia<br/>el WebSocket del visor no pasa por API Management"]
  atc(["<b>Aybar Atiende</b><br/>plataforma ATC · monolito modular<br/>Java 21 · Spring Boot · SDK Aybar 0.7.1 · Angular<br/>Azure · DEV, QA, PRE (UAT) y producción"])
  ctrl[["Control de acceso (PJ-05) · DEP-16<br/>emisor de tokens · login de internos y clientes<br/>catálogo de roles y permisos"]]
  base[("Base única del v7<br/>PARTY y maestros de otros dominios")]
  mon[["Azure Monitor<br/>logs y auditoría técnica"]]
  subgraph Ext["Sistemas externos (adaptador + simulador)"]
    sigda[SIGDA/TAXON<br/>DEP-01]
    con[Contratos y Activos<br/>DEP-07]
    cob[Cobranza<br/>DEP-08]
    cti[Call center CTI<br/>DEP-11]
    leg[Herramienta de Legal<br/>DEP-12]
    jose[Motor de José<br/>DEP-13]
    ia[Proveedor de IA<br/>DEP-14 · por evaluar]
    kpi[KPI Engine y GLI<br/>DEP-10 y DEP-06]
    proy[Proyectos<br/>DEP-15]
  end
  cli -- "login de clientes · PKCE" --> ctrl
  ges -- "login de internos" --> ctrl
  cli -- "HTTPS + JWT" --> borde
  ges -- "HTTPS + JWT" --> borde
  obra -- "HTTPS + JWT" --> borde
  borde --> atc
  tel --> ges
  wa --> ges
  mail --> ges
  atc -- "registro del catálogo · client_credentials" --> ctrl
  atc -. "gestores y líderes: sin API todavía (P-035)" .-> ctrl
  atc -- "FK a PARTY · fuente viva" --> base
  atc -. "logs y auditoría" .-> mon
  atc <--> sigda
  atc <--> con
  atc <--> cob
  atc <--> cti
  atc <--> leg
  atc <--> jose
  atc <--> ia
  atc --> kpi
  atc <--> proy
```

## 2 Contenedores

```mermaid
flowchart TB
  gestor([Gestor · supervisor · administrador funcional])
  cliente([Cliente])
  personal([Personal de proyecto y del evento])
  subgraph ca["Control de acceso (PJ-05) · DEP-16"]
    emisor[["Emisor de tokens<br/>Spring Authorization Server"]]
    apicat[["API de catálogo<br/>ADR-021 de PJ-05"]]
  end
  subgraph borde["Borde"]
    cf["Cloudflare<br/>TLS · WAF · DDoS"]
    apim["Azure API Management<br/>JWT, audiencia y nivel por API REST<br/>nivel de consumo: sin WebSocket"]
  end
  subgraph front["Frontend · Angular · @aybarcorp/ui-angular · Azure Container Apps"]
    consola[Consola ATC]
    mp[Mi Portal]
    visor[Visor 3D]
    forms[Formularios PWA]
  end
  subgraph app["aybar-atc · Java 21 Corretto · Spring Boot 3.5.6 · SDK Aybar 0.7.1 · Azure Container Apps"]
    direction TB
    rest["API REST /api/v1<br/>valida el JWT · @PreAuthorize por rol"]
    mods["Módulos: tickets · sla · complaintbook · legalcases · aftersales<br/>portal · quality · inbox · customer360 · delinquency · integrations<br/>sin módulo identidad"]
    jobs["Jobs con ShedLock<br/>SLA · plazo legal · vinculación"]
    pub["Publicador del outbox<br/>cada 1 s"]
    proy["Proyector<br/>único escritor del almacén de lectura"]
    wsc["Visor en vivo · WebSocket /ws/visor<br/>valida el JWT en el handshake:<br/>firma, emisor, aud y exp · cierra al vencer"]
    obs["Logs JSON y auditoría técnica<br/>aybar-starter-logging y aybar-starter-audit"]
  end
  subgraph datos["Datos en Azure"]
    pg[("Azure Database for PostgreSQL<br/>base única v7 · SVC_* · MAE_*<br/>SVC_OUTBOX_EVENT · shedlock<br/>flyway_schema_history_atc")]
    mg[("Azure Cosmos DB for MongoDB vCore<br/>Azure DocumentDB · clúster de ATC<br/>vistas de lectura")]
    eh{{"Azure Event Hubs Standard · protocolo Kafka<br/>espacio de nombres de ATC<br/>5 tópicos aybar.service.* y 5 colas .DLQ"}}
    blob[("Azure Blob Storage<br/>evidencia inmutable")]
  end
  kv[["Azure Key Vault<br/>secretos y llave HMAC"]]
  mon[["Azure Monitor<br/>Log Analytics · Application Insights · alertas"]]
  acr[["Azure Container Registry<br/>una imagen por release"]]
  ext[Sistemas externos<br/>con simulador]
  mig[["Job de migraciones Flyway<br/>Container Apps Job · rol app_atc_migracion"]]

  gestor --> consola
  gestor --> visor
  cliente --> mp
  personal --> forms
  consola -- "login PKCE" --> emisor
  mp -- "login PKCE" --> emisor
  consola -- "HTTPS + JWT" --> cf
  mp -- "HTTPS + JWT" --> cf
  forms -- "HTTPS + JWT" --> cf
  visor -- "WebSocket · JWT en Sec-WebSocket-Protocol" --> cf
  cf -- "API REST" --> apim
  apim --> rest
  cf -- "/ws/visor · host propio, sin API Management" --> wsc
  emisor -. "llaves públicas JWKS" .-> rest
  emisor -. "llaves públicas JWKS" .-> wsc
  rest --> mods
  mods -- "escribe y guarda el evento en la misma transacción" --> pg
  mods -- "lee" --> mg
  jobs -- "lee y escribe" --> pg
  pub -- "lee pendientes" --> pg
  pub -- "publica" --> eh
  eh --> proy
  proy -- "escribe" --> mg
  eh --> wsc
  wsc -- "eventos por área" --> visor
  mods -- "sube evidencia" --> blob
  mods -- "registro del catálogo · client_credentials" --> apicat
  mods <--> ext
  app -. "identidad administrada" .-> kv
  obs -. "logs, auditoría y métricas" .-> mon
  acr -. "imagen" .-> app
  acr -. "imagen" .-> mig
  mig -- "migra antes de cada despliegue" --> pg
  mig -. "secreto del rol dueño" .-> kv
```

Reglas que muestra el diagrama:
- Se **escribe** en PostgreSQL y se **lee** del almacén de lectura; la lectura no abre JDBC (skill `aybar-cqrs`), salvo los jobs de plazos (ADR-005). El **proyector del servicio es el único** que escribe en el almacén de lectura, con su credencial propia (DT-02, ADR-012).
- Cada cambio guarda su evento en `SVC_OUTBOX_EVENT` en la misma transacción y el publicador lo envía al bus cada 1 s, con los tópicos del SDK `aybar.service.*` (ADR-013).
- **El visor 3D recibe los eventos del servicio por WebSocket, no del bus:** el consumidor del visor está dentro de `aybar-atc` y reenvía a cada conexión los eventos de las áreas que su rol permite (ADR-010). El JWT viaja en `Sec-WebSocket-Protocol` y el servicio lo valida en el *handshake* con `aybar-starter-security` (firma, emisor, audiencia y vencimiento); al vencer, cierra la conexión y el visor se reconecta. `/ws/visor` entra por Cloudflare al ingreso de Container Apps y **no pasa por API Management**, porque su nivel de consumo no admite WebSocket (`https://learn.microsoft.com/en-us/azure/api-management/websocket-api`).
- Los módulos no se tocan las tablas: se hablan por su API pública o por eventos (ADR-001). Solo `integrations` habla con los sistemas externos (ADR-004).
- El almacén de lectura guarda lo de ATC, no el dato del cliente; `PARTY` es la fuente viva (ADR-003, DT-06).
- **ATC no administra identidad** (DT-03): el emisor, el login de internos y de clientes, los roles y los permisos son de Control de acceso. ATC valida el JWT con las llaves públicas del emisor, autoriza por los roles del token y registra su catálogo con `client_credentials` (ADR-009, DT-10). La consulta de gestores y líderes no existe todavía en Control de acceso (P-035).
- Los jobs corren con ShedLock sobre PostgreSQL (ADR-005). Las migraciones Flyway corren en un job aparte, con el rol dueño de las tablas y la tabla de historial `flyway_schema_history_atc`; el servicio no migra (ADR-001, punto 5).
- Event Hubs y Cosmos DB son exclusivos de ATC en cada ambiente: Event Hubs Standard admite 10 event hubs por espacio de nombres y ATC usa los 10 (ADR-013), y en Cosmos DB los usuarios secundarios tienen permisos de clúster (ADR-012).
- Los secretos y la llave HMAC se leen de Key Vault con identidad administrada; los logs y la auditoría técnica van a Azure Monitor; cada release es una imagen del registro (ADR-014).

## 3 Módulos

```mermaid
flowchart LR
  ctrl[["Control de acceso (PJ-05)<br/>JWT con roles · API de catálogo"]]
  sec["Seguridad transversal<br/>aybar-starter-security · @PreAuthorize por rol"]
  tickets[tickets]
  sla[sla]
  cbook[complaintbook]
  lcases[legalcases]
  aftersales[aftersales]
  portal[portal]
  quality[quality]
  inbox[inbox]
  c360[customer360]
  delinq[delinquency]
  integ["integrations<br/>adaptador + simulador por externo<br/>GestoresPort"]
  outbox[("Outbox<br/>SVC_OUTBOX_EVENT")]
  bus{{"Bus · aybar.service.*"}}
  ctrl -. "roles en el token" .-> sec
  sec --> tickets
  sec --> portal
  sec --> inbox
  integ -. "catálogo · client_credentials" .-> ctrl
  portal -- API --> tickets
  cbook -- API --> tickets
  lcases -- API --> tickets
  aftersales -- API --> tickets
  delinq -- API --> tickets
  inbox -- API --> tickets
  tickets -- "ticket_created · ticket_assigned<br/>ticket_status_changed · ticket_updated" --> outbox
  sla -- sla_breached --> outbox
  outbox --> bus
  bus --> inbox
  bus --> quality
  bus --> portal
  c360 --> integ
  delinq --> integ
  lcases --> integ
  aftersales --> integ
  tickets --> integ
  inbox --> integ
  integ --> ext[(Sistemas externos)]
```

Los nombres en inglés son los paquetes y las etiquetas del contrato (ADR-001). No hay módulo de identidad.

## 4 Ambientes

```mermaid
flowchart LR
  subgraph local["Local · perfil local"]
    l1["aybar run o Docker<br/>datos sintéticos"]
    l2[["Emisor de pruebas<br/>herramientas/emisor-local.mjs<br/>AybarCorp/aybar-access-control-deus"]]
  end
  subgraph dev["DEV · perfil dev · datos sintéticos"]
    d1["Container Apps · PostgreSQL · Cosmos DB<br/>Event Hubs · Blob · Key Vault · Monitor<br/>pruebas del equipo"]
    d2[["Control de acceso en DEV<br/>DEP-16 sin fecha · P-040"]]
  end
  subgraph qa["QA · perfil qa · datos anonimizados"]
    q1["La misma topología, de su tamaño<br/>E2E desde el día 3 · ciclos QA 0 a 2"]
    q2[["Control de acceso en QA"]]
  end
  subgraph pre["PRE · perfil preprod · datos anonimizados"]
    p1["La misma topología, del tamaño de QA<br/>UAT del PO el 03-nov · prueba del rollback<br/>PLT-05 §4.2"]
    p2[["Control de acceso en PRE"]]
  end
  subgraph prod["Producción · perfil prod · datos reales"]
    r1["La misma topología, con alta disponibilidad<br/>PostgreSQL y Cosmos DB entre zonas · Blob ZRS"]
    r2[["Control de acceso en producción<br/>https://auth.aybarsac.com"]]
  end
  acr[["Azure Container Registry<br/>una imagen por release"]]
  mig[["Job de migraciones Flyway<br/>antes de cada despliegue"]]
  l1 -. "JWT de pruebas" .- l2
  d1 -. "JWT" .- d2
  q1 -. "JWT" .- q2
  p1 -. "JWT" .- p2
  r1 -. "JWT" .- r2
  l1 -- "PR aprobado · G5" --> d1
  d1 -- "versión candidata" --> q1
  q1 -- "G6 y G7" --> p1
  p1 -- "UAT aceptada · Go/No-Go · G8" --> r1
  acr -. "misma imagen" .-> d1
  acr -. "misma imagen" .-> q1
  acr -. "misma imagen" .-> p1
  acr -. "misma imagen" .-> r1
  mig -. "en cada ambiente" .-> d1
```

Fuente: ADR-014 (punto 8) y PLT-05 v1.3 §4.2 («Ambiente QA · E2E desde el día 3», «Ambiente PRE · UAT 03-nov»). PRE entra en la Etapa 1 con la UAT del PO. Cada ambiente tiene sus propios recursos de Azure; el registro de imágenes es uno, y el job de migraciones corre en cada ambiente antes del despliegue. El costo de cada ambiente está en `arquitectura/costo-cloud.md` v0.4 (USD 2.592,53 al mes con PRE). Ningún dato real sale de producción ni entra a un prompt de IA.

## 5 Logs y auditoría

```mermaid
flowchart LR
  req["Petición con JWT<br/>X-Correlation-Id"]
  subgraph svc["aybar-atc"]
    log["aybar-starter-logging<br/>JSON por consola · correlationId,<br/>usuario, companyId, userAccountId"]
    aud["aybar-starter-audit<br/>publicador de log · lista blanca, solo referencias"]
    deny["Intentos denegados<br/>403: AuthorizationEventPublisher (HU-001)<br/>404 y negocio: caso de uso (HU-052, HU-065)"]
    bit["Bitácoras de negocio<br/>solo inserción · HMAC encadenado"]
    jobs["Jobs y outbox<br/>métricas de último éxito y antigüedad"]
  end
  pg[("PostgreSQL<br/>9 tablas firmadas")]
  blob[("Blob Storage<br/>evidencia inmutable<br/>puntos de control diarios")]
  la[["Azure Monitor<br/>Log Analytics · Application Insights"]]
  alert[["Reglas de alerta<br/>grupo de acción del equipo ATC y TI"]]
  ver["Job diario de verificación<br/>hash_mismatch = 0"]
  ctrl[["Control de acceso<br/>auditoría de accesos y login"]]
  req --> log
  log --> la
  aud --> la
  deny --> aud
  jobs --> la
  la --> alert
  bit --> pg
  ver --> pg
  ver -- "punto de control por cadena" --> blob
  ver -- "incidente S1" --> alert
  bit -. "documentos probatorios" .-> blob
  req -. "login y token" .-> ctrl
```

Qué va a cada lado:
- **Logs técnicos:** JSON de `aybar-starter-logging` con `correlationId`, recogido por Azure Monitor (Log Analytics y Application Insights), sin datos personales (ADR-014; `seguridad.md`).
- **Auditoría técnica:** `aybar-starter-audit` con su publicador de log, porque no tiene destino Azure Blob (ADR-014; P-032). Incluye los intentos denegados que piden las historias: los 403 por falta de rol llegan por el `AuthorizationEventPublisher` que declara ATC, y las negaciones de negocio (404 del ticket de otro cliente, dato no permitido del motor) las emite el caso de uso (`seguridad.md`).
- **Evidencia de negocio:** las bitácoras firmadas con HMAC encadenado en PostgreSQL y los documentos probatorios en Blob Storage con inmutabilidad; el job diario verifica el hash y deja un punto de control por cadena en Blob Storage para detectar un borrado del final (ADR-002, ADR-006).
- **Alertas:** jobs sin éxito, antigüedad del outbox e incidentes de integridad, al grupo de acción del equipo ATC y de TI (ADR-005).
- **Auditoría de accesos:** la del login y de los tokens es de Control de acceso, no de ATC (DT-03).

## 6 Pendientes del diagrama

- Control de acceso disponible en DEV (DEP-16; P-026, P-040): sin emisor, los endpoints protegidos responden 401.
- Consulta de gestores y líderes con token de servicio (P-035): la flecha punteada del contexto.
- Audiencia del token en el borde y en el servicio (P-038).
- Autenticación del broker con Azure Event Hubs (P-032).
- La región de Azure y el nivel de la instancia corporativa de API Management (P-044).
- El host propio de `/ws/visor` en Cloudflare y la restricción de IP del ingreso (Seguridad TI y Líder Técnico; ADR-010).

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-19 | Jesús Chávez Elías, con IA | Borrador con el stack propuesto por el ADR-012 |
| 0.1 (v3 en Nexora) | 2026-10-21 | Brayan, con IA | Contexto sin fases posteriores y conflicto de stack señalado |
| 0.2 | 2026-10-22 | Jesús Chávez Elías, con IA | Sin módulo `identidad`; emisor y login de Control de acceso; Azure; módulos en inglés; visor alimentado por el servicio; Key Vault, Monitor y ShedLock en el diagrama |
| 0.3 | 2026-10-26 | Brayan Hurtado, con IA | Contenedores redibujados: el visor recibe los eventos del consumidor del servicio por WebSocket (antes salía del bus), outbox y publicador, proyector, Cloudflare y API Management, JWKS del emisor, identidad administrada, registro de imágenes y registro del catálogo; contexto con borde, base única y la consulta de gestores sin API (P-035); módulos con outbox y tópicos del SDK; diagramas nuevos de ambientes y de logs y auditoría; tabla DT → diagrama; validados con `mmdc` |
| 0.4 | 2026-10-26 | Brayan Hurtado, con IA | Segunda revisión del Líder Técnico: contenedores con `/ws/visor` por Cloudflare al ingreso, sin API Management (el nivel de consumo no admite WebSocket, verificado en Microsoft Learn), JWT validado en el *handshake* y job de migraciones; contexto y ambientes con PRE para la UAT del 03-nov (PLT-05 §4.2); logs con el `AuthorizationEventPublisher`, los intentos denegados desde el caso de uso y el punto de control diario; reglas y pendientes al día |

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v3 de Nexora; actualizado con IA (Claude, 2026-10-22) a partir de la revisión del Líder Técnico del 22-oct y (Claude, 2026-10-26). — Revisado por: (pendiente) · Aprueba: TL
