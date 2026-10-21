---
id: "ADR-005"
tipo: adr
titulo: "Jobs batch idempotentes para SLA y plazo legal"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "[Lider tecnico]"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["AYB-0001"]
tags: [adr, f4, g3]
---

# ADR-005: Jobs batch idempotentes para SLA y plazo legal

- Estado: propuesto
- Ticket: AYB-0001 (placeholder) - Fecha: 2026-10-16
- Compatibilidad con M0: [M0 no disponible en este repositorio - verificar con Arquitectura/TL en G3]

## Contexto

`HU-ATC-010` exige detectar `FIRST_RESPONSE_OVERDUE`/`RESOLUTION_OVERDUE`
"alertando una sola vez por tipo y ciclo"; `HU-ATC-015` vigila el plazo
legal del Libro de Reclamaciones. `RN-SVC-008` fija la regla exacta: una
restricción `UNIQUE(TicketID, BreachTypeID, ReopenCycleNumber)` sobre
`SLA_BREACH_ALERT`. El SDK Aybar **no implementa outbox transaccional**
(ver skill `aybar-outbox`, NO IMPLEMENTADO): el commit en Postgres y el
publish a Kafka no son atómicos.

## Opciones evaluadas

| Opción | Por que no | Que la haria reconsiderar |
|---|---|---|
| Job que recalcula y reenvía alertas en cada corrida sin control de idempotencia | Generaría alertas duplicadas en cada corrida del job, violando `RN-SVC-008` de forma directa | Nunca — es la causa raíz del problema que este ADR resuelve |
| Un temporizador/reloj por ticket activo (en vez de un job centralizado) | Multiplica los triggers activos a miles sin beneficio sobre un job periódico; más difícil de operar y observar | Si el volumen de tickets activos creciera al punto de que un job batch periódico no diera abasto en su ventana |
| Job batch periódico, idempotente, apoyado en la restricción `UNIQUE` de la tabla (elegida) | — | — |

## Decision

Los jobs que evalúan incumplimiento de SLA y de plazo legal corren de forma
periódica, son idempotentes (pueden repetirse sin duplicar efectos) y
confían en la restricción de unicidad de `SLA_BREACH_ALERT` para garantizar
una sola alerta por tipo de incumplimiento y ciclo de reapertura.

## Consecuencias

- Obliga a: diseñar cada job con `upsert` o captura explícita de la
  violación de unicidad, nunca con un patrón "verificar-luego-insertar" sin
  el constraint como respaldo.
- Impide: disparar estas alertas por evento de dominio en tiempo real — el
  vencimiento se evalúa por tiempo transcurrido, no por una acción del
  usuario.
- Cuesta: **riesgo aceptado, no resuelto** — como no hay outbox
  transaccional en el SDK, un fallo entre el cálculo del job y el envío de
  la alerta (p. ej. caída justo después del commit en Postgres y antes del
  publish a Kafka) puede perder esa alerta sin error visible. Esta decisión
  de riesgo debe ir explícita en el envío de G3 para que el TL decida si
  basta así o si el caso de negocio exige implementar outbox en el
  servicio (decisión de arquitectura aparte, no cubierta por este ADR).

## Datos (puerta F4 de Gobierno de Datos)

- Entidades nuevas y dueño de dato: `SLA_BREACH_ALERT` (`BreachType`,
  `Cycle`, `EvaluatedDueDateTime`) con restricción `UNIQUE`. Dueño: Gestión
  de Tickets.
- Linaje: generada internamente por el job, a partir de `SVC_TICKET` y
  `MAE_SLA_POLICY`.
- PII/sensibilidad: ninguna directa (solo IDs y fechas).
- Reglas de calidad para F10: cero alertas duplicadas por
  `(TicketID, BreachTypeID, ReopenCycleNumber)`.

Generado por IA: documento completo, a partir de `HU-ATC-010`, `HU-ATC-015`,
`RN-SVC-008` y la skill `aybar-outbox` (confirmando que no está
implementado) — Revisado por: [pendiente, nombre y fecha] - Aprueba: TL
