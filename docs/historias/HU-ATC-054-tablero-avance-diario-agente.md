---
id: "HU-ATC-054"
tipo: hu
titulo: "Tablero de avance diario del agente"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["FT-ATC-21", "EP-ATC-09", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-054-tablero-avance-diario-agente.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-09 / docs/analisis/BRD.md
- Como gestor de tickets y su líder quiero ver un tablero de avance diario (tickets atendidos, pendientes, cumplimiento de SLA, tiempo medio y CSAT), para seguir la productividad del día y corregir a tiempo.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Ver el avance diario propio
  Dado un gestor de tickets con actividad en el día
  Cuando abre su tablero de avance diario
  Entonces el sistema muestra tickets atendidos, pendientes, cumplimiento de SLA, tiempo medio y CSAT actualizados al momento
```

## Reglas de negocio

- No aplica una regla de negocio adicional a las ya cubiertas por RF-SVC-054.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `GET /api/v1/gestores/{id}/avance-diario` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades/campos que LEE: SVC_TICKET (atendidos, pendientes, SLA), respuestas de encuesta (CSAT)
- Entidades/campos que ESCRIBE o modifica: ninguna (solo lectura)
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
