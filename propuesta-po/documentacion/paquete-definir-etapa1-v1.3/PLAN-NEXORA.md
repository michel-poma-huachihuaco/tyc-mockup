# Publicación en Nexora · paquete Definir de la Etapa 1 (v1.3)

**Publicado el 20-oct-2026 por Brayan** (Dev 1), con su luz verde, en el proyecto PJ-06, apartado «Tiketes». Antes se hizo la
prueba sin publicar (`dry_run`). Nexora aceptó los 71 documentos sin conflictos ni bloqueos.

| Carpeta | Versión nueva | Documento nuevo | Ya estaba igual | Quién aprueba (según Nexora) |
|---|---|---|---|---|
| `epicas/` | 3 | 8 | 0 | PO (`product_owner`) |
| `features/` | 5 | 18 | 0 | PO (`product_owner`) |
| `historias/` | 14 | 0 | 48 | PO (`product_owner`) |
| `dor/` | 5 | 18 | 0 | Líder técnico y project manager (`tech_lead` + `project_manager`; `data_chief` opcional) |
| **Total** | **27** | **44** | **48** | |

**Verificación:** después de publicar, una nueva prueba con los 119 archivos dio **119 «sin cambios»**. Nexora tiene
exactamente este paquete, con las mismas huellas sha256.

- **Todo queda pendiente de aprobación.** En Nexora no hay nada aprobado: lo firman los roles de la tabla. La IA nunca aprueba,
  y Brayan no puede aprobar lo que él mismo publicó.
- **En la auditoría de Nexora**, las 71 versiones nuevas quedan a nombre de Brayan. El responsable de cada épica, funcionalidad,
  historia y DoR sigue siendo el que dice el documento (el PLT-01).

| Responsable | Versión nueva | Documento nuevo | Ya estaba igual |
|---|---|---|---|
| Dev 1 (Brayan) | 27 | 3 | 3 |
| Dev 2 (Jesús) | 0 | 12 | 16 |
| Dev 3 (Michel) | 0 | 14 | 13 |
| Dev 4 (Daniel) | 0 | 15 | 16 |

## Publicado el 21-oct: el resto del paquete en la v1.3

El 21-oct se llevaron a la v1.3 las demás carpetas del paquete, partiendo de la última versión de Nexora, y Brayan las publicó con su
luz verde, por encargo del PO. Antes se hizo el `dry_run` y se comprobó que nadie había subido versiones nuevas desde la descarga.

| Carpeta | Antes en Nexora | Publicado |
|---|---|---|
| `analisis/` | 4, de Jesús y Daniel (v1.2) | 4 versiones nuevas |
| `roadmap/` | 4, de Jesús | 4 versiones nuevas |
| `adr/` | 14, de Jesús | 14 versiones nuevas, sin cambiar decisiones (conflictos con el PO anotados) |
| `arquitectura/` | 10, de Jesús | 5 versiones nuevas; 5 iguales |
| `datos/` | 7, de Jesús | 6 versiones nuevas; 1 igual |
| `backlog/tareas/` | 10, de Daniel (v1.2) | 10 versiones nuevas y 1 nueva (EP-ATC-06) |
| `gates/AYB-0001/` | — | 5 nuevos (G0 a G4, con el G2 nuevo) |
| **Total** | | **43 versiones nuevas y 6 documentos nuevos** |

**Verificación:** una nueva prueba con los 174 archivos del paquete (155 documentos, 11 archivos de tareas y 5 gates más el resto) da
**174 «sin cambios»**: Nexora tiene exactamente lo que tiene esta carpeta. Todo queda pendiente de aprobación. En la auditoría de
Nexora, las versiones nuevas de documentos de Jesús y Daniel quedan a nombre de Brayan.

Siguen en Nexora los 4 gates v1.2 en `gates/` (sin carpeta de ticket) y el duplicado de la HU-001: los retira el PO o el admin.

## Publicado el 26-oct: lo resuelto de la revisión del Líder Técnico

Brayan publicó 31 versiones nuevas, pendientes de aprobación: `analisis/decisiones.md` v0.4 (P-033 a P-042, las preguntas abiertas
a Control de acceso y al Líder Técnico, y la respuesta sobre las reglas), los 11 archivos de `backlog/tareas/` (321 tareas, 243 h) y
19 DoR con la nota de la revisión. Antes se comprobó que nadie los había cambiado en Nexora. **No se subieron los gates G3 y G4**:
Jesús había publicado versiones nuevas y se conservan las suyas, que también se trajeron a esta carpeta junto con su BRD v3 y su G2 v3.

Copia completa de Nexora (180 documentos, sellada con `aybar paquete sellar`): `/Users/lorem/Documents/aybar-atiende/docs-atiende/`.
Al sellarla (26-oct, 10:17) coincidía con esta carpeta, salvo lo que sobra en Nexora: la HU-001 duplicada y los 4 gates sueltos en
`gates/`, que dan 5 errores de identificador duplicado en `aybar paquete validar`. El índice de PJ-06 leído el 26-oct por la tarde da las
mismas versiones y huellas que ese sello.

## Por publicar (26-oct, tarde)

Las correcciones del 26-oct por la tarde (revisiones del Líder Técnico y de coherencia, y el barrido final) son **locales**: 131 archivos
del paquete difieren de Nexora y 2 son nuevos (`analisis/proceso-atencion-prospectos.md` y `datos/registro-de-tablas.md`). Solo 44 siguen
iguales: las 11 épicas, las 23 funcionalidades, 7 DoR en 1.3, la ficha de intake, la cobertura de requisitos y `estados-ticket.mmd`. Se
publican como versiones nuevas, pendientes de aprobación, con el `dry_run` primero y la luz verde de Brayan; nadie las aprueba al publicarlas.
G3 y G4 suben como versión nueva de los de Jesús (v2 en Nexora), con su texto.

## Publicado el 26-oct por la tarde: cierre de la revisión del Líder Técnico

Brayan publicó **131 versiones nuevas y 2 documentos nuevos** (`analisis/proceso-atencion-prospectos.md` y
`datos/registro-de-tablas.md`), todos pendientes de aprobación. Antes se hizo el `dry_run` y se comprobó que nadie había publicado
desde la exportación de la mañana. Incluye las 62 HU con responsable y dependencias, las 14 ADR, seguridad, catálogo de roles, OpenAPI,
diagramas, datos, costo, migración, decisiones 0.6, roadmap, DoR, backlog y los gates G0 a G4 de AYB-0001, después de dos revisiones
independientes con los criterios del Líder Técnico.

Después se volvió a traer Nexora a `/Users/lorem/Documents/aybar-atiende/docs-atiende/`: **182 documentos**, que son los 177 de esta
carpeta, idénticos, más los 5 sobrantes de Nexora (la HU-001 duplicada y los 4 gates sueltos de la v1.2).

Faltan los pasos de personas: firmar «Revisado por», enviar los correos de `../correos-revision-tl-26-oct.md` y crear los ítems con
`../nexora-items/carga-items-pj06.csv`.

## Qué queda pendiente en Nexora (no lo resuelve el perfil desarrollador)

Estado al 26-oct (la lista del 20-oct decía que faltaban G2, G3 y G4 y que el resto de Jesús no se había tocado: ya no es así).

- **Aprobar** las 62 historias, las 11 épicas y las 23 funcionalidades (el PO), los 23 DoR (el líder técnico y el project manager),
  el análisis, el roadmap y el backlog (el PO), los ADR, la arquitectura y los datos (el líder técnico; el acta F4 la firma el Data
  Chief) y los gates (quien aprueba cada uno).
- **Retirar el duplicado de Daniel**, `historias/HU-DOC-001 HU-ATC-001-registrar-tickets-multicanal-tipificados.md.md` (v1
  pendiente). Lo puede rechazar el PO.
- **Ítems y gates:** el proyecto tiene 0 ítems (ni ticket ni backlog; la carga está en `../nexora-items/`). Los 5 gates de
  `gates/AYB-0001/` están en Nexora, pendientes; sobran los 4 sueltos de `gates/` (P-029).

El 20-oct solo se subieron las carpetas `epicas/`, `features/`, `historias/` y `dor/`; el resto, el 21 y el 26-oct. `README.md`,
`explorador.html`, este documento y `NEXORA-BRAYAN-v1.3.md` son material de consulta y no van a Nexora.

## Documento por documento

| Documento | Responsable | Nexora |
|---|---|---|
| `dor/DOR-FT-ATC-01-registro-multicanal-y-tipificacion.md` | Dev 1 (Brayan) | Publicado: v2 pendiente (sustituye a la v1) |
| `dor/DOR-FT-ATC-02-ciclo-de-vida-interacciones-e-hitos.md` | Dev 1 (Brayan) | Publicado: v2 pendiente (sustituye a la v1) |
| `dor/DOR-FT-ATC-03-derivacion-reasignacion-y-casillero.md` | Dev 2 (Jesús) | Publicado: v1 pendiente (nuevo) |
| `dor/DOR-FT-ATC-04-motor-sla-y-alertas.md` | Dev 2 (Jesús) | Publicado: v1 pendiente (nuevo) |
| `dor/DOR-FT-ATC-05-libro-de-reclamaciones.md` | Dev 1 (Brayan) | Publicado: v2 pendiente (sustituye a la v1) |
| `dor/DOR-FT-ATC-06-apelaciones-internas-e-indecopi.md` | Dev 1 (Brayan) | Publicado: v2 pendiente (sustituye a la v1) |
| `dor/DOR-FT-ATC-07-gate-de-derivacion-a-eje-3-y-handoff.md` | Dev 2 (Jesús) | Publicado: v1 pendiente (nuevo) |
| `dor/DOR-FT-ATC-08-mesa-sgd-recepcion-activacion-y-riesgo.md` | Dev 2 (Jesús) | Publicado: v1 pendiente (nuevo) |
| `dor/DOR-FT-ATC-09-escalamiento-vinculacion-y-cierre-tipificado.md` | Dev 2 (Jesús) | Publicado: v1 pendiente (nuevo) |
| `dor/DOR-FT-ATC-10-reclamos-de-garantia-postventa.md` | Dev 1 (Brayan) | Publicado: v2 pendiente (sustituye a la v1) |
| `dor/DOR-FT-ATC-13-encuesta-post-atencion.md` | Dev 3 (Michel) | Publicado: v1 pendiente (nuevo) |
| `dor/DOR-FT-ATC-14-torre-de-control-cx.md` | Dev 3 (Michel) | Publicado: v1 pendiente (nuevo) |
| `dor/DOR-FT-ATC-15-entregafest-contencion-en-vivo.md` | Dev 1 (Brayan) | Publicado: v1 pendiente (nuevo) |
| `dor/DOR-FT-ATC-16-integracion-con-legal-y-prevencion-de-denuncias.md` | Dev 4 (Daniel) | Publicado: v1 pendiente (nuevo) |
| `dor/DOR-FT-ATC-17-integracion-con-la-plataforma-del-call-center.md` | Dev 4 (Daniel) | Publicado: v1 pendiente (nuevo) |
| `dor/DOR-FT-ATC-18-bandeja-orquestadora-y-flujos-por-area.md` | Dev 3 (Michel) | Publicado: v1 pendiente (nuevo) |
| `dor/DOR-FT-ATC-19-asistencia-al-gestor-guia-e-ia.md` | Dev 3 (Michel) | Publicado: v1 pendiente (nuevo) |
| `dor/DOR-FT-ATC-20-busqueda-y-consulta-360-del-cliente.md` | Dev 4 (Daniel) | Publicado: v1 pendiente (nuevo) |
| `dor/DOR-FT-ATC-21-productividad-y-notificaciones-del-gestor.md` | Dev 3 (Michel) | Publicado: v1 pendiente (nuevo) |
| `dor/DOR-FT-ATC-22-resolucion-de-contrato-por-morosidad.md` | Dev 4 (Daniel) | Publicado: v1 pendiente (nuevo) |
| `dor/DOR-FT-ATC-23-formularios-simples-ingreso-al-proyecto-y-entrega-fest.md` | Dev 4 (Daniel) | Publicado: v1 pendiente (nuevo) |
| `dor/DOR-FT-ATC-24-autogestion-de-tickets-del-cliente-en-mi-portal.md` | Dev 4 (Daniel) | Publicado: v1 pendiente (nuevo) |
| `dor/DOR-FT-ATC-25-visor-del-proceso-3d-operacion-en-vivo.md` | Dev 3 (Michel) | Publicado: v1 pendiente (nuevo) |
| `epicas/EP-ATC-01-nucleo-de-tickets-omnicanal.md` | Dev 1 (Brayan) | Publicado: v2 pendiente (sustituye a la v1) |
| `epicas/EP-ATC-02-enrutamiento-sla-y-alertas.md` | Dev 2 (Jesús) | Publicado: v1 pendiente (nuevo) |
| `epicas/EP-ATC-03-libro-de-reclamaciones-y-apelaciones.md` | Dev 1 (Brayan) | Publicado: v2 pendiente (sustituye a la v1) |
| `epicas/EP-ATC-04-gate-legal-eje-3-y-mesa-de-casos-sensibles.md` | Dev 2 (Jesús) | Publicado: v1 pendiente (nuevo) |
| `epicas/EP-ATC-05-postventa-reclamos-de-garantia.md` | Dev 1 (Brayan) | Publicado: v2 pendiente (sustituye a la v1) |
| `epicas/EP-ATC-06-autogestion-del-cliente-y-trazabilidad-mi-portal.md` | Dev 4 (Daniel) | Publicado: v1 pendiente (nuevo) |
| `epicas/EP-ATC-07-calidad-de-atencion-y-torre-de-control-cx.md` | Dev 3 (Michel) | Publicado: v1 pendiente (nuevo) |
| `epicas/EP-ATC-08-entregafest-contencion-y-derivacion-en-vivo.md` | Dev 1 (Brayan) | Publicado: v1 pendiente (nuevo) |
| `epicas/EP-ATC-09-bandeja-orquestadora-y-asistencia-al-gestor.md` | Dev 3 (Michel) | Publicado: v1 pendiente (nuevo) |
| `epicas/EP-ATC-10-consulta-360-e-integraciones-operativas.md` | Dev 4 (Daniel) | Publicado: v1 pendiente (nuevo) |
| `epicas/EP-ATC-11-resolucion-por-morosidad-y-formularios-simples.md` | Dev 4 (Daniel) | Publicado: v1 pendiente (nuevo) |
| `features/FT-ATC-01-registro-multicanal-y-tipificacion.md` | Dev 1 (Brayan) | Publicado: v2 pendiente (sustituye a la v1) |
| `features/FT-ATC-02-ciclo-de-vida-interacciones-e-hitos.md` | Dev 1 (Brayan) | Publicado: v2 pendiente (sustituye a la v1) |
| `features/FT-ATC-03-derivacion-reasignacion-y-casillero.md` | Dev 2 (Jesús) | Publicado: v1 pendiente (nuevo) |
| `features/FT-ATC-04-motor-sla-y-alertas.md` | Dev 2 (Jesús) | Publicado: v1 pendiente (nuevo) |
| `features/FT-ATC-05-libro-de-reclamaciones.md` | Dev 1 (Brayan) | Publicado: v2 pendiente (sustituye a la v1) |
| `features/FT-ATC-06-apelaciones-internas-e-indecopi.md` | Dev 1 (Brayan) | Publicado: v2 pendiente (sustituye a la v1) |
| `features/FT-ATC-07-gate-de-derivacion-a-eje-3-y-handoff.md` | Dev 2 (Jesús) | Publicado: v1 pendiente (nuevo) |
| `features/FT-ATC-08-mesa-sgd-recepcion-activacion-y-riesgo.md` | Dev 2 (Jesús) | Publicado: v1 pendiente (nuevo) |
| `features/FT-ATC-09-escalamiento-vinculacion-y-cierre-tipificado.md` | Dev 2 (Jesús) | Publicado: v1 pendiente (nuevo) |
| `features/FT-ATC-10-reclamos-de-garantia-postventa.md` | Dev 1 (Brayan) | Publicado: v2 pendiente (sustituye a la v1) |
| `features/FT-ATC-13-encuesta-post-atencion.md` | Dev 3 (Michel) | Publicado: v1 pendiente (nuevo) |
| `features/FT-ATC-14-torre-de-control-cx.md` | Dev 3 (Michel) | Publicado: v1 pendiente (nuevo) |
| `features/FT-ATC-15-entregafest-contencion-en-vivo.md` | Dev 1 (Brayan) | Publicado: v1 pendiente (nuevo) |
| `features/FT-ATC-16-integracion-con-legal-y-prevencion-de-denuncias.md` | Dev 4 (Daniel) | Publicado: v1 pendiente (nuevo) |
| `features/FT-ATC-17-integracion-con-la-plataforma-del-call-center.md` | Dev 4 (Daniel) | Publicado: v1 pendiente (nuevo) |
| `features/FT-ATC-18-bandeja-orquestadora-y-flujos-por-area.md` | Dev 3 (Michel) | Publicado: v1 pendiente (nuevo) |
| `features/FT-ATC-19-asistencia-al-gestor-guia-e-ia.md` | Dev 3 (Michel) | Publicado: v1 pendiente (nuevo) |
| `features/FT-ATC-20-busqueda-y-consulta-360-del-cliente.md` | Dev 4 (Daniel) | Publicado: v1 pendiente (nuevo) |
| `features/FT-ATC-21-productividad-y-notificaciones-del-gestor.md` | Dev 3 (Michel) | Publicado: v1 pendiente (nuevo) |
| `features/FT-ATC-22-resolucion-de-contrato-por-morosidad.md` | Dev 4 (Daniel) | Publicado: v1 pendiente (nuevo) |
| `features/FT-ATC-23-formularios-simples-ingreso-al-proyecto-y-entrega-fest.md` | Dev 4 (Daniel) | Publicado: v1 pendiente (nuevo) |
| `features/FT-ATC-24-autogestion-de-tickets-del-cliente-en-mi-portal.md` | Dev 4 (Daniel) | Publicado: v1 pendiente (nuevo) |
| `features/FT-ATC-25-visor-del-proceso-3d-operacion-en-vivo.md` | Dev 3 (Michel) | Publicado: v1 pendiente (nuevo) |
| `historias/HU-ATC-001-registrar-un-ticket-tipificado-desde-cualquier-canal.md` | Dev 1 (Brayan) | Publicado: v2 pendiente (sustituye a la v1) |
| `historias/HU-ATC-002-entregar-al-cliente-un-numero-de-ticket-por-razon-social.md` | Dev 1 (Brayan) | Publicado: v2 pendiente (sustituye a la v1) |
| `historias/HU-ATC-003-congelar-el-sla-del-ticket-al-abrirlo.md` | Dev 2 (Jesús) | Ya estaba igual: v1 pendiente (la subió Daniel) |
| `historias/HU-ATC-004-cambiar-el-estado-del-ticket-con-historial-inmutable.md` | Dev 1 (Brayan) | Publicado: v2 pendiente (sustituye a la v1) |
| `historias/HU-ATC-005-registrar-interacciones-visibles-o-internas-con-evidencia.md` | Dev 1 (Brayan) | Publicado: v2 pendiente (sustituye a la v1) |
| `historias/HU-ATC-006-conservar-los-hitos-temporales-probatorios.md` | Dev 1 (Brayan) | Publicado: v2 pendiente (sustituye a la v1) |
| `historias/HU-ATC-007-derivar-un-ticket-a-otra-area-con-motivo-tipificado.md` | Dev 2 (Jesús) | Ya estaba igual: v1 pendiente (la subió Daniel) |
| `historias/HU-ATC-008-reasignar-en-bloque-los-tickets-de-un-colaborador-que-cesa.md` | Dev 2 (Jesús) | Ya estaba igual: v1 pendiente (la subió Daniel) |
| `historias/HU-ATC-009-ver-mi-casillero-de-tareas-por-area-y-responsable.md` | Dev 2 (Jesús) | Ya estaba igual: v1 pendiente (la subió Daniel) |
| `historias/HU-ATC-010-recibir-una-sola-alerta-por-incumplimiento-de-sla.md` | Dev 2 (Jesús) | Ya estaba igual: v1 pendiente (la subió Daniel) |
| `historias/HU-ATC-011-reabrir-un-ticket-con-un-nuevo-compromiso-sin-borrar-el.md` | Dev 2 (Jesús) | Ya estaba igual: v1 pendiente (la subió Daniel) |
| `historias/HU-ATC-012-registrar-el-asiento-del-libro-de-reclamaciones.md` | Dev 1 (Brayan) | Publicado: v2 pendiente (sustituye a la v1) |
| `historias/HU-ATC-013-calcular-el-plazo-legal-y-gestionar-la-prorroga-unica.md` | Dev 1 (Brayan) | Publicado: v2 pendiente (sustituye a la v1) |
| `historias/HU-ATC-014-registrar-la-respuesta-formal-con-cargo.md` | Dev 1 (Brayan) | Publicado: v2 pendiente (sustituye a la v1) |
| `historias/HU-ATC-015-vigilar-el-plazo-legal-y-detectar-reclamos-huerfanos.md` | Dev 1 (Brayan) | Publicado: v2 pendiente (sustituye a la v1) |
| `historias/HU-ATC-016-dar-seguimiento-a-apelaciones-internas-y-ante-indecopi.md` | Dev 1 (Brayan) | Publicado: v2 pendiente (sustituye a la v1) |
| `historias/HU-ATC-019-disparar-la-encuesta-al-cerrar-el-ticket.md` | Dev 3 (Michel) | Ya estaba igual: v1 pendiente (la subió Daniel) |
| `historias/HU-ATC-020-registrar-un-caso-sensible-con-codigo-unico.md` | Dev 2 (Jesús) | Ya estaba igual: v1 pendiente (la subió Daniel) |
| `historias/HU-ATC-021-emitir-cargo-previo-y-cargo-de-activacion-por-separado.md` | Dev 2 (Jesús) | Ya estaba igual: v1 pendiente (la subió Daniel) |
| `historias/HU-ATC-022-clasificar-el-riesgo-del-caso-con-matriz-objetiva.md` | Dev 2 (Jesús) | Ya estaba igual: v1 pendiente (la subió Daniel) |
| `historias/HU-ATC-023-escalar-en-cadena-un-caso-que-incumple-su-sla.md` | Dev 2 (Jesús) | Ya estaba igual: v1 pendiente (la subió Daniel) |
| `historias/HU-ATC-024-validar-casos-cruzados-o-vinculados-antes-de-registrar.md` | Dev 2 (Jesús) | Ya estaba igual: v1 pendiente (la subió Daniel) |
| `historias/HU-ATC-025-cerrar-el-caso-con-estado-homologado-y-evidencia.md` | Dev 2 (Jesús) | Ya estaba igual: v1 pendiente (la subió Daniel) |
| `historias/HU-ATC-026-bloquear-la-resolucion-en-eje-1-2-ante-senal-de-conflicto.md` | Dev 2 (Jesús) | Ya estaba igual: v1 pendiente (la subió Daniel) |
| `historias/HU-ATC-027-armar-el-paquete-minimo-de-handoff-y-confirmar-su-recepcion.md` | Dev 2 (Jesús) | Ya estaba igual: v1 pendiente (la subió Daniel) |
| `historias/HU-ATC-028-registrar-la-nota-de-estado-emocional-sin-juicios-de-valor.md` | Dev 2 (Jesús) | Ya estaba igual: v1 pendiente (la subió Daniel) |
| `historias/HU-ATC-029-medir-el-cierre-end-to-end-de-la-experiencia.md` | Dev 2 (Jesús) | Ya estaba igual: v1 pendiente (la subió Daniel) |
| `historias/HU-ATC-030-monitorear-en-tiempo-real-y-corregir-antes-del.md` | Dev 3 (Michel) | Ya estaba igual: v1 pendiente (la subió Daniel) |
| `historias/HU-ATC-031-generar-el-informe-diario-y-el-quincenal.md` | Dev 3 (Michel) | Ya estaba igual: v1 pendiente (la subió Daniel) |
| `historias/HU-ATC-032-auditar-registros-paralelos-del-dato-de-cliente.md` | Dev 3 (Michel) | Ya estaba igual: v1 pendiente (la subió Daniel) |
| `historias/HU-ATC-033-registrar-un-reclamo-de-garantia-vinculado-a-la-entrega.md` | Dev 1 (Brayan) | Publicado: v2 pendiente (sustituye a la v1) |
| `historias/HU-ATC-034-validar-la-vigencia-de-la-garantia-contra-la-cobertura.md` | Dev 1 (Brayan) | Publicado: v2 pendiente (sustituye a la v1) |
| `historias/HU-ATC-035-registrar-la-inspeccion-tecnica-antes-de-resolver.md` | Dev 1 (Brayan) | Publicado: v2 pendiente (sustituye a la v1) |
| `historias/HU-ATC-036-escalar-la-garantia-a-eje-3-y-gestionar-la-adenda.md` | Dev 1 (Brayan) | Publicado: v2 pendiente (sustituye a la v1) |
| `historias/HU-ATC-037-registrar-el-riesgo-verbal-y-la-secuencia-de-frases-ancla.md` | Dev 1 (Brayan) | Ya estaba igual: v1 pendiente (la subió Daniel) |
| `historias/HU-ATC-038-derivar-de-inmediato-a-la-estacion-4-sin-debate.md` | Dev 1 (Brayan) | Ya estaba igual: v1 pendiente (la subió Daniel) |
| `historias/HU-ATC-039-registrar-el-caso-con-la-etiqueta-estandar.md` | Dev 1 (Brayan) | Ya estaba igual: v1 pendiente (la subió Daniel) |
| `historias/HU-ATC-040-sincronizar-con-legal-los-tickets-derivados-a-eje-3.md` | Dev 4 (Daniel) | Ya estaba igual: v1 pendiente (la subió Daniel) |
| `historias/HU-ATC-041-priorizar-los-reclamos-con-riesgo-de-denuncia-por-su.md` | Dev 4 (Daniel) | Ya estaba igual: v1 pendiente (la subió Daniel) |
| `historias/HU-ATC-042-atender-la-llamada-con-la-ficha-del-cliente-y-registrarla-en.md` | Dev 4 (Daniel) | Ya estaba igual: v1 pendiente (la subió Daniel) |
| `historias/HU-ATC-043-configurar-el-flujo-de-trabajo-de-un-tipo-de-ticket-por-area.md` | Dev 3 (Michel) | Ya estaba igual: v1 pendiente (la subió Daniel) |
| `historias/HU-ATC-044-trabajar-desde-una-bandeja-unica-ordenada-por-urgencia.md` | Dev 3 (Michel) | Ya estaba igual: v1 pendiente (la subió Daniel) |
| `historias/HU-ATC-045-marcar-un-ticket-critico-con-el-rayo-de-prioridad.md` | Dev 3 (Michel) | Ya estaba igual: v1 pendiente (la subió Daniel) |
| `historias/HU-ATC-046-reasignar-automaticamente-al-gestor-con-menos-carga.md` | Dev 3 (Michel) | Ya estaba igual: v1 pendiente (la subió Daniel) |
| `historias/HU-ATC-047-consultar-la-guia-de-solucion-del-tipo-de-ticket.md` | Dev 3 (Michel) | Ya estaba igual: v1 pendiente (la subió Daniel) |
| `historias/HU-ATC-048-recibir-retroalimentacion-de-ia-mientras-atiendo-y-cierro.md` | Dev 3 (Michel) | Ya estaba igual: v1 pendiente (la subió Daniel) |
| `historias/HU-ATC-049-buscar-al-cliente-y-llamarlo-desde-su-ficha.md` | Dev 4 (Daniel) | Ya estaba igual: v1 pendiente (la subió Daniel) |
| `historias/HU-ATC-050-ver-la-consulta-360-del-cliente-dentro-del-ticket.md` | Dev 4 (Daniel) | Ya estaba igual: v1 pendiente (la subió Daniel) |
| `historias/HU-ATC-051-continuar-la-atencion-cuando-la-consulta-del-cliente-falla.md` | Dev 4 (Daniel) | Ya estaba igual: v1 pendiente (la subió Daniel) |
| `historias/HU-ATC-052-consultar-datos-especificos-con-el-motor-de-jose.md` | Dev 4 (Daniel) | Ya estaba igual: v1 pendiente (la subió Daniel) |
| `historias/HU-ATC-053-buscar-documentos-del-cliente-por-significado.md` | Dev 4 (Daniel) | Ya estaba igual: v1 pendiente (la subió Daniel) |
| `historias/HU-ATC-054-ver-mi-avance-diario-y-el-de-mi-equipo.md` | Dev 3 (Michel) | Ya estaba igual: v1 pendiente (la subió Daniel) |
| `historias/HU-ATC-055-recibir-un-correo-al-asignarme-un-ticket-con-copia-a-mi.md` | Dev 3 (Michel) | Ya estaba igual: v1 pendiente (la subió Daniel) |
| `historias/HU-ATC-056-abrir-el-caso-de-resolucion-por-3-meses-impagos.md` | Dev 4 (Daniel) | Ya estaba igual: v1 pendiente (la subió Daniel) |
| `historias/HU-ATC-057-enviar-al-cliente-la-alerta-de-cancelacion-en-paralelo.md` | Dev 4 (Daniel) | Ya estaba igual: v1 pendiente (la subió Daniel) |
| `historias/HU-ATC-058-enviar-la-carta-de-alerta-al-responsable-del-proyecto-y-su.md` | Dev 4 (Daniel) | Ya estaba igual: v1 pendiente (la subió Daniel) |
| `historias/HU-ATC-059-registrar-el-ingreso-de-una-persona-al-proyecto.md` | Dev 4 (Daniel) | Ya estaba igual: v1 pendiente (la subió Daniel) |
| `historias/HU-ATC-060-reservar-un-cupo-en-el-bus-del-entrega-fest.md` | Dev 4 (Daniel) | Ya estaba igual: v1 pendiente (la subió Daniel) |
| `historias/HU-ATC-064-registrar-y-consultar-mis-tickets-en-mi-portal.md` | Dev 4 (Daniel) | Ya estaba igual: v1 pendiente (la subió Daniel) |
| `historias/HU-ATC-065-ver-la-trazabilidad-de-mi-ticket.md` | Dev 4 (Daniel) | Ya estaba igual: v1 pendiente (la subió Daniel) |
| `historias/HU-ATC-066-responder-adjuntar-y-confirmar-la-solucion-de-mi-ticket.md` | Dev 4 (Daniel) | Ya estaba igual: v1 pendiente (la subió Daniel) |
| `historias/HU-ATC-067-ver-el-proceso-de-atencion-en-un-visor-3d-operacion-en-vivo.md` | Dev 3 (Michel) | Ya estaba igual: v1 pendiente (la subió Daniel) |

Actualizado el 26-oct-2026 por Brayan Hurtado con IA (Claude): sección «Por publicar» y estado al 26-oct de lo pendiente en Nexora (gates, ítems y aprobaciones). Las secciones del 20, 21 y 26-oct (mañana) se dejan como registro. — Revisado por: (pendiente)
