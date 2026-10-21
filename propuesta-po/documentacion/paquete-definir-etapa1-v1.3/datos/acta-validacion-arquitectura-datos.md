---
id: "SPEC-DATOS-ACTA-F4"
tipo: "spec"
titulo: "Acta de Validación de Arquitectura de Datos (borrador para Gobierno de Datos)"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.1"
owner: "[por asignar: arquitecto / TL]"
aprobadores: []
fecha: "2026-10-19"
relacionados: [ADR-001, ADR-002, ADR-003, ADR-006, ADR-012, ADR-013]
tags: [datos, gobierno-de-datos, f4, g3]
---

# Acta de Validación de Arquitectura de Datos · Puerta F4

> **Esta acta la emite Gobierno de Datos (personas).** Aquí solo está el borrador con la evidencia y los hallazgos que prepara el agente `gobierno-datos`. Estado de la puerta: **sin emitir**. Estados posibles: Aprobado / Aprobado con observaciones / Rechazado. SLA de respuesta: 3 días hábiles.

## 1 Qué se valida y contra qué

Modelo lógico y físico, nomenclatura, claves y relaciones, linaje fuente-destino, transformaciones, clasificación de sensibilidad y datos personales, dueño de dato asignado, impacto sobre estructuras existentes. **Contra el Modelo de Datos Corporativo v7** (fragmento 10 SERVICE; revisión del 20-oct-2026) y, cuando se tengan, el Estándar de Modelado y el Diccionario Corporativo (**no disponibles en el repositorio**), con walkthrough con el arquitecto y el TL.

## 2 Evidencia entregada

| Evidencia | Archivo |
|---|---|
| Modelo (DER) | `docs/datos/er.md` · `er-diagrama.mmd` |
| Diccionario (claves y relaciones; tipos pendientes) | `docs/datos/diccionario.md` |
| Estados | `docs/datos/estados.md` |
| Linaje | `docs/datos/linaje.md` |
| Decisiones de arquitectura de datos | `docs/adr/ADR-001`, `ADR-002`, `ADR-003`, `ADR-006`, `ADR-012`, `ADR-013` |

## 3 Hallazgos del borrador

| # | Hallazgo | Severidad | Bloquea F4 |
|---|---|---|---|
| H-01 | Ninguna entidad tiene dueño de dato asignado | Mayor | **Sí** («entidades sin dueño») |
| H-02 | El v7 declara 0 tablas DAC en SERVICE; el texto libre de interacciones y reclamos podría tratarse como dato personal: propuesta pendiente de confirmar por Gobierno de Datos | Mayor | **Sí** («PII sin clasificar») |
| H-03 | 5 entidades del PLT-05 no existen en el v7 (flujos configurables, guías de solución, sugerencias de IA, índice de búsqueda, formularios simples) y 2 tienen candidata por confirmar; los casos sensibles / Mesa SGD tampoco tienen tablas, aunque el PLT-04 v1.3 §6.5 ya los esboza «por modelar» (`SENSITIVE_CASE`, `MAE_INTAKE_LINE`, `RISK_ASSESSMENT`, `ESCALATION_LOG`, `CASE_CLOSURE`; ver el diccionario) | Mayor | **Sí** (vacío de definición) |
| H-04 | Tipos, largos, obligatoriedad e índices de los 119 atributos no clave no están definidos (están en los archivos de Drive que no se han recibido) | Mayor | Por confirmar con Gobierno de Datos |
| H-05 | Quién escribe en el almacén de lectura (API de MongoDB) y cuánto retraso se tolera: sin decidir (ADR-012) | Mayor | **Sí** |
| H-06 | El v7 ya trae `PARTY` y `COMPANY`: la duplicación de maestros con SIGDA/TAXON y la sugerencia del módulo Clientes se deciden contra el v7 | Informativa | No |
| H-07 | Los umbrales de frescura de la vista de lectura y del outbox están por definir | Menor | No |
| H-08 | ADR-001 proponía un esquema por módulo y el v7 usa una sola instancia con tablas prefijadas; ADR-002 (hash y bitácoras), ADR-003 (fuente del cliente) y las líneas «Datos» de los 14 ADR se ajustaron al v7. Siguen por revisar el ADR-009 (maestro local de identidad frente a IDENTITY-ACCESS) y el ADR-013 (outbox propio frente a `INTG_OUTBOX_EVENT`) | Mayor | **Sí** (hasta que el arquitecto confirme los ADR) |
| H-09 | El PO y el Excel ya definen lo que estaba por confirmar: apelaciones 1 a N por asiento (PLT-04 HU-016 §6.5), 5 bitácoras firmadas (RNF-AUD-004) y vencimientos de SLA en `SVC_TICKET` (`FirstResponseDueDateTime`, `ResolutionDueDateTime` y `ReopenedResolutionDueDateTime`). Falta conciliar las 5 firmadas con las 4 del v7 | Menor | No |
| H-10 | El mockup de la Etapa 1 decide cosas que el v7 no tiene: flujo con actividades, subtipo, pausas del SLA, canal Mi Portal, 9 tipos de ticket y 7 áreas más (ver el diccionario). El paquete v1.3 del equipo cita 27 entidades: 20 existen en el v7 y 7 no (las de H-03). Es propuesta del equipo, sin aprobar | Mayor | Por confirmar con el PO y Gobierno de Datos |
| H-11 | **Conflicto abierto con el ADR-03 del PO:** `SVC_TICKET.PartyID` es clave foránea a `PARTY` del v7, mientras el PO fija SIGDA/TAXON como única fuente del cliente sin registros paralelos (RN-SVC-026, RNF-INT-007) y admite tickets de «Interesado» sin cliente vinculado (HU-051). Decide el líder técnico con Gobierno de Datos | Mayor | Lo decide el líder técnico |

## 4 Reglas de calidad e integridad que entran a la batería de F10

Se declaran aquí y se dan de alta al momento del release (`.agents/references/gobierno-datos.md`). Umbrales iniciales; se calibran con cuatro semanas de línea base antes de alertar en firme; los umbrales cero aplican a datos nuevos.

| ID | Entidad | Dominio | Regla | Umbral (atención / crítico) | Severidad |
|---|---|---|---|---|---|
| Q-001 | SVC_TICKET | Integridad | Tickets sin `CompanyID` o `BusinessLineID` válido (RN-SVC-005) | 0 / cualquiera | S1 |
| Q-002 | SVC_TICKET | Integridad | Duplicados de `TicketNumber` por `CompanyID` (RN-SVC-004) | 0 / cualquiera | S1 |
| Q-003 | Bitácoras firmadas de SERVICE | Integridad | `IntegrityHash` que no coincide al recalcular (HMAC-SHA256, llave en KMS; ADR-002): `hash_mismatch` = 0 en las 5 bitácoras de RNF-AUD-004 (estado, asignación, libro, apelación y alertas); conciliar con las 4 firmadas del v7 | 0 / cualquiera | S1 |
| Q-004 | SVC_TICKET · SVC_TICKET_STATUS_LOG | Consistencia | `TicketStatusID` fuera de la lista `SVC_TICKET_STATUS` o transiciones no permitidas (`estados.md`) | 0 / cualquiera | S2 |
| Q-005 | SVC_SLA_BREACH_ALERT | Consistencia | Más de una alerta por ticket, tipo de incumplimiento y ciclo: `UNIQUE (TicketID, BreachTypeID, ReopenCycleNumber)` (RN-SVC-008; HU-010) | 0 / cualquiera | S2 |
| Q-006 | Vistas de lectura | Calidad (frescura) | Retraso entre escribir y leer: umbral **por definir** (ADR-012) | > 1x / > 2x el objetivo | S2 |
| Q-007 | INTG_OUTBOX_EVENT | Actividad transaccional | Eventos pendientes de publicar y antigüedad del más viejo: umbral **por definir** (ADR-013) | por definir | S2 |
| Q-008 | SVC_COMPLAINT_BOOK_ENTRY | Integridad | Objetos de evidencia sin referencia y referencias sin objeto (ADR-006; vínculo con `GOV_DOCUMENT_REPOSITORY`); documentos probatorios sin checksum = 0 (RNF-CUM-007) | 0 / cualquiera | S1 |
| Q-009 | SVC_TICKET | Calidad | Registros paralelos del dato de cliente fuera de SIGDA/TAXON = 0 (RNF-INT-007; RN-SVC-026); el ticket no copia los datos del cliente (la clave foránea a `PARTY` es el conflicto abierto H-11) | 0 / cualquiera | S1 |
| Q-010 | SVC_TICKET | Calidad (completitud) | Completitud de campos obligatorios (la obligatoriedad real sale del diccionario v7) | < 99,5 % / < 98 % | S3 |
| Q-011 | SVC_COMPLAINT_BOOK_ENTRY | Consistencia | Asiento sin respuesta a los 15 días hábiles (o a los 30 si hubo prórroga) (Ley 29571 / 31435) | 0 / cualquiera | S1 |

Frecuencias: transaccional cada 15 min las primeras 72 h; integridad cada 2 h las primeras 72 h; consistencia diaria en críticas; calidad diaria dos semanas y luego semanal.

## 5 Resultado

**Sin emitir.** Firma de Gobierno de Datos: ____________________ Fecha: ________

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v5 de Jesús Chávez Elías en Nexora; actualizado por Brayan con IA (Claude, 2026-10-21) a la v1.3 del PO: hallazgos y reglas de calidad con lo que ya definen el PO y el Excel, y conflicto abierto H-11 por la clave a PARTY. — Revisado por: (pendiente)
