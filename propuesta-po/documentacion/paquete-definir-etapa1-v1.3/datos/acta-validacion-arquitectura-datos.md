---
id: "SPEC-DATOS-ACTA-F4"
tipo: "spec"
titulo: "Acta de Validación de Arquitectura de Datos (borrador para Gobierno de Datos)"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.7"
owner: "Jesús Chávez Elías"
aprobadores: [data_chief, tech_lead]
fecha: "2026-10-27"
relacionados: [ADR-001, ADR-002, ADR-003, ADR-006, ADR-012, ADR-013]
tags: [datos, gobierno-de-datos, f4, g3]
---

# Acta de Validación de Arquitectura de Datos · Puerta F4

> **Esta acta la emite Gobierno de Datos (personas): el Data Chief, Enrique Albán.** Aquí solo está el borrador con la evidencia y los hallazgos que prepara el agente `gobierno-datos`. Estado de la puerta: **sin emitir; lista para la firma del Data Chief** (26-oct-2026), sin firmar. Los 15 hallazgos tienen su resolución: H-01, H-02, H-03, H-05 y H-08 con DT-06 y C-11 del Líder Técnico (22-oct) y el registro de tablas como evidencia; H-09 con ADR-002; H-04, H-10 a H-14 con las decisiones del equipo del 26-oct; y H-15 (revisión interna del equipo, O-03) con la lista de permisos que otorgan otros dueños (`registro-de-tablas.md` §4.1) (`analisis/decisiones.md`: ED-04, ED-05, ED-11, ED-16, ED-19, ED-23 y ED-26). La firma ya no tiene condiciones: el dueño de migración (antes P-043) lo fija ED-11. Estados posibles: Aprobado / Aprobado con observaciones / Rechazado. SLA de respuesta: 3 días hábiles. El agente no firma.

## 1 Qué se valida y contra qué

Modelo lógico y físico en la **base única del modelo v7, en Azure Database for PostgreSQL, con FK físicas** (DT-06), nomenclatura, claves y relaciones, linaje fuente-destino, transformaciones, clasificación de sensibilidad y datos personales, dueño de dato asignado, impacto sobre estructuras existentes. **Contra el Modelo de Datos Corporativo v7** (fragmento 10 SERVICE; revisión del 20-oct-2026) y, cuando se tengan, el Estándar de Modelado y el Diccionario Corporativo (**no disponibles en el repositorio**), con walkthrough con el arquitecto y el TL.

## 2 Evidencia entregada

| Evidencia | Archivo |
|---|---|
| Registro de tablas: qué crea ATC, qué solo lee, qué escribe en otro dominio, dueño de dato (rol) y dueño de migración (ED-11), clasificación de datos personales (C-11) | `docs/datos/registro-de-tablas.md` |
| Modelo (DER) | `docs/datos/er.md` · `er-diagrama.mmd` |
| Diccionario (claves y relaciones; tipos y nulabilidad, ED-16) | `docs/datos/diccionario.md` |
| Estados | `docs/datos/estados.md` |
| Linaje | `docs/datos/linaje.md` |
| Decisiones de arquitectura de datos | `docs/adr/ADR-001`, `ADR-002`, `ADR-003`, `ADR-006`, `ADR-012`, `ADR-013` |

## 3 Hallazgos del borrador

| # | Hallazgo | Severidad | Bloquea F4 |
|---|---|---|---|
| H-01 | Ninguna entidad tenía dueño de dato asignado. **Resuelto con DT-06 y C-11 (26-oct):** el registro de tablas (§2 y §6) fija como dueño de dato de cada tabla de SERVICE un rol, el **Gerente de ATC** (en el Libro y las apelaciones, con consulta a la Gerencia Legal), y un solo dueño de migración por maestro compartido (ED-11). La persona la designa el Data Chief al firmar esta acta, como en la puerta F4 de PJ-05 | Mayor | **Resuelto**; va con la firma |
| H-02 | El v7 declara 0 tablas DAC en SERVICE; faltaba clasificar el dato personal. **Resuelto con DT-06 y C-11 (26-oct):** el dato del cliente vive en `PARTY` y en su fragmento 3, no en ATC (DT-06): ATC guarda referencias y no lee las tablas de personas directamente (D-119 de PJ-05). El registro de tablas (§2) clasifica cada tabla: `SVC_TICKET_INTERACTION` (texto libre y adjuntos) se trata como dato personal; `SVC_COMPLAINT_BOOK_ENTRY` es confidencial pero sin datos personales en columnas: guarda la referencia a la hoja y el `PartyID`, y la hoja con los datos del consumidor va al almacén de evidencia (ADR-003, punto 6; ADR-006; el v7 la reclasificó «no DAC»); las bitácoras no llevan datos personales (RN-SVC-012). ATC no tiene tablas de identidad ni de sesión (C-11); solo lee por columna el vínculo de la cuenta en `IDN_USER_ACCOUNT` (NO-DAC; ED-01). `SVC_TICKET_PROSPECT` guarda los datos mínimos del interesado sin `PARTY`, como dato personal, hasta la vinculación (ED-05). La hoja del Libro se conserva 2 años desde el registro (ED-13) | Mayor | **Resuelto**; va con la firma |
| H-03 | 5 entidades del PLT-05 no existen en el v7 (flujos configurables, guías de solución, sugerencias de IA, índice de búsqueda, formularios simples; el índice de búsqueda no es tabla sino una colección del almacén de lectura, ADR-003 y ADR-012) y 2 tenían candidatas de otros fragmentos sin dueño, que no se usan (ED-23); los casos sensibles / Mesa SGD tampoco tienen tablas, aunque el PLT-04 v1.3 §6.5 ya los esboza «por modelar» (`SENSITIVE_CASE`, `MAE_INTAKE_LINE`, `RISK_ASSESSMENT`, `ESCALATION_LOG`, `CASE_CLOSURE`; ver el diccionario). **Resuelto con DT-06 y C-11 (26-oct):** cada una queda como **cambio al v7** (tabla de ATC del fragmento SERVICE) en el registro de tablas (§3), con su historia y su ADR (ED-15, ED-23): outbox `SVC_OUTBOX_EVENT` con su lista `SVC_OUTBOX_EVENT_TYPE` (ADR-013: `INTG_OUTBOX_EVENT` no sirve, porque es para envíos a sistemas externos), `SVC_AI_SUGGESTION_LOG`, flujo, actividades del ticket, subtipo y versión, pausas del SLA, `SVC_TICKET_PROSPECT`, `SVC_NOTIFICATION_LOG`, `shedlock`, la tabla de historial de Flyway de ATC y las demás. Van con la firma de esta acta | Mayor | **Resuelto**; va con la firma |
| H-04 | Tipos, largos, obligatoriedad e índices de los 119 atributos no clave. **Resuelto por el equipo (ED-16, 26-oct):** el libro del v7 que tiene el equipo no trae hoja de atributos, así que los tipos siguen las convenciones físicas del diccionario aprobado de Control de acceso, que vive en la misma base única (`bigint`, `timestamptz`, `varchar(64)` para `IntegrityHash`, `varchar(50)` para códigos…), y la nulabilidad sale de los criterios de las historias (`datos/diccionario.md`, «Tipos y nulabilidad») | Mayor | **Resuelto**; va con la firma |
| H-05 | **Resuelto (DT-02 y DT-06):** el proyector del servicio es el único que escribe en el almacén de lectura, con credencial de escritura propia. El almacén de lectura es derivado y no es una tabla de la base única: se reconstruye desde PostgreSQL (`arquitectura/migracion-y-reversion.md` §4). El retraso máximo en segundos lo fija ADR-012 (5 s) y lo aprueba el Líder Técnico con ese ADR | Mayor | **Resuelto**; el valor queda en ADR-012 |
| H-06 | El v7 ya trae `PARTY` y `COMPANY`: la duplicación de maestros con SIGDA/TAXON y la sugerencia del módulo Clientes se deciden contra el v7 | Informativa | No |
| H-07 | Los umbrales de frescura de la vista de lectura y del outbox son 5 s y 10 s (ADR-012 y ADR-013); los aprueba el Líder Técnico con esos ADR | Menor | No |
| H-08 | ADR-001 proponía un esquema por módulo y el v7 usa una sola instancia con tablas prefijadas. **Resuelto con DT-06 y C-11 (26-oct):** una sola base, la del v7, en Azure Database for PostgreSQL, sin esquema por módulo y con FK físicas; ATC crea las 13 tablas de SERVICE, que no están entre las que crea Control de acceso, y no recrea ningún maestro compartido (registro de tablas §2, §4 y §6). Sin maestro local ni tablas de identidad (DT-03). El outbox es `SVC_OUTBOX_EVENT`, cambio al v7 (ADR-013; registro §3): `INTG_OUTBOX_EVENT` no sirve y no se usa | Mayor | **Resuelto** |
| H-09 | El PO y el Excel ya definen lo que faltaba: apelaciones 1 a N por asiento (PLT-04 HU-016 §6.5), 5 bitácoras firmadas (RNF-AUD-004) y vencimientos de SLA en `SVC_TICKET` (`FirstResponseDueDateTime`, `ResolutionDueDateTime` y `ReopenedResolutionDueDateTime`). **Resuelto con ADR-002 (lo aprueba el Líder Técnico con ese ADR):** se firman 9 tablas, las 4 del v7 y las 5 bitácoras, que suman la columna `IntegrityHash` como cambio al v7 (registro §2; ED-23). Las recetas de las 3 entidades del v7 que no son `SVC_TICKET` son las de ADR-002, punto 4 (ED-16) | Menor | **Resuelto**; la columna nueva va con la firma |
| H-10 | El mockup de la Etapa 1 decide cosas que el v7 no tiene: flujo con actividades, subtipo, pausas del SLA, canal Mi Portal, 9 tipos de ticket y 7 áreas más (ver el diccionario). El paquete v1.3 del equipo cita 27 entidades: 20 existen en el v7 y 7 no (las de H-03). **Resuelto por el equipo (ED-14, ED-15 y ED-26, 26-oct):** son tablas y columnas de ATC (registro §3) y semillas de sus catálogos (15 combinaciones del piloto con los 9 tipos de ADR-008, entre ellos «Validación de identidad (prospecto)» por decisión del coordinador sobre C-06; las 6 áreas del v7 con flujo y las 7 de la plataforma actual solo para derivar; canal `MI_PORTAL`) | Mayor | **Resuelto**; va con la firma |
| H-11 | **Resuelto en lo técnico por DT-06 (22-oct):** `SVC_TICKET.PartyID` es clave foránea a `PARTY`, que es la fuente viva. ATC no crea la `PARTY` del «Interesado» (HU-051): la crea el autorregistro de Control de acceso (R29, A26). **Resuelto por el equipo (ED-05, 26-oct):** el ticket del interesado se registra «sin cliente vinculado», con `PartyID` nulo y sus datos mínimos en `SVC_TICKET_PROSPECT`, y el job de vinculación completa el `PartyID` cuando la `PARTY` existe. La diferencia con el ADR-03, RN-SVC-026, RNF-INT-007 y DEP-01 del PO está listada en ED-19 | Mayor | **Resuelto**; va con la firma |
| H-12 | Cambios nuevos que salen de las decisiones del 22-oct: `shedlock` (ShedLock), `SVC_OUTBOX_EVENT` y su lista `SVC_OUTBOX_EVENT_TYPE` (ADR-013), `SVC_WORKFLOW_ACTIVITY`, `MAE_TICKET_SUBTYPE`, `SVC_TICKET_SLA_PAUSE`, las columnas `SubtypeID` y `WorkflowID` de `SVC_TICKET`, y la escritura de ATC en tablas de otros fragmentos (`MAE_GENERIC_LIST_VALUE`, `MAE_CHANNEL`, `GOV_INTEGRITY_EXCEPTION`, `GOV_DOCUMENT_REPOSITORY`, `SVY_SURVEY_RESPONSE`, `CONTRACT_WARRANTY_CLAIM`). ATC no escribe `PARTY` (ED-05). El detalle y el dueño de migración de cada tabla están en `datos/registro-de-tablas.md` §3, §5 y §6 (ED-11) | Mayor | **Resuelto**; va con la firma |
| H-13 | **Correspondencia `MAE_AREA` ↔ estructura organizacional (C-07).** `MAE_AREA` queda solo como cola de atención del ticket y no guarda líderes. La revisión del Líder Técnico pide documentar su correspondencia con `NEX_COMPANY_AREA`, pero esa tabla no existe en PJ-05: la crea su dueño de modelo (D-74) y `CompanyAreaID` va sin FK hasta entonces (D-193). **Resuelto por el equipo (ED-04, 26-oct):** en la Etapa 1 no hay correspondencia y `MAE_AREA` solo suma la posición en la sede; si `NEX_COMPANY_AREA` llega a existir, la correspondencia se presenta como cambio (`registro-de-tablas.md` §7) | Menor | No |
| H-14 | **Historial de Flyway de ATC en la base única.** Control de acceso ya migra en la misma base; si ATC usara la tabla de historial por defecto, Flyway vería migraciones ajenas y fallaría al validar. ATC lleva su propia tabla, `flyway_schema_history_atc` (`aybar.data.flyway.baseline-table`), con `baseline-on-migrate` y la línea base en la versión 0 (`spring.flyway.baseline-version`, excepción a la regla del starter que confirma el Líder Técnico); las migraciones corren en un job aparte con el rol `app_atc_migracion`, dueño de las tablas de ATC, y la aplicación arranca sin Flyway con `app_atc_servicio` (ADR-001, regla 5; registro §3.1; `arquitectura/migracion-y-reversion.md` §1). **Resuelto por el equipo (ED-11, 26-oct):** historial propio, línea base 0 y esquema de las tablas del v7 en la base única, sin depender del historial de otros servicios | Mayor | **Resuelto**; va con la firma |
| H-15 | **Acceso entre dominios: `SELECT` por columna sobre `IDN_USER_ACCOUNT`** (revisión interna del equipo, O-03; ED-01). ATC lee de esa tabla de Control de acceso solo `UserAccountID`, `PartyID`, `AccountTypeID`, `AccountStatusID` y, de las cuentas `EMPLOYEE`, `Username`, en solo lectura, por columna y sin copia (`CuentaPersonaPort`). **El permiso lo otorga el dueño de la tabla, Control de acceso** (ADR-019 de PJ-05: «El modelo de cada tabla sigue siendo de su dueño»): es un entregable explícito de la DEP-16 que ATC pide en el correo de solicitud, con los demás permisos sobre tablas de otro dueño (`registro-de-tablas.md` §4.1). Mientras, local, DEV y QA usan el emisor de pruebas y el simulador de `CuentaPersonaPort` con datos de prueba (R-11; ED-08); PRE, solo bajo el criterio de corte de la UAT (R-12), y producción exige el permiso. La tabla es NO-DAC en PJ-05 (`datos/modelo-de-datos.md:84` de PJ-05). Salida definitiva, que se pide en el mismo correo: un claim de persona en el token o una ruta `/api/v1/mi/…` que la devuelva; con ella se retira esta lectura y cambia solo el adaptador (ADR-009, punto 2, «Evolución») | Mayor | **Resuelto en el diseño**; va con la firma del Data Chief y el visto bueno de Control de acceso |

**Etapa 1 (P-025, decidida por el equipo el 26-oct-2026; `analisis/decisiones.md`).** HU-ATC-037, 038, 039, 048 y 053 salen de la Etapa 1. `SVC_AI_SUGGESTION_LOG` (HU-048, H-03) y el caso sensible del evento (`SENSITIVE_EVENT_CASE` y `EVENT`, HU-037 a 039) siguen en los cambios al v7 que se presentan con esta acta, pero **no se crean en la Etapa 1**: se crean cuando entren esas HU. La búsqueda vectorial de HU-053 tampoco se activa. Ningún hallazgo cambia de estado.

## 4 Reglas de calidad e integridad que entran a la batería de F10

Se declaran aquí y se dan de alta al momento del release (`.agents/references/gobierno-datos.md`). Umbrales iniciales; se calibran con cuatro semanas de línea base antes de alertar en firme; los umbrales cero aplican a datos nuevos.

| ID | Entidad | Dominio | Regla | Umbral (atención / crítico) | Severidad |
|---|---|---|---|---|---|
| Q-001 | SVC_TICKET | Integridad | Tickets sin `CompanyID` o `BusinessLineID` válido (RN-SVC-005) | 0 / cualquiera | S1 |
| Q-002 | SVC_TICKET | Integridad | Duplicados de `TicketNumber` por `CompanyID` (RN-SVC-004) | 0 / cualquiera | S1 |
| Q-003 | Tablas firmadas de SERVICE (9) | Integridad | `IntegrityHash` que no coincide al recalcular (HMAC-SHA256, llave en Azure Key Vault; ADR-002): `hash_mismatch` = 0 en las 9 tablas firmadas, las 4 del v7 (`SVC_TICKET`, `SVC_TICKET_INTERACTION`, `SVC_COMPLAINT_BOOK_ENTRY`, `SVC_COMPLAINT_APPEAL`) y las 5 bitácoras de RNF-AUD-004 (estado, asignación, libro, apelación y alertas), estas encadenadas por entidad | 0 / cualquiera | S1 |
| Q-004 | SVC_TICKET · SVC_TICKET_STATUS_LOG | Consistencia | `TicketStatusID` fuera de la lista `SVC_TICKET_STATUS` o transiciones no permitidas (`estados.md`) | 0 / cualquiera | S2 |
| Q-005 | SVC_SLA_BREACH_ALERT | Consistencia | Más de una alerta por ticket, tipo de incumplimiento y ciclo: `UNIQUE (TicketID, BreachTypeID, ReopenCycleNumber)` (RN-SVC-008; HU-010) | 0 / cualquiera | S2 |
| Q-006 | Vistas de lectura | Calidad (frescura) | Retraso entre escribir y leer: objetivo de 5 s en p95 (ADR-012) | > 1x / > 2x el objetivo | S2 |
| Q-007 | SVC_OUTBOX_EVENT (ADR-013) | Actividad transaccional | Eventos pendientes de publicar y antigüedad del más viejo: atención a 5 s y crítico a 10 s (ADR-013) | > 5 s / > 10 s | S2 |
| Q-008 | SVC_COMPLAINT_BOOK_ENTRY | Integridad | Objetos de evidencia sin referencia y referencias sin objeto (ADR-006; vínculo con `GOV_DOCUMENT_REPOSITORY`); documentos probatorios sin checksum = 0 (RNF-CUM-007) | 0 / cualquiera | S1 |
| Q-009 | SVC_TICKET | Calidad | Registros paralelos del dato de cliente = 0 (RNF-INT-007; RN-SVC-026): ninguna tabla de ATC copia nombre, documento ni contacto del cliente; la clave foránea a `PARTY` es una referencia a la fuente viva (DT-06, H-11); los datos mínimos de `SVC_TICKET_PROSPECT` se borran al vincular (ED-05). La diferencia con la regla del PO está listada en ED-19 | 0 / cualquiera | S1 |
| Q-010 | SVC_TICKET | Calidad (completitud) | Completitud de campos obligatorios (la obligatoriedad sale del diccionario, ED-16) | < 99,5 % / < 98 % | S3 |
| Q-011 | SVC_COMPLAINT_BOOK_ENTRY | Consistencia | Asiento sin respuesta a los 15 días hábiles improrrogables desde el registro (Ley 29571, art. 24.1, modificado por la Ley 31435; ED-28; la prórroga está deshabilitada) | 0 / cualquiera | S1 |
| Q-012 | SVC_TICKET_PROSPECT | Calidad (retención) | Filas que ya debían borrarse: de tickets vinculados, o de tickets cerrados hace más de 30 días hábiles (2 años desde el registro si tienen asiento del Libro) (ED-05; revisión interna del equipo, O-11). Es la excepción de Q-009: estos datos mínimos no cuentan como registro paralelo mientras estén en plazo | 0 / cualquiera | S1 |
| Q-013 | Columnas con FK diferida (DEU-01) | Integridad | Filas cuya referencia no existe en la tabla ajena; se corre antes de la migración que agrega la FK y debe dar 0 para poder agregarla | 0 / cualquiera | S1 |

Frecuencias: transaccional cada 15 min las primeras 72 h; integridad cada 2 h las primeras 72 h; consistencia diaria en críticas; calidad diaria dos semanas y luego semanal.

## 4.1 Deuda registrada (revisión interna del equipo, O-17 y O-27)

| ID | Deuda | Por qué se acepta | Condición de cierre | Fecha | Dueño |
|---|---|---|---|---|---|
| DEU-01 | **FK diferida en QA, PRE y producción.** Mientras una tabla ajena no exista en el ambiente (`CONTRACT`, `AST_UNIT`, `CONTRACT_UNIT_HANDOVER`, `MAE_WARRANTY_COVERAGE_PERIOD`, `CONTRACT_WARRANTY_CLAIM` o cualquier otra que su dueño no haya creado), la columna de ATC que la referencia se crea sin `REFERENCES` (ED-11), como hizo PJ-05 con `CompanyAreaID` (D-193). Se aparta de DT-06 («con FK físicas») y va en las divergencias de G3 | El dueño de esas tablas no las entrega en la Etapa 1 (DEP-07); sin la columna no se construye | El dueño crea la tabla en el ambiente, Q-013 da 0 y una migración *expand* de ATC agrega la FK | Se revisa en el Go/No-Go del 03-nov y se cierra en el primer release tras la llegada de la tabla, a más tardar el 30-nov-2026 (ED-11) | Brayan Hurtado (migración de `SVC_TICKET`, HU-ATC-001-T02), con el dueño de cada tabla (ED-11) |
| DEU-02 | **Calendario configurado y versionado** (feriados nacionales de Perú del año) en lugar de `MAE_TIME` y `MAE_HOLIDAY` en QA, PRE y producción (ADR-005, punto 3). No es un simulador: es el calendario con el que se calculan los plazos legales | El Equipo Datos no carga las tablas en la Etapa 1 (DEP-04) | Lo firma la Gerencia de ATC como condición del Go/No-Go; se cierra cuando el Equipo Datos carga las tablas y el adaptador las lee | Igual que DEU-01 | Equipo ATC con el Equipo Datos |

## 5 Resultado

**Sin emitir; lista para la firma del Data Chief, sin firmar.** Los 15 hallazgos tienen su resolución (sección 3) y la firma no tiene condiciones: el dueño de migración de los maestros compartidos y de las tablas ajenas que exigen las FK de `SVC_TICKET` lo fija ED-11 (`registro-de-tablas.md` §6). Mientras una tabla ajena no exista en un ambiente, local y DEV usan un script de datos sintéticos de ATC fuera de Flyway, y QA, PRE y producción crean la FK en una migración posterior (DEU-01); `CalendarioPort` usa el calendario configurado y versionado mientras falten `MAE_TIME` y `MAE_HOLIDAY` (ADR-005; DEU-02). Los permisos sobre tablas de otro dueño los otorga cada dueño (H-15). Puede aprobar con observaciones.

| Rol | Nombre | Fecha | Resultado |
|---|---|---|---|
| Data Chief (Gobierno de Datos, emite el acta) | Enrique Albán | | [pendiente] Aprobado / Aprobado con observaciones / Rechazado |

La firma va en Nexora, en la carpeta `datos`. El perfil desarrollador no configura firmas: si la carpeta no admite la firma del Data Chief, lo pide el Líder Técnico al administrador de Nexora. El agente nunca firma.

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v5 de Jesús Chávez Elías en Nexora; actualizado por Brayan con IA (Claude, 2026-10-21) a la v1.3 del PO: hallazgos y reglas de calidad con lo que ya definen el PO y el Excel, y conflicto abierto H-11 por la clave a PARTY. — Revisado por: (pendiente)

Actualizado el 22-oct-2026 por Jesús Chávez Elías con IA (Claude) a partir de la revisión del Líder Técnico (DT-02, DT-03, DT-04 y DT-06 de `analisis/decisiones.md` v0.3). — Revisado por: (pendiente)

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-19 a 2026-10-22 | Jesús Chávez Elías y Brayan Hurtado, con IA | Borrador con los hallazgos H-01 a H-12 y las reglas de calidad (versiones de Nexora hasta la v7) |
| 0.2 | 2026-10-26 | Brayan Hurtado, con IA | H-01, H-02, H-03, H-05 y H-08 resueltos con DT-06 y C-11, con el registro de tablas como evidencia; H-11 y H-12 corregidos (ATC no crea `PARTY`, P-037); H-13 nuevo (correspondencia de `MAE_AREA`, C-07); el acta queda lista para la firma del Data Chief, sin firmar |
| 0.3 | 2026-10-26 | Brayan Hurtado, con IA | Outbox único: `SVC_OUTBOX_EVENT` (ADR-013 v0.3) en H-03, H-08, H-12 y Q-007. H-09 resuelto con ADR-002 y Q-003 sobre las 9 tablas firmadas. Dueño de dato como rol (Gerente de ATC). `SVC_COMPLAINT_BOOK_ENTRY` sin datos personales en columnas. H-14 nuevo (historial de Flyway propio de ATC, línea base 0 y roles `app_atc_migracion` y `app_atc_servicio`, como ADR-001 v0.4). El índice de búsqueda es una colección de lectura (ADR-012 v0.4). P-043 pasa a ser condición de la firma. Sigue sin firmar |
| 0.3 | 2026-10-26 | Brayan Hurtado, con IA | Barrido de coherencia (misma versión, sin cambio de contenido): el outbox cita ADR-013 v0.4, la versión vigente (decía v0.3). |
| 0.4 | 2026-10-26 | Brayan Hurtado, con IA | Decisiones del equipo (`analisis/decisiones.md` v0.7): H-04 resuelto con ED-16 (tipos y nulabilidad), H-10 con ED-14, ED-15 y ED-26, H-11 con ED-05 (interesado «sin cliente vinculado» y `SVC_TICKET_PROSPECT`), H-12 y H-14 con ED-11 (dueño de migración), H-13 con ED-04 (sin correspondencia de `MAE_AREA` en la Etapa 1); la firma ya no tiene la condición P-043; el acta queda lista para la firma del Data Chief |
| 0.5 | 2026-10-26 | Brayan Hurtado, con IA | P-025 decidida por el equipo (`analisis/decisiones.md` v0.8): nota bajo los hallazgos; `SVC_AI_SUGGESTION_LOG` y el caso sensible del evento siguen como cambio al v7 y no se crean en la Etapa 1; ningún hallazgo cambia |
| 0.6 | 2026-10-26 | Brayan Hurtado, con IA | Revisión interna del equipo del 26-oct: H-15 con el `SELECT` por columna sobre `IDN_USER_ACCOUNT`, que otorga Control de acceso (O-03); Q-011 con 15 días hábiles improrrogables (Ley 31435; ED-28; O-01); Q-012, purga de `SVC_TICKET_PROSPECT` (O-11); Q-013 y deudas DEU-01 (FK diferida, O-27) y DEU-02 (calendario configurado, O-17); H-10 con las 15 combinaciones del piloto (C-06). Desde esta versión cada cambio de texto sube la versión (O-26) |
| 0.7 | 2026-10-27 | Brayan Hurtado, con IA | DEU-01 con la fecha y el dueño de ED-11 (a más tardar el 30-nov-2026; Brayan Hurtado), que antes decía 03-dic; las revisiones del 26-oct se citan como internas del equipo, no del Líder Técnico (`analisis/decisiones.md`, nota del 27-oct) |

Actualizado el 26-oct-2026 por Brayan Hurtado con IA (Claude) a partir de la revisión del Líder Técnico del 22-oct (§4, «Modelo de datos y acta F4»; DT-06 y C-11). — Revisado por: (pendiente)

Actualizado el 26-oct-2026 (v0.3) por Brayan Hurtado con IA (Claude) a partir de las revisiones internas técnica y de coherencia del 26-oct: outbox, tablas firmadas, dueño de dato, historial de Flyway y P-043 como condición. El agente no firma. — Revisado por: (pendiente)

Actualizado el 26-oct-2026 (v0.4) por Brayan Hurtado con IA (Claude) a partir de las decisiones del equipo del 26-oct (ED-04, ED-05, ED-11, ED-13, ED-16, ED-19, ED-23 y ED-26 de `analisis/decisiones.md` v0.7). El agente no firma. — Revisado por: (pendiente)

Actualizado el 26-oct-2026 (v0.5) por Brayan Hurtado con IA (Claude): P-025 decidida por el equipo (`analisis/decisiones.md` v0.8). — Revisado por: (pendiente)

Actualizado el 26-oct-2026 (v0.6) por Brayan Hurtado con IA (Claude): revisión interna del equipo (O-01, O-03, O-11, O-17, O-22 y O-27) y decisión del coordinador sobre C-06. El agente no firma. — Revisado por: (pendiente)
