---
id: "HU-ATC-069"
tipo: hu
titulo: "Verificar cada dato del borrador contra su fuente antes de mostrarlo"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "0.1"
owner: "Jesús Chávez Elías"
aprobadores: []
fecha: "2026-11-03"
relacionados: ["FT-ATC-19", "EP-ATC-09", "HU-ATC-048", "ADR-007"]
tags: [hu, nueva-propuesta, ia]
ui: true
---

# HU-ATC-069 — Verificar cada dato del borrador contra su fuente antes de mostrarlo

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-09 / FT-ATC-19
- Como gestor de tickets quiero que el Guardián de Calidad compruebe que cada monto, fecha y número del borrador coincide literalmente con el dato real, para que nunca llegue al cliente una cifra inventada.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas | Estado |
|---|---|---|---|---|---|---|
| (pendiente: RF-SVC nuevo, lo asigna el PO) | Alta · propuesta | **por estimar por el equipo** | (por asignar) | (por definir) | (por definir) | Propuesta, pendiente DoR |

**Origen:** arquitectura del Núcleo de IA entregada por el Líder del equipo (3-nov-2026), adaptada a ATC en `adr/ADR-007` v0.9. **Es una HU propuesta por el equipo, no del PO:** el PO debe aceptarla y asignarle RF, prioridad y horas.

**Depende de:** HU-ATC-048 · ADR-007 · HU-ATC-070 (clasificación) y consulta 360 (HU-ATC-050/052) · Dependencias externas: DEP-14 (proveedor de IA habilitado; mientras no esté, simulador), DEP-16 (roles del token).

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Coincide
  Dado un borrador con una fecha y un monto tomados de la consulta 360
  Cuando el Guardián de Calidad compara con la fuente
  Entonces el borrador queda «listo para revisión» con la fuente de cada dato visible.

Escenario: CA-02 · No coincide, un reintento
  Dado un dato del borrador que no existe literal en la fuente
  Cuando falla la verificación
  Entonces se corrige una sola vez inyectando el motivo; si vuelve a fallar se deriva con `CAL_DATO_NO_COINCIDE`, nunca un tercer intento.

Escenario: CA-03 · Afirmación sin respaldo
  Dado una afirmación del borrador sin fuente identificada
  Cuando se verifica
  Entonces se rechaza con `DAT_SIN_DATO_DE_RESPALDO`.

Escenario: CA-04 · Tono
  Dado un borrador que pasó la verificación de datos
  Cuando el juez de tono lo evalúa
  Entonces si usa un término prohibido del área se reintenta una vez y después se deriva con `CAL_TONO_RECHAZADO`.

Escenario: CA-05 · El gestor ve la evidencia
  Dado un borrador listo
  Cuando el gestor abre el ticket
  Entonces ve el borrador editable, la fuente navegable de cada dato y el veredicto de ambos guardianes.
```

## Reglas de negocio

- RN-SVC-032 IA asesora, el gestor de tickets decide
- RN-SVC-012 DLP en bitácoras
- RN-SVC-023 Gate: cierre fuera de Mi Portal

**Fuera de alcance:** Cálculo o estimación de montos por la IA; interpretación de cláusulas contractuales.

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo › Ticket (asistente). Frames de Figma: (pendiente: enlace del envío de G2).

## Datos (CAD-F5)

- Entidades: `SVC_AI_SUGGESTION_LOG` (veredictos, hash), `SVC_TICKET_INTERACTION`.
- Migración / backfill / borrado: (pendiente)

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: HU nueva redactada con IA (Claude, 2026-11-03) desde la arquitectura del Líder del equipo; pendiente de revisión humana — Revisado por: (pendiente)

Historial: 0.1 · 2026-11-03 · Jesús Chávez Elías, con IA · Versión inicial propuesta. — Revisado por: (pendiente)
