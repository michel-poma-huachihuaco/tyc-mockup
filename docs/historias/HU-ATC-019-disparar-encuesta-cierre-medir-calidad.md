---
id: "HU-ATC-019"
tipo: hu
titulo: "Disparar encuesta al cierre y medir calidad"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["FT-ATC-13", "EP-ATC-07", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-019-disparar-encuesta-cierre-medir-calidad.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-07 / docs/analisis/BRD.md
- Como supervisor ATC quiero disparar al cierre del ticket la encuesta post-atención POST_TRANSACTION y permitir medir CSAT/CES por tipo de ticket, área y gestor de tickets, para medir la calidad de la atención por tipo de ticket, área y gestor.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Disparar la encuesta al cerrar un ticket
  Dado un ticket que pasa a estado CLOSED
  Cuando el cambio de estado se confirma
  Entonces el sistema dispara la encuesta POST_TRANSACTION y permite ver el CSAT/CES agregado por tipo, área y gestor de tickets
```

## Reglas de negocio

- No aplica una regla de negocio adicional a las ya cubiertas por RF-SVC-019 (disparo al 100% de los CLOSED).

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `GET /api/v1/metricas/csat-ces` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades/campos que LEE: SVC_TICKET, respuestas de encuesta (SVY_SURVEY_RESPONSE)
- Entidades/campos que ESCRIBE o modifica: evento de disparo de encuesta al cierre
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
