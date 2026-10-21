# Paquete Definir · Etapa 1 (v1.3)

Borrador del paquete Definir de toda la Etapa 1 en el formato del SDK. Son 11 épicas, 23 funcionalidades, 62 historias y un DoR por funcionalidad.
Cada documento lleva el frontmatter del contrato (11 campos y `ui:` en las historias).

**De dónde sale.** Se transcribió de los documentos del PO v1.3 (`../po-v1.3/`) sin cambiar su contenido: «Como / quiero / para», criterios de aceptación, reglas, horas, fechas, dependencias y riesgos.
Solo se omitieron las frases que remiten a la Etapa 2. Cada documento termina con «Generado por IA … — Revisado por: (pendiente)».

**Estado.** Todo está en `estado: draft`. Los 119 documentos están en Nexora desde el 20-oct, con las mismas huellas, pendientes de aprobación: épicas, funcionalidades e historias los aprueba el PO, y los DoR, el líder técnico con el project manager. El detalle está en `PLAN-NEXORA.md`.

**Validación** (`aybar paquete validar propuesta-po/documentacion/paquete-definir-etapa1-v1.3`): **0 errores**. Hay 24 advertencias esperadas en esta etapa:
- las 23 funcionalidades tienen pantallas y aún no tienen G2;
- todavía no hay tareas.

**Para leerlo** sin instalar nada, abre `explorador.html` en el navegador. Lo generó `aybar paquete explorador` del SDK.

## [EP-ATC-01 · Núcleo de tickets omnicanal](epicas/EP-ATC-01-nucleo-de-tickets-omnicanal.md)

Dev 1 (Brayan) · 22 h · iteración 1 · Debe

| Funcionalidad | DoR | Historias |
|---|---|---|
| [FT-ATC-01 Registro multicanal y tipificación](features/FT-ATC-01-registro-multicanal-y-tipificacion.md) | [DoR](dor/DOR-FT-ATC-01-registro-multicanal-y-tipificacion.md) | [001](historias/HU-ATC-001-registrar-un-ticket-tipificado-desde-cualquier-canal.md) · [002](historias/HU-ATC-002-entregar-al-cliente-un-numero-de-ticket-por-razon-social.md) |
| [FT-ATC-02 Ciclo de vida, interacciones e hitos](features/FT-ATC-02-ciclo-de-vida-interacciones-e-hitos.md) | [DoR](dor/DOR-FT-ATC-02-ciclo-de-vida-interacciones-e-hitos.md) | [004](historias/HU-ATC-004-cambiar-el-estado-del-ticket-con-historial-inmutable.md) · [005](historias/HU-ATC-005-registrar-interacciones-visibles-o-internas-con-evidencia.md) · [006](historias/HU-ATC-006-conservar-los-hitos-temporales-probatorios.md) |

## [EP-ATC-02 · Enrutamiento, SLA y alertas](epicas/EP-ATC-02-enrutamiento-sla-y-alertas.md)

Dev 2 (Jesús) · 28 h · iteración 1 · Debe

| Funcionalidad | DoR | Historias |
|---|---|---|
| [FT-ATC-03 Derivación, reasignación y casillero](features/FT-ATC-03-derivacion-reasignacion-y-casillero.md) | [DoR](dor/DOR-FT-ATC-03-derivacion-reasignacion-y-casillero.md) | [007](historias/HU-ATC-007-derivar-un-ticket-a-otra-area-con-motivo-tipificado.md) · [008](historias/HU-ATC-008-reasignar-en-bloque-los-tickets-de-un-colaborador-que-cesa.md) · [009](historias/HU-ATC-009-ver-mi-casillero-de-tareas-por-area-y-responsable.md) |
| [FT-ATC-04 Motor SLA y alertas](features/FT-ATC-04-motor-sla-y-alertas.md) | [DoR](dor/DOR-FT-ATC-04-motor-sla-y-alertas.md) | [003](historias/HU-ATC-003-congelar-el-sla-del-ticket-al-abrirlo.md) · [010](historias/HU-ATC-010-recibir-una-sola-alerta-por-incumplimiento-de-sla.md) · [011](historias/HU-ATC-011-reabrir-un-ticket-con-un-nuevo-compromiso-sin-borrar-el.md) · [029](historias/HU-ATC-029-medir-el-cierre-end-to-end-de-la-experiencia.md) |

## [EP-ATC-03 · Libro de Reclamaciones y apelaciones](epicas/EP-ATC-03-libro-de-reclamaciones-y-apelaciones.md)

Dev 1 (Brayan) · 21 h · iteración 1y2 · Debe

| Funcionalidad | DoR | Historias |
|---|---|---|
| [FT-ATC-05 Libro de Reclamaciones](features/FT-ATC-05-libro-de-reclamaciones.md) | [DoR](dor/DOR-FT-ATC-05-libro-de-reclamaciones.md) | [012](historias/HU-ATC-012-registrar-el-asiento-del-libro-de-reclamaciones.md) · [013](historias/HU-ATC-013-calcular-el-plazo-legal-y-gestionar-la-prorroga-unica.md) · [014](historias/HU-ATC-014-registrar-la-respuesta-formal-con-cargo.md) · [015](historias/HU-ATC-015-vigilar-el-plazo-legal-y-detectar-reclamos-huerfanos.md) |
| [FT-ATC-06 Apelaciones internas e INDECOPI](features/FT-ATC-06-apelaciones-internas-e-indecopi.md) | [DoR](dor/DOR-FT-ATC-06-apelaciones-internas-e-indecopi.md) | [016](historias/HU-ATC-016-dar-seguimiento-a-apelaciones-internas-y-ante-indecopi.md) |

## [EP-ATC-04 · Gate legal Eje 3 y Mesa de Casos sensibles](epicas/EP-ATC-04-gate-legal-eje-3-y-mesa-de-casos-sensibles.md)

Dev 2 (Jesús) · 32 h · iteración 1y2 · Debe

| Funcionalidad | DoR | Historias |
|---|---|---|
| [FT-ATC-07 Gate de derivación a Eje 3 y handoff](features/FT-ATC-07-gate-de-derivacion-a-eje-3-y-handoff.md) | [DoR](dor/DOR-FT-ATC-07-gate-de-derivacion-a-eje-3-y-handoff.md) | [026](historias/HU-ATC-026-bloquear-la-resolucion-en-eje-1-2-ante-senal-de-conflicto.md) · [027](historias/HU-ATC-027-armar-el-paquete-minimo-de-handoff-y-confirmar-su-recepcion.md) · [028](historias/HU-ATC-028-registrar-la-nota-de-estado-emocional-sin-juicios-de-valor.md) |
| [FT-ATC-08 Mesa SGD: recepción, activación y riesgo](features/FT-ATC-08-mesa-sgd-recepcion-activacion-y-riesgo.md) | [DoR](dor/DOR-FT-ATC-08-mesa-sgd-recepcion-activacion-y-riesgo.md) | [020](historias/HU-ATC-020-registrar-un-caso-sensible-con-codigo-unico.md) · [021](historias/HU-ATC-021-emitir-cargo-previo-y-cargo-de-activacion-por-separado.md) · [022](historias/HU-ATC-022-clasificar-el-riesgo-del-caso-con-matriz-objetiva.md) |
| [FT-ATC-09 Escalamiento, vinculación y cierre tipificado](features/FT-ATC-09-escalamiento-vinculacion-y-cierre-tipificado.md) | [DoR](dor/DOR-FT-ATC-09-escalamiento-vinculacion-y-cierre-tipificado.md) | [023](historias/HU-ATC-023-escalar-en-cadena-un-caso-que-incumple-su-sla.md) · [024](historias/HU-ATC-024-validar-casos-cruzados-o-vinculados-antes-de-registrar.md) · [025](historias/HU-ATC-025-cerrar-el-caso-con-estado-homologado-y-evidencia.md) |

## [EP-ATC-05 · Postventa: reclamos de garantía](epicas/EP-ATC-05-postventa-reclamos-de-garantia.md)

Dev 1 (Brayan) · 12 h · iteración 2 · Debería

| Funcionalidad | DoR | Historias |
|---|---|---|
| [FT-ATC-10 Reclamos de garantía postventa](features/FT-ATC-10-reclamos-de-garantia-postventa.md) | [DoR](dor/DOR-FT-ATC-10-reclamos-de-garantia-postventa.md) | [033](historias/HU-ATC-033-registrar-un-reclamo-de-garantia-vinculado-a-la-entrega.md) · [034](historias/HU-ATC-034-validar-la-vigencia-de-la-garantia-contra-la-cobertura.md) · [035](historias/HU-ATC-035-registrar-la-inspeccion-tecnica-antes-de-resolver.md) · [036](historias/HU-ATC-036-escalar-la-garantia-a-eje-3-y-gestionar-la-adenda.md) |

## [EP-ATC-06 · Autogestión del cliente y trazabilidad (Mi Portal)](epicas/EP-ATC-06-autogestion-del-cliente-y-trazabilidad-mi-portal.md)

Dev 4 (Daniel) · 9 h · iteración 2 · Debe

| Funcionalidad | DoR | Historias |
|---|---|---|
| [FT-ATC-24 Autogestión de tickets del cliente en Mi Portal](features/FT-ATC-24-autogestion-de-tickets-del-cliente-en-mi-portal.md) | [DoR](dor/DOR-FT-ATC-24-autogestion-de-tickets-del-cliente-en-mi-portal.md) | [064](historias/HU-ATC-064-registrar-y-consultar-mis-tickets-en-mi-portal.md) · [065](historias/HU-ATC-065-ver-la-trazabilidad-de-mi-ticket.md) · [066](historias/HU-ATC-066-responder-adjuntar-y-confirmar-la-solucion-de-mi-ticket.md) |

## [EP-ATC-07 · Calidad de atención y Torre de Control CX](epicas/EP-ATC-07-calidad-de-atencion-y-torre-de-control-cx.md)

Dev 3 (Michel) · 16 h · iteración 2 · Debería

| Funcionalidad | DoR | Historias |
|---|---|---|
| [FT-ATC-13 Encuesta post-atención](features/FT-ATC-13-encuesta-post-atencion.md) | [DoR](dor/DOR-FT-ATC-13-encuesta-post-atencion.md) | [019](historias/HU-ATC-019-disparar-la-encuesta-al-cerrar-el-ticket.md) |
| [FT-ATC-14 Torre de Control CX](features/FT-ATC-14-torre-de-control-cx.md) | [DoR](dor/DOR-FT-ATC-14-torre-de-control-cx.md) | [030](historias/HU-ATC-030-monitorear-en-tiempo-real-y-corregir-antes-del.md) · [031](historias/HU-ATC-031-generar-el-informe-diario-y-el-quincenal.md) · [032](historias/HU-ATC-032-auditar-registros-paralelos-del-dato-de-cliente.md) |

## [EP-ATC-08 · EntregaFest: contención y derivación en vivo](epicas/EP-ATC-08-entregafest-contencion-y-derivacion-en-vivo.md)

Dev 1 (Brayan) · 6 h · iteración 2 · Podría

| Funcionalidad | DoR | Historias |
|---|---|---|
| [FT-ATC-15 EntregaFest: contención en vivo](features/FT-ATC-15-entregafest-contencion-en-vivo.md) | [DoR](dor/DOR-FT-ATC-15-entregafest-contencion-en-vivo.md) | [037](historias/HU-ATC-037-registrar-el-riesgo-verbal-y-la-secuencia-de-frases-ancla.md) · [038](historias/HU-ATC-038-derivar-de-inmediato-a-la-estacion-4-sin-debate.md) · [039](historias/HU-ATC-039-registrar-el-caso-con-la-etiqueta-estandar.md) |

## [EP-ATC-09 · Bandeja orquestadora y asistencia al gestor](epicas/EP-ATC-09-bandeja-orquestadora-y-asistencia-al-gestor.md)

Dev 3 (Michel) · 44 h · iteración 1y2 · Debe

| Funcionalidad | DoR | Historias |
|---|---|---|
| [FT-ATC-18 Bandeja orquestadora y flujos por área](features/FT-ATC-18-bandeja-orquestadora-y-flujos-por-area.md) | [DoR](dor/DOR-FT-ATC-18-bandeja-orquestadora-y-flujos-por-area.md) | [043](historias/HU-ATC-043-configurar-el-flujo-de-trabajo-de-un-tipo-de-ticket-por-area.md) · [044](historias/HU-ATC-044-trabajar-desde-una-bandeja-unica-ordenada-por-urgencia.md) · [045](historias/HU-ATC-045-marcar-un-ticket-critico-con-el-rayo-de-prioridad.md) · [046](historias/HU-ATC-046-reasignar-automaticamente-al-gestor-con-menos-carga.md) |
| [FT-ATC-25 Visor del proceso 3D (operación en vivo)](features/FT-ATC-25-visor-del-proceso-3d-operacion-en-vivo.md) | [DoR](dor/DOR-FT-ATC-25-visor-del-proceso-3d-operacion-en-vivo.md) | [067](historias/HU-ATC-067-ver-el-proceso-de-atencion-en-un-visor-3d-operacion-en-vivo.md) |
| [FT-ATC-19 Asistencia al gestor: guía e IA](features/FT-ATC-19-asistencia-al-gestor-guia-e-ia.md) | [DoR](dor/DOR-FT-ATC-19-asistencia-al-gestor-guia-e-ia.md) | [047](historias/HU-ATC-047-consultar-la-guia-de-solucion-del-tipo-de-ticket.md) · [048](historias/HU-ATC-048-recibir-retroalimentacion-de-ia-mientras-atiendo-y-cierro.md) |
| [FT-ATC-21 Productividad y notificaciones del gestor](features/FT-ATC-21-productividad-y-notificaciones-del-gestor.md) | [DoR](dor/DOR-FT-ATC-21-productividad-y-notificaciones-del-gestor.md) | [054](historias/HU-ATC-054-ver-mi-avance-diario-y-el-de-mi-equipo.md) · [055](historias/HU-ATC-055-recibir-un-correo-al-asignarme-un-ticket-con-copia-a-mi.md) |

## [EP-ATC-10 · Consulta 360 e integraciones operativas](epicas/EP-ATC-10-consulta-360-e-integraciones-operativas.md)

Dev 4 (Daniel) · 36 h · iteración 1y2 · Debe

| Funcionalidad | DoR | Historias |
|---|---|---|
| [FT-ATC-20 Búsqueda y consulta 360 del cliente](features/FT-ATC-20-busqueda-y-consulta-360-del-cliente.md) | [DoR](dor/DOR-FT-ATC-20-busqueda-y-consulta-360-del-cliente.md) | [049](historias/HU-ATC-049-buscar-al-cliente-y-llamarlo-desde-su-ficha.md) · [050](historias/HU-ATC-050-ver-la-consulta-360-del-cliente-dentro-del-ticket.md) · [051](historias/HU-ATC-051-continuar-la-atencion-cuando-la-consulta-del-cliente-falla.md) · [052](historias/HU-ATC-052-consultar-datos-especificos-con-el-motor-de-jose.md) · [053](historias/HU-ATC-053-buscar-documentos-del-cliente-por-significado.md) |
| [FT-ATC-17 Integración con la plataforma del call center](features/FT-ATC-17-integracion-con-la-plataforma-del-call-center.md) | [DoR](dor/DOR-FT-ATC-17-integracion-con-la-plataforma-del-call-center.md) | [042](historias/HU-ATC-042-atender-la-llamada-con-la-ficha-del-cliente-y-registrarla-en.md) |
| [FT-ATC-16 Integración con Legal y prevención de denuncias](features/FT-ATC-16-integracion-con-legal-y-prevencion-de-denuncias.md) | [DoR](dor/DOR-FT-ATC-16-integracion-con-legal-y-prevencion-de-denuncias.md) | [040](historias/HU-ATC-040-sincronizar-con-legal-los-tickets-derivados-a-eje-3.md) · [041](historias/HU-ATC-041-priorizar-los-reclamos-con-riesgo-de-denuncia-por-su.md) |

## [EP-ATC-11 · Resolución por morosidad y formularios simples](epicas/EP-ATC-11-resolucion-por-morosidad-y-formularios-simples.md)

Dev 4 (Daniel) · 17 h · iteración 2 · Debe

| Funcionalidad | DoR | Historias |
|---|---|---|
| [FT-ATC-22 Resolución de contrato por morosidad](features/FT-ATC-22-resolucion-de-contrato-por-morosidad.md) | [DoR](dor/DOR-FT-ATC-22-resolucion-de-contrato-por-morosidad.md) | [056](historias/HU-ATC-056-abrir-el-caso-de-resolucion-por-3-meses-impagos.md) · [057](historias/HU-ATC-057-enviar-al-cliente-la-alerta-de-cancelacion-en-paralelo.md) · [058](historias/HU-ATC-058-enviar-la-carta-de-alerta-al-responsable-del-proyecto-y-su.md) |
| [FT-ATC-23 Formularios simples: ingreso al proyecto y Entrega Fest](features/FT-ATC-23-formularios-simples-ingreso-al-proyecto-y-entrega-fest.md) | [DoR](dor/DOR-FT-ATC-23-formularios-simples-ingreso-al-proyecto-y-entrega-fest.md) | [059](historias/HU-ATC-059-registrar-el-ingreso-de-una-persona-al-proyecto.md) · [060](historias/HU-ATC-060-reservar-un-cupo-en-el-bus-del-entrega-fest.md) |
