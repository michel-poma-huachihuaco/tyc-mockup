---
id: "FT-ATC-11"
tipo: feature
titulo: "Integración UrbeMind (CITY_INCIDENT)"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["EP-ATC-06", "AYB-0001"]
tags: [feature, plt-03]
---

# PLT-03 - FT-ATC-11 Integración UrbeMind (CITY_INCIDENT)

Va en `docs/features/FT-ATC-11-integracion-urbemind-city-incident.md`.

| ID | Nombre | Epica padre |
|---|---|---|
| FT-ATC-11 | Integración UrbeMind (CITY_INCIDENT) | EP-ATC-06 |
| **Product Owner** | **Prioridad (MoSCoW)** | **Estado** |
| Eddie Huamaní | Debería | Borrador · alcance por confirmar (R-02) |
| **Release objetivo** | **Estimacion** | **Fecha / Version** |
| v1.0 - 30-oct-2026 | 7 h (talla M) | 2026-10-15 / v0.1 |

## 1 Descripción y valor

Expone creación y consulta de tickets por API/evento para que UrbeMind reporte incidencias de ciudad, con vínculo opcional a contrato o unidad cuando deriven en cobro. Permite atender incidencias urbanas reutilizando la misma infraestructura de tickets.

## 2 Requerimientos funcionales

| ID | Requerimiento | Prioridad (MoSCoW) | Origen | Criterio de verificación | Estado |
|---|---|---|---|---|---|
| RF-SVC-017 | El sistema debe vincular opcionalmente el ticket CITY_INCIDENT a un contrato y/o unidad; si deriva en cobro, a un contrato CITY_SERVICE_FEE. | Debería | UrbeMind | ContractID apunta a CITY_SERVICE_FEE | Propuesto |
| RF-SVC-018 | El sistema debe exponer creación y consulta de tickets vía API/evento a UrbeMind, sin JOIN físico. | Debería | UrbeMind | 0 accesos fuera de API/evento | Propuesto |

## 3 Requerimientos no funcionales

| ID | Categoria | Requerimiento | Metrica / umbral |
|---|---|---|---|
| RNF-INT-003 | Interoperabilidad | Frontera API/evento con UrbeMind | accesos_directos_a_bd: 0 accesos de UrbeMind fuera de API/evento |

## 4 Reglas de negocio

| ID | Regla | Fuente |
|---|---|---|
| RN-SVC-005 | Empresa y línea obligatorias; ContractID puede ser nullable en este caso | Negocio |

## 5 Trazabilidad

| RF | HU | Dependencia | Riesgo |
|---|---|---|---|
| RF-SVC-017 | HU-ATC-017 | DEP-09 UrbeMind | R-02 |
| RF-SVC-018 | HU-ATC-018 | DEP-09 UrbeMind | R-02 |

## 6 Fuera de alcance

- Funcionalidades dentro de UrbeMind.
- Facturación del CITY_SERVICE_FEE (dominio Cobranza).

## 7 Preguntas abiertas

| # | Pregunta | Dueño | Fecha limite | Bloquea G4 |
|---|---|---|---|---|
| P-01 | ¿Confirma el patrocinador que UrbeMind entra al alcance, pese a figurar en "No alcance" en otro documento (R-06)? | Sponsor | por definir | Sí |

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) y del PDF `03_Funcionalidades_Catalogo_Requerimientos_Plataforma_ATC_AYBARCORP.pdf` — Revisado por: pendiente
