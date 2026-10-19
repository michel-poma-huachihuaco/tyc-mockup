---
id: "HU-ATC-013"
tipo: hu
titulo: "Calcular el plazo legal y gestionar la prórroga única"
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

Va en `docs/historias/HU-ATC-013-computar-plazo-legal-prorroga-unica.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-03 / docs/analisis/BRD.md
- Como responsable legal de reclamos quiero ver el plazo legal de cada reclamo y registrar una única prórroga justificada para responder dentro del plazo y acreditar la prórroga ante una fiscalización.
- Requerimiento origen (RF-SVC-013 — Computar el plazo legal y la prorroga unica): El sistema debe calcular 15 días hábiles desde el registro y gestionar una prórroga única de 15 días con justificación, cargo y canal, bloqueando una segunda. · Proceso: PROC-SVC-005 (Libro de Reclamaciones) · Fuente: PLT-04 · HU-ATC-013 · traza RF-SVC-013
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Salida 30-oct-2026
- Planificación (PLT-04 v1.2): Prioridad: **DEBE** · Iteración: **I1** · Estimación: **6 h** · Asignado: **Dev 1** (2026-10-23 → 2026-10-23) · Depende de HU: HU-ATC-012 · Dependencias externas: DEP-04 (Calendario MAE_TIME + MAE_HOLIDAY por geografía)
- Observaciones de alcance: Fuera de alcance: Plazos distintos por sector regulado.
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · asiento del Libro de Reclamaciones | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · asiento, prórroga y respuesta | 6.5 Diagrama entidad-relación · Libro de Reclamaciones

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Calcular el plazo legal y gestionar la prórroga única

Escenario: CA-01 · Requisitos de prórroga
  Dado un reclamo dentro de plazo
  Cuando registro la prórroga
  Entonces el sistema exige justificación, cargo, canal y fecha de comunicación anterior al vencimiento original.

Escenario: CA-02 · Sin reescritura
  Dado un vencimiento ya prorrogado
  Cuando alguien intenta modificarlo
  Entonces se rechaza y cualquier cambio queda como fila nueva en el historial.

Escenario: CA-03 · Segunda prórroga (agregado por el PO)
  Dado un reclamo ya prorrogado
  Cuando intento prorrogar otra vez
  Entonces la acción está bloqueada.

Escenario: CA-04 · Fuera de ventana (agregado por el PO)
  Dado un reclamo con el plazo original vencido
  Cuando intento prorrogar
  Entonces el sistema lo impide porque la prórroga debe comunicarse antes del vencimiento.
```

- Evidencia / prueba esperada (PLT-04): `Evento prorroga_registrada`

## Reglas de negocio

- RN-SVC-009 (Plazo legal 15+15): 15 dias habiles desde el registro, prorrogable UNA vez por 15 mas si se justifica y comunica ANTES del vencimiento original; prohibido reescribir el vencimiento prorrogado.
- RN-SVC-003 (Dias habiles unicos): BUSINESS_HOURS/BUSINESS_DAYS se resuelven contra MAE_TIME.IsWeekend + MAE_HOLIDAY por geografia del establecimiento, nunca con formula propia del job.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Prototipo / pantalla de referencia (artefacto): Prototipo › Libro › «Prorrogar 15 d» — Mockups: P-04 "Libro de Reclamaciones" (Asientos con plazo legal, prórroga y respuesta formal)
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `POST /api/v1/libro-reclamaciones/{id}/prorroga` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades catalogadas (.ods): ENT-SVC-010 SVC_COMPLAINT_BOOK_ENTRY, ENT-REF-002 MAE_TIME
- Entidades y dependencias declaradas en PLT-04: SVC_COMPLAINT_BOOK_ENTRY, MAE_TIME · DEP-04
- Entidades/campos que LEE: SVC_COMPLAINT_BOOK_ENTRY, MAE_TIME, MAE_HOLIDAY
- Entidades/campos que ESCRIBE o modifica: SVC_COMPLAINT_BOOK_ENTRY.LegalResponseDueDate, ExtensionJustification, ExtensionCommunicatedDate
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
