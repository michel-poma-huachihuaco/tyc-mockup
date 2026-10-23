---
id: "ADR-002"
tipo: "adr"
titulo: "ADR-002: Bitácoras append-only con IntegrityHash HMAC-SHA256"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.2"
owner: "Jesús Chávez Elías"
aprobadores: [tech_lead]
fecha: "2026-10-22"
relacionados: [ADR-001, ADR-006, ADR-012, ADR-013, ADR-014]
tags: [adr, arquitectura, g3]
---

# ADR-002: Bitácoras append-only con IntegrityHash HMAC-SHA256

- Estado: propuesto
- Ticket: AYB-0001 · Fecha: 2026-10-22
- Compatibilidad con M0 (Arquitectura de Directorio): **requiere dispensa (solicitada)**. El Líder Técnico la pide a Enrique Albán (Data Chief); M0 no está en el repositorio.
- Origen: convierte a la plantilla del marco el ADR-02 del PLT-05 v1.3. Incorpora las condiciones de la revisión del Líder Técnico del 22-oct-2026: llave en Key Vault con política de rotación (DT-07), receta del hash por tabla según el v7, hash encadenado, y solo inserción garantizada por la base. Registrado en `analisis/decisiones.md` v0.3 (P-007: el encadenado no figura como decisión DT; el Líder Técnico debe fijarlo).
- Alineado con el modelo de datos corporativo v7: las bitácoras son las del fragmento SERVICE (con PK propia y una fila por cambio), el estado es un par de columnas contra `MAE_GENERIC_LIST_VALUE` y el hash es el del modelo corporativo (HMAC-SHA256, llave en el gestor de llaves, receta por tabla).
- Según el Excel del PO (RNF-AUD-004, también en el PLT-03 v1.3), las bitácoras append-only firmadas son **5**: estado y asignación del ticket, libro, apelación y alertas de SLA.

## Contexto

Los cambios de estado y las asignaciones de un ticket son evidencia ante INDECOPI y en auditoría (RNF-AUD-004). El modelo corporativo v7 define en SERVICE `SVC_TICKET_STATUS_LOG` y `SVC_TICKET_ASSIGNMENT_LOG`, más los historiales del libro y de la apelación (`SVC_COMPLAINT_BOOK_ENTRY_STATUS_LOG` y `SVC_COMPLAINT_APPEAL_STATUS_LOG`), y declara 4 entidades firmadas con `IntegrityHash` en el fragmento, sin decir cuáles. El Excel del PO pide **5**: las cuatro anteriores y las alertas (`SVC_SLA_BREACH_ALERT`), con `LastChangeLogFile` (diff en el almacén de evidencia) en toda entidad. El mismo Excel trae la receta v2 del `IntegrityHash` con campos del ticket y mete la carta del asiento en el hash (RN-SVC-010). El SDK trae una auditoría técnica (`aybar-starter-audit`) con lista blanca de datos personales, pero sin hash de integridad: no es esta bitácora.

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
3. **Hash:** las tablas que RNF-AUD-004 pide firmar llevan un `IntegrityHash` con **HMAC-SHA256**, calculado solo en la capa de aplicación.
4. **Receta por tabla:** la lista ordenada de campos que se firman va escrita en el comentario de la columna `IntegrityHash` y es contrato (regla del v7). La receta de cada una de las 5 tablas se transcribe del v7 y del Excel (receta v2, con la carta del asiento incluida, RN-SVC-010); **ese texto está en los archivos de Drive del v7 que el equipo no tiene** (P-015). La receta no se inventa: se anota tabla por tabla antes de la migración.
5. **Encadenado (condición del Líder Técnico del 22-oct):** el hash de cada fila incluye el hash de la fila anterior **de la misma entidad** (el mismo ticket, el mismo asiento o la misma apelación), no una cadena global. Con una cadena global, todas las escrituras tendrían que esperar a la anterior. Así, borrar o reordenar una fila rompe la cadena de su entidad y lo detecta la verificación.
6. **Llave en Azure Key Vault** (DT-07), nunca en el código ni en el repositorio. **Política de rotación (propuesta del equipo, la confirma el Líder Técnico):** rotación anual y ante cualquier sospecha de exposición; las versiones anteriores se conservan para verificar las filas viejas. Para saber con qué versión se firmó cada fila, el identificador de versión de la llave va **dentro del propio texto del hash**, sin columna nueva en el v7.
7. **Verificación:** un job (ShedLock, ADR-005) recalcula y compara; `hash_mismatch` = 0 en las 5 bitácoras (Q-003). Un incidente de integridad es S1.

**Conciliación pendiente:** RNF-AUD-004 pide firmar 5 y el v7 declara 4 firmadas en SERVICE. Se concilia con Gobierno de Datos y el diccionario del v7.

## Consecuencias

- Obliga a:
  - Construir la bitácora, el cálculo del hash, el encadenado y la verificación: el SDK no los trae. Horas: **por estimar (P-025, ADR-012)**.
  - Escribir la receta de cada tabla firmada antes de la primera migración (punto 4).
  - Custodiar la llave en Azure Key Vault (ADR-014) y probar la rotación: el SDK soporta `aybar.secretos.proveedor=azure`, pero la lectura de versiones anteriores de la llave debe verificarse (P-032).
  - Dos roles de base de datos (dueño de migraciones y usuario de aplicación) y el trigger en cada una de las 5 tablas.
  - Una regla de verificación periódica en la batería de calidad de datos (F10).
- Impide:
  - Corregir una fila existente: una corrección es una fila nueva.
  - Que la aplicación pueda actualizar o borrar una bitácora aunque tenga un fallo de código.
- Cuesta: horas sin estimar (P-025) y la operación de la llave (rotación anual). Costo cloud: el de Key Vault, en `arquitectura/costo-cloud.md` cuando haya volúmenes.

## Datos (puerta F4 de Gobierno de Datos)

- Entidades que RNF-AUD-004 pide firmar (nombre del v7 e ID del Excel): `SVC_TICKET_STATUS_LOG` (ENT-SVC-002), `SVC_TICKET_ASSIGNMENT_LOG` (ENT-SVC-003), `SVC_COMPLAINT_BOOK_ENTRY_STATUS_LOG` (ENT-SVC-011), `SVC_COMPLAINT_APPEAL_STATUS_LOG` (ENT-SVC-013) y `SVC_SLA_BREACH_ALERT` (ENT-SVC-009). Se concilia con las 4 firmadas del v7; dueño de dato por asignar.
- Linaje: acción del gestor o job de SLA → módulo `tickets`, `sla` o `complaintbook` → bitácora.
- PII: solo referencias a `PARTY` (`ChangedByPartyID`, `AssignedToPartyID`); sin datos personales en la bitácora.

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-19 | Jesús Chávez Elías, con IA | Borrador |
| 0.1 (v4 en Nexora) | 2026-10-21 | Brayan, con IA | 5 bitácoras firmadas según RNF-AUD-004 |
| 0.2 | 2026-10-22 | Jesús Chávez Elías, con IA | Condiciones del Líder Técnico: llave en Key Vault con rotación, receta por tabla (pendiente de transcribir del v7), hash encadenado por entidad, trigger que rechaza `UPDATE`/`DELETE` y usuario de aplicación sin ser dueño |

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v4 de Nexora; actualizado con IA (Claude, 2026-10-22) a partir de la revisión del Líder Técnico del 22-oct. — Revisado por: (pendiente) · Aprueba: TL
