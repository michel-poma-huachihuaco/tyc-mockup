---
id: "FT-ATC-07"
tipo: feature
titulo: "Gate de derivación a Eje 3 y handoff"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["EP-ATC-04", "AYB-0001"]
tags: [feature, plt-03]
---

# PLT-03 - FT-ATC-07 Gate de derivación a Eje 3 y handoff

Va en `docs/features/FT-ATC-07-gate-derivacion-eje3-handoff.md`.

| ID | Nombre | Epica padre |
|---|---|---|
| FT-ATC-07 | Gate de derivación a Eje 3 y handoff | EP-ATC-04 |
| **Product Owner** | **Prioridad (MoSCoW)** | **Estado** |
| Eddie Huamaní | Debe | Borrador |
| **Release objetivo** | **Estimacion** | **Fecha / Version** |
| v1.0 - 30-oct-2026 | 9 h (talla M) | 2026-10-15 / v0.1 |

## 1 Descripción y valor

Impide que un ticket con señal de conflicto se resuelva en Eje 1/2, exige el paquete mínimo de handoff con confirmación de recepción de Legal y registra el estado emocional del cliente sin juicios de valor. Los conflictos llegan a Legal completos y a tiempo, bajando la exposición legal y reputacional.

## 2 Requerimientos funcionales

| ID | Requerimiento | Prioridad (MoSCoW) | Origen | Criterio de verificación | Estado |
|---|---|---|---|---|---|
| RF-SVC-026 | El sistema debe impedir que un ticket con señal de conflicto permanezca o se resuelva en Eje 1 o Eje 2 y exigir su derivación a Eje 3. | Debe | Gestor de tickets | Cierre rechazado en Eje 1/2 | Propuesto |
| RF-SVC-027 | El sistema debe armar el paquete mínimo de handoff (6 elementos) en toda derivación entre ejes y permitir al eje destino confirmar la recepción. | Debe | Gestor de tickets | 6/6 elementos antes de enviar | Propuesto |
| RF-SVC-028 | El sistema debe registrar una nota del estado emocional del cliente ante frustración o conflicto, sin juicios de valor. | Debe | Gestor de tickets | Nota sin adjetivos de juicio | Propuesto |

## 3 Requerimientos no funcionales

| ID | Categoria | Requerimiento | Metrica / umbral |
|---|---|---|---|
| RNF-SEC-008 | Seguridad | DLP en bitácoras y narrativa por rol | acceso_narrativa_por_rol: columnas de narrativa solo para roles de atención/legal |
| RNF-AUD-004 | Auditoría | Cinco bitácoras append-only firmadas | hash_mismatch: 0 en el job de auditoría |

## 4 Reglas de negocio

| ID | Regla | Fuente |
|---|---|---|
| RN-SVC-021 | Gate: un caso de conflicto (carta notarial, INDECOPI, abogado, prensa) no se resuelve en Eje 1/2: se deriva de inmediato al Eje 3 | Negocio |
| RN-SVC-022 | Gate: una derivación entre ejes sin paquete mínimo completo o sin trazabilidad es un gate no compensable | Negocio |
| RN-SVC-024 | Gate: el estado emocional registrado con juicios de valor, o no registrado, es un gate no compensable | Negocio |

## 5 Trazabilidad

| RF | HU | Dependencia | Riesgo |
|---|---|---|---|
| RF-SVC-026 | HU-ATC-026 | DEP-01 SIGDA/TAXON, DEP-08 Cobranza | R-05 |
| RF-SVC-027 | HU-ATC-027 | DEP-01, DEP-08 | R-05 |
| RF-SVC-028 | HU-ATC-028 | DEP-01, DEP-08 | R-05 |

## 6 Fuera de alcance

- Respuesta pública o vocería (solo aviso al Director UX y coordinación con SCIMCPI).
- Custodia de originales: vive en el Repositorio Legal GLI, no en la plataforma.

## 7 Preguntas abiertas

| # | Pregunta | Dueño | Fecha limite | Bloquea G4 |
|---|---|---|---|---|
| P-01 | ¿Qué rol puede retirar una señal de conflicto marcada por error? | PO | por definir | Sí |
| P-02 | ¿El historial de pagos se adjunta o solo se enlaza en el handoff? | PO | por definir | No |

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) y del PDF `03_Funcionalidades_Catalogo_Requerimientos_Plataforma_ATC_AYBARCORP.pdf` — Revisado por: pendiente
