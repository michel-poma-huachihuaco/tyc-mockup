---
id: "HU-ATC-030"
tipo: hu
titulo: "Monitorear en tiempo real y corregir antes del incumplimiento"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-14", "EP-ATC-07"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-030 — Monitorear en tiempo real y corregir antes del incumplimiento

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-07 / FT-ATC-14
- Como coordinador CX quiero ver en un tablero los tickets activos, SLA, NPS y derivaciones para detectar casos en riesgo y redistribuir la carga antes del incumplimiento.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-030 | Debería | 6 h con IA | Dev 3 (Michel) | 2 | 29-oct-2026 → 30-oct-2026 | Pendiente DoR |

**Requerimiento de origen:** El sistema debe mostrar en tiempo real tickets activos, NPS, tiempos, SLA y derivaciones en curso.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Riesgo
  Dado un ticket con SLA por vencer
  Cuando el tablero lo detecta
  Entonces se marca como caso en riesgo antes del incumplimiento.

Escenario: CA-02 · Redistribución
  Dado un ticket estancado
  Cuando lo reviso en el tablero
  Entonces puedo reasignarlo desde ahí antes de que venza.
```

## Reglas de negocio

- (el PLT-04 no indica reglas para esta HU)

**Fuera de alcance:** Modelos predictivos.

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo › Torre de Control CX
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): SVC_TICKET, SVC_SLA_BREACH_ALERT
- Datos de prueba / analítica (PLT-04): Sin evento específico; datos de prueba: 2 razones sociales, 3 tipos de ticket y 1 feriado.
- Entidades que LEE / ESCRIBE: (pendiente de detallar con `docs/datos/`)
- Migración / backfill / borrado: (pendiente)

## Diagramas (PLT-04, sección 6)

- 6.1 Diagrama de estados · ticket monitoreado en la Torre de Control
- 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar)
- 6.3 Diagrama de procesos TO-BE · situación objetivo
- 6.4 Diagrama de secuencia · tablero e informes
- 6.5 Diagrama entidad-relación · analítica

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-04 v1.3), sin cambiar su contenido — Revisado por: (pendiente)
