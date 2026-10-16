---
id: "FT-ATC-14"
tipo: feature
titulo: "Torre de Control CX"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["EP-ATC-07", "AYB-0001"]
tags: [feature, plt-03]
---

# PLT-03 - FT-ATC-14 Torre de Control CX

Va en `docs/features/FT-ATC-14-torre-control-cx.md`.

| ID | Nombre | Epica padre |
|---|---|---|
| FT-ATC-14 | Torre de Control CX | EP-ATC-07 |
| **Product Owner** | **Prioridad (MoSCoW)** | **Estado** |
| Eddie Huamaní | Debería | Borrador |
| **Release objetivo** | **Estimacion** | **Fecha / Version** |
| v1.0 - 30-oct-2026 | 13 h (talla L) | 2026-10-15 / v0.1 |

## 1 Descripción y valor

Muestra en tiempo real tickets activos, NPS, tiempos, SLA y derivaciones en curso; genera el informe diario operativo y el quincenal analítico; audita quincenalmente registros paralelos del dato de cliente. Da corrección preventiva antes del incumplimiento y decisiones con datos consolidados.

## 2 Requerimientos funcionales

| ID | Requerimiento | Prioridad (MoSCoW) | Origen | Criterio de verificación | Estado |
|---|---|---|---|---|---|
| RF-SVC-030 | El sistema debe mostrar en tiempo real tickets activos, NPS, tiempos, SLA y derivaciones en curso. | Debería | Coordinador CX | Casos en riesgo marcados antes de vencer | Propuesto |
| RF-SVC-031 | El sistema debe generar el informe diario operativo y el informe quincenal analítico. | Debería | Coordinador CX | Informe con las secciones definidas | Propuesto |
| RF-SVC-032 | El sistema debe auditar quincenalmente la existencia de registros paralelos del dato de cliente fuera de SIGDA/TAXON. | Debería | Coordinador CX | Resultado esperado = 0 | Propuesto |

## 3 Requerimientos no funcionales

| ID | Categoria | Requerimiento | Metrica / umbral |
|---|---|---|---|
| RNF-USA-001 | Usabilidad | NPS-C: North Star corporativo de experiencia | nps_c_score = (JOU x 0,45) + (POS x 0,35) + (EVT x 0,20); escala -100 a +100, ponderación provisional hasta calibración del primer trimestre |
| RNF-INT-007 | Interoperabilidad | Cero registros paralelos del dato de cliente | registros_paralelos_dato_cliente: 0 |
| RNF-CUM-015 | Cumplimiento | IGDC: Índice de Gestión Documentaria y de Casos | igdc_score = (CASOS x 0,60) + (CUSTODIA x 0,40) |

## 4 Reglas de negocio

| ID | Regla | Fuente |
|---|---|---|
| RN-SVC-026 | Cero registros paralelos del dato de cliente fuera de SIGDA/TAXON | Negocio |

## 5 Trazabilidad

| RF | HU | Dependencia | Riesgo |
|---|---|---|---|
| RF-SVC-030 | HU-ATC-030 | DEP-10 KPI Engine | R-08 |
| RF-SVC-031 | HU-ATC-031 | DEP-10 | R-08 |
| RF-SVC-032 | HU-ATC-032 | DEP-10 | R-08 |

## 6 Fuera de alcance

- BI corporativo de otros dominios.
- Modelos predictivos.

## 7 Preguntas abiertas

| # | Pregunta | Dueño | Fecha limite | Bloquea G4 |
|---|---|---|---|---|
| P-01 | ¿Quiénes reciben el informe diario? | PO | por definir | No |
| P-02 | ¿Qué frecuencia de actualización se considera "tiempo real" (≤ 1 min)? | PO | por definir | Sí |

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) y del PDF `03_Funcionalidades_Catalogo_Requerimientos_Plataforma_ATC_AYBARCORP.pdf` — Revisado por: pendiente
