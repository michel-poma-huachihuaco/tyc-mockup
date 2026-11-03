---
id: "HU-ATC-070"
tipo: hu
titulo: "Identificar de qué trata el ticket y elegir la guía y las reglas correctas"
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

# HU-ATC-070 — Identificar de qué trata el ticket y elegir la guía y las reglas correctas

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-09 / FT-ATC-19
- Como sistema quiero identificar el tipo e intención de cada ticket apenas lo recibo y dirigirlo a la skill y a las reglas de plazo y SLA de ese tipo, para no mezclar los de un tipo con los de otro.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas | Estado |
|---|---|---|---|---|---|---|
| (pendiente: RF-SVC nuevo, lo asigna el PO) | Alta · propuesta | **por estimar por el equipo** | (por asignar) | (por definir) | (por definir) | Propuesta, pendiente DoR |

**Origen:** arquitectura del Núcleo de IA entregada por el Líder del equipo (3-nov-2026), adaptada a ATC en `adr/ADR-007` v0.9. **Es una HU propuesta por el equipo, no del PO:** el PO debe aceptarla y asignarle RF, prioridad y horas.

**Depende de:** HU-ATC-048 · ADR-007 · HU-ATC-001, HU-ATC-043 (flujo por tipo) y HU-ATC-047 (guía) · Dependencias externas: DEP-14 (proveedor de IA habilitado; mientras no esté, simulador), DEP-16 (roles del token).

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Tipo reconocido
  Dado un ticket de un tipo con skill publicada
  Cuando el Núcleo lo clasifica
  Entonces carga solo la guía y las reglas de ese tipo y no las de otros tipos.

Escenario: CA-02 · Reglas en código
  Dado un ticket con SLA vencido o ya cerrado
  Cuando el router aplica las reglas de plazo
  Entonces el caso se corta antes de redactar y se deriva; el modelo nunca decide el plazo.

Escenario: CA-03 · Caso mixto o sin tipo
  Dado un ticket que mezcla tipos o no encaja en ninguno
  Cuando se clasifica
  Entonces se deriva con `ALC_CASO_MIXTO` o `ALC_TIPO_NO_CUBIERTO`; nunca se fuerza una categoría.

Escenario: CA-04 · Independiente del canal
  Dado el mismo ticket por dos canales distintos
  Cuando se procesa
  Entonces el resultado es idéntico: el canal solo se guarda como traza.
```

## Reglas de negocio

- RN-SVC-032 IA asesora, el gestor de tickets decide
- RN-SVC-012 DLP en bitácoras
- RN-SVC-012 DLP en bitácoras

**Fuera de alcance:** Crear tipos de ticket nuevos (los publica el administrador funcional, HU-043).

## Pantalla (`ui: false`)

- Sin pantalla propia: el tipo detectado aparece en el panel del ticket.

## Datos (CAD-F5)

- Entidades: `MAE_TICKET_TYPE`, `SVC_KNOWLEDGE_ARTICLE`, `SVC_AI_SUGGESTION_LOG`.
- Migración / backfill / borrado: (pendiente)

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: HU nueva redactada con IA (Claude, 2026-11-03) desde la arquitectura del Líder del equipo; pendiente de revisión humana — Revisado por: (pendiente)

Historial: 0.1 · 2026-11-03 · Jesús Chávez Elías, con IA · Versión inicial propuesta. — Revisado por: (pendiente)
