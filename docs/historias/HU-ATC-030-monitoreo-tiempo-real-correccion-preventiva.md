---
id: "HU-ATC-030"
tipo: hu
titulo: "Monitorear en tiempo real y corregir antes del incumplimiento"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-14", "EP-ATC-07", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-030-monitoreo-tiempo-real-correccion-preventiva.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-07 / docs/analisis/BRD.md
- Como coordinador CX quiero ver en un tablero los tickets activos, SLA, NPS y derivaciones para detectar casos en riesgo y redistribuir la carga antes del incumplimiento.
- Requerimiento origen (RF-SVC-030 — Monitoreo en tiempo real y correccion preventiva): El sistema debe mostrar en tiempo real tickets activos, NPS, tiempos, SLA y derivaciones en curso. · Proceso: PROC-SVC-012 (Monitoreo en tiempo real y reporting desde la Torre de Control) · Fuente: PLT-04 · HU-ATC-030 · traza RF-SVC-030
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Salida 30-oct-2026
- Planificación (PLT-04 v1.2): Prioridad: **DEBERIA** · Iteración: **I2** · Estimación: **6 h** · Asignado: **Dev 3** (2026-10-26 → 2026-10-27) · Depende de HU: HU-ATC-019
- Observaciones de alcance: Fuera de alcance: Modelos predictivos.
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · ticket monitoreado en la Torre de Control | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · tablero e informes | 6.5 Diagrama entidad-relación · analítica

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Monitorear en tiempo real y corregir antes del incumplimiento

Escenario: CA-01 · Riesgo
  Dado un ticket con SLA por vencer
  Cuando el tablero lo detecta
  Entonces se marca como caso en riesgo antes del incumplimiento.

Escenario: CA-02 · Redistribución
  Dado un ticket estancado
  Cuando lo reviso en el tablero
  Entonces puedo reasignarlo desde ahí antes de que venza.
```

- Evidencia / prueba esperada (PLT-04): `Sin evento específico; datos de prueba: 2 razones sociales, 3 tipos de ticket y 1 feriado.`

## Reglas de negocio

- No aplica una regla de negocio adicional a las de RNF-USA-001 (NPS-C) y RNF-INT-007 de FT-ATC-14.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Prototipo / pantalla de referencia (artefacto): Prototipo › Torre de Control CX — Mockups: P-08 "Torre de Control CX" (Operación en vivo; Riesgo de denuncia: exposición económica y alerta a Legal (propuesta))
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `GET /api/v1/torre-control/tiempo-real` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades y dependencias declaradas en PLT-04: SVC_TICKET, SVC_SLA_BREACH_ALERT
- Entidades/campos que LEE: SVC_TICKET (activos, SLA, derivaciones), KPI Engine (NPS)
- Entidades/campos que ESCRIBE o modifica: ninguna (solo lectura)
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
