---
id: "HU-ATC-068"
tipo: hu
titulo: "Bloquear en la entrada los intentos de manipular a la IA o de pedir datos ajenos"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "0.1"
owner: "Jesús Chávez Elías"
aprobadores: []
fecha: "2026-11-03"
relacionados: ["FT-ATC-19", "EP-ATC-09", "HU-ATC-048", "ADR-007"]
tags: [hu, nueva-propuesta, ia]
ui: false
---

# HU-ATC-068 — Bloquear en la entrada los intentos de manipular a la IA o de pedir datos ajenos

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-09 / FT-ATC-19
- Como gestor de tickets quiero que el Guardián de Seguridad detenga antes de usar el modelo cualquier ticket que pida datos de otro cliente o intente manipular a la IA, para que un ticket nunca filtre información que no le corresponde.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas | Estado |
|---|---|---|---|---|---|---|
| (pendiente: RF-SVC nuevo, lo asigna el PO) | Alta · propuesta | **por estimar por el equipo** | (por asignar) | (por definir) | (por definir) | Propuesta, pendiente DoR |

**Origen:** arquitectura del Núcleo de IA entregada por el Líder del equipo (3-nov-2026), adaptada a ATC en `adr/ADR-007` v0.9. **Es una HU propuesta por el equipo, no del PO:** el PO debe aceptarla y asignarle RF, prioridad y horas.

**Depende de:** HU-ATC-048 · ADR-007 · HU-ATC-001 (ticket tipificado) y consulta 360 (HU-ATC-050) · Dependencias externas: DEP-14 (proveedor de IA habilitado; mientras no esté, simulador), DEP-16 (roles del token).

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Datos de otro cliente
  Dado un ticket cuyo texto pide datos de otro cliente o de un contrato ajeno
  Cuando el Núcleo lo procesa
  Entonces se detiene sin llamar al modelo, el estado es «needs_human» con motivo `SEG_ALCANCE_AJENO` y no hay reintento.

Escenario: CA-02 · Texto que intenta manipular a la IA
  Dado un ticket con una instrucción oculta («ignora tus reglas…»)
  Cuando el Núcleo lo procesa
  Entonces el texto se trata como dato no confiable, se bloquea con motivo `SEG_PROMPT_INJECTION` y se deriva al gestor.

Escenario: CA-03 · El cliente no se elige por parámetro
  Dado una herramienta de consulta
  Cuando el modelo intenta pasarle un identificador de cliente
  Entonces se ignora: el cliente lo inyecta el sistema desde el ticket y el token.
```

## Reglas de negocio

- RN-SVC-032 IA asesora, el gestor de tickets decide
- RN-SVC-012 DLP en bitácoras
- RNF-SEC-009 Uso seguro de IA
- RNF-SEC-010 Permisos del origen

**Fuera de alcance:** Detección de fraude; filtrado del contenido que el gestor escribe a mano.

## Pantalla (`ui: false`)

- La bandeja muestra el motivo del bloqueo en el ticket derivado. (pendiente de G2: vacío / carga / error / sin permisos / responsive)

## Datos (CAD-F5)

- Entidades: `SVC_AI_SUGGESTION_LOG` (veredicto de seguridad), `SVC_TICKET`.
- Migración / backfill / borrado: (pendiente)

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: HU nueva redactada con IA (Claude, 2026-11-03) desde la arquitectura del Líder del equipo; pendiente de revisión humana — Revisado por: (pendiente)

Historial: 0.1 · 2026-11-03 · Jesús Chávez Elías, con IA · Versión inicial propuesta. — Revisado por: (pendiente)
