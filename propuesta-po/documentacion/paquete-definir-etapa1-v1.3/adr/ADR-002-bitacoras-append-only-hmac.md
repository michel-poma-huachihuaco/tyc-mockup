---
id: "ADR-002"
tipo: "adr"
titulo: "ADR-002: Bitácoras append-only con IntegrityHash HMAC-SHA256"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.1"
owner: "[por asignar: arquitecto / TL]"
aprobadores: []
fecha: "2026-10-19"
relacionados: [ADR-001, ADR-012, ADR-013, ADR-014]
tags: [adr, arquitectura, g3]
---

# ADR-002: Bitácoras append-only con IntegrityHash HMAC-SHA256

- Estado: propuesto
- Ticket: AYB-0001 · Fecha: 2026-10-19
- Compatibilidad con M0 (Arquitectura de Directorio): **por confirmar** (M0 no está en el repositorio; la declara el TL o se solicita dispensa al Data Chief o al Directorio)
- Origen: convierte a la plantilla del marco el ADR-02 del PLT-05 v1.3
- **Actualizado el 20-oct-2026 al modelo de datos corporativo v7:** las bitácoras son las del fragmento SERVICE (con PK propia y una fila por cambio), el estado es un par de columnas contra `MAE_GENERIC_LIST_VALUE` y el hash es el del modelo corporativo (HMAC-SHA256, llave en KMS, receta por tabla).
- **Actualizado el 21-oct-2026 al Excel del PO (RNF-AUD-004, también en el PLT-03 v1.3):** las bitácoras append-only firmadas son **5**: estado y asignación del ticket, libro, apelación y alertas de SLA.

> Las opciones evaluadas son una propuesta de redacción a partir del motivo del PLT-05 y de las skills del SDK: el arquitecto las confirma o corrige antes de pedir la aprobación del TL.

## Contexto

Los cambios de estado y las asignaciones de un ticket son evidencia ante INDECOPI y en auditoría (RNF-AUD-004). El modelo corporativo v7 define en SERVICE `SVC_TICKET_STATUS_LOG` y `SVC_TICKET_ASSIGNMENT_LOG`, más los historiales del libro y de la apelación (`SVC_COMPLAINT_BOOK_ENTRY_STATUS_LOG` y `SVC_COMPLAINT_APPEAL_STATUS_LOG`), y declara 4 entidades firmadas con `IntegrityHash` en el fragmento, sin decir cuáles (el diagrama del PLT-05 dibuja el hash solo en las dos primeras). El Excel del PO pide **5 bitácoras append-only firmadas** (RNF-AUD-004): estado, asignación, libro, apelación y alertas (`SVC_SLA_BREACH_ALERT`), con `LastChangeLogFile` (diff en S3) en toda entidad. El mismo Excel trae la receta v2 del `IntegrityHash` con campos del ticket y mete la carta del asiento en el hash (RN-SVC-010). El SDK trae una auditoría técnica (`aybar-starter-audit`) con lista blanca de datos personales, pero sin hash de integridad: no es esta bitácora.

## Opciones evaluadas

| Opción | Por qué no | Qué la haría reconsiderar |
|---|---|---|
| Bitácora editable con la auditoría genérica del SDK | No permite probar que un registro no fue alterado; la auditoría del SDK es una traza técnica, sin hash y sin los campos de negocio. | Que Legal acepte una traza sin prueba de integridad. |
| Hash simple (sin clave) por fila | Quien tenga acceso a la base puede recalcular el hash tras alterar una fila. | Que la clave no se pueda custodiar por entorno. |

## Decisión

Las bitácoras de SERVICE (estado y asignación del ticket, estados del libro y de la apelación, y alertas de SLA, según RNF-AUD-004) son **solo de inserción**: una fila por cambio, sin `UPDATE` ni `DELETE`. El estado se guarda como par `<Campo>ListID` + `<Campo>ID` contra `MAE_GENERIC_LIST_VALUE`, no como CHECK. Las tablas que el v7 marca como firmadas llevan un `IntegrityHash` con **HMAC-SHA256**, llave en KMS y cálculo solo en la capa de aplicación; la receta (lista ordenada de campos que se firman) va escrita en el comentario de la columna y es contrato. Un job recalcula y compara. RNF-AUD-004 pide firmar esas 5; el v7 en diapositivas declara 4 firmadas en SERVICE: la diferencia se concilia con Gobierno de Datos y el diccionario del v7. Si el hash se encadena con el de la fila anterior es una decisión **por definir** con Legal y el TL.

## Consecuencias

- Obliga a:
  - Construir la bitácora y el cálculo del hash: el SDK no los trae. Escribir la receta de cada tabla firmada.
  - Custodiar la llave HMAC en el KMS que exige el v7 (el servicio concreto lo decide el ADR-014).
  - Quitar permisos de `UPDATE` y `DELETE` sobre esas tablas al usuario de la aplicación.
  - Una regla de verificación periódica en la batería de calidad de datos (F10).
- Impide:
  - Corregir una fila existente: una corrección es una fila nueva.
- Cuesta: Horas de desarrollo sin estimar y una clave a rotar con política por definir. Costo cloud: por estimar (gestor de secretos).

## Datos (puerta F4 de Gobierno de Datos)

- Entidades que RNF-AUD-004 pide firmar (nombre del v7 e ID del Excel): `SVC_TICKET_STATUS_LOG` (ENT-SVC-002), `SVC_TICKET_ASSIGNMENT_LOG` (ENT-SVC-003), `SVC_COMPLAINT_BOOK_ENTRY_STATUS_LOG` (ENT-SVC-011), `SVC_COMPLAINT_APPEAL_STATUS_LOG` (ENT-SVC-013) y `SVC_SLA_BREACH_ALERT` (ENT-SVC-009). Se concilia con las 4 firmadas del v7; dueño de dato por asignar.
- Linaje: acción del gestor o job de SLA → módulo `tickets`, `sla` o `libro` → bitácora.
- PII: solo referencias a `PARTY` (`ChangedByPartyID`, `AssignedToPartyID`); sin datos personales en la bitácora.

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v3 de Jesús Chávez Elías en Nexora; actualizado por Brayan con IA (Claude, 2026-10-21) a la v1.3 del PO: 5 bitácoras firmadas según RNF-AUD-004 (suma las alertas de SLA) e IDs del Excel. — Revisado por: (pendiente) · Aprueba: TL
