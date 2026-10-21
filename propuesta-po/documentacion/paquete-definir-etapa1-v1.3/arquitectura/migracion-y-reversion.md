---
id: "SPEC-ARQ-MIGRACION"
tipo: "spec"
titulo: "Estrategia de migración y reversión (esbozo)"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.1"
owner: "[por asignar: arquitecto / TL]"
aprobadores: []
fecha: "2026-10-19"
relacionados: [ADR-012, ADR-013]
tags: [arquitectura, migracion, g3]
---

# Estrategia de migración y reversión (esbozo)

- **Base de escritura (PostgreSQL):** migraciones Flyway `V<n>__<descripcion>.sql` en `adapters/src/main/resources/db/migration/`, en el patrón *expand → contract*: primero se agrega lo nuevo sin romper lo viejo; se migra con relleno declarado e idempotente; lo viejo se borra en un release posterior. Una migración aplicada no se edita nunca (skill `aybar-modelo-a-flyway`).
- **Reversión:** Flyway Community no trae migraciones de deshacer; la reversión de datos es un script aparte, escrito y probado, en el Plan de Rollback de Datos (`.agents/templates/plan-rollback-datos.md`, puerta F9). **El rollback de aplicación no es rollback de datos.**
- **Almacén de lectura:** es derivado. Si falla, se reconstruye volviendo a proyectar los eventos; por eso el outbox es parte de la estrategia (ADR-013). Sin migraciones propias del almacén en el starter de datos.
- **Despliegue:** un solo despliegue en la Etapa 1; una imagen versionada (`aybar package`), ambientes DEV, QA, PRE y producción; rollback volviendo a la imagen anterior. Nube y orquestador: ADR-014.
- **Integraciones externas:** contra simulador; la API real se activa cuando existe, sin cambiar los módulos (ADR-004).
- **Datos iniciales:** carga de usuarios, roles y líderes desde RR. HH. (DEP-02); semillas solo con datos sintéticos; nunca datos reales ni datos personales en pruebas.

Generado por IA: borrador completo (Claude, 2026-10-19) — Revisado por: (pendiente)
