---
name: aybar-hexagonal
description: Coloca clases en el hexágono Maven multi-módulo Aybar (domain, application, adapters, infrastructure, boot) y aplica ArchUnit. Usar cuando se cree o mueva una clase, se pregunte en qué paquete va, o se toquen poms de un microservicio Aybar.
---

# Hexágono Aybar

Contrato: en un servicio generado, la Regla 1 de `AGENTS.md` y `NormaHexagonalTest` (en `boot/src/test`); en el repo del SDK, `docs/arquitectura-microservicio-hexagonal.md` sección 3.

## Módulos

- `domain`: model, valueobject, service (sin `@Service` Spring), event, error, `port.in`, `port.out`. Cero Spring/Kafka/JPA/Mongo/OpenAPI.
- **Allowlist SDK del dominio (2 paquetes):** `com.aybarsac.sdk.data.cqrs` y `com.aybarsac.sdk.common`. Cualquier otro `com.aybarsac.sdk..` en `domain` rompe el build.
  - Fuente de verdad: la regla `el_dominio_solo_usa_el_sdk_seguro` del test ArchUnit `boot/src/test/java/<paquete>/boot/NormaHexagonalTest.java` que se genera en **cada microservicio**. Si esta skill y ese test discrepan, **manda el test**: es el que pone el build en rojo.
  - `com.aybarsac.sdk.errores` NO está en la allowlist: el paquete no existe en ningún jar del SDK (ver la skill `aybar-errores`, NO IMPLEMENTADO). No escribas `implements com.aybarsac.sdk.errores.CodigoNegocio`: no compila. Cuando el SDK lo publique, se añadirá al test y a esta lista.
- `application`: usecase, command, query, dto. Solo depende de `domain`.
- `adapters`: `inbound.rest` / `inbound.rest.openapi` / `inbound.messaging`; `outbound.persistence.postgres|mongo` (`redis` es solo convención de nombre reservada: el SDK **no** soporta Redis, ver skill `aybar-redis`); `outbound.messaging`; `outbound.external`.
- `infrastructure`: security, configuration, observability, resilience. Starters logging/security/config.
- `boot`: único `*Application.java`.

## Dónde va

| Cosa | Sitio |
|---|---|
| Entidad de negocio | `domain.model` |
| Caso de uso | `application.usecase` |
| `@RestController` | `adapters.inbound.rest` |
| `@Operation` / `@Schema` | `adapters.inbound.rest` (nunca domain/application) |
| Bean `OpenAPI` / `GroupedOpenApi` | `adapters.inbound.rest.openapi` |
| Consumer Kafka | `adapters.inbound.messaging` |
| SQL / JPA | `adapters.outbound.persistence.postgres` |
| Lectura Mongo | `adapters.outbound.persistence.mongo` |
| `KafkaTemplate` | solo adapters messaging |

Si ArchUnit falla, mueve la clase; no desactives la regla.
