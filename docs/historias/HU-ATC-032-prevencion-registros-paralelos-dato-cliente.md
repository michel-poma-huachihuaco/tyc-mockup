---
id: "HU-ATC-032"
tipo: hu
titulo: "Prevención de registros paralelos del dato de cliente"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["FT-ATC-14", "EP-ATC-07", "AYB-0001"]
tags: [hu]
ui: false
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-032-prevencion-registros-paralelos-dato-cliente.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-07 / docs/analisis/BRD.md
- Como CDO o Coordinador CX quiero auditar quincenalmente la existencia de registros paralelos del dato de cliente fuera de SIGDA/TAXON, para mantener el dato de cliente en una única fuente.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Auditar sin registros paralelos
  Dado que corre la auditoría quincenal
  Cuando no existe ningún registro paralelo del dato de cliente
  Entonces el sistema reporta 0 casos

Escenario: Detectar un registro paralelo
  Dado un registro de datos de cliente creado fuera de SIGDA/TAXON
  Cuando corre la auditoría quincenal
  Entonces el sistema lo reporta como caso de incumplimiento
```

## Reglas de negocio

- RN-SVC-026: no pueden existir registros paralelos del dato de cliente fuera de SIGDA/TAXON; la auditoría quincenal debe arrojar cero casos.

## Datos (CAD-F5)

- Entidades/campos que LEE: SVC_TICKET y demás tablas que referencian datos de cliente
- Entidades/campos que ESCRIBE o modifica: reporte de auditoría de registros paralelos
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
