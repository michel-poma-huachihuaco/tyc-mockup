---
id: "HU-ATC-018"
tipo: hu
titulo: "Exponer tickets por API/evento a UrbeMind"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["FT-ATC-11", "EP-ATC-06", "AYB-0001"]
tags: [hu]
ui: false
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-018-exponer-tickets-api-evento-urbemind.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-06 / docs/analisis/BRD.md
- Como UrbeMind quiero exponer creación y consulta de tickets vía API/evento hacia la aplicación UrbeMind (SaaS en ambiente físico separado), tratándola como un canal más sin JOIN físico, para operar como canal adicional sin acoplarme físicamente a la base del holding.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Crear un ticket desde UrbeMind por API
  Dado que UrbeMind reporta una incidencia de ciudad
  Cuando llama a la API de creación de tickets
  Entonces el sistema crea el ticket CITY_INCIDENT sin ningún acceso directo a la base de datos
```

## Reglas de negocio

- RN-SVC-005: empresa y línea obligatorias; ContractID puede ser nullable en este caso.

## Datos (CAD-F5)

- Entidades/campos que LEE: SVC_TICKET (consulta)
- Entidades/campos que ESCRIBE o modifica: SVC_TICKET (creación vía API/evento)
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
