---
id: "ADR-013"
tipo: "adr"
titulo: "ADR-013: Outbox transaccional para publicar eventos sin perderlos"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.4"
owner: "Jesús Chávez Elías"
aprobadores: [tech_lead]
fecha: "2026-10-26"
relacionados: [ADR-001, ADR-005, ADR-010, ADR-012, ADR-014]
tags: [adr, arquitectura, g3]
---

# ADR-013: Outbox transaccional para publicar eventos sin perderlos

- Estado: propuesto
- Ticket: AYB-0001 · Versión 0.4 · Fecha: 2026-10-26 (historial al final)
- Owner: Jesús Chávez Elías (Dev 2) · Aprueba: Líder Técnico (`aprobadores: [tech_lead]`) · Revisado por: (pendiente)
- Compatibilidad con M0 (Arquitectura de Directorio): **requiere dispensa (solicitada)**. El Líder Técnico la pidió a Enrique Albán (Data Chief) el 22-oct-2026; M0 no está en el repositorio ni en Nexora (P-005).
- Origen: decisión DT-02 del Líder Técnico (Jose Jara, 22-oct-2026): CQRS completo desde la Etapa 1, con el outbox construido en el servicio porque el SDK no lo trae; el proyector del servicio es el único que escribe en el almacén de lectura. Registrada en `analisis/decisiones.md` v0.6.

> Las condiciones de la revisión del 22-oct para este ADR son tres: usar `INTG_OUTBOX_EVENT` del v7 y, si no sirve, presentar la tabla propia como cambio al v7; estimar las horas; nombrar los eventos con el formato de tópico del SDK. Las tres se resuelven en la sección «Decisión» (puntos 6, 7 y 9).

## Contexto

El patrón del SDK (skill `aybar-cqrs`) escribe en PostgreSQL, publica un evento por Kafka y un proyector actualiza el almacén de lectura. El commit y el envío **no son atómicos**: si el sistema se cae entre los dos pasos, el evento se pierde y la vista de lectura queda atrás sin error visible.

El SDK **no trae outbox ni proyector** (skills `aybar-outbox` y `aybar-estado-del-sdk`, NO IMPLEMENTADO; el contrato de `aybar-starter-messaging` dice que la proyección vive en el servicio). Lo que existe es `AybarEventProducer`, con validación del tópico, cabeceras corporativas, cola de errores y reintento acotado, pero sin garantía de entrega si falla el proceso.

## Opciones evaluadas

| Opción | Por qué no | Qué la haría reconsiderar |
|---|---|---|
| Publicar después del commit, sin outbox (`AFTER_COMMIT`) | No garantiza la entrega: un fallo entre el commit y el envío pierde el evento. | Que se acepte el riesgo **por escrito** en un ADR. |
| Doble commit a mano PostgreSQL + Kafka | La skill lo prohíbe: es frágil y deja mensajes huérfanos. | — |
| Esperar al outbox del SDK | Es diseño aprobado sin código en el jar; no hay fecha. | Que el SDK lo publique antes de construirlo. |
| Usar `INTG_OUTBOX_EVENT` del v7 | No cumple las condiciones del punto 6. | Que Gobierno de Datos la generalice para eventos internos de un servicio. |

## Decisión

Se construye un **outbox transaccional en el servicio** (DT-02), no en el SDK:

1. En la **misma transacción** de escritura se inserta una fila de outbox con el evento.
2. Un **publicador** lee las filas pendientes por orden de creación y publica cada una con `AybarEventProducer`. **Marca la fila como publicada solo cuando el `CompletableFuture` que devuelve `publish` termina bien**, es decir, cuando el broker confirmó el envío. Si termina con error, suma `AttemptCount`, deja la fila pendiente y la reintenta en la siguiente pasada; a los 5 intentos la marca `FAILED` y salta la alerta de antigüedad (Q-007). Antes de cada `publish` pone en el MDC los valores de la fila (`CorrelationID`, `CompanyID` y `UserAccountID`) y los limpia después, porque `AybarEventProducer` toma de ahí las cabeceras `X-Correlation-Id`, `companyId` y `userAccountId`. Corre como tarea programada con ShedLock (ADR-005, DT-08) **cada 1 segundo** (propuesta del equipo), para sostener el retraso máximo de 5 s del almacén de lectura (ADR-012).
3. **Entrega al menos una vez.** Un evento puede llegar repetido: los consumidores (proyector, notificaciones, KPI, visor 3D, Mi Portal) son **idempotentes** por el identificador del evento (`evento`, el `OutboxEventID`).
4. El puerto `Outbox` lo declara el servicio en su dominio; el adaptador va en `adapters.outbound.persistence.postgres`.
5. Los eventos llevan **solo referencias**, nunca texto libre ni datos personales: `aybar-starter-messaging` solo admite `PartyRef`, `RefCatalogo`, `RefEntidad`, `Long`, `Integer`, `Boolean`, `Instant` o `enum` en el payload y rechaza un `String`. El proyector completa el detalle desde PostgreSQL.
6. **La tabla: `INTG_OUTBOX_EVENT` no sirve; se presenta `SVC_OUTBOX_EVENT` como cambio al v7.** Se verificó en el libro del modelo v7 (`AybarCorp_Modelo_Entidad_Relacion_v7.xlsx`: hoja «Entidades», fila de `INTG_OUTBOX_EVENT`; hoja «Claves», sus claves; hoja «Integridad fisica», su partición) contra las cinco condiciones de la v0.2:

   | Condición | `INTG_OUTBOX_EVENT` (fragmento 18, INTEGRATION-HUB) | ¿Cumple? |
   |---|---|---|
   | Guarda tipo de evento, agregado y carga con solo referencias | El tipo de evento es una lista «específica de cada integración» (`INTG_OUTBOX_EVENT_TYPE`) y la carga va por ruta a almacenamiento de objetos (`RequestPayloadPath`, `ResponsePayloadPath`); sus claves no incluyen el agregado | No |
   | Guarda estado, intentos y fechas | Estado `QUEUED`, `PROCESSING`, `SENT`, `ACKNOWLEDGED`, `FAILED`, `DEAD_LETTER`; intentos en `INTG_OUTBOX_EVENT_ATTEMPT_LOG`; partida por `EventDateTime` | Sí |
   | Se lee por orden de creación con un índice por estado | Partida por rango de `EventDateTime` con PK (`OutboxEventID`, `EventDateTime`); no declara índice por estado | Parcial |
   | ATC la escribe dentro de su transacción | Es de otro fragmento (P-014) y cada fila exige `ExternalSystemID` → `MAE_EXTERNAL_SYSTEM_INTEGRATION`: es para envíos a un sistema **externo**, y el bus interno de ATC no lo es | No |
   | No se comparte de forma que el volumen de ATC la sature | «Alto volumen», compartida por todas las integraciones y firmada fila a fila (`IntegrityHash`) | No |

   **`SVC_OUTBOX_EVENT`** (propuesta, en el fragmento SERVICE, con las convenciones del v7): `OutboxEventID` (PK, entero), `TicketID` (FK a `SVC_TICKET`; los 5 eventos son de un ticket), `CompanyID` (FK a `ORG_COMPANY`), `EventTypeListID` + `EventTypeID` (contra `MAE_GENERIC_LIST_VALUE`, lista nueva `SVC_OUTBOX_EVENT_TYPE` con los 5 tipos del punto 9), `PayloadJson` (solo referencias), `CorrelationID`, `UserAccountID` (el `user_account_id` del token de quien hizo el cambio; nulo cuando el evento lo origina un job), `PublishStatusListID` + `PublishStatusID` (`PENDING`, `PUBLISHED`, `FAILED`), `AttemptCount`, `CreatedDateTime` y `PublishedDateTime`; índice parcial por (`CreatedDateTime`) sobre las filas `PENDING`. Es una tabla técnica sin datos personales y sin `IntegrityHash` (se purga a los 7 días). Se presenta a Gobierno de Datos como cambio al v7 (P-031); ya figura en el hallazgo H-12 del acta F4.
7. **Horas** (estimación del 26-oct, tabla del ADR-012; P-025): outbox 6 h, publicador 6 h, configuración del bus 6 h; con el proyector (10 h), **28 h**.
8. **Retención:** las filas publicadas se conservan 7 días y se purgan con un job (propuesta del equipo).
9. **Tópicos con el formato del SDK.** `aybar-starter-messaging` exige `aybar.<fragmento>.<evento>` en minúsculas y lo valida al publicar (`MessagingValidations`: `aybar\.[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*`). El fragmento es `service` (SERVICE del v7); el evento va en inglés, como los módulos (ADR-001):

   | Tópico | Nombre lógico (PLT-05, historias y backlog) | Se publica cuando | Historias | Consumidores |
   |---|---|---|---|---|
   | `aybar.service.ticket_created` | `ticket.created` | Se registra un ticket por cualquier canal | HU-001, HU-059, HU-060, HU-064 | proyector, visor 3D |
   | `aybar.service.ticket_assigned` | `ticket.assigned` | Se asigna, deriva o reasigna | HU-007, HU-008, HU-046 | proyector, correo de asignación (HU-055), visor 3D |
   | `aybar.service.ticket_status_changed` | `ticket.status_changed` y `ticket.closed` | Cambia el estado, incluido el cierre y la reapertura | HU-004, HU-011, HU-066 | proyector, aviso al cliente (HU-065), encuesta al cerrar (HU-019), KPI (DEP-10), visor 3D |
   | `aybar.service.ticket_updated` | — (nuevo) | Otro cambio que altera una vista: interacción, rayo, señal de conflicto, actividad, handoff o nota de estado | HU-005, HU-026, HU-027, HU-028, HU-043, HU-045 | proyector, visor 3D |
   | `aybar.service.sla_breached` | `sla.breached` | Se registra una alerta de incumplimiento | HU-010, HU-023 | proyector, alertas, KPI, visor 3D |

   Cada tópico tiene su cola de errores con el sufijo del SDK (`aybar.messaging.dlq-suffix`, por defecto `.DLQ`). La clave del mensaje es `ticket_` más el `TicketID` en grupos de 4 dígitos separados por `_`, contados desde la derecha (`ticket_42`, `ticket_1_2345_6789`), para conservar el orden por ticket. Así cumple la regla de `aybar-starter-messaging` para claves (`[A-Za-z][A-Za-z0-9_]{0,63}`, sin 8 dígitos seguidos, que tendrían forma de DNI; `MessagingValidations`) con cualquier `TicketID`. Las cabeceras son las del SDK (`X-Correlation-Id`, `companyId`, `userAccountId`, `servicio`), con los valores de la fila (punto 2): en un evento de un job, `userAccountId` va vacío.
10. **Capacidad del bus.** Los 5 tópicos y sus 5 colas `.DLQ` son 10 event hubs, y Event Hubs Standard admite **10 event hubs por espacio de nombres** («Number of event hubs per namespace»: 10 en Basic y Standard; `https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-quotas`). Por eso cada ambiente tiene un **espacio de nombres exclusivo de ATC** (ADR-014), sin tópicos de otros servicios, y llega justo al límite. Un tópico más pide un cambio de este ADR: un segundo espacio de nombres Standard (otros USD 87,60 al mes por ambiente) o el nivel Premium (100 event hubs por unidad de procesamiento). Los grupos de consumidores no son límite: Standard admite 1.000 grupos de Kafka por espacio de nombres (misma página). El protocolo Kafka está disponible en Standard («supported only in the standard, premium, and dedicated tiers», `https://learn.microsoft.com/en-us/azure/event-hubs/azure-event-hubs-apache-kafka-overview`).

## Consecuencias

- Obliga a:
  - Construir el outbox, su tabla y el publicador **dentro del plan de capacidad** (28 h con el proyector y el bus; P-025).
  - Consumidores idempotentes y vigilar el retraso de publicación.
  - Resolver la autenticación del broker en Azure Event Hubs (SASL; ADR-014, P-032), el control de salud del broker (el kit lo retiró) y la concurrencia del consumidor (`spring.kafka.listener.concurrency` no debe superar las particiones del tópico).
  - Presentar `SVC_OUTBOX_EVENT` y la lista `SVC_OUTBOX_EVENT_TYPE` a Gobierno de Datos antes de la primera migración (P-031).
- Impide:
  - Confiar en que «se publicó» solo porque el commit terminó.
  - Eventos con texto libre o datos personales, y tópicos fuera del formato del SDK.
- Cuesta: **28 h** con el proyector y el bus (punto 7; P-025) y **USD 87,60 al mes por ambiente** de Azure Event Hubs Standard (una unidad de rendimiento y el medidor «Standard Kafka Endpoint» de la lista de precios), **USD 350,40 en los 4 ambientes** (`arquitectura/costo-cloud.md` v0.4, §1.1 y §3: API pública de precios de Azure del 26-oct-2026, USD por mes, Brazil South; supuestos en P-044). La tabla del outbox vive en la base ya costeada.

## Datos (puerta F4 de Gobierno de Datos)

- Tabla de outbox: `SVC_OUTBOX_EVENT`, cambio al v7 (P-031); `INTG_OUTBOX_EVENT` no se usa (punto 6). Es una tabla técnica: su dueño de dato es el que designe Gobierno de Datos para las tablas de ATC (`datos/registro-de-tablas.md`, H-01 del acta F4).
- Linaje: cambio de negocio → fila de outbox → bus de eventos → proyector → almacén de lectura.
- PII: solo referencias.
- Reglas de calidad (F10, Q-007): eventos pendientes de publicar y antigüedad del más viejo. **Umbral propuesto:** atención cuando el más viejo supere 5 s y crítico a 10 s, igual que el retraso máximo del almacén de lectura (ADR-012, Q-006); el Líder Técnico lo confirma.

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-19 | Jesús Chávez Elías, con IA | Borrador con la tabla «por decidir» |
| 0.1 (v4 en Nexora) | 2026-10-21 | Brayan, con IA | Línea de conflicto abierto con el ADR-01 del PO |
| 0.2 | 2026-10-22 | Jesús Chávez Elías, con IA | Alineado con DT-02: publicador con ShedLock, entrega al menos una vez, condiciones para usar `INTG_OUTBOX_EVENT` o una tabla propia, umbrales propuestos. Los nombres de tópico quedan pendientes del formato del SDK |
| 0.3 | 2026-10-26 | Brayan Hurtado, con IA | `INTG_OUTBOX_EVENT` verificada en el libro del v7: no sirve; `SVC_OUTBOX_EVENT` como cambio al v7 con sus columnas; horas (28 h con proyector y bus); los 5 tópicos con el formato del SDK `aybar.<fragmento>.<evento>` (estaba en `aybar-starter-messaging`), colas `.DLQ`, clave y cabeceras; costo con número y fuente |
| 0.4 | 2026-10-26 | Brayan Hurtado, con IA | Segunda revisión del Líder Técnico: la fila se marca publicada solo cuando el broker confirma (`CompletableFuture`), con reintento y `FAILED`; columna `UserAccountID` y cabeceras desde la fila por el MDC; clave del mensaje que cumple la regla del SDK con cualquier `TicketID` (ya no remite a P-032); capacidad del bus verificada en Microsoft Learn (10 event hubs por espacio de nombres Standard: espacio exclusivo de ATC por ambiente); una sola cifra de costo, con los 4 ambientes |
| 0.4 | 2026-10-26 | Brayan Hurtado, con IA | Barrido de coherencia (misma versión, sin cambio de decisión): el origen cita `analisis/decisiones.md` v0.6, la versión vigente (decía v0.5). |

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v4 de Nexora; reescrito con IA (Claude, 2026-10-22) a partir de la revisión del Líder Técnico del 22-oct y actualizado con IA (Claude, 2026-10-26). — Revisado por: (pendiente) · Aprueba: TL
