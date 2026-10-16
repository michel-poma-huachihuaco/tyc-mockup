---
id: "HU-ATC-033"
tipo: hu
titulo: "Registro del reclamo de garantía vinculado a la entrega"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["FT-ATC-10", "EP-ATC-05", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-033-registro-reclamo-garantia-vinculado-entrega.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-05 / docs/analisis/BRD.md
- Como Gestor de Postventa quiero registrar el reclamo de garantía tipificado (estructural, impermeabilización, acabados o instalaciones) y vinculado obligatoriamente a la entrega de la unidad, para gestionar la postventa sobre el mismo caso que originó la entrega.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Registrar un reclamo de garantía con Acta de Entrega
  Dado una unidad con Acta de Entrega (CONTRACT_UNIT_HANDOVER) registrada
  Cuando el gestor registra un reclamo de garantía tipificado
  Entonces el sistema lo vincula obligatoriamente a esa Acta de Entrega

Escenario: Rechazar un reclamo sin Acta de Entrega
  Dado una unidad sin Acta de Entrega
  Cuando se intenta registrar un reclamo de garantía
  Entonces el sistema lo rechaza
```

## Reglas de negocio

- RN-SVC-027: una garantía siempre cuelga de una entrega previa y solo es procedente dentro del periodo de cobertura.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `POST /api/v1/reclamos-garantia` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades/campos que LEE: CONTRACT_UNIT_HANDOVER (Contratos y Activos)
- Entidades/campos que ESCRIBE o modifica: SVC_WARRANTY_CLAIM (tipo de defecto, vínculo al Acta de Entrega)
- Migración / backfill / borrado: no
- Checklist CAD-F5: Rechazado - CONTRACT_UNIT_HANDOVER (el Acta de Entrega) es una entidad de otro dominio (Postventa/Contratos), fuera de este modelo de datos; docs/datos/er.md ya anota esta FK externa pero no existe contrato (API/evento) definido para consultarla - vacio de definicion MAYOR

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
