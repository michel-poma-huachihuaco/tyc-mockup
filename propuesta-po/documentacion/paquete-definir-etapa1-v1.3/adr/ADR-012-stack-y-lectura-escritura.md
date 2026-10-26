---
id: "ADR-012"
tipo: "adr"
titulo: "ADR-012: Stack (Java 21 con Spring Boot y Angular) y CQRS: PostgreSQL para escribir, API de MongoDB para leer"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.6"
owner: "Jesús Chávez Elías"
aprobadores: [tech_lead]
fecha: "2026-10-26"
relacionados: [ADR-001, ADR-003, ADR-005, ADR-009, ADR-013, ADR-014]
tags: [adr, arquitectura, g3]
---

# ADR-012: Stack (Java 21 con Spring Boot y Angular) y CQRS: PostgreSQL para escribir, API de MongoDB para leer

- Estado: propuesto
- Ticket: AYB-0001 · Versión 0.6 · Fecha: 2026-10-26 (historial al final)
- Owner: Jesús Chávez Elías (Dev 2) · Aprueba: Líder Técnico (`aprobadores: [tech_lead]`) · Revisado por: Brayan Manuel Hurtado Paucar, 26-oct-2026
- Compatibilidad con M0 (Arquitectura de Directorio): **requiere dispensa (solicitada)**. El Líder Técnico la pidió a Enrique Albán (Data Chief) el 22-oct-2026; M0 no está en el repositorio ni en Nexora. La dispensa es una firma, no una condición del contenido (P-005, ED-25).
- Origen: decisiones DT-01 y DT-02 del Líder Técnico (Jose Jara, 22-oct-2026), registradas en `analisis/decisiones.md` v0.8. Cierra D-001, D-002, P-003 y P-009 (la decisión; la brecha de horas de la tabla de este ADR la cierra P-025, decidida por el equipo el 26-oct-2026).
- Reemplaza el stack del PLT-05 v1.3 §4.1 (Node.js con NestJS, React y una sola PostgreSQL con índice de búsqueda) y el ADR-01 del PO. Es una diferencia con los documentos del PO listada en ED-19 de `analisis/decisiones.md` (P-027); el PLT-01 y el PLT-05 no se editan.

## Contexto

El PLT-05 v1.3 propuso NestJS, React y una sola base PostgreSQL con un índice de búsqueda, y lo marcó «stack propuesto por el PO, a validar con Arquitectura». El Líder Técnico decidió el 22-oct el stack del SDK Aybar 0.7.1 y CQRS completo desde la Etapa 1.

El SDK trae seguridad OIDC y JWT, logs con correlationId, auditoría con lista blanca de datos personales (Ley 29733), mensajería Kafka con cola de errores y reintento acotado, PostgreSQL con Flyway, lectura sobre la API de MongoDB y los puertos `AybarWriteRepository` y `AybarReadRepository`. No trae outbox, proyector, caché Redis, calendario de días hábiles ni bitácora con HMAC (skill `aybar-estado-del-sdk`). El cliente HTTP (`aybar-starter-client`) no aplica reintento ni circuit breaker por sí solo; `aybar-starter-logging` trae, como opción, los registros de circuit breaker y reintento de Resilience4j (`aybar.logging.resilience.enabled`), que usa ADR-004.

## Opciones evaluadas

| Opción | Por qué no | Qué la haría reconsiderar |
|---|---|---|
| Node.js + NestJS + React (propuesta del PLT-05) | Descartada por DT-01. En NestJS habría que construir seguridad, logs, auditoría de datos personales, mensajería y cliente HTTP corporativos. | — |
| Una sola base PostgreSQL con índice de búsqueda | DT-02 fija dos almacenes; con el patrón del SDK una consulta nunca abre JDBC. | Que el retraso entre escribir y leer no sea tolerable (ver «Retraso máximo»). |
| CQRS sin outbox (publicar después del commit) | Un fallo entre el commit y el envío pierde el evento y deja atrás la vista de lectura sin error visible (ADR-013). | Que se acepte el riesgo por escrito en un ADR. |

## Decisión

- **Backend:** Java 21 (Amazon Corretto) con Spring Boot 3.5.6 y Maven, sobre el SDK Aybar 0.7.1 (`aybar-bom`, que fija Spring Boot 3.5.6) y la plantilla hexagonal del servicio `aybar-atc` (`domain`, `application`, `adapters`, `infrastructure`, `boot`; paquete `com.aybarsac.atc`, puerto 8081). Starters encendidos: `common`, `config`, `logging`, `data`, `messaging`, `client`, `security`, `audit` y `web` (errores RFC 7807 y OpenAPI; DT-09). `aybar-starter-web` ya está declarado en `adapters/pom.xml` del repositorio `aybar-atc`: no hay que encenderlo.
- **Frontend:** Angular con el framework `@aybarcorp/*`: `@aybarcorp/ui-angular` (componentes), `@aybarcorp/auth` (login contra Control de acceso, ADR-009 y ADR-011) y `@aybarcorp/http` (los componentes no llaman a la red). Papel: **una sola aplicación (`app`) en la Etapa 1**, decisión del equipo (P-004) que se aprueba con este ADR; se pasa a `shell` con remotos solo si se extrae un módulo (ADR-001).
- **Escritura:** PostgreSQL con Flyway en la base única del v7 (ADR-001, DT-06), con la tabla de historial `flyway_schema_history_atc`, la línea base en la versión 0, los roles `app_atc_migracion` y `app_atc_servicio` y el job de migraciones aparte (ADR-001, punto 5).
- **Lectura:** almacén con API de MongoDB. Vistas: bandeja, casillero, búsqueda, tableros de calidad, «Mis tickets» de Mi Portal y estado del visor 3D. **Los jobs del plazo legal y del SLA leen PostgreSQL, no el almacén** (ADR-005).
- **Sincronización:** cada cambio inserta un evento en el outbox en la misma transacción (ADR-013), el publicador lo envía al bus (protocolo Kafka) y el **proyector del servicio** actualiza el almacén de lectura.
- **Quién escribe en el almacén de lectura (DT-02):** el proyector del servicio es el **único**. Es un consumidor en `adapters.inbound.messaging` que escribe por un adaptador de salida propio, no por `AybarReadRepository`.
- **Credencial de escritura del proyector:** un usuario nativo secundario del almacén de lectura, distinto del usuario de solo lectura que usa el resto del servicio por `aybar-starter-data` (`AYBAR_MONGO_URI`; el starter crea índices apagado y lee de secundarias, porque para él el almacén es de solo lectura). **En el servicio gestionado los permisos son de todo el clúster, no de una base:** Microsoft Learn (Azure DocumentDB, nombre actual de Azure Cosmos DB for MongoDB vCore) admite para los usuarios secundarios solo `readWriteAnyDatabase`, `clusterAdmin` y `readAnyDatabase`, y avisa: «Roles can't be assigned separately» (`https://learn.microsoft.com/en-us/azure/documentdb/secondary-users`). Por eso: **un clúster exclusivo de ATC por ambiente** (ADR-014), sin bases de otros servicios; el proyector usa `atc_proyector` con `readWriteAnyDatabase` y el servicio usa `atc_lectura` con `readAnyDatabase`. Las cadenas son secretos de Azure Key Vault (`atc-proyector-mongo-uri` y `atc-lectura-mongo-uri`, nombres que fija el equipo), leídos con identidad administrada (ADR-014). Nadie más recibe la del proyector, y el usuario administrador del clúster no lo usa ninguna aplicación.
- **Retraso máximo del almacén de lectura: 5 segundos (p95)** entre el commit y la vista actualizada; atención a 5 s y crítico a 10 s (regla Q-006 del acta F4). Sale de HU-067 CA-08 (cambio de estado reflejado en el visor en 5 s o menos). Con el publicador leyendo cada 1 s (ADR-013), el presupuesto es: 1 s de espera en el outbox, hasta 1 s de envío por el bus y hasta 3 s de proyección. Una operación que necesita leer lo que acaba de escribir devuelve el recurso desde la escritura y no consulta el almacén.
- **El dato del cliente no se copia:** el almacén guarda lo de ATC; `PARTY` es la fuente viva (ADR-003, DT-06).
- **Filtros de lectura:** por empresa según los roles que autorizan cada operación (globales o de la empresa activa, C-08 y D-178 de PJ-05; regla en `roles-y-permisos-atc.md` v0.4 §3). En Mi Portal, por el `PartyID` del cliente autenticado, que ATC lee del vínculo `IDN_USER_ACCOUNT` del token con `CuentaPersonaPort` (decisión del equipo, ED-01; ADR-009).
- **Búsqueda (`SVC_SEARCH_INDEX`, ENT-SVC-017 del PLT-05):** es una **colección del almacén de lectura**, no una tabla de PostgreSQL ni un cambio al v7. Guarda identificadores y metadatos de permiso, sin datos personales, y la escribe el proyector. La búsqueda por significado de HU-053 («Podría · flexible», R-01) **queda fuera de la Etapa 1** (P-025); cuando entre, usa la búsqueda vectorial del mismo servicio gestionado, con filtro previo por los permisos del gestor (HU-053 CA-02). El índice IVF sirve en M10 y M20; HNSW y DiskANN piden M30 o más (`https://learn.microsoft.com/en-us/azure/documentdb/vector-search`). Los vectores los da `text-embedding-3-small` de Azure OpenAI Service, el proveedor que decide el equipo (ED-17, ADR-007); mientras TI y Seguridad no lo habiliten en un ambiente, el simulador.
- Los servicios gestionados son los del ADR-014 (Azure Cosmos DB for MongoDB vCore, que Microsoft hoy llama Azure DocumentDB, para la lectura; Azure Event Hubs para el bus; Azure Key Vault para las credenciales).

## Consecuencias

- Obliga a construir lo que el SDK **no trae**. **Horas por pieza** (corrección del 26-oct). Lo **nuevo** que exige DT-02 y no está en el plan del PO son 4 piezas; las demás ya están dentro de las horas que el PO estimó para sus historias:

  | Pieza | Dónde | Horas |
  |---|---|---|
  | Outbox: tabla `SVC_OUTBOX_EVENT` y su migración, puerto y adaptador, inserción en la transacción | ADR-013 | 6 |
  | Publicador con ShedLock, purga a los 7 días y métrica de antigüedad | ADR-013 | 6 |
  | Proyector: consumidor idempotente, adaptador de escritura con su credencial y reconstrucción de las vistas (re-proyección completa desde PostgreSQL, que también es la reversión del almacén de lectura) | este ADR | 10 |
  | Bus: 5 tópicos y sus colas `.DLQ`, grupos de consumidores y autenticación con Event Hubs (`SASL_SSL`, ED-24) | ADR-013, ADR-014 | 6 |
  | **Total nuevo (fuera del plan del PO)** | | **28** |
  | Bitácoras con HMAC encadenado, triggers, roles de base y job de verificación | ADR-002 | incluidas en HU-004, HU-006 y HU-012 (ADR-02 del PO; tarea HU-ATC-004-T01) |
  | Calendario de días hábiles y feriados | ADR-005 | incluido en HU-003 (ADR-05 del PO; tarea HU-ATC-003-T03) |
  | Caché corta de la consulta 360 (el SDK no trae Redis) | ADR-003 | incluida en HU-050 (tarea HU-ATC-050-T02) |
  | Reintento y circuit breaker de los adaptadores externos | ADR-004 | incluidos en HU-050 (tarea HU-ATC-050-T02) |
  | ShedLock y su tabla | ADR-005 | incluido en el ADR-05 del PO y en las tareas de job (HU-ATC-010-T04 y 015-T04) |
  | Reglas ArchUnit de frontera entre módulos | ADR-001 | viene en la plantilla del SDK (`boot/src/test/java/com/aybarsac/atc/boot/NormaHexagonalTest.java`) |
  | WebSocket del visor: autenticación en el *handshake*, cierre al vencer el token y reparto entre réplicas | ADR-010 | incluido en HU-067 (tarea HU-ATC-067-T02) |

  El plan del PO tiene 243 h de 252 h (holgura de 9 h): la brecha es 28 h − 9 h = **19 h**. **P-025, decidida por el equipo (Brayan Hurtado, 26-oct-2026)**, la cierra así: las 28 h son tareas técnicas de la fundación (DT02-T01 a DT02-T06 en `backlog/tareas/EP-ATC-01.json`): outbox 6 h y re-proyección 3 h (Brayan), publicador 4 h (Jesús), proyector 7 h y purga y métrica del outbox 2 h (Michel) y bus 6 h (Daniel); y salen de la Etapa 1 las 5 HU de alcance flexible del PO (HU-ATC-037, 038, 039, 048 y 053; 16 h; R-01). Las 3 h restantes las absorbe el equipo (riesgo aceptado). La Etapa 1 queda en 227 h de historias más 28 h técnicas: 255 h. La re-proyección está dentro de las 10 h del proyector: no hay otra pieza sin estimar.
- Los eventos llevan solo referencias; el SDK no admite texto libre en el payload. El proyector completa el detalle desde PostgreSQL.
- Los consumidores (proyector, notificaciones, KPI, visor 3D, Mi Portal) son idempotentes.
- Frontend Angular: sin generador de cliente TypeScript desde el OpenAPI. Verificar que Angular y `@aybarcorp/ui-angular` están en la versión instalada (`aybar info comandos`, `aybar framework`).
- Impide:
  - Consultas de lectura contra PostgreSQL (salvo los jobs de plazos, ADR-005).
  - Que un `EventPublisher` (el puerto de mensajería del SDK) o un repositorio use tecnología fuera de `adapters`. `PublicadorEventos` es el puerto de la auditoría (`aybar-starter-audit`), que este ADR no reemplaza.
  - Que otro componente escriba en el almacén de lectura.
- Cuesta: **28 h** nuevas, en las tareas técnicas de la fundación (P-025, decidida: salen de la Etapa 1 las 5 HU de alcance flexible, 16 h, y el equipo absorbe las 3 h restantes) y **USD 1.310,41 al mes en producción** por los dos almacenes y el bus: Azure Database for PostgreSQL 378,37 (con alta disponibilidad entre zonas), Azure Cosmos DB for MongoDB (vCore) 844,44 y Azure Event Hubs 87,60; en DEV 155,11, en QA 315,63 y en PRE (UAT) 315,63; en los 4 ambientes, USD 2.096,78 (`arquitectura/costo-cloud.md` v0.5, §1.1: API pública de precios de Azure del 26-oct-2026, USD por mes, Brazil South; supuestos fijados en ED-12).

## Datos (puerta F4 de Gobierno de Datos)

- Vistas de lectura derivadas de las tablas de ATC: su dueño de dato es el de la tabla de origen, que fija `datos/registro-de-tablas.md` v0.3 §2 (Gerente de ATC); el acta F4 queda lista para la firma del Data Chief. La vista de avisos por rol y cola (ADR-009, ED-03) es una de ellas.
- Linaje: PostgreSQL → outbox → evento → proyector → almacén de lectura.
- PII: las vistas no guardan datos personales más allá de lo que el origen permita (RNF-SEC-010: está en el Excel `ATC_requerimientos (3).xlsx`, hoja `03_RNF`, fila 31).
- Regla de calidad (F10): retraso máximo de la vista de lectura = 5 s (p95) (Q-006). Cierra H-05 del acta F4 en lo que toca a quién escribe.

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-19 | Jesús Chávez Elías, con IA | Borrador con el stack definido el 19-oct |
| 0.1 (v4 en Nexora) | 2026-10-21 | Brayan, con IA | Línea de conflicto abierto con el ADR-01 del PO |
| 0.2 | 2026-10-22 | Jesús Chávez Elías, con IA | Escrito con DT-01 y DT-02. Fija el único escritor del almacén y su credencial, el retraso máximo (propuesta de 5 s) y el papel del frontend (propuesta). Lista las horas por estimar |
| 0.3 | 2026-10-26 | Brayan Hurtado, con IA | Horas estimadas por pieza (28 h de outbox, proyector y bus; 63 h en total; P-025); credencial de escritura del proyector con su permiso y su secreto; presupuesto del retraso de 5 s; filtros de lectura por origen del rol (C-08) y por `PartyID` (P-033); costo con número y fuente |
| 0.4 | 2026-10-26 | Brayan Hurtado, con IA | Segunda revisión del Líder Técnico: tres textos del SDK corregidos (`aybar-starter-web` ya declarado; registros de Resilience4j opcionales; `EventPublisher` frente a `PublicadorEventos`); usuarios del almacén de lectura según Microsoft Learn (permisos de clúster: clúster exclusivo de ATC por ambiente); búsqueda como colección de lectura y búsqueda vectorial para HU-053; re-proyección dentro de las 10 h; quién confirma las horas y propuesta de recorte de 16 h para P-025; Flyway de ADR-001; costo con PRE (UAT); dueño de dato remitido al registro |
| 0.4 | 2026-10-26 | Brayan Hurtado, con IA | Barrido de coherencia (misma versión, sin cambio de decisión): el origen cita `analisis/decisiones.md` v0.6, la versión vigente (decía v0.5). |
| 0.5 | 2026-10-26 | Brayan Hurtado, con IA | Corrección de horas (26-oct): lo nuevo que exige DT-02 y no está en el plan del PO son **28 h** (outbox 6, publicador 6, proyector 10 y bus 6); las demás piezas de la tabla ya están dentro de las horas que el PO estimó para sus historias (ADR-02 y ADR-05 del PO; HU-003, 004, 006, 012, 050 y 067; ArchUnit viene en la plantilla del SDK). Brecha: 28 h − 9 h de holgura = 19 h; el cierre lo decide el coordinador (P-025). Se quitan la confirmación por los 4 desarrolladores y la propuesta de recorte de 16 h y 38 h. Filtro de Mi Portal por `CuentaPersonaPort` (ED-01); vectores con Azure OpenAI (ED-17); bus con `SASL_SSL` (ED-24); papel `app` como decisión del equipo; diferencia con el PO en ED-19; supuestos del costo en ED-12 |
| 0.6 | 2026-10-26 | Brayan Hurtado, con IA | P-025 decidida por el equipo (`analisis/decisiones.md` v0.8): las 28 h de la tabla son tareas técnicas de la fundación (DT02-T01 a T06 en `backlog/tareas/EP-ATC-01.json`, con su responsable) y salen de la Etapa 1 las 5 HU de alcance flexible (16 h); el equipo absorbe 3 h (riesgo aceptado). La búsqueda por significado de HU-053 queda fuera de la Etapa 1. «Cuesta» y el origen ya no remiten la brecha al coordinador |

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v4 de Nexora; reescrito con IA (Claude, 2026-10-22) a partir de la revisión del Líder Técnico del 22-oct y actualizado con IA (Claude, 2026-10-26). — Revisado por: Brayan Manuel Hurtado Paucar, 26-oct-2026 · Aprueba: TL
