---
id: "EP-ATC-05"
tipo: epica
titulo: "Postventa: reclamos de garantía"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["AYB-0001", "RMP-001"]
tags: [epica, plt-02]
---

# PLT-02 - EP-ATC-05 Postventa: reclamos de garantía

Va en `docs/epicas/EP-ATC-05-postventa-reclamos-garantia.md`.

| ID | Nombre | Producto |
|---|---|---|
| EP-ATC-05 | Postventa: reclamos de garantía | Aybar Atiende · Plataforma de Atención al Cliente |
| **Product Owner** | **Sponsor** | **Prioridad (MoSCoW)** |
| Eddie Huamaní | Gerencia de Postventa (por confirmar) | Debería |
| **Horizonte** | **Estado** | **Fecha / Version** |
| Ahora | Borrador | 2026-10-15 / v0.1 |

## 1 Contexto

- **Problema**: los reclamos por defectos después de la entrega no se vinculan con el Acta de Entrega ni con el periodo de cobertura, y se resuelven sin inspección técnica documentada.
- **Usuarios**: Gestor de Postventa (Eje 2), clientes con Acta de Entrega formalizada y el área técnica que inspecciona.
- **Evidencia**: "la garantía siempre cuelga de una entrega y está vigente por cobertura" (RN-SVC-027).
- **Alineamiento**: mejorar la experiencia postventa (componente POS del NPS-C, 35%).

## 2 Objetivos

Objetivos de negocio:
- OBJ-05: Resolver el 100% de los reclamos de garantía con inspección documentada y rechazar automáticamente los que están fuera de cobertura, desde el pase a producción.

Objetivos del usuario:
- El propietario sabe si su reclamo procede, cuándo lo inspeccionan y cómo se resolvió.

| KPI | Línea base | Meta | Fuente | Frecuencia |
|---|---|---|---|---|
| % de reclamos de garantía con inspección documentada | por medir | 100% | Plataforma ATC | Diaria |
| Tiempo medio de resolución de garantía | por definir con Postventa | - | Plataforma ATC | Semanal |
| Componente POS del NPS-C | línea base | +10 pts vs. LB | Encuesta | Trimestral |

## 3 Alcance

| Dentro (IN) | Fuera (OUT) |
|---|---|
| Registro del reclamo tipificado (estructural, impermeabilización, acabados, instalaciones) vinculado al Acta de Entrega | Gestión de contratistas y órdenes de trabajo de obra |
| Validación de vigencia contra el periodo de cobertura | Compras y almacén de materiales |
| Inspección técnica con evidencia y resolución (aprobado/rechazado/resuelto) | Cálculo de costos de reparación |
| Escalamiento a Eje 3 y reincorporación contractual por adenda | |

Features:

| ID | Feature | Prioridad (MoSCoW) | Release objetivo |
|---|---|---|---|
| FT-ATC-10 | Reclamos de garantía postventa | Debería | v1.0 - 30-oct-2026 |

- **Supuestos**: el dominio de Contratos expone CONTRACT_UNIT_HANDOVER y MAE_WARRANTY_COVERAGE_PERIOD por API.
- **Restricciones**: sin Acta de Entrega no hay reclamo de garantía (RN-SVC-027).
- **Dependencias y riesgos**: DEP-07 Contratos y Activos; R-05 terceros.
- **Criterios de éxito**: 100% de reclamos con inspección y 0 reclamos fuera de cobertura admitidos durante 2 meses.

## 4 Aprobaciones

| Rol | Nombre | Fecha | Decision |
|---|---|---|---|
| Product Owner | | | |
| Sponsor | | | |
| Lider tecnico | | | |

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad para RF/RN/RNF/HU) y del PDF `02_Epicas_Plataforma_ATC_AYBARCORP.pdf` — Revisado por: pendiente
