---
id: "HU-ATC-072"
tipo: hu
titulo: "Probar cada cambio de la IA contra un set fijo de casos antes de desplegarlo"
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

# HU-ATC-072 — Probar cada cambio de la IA contra un set fijo de casos antes de desplegarlo

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-09 / FT-ATC-19
- Como equipo técnico quiero que todo cambio de prompt, skill o modelo corra contra un conjunto fijo de casos reales anonimizados, para detectar si un ajuste empeoró las respuestas antes de publicarlo.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas | Estado |
|---|---|---|---|---|---|---|
| (pendiente: RF-SVC nuevo, lo asigna el PO) | Alta · propuesta | **por estimar por el equipo** | (por asignar) | (por definir) | (por definir) | Propuesta, pendiente DoR |

**Origen:** arquitectura del Núcleo de IA entregada por el Líder del equipo (3-nov-2026), adaptada a ATC en `adr/ADR-007` v0.9. **Es una HU propuesta por el equipo, no del PO:** el PO debe aceptarla y asignarle RF, prioridad y horas.

**Depende de:** HU-ATC-048 · ADR-007 · Corpus de ATC (respuestas enviadas) y HU-ATC-069 · Dependencias externas: DEP-14 (proveedor de IA habilitado; mientras no esté, simulador), DEP-16 (roles del token).

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Puerta de despliegue
  Dado un cambio de prompt, skill o versión de modelo
  Cuando corre el set de ~50 casos en CI
  Entonces si el resultado baja respecto de la versión vigente, el cambio no se despliega.

Escenario: CA-02 · Casos anonimizados
  Dado un caso real para el set
  Cuando se incorpora
  Entonces pasa primero por la anonimización; un DNI de prueba colocado a propósito se detecta y se rechaza el lote.

Escenario: CA-03 · El corpus no se imita a sí mismo
  Dado un borrador de la IA que el gestor aprobó y salió al cliente
  Cuando se arma el corpus de estilo
  Entonces no entra como ejemplo; solo entran respuestas escritas por personas, con veredicto humano (revisor y fecha).

Escenario: CA-04 · Versión trazable
  Dado una sugerencia registrada
  Cuando se audita
  Entonces consta la versión del prompt y de la guía usadas.
```

## Reglas de negocio

- RN-SVC-032 IA asesora, el gestor de tickets decide
- RN-SVC-012 DLP en bitácoras
- RNF-SEC-009 Uso seguro de IA

**Fuera de alcance:** Entrenamiento o fine-tuning del modelo (se revisa solo con evidencia).

## Pantalla (`ui: false`)

- Sin pantalla.

## Datos (CAD-F5)

- Entidades: Set de casos (fuera de la base; referencias, no copias), `SVC_AI_SUGGESTION_LOG`.
- Migración / backfill / borrado: (pendiente)

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: HU nueva redactada con IA (Claude, 2026-11-03) desde la arquitectura del Líder del equipo; pendiente de revisión humana — Revisado por: (pendiente)

Historial: 0.1 · 2026-11-03 · Jesús Chávez Elías, con IA · Versión inicial propuesta. — Revisado por: (pendiente)
