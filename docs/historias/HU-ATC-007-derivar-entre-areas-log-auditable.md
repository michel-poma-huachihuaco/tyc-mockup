---
id: "HU-ATC-007"
tipo: hu
titulo: "Derivar entre áreas con log auditable"
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

Va en `docs/historias/HU-ATC-007-derivar-entre-areas-log-auditable.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-02 / docs/analisis/BRD.md
- Como gestor de tickets quiero enrutar tickets entre las áreas del flujo (ATC, Cobranza, Legal, Postventa, TI, Administración) y colaboradores, registrando cada movimiento con motivo tipificado en bitácora append-only y pudiendo derivar a un área sin persona asignada, para conservar el rastro completo de quién tuvo el ticket en cada momento.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Derivar un ticket a otra área con motivo
  Dado un ticket en el área ATC
  Cuando el gestor lo deriva a Legal con un motivo tipificado
  Entonces el sistema agrega una fila nueva a la bitácora de asignación sin eliminar las anteriores
```

## Reglas de negocio

- RN-SVC-006: asignación append-only; cada movimiento de área/responsable es fila nueva con motivo tipificado.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `POST /api/v1/tickets/{id}/derivaciones` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades/campos que LEE: SVC_TICKET, catálogo de áreas
- Entidades/campos que ESCRIBE o modifica: SVC_TICKET_ASIGNACION (append-only)
- Migración / backfill / borrado: no
- Checklist CAD-F5: [pendiente - se completa en F4]

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
