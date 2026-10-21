---
id: "ADR-005"
tipo: "adr"
titulo: "ADR-005: Jobs batch idempotentes para SLA y plazo legal con calendario MAE_TIME/MAE_HOLIDAY"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.1"
owner: "[por asignar: arquitecto / TL]"
aprobadores: []
fecha: "2026-10-19"
relacionados: [ADR-001, ADR-012, ADR-013, ADR-014]
tags: [adr, arquitectura, g3]
---

# ADR-005: Jobs batch idempotentes para SLA y plazo legal con calendario MAE_TIME/MAE_HOLIDAY

- Estado: propuesto
- Ticket: AYB-0001 · Fecha: 2026-10-19
- Compatibilidad con M0 (Arquitectura de Directorio): **por confirmar** (M0 no está en el repositorio; la declara el TL o se solicita dispensa al Data Chief o al Directorio)
- Origen: convierte a la plantilla del marco el ADR-05 del PLT-05 v1.3

> Las opciones evaluadas son una propuesta de redacción a partir del motivo del PLT-05 y de las skills del SDK: el arquitecto las confirma o corrige antes de pedir la aprobación del TL.

## Contexto

Los plazos de SLA y el plazo legal del Libro de Reclamaciones corren en días hábiles y feriados (calendario `MAE_TIME` / `MAE_HOLIDAY`). Deben alertar una sola vez por incumplimiento (HU-010) y vigilar los reclamos huérfanos (HU-015) sin que nadie consulte. El SDK solo trae utilidades de fechas y zonas horarias (`AybarDates`, `Timezone`): no trae calendario de días hábiles.

## Opciones evaluadas

| Opción | Por qué no | Qué la haría reconsiderar |
|---|---|---|
| Calcular el vencimiento solo al consultar | No alerta sin que alguien mire; una sola alerta por incumplimiento no se puede garantizar. | — |
| Programador externo al servicio | Añade una pieza más que operar en 10 días; sin ventaja con un solo despliegue. | Que se extraiga el módulo `sla` a un servicio propio. |

## Decisión

Los cálculos de SLA y de plazo legal se ejecutan en **jobs programados e idempotentes** dentro del monolito, sobre el calendario de días hábiles y feriados por geografía. Repetir un job no duplica alertas ni asientos. El mecanismo de programación y el **control de ejecución única con varias réplicas** (para que dos instancias no corran el mismo job) quedan **por definir**.

## Consecuencias

- Obliga a:
  - Construir la lógica de días hábiles sobre `MAE_TIME` y `MAE_HOLIDAY`: el v7 ya trae las tablas (fragmento REFERENCE); DEP-04 define su carga.
  - Idempotencia por clave del hecho (ticket + ciclo + tipo de incumplimiento).
  - Publicar `sla.breached` por el outbox (ADR-013).
- Impide:
  - Cálculos de plazo en horas corridas.
- Cuesta: Horas de desarrollo sin estimar.

## Controles programados, plazos y reintentos que piden las historias

Contraste del 20-oct-2026 con las 62 historias de Nexora: además de HU-010 y HU-015, otras 15 piden un job, un control o un reintento. Todos cuentan en días hábiles (`MAE_TIME`, `MAE_HOLIDAY`) y deben ser idempotentes. **Es una lista de lo que piden las historias**: el arquitecto decide cuáles son jobs, cuáles son eventos del outbox y cuáles son del orquestador.

| Historia | Qué pide | Mecanismo propuesto |
|---|---|---|
| HU-010 | Una sola alerta por ticket, ciclo y tipo (`FIRST_RESPONSE_OVERDUE`); no alerta un ticket resuelto antes de vencer | Job de SLA |
| HU-015 | Reclamo a 3 días hábiles de vencer sin prórroga: `LEGAL_EXTENSION_WINDOW_CLOSING`; al cierre del día, ticket activo con `RequiresComplaintBook` sin asiento: excepción `ORPHAN_REFERENCE`; evalúa el plazo prorrogado, no el original | Job de plazo legal + control diario |
| HU-021 | Caso con cargo previo sin activar más de 2 días hábiles: lista de casos en limbo | Control programado |
| HU-023 | Alerta temprana al alcanzar el umbral del SLA de línea; escalamiento en cadena al vencer | Job de escalamiento |
| HU-027 | Handoff sin confirmar tras 1 día hábil: alerta al supervisor del eje destino | Control programado |
| HU-029 | 72 horas hábiles sin cierre en Eje 2 sin escalar: riesgo de incumplimiento; escalado a Eje 3 se mide contra el plazo del eje | Cálculo al cerrar + job |
| HU-031 | Informe diario (cierre de jornada) e informe quincenal | Informe programado |
| HU-032 | Corte quincenal: registros paralelos del dato de cliente = 0; un hallazgo es gate no compensable | Auditoría programada |
| HU-040 | Si la herramienta de Legal no responde: cola con reintento y «pendiente de sincronizar» | Adaptador con reintento (ADR-004) |
| HU-046 | Balanceo por carga al entrar un ticket; excluye rayo, Eje 3 e interacción en curso; sin gestor disponible: cola del área y alerta al supervisor | Orquestador (ADR-008) |
| HU-051 | Reintento automático de la vinculación del cliente cuando SIGDA/TAXON vuelve | Job de reintento |
| HU-055 | Correo al asignar en 1 min o menos con copia al líder; un solo correo de resumen por gestor en una reasignación masiva | Evento `ticket.assigned` |
| HU-056 | Evaluación diaria: contrato con 3 cuotas vencidas e impagas según Cobranza (DEP-08) | Job diario |
| HU-057 | Alerta de cancelación al cliente en el mismo momento de crear el ticket; reintento por WhatsApp y Mi Portal si el correo rebota | Evento desde el outbox (ADR-013) |
| HU-058 | Carta de alerta al responsable del proyecto con copia al supervisor; sin acción en el plazo definido, escalamiento | Evento + control programado |
| HU-065 | Aviso por correo y WhatsApp al cliente en cada cambio de estado de su ticket | Evento `ticket.status_changed` |
| HU-066 | Cierre automático del ticket resuelto sin respuesta del cliente a los días hábiles configurados, con aviso | Job de cierre |

## Datos (puerta F4 de Gobierno de Datos)

- Entidades `SVC_SLA_BREACH_ALERT` y `MAE_SLA_POLICY` (SERVICE) y maestros `MAE_TIME` y `MAE_HOLIDAY` (REFERENCE, fuente única de días hábiles en el v7); dueño de dato por asignar.
- Regla de calidad (F10): una sola alerta por ticket, tipo de incumplimiento y ciclo (HU-010): `UNIQUE (TicketID, BreachTypeID, ReopenCycleNumber)` según el Excel (RN-SVC-008). La alerta es una bitácora firmada (RNF-AUD-004, ADR-002).

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v4 de Jesús Chávez Elías en Nexora; actualizado por Brayan con IA (Claude, 2026-10-21) a la v1.3 del PO: título completo del ADR-05 del PO y clave única de la alerta del Excel (RN-SVC-008). — Revisado por: (pendiente) · Aprueba: TL
