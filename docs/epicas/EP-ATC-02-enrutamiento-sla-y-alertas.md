---
id: "EP-ATC-02"
tipo: epica
titulo: "Enrutamiento, SLA y alertas"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-03", "FT-ATC-04"]
tags: [epica, plt-02]
---

# PLT-02 - EP-ATC-02 Enrutamiento, SLA y alertas

| ID | Nombre | Producto |
|---|---|---|
| EP-ATC-02 | Enrutamiento, SLA y alertas | Plataforma ATC (DOM-SVC-001) |
| **Product Owner** | **Sponsor** | **Prioridad (MoSCoW)** |
| Eddie Huamaní | Gerencia de Experiencia del Cliente (por confirmar) | Debe |
| **Horizonte** | **Estado** | **Fecha / Versión** |
| mié 21-oct → lun 26-oct 2026 · Dev 2 · 28 h | Refinamiento | 16-oct-2026 · v1.3 |
| **Tipo** | **Desarrollador** | **Horas · iteración** |
| Épica habilitadora | Dev 2 (Jesús) | 28 h · iteración 1 |

## 1 Contexto

- **Problema**: Los tickets se derivan por correo o de palabra y se pierden cuando un colaborador rota o cesa. No hay compromiso de tiempo por tipo y prioridad, y nadie se entera de un incumplimiento hasta que el cliente reclama.
- **Usuarios**: gestores de tickets, colaboradores de Cobranza, Legal, Postventa, TI y Administración, supervisores ATC y el job batch de la plataforma.
- **Evidencia**: NEC-SVC-002 «comprometer tiempos sin que un feriado nazca incumplido» y NEC-SVC-003 «derivar sin perder el rastro»; reglas RN-SVC-001…008; RNF-REN-003 y RNF-REN-005.
- **Alineamiento**: Compromiso de tiempo trazable y auditable (OBJ-SVC-001) y cierre end-to-end en 72 horas hábiles (RN-SVC-025).
- **Procesos**: PROC-SVC-003, PROC-SVC-004

## 2 Objetivos

Objetivo de negocio:
- Llegar al 90 % de cumplimiento de SLA de resolución por tipo y prioridad en los 3 meses siguientes al puesta en marcha, y cerrar sin escalamiento en ≤ 72 horas hábiles.

Objetivo del usuario:
- El colaborador ve su bandeja con lo que vence primero; el supervisor recibe una sola alerta por incumplimiento y puede reasignar sin perder historial.

| KPI | Línea base | Meta | Fuente | Frecuencia |
|---|---|---|---|---|
| % de tickets resueltos dentro del SLA | no indicada en el PLT-02 | ≥ 90 % | — | — |
| Tiempo de cierre E2E sin escalamiento | no indicada en el PLT-02 | ≤ 72 h hábiles | — | — |
| Tickets sin responsable > 1 día hábil | no indicada en el PLT-02 | 0 | — | — |

## 3 Alcance

| Dentro (IN) | Fuera (OUT) |
|---|---|
| Derivación entre 6 áreas con bitácora append-only y motivo tipificado | Asignación por habilidades avanzadas (la reasignación por menor carga está en FT-ATC-18) |
| Derivación a área sin persona asignada | Definición de los tiempos de la matriz SLA (decisión de negocio, DEP-03) |
| Reasignación masiva por cese, rotación o renuncia | Escalamiento de casos sensibles a Comité/Directorio (EP-ATC-04) |
| Casillero de tareas por área y responsable |  |
| Motor SLA: precedencia de política, congelamiento al abrir, horas/días hábiles con feriados por geografía |  |
| Alertas únicas por tipo y ciclo; reapertura con nuevo compromiso |  |
| Medición de cierre E2E (72 h hábiles) |  |

Features:

| ID | Feature | Prioridad (MoSCoW) | Horas | Fechas (PLT-01) | Predecesora | Release objetivo |
|---|---|---|---|---|---|---|
| FT-ATC-03 | Derivación, reasignación y casillero | Debe | 11 | mié 21-oct → jue 22-oct | — | v1.0 · Etapa 1 · 03-nov-2026 |
| FT-ATC-04 | Motor SLA y alertas | Debe | 17 | jue 22-oct → lun 26-oct | — | v1.0 · Etapa 1 · 03-nov-2026 |

- **Ruta crítica**: FT-ATC-04 (17 h)
- **Supuestos**: Negocio entrega la matriz de minutos por tipo y prioridad (o una provisional firmada) al cierre de la etapa de diseño (20-oct), antes del motor SLA (jue 22-oct); MAE_TIME y MAE_HOLIDAY son la fuente única de días hábiles.
- **Restricciones**: Compromisos congelados: nunca se recalculan si la política cambia (RN-SVC-002). Bitácoras append-only firmadas HMAC-SHA256 (RNF-AUD-004).
- **Dependencias y riesgos**: DEP-02 maestro local de roles · DEP-03 matriz SLA · DEP-04 calendario · R-01 matriz sin definir · R-05 terceros
- **Criterios de éxito**: ≥ 90 % de cumplimiento de SLA durante 2 meses seguidos, 0 alertas duplicadas y 0 tickets huérfanos tras un cese. Indicadores: % de tickets resueltos dentro del SLA: ≥ 90 %; Tiempo de cierre E2E sin escalamiento: ≤ 72 h hábiles; Tickets sin responsable > 1 día hábil: 0.

Dependencias (PLT-01):

| ID | Dependencia | Tipo | Bloquea a | Responsable | Fecha requerida (PLT-01) | Estado (PLT-01) |
|---|---|---|---|---|---|---|
| DEP-02 | Maestro local de usuarios, roles, áreas y líderes de ATC (carga inicial de RR. HH.) | Interna | EP-ATC-01, EP-ATC-02, EP-ATC-09 | Gerencia ATC · RR. HH. | 21-oct-2026 | Pendiente |
| DEP-03 | Decisión de negocio: matriz SLA por tipo y prioridad y plazos de línea de la Mesa SGD (RNF-REN-003) | Interna | EP-ATC-02, EP-ATC-04 | Gerencia ATC · Mesa SGD | 22-oct-2026 | Pendiente |
| DEP-04 | Calendario MAE_TIME + MAE_HOLIDAY por geografía | Técnica | EP-ATC-02, EP-ATC-03 | Equipo Datos | 22-oct-2026 | En curso |

Riesgos (PLT-01):

| ID | Riesgo | Prob. | Impacto | Mitigación | Dueño | Estado |
|---|---|---|---|---|---|---|
| R-01 | Plan con poca holgura: 243 h comprometidas de 252 h de capacidad (96%); Dev 4 al 98% | Alta | Alto | Alcance «flexible» (RF-048, 053, 037-039) definido de antemano; control de alcance el jue 29-oct; las prioridades 1-3 (HU-043, 050, 067) se construyen primero | PO | Abierto |
| R-05 | Sin QA dedicado y UAT concentrada en un día (mar 03-nov) | Media | Alto | Aceptación diaria del PO a las 17:00, pruebas E2E automatizadas desde el día 3 y usuarios clave citados para la UAT | PO · Jefe Operaciones UX | Abierto |

## 4 Aprobaciones

| Rol | Nombre | Fecha | Decisión |
|---|---|---|---|
| Dueño de Producto (PO) | Eddie Huamaní | 16-oct-2026 | Versión del documento |
| Patrocinador | (pendiente) |  |  |
| Líder técnico | (pendiente) |  |  |

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-02 v1.3), sin cambiar su contenido Texto adaptado al alcance de la Etapa 1 (se omiten las frases del documento que remiten a fases posteriores). — Revisado por: (pendiente)
