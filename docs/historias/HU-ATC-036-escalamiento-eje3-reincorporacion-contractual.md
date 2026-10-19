---
id: "HU-ATC-036"
tipo: hu
titulo: "Escalar la garantía a Eje 3 y gestionar la adenda"
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

Va en `docs/historias/HU-ATC-036-escalamiento-eje3-reincorporacion-contractual.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-05 / docs/analisis/BRD.md
- Como gestor de Postventa quiero escalar a Legal un reclamo de garantía con conflicto y gestionar la adenda cuando corresponda para no resolver en Postventa lo que es legal y cerrar la reincorporación contractual.
- Requerimiento origen (RF-SVC-036 — Escalamiento a Eje 3 y reincorporacion contractual): El sistema debe escalar a Eje 3 un reclamo de garantía que derive en conflicto legal y permitir gestionar la reincorporación contractual por adenda. · Proceso: PROC-SVC-013 (Gestion de reclamos de garantia postventa) · Fuente: PLT-04 · HU-ATC-036 · traza RF-SVC-036
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Salida 30-oct-2026
- Planificación (PLT-04 v1.2): Prioridad: **DEBERIA** · Iteración: **I2** · Estimación: **3 h** · Asignado: **Dev 1** (2026-10-28 → 2026-10-29) · Depende de HU: HU-ATC-035
- Observaciones de alcance: Fuera de alcance: Redacción de la adenda (Legal).
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · reclamo de garantía | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · registro y validación de garantía | 6.5 Diagrama entidad-relación · garantía postventa

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Escalar la garantía a Eje 3 y gestionar la adenda

Escenario: CA-01 · Conflicto
  Dado un reclamo que recibe carta notarial
  Cuando se detecta
  Entonces se deriva a Eje 3 sin intentar resolverlo en Eje 2.

Escenario: CA-02 · Adenda
  Dado un caso de reincorporación contractual tras una devolución
  Cuando se gestiona
  Entonces se resuelve con una adenda registrada en Postventa.
```

- Evidencia / prueba esperada (PLT-04): `Sin evento específico; datos de prueba: 2 razones sociales, 3 tipos de ticket y 1 feriado.`

## Reglas de negocio

- RN-SVC-021 (Gate: un caso de conflicto no se resuelve en Eje 1/2): Un caso de conflicto (carta notarial, INDECOPI, abogado, prensa) no se resuelve en Eje 1/2: se deriva de inmediato al Eje 3 (Legal); es un gate no compensable.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Prototipo / pantalla de referencia (artefacto): Prototipo › Garantías — Mockups: P-07 "Garantías postventa" (Reclamo de garantía con cobertura, inspección y escalamiento)
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `POST /api/v1/reclamos-garantia/{id}/escalamiento` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades catalogadas (.ods): CONTRACT_WARRANTY_CLAIM
- Entidades y dependencias declaradas en PLT-04: Reutiliza el gate de FT-ATC-07
- Entidades/campos que LEE: SVC_WARRANTY_CLAIM
- Entidades/campos que ESCRIBE o modifica: SVC_WARRANTY_CLAIM.EscalatedToLegal, adenda de reincorporación contractual
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
