---
id: "SPEC-ARQ-MIGRACION"
tipo: "spec"
titulo: "Estrategia de migración y reversión, con el registro de tablas de ATC"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.3"
owner: "Jesús Chávez Elías"
aprobadores: [tech_lead]
fecha: "2026-10-26"
relacionados: [ADR-001, ADR-002, ADR-005, ADR-009, ADR-012, ADR-013, ADR-014, SPEC-DATOS-REGISTRO-TABLAS]
tags: [arquitectura, migracion, g3]
---

# Estrategia de migración y reversión

Versión 0.3 del 26-oct-2026. Aplica DT-03, DT-06, DT-07 y DT-08 del Líder Técnico (`analisis/decisiones.md`), **sin carga de usuarios desde RR. HH.** (C-01) y **con el registro de tablas de ATC** (C-11), cuyo detalle está en `datos/registro-de-tablas.md`.

## 1 Base de escritura (PostgreSQL)

- **Dónde:** Azure Database for PostgreSQL, en la **base única del modelo v7**, con claves foráneas físicas (DT-06, ADR-014).
- **Cómo:** migraciones Flyway `V<n>__<descripcion>.sql` en `adapters/src/main/resources/db/migration/`, en el patrón *expand → contract*: primero se agrega lo nuevo sin romper lo viejo; se migra con relleno declarado e idempotente; lo viejo se borra en un release posterior. Una migración aplicada no se edita nunca (skill `aybar-modelo-a-flyway`).
- **El v7 solo permite agregar:** no se renombran ni se eliminan columnas; se marcan DEPRECADO. Por eso el «contract» de una migración de ATC es marcar, no borrar.
- **Dos roles de base de datos (ADR-002):** un rol dueño de los objetos, que corre las migraciones y no se usa en ejecución, y un usuario de aplicación con `INSERT` y `SELECT` sobre las bitácoras. Las cinco bitácoras firmadas llevan trigger que rechaza `UPDATE` y `DELETE`.
- **Una sola base, varios dueños:** las migraciones de ATC solo crean y cambian las tablas de las que ATC es dueño de migración (sección 2). Cada maestro compartido tiene **un solo dueño de migración**, acordado con Gobierno de Datos (P-043); quien llega después no lo recrea.

## 2 Registro de tablas de ATC (C-11)

ATC no crea ni migra tablas de identidad, roles, permisos ni sesiones: son de Control de acceso (DT-03). El registro completo, con citas al paquete aprobado de PJ-05, el dueño de dato propuesto y la clasificación de datos personales, está en `datos/registro-de-tablas.md`. Resumen:

| Grupo | Tablas | Quién corre la migración | Detalle |
|---|---|---|---|
| **Crea ATC** (fragmento SERVICE del v7) | `MAE_AREA` (solo cola de atención, C-07), `MAE_TICKET_TYPE`, `MAE_TICKET_PRIORITY`, `MAE_SLA_POLICY`, `SVC_TICKET`, `SVC_TICKET_STATUS_LOG`, `SVC_TICKET_ASSIGNMENT_LOG`, `SVC_TICKET_INTERACTION`, `SVC_SLA_BREACH_ALERT`, `SVC_COMPLAINT_BOOK_ENTRY`, `SVC_COMPLAINT_BOOK_ENTRY_STATUS_LOG`, `SVC_COMPLAINT_APPEAL`, `SVC_COMPLAINT_APPEAL_STATUS_LOG` | ATC, por módulo (`tickets`, `sla`, `complaintbook`) | Registro §2. No están entre las que crea Control de acceso: las crea ATC |
| **Cambios al v7 propuestos** | Outbox (`INTG_OUTBOX_EVENT` o `SVC_OUTBOX_EVENT`), `SVC_AI_SUGGESTION_LOG`, flujo, subtipo y versión (`SVC_WORKFLOW_DEFINITION`, `SVC_WORKFLOW_ACTIVITY`, `MAE_TICKET_SUBTYPE`), `SVC_TICKET_SLA_PAUSE`, `shedlock` y las demás | ATC, si Gobierno de Datos los aprueba | Registro §3 (H-03 del acta) |
| **Solo lee** | `PARTY`, `ORG_COMPANY`, `MAE_BUSINESS_LINE`, `MAE_GENERIC_LIST`, `MAE_GENERIC_LIST_VALUE`, `MAE_CHANNEL`, `MAE_CURRENCY` (las crea Control de acceso); `ORG_COMPANY_ADDRESS`, `ORG_PRODUCT`, `CONTRACT`, `AST_UNIT`, `MAE_TIME`, `MAE_HOLIDAY` (nadie todavía) | Su dueño de migración (P-043) | Registro §4. ATC no lee las tablas de personas: el dato llega enmascarado (D-119 de PJ-05; P-037) |
| **Escribe filas en otro dominio** | Listas de SERVICE en `MAE_GENERIC_LIST_VALUE`, canal `MI_PORTAL` en `MAE_CHANNEL`, excepciones en `GOV_INTEGRITY_EXCEPTION`, espejo en `GOV_DOCUMENT_REPOSITORY`, encuesta en `SVY_SURVEY_RESPONSE`, reclamo en `CONTRACT_WARRANTY_CLAIM` | Semilla versionada o escritura de la aplicación; la estructura no la toca ATC | Registro §5 y §6 |
| **No crea, no migra, no copia** | Las 24 tablas del fragmento 01 (`IDN_*`), `MAE_SYSTEM_ROLE`, `MAE_MENU_OPTION`, `NEX_USER_COMPANY_ROLE`, sesiones, códigos de un solo uso, maestro local, `PARTY` (ni la no verificada) | — | Registro §8 (C-11) |

**Orden de despliegue.** Con FK físicas, la primera migración de ATC (`SVC_TICKET`, tarea HU-ATC-001-T02) solo corre cuando ya existen en la base única `ORG_COMPANY`, `ORG_COMPANY_ADDRESS`, `PARTY`, `CONTRACT`, `AST_UNIT`, `MAE_CHANNEL`, `MAE_BUSINESS_LINE`, `ORG_PRODUCT`, `MAE_GENERIC_LIST` y `MAE_GENERIC_LIST_VALUE` (registro §4). Las que crea Control de acceso llegan con su despliegue (DEP-16); las demás dependen de P-043. En las pruebas locales, esas tablas se crean tal como están en el v7 solo dentro del contenedor de pruebas; no son migraciones de ATC.

### 2.1 Lo que se retira

`PORTAL_SESSION` y el maestro local de usuarios, roles, áreas y líderes: no se crean (DT-03, DT-04). Las tablas de sesión y de verificación de contacto son de Control de acceso, y ATC no las lee ni las escribe. ATC tampoco escribe `PARTY`: la Party no verificada del interesado solo la crea el autorregistro de Control de acceso (R29 y A26 de PJ-05; P-037).

## 3 Reversión

- Flyway Community no trae migraciones de deshacer; la reversión de datos es un script aparte, escrito y probado, en el Plan de Rollback de Datos (`.agents/templates/plan-rollback-datos.md`, puerta F9). **El rollback de aplicación no es rollback de datos.**
- Las bitácoras son de solo inserción: una reversión no las corrige; se agrega una fila nueva (ADR-002). Lo que ya está firmado no se reescribe.
- Como el v7 solo admite agregar, revertir una migración de ATC significa dejar de usar lo agregado y marcarlo DEPRECADO; borrar columnas queda fuera de la reversión.
- ATC solo revierte lo que migra. Las filas que siembra en tablas de otro dominio (listas, canal `MI_PORTAL`) se desactivan (`IsActive = FALSE`), no se borran, y su reversión se acuerda con el dueño de la tabla (P-043).

## 4 Almacén de lectura

- Es **derivado**. Si falla, se reconstruye. El outbox conserva las filas publicadas solo 7 días (propuesta del ADR-013), así que **volver a proyectar los eventos no basta** para reconstruir todo: hace falta un job de **re-proyección desde PostgreSQL**, que hoy no está construido ni estimado (P-025).
- Sin migraciones propias del almacén en el starter de datos. El proyector es el único que escribe y usa su credencial de escritura propia (ADR-012).

## 5 Despliegue

- Un solo despliegue en la Etapa 1, en Azure Container Apps, con una imagen versionada (`aybar package`) en Azure Container Registry. Ambientes: DEV, QA, PRE y producción (ADR-014); su costo está en `costo-cloud.md`.
- Rollback de aplicación: volver a la imagen anterior.
- **Pasos de release que no son migración de datos:** (1) crear la llave HMAC en Key Vault antes de la primera bitácora; (2) crear la tabla de ShedLock; (3) entregar el catálogo de roles a Control de acceso (`roles-y-permisos-atc.md`; ADR-009); (4) registrar los clientes OAuth y la audiencia (P-026); (5) que el área de Roles y Permisos invite a los gestores como cuentas `EMPLOYEE` y les asigne los roles de ATC (C-01). Los pasos 3 a 5 son la DEP-16.

## 6 Integraciones externas

Contra simulador; la API real se activa cuando existe, sin cambiar los módulos (ADR-004).

## 7 Datos iniciales

- **No hay carga de usuarios, roles ni líderes desde RR. HH.** (C-01, DT-03): los gestores los invita Control de acceso como cuentas `EMPLOYEE` y les asigna los roles de ATC. DEP-02 («carga de RR. HH.») se reemplaza por DEP-16.
- Catálogos de ATC (tipos, prioridades, áreas como colas, políticas de SLA): se siembran en sus tablas con los valores del Excel y del v7. Los tipos, subtipos y áreas del piloto los cierra el PO (P-017).
- Listas de SERVICE en `MAE_GENERIC_LIST_VALUE` y el canal `MI_PORTAL` en `MAE_CHANNEL`: semilla versionada con `GenericListID` fijos, en tablas que migra Control de acceso; el rango y quién la corre se acuerdan con Gobierno de Datos (P-043).
- Calendario `MAE_TIME` y `MAE_HOLIDAY`: lo carga el Equipo Datos (DEP-04); su dueño de migración, P-043.
- Semillas solo con datos sintéticos; nunca datos reales ni datos personales en pruebas.

## Pendientes

- El dueño de migración de cada maestro compartido y de las tablas ajenas que nadie crea todavía: Gobierno de Datos (P-043).
- Los cambios al v7 de la sección 2 (registro §3): Gobierno de Datos (P-031).
- Job de re-proyección del almacén de lectura: sin estimar (P-025).
- Plan de Rollback de Datos (F9): sin escribir.

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-19 | Jesús Chávez Elías, con IA | Esbozo con carga de usuarios desde RR. HH. |
| 0.2 | 2026-10-22 | Jesús Chávez Elías, con IA | Se quita la carga desde RR. HH. (C-01); registro de tablas de ATC (C-11); Azure, ShedLock, dos roles de base y trigger; reconstrucción del almacén de lectura con re-proyección; pasos de release |
| 0.3 | 2026-10-26 | Brayan Hurtado, con IA | El registro de tablas pasa a `datos/registro-de-tablas.md` y aquí queda su resumen: ATC crea las 13 tablas de SERVICE (ya no «por confirmar»), no escribe `PARTY` ni tablas de identidad (`IDN_SYSTEM_TASK` sale de las candidatas), siembra filas en tablas ajenas con dueño de migración por acordar (P-043). Orden de despliegue por las FK físicas, reversión de semillas e invitación de gestores como paso de release |

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v1 de Nexora; actualizado con IA (Claude, 2026-10-22) a partir de la revisión del Líder Técnico del 22-oct. — Revisado por: (pendiente) · Aprueba: TL

Actualizado el 26-oct-2026 por Brayan Hurtado con IA (Claude) a partir de la revisión del Líder Técnico del 22-oct (§4, «Migración y reversión»; C-01 y C-11). — Revisado por: (pendiente)
