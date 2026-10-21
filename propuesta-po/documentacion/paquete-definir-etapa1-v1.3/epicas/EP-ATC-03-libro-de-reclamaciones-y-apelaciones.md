---
id: "EP-ATC-03"
tipo: epica
titulo: "Libro de Reclamaciones y apelaciones"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-05", "FT-ATC-06"]
tags: [epica, plt-02]
---

# PLT-02 - EP-ATC-03 Libro de Reclamaciones y apelaciones

| ID | Nombre | Producto |
|---|---|---|
| EP-ATC-03 | Libro de Reclamaciones y apelaciones | Plataforma ATC (DOM-SVC-001) |
| **Product Owner** | **Sponsor** | **Prioridad (MoSCoW)** |
| Eddie Huamaní | Gerencia Legal (por confirmar) | Debe |
| **Horizonte** | **Estado** | **Fecha / Versión** |
| lun 26-oct → jue 29-oct 2026 · Dev 1 · 21 h | Refinamiento | 16-oct-2026 · v1.3 |
| **Tipo** | **Desarrollador** | **Horas · iteración** |
| Épica de valor de negocio | Dev 1 (Brayan) | 21 h · iteración 1 y 2 |

## 1 Contexto

- **Problema**: El Libro de Reclamaciones se lleva aparte y el plazo de 15 días hábiles se controla a mano. Hay respuestas sin número de reclamo ni cargo, lo que expone a la empresa a sanciones de INDECOPI.
- **Usuarios**: Responsable legal de reclamos, gestores de tickets que detectan quejas y reclamos, y consumidores de las 11 razones sociales.
- **Evidencia**: NEC-SVC-004 «probar ante INDECOPI cuándo se registró, prorrogó y respondió» y NEC-SVC-005 «detectar reclamos sin asiento»; RNF-CUM-006; Ley 29571 art. 24, Ley 31435 y D.S. 101-2022-PCM.
- **Alineamiento**: Cumplir el Libro de Reclamaciones sin exposición ante INDECOPI (OBJ-SVC-002).
- **Procesos**: PROC-SVC-005, PROC-SVC-006

## 2 Objetivos

Objetivo de negocio:
- Cero respuestas fuera del plazo legal (o prorrogado) y cero reclamos sin asiento desde el pase a producción.

Objetivo del usuario:
- El consumidor recibe una respuesta formal con número y cargo dentro del plazo y sabe que puede acudir a INDECOPI.

| KPI | Línea base | Meta | Fuente | Frecuencia |
|---|---|---|---|---|
| Reclamos respondidos fuera de plazo (RNF-CUM-006) | no indicada en el PLT-02 | 0 | — | — |
| Tickets QUEJA/RECLAMO sin asiento (huérfanos) | no indicada en el PLT-02 | 0 | — | — |
| Documentos probatorios sin checksum (RNF-CUM-007) | no indicada en el PLT-02 | 0 | — | — |

## 3 Alcance

| Dentro (IN) | Fuera (OUT) |
|---|---|
| Asiento QUEJA/RECLAMO como extensión 1:1 del ticket, con correlativo por empresa y establecimiento | Portal público del Libro de Reclamaciones virtual (se integra el existente; se define en refinamiento) |
| Cálculo del plazo de 15 días hábiles y prórroga única, con justificación y cargo | Interoperabilidad electrónica con sistemas de INDECOPI (se registra manualmente) |
| Respuesta formal con carta PDF, cargo y constancia del derecho a acudir a INDECOPI | Gestión de procedimientos sancionadores |
| Job de vigilancia del plazo legal y detección diaria de huérfanos |  |
| Apelaciones internas y ante INDECOPI con historial |  |

Features:

| ID | Feature | Prioridad (MoSCoW) | Horas | Fechas (PLT-01) | Predecesora | Release objetivo |
|---|---|---|---|---|---|---|
| FT-ATC-05 | Libro de Reclamaciones | Debe | 18 | lun 26-oct → mié 28-oct | — | v1.0 · Etapa 1 · 03-nov-2026 |
| FT-ATC-06 | Apelaciones internas e INDECOPI | Debe | 3 | mié 28-oct → jue 29-oct | FT-ATC-05 | v1.0 · Etapa 1 · 03-nov-2026 |

- **Ruta crítica**: FT-ATC-05 → FT-ATC-06 (21 h)
- **Supuestos**: El ticket y su tipo existen (EP-ATC-01, listo el lun 26-oct); Legal valida el formato del asiento y los textos de la respuesta antes del lun 26-oct.
- **Restricciones**: Plazo legal 15 + 15 días hábiles, prórroga comunicada antes del vencimiento (RN-SVC-009); la empresa del asiento es inmutable (RN-SVC-013).
- **Dependencias y riesgos**: DEP-04 calendario · DEP-05 validación legal · DEP-06 repositorio S3/GLI · R-03 plazo legal en transición
- **Criterios de éxito**: 0 respuestas fuera de plazo y 0 huérfanos durante 3 meses seguidos, y una auditoría legal interna sin observaciones. Indicadores: Reclamos respondidos fuera de plazo (RNF-CUM-006): 0; Tickets QUEJA/RECLAMO sin asiento (huérfanos): 0; Documentos probatorios sin checksum (RNF-CUM-007): 0.

Dependencias (PLT-01):

| ID | Dependencia | Tipo | Bloquea a | Responsable | Fecha requerida (PLT-01) | Estado (PLT-01) |
|---|---|---|---|---|---|---|
| DEP-04 | Calendario MAE_TIME + MAE_HOLIDAY por geografía | Técnica | EP-ATC-02, EP-ATC-03 | Equipo Datos | 22-oct-2026 | En curso |
| DEP-05 | Validación legal: formato del asiento, textos y plazos del Libro | Legal | EP-ATC-03, EP-ATC-11 | Gerencia Legal | 26-oct-2026 | Pendiente |
| DEP-06 | Repositorio documental S3 + GOV_DOCUMENT_REPOSITORY y GLI | Técnica | EP-ATC-01, EP-ATC-03, EP-ATC-04, EP-ATC-10 | Arquitectura / Legal | 23-oct-2026 | En curso |

Riesgos (PLT-01):

| ID | Riesgo | Prob. | Impacto | Mitigación | Dueño | Estado |
|---|---|---|---|---|---|---|
| R-03 | Matriz SLA y plazos de línea de la Mesa SGD sin definir al iniciar el motor SLA (jue 22-oct) | Alta | Alto | Matriz provisional parametrizable firmada por Gerencia ATC al cierre de diseño (20-oct) | Gerencia ATC | Abierto |

## 4 Aprobaciones

| Rol | Nombre | Fecha | Decisión |
|---|---|---|---|
| Dueño de Producto (PO) | Eddie Huamaní | 16-oct-2026 | Versión del documento |
| Patrocinador | (pendiente) |  |  |
| Líder técnico | (pendiente) |  |  |

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-02 v1.3), sin cambiar su contenido — Revisado por: (pendiente)
