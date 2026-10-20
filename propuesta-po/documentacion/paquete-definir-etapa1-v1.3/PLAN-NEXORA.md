# Plan de publicación en Nexora · paquete Definir de la Etapa 1 (v1.3)

Revisado el 20-oct-2026 contra Nexora (proyecto PJ-06, apartado «Tiketes»). Es solo lectura: **no se subió nada**. La subida espera la luz verde del equipo.

## Estado de Nexora hoy

- **68 documentos, ninguno aprobado.** Todos son versiones pendientes de firma. Hay **0 ítems** en el proyecto: todavía no hay ticket ni G0 en el backlog.
- **De este paquete hay 27 documentos de Brayan en Nexora**, en la v1, escritos sobre la v1.2. No hay épicas, funcionalidades, historias ni DoR de Jesús, Michel ni Daniel.
- **Hay un documento duplicado de Daniel**: `historias/HU-DOC-001 HU-ATC-001-registrar-tickets-multicanal-tipificados.md.md`, v1 pendiente. El perfil desarrollador no lo puede borrar: lo resuelve el PO.
- **Jesús mantiene en Nexora el resto del paquete**: 14 ADR, análisis (BRD, intake, `decisiones.md` v2, cobertura de requisitos), arquitectura, datos, roadmap y los gates G0 y G1. Este plan no los toca. Su `decisiones.md` ya anota este paquete local (P-013) y las decisiones del mockup (D-007).

## Qué subiría este paquete (119 documentos)

- **27 pasan a versión 2**: los de Brayan que ya están en Nexora, de épicas, funcionalidades, historias y DoR de la EP-ATC-01, 03 y 05.
- **92 son nuevos**: los 6 de la EP-ATC-08 de Brayan y los 86 de Jesús, Michel y Daniel.
- **Ninguno queda igual** al de Nexora.

| Responsable | Versión nueva | Documento nuevo |
|---|---|---|
| Dev 1 (Brayan) | 27 | 6 |
| Dev 2 (Jesús) | 0 | 28 |
| Dev 3 (Michel) | 0 | 27 |
| Dev 4 (Daniel) | 0 | 31 |

**Decisión que falta antes de subir**: el paquete tiene también las épicas, funcionalidades, historias y DoR de Jesús, Michel y Daniel.
Si sube todo Brayan, sus versiones quedan a su nombre en la auditoría de Nexora. La otra opción es que suba solo lo suyo (33 documentos) y que cada responsable suba lo propio desde esta misma carpeta. En los dos casos, todo queda pendiente hasta que lo apruebe el PO.

Solo se suben las carpetas `epicas/`, `features/`, `historias/` y `dor/`. `README.md`, `explorador.html`, este plan y `NEXORA-BRAYAN-v1.3.md`, el detalle de los cambios de Brayan, son material de consulta y no van a Nexora.

Cómo se sube, cuando haya luz verde: primero `nexora_paquete_publicar` con `dry_run` para ver el plan del servidor, y después la publicación real. El agente nunca aprueba.

## Documento por documento

| Documento | Responsable | Acción | Hoy en Nexora |
|---|---|---|---|
| `dor/DOR-FT-ATC-01-registro-multicanal-y-tipificacion.md` | Dev 1 (Brayan) | Versión 2 | v1 (sobre la v1.2) |
| `dor/DOR-FT-ATC-02-ciclo-de-vida-interacciones-e-hitos.md` | Dev 1 (Brayan) | Versión 2 | v1 (sobre la v1.2) |
| `dor/DOR-FT-ATC-05-libro-de-reclamaciones.md` | Dev 1 (Brayan) | Versión 2 | v1 (sobre la v1.2) |
| `dor/DOR-FT-ATC-06-apelaciones-internas-e-indecopi.md` | Dev 1 (Brayan) | Versión 2 | v1 (sobre la v1.2) |
| `dor/DOR-FT-ATC-10-reclamos-de-garantia-postventa.md` | Dev 1 (Brayan) | Versión 2 | v1 (sobre la v1.2) |
| `epicas/EP-ATC-01-nucleo-de-tickets-omnicanal.md` | Dev 1 (Brayan) | Versión 2 | v1 (sobre la v1.2) |
| `epicas/EP-ATC-03-libro-de-reclamaciones-y-apelaciones.md` | Dev 1 (Brayan) | Versión 2 | v1 (sobre la v1.2) |
| `epicas/EP-ATC-05-postventa-reclamos-de-garantia.md` | Dev 1 (Brayan) | Versión 2 | v1 (sobre la v1.2) |
| `features/FT-ATC-01-registro-multicanal-y-tipificacion.md` | Dev 1 (Brayan) | Versión 2 | v1 (sobre la v1.2) |
| `features/FT-ATC-02-ciclo-de-vida-interacciones-e-hitos.md` | Dev 1 (Brayan) | Versión 2 | v1 (sobre la v1.2) |
| `features/FT-ATC-05-libro-de-reclamaciones.md` | Dev 1 (Brayan) | Versión 2 | v1 (sobre la v1.2) |
| `features/FT-ATC-06-apelaciones-internas-e-indecopi.md` | Dev 1 (Brayan) | Versión 2 | v1 (sobre la v1.2) |
| `features/FT-ATC-10-reclamos-de-garantia-postventa.md` | Dev 1 (Brayan) | Versión 2 | v1 (sobre la v1.2) |
| `historias/HU-ATC-001-registrar-un-ticket-tipificado-desde-cualquier-canal.md` | Dev 1 (Brayan) | Versión 2 | v1 (sobre la v1.2) |
| `historias/HU-ATC-002-entregar-al-cliente-un-numero-de-ticket-por-razon-social.md` | Dev 1 (Brayan) | Versión 2 | v1 (sobre la v1.2) |
| `historias/HU-ATC-004-cambiar-el-estado-del-ticket-con-historial-inmutable.md` | Dev 1 (Brayan) | Versión 2 | v1 (sobre la v1.2) |
| `historias/HU-ATC-005-registrar-interacciones-visibles-o-internas-con-evidencia.md` | Dev 1 (Brayan) | Versión 2 | v1 (sobre la v1.2) |
| `historias/HU-ATC-006-conservar-los-hitos-temporales-probatorios.md` | Dev 1 (Brayan) | Versión 2 | v1 (sobre la v1.2) |
| `historias/HU-ATC-012-registrar-el-asiento-del-libro-de-reclamaciones.md` | Dev 1 (Brayan) | Versión 2 | v1 (sobre la v1.2) |
| `historias/HU-ATC-013-calcular-el-plazo-legal-y-gestionar-la-prorroga-unica.md` | Dev 1 (Brayan) | Versión 2 | v1 (sobre la v1.2) |
| `historias/HU-ATC-014-registrar-la-respuesta-formal-con-cargo.md` | Dev 1 (Brayan) | Versión 2 | v1 (sobre la v1.2) |
| `historias/HU-ATC-015-vigilar-el-plazo-legal-y-detectar-reclamos-huerfanos.md` | Dev 1 (Brayan) | Versión 2 | v1 (sobre la v1.2) |
| `historias/HU-ATC-016-dar-seguimiento-a-apelaciones-internas-y-ante-indecopi.md` | Dev 1 (Brayan) | Versión 2 | v1 (sobre la v1.2) |
| `historias/HU-ATC-033-registrar-un-reclamo-de-garantia-vinculado-a-la-entrega.md` | Dev 1 (Brayan) | Versión 2 | v1 (sobre la v1.2) |
| `historias/HU-ATC-034-validar-la-vigencia-de-la-garantia-contra-la-cobertura.md` | Dev 1 (Brayan) | Versión 2 | v1 (sobre la v1.2) |
| `historias/HU-ATC-035-registrar-la-inspeccion-tecnica-antes-de-resolver.md` | Dev 1 (Brayan) | Versión 2 | v1 (sobre la v1.2) |
| `historias/HU-ATC-036-escalar-la-garantia-a-eje-3-y-gestionar-la-adenda.md` | Dev 1 (Brayan) | Versión 2 | v1 (sobre la v1.2) |
| `dor/DOR-FT-ATC-03-derivacion-reasignacion-y-casillero.md` | Dev 2 (Jesús) | Nuevo (v1) | — |
| `dor/DOR-FT-ATC-04-motor-sla-y-alertas.md` | Dev 2 (Jesús) | Nuevo (v1) | — |
| `dor/DOR-FT-ATC-07-gate-de-derivacion-a-eje-3-y-handoff.md` | Dev 2 (Jesús) | Nuevo (v1) | — |
| `dor/DOR-FT-ATC-08-mesa-sgd-recepcion-activacion-y-riesgo.md` | Dev 2 (Jesús) | Nuevo (v1) | — |
| `dor/DOR-FT-ATC-09-escalamiento-vinculacion-y-cierre-tipificado.md` | Dev 2 (Jesús) | Nuevo (v1) | — |
| `dor/DOR-FT-ATC-13-encuesta-post-atencion.md` | Dev 3 (Michel) | Nuevo (v1) | — |
| `dor/DOR-FT-ATC-14-torre-de-control-cx.md` | Dev 3 (Michel) | Nuevo (v1) | — |
| `dor/DOR-FT-ATC-15-entregafest-contencion-en-vivo.md` | Dev 1 (Brayan) | Nuevo (v1) | — |
| `dor/DOR-FT-ATC-16-integracion-con-legal-y-prevencion-de-denuncias.md` | Dev 4 (Daniel) | Nuevo (v1) | — |
| `dor/DOR-FT-ATC-17-integracion-con-la-plataforma-del-call-center.md` | Dev 4 (Daniel) | Nuevo (v1) | — |
| `dor/DOR-FT-ATC-18-bandeja-orquestadora-y-flujos-por-area.md` | Dev 3 (Michel) | Nuevo (v1) | — |
| `dor/DOR-FT-ATC-19-asistencia-al-gestor-guia-e-ia.md` | Dev 3 (Michel) | Nuevo (v1) | — |
| `dor/DOR-FT-ATC-20-busqueda-y-consulta-360-del-cliente.md` | Dev 4 (Daniel) | Nuevo (v1) | — |
| `dor/DOR-FT-ATC-21-productividad-y-notificaciones-del-gestor.md` | Dev 3 (Michel) | Nuevo (v1) | — |
| `dor/DOR-FT-ATC-22-resolucion-de-contrato-por-morosidad.md` | Dev 4 (Daniel) | Nuevo (v1) | — |
| `dor/DOR-FT-ATC-23-formularios-simples-ingreso-al-proyecto-y-entrega-fest.md` | Dev 4 (Daniel) | Nuevo (v1) | — |
| `dor/DOR-FT-ATC-24-autogestion-de-tickets-del-cliente-en-mi-portal.md` | Dev 4 (Daniel) | Nuevo (v1) | — |
| `dor/DOR-FT-ATC-25-visor-del-proceso-3d-operacion-en-vivo.md` | Dev 3 (Michel) | Nuevo (v1) | — |
| `epicas/EP-ATC-02-enrutamiento-sla-y-alertas.md` | Dev 2 (Jesús) | Nuevo (v1) | — |
| `epicas/EP-ATC-04-gate-legal-eje-3-y-mesa-de-casos-sensibles.md` | Dev 2 (Jesús) | Nuevo (v1) | — |
| `epicas/EP-ATC-06-autogestion-del-cliente-y-trazabilidad-mi-portal.md` | Dev 4 (Daniel) | Nuevo (v1) | — |
| `epicas/EP-ATC-07-calidad-de-atencion-y-torre-de-control-cx.md` | Dev 3 (Michel) | Nuevo (v1) | — |
| `epicas/EP-ATC-08-entregafest-contencion-y-derivacion-en-vivo.md` | Dev 1 (Brayan) | Nuevo (v1) | — |
| `epicas/EP-ATC-09-bandeja-orquestadora-y-asistencia-al-gestor.md` | Dev 3 (Michel) | Nuevo (v1) | — |
| `epicas/EP-ATC-10-consulta-360-e-integraciones-operativas.md` | Dev 4 (Daniel) | Nuevo (v1) | — |
| `epicas/EP-ATC-11-resolucion-por-morosidad-y-formularios-simples.md` | Dev 4 (Daniel) | Nuevo (v1) | — |
| `features/FT-ATC-03-derivacion-reasignacion-y-casillero.md` | Dev 2 (Jesús) | Nuevo (v1) | — |
| `features/FT-ATC-04-motor-sla-y-alertas.md` | Dev 2 (Jesús) | Nuevo (v1) | — |
| `features/FT-ATC-07-gate-de-derivacion-a-eje-3-y-handoff.md` | Dev 2 (Jesús) | Nuevo (v1) | — |
| `features/FT-ATC-08-mesa-sgd-recepcion-activacion-y-riesgo.md` | Dev 2 (Jesús) | Nuevo (v1) | — |
| `features/FT-ATC-09-escalamiento-vinculacion-y-cierre-tipificado.md` | Dev 2 (Jesús) | Nuevo (v1) | — |
| `features/FT-ATC-13-encuesta-post-atencion.md` | Dev 3 (Michel) | Nuevo (v1) | — |
| `features/FT-ATC-14-torre-de-control-cx.md` | Dev 3 (Michel) | Nuevo (v1) | — |
| `features/FT-ATC-15-entregafest-contencion-en-vivo.md` | Dev 1 (Brayan) | Nuevo (v1) | — |
| `features/FT-ATC-16-integracion-con-legal-y-prevencion-de-denuncias.md` | Dev 4 (Daniel) | Nuevo (v1) | — |
| `features/FT-ATC-17-integracion-con-la-plataforma-del-call-center.md` | Dev 4 (Daniel) | Nuevo (v1) | — |
| `features/FT-ATC-18-bandeja-orquestadora-y-flujos-por-area.md` | Dev 3 (Michel) | Nuevo (v1) | — |
| `features/FT-ATC-19-asistencia-al-gestor-guia-e-ia.md` | Dev 3 (Michel) | Nuevo (v1) | — |
| `features/FT-ATC-20-busqueda-y-consulta-360-del-cliente.md` | Dev 4 (Daniel) | Nuevo (v1) | — |
| `features/FT-ATC-21-productividad-y-notificaciones-del-gestor.md` | Dev 3 (Michel) | Nuevo (v1) | — |
| `features/FT-ATC-22-resolucion-de-contrato-por-morosidad.md` | Dev 4 (Daniel) | Nuevo (v1) | — |
| `features/FT-ATC-23-formularios-simples-ingreso-al-proyecto-y-entrega-fest.md` | Dev 4 (Daniel) | Nuevo (v1) | — |
| `features/FT-ATC-24-autogestion-de-tickets-del-cliente-en-mi-portal.md` | Dev 4 (Daniel) | Nuevo (v1) | — |
| `features/FT-ATC-25-visor-del-proceso-3d-operacion-en-vivo.md` | Dev 3 (Michel) | Nuevo (v1) | — |
| `historias/HU-ATC-003-congelar-el-sla-del-ticket-al-abrirlo.md` | Dev 2 (Jesús) | Nuevo (v1) | — |
| `historias/HU-ATC-007-derivar-un-ticket-a-otra-area-con-motivo-tipificado.md` | Dev 2 (Jesús) | Nuevo (v1) | — |
| `historias/HU-ATC-008-reasignar-en-bloque-los-tickets-de-un-colaborador-que-cesa.md` | Dev 2 (Jesús) | Nuevo (v1) | — |
| `historias/HU-ATC-009-ver-mi-casillero-de-tareas-por-area-y-responsable.md` | Dev 2 (Jesús) | Nuevo (v1) | — |
| `historias/HU-ATC-010-recibir-una-sola-alerta-por-incumplimiento-de-sla.md` | Dev 2 (Jesús) | Nuevo (v1) | — |
| `historias/HU-ATC-011-reabrir-un-ticket-con-un-nuevo-compromiso-sin-borrar-el.md` | Dev 2 (Jesús) | Nuevo (v1) | — |
| `historias/HU-ATC-019-disparar-la-encuesta-al-cerrar-el-ticket.md` | Dev 3 (Michel) | Nuevo (v1) | — |
| `historias/HU-ATC-020-registrar-un-caso-sensible-con-codigo-unico.md` | Dev 2 (Jesús) | Nuevo (v1) | — |
| `historias/HU-ATC-021-emitir-cargo-previo-y-cargo-de-activacion-por-separado.md` | Dev 2 (Jesús) | Nuevo (v1) | — |
| `historias/HU-ATC-022-clasificar-el-riesgo-del-caso-con-matriz-objetiva.md` | Dev 2 (Jesús) | Nuevo (v1) | — |
| `historias/HU-ATC-023-escalar-en-cadena-un-caso-que-incumple-su-sla.md` | Dev 2 (Jesús) | Nuevo (v1) | — |
| `historias/HU-ATC-024-validar-casos-cruzados-o-vinculados-antes-de-registrar.md` | Dev 2 (Jesús) | Nuevo (v1) | — |
| `historias/HU-ATC-025-cerrar-el-caso-con-estado-homologado-y-evidencia.md` | Dev 2 (Jesús) | Nuevo (v1) | — |
| `historias/HU-ATC-026-bloquear-la-resolucion-en-eje-1-2-ante-senal-de-conflicto.md` | Dev 2 (Jesús) | Nuevo (v1) | — |
| `historias/HU-ATC-027-armar-el-paquete-minimo-de-handoff-y-confirmar-su-recepcion.md` | Dev 2 (Jesús) | Nuevo (v1) | — |
| `historias/HU-ATC-028-registrar-la-nota-de-estado-emocional-sin-juicios-de-valor.md` | Dev 2 (Jesús) | Nuevo (v1) | — |
| `historias/HU-ATC-029-medir-el-cierre-end-to-end-de-la-experiencia.md` | Dev 2 (Jesús) | Nuevo (v1) | — |
| `historias/HU-ATC-030-monitorear-en-tiempo-real-y-corregir-antes-del.md` | Dev 3 (Michel) | Nuevo (v1) | — |
| `historias/HU-ATC-031-generar-el-informe-diario-y-el-quincenal.md` | Dev 3 (Michel) | Nuevo (v1) | — |
| `historias/HU-ATC-032-auditar-registros-paralelos-del-dato-de-cliente.md` | Dev 3 (Michel) | Nuevo (v1) | — |
| `historias/HU-ATC-037-registrar-el-riesgo-verbal-y-la-secuencia-de-frases-ancla.md` | Dev 1 (Brayan) | Nuevo (v1) | — |
| `historias/HU-ATC-038-derivar-de-inmediato-a-la-estacion-4-sin-debate.md` | Dev 1 (Brayan) | Nuevo (v1) | — |
| `historias/HU-ATC-039-registrar-el-caso-con-la-etiqueta-estandar.md` | Dev 1 (Brayan) | Nuevo (v1) | — |
| `historias/HU-ATC-040-sincronizar-con-legal-los-tickets-derivados-a-eje-3.md` | Dev 4 (Daniel) | Nuevo (v1) | — |
| `historias/HU-ATC-041-priorizar-los-reclamos-con-riesgo-de-denuncia-por-su.md` | Dev 4 (Daniel) | Nuevo (v1) | — |
| `historias/HU-ATC-042-atender-la-llamada-con-la-ficha-del-cliente-y-registrarla-en.md` | Dev 4 (Daniel) | Nuevo (v1) | — |
| `historias/HU-ATC-043-configurar-el-flujo-de-trabajo-de-un-tipo-de-ticket-por-area.md` | Dev 3 (Michel) | Nuevo (v1) | — |
| `historias/HU-ATC-044-trabajar-desde-una-bandeja-unica-ordenada-por-urgencia.md` | Dev 3 (Michel) | Nuevo (v1) | — |
| `historias/HU-ATC-045-marcar-un-ticket-critico-con-el-rayo-de-prioridad.md` | Dev 3 (Michel) | Nuevo (v1) | — |
| `historias/HU-ATC-046-reasignar-automaticamente-al-gestor-con-menos-carga.md` | Dev 3 (Michel) | Nuevo (v1) | — |
| `historias/HU-ATC-047-consultar-la-guia-de-solucion-del-tipo-de-ticket.md` | Dev 3 (Michel) | Nuevo (v1) | — |
| `historias/HU-ATC-048-recibir-retroalimentacion-de-ia-mientras-atiendo-y-cierro.md` | Dev 3 (Michel) | Nuevo (v1) | — |
| `historias/HU-ATC-049-buscar-al-cliente-y-llamarlo-desde-su-ficha.md` | Dev 4 (Daniel) | Nuevo (v1) | — |
| `historias/HU-ATC-050-ver-la-consulta-360-del-cliente-dentro-del-ticket.md` | Dev 4 (Daniel) | Nuevo (v1) | — |
| `historias/HU-ATC-051-continuar-la-atencion-cuando-la-consulta-del-cliente-falla.md` | Dev 4 (Daniel) | Nuevo (v1) | — |
| `historias/HU-ATC-052-consultar-datos-especificos-con-el-motor-de-jose.md` | Dev 4 (Daniel) | Nuevo (v1) | — |
| `historias/HU-ATC-053-buscar-documentos-del-cliente-por-significado.md` | Dev 4 (Daniel) | Nuevo (v1) | — |
| `historias/HU-ATC-054-ver-mi-avance-diario-y-el-de-mi-equipo.md` | Dev 3 (Michel) | Nuevo (v1) | — |
| `historias/HU-ATC-055-recibir-un-correo-al-asignarme-un-ticket-con-copia-a-mi.md` | Dev 3 (Michel) | Nuevo (v1) | — |
| `historias/HU-ATC-056-abrir-el-caso-de-resolucion-por-3-meses-impagos.md` | Dev 4 (Daniel) | Nuevo (v1) | — |
| `historias/HU-ATC-057-enviar-al-cliente-la-alerta-de-cancelacion-en-paralelo.md` | Dev 4 (Daniel) | Nuevo (v1) | — |
| `historias/HU-ATC-058-enviar-la-carta-de-alerta-al-responsable-del-proyecto-y-su.md` | Dev 4 (Daniel) | Nuevo (v1) | — |
| `historias/HU-ATC-059-registrar-el-ingreso-de-una-persona-al-proyecto.md` | Dev 4 (Daniel) | Nuevo (v1) | — |
| `historias/HU-ATC-060-reservar-un-cupo-en-el-bus-del-entrega-fest.md` | Dev 4 (Daniel) | Nuevo (v1) | — |
| `historias/HU-ATC-064-registrar-y-consultar-mis-tickets-en-mi-portal.md` | Dev 4 (Daniel) | Nuevo (v1) | — |
| `historias/HU-ATC-065-ver-la-trazabilidad-de-mi-ticket.md` | Dev 4 (Daniel) | Nuevo (v1) | — |
| `historias/HU-ATC-066-responder-adjuntar-y-confirmar-la-solucion-de-mi-ticket.md` | Dev 4 (Daniel) | Nuevo (v1) | — |
| `historias/HU-ATC-067-ver-el-proceso-de-atencion-en-un-visor-3d-operacion-en-vivo.md` | Dev 3 (Michel) | Nuevo (v1) | — |
