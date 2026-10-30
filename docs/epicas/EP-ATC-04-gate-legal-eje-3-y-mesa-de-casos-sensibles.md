---
id: "EP-ATC-04"
tipo: epica
titulo: "Gate legal Eje 3 y Mesa de Casos sensibles"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-07", "FT-ATC-08", "FT-ATC-09"]
tags: [epica, plt-02]
---

# PLT-02 - EP-ATC-04 Gate legal Eje 3 y Mesa de Casos sensibles

| ID | Nombre | Producto |
|---|---|---|
| EP-ATC-04 | Gate legal Eje 3 y Mesa de Casos sensibles | Plataforma ATC (DOM-SVC-001) |
| **Product Owner** | **Sponsor** | **Prioridad (MoSCoW)** |
| Eddie Huamaní | Gerencia Legal / Dirección UX (por confirmar) | Debe |
| **Horizonte** | **Estado** | **Fecha / Versión** |
| mar 27-oct → lun 02-nov 2026 · Dev 2 · 32 h | Refinamiento | 16-oct-2026 · v1.3 |
| **Tipo** | **Desarrollador** | **Horas · iteración** |
| Épica de valor de negocio | Dev 2 (Jesús) | 32 h · iteración 1 y 2 |

## 1 Contexto

- **Problema**: Casos con carta notarial, INDECOPI, abogado o prensa se atienden en Eje 1 o Eje 2 sin Legal. Los casos sensibles llegan por 5 líneas distintas, sin código único, sin matriz de riesgo y sin escalamiento formal.
- **Usuarios**: Mesa de Casos (SGD), Especialista Legal Senior, gestores de tickets telefónicos y gestores de postventa, Comité de Asistentes y Directorio.
- **Evidencia**: Reglas RN-SVC-014…024 (gates no compensables); RNF-CUM-015 (IGDC); dolor 7 del AS-IS (conflictos resueltos sin Legal).
- **Alineamiento**: Reducir la exposición legal y reputacional y medir la gestión de casos con el IGDC.
- **Procesos**: PROC-SVC-009, PROC-SVC-010, PROC-SVC-011

## 2 Objetivos

Objetivo de negocio:
- El 100 % de los tickets con señal de conflicto llega a Eje 3 con el paquete mínimo completo, y ningún caso sensible vence su SLA de línea sin escalar, desde el pase a producción.

Objetivo del usuario:
- Legal recibe casos completos y confirmados; el cliente en conflicto es atendido por la instancia correcta sin repetir su historia.

| KPI | Línea base | Meta | Fuente | Frecuencia |
|---|---|---|---|---|
| % de derivaciones a Eje 3 con paquete mínimo 6/6 | no indicada en el PLT-02 | 100 % | — | — |
| Casos sensibles vencidos sin escalamiento | no indicada en el PLT-02 | 0 | — | — |
| IGDC = CASOS·0,60 + CUSTODIA·0,40 (RNF-CUM-015) | no indicada en el PLT-02 | ≥ 85 | — | — |

## 3 Alcance

| Dentro (IN) | Fuera (OUT) |
|---|---|
| Gate que bloquea resolver en Eje 1/2 un ticket con señal de conflicto | Gestión del expediente judicial o arbitral |
| Paquete mínimo de handoff con confirmación de recepción | Vocería y comunicación con prensa (solo aviso al Director UX) |
| Nota de estado emocional sin juicios de valor | Custodia de originales: vive en el Repositorio Legal GLI, no en la plataforma |
| Registro multilínea con Código Único de Caso |  |
| Cargo previo vs. cargo de activación (inicio del SLA de línea) |  |
| Matriz objetiva de riesgo y recalibración |  |
| Escalamiento en cadena, validación de casos vinculados y cierre tipificado en 8 estados |  |

Features:

| ID | Feature | Prioridad (MoSCoW) | Horas | Fechas (PLT-01) | Predecesora | Release objetivo |
|---|---|---|---|---|---|---|
| FT-ATC-07 | Gate de derivación a Eje 3 y handoff | Debe | 9 | mar 27-oct → mié 28-oct | — | v1.0 · Etapa 1 · 03-nov-2026 |
| FT-ATC-08 | Mesa SGD: recepción, activación y riesgo | Debe | 11 | mié 28-oct → jue 29-oct | FT-ATC-07 | v1.0 · Etapa 1 · 03-nov-2026 |
| FT-ATC-09 | Escalamiento, vinculación y cierre tipificado | Debe | 12 | jue 29-oct → lun 02-nov | FT-ATC-08 | v1.0 · Etapa 1 · 03-nov-2026 |

- **Ruta crítica**: FT-ATC-07 → FT-ATC-08 → FT-ATC-09 (32 h)
- **Supuestos**: La Mesa SGD entrega los plazos del SLA de cada línea y las ponderaciones de la matriz de riesgo (provisionales y parametrizables) antes del mié 28-oct.
- **Restricciones**: Gates no compensables (RN-SVC-021, 022, 024). Custodia legal separada de la plataforma operativa (RN-SVC-020).
- **Dependencias y riesgos**: DEP-01 SIGDA/TAXON · DEP-06 GLI · DEP-08 Cobranza · R-06 modelo de datos incompleto · R-08 ponderaciones provisionales
- **Criterios de éxito**: 100 % de handoffs completos y 0 casos vencidos sin escalar durante 2 meses; IGDC ≥ 85 en el primer trimestre de operación. Indicadores: % de derivaciones a Eje 3 con paquete mínimo 6/6: 100 %; Casos sensibles vencidos sin escalamiento: 0; IGDC = CASOS·0,60 + CUSTODIA·0,40 (RNF-CUM-015): ≥ 85.

Dependencias (PLT-01):

| ID | Dependencia | Tipo | Bloquea a | Responsable | Fecha requerida (PLT-01) | Estado (PLT-01) |
|---|---|---|---|---|---|---|
| DEP-01 | API de SIGDA/TAXON: consulta de cliente y KYC (única fuente del dato) | Interna | EP-ATC-01, EP-ATC-04, EP-ATC-06, EP-ATC-10 | CDO / Equipo Datos | 21-oct-2026 | Pendiente |
| DEP-06 | Repositorio documental S3 + GOV_DOCUMENT_REPOSITORY y GLI | Técnica | EP-ATC-01, EP-ATC-03, EP-ATC-04, EP-ATC-10 | Arquitectura / Legal | 23-oct-2026 | En curso |
| DEP-08 | Cobranza: estado de cuenta, historial de pagos y cuotas vencidas por contrato (desfase ≤ 24 h) | Interna | EP-ATC-04, EP-ATC-10, EP-ATC-11 | Cobranza | 21-oct-2026 | Pendiente |

Riesgos (PLT-01):

| ID | Riesgo | Prob. | Impacto | Mitigación | Dueño | Estado |
|---|---|---|---|---|---|---|
| R-06 | Ítems con alcance ambiguo (8 % de interés, rayo, «llamar la cuenta», cancelación del servicio, buses, acceso del cliente a Mi Portal) | Alta | Medio | Cerrarlos en el cierre funcional del 19-oct; lo no resuelto se construye parametrizable | PO | Abierto |
| R-08 | Textos legales (Libro, alerta de cancelación, carta al proyecto) sin validar al pase | Media | Alto | Plantillas configurables; validación de Legal antes del lun 26-oct (Libro) y del mié 28-oct (morosidad) | Gerencia Legal |  |

## 4 Aprobaciones

| Rol | Nombre | Fecha | Decisión |
|---|---|---|---|
| Dueño de Producto (PO) | Eddie Huamaní | 16-oct-2026 | Versión del documento |
| Patrocinador | (pendiente) |  |  |
| Líder técnico | (pendiente) |  |  |

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-02 v1.3), sin cambiar su contenido — Revisado por: (pendiente)
