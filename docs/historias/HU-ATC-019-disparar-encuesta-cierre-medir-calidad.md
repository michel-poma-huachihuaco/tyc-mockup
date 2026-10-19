---
id: "HU-ATC-019"
tipo: hu
titulo: "Disparar la encuesta al cerrar el ticket"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-13", "EP-ATC-07", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-019-disparar-encuesta-cierre-medir-calidad.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-07 / docs/analisis/BRD.md
- Como supervisor ATC quiero que al cerrar un ticket se envíe la encuesta y pueda ver CSAT/CES por tipo, área y gestor de tickets para medir la calidad de la atención.
- Requerimiento origen (RF-SVC-019 — Disparar encuesta al cierre y medir calidad): El sistema debe disparar la encuesta POST_TRANSACTION al cerrar el ticket y permitir medir CSAT/CES por tipo, área y gestor de tickets. · Proceso: PROC-SVC-008 (Encuesta post-atencion) · Fuente: PLT-04 · HU-ATC-019 · traza RF-SVC-019
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Salida 30-oct-2026
- Planificación (PLT-04 v1.2): Prioridad: **DEBE** · Iteración: **I2** · Estimación: **3 h** · Asignado: **Dev 3** (2026-10-26 → 2026-10-26) · Depende de HU: HU-ATC-029 · Dependencias externas: DEP-10 (KPI Engine + SVY_SURVEY_RESPONSE (encuestas))
- Observaciones de alcance: Fuera de alcance: Diseño de preguntas.
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · encuesta post-atención | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · disparo de encuesta | 6.5 Diagrama entidad-relación · encuesta

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Disparar la encuesta al cerrar el ticket

Escenario: CA-01 · Disparo
  Dado un ticket que pasa a CLOSED
  Cuando se cierra
  Entonces se registra el envío de la encuesta con puntero polimórfico (SubjectEntityName = 'SVC_TICKET').

Escenario: CA-02 · Medición
  Dado respuestas recibidas
  Cuando consulto los resultados
  Entonces veo CSAT/CES por tipo de ticket, área y gestor de tickets.

Escenario: CA-03 · Reapertura (agregado por el PO)
  Dado un ticket con encuesta respondida que se reabre y se vuelve a cerrar
  Cuando se cierra de nuevo
  Entonces se dispara una nueva encuesta asociada al nuevo ciclo.
```

- Evidencia / prueba esperada (PLT-04): `Evento encuesta_enviada / encuesta_respondida`

## Reglas de negocio

- RN-SVC-007 (Reapertura con nuevo compromiso): REOPENED incrementa ReopenCount y calcula ReopenedResolutionDueDateTime con la politica vigente al reabrir; el compromiso original no se reescribe.
- RNF-INT-004.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Prototipo / pantalla de referencia (artefacto): Prototipo › Torre de Control (CSAT por área) — Mockups: P-08 "Torre de Control CX" (Operación en vivo; Riesgo de denuncia: exposición económica y alerta a Legal (propuesta)), P-17 "Mi Portal del cliente" (Mis solicitudes, detalle y nueva solicitud (móvil))
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `GET /api/v1/metricas/csat-ces` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades catalogadas (.ods): ENT-SVC-001 SVC_TICKET
- Entidades y dependencias declaradas en PLT-04: ENT-SVY-001 SVY_SURVEY_RESPONSE · DEP-10 KPI Engine
- Entidades/campos que LEE: SVC_TICKET, respuestas de encuesta (SVY_SURVEY_RESPONSE)
- Entidades/campos que ESCRIBE o modifica: evento de disparo de encuesta al cierre
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
