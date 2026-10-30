---
id: "HU-ATC-010"
tipo: hu
titulo: "Recibir una sola alerta por incumplimiento de SLA"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-28"
relacionados: ["FT-ATC-04", "EP-ATC-02", "HU-ATC-003"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-010 — Recibir una sola alerta por incumplimiento de SLA

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-02 / FT-ATC-04
- Como supervisor ATC quiero recibir una alerta cuando un ticket incumple su primera respuesta o su resolución para actuar a tiempo sin recibir alertas duplicadas.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-010 | Debe | 5 h con IA | Dev 2 (Jesús) | 1 | 23-oct-2026 → 26-oct-2026 | Pendiente DoR |

**Responsable:** Dev 2 · Jesus Chavez Elias (PLT-01/PLT-04)

**Depende de:** HU-ATC-003 (RF-SVC-003 es predecesora de RF-SVC-010, PLT-03) · Dependencias externas: DEP-03 (matriz SLA por tipo y prioridad; PLT-03 y PLT-05), DEP-04 (calendario MAE_TIME y MAE_HOLIDAY; PLT-03), DEP-16 (Control de acceso, PJ-05; añadida el 28-oct-2026 al revisar las operaciones del contrato: la operación `consultarSla` exige rol del token (`x-roles`; `arquitectura/roles-y-permisos-atc.md` §5))

**La necesitan:** HU-ATC-011

**Requerimiento de origen:** El sistema debe detectar por job FIRST_RESPONSE_OVERDUE y RESOLUTION_OVERDUE y alertar una sola vez por tipo y ciclo.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Sin duplicados
  Dado un ticket que ya alertó FIRST_RESPONSE_OVERDUE en este ciclo
  Cuando el job vuelve a correr
  Entonces no se genera otra alerta de ese tipo.

Escenario: CA-02 · Constancia
  Dado una alerta generada
  Cuando la consulto
  Entonces muestra destinatario, fecha, canal, vencimiento evaluado (EvaluatedDueDateTime) y ciclo.

Escenario: CA-03 · Ticket resuelto (agregado por el PO)
  Dado un ticket resuelto antes de su vencimiento
  Cuando corre el job
  Entonces no se genera alerta.
```

## Reglas de negocio

- RN-SVC-008 alerta única por ciclo

**Fuera de alcance:** Escalamiento a jefaturas (casos sensibles: FT-ATC-09).

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo › Bandeja (chip «En riesgo / vencido»)
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): ENT-SVC-009 SVC_SLA_BREACH_ALERT · job batch
- Datos de prueba / analítica (PLT-04): Evento sla_alerta {tipo, ciclo}
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

Actualizado el 28-oct-2026 (v1.3.1) por Jesús Chávez Elías con IA (Claude): añade la dependencia DEP-16 (operaciones con x-roles o cuenta CUSTOMER de Mi Portal). No cambian criterios de aceptación ni horas. — Revisado por: (pendiente)
