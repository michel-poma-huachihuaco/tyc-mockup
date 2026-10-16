---
id: "HU-ATC-001"
tipo: hu
titulo: "Registrar tickets multicanal tipificados"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["FT-ATC-01", "EP-ATC-01", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-001-registrar-tickets-multicanal-tipificados.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-01 / docs/analisis/BRD.md
- Como gestor de tickets quiero registrar cada solicitud que llega por teléfono, WhatsApp o correo en un ticket tipificado (canal, cliente, empresa/RUC y línea de negocio obligatorias, establecimiento opcional, tipo, prioridad, resumen y descripción) para tipificar cada solicitud desde el primer contacto.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Registrar un ticket con los campos obligatorios completos
  Dado que un gestor de tickets atiende una llamada de un cliente
  Cuando registra el ticket con canal, cliente, empresa (RUC), línea de negocio, tipo, prioridad, resumen y descripción
  Entonces el sistema guarda el ticket y lo asigna a su razón social

Escenario: Rechazar el registro sin un campo obligatorio
  Dado que el gestor de tickets no indica la empresa (RUC)
  Cuando intenta guardar el ticket
  Entonces el sistema rechaza el guardado y señala el campo obligatorio faltante
```

## Reglas de negocio

- RN-SVC-005: CompanyID y BusinessLineID son NOT NULL y no derivables.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `POST /api/v1/tickets` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades/campos que LEE: cliente (SIGDA/TAXON), catálogo de tipos y prioridades
- Entidades/campos que ESCRIBE o modifica: SVC_TICKET (canal, cliente, empresa, línea de negocio, establecimiento, tipo, prioridad, resumen, descripción)
- Migración / backfill / borrado: no
- Checklist CAD-F5: [pendiente - se completa en F4]

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
