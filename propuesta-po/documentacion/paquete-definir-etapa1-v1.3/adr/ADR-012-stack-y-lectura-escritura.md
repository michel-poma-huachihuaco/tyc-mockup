---
id: "ADR-012"
tipo: "adr"
titulo: "ADR-012: Stack (Java 21 con Spring Boot y Angular) y CQRS: PostgreSQL para escribir, API de MongoDB para leer"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.3"
owner: "Jesús Chávez Elías"
aprobadores: [tech_lead]
fecha: "2026-10-26"
relacionados: [ADR-001, ADR-003, ADR-005, ADR-009, ADR-013, ADR-014]
tags: [adr, arquitectura, g3]
---

# ADR-012: Stack (Java 21 con Spring Boot y Angular) y CQRS: PostgreSQL para escribir, API de MongoDB para leer

- Estado: propuesto
- Ticket: AYB-0001 · Versión 0.3 · Fecha: 2026-10-26 (historial al final)
- Owner: Jesús Chávez Elías (Dev 2) · Aprueba: Líder Técnico (`aprobadores: [tech_lead]`) · Revisado por: (pendiente)
- Compatibilidad con M0 (Arquitectura de Directorio): **requiere dispensa (solicitada)**. El Líder Técnico la pidió a Enrique Albán (Data Chief) el 22-oct-2026; M0 no está en el repositorio ni en Nexora (P-005).
- Origen: decisiones DT-01 y DT-02 del Líder Técnico (Jose Jara, 22-oct-2026), registradas en `analisis/decisiones.md` v0.5. Cierra D-001, D-002, P-003 y P-009 (la decisión; las horas, en la tabla de este ADR, las decide P-025).
- Reemplaza el stack del PLT-05 v1.3 §4.1 (Node.js con NestJS, React y una sola PostgreSQL con índice de búsqueda) y el ADR-01 del PO. **El PO actualiza el PLT-01 §1 y el PLT-05** (P-027).

## Contexto

El PLT-05 v1.3 propuso NestJS, React y una sola base PostgreSQL con un índice de búsqueda, y lo marcó «stack propuesto por el PO, a validar con Arquitectura». El Líder Técnico decidió el 22-oct el stack del SDK Aybar 0.7.1 y CQRS completo desde la Etapa 1.

El SDK trae seguridad OIDC y JWT, logs con correlationId, auditoría con lista blanca de datos personales (Ley 29733), mensajería Kafka con cola de errores y reintento acotado, PostgreSQL con Flyway, lectura sobre la API de MongoDB y los puertos `AybarWriteRepository` y `AybarReadRepository`. No trae outbox, proyector, caché Redis, calendario de días hábiles, bitácora con HMAC, circuit breaker ni reintento en el cliente HTTP (skill `aybar-estado-del-sdk`).

## Opciones evaluadas

| Opción | Por qué no | Qué la haría reconsiderar |
|---|---|---|
| Node.js + NestJS + React (propuesta del PLT-05) | Descartada por DT-01. En NestJS habría que construir seguridad, logs, auditoría de datos personales, mensajería y cliente HTTP corporativos. | — |
| Una sola base PostgreSQL con índice de búsqueda | DT-02 fija dos almacenes; con el patrón del SDK una consulta nunca abre JDBC. | Que el retraso entre escribir y leer no sea tolerable (ver «Retraso máximo»). |
| CQRS sin outbox (publicar después del commit) | Un fallo entre el commit y el envío pierde el evento y deja atrás la vista de lectura sin error visible (ADR-013). | Que se acepte el riesgo por escrito en un ADR. |

## Decisión

- **Backend:** Java 21 (Amazon Corretto) con Spring Boot 3.5.6 y Maven, sobre el SDK Aybar 0.7.1 (`aybar-bom`, que fija Spring Boot 3.5.6) y la plantilla hexagonal del servicio `aybar-atc` (`domain`, `application`, `adapters`, `infrastructure`, `boot`; paquete `com.aybarsac.atc`, puerto 8081). Starters encendidos: `common`, `config`, `logging`, `data`, `messaging`, `client`, `security` y `audit`; se enciende además `web` (errores RFC 7807 y OpenAPI; DT-09) con `aybar add starter web` antes de escribir los controladores.
- **Frontend:** Angular con el framework `@aybarcorp/*`: `@aybarcorp/ui-angular` (componentes), `@aybarcorp/auth` (login contra Control de acceso, ADR-009 y ADR-011) y `@aybarcorp/http` (los componentes no llaman a la red). Papel: **una sola aplicación (`app`) en la Etapa 1**, propuesta del equipo (P-004) que confirma el Líder Técnico; se pasa a `shell` con remotos solo si se extrae un módulo (ADR-001).
- **Escritura:** PostgreSQL con Flyway en la base única del v7 (ADR-001, DT-06).
- **Lectura:** almacén con API de MongoDB. Vistas: bandeja, casillero, búsqueda, tableros de calidad, «Mis tickets» de Mi Portal y estado del visor 3D. **Los jobs del plazo legal y del SLA leen PostgreSQL, no el almacén** (ADR-005).
- **Sincronización:** cada cambio inserta un evento en el outbox en la misma transacción (ADR-013), el publicador lo envía al bus (protocolo Kafka) y el **proyector del servicio** actualiza el almacén de lectura.
- **Quién escribe en el almacén de lectura (DT-02):** el proyector del servicio es el **único**. Es un consumidor en `adapters.inbound.messaging` que escribe por un adaptador de salida propio, no por `AybarReadRepository`.
- **Credencial de escritura del proyector:** un usuario propio del almacén de lectura con permiso de lectura y escritura **solo sobre la base de ATC**, distinto del usuario de solo lectura que usa el resto del servicio por `aybar-starter-data` (`AYBAR_MONGO_URI`; el starter crea índices apagado y lee de secundarias, porque para él el almacén es de solo lectura). La cadena del proyector es un secreto de Azure Key Vault (`atc-proyector-mongo-uri`, nombre propuesto), leído con identidad administrada (ADR-014). Nadie más recibe esa credencial.
- **Retraso máximo del almacén de lectura: 5 segundos (p95)** entre el commit y la vista actualizada; atención a 5 s y crítico a 10 s (regla Q-006 del acta F4). Sale de HU-067 CA-08 (cambio de estado reflejado en el visor en 5 s o menos). Con el publicador leyendo cada 1 s (ADR-013), el presupuesto es: 1 s de espera en el outbox, hasta 1 s de envío por el bus y hasta 3 s de proyección. Una operación que necesita leer lo que acaba de escribir devuelve el recurso desde la escritura y no consulta el almacén.
- **El dato del cliente no se copia:** el almacén guarda lo de ATC; `PARTY` es la fuente viva (ADR-003, DT-06).
- **Filtros de lectura:** por empresa según el origen del rol de ATC en el token (global o por empresa, C-08 y D-178 de PJ-05; `roles-y-permisos-atc.md`). En Mi Portal, por el `PartyID` del cliente, que el token no trae (P-033).
- Los servicios gestionados son los del ADR-014 (Azure Cosmos DB for MongoDB vCore para la lectura, Azure Event Hubs para el bus, Azure Key Vault para las credenciales).

## Consecuencias

- Obliga a construir lo que el SDK **no trae**. **Horas estimadas por pieza** (propuesta de Brayan Hurtado con IA el 26-oct, sobre el desglose de las tareas y el ritmo «con IA» del PLT-04; la confirman el equipo y el Líder Técnico, P-025):

  | Pieza | Dónde | Horas |
  |---|---|---|
  | Outbox: tabla `SVC_OUTBOX_EVENT` y su migración, puerto y adaptador, inserción en la transacción | ADR-013 | 6 |
  | Publicador con ShedLock, purga a los 7 días y métrica de antigüedad | ADR-013 | 6 |
  | Proyector: consumidor idempotente, adaptador de escritura con su credencial y reconstrucción de las vistas | este ADR | 10 |
  | Bus: 5 tópicos y sus colas `.DLQ`, grupos de consumidores y autenticación con Event Hubs (prueba de P-032) | ADR-013, ADR-014 | 6 |
  | **Subtotal outbox, proyector y bus** | | **28** |
  | Bitácoras con HMAC encadenado, triggers, roles de base y job de verificación | ADR-002 | 12 |
  | Calendario de días hábiles y feriados | ADR-005 | 6 |
  | Caché corta de la consulta 360 (el SDK no trae Redis) | ADR-003 | 4 |
  | Reintento y circuit breaker de los adaptadores externos | ADR-004 | 4 |
  | ShedLock y su tabla | ADR-005 | 2 |
  | Reglas ArchUnit de frontera entre módulos | ADR-001 | 3 |
  | Reparto de los eventos del visor entre réplicas | ADR-010 | 4 |
  | **Total** | | **63** |

  El plan del PO tiene 243 h de 252 h (holgura de 9 h): faltan **54 h**. Es la estimación que pide P-025, que sigue abierta (por eso `arquitectura/costo-cloud.md` §4 la da por no confirmada) hasta que el equipo la confirme y el Líder Técnico y el PO decidan qué sale del alcance o cuántas horas se suman.
- Los eventos llevan solo referencias; el SDK no admite texto libre en el payload. El proyector completa el detalle desde PostgreSQL.
- Los consumidores (proyector, notificaciones, KPI, visor 3D, Mi Portal) son idempotentes.
- Frontend Angular: sin generador de cliente TypeScript desde el OpenAPI. Verificar que Angular y `@aybarcorp/ui-angular` están en la versión instalada (`aybar info comandos`, `aybar framework`).
- Impide:
  - Consultas de lectura contra PostgreSQL (salvo los jobs de plazos, ADR-005).
  - Que un `PublicadorEventos` o un repositorio use tecnología fuera de `adapters`.
  - Que otro componente escriba en el almacén de lectura.
- Cuesta: **63 h** de lo que el SDK no trae (tabla de arriba; P-025) y **USD 1.310,41 al mes en producción** por los dos almacenes y el bus: Azure Database for PostgreSQL 378,37 (con alta disponibilidad entre zonas), Azure Cosmos DB for MongoDB (vCore) 844,44 y Azure Event Hubs 87,60; en DEV 155,11 y en QA 315,63 (`arquitectura/costo-cloud.md` v0.3 (API de precios de Azure del 26-oct-2026, USD por mes, región base Brazil South; supuestos de región, volumen y tamaño en P-044), §1.1).

## Datos (puerta F4 de Gobierno de Datos)

- Vistas de lectura derivadas; dueño de dato = el módulo que origina la escritura.
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

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v4 de Nexora; reescrito con IA (Claude, 2026-10-22) a partir de la revisión del Líder Técnico del 22-oct y actualizado con IA (Claude, 2026-10-26). — Revisado por: (pendiente) · Aprueba: TL
