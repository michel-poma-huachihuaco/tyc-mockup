---
id: "HU-ATC-021"
tipo: hu
titulo: "Emitir cargo previo y cargo de activación por separado"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-08", "EP-ATC-04", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-021-cargo-previo-activacion-eventos-distintos.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-04 / docs/analisis/BRD.md
- Como gestor de la Mesa de Casos (SGD) quiero emitir un cargo previo al recibir el caso y un cargo de activación aparte para que el SLA de línea arranque solo cuando el caso queda formalmente activado.
- Requerimiento origen (RF-SVC-021 — Cargo previo y cargo de activacion como eventos distintos): El sistema debe emitir el cargo previo de asignación y un cargo de activación separado; el SLA de línea inicia solo con la activación. · Proceso: PROC-SVC-009 (Recepcion multilinea y activacion de casos sensibles (Mesa SGD)) · Fuente: PLT-04 · HU-ATC-021 · traza RF-SVC-021
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Salida 30-oct-2026
- Planificación (PLT-04 v1.2): Prioridad: **DEBE** · Iteración: **I2** · Estimación: **3 h** · Asignado: **Dev 2** (2026-10-27 → 2026-10-27) · Depende de HU: HU-ATC-020
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · caso sensible en la Mesa SGD | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · recepción y activación | 6.5 Diagrama entidad-relación · casos sensibles (por modelar · R-06)

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Emitir cargo previo y cargo de activación por separado

Escenario: CA-01 · Cargo previo
  Dado un caso recién registrado
  Cuando emito el cargo previo
  Entonces el SLA de línea todavía no inicia.

Escenario: CA-02 · Activación
  Dado un caso con cargo previo
  Cuando emito el cargo de activación
  Entonces el reloj del SLA de línea empieza a correr desde ese instante.

Escenario: CA-03 · Limbo (agregado por el PO)
  Dado un caso con cargo previo sin activar por más de 2 días hábiles
  Cuando corre el control
  Entonces aparece en la lista de casos en limbo.
```

- Evidencia / prueba esperada (PLT-04): `Evento caso_activado`

## Reglas de negocio

- RN-SVC-015 (Cargo previo distinto del cargo de activacion): El SLA de un caso no arranca con el cargo previo de asignacion sino con el cargo de activacion formal; un cargo previo sin activacion deja el caso en el limbo.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Prototipo / pantalla de referencia (artefacto): Prototipo › Mesa SGD («Emitir cargo de activación») — Mockups: P-06 "Mesa de Casos SGD" (Caso sensible con matriz de riesgo, escalamiento, vinculados y cierre)
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `POST /api/v1/casos-sensibles/{id}/activacion` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades y dependencias declaradas en PLT-04: Entidad por modelar (R-06)
- Entidades/campos que LEE: SVC_SENSITIVE_CASE
- Entidades/campos que ESCRIBE o modifica: SVC_SENSITIVE_CASE.PreAssignmentChargeDate, ActivationChargeDate
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
