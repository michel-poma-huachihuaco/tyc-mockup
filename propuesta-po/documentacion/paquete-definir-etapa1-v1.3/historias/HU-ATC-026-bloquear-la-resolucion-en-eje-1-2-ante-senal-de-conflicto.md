---
id: "HU-ATC-026"
tipo: hu
titulo: "Bloquear la resolución en Eje 1/2 ante señal de conflicto"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-07", "EP-ATC-04"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-026 — Bloquear la resolución en Eje 1/2 ante señal de conflicto

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-04 / FT-ATC-07
- Como gestor de tickets o gestor de Postventa quiero que el sistema me obligue a derivar a Legal un ticket con carta notarial, INDECOPI, abogado o prensa para que el conflicto no se intente resolver fuera de Eje 3.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-026 | Debe | 3 h con IA | Dev 2 (Jesús) | 1 | 27-oct-2026 | Pendiente DoR |

**Requerimiento de origen:** El sistema debe impedir que un ticket con señal de conflicto permanezca o se resuelva en Eje 1 o Eje 2 y exigir su derivación a Eje 3.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Detección
  Dado un ticket en Eje 2 que recibe una carta notarial
  Cuando se marca la señal de conflicto
  Entonces el sistema bloquea su resolución en Eje 1/2 y exige derivarlo a Eje 3.

Escenario: CA-02 · Gate
  Dado un ticket marcado con conflicto
  Cuando intento cerrarlo en Eje 1/2
  Entonces el sistema lo rechaza como gate no compensable.

Escenario: CA-03 · Marca por error (agregado por el PO)
  Dado una señal marcada por error
  Cuando un supervisor la retira con justificación
  Entonces queda registro del retiro en el historial.
```

## Reglas de negocio

- RN-SVC-021

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo › Nuevo ticket (señales de conflicto) y Detalle (banner)
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): SVC_TICKET
- Datos de prueba / analítica (PLT-04): Evento gate_conflicto
- Entidades que LEE / ESCRIBE: (pendiente de detallar con `docs/datos/`)
- Migración / backfill / borrado: (pendiente)

## Diagramas (PLT-04, sección 6)

- 6.1 Diagrama de estados · ticket con señal de conflicto
- 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar)
- 6.3 Diagrama de procesos TO-BE · situación objetivo
- 6.4 Diagrama de secuencia · gate y handoff a Eje 3
- 6.5 Diagrama entidad-relación · conflicto y handoff

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-04 v1.3), sin cambiar su contenido — Revisado por: (pendiente)
