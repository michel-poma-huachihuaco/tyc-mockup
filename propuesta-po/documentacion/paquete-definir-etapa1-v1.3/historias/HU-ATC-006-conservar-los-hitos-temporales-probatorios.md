---
id: "HU-ATC-006"
tipo: hu
titulo: "Conservar los hitos temporales probatorios"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-02", "EP-ATC-01"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-006 — Conservar los hitos temporales probatorios

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-01 / FT-ATC-02
- Como supervisor ATC quiero que el ticket guarde la primera respuesta, la primera resolución, la última resolución y el cierre para medir el cumplimiento del SLA incluso si el ticket se reabre.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-006 | Debe | 3 h con IA | Dev 1 (Brayan) | 1 | 23-oct-2026 → 26-oct-2026 | Pendiente DoR |

**Requerimiento de origen:** El sistema debe registrar 1.ª respuesta, 1.ª resolución (inmutable), última resolución y cierre.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Reapertura
  Dado un ticket resuelto que se reabre
  Cuando se resuelve de nuevo
  Entonces FirstResolvedDateTime conserva la primera fecha y ResolvedDateTime refleja el último ciclo.

Escenario: CA-02 · Cierre
  Dado un ticket resuelto
  Cuando pasa a CLOSED
  Entonces se registra ClosedDateTime y ya no se modifica salvo que se reabra.
```

## Reglas de negocio

- RN-SVC-002 compromisos congelados
- RN-SVC-007 reapertura

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo › Detalle de ticket (Compromisos SLA)
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): Campos de SVC_TICKET
- Datos de prueba / analítica (PLT-04): Sin evento específico; datos de prueba: 2 razones sociales, 3 tipos de ticket y 1 feriado.
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
