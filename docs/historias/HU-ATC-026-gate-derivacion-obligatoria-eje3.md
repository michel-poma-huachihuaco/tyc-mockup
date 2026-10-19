---
id: "HU-ATC-026"
tipo: hu
titulo: "Bloquear la resolución en Eje 1/2 ante señal de conflicto"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-07", "EP-ATC-04", "AYB-0001"]
tags: [hu]
ui: false
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-026-gate-derivacion-obligatoria-eje3.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-04 / docs/analisis/BRD.md
- Como gestor de tickets o gestor de Postventa quiero que el sistema me obligue a derivar a Legal un ticket con carta notarial, INDECOPI, abogado o prensa para que el conflicto no se intente resolver fuera de Eje 3.
- Requerimiento origen (RF-SVC-026 — Gate de derivacion obligatoria a Eje 3): El sistema debe impedir que un ticket con señal de conflicto permanezca o se resuelva en Eje 1 o Eje 2 y exigir su derivación a Eje 3. · Proceso: PROC-SVC-011 (Derivacion obligatoria a Legal ante caso de conflicto (gate Eje 3)) · Fuente: PLT-04 · HU-ATC-026 · traza RF-SVC-026
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Salida 30-oct-2026
- Planificación (PLT-04 v1.2): Prioridad: **DEBE** · Iteración: **I1** · Estimación: **3 h** · Asignado: **Dev 2** (2026-10-23 → 2026-10-23) · Depende de HU: HU-ATC-029
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · ticket con señal de conflicto | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · gate y handoff a Eje 3 | 6.5 Diagrama entidad-relación · conflicto y handoff
- Referencia visual / plantilla en prototipo: Prototipo › Nuevo ticket (señales de conflicto) y Detalle (banner) [P-02 "Nuevo ticket", P-03 "Detalle de ticket"]

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Bloquear la resolución en Eje 1/2 ante señal de conflicto

Escenario: CA-01 · Detección
  Dado un ticket en Eje 2 que recibe una carta notarial
  Cuando se marca la señal de conflicto
  Entonces el sistema bloquea su resolución en Eje 1/2 y exige derivarlo a Eje 3.

Escenario: CA-02 · Gate
  Dado un ticket marcado con conflicto
  Cuando intento cerrarlo en Eje 1/2
  Entonces el sistema lo rechaza como gate no compensable.

Escenario: CA-03 · Marca por error (agregado por el PO)
  Dado una señal marcada por error
  Cuando un supervisor la retira con justificación
  Entonces queda registro del retiro en el historial.
```

- Evidencia / prueba esperada (PLT-04): `Evento gate_conflicto`

## Reglas de negocio

- RN-SVC-021 (Gate: un caso de conflicto no se resuelve en Eje 1/2): Un caso de conflicto (carta notarial, INDECOPI, abogado, prensa) no se resuelve en Eje 1/2: se deriva de inmediato al Eje 3 (Legal); es un gate no compensable.

## Datos (CAD-F5)

- Entidades y dependencias declaradas en PLT-04: SVC_TICKET
- Entidades/campos que LEE: SVC_TICKET (señal de conflicto)
- Entidades/campos que ESCRIBE o modifica: ninguna propia; valida transiciones de SVC_TICKET y SVC_TICKET_ASIGNACION
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
