---
id: "HU-ATC-035"
tipo: hu
titulo: "Registrar la inspección técnica antes de resolver"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-10", "EP-ATC-05", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-035-inspeccion-tecnica-resolucion-reclamo.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-05 / docs/analisis/BRD.md
- Como gestor de Postventa quiero programar y registrar la inspección con su informe y fotos antes de resolver para aprobar, rechazar o resolver con trazabilidad completa.
- Requerimiento origen (RF-SVC-035 — Inspeccion tecnica y resolucion del reclamo): El sistema debe registrar la inspección técnica con su evidencia antes de resolver el reclamo. · Proceso: PROC-SVC-013 (Gestion de reclamos de garantia postventa) · Fuente: PLT-04 · HU-ATC-035 · traza RF-SVC-035
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Salida 30-oct-2026
- Planificación (PLT-04 v1.2): Prioridad: **DEBERIA** · Iteración: **I2** · Estimación: **3 h** · Asignado: **Dev 1** (2026-10-28 → 2026-10-28) · Depende de HU: HU-ATC-033
- Observaciones de alcance: Fuera de alcance: Costeo de la reparación.
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · reclamo de garantía | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · registro y validación de garantía | 6.5 Diagrama entidad-relación · garantía postventa

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Registrar la inspección técnica antes de resolver

Escenario: CA-01 · Inspección
  Dado un reclamo en revisión
  Cuando programo la inspección
  Entonces queda la fecha y, luego, el informe y las fotos antes de resolver.

Escenario: CA-02 · Resolución
  Dado un reclamo inspeccionado
  Cuando lo resuelvo
  Entonces pasa a APPROVED, REJECTED o RESOLVED con fecha y descripción.
```

- Evidencia / prueba esperada (PLT-04): `Evento inspección_registrada`

## Reglas de negocio

- RN-SVC-027: una garantía siempre cuelga de una entrega previa.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Prototipo / pantalla de referencia (artefacto): Prototipo › Garantías — Mockups: P-07 "Garantías postventa" (Reclamo de garantía con cobertura, inspección y escalamiento)
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `POST /api/v1/reclamos-garantia/{id}/inspeccion` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades y dependencias declaradas en PLT-04: CONTRACT_WARRANTY_CLAIM
- Entidades/campos que LEE: SVC_WARRANTY_CLAIM
- Entidades/campos que ESCRIBE o modifica: SVC_WARRANTY_INSPECTION (evidencia, resultado)
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
