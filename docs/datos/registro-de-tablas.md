---
id: "SPEC-DATOS-REGISTRO-TABLAS"
tipo: "spec"
titulo: "Registro de tablas de ATC en la base única: qué crea, qué lee y qué escribe en otro dominio"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.9"
owner: "Brayan Hurtado (Dev 1)"
aprobadores: [tech_lead, data_chief]
fecha: "2026-10-29"
relacionados: [ADR-001, ADR-003, ADR-005, ADR-008, ADR-009, ADR-013, SPEC-DATOS-DICCIONARIO, SPEC-DATOS-ACTA-F4, SPEC-ARQ-MIGRACION]
tags: [datos, base-unica, gobierno-de-datos, f4, g3]
---

# Registro de tablas de ATC (C-11)

Responde a la colisión **C-11** de la revisión del Líder Técnico (22-oct-2026): «Publicar el registro de tablas de ATC: qué crea (`SVC_*` y sus catálogos), qué solo lee y qué escribe en otro dominio. Los maestros compartidos tienen un solo dueño de migración, acordado con Gobierno de Datos». Aplica **DT-06** (las tablas de ATC van en la base única del modelo v7, en Azure Database for PostgreSQL, con FK físicas, y `PARTY` es la fuente viva del cliente) y **DT-03** (ATC no guarda usuarios, roles ni permisos).

**Decidido por el equipo** (Brayan Hurtado), 26-oct-2026; propuesta al Líder Técnico en este envío (`analisis/decisiones.md`: ED-01, ED-04, ED-05, ED-11, ED-15, ED-16 y ED-23). El dueño de migración de cada tabla lo fija ED-11 (§6). La persona que es dueña de dato la designa el Data Chief al firmar el acta F4 (`acta-validacion-arquitectura-datos.md`), que queda lista para su firma: es una firma, no una condición del registro.

**Revisión del 28-oct-2026 (v0.7, ATC se adapta a PJ-05).** ATC no envía correos ni espera a nadie: se adapta a lo que PJ-05 documenta (copia sellada del 22-oct; «documentado» no es «construido»). Cambia lo siguiente: (1) PJ-05 no define ningún permiso ni rol para ATC (solo sus 4 roles `app_idn_*`), así que el `SELECT` por columna sobre `IDN_USER_ACCOUNT` y los `REFERENCES` pasan de «entregable que otorga Control de acceso» a **supuesto de diseño de ATC** (§4 y §4.1); `CuentaPersonaPort` es un puerto de ATC con simulador (ED-08); (2) ATC **no escribe** en `MAE_GENERIC_LIST_VALUE`, `MAE_CHANNEL` ni `GOV_INTEGRITY_EXCEPTION`: sus listas, su canal y sus excepciones de integridad son **propios de ATC** (§3 y §5); (3) `shedlock` lleva nombre físico propio; (4) el mapa documento → `PartyID` y la topología de red son supuestos nuevos. Las listas y tablas propias de ATC y sus nombres físicos son propuesta del equipo (supuesto de diseño), no acuerdo con nadie.

**Revisión del 28-oct-2026 (v0.8, cruce del Líder Técnico del 28-oct, §2 punto 2 y §3 punto 4).** Se retira ED-01 como lectura de `IDN_USER_ACCOUNT`: ATC no tiene `SELECT`, `GRANT` ni rol (`app_atc_servicio`) sobre esa tabla, ni como opción ni como transición. `PartyID` sale del token: el adaptador definitivo de `CuentaPersonaPort` lee el claim `party_id` (nombre propuesto por ATC; el contrato de claims actual, HU-IDN-053, no lo trae), que el área debe agregar; se pide en la solicitud S28-4 (`arquitectura/roles-y-permisos-atc.md` §13). Hasta que exista, simulador. El **tipo y estado de la cuenta** (Mi Portal) y el **`Username`/correo del gestor** (HU-055) ya no se leen de la tabla y el claim `party_id` no los cubre: **por confirmar con el área en la solicitud (S28-4)**; no se inventa un claim. Lo que en este registro declare acceso de lectura a `IDN_USER_ACCOUNT` queda como texto superado.

**Revisión del 29-oct-2026 (revisión del Líder Técnico del 29-oct, punto 4).** S28-4 pide que el área permita consultar por API, con el token de servicio, el estado de la cuenta y los gestores que tienen cada rol. Mientras tanto, ED-03 queda como solución interina, sin guardar copias: no se copia la lista de cuentas ni su estado.

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
| Nombre de la persona | `PARTY_PERSON` y `PARTY_SENSITIVE_DATA` **no se crean en E1**: el prospecto guarda solo Party, DNI y correo, y no hay nombre en la base. El documento y el correo están en `PARTY_IDENTIFICATION` y `PARTY_COMMUNICATION` (DAC) | `datos/modelo-de-datos.md:1846` (H-30); `adr/ADR-019-base-en-azure-y-frontera-con-gcp.md:190-193` |
| Roles de base | 4 roles: `app_idn_ddl` (dueño de las 56 tablas), `app_idn_servicio`, `app_idn_batch` y `app_idn_auditoria` (solo `SELECT`). Los crea infraestructura y ninguno es de otro servicio. El diccionario actual de PJ-05 tiene 56 entidades, 33 del fragmento 01 | `datos/modelo-de-datos.md:1895` y `:1899-1902`; `datos/diccionario-de-datos.json` |
| Nombres, listas e `IntegrityHash` | Nombres físicos en `snake_case` y `bigint` en PK y FK; estados y tipos son pares `(ListID, ValueID)` con ID numérico (`ListID×1000+orden`, bloques de 999 por dominio: 1000, 2000, 3000 y 8000, **sin bloque para SERVICE**); los valores iniciales llevan `IntegrityHash = 'PENDIENTE-RECALCULO'` y su servicio los sella al arrancar; `GOV_INTEGRITY_EXCEPTION.IntegrityHash` es NOT NULL con llave KMS separada; su lista de tipos (8005) trae `HASH_MISMATCH`, `BALANCE_MISMATCH`, `ORPHAN_REFERENCE`, `MANUAL_REPORT` y `SOD_WARNING` | `datos/modelo-de-datos.md:1875`, `:1879` y `:1915`; `datos/diccionario-de-datos.json` (`GOV_INTEGRITY_EXCEPTION`) |
| Canal | `MAE_CHANNEL` solo siembra `EMAIL` y `WHATSAPP` y no tiene `UNIQUE` en el código | `datos/modelo-de-datos.md:295` (FK-10) |
| Estados de la cuenta y de la Party | `LOCKED` es transitorio (5 intentos; vuelve a `ACTIVE` a los 15 minutos o con el siguiente ingreso) y PJ-05 no define un flujo de cese; la Party del prospecto es `OTHER` y la del impostor queda `INACTIVE` | `datos/estados.md:62-65`; `datos/modelo-de-datos.md:1847` (H-31); HU-IDN-059 CA-12 ⚠ |
| ShedLock y red | PJ-05 también usa ShedLock en su servicio y base (su tabla de bloqueo no está entre las 56 entidades); la base y Key Vault solo son alcanzables por Private Endpoint, sin acceso público | D-90 (`analisis/decisiones.md:296`); `arquitectura/arquitectura-tecnica.md:1253-1255` |
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

Las columnas que guardan a un colaborador (`CreatedByPartyID`, `CurrentOwnerPartyID`, `ChangedByPartyID`, `AssignedToPartyID`, `AssignedByPartyID`, `AgentPartyID`, `AlertedPartyID`, `ResponderPartyID` y `ClosedByPartyID`) son FK a `PARTY`. El token de Control de acceso trae `user_account_id` y no `PartyID`: ATC obtiene la Party del colaborador y la del cliente de Mi Portal con `CuentaPersonaPort`, un puerto de ATC cuyo adaptador real no está definido en PJ-05 (hoy, el simulador; ED-01, ED-08 y §4). *Cruce del Líder Técnico del 28-oct (C14): el adaptador definitivo lee el claim `party_id`, no la tabla; S28-4.*. Un cambio automático o de un job deja el autor vacío (ED-16).

## 3 Cambios al v7 (tablas y columnas de ATC; ED-15 y ED-23)

El v7 no los trae. El equipo decidió crearlos como tablas o columnas del fragmento SERVICE, que migra ATC; van en el acta F4 (H-03), lista para la firma del Data Chief.

**Etapa 1 (P-025, decidida por el equipo el 26-oct-2026; `analisis/decisiones.md`).** HU-ATC-037, 038, 039, 048 y 053 salen de la Etapa 1. Dos cambios de esta tabla solo los usan ellas y **no se crean en la Etapa 1**: `SVC_AI_SUGGESTION_LOG` (HU-048) y el caso sensible del evento (HU-037 a 039); siguen documentados como cambio al v7 y se crean cuando entren. La búsqueda vectorial de HU-053 tampoco se activa. Los demás cambios no cambian.

| Cambio al v7 | Para qué | Historias o ADR | Decisión |
|---|---|---|---|
| `SVC_OUTBOX_EVENT` (propia, fragmento 10) y la lista `SVC_OUTBOX_EVENT_TYPE` | Outbox transaccional del servicio (DT-02). ADR-013 la elige porque `INTG_OUTBOX_EVENT` del v7 es para envíos a sistemas externos y no sirve como outbox de ATC; es el cambio al v7 que se presenta. Columnas en ADR-013, punto 6, entre ellas `UserAccountID` (el `user_account_id` del token de quien hizo el cambio; nulo si el evento lo origina un job; sin FK: es una tabla técnica que se purga a los 7 días). Sin datos personales y sin `IntegrityHash`; se purga a los 7 días | ADR-013; ED-23 | Decidido (ED-23) |
| `SVC_AI_SUGGESTION_LOG` (ENT-SVC-016) | Registro de cada sugerencia de IA y su decisión, sin datos personales | ADR-007; HU-048; ED-23 | Decidido (ED-23) · no se crea en la Etapa 1 (P-025); se crea cuando entre HU-048 |
| `SVC_WORKFLOW_DEFINITION` (ENT-SVC-014) y `SVC_WORKFLOW_ACTIVITY`, con su versión | Flujo por tipo, subtipo y área, versionado; el ticket congela su versión (HU-043 CA-02 y CA-06) | ADR-008; HU-043; ED-15 | Decidido (ED-23) |
| `MAE_TICKET_SUBTYPE` | Subtipo del ticket | ADR-008; HU-043, HU-064; ED-15 | Decidido (ED-23) |
| `SVC_TICKET_SLA_PAUSE` y la columna `AutoCloseBusinessDays` de `MAE_SLA_POLICY` (valor inicial 5) | Pausas del SLA (también la suspensión por reclamo) y días hábiles de espera antes del cierre automático | ADR-008; HU-066, HU-056; ED-15 | Decidido (ED-23) |
| Columnas nuevas en `SVC_TICKET`: `SubtypeID`, `WorkflowID`, `IsLightning`, `LightningReason`, `LightningByPartyID`, `ConflictFlag`, `CurrentAxisCode` e `IsPartyLinkPending` | Lo que el PLT-04 §6.5 dibuja y el v7 no tiene | HU-043, HU-045, HU-026, HU-051, HU-064 | Decidido (ED-23) |
| Columna nueva en `MAE_AREA`: posición en la sede | Visor 3D (HU-067). No se agrega referencia al área organizacional: en la Etapa 1 no hay correspondencia (ED-04, §7) | HU-067; ED-04 | Decidido (ED-23) |
| `SVC_KNOWLEDGE_ARTICLE` (ENT-SVC-015) | Guías de solución por tipo, con versiones | HU-047 | Decidido (ED-23) |
| `SVC_SIMPLE_FORM_DEFINITION` (ENT-SVC-019) y `SVC_EVENT_BUS_BOOKING` (ENT-SVC-020) | Formularios simples y reserva de bus. Las candidatas del v7, `EVT_ATTENDEE` y `EVT_TRANSPORT`, no se usan: su fragmento no tiene dueño en la Etapa 1 | HU-059, HU-060 | Decidido (ED-23) |
| `SVC_CONTRACT_DEFAULT_ALERT` (ENT-SVC-018) | Caso de resolución por morosidad y constancia de alertas. La candidata del v7, `PAY_COLLECTION_ACTIVITY`, no se usa: es de un fragmento sin dueño en la Etapa 1 | HU-056 a HU-058 | Decidido (ED-23) |
| Casos sensibles: `SENSITIVE_CASE`, `MAE_INTAKE_LINE`, `RISK_ASSESSMENT`, `ESCALATION_LOG`, `CASE_CLOSURE`, vínculo entre casos | Mesa SGD (esbozos «por modelar» del PLT-04 §6.5) | HU-020 a HU-025 | Decidido (ED-23) |
| `HANDOFF_PACKAGE`, `EMOTIONAL_NOTE` y el caso sensible del evento | Handoff a Eje 3, nota de estado emocional y EntregaFest | HU-027, HU-028, HU-037 a HU-039 | Decidido (ED-23) · el caso sensible del evento (`SENSITIVE_EVENT_CASE` y `EVENT` del diccionario) no se crea en la Etapa 1 (P-025); se crea cuando entren HU-037 a 039 |
| `shedlock` | Tabla técnica de ShedLock para que un job corra en una sola réplica (DT-08). **Nombre físico propio de ATC: `shedlock_atc`** (configurable en el `LockProvider`; supuesto de diseño del 28-oct): PJ-05 también usa ShedLock en el mismo servicio y esquema (D-90; inferido) y el nombre por defecto podría chocar | ADR-005; ED-23; ED-11 | Decidido (ED-23); nombre propio, supuesto de diseño |
| `SVC_GENERIC_LIST`, `SVC_GENERIC_LIST_VALUE` y `SVC_CHANNEL` (propias de ATC; nombres físicos propuestos `svc_generic_list`, `svc_generic_list_value` y `svc_channel`) | Hacen, para ATC, lo que `MAE_GENERIC_LIST`, `MAE_GENERIC_LIST_VALUE` y `MAE_CHANNEL` hacen en el v7: ATC **no escribe** en las de PJ-05 (§5). Misma forma (código, nombre, orden, activo); los pares `<Campo>ListID` + `<Campo>ID` y los `ChannelID` de las tablas de ATC apuntan a ellas (en el diccionario y el ER siguen los nombres lógicos del v7). Canales de ATC: los que usa (llamada, WhatsApp, correo, presencial y `MI_PORTAL`). Si ATC sigue `ListID×1000+orden`, lo hace en sus tablas y sin bloque en PJ-05 | ED-11 (28-oct); H-02 y H-08 de `contraste-PJ-05/tema-3-datos.md` | Supuesto de diseño de ATC (28-oct) |
| `SVC_INTEGRITY_EXCEPTION_LOG` (propuesta) | Bitácora de ATC de las excepciones de integridad (`ORPHAN_REFERENCE`, `HASH_MISMATCH` y `PARALLEL_RECORD`), append-only y con HMAC (ADR-002), en lugar de `GOV_INTEGRITY_EXCEPTION`, que exige un `IntegrityHash` con llave KMS separada que ATC no tiene | HU-015; HU-032; Q-003 del acta; ED-11 (28-oct) | Supuesto de diseño de ATC (28-oct) |
| `flyway_schema_history_atc` | Tabla técnica de historial de Flyway propia de ATC en la base única (sección 3.1) | ADR-001, regla 5; `arquitectura/migracion-y-reversion.md` §1; ED-11 |
| `SVC_TICKET_PROSPECT` | Datos mínimos del interesado sin `PARTY` (tipo y número de documento, nombre, teléfono y correo), 1:1 con el ticket «sin cliente vinculado»; dato personal; la fila se borra al vincular o, si nunca se vincula, a los 30 días hábiles del cierre del ticket (2 años del registro si tiene asiento del Libro), con el job de purga (ADR-005) y la regla Q-012 del acta | HU-051; ADR-003; ED-05; O-11 | Decidido (ED-05) |
| `SVC_TICKET_ACTIVITY` y la lista `SVC_TICKET_ACTIVITY_STATUS` | Actividades de cada ticket: estado, fecha en que se habilita, vencimiento y cierre | HU-043 CA-04; ADR-008; ED-15 | Decidido (ED-15) |
| `SVC_NOTIFICATION_LOG` | Constancia del correo de asignación (destinatario como `PartyID`, canal, fecha y estado de entrega), sin datos del cliente. `NEX_NOTIFICATION_LOG` no se usa: es de un fragmento sin dueño en la Etapa 1 | HU-055; ED-23 | Decidido (ED-23) |
| Listas nuevas de SERVICE en las listas propias de ATC (`svc_generic_list_value`; ya no en `MAE_GENERIC_LIST_VALUE`, de PJ-05): `SVC_COMPLAINT_STATUS`, `SVC_COMPLAINT_TYPE`, `SVC_COMPLAINT_APPEAL_LEVEL`, `SVC_SLA_TIME_BASIS`, `SVC_CASE_CLOSURE_STATUS`, `SVC_WARRANTY_DEFECT_TYPE`, `SVC_BUS_BOOKING_STATUS`, `SVC_DEFAULT_CASE_STATUS` y `SVC_DELIVERY_STATUS`, y los valores nuevos `REASSIGNMENT_WORKLOAD` y `CALL`; semilla de `MAE_TICKET_TYPE` y `MAE_TICKET_SUBTYPE` con el catálogo del piloto (15 combinaciones, entre ellas «Validación de identidad (prospecto)», C-06) | Códigos que el Excel no da (`datos/diccionario.md`, «Listas de valores» y «Catálogo del piloto») | ED-14; ED-19; ED-26 | Decidido (ED-23 y ED-26) |

**No es cambio al v7: `SVC_SEARCH_INDEX` (ENT-SVC-017 del PLT-05).** El índice de búsqueda de HU-049 y HU-053 no es una tabla de la base única: es una **colección del almacén de lectura**, con identificadores y metadatos de permisos y sin datos personales, que escribe el proyector (ADR-003 y ADR-012). La búsqueda por significado de HU-053 (alcance flexible, R-01; fuera de la Etapa 1 por P-025: se activa cuando entre) usa la búsqueda vectorial del mismo servicio con filtro previo por permisos, con los vectores de `text-embedding-3-small` (ADR-007 y ADR-012; ED-17).

### 3.1 Historial de Flyway en la base única

En la base única corren las migraciones de varios servicios: Control de acceso ya migra la suya y, si no la cambió en su configuración, usa la tabla de historial por defecto del starter (`flyway_schema_history`). Sea cual sea, si ATC usara la misma, Flyway vería migraciones que no son suyas y la validación fallaría al arrancar. Por eso ATC lleva **su propia tabla de historial** y no toca la de nadie:

Es la regla 5 de ADR-001:

| Propiedad | Valor | Por qué |
|---|---|---|
| `aybar.data.flyway.baseline-table` | `flyway_schema_history_atc` | Historial propio de ATC; `aybar-starter-data` 0.7.1 lo traduce a `spring.flyway.table`. Va en el mismo esquema que las tablas del v7 de la base única |
| `aybar.data.flyway.baseline-on-migrate` | `true` | La base no está vacía (tiene las tablas de Control de acceso): sin línea base, Flyway no arranca sobre un esquema con objetos |
| `spring.flyway.baseline-version` | `0` | Con la de defecto (1), Flyway saltaría la `V1__` de ATC. Es la única propiedad `spring.flyway.*` que se declara, porque el SDK no la expone en `aybar.data.flyway.*`, y no se repite en los dos espacios. **Es una excepción a la regla literal del contrato** («no fijar `spring.flyway.*` y `aybar.data.flyway.*` a la vez»): el equipo la propone al Líder Técnico en ADR-001 (ED-11); si el SDK expone `baseline-version` en `aybar.data.flyway.*`, se pasa a esa propiedad |
| `aybar.data.flyway.locations` | `classpath:db/migration` | Solo las migraciones de ATC |

Las migraciones corren en un **job aparte** (Azure Container Apps Job, antes de cada despliegue) con el rol de base **`app_atc_migracion`**, dueño de las tablas de ATC (`SVC_*` y `MAE_*` de SERVICE, `SVC_OUTBOX_EVENT`, `shedlock` y `flyway_schema_history_atc`) y, si las FK físicas lo exigen, `REFERENCES` sobre las tablas ajenas (supuesto de diseño: PJ-05 no lo documenta, §4.1). La aplicación arranca con `aybar.data.flyway.enabled: false` y el rol **`app_atc_servicio`**, que no es dueño de nada (ADR-001, regla 5; ADR-002; `arquitectura/seguridad.md`). Esquema: el de las tablas del v7 en la base única; historial propio con línea base 0, que no depende del historial de otros servicios (ED-11). Los roles `app_atc_migracion` y `app_atc_servicio` los crea infraestructura, como los `app_idn_*` de PJ-05 (`datos/modelo-de-datos.md:1895`); PJ-05 no los define. Que ATC comparta o no la instancia de PJ-05, y cómo llegan a ella sus Container Apps y el Job de migraciones (la base solo es alcanzable por Private Endpoint), es un **supuesto de topología** de ATC (¿misma instancia?); `app_atc_servicio` no tiene permisos sobre tablas de PJ-05 (§4.1).

## 4 Tablas que ATC solo lee (no las crea ni las migra)

| Tabla | Fragmento | Quién la crea hoy | Para qué la usa ATC |
|---|---|---|---|
| `PARTY` | 3 PARTY | Control de acceso (E1) | FK física de `SVC_TICKET` y de las bitácoras (DT-06). ATC no lee los datos de la persona en las tablas de personas: el nombre, el documento y el contacto llegan por la consulta del cliente en línea, que devuelve el `PartyID` (ED-05), o enmascarados del dueño del fragmento 3 (D-119); en E1 no hay nombre en `PARTY` (H-30). **Mapa documento → `PartyID`** (dependencia y supuesto nuevo de ATC, 28-oct): PJ-05 carga `PARTY` desde `LEGACY_ANTIGUO`, `SLIN` y `URBEMIND` (D-60; HU-IDN-061 CA-12; una Party por DNI) y no tiene API de búsqueda por documento (D-119); ATC lo declara en ADR-003, ADR-004 (DEP-01) y los DoR de HU-001, HU-050 y HU-051, y el simulador no lo prueba |
| *Texto del 28-oct, superado por el cruce del Líder Técnico (C14): ATC no lee esta tabla; `PartyID` sale del claim `party_id` (S28-4); tipo/estado de cuenta y `Username` por confirmar con el área.* `IDN_USER_ACCOUNT` (columnas físicas `user_account_id`, `party_id`, `account_type_id`, `account_status_id` y `username`; solo si el adaptador de `CuentaPersonaPort` lee la tabla) | 01 IDENTITY-ACCESS | Control de acceso (E1) | Traducir el `user_account_id` del token a la Party del colaborador y del cliente de Mi Portal, saber si la cuenta es `CUSTOMER` activa (Mi Portal) o `EMPLOYEE` activa (gestores de la cola, ED-03) y dar la dirección del correo de asignación (HU-055). *Texto superado:* **Supuesto de diseño de ATC (28-oct):** PJ-05 no define ningún rol ni permiso de otro servicio sobre esta tabla (solo 4 roles `app_idn_*`), D-119 dice que nadie lee las tablas de personas directamente y `obtenerCuenta` exige `ROLE_IT_ADMIN`. `CuentaPersonaPort` (ED-01) es un puerto de ATC: el adaptador real **no está definido en PJ-05** y hoy se usa el simulador (ED-08). Opciones de diseño, sin plazo y sin depender de nadie: claim `party_id` o `/oauth2/userinfo` (admite propiedades extra ⚠), endpoint interno por `client_credentials` o una vista de lectura. Un `GRANT` por columna no filtra filas: `username` es el correo de toda cuenta, no solo de `EMPLOYEE`. Tipo y estado son pares de lista con ID numérico (el código sale por join a `mae_generic_list_value`). La tabla es NO-DAC y `party_id` es FK obligatoria (PJ-05 `datos/modelo-de-datos.md:84` y `:281`) |
| `ORG_COMPANY`, `MAE_BUSINESS_LINE` | 2 COMPANY | Control de acceso (E1) | Empresa y línea de negocio del ticket (RN-SVC-005) |
| `MAE_GENERIC_LIST`, `MAE_GENERIC_LIST_VALUE` | 0 REFERENCE | Control de acceso (E1) | Estados y tipos de PJ-05 (por ejemplo los de la cuenta). **ATC no las usa para sus listas ni escribe en ellas** (28-oct): las suyas viven en `SVC_GENERIC_LIST` y `SVC_GENERIC_LIST_VALUE` (§3), con pares `<Campo>ListID` + `<Campo>ID` contra ellas |
| `MAE_CHANNEL`, `MAE_CURRENCY` | 0 REFERENCE | Control de acceso (E1) | `MAE_CURRENCY`: moneda del reclamo. `MAE_CHANNEL` solo siembra `EMAIL` y `WHATSAPP` y ATC no escribe en ella: el canal del ticket, de la interacción y de la alerta es `SVC_CHANNEL` de ATC (§3) |
| `ORG_COMPANY_ADDRESS`, `ORG_PRODUCT` | 2 COMPANY | **Nadie todavía** | FK física de `SVC_TICKET` y del asiento del Libro (establecimiento y producto). Dueño de migración: ATC como custodio (ED-11, §6) |
| `CONTRACT`, `AST_UNIT` | CONTRACT | **Nadie todavía** | FK física de `SVC_TICKET` (contrato y lote). Dueño de migración y de la carga: el dueño del fragmento CONTRACT (DEP-07; ED-11, §6) |
| `MAE_TIME`, `MAE_HOLIDAY` | 0 REFERENCE | **Nadie todavía** | Días hábiles y feriados del SLA y del plazo legal (ADR-005). Los da y los migra el Equipo Datos (DEP-04; ED-11, §6); mientras falten, el calendario configurado y versionado (DEU-02 del acta) |
| `CONTRACT_UNIT_HANDOVER`, `MAE_WARRANTY_COVERAGE_PERIOD` | CONTRACT | **Nadie todavía** | Acta de entrega y cobertura de la garantía (HU-033, HU-034; DEP-07). Dueño de migración: el dueño del fragmento CONTRACT (ED-11, §6) |

**Precondición de la primera migración de ATC.** Con FK físicas, la migración de `SVC_TICKET` (tarea HU-ATC-001-T02) solo corre si ya existen `ORG_COMPANY`, `ORG_COMPANY_ADDRESS`, `PARTY`, `CONTRACT`, `AST_UNIT`, `MAE_BUSINESS_LINE` y `ORG_PRODUCT` (las listas y el canal de ATC los crea la propia migración antes). En local y en DEV, si alguna no existe, la crea un **script de datos sintéticos de ATC fuera de Flyway**, tal como está en el v7: no es una migración de ATC ni llega a QA (ED-11). No hay scripts de datos sintéticos del v7 para esas tablas: PJ-05 trae solo sus semillas y el juego sintético de personas de su HU-IDN-061 (CA-11), y la plantilla de ATC, solo `V1__init.sql`. En QA, PRE y producción, mientras una tabla ajena no exista en el ambiente, la columna de ATC que la referencia se crea sin `REFERENCES` y la FK llega en una migración posterior, como hizo PJ-05 con `CompanyAreaID` (D-193). Es una deuda registrada en el acta F4 (DEU-01), con su condición de cierre y su fecha.

### 4.1 Permisos que otorgan otros dueños (entregables)

El modelo de cada tabla sigue siendo de su dueño (ADR-019 de PJ-05, `adr/ADR-019-base-en-azure-y-frontera-con-gcp.md:127`): un permiso sobre una tabla ajena lo otorga su dueño, no ATC. **Revisión del 28-oct:** lo único que PJ-05 documenta de permisos son sus 4 roles `app_idn_*`; **no define ningún rol ni permiso para ATC** ni `REFERENCES` para FK ajenas. Por eso las filas que tocan a Control de acceso son **supuestos de diseño de ATC**, no entregables acordados ni pedidos pendientes: ATC no envía correos ni espera respuesta. Lo que ATC necesita lo resuelve con lo que sí existe (emisor de pruebas, simuladores, datos sintéticos, FK diferida; ED-08, ED-11) y cada fila dice qué pasa mientras no haya adaptador real. Si Control de acceso u otro dueño documenta un rol o un permiso, se pasa a ese texto. *Texto del 26-oct, superado:* «son entregables explícitos que ATC pide en el correo de solicitud a cada dueño; el de Control de acceso es parte de la DEP-16 (riesgo R-11)».

| Permiso | Sobre | Para | Lo otorga | Mientras no esté |
|---|---|---|---|---|
| *Superado (C14): sin `SELECT`, sin `GRANT`, sin rol sobre `IDN_USER_ACCOUNT`.* `SELECT` por columna (`user_account_id`, `party_id`, `account_type_id`, `account_status_id`, `username`) a `app_atc_servicio` | `IDN_USER_ACCOUNT` | `CuentaPersonaPort` (ED-01): persona del token, tipo y estado de la cuenta, correo del gestor | **Nadie definido: no está en PJ-05** (supuesto de diseño de ATC; opción entre varias, §4) | Simulador de `CuentaPersonaPort` con el emisor de pruebas y datos de prueba, solo en local (ED-08; R-11 en revisión del Líder Técnico); en PRE no hay emisor de pruebas: si Control de acceso no está en PRE para la UAT, la UAT se reprograma (R-12; revisión del Líder Técnico del 29-oct, punto 2) *(texto del 28-oct superado: «local, DEV y QA» y «en PRE, con el emisor de pruebas de ATC»)*; en producción, un adaptador real (ADR-004). *Cruce del Líder Técnico del 28-oct (C-12): el emisor de pruebas solo vale en local; la UAT del 03-nov exige Control de acceso en PRE (revisión del Líder Técnico del 29-oct, punto 6: el «DEV» del cruce del 28-oct estaba mal). R-11 y R-12 quedan en revisión; no son un riesgo aceptado por el Líder Técnico.* Adaptador definitivo: claim `party_id` (C14, S28-4) |
| `REFERENCES` a `app_atc_migracion` | `PARTY`, `ORG_COMPANY`, `MAE_BUSINESS_LINE`, `MAE_CURRENCY` | FK físicas de las tablas de ATC (DT-06) | No documentado en PJ-05 (supuesto de diseño de ATC; DEP-16) | Script de datos sintéticos en local y DEV; FK diferida en QA, PRE y producción (DEU-01) |
| `INSERT` en tablas de PJ-05 | `MAE_GENERIC_LIST_VALUE`, `MAE_CHANNEL`, `GOV_INTEGRITY_EXCEPTION` | **Ninguno (28-oct):** ATC no escribe en ellas. Sus listas, su canal y sus excepciones de integridad son propios de ATC (§3 y §5) | — | No aplica |
| `REFERENCES` e `INSERT` | `CONTRACT`, `AST_UNIT`, `CONTRACT_UNIT_HANDOVER`, `MAE_WARRANTY_COVERAGE_PERIOD`, `CONTRACT_WARRANTY_CLAIM` | FK del ticket y reclamo de garantía | Dueño del fragmento CONTRACT (DEP-07) | Ídem |
| `SELECT` | `MAE_TIME`, `MAE_HOLIDAY` | Calendario de días hábiles | Equipo Datos (DEP-04) | Calendario configurado y versionado (DEU-02) |
| `INSERT` | `SVY_SURVEY_RESPONSE` | Encuesta del ticket cerrado | Dueño del KPI Engine (DEP-10) | Simulador del KPI Engine |

## 5 Lo que ATC escribe en tablas de otro dominio

Son filas, no estructura. ATC no cambia el modelo de esas tablas (sección 1).

| Tabla | Fragmento | Qué escribe ATC | Quién crea la tabla | Estado |
|---|---|---|---|---|
| `MAE_GENERIC_LIST`, `MAE_GENERIC_LIST_VALUE` | 0 REFERENCE | **Nada (desde el 28-oct).** Las listas de ATC (`SVC_TICKET_STATUS`, `SVC_ASSIGNMENT_REASON`, `SVC_SLA_BREACH_TYPE`, `SVC_TICKET_INTERACTION_TYPE`, `SVC_COMPLAINT_APPEAL_STATUS`, la base de tiempo, el tipo de reclamo, la instancia de apelación y el estado del asiento; diccionario, «Listas de valores») van en `SVC_GENERIC_LIST` y `SVC_GENERIC_LIST_VALUE`, propias de ATC (§3) | Control de acceso (las de PJ-05); ATC (las suyas) | Supuesto de diseño de ATC: PJ-05 sella sus valores al arrancar (`PENDIENTE-RECALCULO`), numera `ListID×1000+orden` en bloques de 999 y no tiene bloque para SERVICE; las filas que ATC sembrara ahí nadie las sellaría |
| `MAE_CHANNEL` | 0 REFERENCE | **Nada (desde el 28-oct).** `MI_PORTAL` (HU-064) y los demás canales de ATC van en `SVC_CHANNEL`, propio de ATC | Control de acceso (la de PJ-05, que solo siembra `EMAIL` y `WHATSAPP` y no tiene `UNIQUE` en el código); ATC (`SVC_CHANNEL`) | Supuesto de diseño de ATC (28-oct) |
| `GOV_INTEGRITY_EXCEPTION` | 8 GOVERNANCE | **Nada (desde el 28-oct).** Las excepciones `ORPHAN_REFERENCE` (HU-015), `HASH_MISMATCH` (Q-003 del acta) y `PARALLEL_RECORD` (HU-032) se registran en la bitácora de ATC `SVC_INTEGRITY_EXCEPTION_LOG` (§3). `PARALLEL_RECORD` no existe en la lista 8005 de PJ-05; si algún día se reporta allí, se informa como `MANUAL_REPORT` | Control de acceso (E1) | Supuesto de diseño de ATC: la tabla de PJ-05 exige un `IntegrityHash` con llave KMS separada que ATC no tiene; si PJ-05 ofrece una operación que firme con su llave, ATC reportaría allí |
| `GOV_DOCUMENT_REPOSITORY` | 8 GOVERNANCE | Fila espejo de cada documento probatorio, con checksum y versión (ADR-006) | ATC, como custodio (ED-11; PJ-05 la deja para después) | Decidido (ED-11) |
| `SVY_SURVEY_RESPONSE` | PERFORMANCE-MEASUREMENT | La encuesta del ticket cerrado, por puntero polimórfico (`SubjectEntityName = 'SVC_TICKET'`, RNF-INT-004) | El dueño del KPI Engine (DEP-10; ED-11) | Decidido (ED-11) |
| `CONTRACT_WARRANTY_CLAIM` | CONTRACT | El reclamo de garantía (HU-033 a HU-036) | El dueño del fragmento CONTRACT (DEP-07; ED-11) | Escribe ATC (P-014 cerrada); migra el dueño del fragmento (ED-11) |

**ATC no escribe** en `PARTY` ni en ninguna tabla de personas: ni la Party no verificada del interesado, que crea Control de acceso al autorregistrarlo (R29, A26; ED-05). Tampoco en `IDN_SYSTEM_TASK` ni en otra tabla del fragmento 01. Las reservas del Entrega Fest no van a `EVT_ATTENDEE` ni a `EVT_TRANSPORT`, sino a `SVC_EVENT_BUS_BOOKING` (§3).

## 6 Dueño único de migración de los maestros compartidos (decidido por el equipo, ED-11)

C-11 pide un solo dueño de migración por maestro compartido. La decisión sigue la regla de PJ-05: quien crea la tabla primero la crea tal como está en el v7, es su custodio y su migración no se reescribe; quien llega después no la recrea (sección 1). ATC migra lo suyo y, como custodio, lo que nadie crea y solo ATC usa en la Etapa 1; los maestros compartidos los migra su dueño. Va en el acta F4, lista para la firma del Data Chief.

| Maestro o tabla compartida | Dueño de migración hoy | Decisión (ED-11) | Por qué |
|---|---|---|---|
| `MAE_GENERIC_LIST`, `MAE_GENERIC_LIST_VALUE`, `MAE_CHANNEL`, `MAE_CURRENCY` | Control de acceso | **Control de acceso**, para las suyas. ATC **no entrega valores** en ellas (28-oct): usa `SVC_GENERIC_LIST`, `SVC_GENERIC_LIST_VALUE` y `SVC_CHANNEL`, que migra ATC (§3) | Ya los crea en E1 (PJ-05 `analisis/decisiones.md:128`) |
| `PARTY` | Control de acceso | **Control de acceso** (y el dueño del fragmento 3 cuando llegue) | Ya la crea en E1 (`:129`); ATC no la escribe |
| `ORG_COMPANY`, `MAE_BUSINESS_LINE` | Control de acceso | **Control de acceso** | Ya los crea en E1 (`:130`) |
| `GOV_INTEGRITY_EXCEPTION` | Control de acceso | **Control de acceso.** ATC no escribe en ella (28-oct); registra en `SVC_INTEGRITY_EXCEPTION_LOG` | Ya la crea en E1 (`:132`); exige `IntegrityHash` con llave KMS separada |
| `ORG_COMPANY_ADDRESS`, `ORG_PRODUCT` | Nadie | **ATC**, tal como están en el v7, como custodio hasta que llegue el dueño del fragmento 2 | Las exige la FK física de `SVC_TICKET` (DT-06) |
| `CONTRACT`, `AST_UNIT`, `CONTRACT_UNIT_HANDOVER`, `MAE_WARRANTY_COVERAGE_PERIOD`, `CONTRACT_WARRANTY_CLAIM` | Nadie | **El dueño del fragmento CONTRACT** (Equipo Contratos, DEP-07), que también las carga. Mientras no existan en un ambiente: script sintético en local y DEV, y FK diferida en QA, PRE y producción (§4) | Sus datos vienen de Contratos; ATC solo los referencia o registra el reclamo |
| `MAE_TIME`, `MAE_HOLIDAY` | Nadie | **Equipo Datos** (DEP-04), que da el calendario; mientras no exista, `CalendarioPort` usa el **calendario configurado y versionado** (feriados nacionales de Perú), que firma la Gerencia de ATC como condición del Go/No-Go (ADR-005; DEU-02 del acta F4) | El PLT-01 ya le asigna la DEP-04 |
| `GOV_DOCUMENT_REPOSITORY` | Nadie en E1 | **ATC**, tal como está en el v7, como custodio | ATC es el primero que la necesita en la Etapa 1 (ADR-006) |
| `flyway_schema_history_atc` | — | **ATC** (la crea Flyway en su primera migración, con el rol `app_atc_migracion`) | Historial propio de ATC (sección 3.1) |
| `SVY_SURVEY_RESPONSE` | Nadie | **El dueño del KPI Engine** (Equipo Datos / BI, DEP-10) | La lee el KPI Engine |

Riesgo: igual que en PJ-05 (su R-03), ATC carga con tablas de otros dominios hasta que lleguen sus dueños. Cada una que ATC cree pasa por la puerta F4.

## 7 `MAE_AREA` y la estructura organizacional (C-07; ED-04)

- `MAE_AREA` queda **solo como cola de atención** del ticket en el dominio SERVICE: la usan `SVC_TICKET.CurrentAreaID` y `SVC_TICKET_ASSIGNMENT_LOG.AreaID`. No guarda líderes, supervisores ni personas.
- El líder o supervisor de un área **no se guarda en ATC**: es quien entra con `ATC_SUPERVISOR` con alcance sobre la cola y la empresa, y los gestores de la cola son los que muestra la bitácora de asignaciones de ATC (ED-03; solución interina, sin guardar copias de la lista de cuentas ni de su estado: S28-4 pide consultarlos por API con el token de servicio; revisión del Líder Técnico del 29-oct, punto 4).
- **En la Etapa 1 no hay correspondencia `MAE_AREA` ↔ estructura organizacional** (ED-04). La revisión del Líder Técnico la plantea contra `NEX_COMPANY_AREA`, pero esa tabla **no existe** en PJ-05: la crea su dueño de modelo (D-74) y `NEX_USER_COMPANY_ROLE.CompanyAreaID` se crea sin FK hasta entonces (D-193). C-07 se cumple igual: `MAE_AREA` es solo cola y el líder no se guarda.
- El área de cada rol de ATC es un parámetro de ATC sin personas (S-4 de `roles-y-permisos-atc.md`: `ATC_LEGAL` → `LEGAL`, `ATC_POSTVENTA` → `POSTVENTA`, `ATC_AGENT` y `ATC_SUPERVISOR` → las colas de su empresa, o todas con rol global).
- **Cruce del Líder Técnico del 28-oct (§2 punto 8; C19):** la correspondencia `MAE_AREA` ↔ `NEX_COMPANY_AREA` se lleva a Gobierno de Datos, anotando que `NEX_COMPANY_AREA` está fuera de la lista del registro §5 de PJ-05 y que la FK de `CompanyAreaID` figura «pendiente — G3 / F4» (HU-IDN-060, según el cruce).
- **Evolución:** si el dueño de NEXUS crea `NEX_COMPANY_AREA`, la correspondencia (una columna de referencia en `MAE_AREA`, opcional) se presenta a Gobierno de Datos como cambio.

| Cola en `MAE_AREA` (Excel) | Área organizacional | Decisión |
|---|---|---|
| `ATC`, `COBRANZA`, `LEGAL`, `POSTVENTA`, `TI`, `ADMINISTRACION` | Sin correspondencia en la Etapa 1 | Decidido (ED-04): la tabla de áreas organizacionales no existe |

## 8 Lo que ATC no crea, no migra ni copia (C-11)

- Las 24 tablas del fragmento 01 (identidad y acceso), entre ellas `IDN_USER_ACCOUNT`, `IDN_USER_ROLE`, `IDN_USER_SESSION` e `IDN_SYSTEM_TASK`, y los catálogos `MAE_SYSTEM_ROLE` y `MAE_MENU_OPTION`: son de Control de acceso. Quién es el usuario y sus roles salen del token (DT-03, DT-05); ~~si el adaptador de `CuentaPersonaPort` lee la cuenta (supuesto de diseño, §4; ED-01), lo hará en solo lectura y sin copia~~ (*texto superado por el cruce del Líder Técnico del 28-oct, C14: ATC no lee `IDN_USER_ACCOUNT`; `PartyID` sale del claim `party_id`*).
- `NEX_USER_COMPANY_ROLE` (roles por empresa): la administra Control de acceso.
- Tablas de sesión o de códigos de un solo uso: no hay `PORTAL_SESSION` ni códigos propios (DT-04).
- Maestro local de usuarios, roles, áreas o líderes, y su carga desde RR. HH.: no existe (DT-03, C-01).
- La tabla de áreas organizacionales: es de su dueño de modelo (D-74).
- Copias del dato del cliente: `PARTY` es la fuente viva (DT-06). Los datos mínimos del interesado sin `PARTY` viven en `SVC_TICKET_PROSPECT` solo hasta la vinculación (ED-05).

## 9 Dónde se usa este registro

- `arquitectura/migracion-y-reversion.md` §2: qué migra ATC y en qué orden.
- `datos/acta-validacion-arquitectura-datos.md`: evidencia de H-01 (dueños), H-02 (datos personales), H-03 (cambios al v7), H-04 (tipos, ED-16), H-08 (base única), H-09 (tablas firmadas), H-12, H-13 (`MAE_AREA`, ED-04), H-14 (historial de Flyway) y H-15 (permisos sobre tablas de otro dueño, §4.1), y de las deudas DEU-01 y DEU-02.
- `datos/diccionario.md`: equivalencias con el v7.

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-26 | Brayan Hurtado, con IA | Versión inicial (C-11): tablas que crea ATC, cambios al v7, tablas que solo lee, filas que escribe en otro dominio, propuesta de dueño único de migración, `MAE_AREA` como cola (C-07) y lo que ATC no crea. Citas a la copia sellada de PJ-05 |
| 0.2 | 2026-10-26 | Brayan Hurtado, con IA | Dueño de dato propuesto como rol (Gerente de ATC), no como área ni módulo. Columna «Firmada» con las 9 tablas de ADR-002 (4 del v7 y 5 bitácoras). `SVC_COMPLAINT_BOOK_ENTRY` sin datos personales en columnas (la hoja va al almacén de evidencia, ADR-003 punto 6). `SVC_SEARCH_INDEX` sale de los cambios al v7: es una colección del almacén de lectura (ADR-012 v0.4). `SVC_OUTBOX_EVENT` con `UserAccountID` (ADR-013 v0.4). Tabla de historial de Flyway propia de ATC (`flyway_schema_history_atc`, línea base 0, roles `app_atc_migracion` y `app_atc_servicio`, job aparte; sección 3.1, ADR-001 v0.4) |
| 0.3 | 2026-10-26 | Brayan Hurtado, con IA | Decisiones del equipo (`analisis/decisiones.md` v0.7): dueño de migración decidido (ED-11, §6), con script de datos sintéticos fuera de Flyway en local y DEV y FK diferida en QA, PRE y producción; lectura por columna de `IDN_USER_ACCOUNT` (ED-01, §4 y §8); `SVC_TICKET_PROSPECT` (ED-05), `SVC_TICKET_ACTIVITY` y `AutoCloseBusinessDays` (ED-15), `SVC_NOTIFICATION_LOG` y listas nuevas (ED-23, ED-26) en §3; sin las candidatas `EVT_*` y `NEX_NOTIFICATION_LOG`; `MAE_AREA` sin correspondencia en la Etapa 1 y sin la columna de área organizacional (ED-04, §7); recetas de ADR-002 (ED-16) |
| 0.4 | 2026-10-26 | Brayan Hurtado, con IA | P-025 decidida por el equipo (`analisis/decisiones.md` v0.8): `SVC_AI_SUGGESTION_LOG` (HU-048) y el caso sensible del evento (HU-037 a 039) siguen documentados como cambio al v7 y no se crean en la Etapa 1; la búsqueda vectorial de HU-053 se activa cuando entre |
| 0.5 | 2026-10-26 | Brayan Hurtado, con IA | Revisión interna del equipo del 26-oct: §4.1 con los permisos sobre tablas de otro dueño como entregables, el `SELECT` por columna sobre `IDN_USER_ACCOUNT` lo otorga Control de acceso y se pide en el correo de solicitud (O-03); purga de `SVC_TICKET_PROSPECT` (O-11); calendario configurado y versionado, no simulador (O-17); FK diferida como deuda DEU-01 (O-27); HU-043 CA-02 y CA-06 en lugar de RN-SVC-045 (O-28); fila de 5 celdas corregida (O-29); `PARALLEL_RECORD`, listas `SVC_DEFAULT_CASE_STATUS` y `SVC_DELIVERY_STATUS` y semilla del catálogo del piloto con «Validación de identidad (prospecto)» (C-06). Desde esta versión cada cambio de texto sube la versión (O-26) |
| 0.6 | 2026-10-27 | Brayan Hurtado, con IA | Sin cambio de contenido: las revisiones del 26-oct se citan como internas del equipo, no del Líder Técnico (`analisis/decisiones.md`, nota del 27-oct) |
| 0.7 | 2026-10-28 | Jesús Chávez Elías, con IA | ATC se adapta a PJ-05 (C1, C2, C3, C7, C11 de la especificación del 28-oct): §4 y §4.1 sin «el dueño otorga el `SELECT` por columna» (PJ-05 solo define 4 roles `app_idn_*`; supuesto de diseño); ATC no escribe en `MAE_GENERIC_LIST_VALUE`, `MAE_CHANNEL` ni `GOV_INTEGRITY_EXCEPTION`: listas, canal y bitácora de excepciones propios de ATC (§3, §5, §6; `PARALLEL_RECORD` solo en la propia); `shedlock_atc`; mapa documento → `PartyID` y topología de red como supuestos; §1 con roles de base, listas e `IntegrityHash`, canal, estados de cuenta y nombre no creado (H-30) |
| 0.8 | 2026-10-28 | Jesús Chávez Elías, con IA | Cruce del Líder Técnico del 28-oct (C14, C19 punto 8, C20): retirada la lectura de `IDN_USER_ACCOUNT` (§4, §4.1, §8; `PartyID` por claim `party_id`); correspondencia `MAE_AREA` ↔ `NEX_COMPANY_AREA` a Gobierno de Datos; R-11/R-12 en revisión |
| 0.9 | 2026-10-29 | Jesús Chávez Elías, con IA | revisión del Líder Técnico del 29-oct (puntos 2, 4 y 6): emisor de pruebas solo en local, sin plan B en PRE (la UAT se reprograma); UAT exige Control de acceso en PRE (no DEV); ED-03 interina sin guardar copias (S28-4 con consulta por API); R-11 en revisión |

Generado por IA: borrador completo (Claude, 26-oct-2026) a partir de la revisión del Líder Técnico del 22-oct (C-07 y C-11; DT-03, DT-04 y DT-06), el diccionario de datos de ATC y el paquete aprobado de Control de acceso (PJ-05). — Revisado por: (pendiente)

Actualizado el 26-oct-2026 (v0.2) por Brayan Hurtado con IA (Claude) a partir de las revisiones internas técnica y de coherencia del 26-oct (hallazgos 5, 16, 17, 18 y 31 de la técnica). — Revisado por: (pendiente)

Actualizado el 26-oct-2026 (v0.3) por Brayan Hurtado con IA (Claude) a partir de las decisiones del equipo del 26-oct (ED-01, ED-04, ED-05, ED-11, ED-15, ED-16, ED-23 y ED-26 de `analisis/decisiones.md` v0.7). — Revisado por: (pendiente)

Actualizado el 26-oct-2026 (v0.4) por Brayan Hurtado con IA (Claude): P-025 decidida por el equipo (`analisis/decisiones.md` v0.8); tablas que no se crean en la Etapa 1. — Revisado por: (pendiente)

Actualizado el 26-oct-2026 (v0.5) por Brayan Hurtado con IA (Claude): revisión interna del equipo (O-03, O-11, O-17, O-22, O-27, O-28 y O-29) y decisión del coordinador sobre C-06. — Revisado por: (pendiente)

Actualizado el 28-oct-2026 (v0.7) por Jesús Chávez Elías con IA (Claude): ATC se adapta a lo que documenta PJ-05 (permisos, listas, canal, excepciones de integridad, `shedlock`, mapa documento → `PartyID`), con los supuestos de diseño marcados. — Revisado por: (pendiente)

Actualizado el 28-oct-2026 (v0.8) por Jesús Chávez Elías con IA (Claude) a partir del cruce del Líder Técnico del 28-oct (C14, C19, C20). — Revisado por: (pendiente)

Actualizado el 29-oct-2026 (v0.9) por Jesús Chávez Elías con IA (Claude): revisión del Líder Técnico del 29-oct (puntos 2, 4 y 6). — Revisado por: (pendiente)
