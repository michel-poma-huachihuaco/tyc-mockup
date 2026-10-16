---
id: "HU-ATC-058"
tipo: hu
titulo: "Carta de alerta al responsable del proyecto con copia al supervisor"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["FT-ATC-22", "EP-ATC-11", "AYB-0001"]
tags: [hu]
ui: false
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-058-carta-alerta-responsable-proyecto-copia-supervisor.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-11 / docs/analisis/BRD.md
- Como sistema (en nombre de Cobranza) quiero generar y enviar una carta de alerta al responsable del proyecto del lote, con copia a su supervisor, indicando cliente, deuda, estado del caso y fecha prevista de resolución, para que el proyecto conozca y gestione el caso antes de la resolución.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Enviar la carta al responsable del proyecto
  Dado un caso de resolución de contrato creado
  Cuando el sistema genera la carta
  Entonces la envía al responsable del proyecto del lote con copia a su supervisor, indicando cliente, deuda, estado y fecha prevista

Escenario: Escalar por falta de acción
  Dado una carta enviada sin acción del responsable dentro del plazo
  Cuando se cumple el plazo
  Entonces el sistema escala según la matriz de escalamiento
```

## Reglas de negocio

- RN-SVC-039: carta de alerta al responsable del proyecto con copia a su supervisor; sin acción, escala según la matriz de escalamiento.

## Datos (CAD-F5)

- Entidades/campos que LEE: SVC_TICKET (caso de resolución), maestro de responsables de proyecto
- Entidades/campos que ESCRIBE o modifica: registro de envío de la carta
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
