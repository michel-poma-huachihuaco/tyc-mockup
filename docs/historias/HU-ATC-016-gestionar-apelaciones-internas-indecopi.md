---
id: "HU-ATC-016"
tipo: hu
titulo: "Dar seguimiento a apelaciones internas y ante INDECOPI"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-06", "EP-ATC-03", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-016-gestionar-apelaciones-internas-indecopi.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-03 / docs/analisis/BRD.md
- Como responsable legal de reclamos quiero registrar la apelación del consumidor, su número de caso y la resolución para dar seguimiento hasta la resolución final.
- Requerimiento origen (RF-SVC-016 — Gestionar apelaciones internas y ante INDECOPI): El sistema debe gestionar apelaciones con estados PENDING … WITHDRAWN, número de caso y resolución de INDECOPI, con historial. · Proceso: PROC-SVC-006 (Apelaciones) · Fuente: PLT-04 · HU-ATC-016 · traza RF-SVC-016
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Salida 30-oct-2026
- Planificación (PLT-04 v1.2): Prioridad: **DEBE** · Iteración: **I2** · Estimación: **3 h** · Asignado: **Dev 1** (2026-10-27 → 2026-10-27) · Depende de HU: HU-ATC-015
- Observaciones de alcance: Fuera de alcance: Escritos y audiencias del procedimiento.
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · apelación | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · registro de apelación | 6.5 Diagrama entidad-relación · apelaciones

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Dar seguimiento a apelaciones internas y ante INDECOPI

Escenario: CA-01 · Resolución INDECOPI
  Dado una apelación ante INDECOPI
  Cuando se resuelve
  Entonces registro IndecopiCaseNumber, fecha y resumen de la resolución.

Escenario: CA-02 · Historial
  Dado una apelación con varios estados
  Cuando la consulto
  Entonces veo cada estado con fecha y autor.

Escenario: CA-03 · Desistimiento (agregado por el PO)
  Dado que el consumidor desiste
  Cuando registro WITHDRAWN
  Entonces la apelación queda cerrada y el ticket no puede volver a apelarse por la misma respuesta.
```

- Evidencia / prueba esperada (PLT-04): `Evento apelación_estado`

## Reglas de negocio

- RN-SVC-010 (Respuesta valida con cargo): Respuesta generica sin numero de reclamo ni cargo al consumidor no cuenta ante INDECOPI; la carta PDF con cargo entra al IntegrityHash.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Prototipo / pantalla de referencia (artefacto): Por diseñar: Libro › Apelaciones — Mockups: P-05 "Apelaciones" (Seguimiento de apelaciones internas e INDECOPI)
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `POST /api/v1/libro-reclamaciones/{id}/apelaciones` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades catalogadas (.ods): ENT-SVC-013 SVC_COMPLAINT_APPEAL_STATUS_LOG
- Entidades y dependencias declaradas en PLT-04: ENT-SVC-012/013 SVC_COMPLAINT_APPEAL(+_STATUS_LOG)
- Entidades/campos que LEE: SVC_COMPLAINT_BOOK_ENTRY
- Entidades/campos que ESCRIBE o modifica: SVC_COMPLAINT_APPEAL (estado, número de caso, resolución INDECOPI, historial)
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
