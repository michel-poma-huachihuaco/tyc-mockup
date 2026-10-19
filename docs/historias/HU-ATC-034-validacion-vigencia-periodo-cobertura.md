---
id: "HU-ATC-034"
tipo: hu
titulo: "Validar la vigencia de la garantía contra la cobertura"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-10", "EP-ATC-05", "AYB-0001"]
tags: [hu]
ui: false
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-034-validacion-vigencia-periodo-cobertura.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-05 / docs/analisis/BRD.md
- Como gestor de Postventa quiero que el sistema valide la fecha del reclamo contra la cobertura y la entrega para rechazar automáticamente lo que está fuera de cobertura.
- Requerimiento origen (RF-SVC-034 — Validacion de vigencia contra el periodo de cobertura): El sistema debe validar la vigencia contra el periodo de cobertura y la fecha real de entrega, y rechazar automáticamente lo que está fuera de cobertura. · Proceso: PROC-SVC-013 (Gestion de reclamos de garantia postventa) · Fuente: PLT-04 · HU-ATC-034 · traza RF-SVC-034
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Salida 30-oct-2026
- Planificación (PLT-04 v1.2): Prioridad: **DEBERIA** · Iteración: **I2** · Estimación: **2 h** · Asignado: **Dev 1** (2026-10-28 → 2026-10-28) · Depende de HU: HU-ATC-033 · Dependencias externas: DEP-07 (Contratos y Activos: API de contrato, unidad, Acta de Entrega y cobertura)
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · reclamo de garantía | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · registro y validación de garantía | 6.5 Diagrama entidad-relación · garantía postventa
- Referencia visual / plantilla en prototipo: Prototipo › Garantías (chip de cobertura) [P-07 "Garantías postventa"]

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Validar la vigencia de la garantía contra la cobertura

Escenario: CA-01 · Validación
  Dado un reclamo nuevo
  Cuando se registra
  Entonces se valida su fecha contra el periodo vigente y la fecha real de entrega antes de admitirlo.

Escenario: CA-02 · Fuera de cobertura
  Dado un reclamo fuera del periodo
  Cuando se valida
  Entonces se marca como no procedente por vigencia y se informa al cliente el motivo.
```

- Evidencia / prueba esperada (PLT-04): `Evento garantía_no_procedente`

## Reglas de negocio

- RN-SVC-027 (Garantia siempre cuelga de una entrega y vigente por cobertura): Un reclamo de garantia siempre cuelga de una entrega previa (CONTRACT_UNIT_HANDOVER) y solo es procedente dentro del periodo de cobertura validado contra la fecha real de entrega.

## Datos (CAD-F5)

- Entidades catalogadas (.ods): CONTRACT_WARRANTY_CLAIM
- Entidades y dependencias declaradas en PLT-04: MAE_WARRANTY_COVERAGE_PERIOD · DEP-07
- Entidades/campos que LEE: SVC_WARRANTY_CLAIM, CONTRACT_UNIT_HANDOVER, MAE_WARRANTY_COVERAGE_PERIOD
- Entidades/campos que ESCRIBE o modifica: SVC_WARRANTY_CLAIM.Status (no procedente)
- Migración / backfill / borrado: no
- Checklist CAD-F5: Rechazado - MAE_WARRANTY_COVERAGE_PERIOD no esta definido en docs/datos/diccionario.md, y CONTRACT_UNIT_HANDOVER es de otro dominio sin contrato de consulta definido (ver HU-ATC-033) - vacio de definicion MAYOR

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
