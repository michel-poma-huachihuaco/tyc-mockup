---
id: "HU-ATC-054"
tipo: hu
titulo: "Ver mi avance diario y el de mi equipo"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-21", "EP-ATC-09", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-054-tablero-avance-diario-agente.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-09 / docs/analisis/BRD.md
- Como gestor de tickets y su líder quiero ver un tablero con tickets atendidos, pendientes, en riesgo y CSAT del día para seguir la productividad y corregir a tiempo.
- Requerimiento origen (RF-SVC-054 — Tablero de avance diario del agente): El sistema debe mostrar a cada gestor de tickets y a su líder un tablero de avance diario: tickets atendidos, pendientes, cumplimiento de SLA, tiempo medio y CSAT. Feedback presentación · ítem 13 · Proceso: PROC-SVC-020 (Productividad y notificaciones del agente) · Fuente: PLT-04 · HU-ATC-054 · traza RF-SVC-054
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Etapa 1 con maestro local de gestores y líderes; se conecta a NEXUS en la Etapa 2 (RF-SVC-062)
- Planificación (PLT-04 v1.2): Prioridad: **DEBERIA** · Iteración: **I1** · Estimación: **4 h** · Asignado: **Dev 3** (2026-10-23 → 2026-10-23) · Depende de HU: HU-ATC-046 · Dependencias externas: DEP-02 (NEXUS (tercero): identidad de colaboradores, SSO y roles)
- Observaciones de alcance: Fuera de alcance: Evaluación de desempeño.
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · asignación notificada | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · correo de asignación | 6.5 Diagrama entidad-relación · notificación y avance

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Ver mi avance diario y el de mi equipo

Escenario: CA-01 · Tablero del gestor
  Dado un gestor de tickets en su jornada
  Cuando abre su tablero
  Entonces ve sus tickets atendidos, pendientes, en riesgo y su CSAT del día actualizados.

Escenario: CA-02 · Tablero del líder
  Dado un líder
  Cuando abre el tablero de su equipo
  Entonces ve el avance diario de cada gestor de tickets y puede ir al ticket en riesgo.

Escenario: CA-03 · Privacidad (agregado por el PO)
  Dado un gestor que abre el tablero
  Cuando consulta el avance
  Entonces ve solo el suyo; el del equipo es visible para su líder.
```

- Evidencia / prueba esperada (PLT-04): `Evento tablero_visto Preguntas abiertas ¿Qué metas diarias tiene cada gestor de tickets? ¿El tablero del gestor de tickets es visible para sus pares?`

## Reglas de negocio

- RN-SVC-043 (Etapas del proyecto): Etapa 1 (salida 30-oct-2026): todo el alcance funcional, con usuarios, roles y líderes locales y sin UrbeMind. Etapa 2 (cierre estimado 15-dic-2026): integraciones con NEXUS, DAEDALUS y UrbeMind, que dependen de tecnología aún en construcción. Ninguna funcionalidad de la Etapa 1 se bloquea por estas integraciones.
- RN-SVC-025 (Cierre end-to-end en 72 horas habiles): El cierre end-to-end del ticket sin escalamiento debe completarse en 72 horas habiles; si hay escalamiento, aplica el plazo propio del eje correspondiente.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Prototipo / pantalla de referencia (artefacto): Prototipo › Mi día — Mockups: P-14 "Tablero de avance diario" (Mi avance (agente); Avance del equipo (líder))
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `GET /api/v1/gestores/{id}/avance-diario` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades y dependencias declaradas en PLT-04: ENT-SVC-001 SVC_TICKET, ENT-SVY-001 SVY_SURVEY_RESPONSE · DEP-02
- Entidades/campos que LEE: SVC_TICKET (atendidos, pendientes, SLA), respuestas de encuesta (CSAT)
- Entidades/campos que ESCRIBE o modifica: ninguna (solo lectura)
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
