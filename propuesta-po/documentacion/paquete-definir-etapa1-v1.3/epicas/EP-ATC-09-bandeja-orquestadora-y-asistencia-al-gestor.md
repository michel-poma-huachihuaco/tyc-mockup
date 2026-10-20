---
id: "EP-ATC-09"
tipo: epica
titulo: "Bandeja orquestadora y asistencia al gestor"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-18", "FT-ATC-25", "FT-ATC-19", "FT-ATC-21"]
tags: [epica, plt-02]
---

# PLT-02 - EP-ATC-09 Bandeja orquestadora y asistencia al gestor

| ID | Nombre | Producto |
|---|---|---|
| EP-ATC-09 | Bandeja orquestadora y asistencia al gestor | Plataforma ATC (DOM-SVC-001) |
| **Product Owner** | **Sponsor** | **Prioridad (MoSCoW)** |
| Eddie Huamaní | Gerencia de Experiencia del Cliente (por confirmar) | Debe |
| **Horizonte** | **Estado** | **Fecha / Versión** |
| mié 21-oct → jue 29-oct 2026 · Dev 3 · 44 h | Refinamiento | 16-oct-2026 · v1.3 |
| **Tipo** | **Desarrollador** | **Horas · iteración** |
| Épica habilitadora | Dev 3 (Michel) | 44 h · iteración 1 y 2 |

## 1 Contexto

- **Problema**: Cada gestor de tickets trabaja con su propia lista y decide el orden a criterio; no hay flujos por área, los urgentes no se distinguen y la carga se reparte de forma desigual. El gestor nuevo no tiene una guía de cómo resolver cada tipo de ticket.
- **Usuarios**: Gestores de tickets (antes «agentes» u «operadores ATC»), supervisores y líderes de área, y el administrador funcional que configura los flujos.
- **Evidencia**: Feedback de la presentación (oct-2026), ítems 6, 7, 8, 10, 11, 13, 15 y 18; NEC-SVC-009 «repartir la carga y priorizar lo urgente sin perder el SLA»; reglas RN-SVC-031…035.
- **Alineamiento**: Atender toda solicitud con compromiso de tiempo trazable (OBJ-SVC-001) con un equipo balanceado y medido a diario.
- **Procesos**: PROC-SVC-017, PROC-SVC-018, PROC-SVC-020

## 2 Objetivos

Objetivo de negocio:
- Reducir a 0 los tickets sin responsable por más de 1 día hábil y mantener la diferencia de carga entre gestores del mismo área por debajo del 20 % durante el piloto.

Objetivo del usuario:
- El gestor de tickets ve en una sola bandeja qué atender primero, cómo resolverlo y su avance del día; su líder se entera de cada asignación.

| KPI | Línea base | Meta | Fuente | Frecuencia |
|---|---|---|---|---|
| Tickets sin responsable > 1 día hábil | no indicada en el PLT-02 | 0 | — | — |
| Diferencia de carga entre gestores del mismo área | no indicada en el PLT-02 | ≤ 20 % | — | — |
| % de cierres que siguieron la guía de solución | no indicada en el PLT-02 | ≥ 80 % | — | — |

## 3 Alcance

| Dentro (IN) | Fuera (OUT) |
|---|---|
| Flujos de trabajo configurables por área y tipo, sin desarrollo | Gestión de turnos y vacaciones (se consume el estado de disponibilidad) |
| Bandeja única que ordena por rayo, SLA y prioridad, y asigna según el flujo | IA que responde sola al cliente (la IA solo sugiere, RN-SVC-032) |
| Marca de prioridad «rayo» controlada por el líder | Evaluación de desempeño o bonos |
| Reasignación automática al gestor con menos carga |  |
| Guía de solución por tipo de ticket y retroalimentación de IA al cerrar |  |
| Tablero de avance diario y correo de asignación con copia al líder |  |
| Visor del proceso 3D de la operación en vivo (FT-ATC-25) |  |

Features:

| ID | Feature | Prioridad (MoSCoW) | Horas | Fechas (PLT-01) | Predecesora | Release objetivo |
|---|---|---|---|---|---|---|
| FT-ATC-18 | Bandeja orquestadora y flujos por área | Debe | 19 | mié 21-oct → vie 23-oct | — | v1.0 · Etapa 1 · 03-nov-2026 |
| FT-ATC-25 | Visor del proceso 3D (operación en vivo) | Debe | 10 | vie 23-oct → mar 27-oct | FT-ATC-18 | v1.0 · Etapa 1 · 03-nov-2026 |
| FT-ATC-19 | Asistencia al gestor: guía e IA | Debería | 9 | mar 27-oct → mié 28-oct | — | v1.0 · Etapa 1 · 03-nov-2026 |
| FT-ATC-21 | Productividad y notificaciones del gestor | Debería | 6 | mié 28-oct → jue 29-oct | FT-ATC-18 | v1.0 · Etapa 1 · 03-nov-2026 |

- **Ruta crítica**: FT-ATC-18 → FT-ATC-25 (29 h)
- **Supuestos**: El modelo SVC_TICKET y la bitácora de asignación de EP-ATC-02 están disponibles; TI aprueba un proveedor de IA antes del 21-oct (DEP-14), día en que inicia la asistencia con IA.
- **Restricciones**: IA asesora: ninguna respuesta al cliente sin acción del gestor y sin datos personales hacia modelos externos (RN-SVC-032, RNF-SEC-009). Rayo ≤ 10 % de la bandeja del área (RN-SVC-031).
- **Dependencias y riesgos**: DEP-02 maestro local de líderes · DEP-14 proveedor de IA · R-01 capacidad · R-04 código generado con IA
- **Criterios de éxito**: 0 tickets huérfanos y carga balanceada durante el piloto; 100 % de asignaciones notificadas al gestor y a su líder. Indicadores: Tickets sin responsable > 1 día hábil: 0; Diferencia de carga entre gestores del mismo área: ≤ 20 %; % de cierres que siguieron la guía de solución: ≥ 80 %.

Dependencias (PLT-01):

| ID | Dependencia | Tipo | Bloquea a | Responsable | Fecha requerida (PLT-01) | Estado (PLT-01) |
|---|---|---|---|---|---|---|
| DEP-02 | Maestro local de usuarios, roles, áreas y líderes de ATC (carga inicial de RR. HH.) | Interna | EP-ATC-01, EP-ATC-02, EP-ATC-09 | Gerencia ATC · RR. HH. | 21-oct-2026 | Pendiente |
| DEP-14 | Proveedor de IA aprobado por TI y Seguridad, con política de datos personales | Técnica | EP-ATC-09, EP-ATC-10 | TI · Seguridad | 23-oct-2026 | Por evaluar |

Riesgos (PLT-01):

| ID | Riesgo | Prob. | Impacto | Mitigación | Dueño | Estado |
|---|---|---|---|---|---|---|
| R-01 | Plan con poca holgura: 243 h comprometidas de 252 h de capacidad (96%); Dev 4 al 98% | Alta | Alto | Alcance «flexible» (RF-048, 053, 037-039) definido de antemano; control de alcance el jue 29-oct; las prioridades 1-3 (HU-043, 050, 067) se construyen primero | PO | Abierto |
| R-04 | Calidad del código generado con IA (errores sutiles, seguridad, deuda técnica) | Media | Alto | Revisión de pares obligatoria, pruebas automatizadas generadas y revisadas por el desarrollador, análisis SAST y guía de prompts del equipo | Líder técnico | Abierto |

## 4 Aprobaciones

| Rol | Nombre | Fecha | Decisión |
|---|---|---|---|
| Dueño de Producto (PO) | Eddie Huamaní | 16-oct-2026 | Versión del documento |
| Patrocinador | (pendiente) |  |  |
| Líder técnico | (pendiente) |  |  |

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-02 v1.3), sin cambiar su contenido Texto adaptado al alcance de la Etapa 1 (se omiten las frases del documento que remiten a fases posteriores). — Revisado por: (pendiente)
