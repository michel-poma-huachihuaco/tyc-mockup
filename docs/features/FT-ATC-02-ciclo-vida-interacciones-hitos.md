---
id: "FT-ATC-02"
tipo: feature
titulo: "Ciclo de vida, interacciones e hitos"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["EP-ATC-01", "AYB-0001"]
tags: [feature, plt-03]
---

# PLT-03 - FT-ATC-02 Ciclo de vida, interacciones e hitos

Va en `docs/features/FT-ATC-02-ciclo-vida-interacciones-hitos.md`.

| ID | Nombre | Epica padre |
|---|---|---|
| FT-ATC-02 | Ciclo de vida, interacciones e hitos | EP-ATC-01 |
| **Product Owner** | **Prioridad (MoSCoW)** | **Estado** |
| Eddie Huamaní | Debe | Borrador |
| **Release objetivo** | **Estimacion** | **Fecha / Version** |
| v1.0 - 30-oct-2026 | 13 h (talla L) | 2026-10-15 / v0.1 |

## 1 Descripción y valor

Gestiona los estados del ticket con historial inmutable, registra cada interacción marcando si es visible al cliente o nota interna (con adjuntos) y conserva los hitos temporales que prueban el cumplimiento. Da trazabilidad completa del caso y evidencia para medir el SLA incluso tras una reapertura.

## 2 Requerimientos funcionales

| ID | Requerimiento | Prioridad (MoSCoW) | Origen | Criterio de verificación | Estado |
|---|---|---|---|---|---|
| RF-SVC-004 | El sistema debe gestionar 7 estados y registrar cada transición con fecha y autor en un historial append-only. | Debe | Colaborador de área | Cada cambio agrega una fila; ninguna se sobrescribe | Propuesto |
| RF-SVC-005 | El sistema debe registrar cada interacción con canal, gestor de tickets, visibilidad al cliente y evidencia multimedia adjunta. | Debe | Colaborador de área | Nota interna nunca visible al cliente | Propuesto |
| RF-SVC-006 | El sistema debe registrar 1.ª respuesta, 1.ª resolución (inmutable), última resolución y cierre. | Debe | Supervisor ATC | FirstResolvedDateTime no cambia tras reabrir | Propuesto |

## 3 Requerimientos no funcionales

| ID | Categoria | Requerimiento | Metrica / umbral |
|---|---|---|---|
| RNF-AUD-004 | Auditoría | Cinco bitácoras append-only firmadas | hash_mismatch: 0 en el job de auditoría |
| RNF-SEC-008 | Seguridad | DLP en bitácoras y narrativa por rol | acceso_narrativa_por_rol: columnas de narrativa solo para roles de atención/legal |
| RNF-CUM-016 | Cumplimiento | Cierre formal 100% en Mi Portal | pct_tickets_cierre_formal_mi_portal: 100% (gate no compensable) |

## 4 Reglas de negocio

| ID | Regla | Fuente |
|---|---|---|
| RN-SVC-002 | Compromisos congelados: FirstResponseDueDateTime y ResolutionDueDateTime se calculan al abrir y no se recalculan si la política cambia | Negocio |
| RN-SVC-006 | Asignación append-only: cada movimiento de área/responsable es fila nueva con motivo tipificado | Negocio |
| RN-SVC-007 | Reapertura con nuevo compromiso: REOPENED incrementa ReopenCount y calcula el nuevo vencimiento; el compromiso original no se reescribe | Negocio |
| RN-SVC-012 | DLP en bitácoras: prohibido registrar PII en los campos Notes_* | Ley 29733 · Seguridad TI |
| RN-SVC-023 | Gate: un ticket cerrado fuera de Mi Portal, sin cierre formal, es un gate no compensable | Negocio |

## 5 Trazabilidad

| RF | HU | Dependencia | Riesgo |
|---|---|---|---|
| RF-SVC-004 | HU-ATC-004 | DEP-02 NEXUS | R-07 |
| RF-SVC-005 | HU-ATC-005 | DEP-02 NEXUS | R-07 |
| RF-SVC-006 | HU-ATC-006 | DEP-02 NEXUS | R-07 |

## 6 Fuera de alcance

- Edición o borrado de interacciones ya registradas.
- Chat en tiempo real con el cliente.

## 7 Preguntas abiertas

| # | Pregunta | Dueño | Fecha limite | Bloquea G4 |
|---|---|---|---|---|
| P-01 | ¿Qué tipos de archivo y tamaño máximo se aceptan como evidencia? | PO | por definir | Sí |
| P-02 | ¿Cuánto tiempo después de RESOLVED pasa a CLOSED si el cliente no responde? | PO | por definir | Sí |
| P-03 | Esta feature fija 7 estados homogéneos para todo ticket (`RF-SVC-004`). `FT-ATC-18`/`HU-ATC-043` permite configurar "pasos, estados, responsables y aprobaciones" por área y tipo, sin desarrollo. ¿Los pasos configurables son sub-estados dentro de `IN_PROGRESS` (el campo `Status` de `SVC_TICKET` no cambia), o un área puede sustituir estos 7 estados por los suyos? Hallazgo técnico de dos agentes independientes en la misma sesión (ver `docs/datos/estados.md` y `docs/analisis/decisiones.md` D-09) — ninguna fuente documental lo resuelve | PO + TL | por definir | Sí |

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) y del PDF `03_Funcionalidades_Catalogo_Requerimientos_Plataforma_ATC_AYBARCORP.pdf` — Revisado por: pendiente
