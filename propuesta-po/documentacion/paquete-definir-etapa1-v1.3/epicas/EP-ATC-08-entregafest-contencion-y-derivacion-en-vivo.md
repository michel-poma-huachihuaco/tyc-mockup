---
id: "EP-ATC-08"
tipo: epica
titulo: "EntregaFest: contención y derivación en vivo"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-15"]
tags: [epica, plt-02]
---

# PLT-02 - EP-ATC-08 EntregaFest: contención y derivación en vivo

| ID | Nombre | Producto |
|---|---|---|
| EP-ATC-08 | EntregaFest: contención y derivación en vivo | Plataforma ATC (DOM-SVC-001) |
| **Product Owner** | **Sponsor** | **Prioridad (MoSCoW)** |
| Eddie Huamaní | Dirección UX (por confirmar) | Podría |
| **Horizonte** | **Estado** | **Fecha / Versión** |
| vie 30-oct → lun 02-nov 2026 · Dev 1 · 6 h | Refinamiento | 16-oct-2026 · v1.3 |
| **Tipo** | **Desarrollador** | **Horas · iteración** |
| Épica de valor de negocio | Dev 1 (Brayan) | 6 h · iteración 2 |

## 1 Contexto

- **Problema**: En los eventos de entrega (EntregaFest) hay imputaciones públicas —estafa, fraude, abuso, delito— que se debaten en sala y no quedan registradas ni derivadas a Legal.
- **Usuarios**: Moderadores de evento, Coordinador CX, Especialista Legal Senior de la Estación 4 y propietarios asistentes.
- **Evidencia**: RN-SVC-028…030 y RNF-REN-006 (post-mortem en ≤ 3 días hábiles).
- **Alineamiento**: Componente EVT del NPS-C (20 %) y reducción del riesgo reputacional.
- **Procesos**: PROC-SVC-014

## 2 Objetivos

Objetivo de negocio:
- Registrar y derivar a la Estación 4 el 100 % de los casos sensibles de cada EntregaFest, con post-mortem en ≤ 3 días hábiles.

Objetivo del usuario:
- El moderador tiene un guion y un registro rápido para cerrar el tema en sala sin debatirlo.

| KPI | Línea base | Meta | Fuente | Frecuencia |
|---|---|---|---|---|
| % de casos sensibles derivados a la Estación 4 | no indicada en el PLT-02 | 100 % | — | — |
| % de eventos con post-mortem a tiempo (RNF-REN-006) | no indicada en el PLT-02 | 100 % | — | — |

## 3 Alcance

| Dentro (IN) | Fuera (OUT) |
|---|---|
| Registro de la clasificación de riesgo verbal y de la secuencia de Frases Ancla 4-5-6 | Logística y agenda del evento |
| Detección de palabras de riesgo muy alto y derivación inmediata a la Estación 4 | Guion completo del moderador (lo mantiene Dirección UX) |
| Registro con la etiqueta estándar «Atención especial — derivación a Legal» | Grabación o transcripción automática de audio |

Features:

| ID | Feature | Prioridad (MoSCoW) | Horas | Fechas (PLT-01) | Predecesora | Release objetivo |
|---|---|---|---|---|---|---|
| FT-ATC-15 | EntregaFest: contención en vivo | Podría | 6 | vie 30-oct → lun 02-nov | — | v1.0 · Etapa 1 · 03-nov-2026 |

- **Ruta crítica**: FT-ATC-15 (6 h)
- **Supuestos**: Los eventos cuentan con tablet y conectividad; la Estación 4 opera con un especialista legal.
- **Restricciones**: Los casos sensibles no se debaten en sala (RN-SVC-028).
- **Dependencias y riesgos**: EP-ATC-04 (gate legal) · R-04 adopción
- **Criterios de éxito**: 100 % de derivaciones y post-mortems a tiempo en 3 eventos seguidos. Indicadores: % de casos sensibles derivados a la Estación 4: 100 %; % de eventos con post-mortem a tiempo (RNF-REN-006): 100 %.

Riesgos (PLT-01):

| ID | Riesgo | Prob. | Impacto | Mitigación | Dueño | Estado |
|---|---|---|---|---|---|---|
| R-04 | Calidad del código generado con IA (errores sutiles, seguridad, deuda técnica) | Media | Alto | Revisión de pares obligatoria, pruebas automatizadas generadas y revisadas por el desarrollador, análisis SAST y guía de prompts del equipo | Líder técnico | Abierto |

## 4 Aprobaciones

| Rol | Nombre | Fecha | Decisión |
|---|---|---|---|
| Dueño de Producto (PO) | Eddie Huamaní | 16-oct-2026 | Versión del documento |
| Patrocinador | (pendiente) |  |  |
| Líder técnico | (pendiente) |  |  |

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-02 v1.3), sin cambiar su contenido — Revisado por: (pendiente)
