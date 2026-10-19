---
id: "TEST-PLAN-001"
tipo: test-plan
titulo: "Test Plan inicial - Aybar Atiende (F5, casos sin ejecutar)"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "[QA]"
aprobadores: []
fecha: "2026-10-19"
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

## Casos (208 TC iniciales: 167 funcionales por cada escenario Gherkin oficial de PLT-04 + 41 E2E de pantalla)

| ID | Caso | Tipo (func/E2E/API/integ/regres/advers) | Resultado | Evidencia (commit) |
|---|---|---|---|---|
| TC-HU-ATC-001-01 | CA-01 · Campos obligatorios (Registrar un ticket tipificado desde cualquier canal) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-001-02 | CA-02 · Canal remoto sin local (Registrar un ticket tipificado desde cualquier canal) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-001-03 | CA-03 · Cliente desde SIGDA/TAXON (agregado por el PO) (Registrar un ticket tipificado desde cualquier canal) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-001-04 | CA-04 · Permiso (agregado por el PO) (Registrar un ticket tipificado desde cualquier canal) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-002-01 | CA-01 · Correlativo por empresa (Entregar al cliente un número de ticket por razón social) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-002-02 | CA-02 · Número visible (Entregar al cliente un número de ticket por razón social) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-002-03 | CA-03 · Concurrencia (agregado por el PO) (Entregar al cliente un número de ticket por razón social) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-003-01 | CA-01 · Precedencia (Congelar el SLA del ticket al abrirlo) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-003-02 | CA-02 · Feriado (Congelar el SLA del ticket al abrirlo) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-003-03 | CA-03 · Cambio de política (agregado por el PO) (Congelar el SLA del ticket al abrirlo) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-003-04 | CA-04 · Sin política (agregado por el PO) (Congelar el SLA del ticket al abrirlo) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-004-01 | CA-01 · Historial (Cambiar el estado del ticket con historial inmutable) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-004-02 | CA-02 · Inmutabilidad (Cambiar el estado del ticket con historial inmutable) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-004-03 | CA-03 · Cambio automático (agregado por el PO) (Cambiar el estado del ticket con historial inmutable) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-004-04 | CA-04 · Transición inválida (agregado por el PO) (Cambiar el estado del ticket con historial inmutable) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-005-01 | CA-01 · Primera respuesta (Registrar interacciones visibles o internas con evidencia) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-005-02 | CA-02 · Evidencia (Registrar interacciones visibles o internas con evidencia) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-005-03 | CA-03 · Nota interna (agregado por el PO) (Registrar interacciones visibles o internas con evidencia) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-005-04 | CA-04 · DLP (agregado por el PO) (Registrar interacciones visibles o internas con evidencia) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-006-01 | CA-01 · Reapertura (Conservar los hitos temporales probatorios) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-006-02 | CA-02 · Cierre (Conservar los hitos temporales probatorios) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-007-01 | CA-01 · Área sin persona (Derivar un ticket a otra área con motivo tipificado) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-007-02 | CA-02 · Rastro (Derivar un ticket a otra área con motivo tipificado) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-007-03 | CA-03 · Motivo obligatorio (agregado por el PO) (Derivar un ticket a otra área con motivo tipificado) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-008-01 | CA-01 · Cese (Reasignar en bloque los tickets de un colaborador que cesa) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-008-02 | CA-02 · Reparto (Reasignar en bloque los tickets de un colaborador que cesa) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-008-03 | CA-03 · Permiso (agregado por el PO) (Reasignar en bloque los tickets de un colaborador que cesa) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-009-01 | CA-01 · Bandeja (Ver mi casillero de tareas por área y responsable) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-009-02 | CA-02 · Filtros (Ver mi casillero de tareas por área y responsable) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-009-03 | CA-03 · Sin asignar (agregado por el PO) (Ver mi casillero de tareas por área y responsable) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-010-01 | CA-01 · Sin duplicados (Recibir una sola alerta por incumplimiento de SLA) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-010-02 | CA-02 · Constancia (Recibir una sola alerta por incumplimiento de SLA) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-010-03 | CA-03 · Ticket resuelto (agregado por el PO) (Recibir una sola alerta por incumplimiento de SLA) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-011-01 | CA-01 · Nuevo compromiso (Reabrir un ticket con un nuevo compromiso sin borrar el original) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-011-02 | CA-02 · Contador (Reabrir un ticket con un nuevo compromiso sin borrar el original) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-012-01 | CA-01 · Correlativo (Registrar el asiento del Libro de Reclamaciones) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-012-02 | CA-02 · Monto y moneda (Registrar el asiento del Libro de Reclamaciones) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-012-03 | CA-03 · Empresa inmutable (agregado por el PO) (Registrar el asiento del Libro de Reclamaciones) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-013-01 | CA-01 · Requisitos de prórroga (Calcular el plazo legal y gestionar la prórroga única) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-013-02 | CA-02 · Sin reescritura (Calcular el plazo legal y gestionar la prórroga única) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-013-03 | CA-03 · Segunda prórroga (agregado por el PO) (Calcular el plazo legal y gestionar la prórroga única) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-013-04 | CA-04 · Fuera de ventana (agregado por el PO) (Calcular el plazo legal y gestionar la prórroga única) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-014-01 | CA-01 · Respuesta válida (Registrar la respuesta formal con cargo) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-014-02 | CA-02 · Derecho INDECOPI (Registrar la respuesta formal con cargo) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-014-03 | CA-03 · Sin cargo (agregado por el PO) (Registrar la respuesta formal con cargo) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-015-01 | CA-01 · Alerta legal (Vigilar el plazo legal y detectar reclamos huérfanos) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-015-02 | CA-02 · Huérfano (Vigilar el plazo legal y detectar reclamos huérfanos) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-015-03 | CA-03 · Plazo prorrogado (agregado por el PO) (Vigilar el plazo legal y detectar reclamos huérfanos) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-016-01 | CA-01 · Resolución INDECOPI (Dar seguimiento a apelaciones internas y ante INDECOPI) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-016-02 | CA-02 · Historial (Dar seguimiento a apelaciones internas y ante INDECOPI) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-016-03 | CA-03 · Desistimiento (agregado por el PO) (Dar seguimiento a apelaciones internas y ante INDECOPI) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-017-01 | CA-01 · Cobro (Atender incidencias de ciudad como tickets) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-017-02 | CA-02 · Sin contrato (Atender incidencias de ciudad como tickets) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-018-01 | CA-01 · Creación (Exponer tickets a UrbeMind por API y eventos) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-018-02 | CA-02 · Eventos (Exponer tickets a UrbeMind por API y eventos) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-018-03 | CA-03 · Seguridad (agregado por el PO) (Exponer tickets a UrbeMind por API y eventos) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-019-01 | CA-01 · Disparo (Disparar la encuesta al cerrar el ticket) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-019-02 | CA-02 · Medición (Disparar la encuesta al cerrar el ticket) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-019-03 | CA-03 · Reapertura (agregado por el PO) (Disparar la encuesta al cerrar el ticket) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-020-01 | CA-01 · Código único (Registrar un caso sensible con Código Único) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-020-02 | CA-02 · Reclasificación (Registrar un caso sensible con Código Único) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-021-01 | CA-01 · Cargo previo (Emitir cargo previo y cargo de activación por separado) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-021-02 | CA-02 · Activación (Emitir cargo previo y cargo de activación por separado) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-021-03 | CA-03 · Limbo (agregado por el PO) (Emitir cargo previo y cargo de activación por separado) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-022-01 | CA-01 · Cálculo objetivo (Clasificar el riesgo del caso con matriz objetiva) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-022-02 | CA-02 · Recalibración (Clasificar el riesgo del caso con matriz objetiva) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-023-01 | CA-01 · Alerta temprana (Escalar en cadena un caso que incumple su SLA) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-023-02 | CA-02 · Cadena (Escalar en cadena un caso que incumple su SLA) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-023-03 | CA-03 · Resolución (agregado por el PO) (Escalar en cadena un caso que incumple su SLA) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-024-01 | CA-01 · Coincidencia (Validar casos cruzados o vinculados antes de registrar) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-024-02 | CA-02 · Hilo único (Validar casos cruzados o vinculados antes de registrar) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-025-01 | CA-01 · Estado homologado (Cerrar el caso con estado homologado y evidencia) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-025-02 | CA-02 · Custodia (Cerrar el caso con estado homologado y evidencia) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-026-01 | CA-01 · Detección (Bloquear la resolución en Eje 1/2 ante señal de conflicto) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-026-02 | CA-02 · Gate (Bloquear la resolución en Eje 1/2 ante señal de conflicto) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-026-03 | CA-03 · Marca por error (agregado por el PO) (Bloquear la resolución en Eje 1/2 ante señal de conflicto) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-027-01 | CA-01 · Paquete completo (Armar el paquete mínimo de handoff y confirmar su recepción) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-027-02 | CA-02 · Confirmación (Armar el paquete mínimo de handoff y confirmar su recepción) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-027-03 | CA-03 · Sin confirmar (agregado por el PO) (Armar el paquete mínimo de handoff y confirmar su recepción) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-028-01 | CA-01 · Nota objetiva (Registrar la nota de estado emocional sin juicios de valor) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-028-02 | CA-02 · Aviso (Registrar la nota de estado emocional sin juicios de valor) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-028-03 | CA-03 · Palabras de juicio (agregado por el PO) (Registrar la nota de estado emocional sin juicios de valor) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-029-01 | CA-01 · Sin escalamiento (Medir el cierre end-to-end de la experiencia) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-029-02 | CA-02 · Con escalamiento (Medir el cierre end-to-end de la experiencia) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-030-01 | CA-01 · Riesgo (Monitorear en tiempo real y corregir antes del incumplimiento) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-030-02 | CA-02 · Redistribución (Monitorear en tiempo real y corregir antes del incumplimiento) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-031-01 | CA-01 · Diario (Generar el informe diario y el quincenal) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-031-02 | CA-02 · Quincenal (Generar el informe diario y el quincenal) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-032-01 | CA-01 · Corte (Auditar registros paralelos del dato de cliente) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-032-02 | CA-02 · Hallazgo (Auditar registros paralelos del dato de cliente) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-033-01 | CA-01 · Vínculo obligatorio (Registrar un reclamo de garantía vinculado a la entrega) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-033-02 | CA-02 · Catálogo cerrado (Registrar un reclamo de garantía vinculado a la entrega) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-034-01 | CA-01 · Validación (Validar la vigencia de la garantía contra la cobertura) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-034-02 | CA-02 · Fuera de cobertura (Validar la vigencia de la garantía contra la cobertura) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-035-01 | CA-01 · Inspección (Registrar la inspección técnica antes de resolver) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-035-02 | CA-02 · Resolución (Registrar la inspección técnica antes de resolver) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-036-01 | CA-01 · Conflicto (Escalar la garantía a Eje 3 y gestionar la adenda) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-036-02 | CA-02 · Adenda (Escalar la garantía a Eje 3 y gestionar la adenda) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-037-01 | CA-01 · Frase 4 (Registrar el riesgo verbal y la secuencia de Frases Ancla) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-037-02 | CA-02 · Frase 6 (Registrar el riesgo verbal y la secuencia de Frases Ancla) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-038-01 | CA-01 · Palabra gatillo (Derivar de inmediato a la Estación 4 sin debate) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-038-02 | CA-02 · Sin reapertura (Derivar de inmediato a la Estación 4 sin debate) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-039-01 | CA-01 · Etiqueta (Registrar el caso con la etiqueta estándar) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-039-02 | CA-02 · Revisión (Registrar el caso con la etiqueta estándar) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-040-01 | CA-01 · Envío a Legal (Sincronizar con Legal los tickets derivados a Eje 3) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-040-02 | CA-02 · Estado de vuelta (Sincronizar con Legal los tickets derivados a Eje 3) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-040-03 | CA-03 · Legal no disponible (agregado por el PO) (Sincronizar con Legal los tickets derivados a Eje 3) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-041-01 | CA-01 · Cálculo de exposición (Priorizar los reclamos con riesgo de denuncia por su exposición) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-041-02 | CA-02 · Alerta a Legal (Priorizar los reclamos con riesgo de denuncia por su exposición) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-041-03 | CA-03 · Sin monto (agregado por el PO) (Priorizar los reclamos con riesgo de denuncia por su exposición) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-042-01 | CA-01 · Screen pop (Atender la llamada con la ficha del cliente y registrarla en el ticket) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-042-02 | CA-02 · Registro de la llamada (Atender la llamada con la ficha del cliente y registrarla en el ticket) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-042-03 | CA-03 · Número desconocido (agregado por el PO) (Atender la llamada con la ficha del cliente y registrarla en el ticket) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-043-01 | CA-01 · Flujo aplicado (Configurar el flujo de trabajo de un tipo de ticket por área) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-043-02 | CA-02 · Versión del flujo (Configurar el flujo de trabajo de un tipo de ticket por área) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-043-03 | CA-03 · Flujo incompleto (agregado por el PO) (Configurar el flujo de trabajo de un tipo de ticket por área) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-044-01 | CA-01 · Orden de la bandeja (Trabajar desde una bandeja única ordenada por urgencia) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-044-02 | CA-02 · Asignación por flujo (Trabajar desde una bandeja única ordenada por urgencia) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-044-03 | CA-03 · Sin permiso de área (agregado por el PO) (Trabajar desde una bandeja única ordenada por urgencia) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-045-01 | CA-01 · Marca con motivo (Marcar un ticket crítico con el rayo de prioridad) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-045-02 | CA-02 · Permiso (Marcar un ticket crítico con el rayo de prioridad) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-045-03 | CA-03 · Límite del área (agregado por el PO) (Marcar un ticket crítico con el rayo de prioridad) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-046-01 | CA-01 · Balanceo (Reasignar automáticamente al gestor con menos carga) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-046-02 | CA-02 · Exclusiones (Reasignar automáticamente al gestor con menos carga) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-046-03 | CA-03 · Nadie disponible (agregado por el PO) (Reasignar automáticamente al gestor con menos carga) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-047-01 | CA-01 · Guía en el ticket (Consultar la guía de solución del tipo de ticket) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-047-02 | CA-02 · Versión (Consultar la guía de solución del tipo de ticket) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-047-03 | CA-03 · Tipo sin guía (agregado por el PO) (Consultar la guía de solución del tipo de ticket) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-048-01 | CA-01 · Sugerencia (Recibir retroalimentación de IA mientras atiendo y cierro) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-048-02 | CA-02 · Registro de la decisión (Recibir retroalimentación de IA mientras atiendo y cierro) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-048-03 | CA-03 · Datos personales (agregado por el PO) (Recibir retroalimentación de IA mientras atiendo y cierro) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-049-01 | CA-01 · Búsqueda (Buscar al cliente y llamarlo desde su ficha) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-049-02 | CA-02 · Llamar desde la ficha (Buscar al cliente y llamarlo desde su ficha) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-049-03 | CA-03 · Varias coincidencias (agregado por el PO) (Buscar al cliente y llamarlo desde su ficha) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-050-01 | CA-01 · Consulta 360 (Ver la consulta 360 del cliente dentro del ticket) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-050-02 | CA-02 · Sección restringida (Ver la consulta 360 del cliente dentro del ticket) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-050-03 | CA-03 · Fuente caída (agregado por el PO) (Ver la consulta 360 del cliente dentro del ticket) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-051-01 | CA-01 · Cliente no encontrado (Continuar la atención cuando la consulta del cliente falla) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-051-02 | CA-02 · Sistema fuente caído (Continuar la atención cuando la consulta del cliente falla) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-051-03 | CA-03 · Vinculación posterior (agregado por el PO) (Continuar la atención cuando la consulta del cliente falla) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-052-01 | CA-01 · Consulta vía API (Consultar datos específicos con el motor de José) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-052-02 | CA-02 · Motor no disponible (Consultar datos específicos con el motor de José) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-052-03 | CA-03 · Permisos (agregado por el PO) (Consultar datos específicos con el motor de José) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-053-01 | CA-01 · Búsqueda semántica (Buscar documentos del cliente por significado) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-053-02 | CA-02 · Documento restringido (Buscar documentos del cliente por significado) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-053-03 | CA-03 · Sin resultados (agregado por el PO) (Buscar documentos del cliente por significado) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-054-01 | CA-01 · Tablero del gestor (Ver mi avance diario y el de mi equipo) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-054-02 | CA-02 · Tablero del líder (Ver mi avance diario y el de mi equipo) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-054-03 | CA-03 · Privacidad (agregado por el PO) (Ver mi avance diario y el de mi equipo) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-055-01 | CA-01 · Correo de asignación (Recibir un correo al asignarme un ticket, con copia a mi líder) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-055-02 | CA-02 · Reasignación masiva (Recibir un correo al asignarme un ticket, con copia a mi líder) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-055-03 | CA-03 · Sin líder (agregado por el PO) (Recibir un correo al asignarme un ticket, con copia a mi líder) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-056-01 | CA-01 · Detección diaria (Abrir el caso de resolución por 3 meses impagos) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-056-02 | CA-02 · Regularización (Abrir el caso de resolución por 3 meses impagos) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-056-03 | CA-03 · Reclamo abierto (agregado por el PO) (Abrir el caso de resolución por 3 meses impagos) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-057-01 | CA-01 · Envío en paralelo (Enviar al cliente la alerta de cancelación en paralelo) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-057-02 | CA-02 · Constancia (Enviar al cliente la alerta de cancelación en paralelo) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-057-03 | CA-03 · Canal fallido (agregado por el PO) (Enviar al cliente la alerta de cancelación en paralelo) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-058-01 | CA-01 · Carta con copia (Enviar la carta de alerta al responsable del proyecto y su supervisor) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-058-02 | CA-02 · Escalamiento (Enviar la carta de alerta al responsable del proyecto y su supervisor) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-058-03 | CA-03 · Sin responsable (agregado por el PO) (Enviar la carta de alerta al responsable del proyecto y su supervisor) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-059-01 | CA-01 · Formulario simple (Registrar el ingreso de una persona al proyecto) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-059-02 | CA-02 · Cliente reconocido (Registrar el ingreso de una persona al proyecto) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-059-03 | CA-03 · Sin conexión (agregado por el PO) (Registrar el ingreso de una persona al proyecto) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-060-01 | CA-01 · Reserva con aforo (Reservar un cupo en el bus del Entrega Fest) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-060-02 | CA-02 · Lista de espera (Reservar un cupo en el bus del Entrega Fest) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-060-03 | CA-03 · Cancelación (agregado por el PO) (Reservar un cupo en el bus del Entrega Fest) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-061-01 | CA-01 · Autenticación SSO y visibilidad por rol desde NEXUS (Integrar identidad, SSO y roles con NEXUS · Etapa 2) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-061-02 | CA-02 · Sincronización automática de cambio de rol o área (Integrar identidad, SSO y roles con NEXUS · Etapa 2) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-062-01 | CA-01 · Copia de asignación al nuevo líder sincronizado desde NEXUS (Sincronizar la estructura organizacional desde NEXUS · Etapa 2) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-062-02 | CA-02 · Detección de cese en NEXUS y propuesta de reasignación en bloque (Sincronizar la estructura organizacional desde NEXUS · Etapa 2) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-063-01 | CA-01 · Visualización en línea de propuesta comercial y reserva desde DAEDALUS (Mostrar la propuesta comercial de DAEDALUS en la consulta 360 · Etapa 2) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-063-02 | CA-02 · Degradación elegante ante DAEDALUS no disponible (Mostrar la propuesta comercial de DAEDALUS en la consulta 360 · Etapa 2) | func | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-001-E2E | Flujo end-to-end de pantalla: Registrar un ticket tipificado desde cualquier canal | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-004-E2E | Flujo end-to-end de pantalla: Cambiar el estado del ticket con historial inmutable | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-005-E2E | Flujo end-to-end de pantalla: Registrar interacciones visibles o internas con evidencia | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-007-E2E | Flujo end-to-end de pantalla: Derivar un ticket a otra área con motivo tipificado | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-008-E2E | Flujo end-to-end de pantalla: Reasignar en bloque los tickets de un colaborador que cesa | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-009-E2E | Flujo end-to-end de pantalla: Ver mi casillero de tareas por área y responsable | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-011-E2E | Flujo end-to-end de pantalla: Reabrir un ticket con un nuevo compromiso sin borrar el original | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-012-E2E | Flujo end-to-end de pantalla: Registrar el asiento del Libro de Reclamaciones | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-013-E2E | Flujo end-to-end de pantalla: Calcular el plazo legal y gestionar la prórroga única | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-014-E2E | Flujo end-to-end de pantalla: Registrar la respuesta formal con cargo | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-016-E2E | Flujo end-to-end de pantalla: Dar seguimiento a apelaciones internas y ante INDECOPI | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-019-E2E | Flujo end-to-end de pantalla: Disparar la encuesta al cerrar el ticket | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-020-E2E | Flujo end-to-end de pantalla: Registrar un caso sensible con Código Único | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-021-E2E | Flujo end-to-end de pantalla: Emitir cargo previo y cargo de activación por separado | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-022-E2E | Flujo end-to-end de pantalla: Clasificar el riesgo del caso con matriz objetiva | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-024-E2E | Flujo end-to-end de pantalla: Validar casos cruzados o vinculados antes de registrar | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-025-E2E | Flujo end-to-end de pantalla: Cerrar el caso con estado homologado y evidencia | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-027-E2E | Flujo end-to-end de pantalla: Armar el paquete mínimo de handoff y confirmar su recepción | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-028-E2E | Flujo end-to-end de pantalla: Registrar la nota de estado emocional sin juicios de valor | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-030-E2E | Flujo end-to-end de pantalla: Monitorear en tiempo real y corregir antes del incumplimiento | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-031-E2E | Flujo end-to-end de pantalla: Generar el informe diario y el quincenal | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-033-E2E | Flujo end-to-end de pantalla: Registrar un reclamo de garantía vinculado a la entrega | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-035-E2E | Flujo end-to-end de pantalla: Registrar la inspección técnica antes de resolver | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-036-E2E | Flujo end-to-end de pantalla: Escalar la garantía a Eje 3 y gestionar la adenda | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-037-E2E | Flujo end-to-end de pantalla: Registrar el riesgo verbal y la secuencia de Frases Ancla | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-038-E2E | Flujo end-to-end de pantalla: Derivar de inmediato a la Estación 4 sin debate | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-039-E2E | Flujo end-to-end de pantalla: Registrar el caso con la etiqueta estándar | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-041-E2E | Flujo end-to-end de pantalla: Priorizar los reclamos con riesgo de denuncia por su exposición | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-042-E2E | Flujo end-to-end de pantalla: Atender la llamada con la ficha del cliente y registrarla en el ticket | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-043-E2E | Flujo end-to-end de pantalla: Configurar el flujo de trabajo de un tipo de ticket por área | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-044-E2E | Flujo end-to-end de pantalla: Trabajar desde una bandeja única ordenada por urgencia | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-045-E2E | Flujo end-to-end de pantalla: Marcar un ticket crítico con el rayo de prioridad | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-047-E2E | Flujo end-to-end de pantalla: Consultar la guía de solución del tipo de ticket | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-048-E2E | Flujo end-to-end de pantalla: Recibir retroalimentación de IA mientras atiendo y cierro | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-049-E2E | Flujo end-to-end de pantalla: Buscar al cliente y llamarlo desde su ficha | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-050-E2E | Flujo end-to-end de pantalla: Ver la consulta 360 del cliente dentro del ticket | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-051-E2E | Flujo end-to-end de pantalla: Continuar la atención cuando la consulta del cliente falla | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-053-E2E | Flujo end-to-end de pantalla: Buscar documentos del cliente por significado | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-054-E2E | Flujo end-to-end de pantalla: Ver mi avance diario y el de mi equipo | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-059-E2E | Flujo end-to-end de pantalla: Registrar el ingreso de una persona al proyecto | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-060-E2E | Flujo end-to-end de pantalla: Reservar un cupo en el bus del Entrega Fest | E2E | [pendiente - F8] | [pendiente - F8] |
| TC-HU-ATC-063-E2E | Flujo end-to-end de pantalla: Mostrar la propuesta comercial de DAEDALUS en la consulta 360 (Etapa 2) | E2E | [pendiente - F8] | [pendiente - F8] |

## Defectos

Sin defectos todavia: no hay ejecucion (F5, no F8).

| ID | Severidad | Impacto negocio | Estado | Plan (mayores: aprueba PO) |
|---|---|---|---|---|

Criticos = 0. Bloqueantes = 0. NFR contra numero objetivo: pendiente de medir en F8.

Generado por IA: actualizado con los 167 escenarios Gherkin oficiales del artefacto de Claude «Tablero Aybar Atiende» (PLT-04 v1.2, versión `1792099647-bef0`) - Revisado por: pendiente
