---
id: "HU-ATC-033"
tipo: hu
titulo: "Registrar un reclamo de garantía vinculado a la entrega"
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

Va en `docs/historias/HU-ATC-033-registro-reclamo-garantia-vinculado-entrega.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-05 / docs/analisis/BRD.md
- Como gestor de Postventa quiero registrar el reclamo de garantía tipificado y vinculado al Acta de Entrega para gestionar la postventa sobre el mismo caso que originó la entrega.
- Requerimiento origen (RF-SVC-033 — Registro del reclamo de garantia vinculado a la entrega): El sistema debe registrar el reclamo de garantía tipificado y vinculado obligatoriamente a un Acta de Entrega existente. · Proceso: PROC-SVC-013 (Gestion de reclamos de garantia postventa) · Fuente: PLT-04 · HU-ATC-033 · traza RF-SVC-033
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Salida 30-oct-2026
- Planificación (PLT-04 v1.2): Prioridad: **DEBERIA** · Iteración: **I2** · Estimación: **4 h** · Asignado: **Dev 1** (2026-10-27 → 2026-10-28) · Dependencias externas: DEP-07 (Contratos y Activos: API de contrato, unidad, Acta de Entrega y cobertura)
- Observaciones de alcance: Fuera de alcance: Órdenes de trabajo.
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · reclamo de garantía | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · registro y validación de garantía | 6.5 Diagrama entidad-relación · garantía postventa

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Registrar un reclamo de garantía vinculado a la entrega

Escenario: CA-01 · Vínculo obligatorio
  Dado un cliente que reporta un defecto
  Cuando registro el reclamo
  Entonces queda vinculado a un CONTRACT_UNIT_HANDOVER existente; sin entrega no hay reclamo.

Escenario: CA-02 · Catálogo cerrado
  Dado un reclamo registrado
  Cuando lo tipifico
  Entonces el tipo pertenece al catálogo: estructural, impermeabilización, acabados o instalaciones.
```

- Evidencia / prueba esperada (PLT-04): `Evento garantía_registrada {tipo}`

## Reglas de negocio

- RN-SVC-027 (Garantia siempre cuelga de una entrega y vigente por cobertura): Un reclamo de garantia siempre cuelga de una entrega previa (CONTRACT_UNIT_HANDOVER) y solo es procedente dentro del periodo de cobertura validado contra la fecha real de entrega.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Prototipo / pantalla de referencia (artefacto): Prototipo › Garantías postventa — Mockups: P-07 "Garantías postventa" (Reclamo de garantía con cobertura, inspección y escalamiento)
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `POST /api/v1/reclamos-garantia` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades y dependencias declaradas en PLT-04: CONTRACT_WARRANTY_CLAIM, CONTRACT_UNIT_HANDOVER · DEP-07
- Entidades/campos que LEE: CONTRACT_UNIT_HANDOVER (Contratos y Activos)
- Entidades/campos que ESCRIBE o modifica: SVC_WARRANTY_CLAIM (tipo de defecto, vínculo al Acta de Entrega)
- Migración / backfill / borrado: no
- Checklist CAD-F5: Rechazado - CONTRACT_UNIT_HANDOVER (el Acta de Entrega) es una entidad de otro dominio (Postventa/Contratos), fuera de este modelo de datos; docs/datos/er.md ya anota esta FK externa pero no existe contrato (API/evento) definido para consultarla - vacio de definicion MAYOR

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
