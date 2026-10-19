---
id: "HU-ATC-007"
tipo: hu
titulo: "Derivar un ticket a otra área con motivo tipificado"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-03", "EP-ATC-02", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-007-derivar-entre-areas-log-auditable.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-02 / docs/analisis/BRD.md
- Como gestor de tickets quiero derivar el ticket a otra área o colaborador indicando el motivo para conservar el rastro completo de quién tuvo el ticket en cada momento.
- Requerimiento origen (RF-SVC-007 — Derivar entre areas con log auditable): El sistema debe derivar tickets entre las 6 áreas y colaboradores registrando cada movimiento con motivo en bitácora append-only. · Proceso: PROC-SVC-003 (Derivacion y reasignacion) · Fuente: PLT-04 · HU-ATC-007 · traza RF-SVC-007
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Salida 30-oct-2026
- Planificación (PLT-04 v1.2): Prioridad: **DEBE** · Iteración: **I1** · Estimación: **4 h** · Asignado: **Dev 2** (2026-10-19 → 2026-10-19)
- Observaciones de alcance: Fuera de alcance: Asignación por habilidades (la reasignación por carga es RF-SVC-046).
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · asignación del ticket | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · derivación y reasignación | 6.5 Diagrama entidad-relación · enrutamiento

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Derivar un ticket a otra área con motivo tipificado

Escenario: CA-01 · Área sin persona
  Dado que derivo al área de Cobranza sin elegir persona
  Cuando confirmo
  Entonces AssignedToPartyID queda vacío y CurrentAreaID se actualiza.

Escenario: CA-02 · Rastro
  Dado un ticket con varias derivaciones
  Cuando consulto su historial
  Entonces cada fila muestra quién lo tenía antes, a quién pasó y por qué.

Escenario: CA-03 · Motivo obligatorio (agregado por el PO)
  Dado que intento derivar sin motivo
  Cuando confirmo
  Entonces el sistema pide elegir un motivo del catálogo.
```

- Evidencia / prueba esperada (PLT-04): `Evento ticket_derivado {de_área, a_área, motivo}`

## Reglas de negocio

- RN-SVC-006 (Asignacion append-only): Cada movimiento de area/responsable es fila nueva con motivo tipificado; los punteros actuales son denormalizados.
- RN-SVC-012 (DLP en bitacoras): Prohibido registrar PII en los campos Notes_*: solo el motivo operativo del movimiento.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Prototipo / pantalla de referencia (artefacto): Prototipo › Detalle › «Derivar / reasignar» — Mockups: P-03 "Detalle de ticket" (Detalle con estados, interacciones y compromisos SLA; Modal Derivar / reasignar a Eje 3 con paquete mínimo 6/6)
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `POST /api/v1/tickets/{id}/derivaciones` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades catalogadas (.ods): ENT-SVC-007 MAE_AREA, ENT-SVC-001 SVC_TICKET
- Entidades y dependencias declaradas en PLT-04: ENT-SVC-003 SVC_TICKET_ASSIGNMENT_LOG, MAE_Área
- Entidades/campos que LEE: SVC_TICKET, catálogo de áreas
- Entidades/campos que ESCRIBE o modifica: SVC_TICKET_ASIGNACION (append-only)
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
