---
id: "ADR-005"
tipo: "adr"
titulo: "ADR-005: Jobs batch idempotentes para SLA y plazo legal con calendario MAE_TIME/MAE_HOLIDAY y ShedLock"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.5"
owner: "Jesús Chávez Elías"
aprobadores: [tech_lead]
fecha: "2026-10-26"
relacionados: [ADR-001, ADR-002, ADR-004, ADR-008, ADR-009, ADR-012, ADR-013, ADR-014]
tags: [adr, arquitectura, g3]
---

# ADR-005: Jobs batch idempotentes para SLA y plazo legal con calendario MAE_TIME/MAE_HOLIDAY y ShedLock

- Estado: propuesto
- Ticket: AYB-0001 · Versión 0.5 · Fecha: 2026-10-26 (historial al final)
- Owner: Jesús Chávez Elías (Dev 2) · Aprueba: Líder Técnico (`aprobadores: [tech_lead]`) · Revisado por: Brayan Manuel Hurtado Paucar, 26-oct-2026
- Compatibilidad con M0 (Arquitectura de Directorio): **requiere dispensa (solicitada)**. El Líder Técnico la pidió a Enrique Albán (Data Chief) el 22-oct-2026; M0 no está en el repositorio ni en Nexora. La dispensa es una firma, no una condición del contenido (P-005, ED-25).
- Origen: convierte a la plantilla del marco el ADR-05 del PLT-05 v1.3, con la decisión DT-08 del Líder Técnico (Jose Jara, 22-oct-2026): tareas programadas con ShedLock sobre PostgreSQL, como las de Control de acceso (D-90 de PJ-05). Registrada en `analisis/decisiones.md` v0.7. Cierra P-006.

> Las frecuencias, los reintentos y la alerta de la sección «Decisión» son **decisión del equipo** (26-oct), como pidió el Líder Técnico; se aprueban con este ADR. Los plazos de negocio salen de las historias y de las decisiones del equipo de `analisis/decisiones.md` v0.7 (ED-26).

## Contexto

Los plazos de SLA y el plazo legal del Libro de Reclamaciones corren en días hábiles y feriados (calendario `MAE_TIME` / `MAE_HOLIDAY`). Deben alertar una sola vez por incumplimiento (HU-010) y vigilar los reclamos huérfanos (HU-015) sin que nadie consulte. El SDK solo trae utilidades de fechas y zonas horarias (`AybarDates`, `Timezone`): no trae calendario de días hábiles ni ShedLock.

## Opciones evaluadas

| Opción | Por qué no | Qué la haría reconsiderar |
|---|---|---|
| Calcular el vencimiento solo al consultar | No alerta sin que alguien mire; una sola alerta por incumplimiento no se puede garantizar. | — |
| Programador externo al servicio | Añade una pieza más que operar; sin ventaja con un solo despliegue. DT-08 fija la ejecución dentro del servicio. | Que se extraiga el módulo `sla` a un servicio propio. |
| `@Scheduled` sin candado | Con varias réplicas, dos instancias correrían el mismo job. | — |

## Decisión

Los cálculos de SLA y de plazo legal se ejecutan en **jobs programados e idempotentes** dentro del servicio, con **ShedLock sobre PostgreSQL** para que corra una sola réplica (DT-08).

1. **Mecanismo:** `@Scheduled` con `@SchedulerLock` (ShedLock con su proveedor JDBC) sobre la base única; `usingDbTime()` para no depender del reloj de cada réplica. Cada job fija `lockAtMostFor` (2 veces su duración esperada) y `lockAtLeastFor`. Dependencia nueva, con versión fija porque el BOM del SDK 0.7.1 no la gobierna (ED-24), y tabla `shedlock` en el acta F4, lista para la firma del Data Chief (P-031, ED-23).
2. **Idempotencia:** ShedLock evita la ejecución simultánea, no la repetición tras una caída. Cada job es idempotente por la clave del hecho (ticket + ciclo + tipo de incumplimiento): repetirlo no duplica alertas ni asientos.
3. **Calendario:** días hábiles y feriados por geografía desde `MAE_TIME` y `MAE_HOLIDAY` de la base única (DEP-04 define su carga). Cálculo de plazos siempre en días hábiles, nunca en horas corridas. El cálculo usa un puerto `CalendarioPort` (`domain.port.out`) con un adaptador sobre esas dos tablas. **Su dueño de migración y de carga es el Equipo Datos** (DEP-04; decisión del equipo, ED-11). En local, pruebas y DEV, si no existen, el script de datos sintéticos de ATC las crea tal como están en el v7, con los feriados nacionales del año. En QA, PRE y producción, mientras el Equipo Datos no las cargue (riesgo de la DEP-04 en el roadmap), el adaptador usa el calendario configurado con los feriados nacionales de Perú del año, que es lo que pide el cálculo en días hábiles; cuando existan, lee las tablas, sin cambiar el dominio.
4. **Fuente de lectura:** **los jobs del SLA y del plazo legal leen PostgreSQL, no el almacén de lectura** (que puede ir hasta 5 s atrás, ADR-012).
5. **Reintento:** si un job falla, la siguiente ejecución lo recoge, porque es idempotente. Dentro de una ejecución, cada llamada a un externo reintenta 3 veces con espera creciente (Resilience4j, ADR-004); si sigue fallando, el ítem queda con la sincronización pendiente, a la vista en el ticket (HU-040 CA-03), y se reintenta en la siguiente ejecución.
6. **Alerta ante fallo:** cada job registra en el log (con `correlationId`) su inicio, fin y cantidad procesada, y publica una métrica con la hora de su último éxito. Una regla de alerta de Azure Monitor (ADR-014) avisa si un job no tuvo éxito en 2 veces su frecuencia, o si termina en error. **Destinatarios (decisión del equipo):** un grupo de acción con el correo del equipo de ATC (equipo Tiketes) y la mesa de ayuda de TI; severidad S2, y S1 si el job es del plazo legal (HU-013, HU-015). La misma regla vigila la antigüedad del outbox (ADR-013, Q-007).
7. **Eventos, no jobs:** lo que se dispara por un cambio (correo al asignar, alerta de cancelación al cliente, aviso de estado en Mi Portal) va por el outbox (ADR-013), no por un job.
8. **Datos de otros dueños:** la reasignación por menor carga (HU-046) **no es un job**: la hace el orquestador de la bandeja (ADR-008) cada vez que entra un ticket, dentro del caso de uso. Pide los gestores de la cola al puerto `GestoresPort`, con su adaptador «actividad de ATC»: los que la bitácora de asignaciones de ATC muestra en esa cola en los últimos 30 días (ADR-009, ED-03); la carga son los puntos por prioridad de sus tickets activos (Baja 1, Media 2, Alta 3, Urgente 4; límite inicial 12, Q-046-1). Sin candidatos, el ticket queda en la cola del área y se avisa al rol `ATC_SUPERVISOR` de la cola (ED-03). El responsable del proyecto de HU-058 sale de la DEP-15.

**Frecuencias (decisión del equipo)** (la unidad de plazo siempre son días hábiles; la frecuencia es cada cuánto el job mira):

| Job | Historias | Frecuencia | Base de la frecuencia |
|---|---|---|---|
| Vigilancia de SLA y escalamiento | HU-010, HU-023 | cada 5 min | Alertar sin demora apreciable; el SLA de primera respuesta se mide en horas. Umbrales de la Mesa SGD: alerta preventiva a 2 días hábiles del vencimiento, alerta el día del vencimiento, memorándum a la jefatura a +1, Comité a +3 y Directorio a +5 (FT-09) |
| Plazo legal (alerta a 3 días hábiles de vencer sin prórroga) | HU-015, HU-013 | cada hora | Plazo en días hábiles |
| Control diario de reclamos huérfanos | HU-015 | diario, al cierre de la jornada | HU-015 lo define «al cierre del día» |
| Casos con cargo previo sin activar (más de 2 días hábiles) | HU-021 | diario | Plazo en días hábiles |
| Handoff sin confirmar (1 día hábil) | HU-027 | cada hora | Plazo de 1 día hábil |
| Riesgo de incumplimiento en Eje 2 (72 horas hábiles sin cierre) | HU-029 | cada hora | Plazo en horas hábiles |
| Informes diario y quincenal | HU-031 | diario al cierre de jornada y quincenal | Lo define la historia |
| Auditoría de registros paralelos del dato de cliente | HU-032 | corte quincenal | Lo define la historia |
| Vinculación del interesado «sin cliente vinculado»: consulta al cliente por el documento de `SVC_TICKET_PROSPECT`; al encontrarlo completa el `PartyID`, deja la bitácora y borra los datos mínimos (ED-05) | HU-051 | cada 5 min mientras haya tickets sin vincular | Continuar la atención sin demora |
| Evaluación de 3 cuotas vencidas e impagas | HU-056 | diario | Según Cobranza (DEP-08) |
| Control de la carta de alerta sin acción | HU-058 | diario | 2 días hábiles sin acción registrada (Q-058-3) |
| Cierre automático del ticket resuelto sin respuesta | HU-066 | diario | `MAE_SLA_POLICY.AutoCloseBusinessDays`, 5 días hábiles, congelado con la política del ticket (ED-15) |
| Publicador del outbox | todas las que publican eventos | cada 1 s | Retraso máximo de 5 s del almacén de lectura (ADR-012, ADR-013) |
| Purga de eventos publicados (más de 7 días) | — | diario | Retención del outbox (ADR-013) |
| Verificación del `IntegrityHash` de las bitácoras | RNF-AUD-004 | diario, fuera de la jornada | `hash_mismatch` = 0 (ADR-002, Q-003) |

## Controles programados, plazos y reintentos que piden las historias

Contraste del 20-oct-2026 con las 62 historias de Nexora: además de HU-010 y HU-015, otras 15 piden un job, un control o un reintento. Todos cuentan en días hábiles (`MAE_TIME`, `MAE_HOLIDAY`) y deben ser idempotentes. **La columna «Mecanismo» es la decisión de este ADR:** un «job» o «control programado» está en la tabla de frecuencias; un «evento» sale del outbox (ADR-013); «orquestador» es el caso de uso de la bandeja (ADR-008), sin job; «adaptador con reintento» es ADR-004.

| Historia | Qué pide | Mecanismo |
|---|---|---|
| HU-010 | Una sola alerta por ticket, ciclo y tipo (`FIRST_RESPONSE_OVERDUE`); no alerta un ticket resuelto antes de vencer | Job de SLA |
| HU-015 | Reclamo a 3 días hábiles de vencer sin prórroga: `LEGAL_EXTENSION_WINDOW_CLOSING`; al cierre del día, ticket activo con `RequiresComplaintBook` sin asiento: excepción `ORPHAN_REFERENCE`; evalúa el plazo prorrogado, no el original | Job de plazo legal + control diario |
| HU-021 | Caso con cargo previo sin activar más de 2 días hábiles: lista de casos en limbo | Control programado |
| HU-023 | Alerta temprana al alcanzar el umbral del SLA de línea; escalamiento en cadena al vencer | Job de escalamiento |
| HU-027 | Handoff sin confirmar tras 1 día hábil: alerta al supervisor del eje destino | Control programado |
| HU-029 | 72 horas hábiles sin cierre en Eje 2 sin escalar: riesgo de incumplimiento; escalado a Eje 3 se mide contra el plazo del eje | Cálculo al cerrar + job |
| HU-031 | Informe diario (cierre de jornada) e informe quincenal | Informe programado |
| HU-032 | Corte quincenal: registros paralelos del dato de cliente = 0; un hallazgo es gate no compensable | Auditoría programada |
| HU-040 | Si la herramienta de Legal no responde: cola con reintento y aviso de sincronización pendiente en el ticket (HU-040 CA-03) | Adaptador con reintento (ADR-004) |
| HU-046 | Balanceo por carga al entrar un ticket; excluye rayo, Eje 3 e interacción en curso; sin gestor disponible: cola del área y alerta al supervisor | Orquestador (ADR-008), con `GestoresPort` y su adaptador «actividad de ATC» (ADR-009, ED-03) |
| HU-051 | Reintento automático de la vinculación del cliente cuando SIGDA/TAXON vuelve | Job de vinculación (ED-05) |
| HU-055 | Correo al asignar en 1 min o menos con copia al líder; un solo correo de resumen por gestor en una reasignación masiva | Evento `aybar.service.ticket_assigned` (outbox): correo al gestor (dirección de su cuenta `EMPLOYEE`, ED-01) y, como copia al líder, aviso en la consola al rol `ATC_SUPERVISOR` de la cola (ED-03) |
| HU-056 | Evaluación diaria: contrato con 3 cuotas vencidas e impagas según Cobranza (DEP-08) | Job diario |
| HU-057 | Alerta de cancelación al cliente en el mismo momento de crear el ticket; reintento por WhatsApp y Mi Portal si el correo rebota | Evento desde el outbox (ADR-013) |
| HU-058 | Carta de alerta al responsable del proyecto con copia al supervisor; sin acción en el plazo definido, escalamiento | Evento + control programado |
| HU-065 | Aviso por correo y WhatsApp al cliente en cada cambio de estado de su ticket | Evento `aybar.service.ticket_status_changed` (outbox) |
| HU-066 | Cierre automático del ticket resuelto sin respuesta del cliente a los días hábiles configurados, con aviso | Job de cierre |

## Consecuencias

- Obliga a:
  - Construir la lógica de días hábiles sobre `MAE_TIME` y `MAE_HOLIDAY`: el v7 ya trae las tablas (fragmento REFERENCE); su migración y su carga son del Equipo Datos (DEP-04; ED-11; `datos/registro-de-tablas.md` v0.3 §6).
  - Declarar la dependencia de ShedLock (con versión fija) y crear su tabla (acta F4, ED-23).
  - Idempotencia por clave del hecho (ticket + ciclo + tipo de incumplimiento).
  - Publicar `aybar.service.sla_breached` por el outbox (ADR-013).
  - La regla de Azure Monitor para jobs sin éxito y su grupo de acción (punto 6).
- Impide:
  - Cálculos de plazo en horas corridas.
  - Que un job lea el almacén de lectura para decidir un plazo legal.
- Cuesta: **0 h fuera del plan del PO**: el calendario de días hábiles va dentro de las horas de HU-003 (ADR-05 del PO; tarea HU-ATC-003-T03) y ShedLock dentro del ADR-05 del PO y de las tareas de job (HU-ATC-010-T04 y 015-T04) (tabla del ADR-012). **USD 0 de nube propio**: ShedLock usa una tabla de la base de PostgreSQL (`arquitectura/costo-cloud.md` v0.5, §1.4: API pública de precios de Azure del 26-oct-2026, USD por mes, Brazil South; supuestos fijados en ED-12); los logs y la alerta de los jobs van en Azure Monitor, USD 46,00 al mes en producción (§1.1).

## Datos (puerta F4 de Gobierno de Datos)

- Entidades `SVC_SLA_BREACH_ALERT` y `MAE_SLA_POLICY` (SERVICE) y maestros `MAE_TIME` y `MAE_HOLIDAY` (REFERENCE, fuente única de días hábiles en el v7). Dueño de dato: el que fija `datos/registro-de-tablas.md` v0.3 (§2 para las de SERVICE, §6 para los maestros); el acta F4 queda lista para la firma del Data Chief. Tabla nueva `shedlock` (acta F4, ED-23). El job de vinculación borra las filas de `SVC_TICKET_PROSPECT` que vincula (ED-05).
- Regla de calidad (F10): una sola alerta por ticket, tipo de incumplimiento y ciclo (HU-010): `UNIQUE (TicketID, BreachTypeID, ReopenCycleNumber)` según el Excel (RN-SVC-008). La alerta es una bitácora firmada (RNF-AUD-004, ADR-002).

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-19 | Jesús Chávez Elías, con IA | Borrador con el mecanismo «por definir» |
| 0.1 (v5 en Nexora) | 2026-10-21 | Brayan, con IA | Título completo del ADR-05 y clave única de la alerta (RN-SVC-008) |
| 0.2 | 2026-10-22 | Jesús Chávez Elías, con IA | Escrito con DT-08: ShedLock, idempotencia, fuente de lectura, reintento, alerta ante fallo y frecuencias por job (propuesta) |
| 0.3 | 2026-10-26 | Brayan Hurtado, con IA | Destinatarios y severidad de la alerta (antes «por definir»); jobs del publicador y la purga del outbox y de la verificación del hash; `GestoresPort` para HU-046 y HU-055 (P-035); tópicos con el formato del SDK; ShedLock con versión fija; costo con número y fuente |
| 0.4 | 2026-10-26 | Brayan Hurtado, con IA | Segunda revisión del Líder Técnico: HU-046 es del orquestador, no un job; la columna «Mecanismo» queda como decisión del ADR (sin «el arquitecto decide»); `CalendarioPort` con simulador mientras `MAE_TIME` y `MAE_HOLIDAY` no existan en la base única (P-043, DEP-04); dueño de dato remitido al registro; fuente del costo en la v0.4 |
| 0.4 | 2026-10-26 | Brayan Hurtado, con IA | Barrido de coherencia (misma versión, sin cambio de decisión): el origen cita `analisis/decisiones.md` v0.6, la versión vigente (decía v0.5). |
| 0.5 | 2026-10-26 | Brayan Hurtado, con IA | Decisiones del equipo del 26-oct (`analisis/decisiones.md` v0.7): frecuencias, reintento y destinatarios de la alerta como decisión; calendario del Equipo Datos con el script sintético en local y DEV y el calendario configurado mientras falten las tablas (ED-11); HU-046 con `GestoresPort` «actividad de ATC» y carga por puntos (ED-03, Q-046-1); HU-055 con aviso al rol (ED-03); job de vinculación con `SVC_TICKET_PROSPECT` (ED-05); cierre automático con `AutoCloseBusinessDays` (ED-15); umbrales de escalamiento de la Mesa (FT-09); plazo de HU-058 (Q-058-3); horas dentro de HU-003 y del ADR-05 del PO; supuestos del costo en ED-12 |

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v5 de Nexora; reescrito con IA (Claude, 2026-10-22) a partir de la revisión del Líder Técnico del 22-oct y actualizado con IA (Claude, 2026-10-26). — Revisado por: Brayan Manuel Hurtado Paucar, 26-oct-2026 · Aprueba: TL
