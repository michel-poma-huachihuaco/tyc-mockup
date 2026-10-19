---
id: "HU-ATC-022"
tipo: hu
titulo: "Clasificar el riesgo del caso con matriz objetiva"
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

Va en `docs/historias/HU-ATC-022-clasificacion-riesgo-matriz-objetiva-recalibracion.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-04 / docs/analisis/BRD.md
- Como gestor de la Mesa de Casos (SGD) quiero que el nivel de riesgo se calcule con criterios ponderados y pueda recalibrarse para priorizar sin depender de un juicio subjetivo.
- Requerimiento origen (RF-SVC-022 — Clasificacion de riesgo por matriz objetiva y recalibracion): El sistema debe calcular el nivel de riesgo con una matriz objetiva de criterios ponderados y permitir recalibrarlo con registro. · Proceso: PROC-SVC-009 (Recepcion multilinea y activacion de casos sensibles (Mesa SGD)) · Fuente: PLT-04 · HU-ATC-022 · traza RF-SVC-022
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Salida 30-oct-2026
- Planificación (PLT-04 v1.2): Prioridad: **DEBE** · Iteración: **I2** · Estimación: **4 h** · Asignado: **Dev 2** (2026-10-27 → 2026-10-28) · Depende de HU: HU-ATC-020
- Observaciones de alcance: Fuera de alcance: Definición de criterios y pesos (Mesa SGD, R-08).
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · caso sensible en la Mesa SGD | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · recepción y activación | 6.5 Diagrama entidad-relación · casos sensibles (por modelar · R-06)

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Clasificar el riesgo del caso con matriz objetiva

Escenario: CA-01 · Cálculo objetivo
  Dado un caso activado
  Cuando marco los criterios
  Entonces el nivel de riesgo resulta de la matriz y no de un campo de opinión.

Escenario: CA-02 · Recalibración
  Dado un caso de riesgo medio al que se suma un elemento legal
  Cuando recalibro
  Entonces el nivel se actualiza y queda registro de quién, cuándo y por qué.
```

- Evidencia / prueba esperada (PLT-04): `Evento riesgo_recalibrado`

## Reglas de negocio

- RN-SVC-016 (Clasificacion de riesgo objetiva y recalibrable): El nivel de riesgo de un caso se calcula con una matriz objetiva (nunca por percepcion) y se recalibra si el caso evoluciona con nuevos elementos o vinculacion con otros casos.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Prototipo / pantalla de referencia (artefacto): Prototipo › Mesa SGD (matriz de riesgo) — Mockups: P-06 "Mesa de Casos SGD" (Caso sensible con matriz de riesgo, escalamiento, vinculados y cierre)
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `PATCH /api/v1/casos-sensibles/{id}/riesgo` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades y dependencias declaradas en PLT-04: Entidad por modelar (R-06)
- Entidades/campos que LEE: SVC_SENSITIVE_CASE, matriz de criterios ponderados
- Entidades/campos que ESCRIBE o modifica: SVC_SENSITIVE_CASE.RiskLevel, historial de recalibración
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
