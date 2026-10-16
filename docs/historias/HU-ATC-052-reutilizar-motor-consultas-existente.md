---
id: "HU-ATC-052"
tipo: hu
titulo: "Reutilizar el motor de consultas existente"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["FT-ATC-20", "EP-ATC-10", "AYB-0001"]
tags: [hu]
ui: false
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-052-reutilizar-motor-consultas-existente.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-10 / docs/analisis/BRD.md
- Como gestor de tickets quiero que el sistema consuma el motor de consultas que ya construyó José para obtener datos específicos del cliente, integrándolo por API en lugar de desarrollar uno nuevo, para obtener datos específicos del cliente reutilizando una solución probada.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Obtener un dato específico del cliente vía el motor de José
  Dado una consulta de un dato específico del cliente
  Cuando el sistema la resuelve
  Entonces la respuesta proviene del motor de consultas existente, vía API, sin desarrollar lógica duplicada
```

## Reglas de negocio

- No aplica una regla de negocio adicional; es una decisión de integración (reutilizar en vez de construir).

## Datos (CAD-F5)

- Entidades/campos que LEE: motor de consultas de José (vía API)
- Entidades/campos que ESCRIBE o modifica: ninguna (solo lectura)
- Migración / backfill / borrado: no
- Checklist CAD-F5: [pendiente - se completa en F4]

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
