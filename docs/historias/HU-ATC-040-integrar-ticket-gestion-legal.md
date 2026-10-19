---
id: "HU-ATC-040"
tipo: hu
titulo: "Sincronizar con Legal los tickets derivados a Eje 3"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-16", "EP-ATC-10", "AYB-0001"]
tags: [hu]
ui: false
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-040-integrar-ticket-gestion-legal.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-10 / docs/analisis/BRD.md
- Como responsable legal de reclamos quiero recibir en mi herramienta los tickets derivados a Eje 3 con su paquete mínimo y devolver su estado para seguir cada caso legal en un solo lugar sin registrarlo dos veces.
- Requerimiento origen (RF-SVC-040 — Integrar el ticket con la gestion de Legal): El sistema debe sincronizar los tickets derivados a Eje 3 con la herramienta que usa el equipo de Legal (responsable: Rosario), enviando el paquete mínimo y recibiendo estado y resolución. Feedback presentación · ítem 2 · Proceso: PROC-SVC-015 (Integracion con Legal y prevencion de denuncias) · Fuente: PLT-04 · HU-ATC-040 · traza RF-SVC-040
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Salida 30-oct-2026
- Planificación (PLT-04 v1.2): Prioridad: **DEBE** · Iteración: **I1** · Estimación: **5 h** · Asignado: **Dev 4** (2026-10-23 → 2026-10-23) · Dependencias externas: DEP-12 (Herramienta de Legal (responsable: Rosario): API o intercambio para sincronizar casos de Eje 3)
- Observaciones de alcance: Fuera de alcance: Gestión del expediente judicial.
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · caso legal y riesgo de denuncia | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · sincronización con Legal | 6.5 Diagrama entidad-relación · caso legal y exposición
- Referencia visual / plantilla en prototipo: Prototipo › Ticket › pestaña Legal [P-03 "Detalle de ticket"]

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Sincronizar con Legal los tickets derivados a Eje 3

Escenario: CA-01 · Envío a Legal
  Dado un ticket derivado a Eje 3
  Cuando se confirma el handoff
  Entonces el caso aparece en la herramienta de Legal con el paquete mínimo y el N.º de ticket.

Escenario: CA-02 · Estado de vuelta
  Dado un caso que Legal actualiza o resuelve en su herramienta
  Cuando se sincroniza
  Entonces el ticket refleja el nuevo estado sin registro manual.

Escenario: CA-03 · Legal no disponible (agregado por el PO)
  Dado que la herramienta de Legal no responde
  Cuando se confirma un handoff a Eje 3
  Entonces el envío queda en cola, se reintenta y el ticket muestra «pendiente de sincronizar».
```

- Evidencia / prueba esperada (PLT-04): `Evento legal_sync {estado} Preguntas abiertas ¿Qué herramienta usa hoy Legal (sistema, Excel, correo)? ¿Rosario es la dueña funcional de la integración? ¿La sincronización es en línea o por lotes?`

## Reglas de negocio

- RN-SVC-021 (Gate: un caso de conflicto no se resuelve en Eje 1/2): Un caso de conflicto (carta notarial, INDECOPI, abogado, prensa) no se resuelve en Eje 1/2: se deriva de inmediato al Eje 3 (Legal); es un gate no compensable.
- RN-SVC-022 (Gate: derivacion sin paquete minimo): Una derivacion entre ejes sin criterio objetivo, sin paquete minimo completo o sin trazabilidad es un gate no compensable.

## Datos (CAD-F5)

- Entidades y dependencias declaradas en PLT-04: ENT-SVC-001 SVC_TICKET, ENT-SVC-003 SVC_TICKET_ASSIGNMENT_LOG · DEP-12
- Entidades/campos que LEE: SVC_TICKET_HANDOFF
- Entidades/campos que ESCRIBE o modifica: sincronización con la herramienta de Legal (estado, resolución)
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
