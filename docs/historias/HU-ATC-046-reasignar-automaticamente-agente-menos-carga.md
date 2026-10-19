---
id: "HU-ATC-046"
tipo: hu
titulo: "Reasignar automáticamente al gestor con menos carga"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-18", "EP-ATC-09", "AYB-0001"]
tags: [hu]
ui: false
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-046-reasignar-automaticamente-agente-menos-carga.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-09 / docs/analisis/BRD.md
- Como supervisor ATC quiero que un ticket pase al gestor disponible del mismo área y habilidad con menos carga cuando el responsable está saturado o ausente para evitar incumplimientos por saturación.
- Requerimiento origen (RF-SVC-046 — Reasignar automaticamente al agente con menos carga): El sistema debe reasignar un ticket al gestor de tickets disponible del mismo área y habilidad con menor carga de trabajo cuando el responsable no esta disponible o su carga supera el límite. Feedback presentación · ítem 18 · Proceso: PROC-SVC-017 (Orquestacion de bandeja y flujos de trabajo por area) · Fuente: PLT-04 · HU-ATC-046 · traza RF-SVC-046
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Etapa 1 con maestro local de gestores y líderes; se conecta a NEXUS en la Etapa 2 (RF-SVC-062)
- Planificación (PLT-04 v1.2): Prioridad: **DEBERIA** · Iteración: **I1** · Estimación: **4 h** · Asignado: **Dev 3** (2026-10-21 → 2026-10-21) · Depende de HU: HU-ATC-044 · Dependencias externas: DEP-02 (NEXUS (tercero): identidad de colaboradores, SSO y roles)
- Observaciones de alcance: Fuera de alcance: Gestión de turnos y vacaciones.
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · ticket en la bandeja orquestadora | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · asignación por la bandeja | 6.5 Diagrama entidad-relación · flujos y asignación
- Referencia visual / plantilla en prototipo: Prototipo › Bandeja (supervisor) [P-01 "Bandeja de tickets"]

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Reasignar automáticamente al gestor con menos carga

Escenario: CA-01 · Balanceo
  Dado un gestor de tickets con carga mayor al límite
  Cuando entra un ticket nuevo
  Entonces se asigna al gestor de tickets disponible con menos tickets activos ponderados y se registra el motivo REASSIGNMENT_CARGA.

Escenario: CA-02 · Exclusiones
  Dado un ticket con rayo, en Eje 3 o con interacción en curso
  Cuando corre el balanceo
  Entonces no se reasigna.

Escenario: CA-03 · Nadie disponible (agregado por el PO)
  Dado que no hay gestores disponibles en el área
  Cuando corre el balanceo
  Entonces el ticket queda en la cola del área y se alerta al supervisor.
```

- Evidencia / prueba esperada (PLT-04): `Evento reasignacion_carga Preguntas abiertas ¿Cómo se mide la carga (n.º de tickets, ponderado por prioridad, tiempo estimado)? ¿Se considera ausencia por vacaciones o turno?`

## Reglas de negocio

- RN-SVC-043 (Etapas del proyecto): Etapa 1 (salida 30-oct-2026): todo el alcance funcional, con usuarios, roles y líderes locales y sin UrbeMind. Etapa 2 (cierre estimado 15-dic-2026): integraciones con NEXUS, DAEDALUS y UrbeMind, que dependen de tecnología aún en construcción. Ninguna funcionalidad de la Etapa 1 se bloquea por estas integraciones.
- RN-SVC-033 (Reasignacion por menor carga): La reasignacion automatica elige al agente disponible del mismo area y habilidad con menos tickets activos ponderados por prioridad; no mueve tickets con rayo, en Eje 3 o con interaccion en curso.
- RN-SVC-006 (Asignacion append-only): Cada movimiento de area/responsable es fila nueva con motivo tipificado; los punteros actuales son denormalizados.

## Datos (CAD-F5)

- Entidades y dependencias declaradas en PLT-04: ENT-SVC-003 SVC_TICKET_ASSIGNMENT_LOG, ENT-SVC-001 SVC_TICKET · DEP-02
- Entidades/campos que LEE: SVC_TICKET_ASIGNACION, disponibilidad y carga por gestor
- Entidades/campos que ESCRIBE o modifica: SVC_TICKET_ASIGNACION (fila REASSIGNMENT_CARGA)
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
