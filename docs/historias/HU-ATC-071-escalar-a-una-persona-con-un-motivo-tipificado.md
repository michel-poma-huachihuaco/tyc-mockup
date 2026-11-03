---
id: "HU-ATC-071"
tipo: hu
titulo: "Escalar a una persona con un motivo tipificado y mantener el estado del caso"
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

# HU-ATC-071 — Escalar a una persona con un motivo tipificado y mantener el estado del caso

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-09 / FT-ATC-19
- Como gestor de tickets quiero que cuando la IA no pueda resolver un ticket me lo devuelva con un motivo claro de un catálogo cerrado, y que el caso siempre tenga un estado visible y retome donde quedó, para que ningún ticket se pierda ni quede a medias.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas | Estado |
|---|---|---|---|---|---|---|
| (pendiente: RF-SVC nuevo, lo asigna el PO) | Alta · propuesta | **por estimar por el equipo** | (por asignar) | (por definir) | (por definir) | Propuesta, pendiente DoR |

**Origen:** arquitectura del Núcleo de IA entregada por el Líder del equipo (3-nov-2026), adaptada a ATC en `adr/ADR-007` v0.9. **Es una HU propuesta por el equipo, no del PO:** el PO debe aceptarla y asignarle RF, prioridad y horas.

**Depende de:** HU-ATC-048 · ADR-007 · HU-ATC-007 (derivación tipificada), HU-ATC-004 (historial de estados) · Dependencias externas: DEP-14 (proveedor de IA habilitado; mientras no esté, simulador), DEP-16 (roles del token).

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Señal con motivo
  Dado un caso que un guardián no pudo aprobar
  Cuando el Núcleo termina
  Entonces devuelve «needs_human» con un motivo del catálogo cerrado (`SEG_`, `ALC_`, `DAT_`, `CAL_`, `OPS_`); no existe el motivo «otro».

Escenario: CA-02 · El Núcleo no decide a quién
  Dado un caso escalado
  Cuando el flujo de derivación lo recibe
  Entonces es el flujo de ATC (HU-007) quien elige el destino; el Núcleo solo avisa.

Escenario: CA-03 · Estado visible
  Dado un caso de IA en curso
  Cuando el gestor lo consulta
  Entonces ve su estado: recibido, en verificación, redactando, listo para revisión, aprobado o derivado.

Escenario: CA-04 · Reanudación
  Dado un caso interrumpido por una falla
  Cuando se reanuda
  Entonces continúa desde la última transición guardada sin repetir consultas ni crear un segundo borrador.

Escenario: CA-05 · Falla cerrada
  Dado una excepción, tiempo agotado o presupuesto excedido
  Cuando ocurre
  Entonces el caso se escala con `OPS_PRESUPUESTO_EXCEDIDO` u `OPS_MODELO_NO_DISPONIBLE`; nunca queda un borrador parcial.

Escenario: CA-06 · Tablero de motivos
  Dado un periodo de operación
  Cuando el supervisor revisa los escalamientos
  Entonces los ve agrupados por prefijo (dueño del problema) y no como una lista de fallos.
```

## Reglas de negocio

- RN-SVC-032 IA asesora, el gestor de tickets decide
- RN-SVC-012 DLP en bitácoras
- RN-SVC-023 Gate: cierre fuera de Mi Portal

**Fuera de alcance:** Cerrar el ticket sin acción del gestor; envío automático al cliente.

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo › Ticket y Torre de control CX (motivos). (pendiente de G2)

## Datos (CAD-F5)

- Entidades: `SVC_AI_SUGGESTION_LOG` (estado y motivo, cambio al v7 pendiente del Data Chief), `SVC_TICKET_STATUS_LOG`.
- Migración / backfill / borrado: (pendiente)

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: HU nueva redactada con IA (Claude, 2026-11-03) desde la arquitectura del Líder del equipo; pendiente de revisión humana — Revisado por: (pendiente)

Historial: 0.1 · 2026-11-03 · Jesús Chávez Elías, con IA · Versión inicial propuesta. — Revisado por: (pendiente)
