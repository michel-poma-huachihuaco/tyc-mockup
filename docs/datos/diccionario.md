---
id: "DAT-001"
tipo: spec
titulo: "Diccionario de datos - Aybar Atiende"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "[Lider tecnico]"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["AYB-0001", "ADR-002"]
tags: [datos, f4]
---

# Diccionario de datos (lado de escritura, PostgreSQL)

Va en `docs/datos/diccionario.md`. Cubre el modelo CQRS de **escritura**
(`aybar-starter-data`, Postgres vía JPA/Flyway). El lado de lectura (Mongo) no
tiene diccionario propio: cada colección es una proyección de estas tablas,
construida por un consumidor Kafka (ver nota de proyección al final de cada
grupo). Fuente: diagrama de datos del DoR (PLT-05, "Modelado") + las secciones
"Datos (CAD-F5)" de las 60 HU en `docs/historias/`.

Convención: `PK` clave primaria, `FK` clave foránea, `UQ` único, `NN` NOT NULL.
Todas las tablas heredan `id`, `createdAt`, `updatedAt`, `version`
de `EntidadAuditable` (`aybar-starter-data`) salvo que se diga lo contrario;
esas 4 columnas no se repiten fila por fila abajo.

## 1 Maestros

### MAE_TICKET_TYPE
| Campo | Tipo | Oblig. | Nota |
|---|---|---|---|
| TicketTypeID | PK | NN | p.ej. `COMPLAINT`, `WARRANTY_CLAIM`, `CITY_INCIDENT`, `CONTRACT_DEFAULT`... |
| Nombre | string | NN | |
| RequiresComplaintBook | boolean | NN | dispara `SVC_COMPLAINT_BOOK_ENTRY` (HU-ATC-012, HU-ATC-015) |

### MAE_SLA_POLICY
| Campo | Tipo | Oblig. | Nota |
|---|---|---|---|
| SLAPolicyID | PK | NN | |
| TicketTypeID | FK → MAE_TICKET_TYPE | NN | |
| PriorityID | FK | null = genérica | precedencia: específica (tipo+prioridad) > genérica (RN-SVC-001) |
| TimeBase | enum | NN | `MINUTOS_CORRIDOS` / `HORAS_HABILES` / `DIAS_HABILES` |
| FirstResponseMinutos | int | NN | |
| ResolutionMinutos | int | NN | |

### MAE_AREA
| Campo | Tipo | Oblig. | Nota |
|---|---|---|---|
| AreaID | PK | NN | ATC, COBRANZA, LEGAL, POSTVENTA, TI, ADMINISTRACION (RF-SVC-007) |

### MAE_CHANNEL
| Campo | Tipo | Oblig. | Nota |
|---|---|---|---|
| ChannelID | PK | NN | TELEFONO, WHATSAPP, CORREO, URBEMIND, CALL_CENTER... |

### MAE_TIME / MAE_HOLIDAY
Calendario de días hábiles por geografía del establecimiento (RN-SVC-003). No
se modela a detalle aquí: es un maestro de calendario estándar, PK fecha +
geografía.

## 2 Núcleo del ticket

### SVC_TICKET
| Campo | Tipo | Oblig. | Nota |
|---|---|---|---|
| TicketID | PK | NN | |
| CompanyID | FK | NN | tenant; nunca derivable (RN-SVC-005) |
| BusinessLineID | FK | NN | |
| EstablecimientoID | FK | opcional | |
| TicketTypeID | FK → MAE_TICKET_TYPE | NN | |
| PriorityID | FK | NN | |
| CurrentAreaID | FK → MAE_AREA | NN | denormalizado, lo mantiene `SVC_TICKET_ASIGNACION` |
| OwnerPartyID | FK | opcional | responsable actual; denormalizado |
| TicketNumber | string | NN, UQ(CompanyID) | correlativo por razón social (RN-SVC-004, HU-ATC-002) |
| Resumen / Descripcion | string / text | NN | |
| FirstResponseDueDateTime | timestamp | NN | congelado al abrir (RN-SVC-002, HU-ATC-003) |
| ResolutionDueDateTime | timestamp | NN | congelado al abrir |
| ReopenedResolutionDueDateTime | timestamp | null | solo si `ReopenCount > 0` (HU-ATC-011) |
| FirstResponseDateTime | timestamp | null | |
| FirstResolvedDateTime | timestamp | null | inmutable una vez escrito (HU-ATC-006) |
| LastResolvedDateTime | timestamp | null | |
| ClosedDateTime | timestamp | null | |
| ReopenCount | int | NN, default 0 | |
| ContractID | FK | opcional | solo `CITY_INCIDENT` con cobro → `CITY_SERVICE_FEE` (HU-ATC-017) |
| ExposicionEconomica | decimal | null | monto reclamado + interés legal 8% (HU-ATC-041) |
| Rayo | boolean | NN, default false | solo supervisor/líder lo marca (RN-SVC-031) |
| EstadoActual | enum | NN | denormalizado; la verdad es `SVC_TICKET_ESTADO_HISTORIAL` |

Proyección Mongo: `vista_ticket` (lectura de bandeja, consulta 360 — se
reconstruye con los eventos `ticket.created/updated/assigned/status_changed`).

### SVC_TICKET_ESTADO_HISTORIAL (append-only)
| Campo | Tipo | Oblig. | Nota |
|---|---|---|---|
| TicketID | FK, PK compuesta | NN | |
| Status | enum | NN | ver `docs/datos/estados.md` |
| At | timestamp | NN | |
| By | FK usuario / `SYSTEM` | NN | |
| IntegrityHash | string | NN | HMAC-SHA256 (RNF-AUD-004) |

### SVC_TICKET_ASIGNACION (append-only)
| Campo | Tipo | Oblig. | Nota |
|---|---|---|---|
| TicketID | FK, PK compuesta | NN | |
| AreaID | FK → MAE_AREA | NN | |
| PartyID | FK | null = área sin persona | |
| Reason | enum | NN | incluye `REASSIGNMENT_CESE` (HU-ATC-008), `REASSIGNMENT_CARGA` (HU-ATC-046) |
| IntegrityHash | string | NN | |

### SVC_TICKET_INTERACCION
| Campo | Tipo | Oblig. | Nota |
|---|---|---|---|
| TicketID | FK, PK compuesta | NN | |
| Type | enum | NN | mensaje cliente / respuesta agente / nota interna / cambio de estado / llamada |
| Channel | FK → MAE_CHANNEL | NN | |
| Visible | boolean | NN | visible al cliente o nota interna |
| Author | FK | NN | |
| MediaUrl | string | null | evidencia multimedia (S3) |
| CallRecordingUrl | string | null | solo canal call center (HU-ATC-042) |

### SVC_TICKET_ALERTA_SLA
| Campo | Tipo | Oblig. | Nota |
|---|---|---|---|
| TicketID | FK, PK compuesta | NN | |
| BreachType | enum | NN | `FIRST_RESPONSE_OVERDUE` / `RESOLUTION_OVERDUE` |
| ReopenCycleNumber | int | NN | |
| EvaluatedDueDateTime | timestamp | NN | |
| UQ | — | — | `(TicketID, BreachType, ReopenCycleNumber)` — alerta única por ciclo (RN-SVC-008) |

### SVC_TICKET_NOTA_EMOCIONAL
| Campo | Tipo | Oblig. | Nota |
|---|---|---|---|
| TicketID | FK, PK compuesta | NN | |
| Nota | text | NN | sin juicios de valor (RN-SVC-024, gate no compensable) |
| By | FK | NN | |

### SVC_TICKET_HANDOFF
| Campo | Tipo | Oblig. | Nota |
|---|---|---|---|
| TicketID | FK, PK compuesta | NN | |
| EjeOrigen / EjeDestino | enum | NN | |
| KycValidado | boolean | NN | paquete mínimo de 6 elementos (HU-ATC-027) |
| HistorialPagosRef | string | null | |
| ConfirmacionRecepcionAt | timestamp | null | |
| SincronizadoConLegal | boolean | NN, default false | ver `ADR-007` (HU-ATC-040) |

## 3 Libro de Reclamaciones y apelaciones

### SVC_COMPLAINT_BOOK_ENTRY
| Campo | Tipo | Oblig. | Nota |
|---|---|---|---|
| TicketID, CompanyID | PK/FK compuesta | NN | FK compuesta con RESTRICT (RN-SVC-013) |
| AddressID | FK | NN | establecimiento |
| EntryNumber | string | NN, UQ(CompanyID, AddressID) | correlativo por empresa y establecimiento |
| Hechos / PedidoConsumidor | text | NN | |
| MontoReclamado | decimal | null | moneda obligatoria solo si hay monto |
| LegalResponseDueDate | date | NN | 15 días hábiles (RN-SVC-009) |
| ExtendedDue | date | null | prórroga única de 15 días |
| ExtensionJustification | text | null | |
| ExtensionCommunicatedDate | date | null | |
| ResponseDate | date | null | |
| ResponseSummary | text | null | |
| ResponseLetterUrl | string (S3) | null | con cargo al consumidor (RN-SVC-010) |
| SignedBy | FK | null | |

Proyección Mongo: `vista_libro_reclamaciones` (vigilancia de plazos, reportes).

### SVC_COMPLAINT_APPEAL
| Campo | Tipo | Oblig. | Nota |
|---|---|---|---|
| EntryID | FK, PK compuesta | NN | |
| Instance | enum | NN | interna / INDECOPI |
| Status | enum | NN | `PENDING, UNDER_REVIEW, RESOLVED_FAVOR_CUSTOMER, RESOLVED_FAVOR_COMPANY, WITHDRAWN` |
| IndecopiCaseNumber | string | null | |

### SVC_COMPLAINT_BOOK_ALERTA
| Campo | Tipo | Oblig. | Nota |
|---|---|---|---|
| TicketID | FK, PK compuesta | NN | |
| AlertType | enum | NN | `LEGAL_RESPONSE_OVERDUE` / `LEGAL_EXTENSION_WINDOW_CLOSING` |

### GOV_INTEGRITY_EXCEPTION
| Campo | Tipo | Oblig. | Nota |
|---|---|---|---|
| TicketTypeID | FK | NN | tipo con `RequiresComplaintBook=true` sin asiento |
| ExceptionCode | enum | NN | `ORPHAN_REFERENCE` (HU-ATC-015) |
| DetectedAt | timestamp | NN | job diario |

## 4 Casos sensibles (Mesa SGD / Eje 3)

### SVC_SENSITIVE_CASE
| Campo | Tipo | Oblig. | Nota |
|---|---|---|---|
| CaseID | PK | NN | |
| LineOfOrigin | enum | NN | Indecopi / Libro de Reclamaciones / Cartas Notariales / Legal Atiende / Backlog Histórico (5 líneas, HU-ATC-020) |
| UniqueCode | string | NN, UQ | Código Único Estandarizado |
| RiskLevel | enum | NN | matriz objetiva ponderada, recalibrable (HU-ATC-022) |
| PreAssignmentChargeDate | timestamp | null | |
| ActivationChargeDate | timestamp | null | el SLA de línea arranca aquí, no en el cargo previo (RN-SVC-015) |
| ClosureState | enum | null | 8 estados homologados (HU-ATC-025) |
| GliReferenceUrl | string | null | Repositorio Legal Controlado, custodia separada (RN-SVC-020) |

### SVC_SENSITIVE_CASE_ESCALATION
| Campo | Tipo | Oblig. | Nota |
|---|---|---|---|
| CaseID | FK, PK compuesta | NN | |
| Level | enum | NN | alerta temprana → memorándum jefatura → Comité → Directorio, sin saltos (RN-SVC-017) |
| At | timestamp | NN | |

### SVC_SENSITIVE_CASE_LINK
| Campo | Tipo | Oblig. | Nota |
|---|---|---|---|
| CaseOriginID | FK, PK compuesta | NN | |
| CaseLinkedID | FK | NN | evita duplicar como caso independiente (RN-SVC-018) |

## 5 EntregaFest (casos en vivo)

### SVC_EVENT_SENSITIVE_CASE
| Campo | Tipo | Oblig. | Nota |
|---|---|---|---|
| EventCaseID | PK | NN | |
| ClassificationRisk | enum | NN | incluye "riesgo muy alto" si hay palabras como estafa/fraude/abuso/delito (RN-SVC-029) |
| SequenceApplied | string | null | Frases Ancla 4-5-6 (RN-SVC-030) |
| DerivedToStation4 | boolean | NN, default false | |
| Tag | string | NN, default "Atención especial — derivación a Legal" | etiqueta estándar (HU-ATC-039) |

## 6 Postventa (garantía)

### SVC_WARRANTY_CLAIM
| Campo | Tipo | Oblig. | Nota |
|---|---|---|---|
| ClaimID | PK | NN | |
| HandoverID | FK → CONTRACT_UNIT_HANDOVER (dominio Contratos y Activos, externo) | NN | siempre cuelga de una entrega (RN-SVC-027) |
| DefectType | enum | NN | estructural / impermeabilización / acabados / instalaciones |
| Status | enum | NN | incluye "no procedente" tras validar vigencia (HU-ATC-034) |
| EscalatedToLegal | boolean | NN, default false | |
| AdendaReincorporacionUrl | string | null | (HU-ATC-036) |

### SVC_WARRANTY_INSPECTION
| Campo | Tipo | Oblig. | Nota |
|---|---|---|---|
| ClaimID | FK, PK compuesta | NN | |
| EvidenceUrl | string (S3) | NN | obligatoria antes de resolver |
| Resultado | enum | NN | aprobado / rechazado / resuelto |

Entidades externas referenciadas, no propias: `CONTRACT_UNIT_HANDOVER` y
`MAE_WARRANTY_COVERAGE_PERIOD` (dominio Contratos y Activos — se consultan,
no se copian, mismo patrón que SIGDA/TAXON vía `ADR-003`).

## 7 Workflow, conocimiento, IA y búsqueda (entidades del feedback, antes "por modelar")

| ID | Entidad | Campos clave | Nota |
|---|---|---|---|
| ENT-SVC-014 | `SVC_WORKFLOW_DEFINITION` | TicketTypeID, AreaID, Pasos (JSON: paso, estado, responsable, aprobación, SLA) | configurable sin desarrollo (HU-ATC-043); publicar no exige despliegue |
| ENT-SVC-015 | `SVC_KNOWLEDGE_ARTICLE` | TicketTypeID, Pasos, PlantillaRespuesta, DocumentosRequeridos, CriteriosCierre, Version | mantenida por admin funcional (HU-ATC-047) |
| ENT-SVC-016 | `SVC_AI_SUGGESTION_LOG` | TicketID, Sugerencia, DecisionGestor (acepta/edita/descarta) | IA solo sugiere, RN-SVC-032 (HU-ATC-048) |
| ENT-SVC-017 | `SVC_SEARCH_INDEX` | DocumentoID, ClienteID, Embedding, PermisosHeredados | búsqueda semántica; permisos heredan del sistema de origen (RN-SVC-036) |
| ENT-SVC-018 | `SVC_CONTRACT_DEFAULT_ALERT` | TicketID, Canal (correo/WhatsApp/MiPortal), ConstanciaEnvioAt | morosidad 3 meses (HU-ATC-056..058) |
| ENT-SVC-019 | `SVC_SIMPLE_FORM_DEFINITION` | FormTypeID, Campos (≤ 6, JSON) | formularios simples (HU-ATC-059, 060) |
| ENT-SVC-020 | `SVC_BUS_SEAT_RESERVATION` | BusID, Horario, Aforo, ListaEspera | Entrega Fest (HU-ATC-060) |

### SVY_SURVEY_RESPONSE
| Campo | Tipo | Oblig. | Nota |
|---|---|---|---|
| TicketID | FK, PK compuesta | NN | disparada al cierre, tipo `POST_TRANSACTION` (HU-ATC-019) |
| CSAT / CES | int | null | |

## 8 Datos personales y DLP

Ningún campo `Notes_*` / `Nota` (interacciones, nota emocional, bitácoras)
admite PII suelta (RN-SVC-012, `RNF-SEC-008`). El dato de cliente (nombre, DNI,
contacto) **no se copia**: vive en SIGDA/TAXON y se consulta por API (`ADR-003`,
`RN-SVC-026`). Clasificación Ley 29733 completa: pendiente de la puerta F4 de
Gobierno de Datos (`CAD-F5` por HU, ya iniciado en cada `docs/historias/HU-*.md`).

## 9 Sistemas externos referenciados (no se modelan aquí, solo se integran)

SIGDA/TAXON (cliente, KYC, lotes, cuotas), NEXUS (colaboradores, roles, SSO),
Cobranza (estado de cuenta, historial de pagos), motor de consultas de José,
herramienta de Legal, plataforma del call center (CTI), UrbeMind, KPI Engine,
GLI. Cada uno con su adaptador y simulador contract-first (`ADR-007`).

Generado por IA: contenido completo, a partir del DoR PLT-05 (modelado de
datos y entidades del feedback) y las secciones "Datos (CAD-F5)" de las 60 HU
— Revisado por: pendiente (Líder técnico, F4/G3)
