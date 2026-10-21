---
id: "HU-ATC-067"
tipo: hu
titulo: "Ver el proceso de atención en un visor 3D (operación en vivo)"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-25", "EP-ATC-09"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-067 — Ver el proceso de atención en un visor 3D (operación en vivo)

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-09 / FT-ATC-25
- Como supervisor ATC quiero ver en vivo, como una sede en 3D, cómo entran los tickets, a qué área van y cuáles están por vencer para detectar dónde se acumulan los casos y reasignar antes de que venza el SLA.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-067 | Debe | 10 h con IA | Dev 3 (Michel) | 1 | 23-oct-2026 → 27-oct-2026 | Pendiente DoR |

**Requerimiento de origen:** El sistema debe mostrar en un visor 3D isométrico la sede de atención con sus áreas, los tickets entrando por los canales, pasando por la bandeja orquestadora y moviéndose al área de su flujo con su color de SLA, y el detalle de cada área y de cada ticket. Propuesta PO v1.3 · prototipo «visor del proceso 3d» (Operación en vivo)

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Escena de la sede (agregado por PO · prototipo «visor del proceso 3d»)
  Dado las áreas configuradas en los flujos (HU-043), por ejemplo Atención Eje 1, Cobranza, Libro de Reclamaciones, Postventa, Legal Eje 3, Proyecto y Entrega Fest, Sala de Comité y Cierre en Mi Portal
  Cuando abro «Operación en vivo»
  Entonces veo cada área como un espacio de la sede con su nombre, gestores ocupados sobre el total y tickets en cola, y los canales de recepción (teléfono, WhatsApp, web y QR) como entradas.

Escenario: CA-02 · Recorrido del ticket (agregado por PO · prototipo «visor del proceso 3d»)
  Dado que entra un ticket por un canal
  Cuando llega a la bandeja orquestadora
  Entonces se ve como una caja del color de su tipo que la bandeja ordena por rayo, SLA y prioridad y que se mueve al área que indica su flujo.

Escenario: CA-03 · Color del SLA (agregado por PO · prototipo «visor del proceso 3d»)
  Dado tickets en atención
  Cuando cambia el tiempo restante de su SLA
  Entonces cada ticket se ve verde (holgado), naranja (en riesgo) o rojo (vencido); al vencer, el registro de actividad muestra el correo al líder (con copia) y el caso aparece en la Sala de Comité.

Escenario: CA-04 · Panel del área (agregado por PO · prototipo «visor del proceso 3d»)
  Dado la escena cargada
  Cuando toco un área
  Entonces veo en un panel: en cola, gestores ocupados, resueltos y % en SLA, la lista de sus tickets y la carga de cada gestor con la reasignación por carga (HU-046).

Escenario: CA-05 · Seguimiento del ticket (agregado por PO · prototipo «visor del proceso 3d»)
  Dado la escena cargada
  Cuando toco un ticket
  Entonces veo su línea de tiempo (registrado, en bandeja, asignado, en atención, resuelto y cerrado) con hora de cada paso, el SLA consumido y el CSAT si ya fue cerrado.

Escenario: CA-06 · Indicadores y actividad (agregado por PO · prototipo «visor del proceso 3d»)
  Dado que abro el visor
  Cuando carga la escena
  Entonces veo arriba los tickets activos, los resueltos en SLA frente a la meta del 90 % y el CSAT del día, y a la derecha el registro de actividad con la hora de cada evento.

Escenario: CA-07 · Filtro y permisos (agregado por PO · prototipo «visor del proceso 3d»)
  Dado que filtro por razón social o tengo permiso solo para algunas áreas
  Cuando aplico el filtro
  Entonces el visor muestra solo esas áreas y tickets; los demás no aparecen (RN-SVC-036).

Escenario: CA-08 · Tiempo real (agregado por PO · prototipo «visor del proceso 3d»)
  Dado un cambio de estado en la bandeja
  Cuando ocurre
  Entonces el visor lo refleja en 5 s o menos sin recargar la página; pausa y velocidad (x1, x2) solo existen en el modo simulación.

Escenario: CA-09 · Vista alternativa (agregado por PO · prototipo «visor del proceso 3d»)
  Dado un equipo sin aceleración gráfica o un usuario con lector de pantalla
  Cuando abro el visor
  Entonces puedo cambiar a una vista 2D en lista con la misma información por área.

Escenario: CA-10 · Equipo, no individuos (agregado por PO · prototipo «visor del proceso 3d»)
  Dado que el equipo resuelve tickets dentro del SLA
  Cuando se actualiza el marcador
  Entonces suben el nivel y los puntos del equipo; no se muestra ranking individual entre gestores.
```

## Reglas de negocio

- RN-SVC-031 prioridad rayo controlada
- RN-SVC-033 reasignación por menor carga
- RN-SVC-035 aviso al líder
- RN-SVC-036 permisos

**Fuera de alcance:** Editar flujos o reasignar desde el visor (se hace en la bandeja); realidad virtual; ranking individual.

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo Aybar Atiende v2.0 › Operación en vivo (archivo «visor del proceso 3d»)
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): Eventos ticket.created, ticket.assigned, ticket.status_changed, sla.breached por WebSocket (ADR-10) · ENT-SVC-014 SVC_WORKFLOW_DEFINITION · MAE_AREA
- Datos de prueba / analítica (PLT-04): Evento visor3d_abierto {areas, filtro} · datos de prueba: 9 áreas, 71 tickets activos, 3 gestores por área Preguntas abiertas ¿Qué áreas forman la sede del piloto y quién las ordena? ¿El visor se proyecta en una pantalla de la sala de operaciones?
- Entidades que LEE / ESCRIBE: (pendiente de detallar con `docs/datos/`)
- Migración / backfill / borrado: (pendiente)

## Diagramas (PLT-04, sección 6)

- 6.1 Diagrama de estados · ticket en el visor 3D
- 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar)
- 6.3 Diagrama de procesos TO-BE · situación objetivo
- 6.4 Diagrama de secuencia · actualización en vivo del visor
- 6.5 Diagrama entidad-relación · datos que alimentan el visor

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-04 v1.3), sin cambiar su contenido — Revisado por: (pendiente)
