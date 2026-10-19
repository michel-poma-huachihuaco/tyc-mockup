---
id: "HU-ATC-008"
tipo: hu
titulo: "Reasignar en bloque los tickets de un colaborador que cesa"
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

Va en `docs/historias/HU-ATC-008-reasignar-masivamente-al-cesar-colaborador.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-02 / docs/analisis/BRD.md
- Como supervisor ATC quiero reasignar todos los tickets pendientes de un colaborador que rota, renuncia o cesa para continuar la atención sin perder la trazabilidad.
- Requerimiento origen (RF-SVC-008 — Reasignar masivamente al cesar un colaborador): El sistema debe reasignar los tickets pendientes de un colaborador que rota o cesa, sin borrar el rastro anterior. · Proceso: PROC-SVC-003 (Derivacion y reasignacion) · Fuente: PLT-04 · HU-ATC-008 · traza RF-SVC-008
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Etapa 1 con maestro local de gestores y líderes; se conecta a NEXUS en la Etapa 2 (RF-SVC-062)
- Planificación (PLT-04 v1.2): Prioridad: **DEBE** · Iteración: **I1** · Estimación: **4 h** · Asignado: **Dev 2** (2026-10-20 → 2026-10-20) · Depende de HU: HU-ATC-007
- Observaciones de alcance: Fuera de alcance: Detección automática de ceses desde RR. HH. (propuesta futura).
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · asignación del ticket | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · derivación y reasignación | 6.5 Diagrama entidad-relación · enrutamiento

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Reasignar en bloque los tickets de un colaborador que cesa

Escenario: CA-01 · Cese
  Dado un colaborador con 12 tickets pendientes que cesa
  Cuando reasigno sus tickets a otro responsable
  Entonces cada ticket recibe una fila nueva con motivo REASSIGNMENT_CESE y el nuevo responsable.

Escenario: CA-02 · Reparto
  Dado que elijo varios destinatarios
  Cuando confirmo
  Entonces los tickets se reparten y el resumen muestra cuántos recibió cada uno.

Escenario: CA-03 · Permiso (agregado por el PO)
  Dado que no soy supervisor
  Cuando intento reasignar en bloque
  Entonces la acción no está disponible.
```

- Evidencia / prueba esperada (PLT-04): `Evento reasignación_masiva {n_tickets, motivo}`

## Reglas de negocio

- RN-SVC-043 (Etapas del proyecto): Etapa 1 (salida 30-oct-2026): todo el alcance funcional, con usuarios, roles y líderes locales y sin UrbeMind. Etapa 2 (cierre estimado 15-dic-2026): integraciones con NEXUS, DAEDALUS y UrbeMind, que dependen de tecnología aún en construcción. Ninguna funcionalidad de la Etapa 1 se bloquea por estas integraciones.
- RN-SVC-006 (Asignacion append-only): Cada movimiento de area/responsable es fila nueva con motivo tipificado; los punteros actuales son denormalizados.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Prototipo / pantalla de referencia (artefacto): Por diseñar: Bandeja › Acciones masivas — Mockups: P-01 "Bandeja de tickets" (Mi casillero por área y responsable; Bandeja orquestadora con rayo, carga por agente y reasignación en bloque (propuesta))
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `POST /api/v1/tickets/reasignacion-masiva` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades catalogadas (.ods): ENT-SVC-003 SVC_TICKET_ASSIGNMENT_LOG
- Entidades y dependencias declaradas en PLT-04: SVC_TICKET_ASSIGNMENT_LOG
- Entidades/campos que LEE: SVC_TICKET_ASIGNACION del colaborador que cesa
- Entidades/campos que ESCRIBE o modifica: SVC_TICKET_ASIGNACION (filas nuevas REASSIGNMENT_CESE)
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
