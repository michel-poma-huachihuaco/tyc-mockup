---
id: "HU-NNN"
tipo: hu
titulo: "[capacidad, en pocas palabras]"
estado: draft
producto: "[producto]"
version: "0.1"
owner: "[Product Owner]"
aprobadores: []
fecha: "AAAA-MM-DD"
relacionados: ["FT-NNN", "EP-NN", "AYB-NNNN"]
tags: [hu]
ui: false
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-NNN-<slug>.md`.

- Ticket: [AYB-NNNN] - Tipo: [T1|T2|T3] - Epica/BRD: [enlace]
- Como [rol] quiero [capacidad] para [valor].

`ui`: `true` si la historia tiene pantalla (algo que el usuario ve o toca en el
frontend), `false` si no. Lo decide el PO al escribirla. Con `true`, la feature
exige G2 (diseno UX/UI aprobado por PO + UX: `.agents/templates/g2-diseno.md`)
en `origin/main` antes de construir, ademas de G4 (y G3 si existe); lo cortan el
guardian de G4 y `aybar paquete validar`. Valen `true`/`false` (tambien
`si`/`no`, `yes`/`no`); cualquier otro valor no marca pantalla y el validador lo
avisa. El tag `ui` en `tags` equivale a `ui: true`. Una HU con tareas de capa
`frontend` en `docs/backlog/tareas/` y `ui: false` es una contradiccion: el
validador la avisa (`hu-frontend-sin-ui`).

## Criterios de aceptacion (Gherkin, verificables)

```gherkin
Escenario: [nombre]
  Dado [contexto]
  Cuando [accion]
  Entonces [resultado observable]
```

## Reglas de negocio

- [regla explicita, con numero si es NFR: p95 < 400 ms, no "rapido"]

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (version fija): [enlace del envio de G2]
- Estados que aplican: [vacio / carga / error / sin permisos / responsive]
- Operaciones del contrato que consume: [`GET /api/v1/...`, de docs/arquitectura/]

## Datos (CAD-F5)

- Entidades/campos que LEE: [lista]
- Entidades/campos que ESCRIBE o modifica: [lista]
- Migracion / backfill / borrado: [no | si -> declarado en F4]
- Checklist CAD-F5: [enlace al registro en la herramienta]

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explicitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: [si/no] - Revisado por: [nombre, fecha]
