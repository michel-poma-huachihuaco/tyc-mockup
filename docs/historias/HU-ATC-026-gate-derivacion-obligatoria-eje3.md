---
id: "HU-ATC-026"
tipo: hu
titulo: "Gate de derivación obligatoria a Eje 3"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["FT-ATC-07", "EP-ATC-04", "AYB-0001"]
tags: [hu]
ui: false
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-026-gate-derivacion-obligatoria-eje3.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-04 / docs/analisis/BRD.md
- Como Teleoperador o Gestor de Postventa quiero que el sistema impida que un ticket con señal de conflicto (carta notarial, INDECOPI/fiscalía, abogado externo o prensa) permanezca o se resuelva en Eje 1 o Eje 2, para que se derive de inmediato al Eje 3 (Legal).

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Bloquear el cierre de un ticket con señal de conflicto en Eje 1
  Dado un ticket marcado con señal de conflicto
  Cuando un gestor de Eje 1 intenta cerrarlo
  Entonces el sistema rechaza el cierre y exige su derivación a Eje 3
```

Nota: esta HU es un gate de validación sobre el flujo de ticket existente (no introduce pantalla propia); su comportamiento se verifica en las pantallas de ciclo de vida de HU-ATC-004 y de derivación de HU-ATC-007. Si la UX requiere un mensaje de bloqueo visible, el PO lo marcará `ui: true` al revisar G2.

## Reglas de negocio

- RN-SVC-021: gate: un caso de conflicto (carta notarial, INDECOPI, abogado, prensa) no se resuelve en Eje 1/2; se deriva de inmediato al Eje 3. Gate no compensable.

## Datos (CAD-F5)

- Entidades/campos que LEE: SVC_TICKET (señal de conflicto)
- Entidades/campos que ESCRIBE o modifica: ninguna propia; valida transiciones de SVC_TICKET y SVC_TICKET_ASIGNACION
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
