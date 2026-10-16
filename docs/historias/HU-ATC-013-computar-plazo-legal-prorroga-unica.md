---
id: "HU-ATC-013"
tipo: hu
titulo: "Computar el plazo legal y la prórroga única"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["FT-ATC-05", "EP-ATC-03", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-013-computar-plazo-legal-prorroga-unica.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-03 / docs/analisis/BRD.md
- Como responsable legal de reclamos quiero calcular el plazo legal de 15 días hábiles desde el registro contra el calendario filtrado por la geografía del establecimiento y gestionar la prórroga única de 15 días exigiendo justificación, comunicación previa al vencimiento, cargo documental y canal, bloqueando toda segunda prórroga, para responder dentro del plazo legal y acreditar la prórroga ante una fiscalización.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Solicitar la prórroga única antes del vencimiento
  Dado un asiento del libro con plazo legal vigente
  Cuando el responsable legal registra la prórroga con justificación, cargo y canal antes del vencimiento
  Entonces el sistema la acepta y recalcula el plazo con 15 días adicionales

Escenario: Bloquear una segunda prórroga
  Dado un asiento que ya tiene una prórroga registrada
  Cuando se intenta registrar una segunda prórroga
  Entonces el sistema la rechaza
```

## Reglas de negocio

- RN-SVC-009: plazo legal 15+15, prorrogable una vez por 15 más, justificado y comunicado antes del vencimiento original.
- RN-SVC-003: días hábiles únicos contra MAE_TIME/MAE_HOLIDAY por geografía del establecimiento.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `POST /api/v1/libro-reclamaciones/{id}/prorroga` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades/campos que LEE: SVC_COMPLAINT_BOOK_ENTRY, MAE_TIME, MAE_HOLIDAY
- Entidades/campos que ESCRIBE o modifica: SVC_COMPLAINT_BOOK_ENTRY.LegalResponseDueDate, ExtensionJustification, ExtensionCommunicatedDate
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
