---
id: "TEST-PLAN-001"
tipo: test-plan
titulo: "Test Plan inicial - Aybar Atiende (F5, casos sin ejecutar)"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "[QA]"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["AYB-0001"]
tags: [test-plan, plt-05, g4]
---

# Test Plan (T-TEST-PLAN) - casos iniciales de F5 (G4)

Va en `docs/pruebas/test-plan.md`. **Esto es F5/G4, no G6**: aqui solo se definen los casos (criterio 8 del DoR, `.agents/templates/dor.md`), nadie los ha ejecutado. La ejecucion real (ciclos 0-3, defectos, evidencia por commit) es trabajo de F8 con `aybar-pruebas-qa` y el agente `qa-engineer`.

- Ticket: AYB-0001 (placeholder) - Tipo: T3
- Flujos criticos E2E (propuesta IA, el PO debe confirmarlos): registro y tipificacion de ticket multicanal; SLA congelado y alerta de incumplimiento; Libro de Reclamaciones con plazo legal y prorroga; gate de derivacion a Eje 3 (Legal); consulta 360 del cliente dentro del ticket; bandeja orquestadora con rayo y reasignacion por carga; resolucion de contrato por 3 meses impagos.

## Ciclos ejecutados (referencia: qa-ciclos.md)

Sin ejecutar - F5, no F8. Esta tabla se completa en el QA Gate (G6).

| Ciclo | Fecha | Casos | Fallidos | % | Sev x Impacto | Resultado | Valida |
|---|---|---|---|---|---|---|---|
| 0 Perf+Sec | | | | <=20% | | | QA |
| 1 Funcional | | | | <=20% | | | PO |
| 2 Integral | | | | <=10% | | | QA+PO |
| 3 UAT | | | | - | | | Cliente |

## Casos (114 TC iniciales, uno o mas por escenario Gherkin de las 60 HU)

| ID | Caso | Tipo (func/E2E/API/integ/regres/advers) | Resultado | Evidencia (commit) |
|---|---|---|---|---|
| TC-HU-ATC-001-01 | Registrar un ticket con los campos obligatorios completos (Registrar tickets multicanal tipificados) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-001-02 | Rechazar el registro sin un campo obligatorio (Registrar tickets multicanal tipificados) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-002-01 | Generar el número correlativo al crear el ticket (Entregar número correlativo por razón social) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-003-01 | Congelar el vencimiento al abrir el ticket (Congelar el SLA al abrir) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-003-02 | La política cambia después de abierto el ticket (Congelar el SLA al abrir) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-004-01 | Cambiar de estado un ticket (Gestionar el ciclo de vida del ticket) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-005-01 | Registrar una nota interna no visible al cliente (Registrar interacciones con visibilidad controlada) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-006-01 | Conservar la primera resolución tras una reapertura (Conservar hitos temporales probatorios) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-007-01 | Derivar un ticket a otra área con motivo (Derivar entre áreas con log auditable) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-008-01 | Reasignar en bloque los tickets de un colaborador que cesa (Reasignar masivamente al cesar un colaborador) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-009-01 | Consultar el casillero de un área (Casillero de tareas por consulta) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-010-01 | Alertar una sola vez por tipo y ciclo (Alertar incumplimientos de SLA comercial) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-011-01 | Reabrir un ticket resuelto (Reabrir con nuevo compromiso sin borrar el original) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-012-01 | Crear el asiento del libro para un ticket tipificado como reclamo (Registrar el asiento del libro como extensión del ticket) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-013-01 | Solicitar la prórroga única antes del vencimiento (Computar el plazo legal y la prórroga única) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-013-02 | Bloquear una segunda prórroga (Computar el plazo legal y la prórroga única) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-014-01 | Registrar una respuesta formal válida (Registrar la respuesta formal con cargo) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-015-01 | Detectar un ticket tipificado como reclamo sin asiento (Vigilar el plazo legal y detectar huérfanos) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-016-01 | Registrar una apelación y moverla de estado (Gestionar apelaciones internas y ante INDECOPI) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-017-01 | Vincular una incidencia de ciudad a un contrato de cobro (Atender incidencias de ciudad como tickets) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-018-01 | Crear un ticket desde UrbeMind por API (Exponer tickets por API/evento a UrbeMind) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-019-01 | Disparar la encuesta al cerrar un ticket (Disparar encuesta al cierre y medir calidad) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-020-01 | Registrar un caso sensible proveniente de INDECOPI (Registro multilínea con Código Único de Caso) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-021-01 | Activar un caso sensible (Cargo previo y cargo de activación como eventos distintos) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-022-01 | Recalibrar el riesgo de un caso que evoluciona (Clasificación de riesgo por matriz objetiva y recalibración) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-023-01 | Escalar un caso sin saltar niveles (Escalamiento en cadena por incumplimiento de SLA) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-024-01 | Detectar un caso vinculado a uno existente (Validación de casos cruzados y vinculados) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-025-01 | Cerrar un caso con evidencia (Cierre tipificado con evidencia y custodia legal separada) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-025-02 | Rechazar el cierre sin evidencia (Cierre tipificado con evidencia y custodia legal separada) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-026-01 | Bloquear el cierre de un ticket con señal de conflicto en Eje 1 (Gate de derivación obligatoria a Eje 3) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-027-01 | Enviar el handoff completo (Paquete mínimo de handoff con confirmación de recepción) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-027-02 | Bloquear un handoff incompleto (Paquete mínimo de handoff con confirmación de recepción) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-028-01 | Registrar una nota de estado emocional válida (Nota de estado emocional sin juicios de valor) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-028-02 | Rechazar una nota con juicios de valor (Nota de estado emocional sin juicios de valor) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-029-01 | Alertar antes de vencer el cierre end-to-end (SLA de cierre end-to-end de la experiencia) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-030-01 | Ver un caso en riesgo antes de que venza (Monitoreo en tiempo real y corrección preventiva) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-031-01 | Generar el informe diario (Informe diario operativo e informe quincenal analítico) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-032-01 | Auditar sin registros paralelos (Prevención de registros paralelos del dato de cliente) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-032-02 | Detectar un registro paralelo (Prevención de registros paralelos del dato de cliente) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-033-01 | Registrar un reclamo de garantía con Acta de Entrega (Registro del reclamo de garantía vinculado a la entrega) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-033-02 | Rechazar un reclamo sin Acta de Entrega (Registro del reclamo de garantía vinculado a la entrega) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-034-01 | Rechazar automáticamente un reclamo fuera de cobertura (Validación de vigencia contra el periodo de cobertura) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-035-01 | Resolver un reclamo tras la inspección (Inspección técnica y resolución del reclamo) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-035-02 | Bloquear la resolución sin inspección (Inspección técnica y resolución del reclamo) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-036-01 | Escalar un reclamo de garantía en conflicto (Escalamiento a Eje 3 y reincorporación contractual) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-037-01 | Registrar la secuencia de contención completa (Clasificación de riesgo verbal y secuencia de Frases Ancla) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-038-01 | Derivar un caso sensible detectado en vivo (Derivación inmediata a Estación 4 sin debate) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-039-01 | Etiquetar un caso sensible del evento (Registro del caso con etiqueta estándar) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-040-01 | Sincronizar un ticket derivado a Eje 3 (Integrar el ticket con la gestión de Legal) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-041-01 | Priorizar un ticket por exposición económica (Prevenir que un reclamo llegue a denuncia) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-042-01 | Mostrar la ficha del cliente al contestar (Integrar la plataforma del call center) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-042-02 | Registrar la llamada como interacción (Integrar la plataforma del call center) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-043-01 | Publicar un flujo nuevo (Configurar flujos de trabajo de tickets por área) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-044-01 | Ordenar la bandeja por rayo, SLA y prioridad (Bandeja orquestadora de tickets) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-045-01 | Marcar un ticket con rayo (Marcar un ticket con rayo de prioridad) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-045-02 | Bloquear el rayo a un rol sin permiso (Marcar un ticket con rayo de prioridad) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-046-01 | Reasignar por saturación del responsable (Reasignar automáticamente al agente con menos carga) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-047-01 | Consultar la guía de un tipo de ticket (Guía de solución por tipo de ticket) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-048-01 | Recibir una sugerencia de la IA (Retroalimentación de IA al agente durante la atención) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-049-01 | Buscar un cliente por DNI (Buscar al cliente y llamarlo desde la ficha) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-050-01 | Consultar el detalle 360 del cliente (Consulta 360 del cliente en el ticket) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-051-01 | Continuar el registro cuando el sistema fuente no responde (Gestionar excepciones en la consulta del cliente) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-052-01 | Obtener un dato específico del cliente vía el motor de José (Reutilizar el motor de consultas existente) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-053-01 | Encontrar un documento por significado (Búsqueda inteligente en archivos y documentos del cliente) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-054-01 | Ver el avance diario propio (Tablero de avance diario del agente) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-055-01 | Enviar el correo de asignación (Alertar por correo la asignación con copia al líder) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-056-01 | Generar el caso por morosidad (Generar el caso de resolución de contrato por 3 meses impagos) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-057-01 | Enviar la alerta de cancelación al crear el caso (Enviar en paralelo la alerta de cancelación del servicio) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-058-01 | Enviar la carta al responsable del proyecto (Carta de alerta al responsable del proyecto con copia al supervisor) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-058-02 | Escalar por falta de acción (Carta de alerta al responsable del proyecto con copia al supervisor) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-059-01 | Registrar un ingreso con el formulario simple (Registrar el ingreso de personas al proyecto con formulario simple) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-060-01 | Confirmar un cupo disponible (Gestionar los buses del Entrega Fest) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-060-02 | Rechazar un cupo sin capacidad (Gestionar los buses del Entrega Fest) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-001-E2E | Flujo end-to-end de pantalla: Registrar tickets multicanal tipificados | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-004-E2E | Flujo end-to-end de pantalla: Gestionar el ciclo de vida del ticket | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-005-E2E | Flujo end-to-end de pantalla: Registrar interacciones con visibilidad controlada | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-007-E2E | Flujo end-to-end de pantalla: Derivar entre áreas con log auditable | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-008-E2E | Flujo end-to-end de pantalla: Reasignar masivamente al cesar un colaborador | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-009-E2E | Flujo end-to-end de pantalla: Casillero de tareas por consulta | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-011-E2E | Flujo end-to-end de pantalla: Reabrir con nuevo compromiso sin borrar el original | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-012-E2E | Flujo end-to-end de pantalla: Registrar el asiento del libro como extensión del ticket | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-013-E2E | Flujo end-to-end de pantalla: Computar el plazo legal y la prórroga única | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-014-E2E | Flujo end-to-end de pantalla: Registrar la respuesta formal con cargo | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-016-E2E | Flujo end-to-end de pantalla: Gestionar apelaciones internas y ante INDECOPI | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-019-E2E | Flujo end-to-end de pantalla: Disparar encuesta al cierre y medir calidad | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-020-E2E | Flujo end-to-end de pantalla: Registro multilínea con Código Único de Caso | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-021-E2E | Flujo end-to-end de pantalla: Cargo previo y cargo de activación como eventos distintos | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-022-E2E | Flujo end-to-end de pantalla: Clasificación de riesgo por matriz objetiva y recalibración | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-024-E2E | Flujo end-to-end de pantalla: Validación de casos cruzados y vinculados | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-025-E2E | Flujo end-to-end de pantalla: Cierre tipificado con evidencia y custodia legal separada | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-027-E2E | Flujo end-to-end de pantalla: Paquete mínimo de handoff con confirmación de recepción | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-028-E2E | Flujo end-to-end de pantalla: Nota de estado emocional sin juicios de valor | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-030-E2E | Flujo end-to-end de pantalla: Monitoreo en tiempo real y corrección preventiva | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-031-E2E | Flujo end-to-end de pantalla: Informe diario operativo e informe quincenal analítico | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-033-E2E | Flujo end-to-end de pantalla: Registro del reclamo de garantía vinculado a la entrega | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-035-E2E | Flujo end-to-end de pantalla: Inspección técnica y resolución del reclamo | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-036-E2E | Flujo end-to-end de pantalla: Escalamiento a Eje 3 y reincorporación contractual | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-037-E2E | Flujo end-to-end de pantalla: Clasificación de riesgo verbal y secuencia de Frases Ancla | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-038-E2E | Flujo end-to-end de pantalla: Derivación inmediata a Estación 4 sin debate | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-039-E2E | Flujo end-to-end de pantalla: Registro del caso con etiqueta estándar | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-041-E2E | Flujo end-to-end de pantalla: Prevenir que un reclamo llegue a denuncia | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-042-E2E | Flujo end-to-end de pantalla: Integrar la plataforma del call center | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-043-E2E | Flujo end-to-end de pantalla: Configurar flujos de trabajo de tickets por área | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-044-E2E | Flujo end-to-end de pantalla: Bandeja orquestadora de tickets | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-045-E2E | Flujo end-to-end de pantalla: Marcar un ticket con rayo de prioridad | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-047-E2E | Flujo end-to-end de pantalla: Guía de solución por tipo de ticket | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-048-E2E | Flujo end-to-end de pantalla: Retroalimentación de IA al agente durante la atención | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-049-E2E | Flujo end-to-end de pantalla: Buscar al cliente y llamarlo desde la ficha | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-050-E2E | Flujo end-to-end de pantalla: Consulta 360 del cliente en el ticket | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-051-E2E | Flujo end-to-end de pantalla: Gestionar excepciones en la consulta del cliente | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-053-E2E | Flujo end-to-end de pantalla: Búsqueda inteligente en archivos y documentos del cliente | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-054-E2E | Flujo end-to-end de pantalla: Tablero de avance diario del agente | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-059-E2E | Flujo end-to-end de pantalla: Registrar el ingreso de personas al proyecto con formulario simple | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-060-E2E | Flujo end-to-end de pantalla: Gestionar los buses del Entrega Fest | E2E | [pendiente - F8] | [pendiente - F8] |

## Defectos

Sin defectos todavia: no hay ejecucion (F5, no F8).

| ID | Severidad | Impacto negocio | Estado | Plan (mayores: aprueba PO) |
|---|---|---|---|---|

Criticos = 0. Bloqueantes = 0. NFR contra numero objetivo: pendiente de medir en F8.

Generado por IA: contenido completo, a partir de los escenarios Gherkin de las 60 HU de `docs/historias/` - Revisado por: pendiente
