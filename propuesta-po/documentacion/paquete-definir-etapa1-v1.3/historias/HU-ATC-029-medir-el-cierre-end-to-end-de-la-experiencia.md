---
id: "HU-ATC-029"
tipo: hu
titulo: "Medir el cierre end-to-end de la experiencia"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-04", "EP-ATC-02", "HU-ATC-003"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-029 — Medir el cierre end-to-end de la experiencia

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-02 / FT-ATC-04
- Como coordinador CX quiero ver cuánto lleva cada ticket de punta a punta y recibir alerta antes de las 72 horas hábiles para cerrar la experiencia a tiempo.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-029 | Debe | 3 h con IA | Dev 2 (Jesús) | 1 | 26-oct-2026 | Pendiente DoR |

**Responsable:** Dev 2 · Jesus Chavez Elias (PLT-01/PLT-04)

**Depende de:** HU-ATC-003 (RF-SVC-003 es predecesora de RF-SVC-029, PLT-03) · Dependencias externas: DEP-03 (matriz SLA por tipo y prioridad; PLT-03 y PLT-05), DEP-04 (calendario MAE_TIME y MAE_HOLIDAY; PLT-03)

**La necesitan:** HU-ATC-019, HU-ATC-026

**Requerimiento de origen:** El sistema debe medir el cierre end-to-end y alertar al acercarse a 72 horas hábiles sin escalamiento o al plazo del eje si hay escalamiento.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Sin escalamiento
  Dado un ticket en Eje 2 sin escalar
  Cuando transcurren 72 horas hábiles sin cierre
  Entonces se marca en riesgo de incumplimiento.

Escenario: CA-02 · Con escalamiento
  Dado un ticket escalado a Eje 3
  Cuando se mide su cierre
  Entonces se compara contra el plazo del eje y no contra las 72 horas.
```

## Reglas de negocio

- RN-SVC-025

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo › Torre de Control
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): SVC_TICKET, MAE_SLA_POLICY
- Datos de prueba / analítica (PLT-04): Métrica tiempo_cierre_e2e
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
