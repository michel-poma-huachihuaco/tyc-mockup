---
id: "HU-ATC-022"
tipo: hu
titulo: "Clasificación de riesgo por matriz objetiva y recalibración"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["FT-ATC-08", "EP-ATC-04", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-022-clasificacion-riesgo-matriz-objetiva-recalibracion.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-04 / docs/analisis/BRD.md
- Como Gestor de Reclamos quiero calcular el nivel de riesgo de cada caso con una matriz objetiva de criterios ponderados, permitiendo recalibrar el nivel cuando el caso evoluciona, para no depender de un juicio subjetivo.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Recalibrar el riesgo de un caso que evoluciona
  Dado un caso sensible con un nivel de riesgo ya calculado
  Cuando aparecen nuevos elementos o se vincula con otro caso
  Entonces el sistema permite recalibrar el nivel con la misma matriz objetiva, dejando registro del cambio
```

## Reglas de negocio

- RN-SVC-016: clasificación de riesgo objetiva y recalibrable, nunca por percepción.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `PATCH /api/v1/casos-sensibles/{id}/riesgo` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades/campos que LEE: SVC_SENSITIVE_CASE, matriz de criterios ponderados
- Entidades/campos que ESCRIBE o modifica: SVC_SENSITIVE_CASE.RiskLevel, historial de recalibración
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
