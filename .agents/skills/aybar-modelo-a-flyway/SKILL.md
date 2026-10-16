---
name: aybar-modelo-a-flyway
description: Del modelo de datos aprobado del paquete (diccionario, ER y estados de docs/datos) a migraciones Flyway reversibles con expand → contract y entidades JPA fuera del dominio, pasando por la puerta de Gobierno de Datos. Usar al crear o cambiar tablas, columnas, índices o restricciones, al escribir un V<n>__*.sql, una @Entity, o cuando aparezcan diccionario de datos, ER, backfill o rollback de datos.
---

# Del modelo a Flyway

El modelo que manda es el de `docs/datos/` aprobado en G3 con la puerta F4 de
Gobierno de Datos. La migración lo implementa; no lo rediseña. Una tabla, una
columna o una clave que no esté en el modelo aprobado es una desviación mayor:
vuelve a F4, no se "agrega de paso".

## Antes de escribir SQL

- G3 approved en `origin/main` y acta de la puerta F4 de datos (skill `aybar-gobierno-datos`).
- CAD-F5 registrado en la HU: qué lee, qué escribe, migración, backfill o borrado declarados (`.agents/templates/checklist-cad-f5.md`).
- Si el diccionario y el ER no coinciden (tipo, nulabilidad, cardinalidad), es una contradicción: se reporta con `ruta:línea`, no se elige.

## Del diccionario al DDL

| En `docs/datos/` | En la migración |
|---|---|
| Entidad y atributo | Tabla y columna, con los nombres del diccionario |
| Tipo y longitud | Tipo PostgreSQL equivalente; si no hay equivalente claro, se pregunta |
| Obligatorio | `NOT NULL`. En tabla con datos, va con default o backfill declarado |
| Clave y relación del ER | `PRIMARY KEY`, `FOREIGN KEY`, `UNIQUE` |
| Estados (`estados.md`) | `CHECK` o tabla de catálogo, según el modelo aprobado |
| Índice declarado | `CREATE INDEX`; si no está declarado, es observación menor para Gobierno de Datos |

## Flyway

- Archivos en `adapters/src/main/resources/db/migration/`, `V<n>__<descripcion>.sql`, secuenciales. Propiedades en `aybar.data.flyway.*` (contrato: `docs/skills/aybar-starter-data.md`).
- **Una migración aplicada no se edita jamás**: Flyway valida el checksum. Se corrige con una migración nueva.
- Sin `INSERT` de secretos ni de datos reales. Los catálogos y semillas, con datos sintéticos o los aprobados en el modelo.
- Flyway Community no ejecuta migraciones de deshacer (`U__`). La reversión es un script aparte, escrito y probado, en el Plan de Rollback de Datos (`.agents/templates/plan-rollback-datos.md`).

## Reversible: expand → contract

1. **Expand**: agrega lo nuevo sin romper lo viejo (columna nullable, tabla nueva, índice). El código de este release funciona con los dos esquemas.
2. **Migrar**: backfill declarado, idempotente y por lotes si hay volumen.
3. **Contract**: borrar o renombrar lo viejo va en un **release posterior**, cuando ningún consumidor lo usa y pasó la ventana de F10. **Nunca** se borra en el mismo release que el reemplazo.

Un borrado físico de datos productivos o un cambio de clave o granularidad es
desviación mayor de CAD-F5 y exige Release Data Gate.

## Entidades JPA: fuera del dominio

- La `@Entity` vive en `adapters.outbound.persistence.postgres` (`<Nombre>JpaEntity`), y puede extender `EntidadAuditable`. La configuración transversal va en `infrastructure`; las entidades, nunca en `domain` ni en `application`.
- El modelo de dominio es otra clase, Java puro. El adaptador mapea entre las dos e implementa el puerto de `domain.port.out`.
- `NormaHexagonalTest` corta JPA o Jakarta Persistence en `domain`: si falla, mueve la clase; no toques la regla.
- Las lecturas van al almacén de lectura (CQRS, skill `aybar-cqrs`). No hay migraciones Flyway para él.

## Puerta de Gobierno de Datos

F8: contrasta el esquema implementado con el aprobado (diff de esquema, integridad
referencial, logs de migración). F9: Ficha de Impacto y Plan de Rollback de Datos,
probado en QA en D-2. Las prepara el agente `gobierno-datos`; las firma Gobierno
de Datos. Detalle: skill `aybar-gobierno-datos`.
