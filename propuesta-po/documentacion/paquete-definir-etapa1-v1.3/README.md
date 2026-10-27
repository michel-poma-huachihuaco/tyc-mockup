# Paquete Definir · Etapa 1 (v1.3)

Borrador del paquete Definir completo de la Etapa 1 en el formato del SDK: 159 documentos (los que cuenta `aybar paquete validar`; 158 llevan la marca «Generado por IA»), 7 diagramas Mermaid, el contrato OpenAPI y 11 archivos de tareas (308 tareas, 255 h: 227 h de las 57 HU de la Etapa 1 y 28 h técnicas de DT-02), más el desglose de las 5 HU que salen de la Etapa 1 en `roadmap/alcance-diferido.md`. **Nada está aprobado**: ni los documentos, ni los DoR, ni los gates G0 a G4.

| Carpeta | Qué hay | Base |
|---|---|---|
| `epicas/`, `features/`, `historias/`, `dor/` | 11 épicas, 23 funcionalidades, 62 historias y 23 DoR (índice abajo). En la Etapa 1, tras P-025: 10 épicas, 22 funcionalidades y 57 historias | Documentos del PO v1.3, sin cambiar su contenido. El 26-oct cada historia sumó, fuera del texto del PO, el bloque «Responsable / Depende de / La necesitan» (54 dependencias entre historias, trazadas al PO), y cada DoR, las DEP de sus historias |
| [`analisis/`](analisis/) | BRD, ficha de intake, cobertura de requisitos, `decisiones.md` (fuente de verdad del paquete) y el proceso de atención de prospectos (C-06; tipo de ticket de la Etapa 1, sin horas) | Versión de Nexora (Jesús y Daniel), llevada a la v1.3 y a las decisiones del Líder Técnico |
| [`roadmap/`](roadmap/) | RMP-001, análisis de dependencias (en la Etapa 1: 49 entre historias, 16 entre funcionalidades, 4 olas del PO (5 en `aybar paquete plan`) y ruta crítica de 34 h), dependencias y olas (Mermaid) | Versión de Nexora (Jesús), con la flecha EP-09→EP-06 del Gantt del PLT-01 y el bloque «Depende de» de las historias |
| [`adr/`](adr/) | 14 ADR: ADR-001…011 son las ADR-01…11 del PO; 012 stack, 013 outbox y 014 plataforma las propone el equipo | Versión de Nexora (Jesús), con las decisiones DT-01 a DT-10 del Líder Técnico (22-oct), sus revisiones del 26-oct y las decisiones del equipo del 26-oct. Los conflictos con el PO quedan anotados |
| [`arquitectura/`](arquitectura/) | OpenAPI (69 operaciones, 63 en la Etapa 1), C4, módulos, seguridad, roles y permisos, costo cloud (USD 2.592,53 al mes con PRE), migración y reversión, operaciones y trazabilidad por historia | Versión de Nexora (Jesús), con los esquemas del OpenAPI completados desde el PO y el Excel |
| [`datos/`](datos/) | Registro de tablas (C-11, nuevo), modelo entidad-relación, diccionario, estados, linaje y acta F4 (lista para la firma del Data Chief) | Versión de Nexora (Jesús), con lo que el PO, el Excel y el modelo v7 ya definen |
| [`backlog/tareas/`](backlog/tareas/) | 308 tareas en 11 archivos (uno por épica), 255 h en la Etapa 1: 227 h de historias (55, 60, 55 y 57 por desarrollador) y 28 h técnicas de DT-02 (DT02-T01 a T06, en `EP-ATC-01.json`): 64, 64, 64 y 63 h por desarrollador. Las 5 HU fuera de la Etapa 1 tienen una tarea de 0 h aquí y su desglose (24 tareas, 16 h) en `roadmap/alcance-diferido.md` | Versión de Nexora (Daniel), rehecha con la v1.3. `depende_de` recoge las dependencias del PO (49 en la Etapa 1), ninguna tarea de la Etapa 1 depende de una diferida; las 28 h técnicas tienen fechas en la iteración 1 y las primeras lecturas esperan al proyector, así que `aybar paquete plan` da 5 olas en la Etapa 1 (4 en el roadmap del PO) |
| [`gates/AYB-0001/`](gates/AYB-0001/) | G0, G1, G2, G3 y G4 en borrador | Versión de Nexora y de `main`, llevada a la v1.3. G2 es nuevo |

**Qué ya está decidido.** El Líder Técnico (Jose Jara) fijó el 22-oct las decisiones DT-01 a DT-10, registradas en [`analisis/decisiones.md`](analisis/decisiones.md):
- el stack (D-001 y D-002, cerradas por DT-01): Java 21 con Spring Boot y Angular del SDK Aybar 0.7.1, con CQRS (DT-02): PostgreSQL para escribir, API de MongoDB para leer y Kafka con outbox;
- la clave foránea del ticket a `PARTY` frente a la ADR-03 del PO (P-021, D-003 y D-006, cerradas por DT-06): una sola base del modelo v7, con FK físicas, y `PARTY` es la fuente viva del cliente;
- la nube y la plataforma (P-001, cerrada por DT-07): Azure; el emisor de tokens es Control de acceso (DT-05), los jobs usan ShedLock (DT-08) y las llamadas entre servicios, `client_credentials` (DT-10).

Que estén decididas no las aprueba: los ADR que las recogen quedan listos para la firma del Líder Técnico, y los documentos del PO no se editan: las diferencias están listadas en ED-19 (P-027). La D-12 de la rama de Daniel no se aplica; HU-048 y HU-053 salen de la Etapa 1 por P-025, no por D-12 (P-020, ED-17).

**Qué decidió el equipo el 26-oct** (Brayan Hurtado; propuesto al Líder Técnico en este envío). Nadie más responde, así que el equipo cerró cada punto con su fundamento y su evidencia en [`analisis/decisiones.md`](analisis/decisiones.md) (ED-01 a ED-28), sin cambiar ninguna DT:
- identidad y permisos: el `PartyID` sale del vínculo de la cuenta en la base única (ED-01); se autoriza por rol del token (ED-02); gestores y líderes con datos propios de ATC y el rol `ATC_SUPERVISOR`, sin copiar usuarios ni roles (ED-03); `MAE_AREA` es solo la cola (ED-04); la audiencia es `aybar-atc` (ED-06); el catálogo se entrega en los lotes del ADR-021 (ED-07);
- cliente: ATC no crea `PARTY`; el interesado se registra «sin cliente vinculado», con sus datos mínimos (ED-05);
- Control de acceso (DEP-16): riesgo aceptado con mitigación, R-11 del roadmap en local, DEV y QA, y criterio de corte de la UAT en PRE, R-12 (ED-08); el permiso de lectura sobre `IDN_USER_ACCOUNT` se pide a su dueño (ED-01);
- prospectos (decisión del coordinador): entra en la Etapa 1 el tipo de ticket «Validación de identidad (prospecto)» con 4 subtipos, en el área ATC, sin HU ni horas nuevas; se resuelve en la consola de Control de acceso (ED-09);
- Libro de Reclamaciones: plazo de 15 días hábiles improrrogables (Ley 31435); la prórroga de HU-013 queda deshabilitada por parámetro, con una nota en la historia (ED-28);
- datos: dueño de migración (ED-11), tablas del flujo (ED-15), tipos y largos (ED-16) y catálogo del piloto (ED-14); el acta F4 queda lista para la firma del Data Chief (ED-23);
- evidencia: 2 años de retención (art. 12 del Reglamento del Libro de Reclamaciones), retención legal mientras dure una apelación, un caso ante INDECOPI o de la Mesa SGD, inmutabilidad bloqueada en PRE y producción y hash encadenado (ED-13);
- costo: Brazil South, USD 2.592,53 al mes (ED-12); proveedor de IA, Azure OpenAI Service (ED-17), decidido y sin consumo en la Etapa 1 (HU-048 y HU-053 salen por P-025);
- horas (P-025, opción A): las 28 h nuevas de DT-02 (outbox 6, publicador 6, proyector 10 y bus 6) entran como tareas técnicas de la fundación y el equipo activa el recorte que el PO previó en su R-01 y salen de la Etapa 1 HU-ATC-037, 038 y 039 (EP-ATC-08 y FT-ATC-15 completas), 048 y 053, 16 h; el PO conserva la decisión de revertirlo. Etapa 1: 57 HU y 227 h de historias + 28 h técnicas = 255 h (Brayan 64, Jesús 64, Michel 64, Daniel 63). **Sobrecosto real: 7 h** sobre 252 h de capacidad (con las 4 h de la reestimación de ADR-009), con dueño el PO (P-025, punto 7);
- las 58 preguntas de las historias y las 23 de las funcionalidades tienen su decisión (ED-26); M0 queda «requiere dispensa (solicitada)» (ED-25).

**Qué sigue abierto:** nada en el registro. **P-025** y las respuestas a las preguntas del PO (ED-26) son propuestas del equipo que el PO acepta o cambia al firmar G4. Las firmas no son pendientes del paquete: cada documento queda listo para la firma de su rol.

Las correcciones que se le proponen al Excel del PO están en [`../correcciones-excel-v1.3.md`](../correcciones-excel-v1.3.md).

**De dónde sale.** Épicas, funcionalidades, historias y DoR se transcribieron de los documentos del PO v1.3 (`../po-v1.3/`) sin cambiar su contenido:
«Como / quiero / para», criterios de aceptación, reglas, horas, fechas, dependencias y riesgos. Solo se omitieron las frases que remiten
a la Etapa 2. Cada documento termina con «Generado por IA … — Revisado por: (pendiente)».

**Estado.** Todo está en borrador y nada está aprobado. Al 26-oct (19 h), Nexora PJ-06 tiene versiones pendientes de todo el paquete, ninguna aprobada (por ejemplo, `decisiones.md` v7, el backlog v4, anterior a P-025, y G3 y G4 v3). Las versiones locales de la segunda revisión del Líder Técnico están **por publicar**; `roadmap/alcance-diferido.md` es nuevo (un solo archivo, con el desglose de las tareas de EP-ATC-08, 09 y 10 que salen). Se publican con el perfil desarrollador y `dry_run` primero (`PLAN-NEXORA.md`), y la versión y la huella de cada evidencia se fijan en G3 y G4 al publicar.

**Duplicados en Nexora** (`gates/G0.md`, `G1.md`, `G3.md` y `G4.md` sueltos e `historias/HU-DOC-001 …md.md`): el equipo publica de cada uno una versión «RETIRADO» con id distinto, que quita los errores de id duplicado; el borrado definitivo lo hace el PO o el administrador de Nexora, y los 6 avisos de ruta solo se van al borrar (ED-21, P-029). Al 26-oct (19 h) los 5 siguen en su v1.

Lo que solo hace una persona no es parte del borrador: el «Revisado por» de cada documento (las 14 ADR ya lo tienen; los demás, quien los revise), el `revisado_por` de las tareas (el dueño de cada épica) y las firmas del PO, el Líder Técnico, el project manager y el Data Chief.

**Validación** (`aybar paquete validar propuesta-po/documentacion/paquete-definir-etapa1-v1.3`, 26-oct): **0 errores y 0 advertencias**.
Son 159 documentos y 308 tareas, con 255 h estimadas (227 h de historias de la Etapa 1, 28 h técnicas y 5 tareas de 0 h de las HU fuera), 0 sin estimar y 0 sin responsable. `aybar paquete plan` da, sin ciclos, 5 olas en la Etapa 1 (el PO tiene 4: las primeras lecturas esperan al proyector de DT-02, A-15 de `roadmap/analisis-dependencias.md`) y FT-15 (fuera de la Etapa 1) sola en la ola 5 con 0 h. Ninguna funcionalidad está lista para construir (0 de 23), porque los DoR y los gates esperan
su firma.

**Para leerlo** sin instalar nada, abre `explorador.html` en el navegador. Lo genera `aybar paquete explorador` del SDK; tras esta vuelta hay que regenerarlo antes de publicar.

## [EP-ATC-01 · Núcleo de tickets omnicanal](epicas/EP-ATC-01-nucleo-de-tickets-omnicanal.md)

Dev 1 (Brayan) · 22 h · iteración 1 · Debe · además, la fundación técnica de DT-02 (28 h entre los 4 desarrolladores, P-025)

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

Dev 1 (Brayan) · 21 h · iteración 1 y 2 · Debe

| Funcionalidad | DoR | Historias |
|---|---|---|
| [FT-ATC-05 Libro de Reclamaciones](features/FT-ATC-05-libro-de-reclamaciones.md) | [DoR](dor/DOR-FT-ATC-05-libro-de-reclamaciones.md) | [012](historias/HU-ATC-012-registrar-el-asiento-del-libro-de-reclamaciones.md) · [013](historias/HU-ATC-013-calcular-el-plazo-legal-y-gestionar-la-prorroga-unica.md) · [014](historias/HU-ATC-014-registrar-la-respuesta-formal-con-cargo.md) · [015](historias/HU-ATC-015-vigilar-el-plazo-legal-y-detectar-reclamos-huerfanos.md) |
| [FT-ATC-06 Apelaciones internas e INDECOPI](features/FT-ATC-06-apelaciones-internas-e-indecopi.md) | [DoR](dor/DOR-FT-ATC-06-apelaciones-internas-e-indecopi.md) | [016](historias/HU-ATC-016-dar-seguimiento-a-apelaciones-internas-y-ante-indecopi.md) |

## [EP-ATC-04 · Gate legal Eje 3 y Mesa de Casos sensibles](epicas/EP-ATC-04-gate-legal-eje-3-y-mesa-de-casos-sensibles.md)

Dev 2 (Jesús) · 32 h · iteración 1 y 2 · Debe

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

Dev 1 (Brayan) · 6 h · iteración 2 · Podría · **fuera de la Etapa 1 (P-025)**

| Funcionalidad | DoR | Historias |
|---|---|---|
| [FT-ATC-15 EntregaFest: contención en vivo](features/FT-ATC-15-entregafest-contencion-en-vivo.md) (fuera de la Etapa 1) | [DoR](dor/DOR-FT-ATC-15-entregafest-contencion-en-vivo.md) | [037](historias/HU-ATC-037-registrar-el-riesgo-verbal-y-la-secuencia-de-frases-ancla.md) · [038](historias/HU-ATC-038-derivar-de-inmediato-a-la-estacion-4-sin-debate.md) · [039](historias/HU-ATC-039-registrar-el-caso-con-la-etiqueta-estandar.md) |

## [EP-ATC-09 · Bandeja orquestadora y asistencia al gestor](epicas/EP-ATC-09-bandeja-orquestadora-y-asistencia-al-gestor.md)

Dev 3 (Michel) · 44 h (39 h en la Etapa 1: HU-048 fuera, P-025) · iteración 1 y 2 · Debe

| Funcionalidad | DoR | Historias |
|---|---|---|
| [FT-ATC-18 Bandeja orquestadora y flujos por área](features/FT-ATC-18-bandeja-orquestadora-y-flujos-por-area.md) | [DoR](dor/DOR-FT-ATC-18-bandeja-orquestadora-y-flujos-por-area.md) | [043](historias/HU-ATC-043-configurar-el-flujo-de-trabajo-de-un-tipo-de-ticket-por-area.md) · [044](historias/HU-ATC-044-trabajar-desde-una-bandeja-unica-ordenada-por-urgencia.md) · [045](historias/HU-ATC-045-marcar-un-ticket-critico-con-el-rayo-de-prioridad.md) · [046](historias/HU-ATC-046-reasignar-automaticamente-al-gestor-con-menos-carga.md) |
| [FT-ATC-25 Visor del proceso 3D (operación en vivo)](features/FT-ATC-25-visor-del-proceso-3d-operacion-en-vivo.md) | [DoR](dor/DOR-FT-ATC-25-visor-del-proceso-3d-operacion-en-vivo.md) | [067](historias/HU-ATC-067-ver-el-proceso-de-atencion-en-un-visor-3d-operacion-en-vivo.md) |
| [FT-ATC-19 Asistencia al gestor: guía e IA](features/FT-ATC-19-asistencia-al-gestor-guia-e-ia.md) | [DoR](dor/DOR-FT-ATC-19-asistencia-al-gestor-guia-e-ia.md) | [047](historias/HU-ATC-047-consultar-la-guia-de-solucion-del-tipo-de-ticket.md) · [048](historias/HU-ATC-048-recibir-retroalimentacion-de-ia-mientras-atiendo-y-cierro.md) (fuera de la Etapa 1) |
| [FT-ATC-21 Productividad y notificaciones del gestor](features/FT-ATC-21-productividad-y-notificaciones-del-gestor.md) | [DoR](dor/DOR-FT-ATC-21-productividad-y-notificaciones-del-gestor.md) | [054](historias/HU-ATC-054-ver-mi-avance-diario-y-el-de-mi-equipo.md) · [055](historias/HU-ATC-055-recibir-un-correo-al-asignarme-un-ticket-con-copia-a-mi.md) |

## [EP-ATC-10 · Consulta 360 e integraciones operativas](epicas/EP-ATC-10-consulta-360-e-integraciones-operativas.md)

Dev 4 (Daniel) · 36 h (31 h en la Etapa 1: HU-053 fuera, P-025) · iteración 1 y 2 · Debe

| Funcionalidad | DoR | Historias |
|---|---|---|
| [FT-ATC-20 Búsqueda y consulta 360 del cliente](features/FT-ATC-20-busqueda-y-consulta-360-del-cliente.md) | [DoR](dor/DOR-FT-ATC-20-busqueda-y-consulta-360-del-cliente.md) | [049](historias/HU-ATC-049-buscar-al-cliente-y-llamarlo-desde-su-ficha.md) · [050](historias/HU-ATC-050-ver-la-consulta-360-del-cliente-dentro-del-ticket.md) · [051](historias/HU-ATC-051-continuar-la-atencion-cuando-la-consulta-del-cliente-falla.md) · [052](historias/HU-ATC-052-consultar-datos-especificos-con-el-motor-de-jose.md) · [053](historias/HU-ATC-053-buscar-documentos-del-cliente-por-significado.md) (fuera de la Etapa 1) |
| [FT-ATC-17 Integración con la plataforma del call center](features/FT-ATC-17-integracion-con-la-plataforma-del-call-center.md) | [DoR](dor/DOR-FT-ATC-17-integracion-con-la-plataforma-del-call-center.md) | [042](historias/HU-ATC-042-atender-la-llamada-con-la-ficha-del-cliente-y-registrarla-en.md) |
| [FT-ATC-16 Integración con Legal y prevención de denuncias](features/FT-ATC-16-integracion-con-legal-y-prevencion-de-denuncias.md) | [DoR](dor/DOR-FT-ATC-16-integracion-con-legal-y-prevencion-de-denuncias.md) | [040](historias/HU-ATC-040-sincronizar-con-legal-los-tickets-derivados-a-eje-3.md) · [041](historias/HU-ATC-041-priorizar-los-reclamos-con-riesgo-de-denuncia-por-su.md) |

## [EP-ATC-11 · Resolución por morosidad y formularios simples](epicas/EP-ATC-11-resolucion-por-morosidad-y-formularios-simples.md)

Dev 4 (Daniel) · 17 h · iteración 2 · Debe

| Funcionalidad | DoR | Historias |
|---|---|---|
| [FT-ATC-22 Resolución de contrato por morosidad](features/FT-ATC-22-resolucion-de-contrato-por-morosidad.md) | [DoR](dor/DOR-FT-ATC-22-resolucion-de-contrato-por-morosidad.md) | [056](historias/HU-ATC-056-abrir-el-caso-de-resolucion-por-3-meses-impagos.md) · [057](historias/HU-ATC-057-enviar-al-cliente-la-alerta-de-cancelacion-en-paralelo.md) · [058](historias/HU-ATC-058-enviar-la-carta-de-alerta-al-responsable-del-proyecto-y-su.md) |
| [FT-ATC-23 Formularios simples: ingreso al proyecto y Entrega Fest](features/FT-ATC-23-formularios-simples-ingreso-al-proyecto-y-entrega-fest.md) | [DoR](dor/DOR-FT-ATC-23-formularios-simples-ingreso-al-proyecto-y-entrega-fest.md) | [059](historias/HU-ATC-059-registrar-el-ingreso-de-una-persona-al-proyecto.md) · [060](historias/HU-ATC-060-reservar-un-cupo-en-el-bus-del-entrega-fest.md) |

Actualizado el 26-oct-2026 por Brayan Hurtado con IA (Claude) a partir de las decisiones del equipo del 26-oct (`analisis/decisiones.md` v0.7): «Qué decidió el equipo» y P-025 como única pendiente. — Revisado por: (pendiente)

Actualizado el 26-oct-2026 por Brayan Hurtado con IA (Claude): P-025 decidida por el equipo (`analisis/decisiones.md` v0.8): no queda nada abierto; alcance de la Etapa 1 (57 HU, 227 h, 10 épicas y 22 funcionalidades, más 28 h técnicas), backlog, validación y plan. — Revisado por: (pendiente)

Historial: 1.3.1 · 2026-10-26 · Brayan Hurtado, con IA · Cierre de P-025: «Qué sigue abierto» pasa a «nada»; cifras de la Etapa 1 (57 HU, 227 h + 28 h técnicas, 308 tareas, 4 olas); EP-ATC-08, FT-ATC-15, HU-048 y HU-053 marcadas fuera de la Etapa 1 en el índice; `roadmap/alcance-diferido.md` nuevo. — Revisado por: (pendiente)

Historial: 1.3.2 · 2026-10-26 · Brayan Hurtado, con IA · Segunda revisión del Líder Técnico: 159 documentos; plazo del Libro sin prórroga (ED-28); tipo de ticket de prospectos en la Etapa 1 (ED-09); R-12 y permiso sobre `IDN_USER_ACCOUNT`; P-025 como R-01 del PO con sobrecosto real de 7 h; versiones «RETIRADO» para los duplicados de Nexora; citas sin versión. — Revisado por: (pendiente)
