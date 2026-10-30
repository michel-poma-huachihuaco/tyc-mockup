---
id: "ADR-002"
tipo: "adr"
titulo: "ADR-002: Bitácoras append-only con IntegrityHash HMAC-SHA256"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.8"
owner: "Jesús Chávez Elías"
aprobadores: [tech_lead]
fecha: "2026-10-28"
relacionados: [ADR-001, ADR-005, ADR-006, ADR-012, ADR-013, ADR-014]
tags: [adr, arquitectura, g3]
---

# ADR-002: Bitácoras append-only con IntegrityHash HMAC-SHA256

- Estado: propuesto
- Ticket: AYB-0001 · Versión 0.8 · Fecha: 2026-10-28 (historial al final)
- Owner: Jesús Chávez Elías (Dev 2) · Aprueba: Líder Técnico (`aprobadores: [tech_lead]`) · Revisado por: Brayan Manuel Hurtado Paucar, 26-oct-2026
- Compatibilidad con M0 (Arquitectura de Directorio): **requiere dispensa (solicitada)**. El Líder Técnico la pidió a Enrique Albán (Data Chief) el 22-oct-2026; M0 no está en el repositorio ni en Nexora. La dispensa es una firma, no una condición del contenido (P-005, ED-25).
- Origen: convierte a la plantilla del marco el ADR-02 del PLT-05 v1.3. Incorpora las condiciones de la revisión del Líder Técnico del 22-oct-2026: llave en Key Vault con política de rotación (DT-07), receta del hash por tabla según el v7, hash encadenado, y solo inserción garantizada por la base. Registrado en `analisis/decisiones.md`. El encadenado es condición del Líder Técnico y queda como decisión del equipo (P-007, ED-13).
- Alineado con el modelo de datos corporativo v7: las bitácoras son las del fragmento SERVICE (con PK propia y una fila por cambio), el estado es un par de columnas contra `MAE_GENERIC_LIST_VALUE` y el hash es el del modelo corporativo (HMAC-SHA256, llave en el gestor de llaves, receta por tabla).
- Según el Excel del PO (RNF-AUD-004, hoja `03_RNF`, fila 17; también en el PLT-03 v1.3), las bitácoras append-only firmadas son **5**: estado y asignación del ticket, libro, apelación y alertas de SLA.

## Contexto

Los cambios de estado y las asignaciones de un ticket son evidencia ante INDECOPI y en auditoría (RNF-AUD-004). El modelo corporativo v7 define en SERVICE `SVC_TICKET_STATUS_LOG` y `SVC_TICKET_ASSIGNMENT_LOG`, más los historiales del libro y de la apelación (`SVC_COMPLAINT_BOOK_ENTRY_STATUS_LOG` y `SVC_COMPLAINT_APPEAL_STATUS_LOG`). Según el libro del modelo v7 (`AybarCorp_Modelo_Entidad_Relacion_v7.xlsx`, hoja «Entidades», columna «Firmada»), las 4 entidades firmadas con `IntegrityHash` del fragmento son `SVC_TICKET`, `SVC_TICKET_INTERACTION`, `SVC_COMPLAINT_BOOK_ENTRY` y `SVC_COMPLAINT_APPEAL`; las 5 bitácoras no están firmadas en el v7. El Excel del PO pide **5**: las cuatro anteriores y las alertas (`SVC_SLA_BREACH_ALERT`), con `LastChangeLogFile` (diff en el almacén de evidencia) en toda entidad. El mismo Excel trae la receta v2 del `IntegrityHash` con campos del ticket y mete la carta del asiento en el hash (RN-SVC-010). El SDK trae una auditoría técnica (`aybar-starter-audit`) con lista blanca de datos personales, pero sin hash de integridad: no es esta bitácora.

## Opciones evaluadas

| Opción | Por qué no | Qué la haría reconsiderar |
|---|---|---|
| Bitácora editable con la auditoría genérica del SDK | No permite probar que un registro no fue alterado; la auditoría del SDK es una traza técnica, sin hash y sin los campos de negocio. | Que Legal acepte una traza sin prueba de integridad. |
| Hash simple (sin clave) por fila | Quien tenga acceso a la base puede recalcular el hash tras alterar una fila. | Que la clave no se pueda custodiar por entorno. |
| HMAC por fila sin encadenar | Permite borrar una fila entera sin que el hash de las demás cambie. | — |

## Decisión

1. **Solo inserción, garantizada por la base y no solo por la aplicación.** Las bitácoras de SERVICE (estado y asignación del ticket, estados del libro y de la apelación, y alertas de SLA) tienen:
   - un **trigger** `BEFORE UPDATE OR DELETE` que lanza una excepción;
   - un **usuario de aplicación que no es dueño de las tablas** (`app_atc_servicio`): solo tiene `INSERT` y `SELECT` sobre ellas. Las migraciones Flyway corren en un job aparte con el rol dueño (`app_atc_migracion`), que la aplicación no usa en ejecución (ADR-001, punto 5);
   - una corrección es una fila nueva, nunca un `UPDATE`.
2. **Estado:** par `<Campo>ListID` + `<Campo>ID` contra `MAE_GENERIC_LIST_VALUE`, no un CHECK.
3. **Qué se firma: 9 tablas.** Las 4 que firma el v7 (`SVC_TICKET`, `SVC_TICKET_INTERACTION`, `SVC_COMPLAINT_BOOK_ENTRY`, `SVC_COMPLAINT_APPEAL`) y las 5 bitácoras que pide RNF-AUD-004 (estado y asignación del ticket, estados del libro y de la apelación, y alertas de SLA). A las 5 bitácoras se les **agrega** la columna `IntegrityHash`: el v7 solo admite agregar columnas, y va como cambio al v7 en el acta F4, lista para la firma del Data Chief (P-031, ED-23). El hash es **HMAC-SHA256**, calculado solo en la capa de aplicación, y se guarda como el v7: 64 caracteres hexadecimales en `IntegrityHash`.
4. **Cómo se arma el texto que se firma (igual en las 9 tablas).** La lista ordenada de campos de cada tabla va en el comentario de su columna `IntegrityHash` y es contrato (regla del v7):
   - los campos van en el orden de la receta, separados por `|`, y un valor nulo se escribe vacío;
   - un catálogo entra por su **código** (`…Code`, el de `MAE_GENERIC_LIST_VALUE` o el del maestro), nunca por su ID, y la empresa por `CompanyCode`, nunca por `CompanyID`, como manda el contrato de hash del v7 (libro del v7, hoja «Entidades», fila de `ORG_COMPANY`); las entidades entran por su ID, como `PartyID` en la receta del v7 de `SVC_TICKET`;
   - fecha y hora en ISO-8601 UTC con milisegundos (`2026-10-26T14:05:09.123Z`); fecha sola, `AAAA-MM-DD`; booleano, `true` o `false`; importe, con punto y 2 decimales;
   - el texto libre y los documentos entran por su **SHA-256** en hexadecimal: así un `|` dentro del texto no cambia los campos, y un documento probatorio entra con el mismo checksum que guarda `GOV_DOCUMENT_REPOSITORY` (ADR-006). `SHA256(evidencia)` es el SHA-256 de los checksums de los adjuntos, en orden y separados por `|`;
   - las notas (`Notes_*`) no entran: no llevan datos personales (RN-SVC-012) y no son evidencia;
   - `CreatedDate` (columna de auditoría que tienen todas las tablas del v7) la fija la aplicación antes del `INSERT`, con el mismo valor que firma; las bitácoras no se actualizan nunca, así que no hace falta conocer su ID antes de insertar;
   - `PrevHash` es el `IntegrityHash` de la fila anterior de la misma cadena (punto 5) o el texto fijo `GENESIS` en la primera.

   | Tabla | Receta (orden de los campos) | Origen |
   |---|---|---|
   | `SVC_TICKET` | `CompanyCode\|TicketNumber\|PartyID\|TicketTypeCode\|PriorityCode\|SLAPolicyCode\|TicketStatusCode\|OpenedDateTime\|FirstResponseDueDateTime\|ResolutionDueDateTime\|ReopenedResolutionDueDateTime\|FirstRespondedDateTime\|FirstResolvedDateTime\|ReopenCount`, versión `v2` desde el 20-ago-2026 (`IntegrityHashVersion`) | **Literal del v7** (fragmento 10), transcrita en el Excel del PO (`03_RNF`, fila 17, columna `fragmentos`) |
   | `SVC_TICKET_INTERACTION` | `TicketID\|ChannelCode\|InteractionTypeCode\|AgentPartyID\|IsVisibleToCustomer\|CreatedDate\|SHA256(texto de la interacción)\|SHA256(evidencia)` | Firmada en el v7. Claves del libro del v7 (hoja «Claves»); `IsVisibleToCustomer` del Excel (RF-SVC-005); la evidencia va dentro de la interacción (Excel) |
   | `SVC_COMPLAINT_BOOK_ENTRY` | `TicketID\|CompanyCode\|CompanyAddressID\|ComplaintBookNumber\|ComplaintTypeCode\|ClaimedAmount\|CurrencyCode\|ComplaintRegistrationDate\|LegalResponseDueDate\|IsResponseExtended\|ExtendedResponseDueDate\|ExtensionCommunicatedDate\|ExtensionCommunicationChannelCode\|CompanyResponseDate\|SHA256(carta de respuesta con cargo)\|ResponderPartyID\|CustomerNotifiedOfIndecopiRight\|ComplaintStatusCode\|ClosedByPartyID` | Firmada en el v7. Claves y restricciones del libro del v7 (hojas «Claves» e «Integridad fisica»: `UNIQUE (CompanyID, CompanyAddressID, ComplaintBookNumber)` y los CHECK del plazo); fechas, importe y carta del Excel (RF-SVC-012 a 014). La carta con cargo entra al hash (RN-SVC-010) |
   | `SVC_COMPLAINT_APPEAL` | `TicketID\|AppealLevelCode\|AppealStatusCode\|IndecopiCaseNumber\|CreatedDate\|SHA256(resolución de la apelación)` | Firmada en el v7. Claves del libro del v7; `IndecopiCaseNumber` del Excel (RF-SVC-016); la resolución, documento probatorio con espejo en `GOV_DOCUMENT_REPOSITORY` (RNF-CUM-007) |
   | `SVC_TICKET_STATUS_LOG` | `TicketID\|TicketStatusCode\|ChangedByPartyID\|CreatedDate\|PrevHash` | Cambio al v7 (columna `IntegrityHash` nueva). Claves del libro del v7 |
   | `SVC_TICKET_ASSIGNMENT_LOG` | `TicketID\|AreaCode\|AssignedToPartyID\|AssignmentReasonCode\|AssignedByPartyID\|CreatedDate\|PrevHash` | Cambio al v7. Claves del libro del v7 |
   | `SVC_COMPLAINT_BOOK_ENTRY_STATUS_LOG` | `TicketID\|ComplaintStatusCode\|ChangedByPartyID\|CreatedDate\|PrevHash` | Cambio al v7. Claves del libro del v7 |
   | `SVC_COMPLAINT_APPEAL_STATUS_LOG` | `ComplaintAppealID\|AppealStatusCode\|ChangedByPartyID\|CreatedDate\|PrevHash` | Cambio al v7. Claves del libro del v7 |
   | `SVC_SLA_BREACH_ALERT` | `TicketID\|BreachTypeCode\|ReopenCycleNumber\|EvaluatedDueDateTime\|SLAPolicyCode\|AlertedPartyID\|ChannelCode\|CreatedDate\|PrevHash` | Cambio al v7. Claves del libro del v7; `ReopenCycleNumber` y `EvaluatedDueDateTime` del Excel (RN-SVC-008, RF-SVC-010) |

   Las 5 bitácoras y las 3 entidades firmadas que no son `SVC_TICKET` usan solo columnas que nombran el libro del v7 o el Excel del PO, más `CreatedDate`. La receta de `SVC_TICKET` es la literal del v7. **Las recetas de `SVC_TICKET_INTERACTION`, `SVC_COMPLAINT_BOOK_ENTRY` y `SVC_COMPLAINT_APPEAL` son las de esta tabla, por decisión del equipo** (P-015, ED-16): el libro del v7 que tiene el equipo (`AybarCorp_Modelo_Entidad_Relacion_v7.xlsx`) no trae otra receta ni una hoja de atributos, y estas siguen las mismas reglas que la literal de `SVC_TICKET`. Cada receta va en el comentario de su columna `IntegrityHash` y es contrato. Los `*PartyID` del autor son el `PartyID` del colaborador, que ATC obtiene de la cuenta del token con `CuentaPersonaPort` (cruce del Líder Técnico del 28-oct: por el claim `party_id` del token, solicitud S28-4, hoy simulador; ATC no lee `IDN_USER_ACCOUNT`. *Texto superado:* «vínculo `IDN_USER_ACCOUNT`, ED-01»); un cambio automático deja el autor vacío (HU-004 CA-03).
5. **Encadenado (condición del Líder Técnico del 22-oct):** en las 5 bitácoras, el hash de cada fila incluye el de la fila anterior **de la misma entidad** (`PrevHash`): el mismo ticket en `SVC_TICKET_STATUS_LOG`, `SVC_TICKET_ASSIGNMENT_LOG` y `SVC_SLA_BREACH_ALERT`; el mismo asiento en `SVC_COMPLAINT_BOOK_ENTRY_STATUS_LOG`; la misma apelación en `SVC_COMPLAINT_APPEAL_STATUS_LOG`. Es una cadena por entidad y no una global: con una global, todas las escrituras esperarían a la anterior. Borrar, cambiar o reordenar una fila rompe la cadena de su entidad y lo detecta la verificación. Las 4 entidades del v7 se actualizan y se vuelven a firmar en cada cambio; su historia la guardan las bitácoras encadenadas.
   - **Sin bifurcaciones:** dos inserciones de la misma entidad no pueden leer el mismo `PrevHash`. Cada inserción toma primero, en su transacción, `SELECT … FOR UPDATE` sobre la fila de la entidad padre (`SVC_TICKET`, `SVC_COMPLAINT_BOOK_ENTRY` o `SVC_COMPLAINT_APPEAL`), lee el `IntegrityHash` de la última fila de la cadena y recién entonces inserta. Las escrituras del mismo ticket se ordenan y las de tickets distintos no se esperan. Una prueba de integración lanza dos escrituras a la vez sobre el mismo ticket y comprueba que la cadena queda lineal.
   - **Ancla del final de la cadena:** una cadena a la que le borran las últimas filas sigue siendo válida en sí misma. Por eso la verificación diaria hace dos controles más. (a) La última fila de cada cadena de estado coincide con el estado firmado de su entidad: `TicketStatusCode` de `SVC_TICKET`, `ComplaintStatusCode` del asiento y `AppealStatusCode` de la apelación. (b) Cada día deja un **punto de control** por cadena (tabla, entidad, cantidad de filas y último hash), firmado con la misma llave, en Azure Blob Storage con inmutabilidad (ADR-006). Al día siguiente comprueba que cada cadena todavía contiene ese hash y no tiene menos filas. Así se detecta un borrado del final aunque alguien se salte el trigger con el rol dueño, sin agregar columnas al v7.
6. **Llave en Azure Key Vault** (DT-07), nunca en el código ni en el repositorio. **Política de rotación (decisión del equipo):** rotación anual y ante cualquier sospecha de exposición; las versiones anteriores se conservan en Key Vault para verificar las filas viejas. **El formato de `IntegrityHash` no cambia**: guarda solo el HMAC, como en el v7, también en `GOV_DOCUMENT_REPOSITORY`, que es tabla ajena. Para verificar, el job prueba la versión vigente de la llave y, si no coincide, las anteriores (con rotación anual son pocas); una fila que no coincide con ninguna es `HASH_MISMATCH`. `aybar-starter-config` carga los secretos de Key Vault por nombre (la versión vigente). Para leer las versiones anteriores, el adaptador de verificación usa el cliente de Key Vault por versión (`azure-security-keyvault-secrets`, que gobierna el `azure-sdk-bom` del SDK 0.7.1; así se cierra ese hueco del SDK, P-032, ED-24). La columna es `varchar(64)`, la convención del diccionario aprobado de PJ-05 en la misma base única (ED-16). La receta de `GOV_DOCUMENT_REPOSITORY` es la del v7; mientras ATC sea su custodio (ED-11), la firma con su llave de Key Vault.
7. **Verificación:** un job diario (ShedLock, ADR-005) recalcula y compara las 9 tablas, revisa las cadenas y los puntos de control del punto 5, y registra cada diferencia en `GOV_INTEGRITY_EXCEPTION` (`HASH_MISMATCH`). Regla de calidad: `hash_mismatch` = 0 en las 9 tablas (Q-003). Un incidente de integridad es S1.

**Conciliación con el v7:** RNF-AUD-004 pide firmar las 5 bitácoras y el v7 firma otras 4 entidades. Se firman las 9 (punto 3); la columna nueva en las 5 bitácoras va en el acta F4, lista para la firma del Data Chief (P-031, ED-23).

## Consecuencias

- Obliga a:
  - Construir la bitácora, el cálculo del hash, el encadenado y la verificación: el SDK no los trae; van dentro de las horas que el PO estimó para HU-004, HU-006 y HU-012 (tabla del ADR-012).
  - Escribir la receta de cada una de las 9 tablas en el comentario de su columna `IntegrityHash` (punto 4; ED-16).
  - Custodiar la llave en Azure Key Vault (ADR-014) y probar la rotación: el SDK soporta `aybar.secretos.proveedor=azure`; la verificación con versiones anteriores de la llave usa el cliente de Key Vault por versión (ED-24).
  - Dos roles de base de datos (`app_atc_migracion` y `app_atc_servicio`, ADR-001) y el trigger en cada una de las 5 bitácoras.
  - El bloqueo de la fila padre al insertar en una bitácora y el punto de control diario en Blob Storage (punto 5).
  - Una regla de verificación periódica en la batería de calidad de datos (F10).
- Impide:
  - Corregir una fila existente: una corrección es una fila nueva.
  - Que la aplicación pueda actualizar o borrar una bitácora aunque tenga un fallo de código.
- Cuesta: **0 h fuera del plan del PO**: bitácoras, hash encadenado, bloqueo de la fila padre, triggers, roles de base y verificación con punto de control van dentro de las horas que el PO estimó para HU-004, HU-006 y HU-012 (ADR-02 del PO; tarea HU-ATC-004-T01; tabla del ADR-012). **USD 0,15 al mes por ambiente** de Azure Key Vault, USD 0,60 en los 4 ambientes (50.000 operaciones al mes con caché; `arquitectura/costo-cloud.md`, §1.1 y §2.1: API pública de precios de Azure del 26-oct-2026, USD por mes, Brazil South; supuestos fijados en ED-12). Los puntos de control diarios pesan kilobytes en el Blob Storage ya costeado (ADR-006). Más la operación de la rotación anual de la llave.

## Datos (puerta F4 de Gobierno de Datos)

- Entidades firmadas: las 4 del v7 (`SVC_TICKET` ENT-SVC-001, `SVC_TICKET_INTERACTION` ENT-SVC-004, `SVC_COMPLAINT_BOOK_ENTRY` ENT-SVC-010, `SVC_COMPLAINT_APPEAL` ENT-SVC-012) y las 5 que pide RNF-AUD-004, con la columna `IntegrityHash` agregada como cambio al v7: `SVC_TICKET_STATUS_LOG` (ENT-SVC-002), `SVC_TICKET_ASSIGNMENT_LOG` (ENT-SVC-003), `SVC_COMPLAINT_BOOK_ENTRY_STATUS_LOG` (ENT-SVC-011), `SVC_COMPLAINT_APPEAL_STATUS_LOG` (ENT-SVC-013) y `SVC_SLA_BREACH_ALERT` (ENT-SVC-009). Dueño de dato: el rol que fija `datos/registro-de-tablas.md` §2 (Gerente de ATC); el acta F4 queda lista para la firma del Data Chief (H-01).
- Linaje: acción del gestor o job de SLA → módulo `tickets`, `sla` o `complaintbook` → bitácora.
- PII: solo referencias a `PARTY` (`ChangedByPartyID`, `AssignedToPartyID`); sin datos personales en la bitácora.

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-19 | Jesús Chávez Elías, con IA | Borrador |
| 0.1 (v4 en Nexora) | 2026-10-21 | Brayan, con IA | 5 bitácoras firmadas según RNF-AUD-004 |
| 0.2 | 2026-10-22 | Jesús Chávez Elías, con IA | Condiciones del Líder Técnico: llave en Key Vault con rotación, receta por tabla (pendiente de transcribir del v7), hash encadenado por entidad, trigger que rechaza `UPDATE`/`DELETE` y usuario de aplicación sin ser dueño |
| 0.3 | 2026-10-26 | Brayan Hurtado, con IA | Tablas firmadas según el libro del v7 (4) más las 5 de RNF-AUD-004; receta por tabla: la de `SVC_TICKET` del v7 y las de las bitácoras como cambio al v7; formato de la versión de la llave y lectura de versiones anteriores (P-032); costo con número y fuente |
| 0.4 | 2026-10-26 | Brayan Hurtado, con IA | Revisión interna del equipo: receta completa de las 9 tablas, sin columnas sin nombre, con reglas comunes de serialización (fecha de `CreatedDate`, texto y documentos por SHA-256); dueño y momento para contrastar con la literal del v7 (P-015); `SELECT … FOR UPDATE` sobre la fila padre para que la cadena no se bifurque; ancla del final de la cadena (estado firmado de la entidad y punto de control diario en Blob Storage); `IntegrityHash` sin cambio de formato (la verificación prueba las versiones de la llave); roles de base de ADR-001; dueño de dato remitido al registro; costo de los 4 ambientes |
| 0.4 | 2026-10-26 | Brayan Hurtado, con IA | Barrido de coherencia (misma versión, sin cambio de decisión): el origen cita `analisis/decisiones.md` v0.6, la versión vigente (decía v0.5). |
| 0.5 | 2026-10-26 | Brayan Hurtado, con IA | Decisiones del equipo del 26-oct (`analisis/decisiones.md` v0.7): encadenado como decisión (ED-13); las recetas de las 3 entidades del v7 que no son `SVC_TICKET` son las de este ADR, sin contraste pendiente (ED-16); `IntegrityHash` `varchar(64)`; autor por `CuentaPersonaPort` (ED-01); rotación anual decidida; lectura de versiones de la llave (ED-24); columna nueva en el acta F4 (ED-23); horas dentro de HU-004, 006 y 012; supuestos del costo en ED-12 |
| 0.6 | 2026-10-26 | Brayan Hurtado, con IA | Revisión interna del equipo del 26-oct: sin cambio de decisión. Citas a documentos del paquete sin número de versión, que lo fija Nexora (O-22). Desde esta versión cada cambio de texto sube la versión; las filas repetidas del historial se conservan como registro (O-26) |
| 0.7 | 2026-10-27 | Brayan Hurtado, con IA | Sin cambio de contenido: las revisiones del 26-oct se citan como internas del equipo, no del Líder Técnico (`analisis/decisiones.md`, nota del 27-oct) |
| 0.8 | 2026-10-28 | Jesús Chávez Elías, con IA | Cruce del Líder Técnico del 28-oct (C14): el `PartyID` del autor sale del claim `party_id` (S28-4), no de `IDN_USER_ACCOUNT` |

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v4 de Nexora; actualizado con IA (Claude, 2026-10-22) a partir de la revisión del Líder Técnico del 22-oct y (Claude, 2026-10-26). — Revisado por: Brayan Manuel Hurtado Paucar, 26-oct-2026 · Aprueba: TL

Actualizado el 28-oct-2026 (v0.8) por Jesús Chávez Elías con IA (Claude): cruce del Líder Técnico del 28-oct (`PartyID` por claim `party_id`, sin lectura de `IDN_USER_ACCOUNT`). — Revisado por: (pendiente)
