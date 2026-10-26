---
id: "SPEC-DATOS-DICCIONARIO"
tipo: "spec"
titulo: "Diccionario de datos de Aybar Atiende"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.2"
owner: "Jesús Chávez Elías"
aprobadores: [tech_lead]
fecha: "2026-10-26"
relacionados: [ADR-001, ADR-002, ADR-003, ADR-006, ADR-012, ADR-013]
tags: [datos, diccionario, g3]
---

# Diccionario de datos

Va en `docs/datos/`. **Revisión del 20-oct-2026: la estructura se rehízo desde el Modelo de Datos Corporativo v7** (AybarCorp SAC, CDO y Transformación Digital, 8-sep-2026), fragmento 10 SERVICE, y ya no desde el PLT-05. Del v7 se toman las entidades, sus claves (PK y FK) y sus relaciones. **Los tipos, largos y la obligatoriedad quedan pendientes**: el v7 en diapositivas solo dibuja PK y FK; el detalle de los atributos está en los archivos mermaid y en el Diccionario de atributos de Drive (Anexo C del v7). Todas las claves son `int` (Anexo A del v7).

**Bloqueantes de la puerta F4** (`.agents/references/gobierno-datos.md`): entidades sin dueño de dato, clasificación de datos personales sin confirmar y atributos sin tipo. Desde el 26-oct, el dueño de dato y la clasificación de datos personales de cada tabla tienen una **propuesta** en `registro-de-tablas.md` §2 (H-01 y H-02 del acta), que confirma el Data Chief al firmar el acta. Los tipos siguen pendientes (H-04, P-015).

## Dónde viven las tablas y qué no tiene ATC (DT-06, C-11, C-07)

- **Base única del modelo v7** (DT-06, Jose Jara, 22-oct-2026): las tablas `SVC_*` y `MAE_*` del fragmento 10 SERVICE van en la base única, en **Azure Database for PostgreSQL**, con **FK físicas**. ATC crea las 13 tablas de SERVICE; los maestros compartidos que ya crea Control de acceso (`MAE_GENERIC_LIST`, `MAE_GENERIC_LIST_VALUE`, `MAE_CHANNEL`, `MAE_CURRENCY`, `PARTY`, `ORG_COMPANY`, `MAE_BUSINESS_LINE`, `GOV_INTEGRITY_EXCEPTION`) no los recrea. El detalle, tabla por tabla, está en `registro-de-tablas.md`.
- **`PARTY` es la fuente viva del cliente, no una copia.** ATC guarda la referencia (`PartyID`) y no copia nombre, documento ni contacto. El dato de la persona no se lee de las tablas de personas: lo entrega enmascarado el dueño del fragmento 3 (D-119 de PJ-05; P-037). ATC no crea `PARTY`, tampoco la del interesado (P-037).
- **Sin tablas de identidad, roles, permisos ni sesiones** (C-11): no hay `PORTAL_SESSION`, ni maestro local de usuarios, roles, áreas o líderes, ni tablas de códigos de un solo uso. Quién es el usuario y sus roles salen del token de Control de acceso (DT-03, DT-04, DT-05).
- **`MAE_AREA` es solo la cola de atención del ticket** (C-07): no es la estructura organizacional ni guarda líderes. Su correspondencia con el área organizacional está pendiente (P-036; `registro-de-tablas.md` §7).
- **Colaboradores en las bitácoras.** Las columnas `*PartyID` que guardan a un colaborador (`CreatedByPartyID`, `CurrentOwnerPartyID`, `ChangedByPartyID`, `AssignedToPartyID`, `AssignedByPartyID`, `AgentPartyID`, `AlertedPartyID`, `ResponderPartyID`, `ClosedByPartyID`) son FK a `PARTY`. El token trae `user_account_id` y no `PartyID`: de dónde sale la Party es la pregunta P-033.
- **Cambios al v7 propuestos.** Lo que el v7 no trae y ATC necesita (outbox, `SVC_AI_SUGGESTION_LOG`, flujo, subtipo y versión, pausas del SLA, `shedlock` y los demás) se presenta a Gobierno de Datos como **cambio al v7 propuesto**, con su historia y su ADR (`registro-de-tablas.md` §3).

## Resumen del fragmento SERVICE (v7)

13 entidades (4 catálogos, 4 bitácoras de estado y asignación, 5 entidades), 196 atributos (77 columnas de clave y 119 no clave), 61 relaciones, 4 entidades firmadas con `IntegrityHash`, 0 tablas DAC. Se apoya en REFERENCE (25), PARTY (12), COMPANY (6) y CONTRACT (2).

**Lo que ya fija el Excel del PO (revisión del 21-oct-2026).** El Excel `ATC_requerimientos (3).xlsx` (hojas 02_RF_Micro, 03_RNF y 05_Catalogos) da el ID de cada entidad, el nombre de varias columnas no clave, los códigos de seis listas y las bitácoras firmadas. RNF-AUD-004 pide **5 bitácoras append-only firmadas** (estado, asignación, libro, apelación y alertas), con `LastChangeLogFile` (diff en el almacén de evidencia (el Excel dice S3; ADR-006)) en toda entidad; el v7 en diapositivas declara 4 firmadas en SERVICE y la diferencia se concilia con Gobierno de Datos. El Excel también trae la receta v2 del `IntegrityHash` con campos del ticket (`CompanyCode|TicketNumber|PartyID|TicketTypeCode|PriorityCode|SLAPolicyCode|TicketStatusCode|OpenedDateTime|FirstResponseDueDateTime|ResolutionDueDateTime|ReopenedResolutionDueDateTime|FirstRespondedDateTime|FirstResolvedDateTime|ReopenCount`) y mete la carta del asiento en el hash (RN-SVC-010).

| Entidad | Clase | Descripción (v7) | Atributos (clave + no clave) | ID en el Excel | Firmada (RNF-AUD-004) | Historias | Dueño de dato |
|---|---|---|---|---|---|---|---|
| `MAE_AREA` | Catálogo | Áreas internas: ATC, Cobranza, Legal, Postventa, TI, Administración (códigos del Excel: ATC, COBRANZA, LEGAL, POSTVENTA, TI, ADMINISTRACION). En ATC es solo la **cola de atención** del ticket; no guarda líderes (C-07). | 8 (1 + 7) | ENT-SVC-007 | — | HU-007 | Gerencia ATC (propuesta) |
| `MAE_TICKET_TYPE` | Catálogo | Tipo de ticket: solicitud, consulta, visita técnica, queja y reclamo; la marca `RequiresComplaintBook` dice cuáles exigen asiento en el Libro (Excel). | 9 (1 + 8) | ENT-SVC-005 | — | HU-001 | Gerencia ATC (propuesta) |
| `MAE_TICKET_PRIORITY` | Catálogo | Prioridad: baja, media, alta, urgente (códigos del Excel: LOW, MEDIUM, HIGH, URGENT). | 8 (1 + 7) | ENT-SVC-006 | — | HU-001 | Gerencia ATC (propuesta) |
| `MAE_SLA_POLICY` | Catálogo | Tiempo máximo de primera respuesta y resolución por tipo y prioridad. La base de tiempo es un valor de lista (`TimeBasis`). | 15 (5 + 10) | ENT-SVC-008 | — | HU-003 | Gerencia ATC (propuesta) |
| `SVC_TICKET` | Entidad | Ticket de atención: solicitud o reclamo. El SLA se congela al abrirlo (`SLAPolicyID`). | 35 (17 + 18) | ENT-SVC-001 | — (el Excel trae su receta de hash) | HU-001, 002, 004 | Gerencia ATC (propuesta) |
| `SVC_TICKET_STATUS_LOG` | Bitácora | Historial de cambios de estado del ticket (una fila por cambio). | 10 (5 + 5) | ENT-SVC-002 | Sí | HU-004 | Gerencia ATC (propuesta) |
| `SVC_TICKET_ASSIGNMENT_LOG` | Bitácora | Historial auditable de cada derivación entre áreas. | 12 (7 + 5) | ENT-SVC-003 | Sí | HU-007, HU-008 | Gerencia ATC (propuesta) |
| `SVC_TICKET_INTERACTION` | Entidad | Cada interacción dentro de un ticket. | 14 (6 + 8) | ENT-SVC-004 | — | HU-005 | Gerencia ATC (propuesta) |
| `SVC_SLA_BREACH_ALERT` | Entidad | Alerta por incumplimiento de SLA. | 14 (7 + 7) | ENT-SVC-009 | Sí | HU-010 | Gerencia ATC (propuesta) |
| `SVC_COMPLAINT_BOOK_ENTRY` | Entidad | Extensión 1:1 del ticket que es queja o reclamo formal (Ley 29571). 15 días hábiles de respuesta, prorrogables una vez por 15 más (Ley 31435). | 33 (11 + 22) | ENT-SVC-010 | — (la carta entra al hash, RN-SVC-010) | HU-012 a 015 | Gerencia ATC con Gerencia Legal (propuesta) |
| `SVC_COMPLAINT_BOOK_ENTRY_STATUS_LOG` | Bitácora | Historial de cambios de estado del asiento del Libro de Reclamaciones. | 10 (5 + 5) | ENT-SVC-011 | Sí | HU-012 a 015 | Gerencia ATC con Gerencia Legal (propuesta) |
| `SVC_COMPLAINT_APPEAL` | Entidad | Segunda instancia interna o intervención de INDECOPI. | 18 (6 + 12) | ENT-SVC-012 | — | HU-016 | Gerencia ATC con Gerencia Legal (propuesta) |
| `SVC_COMPLAINT_APPEAL_STATUS_LOG` | Bitácora | Historial de cambios de estado de la apelación. | 10 (5 + 5) | ENT-SVC-013 | Sí | HU-016 | Gerencia ATC con Gerencia Legal (propuesta) |

## Claves y relaciones por entidad

Los nombres de columna son los del Anexo A del v7. Convención: PK `<Entidad>ID` y FK con el mismo nombre que la PK a la que apunta; los campos de dominio cerrado van en dos columnas, `<Campo>ListID` (contra `MAE_GENERIC_LIST`) y `<Campo>ID` (contra `MAE_GENERIC_LIST_VALUE`).

### `MAE_AREA`

Áreas internas: ATC, Cobranza, Legal, Postventa, TI, Administración. En ATC es la **cola de atención** a la que va el ticket (`SVC_TICKET.CurrentAreaID`, `SVC_TICKET_ASSIGNMENT_LOG.AreaID`); no es la estructura organizacional y no guarda líderes ni personas (C-07). El líder de un área se consulta a Control de acceso (P-035, P-036).

| Columna | Rol | Referencia | Tipo |
|---|---|---|---|
| `AreaID` | PK | — | `int` |
| *7 atributos no clave* | — | — | **pendiente** |

### `MAE_TICKET_TYPE`

Tipo de ticket: solicitud, consulta, visita técnica, queja y reclamo (ENT-SVC-005 del Excel).

| Columna | Rol | Referencia | Tipo |
|---|---|---|---|
| `TicketTypeID` | PK | — | `int` |
| *8 atributos no clave*; el Excel nombra `RequiresComplaintBook`, que tipifica y no decide: la calificación legal la da la fila del asiento (RN-SVC-011) | — | — | **pendiente** |

### `MAE_TICKET_PRIORITY`

Prioridad: baja, media, alta, urgente.

| Columna | Rol | Referencia | Tipo |
|---|---|---|---|
| `PriorityID` | PK | — | `int` |
| *7 atributos no clave* | — | — | **pendiente** |

### `MAE_SLA_POLICY`

Tiempo máximo de primera respuesta y resolución por tipo y prioridad. La base de tiempo es un valor de lista (`TimeBasis`).

| Columna | Rol | Referencia | Tipo |
|---|---|---|---|
| `SLAPolicyID` | PK | — | `int` |
| `TicketTypeID` | FK | `MAE_TICKET_TYPE` | `int` |
| `PriorityID` | FK | `MAE_TICKET_PRIORITY` | `int` |
| `TimeBasisListID` | FK | `MAE_GENERIC_LIST` | `int` |
| `TimeBasisID` | FK | `MAE_GENERIC_LIST_VALUE` | `int` |
| *10 atributos no clave*; el Excel nombra `FirstResponseMinutes` y `ResolutionMinutes`, que se leen según `TimeBasisID` (RNF-REN-003). La política genérica es la fila con `PriorityID` vacío y hay como máximo una genérica activa por tipo (RN-SVC-001) | — | — | **pendiente** |

### `SVC_TICKET`

Ticket de atención: solicitud o reclamo. El SLA se congela al abrirlo (`SLAPolicyID`).

| Columna | Rol | Referencia | Tipo |
|---|---|---|---|
| `TicketID` | PK | — | `int` |
| `CompanyID` | FK | `ORG_COMPANY` | `int` |
| `CompanyAddressID` | FK | `ORG_COMPANY_ADDRESS` | `int` |
| `PartyID` | FK | `PARTY` | `int` |
| `ContractID` | FK | `CONTRACT` | `int` |
| `UnitID` | FK | `AST_UNIT` | `int` |
| `ChannelID` | FK | `MAE_CHANNEL` | `int` |
| `TicketTypeID` | FK | `MAE_TICKET_TYPE` | `int` |
| `BusinessLineID` | FK | `MAE_BUSINESS_LINE` | `int` |
| `ProductID` | FK | `ORG_PRODUCT` | `int` |
| `PriorityID` | FK | `MAE_TICKET_PRIORITY` | `int` |
| `SLAPolicyID` | FK | `MAE_SLA_POLICY` | `int` |
| `TicketStatusListID` | FK | `MAE_GENERIC_LIST` | `int` |
| `TicketStatusID` | FK | `MAE_GENERIC_LIST_VALUE` | `int` |
| `CreatedByPartyID` | FK | `PARTY` | `int` |
| `CurrentOwnerPartyID` | FK | `PARTY` | `int` |
| `CurrentAreaID` | FK | `MAE_AREA` | `int` |
| *18 atributos no clave*; el Excel y el PLT-04 nombran `TicketNumber` (único por `CompanyID`, RN-SVC-004), `OpenedDateTime`, `FirstResponseDueDateTime` y `ResolutionDueDateTime` (congelados al abrir, RN-SVC-002), `ReopenedResolutionDueDateTime` y `ReopenCount` (RN-SVC-007), `FirstRespondedDateTime`, `FirstResolvedDateTime`, `ResolvedDateTime`, `ClosedDateTime`, `IsActive`, `IntegrityHash` e `IntegrityHashVersion` (RNF-AUD-004) | — | — | **pendiente** |

### `SVC_TICKET_STATUS_LOG`

Historial de cambios de estado del ticket (una fila por cambio).

| Columna | Rol | Referencia | Tipo |
|---|---|---|---|
| `TicketStatusLogID` | PK | — | `int` |
| `TicketID` | FK | `SVC_TICKET` | `int` |
| `TicketStatusListID` | FK | `MAE_GENERIC_LIST` | `int` |
| `TicketStatusID` | FK | `MAE_GENERIC_LIST_VALUE` | `int` |
| `ChangedByPartyID` | FK | `PARTY` | `int` |
| *5 atributos no clave*; el Excel nombra `IntegrityHash` (bitácora firmada, RNF-AUD-004) y los campos `Notes_*`, sin datos personales (RN-SVC-012) | — | — | **pendiente** |

### `SVC_TICKET_ASSIGNMENT_LOG`

Historial auditable de cada derivación entre áreas.

| Columna | Rol | Referencia | Tipo |
|---|---|---|---|
| `TicketAssignmentLogID` | PK | — | `int` |
| `TicketID` | FK | `SVC_TICKET` | `int` |
| `AreaID` | FK | `MAE_AREA` | `int` |
| `AssignedToPartyID` | FK | `PARTY` | `int` |
| `AssignmentReasonListID` | FK | `MAE_GENERIC_LIST` | `int` |
| `AssignmentReasonID` | FK | `MAE_GENERIC_LIST_VALUE` | `int` |
| `AssignedByPartyID` | FK | `PARTY` | `int` |
| *5 atributos no clave*; el Excel nombra `IntegrityHash` (bitácora firmada, RNF-AUD-004) y los campos `Notes_*`, sin datos personales (RN-SVC-012). `AssignedToPartyID` puede ir vacío si solo se deriva al área (RF-SVC-007) | — | — | **pendiente** |

### `SVC_TICKET_INTERACTION`

Cada interacción dentro de un ticket.

| Columna | Rol | Referencia | Tipo |
|---|---|---|---|
| `TicketInteractionID` | PK | — | `int` |
| `TicketID` | FK | `SVC_TICKET` | `int` |
| `ChannelID` | FK | `MAE_CHANNEL` | `int` |
| `InteractionTypeListID` | FK | `MAE_GENERIC_LIST` | `int` |
| `InteractionTypeID` | FK | `MAE_GENERIC_LIST_VALUE` | `int` |
| `AgentPartyID` | FK | `PARTY` | `int` |
| *8 atributos no clave*; el Excel nombra `IsVisibleToCustomer` (nota interna o respuesta visible, RF-SVC-005) y la evidencia multimedia va en la interacción; el PLT-04 dibuja «Media», autor (cliente o gestor), duración y grabación de la llamada | — | — | **pendiente** |

### `SVC_SLA_BREACH_ALERT`

Alerta por incumplimiento de SLA.

| Columna | Rol | Referencia | Tipo |
|---|---|---|---|
| `SLABreachAlertID` | PK | — | `int` |
| `TicketID` | FK | `SVC_TICKET` | `int` |
| `SLAPolicyID` | FK | `MAE_SLA_POLICY` | `int` |
| `BreachTypeListID` | FK | `MAE_GENERIC_LIST` | `int` |
| `BreachTypeID` | FK | `MAE_GENERIC_LIST_VALUE` | `int` |
| `AlertedPartyID` | FK | `PARTY` | `int` |
| `ChannelID` | FK | `MAE_CHANNEL` | `int` |
| *7 atributos no clave*; el Excel nombra `EvaluatedDueDateTime` (NOT NULL, RF-SVC-010), `ReopenCycleNumber` con `UNIQUE (TicketID, BreachTypeID, ReopenCycleNumber)` (RN-SVC-008) e `IntegrityHash` (bitácora firmada, RNF-AUD-004) | — | — | **pendiente** |

### `SVC_COMPLAINT_BOOK_ENTRY`

Extensión 1:1 del ticket que es queja o reclamo formal (Ley 29571). 15 días hábiles de respuesta, prorrogables una vez por 15 más (Ley 31435).

| Columna | Rol | Referencia | Tipo |
|---|---|---|---|
| `TicketID` | PK, FK | `SVC_TICKET` | `int` |
| `CompanyID` | FK | `ORG_COMPANY` | `int` |
| `CompanyAddressID` | FK | `ORG_COMPANY_ADDRESS` | `int` |
| `ComplaintTypeListID` | FK | `MAE_GENERIC_LIST` | `int` |
| `ComplaintTypeID` | FK | `MAE_GENERIC_LIST_VALUE` | `int` |
| `CurrencyID` | FK | `MAE_CURRENCY` | `int` |
| `ExtensionCommunicationChannelID` | FK | `MAE_CHANNEL` | `int` |
| `ResponderPartyID` | FK | `PARTY` | `int` |
| `ClosedByPartyID` | FK | `PARTY` | `int` |
| `ComplaintStatusListID` | FK | `MAE_GENERIC_LIST` | `int` |
| `ComplaintStatusID` | FK | `MAE_GENERIC_LIST_VALUE` | `int` |
| *22 atributos no clave*; el Excel nombra `ComplaintRegistrationDate`, `LegalResponseDueDate`, `IsResponseExtended`, `ExtendedResponseDueDate` y `ExtensionCommunicatedDate` (con un CHECK que exige comunicar la prórroga antes del vencimiento original y prohíbe reescribirla, RF-SVC-013), `ClaimedAmount` (`CHECK ck_complaint_amount_currency` con `CurrencyID`, RF-SVC-012), `CompanyResponseDate`, `CompanyResponseDocumentPath` (carta en Azure Blob (el Excel dice S3; ADR-006) con espejo en `GOV_DOCUMENT_REPOSITORY`) y `CustomerNotifiedOfIndecopiRight` (RF-SVC-014); el PLT-04 llama `EntryNumber` al correlativo por establecimiento (RN-SVC-004) | — | — | **pendiente** |

### `SVC_COMPLAINT_BOOK_ENTRY_STATUS_LOG`

Historial de cambios de estado del asiento del Libro de Reclamaciones (ENT-SVC-011 del Excel).

| Columna | Rol | Referencia | Tipo |
|---|---|---|---|
| `ComplaintBookEntryStatusLogID` | PK | — | `int` |
| `TicketID` | FK | `SVC_COMPLAINT_BOOK_ENTRY` | `int` |
| `ComplaintStatusListID` | FK | `MAE_GENERIC_LIST` | `int` |
| `ComplaintStatusID` | FK | `MAE_GENERIC_LIST_VALUE` | `int` |
| `ChangedByPartyID` | FK | `PARTY` | `int` |
| *5 atributos no clave*; el Excel nombra `IntegrityHash` (bitácora firmada, RNF-AUD-004) y los campos `Notes_*`, sin datos personales (RN-SVC-012) | — | — | **pendiente** |

### `SVC_COMPLAINT_APPEAL`

Segunda instancia interna o intervención de INDECOPI.

| Columna | Rol | Referencia | Tipo |
|---|---|---|---|
| `ComplaintAppealID` | PK | — | `int` |
| `TicketID` | FK | `SVC_COMPLAINT_BOOK_ENTRY` | `int` |
| `AppealLevelListID` | FK | `MAE_GENERIC_LIST` | `int` |
| `AppealLevelID` | FK | `MAE_GENERIC_LIST_VALUE` | `int` |
| `AppealStatusListID` | FK | `MAE_GENERIC_LIST` | `int` |
| `AppealStatusID` | FK | `MAE_GENERIC_LIST_VALUE` | `int` |
| *12 atributos no clave*; el Excel nombra `IndecopiCaseNumber`, vacío salvo que la instancia sea INDECOPI (RF-SVC-016) | — | — | **pendiente** |

### `SVC_COMPLAINT_APPEAL_STATUS_LOG`

Historial de cambios de estado de la apelación (ENT-SVC-013 del Excel).

| Columna | Rol | Referencia | Tipo |
|---|---|---|---|
| `ComplaintAppealStatusLogID` | PK | — | `int` |
| `ComplaintAppealID` | FK | `SVC_COMPLAINT_APPEAL` | `int` |
| `AppealStatusListID` | FK | `MAE_GENERIC_LIST` | `int` |
| `AppealStatusID` | FK | `MAE_GENERIC_LIST_VALUE` | `int` |
| `ChangedByPartyID` | FK | `PARTY` | `int` |
| *5 atributos no clave*; el Excel nombra `IntegrityHash` (bitácora firmada, RNF-AUD-004) y los campos `Notes_*`, sin datos personales (RN-SVC-012) | — | — | **pendiente** |

En todas las tablas el v7 añade las columnas de auditoría `CreatedDate`, `UpdatedDate` y `LastChangeLogFile` (tipos pendientes; según RNF-AUD-004, `LastChangeLogFile` apunta al diff en el almacén de evidencia (el Excel dice S3; ADR-006)); las entidades firmadas suman `IntegrityHash` (HMAC-SHA256, llave en Azure Key Vault, encadenado por entidad; ADR-002). RNF-AUD-004 pide firmar las 5 bitácoras marcadas en el resumen.

## Entidades de otros fragmentos que SERVICE referencia

| Entidad | Fragmento | Descripción (v7) |
|---|---|---|
| `ORG_COMPANY` | COMPANY | Empresas del grupo (entidades legales internas), con jerarquía holding→subsidiaria→SPV. |
| `ORG_COMPANY_ADDRESS` | COMPANY | Direcciones de cada empresa del grupo, con el establecimiento fiscal ante SUNAT. |
| `ORG_PRODUCT` | COMPANY | Producto o servicio vendible por una empresa específica del grupo. |
| `MAE_BUSINESS_LINE` | COMPANY | Línea de negocio: inmobiliario, cemento, agua, energía. |
| `PARTY` | PARTY | Núcleo no sensible del actor (código, tipo, estado); casi toda tabla del modelo apunta aquí. |
| `CONTRACT` | CONTRACT | Contrato genérico multilínea de negocio, con deuda total cifrada. |
| `AST_UNIT` | CONTRACT | Lote o unidad vendible, con alícuota sobre áreas comunes. |
| `MAE_CHANNEL` | REFERENCE | Catálogo transversal de canal (llamada, WhatsApp, correo, presencial). |
| `MAE_CURRENCY` | REFERENCE | Monedas ISO 4217. |
| `MAE_GENERIC_LIST` | REFERENCE | «Tabla de tabla»: dominio de valores para estados y tipos simples. |
| `MAE_GENERIC_LIST_VALUE` | REFERENCE | Valores concretos de cada lista genérica (código, nombre, orden). |

## Qué pasó con las entidades del PLT-05 y del Excel

5 entidades del PLT-05 no tienen tabla en el v7 y 2 tienen candidata por confirmar. Las demás existen. **No se crean tablas fuera del v7 sin aprobar**: lo que no existe va como **cambio al v7 propuesto** a Gobierno de Datos (`registro-de-tablas.md` §3).

| Entidad (PLT-05 y Excel) | ID en el Excel | Equivalente en el v7 | Fragmento | Situación |
|---|---|---|---|---|
| `MAE_TICKET_TYPE` | ENT-SVC-005 | `MAE_TICKET_TYPE` | SERVICE | Existe |
| `MAE_TICKET_PRIORITY` | ENT-SVC-006 | `MAE_TICKET_PRIORITY` | SERVICE | Existe |
| `MAE_CHANNEL` | ENT-REF-001 | `MAE_CHANNEL` | REFERENCE | Existe en otro fragmento (se consume) |
| `MAE_AREA` | ENT-SVC-007 | `MAE_AREA` | SERVICE | Existe |
| `MAE_SLA_POLICY` | ENT-SVC-008 | `MAE_SLA_POLICY` | SERVICE | Existe |
| `MAE_TIME` | ENT-REF-002 | `MAE_TIME` | REFERENCE | Existe en otro fragmento (días hábiles; fuente única) |
| `MAE_HOLIDAY` | — (PLT-05 §3 y DEP-04) | `MAE_HOLIDAY` | REFERENCE | Existe en otro fragmento (feriados por ámbito) |
| `SVC_TICKET` | ENT-SVC-001 | `SVC_TICKET` | SERVICE | Existe |
| `SVC_TICKET_STATUS_LOG` | ENT-SVC-002 | `SVC_TICKET_STATUS_LOG` | SERVICE | Existe |
| `SVC_TICKET_ASSIGNMENT_LOG` | ENT-SVC-003 | `SVC_TICKET_ASSIGNMENT_LOG` | SERVICE | Existe |
| `SVC_TICKET_INTERACTION` | ENT-SVC-004 | `SVC_TICKET_INTERACTION` | SERVICE | Existe |
| `SVC_SLA_BREACH_ALERT` | ENT-SVC-009 | `SVC_SLA_BREACH_ALERT` | SERVICE | Existe |
| `SVC_COMPLAINT_BOOK_ENTRY` | ENT-SVC-010 | `SVC_COMPLAINT_BOOK_ENTRY` | SERVICE | Existe |
| `SVC_COMPLAINT_BOOK_ENTRY_STATUS_LOG` | ENT-SVC-011 | `SVC_COMPLAINT_BOOK_ENTRY_STATUS_LOG` | SERVICE | Existe |
| `SVC_COMPLAINT_APPEAL` (`COMPLAINT_APPEAL` en el PLT-05) | ENT-SVC-012 | `SVC_COMPLAINT_APPEAL` | SERVICE | Existe |
| `SVC_COMPLAINT_APPEAL_STATUS_LOG` | ENT-SVC-013 | `SVC_COMPLAINT_APPEAL_STATUS_LOG` | SERVICE | Existe |
| `GOV_INTEGRITY_EXCEPTION` | ENT-GOV-001 | `GOV_INTEGRITY_EXCEPTION` | GOVERNANCE | Existe en otro fragmento |
| `GOV_DOCUMENT_REPOSITORY` | ENT-GOV-004 | `GOV_DOCUMENT_REPOSITORY` | GOVERNANCE | Existe en otro fragmento (espejo de documentos probatorios con checksum y versión) |
| `SVY_SURVEY_RESPONSE` | ENT-SVY-001 | `SVY_SURVEY_RESPONSE` | PERFORMANCE-MEASUREMENT | Existe en otro fragmento |
| `SVC_WORKFLOW_DEFINITION` | ENT-SVC-014 | — | — | Sin equivalente en el v7: cambio al v7 propuesto (ADR-008) |
| `SVC_WORKFLOW_ACTIVITY` | — | — | — | Sin equivalente en el v7: cambio al v7 propuesto (actividades de cada versión del flujo, ADR-008) |
| `MAE_TICKET_SUBTYPE` | — | — | — | Sin equivalente en el v7: cambio al v7 propuesto (catálogo de subtipos por tipo, ADR-008) |
| `SVC_TICKET_SLA_PAUSE` | — | — | — | Sin equivalente en el v7: cambio al v7 propuesto (pausas del SLA, ADR-008) |
| `SVC_KNOWLEDGE_ARTICLE` | ENT-SVC-015 | — | — | Sin equivalente en el v7 (KNOWLEDGE-BASE trae legal, taxonomía y Horus, no guías de solución): cambio al v7 propuesto |
| `SVC_AI_SUGGESTION_LOG` | ENT-SVC-016 | — | — | Sin equivalente en el v7: cambio al v7 propuesto (ADR-007) |
| `SVC_SEARCH_INDEX` | ENT-SVC-017 | — | — | Sin equivalente en el v7: cambio al v7 propuesto (el índice es de lectura, ADR-012) |
| `SVC_CONTRACT_DEFAULT_ALERT` | ENT-SVC-018 | PAY_COLLECTION_ACTIVITY (candidata) | PAYMENT | Candidata por confirmar: es la bitácora de gestiones de cobranza (llamada, carta, visita); las alertas de morosidad no tienen tabla propia |
| `SVC_SIMPLE_FORM_DEFINITION` | ENT-SVC-019 | — | — | Sin equivalente en el v7: cambio al v7 propuesto |
| `SVC_EVENT_BUS_BOOKING` | ENT-SVC-020 | EVT_ATTENDEE + EVT_TRANSPORT (candidatas) | EVENT | Candidata por confirmar: asistentes y manifiesto de vehículo del Entrega Fest; la reserva de cupo no tiene tabla propia |
| `PORTAL_SESSION` | — (PLT-05 §3, «por modelar») | — | — | **Se retira** (DT-04, ADR-011): ATC no abre sesiones; `IDN_USER_SESSION` (IDENTITY-ACCESS) es de Control de acceso |
| `OUTBOX_EVENT` | — (no está en el PLT-05 ni en el Excel; lo pide el ADR-013) | `INTG_OUTBOX_EVENT` | INTEGRATION-HUB | Existe en otro fragmento (outbox genérico por intento de envío), pero nadie la crea todavía (dueño de migración: P-043). Se usa solo si cumple las condiciones del ADR-013; si no, tabla propia `SVC_OUTBOX_EVENT` como cambio al v7 propuesto |
| `shedlock` | — (DT-08, ADR-005) | — | — | Sin equivalente en el v7: tabla técnica de ShedLock, cambio al v7 propuesto (P-031) |

## Temas que el PLT-05 dejaba «por modelar» y dónde caen en el v7

| Tema | Historias | En el v7 |
|---|---|---|
| Casos sensibles y Mesa SGD (Código Único, cargos, matriz de riesgo, escalamiento, vinculación) | HU-020 a 025 | Sin equivalente en el v7 (no hay «SGD» ni «Código Único»; `IDN_SENSITIVE_ACCESS_*` es acceso a datos, no casos). El PLT-04 v1.3 §6.5 ya los esboza: ver «Esbozos del PO por modelar» |
| EntregaFest: contención en vivo | HU-037 a 039 | Fragmento EVENT (`EVT_EVENT`, `EVT_INVITATION`, `EVT_ATTENDEE`, `EVT_TRANSPORT`, `EVT_MEAL_ORDER`) |
| Sincronización con Legal | HU-040, HU-041 | Fragmento KNOWLEDGE-BASE (`LGL_LEGAL_CASE`, `LGL_LEGAL_CASE_DEADLINE`, `LGL_LEGAL_CASE_STATUS_LOG`) |
| Notificaciones al gestor | HU-055 | El correo sale por evento (ADR-013). `IDN_SYSTEM_TASK` es del fragmento 01 de Control de acceso y ATC no la escribe (C-11). La constancia del envío: candidata `NEX_NOTIFICATION_LOG` (fragmento 12, que nadie crea en E1; P-043) o cambio al v7 propuesto |
| Maestro de usuarios, roles, áreas y líderes (identidad, DEP-02) | ADR-009 | **Se elimina (DT-03):** la identidad la administra Control de acceso (fragmento IDENTITY-ACCESS: `IDN_USER_ACCOUNT`, `IDN_USER_ROLE`, `MAE_SYSTEM_ROLE`); ATC no crea tablas de identidad (C-11). El PO actualiza el ADR-09 y DEP-02 (P-027) |
| Garantías de postventa | HU-033 a 036 | Fragmento CONTRACT (`CONTRACT_WARRANTY_CLAIM`, `MAE_WARRANTY_COVERAGE_PERIOD`, `CONTRACT_UNIT_HANDOVER`) |
| Encuesta post-atención y Torre de Control | HU-019, HU-030 a 032 | Fragmento PERFORMANCE-MEASUREMENT (`SVY_SURVEY_CAMPAIGN`, `SVY_SURVEY_QUESTION`, `SVY_SURVEY_RESPONSE`, `KPI_SNAPSHOT`) |

## Qué cambia respecto del PLT-05 (para revisar con el arquitecto)

| Lo que fija el v7 | Lo que decía el PLT-05 o nuestros ADR | Consecuencia |
|---|---|---|
| Una sola instancia PostgreSQL, tablas con prefijo de fragmento (`SVC_`, `MAE_`) | ADR-001 propone un esquema por módulo (`tickets`, `sla`, `libro`…) | ADR-001 se revisa: el v7 no usa esquemas por módulo |
| Cada bitácora tiene PK propia (`TicketStatusLogID`…) y una fila por cambio | El PLT-05 dibuja `TicketID` como PK de las bitácoras | Se adopta la PK del v7 |
| Estados, tipos y motivos son valores de lista: pares `<Campo>ListID` + `<Campo>ID` contra `MAE_GENERIC_LIST_VALUE` | El PLT-05 y el ADR-002 hablan de un CHECK o catálogo de estados | Los 7 estados se dan de alta en la lista `SVC_TICKET_STATUS` con los códigos del Excel (RF-SVC-004); ver «Listas de valores que ya define el Excel» |
| `SVC_TICKET` trae `CompanyAddressID`, `ContractID`, `UnitID`, `ProductID`, `ChannelID`, `SLAPolicyID`, `CreatedByPartyID`, `CurrentOwnerPartyID` | El PLT-05 dibuja `OwnerPartyID` y no menciona contrato, unidad ni producto | El ticket queda ligado al contrato y a la unidad; la clave foránea `PartyID` → `PARTY` es una referencia a la fuente viva (DT-06, resuelto en lo técnico; el PO confirma, C-1) |
| El SLA se congela al abrir el ticket (`SLAPolicyID`) y la base de tiempo es un valor de lista | El PLT-05 hablaba de minutos en `MAE_SLA_POLICY` y de `FirstResponseDue`/`ResolutionDue` en el ticket | El Excel los pone en `SVC_TICKET`: `FirstResponseDueDateTime` y `ResolutionDueDateTime`, congelados al abrir (RN-SVC-002), y `ReopenedResolutionDueDateTime` al reabrir (RF-SVC-011); los minutos de la política son `FirstResponseMinutes` y `ResolutionMinutes` (RNF-REN-003). Tipos por confirmar con el v7 |
| El Libro de Reclamaciones y la apelación tienen bitácora de estados propia | El diagrama del PLT-05 no las dibuja, pero el Excel las tiene (ENT-SVC-011 y ENT-SVC-013) | El DEP-10 y el KPI Engine deberán conocerlas |
| `SVC_COMPLAINT_APPEAL` tiene PK propia, nivel de apelación (lista) y estado | El PLT-04 v1.3 (HU-016 §6.5) dibuja 1 a N por asiento | Se adopta 1 a N, que coincide con el esquema de claves del v7 |
| Moneda (`CurrencyID`), canal de la prórroga y quien responde/cierra son columnas del asiento | No figuraban en el PLT-05 | Alinear HU-012 a 015 |
| Auditoría estándar en todas las tablas: `CreatedDate`, `UpdatedDate`, `LastChangeLogFile`; `IntegrityHash` solo en las firmadas | El diagrama del PLT-05 dibuja el hash en dos bitácoras; el Excel pide 5 (RNF-AUD-004) | Firmadas según el Excel: estado, asignación, libro, apelación y alertas; se concilia con las 4 del v7 (C-3) |
| Nunca se renombra ni elimina una columna (se marca DEPRECADO) | La skill `aybar-modelo-a-flyway` genera migraciones libres | Las migraciones de ATC solo agregan; revisar el ADR-014 cuando se rehaga |

## Decisiones del mockup de la Etapa 1 frente al v7

Rama `feature/AYB-0001-propuesta-po-v1-3` de `tyc-mockup` (20-oct-2026). **Son propuesta del equipo, salvo lo que se marca como fijado por el PO; nada de esto está aprobado.**

| Decisión del mockup | En el v7 | Qué queda |
|---|---|---|
| Flujo por tipo + subtipo + área, con versiones (una nueva solo aplica a tickets nuevos), responsable, actividades en orden con SLA por actividad, SLA total = suma o la política si es menor, flujo por defecto del área y bitácora de publicaciones (HU-043) | Sin tabla: `SVC_WORKFLOW_DEFINITION` no existe en el v7 | Propuesta de tablas a G3 y Gobierno de Datos: definición del flujo, actividades y flujo congelado por ticket |
| Subtipo del ticket (en Mi Portal: «Estado de cuenta del lote», «Actualización de datos», «Copia legalizada de contrato», «Otra solicitud» y otros) | `SVC_TICKET` no trae clave de subtipo y `MAE_TICKET_TYPE` no describe subtipos | Dónde vive el subtipo: por confirmar con los 8 atributos no clave de `MAE_TICKET_TYPE` |
| Canal «Mi Portal» (HU-064) | La descripción de `MAE_CHANNEL` lista llamada, WhatsApp, correo y presencial | Dar de alta el valor en el catálogo transversal (fragmento REFERENCE) |
| 9 tipos de ticket: pedido simple, consulta de cuenta, visita técnica, queja, reclamo, garantía postventa, resolución de contrato, ingreso a proyecto y reserva de bus | `MAE_TICKET_TYPE` describe solicitud, consulta, visita técnica, queja y reclamo | Sembrar los que faltan; el comité decide si se hereda el catálogo de la plataforma actual |
| Áreas: las del mockup más 7 de la plataforma actual (Back Office, Legal Formalización, Legal Corporativo, Archivos, Proyectos, Marketing y Soporte Web), sin gestores asignados | `MAE_AREA` describe 6: ATC, Cobranza, Legal, Postventa, TI y Administración | Decidir si se siembran |
| El SLA se pausa en «pendiente del cliente» (lo fija el PO: al responder el cliente, «el SLA se reanuda», HU-066 CA-01) y, según el mockup, la actividad en curso también; al responder, los vencimientos se corren lo que duró la espera. Igual con la suspensión del caso de morosidad por un reclamo abierto. Cada pausa guarda desde, hasta, horas y motivo (HU-066 CA-01, HU-056 CA-03) | Sin tabla de pausas: el v7 solo congela la política (`SLAPolicyID`) y registra `SVC_SLA_BREACH_ALERT` | Tabla o columnas nuevas: propuesta a G3 y Gobierno de Datos |
| Acceso a Mi Portal con DNI y código de 6 dígitos que vence a los 5 minutos y admite 3 intentos (lo fija el PO, PLT-03 FT-24), enviado al correo o al celular (HU-064 CA-01; enviarlo a los dos es propuesta del mockup); abrir un ticket ajeno se rechaza y queda en la bitácora (HU-065 CA-04) | Sin tabla en ATC | **Se retira (DT-04):** el login de clientes, la verificación y la sesión son de Control de acceso; ATC no guarda códigos ni sesiones (C-11). El PO ajusta HU-064 CA-01 (P-027). El rechazo del ticket ajeno sigue en la bitácora de ATC, con el cliente del token (P-033) |
| Cierre automático sin confirmación del cliente a los días hábiles configurados (lo fija el PO, HU-066 CA-04); que sean 5, configurables por el administrador funcional, es propuesta del mockup | Sin tabla de configuración | Dónde se guarda el parámetro |
| Encuesta con CSAT (1 a 5) y CES (1 a 7), sin la pregunta NPS 0–10; informes diario (cierre a las 18:00) y quincenal generados al cierre (HU-019, HU-031) | Encuesta: calza con `SVY_SURVEY_RESPONSE`. Informes: candidatas `KPI_SNAPSHOT` y `SVY_METRIC_SNAPSHOT` | Confirmar con DEP-10 |
| Adjuntos de hasta 10 MB (lo fija el PO: HU-064 CA-05 y el requisito de fotos de FT-10); inspección de garantía con informe y de 1 a 5 fotos o documentos, formatos JPG, PNG o PDF, y hasta 3 en Mi Portal (propuesta del mockup) (HU-035, HU-064 CA-05) | Candidata `GOV_DOCUMENT_REPOSITORY` (catálogo de documentos con versión, checksum y retención) | Confirmar y fijar los límites |
| Los ids del mockup son cadenas (por ejemplo `tk-272`) | Todas las claves del v7 son `int` | El contrato expone ids opacos hasta que G3 decida |

## Entidades que lee y escribe cada grupo de HU (propuesta para CAD-F5)

Sirve para llenar «Entidades que LEE / ESCRIBE» de las historias. Los nombres son del v7; «candidata» quiere decir que la tabla existe pero que no está confirmado que sirva para esa historia.

| Historias | Lee | Escribe | Nota |
|---|---|---|---|
| HU-001, 002 | `MAE_TICKET_TYPE`, `MAE_TICKET_PRIORITY`, `MAE_CHANNEL`, `MAE_BUSINESS_LINE`, `ORG_COMPANY`, `PARTY` | `SVC_TICKET`, `SVC_TICKET_STATUS_LOG`, `SVC_TICKET_ASSIGNMENT_LOG` (alta) | El número por RUC está entre los atributos no clave: por confirmar |
| HU-003, 010, 029 | `MAE_SLA_POLICY`, `MAE_TIME`, `MAE_HOLIDAY` | `SVC_TICKET` (`SLAPolicyID`), `SVC_SLA_BREACH_ALERT` | La pausa del SLA no tiene tabla |
| HU-004, 011 | `SVC_TICKET`, `MAE_GENERIC_LIST_VALUE` | `SVC_TICKET`, `SVC_TICKET_STATUS_LOG` | Cambio automático sin autor: nulabilidad de `ChangedByPartyID` por confirmar |
| HU-005, 042 | `SVC_TICKET`, `MAE_CHANNEL` | `SVC_TICKET_INTERACTION`; adjuntos en `GOV_DOCUMENT_REPOSITORY` (candidata) |  |
| HU-006 | `SVC_TICKET` | `SVC_TICKET` (hitos) | Columnas de hitos por confirmar |
| HU-007, 008, 009, 044, 045, 046 | `SVC_TICKET`, `MAE_AREA` (cola); el usuario y sus roles, del token (sin leer tablas de identidad, C-11) | `SVC_TICKET_ASSIGNMENT_LOG`, `SVC_TICKET` (`CurrentAreaID`, `CurrentOwnerPartyID`) | Rayo de prioridad y carga: sin columnas conocidas. Gestores que cesan, disponibilidad y líder: API de Control de acceso que aún no existe (P-035) |
| HU-012, 013, 014, 015 | `SVC_TICKET`, `MAE_TIME`, `MAE_HOLIDAY`, `MAE_CURRENCY` | `SVC_COMPLAINT_BOOK_ENTRY`, `SVC_COMPLAINT_BOOK_ENTRY_STATUS_LOG`, `GOV_INTEGRITY_EXCEPTION`; carta y cargo en `GOV_DOCUMENT_REPOSITORY` (candidata) | Historial del plazo legal sin tabla propia |
| HU-016 | `SVC_COMPLAINT_BOOK_ENTRY` | `SVC_COMPLAINT_APPEAL`, `SVC_COMPLAINT_APPEAL_STATUS_LOG` |  |
| HU-019, 030, 031, 032 | `SVC_TICKET`, `SVY_SURVEY_RESPONSE`, `PARTY` | `SVY_SURVEY_RESPONSE`; informes: `KPI_SNAPSHOT` o `SVY_METRIC_SNAPSHOT` (candidatas) |  |
| HU-020 a 028 | — | — | Mesa SGD y gate a Eje 3: sin tablas en el v7 |
| HU-033, 034, 035, 036 | `CONTRACT_UNIT_HANDOVER` (DAC), `MAE_WARRANTY_COVERAGE_PERIOD`, `SVC_TICKET` | `CONTRACT_WARRANTY_CLAIM` (fragmento CONTRACT); adjuntos en `GOV_DOCUMENT_REPOSITORY` (candidata) | Sin bitácora de estados del reclamo en el v7; quién escribe en CONTRACT: por confirmar |
| HU-037, 038, 039, 059, 060 | `EVT_EVENT`, `EVT_INVITATION` (candidatas) | `EVT_ATTENDEE`, `EVT_TRANSPORT` (candidatas); `SVC_TICKET` | Formularios simples sin tabla |
| HU-040, 041 | `SVC_TICKET`, `LGL_LEGAL_CASE` (candidata) | `SVC_TICKET_ASSIGNMENT_LOG`; sincronización con Legal | Exposición económica: sin columna conocida |
| HU-043, 047, 048, 052, 053 | `MAE_AREA`, `MAE_SLA_POLICY`, `SVC_TICKET` | — | Flujos, guías, sugerencias de IA, motor de consultas e índice: sin tablas en el v7 |
| HU-049, 050, 051 | `PARTY` (referencia; el dato personal llega enmascarado del dueño del fragmento 3, D-119), `CONTRACT`, `AST_UNIT`; cobranza por API (DEP-08) | `SVC_TICKET_INTERACTION` (rastro de la consulta, sin datos personales) | `PARTY` es la fuente viva (DT-06). Cómo se lee el dato de la persona y el interesado sin `PARTY`: P-037 |
| HU-054, 055 | `SVC_TICKET`, `SVC_TICKET_ASSIGNMENT_LOG` | Constancia del correo: candidata `NEX_NOTIFICATION_LOG` o cambio al v7 propuesto (no `IDN_SYSTEM_TASK`, que es de Control de acceso) | El correo no lleva datos del cliente. El líder del gestor: P-035, P-036 |
| HU-056, 057, 058 | `PAY_COLLECTION_CASE`, `PAY_INSTALLMENT` (candidatas), `SVC_COMPLAINT_BOOK_ENTRY` | `SVC_TICKET`; alertas y cartas sin tabla propia | La suspensión por reclamo frena el flujo: sin columnas |
| HU-064, 065, 066 | `SVC_TICKET`, `SVC_TICKET_STATUS_LOG`, `SVC_TICKET_ASSIGNMENT_LOG` | `SVC_TICKET`, `SVC_TICKET_INTERACTION`, `SVC_TICKET_STATUS_LOG` | Sin datos de otros clientes ni notas internas (RN-SVC-044). Sin código de acceso ni sesión en ATC (DT-04). El `PartyID` del cliente no viaja en el token (P-033) |
| HU-067 | `SVC_TICKET`, `SVC_TICKET_STATUS_LOG`, `SVC_TICKET_ASSIGNMENT_LOG`, `SVC_SLA_BREACH_ALERT`, `MAE_AREA` | — | Solo lectura (vistas de lectura, ADR-012) |

## Atributos, códigos y valores que nombran las historias de Nexora

Contraste del 20-oct-2026 con las 62 historias publicadas en PJ-06 (carpeta `historias/`: todas en v1.3, 197 criterios de aceptación). **Revisión del 21-oct-2026:** donde el Excel del PO ya da el nombre de la columna o los valores de la lista, la última columna lo dice. Las historias citan nombres de columna, códigos de lista y reglas que este diccionario no podía listar porque el v7 en diapositivas solo da el **número** de atributos no clave. Aquí quedan todos, con su historia y criterio, para cotejarlos con los archivos de Drive del v7 (P-015). **Ninguno está confirmado como columna del v7** salvo donde se dice «clave».

| Entidad (v7) | Nombre en la historia | Qué dice | Historia · criterio | Frente al v7 |
|---|---|---|---|---|
| `SVC_TICKET` | `CompanyID`, `BusinessLineID` | Empresa (RUC) y línea de negocio: obligatorias y no derivables (RN-SVC-005) | HU-001 CA-01 | Columnas de clave del v7 |
| `SVC_TICKET` | Establecimiento (`CompanyAddressID`) | Puede quedar vacío cuando el canal es remoto (WhatsApp) | HU-001 CA-02 | Columna de clave; nulabilidad: Por confirmar con los archivos de Drive del v7 |
| `SVC_TICKET` | Número por razón social | Correlativo propio de cada `CompanyID`, sin saltos ni duplicados, aunque dos gestores guarden a la vez | HU-002 CA-01 a 03 | Columna `TicketNumber`, única por `CompanyID` (Excel, RF-SVC-002 y RN-SVC-004); mecanismo de secuencia por confirmar |
| `SVC_TICKET_ASSIGNMENT_LOG`, `SVC_TICKET` | `AssignedToPartyID` (bitácora), `CurrentAreaID` (ticket) | Derivar a un área sin elegir persona deja `AssignedToPartyID` vacío y actualiza `CurrentAreaID` | HU-007 CA-01 | Claves del v7; nulabilidad de `AssignedToPartyID`: Por confirmar con los archivos de Drive del v7 |
| `SVC_TICKET` | `CurrentAreaID` + `CurrentOwnerPartyID` + estado activo | Filtro del casillero y de la bandeja del área; sin persona asignada aparece «sin asignar» | HU-009 CA-01, CA-03 | Claves del v7 |
| `SVC_TICKET` | `FirstRespondedDateTime` | Hito de primera respuesta visible al cliente | HU-005 CA-01 | Nombre en el Excel y en el PLT-04 §6.5; tipo por confirmar con Drive v7 |
| `SVC_TICKET` | `FirstResolvedDateTime`, `ResolvedDateTime`, `ClosedDateTime` | Hitos probatorios: la primera resolución se conserva al reabrir; `ResolvedDateTime` refleja el último ciclo; `ClosedDateTime` no se modifica salvo que se reabra | HU-006 CA-01, CA-02 | Nombres en el Excel (RF-SVC-006) y en el PLT-04 §6.5; tipos por confirmar con Drive v7 |
| `SVC_TICKET` | `ReopenedResolutionDueDateTime`, `ReopenCount` | Nuevo compromiso al reabrir sin reescribir el original; contador de reaperturas | HU-011 CA-01, CA-02 | Nombres en el Excel (RF-SVC-011, RN-SVC-007); tipos por confirmar con Drive v7 |
| `SVC_TICKET` | Vinculación pendiente del cliente («Interesado») | Ticket creado con datos mínimos cuando el cliente no existe en SIGDA/TAXON o la fuente está caída; se vincula después y queda en la bitácora | HU-051 CA-01 a 03 | Sin columna en el v7: el PLT-04 §6.5 dibuja `VinculaciónPendiente` en `SVC_TICKET`; la clave foránea `PartyID` → `PARTY` es una referencia a la fuente viva (DT-06). ATC no crea la `PARTY` del interesado: el ticket queda con la vinculación pendiente hasta que exista (R29 y A26 de PJ-05; P-037) |
| `SVC_TICKET` | Rayo de prioridad (marca, motivo, quién) | Aparece primero en la bandeja; solo el líder lo marca; tope del 10 % de la bandeja del área | HU-045 CA-01 a 03 | Sin columnas en el v7: el PLT-04 §6.5 dibuja «Rayo · Motivo» en `SVC_TICKET` |
| `SVC_TICKET` | Señal de conflicto (carta notarial) | Bloquea la resolución en Eje 1/2 (gate no compensable); un supervisor puede retirarla con justificación | HU-026 CA-01 a 03 | Sin columna en el v7: el PLT-04 §6.5 dibuja `ConflictFlag` y «Eje actual» en `SVC_TICKET` |
| `SVC_TICKET_STATUS_LOG` | Marca automática en lugar de autor | El cambio hecho por el sistema se registra con marca automática | HU-004 CA-03 | Nulabilidad de `ChangedByPartyID`: Por confirmar con los archivos de Drive del v7 |
| `SVC_TICKET_ASSIGNMENT_LOG` | Motivos `REASSIGNMENT_CESE` y `REASSIGNMENT_CARGA`; motivo de derivación | Valores de la lista `AssignmentReasonListID`/`AssignmentReasonID` (claves del v7); el motivo de la derivación es obligatorio y sale del catálogo | HU-007 CA-03, HU-008 CA-01, HU-046 CA-01 | Columnas de clave del v7. El Excel da la lista `SVC_ASSIGNMENT_REASON` (`ESCALATION`, `DERIVATION_TO_AREA`, `REASSIGNMENT_ROTATION`, `REASSIGNMENT_RESIGNATION`, `REASSIGNMENT_TERMINATION`), que no coincide con los códigos del PLT-04: el PO fija la lista (C-4) |
| `MAE_SLA_POLICY` | `BUSINESS_HOURS`, precedencia, política genérica | Base de tiempo en horas hábiles (valor de `TimeBasis`); manda la política específica (tipo + prioridad), si no existe la genérica; sin política activa se usa la genérica global y se alerta la configuración | HU-003 CA-01 a 04 | Valor de lista por dar de alta (`BUSINESS_HOURS` y `BUSINESS_DAYS`, RN-SVC-003); la genérica es la fila con `PriorityID` vacío (RN-SVC-001); minutos en `FirstResponseMinutes` y `ResolutionMinutes` (RNF-REN-003) |
| `SVC_SLA_BREACH_ALERT` | `FIRST_RESPONSE_OVERDUE`, `LEGAL_EXTENSION_WINDOW_CLOSING` | Valores de `BreachTypeID` (clave del v7); una sola alerta por ciclo y tipo. La alerta legal no exige política comercial | HU-010 CA-01, HU-015 CA-01 | Columna de clave del v7; lista `SVC_SLA_BREACH_TYPE` del Excel: `FIRST_RESPONSE_OVERDUE`, `RESOLUTION_OVERDUE`, `LEGAL_RESPONSE_OVERDUE`, `LEGAL_EXTENSION_WINDOW_CLOSING` (RF-SVC-010) |
| `SVC_SLA_BREACH_ALERT` | `AlertedPartyID`, `ChannelID` (destinatario y canal); `EvaluatedDueDateTime`, ciclo y fecha | Constancia de la alerta | HU-010 CA-02 | Destinatario y canal: claves del v7; `EvaluatedDueDateTime` y `ReopenCycleNumber` en el Excel (RF-SVC-010, RN-SVC-008); fecha: por confirmar con Drive v7 |
| `MAE_TICKET_TYPE` | `RequiresComplaintBook` | Marca los tipos que exigen asiento en el Libro; si falta el asiento al cierre del día se inserta una excepción | HU-015 CA-02 | Nombre en el Excel (ENT-SVC-005, RN-SVC-011); tipo por confirmar con Drive v7 |
| `GOV_INTEGRITY_EXCEPTION` | `ORPHAN_REFERENCE` | Excepción de integridad por reclamo huérfano (fragmento GOVERNANCE) | HU-015 CA-02 | Tabla del v7 (ENT-GOV-001); tipos de excepción en el Excel: `HASH_MISMATCH`, `ORPHAN_REFERENCE` y `BALANCE_MISMATCH` |
| `SVC_COMPLAINT_BOOK_ENTRY` | Correlativo por establecimiento | Cada establecimiento de una empresa lleva su propio correlativo | HU-012 CA-01 | Único por empresa, establecimiento y número (RN-SVC-004; el PLT-04 §6.5 lo llama `EntryNumber`); columna por confirmar con Drive v7 |
| `SVC_COMPLAINT_BOOK_ENTRY` | Monto y moneda | Con monto, la moneda (`CurrencyID`, clave del v7) es obligatoria; sin monto ambos quedan vacíos | HU-012 CA-02 | Moneda: clave del v7; monto: `ClaimedAmount`, con `CHECK ck_complaint_amount_currency` (Excel, RF-SVC-012) |
| `SVC_COMPLAINT_BOOK_ENTRY` | Empresa inmutable | Una vez registrado el asiento no cambia la razón social (RN-SVC-013) | HU-012 CA-03 | Regla; sin operación de cambio en el contrato |
| `SVC_COMPLAINT_BOOK_ENTRY` | Datos de la prórroga | Justificación, cargo, canal (`ExtensionCommunicationChannelID`, clave del v7) y fecha de comunicación anterior al vencimiento original; una sola prórroga; el vencimiento prorrogado no se reescribe (cada cambio es una fila nueva) | HU-013 CA-01 a 04 | Canal: clave del v7; fechas en el Excel: `ComplaintRegistrationDate`, `LegalResponseDueDate`, `IsResponseExtended`, `ExtendedResponseDueDate` y `ExtensionCommunicatedDate` (RF-SVC-013); justificación y cargo: por confirmar con Drive v7 |
| `SVC_COMPLAINT_BOOK_ENTRY` | `CompanyResponseDate`, `ResponderPartyID`, `CustomerNotifiedOfIndecopiRight` | Respuesta formal con carta y cargo (PDF en Azure Blob (el Excel dice S3; ADR-006), dentro del hash) y constancia de que se informó el derecho a INDECOPI | HU-014 CA-01 a 03 | `ResponderPartyID`: clave del v7; `CompanyResponseDate`, `CompanyResponseDocumentPath` (carta en Azure Blob (el Excel dice S3; ADR-006) con espejo en `GOV_DOCUMENT_REPOSITORY`) y `CustomerNotifiedOfIndecopiRight` en el Excel (RF-SVC-014) |
| `SVC_COMPLAINT_APPEAL` | `IndecopiCaseNumber`, fecha y resumen de la resolución | Resolución de la apelación ante INDECOPI | HU-016 CA-01 | `IndecopiCaseNumber` en el Excel, solo si la instancia es INDECOPI (RF-SVC-016); fecha y resumen: por confirmar con Drive v7 |
| `SVC_COMPLAINT_APPEAL_STATUS_LOG` | Estado `WITHDRAWN` (desistimiento) | Valor de `AppealStatusID` (clave del v7): cierra la apelación; el ticket no puede apelarse otra vez por la misma respuesta | HU-016 CA-03 | Valor de la lista `SVC_COMPLAINT_APPEAL_STATUS` del Excel (RF-SVC-016) |
| `SVY_SURVEY_RESPONSE` | `SubjectEntityName = 'SVC_TICKET'` | Puntero polimórfico al ticket; una encuesta nueva por cada ciclo de cierre; CSAT y CES por tipo, área y gestor | HU-019 CA-01 a 03 | Tabla de otro fragmento (PERFORMANCE-MEASUREMENT; ENT-SVY-001); el Excel nombra `SubjectEntityName`, `SubjectRecordPK` y `SubjectFragment` (RF-SVC-019) |
| `CONTRACT_UNIT_HANDOVER` | Vínculo obligatorio del reclamo de garantía | Sin entrega no hay reclamo; el tipo sale de un catálogo cerrado (estructural, impermeabilización, acabados, instalaciones) | HU-033 CA-01, CA-02 | Tablas del fragmento CONTRACT; catálogo por dar de alta |
| `CONTRACT_WARRANTY_CLAIM` | Estados `APPROVED`, `REJECTED`, `RESOLVED`; «no procedente por vigencia» | La vigencia se valida contra el periodo de cobertura y la fecha real de entrega | HU-034 CA-01, CA-02, HU-035 CA-02 | Lista `CONTRACT_WARRANTY_CLAIM_STATUS` del Excel: `REPORTED`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`, `RESOLVED` (RF-SVC-035); sin bitácora de estados en el v7 |
| — | Código Único del caso sensible | Nunca se reutiliza; recibe las cinco líneas de ingreso y se re-registra como reclamo formal (línea 2) al reclasificar | HU-020 CA-01, CA-02 | Sin tabla en el v7: propuesta |
| — | Cargo previo y cargo de activación | El SLA de línea corre desde el cargo de activación; un caso con cargo previo sin activar más de 2 días hábiles es un caso en limbo | HU-021 CA-01 a 03 | Sin tabla en el v7: propuesta |
| — | Matriz de riesgo y recalibración | El nivel sale de criterios objetivos; recalibrar guarda quién, cuándo y por qué | HU-022 CA-01, CA-02 | Sin tabla en el v7: propuesta |
| — | Niveles de escalamiento | Memorándum a la jefatura, Comité y Directorio, sin saltar niveles; se guarda el historial de niveles | HU-023 CA-01 a 03 | Sin tabla en el v7: propuesta |
| — | Vínculo entre casos | Casos con el mismo cliente y hechos se vinculan y comparten un hilo de evidencia | HU-024 CA-01, CA-02 | Sin tabla en el v7: propuesta (criterio de coincidencia por definir) |
| — | Estado homologado de cierre (8 valores) y evidencia | No se cierra sin evidencia; el original crítico queda en el Repositorio Legal GLI y la plataforma guarda la referencia (`GOV_DOCUMENT_REPOSITORY`) | HU-025 CA-01, CA-02 | Sin tabla en el v7 (el PLT-04 §6.5 esboza `CASE_CLOSURE`). Los 8 valores los da el Excel (RN-SVC-019, RF-SVC-025): conforme, con observación, con riesgo mitigado, con contingencia, por desistimiento, por derivación legal, por regularización documentaria y por acuerdo con el cliente; faltan sus códigos |
| — | Paquete mínimo de handoff (6 elementos) y confirmación | ID, KYC validado, proyecto y lote, pagos y estado de cuenta, atención previa y próximo paso; el especialista de Eje 3 confirma la recepción | HU-027 CA-01 a 03 | Sin tabla en el v7: propuesta |
| — | Nota de estado emocional | Descripción objetiva sin palabras de juicio; el sistema advierte y pide reformular | HU-028 CA-01 a 03 | Sin tabla en el v7: propuesta |
| — | Exposición económica por denuncia | Monto más interés legal al día; sin monto se muestra «por estimar»; umbral de alerta por definir | HU-041 CA-01 a 03 | Sin tabla en el v7: propuesta |
| — | Guía de solución por tipo, con versiones | Pasos, plantillas y criterios de cierre; historial de versiones; aviso «sin guía» al administrador funcional | HU-047 CA-01 a 03 | Sin tabla en el v7: propuesta (`SVC_KNOWLEDGE_ARTICLE` del PLT-05) |
| — | Registro de la decisión sobre la sugerencia de IA | Aceptada, editada o descartada, sin datos personales en el registro | HU-048 CA-02 | Sin tabla en el v7: propuesta (`SVC_AI_SUGGESTION_LOG` del PLT-05) |
| — | Alerta de resolución por 3 meses impagos | Ticket «Resolución de contrato» vinculado al cliente y al lote; cierre «Regularizado»; «suspendido por reclamo» si hay un reclamo abierto | HU-056 CA-01 a 03 | Sin tabla en el v7: propuesta |
| — | Constancia de la alerta de cancelación y de la carta | Fecha, hora, canal, destinatario y estado de entrega; cada intento por canal | HU-057 CA-02, CA-03, HU-058 CA-01 | Sin tabla en el v7: propuesta (la carta va a `GOV_DOCUMENT_REPOSITORY`) |
| — | Formulario simple de ingreso y reserva de bus | Máximo 6 campos; funciona sin conexión; aforo por bus, lista de espera y cancelación que libera el cupo | HU-059 CA-01 a 03, HU-060 CA-01 a 03 | Sin tabla en el v7: propuesta (`SVC_SIMPLE_FORM_DEFINITION` y `SVC_EVENT_BUS_BOOKING`; candidatas `EVT_ATTENDEE` + `EVT_TRANSPORT`) |
| — | Frases Ancla y etiqueta estándar | Frase 4 y Frase 6 (la 6 obliga a registrar el caso), derivación inmediata a la Estación 4 sin reapertura; etiqueta literal «Atención especial — derivación a Legal» | HU-037 CA-01, 02, HU-038 CA-01, 02, HU-039 CA-01, 02 | Sin tabla en el v7: propuesta |

Códigos `ENT` que usan las historias y su nombre en el v7: `ENT-SVC-005` = `MAE_TICKET_TYPE`; `ENT-SVC-012` y `ENT-SVC-013` = `SVC_COMPLAINT_APPEAL` y `SVC_COMPLAINT_APPEAL_STATUS_LOG`; `ENT-SVY-001` = `SVY_SURVEY_RESPONSE`; `ENT-REF-001` = `MAE_CHANNEL`; `ENT-GOV-004` = `GOV_DOCUMENT_REPOSITORY`. `ENT-SVC-014` a `ENT-SVC-020` son las entidades del PLT-05 sin tabla en el v7 (tabla de equivalencias de arriba).

## Listas de valores que ya define el Excel

Revisión del 21-oct-2026. Hoja 02_RF_Micro (columna «fragmentos») y hoja 05_Catalogos del Excel del PO. Se dan de alta en `MAE_GENERIC_LIST_VALUE` (pares `<Campo>ListID` + `<Campo>ID`) salvo los catálogos propios.

| Lista (ListCode) | Columna | Valores | Fuente | Pendiente |
|---|---|---|---|---|
| `SVC_TICKET_STATUS` | `TicketStatusID` (`SVC_TICKET`, `SVC_TICKET_STATUS_LOG`) | `OPEN`, `IN_PROGRESS`, `PENDING_CUSTOMER`, `ESCALATED`, `RESOLVED`, `CLOSED`, `REOPENED` | RF-SVC-004; PLT-04 HU-004 | Orden de los valores; transiciones en `estados.md` |
| `SVC_ASSIGNMENT_REASON` | `AssignmentReasonID` (`SVC_TICKET_ASSIGNMENT_LOG`) | `ESCALATION`, `DERIVATION_TO_AREA`, `REASSIGNMENT_ROTATION`, `REASSIGNMENT_RESIGNATION`, `REASSIGNMENT_TERMINATION` | RF-SVC-007 y 008 | **Conflicto:** el PLT-04 usa `REASSIGNMENT_CESE` (HU-008 CA-01) y `REASSIGNMENT_CARGA` (HU-046 CA-01), que no están en la lista: el PO la fija |
| `SVC_SLA_BREACH_TYPE` | `BreachTypeID` (`SVC_SLA_BREACH_ALERT`) | `FIRST_RESPONSE_OVERDUE`, `RESOLUTION_OVERDUE`, `LEGAL_RESPONSE_OVERDUE`, `LEGAL_EXTENSION_WINDOW_CLOSING` | RF-SVC-010; HU-010, HU-015 | — |
| `SVC_TICKET_INTERACTION_TYPE` | `InteractionTypeID` (`SVC_TICKET_INTERACTION`) | `CUSTOMER_MESSAGE`, `AGENT_RESPONSE`, `INTERNAL_NOTE`, `STATUS_CHANGE` | RF-SVC-005 | **Conflicto:** el PLT-04 (HU-042 §6.5) dibuja la llamada como «Tipo = LLAMADA», que no está en la lista: el PO la fija |
| `SVC_COMPLAINT_APPEAL_STATUS` | `AppealStatusID` (`SVC_COMPLAINT_APPEAL`, `SVC_COMPLAINT_APPEAL_STATUS_LOG`) | `PENDING`, `UNDER_REVIEW`, `RESOLVED_FAVOR_CUSTOMER`, `RESOLVED_FAVOR_COMPANY`, `WITHDRAWN` | RF-SVC-016; PLT-04 HU-016 §6.1 | — |
| `CONTRACT_WARRANTY_CLAIM_STATUS` | `ClaimStatusID` (`CONTRACT_WARRANTY_CLAIM`, fragmento CONTRACT) | `REPORTED`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`, `RESOLVED` | RF-SVC-035 | — |
| Sin ListCode en el Excel | `TimeBasisID` (`MAE_SLA_POLICY`) | `BUSINESS_HOURS`, `BUSINESS_DAYS` | RN-SVC-003; HU-003 CA-02 | ListCode |
| Sin ListCode en el Excel | `ComplaintTypeID` (`SVC_COMPLAINT_BOOK_ENTRY`) | `QUEJA`, `RECLAMO` | ENT-SVC-010; RNF-CUM-006 | ListCode |
| Sin ListCode en el Excel | `AppealLevelID` (`SVC_COMPLAINT_APPEAL`) | `INDECOPI` y la instancia interna | RF-SVC-016 | Código de la instancia interna y ListCode |
| Sin lista en el Excel | `ComplaintStatusID` (`SVC_COMPLAINT_BOOK_ENTRY` y su bitácora) | — | — | Valores: el PLT-04 dibuja registrado, prorrogado, respondido con cargo, plazo vencido y en apelación, sin códigos |
| Catálogos propios | `MAE_TICKET_PRIORITY`; `MAE_AREA` | `LOW`, `MEDIUM`, `HIGH`, `URGENT`; `ATC`, `COBRANZA`, `LEGAL`, `POSTVENTA`, `TI`, `ADMINISTRACION` | ENT-SVC-006 y 007 | — |
| Tipo de excepción | `ExceptionType` (`GOV_INTEGRITY_EXCEPTION`) | `HASH_MISMATCH`, `ORPHAN_REFERENCE`, `BALANCE_MISMATCH` | ENT-GOV-001 | — |
| Sin lista en el Excel | Cierre de caso sensible (sin tabla en el v7) | Conforme, con observación, con riesgo mitigado, con contingencia, por desistimiento, por derivación legal, por regularización documentaria y por acuerdo con el cliente | RN-SVC-019; RF-SVC-025 | Códigos de los 8 estados |

## Esbozos del PO «por modelar» (PLT-04 v1.3, §6.5)

El PLT-04 dibuja estas entidades en los diagramas entidad-relación de las historias y las marca «por modelar» (R-06). **No son tablas del v7:** quedan como entrada para que Gobierno de Datos y el líder técnico decidan su tabla.

| Esbozo del PO | Atributos que dibuja | Historias | En el v7 |
|---|---|---|---|
| `SENSITIVE_CASE` | `CaseCode` (Código Único), línea de ingreso, `PreChargeAt`, `ActivatedAt`, `TicketID` (opcional), estado, `LinkedCaseCode` | HU-020 a 025 | Sin tabla |
| `MAE_INTAKE_LINE` | `LineID`, nombre (las 5 líneas de RN-SVC-014), SLA en días | HU-020 a 022 | Sin tabla |
| `RISK_ASSESSMENT` | `AssessmentID`, `CaseCode`, criterios, puntaje, nivel, fecha y autor | HU-022 | Sin tabla |
| `ESCALATION_LOG` | `EscID`, `CaseCode`, nivel, fecha | HU-023 | Sin tabla |
| `CASE_CLOSURE` | `ClosureID`, `CaseCode`, estado homologado (los 8 de RN-SVC-019), evidencia, referencia al GLI | HU-025 | Sin tabla |
| `HANDOFF_PACKAGE` | `HandoffID`, `TicketID`, los 6 elementos, quién confirma y cuándo | HU-027 | Sin tabla |
| `EMOTIONAL_NOTE` | `NoteID`, `TicketID`, texto sin juicios de valor | HU-028 | Sin tabla |
| `SENSITIVE_EVENT_CASE` y `EVENT` | `CaseID`, `EventID`, riesgo y frases, etiqueta y si se derivó; el evento con proyecto, etapa y fecha | HU-037 a 039 | Candidatas del fragmento EVENT |
| `LEGAL_SYNC` | `SyncID`, `TicketID`, `LegalCaseID`, estado y exposición | HU-040, 041 | Candidata `LGL_LEGAL_CASE` |
| `NOTIFICATION_LOG` | `NotifID`, asignación (`LogID`), para, con copia, enviado | HU-055 | Candidata `NEX_NOTIFICATION_LOG` (nadie la crea en E1; P-043) o cambio al v7 propuesto. No `IDN_SYSTEM_TASK` (fragmento 01, de Control de acceso) |
| `PORTAL_SESSION` | `SessionID`, DNI, OTP, expiración | HU-064 a 066 | **Se retira** (DT-04): el login de clientes es de Control de acceso |
| `SVC_WORKFLOW_DEFINITION` | `WorkflowID`, tipo, subtipo, área, pasos, SLA y versión; el ticket guarda `WorkflowID` | HU-043, 067 | Sin tabla (ENT-SVC-014) |

Además, el PLT-04 dibuja en `SVC_TICKET` atributos que el v7 no tiene: «Rayo · Motivo» (HU-045), `ConflictFlag` y «Eje actual» (HU-026), `VinculaciónPendiente` (HU-051), `SubtypeID` (HU-064) y `WorkflowID` (HU-043); y en `MAE_AREA`, la «Posición en sede» del visor (HU-067).

## Conflictos abiertos

No se resuelven en este diccionario.

| # | Conflicto | Fuentes | Decide |
|---|---|---|---|
| C-1 | `SVC_TICKET.PartyID` es clave foránea a `PARTY` del v7 (también `ContractID` y `UnitID`). El PO fija SIGDA/TAXON como única fuente del cliente, con 0 registros paralelos, y admite tickets de «Interesado» sin cliente vinculado. Si `PARTY` es una réplica, es un registro paralelo; una clave obligatoria impide el ticket del «Interesado» | ADR-03 del PO; RN-SVC-026; RNF-INT-007; DEP-01; HU-051; P-010 | **Decidido por DT-06 (22-oct):** `PARTY` es la fuente viva (P-021 cerrada). Falta que el PO reescriba el ADR-03, RN-SVC-026, RNF-INT-007 y DEP-01 (P-027) y que Gobierno de Datos lo confirme en el acta. El ticket del «Interesado»: P-037 |
| C-2 | El v7 trae la identidad en IDENTITY-ACCESS y deja de lado un maestro local; el PO fija usuarios, roles y líderes locales en la Etapa 1 | ADR-09 del PO; DEP-02 | **Resuelto por DT-03 (22-oct):** la identidad es de Control de acceso; ATC no guarda maestro local. El PO actualiza el ADR-09 y DEP-02 (P-027) |
| C-3 | Bitácoras firmadas: el Excel pide 5 (estado, asignación, libro, apelación y alertas) y el v7 declara 4 en SERVICE | RNF-AUD-004; v7 | Gobierno de Datos con el líder técnico |
| C-4 | Motivos de asignación: el PLT-04 usa `REASSIGNMENT_CESE` y `REASSIGNMENT_CARGA`; el Excel, la lista `SVC_ASSIGNMENT_REASON` | HU-008, HU-046; RF-SVC-007 | PO |
| C-5 | Tipo de interacción de la llamada: el PLT-04 dibuja «LLAMADA»; la lista `SVC_TICKET_INTERACTION_TYPE` del Excel no lo tiene | HU-042 §6.5; RF-SVC-005 | PO |

## Datos personales

El v7 declara **0 tablas DAC** en SERVICE: el dato personal vive en `PARTY_SENSITIVE_DATA` (cifrado) y el ticket apunta a `PartyID`. ATC no lee las tablas de personas: el dueño del fragmento 3 entrega el dato enmascarado (D-119 de PJ-05; P-037). **Propuesta para Gobierno de Datos** (no es una clasificación del v7), tabla por tabla en `registro-de-tablas.md` §2 (H-02 del acta): el texto libre y los adjuntos de `SVC_TICKET_INTERACTION`, y la hoja del Libro en `SVC_COMPLAINT_BOOK_ENTRY` (excepción de ADR-003 que valida Legal), se tratan como dato personal aunque la tabla no sea DAC; las bitácoras no llevan datos personales (RN-SVC-012).

## Reglas de nombres y tipos (del v7)

- Prefijo `MAE_` para catálogos transversales y prefijo de fragmento para lo propio (`SVC_` en SERVICE). Una sola instancia PostgreSQL.
- Una migración Flyway por cambio (skill `aybar-modelo-a-flyway`); **nunca se renombra ni se elimina una columna existente** (se marca DEPRECADO).
- Historial: tabla `_STATUS_LOG` con una fila por cambio. Importes cifrados: sufijo `Encrypted` más un companion `*Hash`.
- Multiempresa: las consultas se filtran por `CompanyID` según el tipo de rol del token (C-08): con rol por empresa, por la empresa activa (`companyId`); con rol global de ATC, el token llega sin `companyId` (D-178 de PJ-05) y el alcance lo resuelve P-034. En Mi Portal, por el cliente del token (P-033).

## Pendiente de los archivos fuente de Drive

- Tipo, largo, obligatoriedad y valores por defecto de los 196 atributos de SERVICE (archivo mermaid «SERVICE» y Diccionario de atributos, Anexo C del v7).
- Nombre de los atributos no clave que el Excel no nombra (el v7 en diapositivas solo dibuja PK y FK).
- Claves de las 11 entidades de otros fragmentos que SERVICE referencia (hoy solo se conoce el nombre de la FK en SERVICE).
- Conciliar las 4 entidades firmadas del v7 con las 5 bitácoras de RNF-AUD-004 y escribir la receta de `IntegrityHash` de cada una (el Excel solo trae la del ticket).
- Tablas o columnas para lo que el mockup de la Etapa 1 decide y el v7 no tiene: definición de flujo con actividades, subtipo, pausas del SLA y parámetro de cierre automático (propuesta a G3 y Gobierno de Datos).
- Qué escribe ATC en tablas de otros fragmentos y quién las migra: propuesta en `registro-de-tablas.md` §5 y §6; lo acuerda Gobierno de Datos (P-014, P-043).
- Valores que el Excel no da: la lista de estados del asiento (`ComplaintStatus`), el código de la instancia interna de `AppealLevel`, el ListCode de `ComplaintType`, `AppealLevel` y `TimeBasis`, y los códigos de los 8 estados de cierre de casos sensibles. Las demás listas ya están en el Excel (ver «Listas de valores que ya define el Excel»).

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v4 de Jesús Chávez Elías en Nexora; actualizado por Brayan con IA (Claude, 2026-10-21) a la v1.3 del PO: IDs del Excel, columnas no clave y códigos de las listas que ya define el Excel, 5 bitácoras firmadas (RNF-AUD-004), los 8 estados de cierre de casos sensibles, esbozos del PO por modelar y conflictos abiertos. Texto adaptado al alcance de la Etapa 1 (se omiten las frases que remiten a fases posteriores). — Revisado por: (pendiente)

Actualizado el 22-oct-2026 por Jesús Chávez Elías con IA (Claude) a partir de la revisión del Líder Técnico (DT-02, DT-03, DT-04 y DT-06 de `analisis/decisiones.md` v0.3). — Revisado por: (pendiente)

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-19 a 2026-10-22 | Jesús Chávez Elías y Brayan Hurtado, con IA | Estructura desde el v7, listas del Excel, esbozos del PO y decisiones del 22-oct (versiones de Nexora hasta la v6) |
| 0.2 | 2026-10-26 | Brayan Hurtado, con IA | Sección «Dónde viven las tablas» (DT-06, C-11, C-07); `MAE_AREA` solo como cola; dueño de dato propuesto; las entidades sin tabla pasan a «cambio al v7 propuesto»; se retiran las candidatas de código y sesión de Mi Portal y las lecturas o escrituras en tablas de identidad (`IDN_USER_ACCOUNT`, `IDN_SYSTEM_TASK`); ATC no crea `PARTY` (P-037); filtro por empresa según C-08; enlace al registro de tablas |

Actualizado el 26-oct-2026 por Brayan Hurtado con IA (Claude) a partir de la revisión del Líder Técnico del 22-oct (DT-06, C-07 y C-11) y del paquete aprobado de PJ-05. — Revisado por: (pendiente)
