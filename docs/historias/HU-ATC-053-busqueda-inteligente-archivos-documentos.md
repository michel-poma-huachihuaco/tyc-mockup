---
id: "HU-ATC-053"
tipo: hu
titulo: "Búsqueda inteligente en archivos y documentos del cliente"
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

Va en `docs/historias/HU-ATC-053-busqueda-inteligente-archivos-documentos.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-10 / docs/analisis/BRD.md
- Como gestor de tickets quiero que el sistema indexe con un modelo de red neuronal (búsqueda semántica) los archivos y documentos de los clientes, para encontrar información por significado y no solo por palabras exactas, aunque no sepa cómo está escrito el documento o dato.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Encontrar un documento por significado
  Dado documentos del cliente indexados semánticamente
  Cuando el gestor busca con una frase que no coincide textualmente con el documento
  Entonces el sistema devuelve resultados relevantes con el fragmento, respetando los permisos del rol
```

## Reglas de negocio

- RN-SVC-036: la búsqueda respeta los permisos del sistema de origen.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `GET /api/v1/clientes/{id}/documentos/buscar-semantico` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades/campos que LEE: documentos del cliente (repositorios a confirmar), índice semántico
- Entidades/campos que ESCRIBE o modifica: índice semántico de documentos (job de indexación)
- Migración / backfill / borrado: no
- Checklist CAD-F5: [pendiente - se completa en F4]

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
