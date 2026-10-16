---
id: "HU-ATC-045"
tipo: hu
titulo: "Marcar un ticket con rayo de prioridad"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["FT-ATC-18", "EP-ATC-09", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-045-marcar-ticket-rayo-prioridad.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-09 / docs/analisis/BRD.md
- Como supervisor o líder quiero marcar un ticket con un icono de rayo que lo sube al tope de la bandeja, registrando quién lo marcó y por qué, para dar atención inmediata a casos críticos sin cambiar su tipo ni su SLA.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Marcar un ticket con rayo
  Dado un ticket crítico en la bandeja
  Cuando el líder lo marca con rayo e indica el motivo
  Entonces el sistema lo sube al tope de la bandeja y registra quién lo marcó, cuándo y por qué, en bitácora

Escenario: Bloquear el rayo a un rol sin permiso
  Dado un gestor de tickets sin rol de supervisor o líder
  Cuando intenta marcar un ticket con rayo
  Entonces el sistema lo rechaza
```

## Reglas de negocio

- RN-SVC-031: prioridad rayo controlada, solo supervisor o líder, con motivo y en bitácora.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `POST /api/v1/tickets/{id}/rayo` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades/campos que LEE: rol del usuario
- Entidades/campos que ESCRIBE o modifica: SVC_TICKET.Rayo, bitácora de marca
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
