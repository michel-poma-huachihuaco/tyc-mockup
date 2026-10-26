---
id: "SPEC-DATOS-REGISTRO-TABLAS"
tipo: "spec"
titulo: "Registro de tablas de ATC en la base única: qué crea, qué lee y qué escribe en otro dominio"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.1"
owner: "Brayan Hurtado (Dev 1)"
aprobadores: [tech_lead, data_chief]
fecha: "2026-10-26"
relacionados: [ADR-001, ADR-003, ADR-005, ADR-008, ADR-009, ADR-013, SPEC-DATOS-DICCIONARIO, SPEC-DATOS-ACTA-F4, SPEC-ARQ-MIGRACION]
tags: [datos, base-unica, gobierno-de-datos, f4, g3]
---

# Registro de tablas de ATC (C-11)

Responde a la colisión **C-11** de la revisión del Líder Técnico (22-oct-2026): «Publicar el registro de tablas de ATC: qué crea (`SVC_*` y sus catálogos), qué solo lee y qué escribe en otro dominio. Los maestros compartidos tienen un solo dueño de migración, acordado con Gobierno de Datos». Aplica **DT-06** (las tablas de ATC van en la base única del modelo v7, en Azure Database for PostgreSQL, con FK físicas, y `PARTY` es la fuente viva del cliente) y **DT-03** (ATC no guarda usuarios, roles ni permisos).

**Es propuesta.** La designación del dueño de dato y del dueño de migración de cada tabla la hace Gobierno de Datos en la puerta F4 (acta `acta-validacion-arquitectura-datos.md`), como hizo PJ-05 con sus tablas ajenas. Lo que falta acordar está en P-043 de `analisis/decisiones.md`.

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

Son las 13 tablas del fragmento 10 SERVICE del v7. **No están en la lista de lo que crea Control de acceso** (sección 1), así que las crea ATC con sus migraciones Flyway, en la base única, con FK físicas (DT-06). Esto cierra el «por confirmar» de ADR-001 sobre si ya existían. Módulos según ADR-001.

«Datos personales» es la **propuesta de clasificación para H-02** del acta F4: el v7 declara 0 tablas DAC en SERVICE, y la confirma Gobierno de Datos. «Dueño de dato» es propuesta; lo designa Gobierno de Datos en la puerta F4.

| Tabla | Clase | Módulo que la migra | Firmada (RNF-AUD-004) | Datos personales (propuesta H-02) | Dueño de dato (propuesta) |
|---|---|---|---|---|---|
| `MAE_AREA` | Catálogo: **cola de atención** del ticket, no estructura organizacional (C-07, sección 7) | `tickets` | — | No | Gerencia ATC |
| `MAE_TICKET_TYPE` | Catálogo | `tickets` | — | No | Gerencia ATC |
| `MAE_TICKET_PRIORITY` | Catálogo | `tickets` | — | No | Gerencia ATC |
| `MAE_SLA_POLICY` | Catálogo | `sla` | — | No | Gerencia ATC |
| `SVC_TICKET` | Entidad | `tickets` | — (el Excel trae su receta de hash) | Solo referencias (`PartyID`, `ContractID`, `UnitID`): no copia el dato del cliente (DT-06, ADR-003) | Gerencia ATC |
| `SVC_TICKET_STATUS_LOG` | Bitácora | `tickets` | Sí | No: `Notes_*` sin datos personales (RN-SVC-012) | Gerencia ATC |
| `SVC_TICKET_ASSIGNMENT_LOG` | Bitácora | `tickets` | Sí | No (RN-SVC-012) | Gerencia ATC |
| `SVC_TICKET_INTERACTION` | Entidad | `tickets` | — | **Sí, puede tener:** texto libre y adjuntos. Se propone tratarla como dato personal (Ley 29733): acceso por rol (RNF-SEC-008) | Gerencia ATC |
| `SVC_SLA_BREACH_ALERT` | Entidad | `sla` | Sí | No | Gerencia ATC |
| `SVC_COMPLAINT_BOOK_ENTRY` | Entidad (1:1 con el ticket) | `complaintbook` | — (la carta entra al hash, RN-SVC-010) | **Sí:** la hoja del Libro de Reclamaciones lleva datos del consumidor y la narrativa del reclamo. Es la excepción a ADR-003 que valida Legal | Gerencia ATC con Gerencia Legal |
| `SVC_COMPLAINT_BOOK_ENTRY_STATUS_LOG` | Bitácora | `complaintbook` | Sí | No (RN-SVC-012) | Gerencia ATC con Gerencia Legal |
| `SVC_COMPLAINT_APPEAL` | Entidad | `complaintbook` | — | Puede tener: resumen de la resolución | Gerencia ATC con Gerencia Legal |
| `SVC_COMPLAINT_APPEAL_STATUS_LOG` | Bitácora | `complaintbook` | Sí | No (RN-SVC-012) | Gerencia ATC con Gerencia Legal |

Las columnas que guardan a un colaborador (`CreatedByPartyID`, `CurrentOwnerPartyID`, `ChangedByPartyID`, `AssignedToPartyID`, `AssignedByPartyID`, `AgentPartyID`, `AlertedPartyID`, `ResponderPartyID` y `ClosedByPartyID`) son FK a `PARTY`. El token de Control de acceso trae `user_account_id` y no `PartyID`: de dónde sale la Party del colaborador y la del cliente de Mi Portal es la pregunta **P-033**.

## 3 Cambios al v7 propuestos (los crearía ATC si Gobierno de Datos los aprueba)

El v7 no los trae. Ninguno está aprobado. Si Gobierno de Datos los acepta, son tablas o columnas del fragmento SERVICE y las migra ATC; si no, la historia que los usa queda sin dónde guardar sus datos (H-03 del acta).

| Cambio al v7 | Para qué | Historias o ADR | Estado |
|---|---|---|---|
| `SVC_OUTBOX_EVENT` (propia, fragmento 10) | Outbox transaccional del servicio (DT-02). ADR-013 la elige porque `INTG_OUTBOX_EVENT` del v7 es para envíos a sistemas externos y no sirve como outbox de ATC; es el cambio al v7 que se presenta | ADR-013; P-031 | Propuesta |
| `SVC_AI_SUGGESTION_LOG` (ENT-SVC-016) | Registro de cada sugerencia de IA y su decisión, sin datos personales | ADR-007; HU-048; P-031 | Propuesta |
| `SVC_WORKFLOW_DEFINITION` (ENT-SVC-014) y `SVC_WORKFLOW_ACTIVITY`, con su versión | Flujo por tipo, subtipo y área, versionado; el ticket congela su versión (RN-SVC-045) | ADR-008; HU-043; P-016 | Propuesta |
| `MAE_TICKET_SUBTYPE` | Subtipo del ticket | ADR-008; HU-043, HU-064; P-016 | Propuesta |
| `SVC_TICKET_SLA_PAUSE` y el parámetro de cierre automático | Pausas del SLA y días de espera antes del cierre automático | ADR-008; HU-066, HU-056; P-016 | Propuesta |
| Columnas nuevas en `SVC_TICKET`: `SubtypeID`, `WorkflowID`, rayo y motivo, `ConflictFlag`, eje actual y vinculación pendiente | Lo que el PLT-04 §6.5 dibuja y el v7 no tiene | HU-043, HU-045, HU-026, HU-051, HU-064 | Propuesta |
| Columnas nuevas en `MAE_AREA`: posición en la sede y referencia al área organizacional | Visor 3D (HU-067) y correspondencia de C-07 (sección 7) | HU-067; P-036 | Propuesta |
| `SVC_KNOWLEDGE_ARTICLE` (ENT-SVC-015) | Guías de solución por tipo, con versiones | HU-047 | Propuesta |
| `SVC_SEARCH_INDEX` (ENT-SVC-017) | Índice de búsqueda; es de lectura (ADR-012) y puede vivir fuera de PostgreSQL | HU-049, HU-053 | Propuesta |
| `SVC_SIMPLE_FORM_DEFINITION` (ENT-SVC-019) y `SVC_EVENT_BUS_BOOKING` (ENT-SVC-020) | Formularios simples y reserva de bus. Candidatas del v7: `EVT_ATTENDEE` y `EVT_TRANSPORT` | HU-059, HU-060 | Propuesta |
| `SVC_CONTRACT_DEFAULT_ALERT` (ENT-SVC-018) | Caso de resolución por morosidad y constancia de alertas. Candidata del v7: `PAY_COLLECTION_ACTIVITY` | HU-056 a HU-058 | Propuesta |
| Casos sensibles: `SENSITIVE_CASE`, `MAE_INTAKE_LINE`, `RISK_ASSESSMENT`, `ESCALATION_LOG`, `CASE_CLOSURE`, vínculo entre casos | Mesa SGD (esbozos «por modelar» del PLT-04 §6.5) | HU-020 a HU-025 | Propuesta |
| `HANDOFF_PACKAGE`, `EMOTIONAL_NOTE` y el caso sensible del evento | Handoff a Eje 3, nota de estado emocional y EntregaFest | HU-027, HU-028, HU-037 a HU-039 | Propuesta |
| `shedlock` | Tabla técnica de ShedLock para que un job corra en una sola réplica (DT-08) | ADR-005; P-031 | Propuesta |

## 4 Tablas que ATC solo lee (no las crea ni las migra)

| Tabla | Fragmento | Quién la crea hoy | Para qué la usa ATC |
|---|---|---|---|
| `PARTY` | 3 PARTY | Control de acceso (E1) | FK física de `SVC_TICKET` y de las bitácoras (DT-06). ATC no lee directamente los datos de la persona: el nombre, el documento y el contacto llegan enmascarados del dueño del fragmento 3 (D-119; P-037) |
| `ORG_COMPANY`, `MAE_BUSINESS_LINE` | 2 COMPANY | Control de acceso (E1) | Empresa y línea de negocio del ticket (RN-SVC-005) |
| `MAE_GENERIC_LIST`, `MAE_GENERIC_LIST_VALUE` | 0 REFERENCE | Control de acceso (E1) | Estados, tipos y motivos de SERVICE (pares `<Campo>ListID` + `<Campo>ID`). ATC además siembra sus listas (sección 5) |
| `MAE_CHANNEL`, `MAE_CURRENCY` | 0 REFERENCE | Control de acceso (E1) | Canal del ticket, de la interacción y de la alerta; moneda del reclamo |
| `ORG_COMPANY_ADDRESS`, `ORG_PRODUCT` | 2 COMPANY | **Nadie todavía** | FK física de `SVC_TICKET` y del asiento del Libro (establecimiento y producto). Dueño de migración: P-043 |
| `CONTRACT`, `AST_UNIT` | CONTRACT | **Nadie todavía** | FK física de `SVC_TICKET` (contrato y lote). Dueño de migración y de la carga: P-043 (DEP-07, DEP-01) |
| `MAE_TIME`, `MAE_HOLIDAY` | 0 REFERENCE | **Nadie todavía** | Días hábiles y feriados del SLA y del plazo legal (ADR-005). Los da el Equipo Datos (DEP-04); dueño de migración: P-043 |
| `CONTRACT_UNIT_HANDOVER`, `MAE_WARRANTY_COVERAGE_PERIOD` | CONTRACT | **Nadie todavía** | Acta de entrega y cobertura de la garantía (HU-033, HU-034; DEP-07). Dueño de migración: P-043 |

**Precondición de la primera migración de ATC.** Con FK físicas, la migración de `SVC_TICKET` (tarea HU-ATC-001-T02) solo corre si ya existen `ORG_COMPANY`, `ORG_COMPANY_ADDRESS`, `PARTY`, `CONTRACT`, `AST_UNIT`, `MAE_CHANNEL`, `MAE_BUSINESS_LINE`, `ORG_PRODUCT`, `MAE_GENERIC_LIST` y `MAE_GENERIC_LIST_VALUE`. En las pruebas locales, el script de prueba crea esas tablas tal como están en el v7, solo en el contenedor de pruebas; no es una migración de ATC ni llega a DEV.

## 5 Lo que ATC escribe en tablas de otro dominio

Son filas, no estructura. ATC no cambia el modelo de esas tablas (sección 1).

| Tabla | Fragmento | Qué escribe ATC | Quién crea la tabla | Estado |
|---|---|---|---|---|
| `MAE_GENERIC_LIST`, `MAE_GENERIC_LIST_VALUE` | 0 REFERENCE | Sus listas: `SVC_TICKET_STATUS`, `SVC_ASSIGNMENT_REASON`, `SVC_SLA_BREACH_TYPE`, `SVC_TICKET_INTERACTION_TYPE`, `SVC_COMPLAINT_APPEAL_STATUS`, la base de tiempo, el tipo de reclamo, la instancia de apelación y el estado del asiento (diccionario, «Listas de valores»). Como semilla versionada con `GenericListID` fijos, igual que Control de acceso siembra las suyas | Control de acceso | Rango de `GenericListID` y quién corre la semilla: P-043 |
| `MAE_CHANNEL` | 0 REFERENCE | El valor `MI_PORTAL` (HU-064) | Control de acceso | P-043 |
| `GOV_INTEGRITY_EXCEPTION` | 8 GOVERNANCE | Excepciones `ORPHAN_REFERENCE` (HU-015) y `HASH_MISMATCH` (Q-003 del acta) | Control de acceso (E1) | Los valores de su lista los siembra Control de acceso; que existan esos dos: P-043 |
| `GOV_DOCUMENT_REPOSITORY` | 8 GOVERNANCE | Fila espejo de cada documento probatorio, con checksum y versión (ADR-006) | **Nadie en E1** (PJ-05 la deja para después) | Dueño de migración: P-043 |
| `SVY_SURVEY_RESPONSE` | PERFORMANCE-MEASUREMENT | La encuesta del ticket cerrado, por puntero polimórfico (`SubjectEntityName = 'SVC_TICKET'`, RNF-INT-004) | **Nadie todavía** (DEP-10) | Dueño de migración: P-043 |
| `CONTRACT_WARRANTY_CLAIM` | CONTRACT | El reclamo de garantía (HU-033 a HU-036) | **Nadie todavía** (DEP-07) | Quién escribe: P-014; dueño de migración: P-043 |
| `EVT_ATTENDEE`, `EVT_TRANSPORT` | EVENT | Reserva de cupo del Entrega Fest, si se eligen en lugar de `SVC_EVENT_BUS_BOOKING` | **Nadie todavía** | Candidatas; P-043 |

**ATC no escribe** en `PARTY` ni en ninguna tabla de personas: ni la Party no verificada del interesado (R29, A26; P-037). Tampoco en `IDN_SYSTEM_TASK` ni en otra tabla del fragmento 01.

## 6 Dueño único de migración de los maestros compartidos (propuesta, a acordar con Gobierno de Datos)

C-11 pide un solo dueño de migración por maestro compartido. La propuesta sigue la regla de PJ-05: quien crea la tabla primero la crea tal como está en el v7, es su custodio y su migración no se reescribe; quien llega después no la recrea (sección 1). Lo decide Gobierno de Datos (Enrique Albán, Data Chief) en la puerta F4, con el Líder Técnico (**P-043**).

| Maestro o tabla compartida | Dueño de migración hoy | Propuesta | Por qué |
|---|---|---|---|
| `MAE_GENERIC_LIST`, `MAE_GENERIC_LIST_VALUE`, `MAE_CHANNEL`, `MAE_CURRENCY` | Control de acceso | **Control de acceso.** ATC entrega sus valores como semilla versionada y no toca la estructura | Ya los crea en E1 (PJ-05 `analisis/decisiones.md:128`) |
| `PARTY` | Control de acceso | **Control de acceso** (y el dueño del fragmento 3 cuando llegue) | Ya la crea en E1 (`:129`); ATC no la escribe |
| `ORG_COMPANY`, `MAE_BUSINESS_LINE` | Control de acceso | **Control de acceso** | Ya los crea en E1 (`:130`) |
| `GOV_INTEGRITY_EXCEPTION` | Control de acceso | **Control de acceso** | Ya la crea en E1 (`:132`) |
| `ORG_COMPANY_ADDRESS`, `ORG_PRODUCT` | Nadie | **ATC**, tal como están en el v7, como custodio hasta que llegue el dueño del fragmento 2. Alternativa: el dueño del fragmento 2 | Las exige la FK física de `SVC_TICKET` (DT-06) |
| `CONTRACT`, `AST_UNIT`, `CONTRACT_UNIT_HANDOVER`, `MAE_WARRANTY_COVERAGE_PERIOD`, `CONTRACT_WARRANTY_CLAIM` | Nadie | **El dueño del fragmento CONTRACT** (Equipo Contratos, DEP-07), que también las carga. Si no llega a tiempo, ATC como custodio | Sus datos vienen de Contratos; ATC solo los referencia o registra el reclamo |
| `MAE_TIME`, `MAE_HOLIDAY` | Nadie | **Equipo Datos** (DEP-04), que da el calendario | El PLT-01 ya le asigna la DEP-04 |
| `GOV_DOCUMENT_REPOSITORY` | Nadie en E1 | **ATC**, tal como está en el v7, como custodio | ATC es el primero que la necesita en la Etapa 1 (ADR-006) |
| `SVY_SURVEY_RESPONSE` | Nadie | **El dueño del KPI Engine** (Equipo Datos / BI, DEP-10). Alternativa: ATC como custodio | La lee el KPI Engine |
| `EVT_ATTENDEE`, `EVT_TRANSPORT` (si se eligen) | Nadie | Por decidir con el dueño del fragmento EVENT | Candidatas |

Riesgo: igual que en PJ-05 (su R-03), ATC carga con tablas de otros dominios hasta que lleguen sus dueños. Cada una que ATC cree pasa por la puerta F4.

## 7 `MAE_AREA` y la estructura organizacional (C-07)

- `MAE_AREA` queda **solo como cola de atención** del ticket en el dominio SERVICE: la usan `SVC_TICKET.CurrentAreaID` y `SVC_TICKET_ASSIGNMENT_LOG.AreaID`. No guarda líderes, supervisores ni personas.
- El líder o supervisor de un área **no se guarda en ATC**: llega como rol en el token o se consulta a Control de acceso. Hoy no hay API con token de servicio para eso (P-035).
- **La correspondencia `MAE_AREA` ↔ estructura organizacional queda pendiente.** La revisión del Líder Técnico la plantea contra `NEX_COMPANY_AREA`, pero esa tabla **no existe** en PJ-05: la crea su dueño de modelo (D-74) y `NEX_USER_COMPANY_ROLE.CompanyAreaID` se crea sin FK hasta entonces (D-193).
- **Diseño posible**, como cambio al v7 (sección 3): una columna de referencia al área organizacional en `MAE_AREA`, opcional y sin FK hasta que exista la tabla, como hizo PJ-05 con `CompanyAreaID`. Varias colas pueden apuntar a una misma área organizacional.
- **Pregunta P-036**, al Líder Técnico (decide), a Sony Montoya (confirma) y a Gobierno de Datos (dueño de la tabla): quién es el dueño de las áreas y de las jefaturas, cuándo existe la tabla y cómo sabe ATC quién lidera un área.

| Cola en `MAE_AREA` (Excel) | Área organizacional | Estado |
|---|---|---|
| `ATC`, `COBRANZA`, `LEGAL`, `POSTVENTA`, `TI`, `ADMINISTRACION` | Por definir | La tabla de áreas organizacionales no existe (P-036) |

## 8 Lo que ATC no crea, no migra ni copia (C-11)

- Las 24 tablas del fragmento 01 (identidad y acceso), entre ellas `IDN_USER_ACCOUNT`, `IDN_USER_ROLE`, `IDN_USER_SESSION` e `IDN_SYSTEM_TASK`, y los catálogos `MAE_SYSTEM_ROLE` y `MAE_MENU_OPTION`: son de Control de acceso. ATC no las lee: quién es el usuario y sus roles salen del token (DT-03, DT-05).
- `NEX_USER_COMPANY_ROLE` (roles por empresa): la administra Control de acceso.
- Tablas de sesión o de códigos de un solo uso: no hay `PORTAL_SESSION` ni códigos propios (DT-04).
- Maestro local de usuarios, roles, áreas o líderes, y su carga desde RR. HH.: no existe (DT-03, C-01).
- La tabla de áreas organizacionales: es de su dueño de modelo (D-74).
- Copias del dato del cliente: `PARTY` es la fuente viva (DT-06).

## 9 Dónde se usa este registro

- `arquitectura/migracion-y-reversion.md` §2: qué migra ATC y en qué orden.
- `datos/acta-validacion-arquitectura-datos.md`: evidencia de H-01 (dueños), H-02 (datos personales), H-03 (cambios al v7), H-08 (base única) y H-12.
- `datos/diccionario.md`: equivalencias con el v7.

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-26 | Brayan Hurtado, con IA | Versión inicial (C-11): tablas que crea ATC, cambios al v7, tablas que solo lee, filas que escribe en otro dominio, propuesta de dueño único de migración, `MAE_AREA` como cola (C-07) y lo que ATC no crea. Citas a la copia sellada de PJ-05 |

Generado por IA: borrador completo (Claude, 26-oct-2026) a partir de la revisión del Líder Técnico del 22-oct (C-07 y C-11; DT-03, DT-04 y DT-06), el diccionario de datos de ATC y el paquete aprobado de Control de acceso (PJ-05). — Revisado por: (pendiente)
