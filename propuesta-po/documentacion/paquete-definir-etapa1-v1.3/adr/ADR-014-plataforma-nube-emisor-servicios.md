---
id: "ADR-014"
tipo: "adr"
titulo: "ADR-014: Plataforma: Azure, emisor de tokens de Control de acceso y servicios gestionados"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.4"
owner: "Jesús Chávez Elías"
aprobadores: [tech_lead]
fecha: "2026-10-26"
relacionados: [ADR-001, ADR-002, ADR-004, ADR-005, ADR-006, ADR-009, ADR-010, ADR-011, ADR-012, ADR-013]
tags: [adr, arquitectura, g3]
---

# ADR-014: Plataforma: Azure, emisor de tokens de Control de acceso y servicios gestionados

- Estado: propuesto
- Ticket: AYB-0001 · Versión 0.4 · Fecha: 2026-10-26 (historial al final)
- Owner: Jesús Chávez Elías (Dev 2) · Aprueba: Líder Técnico (`aprobadores: [tech_lead]`) · Revisado por: (pendiente)
- Compatibilidad con M0 (Arquitectura de Directorio): **requiere dispensa (solicitada)**. El Líder Técnico la pidió a Enrique Albán (Data Chief) el 22-oct-2026; M0 no está en el repositorio ni en Nexora (P-005).
- Origen: decisiones DT-01, DT-05, DT-07, DT-08 y DT-10 del Líder Técnico (Jose Jara, 22-oct-2026) y colisiones C-03, C-09 y C-12 de su revisión, registradas en `analisis/decisiones.md` v0.6. Sustituye a la v0.1 (19-oct), que dejaba sin decidir la nube y el emisor y daba por inexistente a Control de acceso: el servicio está en construcción en `aybar-access-control` y su paquete (PJ-05) está aprobado en Nexora.
- Cambia lo que da por hecho el PO: PLT-05 §4 y los requisitos RNF-CUM-007 y RNF-DIS-003 hablan de S3 con Object Lock y PostgreSQL Multi-AZ. Con Azure, el PO los actualiza a su equivalente (Blob Storage con inmutabilidad; alta disponibilidad con redundancia de zona) (P-027).

> Las referencias a PJ-05 se verificaron el 26-oct en la copia sellada de su paquete aprobado (`docs-roles-y-permisos/`, traída de Nexora el 22-oct; el perfil desarrollador recibe 403 al leer PJ-05 en Nexora): ADR-001, 012, 015, 016 y 019; D-23, D-33, D-44, D-50, D-90, D-223 y D-224. ⚠ Siete archivos de esa copia no coinciden con la huella del sello: `access-control.openapi.yaml`, `VARIABLES.md` y las historias `HU-IDN-003`, `014`, `054`, `057` y `059`; lo que se cita de ellos se confirma con la versión aprobada.

## Contexto

El SDK Aybar 0.7.1 es neutral de nube. Las skills `aybar-lexico` y `aybar-paquete-definir` piden que la nube, el emisor de tokens y los servicios gestionados los fije un ADR del proyecto, y no que el agente los suponga.

El Líder Técnico fijó el 22-oct que ATC corre en Azure, con la base única del modelo corporativo v7 (DT-06), y que ATC consume la seguridad del área de Roles y Permisos (Control de acceso, PJ-05): no emite tokens, no abre sesiones y no administra usuarios, roles ni permisos (DT-03, DT-04 y DT-05). Es la misma plataforma que aprobó PJ-05: Azure (ADR-015 de PJ-05), un solo Azure Database for PostgreSQL como base única (ADR-019 de PJ-05), el emisor sobre Spring Authorization Server (ADR-016 de PJ-05) y tareas programadas con ShedLock dentro del servicio (D-90 de PJ-05).

## Opciones evaluadas

| Opción | Por qué no | Qué la haría reconsiderar |
|---|---|---|
| AWS (RDS o Aurora, DocumentDB, MSK, Secrets Manager, ECS Fargate, ECR, S3, CloudWatch) | Azure es la nube de la base única del v7 y de Control de acceso (ADR-015 y ADR-019 de PJ-05); DT-07 la fija para todo ATC. | Que el Líder Técnico cambie la nube. |
| Un emisor OIDC gestionado (Cognito, Entra ID, Auth0) | El emisor es el servidor de autorización de Control de acceso (DT-05; ADR-001 de PJ-05). Dos emisores partirían las cuentas y los roles. Entra ID y Google quedan como proveedores de identidad aguas arriba del emisor, no como emisor. | — |
| Un emisor propio de ATC o login propio en Mi Portal | ATC no administra identidad (DT-03 y DT-04). | — |
| Azure Kubernetes Service para el cómputo | Más operación para un solo despliegue (ADR-001); DT-07 fija Azure Container Apps, como PJ-05. | Que ATC se divida en varios servicios con necesidades de red propias. |
| Programador externo para los jobs | Añade una pieza más que operar. DT-08 fija ShedLock dentro del servicio. | Que se extraiga el módulo `sla` a un servicio propio. |

## Decisión

Azure, para todo ATC (DT-07). Los nombres son los oficiales de Microsoft, como en ADR-015 de PJ-05 (D-15 de PJ-05):

| Capacidad (como la ve el SDK) | Servicio | Nota |
|---|---|---|
| Escritura (PostgreSQL) | Azure Database for PostgreSQL (servidor flexible) | Base única del v7, con FK físicas (DT-06). Alta disponibilidad con redundancia de zona en producción para cubrir RNF-DIS-003 |
| Lectura (API de MongoDB) | Azure Cosmos DB for MongoDB (vCore), hoy «Azure DocumentDB» en la documentación y en la lista de precios de Microsoft | Vistas de ATC (ADR-012); solo las escribe el proyector. Un clúster exclusivo de ATC por ambiente, porque los usuarios secundarios tienen permisos de clúster (ADR-012) |
| Bus de eventos (protocolo Kafka) | Azure Event Hubs Standard (endpoint Kafka) | Tópicos `aybar.service.*` y sus colas `.DLQ` (ADR-013), en un espacio de nombres exclusivo de ATC por ambiente |
| Evidencia probatoria | Azure Blob Storage con inmutabilidad | Reemplaza a S3 con Object Lock (ADR-006) |
| Secretos y llaves | Azure Key Vault | Con identidad administrada. Llave HMAC de las bitácoras (ADR-002), cadenas de PostgreSQL del job de migraciones y del servicio (ADR-001), cadenas del almacén de lectura del proyector y del servicio (ADR-012), secreto del cliente de servicio (ADR-009) y credenciales de los conectores (ADR-004) |
| Contenedores | Azure Container Apps | El backend `aybar-atc` y el frontend Angular, cada uno con su imagen; sondas `/actuator/health/liveness` y `/readiness`. Las migraciones Flyway corren en un Container Apps Job con la misma imagen (ADR-001) |
| Imágenes | Azure Container Registry | Una imagen versionada por release, la misma en todos los ambientes |
| Observabilidad | Azure Monitor (Log Analytics y Application Insights) | Logs JSON con `correlationId`, auditoría técnica, métricas y alertas de jobs y del outbox |
| Borde | Cloudflare (TLS, WAF y DDoS) + Azure API Management | API Management valida el JWT y la audiencia por API (D-44 de PJ-05) y, si una operación lo pide, el nivel de autenticación (D-33 de PJ-05). El WebSocket del visor (`/ws/visor`) no pasa por API Management: el nivel de consumo no admite APIs WebSocket (Microsoft Learn); entra por Cloudflare al ingreso de Container Apps y lo autentica el servicio (ADR-010, punto 6) |

Además:

1. **Emisor de tokens:** el servidor de autorización de Control de acceso (Spring Authorization Server, ADR-016 de PJ-05). ATC solo valida el JWT con `aybar-starter-security` y el contrato de claims de ADR-012 de PJ-05. `AYBAR_ISSUER_URI` es la URL del emisor de cada ambiente (en producción, `https://auth.aybarsac.com` según D-23 de PJ-05). No van Cognito, Entra ID ni Auth0 como emisor (DT-05).
2. **Validación del token:** firma, emisor y vencimiento (15 min) en el servicio. **En la API REST, la audiencia la validan las dos capas:** API Management por API (D-44) y el servicio. En `/ws/visor` la valida solo el servicio, en el *handshake* (ADR-010). El servicio la valida siempre porque `aybar-starter-security` 0.7.1 exige `spring.security.oauth2.resourceserver.jwt.audiences` fuera de `local` y `test`. `AYBAR_JWT_AUDIENCE` es una lista (el identificador del servicio ATC y los `client_id` de la consola y de Mi Portal) para servir tanto con D-44 como con D-224 de PJ-05; el valor lo da Control de acceso (P-038, Sony Montoya).
3. **Clientes de Mi Portal:** login contra el emisor del área (`@aybarcorp/auth`, Authorization Code con PKCE). ATC filtra por el `PartyID` del cliente, **que el token no trae**: cómo lo obtiene lo responde Control de acceso (P-033; ADR-011).
4. **Llamadas entre servicios:** token de servicio `client_credentials` del emisor de Control de acceso con `aybar-starter-client` (DT-10). Ese token lleva `sub` = `client_id` y los roles de la cuenta de servicio, sin usuario ni empresa (D-50 de PJ-05). Hoy ATC lo usa para registrar su catálogo (`CATALOG_REGISTRAR`). Control de acceso no tiene una API con token de servicio para saber qué gestores tienen un rol, quién lidera un área o su disponibilidad (P-035; ADR-009).
5. **Jobs:** ShedLock sobre PostgreSQL, para que corra una sola réplica (DT-08; D-90 de PJ-05; ADR-005).
6. **Secretos:** `aybar.secretos.proveedor=azure` con `azure.vault-uri` y `azure.nombres` (SDK 0.7.1, `aybar-starter-config`), o variables de entorno que la plataforma rellena desde Key Vault, como hace PJ-05 (ADR-015 de PJ-05). Acceso por identidad administrada; nunca en Git ni en YAML.
7. **Logs y auditoría:** `aybar-starter-logging` escribe JSON por consola y Azure Monitor lo recoge; `aybar-starter-audit` usa su publicador de log, porque no tiene destino Azure Blob (como en ADR-015 de PJ-05). La evidencia legal no es auditoría técnica: va a Blob Storage desde el servicio (ADR-006).
8. **Ambientes** (PLT-05 v1.3 §4.2: «Ambiente DEV · Pruebas del equipo», «Ambiente QA · E2E desde el día 3», «Ambiente PRE · UAT 03-nov» y «Producción · Go/No-Go · Multi-AZ»; mismo esquema que PJ-05). **PRE entra en la Etapa 1, con la UAT, como lo planea el PO;** si el equipo quisiera otra cosa, sería un cambio para el PO (P-027), no una lectura del PLT-05.

   | Ambiente | Perfil | Datos | Emisor | Para qué y cómo se despliega |
   |---|---|---|---|---|
   | Local | `local` | sintéticos | emisor de pruebas `herramientas/emisor-local.mjs` del repositorio `AybarCorp/aybar-access-control-deus` (commit `5bab9dc`, 17-oct): no emite `company_roles`, `companyId` ni `PartyID` (P-026) | Desarrollo; `aybar run` o Docker |
   | DEV | `dev` | sintéticos | Control de acceso en DEV (DEP-16, sin fecha: P-026, P-040) | Pruebas del equipo; automático al integrar en `main` (G5) |
   | QA | `qa` | anonimizados (PLT-05 §4.2) | Control de acceso en QA | E2E desde el día 3 y ciclos QA 0 a 2; con la versión candidata. Para pasar a PRE: QA Gate y Security Gate (G6 y G7) |
   | PRE | `preprod` | anonimizados | Control de acceso en PRE | **UAT del PO el 03-nov** (ciclo QA 3) y prueba del rollback; con la etiqueta de release |
   | Producción | `prod` | reales; nunca en un prompt de IA | Control de acceso en producción | Go/No-Go con el Release Gate (G8); con la etiqueta en `main`; cierre en G9 |

   Cada ambiente tiene su propio Azure Database for PostgreSQL, Cosmos DB (clúster exclusivo de ATC, ADR-012), Event Hubs (espacio de nombres exclusivo de ATC, ADR-013), Blob Storage, Key Vault y entorno de Container Apps; el registro de imágenes es uno. Los perfiles `qa` y `preprod` derivan de `prod` (el SDK solo trae `local`, `dev` y `prod`). PRE tiene el tamaño de QA (`arquitectura/costo-cloud.md` §2.2). En cada ambiente, el job de migraciones corre antes del despliegue (ADR-001, punto 5).
9. **Registro en Control de acceso (C-09):** ATC solicita al área los clientes OAuth `PUBLIC` de la consola y de Mi Portal (los carga el seeder de PJ-05 por ambiente), el cliente `CONFIDENTIAL` de servicio (lo crea TI con su script; el secreto va a Key Vault, D-223), el rol de cliente `CATALOG_REGISTRAR` (su ruta sigue en propuesta: P-039) y la política de API Management con la audiencia de la API de ATC. Va en la dependencia DEP-16, responsable Sony Montoya (P-026).
10. **Diferencias de los servicios gestionados que afectan a ATC** (skill `aybar-lexico`: compatible con el protocolo no es idéntico):
    - Event Hubs con endpoint Kafka: ATC no usa transacciones de Kafka (el outbox, ADR-013, las evita; en Event Hubs están en vista previa y solo en Premium y Dedicated) ni compactación de tópicos. **Verificado en Microsoft Learn** (`https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-quotas`): Standard admite 10 event hubs por espacio de nombres, y ATC usa los 10 (5 tópicos y 5 colas `.DLQ`). Por eso cada ambiente tiene un espacio de nombres exclusivo de ATC, y un tópico más es un cambio de ADR-013. Los grupos de consumidores de Kafka (1.000 por espacio de nombres) cubren el visor (ADR-010). La autenticación SASL contra Event Hubs no la resolvió el equipo del SDK: el equipo la prueba antes de construir el publicador (P-032).
    - Cosmos DB for MongoDB (vCore), hoy Azure DocumentDB: ATC solo lee por documento y por índices desde el servicio, y escribe documento a documento desde el proyector; no usa *change streams* ni transacciones de varios documentos. **Verificado en Microsoft Learn** (`https://learn.microsoft.com/en-us/azure/documentdb/secondary-users`): los usuarios secundarios solo tienen roles de clúster (`readWriteAnyDatabase`, `clusterAdmin` o `readAnyDatabase`), no de una base. Por eso ADR-012 usa un clúster exclusivo de ATC por ambiente. Que las consultas de las vistas funcionen en el servicio gestionado es una prueba de la tarea del proyector en DEV, no una condición para aprobar ADR-012.
    - Azure Database for PostgreSQL: ATC usa funciones de PostgreSQL estándar (triggers y `SELECT … FOR UPDATE` de ADR-002, la tabla de ShedLock y roles de base), que el servidor flexible admite.
    - Azure API Management: **verificado en Microsoft Learn** (`https://learn.microsoft.com/en-us/azure/api-management/websocket-api`): «WebSocket APIs aren't supported yet in the Consumption tier». Por eso el WebSocket del visor no pasa por API Management (ADR-010, punto 6).

## Consecuencias

- Obliga a:
  - Que Control de acceso esté disponible en DEV (DEP-16, responsable Sony Montoya; fecha por comprometer, P-040). Sin emisor, los endpoints protegidos responden 401.
  - Reemplazar el cliente S3 por el de Blob Storage en la evidencia (ADR-006).
  - Declarar la dependencia de ShedLock (no está en el SDK ni en el BOM) y registrar su tabla en el registro de tablas de ATC (P-031).
  - Reflejar la decisión en `arquitectura/costo-cloud.md`, en `docs/VARIABLES.md` y en `.env.example` (`AYBAR_ISSUER_URI`, `AYBAR_JWT_AUDIENCE`, `AYBAR_CLIENT_*`, `AYBAR_CORS_ORIGENES` y los secretos de Key Vault).
  - Mantener `c4-contexto.mmd`, `c4-contenedores.mmd` y `seguridad.md` con estas decisiones (el emisor ya está decidido).
  - Que el PO actualice el PLT-05 §4 (S3, Multi-AZ) y sus requisitos (P-027).
- Impide:
  - Suponer otra nube o servicio gestionado sin ADR.
  - Usar un emisor distinto del de Control de acceso, o abrir sesiones propias.
- Cuesta: **USD 2.592,53 al mes** en Brazil South, con los cuatro ambientes del PLT-05: DEV 229,16, QA 390,19, PRE (UAT) 390,19, producción 1.562,71 y Azure Container Registry 20,28. En East US 2, como comparación, USD 1.770,59 (`arquitectura/costo-cloud.md` v0.4, §1.1 y §1.2: API pública de precios de Azure del 26-oct-2026, USD por mes; supuestos de región, volumen y tamaño en P-044). El WebSocket y el job de migraciones no suman: usan el ingreso y el plan de consumo de Container Apps. En producción pesan Azure Cosmos DB for MongoDB (vCore) 844,44, Azure Database for PostgreSQL 378,37 y Azure Container Apps 197,70. Es una cota superior: no resta capas gratuitas y toma la base única como si fuera propia; cómo se reparte con Control de acceso lo compartido (base única, API Management y Cloudflare) lo decide el Líder Técnico (P-044). Fuera de esos totales: correo, USD 0,63 al mes; proveedor de IA, sin cifra posible (DEP-14); emisor y login, USD 0 para ATC (§1.4).

## Datos (puerta F4 de Gobierno de Datos)

- Sin entidades de negocio propias. Fija dónde residen los datos y quién custodia las claves: base única del v7 en Azure Database for PostgreSQL; vistas de lectura en Cosmos DB; evidencia en Blob Storage; llave HMAC y credenciales en Key Vault.
- Tabla nueva por esta decisión: la de ShedLock (`shedlock`), a registrar con Gobierno de Datos (P-031).

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-19 | Jesús Chávez Elías, con IA | Borrador con la decisión «POR DECIDIR» |
| 0.1 (v4 en Nexora) | 2026-10-21 | Brayan, con IA | Línea de conflicto abierto con el PO v1.3 |
| 0.2 | 2026-10-22 | Jesús Chávez Elías, con IA | Reescrito con DT-05, DT-07, DT-08 y DT-10 del Líder Técnico. Quita «POR DECIDIR» y «access-control no existe» |
| 0.3 | 2026-10-26 | Brayan Hurtado, con IA | Referencias a PJ-05 verificadas en su paquete aprobado; la audiencia la validan API Management y el SDK (P-038); el token no trae `PartyID` (P-033); sin API de líderes con token de servicio (P-035); secretos con identidad administrada; logs y auditoría técnica; tabla de ambientes; registro en Control de acceso (C-09, P-039); diferencias de los servicios gestionados; costo con número y fuente |
| 0.4 | 2026-10-26 | Brayan Hurtado, con IA | Segunda revisión del Líder Técnico: ambientes como el PLT-05 §4.2 (QA para E2E y PRE para la UAT del 03-nov, que entra en la Etapa 1); costo base con PRE, USD 2.592,53; verificados en Microsoft Learn el WebSocket de API Management (no en consumo), el límite de Event Hubs Standard (10 por espacio de nombres) y los usuarios secundarios de Azure DocumentDB (permisos de clúster), con su efecto en el diseño; Key Vault con las cadenas nuevas; job de migraciones; aviso ⚠ con los 7 archivos de PJ-05 |
| 0.4 | 2026-10-26 | Brayan Hurtado, con IA | Barrido de coherencia (misma versión, sin cambio de decisión): el origen cita `analisis/decisiones.md` v0.6, la versión vigente (decía v0.5). |

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v4 de Nexora; reescrito con IA (Claude, 2026-10-22) a partir de la revisión del Líder Técnico del 22-oct y actualizado con IA (Claude, 2026-10-26) contra el paquete aprobado de Control de acceso. — Revisado por: (pendiente) · Aprueba: TL
