---
id: "ADR-013"
tipo: "adr"
titulo: "ADR-013: Outbox transaccional para publicar eventos sin perderlos"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.2"
owner: "Jesús Chávez Elías"
aprobadores: [tech_lead]
fecha: "2026-10-22"
relacionados: [ADR-001, ADR-005, ADR-012, ADR-014]
tags: [adr, arquitectura, g3]
---

# ADR-013: Outbox transaccional para publicar eventos sin perderlos

- Estado: propuesto
- Ticket: AYB-0001 · Fecha: 2026-10-22
- Compatibilidad con M0 (Arquitectura de Directorio): **requiere dispensa (solicitada)**. El Líder Técnico la pide a Enrique Albán (Data Chief); M0 no está en el repositorio.
- Origen: decisión DT-02 del Líder Técnico (Jose Jara, 22-oct-2026): CQRS completo desde la Etapa 1, con el outbox construido en el servicio porque el SDK no lo trae; el proyector del servicio es el único que escribe en el almacén de lectura. Registrada en `analisis/decisiones.md` v0.3.

> Las condiciones de la revisión del 22-oct para este ADR son tres: usar `INTG_OUTBOX_EVENT` del v7 y, si no sirve, presentar una tabla propia como cambio al v7; estimar las horas; nombrar los eventos con el formato de tópico del SDK. La sección «Decisión» dice qué se hace con cada una y qué sigue sin poder cerrarse.

## Contexto

El patrón del SDK (skill `aybar-cqrs`) escribe en PostgreSQL, publica un evento por Kafka y un proyector actualiza el almacén de lectura. El commit y el envío **no son atómicos**: si el sistema se cae entre los dos pasos, el evento se pierde y la vista de lectura queda atrás sin error visible.

El SDK **no trae outbox ni proyector** (skills `aybar-outbox` y `aybar-estado-del-sdk`, NO IMPLEMENTADO; el contrato de `aybar-starter-messaging` dice que la proyección vive en el servicio). Lo que existe es `AybarEventProducer`, con cola de errores y reintento acotado, pero sin garantía de entrega si falla el proceso.

## Opciones evaluadas

| Opción | Por qué no | Qué la haría reconsiderar |
|---|---|---|
| Publicar después del commit, sin outbox (`AFTER_COMMIT`) | No garantiza la entrega: un fallo entre el commit y el envío pierde el evento. | Que se acepte el riesgo **por escrito** en un ADR. |
| Doble commit a mano PostgreSQL + Kafka | La skill lo prohíbe: es frágil y deja mensajes huérfanos. | — |
| Esperar al outbox del SDK | Es diseño aprobado sin código en el jar; no hay fecha. | Que el SDK lo publique antes de construirlo. |

## Decisión

Se construye un **outbox transaccional en el servicio** (DT-02), no en el SDK:

1. En la **misma transacción** de escritura se inserta una fila de outbox con el evento.
2. Un publicador posterior lee las filas pendientes, publica con `AybarEventProducer` y marca cada fila como publicada. Corre como job con ShedLock (ADR-005, DT-08) y lee por orden de creación; la clave de partición del evento es el identificador del agregado (por ejemplo el ticket), para conservar el orden por ticket. Frecuencia de lectura: **cada 1 segundo (propuesta del equipo)**, para sostener el retraso máximo de 5 s del almacén de lectura (ADR-012).
3. **Entrega al menos una vez.** Un evento puede llegar repetido: los consumidores (proyector, notificaciones, KPI, visor 3D, Mi Portal) son **idempotentes** por el identificador del evento.
4. El puerto `Outbox` lo declara el servicio en su dominio; el adaptador va en `adapters.outbound.persistence.postgres`.
5. Los eventos llevan **solo referencias**, nunca texto libre ni datos personales (el SDK no admite texto libre en el payload). El proyector completa el detalle desde PostgreSQL.
6. **La tabla.** Primera opción: `INTG_OUTBOX_EVENT` del v7 (fragmento INTEGRATION-HUB, «outbox genérico»: registro durable de cada intento de envío hacia un sistema externo). Se usa solo si cumple las cinco condiciones siguientes; si falla alguna, ATC presenta una tabla propia (`SVC_OUTBOX_EVENT`) como **cambio al v7** a Gobierno de Datos:
   - guarda tipo de evento, identificador y tipo del agregado, y la carga con solo referencias;
   - guarda estado pendiente o publicado, número de intentos y fechas de creación y publicación;
   - admite leer por orden de creación con un índice por estado;
   - la puede escribir el servicio de ATC dentro de su transacción (hoy ATC solo escribe en `SVC_*` y `MAE_*`; escribir en otro fragmento es la pendiente P-014);
   - no la comparte con otros equipos de forma que el volumen de ATC la sature.
   **Las columnas de `INTG_OUTBOX_EVENT` no están en los documentos del equipo** (están en los archivos de Drive del v7, P-015): la verificación se hace antes de escribir la primera migración. Hasta entonces, la tabla queda «por confirmar» y no se supone que sirve.
7. **Nombres de los eventos.** Los del PLT-05 y las historias son `ticket.assigned`, `ticket.closed`, `ticket.status_changed` y `sla.breached`. El Líder Técnico pide el formato de tópico del SDK; **ese formato no figura en las skills ni en los contratos del repositorio** (P-032), así que los nombres se mantienen como nombres lógicos hasta que el Líder Técnico o el equipo del SDK lo den.
8. **Retención:** las filas publicadas se conservan 7 días y se purgan con un job (propuesta del equipo).

## Consecuencias

- Obliga a:
  - Construir el outbox, su tabla y el publicador **dentro del plan de capacidad**. Horas: **por estimar por el equipo (P-025)**; el plan del PO deja 9 h de holgura.
  - Consumidores idempotentes y vigilar el retraso de publicación.
  - Resolver la autenticación del broker en Azure Event Hubs (SASL; ADR-014, P-032), el control de salud del broker (el kit lo retiró) y la concurrencia del consumidor (queda en 1; `spring.kafka.listener.concurrency` no debe superar las particiones del tópico).
  - Verificar `INTG_OUTBOX_EVENT` contra las cinco condiciones antes de la primera migración.
- Impide:
  - Confiar en que «se publicó» solo porque el commit terminó.
  - Eventos con texto libre o datos personales.
- Cuesta: horas sin estimar (P-025) y una tabla adicional si `INTG_OUTBOX_EVENT` no sirve. El costo de Event Hubs entra en `arquitectura/costo-cloud.md` cuando haya volúmenes.

## Datos (puerta F4 de Gobierno de Datos)

- Tabla de outbox: `INTG_OUTBOX_EVENT` del v7 si cumple las cinco condiciones; si no, `SVC_OUTBOX_EVENT` como cambio al v7 (P-031). Dueño de dato = el módulo que escribe el evento.
- Linaje: cambio de negocio → fila de outbox → bus de eventos → proyector → almacén de lectura.
- PII: solo referencias.
- Reglas de calidad (F10, Q-007): eventos pendientes de publicar y antigüedad del más viejo. **Umbral propuesto:** atención cuando el más viejo supere 5 s y crítico a 10 s, igual que el retraso máximo del almacén de lectura (ADR-012, Q-006); el Líder Técnico lo confirma.

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-19 | Jesús Chávez Elías, con IA | Borrador con la tabla «por decidir» |
| 0.1 (v4 en Nexora) | 2026-10-21 | Brayan, con IA | Línea de conflicto abierto con el ADR-01 del PO |
| 0.2 | 2026-10-22 | Jesús Chávez Elías, con IA | Alineado con DT-02: publicador con ShedLock, entrega al menos una vez, condiciones para usar `INTG_OUTBOX_EVENT` o una tabla propia, umbrales propuestos. Los nombres de tópico quedan pendientes del formato del SDK |

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v4 de Nexora; reescrito con IA (Claude, 2026-10-22) a partir de la revisión del Líder Técnico del 22-oct. — Revisado por: (pendiente) · Aprueba: TL
