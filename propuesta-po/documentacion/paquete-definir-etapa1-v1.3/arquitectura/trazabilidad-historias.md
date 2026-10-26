---
id: "SPEC-ARQ-TRAZABILIDAD-HU"
tipo: "spec"
titulo: "Trazabilidad de las historias de Nexora al paquete G3"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.2"
owner: "Jesús Chávez Elías"
aprobadores: [tech_lead]
fecha: "2026-10-26"
relacionados: [ADR-001, ADR-012]
tags: [arquitectura, trazabilidad, g3]
---

# Trazabilidad de las historias de Nexora al paquete G3

Contraste del 20-oct-2026 entre las **62 historias publicadas en PJ-06** (carpeta `historias/`: todas en v1.3; 197 criterios de aceptación; 243 h con IA) y los documentos de este paquete. Todas están en versión pendiente: el PO no las ha aprobado, así que este paquete sigue siendo propuesta sobre texto que puede cambiar.

**Resultado del contraste.** Los criterios de aceptación de las 62 historias coinciden con los que usó el generador (mismo texto y mismas reglas `RN-SVC`; una sola diferencia de ortografía en un código de alerta, que aquí se escribe como en Nexora). Las 243 h y los cuatro desarrolladores cuadran con el roadmap RMP-001. Lo que **no** estaba reflejado era el detalle: nombres de columna y de códigos de lista, estados y reglas de transición, eventos de analítica, jobs y plazos, reglas de seguridad, preguntas abiertas y las operaciones de las historias sin API. Eso se sumó así:

| Qué se sumó | Dónde |
|---|---|
| Atributos, códigos y valores que nombran las historias (43 filas) | `datos/diccionario.md` |
| Estados y reglas de transición (21 filas) | `datos/estados.md` |
| Eventos y métricas de analítica (54) | `datos/linaje.md` |
| Controles programados, plazos y reintentos (17) | `adr/ADR-005` |
| Reglas de seguridad y de contenido, y tiempos de respuesta | `arquitectura/seguridad.md` |
| Preguntas abiertas (58 en 25 historias y 23 de las funcionalidades) y decisiones D-008, P-018 y P-019 | `analisis/decisiones.md` |
| Requisitos no funcionales con umbral (31) y estado de DoR de las 23 funcionalidades | esta página |
| 59 operaciones de API en el contrato v0.3 (antes 61 y 28), con campos y errores de los criterios | `arquitectura/aybar-atc.openapi.yaml` y `operaciones-por-historia.md` |

Lectura de la tabla: «Contrato» son los `operationId` del OpenAPI (o el mecanismo si la historia no tiene API propia); «Datos» son tablas y columnas del v7 o la falta de ellas; «Falta» es lo que impide cerrar la historia en G3. Una historia con «Sin tabla en el v7» no tiene todavía dónde guardar sus datos: depende de que Gobierno de Datos decida su tabla (P-016).

| Historia | Título | Versión | Criterios | Contrato | Datos (v7) | Otros documentos | Falta o por confirmar |
|---|---|---|---|---|---|---|---|
| HU-001 | Registrar un ticket tipificado desde cualquier canal | 1.3 | 4 (2 del PO) | `registrarTicket` | `SVC_TICKET` (`CompanyID` y `BusinessLineID` obligatorios; establecimiento vacío si el canal es remoto) | ADR-003 (cliente del maestro); seguridad.md (permiso y rastro del intento) | Nulabilidad de las columnas. La clave foránea `PartyID` → `PARTY` la decidió DT-06 (`PARTY` es la fuente viva); el PO reescribe el ADR-03 (P-027). Rol de atención del token: DEP-16 (P-034) |
| HU-002 | Entregar al cliente un número de ticket por razón social | 1.3 | 3 (1 del PO) | `registrarTicket` | Número por `CompanyID` (columna no clave) | ADR-001 | Formato visible del número (pregunta de FT-01) |
| HU-003 | Congelar el SLA del ticket al abrirlo | 1.3 | 4 (2 del PO) | `consultarSla` | `MAE_SLA_POLICY` (precedencia, `BUSINESS_HOURS`, genérica global), `SLAPolicyID` | ADR-005 | Matriz de tiempos (DEP-03) |
| HU-004 | Cambiar el estado del ticket con historial inmutable | 1.3 | 4 (2 del PO) | `obtenerTicket`, `cambiarEstado` | `SVC_TICKET_STATUS_LOG` (marca automática), estados | ADR-002; estados.md | Nulabilidad de `ChangedByPartyID` |
| HU-005 | Registrar interacciones visibles o internas con evidencia | 1.3 | 4 (2 del PO) | `registrarInteraccion` | `SVC_TICKET_INTERACTION`, `FirstRespondedDateTime` | seguridad.md (DLP); ADR-006 | Tipo de las columnas |
| HU-006 | Conservar los hitos temporales probatorios | 1.3 | 2 | `obtenerTicket` | Hitos de `SVC_TICKET` (`FirstResolvedDateTime`, `ResolvedDateTime`, `ClosedDateTime`) | estados.md | Tipos de columna (los nombres están en el Excel, RF-SVC-006, y en el PLT-04 §6.5) |
| HU-007 | Derivar un ticket a otra área con motivo tipificado | 1.3 | 3 (1 del PO) | `derivarTicket` | `SVC_TICKET_ASSIGNMENT_LOG` (`AssignedToPartyID`, motivo), `CurrentAreaID` | ADR-002 | Lista de motivos: el Excel (`SVC_ASSIGNMENT_REASON`) y el PLT-04 usan códigos distintos; la fija el PO |
| HU-008 | Reasignar en bloque los tickets de un colaborador que cesa | 1.3 | 3 (1 del PO) | `reasignarEnBloque` | `SVC_TICKET_ASSIGNMENT_LOG` (`REASSIGNMENT_CESE`) | ADR-009 (el rol de supervisor viene en el token de Control de acceso); HU-055 (un correo por gestor) | Quién es supervisor (Control de acceso, DEP-16); qué gestores cesan: no hay API de Control de acceso con token de servicio (P-035); código del motivo (el Excel usa `REASSIGNMENT_TERMINATION`, `REASSIGNMENT_RESIGNATION` y `REASSIGNMENT_ROTATION`) |
| HU-009 | Ver mi casillero de tareas por área y responsable | 1.3 | 3 (1 del PO) | `listarCasillero` | `CurrentAreaID` + `CurrentOwnerPartyID` | ADR-012 (vista de lectura) | Definición de «en riesgo» |
| HU-010 | Recibir una sola alerta por incumplimiento de SLA | 1.3 | 3 (1 del PO) | `consultarSla` | `SVC_SLA_BREACH_ALERT` (`FIRST_RESPONSE_OVERDUE`) | ADR-005 (job y lista de controles) | Tipo de `ReopenCycleNumber` (el Excel ya nombra la columna del ciclo, RN-SVC-008) |
| HU-011 | Reabrir un ticket con un nuevo compromiso sin borrar el original | 1.3 | 2 | `reabrirTicket` | `ReopenedResolutionDueDateTime`, `ReopenCount` | estados.md | Tipos de columna (los nombres están en el Excel, RF-SVC-011 y RN-SVC-007) |
| HU-012 | Registrar el asiento del Libro de Reclamaciones | 1.3 | 3 (1 del PO) | `registrarAsiento` | `SVC_COMPLAINT_BOOK_ENTRY` (correlativo por establecimiento, `CurrencyID`) | ADR-002 | Validación legal (DEP-05) |
| HU-013 | Calcular el plazo legal y gestionar la prórroga única | 1.3 | 4 (2 del PO) | `prorrogarPlazo` | `SVC_COMPLAINT_BOOK_ENTRY` (`ExtensionCommunicationChannelID`, justificación, cargo, fechas) | ADR-005; estados.md | Historial del plazo sin tabla propia |
| HU-014 | Registrar la respuesta formal con cargo | 1.3 | 3 (1 del PO) | `registrarRespuestaFormal` | `ResponderPartyID`, carta y cargo en `GOV_DOCUMENT_REPOSITORY` | ADR-006 (Azure Blob con inmutabilidad) | Repositorio y firma (DEP-06) |
| HU-015 | Vigilar el plazo legal y detectar reclamos huérfanos | 1.3 | 3 (1 del PO) | Job de plazo legal (ADR-005) | `SVC_SLA_BREACH_ALERT` (`LEGAL_EXTENSION_WINDOW_CLOSING`), `GOV_INTEGRITY_EXCEPTION` (`ORPHAN_REFERENCE`), `RequiresComplaintBook` | ADR-005 (3 días hábiles, control diario, plazo prorrogado) | Ninguno de datos: los valores están en el Excel (`SVC_SLA_BREACH_TYPE`, RF-SVC-010; tipos de excepción, ENT-GOV-001) |
| HU-016 | Dar seguimiento a apelaciones internas y ante INDECOPI | 1.3 | 3 (1 del PO) | `registrarApelacion`, `cambiarEstadoApelacion` | `SVC_COMPLAINT_APPEAL` (`IndecopiCaseNumber`) y su bitácora (`WITHDRAWN`) | estados.md | Código de la instancia interna (el Excel solo nombra `INDECOPI`); los 5 estados ya están en el Excel (`SVC_COMPLAINT_APPEAL_STATUS`) |
| HU-019 | Disparar la encuesta al cerrar el ticket | 1.3 | 3 (1 del PO) | Evento `ticket.closed` → encuesta (DEP-10) | `SVY_SURVEY_RESPONSE` (`SubjectEntityName`) | ADR-013 (evento de cierre); linaje.md | Columnas de la encuesta (DEP-10) |
| HU-020 | Registrar un caso sensible con Código Único | 1.3 | 2 | `registrarCasoSensible`, `reclasificarCaso` | Sin tabla en el v7: Código Único y cinco líneas de ingreso | diccionario.md (por modelar) | Modelo de casos sensibles (R-06, Mesa SGD) |
| HU-021 | Emitir cargo previo y cargo de activación por separado | 1.3 | 3 (1 del PO) | `emitirCargo` | Sin tabla en el v7: cargo previo y de activación | ADR-005 (limbo de más de 2 días hábiles) | Modelo de casos sensibles |
| HU-022 | Clasificar el riesgo del caso con matriz objetiva | 1.3 | 2 | `clasificarRiesgo` | Sin tabla en el v7: matriz de riesgo | diccionario.md | Criterios y pesos (Mesa SGD, R-08) |
| HU-023 | Escalar en cadena un caso que incumple su SLA | 1.3 | 3 (1 del PO) | `escalarCaso` | Sin tabla en el v7: niveles de escalamiento | ADR-005 (alerta temprana y cadena) | Umbrales y plazos de cada nivel |
| HU-024 | Validar casos cruzados o vinculados antes de registrar | 1.3 | 2 | `buscarCoincidencias`, `vincularCasos` | Sin tabla en el v7: vínculo entre casos | diccionario.md | Criterio de coincidencia (pregunta abierta) |
| HU-025 | Cerrar el caso con estado homologado y evidencia | 1.3 | 2 | `cerrarCaso` | Sin tabla en el v7: 8 estados homologados; referencia al GLI en `GOV_DOCUMENT_REPOSITORY` | estados.md | Códigos de los 8 estados (el Excel da los nombres, RN-SVC-019 y RF-SVC-025) |
| HU-026 | Bloquear la resolución en Eje 1/2 ante señal de conflicto | 1.3 | 3 (1 del PO) | `cambiarEstado`, `marcarConflicto`, `retirarConflicto` | Señal de conflicto sin columna conocida | estados.md (gate no compensable) | Modelo de la señal |
| HU-027 | Armar el paquete mínimo de handoff y confirmar su recepción | 1.3 | 3 (1 del PO) | `armarHandoff`, `confirmarHandoff` | Sin tabla en el v7: paquete de handoff | ADR-005 (1 día hábil sin confirmar) | Modelo del handoff; KYC (DEP-01) y cobranza (DEP-08) |
| HU-028 | Registrar la nota de estado emocional sin juicios de valor | 1.3 | 3 (1 del PO) | `registrarNotaEstado` | Sin columna conocida: nota de estado emocional | seguridad.md (palabras de juicio) | Lista de palabras de juicio |
| HU-029 | Medir el cierre end-to-end de la experiencia | 1.3 | 2 | Cálculo interno al cerrar (sin API propia) | `SVC_TICKET`, `MAE_SLA_POLICY` | ADR-005 (72 horas hábiles) | Plazo del Eje 3 |
| HU-030 | Monitorear en tiempo real y corregir antes del incumplimiento | 1.3 | 2 | `verTablero` | `SVC_TICKET`, `SVC_SLA_BREACH_ALERT` | ADR-012 (almacén de lectura) | Reasignar desde el tablero (usa `derivarTicket`) |
| HU-031 | Generar el informe diario y el quincenal | 1.3 | 2 | Informe programado | `KPI_SNAPSHOT` o `SVY_METRIC_SNAPSHOT` (candidatas) | ADR-005 (informe programado) | Fuente del NPS preliminar (DEP-10) |
| HU-032 | Auditar registros paralelos del dato de cliente | 1.3 | 2 | Auditoría programada (registros paralelos) | Auditoría sobre `PARTY` y el dato de cliente | ADR-003; ADR-005 (corte quincenal) | Cómo se detecta un registro paralelo |
| HU-033 | Registrar un reclamo de garantía vinculado a la entrega | 1.3 | 2 | `registrarReclamoGarantia` | `CONTRACT_WARRANTY_CLAIM`, `CONTRACT_UNIT_HANDOVER` | ADR-001 (escritura en otro fragmento) | Quién escribe en CONTRACT (P-014); catálogo de tipos de garantía |
| HU-034 | Validar la vigencia de la garantía contra la cobertura | 1.3 | 2 | `registrarReclamoGarantia` | `MAE_WARRANTY_COVERAGE_PERIOD` | estados.md (no procedente por vigencia) | API de Contratos (DEP-07) |
| HU-035 | Registrar la inspección técnica antes de resolver | 1.3 | 2 | `registrarInspeccion`, `resolverReclamo` | `CONTRACT_WARRANTY_CLAIM` (`APPROVED`, `REJECTED`, `RESOLVED`) | estados.md | Sin bitácora de estados del reclamo en el v7 |
| HU-036 | Escalar la garantía a Eje 3 y gestionar la adenda | 1.3 | 2 | `escalarGarantia`, `registrarAdenda` | Reutiliza la señal de conflicto de HU-026; adenda en Postventa | estados.md | Dónde se registra la adenda |
| HU-037 | Registrar el riesgo verbal y la secuencia de Frases Ancla | 1.3 | 2 | `registrarFraseAncla` | `EVT_ATTENDEE` y otras de EVENT (candidatas) | diccionario.md (por modelar) | Modelo del registro de casos sensibles del evento |
| HU-038 | Derivar de inmediato a la Estación 4 sin debate | 1.3 | 2 | `registrarCasoEvento` | Sin tabla en el v7: derivación a la Estación 4 | estados.md | Lista de palabras gatillo |
| HU-039 | Registrar el caso con la etiqueta estándar | 1.3 | 2 | `registrarCasoEvento`, `listarCasosEvento` | Registro de casos sensibles | diccionario.md | Etiqueta literal «Atención especial — derivación a Legal» |
| HU-040 | Sincronizar con Legal los tickets derivados a Eje 3 | 1.3 | 3 (1 del PO) | Adaptador de Legal (DEP-12) | `SVC_TICKET`, `SVC_TICKET_ASSIGNMENT_LOG`; `LGL_LEGAL_CASE` (candidata) | ADR-004 (cola y reintento); estados.md | Herramienta de Legal (DEP-12) |
| HU-041 | Priorizar los reclamos con riesgo de denuncia por su exposición | 1.3 | 3 (1 del PO) | Adaptador de Legal (DEP-12) | Exposición económica sin columna conocida; `SVC_COMPLAINT_BOOK_ENTRY` | ADR-004 | Tasa de interés legal y umbral (preguntas abiertas) |
| HU-042 | Atender la llamada con la ficha del cliente y registrarla en el ticket | 1.3 | 3 (1 del PO) | Evento de la central (CTI, DEP-11) + ficha | `SVC_TICKET_INTERACTION` (duración y grabación), `MAE_CHANNEL` | ADR-004; seguridad.md (2 s) | API o CTI del call center (DEP-11) |
| HU-043 | Configurar el flujo de trabajo de un tipo de ticket por área | 1.3 | 8 (6 del PO) | `configurarFlujo`, `listarPublicacionesFlujo`, `cerrarActividad` | Flujo, versión y actividades: sin tabla en el v7 (propuesta `SVC_WORKFLOW_DEFINITION`) | ADR-008 | Dónde viven flujos y pausas (P-016) |
| HU-044 | Trabajar desde una bandeja única ordenada por urgencia | 1.3 | 3 (1 del PO) | `listarBandeja` | `SVC_TICKET`, `SVC_TICKET_ASSIGNMENT_LOG` | ADR-008; ADR-012 | Asignación push o pull (pregunta abierta) |
| HU-045 | Marcar un ticket crítico con el rayo de prioridad | 1.3 | 3 (1 del PO) | `listarBandeja`, `marcarRayo` | Rayo: sin columnas conocidas | ADR-008 | Tope del 10 % y quién marca |
| HU-046 | Reasignar automáticamente al gestor con menos carga | 1.3 | 3 (1 del PO) | Orquestador: balanceo por carga al entrar el ticket (ADR-008) | `SVC_TICKET_ASSIGNMENT_LOG` (`REASSIGNMENT_CARGA`) | ADR-008 (orquestador); ADR-005 | Cómo se mide la carga (pregunta abierta); gestores del área y su disponibilidad: sin API de Control de acceso (P-035); código del motivo (no está en la lista del Excel) |
| HU-047 | Consultar la guía de solución del tipo de ticket | 1.3 | 3 (1 del PO) | `obtenerGuia` | Guía por tipo: sin tabla en el v7 (propuesta `SVC_KNOWLEDGE_ARTICLE`) | ADR-003 | Quién redacta y aprueba las guías |
| HU-048 | Recibir retroalimentación de IA mientras atiendo y cierro | 1.3 | 3 (1 del PO) | `pedirSugerenciaIa`, `decidirSugerenciaIa` | Registro de sugerencias de IA: sin tabla en el v7 (propuesta `SVC_AI_SUGGESTION_LOG`) | ADR-007; seguridad.md (anonimización) | Proveedor de IA aprobado (DEP-14) |
| HU-049 | Buscar al cliente y llamarlo desde su ficha | 1.3 | 3 (1 del PO) | `buscarClientes`, `llamarCliente` | `PARTY`; `SVC_TICKET_INTERACTION` (la llamada) | ADR-003; ADR-004 | «Llamar la cuenta» (pregunta abierta); DEP-11 |
| HU-050 | Ver la consulta 360 del cliente dentro del ticket | 1.3 | 10 (8 del PO) | `obtenerTicket`, `consulta360` | Consulta federada: `PARTY`, `CONTRACT`, `PAY_*` (candidatas); rastro en `SVC_TICKET_INTERACTION` | ADR-003 (p95 de 2 s); seguridad.md | Fuentes por sección y por rol |
| HU-051 | Continuar la atención cuando la consulta del cliente falla | 1.3 | 3 (1 del PO) | `registrarTicket`, `consulta360` | Vinculación pendiente («Interesado»): el PLT-04 §6.5 dibuja `VinculaciónPendiente` en `SVC_TICKET`; sin columna en el v7 | ADR-003; ADR-005 (reintento) | Qué es «excepción» (pregunta abierta). La clave foránea `PartyID` → `PARTY` la decidió DT-06; ATC no crea la `PARTY` del interesado: el ticket queda con la vinculación pendiente (P-037) |
| HU-052 | Consultar datos específicos con el motor de José | 1.3 | 3 (1 del PO) | `consultarMotor` | Sin tabla: `SVC_SEARCH_INDEX` del PLT-05 | ADR-004 (adaptador) | Qué expone el motor de José (DEP-13) |
| HU-053 | Buscar documentos del cliente por significado | 1.3 | 3 (1 del PO) | `buscarDocumentos` | Índice de búsqueda sin tabla; `GOV_DOCUMENT_REPOSITORY` | ADR-003; seguridad.md (permisos) | Repositorios que se indexan (DEP-06) |
| HU-054 | Ver mi avance diario y el de mi equipo | 1.3 | 3 (1 del PO) | `verTablero` | `SVC_TICKET`, `SVY_SURVEY_RESPONSE` | ADR-012 | Metas diarias (pregunta abierta) |
| HU-055 | Recibir un correo al asignarme un ticket, con copia a mi líder | 1.3 | 3 (1 del PO) | Notificación por correo al asignar (evento `ticket.assigned`) | `SVC_TICKET_ASSIGNMENT_LOG`; constancia del correo: candidata `NEX_NOTIFICATION_LOG` o cambio al v7 propuesto (`datos/registro-de-tablas.md`) | ADR-013 (evento); seguridad.md | Si el correo lleva datos del cliente (DLP); el líder del gestor: P-035 y P-036 |
| HU-056 | Abrir el caso de resolución por 3 meses impagos | 1.3 | 3 (1 del PO) | Job diario de evaluación de 3 cuotas vencidas (DEP-08; ADR-005) | `PAY_COLLECTION_CASE`, `PAY_INSTALLMENT` (candidatas) | ADR-005 (job diario); estados.md | Disparador: cuotas consecutivas o acumuladas |
| HU-057 | Enviar al cliente la alerta de cancelación en paralelo | 1.3 | 3 (1 del PO) | Evento al crear el ticket de resolución; envío en paralelo desde el outbox (ADR-013) | Constancia sin tabla propia; `SVC_TICKET_INTERACTION` | ADR-013; estados.md | Qué significa «cancelación» y su plazo |
| HU-058 | Enviar la carta de alerta al responsable del proyecto y su supervisor | 1.3 | 3 (1 del PO) | Evento al crear el ticket de resolución; carta desde plantilla (DEP-15) | Carta en `GOV_DOCUMENT_REPOSITORY` | ADR-013 | Maestro de responsables de proyecto (DEP-15); el supervisor, si es una jefatura interna: P-035 y P-036 |
| HU-059 | Registrar el ingreso de una persona al proyecto | 1.3 | 3 (1 del PO) | `registrarIngreso` | Formulario simple sin tabla (propuesta `SVC_SIMPLE_FORM_DEFINITION`) | ADR-001 | Funcionamiento sin conexión del celular |
| HU-060 | Reservar un cupo en el bus del Entrega Fest | 1.3 | 3 (1 del PO) | `reservarBus`, `cancelarReserva` | `EVT_ATTENDEE` + `EVT_TRANSPORT` (candidatas) | ADR-001 | Aforo y alcance de «Buses entrega fest» |
| HU-064 | Registrar y consultar mis tickets en Mi Portal | 1.3 | 5 (5 del PO) | `listarMisTickets`, `registrarMiTicket`, `listarTiposPortal` | `SVC_TICKET` (canal Mi Portal, subtipo); adjuntos en Azure Blob (ADR-006) | ADR-011; seguridad.md (10 MB) | Tipos y subtipos del piloto; el login es de Control de acceso (DT-04, DEP-16); el `PartyID` del cliente no viaja en el token (P-033) |
| HU-065 | Ver la trazabilidad de mi ticket | 1.3 | 4 (4 del PO) | `verTrazabilidad` | `SVC_TICKET_STATUS_LOG` (visibles), `SVC_TICKET_INTERACTION` (visible) | ADR-011; ADR-013 | Nombre del área o genérico (pregunta abierta) |
| HU-066 | Responder, adjuntar y confirmar la solución de mi ticket | 1.3 | 4 (4 del PO) | `responderMiTicket`, `confirmarSolucion` | `SVC_TICKET_INTERACTION` (autor cliente), `REOPENED` | ADR-011; estados.md (cierre automático) | Días hábiles de espera |
| HU-067 | Ver el proceso de atención en un visor 3D (operación en vivo) | 1.3 | 10 (10 del PO) | `estadoVisor` | Solo lectura: tickets, estados, asignaciones, alertas, áreas | ADR-010; ADR-012 (5 s) | Áreas de la sede del piloto |

## Requisitos no funcionales con umbral que traen las funcionalidades

Salen de la sección 3 de las 23 funcionalidades de Nexora (53 filas, 31 umbrales distintos). Varios no estaban escritos en el paquete; aquí quedan con el documento que debe aplicarlos. Un umbral «por definir» sigue abierto.

| Requisito | Qué pide | Umbral | Funcionalidades | Dónde se aplica |
|---|---|---|---|---|
| RNF-DIS-003 | Plataforma ATC en Multi-AZ | zonas_de_disponibilidad: 2 | FT-01 | ADR-014 y costo-cloud.md (Multi-AZ) |
| RNF-INT-007 | Cero registros paralelos del dato de cliente | registros_paralelos_dato_cliente: 0 | FT-01, FT-14, FT-20 | ADR-003 y HU-032 |
| RNF (propio de la FT) | Búsqueda de cliente en SIGDA/TAXON al registrar | p95 ≤ 2 s | FT-01 | ADR-003 (búsqueda del cliente en SIGDA/TAXON) |
| RNF-AUD-004 | Cinco bitácoras append-only firmadas | hash_mismatch: 0 en el job de auditoría | FT-02, FT-03, FT-04, FT-05, FT-06, FT-07, FT-10, FT-16, FT-18, FT-24 | ADR-002 (las 5: estado, asignación, libro, apelación y alertas de SLA) |
| RNF-SEC-008 | DLP en bitácoras y narrativa por rol | acceso_narrativa_por_rol: columnas de narrativa solo para roles de atención/legal | FT-02, FT-03, FT-05, FT-07, FT-08, FT-24 | seguridad.md (DLP) |
| RNF-CUM-016 | Cierre formal 100% en Mi Portal | pct_tickets_cierre_formal_mi_portal: 100% (gate no compensable, Capa 1 del NPS-C) | FT-02 | estados.md y ADR-011 (cierre formal en Mi Portal) |
| RNF-REN-003 | Matriz objetivo de SLA por tipo y prioridad | cumplimiento_sla: por definir (DEP-03) | FT-04 | ADR-005 (por definir con DEP-03) |
| RNF-REN-005 | Cierre end-to-end de la experiencia sin escalamiento | tiempo_cierre_ticket_sin_escalamiento: menor o igual a 72 horas hábiles sin escalamiento; con escalamiento, el plazo del eje correspondiente | FT-04 | ADR-005 (72 horas hábiles) |
| RNF-CUM-006 | Libro de Reclamaciones conforme a ley | reclamos_fuera_de_plazo: 0 respuestas fuera del plazo legal (o prorrogado) | FT-05 | ADR-005 (plazo legal) |
| RNF-CUM-007 | Evidencia probatoria inmutable | documentos_probatorios_sin_checksum: 0 | FT-05, FT-06, FT-09 | ADR-006 (checksum de la evidencia) |
| RNF-CUM-015 | IGDC: Índice de Gestión Documentaria y de Casos | igdc_score: IGDC = (CASOS x 0,60) + (CUSTODIA x 0,40); se multiplica por cero si hay incumplimiento de un plazo legal externo o acceso indebido a un caso sensible, cada uno de forma independiente | FT-08, FT-09, FT-14 | Calidad de datos (IGDC): por definir con Gobierno de Datos |
| RNF (propio de la FT) | Registro de inspección desde móvil en obra | Responsive, fotos ≤ 10 MB | FT-10 | G2 (pantalla móvil) y ADR-006 (fotos como evidencia) |
| RNF-INT-004 | Medición de calidad hacia el KPI Engine | tickets_cerrados_con_encuesta_disparada: 100% de CLOSED dispara POST_TRANSACTION | FT-13 | ADR-013 (evento de cierre) y HU-019 |
| RNF-USA-001 | NPS-C: North Star corporativo de experiencia | nps_c_score: NPS-C = (JOU x 0,45) + (POS x 0,35) + (EVT x 0,20); escala -100 a +100; ponderación provisional hasta calibración del primer trimestre | FT-14 | Tablero de calidad (HU-030, HU-031); ponderación provisional |
| RNF-REN-006 | Post-mortem de EntregaFest dentro de 3 días hábiles | pct_eventos_con_postmortem_a_tiempo: 100% dentro de 3 días hábiles (gate no compensable, Capa 1 del NPS post-evento) | FT-15 | ADR-005 (control de postmortem, HU-037 a 039) |
| RNF (propio de la FT) | Registro rápido desde tablet durante el evento | ≤ 3 toques para derivar | FT-15 | G2 (pantalla de derivación del EntregaFest) |
| RNF-INT-009 | Integración con Legal sin doble registro | minutos_sincronizacion_legal: ≤ 15 min; 0 casos con doble registro | FT-16 | ADR-004 (adaptador de Legal) |
| RNF-INT-008 | Integración en línea con el call center | tiempo_screen_pop: p95 ≤ 2 s | FT-17 | ADR-004 (CTI del call center) |
| RNF-USA-002 | Flujos configurables sin desarrollo | dias_configurar_flujo: ≤ 1 día hábil por flujo | FT-18, FT-25 | ADR-008 (configurar un flujo en un día hábil) |
| RNF-USA-003 | Término «Gestor de tickets» en toda la plataforma | textos_con_termino_anterior: 0 textos visibles con «agente» u «operador» | FT-18 | Textos de la interfaz: «gestor de tickets», no «agente» ni «operador» (G2) |
| RNF-SEC-009 | Uso seguro de IA | sugerencias_ia_con_datos_personales: 0; 100 % de sugerencias registradas | FT-19 | ADR-007 y seguridad.md |
| RNF-REN-007 | Respuesta del motor de búsqueda | tiempo_respuesta_busqueda: p95 ≤ 2 s (DNI/código); ≤ 3 s (semántica) | FT-20 | ADR-003 y ADR-012 (búsqueda) |
| RNF-SEC-010 | Permisos en búsqueda y consulta 360 | accesos_indebidos_busqueda: 0.0 | FT-20, FT-25 | seguridad.md (permisos del origen) |
| RNF-REN-008 | Oportunidad del correo de asignación | minutos_envio_correo_asignacion: ≤ 1 min en el 99 % de los casos | FT-21 | ADR-013 (evento ticket.assigned) |
| RNF-INT-010 | Morosidad actualizada desde Cobranza | horas_desfase_morosidad: ≤ 24 h | FT-22 | ADR-004 (adaptador de Cobranza, DEP-08) |
| RNF-AUD-005 | Constancia de alertas y cartas de resolución | alertas_con_constancia: 100 % | FT-22 | ADR-013 y ADR-006 (constancia de alertas) |
| RNF-USA-004 | Formulario simple y móvil | tiempo_completar_formulario: ≤ 1 min; máximo 6 campos obligatorios | FT-23 | Formularios simples (HU-059, HU-060; G2) |
| RNF (propio de la FT) | Mi Portal adaptable a celular: registrar un ticket en pocos pasos | Registro completo en ≤ 3 min desde un celular (prueba con 5 clientes) | FT-24 | ADR-011 (Mi Portal) y G2 |
| RNF (propio de la FT) | Acceso del cliente con código de un solo uso | Código de 6 dígitos, vence en 5 min, máximo 3 intentos | FT-24 | ADR-011 (Mi Portal) y G2. Con DT-04 lo cumple Control de acceso o el PO reescribe el criterio (P-027) |
| RNF (propio de la FT) | Actualización del visor en tiempo real | Desfase ≤ 5 s con 200 tickets activos y 30 FPS en un equipo estándar | FT-25 | ADR-010 (visor 3D) |
| RNF (propio de la FT) | Vista 2D alternativa accesible | Misma información por área; WCAG 2.1 AA | FT-25 | ADR-010 (visor 3D) |

## Estado de DoR (G4) de las funcionalidades

Los 23 DoR de Nexora dicen **NO READY** en todos los casos; el PLT-05 los evalúa «con condiciones». El criterio 5 de cada DoR exige el G3 cerrado: este paquete es la parte técnica de esa condición. Las condiciones son las dependencias (DEP) y decisiones que ya figuran en el roadmap y en `decisiones.md`. **26-oct:** la sección 2 de cada DoR tiene las DEP de sus historias (bloque «Depende de» de cada HU); la DEP-16 está en los 10 DoR cuyas historias autentican, autorizan por rol o leen líderes o al cliente autenticado (FT-01, 02, 03, 07, 18, 20, 21, 22, 24 y 25).

| Funcionalidad | Nombre | Resultado (PLT-05) | Condición | Decisión del DoR |
|---|---|---|---|---|
| FT-01 | Registro multicanal y tipificación | CON CONDICIONES | DEP-01 contrato + simulador; además DEP-16 (rol de atención, HU-001) | NO READY |
| FT-02 | Ciclo de vida, interacciones e hitos | CON CONDICIONES | DEP-16 Control de acceso (roles en el token; reemplaza a DEP-02) | NO READY |
| FT-03 | Derivación, reasignación y casillero | CON CONDICIONES | DEP-16 Control de acceso (reemplaza a DEP-02) | NO READY |
| FT-04 | Motor SLA y alertas | CON CONDICIONES | DEP-03 matriz provisional al 20-oct | NO READY |
| FT-05 | Libro de Reclamaciones | CON CONDICIONES | DEP-05 textos al lun 26-oct | NO READY |
| FT-06 | Apelaciones internas e INDECOPI | CON CONDICIONES | DEP-06 repositorio documental (Azure Blob, ADR-006); además DEP-05 (RN-SVC-010, HU-016) | NO READY |
| FT-07 | Gate de derivación a Eje 3 y handoff | CON CONDICIONES | DEP-01 · DEP-08; además DEP-16 (supervisor, HU-026 y HU-027) | NO READY |
| FT-08 | Mesa SGD: recepción, activación y riesgo | CON CONDICIONES | Plazos de línea SGD (DEP-03, ahora en la sección 2 del DoR) | NO READY |
| FT-09 | Escalamiento, vinculación y cierre tipificado | CON CONDICIONES | Umbrales de escalamiento | NO READY |
| FT-10 | Reclamos de garantía postventa | CON CONDICIONES | DEP-07 Contratos | NO READY |
| FT-13 | Encuesta post-atención | CON CONDICIONES | DEP-10 KPI Engine | NO READY |
| FT-14 | Torre de Control CX | CON CONDICIONES | DEP-10 | NO READY |
| FT-15 | EntregaFest: contención en vivo | CON CONDICIONES | Modelo de casos del evento (día 1) | NO READY |
| FT-16 | Integración con Legal y prevención de denuncias | CON CONDICIONES | DEP-12 herramienta de Legal · 8% (DEP-05, HU-041) | NO READY |
| FT-17 | Integración con la plataforma del call center | CON CONDICIONES | DEP-11 call center (por evaluar) | NO READY |
| FT-18 | Bandeja orquestadora y flujos por área | CON CONDICIONES | Push o pull · quién marca el rayo | NO READY |
| FT-19 | Asistencia al gestor: guía e IA | CON CONDICIONES | DEP-14 proveedor de IA | NO READY |
| FT-20 | Búsqueda y consulta 360 del cliente | CON CONDICIONES | DEP-01 · DEP-13 · «llamar la cuenta»; además DEP-16 (datos por rol, HU-050, 052 y 053) | NO READY |
| FT-21 | Productividad y notificaciones del gestor | CON CONDICIONES | DEP-16 líder de cada gestor (API de Control de acceso; reemplaza a DEP-02) | NO READY |
| FT-22 | Resolución de contrato por morosidad | CON CONDICIONES | DEP-08 · DEP-15 · causal legal (DEP-05); además DEP-16 (supervisor interno, HU-058) | NO READY |
| FT-23 | Formularios simples: ingreso al proyecto y Entrega Fest | CON CONDICIONES | Alcance de «buses» · conectividad | NO READY |
| FT-24 | Autogestión de tickets del cliente en Mi Portal | CON CONDICIONES | Acceso del cliente (ADR-11; con DT-04, login de Control de acceso: DEP-16) · DEP-01 contacto · diseño de Mi Portal | NO READY |
| FT-25 | Visor del proceso 3D (operación en vivo) | CON CONDICIONES | Áreas de la sede · eventos de HU-043/044 · ADR-10; además DEP-16 (permisos por área, HU-067) | NO READY |

## Qué cambió en Nexora el 20-oct-2026

- Se publicaron **11 épicas, 23 funcionalidades y 23 DoR**; las 8 épicas, 18 funcionalidades y 18 DoR nuevas están en v1 y las que ya existían subieron a v2. El paquete v1.3 de 119 documentos del equipo ya está completo en Nexora.
- Todo sigue **pendiente de aprobación**: 0 aprobados en las carpetas `analisis`, `roadmap`, `epicas`, `features`, `historias`, `dor`, `adr`, `arquitectura`, `datos` y `gates`.

## Proceso de atención de prospectos (C-06)

No es una historia del PLT-04 v1.3. Los casos que Control de acceso deriva a ATC (correo distinto, DNI tomado, suplantación y prospecto por validar) se proponen como tipos de ticket en `analisis/proceso-atencion-prospectos.md`, sin operaciones nuevas y sin horas en el plan de 243 h. Es alcance nuevo para el PO (P-041).

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-19 a 2026-10-22 | Jesús Chávez Elías y Brayan Hurtado, con IA | Contraste de las 62 historias con el paquete G3 y decisiones del 22-oct (versiones de Nexora hasta la v3) |
| 0.2 | 2026-10-26 | Brayan Hurtado, con IA | El `PartyID` → `PARTY` ya no es conflicto abierto (DT-06); dependencias de Control de acceso por historia (P-033, P-035, P-036, P-037); se retira `IDN_SYSTEM_TASK` de HU-055; condiciones de DoR con las DEP de las historias; nota del proceso de prospectos (C-06) |

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v1 de Jesús Chávez Elías en Nexora; actualizado por Brayan con IA (Claude, 2026-10-21) a la v1.3 del PO: columnas y listas que ya da el Excel, conflictos abiertos señalados y sin referencias a versiones anteriores. — Revisado por: (pendiente)

Actualizado el 22-oct-2026 por Jesús Chávez Elías con IA (Claude) a partir de la revisión del Líder Técnico (DT-03, DT-04, DT-07 y ADR-001 de `analisis/decisiones.md` v0.3). — Revisado por: (pendiente)

Actualizado el 26-oct-2026 por Brayan Hurtado con IA (Claude) a partir de la revisión del Líder Técnico del 22-oct (DT-06, C-06, C-11 y C-12) y de las dependencias de las historias. — Revisado por: (pendiente)
