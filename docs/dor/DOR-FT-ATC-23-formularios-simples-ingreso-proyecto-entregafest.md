---
id: "DOR-FT-ATC-23"
tipo: dor
titulo: "Definition of Ready (G4) - FT-ATC-23 Formularios simples: ingreso al proyecto y Entrega Fest"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-23", "EP-ATC-11", "AYB-0001"]
tags: [dor, plt-05, g4]
---

# PLT-05 - Definition of Ready (G4) - FT-ATC-23 Formularios simples: ingreso al proyecto y Entrega Fest

Va en `docs/dor/DOR-FT-ATC-23-formularios-simples-ingreso-proyecto-entregafest.md`.

| Item evaluado | Product Owner | Lider tecnico |
|---|---|---|
| EP-ATC-11 / FT-ATC-23 Formularios simples | Eddie Huamaní | [por asignar] |
| **Fecha de revision** | **Sprint / release destino** | **Resultado** |
| 2026-10-16 | Iteración 2 (26-30 oct 2026) · v1.0 | NO READY |

## 1 Checklist de G4

| # | Criterio | Cumple | Evidencia |
|---|---|---|---|
| 1 | Valor claro | [x] | HU-ATC-059, 060 |
| 2 | Gherkin verificable | [x] | HU-ATC-059, 060 |
| 3 | Reglas explícitas | [x] | RN-SVC-041, 042 |
| 4 | G2 si `ui: true` | [ ] | Formularios desde móvil son pantalla; G2 no existe |
| 5 | G3 si aplica | [ ] | ADR-001; G3 en `draft` |
| 6 | Dependencias desbloqueadas | [ ] | "Conectividad en el proyecto" citada como dependencia en la feature, sin responsable ni fecha asignados en ninguna fuente |
| 7 | Técnicas y de datos | [x] | `SVC_SIMPLE_FORM_DEFINITION` (ENT-SVC-019), `SVC_EVENT_BUS_BOOKING` (ENT-SVC-020) en diccionario |
| 8 | TC iniciales QA | [ ] | Verificar test-plan.md |
| 9 | Estimada por el equipo | [ ] | 7 h de producto, sin confirmar |
| 10 | Cabe en un sprint | [x] | Sí |
| IA | Revisión humana | [ ] | Pendiente |

### Historias evaluadas en esta funcionalidad (artefacto PLT-04 v1.2)

| HU | Título (PLT-04) | Escenarios Gherkin | Horas | Desarrollador | Fechas | Condición en tablero (PLT-05) |
|---|---|---|---|---|---|---|
| HU-ATC-059 | Registrar el ingreso de una persona al proyecto | 3 (CA-01, CA-02, CA-03) | 4 h | Dev 4 (Daniel) | 2026-10-27 → 2026-10-28 | CON CONDICIONES (Alcance de «buses» · conectividad) |
| HU-ATC-060 | Reservar un cupo en el bus del Entrega Fest | 3 (CA-01, CA-02, CA-03) | 3 h | Dev 4 (Daniel) | 2026-10-28 → 2026-10-28 | CON CONDICIONES (Alcance de «buses» · conectividad) |

## 2 Dependencias

| ID | Dependencia | Tipo | Bloquea a | Responsable | Fecha | Estado |
|---|---|---|---|---|---|---|
| DEP-N/A | Conectividad en el proyecto/obra para el formulario móvil | Técnica | HU-ATC-059, 060 | [sin responsable asignado] | [sin fecha] | Pendiente — ninguna fuente le asigna dueño ni fecha, a diferencia de las demás DEP-NN numeradas |

## 3 Modelado

- `SVC_SIMPLE_FORM_DEFINITION`, `SVC_EVENT_BUS_BOOKING` en `docs/datos/diccionario.md`

## 4 Arquitectura

- ADR: ADR-001

## 5 Riesgos

| ID | Riesgo | Prob. | Impacto | Mitigación | Dueño | Estado |
|---|---|---|---|---|---|---|
| R-06 (PLT-05) | Ítem de alcance ambiguo (buses del Entrega Fest) | Alta | Medio | Resolver en el refinamiento del 16-oct | PO | Abierto |

## 6 Decision y aprobacion

Decision: NO READY

Condiciones pendientes:
- [ ] La dependencia de conectividad en el proyecto no tiene responsable ni fecha en ninguna fuente — debe asignarse antes de evaluar de nuevo
- [ ] P-02 de FT-ATC-23 (la reserva de buses es del cliente o de logística con el proveedor) bloquea G4
- [ ] G3 no `approved`

| Rol | Nombre | Fecha | Firma |
|---|---|---|---|
| Product Owner (aprueba) | | | |
| Lider tecnico (consultivo) | | | |
| QA (consultivo) | | | |
| UX (consultivo) | | | |

Generado por IA: actualizado con el detalle del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`) — Revisado por: pendiente
