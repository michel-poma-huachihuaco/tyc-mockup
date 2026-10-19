---
id: "HU-ATC-012"
tipo: hu
titulo: "Registrar el asiento del Libro de Reclamaciones"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-05", "EP-ATC-03", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-012-registrar-asiento-libro-extension-ticket.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-03 / docs/analisis/BRD.md
- Como responsable legal de reclamos quiero que cada queja o reclamo genere su asiento con hechos, pedido y monto reclamado para dejar constancia formal conforme al formato regulado.
- Requerimiento origen (RF-SVC-012 — Registrar el asiento del libro como extension del ticket): El sistema debe crear el asiento QUEJA/RECLAMO como extensión 1:1 del ticket, con correlativo por empresa y establecimiento. · Proceso: PROC-SVC-005 (Libro de Reclamaciones) · Fuente: PLT-04 · HU-ATC-012 · traza RF-SVC-012
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Salida 30-oct-2026
- Planificación (PLT-04 v1.2): Prioridad: **DEBE** · Iteración: **I1** · Estimación: **4 h** · Asignado: **Dev 1** (2026-10-22 → 2026-10-23) · Depende de HU: HU-ATC-006 · Dependencias externas: DEP-05 (Validación legal: formato del asiento, textos y plazos del Libro)
- Observaciones de alcance: Fuera de alcance: Hoja de reclamación pública web.
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · asiento del Libro de Reclamaciones | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · asiento, prórroga y respuesta | 6.5 Diagrama entidad-relación · Libro de Reclamaciones

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Registrar el asiento del Libro de Reclamaciones

Escenario: CA-01 · Correlativo
  Dado dos asientos de la misma empresa en establecimientos distintos
  Cuando se numeran
  Entonces cada establecimiento lleva su propio correlativo.

Escenario: CA-02 · Monto y moneda
  Dado un reclamo con monto
  Cuando lo guardo sin moneda
  Entonces el sistema lo rechaza; sin monto, ambos campos quedan vacíos.

Escenario: CA-03 · Empresa inmutable (agregado por el PO)
  Dado un asiento registrado
  Cuando alguien intenta cambiar su razón social
  Entonces la operación se rechaza.
```

- Evidencia / prueba esperada (PLT-04): `Evento asiento_libro {tipo, empresa, establecimiento}`

## Reglas de negocio

- RN-SVC-004 (Correlativo por RUC): TicketNumber UNIQUE por CompanyID; el libro corre ademas por establecimiento (UNIQUE Company+Address+Numero).
- RN-SVC-013 (Empresa inmutable en el libro): FK compuesta (TicketID, CompanyID) con RESTRICT: el asiento no puede cambiar de razon social.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Prototipo / pantalla de referencia (artefacto): Prototipo › Libro de Reclamaciones — Mockups: P-04 "Libro de Reclamaciones" (Asientos con plazo legal, prórroga y respuesta formal)
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `POST /api/v1/tickets/{id}/libro-reclamaciones` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades y dependencias declaradas en PLT-04: ENT-SVC-010 SVC_COMPLAINT_BOOK_ENTRY · DEP-05 validación legal
- Entidades/campos que LEE: SVC_TICKET
- Entidades/campos que ESCRIBE o modifica: SVC_COMPLAINT_BOOK_ENTRY (hechos, pedido, monto, moneda)
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
