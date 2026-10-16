---
id: "HU-ATC-023"
tipo: hu
titulo: "Escalamiento en cadena por incumplimiento de SLA"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["FT-ATC-09", "EP-ATC-04", "AYB-0001"]
tags: [hu]
ui: false
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-023-escalamiento-cadena-incumplimiento-sla.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-04 / docs/analisis/BRD.md
- Como Mesa de Casos quiero escalar automáticamente un caso que incumple su SLA de línea, desde alerta temprana hasta memorándum a la jefatura y, de persistir, hasta Comité y Directorio, para que ningún caso se estanque sin que una instancia superior lo sepa.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Escalar un caso sin saltar niveles
  Dado un caso sensible que incumple su SLA de línea
  Cuando el job de escalamiento corre
  Entonces el sistema avanza al siguiente nivel de la secuencia (alerta temprana → memorándum a jefatura → Comité → Directorio) sin saltar ninguno
```

## Reglas de negocio

- RN-SVC-017: escalamiento en cadena sin saltos.

## Datos (CAD-F5)

- Entidades/campos que LEE: SVC_SENSITIVE_CASE (SLA de línea)
- Entidades/campos que ESCRIBE o modifica: SVC_SENSITIVE_CASE_ESCALATION (nivel, fecha)
- Migración / backfill / borrado: no
- Checklist CAD-F5: [pendiente - se completa en F4]

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
