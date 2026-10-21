---
id: "HU-ATC-016"
tipo: hu
titulo: "Dar seguimiento a apelaciones internas y ante INDECOPI"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-06", "EP-ATC-03"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-016 — Dar seguimiento a apelaciones internas y ante INDECOPI

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-03 / FT-ATC-06
- Como responsable legal de reclamos quiero registrar la apelación del consumidor, su número de caso y la resolución para dar seguimiento hasta la resolución final.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-016 | Debe | 3 h con IA | Dev 1 (Brayan) | 2 | 28-oct-2026 → 29-oct-2026 | Pendiente DoR |

**Requerimiento de origen:** El sistema debe gestionar apelaciones con estados PENDING … WITHDRAWN, número de caso y resolución de INDECOPI, con historial.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Resolución INDECOPI
  Dado una apelación ante INDECOPI
  Cuando se resuelve
  Entonces registro IndecopiCaseNumber, fecha y resumen de la resolución.

Escenario: CA-02 · Historial
  Dado una apelación con varios estados
  Cuando la consulto
  Entonces veo cada estado con fecha y autor.

Escenario: CA-03 · Desistimiento (agregado por el PO)
  Dado que el consumidor desiste
  Cuando registro WITHDRAWN
  Entonces la apelación queda cerrada y el ticket no puede volver a apelarse por la misma respuesta.
```

## Reglas de negocio

- RN-SVC-010

**Fuera de alcance:** Escritos y audiencias del procedimiento.

## Pantalla (`ui: true`)

- Referencia del PLT-04: Por diseñar: Libro › Apelaciones
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): ENT-SVC-012/013 SVC_COMPLAINT_APPEAL(+_STATUS_LOG)
- Datos de prueba / analítica (PLT-04): Evento apelación_estado
- Entidades que LEE / ESCRIBE: (pendiente de detallar con `docs/datos/`)
- Migración / backfill / borrado: (pendiente)

## Diagramas (PLT-04, sección 6)

- 6.1 Diagrama de estados · apelación
- 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar)
- 6.3 Diagrama de procesos TO-BE · situación objetivo
- 6.4 Diagrama de secuencia · registro de apelación
- 6.5 Diagrama entidad-relación · apelaciones

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-04 v1.3), sin cambiar su contenido — Revisado por: (pendiente)
