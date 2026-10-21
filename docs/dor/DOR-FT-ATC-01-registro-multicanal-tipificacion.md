---
id: "DOR-FT-ATC-01"
tipo: dor
titulo: "Definition of Ready (G4) - FT-ATC-01 Registro multicanal y tipificación"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-01", "EP-ATC-01", "HU-ATC-001", "HU-ATC-002", "AYB-0001"]
tags: [dor, plt-05, g4]
---

# PLT-05 - Definition of Ready (G4) - FT-ATC-01 Registro multicanal y tipificación

Va en `docs/dor/DOR-FT-ATC-01-registro-multicanal-tipificacion.md`.

| Item evaluado | Product Owner | Lider tecnico |
|---|---|---|
| EP-ATC-01 / FT-ATC-01 Registro multicanal y tipificación | Eddie Huamaní | [por asignar] |
| **Fecha de revision** | **Sprint / release destino** | **Resultado** |
| 2026-10-16 | Iteración 1 (19-23 oct 2026) · v1.0 | NO READY |

## 1 Checklist de G4

| # | Criterio de G4 | Cumple | Evidencia / responsable |
|---|---|---|---|
| 1 | Historia con valor claro para el usuario | [x] | HU-ATC-001, HU-ATC-002: "Como gestor de tickets quiero..." con valor explícito |
| 2 | Criterios de aceptación verificables en Gherkin | [x] | HU-ATC-001, HU-ATC-002, sección de criterios |
| 3 | Reglas de negocio explícitas | [x] | FT-ATC-01 sección 4: RN-SVC-004, RN-SVC-005, RN-SVC-026 |
| 4 | Diseño UX aprobado si hay UI (G2 cerrado) | [ ] | No aplica si ninguna HU es `ui: true`; verificar — si alguna lo es, G2 no existe todavía (cero features tienen G2) |
| 5 | ADR aprobado si aplica (G3 cerrado) | [ ] | ADR-001, ADR-003, ADR-007 aplican (`docs/adr/`); G3 está en `draft`, no `approved` |
| 6 | Dependencias identificadas y desbloqueadas | [ ] | DEP-01 (SIGDA/TAXON): contrato de interfaz y simulador comprometidos para el 19-oct-2026, todavía no entregados a la fecha de este DoR |
| 7 | Consideraciones técnicas y de datos | [x] | `docs/datos/diccionario.md` (SVC_TICKET); CAD-F5 pendiente de completar en la HU por el otro agente de F5 |
| 8 | Casos de prueba iniciales definidos por QA | [ ] | Verificar si `docs/pruebas/test-plan.md` ya trae TC para HU-ATC-001/002 al momento de leer este DoR |
| 9 | Estimada por el equipo | [ ] | FT-ATC-01: 9 h (talla M) es estimación de producto (PLT-01/03), no confirmada por el equipo en refinamiento (acuerdo 1, pendiente al 16-oct) |
| 10 | Cabe en un sprint | [x] | 9 h caben holgadamente en la iteración 1 |
| IA | Si hubo IA: revisión humana registrada | [ ] | Pendiente — "Revisado por: pendiente" en todos los documentos fuente |

### Historias evaluadas en esta funcionalidad (artefacto PLT-04 v1.2)

| HU | Título (PLT-04) | Escenarios Gherkin | Horas | Desarrollador | Fechas | Condición en tablero (PLT-05) |
|---|---|---|---|---|---|---|
| HU-ATC-001 | Registrar un ticket tipificado desde cualquier canal | 4 (CA-01, CA-02, CA-03, CA-04) | 6 h | Dev 1 (Brayan) | 2026-10-19 → 2026-10-20 | CON CONDICIONES (DEP-01 contrato + simulador) |
| HU-ATC-002 | Entregar al cliente un número de ticket por razón social | 3 (CA-01, CA-02, CA-03) | 3 h | Dev 1 (Brayan) | 2026-10-20 → 2026-10-20 | CON CONDICIONES (DEP-01 contrato + simulador) |

## 2 Dependencias

| ID | Dependencia | Tipo | Bloquea a | Responsable | Fecha comprometida | Estado |
|---|---|---|---|---|---|---|
| DEP-01 | API de SIGDA/TAXON: consulta de cliente y KYC (contrato de interfaz + simulador) | Externa/Técnica | HU-ATC-001, HU-ATC-002 | Líder técnico · responsables SIGDA/TAXON | 2026-10-19 | Pendiente |

## 3 Modelado (datos y proceso)

- ER: `docs/datos/er.md` (entidad `SVC_TICKET`, FK `CompanyID`, `BusinessLineID`, `TicketTypeID`)
- Estados y transiciones: no aplica directamente a esta feature (ver FT-ATC-02)
- Diccionario: `docs/datos/diccionario.md` — campos `TicketNumber` (UNIQUE x CompanyID), `CompanyID`, `BusinessLineID` NOT NULL
- Puerta F4 de Gobierno de Datos: no corrida todavía (fuera del alcance de esta sesión)

## 4 Arquitectura

- Contrato: `docs/arquitectura/aybar-atc.openapi.yaml` — operaciones de creación y consulta de tickets (`POST /api/v1/tickets`, etc.)
- ADR que aplican: ADR-001 (stack Spring Boot/Java), ADR-003 (cliente no se copia, se consulta SIGDA/TAXON por API), ADR-007 (adaptador con simulador contract-first para DEP-01)

## 5 Riesgos

| ID | Riesgo | Prob. | Impacto | Mitigación | Dueño | Estado |
|---|---|---|---|---|---|---|
| R-02 (PLT-05) | APIs externas no disponibles en 2 semanas (incluye SIGDA/TAXON) | Alta | Alto | Contrato de interfaz y simulador el día 1; producción condicionada a la API real | Líder técnico | Abierto |
| R-04, R-05 (roadmap, registro distinto — ver nota) | Citados en FT-ATC-01 trazabilidad: calidad del dato de origen y disponibilidad de NEXUS/SIGDA | — | — | Ver `docs/roadmap/RMP-001-aybar-atiende.md` | PO | Abierto |

**Nota de inconsistencia (no resuelta aquí):** el PDF del DoR (PLT-05) numera sus propios riesgos de ejecución `R-01..R-06`, distintos en contenido de los `R-01..R-10` del roadmap (PLT-01) que las features ya citan en su sección de trazabilidad. Son dos registros de riesgo con IDs que colisionan. Se usan ambos por separado en este documento; armonizar los IDs es trabajo pendiente para quien apruebe G4.

## 6 Decision y aprobacion

Decision: NO READY

Condiciones pendientes:
- [ ] DEP-01 (contrato de interfaz + simulador SIGDA/TAXON) comprometido para el 19-oct-2026, no resuelto a la fecha de este borrador
- [ ] G3 sin `approved` en `origin/main`
- [ ] Estimación de 9 h sin confirmar por el equipo (acuerdo 1 del DoR PLT-05, pendiente al 16-oct)
- [ ] P-02 de FT-ATC-01 (formato del N.º visible al cliente) bloquea G4 y sigue sin dueño con fecha

Propuesta IA: si DEP-01 se resuelve y el equipo confirma la estimación el 16-oct como está planificado, esta feature podría pasar a READY antes que la mayoría — es de las de menor complejidad del lote.

| Rol | Nombre | Fecha | Firma |
|---|---|---|---|
| Product Owner (aprueba) | | | |
| Lider tecnico (consultivo) | | | |
| QA (consultivo) | | | |
| UX (consultivo) | | | |

Generado por IA: actualizado con el detalle del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`) — Revisado por: pendiente
