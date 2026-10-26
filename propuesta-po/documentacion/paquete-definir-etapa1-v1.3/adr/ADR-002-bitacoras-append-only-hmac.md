---
id: "ADR-002"
tipo: "adr"
titulo: "ADR-002: Bitácoras append-only con IntegrityHash HMAC-SHA256"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.3"
owner: "Jesús Chávez Elías"
aprobadores: [tech_lead]
fecha: "2026-10-26"
relacionados: [ADR-001, ADR-005, ADR-006, ADR-012, ADR-013, ADR-014]
tags: [adr, arquitectura, g3]
---

# ADR-002: Bitácoras append-only con IntegrityHash HMAC-SHA256

- Estado: propuesto
- Ticket: AYB-0001 · Versión 0.3 · Fecha: 2026-10-26 (historial al final)
- Owner: Jesús Chávez Elías (Dev 2) · Aprueba: Líder Técnico (`aprobadores: [tech_lead]`) · Revisado por: (pendiente)
- Compatibilidad con M0 (Arquitectura de Directorio): **requiere dispensa (solicitada)**. El Líder Técnico la pidió a Enrique Albán (Data Chief) el 22-oct-2026; M0 no está en el repositorio ni en Nexora (P-005).
- Origen: convierte a la plantilla del marco el ADR-02 del PLT-05 v1.3. Incorpora las condiciones de la revisión del Líder Técnico del 22-oct-2026: llave en Key Vault con política de rotación (DT-07), receta del hash por tabla según el v7, hash encadenado, y solo inserción garantizada por la base. Registrado en `analisis/decisiones.md` v0.5 (P-007: el encadenado no figura como decisión DT; este ADR lo fija como condición del Líder Técnico y él lo aprueba).
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
   - un **usuario de aplicación que no es dueño de las tablas**: solo tiene `INSERT` y `SELECT` sobre ellas. Las migraciones Flyway corren con otro rol, dueño de los objetos, que la aplicación no usa en ejecución;
   - una corrección es una fila nueva, nunca un `UPDATE`.
2. **Estado:** par `<Campo>ListID` + `<Campo>ID` contra `MAE_GENERIC_LIST_VALUE`, no un CHECK.
3. **Qué se firma: 9 tablas.** Las 4 que firma el v7 (`SVC_TICKET`, `SVC_TICKET_INTERACTION`, `SVC_COMPLAINT_BOOK_ENTRY`, `SVC_COMPLAINT_APPEAL`) y las 5 bitácoras que pide RNF-AUD-004 (estado y asignación del ticket, estados del libro y de la apelación, y alertas de SLA). A las 5 bitácoras se les **agrega** la columna `IntegrityHash`: el v7 solo admite agregar columnas, y se presenta a Gobierno de Datos como cambio al v7 (P-031). El hash es **HMAC-SHA256**, calculado solo en la capa de aplicación.
4. **Receta por tabla según el v7.** La lista ordenada de campos que se firman va en el comentario de la columna `IntegrityHash` y es contrato (regla del v7). Como en el resto del v7, se serializan **códigos, no IDs de catálogo**, separados por `|`, y un valor nulo se serializa vacío. Las notas (`Notes_*`) no entran: no llevan datos personales (RN-SVC-012) y no son evidencia.

   | Tabla | Receta | Origen |
   |---|---|---|
   | `SVC_TICKET` | `CompanyCode\|TicketNumber\|PartyID\|TicketTypeCode\|PriorityCode\|SLAPolicyCode\|TicketStatusCode\|OpenedDateTime\|FirstResponseDueDateTime\|ResolutionDueDateTime\|ReopenedResolutionDueDateTime\|FirstRespondedDateTime\|FirstResolvedDateTime\|ReopenCount`, versión `v2` desde el 20-ago-2026 (`IntegrityHashVersion`) | v7, fragmento 10, transcrita en el Excel del PO (`03_RNF`, fila 17, columna `fragmentos`) |
   | `SVC_COMPLAINT_BOOK_ENTRY` | La del v7, que incluye la carta con cargo (RN-SVC-010) | v7, fragmento 10: se transcribe del archivo del fragmento antes de su migración (P-015) |
   | `SVC_TICKET_INTERACTION`, `SVC_COMPLAINT_APPEAL` | La del v7 | Igual (P-015) |
   | `SVC_TICKET_STATUS_LOG` | `TicketID\|TicketStatusCode\|ChangedByPartyID\|<fecha y hora del cambio>\|<hash anterior>` | Propuesta, cambio al v7 |
   | `SVC_TICKET_ASSIGNMENT_LOG` | `TicketID\|<código del área destino>\|AssignedToPartyID\|AssignedByPartyID\|<código del motivo>\|<fecha y hora>\|<hash anterior>` | Propuesta, cambio al v7 |
   | `SVC_COMPLAINT_BOOK_ENTRY_STATUS_LOG` | `TicketID\|<código del estado del asiento>\|ChangedByPartyID\|<fecha y hora>\|<hash anterior>` | Propuesta, cambio al v7 |
   | `SVC_COMPLAINT_APPEAL_STATUS_LOG` | `ComplaintAppealID\|AppealStatusCode\|ChangedByPartyID\|<fecha y hora>\|<hash anterior>` | Propuesta, cambio al v7 |
   | `SVC_SLA_BREACH_ALERT` | `TicketID\|BreachTypeCode\|ReopenCycleNumber\|EvaluatedDueDateTime\|AlertedPartyID\|ChannelCode\|<hash anterior>` | Propuesta, cambio al v7 (clave única de RN-SVC-008) |

   Los nombres entre `< >` son columnas no clave que el equipo no tiene del v7 (P-015): se escriben con su nombre exacto antes de la migración. Los `*PartyID` del autor dependen de cómo obtenga ATC el `PartyID` del gestor, que el token no trae (P-033); un cambio automático deja el autor vacío (HU-004 CA-03).
5. **Encadenado (condición del Líder Técnico del 22-oct):** en las 5 bitácoras, el hash de cada fila incluye el hash de la fila anterior **de la misma entidad** (el mismo ticket, el mismo asiento o la misma apelación; la primera fila encadena con el valor fijo `GENESIS`), no una cadena global. Con una cadena global, todas las escrituras tendrían que esperar a la anterior. Así, borrar o reordenar una fila rompe la cadena de su entidad y lo detecta la verificación. Las 4 entidades del v7 se actualizan y se vuelven a firmar en cada cambio; su historia la guardan las bitácoras encadenadas.
6. **Llave en Azure Key Vault** (DT-07), nunca en el código ni en el repositorio. **Política de rotación (propuesta del equipo, la confirma el Líder Técnico):** rotación anual y ante cualquier sospecha de exposición; las versiones anteriores se conservan para verificar las filas viejas. Para saber con qué versión se firmó cada fila, el identificador de versión de la llave va **dentro del propio texto del hash** (`<versión de la llave>:<HMAC en hexadecimal>`), sin columna nueva en el v7. `aybar-starter-config` carga los secretos de Key Vault por nombre (la versión vigente); leer las versiones anteriores para verificar exige el cliente de Key Vault por versión en el adaptador de verificación (hueco del SDK, P-032).
7. **Verificación:** un job diario (ShedLock, ADR-005) recalcula y compara; `hash_mismatch` = 0 en las 9 tablas (Q-003). Un incidente de integridad es S1.

**Conciliación con el v7:** RNF-AUD-004 pide firmar las 5 bitácoras y el v7 firma otras 4 entidades. Se firman las 9 (punto 3); Gobierno de Datos confirma la columna nueva en las 5 bitácoras (P-031).

## Consecuencias

- Obliga a:
  - Construir la bitácora, el cálculo del hash, el encadenado y la verificación: el SDK no los trae (12 h, tabla del ADR-012; P-025).
  - Transcribir del v7 las recetas de `SVC_COMPLAINT_BOOK_ENTRY`, `SVC_TICKET_INTERACTION` y `SVC_COMPLAINT_APPEAL` y los nombres de las columnas `< >` antes de la primera migración (P-015).
  - Custodiar la llave en Azure Key Vault (ADR-014) y probar la rotación: el SDK soporta `aybar.secretos.proveedor=azure`, pero la lectura de versiones anteriores de la llave debe verificarse (P-032).
  - Dos roles de base de datos (dueño de migraciones y usuario de aplicación) y el trigger en cada una de las 5 bitácoras.
  - Una regla de verificación periódica en la batería de calidad de datos (F10).
- Impide:
  - Corregir una fila existente: una corrección es una fila nueva.
  - Que la aplicación pueda actualizar o borrar una bitácora aunque tenga un fallo de código.
- Cuesta: **12 h** de bitácoras, hash encadenado, triggers y verificación (tabla del ADR-012; P-025) y **USD 0,15 al mes por ambiente** de Azure Key Vault (50.000 operaciones al mes con caché, `arquitectura/costo-cloud.md` v0.3 (API de precios de Azure del 26-oct-2026, USD por mes, región base Brazil South; supuestos de región, volumen y tamaño en P-044), §1.1 y §2.1), más la operación de la rotación anual de la llave.

## Datos (puerta F4 de Gobierno de Datos)

- Entidades firmadas: las 4 del v7 (`SVC_TICKET` ENT-SVC-001, `SVC_TICKET_INTERACTION` ENT-SVC-004, `SVC_COMPLAINT_BOOK_ENTRY` ENT-SVC-010, `SVC_COMPLAINT_APPEAL` ENT-SVC-012) y las 5 que pide RNF-AUD-004, con la columna `IntegrityHash` agregada como cambio al v7: `SVC_TICKET_STATUS_LOG` (ENT-SVC-002), `SVC_TICKET_ASSIGNMENT_LOG` (ENT-SVC-003), `SVC_COMPLAINT_BOOK_ENTRY_STATUS_LOG` (ENT-SVC-011), `SVC_COMPLAINT_APPEAL_STATUS_LOG` (ENT-SVC-013) y `SVC_SLA_BREACH_ALERT` (ENT-SVC-009). Dueño de dato por asignar (H-01 del acta F4).
- Linaje: acción del gestor o job de SLA → módulo `tickets`, `sla` o `complaintbook` → bitácora.
- PII: solo referencias a `PARTY` (`ChangedByPartyID`, `AssignedToPartyID`); sin datos personales en la bitácora.

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-19 | Jesús Chávez Elías, con IA | Borrador |
| 0.1 (v4 en Nexora) | 2026-10-21 | Brayan, con IA | 5 bitácoras firmadas según RNF-AUD-004 |
| 0.2 | 2026-10-22 | Jesús Chávez Elías, con IA | Condiciones del Líder Técnico: llave en Key Vault con rotación, receta por tabla (pendiente de transcribir del v7), hash encadenado por entidad, trigger que rechaza `UPDATE`/`DELETE` y usuario de aplicación sin ser dueño |
| 0.3 | 2026-10-26 | Brayan Hurtado, con IA | Tablas firmadas según el libro del v7 (4) más las 5 de RNF-AUD-004; receta por tabla: la de `SVC_TICKET` del v7 y las de las bitácoras como cambio al v7; formato de la versión de la llave y lectura de versiones anteriores (P-032); costo con número y fuente |

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v4 de Nexora; actualizado con IA (Claude, 2026-10-22) a partir de la revisión del Líder Técnico del 22-oct y (Claude, 2026-10-26). — Revisado por: (pendiente) · Aprueba: TL
