---
id: "HU-ATC-011"
tipo: hu
titulo: "Reabrir un ticket con un nuevo compromiso sin borrar el original"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-04", "EP-ATC-02", "HU-ATC-010"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-011 — Reabrir un ticket con un nuevo compromiso sin borrar el original

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-02 / FT-ATC-04
- Como supervisor ATC quiero que al reabrir un ticket se calcule un nuevo compromiso con la política vigente para vigilar el ciclo actual sin perder la evidencia del primer compromiso.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-011 | Debe | 3 h con IA | Dev 2 (Jesús) | 1 | 26-oct-2026 | Pendiente DoR |

**Responsable:** Dev 2 · Jesus Chavez Elias (PLT-01/PLT-04)

**Depende de:** HU-ATC-010 (RF-SVC-010 es predecesora de RF-SVC-011, PLT-03) · Dependencias externas: DEP-03 (matriz SLA por tipo y prioridad; PLT-03 y PLT-05), DEP-04 (calendario MAE_TIME y MAE_HOLIDAY; PLT-03)

**La necesitan:** ninguna

**Requerimiento de origen:** El sistema debe soportar la reapertura con ReopenCount y un nuevo vencimiento calculado con la política vigente, conservando el original.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Nuevo compromiso
  Dado un ticket cerrado que se reabre
  Cuando se calcula ReopenedResolutionDueDateTime
  Entonces el vencimiento original no se reescribe y las alertas evalúan el nuevo.

Escenario: CA-02 · Contador
  Dado un ticket reabierto dos veces
  Cuando consulto el ticket
  Entonces ReopenCount = 2 y cada ciclo tiene sus propias alertas.
```

## Reglas de negocio

- RN-SVC-007 reapertura
- RN-SVC-008

**Fuera de alcance:** Límite máximo de reaperturas (por definir).

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo › Detalle › «Cambiar estado: Reabierto»
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): SVC_TICKET, SVC_SLA_BREACH_ALERT
- Datos de prueba / analítica (PLT-04): Evento ticket_reabierto {ciclo}
- Entidades que LEE / ESCRIBE: (pendiente de detallar con `docs/datos/`)
- Migración / backfill / borrado: (pendiente)

## Diagramas (PLT-04, sección 6)

- 6.1 Diagrama de estados · compromiso SLA del ciclo
- 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar)
- 6.3 Diagrama de procesos TO-BE · situación objetivo
- 6.4 Diagrama de secuencia · congelamiento y alerta de SLA
- 6.5 Diagrama entidad-relación · política y alertas

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-04 v1.3), sin cambiar su contenido — Revisado por: (pendiente)

Actualizado el 26-oct-2026 por Brayan Hurtado con IA (Claude): responsable y dependencias explícitas. — Revisado por: (pendiente)
