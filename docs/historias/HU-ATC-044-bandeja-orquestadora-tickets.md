---
id: "HU-ATC-044"
tipo: hu
titulo: "Bandeja orquestadora de tickets"
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

Va en `docs/historias/HU-ATC-044-bandeja-orquestadora-tickets.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-09 / docs/analisis/BRD.md
- Como supervisor y gestores de tickets quiero una bandeja orquestadora que reúne los tickets de todos los canales y los ordena y asigna según flujo, prioridad, marca de rayo y vencimiento de SLA, para trabajar desde una sola bandeja con lo más urgente primero.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Ordenar la bandeja por rayo, SLA y prioridad
  Dado tickets de distintos canales en la bandeja
  Cuando el gestor la abre
  Entonces el sistema los ordena primero por marca de rayo, luego por SLA más próximo a vencer y luego por prioridad
```

## Reglas de negocio

- RN-SVC-031: prioridad rayo controlada.
- RN-SVC-033: reasignación por menor carga.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `GET /api/v1/tickets/bandeja` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades/campos que LEE: SVC_TICKET, SVC_WORKFLOW_CONFIG
- Entidades/campos que ESCRIBE o modifica: ninguna (solo lectura/orden)
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - nomenclatura a reconciliar con docs/datos/diccionario.md: la HU dice 'SVC_WORKFLOW_CONFIG', el diccionario de F4 lo llama 'SVC_WORKFLOW_DEFINITION' (mismo concepto) - desviacion MENOR de CAD-F5 (nomenclatura)

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
