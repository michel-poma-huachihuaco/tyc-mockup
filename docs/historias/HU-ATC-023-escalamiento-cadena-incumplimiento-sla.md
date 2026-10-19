---
id: "HU-ATC-023"
tipo: hu
titulo: "Escalar en cadena un caso que incumple su SLA"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-09", "EP-ATC-04", "AYB-0001"]
tags: [hu]
ui: false
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-023-escalamiento-cadena-incumplimiento-sla.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-04 / docs/analisis/BRD.md
- Como gestor de la Mesa de Casos (SGD) quiero que un caso que incumple su SLA escale automáticamente de alerta a memorándum, Comité y Directorio para que ningún caso se estanque sin que una instancia superior lo sepa.
- Requerimiento origen (RF-SVC-023 — Escalamiento en cadena por incumplimiento de SLA): El sistema debe escalar automáticamente, sin saltar niveles: alerta temprana, memorándum a jefatura, Comité y Directorio. · Proceso: PROC-SVC-010 (Escalamiento institucional, vinculacion y cierre tipificado de casos sensibles) · Fuente: PLT-04 · HU-ATC-023 · traza RF-SVC-023
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Salida 30-oct-2026
- Planificación (PLT-04 v1.2): Prioridad: **DEBE** · Iteración: **I2** · Estimación: **5 h** · Asignado: **Dev 2** (2026-10-28 → 2026-10-28) · Depende de HU: HU-ATC-022
- Observaciones de alcance: Fuera de alcance: Agenda de sesiones del Comité.
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · escalamiento en cadena | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · escalamiento y cierre | 6.5 Diagrama entidad-relación · escalamiento y cierre (por modelar · R-06)
- Referencia visual / plantilla en prototipo: Prototipo › Mesa SGD (escalera de escalamiento) [P-06 "Mesa de Casos SGD"]

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Escalar en cadena un caso que incumple su SLA

Escenario: CA-01 · Alerta temprana
  Dado un caso próximo a vencer su SLA de línea
  Cuando se alcanza el umbral
  Entonces el responsable recibe una alerta temprana.

Escenario: CA-02 · Cadena
  Dado un caso vencido sin resolución
  Cuando se cumple el plazo
  Entonces escala a memorándum a la jefatura y, si persiste, a Comité y luego a Directorio, sin saltar niveles.

Escenario: CA-03 · Resolución (agregado por el PO)
  Dado un caso escalado a Comité
  Cuando se resuelve
  Entonces se detiene la cadena y queda el historial de niveles alcanzados.
```

- Evidencia / prueba esperada (PLT-04): `Evento escalamiento {nivel}`

## Reglas de negocio

- RN-SVC-017 (Escalamiento en cadena sin saltos): El incumplimiento de SLA de un caso sensible escala en cadena: alerta preventiva, alerta de vencimiento, memorandum a la jefatura, escalado a Comite y escalado a Directorio, sin saltar niveles.

## Datos (CAD-F5)

- Entidades y dependencias declaradas en PLT-04: Job batch · entidad por modelar
- Entidades/campos que LEE: SVC_SENSITIVE_CASE (SLA de línea)
- Entidades/campos que ESCRIBE o modifica: SVC_SENSITIVE_CASE_ESCALATION (nivel, fecha)
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
