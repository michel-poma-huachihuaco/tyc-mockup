---
id: "SPEC-ARQ-OPERACIONES"
tipo: "spec"
titulo: "Operaciones de API por historia de usuario"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.3"
owner: "Jesús Chávez Elías"
aprobadores: [tech_lead]
fecha: "2026-10-26"
relacionados: [ADR-001, ADR-012]
tags: [arquitectura, api, g3]
---

# Operaciones de API por historia

**Versión del 22-oct-2026:** los módulos van con su nombre en inglés (propuesta de ADR-001) y HU-064 ya no tiene operaciones de código ni de sesión (DT-04). El contrato `aybar-atc.openapi.yaml` `0.5.0-borrador` declara además el permiso de cada operación (`x-permiso`; `roles-y-permisos-atc.md`).

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
| HU-012 | Registrar el asiento del Libro de Reclamaciones | `complaintbook` | `POST /api/v1/libro/asientos` | en el OpenAPI |
| HU-013 | Calcular el plazo legal y gestionar la prórroga única | `complaintbook` | `POST /api/v1/libro/asientos/{asientoId}/prorroga` | en el OpenAPI |
| HU-014 | Registrar la respuesta formal con cargo | `complaintbook` | `POST /api/v1/libro/asientos/{asientoId}/respuesta` | en el OpenAPI |
| HU-015 | Vigilar el plazo legal y detectar reclamos huérfanos | `complaintbook` | Job de plazo legal (ADR-005) | sin API propia (evento, job o adaptador) |
| HU-016 | Dar seguimiento a apelaciones internas y ante INDECOPI | `complaintbook` | `POST /api/v1/libro/asientos/{asientoId}/apelaciones`<br>`POST /api/v1/libro/asientos/{asientoId}/apelaciones/{apelacionId}/estado` | en el OpenAPI |
| HU-019 | Disparar la encuesta al cerrar el ticket | `quality` | Evento `aybar.service.ticket_status_changed` al pasar a `CLOSED` (ADR-013) → encuesta (DEP-10) | sin API propia (evento, job o adaptador) |
| HU-020 | Registrar un caso sensible con Código Único | `legalcases` | `POST /api/v1/casos-sensibles`<br>`POST /api/v1/casos-sensibles/{casoId}/reclasificacion` | en el OpenAPI |
| HU-021 | Emitir cargo previo y cargo de activación por separado | `legalcases` | `POST /api/v1/casos-sensibles/{casoId}/cargos` | en el OpenAPI |
| HU-022 | Clasificar el riesgo del caso con matriz objetiva | `legalcases` | `PUT /api/v1/casos-sensibles/{casoId}/riesgo` | en el OpenAPI |
| HU-023 | Escalar en cadena un caso que incumple su SLA | `legalcases` | `POST /api/v1/casos-sensibles/{casoId}/escalamientos` | en el OpenAPI |
| HU-024 | Validar casos cruzados o vinculados antes de registrar | `legalcases` | `GET /api/v1/casos-sensibles/coincidencias`<br>`POST /api/v1/casos-sensibles/{casoId}/vinculos` | en el OpenAPI |
| HU-025 | Cerrar el caso con estado homologado y evidencia | `legalcases` | `POST /api/v1/casos-sensibles/{casoId}/cierre` | en el OpenAPI |
| HU-026 | Bloquear la resolución en Eje 1/2 ante señal de conflicto | `legalcases` | `POST /api/v1/tickets/{ticketId}/estado`<br>`POST /api/v1/tickets/{ticketId}/conflicto`<br>`POST /api/v1/tickets/{ticketId}/conflicto/retiro` | en el OpenAPI |
| HU-027 | Armar el paquete mínimo de handoff y confirmar su recepción | `legalcases` | `POST /api/v1/tickets/{ticketId}/handoff`<br>`POST /api/v1/tickets/{ticketId}/handoff/confirmacion` | en el OpenAPI |
| HU-028 | Registrar la nota de estado emocional sin juicios de valor | `legalcases` | `POST /api/v1/tickets/{ticketId}/notas-estado` | en el OpenAPI |
| HU-029 | Medir el cierre end-to-end de la experiencia | `sla` | Cálculo interno al cerrar (sin API propia) | sin API propia (evento, job o adaptador) |
| HU-030 | Monitorear en tiempo real y corregir antes del incumplimiento | `quality` | `GET /api/v1/tablero` | en el OpenAPI |
| HU-031 | Generar el informe diario y el quincenal | `quality` | Informe programado | sin API propia (evento, job o adaptador) |
| HU-032 | Auditar registros paralelos del dato de cliente | `quality` | Auditoría programada (registros paralelos) | sin API propia (evento, job o adaptador) |
| HU-033 | Registrar un reclamo de garantía vinculado a la entrega | `aftersales` | `POST /api/v1/postventa/reclamos` | en el OpenAPI |
| HU-034 | Validar la vigencia de la garantía contra la cobertura | `aftersales` | `POST /api/v1/postventa/reclamos` | en el OpenAPI |
| HU-035 | Registrar la inspección técnica antes de resolver | `aftersales` | `POST /api/v1/postventa/reclamos/{reclamoId}/inspecciones`<br>`POST /api/v1/postventa/reclamos/{reclamoId}/resolucion` | en el OpenAPI |
| HU-036 | Escalar la garantía a Eje 3 y gestionar la adenda | `aftersales` | `POST /api/v1/postventa/reclamos/{reclamoId}/escalamiento`<br>`POST /api/v1/postventa/reclamos/{reclamoId}/adenda` | en el OpenAPI |
| HU-037 | Registrar el riesgo verbal y la secuencia de Frases Ancla | `tickets` | `POST /api/v1/entregafest/frases-ancla` | en el OpenAPI |
| HU-038 | Derivar de inmediato a la Estación 4 sin debate | `tickets` | `POST /api/v1/entregafest/casos` | en el OpenAPI |
| HU-039 | Registrar el caso con la etiqueta estándar | `tickets` | `POST /api/v1/entregafest/casos`<br>`GET /api/v1/entregafest/casos` | en el OpenAPI |
| HU-040 | Sincronizar con Legal los tickets derivados a Eje 3 | `customer360` | Adaptador de Legal (DEP-12) | sin API propia (evento, job o adaptador) |
| HU-041 | Priorizar los reclamos con riesgo de denuncia por su exposición | `customer360` | Adaptador de Legal (DEP-12) | sin API propia (evento, job o adaptador) |
| HU-042 | Atender la llamada con la ficha del cliente y registrarla en el ticket | `customer360` | Evento de la central (CTI, DEP-11) + ficha | sin API propia (evento, job o adaptador) |
| HU-043 | Configurar el flujo de trabajo de un tipo de ticket por área | `inbox` | `PUT /api/v1/flujos/{tipoId}/{subtipoId}/{areaId}`<br>`GET /api/v1/flujos/publicaciones`<br>`POST /api/v1/tickets/{ticketId}/actividades/{numero}/cierre` | en el OpenAPI |
| HU-044 | Trabajar desde una bandeja única ordenada por urgencia | `inbox` | `GET /api/v1/bandeja` | en el OpenAPI |
| HU-045 | Marcar un ticket crítico con el rayo de prioridad | `inbox` | `GET /api/v1/bandeja`<br>`POST /api/v1/tickets/{ticketId}/rayo` | en el OpenAPI |
| HU-046 | Reasignar automáticamente al gestor con menos carga | `inbox` | Orquestador: balanceo por carga al entrar el ticket (ADR-008) | sin API propia (evento, job o adaptador) |
| HU-047 | Consultar la guía de solución del tipo de ticket | `inbox` | `GET /api/v1/tickets/{ticketId}/guia` | en el OpenAPI |
| HU-048 | Recibir retroalimentación de IA mientras atiendo y cierro | `inbox` | `POST /api/v1/tickets/{ticketId}/sugerencias-ia`<br>`POST /api/v1/tickets/{ticketId}/sugerencias-ia/{sugerenciaId}/decision` | en el OpenAPI |
| HU-049 | Buscar al cliente y llamarlo desde su ficha | `customer360` | `GET /api/v1/clientes`<br>`POST /api/v1/clientes/{partyId}/llamadas` | en el OpenAPI |
| HU-050 | Ver la consulta 360 del cliente dentro del ticket | `customer360` | `GET /api/v1/tickets/{ticketId}`<br>`GET /api/v1/clientes/{partyId}/consulta-360` | en el OpenAPI |
| HU-051 | Continuar la atención cuando la consulta del cliente falla | `customer360` | `POST /api/v1/tickets`<br>`GET /api/v1/clientes/{partyId}/consulta-360` | en el OpenAPI |
| HU-052 | Consultar datos específicos con el motor de José | `customer360` | `POST /api/v1/tickets/{ticketId}/consultas-motor` | en el OpenAPI |
| HU-053 | Buscar documentos del cliente por significado | `customer360` | `GET /api/v1/clientes/{partyId}/documentos` | en el OpenAPI |
| HU-054 | Ver mi avance diario y el de mi equipo | `inbox` | `GET /api/v1/tablero` | en el OpenAPI |
| HU-055 | Recibir un correo al asignarme un ticket, con copia a mi líder | `inbox` | Notificación por correo al asignar (evento `aybar.service.ticket_assigned`, ADR-013) | sin API propia (evento, job o adaptador) |
| HU-056 | Abrir el caso de resolución por 3 meses impagos | `delinquency` | Job diario de evaluación de 3 cuotas vencidas (DEP-08; ADR-005) | sin API propia (evento, job o adaptador) |
| HU-057 | Enviar al cliente la alerta de cancelación en paralelo | `delinquency` | Evento al crear el ticket de resolución, por el outbox `SVC_OUTBOX_EVENT` (ADR-013); envío en paralelo | sin API propia (evento, job o adaptador) |
| HU-058 | Enviar la carta de alerta al responsable del proyecto y su supervisor | `delinquency` | Evento al crear el ticket de resolución; carta desde plantilla (DEP-15) | sin API propia (evento, job o adaptador) |
| HU-059 | Registrar el ingreso de una persona al proyecto | `delinquency` | `POST /api/v1/formularios/ingresos` | en el OpenAPI |
| HU-060 | Reservar un cupo en el bus del Entrega Fest | `delinquency` | `POST /api/v1/formularios/reservas-bus`<br>`POST /api/v1/formularios/reservas-bus/{reservaId}/cancelacion` | en el OpenAPI |
| HU-064 | Registrar y consultar mis tickets en Mi Portal | `portal` | `GET /api/v1/portal/tickets`<br>`POST /api/v1/portal/tickets`<br>`GET /api/v1/portal/tipos` | en el OpenAPI (el login es de Control de acceso: se retiran las operaciones de código y sesión, DT-04) |
| HU-065 | Ver la trazabilidad de mi ticket | `portal` | `GET /api/v1/portal/tickets/{ticketId}/trazabilidad` | en el OpenAPI |
| HU-066 | Responder, adjuntar y confirmar la solución de mi ticket | `portal` | `POST /api/v1/portal/tickets/{ticketId}/respuestas`<br>`POST /api/v1/portal/tickets/{ticketId}/confirmacion` | en el OpenAPI |
| HU-067 | Ver el proceso de atención en un visor 3D (operación en vivo) | `inbox` | `GET /api/v1/visor/estado` | en el OpenAPI |

## Operaciones que dependen de Control de acceso (PJ-05)

Las operaciones no cambian; lo que sigue es lo que cada una necesita de Control de acceso y que hoy no está resuelto (preguntas de `analisis/decisiones.md`). ATC no guarda usuarios, roles, líderes ni sesiones (DT-03, C-11).

| Historias | Qué necesitan | Pregunta |
|---|---|---|
| Todas las operaciones del contrato | Token del emisor de Control de acceso en DEV; en local, el emisor de pruebas `herramientas/emisor-local.mjs` del repo `AybarCorp/aybar-access-control-deus` | DEP-16 (P-026, P-040) |
| Todas las que exigen `x-permiso` | Si ATC autoriza por rol del token o consulta el permiso efectivo | P-034 |
| HU-008, HU-046, HU-054, HU-055, HU-058 | Gestores que cesan, gestores de un área con su disponibilidad y líder de un gestor: no hay API con token de servicio | P-035 |
| HU-044, HU-045, HU-054, HU-055, HU-023, HU-027 | Áreas y jefaturas: la tabla de áreas organizacionales no existe; `MAE_AREA` es solo la cola (C-07) | P-036 |
| HU-001, HU-049, HU-050, HU-051 | El interesado que no está en `PARTY`: ATC no crea su Party; el ticket queda con la vinculación pendiente | P-037 |
| HU-064, HU-065, HU-066 | El `PartyID` del cliente no viaja en el token | P-033 |

## Proceso de atención de prospectos (C-06)

`analisis/proceso-atencion-prospectos.md` propone atender como tipos de ticket los casos que Control de acceso deriva a ATC («correo distinto», DNI tomado, suplantación y prospecto por validar). **No agrega operaciones:** el ticket se registra con `registrarTicket` (HU-001) y sigue el flujo del tipo (HU-043); la validación y la suspensión se hacen en la consola de Control de acceso, no en la API de ATC. Es alcance nuevo para el PO (P-041).

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-19 a 2026-10-22 | Jesús Chávez Elías, con IA | Operaciones por historia; módulos en inglés y sin operaciones de código ni sesión en HU-064 (DT-04) |
| 0.2 | 2026-10-26 | Brayan Hurtado, con IA | Lo que cada operación necesita de Control de acceso, con su pregunta (P-033 a P-037; DEP-16), y el proceso de atención de prospectos (C-06), sin operaciones nuevas |
| 0.3 | 2026-10-26 | Brayan Hurtado, con IA | Eventos con el formato de tópico del SDK de ADR-013 v0.3 (`aybar.service.ticket_status_changed` y `aybar.service.ticket_assigned`) y outbox `SVC_OUTBOX_EVENT` |
| 0.3 | 2026-10-26 | Brayan Hurtado, con IA | Barrido de coherencia (misma versión, sin cambio de contenido): el contrato se cita en su versión vigente, `0.5.0-borrador` (decía v0.3). |

Generado por IA: borrador completo (Claude, 2026-10-19) — Revisado por: (pendiente)

Actualizado el 22-oct-2026 por Jesús Chávez Elías con IA (Claude) a partir de la revisión del Líder Técnico (DT-03, DT-04, DT-07 y ADR-001 de `analisis/decisiones.md` v0.3). — Revisado por: (pendiente)

Actualizado el 26-oct-2026 por Brayan Hurtado con IA (Claude) a partir de la revisión del Líder Técnico del 22-oct (C-06, C-07, C-11 y C-12) y del paquete aprobado de PJ-05. — Revisado por: (pendiente)

Actualizado el 26-oct-2026 (v0.3) por Brayan Hurtado con IA (Claude) a partir de la revisión del Líder Técnico del 26-oct (hallazgo 15): nombres de evento con el formato de tópico del SDK. — Revisado por: (pendiente)
