---
id: "HU-ATC-043"
tipo: hu
titulo: "Configurar flujos de trabajo de tickets por área"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["FT-ATC-18", "EP-ATC-09", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-043-configurar-flujos-trabajo-tickets-por-area.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-09 / docs/analisis/BRD.md
- Como administrador funcional quiero configurar, sin desarrollo, el flujo de trabajo (workflow) de cada tipo de ticket por área: pasos, estados, responsables, aprobaciones y SLA de cada paso, para adaptar la atención a la forma de trabajo de cada área sin esperar cambios de sistema.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Publicar un flujo nuevo
  Dado un administrador funcional que define un flujo para un tipo de ticket
  Cuando lo publica
  Entonces los tickets nuevos de ese tipo siguen el flujo publicado, sin requerir despliegue
```

## Reglas de negocio

- No aplica regla de negocio adicional a RNF-USA-002 (configurar un flujo en ≤ 1 día hábil).

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `POST /api/v1/flujos` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades/campos que LEE: catálogo de tipos de ticket y áreas
- Entidades/campos que ESCRIBE o modifica: SVC_WORKFLOW_CONFIG (pasos, estados, responsables, aprobaciones, SLA por paso)
- Migración / backfill / borrado: no
- Checklist CAD-F5: [pendiente - se completa en F4]

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
