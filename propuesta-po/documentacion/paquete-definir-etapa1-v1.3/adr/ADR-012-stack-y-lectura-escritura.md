---
id: "ADR-012"
tipo: "adr"
titulo: "ADR-012: Stack (Java con Spring Boot y Angular) y bases separadas: PostgreSQL para escribir, MongoDB para leer"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.1"
owner: "[por asignar: arquitecto / TL]"
aprobadores: []
fecha: "2026-10-19"
relacionados: [ADR-001]
tags: [adr, arquitectura, g3]
---

# ADR-012: Stack (Java con Spring Boot y Angular) y bases separadas: PostgreSQL para escribir, MongoDB para leer

- Estado: propuesto
- Ticket: AYB-0001 · Fecha: 2026-10-19
- Compatibilidad con M0 (Arquitectura de Directorio): **por confirmar** (M0 no está en el repositorio; la declara el TL o se solicita dispensa al Data Chief o al Directorio)
- Origen: nuevo en esta propuesta
- Origen: definición del líder técnico del 19-oct-2026. Reemplaza el stack del PLT-05 (NestJS y React; una sola base PostgreSQL con un índice de búsqueda por decidir).
- **Conflicto abierto con el PLT-01 v1.3 (ADR-01 del PO): decide el líder técnico.** El PO propone NestJS en el backend, React con TypeScript en el frontend y una sola PostgreSQL Multi-AZ con índice de búsqueda (PLT-01 §1; PLT-05 §4.1 y §4.4: «stack propuesto por el PO, a validar con Arquitectura»). Este ADR propone Java con Spring Boot, Angular, PostgreSQL para escribir y MongoDB para leer. No está en el registro de 11 ADR del PO y sigue en propuesta.

> Las opciones evaluadas son una propuesta de redacción a partir del motivo del PLT-05 y de las skills del SDK: el arquitecto las confirma o corrige antes de pedir la aprobación del TL.

## Contexto

El PLT-05 v1.3 (4.1) propuso Node.js con NestJS, React con TypeScript y una sola base PostgreSQL con un índice de búsqueda. El líder técnico definió: **Java con Spring Boot** en el backend, **Angular** en el frontend, y dos bases: **PostgreSQL para guardar y MongoDB para leer**.

Ese stack es el del SDK Aybar 0.7.1 y el del repositorio `aybar-ATC`. El SDK trae seguridad OIDC y JWT, logs con correlationId, auditoría con lista blanca de datos personales (Ley 29733), mensajería Kafka con cola de errores y reintento acotado, PostgreSQL con Flyway, lectura sobre la API de MongoDB y los puertos de escritura y lectura (`AybarWriteRepository`, `AybarReadRepository`).

## Opciones evaluadas

| Opción | Por qué no | Qué la haría reconsiderar |
|---|---|---|
| Node.js + NestJS + React (propuesta del PLT-05) | El líder técnico definió otro stack; el SDK y la plantilla ya existen en Java. | Que el equipo no pueda trabajar con el SDK. |
| Una sola base PostgreSQL con un índice de búsqueda | El líder técnico definió dos bases; con el patrón del SDK una consulta nunca abre JDBC. | Que el retraso entre escribir y leer no sea tolerable. |
| React en el frontend | El líder técnico eligió Angular; el SDK ofrece plantillas para React y para Angular. | — |

## Decisión

- **Backend:** Java 21 con Spring Boot 3.5.6 y Maven, sobre el SDK Aybar 0.7.1 (`aybar-bom`) y la plantilla hexagonal `aybar-ATC` (paquete `com.aybarsac.atc`, puerto 8081). Starters encendidos: `common`, `config`, `logging`, `data`, `messaging`, `client`, `security` y `audit`.
- **Starter `web` apagado:** `aybar-starter-web` (errores RFC 7807 y OpenAPI) no está encendido en la plantilla actual; se enciende con `aybar add starter web` antes de escribir los controladores (skill `aybar-contrato-api`).
- **Frontend:** Angular con los componentes `@aybarcorp/ui-angular` del SDK.
- **Escritura:** PostgreSQL con Flyway, una sola instancia con las tablas del v7 por módulo (ADR-001).
- **Lectura:** almacén documental con API de MongoDB: vistas para la bandeja, la búsqueda y los tableros de ATC.
- **Sincronización:** cada cambio publica un evento por el bus (protocolo Kafka) y un proyector actualiza el almacén de lectura (ADR-013).
- **El dato del cliente no se copia:** el almacén de lectura guarda lo de ATC (ADR-003).
- Los nombres de los servicios gestionados los fija el ADR de plataforma (ADR-014, skill `aybar-lexico`).

## Consecuencias

- Obliga a:
  - Construir lo que el SDK **no trae** (skill `aybar-estado-del-sdk` y contratos de los starters): el outbox (ADR-013), el proyector hacia el almacén de lectura, la caché Redis, el calendario de días hábiles y feriados, la bitácora con HMAC y el candado de almacenamiento (la auditoría del SDK es técnica, no la bitácora legal de ADR-002 y ADR-006), y reintento y circuit breaker.
  - El filtro por `companyId` en cada consulta de lectura: el SDK es multiempresa por claim.
  - Definir **qué vistas viven en el almacén de lectura** y **cuánto retraso se tolera**.
  - Que los eventos lleven solo referencias (el SDK no admite texto libre en el payload): el proyector completaría el detalle desde PostgreSQL, a validar con el equipo.
  - **Decidir quién escribe en el almacén de lectura.** El contrato de `aybar-starter-data` lo describe como solo lectura para el servicio (índices automáticos apagados, lectura preferente de réplicas secundarias), mientras la skill `aybar-cqrs` pone el proyector en el servicio.
  - Frontend Angular: decidir el papel (`app`, o `shell` con remotos para consola, Mi Portal, visor 3D y formularios). Sin generador de cliente TypeScript desde el OpenAPI; los componentes llaman a la red solo por `@aybarcorp/http`.
  - Verificar que Angular y `@aybarcorp/ui-angular` están en la versión instalada (`aybar info comandos`, `aybar framework`).
- Impide:
  - Consultas de lectura contra PostgreSQL.
  - Que un `PublicadorEventos` o un repositorio use tecnología fuera de `adapters`.
- Cuesta: Dos bases, bus de eventos y su operación; costo cloud **por estimar** (TL / DevOps).

## Datos (puerta F4 de Gobierno de Datos)

- Vistas de lectura derivadas; dueño de dato = el módulo que origina la escritura.
- Linaje: PostgreSQL → evento → proyector → almacén de lectura.
- PII: las vistas no guardan datos personales más allá de lo que el origen permita (RNF-SEC-010).
- Regla de calidad (F10): retraso máximo de la vista de lectura (por definir).

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v3 de Jesús Chávez Elías en Nexora; actualizado por Brayan con IA (Claude, 2026-10-21) a la v1.3 del PO: línea de conflicto abierto con el ADR-01 del PO (stack). — Revisado por: (pendiente) · Aprueba: TL
