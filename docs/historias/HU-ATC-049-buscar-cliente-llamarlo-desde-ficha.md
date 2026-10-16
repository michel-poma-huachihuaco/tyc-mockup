---
id: "HU-ATC-049"
tipo: hu
titulo: "Buscar al cliente y llamarlo desde la ficha"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["FT-ATC-20", "EP-ATC-10", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-049-buscar-cliente-llamarlo-desde-ficha.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-10 / docs/analisis/BRD.md
- Como gestor de tickets quiero un motor de búsqueda de clientes por DNI, nombre, código de cliente, lote, teléfono o N.º de ticket, con opción de llamar a la cuenta desde la ficha, para ubicar al cliente en segundos y contactarlo sin marcar a mano.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Buscar un cliente por DNI
  Dado un gestor que busca por DNI
  Cuando ejecuta la búsqueda
  Entonces el sistema devuelve el resultado en ≤ 2 segundos y permite llamar a la cuenta desde la ficha
```

## Reglas de negocio

- RN-SVC-036: la búsqueda respeta los permisos del sistema de origen.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `GET /api/v1/clientes/buscar` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades/campos que LEE: SIGDA/TAXON (DNI, nombre, código, lote, teléfono), SVC_TICKET
- Entidades/campos que ESCRIBE o modifica: ninguna (solo lectura y registro de la llamada)
- Migración / backfill / borrado: no
- Checklist CAD-F5: [pendiente - se completa en F4]

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
