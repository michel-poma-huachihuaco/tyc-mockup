---
id: "HU-ATC-055"
tipo: hu
titulo: "Alertar por correo la asignación con copia al líder"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["FT-ATC-21", "EP-ATC-09", "AYB-0001"]
tags: [hu]
ui: false
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-055-alertar-correo-asignacion-copia-lider.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-09 / docs/analisis/BRD.md
- Como job batch de ATC quiero enviar una alerta por correo al gestor de tickets cada vez que se le asigna o reasigna un ticket, con copia a su líder, indicando N.º, tipo, prioridad y vencimiento de SLA, para que nadie ignore una asignación y el líder tenga visibilidad.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Enviar el correo de asignación
  Dado un ticket que se asigna a un gestor
  Cuando la asignación se confirma
  Entonces el sistema envía un correo al gestor con copia a su líder, en menos de 1 minuto, con N.º, tipo, prioridad y vencimiento de SLA
```

## Reglas de negocio

- RN-SVC-035: aviso de asignación con copia al líder, una sola vez por movimiento.

## Datos (CAD-F5)

- Entidades/campos que LEE: SVC_TICKET_ASIGNACION, líder del gestor (NEXUS)
- Entidades/campos que ESCRIBE o modifica: registro de envío de correo de asignación
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
