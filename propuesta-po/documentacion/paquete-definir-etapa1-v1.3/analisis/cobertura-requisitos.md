---
id: "SPEC-ANALISIS-COBERTURA"
tipo: "spec"
titulo: "Cobertura de los requisitos del Excel por las historias de la Etapa 1 (plan v1.3)"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.2"
owner: "[por asignar: PO / arquitecto]"
aprobadores: []
fecha: "2026-10-21"
relacionados: ["AYB-0001"]
tags: [analisis, trazabilidad, g3]
---

# Cobertura de requisitos

Este documento cruza los requisitos del Excel `ATC_requerimientos (3).xlsx` con las **62 historias de
la Etapa 1** del PLT-04 v1.3. El Excel es la versión del 16-oct con la división por etapas, y se usan
sus hojas 02_RF_Micro, 03_RNF, 04_Trazabilidad y 05_Catalogos. Para cada requisito de la Etapa 1, el
documento dice a qué historia llega y si hay alguno que no llega. También responde a la observación
del líder técnico sobre cobertura (19-oct). Solo cuenta los requisitos de la Etapa 1. Los que el
Excel deja fuera se cuentan, pero no se listan.

## De dónde sale cada identificador

El Excel tiene varias capas, y se distinguen por color y por número:

| Capa | Identificadores | Qué es |
|---|---|---|
| Base (corrida 2026-09-09) | RF-SVC-001 a 039, RN-SVC-001 a 030, ENT-SVC-001 a 013 y 14 RNF | Los conteos de la hoja `00_Leyenda` (39 RF, 14 RNF, 30 reglas) corresponden solo a esta capa |
| Feedback de la presentación (oct-2026) | RF-SVC-040 a 055, RN-SVC-031 a 036, ENT-SVC-014 a 017 y 7 RNF más | Filas en lila: ítems agregados por el feedback |
| Feedback de la 2.ª reunión (oct-2026) | RF-SVC-056 a 060, RN-SVC-037 a 042, ENT-SVC-018 a 020 y 4 RNF más | Filas en verde: resolución por impago, formularios y Entrega Fest |
| División por etapas (16-oct) | Columnas `etapa` y `etapa_nota`, regla RN-SVC-043 y 3 RF y 1 RNF nuevos | Marca qué requisitos son de la Etapa 1. Los 3 RF y el RNF nuevos quedan fuera de la Etapa 1 |
| PLT-03/04 v1.3 | RF-SVC-064 a 067, RN-SVC-044 y 045 | Están solo en los documentos del PO v1.3, no en el Excel. El PLT-03 los da «por registrar en el Excel» |

**Consecuencia:** un identificador como RN-SVC-032, ENT-SVC-014 o RF-SVC-048 **no es inventado**: está
en el Excel, en una capa de feedback. Una revisión que compare solo con la capa base (39 RF, 14 RNF,
30 reglas) los verá como inexistentes. El PO tiene que confirmar que las capas de feedback cuentan como
origen (`decisiones.md` D-004); hasta entonces, cada cita lleva su capa. Los únicos que no están en el
Excel son RF-SVC-064 a 067 y RN-SVC-044 y 045, que vienen del PLT-03/04 v1.3. Las correcciones
propuestas al Excel van en `decisiones.md` P-022.

## Resumen

| Medida | Valor |
|---|---|
| RF del Excel (3) | 63 (39 de la capa base) |
| RF del Excel en la Etapa 1 (columna `etapa`) | 58 |
| RF del Excel fuera de la Etapa 1 | 5 (no se listan aquí; RN-SVC-043) |
| RF de la Etapa 1 que solo trae el PLT-03/04 v1.3 | 4 (RF-SVC-064 a 067) |
| RF de la Etapa 1 con historia | **62 de 62** (1 historia por RF) |
| RF de la Etapa 1 sin historia | **0** |
| RNF del Excel (3) | 26 |
| RNF de la Etapa 1 | 24 (2 quedan fuera de la Etapa 1) |
| RNF de la Etapa 1 declarados en alguna funcionalidad (PLT-03) | **24 de 24** |
| RNF de la Etapa 1 citados en alguna historia (PLT-04) | 5 de 24 |
| RNF de la Etapa 1 sin cita en historias | 19 (todos están declarados en su funcionalidad) |
| Reglas de negocio del Excel | 43 (RN-SVC-001 a 043) |
| Reglas que citan los PDF y no están en el Excel | 2: RN-SVC-044 (visibilidad del ticket para el cliente) y RN-SVC-045 (clave única del flujo) |

**Lectura.** En la Etapa 1 no queda ningún RF sin historia. Los 58 RF del Excel tienen su historia, los
4 RF nuevos del PO también (HU-064 a 067) y el Excel no tiene ningún RF de la Etapa 1 sin historia. En los RNF, la
versión anterior de este documento medía la cobertura solo por las citas en las historias y daba 20
«sin cobertura». Con el PLT-03 v1.3, **cada RNF de la Etapa 1 está declarado en al menos una
funcionalidad**, con su métrica y su umbral. Lo que falta es que 19 no se citan en ningún criterio de
historia. Ese hueco se cierra en el plan de pruebas de cada funcionalidad: un TC por RNF con su umbral.
No hace falta otra historia. La decisión está en `decisiones.md` P-012.

Las 62 historias están en Nexora (carpeta `historias/`, v1.3) y siguen pendientes de aprobación del PO.

## Requisitos funcionales de la Etapa 1

«Capa» es la del Excel. La prioridad es la del PLT-03 v1.3 (el Excel no la trae en RF-SVC-001 a 039).
«flexible» marca lo primero que sale en el control de alcance del jue 29-oct.

| RF | Nombre (Excel) | Capa | Historia | Funcionalidad | Prioridad (PLT-03) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-001 | Registrar tickets multicanal tipificados | Base (corrida 2026-09-09) | HU-001 | FT-01 | Debe | Cubierto |
| RF-SVC-002 | Entregar numero correlativo por razon social | Base (corrida 2026-09-09) | HU-002 | FT-01 | Debe | Cubierto |
| RF-SVC-003 | Congelar el SLA al abrir | Base (corrida 2026-09-09) | HU-003 | FT-04 | Debe | Cubierto |
| RF-SVC-004 | Gestionar el ciclo de vida del ticket | Base (corrida 2026-09-09) | HU-004 | FT-02 | Debe | Cubierto |
| RF-SVC-005 | Registrar interacciones con visibilidad controlada | Base (corrida 2026-09-09) | HU-005 | FT-02 | Debe | Cubierto |
| RF-SVC-006 | Conservar hitos temporales probatorios | Base (corrida 2026-09-09) | HU-006 | FT-02 | Debe | Cubierto |
| RF-SVC-007 | Derivar entre areas con log auditable | Base (corrida 2026-09-09) | HU-007 | FT-03 | Debe | Cubierto |
| RF-SVC-008 | Reasignar masivamente al cesar un colaborador | Base (corrida 2026-09-09) | HU-008 | FT-03 | Debe | Cubierto |
| RF-SVC-009 | Casillero de tareas por consulta | Base (corrida 2026-09-09) | HU-009 | FT-03 | Debe | Cubierto |
| RF-SVC-010 | Alertar incumplimientos de SLA comercial | Base (corrida 2026-09-09) | HU-010 | FT-04 | Debe | Cubierto |
| RF-SVC-011 | Reabrir con nuevo compromiso sin borrar el original | Base (corrida 2026-09-09) | HU-011 | FT-04 | Debe | Cubierto |
| RF-SVC-012 | Registrar el asiento del libro como extension del ticket | Base (corrida 2026-09-09) | HU-012 | FT-05 | Debe | Cubierto |
| RF-SVC-013 | Computar el plazo legal y la prorroga unica | Base (corrida 2026-09-09) | HU-013 | FT-05 | Debe | Cubierto |
| RF-SVC-014 | Registrar la respuesta formal con cargo | Base (corrida 2026-09-09) | HU-014 | FT-05 | Debe | Cubierto |
| RF-SVC-015 | Vigilar el plazo legal y detectar huerfanos | Base (corrida 2026-09-09) | HU-015 | FT-05 | Debe | Cubierto |
| RF-SVC-016 | Gestionar apelaciones internas y ante INDECOPI | Base (corrida 2026-09-09) | HU-016 | FT-06 | Debe | Cubierto |
| RF-SVC-019 | Disparar encuesta al cierre y medir calidad | Base (corrida 2026-09-09) | HU-019 | FT-13 | Debe | Cubierto |
| RF-SVC-020 | Registro multilinea con Codigo Unico de Caso | Base (corrida 2026-09-09) | HU-020 | FT-08 | Debe | Cubierto |
| RF-SVC-021 | Cargo previo y cargo de activacion como eventos distintos | Base (corrida 2026-09-09) | HU-021 | FT-08 | Debe | Cubierto |
| RF-SVC-022 | Clasificacion de riesgo por matriz objetiva y recalibracion | Base (corrida 2026-09-09) | HU-022 | FT-08 | Debe | Cubierto |
| RF-SVC-023 | Escalamiento en cadena por incumplimiento de SLA | Base (corrida 2026-09-09) | HU-023 | FT-09 | Debe | Cubierto |
| RF-SVC-024 | Validacion de casos cruzados y vinculados | Base (corrida 2026-09-09) | HU-024 | FT-09 | Debe | Cubierto |
| RF-SVC-025 | Cierre tipificado con evidencia y custodia legal separada | Base (corrida 2026-09-09) | HU-025 | FT-09 | Debe | Cubierto |
| RF-SVC-026 | Gate de derivacion obligatoria a Eje 3 | Base (corrida 2026-09-09) | HU-026 | FT-07 | Debe | Cubierto |
| RF-SVC-027 | Paquete minimo de handoff con confirmacion de recepcion | Base (corrida 2026-09-09) | HU-027 | FT-07 | Debe | Cubierto |
| RF-SVC-028 | Nota de estado emocional sin juicios de valor | Base (corrida 2026-09-09) | HU-028 | FT-07 | Debe | Cubierto |
| RF-SVC-029 | SLA de cierre end-to-end de la experiencia | Base (corrida 2026-09-09) | HU-029 | FT-04 | Debe | Cubierto |
| RF-SVC-030 | Monitoreo en tiempo real y correccion preventiva | Base (corrida 2026-09-09) | HU-030 | FT-14 | Debería | Cubierto |
| RF-SVC-031 | Informe diario operativo e informe quincenal analitico | Base (corrida 2026-09-09) | HU-031 | FT-14 | Debería | Cubierto |
| RF-SVC-032 | Prevencion de registros paralelos del dato de cliente | Base (corrida 2026-09-09) | HU-032 | FT-14 | Debería | Cubierto |
| RF-SVC-033 | Registro del reclamo de garantia vinculado a la entrega | Base (corrida 2026-09-09) | HU-033 | FT-10 | Debería | Cubierto |
| RF-SVC-034 | Validacion de vigencia contra el periodo de cobertura | Base (corrida 2026-09-09) | HU-034 | FT-10 | Debería | Cubierto |
| RF-SVC-035 | Inspeccion tecnica y resolucion del reclamo | Base (corrida 2026-09-09) | HU-035 | FT-10 | Debería | Cubierto |
| RF-SVC-036 | Escalamiento a Eje 3 y reincorporacion contractual | Base (corrida 2026-09-09) | HU-036 | FT-10 | Debería | Cubierto |
| RF-SVC-037 | Clasificacion de riesgo verbal y secuencia de Frases Ancla | Base (corrida 2026-09-09) | HU-037 | FT-15 | Podría · flexible | Cubierto |
| RF-SVC-038 | Derivacion inmediata a Estacion 4 sin debate | Base (corrida 2026-09-09) | HU-038 | FT-15 | Podría · flexible | Cubierto |
| RF-SVC-039 | Registro del caso con etiqueta estandar | Base (corrida 2026-09-09) | HU-039 | FT-15 | Podría · flexible | Cubierto |
| RF-SVC-040 | Integrar el ticket con la gestion de Legal | Feedback de la presentación (oct-2026) | HU-040 | FT-16 | Debe | Cubierto |
| RF-SVC-041 | Prevenir que un reclamo llegue a denuncia | Feedback de la presentación (oct-2026) | HU-041 | FT-16 | Debe | Cubierto |
| RF-SVC-042 | Integrar la plataforma del call center | Feedback de la presentación (oct-2026) | HU-042 | FT-17 | Debe | Cubierto |
| RF-SVC-043 | Configurar flujos de trabajo de tickets por area | Feedback de la presentación (oct-2026) | HU-043 | FT-18 | Debe | Cubierto |
| RF-SVC-044 | Bandeja orquestadora de tickets | Feedback de la presentación (oct-2026) | HU-044 | FT-18 | Debe | Cubierto |
| RF-SVC-045 | Marcar un ticket con rayo de prioridad | Feedback de la presentación (oct-2026) | HU-045 | FT-18 | Debería | Cubierto |
| RF-SVC-046 | Reasignar automaticamente al agente con menos carga | Feedback de la presentación (oct-2026) | HU-046 | FT-18 | Debería | Cubierto |
| RF-SVC-047 | Guia de solucion por tipo de ticket | Feedback de la presentación (oct-2026) | HU-047 | FT-19 | Debería | Cubierto |
| RF-SVC-048 | Retroalimentacion de IA al agente durante la atencion | Feedback de la presentación (oct-2026) | HU-048 | FT-19 | Podría · flexible | Cubierto |
| RF-SVC-049 | Buscar al cliente y llamarlo desde la ficha | Feedback de la presentación (oct-2026) | HU-049 | FT-20 | Debe | Cubierto |
| RF-SVC-050 | Consulta 360 del cliente en el ticket | Feedback de la presentación (oct-2026) | HU-050 | FT-20 | Debe | Cubierto |
| RF-SVC-051 | Gestionar excepciones en la consulta del cliente | Feedback de la presentación (oct-2026) | HU-051 | FT-20 | Debe | Cubierto |
| RF-SVC-052 | Reutilizar el motor de consultas existente (Jose) | Feedback de la presentación (oct-2026) | HU-052 | FT-20 | Debería | Cubierto |
| RF-SVC-053 | Busqueda inteligente en archivos y documentos del cliente | Feedback de la presentación (oct-2026) | HU-053 | FT-20 | Podría · flexible | Cubierto |
| RF-SVC-054 | Tablero de avance diario del agente | Feedback de la presentación (oct-2026) | HU-054 | FT-21 | Debería | Cubierto |
| RF-SVC-055 | Alertar por correo la asignacion con copia al lider | Feedback de la presentación (oct-2026) | HU-055 | FT-21 | Debe | Cubierto |
| RF-SVC-056 | Generar el caso de resolucion de contrato por 3 meses impagos | Feedback de la 2.ª reunión (oct-2026) | HU-056 | FT-22 | Debe | Cubierto |
| RF-SVC-057 | Enviar en paralelo la alerta de cancelacion del servicio | Feedback de la 2.ª reunión (oct-2026) | HU-057 | FT-22 | Debe | Cubierto |
| RF-SVC-058 | Carta de alerta al responsable del proyecto con copia al supervisor | Feedback de la 2.ª reunión (oct-2026) | HU-058 | FT-22 | Debe | Cubierto |
| RF-SVC-059 | Registrar el ingreso de personas al proyecto con formulario simple | Feedback de la 2.ª reunión (oct-2026) | HU-059 | FT-23 | Debería | Cubierto |
| RF-SVC-060 | Gestionar los buses del Entrega Fest | Feedback de la 2.ª reunión (oct-2026) | HU-060 | FT-23 | Debería | Cubierto |
| RF-SVC-064 | Registrar y consultar mis tickets en Mi Portal (título de la HU) | PLT-03/04 v1.3 (no está en el Excel) | HU-064 | FT-24 | Debe | Cubierto |
| RF-SVC-065 | Ver la trazabilidad de mi ticket (título de la HU) | PLT-03/04 v1.3 (no está en el Excel) | HU-065 | FT-24 | Debe | Cubierto |
| RF-SVC-066 | Responder, adjuntar y confirmar la solución de mi ticket (título de la HU) | PLT-03/04 v1.3 (no está en el Excel) | HU-066 | FT-24 | Debe | Cubierto |
| RF-SVC-067 | Ver el proceso de atención en un visor 3D (operación en vivo) (título de la HU) | PLT-03/04 v1.3 (no está en el Excel) | HU-067 | FT-25 | Debe | Cubierto |

RF-SVC-064 a 067 no tienen nombre en el Excel porque no están en él. Se muestra el título de su historia
(PLT-04 v1.3), y el requerimiento completo está en el PLT-03 (FT-ATC-24 y FT-ATC-25).

## Requisitos no funcionales de la Etapa 1

La cobertura se mide de dos formas:

- **Funcionalidad**: el PLT-03 v1.3 declara el RNF en la sección de RNF de la funcionalidad, con su
  métrica y su umbral.
- **Historia**: el texto de la historia del PLT-04 v1.3 cita el RNF en sus criterios, notas técnicas o
  reglas.

Un RNF declarado en la funcionalidad y sin cita en la historia se prueba en el plan de pruebas de esa
funcionalidad. Algunos los cubre además la arquitectura; por ejemplo, RNF-DIS-003 con el ADR-014 y
RNF-AUD-004 con el ADR-002. La prioridad es la que el PLT-03 da al RNF (el Excel la tiene en
«pendiente»).

| RNF | Nombre (Excel) | Capa | Prioridad (PLT-03) | Funcionalidades que lo declaran | Historias que lo citan | Estado |
|---|---|---|---|---|---|---|
| RNF-SEC-008 | DLP en bitacoras y narrativa por rol | Base (corrida 2026-09-09) | Debe | FT-02, FT-03, FT-05, FT-07, FT-08, FT-24 | HU-005, HU-050 | Declarado en funcionalidad y citado en historia |
| RNF-REN-003 | Matriz objetivo de SLA por tipo y prioridad | Base (corrida 2026-09-09) | Debería | FT-04 | — | Declarado en funcionalidad; sin cita en historias |
| RNF-REN-005 | Cierre end-to-end de la experiencia sin escalamiento | Base (corrida 2026-09-09) | Debería | FT-04 | — | Declarado en funcionalidad; sin cita en historias |
| RNF-REN-006 | Post-mortem de EntregaFest dentro de 3 dias habiles | Base (corrida 2026-09-09) | Debería | FT-15 | — | Declarado en funcionalidad; sin cita en historias |
| RNF-DIS-003 | Plataforma ATC en Multi-AZ | Base (corrida 2026-09-09) | Debe | FT-01 | — | Declarado en funcionalidad; sin cita en historias |
| RNF-INT-004 | Medicion de calidad hacia el KPI Engine | Base (corrida 2026-09-09) | Debe | FT-13 | HU-019 | Declarado en funcionalidad y citado en historia |
| RNF-INT-007 | Cero registros paralelos del dato de cliente | Base (corrida 2026-09-09) | Debe | FT-01, FT-14, FT-20 | — | Declarado en funcionalidad; sin cita en historias |
| RNF-USA-001 | NPS-C: North Star corporativo de experiencia | Base (corrida 2026-09-09) | Debería | FT-14 | — | Declarado en funcionalidad; sin cita en historias |
| RNF-AUD-004 | Cinco bitacoras append-only firmadas | Base (corrida 2026-09-09) | Debe | FT-02, FT-03, FT-04, FT-05, FT-06, FT-07, FT-10, FT-16, FT-18, FT-24 | HU-004 | Declarado en funcionalidad y citado en historia |
| RNF-CUM-006 | Libro de Reclamaciones conforme a ley | Base (corrida 2026-09-09) | Debe | FT-05 | — | Declarado en funcionalidad; sin cita en historias |
| RNF-CUM-007 | Evidencia probatoria inmutable | Base (corrida 2026-09-09) | Debe | FT-05, FT-06, FT-09 | HU-014, HU-025 | Declarado en funcionalidad y citado en historia |
| RNF-CUM-015 | IGDC: Indice de Gestion Documentaria y de Casos | Base (corrida 2026-09-09) | Debe | FT-08, FT-09, FT-14 | — | Declarado en funcionalidad; sin cita en historias |
| RNF-CUM-016 | Cierre formal 100% en Mi Portal | Base (corrida 2026-09-09) | Debe | FT-02 | — | Declarado en funcionalidad; sin cita en historias |
| RNF-INT-008 | Integracion en linea con el call center | Feedback de la presentación (oct-2026) | Debe | FT-17 | — | Declarado en funcionalidad; sin cita en historias |
| RNF-INT-009 | Integracion con Legal sin doble registro | Feedback de la presentación (oct-2026) | Debe | FT-16 | — | Declarado en funcionalidad; sin cita en historias |
| RNF-REN-007 | Respuesta del motor de busqueda | Feedback de la presentación (oct-2026) | Debería | FT-20 | HU-050 | Declarado en funcionalidad y citado en historia |
| RNF-REN-008 | Oportunidad del correo de asignacion | Feedback de la presentación (oct-2026) | Debería | FT-21 | — | Declarado en funcionalidad; sin cita en historias |
| RNF-SEC-009 | Uso seguro de IA | Feedback de la presentación (oct-2026) | Debe | FT-19 | — | Declarado en funcionalidad; sin cita en historias |
| RNF-SEC-010 | Permisos en busqueda y consulta 360 | Feedback de la presentación (oct-2026) | Debe | FT-20, FT-25 | — | Declarado en funcionalidad; sin cita en historias |
| RNF-USA-002 | Flujos configurables sin desarrollo | Feedback de la presentación (oct-2026) | Debería | FT-18, FT-25 | — | Declarado en funcionalidad; sin cita en historias |
| RNF-INT-010 | Morosidad actualizada desde Cobranza | Feedback de la 2.ª reunión (oct-2026) | Debe | FT-22 | — | Declarado en funcionalidad; sin cita en historias |
| RNF-USA-003 | Termino «Gestor de tickets» en toda la plataforma | Feedback de la 2.ª reunión (oct-2026) | Debería | FT-18 | — | Declarado en funcionalidad; sin cita en historias |
| RNF-USA-004 | Formulario simple y movil | Feedback de la 2.ª reunión (oct-2026) | Debería | FT-23 | — | Declarado en funcionalidad; sin cita en historias |
| RNF-AUD-005 | Constancia de alertas y cartas de resolucion | Feedback de la 2.ª reunión (oct-2026) | Debe | FT-22 | — | Declarado en funcionalidad; sin cita en historias |

Además de estos 24, las funcionalidades FT-ATC-24 y FT-ATC-25 declaran RNF propios del PO (`RNF-P`):

- Mi Portal: registro en ≤ 3 min desde un celular y código de 6 dígitos que vence en 5 min, con un
  máximo de 3 intentos.
- Visor 3D: desfase ≤ 5 s con 200 tickets activos y vista 2D WCAG 2.1 AA.

No tienen identificador del Excel.

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-19 | Jesús (Dev 2), con IA | Versión inicial publicada en Nexora (v1), contra el Excel v2 |
| 0.2 | 2026-10-21 | Brayan (Dev 1), con IA | Pasa al Excel (3) con la división por etapas: cuenta solo los RF y RNF de la Etapa 1 y dice cuántos quedan fuera. Suma la medida por funcionalidad (PLT-03) a la de historias. Añade la prioridad del PLT-03, RN-SVC-044 y 045, y quita la nota de las «15 historias» en Nexora (hoy están las 62) |

Generado por IA: borrador completo. Versión base de Nexora (v1, de Jesús, 19-oct), actualizada a la v1.3 del PO (Etapa 1) y al Excel (3) por Brayan con IA (Claude, 21-oct-2026). Texto adaptado al alcance de la Etapa 1 (los requisitos que el Excel deja fuera de la Etapa 1 se cuentan, no se listan). — Revisado por: (pendiente)
