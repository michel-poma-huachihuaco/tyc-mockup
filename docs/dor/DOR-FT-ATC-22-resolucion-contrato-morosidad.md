---
id: "DOR-FT-ATC-22"
tipo: dor
titulo: "Definition of Ready (G4) - FT-ATC-22 Resolución de contrato por morosidad"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-22", "EP-ATC-11", "AYB-0001"]
tags: [dor, plt-05, g4]
---

# PLT-05 - Definition of Ready (G4) - FT-ATC-22 Resolución de contrato por morosidad

Va en `docs/dor/DOR-FT-ATC-22-resolucion-contrato-morosidad.md`.

| Item evaluado | Product Owner | Lider tecnico |
|---|---|---|
| EP-ATC-11 / FT-ATC-22 Resolución de contrato por morosidad | Eddie Huamaní | [por asignar] |
| **Fecha de revision** | **Sprint / release destino** | **Resultado** |
| 2026-10-16 | Iteración 2 (26-30 oct 2026) · v1.0 | NO READY |

## 1 Checklist de G4

| # | Criterio | Cumple | Evidencia |
|---|---|---|---|
| 1 | Valor claro | [x] | HU-ATC-056, 057, 058 |
| 2 | Gherkin verificable | [x] | HU-ATC-056, 057, 058 |
| 3 | Reglas explícitas | [x] | RN-SVC-037, 038, 039 |
| 4 | G2 si `ui: true` | [ ] | G2 no existe |
| 5 | G3 si aplica | [ ] | ADR-001, 005; G3 en `draft` |
| 6 | Dependencias desbloqueadas | [ ] | DEP-08 (Cobranza) y DEP-15 (responsables de proyecto) sin resolver |
| 7 | Técnicas y de datos | [x] | `SVC_CONTRACT_DEFAULT_ALERT` (ENT-SVC-018) en diccionario |
| 8 | TC iniciales QA | [ ] | Verificar test-plan.md |
| 9 | Estimada por el equipo | [ ] | 10 h de producto, sin confirmar |
| 10 | Cabe en un sprint | [x] | Sí |
| IA | Revisión humana | [ ] | Pendiente |

### Historias evaluadas en esta funcionalidad (artefacto PLT-04 v1.2)

| HU | Título (PLT-04) | Escenarios Gherkin | Horas | Desarrollador | Fechas | Condición en tablero (PLT-05) |
|---|---|---|---|---|---|---|
| HU-ATC-056 | Abrir el caso de resolución por 3 meses impagos | 3 (CA-01, CA-02, CA-03) | 4 h | Dev 4 (Daniel) | 2026-10-26 → 2026-10-26 | CON CONDICIONES (DEP-08 · DEP-15 · causal legal) |
| HU-ATC-057 | Enviar al cliente la alerta de cancelación en paralelo | 3 (CA-01, CA-02, CA-03) | 3 h | Dev 4 (Daniel) | 2026-10-26 → 2026-10-27 | CON CONDICIONES (DEP-08 · DEP-15 · causal legal) |
| HU-ATC-058 | Enviar la carta de alerta al responsable del proyecto y su supervisor | 3 (CA-01, CA-02, CA-03) | 3 h | Dev 4 (Daniel) | 2026-10-27 → 2026-10-27 | CON CONDICIONES (DEP-08 · DEP-15 · causal legal) |

## 2 Dependencias

| ID | Dependencia | Tipo | Bloquea a | Responsable | Fecha | Estado |
|---|---|---|---|---|---|---|
| DEP-08 | Cobranza: estado de cuenta, historial de pagos y cuotas | Externa | HU-ATC-056, 057, 058 | Líder técnico | 2026-10-20 | Pendiente |
| DEP-15 | Maestro de responsables de proyecto y supervisores | Interna | HU-ATC-058 | Líder técnico | 2026-10-27 | Pendiente |

## 3 Modelado

- `SVC_CONTRACT_DEFAULT_ALERT` en `docs/datos/diccionario.md`

## 4 Arquitectura

- ADR: ADR-001, ADR-005 (job batch idempotente para la causal de 3 meses impagos)

## 5 Riesgos

| ID | Riesgo | Prob. | Impacto | Mitigación | Dueño | Estado |
|---|---|---|---|---|---|---|
| R-02 (PLT-05) | Cobranza sin API confirmada en el plazo | Alta | Alto | Simulador de estado de cuenta | Líder técnico | Abierto |

## 6 Decision y aprobacion

Decision: NO READY

Condiciones pendientes:
- [ ] DEP-08 y DEP-15 sin resolver
- [ ] P-01 (3 cuotas consecutivas o acumuladas), P-02 (suspensión si hay reclamo abierto) y P-03 (plazo para regularizar) de FT-ATC-22 bloquean G4, dos de ellas con dueño Legal
- [ ] G3 no `approved`

| Rol | Nombre | Fecha | Firma |
|---|---|---|---|
| Product Owner (aprueba) | | | |
| Lider tecnico (consultivo) | | | |
| QA (consultivo) | | | |
| UX (consultivo) | | | |

Generado por IA: actualizado con el detalle del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`) — Revisado por: pendiente
