---
id: "ADR-012"
tipo: "adr"
titulo: "ADR-012: Stack (Java 21 con Spring Boot y Angular) y CQRS: PostgreSQL para escribir, API de MongoDB para leer"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.2"
owner: "Jesús Chávez Elías"
aprobadores: [tech_lead]
fecha: "2026-10-22"
relacionados: [ADR-001, ADR-003, ADR-005, ADR-013, ADR-014]
tags: [adr, arquitectura, g3]
---

# ADR-012: Stack (Java 21 con Spring Boot y Angular) y CQRS: PostgreSQL para escribir, API de MongoDB para leer

- Estado: propuesto
- Ticket: AYB-0001 · Fecha: 2026-10-22
- Compatibilidad con M0 (Arquitectura de Directorio): **requiere dispensa (solicitada)**. El Líder Técnico la pide a Enrique Albán (Data Chief); M0 no está en el repositorio.
- Origen: decisiones DT-01 y DT-02 del Líder Técnico (Jose Jara, 22-oct-2026), registradas en `analisis/decisiones.md` v0.3. Cierra D-001, D-002, P-003 y P-009 (la decisión; las horas siguen en P-025).
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

- **Backend:** Java 21 (Amazon Corretto) con Spring Boot 3.5.6 y Maven, sobre el SDK Aybar 0.7.1 (`aybar-bom`) y la plantilla hexagonal `aybar-ATC` (`domain`, `application`, `adapters`, `infrastructure`, `boot`; paquete `com.aybarsac.atc`, puerto 8081). Starters encendidos: `common`, `config`, `logging`, `data`, `messaging`, `client`, `security` y `audit`; se enciende además `web` (errores RFC 7807 y OpenAPI; DT-09) con `aybar add starter web` antes de escribir los controladores.
- **Frontend:** Angular con el framework `@aybarcorp/*` (`@aybarcorp/ui-angular`; los componentes llaman a la red solo por `@aybarcorp/http`). Papel: **propuesta del equipo (P-004): una sola aplicación (`app`) en la Etapa 1**; se pasa a `shell` con remotos solo si se extrae un módulo (ADR-001). La confirma el Líder Técnico.
- **Escritura:** PostgreSQL con Flyway en la base única del v7 (ADR-001, DT-06).
- **Lectura:** almacén con API de MongoDB. Vistas: bandeja, búsqueda, tableros de calidad y estado para el visor 3D. **Los jobs del plazo legal y del SLA leen PostgreSQL, no el almacén** (ADR-005).
- **Sincronización:** cada cambio inserta un evento en el outbox en la misma transacción (ADR-013), se publica por el bus (protocolo Kafka) y el **proyector del servicio** actualiza el almacén de lectura.
- **Quién escribe en el almacén de lectura (DT-02):** el proyector del servicio es el único. Usa un cliente y una **credencial de escritura propios**, guardados en Key Vault y distintos de los del starter `aybar-starter-data`, que es solo lectura para el servicio (índices automáticos apagados, lectura preferente de secundarias). Las consultas del servicio usan una credencial de solo lectura. El proyector es un consumidor en `adapters.inbound.messaging` y escribe por un adaptador de salida propio, no por `AybarReadRepository`.
- **Retraso máximo del almacén de lectura:** **5 segundos (p95)** entre el commit y la vista actualizada. Es una propuesta que sale de HU-067 CA-08 (cambio de estado reflejado en el visor en 5 s o menos); la confirma el Líder Técnico. Atención a 1x (5 s) y crítico a 2x (10 s), como la regla Q-006 del acta F4. Una operación que necesita leer lo que acaba de escribir devuelve el recurso desde la escritura y no consulta el almacén.
- **El dato del cliente no se copia:** el almacén guarda lo de ATC; `PARTY` es la fuente viva (ADR-003, DT-06).
- Los servicios gestionados son los del ADR-014 (Azure Cosmos DB for MongoDB vCore para la lectura, Azure Event Hubs para el bus, Azure Key Vault para las credenciales).

## Consecuencias

- Obliga a construir lo que el SDK **no trae**. Horas: **por estimar por el equipo (P-025)**; el plan del PO (243 h de 252 h) deja 9 h de holgura.

  | Pieza | Dónde | Horas |
  |---|---|---|
  | Outbox y publicador | ADR-013 | por estimar |
  | Proyector y vistas de lectura | este ADR | por estimar |
  | Configuración del bus y de la credencial de escritura del proyector | ADR-014 | por estimar |
  | Bitácoras con HMAC (5) y su verificación | ADR-002 | por estimar |
  | Calendario de días hábiles y feriados | ADR-005 | por estimar |
  | Caché corta de la consulta 360 (el SDK no trae Redis) | ADR-003 | por estimar |
  | Reintento y circuit breaker de los adaptadores externos | ADR-004 | por estimar |
  | ShedLock y su tabla | ADR-005 | por estimar |
  | Reglas ArchUnit de frontera entre módulos | ADR-001 | por estimar |

- Filtro por `companyId` en cada consulta de lectura: el SDK es multiempresa por claim. En Mi Portal el filtro es el `PartyID` del token.
- Los eventos llevan solo referencias; el SDK no admite texto libre en el payload. El proyector completa el detalle desde PostgreSQL.
- Los consumidores (proyector, notificaciones, KPI, visor 3D, Mi Portal) son idempotentes.
- Frontend Angular: sin generador de cliente TypeScript desde el OpenAPI. Verificar que Angular y `@aybarcorp/ui-angular` están en la versión instalada (`aybar info comandos`, `aybar framework`).
- Impide:
  - Consultas de lectura contra PostgreSQL.
  - Que un `PublicadorEventos` o un repositorio use tecnología fuera de `adapters`.
  - Que otro componente escriba en el almacén de lectura.
- Cuesta: dos almacenes, un bus y su operación; las horas, en la tabla de arriba (por estimar). Costo cloud: **sin cifra todavía** (ADR-014; `arquitectura/costo-cloud.md` espera los volúmenes).

## Datos (puerta F4 de Gobierno de Datos)

- Vistas de lectura derivadas; dueño de dato = el módulo que origina la escritura.
- Linaje: PostgreSQL → outbox → evento → proyector → almacén de lectura.
- PII: las vistas no guardan datos personales más allá de lo que el origen permita (RNF-SEC-010, que sí está en el Excel (3), hoja `03_RNF`).
- Regla de calidad (F10): retraso máximo de la vista de lectura = 5 s (p95) (Q-006). Cierra H-05 del acta F4 en lo que toca a quién escribe.

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-19 | Jesús Chávez Elías, con IA | Borrador con el stack definido el 19-oct |
| 0.1 (v4 en Nexora) | 2026-10-21 | Brayan, con IA | Línea de conflicto abierto con el ADR-01 del PO |
| 0.2 | 2026-10-22 | Jesús Chávez Elías, con IA | Escrito con DT-01 y DT-02. Fija el único escritor del almacén y su credencial, el retraso máximo (propuesta de 5 s) y el papel del frontend (propuesta). Lista las horas por estimar |

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v4 de Nexora; reescrito con IA (Claude, 2026-10-22) a partir de la revisión del Líder Técnico del 22-oct. — Revisado por: (pendiente) · Aprueba: TL
