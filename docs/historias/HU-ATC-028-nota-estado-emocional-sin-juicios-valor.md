---
id: "HU-ATC-028"
tipo: hu
titulo: "Nota de estado emocional sin juicios de valor"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["FT-ATC-07", "EP-ATC-04", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-028-nota-estado-emocional-sin-juicios-valor.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-04 / docs/analisis/BRD.md
- Como Referente de Atención o Jefe de Operaciones UX quiero registrar en el ticket una nota del estado emocional del cliente ante frustración o conflicto, para que el siguiente atendedor conozca el contexto sin juicios de valor.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Registrar una nota de estado emocional válida
  Dado un cliente frustrado en la interacción
  Cuando el referente registra la nota describiendo hechos observables, sin adjetivos de juicio
  Entonces el sistema la guarda y la hace visible al siguiente atendedor

Escenario: Rechazar una nota con juicios de valor
  Dado una nota que contiene adjetivos de juicio sobre el cliente
  Cuando se intenta guardar
  Entonces el sistema la marca como gate no compensable y pide corregirla
```

## Reglas de negocio

- RN-SVC-024: gate: el estado emocional registrado con juicios de valor, o no registrado, es un gate no compensable.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `POST /api/v1/tickets/{id}/estado-emocional` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades/campos que LEE: SVC_TICKET
- Entidades/campos que ESCRIBE o modifica: SVC_TICKET_NOTA_EMOCIONAL
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
