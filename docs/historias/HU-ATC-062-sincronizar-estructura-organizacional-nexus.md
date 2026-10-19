---
id: "HU-ATC-062"
tipo: hu
titulo: "Sincronizar la estructura organizacional desde NEXUS"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-24", "EP-ATC-10", "AYB-0001"]
tags: [hu]
ui: false
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-062-sincronizar-estructura-organizacional-nexus.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-10 / docs/analisis/BRD.md
- Como supervisor o líder de equipo (sistema integrado con ACT-050 NEXUS) quiero obtener de NEXUS el líder, el área y la disponibilidad de cada gestor de tickets para el correo de asignación con copia al líder, el tablero del equipo y la reasignación por cese o por carga, para que asignaciones, copias y reasignaciones usen siempre la organización vigente.
- Requerimiento origen (RF-SVC-062 — Sincronizar la estructura organizacional desde NEXUS): El sistema debe obtener de NEXUS el líder, el área y la disponibilidad de cada gestor de tickets para el correo de asignación con copia al líder, el tablero del equipo y la reasignación por cese o por carga para los supervisores y líderes permitiendo que asignaciones, copias y reasignaciones usen siempre la organización vigente. Decisión PO · división por etapas oct-2026 · ítem 2 · Capacidad: CAP-SVC-018 (Integración con plataformas corporativas en construcción — Etapa 2) · Proceso: PROC-SVC-023 (Integraciones de plataforma: NEXUS y DAEDALUS — Etapa 2) · Objetivo: OBJ-SVC-001 · Necesidad: NEC-SVC-012 · Fuente: ATC_requerimientos.xlsx.ods · HU-ATC-062 · traza RF-SVC-062
- Etapa del proyecto (RN-SVC-043): **Etapa 2** — Integración con UrbeMind / NEXUS / DAEDALUS · tecnología de terceros en construcción · cierre estimado 15-dic-2026.
- Planificación (Etapa 2): Prioridad: **DEBE** · Iteración: **Etapa 2 (cierre estimado 15-dic-2026)** · Estimación: **5 h** · Asignado: **Dev 4** · Depende de HU: HU-ATC-061, HU-ATC-008, HU-ATC-046, HU-ATC-054, HU-ATC-055 · Dependencias externas: DEP-02 (NEXUS: relación líder-colaborador, disponibilidad y eventos de cese)
- Observaciones de alcance: Reemplaza el maestro local de gestores y líderes de la Etapa 1 utilizado en RF-SVC-008 (`HU-ATC-008`), RF-SVC-046 (`HU-ATC-046`), RF-SVC-054 (`HU-ATC-054`) y RF-SVC-055 (`HU-ATC-055`).
- Preguntas abiertas (.ods): ¿NEXUS publica la relación líder-colaborador, la disponibilidad y los ceses? ¿Con qué frecuencia?

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Sincronizar la estructura organizacional desde NEXUS

Escenario: CA-01 · Copia de asignación al nuevo líder sincronizado desde NEXUS
  Dado un gestor que cambia de líder en NEXUS
  Cuando se le asigna un ticket
  Entonces el correo de asignación va con copia al nuevo líder.

Escenario: CA-02 · Detección de cese en NEXUS y propuesta de reasignación en bloque
  Dado un colaborador marcado como cesado en NEXUS
  Cuando se sincroniza
  Entonces sus tickets se proponen para la reasignación en bloque (RF-SVC-008).
```

- Evidencia / prueba esperada: `Sincronización de SVC_IDENTITY_LINK con nuevo líder + disparo de correo con CC al líder vigente y propuesta de reasignación masiva ante evento de cese`

## Reglas de negocio

- RN-SVC-035 (Aviso de asignación con copia al líder): Cada asignación o reasignación envía un correo al gestor asignado con copia a su líder inmediato.
- RN-SVC-033 (Reasignación por menor carga): La asignación automática y el balanceo eligen al gestor activo y disponible del área con menor carga ponderada.
- RN-SVC-043 (Etapas del proyecto): Etapa 1 (salida 30-oct-2026): todo el alcance funcional, con usuarios, roles y líderes locales y sin UrbeMind. Etapa 2 (cierre estimado 15-dic-2026): integraciones con NEXUS, DAEDALUS y UrbeMind, que dependen de tecnología aún en construcción. Ninguna funcionalidad de la Etapa 1 se bloquea por estas integraciones.

## Datos (CAD-F5)

- Entidades y dependencias declaradas en .ods: ENT-SVC-021 SVC_IDENTITY_LINK, ENT-SVC-003 SVC_TICKET_ASSIGNMENT_LOG
- Entidades/campos que LEE: estructura organizacional (líder, área, disponibilidad, estado de cese) desde NEXUS (ACT-050)
- Entidades/campos que ESCRIBE o modifica: SVC_IDENTITY_LINK, SVC_TICKET_ASSIGNMENT_LOG
- Migración / backfill / borrado: transición del maestro local de gestores/líderes (Etapa 1) a `SVC_IDENTITY_LINK` (Etapa 2)
- Checklist CAD-F5: Aprobado — `ENT-SVC-021` (`SVC_IDENTITY_LINK`) y `ENT-SVC-003` (`SVC_TICKET_ASSIGNMENT_LOG`) en `docs/datos/diccionario.md`

## DoR (G4) - no entra al sprint sin esto

- [x] Valor claro - [x] Gherkin verificable - [x] Reglas explícitas
- [x] G2 cerrado si `ui: true` (no aplica, `ui: false`) - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas (NEXUS en construcción · Etapa 2, cierre estimado 15-dic-2026) - [x] Casos iniciales de QA
- [ ] Estimada por el equipo - [x] Cabe en un sprint

Generado por IA: incorporado desde `ATC_requerimientos.xlsx.ods` (`RF-SVC-062`, `PROC-SVC-023`, Etapa 2) — Revisado por: pendiente
