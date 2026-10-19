---
id: "FT-ATC-22"
tipo: feature
titulo: "Resolución de contrato por morosidad"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["EP-ATC-11", "AYB-0001"]
tags: [feature, plt-03]
---

# PLT-03 - FT-ATC-22 Resolución de contrato por morosidad

Va en `docs/features/FT-ATC-22-resolucion-contrato-morosidad.md`.

| ID | Nombre | Epica padre |
|---|---|---|
| FT-ATC-22 | Resolución de contrato por morosidad | EP-ATC-11 |
| **Product Owner** | **Prioridad (MoSCoW)** | **Estado** |
| Eddie Huamaní | Debe | Borrador |
| **Release objetivo** | **Estimacion** | **Fecha / Version** |
| v1.0 - 30-oct-2026 (Dev 4 · lun 26-oct · Daniel) | 10 h (3 HU) | 2026-10-19 / v0.2 |

## 1 Descripción y valor

Crea el caso de resolución cuando un contrato acumula 3 meses impagos, envía en paralelo la alerta de cancelación al cliente y la carta de alerta al responsable del proyecto con copia al supervisor, con constancia de envío. Da resoluciones oportunas, con aviso previo y evidencia.

## 2 Requerimientos funcionales

| ID | Requerimiento | Prioridad (MoSCoW) | Origen | Criterio de verificación | Estado |
|---|---|---|---|---|---|
| RF-SVC-056 | El sistema debe generar automáticamente un ticket de resolución de contrato cuando un cliente acumula 3 meses (cuotas) sin pagar, o cuando se registra un reclamo con 3 meses de no pago, y derivarlo al flujo de resolución con Cobranza y Legal. | Debe | Job batch de ATC | Caso creado y derivado a Cobranza y Legal | Propuesto |
| RF-SVC-057 | El sistema debe enviar al cliente, en paralelo al proceso de resolución, una alerta de cancelación del servicio (deuda, plazo para regularizar y consecuencias) por correo, WhatsApp y Mi Portal, dejando constancia de envío. | Debe | Job batch de ATC | Alerta enviada al crearse el caso, con constancia | Propuesto |
| RF-SVC-058 | El sistema debe generar y enviar una carta de alerta al responsable del proyecto del lote, con copia a su supervisor, indicando cliente, deuda, estado del caso y fecha prevista de resolución. | Debe | Responsable de proyecto | Carta con copia al supervisor; escalamiento por plazo | Propuesto |

## 3 Requerimientos no funcionales

| ID | Categoria | Requerimiento | Metrica / umbral |
|---|---|---|---|
| RNF-INT-010 | Interoperabilidad | Morosidad actualizada desde Cobranza | horas_desfase_morosidad ≤ 24 h |
| RNF-AUD-005 | Auditoría | Constancia de alertas y cartas | alertas_con_constancia: 100% |

## 4 Reglas de negocio

| ID | Regla | Fuente |
|---|---|---|
| RN-SVC-037 | Causal de resolución por 3 meses impagos: cuotas vencidas e impagas, o reclamo que evidencia 3 meses de no pago; umbral parametrizable; causal validada por Legal | Negocio |
| RN-SVC-038 | Alerta de cancelación en paralelo, al crearse el caso, una sola vez | Negocio |
| RN-SVC-039 | Carta de alerta al responsable del proyecto con copia a su supervisor; sin acción, escala según la matriz de escalamiento | Negocio |

## 5 Trazabilidad

| RF | HU (PLT-04 v1.2) | Horas / Asignación | Dependencia | Riesgo |
|---|---|---|---|---|
| RF-SVC-056 | HU-ATC-056 — Abrir el caso de resolución por 3 meses impagos | 4 h · Dev 4 (Daniel) (2026-10-26 → 2026-10-26) | HU-ATC-006, DEP-08 (Cobranza: estado de cuenta, historial de pagos y cuotas vencidas por contrato (desfase ≤ 24 h)) | R-06 |
| RF-SVC-057 | HU-ATC-057 — Enviar al cliente la alerta de cancelación en paralelo | 3 h · Dev 4 (Daniel) (2026-10-26 → 2026-10-27) | HU-ATC-056, DEP-08 (Cobranza: estado de cuenta, historial de pagos y cuotas vencidas por contrato (desfase ≤ 24 h)) | R-06 |
| RF-SVC-058 | HU-ATC-058 — Enviar la carta de alerta al responsable del proyecto y su supervisor | 3 h · Dev 4 (Daniel) (2026-10-27 → 2026-10-27) | HU-ATC-056, DEP-15 (Maestro de responsables de proyecto y supervisores (fuente única)) | R-06 |

## 6 Fuera de alcance

- Redacción legal de la resolución.
- Cobro o refinanciamiento de la deuda.

## 7 Preguntas abiertas

| # | Pregunta | Dueño | Fecha limite | Bloquea G4 |
|---|---|---|---|---|
| P-01 | ¿Son 3 cuotas consecutivas o acumuladas? | Legal | por definir | Sí |
| P-02 | ¿Se suspende la resolución si hay un reclamo abierto? | Legal | por definir | Sí |
| P-03 | ¿Qué plazo se da para regularizar? | PO | por definir | Sí |

Generado por IA: actualizado con el detalle del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`) — Revisado por: pendiente
