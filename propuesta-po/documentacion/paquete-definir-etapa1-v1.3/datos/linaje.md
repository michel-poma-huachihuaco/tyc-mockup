---
id: "SPEC-DATOS-LINAJE"
tipo: "spec"
titulo: "Linaje de datos de Aybar Atiende"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.2"
owner: "Jesús Chávez Elías"
aprobadores: [tech_lead]
fecha: "2026-10-26"
relacionados: [ADR-001, ADR-002, ADR-003, ADR-006, ADR-012, ADR-013]
tags: [datos, linaje, g3]
---

# Linaje de datos (fuente → destino)

Revisión del 20-oct-2026: las tablas son las del v7 (SERVICE y las que referencia).

| Dato | Fuente | Destino | Transformación y regla | Sensibilidad |
|---|---|---|---|---|
| Cliente y KYC | PARTY y COMPANY del modelo corporativo en la base única (el ticket guarda `PartyID`, `CompanyID`); `PARTY` es la fuente viva (DT-06); su relación con SIGDA/TAXON (DEP-01) la reescribe el PO (P-027) | Pantalla (consulta 360) | Consulta en línea con caché corta; **no se persiste** (ADR-003). ATC no lee las tablas de personas: el dato llega enmascarado del dueño del fragmento 3 (D-119 de PJ-05; P-037). El dato sensible está cifrado en `PARTY_SENSITIVE_DATA` (DAC) | Personal; permisos del origen |
| Usuario, empresa y roles | Token de Control de acceso (DT-05): `user_account_id`, `realm_access.roles`, `company_roles`, `companyId` | Memoria de la petición; en las bitácoras solo la referencia del colaborador | **No se persiste** ni se copia: ATC no tiene tablas de usuarios, roles ni sesiones (DT-03, C-11). La Party del colaborador para las columnas `*PartyID`: P-033 | Referencias |
| Catálogo de roles y permisos de ATC | `arquitectura/roles-y-permisos-atc.md` | Control de acceso (ADR-021 de PJ-05) | Se entrega con el cliente `CATALOG_REGISTRAR`; desde ahí lo administra el área (DT-03) | Sin datos personales |
| Ticket e interacciones | Gestor / cliente (Mi Portal) | PostgreSQL: `SVC_TICKET`, `SVC_TICKET_INTERACTION` | Escritura transaccional con evento en el outbox (ADR-013; `INTG_OUTBOX_EVENT` del v7) | Alta en texto libre |
| Vistas de bandeja, búsqueda y tableros | PostgreSQL → evento | Almacén de lectura (API de MongoDB) | Proyector; solo referencias en el evento (ADR-012) | Sin datos personales de más |
| Estados, asignaciones y alertas | Módulos de tickets y de SLA (job) | `SVC_TICKET_STATUS_LOG`, `SVC_TICKET_ASSIGNMENT_LOG`, `SVC_SLA_BREACH_ALERT` | Una fila por cambio; las tres son bitácoras firmadas con `IntegrityHash` (RNF-AUD-004; ADR-002) | Referencias |
| Libro de Reclamaciones y apelaciones | Módulo de libro | `SVC_COMPLAINT_BOOK_ENTRY`, `SVC_COMPLAINT_APPEAL` y sus bitácoras | Extensión 1:1 del ticket; plazos 15 + 15 días hábiles con `MAE_TIME` y `MAE_HOLIDAY`; las dos bitácoras de estado son firmadas (RNF-AUD-004) | Alta |
| Evidencia y cartas | Módulo de libro / casos | Azure Blob Storage con inmutabilidad (ADR-006, DT-07); catálogo `GOV_DOCUMENT_REPOSITORY` | La carta va en `CompanyResponseDocumentPath`, con espejo, versión y checksum en `GOV_DOCUMENT_REPOSITORY` (RF-SVC-014; RNF-CUM-007; ADR-006) | Alta |
| Eventos de cierre y SLA | Outbox (`INTG_OUTBOX_EVENT` o `SVC_OUTBOX_EVENT`, ADR-013) | KPI Engine (DEP-10), notificaciones, visor 3D, Mi Portal | Bus de eventos; solo referencias | Referencias |
| Auditoría técnica | Módulos | Publicador de auditoría del SDK (log, archivo o S3/MinIO; en Azure, log o archivo: no tiene destino Blob, ADR-014) | Lista blanca: solo referencias y tipos permitidos. Auditoría de fila: `CreatedDate`, `UpdatedDate`, `LastChangeLogFile` (diff en el almacén de evidencia, RNF-AUD-004) | Sin datos personales |
| Documentos del cliente indexados | Repositorio documental y GLI (DEP-06) | Índice de búsqueda con permisos | Indexación por significado; **por definir** qué repositorios | Alta |

Un dato que viaja por un evento lleva solo referencias (el SDK no admite texto libre en el payload; Ley 29733).

## Eventos y métricas de analítica que piden las historias

Cada historia de Nexora trae su evento o métrica en «Datos de prueba / analítica» (PLT-04). Son 54 eventos o métricas en 62 historias; 8 historias dicen «sin evento específico». Los nombres y la carga son los del PLT-04: **el payload solo puede llevar referencias** (sin texto libre ni datos personales), así que campos como `autor` o `motivo` viajan como identificadores. Se publican por el outbox del servicio (ADR-013, DT-02); los consume el KPI Engine (DEP-10), que sigue sin fecha comprometida.

| Historia | Evento o métrica (carga) |
|---|---|
| HU-001 | `ticket_creado {canal, tipo, prioridad, empresa}` |
| HU-003 | `sla_congelado {política, fr_due, res_due}` |
| HU-004 | `ticket_estado {de, a, autor}` |
| HU-005 | `interacción_registrada {tipo, visible, adjuntos}` |
| HU-007 | `ticket_derivado {de_área, a_área, motivo}` |
| HU-008 | `reasignación_masiva {n_tickets, motivo}` |
| HU-010 | `sla_alerta {tipo, ciclo}` |
| HU-011 | `ticket_reabierto {ciclo}` |
| HU-012 | `asiento_libro {tipo, empresa, establecimiento}` |
| HU-013 | `prorroga_registrada` |
| HU-014 | `respuesta_libro {días_hábiles_usados}` |
| HU-015 | `huerfano_detectado` |
| HU-016 | `apelación_estado` |
| HU-019 | `encuesta_enviada / encuesta_respondida` |
| HU-020 | `caso_sensible_registrado {línea}` |
| HU-021 | `caso_activado` |
| HU-022 | `riesgo_recalibrado` |
| HU-023 | `escalamiento {nivel}` |
| HU-024 | `caso_vinculado` |
| HU-025 | `caso_cerrado {estado}` |
| HU-026 | `gate_conflicto` |
| HU-027 | `handoff {completo, confirmado}` |
| HU-029 | `métrica tiempo_cierre_e2e` |
| HU-032 | `métrica registros_paralelos` |
| HU-033 | `garantía_registrada {tipo}` |
| HU-034 | `garantía_no_procedente` |
| HU-035 | `inspección_registrada` |
| HU-037 | `frase_ancla {n}` |
| HU-038 | `derivación_estación4` |
| HU-040 | `legal_sync {estado}` |
| HU-041 | `riesgo_denuncia {exposicion}` |
| HU-042 | `llamada_registrada {duracion}` |
| HU-043 | `flujo_publicado {area, tipo, subtipo, actividades, sla_total}` |
| HU-044 | `bandeja_tomado {orden}` |
| HU-045 | `rayo_marcado {motivo}` |
| HU-046 | `reasignacion_carga` |
| HU-047 | `guia_consultada {tipo}` |
| HU-048 | `ia_sugerencia {decision}` |
| HU-049 | `cliente_buscado {criterio}` |
| HU-050 | `consulta360 {secciones, rol, fuentes_en_linea, ms}` |
| HU-051 | `consulta_excepcion {motivo}` |
| HU-052 | `consulta_motor {consulta}` |
| HU-053 | `busqueda_semantica` |
| HU-054 | `tablero_visto` |
| HU-055 | `correo_asignacion` |
| HU-056 | `caso_resolucion {meses}` |
| HU-057 | `alerta_cancelacion {canal}` |
| HU-058 | `carta_alerta` |
| HU-059 | `ingreso_proyecto` |
| HU-060 | `reserva_bus {acompanantes}` |
| HU-064 | `ticket_creado {canal: mi_portal, tipo, subtipo}` |
| HU-065 | `portal_seguimiento {ticket, estado}` |
| HU-066 | `portal_cierre {confirmado / rechazado}` |
| HU-067 | `visor3d_abierto {areas, filtro}` |

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v3 de Jesús Chávez Elías en Nexora; actualizado por Brayan con IA (Claude, 2026-10-21) a la v1.3 del PO: bitácoras firmadas según RNF-AUD-004, columnas de la carta del Excel y conflicto abierto por la clave a PARTY. — Revisado por: (pendiente)

Actualizado el 22-oct-2026 por Jesús Chávez Elías con IA (Claude) a partir de la revisión del Líder Técnico (DT-02, DT-03, DT-04 y DT-06 de `analisis/decisiones.md` v0.3). — Revisado por: (pendiente)

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-19 a 2026-10-22 | Jesús Chávez Elías y Brayan Hurtado, con IA | Linaje desde el v7, eventos de las historias y decisiones del 22-oct (versiones de Nexora hasta la v5) |
| 0.2 | 2026-10-26 | Brayan Hurtado, con IA | El dato de la persona llega enmascarado del dueño del fragmento 3 (D-119; P-037); filas del token y del catálogo de ATC, sin copia de usuarios, roles ni sesiones (DT-03, C-11) |

Actualizado el 26-oct-2026 por Brayan Hurtado con IA (Claude) a partir de la revisión del Líder Técnico del 22-oct (DT-03, DT-06 y C-11). — Revisado por: (pendiente)
