---
id: "EP-ATC-07"
tipo: epica
titulo: "Calidad de atención y Torre de Control CX"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-13", "FT-ATC-14"]
tags: [epica, plt-02]
---

# PLT-02 - EP-ATC-07 Calidad de atención y Torre de Control CX

| ID | Nombre | Producto |
|---|---|---|
| EP-ATC-07 | Calidad de atención y Torre de Control CX | Plataforma ATC (DOM-SVC-001) |
| **Product Owner** | **Sponsor** | **Prioridad (MoSCoW)** |
| Eddie Huamaní | Dirección UX (por confirmar) | Debería |
| **Horizonte** | **Estado** | **Fecha / Versión** |
| jue 29-oct → lun 02-nov 2026 · Dev 3 · 16 h | Refinamiento | 16-oct-2026 · v1.3 |
| **Tipo** | **Desarrollador** | **Horas · iteración** |
| Épica de valor de negocio | Dev 3 (Michel) | 16 h · iteración 2 |

## 1 Contexto

- **Problema**: No se mide la satisfacción al cerrar un caso y la jefatura no tiene visibilidad en tiempo real de SLA, NPS ni casos en riesgo: se entera cuando el problema ya escaló.
- **Usuarios**: Coordinador CX (Torre de Control), supervisores ATC, jefaturas, Comité de Asistentes y CDO.
- **Evidencia**: NEC-SVC-006 «medir CSAT/CES por tipo, área y gestor de tickets»; RNF-INT-004, RNF-USA-001 (NPS-C), RNF-INT-007; dolor 8 del AS-IS.
- **Alineamiento**: NPS-C como North Star corporativo de experiencia (RNF-USA-001).
- **Procesos**: PROC-SVC-008, PROC-SVC-012

## 2 Objetivos

Objetivo de negocio:
- Disparar la encuesta en el 100 % de los tickets cerrados y emitir el informe diario de la Torre de Control desde el pase a producción.

Objetivo del usuario:
- El coordinador detecta un caso en riesgo antes de que venza y redistribuye la carga.

| KPI | Línea base | Meta | Fuente | Frecuencia |
|---|---|---|---|---|
| % de tickets CLOSED con encuesta disparada (RNF-INT-004) | no indicada en el PLT-02 | 100 % | — | — |
| NPS-C (RNF-USA-001) | no indicada en el PLT-02 | Meta tras calibrar el 1.er trimestre | — | — |
| Casos corregidos antes del incumplimiento | no indicada en el PLT-02 | ≥ 70 % de los marcados en riesgo | — | — |

## 3 Alcance

| Dentro (IN) | Fuera (OUT) |
|---|---|
| Encuesta POST_TRANSACTION al cierre, con CSAT/CES por tipo, área y gestor de tickets | Diseño de las preguntas de la encuesta (se reutiliza el fragmento 19 del KPI Engine) |
| Tablero en tiempo real: tickets activos, SLA, NPS, derivaciones y casos en riesgo | BI corporativo fuera del dominio ATC |
| Informe diario operativo e informe quincenal analítico |  |
| Auditoría quincenal de registros paralelos del dato de cliente |  |

Features:

| ID | Feature | Prioridad (MoSCoW) | Horas | Fechas (PLT-01) | Predecesora | Release objetivo |
|---|---|---|---|---|---|---|
| FT-ATC-13 | Encuesta post-atención | Debe | 3 | jue 29-oct → jue 29-oct | — | v1.0 · Etapa 1 · 03-nov-2026 |
| FT-ATC-14 | Torre de Control CX | Debería | 13 | jue 29-oct → lun 02-nov | FT-ATC-13 | v1.0 · Etapa 1 · 03-nov-2026 |

- **Ruta crítica**: FT-ATC-13 → FT-ATC-14 (16 h)
- **Supuestos**: El KPI Engine y SVY_SURVEY_RESPONSE están disponibles; las ponderaciones del NPS-C se calibran en el primer trimestre.
- **Restricciones**: Puntero polimórfico, sin FK desde ATC hacia encuestas (RNF-INT-004).
- **Dependencias y riesgos**: DEP-10 KPI Engine · R-08 ponderaciones provisionales · R-04 adopción
- **Criterios de éxito**: 100 % de encuestas disparadas, informe diario emitido 20 días hábiles seguidos y NPS-C calibrado. Indicadores: % de tickets CLOSED con encuesta disparada (RNF-INT-004): 100 %; NPS-C (RNF-USA-001): Meta tras calibrar el 1.er trimestre; Casos corregidos antes del incumplimiento: ≥ 70 % de los marcados en riesgo.

Dependencias (PLT-01):

| ID | Dependencia | Tipo | Bloquea a | Responsable | Fecha requerida (PLT-01) | Estado (PLT-01) |
|---|---|---|---|---|---|---|
| DEP-10 | KPI Engine + SVY_SURVEY_RESPONSE (encuestas) | Interna | EP-ATC-07 | Equipo Datos / BI | 29-oct-2026 | Pendiente |

Riesgos (PLT-01):

| ID | Riesgo | Prob. | Impacto | Mitigación | Dueño | Estado |
|---|---|---|---|---|---|---|
| R-08 | Textos legales (Libro, alerta de cancelación, carta al proyecto) sin validar al pase | Media | Alto | Plantillas configurables; validación de Legal antes del lun 26-oct (Libro) y del mié 28-oct (morosidad) | Gerencia Legal |  |
| R-04 | Calidad del código generado con IA (errores sutiles, seguridad, deuda técnica) | Media | Alto | Revisión de pares obligatoria, pruebas automatizadas generadas y revisadas por el desarrollador, análisis SAST y guía de prompts del equipo | Líder técnico | Abierto |

## 4 Aprobaciones

| Rol | Nombre | Fecha | Decisión |
|---|---|---|---|
| Dueño de Producto (PO) | Eddie Huamaní | 16-oct-2026 | Versión del documento |
| Patrocinador | (pendiente) |  |  |
| Líder técnico | (pendiente) |  |  |

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-02 v1.3), sin cambiar su contenido — Revisado por: (pendiente)
