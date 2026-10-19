---
id: "HU-ATC-015"
tipo: hu
titulo: "Vigilar el plazo legal y detectar reclamos huérfanos"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-05", "EP-ATC-03", "AYB-0001"]
tags: [hu]
ui: false
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-015-vigilar-plazo-legal-detectar-huerfanos.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-03 / docs/analisis/BRD.md
- Como responsable legal de reclamos quiero que el sistema me alerte cuando un plazo legal está por vencer y detecte reclamos sin asiento para evitar incumplimientos legales y reclamos no registrados.
- Requerimiento origen (RF-SVC-015 — Vigilar el plazo legal y detectar huerfanos): El sistema debe vigilar por job el plazo legal (alertas LEGAL_RESPONSE_OVERDUE y LEGAL_Extensión_WINDOW_CLOSING) y detectar a diario tickets sin asiento. · Proceso: PROC-SVC-005 (Libro de Reclamaciones) · Fuente: PLT-04 · HU-ATC-015 · traza RF-SVC-015
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Salida 30-oct-2026
- Planificación (PLT-04 v1.2): Prioridad: **DEBE** · Iteración: **I2** · Estimación: **4 h** · Asignado: **Dev 1** (2026-10-26 → 2026-10-27) · Depende de HU: HU-ATC-013
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · asiento del Libro de Reclamaciones | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · asiento, prórroga y respuesta | 6.5 Diagrama entidad-relación · Libro de Reclamaciones
- Referencia visual / plantilla en prototipo: Prototipo › Libro (indicador «Tickets huérfanos hoy») [P-04 "Libro de Reclamaciones"]

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Vigilar el plazo legal y detectar reclamos huérfanos

Escenario: CA-01 · Alerta legal
  Dado un reclamo a 3 días hábiles de vencer sin prórroga
  Cuando corre el job
  Entonces se genera LEGAL_Extensión_WINDOW_CLOSING, sin exigir política comercial.

Escenario: CA-02 · Huérfano
  Dado un ticket activo de un tipo con RequiresComplaintBook y sin asiento al cierre del día
  Cuando corre el control diario
  Entonces se inserta GOV_INTEGRITY_EXCEPTION (ORPHAN_REFERENCE).

Escenario: CA-03 · Plazo prorrogado (agregado por el PO)
  Dado un reclamo prorrogado
  Cuando el job evalúa el plazo
  Entonces usa el vencimiento prorrogado (COALESCE) y no el original.
```

- Evidencia / prueba esperada (PLT-04): `Evento huerfano_detectado`

## Reglas de negocio

- RN-SVC-011 (Flag indicativo, fila decisiva): RequiresComplaintBook tipifica; la calificacion legal la da la existencia de la fila en SVC_COMPLAINT_BOOK_ENTRY (control detectivo diario).
- RN-SVC-008 (Alerta unica por ciclo): UNIQUE (TicketID, BreachTypeID, ReopenCycleNumber): cada ciclo alerta una sola vez por tipo de incumplimiento.

## Datos (CAD-F5)

- Entidades catalogadas (.ods): ENT-SVC-009 SVC_SLA_BREACH_ALERT, ENT-SVC-010 SVC_COMPLAINT_BOOK_ENTRY, ENT-GOV-001 GOV_INTEGRITY_EXCEPTION
- Entidades y dependencias declaradas en PLT-04: SVC_SLA_BREACH_ALERT, GOV_INTEGRITY_EXCEPTION
- Entidades/campos que LEE: SVC_TICKET, SVC_COMPLAINT_BOOK_ENTRY
- Entidades/campos que ESCRIBE o modifica: SVC_COMPLAINT_BOOK_ALERTA, GOV_INTEGRITY_EXCEPTION
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
