---
id: "SPEC-ARQ-OPERACIONES"
tipo: "spec"
titulo: "Operaciones de API por historia de usuario"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.1"
owner: "[por asignar: arquitecto / TL]"
aprobadores: []
fecha: "2026-10-19"
relacionados: [ADR-001, ADR-012]
tags: [arquitectura, api, g3]
---

# Operaciones de API por historia

Trazabilidad entre las 62 historias publicadas en PJ-06 (PLT-04 v1.3) y `aybar-atc.openapi.yaml`. Es una **propuesta** del equipo: el PLT no define endpoints. Revisión del 20-oct-2026: las historias sin operación (casos sensibles, garantía, EntregaFest, formularios, guía, IA, tablero) ya tienen una; las que quedan sin API propia son eventos, jobs o adaptadores. Cuando G2 pida un dato que no esté en el contrato, vuelve a G3 (`.agents/orquestacion.md`).

Resumen: 49 historias con operación en el OpenAPI, 13 sin API propia (evento, job o adaptador) y 0 por añadir.

| Historia | Título | Módulo | Operación | Estado |
|---|---|---|---|---|
| HU-001 | Registrar un ticket tipificado desde cualquier canal | `tickets` | `POST /api/v1/tickets` | en el OpenAPI |
| HU-002 | Entregar al cliente un número de ticket por razón social | `tickets` | `POST /api/v1/tickets` | en el OpenAPI |
| HU-003 | Congelar el SLA del ticket al abrirlo | `sla` | `GET /api/v1/tickets/{ticketId}/sla` | en el OpenAPI |
| HU-004 | Cambiar el estado del ticket con historial inmutable | `tickets` | `GET /api/v1/tickets/{ticketId}`<br>`POST /api/v1/tickets/{ticketId}/estado` | en el OpenAPI |
| HU-005 | Registrar interacciones visibles o internas con evidencia | `tickets` | `POST /api/v1/tickets/{ticketId}/interacciones` | en el OpenAPI |
| HU-006 | Conservar los hitos temporales probatorios | `tickets` | `GET /api/v1/tickets/{ticketId}` | en el OpenAPI |
| HU-007 | Derivar un ticket a otra área con motivo tipificado | `sla` | `POST /api/v1/tickets/{ticketId}/derivaciones` | en el OpenAPI |
| HU-008 | Reasignar en bloque los tickets de un colaborador que cesa | `sla` | `POST /api/v1/colaboradores/{colaboradorId}/reasignaciones` | en el OpenAPI |
| HU-009 | Ver mi casillero de tareas por área y responsable | `sla` | `GET /api/v1/casillero` | en el OpenAPI |
| HU-010 | Recibir una sola alerta por incumplimiento de SLA | `sla` | `GET /api/v1/tickets/{ticketId}/sla` | en el OpenAPI |
| HU-011 | Reabrir un ticket con un nuevo compromiso sin borrar el original | `sla` | `POST /api/v1/tickets/{ticketId}/reaperturas` | en el OpenAPI |
| HU-012 | Registrar el asiento del Libro de Reclamaciones | `libro` | `POST /api/v1/libro/asientos` | en el OpenAPI |
| HU-013 | Calcular el plazo legal y gestionar la prórroga única | `libro` | `POST /api/v1/libro/asientos/{asientoId}/prorroga` | en el OpenAPI |
| HU-014 | Registrar la respuesta formal con cargo | `libro` | `POST /api/v1/libro/asientos/{asientoId}/respuesta` | en el OpenAPI |
| HU-015 | Vigilar el plazo legal y detectar reclamos huérfanos | `libro` | Job de plazo legal (ADR-005) | sin API propia (evento, job o adaptador) |
| HU-016 | Dar seguimiento a apelaciones internas y ante INDECOPI | `libro` | `POST /api/v1/libro/asientos/{asientoId}/apelaciones`<br>`POST /api/v1/libro/asientos/{asientoId}/apelaciones/{apelacionId}/estado` | en el OpenAPI |
| HU-019 | Disparar la encuesta al cerrar el ticket | `calidad` | Evento `ticket.closed` → encuesta (DEP-10) | sin API propia (evento, job o adaptador) |
| HU-020 | Registrar un caso sensible con Código Único | `casos_legales` | `POST /api/v1/casos-sensibles`<br>`POST /api/v1/casos-sensibles/{casoId}/reclasificacion` | en el OpenAPI |
| HU-021 | Emitir cargo previo y cargo de activación por separado | `casos_legales` | `POST /api/v1/casos-sensibles/{casoId}/cargos` | en el OpenAPI |
| HU-022 | Clasificar el riesgo del caso con matriz objetiva | `casos_legales` | `PUT /api/v1/casos-sensibles/{casoId}/riesgo` | en el OpenAPI |
| HU-023 | Escalar en cadena un caso que incumple su SLA | `casos_legales` | `POST /api/v1/casos-sensibles/{casoId}/escalamientos` | en el OpenAPI |
| HU-024 | Validar casos cruzados o vinculados antes de registrar | `casos_legales` | `GET /api/v1/casos-sensibles/coincidencias`<br>`POST /api/v1/casos-sensibles/{casoId}/vinculos` | en el OpenAPI |
| HU-025 | Cerrar el caso con estado homologado y evidencia | `casos_legales` | `POST /api/v1/casos-sensibles/{casoId}/cierre` | en el OpenAPI |
| HU-026 | Bloquear la resolución en Eje 1/2 ante señal de conflicto | `casos_legales` | `POST /api/v1/tickets/{ticketId}/estado`<br>`POST /api/v1/tickets/{ticketId}/conflicto`<br>`POST /api/v1/tickets/{ticketId}/conflicto/retiro` | en el OpenAPI |
| HU-027 | Armar el paquete mínimo de handoff y confirmar su recepción | `casos_legales` | `POST /api/v1/tickets/{ticketId}/handoff`<br>`POST /api/v1/tickets/{ticketId}/handoff/confirmacion` | en el OpenAPI |
| HU-028 | Registrar la nota de estado emocional sin juicios de valor | `casos_legales` | `POST /api/v1/tickets/{ticketId}/notas-estado` | en el OpenAPI |
| HU-029 | Medir el cierre end-to-end de la experiencia | `sla` | Cálculo interno al cerrar (sin API propia) | sin API propia (evento, job o adaptador) |
| HU-030 | Monitorear en tiempo real y corregir antes del incumplimiento | `calidad` | `GET /api/v1/tablero` | en el OpenAPI |
| HU-031 | Generar el informe diario y el quincenal | `calidad` | Informe programado | sin API propia (evento, job o adaptador) |
| HU-032 | Auditar registros paralelos del dato de cliente | `calidad` | Auditoría programada (registros paralelos) | sin API propia (evento, job o adaptador) |
| HU-033 | Registrar un reclamo de garantía vinculado a la entrega | `postventa` | `POST /api/v1/postventa/reclamos` | en el OpenAPI |
| HU-034 | Validar la vigencia de la garantía contra la cobertura | `postventa` | `POST /api/v1/postventa/reclamos` | en el OpenAPI |
| HU-035 | Registrar la inspección técnica antes de resolver | `postventa` | `POST /api/v1/postventa/reclamos/{reclamoId}/inspecciones`<br>`POST /api/v1/postventa/reclamos/{reclamoId}/resolucion` | en el OpenAPI |
| HU-036 | Escalar la garantía a Eje 3 y gestionar la adenda | `postventa` | `POST /api/v1/postventa/reclamos/{reclamoId}/escalamiento`<br>`POST /api/v1/postventa/reclamos/{reclamoId}/adenda` | en el OpenAPI |
| HU-037 | Registrar el riesgo verbal y la secuencia de Frases Ancla | `tickets` | `POST /api/v1/entregafest/frases-ancla` | en el OpenAPI |
| HU-038 | Derivar de inmediato a la Estación 4 sin debate | `tickets` | `POST /api/v1/entregafest/casos` | en el OpenAPI |
| HU-039 | Registrar el caso con la etiqueta estándar | `tickets` | `POST /api/v1/entregafest/casos`<br>`GET /api/v1/entregafest/casos` | en el OpenAPI |
| HU-040 | Sincronizar con Legal los tickets derivados a Eje 3 | `consulta360` | Adaptador de Legal (DEP-12) | sin API propia (evento, job o adaptador) |
| HU-041 | Priorizar los reclamos con riesgo de denuncia por su exposición | `consulta360` | Adaptador de Legal (DEP-12) | sin API propia (evento, job o adaptador) |
| HU-042 | Atender la llamada con la ficha del cliente y registrarla en el ticket | `consulta360` | Evento de la central (CTI, DEP-11) + ficha | sin API propia (evento, job o adaptador) |
| HU-043 | Configurar el flujo de trabajo de un tipo de ticket por área | `bandeja` | `PUT /api/v1/flujos/{tipoId}/{subtipoId}/{areaId}`<br>`GET /api/v1/flujos/publicaciones`<br>`POST /api/v1/tickets/{ticketId}/actividades/{numero}/cierre` | en el OpenAPI |
| HU-044 | Trabajar desde una bandeja única ordenada por urgencia | `bandeja` | `GET /api/v1/bandeja` | en el OpenAPI |
| HU-045 | Marcar un ticket crítico con el rayo de prioridad | `bandeja` | `GET /api/v1/bandeja`<br>`POST /api/v1/tickets/{ticketId}/rayo` | en el OpenAPI |
| HU-046 | Reasignar automáticamente al gestor con menos carga | `bandeja` | Orquestador: balanceo por carga al entrar el ticket (ADR-008) | sin API propia (evento, job o adaptador) |
| HU-047 | Consultar la guía de solución del tipo de ticket | `bandeja` | `GET /api/v1/tickets/{ticketId}/guia` | en el OpenAPI |
| HU-048 | Recibir retroalimentación de IA mientras atiendo y cierro | `bandeja` | `POST /api/v1/tickets/{ticketId}/sugerencias-ia`<br>`POST /api/v1/tickets/{ticketId}/sugerencias-ia/{sugerenciaId}/decision` | en el OpenAPI |
| HU-049 | Buscar al cliente y llamarlo desde su ficha | `consulta360` | `GET /api/v1/clientes`<br>`POST /api/v1/clientes/{partyId}/llamadas` | en el OpenAPI |
| HU-050 | Ver la consulta 360 del cliente dentro del ticket | `consulta360` | `GET /api/v1/tickets/{ticketId}`<br>`GET /api/v1/clientes/{partyId}/consulta-360` | en el OpenAPI |
| HU-051 | Continuar la atención cuando la consulta del cliente falla | `consulta360` | `POST /api/v1/tickets`<br>`GET /api/v1/clientes/{partyId}/consulta-360` | en el OpenAPI |
| HU-052 | Consultar datos específicos con el motor de José | `consulta360` | `POST /api/v1/tickets/{ticketId}/consultas-motor` | en el OpenAPI |
| HU-053 | Buscar documentos del cliente por significado | `consulta360` | `GET /api/v1/clientes/{partyId}/documentos` | en el OpenAPI |
| HU-054 | Ver mi avance diario y el de mi equipo | `bandeja` | `GET /api/v1/tablero` | en el OpenAPI |
| HU-055 | Recibir un correo al asignarme un ticket, con copia a mi líder | `bandeja` | Notificación por correo al asignar (evento `ticket.assigned`) | sin API propia (evento, job o adaptador) |
| HU-056 | Abrir el caso de resolución por 3 meses impagos | `morosidad` | Job diario de evaluación de 3 cuotas vencidas (DEP-08; ADR-005) | sin API propia (evento, job o adaptador) |
| HU-057 | Enviar al cliente la alerta de cancelación en paralelo | `morosidad` | Evento al crear el ticket de resolución; envío en paralelo desde el outbox (ADR-013) | sin API propia (evento, job o adaptador) |
| HU-058 | Enviar la carta de alerta al responsable del proyecto y su supervisor | `morosidad` | Evento al crear el ticket de resolución; carta desde plantilla (DEP-15) | sin API propia (evento, job o adaptador) |
| HU-059 | Registrar el ingreso de una persona al proyecto | `morosidad` | `POST /api/v1/formularios/ingresos` | en el OpenAPI |
| HU-060 | Reservar un cupo en el bus del Entrega Fest | `morosidad` | `POST /api/v1/formularios/reservas-bus`<br>`POST /api/v1/formularios/reservas-bus/{reservaId}/cancelacion` | en el OpenAPI |
| HU-064 | Registrar y consultar mis tickets en Mi Portal | `portal` | `POST /api/v1/portal/codigos`<br>`POST /api/v1/portal/sesiones`<br>`GET /api/v1/portal/tickets`<br>`POST /api/v1/portal/tickets`<br>`GET /api/v1/portal/tipos` | en el OpenAPI |
| HU-065 | Ver la trazabilidad de mi ticket | `portal` | `GET /api/v1/portal/tickets/{ticketId}/trazabilidad` | en el OpenAPI |
| HU-066 | Responder, adjuntar y confirmar la solución de mi ticket | `portal` | `POST /api/v1/portal/tickets/{ticketId}/respuestas`<br>`POST /api/v1/portal/tickets/{ticketId}/confirmacion` | en el OpenAPI |
| HU-067 | Ver el proceso de atención en un visor 3D (operación en vivo) | `bandeja` | `GET /api/v1/visor/estado` | en el OpenAPI |

Generado por IA: borrador completo (Claude, 2026-10-19) — Revisado por: (pendiente)
