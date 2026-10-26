---
id: "SPEC-DATOS-REGISTRO-TABLAS"
tipo: "spec"
titulo: "Registro de tablas de ATC en la base única: qué crea, qué lee y qué escribe en otro dominio"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.4"
owner: "Brayan Hurtado (Dev 1)"
aprobadores: [tech_lead, data_chief]
fecha: "2026-10-26"
relacionados: [ADR-001, ADR-003, ADR-005, ADR-008, ADR-009, ADR-013, SPEC-DATOS-DICCIONARIO, SPEC-DATOS-ACTA-F4, SPEC-ARQ-MIGRACION]
tags: [datos, base-unica, gobierno-de-datos, f4, g3]
---

# Registro de tablas de ATC (C-11)

Responde a la colisión **C-11** de la revisión del Líder Técnico (22-oct-2026): «Publicar el registro de tablas de ATC: qué crea (`SVC_*` y sus catálogos), qué solo lee y qué escribe en otro dominio. Los maestros compartidos tienen un solo dueño de migración, acordado con Gobierno de Datos». Aplica **DT-06** (las tablas de ATC van en la base única del modelo v7, en Azure Database for PostgreSQL, con FK físicas, y `PARTY` es la fuente viva del cliente) y **DT-03** (ATC no guarda usuarios, roles ni permisos).

**Decidido por el equipo** (Brayan Hurtado), 26-oct-2026; propuesta al Líder Técnico en este envío (`analisis/decisiones.md` v0.7: ED-01, ED-04, ED-05, ED-11, ED-15, ED-16 y ED-23). El dueño de migración de cada tabla lo fija ED-11 (§6). La persona que es dueña de dato la designa el Data Chief al firmar el acta F4 (`acta-validacion-arquitectura-datos.md`), que queda lista para su firma: es una firma, no una condición del registro.

## 1 Reglas que se toman del paquete aprobado de Control de acceso (PJ-05)

Citas `archivo:línea` de la copia sellada de PJ-05 (`docs-roles-y-permisos/`, 195 documentos aprobados).

| Regla | Qué dice PJ-05 | Cita |
|---|---|---|
| Una sola base | La base única nace en Azure con Control de acceso (R26): en el mismo Azure Database for PostgreSQL van las 24 tablas del fragmento 01 y solo las tablas de otros fragmentos que sus relaciones necesitan, tal como están en el v7, con FK físicas | `analisis/decisiones.md:115`; `adr/ADR-019-base-en-azure-y-frontera-con-gcp.md:101-111` |
| Qué crea Control de acceso fuera del fragmento 01 | REFERENCE: `MAE_GENERIC_LIST`, `MAE_GENERIC_LIST_VALUE`, `MAE_CHANNEL`, `MAE_SOURCE_SYSTEM`, `MAE_GEOGRAPHY_LEVEL`, `MAE_GEOGRAPHY`, `MAE_CURRENCY`. PARTY: `PARTY`, `PARTY_STATUS_LOG`, `PARTY_IDENTIFICATION`, `MAE_DOCUMENT_TYPE`, `PARTY_COMMUNICATION`, `PARTY_VERIFICATION_LOG`. COMPANY: `ORG_COMPANY`, `MAE_COMPANY_TYPE`, `MAE_BUSINESS_LINE`, `MAE_INDUSTRY_CLASSIFICATION`, `MAE_COMPANY_STATUS`. Roles por empresa: `NEX_USER_COMPANY_ROLE`. GOVERNANCE: `GOV_INTEGRITY_EXCEPTION` (E1) | `analisis/decisiones.md:123-134` («§5»); `adr/ADR-019-base-en-azure-y-frontera-con-gcp.md:51-58` |
| Identidad y roles por empresa | Las 24 tablas del fragmento 01 y `NEX_USER_COMPANY_ROLE` son de Control de acceso | `analisis/decisiones.md:116` (R27) y `:127`; `adr/ADR-019-base-en-azure-y-frontera-con-gcp.md:53` y `:57` |
| Cada tabla existe una vez | El resto de cada fragmento lo construye su dueño en la misma base y «no las recrea»; impide «duplicar un maestro» | `adr/ADR-019-base-en-azure-y-frontera-con-gcp.md:112-113` y `:164-168` |
| Tabla ajena, tal como en el v7 | No se agregan, quitan ni renombran columnas de una tabla ajena; si le falta algo, el cambio va al dueño de su fragmento | `adr/ADR-019-base-en-azure-y-frontera-con-gcp.md:105-108` |
| Puerta F4 | Crear tablas de otros dominios pasa por la puerta F4 de Gobierno de Datos, con la lista exacta de tablas, su dueño de dato y quién las escribe | `analisis/decisiones.md:115`; `adr/ADR-019-base-en-azure-y-frontera-con-gcp.md:114-115` |
| Dueño de dato de las tablas ajenas | Lo designa Gobierno de Datos en la puerta F4; quien las crea es su custodio mientras llega su dueño | `adr/ADR-019-base-en-azure-y-frontera-con-gcp.md:180-184` |
| Migraciones de tablas ajenas | Las migraciones ya corridas que las crean se quedan en el repositorio que las corrió; los cambios nuevos los hace su dueño en su repositorio | `adr/ADR-019-base-en-azure-y-frontera-con-gcp.md:171-174` |
| Quién escribe `PARTY` | La puerta de carga (`PERSON_LOADER`), el autorregistro (Party no verificada, R29) y la validación del prospecto. Control de acceso escribe en el fragmento 3 solo lo que el autorregistro necesita | `analisis/decisiones.md:118` (R29) y `:602` (A26); `adr/ADR-019-base-en-azure-y-frontera-con-gcp.md:116-127` |
| Datos de personas | «Nadie lee las tablas de personas directamente»: el dueño del fragmento 3 entrega el dato ya enmascarado | `analisis/decisiones.md:325` (D-119) |
| Áreas organizacionales | `NEX_COMPANY_AREA` no existe en las 55 tablas de PJ-05; la crea su dueño de modelo; `CompanyAreaID` se crea sin FK | `analisis/decisiones.md:280` (D-74) y `:399` (D-193); `adr/ADR-019-base-en-azure-y-frontera-con-gcp.md:149-151` |

## 2 Tablas que crea ATC (dueño de migración: ATC)

Son las 13 tablas del fragmento 10 SERVICE del v7. **No están en la lista de lo que crea Control de acceso** (sección 1), así que las crea ATC con sus migraciones Flyway, en la base única, con FK físicas (DT-06). Esto cierra la duda de ADR-001 sobre si ya existían. Módulos según ADR-001.

«Datos personales» es la **clasificación del equipo para H-02** del acta F4 (el v7 declara 0 tablas DAC en SERVICE); la firma el Data Chief con el acta.

**Dueño de dato (H-01): un rol, el Gerente de ATC** (Gerencia de Atención al Cliente), no un módulo ni un área. Es el mismo dueño para las 13 tablas de SERVICE, para los cambios al v7 de la sección 3 y para las vistas de lectura que derivan de ellas; en el Libro de Reclamaciones y las apelaciones consulta a la Gerencia Legal, que valida su contenido (DEP-05). La persona la designa el Data Chief al firmar el acta F4. Los ADR (ADR-001, 002, 005, 012 y 013, v0.4) remiten a este registro para el dueño de dato.

**Tablas firmadas: 9 (ADR-002, punto 3).** Las 4 que firma el v7 (`SVC_TICKET`, `SVC_TICKET_INTERACTION`, `SVC_COMPLAINT_BOOK_ENTRY` y `SVC_COMPLAINT_APPEAL`) y las 5 bitácoras que pide RNF-AUD-004, a las que se agrega la columna `IntegrityHash` como cambio al v7 (ED-23). La receta de las 3 entidades del v7 que no son `SVC_TICKET` es la de ADR-002, punto 4: el libro del v7 que tiene el equipo no trae otra (ED-16).

| Tabla | Clase | Módulo que la migra | Firmada (v7 o RNF-AUD-004; ADR-002) | Datos personales (H-02) | Dueño de dato (rol) |
|---|---|---|---|---|---|
| `MAE_AREA` | Catálogo: **cola de atención** del ticket, no estructura organizacional (C-07, sección 7) | `tickets` | — | No | Gerente de ATC |
| `MAE_TICKET_TYPE` | Catálogo | `tickets` | — | No | Gerente de ATC |
| `MAE_TICKET_PRIORITY` | Catálogo | `tickets` | — | No | Gerente de ATC |
| `MAE_SLA_POLICY` | Catálogo | `sla` | — | No | Gerente de ATC |
| `SVC_TICKET` | Entidad | `tickets` | Sí (v7; receta v2 en el Excel) | Solo referencias (`PartyID`, `ContractID`, `UnitID`): no copia el dato del cliente (DT-06, ADR-003) | Gerente de ATC |
| `SVC_TICKET_STATUS_LOG` | Bitácora | `tickets` | Sí (RNF-AUD-004; columna nueva) | No: `Notes_*` sin datos personales (RN-SVC-012) | Gerente de ATC |
| `SVC_TICKET_ASSIGNMENT_LOG` | Bitácora | `tickets` | Sí (RNF-AUD-004; columna nueva) | No (RN-SVC-012) | Gerente de ATC |
| `SVC_TICKET_INTERACTION` | Entidad | `tickets` | Sí (v7; receta de ADR-002, ED-16) | **Sí, puede tener:** texto libre y adjuntos. Se propone tratarla como dato personal (Ley 29733): acceso por rol (RNF-SEC-008) | Gerente de ATC |
| `SVC_SLA_BREACH_ALERT` | Entidad | `sla` | Sí (RNF-AUD-004; columna nueva) | No | Gerente de ATC |
| `SVC_COMPLAINT_BOOK_ENTRY` | Entidad (1:1 con el ticket) | `complaintbook` | Sí (v7; la carta entra al hash, RN-SVC-010; receta de ADR-002, ED-16) | **No en columnas; confidencial.** El asiento guarda la referencia a la hoja y el `PartyID` (ADR-003, punto 6); la hoja con los datos del consumidor y la narrativa del reclamo es un documento del almacén de evidencia (ADR-006), con su espejo en `GOV_DOCUMENT_REPOSITORY`. El v7 la reclasificó «no DAC». Formato del Anexo I del Reglamento y 2 años de conservación (ED-13) | Gerente de ATC (consulta a la Gerencia Legal) |
| `SVC_COMPLAINT_BOOK_ENTRY_STATUS_LOG` | Bitácora | `complaintbook` | Sí (RNF-AUD-004; columna nueva) | No (RN-SVC-012) | Gerente de ATC (consulta a la Gerencia Legal) |
| `SVC_COMPLAINT_APPEAL` | Entidad | `complaintbook` | Sí (v7; receta de ADR-002, ED-16) | Puede tener: resumen de la resolución | Gerente de ATC (consulta a la Gerencia Legal) |
| `SVC_COMPLAINT_APPEAL_STATUS_LOG` | Bitácora | `complaintbook` | Sí (RNF-AUD-004; columna nueva) | No (RN-SVC-012) | Gerente de ATC (consulta a la Gerencia Legal) |

Las columnas que guardan a un colaborador (`CreatedByPartyID`, `CurrentOwnerPartyID`, `ChangedByPartyID`, `AssignedToPartyID`, `AssignedByPartyID`, `AgentPartyID`, `AlertedPartyID`, `ResponderPartyID` y `ClosedByPartyID`) son FK a `PARTY`. El token de Control de acceso trae `user_account_id` y no `PartyID`: ATC obtiene la Party del colaborador y la del cliente de Mi Portal leyendo, en solo lectura y por columna, el vínculo de la cuenta en `IDN_USER_ACCOUNT` (`CuentaPersonaPort`; ED-01 y §4). Un cambio automático o de un job deja el autor vacío (ED-16).

## 3 Cambios al v7 (tablas y columnas de ATC; ED-15 y ED-23)

El v7 no los trae. El equipo decidió crearlos como tablas o columnas del fragmento SERVICE, que migra ATC; van en el acta F4 (H-03), lista para la firma del Data Chief.

**Etapa 1 (P-025, decidida por el equipo el 26-oct-2026; `analisis/decisiones.md` v0.8).** HU-ATC-037, 038, 039, 048 y 053 salen de la Etapa 1. Dos cambios de esta tabla solo los usan ellas y **no se crean en la Etapa 1**: `SVC_AI_SUGGESTION_LOG` (HU-048) y el caso sensible del evento (HU-037 a 039); siguen documentados como cambio al v7 y se crean cuando entren. La búsqueda vectorial de HU-053 tampoco se activa. Los demás cambios no cambian.

| Cambio al v7 | Para qué | Historias o ADR | Decisión |
|---|---|---|---|
| `SVC_OUTBOX_EVENT` (propia, fragmento 10) y la lista `SVC_OUTBOX_EVENT_TYPE` | Outbox transaccional del servicio (DT-02). ADR-013 la elige porque `INTG_OUTBOX_EVENT` del v7 es para envíos a sistemas externos y no sirve como outbox de ATC; es el cambio al v7 que se presenta. Columnas en ADR-013 v0.4, punto 6, entre ellas `UserAccountID` (el `user_account_id` del token de quien hizo el cambio; nulo si el evento lo origina un job; sin FK: es una tabla técnica que se purga a los 7 días). Sin datos personales y sin `IntegrityHash`; se purga a los 7 días | ADR-013; ED-23 | Decidido (ED-23) |
| `SVC_AI_SUGGESTION_LOG` (ENT-SVC-016) | Registro de cada sugerencia de IA y su decisión, sin datos personales | ADR-007; HU-048; ED-23 | Decidido (ED-23) · no se crea en la Etapa 1 (P-025); se crea cuando entre HU-048 |
| `SVC_WORKFLOW_DEFINITION` (ENT-SVC-014) y `SVC_WORKFLOW_ACTIVITY`, con su versión | Flujo por tipo, subtipo y área, versionado; el ticket congela su versión (RN-SVC-045) | ADR-008; HU-043; ED-15 | Decidido (ED-23) |
| `MAE_TICKET_SUBTYPE` | Subtipo del ticket | ADR-008; HU-043, HU-064; ED-15 | Decidido (ED-23) |
| `SVC_TICKET_SLA_PAUSE` y la columna `AutoCloseBusinessDays` de `MAE_SLA_POLICY` (valor inicial 5) | Pausas del SLA (también la suspensión por reclamo) y días hábiles de espera antes del cierre automático | ADR-008; HU-066, HU-056; ED-15 | Decidido (ED-23) |
| Columnas nuevas en `SVC_TICKET`: `SubtypeID`, `WorkflowID`, `IsLightning`, `LightningReason`, `LightningByPartyID`, `ConflictFlag`, `CurrentAxisCode` e `IsPartyLinkPending` | Lo que el PLT-04 §6.5 dibuja y el v7 no tiene | HU-043, HU-045, HU-026, HU-051, HU-064 | Decidido (ED-23) |
| Columna nueva en `MAE_AREA`: posición en la sede | Visor 3D (HU-067). No se agrega referencia al área organizacional: en la Etapa 1 no hay correspondencia (ED-04, §7) | HU-067; ED-04 | Decidido (ED-23) |
| `SVC_KNOWLEDGE_ARTICLE` (ENT-SVC-015) | Guías de solución por tipo, con versiones | HU-047 | Decidido (ED-23) |
| `SVC_SIMPLE_FORM_DEFINITION` (ENT-SVC-019) y `SVC_EVENT_BUS_BOOKING` (ENT-SVC-020) | Formularios simples y reserva de bus. Las candidatas del v7, `EVT_ATTENDEE` y `EVT_TRANSPORT`, no se usan: su fragmento no tiene dueño en la Etapa 1 | HU-059, HU-060 | Decidido (ED-23) |
| `SVC_CONTRACT_DEFAULT_ALERT` (ENT-SVC-018) | Caso de resolución por morosidad y constancia de alertas. La candidata del v7, `PAY_COLLECTION_ACTIVITY`, no se usa: es de un fragmento sin dueño en la Etapa 1 | HU-056 a HU-058 | Decidido (ED-23) |
| Casos sensibles: `SENSITIVE_CASE`, `MAE_INTAKE_LINE`, `RISK_ASSESSMENT`, `ESCALATION_LOG`, `CASE_CLOSURE`, vínculo entre casos | Mesa SGD (esbozos «por modelar» del PLT-04 §6.5) | HU-020 a HU-025 | Decidido (ED-23) |
| `HANDOFF_PACKAGE`, `EMOTIONAL_NOTE` y el caso sensible del evento | Handoff a Eje 3, nota de estado emocional y EntregaFest | HU-027, HU-028, HU-037 a HU-039 | Decidido (ED-23) · el caso sensible del evento (`SENSITIVE_EVENT_CASE` y `EVENT` del diccionario) no se crea en la Etapa 1 (P-025); se crea cuando entren HU-037 a 039 |
| `shedlock` | Tabla técnica de ShedLock para que un job corra en una sola réplica (DT-08) | ADR-005; ED-23 | Decidido (ED-23) |
| `flyway_schema_history_atc` | Tabla técnica de historial de Flyway propia de ATC en la base única (sección 3.1) | ADR-001 v0.5, regla 5; `arquitectura/migracion-y-reversion.md` §1; ED-11 |
| `SVC_TICKET_PROSPECT` | Datos mínimos del interesado sin `PARTY` (tipo y número de documento, nombre, teléfono y correo), 1:1 con el ticket «sin cliente vinculado»; dato personal; la fila se borra al vincular | HU-051; ADR-003; ED-05 | Decidido (ED-05) |
| `SVC_TICKET_ACTIVITY` y la lista `SVC_TICKET_ACTIVITY_STATUS` | Actividades de cada ticket: estado, fecha en que se habilita, vencimiento y cierre | HU-043 CA-04; ADR-008; ED-15 | Decidido (ED-15) |
| `SVC_NOTIFICATION_LOG` | Constancia del correo de asignación (destinatario como `PartyID`, canal, fecha y estado de entrega), sin datos del cliente. `NEX_NOTIFICATION_LOG` no se usa: es de un fragmento sin dueño en la Etapa 1 | HU-055; ED-23 | Decidido (ED-23) |
| Listas nuevas de SERVICE en `MAE_GENERIC_LIST_VALUE`: `SVC_COMPLAINT_STATUS`, `SVC_COMPLAINT_TYPE`, `SVC_COMPLAINT_APPEAL_LEVEL`, `SVC_SLA_TIME_BASIS`, `SVC_CASE_CLOSURE_STATUS`, `SVC_WARRANTY_DEFECT_TYPE`, `SVC_BUS_BOOKING_STATUS`, y los valores nuevos `REASSIGNMENT_WORKLOAD` y `CALL` | Códigos que el Excel no da (`datos/diccionario.md`, «Listas de valores») | ED-19; ED-26 | Decidido (ED-26) | Decidido (ED-23) |

**No es cambio al v7: `SVC_SEARCH_INDEX` (ENT-SVC-017 del PLT-05).** El índice de búsqueda de HU-049 y HU-053 no es una tabla de la base única: es una **colección del almacén de lectura**, con identificadores y metadatos de permisos y sin datos personales, que escribe el proyector (ADR-003 y ADR-012 v0.4). La búsqueda por significado de HU-053 (alcance flexible, R-01; fuera de la Etapa 1 por P-025: se activa cuando entre) usa la búsqueda vectorial del mismo servicio con filtro previo por permisos, con los vectores de `text-embedding-3-small` (ADR-007 y ADR-012; ED-17).

### 3.1 Historial de Flyway en la base única

En la base única corren las migraciones de varios servicios: Control de acceso ya migra la suya y, si no la cambió en su configuración, usa la tabla de historial por defecto del starter (`flyway_schema_history`). Sea cual sea, si ATC usara la misma, Flyway vería migraciones que no son suyas y la validación fallaría al arrancar. Por eso ATC lleva **su propia tabla de historial** y no toca la de nadie:

Es la regla 5 de ADR-001 v0.5:

| Propiedad | Valor | Por qué |
|---|---|---|
| `aybar.data.flyway.baseline-table` | `flyway_schema_history_atc` | Historial propio de ATC; `aybar-starter-data` 0.7.1 lo traduce a `spring.flyway.table`. Va en el mismo esquema que las tablas del v7 de la base única |
| `aybar.data.flyway.baseline-on-migrate` | `true` | La base no está vacía (tiene las tablas de Control de acceso): sin línea base, Flyway no arranca sobre un esquema con objetos |
| `spring.flyway.baseline-version` | `0` | Con la de defecto (1), Flyway saltaría la `V1__` de ATC. Es la única propiedad `spring.flyway.*` que se declara, porque el SDK no la expone en `aybar.data.flyway.*`, y no se repite en los dos espacios. **Es una excepción a la regla literal del contrato** («no fijar `spring.flyway.*` y `aybar.data.flyway.*` a la vez»): el equipo la propone al Líder Técnico en ADR-001 (ED-11); si el SDK expone `baseline-version` en `aybar.data.flyway.*`, se pasa a esa propiedad |
| `aybar.data.flyway.locations` | `classpath:db/migration` | Solo las migraciones de ATC |

Las migraciones corren en un **job aparte** (Azure Container Apps Job, antes de cada despliegue) con el rol de base **`app_atc_migracion`**, dueño de las tablas de ATC (`SVC_*` y `MAE_*` de SERVICE, `SVC_OUTBOX_EVENT`, `shedlock` y `flyway_schema_history_atc`) y con `REFERENCES` sobre las tablas ajenas de las FK. La aplicación arranca con `aybar.data.flyway.enabled: false` y el rol **`app_atc_servicio`**, que no es dueño de nada (ADR-001 v0.5, regla 5; ADR-002; `arquitectura/seguridad.md`). Esquema: el de las tablas del v7 en la base única; historial propio con línea base 0, que no depende del historial de otros servicios (ED-11). El rol `app_atc_servicio` tiene además `SELECT` por columna sobre `IDN_USER_ACCOUNT` (§4; ED-01).

## 4 Tablas que ATC solo lee (no las crea ni las migra)

| Tabla | Fragmento | Quién la crea hoy | Para qué la usa ATC |
|---|---|---|---|
| `PARTY` | 3 PARTY | Control de acceso (E1) | FK física de `SVC_TICKET` y de las bitácoras (DT-06). ATC no lee los datos de la persona en las tablas de personas: el nombre, el documento y el contacto llegan por la consulta del cliente en línea, que devuelve el `PartyID` (ED-05), o enmascarados del dueño del fragmento 3 (D-119) |
| `IDN_USER_ACCOUNT` (solo `UserAccountID`, `PartyID`, `AccountTypeID`, `AccountStatusID` y, de las cuentas `EMPLOYEE`, `Username`) | 01 IDENTITY-ACCESS | Control de acceso (E1) | Traducir el `user_account_id` del token a la Party del colaborador y del cliente de Mi Portal, y la dirección del correo de asignación (HU-055). `SELECT` por columna para `app_atc_servicio`, en solo lectura y sin copia: el dato vive lo que dura la petición. La tabla es NO-DAC y la FK `PartyID` es obligatoria (PJ-05 `datos/modelo-de-datos.md:84` y `:281`). Puerto `CuentaPersonaPort` (ED-01) |
| `ORG_COMPANY`, `MAE_BUSINESS_LINE` | 2 COMPANY | Control de acceso (E1) | Empresa y línea de negocio del ticket (RN-SVC-005) |
| `MAE_GENERIC_LIST`, `MAE_GENERIC_LIST_VALUE` | 0 REFERENCE | Control de acceso (E1) | Estados, tipos y motivos de SERVICE (pares `<Campo>ListID` + `<Campo>ID`). ATC además siembra sus listas (sección 5) |
| `MAE_CHANNEL`, `MAE_CURRENCY` | 0 REFERENCE | Control de acceso (E1) | Canal del ticket, de la interacción y de la alerta; moneda del reclamo |
| `ORG_COMPANY_ADDRESS`, `ORG_PRODUCT` | 2 COMPANY | **Nadie todavía** | FK física de `SVC_TICKET` y del asiento del Libro (establecimiento y producto). Dueño de migración: ATC como custodio (ED-11, §6) |
| `CONTRACT`, `AST_UNIT` | CONTRACT | **Nadie todavía** | FK física de `SVC_TICKET` (contrato y lote). Dueño de migración y de la carga: el dueño del fragmento CONTRACT (DEP-07; ED-11, §6) |
| `MAE_TIME`, `MAE_HOLIDAY` | 0 REFERENCE | **Nadie todavía** | Días hábiles y feriados del SLA y del plazo legal (ADR-005). Los da y los migra el Equipo Datos (DEP-04; ED-11, §6) |
| `CONTRACT_UNIT_HANDOVER`, `MAE_WARRANTY_COVERAGE_PERIOD` | CONTRACT | **Nadie todavía** | Acta de entrega y cobertura de la garantía (HU-033, HU-034; DEP-07). Dueño de migración: el dueño del fragmento CONTRACT (ED-11, §6) |

**Precondición de la primera migración de ATC.** Con FK físicas, la migración de `SVC_TICKET` (tarea HU-ATC-001-T02) solo corre si ya existen `ORG_COMPANY`, `ORG_COMPANY_ADDRESS`, `PARTY`, `CONTRACT`, `AST_UNIT`, `MAE_CHANNEL`, `MAE_BUSINESS_LINE`, `ORG_PRODUCT`, `MAE_GENERIC_LIST` y `MAE_GENERIC_LIST_VALUE`. En local y en DEV, si alguna no existe, la crea un **script de datos sintéticos de ATC fuera de Flyway**, tal como está en el v7: no es una migración de ATC ni llega a QA (ED-11). No hay scripts de datos sintéticos del v7 para esas tablas: PJ-05 trae solo sus semillas y el juego sintético de personas de su HU-IDN-061 (CA-11), y la plantilla de ATC, solo `V1__init.sql`. En QA, PRE y producción, mientras una tabla ajena no exista en el ambiente, la columna de ATC que la referencia se crea sin `REFERENCES` y la FK llega en una migración posterior, como hizo PJ-05 con `CompanyAreaID` (D-193).

## 5 Lo que ATC escribe en tablas de otro dominio

Son filas, no estructura. ATC no cambia el modelo de esas tablas (sección 1).

| Tabla | Fragmento | Qué escribe ATC | Quién crea la tabla | Estado |
|---|---|---|---|---|
| `MAE_GENERIC_LIST`, `MAE_GENERIC_LIST_VALUE` | 0 REFERENCE | Sus listas: `SVC_TICKET_STATUS`, `SVC_ASSIGNMENT_REASON`, `SVC_SLA_BREACH_TYPE`, `SVC_TICKET_INTERACTION_TYPE`, `SVC_COMPLAINT_APPEAL_STATUS`, la base de tiempo, el tipo de reclamo, la instancia de apelación y el estado del asiento (diccionario, «Listas de valores»). Como semilla versionada con `GenericListID` fijos, igual que Control de acceso siembra las suyas | Control de acceso | ATC corre su semilla versionada con `GenericListID` fijos de SERVICE (ED-11) |
| `MAE_CHANNEL` | 0 REFERENCE | El valor `MI_PORTAL` (HU-064) | Control de acceso | Semilla versionada de ATC (ED-11) |
| `GOV_INTEGRITY_EXCEPTION` | 8 GOVERNANCE | Excepciones `ORPHAN_REFERENCE` (HU-015) y `HASH_MISMATCH` (Q-003 del acta) | Control de acceso (E1) | Los valores de su lista los siembra Control de acceso; `ORPHAN_REFERENCE` y `HASH_MISMATCH` están en el Excel (ENT-GOV-001); si faltan, ATC los agrega en su semilla (ED-11) |
| `GOV_DOCUMENT_REPOSITORY` | 8 GOVERNANCE | Fila espejo de cada documento probatorio, con checksum y versión (ADR-006) | ATC, como custodio (ED-11; PJ-05 la deja para después) | Decidido (ED-11) |
| `SVY_SURVEY_RESPONSE` | PERFORMANCE-MEASUREMENT | La encuesta del ticket cerrado, por puntero polimórfico (`SubjectEntityName = 'SVC_TICKET'`, RNF-INT-004) | El dueño del KPI Engine (DEP-10; ED-11) | Decidido (ED-11) |
| `CONTRACT_WARRANTY_CLAIM` | CONTRACT | El reclamo de garantía (HU-033 a HU-036) | El dueño del fragmento CONTRACT (DEP-07; ED-11) | Escribe ATC (P-014 cerrada); migra el dueño del fragmento (ED-11) |

**ATC no escribe** en `PARTY` ni en ninguna tabla de personas: ni la Party no verificada del interesado, que crea Control de acceso al autorregistrarlo (R29, A26; ED-05). Tampoco en `IDN_SYSTEM_TASK` ni en otra tabla del fragmento 01. Las reservas del Entrega Fest no van a `EVT_ATTENDEE` ni a `EVT_TRANSPORT`, sino a `SVC_EVENT_BUS_BOOKING` (§3).

## 6 Dueño único de migración de los maestros compartidos (decidido por el equipo, ED-11)

C-11 pide un solo dueño de migración por maestro compartido. La decisión sigue la regla de PJ-05: quien crea la tabla primero la crea tal como está en el v7, es su custodio y su migración no se reescribe; quien llega después no la recrea (sección 1). ATC migra lo suyo y, como custodio, lo que nadie crea y solo ATC usa en la Etapa 1; los maestros compartidos los migra su dueño. Va en el acta F4, lista para la firma del Data Chief.

| Maestro o tabla compartida | Dueño de migración hoy | Decisión (ED-11) | Por qué |
|---|---|---|---|
| `MAE_GENERIC_LIST`, `MAE_GENERIC_LIST_VALUE`, `MAE_CHANNEL`, `MAE_CURRENCY` | Control de acceso | **Control de acceso.** ATC entrega sus valores como semilla versionada y no toca la estructura | Ya los crea en E1 (PJ-05 `analisis/decisiones.md:128`) |
| `PARTY` | Control de acceso | **Control de acceso** (y el dueño del fragmento 3 cuando llegue) | Ya la crea en E1 (`:129`); ATC no la escribe |
| `ORG_COMPANY`, `MAE_BUSINESS_LINE` | Control de acceso | **Control de acceso** | Ya los crea en E1 (`:130`) |
| `GOV_INTEGRITY_EXCEPTION` | Control de acceso | **Control de acceso** | Ya la crea en E1 (`:132`) |
| `ORG_COMPANY_ADDRESS`, `ORG_PRODUCT` | Nadie | **ATC**, tal como están en el v7, como custodio hasta que llegue el dueño del fragmento 2 | Las exige la FK física de `SVC_TICKET` (DT-06) |
| `CONTRACT`, `AST_UNIT`, `CONTRACT_UNIT_HANDOVER`, `MAE_WARRANTY_COVERAGE_PERIOD`, `CONTRACT_WARRANTY_CLAIM` | Nadie | **El dueño del fragmento CONTRACT** (Equipo Contratos, DEP-07), que también las carga. Mientras no existan en un ambiente: script sintético en local y DEV, y FK diferida en QA, PRE y producción (§4) | Sus datos vienen de Contratos; ATC solo los referencia o registra el reclamo |
| `MAE_TIME`, `MAE_HOLIDAY` | Nadie | **Equipo Datos** (DEP-04), que da el calendario; mientras no exista, `CalendarioPort` usa su simulador (ADR-005) | El PLT-01 ya le asigna la DEP-04 |
| `GOV_DOCUMENT_REPOSITORY` | Nadie en E1 | **ATC**, tal como está en el v7, como custodio | ATC es el primero que la necesita en la Etapa 1 (ADR-006) |
| `flyway_schema_history_atc` | — | **ATC** (la crea Flyway en su primera migración, con el rol `app_atc_migracion`) | Historial propio de ATC (sección 3.1) |
| `SVY_SURVEY_RESPONSE` | Nadie | **El dueño del KPI Engine** (Equipo Datos / BI, DEP-10) | La lee el KPI Engine |

Riesgo: igual que en PJ-05 (su R-03), ATC carga con tablas de otros dominios hasta que lleguen sus dueños. Cada una que ATC cree pasa por la puerta F4.

## 7 `MAE_AREA` y la estructura organizacional (C-07; ED-04)

- `MAE_AREA` queda **solo como cola de atención** del ticket en el dominio SERVICE: la usan `SVC_TICKET.CurrentAreaID` y `SVC_TICKET_ASSIGNMENT_LOG.AreaID`. No guarda líderes, supervisores ni personas.
- El líder o supervisor de un área **no se guarda en ATC**: es quien entra con `ATC_SUPERVISOR` con alcance sobre la cola y la empresa, y los gestores de la cola son los que muestra la bitácora de asignaciones de ATC (ED-03).
- **En la Etapa 1 no hay correspondencia `MAE_AREA` ↔ estructura organizacional** (ED-04). La revisión del Líder Técnico la plantea contra `NEX_COMPANY_AREA`, pero esa tabla **no existe** en PJ-05: la crea su dueño de modelo (D-74) y `NEX_USER_COMPANY_ROLE.CompanyAreaID` se crea sin FK hasta entonces (D-193). C-07 se cumple igual: `MAE_AREA` es solo cola y el líder no se guarda.
- El área de cada rol de ATC es un parámetro de ATC sin personas (S-4 de `roles-y-permisos-atc.md`: `ATC_LEGAL` → `LEGAL`, `ATC_POSTVENTA` → `POSTVENTA`, `ATC_AGENT` y `ATC_SUPERVISOR` → las colas de su empresa, o todas con rol global).
- **Evolución:** si el dueño de NEXUS crea `NEX_COMPANY_AREA`, la correspondencia (una columna de referencia en `MAE_AREA`, opcional) se presenta a Gobierno de Datos como cambio.

| Cola en `MAE_AREA` (Excel) | Área organizacional | Decisión |
|---|---|---|
| `ATC`, `COBRANZA`, `LEGAL`, `POSTVENTA`, `TI`, `ADMINISTRACION` | Sin correspondencia en la Etapa 1 | Decidido (ED-04): la tabla de áreas organizacionales no existe |

## 8 Lo que ATC no crea, no migra ni copia (C-11)

- Las 24 tablas del fragmento 01 (identidad y acceso), entre ellas `IDN_USER_ACCOUNT`, `IDN_USER_ROLE`, `IDN_USER_SESSION` e `IDN_SYSTEM_TASK`, y los catálogos `MAE_SYSTEM_ROLE` y `MAE_MENU_OPTION`: son de Control de acceso. Quién es el usuario y sus roles salen del token (DT-03, DT-05); ATC solo lee, en solo lectura y por columna, el vínculo de la cuenta en `IDN_USER_ACCOUNT` (§4; ED-01), sin copia.
- `NEX_USER_COMPANY_ROLE` (roles por empresa): la administra Control de acceso.
- Tablas de sesión o de códigos de un solo uso: no hay `PORTAL_SESSION` ni códigos propios (DT-04).
- Maestro local de usuarios, roles, áreas o líderes, y su carga desde RR. HH.: no existe (DT-03, C-01).
- La tabla de áreas organizacionales: es de su dueño de modelo (D-74).
- Copias del dato del cliente: `PARTY` es la fuente viva (DT-06). Los datos mínimos del interesado sin `PARTY` viven en `SVC_TICKET_PROSPECT` solo hasta la vinculación (ED-05).

## 9 Dónde se usa este registro

- `arquitectura/migracion-y-reversion.md` §2: qué migra ATC y en qué orden.
- `datos/acta-validacion-arquitectura-datos.md` v0.4: evidencia de H-01 (dueños), H-02 (datos personales), H-03 (cambios al v7), H-04 (tipos, ED-16), H-08 (base única), H-09 (tablas firmadas), H-12, H-13 (`MAE_AREA`, ED-04) y H-14 (historial de Flyway).
- `datos/diccionario.md`: equivalencias con el v7.

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-26 | Brayan Hurtado, con IA | Versión inicial (C-11): tablas que crea ATC, cambios al v7, tablas que solo lee, filas que escribe en otro dominio, propuesta de dueño único de migración, `MAE_AREA` como cola (C-07) y lo que ATC no crea. Citas a la copia sellada de PJ-05 |
| 0.2 | 2026-10-26 | Brayan Hurtado, con IA | Dueño de dato propuesto como rol (Gerente de ATC), no como área ni módulo. Columna «Firmada» con las 9 tablas de ADR-002 (4 del v7 y 5 bitácoras). `SVC_COMPLAINT_BOOK_ENTRY` sin datos personales en columnas (la hoja va al almacén de evidencia, ADR-003 punto 6). `SVC_SEARCH_INDEX` sale de los cambios al v7: es una colección del almacén de lectura (ADR-012 v0.4). `SVC_OUTBOX_EVENT` con `UserAccountID` (ADR-013 v0.4). Tabla de historial de Flyway propia de ATC (`flyway_schema_history_atc`, línea base 0, roles `app_atc_migracion` y `app_atc_servicio`, job aparte; sección 3.1, ADR-001 v0.4) |
| 0.3 | 2026-10-26 | Brayan Hurtado, con IA | Decisiones del equipo (`analisis/decisiones.md` v0.7): dueño de migración decidido (ED-11, §6), con script de datos sintéticos fuera de Flyway en local y DEV y FK diferida en QA, PRE y producción; lectura por columna de `IDN_USER_ACCOUNT` (ED-01, §4 y §8); `SVC_TICKET_PROSPECT` (ED-05), `SVC_TICKET_ACTIVITY` y `AutoCloseBusinessDays` (ED-15), `SVC_NOTIFICATION_LOG` y listas nuevas (ED-23, ED-26) en §3; sin las candidatas `EVT_*` y `NEX_NOTIFICATION_LOG`; `MAE_AREA` sin correspondencia en la Etapa 1 y sin la columna de área organizacional (ED-04, §7); recetas de ADR-002 (ED-16) |
| 0.4 | 2026-10-26 | Brayan Hurtado, con IA | P-025 decidida por el equipo (`analisis/decisiones.md` v0.8): `SVC_AI_SUGGESTION_LOG` (HU-048) y el caso sensible del evento (HU-037 a 039) siguen documentados como cambio al v7 y no se crean en la Etapa 1; la búsqueda vectorial de HU-053 se activa cuando entre |

Generado por IA: borrador completo (Claude, 26-oct-2026) a partir de la revisión del Líder Técnico del 22-oct (C-07 y C-11; DT-03, DT-04 y DT-06), el diccionario de datos de ATC y el paquete aprobado de Control de acceso (PJ-05). — Revisado por: (pendiente)

Actualizado el 26-oct-2026 (v0.2) por Brayan Hurtado con IA (Claude) a partir de las revisiones del Líder Técnico y de coherencia del 26-oct (hallazgos 5, 16, 17, 18 y 31 de la técnica). — Revisado por: (pendiente)

Actualizado el 26-oct-2026 (v0.3) por Brayan Hurtado con IA (Claude) a partir de las decisiones del equipo del 26-oct (ED-01, ED-04, ED-05, ED-11, ED-15, ED-16, ED-23 y ED-26 de `analisis/decisiones.md` v0.7). — Revisado por: (pendiente)

Actualizado el 26-oct-2026 (v0.4) por Brayan Hurtado con IA (Claude): P-025 decidida por el equipo (`analisis/decisiones.md` v0.8); tablas que no se crean en la Etapa 1. — Revisado por: (pendiente)
