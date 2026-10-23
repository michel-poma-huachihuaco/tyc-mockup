---
id: "SPEC-ARQ-MIGRACION"
tipo: "spec"
titulo: "Estrategia de migración y reversión, con el registro de tablas de ATC"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.2"
owner: "Jesús Chávez Elías"
aprobadores: [tech_lead]
fecha: "2026-10-22"
relacionados: [ADR-001, ADR-002, ADR-005, ADR-009, ADR-012, ADR-013, ADR-014]
tags: [arquitectura, migracion, g3]
---

# Estrategia de migración y reversión

Versión 0.2 del 22-oct-2026. Aplica DT-03, DT-06, DT-07 y DT-08 del Líder Técnico (`analisis/decisiones.md` v0.3) y agrega el **registro de tablas de ATC** (C-11).

## 1 Base de escritura (PostgreSQL)

- **Dónde:** Azure Database for PostgreSQL, en la **base única del modelo v7**, con claves foráneas físicas (DT-06, ADR-014).
- **Cómo:** migraciones Flyway `V<n>__<descripcion>.sql` en `adapters/src/main/resources/db/migration/`, en el patrón *expand → contract*: primero se agrega lo nuevo sin romper lo viejo; se migra con relleno declarado e idempotente; lo viejo se borra en un release posterior. Una migración aplicada no se edita nunca (skill `aybar-modelo-a-flyway`).
- **El v7 solo permite agregar:** no se renombran ni se eliminan columnas; se marcan DEPRECADO. Por eso el «contract» de una migración de ATC es marcar, no borrar.
- **Dos roles de base de datos (ADR-002):** un rol dueño de los objetos, que corre las migraciones y no se usa en ejecución, y un usuario de aplicación con `INSERT` y `SELECT` sobre las bitácoras. Las cinco bitácoras firmadas llevan trigger que rechaza `UPDATE` y `DELETE`.
- **Una sola base, varios dueños:** las migraciones de ATC solo tocan sus tablas (sección 2). Los maestros compartidos tienen **un solo dueño de migración**, acordado con Gobierno de Datos.

## 2 Registro de tablas de ATC (C-11)

ATC no crea ni migra tablas de identidad, roles, permisos ni sesiones: son de Control de acceso (DT-03). Estado: el v7 trae las 13 tablas del fragmento SERVICE; **falta confirmar si ya existen en la base única o las crea ATC** (ADR-001).

### 2.1 Tablas que ATC es dueña (fragmento SERVICE del v7)

| Tabla | Clase | Módulo dueño |
|---|---|---|
| `MAE_AREA` | Catálogo (cola de atención, no estructura organizacional) | `tickets` |
| `MAE_TICKET_TYPE`, `MAE_TICKET_PRIORITY` | Catálogos | `tickets` |
| `MAE_SLA_POLICY` | Catálogo | `sla` |
| `SVC_TICKET`, `SVC_TICKET_INTERACTION` | Entidades | `tickets` |
| `SVC_TICKET_STATUS_LOG`, `SVC_TICKET_ASSIGNMENT_LOG` | Bitácoras firmadas | `tickets` |
| `SVC_SLA_BREACH_ALERT` | Entidad firmada | `sla` |
| `SVC_COMPLAINT_BOOK_ENTRY`, `SVC_COMPLAINT_APPEAL` | Entidades | `complaintbook` |
| `SVC_COMPLAINT_BOOK_ENTRY_STATUS_LOG`, `SVC_COMPLAINT_APPEAL_STATUS_LOG` | Bitácoras firmadas | `complaintbook` |

### 2.2 Tablas que ATC solo lee

| Tabla | Fragmento | Para qué |
|---|---|---|
| `PARTY`, `PARTY_SENSITIVE_DATA` | PARTY | Fuente viva del cliente (ADR-003); el dato sensible se ve enmascarado |
| `ORG_COMPANY`, `CONTRACT` y sus unidades | COMPANY y CONTRACT | `CompanyID`, `ContractID`, `UnitID` del ticket |
| `MAE_CHANNEL` | REFERENCE | Canal del ticket (Mi Portal no figura aún en su descripción) |
| `MAE_TIME`, `MAE_HOLIDAY` | REFERENCE | Días hábiles y feriados (ADR-005; DEP-04) |
| `MAE_GENERIC_LIST_VALUE` | REFERENCE (por confirmar) | Estados y valores de lista |

### 2.3 Lo que ATC escribe en otro dominio

| Tabla | Fragmento | Por qué | Estado |
|---|---|---|---|
| `GOV_DOCUMENT_REPOSITORY` | GOVERNANCE | Fila espejo de cada documento probatorio, con checksum y versión (ADR-006) | Por confirmar columnas |
| `CONTRACT_WARRANTY_CLAIM` | CONTRACT | Reclamo de garantía de postventa | Abierta (P-014) |
| `PARTY` (no verificada) | PARTY | Alta del interesado que no existe (ADR-003) | Abierta: quién la escribe (P-031) |
| `INTG_OUTBOX_EVENT` | INTEGRATION-HUB | Outbox, si cumple las cinco condiciones del ADR-013 | Por verificar |
| `PAY_COLLECTION_ACTIVITY`, `EVT_ATTENDEE`, `EVT_TRANSPORT`, `LGL_LEGAL_CASE`, `IDN_SYSTEM_TASK` o `NEX_NOTIFICATION_LOG` | PAYMENT, EVENT, KNOWLEDGE-BASE, IDENTITY-ACCESS o NEXORA | Candidatas del diccionario para morosidad, reserva de cupo, sincronización con Legal y notificaciones | **Candidatas, sin confirmar** |

### 2.4 Cambios propuestos al v7 (a Gobierno de Datos)

Ninguno está aprobado. El v7 no los trae (diccionario, H-03 del acta F4).

| Cambio | ADR | Estado |
|---|---|---|
| `SVC_WORKFLOW_DEFINITION`, `SVC_WORKFLOW_ACTIVITY`, `MAE_TICKET_SUBTYPE`, `SVC_TICKET_SLA_PAUSE` y las columnas `SubtypeID` y `WorkflowID` en `SVC_TICKET` | ADR-008 | Propuesta (P-016) |
| Otros atributos que el PLT-04 dibuja en `SVC_TICKET`: «Rayo · Motivo», `ConflictFlag`, «Eje actual», `VinculaciónPendiente`; y «Posición en sede» en `MAE_AREA` | Diccionario | Sin columnas en el v7 |
| `SVC_AI_SUGGESTION_LOG` | ADR-007 | Propuesta (P-031) |
| `SVC_KNOWLEDGE_ARTICLE` (guías de solución), `SVC_SEARCH_INDEX` (vista de lectura), `SVC_SIMPLE_FORM_DEFINITION` | Diccionario | Propuesta |
| `SVC_OUTBOX_EVENT` | ADR-013 | Solo si `INTG_OUTBOX_EVENT` no sirve |
| `shedlock` | ADR-005 | Nueva (P-031) |
| Casos sensibles y Mesa SGD: `SENSITIVE_CASE`, `MAE_INTAKE_LINE`, `RISK_ASSESSMENT`, `ESCALATION_LOG`, `CASE_CLOSURE`, `HANDOFF_PACKAGE`, `EMOTIONAL_NOTE` | Diccionario | «Por modelar» (esbozos del PLT-04 §6.5) |

### 2.5 Lo que se retira

`PORTAL_SESSION` y el maestro local de usuarios, roles, áreas y líderes: no se crean (DT-03, DT-04). Las candidatas `IDN_USER_SESSION` y `PARTY_CONTACT_VERIFICATION_TOKEN` son de Control de acceso.

## 3 Reversión

- Flyway Community no trae migraciones de deshacer; la reversión de datos es un script aparte, escrito y probado, en el Plan de Rollback de Datos (`.agents/templates/plan-rollback-datos.md`, puerta F9). **El rollback de aplicación no es rollback de datos.**
- Las bitácoras son de solo inserción: una reversión no las corrige; se agrega una fila nueva (ADR-002). Lo que ya está firmado no se reescribe.
- Como el v7 solo admite agregar, revertir una migración de ATC significa dejar de usar lo agregado y marcarlo DEPRECADO; borrar columnas queda fuera de la reversión.

## 4 Almacén de lectura

- Es **derivado**. Si falla, se reconstruye. El outbox conserva las filas publicadas solo 7 días (propuesta del ADR-013), así que **volver a proyectar los eventos no basta** para reconstruir todo: hace falta un job de **re-proyección desde PostgreSQL**, que hoy no está construido ni estimado (P-025).
- Sin migraciones propias del almacén en el starter de datos. El proyector es el único que escribe y usa su credencial de escritura propia (ADR-012).

## 5 Despliegue

- Un solo despliegue en la Etapa 1, en Azure Container Apps, con una imagen versionada (`aybar package`) en Azure Container Registry. Ambientes: DEV, QA, PRE y producción (ADR-014).
- Rollback de aplicación: volver a la imagen anterior.
- **Pasos de release que no son migración de datos:** (1) crear la llave HMAC en Key Vault antes de la primera bitácora; (2) crear la tabla de ShedLock; (3) entregar el catálogo de roles a Control de acceso (`roles-y-permisos-atc.md`; ADR-009); (4) registrar los clientes OAuth y la audiencia (P-026).

## 6 Integraciones externas

Contra simulador; la API real se activa cuando existe, sin cambiar los módulos (ADR-004).

## 7 Datos iniciales

- **Se quita la carga de usuarios, roles y líderes desde RR. HH.** (C-01, DT-03): los gestores los invita Control de acceso como cuentas `EMPLOYEE` y les asigna los roles de ATC. DEP-02 («carga de RR. HH.») se reemplaza por DEP-16.
- Catálogos de ATC (tipos, prioridades, áreas, políticas de SLA): se siembran con los valores del Excel y del v7. Los tipos, subtipos y áreas del piloto los cierra el PO (P-017).
- Calendario `MAE_TIME` y `MAE_HOLIDAY`: lo carga el Equipo Datos (DEP-04).
- Semillas solo con datos sintéticos; nunca datos reales ni datos personales en pruebas.

## Pendientes

- Confirmar si las tablas `SVC_` ya existen en la base única o las crea ATC.
- Los cambios de la sección 2.4 y el dueño de migración de cada maestro compartido: Gobierno de Datos (P-031).
- Job de re-proyección del almacén de lectura: sin estimar (P-025).
- Plan de Rollback de Datos (F9): sin escribir.

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-19 | Jesús Chávez Elías, con IA | Esbozo con carga de usuarios desde RR. HH. |
| 0.2 | 2026-10-22 | Jesús Chávez Elías, con IA | Se quita la carga desde RR. HH. (C-01); registro de tablas de ATC (C-11); Azure, ShedLock, dos roles de base y trigger; reconstrucción del almacén de lectura con re-proyección; pasos de release |

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v1 de Nexora; actualizado con IA (Claude, 2026-10-22) a partir de la revisión del Líder Técnico del 22-oct. — Revisado por: (pendiente) · Aprueba: TL
