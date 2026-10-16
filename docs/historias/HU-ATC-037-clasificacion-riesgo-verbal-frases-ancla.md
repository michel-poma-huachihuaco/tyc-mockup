---
id: "HU-ATC-037"
tipo: hu
titulo: "Clasificación de riesgo verbal y secuencia de Frases Ancla"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["FT-ATC-15", "EP-ATC-08", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-037-clasificacion-riesgo-verbal-frases-ancla.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-08 / docs/analisis/BRD.md
- Como Moderador de evento quiero registrar la clasificación de riesgo de una intervención verbal en vivo y la secuencia de Frases Ancla aplicada (4, 5, 6), para contener la insistencia antes de derivar formalmente.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Registrar la secuencia de contención completa
  Dado un propietario insistente en un EntregaFest
  Cuando el moderador aplica la Frase 4, luego la 5 y luego la 6
  Entonces el sistema exige registrar el caso al llegar a la Frase 6
```

## Reglas de negocio

- RN-SVC-029: palabras de riesgo muy alto obligan canalización formal.
- RN-SVC-030: secuencia de contención verbal 4-5-6, en ese orden, antes de derivar.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `POST /api/v1/entregafest/casos` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades/campos que LEE: catálogo de Frases Ancla
- Entidades/campos que ESCRIBE o modifica: SVC_EVENT_SENSITIVE_CASE (clasificación de riesgo, secuencia aplicada)
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
