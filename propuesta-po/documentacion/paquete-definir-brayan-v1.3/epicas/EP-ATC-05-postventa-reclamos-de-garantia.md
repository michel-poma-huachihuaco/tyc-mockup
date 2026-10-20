---
id: "EP-ATC-05"
tipo: epica
titulo: "Postventa: reclamos de garantía"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-10"]
tags: [epica, plt-02]
---

# PLT-02 - EP-ATC-05 Postventa: reclamos de garantía

| ID | Nombre | Producto |
|---|---|---|
| EP-ATC-05 | Postventa: reclamos de garantía | Plataforma ATC (DOM-SVC-001) |
| **Product Owner** | **Sponsor** | **Prioridad (MoSCoW)** |
| Eddie Huamaní | Gerencia de Postventa (por confirmar) | Debería |
| **Horizonte** | **Estado** | **Fecha / Versión** |
| jue 29-oct → vie 30-oct 2026 · Dev 1 · 12 h | Refinamiento | 16-oct-2026 · v1.3 |
| **Tipo** | **Desarrollador** | **Horas · iteración** |
| Épica de valor de negocio | Dev 1 (Brayan) | 12 h · iteración 2 |

## 1 Contexto

- **Problema**: Los reclamos por defectos después de la entrega no se vinculan con el Acta de Entrega ni con el periodo de cobertura, y se resuelven sin inspección técnica documentada.
- **Usuarios**: Gestor de Postventa (Eje 2), clientes con Acta de Entrega formalizada y el área técnica que inspecciona.
- **Evidencia**: PROC-SVC-013 y RN-SVC-027 «la garantía siempre cuelga de una entrega y está vigente por cobertura».
- **Alineamiento**: Mejorar la experiencia postventa, componente POS del NPS-C (35 %).
- **Procesos**: PROC-SVC-013

## 2 Objetivos

Objetivo de negocio:
- Resolver el 100 % de los reclamos de garantía con inspección documentada y rechazar automáticamente los que están fuera de cobertura, desde el pase a producción.

Objetivo del usuario:
- El propietario sabe si su reclamo procede, cuándo lo inspeccionan y cómo se resolvió.

| KPI | Línea base | Meta | Fuente | Frecuencia |
|---|---|---|---|---|
| % de reclamos de garantía con inspección documentada | no indicada en el PLT-02 | 100 % | — | — |
| Tiempo medio de resolución de garantía | no indicada en el PLT-02 | Por definir con Postventa | — | — |
| Componente POS del NPS-C | no indicada en el PLT-02 | +10 pts vs. LB | — | — |

## 3 Alcance

| Dentro (IN) | Fuera (OUT) |
|---|---|
| Registro del reclamo tipificado (estructural, impermeabilización, acabados, instalaciones) vinculado al Acta de Entrega | Gestión de contratistas y órdenes de trabajo de obra |
| Validación de vigencia contra el periodo de cobertura | Compras y almacén de materiales |
| Inspección técnica con evidencia y resolución (aprobado / rechazado / resuelto) | Cálculo de costos de reparación |
| Escalamiento a Eje 3 y reincorporación contractual por adenda |  |

Features:

| ID | Feature | Prioridad (MoSCoW) | Horas | Fechas (PLT-01) | Predecesora | Release objetivo |
|---|---|---|---|---|---|---|
| FT-ATC-10 | Reclamos de garantía postventa | Debería | 12 | jue 29-oct → vie 30-oct | — | v1.0 · Etapa 1 · 03-nov-2026 |

- **Ruta crítica**: FT-ATC-10 (12 h)
- **Supuestos**: El dominio de Contratos expone CONTRACT_UNIT_HANDOVER y MAE_WARRANTY_COVERAGE_PERIOD por API.
- **Restricciones**: Sin Acta de Entrega no hay reclamo de garantía (RN-SVC-027).
- **Dependencias y riesgos**: DEP-07 Contratos y Activos · R-05 terceros
- **Criterios de éxito**: 100 % de reclamos con inspección y 0 reclamos fuera de cobertura admitidos durante 2 meses. Indicadores: % de reclamos de garantía con inspección documentada: 100 %; Tiempo medio de resolución de garantía: Por definir con Postventa; Componente POS del NPS-C: +10 pts vs. LB.

Dependencias (PLT-01):

| ID | Dependencia | Tipo | Bloquea a | Responsable | Fecha requerida (PLT-01) | Estado (PLT-01) |
|---|---|---|---|---|---|---|
| DEP-07 | Contratos y Activos: API de contrato, unidad, Acta de Entrega y cobertura | Interna | EP-ATC-05 | Equipo Contratos | 29-oct-2026 | Pendiente |

Riesgos (PLT-01):

| ID | Riesgo | Prob. | Impacto | Mitigación | Dueño | Estado |
|---|---|---|---|---|---|---|
| R-05 | Sin QA dedicado y UAT concentrada en un día (mar 03-nov) | Media | Alto | Aceptación diaria del PO a las 17:00, pruebas E2E automatizadas desde el día 3 y usuarios clave citados para la UAT | PO · Jefe Operaciones UX | Abierto |

## 4 Aprobaciones

| Rol | Nombre | Fecha | Decisión |
|---|---|---|---|
| Dueño de Producto (PO) | Eddie Huamaní | 16-oct-2026 | Versión del documento |
| Patrocinador | (pendiente) |  |  |
| Líder técnico | (pendiente) |  |  |

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-02 v1.3), sin cambiar su contenido — Revisado por: (pendiente)
