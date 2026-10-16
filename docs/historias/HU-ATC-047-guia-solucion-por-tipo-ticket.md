---
id: "HU-ATC-047"
tipo: hu
titulo: "Guía de solución por tipo de ticket"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["FT-ATC-19", "EP-ATC-09", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-047-guia-solucion-por-tipo-ticket.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-09 / docs/analisis/BRD.md
- Como gestor de tickets quiero ver una guía de cómo solucionar cada tipo de ticket (pasos, plantillas de respuesta, documentos requeridos y criterios de cierre) mantenida por el administrador funcional, para resolver de forma estándar y en el primer contacto, incluso si soy nuevo.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Consultar la guía de un tipo de ticket
  Dado un ticket de un tipo con guía publicada
  Cuando el gestor abre el ticket
  Entonces el sistema le muestra la guía versionada de ese tipo (pasos, plantillas, documentos, criterios de cierre)
```

## Reglas de negocio

- No aplica una regla de negocio adicional; la mantiene el administrador funcional.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `GET /api/v1/guias-solucion/{tipoTicket}` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades/campos que LEE: SVC_SOLUTION_GUIDE (por tipo de ticket, versionada)
- Entidades/campos que ESCRIBE o modifica: ninguna (solo lectura para el gestor; la mantiene el administrador funcional)
- Migración / backfill / borrado: no
- Checklist CAD-F5: [pendiente - se completa en F4]

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
