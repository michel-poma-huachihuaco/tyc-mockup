---
id: "SPEC-ARQ-MIGRACION"
tipo: "spec"
titulo: "Estrategia de migración y reversión, con el registro de tablas de ATC"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.8"
owner: "Jesús Chávez Elías"
aprobadores: [tech_lead]
fecha: "2026-10-27"
relacionados: [ADR-001, ADR-002, ADR-005, ADR-009, ADR-012, ADR-013, ADR-014, SPEC-DATOS-REGISTRO-TABLAS]
tags: [arquitectura, migracion, g3]
---

# Estrategia de migración y reversión

La versión vigente está en la cabecera y el historial dice qué aplica cada una. Aplica DT-03, DT-06, DT-07 y DT-08 del Líder Técnico y las decisiones del equipo ED-01, ED-05, ED-11 y ED-15 (`analisis/decisiones.md`), **sin carga de usuarios desde RR. HH.** (C-01) y **con el registro de tablas de ATC** (C-11), cuyo detalle está en `datos/registro-de-tablas.md`.

## 1 Base de escritura (PostgreSQL)

- **Dónde:** Azure Database for PostgreSQL, en la **base única del modelo v7**, con claves foráneas físicas (DT-06, ADR-014).
- **Cómo:** migraciones Flyway `V<n>__<descripcion>.sql` en `adapters/src/main/resources/db/migration/`, en el patrón *expand → contract*: primero se agrega lo nuevo sin romper lo viejo; se migra con relleno declarado e idempotente; lo viejo se borra en un release posterior. Una migración aplicada no se edita nunca (skill `aybar-modelo-a-flyway`).
- **El v7 solo permite agregar:** no se renombran ni se eliminan columnas; se marcan DEPRECADO. Por eso el «contract» de una migración de ATC es marcar, no borrar.
- **Dos roles de base de datos** (los crea infraestructura en cada ambiente; ADR-001, regla 5; ADR-002; `seguridad.md`): **`app_atc_migracion`**, dueño de las tablas de ATC (`SVC_*` y `MAE_*` de SERVICE, `SVC_OUTBOX_EVENT`, `shedlock` y `flyway_schema_history_atc`), con `REFERENCES` sobre las tablas ajenas de las FK y sin otros permisos sobre ellas, que solo usa el job de migraciones; y **`app_atc_servicio`**, el de la aplicación, que no es dueño de nada: `SELECT`, `INSERT` y `UPDATE` en las entidades, en `SVC_OUTBOX_EVENT` y en `shedlock`; solo `SELECT` e `INSERT` en las 5 bitácoras; `DELETE` solo en `SVC_OUTBOX_EVENT` (purga); `SELECT` en las tablas ajenas que lee e `INSERT` en las que escribe (registro §5), y `SELECT` solo sobre las columnas `UserAccountID`, `PartyID`, `AccountTypeID`, `AccountStatusID` y `Username` de `IDN_USER_ACCOUNT` (ED-01); `DELETE` en `SVC_TICKET_PROSPECT` al vincular (ED-05). Las cinco bitácoras firmadas llevan además un trigger que rechaza `UPDATE` y `DELETE`.
- **Una sola base, varios dueños:** las migraciones de ATC solo crean y cambian las tablas de las que ATC es dueño de migración (sección 2). Cada maestro compartido tiene **un solo dueño de migración** (ED-11): ATC migra las suyas y, como custodio, `ORG_COMPANY_ADDRESS`, `ORG_PRODUCT` y `GOV_DOCUMENT_REPOSITORY`; los demás maestros los migra su dueño; quien llega después no los recrea.
- **Historial de Flyway propio de ATC:** en la base única ya migra Control de acceso. ATC usa su propia tabla de historial, `flyway_schema_history_atc`, para no leer ni validar migraciones ajenas: `aybar.data.flyway.baseline-table: flyway_schema_history_atc` (`aybar-starter-data` 0.7.1 la traduce a `spring.flyway.table`), en el mismo esquema que las tablas del v7 de la base única.
- **Línea base en la versión 0:** como el esquema no está vacío, la primera ejecución necesita línea base: `aybar.data.flyway.baseline-on-migrate: true` y `spring.flyway.baseline-version: 0`. Con la versión de defecto (1), Flyway saltaría la `V1__` de ATC. `baseline-version` es la única propiedad `spring.flyway.*` que se declara, porque el SDK no la expone en `aybar.data.flyway.*`, y no se repite en los dos espacios. Es una excepción a la regla literal de `aybar-starter-data` («no fijar `spring.flyway.*` y `aybar.data.flyway.*` a la vez»), que se aprueba con ADR-001. La tabla, la línea base y el esquema (el de las tablas del v7 de la base única) están en el registro de tablas (§3 y §3.1) y en el acta F4 (H-14), decididos por el equipo (ED-11).
- **Quién corre las migraciones:** un **job aparte** (Azure Container Apps Job, con la misma imagen y un perfil que solo migra) con la cadena de `app_atc_migracion` (secreto `atc-db-migracion-uri` de Azure Key Vault). **Corre antes de cada despliegue**; si falla, el despliegue no sigue (G8). El servicio arranca con `aybar.data.flyway.enabled: false` y la cadena de `app_atc_servicio` (`atc-db-servicio-uri`). Son dos procesos porque el starter usa una sola URI por proceso (ADR-001, regla 5; ADR-012; `seguridad.md`).

## 2 Registro de tablas de ATC (C-11)

ATC no crea ni migra tablas de identidad, roles, permisos ni sesiones: son de Control de acceso (DT-03). El registro completo, con citas al paquete aprobado de PJ-05, el dueño de dato propuesto y la clasificación de datos personales, está en `datos/registro-de-tablas.md`. Resumen:

| Grupo | Tablas | Quién corre la migración | Detalle |
|---|---|---|---|
| **Crea ATC** (fragmento SERVICE del v7) | `MAE_AREA` (solo cola de atención, C-07), `MAE_TICKET_TYPE`, `MAE_TICKET_PRIORITY`, `MAE_SLA_POLICY`, `SVC_TICKET`, `SVC_TICKET_STATUS_LOG`, `SVC_TICKET_ASSIGNMENT_LOG`, `SVC_TICKET_INTERACTION`, `SVC_SLA_BREACH_ALERT`, `SVC_COMPLAINT_BOOK_ENTRY`, `SVC_COMPLAINT_BOOK_ENTRY_STATUS_LOG`, `SVC_COMPLAINT_APPEAL`, `SVC_COMPLAINT_APPEAL_STATUS_LOG` | ATC, por módulo (`tickets`, `sla`, `complaintbook`) | Registro §2. No están entre las que crea Control de acceso: las crea ATC |
| **Cambios al v7 del fragmento SERVICE** | Outbox `SVC_OUTBOX_EVENT` y su lista `SVC_OUTBOX_EVENT_TYPE` (ADR-013; `INTG_OUTBOX_EVENT` no sirve: es para envíos a sistemas externos), `SVC_AI_SUGGESTION_LOG`, flujo, subtipo y versión (`SVC_WORKFLOW_DEFINITION`, `SVC_WORKFLOW_ACTIVITY`, `MAE_TICKET_SUBTYPE`), `SVC_TICKET_ACTIVITY`, `SVC_TICKET_SLA_PAUSE`, `AutoCloseBusinessDays` en `MAE_SLA_POLICY` (ED-15), `SVC_TICKET_PROSPECT` (ED-05), `IntegrityHash` en las 5 bitácoras (ADR-002), `shedlock`, `flyway_schema_history_atc` y las demás | ATC; van en el acta F4, lista para la firma del Data Chief | Registro §3 (H-03, H-12 y H-14 del acta). `SVC_AI_SUGGESTION_LOG` (HU-ATC-048) y la del caso sensible del evento (HU-ATC-037 a 039) no se crean en la Etapa 1 (P-025): se crean cuando entren esas HU |
| **Solo lee** | `PARTY`, `ORG_COMPANY`, `MAE_BUSINESS_LINE`, `MAE_GENERIC_LIST`, `MAE_GENERIC_LIST_VALUE`, `MAE_CHANNEL`, `MAE_CURRENCY` (las crea Control de acceso); `CONTRACT`, `AST_UNIT` (dueño del fragmento CONTRACT, DEP-07); `MAE_TIME`, `MAE_HOLIDAY` (Equipo Datos, DEP-04); las columnas de vínculo de `IDN_USER_ACCOUNT` (Control de acceso; ED-01) | Su dueño de migración (ED-11); ATC custodia `ORG_COMPANY_ADDRESS` y `ORG_PRODUCT` | Registro §4. ATC no lee las tablas de personas: el dato llega por la consulta del cliente en línea (D-119 de PJ-05; ED-05) |
| **Escribe filas en otro dominio** | Listas de SERVICE en `MAE_GENERIC_LIST_VALUE`, canal `MI_PORTAL` en `MAE_CHANNEL`, excepciones en `GOV_INTEGRITY_EXCEPTION`, espejo en `GOV_DOCUMENT_REPOSITORY`, encuesta en `SVY_SURVEY_RESPONSE`, reclamo en `CONTRACT_WARRANTY_CLAIM` | Semilla versionada o escritura de la aplicación; la estructura no la toca ATC | Registro §5 y §6 |
| **No crea, no migra, no copia** | Las 24 tablas del fragmento 01 (`IDN_*`; de `IDN_USER_ACCOUNT` solo lee sus columnas de vínculo), `MAE_SYSTEM_ROLE`, `MAE_MENU_OPTION`, `NEX_USER_COMPANY_ROLE`, sesiones, códigos de un solo uso, maestro local, `PARTY` (ni la no verificada) | — | Registro §8 (C-11) |

**Orden de despliegue (ED-11).** Con FK físicas, la primera migración de ATC (`SVC_TICKET`, tarea HU-ATC-001-T02) referencia `ORG_COMPANY`, `ORG_COMPANY_ADDRESS`, `PARTY`, `CONTRACT`, `AST_UNIT`, `MAE_CHANNEL`, `MAE_BUSINESS_LINE`, `ORG_PRODUCT`, `MAE_GENERIC_LIST` y `MAE_GENERIC_LIST_VALUE` (registro §4). Las que crea Control de acceso llegan con su despliegue; `ORG_COMPANY_ADDRESS`, `ORG_PRODUCT` y `GOV_DOCUMENT_REPOSITORY` las crea ATC como custodio, tal como están en el v7, antes de `SVC_TICKET`; `CONTRACT` y `AST_UNIT` son del dueño del fragmento CONTRACT (DEP-07), y `MAE_TIME` y `MAE_HOLIDAY`, del Equipo Datos (DEP-04).
- **Local y DEV:** si una tabla ajena no existe, la crea un **script de datos sintéticos de ATC fuera de Flyway**, tal como está en el v7; no es una migración ni llega a QA. No hay scripts de datos sintéticos del v7 para esas tablas: PJ-05 trae solo sus semillas y su juego sintético de personas, y la plantilla de ATC solo `V1__init.sql`. Las migraciones de ATC corren con línea base 0 sobre su propio historial y no dependen del de otros.
- **QA, PRE y producción:** mientras una tabla ajena no exista en el ambiente, la columna de ATC que la referencia se crea sin `REFERENCES` y la FK llega en una migración posterior (*expand → contract*), como hizo PJ-05 con `CompanyAreaID` (D-193). Es la deuda **DEU-01** del acta F4: se cierra cuando el dueño crea la tabla y la regla Q-013 da 0; se revisa en el Go/No-Go del 03-nov y se cierra a más tardar el 30-nov-2026 (ED-11). `CalendarioPort` usa el **calendario configurado y versionado** (feriados nacionales de Perú, que firma la Gerencia de ATC) mientras falten `MAE_TIME` y `MAE_HOLIDAY` en el ambiente (ADR-005; deuda DEU-02).

### 2.1 Lo que se retira

`PORTAL_SESSION` y el maestro local de usuarios, roles, áreas y líderes: no se crean (DT-03, DT-04). Las tablas de sesión y de verificación de contacto son de Control de acceso, y ATC no las lee ni las escribe. ATC tampoco escribe `PARTY`: la Party no verificada del interesado solo la crea el autorregistro de Control de acceso (R29 y A26 de PJ-05; ED-05). Los datos mínimos del interesado viven en `SVC_TICKET_PROSPECT` solo hasta que el job de vinculación completa el `PartyID`, y se borran en la misma transacción (ED-05).

## 3 Reversión

- Flyway Community no trae migraciones de deshacer; la reversión de datos es un script aparte, escrito y probado, en el Plan de Rollback de Datos (`.agents/templates/plan-rollback-datos.md`, puerta F9). **El rollback de aplicación no es rollback de datos.**
- Las bitácoras son de solo inserción: una reversión no las corrige; se agrega una fila nueva (ADR-002). Lo que ya está firmado no se reescribe.
- Como el v7 solo admite agregar, revertir una migración de ATC significa dejar de usar lo agregado y marcarlo DEPRECADO; borrar columnas queda fuera de la reversión.
- ATC solo revierte lo que migra. Las filas que siembra en tablas de otro dominio (listas, canal `MI_PORTAL`) se desactivan (`IsActive = FALSE`), no se borran: así el dueño de la tabla no pierde nada (ED-11).

## 4 Almacén de lectura

- Es **derivado**. Si falla, se reconstruye. El outbox (`SVC_OUTBOX_EVENT`) conserva las filas publicadas solo 7 días (propuesta del ADR-013), así que **volver a proyectar los eventos no basta** para reconstruir todo: hace falta **re-proyectar desde PostgreSQL**. Esa reconstrucción de las vistas está dentro de las 10 h del proyector, una de las 28 h nuevas de ADR-012 (outbox, publicador, proyector y bus). P-025, decidida por el equipo el 26-oct-2026 (`analisis/decisiones.md`), las pone como tareas técnicas de la fundación: la re-proyección es `DT02-T06` (3 h) y el proyector `DT02-T05` (7 h), en `backlog/tareas/EP-ATC-01.json`.
- Sin migraciones propias del almacén en el starter de datos. El proyector es el único que escribe y usa su credencial de escritura propia (ADR-012).

## 5 Despliegue

- Un solo despliegue en la Etapa 1, en Azure Container Apps, con una imagen versionada (`aybar package`) en Azure Container Registry. Ambientes: DEV, QA, PRE y producción. PRE entra en la Etapa 1 porque en él va la UAT del 03-nov (PLT-05 §4.2), como dicen ADR-014 y `costo-cloud.md` (USD 2.592,53 al mes en Brazil South con los cuatro ambientes; ED-12). Las migraciones se prueban en DEV y QA antes de PRE.
- Rollback de aplicación: volver a la imagen anterior.
- **Pasos de release que no son migración de datos:** (0) correr el job de migraciones con `app_atc_migracion` antes de desplegar la imagen (sección 1), después de que infraestructura haya creado los dos roles de base en el ambiente; (1) crear la llave HMAC en Key Vault antes de la primera bitácora; (2) crear la tabla de ShedLock; (3) registrar el catálogo de roles en Control de acceso en los dos lotes del ADR-021, que nace inactivo y el área aprueba fila por fila (`roles-y-permisos-atc.md` §11; ED-07); (4) clientes OAuth del área y `aybar-atc` entre los servicios destino del emisor (ED-06); (5) que el área de Roles y Permisos invite a los gestores como cuentas `EMPLOYEE` y les asigne los roles de ATC (C-01); (6) que **Control de acceso, dueño de la tabla, otorgue** a `app_atc_servicio` el `SELECT` por columna sobre `IDN_USER_ACCOUNT` (ED-01), y cada dueño los demás permisos sobre sus tablas (`datos/registro-de-tablas.md` §4.1). Los pasos 3 a 6 son entregables de la DEP-16 (en el 6, también de los otros dueños), pedidos al área en el correo de solicitud; riesgo aceptado con mitigación (ED-08): mientras, en local/DEV con el emisor y los datos de prueba.

## 6 Integraciones externas

Contra simulador; la API real se activa cuando existe, sin cambiar los módulos (ADR-004).

## 7 Datos iniciales

- **No hay carga de usuarios, roles ni líderes desde RR. HH.** (C-01, DT-03): los gestores los invita Control de acceso como cuentas `EMPLOYEE` y les asigna los roles de ATC. DEP-02 («carga de RR. HH.») se reemplaza por DEP-16.
- Catálogos de ATC (tipos, prioridades, áreas como colas, políticas de SLA): se siembran en sus tablas con los valores del Excel y del v7. Los tipos, subtipos, áreas y las 15 combinaciones del piloto, entre ellas las 4 de «Validación de identidad (prospecto)» (C-06), son los de ADR-008, con los códigos de `datos/diccionario.md` («Catálogo del piloto»; ED-14).
- Listas de SERVICE en `MAE_GENERIC_LIST_VALUE` y el canal `MI_PORTAL` en `MAE_CHANNEL`: semilla versionada con `GenericListID` fijos de SERVICE, en tablas que migra Control de acceso; la corre el job de migraciones de ATC (ED-11).
- Calendario `MAE_TIME` y `MAE_HOLIDAY`: lo migra y lo carga el Equipo Datos (DEP-04; ED-11); en local y DEV, el script de datos sintéticos; en QA, PRE y producción, mientras falte, el calendario configurado y versionado (DEU-02).
- Semillas solo con datos sintéticos; nunca datos reales ni datos personales en pruebas.

## Decisiones del equipo que aplica este documento

Decisiones del equipo (Brayan Hurtado), 26-oct-2026, propuestas al Líder Técnico en este envío (`analisis/decisiones.md`):

- **Dueño de migración y orden de despliegue (ED-11):** ATC migra sus tablas y custodia `ORG_COMPANY_ADDRESS`, `ORG_PRODUCT` y `GOV_DOCUMENT_REPOSITORY`; cada maestro compartido lo migra su dueño; local y DEV con el script de datos sintéticos de ATC fuera de Flyway; FK diferida en QA, PRE y producción mientras falte una tabla ajena.
- **Esquema y historial de Flyway (ED-11):** el de las tablas del v7 en la base única, `flyway_schema_history_atc` y línea base 0. Los roles `app_atc_migracion` y `app_atc_servicio` los crea infraestructura en cada ambiente (`seguridad.md`).
- **Cambios al v7 (ED-15, ED-05, ED-23):** van en el acta F4, lista para la firma del Data Chief.
- **Re-proyección del almacén de lectura:** dentro de las 10 h del proyector (ADR-012).
- **Plan de Rollback de Datos:** se escribe en la puerta F9 (Release), como pide el marco; no es parte de G3.

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-19 | Jesús Chávez Elías, con IA | Esbozo con carga de usuarios desde RR. HH. |
| 0.2 | 2026-10-22 | Jesús Chávez Elías, con IA | Se quita la carga desde RR. HH. (C-01); registro de tablas de ATC (C-11); Azure, ShedLock, dos roles de base y trigger; reconstrucción del almacén de lectura con re-proyección; pasos de release |
| 0.3 | 2026-10-26 | Brayan Hurtado, con IA | El registro de tablas pasa a `datos/registro-de-tablas.md` y aquí queda su resumen: ATC crea las 13 tablas de SERVICE (ya no «por confirmar»), no escribe `PARTY` ni tablas de identidad (`IDN_SYSTEM_TASK` sale de las candidatas), siembra filas en tablas ajenas con dueño de migración por acordar (P-043). Orden de despliegue por las FK físicas, reversión de semillas e invitación de gestores como paso de release |
| 0.4 | 2026-10-26 | Brayan Hurtado, con IA | Outbox único `SVC_OUTBOX_EVENT` (ADR-013 v0.3). Como ADR-001 v0.4 (regla 5), ADR-012 y `seguridad.md` 0.4: tabla de historial de Flyway propia (`flyway_schema_history_atc`) con línea base en la versión 0, roles `app_atc_migracion` y `app_atc_servicio`, y job de migraciones aparte que corre antes de cada despliegue, con el servicio arrancando con Flyway apagado. P-043 como condición del acta F4, con la propuesta de custodia. La re-proyección queda dentro de las 10 h del proyector (ADR-012), sin confirmar. PRE entra por la UAT del 03-nov (PLT-05) |
| 0.4 | 2026-10-26 | Brayan Hurtado, con IA | Barrido de coherencia (misma versión, sin cambio de contenido): el outbox cita ADR-013 v0.4, la versión vigente (decía v0.3). |
| 0.5 | 2026-10-26 | Brayan Hurtado, con IA | Decisiones del equipo de `analisis/decisiones.md` v0.7: dueño de migración y orden de despliegue (ED-11: custodia de ATC, script de datos sintéticos fuera de Flyway en local y DEV, línea base 0 y FK diferida en QA, PRE y producción); `SELECT` por columna sobre `IDN_USER_ACCOUNT` (ED-01); `SVC_TICKET_PROSPECT` y su borrado al vincular (ED-05); tablas del flujo (ED-15); re-proyección dentro de las 28 h nuevas de ADR-012 v0.5. «Pendientes» pasa a «Decisiones del equipo que aplica este documento» |
| 0.6 | 2026-10-26 | Brayan Hurtado, con IA | P-025 decidida por el equipo (`analisis/decisiones.md` v0.8): las horas del proyector y la re-proyección son tareas técnicas de la fundación (DT02-T05 y DT02-T06); `SVC_AI_SUGGESTION_LOG` y la tabla del caso sensible del evento no se crean en la Etapa 1 |
| 0.7 | 2026-10-26 | Brayan Hurtado, con IA | Revisión interna del equipo del 26-oct: FK diferida como deuda DEU-01 y calendario configurado y versionado, no simulador (DEU-02) (O-17, O-27); el `SELECT` sobre `IDN_USER_ACCOUNT` lo otorga Control de acceso, dueño de la tabla, como entregable de la DEP-16 (O-03); catálogo inactivo hasta la aprobación fila por fila (O-08); 15 combinaciones del piloto con «Validación de identidad (prospecto)» (C-06). Citas a documentos del paquete sin número de versión, que lo fija Nexora (O-22). Desde esta versión cada cambio de texto sube la versión (O-26) |
| 0.8 | 2026-10-27 | Brayan Hurtado, con IA | DEU-01 con la fecha de ED-11 (se revisa en el Go/No-Go del 03-nov; a más tardar el 30-nov-2026); las revisiones del 26-oct se citan como internas del equipo, no del Líder Técnico (`analisis/decisiones.md`, nota del 27-oct) |

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v1 de Nexora; actualizado con IA (Claude, 2026-10-22) a partir de la revisión del Líder Técnico del 22-oct. — Revisado por: (pendiente) · Aprueba: TL

Actualizado el 26-oct-2026 por Brayan Hurtado con IA (Claude) a partir de la revisión del Líder Técnico del 22-oct (§4, «Migración y reversión»; C-01 y C-11). — Revisado por: (pendiente)

Actualizado el 26-oct-2026 (v0.4) por Brayan Hurtado con IA (Claude) a partir de las revisiones internas técnica y de coherencia del 26-oct (hallazgos 4, 5, 8, 11 y 12 de la técnica; 6 de la de coherencia). — Revisado por: (pendiente)

Actualizado el 26-oct-2026 (v0.5) por Brayan Hurtado con IA (Claude): decisiones del equipo ED-01, ED-05, ED-11, ED-12 y ED-15 de `analisis/decisiones.md` v0.7. — Revisado por: (pendiente)

Actualizado el 26-oct-2026 (v0.6) por Brayan Hurtado con IA (Claude): P-025 decidida por el equipo (`analisis/decisiones.md` v0.8). — Revisado por: (pendiente)

Actualizado el 26-oct-2026 (v0.7) por Brayan Hurtado con IA (Claude): revisión interna del equipo (O-03, O-08, O-17, O-22 y O-27) y decisión del coordinador sobre C-06. — Revisado por: (pendiente)
