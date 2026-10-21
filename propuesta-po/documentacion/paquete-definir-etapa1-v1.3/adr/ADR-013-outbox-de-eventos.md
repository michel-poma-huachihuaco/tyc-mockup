---
id: "ADR-013"
tipo: "adr"
titulo: "ADR-013: Outbox transaccional para publicar eventos sin perderlos"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.1"
owner: "[por asignar: arquitecto / TL]"
aprobadores: []
fecha: "2026-10-19"
relacionados: [ADR-001]
tags: [adr, arquitectura, g3]
---

# ADR-013: Outbox transaccional para publicar eventos sin perderlos

- Estado: propuesto
- Ticket: AYB-0001 · Fecha: 2026-10-19
- Compatibilidad con M0 (Arquitectura de Directorio): **por confirmar** (M0 no está en el repositorio; la declara el TL o se solicita dispensa al Data Chief o al Directorio)
- Origen: nuevo en esta propuesta
- **Conflicto abierto con el PLT-01 v1.3 (ADR-01 del PO): decide el líder técnico.** El registro del PO tiene 11 ADR y no incluye un outbox. Este ADR se deriva del stack del ADR-012 (bus de eventos y almacén de lectura), que el PO no propone. Sigue en propuesta.

> Las opciones evaluadas son una propuesta de redacción a partir del motivo del PLT-05 y de las skills del SDK: el arquitecto las confirma o corrige antes de pedir la aprobación del TL.

## Contexto

El patrón del SDK (skill `aybar-cqrs`) escribe en PostgreSQL, publica un evento por Kafka y un proyector actualiza el almacén de lectura. El commit y el envío **no son atómicos**: si el sistema se cae entre los dos pasos, el evento se pierde y la vista de lectura queda atrás sin error visible.

El SDK **no trae outbox ni proyector** (skills `aybar-outbox` y `aybar-estado-del-sdk`, NO IMPLEMENTADO; el contrato de `aybar-starter-messaging` dice que la proyección vive en el servicio). Lo que existe es `AybarEventProducer`, con cola de errores y reintento acotado, pero sin garantía de entrega si falla el proceso. Los eventos del PLT-05 son `ticket.assigned`, `ticket.closed` y `sla.breached`.

## Opciones evaluadas

| Opción | Por qué no | Qué la haría reconsiderar |
|---|---|---|
| Publicar después del commit, sin outbox (`AFTER_COMMIT`) | No garantiza la entrega: un fallo entre el commit y el envío pierde el evento. | Que se acepte el riesgo **por escrito** en un ADR. |
| Doble commit a mano PostgreSQL + Kafka | La skill lo prohíbe: es frágil y deja mensajes huérfanos. | — |

## Decisión

Se construye un **outbox transaccional en el servicio** (no en el SDK):
1. En la **misma transacción** de escritura se inserta una fila de outbox con el evento.
2. Un proceso posterior publica con `AybarEventProducer` y marca la fila como publicada.
3. El puerto `Outbox` lo declara el servicio en su dominio; el adaptador va en `adapters.outbound.persistence.postgres`, con su tabla en una migración Flyway (o `INTG_OUTBOX_EVENT` del v7, por confirmar).
4. Los eventos llevan solo referencias, nunca texto libre.
5. Los consumidores (proyector, notificaciones, KPI, visor 3D, Mi Portal) son **idempotentes**.

## Consecuencias

- Obliga a:
  - Construir el outbox, su tabla y el proceso publicador **dentro del plan de capacidad**.
  - Consumidores idempotentes y vigilar el retraso de publicación.
  - Resolver la autenticación SASL/IAM contra un broker gestionado (sin resolver por el equipo del SDK), el control de salud del broker (el kit lo retiró) y la concurrencia del consumidor (queda en 1).
- Impide:
  - Confiar en que «se publicó» solo porque el commit terminó.
- Cuesta: Horas de desarrollo **sin estimar** y una tabla adicional o la `INTG_OUTBOX_EVENT` del v7 (por decidir).

## Datos (puerta F4 de Gobierno de Datos)

- Tabla de outbox: el v7 trae `INTG_OUTBOX_EVENT` (fragmento INTEGRATION-HUB, registro durable de cada intento de envío hacia un sistema externo, outbox genérico); por confirmar si sirve para los eventos del servicio o si ATC crea una propia; dueño = el módulo que escribe el evento.
- Linaje: cambio de negocio → fila de outbox → bus de eventos.
- PII: solo referencias.
- Reglas de calidad (F10): eventos pendientes de publicar y antigüedad del más viejo.

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v3 de Jesús Chávez Elías en Nexora; actualizado por Brayan con IA (Claude, 2026-10-21) a la v1.3 del PO: línea de conflicto abierto con el ADR-01 del PO (deriva del stack del ADR-012). — Revisado por: (pendiente) · Aprueba: TL
