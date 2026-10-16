---
id: "FT-ATC-03"
tipo: feature
titulo: "Derivación, reasignación y casillero"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["EP-ATC-02", "AYB-0001"]
tags: [feature, plt-03]
---

# PLT-03 - FT-ATC-03 Derivación, reasignación y casillero

Va en `docs/features/FT-ATC-03-derivacion-reasignacion-casillero.md`.

| ID | Nombre | Epica padre |
|---|---|---|
| FT-ATC-03 | Derivación, reasignación y casillero | EP-ATC-02 |
| **Product Owner** | **Prioridad (MoSCoW)** | **Estado** |
| Eddie Huamaní | Debe | Borrador |
| **Release objetivo** | **Estimacion** | **Fecha / Version** |
| v1.0 - 30-oct-2026 | 11 h (talla M) | 2026-10-15 / v0.1 |

## 1 Descripción y valor

Permite derivar tickets entre las 6 áreas del flujo (con o sin persona asignada), reasignar en bloque cuando un colaborador cesa y ver la bandeja de pendientes por área y responsable. Ningún ticket se pierde al cambiar de manos y cada colaborador ve su carga real.

## 2 Requerimientos funcionales

| ID | Requerimiento | Prioridad (MoSCoW) | Origen | Criterio de verificación | Estado |
|---|---|---|---|---|---|
| RF-SVC-007 | El sistema debe derivar tickets entre las 6 áreas y colaboradores registrando cada movimiento con motivo en bitácora append-only. | Debe | Gestor de tickets | Cada movimiento es una fila nueva con motivo | Propuesto |
| RF-SVC-008 | El sistema debe reasignar los tickets pendientes de un colaborador que rota o cesa, sin borrar el rastro anterior. | Debe | Supervisor ATC | Fila nueva REASSIGNMENT_* por ticket | Propuesto |
| RF-SVC-009 | El sistema debe ofrecer el casillero por área y responsable como consulta sobre los tickets, sin tabla adicional. | Debe | Colaborador de área | Resultado = área actual + responsable + estado | Propuesto |

## 3 Requerimientos no funcionales

| ID | Categoria | Requerimiento | Metrica / umbral |
|---|---|---|---|
| RNF-AUD-004 | Auditoría | Cinco bitácoras append-only firmadas | hash_mismatch: 0 en el job de auditoría |
| RNF-SEC-008 | Seguridad | DLP en bitácoras y narrativa por rol | acceso_narrativa_por_rol: columnas de narrativa solo para roles de atención/legal |

## 4 Reglas de negocio

| ID | Regla | Fuente |
|---|---|---|
| RN-SVC-006 | Asignación append-only: cada movimiento de área/responsable es fila nueva con motivo tipificado | Negocio |
| RN-SVC-012 | DLP en bitácoras: prohibido registrar PII en los campos Notes_* | Ley 29733 · Seguridad TI |

## 5 Trazabilidad

| RF | HU | Dependencia | Riesgo |
|---|---|---|---|
| RF-SVC-007 | HU-ATC-007 | DEP-02 NEXUS | R-05 |
| RF-SVC-008 | HU-ATC-008 | DEP-02 NEXUS | R-05 |
| RF-SVC-009 | HU-ATC-009 | DEP-02 NEXUS | R-05 |

## 6 Fuera de alcance

- Asignación por habilidades avanzadas (la reasignación por menor carga está en FT-ATC-18).
- Integración con RR.HH. para detectar ceses automáticamente (en v1.0 es manual).

## 7 Preguntas abiertas

| # | Pregunta | Dueño | Fecha limite | Bloquea G4 |
|---|---|---|---|---|
| P-01 | ¿Quién puede reasignar en bloque: solo el supervisor o también el jefe de área? | PO | por definir | Sí |
| P-02 | ¿Hay un catálogo cerrado de motivos de derivación? | PO | por definir | No |

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) y del PDF `03_Funcionalidades_Catalogo_Requerimientos_Plataforma_ATC_AYBARCORP.pdf` — Revisado por: pendiente
