---
id: "SPEC-ARQ-OPERACIONES"
tipo: "spec"
titulo: "Operaciones de API por historia de usuario"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.7"
owner: "Jesús Chávez Elías"
aprobadores: [tech_lead]
fecha: "2026-10-27"
relacionados: [ADR-001, ADR-012]
tags: [arquitectura, api, g3]
---

# Operaciones de API por historia

Los módulos van con su nombre en inglés (ADR-001) y son las etiquetas del contrato; HU-064 no tiene operaciones de código ni de sesión (DT-04). El contrato `aybar-atc.openapi.yaml` declara el permiso de cada operación (`x-permiso`; `roles-y-permisos-atc.md`).

Trazabilidad entre las 62 historias publicadas en PJ-06 (PLT-04 v1.3) y `aybar-atc.openapi.yaml`. Es una **propuesta** del equipo: el PLT no define endpoints. Revisión del 26-oct-2026 (revisión interna del equipo, O-02): todas las historias tienen al menos una operación. Cuando G2 pida un dato que no esté en el contrato, vuelve a G3 (`.agents/orquestacion.md`).

Resumen: las 62 historias tienen al menos una operación en el contrato `aybar-atc.openapi.yaml` (69 operaciones); **en la Etapa 1, las 57 historias, todas con `ui: true`, tienen operación**, con `x-roles` (o, en Mi Portal, `x-autorizacion`), `x-permiso` del catálogo y errores `AYB-<ÁREA>-<HTTP>` (lo comprueba el script de cruce de la entrega). Las 13 que antes no tenían API propia (eventos, jobs o adaptadores) siguen con su mecanismo, en la columna «Además», y suman la operación de lectura que su pantalla necesita (revisión interna del equipo, O-02). HU-ATC-037, 038, 039, 048 y 053 salen de la Etapa 1 (P-025): sus 6 operaciones (`registrarFraseAncla`, `registrarCasoEvento`, `listarCasosEvento`, `pedirSugerenciaIa`, `decidirSugerenciaIa` y `buscarDocumentos`) quedan en el contrato y no se construyen en la Etapa 1. Las tareas de `backlog/tareas/` nombran cada endpoint con su método, su ruta y su `operationId` del contrato.

| Historia | Título | Módulo | Operación (`operationId`) | Estado | Además |
|---|---|---|---|---|---|
| HU-001 | Registrar un ticket tipificado desde cualquier canal | `tickets` | `POST /api/v1/tickets` (`registrarTicket`) | en el OpenAPI | — |
| HU-002 | Entregar al cliente un número de ticket por razón social | `tickets` | `POST /api/v1/tickets` (`registrarTicket`) | en el OpenAPI | — |
| HU-003 | Congelar el SLA del ticket al abrirlo | `sla` | `GET /api/v1/tickets/{ticketId}/sla` (`consultarSla`) | en el OpenAPI | — |
| HU-004 | Cambiar el estado del ticket con historial inmutable | `tickets` | `GET /api/v1/tickets/{ticketId}` (`obtenerTicket`)<br>`POST /api/v1/tickets/{ticketId}/estado` (`cambiarEstado`) | en el OpenAPI | — |
| HU-005 | Registrar interacciones visibles o internas con evidencia | `tickets` | `GET /api/v1/tickets/{ticketId}` (`obtenerTicket`)<br>`POST /api/v1/tickets/{ticketId}/interacciones` (`registrarInteraccion`) | en el OpenAPI | — |
| HU-006 | Conservar los hitos temporales probatorios | `tickets` | `GET /api/v1/tickets/{ticketId}` (`obtenerTicket`) | en el OpenAPI | — |
| HU-007 | Derivar un ticket a otra área con motivo tipificado | `tickets` | `POST /api/v1/tickets/{ticketId}/derivaciones` (`derivarTicket`) | en el OpenAPI | — |
| HU-008 | Reasignar en bloque los tickets de un colaborador que cesa | `tickets` | `POST /api/v1/colaboradores/{colaboradorId}/reasignaciones` (`reasignarEnBloque`) | en el OpenAPI | — |
| HU-009 | Ver mi casillero de tareas por área y responsable | `inbox` | `GET /api/v1/casillero` (`listarCasillero`) | en el OpenAPI | — |
| HU-010 | Recibir una sola alerta por incumplimiento de SLA | `sla` | `GET /api/v1/tickets/{ticketId}/sla` (`consultarSla`) | en el OpenAPI | — |
| HU-011 | Reabrir un ticket con un nuevo compromiso sin borrar el original | `tickets` | `POST /api/v1/tickets/{ticketId}/reaperturas` (`reabrirTicket`) | en el OpenAPI | — |
| HU-012 | Registrar el asiento del Libro de Reclamaciones | `complaintbook` | `POST /api/v1/libro/asientos` (`registrarAsiento`) | en el OpenAPI | — |
| HU-013 | Calcular el plazo legal y gestionar la prórroga única | `complaintbook` | `POST /api/v1/libro/asientos/{asientoId}/prorroga` (`prorrogarPlazo`)<br>`GET /api/v1/libro/vigilancia` (`consultarVigilanciaLibro`) | en el OpenAPI | Prórroga deshabilitada por la Ley 31435 (ED-28) |
| HU-014 | Registrar la respuesta formal con cargo | `complaintbook` | `POST /api/v1/libro/asientos/{asientoId}/respuesta` (`registrarRespuestaFormal`) | en el OpenAPI | — |
| HU-015 | Vigilar el plazo legal y detectar reclamos huérfanos | `complaintbook` | `GET /api/v1/libro/vigilancia` (`consultarVigilanciaLibro`) | en el OpenAPI | Job de plazo legal y control diario de huérfanos (ADR-005) |
| HU-016 | Dar seguimiento a apelaciones internas y ante INDECOPI | `complaintbook` | `POST /api/v1/libro/asientos/{asientoId}/apelaciones` (`registrarApelacion`)<br>`POST /api/v1/libro/asientos/{asientoId}/apelaciones/{apelacionId}/estado` (`cambiarEstadoApelacion`) | en el OpenAPI | — |
| HU-019 | Disparar la encuesta al cerrar el ticket | `quality` | `GET /api/v1/metricas/csat-ces` (`consultarCsatCes`) | en el OpenAPI | Evento `aybar.service.ticket_status_changed` al pasar a `CLOSED` → encuesta (ADR-013; DEP-10) |
| HU-020 | Registrar un caso sensible con Código Único | `legalcases` | `POST /api/v1/casos-sensibles` (`registrarCasoSensible`)<br>`POST /api/v1/casos-sensibles/{casoId}/reclasificacion` (`reclasificarCaso`) | en el OpenAPI | — |
| HU-021 | Emitir cargo previo y cargo de activación por separado | `legalcases` | `POST /api/v1/casos-sensibles/{casoId}/cargos` (`emitirCargo`) | en el OpenAPI | — |
| HU-022 | Clasificar el riesgo del caso con matriz objetiva | `legalcases` | `PUT /api/v1/casos-sensibles/{casoId}/riesgo` (`clasificarRiesgo`) | en el OpenAPI | — |
| HU-023 | Escalar en cadena un caso que incumple su SLA | `legalcases` | `POST /api/v1/casos-sensibles/{casoId}/escalamientos` (`escalarCaso`) | en el OpenAPI | — |
| HU-024 | Validar casos cruzados o vinculados antes de registrar | `legalcases` | `GET /api/v1/casos-sensibles/coincidencias` (`buscarCoincidencias`)<br>`POST /api/v1/casos-sensibles/{casoId}/vinculos` (`vincularCasos`) | en el OpenAPI | — |
| HU-025 | Cerrar el caso con estado homologado y evidencia | `legalcases` | `POST /api/v1/casos-sensibles/{casoId}/cierre` (`cerrarCaso`) | en el OpenAPI | — |
| HU-026 | Bloquear la resolución en Eje 1/2 ante señal de conflicto | `legalcases, tickets` | `POST /api/v1/tickets/{ticketId}/estado` (`cambiarEstado`)<br>`POST /api/v1/tickets/{ticketId}/conflicto` (`marcarConflicto`)<br>`POST /api/v1/tickets/{ticketId}/conflicto/retiro` (`retirarConflicto`) | en el OpenAPI | — |
| HU-027 | Armar el paquete mínimo de handoff y confirmar su recepción | `legalcases` | `POST /api/v1/tickets/{ticketId}/handoff` (`armarHandoff`)<br>`POST /api/v1/tickets/{ticketId}/handoff/confirmacion` (`confirmarHandoff`) | en el OpenAPI | — |
| HU-028 | Registrar la nota de estado emocional sin juicios de valor | `legalcases` | `POST /api/v1/tickets/{ticketId}/notas-estado` (`registrarNotaEstado`) | en el OpenAPI | — |
| HU-029 | Medir el cierre end-to-end de la experiencia | `inbox` | `GET /api/v1/tablero` (`verTablero`) | en el OpenAPI | Cálculo al cerrar y job de 72 horas hábiles (ADR-005) |
| HU-030 | Monitorear en tiempo real y corregir antes del incumplimiento | `inbox` | `GET /api/v1/tablero` (`verTablero`) | en el OpenAPI | — |
| HU-031 | Generar el informe diario y el quincenal | `quality` | `GET /api/v1/torre-control/informes` (`listarInformes`) | en el OpenAPI | Informe programado (ADR-005) |
| HU-032 | Auditar registros paralelos del dato de cliente | `quality` | `GET /api/v1/torre-control/auditoria-registros-paralelos` (`consultarAuditoriaRegistrosParalelos`) | en el OpenAPI | Auditoría programada quincenal (ADR-005) |
| HU-033 | Registrar un reclamo de garantía vinculado a la entrega | `aftersales` | `POST /api/v1/postventa/reclamos` (`registrarReclamoGarantia`) | en el OpenAPI | — |
| HU-034 | Validar la vigencia de la garantía contra la cobertura | `aftersales` | `POST /api/v1/postventa/reclamos` (`registrarReclamoGarantia`) | en el OpenAPI | — |
| HU-035 | Registrar la inspección técnica antes de resolver | `aftersales` | `POST /api/v1/postventa/reclamos/{reclamoId}/inspecciones` (`registrarInspeccion`)<br>`POST /api/v1/postventa/reclamos/{reclamoId}/resolucion` (`resolverReclamo`) | en el OpenAPI | — |
| HU-036 | Escalar la garantía a Eje 3 y gestionar la adenda | `aftersales` | `POST /api/v1/postventa/reclamos/{reclamoId}/escalamiento` (`escalarGarantia`)<br>`POST /api/v1/postventa/reclamos/{reclamoId}/adenda` (`registrarAdenda`) | en el OpenAPI | — |
| HU-037 | Registrar el riesgo verbal y la secuencia de Frases Ancla | `tickets` | `POST /api/v1/entregafest/frases-ancla` (`registrarFraseAncla`) | en el OpenAPI · fuera de la Etapa 1 (P-025) | — |
| HU-038 | Derivar de inmediato a la Estación 4 sin debate | `tickets` | `POST /api/v1/entregafest/casos` (`registrarCasoEvento`) | en el OpenAPI · fuera de la Etapa 1 (P-025) | — |
| HU-039 | Registrar el caso con la etiqueta estándar | `tickets` | `POST /api/v1/entregafest/casos` (`registrarCasoEvento`)<br>`GET /api/v1/entregafest/casos` (`listarCasosEvento`) | en el OpenAPI · fuera de la Etapa 1 (P-025) | — |
| HU-040 | Sincronizar con Legal los tickets derivados a Eje 3 | `legalcases` | `GET /api/v1/tickets/{ticketId}/legal` (`consultarSincronizacionLegal`) | en el OpenAPI | Adaptador de Legal con reintento (ADR-004; DEP-12) |
| HU-041 | Priorizar los reclamos con riesgo de denuncia por su exposición | `legalcases, tickets` | `GET /api/v1/tickets/{ticketId}` (`obtenerTicket`)<br>`GET /api/v1/torre-control/riesgo-denuncia` (`listarRiesgoDenuncia`) | en el OpenAPI | Adaptador de Legal para la alerta (DEP-12) |
| HU-042 | Atender la llamada con la ficha del cliente y registrarla en el ticket | `customer360, tickets` | `POST /api/v1/tickets/{ticketId}/interacciones` (`registrarInteraccion`)<br>`GET /api/v1/call-center/screen-pop` (`obtenerFichaLlamada`) | en el OpenAPI | Adaptador CTI de la central (DEP-11) |
| HU-043 | Configurar el flujo de trabajo de un tipo de ticket por área | `inbox, tickets` | `PUT /api/v1/flujos/{tipoId}/{subtipoId}/{areaId}` (`configurarFlujo`)<br>`GET /api/v1/flujos/publicaciones` (`listarPublicacionesFlujo`)<br>`POST /api/v1/tickets/{ticketId}/actividades/{numero}/cierre` (`cerrarActividad`)<br>`GET /api/v1/avisos` (`listarAvisos`) | en el OpenAPI | — |
| HU-044 | Trabajar desde una bandeja única ordenada por urgencia | `inbox` | `GET /api/v1/bandeja` (`listarBandeja`) | en el OpenAPI | — |
| HU-045 | Marcar un ticket crítico con el rayo de prioridad | `inbox` | `GET /api/v1/bandeja` (`listarBandeja`)<br>`POST /api/v1/tickets/{ticketId}/rayo` (`marcarRayo`) | en el OpenAPI | — |
| HU-046 | Reasignar automáticamente al gestor con menos carga | `inbox` | `GET /api/v1/bandeja/carga` (`consultarCargaGestores`)<br>`GET /api/v1/avisos` (`listarAvisos`) | en el OpenAPI | Orquestador: balanceo por carga al entrar el ticket (ADR-005, punto 8; ADR-008) |
| HU-047 | Consultar la guía de solución del tipo de ticket | `inbox` | `GET /api/v1/tickets/{ticketId}/guia` (`obtenerGuia`)<br>`GET /api/v1/avisos` (`listarAvisos`) | en el OpenAPI | — |
| HU-048 | Recibir retroalimentación de IA mientras atiendo y cierro | `inbox` | `POST /api/v1/tickets/{ticketId}/sugerencias-ia` (`pedirSugerenciaIa`)<br>`POST /api/v1/tickets/{ticketId}/sugerencias-ia/{sugerenciaId}/decision` (`decidirSugerenciaIa`) | en el OpenAPI · fuera de la Etapa 1 (P-025) | — |
| HU-049 | Buscar al cliente y llamarlo desde su ficha | `customer360` | `GET /api/v1/clientes` (`buscarClientes`)<br>`POST /api/v1/clientes/{partyId}/llamadas` (`llamarCliente`) | en el OpenAPI | — |
| HU-050 | Ver la consulta 360 del cliente dentro del ticket | `customer360, tickets` | `GET /api/v1/tickets/{ticketId}` (`obtenerTicket`)<br>`GET /api/v1/clientes/{partyId}/consulta-360` (`consulta360`) | en el OpenAPI | — |
| HU-051 | Continuar la atención cuando la consulta del cliente falla | `customer360, tickets` | `POST /api/v1/tickets` (`registrarTicket`)<br>`GET /api/v1/clientes/{partyId}/consulta-360` (`consulta360`) | en el OpenAPI | — |
| HU-052 | Consultar datos específicos con el motor de José | `customer360` | `POST /api/v1/tickets/{ticketId}/consultas-motor` (`consultarMotor`) | en el OpenAPI | — |
| HU-053 | Buscar documentos del cliente por significado | `customer360` | `GET /api/v1/clientes/{partyId}/documentos` (`buscarDocumentos`) | en el OpenAPI · fuera de la Etapa 1 (P-025) | — |
| HU-054 | Ver mi avance diario y el de mi equipo | `inbox` | `GET /api/v1/tablero` (`verTablero`) | en el OpenAPI | — |
| HU-055 | Recibir un correo al asignarme un ticket, con copia a mi líder | `inbox` | `GET /api/v1/avisos` (`listarAvisos`) | en el OpenAPI | Correo por el evento `aybar.service.ticket_assigned` (ADR-013) |
| HU-056 | Abrir el caso de resolución por 3 meses impagos | `delinquency` | `GET /api/v1/casos-resolucion` (`listarCasosResolucion`) | en el OpenAPI | Job diario de 3 cuotas vencidas (DEP-08; ADR-005) |
| HU-057 | Enviar al cliente la alerta de cancelación en paralelo | `delinquency` | `GET /api/v1/casos-resolucion` (`listarCasosResolucion`) | en el OpenAPI | Evento al crear el ticket de resolución (ADR-013); envío en paralelo |
| HU-058 | Enviar la carta de alerta al responsable del proyecto y su supervisor | `delinquency` | `GET /api/v1/casos-resolucion` (`listarCasosResolucion`) | en el OpenAPI | Evento al crear el ticket de resolución; carta desde plantilla (DEP-15) y control a 2 días hábiles (ADR-005) |
| HU-059 | Registrar el ingreso de una persona al proyecto | `delinquency` | `POST /api/v1/formularios/ingresos` (`registrarIngreso`) | en el OpenAPI | — |
| HU-060 | Reservar un cupo en el bus del Entrega Fest | `delinquency` | `POST /api/v1/formularios/reservas-bus` (`reservarBus`)<br>`POST /api/v1/formularios/reservas-bus/{reservaId}/cancelacion` (`cancelarReserva`) | en el OpenAPI | — |
| HU-064 | Registrar y consultar mis tickets en Mi Portal | `portal` | `GET /api/v1/portal/tickets` (`listarMisTickets`)<br>`POST /api/v1/portal/tickets` (`registrarMiTicket`)<br>`GET /api/v1/portal/tipos` (`listarTiposPortal`) | en el OpenAPI (el login es de Control de acceso: se retiran las operaciones de código y sesión, DT-04) | — |
| HU-065 | Ver la trazabilidad de mi ticket | `portal` | `GET /api/v1/portal/tickets/{ticketId}/trazabilidad` (`verTrazabilidad`) | en el OpenAPI | — |
| HU-066 | Responder, adjuntar y confirmar la solución de mi ticket | `portal` | `POST /api/v1/portal/tickets/{ticketId}/respuestas` (`responderMiTicket`)<br>`POST /api/v1/portal/tickets/{ticketId}/confirmacion` (`confirmarSolucion`) | en el OpenAPI | — |
| HU-067 | Ver el proceso de atención en un visor 3D (operación en vivo) | `inbox` | `GET /api/v1/visor/estado` (`estadoVisor`) | en el OpenAPI | — |

## Operaciones que dependen de Control de acceso (PJ-05): decisiones del equipo que aplican

Lo que cada operación necesita de Control de acceso tiene una decisión del equipo (Brayan Hurtado), 26-oct-2026, propuesta al Líder Técnico en este envío (`analisis/decisiones.md`). ATC no guarda usuarios, roles, líderes ni sesiones (DT-03, C-11).

| Historias | Qué necesitan | Decisión del equipo |
|---|---|---|
| Todas las operaciones del contrato | Token del emisor de Control de acceso | DEP-16 como riesgo aceptado con mitigación: en local y mientras el área no esté en DEV, el emisor de pruebas `herramientas/emisor-local.mjs` del repo `AybarCorp/aybar-access-control-deus`, con `aud=aybar-atc` (ED-06, ED-08) |
| Todas las que exigen `x-permiso` | Cómo se autoriza | Por rol del token, `@PreAuthorize(hasAnyRole(x-roles))`; `x-permiso` es el permiso del catálogo (ED-02) |
| HU-008, HU-046, HU-054, HU-055, HU-058, HU-067 | Gestores de un área, gestor que cesa, disponibilidad y líder | Gestores de la cola según la bitácora de asignaciones de ATC; líder = `ATC_SUPERVISOR` del token; avisos a un rol y una cola; el responsable del proyecto (HU-058) sale de la DEP-15 (ED-03) |
| HU-044, HU-045, HU-054, HU-055, HU-023, HU-027 | Áreas y jefaturas | `MAE_AREA` solo como cola; el área de cada rol es un parámetro de ATC; HU-023 usa la matriz de escalamiento de la Mesa SGD (ED-04) |
| HU-001, HU-049, HU-050, HU-051 | El interesado que no está en `PARTY` | Ticket «sin cliente vinculado» con sus datos mínimos en `SVC_TICKET_PROSPECT`; el job de vinculación completa el `PartyID` cuando Control de acceso crea la `PARTY` (ED-05) |
| HU-060, HU-064, HU-065, HU-066 | El `PartyID` del cliente, que no viaja en el token, y quién entra | `CuentaPersonaPort` sobre `IDN_USER_ACCOUNT`, con el `SELECT` por columna que otorga el dueño de la tabla (entregable de la DEP-16); Mi Portal autoriza por cuenta de tipo `CUSTOMER` activa, sin rol (`x-roles: []` y `x-autorizacion`; ED-01) |

## Proceso de atención de prospectos (C-06)

**Decisión del coordinador del 26-oct (C-06):** en la Etapa 1 entra el tipo de ticket «Validación de identidad (prospecto)» con 4 subtipos («Correo distinto», «DNI ya registrado por otra persona», D-84; «Posible suplantación», D-291; y «Otro caso de identidad»), en la cola `ATC` (ADR-008, combinaciones 12 a 15). **No agrega operaciones ni horas:** el gestor lo registra con `registrarTicket` (tipificación de HU-001), lo deriva con `derivarTicket` (HU-007) al supervisor de la cola `ATC` que tiene `PROSPECT_VALIDATOR` y lo cierra con `cambiarEstado`, siguiendo el flujo por defecto del área (HU-043). ATC no valida: la validación se hace en la consola de Control de acceso y la suspensión del impostor la hace `IT_ADMIN` (ED-09). `analisis/proceso-atencion-prospectos.md` describe el proceso completo.

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-19 a 2026-10-22 | Jesús Chávez Elías, con IA | Operaciones por historia; módulos en inglés y sin operaciones de código ni sesión en HU-064 (DT-04) |
| 0.2 | 2026-10-26 | Brayan Hurtado, con IA | Lo que cada operación necesita de Control de acceso, con su pregunta (P-033 a P-037; DEP-16), y el proceso de atención de prospectos (C-06), sin operaciones nuevas |
| 0.3 | 2026-10-26 | Brayan Hurtado, con IA | Eventos con el formato de tópico del SDK de ADR-013 v0.3 (`aybar.service.ticket_status_changed` y `aybar.service.ticket_assigned`) y outbox `SVC_OUTBOX_EVENT` |
| 0.3 | 2026-10-26 | Brayan Hurtado, con IA | Barrido de coherencia (misma versión, sin cambio de contenido): el contrato se cita en su versión vigente, `0.5.0-borrador` (decía v0.3). |
| 0.4 | 2026-10-26 | Brayan Hurtado, con IA | Decisiones del equipo de `analisis/decisiones.md` v0.7: la tabla de lo que falta de Control de acceso pasa a «decisiones del equipo que aplican» (ED-01 a ED-05 y ED-08); prospectos fuera de la Etapa 1 (ED-09); contrato `0.6.0-borrador` |
| 0.5 | 2026-10-26 | Brayan Hurtado, con IA | P-025 decidida por el equipo (`analisis/decisiones.md` v0.8): HU-ATC-037, 038, 039, 048 y 053 fuera de la Etapa 1; sus 6 operaciones siguen en el contrato y no se construyen en la Etapa 1; en la Etapa 1, 44 historias con operación y 13 sin API propia |
| 0.6 | 2026-10-26 | Brayan Hurtado, con IA | Revisión interna del equipo (O-02): tabla regenerada desde el contrato 0.7.0-borrador, con método, ruta y `operationId`; las 57 historias de la Etapa 1 tienen operación (antes 13 no la tenían: 015, 019, 029, 031, 032, 040, 041, 042, 046, 055, 056, 057 y 058), y su mecanismo de evento, job o adaptador queda en «Además»; Mi Portal por cuenta `CUSTOMER` activa (O-07); prospectos con el tipo «Validación de identidad (prospecto)» en la Etapa 1 (decisión del coordinador, C-06). Citas a documentos del paquete sin número de versión, que lo fija Nexora (O-22). Desde esta versión cada cambio de texto sube la versión (O-26) |
| 0.7 | 2026-10-27 | Brayan Hurtado, con IA | Sin cambio de contenido: las revisiones del 26-oct se citan como internas del equipo, no del Líder Técnico (`analisis/decisiones.md`, nota del 27-oct) |

Generado por IA: borrador completo (Claude, 2026-10-19) — Revisado por: (pendiente)

Actualizado el 22-oct-2026 por Jesús Chávez Elías con IA (Claude) a partir de la revisión del Líder Técnico (DT-03, DT-04, DT-07 y ADR-001 de `analisis/decisiones.md` v0.3). — Revisado por: (pendiente)

Actualizado el 26-oct-2026 por Brayan Hurtado con IA (Claude) a partir de la revisión del Líder Técnico del 22-oct (C-06, C-07, C-11 y C-12) y del paquete aprobado de PJ-05. — Revisado por: (pendiente)

Actualizado el 26-oct-2026 (v0.3) por Brayan Hurtado con IA (Claude) a partir de la revisión técnica interna del 26-oct (hallazgo 15): nombres de evento con el formato de tópico del SDK. — Revisado por: (pendiente)

Actualizado el 26-oct-2026 (v0.4) por Brayan Hurtado con IA (Claude): decisiones del equipo ED-01 a ED-06, ED-08 y ED-09 de `analisis/decisiones.md` v0.7. — Revisado por: (pendiente)

Actualizado el 26-oct-2026 (v0.5) por Brayan Hurtado con IA (Claude): P-025 decidida por el equipo (`analisis/decisiones.md` v0.8); operaciones de las 5 HU fuera de la Etapa 1. — Revisado por: (pendiente)

Actualizado el 26-oct-2026 (v0.6) por Brayan Hurtado con IA (Claude): revisión interna del equipo (O-02 y O-07) y decisión del coordinador sobre C-06. — Revisado por: (pendiente)
