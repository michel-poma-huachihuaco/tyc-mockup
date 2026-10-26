---
id: "SPEC-DATOS-ACTA-F4"
tipo: "spec"
titulo: "Acta de Validación de Arquitectura de Datos (borrador para Gobierno de Datos)"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.2"
owner: "Jesús Chávez Elías"
aprobadores: [data_chief, tech_lead]
fecha: "2026-10-26"
relacionados: [ADR-001, ADR-002, ADR-003, ADR-006, ADR-012, ADR-013]
tags: [datos, gobierno-de-datos, f4, g3]
---

# Acta de Validación de Arquitectura de Datos · Puerta F4

> **Esta acta la emite Gobierno de Datos (personas): el Data Chief, Enrique Albán.** Aquí solo está el borrador con la evidencia y los hallazgos que prepara el agente `gobierno-datos`. Estado de la puerta: **sin emitir; lista para la firma del Data Chief** (26-oct-2026): H-01, H-02, H-03, H-05 y H-08 quedan resueltos con DT-06 y C-11 del Líder Técnico (22-oct), con el registro de tablas como evidencia. Estados posibles: Aprobado / Aprobado con observaciones / Rechazado. SLA de respuesta: 3 días hábiles. El agente no firma.

## 1 Qué se valida y contra qué

Modelo lógico y físico en la **base única del modelo v7, en Azure Database for PostgreSQL, con FK físicas** (DT-06), nomenclatura, claves y relaciones, linaje fuente-destino, transformaciones, clasificación de sensibilidad y datos personales, dueño de dato asignado, impacto sobre estructuras existentes. **Contra el Modelo de Datos Corporativo v7** (fragmento 10 SERVICE; revisión del 20-oct-2026) y, cuando se tengan, el Estándar de Modelado y el Diccionario Corporativo (**no disponibles en el repositorio**), con walkthrough con el arquitecto y el TL.

## 2 Evidencia entregada

| Evidencia | Archivo |
|---|---|
| Registro de tablas: qué crea ATC, qué solo lee, qué escribe en otro dominio, dueño de dato y de migración propuestos, clasificación de datos personales (C-11) | `docs/datos/registro-de-tablas.md` |
| Modelo (DER) | `docs/datos/er.md` · `er-diagrama.mmd` |
| Diccionario (claves y relaciones; tipos pendientes) | `docs/datos/diccionario.md` |
| Estados | `docs/datos/estados.md` |
| Linaje | `docs/datos/linaje.md` |
| Decisiones de arquitectura de datos | `docs/adr/ADR-001`, `ADR-002`, `ADR-003`, `ADR-006`, `ADR-012`, `ADR-013` |

## 3 Hallazgos del borrador

| # | Hallazgo | Severidad | Bloquea F4 |
|---|---|---|---|
| H-01 | Ninguna entidad tenía dueño de dato asignado. **Resuelto con DT-06 y C-11 (26-oct):** el registro de tablas (§2 y §6) propone el dueño de dato de cada tabla de SERVICE (Gerencia ATC; con Gerencia Legal en el Libro y las apelaciones) y un solo dueño de migración por maestro compartido. La designación la hace el Data Chief al firmar esta acta, como en la puerta F4 de PJ-05 | Mayor | **Resuelto en la propuesta**; lo confirma la firma |
| H-02 | El v7 declara 0 tablas DAC en SERVICE; faltaba clasificar el dato personal. **Resuelto con DT-06 y C-11 (26-oct):** el dato del cliente vive en `PARTY` y en su fragmento 3, no en ATC (DT-06): ATC guarda referencias y no lee las tablas de personas directamente (D-119 de PJ-05). El registro de tablas (§2) clasifica cada tabla: `SVC_TICKET_INTERACTION` (texto libre y adjuntos) y `SVC_COMPLAINT_BOOK_ENTRY` (hoja del Libro, excepción de ADR-003 que valida Legal) se tratan como dato personal; las bitácoras no llevan datos personales (RN-SVC-012). ATC no tiene tablas de identidad ni de sesión (C-11) | Mayor | **Resuelto en la propuesta**; lo confirma la firma |
| H-03 | 5 entidades del PLT-05 no existen en el v7 (flujos configurables, guías de solución, sugerencias de IA, índice de búsqueda, formularios simples) y 2 tienen candidata por confirmar; los casos sensibles / Mesa SGD tampoco tienen tablas, aunque el PLT-04 v1.3 §6.5 ya los esboza «por modelar» (`SENSITIVE_CASE`, `MAE_INTAKE_LINE`, `RISK_ASSESSMENT`, `ESCALATION_LOG`, `CASE_CLOSURE`; ver el diccionario). **Resuelto con DT-06 y C-11 (26-oct):** cada una queda como **cambio al v7 propuesto** en el registro de tablas (§3), con su historia y su ADR: outbox (`INTG_OUTBOX_EVENT` o tabla propia), `SVC_AI_SUGGESTION_LOG`, flujo, subtipo y versión, pausas del SLA, `shedlock` y las demás. Cada una la aprueba o la rechaza Gobierno de Datos con esta acta | Mayor | **Resuelto en la propuesta**; cada cambio lo aprueba la firma |
| H-04 | Tipos, largos, obligatoriedad e índices de los 119 atributos no clave no están definidos (están en los archivos de Drive que no se han recibido) | Mayor | Por confirmar con Gobierno de Datos |
| H-05 | **Resuelto (DT-02 y DT-06):** el proyector del servicio es el único que escribe en el almacén de lectura, con credencial de escritura propia. El almacén de lectura es derivado y no es una tabla de la base única: se reconstruye desde PostgreSQL (`arquitectura/migracion-y-reversion.md` §4). El retraso máximo en segundos lo fija ADR-012 (5 s) y lo aprueba el Líder Técnico con ese ADR | Mayor | **Resuelto**; el valor queda en ADR-012 |
| H-06 | El v7 ya trae `PARTY` y `COMPANY`: la duplicación de maestros con SIGDA/TAXON y la sugerencia del módulo Clientes se deciden contra el v7 | Informativa | No |
| H-07 | Los umbrales de frescura de la vista de lectura y del outbox son propuesta (5 s y 10 s, ADR-012 y ADR-013); el Líder Técnico los confirma | Menor | No |
| H-08 | ADR-001 proponía un esquema por módulo y el v7 usa una sola instancia con tablas prefijadas. **Resuelto con DT-06 y C-11 (26-oct):** una sola base, la del v7, en Azure Database for PostgreSQL, sin esquema por módulo y con FK físicas; ATC crea las 13 tablas de SERVICE, que no están entre las que crea Control de acceso, y no recrea ningún maestro compartido (registro de tablas §2, §4 y §6). Sin maestro local ni tablas de identidad (DT-03). El outbox es `INTG_OUTBOX_EVENT` o `SVC_OUTBOX_EVENT` como cambio al v7 (registro §3) | Mayor | **Resuelto en la propuesta**; la elección del outbox la fija ADR-013 |
| H-09 | El PO y el Excel ya definen lo que estaba por confirmar: apelaciones 1 a N por asiento (PLT-04 HU-016 §6.5), 5 bitácoras firmadas (RNF-AUD-004) y vencimientos de SLA en `SVC_TICKET` (`FirstResponseDueDateTime`, `ResolutionDueDateTime` y `ReopenedResolutionDueDateTime`). Falta conciliar las 5 firmadas con las 4 del v7 | Menor | No |
| H-10 | El mockup de la Etapa 1 decide cosas que el v7 no tiene: flujo con actividades, subtipo, pausas del SLA, canal Mi Portal, 9 tipos de ticket y 7 áreas más (ver el diccionario). El paquete v1.3 del equipo cita 27 entidades: 20 existen en el v7 y 7 no (las de H-03). Es propuesta del equipo, sin aprobar | Mayor | Por confirmar con el PO y Gobierno de Datos |
| H-11 | **Resuelto en lo técnico por DT-06 (22-oct):** `SVC_TICKET.PartyID` es clave foránea a `PARTY`, que es la fuente viva. **Corrección del 26-oct:** ATC no crea la `PARTY` del «Interesado» (HU-051); en PJ-05 la Party no verificada solo la crea el autorregistro de Control de acceso (R29, A26). El ticket queda con la vinculación pendiente hasta que la Party exista (P-037). Falta que el PO reescriba el ADR-03, RN-SVC-026, RNF-INT-007 y DEP-01 (P-027) | Mayor | Falta el PO (P-027) y la respuesta de P-037 |
| H-12 | Cambios nuevos que salen de las decisiones del 22-oct: `shedlock` (ShedLock), `SVC_OUTBOX_EVENT` (si `INTG_OUTBOX_EVENT` no sirve), `SVC_WORKFLOW_ACTIVITY`, `MAE_TICKET_SUBTYPE`, `SVC_TICKET_SLA_PAUSE`, las columnas `SubtypeID` y `WorkflowID` de `SVC_TICKET`, y la escritura de ATC en tablas de otros fragmentos (`MAE_GENERIC_LIST_VALUE`, `MAE_CHANNEL`, `GOV_INTEGRITY_EXCEPTION`, `GOV_DOCUMENT_REPOSITORY`, `SVY_SURVEY_RESPONSE`, `CONTRACT_WARRANTY_CLAIM`). ATC no escribe `PARTY` (P-037). El detalle y el dueño de migración propuesto de cada tabla están en `datos/registro-de-tablas.md` §3, §5 y §6 | Mayor | Dueño de migración de los maestros compartidos: P-043 |
| H-13 | **Correspondencia `MAE_AREA` ↔ estructura organizacional (C-07), para Gobierno de Datos.** `MAE_AREA` queda solo como cola de atención del ticket y no guarda líderes. La revisión del Líder Técnico pide documentar su correspondencia con `NEX_COMPANY_AREA`, pero esa tabla no existe en PJ-05: la crea su dueño de modelo (D-74) y `CompanyAreaID` va sin FK hasta entonces (D-193). Diseño posible en `registro-de-tablas.md` §7: una columna de referencia en `MAE_AREA`, opcional y sin FK hasta que exista la tabla (cambio al v7 propuesto) | Menor | No; queda abierta en P-036 (dueño de la tabla de áreas) |

## 4 Reglas de calidad e integridad que entran a la batería de F10

Se declaran aquí y se dan de alta al momento del release (`.agents/references/gobierno-datos.md`). Umbrales iniciales; se calibran con cuatro semanas de línea base antes de alertar en firme; los umbrales cero aplican a datos nuevos.

| ID | Entidad | Dominio | Regla | Umbral (atención / crítico) | Severidad |
|---|---|---|---|---|---|
| Q-001 | SVC_TICKET | Integridad | Tickets sin `CompanyID` o `BusinessLineID` válido (RN-SVC-005) | 0 / cualquiera | S1 |
| Q-002 | SVC_TICKET | Integridad | Duplicados de `TicketNumber` por `CompanyID` (RN-SVC-004) | 0 / cualquiera | S1 |
| Q-003 | Bitácoras firmadas de SERVICE | Integridad | `IntegrityHash` que no coincide al recalcular (HMAC-SHA256, llave en Azure Key Vault, encadenado por entidad; ADR-002): `hash_mismatch` = 0 en las 5 bitácoras de RNF-AUD-004 (estado, asignación, libro, apelación y alertas); conciliar con las 4 firmadas del v7 | 0 / cualquiera | S1 |
| Q-004 | SVC_TICKET · SVC_TICKET_STATUS_LOG | Consistencia | `TicketStatusID` fuera de la lista `SVC_TICKET_STATUS` o transiciones no permitidas (`estados.md`) | 0 / cualquiera | S2 |
| Q-005 | SVC_SLA_BREACH_ALERT | Consistencia | Más de una alerta por ticket, tipo de incumplimiento y ciclo: `UNIQUE (TicketID, BreachTypeID, ReopenCycleNumber)` (RN-SVC-008; HU-010) | 0 / cualquiera | S2 |
| Q-006 | Vistas de lectura | Calidad (frescura) | Retraso entre escribir y leer: objetivo de 5 s en p95 (propuesta, ADR-012) | > 1x / > 2x el objetivo | S2 |
| Q-007 | INTG_OUTBOX_EVENT o SVC_OUTBOX_EVENT (ADR-013) | Actividad transaccional | Eventos pendientes de publicar y antigüedad del más viejo: atención a 5 s y crítico a 10 s (propuesta, ADR-013) | > 5 s / > 10 s | S2 |
| Q-008 | SVC_COMPLAINT_BOOK_ENTRY | Integridad | Objetos de evidencia sin referencia y referencias sin objeto (ADR-006; vínculo con `GOV_DOCUMENT_REPOSITORY`); documentos probatorios sin checksum = 0 (RNF-CUM-007) | 0 / cualquiera | S1 |
| Q-009 | SVC_TICKET | Calidad | Registros paralelos del dato de cliente = 0 (RNF-INT-007; RN-SVC-026): ninguna tabla de ATC copia nombre, documento ni contacto del cliente; la clave foránea a `PARTY` es una referencia a la fuente viva (DT-06, H-11). El PO reescribe la regla sobre `PARTY` (P-027) | 0 / cualquiera | S1 |
| Q-010 | SVC_TICKET | Calidad (completitud) | Completitud de campos obligatorios (la obligatoriedad real sale del diccionario v7) | < 99,5 % / < 98 % | S3 |
| Q-011 | SVC_COMPLAINT_BOOK_ENTRY | Consistencia | Asiento sin respuesta a los 15 días hábiles (o a los 30 si hubo prórroga) (Ley 29571 / 31435) | 0 / cualquiera | S1 |

Frecuencias: transaccional cada 15 min las primeras 72 h; integridad cada 2 h las primeras 72 h; consistencia diaria en críticas; calidad diaria dos semanas y luego semanal.

## 5 Resultado

**Sin emitir; lista para la firma del Data Chief.** Quedan abiertos para el Data Chief: H-04 (tipos de los atributos, archivos de Drive del v7), H-09 (5 bitácoras firmadas frente a 4 del v7), H-10 (decisiones del mockup), H-11 (P-027 y P-037), H-13 (correspondencia de `MAE_AREA`, P-036) y el dueño de migración de los maestros compartidos (P-043). Puede aprobar con observaciones.

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

Actualizado el 26-oct-2026 por Brayan Hurtado con IA (Claude) a partir de la revisión del Líder Técnico del 22-oct (§4, «Modelo de datos y acta F4»; DT-06 y C-11). — Revisado por: (pendiente)
