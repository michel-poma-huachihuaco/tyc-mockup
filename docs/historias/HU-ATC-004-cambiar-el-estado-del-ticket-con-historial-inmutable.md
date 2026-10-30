---
id: "HU-ATC-004"
tipo: hu
titulo: "Cambiar el estado del ticket con historial inmutable"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-02", "EP-ATC-01", "HU-ATC-002"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-004 — Cambiar el estado del ticket con historial inmutable

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-01 / FT-ATC-02
- Como colaborador de área quiero cambiar el estado del ticket (abierto, en atención, espera cliente, escalado, resuelto, cerrado, reabierto) para que todos conozcan el estado real y su historial completo.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-004 | Debe | 5 h con IA | Dev 1 (Brayan) | 1 | 22-oct-2026 | Pendiente DoR |

**Responsable:** Dev 1 · Brayan Manuel Hurtado Paucar (PLT-01/PLT-04)

**Depende de:** HU-ATC-002 (FT-ATC-01 es predecesora de FT-ATC-02 y esta es su última HU, PLT-02) · Dependencias externas: DEP-16 (Control de acceso, PJ-05: reemplaza a la DEP-02 de la traza del PLT-03, DT-03)

**La necesitan:** HU-ATC-005, HU-ATC-006

**Requerimiento de origen:** El sistema debe gestionar 7 estados y registrar cada transición con fecha y autor en un historial append-only.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Historial
  Dado un ticket en atención
  Cuando cambio su estado
  Entonces se agrega una fila al STATUS_LOG con fecha y autor y el puntero del ticket se actualiza.

Escenario: CA-02 · Inmutabilidad
  Dado un historial con transiciones
  Cuando alguien intenta editar o borrar una fila
  Entonces la operación se rechaza.

Escenario: CA-03 · Cambio automático (agregado por el PO)
  Dado un cambio realizado por el sistema
  Cuando se registra
  Entonces la fila queda con marca automática en lugar de autor.

Escenario: CA-04 · Transición inválida (agregado por el PO)
  Dado un ticket CLOSED
  Cuando intento pasarlo a IN_PROGRESS sin reabrirlo
  Entonces el sistema lo impide e indica que primero debo reabrirlo.
```

## Reglas de negocio

- RN-SVC-006 append-only
- RN-SVC-023 cierre formal en Mi Portal

**Fuera de alcance:** Estados personalizados por área.

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo › Detalle de ticket (stepper y «Cambiar estado»)
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): ENT-SVC-002 SVC_TICKET_STATUS_LOG · RNF-AUD-004 hash
- Datos de prueba / analítica (PLT-04): Evento ticket_estado {de, a, autor}
- Entidades que LEE / ESCRIBE: (pendiente de detallar con `docs/datos/`)
- Migración / backfill / borrado: (pendiente)

## Diagramas (PLT-04, sección 6)

- 6.1 Diagrama de estados · ciclo de vida del ticket
- 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar)
- 6.3 Diagrama de procesos TO-BE · situación objetivo
- 6.4 Diagrama de secuencia · cambio de estado e interacción
- 6.5 Diagrama entidad-relación · estado, interacciones e hitos

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-04 v1.3), sin cambiar su contenido — Revisado por: (pendiente)

Actualizado el 26-oct-2026 por Brayan Hurtado con IA (Claude): responsable y dependencias explícitas. — Revisado por: (pendiente)
