---
id: "FT-ATC-14"
tipo: feature
titulo: "Torre de Control CX"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["EP-ATC-07", "HU-ATC-030", "HU-ATC-031", "HU-ATC-032"]
tags: [feature, plt-03, ui]
---

# PLT-03 - FT-ATC-14 Torre de Control CX

| ID | Nombre | Épica padre |
|---|---|---|
| FT-ATC-14 | Torre de Control CX | EP-ATC-07 Calidad de atención y Torre de Control CX |
| **Product Owner** | **Prioridad (MoSCoW)** | **Estado** |
| Eddie Huamaní (PO) | Debería | Refinamiento |
| **Release objetivo** | **Estimación** | **Fecha / Versión** |
| v1.0 · Etapa 1 · 03-nov-2026 | L · 13 h · 13 h de desarrollo · Dev 3 | 16-oct-2026 · v1.3 |
| **Desarrollador** | **Ventana (PLT-01)** | **Predecesora** |
| Dev 3 (Michel) | 29-oct-2026 → 2-nov-2026 | FT-ATC-13 |

## 1 Descripción y valor

Tablero en tiempo real de tickets activos, SLA, NPS, derivaciones y casos en riesgo; informes diario y quincenal; auditoría quincenal de registros paralelos del dato de cliente.

**Beneficio:** Corrección preventiva antes del incumplimiento y decisiones con datos consolidados.

**Usuarios:** Coordinador CX · Jefaturas · Comité de Asistentes · CDO

## 2 Requerimientos funcionales

| ID | Requerimiento | Prioridad (MoSCoW) | Origen | Criterio de verificación | Horas | Predecesora | Estado |
|---|---|---|---|---|---|---|---|
| RF-SVC-030 | El sistema debe mostrar en tiempo real tickets activos, NPS, tiempos, SLA y derivaciones en curso. | Debería | PROC-SVC-012 · Coordinador CX | Casos en riesgo marcados antes de vencer | 6 | — | Pend. DoR |
| RF-SVC-031 | El sistema debe generar el informe diario operativo y el informe quincenal analítico. | Debería | PROC-SVC-012 · Coordinador CX | Informe con las secciones definidas | 4 | RF-SVC-030 | Pend. DoR |
| RF-SVC-032 | El sistema debe auditar quincenalmente la existencia de registros paralelos del dato de cliente fuera de SIGDA/TAXON. | Debería | PROC-SVC-012 · Coordinador CX | Resultado esperado = 0 | 3 | — | Pend. DoR |

Ruta crítica: RF-SVC-030 → RF-SVC-031 (10 h).

## 3 Requerimientos no funcionales

| ID | Categoría | Requerimiento | Métrica / umbral | Prioridad |
|---|---|---|---|---|
| RNF-USA-001 | Usabilidad | NPS-C: North Star corporativo de experiencia | nps_c_score: NPS-C = (JOU x 0,45) + (POS x 0,35) + (EVT x 0,20); escala -100 a +100; ponderación provisional hasta calibración del primer trimestre | Debería |
| RNF-INT-007 | Interoperabilidad | Cero registros paralelos del dato de cliente | registros_paralelos_dato_cliente: 0 | Debe |
| RNF-CUM-015 | Cumplimiento | IGDC: Índice de Gestión Documentaria y de Casos | igdc_score: IGDC = (CASOS x 0,60) + (CUSTODIA x 0,40); se multiplica por cero si hay incumplimiento de un plazo legal externo o acceso indebido a un caso sensible, cada uno de forma independiente | Debe |

## 4 Reglas de negocio

| ID | Regla | Fuente |
|---|---|---|
| RN-SVC-026 | Cero registros paralelos del dato de cliente. No pueden existir registros paralelos del dato de cliente fuera de SIGDA/TAXON; la auditoría quincenal debe arrojar cero casos y crear uno es gate no compensable | Negocio · Excel 05_Catalogos |

## 5 Trazabilidad

| RF | HU | Dependencia | Riesgo |
|---|---|---|---|
| RF-SVC-030 | HU-ATC-030 · Iteración 2 · Dev 3 · jue 29-oct → vie 30-oct | DEP-10 KPI Engine | R-08 |
| RF-SVC-031 | HU-ATC-031 · Iteración 2 · Dev 3 · vie 30-oct → lun 02-nov | DEP-10 KPI Engine | R-08 |
| RF-SVC-032 | HU-ATC-032 · Iteración 2 · Dev 3 · lun 02-nov | DEP-10 KPI Engine | R-08 |

Cada RF llega a una HU, y cada criterio de la HU a un TC de `docs/pruebas/test-plan.md` (pendiente: lo define QA).

## 6 Fuera de alcance

- BI corporativo de otros dominios; modelos predictivos.

## 7 Preguntas abiertas

| # | Pregunta | Dueño | Fecha límite | Bloquea G4 |
|---|---|---|---|---|
| P-01 | ¿Quiénes reciben el informe diario? ¿Qué frecuencia de actualización se considera «tiempo real» (≤ 1 min)? | (por asignar) | (por definir) | (lo decide el PO) |

Una pregunta que bloquea G4 deja la feature en NO READY. Cuando se responde, la respuesta va a `docs/analisis/decisiones.md` y aquí se enlaza.

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-03 v1.3), sin cambiar su contenido — Revisado por: (pendiente)
