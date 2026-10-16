---
name: aybar-cqrs
description: CQRS Aybar — comandos a PostgreSQL, lecturas a MongoDB, proyección por Kafka. Usar al persistir, consultar, proyectar, o si una query abre JDBC.
---

# CQRS Aybar

> **Contrato detallado:** `aybar-starter-data` (en un servicio generado, `docs/skills/aybar-starter-data.md`; en el repo del SDK, `aybar-starter-data/SKILL.md`): propiedades, variables obligatorias y trampas. Esta skill es el resumen transversal; si discrepan, **manda el contrato**.

- **Comando HTTP:** REST → usecase → `WriteRepository` (Postgres) → `EventPublisher` (Kafka). El request no espera a Mongo.
- **Query HTTP:** REST → usecase → `ReadRepository` (Mongo). **Nunca** Postgres en lecturas.
- **Proyección:** consumer `adapters.inbound.messaging` → usecase → Mongo. Vive en el **servicio**, no en un starter genérico.

Puertos en `domain.port.out`: `WriteRepository`, `ReadRepository`, `EventPublisher`.

`companyId` filtra tenant en queries; no va en el connection string.

**Sin outbox (NO IMPLEMENTADO, ver `aybar-outbox`):** el commit en Postgres y
el publish a Kafka no son atomicos. Un fallo entre ambos pierde el evento y la
proyeccion Mongo queda atras, sin error visible. Si el caso de negocio no
tolera perder eventos, la HU es una decision de arquitectura (G3): implementar
outbox en el servicio o aceptar el riesgo por escrito en el ADR. No prometas
entrega garantizada en criterios de aceptacion que este patron no puede
cumplir.
