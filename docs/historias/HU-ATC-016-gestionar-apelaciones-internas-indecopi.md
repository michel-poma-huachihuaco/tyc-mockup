---
id: "HU-ATC-016"
tipo: hu
titulo: "Gestionar apelaciones internas y ante INDECOPI"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["FT-ATC-06", "EP-ATC-03", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-016-gestionar-apelaciones-internas-indecopi.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-03 / docs/analisis/BRD.md
- Como responsable legal de reclamos quiero gestionar apelaciones en segunda instancia interna o ante INDECOPI con estados PENDING, UNDER_REVIEW, RESOLVED_FAVOR_CUSTOMER, RESOLVED_FAVOR_COMPANY, WITHDRAWN, número de caso y resolución de INDECOPI cuando aplique, con historial de estados, para dar seguimiento a la apelación hasta su resolución final.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Registrar una apelación y moverla de estado
  Dado un asiento del libro con respuesta ya formal
  Cuando el consumidor apela y el responsable legal registra la apelación como PENDING
  Entonces el sistema permite moverla a UNDER_REVIEW y luego a un estado de resolución, conservando el historial de cada cambio
```

## Reglas de negocio

- RN-SVC-010: respuesta válida con cargo; aplica también a la resolución de la apelación cuando genera carta formal.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `POST /api/v1/libro-reclamaciones/{id}/apelaciones` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades/campos que LEE: SVC_COMPLAINT_BOOK_ENTRY
- Entidades/campos que ESCRIBE o modifica: SVC_COMPLAINT_APPEAL (estado, número de caso, resolución INDECOPI, historial)
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
