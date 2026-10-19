---
id: "HU-ATC-006"
tipo: hu
titulo: "Conservar los hitos temporales probatorios"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-02", "EP-ATC-01", "AYB-0001"]
tags: [hu]
ui: false
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-006-conservar-hitos-temporales-probatorios.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-01 / docs/analisis/BRD.md
- Como supervisor ATC quiero que el ticket guarde la primera respuesta, la primera resolución, la última resolución y el cierre para medir el cumplimiento del SLA incluso si el ticket se reabre.
- Requerimiento origen (RF-SVC-006 — Conservar hitos temporales probatorios): El sistema debe registrar 1.ª respuesta, 1.ª resolución (inmutable), última resolución y cierre. · Proceso: PROC-SVC-002 (Atencion y resolucion) · Fuente: PLT-04 · HU-ATC-006 · traza RF-SVC-006
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Salida 30-oct-2026
- Planificación (PLT-04 v1.2): Prioridad: **DEBE** · Iteración: **I1** · Estimación: **3 h** · Asignado: **Dev 1** (2026-10-22 → 2026-10-22) · Depende de HU: HU-ATC-004
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · ciclo de vida del ticket | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · cambio de estado e interacción | 6.5 Diagrama entidad-relación · estado, interacciones e hitos
- Referencia visual / plantilla en prototipo: Prototipo › Detalle de ticket (Compromisos SLA) [P-03 "Detalle de ticket"]

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Conservar los hitos temporales probatorios

Escenario: CA-01 · Reapertura
  Dado un ticket resuelto que se reabre
  Cuando se resuelve de nuevo
  Entonces FirstResolvedDateTime conserva la primera fecha y ResolvedDateTime refleja el último ciclo.

Escenario: CA-02 · Cierre
  Dado un ticket resuelto
  Cuando pasa a CLOSED
  Entonces se registra ClosedDateTime y ya no se modifica salvo que se reabra.
```

- Evidencia / prueba esperada (PLT-04): `Sin evento específico; datos de prueba: 2 razones sociales, 3 tipos de ticket y 1 feriado.`

## Reglas de negocio

- RN-SVC-002 (Compromisos congelados): FirstResponseDueDateTime y ResolutionDueDateTime se calculan al abrir y NO se recalculan si la politica cambia despues.
- RN-SVC-007 (Reapertura con nuevo compromiso): REOPENED incrementa ReopenCount y calcula ReopenedResolutionDueDateTime con la politica vigente al reabrir; el compromiso original no se reescribe.

## Datos (CAD-F5)

- Entidades catalogadas (.ods): ENT-SVC-001 SVC_TICKET
- Entidades y dependencias declaradas en PLT-04: Campos de SVC_TICKET
- Entidades/campos que LEE: SVC_TICKET
- Entidades/campos que ESCRIBE o modifica: SVC_TICKET.FirstResponseDateTime, FirstResolvedDateTime, LastResolvedDateTime, ClosedDateTime
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
