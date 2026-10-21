---
id: "FT-ATC-11"
tipo: feature
titulo: "Integración UrbeMind (CITY_INCIDENT)"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["EP-ATC-06", "AYB-0001"]
tags: [feature, plt-03]
---

# PLT-03 - FT-ATC-11 Integración UrbeMind (CITY_INCIDENT)

Va en `docs/features/FT-ATC-11-integracion-urbemind-city-incident.md`.

| ID | Nombre | Epica padre |
|---|---|---|
| FT-ATC-11 | Integración UrbeMind (CITY_INCIDENT) | EP-ATC-06 |
| **Product Owner** | **Prioridad (MoSCoW)** | **Estado** |
| Eddie Huamaní | Debería | Borrador · Etapa 2 (RN-SVC-043) |
| **Release objetivo** | **Estimacion** | **Fecha / Version** |
| Etapa 2 - cierre estimado 15-dic-2026 (Dev 4 · Daniel) | 7 h (2 HU) | 2026-10-19 / v0.2 |

## 1 Descripción y valor

Expone creación y consulta de tickets por API/evento para que UrbeMind reporte incidencias de ciudad, con vínculo opcional a contrato o unidad cuando deriven en cobro. Permite atender incidencias urbanas reutilizando la misma infraestructura de tickets. Según `RN-SVC-043` (*Etapas del proyecto*), corresponde a la **Etapa 2 (cierre estimado 15-dic-2026)** por tratarse de tecnología en construcción, sin bloquear ninguna funcionalidad de la **Etapa 1 (salida 30-oct-2026)**.

## 2 Requerimientos funcionales

| ID | Requerimiento | Prioridad (MoSCoW) | Origen | Criterio de verificación | Estado |
|---|---|---|---|---|---|
| RF-SVC-017 | El sistema debe vincular opcionalmente el ticket CITY_INCIDENT a un contrato y/o unidad; si deriva en cobro, a un contrato CITY_SERVICE_FEE. | Debería | UrbeMind | ContractID apunta a CITY_SERVICE_FEE | Propuesto (Etapa 2) |
| RF-SVC-018 | El sistema debe exponer creación y consulta de tickets vía API/evento a UrbeMind, sin JOIN físico. | Debería | UrbeMind | 0 accesos fuera de API/evento | Propuesto (Etapa 2) |

## 3 Requerimientos no funcionales

| ID | Categoria | Requerimiento | Metrica / umbral |
|---|---|---|---|
| RNF-INT-003 | Interoperabilidad | Frontera API/evento con UrbeMind (Etapa 2 · cierre est. 15-dic-2026) | accesos_directos_a_bd: 0 accesos de UrbeMind fuera de API/evento |

## 4 Reglas de negocio

| ID | Regla | Fuente |
|---|---|---|
| RN-SVC-005 | Empresa y línea obligatorias; ContractID puede ser nullable en este caso | Negocio |
| RN-SVC-043 | Etapas del proyecto: UrbeMind (`PROC-SVC-007`: RF-SVC-017, 018, RNF-INT-003) pertenece a la Etapa 2 (cierre estimado 15-dic-2026) y no bloquea la Etapa 1 (30-oct-2026) | Negocio / Decisión PO |

## 5 Trazabilidad

| RF | HU (PLT-04 v1.2) | Horas / Asignación | Dependencia | Riesgo |
|---|---|---|---|---|
| RF-SVC-017 | HU-ATC-017 — Atender incidencias de ciudad como tickets | 2 h · Dev 4 (Daniel) (2026-10-28 → 2026-10-28) | DEP-09 (UrbeMind: contrato de API/eventos + decisión de alcance) | R-02 |
| RF-SVC-018 | HU-ATC-018 — Exponer tickets a UrbeMind por API y eventos | 5 h · Dev 4 (Daniel) (2026-10-29 → 2026-10-29) | HU-ATC-017, DEP-09 (UrbeMind: contrato de API/eventos + decisión de alcance) | R-02 |

## 6 Fuera de alcance

- Funcionalidades dentro de UrbeMind.
- Facturación del CITY_SERVICE_FEE (dominio Cobranza).

## 7 Preguntas abiertas

| # | Pregunta | Dueño | Fecha limite | Bloquea G4 |
|---|---|---|---|---|
| P-01 | ¿Confirma el patrocinador que UrbeMind entra al alcance, pese a figurar en "No alcance" en otro documento (R-06)? | Sponsor | por definir | Sí |

Generado por IA: actualizado con el detalle del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`) — Revisado por: pendiente
