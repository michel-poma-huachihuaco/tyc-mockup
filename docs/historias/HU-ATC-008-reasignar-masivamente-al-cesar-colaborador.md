---
id: "HU-ATC-008"
tipo: hu
titulo: "Reasignar masivamente al cesar un colaborador"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["FT-ATC-03", "EP-ATC-02", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-008-reasignar-masivamente-al-cesar-colaborador.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-02 / docs/analisis/BRD.md
- Como supervisor ATC quiero reasignar los tickets pendientes de un colaborador que rota, renuncia o es cesado, generando filas nuevas de asignación sin borrar el rastro anterior, para continuar la atención sin perder la trazabilidad de las asignaciones previas.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Reasignar en bloque los tickets de un colaborador que cesa
  Dado un colaborador con tickets pendientes que cesa
  Cuando el supervisor reasigna en bloque sus tickets a otro colaborador
  Entonces el sistema crea una fila REASSIGNMENT_CESE por cada ticket, sin eliminar el historial anterior
```

## Reglas de negocio

- RN-SVC-006: asignación append-only; los punteros actuales son denormalizados.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `POST /api/v1/tickets/reasignacion-masiva` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades/campos que LEE: SVC_TICKET_ASIGNACION del colaborador que cesa
- Entidades/campos que ESCRIBE o modifica: SVC_TICKET_ASIGNACION (filas nuevas REASSIGNMENT_CESE)
- Migración / backfill / borrado: no
- Checklist CAD-F5: [pendiente - se completa en F4]

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
