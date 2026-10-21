---
id: "ADR-009"
tipo: "adr"
titulo: "ADR-009: Usuarios, roles y líderes locales en Etapa 1 detrás de una interfaz de identidad"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.1"
owner: "[por asignar: arquitecto / TL]"
aprobadores: []
fecha: "2026-10-19"
relacionados: [ADR-001, ADR-012, ADR-013, ADR-014]
tags: [adr, arquitectura, g3]
---

# ADR-009: Usuarios, roles y líderes locales en Etapa 1 detrás de una interfaz de identidad

- Estado: propuesto
- Ticket: AYB-0001 · Fecha: 2026-10-19
- Compatibilidad con M0 (Arquitectura de Directorio): **por confirmar** (M0 no está en el repositorio; la declara el TL o se solicita dispensa al Data Chief o al Directorio)
- Origen: convierte a la plantilla del marco el ADR-09 del PLT-05 v1.3
- **Conflicto abierto con el PLT-01 v1.3 (ADR-09 del PO): decide el líder técnico.** Este ADR mantiene el maestro local de la Etapa 1 que fija el PO (DEP-02), pero el diccionario de datos dice que el v7 trae la identidad en el fragmento IDENTITY-ACCESS y deja de lado un maestro local (ver «Datos»).

> Las opciones evaluadas son una propuesta de redacción a partir del motivo del PLT-05 y de las skills del SDK: el arquitecto las confirma o corrige antes de pedir la aprobación del TL.

## Contexto

La Etapa 1 necesita usuarios, roles, áreas y líderes (DEP-02, carga inicial de RR. HH.). El SDK no tiene login: el servicio solo valida el JWT de un emisor OIDC, y el emisor de la plataforma (`access-control-service`) no existe todavía.

## Opciones evaluadas

| Opción | Por qué no | Qué la haría reconsiderar |
|---|---|---|
| Mezclar identidad en cada módulo | Cambiar la fuente de identidad obligaría a reescribir cada módulo. | — |

## Decisión

La Etapa 1 usa un **maestro local** de usuarios, roles, áreas y líderes detrás de una **interfaz de identidad** (puerto en el dominio), de modo que cambiar la fuente de identidad no obliga a tocar los módulos. **Quién emite el token en la Etapa 1 queda abierto**: se decide en el ADR-014.

## Consecuencias

- Obliga a:
  - Un módulo `identidad` con la carga inicial y el mantenimiento del maestro.
  - Un emisor OIDC para la Etapa 1 (ADR-014): sin emisor, ningún endpoint protegido responde.
  - Los claims corporativos (`companyId`, `company_roles`, `realm_access.roles`, `user_account_id`) configurables en `aybar.security.claims.*`.
- Impide:
  - Roles fijados en código.
- Cuesta: Horas del módulo `identidad`; costo del emisor: por estimar (ADR-014).

## Datos (puerta F4 de Gobierno de Datos)

- El v7 trae la identidad en el fragmento IDENTITY-ACCESS (`IDN_USER_ACCOUNT`, `IDN_USER_ROLE`, `MAE_SYSTEM_ROLE` con el rol «agente ATC») y las áreas en `MAE_AREA` (SERVICE): se confirma con el arquitecto si el módulo `identidad` las lee en vez de guardar un maestro propio (DEP-02); dueño: RR. HH. / Gerencia ATC (por confirmar).
- PII: datos de colaboradores; clasificación por definir.

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v3 de Jesús Chávez Elías en Nexora; actualizado por Brayan con IA (Claude, 2026-10-21) a la v1.3 del PO: título del ADR-09 del PO y línea de conflicto abierto con el diccionario (IDENTITY-ACCESS). Texto adaptado al alcance de la Etapa 1 (se omiten las frases que remiten a fases posteriores). — Revisado por: (pendiente) · Aprueba: TL
